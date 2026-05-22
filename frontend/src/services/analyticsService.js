import api from '../api'

const analyticsService = {
  runETL: () => api.post('/analytics/etl/run'),
  getSummary: () => api.get('/analytics/summary'),
  getCategoryDistribution: () => api.get('/analytics/category-distribution'),
  getPriorityDistribution: () => api.get('/analytics/priority-distribution'),
  getDepartmentStats: () => api.get('/analytics/department-stats'),
  getResolutionTrends: () => api.get('/analytics/resolution-trends'),
  getStatusBreakdown: () => api.get('/analytics/status-breakdown'),
}

export default analyticsService
