import type { Project, TimeLog } from '../types'
import { v4 as uuidv4 } from 'uuid'

// ─── Demo Seed Data ──────────────────────────────────────────────────────────
// These are used if Supabase is not configured, enabling full offline demo.

const now = new Date()
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString()

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    title: 'Website Redesign',
    client_name: 'Sharma Enterprises',
    project_type: 'Design',
    pricing_type: 'fixed',
    total_value: 15000,
    hourly_rate: 0,
    est_hours: 20,
    threshold: 500,
    created_at: hoursAgo(72),
  },
  {
    id: 'proj-02',
    title: 'Logo + Brand Identity',
    client_name: 'StartupXYZ',
    project_type: 'Design',
    pricing_type: 'fixed',
    total_value: 8000,
    hourly_rate: 0,
    est_hours: 10,
    threshold: 600,
    created_at: hoursAgo(48),
  },
]

export const DEMO_TIMELOGS: TimeLog[] = [
  // Project 1 — Sharma (goes critical)
  { id: uuidv4(), project_id: 'proj-01', duration_min: 360, entry_type: 'billable', category: 'work', notes: 'Initial design pass', created_at: hoursAgo(60) },
  { id: uuidv4(), project_id: 'proj-01', duration_min: 120, entry_type: 'non-billable', category: 'calls', notes: 'Client kickoff call', created_at: hoursAgo(50) },
  { id: uuidv4(), project_id: 'proj-01', duration_min: 180, entry_type: 'non-billable', category: 'revisions', notes: 'Round 1 revisions', created_at: hoursAgo(40) },
  { id: uuidv4(), project_id: 'proj-01', duration_min: 60, entry_type: 'non-billable', category: 'admin', notes: 'Contracts and invoicing', created_at: hoursAgo(30) },
  { id: uuidv4(), project_id: 'proj-01', duration_min: 240, entry_type: 'non-billable', category: 'revisions', notes: 'Round 2 revisions — major changes', created_at: hoursAgo(20) },
  { id: uuidv4(), project_id: 'proj-01', duration_min: 120, entry_type: 'non-billable', category: 'scope', notes: 'Scope creep — new section added', created_at: hoursAgo(10) },
  // Project 2 — StartupXYZ (healthy)
  { id: uuidv4(), project_id: 'proj-02', duration_min: 300, entry_type: 'billable', category: 'work', notes: 'Brand concepts', created_at: hoursAgo(36) },
  { id: uuidv4(), project_id: 'proj-02', duration_min: 60, entry_type: 'non-billable', category: 'calls', notes: 'Brief call', created_at: hoursAgo(24) },
  { id: uuidv4(), project_id: 'proj-02', duration_min: 90, entry_type: 'billable', category: 'work', notes: 'Finalising assets', created_at: hoursAgo(12) },
]

// ─── In-memory store (simulates DB for demo) ──────────────────────────────────
let projects = [...DEMO_PROJECTS]
let timelogs = [...DEMO_TIMELOGS]

export const db = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    return [...projects].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },
  getProject: async (id: string): Promise<Project | null> => {
    return projects.find(p => p.id === id) ?? null
  },
  createProject: async (payload: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    const project: Project = { ...payload, id: uuidv4(), created_at: new Date().toISOString() }
    projects = [project, ...projects]
    return project
  },

  // TimeLogs
  getTimeLogs: async (projectId: string): Promise<TimeLog[]> => {
    return timelogs
      .filter(l => l.project_id === projectId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  },
  addTimeLog: async (payload: Omit<TimeLog, 'id' | 'created_at'>): Promise<TimeLog> => {
    const log: TimeLog = { ...payload, id: uuidv4(), created_at: new Date().toISOString() }
    timelogs = [...timelogs, log]
    return log
  },
}
