/**
 * Persisted team types.
 * A SavedTeam is a named Team plus bookkeeping. Slots are stored as a
 * fixed-length array with nulls so a team round-trips to the builder
 * with its empty slots in the same positions.
 */
import type { Team } from './pokemon';

export interface SavedTeam {
  id: string;
  name: string;
  slots: Team;
  /** ISO timestamp, set when the team is first saved. */
  createdAt: string;
  /** ISO timestamp, bumped on every write. */
  updatedAt: string;
}

/** Everything persisted by the app, under a single storage key. */
export interface PersistedState {
  /** Schema version, so future shape changes can migrate rather than crash. */
  version: number;
  teams: SavedTeam[];
  /** The in-progress team, restored on reload. */
  draft: Team | null;
  /** id of the saved team currently open in the builder, if any. */
  activeTeamId: string | null;
}

export const STORAGE_VERSION = 1;

export const DEFAULT_TEAM_NAME = 'Untitled Team';
