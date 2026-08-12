/**
 * Damage calculation service wrapping @smogon/calc.
 * Provides a simplified API for our threat analysis use case.
 */
import { calculate, Pokemon, Move, Field, Generations, toID } from '@smogon/calc';
import type { TypeName } from '@smogon/calc/dist/data/interface';
import type { PokemonConfig, StatSpread } from '../types';

const gen = Generations.get(9);

export interface DamageResult {
  minPercent: number;
  maxPercent: number;
  ohkoChance: number;
  koChanceText: string;
  description: string;
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
      evs: toCalcStats(attackerConfig.evs),
      ivs: toCalcStats(attackerConfig.ivs),
      teraType: (attackerConfig.teraType || undefined) as TypeName | undefined,
    });

    const defender = new Pokemon(gen, defenderConfig.species, {
      level: defenderConfig.level,
      nature: defenderConfig.nature,
      ability: defenderConfig.ability || undefined,
      item: defenderConfig.item || undefined,
      evs: toCalcStats(defenderConfig.evs),
      ivs: toCalcStats(defenderConfig.ivs),
      teraType: (defenderConfig.teraType || undefined) as TypeName | undefined,
    });

    const move = new Move(gen, moveName);
    const field = new Field({ gameType: 'Singles' });

    const result = calculate(gen, attacker, defender, move, field);

    const range = result.range();
    const minPercent = range[0];
    const maxPercent = range[1];

    const kochance = result.kochance();
    const ohkoChance = kochance.n === 1 ? (kochance.chance ?? 0) : 0;

    return {
      minPercent,
      maxPercent,
      ohkoChance,
      koChanceText: kochance.text,
      description: result.desc(),
      defenderMaxHp: defender.maxHP(),
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
