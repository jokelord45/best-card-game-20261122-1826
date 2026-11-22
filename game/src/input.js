// Ember Court — mouse and keyboard: click a card to play it, click
// END TURN (or Space) to let the Queen act, R to restart.
import { playCard, endTurn, startDuel, restart } from './state.js';
import {
  handLayout, endTurnButtonRect, titleButtonRect, endScreenButtonRect,
} from './render.js';

function inside(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function attachInput(canvas, state, audio) {
  let hoverUid = null;
  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1280,
      y: ((e.clientY - rect.top) / rect.height) * 720,
    };
  };

  canvas.addEventListener('mousemove', (e) => {
    const { x, y } = getPos(e);
    hoverUid = null;
    if (state.screen === 'playing') {
      const layout = handLayout(state.hand.length);
      for (let i = state.hand.length - 1; i >= 0; i--) {
        const pos = layout[i];
        if (inside({ x: pos.x, y: pos.y - 26, w: 140, h: 196 }, x, y)) {
          hoverUid = state.hand[i].uid;
          break;
        }
      }
    }
    state.hoverUid = hoverUid;
  });

  canvas.addEventListener('click', (e) => {
    const { x, y } = getPos(e);
    audio.unlock();
    if (state.screen === 'title') {
      startDuel(state);
      audio.play('start');
      return;
    }
    if (state.screen === 'won' || state.screen === 'lost') {
      if (inside(endScreenButtonRect(), x, y)) {
        restart(state);
        audio.play('start');
      }
      return;
    }
    if (state.screen !== 'playing') return;
    if (inside(endTurnButtonRect(), x, y)) {
      audio.play('endturn');
      endTurn(state);
      return;
    }
    const layout = handLayout(state.hand.length);
    for (let i = state.hand.length - 1; i >= 0; i--) {
      const pos = layout[i];
      if (inside({ x: pos.x, y: pos.y - 26, w: 140, h: 196 }, x, y)) {
        const ok = playCard(state, state.hand[i].uid);
        audio.play(ok ? 'play' : 'deny');
        return;
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      audio.unlock();
      if (state.screen === 'title') { startDuel(state); audio.play('start'); }
      else if (state.screen === 'playing') { audio.play('endturn'); endTurn(state); }
      else { restart(state); audio.play('start'); }
      return;
    }
    if (e.key === 'Enter') {
      if (state.screen === 'playing') { audio.play('endturn'); endTurn(state); }
      else if (state.screen === 'title') { startDuel(state); audio.play('start'); }
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      if (state.screen !== 'title') { restart(state); audio.play('start'); }
      return;
    }
    if (e.key === 'm' || e.key === 'M') { audio.toggleMute(); return; }
    const n = Number.parseInt(e.key, 10);
    if (state.screen === 'playing' && n >= 1 && n <= state.hand.length) {
      const ok = playCard(state, state.hand[n - 1].uid);
      audio.play(ok ? 'play' : 'deny');
    }
  });

  return { get hoverUid() { return state.hoverUid; } };
}
