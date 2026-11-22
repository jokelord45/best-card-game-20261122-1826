// Ember Court — bootstrap: canvas, game loop, staged screenshots,
// and the status line the playtest reads.
import { W, H } from './config.js';
import { newGame } from './state.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { makeAudio } from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
canvas.width = W;
canvas.height = H;

const params = new URLSearchParams(window.location.search);
const seed = Number.parseInt(params.get('seed') || '7', 10);
const state = newGame(seed);
const audio = makeAudio();
attachInput(canvas, state, audio);

const shot = applyShot(state);
let lastScreen = state.screen;
let frames = 0;

function setStatus() {
  const s = state.screen;
  const text = s === 'title'
    ? 'title: Ember Court — press Space or click to begin the duel'
    : s === 'playing'
      ? `playing: turn ${state.turn}, mana ${state.mana}/${state.manaMax}, hand ${state.hand.length}, player ${state.player.hp} HP, queen ${state.queen.hp} HP, gold ${state.gold}`
      : s === 'won'
        ? `won: victory, ${state.gold} gold, turn ${state.turn}, ${state.cardsPlayed} cards played`
        : `lost: defeat, ${state.gold} gold, turn ${state.turn}, ${state.cardsPlayed} cards played`;
  statusEl.textContent = text;
  document.title = `Ember Court — ${text}`;
}

function tick(dt) {
  // Advance short-lived effects.
  state.floats.forEach((f) => { f.t += dt; });
  state.floats = state.floats.filter((f) => f.t < 1.1);
  if (state.banner) state.banner.t += dt;
  if (state.playedAnim) {
    state.playedAnim.t += dt * 1.4;
    if (state.playedAnim.t >= 1) state.playedAnim = null;
  }
  if (state.screen !== lastScreen) {
    if (state.screen === 'won') audio.play('win');
    if (state.screen === 'lost') audio.play('lose');
    lastScreen = state.screen;
  }
  setStatus();
  render(ctx, state);
  frames++;
  if (shot && frames === 20) window.__shotReady = true;
  requestAnimationFrame((t) => tick(0.016));
}

setStatus();
render(ctx, state);
requestAnimationFrame(() => tick(0.016));
if (!shot || shot === 'start') {
  // Title shot: ready as soon as the first frames paint.
  setTimeout(() => { window.__shotReady = true; }, 400);
}
