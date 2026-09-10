import type { ThreatMove } from '@app-types/threat-analysis';
import { TypeBadge } from '@components/common/TypeBadge';
import { SEVERITY_LABELS } from './severity-labels';

interface ThreatMoveRowProps {
  threatMove: ThreatMove;
}

/** One dangerous move: its typing, what it does, and the calc behind it. */
export const ThreatMoveRow = ({ threatMove }: ThreatMoveRowProps) => {
  const severity = SEVERITY_LABELS[threatMove.severity];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '6px 0',
        borderTop: '1px solid #1e293b',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '190px', flexShrink: 0 }}>
        <TypeBadge type={threatMove.moveType} />
        <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>
          {threatMove.move}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: severity.color,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {threatMove.damageRange.min.toFixed(1)}&ndash;{threatMove.damageRange.max.toFixed(1)}%
          </span>
          <span style={{ fontSize: '10px', color: severity.color, fontWeight: 600 }}>
            {severity.label}
            {/* A guaranteed OHKO needs no percentage; a chance-based one does. */}
            {threatMove.severity === 'ohko' &&
              threatMove.ohkoChance < 1 &&
              ` (${(threatMove.ohkoChance * 100).toFixed(0)}%)`}
          </span>
        </div>
        <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#64748b', marginTop: '2px' }}>
          {threatMove.description}
        </div>
      </div>
    </div>
  );
};
