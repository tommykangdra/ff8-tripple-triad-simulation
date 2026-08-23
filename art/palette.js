/* ===== Sprite palettes, keyed by card level =====
 * Level doubles as rarity in this game (1-5 Monster, 6-7 Boss, 8-9 GF, 10 Character),
 * so the tier palette reads as a power curve: drab -> precious.
 * Levels 4, 9 and 10 deliberately echo existing theme tokens (--blue #2f6bd8,
 * #cfe0ff, #ffd24a/#ffe37a) so sprites sit inside the established palette.
 */

// Every sprite is fully outlined in this near-black navy (a shade off --bg #0a1020).
// It is what separates the art from BOTH owner faces (blue #24407e, red #7e2424).
const SPRITE_OUTLINE = "#080d18";

// Accent colors reuse the three already in styles.css, so nothing new enters the palette.
const SPRITE_ACCENTS = ["#ffd24a", "#7fd0ff", "#ff9d5b"];

const TIER_PALETTE = {
  1:  { dark: "#3d4742", mid: "#5e6b64", light: "#8a9a90" }, // slate grey
  2:  { dark: "#27441f", mid: "#3f6b34", light: "#62a052" }, // moss green
  3:  { dark: "#1c4547", mid: "#2d6b6e", light: "#4aa0a3" }, // teal
  4:  { dark: "#1e3a61", mid: "#2f5a8f", light: "#4f8ad0" }, // steel blue
  5:  { dark: "#322760", mid: "#4e3d96", light: "#7b62d4" }, // violet
  6:  { dark: "#5e1d3a", mid: "#93305d", light: "#cf5090" }, // crimson
  7:  { dark: "#5e2914", mid: "#94411f", light: "#d4712f" }, // orange-red
  8:  { dark: "#4a3a12", mid: "#7a5c1c", light: "#b8912f" }, // bronze
  9:  { dark: "#46606f", mid: "#8fb4c4", light: "#d6e8f2" }, // silver-cyan
  10: { dark: "#6b5214", mid: "#b8902a", light: "#ffe37a" }, // gold
};

// Clamped so an unexpected level never yields undefined shades.
function tierPalette(level) {
  const n = Math.min(10, Math.max(1, Math.round(level) || 1));
  return TIER_PALETTE[n];
}
