/**
 * Ability overrides for Champions-original Mega Evolutions.
 *
 * @pkmn/dex has no data for these formes, so it reports the base species'
 * ability list instead of the Mega's own ability. Fill an entry in to
 * override; an empty array falls through to whatever the dex reports, so
 * unfilled entries keep today's behavior rather than blanking the UI.
 *
 * Keys are dex species names. The comment above each entry lists the base
 * species' abilities, which is what currently displays.
 */
export const CHAMPIONS_MEGA_ABILITIES: Record<string, string[]> = {
  // Barbaracle has: Tough Claws, Sniper, Pickpocket
  'Barbaracle-Mega': ['Tough Claws'],

  // Chandelure has: Flash Fire, Flame Body, Infiltrator
  'Chandelure-Mega': ['Infiltrator'],

  // Chimecho has: Levitate
  'Chimecho-Mega': ['Levitate'],

  // Clefable has: Cute Charm, Magic Guard, Unaware
  'Clefable-Mega': ['Magic Bounce'],

  // Crabominable has: Hyper Cutter, Iron Fist, Anger Point
  'Crabominable-Mega': ['Iron Fist'],

  // Dragalge has: Poison Point, Poison Touch, Adaptability
  'Dragalge-Mega': ['Regenerator'],

  // Dragonite has: Inner Focus, Multiscale
  'Dragonite-Mega': ['Multiscale'],

  // Drampa has: Berserk, Sap Sipper, Cloud Nine
  'Drampa-Mega': ['Berserk'],

  // Eelektross has: Levitate
  'Eelektross-Mega': ['Eelevate'],

  // Emboar has: Blaze, Reckless
  'Emboar-Mega': ['Mold Breaker'],

  // Excadrill has: Sand Rush, Sand Force, Mold Breaker
  'Excadrill-Mega': ['Piercing Drill'],

  // Falinks has: Battle Armor, Defiant
  'Falinks-Mega': ['Defiant'],

  // Feraligatr has: Torrent, Sheer Force
  'Feraligatr-Mega': ['Dragonize'],

  // Floette has: Flower Veil, Symbiosis
  'Floette-Mega': ['Fairy Aura'],

  // Froslass has: Snow Cloak, Cursed Body
  'Froslass-Mega': ['Snow Warning'],

  // Glimmora has: Toxic Debris, Corrosion
  'Glimmora-Mega': ['Adaptability'],

  // Golurk has: Iron Fist, Klutz, No Guard
  'Golurk-Mega': ['Unseen Fist'],

  // Hawlucha has: Limber, Unburden, Mold Breaker
  'Hawlucha-Mega': ['No Guard'],

  // Malamar has: Contrary, Suction Cups, Infiltrator
  'Malamar-Mega': ['Contrary'],

  // Meganium has: Overgrow, Leaf Guard
  'Meganium-Mega': ['Mega Sol'],

  // Pyroar has: Rivalry, Unnerve, Moxie
  'Pyroar-Mega': ['Fire Mane'],

  // Scolipede has: Poison Point, Swarm, Speed Boost
  'Scolipede-Mega': ['Shell Armor'],

  // Scovillain has: Chlorophyll, Insomnia, Moody
  'Scovillain-Mega': ['Spicy Spray'],

  // Scrafty has: Shed Skin, Moxie, Intimidate
  'Scrafty-Mega': ['Intimidate'],

  // Skarmory has: Keen Eye, Sturdy, Weak Armor
  'Skarmory-Mega': ['Stalwart'],

  // Staraptor has: Intimidate, Reckless
  'Staraptor-Mega': ['Contrary'],

  // Starmie has: Illuminate, Natural Cure, Analytic
  'Starmie-Mega': ['Huge Power'],

  // Victreebel has: Chlorophyll, Gluttony
  'Victreebel-Mega': ['Innards Out'],
};
