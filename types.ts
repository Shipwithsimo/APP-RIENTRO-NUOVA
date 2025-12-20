export enum Screen {
  ONBOARDING = 'ONBOARDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  HOME = 'HOME',
  NEW_JOURNEY = 'NEW_JOURNEY',
  ACTIVE_JOURNEY = 'ACTIVE_JOURNEY',
  CONTACTS = 'CONTACTS',
  PROFILE = 'PROFILE'
}

export interface Contact {
  id: string;
  userId: string; // Owner of this contact
  name: string;
  role: string; // e.g., "Sister", "Partner"
  phone: string;
  avatar: string;
  isEmergency: boolean;
  createdAt: Date;
}

export interface Journey {
  id?: string;
  userId: string;
  destination: string;
  destinationCoords?: {
    lat: number;
    lng: number;
  };
  startCoords?: {
    lat: number;
    lng: number;
  };
  estimatedTime: number; // in minutes
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'sos' | 'cancelled';
  lastLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  createdAt: Date;
  settings?: UserSettings;
}

export interface UserSettings {
  shareLocationLive: boolean;
  autoCheckIn: boolean;
  darkMode: boolean;
  notificationsEnabled: boolean;
}

export interface SavedPlace {
  id: string;
  userId: string;
  name: string;
  address: string;
  coords: {
    lat: number;
    lng: number;
  };
  icon: 'home' | 'work' | 'gym' | 'other';
}

// Geolocation types
export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: Date;
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}
