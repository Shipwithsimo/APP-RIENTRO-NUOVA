import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface NotificationState {
  permission: NotificationPermission | 'unsupported';
  loading: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    loading: true,
    error: null
  });

  // Check current permission
  useEffect(() => {
    if ('Notification' in window) {
      setState(prev => ({
        ...prev,
        permission: Notification.permission,
        loading: false
      }));
    } else {
      setState(prev => ({
        ...prev,
        permission: 'unsupported',
        loading: false,
        error: 'Push notifications non supportate'
      }));
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // In a real app, you would register for push notifications here
        // For now, we just store the permission status
        
        setState({
          permission: 'granted',
          loading: false,
          error: null
        });

        return true;
      } else {
        setState(prev => ({
          ...prev,
          permission,
          loading: false,
          error: permission === 'denied' 
            ? 'Permesso notifiche negato. Abilitalo nelle impostazioni del browser.'
            : null
        }));
        return false;
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Errore nella richiesta del permesso'
      }));
      return false;
    }
  }, []);

  // Send local notification (for immediate alerts)
  const sendLocalNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'rientro-local',
      ...options
    });
  }, []);

  // Send SOS alert to emergency contacts
  const sendSOSAlert = useCallback(async (journeyId: string, location: { lat: number; lng: number }) => {
    // In a real app, this would:
    // 1. Fetch emergency contacts from Supabase
    // 2. Send push notifications via a backend service (e.g., OneSignal, Pusher, or Supabase Edge Functions)
    // 3. Optionally send SMS via Twilio or similar
    
    console.log('SOS Alert triggered for journey:', journeyId, 'at location:', location);
    
    // For now, send a local notification
    sendLocalNotification(
      '🚨 SOS ATTIVATO',
      'Allarme di emergenza inviato ai tuoi contatti fidati.',
      { requireInteraction: true }
    );
    
    // Here you would typically:
    // - Call a Supabase Edge Function to send notifications
    // - Or use a service like OneSignal, Pusher, etc.
    // Example: await supabase.functions.invoke('send-sos', { body: { journeyId, location } });
  }, [sendLocalNotification]);

  // Send arrival notification
  const sendArrivalNotification = useCallback(() => {
    sendLocalNotification(
      '✅ Sei arrivata!',
      'Complimenti! Hai completato il tuo viaggio in sicurezza.'
    );
  }, [sendLocalNotification]);

  return {
    ...state,
    requestPermission,
    sendLocalNotification,
    sendSOSAlert,
    sendArrivalNotification,
    isSupported: state.permission !== 'unsupported'
  };
};
