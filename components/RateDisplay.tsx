import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface RateDisplayProps {
  rate: number;
  floor: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RateDisplay({ rate, floor, size = 'md' }: RateDisplayProps) {
  const isAboveFloor = rate >= floor;
  const isWayAbove = rate >= floor * 1.2;
  const hasRate = rate > 0;

  let bgColor = 'rgba(197,160,89,0.10)';
  let textColor = COLORS.goldDark;
  
  if (hasRate) {
    if (isWayAbove) {
      bgColor = 'rgba(16,185,129,0.08)';
      textColor = '#065f46';
    } else if (isAboveFloor) {
      bgColor = 'rgba(197,160,89,0.10)';
      textColor = COLORS.goldDark;
    } else {
      bgColor = 'rgba(239,68,68,0.08)';
      textColor = '#991b1b';
    }
  }

  const fontSize = size === 'lg' ? 22 : size === 'md' ? 18 : 14;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.rate, { color: textColor, fontSize }]}>
        ₹{rate > 0 ? rate.toFixed(0) : '—'}/hr
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  rate: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontVariant: ['tabular-nums'],
  } as any,
});
