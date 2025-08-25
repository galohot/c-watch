'use client'

import { useState, useEffect } from 'react'
import { supabase, type CorruptionCase } from '../lib/supabase'

export interface UseCorruptionCasesResult {
  cases: CorruptionCase[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCorruptionCases(): UseCorruptionCasesResult {
  const [cases, setCases] = useState<CorruptionCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('corruption_cases')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (supabaseError) {
        throw supabaseError
      }
      
      setCases(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  return {
    cases,
    loading,
    error,
    refetch: fetchCases,
  }
}