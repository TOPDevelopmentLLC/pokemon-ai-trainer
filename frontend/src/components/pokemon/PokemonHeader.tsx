import { getSpecies, getSpriteUrl } from '@services/dex';
import { TypeBadge } from '@components/common/TypeBadge';

interface PokemonHeaderProps {
  species: string;
}

/** Sprite, name, and typing for a single Pokemon. */
export const PokemonHeader = ({ species }: PokemonHeaderProps) => {
  const data = getSpecies(species);
  const spriteUrl = getSpriteUrl(species);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <img src={spriteUrl} alt={species} width={80} height={80} />
      <div>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#e2e8f0' }}>{species}</h2>
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
          {data?.types.map(type => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
};
