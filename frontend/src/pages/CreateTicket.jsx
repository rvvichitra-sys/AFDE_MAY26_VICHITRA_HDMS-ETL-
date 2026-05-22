import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ticketService from '../services/ticketService'
import './CreateTicket.css'

const CATEGORIES = [
  'VPN Issue', 'Password Reset', 'Software Installation',
  'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request'
]
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

const initialForm = {
  employee_name: '',
  department: '',
  issue_category: '',
  description: '',
  priority: 'Medium',
}

export default function CreateTicket() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!form.employee_name.trim()) errs.employee_name = 'Employee name is required'
    if (!form.department.trim()) errs.department = 'Department is required'
    if (!form.issue_category) errs.issue_category = 'Please select a category'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters'
    return errs
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      const res = await ticketService.create(form)
      navigate(`/tickets/${res.data.ticket_id}`)
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Failed to create ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-ticket">
      <div className="page-header">
        <h1>Create New Ticket</h1>
        <p>Submit a new IT support request</p>
      </div>

      <div className="card form-card">
        {serverError && <div className="alert alert-error">{serverError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Employee Name *</label>
              <input
                type="text"
                name="employee_name"
                value={form.employee_name}
                onChange={handleChange}
                className={`form-control ${errors.employee_name ? 'error' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.employee_name && <span className="error-text">{errors.employee_name}</span>}
            </div>
            <div className="form-group">
              <label>Department *</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className={`form-control ${errors.department ? 'error' : ''}`}
                placeholder="e.g. Engineering, HR, Finance"
              />
              {errors.department && <span className="error-text">{errors.department}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Issue Category *</label>
              <select
                name="issue_category"
                value={form.issue_category}
                onChange={handleChange}
                className={`form-control ${errors.issue_category ? 'error' : ''}`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.issue_category && <span className="error-text">{errors.issue_category}</span>}
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="form-control"
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`form-control ${errors.description ? 'error' : ''}`}
              rows={4}
              placeholder="Describe the issue in detail..."
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
