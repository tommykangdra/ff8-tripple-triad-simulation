/* ===== Sprite renderer: 16x16 grid -> memoized data-URI SVG =====
 * Loaded after the sprite grids, palette.js and archetypes.js (see index.html).
 * Pure string work, no DOM APIs, so it is safe under test.js's vm sandbox.
 */
const SPRITES = Object.assign({}, SPRITES_BEASTS, SPRITES_NATURE,
                                 SPRITES_CONSTRUCTS, SPRITES_DARK);

const FRECKLES = 3;   // accent cells added per card (see freckle() below)

// FNV-1a, 32-bit. Deterministic, so a given card always looks identical.
function spriteHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = 60 * (max === r ? (g - b) / d + (g < b ? 6 : 0)
            : max === g ? (b - r) / d + 2
            :             (r - g) / d + 4);
  }
  return { h, s, l };
}

function hslToHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const rgb = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x]
            : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  return "#" + rgb.map((v) =>
    Math.round(Math.min(1, Math.max(0, v + m)) * 255).toString(16).padStart(2, "0")
  ).join("");
}

function shiftHue(hex, deg) {
  const c = hexToHsl(hex);
  return hslToHex(c.h + deg, c.s, c.l);
}

/* Promote a few already-opaque body cells to the accent color. Restricted to the
 * mid/light shades so the outline stays intact and no accent pixel can ever float
 * outside the silhouette — which is what makes stamp-style overlays look broken. */
function freckle(rows, h) {
  const cells = rows.map((r) => r.split(""));
  const spots = [];
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (cells[y][x] === "3" || cells[y][x] === "4") spots.push([x, y]);
    }
  }
  if (!spots.length) return cells;
  const step = 7 + (h % 11);            // stride spreads the picks apart
  for (let i = 0; i < FRECKLES; i++) {
    const [x, y] = spots[((h >>> 9) + i * step) % spots.length];
    cells[y][x] = "5";
  }
  return cells;
}

function buildSprite(card) {
  const grid = SPRITES[archetypeOf(card)];
  const h = spriteHash(card.name);
  const tier = tierPalette(card.level);
  const hue = ((h >>> 2) % 15) - 7;     // +/-7 degrees, so cards in a tier differ

  const fill = {
    1: SPRITE_OUTLINE,
    2: shiftHue(tier.dark, hue),
    3: shiftHue(tier.mid, hue),
    4: shiftHue(tier.light, hue),
    5: SPRITE_ACCENTS[(h >>> 6) % SPRITE_ACCENTS.length],
  };

  const rows = (h & 1) ? grid.map((r) => r.split("").reverse().join("")) : grid;
  const cells = freckle(rows, h);

  // Run-length merge each row, accumulating one path per color rather than one
  // rect per pixel: ~55 runs collapse into <=5 nodes and a much shorter URI.
  const paths = {};
  for (let y = 0; y < 16; y++) {
    let x = 0;
    while (x < 16) {
      const c = cells[y][x];
      if (c === ".") { x++; continue; }
      let w = 1;
      while (x + w < 16 && cells[y][x + w] === c) w++;
      paths[c] = (paths[c] || "") + `M${x} ${y}h${w}v1h-${w}z`;
      x += w;
    }
  }

  const body = Object.keys(paths).sort()
    .map((c) => `<path d="${paths[c]}" fill="${fill[c]}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"` +
              ` shape-rendering="crispEdges">${body}</svg>`;

  // encodeURIComponent leaves no quote, paren or whitespace characters behind, so an
  // unquoted url() is safe to drop straight into an HTML style="..." attribute.
  return `url(data:image/svg+xml,${encodeURIComponent(svg)})`;
}

/* renderSetup/renderHand/renderBoard rebuild their DOM on every state change, so
 * memoize: at most 110 distinct sprites, each built exactly once. */
const SPRITE_CACHE = new Map();

function spriteURI(card) {
  const key = card.name + "|" + card.level;
  let uri = SPRITE_CACHE.get(key);
  if (uri === undefined) {
    uri = buildSprite(card);
    SPRITE_CACHE.set(key, uri);
  }
  return uri;
}
