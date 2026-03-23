/**
 * Centralized access to Pokemon data via @pkmn/dex + @pkmn/data.
 * All components/services should import from here rather than
 * instantiating Dex/Generations directly.
 */
import { Dex } from '@pkmn/dex';
import { Generations } from '@pkmn/data';

export const generations = new Generations(Dex);
export const gen9 = generations.get(9);

/** Search species by name prefix (case-insensitive). Returns up to `limit` results. */
export function searchSpecies(query: string, limit = 20): string[] {
  const q = query.toLowerCase();
  const results: string[] = [];

  for (const species of gen9.species) {
    if (!species.exists) continue;
    // Skip alternate formes, megas, etc. unless specifically searched
    if (species.forme && !species.name.toLowerCase().startsWith(q)) continue;
    // Skip CAP pokemon
    if (species.num <= 0) continue;

    if (species.name.toLowerCase().startsWith(q)) {
      results.push(species.name);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/** Get abilities available for a species */
export function getSpeciesAbilities(speciesName: string): string[] {
  const species = gen9.species.get(speciesName);
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
  const species = gen9.species.get(speciesName);
  if (!species) return [];
  return [...species.types];
}
