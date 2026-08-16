import type { TypeCoverage } from '../../types/team-coverage';
import { TypeBadge } from '../common/TypeBadge';

/** How many of the softest matchups to list. */
const MAX_LISTED = 5;

interface CoverageWeakestSummaryProps {
  coverage: TypeCoverage[];
}

/** Footer calling out the types the team defends worst. */
export const CoverageWeakestSummary = ({ coverage }: CoverageWeakestSummaryProps) => {
  const worst = coverage
    .filter(entry => entry.score < 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_LISTED);

  if (worst.length === 0) return null;

  return (
    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
      <div
        style={{
          fontSize: '11px',
          color: '#ef4444',
          fontWeight: 600,
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        Weakest Coverage
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {worst.map(entry => (
          <span key={entry.type} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <TypeBadge type={entry.type} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>
              {entry.score}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
