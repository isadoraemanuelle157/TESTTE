import axios from 'axios'

// ✅ VITE: usa import.meta.env.VITE_*
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

const api = axios.create({
  baseURL: `${API_URL}/game`,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const gameApi = {
  getModes: () => api.get('/modes'),
  getDifficulties: (modo) => api.get(`/modes/${modo}/difficulties`),
  startGame: (modo, dificuldade) => api.post('/start', { modo, dificuldade }),
  answerQuestion: (sessionId, respostaIndex, tempoResposta) => 
    api.post('/answer', { sessionId, respostaIndex, tempoResposta }),
  getLeaderboard: (periodo = 'semana') => api.get(`/leaderboard?periodo=${periodo}`),
  getDailyRewards: () => api.get('/rewards/daily'),
  claimDailyReward: (dia) => api.post('/rewards/daily/claim', { dia }),
  getShop: () => api.get('/shop'),
  buyItem: (itemId) => api.post('/shop/buy', { itemId }),
  getAchievements: () => api.get('/achievements'),
  claimAchievement: (conquistaId) => api.post('/achievements/claim', { conquistaId }),
  getStats: () => api.get('/stats'),
  getLiveActivities: () => api.get('/activities/live')
}

export default gameApi