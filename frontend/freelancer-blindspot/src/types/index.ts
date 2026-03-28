export type RiskLevel = 'safe' | 'warning' | 'critical'
export type ClientRisk = 'good' | 'risky' | 'bad'
export type Severity = 'info' | 'warning' | 'critical'
export type EntryType = 'billable' | 'non-billable'
export type Category = 'work' | 'calls' | 'revisions' | 'admin' | 'scope'
export type PricingType = 'fixed' | 'hourly'
export type ProjectType = 'Design' | 'Dev' | 'Writing' | 'Marketing' | 'Other'

export interface Project {
  id: string
  title: string
  client_name: string
  project_type: ProjectType
  pricing_type: PricingType
  total_value: number
  hourly_rate: number
  est_hours: number
  threshold: number
  created_at: string
}

export interface TimeLog {
  id: string
  project_id: string
  duration_min: number
  entry_type: EntryType
  category: Category
  notes?: string
  created_at: string
}

export interface Insight {
  id?: string
  project_id?: string
  message: string
  severity: Severity
  icon: string
  created_at?: string
}

export interface CategoryBreakdown {
  category: Category
  hours: number
}

export interface ProjectStats {
  effectiveRate: number
  totalHours: number
  billableHours: number
  nonBillableHours: number
  nonBillableRatio: number
  categoryBreakdown: CategoryBreakdown[]
  riskLevel: RiskLevel
  isBelowThreshold: boolean
  revisionPercent: number
}

export interface ProjectWithStats extends Project {
  stats: ProjectStats
  insights: Insight[]
  clientRisk: ClientRisk
  logs: TimeLog[]
}
