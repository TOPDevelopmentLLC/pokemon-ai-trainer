import { useState } from 'react';
import type { OhkoThreat } from '../../types/threat-analysis';
import { TypeBadge } from '../common/TypeBadge';
import { SEVERITY_LABELS } from './severity-labels';
import { ThreatSeverityFilter, type ThreatFilter } from './ThreatSeverityFilter';
import { Sprites } from '@pkmn/img';

interface OhkoThreatsSectionProps {
  threats: OhkoThreat[];
}

export const OhkoThreatsSection = ({ threats }: OhkoThreatsSectionProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ThreatFilter>('all');

  const filtered = filter === 'all' ? threats : threats.filter(t => t.severity === filter);

  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
          Damage Threats ({threats.length})
        </h3>
        <ThreatSeverityFilter value={filter} onChange={setFilter} />
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
          {threats.length === 0 ? 'No significant threats found from common competitive sets.' : 'No threats match this filter.'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {filtered.map(threat => {
          const isExpanded = expandedId === threat.id;
          const sev = SEVERITY_LABELS[threat.severity];
          const sprite = Sprites.getPokemon(threat.attackerSpecies, { gen: 'ani' });

          return (
            <div key={threat.id}>
              <button
                onClick={() => setExpandedId(isExpanded ? null : threat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '8px 10px', border: 'none',
                  backgroundColor: isExpanded ? '#1e293b' : 'transparent',
                  borderRadius: '6px', cursor: 'pointer', color: '#e2e8f0', textAlign: 'left',
                }}
              >
                <img src={sprite.url} alt={threat.attackerSpecies} width={32} height={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{threat.attackerSpecies}</span>
                    <TypeBadge type={threat.moveType} />
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{threat.move}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: sev.color }}>
                    {threat.damageRange.min.toFixed(1)}–{threat.damageRange.max.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '10px', color: sev.color, fontWeight: 600 }}>
                    {sev.label}
                    {threat.severity === 'ohko' && threat.ohkoChance < 1 &&
                      ` (${(threat.ohkoChance * 100).toFixed(0)}%)`
                    }
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div style={{
                  padding: '10px 10px 10px 52px',
                  fontSize: '12px', color: '#94a3b8',
                  backgroundColor: '#0f172a', borderRadius: '0 0 6px 6px',
                }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Set:</strong> {threat.attackerSet.nature} | {threat.attackerSet.ability}
                    {threat.attackerSet.item && ` @ ${threat.attackerSet.item}`}
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Stat Points:</strong>{' '}
                    {Object.entries(threat.attackerSet.evs)
                      .filter(([, v]) => v > 0)
                      .map(([k, v]) => `${v} ${k.toUpperCase()}`)
                      .join(' / ')}
                  </div>
                  <div style={{ fontStyle: 'italic', color: '#64748b', marginTop: '6px' }}>
                    {threat.description}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
