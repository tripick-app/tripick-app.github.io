import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  AUTH_DIR_PREFIX,
  authPaths,
  cleanupCoscliAuth,
  prepareCoscliAuth,
} from "./cos-auth-config.mjs";

test("认证配置只在runner临时目录中创建，密钥不进入CLI参数", async () => {
  const runnerTemp = await mkdtemp(path.join(os.tmpdir(), "tripick-auth-test-"));
  const githubEnv = path.join(runnerTemp, "github-env");
  const idFixture = "synthetic-id-for-test";
  const keyFixture = 'synthetic-"key"-for-test';
  const calls = [];
  const env = {
    TRIPICK_COS_SECRET_ID: idFixture,
    TRIPICK_COS_SECRET_KEY: keyFixture,
    TRIPICK_COSCLI_BINARY: "/tmp/test-coscli",
    RUNNER_TEMP: runnerTemp,
    GITHUB_RUN_ID: "12345",
    GITHUB_RUN_ATTEMPT: "2",
    GITHUB_ENV: githubEnv,
  };

  try {
    const result = await prepareCoscliAuth({
      env,
      spawn: (_binary, args, options) => {
        calls.push({ args, options });
        return { status: 0 };
      },
    });

    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].args.slice(0, 2), ["config", "show"]);
    assert.ok(!calls[0].args.includes(idFixture));
    assert.ok(!calls[0].args.includes(keyFixture));
    assert.equal(calls[0].options.stdio, "ignore");

    const config = JSON.parse(await readFile(result.configPath, "utf8"));
    assert.equal(config.base.secretid, idFixture);
    assert.equal(config.base.secretkey, keyFixture);
    assert.equal(config.base.disableencryption, "true");
    assert.equal(config.buckets[0].name, "s-1307850796");
    assert.equal(config.buckets[0].region, "ap-beijing");

    const info = await stat(result.configPath);
    assert.equal(info.mode & 0o077, 0);
    assert.equal((await stat(result.directory)).mode & 0o077, 0);
    const exported = await readFile(githubEnv, "utf8");
    assert.ok(exported.includes(`TRIPICK_COSCLI_CONFIG=${result.configPath}`));
    assert.ok(!exported.includes(idFixture));
    assert.ok(!exported.includes(keyFixture));

    assert.equal(await cleanupCoscliAuth({
      env: { RUNNER_TEMP: runnerTemp, TRIPICK_COSCLI_CONFIG_DIR: result.directory },
    }), true);
    await assert.rejects(stat(result.directory), { code: "ENOENT" });
  } finally {
    await rm(runnerTemp, { recursive: true, force: true });
  }
});

test("缺少任一secret时在创建临时目录之前失败", async () => {
  const runnerTemp = await mkdtemp(path.join(os.tmpdir(), "tripick-auth-missing-"));
  const env = {
    TRIPICK_COS_SECRET_ID: "synthetic-id",
    RUNNER_TEMP: runnerTemp,
    GITHUB_RUN_ID: "12345",
    GITHUB_RUN_ATTEMPT: "1",
    GITHUB_ENV: path.join(runnerTemp, "github-env"),
  };

  try {
    await assert.rejects(prepareCoscliAuth({ env }), /未提供所需 COS Secrets/);
    assert.deepEqual(await readdir(runnerTemp), []);
  } finally {
    await rm(runnerTemp, { recursive: true, force: true });
  }
});

test("清理器拒绝runner临时目录之外的路径并校验run id", async () => {
  const runnerTemp = await mkdtemp(path.join(os.tmpdir(), "tripick-auth-boundary-"));
  try {
    await assert.rejects(cleanupCoscliAuth({
      env: {
        RUNNER_TEMP: runnerTemp,
        TRIPICK_COSCLI_CONFIG_DIR: path.join(os.tmpdir(), `${AUTH_DIR_PREFIX}9-1`),
      },
    }), /拒绝清理/);
    assert.throws(() => authPaths({
      runnerTemp,
      runId: "../escape",
      runAttempt: "1",
    }), /run id/);
  } finally {
    await rm(runnerTemp, { recursive: true, force: true });
  }
});
