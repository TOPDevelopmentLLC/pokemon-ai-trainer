import { useState, useEffect } from 'react';
import type { PokemonConfig } from '../types';
import type { ThreatAnalysisResult } from '../types/threat-analysis';
import { runThreatAnalysis } from '../services/threat-analysis';

interface UseThreatAnalysisReturn {
  result: ThreatAnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Runs threat analysis for a given Pokemon config.
 * Recalculates when the config changes.
 */
export function useThreatAnalysis(config: PokemonConfig | null): UseThreatAnalysisReturn {
  const [result, setResult] = useState<ThreatAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) {
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Run analysis in a microtask to avoid blocking the UI
    const timeoutId = setTimeout(() => {
      try {
        const analysisResult = runThreatAnalysis(config);
        setResult(analysisResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [
    config?.species,
    config?.level,
    config?.nature,
    config?.ability,
    config?.item,
    config?.teraType,
    // Stringify EVs/IVs for stable dependency comparison
    config && JSON.stringify(config.evs),
    config && JSON.stringify(config.ivs),
  ]);

  return { result, isLoading, error };
}
