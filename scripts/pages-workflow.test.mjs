import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowPath = new URL("../.github/workflows/pages.yml", import.meta.url);

test("Pages发布先完成COS测试、构建、上传校验，成功后才部署HTML", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  const testIndex = workflow.indexOf("run: pnpm test:cos");
  const buildIndex = workflow.indexOf("run: pnpm build:cos");
  const authIndex = workflow.indexOf("run: node scripts/cos-auth-config.mjs prepare");
  const uploadIndex = workflow.indexOf("run: pnpm cos:upload");
  const cleanupIndex = workflow.indexOf("run: node scripts/cos-auth-config.mjs cleanup");
  const pagesArtifactIndex = workflow.indexOf("uses: actions/upload-pages-artifact@");
  const deployIndex = workflow.indexOf("uses: actions/deploy-pages@");

  assert.ok(testIndex >= 0);
  assert.ok(testIndex < buildIndex);
  assert.ok(buildIndex < authIndex);
  assert.ok(authIndex < uploadIndex);
  assert.ok(uploadIndex < cleanupIndex);
  assert.ok(cleanupIndex < pagesArtifactIndex);
  assert.ok(pagesArtifactIndex < deployIndex);
  assert.ok(!workflow.includes("continue-on-error"));
});

test("流水线只引用已配置的组织Secrets名称，不回显值", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  const authStart = workflow.indexOf("- name: Prepare temporary COS credentials");
  const authEnd = workflow.indexOf("- name: Upload and verify COS assets");
  assert.ok(authStart >= 0 && authEnd > authStart);

  const authStep = workflow.slice(authStart, authEnd);
  assert.match(authStep, /TRIPICK_COS_SECRET_ID:\s*\$\{\{ secrets\.TRIPICK_COS_SECRET_ID \}\}/);
  assert.match(authStep, /TRIPICK_COS_SECRET_KEY:\s*\$\{\{ secrets\.TRIPICK_COS_SECRET_KEY \}\}/);
  assert.match(authStep, /scripts\/cos-auth-config\.mjs prepare/);
});


test("本地与CI统一使用Node 24 LTS和固定Ubuntu runner", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  const nodeVersion = (await readFile(new URL("../.nvmrc", import.meta.url), "utf8")).trim();
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

  assert.equal(nodeVersion, "24.21.0");
  assert.equal(packageJson.engines.node, ">=24.21.0 <25");
  assert.match(workflow, /runs-on: ubuntu-24\.04/);
  assert.match(workflow, /uses: actions\/setup-node@v7/);
  assert.match(workflow, /node-version-file: \.nvmrc/);
  assert.doesNotMatch(workflow, /node-version: 22/);
});
