-- ============================================
-- LASTR DATABASE SCHEMA
-- Simple, Efficient, Scalable
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- Extends Supabase auth.users with app-specific data
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Onboarding status
  onboarding_completed BOOLEAN DEFAULT FALSE,

  -- Control metrics
  control_score INTEGER DEFAULT 0 CHECK (control_score >= 0 AND control_score <= 100),
  initial_score INTEGER CHECK (initial_score >= 0 AND initial_score <= 100),
  potential_score INTEGER DEFAULT 96 CHECK (potential_score >= 0 AND potential_score <= 100),

  -- Streaks
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- Timeline
  start_date DATE,
  target_date DATE,
  last_check_in_date DATE,

  -- Personalization
  primary_concern TEXT CHECK (primary_concern IN ('physical', 'mental', 'both', 'unsure')),
  severity TEXT CHECK (severity IN ('critical', 'moderate', 'low')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. ONBOARDING_RESPONSES TABLE
-- All assessment data from onboarding flow
-- ============================================
CREATE TABLE public.onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Question responses
  age_range TEXT,
  relationship_status TEXT,
  duration_issue TEXT,
  current_duration TEXT,
  tried_before TEXT[] DEFAULT '{}',
  confidence_impact INTEGER CHECK (confidence_impact >= 1 AND confidence_impact <= 10),
  frequency TEXT,
  primary_concern TEXT,

  -- Multi-select responses
  symptoms TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',

  -- Calculated score
  analysis_score INTEGER CHECK (analysis_score >= 15 AND analysis_score <= 70),

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PROGRESS_LOGS TABLE
-- Weekly check-in data
-- ============================================
CREATE TABLE public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Check-in data
  date DATE NOT NULL,
  control_score INTEGER CHECK (control_score >= 0 AND control_score <= 100),
  duration TEXT,
  perceived_control INTEGER CHECK (perceived_control >= 1 AND perceived_control <= 10),
  confidence INTEGER CHECK (confidence >= 1 AND confidence <= 10),
  notes TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One check-in per day
  UNIQUE(user_id, date)
);

-- Index for fetching user's progress history
CREATE INDEX idx_progress_logs_user_date ON public.progress_logs(user_id, date DESC);

-- ============================================
-- 4. DAILY_COMPLETIONS TABLE
-- Track completed tasks per day
-- ============================================
CREATE TABLE public.daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Completion data
  date DATE NOT NULL,
  task_id TEXT NOT NULL,
  task_type TEXT CHECK (task_type IN ('exercise', 'cognitive', 'supplement')),

  -- Timestamp
  completed_at TIMESTAMPTZ DEFAULT NOW(),

  -- One completion per task per day
  UNIQUE(user_id, date, task_id)
);

-- Index for fetching user's daily completions
CREATE INDEX idx_daily_completions_user_date ON public.daily_completions(user_id, date);

-- ============================================
-- 5. SUBSCRIPTIONS TABLE
-- Premium subscription tracking
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Subscription status
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'cancelled', 'expired', 'trialing', 'inactive')),
  plan TEXT,

  -- Provider info
  provider TEXT CHECK (provider IN ('apple', 'google', 'stripe')),
  provider_subscription_id TEXT,

  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Onboarding responses policies
CREATE POLICY "Users can view own onboarding"
  ON public.onboarding_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.onboarding_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON public.onboarding_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- Progress logs policies
CREATE POLICY "Users can view own progress"
  ON public.progress_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.progress_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.progress_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily completions policies
CREATE POLICY "Users can view own completions"
  ON public.daily_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.daily_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON public.daily_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Subscription INSERT/UPDATE should be done via server-side functions
-- to prevent users from giving themselves premium access

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak (call after task completion)
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_last_completion DATE;
  v_today DATE := CURRENT_DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Get the most recent completion date before today
  SELECT MAX(date) INTO v_last_completion
  FROM public.daily_completions
  WHERE user_id = p_user_id AND date < v_today;

  -- Get current streak values
  SELECT current_streak, longest_streak INTO v_current_streak, v_longest_streak
  FROM public.users WHERE id = p_user_id;

  -- Check if there's already a completion today
  IF EXISTS (SELECT 1 FROM public.daily_completions WHERE user_id = p_user_id AND date = v_today) THEN
    -- Streak already counted for today, just update longest if needed
    IF v_current_streak > v_longest_streak THEN
      UPDATE public.users SET longest_streak = v_current_streak WHERE id = p_user_id;
    END IF;
    RETURN;
  END IF;

  -- Calculate new streak
  IF v_last_completion = v_today - 1 THEN
    -- Consecutive day, increment streak
    v_current_streak := v_current_streak + 1;
  ELSIF v_last_completion IS NULL OR v_last_completion < v_today - 1 THEN
    -- Streak broken or first completion, reset to 1
    v_current_streak := 1;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Save to database
  UPDATE public.users
  SET current_streak = v_current_streak, longest_streak = v_longest_streak
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
