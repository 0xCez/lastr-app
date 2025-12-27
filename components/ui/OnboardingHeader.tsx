import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface OnboardingHeaderProps {
  progress?: number; // 0-100
  showBack?: boolean;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  progress,
  showBack = true,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.progressRow}>
        {showBack ? (
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        {progress !== undefined && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </View>
            </View>
          </View>
        )}

        {currentStep !== undefined && totalSteps !== undefined ? (
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>
              {currentStep}/{totalSteps}
            </Text>
          </View>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backPlaceholder: {
    width: 40,
    height: 40,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.text,
    fontFamily: 'Inter_500Medium',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
  },
  progressBarBg: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  progressTextContainer: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'Inter_600SemiBold',
  },
});
