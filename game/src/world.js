// SPDX-License-Identifier: MIT
// Embercrown rules engine: pure state and moves, no DOM, so the same code
// drives the live game, the AI and the staged screenshot scenes.
import { buildDeck } from './cards.js';
import { makeRng } from './random.js';

export const START_LIFE = 20;
export const MAX_BOARD = 5;
export const MAX_EMBER = 8;

let uidCounter = 1;
function instantiate(def) {
  return { uid: uidCounter++, def, hp: def.hp, atk: def.atk, ready: def.ability === 'rush', justPlayed: true };
}
function side() {
  return { life: START_LIFE, ember: 0, maxEmber: 0, deck: [], hand: [], board: [], fatigue: 0 };
}

export function createGame(seed) {
  uidCounter = 1;
  const rng = makeRng(seed);
  const game = { seed, turn: 1, active: 'player', winner: null, log: [], rng, player: side(), foe: side() };
  game.player.deck = buildDeck(rng);
  game.foe.deck = buildDeck(rng);
  for (let i = 0; i < 4; i += 1) { draw(game, 'player'); draw(game, 'foe'); }
  startTurn(game, 'player');
  log(game, 'Your turn. Play cards, then attack!');
  return game;
}

export function log(game, text) { game.log.push(text); if (game.log.length > 40) game.log.shift(); }
export function other(who) { return who === 'player' ? 'foe' : 'player'; }

export function draw(game, who) {
  const s = game[who];
  if (s.deck.length === 0) {
    s.fatigue += 1;
    s.life -= s.fatigue;
    log(game, `${who === 'player' ? 'You take' : 'The rival takes'} ${s.fatigue} fatigue damage.`);
    checkWinner(game);
    return null;
  }
  const card = instantiate(s.deck.pop());
  if (s.hand.length >= 8) { log(game, 'A card burns away — hand is full.'); return card; }
  s.hand.push(card);
  return card;
}

export function startTurn(game, who) {
  const s = game[who];
  game.active = who;
  s.maxEmber = Math.min(MAX_EMBER, s.maxEmber + 1);
  s.ember = s.maxEmber;
  for (const c of s.board) { c.ready = true; c.justPlayed = false; }
  if (!(game.turn === 1 && who === 'player')) draw(game, who);
}

export function playable(game, who, handIndex) {
  const s = game[who];
  const card = s.hand[handIndex];
  return !!card && game.active === who && !game.winner && card.def.cost <= s.ember && s.board.length < MAX_BOARD;
}

export function playCard(game, who, handIndex) {
  if (!playable(game, who, handIndex)) return false;
  const s = game[who];
  const [card] = s.hand.splice(handIndex, 1);
  s.ember -= card.def.cost;
  card.ready = card.def.ability === 'rush';
  s.board.push(card);
  log(game, `${who === 'player' ? 'You play' : 'Rival plays'} ${card.def.name}.`);
  if (card.def.ability === 'keen') draw(game, who);
  return true;
}

function guardsOf(board) { return board.filter((c) => c.def.ability === 'guard'); }

export function legalTargets(game, who, boardIndex) {
  const mine = game[who].board[boardIndex];
  if (!mine || !mine.ready || game.active !== who || game.winner) return null;
  const foe = game[other(who)];
  const guards = guardsOf(foe.board);
  return { hero: guards.length === 0, creatures: guards.length ? guards : foe.board };
}

/** target: { hero: true } or { index } on the enemy board. */
export function attack(game, who, boardIndex, target) {
  const legal = legalTargets(game, who, boardIndex);
  if (!legal) return false;
  const me = game[who]; const foe = game[other(who)];
  const attacker = me.board[boardIndex];
  if (target.hero) {
    if (!legal.hero) return false;
    foe.life -= attacker.atk;
    if (attacker.def.ability === 'siphon') me.life += attacker.atk;
    log(game, `${attacker.def.name} hits ${who === 'player' ? 'the rival hero' : 'your hero'} for ${attacker.atk}.`);
  } else {
    const defender = foe.board[target.index];
    if (!defender || !legal.creatures.includes(defender)) return false;
    defender.hp -= attacker.atk;
    attacker.hp -= defender.atk;
    if (attacker.def.ability === 'siphon' && defender.atk) { /* siphon only heals off hero damage */ }
    log(game, `${attacker.def.name} clashes with ${defender.def.name}.`);
  }
  attacker.ready = false;
  sweepDead(game);
  checkWinner(game);
  return true;
}

export function sweepDead(game) {
  for (const who of ['player', 'foe']) {
    const s = game[who];
    const dead = s.board.filter((c) => c.hp <= 0);
    for (const c of dead) log(game, `${c.def.name} falls.`);
    s.board = s.board.filter((c) => c.hp > 0);
  }
}

export function checkWinner(game) {
  if (game.player.life <= 0 && game.foe.life <= 0) game.winner = 'draw';
  else if (game.foe.life <= 0) game.winner = 'player';
  else if (game.player.life <= 0) game.winner = 'foe';
}

export function endTurn(game, who) {
  if (game.active !== who || game.winner) return;
  const next = other(who);
  if (next === 'player') game.turn += 1;
  startTurn(game, next);
}

/** One full AI turn, executed instantly (the UI animates around it). */
export function runAiTurn(game) {
  if (game.winner || game.active !== 'foe') return;
  // Play the most expensive affordable card, repeatedly.
  for (;;) {
    const s = game.foe;
    let best = -1;
    for (let i = 0; i < s.hand.length; i += 1) {
      if (playable(game, 'foe', i) && (best === -1 || s.hand[i].def.cost > s.hand[best].def.cost)) best = i;
    }
    if (best === -1) break;
    playCard(game, 'foe', best);
  }
  // Attack: take a kill when one is offered, otherwise hit the hero.
  for (let i = 0; i < game.foe.board.length; i += 1) {
    if (game.winner) break;
    const legal = legalTargets(game, 'foe', i);
    if (!legal) continue;
    const attacker = game.foe.board[i];
    let killIndex = -1;
    for (const c of legal.creatures) {
      if (c.hp <= attacker.atk && c.atk >= attacker.hp) { killIndex = game.player.board.indexOf(c); break; }
    }
    if (killIndex >= 0) attack(game, 'foe', i, { index: killIndex });
    else if (legal.hero) attack(game, 'foe', i, { hero: true });
    else if (legal.creatures.length) attack(game, 'foe', i, { index: game.player.board.indexOf(legal.creatures[0]) });
  }
  if (!game.winner) endTurn(game, 'foe');
}
