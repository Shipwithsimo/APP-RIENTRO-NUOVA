import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, ShieldCheck, Phone, X, Navigation, Timer, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Screen, Journey } from '../types';
import { MapBackground } from '../components/MapBackground';
import { useJourneys, useContacts } from '../hooks/useSupabase';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNotifications } from '../hooks/useNotifications';

interface Props {
  onNavigate: (screen: Screen) => void;
  journey: Journey | null;
}

export const ActiveJourney: React.FC<Props> = ({ onNavigate, journey }) => {
  const { activeJourney, completeJourney, triggerSOS, updateJourneyLocation, cancelJourney } = useJourneys();
  const { contacts } = useContacts();
  const { position, loading: geoLoading } = useGeolocation({ watch: true });
  const { sendSOSAlert, sendArrivalNotification, sendLocalNotification } = useNotifications();
  
  const currentJourney = activeJourney || journey;
  const [timeLeft, setTimeLeft] = useState(currentJourney ? currentJourney.estimatedTime * 60 : 600);
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [panicCountdown, setPanicCountdown] = useState(3);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Safety Check State (Anomaly Detection)
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [checkCountdown, setCheckCountdown] = useState(30);

  // Emergency contacts for quick call
  const emergencyContacts = contacts.filter(c => c.isEmergency);

  // Update location in Firestore periodically
  useEffect(() => {
    if (!currentJourney?.id || !position) return;
    
    const interval = setInterval(() => {
      updateJourneyLocation(currentJourney.id!, {
        lat: position.lat,
        lng: position.lng
      });
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [currentJourney?.id, position, updateJourneyLocation]);

  // Journey Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate Anomaly Check triggering (in real app, this would be based on GPS data analysis)
  useEffect(() => {
    // Only trigger if journey is active and we have position tracking
    if (!currentJourney || currentJourney.status !== 'active') return;
    
    const simulationTimer = setTimeout(() => {
      setShowSafetyCheck(true);
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      sendLocalNotification('⚠️ Controllo Sicurezza', 'Conferma che stai bene');
    }, 60000); // Check after 1 minute (for demo, was 8s)
    
    return () => clearTimeout(simulationTimer);
  }, [currentJourney, sendLocalNotification]);

  // Safety Check Countdown Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (showSafetyCheck && checkCountdown > 0) {
      interval = setInterval(() => {
        setCheckCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showSafetyCheck && checkCountdown === 0) {
      // Auto-escalate to Panic Mode if check is ignored
      setShowSafetyCheck(false);
      setIsPanicMode(true);
    }
    return () => clearInterval(interval);
  }, [showSafetyCheck, checkCountdown]);

  // Panic Button Logic
  useEffect(() => {
    let panicTimer: ReturnType<typeof setTimeout>;
    if (isPanicMode && panicCountdown > 0) {
      panicTimer = setTimeout(() => setPanicCountdown(p => p - 1), 1000);
    } else if (isPanicMode && panicCountdown === 0) {
      // Trigger SOS
      handleSOSTrigger();
    }
    return () => clearTimeout(panicTimer);
  }, [isPanicMode, panicCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePanicPress = () => {
    setIsPanicMode(true);
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
  };

  const handleCancelPanic = () => {
    setIsPanicMode(false);
    setPanicCountdown(3);
  };

  const handleSOSTrigger = async () => {
    if (!currentJourney?.id) return;
    
    try {
      await triggerSOS(currentJourney.id);
      
      if (position) {
        await sendSOSAlert(currentJourney.id, { lat: position.lat, lng: position.lng });
      }
      
      // In a real app, this would send SMS/notifications to all emergency contacts
      alert("🚨 ALLARME SOS INVIATO A TUTTI I CONTATTI DI EMERGENZA!");
    } catch (err) {
      console.error('Error triggering SOS:', err);
    } finally {
      setIsPanicMode(false);
      setPanicCountdown(3);
    }
  };

  const confirmSafety = () => {
    setShowSafetyCheck(false);
    setCheckCountdown(30);
    sendLocalNotification('✅ Tutto ok!', 'Continua il tuo viaggio in sicurezza');
  };

  const handleComplete = async () => {
    if (!currentJourney?.id) {
      onNavigate(Screen.HOME);
      return;
    }
    
    if (!confirm("Sei arrivata a destinazione?")) return;
    
    setIsCompleting(true);
    try {
      await completeJourney(currentJourney.id);
      sendArrivalNotification();
      onNavigate(Screen.HOME);
    } catch (err) {
      console.error('Error completing journey:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCallContact = (phone: string) => {
    window.open(`tel:${phone.replace(/\s/g, '')}`, '_self');
  };

  // If no active journey, show loading or redirect
  if (!currentJourney) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
          <p className="text-gray-500">Caricamento viaggio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative bg-slate-50">
      {/* Map View with real position */}
      <div className="absolute inset-0 z-0">
        <MapBackground 
          userPosition={position} 
          destinationPosition={currentJourney.destinationCoords}
          showRoute={true}
        />
        
        {/* User Marker Overlay (on top of Leaflet) */}
        {!position && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full absolute top-0 left-0 ${showSafetyCheck ? 'bg-amber-500/30 animate-ping' : 'bg-indigo-500/20 animate-ping'}`}></div>
              <div className={`w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center border-4 relative z-10 ${showSafetyCheck ? 'border-amber-500' : 'border-indigo-600'}`}>
                <Navigation size={24} className={`transform rotate-45 ${showSafetyCheck ? 'text-amber-500 fill-amber-500' : 'text-indigo-600 fill-indigo-600'}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Status Card */}
      <div className="relative z-10 p-6 pt-12">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-white/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentJourney.status === 'sos' 
                  ? 'bg-red-100 text-red-600' 
                  : showSafetyCheck 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-green-100 text-green-600'
              }`}>
                {currentJourney.status === 'sos' ? (
                  <AlertTriangle size={20} />
                ) : showSafetyCheck ? (
                  <Timer size={20} className="animate-pulse" />
                ) : (
                  <ShieldCheck size={20} />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Stato</p>
                <p className={`font-bold ${
                  currentJourney.status === 'sos' 
                    ? 'text-red-600' 
                    : showSafetyCheck 
                      ? 'text-amber-600' 
                      : 'text-indigo-900'
                }`}>
                  {currentJourney.status === 'sos' 
                    ? 'EMERGENZA' 
                    : showSafetyCheck 
                      ? 'Controllo...' 
                      : 'Monitorato'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-indigo-900">{formatTime(timeLeft)}</p>
              <p className="text-xs text-gray-400">Arrivo Stimato</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                currentJourney.status === 'sos' 
                  ? 'bg-red-500 animate-pulse' 
                  : showSafetyCheck 
                    ? 'bg-amber-500 animate-pulse' 
                    : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.max(10, 100 - (timeLeft / (currentJourney.estimatedTime * 60)) * 100)}%` }}
            ></div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-indigo-500" />
            <span>Verso: <strong>{currentJourney.destination}</strong></span>
          </div>
          
          {/* GPS Status */}
          {geoLoading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              <span>Acquisizione GPS...</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1"></div>

      {/* Overlays and Controls */}
      <div className="relative z-10 p-6 pb-10 flex flex-col gap-4">
        
        {/* Safety Check Overlay (Anomaly Detected) */}
        {showSafetyCheck && !isPanicMode && (
          <div className="absolute inset-x-4 bottom-4 bg-white rounded-3xl p-6 shadow-2xl shadow-amber-900/20 border border-amber-100 z-40 animate-in slide-in-from-bottom-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tutto ok?</h3>
                <p className="text-gray-500 text-sm">Abbiamo rilevato una sosta. Conferma che sei al sicuro.</p>
              </div>
              <div className="ml-auto text-2xl font-bold text-amber-500 font-mono">
                {checkCountdown}s
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handlePanicPress} className="flex-1 text-red-500 bg-red-50 hover:bg-red-100">
                Aiuto
              </Button>
              <Button variant="primary" onClick={confirmSafety} className="flex-1 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200">
                Sto bene
              </Button>
            </div>
          </div>
        )}

        {/* Panic Overlay */}
        {isPanicMode ? (
          <div className="absolute inset-0 bg-red-500/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-t-3xl p-8 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">
              <span className="text-5xl font-bold text-red-600">{panicCountdown}</span>
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">INVIO SOS</h2>
            <p className="text-white/80 mb-8">Avviso ai contatti di emergenza...</p>
            <Button variant="secondary" fullWidth onClick={handleCancelPanic} className="bg-white text-red-600 border-none">
              <X size={20} className="mr-2" /> Annulla Allarme
            </Button>
          </div>
        ) : null}

        <div className="flex gap-4">
          <button 
            onMouseDown={handlePanicPress}
            onTouchStart={handlePanicPress}
            className="flex-1 bg-red-500 hover:bg-red-600 active:scale-95 transition-all text-white rounded-3xl h-24 flex flex-col items-center justify-center shadow-lg shadow-red-200 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-red-600 to-transparent opacity-50"></div>
            <div className="relative z-10 flex flex-col items-center">
              <AlertTriangle size={28} className="mb-1" />
              <span className="font-bold tracking-wide">SOS</span>
              <span className="text-[10px] opacity-80">Premi 3s</span>
            </div>
          </button>

          <button 
            onClick={() => {
              if (emergencyContacts.length > 0) {
                handleCallContact(emergencyContacts[0].phone);
              } else {
                alert('Nessun contatto di emergenza configurato');
              }
            }}
            className="flex-1 bg-indigo-900 hover:bg-indigo-800 active:scale-95 transition-all text-white rounded-3xl h-24 flex flex-col items-center justify-center shadow-lg shadow-indigo-200 relative overflow-hidden"
          >
            <Phone size={24} className="mb-2 text-indigo-200" />
            <span className="font-medium text-sm">
              {emergencyContacts.length > 0 
                ? `Chiama ${emergencyContacts[0].name}` 
                : 'Chiama Contatto'}
            </span>
          </button>
        </div>

        <Button 
          variant="secondary" 
          fullWidth 
          onClick={handleComplete}
          isLoading={isCompleting}
          className="rounded-2xl border-indigo-100 text-indigo-900"
        >
          <ShieldCheck size={20} className="mr-2 text-emerald-500" />
          Sono al sicuro (Termina)
        </Button>
      </div>
    </div>
  );
};
