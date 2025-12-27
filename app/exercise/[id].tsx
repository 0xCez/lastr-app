import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { getExerciseById } from '@/constants/exercises';

// Map specific exercise IDs to their dedicated pages
const DEDICATED_PAGES: Record<string, string> = {
  'breathing-448': '/exercise/breathing',
  'body-scan': '/exercise/body-scan',
};

// Physical exercise IDs that should use the physical template
const PHYSICAL_EXERCISE_IDS = [
  'kegel-basic',
  'reverse-kegel',
  'bridge-hold',
  'butterfly-stretch',
  'pelvic-stretching',
  'advanced-kegels',
  'quick-flicks',
  'hip-flexor-stretch',
  'deep-squat-hold',
  'cat-cow',
  'dead-bug',
  'glute-bridges',
  'plank-hold',
];

export default function ExerciseRouter() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Check if this exercise has a dedicated page
  if (id && DEDICATED_PAGES[id]) {
    return <Redirect href={DEDICATED_PAGES[id] as any} />;
  }

  // Check if this is a physical exercise
  if (id && PHYSICAL_EXERCISE_IDS.includes(id)) {
    return <Redirect href={`/exercise/physical?id=${id}` as any} />;
  }

  // For cognitive exercises without dedicated pages, redirect to physical template
  // (it handles all variants including instructions-only)
  const exercise = id ? getExerciseById(id) : null;
  if (exercise) {
    return <Redirect href={`/exercise/physical?id=${id}` as any} />;
  }

  // Fallback for not found
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Exercise not found</Text>
        <Text style={styles.notFoundSubtext}>ID: {id || 'unknown'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  notFoundSubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
});
