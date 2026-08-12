/**
 * localStorage-backed persistence for saved teams and the working draft.
 *
 * Reads are defensive: storage is user-writable and may hold data from an
 * older build, so anything malformed degrades to empty state rather than
 * throwing during render. Writes are wrapped because localStorage throws
 * when full or when the browser blocks it (private mode, disabled cookies).
 */
import { MAX_TEAM_SIZE } from '../types/pokemon';
import type { Team, TeamSlot } from '../types/pokemon';
import type { PersistedState, SavedTeam } from '../types/saved-team';
import { STORAGE_VERSION } from '../types/saved-team';

const STORAGE_KEY = 'pokemon-ai-trainer:state';

const EMPTY_STATE: PersistedState = {
  version: STORAGE_VERSION,
  teams: [],
  draft: null,
  activeTeamId: null,
};

/** A slot is only usable if it carries an id and a config with a species. */
function isValidSlot(value: unknown): value is TeamSlot {
  if (!value || typeof value !== 'object') return false;
  const slot = value as Partial<TeamSlot>;
  return (
    typeof slot.id === 'string' &&
    !!slot.config &&
    typeof slot.config === 'object' &&
    typeof slot.config.species === 'string'
  );
}

/** Coerce arbitrary parsed JSON into a fixed-length team of MAX_TEAM_SIZE. */
function normalizeTeam(value: unknown): Team {
  const slots: Team = Array(MAX_TEAM_SIZE).fill(null);
  if (!Array.isArray(value)) return slots;

  for (let i = 0; i < Math.min(value.length, MAX_TEAM_SIZE); i++) {
    if (isValidSlot(value[i])) slots[i] = value[i] as TeamSlot;
  }
  return slots;
}

function normalizeSavedTeam(value: unknown): SavedTeam | null {
  if (!value || typeof value !== 'object') return null;
  const team = value as Partial<SavedTeam>;
  if (typeof team.id !== 'string' || typeof team.name !== 'string') return null;

  return {
    id: team.id,
    name: team.name,
    slots: normalizeTeam(team.slots),
    createdAt: typeof team.createdAt === 'string' ? team.createdAt : new Date().toISOString(),
    updatedAt: typeof team.updatedAt === 'string' ? team.updatedAt : new Date().toISOString(),
  };
}

/** Read persisted state, falling back to empty state on anything unexpected. */
export function loadState(): PersistedState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ...EMPTY_STATE };
  }
  if (!raw) return { ...EMPTY_STATE };

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    // Unknown future versions are discarded rather than guessed at.
    if (parsed.version !== STORAGE_VERSION) return { ...EMPTY_STATE };

    const teams = Array.isArray(parsed.teams)
      ? parsed.teams.map(normalizeSavedTeam).filter((t): t is SavedTeam => t !== null)
      : [];

    return {
      version: STORAGE_VERSION,
      teams,
      draft: parsed.draft ? normalizeTeam(parsed.draft) : null,
      activeTeamId: typeof parsed.activeTeamId === 'string' ? parsed.activeTeamId : null,
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

/**
 * Persist state. Returns false if the write failed (quota exceeded, storage
 * disabled) so callers can surface it instead of silently losing data.
 */
export function saveState(state: PersistedState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** Remove all persisted data. */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — storage is unavailable.
  }
}
