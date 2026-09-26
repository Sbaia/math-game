const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function gameWithRandom(initialTargetDraw, laterDraw = 0.25) {
  const elements = new Map();
  let focusedId = null;
  let otherDraw = laterDraw;
  const element = (id) => {
    if (!elements.has(id)) {
      const classes = new Set();
      elements.set(id, {
        innerHTML: '',
        textContent: '',
        value: '',
        disabled: false,
        style: {},
        listeners: {},
        addEventListener(type, listener) { this.listeners[type] = listener; },
        focus() { focusedId = id; },
        classList: {
          add: (...names) => names.forEach((name) => classes.add(name)),
          remove: (...names) => names.forEach((name) => classes.delete(name)),
          contains: (name) => classes.has(name),
        },
      });
    }
    return elements.get(id);
  };
  let nextTargetDraw = initialTargetDraw;
  const random = Object.create(Math);
  random.random = () => {
    if (nextTargetDraw === undefined) return otherDraw;
    const draw = nextTargetDraw;
    nextTargetDraw = undefined;
    return draw;
  };
  const document = {
    getElementById: element,
    querySelectorAll: () => [],
    createElement: () => ({ textContent: '', style: {} }),
    head: { appendChild() {} },
    body: { appendChild() {} },
  };
  const context = vm.createContext({ document, Math: random, setTimeout() {} });
  vm.runInContext(script, context);
  return {
    context, element, getFocused: () => focusedId,
    setNextTarget: (draw) => { nextTargetDraw = draw; },
    setOtherDraw: (draw) => { otherDraw = draw; },
  };
}

test('each number from 3 through 10 can be a game target', () => {
  for (let target = 3; target <= 10; target++) {
    const { context, element } = gameWithRandom((target - 3) / 8);
    context.tensNew();
    assert.match(element('subtitle').textContent, new RegExp(`\\b${target}\\b`));
    const tiles = Array.from(element('tensBlock').innerHTML.matchAll(/onclick="tensClick\(\d+\)">(\d+)<\/div>/g), match => Number(match[1]));
    assert.equal(tiles.length, 12);
    assert.ok(tiles.every(value => value >= 0 && value <= target));
    for (let i = 0; i < tiles.length; i++) {
      const partner = tiles.findIndex((value, j) => j !== i && value + tiles[i] === target);
      assert.notEqual(partner, -1, `tile ${tiles[i]} needs a partner for ${target}`);
    }
  }
});

test('the list shows each friend pair without arithmetic symbols', () => {
  assert.equal(html.includes("showGame('friends')"), true);
  for (let target = 3; target <= 10; target++) {
    const { context, element } = gameWithRandom((target - 3) / 8);
    context.showGame('friends');
    assert.equal(element('view-friends').classList.contains('active'), true);
    assert.equal(element('subtitle').textContent, 'Trova il numero amico!');
    assert.equal(element('friendsTotal').textContent, target + 1);
    const block = element('friendsBlock').innerHTML;
    assert.equal(block.includes(`<div class="friends-target">Amici del <strong>${target}</strong></div>`), true);
    const rows = Array.from(block.matchAll(/<div class="friends-row" id="friendsRow-(\d+)">([\s\S]*?)<\/div>/g));
    assert.equal(rows.length, target + 1);
    assert.deepEqual(rows.map((row) => Number(row[1])).sort((a, b) => a - b), Array.from({ length: target + 1 }, (_, i) => i));
    rows.forEach((row) => {
      const n = Number(row[1]);
      assert.match(row[2], new RegExp(`^<span class="friends-number">${n}</span>\\s*<span class="friends-hand" aria-hidden="true">🤝</span>`));
      assert.match(row[2], new RegExp(`id="friendsInput-${n}"`));
      assert.equal(row[2].trim().endsWith('>'), true);
    });
  }
});

test('the friend order varies and Enter follows the visible order', () => {
  const game = gameWithRandom(0.375, 0);
  game.context.showGame('friends');
  const values = () => Array.from(game.element('friendsBlock').innerHTML.matchAll(/id="friendsRow-(\d+)"/g), match => Number(match[1]));
  const firstOrder = values();
  assert.deepEqual([...firstOrder].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6]);
  assert.equal(game.getFocused(), `friendsInput-${firstOrder[0]}`);
  game.element(`friendsInput-${firstOrder[0]}`).listeners.keydown({ key: 'Enter', preventDefault() {} });
  assert.equal(game.getFocused(), `friendsInput-${firstOrder[1]}`);
  game.setNextTarget(0.375);
  game.setOtherDraw(0.999999);
  game.context.friendsNew();
  assert.notDeepEqual(values(), firstOrder);
  assert.deepEqual([...values()].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6]);
});

test('the list checks complements and a new game resets its score', () => {
  const { context, element, setNextTarget } = gameWithRandom(0);
  assert.equal(typeof context.friendsCheck, 'function');
  context.showGame('friends');
  element('friendsInput-0').value = '3';
  element('friendsInput-1').value = '3';
  context.friendsCheck();
  assert.equal(element('friendsScore').textContent, 1);
  assert.equal(element('friendsInput-0').disabled, true);
  assert.equal(element('friendsRow-1').classList.contains('wrong'), true);
  element('friendsInput-1').value = '2';
  element('friendsInput-2').value = '1';
  element('friendsInput-3').value = '0';
  context.friendsCheck();
  assert.equal(element('friendsScore').textContent, 4);
  assert.match(element('friendsMessage').innerHTML, /BRAVISSIMO/);
  setNextTarget(0.999999);
  context.friendsNew();
  assert.equal(element('friendsScore').textContent, '0');
  assert.equal(element('friendsMessage').innerHTML, '');
  assert.equal(element('friendsTotal').textContent, 11);
  assert.equal(element('friendsBlock').innerHTML.includes('Amici del <strong>10</strong>'), true);
});

test('matching uses the current target and a new game resets the score', () => {
  const { context, element, setNextTarget } = gameWithRandom(0);
  context.showGame('tens');
  assert.equal(element('view-tens').classList.contains('active'), true);
  const tiles = Array.from(element('tensBlock').innerHTML.matchAll(/onclick="tensClick\(\d+\)">(\d+)<\/div>/g), match => Number(match[1]));
  const first = 0;
  const partner = tiles.findIndex((value, index) => index !== first && value + tiles[first] === 3);
  assert.notEqual(partner, -1);
  const wrong = tiles.findIndex((value, index) => index !== first && value + tiles[first] !== 3);
  context.tensClick(first);
  context.tensClick(wrong);
  assert.equal(element('tensScore').textContent, '0');
  context.tensClick(first);
  context.tensClick(partner);
  assert.equal(element('tensScore').textContent, 1);
  assert.equal(element(`tens-${first}`).classList.contains('matched'), true);
  for (let i = 0; i < tiles.length; i++) {
    if (element(`tens-${i}`).classList.contains('matched')) continue;
    const match = tiles.findIndex((value, j) => j !== i && !element(`tens-${j}`).classList.contains('matched') && value + tiles[i] === 3);
    context.tensClick(i);
    context.tensClick(match);
  }
  assert.equal(element('tensScore').textContent, 6);
  assert.match(element('tensMessage').innerHTML, /BRAVISSIMO/);
  setNextTarget(0.999999);
  context.tensNew();
  assert.equal(element('tensScore').textContent, '0');
  assert.equal(element('tensMessage').innerHTML, '');
  assert.match(element('subtitle').textContent, /\b10\b/);
});
