import api from '../api'

const ticketService = {
  getAll: () => api.get('/tickets/'),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets/', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  remove: (id) => api.delete(`/tickets/${id}`),
  search: (params) => api.get('/search', { params }),
  getStats: () => api.get('/stats'),
}

export default ticketService
