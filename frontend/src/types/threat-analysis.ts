/**
 * Threat analysis types — describes the output of analyzing
 * what threatens a given Pokemon and how to survive.
 */
import type { StatSpread } from './pokemon';

// =============================================================================
// Type Vulnerability (pure type math, no damage calc)
// =============================================================================

export interface TypeThreat {
  type: string;
  multiplier: number; // 0.25, 0.5, 1, 2, or 4
}

export interface TypeVulnerabilityProfile {
  doubleWeaknesses: string[];  // 4x
  weaknesses: string[];        // 2x
  neutral: string[];           // 1x
  resistances: string[];       // 0.5x
  doubleResistances: string[]; // 0.25x
  immunities: string[];        // 0x
}

// =============================================================================
// OHKO Threat (damage-calc powered)
// =============================================================================

export type ThreatSeverity = 'ohko' | 'near_ohko' | 'two_hko' | 'pressure';

/** One dangerous move a threat can use, with what it does to the defender. */
export interface ThreatMove {
  id: string;
  move: string;
  moveType: string;
  moveCategory: string;
  /** Percentage of the defender's max HP. */
  damageRange: { min: number; max: number };
  ohkoChance: number; // 0 to 1
  severity: ThreatSeverity;
  /** Human-readable calc description from @smogon/calc */
  description: string;
}

/**
 * A single attacking Pokemon and every dangerous move it has.
 *
 * Grouped by attacker rather than by move: a Pokemon with three threatening
 * moves is one entry in the list, not three, and its moves are revealed when
 * the entry is opened.
 */
export interface OhkoThreat {
  id: string;
  attackerSpecies: string;
  attackerSet: {
    nature: string;
    statPoints: StatSpread;
    ability: string;
    item: string;
  };
  /** Dangerous moves, most damaging first. */
  moves: ThreatMove[];
  /** The worst case across `moves`, used for ranking and the collapsed row. */
  severity: ThreatSeverity;
  damageRange: { min: number; max: number };
}

// =============================================================================
// Recommendations
// =============================================================================

export type RecommendationCategory =
  | 'ev_spread'
  | 'item'
  | 'teammate'
  | 'ability'
  | 'tera_type';

export interface BaseRecommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  addressedThreats: string[]; // threat IDs this helps with
  priority: number; // lower = more impactful
}

export interface EvSpreadRecommendation extends BaseRecommendation {
  category: 'ev_spread';
  suggestedStatPoints: StatSpread;
  suggestedNature: string;
  tradeoff: string;
}

export interface ItemRecommendation extends BaseRecommendation {
  category: 'item';
  item: string;
}

export interface TeammateRecommendation extends BaseRecommendation {
  category: 'teammate';
  species: string;
  coversTypes: string[];
}

export interface AbilityRecommendation extends BaseRecommendation {
  category: 'ability';
  ability: string;
  mitigates: string[];
}

export interface TeraTypeRecommendation extends BaseRecommendation {
  category: 'tera_type';
  teraType: string;
  removesWeaknesses: string[];
}

export type Recommendation =
  | EvSpreadRecommendation
  | ItemRecommendation
  | TeammateRecommendation
  | AbilityRecommendation
  | TeraTypeRecommendation;

// =============================================================================
// Full Analysis Result
// =============================================================================

export interface ThreatAnalysisResult {
  typeProfile: TypeVulnerabilityProfile;
  typeThreats: TypeThreat[];
  ohkoThreats: OhkoThreat[];
  recommendations: Recommendation[];
  analyzedAt: string;
}
