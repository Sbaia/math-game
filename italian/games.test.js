const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.events = {}; this.text = ''; this.value = ''; this.selectionStart = 0; this.selectionEnd = 0; }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return this.text + this.children.map(c => c.textContent).join(' '); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren() { this.children = []; this.text = ''; }
  addEventListener(type, cb) { this.events[type] = cb; }
  setAttribute() {}
  focus() {}
  setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; }
  fire(type) { if (this.events[type]) this.events[type]({ preventDefault() {} }); }
}
function setup(voices = [{ lang: 'it-IT' }]) {
  const listeners = new Set();
  const spoken = [];
  let cancellations = 0;
  const synth = { getVoices: () => voices, cancel: () => cancellations++, speak: u => spoken.push(u), addEventListener: (_, cb) => listeners.add(cb), removeEventListener: (_, cb) => listeners.delete(cb) };
  const context = vm.createContext({ document: { createElement: tag => new Element(tag) }, speechSynthesis: synth, SpeechSynthesisUtterance: function (text) { this.text = text; }, Math: Object.assign(Object.create(Math), { random: () => 0.999 }) });
  for (const file of ['vocabulary.js', 'speech.js', 'games.js']) vm.runInContext(fs.readFileSync(__dirname + '/' + file, 'utf8'), context);
  const container = new Element('main');
  function all(tag, el = container) { return el.children.flatMap(c => [ ...(c.tagName === tag ? [c] : []), ...all(tag, c) ]); }
  function click(label) { const el = all('button').find(b => b.textContent === label); assert.ok(el, 'BUTTON ' + label + ' IN ' + container.textContent); el.fire('click'); }
  function submit(value) { all('input')[0].value = value; all('form')[0].fire('submit'); }
  return { context, container, all, click, submit, spoken, voices, listeners, get cancellations() { return cancellations; }, render: (category, mode) => context.ItalianApp.render(container, category, mode) };
}
// Catches: accepting every completion or spelling choice without checking the chosen value.
test('completion and recognition reject wrong choices and accept correct retries', () => {
  for (const [mode, wrong, correct] of [['complete', 'CE', 'CHE'], ['recognize', 'FORCETTA', 'FORCHETTA']]) {
    const h = setup(); h.render('sounds', mode);
    h.click(wrong); assert.match(h.container.textContent, /RIPROVA! LA PAROLA È FORCHETTA/);
    h.click('RIPROVA'); h.click(correct); assert.match(h.container.textContent, /ESATTO! FORCHETTA/);
    h.click('AVANTI'); assert.match(h.container.textContent, /PAROLA 2 DI 8 · PUNTI: 1/);
  }
});
// Catches: stripping accents, rejecting lowercase, or comparing decomposed Unicode literally.
test('dictation accepts lowercase NFC equivalents but rejects an unaccented word', () => {
  const h = setup(); h.render('accents', 'dictation');
  assert.doesNotMatch(h.container.textContent, /CITTÀ/);
  h.click('🔊 ASCOLTA'); assert.equal(h.spoken[0].text, 'CITTÀ'); h.spoken[0].onend();
  h.submit('citta'); assert.match(h.container.textContent, /RIPROVA! LA PAROLA È CITTÀ/);
  h.click('RIPROVA'); h.click('🔊 ASCOLTA'); h.spoken[1].onend();
  h.submit(' citta\u0300 '); assert.match(h.container.textContent, /ESATTO! CITTÀ/);
  h.click('AVANTI'); h.click('🔊 ASCOLTA'); h.spoken[2].onend(); h.submit('caffè');
  assert.match(h.container.textContent, /ESATTO! CAFFÈ/);
});
// Catches: enabling answers on click even if audio has not completed or failed.
test('dictation requires completed audio and offers accented input buttons', () => {
  const h = setup(); h.render('accents', 'dictation');
  h.submit('CITTÀ'); assert.match(h.container.textContent, /PRIMA ASCOLTA/); assert.doesNotMatch(h.container.textContent, /ESATTO|LA PAROLA È/);
  h.click('🔊 ASCOLTA'); h.submit('CITTÀ'); assert.match(h.container.textContent, /PRIMA ASCOLTA/);
  h.spoken[0].onerror(); assert.match(h.container.textContent, /AUDIO NON RIUSCITO/);
  h.all('input')[0].value = '';
  for (const letter of ['À', 'È', 'É', 'Ì', 'Ò', 'Ù']) h.click(letter);
  assert.equal(h.all('input')[0].value, 'ÀÈÉÌÒÙ');
});
// Catches: falling back to English or failing to refresh asynchronously loaded Italian voices.
test('dictation reports missing Italian voice and recovers after voiceschanged', () => {
  const h = setup([{ lang: 'en-US' }]); h.render('sounds', 'dictation'); h.click('🔊 ASCOLTA');
  assert.equal(h.spoken.length, 0); assert.match(h.container.textContent, /VOCE ITALIANA NON DISPONIBILE/);
  h.voices.push({ lang: 'it-CH' }, { lang: 'it-IT' }); h.listeners.forEach(cb => cb());
  assert.match(h.container.textContent, /AUDIO ITALIANO PRONTO/);
  h.click('🔊 ASCOLTA'); assert.equal(h.spoken[0].lang, 'it-IT');
  h.spoken[0].onend(); h.submit('forchetta'); assert.match(h.container.textContent, /ESATTO/);
});
// Catches: stale callbacks overwriting a new question or stop leaving voice listeners active.
test('replay, round change and stop invalidate stale audio callbacks', () => {
  const h = setup(); h.render('sounds', 'dictation'); h.click('🔊 ASCOLTA'); const old = h.spoken[0];
  h.click('🔊 ASCOLTA'); old.onerror(); old.onend(); h.submit('FORCHETTA');
  assert.match(h.container.textContent, /PRIMA ASCOLTA/);
  h.spoken[1].onend(); h.submit('FORCHETTA'); h.click('AVANTI'); old.onerror();
  assert.doesNotMatch(h.container.textContent, /AUDIO NON RIUSCITO/);
  h.click('🔊 ASCOLTA'); const pending = h.spoken[2];
  const before = h.cancellations; h.context.ItalianApp.stop(); pending.onerror(); pending.onend();
  assert.equal(h.container.textContent, ''); assert.equal(h.listeners.size, 0); assert.ok(h.cancellations > before);
});
// Catches: mixed mode using one source bank, including memory, or continuing past six rounds.
test('mixed samples two per source and completes six rounds then restarts', () => {
  const h = setup(); h.render('mixed', 'dictation');
  const expected = ['FORCHETTA', 'CHIAVE', 'GATTO', 'PALLA', 'CITTÀ', 'CAFFÈ'];
  for (let i = 0; i < expected.length; i++) {
    assert.match(h.container.textContent, new RegExp('PAROLA ' + (i + 1) + ' DI 6'));
    h.click('🔊 ASCOLTA'); const u = h.spoken.at(-1); assert.equal(u.text, expected[i]); u.onend(); h.submit(expected[i]);
    h.click(i === 5 ? 'RISULTATO' : 'AVANTI');
  }
  assert.match(h.container.textContent, /PUNTI: 6 \/ 6/); h.click('RICOMINCIA');
  assert.match(h.container.textContent, /PAROLA 1 DI 6 · PUNTI: 0/);
});
// Catches: off-by-one regular round count, accidental score inflation, or failure to retire the previous render.
test('regular category finishes eight rounds and a new render retires old controls', () => {
  const h = setup(); h.render('doubles', 'recognize'); const old = h.all('button')[0];
  for (const [i, word] of ['GATTO', 'PALLA', 'PENNA', 'TETTO', 'MUCCA', 'NONNO', 'TAZZA', 'CAPPELLO'].entries()) {
    h.click(word); h.click(i === 7 ? 'RISULTATO' : 'AVANTI');
  }
  assert.match(h.container.textContent, /PUNTI: 8 \/ 8/);
  h.render('accents', 'complete'); old.fire('click');
  assert.match(h.container.textContent, /CITT___/); assert.doesNotMatch(h.container.textContent, /ESATTO/);
});
// Catches: relying on it-IT only, letting failed audio authorize submission, or leaving typed text lowercase.
test('regional Italian audio and uppercase typing work while failed playback stays locked', () => {
  const h = setup([{ lang: 'it-CH' }]); h.render('sounds', 'dictation');
  const input = h.all('input')[0]; input.value = 'forchetta'; input.fire('input');
  assert.equal(input.value, 'FORCHETTA');
  h.click('🔊 ASCOLTA'); assert.equal(h.spoken[0].lang, 'it-CH');
  h.spoken[0].onerror(); h.spoken[0].onend(); h.submit('FORCHETTA');
  assert.match(h.container.textContent, /PRIMA ASCOLTA/);
  h.click('🔊 ASCOLTA'); h.spoken[1].onend(); h.submit('FORCHETTA');
  assert.match(h.container.textContent, /ESATTO! FORCHETTA/);
});
// Catches: crashing in browsers without synthesis or swallowing a thrown synthesis error.
test('absent or throwing synthesis gives actionable feedback without revealing the word', () => {
  const h = setup(); h.context.speechSynthesis = undefined; h.render('sounds', 'dictation');
  h.click('🔊 ASCOLTA'); assert.match(h.container.textContent, /VOCE ITALIANA NON DISPONIBILE/);
  assert.doesNotMatch(h.container.textContent, /FORCHETTA/);
  const other = setup(); other.context.speechSynthesis.speak = () => { throw new Error('unavailable'); };
  other.render('sounds', 'dictation'); other.click('🔊 ASCOLTA');
  assert.match(other.container.textContent, /AUDIO NON RIUSCITO/);
  other.submit('FORCHETTA'); assert.match(other.container.textContent, /PRIMA ASCOLTA/);
});
