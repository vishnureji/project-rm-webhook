import React from 'react'
import cn from './cn'

export default function Skeleton({ className }) {
  return <div className={cn('ui-skeleton', className)} />
}
