/* Hash routes adapt the existing math entry points without changing game rules. */
(function () {
  const mathGames = ['table', 'missing', 'count', 'compare', 'tens', 'friends', 'seq', 'eo', 'ba', 'story', 'guess'];
  function parse(hash, categories, modes, italianCategories = ['sounds', 'doubles', 'accents', 'mixed'], italianModes = ['complete', 'recognize', 'dictation']) {
    const parts = hash.replace(/^#!\/?/, '').split('/').filter(Boolean);
    if (!parts.length) return { subject: 'home' };
    const [subject, category, mode] = parts;
    if (subject === 'math' && parts.length <= 2 && (!category || mathGames.includes(category))) return { subject, game: category };
    if (subject === 'italian' && parts.length <= 3 && (!category || italianCategories.includes(category)) && (!mode || italianModes.includes(mode))) return category ? { subject, category, mode } : { subject };
    if (subject === 'english' && parts.length <= 3 && (!category || categories.includes(category)) && (!mode || modes.includes(mode))) return { subject, category, mode };
    return { subject: 'home' };
  }
  if (typeof module !== 'undefined') module.exports = { parse };
  if (typeof window === 'undefined') return;
  const mathHome = window.showHome;
  const mathGame = window.showGame;
  const title = document.querySelector('h1');
  const subtitle = document.getElementById('subtitle');
  const shell = document.createElement('main');
  shell.id = 'learning-shell';
  document.body.appendChild(shell);
  const subjects = document.createElement('button');
  subjects.className = 'btn btn-home';
  subjects.textContent = '🏠 MATERIE';
  subjects.onclick = () => navigate('');
  document.getElementById('view-home').prepend(subjects);
  function navigate(path) {
    const hash = '#!/' + path;
    if (location.hash === hash) render();
    else location.hash = hash;
  }
  window.showHome = () => navigate('math');
  window.showGame = name => navigate('math/' + name);
  function card(path, icon, label, description = '') {
    return `<a class="menu-card c3" href="#!/${path}"><span class="menu-icon">${icon}</span><span class="menu-title">${label}</span><span class="menu-desc">${description}</span></a>`;
  }
  function render() {
    window.scrollTo(0, 0);
    window.EnglishApp.stop();
    window.ItalianApp.stop();
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    shell.hidden = false;
    shell.innerHTML = '';
    const route = parse(location.hash, window.EnglishApp.categories.map(c => c.id), window.EnglishApp.modes.map(m => m.id), window.ItalianApp.categories.map(c => c.id), window.ItalianApp.modes.map(m => m.id));
    const app = route.subject === 'italian' ? window.ItalianApp : window.EnglishApp;
    const subjectTitle = route.subject === 'italian' ? 'ITALIANO' : 'INGLESE';
    title.textContent = 'IMPARARE GIOCANDO!';
    subtitle.textContent = 'SCEGLI UNA MATERIA';
    if (route.subject === 'math') {
      shell.hidden = true;
      title.textContent = 'Matematica Divertente!';
      if (route.game) mathGame(route.game); else mathHome();
      return;
    }
    if (route.subject === 'home') {
      shell.innerHTML = `<div class="menu">${card('math', '🧮', 'MATEMATICA')}${card('english', '🇬🇧', 'INGLESE')}${card('italian', '📖', 'ITALIANO')}</div>`;
      return;
    }
    const parent = route.mode ? route.subject + '/' + route.category : route.category ? route.subject : '';
    shell.innerHTML = `<nav class="buttons"><a class="btn btn-home" href="#!/${parent}">← INDIETRO</a><a class="btn btn-home" href="#!/">🏠 MATERIE</a></nav>`;
    if (!route.category) {
      subtitle.textContent = subjectTitle + ': SCEGLI UNA CATEGORIA';
      shell.innerHTML += `<div class="menu">${app.categories.filter(c => c.id !== 'mixed').map(c => card(route.subject + '/' + c.id, c.icon, c.title)).join('')}</div><div class="practice-block">${card(route.subject + '/mixed', '🎲', 'PROVA', route.subject === 'italian' ? 'MESCOLA SUONI DIFFICILI, DOPPIE E ACCENTI!' : 'MESCOLA COLORI, SCUOLA, ANIMALI E GIOCATTOLI!')}</div>`;
    } else {
      const category = app.categories.find(c => c.id === route.category);
      subtitle.textContent = subjectTitle + ' · ' + category.title;
      if (!route.mode) shell.innerHTML += `<div class="menu">${app.modes.map(m => card(route.subject + '/' + category.id + '/' + m.id, m.icon, m.title, m.description)).join('')}</div>`;
      else {
        const container = document.createElement('section');
        shell.appendChild(container);
        app.render(container, route.category, route.mode);
      }
    }
  }
  window.addEventListener('hashchange', render);
  if (!location.hash.startsWith('#!')) history.replaceState(null, '', '#!/');
  render();
})();
