import type { TimeLog, Project, CategoryBreakdown } from '../types'

export function getTotalHours(logs: TimeLog[]): number {
  return logs.reduce((sum, l) => sum + l.duration_min, 0) / 60
}

export function getBillableHours(logs: TimeLog[]): number {
  return logs
    .filter(l => l.entry_type === 'billable')
    .reduce((sum, l) => sum + l.duration_min, 0) / 60
}

export function getNonBillableHours(logs: TimeLog[]): number {
  return getTotalHours(logs) - getBillableHours(logs)
}

export function getEffectiveRate(project: Project, logs: TimeLog[]): number {
  const total = getTotalHours(logs)
  if (total === 0) return project.total_value / Math.max(project.est_hours, 1)
  return project.total_value / total
}

export function getNonBillableRatio(logs: TimeLog[]): number {
  const total = getTotalHours(logs)
  if (total === 0) return 0
  return getNonBillableHours(logs) / total
}

export function getCategoryBreakdown(logs: TimeLog[]): CategoryBreakdown[] {
  const cats: Array<'work' | 'calls' | 'revisions' | 'admin' | 'scope'> = [
    'work', 'calls', 'revisions', 'admin', 'scope'
  ]
  return cats.map(cat => ({
    category: cat,
    hours: logs
      .filter(l => l.category === cat)
      .reduce((s, l) => s + l.duration_min, 0) / 60,
  }))
}

export function getRevisionPercent(logs: TimeLog[]): number {
  const total = getTotalHours(logs)
  if (total === 0) return 0
  const revHours = logs
    .filter(l => l.category === 'revisions')
    .reduce((s, l) => s + l.duration_min, 0) / 60
  return (revHours / total) * 100
}

// Build rate-over-time series for the chart
export function getRateTimeSeries(project: Project, logs: TimeLog[]): { time: string; rate: number; logs: number }[] {
  if (logs.length === 0) return []
  const sorted = [...logs].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const series: { time: string; rate: number; logs: number }[] = []
  for (let i = 0; i < sorted.length; i++) {
    const subset = sorted.slice(0, i + 1)
    const rate = getEffectiveRate(project, subset)
    series.push({
      time: new Date(sorted[i].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rate: Math.round(rate),
      logs: i + 1,
    })
  }
  return series
}
