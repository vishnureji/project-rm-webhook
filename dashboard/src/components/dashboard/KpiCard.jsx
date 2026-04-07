import React from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import Badge from '../ui/badge'
import Skeleton from '../ui/skeleton'
import StateBlock from '../ui/state-block'

export default function KpiCard({
  title,
  value,
  context,
  trend,
  variant = 'neutral',
  isLoading,
  isEmpty,
  error,
}) {
  if (error) {
    return (
      <Card className="kpi-card">
        <CardContent>
          <StateBlock type="error" title={title} description={error} />
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="kpi-card">
        <CardContent>
          <div className="kpi-card-header">
            <span className="kpi-card-title">{title}</span>
            <Skeleton className="kpi-skeleton-badge" />
          </div>
          <Skeleton className="kpi-skeleton-value" />
          <Skeleton className="kpi-skeleton-context" />
        </CardContent>
      </Card>
    )
  }

  if (isEmpty) {
    return (
      <Card className="kpi-card">
        <CardContent>
          <StateBlock type="empty" title={title} description="No data for the selected filters." />
        </CardContent>
      </Card>
    )
  }

  const trendDirection = trend?.value > 0 ? 'up' : trend?.value < 0 ? 'down' : 'flat'

  return (
    <Card className={`kpi-card kpi-card-${variant}`}>
      <CardContent>
        <div className="kpi-card-header">
          <span className="kpi-card-title">{title}</span>
          {trend ? (
            <Badge variant={trendDirection === 'up' ? 'success' : trendDirection === 'down' ? 'danger' : 'neutral'}>
              {trendDirection === 'up' ? <TrendingUp size={14} /> : trendDirection === 'down' ? <TrendingDown size={14} /> : null}
              <span>{trend.label}</span>
            </Badge>
          ) : null}
        </div>
        <div className="kpi-card-value">{value}</div>
        <p className="kpi-card-context">{context || 'Compared to previous refresh window'}</p>
      </CardContent>
    </Card>
  )
}
