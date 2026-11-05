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
