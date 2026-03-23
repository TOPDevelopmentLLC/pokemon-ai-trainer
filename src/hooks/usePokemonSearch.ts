import { useState, useEffect } from 'react';
import { searchSpecies } from '../services/dex';

export function usePokemonSearch(query: string) {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      setResults(searchSpecies(query, 10));
    }, 150); // debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  return results;
}
