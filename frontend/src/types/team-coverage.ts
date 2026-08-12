/**
 * Team-wide defensive type coverage — aggregates the per-Pokemon type
 * matchups of a whole team into a single score per attacking type.
 *
 * Scoring (per Pokemon, per attacking type):
 *   0.25x (double resist)  +2
 *   0.5x  (resist)         +1
 *   1x    (neutral)         0
 *   2x    (weak)           -1
 *   4x    (double weak)    -2
 *   0x    (immune)          0  — tracked separately via `immuneCount`
 *
 * Immunities deliberately contribute nothing to `score` so the number
 * always reads as "how much resistance vs. weakness does the team have";
 * they are surfaced as a separate label instead.
 */

/** Score contributed by a single Pokemon for a single attacking type. */
export type CoverageContribution = -2 | -1 | 0 | 1 | 2;

/** The aggregate defensive picture for one attacking type across a team. */
export interface TypeCoverage {
  /** Attacking type name, e.g. "Ground" */
  type: string;
  /** Sum of every team member's contribution. Excludes immunities. */
  score: number;
  /** Team members immune to this type (0x). Never folded into `score`. */
  immuneCount: number;
  /** Team members taking 4x from this type. */
  doubleWeakCount: number;
  /** Team members taking 2x from this type. */
  weakCount: number;
  /** Team members taking 1x from this type. */
  neutralCount: number;
  /** Team members taking 0.5x from this type. */
  resistCount: number;
  /** Team members taking 0.25x from this type. */
  doubleResistCount: number;
}

/** Coverage across every attacking type, plus team-level context. */
export interface TeamCoverageResult {
  /** One entry per attacking type, in canonical type order. */
  coverage: TypeCoverage[];
  /** Number of filled team slots the scores were computed from. */
  teamSize: number;
}

/**
 * Largest magnitude any single type score can reach, used to scale the
 * chart axis: 6 Pokemon x +/-2 points each.
 */
export const MAX_ABS_COVERAGE_SCORE = 12;
