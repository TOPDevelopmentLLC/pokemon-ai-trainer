import { STAT_LABELS } from '@app-types';
import type { StatSpread } from '@app-types';
import type { SpeciesSearchResult } from '@app-types/species-search';
import { TypeBadge } from '@components/common/TypeBadge';
import { Sprites } from '@pkmn/img';

interface SpeciesSearchRowProps {
  result: SpeciesSearchResult;
  /** Stat the list is ranked by; highlighted so the ordering is legible. */
  sortStat: keyof StatSpread | null;
  onAdd: () => void;
  /** Disabled when the team is full. */
  canAdd: boolean;
}

export const SpeciesSearchRow = ({ result, sortStat, onAdd, canAdd }: SpeciesSearchRowProps) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
      }}
    >
      <img
        src={Sprites.getPokemon(result.name, { gen: 'ani' }).url}
        alt={result.name}
        width={48}
        height={48}
      />

      <div style={{ width: '190px', flexShrink: 0, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '3px' }}>{result.name}</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {result.types.map(type => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </div>

      {/* Base stats, with the ranked stat called out */}
      <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: 0 }}>
        {STAT_LABELS.map(({ key, label }) => {
          const isSorted = sortStat === key;
          return (
            <div key={key} style={{ textAlign: 'center', minWidth: '30px' }}>
              <div
                style={{
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  color: isSorted ? '#38bdf8' : '#475569',
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: isSorted ? 700 : 500,
                  color: isSorted ? '#38bdf8' : '#94a3b8',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {result.baseStats[key]}
              </div>
            </div>
          );
        })}
        <div style={{ textAlign: 'center', minWidth: '38px' }}>
          <div
            style={{
              fontSize: '9px',
              textTransform: 'uppercase',
              color: '#475569',
              fontWeight: 600,
            }}
          >
            BST
          </div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#e2e8f0',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {result.baseStatTotal}
          </div>
        </div>
      </div>

      <div
        style={{
          width: '120px',
          flexShrink: 0,
          fontSize: '10px',
          color: '#64748b',
          lineHeight: 1.4,
        }}
        title={result.abilities.join(', ')}
      >
        {result.abilities.join(', ')}
      </div>

      <button
        onClick={onAdd}
        disabled={!canAdd}
        title={canAdd ? `Add ${result.name} to your team` : 'Your team is full'}
        style={{
          padding: '6px 12px',
          flexShrink: 0,
          backgroundColor: canAdd ? '#0369a1' : 'transparent',
          border: `1px solid ${canAdd ? '#0284c7' : '#334155'}`,
          borderRadius: '6px',
          color: canAdd ? '#e0f2fe' : '#475569',
          fontSize: '12px',
          fontWeight: 600,
          cursor: canAdd ? 'pointer' : 'not-allowed',
        }}
      >
        Add
      </button>
    </div>
  );
};
