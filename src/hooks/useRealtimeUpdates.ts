'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, type CorruptionCase } from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface UseRealtimeUpdatesResult {
  isConnected: boolean
  error: string | null
  lastUpdate: CorruptionCase | null
  updateCount: number
}

export function useRealtimeUpdates(): UseRealtimeUpdatesResult {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<CorruptionCase | null>(null)
  const [updateCount, setUpdateCount] = useState(0)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const handleInsert = useCallback((payload: any) => {
    setLastUpdate(payload.new as CorruptionCase)
    setUpdateCount(prev => prev + 1)
  }, [])

  const handleUpdate = useCallback((payload: any) => {
    setLastUpdate(payload.new as CorruptionCase)
    setUpdateCount(prev => prev + 1)
  }, [])

  const handleDelete = useCallback((payload: any) => {
    setLastUpdate(payload.old as CorruptionCase)
    setUpdateCount(prev => prev + 1)
  }, [])

  useEffect(() => {
    const realtimeChannel = supabase
      .channel('corruption_cases_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'corruption_cases'
        },
        handleInsert
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'corruption_cases'
        },
        handleUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'corruption_cases'
        },
        handleDelete
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setError(null)
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          setError('Failed to connect to realtime updates')
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false)
          setError('Connection timed out')
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    setChannel(realtimeChannel)

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  }, [handleInsert, handleUpdate, handleDelete])

  return {
    isConnected,
    error,
    lastUpdate,
    updateCount
  }
}