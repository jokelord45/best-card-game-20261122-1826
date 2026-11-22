// Ember Court — every pixel on the table: the felt, the Queen, the hand,
// the mana, the log and the win / loss screens. Canvas 2D, no assets.
import { W, H, SUITS, effectSummary } from './config.js';

const CARD_W = 140;
const CARD_H = 196;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shape(ctx, kind, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (kind === 'tri') {
    ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s); ctx.lineTo(x - s, y + s);
  } else if (kind === 'circle') {
    ctx.arc(x, y, s, 0, Math.PI * 2);
  } else if (kind === 'diamond') {
    ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y);
  } else {
    ctx.rect(x - s, y - s, s * 2, s * 2);
  }
  ctx.closePath();
  ctx.fill();
}

function bar(ctx, x, y, w, h, frac, fill, bg) {
  ctx.fillStyle = bg;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (frac > 0) {
    ctx.fillStyle = fill;
    rr(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  rr(ctx, x, y, w, h, h / 2);
  ctx.stroke();
}

export function handLayout(n) {
  const spacing = Math.min(150, Math.max(60, 980 / Math.max(1, n)));
  const total = CARD_W + spacing * (n - 1);
  const startX = (W - total) / 2;
  const out = [];
  for (let i = 0; i < n; i++) {
    const cx = startX + i * spacing + CARD_W / 2;
    const arc = (i - (n - 1) / 2) * 4;
    out.push({ x: startX + i * spacing, y: 478 + Math.abs(i - (n - 1) / 2) * 6 - arc * 0, cx, cy: 478 + CARD_H / 2 });
  }
  return out;
}

export function drawCard(ctx, card, x, y, w, h, opts = {}) {
  const def = card.def;
  const suit = SUITS[def.house];
  const hover = opts.hover ? -14 : 0;
  const scale = opts.hover ? 1.06 : 1;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 + hover);
  ctx.scale(scale, scale);
  ctx.translate(-w / 2, -h / 2);
  if (opts.dim) ctx.globalAlpha = 0.45;
  // Body
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, 0, 0, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = suit.color;
  ctx.lineWidth = 3;
  rr(ctx, 2, 2, w - 4, h - 4, 8);
  ctx.stroke();
  // Header band
  ctx.fillStyle = suit.color;
  rr(ctx, 4, 4, w - 8, 30, 6);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold 13px Georgia, serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(suit.name.toUpperCase(), 12, 20);
  // Cost gem
  ctx.fillStyle = '#2b2b4a';
  ctx.beginPath();
  ctx.arc(w - 20, 20, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(def.cost), w - 20, 21);
  // Glyph
  shape(ctx, suit.shape, w / 2, 78, 26, suit.color);
  ctx.fillStyle = suit.dark;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(def.name, w / 2, 122);
  // Effect text
  ctx.fillStyle = '#333';
  ctx.font = '12px Georgia, serif';
  wrapText(ctx, def.text, w / 2, 142, w - 16, 15);
  // Summary line
  ctx.fillStyle = suit.dark;
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText(effectSummary(def), w / 2, h - 12);
  ctx.restore();
}

function wrapText(ctx, text, cx, y, maxW, lh) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lh));
}

function drawCardBack(ctx, x, y, w, h) {
  ctx.fillStyle = '#3a2b5c';
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = '#f5b301';
  ctx.lineWidth = 2;
  rr(ctx, x + 3, y + 3, w - 6, h - 6, 6);
  ctx.stroke();
  shape(ctx, 'diamond', x + w / 2, y + h / 2, Math.min(w, h) / 4, '#f5b301');
}

function drawAvatar(ctx, x, y, r, kind, name, hp, maxHp, block, burn, label) {
  // Portrait medallion
  ctx.fillStyle = kind === 'queen' ? '#2a1a3a' : '#1a2a3a';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = kind === 'queen' ? '#f5b301' : '#7dd8ff';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fdf6e3';
  ctx.font = `bold ${Math.round(r * 0.7)}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(kind === 'queen' ? '♛' : '♞', x, y + 2);
  // Name + HP
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(name, x + r + 12, y - r + 16);
  bar(ctx, x + r + 12, y - r + 30, 190, 16, hp / maxHp, hp / maxHp > 0.35 ? '#e5484d' : '#ff2222', '#3a0d0d');
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px Georgia, serif';
  let hpText = `${hp} / ${maxHp}`;
  if (block > 0) hpText += `   🛡 ${block} block`;
  if (burn > 0) hpText += `   🔥 burn ${burn}`;
  ctx.fillText(hpText, x + r + 12, y - r + 56);
  if (label) {
    ctx.fillStyle = '#c9b8ff';
    ctx.font = 'italic 12px Georgia, serif';
    ctx.fillText(label, x + r + 12, y + r + 16);
  }
}

function drawMana(ctx, state) {
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('MANA', 24, 316);
  for (let i = 0; i < 10; i++) {
    const x = 84 + i * 24;
    const lit = i < state.mana;
    const cap = i < state.manaMax;
    ctx.globalAlpha = cap ? 1 : 0.25;
    shape(ctx, 'diamond', x, 316, 9, lit ? '#3e9bff' : '#5a5a6e');
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = '#c9d6ff';
  ctx.font = '13px Georgia, serif';
  ctx.fillText(`${state.mana} / ${state.manaMax}`, 330, 316);
}

function drawPlayerPanel(ctx, state) {
  // Left-side panel, clear of the hand: portrait, name, life, mana.
  drawAvatar(ctx, 66, 210, 30, 'knight', 'Ember Knight — you', state.player.hp, state.player.maxHp, state.player.block, state.player.burn, null);
  drawMana(ctx, state);
  ctx.fillStyle = '#c9d6ff';
  ctx.font = 'italic 12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('Your life, block and mana — spend mana to play cards.', 24, 344);
}

function drawTable(ctx, state) {
  // Felt
  const g = ctx.createRadialGradient(640, 330, 80, 640, 360, 760);
  g.addColorStop(0, '#1e5c3a');
  g.addColorStop(1, '#0d2f1c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Gold trim
  ctx.strokeStyle = 'rgba(245,179,1,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(640, 360, 600, 300, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(245,179,1,0.25)';
  ctx.beginPath();
  ctx.ellipse(640, 360, 560, 262, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Centre emblem
  ctx.save();
  ctx.globalAlpha = 0.12;
  shape(ctx, 'diamond', 640, 330, 90, '#f5b301');
  ctx.restore();
  ctx.fillStyle = 'rgba(245,179,1,0.55)';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('· EMBER COURT ·', 640, 330);
}

function drawEndTurn(ctx, state) {
  const x = 1120, y = 640, w = 136, h = 46;
  ctx.fillStyle = state.screen === 'playing' ? '#f5b301' : '#555';
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = '#7a5b00';
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 8);
  ctx.stroke();
  ctx.fillStyle = '#241a00';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('END TURN ⏎', x + w / 2, y + h / 2 + 1);
  return { x, y, w, h };
}

function drawPiles(ctx, state) {
  // Deck (left)
  ctx.fillStyle = '#3a2b5c';
  rr(ctx, 24, 500, 64, 88, 8);
  ctx.fill();
  ctx.strokeStyle = '#f5b301';
  ctx.lineWidth = 2;
  rr(ctx, 24, 500, 64, 88, 8);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(state.deck.length), 56, 540);
  ctx.font = '11px Georgia, serif';
  ctx.fillText('DECK', 56, 566);
  // Discard (right, above End Turn)
  ctx.fillStyle = '#2b2b4a';
  rr(ctx, 1120, 500, 64, 88, 8);
  ctx.fill();
  ctx.strokeStyle = '#888';
  rr(ctx, 1120, 500, 64, 88, 8);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(String(state.discard.length), 1152, 540);
  ctx.font = '11px Georgia, serif';
  ctx.fillText('DISCARD', 1152, 566);
}

export function render(ctx, state, hoverUid) {
  ctx.save();
  if (state.shake > 0) {
    const s = state.shake;
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    state.shake = Math.max(0, state.shake - 0.6);
  }
  drawTable(ctx, state);

  if (state.screen === 'title') {
    renderTitle(ctx, state);
    ctx.restore();
    return;
  }

  // --- The Queen (top) ---
  drawAvatar(ctx, 640, 78, 40, 'queen', 'Ashen Queen', state.queen.hp, state.queen.maxHp, state.queen.block, state.queen.burn, null);
  // Her face-down hand
  for (let i = 0; i < state.queenHandCount; i++) {
    drawCardBack(ctx, 990 + i * 26, 34, 44, 62);
  }
  ctx.fillStyle = '#c9b8ff';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${state.queenHandCount} cards`, 990, 112);
  // Intent chip
  if (state.intent && state.screen === 'playing') {
    ctx.fillStyle = 'rgba(20,10,30,0.85)';
    rr(ctx, 400, 128, 480, 34, 8);
    ctx.fill();
    ctx.strokeStyle = '#f5b301';
    ctx.lineWidth = 1.5;
    rr(ctx, 400, 128, 480, 34, 8);
    ctx.stroke();
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Queen plots: ${state.intent.label} — ${state.intent.text}`, 640, 146);
  }

  // --- Played-card animation ---
  if (state.playedAnim && state.playedAnim.t < 1) {
    const a = state.playedAnim;
    const p = a.t;
    const x = 640 - CARD_W / 2 + (1 - p) * 0;
    const y = 478 - (478 - 250) * Math.min(1, p * 1.4);
    ctx.save();
    ctx.globalAlpha = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
    drawCard(ctx, a.card, x, y, CARD_W, CARD_H);
    ctx.restore();
  }

  // --- Player panel (left side, clear of the hand) ---
  drawPlayerPanel(ctx, state);
  drawPiles(ctx, state);
  drawEndTurn(ctx, state);

  // --- Hand ---
  const layout = handLayout(state.hand.length);
  state.hand.forEach((card, i) => {
    const pos = layout[i];
    const hover = hoverUid === card.uid;
    drawCard(ctx, card, pos.x, pos.y - (hover ? 26 : 0), CARD_W, CARD_H, {
      hover,
      dim: state.screen === 'playing' && card.def.cost > state.mana,
    });
  });

  // --- Gold + turn ---
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`◆ ${state.gold} gold`, 1256, 30);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(`Turn ${state.turn}`, 1256, 52);

  // --- Log ---
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  rr(ctx, 240, 690, 800, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#f0e6c8';
  ctx.font = 'italic 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.log, 640, 704);

  // --- Turn banner ---
  if (state.banner && state.banner.t < 1.6) {
    const b = state.banner;
    ctx.save();
    ctx.globalAlpha = b.t < 0.2 ? b.t / 0.2 : b.t > 1.2 ? 1 - (b.t - 1.2) / 0.4 : 1;
    ctx.fillStyle = 'rgba(20,10,30,0.8)';
    rr(ctx, 440, 300, 400, 84, 10);
    ctx.fill();
    ctx.strokeStyle = '#f5b301';
    ctx.lineWidth = 2;
    rr(ctx, 440, 300, 400, 84, 10);
    ctx.stroke();
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText(b.text, 640, 334);
    ctx.fillStyle = '#fff';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText(b.sub, 640, 362);
    ctx.restore();
  }

  // --- Floating numbers ---
  state.floats.forEach((f) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
    ctx.fillStyle = f.color;
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y - f.t * 46);
    ctx.restore();
  });

  if (state.screen === 'won' || state.screen === 'lost') renderEnd(ctx, state);
  ctx.restore();
}

function renderTitle(ctx, state) {
  ctx.fillStyle = 'rgba(10,6,20,0.55)';
  ctx.fillRect(0, 0, W, H);
  // Sample fanned cards
  const samples = [
    { def: { id: 'fireball', house: 'ember', cost: 3, name: 'Fireball', text: 'Deal 8 damage.', dmg: 8 } },
    { def: { id: 'mend', house: 'tide', cost: 2, name: 'Tide Mend', text: 'Restore 7 life.', heal: 7 } },
    { def: { id: 'bastion', house: 'stone', cost: 3, name: 'Bastion', text: 'Gain 12 block.', block: 12 } },
  ];
  samples.forEach((c, i) => {
    ctx.save();
    ctx.translate(640 + (i - 1) * 165, 430);
    ctx.rotate((i - 1) * 0.12);
    drawCard(ctx, c, -70, -98, CARD_W, CARD_H);
    ctx.restore();
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd94d';
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('EMBER COURT', 640, 130);
  ctx.fillStyle = '#fff';
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillText('A duel of cards against the Ashen Queen', 640, 168);
  ctx.fillStyle = '#f0e6c8';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Play cards with mana · Block her strikes · Break her guard · First to 0 life loses', 640, 660);
  ctx.fillStyle = '#f5b301';
  rr(ctx, 490, 200, 300, 52, 10);
  ctx.fill();
  ctx.fillStyle = '#241a00';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('▶  BEGIN THE DUEL', 640, 220);
  ctx.fillStyle = '#c9b8ff';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Click a card to play it · 1–8 keys play cards · Space ends your turn · R restarts', 640, 268);
}

function renderEnd(ctx, state) {
  const won = state.screen === 'won';
  ctx.fillStyle = 'rgba(10,6,20,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = won ? '#f5b301' : '#3a2b5c';
  rr(ctx, 390, 180, 500, 330, 14);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  rr(ctx, 390, 180, 500, 330, 14);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#241a00' : '#fff';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.fillText(won ? 'VICTORY!' : 'DEFEAT', 640, 260);
  ctx.font = 'italic 19px Georgia, serif';
  ctx.fillText(
    won ? 'The Ashen Queen falls. The Court is yours!' : 'The Ashen Queen claims another knight.',
    640, 296,
  );
  ctx.font = '17px Georgia, serif';
  ctx.fillText(`◆ ${state.gold} gold earned`, 640, 340);
  ctx.fillText(`Turn ${state.turn}  ·  ${state.cardsPlayed} cards played  ·  ${state.damageDealt} damage dealt`, 640, 370);
  ctx.fillStyle = won ? '#241a00' : '#ffd94d';
  rr(ctx, 520, 410, 240, 52, 10);
  ctx.fill();
  ctx.fillStyle = won ? '#f5b301' : '#241a00';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(won ? '↻  PLAY AGAIN' : '↻  TRY AGAIN', 640, 430);
  ctx.fillStyle = won ? '#241a00' : '#c9b8ff';
  ctx.font = '14px Georgia, serif';
  ctx.fillText('Press R to play again', 640, 492);
}

export function endTurnButtonRect() {
  return { x: 1120, y: 640, w: 136, h: 46 };
}

export function titleButtonRect() {
  return { x: 490, y: 200, w: 300, h: 52 };
}

export function endScreenButtonRect() {
  return { x: 520, y: 410, w: 240, h: 52 };
}
