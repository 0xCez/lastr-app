import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyTask {
  id: string;
  name: string;
  completed: boolean;
  type: 'exercise' | 'cognitive' | 'supplement';
}

// Progress check-in entry
interface ProgressEntry {
  date: string; // ISO date string
  controlScore: number;
  duration: string; // Duration category from check-in
  perceivedControl: number; // 1-10
  confidence: number; // 1-10
  notes?: string;
}

// Duration options for check-ins
export const DURATION_OPTIONS = [
  { value: 'less-than-1', label: 'Less than 1 minute', score: 10 },
  { value: '1-2', label: '1-2 minutes', score: 25 },
  { value: '2-5', label: '2-5 minutes', score: 45 },
  { value: '5-10', label: '5-10 minutes', score: 65 },
  { value: '10-15', label: '10-15 minutes', score: 80 },
  { value: '15-plus', label: '15+ minutes', score: 95 },
] as const;

interface UserState {
  // User info
  userId: string | null;
  isPremium: boolean;
  onboardingCompleted: boolean;

  // Progress
  controlScore: number;
  initialScore: number; // Score at start of program (for comparison)
  potentialScore: number;
  latencyTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  targetDate: string;
  startDate: string; // When user started the program

  // Progress tracking
  progressHistory: ProgressEntry[];
  lastCheckInDate: string | null;
  checkInDueDate: string | null; // When next check-in should happen

  // Personalization from onboarding
  primaryConcern: 'physical' | 'mental' | 'both' | 'unsure' | null;
  severity: 'critical' | 'low' | 'moderate' | null;

  // Daily tasks
  dailyTasks: DailyTask[];
  lastTaskUpdate: string | null;

  // Actions
  setUserId: (id: string) => void;
  setPremium: (isPremium: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  updateControlScore: (score: number) => void;
  updateLatencyTime: (time: number) => void;
  toggleDailyTask: (taskId: string) => void;
  resetDailyTasks: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  initializeDailyTasks: () => void;
  initializeFromOnboarding: (score: number, primaryConcern: string, targetDate: string) => void;

  // Progress tracking actions
  submitCheckIn: (duration: string, perceivedControl: number, confidence: number, notes?: string) => void;
  isCheckInDue: () => boolean;
  getProgressTrend: () => { current: number; previous: number; change: number; improving: boolean } | null;
  getScoreImprovement: () => { points: number; percentage: number };
}

const defaultDailyTasks: DailyTask[] = [
  { id: 'start-stop', name: 'Start-Stop: 3x sets', completed: false, type: 'cognitive' },
  { id: 'bridge-hold', name: 'Bridge Abduction: 2x sets', completed: false, type: 'exercise' },
  { id: 'butterfly-stretch', name: 'Lying Butterfly: 2 mins', completed: false, type: 'exercise' },
  { id: 'cognitive-reframing', name: 'Cognitive Reframing: 3 mins', completed: false, type: 'cognitive' },
  { id: 'pelvic-stretching', name: 'Pelvic Stretching', completed: false, type: 'exercise' },
  { id: 'kegel-basic', name: 'Basic Kegels: 3x sets', completed: false, type: 'exercise' },
  { id: 'breathing-448', name: '4-4-8 Breathing: 5 mins', completed: false, type: 'cognitive' },
];

// Task sets based on primary concern
const physicalFocusTasks: DailyTask[] = [
  { id: 'kegel-basic', name: 'Kegel Contractions: 3x sets', completed: false, type: 'exercise' },
  { id: 'reverse-kegel', name: 'Reverse Kegels: 2x sets', completed: false, type: 'exercise' },
  { id: 'bridge-hold', name: 'Bridge Abduction: 2x sets', completed: false, type: 'exercise' },
  { id: 'pelvic-stretching', name: 'Pelvic Stretching', completed: false, type: 'exercise' },
  { id: 'start-stop', name: 'Start-Stop: 3x sets', completed: false, type: 'cognitive' },
  { id: 'breathing-448', name: '4-4-8 Breathing: 3 mins', completed: false, type: 'cognitive' },
];

const mentalFocusTasks: DailyTask[] = [
  { id: 'breathing-448', name: '4-4-8 Breathing: 5 mins', completed: false, type: 'cognitive' },
  { id: 'cognitive-reframing', name: 'Cognitive Reframing: 5 mins', completed: false, type: 'cognitive' },
  { id: 'visualization', name: 'Control Visualization', completed: false, type: 'cognitive' },
  { id: 'start-stop', name: 'Start-Stop: 3x sets', completed: false, type: 'cognitive' },
  { id: 'kegel-basic', name: 'Basic Kegels: 2x sets', completed: false, type: 'exercise' },
  { id: 'pelvic-stretching', name: 'Relaxation Stretches', completed: false, type: 'exercise' },
];

const balancedTasks: DailyTask[] = [
  { id: 'kegel-basic', name: 'Kegel Contractions: 3x sets', completed: false, type: 'exercise' },
  { id: 'bridge-hold', name: 'Bridge Abduction: 2x sets', completed: false, type: 'exercise' },
  { id: 'breathing-448', name: '4-4-8 Breathing: 5 mins', completed: false, type: 'cognitive' },
  { id: 'cognitive-reframing', name: 'Cognitive Reframing: 3 mins', completed: false, type: 'cognitive' },
  { id: 'start-stop', name: 'Start-Stop: 3x sets', completed: false, type: 'cognitive' },
  { id: 'pelvic-stretching', name: 'Pelvic Stretching', completed: false, type: 'exercise' },
];

// Helper to calculate next check-in date (7 days from now)
const getNextCheckInDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};

// Helper to calculate new control score from check-in data
// Uses momentum-based scoring to prevent sudden jumps
const calculateNewScore = (
  duration: string,
  perceivedControl: number,
  confidence: number,
  currentStreak: number,
  previousScore: number
): number => {
  // Get target score from duration (primary metric, 50% weight)
  const durationOption = DURATION_OPTIONS.find(d => d.value === duration);
  const durationScore = durationOption?.score ?? 45;

  // Perceived control contributes 25% (scale 1-10 → 0-100)
  const controlContribution = perceivedControl * 10;

  // Confidence contributes 25% (scale 1-10 → 0-100)
  const confidenceContribution = confidence * 10;

  // Calculate the "target" score based on check-in data
  const targetScore = (durationScore * 0.5) + (controlContribution * 0.25) + (confidenceContribution * 0.25);

  // Streak bonus: small bonus for consistency (max +3 points)
  const streakBonus = Math.min(currentStreak * 0.3, 3);

  // MOMENTUM SYSTEM: Score moves gradually toward target
  // - If improving: move 40% toward target (gradual improvement)
  // - If declining: move 60% toward target (faster reflection of setbacks)
  // This prevents sudden jumps while still reflecting real progress
  const isImproving = targetScore > previousScore;
  const momentum = isImproving ? 0.4 : 0.6;

  // Calculate new score with momentum
  let newScore = previousScore + (targetScore - previousScore) * momentum;

  // Add streak bonus
  newScore += streakBonus;

  // Clamp between 15 and 98 (never perfect, always room to grow)
  return Math.round(Math.max(15, Math.min(98, newScore)));
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      isPremium: false,
      onboardingCompleted: false,
      controlScore: 45,
      initialScore: 45,
      potentialScore: 96,
      latencyTime: 2.3,
      currentStreak: 0,
      longestStreak: 0,
      targetDate: '',
      startDate: '',
      progressHistory: [],
      lastCheckInDate: null,
      checkInDueDate: null,
      primaryConcern: null,
      severity: null,
      dailyTasks: defaultDailyTasks,
      lastTaskUpdate: null,

      setUserId: (id) => set({ userId: id }),

      setPremium: (isPremium) => set({ isPremium }),

      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

      updateControlScore: (score) => set({ controlScore: score }),

      updateLatencyTime: (time) => set({ latencyTime: time }),

      toggleDailyTask: (taskId) => {
        set((state) => ({
          dailyTasks: state.dailyTasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        }));
      },

      resetDailyTasks: () => {
        set({
          dailyTasks: defaultDailyTasks,
          lastTaskUpdate: new Date().toISOString().split('T')[0],
        });
      },

      incrementStreak: () => {
        set((state) => ({
          currentStreak: state.currentStreak + 1,
          longestStreak: Math.max(state.longestStreak, state.currentStreak + 1),
        }));
      },

      resetStreak: () => set({ currentStreak: 0 }),

      initializeDailyTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastTaskUpdate, primaryConcern } = get();

        if (lastTaskUpdate !== today) {
          // Use personalized tasks based on primary concern
          let tasks = defaultDailyTasks;
          if (primaryConcern === 'physical') {
            tasks = physicalFocusTasks;
          } else if (primaryConcern === 'mental') {
            tasks = mentalFocusTasks;
          } else if (primaryConcern === 'both' || primaryConcern === 'unsure') {
            tasks = balancedTasks;
          }

          set({
            dailyTasks: tasks.map(t => ({ ...t, completed: false })),
            lastTaskUpdate: today,
          });
        }
      },

      initializeFromOnboarding: (score, primaryConcern, targetDate) => {
        // Determine severity based on score
        let severity: 'critical' | 'low' | 'moderate' = 'moderate';
        if (score <= 30) severity = 'critical';
        else if (score <= 50) severity = 'low';

        // Select tasks based on primary concern
        let tasks = defaultDailyTasks;
        const concern = primaryConcern as 'physical' | 'mental' | 'both' | 'unsure';
        if (concern === 'physical') {
          tasks = physicalFocusTasks;
        } else if (concern === 'mental') {
          tasks = mentalFocusTasks;
        } else {
          tasks = balancedTasks;
        }

        const today = new Date().toISOString().split('T')[0];

        set({
          controlScore: score,
          initialScore: score, // Save initial score for comparison
          primaryConcern: concern,
          severity,
          targetDate,
          startDate: today,
          dailyTasks: tasks.map(t => ({ ...t, completed: false })),
          lastTaskUpdate: today,
          onboardingCompleted: true,
          // Set first check-in for 7 days from now
          checkInDueDate: getNextCheckInDate(),
          progressHistory: [],
          lastCheckInDate: null,
        });
      },

      // Submit a progress check-in
      submitCheckIn: (duration, perceivedControl, confidence, notes) => {
        const { currentStreak, progressHistory, controlScore: previousScore } = get();
        const today = new Date().toISOString().split('T')[0];

        // Calculate new score with momentum based on previous score
        const newScore = calculateNewScore(duration, perceivedControl, confidence, currentStreak, previousScore);

        // Create progress entry
        const entry: ProgressEntry = {
          date: today,
          controlScore: newScore,
          duration,
          perceivedControl,
          confidence,
          notes,
        };

        set({
          controlScore: newScore,
          progressHistory: [...progressHistory, entry],
          lastCheckInDate: today,
          checkInDueDate: getNextCheckInDate(),
        });
      },

      // Check if a check-in is due
      isCheckInDue: () => {
        const { checkInDueDate, lastCheckInDate, onboardingCompleted, startDate } = get();
        const today = new Date().toISOString().split('T')[0];

        // Not due if onboarding not completed
        if (!onboardingCompleted) return false;

        // If already checked in today, not due
        if (lastCheckInDate === today) return false;

        // If checkInDueDate is set, use it
        if (checkInDueDate) {
          return today >= checkInDueDate;
        }

        // Fallback for existing users without checkInDueDate:
        // If they have a startDate and it's been 7+ days, check-in is due
        if (startDate) {
          const startMs = new Date(startDate).getTime();
          const daysSinceStart = Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24));
          return daysSinceStart >= 7;
        }

        // If no startDate either, show check-in after they've been using the app
        // (for legacy users migrating to new system)
        return true;
      },

      // Get progress trend (current vs previous check-in)
      getProgressTrend: () => {
        const { progressHistory, controlScore, initialScore } = get();

        if (progressHistory.length === 0) {
          // No history yet, compare current to initial
          return {
            current: controlScore,
            previous: initialScore,
            change: controlScore - initialScore,
            improving: controlScore > initialScore,
          };
        }

        if (progressHistory.length === 1) {
          // Only one entry, compare to initial
          const current = progressHistory[0].controlScore;
          return {
            current,
            previous: initialScore,
            change: current - initialScore,
            improving: current > initialScore,
          };
        }

        // Compare last two entries
        const current = progressHistory[progressHistory.length - 1].controlScore;
        const previous = progressHistory[progressHistory.length - 2].controlScore;

        return {
          current,
          previous,
          change: current - previous,
          improving: current > previous,
        };
      },

      // Get total improvement since start
      getScoreImprovement: () => {
        const { controlScore, initialScore } = get();
        const points = controlScore - initialScore;
        const percentage = initialScore > 0
          ? Math.round((points / initialScore) * 100)
          : 0;

        return { points, percentage };
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
