'use client'

import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BarChartData {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarChartData[]
  title?: string
  width?: number
  height?: number
  className?: string
  loading?: boolean
  error?: string
}

export default function BarChart({ data, title = 'Sector Analysis', loading = false, error }: BarChartProps) {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Cases by Sector',
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color || 'rgba(59, 130, 246, 0.8)'),
        borderColor: data.map(item => item.color || 'rgba(59, 130, 246, 1)'),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }

  const chartConfig = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: '#60a5fa',
        font: {
            size: 16,
            weight: 600,
            family: 'Inter, system-ui, sans-serif',
          },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#e2e8f0',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: { parsed: { x: number } }): string {
            const value = context.parsed.x
            return `Cases: ${value}`
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.2)',
          lineWidth: 1,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: function(tickValue: string | number): string {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue
            return value.toString()
          }
        },
        border: {
          color: '#475569',
          width: 2,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          maxTicksLimit: 10,
          callback: function(tickValue: string | number, index: number): string {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue
            const label = data[index]?.label || value.toString()
            if (label.length > 25) {
              return label.substring(0, 22) + '...'
            }
            return label
          }
        },
        border: {
          color: '#475569',
          width: 2,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-600/50 
                    bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-slate-800/90 
                    backdrop-blur-xl shadow-xl shadow-blue-500/10 h-full
                    hover:shadow-2xl hover:border-slate-500/70 transition-all duration-500">
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent 
                      translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500" />
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-600/30">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 
                       bg-clip-text text-transparent">
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-400 font-medium">Live</span>
        </div>
      </div>
      
      {/* Chart content */}
      <div className="p-6 h-[calc(100%-80px)]">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-blue-400">Loading sector data...</div>
          </div>
        ) : error ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-red-400">Error: {error}</div>
          </div>
        ) : !data.length ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-blue-400">No sector data available</div>
          </div>
        ) : (
          <div className="h-full w-full relative">
            {/* Chart background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 
                            rounded-lg opacity-50" />
            
            <Bar data={chartData} options={chartConfig} />
            
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-8 h-8 rounded-bl-full 
                            bg-gradient-to-bl from-blue-400/20 to-cyan-400/20" />
          </div>
        )}
      </div>
      
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full 
                      bg-gradient-to-r from-blue-400/0 via-blue-400/60 to-blue-400/0 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  )
}