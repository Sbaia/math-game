(function (root) {
  'use strict';
  const row = (word, group, clue, wrong) => ({ word, group, clue, wrong });
  root.ItalianVocabulary = {
    sounds: [
      row('FORCHETTA', 'CHE', 'SI USA A TAVOLA PER PRENDERE IL CIBO CON I SUOI DENTI.', ['FORCETTA', 'FORCHIETTA']),
      row('CHIAVE', 'CHI', 'APRE LA SERRATURA DI UNA PORTA.', ['CIAVE', 'CHAVE']),
      row('MARGHERITA', 'GHE', 'FIORE CON PETALI BIANCHI E CENTRO GIALLO.', ['MARGERITA', 'MARGHIRITA']),
      row('GHIRO', 'GHI', 'PICCOLO ANIMALE CHE DORME A LUNGO IN LETARGO.', ['GIRO', 'GHRO']),
      row('BAGNI', 'GNI', 'STANZE DELLA CASA CON LAVANDINO E VASCA O DOCCIA.', ['BANI', 'BAGHNI']),
      row('RAGNO', 'GN', 'ANIMALE CON OTTO ZAMPE CHE TESSE LA TELA.', ['RANIO', 'RAGHNO']),
      row('FOGLIA', 'GLI', 'PARTE VERDE CHE CRESCE SUI RAMI DI UN ALBERO.', ['FOLIA', 'FOGIA']),
      row('PESCE', 'SCE', 'ANIMALE CON PINNE CHE RESPIRA CON LE BRANCHIE.', ['PESCIE', 'PESHE']),
      row('SCIARPA', 'SCI', 'SI AVVOLGE INTORNO AL COLLO QUANDO FA FREDDO.', ['SIARPA', 'SHARPA'])
    ],
    doubles: [
      row('GATTO', 'TT', 'ANIMALE DOMESTICO CHE MIAGOLA.', ['GATO', 'GATTTO']),
      row('PALLA', 'LL', 'OGGETTO ROTONDO CHE SI LANCIA E RIMBALZA.', ['PALA', 'PALLLA']),
      row('PENNA', 'NN', 'SI USA PER SCRIVERE CON L’INCHIOSTRO.', ['PENA', 'PENNNA']),
      row('TETTO', 'TT', 'COPRE LA CASA E LA RIPARA DALLA PIOGGIA.', ['TETO', 'TETTTO']),
      row('MUCCA', 'CC', 'ANIMALE DELLA FATTORIA CHE MUGGISCE E PRODUCE LATTE.', ['MUCA', 'MUCCCA']),
      row('NONNO', 'NN', 'IL PAPÀ DELLA MAMMA O DEL PAPÀ.', ['NONO', 'NONNNO']),
      row('TAZZA', 'ZZ', 'RECIPIENTE CON MANICO PER BERE IL LATTE.', ['TAZA', 'TAZZZA']),
      row('CAPPELLO', 'PP', 'SI INDOSSA SULLA TESTA PER RIPARARSI DAL SOLE.', ['CAPELLO', 'CAPPPELLO'])
    ],
    accents: [
      row('CITTÀ', 'À', 'UN LUOGO ABITATO CON MOLTE CASE, STRADE E PIAZZE.', ['CITTA', 'CITTÁ']),
      row('CAFFÈ', 'È', 'BEVANDA SCURA DEGLI ADULTI PREPARATA CON CHICCHI TOSTATI.', ['CAFFE', 'CAFFÉ']),
      row('PERCHÉ', 'É', 'LA PAROLA CON CUI CHIEDI IL MOTIVO DI QUALCOSA.', ['PERCHE', 'PERCHÈ']),
      row('LUNEDÌ', 'Ì', 'IL GIORNO DELLA SETTIMANA CHE VIENE DOPO DOMENICA.', ['LUNEDI', 'LUNEDÍ']),
      row('PERÒ', 'Ò', 'UNA PAROLA CHE PUOI USARE AL POSTO DI «MA».', ['PERO', 'PERÓ']),
      row('PIÙ', 'Ù', 'IL SEGNO CHE USI PER FARE UN’ADDIZIONE SI CHIAMA COSÌ.', ['PIU', 'PIÚ']),
      row('PAPÀ', 'À', 'IL GENITORE CHE NON È LA MAMMA.', ['PAPA', 'PAPÁ']),
      row('GIÙ', 'Ù', 'IL CONTRARIO DI SU.', ['GIU', 'GIÚ'])
    ]
  };
})(typeof window === 'undefined' ? globalThis : window);
