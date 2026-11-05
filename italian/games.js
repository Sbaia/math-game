(function (root) {
  'use strict';
  const categories = [
    { id: 'sounds', title: 'SUONI DIFFICILI', icon: '🔤' },
    { id: 'doubles', title: 'DOPPIE', icon: '✌️' },
    { id: 'accents', title: 'ACCENTI', icon: '🎵' },
    { id: 'mixed', title: 'PROVA', icon: '🏆' }
  ];
  const modes = [
    { id: 'complete', title: 'COMPLETA', icon: '🧩', description: 'SCEGLI LE LETTERE CHE MANCANO.' },
    { id: 'recognize', title: 'SCEGLI LA PAROLA', icon: '🔎', description: 'LEGGI L’INDIZIO E TROVA LA PAROLA SCRITTA BENE.' },
    { id: 'dictation', title: 'DETTATO', icon: '🔊', description: 'ASCOLTA E SCRIVI LA PAROLA.' }
  ];
  let cleanup = () => {};
  const normalize = value => value.trim().normalize('NFC').toLocaleUpperCase('it-IT');
  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function render(container, category, mode) {
    cleanup();
    if (!categories.some(c => c.id === category) || !modes.some(m => m.id === mode)) return;
    const bank = root.ItalianVocabulary;
    let alive = true;
    let words, index, score, answered, listened, credited;
    container.replaceChildren();
    const panel = document.createElement('section');
    panel.className = 'italian-game';
    container.appendChild(panel);
    function node(tag, text, parent = panel) {
      const el = document.createElement(tag);
      if (text) el.textContent = text;
      parent.appendChild(el);
      return el;
    }
    function button(text, action, parent = panel) {
      const el = node('button', text, parent);
      el.type = 'button';
      el.addEventListener('click', () => { if (alive) action(); });
      return el;
    }
    let audioStatus;
    const speech = new root.ItalianSpeech(message => { if (alive && audioStatus) audioStatus.textContent = message; });
    cleanup = () => { alive = false; speech.stop(); panel.replaceChildren(); };
    function start() {
      speech.cancel();
      words = category === 'mixed'
        ? shuffle(['sounds', 'doubles', 'accents'].flatMap(key => shuffle(bank[key]).slice(0, 2)))
        : shuffle(bank[category]).slice(0, 8);
      index = 0; score = 0;
      round();
    }
    function round() {
      speech.cancel();
      panel.replaceChildren();
      audioStatus = null;
      answered = false; listened = false; credited = false;
      if (index === words.length) {
        node('h2', 'BRAVISSIMO! PROVA COMPLETATA!');
        node('p', 'PUNTI: ' + score + ' / ' + words.length);
        button('RICOMINCIA', start);
        return;
      }
      const word = words[index];
      node('h2', modes.find(m => m.id === mode).title);
      node('p', 'PAROLA ' + (index + 1) + ' DI ' + words.length + ' · PUNTI: ' + score);
      const clue = mode === 'dictation' ? null : node('p', word.clue);
      if (clue) clue.className = 'italian-clue';
      const choices = node('div');
      choices.className = 'italian-choices';
      const feedback = node('p');
      feedback.setAttribute('role', 'status');
      const actions = node('div');
      actions.className = 'italian-actions';
      let input;
      function submit(value) {
        if (answered) return;
        if (mode === 'dictation' && !listened) {
          feedback.textContent = 'PRIMA ASCOLTA TUTTA LA PAROLA.';
          return;
        }
        if (!normalize(value)) { feedback.textContent = 'SCRIVI UNA PAROLA.'; return; }
        answered = true;
        speech.cancel();
        const correct = normalize(value) === (mode === 'complete' ? word.group : word.word);
        if (correct && !credited) { score++; credited = true; }
        feedback.textContent = correct ? 'ESATTO! ' + word.word : 'RIPROVA! LA PAROLA È ' + word.word + '. INDIZIO: ' + word.clue;
        actions.replaceChildren();
        if (!correct) button('RIPROVA', () => {
          answered = false;
          feedback.textContent = 'PROVA ANCORA.';
          actions.replaceChildren();
          if (input) { input.value = ''; input.focus(); }
        }, actions);
        button(index === words.length - 1 ? 'RISULTATO' : 'AVANTI', () => { index++; round(); }, actions);
      }
      if (mode === 'dictation') {
        audioStatus = node('p', 'PREMI ASCOLTA E SCRIVI LA PAROLA.', choices);
        audioStatus.setAttribute('role', 'status');
        button('🔊 ASCOLTA', () => {
          if (answered) return;
          listened = false;
          speech.speak(word.word, () => { listened = true; });
        }, choices);
        const form = node('form', '', choices);
        input = node('input', '', form);
        input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
        input.setAttribute('aria-label', 'SCRIVI LA PAROLA ASCOLTATA');
        input.autocapitalize = 'characters';
        input.addEventListener('input', () => {
          const start = input.selectionStart;
          input.value = normalize(input.value);
          if (start !== null && input.setSelectionRange) input.setSelectionRange(start, start);
        });
        const accents = node('div', '', form);
        accents.className = 'italian-accents';
        'ÀÈÉÌÒÙ'.split('').forEach(letter => button(letter, () => {
          if (answered) return;
          const start = input.selectionStart === null ? input.value.length : input.selectionStart;
          const end = input.selectionEnd === null ? start : input.selectionEnd;
          input.value = input.value.slice(0, start) + letter + input.value.slice(end);
          input.focus(); input.setSelectionRange(start + 1, start + 1);
        }, accents));
        const check = node('button', 'CONTROLLA', form);
        check.type = 'submit';
        form.addEventListener('submit', event => { event.preventDefault(); if (alive) submit(input.value); });
      } else if (mode === 'complete') {
        node('p', word.word.replace(word.group, '___'), choices).className = 'italian-masked';
        const wrong = category === 'accents' || /[ÀÈÉÌÒÙ]/.test(word.group)
          ? [word.group.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), word.group === 'É' ? 'È' : 'É']
          : (word.group.length === 2 && word.group[0] === word.group[1]
            ? [word.group[0], word.group + word.group[0]]
            : ({ CHE: ['CE', 'CHI'], CHI: ['CI', 'CHE'], GHE: ['GE', 'GHI'], GHI: ['GI', 'GHE'], GN: ['NI', 'GNI'], GNI: ['NI', 'GN'], GLI: ['LI', 'GI'], SCE: ['SCIE', 'SHE'], SCI: ['SI', 'SHI'] }[word.group]));
        shuffle([...new Set([word.group, ...wrong])]).forEach(choice => button(choice, () => submit(choice), choices));
      } else {
        shuffle([word.word, ...word.wrong]).forEach(choice => button(choice, () => submit(choice), choices));
      }
    }
    start();
  }
  root.ItalianApp = { categories, modes, render, stop() { cleanup(); cleanup = () => {}; } };
})(typeof window === 'undefined' ? globalThis : window);
