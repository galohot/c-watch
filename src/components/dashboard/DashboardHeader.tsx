'use client'

import { useState, useEffect } from 'react'
import { TerminalButton, TerminalInput, OnlineStatus, SystemStatus } from '../ui'
import { cn } from '../../lib/utils'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  onSearch?: (query: string) => void
  onRefresh?: () => void
  onExport?: () => void
  className?: string
  showSearch?: boolean
  showActions?: boolean
  systemStatus?: 'operational' | 'degraded' | 'down'
  lastUpdated?: Date
  loading?: boolean
}

export function DashboardHeader({
  title = 'C-WATCH CORRUPTION MONITORING SYSTEM',
  subtitle = 'Real-time corruption case tracking and analysis',
  onSearch,
  onRefresh,
  onExport,
  className,
  showSearch = true,
  showActions = true,
  systemStatus = 'operational',
  lastUpdated,
  loading = false
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // Update time every second
  useEffect(() => {
    // Set initial time on client
    setCurrentTime(new Date())
    
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTimeConsistent = (date: Date) => {
    // Use consistent formatting to avoid hydration issues
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  return (
    <header className={cn('terminal-panel border-b-2 border-orange-400/30', className)}>
      {/* Top row - Title and System Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-orange-400 font-mono tracking-wider">
            {title}
          </h1>
          <p className="text-orange-400/70 text-sm font-mono mt-1">
            {subtitle}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <SystemStatus status={systemStatus} />
          <OnlineStatus />
          
          <div className="text-right font-mono text-sm">
            <div className="text-orange-400 font-bold">
              {currentTime ? formatTimeConsistent(currentTime) : '--:--:--'}
            </div>
            <div className="text-orange-400/70">
              {currentTime ? formatDate(currentTime) : '--/--/----'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row - Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showSearch && (
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <TerminalInput
                variant="search"
                placeholder="Search cases, entities, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80"
                loading={loading}
              />
              <TerminalButton
                type="submit"
                variant="primary"
                size="sm"
                loading={loading}
              >
                Search
              </TerminalButton>
            </form>
          )}
          
          {lastUpdated && currentTime && (
            <div className="text-xs text-orange-400/60 font-mono">
              Last updated: {formatTimeConsistent(lastUpdated)}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            <TerminalButton
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              loading={loading}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
            >
              Refresh
            </TerminalButton>
            
            <TerminalButton
              variant="secondary"
              size="sm"
              onClick={onExport}
              loading={loading}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Export
            </TerminalButton>
            
            <TerminalButton
              variant="outline"
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            >
              Settings
            </TerminalButton>
          </div>
        )}
      </div>

      {/* Terminal-style separator */}
      <div className="mt-4 border-t border-orange-400/20 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-orange-400/50">
          <div className="flex items-center space-x-4">
            <span>SYSTEM: ACTIVE</span>
            <span>MODE: MONITORING</span>
            <span>SECURITY: ENABLED</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>LIVE DATA FEED</span>
          </div>
        </div>
      </div>
    </header>
  )
}