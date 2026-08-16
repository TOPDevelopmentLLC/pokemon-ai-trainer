import type { RecommendationCategory } from '@app-types/threat-analysis';

const CATEGORY_LABELS: Record<string, string> = {
  ev_spread: 'EVs',
  item: 'Item',
  teammate: 'Team',
  ability: 'Ability',
  tera_type: 'Tera',
};

const CATEGORY_COLORS: Record<string, string> = {
  ev_spread: '#8b5cf6',
  item: '#f59e0b',
  teammate: '#3b82f6',
  ability: '#10b981',
  tera_type: '#ec4899',
};

const FALLBACK_COLOR = '#64748b';

interface RecommendationCategoryBadgeProps {
  category: RecommendationCategory;
}

/** Colored pill naming what kind of change a recommendation suggests. */
export const RecommendationCategoryBadge = ({ category }: RecommendationCategoryBadgeProps) => {
  const color = CATEGORY_COLORS[category] ?? FALLBACK_COLOR;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        borderRadius: '3px',
        // Same hue at low alpha for the fill.
        backgroundColor: `${color}33`,
        color,
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
      }}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
};
