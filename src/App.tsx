// ===== APP ROOT =====
import { useState } from 'react';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import PlantDetailScreen from './screens/PlantDetailScreen';
import FeedScreen from './screens/FeedScreen';
import GalleryScreen from './screens/GalleryScreen';
import ProfileScreen from './screens/ProfileScreen';

type Screen = 'home' | 'plants' | 'feed' | 'gallery' | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);

  // Handle plant selection — go to detail view
  const handlePlantSelect = (plantId: string) => {
    setSelectedPlant(plantId);
    setScreen('plants');
  };

  // Handle back from plant detail
  const handleBack = () => {
    setSelectedPlant(null);
    setScreen('home');
  };

  // Handle nav — if going to plants with no selection, default to home
  const handleNav = (key: Screen) => {
    if (key === 'plants' && !selectedPlant) {
      setScreen('home');
      return;
    }
    setScreen(key);
  };

  let content;
  switch (screen) {
    case 'home':
      content = <HomeScreen onPlantSelect={handlePlantSelect} />;
      break;
    case 'plants':
      content = selectedPlant
        ? <PlantDetailScreen plantId={selectedPlant} onBack={handleBack} />
        : <HomeScreen onPlantSelect={handlePlantSelect} />;
      break;
    case 'feed':
      content = <FeedScreen />;
      break;
    case 'gallery':
      content = <GalleryScreen />;
      break;
    case 'profile':
      content = <ProfileScreen />;
      break;
    default:
      content = <HomeScreen onPlantSelect={handlePlantSelect} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100svh', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {content}
      </div>
      <BottomNav current={screen} onNavigate={(s) => handleNav(s as Screen)} />
    </div>
  );
}
