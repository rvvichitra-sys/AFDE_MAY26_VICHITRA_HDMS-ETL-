import { useState } from 'react'
import './SearchFilter.css'

const CATEGORIES = [
  'VPN Issue', 'Password Reset', 'Software Installation',
  'Laptop Issue', 'Email Access', 'Network Connectivity', 'Hardware Request'
]
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']

export default function SearchFilter({ onSearch }) {
  const [filters, setFilters] = useState({ keyword: '', category: '', status: '', priority: '' })

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value }
    setFilters(updated)
    onSearch(updated)
  }

  const handleClear = () => {
    const cleared = { keyword: '', category: '', status: '', priority: '' }
    setFilters(cleared)
    onSearch(cleared)
  }

  const hasFilters = Object.values(filters).some(v => v !== '')

  return (
    <div className="search-filter card">
      <div className="filter-row">
        <input
          type="text"
          name="keyword"
          value={filters.keyword}
          onChange={handleChange}
          placeholder="Search by name, department, description..."
          className="form-control search-input"
        />
        <select name="category" value={filters.category} onChange={handleChange} className="form-control">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="status" value={filters.status} onChange={handleChange} className="form-control">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="priority" value={filters.priority} onChange={handleChange} className="form-control">
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {hasFilters && (
          <button onClick={handleClear} className="btn btn-secondary btn-sm">Clear</button>
        )}
      </div>
    </div>
  )
}
