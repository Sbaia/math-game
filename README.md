# Learn and Play!

Math games and English vocabulary activities for primary school children, built with plain HTML, CSS, and JavaScript. No dependencies are required.

## Games

1. **Addition/Subtraction Table** — Fill in a 5 × 4 table.
2. **Missing Number** — Find the hidden operand (`5 + ? = 8`).
3. **Count and Write** — Count the objects and write the number.
4. **Greater, Less, or Equal?** — Compare two numbers.
5. **Number Friends** — Find pairs that add up to a random number from 3 to 10. Each new game picks a new target.
6. **Complete Number Friends** — Fill in matching numbers for a random target from 3 to 10, with rows in random order.
7. **Sequences** — Complete ascending or descending number sequences.
8. **Even or Odd?** — Classify numbers as even or odd.
9. **Before and After** — Write the previous and next number.
10. **Story Problems** — Solve short illustrated problems.
11. **Guess the Number** — Deduce a number from 1 to 20.

## Play

Open `index.html` in a browser. You can also play the [online version](https://sbaia.github.io/math-game/).

## Features

- Colorful design for children, with emoji and confetti.
- Immediate feedback with stars and crosses.
- Enter key navigation.
- Responsive layout for tablets and phones.
- No dependencies or build step.

## School subjects and English

The start page offers math, English, and Italian. English activities use uppercase text and Italian instructions. Choose colors, school objects, animals, or toys, then explore, recognize pictures, play memory, solve clues, complete words, listen and touch, or arrange letters.

Routes use English hashbang paths, for example `#!/math/friends` and `#!/english/animals/listen`. Reload and browser history preserve the selected activity. A new visit to an activity starts a new round.

Speech uses an English voice from the browser, with British English preferred. Voice availability and quality depend on the device. Some voices require a connection. The game reports unavailable audio instead of using an Italian voice.

For a local check, open `index.html` in a browser. Run automated checks with `node --test friends.test.js navigation.test.js english/*.test.js`.

## Italian spelling

Italian activities cover difficult sounds (CHE/CHI, GHE/GHI, GN, GLI, SCE/SCI), double consonants, and written accents. Choose COMPLETA, SCEGLI LA PAROLA, or DETTATO. PROVA mixes the categories. Dictation uses whole words, replay, and accented vowel buttons; written accents are checked.

Italian routes include `#!/italian/sounds/complete` and `#!/italian/accents/dictation`. Audio requires an Italian device voice; unavailable voices produce a visible message. Human listening on the target device remains part of pronunciation validation.

Run all checks with `node --test friends.test.js navigation.test.js english/*.test.js italian/*.test.js`.

## Installable PWA

The app includes a manifest, home-screen icons and a service worker. Host the repository contents over HTTPS. GitHub Pages can serve this app at `https://sbaia.github.io/math-game/`; all installation and offline paths are relative to that project directory. No build step is needed.

On Android, open the HTTPS address in Chrome. Use INSTALLA APP when offered, or the browser menu's installation option. Browser support and the installation prompt depend on the device. The installed app opens without the normal browser toolbar. Direct `file://` launch still supports the games but cannot prepare offline installation.

Open the app online once and wait for PRONTO PER GIOCARE ANCHE OFFLINE. Then the cached math, English and Italian games can open offline. Speech voices are supplied by the device or its provider: audio may still need a connection. Test Italian and English dictation on the target Android device, with the desired voices installed, before relying on offline audio.

### Publish and update

1. Publish the repository root through the existing GitHub Pages setup, including `manifest.webmanifest`, `sw.js`, `pwa.js`, `pwa.css` and `icons/`.
2. Check the HTTPS URL on Android and install the app from Chrome.
3. On each release that changes a cached file, increase the version in `sw.js`. Add any new runtime assets to its precache list.
4. Deploy all files together. A new version downloads in the background. AGGIORNA E RIAPRI applies it when the user chooses; this restarts the current game and preserves its hash route.
5. Keep the manifest `id`, deployment scope and start path stable so updates keep the same installed identity.

The service worker caches only known files within this app's scope and preserves other applications' caches on the same origin. No microphone, tracking or extra account is added. A Google Play package is a separate future step, using the published PWA with Trusted Web Activity/Bubblewrap and the required store declarations.

Run all checks with `node --test friends.test.js navigation.test.js english/*.test.js italian/*.test.js pwa-*.test.js`.

English also includes SCRIVI LA PAROLA (`#!/english/school/write`): type the entire English word from the picture, then press CONTROLLA or Enter. This activity supports every category and mixed practice. Colors use VIOLET for VIOLA.
