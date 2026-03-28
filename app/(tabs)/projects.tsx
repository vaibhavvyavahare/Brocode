import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Project, getProjects } from '../../services/projectService';
import { Session, getAllSessions } from '../../services/sessionService';
import { useGlobalStore } from '../../stores/globalStore';
import { useTimerStore } from '../../stores/timerStore';
import { COLORS } from '../../constants/theme';
import ProjectCard from '../../components/ProjectCard';
import CreateProjectSheet from '../../components/CreateProjectSheet';
import { Plus } from 'lucide-react-native';

const FILTERS = ['All', 'Web Dev', 'Design', 'ML Project', 'Consulting', 'Content', 'Other'];
const SORTS = ['By Rate', 'By Hours', 'By Value', 'By Date'];

export default function ProjectsScreen() {
  const router = useRouter();
  const { rateFloor, refreshTrigger } = useGlobalStore();
  const startTimer = useTimerStore(s => s.startTimer);

  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('By Rate');

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

  const totalEarned = projects.reduce((sum, p) => {
    if (p.model === 'fixed') return sum + p.price;
    const pSessions = sessions.filter(s => s.projectId === p.id);
    const pBillable = pSessions.filter(s => s.type === 'billable').reduce((h, s) => h + s.hours, 0);
    const pNonBillable = pSessions.filter(s => s.type === 'nonbillable').reduce((h, s) => h + s.hours, 0);
    return sum + (pBillable * p.hourlyRate);
  }, 0);

  const projectStats = projects.map(p => {
    const pSessions = sessions.filter(s => s.projectId === p.id);
    const pTotal = pSessions.reduce((sum, s) => sum + s.hours, 0);
    const pBillable = pSessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
    const pNonBillable = pTotal - pBillable;
    const pValue = p.model === 'fixed' ? p.price : (pBillable * p.hourlyRate);
    const effectiveRate = pTotal > 0 ? pValue / pTotal : (p.model === 'hourly' ? p.hourlyRate : 0);
    return { ...p, effectiveRate, totalValue: pValue, totalHours: pTotal, sessions: pSessions };
  });

  const filteredProjects = projectStats.filter(p =>
    filter === 'All' ? true : p.type === filter
  );

  filteredProjects.sort((a, b) => {
    if (sort === 'By Rate') return b.effectiveRate - a.effectiveRate;
    if (sort === 'By Hours') return b.totalHours - a.totalHours;
    if (sort === 'By Value') return b.totalValue - a.totalValue;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Projects</Text>
            <Text style={styles.subtitle}>{projects.length} projects · ₹{(totalEarned / 1000).toFixed(0)}K earned</Text>
          </View>
          <Pressable style={styles.newBtn} onPress={() => createSheetRef.current?.expand()}>
            <Plus color={COLORS.white} size={20} />
          </Pressable>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              style={[styles.pill, filter === f && styles.pillActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.pillText, filter === f && styles.pillTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Sort row */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {SORTS.map(s => (
              <Pressable key={s} onPress={() => setSort(s)} style={[styles.sortBtn, sort === s && styles.sortBtnActive]}>
                <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Project list */}
        <View style={styles.list}>
          {filteredProjects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              sessions={p.sessions}
              rateFloor={rateFloor}
              onPress={() => router.push(`/project/${p.id}`)}
              onStartTimer={(e) => { e?.stopPropagation(); startTimer(p.id, p.title, 'billable'); }}
              onMeet={(e) => { e?.stopPropagation(); router.push(`/project/${p.id}`); }}
            />
          ))}
          {filteredProjects.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No projects found</Text>
              <Text style={styles.emptySubtitle}>Try a different filter or add a new project.</Text>
            </View>
          )}
        </View>

        {/* Hours by project mini chart */}
        {projectStats.filter(p => p.totalHours > 0).length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Time Distribution by Project</Text>
            <View style={styles.chartCard}>
              {projectStats.filter(p => p.totalHours > 0).map(p => {
                const bHours = p.sessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
                const maxHours = Math.max(...projectStats.map(x => x.totalHours), 1);
                const bWidth = (bHours / maxHours) * 100;
                const nbWidth = ((p.totalHours - bHours) / maxHours) * 100;
                return (
                  <View key={p.id} style={styles.chartRow}>
                    <Text style={styles.chartLabel} numberOfLines={1}>{p.title}</Text>
                    <View style={styles.chartBars}>
                      <View style={[styles.barBillable, { width: `${bWidth}%` }]} />
                      <View style={[styles.barNonBillable, { width: `${nbWidth}%` }]} />
                    </View>
                    <Text style={styles.chartValue}>{p.totalHours.toFixed(1)}h</Text>
                  </View>
                );
              })}
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.fg }]} />
                  <Text style={styles.legendText}>Billable</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
                  <Text style={styles.legendText}>Non-Billable</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <CreateProjectSheet sheetRef={createSheetRef} onCreated={loadData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: COLORS.fg,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 4,
  },
  newBtn: {
    backgroundColor: COLORS.fg,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  } as any,
  filterRow: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  pill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  } as any,
  pillActive: {
    backgroundColor: COLORS.fg,
    borderColor: COLORS.fg,
  },
  pillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: COLORS.muted,
  },
  pillTextActive: {
    color: COLORS.white,
    fontFamily: 'Inter_600SemiBold',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  sortLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  } as any,
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  sortBtnActive: {
    backgroundColor: 'rgba(197,160,89,0.12)',
  },
  sortText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  sortTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.goldDark,
  },
  list: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 20,
    color: COLORS.fg,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.muted,
  },
  chartSection: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  chartTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 20,
    color: COLORS.fg,
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  } as any,
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  chartLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    width: 90,
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    height: 8,
    backgroundColor: COLORS.bgAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barBillable: { backgroundColor: COLORS.fg, height: '100%' },
  barNonBillable: { backgroundColor: COLORS.gold, height: '100%' },
  chartValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    color: COLORS.fg,
    width: 36,
    textAlign: 'right',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.muted,
  },
});
