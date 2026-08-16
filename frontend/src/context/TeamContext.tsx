import { useReducer, useEffect, useRef, type ReactNode } from 'react';
import type { Team, TeamSlot, PokemonConfig, SavedTeam } from '@app-types';
import { createDefaultConfig, MAX_TEAM_SIZE, DEFAULT_TEAM_NAME } from '@app-types';
import { loadState, saveState } from '@services/team-storage';
import { TeamContext, type TeamContextValue } from './team-context';

interface TeamState {
  team: Team;
  selectedSlotIndex: number | null;
  savedTeams: SavedTeam[];
  activeTeamId: string | null;
  storageError: boolean;
}

type TeamAction =
  | { type: 'ADD_POKEMON'; species: string }
  | { type: 'REMOVE_POKEMON'; index: number }
  | { type: 'SELECT_SLOT'; index: number | null }
  | { type: 'UPDATE_CONFIG'; index: number; config: PokemonConfig }
  | { type: 'SAVE_CURRENT'; id: string; name: string; now: string }
  | { type: 'LOAD_TEAM'; id: string }
  | { type: 'RENAME_TEAM'; id: string; name: string; now: string }
  | { type: 'DELETE_TEAM'; id: string }
  | { type: 'DUPLICATE_TEAM'; id: string; newId: string; now: string }
  | { type: 'START_NEW' }
  | { type: 'SET_STORAGE_ERROR'; failed: boolean };

const emptyTeam = (): Team => Array(MAX_TEAM_SIZE).fill(null);

/** Actions that change the working team and so must write through when active. */
const TEAM_MUTATIONS = new Set<TeamAction['type']>([
  'ADD_POKEMON',
  'REMOVE_POKEMON',
  'UPDATE_CONFIG',
]);

/**
 * Mirror the working team onto the active saved team.
 * Called after any mutation so an opened team auto-saves, per the edit model.
 */
function syncActiveTeam(state: TeamState, now: string): TeamState {
  if (!state.activeTeamId) return state;

  return {
    ...state,
    savedTeams: state.savedTeams.map(t =>
      t.id === state.activeTeamId ? { ...t, slots: state.team, updatedAt: now } : t,
    ),
  };
}

function teamReducer(state: TeamState, action: TeamAction): TeamState {
  const next = applyAction(state, action);

  if (TEAM_MUTATIONS.has(action.type) && next !== state) {
    return syncActiveTeam(next, new Date().toISOString());
  }
  return next;
}

function applyAction(state: TeamState, action: TeamAction): TeamState {
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

    case 'SAVE_CURRENT': {
      const existing = state.savedTeams.find(t => t.id === state.activeTeamId);

      // Saving while a team is open renames it rather than forking a copy.
      if (existing) {
        return {
          ...state,
          savedTeams: state.savedTeams.map(t =>
            t.id === existing.id
              ? { ...t, name: action.name, slots: state.team, updatedAt: action.now }
              : t,
          ),
        };
      }

      const team: SavedTeam = {
        id: action.id,
        name: action.name,
        slots: state.team,
        createdAt: action.now,
        updatedAt: action.now,
      };
      return { ...state, savedTeams: [...state.savedTeams, team], activeTeamId: team.id };
    }

    case 'LOAD_TEAM': {
      const team = state.savedTeams.find(t => t.id === action.id);
      if (!team) return state;
      return { ...state, team: [...team.slots], activeTeamId: team.id, selectedSlotIndex: null };
    }

    case 'RENAME_TEAM':
      return {
        ...state,
        savedTeams: state.savedTeams.map(t =>
          t.id === action.id ? { ...t, name: action.name, updatedAt: action.now } : t,
        ),
      };

    case 'DELETE_TEAM': {
      const savedTeams = state.savedTeams.filter(t => t.id !== action.id);
      // Deleting the open team detaches the builder but keeps its contents.
      const activeTeamId = state.activeTeamId === action.id ? null : state.activeTeamId;
      return { ...state, savedTeams, activeTeamId };
    }

    case 'DUPLICATE_TEAM': {
      const source = state.savedTeams.find(t => t.id === action.id);
      if (!source) return state;

      const copy: SavedTeam = {
        id: action.newId,
        name: `${source.name} (copy)`,
        slots: source.slots.map(slot => (slot ? { ...slot, id: crypto.randomUUID() } : null)),
        createdAt: action.now,
        updatedAt: action.now,
      };
      return { ...state, savedTeams: [...state.savedTeams, copy] };
    }

    case 'START_NEW':
      return { ...state, team: emptyTeam(), activeTeamId: null, selectedSlotIndex: null };

    case 'SET_STORAGE_ERROR':
      return state.storageError === action.failed
        ? state
        : { ...state, storageError: action.failed };

    default:
      return state;
  }
}

/** Rehydrate from localStorage on first render. */
function initState(): TeamState {
  const persisted = loadState();
  return {
    team: persisted.draft ?? emptyTeam(),
    selectedSlotIndex: null,
    savedTeams: persisted.teams,
    activeTeamId: persisted.activeTeamId,
    storageError: false,
  };
}

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(teamReducer, undefined, initState);

  // Persist on change. The first run is skipped so a failed read cannot
  // immediately overwrite storage with empty state.
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }

    const ok = saveState({
      version: 1,
      teams: state.savedTeams,
      draft: state.team,
      activeTeamId: state.activeTeamId,
    });
    dispatch({ type: 'SET_STORAGE_ERROR', failed: !ok });
  }, [state.team, state.savedTeams, state.activeTeamId]);

  const activeTeam = state.activeTeamId
    ? (state.savedTeams.find(t => t.id === state.activeTeamId) ?? null)
    : null;

  const value: TeamContextValue = {
    ...state,
    selectedSlot: state.selectedSlotIndex !== null ? state.team[state.selectedSlotIndex] : null,
    activeTeam,
    // Most recently updated first, without mutating state's array.
    savedTeams: [...state.savedTeams].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),

    addPokemon: species => dispatch({ type: 'ADD_POKEMON', species }),
    removePokemon: index => dispatch({ type: 'REMOVE_POKEMON', index }),
    selectSlot: index => dispatch({ type: 'SELECT_SLOT', index }),
    updateConfig: (index, config) => dispatch({ type: 'UPDATE_CONFIG', index, config }),

    saveCurrentTeam: name => {
      const id = state.activeTeamId ?? crypto.randomUUID();
      dispatch({
        type: 'SAVE_CURRENT',
        id,
        name: name.trim() || DEFAULT_TEAM_NAME,
        now: new Date().toISOString(),
      });
      return id;
    },
    loadTeam: id => dispatch({ type: 'LOAD_TEAM', id }),
    renameTeam: (id, name) =>
      dispatch({
        type: 'RENAME_TEAM',
        id,
        name: name.trim() || DEFAULT_TEAM_NAME,
        now: new Date().toISOString(),
      }),
    deleteTeam: id => dispatch({ type: 'DELETE_TEAM', id }),
    duplicateTeam: id => {
      if (!state.savedTeams.some(t => t.id === id)) return null;
      const newId = crypto.randomUUID();
      dispatch({ type: 'DUPLICATE_TEAM', id, newId, now: new Date().toISOString() });
      return newId;
    },
    startNewTeam: () => dispatch({ type: 'START_NEW' }),
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};
