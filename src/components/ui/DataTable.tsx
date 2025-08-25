'use client'

import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface Column {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  className?: string
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: any, index: number) => void
  highlightRow?: (row: any, index: number) => boolean
}

export function DataTable({
  columns,
  data,
  className,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  highlightRow
}: DataTableProps) {
  if (loading) {
    return (
      <div className={cn('terminal-panel', className)}>
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner mr-2"></div>
          <span className="text-orange-400/70 font-mono">Loading data...</span>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('terminal-panel', className)}>
        <div className="text-center py-8 text-orange-400/70 font-mono">
          {emptyMessage}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => {
            const isHighlighted = highlightRow?.(row, rowIndex)
            return (
              <tr
                key={rowIndex}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  isHighlighted && 'bg-orange-400/10 border-orange-400/40'
                )}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((column) => {
                  const value = row[column.key]
                  const displayValue = column.render ? column.render(value, row) : value
                  
                  return (
                    <td
                      key={column.key}
                      className={cn(
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {displayValue}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}