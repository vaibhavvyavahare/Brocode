import { TextStyle } from 'react-native';

export const COLORS = {
  bg: '#f5f3ef',
  bgAlt: '#edeae4',
  fg: '#0a0a0a',
  gold: '#c5a059',
  goldLight: '#d4af37',
  goldDark: '#8a6b1f',
  muted: '#6b7280',
  white: '#ffffff',
  black: '#000000',
  green: '#10b981',
  greenDeep: '#065f46',
  red: '#ef4444',
  redDeep: '#991b1b',
  // Legacy compat
  accent: '#c5a059',
  accent2: '#8a6b1f',
  surface: '#ffffff',
  surface2: '#edeae4',
  border: 'rgba(0,0,0,0.06)',
  text: '#0a0a0a',
};

export const SHADOWS = {
  card: '0px 8px 32px rgba(0,0,0,0.05)',
  hover: '0px 24px 56px rgba(197,160,89,0.14)',
  pill: '0px 40px 80px rgba(0,0,0,0.35)',
};

export const RADIUS = {
  card: 24,
  pill: 999,
  input: 14,
};

export const TEXT_STYLES: Record<string, TextStyle> = {
  // Display / monetary
  display: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 36,
    color: COLORS.fg,
    fontVariant: ['tabular-nums'],
  },
  displayMd: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: COLORS.fg,
    fontVariant: ['tabular-nums'],
  },
  // Section titles
  heading1: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.fg,
  },
  heading2: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.fg,
  },
  heading3: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.fg,
  },
  // Body
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.fg,
  },
  bodyMd: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLORS.fg,
  },
  bodySm: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  // Stat label
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  // Muted text
  muted: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  // Mono (for timers etc)
  mono: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: COLORS.fg,
  },
  monoLg: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: COLORS.fg,
  },
};
