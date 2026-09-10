/**
 * Damage immunities granted by Champions-original abilities.
 *
 * @smogon/calc has no entry for these abilities, so it happily computes full
 * damage for a move the holder should be immune to. Abilities the calculator
 * already knows (Levitate, Flash Fire, Earth Eater, ...) are deliberately
 * absent — it handles those correctly on its own.
 */
export const CHAMPIONS_ABILITY_IMMUNITIES: Record<string, string> = {
  // Levitate's Ground immunity, plus a stat boost on each KO.
  Eelevate: 'Ground',
};
