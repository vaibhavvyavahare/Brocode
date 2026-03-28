import type { Insight, ProjectStats } from '../types'

export function generateInsights(stats: ProjectStats): Insight[] {
  const insights: Insight[] = []

  if (stats.isBelowThreshold) {
    insights.push({
      message: `Effective rate has dropped to ₹${stats.effectiveRate.toFixed(0)}/hr — below your threshold. Time to renegotiate.`,
      severity: 'critical',
      icon: '🔴',
    })
  }

  if (stats.revisionPercent > 25) {
    insights.push({
      message: `Revisions are eating ${stats.revisionPercent.toFixed(0)}% of your total time. Consider a strict 2-revision policy.`,
      severity: 'warning',
      icon: '🟡',
    })
  }

  if (stats.nonBillableRatio > 0.35) {
    insights.push({
      message: `${(stats.nonBillableRatio * 100).toFixed(0)}% of time is non-billable. This client has unusually high overhead.`,
      severity: 'warning',
      icon: '🟡',
    })
  }

  const callHours = stats.categoryBreakdown.find(c => c.category === 'calls')?.hours ?? 0
  if (callHours > 3) {
    insights.push({
      message: `${callHours.toFixed(1)} hrs spent on calls. Consider adding a ₹500/hr meeting rate to future contracts.`,
      severity: 'info',
      icon: '🔵',
    })
  }

  const adminHours = stats.categoryBreakdown.find(c => c.category === 'admin')?.hours ?? 0
  if (adminHours > 2) {
    insights.push({
      message: `${adminHours.toFixed(1)} hrs on admin work. Use templates to reduce this overhead on future projects.`,
      severity: 'info',
      icon: '🔵',
    })
  }

  if (stats.totalHours > 0 && stats.effectiveRate > 1000 && !stats.isBelowThreshold) {
    insights.push({
      message: `Strong rate at ₹${stats.effectiveRate.toFixed(0)}/hr. Keep scope tight and avoid unplanned revisions.`,
      severity: 'info',
      icon: '🟢',
    })
  }

  if (stats.totalHours === 0) {
    insights.push({
      message: 'No time logged yet. Start tracking to see your real effective rate.',
      severity: 'info',
      icon: '🔵',
    })
  }

  return insights
}
