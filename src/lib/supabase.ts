import { createClient as createBrowserClient } from '../utils/supabase/client'
import { Database } from '../../database.types'

// Client-side Supabase client with TypeScript types
export const createClient = () => createBrowserClient()

// For backward compatibility, create a default client
export const supabase = createClient()

// Type exports for convenience
export type CorruptionCase = Database['public']['Tables']['corruption_cases']['Row']
export type CorruptionCaseInsert = Database['public']['Tables']['corruption_cases']['Insert']
export type CorruptionCaseUpdate = Database['public']['Tables']['corruption_cases']['Update']