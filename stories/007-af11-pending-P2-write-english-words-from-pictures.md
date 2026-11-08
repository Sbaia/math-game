---
id: "007-af11"
title: "Write English words from pictures"
status: pending
priority: P2
type: feature
created: 2026-11-08T07:50:18.995Z
updated: 2026-11-08T07:50:18.995Z
dependencies: []
---

# Write English words from pictures

## Problem Statement

Children need to type entire English words from pictures instead of assembling letter tiles

## Acceptance Criteria

- [x] REALITY: effect=child types image word and receives feedback ; state=English vocabulary and form submission ; assumptions=browser keyboard input ; radius=English activities and PWA cache
- [x] Whole-word writing works in all categories and mixed practice
- [x] Wrong answers retry; correct answers advance; case and whitespace normalize
- [x] Purple color vocabulary is VIOLET
- [x] All tests and mobile browser checks pass

## Proof

## Work Log

### 2026-11-08T07:52:38.410Z - Contract before implementation in english/CONTRACT.md. New write mode has image, blank whole-word input, native form/Enter submission, uppercase input, whitespace/case normalization, colored retry/correct states, finite rounds/restart. VIOLET replaces PURPLE in vocabulary and mixed test oracle. Browser390px: WRONG red; rubber -> RUBBER then Enter green;63 routes render; mixed/write reload verified. Full40 tests pass. Independent review pending before authorized commit/push.

### 2026-11-08T07:53:47.292Z - Independent production-first review done: no blocking findings;40/40 pass;accept-all and old PURPLE vocabulary mutations turn tests red. Browser native Enter/mobile and63 routes verified. Report /tmp/math-whole-word-review.md. TEST-CHANGE: mixed color group expectation now VIOLET because user requested that classroom term; original PURPLE expectation no longer matches product vocabulary. Ready for authorized main commit and push.
