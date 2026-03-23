import { useState, useEffect } from 'react';
import type { PokemonConfig, StatSpread } from '../../types';
import { MAX_EV_PER_STAT, MAX_EV_TOTAL, MAX_IV } from '../../types';
import { getSpeciesAbilities, getAllNatures, getAllItems } from '../../services/dex';
import { gen9 } from '../../services/dex';
import { TypeBadge } from '../common/TypeBadge';
import { StatBar } from '../common/StatBar';
import { Sprites } from '@pkmn/img';

interface PokemonConfigPanelProps {
  config: PokemonConfig;
  onChange: (config: PokemonConfig) => void;
}

const STAT_LABELS: { key: keyof StatSpread; label: string }[] = [
  { key: 'hp', label: 'HP' },
  { key: 'atk', label: 'Atk' },
  { key: 'def', label: 'Def' },
  { key: 'spa', label: 'SpA' },
  { key: 'spd', label: 'SpD' },
  { key: 'spe', label: 'Spe' },
];

export const PokemonConfigPanel = ({ config, onChange }: PokemonConfigPanelProps) => {
  const [abilities, setAbilities] = useState<string[]>([]);
  const species = gen9.species.get(config.species);
  const sprite = Sprites.getPokemon(config.species, { gen: 'ani' });
  const natures = getAllNatures();
  const items = getAllItems();

  useEffect(() => {
    const abs = getSpeciesAbilities(config.species);
    setAbilities(abs);
    // Auto-set first ability if none selected
    if (!config.ability && abs.length > 0) {
      onChange({ ...config, ability: abs[0] });
    }
  }, [config.species]);

  const totalEvs = Object.values(config.evs).reduce((sum, v) => sum + v, 0);

  const updateEv = (stat: keyof StatSpread, value: number) => {
    const clamped = Math.max(0, Math.min(MAX_EV_PER_STAT, value));
    const newEvs = { ...config.evs, [stat]: clamped };
    const newTotal = Object.values(newEvs).reduce((sum, v) => sum + v, 0);
    if (newTotal <= MAX_EV_TOTAL) {
      onChange({ ...config, evs: newEvs });
    }
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <img src={sprite.url} alt={config.species} width={80} height={80} />
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#e2e8f0' }}>
            {config.species}
          </h2>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {species?.types.map(t => <TypeBadge key={t} type={t} />)}
          </div>
        </div>
      </div>

      {/* Base Stats */}
      {species && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 6px', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>
            Base Stats (BST: {species.baseStats.hp + species.baseStats.atk + species.baseStats.def + species.baseStats.spa + species.baseStats.spd + species.baseStats.spe})
          </h4>
          {STAT_LABELS.map(({ key, label }) => (
            <StatBar key={key} label={label} value={species.baseStats[key]} />
          ))}
        </div>
      )}

      {/* Nature / Ability / Item selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Nature</label>
          <select
            value={config.nature}
            onChange={e => onChange({ ...config, nature: e.target.value })}
            style={selectStyle}
          >
            {natures.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Ability</label>
          <select
            value={config.ability}
            onChange={e => onChange({ ...config, ability: e.target.value })}
            style={selectStyle}
          >
            {abilities.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Item</label>
          <select
            value={config.item}
            onChange={e => onChange({ ...config, item: e.target.value })}
            style={selectStyle}
          >
            <option value="">None</option>
            {items.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      {/* EV Spread */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={labelStyle}>EVs</label>
          <span style={{ fontSize: '11px', color: totalEvs > MAX_EV_TOTAL ? '#ef4444' : '#64748b' }}>
            {totalEvs}/{MAX_EV_TOTAL}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
          {STAT_LABELS.map(({ key, label }) => (
            <div key={key}>
              <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginBottom: '2px' }}>
                {label}
              </div>
              <input
                type="number"
                min={0}
                max={MAX_EV_PER_STAT}
                value={config.evs[key]}
                onChange={e => updateEv(key, parseInt(e.target.value) || 0)}
                style={{ ...inputStyle, textAlign: 'center', padding: '4px' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* IV Spread */}
      <div>
        <label style={labelStyle}>IVs</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginTop: '4px' }}>
          {STAT_LABELS.map(({ key, label }) => (
            <div key={key}>
              <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginBottom: '2px' }}>
                {label}
              </div>
              <input
                type="number"
                min={0}
                max={MAX_IV}
                value={config.ivs[key]}
                onChange={e => updateIv(key, parseInt(e.target.value) || 0)}
                style={{ ...inputStyle, textAlign: 'center', padding: '4px' }}
              />
            </div>
          ))}
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

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '13px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '13px',
  boxSizing: 'border-box',
};
