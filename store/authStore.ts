import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { signInWithApple, signOut as authSignOut } from '@/lib/auth';
import { DEMO_MODE } from '@/lib/demo';
import { mockAuthUser, mockSession } from '@/lib/mock-data';

// Track if listener has been set up (prevents multiple listeners)
let authListenerSetup = false;

interface AuthState {
  // State
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    // Prevent re-initialization
    if (get().isInitialized) return;

    // Demo: skip Supabase entirely and seed a fake signed-in session.
    if (DEMO_MODE) {
      set({
        session: mockSession as unknown as Session,
        user: mockAuthUser as unknown as User,
        isInitialized: true,
        isLoading: false,
      });
      return;
    }

    try {
      set({ isLoading: true });

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user ?? null,
        isInitialized: true,
        isLoading: false,
      });

      // Listen for auth changes (only once)
      if (!authListenerSetup) {
        authListenerSetup = true;
        supabase.auth.onAuthStateChange((_event, session) => {
          set({
            session,
            user: session?.user ?? null,
          });
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isInitialized: true, isLoading: false });
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true });

    const result = await signInWithApple();

    set({ isLoading: false });

    if (!result.success) {
      return { success: false, error: result.error?.message };
    }

    return { success: true };
  },

  signOut: async () => {
    set({ isLoading: true });

    const result = await authSignOut();

    if (!result.success) {
      set({ isLoading: false });
      return { success: false, error: result.error?.message };
    }

    set({
      session: null,
      user: null,
      isLoading: false,
    });

    return { success: true };
  },

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
    });
  },
}));
