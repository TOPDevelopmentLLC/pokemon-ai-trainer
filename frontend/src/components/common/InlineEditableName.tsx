import { useState } from 'react';
import { resolveCommittedName } from './resolve-committed-name';

interface InlineEditableNameProps {
  value: string;
  onCommit: (value: string) => void;
  /** Used when the field is submitted empty. */
  fallback: string;
  placeholder?: string;
  /** Style for the read-only button that opens the editor. */
  displayStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  title?: string;
  /** Rendered after the name when not editing, e.g. a status badge. */
  children?: React.ReactNode;
}

/**
 * A name that turns into a text field when clicked.
 * Enter and blur commit; Escape reverts. Empty input commits `fallback`
 * rather than an unnamed entity.
 */
export const InlineEditableName = ({
  value,
  onCommit,
  fallback,
  placeholder,
  displayStyle,
  inputStyle,
  title = 'Rename',
  children,
}: InlineEditableNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const beginEditing = () => {
    setDraft(value);
    setIsEditing(true);
  };

  const commit = () => {
    setIsEditing(false);
    const next = resolveCommittedName(draft, value, fallback);
    if (next !== null) onCommit(next);
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        value={draft}
        autoFocus
        placeholder={placeholder ?? fallback}
        aria-label={title}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') cancel();
        }}
        style={{
          padding: '5px 10px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '6px',
          color: '#e2e8f0',
          fontSize: '13px',
          fontWeight: 600,
          boxSizing: 'border-box',
          ...inputStyle,
        }}
      />
    );
  }

  return (
    <button
      onClick={beginEditing}
      title={title}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        color: '#e2e8f0',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'text',
        textAlign: 'left',
        ...displayStyle,
      }}
    >
      {value}
      {children}
    </button>
  );
};
