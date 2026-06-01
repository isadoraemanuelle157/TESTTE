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
  { id: 'first_win', titulo: 'Primeira Vitória', descricao: 'Complete seu primeiro jogo', iconClass: 'fa-solid fa-trophy', moedas: 50 },
  { id: 'streak_3', titulo: 'Sequência de Fogo', descricao: 'Acerte 3 perguntas seguidas', iconClass: 'fa-solid fa-fire', moedas: 100 },
  { id: 'streak_5', titulo: 'Imparável', descricao: 'Acerte 5 perguntas seguidas', iconClass: 'fa-solid fa-bolt', moedas: 200 },
  { id: 'perfect_game', titulo: 'Perfeição', descricao: 'Acerte todas as perguntas', iconClass: 'fa-solid fa-gem', moedas: 500 },
  { id: 'collector', titulo: 'Colecionador', descricao: 'Compre 3 itens na loja', iconClass: 'fa-solid fa-bag-shopping', moedas: 150 },
  { id: 'daily_7', titulo: 'Dedicado', descricao: 'Resgate recompensas por 7 dias', iconClass: 'fa-solid fa-calendar-check', moedas: 300 }
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

// ============================================
// 🎲 GERAR PERGUNTAS COMPLETE A MÚSICA (MELHORADO)
// ============================================

const LYRIC_POOL = {
  easy: [
    { titulo: "Let It Be", artista: "The Beatles", album: "Let It Be", ano: 1970, capa: "https://e-cdns-images.dzcdn.net/images/cover/1u1u1u1u1u1u1u1u1u1u1u1u1u1u1u1u/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-1.dzcdn.net/stream/c-1u1u1u1u1u1u1u1u1u1u1u1u1u1u1u1u-1.mp3" },
    { titulo: "Hey Jude", artista: "The Beatles", album: "Hey Jude", ano: 1968, capa: "https://e-cdns-images.dzcdn.net/images/cover/2v2v2v2v2v2v2v2v2v2v2v2v2v2v2v2v/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-2.dzcdn.net/stream/c-2v2v2v2v2v2v2v2v2v2v2v2v2v2v2v2v-2.mp3" },
    { titulo: "Imagine", artista: "John Lennon", album: "Imagine", ano: 1971, capa: "https://e-cdns-images.dzcdn.net/images/cover/6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-6.dzcdn.net/stream/c-6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z-3.mp3" },
    { titulo: "Billie Jean", artista: "Michael Jackson", album: "Thriller", ano: 1983, capa: "https://e-cdns-images.dzcdn.net/images/cover/7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-7.dzcdn.net/stream/c-7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a-1.mp3" },
    { titulo: "Like a Prayer", artista: "Madonna", album: "Like a Prayer", ano: 1989, capa: "https://e-cdns-images.dzcdn.net/images/cover/8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-8.dzcdn.net/stream/c-8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b-2.mp3" },
    { titulo: "Wonderwall", artista: "Oasis", album: "(What's the Story) Morning Glory?", ano: 1995, capa: "https://e-cdns-images.dzcdn.net/images/cover/0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-0.dzcdn.net/stream/c-0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d-1.mp3" },
    { titulo: "Smells Like Teen Spirit", artista: "Nirvana", album: "Nevermind", ano: 1991, capa: "https://e-cdns-images.dzcdn.net/images/cover/9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-9.dzcdn.net/stream/c-9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c-3.mp3" },
    { titulo: "Hotel California", artista: "Eagles", album: "Hotel California", ano: 1976, capa: "https://e-cdns-images.dzcdn.net/images/cover/4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-4.dzcdn.net/stream/c-4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x-1.mp3" },
    { titulo: "Sweet Child O' Mine", artista: "Guns N' Roses", album: "Appetite for Destruction", ano: 1987, capa: "https://e-cdns-images.dzcdn.net/images/cover/5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-5.dzcdn.net/stream/c-5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y-2.mp3" },
    { titulo: "Bohemian Rhapsody", artista: "Queen", album: "A Night at the Opera", ano: 1975, capa: "https://e-cdns-images.dzcdn.net/images/cover/3w3w3w3w3w3w3w3w3w3w3w3w3w3w3w3w/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-3.dzcdn.net/stream/c-3w3w3w3w3w3w3w3w3w3w3w3w3w3w3w3w-3.mp3" }
  ],
  medium: [
    { titulo: "Stairway to Heaven", artista: "Led Zeppelin", album: "Led Zeppelin IV", ano: 1971, capa: "https://e-cdns-images.dzcdn.net/images/cover/11/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-11.dzcdn.net/stream/c-11-1.mp3" },
    { titulo: "Comfortably Numb", artista: "Pink Floyd", album: "The Wall", ano: 1979, capa: "https://e-cdns-images.dzcdn.net/images/cover/22/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-22.dzcdn.net/stream/c-22-2.mp3" },
    { titulo: "Black Dog", artista: "Led Zeppelin", album: "Led Zeppelin IV", ano: 1971, capa: "https://e-cdns-images.dzcdn.net/images/cover/33/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-33.dzcdn.net/stream/c-33-3.mp3" },
    { titulo: "Wish You Were Here", artista: "Pink Floyd", album: "Wish You Were Here", ano: 1975, capa: "https://e-cdns-images.dzcdn.net/images/cover/44/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-44.dzcdn.net/stream/c-44-1.mp3" },
    { titulo: "Paint It Black", artista: "The Rolling Stones", album: "Aftermath", ano: 1966, capa: "https://e-cdns-images.dzcdn.net/images/cover/55/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-55.dzcdn.net/stream/c-55-2.mp3" },
    { titulo: "Born to Run", artista: "Bruce Springsteen", album: "Born to Run", ano: 1975, capa: "https://e-cdns-images.dzcdn.net/images/cover/66/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-66.dzcdn.net/stream/c-66-3.mp3" },
    { titulo: "London Calling", artista: "The Clash", album: "London Calling", ano: 1979, capa: "https://e-cdns-images.dzcdn.net/images/cover/77/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-77.dzcdn.net/stream/c-77-1.mp3" },
    { titulo: "Anarchy in the UK", artista: "Sex Pistols", album: "Never Mind the Bollocks", ano: 1977, capa: "https://e-cdns-images.dzcdn.net/images/cover/88/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-88.dzcdn.net/stream/c-88-2.mp3" },
    { titulo: "Heart of Glass", artista: "Blondie", album: "Parallel Lines", ano: 1978, capa: "https://e-cdns-images.dzcdn.net/images/cover/99/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-99.dzcdn.net/stream/c-99-3.mp3" },
    { titulo: "Riders on the Storm", artista: "The Doors", album: "L.A. Woman", ano: 1971, capa: "https://e-cdns-images.dzcdn.net/images/cover/aa/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-aa.dzcdn.net/stream/c-aa-1.mp3" }
  ],
  hard: [
    { titulo: "A Day in the Life", artista: "The Beatles", album: "Sgt. Pepper's", ano: 1967, capa: "https://e-cdns-images.dzcdn.net/images/cover/bb/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-bb.dzcdn.net/stream/c-bb-2.mp3" },
    { titulo: "Sympathy for the Devil", artista: "The Rolling Stones", album: "Beggars Banquet", ano: 1968, capa: "https://e-cdns-images.dzcdn.net/images/cover/cc/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-cc.dzcdn.net/stream/c-cc-3.mp3" },
    { titulo: "The Sound of Silence", artista: "Simon & Garfunkel", album: "Sounds of Silence", ano: 1966, capa: "https://e-cdns-images.dzcdn.net/images/cover/dd/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-dd.dzcdn.net/stream/c-dd-1.mp3" },
    { titulo: "House of the Rising Sun", artista: "The Animals", album: "The Animals", ano: 1964, capa: "https://e-cdns-images.dzcdn.net/images/cover/ee/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-ee.dzcdn.net/stream/c-ee-2.mp3" },
    { titulo: "Gimme Shelter", artista: "The Rolling Stones", album: "Let It Bleed", ano: 1969, capa: "https://e-cdns-images.dzcdn.net/images/cover/ff/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-ff.dzcdn.net/stream/c-ff-3.mp3" },
    { titulo: "Fortunate Son", artista: "Creedence Clearwater Revival", album: "Willy and the Poor Boys", ano: 1969, capa: "https://e-cdns-images.dzcdn.net/images/cover/gg/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-gg.dzcdn.net/stream/c-gg-1.mp3" },
    { titulo: "Whole Lotta Love", artista: "Led Zeppelin", album: "Led Zeppelin II", ano: 1969, capa: "https://e-cdns-images.dzcdn.net/images/cover/hh/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-hh.dzcdn.net/stream/c-hh-2.mp3" },
    { titulo: "While My Guitar Gently Weeps", artista: "The Beatles", album: "The White Album", ano: 1968, capa: "https://e-cdns-images.dzcdn.net/images/cover/ii/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-ii.dzcdn.net/stream/c-ii-3.mp3" },
    { titulo: "All Along the Watchtower", artista: "Jimi Hendrix", album: "Electric Ladyland", ano: 1968, capa: "https://e-cdns-images.dzcdn.net/images/cover/jj/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-jj.dzcdn.net/stream/c-jj-1.mp3" },
    { titulo: "Light My Fire", artista: "The Doors", album: "The Doors", ano: 1967, capa: "https://e-cdns-images.dzcdn.net/images/cover/kk/250x250-000000-80-0-0.jpg", preview: "https://cdns-preview-kk.dzcdn.net/stream/c-kk-2.mp3" }
  ]
};

const usedLyricQuestions = new Map();

const getUsedLyricQuestions = (sessionId) => {
  if (!sessionId || sessionId.toString().startsWith('demo-')) return new Set();
  const cached = usedLyricQuestions.get(sessionId);
  return cached ? cached.questions : new Set();
};

const markLyricQuestionUsed = (sessionId, questionId) => {
  if (!sessionId || sessionId.toString().startsWith('demo-')) return;
  const existing = usedLyricQuestions.get(sessionId);
  if (existing) {
    existing.questions.add(questionId);
  } else {
    usedLyricQuestions.set(sessionId, {
      questions: new Set([questionId]),
      timestamp: Date.now()
    });
  }
};

const gerarOpcoesEnganosas = (tituloCorreto, dificuldade) => {
  const pool = LYRIC_POOL[dificuldade] || LYRIC_POOL.easy;
  const outrosTitulos = pool
    .filter(t => t.titulo !== tituloCorreto)
    .map(t => t.titulo)
    .sort(() => Math.random() - 0.5);
  const selecionados = outrosTitulos.slice(0, 3);
  while (selecionados.length < 3) {
    const base = outrosTitulos[Math.floor(Math.random() * outrosTitulos.length)] || tituloCorreto;
    const variacoes = [
      base + " (Live)",
      "The " + base,
      base.replace(/\s/g, ""),
      base.split(" ").reverse().join(" ")
    ];
    const nova = variacoes[Math.floor(Math.random() * variacoes.length)];
    if (nova !== tituloCorreto && !selecionados.includes(nova)) {
      selecionados.push(nova);
    }
  }
  return selecionados;
};

const gerarPerguntaCompleteLyric = async (dificuldade, sessionId = null) => {
  const pool = LYRIC_POOL[dificuldade] || LYRIC_POOL.easy;
  const usedQuestions = getUsedLyricQuestions(sessionId);
  let available = pool.filter(q => !usedQuestions.has(q.titulo));
  if (available.length === 0) {
    available = pool;
    if (sessionId) usedLyricQuestions.delete(sessionId);
  }
  const track = available[Math.floor(Math.random() * available.length)];
  markLyricQuestionUsed(sessionId, track.titulo);
  const words = track.titulo.split(' ');
  let maskCount;
  if (dificuldade === 'easy') {
    maskCount = Math.max(1, Math.floor(words.length * 0.3));
  } else if (dificuldade === 'medium') {
    maskCount = Math.max(1, Math.floor(words.length * 0.6));
  } else {
    maskCount = Math.max(1, words.length - 1);
  }
  const indicesToMask = [];
  const allIndices = words.map((_, i) => i).sort(() => Math.random() - 0.5);
  for (let i = 0; i < maskCount && i < allIndices.length; i++) {
    indicesToMask.push(allIndices[i]);
  }
  const tituloMascarado = words.map((word, idx) => ({
    texto: word,
    oculto: indicesToMask.includes(idx)
  }));
  const wrongTitles = gerarOpcoesEnganosas(track.titulo, dificuldade);
  const options = [
    { texto: track.titulo, correta: true },
    ...wrongTitles.map(t => ({ texto: t, correta: false }))
  ].sort(() => Math.random() - 0.5);
  return {
    modo: 'complete-lyric',
    dificuldade,
    musica: {
      titulo: track.titulo,
      artista: track.artista,
      album: track.album,
      previewUrl: track.preview,
      capa: track.capa,
      ano: track.ano,
      deezerId: null
    },
    tituloMascarado,
    opcoes: options,
    respostaCorreta: options.findIndex(o => o.correta)
  };
};

// ============================================
// 🎲 GERAR PERGUNTAS DINÂMICAS (CORRIGIDO)
// ============================================

// Cache de perguntas usadas por sessão (em memória - para produção use Redis)
const usedQuestionsCache = new Map();

// Limpa cache antigo a cada 1 hora
setInterval(() => {
  const oneHourAgo = Date.now() - 3600000;
  for (const [key, value] of usedQuestionsCache.entries()) {
    if (value.timestamp < oneHourAgo) {
      usedQuestionsCache.delete(key);
    }
  }
}, 3600000);

const getUsedQuestions = (sessionId) => {
  if (!sessionId || sessionId.toString().startsWith('demo-')) return new Set();
  const cached = usedQuestionsCache.get(sessionId);
  return cached ? cached.questions : new Set();
};

const markQuestionUsed = (sessionId, questionId) => {
  if (!sessionId || sessionId.toString().startsWith('demo-')) return;
  const existing = usedQuestionsCache.get(sessionId);
  if (existing) {
    existing.questions.add(questionId);
  } else {
    usedQuestionsCache.set(sessionId, {
      questions: new Set([questionId]),
      timestamp: Date.now()
    });
  }
};

// PERGUNTAS DE TRIVIA EXPANDIDAS E ÚNICAS
const TRIVIA_POOL = {
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
      respostaCorreta: 0,
      id: 'trivia_easy_1'
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
      respostaCorreta: 1,
      id: 'trivia_easy_2'
    },
    {
      pergunta: 'Qual banda britânica é famosa pela música "Bohemian Rhapsody"?',
      categoria: 'Rock Clássico',
      corCategoria: 'linear-gradient(135deg, #e74c3c, #c0392b)',
      iconCategoria: '🎸',
      opcoes: [
        { texto: 'The Beatles', correta: false },
        { texto: 'Led Zeppelin', correta: false },
        { texto: 'Queen', correta: true },
        { texto: 'Pink Floyd', correta: false }
      ],
      respostaCorreta: 2,
      id: 'trivia_easy_3'
    },
    {
      pergunta: 'Quem cantou "Shape of You"?',
      categoria: 'Pop',
      corCategoria: 'linear-gradient(135deg, #3498db, #2980b9)',
      iconCategoria: '🎤',
      opcoes: [
        { texto: 'Justin Bieber', correta: false },
        { texto: 'Ed Sheeran', correta: true },
        { texto: 'Shawn Mendes', correta: false },
        { texto: 'Bruno Mars', correta: false }
      ],
      respostaCorreta: 1,
      id: 'trivia_easy_4'
    },
    {
      pergunta: 'Qual é o nome do álbum mais vendido de todos os tempos?',
      categoria: 'Recordes',
      corCategoria: 'linear-gradient(135deg, #f39c12, #e67e22)',
      iconCategoria: '🏆',
      opcoes: [
        { texto: 'Back in Black', correta: false },
        { texto: 'Thriller', correta: true },
        { texto: 'The Dark Side of the Moon', correta: false },
        { texto: 'Rumours', correta: false }
      ],
      respostaCorreta: 1,
      id: 'trivia_easy_5'
    },
    {
      pergunta: 'Qual artista feminina é conhecida como "Rainha do Pop"?',
      categoria: 'Pop',
      corCategoria: 'linear-gradient(135deg, #e91e63, #ad1457)',
      iconCategoria: '👸',
      opcoes: [
        { texto: 'Lady Gaga', correta: false },
        { texto: 'Britney Spears', correta: false },
        { texto: 'Madonna', correta: true },
        { texto: 'Rihanna', correta: false }
      ],
      respostaCorreta: 2,
      id: 'trivia_easy_6'
    },
    {
      pergunta: 'Qual instrumento Jimi Hendrix tocava?',
      categoria: 'Rock',
      corCategoria: 'linear-gradient(135deg, #ff5722, #d84315)',
      iconCategoria: '🎸',
      opcoes: [
        { texto: 'Bateria', correta: false },
        { texto: 'Guitarra', correta: true },
        { texto: 'Baixo', correta: false },
        { texto: 'Teclado', correta: false }
      ],
      respostaCorreta: 1,
      id: 'trivia_easy_7'
    },
    {
      pergunta: 'Qual país de origem da banda ABBA?',
      categoria: 'Mundo',
      corCategoria: 'linear-gradient(135deg, #00bcd4, #0097a7)',
      iconCategoria: '🌍',
      opcoes: [
        { texto: 'Noruega', correta: false },
        { texto: 'Dinamarca', correta: false },
        { texto: 'Suécia', correta: true },
        { texto: 'Finlândia', correta: false }
      ],
      respostaCorreta: 2,
      id: 'trivia_easy_8'
    },
    {
      pergunta: 'Quem compôs "Garota de Ipanema"?',
      categoria: 'MPB',
      corCategoria: 'linear-gradient(135deg, #2ecc71, #27ae60)',
      iconCategoria: '🇧🇷',
      opcoes: [
        { texto: 'Caetano Veloso', correta: false },
        { texto: 'Antônio Carlos Jobim', correta: true },
        { texto: 'Gilberto Gil', correta: false },
        { texto: 'Chico Buarque', correta: false }
      ],
      respostaCorreta: 1,
      id: 'trivia_easy_9'
    },
    {
      pergunta: 'Qual música tem a famosa frase "We Are the Champions"?',
      categoria: 'Rock',
      corCategoria: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
      iconCategoria: '🏆',
      opcoes: [
        { texto: 'Queen', correta: true },
        { texto: 'The Beatles', correta: false },
        { texto: 'Led Zeppelin', correta: false },
        { texto: 'The Rolling Stones', correta: false }
      ],
      respostaCorreta: 0,
      id: 'trivia_easy_10'
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
      respostaCorreta: 1,
      id: 'trivia_medium_1'
    },
    {
      pergunta: 'Qual foi o primeiro videoclipe exibido na MTV?',
      categoria: 'Curiosidades',
      corCategoria: 'linear-gradient(135deg, #43e97b, #38f9d7)',
      iconCategoria: '📺',
      opcoes: [
        { texto: 'Video Killed the Radio Star', correta: true },
        { texto: 'Bohemian Rhapsody', correta: false },
        { texto: 'Billie Jean', correta: false },
        { texto: 'Like a Virgin', correta: false }
      ],
      respostaCorreta: 0,
      id: 'trivia_medium_2'
    },
    {
      pergunta: 'Qual artista tem o recorde de mais Grammys ganhos?',
      categoria: 'Prêmios',
      corCategoria: 'linear-gradient(135deg, #ffd700, #ff8c00)',
      iconCategoria: '🏅',
      opcoes: [
        { texto: 'Beyoncé', correta: true },
        { texto: 'Michael Jackson', correta: false },
        { texto: 'Georg Solti', correta: false },
        { texto: 'Alison Krauss', correta: false }
      ],
      respostaCorreta: 0,
      id: 'trivia_medium_3'
    },
    {
      pergunta: 'Qual música ficou mais tempo em #1 na Billboard Hot 100?',
      categoria: 'Recordes',
      corCategoria: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      iconCategoria: '📈',
      opcoes: [
        { texto: 'Old Town Road', correta: true },
        { texto: 'Despacito', correta: false },
        { texto: 'One Sweet Day', correta: false },
        { texto: 'Uptown Funk', correta: false }
      ],
      respostaCorreta: 0,
      id: 'trivia_medium_4'
    },
    {
      pergunta: 'Qual banda é conhecida como "Os Fab Four"?',
      categoria: 'Rock',
      corCategoria: 'linear-gradient(135deg, #e67e22, #d35400)',
      iconCategoria: '🤘',
      opcoes: [
        { texto: 'The Rolling Stones', correta: false },
        { texto: 'The Beatles', correta: true },
        { texto: 'Led Zeppelin', correta: false },
        { texto: 'Pink Floyd', correta: false }
      ],
      respostaCorreta: 1,
      id: 'trivia_medium_5'
    },
    {
      pergunta: 'Em que ano o cantor Elvis Presley faleceu?',
      categoria: 'História',
      corCategoria: 'linear-gradient(135deg, #795548, #5d4037)',
      iconCategoria: '🕊️',
      opcoes: [
        { texto: '1975', correta: false },
        { texto: '1976', correta: false },
        { texto: '1977', correta: true },
        { texto: '1978', correta: false }
      ],
      respostaCorreta: 2,
      id: 'trivia_medium_6'
    },
    {
      pergunta: 'Qual artista feminina tem mais #1 na Billboard Hot 100?',
      categoria: 'Recordes',
      corCategoria: 'linear-gradient(135deg, #673ab7, #512da8)',
      iconCategoria: '👑',
      opcoes: [
        { texto: 'Madonna', correta: false },
        { texto: 'Rihanna', correta: false },
        { texto: 'Mariah Carey', correta: true },
        { texto: 'Taylor Swift', correta: false }
      ],
      respostaCorreta: 2,
      id: 'trivia_medium_7'
    },
    {
      pergunta: 'Quem compôs a "Nona Sinfonia"?',
      categoria: 'Clássica',
      corCategoria: 'linear-gradient(135deg, #607d8b, #455a64)',
      iconCategoria: '🎼',
      opcoes: [
        { texto: 'Mozart', correta: false },
        { texto: 'Bach', correta: false },
        { texto: 'Beethoven', correta: true },
        { texto: 'Chopin', correta: false }
      ],
      respostaCorreta: 2,
      id: 'trivia_medium_8'
    },
    {
      pergunta: 'Qual foi a primeira música a atingir 1 bilhão de views no YouTube?',
      categoria: 'Internet',
      corCategoria: 'linear-gradient(135deg, #ff0000, #cc0000)',
      iconCategoria: '📱',
      opcoes: [
        { texto: 'Gangnam Style', correta: true },
        { texto: 'Baby', correta: false },
        { texto: 'Despacito', correta: false },
        { texto: 'See You Again', correta: false }
      ],
      respostaCorreta: 0,
      id: 'trivia_medium_9'
    },
    {
      pergunta: 'Em que país acontece o festival Tomorrowland?',
      categoria: 'Festivais',
      corCategoria: 'linear-gradient(135deg, #8bc34a, #689f38)',
      iconCategoria: '🎪',
      opcoes: [
        { texto: 'Holanda', correta: false },
        { texto: 'Bélgica', correta: true },
        { texto: 'Alemanha', correta: false },
        { texto: 'França', correta: false }
      ],
      respostaCorreta: 1,
      id: 'trivia_medium_10'
    }
  ],
  hard: [
    {
      pergunta: 'Qual álbum de Pink Floyd tem uma capa com um prisma?',
      categoria: 'Álbuns',
      corCategoria: 'linear-gradient(135deg, #ff5722, #e64a19)',
      iconCategoria: '💿',
      opcoes: [
        { texto: 'The Wall', correta: false },
        { texto: 'Animals', correta: false },
        { texto: 'The Dark Side of the Moon', correta: true },
        { texto: 'Wish You Were Here', correta: false }
      ],
      respostaCorreta: 2,
      id: 'trivia_hard_1'
    },
    {
      pergunta: 'Quem foi o produtor do álbum "Nevermind" do Nirvana?',
      categoria: 'Produção',
      corCategoria: 'linear-gradient(135deg, #795548, #5d4037)',
      iconCategoria: '🎛️',
      opcoes: [
        { texto: 'Rick Rubin', correta: false },
        { texto: 'Butch Vig', correta: true },
        { texto: 'Brian Eno', correta: false },
        { texto: 'George Martin', correta: false }
      ],
      respostaCorreta: 1,
      id: 'trivia_hard_2'
    },
    {
      pergunta: 'Qual música dos Beatles foi banida pela BBC por supostamente promover drogas?',
      categoria: 'Polêmica',
      corCategoria: 'linear-gradient(135deg, #9e9e9e, #616161)',
      iconCategoria: '🚫',
      opcoes: [
        { texto: 'Lucy in the Sky with Diamonds', correta: true },
        { texto: 'Hey Jude', correta: false },
        { texto: 'Let It Be', correta: false },
        { texto: 'Yesterday', correta: false }
      ],
      respostaCorreta: 0,
      id: 'trivia_hard_3'
    },
    {
      pergunta: 'Qual foi o primeiro álbum de estúdio da Lady Gaga?',
      categoria: 'Pop',
      corCategoria: 'linear-gradient(135deg, #e91e63, #c2185b)',
      iconCategoria: '💿',
      opcoes: [
        { texto: 'Born This Way', correta: false },
        { texto: 'The Fame', correta: true },
        { texto: 'ARTPOP', correta: false },
        { texto: 'Joanne', correta: false }
      ],
      respostaCorreta: 1,
      id: 'trivia_hard_4'
    },
    {
      pergunta: 'Qual guitarrista é conhecido por tocar com os dentes?',
      categoria: 'Rock',
      corCategoria: 'linear-gradient(135deg, #ff9800, #f57c00)',
      iconCategoria: '🎸',
      opcoes: [
        { texto: 'Eric Clapton', correta: false },
        { texto: 'Jimi Hendrix', correta: true },
        { texto: 'Jimmy Page', correta: false },
        { texto: 'Keith Richards', correta: false }
      ],
      respostaCorreta: 1,
      id: 'trivia_hard_5'
    },
    {
      pergunta: 'Qual é o nome real de Elton John?',
      categoria: 'Curiosidades',
      corCategoria: 'linear-gradient(135deg, #3f51b5, #303f9f)',
      iconCategoria: '🎹',
      opcoes: [
        { texto: 'Reginald Dwight', correta: true },
        { texto: 'Richard Starkey', correta: false },
        { texto: 'David Jones', correta: false },
        { texto: 'Steven Morrissey', correta: false }
      ],
      respostaCorreta: 0,
      id: 'trivia_hard_6'
    },
    {
      pergunta: 'Qual banda gravou o álbum "OK Computer"?',
      categoria: 'Alternativo',
      corCategoria: 'linear-gradient(135deg, #009688, #00796b)',
      iconCategoria: '🎧',
      opcoes: [
        { texto: 'Radiohead', correta: true },
        { texto: 'Muse', correta: false },
        { texto: 'Coldplay', correta: false },
        { texto: 'Oasis', correta: false }
      ],
      respostaCorreta: 0,
      id: 'trivia_hard_7'
    },
    {
      pergunta: 'Quem produziu o álbum "Random Access Memories" do Daft Punk?',
      categoria: 'Eletrônica',
      corCategoria: 'linear-gradient(135deg, #cddc39, #afb42b)',
      iconCategoria: '🤖',
      opcoes: [
        { texto: 'David Guetta', correta: false },
        { texto: 'Giorgio Moroder', correta: false },
        { texto: 'Nile Rodgers', correta: false },
        { texto: 'Vários produtores incluindo Nile Rodgers', correta: true }
      ],
      respostaCorreta: 3,
      id: 'trivia_hard_8'
    }
  ]
};

const gerarPerguntaTrivia = async (dificuldade, sessionId = null) => {
  const pool = TRIVIA_POOL[dificuldade] || TRIVIA_POOL.easy;
  const usedQuestions = getUsedQuestions(sessionId);
  
  // Filtra perguntas não usadas nesta sessão
  const available = pool.filter(q => !usedQuestions.has(q.id));
  
  // Se todas foram usadas, reseta o cache para esta sessão
  const questionsToUse = available.length > 0 ? available : pool;
  if (available.length === 0 && sessionId) {
    usedQuestionsCache.delete(sessionId);
  }
  
  const pergunta = questionsToUse[Math.floor(Math.random() * questionsToUse.length)];
  
  // Marca como usada
  if (pergunta.id) {
    markQuestionUsed(sessionId, pergunta.id);
  }
  
  return {
    modo: 'music-trivia',
    dificuldade,
    pergunta: pergunta.pergunta,
    categoria: pergunta.categoria,
    corCategoria: pergunta.corCategoria,
    iconCategoria: pergunta.iconCategoria,
    opcoes: pergunta.opcoes,
    respostaCorreta: pergunta.respostaCorreta
  };
};

// ARTISTAS POPULARES PARA BUSCA NO DEEZER
const POPULAR_ARTISTS = [
  'The Weeknd', 'Taylor Swift', 'Billie Eilish', 'Ed Sheeran', 'Ariana Grande',
  'Drake', 'Bruno Mars', 'Dua Lipa', 'Harry Styles', 'Justin Bieber',
  'Lady Gaga', 'Beyoncé', 'Rihanna', 'Coldplay', 'Imagine Dragons',
  'Post Malone', 'Doja Cat', 'Olivia Rodrigo', 'Shawn Mendes', 'Sam Smith',
  'Adele', 'Elton John', 'Michael Jackson', 'Madonna', 'Queen',
  'The Beatles', 'Led Zeppelin', 'Pink Floyd', 'Nirvana', 'Metallica',
  'Eminem', 'Kanye West', 'Jay-Z', 'Kendrick Lamar', 'Travis Scott',
  'Sia', 'Katy Perry', 'Miley Cyrus', 'Selena Gomez', 'Demi Lovato',
  'Maroon 5', 'OneRepublic', 'Imagine Dragons', 'Twenty One Pilots', 'Panic! At The Disco',
  'Arctic Monkeys', 'The Killers', 'Foo Fighters', 'Green Day', 'Linkin Park'
];

const gerarPerguntaGuessArtist = async (dificuldade) => {
  // Usa artistas populares em vez de busca genérica
  const artistQueries = POPULAR_ARTISTS.sort(() => Math.random() - 0.5).slice(0, 10);
  
  let allTracks = [];
  
  // Busca tracks de artistas populares
  for (const artist of artistQueries) {
    try {
      const tracks = await buscarMusicasDeezer(`artist:"${artist}"`, 5);
      const valid = tracks.filter(t => t.preview && t.artist?.picture_medium);
      allTracks.push(...valid);
    } catch (e) {
      continue;
    }
  }
  
  // Remove duplicatas por artista
  const seenArtists = new Set();
  const uniqueTracks = allTracks.filter(t => {
    const artistId = t.artist?.id;
    if (seenArtists.has(artistId)) return false;
    seenArtists.add(artistId);
    return true;
  });
  
  if (uniqueTracks.length < 4) {
    return getStaticQuestion('guess-artist', dificuldade);
  }
  
  const correctTrack = uniqueTracks[Math.floor(Math.random() * uniqueTracks.length)];
  
  // Gera opções com artistas diferentes
  const wrongOptions = uniqueTracks
    .filter(t => t.artist?.id !== correctTrack.artist?.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  
  const options = [
    { texto: correctTrack.artist?.name, correta: true },
    ...wrongOptions.map(t => ({ texto: t.artist?.name, correta: false }))
  ].sort(() => Math.random() - 0.5);
  
  return {
    modo: 'guess-artist',
    dificuldade,
    musica: {
      titulo: correctTrack.title,
      artista: correctTrack.artist?.name,
      album: correctTrack.album?.title,
      capa: correctTrack.album?.cover_medium,
      previewUrl: dificuldade !== 'hard' ? correctTrack.preview : null,
      artistaImagem: correctTrack.artist?.picture_medium,
      deezerId: correctTrack.id
    },
    opcoes: options,
    respostaCorreta: options.findIndex(o => o.correta)
  };
};

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

const gerarPergunta = async (modo, dificuldade, sessionId = null) => {
  switch (modo) {
    case 'guess-song':
      return gerarPerguntaGuessSong(dificuldade);
    case 'guess-artist':
      return gerarPerguntaGuessArtist(dificuldade);
    case 'complete-lyric':
      return gerarPerguntaCompleteLyric(dificuldade);
    case 'music-trivia':
      return gerarPerguntaTrivia(dificuldade, sessionId);
    default:
      throw new Error('Modo de jogo inválido');
  }
};

// ============================================
// ✅ RESPONDER PERGUNTA
// ============================================

const responderPergunta = async (sessionId, respostaIndex, tempoResposta) => {
  const session = await GameSession.findById(sessionId);
  if (!session) throw new Error('Sessão não encontrada');
  if (session.completada) throw new Error('Sessão já finalizada');
  
  // ⚡ PASSA SESSIONID PARA EVITAR REPETIÇÃO
  const perguntaAtual = await gerarPergunta(session.modo, session.dificuldade, sessionId);
  const acertou = respostaIndex === perguntaAtual.respostaCorreta;
  
  const diffConfig = DIFICULTIES[session.dificuldade]
const pontosBase = 100
const bonusTempo = Math.max(0, diffConfig.tempo - tempoResposta) * 5
const streakBonus = Math.min(session.acertos + (acertou ? 1 : 0), 5) * 10 // bônus streak
const pontosGanhos = acertou ? Math.floor((pontosBase + bonusTempo + streakBonus) * diffConfig.multiplicador) : 0
const moedasGanhas = acertou ? Math.floor((10 + streakBonus) * diffConfig.multiplicador) : 0
  
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
  
if (precisao >= 70) {
  progressoModo.completado = true
  
  const dificuldades = ['easy', 'medium', 'hard']
  const idxAtual = dificuldades.indexOf(session.dificuldade)
  if (idxAtual >= 0 && idxAtual < dificuldades.length - 1) {
    const proximaDiff = dificuldades[idxAtual + 1]
    
    // ← ADICIONAR: garantir que o objeto existe antes de desbloquear
    if (!stats.progresso[session.modo]) {
      stats.progresso[session.modo] = {};
    }
    if (!stats.progresso[session.modo][proximaDiff]) {
      stats.progresso[session.modo][proximaDiff] = { 
        completado: false, 
        bloqueado: true, 
        melhorPontuacao: 0 
      };
    }
    
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
  { dia: 1, moedas: 50, iconClass: 'fa-solid fa-gift' },
  { dia: 2, moedas: 100, iconClass: 'fa-solid fa-sack-dollar' },
  { dia: 3, moedas: 150, iconClass: 'fa-solid fa-gem' },
  { dia: 4, moedas: 200, iconClass: 'fa-solid fa-fire' },
  { dia: 5, moedas: 300, iconClass: 'fa-solid fa-star' },
  { dia: 6, moedas: 500, iconClass: 'fa-solid fa-crown' },
  { dia: 7, moedas: 1000, iconClass: 'fa-solid fa-trophy' }
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
  { id: 'avatar_gold', nome: 'Avatar Dourado', descricao: 'Avatar especial dourado', icon: '👤', preco: 500, tipo: 'avatar' },
  { id: 'theme_dark', nome: 'Tema Noturno', descricao: 'Tema escuro exclusivo', icon: '🌙', preco: 300, tipo: 'tema' },
  { id: 'badge_pro', nome: 'Badge Pro', descricao: 'Badge de jogador pro', icon: '💎', preco: 1000, tipo: 'badge' },
  { id: 'vinyl_rare', nome: 'Vinil Raro', descricao: 'Vinil decorativo raro', icon: '💿', preco: 750, tipo: 'decorativo' },
  { id: 'emoji_set', nome: 'Pack de Emojis', descricao: 'Emojis musicais exclusivos', icon: '🎭', preco: 200, tipo: 'emoji' }
];

const getShopItems = async (userId) => {
  const stats = await getOrCreateUserStats(userId);
  const inventarioIds = stats.inventario.map(i => i.itemId);
  return LOJA_ITENS.map(item => ({
    ...item,
    possuido: inventarioIds.includes(item.id),
    equipado: stats.inventario.find(i => i.itemId === item.id)?.ativo || false,  // ← NOVO
    podeComprar: !inventarioIds.includes(item.id) && stats.estatisticas.totalMoedas >= item.preco
  }));
};

const buyItem = async (userId, itemId) => {
  try {
    const stats = await getOrCreateUserStats(userId);
    if (!stats) throw new Error('Erro ao carregar estatísticas do usuário');
    
    const item = LOJA_ITENS.find(i => i.id === itemId);
    if (!item) throw new Error('Item não encontrado na loja');
    
    // Garante que inventário existe
    if (!stats.inventario) stats.inventario = [];
    
    const jaPossui = stats.inventario.some(i => i.itemId === itemId);
    if (jaPossui) throw new Error('Item já possuído');
    
    if (stats.estatisticas.totalMoedas < item.preco) {
      throw new Error(`Moedas insuficientes. Você tem ${stats.estatisticas.totalMoedas}, precisa de ${item.preco}`);
    }
    
    // Desconta moedas
    stats.estatisticas.totalMoedas -= item.preco;
    
    // Adiciona ao inventário
    const novoItem = {
      itemId: item.id,
      nome: item.nome,
      icon: item.icon,
      tipo: item.tipo || 'geral',
      comprado: true,
      ativo: true,
      dataCompra: new Date()
    };
    stats.inventario.push(novoItem);
    
    // Aplica efeito
    await aplicarEfeitoItem(stats, item);
    
    // Verifica conquista
    const conquista = stats.conquistas.find(c => c.id === 'collector');
    if (conquista && !conquista.desbloqueada && stats.inventario.length >= 3) {
      conquista.desbloqueada = true;
      conquista.dataDesbloqueio = new Date();
    }
    
    await stats.save();
    
    return {
      success: true,
      item: { 
        ...item, 
        possuido: true, 
        podeComprar: false, 
        ativo: true,
        equipado: true 
      },
      moedasRestantes: stats.estatisticas.totalMoedas,
      inventario: stats.inventario,
      comprado: true,
      efeitoAplicado: item.tipo
    };
  } catch (error) {
    console.error('Erro em buyItem:', error);
    throw error;
  }
};

// ⚡ NOVO MÉTODO: Aplica efeitos específicos por tipo de item
const aplicarEfeitoItem = async (stats, item) => {
  switch (item.tipo) {
    case 'avatar':
      // Desativa outros avatares, ativa o novo
      stats.inventario.forEach(i => {
        if (i.tipo === 'avatar' && i.itemId !== item.id) {
          i.ativo = false;
        }
      });
      break;
      
    case 'tema':
      // Desativa outros temas, ativa o novo
      stats.inventario.forEach(i => {
        if (i.tipo === 'tema' && i.itemId !== item.id) {
          i.ativo = false;
        }
      });
      // ⚡ AQUI você pode salvar o tema ativo em um campo separado se quiser
      // stats.temaAtivo = item.id;
      break;
      
    case 'badge':
      // Badges são acumulativos (não precisa desativar outros)
      // Mas pode marcar como equipado se quiser mostrar no perfil
      break;
      
    case 'decorativo':
      // Itens decorativos podem ser acumulativos ou únicos
      break;
      
    case 'emoji':
      // Packs de emoji desbloqueiam novos emojis para uso
      break;
      
    default:
      // Tipo geral — nenhum efeito especial
      break;
  }
};

// ============================================
// 🏆 CONQUISTAS
// ============================================

const getAchievements = async (userId) => {
  const stats = await getOrCreateUserStats(userId)
  // Mapeia para o formato que o frontend espera
  return stats.conquistas.map(c => ({
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao,
    icon: c.icon,
    iconClass: c.icon ? `fa-solid fa-${c.icon}` : 'fa-solid fa-medal', // ou mapeie ícones corretamente
    moedas: c.moedas,
    desbloqueada: c.desbloqueada,
    resgatada: c.resgatada,
    claimable: c.desbloqueada && !c.resgatada,
    dataDesbloqueio: c.dataDesbloqueio,
    current: c.current || 0,
    total: c.total || 1
  }))
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

// ============================================
// 🔄 EQUIPAR/DESATIVAR ITENS
// ============================================

const equiparItem = async (userId, itemId) => {
  const stats = await getOrCreateUserStats(userId);
  const item = stats.inventario.find(i => i.itemId === itemId);
  
  if (!item) throw new Error('Item não encontrado no inventário');
  if (!item.comprado) throw new Error('Item não foi comprado');
  
  // Se for avatar ou tema, desativa outros do mesmo tipo
  if (['avatar', 'tema'].includes(item.tipo)) {
    stats.inventario.forEach(i => {
      if (i.tipo === item.tipo && i.itemId !== itemId) {
        i.ativo = false;
      }
    });
  }
  
  item.ativo = true;
  await stats.save();
  
  return {
    itemId: item.itemId,
    nome: item.nome,
    tipo: item.tipo,
    ativo: true
  };
};

const desativarItem = async (userId, itemId) => {
  const stats = await getOrCreateUserStats(userId);
  const item = stats.inventario.find(i => i.itemId === itemId);
  
  if (!item) throw new Error('Item não encontrado');
  
  item.ativo = false;
  await stats.save();
  
  return {
    itemId: item.itemId,
    ativo: false
  };
};

const getInventarioAtivo = async (userId) => {
  const stats = await getOrCreateUserStats(userId);
  return {
    avatar: stats.inventario.find(i => i.tipo === 'avatar' && i.ativo),
    tema: stats.inventario.find(i => i.tipo === 'tema' && i.ativo),
    badges: stats.inventario.filter(i => i.tipo === 'badge' && i.ativo),
    decorativos: stats.inventario.filter(i => i.tipo === 'decorativo' && i.ativo),
    emojis: stats.inventario.filter(i => i.tipo === 'emoji' && i.ativo)
  };
};

module.exports = {
  iniciarSessao,
  responderPergunta,
  finalizarSessao,
  getLeaderboard,
  getDailyRewards,
  claimDailyReward,
  getShopItems,
  buyItem,
  equiparItem,        // ← ADICIONAR
  desativarItem,      // ← ADICIONAR
  getInventarioAtivo, // ← ADICIONAR
  getAchievements,
  claimAchievement,
  getUserGameStats,
  getLiveActivities,
  gerarPergunta,      // ← ADICIONAR (já existe mas não exportava)
  GAME_CONFIG,
  DIFICULTIES,
  LOJA_ITENS
}