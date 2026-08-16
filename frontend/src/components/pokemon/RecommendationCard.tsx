import type { Recommendation } from '@app-types/threat-analysis';
import type { StatSpread } from '@app-types/pokemon';
import { TypeBadge } from '@components/common/TypeBadge';
import { RecommendationCategoryBadge } from './RecommendationCategoryBadge';
import { Sprites } from '@pkmn/img';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApplyItem?: (item: string) => void;
  onApplyEvSpread?: (evs: StatSpread, nature: string) => void;
  onAddTeammate?: (species: string) => void;
}

/** One suggested change, with an apply action when the parent handles its category. */
export const RecommendationCard = ({
  recommendation,
  onApplyItem,
  onApplyEvSpread,
  onAddTeammate,
}: RecommendationCardProps) => {
  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        border: '1px solid #334155',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '6px',
        }}
      >
        <div>
          <RecommendationCategoryBadge category={recommendation.category} />
          <span
            style={{ fontWeight: 600, fontSize: '13px', color: '#e2e8f0', marginLeft: '8px' }}
          >
            {recommendation.title}
          </span>
        </div>
        <ActionButton
          recommendation={recommendation}
          onApplyItem={onApplyItem}
          onApplyEvSpread={onApplyEvSpread}
          onAddTeammate={onAddTeammate}
        />
      </div>

      <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
        {recommendation.description}
      </p>

      {recommendation.category === 'teammate' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <img
            src={Sprites.getPokemon(recommendation.species, { gen: 'ani' }).url}
            alt={recommendation.species}
            width={40}
            height={40}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            {recommendation.coversTypes.map(type => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </div>
      )}

      {recommendation.category === 'ev_spread' && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
          <strong>Tradeoff:</strong> {recommendation.tradeoff}
        </div>
      )}
    </div>
  );
};

/**
 * The card's apply action. Renders nothing unless the parent passed a handler
 * for this recommendation's category.
 */
const ActionButton = ({
  recommendation,
  onApplyItem,
  onApplyEvSpread,
  onAddTeammate,
}: RecommendationCardProps) => {
  if (recommendation.category === 'item' && onApplyItem) {
    return (
      <button onClick={() => onApplyItem(recommendation.item)} style={actionButtonStyle}>
        Apply
      </button>
    );
  }

  if (recommendation.category === 'ev_spread' && onApplyEvSpread) {
    return (
      <button
        onClick={() => onApplyEvSpread(recommendation.suggestedEvs, recommendation.suggestedNature)}
        style={actionButtonStyle}
      >
        Apply
      </button>
    );
  }

  if (recommendation.category === 'teammate' && onAddTeammate) {
    return (
      <button onClick={() => onAddTeammate(recommendation.species)} style={actionButtonStyle}>
        Add
      </button>
    );
  }

  return null;
};

const actionButtonStyle: React.CSSProperties = {
  padding: '4px 10px',
  backgroundColor: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
  flexShrink: 0,
};
