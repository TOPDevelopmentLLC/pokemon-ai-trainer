import { useState, useEffect, useRef } from 'react';
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

  // Serialize the fields the analysis actually depends on, so the effect
  // compares by value rather than by object identity.
  const configKey = config
    ? JSON.stringify([
        config.species,
        config.level,
        config.nature,
        config.ability,
        config.item,
        config.teraType,
        config.evs,
        config.ivs,
      ])
    : null;

  // Read the latest config without adding it as a dependency; configKey
  // already captures every field the analysis reads.
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const current = configRef.current;
    if (!current) {
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Run analysis in a microtask to avoid blocking the UI
    const timeoutId = setTimeout(() => {
      try {
        const analysisResult = runThreatAnalysis(current);
        setResult(analysisResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsLoading(false);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [configKey]);

  return { result, isLoading, error };
}
