import type { Recommendation } from '../../types/threat-analysis';
import type { StatSpread } from '../../types/pokemon';
import { TypeBadge } from '../common/TypeBadge';
import { Sprites } from '@pkmn/img';

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
        {recommendations.map(rec => (
          <div
            key={rec.id}
            style={{
              padding: '12px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              border: '1px solid #334155',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div>
                <span style={categoryBadgeStyle(rec.category)}>
                  {formatCategory(rec.category)}
                </span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#e2e8f0', marginLeft: '8px' }}>
                  {rec.title}
                </span>
              </div>
              {renderActionButton(rec, onApplyItem, onApplyEvSpread, onAddTeammate)}
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
              {rec.description}
            </p>

            {rec.category === 'teammate' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <img
                  src={Sprites.getPokemon(rec.species, { gen: 'ani' }).url}
                  alt={rec.species}
                  width={40} height={40}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  {rec.coversTypes.map(t => <TypeBadge key={t} type={t} />)}
                </div>
              </div>
            )}

            {rec.category === 'ev_spread' && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                <strong>Tradeoff:</strong> {rec.tradeoff}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function renderActionButton(
  rec: Recommendation,
  onApplyItem?: (item: string) => void,
  onApplyEvSpread?: (evs: StatSpread, nature: string) => void,
  onAddTeammate?: (species: string) => void,
) {
  if (rec.category === 'item' && onApplyItem) {
    return (
      <button onClick={() => onApplyItem(rec.item)} style={actionButtonStyle}>
        Apply
      </button>
    );
  }
  if (rec.category === 'ev_spread' && onApplyEvSpread) {
    return (
      <button onClick={() => onApplyEvSpread(rec.suggestedEvs, rec.suggestedNature)} style={actionButtonStyle}>
        Apply
      </button>
    );
  }
  if (rec.category === 'teammate' && onAddTeammate) {
    return (
      <button onClick={() => onAddTeammate(rec.species)} style={actionButtonStyle}>
        Add
      </button>
    );
  }
  return null;
}

function formatCategory(category: string): string {
  switch (category) {
    case 'ev_spread': return 'EVs';
    case 'item': return 'Item';
    case 'teammate': return 'Team';
    case 'ability': return 'Ability';
    case 'tera_type': return 'Tera';
    default: return category;
  }
}

function categoryBadgeStyle(category: string): React.CSSProperties {
  const colors: Record<string, string> = {
    ev_spread: '#8b5cf6',
    item: '#f59e0b',
    teammate: '#3b82f6',
    ability: '#10b981',
    tera_type: '#ec4899',
  };

  return {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: '3px',
    backgroundColor: (colors[category] ?? '#64748b') + '33',
    color: colors[category] ?? '#64748b',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
  };
}

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
