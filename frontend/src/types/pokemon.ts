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

export const DEFAULT_EVS: StatSpread = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
export const DEFAULT_IVS: StatSpread = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
export const MAX_EV_PER_STAT = 252;
export const MAX_EV_TOTAL = 510;
export const MAX_IV = 31;
export const MAX_TEAM_SIZE = 6;

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
