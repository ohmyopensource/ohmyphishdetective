import { useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { MainMenu } from './components/screens/MainMenu';
import { AboutScreen } from './components/screens/AboutScreen';
import { AnalyzeScreen } from './components/screens/AnalyzeScreen';

type Screen = 'menu' | 'analyze' | 'reports' | 'settings' | 'about';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  async function handleExit() {
    await getCurrentWindow().close();
  }

  if (screen === 'about') {
    return <AboutScreen onBack={() => setScreen('menu')} />;
  }

  if (screen === 'analyze') {
    return <AnalyzeScreen onBack={() => setScreen('menu')} />;
  }

  return (
    <MainMenu onNavigate={(target) => setScreen(target)} onExit={handleExit} />
  );
}

export default App;
