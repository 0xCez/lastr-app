import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  comments: number;
  isAnonymous: boolean;
}

const forumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Just finished month 2 – massive improvements!',
    content: 'Month 2 down. The Kegel exercises are tough but showing real results now. I\'m feeling a lot more control, and the anxiety...',
    author: 'Alex B.',
    timestamp: '12d',
    likes: 223,
    comments: 34,
    isAnonymous: false,
  },
  {
    id: '2',
    title: '6 weeks in – didn\'t think it\'d work, but wow',
    content: '"I\'ll be honest, I didn\'t expect this app to actually make a difference, but 6 weeks in and the improvement is insane. The Start-Stop method...',
    author: 'James K.',
    timestamp: '1 hour ago',
    likes: 68,
    comments: 12,
    isAnonymous: false,
  },
  {
    id: '3',
    title: 'This app\'s actually legit – 3 weeks in...',
    content: 'Three weeks of sticking with the program, and already seeing changes. I\'ve always struggled with anxiety around sex...',
    author: 'Anonymous user',
    timestamp: '6h ago',
    likes: 7,
    comments: 3,
    isAnonymous: true,
  },
  {
    id: '4',
    title: 'Two months in – bigger changes than I expected',
    content: 'Halfway through the program and feeling a lot better. The Start-Stop method has definitely given me more control. Can\'t wait to complete the 90 days.',
    author: 'Chris L.',
    timestamp: '12h ago',
    likes: 1,
    comments: 0,
    isAnonymous: false,
  },
  {
    id: '5',
    title: 'Question about reverse kegels',
    content: 'I\'ve been doing the regular kegels but I\'m confused about reverse kegels. Can someone explain the difference and when to use each?',
    author: 'Anonymous user',
    timestamp: '2d',
    likes: 45,
    comments: 28,
    isAnonymous: true,
  },
];

type Tab = 'forum' | 'cornelius';

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('forum');
  const [sortBy, setSortBy] = useState('New');

  const renderPost = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity activeOpacity={0.7}>
      <Card style={styles.postCard}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.postFooter}>
          <View style={styles.postAuthor}>
            <View style={styles.authorAvatar}>
              <Ionicons
                name={item.isAnonymous ? 'eye-off' : 'person'}
                size={14}
                color={Colors.textMuted}
              />
            </View>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.postTimestamp}>· {item.timestamp}</Text>
          </View>
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color={Colors.error} />
              <Text style={styles.statText}>{item.likes}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={14} color={Colors.primary} />
              <Text style={styles.statText}>{item.comments}</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Community</Text>
          <Text style={styles.headerEmoji}>👥</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('forum')}
          style={[styles.tab, activeTab === 'forum' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'forum' && styles.tabTextActive]}>
            Forum
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('cornelius')}
          style={[styles.tab, activeTab === 'cornelius' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'cornelius' && styles.tabTextActive]}>
            Cornelius
          </Text>
        </TouchableOpacity>
        <View style={styles.sortContainer}>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortText}>{sortBy}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Forum Posts */}
      <FlatList
        data={forumPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Latest Discussions</Text>
          </View>
        }
      />

      {/* FAB for new post */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color={Colors.text} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  headerEmoji: {
    fontSize: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.card,
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
  sortContainer: {
    marginLeft: 'auto',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: 20,
  },
  sortText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  postCard: {
    marginBottom: 12,
  },
  postTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 8,
  },
  postContent: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    ...Typography.caption,
    color: Colors.error,
  },
  postTimestamp: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
