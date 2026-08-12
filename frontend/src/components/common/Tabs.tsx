export interface TabDefinition {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabDefinition[];
  activeTab: string;
  onChange: (id: string) => void;
}

/** Horizontal tab bar with an underline on the active tab. */
export const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid #1e293b',
        paddingLeft: '16px',
        flexShrink: 0,
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${isActive ? '#38bdf8' : 'transparent'}`,
              color: isActive ? '#e2e8f0' : '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
