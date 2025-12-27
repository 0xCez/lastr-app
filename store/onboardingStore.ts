import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingAnswers {
  age?: string;
  relationship?: string;
  duration_issue?: string;
  current_duration?: string;
  tried_before?: string[];
  confidence_impact?: number;
  frequency?: string;
  primary_concern?: string;
  symptoms?: string[];
  goals?: string[];
}

interface OnboardingState {
  answers: OnboardingAnswers;
  currentStep: number;
  isCompleted: boolean;
  analysisScore: number;
  targetDate: string;

  // Actions
  setAnswer: (questionId: string, value: string | string[] | number) => void;
  setSymptoms: (symptoms: string[]) => void;
  setGoals: (goals: string[]) => void;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  calculateAnalysisScore: () => void;
  reset: () => void;
}

const calculateTargetDate = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + 3); // 3 months from now
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      answers: {},
      currentStep: 0,
      isCompleted: false,
      analysisScore: 0,
      targetDate: calculateTargetDate(),

      setAnswer: (questionId, value) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        }));
      },

      setSymptoms: (symptoms) => {
        set((state) => ({
          answers: { ...state.answers, symptoms },
        }));
      },

      setGoals: (goals) => {
        set((state) => ({
          answers: { ...state.answers, goals },
        }));
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      completeOnboarding: () => {
        set({ isCompleted: true });
      },

      calculateAnalysisScore: () => {
        const { answers } = get();
        // Start at 70 and subtract based on severity
        // Lower score = worse control, needs the app more
        let score = 70;

        // Current duration (biggest factor) - how long they last now
        if (answers.current_duration === '<1') score -= 30;
        else if (answers.current_duration === '1-2') score -= 20;
        else if (answers.current_duration === '2-5') score -= 10;
        else if (answers.current_duration === '5-10') score -= 5;
        // 10+ stays at 70

        // Frequency of PE occurrence
        if (answers.frequency === 'always') score -= 15;
        else if (answers.frequency === 'often') score -= 10;
        else if (answers.frequency === 'sometimes') score -= 5;
        // occasionally no deduction

        // How long they've had the issue
        if (answers.duration_issue === 'always') score -= 10;
        else if (answers.duration_issue === '3+') score -= 8;
        else if (answers.duration_issue === '1-3') score -= 5;
        // 6-12 months or recent: no deduction

        // Confidence impact (1-10 scale, higher = worse)
        if (answers.confidence_impact) {
          if (answers.confidence_impact >= 8) score -= 10;
          else if (answers.confidence_impact >= 5) score -= 5;
        }

        // Ensure score stays in valid range (15-70)
        // Min 15 so it's never 0, max 70 so they always need the app
        score = Math.max(15, Math.min(70, score));

        set({ analysisScore: score });
      },

      reset: () => {
        set({
          answers: {},
          currentStep: 0,
          isCompleted: false,
          analysisScore: 0,
          targetDate: calculateTargetDate(),
        });
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
