// Ember Court — the duel itself: turns, mana, damage, block, burn,
// gold and the win / loss screens. Pure logic, no drawing here.
import {
  PLAYER_MAX_HP, QUEEN_MAX_HP, MANA_MAX, WIN_GOLD_BONUS, cardDef,
} from './config.js';
import { buildDeck, drawCards, discardHand } from './deck.js';
import { chooseIntent } from './enemy.js';
import { mulberry32 } from './random.js';

export function newGame(seed) {
  const rand = mulberry32(seed || (Date.now() % 2147483647));
  const state = {
    rand,
    seed: seed || 0,
    screen: 'title', // title | playing | won | lost
    turn: 0,
    mana: 3,
    manaMax: 3,
    gold: 0,
    cardsPlayed: 0,
    damageDealt: 0,
    reshuffles: 0,
    player: { hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP, block: 0, burn: 0, burnTurns: 0, weaken: 0 },
    queen: { hp: QUEEN_MAX_HP, maxHp: QUEEN_MAX_HP, block: 0, burn: 0, burnTurns: 0 },
    deck: [],
    hand: [],
    discard: [],
    intent: null,
    log: 'The Ashen Queen awaits your challenge.',
    logTurn: 0,
    floats: [], // {x, y, text, color, t}
    shake: 0,
    banner: null, // {text, sub, t}
    playedAnim: null, // {card, t}
    enemyActed: false,
    queenHandCount: 5,
  };
  state.deck = buildDeck(rand);
  drawCards(state, 4);
  state.intent = chooseIntent(state);
  return state;
}

export function startDuel(state) {
  state.screen = 'playing';
  state.turn = 1;
  state.manaMax = 3;
  state.mana = 3;
  state.banner = { text: 'TURN 1', sub: 'Your move, Knight', t: 0 };
  state.log = 'Your move — play cards, then End Turn.';
}

function applyBurn(target, state, who) {
  if (target.burn > 0 && target.burnTurns > 0) {
    const dmg = target.burn;
    target.hp = Math.max(0, target.hp - dmg);
    target.burnTurns--;
    if (target.burnTurns === 0) target.burn = 0;
    state.log = `${who} burns for ${dmg}.`;
    return dmg;
  }
  return 0;
}

function dealDamage(target, amount, state, x, y, color) {
  let left = amount;
  if (target.block > 0) {
    const absorbed = Math.min(target.block, left);
    target.block -= absorbed;
    left -= absorbed;
  }
  if (left > 0) {
    target.hp = Math.max(0, target.hp - left);
    state.shake = 10;
  }
  if (x !== undefined) state.floats.push({ x, y, text: left > 0 ? `-${left}` : 'BLOCKED', color: color || '#fff', t: 0 });
  return left;
}

export function canPlay(state, card) {
  return state.screen === 'playing' && card.def.cost <= state.mana;
}

export function playCard(state, uid) {
  const idx = state.hand.findIndex((c) => c.uid === uid);
  if (idx < 0) return false;
  const card = state.hand[idx];
  const def = card.def;
  if (!canPlay(state, card)) {
    state.log = def.cost > state.mana ? `Not enough mana for ${def.name}.` : 'You cannot play that now.';
    return false;
  }
  state.mana -= def.cost;
  state.hand.splice(idx, 1);
  state.discard.push(card);
  state.cardsPlayed++;
  state.playedAnim = { card, t: 0 };

  // Order: block/heal/draw/mana first, then damage, then burn.
  if (def.block) {
    state.player.block += def.block;
    state.floats.push({ x: 300, y: 560, text: `+${def.block} BLOCK`, color: '#7dd87d', t: 0 });
  }
  if (def.heal) {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + def.heal);
    state.floats.push({ x: 300, y: 560, text: `+${def.heal} LIFE`, color: '#7dd8ff', t: 0 });
  }
  if (def.mana) state.mana = Math.min(MANA_MAX, state.mana + def.mana);
  if (def.draw) drawCards(state, def.draw);
  if (def.gold) {
    state.gold += def.gold;
    state.floats.push({ x: 640, y: 330, text: `+${def.gold} GOLD`, color: '#ffd94d', t: 0 });
  }
  if (def.dmg) {
    state.damageDealt += def.dmg;
    state.gold += def.dmg;
    dealDamage(state.queen, def.dmg, state, 640, 150, '#ff9d5c');
  }
  if (def.burn) {
    state.queen.burn = def.burn;
    state.queen.burnTurns = def.burnTurns;
    state.log = `${def.name} — the Queen burns ${def.burn} for ${def.burnTurns} turns.`;
  } else if (def.weaken) {
    state.player.weaken = def.weaken;
    state.log = `${def.name} — the Queen's next attack is weakened by ${def.weaken}.`;
  } else if (!def.burn) {
    state.log = `You played ${def.name}.`;
  }
  checkEnd(state);
  return true;
}

export function endTurn(state) {
  if (state.screen !== 'playing') return;
  // The Queen's burn ticks, then she acts on her announced intent.
  applyBurn(state.queen, state, 'The Queen');
  const intent = state.intent;
  state.enemyActed = true;
  if (intent) {
    if (intent.dmg) {
      let dmg = intent.dmg;
      if (state.player.weaken > 0) {
        dmg = Math.max(0, dmg - state.player.weaken);
        state.player.weaken = 0;
      }
      const dealt = dealDamage(state.player, dmg, state, 300, 560, '#ff6b6b');
      state.log = `The Queen ${intent.kind === 'drain' ? 'drains you' : 'strikes'} for ${dealt}.`;
      if (intent.heal) state.queen.hp = Math.min(state.queen.maxHp, state.queen.hp + intent.heal);
    } else if (intent.block) {
      state.queen.block += intent.block;
      state.floats.push({ x: 640, y: 150, text: `+${intent.block} BLOCK`, color: '#7dd87d', t: 0 });
      state.log = 'The Queen raises her guard.';
    } else if (intent.burn) {
      state.player.burn = intent.burn;
      state.player.burnTurns = intent.burnTurns;
      state.log = `The Queen hexes you — burn ${intent.burn} for ${intent.burnTurns} turns.`;
    }
  }
  if (checkEnd(state)) return;
  // Your burn ticks at the start of your turn, then a fresh hand.
  applyBurn(state.player, state, 'You');
  if (checkEnd(state)) return;
  state.player.block = 0;
  state.turn++;
  state.manaMax = Math.min(MANA_MAX, 2 + state.turn);
  state.mana = state.manaMax;
  discardHand(state);
  drawCards(state, 2);
  state.intent = chooseIntent(state);
  state.queenHandCount = 3 + Math.floor(state.rand() * 4);
  state.banner = { text: `TURN ${state.turn}`, sub: 'Your move, Knight', t: 0 };
  checkEnd(state);
}

function checkEnd(state) {
  if (state.queen.hp <= 0) {
    state.screen = 'won';
    state.gold += WIN_GOLD_BONUS;
    state.log = 'The Ashen Queen falls. The Court is yours!';
    return true;
  }
  if (state.player.hp <= 0) {
    state.screen = 'lost';
    state.log = 'The Ashen Queen claims another knight.';
    return true;
  }
  return false;
}

export function restart(state) {
  const fresh = newGame(state.seed || 7);
  Object.keys(fresh).forEach((k) => { state[k] = fresh[k]; });
  startDuel(state);
}

export function scoreLine(state) {
  const result = state.screen === 'won' ? 'VICTORY' : state.screen === 'lost' ? 'DEFEAT' : 'IN PROGRESS';
  return `${result} · ${state.gold} gold · turn ${state.turn} · ${state.cardsPlayed} cards played · ${state.damageDealt} damage dealt`;
}
