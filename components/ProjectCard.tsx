import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Project } from '../services/projectService';
import { COLORS, TEXT_STYLES } from '../constants/theme';
import RateDisplay from './RateDisplay';
import { Video, Play } from 'lucide-react-native';

interface ProjectCardProps {
  project: Project;
  sessions: any[];
  rateFloor: number;
  onPress: () => void;
  onStartTimer?: () => void;
}

export default function ProjectCard({ project, sessions, rateFloor, onPress, onStartTimer }: ProjectCardProps) {
  const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
  const billableHours = sessions.filter(s => s.type === 'billable').reduce((sum, s) => sum + s.hours, 0);
  const nonBillableHours = totalHours - billableHours;

  let effectiveRate = 0;
  let totalValue = project.model === 'fixed' ? project.price : billableHours * project.hourlyRate;

  if (totalHours > 0) {
    effectiveRate = totalValue / totalHours;
  } else if (project.model === 'hourly') {
    effectiveRate = project.hourlyRate;
  }

  const budgetProgress = project.budgetHours > 0 ? Math.min(totalHours / project.budgetHours, 1) : 0;
  const isBelow = effectiveRate > 0 && effectiveRate < rateFloor;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Alert strip when below floor */}
      {isBelow && (
        <View style={styles.alertStrip}>
          <Text style={styles.alertText}>Rate below floor — reassess scope or renegotiate</Text>
        </View>
      )}

      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
          <Text style={styles.client}>{project.client}</Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{project.type} ▾</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <RateDisplay rate={effectiveRate} floor={rateFloor} size="lg" />
          <Text style={styles.statLabel}>EFF RATE</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{billableHours.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>BILLABLE</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{nonBillableHours.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>NON-BILL</Text>
        </View>
      </View>

      {/* Budget progress bar */}
      {project.budgetHours > 0 && (
        <View style={styles.budgetSection}>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetValue}>{totalHours.toFixed(1)} / {project.budgetHours}h</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${budgetProgress * 100}%` }]} />
          </View>
        </View>
      )}

      {/* Action row */}
      <View style={styles.actions}>
        <Pressable style={styles.btnPrimary} onPress={onStartTimer}>
          <Play size={12} color={COLORS.white} fill={COLORS.white} />
          <Text style={styles.btnPrimaryText}>Start Work</Text>
        </Pressable>
        {project.meetUrl && (
          <Pressable style={styles.btnSecondary}>
            <Video size={14} color={COLORS.goldDark} />
            <Text style={styles.btnSecondaryText}>Meet</Text>
          </Pressable>
        )}
        <Pressable style={styles.btnGhost} onPress={onPress}>
          <Text style={styles.btnGhostText}>View Details →</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    overflow: 'hidden',
  } as any,
  alertStrip: {
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  alertText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#991b1b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleArea: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: COLORS.fg,
    marginBottom: 4,
  },
  client: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.muted,
  },
  typeBadge: {
    backgroundColor: COLORS.bgAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  typeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 0.04,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  statValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: COLORS.fg,
    fontVariant: ['tabular-nums'],
  } as any,
  statLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  } as any,
  budgetSection: {
    marginBottom: 20,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: COLORS.muted,
  },
  budgetValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: COLORS.muted,
  },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.bgAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 999,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 16,
  },
  btnPrimary: {
    backgroundColor: COLORS.fg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  } as any,
  btnPrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: COLORS.white,
    letterSpacing: 0.02,
  },
  btnSecondary: {
    backgroundColor: 'rgba(197,160,89,0.10)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnSecondaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: COLORS.goldDark,
  },
  btnGhost: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginLeft: 'auto',
  },
  btnGhostText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: COLORS.muted,
  },
});
