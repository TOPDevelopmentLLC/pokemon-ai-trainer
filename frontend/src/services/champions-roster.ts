/**
 * Pokemon Champions legality.
 *
 * The roster JSON names Pokemon the way the game presents them
 * ("Mega Charizard X", or "Raichu" with a separate "Alolan" form field),
 * which does not match @pkmn/dex naming ("Charizard-Mega-X", "Raichu-Alola").
 * This module resolves the roster onto dex species names once at module load
 * and exposes membership checks over the result.
 */
import { Dex } from '@pkmn/dex';
import rosterData from '@data/pokemon-champions-legal.json';

interface RosterEntry {
  id: string;
  dexNumber: number;
  name: string;
  form: string | null;
  types: string[];
  isMega: boolean;
  baseSpecies: string | null;
}

interface RosterFile {
  game: string;
  regulation: string;
  regulationEndDate: string;
  pokemon: RosterEntry[];
}

const roster = rosterData as RosterFile;

/** Roster form wording -> dex forme suffix. */
const REGIONAL_SUFFIXES: Record<string, string> = {
  alolan: 'Alola',
  galarian: 'Galar',
  hisuian: 'Hisui',
  paldean: 'Paldea',
};

/** Paldean Tauros breeds are distinct species in the dex. */
const TAUROS_BREEDS = ['Combat', 'Blaze', 'Aqua'];

/** Mega variant letters. Champions introduces Z alongside the mainline X/Y. */
const MEGA_VARIANT_SUFFIXES = ['X', 'Y', 'Z'];

/**
 * Form wordings that map to a dex forme suffix, for families where the forms
 * differ in stats or abilities and so must stay distinct.
 * Keys are matched against the lowercased form string.
 */
const FORM_SUFFIXES: Record<string, string> = {
  'low key': 'Low-Key',
  amped: 'Amped',
  female: 'F',
  male: 'M',
  'blue plumage': 'Blue',
  'green plumage': 'Green',
  'white plumage': 'White',
  'yellow plumage': 'Yellow',
};

/**
 * Candidate dex names for a roster entry, most specific first.
 * The first candidate that exists in the dex wins, so breed- and
 * X/Y-specific names must precede their generic fallbacks.
 */
function candidateNames(entry: RosterEntry): string[] {
  const candidates: string[] = [];

  if (entry.isMega) {
    // "Mega Charizard X" -> Charizard-Mega-X; "Mega Venusaur" -> Venusaur-Mega
    const base = entry.name.replace(/^Mega\s+/, '');
    const parts = base.split(' ');
    const suffix = parts[parts.length - 1];

    // Champions adds "Z" variants alongside the mainline X/Y ones, and they are
    // distinct species with their own typing — Absol-Mega-Z is Dark/Ghost where
    // Absol-Mega is pure Dark. Without this the Z entry silently resolves to
    // the non-Z Mega and reports the wrong types.
    if (parts.length > 1 && MEGA_VARIANT_SUFFIXES.includes(suffix)) {
      candidates.push(`${parts.slice(0, -1).join(' ')}-Mega-${suffix}`);
    }
    candidates.push(`${base}-Mega`);
    if (entry.baseSpecies) candidates.push(`${entry.baseSpecies}-Mega`);
  } else if (entry.form) {
    const form = entry.form.toLowerCase();

    for (const [wording, suffix] of Object.entries(REGIONAL_SUFFIXES)) {
      if (!form.includes(wording)) continue;

      // Breed-specific names first — "Tauros-Paldea" alone resolves to Combat.
      for (const breed of TAUROS_BREEDS) {
        if (form.includes(breed.toLowerCase())) {
          candidates.push(`${entry.name}-${suffix}-${breed}`);
        }
      }
      candidates.push(`${entry.name}-${suffix}`);
    }

    if (form.includes('eternal')) candidates.push(`${entry.name}-Eternal`);

    // Gender, plumage and Amped/Low Key forms differ in stats or abilities, so
    // each resolves to its own dex entry rather than collapsing to the base.
    for (const [wording, suffix] of Object.entries(FORM_SUFFIXES)) {
      if (form.includes(wording)) candidates.push(`${entry.name}-${suffix}`);
    }
  }

  candidates.push(entry.name);
  return candidates;
}

/** Resolve one roster entry to its dex species name, or null if absent. */
function resolveEntry(entry: RosterEntry): string | null {
  for (const candidate of candidateNames(entry)) {
    const species = Dex.species.get(candidate);
    if (species?.exists) return species.name;
  }
  return null;
}

function buildLegalSet(): Set<string> {
  const legal = new Set<string>();
  for (const entry of roster.pokemon) {
    const name = resolveEntry(entry);
    if (name) legal.add(name);
  }
  return legal;
}

/** Dex species names legal in Pokemon Champions. */
export const CHAMPIONS_LEGAL_SPECIES: ReadonlySet<string> = buildLegalSet();

/** Roster entries that could not be resolved to a dex species. */
export const UNRESOLVED_ROSTER_ENTRIES: readonly string[] = roster.pokemon
  .filter(entry => resolveEntry(entry) === null)
  .map(entry => entry.name);

/** Metadata for surfacing which regulation is in effect. */
export const CHAMPIONS_REGULATION = {
  game: roster.game,
  regulation: roster.regulation,
  endDate: roster.regulationEndDate,
} as const;

/** Whether a dex species name is legal in Pokemon Champions. */
export function isChampionsLegal(speciesName: string): boolean {
  const species = Dex.species.get(speciesName);
  if (!species?.exists) return false;
  return CHAMPIONS_LEGAL_SPECIES.has(species.name);
}
