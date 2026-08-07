import { useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { MainMenu } from './components/screens/MainMenu';
import { AboutScreen } from './components/screens/AboutScreen';
import { AnalyzeScreen } from './components/screens/AnalyzeScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { PreferencesProvider } from './lib/preferences';
import type { BatchAnalysisResult } from './types/email';

type Screen = 'menu' | 'analyze' | 'reports' | 'settings' | 'about' | 'results';

function AppContent() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [batchResult, setBatchResult] = useState<BatchAnalysisResult | null>(
    null,
  );

  async function handleExit() {
    await getCurrentWindow().close();
  }

  if (screen === 'about')
    return <AboutScreen onBack={() => setScreen('menu')} />;
  if (screen === 'settings')
    return <SettingsScreen onBack={() => setScreen('menu')} />;

  if (screen === 'analyze') {
    return (
      <AnalyzeScreen
        onBack={() => setScreen('menu')}
        onAnalysisComplete={(result) => {
          setBatchResult(result);
          setScreen('results');
        }}
      />
    );
  }

  if (screen === 'reports') {
    return (
      <ReportsScreen
        onBack={() => setScreen('menu')}
        onOpenReport={(result) => {
          setBatchResult(result);
          setScreen('results');
        }}
      />
    );
  }

  if (screen === 'results' && batchResult) {
    return (
      <ResultsScreen
        result={batchResult}
        onBack={() => setScreen('menu')}
        onNewAnalysis={() => setScreen('analyze')}
      />
    );
  }

  return (
    <MainMenu onNavigate={(target) => setScreen(target)} onExit={handleExit} />
  );
}

function App() {
  return (
    <PreferencesProvider>
      <AppContent />
    </PreferencesProvider>
  );
}

export default App;
