import { useEffect, useMemo, useRef } from 'react';
import type { PokemonConfig, StatSpread } from '../../types';
import {
  MAX_STAT_POINTS_PER_STAT,
  MAX_STAT_POINTS_TOTAL,
  MAX_IV,
  totalStatPoints,
} from '../../types';
import { getSpeciesAbilities, getAllNatures, getAllItems } from '../../services/dex';
import { LabeledSelect } from '../common/LabeledSelect';
import { PokemonHeader } from './PokemonHeader';
import { BaseStatsPanel } from './BaseStatsPanel';
import { StatPointsSection } from './StatPointsSection';
import { StatSpreadGrid } from './StatSpreadGrid';

interface PokemonConfigPanelProps {
  config: PokemonConfig;
  onChange: (config: PokemonConfig) => void;
}

export const PokemonConfigPanel = ({ config, onChange }: PokemonConfigPanelProps) => {
  const natures = getAllNatures();
  const items = getAllItems();

  // Abilities are a pure function of species — derive rather than store.
  const abilities = useMemo(() => getSpeciesAbilities(config.species), [config.species]);

  // Keep the latest config/onChange reachable without making the auto-select
  // effect re-run on every parent render. Written in an effect, since refs
  // must not be mutated during render.
  const latest = useRef({ config, onChange });
  useEffect(() => {
    latest.current = { config, onChange };
  });

  // Auto-select the first ability when a species has none chosen yet.
  useEffect(() => {
    const { config: current, onChange: notify } = latest.current;
    if (!current.ability && abilities.length > 0) {
      notify({ ...current, ability: abilities[0] });
    }
  }, [abilities]);

  const totalPoints = totalStatPoints(config.evs);

  const updateEv = (stat: keyof StatSpread, value: number) => {
    // Clamp to whatever the budget still allows rather than rejecting the edit,
    // so dragging a stat up stops at the limit instead of doing nothing.
    const spentElsewhere = totalPoints - config.evs[stat];
    const budgetLeft = MAX_STAT_POINTS_TOTAL - spentElsewhere;
    const clamped = Math.max(0, Math.min(MAX_STAT_POINTS_PER_STAT, budgetLeft, value));

    onChange({ ...config, evs: { ...config.evs, [stat]: clamped } });
  };

  const updateIv = (stat: keyof StatSpread, value: number) => {
    const clamped = Math.max(0, Math.min(MAX_IV, value));
    onChange({ ...config, ivs: { ...config.ivs, [stat]: clamped } });
  };

  return (
    <div style={{
      padding: '20px',
      borderBottom: '1px solid #1e293b',
      backgroundColor: '#0f172a',
    }}>
      <PokemonHeader species={config.species} />

      <BaseStatsPanel species={config.species} />

      {/* Nature / Ability / Item selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <LabeledSelect
          label="Nature"
          value={config.nature}
          options={natures}
          onChange={nature => onChange({ ...config, nature })}
        />
        <LabeledSelect
          label="Ability"
          value={config.ability}
          options={abilities}
          onChange={ability => onChange({ ...config, ability })}
        />
        <LabeledSelect
          label="Item"
          value={config.item}
          options={items}
          onChange={item => onChange({ ...config, item })}
          emptyOption="None"
        />
      </div>

      <StatPointsSection spread={config.evs} onChange={updateEv} />

      {/* IV Spread */}
      <div>
        <label style={labelStyle}>IVs</label>
        <div style={{ marginTop: '4px' }}>
          <StatSpreadGrid spread={config.ivs} max={MAX_IV} onChange={updateIv} />
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

