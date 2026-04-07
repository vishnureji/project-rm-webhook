import React from 'react'
import cn from './cn'

export function Table({ className, children }) {
  return <table className={cn('ui-table', className)}>{children}</table>
}

export function TableHead({ className, children }) {
  return <thead className={cn(className)}>{children}</thead>
}

export function TableBody({ className, children }) {
  return <tbody className={cn(className)}>{children}</tbody>
}

export function TableRow({ className, children }) {
  return <tr className={cn('ui-table-row', className)}>{children}</tr>
}

export function TableHeaderCell({ className, children, align = 'left' }) {
  return <th className={cn('ui-table-header-cell', align === 'right' ? 'is-right' : '', className)}>{children}</th>
}

export function TableCell({ className, children, align = 'left' }) {
  return <td className={cn('ui-table-cell', align === 'right' ? 'is-right' : '', className)}>{children}</td>
}
