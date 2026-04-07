import { createClient } from '@supabase/supabase-js';
import { getItem, setItem, deleteItem } from '@/lib/secure-store';
import { Database } from '@/types/database';
import { DEMO_MODE } from '@/lib/demo';
import { mockAuthUser, mockSession, mockTables } from '@/lib/mock-data';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Validate env vars in development (skip in demo — there is no real backend)
if (!DEMO_MODE && __DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '⚠️ Supabase env variables not loaded. Try restarting with: npx expo start -c'
  );
}

// Custom storage adapter routed through the secure-store shim so it works
// on native (expo-secure-store) and on web/Snack (AsyncStorage fallback).
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => getItem(key),
  setItem: (key: string, value: string) => setItem(key, value).then(() => undefined),
  removeItem: (key: string) => deleteItem(key).then(() => undefined),
};

// ---------------------------------------------------------------------------
// In-memory Supabase mock for DEMO_MODE.
//
// The real codebase only calls `supabase.auth.*` (verified via grep), but we
// also expose a chainable `from()` builder so any future read/insert call
// degrades gracefully instead of crashing the demo.
// ---------------------------------------------------------------------------
function createMockSupabase() {
  type AuthListener = (event: string, session: typeof mockSession | null) => void;
  const authListeners = new Set<AuthListener>();

  const auth = {
    getSession: async () => ({ data: { session: mockSession }, error: null }),
    getUser: async () => ({ data: { user: mockAuthUser }, error: null }),
    onAuthStateChange: (cb: AuthListener) => {
      authListeners.add(cb);
      // Fire SIGNED_IN immediately so consumers settle into the signed-in state.
      Promise.resolve().then(() => cb('SIGNED_IN', mockSession));
      return {
        data: {
          subscription: {
            id: 'demo-sub',
            callback: cb,
            unsubscribe: () => authListeners.delete(cb),
          },
        },
      };
    },
    signUp: async (_creds: { email: string; password: string }) => ({
      data: { user: mockAuthUser, session: mockSession },
      error: null,
    }),
    signInWithPassword: async (_creds: { email: string; password: string }) => ({
      data: { user: mockAuthUser, session: mockSession },
      error: null,
    }),
    signInWithIdToken: async (_args: { provider: string; token: string }) => ({
      data: { user: mockAuthUser, session: mockSession },
      error: null,
    }),
    signOut: async () => {
      authListeners.forEach((cb) => cb('SIGNED_OUT', null));
      return { error: null };
    },
  };

  // Minimal chainable query builder. Every terminal call resolves to
  // { data, error: null } where data is the table contents (or first row for
  // .single()). Mutations append/update the in-memory table.
  function from(table: string) {
    let rows: any[] = mockTables[table] ? [...mockTables[table]] : [];

    const builder: any = {
      select: (_cols?: string) => builder,
      eq: (col: string, val: any) => {
        rows = rows.filter((r) => r[col] === val);
        return builder;
      },
      neq: (col: string, val: any) => {
        rows = rows.filter((r) => r[col] !== val);
        return builder;
      },
      in: (col: string, vals: any[]) => {
        rows = rows.filter((r) => vals.includes(r[col]));
        return builder;
      },
      order: () => builder,
      limit: (n: number) => {
        rows = rows.slice(0, n);
        return builder;
      },
      single: async () => ({ data: rows[0] ?? null, error: null }),
      maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
      then: (resolve: (v: any) => void) =>
        resolve({ data: rows, error: null }),
      insert: async (payload: any) => {
        const items = Array.isArray(payload) ? payload : [payload];
        if (mockTables[table]) mockTables[table].push(...items);
        return { data: items, error: null };
      },
      update: async (patch: any) => {
        if (mockTables[table]) {
          mockTables[table] = mockTables[table].map((r) =>
            rows.includes(r) ? { ...r, ...patch } : r
          );
        }
        return { data: null, error: null };
      },
      delete: async () => {
        if (mockTables[table]) {
          mockTables[table] = mockTables[table].filter((r) => !rows.includes(r));
        }
        return { data: null, error: null };
      },
      upsert: async (payload: any) => {
        const items = Array.isArray(payload) ? payload : [payload];
        if (mockTables[table]) mockTables[table].push(...items);
        return { data: items, error: null };
      },
    };

    return builder;
  }

  return {
    auth,
    from,
    rpc: async (_fn: string, _args?: any) => ({ data: null, error: null }),
    storage: {
      from: (_bucket: string) => ({
        upload: async () => ({ data: null, error: null }),
        download: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: async () => ({ data: null, error: null }),
      }),
    },
  } as any;
}

export const supabase = DEMO_MODE
  ? (createMockSupabase() as ReturnType<typeof createClient<Database>>)
  : createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
