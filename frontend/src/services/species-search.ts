/**
 * Species search across name, type, ability, and base stats.
 * Restricted to the Champions-legal roster, like every other lookup in the app.
 */
import { getSpecies, getSpeciesAbilities, LEGAL_SPECIES_NAMES } from './dex';
import { STAT_LABELS } from '@app-types/pokemon';
import type { StatSpread } from '@app-types/pokemon';
import type { SpeciesSearchCriteria, SpeciesSearchResult } from '@app-types/species-search';

/** A searchable record per species, with lowercase fields for matching. */
interface IndexedSpecies {
  name: string;
  lowerName: string;
  /**
   * How the game writes the name, when it differs from the dex form.
   * The dex calls it "Charizard-Mega-X"; players type "Mega Charizard X".
   */
  altName: string | null;
  types: string[];
  abilities: string[];
  lowerAbilities: string[];
  baseStats: StatSpread;
  baseStatTotal: number;
}

/**
 * Game-facing spelling for dex forme names, so searching the way the game
 * writes a Pokemon still finds it. Returns null when no alias applies.
 */
function gameFacingName(dexName: string): string | null {
  const mega = dexName.match(/^(.+)-Mega(?:-([XY]))?$/);
  if (mega) {
    const [, base, variant] = mega;
    return `mega ${base} ${variant ?? ''}`.trim().toLowerCase();
  }

  // "Raichu-Alola" -> "alolan raichu". A trailing suffix is kept so the
  // Paldean Tauros breeds ("Tauros-Paldea-Combat") stay distinguishable.
  const regional = dexName.match(/^(.+?)-(Alola|Galar|Hisui|Paldea)(?:-(.+))?$/);
  if (regional) {
    const [, base, region, variant] = regional;
    const adjective = { Alola: 'alolan', Galar: 'galarian', Hisui: 'hisuian', Paldea: 'paldean' }[
      region
    ];
    return `${adjective} ${base} ${variant ?? ''}`.trim().toLowerCase();
  }

  return null;
}

/**
 * Built once on first search. The roster is fixed at module load, so there is
 * nothing to invalidate, and rebuilding per keystroke would re-read the dex
 * for all 298 species.
 */
let index: IndexedSpecies[] | null = null;

function buildIndex(): IndexedSpecies[] {
  const entries: IndexedSpecies[] = [];

  for (const name of LEGAL_SPECIES_NAMES) {
    const species = getSpecies(name);
    if (!species) continue;

    const abilities = getSpeciesAbilities(name);
    const baseStats = species.baseStats;

    entries.push({
      name,
      lowerName: name.toLowerCase(),
      altName: gameFacingName(name),
      types: [...species.types],
      abilities,
      lowerAbilities: abilities.map(a => a.toLowerCase()),
      baseStats,
      baseStatTotal: STAT_LABELS.reduce((sum, { key }) => sum + baseStats[key], 0),
    });
  }

  return entries;
}

function getIndex(): IndexedSpecies[] {
  index ??= buildIndex();
  return index;
}

/** Every type present on the legal roster, sorted for stable display. */
export function getAvailableTypes(): string[] {
  const types = new Set<string>();
  for (const entry of getIndex()) {
    for (const type of entry.types) types.add(type);
  }
  return [...types].sort((a, b) => a.localeCompare(b));
}

function matches(entry: IndexedSpecies, criteria: SpeciesSearchCriteria): boolean {
  const name = criteria.name.trim().toLowerCase();
  if (name && !entry.lowerName.includes(name) && !entry.altName?.includes(name)) {
    return false;
  }

  // Type filter is OR within itself: any selected type qualifies.
  if (criteria.types.length > 0 && !entry.types.some(t => criteria.types.includes(t))) {
    return false;
  }

  const ability = criteria.ability.trim().toLowerCase();
  if (ability && !entry.lowerAbilities.some(a => a.includes(ability))) return false;

  return true;
}

/**
 * Search the legal roster.
 * Results are ranked by `sortStat` descending when set, otherwise by name.
 * Ties fall back to name so ordering is stable across renders.
 */
export function searchSpeciesAdvanced(
  criteria: SpeciesSearchCriteria,
): SpeciesSearchResult[] {
  const { sortStat } = criteria;

  const results: SpeciesSearchResult[] = getIndex()
    .filter(entry => matches(entry, criteria))
    .map(entry => ({
      name: entry.name,
      types: entry.types,
      abilities: entry.abilities,
      baseStats: entry.baseStats,
      baseStatTotal: entry.baseStatTotal,
      sortValue: sortStat ? entry.baseStats[sortStat] : entry.baseStatTotal,
    }));

  results.sort((a, b) => {
    if (sortStat) {
      const diff = b.sortValue - a.sortValue;
      if (diff !== 0) return diff;
    }
    return a.name.localeCompare(b.name);
  });

  return results;
}
