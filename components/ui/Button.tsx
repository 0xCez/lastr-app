import React from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Pressable,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressHighlightStyle = useAnimatedStyle(() => ({
    opacity: pressed.value * 0.5,
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
      pressed.value = withSpring(1, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    pressed.value = withSpring(0, { damping: 15 });
  };

  const handlePress = async () => {
    if (!disabled && !loading) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 14 };
      default:
        return { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 14 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 17;
      default:
        return 16;
    }
  };

  const sizeStyles = getSizeStyles();

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : '#FFFFFF'} />
      ) : (
        <View style={styles.contentRow}>
          {icon}
          <Text style={[
            styles.text,
            { fontSize: getTextSize() },
            variant === 'outline' && styles.outlineText,
            variant === 'ghost' && styles.ghostText,
            disabled && styles.disabledText,
            textStyle,
          ]}>
            {title}
          </Text>
        </View>
      )}
    </>
  );

  // Primary variant with gradient
  if (variant === 'primary') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          animatedStyle,
          disabled && styles.containerDisabled,
          style,
        ]}
      >
        {/* Outer glow */}
        {!disabled && (
          <View style={[styles.glow, { borderRadius: sizeStyles.borderRadius + 8 }]}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0)']}
              style={styles.glowGradient}
            />
          </View>
        )}

        {/* Main button */}
        <LinearGradient
          colors={disabled ? ['#2A2A3A', '#232330'] : ['#8B5CF6', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles]}
        >
          {/* Inner shine */}
          {!disabled && (
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.shine, { borderRadius: sizeStyles.borderRadius }]}
            />
          )}

          {/* Press highlight */}
          <Animated.View style={[styles.pressHighlight, pressHighlightStyle]} />

          {content}
        </LinearGradient>

        {/* Bottom edge */}
        {!disabled && (
          <View style={[styles.bottomEdge, { borderRadius: sizeStyles.borderRadius }]}>
            <LinearGradient
              colors={['rgba(109, 40, 217, 0.8)', 'rgba(109, 40, 217, 0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bottomEdgeGradient}
            />
          </View>
        )}
      </AnimatedPressable>
    );
  }

  // Secondary variant
  if (variant === 'secondary') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          animatedStyle,
          disabled && styles.containerDisabled,
          style,
        ]}
      >
        <View style={[styles.secondaryButton, sizeStyles]}>
          <Animated.View style={[styles.pressHighlight, pressHighlightStyle]} />
          {content}
        </View>
      </AnimatedPressable>
    );
  }

  // Outline variant
  if (variant === 'outline') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.container,
          fullWidth && styles.fullWidth,
          animatedStyle,
          disabled && styles.containerDisabled,
          style,
        ]}
      >
        <View style={[styles.outlineButton, sizeStyles]}>
          <Animated.View style={[styles.pressHighlight, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }, pressHighlightStyle]} />
          {content}
        </View>
      </AnimatedPressable>
    );
  }

  // Ghost variant
  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        animatedStyle,
        disabled && styles.containerDisabled,
        style,
      ]}
    >
      <View style={[styles.ghostButton, sizeStyles]}>
        <Animated.View style={[styles.pressHighlight, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }, pressHighlightStyle]} />
        {content}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  glow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    overflow: 'hidden',
  },
  glowGradient: {
    flex: 1,
    opacity: 0.6,
  },
  gradient: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  pressHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomEdge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    overflow: 'hidden',
  },
  bottomEdgeGradient: {
    flex: 1,
  },
  secondaryButton: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  outlineButton: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  ghostButton: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  outlineText: {
    color: Colors.primary,
  },
  ghostText: {
    color: Colors.text,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});
