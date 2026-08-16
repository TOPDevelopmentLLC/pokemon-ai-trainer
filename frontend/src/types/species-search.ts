/**
 * Multi-dimensional species search.
 * Filters are combined with AND: a species must satisfy every active
 * criterion. An unset criterion is inactive and matches everything.
 */
import type { StatSpread } from './pokemon';

export interface SpeciesSearchCriteria {
  /** Substring match on the species name, case-insensitive. */
  name: string;
  /** Species matches if it has ANY of these types. Empty means any type. */
  types: string[];
  /** Substring match on any of the species' abilities. */
  ability: string;
  /** Stat to rank results by, highest first. Null sorts by name. */
  sortStat: keyof StatSpread | null;
}

export interface SpeciesSearchResult {
  name: string;
  types: string[];
  abilities: string[];
  baseStats: StatSpread;
  /** Sum of all six base stats. */
  baseStatTotal: number;
  /** Value of the stat being sorted by, or the BST when sorting by name. */
  sortValue: number;
}

export const EMPTY_CRITERIA: SpeciesSearchCriteria = {
  name: '',
  types: [],
  ability: '',
  sortStat: null,
};

/** Whether any criterion would narrow the full roster. */
export function hasActiveCriteria(criteria: SpeciesSearchCriteria): boolean {
  return (
    criteria.name.trim() !== '' || criteria.types.length > 0 || criteria.ability.trim() !== ''
  );
}
