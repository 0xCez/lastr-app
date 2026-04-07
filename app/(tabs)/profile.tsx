import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useUserStore } from '@/store/userStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { DEMO_MODE } from '@/lib/demo';

interface SettingItem {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  color?: string;
}

export default function ProfileScreen() {
  const { isPremium, currentStreak, longestStreak, controlScore } = useUserStore();
  const { reset: resetOnboarding } = useOnboardingStore();
  const { setPremium, setOnboardingCompleted } = useUserStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Reset stores and navigate to onboarding
            resetOnboarding();
            setPremium(false);
            setOnboardingCompleted(false);
            router.replace('/(onboarding)');
          },
        },
      ]
    );
  };

  const handleRestorePurchases = () => {
    Alert.alert('Restore Purchases', 'Looking for previous purchases...');
  };

  const settingsGroups: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Personal Info',
          showArrow: true,
          onPress: () => {},
        },
        {
          icon: 'card-outline',
          label: 'Subscription',
          value: isPremium ? 'Premium' : 'Free',
          showArrow: true,
          onPress: () => {},
        },
        {
          icon: 'refresh-outline',
          label: 'Restore Purchases',
          showArrow: true,
          onPress: handleRestorePurchases,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          showArrow: true,
          onPress: () => {},
        },
        {
          icon: 'time-outline',
          label: 'Reminders',
          value: '9:00 AM',
          showArrow: true,
          onPress: () => {},
        },
        {
          icon: 'language-outline',
          label: 'Language',
          value: 'English',
          showArrow: true,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help Center',
          showArrow: true,
          onPress: () => {},
        },
        {
          icon: 'chatbubble-outline',
          label: 'Contact Us',
          showArrow: true,
          onPress: () => {},
        },
        {
          icon: 'star-outline',
          label: 'Rate App',
          showArrow: true,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: 'document-text-outline',
          label: 'Terms of Service',
          showArrow: true,
          onPress: () => {},
        },
        {
          icon: 'shield-outline',
          label: 'Privacy Policy',
          showArrow: true,
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color={Colors.text} />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>User</Text>
            <Text style={styles.profileStatus}>
              {isPremium ? 'Premium Member' : 'Free Account'}
            </Text>
          </View>
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{currentStreak || 7}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{longestStreak || 14}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{controlScore}</Text>
            <Text style={styles.statLabel}>Control Score</Text>
          </Card>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Card style={styles.settingsCard} padding="none">
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  onPress={item.onPress}
                  style={[
                    styles.settingItem,
                    itemIndex < group.items.length - 1 && styles.settingItemBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={item.color || Colors.textSecondary}
                    />
                    <Text style={[styles.settingLabel, item.color && { color: item.color }]}>
                      {item.label}
                    </Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.value && (
                      <Text style={styles.settingValue}>{item.value}</Text>
                    )}
                    {item.showArrow && (
                      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Sign Out Button — hidden in demo mode (no real account) */}
        {!DEMO_MODE && (
          <TouchableOpacity onPress={handleLogout} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginTop: 8,
    marginBottom: 20,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.h3,
    color: Colors.text,
  },
  profileStatus: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    ...Typography.statSmall,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  signOutText: {
    ...Typography.body,
    color: Colors.error,
  },
  version: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
});
