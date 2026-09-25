const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function gameWithRandom(initialTargetDraw) {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) {
      const classes = new Set();
      elements.set(id, {
        innerHTML: '',
        textContent: '',
        style: {},
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
    if (nextTargetDraw === undefined) return 0.25;
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
  return { context, element, setNextTarget: (draw) => { nextTargetDraw = draw; } };
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
