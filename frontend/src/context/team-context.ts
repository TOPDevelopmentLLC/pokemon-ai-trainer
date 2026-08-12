import { createContext } from 'react';
import type { Team, TeamSlot, PokemonConfig, SavedTeam } from '../types';

export interface TeamContextValue {
  team: Team;
  selectedSlotIndex: number | null;
  selectedSlot: TeamSlot | null;
  addPokemon: (species: string) => void;
  removePokemon: (index: number) => void;
  selectSlot: (index: number | null) => void;
  updateConfig: (index: number, config: PokemonConfig) => void;

  /** All persisted teams, most recently updated first. */
  savedTeams: SavedTeam[];
  /** The saved team currently open in the builder, if any. */
  activeTeamId: string | null;
  activeTeam: SavedTeam | null;
  /** Persist the working team under a name and make it active. */
  saveCurrentTeam: (name: string) => string;
  /** Load a saved team into the builder. */
  loadTeam: (id: string) => void;
  /** Rename a saved team. */
  renameTeam: (id: string, name: string) => void;
  deleteTeam: (id: string) => void;
  duplicateTeam: (id: string) => string | null;
  /** Detach from the active team so edits stop writing through to it. */
  startNewTeam: () => void;
  /** True when the last write to storage failed. */
  storageError: boolean;
}

/**
 * Lives apart from TeamContext.tsx so that file can export only its
 * provider component, which is what React Fast Refresh requires.
 */
export const TeamContext = createContext<TeamContextValue | null>(null);
