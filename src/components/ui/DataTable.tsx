'use client'

import { ReactNode, useState } from 'react'
import React from 'react'
import { cn } from '../../lib/utils'

interface Column<T = Record<string, unknown>> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T) => ReactNode
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  className?: string
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T, index: number) => void
  highlightRow?: (row: T, index: number) => boolean
  expandable?: boolean
  renderExpandedRow?: (row: T, index: number) => ReactNode
  expandedRowKey?: string
}

export function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  className,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  highlightRow,
  expandable = false,
  renderExpandedRow,
  expandedRowKey = 'id'
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set())
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
            {expandable && (
              <th className="w-8"></th>
            )}
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
            const rowKey = (row as Record<string, unknown>)[expandedRowKey] as string | number || rowIndex
            const isExpanded = expandedRows.has(rowKey)
            
            const handleRowClick = () => {
              if (expandable && renderExpandedRow) {
                const newExpandedRows = new Set(expandedRows)
                if (isExpanded) {
                  newExpandedRows.delete(rowKey)
                } else {
                  newExpandedRows.add(rowKey)
                }
                setExpandedRows(newExpandedRows)
              }
              onRowClick?.(row, rowIndex)
            }
            
            return (
              <React.Fragment key={rowIndex}>
                <tr
                  key={rowIndex}
                  className={cn(
                    (onRowClick || expandable) && 'cursor-pointer',
                    isHighlighted && 'bg-orange-400/10 border-orange-400/40',
                    isExpanded && 'bg-orange-400/5'
                  )}
                  onClick={handleRowClick}
                >
                  {expandable && (
                    <td className="w-8 text-center">
                      <span className={cn(
                        'inline-block transition-transform duration-200 text-orange-400',
                        isExpanded ? 'rotate-90' : 'rotate-0'
                      )}>
                        ▶
                      </span>
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = (row as Record<string, unknown>)[column.key]
                    const displayValue = column.render ? column.render(value, row) : value
                    
                    return (
                      <td
                        key={column.key}
                        className={cn(
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {displayValue as ReactNode}
                      </td>
                    )
                  })}
                </tr>
                {isExpanded && renderExpandedRow && (
                  <tr key={`expanded-${rowIndex}`} className="bg-gray-900/50">
                    <td colSpan={columns.length + (expandable ? 1 : 0)} className="p-0">
                      <div className="p-4 border-l-2 border-orange-400/40">
                        {renderExpandedRow(row, rowIndex)}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}