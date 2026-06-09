import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

const apiClient = axios.create({
  baseURL: `${API_URL}/game`,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, (error) => Promise.reject(error))

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      console.warn('🔒 Token expirado ou inválido')
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
    }

    if (status === 404) {
      console.error('❌ Rota não encontrada:', error.config?.url)
    }

    return Promise.reject(error)
  }
)

export { apiClient }

export const gameApi = {
  getGameModes: () => apiClient.get('/modes'),
  getLeaderboard: () => apiClient.get('/leaderboard'),
  getLiveActivities: () => apiClient.get('/activities/live'),
  getShop: () => apiClient.get('/shop'),

  getStats: () => apiClient.get('/stats'),
  getAchievements: () => apiClient.get('/achievements'),
  getDailyRewards: () => apiClient.get('/rewards/daily'),
  getDifficulties: (modoId) => apiClient.get(`/modes/${modoId}/difficulties`),

  startGame: (modo, dificuldade) => apiClient.post('/start', { modo, dificuldade }),
  answerQuestion: (payload) => apiClient.post('/answer', payload),

 claimDailyReward: (payload) => apiClient.post('/rewards/daily/claim', { 
  dia: parseInt(payload.dia) 
}),
  claimAchievement: (conquistaId) => apiClient.post('/achievements/claim', { conquistaId }),

  buyItem: (payload) => apiClient.post('/shop/buy', payload),
  equipItem: (itemId) => apiClient.post('/shop/equip', { itemId }),
  unequipItem: (itemId) => apiClient.post('/shop/unequip', { itemId }),
  getActiveInventory: () => apiClient.get('/inventory/active'),

  getEquippedItems: () => apiClient.get('/inventory/equipped'),
  
  equipAvatarGold: () => apiClient.post('/shop/equip', { itemId: 'avatar_gold' }),
  unequipAvatarGold: () => apiClient.post('/shop/unequip', { itemId: 'avatar_gold' }),
  
  // Toggle helper
  toggleAvatarGold: (equipar) => equipar 
    ? apiClient.post('/shop/equip', { itemId: 'avatar_gold' })
    : apiClient.post('/shop/unequip', { itemId: 'avatar_gold' })
}

export default gameApi
