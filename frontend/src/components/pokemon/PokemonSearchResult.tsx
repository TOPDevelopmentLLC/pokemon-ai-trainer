import { getSpecies, getTopBaseStats } from '@services/dex';
import { TypeBadge } from '@components/common/TypeBadge';
import { StatBar } from '@components/common/StatBar';
import { Sprites } from '@pkmn/img';

interface PokemonSearchResultProps {
  species: string;
  onSelect: () => void;
}

/** One selectable search hit: sprite, name, typing, and its two best stats. */
export const PokemonSearchResult = ({ species, onSelect }: PokemonSearchResultProps) => {
  const data = getSpecies(species);
  if (!data) return null;

  const sprite = Sprites.getPokemon(species, { gen: 'ani' });

  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '8px 12px',
        border: 'none',
        backgroundColor: 'transparent',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#e2e8f0',
        textAlign: 'left',
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1e293b')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <img
        src={sprite.url}
        alt={species}
        width={48}
        height={48}
        style={{ imageRendering: sprite.pixelated ? 'pixelated' : 'auto' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{species}</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {data.types.map(type => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
      <div style={{ width: '120px' }}>
        {getTopBaseStats(species).map(stat => (
          <StatBar key={stat.key} label={stat.label} value={stat.value} />
        ))}
      </div>
    </button>
  );
};
