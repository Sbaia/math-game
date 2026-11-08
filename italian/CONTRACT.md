# Italian module contract

Before implementation: expose `window.ItalianApp.categories`, `modes`, `render(container, category, mode)`, and `stop()` through classic scripts. Load vocabulary.js, speech.js, games.js, italian.css in that order.

Categories: sounds, doubles, accents, mixed. Modes: complete, recognize, dictation. Each normal session samples eight words from its source pool (sounds includes nine, with GN and GNI); mixed has two from each source category (six rounds). A wrong answer permits retry and next; a correct answer permits next. Finish shows score and restart. All visible language is uppercase Italian.

Completion masks the curated spelling group. Recognition uses a precise Italian definition and plausible spelling distractors. Dictation requires a successful Italian audio request before answers are accepted, offers replay and accented vowel keys, and reveals the word only after submission. Normalize input with trim, NFC, and Italian uppercase; do not remove accents. Audio uses it-IT then another Italian voice, never another language. Voice discovery updates after voiceschanged. New playback, round, render, and stop invalidate stale speech callbacks.

REALITY: effect=rendered questions, feedback, score, and Italian whole-word audio; state=curated vocabulary and user button/input events; assumptions=browser DOM and Web Speech support, actual Italian voice availability on target browser/OS requires parent browser QA; radius=italian/ only, global ItalianApp and ItalianSpeech, speech synthesis cancellation shared with other modules during lifecycle transitions.

Behavior cases: correct/wrong in each mode; lowercase and NFC accepted but missing accents rejected; dictation requires audio and cannot leak the secret in DOM before answer; unavailable voices give clear feedback; stale audio errors cannot alter a later round; mixed balances categories; eight/six rounds finish and restart; stop removes voice listeners and cancels audio.

Tests use a small DOM and speech adapter harness. They check rendered user behavior through the public API; browser layout and real voice playback remain explicit parent QA checks. No test-only production exports.

Self-review: production reviewed for spelling, Latin-only distractors, answer secrecy, finite lifecycle, replay races, strict accents, and whole-word-only audio. The test harness is an assumption about browser adapters, not a recorded browser fixture; parent owns real browser/voice QA. All nine tests are useful boundary tests with named plausible bugs; no private seams were added.

## Visible answer feedback
Correct and wrong answers have distinct green/red panels with symbols and colored selected choices or dictation input. Retry clears the previous result. Audio is a prominent control above the input. Existing grading, hints, and score rules do not change.
