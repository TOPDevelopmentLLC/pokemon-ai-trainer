import { getSpecies } from '../../services/dex';
import { STAT_LABELS } from '../../types';
import { StatBar } from '../common/StatBar';

interface BaseStatsPanelProps {
  species: string;
}

/** A species' base stat spread with its base stat total. */
export const BaseStatsPanel = ({ species }: BaseStatsPanelProps) => {
  const data = getSpecies(species);
  if (!data) return null;

  const { baseStats } = data;
  const total = STAT_LABELS.reduce((sum, { key }) => sum + baseStats[key], 0);

  return (
    <div style={{ marginBottom: '16px' }}>
      <h4
        style={{
          margin: '0 0 6px',
          fontSize: '12px',
          color: '#64748b',
          textTransform: 'uppercase',
        }}
      >
        Base Stats (BST: {total})
      </h4>
      {STAT_LABELS.map(({ key, label }) => (
        <StatBar key={key} label={label} value={baseStats[key]} />
      ))}
    </div>
  );
};
