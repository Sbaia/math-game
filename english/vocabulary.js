(function (root) {
  'use strict';
  const svg = body => '<svg viewBox="0 0 120 100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g stroke="#25334b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + body + '</g></svg>';
  const drawings = {
    pen: '<path d="M25 76L76 16L88 26L37 86L21 91Z" fill="#478de7"/><path d="M76 16L82 9L94 19L88 26M25 76L37 86M21 91L25 76" fill="#e6edf7"/><path d="M82 32L98 14"/>',
    'school bag': '<path d="M45 25V18Q60 5 75 18V25" fill="none"/><rect x="28" y="25" width="64" height="66" rx="14" fill="#e77586"/><rect x="37" y="56" width="46" height="27" rx="7" fill="#ffc56f"/><path d="M40 42H80M42 67H77"/>',
    pencil: '<path d="M24 76L76 14L90 26L38 88L18 94Z" fill="#ffd15e"/><path d="M76 14L82 7L96 19L90 26" fill="#f49aaf"/><path d="M24 76L38 88L18 94Z" fill="#eed5ae"/><path d="M34 76L80 25M18 94L24 87"/>',
    rubber: '<path d="M20 63L56 22L98 53L62 90H50Z" fill="#f6a6c2"/><path d="M42 79L77 38L98 53L62 90H50Z" fill="#bce2f6"/><path d="M20 63L50 85"/>',
    book: '<path d="M19 20H91V84H25Q15 84 15 76V28Q15 20 23 20Z" fill="#79bf9c"/><path d="M25 20V75H91V84H25Q15 84 15 76" fill="#fff7df"/><path d="M39 35H76M39 45H68"/>',
    ruler: '<path d="M15 49L94 18L107 53L28 84Z" fill="#ffd769"/><path d="M28 45L33 58M41 40L46 53M54 35L59 48M67 30L72 43M80 25L85 38"/>',
    'pencil case': '<rect x="13" y="32" width="94" height="43" rx="14" fill="#b29ae5"/><path d="M20 47H98M87 47V58H98V47M28 32L31 22H42L45 32" fill="#ffdc7b"/>',
    sharpener: '<path d="M30 26L78 17L97 34V76L49 89L30 72Z" fill="#7cc9d5"/><path d="M30 26L49 43L97 34M49 43V89" fill="none"/><ellipse cx="72" cy="62" rx="15" ry="18" fill="#31415b"/><path d="M38 28L73 23L84 32L49 38Z" fill="#dfe7ec"/><circle cx="59" cy="30" r="3" fill="#657381"/>',
    cards: '<rect x="18" y="23" width="47" height="66" rx="6" fill="#fff4d9" transform="rotate(-12 40 55)"/><rect x="52" y="12" width="47" height="66" rx="6" fill="#fff" transform="rotate(10 75 45)"/><path d="M66 34Q69 24 76 32Q84 24 88 34Q90 42 77 52Q64 43 66 34Z" fill="#e5677d"/>',
    doll: '<path d="M50 22Q37 9 42 32M70 22Q83 9 78 32" fill="#ae7047"/><circle cx="60" cy="27" r="16" fill="#ffd6ad"/><path d="M50 43L35 76H85L70 43Z" fill="#e899c6"/><path d="M46 49L24 63M74 49L96 63M49 77V94M71 77V94" fill="none"/><circle cx="55" cy="26" r="1"/><circle cx="65" cy="26" r="1"/><path d="M56 34H64"/>',
    videogame: '<rect x="24" y="8" width="72" height="43" rx="5" fill="#485577"/><rect x="32" y="15" width="56" height="28" fill="#b8e6d8"/><path d="M35 63Q22 60 17 85Q15 98 30 92L43 81H77L90 92Q105 98 103 85Q98 60 85 63Z" fill="#a89ce0"/><path d="M34 69V81M28 75H40"/><circle cx="83" cy="71" r="3" fill="#ffd56a"/><circle cx="91" cy="79" r="3" fill="#f48aa7"/>',
    plane: '<path d="M57 9Q63 4 67 14L70 40L108 65V75L70 61L68 82L81 91V97L61 91L41 97V91L54 82L52 61L12 75V65L52 40Z" fill="#8bcfe4"/>',
    ball: '<circle cx="60" cy="51" r="39" fill="#fff4d2"/><path d="M60 34L76 46L70 65H50L44 46Z" fill="#50668a"/><path d="M60 12V34M76 46L97 40M70 65L83 82M50 65L37 82M44 46L23 40" fill="none"/>',
    car: '<path d="M16 56L29 48L41 29H78L94 49L105 56V78H16Z" fill="#e97c73"/><path d="M44 35L35 50H83L74 35Z" fill="#cceef5"/><circle cx="35" cy="78" r="12" fill="#3d4b63"/><circle cx="87" cy="78" r="12" fill="#3d4b63"/>',
    skateboard: '<path d="M12 48Q12 37 28 37H94Q110 37 108 48Q108 59 92 59H28Q12 59 12 48Z" fill="#9bc783"/><path d="M34 59V70M86 59V70"/><circle cx="34" cy="75" r="9" fill="#b394dc"/><circle cx="86" cy="75" r="9" fill="#b394dc"/>',
    bike: '<circle cx="28" cy="67" r="22" fill="#fff"/><circle cx="94" cy="67" r="22" fill="#fff"/><path d="M28 67L47 35L67 67H28L61 45H82L94 67M67 67L79 26H91M40 31H55" fill="none" stroke="#dc716c" stroke-width="5"/>'
  };
  const categoryData = [
    { id: 'colors', title: 'COLORI', icon: '🎨', words: [
      ['pink','ROSA','#f49bc2'],['red','ROSSO','#e44848'],['green','VERDE','#399a55'],['brown','MARRONE','#8a593b'],['blue','BLU','#3974d6'],['yellow','GIALLO','#ffda43'],['violet','VIOLA','#9952bd'],['black','NERO','#20212b'],['orange','ARANCIONE','#fb922f'],['white','BIANCO','#fff']] },
    { id: 'school', title: 'SCUOLA', icon: '🎒', words: [
      ['pen','PENNA','SCRIVO CON L’INCHIOSTRO.'],['school bag','ZAINO','PORTO I LIBRI SULLE SPALLE.'],['pencil','MATITA','SCRIVO E POSSO CANCELLARE.'],['rubber','GOMMA','CANCELLO I SEGNI DELLA MATITA.'],['book','LIBRO','HO TANTE PAGINE DA LEGGERE.'],['ruler','RIGHELLO','MISURO E TRACCIO LINEE DRITTE.'],['pencil case','ASTUCCIO','TENGO INSIEME PENNE E MATITE.'],['sharpener','TEMPERINO','RENDO APPUNTITA LA MATITA.']] },
    { id: 'animals', title: 'ANIMALI', icon: '🐾', words: [
      ['frog','RANA','SALTO E FACCIO CRA CRA.','🐸'],['bird','UCCELLO','HO LE PIUME E VOLO.','🐦'],['rabbit','CONIGLIO','HO LE ORECCHIE LUNGHE.','🐰'],['tortoise','TARTARUGA','CAMMINO PIANO CON IL GUSCIO.','🐢'],['fish','PESCE','NUOTO E RESPIRO CON LE BRANCHIE.','🐟'],['dog','CANE','SCODINZOLO E FACCIO BAU.','🐶'],['cat','GATTO','FACCIO LE FUSA E MIAO.','🐱'],['hamster','CRICETO','SONO PICCOLO E CORRO NELLA RUOTA.','🐹']] },
    { id: 'toys', title: 'GIOCATTOLI', icon: '🧸', words: [
      ['cards','CARTE','MI MESCOLI E MI DISTRIBUISCI PER GIOCARE.'],['doll','BAMBOLA','SEMBRO UNA BAMBINA DA COCCOLARE.'],['videogame','VIDEOGIOCO','SI GIOCA CON UNO SCHERMO E I COMANDI.'],['plane','AEROPLANO','HO LE ALI E VOLO NEL CIELO.'],['ball','PALLA','SONO ROTONDA E RIMBALZO.'],['car','AUTOMOBILINA','HO QUATTRO RUOTE E UN VOLANTE.'],['skateboard','SKATEBOARD','SONO UNA TAVOLA CON QUATTRO RUOTE.'],['bike','BICICLETTA','HO DUE RUOTE E I PEDALI.']] }
  ];
  categoryData.forEach(category => {
    category.words = category.words.map(([word, italian, clue, emoji]) => ({
      word: word.toUpperCase(), italian,
      clue: category.id === 'colors' ? 'TROVA IL COLORE ' + italian + '.' : clue,
      picture: category.id === 'colors' ? '<span class="en-swatch" style="background:' + clue + '"></span>' : emoji || svg(drawings[word])
    }));
  });
  categoryData.push({ id: 'mixed', title: 'PROVA', icon: '🎲', words: categoryData.flatMap(category => category.words) });
  root.EnglishVocabulary = categoryData;
})(typeof window !== 'undefined' ? window : globalThis);
