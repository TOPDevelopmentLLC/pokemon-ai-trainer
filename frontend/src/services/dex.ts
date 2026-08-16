/**
 * Centralized access to Pokemon data via @pkmn/dex + @pkmn/data.
 * All components/services should import from here rather than
 * instantiating Dex/Generations directly.
 *
 * Species lookups go through the gen-agnostic `Dex` rather than a numbered
 * generation, because the Pokemon Champions roster includes Mega Evolutions
 * and species cut from Gen 9 — neither of which exist in `gen9.species`.
 * `gen9` is retained for type-chart and move data, which are gen-scoped.
 */
import { Dex } from '@pkmn/dex';
import { Generations } from '@pkmn/data';
import { Sprites } from '@pkmn/img';
import { CHAMPIONS_LEGAL_SPECIES } from './champions-roster';
import { CHAMPIONS_MEGA_ABILITIES } from '@data/champions-abilities';
import { CHAMPIONS_ABILITY_DESCRIPTIONS } from '@data/champions-ability-descriptions';
import { STAT_LABELS, type StatSpread } from '@app-types/pokemon';

export const generations = new Generations(Dex);
export const gen9 = generations.get(9);
export { Dex };

/** Every Champions-legal species name, sorted for stable display. */
export const LEGAL_SPECIES_NAMES: readonly string[] = [...CHAMPIONS_LEGAL_SPECIES].sort((a, b) =>
  a.localeCompare(b),
);

/**
 * Search Champions-legal species by name prefix (case-insensitive).
 * Returns up to `limit` results.
 */
export function searchSpecies(query: string, limit = 20): string[] {
  const q = query.toLowerCase();
  const results: string[] = [];

  for (const name of LEGAL_SPECIES_NAMES) {
    if (name.toLowerCase().startsWith(q)) {
      results.push(name);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Look up a species by name across all generations.
 * Use this instead of `gen9.species.get` so Megas and Gen 9-cut species resolve.
 */
export function getSpecies(speciesName: string) {
  const species = Dex.species.get(speciesName);
  return species?.exists ? species : null;
}

/**
 * Get abilities available for a species.
 *
 * Champions-original Megas have no entry in @pkmn/dex, which reports the base
 * species' abilities for them. CHAMPIONS_MEGA_ABILITIES overrides those where
 * the real values are known; an empty override falls through to the dex.
 */
export function getSpeciesAbilities(speciesName: string): string[] {
  const species = getSpecies(speciesName);
  if (!species) return [];

  const override = CHAMPIONS_MEGA_ABILITIES[species.name];
  if (override?.length) return [...override];

  const abilities: string[] = [];
  const data = species.abilities;
  if (data[0]) abilities.push(data[0]);
  if (data[1]) abilities.push(data[1]);
  if (data.H) abilities.push(data.H);
  if (data.S) abilities.push(data.S);
  return abilities;
}

/**
 * Description for an ability, or null when nothing is known about it.
 * Champions-original abilities are checked first since @pkmn/dex has no
 * entry for them.
 */
export function getAbilityDescription(abilityName: string): string | null {
  const champions = CHAMPIONS_ABILITY_DESCRIPTIONS[abilityName];
  if (champions) return champions;

  const ability = Dex.abilities.get(abilityName);
  if (!ability?.exists) return null;

  return ability.shortDesc || ability.desc || null;
}

/** Get moves a species can learn */
export async function getSpeciesLearnset(speciesName: string): Promise<string[]> {
  const learnset = await gen9.learnsets.learnable(speciesName);
  if (!learnset) return [];
  return Object.keys(learnset).map(id => {
    const move = gen9.moves.get(id);
    return move ? move.name : id;
  });
}

/** Get all nature names */
export function getAllNatures(): string[] {
  const natures: string[] = [];
  for (const nature of gen9.natures) {
    natures.push(nature.name);
  }
  return natures;
}

/** Get all holdable item names */
export function getAllItems(): string[] {
  const items: string[] = [];
  for (const item of gen9.items) {
    if (!item.exists) continue;
    if (item.num <= 0) continue;
    items.push(item.name);
  }
  return items.sort((a, b) => a.localeCompare(b));
}

/**
 * The species' highest base stats, strongest first.
 * Ties break by canonical stat order (HP, Atk, Def, SpA, SpD, Spe) so the
 * same species always renders the same way.
 */
export function getTopBaseStats(speciesName: string, count = 2): { key: keyof StatSpread; label: string; value: number }[] {
  const species = getSpecies(speciesName);
  if (!species) return [];

  return STAT_LABELS.map(({ key, label }) => ({ key, label, value: species.baseStats[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

/**
 * Sprite URL for a species.
 *
 * Champions introduces Mega Evolutions that do not exist in mainline games —
 * Mega Scrafty, Mega Dragalge, Mega Raichu X/Y and 21 others. @pkmn/img has no
 * artwork for them and hands back a gen5 PNG path that 404s, so those fall back
 * to the base species' sprite rather than rendering a broken image.
 */
export function getSpriteUrl(speciesName: string): string {
  const url = Sprites.getPokemon(speciesName, { gen: 'ani' }).url;

  // A real animated sprite always resolves under /ani/; anything else is the
  // library's fallback for artwork it does not have.
  if (url.includes('/ani/')) return url;

  const baseSpecies = getSpecies(speciesName)?.baseSpecies;
  if (baseSpecies && baseSpecies !== speciesName) {
    return Sprites.getPokemon(baseSpecies, { gen: 'ani' }).url;
  }

  return url;
}

/** Get type names for a species */
export function getSpeciesTypes(speciesName: string): string[] {
  const species = getSpecies(speciesName);
  if (!species) return [];
  return [...species.types];
}
