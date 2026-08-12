import { useState } from 'react';
import { useTeam } from '../../hooks/useTeam';
import { PokemonSearchModal } from './PokemonSearchModal';
import { gen9 } from '../../services/dex';
import { TypeBadge } from '../common/TypeBadge';
import { Sprites } from '@pkmn/img';

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
          <div
            key={index}
            onClick={() => slot ? selectSlot(index) : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', marginBottom: '4px', borderRadius: '8px',
              backgroundColor: selectedSlotIndex === index ? '#1e293b' : 'transparent',
              border: selectedSlotIndex === index ? '1px solid #334155' : '1px solid transparent',
              cursor: slot ? 'pointer' : 'default',
              transition: 'all 0.15s ease',
            }}
          >
            {slot ? (
              <>
                <img
                  src={Sprites.getPokemon(slot.config.species, { gen: 'ani' }).url}
                  alt={slot.config.species}
                  width={40} height={40}
                  style={{ imageRendering: 'auto' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#e2e8f0', marginBottom: '2px' }}>
                    {slot.config.species}
                  </div>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {gen9.species.get(slot.config.species)?.types.map(t => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); removePokemon(index); }}
                  title="Remove"
                  style={{
                    border: 'none', background: 'none', cursor: 'pointer',
                    color: '#64748b', fontSize: '16px', padding: '4px',
                  }}
                >
                  ✕
                </button>
              </>
            ) : (
              <div style={{
                width: '100%', textAlign: 'center', color: '#475569',
                fontSize: '13px', padding: '6px 0',
              }}>
                Empty Slot
              </div>
            )}
          </div>
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
