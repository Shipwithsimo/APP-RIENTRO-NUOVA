import { useState, useEffect, useCallback } from 'react';
import { GeoPosition } from '../types';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface GeolocationState {
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false
  } = options;

  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: true
  });

  const isNative = Capacitor.isNativePlatform();

  const handleSuccess = useCallback((position: { latitude: number; longitude: number; accuracy?: number; timestamp?: number }) => {
    setState({
      position: {
        lat: position.latitude,
        lng: position.longitude,
        accuracy: position.accuracy,
        timestamp: position.timestamp ? new Date(position.timestamp) : new Date()
      },
      error: null,
      loading: false
    });
  }, []);

  const handleError = useCallback((error: any) => {
    let errorMessage: string;
    
    if (isNative) {
      // Capacitor Geolocation errors
      if (error?.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Errore nella geolocalizzazione';
      }
    } else {
      // Browser Geolocation errors
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Permesso di geolocalizzazione negato. Abilita la posizione nelle impostazioni.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Posizione non disponibile. Controlla il GPS.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Timeout nella richiesta della posizione.';
          break;
        default:
          errorMessage = 'Errore sconosciuto nella geolocalizzazione.';
      }
    }
    
    setState({
      position: null,
      error: errorMessage,
      loading: false
    });
  }, [isNative]);

  const getCurrentPosition = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      if (isNative) {
        // Use Capacitor Geolocation API (better for mobile)
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy,
          timeout,
          maximumAge
        });

        handleSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      } else {
        // Use browser Geolocation API
        if (!navigator.geolocation) {
          setState({
            position: null,
            error: 'Geolocalizzazione non supportata dal browser.',
            loading: false
          });
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => handleSuccess({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }),
          handleError,
          { enableHighAccuracy, timeout, maximumAge }
        );
      }
    } catch (err: any) {
      handleError(err);
    }
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, isNative]);

  useEffect(() => {
    // Request permissions first (on native)
    if (isNative && watch) {
      Geolocation.requestPermissions().catch((err) => {
        console.warn('Permission request failed:', err);
      });
    }

    // Get initial position
    getCurrentPosition();

    // Set up watch if enabled
    let watchId: string | number | undefined;

    if (watch) {
      if (isNative) {
        // Use Capacitor watchPosition
        const watchIdPromise = Geolocation.watchPosition(
          {
            enableHighAccuracy,
            timeout,
            maximumAge
          },
          (position, err) => {
            if (err) {
              handleError(err);
            } else if (position) {
              handleSuccess({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: position.timestamp
              });
            }
          }
        );

        watchIdPromise.then(id => {
          watchId = id;
        });

        return () => {
          if (watchId) {
            Geolocation.clearWatch({ id: watchId });
          }
        };
      } else {
        // Use browser watchPosition
        if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(
            (position) => handleSuccess({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            }),
            handleError,
            { enableHighAccuracy, timeout, maximumAge }
          );
        }

        return () => {
          if (watchId !== undefined && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId as number);
          }
        };
      }
    }

    return () => {
      if (!isNative && watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId as number);
      }
    };
  }, [watch, enableHighAccuracy, timeout, maximumAge, getCurrentPosition, handleSuccess, handleError, isNative]);

  return {
    ...state,
    refresh: getCurrentPosition
  };
};

// Calculate distance between two points in km (Haversine formula)
export const calculateDistance = (
  point1: GeoPosition,
  point2: GeoPosition
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

// Estimate walking time in minutes (assuming 5 km/h average speed)
export const estimateWalkingTime = (distanceKm: number): number => {
  return Math.round((distanceKm / 5) * 60);
};
