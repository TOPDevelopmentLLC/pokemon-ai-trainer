import { NavLink } from 'react-router-dom';

const linkStyle = (isActive: boolean): React.CSSProperties => ({
  padding: '8px 14px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  textDecoration: 'none',
  color: isActive ? '#e2e8f0' : '#64748b',
  backgroundColor: isActive ? '#1e293b' : 'transparent',
});

export const NavBar = ({ children }: { children?: React.ReactNode }) => {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
        borderBottom: '1px solid #1e293b',
        backgroundColor: '#0f172a',
        flexShrink: 0,
      }}
    >
      <NavLink to="/" style={({ isActive }) => linkStyle(isActive)} end>
        Builder
      </NavLink>
      <NavLink to="/search" style={({ isActive }) => linkStyle(isActive)}>
        Search
      </NavLink>
      <NavLink to="/teams" style={({ isActive }) => linkStyle(isActive)}>
        Saved Teams
      </NavLink>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </div>
    </nav>
  );
};
