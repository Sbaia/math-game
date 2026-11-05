const test = require('node:test');
const assert = require('node:assert/strict');
const { parse } = require('./navigation');
const route = hash => parse(hash, ['colors', 'school', 'animals', 'toys'], ['explore', 'recognize', 'memory', 'detective', 'complete', 'listen', 'letters']);
// Catches: deep activity links incorrectly treated as category menus.
test('deep links preserve English activity and existing math selection', () => {
  assert.deepEqual(route('#!/english/animals/listen'), {subject:'english', category:'animals', mode:'listen'});
  assert.deepEqual(route('#!/math/friends'), {subject:'math', game:'friends'});
  assert.deepEqual(route('#!/italian'), {subject:'italian'});
});
// Catches: malformed routes enter undefined game functions.
test('unknown subjects categories games and extra segments return home', () => {
  for (const hash of ['#!/french', '#!/english/food', '#!/math/nope', '#!/english/animals/listen/extra', '#!/italian/foo']) assert.deepEqual(route(hash), {subject:'home'});
});
