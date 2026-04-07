/**
 * Seed data for DEMO_MODE.
 *
 * Used by the in-memory Supabase mock and the demo bootstrap so the
 * portfolio demo opens on a realistic, mid-program state instead of an
 * empty account.
 */
import type { User, ProgressLog, DailyCompletion, Subscription } from '@/types/database';

const now = new Date();
const isoDate = (offsetDays: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEMO_USER_ID = 'demo-user';
export const DEMO_USER_EMAIL = 'demo@lastr.app';

/** Fake Supabase auth user — shape matches @supabase/supabase-js User. */
export const mockAuthUser = {
  id: DEMO_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: DEMO_USER_EMAIL,
  email_confirmed_at: now.toISOString(),
  phone: '',
  confirmed_at: now.toISOString(),
  last_sign_in_at: now.toISOString(),
  app_metadata: { provider: 'demo', providers: ['demo'] },
  user_metadata: { full_name: 'Demo User' },
  identities: [],
  created_at: isoDate(-30) + 'T00:00:00.000Z',
  updated_at: now.toISOString(),
};

/** Fake session — shape matches @supabase/supabase-js Session. */
export const mockSession = {
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockAuthUser,
};

export const mockUser: User = {
  id: DEMO_USER_ID,
  onboarding_completed: true,
  control_score: 72,
  initial_score: 45,
  potential_score: 96,
  current_streak: 7,
  longest_streak: 12,
  start_date: isoDate(-7),
  target_date: isoDate(83),
  last_check_in_date: isoDate(-1),
  primary_concern: 'both',
  severity: 'moderate',
  created_at: isoDate(-30) + 'T00:00:00.000Z',
  updated_at: now.toISOString(),
};

/** Days 1–7 of the 90-day program marked complete. */
export const mockDailyCompletions: DailyCompletion[] = Array.from({ length: 7 }).flatMap(
  (_, dayIdx) => {
    const date = isoDate(-(7 - dayIdx));
    return [
      {
        id: `dc-${dayIdx}-kegel`,
        user_id: DEMO_USER_ID,
        date,
        task_id: 'kegel-basic',
        task_type: 'exercise' as const,
        completed_at: `${date}T08:30:00.000Z`,
      },
      {
        id: `dc-${dayIdx}-breathing`,
        user_id: DEMO_USER_ID,
        date,
        task_id: 'breathing-448',
        task_type: 'cognitive' as const,
        completed_at: `${date}T08:35:00.000Z`,
      },
    ];
  }
);

export const mockProgressLogs: ProgressLog[] = [
  {
    id: 'pl-1',
    user_id: DEMO_USER_ID,
    date: isoDate(-7),
    control_score: 48,
    duration: '1-2',
    perceived_control: 4,
    confidence: 5,
    notes: null,
    created_at: isoDate(-7) + 'T09:00:00.000Z',
  },
  {
    id: 'pl-2',
    user_id: DEMO_USER_ID,
    date: isoDate(-1),
    control_score: 72,
    duration: '5-10',
    perceived_control: 7,
    confidence: 7,
    notes: null,
    created_at: isoDate(-1) + 'T09:00:00.000Z',
  },
];

export const mockSubscription: Subscription = {
  id: 'sub-demo',
  user_id: DEMO_USER_ID,
  status: 'active',
  plan: 'annual',
  provider: 'apple',
  provider_subscription_id: 'demo-sub-id',
  current_period_start: isoDate(-7) + 'T00:00:00.000Z',
  current_period_end: isoDate(358) + 'T00:00:00.000Z',
  created_at: isoDate(-7) + 'T00:00:00.000Z',
  updated_at: now.toISOString(),
};

/** Initial in-memory table store, keyed by table name. */
export const mockTables: Record<string, any[]> = {
  users: [mockUser],
  onboarding_responses: [],
  progress_logs: mockProgressLogs,
  daily_completions: mockDailyCompletions,
  subscriptions: [mockSubscription],
};
