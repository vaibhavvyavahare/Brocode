import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useTimerStore } from '../stores/timerStore';
import { COLORS } from '../constants/theme';
import { useRouter } from 'expo-router';
import LogSessionSheet from './LogSessionSheet';

let createPortal: any = null;
if (Platform.OS === 'web') {
  createPortal = require('react-dom').createPortal;
}

const BOTTOM_OFFSET = Platform.OS === 'web' ? 28 : 90;

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function PulseDot({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 750 }),
        withTiming(1, { duration: 750 }),
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 750 }),
        withTiming(1, { duration: 750 }),
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.dot, { backgroundColor: color }, style]} />
  );
}

export default function FloatingTimer() {
  const { isRunning, elapsed, projectName, sessionType, projectId, tick, stopTimer } = useTimerStore();
  const router = useRouter();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(80);
  const [stopHovered, setStopHovered] = useState(false);

  const sheetRef = useRef<any>(null);
  const [logData, setLogData] = useState<any>(null);

  const [pipWindow, setPipWindow] = useState<any>(null);

  const togglePiP = async () => {
    if (Platform.OS !== 'web' || !('documentPictureInPicture' in window)) {
      alert('Picture-in-Picture is not supported in this browser.');
      return;
    }

    if (pipWindow) {
      pipWindow.close();
      return;
    }

    try {
      const dpip = (window as any).documentPictureInPicture;
      const win = await dpip.requestWindow({
        width: 280,
        height: 80,
      });

      win.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      // Inject some base styles mimicking the native app
      win.document.body.style.margin = '0';
      win.document.body.style.display = 'flex';
      win.document.body.style.alignItems = 'center';
      win.document.body.style.justifyContent = 'center';
      win.document.body.style.backgroundColor = COLORS.fg;
      win.document.body.style.fontFamily = 'sans-serif';

      // Copy stylesheet references so our inline classes work (if any)
      Array.from(document.styleSheets).forEach((styleSheet) => {
        try {
          const cssRules = Array.from(styleSheet.cssRules).map((r) => r.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          win.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media.mediaText;
          link.href = styleSheet.href || '';
          win.document.head.appendChild(link);
        }
      });

      setPipWindow(win);
    } catch (e) {
      console.error('Failed to open PiP', e);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      interval = setInterval(tick, 1000);
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(80, { duration: 300 });
    }
    return () => clearInterval(interval);
  }, [isRunning, tick, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    pointerEvents: (opacity.value < 0.1 ? 'none' : 'auto') as any,
  }));

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
  const dotColor = isBillable ? COLORS.green : COLORS.gold;

  const timerContent = (
    <Pressable style={[styles.content, pipWindow ? styles.pipContent : null]} onPress={handlePress}>
      <PulseDot color={dotColor} />

      <View style={styles.textArea}>
        <Text style={styles.timeText}>{formatTime(elapsed)}</Text>
        <Text style={styles.projectText} numberOfLines={1}>
          {projectName || 'Untitled'}
        </Text>
      </View>

      {Platform.OS === 'web' && 'documentPictureInPicture' in window && !pipWindow && (
        <Pressable
          style={styles.pipBtn}
          onPress={(e) => {
            e.stopPropagation();
            togglePiP();
          }}
        >
          <Text style={styles.pipIcon}>⧉</Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.stopBtn, stopHovered && styles.stopBtnHover, pipWindow && { marginLeft: 12 }]}
        onPress={(e) => {
          if (pipWindow) setPipWindow(null);
          handleStop();
        }}
        onHoverIn={() => setStopHovered(true)}
        onHoverOut={() => setStopHovered(false)}
      >
        <Text style={styles.stopIcon}>{stopHovered ? '✕' : '■'}</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <>
      {pipWindow && createPortal ? (
        createPortal(timerContent, pipWindow.document.body)
      ) : (
        <Animated.View style={[styles.container, animatedStyle, pipWindow && { display: 'none' }]}>
          {timerContent}
        </Animated.View>
      )}

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
    right: 28,
    width: 220,
    backgroundColor: COLORS.fg,
    borderRadius: 999,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 16,
  } as any,
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textArea: {
    flex: 1,
    minWidth: 0,
  },
  timeText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: COLORS.white,
    letterSpacing: 0.04,
    fontVariant: ['tabular-nums'],
  } as any,
  projectText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  stopBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopBtnHover: {
    backgroundColor: 'rgba(239,68,68,0.25)',
  },
  stopIcon: {
    fontSize: 12,
    color: COLORS.white,
    lineHeight: 14,
  },
  pipBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipIcon: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  pipContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.fg,
  }
});
