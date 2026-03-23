interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export const StatBar = ({ label, value, max = 255, color }: StatBarProps) => {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = color ?? getStatColor(value);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
      <span style={{ width: '36px', textAlign: 'right', fontWeight: 600, color: '#94a3b8' }}>
        {label}
      </span>
      <span style={{ width: '32px', textAlign: 'right', fontWeight: 700, color: '#e2e8f0' }}>
        {value}
      </span>
      <div style={{
        flex: 1,
        height: '8px',
        borderRadius: '4px',
        backgroundColor: '#1e293b',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: '4px',
          backgroundColor: barColor,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

function getStatColor(value: number): string {
  if (value >= 150) return '#22c55e';
  if (value >= 100) return '#84cc16';
  if (value >= 75) return '#eab308';
  if (value >= 50) return '#f97316';
  return '#ef4444';
}
