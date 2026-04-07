import React from 'react'
import cn from './cn'

export default function Button({ className, variant = 'default', size = 'md', children, ...props }) {
  return (
    <button
      className={cn('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)}
      {...props}
    >
      {children}
    </button>
  )
}
