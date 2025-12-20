import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  console.warn('⚠️ The app will work but authentication features will be disabled.');
}

// Create client with fallback dummy values if credentials are missing
// This prevents crashes but auth features won't work
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Export a helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'Si è verificato un errore';
  
  // Supabase error messages
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Email o password non corretti',
    'Email not confirmed': 'Email non confermata. Controlla la tua casella email.',
    'User already registered': 'Questa email è già registrata',
    'Password should be at least 6 characters': 'La password deve avere almeno 6 caratteri',
    'Email rate limit exceeded': 'Troppi tentativi. Riprova più tardi',
    'Network request failed': 'Errore di connessione. Controlla la tua rete'
  };
  
  const message = error.message || error.toString();
  
  // Check for known error messages
  for (const [key, value] of Object.entries(errorMessages)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  return message || 'Si è verificato un errore. Riprova';
};

