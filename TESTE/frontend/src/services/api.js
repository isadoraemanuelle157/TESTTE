import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3002', // ajuste pra sua API
})

export default api