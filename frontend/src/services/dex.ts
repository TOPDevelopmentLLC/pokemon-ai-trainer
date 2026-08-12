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
import { CHAMPIONS_LEGAL_SPECIES } from './champions-roster';

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

/** Get abilities available for a species */
export function getSpeciesAbilities(speciesName: string): string[] {
  const species = getSpecies(speciesName);
  if (!species) return [];

  const abilities: string[] = [];
  const data = species.abilities;
  if (data[0]) abilities.push(data[0]);
  if (data[1]) abilities.push(data[1]);
  if (data.H) abilities.push(data.H);
  if (data.S) abilities.push(data.S);
  return abilities;
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

/** Get type names for a species */
export function getSpeciesTypes(speciesName: string): string[] {
  const species = getSpecies(speciesName);
  if (!species) return [];
  return [...species.types];
}
