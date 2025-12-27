import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyTask {
  id: string;
  name: string;
  completed: boolean;
  type: 'exercise' | 'cognitive' | 'supplement';
}

interface UserState {
  // User info
  userId: string | null;
  isPremium: boolean;
  onboardingCompleted: boolean;

  // Progress
  controlScore: number;
  potentialScore: number;
  latencyTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  targetDate: string;

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
}

const defaultDailyTasks: DailyTask[] = [
  { id: 'start-stop', name: 'Start-Stop: 3x sets', completed: false, type: 'cognitive' },
  { id: 'bridge', name: 'Bridge Abduction: 2x sets', completed: false, type: 'exercise' },
  { id: 'butterfly', name: 'Lying Butterfly: 2x sets', completed: false, type: 'exercise' },
  { id: 'reframing', name: 'Cognitive reframing: 3 mins', completed: false, type: 'cognitive' },
  { id: 'stretching', name: 'Pelvic Stretching', completed: false, type: 'exercise' },
  { id: 'kegel', name: 'Basic Kegels: 3x sets', completed: false, type: 'exercise' },
  { id: 'breathing', name: '4-4-8 Breathing: 5 mins', completed: false, type: 'cognitive' },
];

// Task sets based on primary concern
const physicalFocusTasks: DailyTask[] = [
  { id: 'kegel', name: 'Kegel Contractions: 3x sets', completed: false, type: 'exercise' },
  { id: 'reverse-kegel', name: 'Reverse Kegels: 2x sets', completed: false, type: 'exercise' },
  { id: 'bridge', name: 'Bridge Abduction: 2x sets', completed: false, type: 'exercise' },
  { id: 'stretching', name: 'Pelvic Stretching', completed: false, type: 'exercise' },
  { id: 'start-stop', name: 'Start-Stop: 3x sets', completed: false, type: 'cognitive' },
  { id: 'breathing', name: '4-4-8 Breathing: 3 mins', completed: false, type: 'cognitive' },
];

const mentalFocusTasks: DailyTask[] = [
  { id: 'breathing', name: '4-4-8 Breathing: 5 mins', completed: false, type: 'cognitive' },
  { id: 'reframing', name: 'Cognitive Reframing: 5 mins', completed: false, type: 'cognitive' },
  { id: 'visualization', name: 'Arousal Visualization', completed: false, type: 'cognitive' },
  { id: 'start-stop', name: 'Start-Stop: 3x sets', completed: false, type: 'cognitive' },
  { id: 'kegel', name: 'Basic Kegels: 2x sets', completed: false, type: 'exercise' },
  { id: 'stretching', name: 'Relaxation Stretches', completed: false, type: 'exercise' },
];

const balancedTasks: DailyTask[] = [
  { id: 'kegel', name: 'Kegel Contractions: 3x sets', completed: false, type: 'exercise' },
  { id: 'bridge', name: 'Bridge Abduction: 2x sets', completed: false, type: 'exercise' },
  { id: 'breathing', name: '4-4-8 Breathing: 5 mins', completed: false, type: 'cognitive' },
  { id: 'reframing', name: 'Cognitive Reframing: 3 mins', completed: false, type: 'cognitive' },
  { id: 'start-stop', name: 'Start-Stop: 3x sets', completed: false, type: 'cognitive' },
  { id: 'stretching', name: 'Pelvic Stretching', completed: false, type: 'exercise' },
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      isPremium: false,
      onboardingCompleted: false,
      controlScore: 45,
      potentialScore: 96,
      latencyTime: 2.3,
      currentStreak: 0,
      longestStreak: 0,
      targetDate: '',
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

        set({
          controlScore: score,
          primaryConcern: concern,
          severity,
          targetDate,
          dailyTasks: tasks.map(t => ({ ...t, completed: false })),
          lastTaskUpdate: new Date().toISOString().split('T')[0],
          onboardingCompleted: true,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
