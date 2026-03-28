import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, TEXT_STYLES } from '../constants/theme';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  subValueColor?: string;
  trend?: string;
  trendPositive?: boolean;
  index?: number;
}

export default function StatCard({ label, value, subValue, subValueColor, trend, trendPositive, index = 0 }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {(subValue || trend) && (
        <View style={styles.footer}>
          {trend && (
            <View style={[styles.trendPill, { backgroundColor: trendPositive ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.09)' }]}>
              <Text style={[styles.trendText, { color: trendPositive ? '#065f46' : '#991b1b' }]}>
                {trendPositive ? '↑' : '↓'} {trend}
              </Text>
            </View>
          )}
          {subValue && (
            <Text style={[styles.subValue, subValueColor ? { color: subValueColor } : {}]}>{subValue}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  } as any,
  label: {
    ...(TEXT_STYLES.label as any),
    marginBottom: 12,
  },
  value: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: COLORS.fg,
    marginBottom: 8,
    fontVariant: ['tabular-nums'],
  } as any,
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  trendPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  trendText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.04,
  },
  subValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    flexShrink: 1,
  },
});
