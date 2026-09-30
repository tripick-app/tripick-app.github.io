# Tripick website

The Tripick product website is built with React, Vite, and Motion for React. It uses pnpm 11.25.0. Run `pnpm install` followed by `pnpm dev` for local development; `pnpm build` writes the GitHub Pages artifact to `dist/`.

GitHub Actions builds the site on each push to `main` and publishes `dist/` to <https://tripick-app.github.io/>.

The app source remains in the private `shijiatongxue/tripick` repository. This public repository contains only the website and its public assets.
