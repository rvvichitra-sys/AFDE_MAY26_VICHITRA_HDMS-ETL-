import './StatusBadge.css'

const statusConfig = {
  'Open': { className: 'badge-open', label: 'Open' },
  'In Progress': { className: 'badge-progress', label: 'In Progress' },
  'Resolved': { className: 'badge-resolved', label: 'Resolved' },
  'Closed': { className: 'badge-closed', label: 'Closed' },
}

const priorityConfig = {
  'Low': { className: 'priority-low', label: 'Low' },
  'Medium': { className: 'priority-medium', label: 'Medium' },
  'High': { className: 'priority-high', label: 'High' },
  'Critical': { className: 'priority-critical', label: 'Critical' },
}

export function StatusBadge({ status }) {
  const config = statusConfig[status] || { className: 'badge-open', label: status }
  return <span className={`badge ${config.className}`}>{config.label}</span>
}

export function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || { className: 'priority-medium', label: priority }
  return <span className={`badge ${config.className}`}>{config.label}</span>
}
