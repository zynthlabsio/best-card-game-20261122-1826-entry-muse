// SPDX-License-Identifier: MIT
// Staged screenshot scenes (?shot=title|play|win|loss). Each builds a real
// game from the rules engine and arranges a believable mid-duel state, so the
// screenshots are honest renders of the game's own code.
import { CARD_POOL } from './cards.js';
import { createGame, playCard } from './world.js';

function place(game, who, poolId, hpLeft) {
  const def = CARD_POOL.find((c) => c.id === poolId);
  const card = { uid: 900 + game[who].board.length, def, hp: hpLeft ?? def.hp, atk: def.atk, ready: true, justPlayed: false };
  game[who].board.push(card);
  return card;
}

function stagePlay(game) {
  game.turn = 5;
  game.player.maxEmber = 5; game.player.ember = 3;
  game.foe.maxEmber = 5; game.foe.ember = 1;
  game.player.life = 14; game.foe.life = 11;
  place(game, 'foe', 'wave-warden', 4);
  place(game, 'foe', 'dusk-reaper');
  place(game, 'player', 'thorn-knight', 3);
  place(game, 'player', 'ash-archer');
  place(game, 'player', 'shade-imp', 1);
  game.log = ['Rival plays Dusk Reaper.', 'Thorn Knight clashes with Wave Warden.', 'Your turn. Play cards, then attack!'];
}

export function stageShot(name, seed) {
  const game = createGame(seed);
  if (name === 'play') { stagePlay(game); return { game, screen: 'table' }; }
  if (name === 'win') {
    stagePlay(game);
    game.turn = 9; game.foe.life = 0; game.player.life = 6; game.winner = 'player';
    return { game, screen: 'over' };
  }
  if (name === 'loss') {
    stagePlay(game);
    game.turn = 8; game.player.life = 0; game.foe.life = 9; game.winner = 'foe';
    return { game, screen: 'over' };
  }
  return { game, screen: 'title' };
}

export { playCard };
