import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://afde-may26-vichitra-hdms-etl.onrender.com',
  headers: { 'Content-Type': 'application/json' },
})

export default api
