// Ember Court — card data and table constants.
// Four houses, told apart by colour AND shape, never by text alone:
//   Ember  (red,    triangle) — direct damage
//   Tide   (blue,   circle)   — healing, drawing, slowing the Queen
//   Thorn  (green,  diamond)  — block and counter-damage
//   Stone  (gold,   square)   — block, gold and value plays

export const W = 1280;
export const H = 720;

export const SUITS = {
  ember: { name: 'Ember', color: '#e5484d', dark: '#8f1d22', shape: 'tri', glyph: '▲' },
  tide: { name: 'Tide', color: '#3e9bff', dark: '#144a7d', shape: 'circle', glyph: '●' },
  thorn: { name: 'Thorn', color: '#46a758', dark: '#1d4d2a', shape: 'diamond', glyph: '◆' },
  stone: { name: 'Stone', color: '#f5b301', dark: '#7a5b00', shape: 'square', glyph: '■' },
};

// id, house, cost, name, text, and the effect payload the engine applies.
export const CARD_DEFS = [
  { id: 'strike', house: 'ember', cost: 1, name: 'Ember Strike', text: 'Deal 4 damage.', dmg: 4 },
  { id: 'fireball', house: 'ember', cost: 3, name: 'Fireball', text: 'Deal 8 damage.', dmg: 8 },
  { id: 'immolate', house: 'ember', cost: 2, name: 'Immolate', text: 'Deal 3 damage. Burn 2 for 2 turns.', dmg: 3, burn: 2, burnTurns: 2 },
  { id: 'mend', house: 'tide', cost: 2, name: 'Tide Mend', text: 'Restore 7 life.', heal: 7 },
  { id: 'surge', house: 'tide', cost: 1, name: 'Surge', text: 'Draw 2 cards.', draw: 2 },
  { id: 'frostbind', house: 'tide', cost: 2, name: 'Frostbind', text: 'The Queen\u2019s next attack deals 4 less.', weaken: 4 },
  { id: 'thornwall', house: 'thorn', cost: 1, name: 'Thornwall', text: 'Gain 7 block.', block: 7 },
  { id: 'riposte', house: 'thorn', cost: 2, name: 'Riposte', text: 'Gain 5 block. Deal 5 damage.', block: 5, dmg: 5 },
  { id: 'overgrowth', house: 'thorn', cost: 2, name: 'Overgrowth', text: 'Gain 2 mana this turn.', mana: 2 },
  { id: 'bastion', house: 'stone', cost: 3, name: 'Bastion', text: 'Gain 12 block.', block: 12 },
  { id: 'gilded', house: 'stone', cost: 2, name: 'Gilded Edge', text: 'Deal 5 damage. Gain 5 gold.', dmg: 5, gold: 5 },
  { id: 'hoard', house: 'stone', cost: 0, name: 'Hoard', text: 'Gain 3 gold. Draw 1 card.', gold: 3, draw: 1 },
];

export const DECK_LIST = [
  'strike', 'strike', 'fireball', 'fireball', 'immolate', 'immolate',
  'mend', 'mend', 'surge', 'surge', 'frostbind', 'frostbind',
  'thornwall', 'thornwall', 'riposte', 'riposte', 'overgrowth', 'overgrowth',
  'bastion', 'bastion', 'gilded', 'gilded', 'hoard', 'hoard',
];

export const PLAYER_MAX_HP = 30;
export const QUEEN_MAX_HP = 30;
export const HAND_MAX = 8;
export const MANA_MAX = 10;
export const WIN_GOLD_BONUS = 25;

export function cardDef(id) {
  return CARD_DEFS.find((c) => c.id === id);
}

export function effectSummary(def) {
  const parts = [];
  if (def.dmg) parts.push(`${def.dmg} dmg`);
  if (def.block) parts.push(`+${def.block} block`);
  if (def.heal) parts.push(`+${def.heal} life`);
  if (def.draw) parts.push(`draw ${def.draw}`);
  if (def.gold) parts.push(`+${def.gold} gold`);
  if (def.burn) parts.push(`burn ${def.burn}`);
  if (def.mana) parts.push(`+${def.mana} mana`);
  if (def.weaken) parts.push(`weaken ${def.weaken}`);
  return parts.join(' · ');
}
