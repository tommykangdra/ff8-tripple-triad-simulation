/* Headless tests for the Triple Triad capture engine.
 * Stubs the DOM, loads cards.js + game.js, and drives resolveCaptures() directly.
 * Run with:  node test.js
 */
const fs = require("fs");
const vm = require("vm");

const sandbox = {
  window: { addEventListener() {} },
  document: {
    getElementById() { return {}; },
    querySelector() { return {}; },
    querySelectorAll() { return []; },
    addEventListener() {},
  },
  setTimeout() {},
  console,
  globalThis: null,
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

// Data + art layer, in dependency order (mirrors the <script> tags in index.html).
for (const f of [
  "cards.js",
  "art/sprites-beasts.js", "art/sprites-nature.js",
  "art/sprites-constructs.js", "art/sprites-dark.js",
  "art/palette.js", "art/archetypes.js", "art/render.js",
]) {
  vm.runInContext(fs.readFileSync(__dirname + "/" + f, "utf8"), sandbox);
}
let game = fs.readFileSync(__dirname + "/game.js", "utf8");
game += "\nglobalThis.S=S; globalThis.resolveCaptures=resolveCaptures; globalThis.scores=scores;";
game += "\nglobalThis.cloneState=cloneState; globalThis.legalMoves=legalMoves; globalThis.applyMove=applyMove;";
game += "\nglobalThis.estLeaves=estLeaves; globalThis.winStats=winStats; globalThis.exactStats=exactStats; globalThis.monteStats=monteStats;";
vm.runInContext(game, sandbox);

const S = sandbox.S;
let failures = 0;
const check = (name, cond) => { console.log((cond ? "PASS" : "FAIL") + "  " + name); if (!cond) failures++; };

const reset = () => {
  S.board = new Array(9).fill(null);
  S.tiles = new Array(9).fill(null);
  S.rules = { same: false, plus: false, sameWall: false, elemental: false, open: true };
};
const put = (i, card, owner) => { S.board[i] = { card, owner }; };
const C = (t, l, r, b, element = null) => ({ name: "X", top: t, left: l, right: r, bottom: b, element, level: 1 });

// 1. Basic capture — higher touching edge flips the neighbor.
reset(); put(5, C(1,1,1,1), 2); put(4, C(9,9,9,9), 1); sandbox.resolveCaptures(4);
check("basic capture", S.board[5].owner === 1);

// 2. No capture when the placed card is weaker.
reset(); put(5, C(9,9,9,9), 2); put(4, C(1,1,1,1), 1); sandbox.resolveCaptures(4);
check("no capture when weaker", S.board[5].owner === 2);

// 3. Same rule — two matching edges flip both neighbors.
reset(); S.rules.same = true;
put(1, C(1,1,1,5), 2); put(3, C(1,1,5,1), 2); put(4, C(5,5,5,5), 1); sandbox.resolveCaptures(4);
check("Same flips both", S.board[1].owner === 1 && S.board[3].owner === 1);

// 4. Plus rule — two neighbors with equal edge-sums flip.
reset(); S.rules.plus = true;
put(1, C(1,1,1,3), 2); put(3, C(1,1,4,1), 2); put(4, C(2,1,1,1), 1); sandbox.resolveCaptures(4);
check("Plus flips both", S.board[1].owner === 1 && S.board[3].owner === 1);

// 5. Elemental — matching tile gives +1, turning a tie into a capture.
reset(); S.rules.elemental = true; S.tiles[4] = "Fire";
put(5, C(1,1,1,1), 2); put(4, C(1,1,1,1,"Fire"), 1); sandbox.resolveCaptures(4);
check("Elemental boost capture", S.board[5].owner === 1);

// 6. Combo — a Same-flipped card cascades a basic capture of its own neighbor.
reset(); S.rules.same = true;
put(1, C(1,1,1,5), 2); put(3, C(1,1,5,9), 2); put(6, C(1,1,1,1), 2); put(4, C(5,5,1,1), 1);
sandbox.resolveCaptures(4);
check("combo cascade", S.board[1].owner === 1 && S.board[3].owner === 1 && S.board[6].owner === 1);

// 7. Scoring counts hand cards + owned board cards.
reset(); S.hands = { 1: [1,2], 2: [3] }; put(4, C(5,5,5,5), 1); put(5, C(1,1,1,1), 2);
const s = sandbox.scores();
check("scoring", s[1] === 3 && s[2] === 2);

// ---------- Simulation core (Move Advisor) ----------
const simState = () => ({
  board: new Array(9).fill(null),
  tiles: new Array(9).fill(null),
  rules: { same: false, plus: false, sameWall: false, elemental: false, open: true },
  hands: { 1: [], 2: [] },
});

// 8. applyMove places the card, removes it from hand, and resolves captures.
{
  const st = simState();
  st.board[4] = { card: C(1,1,1,1), owner: 2 };
  st.hands[1] = [C(9,9,9,9)];
  sandbox.applyMove(st, 1, 0, 5);                 // cell 5 is right of cell 4
  check("applyMove places + captures", st.board[5] && st.board[5].owner === 1 && st.board[4].owner === 1 && st.hands[1].length === 0);
}

// 9. legalMoves = (hand cards) × (empty cells).
{
  const st = simState();
  st.board[0] = { card: C(1,1,1,1), owner: 1 };
  st.hands[1] = [C(1,1,1,1), C(2,2,2,2)];
  check("legalMoves count", sandbox.legalMoves(st, 1).length === 2 * 8);
}

// 10. winStats on a 1-empty-cell position → exact, forced 100% for the winner, symmetric for the loser.
{
  const st = simState();
  for (let i = 0; i < 4; i++) st.board[i] = { card: C(1,1,1,1), owner: 1 };
  for (let i = 4; i < 8; i++) st.board[i] = { card: C(1,1,1,1), owner: 2 };
  st.hands = { 1: [C(5,5,5,5)], 2: [] };
  const w1 = sandbox.winStats(st, 1, 1, 1e9, 200);
  const w2 = sandbox.winStats(st, 2, 1, 1e9, 200);   // clone-based, st untouched by w1
  check("winStats forced win = 100% exact", w1.exact && w1.total === 1 && w1.win === 1 && w1.loss === 0);
  check("winStats symmetric loss", w2.exact && w2.total === 1 && w2.loss === 1 && w2.win === 0);
}

// 11. exactStats enumerates every continuation (2 empty cells, 1 card each → 2 leaves).
{
  const st = simState();
  for (let i = 0; i < 7; i++) st.board[i] = { card: C(1,1,1,1), owner: i < 4 ? 1 : 2 };
  st.hands = { 1: [C(2,2,2,2)], 2: [C(3,3,3,3)] };
  const w = sandbox.exactStats(st, 1, 1);
  check("exact enumerates all leaves", w.total === 2 && w.win + w.draw + w.loss === 2);
}

// 12. Monte-Carlo totals match the requested sample count.
{
  const st = simState();
  st.board[0] = { card: C(1,1,1,1), owner: 1 };
  st.hands = { 1: [C(5,5,5,5), C(4,4,4,4)], 2: [C(2,2,2,2), C(3,3,3,3)] };
  const w = sandbox.monteStats(st, 1, 1, 150);
  check("monteStats sample count", !w.exact && w.total === 150 && w.win + w.draw + w.loss === 150);
}

// 13. Special-rule tagging — a Same-triggering placement reports the "Same" tag.
{
  const st = simState();
  st.rules.same = true;
  st.board[1] = { card: C(1,1,1,5), owner: 2 };   // top neighbor of cell 4
  st.board[3] = { card: C(1,1,5,1), owner: 2 };   // left neighbor of cell 4
  st.hands = { 1: [C(5,5,5,5)], 2: [] };
  const tags = [];
  sandbox.applyMove(st, 1, 0, 4, tags);
  check("Same tag reported", tags.includes("Same") && st.board[1].owner === 1 && st.board[3].owner === 1);
}

// 14. Elemental tagging — a matching tile that swings a tie into a capture reports "Elemental".
{
  const st = simState();
  st.rules.elemental = true;
  st.tiles[4] = "Fire";
  st.board[5] = { card: C(1,1,1,1), owner: 2 };   // right neighbor of cell 4
  st.hands = { 1: [{ name:"X", top:1, left:1, right:1, bottom:1, element:"Fire", level:1 }], 2: [] };
  const tags = [];
  sandbox.applyMove(st, 1, 0, 4, tags);            // 1 vs 1 → +1 Fire boost → capture
  check("Elemental tag reported", tags.includes("Elemental") && st.board[5].owner === 1);
}

console.log(failures === 0 ? "\nAll tests passed." : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
