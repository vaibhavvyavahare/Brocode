import { getProjectStats } from '../lib/riskEngine'
import { detectClientRisk } from '../lib/riskEngine'
import { generateInsights } from '../lib/insightEngine'
import { getTimeLogs } from './timelogs'
import { getAuthenticatedUserId, getSupabaseClient } from '../lib/supabase'
import { db } from '../lib/store'
import type { Project, ProjectWithStats } from '../types'

type ProjectRow = {
  id: string
  user_id: string
  title: string
  client: string
  type: Project['project_type']
  model: Project['pricing_type']
  price: number | null
  hourlyRate: number | null
  budgetHours: number | null
  threshold: number | null
  created_at: string
}

function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    client_name: row.client,
    project_type: row.type,
    pricing_type: row.model,
    total_value: Number(row.price ?? 0),
    hourly_rate: Number(row.hourlyRate ?? 0),
    est_hours: Number(row.budgetHours ?? 0),
    threshold: Number(row.threshold ?? 500),
    created_at: row.created_at,
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .select('id, user_id, title, client, type, model, price, hourlyRate, budgetHours, threshold, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped = (data ?? []).map(mapProjectRow)
    if (mapped.length > 0) return mapped

    // Preserve a usable dashboard when account is empty.
    return db.getProjects()
  } catch {
    return db.getProjects()
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .select('id, user_id, title, client, type, model, price, hourlyRate, budgetHours, threshold, created_at')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    if (data) return mapProjectRow(data)
  } catch {
    // Fallback below.
  }

  return db.getProject(id)
}

export async function createProject(payload: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
  try {
    const userId = await getAuthenticatedUserId()
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: payload.title,
        client: payload.client_name,
        type: payload.project_type,
        model: payload.pricing_type,
        price: payload.total_value,
        hourlyRate: payload.hourly_rate,
        budgetHours: payload.est_hours,
        threshold: payload.threshold,
      })
      .select('id, user_id, title, client, type, model, price, hourlyRate, budgetHours, threshold, created_at')
      .single()

    if (error) throw error
    return mapProjectRow(data)
  } catch {
    return db.createProject(payload)
  }
}

export async function getProjectWithStats(id: string): Promise<ProjectWithStats | null> {
  const project = await getProject(id)
  if (!project) return null
  const logs = await getTimeLogs(id)
  const stats = getProjectStats(project, logs)
  const insights = generateInsights(stats)
  const clientRisk = detectClientRisk(stats)
  return { ...project, stats, insights, clientRisk, logs }
}

export async function getAllProjectsWithStats(): Promise<ProjectWithStats[]> {
  const projects = await getProjects()
  return Promise.all(projects.map(p => getProjectWithStats(p.id) as Promise<ProjectWithStats>))
}
