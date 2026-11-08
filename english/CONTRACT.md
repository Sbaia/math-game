# English module contract

REALITY: Children see uppercase Italian instructions and English vocabulary in seven finite games across four categories. The source of truth is the bundled vocabulary, with game state scoped to each render. All files load through classic scripts over file://; the only outside system is browser speech synthesis. This module writes only its container and cancels its own speech on stop.

- Public API: `window.EnglishApp.render(container, category, mode)`, `stop()`, `categories`, and `modes`. Category and mode arguments are IDs.
- Explore visits each vocabulary card. Recognition selects an image for a written English word. Memory pairs an image with its English word. Detective selects an English word using an Italian clue. Complete displays an image and a word with one missing letter (for example R_BBIT), then accepts the correct letter from clickable choices. Listen selects an image after explicit playback. Letters orders individually selectable letter tiles, preserving repeated letters and spaces.
- Every game offers retry feedback, explicit progression, and restart after a finite session. Memory retries with an explicit button, without delayed actions. Re-render and stop cancel speech and dispose listeners.
- Speech prefers en-GB, then any en voice. No English voice means visible Italian feedback and no utterance. Voice changes are observed. Playback requires a click and listen does not display or auto-speak the answer.
- Node boundary checks cover: missing/late English speech voices; correct and incorrect game answers; repeated letters; missing-letter choices and multiword gaps; memory completion; restart and stop isolation. Each test names its plausible failure.
- Assumption ledger: actual installed voices, audio output, SVG recognizability, and native touch/keyboard behavior require a browser check on the target device. Node speech doubles test the adapter policy, not the operating system's voice inventory.

## Verification

`node --test english/*.test.js`: 8 tests passed, 0 failed. `git diff --check -- english`: clean. All JavaScript files have fewer than 300 lines. Self-review checked no automatic speech, no English answer displayed in listen before solving, distinct selectable repeated letters, explicit memory mismatch retry, finite completion, and stale speech error suppression after cancellation.

The parent must verify visual layout, illustration recognition, physical keyboard/touch input, and actual English playback in the target browser. The Node DOM adapter does not claim browser integration coverage. No extra scripts are required beyond vocabulary.js, speech.js, and games.js in that order.

## Completion correction

The parent clarified that complete must select a missing letter, not enter a whole word. Before this change, the observable contract is: show P_N and four distinct letter choices; a wrong letter preserves the gap with retry feedback; E solves PEN; SCHOOL BAG keeps its word space. The existing round lifecycle owns finite progression and reset. This correction removes text entry and uses the same native buttons as the other games.

## Mixed practice
The English category menu shows a separate PROVA block below the four categories. Its English route is #!/english/mixed. All seven activities are available. Each new mixed session selects two random words from each category (eight words total), then shuffles them. Restart selects a new sample. This keeps memory to sixteen cards and ensures every category occurs in each practice session.

## Audio and answer feedback
The listen button appears above the picture choices. Correct answers show a green result panel and a check symbol; wrong answers show a red result panel and a cross. Selected choices have the same result color. Feedback resets on retry/new rounds and cannot be overwritten by a voice-ready notification after grading. Memory pairs and spelling modes use the same visible outcomes.
