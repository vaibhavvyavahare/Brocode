import { getAuthenticatedUserId, getSupabaseClient } from '../lib/supabase'
import { db } from '../lib/store'
import type { TimeLog } from '../types'

type SessionRow = {
  id: string
  project_id: string
  user_id: string
  type: 'billable' | 'nonbillable'
  nbCategory: string | null
  hours: number
  note: string | null
  startedAt: string
  endedAt: string
}

const VALID_CATEGORIES = ['work', 'calls', 'revisions', 'admin', 'scope'] as const

function normalizeCategory(value: string | null): TimeLog['category'] {
  if (value && VALID_CATEGORIES.includes(value as (typeof VALID_CATEGORIES)[number])) {
    return value as TimeLog['category']
  }
  return 'work'
}

function mapSessionRow(row: SessionRow): TimeLog {
  const entryType = row.type === 'nonbillable' ? 'non-billable' : 'billable'

  return {
    id: row.id,
    project_id: row.project_id,
    duration_min: Math.max(1, Math.round(Number(row.hours ?? 0) * 60)),
    entry_type: entryType,
    category: normalizeCategory(row.nbCategory),
    notes: row.note ?? undefined,
    created_at: row.startedAt,
  }
}

export async function getTimeLogs(projectId: string): Promise<TimeLog[]> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('sessions')
      .select('id, project_id, user_id, type, nbCategory, hours, note, startedAt, endedAt')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('startedAt', { ascending: true })

    if (error) throw error

    const mapped = (data ?? []).map(mapSessionRow)
    if (mapped.length > 0) return mapped

    return db.getTimeLogs(projectId)
  } catch {
    return db.getTimeLogs(projectId)
  }
}

export async function addTimeLog(payload: Omit<TimeLog, 'id' | 'created_at'>): Promise<TimeLog> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = getSupabaseClient()

    const end = new Date()
    const start = new Date(end.getTime() - payload.duration_min * 60_000)

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        project_id: payload.project_id,
        user_id: userId,
        type: payload.entry_type === 'non-billable' ? 'nonbillable' : 'billable',
        nbCategory: payload.category,
        hours: payload.duration_min / 60,
        note: payload.notes?.trim() ? payload.notes.trim() : null,
        startedAt: start.toISOString(),
        endedAt: end.toISOString(),
      })
      .select('id, project_id, user_id, type, nbCategory, hours, note, startedAt, endedAt')
      .single()

    if (error) throw error
    return mapSessionRow(data)
  } catch {
    return db.addTimeLog(payload)
  }
}
