import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetScrollView } from '@gorhom/bottom-sheet';

const SheetInput = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;
import { createProject } from '../services/projectService';
import { useGlobalStore } from '../stores/globalStore';
import { COLORS, TEXT_STYLES } from '../constants/theme';

const PROJECT_TYPES = ['Web Dev', 'Design', 'ML Project', 'Consulting', 'Content', 'Other'] as const;

export default function CreateProjectSheet({ sheetRef, onCreated }: { sheetRef: any, onCreated?: () => void }) {
  const snapPoints = useMemo(() => ['75%', '95%'], []);
  
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [type, setType] = useState<typeof PROJECT_TYPES[number]>('Web Dev');
  const [model, setModel] = useState<'fixed' | 'hourly'>('fixed');
  const [price, setPrice] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [budgetHours, setBudgetHours] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const handleSubmit = async () => {
    setError('');
    if (!title || !client || !budgetHours) {
      setError('Please fill in required fields (Title, Client, Budget)');
      return;
    }
    if (model === 'fixed' && !price) {
      setError('Please enter a fixed price');
      return;
    }
    if (model === 'hourly' && !hourlyRate) {
      setError('Please enter an hourly rate');
      return;
    }

    setLoading(true);
    try {
      await createProject({
        title,
        client,
        type,
        model,
        price: model === 'fixed' ? Number(price) : 0,
        hourlyRate: model === 'hourly' ? Number(hourlyRate) : 0,
        budgetHours: Number(budgetHours),
        meetUrl,
      });
      
      // Reset form
      setTitle(''); setClient(''); setPrice(''); setHourlyRate(''); setBudgetHours(''); setMeetUrl('');
      
      useGlobalStore.getState().triggerRefresh();
      sheetRef.current?.close();
      if (onCreated) onCreated();
    } catch (err) {
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.sheetTitle}>New Project</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Project Title</Text>
          <SheetInput 
            style={styles.input} 
            placeholderTextColor={COLORS.muted} 
            placeholder="e.g. E-commerce Redesign" 
            value={title} onChangeText={setTitle} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Client Name</Text>
          <SheetInput 
            style={styles.input} 
            placeholderTextColor={COLORS.muted} 
            placeholder="e.g. Acme Corp" 
            value={client} onChangeText={setClient} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Project Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
            {PROJECT_TYPES.map((t) => (
              <Pressable 
                key={t} 
                style={[styles.pill, type === t && styles.pillActive]} 
                onPress={() => setType(t)}
              >
                <Text style={[styles.pillText, type === t && styles.pillTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pricing Model</Text>
          <View style={styles.toggleRow}>
            <Pressable 
              style={[styles.toggleBtn, model === 'fixed' && styles.toggleBtnActive]} 
              onPress={() => setModel('fixed')}
            >
              <Text style={[styles.toggleText, model === 'fixed' && styles.toggleTextActive]}>Fixed Price</Text>
            </Pressable>
            <Pressable 
              style={[styles.toggleBtn, model === 'hourly' && styles.toggleBtnActive]} 
              onPress={() => setModel('hourly')}
            >
              <Text style={[styles.toggleText, model === 'hourly' && styles.toggleTextActive]}>Hourly Rate</Text>
            </Pressable>
          </View>
        </View>

        {model === 'fixed' ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Fixed Price (₹)</Text>
            <SheetInput 
              style={[styles.input, styles.monoInput]} 
              keyboardType="numeric" 
              placeholder="0" 
              placeholderTextColor={COLORS.muted}
              value={price} onChangeText={setPrice} 
            />
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rate per Hour (₹)</Text>
            <SheetInput 
              style={[styles.input, styles.monoInput]} 
              keyboardType="numeric" 
              placeholder="0" 
              placeholderTextColor={COLORS.muted}
              value={hourlyRate} onChangeText={setHourlyRate} 
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Estimated Hours Budget</Text>
          <SheetInput 
            style={[styles.input, styles.monoInput]} 
            keyboardType="numeric" 
            placeholder="0" 
            placeholderTextColor={COLORS.muted}
            value={budgetHours} onChangeText={setBudgetHours} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Google Meet URL (Optional)</Text>
          <SheetInput 
            style={styles.input} 
            autoCapitalize="none"
            placeholder="https://meet.google.com/xxx-xxxx" 
            placeholderTextColor={COLORS.muted}
            value={meetUrl} onChangeText={setMeetUrl} 
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable 
          style={styles.submitBtn} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Create Project</Text>
          )}
        </Pressable>
        <View style={{ height: 40 }} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.white,
  },
  handleIndicator: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    width: 40,
  },
  contentContainer: {
    padding: 28,
  },
  sheetTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: COLORS.fg,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
  } as any,
  input: {
    backgroundColor: COLORS.bgAlt,
    borderRadius: 14,
    padding: 14,
    color: COLORS.fg,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  monoInput: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
  },
  pillScroll: {
    flexDirection: 'row',
  },
  pill: {
    backgroundColor: COLORS.bgAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: COLORS.fg,
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
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgAlt,
    borderRadius: 14,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 11,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  } as any,
  toggleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.muted,
  },
  toggleTextActive: {
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.fg,
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
    marginTop: 8,
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
