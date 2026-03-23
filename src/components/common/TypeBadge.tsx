const TYPE_COLORS: Record<string, string> = {
  Normal: '#A8A77A', Fire: '#EE8130', Water: '#6390F0', Electric: '#F7D02C',
  Grass: '#7AC74C', Ice: '#96D9D6', Fighting: '#C22E28', Poison: '#A33EA1',
  Ground: '#E2BF65', Flying: '#A98FF3', Psychic: '#F95587', Bug: '#A6B91A',
  Rock: '#B6A136', Ghost: '#735797', Dragon: '#6F35FC', Dark: '#705746',
  Steel: '#B7B7CE', Fairy: '#D685AD',
};

interface TypeBadgeProps {
  type: string;
  multiplier?: number;
}

export const TypeBadge = ({ type, multiplier }: TypeBadgeProps) => {
  const bg = TYPE_COLORS[type] ?? '#777';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '4px',
        backgroundColor: bg,
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {type}
      {multiplier !== undefined && multiplier !== 1 && (
        <span style={{ fontSize: '10px', opacity: 0.9 }}>
          {multiplier}x
        </span>
      )}
    </span>
  );
};
