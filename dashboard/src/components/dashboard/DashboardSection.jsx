import React from 'react'
import cn from '../ui/cn'

export default function DashboardSection({ title, description, action, children, className }) {
  return (
    <section className={cn('dashboard-section', className)}>
      {(title || description || action) ? (
        <header className="dashboard-section-header">
          <div>
            {title ? <h2 className="dashboard-section-title">{title}</h2> : null}
            {description ? <p className="dashboard-section-description">{description}</p> : null}
          </div>
          {action ? <div className="dashboard-section-action">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
