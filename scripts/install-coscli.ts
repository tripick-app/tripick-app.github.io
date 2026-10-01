#!/usr/bin/env node

import { createHash } from "node:crypto";
import { appendFile, chmod, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const COSCLI_VERSION = "1.0.9";
export const COSCLI_LINUX_AMD64_URL =
  "https://github.com/tencentyun/coscli/releases/download/v1.0.9/coscli-v1.0.9-linux-amd64";
export const COSCLI_LINUX_AMD64_SHA256 =
  "a07de5ba2800147a700ed29036b0c76a4229088cee68e1682d0eae19b638a915";

type FetchBinary = (url: string, init?: RequestInit) => Promise<Response>;
type DownloadOptions = {
  destination: string;
  platform?: NodeJS.Platform;
  arch?: string;
  fetchImpl?: FetchBinary;
  expectedSha256?: string;
};

export async function downloadCoscli({
  destination,
  platform = process.platform,
  arch = process.arch,
  fetchImpl = globalThis.fetch,
  expectedSha256 = COSCLI_LINUX_AMD64_SHA256,
}: DownloadOptions): Promise<string> {
  if (platform !== "linux" || arch !== "x64") {
    throw new Error("COSCLI 安装器目前只支持 GitHub Actions ubuntu-24.04 x64 runner。");
  }
  if (!destination || !path.isAbsolute(destination)) {
    throw new Error("COSCLI 安装目标必须是绝对路径。");
  }

  let response;
  try {
    response = await fetchImpl(COSCLI_LINUX_AMD64_URL, { redirect: "follow" });
  } catch {
    throw new Error("下载官方 COSCLI 失败。");
  }
  if (!response?.ok) throw new Error(`下载官方 COSCLI 返回 HTTP ${response?.status ?? "unknown"}。`);

  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== expectedSha256) {
    throw new Error("COSCLI SHA-256 校验失败；拒绝安装该文件。");
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes, { mode: 0o700 });
  await chmod(destination, 0o700);
  return destination;
}

async function main(): Promise<void> {
  const runnerTemp = process.env.RUNNER_TEMP;
  const githubPath = process.env.GITHUB_PATH;
  const githubEnv = process.env.GITHUB_ENV;
  if (!runnerTemp || !path.isAbsolute(runnerTemp) || !githubPath || !githubEnv) {
    throw new Error("安装COSCLI需要GitHub Actions的RUNNER_TEMP、GITHUB_PATH和GITHUB_ENV。");
  }

  const binDir = path.join(runnerTemp, "tripick-tools");
  const binary = path.join(binDir, "coscli");
  await downloadCoscli({ destination: binary });
  await appendFile(githubPath, `${binDir}\n`);
  await appendFile(githubEnv, `TRIPICK_COSCLI_BINARY=${binary}\n`);
  console.log(`COSCLI v${COSCLI_VERSION} 已安装并通过固定 SHA-256 校验。`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`COSCLI 安装失败：${error instanceof Error ? error.message : "未知错误"}`);
    process.exitCode = 1;
  });
}
