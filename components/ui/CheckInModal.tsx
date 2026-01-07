import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useUserStore, DURATION_OPTIONS } from '@/store/userStore';
import { Button } from './Button';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type Step = 'duration' | 'control' | 'confidence' | 'notes' | 'result';

export const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const { submitCheckIn, controlScore: previousScore, getScoreImprovement } = useUserStore();

  const [step, setStep] = useState<Step>('duration');
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [perceivedControl, setPerceivedControl] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [notes, setNotes] = useState('');
  const [newScore, setNewScore] = useState<number | null>(null);

  // Animation values
  const modalScale = useSharedValue(0.9);
  const modalOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const resultScale = useSharedValue(0.8);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15 });
      contentOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    } else {
      // Reset state when closing
      setStep('duration');
      setSelectedDuration(null);
      setPerceivedControl(5);
      setConfidence(5);
      setNotes('');
      setNewScore(null);
      modalOpacity.value = 0;
      modalScale.value = 0.9;
      contentOpacity.value = 0;
    }
  }, [visible]);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const resultStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
  }));

  const handleDurationSelect = async (value: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDuration(value);
  };

  const handleSliderChange = async (value: number, type: 'control' | 'confidence') => {
    await Haptics.selectionAsync();
    if (type === 'control') {
      setPerceivedControl(value);
    } else {
      setConfidence(value);
    }
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (step === 'duration' && selectedDuration) {
      setStep('control');
    } else if (step === 'control') {
      setStep('confidence');
    } else if (step === 'confidence') {
      setStep('notes');
    } else if (step === 'notes') {
      // Submit the check-in
      submitCheckIn(selectedDuration!, perceivedControl, confidence, notes || undefined);

      // Get the new score from the store
      const { controlScore } = useUserStore.getState();
      setNewScore(controlScore);

      // Animate to result
      setStep('result');
      resultScale.value = withSequence(
        withTiming(0.8, { duration: 0 }),
        withSpring(1, { damping: 12 })
      );

      // Show confetti if improved
      if (controlScore > previousScore) {
        confettiOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    modalOpacity.value = withTiming(0, { duration: 200 });
    modalScale.value = withTiming(0.9, { duration: 200 });
    setTimeout(() => {
      onClose();
      onComplete?.();
    }, 200);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'duration':
        return 'Weekly Check-in';
      case 'control':
        return 'How in control did you feel?';
      case 'confidence':
        return 'How confident are you feeling?';
      case 'notes':
        return 'Any notes? (Optional)';
      case 'result':
        return 'Check-in Complete!';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'duration':
        return 'How long did you last on average this week?';
      case 'control':
        return 'Rate your sense of control during intimacy';
      case 'confidence':
        return 'Rate your overall confidence level';
      case 'notes':
        return 'Add any thoughts or observations';
      case 'result':
        return 'Your progress has been recorded';
    }
  };

  const canProceed = () => {
    if (step === 'duration') return selectedDuration !== null;
    return true;
  };

  const renderDurationOptions = () => (
    <View style={styles.optionsContainer}>
      {DURATION_OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          style={[
            styles.optionCard,
            selectedDuration === option.value && styles.optionCardSelected,
          ]}
          onPress={() => handleDurationSelect(option.value)}
        >
          <LinearGradient
            colors={
              selectedDuration === option.value
                ? ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.1)']
                : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
            }
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.optionContent}>
            <Text style={[
              styles.optionLabel,
              selectedDuration === option.value && styles.optionLabelSelected,
            ]}>
              {option.label}
            </Text>
            {selectedDuration === option.value && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );

  const renderSlider = (value: number, type: 'control' | 'confidence') => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabelMin}>1</Text>
        <Text style={styles.sliderLabelMax}>10</Text>
      </View>
      <View style={styles.sliderTrack}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <Pressable
            key={num}
            style={[
              styles.sliderDot,
              num <= value && styles.sliderDotActive,
              num === value && styles.sliderDotCurrent,
            ]}
            onPress={() => handleSliderChange(num, type)}
          >
            {num === value && (
              <View style={styles.sliderDotInner}>
                <Text style={styles.sliderValue}>{num}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
      <View style={styles.sliderDescriptions}>
        <Text style={styles.sliderDesc}>Low</Text>
        <Text style={styles.sliderDesc}>High</Text>
      </View>
    </View>
  );

  const renderNotesInput = () => (
    <View style={styles.notesContainer}>
      <TextInput
        style={styles.notesInput}
        placeholder="What went well? What could improve?"
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={4}
        value={notes}
        onChangeText={setNotes}
        textAlignVertical="top"
      />
    </View>
  );

  const renderResult = () => {
    const improvement = getScoreImprovement();
    const improved = newScore !== null && newScore > previousScore;

    return (
      <Animated.View style={[styles.resultContainer, resultStyle]}>
        {/* Score display */}
        <View style={styles.scoreCircle}>
          <LinearGradient
            colors={improved ? ['#22C55E', '#16A34A'] : ['#8B5CF6', '#7C3AED']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.scoreNumber}>{newScore}</Text>
          <Text style={styles.scoreLabel}>Control Score</Text>
        </View>

        {/* Change indicator */}
        <View style={[
          styles.changeIndicator,
          improved ? styles.changePositive : styles.changeNeutral,
        ]}>
          <Ionicons
            name={improved ? 'trending-up' : 'remove'}
            size={18}
            color={improved ? '#22C55E' : Colors.textMuted}
          />
          <Text style={[
            styles.changeText,
            improved ? styles.changeTextPositive : styles.changeTextNeutral,
          ]}>
            {improved
              ? `+${newScore! - previousScore} points from last check-in`
              : 'Keep training consistently!'
            }
          </Text>
        </View>

        {/* Total improvement */}
        {improvement.points > 0 && (
          <View style={styles.totalImprovement}>
            <Ionicons name="trophy" size={20} color="#F59E0B" />
            <Text style={styles.totalImprovementText}>
              +{improvement.points} points ({improvement.percentage}%) since you started
            </Text>
          </View>
        )}

        {/* Encouragement message */}
        <Text style={styles.encouragementText}>
          {improved
            ? "Amazing progress! Your hard work is paying off."
            : "Every check-in brings you closer to your goals. Keep going!"
          }
        </Text>
      </Animated.View>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 'duration':
        return renderDurationOptions();
      case 'control':
        return renderSlider(perceivedControl, 'control');
      case 'confidence':
        return renderSlider(confidence, 'confidence');
      case 'notes':
        return renderNotesInput();
      case 'result':
        return renderResult();
    }
  };

  const getProgressDots = () => {
    const steps: Step[] = ['duration', 'control', 'confidence', 'notes'];
    const currentIndex = steps.indexOf(step);

    if (step === 'result') return null;

    return (
      <View style={styles.progressDots}>
        {steps.map((s, i) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              i <= currentIndex && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdropPressable} onPress={handleClose} />
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <LinearGradient
            colors={['#1A1A25', '#12121A', '#0A0A0F']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.3)', 'rgba(139, 92, 246, 0.1)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <Ionicons
                    name={step === 'result' ? 'checkmark-circle' : 'pulse'}
                    size={24}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>{getStepTitle()}</Text>
                  <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
                </View>
              </View>
              {step !== 'result' && (
                <Pressable style={styles.closeButton} onPress={handleClose}>
                  <Ionicons name="close" size={24} color={Colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Progress dots */}
            {getProgressDots()}

            {/* Content */}
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Animated.View style={contentStyle}>
                {renderStepContent()}
              </Animated.View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              {step === 'result' ? (
                <Button
                  title="Done"
                  onPress={handleClose}
                  variant="primary"
                />
              ) : (
                <>
                  {step !== 'duration' && (
                    <Button
                      title="Back"
                      onPress={() => {
                        const steps: Step[] = ['duration', 'control', 'confidence', 'notes'];
                        const currentIndex = steps.indexOf(step);
                        if (currentIndex > 0) {
                          setStep(steps[currentIndex - 1]);
                        }
                      }}
                      variant="ghost"
                      style={{ flex: 0.4 }}
                    />
                  )}
                  <Button
                    title={step === 'notes' ? 'Submit' : 'Continue'}
                    onPress={handleNext}
                    disabled={!canProceed()}
                    style={{ flex: step === 'duration' ? 1 : 0.6 }}
                  />
                </>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: SCREEN_WIDTH - 32,
    maxHeight: SCREEN_HEIGHT * 0.8,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalGradient: {
    borderRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionCardSelected: {
    borderColor: Colors.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  optionLabelSelected: {
    color: Colors.text,
  },
  sliderContainer: {
    paddingVertical: 20,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sliderLabelMin: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  sliderLabelMax: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 8,
  },
  sliderDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderDotActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  sliderDotCurrent: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
  },
  sliderDotInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  sliderDescriptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sliderDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  notesContainer: {
    paddingVertical: 8,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -4,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  changePositive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  changeNeutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  changeText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  changeTextPositive: {
    color: '#22C55E',
  },
  changeTextNeutral: {
    color: Colors.textMuted,
  },
  totalImprovement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  totalImprovementText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#F59E0B',
  },
  encouragementText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
