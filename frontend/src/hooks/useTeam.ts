import { useContext } from 'react';
import { TeamContext, type TeamContextValue } from '../context/team-context';

export function useTeam(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}
