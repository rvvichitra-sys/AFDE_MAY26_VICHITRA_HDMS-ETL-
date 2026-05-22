import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import analyticsService from '../services/analyticsService'
import './Analytics.css'

const PRIORITY_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e' }
const CATEGORY_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#10b981']
const STATUS_COLORS = { Open: '#3b82f6', 'In Progress': '#f59e0b', Resolved: '#10b981', Closed: '#6b7280' }

function SummaryCard({ label, value, sub }) {
  return (
    <div className="an-summary-card">
      <div className="an-summary-value">{value ?? '—'}</div>
      <div className="an-summary-label">{label}</div>
      {sub && <div className="an-summary-sub">{sub}</div>}
    </div>
  )
}

function ChartCard({ title, children, empty }) {
  return (
    <div className="an-chart-card card">
      <h3 className="an-chart-title">{title}</h3>
      {empty
        ? <div className="an-empty">No data — run the ETL pipeline first.</div>
        : children}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="an-tooltip">
      {label && <p className="an-tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [priorityData, setPriorityData] = useState([])
  const [departmentData, setDepartmentData] = useState([])
  const [resolutionData, setResolutionData] = useState([])
  const [statusData, setStatusData] = useState([])
  const [loading, setLoading] = useState(true)
  const [etlRunning, setEtlRunning] = useState(false)
  const [etlResult, setEtlResult] = useState(null)
  const [etlError, setEtlError] = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [sum, cat, pri, dept, res, sta] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getCategoryDistribution(),
        analyticsService.getPriorityDistribution(),
        analyticsService.getDepartmentStats(),
        analyticsService.getResolutionTrends(),
        analyticsService.getStatusBreakdown(),
      ])
      setSummary(sum.data)
      setCategoryData(cat.data)
      setPriorityData(pri.data)
      setDepartmentData(dept.data)
      setResolutionData(res.data)
      setStatusData(sta.data)
    } catch {
      // Data not loaded yet — ETL hasn't run
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const handleRunETL = async () => {
    setEtlRunning(true)
    setEtlResult(null)
    setEtlError(null)
    try {
      const res = await analyticsService.runETL()
      setEtlResult(res.data)
      await loadAll()
    } catch (err) {
      setEtlError(err.response?.data?.detail || 'ETL pipeline failed.')
    } finally {
      setEtlRunning(false)
    }
  }

  const hasData = summary && summary.total_historical > 0

  return (
    <div className="analytics">
      <div className="page-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Historical ticket analysis powered by ETL pipeline</p>
        </div>
        <button
          onClick={handleRunETL}
          disabled={etlRunning}
          className={`btn btn-primary ${etlRunning ? 'btn-loading' : ''}`}
        >
          {etlRunning ? 'Running ETL...' : 'Run ETL Pipeline'}
        </button>
      </div>

      {etlResult && (
        <div className="etl-result-banner">
          <strong>ETL Complete</strong> — Batch <code>{etlResult.batch_id}</code>:
          extracted <strong>{etlResult.extracted}</strong>,
          removed <strong>{etlResult.duplicates_removed}</strong> duplicates,
          loaded <strong>{etlResult.loaded}</strong> clean records.
        </div>
      )}
      {etlError && <div className="alert alert-error">{etlError}</div>}

      {loading ? (
        <div className="loading">Loading analytics...</div>
      ) : !hasData ? (
        <div className="an-no-data card">
          <div className="an-no-data-icon">📊</div>
          <h2>No Analytics Data</h2>
          <p>Click <strong>Run ETL Pipeline</strong> to import and process the historical ticket dataset.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="an-summary-grid">
            <SummaryCard label="Total Historical Tickets" value={summary.total_historical} />
            <SummaryCard label="Resolved / Closed" value={summary.resolved} sub={`${Math.round((summary.resolved / summary.total_historical) * 100)}% resolution rate`} />
            <SummaryCard label="Open / In Progress" value={summary.open_in_progress} />
            <SummaryCard label="Avg Resolution Time" value={summary.avg_resolution_days ? `${summary.avg_resolution_days} days` : '—'} />
          </div>

          {/* Charts Row 1 */}
          <div className="an-charts-grid-2">
            <ChartCard title="Most Common Issue Categories" empty={!categoryData.length}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Priority Distribution" empty={!priorityData.length}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ priority, percent }) => `${priority} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[entry.priority] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Charts Row 2 */}
          <div className="an-charts-grid-2">
            <ChartCard title="Department-wise Ticket Counts" empty={!departmentData.length}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={departmentData} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="department" type="category" tick={{ fontSize: 12 }} width={65} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Tickets" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Status Breakdown" empty={!statusData.length}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Resolution Trends — full width */}
          <ChartCard title="Average Resolution Time Trend (days)" empty={!resolutionData.length}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={resolutionData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'Avg Days', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'Tickets Resolved', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 11 } }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avg_days" name="Avg Resolution (days)" stroke="#6366f1" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                <Line yAxisId="right" type="monotone" dataKey="total_resolved" name="Tickets Resolved" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  )
}
