import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { exercises, getExercisesByCategory, Exercise } from '@/constants/exercises';

type Tab = 'cognitive' | 'physical';

export default function LearnScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('cognitive');

  const cognitiveExercises = getExercisesByCategory('cognitive');
  const physicalExercises = getExercisesByCategory('physical');

  const currentExercises = activeTab === 'cognitive' ? cognitiveExercises : physicalExercises;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return Colors.success;
      case 'intermediate':
        return Colors.warning;
      case 'advanced':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };

  const getCategoryIcon = (category: string) => {
    return category === 'cognitive' ? 'bulb' : 'fitness';
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      onPress={() => router.push(`/exercise/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <View style={[styles.exerciseIcon, { backgroundColor: `${Colors.primary}20` }]}>
            <Ionicons
              name={getCategoryIcon(item.category) as any}
              size={24}
              color={Colors.primary}
            />
          </View>
          <View style={styles.exerciseMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(item.difficulty)}20` }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                {item.difficulty}
              </Text>
            </View>
            <Text style={styles.exerciseDuration}>{item.duration}</Text>
          </View>
        </View>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.exerciseFooter}>
          {item.sets && (
            <Text style={styles.exerciseStat}>{item.sets} sets</Text>
          )}
          {item.reps && (
            <Text style={styles.exerciseStat}>{item.reps} reps</Text>
          )}
          {item.holdTime && !item.sets && (
            <Text style={styles.exerciseStat}>{item.holdTime}s hold</Text>
          )}
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learn</Text>
        <Text style={styles.headerSubtitle}>Master your control with science-backed exercises</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('cognitive')}
          style={[styles.tab, activeTab === 'cognitive' && styles.tabActive]}
        >
          <Ionicons
            name="bulb"
            size={20}
            color={activeTab === 'cognitive' ? Colors.text : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'cognitive' && styles.tabTextActive]}>
            Cognitive
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('physical')}
          style={[styles.tab, activeTab === 'physical' && styles.tabActive]}
        >
          <Ionicons
            name="fitness"
            size={20}
            color={activeTab === 'physical' ? Colors.text : Colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'physical' && styles.tabTextActive]}>
            Physical
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Description */}
      <View style={styles.tabDescription}>
        <Text style={styles.tabDescriptionText}>
          {activeTab === 'cognitive'
            ? 'Train your mind to control arousal and delay climax through mental techniques.'
            : 'Strengthen your pelvic floor muscles for better physical control during intimacy.'}
        </Text>
      </View>

      {/* Exercises List */}
      <FlatList
        data={currentExercises}
        renderItem={renderExerciseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 20,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.text,
  },
  tabDescription: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabDescriptionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  exerciseCard: {
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  exerciseDuration: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  exerciseName: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 6,
  },
  exerciseDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  exerciseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseStat: {
    ...Typography.caption,
    color: Colors.textMuted,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  arrowContainer: {
    marginLeft: 'auto',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
