import { useState } from 'react';
import type { OhkoThreat } from '../../types/threat-analysis';
import { ThreatRow } from './ThreatRow';

interface ThreatListProps {
  threats: OhkoThreat[];
}

/**
 * The expandable threat list. Expansion is list state rather than row state
 * so opening one row collapses the others.
 */
export const ThreatList = ({ threats }: ThreatListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {threats.map(threat => (
        <ThreatRow
          key={threat.id}
          threat={threat}
          isExpanded={expandedId === threat.id}
          onToggle={() => setExpandedId(expandedId === threat.id ? null : threat.id)}
        />
      ))}
    </div>
  );
};
