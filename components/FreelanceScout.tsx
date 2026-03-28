import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView, ActivityIndicator, Linking } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  withSpring,
  Easing
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { Sparkles, X, ChevronRight } from 'lucide-react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SCOUT_MOCK = [
  { id: 1, title: 'Shopify Custom Theme', platform: 'Upwork', budget: 'Fixed: $3,500', match: '98%', tags: ['E-commerce', 'React'] },
  { id: 2, title: 'AI Recommendation API', platform: 'Toptal', budget: '$80/hr', match: '94%', tags: ['Python', 'ML'] },
  { id: 3, title: 'Mobile App Redesign', platform: 'Fiverr', budget: '$1,200', match: '87%', tags: ['Figma', 'UI/UX'] },
] as { id: number, title: string, platform: string, budget: string, match: string, tags: string[] }[];

const GAME_ITEMS = [
  { emoji: '💰', type: 'income', value: 500, catch: true, color: '#4ade80' },
  { emoji: '💻', type: 'expense', value: 300, catch: true, color: '#60a5fa' },
  { emoji: '🪙', type: 'income', value: 200, catch: true, color: '#fbbf24' },
  { emoji: '🧾', type: 'tax', value: 1000, catch: false, color: '#f87171' },
  { emoji: '🏦', type: 'gst', value: 1500, catch: false, color: '#f87171' },
  { emoji: '📄', type: 'tax', value: 800, catch: false, color: '#fb923c' },
];

const PUNCHLINES = [
  '"Your CA would be proud. Or fired. Hard to say."',
  '"The IT Department has been notified. Just kidding. Maybe."',
  '"Section 80C has entered the chat."',
  '"You literally collected more than your actual projects 😅"',
];

// --- PULSING RING ANIMATION ---
function Ring({ delay, scaleTo }: { delay: number, scaleTo: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withRepeat(
        withTiming(scaleTo, { duration: 2500, easing: Easing.out(Easing.cubic) }),
        -1, false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(0, { duration: 2500, easing: Easing.out(Easing.cubic) })
        ),
        -1, false
      );
    }, delay);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ring, style]} pointerEvents="none" />;
}

function FadeIn({ children, delay }: { children: React.ReactNode; delay: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

// --- GAME COMPONENT ---
function TaxDodgeGame() {
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [, setFrame] = useState(0); // For forcing re-render in game loop
  
  const stateRef = useRef({ 
    frameCount: 0, 
    items: [] as any[], 
    speed: 2, 
    stats: { income: 0, expense: 0, taxDodged: 0, lives: 5 } 
  });
  
  const reqRef = useRef<number | undefined>(undefined);
  const basketX = useRef(140); 
  const GAME_W = 340;
  const GAME_H = 220;

  const resetGame = () => {
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
    setRunning(false);
    setGameOver(false);
    basketX.current = GAME_W / 2 - 25;
    stateRef.current = { frameCount: 0, items: [], speed: 2.2, stats: { income: 0, expense: 0, taxDodged: 0, lives: 5 } };
    setFrame(f => f + 1);
  };

  const startGame = () => {
    resetGame();
    setRunning(true);
    reqRef.current = requestAnimationFrame(loop);
  };

  const loop = () => {
    const s = stateRef.current;
    if (s.stats.lives <= 0) {
      setRunning(false);
      setGameOver(true);
      return;
    }

    s.frameCount++;
    if (s.frameCount % 360 === 0) s.speed = Math.min(s.speed + 0.3, 6);
    
    // Spawn item
    if (s.frameCount % Math.max(45 - Math.floor(s.speed * 4), 16) === 0) {
      const tmpl = GAME_ITEMS[Math.floor(Math.random() * GAME_ITEMS.length)];
      s.items.push({ id: Math.random().toString(), ...tmpl, x: 20 + Math.random() * (GAME_W - 50), y: -30 });
    }

    // Process items
    for (let i = s.items.length - 1; i >= 0; i--) {
      const it = s.items[i];
      it.y += s.speed;
      
      const inX = Math.abs(it.x - basketX.current) < 40; 
      const inY = it.y > GAME_H - 45 && it.y < GAME_H - 10; 
      
      if (inX && inY) {
         if (it.catch) {
            if (it.type === 'income') s.stats.income += it.value;
            else s.stats.expense += it.value;
         } else {
            s.stats.lives--;
            s.stats.taxDodged += it.value; // penalty
         }
         s.items.splice(i, 1);
      } else if (it.y > GAME_H + 20) {
         s.items.splice(i, 1);
      }
    }
    
    setFrame(s.frameCount);
    if (s.stats.lives > 0) reqRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    return () => { if (reqRef.current) cancelAnimationFrame(reqRef.current); };
  }, []);

  const st = stateRef.current.stats;
  const savedAmt = st.income + st.expense;

  return (
    <View style={{ flex: 1, minHeight: 330 }}>
      {/* HUD Stats */}
      <View style={gameStyles.hudRow}>
        <View style={gameStyles.hudItem}><Text style={gameStyles.hudL}>💰 Inc</Text><Text style={gameStyles.hudVGreen}>₹{st.income}</Text></View>
        <View style={gameStyles.hudItem}><Text style={gameStyles.hudL}>💻 Exp</Text><Text style={gameStyles.hudVGreen}>₹{st.expense}</Text></View>
        <View style={gameStyles.hudItem}><Text style={gameStyles.hudL}>🧾 Tax</Text><Text style={gameStyles.hudVRed}>₹{st.taxDodged}</Text></View>
        <View style={gameStyles.hudItem}><Text style={gameStyles.hudL}>❤️ L</Text><Text style={gameStyles.hudVHeart}>{st.lives > 0 ? '❤️'.repeat(st.lives) : '💀'}</Text></View>
      </View>

      {/* Canvas equivalent */}
      <View 
        style={gameStyles.board}
        onStartShouldSetResponder={() => true}
        onResponderMove={(e) => {
          if (running && !gameOver) {
            basketX.current = Math.max(0, Math.min(GAME_W - 50, e.nativeEvent.locationX - 25));
          }
        }}
        onPointerMove={(e: any) => {
           if (running && !gameOver && e.nativeEvent.offsetX) {
             basketX.current = Math.max(0, Math.min(GAME_W - 50, e.nativeEvent.offsetX - 25));
           }
        }}
      >
        {!running && !gameOver && (
          <View style={gameStyles.idleWrap}>
             <Text style={{ fontSize: 32 }}>🎮</Text>
             <Text style={gameStyles.idleT}>Drag or touch below to move basket</Text>
             <Text style={gameStyles.idleS}>Collect 💰. Dodge 🧾.</Text>
          </View>
        )}
        
        {stateRef.current.items.map(it => (
          <Text key={it.id} style={{ position: 'absolute', left: it.x, top: it.y, fontSize: 28 }}>{it.emoji}</Text>
        ))}

        <View style={{ position: 'absolute', left: basketX.current, top: GAME_H - 40, width: 50, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(99, 102, 241, 0.4)', borderRadius: 8, borderWidth: 1, borderColor: '#818cf8', shadowColor: '#6366f1', shadowOpacity: 1, shadowRadius: 8 }}>
          <Text style={{ fontSize: 18 }}>🧺</Text>
        </View>

        {/* OVERLAY */}
        {gameOver && (
          <View style={gameStyles.overlay}>
             <Text style={{ fontSize: 48, marginBottom: 8 }}>{savedAmt > 3000 ? '🤑' : '😅'}</Text>
             <Text style={{ fontSize: 18, fontFamily: 'PlayfairDisplay_700Bold', color: '#fff' }}>Tax Optimization Complete!</Text>
             <Text style={{ fontSize: 11, color: '#94a3b8', marginVertical: 8, textAlign: 'center' }}>{PUNCHLINES[Math.floor(savedAmt) % PUNCHLINES.length]}</Text>
             <View style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)', marginVertical: 8, width: '100%', alignItems: 'center' }}>
               <Text style={{ fontSize: 10, color: '#86efac' }}>Simulated Tax Savings</Text>
               <Text style={{ fontSize: 24, fontWeight: '800', color: '#4ade80' }}>₹{savedAmt}</Text>
             </View>
             <Pressable style={gameStyles.overBtn} onPress={resetGame}>
               <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Play Again 🔄</Text>
             </Pressable>
          </View>
        )}
      </View>

      <View style={gameStyles.controls}>
        <Pressable style={[gameStyles.cBtn, { backgroundColor: '#22c55e' }]} onPress={startGame} disabled={running}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>{running ? '⏸ Playing...' : '▶ Start Game'}</Text>
        </Pressable>
        <Pressable style={[gameStyles.cBtn, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]} onPress={resetGame}>
          <Text style={{ color: '#a5b4fc', fontSize: 13, fontWeight: '600' }}>↺ Reset</Text>
        </Pressable>
      </View>
      <View style={gameStyles.legend}>
         <Text style={gameStyles.lgText}>💰 Inc +500</Text>
         <Text style={gameStyles.lgText}>💻 Exp +300</Text>
         <Text style={gameStyles.lgText}>🧾 Tax 💀</Text>
      </View>
    </View>
  );
}

// --- MAIN AGENT WIDGET ---
export default function FreelanceScout() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scout'|'game'>('scout');

  const [isScouting, setIsScouting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const panelY = useSharedValue(50);
  const panelOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      panelY.value = withSpring(0, { damping: 20, stiffness: 200 });
      panelOpacity.value = withTiming(1, { duration: 200 });
    } else {
      panelY.value = withTiming(20, { duration: 200 });
      panelOpacity.value = withTiming(0, { duration: 150 });
      // Reset slightly after close
      if (results.length > 0) {
        setTimeout(() => {
          setResults([]);
          setApiError(null);
          setProgress(0);
          setStep(0);
          setActiveTab('scout');
        }, 300);
      }
    }
  }, [isOpen]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelY.value }, { scale: 0.95 + panelOpacity.value * 0.05 }],
    opacity: panelOpacity.value,
    pointerEvents: panelOpacity.value < 0.5 ? 'none' : 'auto',
  }));

  const handleRunScout = () => {
    setIsScouting(true);
    setApiError(null);
    setProgress(0);
    setStep(1);
    
    // Simulate multi-agent workflow
    const step1 = setTimeout(() => { setProgress(35); setStep(2); }, 800);
    const step2 = setTimeout(() => { setProgress(75); setStep(3); }, 1800);
    const step3 = setTimeout(() => { 
      setProgress(100); 
      setStep(4);
      setTimeout(() => {
        setIsScouting(false);
        setResults(SCOUT_MOCK);
      }, 500);
    }, 2800);

    return () => { clearTimeout(step1); clearTimeout(step2); clearTimeout(step3); };
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      
      {/* PANEL */}
      <Animated.View style={[styles.panel, panelStyle]}>
        
        {/* Header */}
        <View style={styles.panelHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <View style={styles.dot} />
              <Text style={styles.titleText}>Freelance Scout AI</Text>
            </View>
            <Text style={styles.subText}>Powered by Groq · Llama 3.3 70B</Text>
            <View style={styles.tagsRow}>
              <View style={styles.tag}><Text style={styles.tagText}>React</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>Python</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>AI Agents</Text></View>
            </View>
          </View>
          <Pressable style={styles.closeBtn} onPress={() => setIsOpen(false)}>
            <X size={16} color={COLORS.muted} />
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <Pressable style={[styles.tab, activeTab === 'scout' && styles.tabActive]} onPress={() => setActiveTab('scout')}>
            <Text style={[styles.tabText, activeTab === 'scout' && styles.tabTextActive]}>🔍 Scout</Text>
          </Pressable>
          <Pressable style={[styles.tab, activeTab === 'game' && styles.tabActive]} onPress={() => setActiveTab('game')}>
             <Text style={[styles.tabText, activeTab === 'game' && styles.tabTextActive]}>🎮 Tax Dodge</Text>
          </Pressable>
        </View>

        {/* Body */}
        <View style={styles.panelBody}>
          {activeTab === 'scout' ? (
             results.length === 0 ? (
                <View style={styles.actionArea}>
                  <Pressable 
                    style={[styles.scoutBtn, isScouting && styles.scoutBtnDisabled]} 
                    onPress={handleRunScout}
                    disabled={isScouting}
                  >
                    {isScouting ? <ActivityIndicator color={COLORS.white} size="small" /> : <Sparkles size={16} color={COLORS.white} />}
                    <Text style={styles.scoutBtnText}>{isScouting ? 'Scouting Market...' : 'Run Scout Analysis'}</Text>
                  </Pressable>
    
                  {isScouting ? (
                    <View style={styles.progressWrap}>
                      <View style={styles.progressLabels}>
                        <Text style={styles.progressLabelText}>
                          {step === 1 && 'Scanning Upwork & platforms...'}
                          {step === 2 && 'Extractor parsing required skills...'}
                          {step === 3 && 'Calculating fit scores...'}
                          {step === 4 && 'Analysis complete'}
                        </Text>
                        <Text style={styles.progressPercent}>{progress}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                      </View>
                      <View style={styles.stepsRow}>
                         <Text style={[styles.stepItem, step >= 1 && styles.stepActive]}>Scan</Text>
                         <Text style={[styles.stepItem, step >= 2 && styles.stepActive]}>Filter</Text>
                         <Text style={[styles.stepItem, step >= 3 && styles.stepActive]}>Match</Text>
                      </View>
                      <Text style={{ fontSize: 10, color: COLORS.muted, textAlign: 'center', marginTop: 14 }}>
                         🎮 Tap "Tax Dodge" tab to play a game while waiting!
                      </Text>
                    </View>
                  ) : apiError ? (
                    <View style={styles.emptyWrap}>
                      <Text style={{ fontSize: 36, marginBottom: 8}}>⚠️</Text>
                      <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#ef4444', marginBottom: 4 }}>API Connection Failed</Text>
                      <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 18 }}>{apiError}</Text>
                      <Text style={{ fontSize: 11, color: COLORS.goldDark, textAlign: 'center', marginTop: 12 }}>Check your local server and CORS policy.</Text>
                    </View>
                  ) : (
                    <View style={styles.emptyWrap}>
                      <Text style={{ fontSize: 36, marginBottom: 8}}>💼</Text>
                      <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#475569', marginBottom: 4 }}>No Gigs Loaded Yet</Text>
                      <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center', lineHeight: 18 }}>Hit the button above and let the AI hunt Upwork, Fiverr & Toptal for you!</Text>
                      <Text style={{ fontSize: 11, color: COLORS.goldDark, textAlign: 'center', marginTop: 12 }}>🎮 Try the Game tab while you wait.</Text>
                    </View>
                  )}
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                  <Text style={styles.resultsHeader}>NEW MATCHES ({results.length})</Text>
                  {results.map((r, i) => (
                    <FadeIn key={r.id || i} delay={i * 100}>
                      <Pressable 
                        style={styles.resultCard} 
                        onPress={() => { if (r.url) Linking.openURL(r.url); }}
                      >
                        <View style={styles.resultTopRow}>
                          <View style={styles.platformPill}>
                            <Text style={styles.platformPillText}>{r.platform}</Text>
                          </View>
                          <Text style={styles.matchText}>{r.match} Match</Text>
                        </View>
                        <Text style={styles.resultTitle}>{r.title || 'Untitled Gig'}</Text>
                        {r.raw && <Text style={{fontSize: 10, color: '#ef4444', marginVertical: 4}}>{r.raw}</Text>}
                        <Text style={styles.resultBudget}>{r.budget || 'Budget Unknown'}</Text>
                        <View style={styles.resultTags}>
                          {(r.tags || []).map((t: string) => (
                            <Text key={t} style={styles.resultTagText}>#{t}</Text>
                          ))}
                        </View>
                        <View style={styles.resultFooter}>
                          <Text style={styles.applyText}>{r.url ? 'Open Project Link' : 'Review Client'}</Text>
                          <ChevronRight size={14} color={COLORS.goldDark} />
                        </View>
                      </Pressable>
                    </FadeIn>
                  ))}
                </ScrollView>
              )
          ) : (
             <TaxDodgeGame />
          )}
        </View>

        {/* Footer */}
        <View style={styles.panelFooterRow}>
            <Text style={{ fontSize: 10, color: COLORS.muted }}>Cloud: <Text style={{ color: COLORS.green }}>10.10.227.15:8000</Text></Text>
            <View style={{ backgroundColor: 'rgba(67, 56, 202, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
               <Text style={{ fontSize: 10, color: '#4338ca' }}>llama-3.3-70b</Text>
            </View>
        </View>
      </Animated.View>

      {/* FAB */}
      <Pressable style={styles.fabWrap} onPress={() => setIsOpen(!isOpen)}>
        {isOpen ? null : (
          <>
            <Ring delay={0} scaleTo={1.6} />
            <Ring delay={700} scaleTo={2.2} />
          </>
        )}
        <AnimatedPressable 
          style={styles.fab} 
          onPress={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X color={COLORS.bg} size={24} /> : <Sparkles color={COLORS.bg} size={24} />}
          {!isOpen && (
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          )}
        </AnimatedPressable>
      </Pressable>
    </View>
  );
}

const gameStyles = StyleSheet.create({
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 8, backgroundColor: 'rgba(99, 102, 241, 0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.15)' },
  hudItem: { alignItems: 'center', flex: 1 },
  hudL: { fontSize: 9, color: '#64748b', textTransform: 'uppercase' },
  hudVGreen: { fontSize: 13, fontWeight: '700', color: '#4ade80' },
  hudVRed: { fontSize: 13, fontWeight: '700', color: '#f87171' },
  hudVHeart: { fontSize: 11, marginTop: 2 },
  board: { height: 220, backgroundColor: '#020817', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.2)', overflow: 'hidden', position: 'relative' },
  idleWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  idleT: { fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 6 },
  idleS: { fontSize: 10, color: '#475569', marginTop: 4 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6, 13, 31, 0.95)', padding: 24, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  overBtn: { backgroundColor: '#6366f1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 12, shadowColor: '#6366f1', shadowOpacity: 0.5, shadowRadius: 10 },
  controls: { flexDirection: 'row', gap: 8, marginTop: 10 },
  cBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' },
  lgText: { fontSize: 9, color: '#64748b', backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 900,
  },
  fabWrap: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: Platform.OS === 'web' ? 100 : 140,
    right: 24,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  } as any,
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.fg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.fg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.gold,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontFamily: 'Inter_700Bold' },
  ring: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: 'rgba(10, 10, 10, 0.4)' },

  panel: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: Platform.OS === 'web' ? 172 : 212,
    right: 24,
    width: 380,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    transformOrigin: 'top right',
  } as any,
  
  panelHeader: { backgroundColor: COLORS.fg, padding: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold },
  titleText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: '#fff' },
  subText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  tagText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.white, textTransform: 'uppercase' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#fdfdfc' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.gold },
  tabText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.muted },
  tabTextActive: { fontFamily: 'Inter_600SemiBold', color: COLORS.fg },

  panelBody: { padding: 20, minHeight: 180, maxHeight: 440 },
  actionArea: { justifyContent: 'center', marginTop: 10, marginBottom: 10 },
  emptyWrap: { alignItems: 'center', padding: 18 },
  scoutBtn: { backgroundColor: COLORS.fg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 10, marginBottom: 16 },
  scoutBtnDisabled: { opacity: 0.8 },
  scoutBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.white },
  
  progressWrap: { marginTop: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabelText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.muted },
  progressPercent: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, color: COLORS.fg },
  progressTrack: { height: 6, backgroundColor: COLORS.bgAlt, borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },
  stepsRow: { flexDirection: 'row', gap: 8 },
  stepItem: { flex: 1, textAlign: 'center', paddingVertical: 8, backgroundColor: COLORS.bgAlt, borderRadius: 8, fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.muted },
  stepActive: { backgroundColor: COLORS.fg, color: COLORS.white },

  resultsHeader: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.muted, letterSpacing: 0.8, marginBottom: 14, textTransform: 'uppercase' },
  resultCard: { backgroundColor: COLORS.bgAlt, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.bg },
  resultTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  platformPill: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: COLORS.white, borderRadius: 999 },
  platformPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.fg, textTransform: 'uppercase' },
  matchText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.greenDeep },
  resultTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: COLORS.fg, marginBottom: 4 },
  resultBudget: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.goldDark, marginBottom: 12 },
  resultTags: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  resultTagText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: COLORS.muted },
  resultFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  applyText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.goldDark },

  panelFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fdfdfc' },
});
