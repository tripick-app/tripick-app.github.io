# Tripick website

The Tripick product website is built with React, TypeScript, Vite, and Motion for React. It uses Node.js 24 LTS (pinned in `.nvmrc`) and pnpm 11.25.0. With nvm installed, run `nvm install` and `nvm use`, then `pnpm install` followed by `pnpm dev` for local development; `pnpm build` writes the GitHub Pages artifact to `dist/`. Run `pnpm typecheck` to check the site and release tooling; Node 24.12+ runs the TypeScript release scripts and tests with its built-in stable type stripping.

GitHub Actions builds the site on each push to `main` and publishes `dist/` to <https://tripick-app.github.io/>.

The app source remains in the private `shijiatongxue/tripick` repository. This public repository contains only the website and its public assets.

The phone images in the hero were captured from the running iOS app's curation preview in Chinese and English using generated sample travel photos. Each shipping screenshot and WebP variant has a provenance sidecar next to the asset.
