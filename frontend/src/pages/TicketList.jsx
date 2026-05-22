import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import ticketService from '../services/ticketService'
import SearchFilter from '../components/SearchFilter'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import './TicketList.css'

export default function TicketList() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTickets = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const hasFilter = Object.values(filters).some(v => v !== '')
      const res = hasFilter
        ? await ticketService.search(filters)
        : await ticketService.getAll()
      setTickets(res.data)
    } catch {
      setError('Failed to load tickets.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTickets() }, [loadTickets])

  return (
    <div className="ticket-list">
      <div className="page-header">
        <div>
          <h1>All Tickets</h1>
          <p>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">+ New Ticket</Link>
      </div>

      <SearchFilter onSearch={loadTickets} />

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="card empty-state">
          <p>No tickets found matching your filters.</p>
        </div>
      ) : (
        <div className="card table-card">
          <table className="tickets-table full-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.ticket_id}>
                  <td className="ticket-id">#{ticket.ticket_id}</td>
                  <td className="employee-name">{ticket.employee_name}</td>
                  <td>{ticket.department}</td>
                  <td>{ticket.issue_category}</td>
                  <td><PriorityBadge priority={ticket.priority} /></td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td className="date">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/tickets/${ticket.ticket_id}`} className="btn btn-secondary btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
