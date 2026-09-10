import type { OhkoThreat } from '@app-types/threat-analysis';
import { getSpeciesTypes, getSpriteUrl } from '@services/dex';
import { TypeBadge } from '@components/common/TypeBadge';
import { SEVERITY_LABELS } from './severity-labels';
import { ThreatMoveRow } from './ThreatMoveRow';

interface ThreatRowProps {
  threat: OhkoThreat;
  isExpanded: boolean;
  onToggle: () => void;
}

/** Format a stat-point spread as "32 ATK / 32 SPE", omitting unallocated stats. */
function formatSpread(statPoints: OhkoThreat['attackerSet']['statPoints']): string {
  return Object.entries(statPoints)
    .filter(([, value]) => value > 0)
    .map(([stat, value]) => `${value} ${stat.toUpperCase()}`)
    .join(' / ');
}

/**
 * One threatening Pokemon. Collapsed it shows only who the threat is and its
 * worst case; opening it reveals each dangerous move and the damage it deals.
 */
export const ThreatRow = ({ threat, isExpanded, onToggle }: ThreatRowProps) => {
  const severity = SEVERITY_LABELS[threat.severity];
  const spriteUrl = getSpriteUrl(threat.attackerSpecies);
  const types = getSpeciesTypes(threat.attackerSpecies);
  const moveCount = threat.moves.length;

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
          borderRadius: isExpanded ? '6px 6px 0 0' : '6px',
          cursor: 'pointer',
          color: '#e2e8f0',
          textAlign: 'left',
        }}
      >
        <img src={spriteUrl} alt={threat.attackerSpecies} width={32} height={32} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>{threat.attackerSpecies}</span>
            {types.map(type => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {moveCount} dangerous {moveCount === 1 ? 'move' : 'moves'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: severity.color }}>
            {threat.damageRange.min.toFixed(1)}&ndash;{threat.damageRange.max.toFixed(1)}%
          </div>
          <div style={{ fontSize: '10px', color: severity.color, fontWeight: 600 }}>
            {severity.label}
          </div>
        </div>

        <span
          aria-hidden="true"
          style={{ color: '#64748b', fontSize: '10px', width: '12px', flexShrink: 0 }}
        >
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div
          style={{
            padding: '8px 10px 10px 52px',
            fontSize: '12px',
            color: '#94a3b8',
            backgroundColor: '#0f172a',
            borderRadius: '0 0 6px 6px',
          }}
        >
          <div style={{ marginBottom: '6px' }}>
            <strong>Set:</strong> {threat.attackerSet.nature} | {threat.attackerSet.ability}
            {threat.attackerSet.item && ` @ ${threat.attackerSet.item}`}
            {' · '}
            <strong>Stat Points:</strong> {formatSpread(threat.attackerSet.statPoints)}
          </div>

          {threat.moves.map(threatMove => (
            <ThreatMoveRow key={threatMove.id} threatMove={threatMove} />
          ))}
        </div>
      )}
    </div>
  );
};
