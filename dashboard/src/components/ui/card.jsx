import React from 'react'
import cn from './cn'

export function Card({ className, children }) {
  return <div className={cn('ui-card', className)}>{children}</div>
}

export function CardHeader({ className, children }) {
  return <div className={cn('ui-card-header', className)}>{children}</div>
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('ui-card-title', className)}>{children}</h3>
}

export function CardDescription({ className, children }) {
  return <p className={cn('ui-card-description', className)}>{children}</p>
}

export function CardContent({ className, children }) {
  return <div className={cn('ui-card-content', className)}>{children}</div>
}
