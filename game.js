/* ===== Triple Triad — game engine (2-player hotseat) ===== */

const ELEMENTS = ["Fire", "Ice", "Thunder", "Earth", "Poison", "Wind", "Water", "Holy"];
const ELEM_TILE_ICON = ELEMENT_ICON; // from cards.js

// ---------- Global state ----------
const S = {
  screen: "setup",
  rules: { same: false, plus: false, sameWall: false, elemental: false, open: true },
  picking: 1,            // which player is choosing cards in setup
  decks: { 1: [], 2: [] }, // arrays of CARD template objects
  hands: { 1: [], 2: [] }, // arrays of live card instances
  board: new Array(9).fill(null),   // each: { card, owner }
  tiles: new Array(9).fill(null),   // element per cell (elemental rule)
  setupTiles: new Array(9).fill(null), // user-configured element tiles (used at start)
  firstPlayer: "random",            // "random" | "1" | "2"
  current: 1,
  selected: null,        // index into current player's hand
  placed: 0,
  over: false,
  suggest: null,         // advisor's best move: { handIdx, cell }
};

let uid = 0;
const clampSide = (n) => n; // sides already 1-10
const rand = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- Card element (DOM) ----------
function cardEl(card, owner) {
  const el = document.createElement("div");
  el.className = "card" + (owner ? " owner-" + (owner === 1 ? "blue" : "red") : "");
  const show = (n) => (n === 10 ? "A" : n);
  // Art must never be able to take the board down with it. If the sprite layer fails
  // (a half-cached reload leaving a stale art/*.js, say), the card still renders with
  // its name and numbers instead of throwing and aborting the whole render loop.
  let artStyle = "";
  try {
    artStyle = ` style="background-image:${spriteURI(card)}"`;
  } catch (err) {
    if (!cardEl.artFailed) {
      cardEl.artFailed = true;
      console.error("Card art unavailable (try a hard reload: Cmd/Ctrl+Shift+R)", err);
    }
  }
  el.innerHTML = `
    <div class="name">${card.name}</div>
    <div class="art"${artStyle}></div>
    <div class="num t">${show(card.top)}</div>
    <div class="num l">${show(card.left)}</div>
    <div class="num r">${show(card.right)}</div>
    <div class="num b">${show(card.bottom)}</div>
    ${card.element ? `<div class="elem">${ELEM_TILE_ICON[card.element] || ""}</div>` : ""}
    <div class="lvl">Lv${card.level}</div>`;
  return el;
}

// ================================================================
//  SETUP / DECK BUILDER
// ================================================================
function renderSetup() {
  const grid = document.getElementById("cardGrid");
  const lvlSel = document.getElementById("levelFilter");
  const search = document.getElementById("searchBox");
  const lvl = lvlSel.value;
  const q = search.value.trim().toLowerCase();

  grid.innerHTML = "";
  CARDS.forEach((card, idx) => {
    if (lvl !== "all" && String(card.level) !== lvl) return;
    if (q && !card.name.toLowerCase().includes(q)) return;
    const el = cardEl(card);
    const inDeck = S.decks[S.picking].includes(card);
    const takenByOther = S.decks[S.picking === 1 ? 2 : 1].includes(card);
    if (inDeck) el.classList.add("picked");
    el.classList.add("selectable");
    el.addEventListener("click", () => togglePick(card));
    grid.appendChild(el);
  });

  document.getElementById("pickingLabel").textContent =
    "Player " + S.picking + (S.picking === 1 ? " (Blue)" : " (Red)");
  document.getElementById("pickCount").textContent =
    S.decks[S.picking].length + " / 5 chosen";

  const p1done = S.decks[1].length === 5;
  const p2done = S.decks[2].length === 5;
  document.getElementById("switchBtn").textContent =
    S.picking === 1 ? "Next: Player 2 ►" : "◄ Back: Player 1";
  document.getElementById("startBtn").disabled = !(p1done && p2done);
}

// ---------- Board configuration (element tiles + first player) ----------
function syncTileConfigVisibility() {
  const on = document.getElementById("ruleElem").checked;
  document.getElementById("tileConfig").classList.toggle("hidden", !on);
  if (on) renderTileConfig();
}

function renderTileConfig() {
  const grid = document.getElementById("tileGrid");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "tile-cell" + (S.setupTiles[i] ? " has-tile" : "");
    const elem = S.setupTiles[i];
    el.innerHTML = elem
      ? `<span class="tile-icon">${ELEM_TILE_ICON[elem] || ""}</span><span class="tile-name">${elem}</span>`
      : `<span class="tile-empty">+</span>`;
    el.title = elem ? `${elem} (click to change)` : "Empty (click to add an element)";
    el.addEventListener("click", () => cycleTile(i));
    grid.appendChild(el);
  }
}

// none → Fire → Ice → … → Holy → none
function cycleTile(i) {
  const cur = S.setupTiles[i];
  const at = cur ? ELEMENTS.indexOf(cur) : -1;
  S.setupTiles[i] = at + 1 < ELEMENTS.length ? ELEMENTS[at + 1] : null;
  renderTileConfig();
}

function randomTiles() {
  const count = 1 + rand(4); // 1–4 element tiles, matching FF8's spread
  const cells = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, count);
  S.setupTiles = new Array(9).fill(null);
  cells.forEach((c) => (S.setupTiles[c] = ELEMENTS[rand(ELEMENTS.length)]));
  renderTileConfig();
}

function clearTiles() {
  S.setupTiles = new Array(9).fill(null);
  renderTileConfig();
}

function togglePick(card) {
  const deck = S.decks[S.picking];
  const i = deck.indexOf(card);
  if (i >= 0) { deck.splice(i, 1); }
  else {
    if (deck.length >= 5) return;
    deck.push(card);
  }
  renderSetup();
}

function randomDeck() {
  const pool = shuffle([...CARDS]);
  S.decks[S.picking] = pool.slice(0, 5);
  renderSetup();
}

function randomBoth() {
  const pool = shuffle([...CARDS]);
  S.decks[1] = pool.slice(0, 5);
  S.decks[2] = pool.slice(5, 10);
  renderSetup();
}

// ================================================================
//  GAME START
// ================================================================
function startGame() {
  // read rule toggles
  S.rules.same = document.getElementById("ruleSame").checked;
  S.rules.plus = document.getElementById("rulePlus").checked;
  S.rules.sameWall = document.getElementById("ruleSameWall").checked;
  S.rules.elemental = document.getElementById("ruleElem").checked;
  S.rules.open = document.getElementById("ruleOpen").checked;

  // build live hands (clone templates + owner)
  S.hands[1] = S.decks[1].map((c) => ({ ...c, owner: 1, id: ++uid }));
  S.hands[2] = S.decks[2].map((c) => ({ ...c, owner: 2, id: ++uid }));

  S.board = new Array(9).fill(null);
  // Elemental tiles come from the user's board config; empty is a valid choice.
  S.tiles = S.rules.elemental ? S.setupTiles.slice() : new Array(9).fill(null);

  const coin = S.firstPlayer === "random";
  S.current = coin ? 1 + rand(2) : Number(S.firstPlayer);
  S.selected = null;
  S.placed = 0;
  S.over = false;
  S.screen = "game";

  document.getElementById("setup").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("modal").classList.add("hidden");

  setBanner(coin ? `Coin toss… Player ${S.current} goes first!` : `Player ${S.current} goes first!`);
  renderGame();
  advise();
}

// ================================================================
//  RENDER GAME
// ================================================================
function renderGame() {
  renderBoard();
  renderHand(1);
  renderHand(2);
  renderScore();
  markActive();
}

function markActive() {
  document.getElementById("hand1").classList.toggle("active", S.current === 1 && !S.over);
  document.getElementById("hand2").classList.toggle("active", S.current === 2 && !S.over);
}

function renderHand(player) {
  const wrap = document.querySelector(`#hand${player} .cards`);
  wrap.innerHTML = "";
  const hideOpp = !S.rules.open && player !== S.current;
  S.hands[player].forEach((card, idx) => {
    const el = cardEl(card, player);
    if (hideOpp) {
      el.classList.add("owner-" + (player === 1 ? "blue" : "red"));
      el.querySelectorAll(".num, .name, .art, .elem, .lvl").forEach((n) => (n.style.visibility = "hidden"));
    }
    if (player === S.current && !S.over) {
      el.classList.add("selectable");
      if (S.selected === idx) el.classList.add("selected");
      if (S.suggest && S.suggest.handIdx === idx) el.classList.add("suggested");
      el.addEventListener("click", () => selectCard(idx));
    }
    wrap.appendChild(el);
  });
}

function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    if (S.tiles[i]) {
      const t = document.createElement("div");
      t.className = "elem-tile";
      t.textContent = ELEM_TILE_ICON[S.tiles[i]] || "";
      cell.appendChild(t);
    }
    if (S.board[i]) {
      cell.appendChild(cardEl(S.board[i].card, S.board[i].owner));
    } else if (S.selected !== null && !S.over) {
      cell.classList.add("droppable");
      if (S.suggest && S.suggest.cell === i) cell.classList.add("suggested");
      cell.addEventListener("click", () => placeCard(i));
    } else if (!S.board[i] && S.suggest && S.suggest.cell === i && !S.over) {
      cell.classList.add("suggested");
    }
    board.appendChild(cell);
  }
}

function renderScore() {
  const s = scores();
  document.querySelector("#score .p1").textContent = s[1];
  document.querySelector("#score .p2").textContent = s[2];
}

function scores(state = S) {
  const s = { 1: state.hands[1].length, 2: state.hands[2].length };
  state.board.forEach((c) => { if (c) s[c.owner]++; });
  return s;
}

function setBanner(txt) { document.getElementById("banner").textContent = txt; }

// ================================================================
//  TURN ACTIONS
// ================================================================
function selectCard(idx) {
  if (S.over || S.current == null) return;
  S.selected = (S.selected === idx ? null : idx);
  renderGame();
}

function placeCard(cellIndex) {
  if (S.over || S.selected === null || S.board[cellIndex]) return;
  const hand = S.hands[S.current];
  const card = hand.splice(S.selected, 1)[0];
  S.board[cellIndex] = { card, owner: S.current };
  S.selected = null;
  S.placed++;

  S.suggest = null;      // clear last turn's hint
  const flipped = resolveCaptures(cellIndex);
  renderGame();
  animateFlips(flipped);

  if (S.placed === 9) { endGame(); return; }

  S.current = S.current === 1 ? 2 : 1;
  setBanner(`Player ${S.current}'s turn`);
  renderGame();
  advise();              // simulate best move for the new player
}

// ---------- side helpers ----------
const SIDES = ["top", "right", "bottom", "left"];
// neighbor deltas keyed by the placed card's side that faces them
function neighborOf(index, side) {
  const r = Math.floor(index / 3), c = index % 3;
  if (side === "top")    return r > 0 ? index - 3 : -1;
  if (side === "bottom") return r < 2 ? index + 3 : -1;
  if (side === "left")   return c > 0 ? index - 1 : -1;
  if (side === "right")  return c < 2 ? index + 1 : -1;
  return -1;
}
const OPPOSITE = { top: "bottom", bottom: "top", left: "right", right: "left" };

// elemental-adjusted value of a card's side at a given cell (basic/combo only)
function effVal(cell, side, state = S) {
  let v = cell.card[side];
  if (state.rules.elemental) {
    const tile = state.tiles[cell.index];
    if (tile) v += (cell.card.element === tile ? 1 : -1);
  }
  return v;
}

// `tags` (optional array) collects which special rules this placement fired:
// "Same", "Same Wall", "Plus", "Elemental", "Combo". Return value stays `flipped`.
function resolveCaptures(index, state = S, tags = null) {
  const owner = state.board[index].owner;
  const placed = { ...state.board[index], index };
  const flipped = [];
  const comboSeeds = [];
  const tag = (t) => { if (tags && !tags.includes(t)) tags.push(t); };

  // gather occupied neighbors
  const nbrs = [];
  for (const side of SIDES) {
    const ni = neighborOf(index, side);
    if (ni >= 0 && state.board[ni]) {
      nbrs.push({ side, ni, mySide: placed.card[side], theirSide: state.board[ni].card[OPPOSITE[side]] });
    }
  }

  // ----- SAME rule -----
  if (state.rules.same) {
    let sameHits = nbrs.filter((n) => n.mySide === n.theirSide);
    let wallHits = 0;
    if (state.rules.sameWall) {
      for (const side of SIDES) {
        if (neighborOf(index, side) < 0 && placed.card[side] === 10) wallHits++;
      }
    }
    if (sameHits.length + wallHits >= 2) {
      let fired = false;
      sameHits.forEach((n) => {
        if (state.board[n.ni].owner !== owner) { flip(n.ni, owner, flipped, state); comboSeeds.push(n.ni); fired = true; }
      });
      if (fired) { tag("Same"); if (wallHits > 0) tag("Same Wall"); }
    }
  }

  // ----- PLUS rule -----
  if (state.rules.plus) {
    const sums = {};
    nbrs.forEach((n) => { const k = n.mySide + n.theirSide; (sums[k] = sums[k] || []).push(n); });
    Object.values(sums).forEach((group) => {
      if (group.length >= 2) {
        let fired = false;
        group.forEach((n) => {
          if (state.board[n.ni].owner !== owner) { flip(n.ni, owner, flipped, state); comboSeeds.push(n.ni); fired = true; }
        });
        if (fired) tag("Plus");
      }
    });
  }

  // ----- BASIC capture (elemental-aware) -----
  for (const side of SIDES) {
    const ni = neighborOf(index, side);
    if (ni < 0 || !state.board[ni] || state.board[ni].owner === owner) continue;
    const atk = effVal({ card: placed.card, index }, side, state);
    const def = effVal({ card: state.board[ni].card, index: ni }, OPPOSITE[side], state);
    if (state.rules.elemental) {
      const rawAtk = placed.card[side], rawDef = state.board[ni].card[OPPOSITE[side]];
      if ((atk > def) !== (rawAtk > rawDef)) tag("Elemental");   // element tiles swung this comparison
    }
    if (atk > def) flip(ni, owner, flipped, state);
  }

  // ----- COMBO: seeds captured by Same/Plus attack their own neighbors -----
  let queue = [...new Set(comboSeeds)];
  while (queue.length) {
    const from = queue.shift();
    for (const side of SIDES) {
      const ni = neighborOf(from, side);
      if (ni < 0 || !state.board[ni] || state.board[ni].owner === owner) continue;
      const atk = effVal({ card: state.board[from].card, index: from }, side, state);
      const def = effVal({ card: state.board[ni].card, index: ni }, OPPOSITE[side], state);
      if (atk > def) { flip(ni, owner, flipped, state); queue.push(ni); tag("Combo"); }
    }
  }

  return flipped;
}

function flip(ni, owner, flipped, state = S) {
  if (state.board[ni].owner !== owner) {
    state.board[ni].owner = owner;
    if (!flipped.includes(ni)) flipped.push(ni);
  }
}

// ================================================================
//  SIMULATION CORE (pure, DOM-free) — powers the Move Advisor
// ================================================================
// A "state" is a subset of S: { board, tiles, rules, hands }. resolveCaptures
// and friends accept it directly, so the same capture logic drives the sim.

function cloneState(state) {
  return {
    board: state.board.map((c) => (c ? { card: c.card, owner: c.owner } : null)),
    tiles: state.tiles.slice(),
    rules: state.rules,                       // constant during a game — safe to share
    hands: { 1: state.hands[1].slice(), 2: state.hands[2].slice() },
  };
}

// every legal (hand card × empty cell) for `player`
function legalMoves(state, player) {
  const moves = [];
  const hand = state.hands[player];
  for (let h = 0; h < hand.length; h++) {
    for (let cell = 0; cell < 9; cell++) {
      if (!state.board[cell]) moves.push({ handIdx: h, cell });
    }
  }
  return moves;
}

// mutate `state` in place: play hand[handIdx] on `cell`, resolve captures.
// `tags` (optional array) receives the special rules the placement fired.
function applyMove(state, player, handIdx, cell, tags = null) {
  const card = state.hands[player].splice(handIdx, 1)[0];
  state.board[cell] = { card, owner: player };
  resolveCaptures(cell, state, tags);
  return state;
}

// rough leaf-count of the full subtree with `toMove` to play — decides exact vs sampled
function estLeaves(state, toMove) {
  let e = 0;
  for (const c of state.board) if (!c) e++;
  const h = { 1: state.hands[1].length, 2: state.hands[2].length };
  let mover = toMove, leaves = 1;
  while (e > 0 && h[mover] > 0) {
    leaves *= h[mover] * e;
    h[mover]--; e--;
    mover = mover === 1 ? 2 : 1;
    if (leaves > 1e15) break;   // guard: already way over any budget
  }
  return leaves;
}

const OUTCOME_ZERO = () => ({ win: 0, draw: 0, loss: 0, total: 0, marginSum: 0, exact: true });

function tallyTerminal(state, evalPlayer) {
  const s = scores(state);
  const my = s[evalPlayer], op = s[evalPlayer === 1 ? 2 : 1];
  return {
    win: my > op ? 1 : 0,
    draw: my === op ? 1 : 0,
    loss: op > my ? 1 : 0,
    total: 1,
    marginSum: my - op,
    exact: true,
  };
}

// exact enumeration of every continuation (both sides uniform over all moves)
function exactStats(state, evalPlayer, toMove) {
  const moves = legalMoves(state, toMove);
  if (moves.length === 0) return tallyTerminal(state, evalPlayer);
  const agg = OUTCOME_ZERO();
  const next = toMove === 1 ? 2 : 1;
  for (const m of moves) {
    const child = applyMove(cloneState(state), toMove, m.handIdx, m.cell);
    const r = exactStats(child, evalPlayer, next);
    agg.win += r.win; agg.draw += r.draw; agg.loss += r.loss;
    agg.total += r.total; agg.marginSum += r.marginSum;
  }
  return agg;
}

// Monte-Carlo estimate: `sims` uniform-random playouts to a full board
function monteStats(state, evalPlayer, toMove, sims) {
  const agg = OUTCOME_ZERO(); agg.exact = false;
  for (let i = 0; i < sims; i++) {
    const sim = cloneState(state);
    let mover = toMove, moves = legalMoves(sim, mover);
    while (moves.length) {
      const m = moves[rand(moves.length)];
      applyMove(sim, mover, m.handIdx, m.cell);
      mover = mover === 1 ? 2 : 1;
      moves = legalMoves(sim, mover);
    }
    const t = tallyTerminal(sim, evalPlayer);
    agg.win += t.win; agg.draw += t.draw; agg.loss += t.loss;
    agg.total += 1; agg.marginSum += t.marginSum;
  }
  return agg;
}

// win/draw/loss distribution over all continuations for `evalPlayer`,
// with `toMove` to play next — exact when the tree fits `budget`, else sampled
function winStats(state, evalPlayer, toMove, budget, sims) {
  if (estLeaves(state, toMove) <= budget) return exactStats(state, evalPlayer, toMove);
  return monteStats(state, evalPlayer, toMove, sims);
}

// ================================================================
//  MOVE ADVISOR
// ================================================================
// exact-search cutoff (leaves). Kept low on purpose: a full advisor pass evaluates
// *many* candidates, so per-candidate exact cost is multiplied by candidate count.
// ~40k keeps the exact tier (≈5 empty cells and fewer) well under ~1s total, and
// pushes bigger trees (≈6+ empty) onto the fast Monte-Carlo tier. See scratchpad bench.
const ADVISE_BUDGET = 40000;
const N_SIM = 500;              // Monte-Carlo playouts per candidate when sampling
const CELL_LABEL = ["top-left", "top", "top-right", "left", "center", "right", "bottom-left", "bottom", "bottom-right"];

let adviseToken = 0;            // bumps to cancel a stale async pass
let currentAdvice = null;       // ranked results for the player to move (for the 1–5 hotkeys)

function advisorEnabled() {
  const cb = document.getElementById("advisorToggle");
  return cb ? cb.checked : true;
}

function advise() {
  const myToken = ++adviseToken;      // cancels any in-flight pass
  S.suggest = null;
  currentAdvice = null;               // stale until this pass finishes
  if (S.over || S.screen !== "game" || !advisorEnabled()) {
    renderAdvisorPanel([], false, true);
    renderGame();
    return;
  }
  const player = S.current;
  const opp = player === 1 ? 2 : 1;
  const moves = legalMoves(S, player);
  const results = [];
  let sampled = false, i = 0;
  setAdvisorStatus(`Simulating… 0 / ${moves.length}`);

  const step = () => {
    if (myToken !== adviseToken) return;               // superseded by a newer turn
    const start = perfNow();
    while (i < moves.length && perfNow() - start < 15) {  // ~15ms chunks keep the UI live
      const m = moves[i++];
      const tags = [];
      const clone = applyMove(cloneState(S), player, m.handIdx, m.cell, tags);
      const st = winStats(clone, player, opp, ADVISE_BUDGET, N_SIM);
      if (!st.exact) sampled = true;
      results.push({
        handIdx: m.handIdx, cell: m.cell,
        name: S.hands[player][m.handIdx].name,
        winPct: st.win / st.total,
        drawPct: st.draw / st.total,
        avgMargin: st.marginSum / st.total,
        exact: st.exact,
        tags,
      });
    }
    if (i < moves.length) {
      setAdvisorStatus(`Simulating… ${i} / ${moves.length}`);
      setTimeout(step, 0);
      return;
    }
    results.sort((a, b) =>
      b.winPct - a.winPct || b.drawPct - a.drawPct || b.avgMargin - a.avgMargin ||
      b.tags.length - a.tags.length);   // among equals, prefer a special-rule play
    S.suggest = results.length ? { handIdx: results[0].handIdx, cell: results[0].cell } : null;
    currentAdvice = results;                            // enables the 1–5 hotkeys
    renderAdvisorPanel(results, sampled, false);
    renderGame();                                       // paints the .suggested highlights
  };
  setTimeout(step, 0);
}

// Hotkeys 1–5: instantly play the correspondingly-ranked advisor move.
function onAdvisorHotkey(e) {
  if (S.screen !== "game" || S.over) return;
  const t = e.target;
  if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;   // don't hijack typing
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const n = parseInt(e.key, 10);
  if (!(n >= 1 && n <= 5)) return;
  if (!currentAdvice || !currentAdvice.length) return;            // not ready / advisor off
  const mv = currentAdvice[n - 1];
  if (!mv || S.board[mv.cell] || mv.handIdx >= S.hands[S.current].length) return;
  e.preventDefault();
  S.selected = mv.handIdx;
  placeCard(mv.cell);
}

// performance.now() where available (browser); Date.now() fallback keeps it engine-agnostic
function perfNow() {
  return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
}

function setAdvisorStatus(txt) {
  const e = document.getElementById("advisorStatus");
  if (e) e.textContent = txt;
}

function renderAdvisorPanel(results, sampled, hidden) {
  const list = document.getElementById("advisorList");
  if (!list) return;
  if (hidden) {
    list.innerHTML = "";
    setAdvisorStatus(advisorEnabled() ? "" : "off");
    return;
  }
  setAdvisorStatus(sampled ? `~${N_SIM} sims/move · estimate` : "exact solve");
  list.innerHTML = "";
  const TAG_CLASS = { "Same": "same", "Same Wall": "wall", "Plus": "plus", "Elemental": "elem", "Combo": "combo" };
  results.slice(0, 5).forEach((r, idx) => {
    const pct = Math.round(r.winPct * 100);
    const li = document.createElement("li");
    if (idx === 0) li.classList.add("top");
    li.style.setProperty("--w", pct + "%");
    const badges = r.tags.map((t) => `<span class="tag ${TAG_CLASS[t] || ""}">${t}</span>`).join("");
    li.innerHTML =
      `<div class="row-main">` +
        `<span class="rank">${idx + 1}</span>` +
        `<span class="mv">${r.name} → ${CELL_LABEL[r.cell]}</span>` +
        `<span class="pct">${sampled ? "≈" : ""}${pct}% win</span>` +
      `</div>` +
      `<div class="row-sub">` +
        `<span class="draw">${Math.round(r.drawPct * 100)}% draw</span>` +
        (badges ? `<span class="tags">${badges}</span>` : "") +
      `</div>`;
    list.appendChild(li);
  });
}

function animateFlips(indices) {
  const cells = document.querySelectorAll("#board .cell");
  indices.forEach((i) => {
    const card = cells[i]?.querySelector(".card");
    if (card) { card.classList.add("flip"); setTimeout(() => card.classList.remove("flip"), 460); }
  });
}

// ================================================================
//  END
// ================================================================
function endGame() {
  S.over = true;
  S.suggest = null;
  currentAdvice = null;
  adviseToken++;                      // cancel any in-flight advisor pass
  renderAdvisorPanel([], false, true);
  markActive();
  const s = scores();
  let title, msg;
  if (s[1] > s[2]) { title = "Player 1 Wins!"; msg = `Blue ${s[1]} — ${s[2]} Red`; }
  else if (s[2] > s[1]) { title = "Player 2 Wins!"; msg = `Red ${s[2]} — ${s[1]} Blue`; }
  else { title = "Draw!"; msg = `${s[1]} — ${s[2]}`; }
  setBanner("Game over");
  document.getElementById("resultTitle").textContent = title;
  document.getElementById("resultMsg").textContent = msg;
  document.getElementById("modal").classList.remove("hidden");
  renderGame();
}

function backToSetup() {
  S.screen = "setup";
  S.suggest = null;
  currentAdvice = null;
  adviseToken++;                      // cancel any in-flight advisor pass
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("game").classList.add("hidden");
  document.getElementById("setup").classList.remove("hidden");
  renderSetup();
}

// ================================================================
//  WIRE UP
// ================================================================
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("levelFilter").addEventListener("change", renderSetup);
  document.getElementById("searchBox").addEventListener("input", renderSetup);
  document.getElementById("randomOneBtn").addEventListener("click", randomDeck);
  document.getElementById("randomBothBtn").addEventListener("click", randomBoth);
  document.getElementById("clearBtn").addEventListener("click", () => { S.decks[S.picking] = []; renderSetup(); });
  document.getElementById("switchBtn").addEventListener("click", () => { S.picking = S.picking === 1 ? 2 : 1; renderSetup(); });
  document.getElementById("startBtn").addEventListener("click", startGame);
  document.getElementById("playAgainBtn").addEventListener("click", backToSetup);
  document.getElementById("rematchBtn").addEventListener("click", startGame);
  document.getElementById("advisorToggle").addEventListener("change", advise);
  document.getElementById("ruleElem").addEventListener("change", syncTileConfigVisibility);
  document.getElementById("firstPlayer").addEventListener("change", (e) => { S.firstPlayer = e.target.value; });
  document.getElementById("tileRandomBtn").addEventListener("click", randomTiles);
  document.getElementById("tileClearBtn").addEventListener("click", clearTiles);
  window.addEventListener("keydown", onAdvisorHotkey);
  renderSetup();
  syncTileConfigVisibility();
});
