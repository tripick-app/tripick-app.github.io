import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  COSCLI_LINUX_AMD64_URL,
  downloadCoscli,
} from "./install-coscli.mjs";

test("安装器验证固定摘要后再写入可执行文件", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "tripick-coscli-test-"));
  const destination = path.join(root, "bin", "coscli");
  const bytes = Buffer.from("synthetic coscli binary fixture");
  const digest = createHash("sha256").update(bytes).digest("hex");
  let requestedUrl;

  try {
    await downloadCoscli({
      destination,
      platform: "linux",
      arch: "x64",
      expectedSha256: digest,
      fetchImpl: async (url) => {
        requestedUrl = url;
        return new Response(bytes, { status: 200 });
      },
    });
    assert.equal(requestedUrl, COSCLI_LINUX_AMD64_URL);
    assert.deepEqual(await readFile(destination), bytes);
    assert.equal((await stat(destination)).mode & 0o777, 0o700);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("摘要不符或runner架构不符时拒绝安装", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "tripick-coscli-invalid-"));
  const destination = path.join(root, "coscli");
  let requested = false;

  try {
    await assert.rejects(downloadCoscli({
      destination,
      platform: "linux",
      arch: "x64",
      expectedSha256: "0".repeat(64),
      fetchImpl: async () => {
        requested = true;
        return new Response(Buffer.from("wrong binary"), { status: 200 });
      },
    }), /SHA-256 校验失败/);
    await assert.rejects(stat(destination), { code: "ENOENT" });

    requested = false;
    await assert.rejects(downloadCoscli({
      destination,
      platform: "darwin",
      arch: "arm64",
      fetchImpl: async () => {
        requested = true;
        return new Response(Buffer.from("wrong platform"), { status: 200 });
      },
    }), /只支持/);
    assert.equal(requested, false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
