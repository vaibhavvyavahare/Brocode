import { db } from '../lib/store'
import type { TimeLog } from '../types'

export async function getTimeLogs(projectId: string): Promise<TimeLog[]> {
  return db.getTimeLogs(projectId)
}

export async function addTimeLog(payload: Omit<TimeLog, 'id' | 'created_at'>): Promise<TimeLog> {
  return db.addTimeLog(payload)
}
