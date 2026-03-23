import type { StatsTable, TypeName, NatureName } from './pokemon';

export type ThreatSeverity = 'ohko' | 'near_ohko' | 'two_hko' | 'pressure';

export interface TypeThreat {
  type: TypeName;
  multiplier: number; // 2 or 4
}

export interface OhkoThreat {
  attackerSpecies: string;
  move: string;
  moveType: TypeName;
  damageRange: { min: number; max: number }; // percentage of HP
  ohkoChance: number; // 0 to 1
  severity: ThreatSeverity;
  attackerSet: {
    nature: NatureName;
    evs: StatsTable;
    ability: string;
    item: string;
  };
  description: string; // e.g. "252+ Atk Weavile Ice Shard vs. 0 HP / 0 Def Garchomp"
}

export type RecommendationCategory = 'ev_spread' | 'item' | 'teammate' | 'ability' | 'tera_type';

export interface EvSpreadRecommendation {
  category: 'ev_spread';
  spread: StatsTable;
  nature: NatureName;
  survives: string[]; // threat descriptions it now survives
  tradeoff: string;
}

export interface ItemRecommendation {
  category: 'item';
  item: string;
  mitigates: string[]; // what threats it helps with
  description: string;
}

export interface TeammateRecommendation {
  category: 'teammate';
  species: string;
  reason: string;
  resistsTypes: TypeName[];
}

export interface AbilityRecommendation {
  category: 'ability';
  ability: string;
  description: string;
  mitigates: string[];
}

export interface TeraTypeRecommendation {
  category: 'tera_type';
  teraType: TypeName;
  description: string;
  removes: TypeName[]; // weaknesses removed
}

export type Recommendation =
  | EvSpreadRecommendation
  | ItemRecommendation
  | TeammateRecommendation
  | AbilityRecommendation
  | TeraTypeRecommendation;

export interface ThreatAnalysisResult {
  typeThreats: TypeThreat[];
  ohkoThreats: OhkoThreat[];
  recommendations: Recommendation[];
}
