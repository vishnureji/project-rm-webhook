import React from 'react'
import cn from './cn'

export default function StateBlock({ type, title, description, className }) {
  return (
    <div className={cn('ui-state-block', type ? `ui-state-${type}` : '', className)}>
      {title ? <h4 className="ui-state-title">{title}</h4> : null}
      {description ? <p className="ui-state-description">{description}</p> : null}
    </div>
  )
}
