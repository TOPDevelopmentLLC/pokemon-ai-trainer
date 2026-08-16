/**
 * Descriptions for abilities introduced by Pokemon Champions.
 *
 * @pkmn/dex has no entry for these, so nothing else in the app can describe
 * them. Abilities that already exist in the dex are not repeated here — look
 * those up with `getAbilityDescription`, which falls back to the dex.
 *
 * Source: serebii.net/pokemonchampions
 */
export const CHAMPIONS_ABILITY_DESCRIPTIONS: Record<string, string> = {
  'Piercing Drill':
    "Contact moves hit through protection for 1/4 damage. Everything other than the target's protective effect still triggers.",

  Dragonize: 'Normal-type moves become Dragon-type and deal 20% more damage.',

  Eelevate:
    "Levitate's Ground-type and hazard immunity, plus a +1 boost to the holder's highest stat on each KO.",

  'Mega Sol': 'Moves behave as if harsh sunlight is up, even when it is not.',

  'Fire Mane': 'Fire-type moves deal 50% more damage, with no HP condition.',

  'Spicy Spray': 'Burns any attacker that damages it with a move.',
};
