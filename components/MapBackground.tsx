import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoPosition } from '../types';

// Fix for default marker icons in Leaflet with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom user location icon
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #4F46E5;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.5);
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapBackgroundProps {
  userPosition?: GeoPosition | null;
  destinationPosition?: GeoPosition | null;
  showRoute?: boolean;
}

// Component to handle map center updates
const MapUpdater: React.FC<{ position: GeoPosition | null }> = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], 15, { animate: true });
    }
  }, [position, map]);
  
  return null;
};

export const MapBackground: React.FC<MapBackgroundProps> = ({ 
  userPosition, 
  destinationPosition,
  showRoute = false 
}) => {
  // Default center (Rome, Italy) if no position available
  const defaultCenter: [number, number] = [41.9028, 12.4964];
  const center: [number, number] = userPosition 
    ? [userPosition.lat, userPosition.lng] 
    : defaultCenter;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        {/* OpenStreetMap Tiles - Clean style */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Update map center when position changes */}
        <MapUpdater position={userPosition || null} />
        
        {/* User Location Marker */}
        {userPosition && (
          <>
            {/* Accuracy circle */}
            {userPosition.accuracy && (
              <Circle
                center={[userPosition.lat, userPosition.lng]}
                radius={userPosition.accuracy}
                pathOptions={{
                  color: '#4F46E5',
                  fillColor: '#4F46E5',
                  fillOpacity: 0.1,
                  weight: 1
                }}
              />
            )}
            
            {/* User marker */}
            <Marker 
              position={[userPosition.lat, userPosition.lng]} 
              icon={userIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-indigo-900">La tua posizione</p>
                  {userPosition.accuracy && (
                    <p className="text-xs text-gray-500">
                      Precisione: ~{Math.round(userPosition.accuracy)}m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}
        
        {/* Destination Marker */}
        {destinationPosition && (
          <Marker position={[destinationPosition.lat, destinationPosition.lng]}>
            <Popup>Destinazione</Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Gradient overlay at bottom for card */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

// Fallback component when position is not available
export const MapPlaceholder: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-100">
      {/* Simulation of map tiles/streets using CSS patterns */}
      <div className="absolute inset-0 opacity-10" 
           style={{
             backgroundImage: `radial-gradient(#4c5999 1px, transparent 1px), radial-gradient(#4c5999 1px, transparent 1px)`,
             backgroundSize: '20px 20px',
             backgroundPosition: '0 0, 10px 10px'
           }}>
      </div>
      
      {/* Abstract Streets */}
      <div className="absolute top-0 left-1/3 w-8 h-full bg-white/50 rotate-12 blur-sm"></div>
      <div className="absolute top-1/3 left-0 w-full h-8 bg-white/50 -rotate-6 blur-sm"></div>
      
      {/* POI Markers (Decorative) */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-indigo-300 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-indigo-300 rounded-full animate-pulse delay-700"></div>
      
      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
    </div>
  );
};
