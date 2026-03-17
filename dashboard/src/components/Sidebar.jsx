import React from 'react'
import { BarChart3, Mail, Home } from 'lucide-react'
import '../styles/Sidebar.css'

export default function Sidebar({ currentPage, onPageChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
          onClick={() => onPageChange('analytics')}
          title="Content Analytics Dashboard"
        >
          <Home style={{ width: '20px', height: '20px' }} />
          <span>Analytics</span>
        </button>

        <button
          className={`nav-item ${currentPage === 'mailchimp' ? 'active' : ''}`}
          onClick={() => onPageChange('mailchimp')}
          title="Mailchimp Email Marketing"
        >
          <Mail style={{ width: '20px', height: '20px' }} />
          <span>Mailchimp</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-version">v1.0.0</p>
      </div>
    </aside>
  )
}
