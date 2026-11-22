// Ember Court — the Ashen Queen's brain: a readable intent each turn,
// so the player can counter it instead of guessing.
import { QUEEN_MAX_HP } from './config.js';

// Intent kinds the Queen announces before she acts.
export function chooseIntent(state) {
  const r = state.rand();
  const queenLow = state.queen.hp <= QUEEN_MAX_HP * 0.4;
  const playerTurtled = state.player.block >= 10;
  if (queenLow && r < 0.35) return { kind: 'drain', label: 'Drain', text: 'Drains 5 life and heals 5', dmg: 5, heal: 5 };
  if (playerTurtled && r < 0.45) return { kind: 'hex', label: 'Hex', text: 'Curses you: burn 3 for 2 turns', burn: 3, burnTurns: 2 };
  if (r < 0.45) return { kind: 'strike', label: 'Strike', text: 'Strikes for 7 damage', dmg: 7 };
  if (r < 0.7) return { kind: 'guard', label: 'Guard', text: 'Raises 8 block', block: 8 };
  if (r < 0.85) return { kind: 'strike', label: 'Heavy Strike', text: 'Strikes for 10 damage', dmg: 10 };
  return { kind: 'hex', label: 'Hex', text: 'Curses you: burn 2 for 2 turns', burn: 2, burnTurns: 2 };
}

export function describeIntent(intent) {
  return `${intent.label} — ${intent.text}`;
}
