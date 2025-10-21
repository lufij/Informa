import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './info'

// Create a singleton Supabase client instance
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    )
  }
  return supabaseInstance
}
