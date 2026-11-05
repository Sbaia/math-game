(function (root) {
  'use strict';
  root.EnglishSpeech = function (onChange) {
    const synth = root.speechSynthesis;
    let voice = null;
    let stopped = false;
    let generation = 0;
    function refresh() {
      const voices = synth && synth.getVoices ? synth.getVoices() : [];
      voice = voices.find(v => /^en[-_]GB$/i.test(v.lang)) || voices.find(v => /^en(?:[-_]|$)/i.test(v.lang)) || null;
      if (!stopped && onChange) onChange(!!voice);
    }
    if (synth && synth.addEventListener) synth.addEventListener('voiceschanged', refresh);
    refresh();
    return {
      available: () => !!voice && !!root.SpeechSynthesisUtterance && !stopped,
      speak(word, feedback) {
        if (stopped) return false;
        refresh();
        if (!voice || !root.SpeechSynthesisUtterance) {
          feedback('AUDIO INGLESE NON DISPONIBILE. SCEGLI UN ALTRO GIOCO O ATTIVA UNA VOCE INGLESE NEL DISPOSITIVO.');
          return false;
        }
        const current = ++generation;
        synth.cancel();
        const utterance = new root.SpeechSynthesisUtterance(word);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = 0.8;
        utterance.onerror = () => { if (!stopped && current === generation) feedback('AUDIO NON RIUSCITO. PREMI ASCOLTA PER RIPROVARE.'); };
        try { synth.speak(utterance); return true; }
        catch (_) { feedback('AUDIO NON RIUSCITO. PREMI ASCOLTA PER RIPROVARE.'); return false; }
      },
      cancel() { generation++; if (synth) synth.cancel(); },
      stop() {
        stopped = true;
        generation++;
        if (synth) {
          synth.cancel();
          if (synth.removeEventListener) synth.removeEventListener('voiceschanged', refresh);
        }
      }
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
