/**
 * Damage calculation service wrapping @smogon/calc.
 * Provides a simplified API for our threat analysis use case.
 */
import { calculate, Pokemon, Move, Field, Generations, toID } from '@smogon/calc';
import type { TypeName } from '@smogon/calc/dist/data/interface';
import { statPointsToEvs } from '@app-types';
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
      evs: toCalcEvs(attackerConfig.evs),
      ivs: toCalcStats(attackerConfig.ivs),
      teraType: (attackerConfig.teraType || undefined) as TypeName | undefined,
    });

    const defender = new Pokemon(gen, defenderConfig.species, {
      level: defenderConfig.level,
      nature: defenderConfig.nature,
      ability: defenderConfig.ability || undefined,
      item: defenderConfig.item || undefined,
      evs: toCalcEvs(defenderConfig.evs),
      ivs: toCalcStats(defenderConfig.ivs),
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
      description: result.desc(),
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
