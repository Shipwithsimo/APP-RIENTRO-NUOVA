import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { User, UserSettings } from '../types';

interface AuthContextType {
  currentUser: SupabaseUser | null;
  userData: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from Supabase
  const fetchUserData = async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        // User profile doesn't exist yet, create it
        if (fetchError.code === 'PGRST116') {
          return null; // Will be created on first login
        }
        throw fetchError;
      }

      if (data) {
        setUserData({
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          phone: data.phone || '',
          createdAt: new Date(data.created_at),
          settings: (data.settings as UserSettings) || {
            shareLocationLive: true,
            autoCheckIn: false,
            darkMode: false,
            notificationsEnabled: true
          }
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      // Supabase not configured, skip auth initialization
      console.warn('⚠️ Supabase not configured. App will work in demo mode.');
      setLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Auth initialization timeout. Continuing without session.');
      setLoading(false);
    }, 5000);

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeoutId);
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setCurrentUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id).finally(() => setLoading(false));
        } else {
          setUserData(null);
          setLoading(false);
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('Error initializing auth:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        await fetchUserData(data.user.id);
      }
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Errore nella creazione dell\'account');
      }

      // Generate avatar URL
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
      
      // Create user profile in public.users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name,
          email,
          avatar: avatarUrl,
          phone: phone || null,
          settings: {
            shareLocationLive: true,
            autoCheckIn: false,
            darkMode: false,
            notificationsEnabled: true
          }
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw - user is created in auth, profile can be created later
      }

      // Set user data immediately
      setUserData({
        id: authData.user.id,
        name,
        email,
        avatar: avatarUrl,
        phone: phone || '',
        createdAt: new Date(),
        settings: {
          shareLocationLive: true,
          autoCheckIn: false,
          darkMode: false,
          notificationsEnabled: true
        }
      });
    } catch (err: any) {
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
      setUserData(null);
    } catch (err: any) {
      setError('Errore durante il logout');
      throw err;
    }
  };

  const updateUserData = async (data: Partial<User>) => {
    if (!currentUser) return;
    
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      setUserData(prev => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error('Error updating user data:', err);
      throw err;
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!currentUser || !userData) return;
    
    try {
      const newSettings = { ...userData.settings, ...settings };
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          settings: newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      setUserData(prev => prev ? { ...prev, settings: newSettings as UserSettings } : null);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    currentUser,
    userData,
    session,
    loading,
    error,
    login,
    register,
    logout,
    updateUserData,
    updateSettings,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
