import { STAT_LABELS } from '@app-types';
import type { StatSpread } from '@app-types';

interface StatSpreadGridProps {
  spread: StatSpread;
  max: number;
  onChange: (stat: keyof StatSpread, value: number) => void;
}

/** Six numeric inputs, one per stat, in canonical order. */
export const StatSpreadGrid = ({ spread, max, onChange }: StatSpreadGridProps) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
      {STAT_LABELS.map(({ key, label }) => (
        <div key={key}>
          <div
            style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginBottom: '2px' }}
          >
            {label}
          </div>
          <input
            type="number"
            aria-label={label}
            min={0}
            max={max}
            value={spread[key]}
            onChange={e => onChange(key, parseInt(e.target.value) || 0)}
            style={inputStyle}
          />
        </div>
      ))}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px',
  textAlign: 'center',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '13px',
  // Without this the padding pushes each input past its grid column.
  boxSizing: 'border-box',
};
