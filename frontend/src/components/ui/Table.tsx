import type { ReactNode } from 'react'

export interface TableColumn<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
}

const alignClasses: Record<'left' | 'right' | 'center', string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

export function Table<T extends object>({ columns, data, rowKey, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-[28px] border border-brand-divider bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-canvas text-xs uppercase tracking-wide text-brand-ink-soft">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-4 py-3 font-medium ${alignClasses[column.align ?? 'left']}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-divider">
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-brand-canvas' : ''}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 text-brand-ink ${alignClasses[column.align ?? 'left']}`}>
                  {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
