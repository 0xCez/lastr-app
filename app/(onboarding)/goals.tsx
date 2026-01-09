import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { goals } from '@/constants/onboarding';
import { ShimmerCTA } from '@/components/ui';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 24;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

// Icon mapping for goals
const goalIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  duration: 'timer-outline',
  confidence: 'shield-checkmark-outline',
  anxiety: 'leaf-outline',
  control: 'locate-outline',
  relationship: 'heart-outline',
  satisfaction: 'sparkles-outline',
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Goal Card Component
interface GoalCardProps {
  goal: typeof goals[0];
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, isSelected, onToggle, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      style={styles.goalCardWrapper}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        <View style={[styles.goalCard, isSelected && styles.goalCardSelected]}>
          {isSelected && (
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
              style={StyleSheet.absoluteFill}
            />
          )}

          <View style={styles.goalHeader}>
            <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
              <Ionicons
                name={goalIcons[goal.id] || 'star-outline'}
                size={24}
                color={isSelected ? Colors.primary : Colors.textSecondary}
              />
            </View>
            {isSelected && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={[styles.goalTitle, isSelected && styles.goalTitleSelected]}>
            {goal.title}
          </Text>
          <Text style={styles.goalDescription}>{goal.description}</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

export default function GoalsScreen() {
  const { setGoals: saveGoals } = useOnboardingStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveGoals(selectedGoals);
    router.push('/(onboarding)/rating');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <View style={styles.ambientGlow}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.12)', 'transparent']}
          style={styles.ambientGlowGradient}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Goals Grid */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - now scrollable */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ALMOST DONE</Text>
            </View>
            <Text style={styles.title}>Choose your goals</Text>
            <Text style={styles.subtitle}>
              Select what you want to achieve with Lastr'
            </Text>
          </View>

          <View style={styles.goalsGrid}>
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isSelected={selectedGoals.includes(goal.id)}
                onToggle={() => toggleGoal(goal.id)}
                index={index}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
          <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
            <View style={styles.footerInner}>
              <ShimmerCTA
                title="Continue"
                onPress={handleContinue}
                disabled={selectedGoals.length === 0}
              />
            </View>
          </SafeAreaView>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    height: '25%',
  },
  ambientGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 200,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 140,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCardWrapper: {
    width: CARD_WIDTH,
  },
  goalCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    height: 150,
  },
  goalCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  goalTitleSelected: {
    color: Colors.primary,
  },
  goalDescription: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerBlur: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerSafeArea: {
    backgroundColor: 'rgba(26, 26, 36, 0.8)',
  },
  footerInner: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
});
