---
status: approved
approved_at: "2026-11-05T22:13:02.955Z"
updated: "2026-11-05T22:13:02.955Z"
---
# Feature: Installable offline PWA
Date: 2026-11-05
Status: Approved for implementation

## Decision
- Package existing static games as an installable PWA at the GitHub Pages project path /math-game/.
- Add a relative manifest, icons, opt-in install UI, and scoped offline caching.
- Keep file URL operation for local games; enable service worker only on HTTPS or local HTTP.
- Do not change game rules. Speech remains device-dependent and may require a connection.

## Architecture Context
- index.html loads classic game scripts and the hash router.
- manifest.webmanifest defines identity, start URL, scope, display, and icons relative to its location.
- pwa.js controls installation, status, and user-approved worker updates.
- sw.js precaches only app resources and handles offline navigation.
- GitHub Pages serves the repository under /math-game/ on a shared origin.

## Research
- Existing app uses only local assets and browser speech; no build is needed.
- Browser installation requires a supported browser, HTTPS, and a manifest with icons.
- Service worker cache enables offline games; it cannot cache operating-system voices.
- Versioned caches must stay within this project scope and preserve other sites on the origin.

## Security
- No new accounts, tracking, remote scripts or permissions.
- Cache only known same-origin GET resources in the app scope.
- Do not overwrite an active game with an automatic update.

## Performance
- Precache small local scripts, styles, manifest and icons.
- Use versioned cache-first assets and app-shell navigation to keep each release coherent until user-approved activation.
- Retain the prior version if the next version fails to install.

## Steps
### Step 1: Offline resource lifecycle
- Implement sw.js and event-boundary tests.
- Validate install failure, offline navigation, scoped cleanup, external requests and explicit update activation.
- Validation: node --test pwa-offline.test.js and real browser offline reload under /math-game/.

### Step 2: Installation and publishing assets
- Add manifest.webmanifest, vector icon source and PNG icons, pwa.js, pwa.css, index.html metadata and local registration.
- Provide install button when supported, clear offline/audio state, and opt-in update button.
- Validate manifest URLs and icon dimensions; local browser worker control, offline all subjects, hash links, mobile layout.
- Document HTTPS hosting, Android installation, release version/cache bump and future store packaging.

## Acceptance Criteria
- [x] Manifest start URL, scope and icon paths work under /math-game/.
- [x] Icons include 192px,512px,maskable and Apple touch variants.
- [x] Supported browsers can offer installation; direct file games still work.
- [x] Previously loaded games open and reload offline.
- [x] Updates activate after user choice and preserve hash route.
- [x] Existing tests pass and caches outside this app are preserved.
- [x] Publishing and Android installation steps are documented.
- [ ] [MANUAL] Native Android installation and offline voice playback checked on target device.

## Verification
- Full suite: 38 passed,0 failed. Independent production-first review and readiness follow-up: no required changes.
- Real Chrome browser at /math-game/: installation offered, worker controls page, manifest and icons load.
- With the local server stopped: cached reload works, uncached network fetch fails, all58 game routes render at390px.
- Actual waiting worker activation through AGGIORNA E RIAPRI reloads and preserves selected hash route.
- Direct file URL game launch remains working. QA server,browser and local QA cache/registration removed.
- Native Android install and offline voice playback remain manual target-device checks. No commit or push for this feature.
