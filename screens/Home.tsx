import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Plus, Home as HomeIcon, Briefcase, Dumbbell, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Screen, Journey } from '../types';
import { MapBackground } from '../components/MapBackground';
import { useAuth } from '../context/AuthContext';
import { useJourneys, useSavedPlaces } from '../hooks/useSupabase';
import { useGeolocation, estimateWalkingTime } from '../hooks/useGeolocation';

interface Props {
  onNavigate: (screen: Screen) => void;
  onStartJourney: (journey: Journey) => void;
}

export const Home: React.FC<Props> = ({ onNavigate, onStartJourney }) => {
  const { userData } = useAuth();
  const { startJourney, activeJourney, loading: journeysLoading } = useJourneys();
  const { places } = useSavedPlaces();
  const { position, loading: geoLoading, error: geoError } = useGeolocation({ watch: false });
  
  const [destination, setDestination] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  // If there's an active journey, redirect to it
  useEffect(() => {
    if (activeJourney) {
      onStartJourney(activeJourney);
      onNavigate(Screen.ACTIVE_JOURNEY);
    }
  }, [activeJourney, onStartJourney, onNavigate]);

  const handleStart = async () => {
    if (!destination || !userData) return;
    
    setIsStarting(true);
    try {
      const journey: Omit<Journey, 'id' | 'userId'> = {
        destination,
        estimatedTime: 15, // Default estimate, could be calculated with a routing API
        startTime: new Date(),
        status: 'active',
        startCoords: position ? { lat: position.lat, lng: position.lng } : undefined
      };
      
      await startJourney(journey);
      onStartJourney(journey as Journey);
      onNavigate(Screen.ACTIVE_JOURNEY);
    } catch (err) {
      console.error('Error starting journey:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const quickDestinations = [
    { name: 'Casa', icon: HomeIcon, color: 'bg-indigo-50 text-indigo-700' },
    { name: 'Lavoro', icon: Briefcase, color: 'bg-gray-50 text-gray-600' },
    { name: 'Palestra', icon: Dumbbell, color: 'bg-gray-50 text-gray-600' }
  ];

  // Merge saved places with quick destinations
  const allDestinations = [
    ...quickDestinations,
    ...places.map(p => ({
      name: p.name,
      icon: MapPin,
      color: 'bg-emerald-50 text-emerald-600'
    }))
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 pt-12 flex justify-between items-center bg-gradient-to-b from-white/90 to-transparent pointer-events-none">
        <div 
          className="pointer-events-auto flex items-center gap-3 cursor-pointer" 
          onClick={() => onNavigate(Screen.PROFILE)}
        >
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden">
            <img 
              src={userData?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
              alt={userData?.name || 'User'} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Bentornata,</p>
            <p className="text-lg font-bold text-indigo-900 leading-none">
              {userData?.name || 'Utente'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate(Screen.CONTACTS)}
          className="pointer-events-auto w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-indigo-600 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Interactive Map Area */}
      <div className="flex-1 relative">
        <MapBackground userPosition={position} />
        
        {/* Location Status */}
        {geoLoading && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2 z-10">
            <Loader2 size={16} className="animate-spin text-indigo-600" />
            <span className="text-sm text-gray-600">Rilevamento posizione...</span>
          </div>
        )}
        
        {geoError && (
          <div className="absolute top-24 left-6 right-6 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl z-10">
            <p className="text-sm text-amber-700">{geoError}</p>
          </div>
        )}
        
        {/* Floating Start Card */}
        <div className="absolute bottom-4 left-6 right-6 bg-white rounded-[32px] p-6 shadow-2xl shadow-indigo-900/10 border border-white/50 z-20 animate-in slide-in-from-bottom-10 duration-500">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Dove stai andando?</h2>
          
          <Input 
            placeholder="Cerca destinazione..." 
            icon={<MapPin size={18} />} 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mb-4 bg-gray-50 border-transparent focus:bg-white"
          />

          <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {allDestinations.slice(0, 4).map((dest, index) => (
              <button 
                key={index}
                onClick={() => setDestination(dest.name)} 
                className={`flex items-center gap-2 px-4 py-2 ${
                  destination === dest.name ? 'bg-indigo-100 text-indigo-700' : dest.color
                } rounded-xl font-medium text-sm whitespace-nowrap hover:opacity-80 transition-all`}
              >
                <dest.icon size={16} /> {dest.name}
              </button>
            ))}
          </div>

          <Button 
            fullWidth 
            onClick={handleStart} 
            disabled={!destination || isStarting}
            isLoading={isStarting}
            className={!destination ? 'opacity-50' : ''}
          >
            <Navigation size={20} className="mr-2" /> Avvia Rientro
          </Button>
        </div>
      </div>
    </div>
  );
};
