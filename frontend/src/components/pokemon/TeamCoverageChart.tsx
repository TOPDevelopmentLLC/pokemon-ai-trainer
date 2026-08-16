import type { TypeCoverage, TeamCoverageResult } from '../../types/team-coverage';
import { TypeBadge } from '../common/TypeBadge';
import { CoverageWeakestSummary } from './CoverageWeakestSummary';

interface TeamCoverageChartProps {
  result: TeamCoverageResult;
}

/** Widest bar, as a percentage of each half of the track. */
const BAR_MAX_PERCENT = 100;

/** Color a bar by sign — green for net resistance, red for net weakness. */
function barColor(score: number): string {
  if (score > 0) return '#22c55e';
  if (score < 0) return '#ef4444';
  return '#475569';
}

/** Human-readable breakdown for the row's title tooltip. */
function describeBreakdown(entry: TypeCoverage): string {
  const parts: string[] = [];
  if (entry.doubleResistCount) parts.push(`${entry.doubleResistCount} x 0.25x`);
  if (entry.resistCount) parts.push(`${entry.resistCount} x 0.5x`);
  if (entry.neutralCount) parts.push(`${entry.neutralCount} x 1x`);
  if (entry.weakCount) parts.push(`${entry.weakCount} x 2x`);
  if (entry.doubleWeakCount) parts.push(`${entry.doubleWeakCount} x 4x`);
  if (entry.immuneCount) parts.push(`${entry.immuneCount} immune`);
  return parts.length ? parts.join(', ') : 'No team members';
}

interface CoverageRowProps {
  entry: TypeCoverage;
  scale: number;
}

const CoverageRow = ({ entry, scale }: CoverageRowProps) => {
  const magnitude = Math.abs(entry.score);
  const width = scale > 0 ? (magnitude / scale) * BAR_MAX_PERCENT : 0;
  const color = barColor(entry.score);

  return (
    <div
      title={`${entry.type}: ${describeBreakdown(entry)}`}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '28px' }}
    >
      {/* Type label + immunity marker */}
      <div style={{ width: '150px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <TypeBadge type={entry.type} />
        {entry.immuneCount > 0 && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#38bdf8',
              border: '1px solid #0369a1',
              borderRadius: '3px',
              padding: '1px 4px',
              whiteSpace: 'nowrap',
            }}
          >
            {entry.immuneCount} IMM
          </span>
        )}
      </div>

      {/* Diverging track: weakness extends left, resistance extends right */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {entry.score < 0 && (
            <div style={{ width: `${width}%`, height: '14px', backgroundColor: color, borderRadius: '2px 0 0 2px' }} />
          )}
        </div>

        <div style={{ width: '1px', height: '20px', backgroundColor: '#334155', flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          {entry.score > 0 && (
            <div style={{ width: `${width}%`, height: '14px', backgroundColor: color, borderRadius: '0 2px 2px 0' }} />
          )}
        </div>
      </div>

      {/* Score */}
      <div
        style={{
          width: '32px',
          flexShrink: 0,
          textAlign: 'right',
          fontSize: '13px',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: entry.score === 0 ? '#64748b' : color,
        }}
      >
        {entry.score > 0 ? `+${entry.score}` : entry.score}
      </div>
    </div>
  );
};

export const TeamCoverageChart = ({ result }: TeamCoverageChartProps) => {
  const { coverage, teamSize } = result;

  if (teamSize === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Add Pokemon to your team to see its type coverage.
        </p>
      </div>
    );
  }

  // Scale bars to the largest magnitude present so the chart always fills
  // its width, with a floor of 1 to avoid dividing by zero on a flat team.
  const scale = Math.max(1, ...coverage.map(c => Math.abs(c.score)));

  return (
    <div style={{ padding: '16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
          Team Type Coverage
        </h3>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {teamSize} Pokemon
        </span>
      </div>

      <p style={{ margin: '0 0 16px', fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
        Per Pokemon: +2 double resist, +1 resist, &minus;1 weak, &minus;2 double weak.
        Immunities score 0 and are labeled separately.
      </p>

      {/* Axis header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <div style={{ width: '150px', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <div style={{ flex: 1, textAlign: 'left' }}>Weak</div>
          <div style={{ flex: 1, textAlign: 'right' }}>Resist</div>
        </div>
        <div style={{ width: '32px', flexShrink: 0 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {coverage.map(entry => (
          <CoverageRow key={entry.type} entry={entry} scale={scale} />
        ))}
      </div>

      <CoverageWeakestSummary coverage={coverage} />
    </div>
  );
};
