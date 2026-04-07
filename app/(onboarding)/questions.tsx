import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, PanResponder } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { onboardingQuestions } from '@/constants/onboarding';
import { ShimmerCTA } from '@/components/ui';

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

const Gauge: React.FC<GaugeProps> = ({ value, min, max, minLabel, maxLabel, onChange }) => {
  const totalSteps = max - min;
  const lastValue = useRef(value);
  const containerWidth = useRef(0);
  const containerX = useRef(0);

  // Animations
  const circleScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);
  const numberScale = useSharedValue(1);

  // Pulse animation on mount
  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // Bounce animation when value changes
  React.useEffect(() => {
    circleScale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 8, stiffness: 400 })
    );
    numberScale.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 500 }),
      withSpring(1, { damping: 8, stiffness: 400 })
    );
  }, [value]);

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const numberAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  // Better color palette - more modern/futuristic
  const getColor = (val: number) => {
    const ratio = (val - min) / totalSteps;
    if (ratio <= 0.3) return '#10B981'; // Emerald
    if (ratio <= 0.6) return '#8B5CF6'; // Purple (brand color)
    return '#F43F5E'; // Rose/Pink
  };

  const getGradientColors = (val: number): [string, string] => {
    const ratio = (val - min) / totalSteps;
    if (ratio <= 0.3) return ['#10B981', '#059669'];
    if (ratio <= 0.6) return ['#8B5CF6', '#7C3AED'];
    return ['#F43F5E', '#E11D48'];
  };

  const getSegmentColor = (stepRatio: number, isSelected: boolean) => {
    if (!isSelected) return 'rgba(255, 255, 255, 0.06)';
    if (stepRatio <= 0.3) return '#10B981';
    if (stepRatio <= 0.6) return '#8B5CF6';
    return '#F43F5E';
  };

  // Haptics based on severity
  const triggerHapticForValue = (val: number) => {
    const ratio = (val - min) / totalSteps;
    if (ratio <= 0.3) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (ratio <= 0.6) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  const handleValueChange = (newValue: number) => {
    if (newValue !== lastValue.current && newValue >= min && newValue <= max) {
      lastValue.current = newValue;
      triggerHapticForValue(newValue);
      onChange(newValue);
    }
  };

  const calculateValue = (pageX: number) => {
    if (containerWidth.current > 0) {
      const localX = pageX - containerX.current;
      const position = Math.max(0, Math.min(localX, containerWidth.current));
      const ratio = position / containerWidth.current;
      const newValue = Math.round(ratio * totalSteps) + min;
      return Math.max(min, Math.min(max, newValue));
    }
    return value;
  };

  // PanResponder for touch handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const newValue = calculateValue(evt.nativeEvent.pageX);
        handleValueChange(newValue);
      },
      onPanResponderMove: (evt) => {
        const newValue = calculateValue(evt.nativeEvent.pageX);
        handleValueChange(newValue);
      },
    })
  ).current;

  // Generate step markers
  const steps = Array.from({ length: totalSteps + 1 }, (_, i) => min + i);

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.gaugeContainer}>
      {/* Central value display with animated glow */}
      <Animated.View style={[styles.gaugeValueWrapper, circleAnimatedStyle]}>
        <Animated.View style={[styles.gaugeValueGlow, { shadowColor: getColor(value) }, glowAnimatedStyle]} />
        <LinearGradient
          colors={getGradientColors(value)}
          style={styles.gaugeValueBg}
        >
          <Animated.Text style={[styles.gaugeValue, numberAnimatedStyle]}>{value}</Animated.Text>
        </LinearGradient>
      </Animated.View>

      {/* Description */}
      <Text style={[styles.gaugeDescription, { color: getColor(value) }]}>
        {value <= 3 ? 'Low impact' : value <= 6 ? 'Moderate impact' : 'High impact'}
      </Text>

      {/* Segmented control with touch */}
      <View
        style={styles.segmentedContainer}
        onLayout={(e) => {
          containerWidth.current = e.nativeEvent.layout.width;
          // react-native-web's LayoutEvent target is a DOM node and has no
          // .measure(); fall back to getBoundingClientRect on web.
          const target: any = e.target;
          if (target && typeof target.measure === 'function') {
            target.measure((_x: number, _y: number, _w: number, _h: number, pageX: number) => {
              containerX.current = pageX;
            });
          } else if (target && typeof target.getBoundingClientRect === 'function') {
            containerX.current = target.getBoundingClientRect().left;
          }
        }}
        {...panResponder.panHandlers}
      >
        <View style={styles.segmentedTrack}>
          {steps.map((step, index) => {
            const isSelected = step <= value;
            const isActive = step === value;
            const ratio = (step - min) / totalSteps;
            const segmentColor = getSegmentColor(ratio, isSelected);

            return (
              <Animated.View
                key={step}
                entering={FadeIn.delay(index * 30).duration(300)}
                style={[
                  styles.segment,
                  styles.segmentTouchable,
                  { backgroundColor: segmentColor },
                  isActive && styles.segmentActive,
                  index === 0 && styles.segmentFirst,
                  index === steps.length - 1 && styles.segmentLast,
                ]}
              >
                {isActive && (
                  <View style={styles.segmentGlow}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Step numbers */}
        <View style={styles.stepNumbers}>
          {steps.map((step) => {
            const ratio = (step - min) / totalSteps;
            return (
              <View key={step} style={styles.stepNumberTouchable}>
                <Text
                  style={[
                    styles.stepNumber,
                    step === value && styles.stepNumberActive,
                    step === value && { color: getSegmentColor(ratio, true) },
                  ]}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

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
  const [sliderValue, setSliderValue] = useState(1);
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

      </SafeAreaView>

      {/* Footer CTA */}
      {showCTA && (
        <View style={styles.footer}>
          <BlurView intensity={30} tint="dark" style={styles.footerBlur}>
            <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
              <View style={styles.footerInner}>
                <ShimmerCTA
                  title="Continue"
                  onPress={currentQuestion.type === 'slider' ? handleSliderSubmit : handleMultipleSubmit}
                  disabled={currentQuestion.type === 'multiple' && selectedOptions.length === 0}
                />
              </View>
            </SafeAreaView>
          </BlurView>
        </View>
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 24,
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
  gaugeValueWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gaugeValueGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  gaugeValueBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gaugeValue: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  gaugeDescription: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  segmentedContainer: {
    width: '100%',
    marginBottom: 16,
  },
  segmentedTrack: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  segmentTouchable: {
    flex: 1,
  },
  segment: {
    height: 32,
    borderRadius: 4,
    overflow: 'hidden',
  },
  segmentActive: {
    transform: [{ scaleY: 1.1 }],
  },
  segmentFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  segmentLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  stepNumbers: {
    flexDirection: 'row',
  },
  stepNumberTouchable: {
    flex: 1,
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  stepNumberActive: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  gaugeLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    paddingBottom: 16,
  },
});
