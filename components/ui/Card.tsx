import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'gradient' | 'highlighted';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: 12 };
      case 'medium':
        return { padding: 16 };
      case 'large':
        return { padding: 24 };
    }
  };

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.gradientCard, getPaddingStyle(), style]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (variant === 'highlighted') {
    return (
      <View style={[styles.card, styles.highlightedCard, getPaddingStyle(), style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.card, getPaddingStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gradientCard: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  highlightedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
});
