import { useTeam } from '../context/TeamContext';
import { TeamPanel } from '../components/pokemon/TeamPanel';
import { ThreatAnalysisView } from '../components/pokemon/ThreatAnalysisView';

export const TeamBuilderPage = () => {
  const { selectedSlot, selectedSlotIndex, updateConfig, addPokemon } = useTeam();

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#020617', color: '#e2e8f0' }}>
      <TeamPanel />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {selectedSlot && selectedSlotIndex !== null ? (
          <ThreatAnalysisView
            config={selectedSlot.config}
            onChange={config => updateConfig(selectedSlotIndex, config)}
            onAddTeammate={species => addPokemon(species)}
          />
        ) : (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: '#475569',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              &#x1F50D;
            </div>
            <h2 style={{ margin: '0 0 8px', fontWeight: 600, color: '#64748b' }}>
              Select a Pokemon
            </h2>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Add a Pokemon to your team or click an existing one to see its threat analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
