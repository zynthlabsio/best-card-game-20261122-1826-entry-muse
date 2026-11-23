// SPDX-License-Identifier: MIT
// DOM rendering for Embercrown: title screen, the duel table and the
// victory / defeat screens, all drawn from the rules-engine state.
import { HOUSES } from './cards.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function cardEl(card, opts = {}) {
  const house = HOUSES[card.def.house];
  const node = el('div', 'card' + (opts.small ? ' small' : '') + (opts.selected ? ' selected' : '') + (opts.dim ? ' dim' : ''));
  node.style.setProperty('--house', house.color);
  const top = el('div', 'card-top');
  top.append(el('span', 'cost', String(card.def.cost)), el('span', 'card-name', card.def.name));
  const art = el('div', 'card-art', house.glyph);
  art.append(el('span', 'house-name', house.name));
  const mid = el('div', 'card-text', card.def.text || '—');
  const stats = el('div', 'card-stats');
  stats.append(el('span', 'atk', `⚔ ${card.atk}`), el('span', 'hp', `♥ ${opts.small ? card.hp : card.def.hp}`));
  node.append(top, art, mid, stats);
  if (opts.onClick) { node.addEventListener('click', opts.onClick); node.setAttribute('role', 'button'); }
  return node;
}

function heroEl(label, side, active) {
  const node = el('div', 'hero' + (active ? ' active-turn' : ''));
  node.append(el('div', 'hero-face', label === 'You' ? '♛' : '♞'));
  const info = el('div', 'hero-info');
  info.append(el('div', 'hero-name', label), el('div', 'hero-life', `♥ Life ${Math.max(0, side.life)}`), el('div', 'hero-ember', `◆ Ember ${side.ember}/${side.maxEmber} · Deck ${side.deck.length}`));
  node.append(info);
  return node;
}

export function renderTitle(root, onStart) {
  root.innerHTML = '';
  const wrap = el('div', 'screen title-screen');
  wrap.append(el('div', 'crown', '♛'));
  wrap.append(el('h1', 'game-title', 'EMBERCROWN'));
  wrap.append(el('p', 'tagline', 'A tactical card duel for the Ember Throne'));
  const rules = el('div', 'rules-box');
  rules.append(
    el('p', '', 'Summon creatures from four houses — Ember ▲, Tide ≋, Thorn ✦, Gloom ☾.'),
    el('p', '', 'Each turn your Ember grows: spend it on cards, then order your creatures to clash or strike the rival hero.'),
    el('p', '', 'Guard must be attacked first · Rush attacks at once · Siphon heals you · Keen draws a card.'),
    el('p', '', 'First hero to 0 Life loses. Reduce the rival to 0 to claim the crown!'),
  );
  const btn = el('button', 'big-btn', '▶  Start the duel');
  btn.addEventListener('click', onStart);
  wrap.append(rules, btn, el('p', 'hint', 'Mouse: click a hand card to play it, click a ready creature then a target to attack. Keys: 1–8 play a card, E ends the turn.'));
  root.append(wrap);
}

export function renderTable(root, game, ui, handlers) {
  root.innerHTML = '';
  const wrap = el('div', 'screen table-screen');

  const foeBar = el('div', 'side-bar');
  foeBar.append(heroEl('Rival — Queen Vesper', game.foe, game.active === 'foe'));
  const backs = el('div', 'card-backs');
  for (let i = 0; i < game.foe.hand.length; i += 1) backs.append(el('div', 'card-back', '♛'));
  foeBar.append(backs);
  wrap.append(foeBar);

  const foeBoard = el('div', 'board foe-board');
  if (!game.foe.board.length) foeBoard.append(el('div', 'board-empty', 'Rival board is empty'));
  game.foe.board.forEach((card, i) => {
    const targetable = ui.selectedAttacker !== null;
    foeBoard.append(cardEl(card, { small: true, dim: !targetable && false, onClick: targetable ? () => handlers.onTargetCreature(i) : null }));
  });
  wrap.append(foeBoard);

  const mid = el('div', 'mid-bar');
  const foeHeroBtn = el('button', 'hero-target', `Strike Rival Hero (♥ ${Math.max(0, game.foe.life)})`);
  foeHeroBtn.disabled = ui.selectedAttacker === null;
  foeHeroBtn.addEventListener('click', handlers.onTargetHero);
  mid.append(el('div', 'turn-label', `Turn ${game.turn} — ${game.active === 'player' ? 'your move' : 'rival is thinking…'}`), foeHeroBtn);
  const logBox = el('div', 'log');
  for (const line of game.log.slice(-3)) logBox.append(el('div', '', line));
  mid.append(logBox);
  wrap.append(mid);

  const myBoard = el('div', 'board my-board');
  if (!game.player.board.length) myBoard.append(el('div', 'board-empty', 'Your board is empty — play a card from your hand'));
  game.player.board.forEach((card, i) => {
    myBoard.append(cardEl(card, {
      small: true,
      selected: ui.selectedAttacker === i,
      dim: game.active === 'player' && !card.ready,
      onClick: () => handlers.onSelectAttacker(i),
    }));
  });
  wrap.append(myBoard);

  const myBar = el('div', 'side-bar');
  myBar.append(heroEl('You', game.player, game.active === 'player'));
  const endBtn = el('button', 'big-btn end-btn', 'End turn (E)');
  endBtn.disabled = game.active !== 'player' || !!game.winner;
  endBtn.addEventListener('click', handlers.onEndTurn);
  myBar.append(endBtn);
  wrap.append(myBar);

  const hand = el('div', 'hand');
  game.player.hand.forEach((card, i) => {
    const afford = card.def.cost <= game.player.ember && game.active === 'player';
    hand.append(cardEl(card, { selected: ui.selectedHand === i, dim: !afford, onClick: () => handlers.onPlayCard(i) }));
  });
  wrap.append(hand);
  root.append(wrap);
}

export function renderOver(root, game, onRestart) {
  root.innerHTML = '';
  const won = game.winner === 'player';
  const wrap = el('div', 'screen over-screen ' + (won ? 'win' : 'loss'));
  wrap.append(el('div', 'crown', won ? '♛' : '♞'));
  wrap.append(el('h1', 'game-title', won ? 'VICTORY!' : 'DEFEAT'));
  wrap.append(el('p', 'tagline', won
    ? 'Queen Vesper kneels — the Embercrown is yours.'
    : 'Your hero has fallen. The crown slips away… this time.'));
  const stats = el('div', 'rules-box');
  stats.append(
    el('p', '', `Turns played: ${game.turn}`),
    el('p', '', `Your Life: ${Math.max(0, game.player.life)} ♥ · Rival Life: ${Math.max(0, game.foe.life)} ♥`),
    el('p', '', `Creatures standing: you ${game.player.board.length} · rival ${game.foe.board.length}`),
  );
  const btn = el('button', 'big-btn', '↻  Duel again');
  btn.addEventListener('click', onRestart);
  wrap.append(stats, btn);
  root.append(wrap);
}
