import { useState } from 'react';
import { usePokemonSearch } from '../../hooks/usePokemonSearch';
import { gen9 } from '../../services/dex';
import { TypeBadge } from '../common/TypeBadge';
import { StatBar } from '../common/StatBar';
import { Sprites } from '@pkmn/img';

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
        <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '10px 14px',
              backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
              color: '#e2e8f0', fontSize: '14px', outline: 'none',
            }}
          />
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          {results.length === 0 && query.length >= 2 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              No Pokemon found
            </div>
          )}
          {query.length < 2 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              Type at least 2 characters to search
            </div>
          )}
          {results.map(name => {
            const species = gen9.species.get(name);
            if (!species) return null;
            const sprite = Sprites.getPokemon(name, { gen: 'ani' });

            return (
              <button
                key={name}
                onClick={() => onSelect(name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '8px 12px', border: 'none',
                  backgroundColor: 'transparent', borderRadius: '8px', cursor: 'pointer',
                  color: '#e2e8f0', textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e293b')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <img
                  src={sprite.url}
                  alt={name}
                  width={48}
                  height={48}
                  style={{ imageRendering: sprite.pixelated ? 'pixelated' : 'auto' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{name}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {species.types.map(t => <TypeBadge key={t} type={t} />)}
                  </div>
                </div>
                <div style={{ width: '120px' }}>
                  <StatBar label="HP" value={species.baseStats.hp} />
                  <StatBar label="Spe" value={species.baseStats.spe} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
