import React, { useState, useEffect } from 'react';
import { Screen, Journey } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Onboarding } from './screens/Onboarding';
import { Login } from './screens/Login';
import { Register } from './screens/Register';
import { Home } from './screens/Home';
import { ActiveJourney } from './screens/ActiveJourney';
import { Contacts } from './screens/Contacts';
import { Profile } from './screens/Profile';
import { BottomNav } from './components/BottomNav';
import { Loader2 } from 'lucide-react';

// Inner app component that uses auth context
const AppContent: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.ONBOARDING);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);

  // Redirect based on auth state
  useEffect(() => {
    if (!authLoading) {
      if (currentUser) {
        // User is logged in, go to home (unless already in app)
        if (currentScreen === Screen.ONBOARDING || currentScreen === Screen.LOGIN || currentScreen === Screen.REGISTER) {
          setCurrentScreen(Screen.HOME);
        }
      } else {
        // User is logged out, go to onboarding
        if (currentScreen !== Screen.ONBOARDING && currentScreen !== Screen.LOGIN && currentScreen !== Screen.REGISTER) {
          setCurrentScreen(Screen.ONBOARDING);
        }
      }
    }
  }, [currentUser, authLoading, currentScreen]);

  const startJourney = (journey: Journey) => {
    setActiveJourney(journey);
    setCurrentScreen(Screen.ACTIVE_JOURNEY);
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
        <div className="w-full max-w-md h-[100dvh] bg-white sm:h-[844px] sm:rounded-[3rem] sm:border-[8px] sm:border-gray-900 relative shadow-2xl overflow-hidden flex items-center justify-center">
          <div className="text-center px-8">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
            <p className="text-gray-500 font-medium">Caricamento...</p>
            <p className="text-gray-400 text-sm mt-2">
              Se il caricamento non si completa, controlla la configurazione di Supabase
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine if bottom nav should be shown
  const showBottomNav = [Screen.HOME, Screen.CONTACTS, Screen.PROFILE].includes(currentScreen);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      {/* Mobile Device Frame Simulation */}
      <div className="w-full max-w-md h-[100dvh] bg-white sm:h-[844px] sm:rounded-[3rem] sm:border-[8px] sm:border-gray-900 relative shadow-2xl overflow-hidden">
        
        {/* Dynamic Screen Rendering */}
        <div className="h-full w-full overflow-hidden">
          {currentScreen === Screen.ONBOARDING && (
            <Onboarding onNavigate={setCurrentScreen} />
          )}
          {currentScreen === Screen.LOGIN && (
            <Login onNavigate={setCurrentScreen} />
          )}
          {currentScreen === Screen.REGISTER && (
            <Register onNavigate={setCurrentScreen} />
          )}
          {currentScreen === Screen.HOME && (
            <Home 
              onNavigate={setCurrentScreen} 
              onStartJourney={startJourney}
            />
          )}
          {currentScreen === Screen.ACTIVE_JOURNEY && (
            <ActiveJourney 
              journey={activeJourney} 
              onNavigate={setCurrentScreen} 
            />
          )}
          {currentScreen === Screen.CONTACTS && (
            <Contacts />
          )}
          {currentScreen === Screen.PROFILE && (
            <Profile onNavigate={setCurrentScreen} />
          )}
        </div>

        {/* Global Bottom Navigation */}
        {showBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        )}
        
      </div>
    </div>
  );
};

// Main App component with providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
