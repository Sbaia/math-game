---
status: in_progress
approved_at: "2026-11-05T13:55:22.107Z"
updated: "2026-11-05T13:56:05.741Z"
started_at: "2026-11-05T13:56:05.741Z"
---
# Feature: School subjects and English vocabulary
Date: 2026-11-05
Status: Approved for local implementation; no commits

## Problem
The application has math games only. Add English vocabulary activities for a seven-year-old child.

## Decision
Keep existing math rules. Add subject selection, Italian coming soon, and English categories. Use uppercase learning text, Italian clues, and English hashbang paths. Use browser speech with an English voice only. No dependencies, accounts, remote API keys, or build step.

## Architecture Context
- index.html contains existing math views and functions, verified by friends.test.js.
- navigation.js adapts existing math entry points and renders subject/category menus.
- english/ contains vocabulary, pictures, speech, game sessions, and styles.
- Scripts load directly and work on static hosting and file URLs.
- Hash changes drive navigation and cancel the previous English session.

## Research
- Browser speech supports voice enumeration, language selection, and voiceschanged (MDN, verified during discussion).
- English voice quality and availability depend on the device; report missing support.

## Security
- Static trusted vocabulary only; no user data collection or remote credentials.

## Performance
- Small fixed vocabulary and short rounds; cancel audio and timers on navigation.

## Steps
### Step 1: Subject navigation
- Contract: direct links, reload, back and forward restore the selected subject, category, and activity.
- Implement: navigation.js, index.html integration, navigation tests.
- Paths: #!/, #!/math, #!/math/<game>, #!/english/<category>/<activity>, #!/italian.
- Invalid routes return home safely. Existing math rules remain unchanged.
- Validation: node --test friends.test.js navigation.test.js.

### Step 2: English learning activities
- Contract: all 34 requested words are available in four categories; uppercase text and Italian clues.
- Implement: explore, recognize, memory, detective, complete, listen, letters in english/.
- Correct spelling: SKATEBOARD. Keep school vocabulary in British English.
- Wrong answers allow retry; correct answers advance through a finite round; restart resets state.
- Validation: node --test english/*.test.js; local browser checks for layout and interaction.

### Step 3: Speech and integration verification
- Contract: explicit playback uses English voices only; unavailable audio has visible feedback.
- Verify mobile and desktop, deep links, history, all game entry points, repeated letters and multiword vocabulary.
- Validation: whole node test suite and browser smoke tests. Device pronunciation needs human listening.

## Acceptance Criteria
- [x] Home offers math, English, Italian coming soon.
- [x] English hashbang paths survive reload/history.
- [x] Existing math tests pass.
- [x] Four vocabulary categories and seven activities work.
- [x] New learning UI is uppercase and detective clues are Italian.
- [x] Audio uses English voice or reports unavailability.
- [x] No commits; local user testing remains pending.

## Verification
- Final automated suite: 15 passed, 0 failed.
- Independent review: Status done; no production defects. Report: /tmp/math-english-review.md.
- Real browser: all 28 category/activity routes at 390px without horizontal overflow, history back, math direct route, Italian placeholder, missing-letter retry/correct answer.
- Speech voices loaded after initial empty list; English playback accepted. Human listening remains pending.
- No commits. Story worklogs contain evidence; formal committed proof and closure wait for local user approval.
