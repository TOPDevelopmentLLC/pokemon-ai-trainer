import { useMemo } from 'react';
import type { Team } from '../types';
import type { TeamCoverageResult } from '../types/team-coverage';
import { analyzeTeamCoverage } from '../services/team-coverage';

/**
 * Computes team-wide defensive type coverage.
 * Coverage is pure type math driven only by species, so this recomputes
 * when the team's species lineup changes — not on every EV/item tweak.
 */
export function useTeamCoverage(team: Team): TeamCoverageResult {
  const speciesKey = team.map(slot => slot?.config.species ?? '').join('|');

  return useMemo(
    () => analyzeTeamCoverage(team),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speciesKey],
  );
}
