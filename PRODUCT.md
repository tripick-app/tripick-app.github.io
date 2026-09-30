# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 with Vite and Motion for React. pnpm 11.25.0 manages dependencies; GitHub Actions builds the static site and deploys the `dist` output to GitHub Pages.

## Users

Inferred from the Tripick app brief, not separately confirmed: iPhone users returning from a trip who want to turn a large set of travel photos into a smaller collection worth revisiting.

## Product Purpose

Tripick helps people organize travel photos into a curated album. The app groups trip moments by capture time and location when available, ranks representative photos with on-device visual-quality and similarity signals, then lets the user review and adjust the selection before confirming changes in Apple Photos.

## Positioning

Photo analysis runs on the iPhone using Apple Photos and on-device Vision capabilities. Tripick does not upload photos, thumbnails, or analysis results to Tripick servers or third-party cloud AI. Capture time and location (when present) help group travel segments; visual quality, face quality, burst representation, and similarity help rank candidates and reduce repetition. The user reviews and confirms the selection before Tripick writes to Apple Photos.

## Operating Context

Tripick is an iPhone app using Apple Photos. A user chooses an album or a set of photos, selects a target number, reviews and can adjust the locally generated picks, then confirms before creating or merging a curated album and marking selected photos as favorites.

## Capabilities and Constraints

- The app supports iPhone and iOS 17 or later.
- Users can choose a regular album or select up to 100 photos from All Photos.
- The target selection can be 4, 6, 9, or a custom count up to 20.
- Photo analysis stays on the device; an account or sign-in is not required. Capture location is used only when it exists in the selected photo metadata.
- Candidate ranking uses on-device photo signals such as visual quality, face quality, burst representation, and similarity. The app groups by capture time and available location to help cover distinct trip segments.
- Tripick does not delete or alter original photos. Photos changes happen only after user confirmation.
- The public App Store URL and availability are not confirmed in the project materials. The site must not imply that a download is currently available or invent a store link.

## Evidence on Hand

- Product flow and constraints: the Tripick app source, `AGENTS.md`, `README.md`, and `docs/MVP_SPEC.md` in the private app repository.
- Brand mark: `Tripick/Assets.xcassets/TripickLogo.imageset/TripickLogo.png`.
- App screenshots: `docs/app-store/screenshots/iphone/`; the screenshot notes identify the travel samples as generated, not personal photos.
- Existing public privacy and support pages are documented in `docs/APP_STORE_SUBMISSION.md`.
- No confirmed App Store download URL is present.

## Product Principles

- Keep travel photos on the user's device.
- Let the user review and adjust selections before changing Apple Photos.
- Preserve original photos and the user's control over their library.
