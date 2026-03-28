import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform, TextInput } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';

const SheetInput = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;
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
      useGlobalStore.getState().triggerRefresh();
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
    let oldNonBillable = sessions.filter(x => x.type === 'nonbillable').reduce((s, x) => s + x.hours, 0);
    
    let newBillable = oldBillable;
    let newNonBillable = oldNonBillable;
    if (type === 'billable') newBillable += h;
    else newNonBillable += h;
    
    let totalValue = projectData.price;
    if (projectData.model === 'hourly') {
      totalValue = (newBillable * projectData.hourlyRate);
    }
    
    previewRate = newTotalHours > 0 ? totalValue / newTotalHours : 0;
  }

  const previewColor = previewRate >= rateFloor * 1.2 ? COLORS.green : (previewRate >= rateFloor ? COLORS.gold : '#991b1b');

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
          <SheetInput 
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
              style={[styles.typeCard, type === 'nonbillable' && { borderColor: COLORS.gold }]}
              onPress={() => setType('nonbillable')}
            >
              <Text style={styles.typeIcon}>⚙️</Text>
              <Text style={[styles.typeText, type === 'nonbillable' && { color: COLORS.goldDark }]}>Non-Billable</Text>
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
          <SheetInput 
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
  sheetBackground: { backgroundColor: COLORS.white },
  handleIndicator: { backgroundColor: 'rgba(0,0,0,0.15)', width: 40 },
  contentContainer: { padding: 28 },
  sheetTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: COLORS.fg,
    marginBottom: 28,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.bgAlt,
    borderRadius: 14,
    padding: 14,
    color: COLORS.fg,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  monoInput: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22 },
  conversionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 6,
  },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.bgAlt,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  typeIcon: { fontSize: 24, marginBottom: 8 },
  typeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.muted,
  },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: COLORS.bgAlt,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tagActive: { backgroundColor: COLORS.fg },
  tagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: COLORS.muted,
  },
  tagTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.white,
  },
  previewRow: {
    backgroundColor: COLORS.bgAlt,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  previewText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 6,
  },
  previewRate: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#991b1b',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: COLORS.fg,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  } as any,
  submitBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.02,
  },
});
