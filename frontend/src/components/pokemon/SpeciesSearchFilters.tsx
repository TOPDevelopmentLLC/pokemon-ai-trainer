import { STAT_LABELS } from '@app-types';
import type { SpeciesSearchCriteria } from '@app-types/species-search';
import { hasActiveCriteria } from '@app-types/species-search';
import { getAvailableTypes } from '@services/species-search';
import { TypeBadge } from '@components/common/TypeBadge';

const AVAILABLE_TYPES = getAvailableTypes();

interface SpeciesSearchFiltersProps {
  criteria: SpeciesSearchCriteria;
  resultCount: number;
  onNameChange: (name: string) => void;
  onAbilityChange: (ability: string) => void;
  onSortStatChange: (stat: SpeciesSearchCriteria['sortStat']) => void;
  onToggleType: (type: string) => void;
  onReset: () => void;
}

export const SpeciesSearchFilters = ({
  criteria,
  resultCount,
  onNameChange,
  onAbilityChange,
  onSortStatChange,
  onToggleType,
  onReset,
}: SpeciesSearchFiltersProps) => {
  const isFiltered = hasActiveCriteria(criteria);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Text filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px' }}>
        <div>
          <label style={labelStyle} htmlFor="search-name">
            Name
          </label>
          <input
            id="search-name"
            type="text"
            placeholder="e.g. garchomp, mega charizard"
            value={criteria.name}
            onChange={e => onNameChange(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="search-ability">
            Ability
          </label>
          <input
            id="search-ability"
            type="text"
            placeholder="e.g. levitate"
            value={criteria.ability}
            onChange={e => onAbilityChange(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="search-sort">
            Sort by
          </label>
          <select
            id="search-sort"
            value={criteria.sortStat ?? ''}
            onChange={e =>
              onSortStatChange(
                (e.target.value || null) as SpeciesSearchCriteria['sortStat'],
              )
            }
            style={{ ...inputStyle, minWidth: '130px' }}
          >
            <option value="">Name (A-Z)</option>
            {STAT_LABELS.map(({ key, label }) => (
              <option key={key} value={key}>
                Highest {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Type toggles */}
      <div>
        <label style={labelStyle}>Types {criteria.types.length > 0 && `(${criteria.types.length})`}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {AVAILABLE_TYPES.map(type => {
            const isOn = criteria.types.includes(type);
            return (
              <button
                key={type}
                onClick={() => onToggleType(type)}
                aria-pressed={isOn}
                title={isOn ? `Remove ${type} filter` : `Filter to ${type}`}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  // Unselected types dim so the active ones read at a glance.
                  opacity: criteria.types.length === 0 || isOn ? 1 : 0.35,
                  outline: isOn ? '2px solid #38bdf8' : 'none',
                  outlineOffset: '1px',
                  borderRadius: '4px',
                }}
              >
                <TypeBadge type={type} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count + reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {resultCount} Pokemon{isFiltered ? ' matched' : ' in the roster'}
        </span>
        {isFiltered && (
          <button onClick={onReset} style={resetButtonStyle}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

const resetButtonStyle: React.CSSProperties = {
  padding: '3px 10px',
  backgroundColor: 'transparent',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
};
