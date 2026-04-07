import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../ui/table'
import Skeleton from '../ui/skeleton'
import StateBlock from '../ui/state-block'
import Badge from '../ui/badge'

function formatPercent(value) {
  return `${Math.round(value * 100)}%`
}

export default function ComparisonTable({ rows, isLoading, error }) {
  if (error) {
    return <StateBlock type="error" title="Comparison unavailable" description={error} />
  }

  if (isLoading) {
    return (
      <div className="comparison-loading">
        <Skeleton className="comparison-skeleton" />
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return (
      <StateBlock
        type="empty"
        title="No platform comparison data"
        description="Data appears here when articles exist in the selected period."
      />
    )
  }

  const maxPosts = Math.max(...rows.map((row) => row.posts), 1)

  return (
    <div className="comparison-table-wrap">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Platform</TableHeaderCell>
            <TableHeaderCell align="right">Posts</TableHeaderCell>
            <TableHeaderCell align="right">Share</TableHeaderCell>
            <TableHeaderCell>Momentum</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const scale = row.posts / maxPosts
            const momentum = row.momentum > 0 ? 'positive' : row.momentum < 0 ? 'negative' : 'steady'

            return (
              <TableRow key={row.platform}>
                <TableCell>
                  <div className="platform-cell">
                    <span className="platform-name">{row.platform}</span>
                  </div>
                </TableCell>
                <TableCell className="is-right">{row.posts}</TableCell>
                <TableCell className="is-right">{formatPercent(row.share)}</TableCell>
                <TableCell>
                  <div className="momentum-cell">
                    <div className="momentum-bar-track">
                      <div className="momentum-bar-fill" style={{ width: `${Math.max(scale * 100, 8)}%` }} />
                    </div>
                    <Badge
                      variant={momentum === 'positive' ? 'success' : momentum === 'negative' ? 'danger' : 'warning'}
                    >
                      {momentum}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
