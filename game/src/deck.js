// Ember Court — the draw pile, hand and discard pile.
import { DECK_LIST, HAND_MAX, cardDef } from './config.js';
import { shuffle } from './random.js';

let uid = 1;

export function makeCard(id) {
  return { uid: uid++, id, def: cardDef(id) };
}

export function buildDeck(rand) {
  return shuffle(DECK_LIST.map((id) => makeCard(id)), rand);
}

export function drawCards(state, n) {
  for (let i = 0; i < n; i++) {
    if (state.hand.length >= HAND_MAX) break;
    if (state.deck.length === 0) {
      if (state.discard.length === 0) break;
      state.deck = shuffle(state.discard, state.rand);
      state.discard = [];
      state.reshuffles++;
    }
    state.hand.push(state.deck.pop());
  }
}

export function discardHand(state) {
  state.discard.push(...state.hand);
  state.hand = [];
}
