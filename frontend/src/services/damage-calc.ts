/**
 * Damage calculation service wrapping @smogon/calc.
 * Provides a simplified API for our threat analysis use case.
 */
import { calculate, Pokemon, Move, Field, Generations, toID } from '@smogon/calc';
import type { TypeName } from '@smogon/calc/dist/data/interface';
import {
  DEFAULT_IVS,
  EVS_PER_STAT_POINT,
  MAX_EV_PER_STAT,
  MAX_STAT_POINTS_PER_STAT,
  statPointsToEvs,
} from '@app-types';
import type { PokemonConfig, StatSpread } from '@app-types';

const gen = Generations.get(9);

export interface DamageResult {
  /** Percentage of the defender's max HP, 0-100+. */
  minPercent: number;
  maxPercent: number;
  /** Raw damage in HP points, before conversion to a percentage. */
  minDamage: number;
  maxDamage: number;
  ohkoChance: number;
  koChanceText: string;
  description: string;
  /** The defender's max HP at their configured stat points. */
  defenderMaxHp: number;
}

/** Convert our StatSpread to @smogon/calc StatsTable format */
function toCalcStats(spread: StatSpread) {
  return {
    hp: spread.hp,
    atk: spread.atk,
    def: spread.def,
    spa: spread.spa,
    spd: spread.spd,
    spe: spread.spe,
  };
}

/**
 * EV spreads for the calculator.
 * Configs store Champions stat points, which must be scaled to classic EVs
 * before the damage formula sees them.
 */
function toCalcEvs(points: StatSpread) {
  return toCalcStats(statPointsToEvs(points));
}

/**
 * Rewrite @smogon/calc's description into Champions terms.
 *
 * The library speaks classic EVs: a 32-stat-point spread renders as "252+ Atk"
 * and a defender's 16/8 points as "128 HP / 64 Def". Those numbers are correct
 * internally but meaningless next to a UI that shows a 66-point budget, so the
 * EV figures are converted back to the stat points the user actually set.
 */
function toStatPointDescription(description: string): string {
  // Matches "252+ Atk", "128 HP", "4- SpD" — an EV count, optional nature
  // marker, then the stat name.
  return description.replace(
    /\b(\d+)([+-]?) (HP|Atk|Def|SpA|SpD|Spe)\b/g,
    (whole, evs: string, natureMark: string, stat: string) => {
      const evValue = Number(evs);

      // A maxed stat converts to 256 EVs but the calculator clamps it to 252,
      // so that value maps back to the per-stat point cap rather than 31.5.
      if (evValue === MAX_EV_PER_STAT) {
        return `${MAX_STAT_POINTS_PER_STAT}${natureMark} ${stat}`;
      }

      const points = evValue / EVS_PER_STAT_POINT;
      // Anything not on the point grid is not ours to reinterpret.
      if (!Number.isInteger(points)) return whole;
      return `${points}${natureMark} ${stat}`;
    },
  );
}

/** Calculate damage from an attacker config + move against a defender config */
export function calcDamage(
  attackerConfig: PokemonConfig,
  moveName: string,
  defenderConfig: PokemonConfig,
): DamageResult | null {
  try {
    const attacker = new Pokemon(gen, attackerConfig.species, {
      level: attackerConfig.level,
      nature: attackerConfig.nature,
      ability: attackerConfig.ability || undefined,
      item: attackerConfig.item || undefined,
      evs: toCalcEvs(attackerConfig.statPoints),
      // Champions maxes every IV, so they are applied here rather than stored.
      ivs: toCalcStats(DEFAULT_IVS),
      teraType: (attackerConfig.teraType || undefined) as TypeName | undefined,
    });

    const defender = new Pokemon(gen, defenderConfig.species, {
      level: defenderConfig.level,
      nature: defenderConfig.nature,
      ability: defenderConfig.ability || undefined,
      item: defenderConfig.item || undefined,
      evs: toCalcEvs(defenderConfig.statPoints),
      ivs: toCalcStats(DEFAULT_IVS),
      teraType: (defenderConfig.teraType || undefined) as TypeName | undefined,
    });

    const move = new Move(gen, moveName);
    const field = new Field({ gameType: 'Singles' });

    const result = calculate(gen, attacker, defender, move, field);

    // `range()` returns raw damage in HP points, not percentages. Convert
    // against the defender's ACTUAL max HP, which already reflects the stat
    // points they have invested in HP — the same raw damage is a smaller
    // fraction of a bulkier spread.
    const defenderMaxHp = defender.maxHP();
    const [minDamage, maxDamage] = result.range();
    const toPercent = (damage: number) =>
      defenderMaxHp > 0 ? (damage / defenderMaxHp) * 100 : 0;

    const minPercent = toPercent(minDamage);
    const maxPercent = toPercent(maxDamage);

    const kochance = result.kochance();
    const ohkoChance = kochance.n === 1 ? (kochance.chance ?? 0) : 0;

    return {
      minPercent,
      maxPercent,
      minDamage,
      maxDamage,
      ohkoChance,
      koChanceText: kochance.text,
      description: toStatPointDescription(result.desc()),
      defenderMaxHp,
    };
  } catch {
    // Move may not exist, species may be invalid, etc.
    return null;
  }
}

/**
 * Quick check: does this move type have a favorable matchup against the defender?
 * Used to pre-filter which moves to actually calc damage for.
 */
export function isSuperEffective(moveType: string, defenderTypes: string[]): boolean {
  try {
    const type = gen.types.get(toID(moveType));
    if (!type) return false;

    const chart = type.effectiveness as Record<string, number | undefined>;

    let effectiveness = 1;
    for (const defType of defenderTypes) {
      const e = chart[defType];
      if (e !== undefined) effectiveness *= e;
    }
    return effectiveness > 1;
  } catch {
    return false;
  }
}
