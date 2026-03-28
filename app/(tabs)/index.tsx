import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  Pressable, Modal, TextInput, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Project, getProjects } from '../../services/projectService';
import { Session, getAllSessions } from '../../services/sessionService';
import { useGlobalStore } from '../../stores/globalStore';
import { useTimerStore } from '../../stores/timerStore';
import { COLORS } from '../../constants/theme';
import StatCard from '../../components/StatCard';
import ProjectCard from '../../components/ProjectCard';
import BillablePieChart from '../../components/charts/BillablePieChart';
import NonBillableBarChart from '../../components/charts/NonBillableBarChart';
import CreateProjectSheet from '../../components/CreateProjectSheet';
import FreelanceScout from '../../components/FreelanceScout';

// ─── Animated card wrapper ────────────────────────────────────────────────
function FadeCard({ children, delay = 0, style: customStyle }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[style, customStyle]}>{children}</Animated.View>;
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────
function NavItem({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.navItem, active && styles.navItemActive]}
      onPress={onPress}
    >
      {active && <View style={styles.navAccent} />}
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const { rateFloor, refreshTrigger, setRateFloor } = useGlobalStore();
  const startTimer = useTimerStore(s => s.startTimer);

  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFloor, setNewFloor] = useState(rateFloor.toString());
  const [activeNav, setActiveNav] = useState('dashboard');

  const createSheetRef = useRef<any>(null);

  const loadData = async () => {
    try {
      const p = await getProjects();
      const s = await getAllSessions();
      setProjects(p);
      setSessions(s);
    } catch (e) {
      console.error(e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [refreshTrigger]);

  // ── Derived stats ──
  const totalEarned = projects.reduce((sum, p) => {
    if (p.model === 'fixed') return sum + p.price;
    const pSessions = sessions.filter(s => s.projectId === p.id);
    const pBillable = pSessions.filter(s => s.type === 'billable').reduce((h, s) => h + s.hours, 0);
    const pNonBillable = pSessions.filter(s => s.type === 'nonbillable').reduce((h, s) => h + s.hours, 0);
    return sum + (pBillable * p.hourlyRate);
  }, 0);

  const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
  const avgRate = totalHours > 0 ? totalEarned / totalHours : 0;
  const activeProjectsCount = projects.length;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekHours = sessions
    .filter(s => new Date(s.startedAt).getTime() >= weekStart.getTime())
    .reduce((sum, s) => sum + s.hours, 0);
  const weekBillable = sessions
    .filter(s => s.type === 'billable' && new Date(s.startedAt).getTime() >= weekStart.getTime())
    .reduce((sum, s) => sum + s.hours, 0);

  const billableHours = sessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
  const nonBillableHours = totalHours - billableHours;

  const nbData = { communication: 0, revisions: 0, admin: 0, scope: 0 };
  sessions.filter(s => s.type === 'nonbillable' && s.nbCategory).forEach(s => {
    if (nbData[s.nbCategory as keyof typeof nbData] !== undefined)
      nbData[s.nbCategory as keyof typeof nbData] += s.hours;
  });

  const projectStats = projects.map(p => {
    const pSessions = sessions.filter(s => s.projectId === p.id);
    const pTotal = pSessions.reduce((sum, s) => sum + s.hours, 0);
    const pBillable = pSessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
    const pNonBillable = pTotal - pBillable;
    const pValue = p.model === 'fixed' ? p.price : (pBillable * p.hourlyRate);
    const effectiveRate = pTotal > 0 ? pValue / pTotal : (p.model === 'hourly' ? p.hourlyRate : 0);
    return { ...p, effectiveRate, sessions: pSessions };
  }).sort((a, b) => {
    const aB = a.effectiveRate > 0 && a.effectiveRate < rateFloor ? 1 : 0;
    const bB = b.effectiveRate > 0 && b.effectiveRate < rateFloor ? 1 : 0;
    return aB !== bB ? bB - aB : b.effectiveRate - a.effectiveRate;
  });

  const belowFloorCount = projectStats.filter(p => p.effectiveRate > 0 && p.effectiveRate < rateFloor).length;
  const isAboveFloor = avgRate >= rateFloor;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.root}>
      {/* ── Sidebar (web only) ── */}
      {isWeb && (
        <View style={styles.sidebar}>
          {/* Logo */}
          <View style={styles.logoArea}>
            <Text style={styles.logoText}>billable<Text style={styles.logoDot}>.</Text></Text>
            <Text style={styles.logoSub}>time intelligence</Text>
          </View>

          {/* Nav sections */}
          <Text style={styles.navSectionLabel}>OVERVIEW</Text>
          <NavItem icon="◈" label="Dashboard" active={activeNav === 'dashboard'} onPress={() => setActiveNav('dashboard')} />
          <NavItem icon="▣" label="Projects" active={activeNav === 'projects'} onPress={() => { setActiveNav('projects'); router.push('/(tabs)/projects'); }} />

          <Text style={styles.navSectionLabel}>TRACKING</Text>
          <NavItem icon="◷" label="Time Log" active={activeNav === 'log'} onPress={() => setActiveNav('log')} />
          <NavItem icon="◉" label="Reports" active={activeNav === 'reports'} onPress={() => setActiveNav('reports')} />

          {/* Rate floor widget */}
          <View style={styles.floorWidget}>
            <Text style={styles.floorWidgetTitle}>Rate Floor</Text>
            <Pressable onPress={() => setModalVisible(true)} style={styles.floorWidgetInput}>
              <Text style={styles.floorWidgetValue}>₹ {rateFloor} <Text style={styles.floorWidgetUnit}>/hr</Text></Text>
            </Pressable>
            <Text style={styles.floorWidgetHint}>Alerts when below</Text>
          </View>
        </View>
      )}

      {/* ── Main content ── */}
      <ScrollView
        style={styles.main}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <FadeCard delay={0}>
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Dashboard</Text>
              <Text style={styles.pageSubtitle}>{greeting}, Freelancer 👋</Text>
            </View>
            <View style={styles.headerActions}>
              {!isWeb && (
                <Pressable style={styles.floorPill} onPress={() => setModalVisible(true)}>
                  <Text style={styles.floorPillText}>Floor: ₹{rateFloor}/hr</Text>
                </Pressable>
              )}
              <Pressable style={styles.addBtn} onPress={() => createSheetRef.current?.expand()}>
                <Text style={styles.addBtnText}>+ New Project</Text>
              </Pressable>
            </View>
          </View>
        </FadeCard>

        {/* ── Hero stat cards ── */}
        <View style={styles.statsGrid}>
          <FadeCard delay={80} style={styles.statCardWrapper}>
            <StatCard
              label="TOTAL EARNED"
              value={`₹${(totalEarned / 1000).toFixed(0)}K`}
              trend="+12% vs last"
              trendPositive
              subValue="This month"
            />
          </FadeCard>
          <FadeCard delay={160} style={styles.statCardWrapper}>
            <StatCard
              label="AVG RATE"
              value={`₹${avgRate.toFixed(0)}/hr`}
              trend={isAboveFloor ? 'above floor' : 'below floor'}
              trendPositive={isAboveFloor}
              subValue={`Floor: ₹${rateFloor}/hr`}
            />
          </FadeCard>
          <FadeCard delay={240} style={styles.statCardWrapper}>
            <StatCard
              label="ACTIVE PROJECTS"
              value={`${activeProjectsCount}`}
              subValue={belowFloorCount > 0 ? `${belowFloorCount} need review` : 'All healthy'}
              subValueColor={belowFloorCount > 0 ? '#991b1b' : '#065f46'}
            />
          </FadeCard>
          <FadeCard delay={320} style={styles.statCardWrapper}>
            <StatCard
              label="THIS WEEK"
              value={`${weekHours.toFixed(1)}h`}
              subValue={`${weekBillable.toFixed(1)}h billable`}
              subValueColor={COLORS.goldDark}
            />
          </FadeCard>
        </View>

        {/* ── Charts row ── */}
        <View style={styles.chartsRow}>
          {/* Time distribution donut */}
          <FadeCard delay={400}>
            <View style={[styles.card, styles.chartCardRight]}>
              <Text style={styles.cardTitle}>Time Distribution</Text>
              <Text style={styles.cardSubtitle}>Billable vs non-billable split</Text>
              <View style={styles.chartContent}>
                <BillablePieChart billableHours={billableHours} nonBillableHours={nonBillableHours} />
              </View>
            </View>
          </FadeCard>

          {/* Non-billable breakdown */}
          <FadeCard delay={480}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Non-Billable Breakdown</Text>
              <Text style={styles.cardSubtitle}>Where time disappears</Text>
              <View style={styles.chartContent}>
                <NonBillableBarChart data={nbData} />
              </View>
            </View>
          </FadeCard>
        </View>

        {/* ── Projects list ── */}
        <FadeCard delay={560}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <Pressable onPress={() => createSheetRef.current?.expand()} style={styles.sectionBtn}>
              <Text style={styles.sectionBtnText}>+ Add Project</Text>
            </Pressable>
          </View>

          {belowFloorCount > 0 ? (
            <View style={[styles.banner, styles.bannerAlert]}>
              <Text style={styles.bannerAlertText}>⚠ {belowFloorCount} {belowFloorCount === 1 ? 'project is' : 'projects are'} below your ₹{rateFloor}/hr floor</Text>
            </View>
          ) : (
            <View style={[styles.banner, styles.bannerHealthy]}>
              <Text style={styles.bannerHealthyText}>✓ All projects above your rate floor</Text>
            </View>
          )}

          {projectStats.map((p, i) => (
            <FadeCard key={p.id} delay={560 + i * 80}>
              <ProjectCard
                project={p}
                sessions={p.sessions}
                rateFloor={rateFloor}
                onPress={() => router.push(`/project/${p.id}`)}
                onStartTimer={(e) => { e?.stopPropagation(); startTimer(p.id, p.title, 'billable'); }}
                onMeet={(e) => { e?.stopPropagation(); router.push(`/project/${p.id}`); }}
              />
            </FadeCard>
          ))}

          {projects.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No projects yet</Text>
              <Text style={styles.emptySubtitle}>Create your first project to start tracking time and rates.</Text>
              <Pressable style={styles.emptyBtn} onPress={() => createSheetRef.current?.expand()}>
                <Text style={styles.emptyBtnText}>+ Create Project</Text>
              </Pressable>
            </View>
          )}
        </FadeCard>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Rate floor modal ── */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Rate Floor</Text>
            <Text style={styles.modalBody}>Your minimum acceptable effective hourly rate across all projects.</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={newFloor}
              onChangeText={setNewFloor}
              placeholder="e.g. 500"
              placeholderTextColor={COLORS.muted}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtnSec} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnSecText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalBtnPrimary}
                onPress={() => {
                  setRateFloor(Number(newFloor) || rateFloor);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalBtnPrimaryText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <FreelanceScout />
      <CreateProjectSheet sheetRef={createSheetRef} onCreated={loadData} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
  },

  // Sidebar
  sidebar: {
    width: 260,
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.06)',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  logoArea: {
    marginBottom: 36,
    paddingLeft: 4,
  },
  logoText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 22,
    color: COLORS.fg,
  },
  logoDot: {
    color: COLORS.gold,
  },
  logoSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  navSectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: COLORS.muted,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 12,
  } as any,
  navItem: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: COLORS.bgAlt,
  },
  navAccent: {
    position: 'absolute',
    left: 0,
    width: 3,
    height: 24,
    backgroundColor: COLORS.gold,
    borderRadius: 999,
  },
  navIcon: {
    fontSize: 16,
    color: COLORS.muted,
  },
  navLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: COLORS.muted,
  },
  navLabelActive: {
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.fg,
  },
  floorWidget: {
    marginTop: 'auto',
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 16,
  } as any,
  floorWidgetTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  } as any,
  floorWidgetInput: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  floorWidgetValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: COLORS.fg,
  },
  floorWidgetUnit: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  floorWidgetHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: COLORS.muted,
  },

  // Main area
  main: {
    flex: 1,
  },
  mainContent: {
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingHorizontal: Platform.OS === 'web' ? 48 : 16,
    paddingBottom: 40,
  },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 16,
  },
  pageTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 36,
    color: COLORS.fg,
    lineHeight: 44,
  },
  pageSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  floorPill: {
    backgroundColor: COLORS.bgAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  floorPillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: COLORS.goldDark,
  },
  addBtn: {
    backgroundColor: COLORS.fg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  } as any,
  addBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
    letterSpacing: 0.02,
  },

  // Stat cards
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  statCardWrapper: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 220 : '45%',
  },

  // Charts
  chartsRow: {
    gap: 20,
    marginBottom: 28,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  } as any,
  chartCardRight: {
    flex: Platform.OS === 'web' ? 1.5 : 1,
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 20,
    color: COLORS.fg,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 20,
  },
  chartContent: {
    paddingTop: 4,
  },

  // Projects section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    color: COLORS.fg,
  },
  sectionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(197,160,89,0.10)',
  },
  sectionBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: COLORS.goldDark,
  },
  banner: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
  },
  bannerAlert: {
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderLeftColor: '#ef4444',
  },
  bannerAlertText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#991b1b',
  },
  bannerHealthy: {
    backgroundColor: 'rgba(16,185,129,0.07)',
    borderLeftColor: '#10b981',
  },
  bannerHealthyText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#065f46',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    color: COLORS.fg,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: COLORS.fg,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  emptyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  } as any,
  modalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: COLORS.fg,
    marginBottom: 8,
  },
  modalBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalInput: {
    backgroundColor: COLORS.bgAlt,
    borderRadius: 14,
    padding: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: COLORS.fg,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtnSec: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  modalBtnSecText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.fg,
  },
  modalBtnPrimary: {
    backgroundColor: COLORS.fg,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  } as any,
  modalBtnPrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
});
