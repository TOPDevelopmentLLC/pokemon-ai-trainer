import type { OhkoThreat } from '@app-types/threat-analysis';
import { getSpriteUrl } from '@services/dex';
import { TypeBadge } from '@components/common/TypeBadge';
import { SEVERITY_LABELS } from './severity-labels';

interface ThreatRowProps {
  threat: OhkoThreat;
  isExpanded: boolean;
  onToggle: () => void;
}

/** Format a stat-point spread as "32 ATK / 32 SPE", omitting unallocated stats. */
function formatSpread(evs: OhkoThreat['attackerSet']['evs']): string {
  return Object.entries(evs)
    .filter(([, value]) => value > 0)
    .map(([stat, value]) => `${value} ${stat.toUpperCase()}`)
    .join(' / ');
}

export const ThreatRow = ({ threat, isExpanded, onToggle }: ThreatRowProps) => {
  const severity = SEVERITY_LABELS[threat.severity];
  const spriteUrl = getSpriteUrl(threat.attackerSpecies);

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          padding: '8px 10px',
          border: 'none',
          backgroundColor: isExpanded ? '#1e293b' : 'transparent',
          borderRadius: '6px',
          cursor: 'pointer',
          color: '#e2e8f0',
          textAlign: 'left',
        }}
      >
        <img src={spriteUrl} alt={threat.attackerSpecies} width={32} height={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>{threat.attackerSpecies}</span>
            <TypeBadge type={threat.moveType} />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{threat.move}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: severity.color }}>
            {threat.damageRange.min.toFixed(1)}&ndash;{threat.damageRange.max.toFixed(1)}%
          </div>
          <div style={{ fontSize: '10px', color: severity.color, fontWeight: 600 }}>
            {severity.label}
            {/* A guaranteed OHKO needs no percentage; a chance-based one does. */}
            {threat.severity === 'ohko' &&
              threat.ohkoChance < 1 &&
              ` (${(threat.ohkoChance * 100).toFixed(0)}%)`}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div
          style={{
            padding: '10px 10px 10px 52px',
            fontSize: '12px',
            color: '#94a3b8',
            backgroundColor: '#0f172a',
            borderRadius: '0 0 6px 6px',
          }}
        >
          <div style={{ marginBottom: '4px' }}>
            <strong>Set:</strong> {threat.attackerSet.nature} | {threat.attackerSet.ability}
            {threat.attackerSet.item && ` @ ${threat.attackerSet.item}`}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Stat Points:</strong> {formatSpread(threat.attackerSet.evs)}
          </div>
          <div style={{ fontStyle: 'italic', color: '#64748b', marginTop: '6px' }}>
            {threat.description}
          </div>
        </div>
      )}
    </div>
  );
};
