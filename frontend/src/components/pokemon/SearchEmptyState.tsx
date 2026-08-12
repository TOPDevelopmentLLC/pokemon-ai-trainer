import { MIN_QUERY_LENGTH } from '../../hooks/usePokemonSearch';

interface SearchEmptyStateProps {
  query: string;
  resultCount: number;
}

/**
 * Placeholder shown when the result list is empty, distinguishing a query
 * too short to search from one that simply matched nothing.
 */
export const SearchEmptyState = ({ query, resultCount }: SearchEmptyStateProps) => {
  if (resultCount > 0) return null;

  const isTooShort = query.length < MIN_QUERY_LENGTH;

  return (
    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
      {isTooShort
        ? `Type at least ${MIN_QUERY_LENGTH} characters to search`
        : 'No Pokemon found'}
    </div>
  );
};
