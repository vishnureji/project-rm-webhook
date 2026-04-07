import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import Skeleton from '../ui/skeleton'
import StateBlock from '../ui/state-block'

export default function AnalyticsChartCard({
  title,
  description,
  action,
  isLoading,
  isEmpty,
  error,
  children,
  className,
}) {
  return (
    <Card className={className}>
      <CardHeader className="chart-card-header">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        {action ? <div className="chart-card-action">{action}</div> : null}
      </CardHeader>
      <CardContent>
        {error ? (
          <StateBlock type="error" title="Could not load this view" description={error} />
        ) : isLoading ? (
          <div className="chart-card-loading">
            <Skeleton className="chart-skeleton" />
          </div>
        ) : isEmpty ? (
          <StateBlock type="empty" title="No data in this period" description="Try widening the date range or selecting another website." />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
