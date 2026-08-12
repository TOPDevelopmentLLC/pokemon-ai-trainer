import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../hooks/useTeam';
import { getSpecies } from '../services/dex';
import { NavBar } from '../components/common/NavBar';
import { TypeBadge } from '../components/common/TypeBadge';
import { Sprites } from '@pkmn/img';
import type { SavedTeam } from '../types';

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
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(team.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const members = team.slots.filter(slot => slot !== null);

  const commitRename = () => {
    setIsEditing(false);
    if (draftName.trim() && draftName !== team.name) onRename(draftName);
    else setDraftName(team.name);
  };

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
        {isEditing ? (
          <input
            value={draftName}
            autoFocus
            onChange={e => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setDraftName(team.name);
                setIsEditing(false);
              }
            }}
            style={{
              flex: 1,
              padding: '5px 8px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#e2e8f0',
              fontSize: '15px',
              fontWeight: 700,
            }}
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            title="Rename"
            style={{
              flex: 1,
              textAlign: 'left',
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#e2e8f0',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'text',
            }}
          >
            {team.name}
            {isActive && (
              <span style={{ marginLeft: '8px', fontSize: '10px', color: '#38bdf8', fontWeight: 600 }}>
                OPEN
              </span>
            )}
          </button>
        )}

        <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
          {members.length}/6 &middot; {formatDate(team.updatedAt)}
        </span>
      </div>

      {/* Roster preview */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', minHeight: '44px', flexWrap: 'wrap' }}>
        {members.length === 0 && (
          <span style={{ fontSize: '12px', color: '#475569', alignSelf: 'center' }}>Empty team</span>
        )}
        {members.map(slot => {
          const species = getSpecies(slot.config.species);
          return (
            <div key={slot.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '52px' }}>
              <img
                src={Sprites.getPokemon(slot.config.species, { gen: 'ani' }).url}
                alt={slot.config.species}
                width={40}
                height={40}
              />
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {species?.types.map(t => (
                  <span key={t} style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}>
                    <TypeBadge type={t} />
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
