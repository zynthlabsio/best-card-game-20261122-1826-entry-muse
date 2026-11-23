// SPDX-License-Identifier: MIT
// Embercrown entry point: wires the rules engine to the DOM, runs the AI
// turn with a short pause so the rival feels alive, and serves the staged
// screenshot scenes behind ?shot=.
import { attack, createGame, endTurn, legalTargets, playCard, runAiTurn } from './world.js';
import { renderOver, renderTable, renderTitle } from './render.js';
import { stageShot } from './shots.js';

const root = document.getElementById('game');
const status = document.getElementById('status');
const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') ?? '1') || 1;
const shot = params.get('shot');

const ui = { selectedHand: null, selectedAttacker: null };
let game = null;
let screen = 'title';

function announce() {
  if (!game) return;
  status.textContent = `Turn ${game.turn}. Your life ${game.player.life}, rival life ${game.foe.life}. ${game.log[game.log.length - 1] ?? ''}`;
}

function draw() {
  if (screen === 'title') renderTitle(root, startGame);
  else if (screen === 'over' || (game && game.winner)) { screen = 'over'; renderOver(root, game, startGame); }
  else renderTable(root, game, ui, handlers);
  announce();
}

function startGame() {
  game = createGame(seed * 7919 + Math.floor(Math.random() * 100000));
  ui.selectedAttacker = null; ui.selectedHand = null;
  screen = 'table';
  draw();
}

function maybeAi() {
  if (game && !game.winner && game.active === 'foe') {
    draw();
    setTimeout(() => { runAiTurn(game); ui.selectedAttacker = null; draw(); }, 650);
  }
}

const handlers = {
  onPlayCard(i) {
    if (playCard(game, 'player', i)) { ui.selectedHand = null; draw(); }
  },
  onSelectAttacker(i) {
    if (game.active !== 'player') return;
    ui.selectedAttacker = ui.selectedAttacker === i ? null : i;
    draw();
  },
  onTargetCreature(i) {
    if (ui.selectedAttacker === null) return;
    if (attack(game, 'player', ui.selectedAttacker, { index: i })) ui.selectedAttacker = null;
    draw();
  },
  onTargetHero() {
    if (ui.selectedAttacker === null) return;
    if (attack(game, 'player', ui.selectedAttacker, { hero: true })) ui.selectedAttacker = null;
    draw();
  },
  onEndTurn() {
    if (game.active !== 'player' || game.winner) return;
    ui.selectedAttacker = null;
    endTurn(game, 'player');
    maybeAi();
  },
};

document.addEventListener('keydown', (event) => {
  if (screen !== 'table' || !game || game.winner) return;
  if (event.key === 'e' || event.key === 'E' || event.key === 'Enter') handlers.onEndTurn();
  const n = Number(event.key);
  if (Number.isInteger(n) && n >= 1 && n <= game.player.hand.length) handlers.onPlayCard(n - 1);
});

if (shot) {
  const staged = stageShot(shot, seed);
  game = staged.game;
  screen = staged.screen;
  draw();
  window.__shotReady = true;
} else {
  screen = 'title';
  draw();
  window.__shotReady = true;
}

export { legalTargets };
