/**
 * Threat analysis engine.
 * Given a Pokemon config, identifies type vulnerabilities, OHKO threats
 * from common competitive Pokemon, and survival recommendations.
 */
import {
  gen9,
  generations,
  getChampionsAbilityImmunity,
  getSpecies,
  getSpeciesAbilities,
  LEGAL_SPECIES_NAMES,
} from './dex';
import type { Move } from '@pkmn/dex-types';
import { calcDamage } from './damage-calc';
import type { PokemonConfig, StatSpread } from '@app-types/pokemon';
import {
  MAX_STAT_POINTS_PER_STAT,
  MAX_STAT_POINTS_TOTAL,
  STAT_LABELS,
  totalStatPoints,
} from '@app-types/pokemon';
import type {
  TypeVulnerabilityProfile,
  TypeThreat,
  OhkoThreat,
  ThreatMove,
  ThreatSeverity,
  Recommendation,
  ThreatAnalysisResult,
} from '@app-types/threat-analysis';

// =============================================================================
// Threat pool — derived from the Champions roster, not a hand-written list.
// =============================================================================

/**
 * An attacking set used to probe how hard a defender can be hit.
 *
 * Champions has no Choice items, Booster Energy, or Heavy-Duty Boots, so the
 * old hand-written mainline sets could not be represented. Instead each threat
 * is modeled at its offensive ceiling: max stat points in its better attacking
 * stat, a boosting nature, and no held item. That answers "what is the worst
 * this Pokemon can do to me" without inventing item or spread data.
 */
interface CompetitiveSet {
  species: string;
  nature: string;
  ability: string;
  item: string;
  statPoints: StatSpread;
  moves: string[];
}

/** Full stat points in one attacking stat, plus speed. */
function offensiveSpread(attackStat: 'atk' | 'spa'): StatSpread {
  return {
    hp: 0,
    atk: attackStat === 'atk' ? MAX_STAT_POINTS_PER_STAT : 0,
    def: 0,
    spa: attackStat === 'spa' ? MAX_STAT_POINTS_PER_STAT : 0,
    spd: 0,
    // Remaining points go to Speed, capped per stat. Speed does not affect
    // damage; it just keeps the spread a legal, realistic build.
    spe: Math.min(
      MAX_STAT_POINTS_PER_STAT,
      MAX_STAT_POINTS_TOTAL - MAX_STAT_POINTS_PER_STAT,
    ),
  };
}

/** Nature that boosts the chosen attacking stat without lowering the other. */
const ATTACK_NATURE = { atk: 'Adamant', spa: 'Modest' } as const;

/** Minimum accuracy for a move to count as a realistic threat. */
const MIN_ACCURACY = 85;

/**
 * Whether a move is something a threat would realistically attack with.
 *
 * The highest-base-power moves are dominated by ones with crippling drawbacks —
 * Explosion faints the user, Prismatic Laser needs a recharge turn, Focus Punch
 * fails if the user is hit first. Ranking on raw power alone surfaces those as
 * a Pokemon's scariest attack, which badly misrepresents the real threat.
 */
function isRealisticAttack(move: Move): boolean {
  if (move.selfdestruct) return false;
  // Recharge and two-turn charge moves only attack every other turn.
  if (move.flags?.recharge || move.flags?.charge) return false;
  if (move.self?.volatileStatus === 'mustrecharge') return false;
  // Negative priority means the move usually goes last (Focus Punch).
  if (move.priority < 0) return false;
  if (move.accuracy !== true && move.accuracy < MIN_ACCURACY) return false;
  return true;
}

/**
 * Damaging moves a species can learn, capped so a single threat does not
 * dominate the analysis. Ordered by base power so the scariest are kept.
 */
async function topDamagingMoves(
  speciesName: string,
  category: 'Physical' | 'Special',
  limit: number,
): Promise<string[]> {
  const species = getSpecies(speciesName);
  if (!species) return [];

  // Matching by type alone assigns signature moves to species that cannot
  // learn them (Belch to Glimmora, Fleur Cannon to Floette), so the learnset
  // is the source of truth for what a threat can actually use.
  const learnset = await getLearnableMoveIds(speciesName);
  if (learnset.size === 0) return [];

  const moves: { name: string; power: number }[] = [];
  for (const move of gen9.moves) {
    if (!move.exists || move.category !== category) continue;
    if (move.basePower <= 0) continue;
    if (!isRealisticAttack(move)) continue;
    if (!learnset.has(move.id)) continue;
    // STAB only — a threat's strongest realistic hits.
    if (!species.types.includes(move.type)) continue;
    moves.push({ name: move.name, power: move.basePower });
  }

  return moves
    .sort((a, b) => b.power - a.power || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(m => m.name);
}

/**
 * Generations to search for a learnset, newest first. Species cut from Gen 9
 * (Alakazam, Absol and others on the Champions roster) only have data in
 * earlier generations.
 */
const LEARNSET_GENERATIONS = [generations.get(9), generations.get(8), generations.get(7)];

/** Move ids a species can learn, cached since the pool is scanned repeatedly. */
const learnsetCache = new Map<string, Set<string>>();

async function getLearnableMoveIds(speciesName: string): Promise<Set<string>> {
  const cached = learnsetCache.get(speciesName);
  if (cached) return cached;

  // A Mega has no learnset of its own — it uses the base form's. Gen 9 also
  // dropped many species entirely, so a lookup there returns nothing; fall
  // back through earlier generations for those.
  const baseSpecies = getSpecies(speciesName)?.baseSpecies ?? speciesName;

  let ids = new Set<string>();
  for (const generation of LEARNSET_GENERATIONS) {
    try {
      const learnset = await generation.learnsets.learnable(baseSpecies);
      if (learnset) {
        ids = new Set(Object.keys(learnset));
        if (ids.size > 0) break;
      }
    } catch {
      // Try the next generation.
    }
  }

  learnsetCache.set(speciesName, ids);
  return ids;
}

/** Highest-BST Champions-legal species, the pool worth analyzing against. */
function threatPool(limit: number): string[] {
  return [...LEGAL_SPECIES_NAMES]
    .map(name => {
      const species = getSpecies(name);
      if (!species) return null;
      const stats = species.baseStats;
      return {
        name,
        atk: stats.atk,
        spa: stats.spa,
        bst: STAT_LABELS.reduce((sum, { key }) => sum + stats[key], 0),
      };
    })
    .filter((entry): entry is { name: string; atk: number; spa: number; bst: number } => entry !== null)
    .sort((a, b) => Math.max(b.atk, b.spa) - Math.max(a.atk, a.spa) || b.bst - a.bst)
    .slice(0, limit)
    .map(entry => entry.name);
}

/** How many species to analyze as potential threats. */
const THREAT_POOL_SIZE = 40;

/** How many damaging moves to test per threat. */
const MOVES_PER_THREAT = 3;

/**
 * The metagame pool, derived from the current Champions roster rather than a
 * hand-maintained list, so a regulation change needs no edit here.
 */
async function championsMetagameSets(): Promise<CompetitiveSet[]> {
  const sets: CompetitiveSet[] = [];

  for (const species of threatPool(THREAT_POOL_SIZE)) {
    const data = getSpecies(species);
    if (!data) continue;

    // Model whichever attacking stat is stronger.
    const attackStat = data.baseStats.atk >= data.baseStats.spa ? 'atk' : 'spa';
    const category = attackStat === 'atk' ? 'Physical' : 'Special';
    const moves = await topDamagingMoves(species, category, MOVES_PER_THREAT);
    if (moves.length === 0) continue;

    sets.push({
      species,
      nature: ATTACK_NATURE[attackStat],
      ability: getSpeciesAbilities(species)[0] ?? '',
      // Champions items are all situational rather than flat damage boosts,
      // so threats are modeled itemless — the damage floor, not a guess.
      item: '',
      statPoints: offensiveSpread(attackStat),
      moves,
    });
  }

  return sets;
}

// =============================================================================
// Type Vulnerability Analysis
// =============================================================================

export function analyzeTypeVulnerabilities(speciesName: string): {
  profile: TypeVulnerabilityProfile;
  threats: TypeThreat[];
} {
  const species = getSpecies(speciesName);
  if (!species) {
    return {
      profile: { doubleWeaknesses: [], weaknesses: [], neutral: [], resistances: [], doubleResistances: [], immunities: [] },
      threats: [],
    };
  }

  const defenderTypes = [...species.types];
  const profile: TypeVulnerabilityProfile = {
    doubleWeaknesses: [],
    weaknesses: [],
    neutral: [],
    resistances: [],
    doubleResistances: [],
    immunities: [],
  };
  const threats: TypeThreat[] = [];

  for (const type of gen9.types) {
    if (type.name === '???' || type.name === 'Stellar') continue;

    let multiplier = 1;
    for (const defType of defenderTypes) {
      const e = type.effectiveness[defType];
      if (e !== undefined) multiplier *= e;
    }

    const threat: TypeThreat = { type: type.name, multiplier };

    if (multiplier === 0) profile.immunities.push(type.name);
    else if (multiplier === 0.25) profile.doubleResistances.push(type.name);
    else if (multiplier === 0.5) profile.resistances.push(type.name);
    else if (multiplier === 1) profile.neutral.push(type.name);
    else if (multiplier === 2) profile.weaknesses.push(type.name);
    else if (multiplier >= 4) profile.doubleWeaknesses.push(type.name);

    if (multiplier >= 2) threats.push(threat);
  }

  // Sort threats by multiplier descending (4x before 2x)
  threats.sort((a, b) => b.multiplier - a.multiplier);

  return { profile, threats };
}

// =============================================================================
// OHKO Threat Analysis
// =============================================================================

/** Ranking order for severities, worst first. */
const SEVERITY_ORDER: Record<ThreatSeverity, number> = {
  ohko: 0,
  near_ohko: 1,
  two_hko: 2,
  pressure: 3,
};

function classifySeverity(minPercent: number, maxPercent: number, ohkoChance: number): ThreatSeverity {
  if (ohkoChance > 0 || maxPercent >= 100) return 'ohko';
  if (minPercent >= 75) return 'near_ohko';
  if (maxPercent * 2 >= 100) return 'two_hko';
  return 'pressure';
}

export async function analyzeOhkoThreats(defenderConfig: PokemonConfig): Promise<OhkoThreat[]> {
  const threats: OhkoThreat[] = [];
  const defenderSpecies = getSpecies(defenderConfig.species);
  if (!defenderSpecies) return threats;

  const defenderTypes = [...defenderSpecies.types];

  // Champions abilities @smogon/calc does not know would otherwise compute
  // full damage for a move the defender is immune to.
  const abilityImmuneType = getChampionsAbilityImmunity(defenderConfig.species);

  let threatId = 0;

  for (const set of await championsMetagameSets()) {
    // Skip if attacker is the same species as the defender
    if (set.species === defenderConfig.species) continue;

    const attackerConfig: PokemonConfig = {
      species: set.species,
      level: 50,
      nature: set.nature,
      ability: set.ability,
      item: set.item,
      statPoints: set.statPoints,
      moves: set.moves,
    };

    // Collect every dangerous move this attacker has, so it becomes one entry.
    const dangerousMoves: ThreatMove[] = [];

    for (const moveName of set.moves) {
      const move = gen9.moves.get(moveName);
      if (!move || move.category === 'Status') continue;

      // Pre-filter: only calc if SE or high base power
      const moveType = move.type;
      let typeEffectiveness = 1;
      for (const defType of defenderTypes) {
        const type = gen9.types.get(moveType);
        if (type) {
          const e = type.effectiveness[defType];
          if (e !== undefined) typeEffectiveness *= e;
        }
      }

      // Skip if immune or heavily resisted (unless very high BP)
      if (typeEffectiveness === 0) continue;
      if (moveType === abilityImmuneType) continue;
      if (typeEffectiveness < 1 && move.basePower < 100) continue;

      const result = calcDamage(attackerConfig, moveName, defenderConfig);
      if (!result) continue;

      // Only include moves that deal meaningful damage (>40%)
      if (result.maxPercent < 40) continue;

      dangerousMoves.push({
        id: `threat-${threatId++}`,
        move: moveName,
        moveType: move.type,
        moveCategory: move.category,
        damageRange: { min: result.minPercent, max: result.maxPercent },
        ohkoChance: result.ohkoChance,
        severity: classifySeverity(result.minPercent, result.maxPercent, result.ohkoChance),
        description: result.description,
      });
    }

    if (dangerousMoves.length === 0) continue;

    // Most damaging first, so the collapsed row shows the worst case.
    dangerousMoves.sort((a, b) => b.damageRange.max - a.damageRange.max);
    const worst = dangerousMoves.reduce((a, b) =>
      SEVERITY_ORDER[a.severity] <= SEVERITY_ORDER[b.severity] ? a : b,
    );

    threats.push({
      id: `attacker-${set.species}`,
      attackerSpecies: set.species,
      attackerSet: {
        nature: set.nature,
        statPoints: set.statPoints,
        ability: set.ability,
        item: set.item,
      },
      moves: dangerousMoves,
      severity: worst.severity,
      damageRange: { ...dangerousMoves[0].damageRange },
    });
  }

  // Sort: most severe attackers first, then by their hardest hit.
  threats.sort((a, b) => {
    const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.damageRange.max - a.damageRange.max;
  });

  return threats;
}

// =============================================================================
// Recommendations
// =============================================================================

export function generateRecommendations(
  defenderConfig: PokemonConfig,
  ohkoThreats: OhkoThreat[],
  typeThreats: TypeThreat[],
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let recId = 0;

  const actualOhkos = ohkoThreats.filter(t => t.severity === 'ohko' || t.severity === 'near_ohko');

  // Recommendation: Focus Sash if many OHKOs
  if (actualOhkos.length >= 3 && defenderConfig.item !== 'Focus Sash') {
    recommendations.push({
      id: `rec-${recId++}`,
      category: 'item',
      item: 'Focus Sash',
      title: 'Equip Focus Sash',
      description: `Survives any single OHKO from full HP. Useful given ${actualOhkos.length} threats can OHKO.`,
      addressedThreats: actualOhkos.map(t => t.id),
      priority: 1,
    });
  }

  // Recommendation: Type-resist berries for 4x weaknesses
  const doubleWeakTypes = typeThreats.filter(t => t.multiplier >= 4);
  const berryMap: Record<string, string> = {
    'Ice': 'Yache Berry', 'Fire': 'Occa Berry', 'Water': 'Passho Berry',
    'Electric': 'Wacan Berry', 'Grass': 'Rindo Berry', 'Fighting': 'Chople Berry',
    'Poison': 'Kebia Berry', 'Ground': 'Shuca Berry', 'Flying': 'Coba Berry',
    'Psychic': 'Payapa Berry', 'Bug': 'Tanga Berry', 'Rock': 'Charti Berry',
    'Ghost': 'Kasib Berry', 'Dragon': 'Haban Berry', 'Dark': 'Colbur Berry',
    'Steel': 'Babiri Berry', 'Fairy': 'Roseli Berry',
  };

  for (const weakness of doubleWeakTypes) {
    const berry = berryMap[weakness.type];
    if (berry && defenderConfig.item !== berry) {
      // An attacker counts if any of its dangerous moves is this type.
      const addressedThreats = actualOhkos
        .filter(t => t.moves.some(m => m.moveType === weakness.type))
        .map(t => t.id);

      recommendations.push({
        id: `rec-${recId++}`,
        category: 'item',
        item: berry,
        title: `Equip ${berry}`,
        description: `Halves ${weakness.type}-type damage once. Addresses the 4x ${weakness.type} weakness.`,
        addressedThreats,
        priority: 2,
      });
    }
  }

  // Recommendation: defensive investment if the spread is currently thin there
  const defensivePoints = defenderConfig.statPoints.hp + defenderConfig.statPoints.def + defenderConfig.statPoints.spd;
  if (defensivePoints < MAX_STAT_POINTS_PER_STAT / 2 && actualOhkos.length > 0) {
    // Determine if threats are more physical or special
    // Categorize each attacker by its most damaging dangerous move.
    const physicalThreats = actualOhkos.filter(t => t.moves[0]?.moveCategory === 'Physical').length;
    const specialThreats = actualOhkos.filter(t => t.moves[0]?.moveCategory === 'Special').length;

    const defStat = physicalThreats >= specialThreats ? 'def' : 'spd';
    const defName = defStat === 'def' ? 'Defense' : 'Sp. Def';

    // Keep the user's offensive/speed investment and spend what remains of the
    // budget on HP first, then the more relevant defense.
    const preserved = { ...defenderConfig.statPoints, hp: 0, def: 0, spd: 0 };
    const available = Math.max(0, MAX_STAT_POINTS_TOTAL - totalStatPoints(preserved));

    const hp = Math.min(MAX_STAT_POINTS_PER_STAT, available);
    const def = Math.min(MAX_STAT_POINTS_PER_STAT, available - hp);

    const suggestedStatPoints: StatSpread = {
      ...preserved,
      hp,
      [defStat]: def,
    } as StatSpread;

    // Only worth surfacing if it actually allocates something.
    if (hp + def > 0) {
      recommendations.push({
        id: `rec-${recId++}`,
        category: 'ev_spread',
        suggestedStatPoints,
        suggestedNature: defenderConfig.nature,
        title: `Invest in HP / ${defName}`,
        description: `Most OHKO threats are ${physicalThreats >= specialThreats ? 'physical' : 'special'}. Running ${hp} HP / ${def} ${defName} may help survive key hits.`,
        addressedThreats: actualOhkos.map(t => t.id),
        tradeoff: 'Reduces offensive or speed investment.',
        priority: 3,
      });
    }
  }

  // Recommendation: Teammates that resist the top weakness types
  const weaknessTypes = typeThreats.map(t => t.type);
  const goodDefensiveTypes: Record<string, string[]> = {
    'Ice': ['Fire', 'Water', 'Steel'],
    'Fire': ['Water', 'Rock', 'Dragon'],
    'Water': ['Grass', 'Dragon', 'Water'],
    'Electric': ['Ground', 'Grass', 'Dragon'],
    'Grass': ['Fire', 'Flying', 'Poison', 'Steel'],
    'Fighting': ['Fairy', 'Flying', 'Psychic', 'Ghost'],
    'Ground': ['Flying', 'Grass', 'Bug'],
    'Flying': ['Rock', 'Electric', 'Steel'],
    'Psychic': ['Dark', 'Steel'],
    'Rock': ['Ground', 'Steel', 'Fighting'],
    'Bug': ['Fire', 'Flying', 'Rock'],
    'Ghost': ['Dark', 'Normal'],
    'Dragon': ['Fairy', 'Steel'],
    'Dark': ['Fairy', 'Fighting', 'Bug'],
    'Steel': ['Fire', 'Ground', 'Fighting'],
    'Fairy': ['Steel', 'Poison', 'Fire'],
    'Poison': ['Ground', 'Steel', 'Psychic'],
    'Normal': ['Rock', 'Steel', 'Ghost'],
  };

  // Find Pokemon from the dex that resist the top 2 weakness types
  const topWeaknesses = weaknessTypes.slice(0, 2);
  if (topWeaknesses.length > 0) {
    const resistTypes = new Set<string>();
    for (const wType of topWeaknesses) {
      const resists = goodDefensiveTypes[wType];
      if (resists) resists.forEach(t => resistTypes.add(t));
    }

    // Find Champions-legal species that have one of these resist types.
    // Iterating the legal roster keeps recommendations to Pokemon the user
    // can actually add, and includes Megas and regional forms.
    const candidates: string[] = [];
    for (const name of LEGAL_SPECIES_NAMES) {
      if (name === defenderConfig.species) continue;

      const species = getSpecies(name);
      if (!species) continue;

      const hasResistType = species.types.some(t => resistTypes.has(t));
      if (hasResistType && species.baseStats.hp + species.baseStats.def + species.baseStats.spd > 200) {
        candidates.push(species.name);
        if (candidates.length >= 3) break;
      }
    }

    for (const candidate of candidates) {
      const species = getSpecies(candidate);
      if (!species) continue;

      recommendations.push({
        id: `rec-${recId++}`,
        category: 'teammate',
        species: candidate,
        coversTypes: topWeaknesses,
        title: `Add ${candidate} to team`,
        description: `${candidate} (${species.types.join('/')}) resists key threats targeting ${defenderConfig.species}.`,
        addressedThreats: [],
        priority: 5,
      });
    }
  }

  recommendations.sort((a, b) => a.priority - b.priority);
  return recommendations;
}

// =============================================================================
// Full Analysis
// =============================================================================

export async function runThreatAnalysis(config: PokemonConfig): Promise<ThreatAnalysisResult> {
  const { profile, threats: typeThreats } = analyzeTypeVulnerabilities(config.species);
  const ohkoThreats = await analyzeOhkoThreats(config);
  const recommendations = generateRecommendations(config, ohkoThreats, typeThreats);

  return {
    typeProfile: profile,
    typeThreats,
    ohkoThreats,
    recommendations,
    analyzedAt: new Date().toISOString(),
  };
}
