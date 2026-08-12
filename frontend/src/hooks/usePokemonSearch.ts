import { useState, useEffect, useMemo } from 'react';
import { searchSpecies } from '../services/dex';

const DEBOUNCE_MS = 150;
const MIN_QUERY_LENGTH = 2;

/**
 * Debounced species search.
 * The effect only syncs the debounced query; results are derived from it
 * during render, so a cleared query updates without an extra render pass.
 */
export function usePokemonSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    if (query === debouncedQuery) return;

    const timeoutId = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [query, debouncedQuery]);

  return useMemo(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) return [];
    return searchSpecies(debouncedQuery, 10);
  }, [debouncedQuery]);
}
