import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { COLORS, TEXT_STYLES } from '../../constants/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface NonBillableBarChartProps {
  data: {
    communication: number;
    revisions: number;
    admin: number;
    scope: number;
  };
}

const CATEGORIES = [
  { key: 'communication', label: 'Communication', color: '#7c3aed' },
  { key: 'revisions', label: 'Revisions', color: '#f59e0b' },
  { key: 'admin', label: 'Admin', color: '#06b6d4' },
  { key: 'scope', label: 'Scope Additions', color: '#ef4444' },
] as const;

export default function NonBillableBarChart({ data }: NonBillableBarChartProps) {
  const maxHours = Math.max(...Object.values(data), 1);
  const CHART_WIDTH = 200;

  return (
    <View style={styles.container}>
      {CATEGORIES.map((cat) => (
        <BarRow 
          key={cat.key} 
          label={cat.label} 
          hours={(data as any)[cat.key] || 0} 
          maxHours={maxHours} 
          color={cat.color} 
          width={CHART_WIDTH}
        />
      ))}
    </View>
  );
}

const BarRow = ({ label, hours, maxHours, color, width }: any) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(hours / maxHours, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [hours, maxHours]);

  const animatedProps = useAnimatedProps(() => ({
    width: Math.max(progress.value * width, 2),
  }));

  return (
    <View style={styles.row}>
      <Text style={styles.ylabel}>{label}</Text>
      <View style={styles.barContainer}>
        <Svg width={width} height={16}>
          <Rect x="0" y="0" width={width} height={16} rx={8} fill={COLORS.surface2} />
          <AnimatedRect 
            x="0" 
            y="0" 
            height={16} 
            rx={8} 
            fill={color} 
            animatedProps={animatedProps} 
          />
        </Svg>
        <Text style={styles.hoursLabel}>{hours.toFixed(1)}h</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
  },
  row: {
    marginBottom: 16,
  },
  ylabel: {
    ...TEXT_STYLES.body,
    fontSize: 13,
    marginBottom: 8,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursLabel: {
    fontFamily: 'SpaceMono_400Regular',
    color: COLORS.text,
    fontSize: 13,
    marginLeft: 12,
  },
});
