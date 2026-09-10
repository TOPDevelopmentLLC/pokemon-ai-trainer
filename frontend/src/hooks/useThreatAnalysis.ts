import { useState, useEffect, useRef } from 'react';
import type { PokemonConfig } from '@app-types';
import type { ThreatAnalysisResult } from '@app-types/threat-analysis';
import { runThreatAnalysis } from '@services/threat-analysis';

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
  // One state object, so a single update moves through loading -> result and
  // the effect never fires several setState calls in a row.
  const [state, setState] = useState<UseThreatAnalysisReturn>({
    result: null,
    isLoading: true,
    error: null,
  });

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
  // already captures every field the analysis reads. Written in an effect,
  // since refs must not be mutated during render.
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  useEffect(() => {
    const current = configRef.current;
    // With no config there is nothing to analyze; the empty result is derived
    // below rather than stored, so the effect does not set state synchronously.
    if (!current) return;

    // Analysis reads learnsets, which resolve asynchronously. `cancelled`
    // guards against a stale run overwriting a newer one.
    let cancelled = false;

    runThreatAnalysis(current)
      .then(analysisResult => {
        if (!cancelled) setState({ result: analysisResult, isLoading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          result: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Analysis failed',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [configKey]);

  // A cleared config reports empty immediately, without a state write.
  if (!config) return EMPTY_ANALYSIS;

  return state;
}

const EMPTY_ANALYSIS: UseThreatAnalysisReturn = {
  result: null,
  isLoading: false,
  error: null,
};
