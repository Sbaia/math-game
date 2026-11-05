(function (root) {
  'use strict';
  root.ItalianSpeech = function (notify) {
    const synth = root.speechSynthesis;
    let generation = 0;
    let disposed = false;
    function voice() {
      const voices = synth ? synth.getVoices() : [];
      return voices.find(v => /^it[-_]IT$/i.test(v.lang)) || voices.find(v => /^it(?:[-_]|$)/i.test(v.lang));
    }
    function changed() { if (!disposed) notify(voice() ? 'AUDIO ITALIANO PRONTO.' : 'VOCE ITALIANA NON DISPONIBILE. PROVA UN ALTRO GIOCO.'); }
    if (synth) synth.addEventListener('voiceschanged', changed);
    function cancel() { generation++; if (synth) synth.cancel(); }
    return {
      speak(word, ready) {
        cancel();
        const token = generation;
        const selected = voice();
        if (disposed || !selected || !root.SpeechSynthesisUtterance) {
          notify('VOCE ITALIANA NON DISPONIBILE. PROVA UN ALTRO GIOCO.');
          return false;
        }
        const utterance = new root.SpeechSynthesisUtterance(word);
        utterance.lang = selected.lang;
        utterance.voice = selected;
        utterance.rate = 0.8;
        utterance.onend = () => { if (!disposed && token === generation) { notify('ORA SCRIVI LA PAROLA.'); ready(); } };
        utterance.onerror = () => {
          if (!disposed && token === generation) { generation++; notify('AUDIO NON RIUSCITO. PREMI ASCOLTA PER RIPROVARE.'); }
        };
        try { synth.speak(utterance); notify('ASCOLTA LA PAROLA.'); return true; }
        catch (_) { notify('AUDIO NON RIUSCITO. PREMI ASCOLTA PER RIPROVARE.'); return false; }
      },
      cancel,
      stop() { disposed = true; cancel(); if (synth) synth.removeEventListener('voiceschanged', changed); }
    };
  };
})(typeof window === 'undefined' ? globalThis : window);
