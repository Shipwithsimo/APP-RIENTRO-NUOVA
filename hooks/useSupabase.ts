import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Contact, Journey, SavedPlace } from '../types';
import { useAuth } from '../context/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

// ==================== CONTACTS ====================

export const useContacts = () => {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setContacts([]);
      setLoading(false);
      return;
    }

    // Fetch initial contacts
    const fetchContacts = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const contactsList: Contact[] = (data || []).map(item => ({
          id: item.id,
          userId: item.user_id,
          name: item.name,
          role: item.role,
          phone: item.phone,
          avatar: item.avatar,
          isEmergency: item.is_emergency,
          createdAt: new Date(item.created_at)
        }));

        setContacts(contactsList);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching contacts:', err);
        setError('Errore nel caricamento dei contatti');
        setLoading(false);
      }
    };

    fetchContacts();

    // Subscribe to realtime changes
    const channel: RealtimeChannel = supabase
      .channel(`contacts:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newContact: Contact = {
              id: payload.new.id,
              userId: payload.new.user_id,
              name: payload.new.name,
              role: payload.new.role,
              phone: payload.new.phone,
              avatar: payload.new.avatar,
              isEmergency: payload.new.is_emergency,
              createdAt: new Date(payload.new.created_at)
            };
            setContacts(prev => [newContact, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setContacts(prev =>
              prev.map(contact =>
                contact.id === payload.new.id
                  ? {
                      ...contact,
                      name: payload.new.name,
                      role: payload.new.role,
                      phone: payload.new.phone,
                      avatar: payload.new.avatar,
                      isEmergency: payload.new.is_emergency
                    }
                  : contact
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setContacts(prev => prev.filter(contact => contact.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const addContact = async (contact: Omit<Contact, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const { data, error: insertError } = await supabase
        .from('contacts')
        .insert({
          user_id: currentUser.id,
          name: contact.name,
          role: contact.role,
          phone: contact.phone,
          avatar: contact.avatar,
          is_emergency: contact.isEmergency
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data.id;
    } catch (err) {
      console.error('Error adding contact:', err);
      throw new Error('Errore nell\'aggiunta del contatto');
    }
  };

  const updateContact = async (id: string, data: Partial<Contact>) => {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.role) updateData.role = data.role;
      if (data.phone) updateData.phone = data.phone;
      if (data.avatar) updateData.avatar = data.avatar;
      if (data.isEmergency !== undefined) updateData.is_emergency = data.isEmergency;

      const { error: updateError } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating contact:', err);
      throw new Error('Errore nell\'aggiornamento del contatto');
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error deleting contact:', err);
      throw new Error('Errore nell\'eliminazione del contatto');
    }
  };

  return { contacts, loading, error, addContact, updateContact, deleteContact };
};

// ==================== JOURNEYS ====================

export const useJourneys = () => {
  const { currentUser } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setJourneys([]);
      setActiveJourney(null);
      setLoading(false);
      return;
    }

    // Fetch initial journeys
    const fetchJourneys = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('journeys')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('start_time', { ascending: false });

        if (fetchError) throw fetchError;

        const journeysList: Journey[] = (data || []).map(item => ({
          id: item.id,
          userId: item.user_id,
          destination: item.destination,
          destinationCoords: item.destination_coords as { lat: number; lng: number } | undefined,
          startCoords: item.start_coords as { lat: number; lng: number } | undefined,
          estimatedTime: item.estimated_time,
          startTime: new Date(item.start_time),
          endTime: item.end_time ? new Date(item.end_time) : undefined,
          status: item.status as Journey['status'],
          lastLocation: item.last_location
            ? {
                ...(item.last_location as { lat: number; lng: number; timestamp: string }),
                timestamp: new Date((item.last_location as any).timestamp)
              }
            : undefined
        }));

        setJourneys(journeysList);

        // Find active journey
        const active = journeysList.find(j => j.status === 'active');
        setActiveJourney(active || null);

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching journeys:', err);
        setError('Errore nel caricamento dei viaggi');
        setLoading(false);
      }
    };

    fetchJourneys();

    // Subscribe to realtime changes
    const channel: RealtimeChannel = supabase
      .channel(`journeys:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journeys',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const journey: Journey = {
              id: payload.new.id,
              userId: payload.new.user_id,
              destination: payload.new.destination,
              destinationCoords: payload.new.destination_coords as { lat: number; lng: number } | undefined,
              startCoords: payload.new.start_coords as { lat: number; lng: number } | undefined,
              estimatedTime: payload.new.estimated_time,
              startTime: new Date(payload.new.start_time),
              endTime: payload.new.end_time ? new Date(payload.new.end_time) : undefined,
              status: payload.new.status as Journey['status'],
              lastLocation: payload.new.last_location
                ? {
                    ...(payload.new.last_location as { lat: number; lng: number; timestamp: string }),
                    timestamp: new Date((payload.new.last_location as any).timestamp)
                  }
                : undefined
            };

            if (payload.eventType === 'INSERT') {
              setJourneys(prev => [journey, ...prev]);
            } else {
              setJourneys(prev =>
                prev.map(j => (j.id === journey.id ? journey : j))
              );
            }

            // Update active journey
            if (journey.status === 'active') {
              setActiveJourney(journey);
            } else {
              setActiveJourney(prev => (prev?.id === journey.id ? null : prev));
            }
          } else if (payload.eventType === 'DELETE') {
            setJourneys(prev => prev.filter(j => j.id !== payload.old.id));
            setActiveJourney(prev => (prev?.id === payload.old.id ? null : prev));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const startJourney = async (journey: Omit<Journey, 'id' | 'userId'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const { data, error: insertError } = await supabase
        .from('journeys')
        .insert({
          user_id: currentUser.id,
          destination: journey.destination,
          destination_coords: journey.destinationCoords || null,
          start_coords: journey.startCoords || null,
          estimated_time: journey.estimatedTime,
          start_time: journey.startTime.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data.id;
    } catch (err) {
      console.error('Error starting journey:', err);
      throw new Error('Errore nell\'avvio del viaggio');
    }
  };

  const updateJourneyLocation = async (journeyId: string, location: { lat: number; lng: number }) => {
    try {
      const { error: updateError } = await supabase
        .from('journeys')
        .update({
          last_location: {
            ...location,
            timestamp: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', journeyId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating journey location:', err);
    }
  };

  const completeJourney = async (journeyId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('journeys')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', journeyId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error completing journey:', err);
      throw new Error('Errore nel completamento del viaggio');
    }
  };

  const triggerSOS = async (journeyId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('journeys')
        .update({
          status: 'sos',
          updated_at: new Date().toISOString()
        })
        .eq('id', journeyId);

      if (updateError) throw updateError;
      // Here you would also trigger notifications to emergency contacts
    } catch (err) {
      console.error('Error triggering SOS:', err);
      throw new Error('Errore nell\'invio dell\'SOS');
    }
  };

  const cancelJourney = async (journeyId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('journeys')
        .update({
          status: 'cancelled',
          end_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', journeyId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error cancelling journey:', err);
      throw new Error('Errore nell\'annullamento del viaggio');
    }
  };

  // Get statistics
  const getStats = () => {
    const completed = journeys.filter(j => j.status === 'completed').length;
    const total = journeys.length;
    const safePercentage = total > 0 ? Math.round((completed / total) * 100) : 100;

    return {
      totalJourneys: total,
      completedJourneys: completed,
      safePercentage
    };
  };

  return {
    journeys,
    activeJourney,
    loading,
    error,
    startJourney,
    updateJourneyLocation,
    completeJourney,
    triggerSOS,
    cancelJourney,
    getStats
  };
};

// ==================== SAVED PLACES ====================

export const useSavedPlaces = () => {
  const { currentUser } = useAuth();
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setPlaces([]);
      setLoading(false);
      return;
    }

    const fetchPlaces = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('saved_places')
          .select('*')
          .eq('user_id', currentUser.id);

        if (fetchError) throw fetchError;

        const placesList: SavedPlace[] = (data || []).map(item => ({
          id: item.id,
          userId: item.user_id,
          name: item.name,
          address: item.address,
          coords: item.coords as { lat: number; lng: number },
          icon: item.icon
        }));

        setPlaces(placesList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching places:', err);
        setLoading(false);
      }
    };

    fetchPlaces();

    // Subscribe to realtime changes
    const channel: RealtimeChannel = supabase
      .channel(`saved_places:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_places',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newPlace: SavedPlace = {
              id: payload.new.id,
              userId: payload.new.user_id,
              name: payload.new.name,
              address: payload.new.address,
              coords: payload.new.coords as { lat: number; lng: number },
              icon: payload.new.icon
            };
            setPlaces(prev => [...prev, newPlace]);
          } else if (payload.eventType === 'UPDATE') {
            setPlaces(prev =>
              prev.map(place =>
                place.id === payload.new.id
                  ? {
                      ...place,
                      name: payload.new.name,
                      address: payload.new.address,
                      coords: payload.new.coords as { lat: number; lng: number },
                      icon: payload.new.icon
                    }
                  : place
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setPlaces(prev => prev.filter(place => place.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const addPlace = async (place: Omit<SavedPlace, 'id' | 'userId'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const { data, error: insertError } = await supabase
        .from('saved_places')
        .insert({
          user_id: currentUser.id,
          name: place.name,
          address: place.address,
          coords: place.coords,
          icon: place.icon
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data.id;
    } catch (err) {
      console.error('Error adding place:', err);
      throw new Error('Errore nel salvataggio del luogo');
    }
  };

  const deletePlace = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('saved_places')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err) {
      console.error('Error deleting place:', err);
      throw new Error('Errore nell\'eliminazione del luogo');
    }
  };

  return { places, loading, addPlace, deletePlace };
};

