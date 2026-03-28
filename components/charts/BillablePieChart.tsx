import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BillablePieChartProps {
  billableHours: number;
  nonBillableHours: number;
}

export default function BillablePieChart({ billableHours, nonBillableHours }: BillablePieChartProps) {
  const total = billableHours + nonBillableHours;
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const billableRatio = total > 0 ? billableHours / total : 0;
  const nonBillableRatio = total > 0 ? nonBillableHours / total : 0;

  // Animated stroke-dashoffset for billable arc (draws clockwise from 12)
  const billableProgress = useSharedValue(0);

  useEffect(() => {
    billableProgress.value = withTiming(billableRatio, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [billableRatio]);

  const billableProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - billableProgress.value),
  }));

  const billablePct = total > 0 ? Math.round(billableRatio * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Donut Chart */}
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Track ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={COLORS.bgAlt}
            strokeWidth={strokeWidth}
          />
          {/* Non-billable arc (gold) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={COLORS.gold}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * billableRatio}
            strokeLinecap="round"
            rotation={-90 + billableRatio * 360}
            originX={size / 2}
            originY={size / 2}
          />
          {/* Billable arc (near-black, drawn first = below) */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={COLORS.fg}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animatedProps={billableProps}
            strokeLinecap="round"
            rotation={-90}
            originX={size / 2}
            originY={size / 2}
          />
        </Svg>
        {/* Center label */}
        <View style={styles.centerLabel}>
          <Text style={styles.centerValue}>{total.toFixed(1)}h</Text>
          <Text style={styles.centerSub}>total</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.fg }]} />
          <Text style={styles.legendLabel}>Billable</Text>
          <Text style={styles.legendHours}>{billableHours.toFixed(1)}h</Text>
          <View style={[styles.legendBadge, { backgroundColor: 'rgba(16,185,129,0.10)' }]}>
            <Text style={[styles.legendBadgeText, { color: '#065f46' }]}>{billablePct}%</Text>
          </View>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
          <Text style={styles.legendLabel}>Non-Billable</Text>
          <Text style={styles.legendHours}>{nonBillableHours.toFixed(1)}h</Text>
          <View style={[styles.legendBadge, { backgroundColor: 'rgba(197,160,89,0.12)' }]}>
            <Text style={[styles.legendBadgeText, { color: COLORS.goldDark }]}>{100 - billablePct}%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
  },
  chartWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {},
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: COLORS.fg,
  },
  centerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  legend: {
    flex: 1,
    gap: 14,
    minWidth: 160,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    flex: 1,
  },
  legendHours: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: COLORS.fg,
    marginRight: 8,
  },
  legendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  legendBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
});
