const test = require('node:test');
const assert = require('node:assert/strict');
const { parse } = require('./navigation');
const route = hash => parse(hash, ['colors', 'school', 'animals', 'toys', 'mixed'], ['explore', 'recognize', 'memory', 'detective', 'complete', 'listen', 'letters', 'write']);
// Catches: deep activity links incorrectly treated as category menus.
test('deep links preserve English activity and existing math selection', () => {
  assert.deepEqual(route('#!/english/animals/listen'), {subject:'english', category:'animals', mode:'listen'});
  assert.deepEqual(route('#!/math/friends'), {subject:'math', game:'friends'});
  assert.deepEqual(route('#!/english/mixed/write'), {subject:'english', category:'mixed', mode:'write'});
  assert.deepEqual(route('#!/italian'), {subject:'italian'});
});
// Catches: malformed routes enter undefined game functions.
test('unknown subjects categories games and extra segments return home', () => {
  for (const hash of ['#!/french', '#!/english/food', '#!/math/nope', '#!/english/animals/listen/extra', '#!/italian/foo']) assert.deepEqual(route(hash), {subject:'home'});
});

// Catches: Italian deep links still routed to the old placeholder or accepting foreign modes.
test('Italian routes preserve spelling categories and reject unsupported activities', () => {
  assert.deepEqual(route('#!/italian/accents/dictation'), {subject:'italian', category:'accents', mode:'dictation'});
  assert.deepEqual(route('#!/italian/mixed/complete'), {subject:'italian', category:'mixed', mode:'complete'});
  for (const hash of ['#!/italian/unknown', '#!/italian/sounds/listen', '#!/italian/doubles/complete/extra']) assert.deepEqual(route(hash), {subject:'home'});
});
