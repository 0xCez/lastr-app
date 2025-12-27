import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { symptoms } from '@/constants/onboarding';
import { OnboardingCTA } from '@/components/ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const categories = [
  { id: 'psychological', label: 'Psychological', icon: 'bulb-outline' as const },
  { id: 'physical', label: 'Physical', icon: 'body-outline' as const },
  { id: 'social', label: 'Social', icon: 'people-outline' as const },
] as const;

// Symptom Chip Component
interface SymptomChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

const SymptomChip: React.FC<SymptomChipProps> = ({ label, selected, onToggle }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <View style={[styles.chip, selected && styles.chipSelected]}>
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
        {selected && <Text style={styles.chipCheck}>✓</Text>}
      </View>
    </AnimatedPressable>
  );
};

export default function SymptomsScreen() {
  const { setSymptoms } = useOnboardingStore();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptomId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    }
  };

  const handleContinue = () => {
    setSymptoms(selectedSymptoms);
    router.push('/(onboarding)/education');
  };

  const renderCategory = (categoryId: string, label: string, icon: keyof typeof Ionicons.glyphMap) => {
    const categorySymptoms = symptoms.filter((s) => s.category === categoryId);

    return (
      <View key={categoryId} style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Ionicons name={icon} size={22} color={Colors.primary} />
          <Text style={styles.categoryLabel}>{label}</Text>
        </View>
        <View style={styles.chipsContainer}>
          {categorySymptoms.map((symptom) => (
            <SymptomChip
              key={symptom.id}
              label={symptom.label}
              selected={selectedSymptoms.includes(symptom.id)}
              onToggle={() => toggleSymptom(symptom.id)}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Select your symptoms</Text>
          <Text style={styles.subtitle}>
            Help us understand what you're experiencing
          </Text>
        </View>

        {/* Symptoms List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {categories.map(({ id, label, icon }) => renderCategory(id, label, icon))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <OnboardingCTA
            title="Continue"
            onPress={handleContinue}
            disabled={selectedSymptoms.length === 0}
          />
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
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  categoryContainer: {
    marginBottom: 28,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  categoryLabel: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.text,
  },
  chipCheck: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
});
