import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Linking, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Project, getProjects, deleteProject } from '../../services/projectService';
import { Session, getSessions, deleteSession, logSession } from '../../services/sessionService';
import { useGlobalStore } from '../../stores/globalStore';
import { useTimerStore } from '../../stores/timerStore';
import { COLORS, TEXT_STYLES } from '../../constants/theme';
import LogSessionSheet from '../../components/LogSessionSheet';
import BillablePieChart from '../../components/charts/BillablePieChart';
import NonBillableBarChart from '../../components/charts/NonBillableBarChart';
import { ArrowLeft, MoreVertical, Play, Video, Plus, Trash2 } from 'lucide-react-native';

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { rateFloor } = useGlobalStore();
  const { isRunning, projectId: activeTimerProjectId, startTimer, elapsed } = useTimerStore();
  
  const [project, setProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const sheetRef = useRef<any>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const p = await getProjects();
      const proj = p.find(x => x.id === id);
      if (proj) setProject(proj);
      
      const s = await getSessions(id);
      s.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      setSessions(s);
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!project) return null;

  const isTimerActiveForProject = isRunning && activeTimerProjectId === id;

  // Add currently elapsed time to the stats if running
  const liveElapsedHours = isTimerActiveForProject ? elapsed / (1000 * 60 * 60) : 0;

  let billableHours = sessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
  let nonBillableHours = sessions.filter(s => s.type === 'nonbillable').reduce((sum, s) => sum + s.hours, 0);
  
  if (isTimerActiveForProject) {
    const { sessionType } = useTimerStore.getState();
    if (sessionType === 'billable') billableHours += liveElapsedHours;
    else nonBillableHours += liveElapsedHours;
  }

  const totalHours = billableHours + nonBillableHours;
  
  let totalValue = project.model === 'fixed' ? project.price : billableHours * project.hourlyRate;
  let effectiveRate = totalHours > 0 ? totalValue / totalHours : (project.model === 'hourly' ? project.hourlyRate : 0);

  const budgetUsedPercent = project.budgetHours > 0 ? (totalHours / project.budgetHours) * 100 : 0;
  
  let profitabilityMsg = '';
  let profitabilityEmoji = '';
  if (effectiveRate >= rateFloor * 1.5) {
    profitabilityMsg = 'Highly profitable project'; profitabilityEmoji = '🟢';
  } else if (effectiveRate >= rateFloor) {
    profitabilityMsg = 'Profitable — watch your hours'; profitabilityEmoji = '🟡';
  } else {
    profitabilityMsg = "Unprofitable — you're losing money"; profitabilityEmoji = '🔴';
  }
  if (budgetUsedPercent > 90) {
    profitabilityMsg = 'Near budget limit — discuss scope'; profitabilityEmoji = '⚠️';
  }

  const nbData = { communication: 0, revisions: 0, admin: 0, scope: 0 };
  sessions.filter(s => s.type === 'nonbillable' && s.nbCategory).forEach(s => {
    nbData[s.nbCategory as keyof typeof nbData] += s.hours;
  });

  const handleDeleteSession = async (sId: string) => {
    await deleteSession(sId);
    loadData();
  };

  const handleStartWork = () => startTimer(project.id, project.title, 'billable');
  
  const handleJoinMeet = () => {
    if (project.meetUrl) {
      if (Platform.OS === 'web') {
        const win = window.open(project.meetUrl, '_blank');
        startTimer(project.id, project.title, 'nonbillable', 'communication');
        
        const poll = setInterval(async () => {
          if (win?.closed) {
            clearInterval(poll);
            const timerState = useTimerStore.getState();
            if (timerState.isRunning && timerState.projectId === project.id) {
               const data = timerState.stopTimer();
               if (data.projectId) {
                 await logSession({
                   projectId: data.projectId,
                   type: data.type,
                   nbCategory: data.nbCategory as any,
                   hours: data.hours,
                   note: 'Google Meet Session',
                   startedAt: new Date(Date.now() - data.hours * 3600000).toISOString(),
                   endedAt: new Date().toISOString(),
                 });
                 loadData();
                 Alert.alert('Meet Ended', `Logged ${data.hours.toFixed(2)}h for the meeting.`);
               }
            }
          }
        }, 1000);
      } else {
        Linking.openURL(project.meetUrl);
        startTimer(project.id, project.title, 'nonbillable', 'communication');
      }
    } else {
      Alert.alert('No Meet URL', 'Please edit project to add a Google Meet link.');
    }
  };

  const handleDeleteProject = () => {
    Alert.alert('Delete Project', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteProject(project.id);
        router.back();
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <ArrowLeft color={COLORS.text} size={24} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{project.title}</Text>
        <Pressable onPress={handleDeleteProject} style={{ padding: 8, marginRight: -8 }}>
          <MoreVertical color={COLORS.text} size={24} />
        </Pressable>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}>
        {/* Client & Type Row */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{project.client}</Text>
          <View style={styles.dot} />
          <Text style={styles.metaText}>{project.type}</Text>
        </View>

        {/* Hero Card */}
        <View style={[styles.heroCard, effectiveRate < rateFloor && { borderColor: COLORS.red }]}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>EFFECTIVE RATE</Text>
            {isTimerActiveForProject && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.heroRate, { color: effectiveRate >= rateFloor ? COLORS.green : COLORS.red }]}>
            ₹{effectiveRate.toFixed(0)}<Text style={{ fontSize: 24, color: COLORS.muted }}>/hr</Text>
          </Text>
          <Text style={styles.heroFormula}>
            ₹{totalValue.toFixed(0)} value ÷ {totalHours.toFixed(1)}h total
          </Text>

          {effectiveRate < rateFloor && (
            <View style={styles.alertStrip}>
              <Text style={styles.alertText}>
                ⚠ Rate below your ₹{rateFloor}/hr floor — consider renegotiating
              </Text>
            </View>
          )}
        </View>

        {/* Profitability Insight */}
        <View style={styles.insightBanner}>
          <Text style={styles.insightText}>{profitabilityEmoji} {profitabilityMsg}</Text>
        </View>

        {/* Actions Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsRow}>
          <Pressable style={styles.actionBtn} onPress={handleStartWork}>
            <Play color="#fff" fill="#fff" size={16} style={{ marginRight: 8 }} />
            <Text style={styles.actionText}>Start Work</Text>
          </Pressable>
          <Pressable style={styles.actionBtnSecondary} onPress={handleJoinMeet}>
            <Video color={COLORS.text} size={16} style={{ marginRight: 8 }} />
            <Text style={styles.actionTextSecondary}>Join Meet</Text>
          </Pressable>
          <Pressable style={styles.actionBtnSecondary} onPress={() => sheetRef.current?.expand()}>
            <Plus color={COLORS.text} size={16} style={{ marginRight: 8 }} />
            <Text style={styles.actionTextSecondary}>Log Session</Text>
          </Pressable>
        </ScrollView>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>TOTAL VALUE</Text>
            <Text style={styles.statBoxVal}>₹{totalValue.toFixed(0)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>BUDGET</Text>
            <Text style={styles.statBoxVal}>{project.budgetHours}h</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>BILLABLE</Text>
            <Text style={[styles.statBoxVal, { color: COLORS.green }]}>{billableHours.toFixed(1)}h</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxLabel}>NON-BILL</Text>
            <Text style={[styles.statBoxVal, { color: COLORS.gold }]}>{nonBillableHours.toFixed(1)}h</Text>
          </View>
        </View>

        {/* Budget Bar */}
        <View style={styles.budgetSection}>
          <Text style={styles.budgetLabel}>{totalHours.toFixed(1)} hrs used of {project.budgetHours} hrs budget</Text>
          <View style={styles.budgetTrack}>
            <View 
              style={[
                styles.budgetFill, 
                { 
                  width: `${Math.min(budgetUsedPercent, 100)}%`, 
                  backgroundColor: budgetUsedPercent > 90 ? COLORS.red : (budgetUsedPercent > 70 ? COLORS.gold : COLORS.green)
                }
              ]} 
            />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Time Breakdown</Text>
        <View style={styles.chartWrapper}>
          <BillablePieChart billableHours={billableHours} nonBillableHours={nonBillableHours} />
        </View>
        <View style={styles.chartWrapper}>
          <NonBillableBarChart data={nbData} />
        </View>

        <Text style={styles.sectionHeader}>Session Log</Text>
        <View style={styles.sessionList}>
          {sessions.length === 0 ? (
            <Text style={styles.emptySession}>No sessions yet — start the timer above.</Text>
          ) : sessions.map(s => (
            <View key={s.id} style={styles.sessionRow}>
              <View style={styles.sessionLeft}>
                <Text style={styles.sessionDate}>
                  {new Date(s.startedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.sessionNote}>{s.note || 'No note provided'}</Text>
                <View style={styles.sessionTags}>
                  {s.type === 'billable' ? (
                    <View style={[styles.tag, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                      <Text style={[styles.tagText, { color: COLORS.green }]}>Billable</Text>
                    </View>
                  ) : (
                    <View style={[styles.tag, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
                      <Text style={[styles.tagText, { color: COLORS.gold }]}>{s.nbCategory}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.sessionRight}>
                <Text style={styles.sessionHours}>{s.hours.toFixed(1)}h</Text>
                <Pressable style={styles.trashBtn} onPress={() => handleDeleteSession(s.id)}>
                  <Trash2 color={COLORS.muted} size={16} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <LogSessionSheet sheetRef={sheetRef} projectId={project.id} onLogged={loadData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { flex: 1, ...TEXT_STYLES.heading2, marginHorizontal: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 8 },
  metaText: { ...TEXT_STYLES.body, color: COLORS.muted },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.border },
  
  heroCard: { marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, paddingBottom: 16, borderWidth: 1, borderColor: COLORS.accent, marginBottom: 16 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  heroLabel: { ...TEXT_STYLES.label },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(6,182,212,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent2, marginRight: 6 },
  liveText: { fontFamily: 'SpaceMono_700Bold', fontSize: 10, color: COLORS.accent2 },
  heroRate: { fontFamily: 'SpaceMono_700Bold', fontSize: 48, marginBottom: 4 },
  heroFormula: { ...TEXT_STYLES.muted, fontFamily: 'SpaceMono_400Regular' },
  alertStrip: { backgroundColor: 'rgba(239,68,68,0.15)', padding: 12, marginHorizontal: -24, marginBottom: -16, marginTop: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  alertText: { ...TEXT_STYLES.body, fontSize: 12, color: COLORS.red, textAlign: 'center' },
  
  insightBanner: { marginHorizontal: 16, backgroundColor: COLORS.surface2, padding: 12, borderRadius: 8, marginBottom: 24 },
  insightText: { ...TEXT_STYLES.body, fontSize: 13 },
  
  actionsRow: { paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  actionBtn: { backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  actionText: { ...TEXT_STYLES.heading3, color: '#fff' },
  actionBtnSecondary: { backgroundColor: COLORS.surface2, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  actionTextSecondary: { ...TEXT_STYLES.heading3, color: COLORS.text },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  statBoxLabel: { ...TEXT_STYLES.label, marginBottom: 8 },
  statBoxVal: { fontFamily: 'SpaceMono_700Bold', fontSize: 20, color: COLORS.text },
  
  budgetSection: { paddingHorizontal: 16, marginBottom: 32 },
  budgetLabel: { ...TEXT_STYLES.body, fontSize: 13, marginBottom: 8, alignSelf: 'flex-end', color: COLORS.muted },
  budgetTrack: { height: 8, backgroundColor: COLORS.surface2, borderRadius: 4, overflow: 'hidden' },
  budgetFill: { height: '100%' },
  
  sectionHeader: { ...TEXT_STYLES.heading2, marginHorizontal: 16, marginBottom: 16, marginTop: 16 },
  chartWrapper: { marginHorizontal: 16, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  
  sessionList: { paddingHorizontal: 16 },
  emptySession: { ...TEXT_STYLES.muted, textAlign: 'center', paddingVertical: 24 },
  sessionRow: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  sessionLeft: { flex: 1 },
  sessionDate: { ...TEXT_STYLES.label, marginBottom: 4 },
  sessionNote: { ...TEXT_STYLES.body, color: COLORS.text, marginBottom: 8 },
  sessionTags: { flexDirection: 'row' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontFamily: 'Syne_600SemiBold', fontSize: 10 },
  sessionRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  sessionHours: { fontFamily: 'SpaceMono_700Bold', fontSize: 16, color: COLORS.text },
  trashBtn: { padding: 4 }
});
