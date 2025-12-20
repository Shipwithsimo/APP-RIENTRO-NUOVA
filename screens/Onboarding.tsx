import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { Screen } from '../types';

interface Props {
  onNavigate: (screen: Screen) => void;
}

export const Onboarding: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col items-center justify-between p-8 bg-gradient-to-br from-indigo-50 to-white">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-64 h-80 rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-200 mb-10 relative">
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=800" 
            alt="Safety" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl inline-block mb-2">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <p className="font-medium text-sm text-white/90">Cerchia Sicura</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-indigo-900 text-center mb-4 leading-tight">
          Condividi la posizione <br/> con chi ti ama
        </h1>
        <p className="text-gray-500 text-center max-w-xs leading-relaxed">
          RIENTRO ti assicura di non camminare mai da sola. Monitoraggio intelligente per la tua tranquillità.
        </p>
      </div>

      <div className="w-full space-y-4">
        <Button fullWidth onClick={() => onNavigate(Screen.LOGIN)}>
          Inizia
        </Button>
        <p className="text-center text-sm text-gray-500">
          Hai già un account? <button onClick={() => onNavigate(Screen.LOGIN)} className="text-indigo-600 font-semibold">Accedi</button>
        </p>
      </div>
    </div>
  );
};