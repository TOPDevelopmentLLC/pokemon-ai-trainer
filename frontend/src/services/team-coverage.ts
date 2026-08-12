/**
 * Team-wide defensive coverage scoring.
 * Aggregates each team member's type matchups into one score per
 * attacking type, so the team's collective holes are visible at a glance.
 */
import { gen9, getSpecies } from './dex';
import type { Team } from '../types/pokemon';
import type { CoverageContribution, TypeCoverage, TeamCoverageResult } from '../types/team-coverage';

/** Attacking types to chart, in canonical dex order. Excludes ??? and Stellar. */
export function getChartableTypes(): string[] {
  const types: string[] = [];
  for (const type of gen9.types) {
    if (type.name === '???' || type.name === 'Stellar') continue;
    types.push(type.name);
  }
  return types;
}

/**
 * Points a single damage multiplier contributes to a type's score.
 * Immunities score 0 — they are counted separately by the caller.
 */
export function scoreMultiplier(multiplier: number): CoverageContribution {
  if (multiplier === 0) return 0;      // immune — labeled, never scored
  if (multiplier <= 0.25) return 2;    // double resist
  if (multiplier < 1) return 1;        // resist
  if (multiplier === 1) return 0;      // neutral
  if (multiplier < 4) return -1;       // weak
  return -2;                           // double weak (4x or worse)
}

/**
 * Effectiveness of an attacking type against a defending type combination.
 * Returns the product of each defending type's multiplier (0, 0.25, 0.5, 1, 2, 4).
 */
function effectivenessAgainst(attackingType: string, defenderTypes: readonly string[]): number {
  const type = gen9.types.get(attackingType);
  if (!type) return 1;

  const effectiveness = type.effectiveness as Record<string, number | undefined>;

  let multiplier = 1;
  for (const defType of defenderTypes) {
    const e = effectiveness[defType];
    if (e !== undefined) multiplier *= e;
  }
  return multiplier;
}

/** Empty coverage entry for a type, before any team members are folded in. */
function emptyCoverage(type: string): TypeCoverage {
  return {
    type,
    score: 0,
    immuneCount: 0,
    doubleWeakCount: 0,
    weakCount: 0,
    neutralCount: 0,
    resistCount: 0,
    doubleResistCount: 0,
  };
}

/** Record one team member's multiplier against a type into its running tally. */
function accumulate(coverage: TypeCoverage, multiplier: number): void {
  coverage.score += scoreMultiplier(multiplier);

  if (multiplier === 0) coverage.immuneCount++;
  else if (multiplier <= 0.25) coverage.doubleResistCount++;
  else if (multiplier < 1) coverage.resistCount++;
  else if (multiplier === 1) coverage.neutralCount++;
  else if (multiplier < 4) coverage.weakCount++;
  else coverage.doubleWeakCount++;
}

/**
 * Compute the defensive coverage score for every attacking type across a team.
 * Empty slots and unknown species are skipped; a team of zero contributing
 * members yields all-zero scores rather than an empty chart.
 */
export function analyzeTeamCoverage(team: Team): TeamCoverageResult {
  const coverage = getChartableTypes().map(emptyCoverage);
  let teamSize = 0;

  for (const slot of team) {
    if (!slot) continue;

    const species = getSpecies(slot.config.species);
    if (!species) continue;

    const defenderTypes = [...species.types];
    teamSize++;

    for (const entry of coverage) {
      accumulate(entry, effectivenessAgainst(entry.type, defenderTypes));
    }
  }

  return { coverage, teamSize };
}
