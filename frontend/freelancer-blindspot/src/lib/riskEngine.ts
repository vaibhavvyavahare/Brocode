import type { Project, TimeLog, RiskLevel, ClientRisk, ProjectStats } from '../types'
import {
  getEffectiveRate,
  getNonBillableRatio,
  getRevisionPercent,
  getCategoryBreakdown,
  getTotalHours,
  getBillableHours,
  getNonBillableHours,
} from './calculations'

export function getRiskLevel(project: Project, logs: TimeLog[]): RiskLevel {
  const rate = getEffectiveRate(project, logs)
  const ratio = getNonBillableRatio(logs)

  if (rate < project.threshold * 0.5) return 'critical'
  if (rate < project.threshold) return 'warning'
  if (ratio > 0.4) return 'warning'
  return 'safe'
}

export function isBelowThreshold(project: Project, logs: TimeLog[]): boolean {
  return getEffectiveRate(project, logs) < project.threshold
}

export function detectClientRisk(stats: ProjectStats): ClientRisk {
  let score = 0
  if (stats.revisionPercent > 25) score++
  if (stats.nonBillableRatio > 0.4) score++
  if (stats.isBelowThreshold) score += 2
  const callHours = stats.categoryBreakdown.find(c => c.category === 'calls')?.hours ?? 0
  if (callHours > 4) score++

  if (score >= 3) return 'bad'
  if (score >= 1) return 'risky'
  return 'good'
}

export function getProjectStats(project: Project, logs: TimeLog[]): ProjectStats {
  return {
    effectiveRate: getEffectiveRate(project, logs),
    totalHours: getTotalHours(logs),
    billableHours: getBillableHours(logs),
    nonBillableHours: getNonBillableHours(logs),
    nonBillableRatio: getNonBillableRatio(logs),
    categoryBreakdown: getCategoryBreakdown(logs),
    riskLevel: getRiskLevel(project, logs),
    isBelowThreshold: isBelowThreshold(project, logs),
    revisionPercent: getRevisionPercent(logs),
  }
}
