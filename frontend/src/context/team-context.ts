import { createContext } from 'react';
import type { Team, TeamSlot, PokemonConfig } from '../types';

export interface TeamContextValue {
  team: Team;
  selectedSlotIndex: number | null;
  selectedSlot: TeamSlot | null;
  addPokemon: (species: string) => void;
  removePokemon: (index: number) => void;
  selectSlot: (index: number | null) => void;
  updateConfig: (index: number, config: PokemonConfig) => void;
}

/**
 * Lives apart from TeamContext.tsx so that file can export only its
 * provider component, which is what React Fast Refresh requires.
 */
export const TeamContext = createContext<TeamContextValue | null>(null);
