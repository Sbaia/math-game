---
status: approved
approved_at: "2026-11-05T21:23:56.756Z"
updated: "2026-11-05T21:23:56.756Z"
---
# Feature: Italian spelling games
Date: 2026-11-05
Status: Approved for implementation

## Decision
Add Italian games for a child in second grade. Start with difficult sounds (CHE/CHI, GHE/GHI, GN, GLI, SCE/SCI), double consonants, and written accents. Provide completion, spelling choice, and dictation. Add a separate mixed PROVA block. Use uppercase learning text and English hashbang IDs.

## Architecture Context
- navigation.js adapts existing math and English entry points.
- italian/ owns vocabulary, speech, game sessions, and styles.
- Classic scripts load directly on file URLs and static hosting.
- ItalianApp has the same menu/render/stop boundary as EnglishApp.
- Speech uses it-IT then another Italian voice; never use a foreign voice.

## Research
- Existing browser speech adapter uses voice enumeration and voiceschanged.
- Speak whole words; isolated letter groups are not a reliable teaching prompt.
- Voice quality and audible accent distinctions require device listening.

## Security
- Fixed local vocabulary; no account, secrets, microphone or user data storage.

## Performance
- Finite eight-word rounds, mixed six-word rounds with two words from each category.
- Cancel speech and detach listeners on navigation/restart.

## Steps
### Step 1: Italian game sessions
- Contract: children complete missing letter groups, choose correct spelling using a picture/clue, and type dictated whole words.
- Implement italian/vocabulary.js, speech.js, games.js, italian.css.
- Curate at least eight words per category, with strict written accents.
- Dictation has explicit playback, replay, accented vowel buttons and a hint after a wrong attempt.
- Test at public render boundary: wrong/correct answers, normalization, accents, mixed sampling, restart, stale speech and stop.
- Validation: node --test italian/*.test.js.

### Step 2: Navigation and integration
- Replace Italian placeholder with category and mode menus.
- Routes: #!/italian/sounds/complete, #!/italian/doubles/recognize, #!/italian/accents/dictation, #!/italian/mixed.
- Reject invalid routes; preserve math and English behavior; stop both language sessions on navigation.
- Validation: full Node suite and real browser desktop/mobile, reload, history and voice inventory.

## Acceptance Criteria
- [x] Three categories and separate mixed PROVA are available.
- [x] Three games provide feedback, retry, next and restart.
- [x] Accents are checked and accented input is easy on touch screens.
- [x] Dictation requires Italian audio, with clear unavailable/error feedback.
- [x] English hashbang routes support reload and browser history.
- [x] Existing math and English tests pass.
- [ ] Local visual and pronunciation check remains available to the user.

## Verification
- Full automated suite: 26 passed, 0 failed.
- Browser: 12 Italian routes at 390px, no horizontal overflow, history back, English mixed memory regression checked.
- Real dictation: PIÙ, Alice voice it-IT, audio completion observed. PIU rejected; accented vowel button produces accepted PIÙ.
- Target-device human listening remains pending. No commit or push for this feature.
