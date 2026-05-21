import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

// Instância do Axios
const apiClient = axios.create({
  baseURL: `${API_URL}/game`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de REQUEST - adiciona token Bearer
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

// Interceptor de RESPONSE - trata 401 e 404
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    
    if (status === 401) {
      console.warn('🔒 Token expirado ou inválido. Redirecionando para login...')
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      // Não redireciona automaticamente para não quebrar a UX
      // window.location.href = '/login'
    }
    
    if (status === 404) {
      console.error('❌ Rota não encontrada:', error.config?.url)
    }
    
    return Promise.reject(error)
  }
)

export { apiClient }

// Objeto com métodos do jogo
export const gameApi = {
  // Públicos
  getGameModes: () => apiClient.get('/modes'),
  getLeaderboard: () => apiClient.get('/leaderboard'),
  getLiveActivities: () => apiClient.get('/activities/live'),
  getShop: () => apiClient.get('/shop'),
  
  // Protegidos (precisam de token)
  getStats: () => apiClient.get('/stats'),
  getAchievements: () => apiClient.get('/achievements'),
  getDailyRewards: () => apiClient.get('/rewards/daily'),
  getDifficulties: (modoId) => apiClient.get(`/modes/${modoId}/difficulties`),
  
  // Jogo
  startGame: (modo, dificuldade) => apiClient.post('/start', { modo, dificuldade }),
  answerQuestion: (sessionId, respostaIndex, tempoResposta) => 
    apiClient.post('/answer', { sessionId, respostaIndex, tempoResposta }),
  
  // Recompensas e loja
  claimDailyReward: (dia) => apiClient.post('/rewards/daily/claim', { dia }),
  claimAchievement: (conquistaId) => apiClient.post('/achievements/claim', { conquistaId }),
  buyItem: (itemId) => apiClient.post('/shop/buy', { itemId })
}

export default gameApi