import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3002', // ajuste para sua URL real
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
