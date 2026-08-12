interface ThreatsEmptyStateProps {
  /** Total threats before filtering, which distinguishes "none found" from "none match". */
  totalCount: number;
}

export const ThreatsEmptyState = ({ totalCount }: ThreatsEmptyStateProps) => {
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
      {totalCount === 0
        ? 'No significant threats found from common competitive sets.'
        : 'No threats match this filter.'}
    </div>
  );
};
