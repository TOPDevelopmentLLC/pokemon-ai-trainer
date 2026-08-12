import { MAX_STAT_POINTS_PER_STAT, MAX_STAT_POINTS_TOTAL, totalStatPoints } from '../../types';
import type { StatSpread } from '../../types';
import { StatSpreadGrid } from './StatSpreadGrid';

interface StatPointsSectionProps {
  spread: StatSpread;
  onChange: (stat: keyof StatSpread, value: number) => void;
}

/** The Champions stat-point spread, with a running total against the budget. */
export const StatPointsSection = ({ spread, onChange }: StatPointsSectionProps) => {
  const total = totalStatPoints(spread);
  const isOverBudget = total > MAX_STAT_POINTS_TOTAL;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <label style={labelStyle}>Stat Points</label>
        <span style={{ fontSize: '11px', color: isOverBudget ? '#ef4444' : '#64748b' }}>
          {total}/{MAX_STAT_POINTS_TOTAL}
        </span>
      </div>
      <StatSpreadGrid spread={spread} max={MAX_STAT_POINTS_PER_STAT} onChange={onChange} />
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
