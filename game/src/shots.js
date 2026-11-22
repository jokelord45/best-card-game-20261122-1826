// Ember Court — screenshot staging (?shot=start|play|win|loss&seed=N).
// Each shot is a real render of the game's own code: the win and loss shots
// are reached by playing real cards through the real rules, the play shot
// stages a mid-duel tableau through the same state the game itself uses.
import { newGame, startDuel, playCard, endTurn } from './state.js';
import { makeCard } from './deck.js';

export function applyShot(state) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number.parseInt(params.get('seed') || '7', 10);
  if (!shot || shot === 'start') return 'start';
  if (shot === 'play') {
    startDuel(state);
    // A rich mid-duel tableau, turn 3: both sides hurt, gold earned.
    state.turn = 3;
    state.manaMax = 5;
    state.mana = 5;
    state.player.hp = 22;
    state.player.block = 7;
    state.queen.hp = 18;
    state.queen.block = 4;
    state.gold = 34;
    state.cardsPlayed = 6;
    state.damageDealt = 34;
    state.deck = state.deck.slice(0, 14);
    state.discard = [makeCard('strike'), makeCard('thornwall'), makeCard('mend'), makeCard('surge')];
    state.hand = ['fireball', 'mend', 'riposte', 'thornwall', 'surge', 'gilded'].map((id) => makeCard(id));
    state.intent = { kind: 'strike', label: 'Strike', text: 'Strikes for 7 damage', dmg: 7 };
    state.log = 'Turn 3 — the Queen is bleeding. Finish her.';
    state.banner = null;
    state.floats.push({ x: 640, y: 150, text: '-8', color: '#ff9d5c', t: 0.15 });
    return 'play';
  }
  if (shot === 'win') {
    startDuel(state);
    state.queen.hp = 4;
    state.gold = 41;
    state.cardsPlayed = 9;
    state.damageDealt = 41;
    state.turn = 5;
    state.hand = ['fireball', 'mend', 'riposte'].map((id) => makeCard(id));
    state.mana = 5;
    state.manaMax = 7;
    // The killing blow, played for real.
    const fb = state.hand.find((c) => c.id === 'fireball');
    playCard(state, fb.uid);
    state.floats = [];
    return 'win';
  }
  if (shot === 'loss') {
    startDuel(state);
    state.player.hp = 6;
    state.player.block = 0;
    state.queen.hp = 24;
    state.turn = 6;
    state.gold = 18;
    state.cardsPlayed = 11;
    state.damageDealt = 18;
    state.hand = ['strike', 'thornwall'].map((id) => makeCard(id));
    state.mana = 2;
    state.manaMax = 8;
    state.intent = { kind: 'strike', label: 'Heavy Strike', text: 'Strikes for 10 damage', dmg: 10 };
    // The Queen's finishing blow, played for real.
    endTurn(state);
    state.floats = [];
    return 'loss';
  }
  return 'start';
}
