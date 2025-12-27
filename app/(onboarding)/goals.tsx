import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  const buttonScale = useSharedValue(1);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSpring(0.95, { damping: 15 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 15 });
    }, 100);
    saveGoals(selectedGoals);
    router.push('/(onboarding)/rating');
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

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

        {/* Footer */}
        <View style={styles.footer}>
          <AnimatedPressable
            onPress={handleContinue}
            style={buttonStyle}
            disabled={selectedGoals.length === 0}
          >
            <LinearGradient
              colors={selectedGoals.length === 0
                ? ['#2A2A3A', '#232330']
                : ['#8B5CF6', '#7C3AED']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={[
                styles.ctaText,
                selectedGoals.length === 0 && styles.ctaTextDisabled
              ]}>
                Continue
              </Text>
            </LinearGradient>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCardWrapper: {
    width: '48%',
  },
  goalCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    minHeight: 140,
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 34,
  },
  ctaButton: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  ctaTextDisabled: {
    color: Colors.textMuted,
  },
});
