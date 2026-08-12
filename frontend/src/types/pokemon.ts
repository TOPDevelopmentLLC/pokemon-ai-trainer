/**
 * Pokemon domain types that wrap @pkmn/data and @smogon/calc.
 * We re-export library types where possible and define our own
 * only for app-specific concerns (team slots, configs).
 */

/** Stat spread shape — matches @smogon/calc StatsTable */
export interface StatSpread {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

/** A user-configured Pokemon on a team */
export interface PokemonConfig {
  species: string;
  level: number;
  nature: string;
  ability: string;
  item: string;
  evs: StatSpread;
  ivs: StatSpread;
  moves: string[];
  teraType?: string;
}

/** A filled or empty slot on a team */
export interface TeamSlot {
  id: string;
  config: PokemonConfig;
}

export type Team = (TeamSlot | null)[];

/** Display labels for each stat, in canonical order. */
export const STAT_LABELS: { key: keyof StatSpread; label: string }[] = [
  { key: 'hp', label: 'HP' },
  { key: 'atk', label: 'Atk' },
  { key: 'def', label: 'Def' },
  { key: 'spa', label: 'SpA' },
  { key: 'spd', label: 'SpD' },
  { key: 'spe', label: 'Spe' },
];

export const DEFAULT_EVS: StatSpread = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
export const DEFAULT_IVS: StatSpread = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

// Pokemon Champions replaced classic EVs with a smaller stat-point budget.
// `PokemonConfig.evs` holds stat points, not EVs; convert with statPointsToEvs()
// before handing a spread to the damage calculator.
export const MAX_STAT_POINTS_PER_STAT = 32;
export const MAX_STAT_POINTS_TOTAL = 66;

/**
 * EVs per stat point. 32 points x 8 = 256, which the calculator clamps to the
 * classic 252 cap, so a maxed stat stays a maxed stat.
 */
export const EVS_PER_STAT_POINT = 8;

/** Classic per-stat EV ceiling that @smogon/calc expects. */
export const MAX_EV_PER_STAT = 252;

export const MAX_IV = 31;
export const MAX_TEAM_SIZE = 6;

/** Convert a Champions stat-point spread into classic EVs for damage calc. */
export function statPointsToEvs(points: StatSpread): StatSpread {
  const convert = (p: number) => Math.min(MAX_EV_PER_STAT, p * EVS_PER_STAT_POINT);
  return {
    hp: convert(points.hp),
    atk: convert(points.atk),
    def: convert(points.def),
    spa: convert(points.spa),
    spd: convert(points.spd),
    spe: convert(points.spe),
  };
}

/** Total stat points allocated across a spread. */
export function totalStatPoints(points: StatSpread): number {
  return points.hp + points.atk + points.def + points.spa + points.spd + points.spe;
}

export function createDefaultConfig(species: string): PokemonConfig {
  return {
    species,
    level: 50,
    nature: 'Hardy',
    ability: '',
    item: '',
    evs: { ...DEFAULT_EVS },
    ivs: { ...DEFAULT_IVS },
    moves: [],
  };
}
