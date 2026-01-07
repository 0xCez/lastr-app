// ============================================
// LASTR DATABASE TYPES
// Auto-generated types matching Supabase schema
// ============================================

export type PrimaryConcern = 'physical' | 'mental' | 'both' | 'unsure';
export type Severity = 'critical' | 'moderate' | 'low';
export type TaskType = 'exercise' | 'cognitive' | 'supplement';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing' | 'inactive';
export type SubscriptionProvider = 'apple' | 'google' | 'stripe';

// ============================================
// TABLE TYPES
// ============================================

export interface User {
  id: string;
  onboarding_completed: boolean;
  control_score: number;
  initial_score: number | null;
  potential_score: number;
  current_streak: number;
  longest_streak: number;
  start_date: string | null;
  target_date: string | null;
  last_check_in_date: string | null;
  primary_concern: PrimaryConcern | null;
  severity: Severity | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingResponse {
  id: string;
  user_id: string;
  age_range: string | null;
  relationship_status: string | null;
  duration_issue: string | null;
  current_duration: string | null;
  tried_before: string[];
  confidence_impact: number | null;
  frequency: string | null;
  primary_concern: string | null;
  symptoms: string[];
  goals: string[];
  analysis_score: number | null;
  created_at: string;
}

export interface ProgressLog {
  id: string;
  user_id: string;
  date: string;
  control_score: number | null;
  duration: string | null;
  perceived_control: number | null;
  confidence: number | null;
  notes: string | null;
  created_at: string;
}

export interface DailyCompletion {
  id: string;
  user_id: string;
  date: string;
  task_id: string;
  task_type: TaskType | null;
  completed_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan: string | null;
  provider: SubscriptionProvider | null;
  provider_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// INSERT TYPES (for creating new records)
// ============================================

export interface UserInsert {
  id: string;
  onboarding_completed?: boolean;
  control_score?: number;
  initial_score?: number;
  potential_score?: number;
  current_streak?: number;
  longest_streak?: number;
  start_date?: string;
  target_date?: string;
  last_check_in_date?: string;
  primary_concern?: PrimaryConcern;
  severity?: Severity;
}

export interface OnboardingResponseInsert {
  user_id: string;
  age_range?: string;
  relationship_status?: string;
  duration_issue?: string;
  current_duration?: string;
  tried_before?: string[];
  confidence_impact?: number;
  frequency?: string;
  primary_concern?: string;
  symptoms?: string[];
  goals?: string[];
  analysis_score?: number;
}

export interface ProgressLogInsert {
  user_id: string;
  date: string;
  control_score?: number;
  duration?: string;
  perceived_control?: number;
  confidence?: number;
  notes?: string;
}

export interface DailyCompletionInsert {
  user_id: string;
  date: string;
  task_id: string;
  task_type?: TaskType;
}

// ============================================
// UPDATE TYPES (for updating records)
// ============================================

export interface UserUpdate {
  onboarding_completed?: boolean;
  control_score?: number;
  initial_score?: number;
  potential_score?: number;
  current_streak?: number;
  longest_streak?: number;
  start_date?: string;
  target_date?: string;
  last_check_in_date?: string;
  primary_concern?: PrimaryConcern;
  severity?: Severity;
}

export interface OnboardingResponseUpdate {
  age_range?: string;
  relationship_status?: string;
  duration_issue?: string;
  current_duration?: string;
  tried_before?: string[];
  confidence_impact?: number;
  frequency?: string;
  primary_concern?: string;
  symptoms?: string[];
  goals?: string[];
  analysis_score?: number;
}

// ============================================
// SUPABASE DATABASE TYPE
// Use with: const supabase = createClient<Database>(...)
// ============================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      onboarding_responses: {
        Row: OnboardingResponse;
        Insert: OnboardingResponseInsert;
        Update: OnboardingResponseUpdate;
      };
      progress_logs: {
        Row: ProgressLog;
        Insert: ProgressLogInsert;
        Update: Partial<ProgressLog>;
      };
      daily_completions: {
        Row: DailyCompletion;
        Insert: DailyCompletionInsert;
        Update: Partial<DailyCompletion>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription> & { user_id: string };
        Update: Partial<Subscription>;
      };
    };
    Functions: {
      update_user_streak: {
        Args: { p_user_id: string };
        Returns: void;
      };
    };
  };
}
