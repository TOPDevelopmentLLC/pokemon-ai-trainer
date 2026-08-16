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
  'Barbaracle-Mega': [],

  // Chandelure has: Flash Fire, Flame Body, Infiltrator
  'Chandelure-Mega': [],

  // Chimecho has: Levitate
  'Chimecho-Mega': [],

  // Clefable has: Cute Charm, Magic Guard, Unaware
  'Clefable-Mega': [],

  // Crabominable has: Hyper Cutter, Iron Fist, Anger Point
  'Crabominable-Mega': [],

  // Dragalge has: Poison Point, Poison Touch, Adaptability
  'Dragalge-Mega': [],

  // Dragonite has: Inner Focus, Multiscale
  'Dragonite-Mega': [],

  // Drampa has: Berserk, Sap Sipper, Cloud Nine
  'Drampa-Mega': [],

  // Eelektross has: Levitate
  'Eelektross-Mega': [],

  // Emboar has: Blaze, Reckless
  'Emboar-Mega': [],

  // Excadrill has: Sand Rush, Sand Force, Mold Breaker
  'Excadrill-Mega': [],

  // Falinks has: Battle Armor, Defiant
  'Falinks-Mega': [],

  // Feraligatr has: Torrent, Sheer Force
  'Feraligatr-Mega': [],

  // Floette has: Flower Veil, Symbiosis
  'Floette-Mega': [],

  // Froslass has: Snow Cloak, Cursed Body
  'Froslass-Mega': [],

  // Glimmora has: Toxic Debris, Corrosion
  'Glimmora-Mega': [],

  // Golurk has: Iron Fist, Klutz, No Guard
  'Golurk-Mega': [],

  // Hawlucha has: Limber, Unburden, Mold Breaker
  'Hawlucha-Mega': [],

  // Malamar has: Contrary, Suction Cups, Infiltrator
  'Malamar-Mega': [],

  // Meganium has: Overgrow, Leaf Guard
  'Meganium-Mega': [],

  // Pyroar has: Rivalry, Unnerve, Moxie
  'Pyroar-Mega': [],

  // Scolipede has: Poison Point, Swarm, Speed Boost
  'Scolipede-Mega': [],

  // Scovillain has: Chlorophyll, Insomnia, Moody
  'Scovillain-Mega': [],

  // Scrafty has: Shed Skin, Moxie, Intimidate
  'Scrafty-Mega': [],

  // Skarmory has: Keen Eye, Sturdy, Weak Armor
  'Skarmory-Mega': [],

  // Staraptor has: Intimidate, Reckless
  'Staraptor-Mega': [],

  // Starmie has: Illuminate, Natural Cure, Analytic
  'Starmie-Mega': [],

  // Victreebel has: Chlorophyll, Gluttony
  'Victreebel-Mega': [],
};
