import type { TeamSlot } from '@app-types';
import { getSpecies } from '@services/dex';
import { TypeBadge } from '@components/common/TypeBadge';
import { Sprites } from '@pkmn/img';

interface TeamRosterPreviewProps {
  /** Filled slots only; empty slots are not shown. */
  members: TeamSlot[];
}

/** Compact sprite-and-typing strip summarizing a team's members. */
export const TeamRosterPreview = ({ members }: TeamRosterPreviewProps) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        minHeight: '44px',
        flexWrap: 'wrap',
      }}
    >
      {members.length === 0 && (
        <span style={{ fontSize: '12px', color: '#475569', alignSelf: 'center' }}>Empty team</span>
      )}
      {members.map(slot => {
        const species = getSpecies(slot.config.species);

        return (
          <div
            key={slot.id}
            title={slot.config.species}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '52px',
            }}
          >
            <img
              src={Sprites.getPokemon(slot.config.species, { gen: 'ani' }).url}
              alt={slot.config.species}
              width={40}
              height={40}
            />
            <div
              style={{
                display: 'flex',
                gap: '2px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {species?.types.map(type => (
                <span key={type} style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
                  <TypeBadge type={type} />
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
