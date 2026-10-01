# AGENTS.md

## Project

This repository builds Tripick's bilingual public product website. The page is a React 19 and TypeScript single-page site built with Vite; Motion for React provides animation. `PRODUCT.md` records verified product behavior and constraints. `DESIGN.md` describes the site's visual system.

## Structure

- `src/App.tsx`: page structure, Chinese and English copy, responsive image declarations, and motion.
- `src/styles.css`: layout, responsive states, accessibility preferences, and visual styling.
- `src/main.tsx`, `src/motion-features.ts`, `vite.config.ts`, `tsconfig.json`: app entry, motion setup, and TypeScript/Vite configuration.
- `public/assets/`: public source artwork, generated responsive WebP images, and fonts. Preserve each generated image's adjacent `.json` provenance file when updating or regenerating it.
- `scripts/`: TypeScript build, COS upload/verification, temporary authentication, and release safety tests.
- `.github/workflows/pages.yml`: the existing COS-first, GitHub Pages deployment pipeline.
- `docs/COS_ASSET_RELEASES.md`: COS release and rollback behavior.

## Runtime and checks

- Use the Node.js LTS version pinned in `.nvmrc` and pnpm `11.25.0`. Do not change the Node version independently in workflow, package engines, and local setup instructions.
- Install with `pnpm install --frozen-lockfile`.
- Before handing off source changes, run `pnpm typecheck`, `pnpm test:cos`, and `pnpm build`. For asset-release changes, also run `pnpm build:cos` and inspect the generated manifest. `pnpm cos:upload` contacts Tencent COS and is not a local preview command.
- Keep TypeScript strict. Use `.ts` for release tooling/configuration and `.tsx` for React UI; avoid `any` and non-erasable TypeScript syntax in scripts run directly by Node.
- Never stage `.DS_Store`, generated `dist/`, or release manifests unless a task explicitly requires a tracked artifact.

## Site content and visual QA

- Keep Chinese and English content semantically aligned. Check both languages whenever copy or layout changes.
- Treat `PRODUCT.md` as the source of truth. Do not promise unverified app availability or add capabilities absent from it.
- The travel photos on the page are generated examples; do not present them as customer photos or as real app analysis results. The app screenshots are product previews, not personal libraries. Keep the visible disclosure and image provenance intact.
- Preserve useful alt text, keyboard focus, reduced-motion behavior, a readable first frame, and responsive layouts. Visually inspect at desktop and phone widths, including 390px, 800px, and 1120px transitions.
- The hero phone image must remain clipped to the screen mask throughout transforms: the frame, screen image, rounded corners, scale, and rotation must stay aligned with no exposed image edges or flashes. Check the initial frame and later animation states as well as `prefers-reduced-motion: reduce`.
- Prefer the existing photography, typography, whitespace, fine rules, and blue accent system. Add no decorative UI that implies product data or controls that do not exist.

## COS asset release safety

- A push to `main` or a manual workflow run builds versioned static assets, uploads and validates them in Tencent COS, then publishes the HTML through GitHub Pages. COS upload, public GET/CORS, MIME, cache headers, byte count, and SHA-256 verification must all succeed before the Pages artifact/deploy steps can run.
- Assets use the commit SHA release prefix. Existing objects are not overwritten; a pre-upload `HEAD` 200 skips the upload, 404 permits upload, and other statuses fail closed. Keep old hash prefixes so a previous HTML release can be restored.
- COSCLI is pinned to v1.0.9 and verified against its fixed checksum. Preserve the bucket, region, immutable destination layout, GET-only CORS behavior, and upload-before-HTML gate. Do not broaden bucket permissions/CORS or delete old releases to work around an error.
- Credentials are GitHub Secrets and are written only to restricted temporary runner files, then removed before Pages deployment. Never print, inspect, copy, commit, or place credential values in CLI arguments. Do not use a developer's default COSCLI config as a fallback.
- Keep diagnostics allowlisted and value-free. A `404` HEAD is an expected missing-object result; network retries must remain bounded and limited to known transient connection/time-out and selected 5xx failures. A local manifest/path/config/flag failure must be diagnosed before investigating COS HTTP policy.
- Do not manually upload assets. Test code changes locally; rely on the existing workflow for actual COS publication and Pages deployment, and verify the final workflow run and deployed page when a publishing change is authorized.
