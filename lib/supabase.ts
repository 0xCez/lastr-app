import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (to be expanded)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          onboarding_completed: boolean;
          subscription_status: string;
          current_streak: number;
          longest_streak: number;
          control_score: number;
          potential_score: number;
          target_date: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      daily_tasks: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          task_id: string;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['daily_tasks']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['daily_tasks']['Insert']>;
      };
      progress_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          control_score: number;
          latency_time: number;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['progress_logs']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['progress_logs']['Insert']>;
      };
    };
  };
}
