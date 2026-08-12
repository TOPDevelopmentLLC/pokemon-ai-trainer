import { useReducer, type ReactNode } from 'react';
import type { Team, TeamSlot, PokemonConfig } from '../types';
import { createDefaultConfig, MAX_TEAM_SIZE } from '../types';
import { TeamContext, type TeamContextValue } from './team-context';

interface TeamState {
  team: Team;
  selectedSlotIndex: number | null;
}

type TeamAction =
  | { type: 'ADD_POKEMON'; species: string }
  | { type: 'REMOVE_POKEMON'; index: number }
  | { type: 'SELECT_SLOT'; index: number | null }
  | { type: 'UPDATE_CONFIG'; index: number; config: PokemonConfig };

function teamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case 'ADD_POKEMON': {
      const team = [...state.team];
      const emptyIndex = team.findIndex(slot => slot === null);
      if (emptyIndex === -1) return state;

      const slot: TeamSlot = {
        id: crypto.randomUUID(),
        config: createDefaultConfig(action.species),
      };
      team[emptyIndex] = slot;
      return { ...state, team, selectedSlotIndex: emptyIndex };
    }

    case 'REMOVE_POKEMON': {
      const team = [...state.team];
      team[action.index] = null;
      const selected = state.selectedSlotIndex === action.index ? null : state.selectedSlotIndex;
      return { ...state, team, selectedSlotIndex: selected };
    }

    case 'SELECT_SLOT':
      return { ...state, selectedSlotIndex: action.index };

    case 'UPDATE_CONFIG': {
      const team = [...state.team];
      const slot = team[action.index];
      if (!slot) return state;
      team[action.index] = { ...slot, config: action.config };
      return { ...state, team };
    }

    default:
      return state;
  }
}

const initialState: TeamState = {
  team: Array(MAX_TEAM_SIZE).fill(null),
  selectedSlotIndex: null,
};

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(teamReducer, initialState);

  const value: TeamContextValue = {
    ...state,
    selectedSlot: state.selectedSlotIndex !== null ? state.team[state.selectedSlotIndex] : null,
    addPokemon: (species) => dispatch({ type: 'ADD_POKEMON', species }),
    removePokemon: (index) => dispatch({ type: 'REMOVE_POKEMON', index }),
    selectSlot: (index) => dispatch({ type: 'SELECT_SLOT', index }),
    updateConfig: (index, config) => dispatch({ type: 'UPDATE_CONFIG', index, config }),
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};
