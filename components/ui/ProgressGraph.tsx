import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { useUserStore } from '@/store/userStore';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProgressGraphProps {
  width?: number;
  height?: number;
  showLabels?: boolean;
}

export const ProgressGraph: React.FC<ProgressGraphProps> = ({
  width = SCREEN_WIDTH - 40,
  height = 180,
  showLabels = true,
}) => {
  const { progressHistory, initialScore, controlScore } = useUserStore();

  // Animation value for path drawing
  const pathProgress = useSharedValue(0);
  const dotsOpacity = useSharedValue(0);

  // Padding for the graph
  const PADDING_LEFT = 35;
  const PADDING_RIGHT = 15;
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = showLabels ? 30 : 15;

  const graphWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const graphHeight = height - PADDING_TOP - PADDING_BOTTOM;

  // Build data points: start with initial, add history, end with current
  const dataPoints: { score: number; label: string }[] = [
    { score: initialScore, label: 'Start' },
    ...progressHistory.map((entry, i) => ({
      score: entry.controlScore,
      label: `W${i + 1}`,
    })),
  ];

  // If no history yet, show projected path
  const hasHistory = progressHistory.length > 0;

  // Calculate min/max for Y axis (with padding)
  const scores = dataPoints.map(d => d.score);
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);
  const scoreRange = maxScore - minScore || 1;

  // Convert data point to SVG coordinates
  const getX = (index: number) => {
    if (dataPoints.length === 1) return PADDING_LEFT + graphWidth / 2;
    return PADDING_LEFT + (index / (dataPoints.length - 1)) * graphWidth;
  };

  const getY = (score: number) => {
    return PADDING_TOP + graphHeight - ((score - minScore) / scoreRange) * graphHeight;
  };

  // Generate SVG path
  const generatePath = () => {
    if (dataPoints.length === 0) return '';
    if (dataPoints.length === 1) {
      // Single point - show as horizontal line
      const y = getY(dataPoints[0].score);
      return `M ${PADDING_LEFT} ${y} L ${PADDING_LEFT + graphWidth} ${y}`;
    }

    // Create smooth curve through points
    let path = `M ${getX(0)} ${getY(dataPoints[0].score)}`;

    for (let i = 1; i < dataPoints.length; i++) {
      const x0 = getX(i - 1);
      const y0 = getY(dataPoints[i - 1].score);
      const x1 = getX(i);
      const y1 = getY(dataPoints[i].score);

      // Control points for smooth curve
      const cpX = (x0 + x1) / 2;

      path += ` C ${cpX} ${y0}, ${cpX} ${y1}, ${x1} ${y1}`;
    }

    return path;
  };

  // Generate area path (for gradient fill under line)
  const generateAreaPath = () => {
    const linePath = generatePath();
    if (!linePath || dataPoints.length === 0) return '';

    const lastX = getX(dataPoints.length - 1);
    const bottomY = PADDING_TOP + graphHeight;

    return `${linePath} L ${lastX} ${bottomY} L ${PADDING_LEFT} ${bottomY} Z`;
  };

  const path = generatePath();
  const areaPath = generateAreaPath();

  // Calculate path length for animation
  const pathLength = dataPoints.length > 1 ? graphWidth * 1.5 : 0;

  useEffect(() => {
    pathProgress.value = 0;
    dotsOpacity.value = 0;

    pathProgress.value = withDelay(
      300,
      withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );
    dotsOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
  }, [progressHistory.length]);

  const animatedPathProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - pathProgress.value),
  }));

  const animatedDotsStyle = useAnimatedProps(() => ({
    opacity: dotsOpacity.value,
  }));

  // Y-axis labels
  const yLabels = [maxScore, Math.round((maxScore + minScore) / 2), minScore];

  return (
    <View style={[styles.container, { width, height }]}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.08)', 'rgba(139, 92, 246, 0.02)']}
        style={StyleSheet.absoluteFill}
      />

      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#22C55E" />
          </SvgGradient>
          <SvgGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <Stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </SvgGradient>
        </Defs>

        {/* Grid lines */}
        {yLabels.map((label, i) => {
          const y = getY(label);
          return (
            <Line
              key={i}
              x1={PADDING_LEFT}
              y1={y}
              x2={width - PADDING_RIGHT}
              y2={y}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area fill */}
        {areaPath && (
          <Path
            d={areaPath}
            fill="url(#areaGradient)"
            opacity={0.5}
          />
        )}

        {/* Main line */}
        {path && (
          <AnimatedPath
            d={path}
            stroke="url(#lineGradient)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            animatedProps={animatedPathProps}
          />
        )}

        {/* Data points */}
        {dataPoints.map((point, i) => (
          <AnimatedCircle
            key={i}
            cx={getX(i)}
            cy={getY(point.score)}
            r={i === dataPoints.length - 1 ? 6 : 4}
            fill={i === dataPoints.length - 1 ? '#22C55E' : '#8B5CF6'}
            stroke={Colors.background}
            strokeWidth={2}
            animatedProps={animatedDotsStyle}
          />
        ))}
      </Svg>

      {/* Y-axis labels */}
      {showLabels && (
        <View style={styles.yAxisLabels}>
          {yLabels.map((label, i) => (
            <Text
              key={i}
              style={[
                styles.yAxisLabel,
                { top: getY(label) - 8 },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      )}

      {/* X-axis labels */}
      {showLabels && (
        <View style={[styles.xAxisLabels, { left: PADDING_LEFT, right: PADDING_RIGHT }]}>
          {dataPoints.map((point, i) => (
            <Text
              key={i}
              style={[
                styles.xAxisLabel,
                { left: getX(i) - PADDING_LEFT - 15, width: 30 },
              ]}
            >
              {point.label}
            </Text>
          ))}
        </View>
      )}

      {/* No data state */}
      {!hasHistory && (
        <View style={styles.noDataOverlay}>
          <Text style={styles.noDataText}>
            Complete your first check-in to see your progress
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
  yAxisLabel: {
    position: 'absolute',
    left: 4,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'right',
    width: 26,
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  noDataOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.7)',
  },
  noDataText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
