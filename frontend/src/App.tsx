import { TeamProvider } from './context/TeamContext';
import { TeamBuilderPage } from './pages/TeamBuilderPage';

function App() {
  return (
    <TeamProvider>
      <TeamBuilderPage />
    </TeamProvider>
  );
}

export default App;
