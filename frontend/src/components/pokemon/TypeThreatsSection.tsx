import type { TypeVulnerabilityProfile, TypeThreat } from '@app-types/threat-analysis';
import { TypeBadge } from '@components/common/TypeBadge';

interface TypeThreatsSectionProps {
  profile: TypeVulnerabilityProfile;
  threats: TypeThreat[];
}

export const TypeThreatsSection = ({ profile, threats }: TypeThreatsSectionProps) => {
  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
        Type Matchups
      </h3>

      {/* Weaknesses */}
      {threats.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
            Weak To
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {threats.map(t => (
              <TypeBadge key={t.type} type={t.type} multiplier={t.multiplier} />
            ))}
          </div>
        </div>
      )}

      {/* Resistances */}
      {(profile.resistances.length > 0 || profile.doubleResistances.length > 0) && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
            Resists
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {profile.doubleResistances.map(t => (
              <TypeBadge key={t} type={t} multiplier={0.25} />
            ))}
            {profile.resistances.map(t => (
              <TypeBadge key={t} type={t} multiplier={0.5} />
            ))}
          </div>
        </div>
      )}

      {/* Immunities */}
      {profile.immunities.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
            Immune To
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {profile.immunities.map(t => (
              <TypeBadge key={t} type={t} multiplier={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
