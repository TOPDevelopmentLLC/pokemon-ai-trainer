interface LabeledSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  /** Adds a leading blank option with this text, e.g. "None" for items. */
  emptyOption?: string;
}

/** A labeled dropdown over a list of string options. */
export const LabeledSelect = ({
  label,
  value,
  options,
  onChange,
  emptyOption,
}: LabeledSelectProps) => {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={selectStyle}>
        {emptyOption !== undefined && <option value="">{emptyOption}</option>}
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontSize: '13px',
};
