// ===== APP ROOT =====
import { useState, useCallback } from 'react';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import PlantDetailScreen from './screens/PlantDetailScreen';
import FeedScreen from './screens/FeedScreen';
import GalleryScreen from './screens/GalleryScreen';
import ProfileScreen from './screens/ProfileScreen';
import AIAssistantScreen from './screens/AIAssistantScreen';
import AddPlantScreen from './screens/AddPlantScreen';
import AddLogScreen from './screens/AddLogScreen';

type Screen = 'home' | 'plants' | 'feed' | 'gallery' | 'genie' | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [logTargetPlant, setLogTargetPlant] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((k) => k + 1), []);

  const handlePlantSelect = useCallback((plantId: string) => {
    setSelectedPlant(plantId);
    setScreen('plants');
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPlant(null);
    setScreen('home');
  }, []);

  const handleNav = useCallback((key: string) => {
    if (key === 'plants' && !selectedPlant) {
      setScreen('home');
      return;
    }
    setScreen(key as Screen);
  }, [selectedPlant]);

  const handlePlantCreated = useCallback(() => {
    refresh();
    setShowAddPlant(false);
  }, [refresh]);

  const handleLogSaved = useCallback(() => {
    refresh();
    setShowAddLog(false);
    setLogTargetPlant(null);
  }, [refresh]);

  const openAddLog = useCallback((plantId?: string) => {
    setLogTargetPlant(plantId || selectedPlant);
    setShowAddLog(true);
  }, [selectedPlant]);

  let content;
  switch (screen) {
    case 'home':
      content = (
        <HomeScreen
          key={refreshToken}
          onPlantSelect={handlePlantSelect}
          onAddPlant={() => setShowAddPlant(true)}
        />
      );
      break;
    case 'plants':
      content = selectedPlant ? (
        <PlantDetailScreen
          key={refreshToken}
          plantId={selectedPlant}
          onBack={handleBack}
          onAddLog={() => openAddLog()}
        />
      ) : (
        <HomeScreen
          key={refreshToken}
          onPlantSelect={handlePlantSelect}
          onAddPlant={() => setShowAddPlant(true)}
        />
      );
      break;
    case 'feed':
      content = <FeedScreen key={refreshToken} onAddLog={() => openAddLog()} />;
      break;
    case 'gallery':
      content = <GalleryScreen />;
      break;
    case 'genie':
      content = <AIAssistantScreen />;
      break;
    case 'profile':
      content = <ProfileScreen />;
      break;
    default:
      content = (
        <HomeScreen
          key={refreshToken}
          onPlantSelect={handlePlantSelect}
          onAddPlant={() => setShowAddPlant(true)}
        />
      );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100svh', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {content}
      </div>
      <BottomNav current={screen} onNavigate={handleNav} />

      {showAddPlant && (
        <AddPlantScreen
          onClose={() => setShowAddPlant(false)}
          onCreated={handlePlantCreated}
        />
      )}

      {showAddLog && logTargetPlant && (
        <AddLogScreen
          plantId={logTargetPlant}
          onClose={() => {
            setShowAddLog(false);
            setLogTargetPlant(null);
          }}
          onSaved={handleLogSaved}
        />
      )}
    </div>
  );
}
