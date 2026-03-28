import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../constants/theme';

interface NonBillableBarChartProps {
  data: {
    communication: number;
    revisions: number;
    admin: number;
    scope: number;
  };
}

const CATEGORIES = [
  { key: 'communication', label: 'Communication', opacityMult: 1.0 },
  { key: 'revisions',     label: 'Revisions',     opacityMult: 0.75 },
  { key: 'admin',         label: 'Admin',          opacityMult: 0.55 },
  { key: 'scope',         label: 'Scope creep',   opacityMult: 0.35 },
];

function AnimatedBar({ width, delay, opacity }: { width: number; delay: number; opacity: number }) {
  const animWidth = useSharedValue(0);

  useEffect(() => {
    animWidth.value = withDelay(delay, withTiming(width, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    }));
  }, [width]);

  const style = useAnimatedStyle(() => ({
    width: `${animWidth.value}%`,
    opacity,
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 999,
  }));

  return <Animated.View style={style} />;
}

export default function NonBillableBarChart({ data }: NonBillableBarChartProps) {
  const values = CATEGORIES.map(c => data[c.key as keyof typeof data] || 0);
  const maxVal = Math.max(...values, 0.1);

  return (
    <View style={styles.container}>
      {CATEGORIES.map((cat, i) => {
        const val = data[cat.key as keyof typeof data] || 0;
        const widthPct = (val / maxVal) * 100;

        return (
          <View key={cat.key} style={styles.row}>
            <Text style={styles.label}>{cat.label}</Text>
            <View style={styles.track}>
              <AnimatedBar width={widthPct} delay={i * 100} opacity={cat.opacityMult} />
            </View>
            <Text style={styles.value}>{val.toFixed(1)}h</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    width: 110,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.bgAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  value: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: COLORS.fg,
    width: 36,
    textAlign: 'right',
  },
});
