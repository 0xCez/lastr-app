import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface AnimatedIconProps {
  type: 'heartbreak' | 'sad' | 'people' | 'sync' | 'check' | 'growth' | 'shield' | 'brain' | 'target';
  size?: number;
  color?: string;
  isPositive?: boolean;
}

// Premium Heartbreak Icon - Pulsing broken heart with crack animation
const HeartbreakIcon = ({ size = 56 }: { size?: number }) => {
  const pulse = useSharedValue(1);
  const shake = useSharedValue(0);
  const crackProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.2);

  useEffect(() => {
    // Heartbeat pulse
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) }),
        withTiming(1.1, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.in(Easing.ease) }),
        withDelay(800, withTiming(1, { duration: 0 }))
      ),
      -1
    );

    // Subtle shake
    shake.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 50 }),
        withTiming(2, { duration: 50 }),
        withTiming(-1, { duration: 50 }),
        withTiming(1, { duration: 50 }),
        withTiming(0, { duration: 50 }),
        withDelay(1400, withTiming(0, { duration: 0 }))
      ),
      -1
    );

    // Crack animation
    crackProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }),
        withDelay(1200, withTiming(0, { duration: 200 }))
      ),
      -1
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 600 }),
        withTiming(0.15, { duration: 600 })
      ),
      -1,
      true
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulse.value },
      { translateX: shake.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow effect */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size * 0.7,
            backgroundColor: '#EF4444',
          },
          glowStyle
        ]}
      />
      <Animated.View style={containerStyle}>
        <Svg width={size} height={size} viewBox="0 0 56 56">
          {/* Heart shape */}
          <Path
            d="M28 50C28 50 6 35 6 20C6 12 12 6 20 6C24.5 6 28 9 28 9C28 9 31.5 6 36 6C44 6 50 12 50 20C50 35 28 50 28 50Z"
            fill="#EF4444"
            opacity={0.25}
          />
          <Path
            d="M28 50C28 50 6 35 6 20C6 12 12 6 20 6C24.5 6 28 9 28 9C28 9 31.5 6 36 6C44 6 50 12 50 20C50 35 28 50 28 50Z"
            stroke="#EF4444"
            strokeWidth={2.5}
            fill="none"
          />
          {/* Jagged crack line */}
          <Path
            d="M28 12L24 20L32 24L26 32L30 38L28 46"
            stroke="#EF4444"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Premium Sad Face - With animated tear drops
const SadIcon = ({ size = 56 }: { size?: number }) => {
  const tearDrop1 = useSharedValue(0);
  const tearDrop2 = useSharedValue(0);
  const eyesBlink = useSharedValue(1);

  useEffect(() => {
    // Tear 1 animation
    tearDrop1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 0 })
      ),
      -1
    );

    // Tear 2 animation (delayed)
    tearDrop2.value = withDelay(600, withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 0 })
      ),
      -1
    ));

    // Eye blink
    eyesBlink.value = withRepeat(
      withSequence(
        withDelay(2500, withTiming(0.1, { duration: 100 })),
        withTiming(1, { duration: 100 })
      ),
      -1
    );
  }, []);

  const tear1Style = useAnimatedStyle(() => ({
    opacity: interpolate(tearDrop1.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(tearDrop1.value, [0, 1], [0, 20]) },
      { scale: interpolate(tearDrop1.value, [0, 0.5, 1], [0.5, 1, 0.3]) },
    ],
  }));

  const tear2Style = useAnimatedStyle(() => ({
    opacity: interpolate(tearDrop2.value, [0, 0.2, 0.8, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(tearDrop2.value, [0, 1], [0, 18]) },
      { scale: interpolate(tearDrop2.value, [0, 0.5, 1], [0.5, 1, 0.3]) },
    ],
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyesBlink.value }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow */}
      <View
        style={{
          position: 'absolute',
          width: size * 1.3,
          height: size * 1.3,
          borderRadius: size * 0.65,
          backgroundColor: '#F59E0B',
          opacity: 0.15,
        }}
      />
      <Svg width={size} height={size} viewBox="0 0 56 56">
        {/* Face circle */}
        <Circle cx="28" cy="28" r="24" fill="#F59E0B" opacity={0.2} />
        <Circle cx="28" cy="28" r="24" stroke="#F59E0B" strokeWidth={2.5} fill="none" />

        {/* Frown */}
        <Path
          d="M18 38C20 34 24 32 28 32C32 34 36 34 38 38"
          stroke="#F59E0B"
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyebrows (worried) */}
        <Path d="M16 18L22 20" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
        <Path d="M40 18L34 20" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" />
      </Svg>

      {/* Animated eyes */}
      <Animated.View style={[{ position: 'absolute', top: size * 0.35 }, eyeStyle]}>
        <Svg width={size * 0.5} height={size * 0.15} viewBox="0 0 28 8">
          <Circle cx="6" cy="4" r="3.5" fill="#F59E0B" />
          <Circle cx="22" cy="4" r="3.5" fill="#F59E0B" />
        </Svg>
      </Animated.View>

      {/* Tear drops */}
      <Animated.View style={[{ position: 'absolute', left: size * 0.32, top: size * 0.42 }, tear1Style]}>
        <Svg width={8} height={12} viewBox="0 0 8 12">
          <Path d="M4 0C4 0 8 6 8 9C8 10.65 6.2 12 4 12C1.8 12 0 10.65 0 9C0 6 4 0 4 0Z" fill="#60A5FA" />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: size * 0.58, top: size * 0.42 }, tear2Style]}>
        <Svg width={8} height={12} viewBox="0 0 8 12">
          <Path d="M4 0C4 0 8 6 8 9C8 10.65 6.2 12 4 12C1.8 12 0 10.65 0 9C0 6 4 0 4 0Z" fill="#60A5FA" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Premium People Icon - Animated connection
const PeopleIcon = ({ size = 56 }: { size?: number }) => {
  const wave = useSharedValue(0);
  const connect = useSharedValue(0);
  const glow = useSharedValue(0.2);

  useEffect(() => {
    wave.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    connect.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withDelay(500, withTiming(0, { duration: 1000 }))
      ),
      -1
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 1000 }),
        withTiming(0.15, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const person1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(wave.value, [0, 1], [0, 3]) },
    ],
  }));

  const person2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(wave.value, [0, 1], [0, -3]) },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.3,
            height: size * 1.3,
            borderRadius: size * 0.65,
            backgroundColor: '#8B5CF6',
          },
          glowStyle
        ]}
      />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        {/* Left person */}
        <Animated.View style={person1Style}>
          <Svg width={size * 0.45} height={size * 0.7} viewBox="0 0 24 36">
            <Circle cx="12" cy="8" r="6" fill="#8B5CF6" opacity={0.3} />
            <Circle cx="12" cy="8" r="5" stroke="#8B5CF6" strokeWidth={2} fill="none" />
            <Path
              d="M4 36V30C4 25 8 22 12 22C16 22 20 25 20 30V36"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* Right person */}
        <Animated.View style={[{ marginLeft: -size * 0.1 }, person2Style]}>
          <Svg width={size * 0.45} height={size * 0.7} viewBox="0 0 24 36">
            <Circle cx="12" cy="8" r="6" fill="#A78BFA" opacity={0.3} />
            <Circle cx="12" cy="8" r="5" stroke="#A78BFA" strokeWidth={2} fill="none" />
            <Path
              d="M4 36V30C4 25 8 22 12 22C16 22 20 25 20 30V36"
              stroke="#A78BFA"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

// Premium Sync/Cycle Icon - Smooth rotation with trail effect
const SyncIcon = ({ size = 56 }: { size?: number }) => {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1250 }),
        withTiming(1, { duration: 1250 })
      ),
      -1,
      true
    );
  }, []);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow */}
      <View
        style={{
          position: 'absolute',
          width: size * 1.3,
          height: size * 1.3,
          borderRadius: size * 0.65,
          backgroundColor: '#06B6D4',
          opacity: 0.15,
        }}
      />
      <Animated.View style={[pulseStyle]}>
        <Animated.View style={rotateStyle}>
          <Svg width={size} height={size} viewBox="0 0 56 56">
            {/* Outer ring */}
            <Circle cx="28" cy="28" r="22" stroke="#06B6D4" strokeWidth={3} fill="none" opacity={0.2} />

            {/* Animated arrows */}
            <G>
              <Path
                d="M28 8C38 8 46 16 46 26"
                stroke="#06B6D4"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
              <Path d="M46 20L46 28L38 28" stroke="#06B6D4" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />

              <Path
                d="M28 48C18 48 10 40 10 30"
                stroke="#06B6D4"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
              <Path d="M10 36L10 28L18 28" stroke="#06B6D4" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </G>
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// Premium Check/Success Icon - Animated draw with celebration
const CheckIcon = ({ size = 56 }: { size?: number }) => {
  const checkDraw = useSharedValue(0);
  const circleScale = useSharedValue(0.8);
  const glowPulse = useSharedValue(0.2);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    // Circle pops in
    circleScale.value = withSpring(1, { damping: 10, stiffness: 100 });

    // Check draws
    checkDraw.value = withDelay(200, withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }));

    // Continuous glow
    glowPulse.value = withDelay(600, withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800 }),
        withTiming(0.2, { duration: 800 })
      ),
      -1,
      true
    ));

    // Sparkle effect
    sparkle.value = withDelay(400, withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      true
    ));
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkle.value,
    transform: [{ scale: interpolate(sparkle.value, [0, 1], [0.8, 1.2]) }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            backgroundColor: '#22C55E',
          },
          glowStyle
        ]}
      />

      {/* Sparkles */}
      <Animated.View style={[{ position: 'absolute' }, sparkleStyle]}>
        <Svg width={size * 1.6} height={size * 1.6} viewBox="0 0 80 80">
          <Circle cx="15" cy="15" r="2" fill="#22C55E" />
          <Circle cx="65" cy="15" r="2" fill="#22C55E" />
          <Circle cx="15" cy="65" r="2" fill="#22C55E" />
          <Circle cx="65" cy="65" r="2" fill="#22C55E" />
          <Circle cx="40" cy="5" r="1.5" fill="#22C55E" />
          <Circle cx="40" cy="75" r="1.5" fill="#22C55E" />
        </Svg>
      </Animated.View>

      <Animated.View style={circleStyle}>
        <Svg width={size} height={size} viewBox="0 0 56 56">
          {/* Background circle */}
          <Circle cx="28" cy="28" r="24" fill="#22C55E" opacity={0.2} />
          <Circle cx="28" cy="28" r="24" stroke="#22C55E" strokeWidth={2.5} fill="none" />

          {/* Checkmark */}
          <Path
            d="M16 28L24 36L40 20"
            stroke="#22C55E"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Premium Growth Icon - Animated plant growing
const GrowthIcon = ({ size = 56 }: { size?: number }) => {
  const sway = useSharedValue(0);

  useEffect(() => {
    // Continuous sway
    sway.value = withDelay(800, withRepeat(
      withSequence(
        withTiming(4, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ));
  }, []);

  const plantStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${sway.value}deg` },
    ],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow */}
      <View
        style={{
          position: 'absolute',
          width: size * 1.3,
          height: size * 1.3,
          borderRadius: size * 0.65,
          backgroundColor: '#22C55E',
          opacity: 0.15,
        }}
      />
      <Animated.View style={plantStyle}>
        <Svg width={size} height={size} viewBox="0 0 56 56">
          {/* Pot */}
          <Path
            d="M18 48L20 42H36L38 48H18Z"
            fill="#8B5CF6"
            opacity={0.3}
          />
          <Path
            d="M18 48L20 42H36L38 48H18Z"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="none"
          />

          {/* Stem */}
          <Path
            d="M28 42V18"
            stroke="#22C55E"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Right leaf */}
          <Path
            d="M28 22C28 22 40 18 44 10C40 18 36 24 28 26"
            fill="#22C55E"
            opacity={0.4}
          />
          <Path
            d="M28 22C28 22 40 18 44 10"
            stroke="#22C55E"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />

          {/* Left leaf */}
          <Path
            d="M28 30C28 30 16 26 12 18C16 26 20 32 28 34"
            fill="#22C55E"
            opacity={0.4}
          />
          <Path
            d="M28 30C28 30 16 26 12 18"
            stroke="#22C55E"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />

          {/* Top bud */}
          <Circle cx="28" cy="14" r="5" fill="#22C55E" opacity={0.5} />
          <Circle cx="28" cy="14" r="4" stroke="#22C55E" strokeWidth={1.5} fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Target/Focus Icon - Clean crosshair with pulse animation
export const MeditationIcon = ({ size = 120 }: { size?: number }) => {
  const pulseScale = useSharedValue(1);
  const innerPulse = useSharedValue(0.5);

  useEffect(() => {
    // Outer ring pulse
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Inner dot pulse
    innerPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.1], [0.8, 0.4]),
  }));

  const innerDotStyle = useAnimatedStyle(() => ({
    opacity: innerPulse.value,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer pulse ring */}
      <Animated.View style={[{ position: 'absolute' }, outerRingStyle]}>
        <Svg width={size * 0.7} height={size * 0.7} viewBox="0 0 70 70">
          <Circle cx="35" cy="35" r="32" stroke="#8B5CF6" strokeWidth="2" fill="none" />
        </Svg>
      </Animated.View>

      {/* Static crosshair */}
      <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 50 50">
        {/* Outer circle */}
        <Circle cx="25" cy="25" r="20" stroke="#8B5CF6" strokeWidth="2.5" fill="none" />

        {/* Inner circle */}
        <Circle cx="25" cy="25" r="10" stroke="#8B5CF6" strokeWidth="2" fill="none" opacity="0.6" />

        {/* Crosshair lines */}
        <Path d="M25 2L25 12" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        <Path d="M25 38L25 48" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        <Path d="M2 25L12 25" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        <Path d="M38 25L48 25" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
      </Svg>

      {/* Center dot with pulse */}
      <Animated.View style={[{ position: 'absolute' }, innerDotStyle]}>
        <Svg width={12} height={12} viewBox="0 0 12 12">
          <Circle cx="6" cy="6" r="5" fill="#A78BFA" />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Rocket/Growth Icon - Clean upward arrow with motion trail
export const LeafIcon = ({ size = 120 }: { size?: number }) => {
  const floatY = useSharedValue(0);
  const trailOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Gentle float animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Trail pulse
    trailOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const trailStyle = useAnimatedStyle(() => ({
    opacity: trailOpacity.value,
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Motion trails */}
      <Animated.View style={[{ position: 'absolute' }, trailStyle]}>
        <Svg width={size * 0.5} height={size * 0.6} viewBox="0 0 50 60">
          <Path d="M25 60L25 45" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <Path d="M15 55L15 48" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
          <Path d="M35 55L35 48" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
        </Svg>
      </Animated.View>

      {/* Main arrow */}
      <Animated.View style={arrowStyle}>
        <Svg width={size * 0.5} height={size * 0.6} viewBox="0 0 50 60">
          {/* Arrow body */}
          <Path
            d="M25 55L25 20"
            stroke="#22C55E"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Arrow head */}
          <Path
            d="M15 30L25 15L35 30"
            stroke="#22C55E"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

// Sunrise with Person Silhouette - Success/Achievement illustration
export const SunrisePersonIcon = ({ size = 160 }: { size?: number }) => {
  const sunRise = useSharedValue(0);
  const sunGlow = useSharedValue(0.3);
  const raysRotate = useSharedValue(0);

  useEffect(() => {
    // Sun subtle movement
    sunRise.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow pulse
    sunGlow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Rays rotation
    raysRotate.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -sunRise.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: sunGlow.value,
  }));

  const raysStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${raysRotate.value}deg` }],
  }));

  return (
    <View style={{ width: size, height: size * 0.75, alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* Sun glow background */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: size * 0.25,
            width: size * 0.5,
            height: size * 0.25,
            borderTopLeftRadius: size * 0.25,
            borderTopRightRadius: size * 0.25,
            backgroundColor: '#FCD34D',
          },
          glowStyle,
        ]}
      />

      <Animated.View style={[{ position: 'absolute', bottom: size * 0.2 }, sunStyle]}>
        {/* Sun rays */}
        <Animated.View style={[{ position: 'absolute', top: -size * 0.15, left: -size * 0.15 }, raysStyle]}>
          <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 100 100">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <Path
                key={i}
                d={`M50 50L${50 + 45 * Math.cos((angle * Math.PI) / 180)} ${50 + 45 * Math.sin((angle * Math.PI) / 180)}`}
                stroke="#FCD34D"
                strokeWidth="2"
                opacity="0.4"
              />
            ))}
          </Svg>
        </Animated.View>

        {/* Sun circle */}
        <Svg width={size * 0.3} height={size * 0.15} viewBox="0 0 60 30">
          <Path
            d="M0 30C0 13.4 13.4 0 30 0C46.6 0 60 13.4 60 30L0 30Z"
            fill="#FCD34D"
          />
        </Svg>
      </Animated.View>

      {/* Horizon line */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.2,
          width: size * 0.9,
          height: 2,
          backgroundColor: 'rgba(251, 191, 36, 0.4)',
        }}
      />

      {/* Person silhouette */}
      <View style={{ position: 'absolute', bottom: size * 0.2, right: size * 0.2 }}>
        <Svg width={size * 0.25} height={size * 0.4} viewBox="0 0 40 65">
          {/* Head */}
          <Circle cx="20" cy="8" r="7" fill="#1F2937" />

          {/* Body */}
          <Path
            d="M20 15L20 40"
            stroke="#1F2937"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Arms */}
          <Path
            d="M20 22L8 30"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M20 22L32 30"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Legs */}
          <Path
            d="M20 40L12 60"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Path
            d="M20 40L28 60"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Briefcase */}
          <Path
            d="M5 28L5 38L15 38L15 28L5 28Z"
            fill="#1F2937"
          />
          <Path
            d="M8 28L8 26L12 26L12 28"
            stroke="#1F2937"
            strokeWidth="1.5"
            fill="none"
          />
        </Svg>
      </View>
    </View>
  );
};

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  type,
  size = 56,
  color,
  isPositive = false,
}) => {
  switch (type) {
    case 'heartbreak':
      return <HeartbreakIcon size={size} />;
    case 'sad':
      return <SadIcon size={size} />;
    case 'people':
      return <PeopleIcon size={size} />;
    case 'sync':
      return <SyncIcon size={size} />;
    case 'check':
      return <CheckIcon size={size} />;
    case 'growth':
      return <GrowthIcon size={size} />;
    default:
      return <CheckIcon size={size} />;
  }
};
