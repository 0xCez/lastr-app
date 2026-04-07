/**
 * Demo mode flag — single source of truth.
 *
 * When true, the app runs entirely in-memory with no real backend:
 * - Supabase calls return mock data
 * - RevenueCat is stubbed and grants the "premium" entitlement
 * - Auth is bypassed and a demo user is signed in
 *
 * This exists so the app can boot inside Expo Snack (snack.expo.dev)
 * for portfolio embedding.
 */
export const DEMO_MODE = true;
