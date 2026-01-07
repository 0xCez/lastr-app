import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import { ShimmerCTA } from '@/components/ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Enhanced symptoms data with icons and colors
const symptomCategories = [
  {
    id: 'psychological',
    label: 'Psychological',
    icon: 'cloudy-outline' as const,
    color: '#A78BFA',
    symptoms: [
      { id: 'anxiety', label: 'Performance anxiety', icon: 'pulse-outline' },
      { id: 'overthinking', label: 'Overthinking during sex', icon: 'chatbubble-ellipses-outline' },
      { id: 'confidence', label: 'Loss of confidence', icon: 'trending-down-outline' },
      { id: 'anticipation', label: 'Anticipating failure', icon: 'alert-circle-outline' },
      { id: 'stress', label: 'General stress', icon: 'thunderstorm-outline' },
      { id: 'depression', label: 'Feelings of inadequacy', icon: 'sad-outline' },
    ],
  },
  {
    id: 'physical',
    label: 'Physical',
    icon: 'body-outline' as const,
    color: '#60A5FA',
    symptoms: [
      { id: 'sensitivity', label: 'High sensitivity', icon: 'flash-outline' },
      { id: 'tension', label: 'Pelvic muscle tension', icon: 'fitness-outline' },
      { id: 'arousal', label: 'Quick arousal patterns', icon: 'speedometer-outline' },
      { id: 'breathing', label: 'Shallow breathing', icon: 'leaf-outline' },
      { id: 'erection', label: 'Erection issues', icon: 'warning-outline' },
    ],
  },
  {
    id: 'social',
    label: 'Relationship & Social',
    icon: 'people-outline' as const,
    color: '#F472B6',
    symptoms: [
      { id: 'relationship_strain', label: 'Relationship strain', icon: 'heart-dislike-outline' },
      { id: 'avoidance', label: 'Avoiding intimacy', icon: 'close-circle-outline' },
      { id: 'communication', label: 'Difficulty discussing it', icon: 'chatbubbles-outline' },
      { id: 'partner_dissatisfaction', label: 'Partner dissatisfaction', icon: 'person-outline' },
      { id: 'dating_fear', label: 'Fear of new relationships', icon: 'shield-outline' },
    ],
  },
];

// Symptom Card Component
interface SymptomCardProps {
  symptom: { id: string; label: string; icon: string };
  selected: boolean;
  onToggle: () => void;
  categoryColor: string;
  index: number;
}

const SymptomCard: React.FC<SymptomCardProps> = ({
  symptom,
  selected,
  onToggle,
  categoryColor,
  index,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: pressed.value * 0.3,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    pressed.value = withSpring(1, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    pressed.value = withSpring(0, { damping: 15 });
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).duration(300).springify().damping(15)}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        <View style={[styles.symptomCard, selected && styles.symptomCardSelected]}>
          {/* Selection glow */}
          {selected && (
            <LinearGradient
              colors={[`${categoryColor}20`, `${categoryColor}08`]}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
            />
          )}

          {/* Press highlight */}
          <Animated.View style={[styles.pressHighlight, innerGlowStyle]} />

          {/* Icon */}
          <View
            style={[
              styles.symptomIconWrap,
              { backgroundColor: selected ? `${categoryColor}25` : 'rgba(255, 255, 255, 0.06)' },
              selected && { borderColor: `${categoryColor}40` },
            ]}
          >
            <Ionicons
              name={symptom.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={selected ? categoryColor : Colors.textSecondary}
            />
          </View>

          {/* Label */}
          <Text style={[styles.symptomLabel, selected && styles.symptomLabelSelected]}>
            {symptom.label}
          </Text>

          {/* Checkbox */}
          <View style={[styles.checkbox, selected && { backgroundColor: categoryColor, borderColor: categoryColor }]}>
            {selected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

// Category Section Component
interface CategorySectionProps {
  category: typeof symptomCategories[0];
  selectedSymptoms: string[];
  onToggleSymptom: (id: string) => void;
  index: number;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  selectedSymptoms,
  onToggleSymptom,
  index,
}) => {
  const selectedInCategory = category.symptoms.filter((s) =>
    selectedSymptoms.includes(s.id)
  ).length;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(400)}
      style={styles.categorySection}
    >
      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIconWrap, { backgroundColor: `${category.color}20` }]}>
          <Ionicons name={category.icon} size={20} color={category.color} />
        </View>
        <View style={styles.categoryTitleWrap}>
          <Text style={styles.categoryLabel}>{category.label}</Text>
          {selectedInCategory > 0 && (
            <View style={[styles.categoryBadge, { backgroundColor: `${category.color}25` }]}>
              <Text style={[styles.categoryBadgeText, { color: category.color }]}>
                {selectedInCategory} selected
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Symptoms Grid */}
      <View style={styles.symptomsGrid}>
        {category.symptoms.map((symptom, symptomIndex) => (
          <SymptomCard
            key={symptom.id}
            symptom={symptom}
            selected={selectedSymptoms.includes(symptom.id)}
            onToggle={() => onToggleSymptom(symptom.id)}
            categoryColor={category.color}
            index={symptomIndex}
          />
        ))}
      </View>
    </Animated.View>
  );
};

export default function SymptomsScreen() {
  const { setSymptoms } = useOnboardingStore();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(20);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    headerY.value = withDelay(100, withSpring(0, { damping: 15 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const toggleSymptom = (symptomId: string) => {
    if (selectedSymptoms.includes(symptomId)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptomId));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    }
  };

  const handleContinue = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSymptoms(selectedSymptoms);
    router.push('/(onboarding)/education');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#12121F']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerBadge}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.08)']}
              style={styles.headerBadgeGradient}
            >
              <Ionicons name="medical-outline" size={14} color={Colors.primary} />
              <Text style={styles.headerBadgeText}>PERSONALIZATION</Text>
            </LinearGradient>
          </View>
          <Text style={styles.title}>What symptoms do you experience?</Text>
          <Text style={styles.subtitle}>
            Select all that apply - this helps us customize your training plan
          </Text>
        </Animated.View>

        {/* Selection Counter */}
        {selectedSymptoms.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.selectionCounter}
          >
            <View style={styles.selectionCounterInner}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={styles.selectionCounterText}>
                {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Symptoms List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {symptomCategories.map((category, index) => (
            <CategorySection
              key={category.id}
              category={category}
              selectedSymptoms={selectedSymptoms}
              onToggleSymptom={toggleSymptom}
              index={index}
            />
          ))}
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
                disabled={selectedSymptoms.length === 0}
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerBadge: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  headerBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  headerBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  selectionCounter: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  selectionCounterInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 10,
  },
  selectionCounterText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    gap: 24,
  },
  categorySection: {
    gap: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryLabel: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.text,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  symptomsGrid: {
    gap: 8,
  },
  symptomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  symptomCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  pressHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
  },
  symptomIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  symptomLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  symptomLabelSelected: {
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
