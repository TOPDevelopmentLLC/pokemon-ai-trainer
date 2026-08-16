import { useState } from 'react';
import { useTeam } from '@hooks/useTeam';
import { DEFAULT_TEAM_NAME } from '@app-types';
import { InlineEditableName } from '@components/common/InlineEditableName';

/**
 * Shows the open team's name and lets it be renamed inline.
 * When nothing is open, offers to save the working team under a name —
 * after which edits auto-save to it.
 */
export const TeamNameBar = () => {
  const { team, activeTeam, saveCurrentTeam, renameTeam } = useTeam();
  const [isNamingNew, setIsNamingNew] = useState(false);
  const [draftName, setDraftName] = useState('');

  const isEmpty = team.every(slot => slot === null);

  // An unsaved team has no name to edit yet, so naming it is a separate flow
  // from renaming one that already exists.
  if (isNamingNew) {
    const commit = () => {
      saveCurrentTeam(draftName.trim() || DEFAULT_TEAM_NAME);
      setIsNamingNew(false);
    };

    return (
      <input
        value={draftName}
        autoFocus
        placeholder={DEFAULT_TEAM_NAME}
        aria-label="Team name"
        onChange={e => setDraftName(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setIsNamingNew(false);
        }}
        style={{
          padding: '5px 10px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '6px',
          color: '#e2e8f0',
          fontSize: '13px',
          fontWeight: 600,
          width: '180px',
          boxSizing: 'border-box',
        }}
      />
    );
  }

  if (activeTeam) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>SAVED</span>
        <InlineEditableName
          value={activeTeam.name}
          fallback={DEFAULT_TEAM_NAME}
          title="Rename team"
          onCommit={name => renameTeam(activeTeam.id, name)}
          inputStyle={{ width: '180px' }}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        setDraftName(DEFAULT_TEAM_NAME);
        setIsNamingNew(true);
      }}
      disabled={isEmpty}
      title={isEmpty ? 'Add a Pokemon before saving' : 'Save this team'}
      style={{
        padding: '6px 12px',
        backgroundColor: isEmpty ? 'transparent' : '#0369a1',
        border: `1px solid ${isEmpty ? '#334155' : '#0284c7'}`,
        borderRadius: '6px',
        color: isEmpty ? '#475569' : '#e0f2fe',
        fontSize: '12px',
        fontWeight: 600,
        cursor: isEmpty ? 'not-allowed' : 'pointer',
      }}
    >
      Save Team
    </button>
  );
};
