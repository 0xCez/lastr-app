import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { onboardingQuestions } from '@/constants/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Premium Option Card
interface OptionCardProps {
  label: string;
  emoji?: string;
  icon?: string;
  iconColor?: string;
  selected: boolean;
  onSelect: () => void;
  multiSelect?: boolean;
  index: number;
}

const OptionCard: React.FC<OptionCardProps> = ({
  label,
  emoji,
  icon,
  iconColor,
  selected,
  onSelect,
  multiSelect = false,
  index,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300).springify()}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        <View style={[styles.optionCard, selected && styles.optionCardSelected]}>
          {/* Subtle inner glow for selected */}
          {selected && (
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.12)', 'rgba(139, 92, 246, 0.04)']}
              style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
            />
          )}

          <View style={styles.optionContent}>
            {(icon || emoji) && (
              <View style={[
                styles.emojiContainer,
                selected && styles.emojiContainerSelected,
                icon && iconColor && { backgroundColor: `${iconColor}15` },
                icon && iconColor && selected && { backgroundColor: `${iconColor}25`, borderColor: `${iconColor}40` },
              ]}>
                {icon ? (
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={22}
                    color={iconColor || Colors.textSecondary}
                  />
                ) : (
                  <Text style={styles.optionEmoji}>{emoji}</Text>
                )}
              </View>
            )}
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
              {label}
            </Text>
          </View>

          {/* Minimal selection indicator */}
          {multiSelect ? (
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
              {selected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          ) : (
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected && <View style={styles.radioInner} />}
            </View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

// Premium Swipeable Gauge
interface GaugeProps {
  value: number;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}

const GAUGE_PADDING = 24; // Horizontal padding
const GAUGE_WIDTH = SCREEN_WIDTH - (GAUGE_PADDING * 2) - 48; // Account for screen padding
const THUMB_SIZE = 32;
const TRACK_PADDING = THUMB_SIZE / 2; // Keep thumb within bounds

const Gauge: React.FC<GaugeProps> = ({ value, min, max, minLabel, maxLabel, onChange }) => {
  const totalSteps = max - min;
  const sliderPosition = useSharedValue((value - min) / totalSteps);
  const lastValue = useRef(value);

  const getColor = (val: number) => {
    const ratio = (val - min) / totalSteps;
    if (ratio < 0.3) return '#22C55E';
    if (ratio < 0.6) return '#F59E0B';
    return '#EF4444';
  };

  const triggerStepHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const updateValue = (newValue: number) => {
    if (newValue !== lastValue.current) {
      lastValue.current = newValue;
      onChange(newValue);
      runOnJS(triggerStepHaptic)();
    }
  };

  const usableTrackWidth = GAUGE_WIDTH - THUMB_SIZE;

  const triggerTapHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(triggerTapHaptic)();
    })
    .onUpdate((event) => {
      // Calculate position based on gesture, accounting for thumb padding
      const adjustedX = event.x - TRACK_PADDING;
      const rawPosition = Math.max(0, Math.min(1, adjustedX / usableTrackWidth));

      // Snap to discrete steps (1, 2, 3... 10)
      const stepValue = Math.round(rawPosition * totalSteps) + min;
      const clampedValue = Math.max(min, Math.min(max, stepValue));

      // Set position to snapped step position
      const snappedPosition = (clampedValue - min) / totalSteps;
      sliderPosition.value = snappedPosition;

      runOnJS(updateValue)(clampedValue);
    })
    .onEnd(() => {
      // Already snapped during update, just ensure final snap
      const stepValue = Math.round(sliderPosition.value * totalSteps);
      sliderPosition.value = withSpring(stepValue / totalSteps, { damping: 20, stiffness: 300 });
    });

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      const adjustedX = event.x - TRACK_PADDING;
      const rawPosition = Math.max(0, Math.min(1, adjustedX / usableTrackWidth));

      // Snap to discrete steps
      const stepValue = Math.round(rawPosition * totalSteps) + min;
      const clampedValue = Math.max(min, Math.min(max, stepValue));
      const snappedPosition = (clampedValue - min) / totalSteps;

      sliderPosition.value = withSpring(snappedPosition, { damping: 20, stiffness: 300 });
      runOnJS(updateValue)(clampedValue);
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  // Animated styles for the thumb - keep within track bounds
  const thumbStyle = useAnimatedStyle(() => ({
    left: TRACK_PADDING + (sliderPosition.value * usableTrackWidth),
  }));

  // Animated style for the fill
  const fillStyle = useAnimatedStyle(() => ({
    width: `${sliderPosition.value * 100}%`,
  }));

  // Update slider position when value prop changes
  React.useEffect(() => {
    sliderPosition.value = withTiming((value - min) / totalSteps, { duration: 200 });
    lastValue.current = value;
  }, [value, min, totalSteps]);

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.gaugeContainer}>
      {/* Value display */}
      <View style={styles.gaugeValueContainer}>
        <Text style={[styles.gaugeValue, { color: getColor(value) }]}>{value}</Text>
        <Text style={styles.gaugeValueMax}>/{max}</Text>
      </View>

      {/* Description */}
      <Text style={styles.gaugeDescription}>
        {value <= 3 ? 'Low impact' : value <= 6 ? 'Moderate impact' : 'High impact'}
      </Text>

      {/* Swipeable Gauge track */}
      <GestureDetector gesture={composedGesture}>
        <View style={styles.gaugeTrackContainer}>
          {/* Track background */}
          <View style={styles.gaugeSliderTrack}>
            {/* Filled portion */}
            <Animated.View style={[styles.gaugeSliderFill, fillStyle]}>
              <LinearGradient
                colors={
                  value <= 3
                    ? ['#22C55E', '#16A34A']
                    : value <= 6
                      ? ['#F59E0B', '#D97706']
                      : ['#EF4444', '#DC2626']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>

          {/* Thumb */}
          <Animated.View style={[styles.gaugeThumb, thumbStyle]}>
            <View style={styles.gaugeThumbOuter}>
              <View style={[styles.gaugeThumbInner, { backgroundColor: getColor(value) }]}>
                <View style={styles.gaugeThumbHighlight} />
              </View>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Labels */}
      <View style={styles.gaugeLabels}>
        <Text style={styles.gaugeLabel}>{minLabel}</Text>
        <Text style={styles.gaugeLabel}>{maxLabel}</Text>
      </View>
    </Animated.View>
  );
};

export default function QuestionsScreen() {
  const { answers, setAnswer } = useOnboardingStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(5);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = onboardingQuestions[currentIndex];
  const totalQuestions = onboardingQuestions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // Animated progress bar
  const animatedProgress = useSharedValue(progress);

  React.useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [progress]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  const handleOptionSelect = (value: string) => {
    if (currentQuestion.type === 'multiple') {
      if (selectedOptions.includes(value)) {
        setSelectedOptions(selectedOptions.filter((v) => v !== value));
      } else {
        setSelectedOptions([...selectedOptions, value]);
      }
    } else {
      setAnswer(currentQuestion.id, value);
      goToNext();
    }
  };

  const handleMultipleSubmit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnswer(currentQuestion.id, selectedOptions);
    setSelectedOptions([]);
    goToNext();
  };

  const handleSliderSubmit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnswer(currentQuestion.id, sliderValue);
    goToNext();
  };

  const goToNext = async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        router.push('/(onboarding)/analyzing');
      }
      setIsTransitioning(false);
    }, 50);
  };

  const goBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.replace('/(onboarding)');
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'slider':
        return (
          <View style={styles.sliderContainer}>
            <Gauge
              value={sliderValue}
              min={currentQuestion.min || 1}
              max={currentQuestion.max || 10}
              minLabel={currentQuestion.labels?.min || ''}
              maxLabel={currentQuestion.labels?.max || ''}
              onChange={setSliderValue}
            />
          </View>
        );

      case 'multiple':
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsScroll}
          >
            {currentQuestion.options?.map((option, index) => (
              <OptionCard
                key={option.value}
                label={option.label}
                emoji={option.emoji}
                icon={option.icon}
                iconColor={option.iconColor}
                selected={selectedOptions.includes(option.value)}
                onSelect={() => handleOptionSelect(option.value)}
                multiSelect
                index={index}
              />
            ))}
          </ScrollView>
        );

      default:
        return (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsScroll}
          >
            {currentQuestion.options?.map((option, index) => (
              <OptionCard
                key={option.value}
                label={option.label}
                emoji={option.emoji}
                icon={option.icon}
                iconColor={option.iconColor}
                selected={answers[currentQuestion.id as keyof typeof answers] === option.value}
                onSelect={() => handleOptionSelect(option.value)}
                index={index}
              />
            ))}
          </ScrollView>
        );
    }
  };

  const showCTA = currentQuestion.type === 'multiple' || currentQuestion.type === 'slider';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable
              onPress={goBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>

            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, progressBarStyle]}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </Animated.View>
              </View>
            </View>

            <Text style={styles.progressText}>{currentIndex + 1}/{totalQuestions}</Text>
          </View>
        </View>

        {/* Question Content */}
        <Animated.View
          key={currentQuestion.id}
          entering={FadeIn.duration(300)}
          exiting={FadeOutUp.duration(200)}
          style={styles.questionContent}
        >
          <View style={styles.questionHeader}>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>Question {currentIndex + 1}</Text>
            </View>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          <View style={styles.answersContainer}>
            {renderQuestion()}
          </View>
        </Animated.View>

        {/* Bottom CTA */}
        {showCTA && (
          <View style={styles.bottomCTA}>
            <Pressable
              onPress={currentQuestion.type === 'slider' ? handleSliderSubmit : handleMultipleSubmit}
              disabled={currentQuestion.type === 'multiple' && selectedOptions.length === 0}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
                currentQuestion.type === 'multiple' && selectedOptions.length === 0 && styles.ctaButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={
                  currentQuestion.type === 'multiple' && selectedOptions.length === 0
                    ? ['#2A2A3A', '#232330']
                    : ['#8B5CF6', '#7C3AED']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={[
                  styles.ctaText,
                  currentQuestion.type === 'multiple' && selectedOptions.length === 0 && styles.ctaTextDisabled,
                ]}>
                  Continue
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ scale: 0.96 }],
  },
  backIcon: {
    fontSize: 28,
    color: Colors.text,
    fontWeight: '300',
    marginTop: -2,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    minWidth: 36,
    textAlign: 'right',
  },
  questionContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  questionBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  questionBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  answersContainer: {
    flex: 1,
  },
  optionsScroll: {
    gap: 12,
    paddingBottom: 120,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  optionCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.6)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.text,
  },
  optionLabelSelected: {
    color: Colors.text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  radioSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  gaugeContainer: {
    alignItems: 'center',
  },
  gaugeValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  gaugeValue: {
    fontSize: 80,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -4,
  },
  gaugeValueMax: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    marginLeft: 4,
  },
  gaugeDescription: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginBottom: 40,
  },
  gaugeTrackContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    marginBottom: 24,
  },
  gaugeSliderTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  gaugeSliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 7,
  },
  gaugeThumb: {
    position: 'absolute',
    top: -6,
    width: 32,
    height: 32,
  },
  gaugeThumbOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A24',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gaugeThumbInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeThumbHighlight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: -4,
    marginLeft: -4,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  gaugeLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  ctaButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
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
