// Ember Court — tiny synthesized sounds, no audio files: a WebAudio
// blip for playing a card, a low thud for damage, a little fanfare for a win.
export function makeAudio() {
  let ctx = null;
  let muted = false;
  function ensure() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type, vol, when = 0) {
    const ac = ensure();
    if (!ac || muted) return;
    const t = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur);
  }
  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; },
    get muted() { return muted; },
    play(kind) {
      if (muted) return;
      if (kind === 'play') { tone(520, 0.09, 'triangle', 0.12); tone(780, 0.1, 'triangle', 0.1, 0.05); }
      else if (kind === 'deny') { tone(160, 0.12, 'square', 0.06); }
      else if (kind === 'endturn') { tone(330, 0.1, 'sine', 0.1); tone(220, 0.14, 'sine', 0.1, 0.08); }
      else if (kind === 'start') { tone(392, 0.1, 'triangle', 0.12); tone(523, 0.1, 'triangle', 0.12, 0.09); tone(659, 0.16, 'triangle', 0.12, 0.18); }
      else if (kind === 'win') { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, i * 0.12)); }
      else if (kind === 'lose') { [330, 262, 196].forEach((f, i) => tone(f, 0.25, 'sine', 0.1, i * 0.16)); }
    },
  };
}
