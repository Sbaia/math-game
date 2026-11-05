---
id: 001-64ef
title: Subject navigation and hashbang routes
status: in_progress
priority: P2
type: feature
created: "2026-11-05T13:55:22.106Z"
updated: "2026-11-05T13:56:05.725Z"
dependencies: []
plan: plans/20261105-english-games.md
plan_step: Step 1
started_at: "2026-11-05T13:56:05.724Z"
---

# Subject navigation and hashbang routes

## Problem Statement

Children need subject selection and restorable activity links

## Acceptance Criteria

- [x] REALITY: effect=subject and activity restored from hash ; state=browser location ; assumptions=static hosting ; radius=navigation
- [x] Home offers subjects and Italian coming soon
- [x] Hash routes restore math and English activities and reject invalid routes
- [x] Existing math tests pass

## Proof

## Work Log

### 2026-11-05T13:56:05.793Z - Contract: browser hash drives subjects and activity views. Existing math functions are adapted at entry points. Baseline 5/5 and current navigation plus math 7/7 pass. No commits authorized.

### 2026-11-05T14:01:06.752Z - Browser smoke: 28 category/activity routes render at 390px without horizontal overflow; real hash history.back restores English and math/friends is active via direct route. Node tests 15/15 current pass. Commit explicitly withheld for user local QA.

### 2026-11-05T14:02:58.288Z - Implementation verified without commits: final15/15 tests pass; independent review Status done, no defects; browser28 routes at390px, history.back, math direct route, Italian placeholder and missing-letter wrong/correct flow verified. English voices loaded including Daniel/en-GB and explicit playback accepted; human listening and local approval remain pending. Formal committed proof/closure is intentionally pending because user prohibited commits.
