# COS 静态资源发布

## 发布目标与回滚

官网 HTML 继续由 GitHub Pages 提供。CSS、JavaScript（含 Vite 动态 chunk）、字体和 `public/assets/` 下的嵌套资源使用独立版本路径：

```text
https://s-1307850796.cos.ap-beijing.myqcloud.com/tripick-app.github.io/releases/<40 位 commit SHA>/assets/...
```

每个版本清单记录对象 key、MIME、字节数、SHA-256 与 `public,max-age=31536000,immutable` 缓存头。上传禁止覆盖，旧 SHA 路径不删除，因此可以将旧版 HTML 与其 COS 对象一并回滚。当前使用的是 COS 对象域名；没有验证或宣称启用了独立 CDN 加速域名。

## 本地开发

- `pnpm dev` 和 `pnpm build` 保持原行为，不访问 COS、不读取 COS 认证。
- `pnpm build:cos` 构建带固定版本 COS URL 的 `dist` 并写入 `.cos-release/<sha>.json`，不联网、不读取认证、不上传。
- 日常本地预览仍用 `pnpm build && pnpm preview`。
- `pnpm test:cos` 检查资源路径与清单、GET-only CORS 行为、认证临时文件边界、COSCLI 固定摘要，以及 Pages 工作流门禁顺序。

## 上传、GET 校验和缓存

`pnpm cos:upload` 需要 `TRIPICK_COSCLI_CONFIG` 指向权限为私有的 COSCLI 配置文件。上传器只读取清单和本地产物，再检查配置文件路径、类型和权限；不读取配置值，也不回退到开发者的 `~/.cos.yaml`。

上传过程先对现有公开隐私文档发带 `Origin: https://tripick-app.github.io` 的真实 GET。只有响应允许精确来源时才继续。每个目标资源上传前用不带 Origin 的服务端 HEAD 检查是否已存在；已有对象不覆盖，缺少对象才以预期 MIME、内容 SHA-256 元数据及一年 immutable 缓存上传，并启用 `--forbid-overwrite`。上传完成后，对清单内每个对象发带官网 Origin 的 GET，核验状态、CORS 头、MIME、Cache-Control、字节数和完整 SHA-256。任一步失败均返回非零退出码。

COS 桶当前 CORS 规则为单一来源 `https://tripick-app.github.io`、只允许 GET，Allow-Headers 和 Expose-Headers 为空，MaxAge 600，Vary Origin 开启。只对 GET 加 Origin；预上传 HEAD 是服务端请求，不要求开放 HEAD CORS。

## Pages 自动发布工作流

本地 `.github/workflows/pages.yml` 已准备以下顺序：

```text
依赖安装 → pnpm test:cos → pnpm build:cos
→ 安装并校验固定版本 COSCLI → 准备临时 COSCLI 配置
→ pnpm cos:upload（含公开 GET 校验）→ 清理临时认证
→ 上传 Pages artifact → 部署 Pages HTML
```

COS 测试、构建、COSCLI 安装、认证准备、上传或资源校验任一步失败，Pages artifact 与部署步骤都会因前序失败而跳过。认证在上传前创建，部署 HTML 前清理。旧哈希资源不删除，可配合旧 HTML 回滚。工作流仅对 main 分支 push 和手动触发运行。

当前组织级 Actions Secrets 的名称是 `TRIPICK_COS_SECRET_ID` 与 `TRIPICK_COS_SECRET_KEY`；配置截图显示其可用于 Public repositories。没有读取或暴露 Secret 值，也没有更改组织配置。认证适配器仅在 runner 临时目录内生成权限为 0700 的独立目录与权限为 0600 的 `cos.yaml`，把其路径写入 GitHub Actions 环境；内容为临时明文，上传后在 Pages 部署前删除，runner 销毁时也会清除。配置校验静默运行，不输出认证值。COSCLI CLI 通过固定 SHA-256 校验后运行。COS 写入逻辑只依赖 `TRIPICK_COSCLI_CONFIG` 路径；以后采用经核实的短期身份时，只需替换工作流认证准备步骤。

## 尚未在线启用的部分

- 本地工作流尚未推送；远端 Pages workflow 当前仍执行普通 `pnpm build` 后部署。
- 组织 Secrets 名称和可见范围已核对，但值有效性尚未由 Actions 运行验证。
- 当前 CORS 规则和公开 GET 已验证；尚未上传本站 CSS、JavaScript、字体和图片对象，因此这些新对象的线上 GET、MIME 与缓存验收要等获准 CI 上传后才能完成。
- 未进行提交、推送、资源上传或部署。正式发布等待用户明确确认。
