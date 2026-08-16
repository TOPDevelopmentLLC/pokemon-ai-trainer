import { useTeam } from '@hooks/useTeam';

/**
 * Surfaced when a write to localStorage fails (quota exceeded, storage
 * disabled). Silent failure here would look like working auto-save while
 * quietly losing every edit.
 */
export const StorageWarning = () => {
  const { storageError } = useTeam();
  if (!storageError) return null;

  return (
    <div
      role="alert"
      style={{
        padding: '8px 16px',
        backgroundColor: '#7f1d1d',
        color: '#fecaca',
        fontSize: '12px',
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      Changes could not be saved — browser storage is full or unavailable. Recent edits will be
      lost when you close this tab.
    </div>
  );
};
