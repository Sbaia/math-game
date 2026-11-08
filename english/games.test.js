const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Small DOM adapter: assertions inspect rendered text and exercise native event callbacks.
// Browser layout, actual SVG recognition, and OS speech remain in the contract ledger.
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this._text = ''; this.disabled = false; this.value = ''; }
  set textContent(value) { this._text = value; this.children = []; }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
  set innerHTML(value) { this._html = value; this.children = []; this._text = ''; }
  append(...children) { children.forEach(child => { child.parent = this; this.children.push(child); }); }
  replaceChildren(...children) { this.children = []; this._text = ''; this.append(...children); }
  setAttribute(key, value) { this.attributes[key] = value; }
  get lastChild() { return this.children.at(-1); }
  remove() { this.parent.children = this.parent.children.filter(c => c !== this); }
  querySelectorAll(selector) {
    const tags = selector.split(',').map(s => s.trim());
    return this.children.flatMap(c => [...(tags.includes(c.tagName) ? [c] : []), ...c.querySelectorAll(selector)]);
  }
  click() { if (!this.disabled && this.onclick) this.onclick(); }
}
function setup() {
  const spoken = [];
  const events = {};
  const state = { voices: [{lang:'en-US'}, {lang:'en-GB'}], cancels:0 };
  const context = vm.createContext({
    document: {createElement: tag => new Element(tag)}, Math: Object.assign(Object.create(Math), {random:() => .99999}),
    speechSynthesis: {
      getVoices: () => state.voices,
      addEventListener: (event, callback) => { events[event] = callback; },
      removeEventListener: event => { delete events[event]; },
      cancel: () => { state.cancels++; }, speak: utterance => spoken.push(utterance)
    }, SpeechSynthesisUtterance: function (text) { this.text = text; }
  });
  ['vocabulary.js','speech.js','games.js'].forEach(file => vm.runInContext(fs.readFileSync(__dirname + '/' + file, 'utf8'), context));
  const container = new Element('main');
  return {app:context.EnglishApp, context, container, spoken, state, events};
}
const buttons = container => container.querySelectorAll('button');
function press(container, text) {
  const target = buttons(container).find(b => b.textContent === text);
  assert.ok(target, 'MISSING BUTTON: ' + text); target.click();
}
const byClass = (container, name) => {
  const all = [];
  function visit(el) { if (el.className === name) all.push(el); el.children.forEach(visit); }
  visit(container); return all;
};

// Catches: silently choosing an Italian voice when no English voice exists.
test('speech without English voices refuses playback, then uses a late British voice', () => {
  const f = setup(); f.state.voices = [{lang:'it-IT'}];
  const feedback = [];
  const speech = f.context.EnglishSpeech(() => {});
  assert.equal(speech.speak('PINK', value => feedback.push(value)), false);
  assert.equal(f.spoken.length, 0);
  assert.match(feedback[0], /AUDIO INGLESE NON DISPONIBILE/);
  f.state.voices = [{lang:'en-US'}, {lang:'en-GB'}, {lang:'it-IT'}]; f.events.voiceschanged();
  speech.speak('PINK', value => feedback.push(value));
  assert.equal(f.spoken[0].voice.lang, 'en-GB');
  f.state.voices = [{lang:'en-AU'}]; f.events.voiceschanged();
  speech.speak('RED', value => feedback.push(value));
  assert.equal(f.spoken[1].voice.lang, 'en-AU');
  speech.stop(); assert.equal(speech.speak('GREEN', () => {}), false);
  assert.equal(f.spoken.length, 2);
});

// Catches: grading before explicit playback or revealing the written answer in listen.
test('listen hides the word, requires playback, and retries wrong selections', () => {
  const f = setup(); f.app.render(f.container, 'colors', 'listen');
  assert.equal(f.container.textContent.includes('PINK'), false); assert.equal(f.spoken.length, 0);
  const choices = byClass(f.container, 'en-choice'); choices[0].click();
  assert.match(f.container.textContent, /PREMI PRIMA ASCOLTA/);
  press(f.container, '🔊 ASCOLTA / RIASCOLTA'); assert.equal(f.spoken[0].text, 'PINK');
  choices[1].click(); assert.match(f.container.textContent, /QUASI/);
  assert.equal(byClass(f.container, 'en-feedback')[0].attributes['data-result'], 'wrong');
  assert.equal(choices[1].attributes['data-result'], 'wrong');
  choices[0].click(); assert.match(f.container.textContent, /ESATTO/);
  assert.equal(byClass(f.container, 'en-feedback')[0].attributes['data-result'], 'correct');
  assert.equal(choices[0].attributes['data-result'], 'correct');
  f.spoken[0].onerror(); assert.match(f.container.textContent, /ESATTO/);
  press(f.container, 'AVANTI →'); assert.equal(f.container.textContent.includes('RED'), false);
  assert.equal(byClass(f.container, 'en-feedback')[0].attributes['data-result'], 'info');
});

// Catches: revealing the complete answer or accepting a wrong letter in the gap.
test('complete displays a missing-letter word and retries while preserving multiword spaces', () => {
  const f = setup(); f.app.render(f.container, 'school', 'complete');
  assert.equal(byClass(f.container, 'en-vocabulary')[0].textContent, 'P_N');
  assert.equal(f.container.querySelectorAll('input').length, 0);
  const options = byClass(f.container, 'en-letter');
  assert.equal(new Set(options.map(el => el.textContent)).size, 4);
  options.find(el => el.textContent !== 'E').click();
  assert.match(f.container.textContent, /QUASI/);
  assert.equal(byClass(f.container, 'en-vocabulary')[0].textContent, 'P_N');
  press(f.container, 'E'); assert.match(f.container.textContent, /ESATTO! 🌟 PEN/);
  press(f.container, 'AVANTI →');
  assert.equal(byClass(f.container, 'en-vocabulary')[0].textContent, 'S_HOOL BAG');
  press(f.container, 'C'); assert.match(f.container.textContent, /ESATTO! 🌟 SCHOOL BAG/);
  press(f.container, 'RICOMINCIA');
  assert.equal(byClass(f.container, 'en-vocabulary')[0].textContent, 'P_N');
  f.app.render(f.container, 'animals', 'complete');
  press(f.container, 'R'); press(f.container, 'AVANTI →');
  press(f.container, 'I'); press(f.container, 'AVANTI →');
  assert.equal(byClass(f.container, 'en-vocabulary')[0].textContent, 'R_BBIT');
  press(f.container, 'A'); assert.match(f.container.textContent, /ESATTO! 🌟 RABBIT/);
});

// Catches: consuming all identical letters together or requiring a space tile in multiword answers.
test('letters preserves repeated tiles, undo, clear, and multiword gaps', () => {
  const f = setup(); f.app.render(f.container, 'school', 'letters');
  function spell(word) {
    for (const char of word.replace(/ /g, '')) {
      const tile = byClass(f.container, 'en-letter').find(b => b.textContent === char && !b.disabled);
      assert.ok(tile, 'MISSING LETTER ' + char); tile.click();
    }
  }
  spell('PEN'); press(f.container, 'AVANTI →');
  assert.match(byClass(f.container, 'en-letter-result')[0].textContent, /\//);
  spell('SCHOOL BAG'); assert.match(f.container.textContent, /ESATTO! 🌟 SCHOOL BAG/);
  press(f.container, 'AVANTI →'); spell('PENCIL'); press(f.container, 'AVANTI →');
  const firstR = byClass(f.container, 'en-letter').find(b => b.textContent === 'R'); firstR.click();
  assert.equal(byClass(f.container, 'en-letter').filter(b => b.textContent === 'R' && !b.disabled).length, 1);
  press(f.container, 'ANNULLA LETTERA'); assert.equal(firstR.disabled, false);
  firstR.click(); press(f.container, 'CANCELLA TUTTO'); assert.equal(firstR.disabled, false);
  spell('RUBBER'); assert.match(f.container.textContent, /ESATTO! 🌟 RUBBER/);
});

// Catches: incorrect recognition/clue mapping, infinite rounds, or a restart retaining solved state.
test('recognition and detective solve all rounds and restart at the beginning', () => {
  for (const mode of ['recognize', 'detective']) {
    const f = setup(); f.app.render(f.container, 'animals', mode);
    byClass(f.container, 'en-choice')[1].click(); assert.match(f.container.textContent, /QUASI/);
    for (let n = 0; n < 8; n++) {
      byClass(f.container, 'en-choice')[0].click(); assert.match(f.container.textContent, /ESATTO/);
      press(f.container, n === 7 ? 'TERMINA' : 'AVANTI →');
    }
    assert.match(f.container.textContent, /GIOCO COMPLETATO/);
    press(f.container, 'RICOMINCIA'); assert.match(f.container.textContent, /1 \/ 8/);
    assert.equal(byClass(f.container, 'en-choice')[0].disabled, false);
  }
});

// Catches: matching two different cards or leaving mismatch locks after restart.
test('memory retries a mismatch, finishes all bilingual pairs, and restarts', () => {
  const f = setup(); f.app.render(f.container, 'toys', 'memory');
  let tiles = byClass(f.container, 'en-memory-card'); tiles[0].click(); tiles[2].click();
  assert.match(f.container.textContent, /NON È LA COPPIA/); press(f.container, 'RIPROVA');
  assert.equal(tiles[0].textContent, '?');
  tiles[0].click(); press(f.container, 'RICOMINCIA'); tiles = byClass(f.container, 'en-memory-card');
  for (let n = 0; n < 16; n += 2) { tiles[n].click(); tiles[n + 1].click(); }
  assert.match(f.container.textContent, /GIOCO COMPLETATO/);
  press(f.container, 'RICOMINCIA'); assert.match(f.container.textContent, /0 \/ 8 COPPIE/);
});

// Catches: stale controls or speech changing a new game after stop/re-render.
test('explore ends and stop isolates old controls from the next render', () => {
  const f = setup(); f.app.render(f.container, 'colors', 'explore');
  const stale = buttons(f.container).find(b => b.textContent === '🔊 ASCOLTA');
  for (let n = 0; n < 10; n++) press(f.container, n === 9 ? 'TERMINA' : 'AVANTI →');
  assert.match(f.container.textContent, /GIOCO COMPLETATO/);
  f.app.render(f.container, 'school', 'listen'); stale.click(); assert.equal(f.spoken.length, 0);
  f.app.stop(); press(f.container, '🔊 ASCOLTA / RIASCOLTA'); assert.equal(f.spoken.length, 0);
  assert.equal(f.events.voiceschanged, undefined);
});

// Catches: an error from cancelled audio overwriting feedback for a newer round.
test('cancelled utterances cannot publish stale failures and missing APIs give feedback', () => {
  const f = setup();
  const messages = [];
  const speech = f.context.EnglishSpeech(() => {});
  speech.speak('PEN', text => messages.push(text));
  const previous = f.spoken[0]; speech.cancel();
  previous.onerror(); assert.deepEqual(messages, []);
  speech.speak('BOOK', text => messages.push(text));
  f.spoken[1].onerror(); assert.match(messages[0], /AUDIO NON RIUSCITO/);
  speech.stop();
  f.context.speechSynthesis = undefined;
  const unsupported = f.context.EnglishSpeech(() => {});
  assert.equal(unsupported.speak('PEN', text => messages.push(text)), false);
  assert.match(messages[1], /AUDIO INGLESE NON DISPONIBILE/);
  f.context.SpeechSynthesisUtterance = undefined;
  assert.equal(unsupported.available(), false);
});

// Catches: mixed practice silently using one category or all 34 memory pairs.
test('mixed practice includes two words per category and keeps memory to sixteen cards', () => {
  const f = setup(); f.app.render(f.container, 'mixed', 'explore');
  const groups = [new Set(['PINK','RED','GREEN','BROWN','BLUE','YELLOW','VIOLET','BLACK','ORANGE','WHITE']), new Set(['PEN','SCHOOL BAG','PENCIL','RUBBER','BOOK','RULER','PENCIL CASE','SHARPENER']), new Set(['FROG','BIRD','RABBIT','TORTOISE','FISH','DOG','CAT','HAMSTER']), new Set(['CARDS','DOLL','VIDEOGAME','PLANE','BALL','CAR','SKATEBOARD','BIKE'])];
  const seen = [];
  for (let n = 0; n < 8; n++) {
    seen.push(byClass(f.container, 'en-vocabulary')[0].textContent);
    press(f.container, n === 7 ? 'TERMINA' : 'AVANTI →');
  }
  assert.match(f.container.textContent, /GIOCO COMPLETATO/);
  assert.equal(new Set(seen).size, 8);
  assert.deepEqual(groups.map(group => seen.filter(word => group.has(word)).length), [2,2,2,2]);
  press(f.container, 'RICOMINCIA'); assert.match(f.container.textContent, /1 \/ 8/);
  f.app.render(f.container, 'mixed', 'memory');
  assert.equal(byClass(f.container, 'en-memory-card').length, 16);
});

// Catches: showing letter tiles/the answer or accepting misspelled whole-word input.
test('writing from a picture retries errors, accepts keyboard input and multiword spacing, and resets', () => {
  const f = setup(); f.app.render(f.container, 'school', 'write');
  const submit = value => {
    f.container.querySelectorAll('input')[0].value = value;
    f.container.querySelectorAll('form')[0].onsubmit({preventDefault(){}});
  };
  assert.equal(byClass(f.container, 'en-letter').length, 0);
  assert.equal(f.container.textContent.includes('PEN'), false);
  submit(''); assert.match(f.container.textContent, /SCRIVI LA PAROLA PRIMA/);
  submit('pencil'); assert.equal(byClass(f.container, 'en-feedback')[0].attributes['data-result'], 'wrong');
  assert.equal(f.container.querySelectorAll('input')[0].disabled, false);
  submit('pen'); assert.match(f.container.textContent, /ESATTO! 🌟 PEN/);
  assert.equal(f.container.querySelectorAll('input')[0].disabled, true);
  press(f.container, 'AVANTI →');
  assert.equal(f.container.querySelectorAll('input')[0].value, '');
  submit('  school   bag '); assert.match(f.container.textContent, /ESATTO! 🌟 SCHOOL BAG/);
  press(f.container, 'RICOMINCIA');
  assert.equal(f.container.querySelectorAll('input')[0].value, '');
  assert.equal(byClass(f.container, 'en-feedback')[0].attributes['data-result'], 'info');
});

// Catches: the revised school vocabulary still accepting or presenting PURPLE instead of VIOLET.
test('color writing teaches VIOLET and completes a finite round', () => {
  const f=setup(); f.app.render(f.container, 'colors', 'write');
  const words=['PINK','RED','GREEN','BROWN','BLUE','YELLOW','VIOLET','BLACK','ORANGE','WHITE'];
  words.forEach((word,index)=>{
    const input=f.container.querySelectorAll('input')[0];
    const form=f.container.querySelectorAll('form')[0];
    if(word==='VIOLET') {
      input.value='PURPLE';form.onsubmit({preventDefault(){}});
      assert.equal(byClass(f.container,'en-feedback')[0].attributes['data-result'],'wrong');
    }
    input.value=word; form.onsubmit({preventDefault(){}});
    assert.match(f.container.textContent,new RegExp('ESATTO! 🌟 '+word));
    press(f.container,index===9?'TERMINA':'AVANTI →');
  });
  assert.match(f.container.textContent,/GIOCO COMPLETATO/);
});
