/* Hash routes adapt the existing math entry points without changing game rules. */
(function () {
  const mathGames = ['table', 'missing', 'count', 'compare', 'tens', 'friends', 'seq', 'eo', 'ba', 'story', 'guess'];
  function parse(hash, categories, modes) {
    const parts = hash.replace(/^#!\/?/, '').split('/').filter(Boolean);
    if (!parts.length) return { subject: 'home' };
    const [subject, category, mode] = parts;
    if (subject === 'math' && parts.length <= 2 && (!category || mathGames.includes(category))) return { subject, game: category };
    if (subject === 'italian' && parts.length === 1) return { subject };
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
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    shell.hidden = false;
    shell.innerHTML = '';
    const app = window.EnglishApp;
    const route = parse(location.hash, app.categories.map(c => c.id), app.modes.map(m => m.id));
    title.textContent = 'IMPARARE GIOCANDO!';
    subtitle.textContent = 'SCEGLI UNA MATERIA';
    if (route.subject === 'math') {
      shell.hidden = true;
      title.textContent = 'Matematica Divertente!';
      if (route.game) mathGame(route.game); else mathHome();
      return;
    }
    if (route.subject === 'home') {
      shell.innerHTML = `<div class="menu">${card('math', '🧮', 'MATEMATICA')}${card('english', '🇬🇧', 'INGLESE')}${card('italian', '📖', 'ITALIANO', 'COMING SOON')}</div>`;
      return;
    }
    const parent = route.mode ? 'english/' + route.category : route.category ? 'english' : '';
    shell.innerHTML = `<nav class="buttons"><a class="btn btn-home" href="#!/${parent}">← INDIETRO</a><a class="btn btn-home" href="#!/">🏠 MATERIE</a></nav>`;
    if (route.subject === 'italian') {
      subtitle.textContent = 'ITALIANO';
      shell.innerHTML += '<div class="game-card"><h2>🚧 COMING SOON</h2><p>NUOVI GIOCHI IN ARRIVO!</p></div>';
    } else if (!route.category) {
      subtitle.textContent = 'INGLESE: SCEGLI UNA CATEGORIA';
      shell.innerHTML += `<div class="menu">${app.categories.filter(c => c.id !== 'mixed').map(c => card('english/' + c.id, c.icon, c.title)).join('')}</div><div class="practice-block">${card('english/mixed', '🎲', 'PROVA', 'MESCOLA COLORI, SCUOLA, ANIMALI E GIOCATTOLI!')}</div>`;
    } else {
      const category = app.categories.find(c => c.id === route.category);
      subtitle.textContent = 'INGLESE · ' + category.title;
      if (!route.mode) shell.innerHTML += `<div class="menu">${app.modes.map(m => card('english/' + category.id + '/' + m.id, m.icon, m.title, m.description)).join('')}</div>`;
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
