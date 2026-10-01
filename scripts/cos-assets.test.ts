import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  CACHE_CONTROL,
  COS_BUCKET,
  COS_HOST,
  COS_REGION,
  SITE_ORIGIN,
  assertAssetResponse,
  classifyFetchFailure,
  headWithBoundedRetry,
  isRetryableFetchFailure,
  assertSafeAssetPath,
  assetBaseForRelease,
  makeAssetRecord,
  mimeTypeFor,
  readCoscliDiagnostics,
  requestHeadersFor,
  rewriteRootAssetReferences,
  summarizeCoscliFailure,
  validateManifest,
} from "./cos-assets.ts";

const releaseId = "ab".repeat(20);

test("版本 URL 固定到站点专用前缀和不可变 commit SHA", () => {
  assert.equal(
    assetBaseForRelease(releaseId),
    `https://${COS_HOST}/tripick-app.github.io/releases/${releaseId}/`,
  );
  assert.throws(() => assetBaseForRelease("latest"), /40 位 Git commit SHA/);
});

test("GET-only CORS：跨域 GET 带 Origin，预上传 HEAD 不带 Origin", () => {
  assert.equal(new Headers(requestHeadersFor("GET", { cors: true })).get("origin"), SITE_ORIGIN);
  const headHeaders = new Headers(requestHeadersFor("HEAD", { headers: { Origin: "https://wrong.example" } }));
  assert.equal(headHeaders.has("origin"), false);
  assert.throws(() => requestHeadersFor("HEAD", { cors: true }), /只使用 GET/);
});


test("HEAD只对超时/连接重置与可重试5xx做有界指数退避", async () => {
  const waits: number[] = [];
  const statuses = [503, 502, 404];
  let requests = 0;
  const response = await headWithBoundedRetry(
    "https://example.invalid/assets/example.js",
    async (_url, options) => {
      assert.equal(options.method, "HEAD");
      requests += 1;
      const status = statuses.shift();
      if (status === undefined) throw new Error("unexpected request");
      return new Response(null, { status });
    },
    async (milliseconds) => { waits.push(milliseconds); },
  );
  assert.equal(response.status, 404);
  assert.equal(requests, 3);
  assert.deepEqual(waits, [250, 500]);

  let deniedRequests = 0;
  const deniedWaits: number[] = [];
  const denied = await headWithBoundedRetry(
    "https://example.invalid/assets/private.js",
    async () => { deniedRequests += 1; return new Response(null, { status: 403 }); },
    async (milliseconds) => { deniedWaits.push(milliseconds); },
  );
  assert.equal(denied.status, 403);
  assert.equal(deniedRequests, 1);
  assert.deepEqual(deniedWaits, []);
});

test("HEAD连接重置分类只暴露白名单错误码，不回显底层文本", async () => {
  const reset = Object.assign(new Error("sensitive synthetic detail"), { code: "ECONNRESET" });
  const failure = Object.assign(new Error("fetch failed"), { cause: reset });
  assert.equal(classifyFetchFailure(failure), "网络连接重置（ECONNRESET）");
  assert.equal(isRetryableFetchFailure(failure), true);
  assert.equal(isRetryableFetchFailure(new Error("sensitive synthetic detail")), false);
  assert.equal(classifyFetchFailure(new Error("sensitive synthetic detail")), "Fetch网络错误（无可用的白名单系统错误码）");

  let requests = 0;
  const waits: number[] = [];
  const response = await headWithBoundedRetry(
    "https://example.invalid/assets/retry.js",
    async () => {
      requests += 1;
      if (requests === 1) throw failure;
      return new Response(null, { status: 404 });
    },
    async (milliseconds) => { waits.push(milliseconds); },
  );
  assert.equal(response.status, 404);
  assert.equal(requests, 2);
  assert.deepEqual(waits, [250]);
});

test("只重写根 /assets/ 引用，不重复改写完整 COS URL 或嵌套路径", () => {
  const base = assetBaseForRelease(releaseId);
  const source = 'href="/assets/brand.png" srcset="/assets/a.webp 400w, /assets/b.webp 800w" url(/assets/fonts/site.woff2) https://other.invalid/assets/keep.png /nested/assets/keep.png';
  const rewritten = rewriteRootAssetReferences(source, base);

  assert.ok(rewritten.includes(`href="${base}assets/brand.png"`));
  assert.ok(rewritten.includes(`${base}assets/a.webp 400w, ${base}assets/b.webp 800w`));
  assert.ok(rewritten.includes(`url(${base}assets/fonts/site.woff2)`));
  assert.ok(rewritten.includes("https://other.invalid/assets/keep.png"));
  assert.ok(rewritten.includes("/nested/assets/keep.png"));
});

test("路径、MIME、版本 key 和内容 SHA-256 按目标前缀生成", () => {
  const bytes = Buffer.from("css-body");
  const asset = makeAssetRecord("assets/css/site.css", bytes, releaseId);
  assert.equal(asset.key, `tripick-app.github.io/releases/${releaseId}/assets/css/site.css`);
  assert.equal(asset.contentType, "text/css");
  assert.equal(asset.cacheControl, CACHE_CONTROL);
  assert.equal(asset.size, bytes.length);
  assert.match(asset.sha256, /^[a-f0-9]{64}$/);
  assert.equal(mimeTypeFor("assets/fonts/site.woff2"), "font/woff2");
  assert.throws(() => assertSafeAssetPath("assets/../../elsewhere"), /不安全/);
  assert.throws(() => assertSafeAssetPath("index.html"), /不安全/);
});

test("资源清单拒绝跨桶、跨前缀、重复和不完整项目", () => {
  const bytes = Buffer.from("image");
  const asset = makeAssetRecord("assets/images/cover.webp", bytes, releaseId);
  const manifest = {
    version: 1,
    releaseId,
    bucket: COS_BUCKET,
    region: COS_REGION,
    origin: `https://${COS_HOST}`,
    siteOrigin: SITE_ORIGIN,
    releasePrefix: `tripick-app.github.io/releases/${releaseId}/`,
    assetBase: assetBaseForRelease(releaseId),
    cacheControl: CACHE_CONTROL,
    assets: [asset],
  };

  assert.deepEqual(validateManifest(manifest), manifest);
  assert.throws(() => validateManifest({ ...manifest, bucket: "another-bucket" }), /不匹配/);
  assert.throws(() => validateManifest({ ...manifest, assets: [{ ...asset, key: "other/assets/a" }] }), /清单资产校验失败/);
  assert.throws(() => validateManifest({ ...manifest, assets: [asset, asset] }), /重复/);
});

test("发布校验要求真实跨域 GET、正确 MIME、immutable 缓存和字节级哈希一致", () => {
  const bytes = Buffer.from("console.log('ok')");
  const asset = makeAssetRecord("assets/js/site.js", bytes, releaseId);
  const ok = new Response(bytes, {
    status: 200,
    headers: {
      "access-control-allow-origin": SITE_ORIGIN,
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });

  assert.doesNotThrow(() => assertAssetResponse({ response: ok, asset, bytes }));
  assert.throws(() => assertAssetResponse({ response: new Response(bytes, { status: 200 }), asset, bytes }), /Access-Control-Allow-Origin/);
  assert.throws(() => assertAssetResponse({
    response: new Response(bytes, {
      status: 200,
      headers: {
        "access-control-allow-origin": "*",
        "content-type": "application/javascript",
        "cache-control": "public,max-age=31536000,immutable",
      },
    }),
    asset,
    bytes,
  }), /Access-Control-Allow-Origin/);
  assert.throws(() => assertAssetResponse({ response: ok, asset, bytes: Buffer.from("wrong") }), /哈希不一致/);
});

test("coscli 错误诊断只暴露可识别错误码与状态，不回显原始内容", () => {
  const message = summarizeCoscliFailure({
    status: 1,
    stdout: "upload failed: synthetic-secret-value",
    stderr: "runner diagnostic synthetic-secret-value",
  }, "cp", "<Error><Code>AccessDenied</Code><Message>synthetic-secret-value</Message><HTTPStatus>403</HTTPStatus></Error>");

  assert.match(message, /coscli cp 失败/);
  assert.match(message, /HTTP 403/);
  assert.match(message, /COS 错误码 AccessDenied/);
  assert.match(message, /原始输出已隐藏/);
  assert.doesNotMatch(message, /synthetic-secret-value|<Message>|upload failed/);
});

test("从coscli嵌套临时日志中提取脱敏错误状态", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "tripick-coscli-log-test-"));
  try {
    const nestedLogDirectory = path.join(root, "daily-run");
    await mkdir(nestedLogDirectory, { mode: 0o700 });
    await writeFile(
      path.join(nestedLogDirectory, "error.report"),
      "<Error><Code>AccessDenied</Code><Message>synthetic-secret-value</Message><HTTPStatus>403</HTTPStatus></Error>",
    );

    const diagnostics = await readCoscliDiagnostics(root);
    assert.match(diagnostics, /AccessDenied/);
    const message = summarizeCoscliFailure({ status: 1 }, "cp", diagnostics);
    assert.match(message, /HTTP 403/);
    assert.match(message, /COS 错误码 AccessDenied/);
    assert.doesNotMatch(message, /synthetic-secret-value|<Message>/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("已知COS错误类别使用固定标签，不回显错误正文", () => {
  const message = summarizeCoscliFailure({ status: 1, stderr: "AccessDenied for synthetic-secret-value" }, "cp");
  assert.match(message, /访问权限拒绝/);
  assert.doesNotMatch(message, /synthetic-secret-value/);

  const configMessage = summarizeCoscliFailure({ status: 1, stdout: "secretID is missing" }, "cp");
  assert.match(configMessage, /COSCLI未读取到凭据字段/);
  assert.doesNotMatch(configMessage, /secretID is missing/);
});
