import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ticketService from '../services/ticketService'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import './Dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([ticketService.getStats(), ticketService.getAll()])
      .then(([statsRes, ticketsRes]) => {
        setStats(statsRes.data)
        setRecentTickets(ticketsRes.data.slice(0, 5))
      })
      .catch(() => setError('Failed to load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading dashboard...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of all support tickets</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tickets</div>
        </div>
        <div className="stat-card stat-open">
          <div className="stat-value">{stats.open}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card stat-progress">
          <div className="stat-value">{stats.in_progress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card stat-resolved">
          <div className="stat-value">{stats.resolved}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card stat-closed">
          <div className="stat-value">{stats.closed}</div>
          <div className="stat-label">Closed</div>
        </div>
      </div>

      <div className="recent-section card">
        <div className="section-header">
          <h2>Recent Tickets</h2>
          <Link to="/tickets" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        {recentTickets.length === 0 ? (
          <div className="empty-state">
            <p>No tickets yet. <Link to="/tickets/new">Create your first ticket</Link>.</p>
          </div>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.map(ticket => (
                <tr key={ticket.ticket_id}>
                  <td className="ticket-id">#{ticket.ticket_id}</td>
                  <td>
                    <div className="employee-name">{ticket.employee_name}</div>
                    <div className="department">{ticket.department}</div>
                  </td>
                  <td>{ticket.issue_category}</td>
                  <td><PriorityBadge priority={ticket.priority} /></td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td className="date">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/tickets/${ticket.ticket_id}`} className="btn btn-secondary btn-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
