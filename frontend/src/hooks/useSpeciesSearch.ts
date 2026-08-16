import { useMemo, useState } from 'react';
import { searchSpeciesAdvanced } from '@services/species-search';
import { EMPTY_CRITERIA } from '@app-types/species-search';
import type { SpeciesSearchCriteria, SpeciesSearchResult } from '@app-types/species-search';

interface UseSpeciesSearchReturn {
  criteria: SpeciesSearchCriteria;
  results: SpeciesSearchResult[];
  setName: (name: string) => void;
  setAbility: (ability: string) => void;
  setSortStat: (stat: SpeciesSearchCriteria['sortStat']) => void;
  toggleType: (type: string) => void;
  reset: () => void;
}

/** Search criteria state plus the matching results. */
export function useSpeciesSearch(): UseSpeciesSearchReturn {
  const [criteria, setCriteria] = useState<SpeciesSearchCriteria>(EMPTY_CRITERIA);

  // Scanning the whole roster on every render would be wasteful; the criteria
  // fields are all primitives or a short string array, so a serialized key is
  // a cheap and accurate dependency.
  const criteriaKey = JSON.stringify(criteria);

  const results = useMemo(
    () => searchSpeciesAdvanced(criteria),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [criteriaKey],
  );

  return {
    criteria,
    results,
    setName: name => setCriteria(prev => ({ ...prev, name })),
    setAbility: ability => setCriteria(prev => ({ ...prev, ability })),
    setSortStat: sortStat => setCriteria(prev => ({ ...prev, sortStat })),
    toggleType: type =>
      setCriteria(prev => ({
        ...prev,
        types: prev.types.includes(type)
          ? prev.types.filter(t => t !== type)
          : [...prev.types, type],
      })),
    reset: () => setCriteria(EMPTY_CRITERIA),
  };
}
