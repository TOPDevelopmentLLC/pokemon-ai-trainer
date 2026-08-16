interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Focus on mount — the modal opens straight into typing. */
  autoFocus?: boolean;
}

/** The search field header of the Pokemon search modal. */
export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search Pokemon...',
  autoFocus = false,
}: SearchInputProps) => {
  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #1e293b' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        autoFocus={autoFocus}
        aria-label={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          color: '#e2e8f0',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};
