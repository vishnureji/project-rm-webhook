import React from 'react'
import cn from './cn'

export default function Badge({ className, variant = 'neutral', children }) {
  return <span className={cn('ui-badge', `ui-badge-${variant}`, className)}>{children}</span>
}
