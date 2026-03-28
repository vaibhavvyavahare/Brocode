import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useTimerStore } from '../stores/timerStore';
import { COLORS, TEXT_STYLES } from '../constants/theme';
import { Square } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import LogSessionSheet from './LogSessionSheet';

// Platform-dependent positioning
const BOTTOM_OFFSET = Platform.OS === 'web' ? 24 : 80;

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function FloatingTimer() {
  const { isRunning, elapsed, projectName, sessionType, projectId, tick, stopTimer } = useTimerStore();
  const router = useRouter();

  // Animations
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  
  const sheetRef = useRef<any>(null);
  const [logData, setLogData] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 15 });
      interval = setInterval(tick, 1000);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(50);
    }
    return () => clearInterval(interval);
  }, [isRunning, tick, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
      ...(opacity.value === 0 && { pointerEvents: 'none' })
    };
  });

  const handleStop = () => {
    const sessionData = stopTimer();
    setLogData(sessionData);
    setTimeout(() => {
      sheetRef.current?.expand();
    }, 100);
  };

  const handlePress = () => {
    if (projectId) {
      router.push(`/project/${projectId}`);
    }
  };

  const isBillable = sessionType === 'billable';

  return (
    <>
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable style={styles.content} onPress={handlePress}>
        <View style={[styles.stripe, { backgroundColor: isBillable ? COLORS.accent2 : COLORS.amber }]} />
        <View style={styles.textContainer}>
          <Text style={styles.timeText}>{formatTime(elapsed)}</Text>
          <Text style={styles.projectText} numberOfLines={1}>
            {projectName}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{isBillable ? 'BILLABLE' : 'NON-BILLABLE'}</Text>
          </View>
        </View>
        <Pressable style={styles.stopButton} onPress={handleStop}>
          <Square color={COLORS.bg} size={16} fill={COLORS.bg} />
        </Pressable>
      </Pressable>
    </Animated.View>
    {logData && logData.projectId && (
      <LogSessionSheet 
        sheetRef={sheetRef} 
        projectId={logData.projectId} 
        prefillHours={logData.hours}
        prefillType={logData.type}
        prefillCategory={logData.nbCategory}
        onLogged={() => setLogData(null)}
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: BOTTOM_OFFSET,
    right: 16,
    width: 170,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    boxShadow: '0px 4px 10px rgba(124,58,237,0.3)',
    elevation: 8,
    zIndex: 999,
  } as any,
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 16,
  },
  stripe: {
    width: 6,
    height: '100%',
  },
  textContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  timeText: {
    fontFamily: 'SpaceMono_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  projectText: {
    ...TEXT_STYLES.muted,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    maxWidth: 100,
    marginTop: 2,
  },
  badge: {
    marginTop: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...TEXT_STYLES.label,
    fontSize: 9,
    color: '#fff',
    letterSpacing: 0.5,
  },
  stopButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
