import { db } from '../lib/store'
import { getProjectStats } from '../lib/riskEngine'
import { detectClientRisk } from '../lib/riskEngine'
import { generateInsights } from '../lib/insightEngine'
import type { Project, ProjectWithStats } from '../types'

export async function getProjects(): Promise<Project[]> {
  return db.getProjects()
}

export async function getProject(id: string): Promise<Project | null> {
  return db.getProject(id)
}

export async function createProject(payload: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
  return db.createProject(payload)
}

export async function getProjectWithStats(id: string): Promise<ProjectWithStats | null> {
  const project = await db.getProject(id)
  if (!project) return null
  const logs = await db.getTimeLogs(id)
  const stats = getProjectStats(project, logs)
  const insights = generateInsights(stats)
  const clientRisk = detectClientRisk(stats)
  return { ...project, stats, insights, clientRisk, logs }
}

export async function getAllProjectsWithStats(): Promise<ProjectWithStats[]> {
  const projects = await db.getProjects()
  return Promise.all(projects.map(p => getProjectWithStats(p.id) as Promise<ProjectWithStats>))
}
