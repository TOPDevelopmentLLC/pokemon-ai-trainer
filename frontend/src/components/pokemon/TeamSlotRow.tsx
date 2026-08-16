import type { TeamSlot } from '../../types';
import { getSpecies } from '../../services/dex';
import { TypeBadge } from '../common/TypeBadge';
import { Sprites } from '@pkmn/img';

interface TeamSlotRowProps {
  slot: TeamSlot | null;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

/** One team slot: either a Pokemon that can be selected and removed, or a placeholder. */
export const TeamSlotRow = ({ slot, isSelected, onSelect, onRemove }: TeamSlotRowProps) => {
  const species = slot ? getSpecies(slot.config.species) : null;

  return (
    <div
      onClick={slot ? onSelect : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        marginBottom: '4px',
        borderRadius: '8px',
        backgroundColor: isSelected ? '#1e293b' : 'transparent',
        border: `1px solid ${isSelected ? '#334155' : 'transparent'}`,
        cursor: slot ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
      }}
    >
      {slot ? (
        <>
          <img
            src={Sprites.getPokemon(slot.config.species, { gen: 'ani' }).url}
            alt={slot.config.species}
            width={40}
            height={40}
            style={{ imageRendering: 'auto' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#e2e8f0',
                marginBottom: '2px',
              }}
            >
              {slot.config.species}
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {species?.types.map(type => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
          </div>
          <button
            onClick={e => {
              // Without this the row's own click handler also fires and selects
              // the slot being removed.
              e.stopPropagation();
              onRemove();
            }}
            title="Remove"
            aria-label={`Remove ${slot.config.species}`}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '16px',
              padding: '4px',
            }}
          >
            &#x2715;
          </button>
        </>
      ) : (
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            color: '#475569',
            fontSize: '13px',
            padding: '6px 0',
          }}
        >
          Empty Slot
        </div>
      )}
    </div>
  );
};
