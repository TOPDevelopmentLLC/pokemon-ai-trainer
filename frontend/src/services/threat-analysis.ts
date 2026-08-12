/**
 * Threat analysis engine.
 * Given a Pokemon config, identifies type vulnerabilities, OHKO threats
 * from common competitive Pokemon, and survival recommendations.
 */
import { gen9, getSpecies, LEGAL_SPECIES_NAMES } from './dex';
import { isChampionsLegal } from './champions-roster';
import { calcDamage } from './damage-calc';
import type { PokemonConfig, StatSpread } from '../types/pokemon';
import {
  MAX_STAT_POINTS_PER_STAT,
  MAX_STAT_POINTS_TOTAL,
  totalStatPoints,
} from '../types/pokemon';
import type {
  TypeVulnerabilityProfile,
  TypeThreat,
  OhkoThreat,
  ThreatSeverity,
  Recommendation,
  ThreatAnalysisResult,
} from '../types/threat-analysis';

// =============================================================================
// Common competitive sets — a curated metagame pool to analyze against.
// In a real app this would come from Smogon usage stats.
// =============================================================================

interface CompetitiveSet {
  species: string;
  nature: string;
  ability: string;
  item: string;
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  moves: string[];
}

/**
 * Top OU threats with their most common competitive sets.
 * Filtered to Champions-legal species at use time via `championsMetagameSets()`,
 * so entries stay here if a future regulation makes them legal again.
 */
const METAGAME_SETS: CompetitiveSet[] = [
  { species: 'Dragapult', nature: 'Timid', ability: 'Infiltrator', item: 'Choice Specs', evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 }, moves: ['Shadow Ball', 'Draco Meteor', 'Flamethrower', 'U-turn'] },
  { species: 'Gholdengo', nature: 'Timid', ability: 'Good as Gold', item: 'Air Balloon', evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 }, moves: ['Make It Rain', 'Shadow Ball', 'Recover', 'Nasty Plot'] },
  { species: 'Great Tusk', nature: 'Jolly', ability: 'Protosynthesis', item: 'Booster Energy', evs: { hp: 32, atk: 0, def: 2, spa: 0, spd: 0, spe: 32 }, moves: ['Headlong Rush', 'Ice Spinner', 'Knock Off', 'Rapid Spin'] },
  { species: 'Kingambit', nature: 'Adamant', ability: 'Supreme Overlord', item: 'Leftovers', evs: { hp: 32, atk: 32, def: 0, spa: 0, spd: 2, spe: 0 }, moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Swords Dance'] },
  { species: 'Garchomp', nature: 'Jolly', ability: 'Rough Skin', item: 'Rocky Helmet', evs: { hp: 0, atk: 32, def: 2, spa: 0, spd: 0, spe: 32 }, moves: ['Earthquake', 'Dragon Claw', 'Stone Edge', 'Swords Dance'] },
  { species: 'Iron Valiant', nature: 'Timid', ability: 'Quark Drive', item: 'Booster Energy', evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 }, moves: ['Moonblast', 'Aura Sphere', 'Shadow Ball', 'Psyshock'] },
  { species: 'Heatran', nature: 'Calm', ability: 'Flash Fire', item: 'Leftovers', evs: { hp: 32, atk: 0, def: 0, spa: 2, spd: 32, spe: 0 }, moves: ['Magma Storm', 'Earth Power', 'Stealth Rock', 'Protect'] },
  { species: 'Raging Bolt', nature: 'Modest', ability: 'Protosynthesis', item: 'Booster Energy', evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 }, moves: ['Thunderclap', 'Draco Meteor', 'Thunderbolt', 'Volt Switch'] },
  { species: 'Landorus-Therian', nature: 'Jolly', ability: 'Intimidate', item: 'Choice Scarf', evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 2, spe: 32 }, moves: ['Earthquake', 'U-turn', 'Stone Edge', 'Knock Off'] },
  { species: 'Roaring Moon', nature: 'Jolly', ability: 'Protosynthesis', item: 'Booster Energy', evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 2, spe: 32 }, moves: ['Crunch', 'Dragon Dance', 'Acrobatics', 'Earthquake'] },
  { species: 'Iron Moth', nature: 'Timid', ability: 'Quark Drive', item: 'Heavy-Duty Boots', evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 }, moves: ['Fiery Dance', 'Sludge Wave', 'Energy Ball', 'Psychic'] },
  { species: 'Gliscor', nature: 'Impish', ability: 'Poison Heal', item: 'Toxic Orb', evs: { hp: 32, atk: 0, def: 25, spa: 0, spd: 9, spe: 0 }, moves: ['Earthquake', 'Knock Off', 'Roost', 'Toxic'] },
  { species: 'Kyurem', nature: 'Modest', ability: 'Pressure', item: 'Choice Specs', evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 }, moves: ['Freeze-Dry', 'Draco Meteor', 'Ice Beam', 'Earth Power'] },
  { species: 'Darkrai', nature: 'Timid', ability: 'Bad Dreams', item: 'Focus Sash', evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 }, moves: ['Dark Pulse', 'Sludge Bomb', 'Nasty Plot', 'Dark Void'] },
  { species: 'Skeledirge', nature: 'Bold', ability: 'Unaware', item: 'Heavy-Duty Boots', evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 2, spe: 0 }, moves: ['Torch Song', 'Hex', 'Will-O-Wisp', 'Slack Off'] },
  { species: 'Weavile', nature: 'Jolly', ability: 'Pressure', item: 'Choice Band', evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 2, spe: 32 }, moves: ['Triple Axel', 'Knock Off', 'Ice Shard', 'Low Kick'] },
  { species: 'Dragonite', nature: 'Adamant', ability: 'Multiscale', item: 'Choice Band', evs: { hp: 0, atk: 32, def: 0, spa: 0, spd: 2, spe: 32 }, moves: ['Outrage', 'Extreme Speed', 'Earthquake', 'Ice Spinner'] },
  { species: 'Zamazenta', nature: 'Impish', ability: 'Dauntless Shield', item: 'Leftovers', evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 2, spe: 0 }, moves: ['Body Press', 'Iron Defense', 'Howl', 'Crunch'] },
  { species: 'Volcarona', nature: 'Timid', ability: 'Flame Body', item: 'Heavy-Duty Boots', evs: { hp: 0, atk: 0, def: 0, spa: 32, spd: 2, spe: 32 }, moves: ['Quiver Dance', 'Flamethrower', 'Bug Buzz', 'Giga Drain'] },
  { species: 'Toxapex', nature: 'Bold', ability: 'Regenerator', item: 'Rocky Helmet', evs: { hp: 32, atk: 0, def: 32, spa: 0, spd: 2, spe: 0 }, moves: ['Scald', 'Knock Off', 'Recover', 'Toxic Spikes'] },
];

/** The metagame pool restricted to Pokemon legal in the current regulation. */
function championsMetagameSets(): CompetitiveSet[] {
  return METAGAME_SETS.filter(set => isChampionsLegal(set.species));
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

function classifySeverity(minPercent: number, maxPercent: number, ohkoChance: number): ThreatSeverity {
  if (ohkoChance > 0 || maxPercent >= 100) return 'ohko';
  if (minPercent >= 75) return 'near_ohko';
  if (maxPercent * 2 >= 100) return 'two_hko';
  return 'pressure';
}

export function analyzeOhkoThreats(defenderConfig: PokemonConfig): OhkoThreat[] {
  const threats: OhkoThreat[] = [];
  const defenderSpecies = getSpecies(defenderConfig.species);
  if (!defenderSpecies) return threats;

  const defenderTypes = [...defenderSpecies.types];
  let threatId = 0;

  for (const set of championsMetagameSets()) {
    // Skip if attacker is the same species as the defender
    if (set.species === defenderConfig.species) continue;

    const attackerConfig: PokemonConfig = {
      species: set.species,
      level: 50,
      nature: set.nature,
      ability: set.ability,
      item: set.item,
      evs: set.evs,
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      moves: set.moves,
    };

    // Only calc damaging moves
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
      if (typeEffectiveness < 1 && move.basePower < 100) continue;

      const result = calcDamage(attackerConfig, moveName, defenderConfig);
      if (!result) continue;

      // Only include threats that deal meaningful damage (>40%)
      if (result.maxPercent < 40) continue;

      const severity = classifySeverity(result.minPercent, result.maxPercent, result.ohkoChance);

      threats.push({
        id: `threat-${threatId++}`,
        attackerSpecies: set.species,
        move: moveName,
        moveType: move.type,
        moveCategory: move.category,
        damageRange: { min: result.minPercent, max: result.maxPercent },
        ohkoChance: result.ohkoChance,
        severity,
        attackerSet: {
          nature: set.nature,
          evs: set.evs,
          ability: set.ability,
          item: set.item,
        },
        description: result.description,
      });
    }
  }

  // Sort: OHKOs first, then by max damage descending
  threats.sort((a, b) => {
    const severityOrder: Record<ThreatSeverity, number> = { ohko: 0, near_ohko: 1, two_hko: 2, pressure: 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
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
      const addressedThreats = actualOhkos
        .filter(t => t.moveType === weakness.type)
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
  const defensivePoints = defenderConfig.evs.hp + defenderConfig.evs.def + defenderConfig.evs.spd;
  if (defensivePoints < MAX_STAT_POINTS_PER_STAT / 2 && actualOhkos.length > 0) {
    // Determine if threats are more physical or special
    const physicalThreats = actualOhkos.filter(t => t.moveCategory === 'Physical').length;
    const specialThreats = actualOhkos.filter(t => t.moveCategory === 'Special').length;

    const defStat = physicalThreats >= specialThreats ? 'def' : 'spd';
    const defName = defStat === 'def' ? 'Defense' : 'Sp. Def';

    // Keep the user's offensive/speed investment and spend what remains of the
    // budget on HP first, then the more relevant defense.
    const preserved = { ...defenderConfig.evs, hp: 0, def: 0, spd: 0 };
    const available = Math.max(0, MAX_STAT_POINTS_TOTAL - totalStatPoints(preserved));

    const hp = Math.min(MAX_STAT_POINTS_PER_STAT, available);
    const def = Math.min(MAX_STAT_POINTS_PER_STAT, available - hp);

    const suggestedEvs: StatSpread = {
      ...preserved,
      hp,
      [defStat]: def,
    } as StatSpread;

    // Only worth surfacing if it actually allocates something.
    if (hp + def > 0) {
      recommendations.push({
        id: `rec-${recId++}`,
        category: 'ev_spread',
        suggestedEvs,
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

export function runThreatAnalysis(config: PokemonConfig): ThreatAnalysisResult {
  const { profile, threats: typeThreats } = analyzeTypeVulnerabilities(config.species);
  const ohkoThreats = analyzeOhkoThreats(config);
  const recommendations = generateRecommendations(config, ohkoThreats, typeThreats);

  return {
    typeProfile: profile,
    typeThreats,
    ohkoThreats,
    recommendations,
    analyzedAt: new Date().toISOString(),
  };
}
