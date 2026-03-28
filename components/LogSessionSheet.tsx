import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { logSession, getSessions } from '../services/sessionService';
import { getProjects } from '../services/projectService';
import { COLORS, TEXT_STYLES } from '../constants/theme';
import { useGlobalStore } from '../stores/globalStore';

interface LogSessionSheetProps {
  sheetRef: any;
  projectId: string;
  prefillHours?: number;
  prefillType?: 'billable' | 'nonbillable';
  prefillCategory?: string;
  onLogged?: () => void;
}

const CATEGORIES = [
  { id: 'communication', label: '📞 Communication' },
  { id: 'revisions', label: '✏️ Revisions' },
  { id: 'admin', label: '🗂 Admin' },
  { id: 'scope', label: '🔄 Scope Additions' },
];

export default function LogSessionSheet({ 
  sheetRef, projectId, prefillHours, prefillType, prefillCategory, onLogged 
}: LogSessionSheetProps) {
  const snapPoints = useMemo(() => ['70%', '90%'], []);
  const { rateFloor } = useGlobalStore();
  
  const [hours, setHours] = useState('');
  const [type, setType] = useState<'billable' | 'nonbillable'>('billable');
  const [category, setCategory] = useState('communication');
  const [note, setNote] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [projectData, setProjectData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  // Open triggers reset
  useEffect(() => {
    if (prefillHours) setHours(prefillHours.toFixed(2));
    if (prefillType) setType(prefillType);
    if (prefillCategory) setCategory(prefillCategory);
  }, [prefillHours, prefillType, prefillCategory]);

  useEffect(() => {
    if (projectId) {
      getProjects().then(p => {
        const proj = p.find(x => x.id === projectId);
        if (proj) setProjectData(proj);
      });
      getSessions(projectId).then(setSessions);
    }
  }, [projectId]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const handleSubmit = async () => {
    setError('');
    const h = Number(hours);
    if (!h || h <= 0) {
      setError('Please enter valid hours');
      return;
    }

    setLoading(true);
    try {
      await logSession({
        projectId,
        type,
        nbCategory: type === 'nonbillable' ? (category as any) : undefined,
        hours: h,
        note,
        startedAt: new Date(Date.now() - h * 3600000).toISOString(),
        endedAt: new Date().toISOString(),
      });
      
      setHours(''); setNote('');
      sheetRef.current?.close();
      if (onLogged) onLogged();
    } catch (err) {
      setError('Failed to log session');
    } finally {
      setLoading(false);
    }
  };

  // Compute preview rate
  let previewRate = 0;
  if (projectData && hours) {
    const h = Number(hours) || 0;
    const oldTotal = sessions.reduce((s, x) => s + x.hours, 0);
    const newTotalHours = oldTotal + h;
    let oldBillable = sessions.filter(x => x.type === 'billable').reduce((s, x) => s + x.hours, 0);
    if (type === 'billable') oldBillable += h;
    
    let totalValue = projectData.price;
    if (projectData.model === 'hourly') {
      totalValue = oldBillable * projectData.hourlyRate;
    }
    
    previewRate = newTotalHours > 0 ? totalValue / newTotalHours : 0;
  }

  const previewColor = previewRate >= rateFloor * 1.2 ? COLORS.green : (previewRate >= rateFloor ? COLORS.amber : COLORS.red);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      enablePanDownToClose
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sheetTitle}>Log Session</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (Hours)</Text>
          <BottomSheetTextInput 
            style={[styles.input, styles.monoInput]} 
            keyboardType="numeric" 
            placeholder="0.0" 
            placeholderTextColor={COLORS.muted}
            value={hours} onChangeText={setHours} 
          />
          {hours ? (
            <Text style={styles.conversionText}>= {Math.round(Number(hours) * 60)} minutes</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Session Type</Text>
          <View style={styles.typeRow}>
            <Pressable 
              style={[styles.typeCard, type === 'billable' && { borderColor: COLORS.green }]}
              onPress={() => setType('billable')}
            >
              <Text style={styles.typeIcon}>💼</Text>
              <Text style={[styles.typeText, type === 'billable' && { color: COLORS.green }]}>Billable</Text>
            </Pressable>
            <Pressable 
              style={[styles.typeCard, type === 'nonbillable' && { borderColor: COLORS.amber }]}
              onPress={() => setType('nonbillable')}
            >
              <Text style={styles.typeIcon}>⚙️</Text>
              <Text style={[styles.typeText, type === 'nonbillable' && { color: COLORS.amber }]}>Non-Billable</Text>
            </Pressable>
          </View>
        </View>

        {type === 'nonbillable' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.tagsContainer}>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  style={[styles.tag, category === cat.id && styles.tagActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={[styles.tagText, category === cat.id && styles.tagTextActive]}>{cat.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <BottomSheetTextInput 
            style={styles.input} 
            placeholder="What did you work on?" 
            placeholderTextColor={COLORS.muted}
            value={note} onChangeText={setNote} 
            multiline
          />
        </View>

        {projectData && hours ? (
          <View style={styles.previewRow}>
           <Text style={styles.previewText}>
             After this session, effective rate will be: 
           </Text>
           <Text style={[styles.previewRate, { color: previewColor }]}>
             ₹{previewRate.toFixed(0)}/hr
           </Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Log Session</Text>}
        </Pressable>
        <View style={{ height: 40 }} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: { backgroundColor: COLORS.surface },
  handleIndicator: { backgroundColor: COLORS.border, width: 40 },
  contentContainer: { padding: 24 },
  sheetTitle: { ...TEXT_STYLES.heading2, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { ...TEXT_STYLES.label, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface2,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    fontFamily: 'Syne_400Regular',
    fontSize: 14,
    minHeight: 48,
  },
  monoInput: { fontFamily: 'SpaceMono_400Regular' },
  conversionText: { ...TEXT_STYLES.muted, marginTop: 4, fontFamily: 'SpaceMono_400Regular' },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.surface2,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  typeIcon: { fontSize: 24, marginBottom: 8 },
  typeText: { ...TEXT_STYLES.heading3, color: COLORS.muted },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: COLORS.surface2,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tagActive: { backgroundColor: COLORS.accent },
  tagText: { ...TEXT_STYLES.body, color: COLORS.text },
  tagTextActive: { fontFamily: 'Syne_600SemiBold' },
  previewRow: {
    backgroundColor: COLORS.surface2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  previewText: { ...TEXT_STYLES.body, color: COLORS.muted, marginBottom: 4 },
  previewRate: { fontFamily: 'SpaceMono_700Bold', fontSize: 20 },
  errorText: { ...TEXT_STYLES.body, color: COLORS.red, marginBottom: 16 },
  submitBtn: { backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { ...TEXT_STYLES.heading3, color: '#fff' },
});
