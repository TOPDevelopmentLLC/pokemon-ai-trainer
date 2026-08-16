import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '@hooks/useTeam';
import { NavBar } from '@components/common/NavBar';
import { InlineEditableName } from '@components/common/InlineEditableName';
import { TeamRosterPreview } from '@components/pokemon/TeamRosterPreview';
import { DEFAULT_TEAM_NAME, type SavedTeam } from '@app-types';

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'unknown';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

interface TeamCardProps {
  team: SavedTeam;
  isActive: boolean;
  onOpen: () => void;
  onRename: (name: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const TeamCard = ({ team, isActive, onOpen, onRename, onDuplicate, onDelete }: TeamCardProps) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const members = team.slots.filter(slot => slot !== null);

  return (
    <div
      style={{
        padding: '14px',
        backgroundColor: '#0f172a',
        border: `1px solid ${isActive ? '#38bdf8' : '#1e293b'}`,
        borderRadius: '10px',
        marginBottom: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <InlineEditableName
          value={team.name}
          fallback={DEFAULT_TEAM_NAME}
          onCommit={onRename}
          displayStyle={{ flex: 1, fontSize: '15px' }}
          inputStyle={{ flex: 1, fontSize: '15px', fontWeight: 700 }}
        >
          {isActive && (
            <span
              style={{ marginLeft: '8px', fontSize: '10px', color: '#38bdf8', fontWeight: 600 }}
            >
              OPEN
            </span>
          )}
        </InlineEditableName>

        <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
          {members.length}/6 &middot; {formatDate(team.updatedAt)}
        </span>
      </div>

      <TeamRosterPreview members={members} />

      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={onOpen} style={primaryButtonStyle}>
          {isActive ? 'Continue Editing' : 'Open'}
        </button>
        <button onClick={onDuplicate} style={secondaryButtonStyle}>
          Duplicate
        </button>
        {confirmDelete ? (
          <>
            <button onClick={onDelete} style={{ ...secondaryButtonStyle, color: '#fca5a5', borderColor: '#7f1d1d' }}>
              Confirm Delete
            </button>
            <button onClick={() => setConfirmDelete(false)} style={secondaryButtonStyle}>
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setConfirmDelete(true)} style={{ ...secondaryButtonStyle, color: '#94a3b8' }}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export const SavedTeamsPage = () => {
  const { savedTeams, activeTeamId, loadTeam, renameTeam, deleteTeam, duplicateTeam, startNewTeam } =
    useTeam();
  const navigate = useNavigate();

  const openTeam = (id: string) => {
    loadTeam(id);
    navigate('/');
  };

  const createTeam = () => {
    startNewTeam();
    navigate('/');
  };

  return (
    <>
      <NavBar>
        <button onClick={createTeam} style={primaryButtonStyle}>
          + New Team
        </button>
      </NavBar>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700 }}>Saved Teams</h2>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>
            {savedTeams.length === 0
              ? 'No teams saved yet.'
              : `${savedTeams.length} team${savedTeams.length === 1 ? '' : 's'}. Changes to an open team save automatically.`}
          </p>

          {savedTeams.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#475569',
                border: '1px dashed #1e293b',
                borderRadius: '10px',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>&#x1F4C1;</div>
              <p style={{ margin: '0 0 16px', fontSize: '14px' }}>
                Build a team and save it to see it here.
              </p>
              <button onClick={createTeam} style={primaryButtonStyle}>
                Build a Team
              </button>
            </div>
          ) : (
            savedTeams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                isActive={team.id === activeTeamId}
                onOpen={() => openTeam(team.id)}
                onRename={name => renameTeam(team.id, name)}
                onDuplicate={() => duplicateTeam(team.id)}
                onDelete={() => deleteTeam(team.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: '#0369a1',
  border: '1px solid #0284c7',
  borderRadius: '6px',
  color: '#e0f2fe',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: 'transparent',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};
