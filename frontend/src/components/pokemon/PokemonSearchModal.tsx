import { useState } from 'react';
import { usePokemonSearch } from '@hooks/usePokemonSearch';
import { SearchInput } from './SearchInput';
import { PokemonSearchResult } from './PokemonSearchResult';
import { SearchEmptyState } from './SearchEmptyState';

interface PokemonSearchModalProps {
  onSelect: (species: string) => void;
  onClose: () => void;
}

export const PokemonSearchModal = ({ onSelect, onClose }: PokemonSearchModalProps) => {
  const [query, setQuery] = useState('');
  const results = usePokemonSearch(query);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        width: '480px', maxHeight: '80vh',
        backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>
        <SearchInput value={query} onChange={setQuery} autoFocus />
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          <SearchEmptyState query={query} resultCount={results.length} />
          {results.map(name => (
            <PokemonSearchResult key={name} species={name} onSelect={() => onSelect(name)} />
          ))}
        </div>
      </div>
    </div>
  );
};
