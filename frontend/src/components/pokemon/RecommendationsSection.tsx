import type { Recommendation } from '@app-types/threat-analysis';
import type { StatSpread } from '@app-types/pokemon';
import { RecommendationCard } from './RecommendationCard';

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
  onApplyItem?: (item: string) => void;
  onApplyEvSpread?: (evs: StatSpread, nature: string) => void;
  onAddTeammate?: (species: string) => void;
}

export const RecommendationsSection = ({
  recommendations,
  onApplyItem,
  onApplyEvSpread,
  onAddTeammate,
}: RecommendationsSectionProps) => {
  if (recommendations.length === 0) return null;

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
        Recommendations
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recommendations.map(recommendation => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onApplyItem={onApplyItem}
            onApplyEvSpread={onApplyEvSpread}
            onAddTeammate={onAddTeammate}
          />
        ))}
      </div>
    </div>
  );
};
