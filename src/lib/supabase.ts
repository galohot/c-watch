import { createClient } from '@supabase/supabase-js'
import { Database } from '../../database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Type exports for convenience
export type CorruptionCase = Database['public']['Tables']['corruption_cases']['Row']
export type CorruptionCaseInsert = Database['public']['Tables']['corruption_cases']['Insert']
export type CorruptionCaseUpdate = Database['public']['Tables']['corruption_cases']['Update']