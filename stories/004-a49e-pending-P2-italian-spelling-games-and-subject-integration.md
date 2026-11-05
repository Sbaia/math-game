---
id: "004-a49e"
title: "Italian spelling games and subject integration"
status: pending
priority: P2
type: feature
created: 2026-11-05T21:23:56.755Z
updated: 2026-11-05T21:23:56.755Z
dependencies: []
plan: "plans/20261105-italian-games.md"
plan_step: "Steps 1 and 2"
---

# Italian spelling games and subject integration

## Problem Statement

Italian currently has only a coming soon placeholder and needs second grade spelling activities

## Acceptance Criteria

- [x] REALITY: effect=child practices Italian spelling ; state=bundled words and browser hash ; assumptions=Italian voice availability varies ; radius=Italian games and navigation
- [x] Three categories plus mixed practice support completion spelling choice and dictation
- [x] Uppercase words and strict accents with touch accent controls
- [x] Italian speech or explicit unavailable feedback; old audio stops on navigation
- [x] Italian direct links reload and history work while existing tests pass
- [ ] [MANUAL] User listens to Italian pronunciation on target device

## Proof

## Work Log

### 2026-11-05T21:24:23.466Z - Contract before code recorded in plans/20261105-italian-games.md and delegated italian/CONTRACT.md. Baseline16 tests pass. Navigation now selects language module by subject, stops both sessions, validates Italian category/mode and shares menus. Three navigation tests pass. Italian module implementation in progress.

### 2026-11-05T21:28:36.656Z - Final implementation:9 sound words including BAGNI/GNI plus8 doubles and8 accents; normal8 random words,mixed6. All26 automated tests pass, diff clean. Real browser12 Italian category/mode routes390px without overflow; back restores Italian from English; English mixed memory still16 cards. Real speech used PIÙ with Alice/it-IT and onend; PIU rejected, accented touch key produced accepted PIÙ. Human listening remains pending. Independent review running; no commit or push for this new feature.

### 2026-11-05T21:29:28.270Z - Independent production-first review Status done: no concrete findings. Final26 tests pass. Report /tmp/math-italian-review.md. All automated criteria checked; target-device human pronunciation criterion pending. Implementation ready for local user testing; no commit/push.
