import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Project, getProjects } from '../../services/projectService';
import { Session, getAllSessions } from '../../services/sessionService';
import { useGlobalStore } from '../../stores/globalStore';
import { COLORS, TEXT_STYLES } from '../../constants/theme';
import ProjectCard from '../../components/ProjectCard';
import CreateProjectSheet from '../../components/CreateProjectSheet';
import { FolderPlus } from 'lucide-react-native';

const FILTERS = ['All', 'Active', 'Web Dev', 'Design', 'ML Project', 'Consulting', 'Content', 'Other'];
const SORTS = ['By Rate', 'By Hours', 'By Value', 'By Date'];

export default function ProjectsScreen() {
  const router = useRouter();
  const { rateFloor } = useGlobalStore();
  
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

  useEffect(() => {
    loadData();
  }, []);

  const totalEarned = projects.reduce((sum, p) => {
    if (p.model === 'fixed') return sum + p.price;
    const pSessions = sessions.filter(s => s.projectId === p.id && s.type === 'billable');
    const bHours = pSessions.reduce((h, s) => h + s.hours, 0);
    return sum + (bHours * p.hourlyRate);
  }, 0);

  const projectStats = projects.map(p => {
    const pSessions = sessions.filter(s => s.projectId === p.id);
    const pTotalHours = pSessions.reduce((sum, s) => sum + s.hours, 0);
    const pBillable = pSessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
    let pValue = p.model === 'fixed' ? p.price : pBillable * p.hourlyRate;
    let effectiveRate = pTotalHours > 0 ? pValue / pTotalHours : (p.model === 'hourly' ? p.hourlyRate : 0);
    return { ...p, effectiveRate, totalValue: pValue, totalHours: pTotalHours, sessions: pSessions };
  });

  const filteredProjects = projectStats.filter(p => {
    if (filter === 'All' || filter === 'Active') return true;
    return p.type === filter;
  });

  filteredProjects.sort((a, b) => {
    if (sort === 'By Rate') return b.effectiveRate - a.effectiveRate;
    if (sort === 'By Hours') return b.totalHours - a.totalHours;
    if (sort === 'By Value') return b.totalValue - a.totalValue;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Projects</Text>
            <Text style={styles.subtitle}>{projects.length} projects • ₹{totalEarned.toFixed(0)} earned</Text>
          </View>
          <Pressable style={styles.newBtn} onPress={() => createSheetRef.current?.expand()}>
            <FolderPlus color={COLORS.bg} size={20} />
          </Pressable>
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
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
        </View>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SORTS.map(s => (
              <Pressable key={s} onPress={() => setSort(s)} style={styles.sortBtn}>
                <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.listContainer}>
          {filteredProjects.map(p => (
            <ProjectCard 
              key={p.id} 
              project={p} 
              sessions={p.sessions} 
              rateFloor={rateFloor} 
              onPress={() => router.push(`/project/${p.id}`)}
            />
          ))}
          {filteredProjects.length === 0 && (
            <Text style={styles.emptyText}>No projects found.</Text>
          )}
        </View>

        {/* History Chart Placeholder. Using a simplified CSS bar chart to save time. */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Time Investment by Project</Text>
          <View style={styles.chartBox}>
            {projectStats.map(p => {
              const bHours = p.sessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
              const nbHours = p.totalHours - bHours;
              const maxHours = Math.max(...projectStats.map(x => x.totalHours), 1);
              
              const bWidth = (bHours / maxHours) * 100;
              const nbWidth = (nbHours / maxHours) * 100;
              
              if (p.totalHours === 0) return null;
              
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
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <CreateProjectSheet sheetRef={createSheetRef} onCreated={loadData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...TEXT_STYLES.heading1 },
  subtitle: { ...TEXT_STYLES.muted, marginTop: 4 },
  newBtn: {
    backgroundColor: COLORS.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: { marginBottom: 16 },
  filterScroll: { paddingHorizontal: 16 },
  pill: {
    backgroundColor: COLORS.surface2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  pillActive: { backgroundColor: COLORS.accent },
  pillText: { ...TEXT_STYLES.body, color: COLORS.muted },
  pillTextActive: { color: '#fff', fontFamily: 'Syne_600SemiBold' },
  sortContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  sortLabel: { ...TEXT_STYLES.label, marginRight: 12 },
  sortBtn: { marginRight: 16 },
  sortText: { ...TEXT_STYLES.body, color: COLORS.muted },
  sortTextActive: { color: COLORS.text, fontFamily: 'Syne_600SemiBold' },
  listContainer: { paddingHorizontal: 16 },
  emptyText: { ...TEXT_STYLES.muted, textAlign: 'center', marginTop: 40 },
  
  chartSection: { padding: 16, marginTop: 24 },
  chartTitle: { ...TEXT_STYLES.heading2, marginBottom: 16 },
  chartBox: { backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  chartLabel: { ...TEXT_STYLES.muted, width: 80, fontSize: 11 },
  chartBars: { flex: 1, flexDirection: 'row', height: 10, backgroundColor: COLORS.surface2, borderRadius: 5, overflow: 'hidden', marginHorizontal: 12 },
  barBillable: { backgroundColor: COLORS.green, height: '100%' },
  barNonBillable: { backgroundColor: COLORS.amber, height: '100%' },
  chartValue: { fontFamily: 'SpaceMono_400Regular', color: COLORS.text, fontSize: 11, width: 40, textAlign: 'right' }
});
