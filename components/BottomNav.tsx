import React from 'react';
import { Home, Users, User } from 'lucide-react';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { screen: Screen.HOME, icon: Home, label: 'Home' },
    { screen: Screen.CONTACTS, icon: Users, label: 'Contatti' },
    { screen: Screen.PROFILE, icon: User, label: 'Profilo' },
  ];

  // Don't show nav on onboarding, login, or active journey (focus mode)
  if ([Screen.ONBOARDING, Screen.LOGIN, Screen.ACTIVE_JOURNEY].includes(currentScreen)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-8 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] max-w-md mx-auto">
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
              isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};