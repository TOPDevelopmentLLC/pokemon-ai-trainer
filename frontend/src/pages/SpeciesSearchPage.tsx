import { useTeam } from '@hooks/useTeam';
import { useSpeciesSearch } from '@hooks/useSpeciesSearch';
import { NavBar } from '@components/common/NavBar';
import { SpeciesSearchFilters } from '@components/pokemon/SpeciesSearchFilters';
import { SpeciesSearchRow } from '@components/pokemon/SpeciesSearchRow';

/** How many results to render at once, so a 298-row list stays responsive. */
const PAGE_SIZE = 60;

export const SpeciesSearchPage = () => {
  const { team, addPokemon } = useTeam();
  const { criteria, results, setName, setAbility, setSortStat, toggleType, reset } =
    useSpeciesSearch();

  const hasEmptySlot = team.some(slot => slot === null);
  const visible = results.slice(0, PAGE_SIZE);

  return (
    <>
      <NavBar />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700 }}>Search Pokemon</h2>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>
            Filter the Champions roster by name, type, or ability, and rank by any base stat.
          </p>

          <SpeciesSearchFilters
            criteria={criteria}
            resultCount={results.length}
            onNameChange={setName}
            onAbilityChange={setAbility}
            onSortStatChange={setSortStat}
            onToggleType={toggleType}
            onReset={reset}
          />

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {results.length === 0 ? (
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#475569',
                  border: '1px dashed #1e293b',
                  borderRadius: '10px',
                }}
              >
                <p style={{ margin: 0, fontSize: '14px' }}>No Pokemon match these filters.</p>
              </div>
            ) : (
              visible.map(result => (
                <SpeciesSearchRow
                  key={result.name}
                  result={result}
                  sortStat={criteria.sortStat}
                  canAdd={hasEmptySlot}
                  onAdd={() => addPokemon(result.name)}
                />
              ))
            )}
          </div>

          {results.length > visible.length && (
            <p
              style={{
                margin: '12px 0 0',
                fontSize: '12px',
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              Showing {visible.length} of {results.length}. Narrow your filters to see more.
            </p>
          )}
        </div>
      </div>
    </>
  );
};
