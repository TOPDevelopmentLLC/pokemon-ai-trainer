import { SEVERITY_LABELS } from './severity-labels';

/** Severity values the filter offers, in display order. */
const FILTER_OPTIONS = ['all', 'ohko', 'near_ohko', 'two_hko'] as const;

export type ThreatFilter = (typeof FILTER_OPTIONS)[number];

interface ThreatSeverityFilterProps {
  value: string;
  onChange: (filter: ThreatFilter) => void;
}

export const ThreatSeverityFilter = ({ value, onChange }: ThreatSeverityFilterProps) => {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {FILTER_OPTIONS.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          style={{
            padding: '3px 8px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: value === option ? '#334155' : 'transparent',
            color: value === option ? '#e2e8f0' : '#64748b',
            fontSize: '11px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {option === 'all' ? 'All' : SEVERITY_LABELS[option]?.label}
        </button>
      ))}
    </div>
  );
};
