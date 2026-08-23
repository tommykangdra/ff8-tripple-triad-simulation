# Triple Triad — Final Fantasy VIII

A front-end recreation of FF8's **Triple Triad** card game. Two players share one screen
(hotseat) and battle on a 3×3 board using cards that carry four numbers (Top / Left / Right /
Bottom). No AI — Player 1 is Blue, Player 2 is Red.

All **110 official cards** across 10 levels are included, with verified numbers — including the
Level 1 **Monster** cards you can see right away in the deck builder.

## Features

- **Full 110-card database** (`cards.js`) — Monsters, Bosses, GFs, and Characters, with each
  card's four numbers (`A` = 10) and element.
- **Deck builder** — each player picks 5 cards (filter by level, search by name), or roll random
  decks.
- **Rules toggles** — Open, **Same**, **Plus**, **Same Wall**, and **Elemental** (with element
  tiles that give ±1 to matching/non-matching cards).
- **Board setup** — choose **who goes first** (Player 1, Player 2, or a coin toss) and, when
  Elemental is on, **place the element tiles yourself** on a 3×3 configurator (or roll them randomly).
- **Capture engine** — basic higher-number captures plus Same/Plus combo cascades.
- **Move Advisor** — after every move it simulates the rest of the game and tells the player to
  move which **card + cell gives the best win %** (see below).
- **Pixel-art card faces** — every card has a hand-drawn sprite, generated at runtime as
  inline SVG. The 99 creature cards share 24 archetype silhouettes tinted by level tier and
  are told apart by a per-card hue shift, mirror and accent. The 11 Level 10 characters are
  full-color 28x28 portraits, each with its own palette — a second sprite format the renderer
  detects automatically. Plus blue/red owner glow, corner numbers and element badges. Still
  no image files, no build step, works fully offline.

## How to play

1. **Build decks.** Player 1 (Blue) picks 5 cards → click **Next: Player 2** → Player 2 (Red)
   picks 5. Or hit **🎲 Random decks for both** to skip straight to a match.
2. (Optional) Flip on **Same / Plus / Same Wall / Elemental** before starting. Pick **who goes
   first** from the *Who goes first* dropdown (default: coin toss). If **Elemental** is on, a 3×3
   **element-tile configurator** appears — click a cell to cycle its element (none → Fire → Ice →
   … → Holy → none), or use **🎲 Random tiles** / **Clear tiles**.
3. Click **⚔️ Start Battle**. Whoever you chose goes first (or a coin toss if you left it on random).
4. On your turn: **click one of your cards** to select it, then **click an empty board cell** to
   play it — or just press **1–5** to instantly play the advisor's ranked suggestion. Adjacent enemy
   cards with a lower touching number get flipped to your color.
5. After all 9 cells are filled, whoever owns more cards (board + hand) wins.

### Card numbers

Each card shows four values, one per edge. When your card is placed next to an opponent's card,
the two **touching** edges are compared — higher value captures. Example (Level 1 Monsters):

| Card | Top | Left | Right | Bottom |
|------|:---:|:----:|:-----:|:------:|
| Geezard | 1 | 5 | 4 | 1 |
| Funguar | 5 | 3 | 1 | 1 |
| Bite Bug | 1 | 5 | 3 | 3 |
| Red Bat | 6 | 2 | 1 | 1 |
| Cockatrice | 2 | 6 | 1 | 2 |

## Move Advisor

Under the board is a **🔮 Move Advisor** panel. After each move — for the player whose turn it is —
it evaluates *every* legal play (each card in hand × each empty cell) by simulating the rest of the
game, then ranks them by **win percentage** and highlights the single best card (gold pulse) and
best cell (gold ★) on the board.

Each suggested move also shows a **special-rule badge** when that placement would trigger one —
`SAME`, `SAME WALL`, `PLUS`, `ELEMENTAL`, or `COMBO` — so you can see at a glance which plays fire
a combo. (These only appear for rules you've turned on, and among moves with equal win % the one
that fires a special rule is ranked first.)

**What the % means.** For a candidate move, it's the share of complete game continuations that end
in a win for the mover, where both sides play out *all combinations* of card × cell. So it's your
win rate against an unpredictable opponent — a guide, not a guarantee that a strong opponent can't
do better. It also shows the draw %.

**Why it's fast (the combinatorics).** A full solve from the opening is ~5 billion continuations, so
the advisor is adaptive:

- **Late/mid game** (roughly ≤ 5 empty cells): the tree is small enough to enumerate *every*
  combination — the panel shows an **exact solve** and the % is precise.
- **Opening** (more empty cells): it runs ~500 random playouts per candidate — the panel labels this
  an **estimate** (`≈` before the %). Each full pass stays well under a second and runs in small async
  chunks, so the board never freezes.

**Hotkeys.** Press **1–5** to instantly play the correspondingly-ranked move — `1` plays the top
recommendation, `2` the second, and so on. (Keys are ignored while typing in the search box, when the
advisor is off, or before a pass finishes.)

Toggle the checkbox off any time to hide the hints (e.g. for a fair no-help match).

## Run it locally

It's a static site — no dependencies, no build. Pick either option:

**Option A — just open the file**

```bash
open index.html          # macOS
# or double-click index.html in your file manager
```

**Option B — serve it (recommended)**

```bash
cd "Triad Master"
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Any static server works equally well, e.g. `npx serve` or the VS Code "Live Server" extension.

## Run the tests

The capture-rules engine and the Move Advisor simulation core have headless tests (basic capture,
Same, Plus, Elemental, combo cascade, scoring, plus `applyMove` / `legalMoves` / exact & Monte-Carlo
`winStats`). It stubs the DOM and exercises the engine directly:

```bash
cd "Triad Master"
node test.js
```

Expected output — all lines `PASS`.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure: deck builder, board, hands, result modal |
| `styles.css` | Card chrome, board layout, animations |
| `cards.js` | The 110-card database (`CARDS`) + element icons |
| `game.js` | State, rules engine, turn flow, rendering |
| `art/sprites-*.js` | 24 hand-drawn 16x16 creature archetypes, tinted by level tier |
| `art/sprites-detailed.js` | The 11 Level 10 characters as 28x28 full-color portraits |
| `art/palette.js` | Per-level tier palettes, plus the shared outline and accent colors |
| `art/archetypes.js` | Card name to sprite archetype, with a per-level fallback |
| `art/render.js` | Grid to memoized data-URI SVG; owns the per-card variation |
| `test.js` | Headless unit tests for the capture engine |

The `art/` files are plain scripts loaded in dependency order (see `index.html`), not ES
modules — `type="module"` is blocked by CORS over `file://`, which would break opening
`index.html` directly.

## Notes

Card values were transcribed from community Triple Triad references and validated
programmatically (110 unique cards, 11 per level, every number in the 1–10 range).
