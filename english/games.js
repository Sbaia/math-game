(function (root) {
  'use strict';
  const categories = root.EnglishVocabulary;
  const modes = [
    ['explore','ESPLORA','🔎','GUARDA LE CARTE E SCOPRI LE PAROLE.'],
    ['recognize','TROVA L’IMMAGINE','👀','LEGGI E TOCCA L’IMMAGINE GIUSTA.'],
    ['memory','MEMORY','🃏','ABBINA OGNI IMMAGINE ALLA PAROLA INGLESE.'],
    ['detective','DETECTIVE','🕵️','LEGGI L’INDIZIO E TROVA LA PAROLA INGLESE.'],
    ['complete','COMPLETA LA PAROLA','✏️','GUARDA L’IMMAGINE E TOCCA LA LETTERA MANCANTE.'],
    ['listen','ASCOLTA E TOCCA','🔊','ASCOLTA LA PAROLA E TOCCA L’IMMAGINE.'],
    ['letters','RIORDINA LE LETTERE','🔤','TOCCA LE LETTERE NELL’ORDINE GIUSTO.']
  ].map(([id,title,icon,description]) => ({id,title,icon,description}));
  let dispose = () => {};
  function shuffle(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function button(text, action, className) {
    const el = node('button', className || 'en-button', text);
    el.type = 'button';
    el.onclick = action;
    return el;
  }
  function picture(item, withCaption) {
    const el = node('span', 'en-picture');
    el.innerHTML = item.picture;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', item.italian);
    if (withCaption) el.append(node('span', 'en-caption', item.italian));
    return el;
  }
  function render(container, categoryId, modeId) {
    dispose();
    const selected = categories.find(c => c.id === categoryId) || categories[0];
    const category = { ...selected, words: selected.words };
    function sample() {
      if (selected.id === 'mixed') category.words = categories.filter(c => c.id !== 'mixed').flatMap(c => shuffle(c.words).slice(0, 2));
      return shuffle(category.words);
    }
    const mode = modes.find(m => m.id === modeId) || modes[0];
    const shell = node('section', 'english-app');
    shell.setAttribute('aria-label', category.title + ' — ' + mode.title);
    const heading = node('h2', '', mode.icon + ' ' + mode.title);
    const progress = node('p', 'en-progress');
    const audioControls = node('div', 'en-audio-controls');
    const stage = node('div', 'en-stage');
    const feedback = node('p', 'en-feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    const controls = node('div', 'en-controls');
    shell.append(heading, node('p', 'en-instructions', mode.description), progress, audioControls, feedback, stage, controls);
    container.replaceChildren(shell);
    let active = true;
    let index = 0;
    let solved = false;
    let heard = false;
    let order = sample();
    let first = null;
    let mismatch = [];
    let pairs = 0;
    let speech;
    let resultState = 'info';
    const sayFeedback = (text, result = 'info') => {
      if (!active) return;
      resultState = result;
      feedback.textContent = text;
      feedback.setAttribute('data-result', result);
      stage.setAttribute('data-result', result);
    };
    speech = root.EnglishSpeech(() => {
      if (active && !solved && !heard && mode.id === 'listen' && speech && speech.available()) sayFeedback('VOCE INGLESE PRONTA. PREMI ASCOLTA.');
    });
    dispose = () => {
      active = false;
      speech.stop();
      shell.querySelectorAll('button, input, form').forEach(el => {
        el.onclick = null;
        el.onsubmit = null;
      });
    };
    function audio(item) {
      if (!active) return;
      if (speech.speak(item.word, text => { if (!solved && resultState !== 'wrong') sayFeedback(text); })) {
        heard = true;
        if (mode.id === 'listen') sayFeedback('ASCOLTA E SCEGLI L’IMMAGINE.');
      }
    }
    function restart() {
      if (!active) return;
      speech.cancel();
      index = 0; pairs = 0; first = null; mismatch = []; order = sample();
      draw();
    }
    function finish() {
      audioControls.replaceChildren();
      stage.replaceChildren(node('div', 'en-finish', '🌟 BRAVISSIMO! GIOCO COMPLETATO!'));
      controls.replaceChildren(button('RICOMINCIA', restart));
      progress.textContent = mode.id === 'memory' ? pairs + ' / ' + category.words.length + ' COPPIE' : order.length + ' / ' + order.length;
      sayFeedback('✓ HAI SCOPERTO TUTTE LE PAROLE!', 'correct');
    }
    function success() {
      solved = true;
      sayFeedback('✓ ESATTO! 🌟 ' + order[index].word, 'correct');
      audioControls.querySelectorAll('button').forEach(el => { el.disabled = true; });
      stage.querySelectorAll('button, input').forEach(el => { el.disabled = true; });
      controls.append(button(index === order.length - 1 ? 'TERMINA' : 'AVANTI →', next));
    }
    function answer(correct, selected) {
      if (!active || solved) return;
      if (mode.id === 'listen' && !heard) { sayFeedback('PREMI PRIMA ASCOLTA.'); return; }
      if (selected) selected.setAttribute('data-result', correct ? 'correct' : 'wrong');
      if (correct) success();
      else sayFeedback('✕ QUASI! RIPROVA, PUOI FARCELA.', 'wrong');
    }
    function next() {
      if (!active) return;
      speech.cancel();
      index++;
      if (index === order.length) finish(); else draw();
    }
    function choices(item, textOnly) {
      const others = shuffle(category.words.filter(w => w !== item)).slice(0, 3);
      const grid = node('div', 'en-choice-grid');
      shuffle([item, ...others]).forEach(option => {
        const choice = button(textOnly ? option.word : '', () => answer(option === item, choice), 'en-choice');
        if (textOnly) choice.lang = 'en';
        else choice.append(picture(option, false));
        grid.append(choice);
      });
      stage.append(grid);
    }
    function memory() {
      const grid = node('div', 'en-memory-grid');
      const cards = shuffle(category.words.flatMap(item => [{item, image:true}, {item, image:false}]));
      cards.forEach(card => {
        const tile = button('?', () => {
          if (!active || tile.disabled || mismatch.length || first && first.tile === tile) return;
          tile.replaceChildren(card.image ? picture(card.item, false) : node('span', '', card.item.word));
          tile.setAttribute('aria-label', card.image ? card.item.italian : card.item.word);
          if (!first) { first = {tile, card}; return; }
          if (first.card.item === card.item && first.card.image !== card.image) {
            first.tile.setAttribute('data-result', 'correct'); tile.setAttribute('data-result', 'correct');
            first.tile.disabled = true; tile.disabled = true; first = null; pairs++;
            progress.textContent = pairs + ' / ' + category.words.length + ' COPPIE';
            sayFeedback('✓ COPPIA TROVATA! 🌟', 'correct');
            if (pairs === category.words.length) finish();
          } else {
            mismatch = [first.tile, tile]; first = null;
            mismatch.forEach(el => el.setAttribute('data-result', 'wrong'));
            sayFeedback('✕ NON È LA COPPIA. GUARDA E POI RIPROVA.', 'wrong');
            controls.append(button('RIPROVA', () => {
              mismatch.forEach(el => { el.textContent = '?'; el.setAttribute('data-result', ''); el.setAttribute('aria-label', 'CARTA COPERTA'); });
              mismatch = []; controls.lastChild.remove(); sayFeedback('CERCA UNA COPPIA.');
            }));
          }
        }, 'en-memory-card');
        tile.setAttribute('aria-label', 'CARTA COPERTA');
        grid.append(tile);
      });
      stage.append(grid);
    }
    function complete(item) {
      const missing = 1;
      const letter = item.word[missing];
      const masked = item.word.slice(0, missing) + '_' + item.word.slice(missing + 1);
      stage.append(picture(item, false), node('h3', 'en-vocabulary', masked));
      stage.lastChild.lang = 'en';
      const bank = node('div', 'en-letter-bank');
      const alternatives = shuffle(Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').filter(char => char !== letter)).slice(0, 3);
      shuffle([letter, ...alternatives]).forEach(char => {
        const choice = button(char, () => answer(char === letter, choice), 'en-letter');
        bank.append(choice);
      });
      stage.append(bank);
    }
    function letters(item) {
      stage.append(picture(item, false));
      const result = node('p', 'en-letter-result');
      result.setAttribute('aria-live', 'polite');
      const grid = node('div', 'en-letter-bank');
      const used = [];
      const positions = Array.from(item.word);
      function update() {
        let n = 0;
        result.textContent = positions.map(char => char === ' ' ? ' / ' : used[n++] ? used[n - 1].textContent : '_').join(' ');
        if (used.length === item.word.replace(/ /g, '').length) answer(used.map(el => el.textContent).join('') === item.word.replace(/ /g, ''));
      }
      shuffle(positions.filter(char => char !== ' ')).forEach(char => {
        const tile = button(char, () => {
          if (!active || solved || tile.disabled) return;
          tile.disabled = true; used.push(tile); update();
        }, 'en-letter');
        grid.append(tile);
      });
      stage.append(result, grid, button('ANNULLA LETTERA', () => {
        if (solved || !active) return;
        const tile = used.pop(); if (tile) tile.disabled = false; update(); sayFeedback('RIPROVA CON LE LETTERE.');
      }), button('CANCELLA TUTTO', () => {
        if (solved || !active) return;
        used.splice(0).forEach(tile => { tile.disabled = false; }); update(); sayFeedback('RIPARTI DALLA PRIMA LETTERA.');
      }));
      update();
    }
    function draw() {
      solved = false; heard = false;
      audioControls.replaceChildren();
      stage.replaceChildren(); controls.replaceChildren(button('RICOMINCIA', restart));
      sayFeedback('');
      progress.textContent = mode.id === 'memory' ? '0 / ' + category.words.length + ' COPPIE' : (index + 1) + ' / ' + order.length;
      const item = order[index];
      if (mode.id === 'memory') { memory(); return; }
      if (mode.id === 'explore') {
        stage.append(picture(item, true), node('h3', 'en-vocabulary', item.word));
        stage.lastChild.lang = 'en';
        audioControls.append(button('🔊 ASCOLTA', () => audio(item), 'en-listen-button'));
        controls.append(button(index === order.length - 1 ? 'TERMINA' : 'AVANTI →', next));
      } else if (mode.id === 'recognize') {
        stage.append(node('h3', 'en-vocabulary', item.word)); stage.lastChild.lang = 'en'; choices(item, false);
      } else if (mode.id === 'detective') {
        stage.append(node('p', 'en-clue', item.clue)); choices(item, true);
      } else if (mode.id === 'listen') {
        audioControls.append(button('🔊 ASCOLTA / RIASCOLTA', () => audio(item), 'en-listen-button')); choices(item, false);
        if (!speech.available()) sayFeedback('AUDIO INGLESE NON DISPONIBILE. ATTIVA UNA VOCE INGLESE O SCEGLI UN ALTRO GIOCO.');
      } else if (mode.id === 'complete') complete(item);
      else letters(item);
    }
    draw();
  }
  root.EnglishApp = {categories: categories.map(({id,title,icon}) => ({id,title,icon})), modes, render, stop: () => dispose()};
})(typeof window !== 'undefined' ? window : globalThis);
