import type { PokemonConfig, StatSpread } from '../../types';
import { useThreatAnalysis } from '../../hooks/useThreatAnalysis';
import { PokemonConfigPanel } from './PokemonConfigPanel';
import { TypeThreatsSection } from './TypeThreatsSection';
import { OhkoThreatsSection } from './OhkoThreatsSection';
import { RecommendationsSection } from './RecommendationsSection';

interface ThreatAnalysisViewProps {
  config: PokemonConfig;
  onChange: (config: PokemonConfig) => void;
  onAddTeammate: (species: string) => void;
}

export const ThreatAnalysisView = ({ config, onChange, onAddTeammate }: ThreatAnalysisViewProps) => {
  const { result, isLoading, error } = useThreatAnalysis(config);

  const handleApplyItem = (item: string) => {
    onChange({ ...config, item });
  };

  const handleApplyEvSpread = (evs: Record<string, number>, nature: string) => {
    onChange({ ...config, evs: evs as StatSpread, nature });
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', backgroundColor: '#0f172a' }}>
      <PokemonConfigPanel config={config} onChange={onChange} />

      {isLoading && (
        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          Analyzing threats...
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', color: '#ef4444', fontSize: '13px' }}>
          Error: {error}
        </div>
      )}

      {result && !isLoading && (
        <>
          <TypeThreatsSection profile={result.typeProfile} threats={result.typeThreats} />
          <OhkoThreatsSection threats={result.ohkoThreats} />
          <RecommendationsSection
            recommendations={result.recommendations}
            onApplyItem={handleApplyItem}
            onApplyEvSpread={handleApplyEvSpread}
            onAddTeammate={onAddTeammate}
          />
        </>
      )}
    </div>
  );
};
