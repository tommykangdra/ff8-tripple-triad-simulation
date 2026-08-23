/* ===== Card name -> sprite archetype =====
 * Grouped pipe-separated (card names contain spaces AND commas, e.g. "Wedge, Biggs")
 * and flattened into a lookup at load. Keyed by name because names are unique and
 * cards carry no id — see cards.js.
 */
const ARCHETYPE_GROUPS = {
  dragon:    "Grendel|Blue Dragon|Hexadragon|Ruby Dragon|Tiamat|Bahamut",
  wyvern:    "Cockatrice|Thrustaevis|Chimera|Elvoret|Quezacotl|Phoenix",
  beast:     "Geezard|Mesmerize|T-Rexaur|Behemoth|Iguion|Gargantua|Catoblepas|Angelo|Cerberus",
  feline:    "Snow Lion|Torama|Sphinxara|Carbuncle",
  bat:       "Red Bat",
  serpent:   "Anacondaur|Abyss Worm|Leviathan",
  plant:     "Funguar|Grat|Ochu|Malboro",
  cactus:    "Cactuar|Jumbo Cactuar",
  insect:    "Bite Bug|Caterchipillar|Grand Mantis|Elnoyle|Granaldo",
  arachnid:  "Death Claw|X-ATM092",
  fish:      "Gayla|Fastitocalon-F|Fastitocalon",
  shell:     "Armadodo|Turtapod|Adamantoise",
  machine:   "Belhelmel|SAM08G|GIM47N|Trauma|Doomtrain",
  mech:      "Elastoid|Mobile Type 8|BGH251F2|Alexander",
  orb:       "Buel|Glacial Eye|Jelleye|Bomb|Blitz|Krysta|Tri-Point",
  giant:     "Wendigo|Iron Giant|Red Giant|Sacred|Minotaur",
  blob:      "Blobra|PuPu|Oilboyle|Propagator|MiniMog",
  chocobo:   "Chubby Chocobo|Chicobo",
  undead:    "Forbidden|Gerogero",
  ghost:     "Gesper|Blood Soul",
  demon:     "Creeps|Tri-Face|Vysage|Imp|Abadon|Ultima Weapon|Ifrit|Diablos|Pandemona",
  soldier:   "Tonberry|Tonberry King|Gilgamesh|Odin",
  celestial: "Shiva|Siren|Eden",
  portrait:  "Wedge, Biggs|Fujin, Raijin|Shumi Tribe",
  // Level 10 characters -- one sprite each, see art/sprites-detailed.js
  squall:    "Squall Leonhart",
  rinoa:     "Rinoa Heartilly",
  zell:      "Zell Dincht",
  selphie:   "Selphie Tilmitt",
  quistis:   "Quistis Trepe",
  irvine:    "Irvine Kinneas",
  laguna:    "Laguna Loire",
  kiros:     "Kiros Seagill",
  ward:      "Ward Zabac",
  edea:      "Edea Kramer",
  seifer:    "Seifer Almasy",
};

const ARCHETYPE_OF = {};
for (const [archetype, names] of Object.entries(ARCHETYPE_GROUPS)) {
  for (const name of names.split("|")) ARCHETYPE_OF[name] = archetype;
}

/* Fallback by level, so a name absent from the map still resolves to a sprite.
 * This matters: test.js manufactures cards named "X" at level 1. Index 0 is unused. */
const LEVEL_ARCHETYPE = [
  "beast", "beast", "insect", "beast", "beast", "giant",
  "demon", "mech", "celestial", "dragon", "portrait",
];

/* How many cards share each archetype. render.js uses this to skip the per-card accent
 * freckling on sprites belonging to a single card (the Level 10 characters), where it
 * would only add noise to a face. */
const ARCHETYPE_COUNT = {};
for (const a of Object.values(ARCHETYPE_OF)) ARCHETYPE_COUNT[a] = (ARCHETYPE_COUNT[a] || 0) + 1;

function isSharedArchetype(a) {
  return (ARCHETYPE_COUNT[a] || 0) > 1;
}

function archetypeOf(card) {
  return ARCHETYPE_OF[card.name] || LEVEL_ARCHETYPE[Math.min(10, Math.max(1, card.level || 1))];
}
