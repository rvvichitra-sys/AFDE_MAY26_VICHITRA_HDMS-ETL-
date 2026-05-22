import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ticketService from '../services/ticketService'
import { StatusBadge, PriorityBadge } from '../components/StatusBadge'
import './TicketDetail.css'

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const CATEGORIES = [
  'VPN Issue', 'Password Reset', 'Software Installation',
  'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request'
]

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    ticketService.getById(id)
      .then(res => {
        setTicket(res.data)
        setForm({
          employee_name: res.data.employee_name,
          department: res.data.department,
          issue_category: res.data.issue_category,
          description: res.data.description,
          priority: res.data.priority,
          status: res.data.status,
          resolution_notes: res.data.resolution_notes || '',
        })
      })
      .catch(() => setError('Ticket not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await ticketService.update(id, form)
      setTicket(res.data)
      setEditing(false)
    } catch {
      setSaveError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return
    setDeleting(true)
    try {
      await ticketService.remove(id)
      navigate('/tickets')
    } catch {
      setError('Failed to delete ticket.')
      setDeleting(false)
    }
  }

  if (loading) return <div className="loading">Loading ticket...</div>
  if (error) return (
    <div>
      <div className="alert alert-error">{error}</div>
      <Link to="/tickets" className="btn btn-secondary">Back to Tickets</Link>
    </div>
  )

  return (
    <div className="ticket-detail">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/tickets">Tickets</Link> / <span>#{ticket.ticket_id}</span>
          </div>
          <h1>Ticket #{ticket.ticket_id}</h1>
        </div>
        <div className="header-actions">
          {!editing && (
            <>
              <button onClick={() => setEditing(true)} className="btn btn-secondary">Edit</button>
              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
          {editing && (
            <>
              <button onClick={() => { setEditing(false); setSaveError(null) }} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {saveError && <div className="alert alert-error">{saveError}</div>}

      <div className="detail-grid">
        <div className="detail-main card">
          <h2>Ticket Information</h2>

          {editing ? (
            <div className="edit-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Employee Name</label>
                  <input type="text" name="employee_name" value={form.employee_name} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" name="department" value={form.department} onChange={handleChange} className="form-control" />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Category</label>
                  <select name="issue_category" value={form.issue_category} onChange={handleChange} className="form-control">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label>Priority</label>
                    <select name="priority" value={form.priority} onChange={handleChange} className="form-control">
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className="form-control">
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-control" rows={4} />
              </div>
              <div className="form-group">
                <label>Resolution Notes</label>
                <textarea name="resolution_notes" value={form.resolution_notes} onChange={handleChange} className="form-control" rows={3} placeholder="Add resolution notes..." />
              </div>
            </div>
          ) : (
            <div className="detail-view">
              <div className="detail-row">
                <span className="detail-label">Employee</span>
                <span className="detail-value">{ticket.employee_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Department</span>
                <span className="detail-value">{ticket.department}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Category</span>
                <span className="detail-value">{ticket.issue_category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Priority</span>
                <span className="detail-value"><PriorityBadge priority={ticket.priority} /></span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value"><StatusBadge status={ticket.status} /></span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span className="detail-value">{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
              <div className="detail-row full-width">
                <span className="detail-label">Description</span>
                <span className="detail-value description-text">{ticket.description}</span>
              </div>
              {ticket.resolution_notes && (
                <div className="detail-row full-width resolution">
                  <span className="detail-label">Resolution Notes</span>
                  <span className="detail-value">{ticket.resolution_notes}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
