import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Project, getProjects } from '../../services/projectService';
import { Session, getAllSessions } from '../../services/sessionService';
import { useGlobalStore } from '../../stores/globalStore';
import { COLORS, TEXT_STYLES } from '../../constants/theme';
import StatCard from '../../components/StatCard';
import ProjectCard from '../../components/ProjectCard';
import BillablePieChart from '../../components/charts/BillablePieChart';
import NonBillableBarChart from '../../components/charts/NonBillableBarChart';
import CreateProjectSheet from '../../components/CreateProjectSheet';

export default function Dashboard() {
  const router = useRouter();
  const { rateFloor, setRateFloor } = useGlobalStore();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFloor, setNewFloor] = useState(rateFloor.toString());
  
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

  // Compute greeting
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  // Compute stats
  const totalEarned = projects.reduce((sum, p) => {
    if (p.model === 'fixed') return sum + p.price;
    const pSessions = sessions.filter(s => s.projectId === p.id && s.type === 'billable');
    const bHours = pSessions.reduce((h, s) => h + s.hours, 0);
    return sum + (bHours * p.hourlyRate);
  }, 0);

  const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
  const avgRate = totalHours > 0 ? totalEarned / totalHours : 0;
  
  const activeProjectsCount = projects.length;
  
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
  const weekHours = sessions
    .filter(s => new Date(s.startedAt).getTime() >= weekStart)
    .reduce((sum, s) => sum + s.hours, 0);

  // Compute charts data
  const billableHours = sessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
  const nonBillableHours = totalHours - billableHours;
  
  const nbData = {
    communication: 0,
    revisions: 0,
    admin: 0,
    scope: 0,
  };
  sessions.filter(s => s.type === 'nonbillable' && s.nbCategory).forEach(s => {
    if (nbData[s.nbCategory as keyof typeof nbData] !== undefined) {
      nbData[s.nbCategory as keyof typeof nbData] += s.hours;
    }
  });

  // Project list with rate computation
  const projectStats = projects.map(p => {
    const pSessions = sessions.filter(s => s.projectId === p.id);
    const pTotalHours = pSessions.reduce((sum, s) => sum + s.hours, 0);
    const pBillable = pSessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
    let pValue = p.model === 'fixed' ? p.price : pBillable * p.hourlyRate;
    let effectiveRate = pTotalHours > 0 ? pValue / pTotalHours : (p.model === 'hourly' ? p.hourlyRate : 0);
    return { ...p, effectiveRate, sessions: pSessions };
  });

  projectStats.sort((a, b) => {
    // below floor first
    const aBelow = a.effectiveRate < rateFloor ? 1 : 0;
    const bBelow = b.effectiveRate < rateFloor ? 1 : 0;
    if (aBelow !== bBelow) return bBelow - aBelow;
    // then desc by rate
    return b.effectiveRate - a.effectiveRate;
  });

  const belowFloorCount = projectStats.filter(p => p.effectiveRate > 0 && p.effectiveRate < rateFloor).length;

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}, Freelancer 👋</Text>
          <Pressable style={styles.floorBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.floorText}>Floor: ₹{rateFloor}/hr</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={{ paddingRight: 16 }}>
          <StatCard label="TOTAL EARNED" value={`₹${totalEarned.toFixed(0)}`} color={COLORS.green} />
          <StatCard label="AVG RATE" value={`₹${avgRate.toFixed(0)}/hr`} color={avgRate >= rateFloor ? COLORS.green : COLORS.red} />
          <StatCard label="ACTIVE" value={activeProjectsCount.toString()} color={COLORS.accent2} />
          <StatCard label="WEEK HOURS" value={`${weekHours.toFixed(1)}h`} />
        </ScrollView>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Distribution</Text>
          <View style={styles.card}>
            <BillablePieChart billableHours={billableHours} nonBillableHours={nonBillableHours} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Where Non-Billable Time Goes</Text>
          <View style={styles.card}>
            <NonBillableBarChart data={nbData} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <Pressable onPress={() => createSheetRef.current?.expand()}>
              <Text style={styles.addBtnText}>+ Add Project</Text>
            </Pressable>
          </View>

          {belowFloorCount > 0 ? (
            <View style={[styles.banner, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: COLORS.red }]}>
              <Text style={[styles.bannerText, { color: COLORS.red }]}>⚠ {belowFloorCount} projects are below your ₹{rateFloor}/hr floor</Text>
            </View>
          ) : (
            <View style={[styles.banner, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: COLORS.green }]}>
              <Text style={[styles.bannerText, { color: COLORS.green }]}>✓ All projects above your rate floor</Text>
            </View>
          )}

          {projectStats.slice(0, 5).map(p => (
            <ProjectCard 
              key={p.id} 
              project={p} 
              sessions={p.sessions} 
              rateFloor={rateFloor} 
              onPress={() => router.push(`/project/${p.id}`)}
              onStartTimer={() => {/* handled inside detail or float */}}
            />
          ))}

          <Pressable style={styles.bigAddBtn} onPress={() => createSheetRef.current?.expand()}>
            <Text style={styles.bigAddBtnText}>+ Add Project</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Inline Modal for Floor Rate */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Rate Floor (₹/hr)</Text>
            <Text style={styles.modalBody}>This is your minimum acceptable effective hourly rate.</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={newFloor}
              onChangeText={setNewFloor}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalBtn, { backgroundColor: COLORS.accent }]} 
                onPress={() => {
                  setRateFloor(Number(newFloor) || rateFloor);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <CreateProjectSheet sheetRef={createSheetRef} onCreated={loadData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 16, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { ...TEXT_STYLES.heading2, flex: 1 },
  floorBtn: { backgroundColor: COLORS.surface2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  floorText: { fontFamily: 'SpaceMono_400Regular', color: COLORS.accent2, fontSize: 12 },
  statsScroll: { marginBottom: 32, overflow: 'visible' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { ...TEXT_STYLES.heading2 },
  addBtnText: { ...TEXT_STYLES.body, color: COLORS.accent, fontFamily: 'Syne_600SemiBold' },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  banner: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 16 },
  bannerText: { ...TEXT_STYLES.body, fontFamily: 'Syne_600SemiBold' },
  bigAddBtn: { backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  bigAddBtnText: { ...TEXT_STYLES.heading3, color: '#fff' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.surface, width: '100%', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { ...TEXT_STYLES.heading2, marginBottom: 8 },
  modalBody: { ...TEXT_STYLES.body, color: COLORS.muted, marginBottom: 16 },
  modalInput: { backgroundColor: COLORS.surface2, borderRadius: 8, padding: 12, ...TEXT_STYLES.mono, fontSize: 18, marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  modalBtnText: { ...TEXT_STYLES.body, color: COLORS.text, fontFamily: 'Syne_600SemiBold' }
});
