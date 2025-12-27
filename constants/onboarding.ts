export interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'slider';
  options?: { value: string; label: string; emoji?: string; icon?: string; iconColor?: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  labels?: { min: string; max: string };
}

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 'age',
    question: 'What\'s your age range?',
    type: 'single',
    options: [
      { value: '18-24', label: '18-24' },
      { value: '25-34', label: '25-34' },
      { value: '35-44', label: '35-44' },
      { value: '45-54', label: '45-54' },
      { value: '55+', label: '55+' },
    ],
  },
  {
    id: 'relationship',
    question: 'What\'s your current relationship status?',
    type: 'single',
    options: [
      { value: 'single', label: 'Single', icon: 'person-outline', iconColor: '#60A5FA' },
      { value: 'dating', label: 'Dating', icon: 'people-outline', iconColor: '#F472B6' },
      { value: 'relationship', label: 'In a relationship', icon: 'heart-outline', iconColor: '#F87171' },
      { value: 'married', label: 'Married', icon: 'diamond-outline', iconColor: '#A78BFA' },
    ],
  },
  {
    id: 'duration_issue',
    question: 'How long have you been experiencing this issue?',
    type: 'single',
    options: [
      { value: 'recent', label: 'Less than 6 months' },
      { value: '6-12', label: '6-12 months' },
      { value: '1-3', label: '1-3 years' },
      { value: '3+', label: 'More than 3 years' },
      { value: 'always', label: 'As long as I can remember' },
    ],
  },
  {
    id: 'current_duration',
    question: 'On average, how long do you currently last?',
    type: 'single',
    options: [
      { value: '<1', label: 'Less than 1 minute' },
      { value: '1-2', label: '1-2 minutes' },
      { value: '2-5', label: '2-5 minutes' },
      { value: '5-10', label: '5-10 minutes' },
      { value: '10+', label: 'More than 10 minutes' },
    ],
  },
  {
    id: 'tried_before',
    question: 'What have you tried before?',
    type: 'multiple',
    options: [
      { value: 'nothing', label: 'Nothing yet' },
      { value: 'pills', label: 'Pills/Supplements' },
      { value: 'sprays', label: 'Delay sprays/creams' },
      { value: 'therapy', label: 'Therapy/Counseling' },
      { value: 'exercises', label: 'Exercises' },
      { value: 'other', label: 'Other methods' },
    ],
  },
  {
    id: 'confidence_impact',
    question: 'How much does this affect your confidence?',
    type: 'slider',
    min: 1,
    max: 10,
    step: 1,
    labels: {
      min: 'Not at all',
      max: 'Severely',
    },
  },
  {
    id: 'frequency',
    question: 'How often do you experience premature ejaculation?',
    type: 'single',
    options: [
      { value: 'always', label: 'Almost always (90%+)' },
      { value: 'often', label: 'Often (60-90%)' },
      { value: 'sometimes', label: 'Sometimes (30-60%)' },
      { value: 'occasionally', label: 'Occasionally (<30%)' },
    ],
  },
  {
    id: 'primary_concern',
    question: 'What do you think is the main cause?',
    type: 'single',
    options: [
      { value: 'physical', label: 'Physical sensitivity', icon: 'fitness-outline', iconColor: '#F97316' },
      { value: 'mental', label: 'Anxiety/Mental', icon: 'bulb-outline', iconColor: '#FBBF24' },
      { value: 'both', label: 'Both equally', icon: 'git-compare-outline', iconColor: '#34D399' },
      { value: 'unsure', label: 'Not sure', icon: 'help-circle-outline', iconColor: '#A78BFA' },
    ],
  },
];

export interface Symptom {
  id: string;
  label: string;
  category: 'psychological' | 'physical' | 'social';
}

export const symptoms: Symptom[] = [
  // Psychological
  { id: 'anxiety', label: 'Performance anxiety', category: 'psychological' },
  { id: 'overthinking', label: 'Overthinking during sex', category: 'psychological' },
  { id: 'confidence', label: 'Loss of confidence', category: 'psychological' },
  { id: 'anticipation', label: 'Anticipating failure', category: 'psychological' },
  { id: 'stress', label: 'General stress', category: 'psychological' },
  { id: 'depression', label: 'Feelings of inadequacy', category: 'psychological' },

  // Physical
  { id: 'sensitivity', label: 'High sensitivity', category: 'physical' },
  { id: 'tension', label: 'Pelvic muscle tension', category: 'physical' },
  { id: 'arousal', label: 'Quick arousal patterns', category: 'physical' },
  { id: 'breathing', label: 'Shallow breathing', category: 'physical' },
  { id: 'erection', label: 'Erection issues', category: 'physical' },

  // Social
  { id: 'relationship_strain', label: 'Relationship strain', category: 'social' },
  { id: 'avoidance', label: 'Avoiding intimacy', category: 'social' },
  { id: 'communication', label: 'Difficulty discussing it', category: 'social' },
  { id: 'partner_dissatisfaction', label: 'Partner dissatisfaction', category: 'social' },
  { id: 'dating_fear', label: 'Fear of new relationships', category: 'social' },
];

export interface Goal {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export const goals: Goal[] = [
  {
    id: 'duration',
    title: 'Last longer',
    description: 'Significantly increase your duration',
    emoji: '⏱️',
  },
  {
    id: 'confidence',
    title: 'Build confidence',
    description: 'Feel confident in intimate moments',
    emoji: '💪',
  },
  {
    id: 'anxiety',
    title: 'Reduce anxiety',
    description: 'Overcome performance anxiety',
    emoji: '🧘',
  },
  {
    id: 'control',
    title: 'Gain control',
    description: 'Decide when to finish',
    emoji: '🎯',
  },
  {
    id: 'relationship',
    title: 'Improve relationship',
    description: 'Better intimacy with partner',
    emoji: '❤️',
  },
  {
    id: 'satisfaction',
    title: 'More satisfaction',
    description: 'Enjoy sex more fully',
    emoji: '✨',
  },
];

export const educationSlides = [
  {
    id: 1,
    title: 'Not only a bedroom issue',
    description: 'Most men don\'t realize how much lack of control affects their lives',
    color: '#7F1D1D',
  },
  {
    id: 2,
    title: 'It shatters sex drive',
    description: 'Studies show men with lack of control are 3x more likely to avoid intimacy with their partner',
    color: '#7F1D1D',
  },
  {
    id: 3,
    title: 'It hurts relationships',
    description: '80% of men with lack of control think their partner feels unsatisfied or frustrated',
    color: '#7F1D1D',
  },
  {
    id: 4,
    title: 'It\'s a vicious circle',
    description: 'Performance anxiety leads to overthinking which leads to more anxiety and less control',
    color: '#7F1D1D',
  },
  {
    id: 5,
    title: 'But it can be fixed',
    description: 'With Lastr\'s training, you can learn how to gain total control over your ejaculation',
    color: '#065F46',
  },
  {
    id: 6,
    title: 'Welcome to Lastr\'',
    description: 'Lastr\'s methodology is based on years of leading research about ejaculation control',
    color: '#1E3A5F',
  },
];

export const socialProofReviews = [
  {
    id: 1,
    name: 'Anonymous',
    rating: 5,
    text: 'I used to struggle with control, but this app completely changed my confidence in bed.',
  },
  {
    id: 2,
    name: 'Anonymous',
    rating: 5,
    text: 'I used to feel completely powerless, but now I decide when to finish.',
  },
  {
    id: 3,
    name: 'Alex B.',
    rating: 5,
    text: 'Week 2 down. The Kegel exercises are tough but starting to show results.',
  },
  {
    id: 4,
    name: 'James K.',
    rating: 5,
    text: '14 days in - didn\'t think it\'d work, but 14 days in and I can already feel it. The Start-Stop method is a game changer.',
  },
  {
    id: 5,
    name: 'Anonymous',
    rating: 5,
    text: 'Two weeks of sticking with the program, and the difference is night and day.',
  },
];
