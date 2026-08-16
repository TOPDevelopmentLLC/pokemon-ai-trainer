import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TeamProvider } from '@context/TeamContext';
import { TeamBuilderPage } from '@pages/TeamBuilderPage';
import { SavedTeamsPage } from '@pages/SavedTeamsPage';
import { StorageWarning } from '@components/common/StorageWarning';

function App() {
  return (
    <BrowserRouter>
      <TeamProvider>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: '#020617',
            color: '#e2e8f0',
          }}
        >
          <StorageWarning />
          <Routes>
            <Route path="/" element={<TeamBuilderPage />} />
            <Route path="/teams" element={<SavedTeamsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </TeamProvider>
    </BrowserRouter>
  );
}

export default App;
