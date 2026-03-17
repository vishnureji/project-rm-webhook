import React, { useState } from 'react'
import { BarChart3, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import '../styles/Sidebar.css'

export default function Sidebar({ currentPage, onPageChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-wrapper">
          <div className="sidebar-logo">
            <img 
              src="https://amg.biz/wp-content/uploads/2022/12/logo-3.png" 
              alt="Logo"
              onError={(e) => {
                e.target.parentElement.style.display = 'none'
              }}
            />
          </div>
          {!isCollapsed && <h2>Dashboard</h2>}
        </div>
        <button
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
          onClick={() => onPageChange('analytics')}
          title="Analytics Dashboard"
        >
          <BarChart3 size={20} />
          {!isCollapsed && <span>Analytics</span>}
        </button>

        <button
          className={`nav-item ${currentPage === 'mailchimp' ? 'active' : ''}`}
          onClick={() => onPageChange('mailchimp')}
          title="Mailchimp Dashboard"
        >
          <Mail size={20} />
          {!isCollapsed && <span>Mailchimp</span>}
        </button>
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && <p className="sidebar-version">v1.0.0</p>}
      </div>
    </aside>
  )
}

