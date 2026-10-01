#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { appendFile, chmod, mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const COS_BUCKET = "s-1307850796";
export const COS_REGION = "ap-beijing";
export const AUTH_DIR_PREFIX = "tripick-cos-auth-";

export function authPaths({ runnerTemp, runId, runAttempt }) {
  if (!runnerTemp || !path.isAbsolute(runnerTemp) || /[\r\n]/.test(runnerTemp)) {
    throw new Error("RUNNER_TEMP 必须是安全的绝对路径。");
  }
  if (!/^\d+$/.test(String(runId ?? "")) || !/^\d+$/.test(String(runAttempt ?? ""))) {
    throw new Error("GitHub Actions run id/attempt 无效。");
  }

  const tempRoot = path.resolve(runnerTemp);
  const directory = path.join(tempRoot, `${AUTH_DIR_PREFIX}${runId}-${runAttempt}`);
  const relative = path.relative(tempRoot, directory);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("认证临时目录越出 runner 临时目录。");
  }
  return {
    directory,
    configPath: path.join(directory, "cos.yaml"),
    logPath: path.join(directory, "logs"),
  };
}

function validateCoscliConfig(binary, configPath, logPath, cwd, env, spawn) {
  let result;
  try {
    result = spawn(binary, [
      "config",
      "show",
      "--config-path",
      configPath,
      "--disable-log",
      "--log-path",
      logPath,
    ], {
      cwd,
      env,
      shell: false,
      stdio: "ignore",
      timeout: 15000,
    });
  } catch {
    throw new Error("COSCLI 配置校验失败；命令输出已隐藏。");
  }
  if (result.error || result.status !== 0) {
    throw new Error("COSCLI 配置校验失败；命令输出已隐藏。");
  }
}

export async function prepareCoscliAuth({
  env = process.env,
  spawn = spawnSync,
} = {}) {
  const secretId = env.TRIPICK_COS_SECRET_ID;
  const secretKey = env.TRIPICK_COS_SECRET_KEY;
  if (!secretId || !secretKey) {
    throw new Error("GitHub Actions 未提供所需 COS Secrets；没有生成认证文件。");
  }
  if (/[\0\r\n]/.test(secretId) || /[\0\r\n]/.test(secretKey)) {
    throw new Error("COS Secrets 格式无效；没有生成认证文件。");
  }

  const { directory, configPath, logPath } = authPaths({
    runnerTemp: env.RUNNER_TEMP,
    runId: env.GITHUB_RUN_ID,
    runAttempt: env.GITHUB_RUN_ATTEMPT,
  });
  const binary = env.TRIPICK_COSCLI_BINARY || "coscli";

  try {
    await mkdir(directory, { mode: 0o700 });
    await chmod(directory, 0o700);
    await mkdir(logPath, { mode: 0o700 });
    const privateEnv = { ...env, HOME: directory };
    const configContents = JSON.stringify({
      base: {
        secretid: secretId,
        secretkey: secretKey,
        sessiontoken: "",
        protocol: "https",
        disableencryption: "true",
      },
      buckets: [{
        name: COS_BUCKET,
        alias: "tripick-assets",
        region: COS_REGION,
      }],
    });
    await writeFile(configPath, `${configContents}\n`, { mode: 0o600, flag: "wx" });
    await chmod(configPath, 0o600);

    validateCoscliConfig(binary, configPath, logPath, directory, privateEnv, spawn);

    const info = await stat(configPath);
    if (!info.isFile() || (info.mode & 0o077) !== 0) {
      throw new Error("COSCLI 配置文件权限不安全。");
    }

    const githubEnv = env.GITHUB_ENV;
    if (!githubEnv || /[\r\n]/.test(githubEnv)) {
      throw new Error("GITHUB_ENV 不可用；没有导出认证配置路径。");
    }
    await appendFile(
      githubEnv,
      `TRIPICK_COSCLI_CONFIG=${configPath}\nTRIPICK_COSCLI_CONFIG_DIR=${directory}\n`,
      { mode: 0o600 },
    );
    return { directory, configPath };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    if (
      error?.message === "COSCLI 配置校验失败；命令输出已隐藏。" ||
      error?.message === "COSCLI 配置文件权限不安全。" ||
      error?.message === "GITHUB_ENV 不可用；没有导出认证配置路径。"
    ) {
      throw error;
    }
    throw new Error("COSCLI 认证配置失败；临时文件已清理。");
  }
}

export async function cleanupCoscliAuth({ env = process.env } = {}) {
  const rootValue = env.RUNNER_TEMP;
  const directoryValue = env.TRIPICK_COSCLI_CONFIG_DIR;
  if (!directoryValue) return false;
  if (!rootValue || !path.isAbsolute(rootValue) || !path.isAbsolute(directoryValue)) {
    throw new Error("拒绝清理 runner 临时目录以外的路径。");
  }

  const root = path.resolve(rootValue);
  const directory = path.resolve(directoryValue);
  const relative = path.relative(root, directory);
  if (
    !relative ||
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    !new RegExp(`^${AUTH_DIR_PREFIX}\\d+-\\d+$`).test(path.basename(directory))
  ) {
    throw new Error("拒绝清理 runner 临时目录以外的路径。");
  }

  await rm(directory, { recursive: true, force: true });
  return true;
}

async function main() {
  const command = process.argv[2];
  if (command === "prepare") {
    await prepareCoscliAuth();
    console.log("COSCLI 临时认证配置已准备（密钥值未输出）。");
    return;
  }
  if (command === "cleanup") {
    const removed = await cleanupCoscliAuth();
    console.log(removed ? "COSCLI 临时认证文件已清理。" : "没有待清理的 COSCLI 认证文件。");
    return;
  }
  throw new Error("用法：node scripts/cos-auth-config.mjs <prepare|cleanup>");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`COSCLI 认证步骤失败：${error.message}`);
    process.exitCode = 1;
  });
}
