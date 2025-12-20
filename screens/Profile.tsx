import React, { useState } from 'react';
import { Settings, Bell, Shield, MapPin, LogOut, ChevronRight, Moon, Loader2 } from 'lucide-react';
import { Screen } from '../types';
import { useAuth } from '../context/AuthContext';
import { useJourneys, useContacts, useSavedPlaces } from '../hooks/useSupabase';
import { useNotifications } from '../hooks/useNotifications';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export const Profile: React.FC<Props> = ({ onNavigate }) => {
  const { userData, logout, updateSettings, loading: authLoading } = useAuth();
  const { getStats } = useJourneys();
  const { contacts } = useContacts();
  const { places } = useSavedPlaces();
  const { permission, requestPermission } = useNotifications();
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [darkMode, setDarkMode] = useState(userData?.settings?.darkMode ?? false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    userData?.settings?.notificationsEnabled ?? true
  );

  const stats = getStats();

  const handleLogout = async () => {
    if (!confirm('Sei sicura di voler uscire?')) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate(Screen.ONBOARDING);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleToggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    await updateSettings({ darkMode: newValue });
    // In a real app, you'd apply the dark mode theme here
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await updateSettings({ notificationsEnabled: newValue });
  };

  const menuItems = [
    { 
      icon: MapPin, 
      label: 'Luoghi Salvati', 
      value: places.length.toString(),
      onClick: () => {} // Could navigate to saved places screen
    },
    { 
      icon: Shield, 
      label: 'Impostazioni Sicurezza', 
      value: '',
      onClick: () => {}
    },
    { 
      icon: Bell, 
      label: 'Notifiche', 
      value: notificationsEnabled ? 'On' : 'Off',
      onClick: handleToggleNotifications,
      isToggle: true
    },
    { 
      icon: Moon, 
      label: 'Modalità Scura', 
      value: darkMode ? 'On' : 'Off',
      onClick: handleToggleDarkMode,
      isToggle: true
    },
    { 
      icon: Settings, 
      label: 'Generale', 
      value: '',
      onClick: () => {}
    },
  ];

  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Header Background */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-indigo-900 rounded-b-[40px] z-0"></div>

      <div className="relative z-10 flex flex-col h-full pt-12 px-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4">
            <img 
              src={userData?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
              alt={userData?.name || 'User'} 
              className="w-full h-full object-cover" 
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {userData?.name || 'Utente'}
          </h1>
          <p className="text-indigo-200 font-medium">
            {userData?.email || ''}
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-between mb-6">
          <div className="text-center flex-1 border-r border-gray-100">
            <p className="text-2xl font-bold text-indigo-600">{stats.totalJourneys}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Rientri</p>
          </div>
          <div className="text-center flex-1 border-r border-gray-100">
            <p className="text-2xl font-bold text-emerald-500">{stats.safePercentage}%</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Sicuri</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-indigo-900">{contacts.length}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Contatti</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 mb-24">
          {menuItems.map((item, index) => (
            <button 
              key={index}
              onClick={item.onClick}
              className="w-full p-4 flex items-center justify-between border-b border-gray-50 last:border-0 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <item.icon size={20} />
                </div>
                <span className="font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className={`text-sm ${item.isToggle && item.value === 'On' ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {item.value}
                  </span>
                )}
                <ChevronRight size={18} className="text-gray-300" />
              </div>
            </button>
          ))}
          
          <div className="p-4 mt-2">
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full p-3 flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogOut size={20} />
              )}
              {isLoggingOut ? 'Uscita...' : 'Esci'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
