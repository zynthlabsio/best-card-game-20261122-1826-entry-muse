// SPDX-License-Identifier: MIT
// The Embercrown card pool: four houses, each with its own colour and glyph.
// Abilities: guard (must be attacked first), rush (may attack the turn it is
// played), siphon (damage it deals to a hero heals its owner), keen (draw a
// card when played).
import { shuffle } from './random.js';
export const HOUSES = {
  ember: { name: 'Ember', glyph: '▲', color: '#e4572e' },
  tide: { name: 'Tide', glyph: '≋', color: '#2e86e4' },
  thorn: { name: 'Thorn', glyph: '✦', color: '#3fae5a' },
  gloom: { name: 'Gloom', glyph: '☾', color: '#8b5cf6' },
};

export const CARD_POOL = [
  { id: 'cinder-squire', name: 'Cinder Squire', house: 'ember', cost: 1, atk: 2, hp: 1, ability: 'rush', text: 'Rush' },
  { id: 'ash-archer', name: 'Ash Archer', house: 'ember', cost: 2, atk: 3, hp: 2, ability: '', text: '' },
  { id: 'forge-brute', name: 'Forge Brute', house: 'ember', cost: 4, atk: 5, hp: 4, ability: '', text: '' },
  { id: 'pyre-dragon', name: 'Pyre Dragon', house: 'ember', cost: 7, atk: 8, hp: 6, ability: 'rush', text: 'Rush' },
  { id: 'reef-scout', name: 'Reef Scout', house: 'tide', cost: 1, atk: 1, hp: 2, ability: 'keen', text: 'Keen: draw a card' },
  { id: 'wave-warden', name: 'Wave Warden', house: 'tide', cost: 3, atk: 2, hp: 5, ability: 'guard', text: 'Guard' },
  { id: 'storm-caller', name: 'Storm Caller', house: 'tide', cost: 5, atk: 5, hp: 5, ability: 'keen', text: 'Keen: draw a card' },
  { id: 'leviathan', name: 'Deep Leviathan', house: 'tide', cost: 8, atk: 8, hp: 9, ability: 'guard', text: 'Guard' },
  { id: 'briar-sprite', name: 'Briar Sprite', house: 'thorn', cost: 1, atk: 1, hp: 1, ability: 'keen', text: 'Keen: draw a card' },
  { id: 'thorn-knight', name: 'Thorn Knight', house: 'thorn', cost: 3, atk: 3, hp: 4, ability: 'guard', text: 'Guard' },
  { id: 'grove-titan', name: 'Grove Titan', house: 'thorn', cost: 6, atk: 6, hp: 8, ability: '', text: '' },
  { id: 'elder-ent', name: 'Elder Ent', house: 'thorn', cost: 5, atk: 4, hp: 7, ability: 'guard', text: 'Guard' },
  { id: 'shade-imp', name: 'Shade Imp', house: 'gloom', cost: 2, atk: 2, hp: 2, ability: 'siphon', text: 'Siphon' },
  { id: 'dusk-reaper', name: 'Dusk Reaper', house: 'gloom', cost: 4, atk: 4, hp: 3, ability: 'siphon', text: 'Siphon' },
  { id: 'night-herald', name: 'Night Herald', house: 'gloom', cost: 3, atk: 3, hp: 3, ability: 'rush', text: 'Rush' },
  { id: 'void-queen', name: 'Void Queen', house: 'gloom', cost: 7, atk: 7, hp: 7, ability: 'siphon', text: 'Siphon' },
];

export function buildDeck(rng) {
  const deck = [];
  for (const card of CARD_POOL) { deck.push(card, card); }
  return shuffle(deck, rng);
}
