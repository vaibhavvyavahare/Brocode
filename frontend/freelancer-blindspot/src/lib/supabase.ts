import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

function assertSupabaseConfigured() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.')
  }
}

export async function getAuthenticatedUserId(): Promise<string> {
  const client = getSupabaseClient()
  const { data, error } = await client.auth.getUser()
  if (error) throw error

  const userId = data.user?.id
  if (!userId) {
    throw new Error('No authenticated user found. Please sign in before accessing project data.')
  }

  return userId
}

export function getSupabaseClient() {
  assertSupabaseConfigured()
  return supabase as NonNullable<typeof supabase>
}
