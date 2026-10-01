#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const COS_BUCKET = "s-1307850796";
export const COS_REGION = "ap-beijing";
export const COS_HOST = "s-1307850796.cos.ap-beijing.myqcloud.com";
export const SITE_ORIGIN = "https://tripick-app.github.io";
export const ASSET_ROOT = "tripick-app.github.io/releases";
export const CACHE_CONTROL = "public,max-age=31536000,immutable";
export const CORS_PROBE_KEY = "tripick-privacy/latest/index.html";

const EXPECTED_COS_ORIGIN = `https://${COS_HOST}`;
const SUPPORTED_TEXT_FILE = /\.(?:html|css|js|mjs|json|txt|map)$/i;

const MIME_TYPES = new Map([
  [".css", "text/css"],
  [".html", "text/html"],
  [".js", "application/javascript"],
  [".json", "application/json"],
  [".map", "application/json"],
  [".mjs", "application/javascript"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

export function assetBaseForRelease(releaseId) {
  const safeReleaseId = assertReleaseId(releaseId);
  return `${EXPECTED_COS_ORIGIN}/${ASSET_ROOT}/${safeReleaseId}/`;
}

export function assertReleaseId(releaseId) {
  if (!/^[a-f0-9]{40}$/i.test(releaseId ?? "")) {
    throw new Error("发布标识必须是完整的 40 位 Git commit SHA。");
  }
  return releaseId.toLowerCase();
}

export function mimeTypeFor(relativePath) {
  return MIME_TYPES.get(path.posix.extname(relativePath).toLowerCase()) ?? "application/octet-stream";
}

export function rewriteRootAssetReferences(source, assetBase) {
  if (!assetBase.endsWith("/")) {
    throw new Error("COS 资源根 URL 必须以 / 结尾。");
  }
  // Vite's `base` handles generated entry points and chunks. This catches the
  // site's public/ assets referenced from React strings, HTML preloads and CSS.
  return source.replace(/(^|[^A-Za-z0-9_./:-])\/assets\//g, (_match, boundary) => `${boundary}${assetBase}assets/`);
}

export function makeAssetRecord(relativePath, contents, releaseId) {
  releaseId = assertReleaseId(releaseId);
  const safePath = assertSafeAssetPath(relativePath);
  const key = `${ASSET_ROOT}/${releaseId}/` + safePath;
  return {
    path: safePath,
    key,
    url: `${EXPECTED_COS_ORIGIN}/${key}`,
    size: contents.byteLength,
    sha256: createHash("sha256").update(contents).digest("hex"),
    contentType: mimeTypeFor(safePath),
    cacheControl: CACHE_CONTROL,
  };
}

export function assertSafeAssetPath(relativePath) {
  const normalized = String(relativePath ?? "").replaceAll("\\", "/");
  if (
    !normalized.startsWith("assets/") ||
    normalized.startsWith("/") ||
    normalized.split("/").some((part) => !part || part === ".." || part === ".") ||
    !/^[A-Za-z0-9._/-]+$/.test(normalized)
  ) {
    throw new Error(`不安全或不属于 assets/ 的路径：${relativePath}`);
  }
  return normalized;
}

export function validateManifest(manifest) {
  const releaseId = assertReleaseId(manifest?.releaseId);
  const expectedBase = assetBaseForRelease(releaseId);
  const expectedPrefix = `${ASSET_ROOT}/${releaseId}/`;
  if (
    manifest.version !== 1 ||
    manifest.bucket !== COS_BUCKET ||
    manifest.region !== COS_REGION ||
    manifest.origin !== EXPECTED_COS_ORIGIN ||
    manifest.assetBase !== expectedBase ||
    manifest.siteOrigin !== SITE_ORIGIN ||
    !Array.isArray(manifest.assets) ||
    manifest.assets.length === 0
  ) {
    throw new Error("资源清单与固定 COS 目标不匹配或清单为空。");
  }

  const seen = new Set();
  for (const asset of manifest.assets) {
    const safePath = assertSafeAssetPath(asset.path);
    const expectedKey = `${expectedPrefix}${safePath}`;
    if (seen.has(safePath)) throw new Error(`清单中存在重复资源：${safePath}`);
    if (
      asset.key !== expectedKey ||
      asset.url !== `${EXPECTED_COS_ORIGIN}/${expectedKey}` ||
      !Number.isSafeInteger(asset.size) ||
      asset.size < 0 ||
      !/^[a-f0-9]{64}$/.test(asset.sha256 ?? "") ||
      asset.contentType !== mimeTypeFor(safePath) ||
      asset.cacheControl !== CACHE_CONTROL
    ) {
      throw new Error(`清单资产校验失败：${asset.path}`);
    }
    seen.add(safePath);
  }
  return manifest;
}

export function assertCorsHeaders(response, context = "COS GET") {
  const allowOrigin = response.headers.get("access-control-allow-origin");
  if (allowOrigin !== SITE_ORIGIN) {
    throw new Error(`${context} 未返回 Access-Control-Allow-Origin: ${SITE_ORIGIN}。`);
  }
}

export function assertAssetResponse({ response, asset, bytes }) {
  if (response.status !== 200) {
    throw new Error(`${asset.path} 返回 HTTP ${response.status}，预期 200。`);
  }
  assertCorsHeaders(response, `资源 ${asset.path}`);

  const contentType = (response.headers.get("content-type") ?? "").split(";", 1)[0].trim().toLowerCase();
  if (contentType !== asset.contentType.toLowerCase()) {
    throw new Error(`${asset.path} MIME 为 ${contentType || "缺失"}，预期 ${asset.contentType}。`);
  }

  const cacheDirectives = new Set(
    (response.headers.get("cache-control") ?? "")
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean),
  );
  if (!["public", "max-age=31536000", "immutable"].every((part) => cacheDirectives.has(part))) {
    throw new Error(`${asset.path} 缓存头不符合一年 immutable 策略。`);
  }

  const digest = createHash("sha256").update(bytes).digest("hex");
  if (bytes.byteLength !== asset.size || digest !== asset.sha256) {
    throw new Error(`${asset.path} 上传内容与本地清单哈希不一致。`);
  }
}

export function manifestPathFor(root, releaseId) {
  assertReleaseId(releaseId);
  return path.join(root, ".cos-release", `${releaseId}.json`);
}

export async function listAssetFiles(distDir) {
  const assetDir = path.join(distDir, "assets");
  const files = [];

  async function visit(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`不上传符号链接：${fullPath}`);
      }
      if (entry.isDirectory()) {
        await visit(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  await visit(assetDir);
  return files;
}

async function rewriteDistTextAssets(distDir, assetBase) {
  async function visit(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`构建产物不应包含符号链接：${fullPath}`);
      if (entry.isDirectory()) {
        await visit(fullPath);
      } else if (entry.isFile() && SUPPORTED_TEXT_FILE.test(entry.name)) {
        const source = await readFile(fullPath, "utf8");
        const rewritten = rewriteRootAssetReferences(source, assetBase);
        if (rewritten !== source) await writeFile(fullPath, rewritten);
        if (/(^|[^A-Za-z0-9_./:-])\/assets\//.test(rewritten)) {
          throw new Error(`仍有指向 Pages 根路径的 /assets/ 引用：${fullPath}`);
        }
      }
    }
  }
  await visit(distDir);
}

async function buildManifest(root, distDir, releaseId) {
  const assetBase = assetBaseForRelease(releaseId);
  const paths = await listAssetFiles(distDir);
  if (paths.length === 0) throw new Error("dist/assets 为空，拒绝生成空资源清单。");

  const assets = [];
  for (const fullPath of paths) {
    const relativePath = path.relative(distDir, fullPath).split(path.sep).join("/");
    const contents = await readFile(fullPath);
    assets.push(makeAssetRecord(relativePath, contents, releaseId));
  }

  const manifest = validateManifest({
    version: 1,
    releaseId,
    bucket: COS_BUCKET,
    region: COS_REGION,
    origin: EXPECTED_COS_ORIGIN,
    siteOrigin: SITE_ORIGIN,
    releasePrefix: `${ASSET_ROOT}/${releaseId}/`,
    assetBase,
    cacheControl: CACHE_CONTROL,
    assets,
  });
  const pathToManifest = manifestPathFor(root, releaseId);
  await mkdir(path.dirname(pathToManifest), { recursive: true });
  await writeFile(pathToManifest, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
  return { manifest, pathToManifest };
}

function getReleaseId(root) {
  const fromEnvironment = process.env.TRIPICK_RELEASE_ID ?? process.env.GITHUB_SHA;
  if (fromEnvironment) return assertReleaseId(fromEnvironment);
  try {
    const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
    if (result.status === 0) return assertReleaseId(result.stdout.trim());
  } catch {
    // The explicit error below is more useful than the underlying shell error.
  }
  throw new Error("请设置 TRIPICK_RELEASE_ID/GITHUB_SHA，或在 Git 仓库内运行命令。");
}

async function buildCos(root) {
  const releaseId = getReleaseId(root);
  const assetBase = assetBaseForRelease(releaseId);
  const distDir = path.join(root, "dist");
  const viteEntry = path.join(root, "node_modules", "vite", "bin", "vite.js");
  const result = spawnSync(process.execPath, [viteEntry, "build", "--configLoader", "runner", "--base", assetBase], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) throw new Error(`无法启动 Vite 构建：${result.error.message}`);
  if (result.status !== 0) throw new Error(`Vite 构建失败，退出码 ${result.status ?? "unknown"}。`);

  const indexPath = path.join(distDir, "index.html");
  const html = await readFile(indexPath, "utf8");
  if (!html.includes(assetBase)) throw new Error("Vite 构建的 HTML 没有使用本次 COS 版本 URL。");
  await rewriteDistTextAssets(distDir, assetBase);
  const resultManifest = await buildManifest(root, distDir, releaseId);
  console.log(`COS 资源构建完成：${releaseId}（${resultManifest.manifest.assets.length} 个文件）。`);
  console.log(`清单：${path.relative(root, resultManifest.pathToManifest)}`);
  console.log("本命令只构建并生成清单，不联网、不读取凭据、不上传资源。");
}

async function readManifest(root) {
  const releaseId = getReleaseId(root);
  const distDir = path.join(root, "dist");
  const manifestPath = manifestPathFor(root, releaseId);
  const parsed = JSON.parse(await readFile(manifestPath, "utf8"));
  const manifest = validateManifest(parsed);

  for (const asset of manifest.assets) {
    const fullPath = path.resolve(distDir, ...asset.path.split("/"));
    const relative = path.relative(distDir, fullPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`清单路径越界：${asset.path}`);
    const info = await stat(fullPath);
    const contents = await readFile(fullPath);
    if (!info.isFile() || contents.byteLength !== asset.size || createHash("sha256").update(contents).digest("hex") !== asset.sha256) {
      throw new Error(`本地构建产物与清单不匹配：${asset.path}。请先运行 pnpm build:cos。`);
    }
  }
  return manifest;
}

export function requestHeadersFor(method, { cors = false, headers = {} } = {}) {
  const normalizedMethod = String(method ?? "GET").toUpperCase();
  if (cors && normalizedMethod !== "GET") {
    throw new Error("COS 跨域校验只使用 GET；其他服务端探测不得附加 Origin。");
  }
  const requestHeaders = Object.fromEntries(
    Object.entries(headers).filter(([name]) => name.toLowerCase() !== "origin"),
  );
  if (cors) requestHeaders.Origin = SITE_ORIGIN;
  return requestHeaders;
}

async function fetchWithTimeout(url, options = {}) {
  const { cors = false, ...requestOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    return await fetch(url, {
      ...requestOptions,
      redirect: "follow",
      signal: controller.signal,
      headers: requestHeadersFor(requestOptions.method, {
        cors,
        headers: requestOptions.headers ?? {},
      }),
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function assertPublicCorsRead() {
  let response;
  try {
    response = await fetchWithTimeout(`${EXPECTED_COS_ORIGIN}/${CORS_PROBE_KEY}`, { method: "GET", cors: true });
    const body = await response.arrayBuffer();
    if (!response.ok || body.byteLength === 0) {
      throw new Error(`COS CORS 探测对象返回 HTTP ${response.status}。`);
    }
    assertCorsHeaders(response, "现有 COS 文档 GET");
  } catch (error) {
    throw new Error(`上传前的跨域读取检查失败，未上传任何文件：${error.message}`);
  }
}

export function summarizeCoscliFailure(result, command = "命令", diagnostics = "") {
  const output = [result?.stdout, result?.stderr]
    .map((value) => Buffer.isBuffer(value) ? value.toString("utf8") : String(value ?? ""))
    .concat(typeof diagnostics === "string" ? diagnostics : String(diagnostics?.text ?? ""))
    .join("\n");
  const code =
    output.match(/<Code>\s*([A-Za-z][A-Za-z0-9_.-]{0,63})\s*<\/Code>/i)?.[1] ??
    output.match(/\b(?:COS\s+)?(?:ErrorCode|Code)\s*[:=]\s*([A-Za-z][A-Za-z0-9_.-]{0,63})\b/i)?.[1];
  const status =
    output.match(/\bHTTP(?:\/\d(?:\.\d)?)?\s*[: ]?\s*(\d{3})\b/i)?.[1] ??
    output.match(/<HTTPStatus>\s*(\d{3})\s*<\/HTTPStatus>/i)?.[1] ??
    output.match(/\b(?:StatusCode|HTTPStatus|status(?:\s*code)?)\s*[:=]\s*(\d{3})\b/i)?.[1];
  const errorCode = /^[A-Z0-9_]{1,24}$/.test(result?.error?.code ?? "") ? result.error.code : null;
  const details = [
    errorCode ? `本地错误码 ${errorCode}` : null,
    status ? `HTTP ${status}` : null,
    code ? `COS 错误码 ${code}` : null,
  ].filter(Boolean);
  if (details.length === 0 && typeof diagnostics === "object" && diagnostics !== null) {
    details.push(
      diagnostics.files === 0
        ? "coscli 未生成文件级错误日志"
        : `已扫描 ${diagnostics.files} 个临时日志（${diagnostics.bytes} 字节），未提取到安全错误码`,
    );
  }
  return `coscli ${command} 失败（退出码 ${result?.status ?? "unknown"}${details.length ? `；${details.join("；")}` : ""}）；原始输出已隐藏。`;
}

export async function readCoscliDiagnostics(directory) {
  if (!directory) return { text: "", files: 0, bytes: 0 };
  const chunks = [];
  let filesRead = 0;
  let bytesRead = 0;
  const pendingDirectories = [{ path: directory, depth: 0 }];
  while (pendingDirectories.length > 0 && bytesRead < 4 * 1024 * 1024) {
    const current = pendingDirectories.pop();
    let entries;
    try {
      entries = await readdir(current.path, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const filePath = path.join(current.path, entry.name);
      if (entry.isDirectory() && current.depth < 2) {
        pendingDirectories.push({ path: filePath, depth: current.depth + 1 });
        continue;
      }
      if (!entry.isFile() || bytesRead >= 4 * 1024 * 1024) continue;
      try {
        const info = await stat(filePath);
        if (info.size > 1024 * 1024 || bytesRead + info.size > 4 * 1024 * 1024) continue;
        const content = await readFile(filePath, "utf8");
        chunks.push(content);
        filesRead += 1;
        bytesRead += info.size;
      } catch {
        // Diagnostic logs are optional; never replace the upload error with a log-read error.
      }
    }
  }
  return { text: chunks.join("\n"), files: filesRead, bytes: bytesRead };
}

async function runCoscli(binary, args, cwd, diagnosticDirectory) {
  let result;
  try {
    result = spawnSync(binary, args, {
      cwd,
      encoding: "utf8",
      maxBuffer: 2 * 1024 * 1024,
      stdio: "pipe",
      shell: false,
    });
  } catch {
    throw new Error("启动 coscli 失败；已隐藏命令输出，检查 runner 上的 coscli 安装。");
  }
  if (result.error || result.status !== 0) {
    const diagnostics = await readCoscliDiagnostics(diagnosticDirectory);
    throw new Error(summarizeCoscliFailure(result, args[0], diagnostics));
  }
}

async function resolveCosCliConfig(root) {
  const suppliedPath = process.env.TRIPICK_COSCLI_CONFIG;
  if (!suppliedPath) {
    throw new Error("缺少 TRIPICK_COSCLI_CONFIG。由获准的认证提供器准备临时 COSCLI 配置文件并传入路径；脚本不读取密钥值或本机默认配置。");
  }

  const configPath = path.resolve(root, suppliedPath);
  let configInfo;
  try {
    configInfo = await stat(configPath);
  } catch {
    throw new Error("TRIPICK_COSCLI_CONFIG 指向的认证配置文件不存在；未上传任何文件。");
  }
  if (!configInfo.isFile()) {
    throw new Error("TRIPICK_COSCLI_CONFIG 必须指向文件；未上传任何文件。");
  }
  if ((configInfo.mode & 0o077) !== 0) {
    throw new Error("COSCLI 认证配置必须仅对当前用户可读写（建议权限 0600）；未上传任何文件。");
  }

  const binary = process.env.TRIPICK_COSCLI_BINARY || "coscli";
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "tripick-coscli-"));
  await chmod(tempDir, 0o700);
  const logPath = path.join(tempDir, "logs");
  await mkdir(logPath, { recursive: true, mode: 0o700 });
  return { binary, configPath, tempDir, logPath };
}

async function verifyAsset(asset) {
  let response;
  try {
    response = await fetchWithTimeout(asset.url, { method: "GET", cors: true });
  } catch {
    throw new Error(`${asset.path} 无法通过公开 GET 读取。`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  assertAssetResponse({ response, asset, bytes });
}

async function verifyManifest(manifest) {
  await assertPublicCorsRead();
  for (const asset of manifest.assets) await verifyAsset(asset);
  console.log(`COS 资源验证通过：${manifest.releaseId}（${manifest.assets.length} 个对象）。`);
}

async function uploadManifest(root, manifest) {
  const credentials = await resolveCosCliConfig(root);
  const distDir = path.join(root, "dist");
  try {
    await assertPublicCorsRead();
    for (const asset of manifest.assets) {
      let head;
      try {
        head = await fetchWithTimeout(asset.url, { method: "HEAD" });
      } catch {
        throw new Error(`${asset.path} 上传前 HEAD 失败；未覆盖现有版本。`);
      }
      if (head.status === 200) continue;
      if (head.status !== 404) {
        throw new Error(`${asset.path} 上传前 HEAD 返回 HTTP ${head.status}；未覆盖现有版本。`);
      }

      const localPath = path.join(distDir, ...asset.path.split("/"));
      const meta = `Content-Type:${asset.contentType}#Cache-Control:${asset.cacheControl}#x-cos-meta-sha256:${asset.sha256}`;
      await runCoscli(credentials.binary, [
        "cp", localPath, `cos://${COS_BUCKET}/${asset.key}`,
        "--config-path", credentials.configPath,
        "--protocol", "https",
        "--init-skip",
        "--disable-log",
        "--log-path", credentials.logPath,
        "--process-log-path", credentials.logPath,
        "--fail-output-path", credentials.logPath,
        "--forbid-overwrite",
        "--meta", meta,
      ], root, credentials.logPath);
    }
    await verifyManifest(manifest);
  } finally {
    await rm(credentials.tempDir, { recursive: true, force: true });
  }
}

async function main() {
  const root = path.resolve(process.env.TRIPICK_SITE_ROOT || process.cwd());
  const command = process.argv[2];
  if (command === "build") return buildCos(root);

  if (command === "upload" || command === "verify") {
    const manifest = await readManifest(root);
    if (command === "verify") return verifyManifest(manifest);
    return uploadManifest(root, manifest);
  }

  throw new Error("用法：node scripts/cos-assets.mjs <build|upload|verify>");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`COS 资源任务失败：${error.message}`);
    process.exitCode = 1;
  });
}
