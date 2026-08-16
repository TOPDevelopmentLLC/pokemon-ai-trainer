import { useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import { PokemonSearchModal } from './PokemonSearchModal';
import { TeamSlotRow } from './TeamSlotRow';

export const TeamPanel = () => {
  const { team, selectedSlotIndex, addPokemon, removePokemon, selectSlot } = useTeam();
  const [showSearch, setShowSearch] = useState(false);

  const hasEmptySlot = team.some(s => s === null);

  return (
    <div style={{
      width: '300px', minWidth: '300px',
      backgroundColor: '#0f172a', borderRight: '1px solid #1e293b',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{
        padding: '16px', borderBottom: '1px solid #1e293b',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>
          Your Team
        </h2>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {team.filter(Boolean).length}/6
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {team.map((slot, index) => (
          <TeamSlotRow
            key={index}
            slot={slot}
            isSelected={selectedSlotIndex === index}
            onSelect={() => selectSlot(index)}
            onRemove={() => removePokemon(index)}
          />
        ))}
      </div>

      {hasEmptySlot && (
        <div style={{ padding: '12px', borderTop: '1px solid #1e293b' }}>
          <button
            onClick={() => setShowSearch(true)}
            style={{
              width: '100%', padding: '10px',
              backgroundColor: '#3b82f6', color: '#fff', border: 'none',
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
            }}
          >
            + Add Pokemon
          </button>
        </div>
      )}

      {showSearch && (
        <PokemonSearchModal
          onSelect={species => { addPokemon(species); setShowSearch(false); }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};
