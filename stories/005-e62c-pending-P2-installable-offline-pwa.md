---
id: "005-e62c"
title: "Installable offline PWA"
status: pending
priority: P2
type: feature
created: 2026-11-05T22:13:02.953Z
updated: 2026-11-05T22:13:02.953Z
dependencies: []
plan: "plans/20261105-installable-pwa.md"
plan_step: "Steps 1 and 2"
---

# Installable offline PWA

## Problem Statement

The static learning games need Android installation and dependable offline access

## Acceptance Criteria

- [x] REALITY: effect=browser installs and opens offline games ; state=manifest and scoped service worker cache ; assumptions=native install and voices vary by device ; radius=app resources under deployment scope
- [x] Relative manifest and valid icons support project-path deployment
- [x] Offline reload opens math English and Italian without breaking file URL use
- [x] Install and update controls work with user choice and preserve hash route
- [x] Cache cleanup is scoped and existing tests pass
- [x] Publishing instructions documented
- [ ] [MANUAL] Target Android native installation and offline speech verified

## Proof

## Work Log

### 2026-11-05T22:15:33.440Z - Contract recorded before implementation in plans/20261105-installable-pwa.md and offline worker contract. Added project-relative manifest,512/192/maskable/Apple icons, installation control, opt-in update control and offline/audio status. Parent4 new tests pass. Worker offline implementation in progress; real browser scoped /math-game/ server started solely for QA.

### 2026-11-05T22:19:21.125Z - Implemented and verified:38/38 tests, independent review done no required changes. Real /math-game/ Chrome install offer; server-down reload and58 game views; uncached network fails. Actual waiting-worker update click preserves hash. File launch works. Native Android install/offline voices pending manual criterion. No commit/push.
