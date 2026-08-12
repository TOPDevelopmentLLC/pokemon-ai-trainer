import { useState } from 'react';
import type { OhkoThreat } from '../../types/threat-analysis';
import { ThreatSeverityFilter, type ThreatFilter } from './ThreatSeverityFilter';
import { ThreatsEmptyState } from './ThreatsEmptyState';
import { ThreatList } from './ThreatList';

interface OhkoThreatsSectionProps {
  threats: OhkoThreat[];
}

export const OhkoThreatsSection = ({ threats }: OhkoThreatsSectionProps) => {
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

      {filtered.length === 0 && <ThreatsEmptyState totalCount={threats.length} />}

      <ThreatList threats={filtered} />
    </div>
  );
};
