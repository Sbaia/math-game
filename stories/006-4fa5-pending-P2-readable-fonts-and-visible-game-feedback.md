---
id: "006-4fa5"
title: "Readable fonts and visible game feedback"
status: pending
priority: P2
type: feature
created: 2026-11-07T14:10:01.929Z
updated: 2026-11-07T14:10:01.929Z
dependencies: []
---

# Readable fonts and visible game feedback

## Problem Statement

Mobile cursive text is hard to read and listen controls and grading outcomes need more visual prominence

## Acceptance Criteria

- [x] REALITY: effect=child sees top audio action and distinct grading states ; state=rendered game UI ; assumptions=native device font availability ; radius=all subject presentation and PWA cache
- [x] Standard sans-serif fonts apply to headings inputs and buttons
- [x] English audio action appears above picture choices and Italian audio is prominent
- [x] Correct and wrong results use green red symbols and selected option styling with retry reset
- [x] Full automated suite and mobile browser checks pass

## Proof

## Work Log

### 2026-11-07T14:10:15.955Z - Implemented locally.38 tests pass; existing English and Italian assertions now check wrong/correct/reset and late audio protection. Browser390px confirms top audio, colored result panels above choices, standard fonts; all58 routes render. Math wrong panel background rgb255224224 confirmed. Independent review Statusdone no regressions; /tmp/math-feedback-review.md. TEST-CHANGE: pwa-offline.test.js::activation cleanup — old v1 expectation wrong because version increments are valid releases; preserve own obsolete-cache and foreign-cache assertions independent of current version. No commit/push.
