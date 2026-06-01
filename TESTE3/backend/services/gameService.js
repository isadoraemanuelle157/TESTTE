const GameSession = require('../models/GameSession')
const UserGameStats = require('../models/UserGameStats')
const GameQuestion = require('../models/GameQuestion')
const axios = require('axios')
const { spotifyRequest } = require('../utils/spotifyRequest')
const DEEZER_API_URL = 'https://api.deezer.com'

// ============================================
// 🎮 CONFIGURAÇÕES DO JOGO
// ============================================

const GAME_CONFIG = {
  'guess-song': {
    nome: 'Adivinhe a Música',
    descricao: 'Escute o preview e adivinhe o título',
    icon: '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  'guess-artist': {
    nome: 'Adivinhe o Artista',
    descricao: 'Identifique o cantor pela voz',
    icon: '<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  'complete-lyric': {
    nome: 'Complete a Música',
    descricao: 'Descubra as palavras faltantes',
    icon: '<path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  'music-trivia': {
    nome: 'Quiz Musical',
    descricao: 'Teste seus conhecimentos',
    icon: '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
}

const DIFICULTIES = {
  easy: { nome: 'Fácil', multiplicador: 1, tempo: 30, icone: '🌱' },
  medium: { nome: 'Médio', multiplicador: 1.5, tempo: 20, icone: '🔥' },
  hard: { nome: 'Difícil', multiplicador: 2.5, tempo: 15, icone: '💀' }
}

// ============================================
// 🎯 INICIALIZAÇÃO DE STATS
// ============================================

const getOrCreateUserStats = async (userId) => {
  let stats = await UserGameStats.findOne({ usuario: userId })
  
  if (!stats) {
    stats = new UserGameStats({
      usuario: userId,
      conquistas: [
        { id: 'first_win', titulo: 'Primeira Vitória', descricao: 'Complete seu primeiro jogo', icon: '🏆', moedas: 50 },
        { id: 'streak_3', titulo: 'Sequência de Fogo', descricao: 'Acerte 3 perguntas seguidas', icon: '🔥', moedas: 100 },
        { id: 'streak_5', titulo: 'Imparável', descricao: 'Acerte 5 perguntas seguidas', icon: '⚡', moedas: 200 },
        { id: 'perfect_game', titulo: 'Perfeição', descricao: 'Acerte todas as perguntas', icon: '💎', moedas: 500 },
        { id: 'collector', titulo: 'Colecionador', descricao: 'Compre 3 itens na loja', icon: '🛍️', moedas: 150 },
        { id: 'daily_7', titulo: 'Dedicado', descricao: 'Resgate recompensas por 7 dias', icon: '📅', moedas: 300 }
      ]
    })
    await stats.save()
  }
  
  return stats
}

// ============================================
// 🎵 BUSCAR MÚSICAS PARA O JOGO
// ============================================

const buscarMusicasDeezer = async (query, limit = 20) => {
  try {
    const response = await axios.get(`${DEEZER_API_URL}/search`, {
      params: { q: query, limit },
      timeout: 5000
    })
    return response.data?.data || []
  } catch (error) {
    console.warn('⚠️ Deezer search error:', error.message)
    return []
  }
}

const buscarMusicasSpotify = async (query, limit = 20) => {
  try {
    const response = await spotifyRequest({
      method: 'GET',
      url: 'https://api.spotify.com/v1/search',
      params: { q: query, type: 'track', limit, market: 'BR' }
    })
    return response.data?.tracks?.items || []
  } catch (error) {
    console.warn('⚠️ Spotify search error:', error.message)
    return []
  }
}

// ============================================
// 🎲 GERAR PERGUNTAS DINÂMICAS
// ============================================

const gerarPerguntaGuessSong = async (dificuldade) => {
  const queries = ['top hits', 'popular', 'trending', 'viral']
  const query = queries[Math.floor(Math.random() * queries.length)]
  
  const tracks = await buscarMusicasDeezer(query, 50)
  const validTracks = tracks.filter(t => t.preview)
  
  if (validTracks.length < 4) {
    // Fallback para perguntas estáticas
    return getStaticQuestion('guess-song', dificuldade)
  }
  
  const correctTrack = validTracks[Math.floor(Math.random() * validTracks.length)]
  const wrongOptions = validTracks
    .filter(t => t.id !== correctTrack.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  
  const options = [
    { texto: correctTrack.title, correta: true },
    ...wrongOptions.map(t => ({ texto: t.title, correta: false }))
  ].sort(() => Math.random() - 0.5)
  
  return {
    modo: 'guess-song',
    dificuldade,
    musica: {
      titulo: correctTrack.title,
      artista: correctTrack.artist?.name,
      album: correctTrack.album?.title,
      ano: correctTrack.album?.release_date?.split('-')[0],
      capa: correctTrack.album?.cover_medium,
      previewUrl: correctTrack.preview,
      deezerId: correctTrack.id
    },
    opcoes: options,
    respostaCorreta: options.findIndex(o => o.correta)
  }
}

const gerarPerguntaGuessArtist = async (dificuldade) => {
  const queries = ['popular artist', 'famous singer', 'top artist']
  const query = queries[Math.floor(Math.random() * queries.length)]
  
  const tracks = await buscarMusicasDeezer(query, 50)
  const validTracks = tracks.filter(t => t.preview)
  
  if (validTracks.length < 4) {
    return getStaticQuestion('guess-artist', dificuldade)
  }
  
  const correctTrack = validTracks[Math.floor(Math.random() * validTracks.length)]
  const wrongOptions = validTracks
    .filter(t => t.artist?.id !== correctTrack.artist?.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
  
  const options = [
    { texto: correctTrack.artist?.name, correta: true },
    ...wrongOptions.map(t => ({ texto: t.artist?.name, correta: false }))
  ].sort(() => Math.random() - 0.5)
  
  return {
    modo: 'guess-artist',
    dificuldade,
    musica: {
      titulo: correctTrack.title,
      artista: correctTrack.artist?.name,
      album: correctTrack.album?.title,
      capa: correctTrack.album?.cover_medium,
      previewUrl: dificuldade !== 'hard' ? correctTrack.preview : null, // Sem preview no hard
      artistaImagem: correctTrack.artist?.picture_medium,
      deezerId: correctTrack.id
    },
    opcoes: options,
    respostaCorreta: options.findIndex(o => o.correta)
  }
}

const gerarPerguntaCompleteLyric = async (dificuldade) => {
  const queries = ['hit song', 'famous lyrics', 'popular music']
  const query = queries[Math.floor(Math.random() * queries.length)]
  
  const tracks = await buscarMusicasDeezer(query, 30)
  const validTracks = tracks.filter(t => t.title.split(' ').length >= 2)
  
  if (validTracks.length === 0) {
    return getStaticQuestion('complete-lyric', dificuldade)
  }
  
  const track = validTracks[Math.floor(Math.random() * validTracks.length)]
  const words = track.title.split(' ')
  
  // Mascara palavras baseado na dificuldade
  const maskCount = dificuldade === 'easy' ? 1 : dificuldade === 'medium' ? Math.ceil(words.length / 2) : words.length - 1
  
  const tituloMascarado = words.map((word, idx) => ({
    texto: word,
    oculto: idx >= words.length - maskCount
  }))
  
  // Gera opções com títulos similares
  const wrongTitles = validTracks
    .filter(t => t.id !== track.id)
    .slice(0, 3)
    .map(t => t.title)
  
  const options = [
    { texto: track.title, correta: true },
    ...wrongTitles.map(t => ({ texto: t, correta: false }))
  ].sort(() => Math.random() - 0.5)
  
  return {
    modo: 'complete-lyric',
    dificuldade,
    musica: {
      titulo: track.title,
      artista: track.artist?.name,
      previewUrl: track.preview,
      capa: track.album?.cover_medium,
      deezerId: track.id
    },
    tituloMascarado,
    opcoes: options,
    respostaCorreta: options.findIndex(o => o.correta)
  }
}

const gerarPerguntaTrivia = async (dificuldade) => {
  // Perguntas de trivia estáticas (podem ser expandidas)
  const perguntas = getTriviaQuestions(dificuldade)
  const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)]
  
  return {
    modo: 'music-trivia',
    dificuldade,
    ...pergunta
  }
}

// Perguntas estáticas de fallback
const getStaticQuestion = (modo, dificuldade) => {
  const staticQuestions = {
    'guess-song': {
      modo: 'guess-song',
      dificuldade,
      musica: {
        titulo: 'Shape of You',
        artista: 'Ed Sheeran',
        previewUrl: null,
        capa: 'https://e-cdns-images.dzcdn.net/images/cover/...'
      },
      opcoes: [
        { texto: 'Shape of You', correta: true },
        { texto: 'Perfect', correta: false },
        { texto: 'Photograph', correta: false },
        { texto: 'Thinking Out Loud', correta: false }
      ],
      respostaCorreta: 0
    }
    // ... mais perguntas estáticas
  }
  
  return staticQuestions[modo] || staticQuestions['guess-song']
}

const getTriviaQuestions = (dificuldade) => {
  const questions = {
    easy: [
      {
        pergunta: 'Qual artista é conhecido como "Rei do Pop"?',
        categoria: 'História Musical',
        corCategoria: 'linear-gradient(135deg, #667eea, #764ba2)',
        iconCategoria: '👑',
        opcoes: [
          { texto: 'Michael Jackson', correta: true },
          { texto: 'Elvis Presley', correta: false },
          { texto: 'Prince', correta: false },
          { texto: 'Madonna', correta: false }
        ],
        respostaCorreta: 0
      },
      {
        pergunta: 'Qual instrumento tem 88 teclas?',
        categoria: 'Instrumentos',
        corCategoria: 'linear-gradient(135deg, #f093fb, #f5576c)',
        iconCategoria: '🎹',
        opcoes: [
          { texto: 'Violão', correta: false },
          { texto: 'Piano', correta: true },
          { texto: 'Flauta', correta: false },
          { texto: 'Bateria', correta: false }
        ],
        respostaCorreta: 1
      }
    ],
    medium: [
      {
        pergunta: 'Em que ano foi lançado o álbum "Thriller"?',
        categoria: 'Álbuns Clássicos',
        corCategoria: 'linear-gradient(135deg, #4facfe, #00f2fe)',
        iconCategoria: '💿',
        opcoes: [
          { texto: '1980', correta: false },
          { texto: '1982', correta: true },
          { texto: '1984', correta: false },
          { texto: '1986', correta: false }
        ],
        respostaCorreta: 1
      }
    ],
    hard: [
      {
        pergunta: 'Qual foi o primeiro vídeo musical exibido na MTV?',
        categoria: 'Curiosidades',
        corCategoria: 'linear-gradient(135deg, #43e97b, #38f9d7)',
        iconCategoria: '📺',
        opcoes: [
          { texto: 'Video Killed the Radio Star', correta: true },
          { texto: 'Bohemian Rhapsody', correta: false },
          { texto: 'Billie Jean', correta: false },
          { texto: 'Like a Virgin', correta: false }
        ],
        respostaCorreta: 0
      }
    ]
  }
  
  return questions[dificuldade] || questions.easy
}

// ============================================
// 🎮 INICIAR SESSÃO DE JOGO
// ============================================

const iniciarSessao = async (userId, modo, dificuldade) => {
  const stats = await getOrCreateUserStats(userId)
  
  // Verifica se dificuldade está bloqueada
  if (dificuldade !== 'easy' && stats.progresso[modo][dificuldade].bloqueado) {
    throw new Error('Dificuldade bloqueada. Complete o nível anterior primeiro.')
  }
  
  const session = new GameSession({
    usuario: userId,
    modo,
    dificuldade,
    totalPerguntas: 10
  })
  
  await session.save()
  
  // Gera primeira pergunta
  const pergunta = await gerarPergunta(modo, dificuldade)
  
  return {
    sessionId: session._id,
    pergunta,
    config: {
      tempoLimite: DIFICULTIES[dificuldade].tempo,
      totalPerguntas: 10,
      perguntaAtual: 1
    }
  }
}

const gerarPergunta = async (modo, dificuldade) => {
  switch (modo) {
    case 'guess-song':
      return gerarPerguntaGuessSong(dificuldade)
    case 'guess-artist':
      return gerarPerguntaGuessArtist(dificuldade)
    case 'complete-lyric':
      return gerarPerguntaCompleteLyric(dificuldade)
    case 'music-trivia':
      return gerarPerguntaTrivia(dificuldade)
    default:
      throw new Error('Modo de jogo inválido')
  }
}

// ============================================
// ✅ RESPONDER PERGUNTA
// ============================================

const responderPergunta = async (sessionId, respostaIndex, tempoResposta) => {
  const session = await GameSession.findById(sessionId)
  if (!session) throw new Error('Sessão não encontrada')
  if (session.completada) throw new Error('Sessão já finalizada')
  
  const perguntaAtual = await gerarPergunta(session.modo, session.dificuldade)
  const acertou = respostaIndex === perguntaAtual.respostaCorreta
  
  const diffConfig = DIFICULTIES[session.dificuldade]
  const pontosBase = 100
  const bonusTempo = Math.max(0, diffConfig.tempo - tempoResposta) * 5
  const pontosGanhos = acertou ? Math.floor((pontosBase + bonusTempo) * diffConfig.multiplicador) : 0
  const moedasGanhas = acertou ? Math.floor(10 * diffConfig.multiplicador) : 0
  
  session.pontuacao += pontosGanhos
  session.moedasGanhas += moedasGanhas
  session.acertos += acertou ? 1 : 0
  session.erros += acertou ? 0 : 1
  session.perguntasRespondidas += 1
  session.tempoTotal += tempoResposta
  
  // Verifica se completou
  if (session.perguntasRespondidas >= session.totalPerguntas) {
    return await finalizarSessao(session)
  }
  
  await session.save()
  
  // Próxima pergunta
  const proximaPergunta = await gerarPergunta(session.modo, session.dificuldade)
  
  return {
    acertou,
    pontosGanhos,
    moedasGanhas,
    pontuacaoTotal: session.pontuacao,
    progresso: `${session.perguntasRespondidas}/${session.totalPerguntas}`,
    proximaPergunta,
    config: {
      tempoLimite: diffConfig.tempo,
      perguntaAtual: session.perguntasRespondidas + 1
    }
  }
}

// ============================================
// 🏁 FINALIZAR SESSÃO
// ============================================

const finalizarSessao = async (session) => {
  session.completada = true
  session.dataFim = new Date()
  
  const stats = await getOrCreateUserStats(session.usuario)
  const diffConfig = DIFICULTIES[session.dificuldade]
  
  // Atualiza estatísticas
  stats.estatisticas.totalPartidas += 1
  stats.estatisticas.totalPontos += session.pontuacao
  stats.estatisticas.totalMoedas += session.moedasGanhas
  stats.estatisticas.totalAcertos += session.acertos
  stats.estatisticas.totalErros += session.erros
  
  const precisao = Math.round((session.acertos / session.totalPerguntas) * 100)
  const precisaoAnterior = stats.estatisticas.precisaoMedia
  stats.estatisticas.precisaoMedia = Math.round(
    (precisaoAnterior * (stats.estatisticas.totalPartidas - 1) + precisao) / stats.estatisticas.totalPartidas
  )
  
  // Verifica sequência
  if (session.acertos === session.totalPerguntas) {
    stats.estatisticas.sequenciaVitorias += 1
    if (stats.estatisticas.sequenciaVitorias > stats.estatisticas.maiorSequencia) {
      stats.estatisticas.maiorSequencia = stats.estatisticas.sequenciaVitorias
    }
  } else {
    stats.estatisticas.sequenciaVitorias = 0
  }
  
  // Atualiza progresso do modo
  const progressoModo = stats.progresso[session.modo][session.dificuldade]
  if (session.pontuacao > progressoModo.melhorPontuacao) {
    progressoModo.melhorPontuacao = session.pontuacao
  }
  
  // Desbloqueia próxima dificuldade se completou com 70%+
  if (precisao >= 70) {
    progressoModo.completado = true
    
    const dificuldades = ['easy', 'medium', 'hard']
    const idxAtual = dificuldades.indexOf(session.dificuldade)
    if (idxAtual < dificuldades.length - 1) {
      const proximaDiff = dificuldades[idxAtual + 1]
      stats.progresso[session.modo][proximaDiff].bloqueado = false
      session.nivelDesbloqueado = proximaDiff
    }
  }
  
  // XP e nível
  const xpGanho = Math.floor(session.pontuacao / 10)
  const nivelResult = stats.adicionarXP(xpGanho)
  
  // Verifica conquistas
  const conquistasDesbloqueadas = []
  
  if (stats.estatisticas.totalPartidas === 1) {
    const conquista = stats.conquistas.find(c => c.id === 'first_win')
    if (conquista && !conquista.desbloqueada) {
      conquista.desbloqueada = true
      conquista.dataDesbloqueio = new Date()
      conquistasDesbloqueadas.push(conquista)
    }
  }
  
  if (session.acertos === session.totalPerguntas) {
    const conquista = stats.conquistas.find(c => c.id === 'perfect_game')
    if (conquista && !conquista.desbloqueada) {
      conquista.desbloqueada = true
      conquista.dataDesbloqueio = new Date()
      conquistasDesbloqueadas.push(conquista)
    }
  }
  
  await stats.save()
  await session.save()
  
  return {
    completado: true,
    pontuacao: session.pontuacao,
    moedasGanhas: session.moedasGanhas,
    acertos: session.acertos,
    erros: session.erros,
    precisao,
    nivelDesbloqueado: session.nivelDesbloqueado,
    subiuNivel: nivelResult.subiuNivel,
    nivel: nivelResult.nivel,
    xp: nivelResult.xp,
    xpProximo: nivelResult.xpProximo,
    conquistasDesbloqueadas,
    melhorPontuacao: progressoModo.melhorPontuacao
  }
}

// ============================================
// 📊 LEADERBOARD
// ============================================

const getLeaderboard = async (periodo = 'semana', limite = 50) => {
  const dataCorte = new Date()
  
  if (periodo === 'semana') {
    dataCorte.setDate(dataCorte.getDate() - 7)
  } else if (periodo === 'mes') {
    dataCorte.setMonth(dataCorte.getMonth() - 1)
  } else if (periodo === 'dia') {
    dataCorte.setDate(dataCorte.getDate() - 1)
  }
  
  const sessions = await GameSession.find({
    completada: true,
    dataFim: { $gte: dataCorte }
  })
    .sort({ pontuacao: -1 })
    .limit(limite)
    .populate('usuario', 'nome username avatar')
    .lean()
  
  return sessions.map((s, idx) => ({
    posicao: idx + 1,
    usuario: {
      id: s.usuario?._id,
      nome: s.usuario?.nome || 'Anônimo',
      avatar: s.usuario?.avatar
    },
    pontuacao: s.pontuacao,
    modo: s.modo,
    dificuldade: s.dificuldade,
    precisao: Math.round((s.acertos / s.totalPerguntas) * 100),
    data: s.dataFim
  }))
}

// ============================================
// 🎁 RECOMPENSAS DIÁRIAS
// ============================================

const RECOMPENSAS_DIARIAS = [
  { dia: 1, moedas: 50, icon: '🎁' },
  { dia: 2, moedas: 100, icon: '💰' },
  { dia: 3, moedas: 150, icon: '💎' },
  { dia: 4, moedas: 200, icon: '🔥' },
  { dia: 5, moedas: 300, icon: '⭐' },
  { dia: 6, moedas: 500, icon: '👑' },
  { dia: 7, moedas: 1000, icon: '🏆' }
]

const getDailyRewards = async (userId) => {
  const stats = await getOrCreateUserStats(userId)
  const recompensas = stats.recompensasDiarias
  
  const agora = new Date()
  const ultima = recompensas.ultimaReivindicacao
  const podeReivindicar = !ultima || (agora - new Date(ultima)) >= 24 * 60 * 60 * 1000
  
  // Reset se perdeu um dia
  if (ultima && (agora - new Date(ultima)) >= 48 * 60 * 60 * 1000) {
    recompensas.diaAtual = 0
    recompensas.historico = []
  }
  
  const dias = RECOMPENSAS_DIARIAS.map(r => ({
    ...r,
    reivindicado: recompensas.historico.some(h => h.dia === r.dia && h.reivindicado),
    disponivel: podeReivindicar && r.dia === (recompensas.diaAtual % 7) + 1
  }))
  
  return {
    dias,
    podeReivindicar,
    proximaReivindicacao: ultima ? new Date(new Date(ultima).getTime() + 24 * 60 * 60 * 1000) : null,
    diaAtual: recompensas.diaAtual
  }
}

const claimDailyReward = async (userId, dia) => {
  const stats = await getOrCreateUserStats(userId)
  const recompensas = stats.recompensasDiarias
  
  const agora = new Date()
  const ultima = recompensas.ultimaReivindicacao
  
  if (ultima && (agora - new Date(ultima)) < 24 * 60 * 60 * 1000) {
    throw new Error('Recompensa já reivindicada hoje')
  }
  
  const recompensa = RECOMPENSAS_DIARIAS.find(r => r.dia === dia)
  if (!recompensa) throw new Error('Recompensa inválida')
  
  if (dia !== (recompensas.diaAtual % 7) + 1) {
    throw new Error('Dia incorreto')
  }
  
  stats.estatisticas.totalMoedas += recompensa.moedas
  recompensas.ultimaReivindicacao = agora
  recompensas.diaAtual += 1
  recompensas.historico.push({ dia, reivindicado: true, data: agora })
  
  await stats.save()
  
  return {
    moedasGanhas: recompensa.moedas,
    moedasTotais: stats.estatisticas.totalMoedas,
    proximoDia: (recompensas.diaAtual % 7) + 1
  }
}

// ============================================
// 🛒 LOJA
// ============================================

const LOJA_ITENS = [
  { id: 'avatar_gold', nome: 'Avatar Dourado', descricao: 'Avatar especial dourado', icon: '👤', preco: 500 },
  { id: 'theme_dark', nome: 'Tema Noturno', descricao: 'Tema escuro exclusivo', icon: '🌙', preco: 300 },
  { id: 'badge_pro', nome: 'Badge Pro', descricao: 'Badge de jogador pro', icon: '💎', preco: 1000 },
  { id: 'vinyl_rare', nome: 'Vinil Raro', descricao: 'Vinil decorativo raro', icon: '💿', preco: 750 },
  { id: 'emoji_set', nome: 'Pack de Emojis', descricao: 'Emojis musicais exclusivos', icon: '🎭', preco: 200 }
]

const getShopItems = async (userId) => {
  const stats = await getOrCreateUserStats(userId)
  const inventario = stats.inventario.map(i => i.itemId)
  
  return LOJA_ITENS.map(item => ({
    ...item,
    possuido: inventario.includes(item.id),
    podeComprar: stats.estatisticas.totalMoedas >= item.preco && !inventario.includes(item.id)
  }))
}

const buyItem = async (userId, itemId) => {
  const stats = await getOrCreateUserStats(userId)
  const item = LOJA_ITENS.find(i => i.id === itemId)
  
  if (!item) throw new Error('Item não encontrado')
  if (stats.inventario.some(i => i.itemId === itemId)) throw new Error('Item já possuído')
  if (stats.estatisticas.totalMoedas < item.preco) throw new Error('Moedas insuficientes')
  
  stats.estatisticas.totalMoedas -= item.preco
  stats.inventario.push({
    itemId: item.id,
    nome: item.nome,
    icon: item.icon,
    comprado: true,
    dataCompra: new Date()
  })
  
  // Verifica conquista de colecionador
  const conquista = stats.conquistas.find(c => c.id === 'collector')
  if (conquista && !conquista.desbloqueada && stats.inventario.length >= 3) {
    conquista.desbloqueada = true
    conquista.dataDesbloqueio = new Date()
  }
  
  await stats.save()
  
  return {
    item,
    moedasRestantes: stats.estatisticas.totalMoedas,
    inventario: stats.inventario
  }
}

// ============================================
// 🏆 CONQUISTAS
// ============================================

const getAchievements = async (userId) => {
  const stats = await getOrCreateUserStats(userId)
  return stats.conquistas
}

const claimAchievement = async (userId, conquistaId) => {
  const stats = await getOrCreateUserStats(userId)
  const conquista = stats.conquistas.find(c => c.id === conquistaId)
  
  if (!conquista) throw new Error('Conquista não encontrada')
  if (!conquista.desbloqueada) throw new Error('Conquista não desbloqueada')
  if (conquista.resgatada) throw new Error('Conquista já resgatada')
  
  conquista.resgatada = true
  stats.estatisticas.totalMoedas += conquista.moedas
  
  await stats.save()
  
  return {
    conquista,
    moedasGanhas: conquista.moedas,
    moedasTotais: stats.estatisticas.totalMoedas
  }
}

// ============================================
// 📈 STATS DO USUÁRIO
// ============================================

const getUserGameStats = async (userId) => {
  const stats = await getOrCreateUserStats(userId)
  
  return {
    nivel: stats.nivel,
    estatisticas: stats.estatisticas,
    progresso: stats.progresso,
    inventario: stats.inventario,
    conquistas: stats.conquistas.map(c => ({
      ...c.toObject(),
      claimable: c.desbloqueada && !c.resgatada
    }))
  }
}

// ============================================
// 🎵 ATIVIDADES AO VIVO (SIMULADO)
// ============================================

const getLiveActivities = async (limite = 10) => {
  // Busca sessões recentes para simular atividades
  const sessions = await GameSession.find({
    completada: true,
    dataFim: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // últimos 5 min
  })
    .populate('usuario', 'nome avatar')
    .sort({ dataFim: -1 })
    .limit(limite)
    .lean()
  
  const atividades = sessions.map(s => ({
    usuario: s.usuario?.nome || 'Jogador Anônimo',
    avatar: s.usuario?.avatar || `https://i.pravatar.cc/150?u=${s.usuario?._id || Math.random()}`,
    acao: s.acertos === s.totalPerguntas ? 'acertou tudo em' : 'jogou',
    musica: GAME_CONFIG[s.modo].nome,
    pontuacao: s.pontuacao,
    tempo: formatTimeAgo(s.dataFim)
  }))
  
  // Preenche com dados simulados se não tiver suficiente
  while (atividades.length < limite) {
    atividades.push(generateFakeActivity())
  }
  
  return atividades
}

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'agora'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`
  return `${Math.floor(seconds / 3600)}h`
}

const generateFakeActivity = () => {
  const nomes = ['Ana Beatriz', 'Carlos Rock', 'Maria Pop', 'João Metal', 'Funk Master', 'Pop Queen']
  const musicas = ['Adivinhe a Música', 'Adivinhe o Artista', 'Complete a Música', 'Quiz Musical']
  
  return {
    usuario: nomes[Math.floor(Math.random() * nomes.length)],
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    acao: Math.random() > 0.5 ? 'acertou tudo em' : 'jogou',
    musica: musicas[Math.floor(Math.random() * musicas.length)],
    pontuacao: Math.floor(Math.random() * 10000),
    tempo: `${Math.floor(Math.random() * 5) + 1}min`
  }
}

module.exports = {
  iniciarSessao,
  responderPergunta,
  finalizarSessao,
  getLeaderboard,
  getDailyRewards,
  claimDailyReward,
  getShopItems,
  buyItem,
  getAchievements,
  claimAchievement,
  getUserGameStats,
  getLiveActivities,
  GAME_CONFIG,
  DIFICULTIES
}