/* Final Fantasy VIII — Triple Triad card database.
 * All 110 cards across 10 levels. Numbers are [top, left, right, bottom],
 * rank 1-10 (10 is shown in-game as "A"). Element is null when the card has none.
 * Source values verified against community card lists (nslists / FF Wiki).
 */
const CARDS = [
  // ---- Level 1 — Monster ----
  { name: "Geezard",        level: 1, top: 1, left: 5, right: 4, bottom: 1, element: null },
  { name: "Funguar",        level: 1, top: 5, left: 3, right: 1, bottom: 1, element: null },
  { name: "Bite Bug",       level: 1, top: 1, left: 5, right: 3, bottom: 3, element: null },
  { name: "Red Bat",        level: 1, top: 6, left: 2, right: 1, bottom: 1, element: null },
  { name: "Blobra",         level: 1, top: 2, left: 5, right: 3, bottom: 1, element: null },
  { name: "Gayla",          level: 1, top: 2, left: 4, right: 1, bottom: 4, element: "Thunder" },
  { name: "Gesper",         level: 1, top: 1, left: 1, right: 5, bottom: 4, element: null },
  { name: "Fastitocalon-F", level: 1, top: 3, left: 1, right: 5, bottom: 2, element: "Earth" },
  { name: "Blood Soul",     level: 1, top: 2, left: 1, right: 1, bottom: 6, element: null },
  { name: "Caterchipillar", level: 1, top: 4, left: 3, right: 2, bottom: 4, element: null },
  { name: "Cockatrice",     level: 1, top: 2, left: 6, right: 1, bottom: 2, element: "Thunder" },

  // ---- Level 2 — Monster ----
  { name: "Grat",           level: 2, top: 7, left: 1, right: 1, bottom: 3, element: null },
  { name: "Buel",           level: 2, top: 6, left: 3, right: 2, bottom: 2, element: null },
  { name: "Mesmerize",      level: 2, top: 5, left: 4, right: 3, bottom: 3, element: null },
  { name: "Glacial Eye",    level: 2, top: 6, left: 3, right: 1, bottom: 4, element: "Ice" },
  { name: "Belhelmel",      level: 2, top: 3, left: 3, right: 4, bottom: 5, element: null },
  { name: "Thrustaevis",    level: 2, top: 5, left: 5, right: 3, bottom: 2, element: "Wind" },
  { name: "Anacondaur",     level: 2, top: 5, left: 5, right: 1, bottom: 3, element: "Poison" },
  { name: "Creeps",         level: 2, top: 5, left: 2, right: 2, bottom: 5, element: "Thunder" },
  { name: "Grendel",        level: 2, top: 4, left: 2, right: 4, bottom: 5, element: "Thunder" },
  { name: "Jelleye",        level: 2, top: 3, left: 7, right: 2, bottom: 1, element: null },
  { name: "Grand Mantis",   level: 2, top: 5, left: 3, right: 2, bottom: 5, element: null },

  // ---- Level 3 — Monster ----
  { name: "Forbidden",      level: 3, top: 6, left: 2, right: 6, bottom: 3, element: null },
  { name: "Armadodo",       level: 3, top: 6, left: 6, right: 3, bottom: 1, element: "Earth" },
  { name: "Tri-Face",       level: 3, top: 3, left: 5, right: 5, bottom: 5, element: "Poison" },
  { name: "Fastitocalon",   level: 3, top: 7, left: 3, right: 5, bottom: 1, element: "Earth" },
  { name: "Snow Lion",      level: 3, top: 7, left: 3, right: 1, bottom: 5, element: "Ice" },
  { name: "Ochu",           level: 3, top: 5, left: 3, right: 6, bottom: 3, element: null },
  { name: "SAM08G",         level: 3, top: 5, left: 4, right: 6, bottom: 2, element: "Fire" },
  { name: "Death Claw",     level: 3, top: 4, left: 2, right: 4, bottom: 7, element: "Fire" },
  { name: "Cactuar",        level: 3, top: 6, left: 3, right: 2, bottom: 6, element: null },
  { name: "Tonberry",       level: 3, top: 3, left: 4, right: 6, bottom: 4, element: null },
  { name: "Abyss Worm",     level: 3, top: 7, left: 5, right: 2, bottom: 3, element: "Earth" },

  // ---- Level 4 — Monster ----
  { name: "Turtapod",       level: 4, top: 2, left: 7, right: 3, bottom: 6, element: null },
  { name: "Vysage",         level: 4, top: 6, left: 5, right: 5, bottom: 4, element: null },
  { name: "T-Rexaur",       level: 4, top: 4, left: 7, right: 6, bottom: 2, element: null },
  { name: "Bomb",           level: 4, top: 2, left: 3, right: 7, bottom: 6, element: "Fire" },
  { name: "Blitz",          level: 4, top: 1, left: 7, right: 6, bottom: 4, element: "Thunder" },
  { name: "Wendigo",        level: 4, top: 7, left: 6, right: 3, bottom: 1, element: null },
  { name: "Torama",         level: 4, top: 7, left: 4, right: 4, bottom: 4, element: null },
  { name: "Imp",            level: 4, top: 3, left: 6, right: 7, bottom: 3, element: null },
  { name: "Blue Dragon",    level: 4, top: 6, left: 3, right: 2, bottom: 7, element: "Poison" },
  { name: "Adamantoise",    level: 4, top: 4, left: 6, right: 5, bottom: 5, element: "Earth" },
  { name: "Hexadragon",     level: 4, top: 7, left: 3, right: 5, bottom: 4, element: "Fire" },

  // ---- Level 5 — Monster ----
  { name: "Iron Giant",     level: 5, top: 6, left: 5, right: 5, bottom: 6, element: null },
  { name: "Behemoth",       level: 5, top: 3, left: 7, right: 6, bottom: 5, element: null },
  { name: "Chimera",        level: 5, top: 7, left: 3, right: 6, bottom: 5, element: "Water" },
  { name: "PuPu",           level: 5, top: 3, left: 1, right: 10, bottom: 2, element: null },
  { name: "Elastoid",       level: 5, top: 6, left: 7, right: 2, bottom: 6, element: null },
  { name: "GIM47N",         level: 5, top: 5, left: 4, right: 5, bottom: 7, element: null },
  { name: "Malboro",        level: 5, top: 7, left: 2, right: 7, bottom: 4, element: "Poison" },
  { name: "Ruby Dragon",    level: 5, top: 7, left: 4, right: 2, bottom: 7, element: "Fire" },
  { name: "Elnoyle",        level: 5, top: 5, left: 6, right: 3, bottom: 7, element: null },
  { name: "Tonberry King",  level: 5, top: 7, left: 4, right: 6, bottom: 7, element: null },
  { name: "Wedge, Biggs",   level: 5, top: 6, left: 7, right: 6, bottom: 2, element: null },

  // ---- Level 6 — Boss ----
  { name: "Fujin, Raijin",  level: 6, top: 2, left: 4, right: 8, bottom: 8, element: null },
  { name: "Elvoret",        level: 6, top: 7, left: 4, right: 8, bottom: 3, element: "Wind" },
  { name: "X-ATM092",       level: 6, top: 4, left: 3, right: 8, bottom: 7, element: null },
  { name: "Granaldo",       level: 6, top: 7, left: 5, right: 2, bottom: 8, element: null },
  { name: "Gerogero",       level: 6, top: 1, left: 3, right: 8, bottom: 8, element: "Poison" },
  { name: "Iguion",         level: 6, top: 8, left: 2, right: 2, bottom: 8, element: null },
  { name: "Abadon",         level: 6, top: 6, left: 5, right: 8, bottom: 4, element: null },
  { name: "Trauma",         level: 6, top: 4, left: 6, right: 8, bottom: 5, element: null },
  { name: "Oilboyle",       level: 6, top: 1, left: 8, right: 8, bottom: 4, element: null },
  { name: "Shumi Tribe",    level: 6, top: 6, left: 4, right: 5, bottom: 8, element: null },
  { name: "Krysta",         level: 6, top: 7, left: 1, right: 5, bottom: 8, element: null },

  // ---- Level 7 — Boss ----
  { name: "Propagator",     level: 7, top: 8, left: 8, right: 4, bottom: 4, element: null },
  { name: "Jumbo Cactuar",  level: 7, top: 8, left: 4, right: 8, bottom: 4, element: null },
  { name: "Tri-Point",      level: 7, top: 8, left: 8, right: 5, bottom: 2, element: "Thunder" },
  { name: "Gargantua",      level: 7, top: 5, left: 8, right: 6, bottom: 6, element: null },
  { name: "Mobile Type 8",  level: 7, top: 8, left: 3, right: 6, bottom: 7, element: null },
  { name: "Sphinxara",      level: 7, top: 8, left: 8, right: 3, bottom: 5, element: null },
  { name: "Tiamat",         level: 7, top: 8, left: 4, right: 8, bottom: 5, element: null },
  { name: "BGH251F2",       level: 7, top: 5, left: 5, right: 7, bottom: 8, element: null },
  { name: "Red Giant",      level: 7, top: 6, left: 7, right: 8, bottom: 4, element: null },
  { name: "Catoblepas",     level: 7, top: 1, left: 7, right: 8, bottom: 7, element: null },
  { name: "Ultima Weapon",  level: 7, top: 7, left: 8, right: 7, bottom: 2, element: null },

  // ---- Level 8 — Guardian Force ----
  { name: "Chubby Chocobo", level: 8, top: 4, left: 9, right: 4, bottom: 8, element: null },
  { name: "Angelo",         level: 8, top: 9, left: 3, right: 6, bottom: 7, element: null },
  { name: "Gilgamesh",      level: 8, top: 3, left: 6, right: 7, bottom: 9, element: null },
  { name: "MiniMog",        level: 8, top: 9, left: 2, right: 3, bottom: 9, element: null },
  { name: "Chicobo",        level: 8, top: 9, left: 4, right: 4, bottom: 8, element: null },
  { name: "Quezacotl",      level: 8, top: 2, left: 4, right: 9, bottom: 9, element: "Thunder" },
  { name: "Shiva",          level: 8, top: 6, left: 9, right: 7, bottom: 4, element: "Ice" },
  { name: "Ifrit",          level: 8, top: 9, left: 8, right: 6, bottom: 2, element: "Fire" },
  { name: "Siren",          level: 8, top: 8, left: 2, right: 9, bottom: 6, element: null },
  { name: "Sacred",         level: 8, top: 5, left: 9, right: 1, bottom: 9, element: "Earth" },
  { name: "Minotaur",       level: 8, top: 9, left: 9, right: 5, bottom: 2, element: "Earth" },

  // ---- Level 9 — Guardian Force ----
  { name: "Carbuncle",      level: 9, top: 8, left: 4, right: 4, bottom: 10, element: null },
  { name: "Diablos",        level: 9, top: 5, left: 3, right: 10, bottom: 8, element: null },
  { name: "Leviathan",      level: 9, top: 7, left: 7, right: 10, bottom: 1, element: "Water" },
  { name: "Odin",           level: 9, top: 8, left: 5, right: 10, bottom: 3, element: null },
  { name: "Pandemona",      level: 9, top: 10, left: 7, right: 1, bottom: 7, element: "Wind" },
  { name: "Cerberus",       level: 9, top: 7, left: 10, right: 4, bottom: 6, element: null },
  { name: "Alexander",      level: 9, top: 9, left: 2, right: 10, bottom: 4, element: "Holy" },
  { name: "Phoenix",        level: 9, top: 7, left: 10, right: 2, bottom: 7, element: "Fire" },
  { name: "Bahamut",        level: 9, top: 10, left: 6, right: 8, bottom: 2, element: null },
  { name: "Doomtrain",      level: 9, top: 3, left: 10, right: 1, bottom: 10, element: "Poison" },
  { name: "Eden",           level: 9, top: 4, left: 10, right: 4, bottom: 9, element: null },

  // ---- Level 10 — Character ----
  { name: "Ward Zabac",     level: 10, top: 10, left: 8, right: 7, bottom: 2, element: null },
  { name: "Kiros Seagill",  level: 10, top: 6, left: 10, right: 7, bottom: 6, element: null },
  { name: "Laguna Loire",   level: 10, top: 5, left: 9, right: 10, bottom: 3, element: null },
  { name: "Selphie Tilmitt",level: 10, top: 10, left: 4, right: 8, bottom: 6, element: null },
  { name: "Quistis Trepe",  level: 10, top: 9, left: 2, right: 6, bottom: 10, element: null },
  { name: "Irvine Kinneas", level: 10, top: 2, left: 10, right: 6, bottom: 9, element: null },
  { name: "Zell Dincht",    level: 10, top: 8, left: 6, right: 5, bottom: 10, element: null },
  { name: "Rinoa Heartilly",level: 10, top: 4, left: 10, right: 10, bottom: 2, element: null },
  { name: "Edea Kramer",    level: 10, top: 10, left: 3, right: 10, bottom: 3, element: null },
  { name: "Seifer Almasy",  level: 10, top: 6, left: 4, right: 9, bottom: 10, element: null },
  { name: "Squall Leonhart",level: 10, top: 10, left: 9, right: 4, bottom: 6, element: null },
];

// Element -> emoji badge used by the CSS-art cards.
const ELEMENT_ICON = {
  Fire: "🔥", Ice: "❄️", Thunder: "⚡", Earth: "🪨",
  Poison: "☠️", Wind: "🌀", Water: "💧", Holy: "✨",
};
