# Embercrown

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/zynthlabsio/best-card-game-20261122-1826-entry-muse/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/zynthlabsio/best-card-game-20261122-1826-entry-muse/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

A tactical card duel, made for the [make.fun best-card-game-20261122-1826 competition](https://make.fun/bounty/best-card-game-20261122-1826).

Two heroes face off over the Ember Throne. You duel Queen Vesper, an AI rival, summoning creatures from four houses — **Ember ▲**, **Tide ≋**, **Thorn ✦** and **Gloom ☾** — spending a growing Ember pool, trading blows on the board, and striking the enemy hero. First hero to 0 Life loses.

## How to play

- **Start the duel** from the title screen.
- Each turn your Ember pool grows by 1 (up to 8) and refills, and you draw a card.
- **Click a card in your hand** to play it if you can afford its cost (blue gem, top-left). Your board holds at most 5 creatures.
- Creatures wait a turn before attacking, unless they have **Rush**.
- **Click one of your ready creatures, then click a target**: an enemy creature, or the *Strike Rival Hero* button.
- Combat is mutual: attacker and defender deal their ⚔ attack to each other at once. A creature at 0 ♥ health falls.
- **Guard** creatures must be attacked before anything else on their side. **Siphon** creatures heal your hero when they damage the enemy hero. **Keen** creatures draw you a card when played.
- **End turn** (button, or the **E** key) hands over to Queen Vesper, who plays her hand and attacks with a simple, greedy strategy.
- Keys **1–8** play the matching hand card. Running out of deck cards brings creeping fatigue damage, so finish the duel!

Win by reducing the rival to 0 Life; lose if your own hero falls. The victory and defeat screens show the duel statistics and offer an instant rematch.

## How to run

No build step, no network requests — everything is a local file under `game/`.

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve `game/` with any static HTTP server and open `index.html`.

## Screenshots

The four screenshots in `screenshots/` are deterministic renders of the game's own code (`?shot=title|play|win|loss`, fixed seed and staged state — see `game/src/shots.js` and `shots.json`).

## Handing in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE). Original game: its own names, art, sounds and music, written for this competition.
