import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, TEXT_STYLES } from '../../constants/theme';

interface BillablePieChartProps {
  billableHours: number;
  nonBillableHours: number;
}

export default function BillablePieChart({ billableHours, nonBillableHours }: BillablePieChartProps) {
  const total = billableHours + nonBillableHours;
  const radius = 60;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  
  const billablePercent = total > 0 ? billableHours / total : 0;
  const nonBillablePercent = total > 0 ? nonBillableHours / total : 0;
  
  const billableStrokeDasharray = `${circumference * billablePercent} ${circumference}`;
  const nonBillableStrokeDasharray = `${circumference * nonBillablePercent} ${circumference}`;
  const nonBillableOffset = circumference * billablePercent;

  return (
    <View style={styles.container}>
      {total > 0 ? (
        <View style={styles.chartWrapper}>
          <Svg width={160} height={160} viewBox="0 0 160 160">
            <Circle
              cx={80}
              cy={80}
              r={radius}
              stroke={COLORS.surface2}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {billableHours > 0 && (
              <Circle
                cx={80}
                cy={80}
                r={radius}
                stroke={COLORS.green}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={billableStrokeDasharray}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            )}
            {nonBillableHours > 0 && (
              <Circle
                cx={80}
                cy={80}
                r={radius}
                stroke={COLORS.amber}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={nonBillableStrokeDasharray}
                strokeDashoffset={-nonBillableOffset}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            )}
          </Svg>
          <View style={styles.centerTextContainer}>
            <Text style={styles.centerText}>{total.toFixed(1)}h</Text>
            <Text style={styles.centerSubText}>Total</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Log your first session</Text>
        </View>
      )}

      {total > 0 && (
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.green }]} />
            <Text style={styles.legendText}>Billable: {Math.round(billablePercent * 100)}% ({billableHours.toFixed(1)}h)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.amber }]} />
            <Text style={styles.legendText}>Non-Billable: {Math.round(nonBillablePercent * 100)}% ({nonBillableHours.toFixed(1)}h)</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  chartWrapper: {
    position: 'relative',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerText: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 24,
    color: COLORS.text,
  },
  centerSubText: {
    ...TEXT_STYLES.muted,
  },
  emptyContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...TEXT_STYLES.muted,
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    ...TEXT_STYLES.body,
    fontSize: 12,
  },
});
