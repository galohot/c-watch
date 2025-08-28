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
    <header className={cn(
      'relative overflow-hidden',
      'bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95',
      'border-b-2 border-gradient-to-r from-cyan-400/30 via-blue-500/40 to-purple-500/30',
      'backdrop-blur-xl shadow-2xl',
      'before:absolute before:inset-0 before:bg-gradient-to-r before:from-cyan-500/5 before:via-blue-500/10 before:to-purple-500/5',
      'before:animate-pulse before:duration-3000',
      className
    )}>
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(59,130,246,0.1)_25px,rgba(59,130,246,0.1)_26px,transparent_27px,transparent_74px,rgba(59,130,246,0.1)_75px,rgba(59,130,246,0.1)_76px,transparent_77px),linear-gradient(rgba(59,130,246,0.1)_24px,transparent_25px,transparent_26px,rgba(59,130,246,0.1)_27px,rgba(59,130,246,0.1)_74px,transparent_75px,transparent_76px,rgba(59,130,246,0.1)_77px)] bg-[size:100px_100px]" />
      </div>
      
      {/* Glowing top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      
      <div className="relative z-10 p-6">
        {/* Top row - Title and System Status */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse shadow-lg shadow-cyan-400/50" />
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent font-mono tracking-wider drop-shadow-lg">
                {title}
              </h1>
            </div>
            <p className="text-slate-300 text-base font-medium ml-6 tracking-wide opacity-90">
              {subtitle}
            </p>
            <div className="ml-6 flex items-center space-x-4 text-xs font-mono uppercase tracking-wider">
              <span className="flex items-center space-x-2 text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span>OPERATIONAL</span>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-cyan-400">REAL-TIME MONITORING</span>
              <span className="text-slate-400">|</span>
              <span className="text-purple-400">SECURE CONNECTION</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <SystemStatus status={systemStatus} />
              <OnlineStatus />
            </div>
            
            <div className="text-right font-mono">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent tabular-nums">
                {currentTime ? formatTimeConsistent(currentTime) : '--:--:--'}
              </div>
              <div className="text-sm text-slate-400 tracking-wider">
                {currentTime ? formatDate(currentTime) : '--/--/----'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row - Search and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {showSearch && (
              <form onSubmit={handleSearch} className="flex items-center space-x-3">
                <TerminalInput
                  variant="search"
                  placeholder="Search cases, entities, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-96 bg-slate-800/50 border-slate-600/50 focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  loading={loading}
                />
                <TerminalButton
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={loading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                >
                  Search
                </TerminalButton>
              </form>
            )}
            
            {lastUpdated && currentTime && (
              <div className="flex items-center space-x-2 text-sm text-slate-400 font-mono">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Last updated: {formatTimeConsistent(lastUpdated)}</span>
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex items-center space-x-3">
              <TerminalButton
                variant="ghost"
                size="md"
                onClick={onRefresh}
                loading={loading}
                className="hover:bg-slate-700/50 hover:text-cyan-400 transition-all duration-300"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Refresh
              </TerminalButton>
              
              <TerminalButton
                variant="secondary"
                size="md"
                onClick={onExport}
                loading={loading}
                className="bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 hover:border-slate-500 transition-all duration-300"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              >
                Export
              </TerminalButton>
              
              <TerminalButton
                variant="outline"
                size="md"
                className="border-slate-600 hover:border-purple-500/50 hover:text-purple-400 transition-all duration-300"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
      
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </header>
  )
}