const curtidaService = require('../services/curtidaService')
const Curtida = require('../models/Curtida')
const CurtidaExterna = require('../models/CurtidaExterna')
const mongoose = require('mongoose')

// ========== LISTAR TODAS AS CURTIDAS (locais + externas) ==========
const getMinhasCurtidas = async (req, res) => {
  try {
    const userId = req.user.id
    const userObjectId = new mongoose.Types.ObjectId(userId)

    const { locais, externas } = await curtidaService.getTodasCurtidas(userObjectId)
    // Formata curtidas locais
    const musicasLocais = locais.map(c => ({
      id: String(c.musica?._id || c.musica?.id),
      nome: c.musica?.nome,
      artist: c.musica?.cantores?.map(cant => cant.nome).join(', ') || 'Artista desconhecido',
      cover: c.musica?.foto || c.musica?.albuns?.[0]?.foto,
      url: c.musica?.link,
      source: 'local',
      createdAt: c.createdAt
    })).filter(m => m.id && m.nome)

   
// Formata curtidas externas
const musicasExternas = externas.map(c => ({
  id: String(c.musicaId),
  nome: c.dadosMusica?.titulo || 'Sem título',
  artist: c.dadosMusica?.artista || 'Artista desconhecido',
  cover: c.dadosMusica?.capa || '',
  url: c.dadosMusica?.previewUrl || '',
  source: c.source || 'spotify',
  duration: c.dadosMusica?.duration || 30,
  ano: c.dadosMusica?.ano || null,
  album: c.dadosMusica?.album || '',
  createdAt: c.createdAt
})).filter(m => m.id && m.nome !== 'Sem título')

    // Junta tudo e ordena por data (mais recente primeiro)
    const todas = [...musicasLocais, ...musicasExternas]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    res.json(todas)

  } catch (err) {
    console.error('Erro ao buscar curtidas:', err)
    res.status(500).json({ error: 'Erro ao buscar curtidas' })
  }
}

// ========== TOGGLE CURTIDA (local ou externa) ==========
// ========== TOGGLE CURTIDA (local ou externa) ==========
const toggleCurtida = async (req, res) => {
  try {
    const userId = req.user.id
    const musicaId = req.params.id
    const { source, dadosMusica } = req.body

    // Validação básica
    if (!musicaId) {
      return res.status(400).json({ error: 'ID da música é obrigatório' })
    }

    // 🔥 CONVERTE userId PARA OBJECTID (garante consistência)
    let userObjectId
    try {
      userObjectId = new mongoose.Types.ObjectId(userId)
    } catch (e) {
      return res.status(400).json({ error: 'ID de usuário inválido' })
    }

    // Se for música externa (deezer/spotify)
    if (source && source !== 'local') {
      if (!dadosMusica || !dadosMusica.titulo || !dadosMusica.artista) {
        return res.status(400).json({ 
          error: 'Dados da música são obrigatórios para curtidas externas',
          details: { titulo: dadosMusica?.titulo, artista: dadosMusica?.artista }
        })
      }

      const result = await curtidaService.toggleCurtidaExterna(
        userObjectId,  // <-- MUDANÇA: passa ObjectId em vez de string
        String(musicaId),
        source, 
        dadosMusica
      )
      return res.json(result)
    }

    // Se for música local - verifica se é ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(musicaId)) {
      return res.status(400).json({ 
        error: 'ID inválido para música local',
        message: 'Para músicas externas, envie source: "deezer" ou "spotify" no body'
      })
    }

    // 🔥 CONVERTE musicaId PARA OBJECTID também
    const musicaObjectId = new mongoose.Types.ObjectId(musicaId)

    const result = await curtidaService.toggleCurtida(userObjectId, musicaObjectId)
    res.json(result)

  } catch (err) {
    console.error('Erro ao processar curtida:', err)
    res.status(500).json({ error: 'Erro ao processar curtida', details: err.message })
  }
}

// ========== VERIFICAR SE MÚSICA ESTÁ CURTIDA ==========
// ========== VERIFICAR SE MÚSICA ESTÁ CURTIDA ==========
const isCurtida = async (req, res) => {
  try {
    const userId = req.user.id
    const musicaId = req.params.id
    const { source } = req.query

    // 🔥 CONVERTE userId PARA OBJECTID (igual no toggle)
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId

    let isLiked = false

    if (source && source !== 'local') {
      // Verifica em externas
      const externa = await CurtidaExterna.findOne({
        usuario: userObjectId,  // ← MUDAR: usar userObjectId em vez de userId
        musicaId: String(musicaId),
        source: source
      })
      isLiked = !!externa
    } else {
      // Verifica em locais
      if (mongoose.Types.ObjectId.isValid(musicaId)) {
        const local = await Curtida.findOne({
          usuario: userObjectId,  // ← MUDAR: usar userObjectId em vez de userId
          musica: musicaId
        })
        isLiked = !!local
      }
      
      // Fallback para externas sem source
      if (!isLiked) {
        const externa = await CurtidaExterna.findOne({
          usuario: userObjectId,  // ← MUDAR: usar userObjectId em vez de userId
          musicaId: String(musicaId)
        })
        isLiked = !!externa
      }
    }

    res.json({ liked: isLiked })
  } catch (err) {
    console.error('Erro ao verificar curtida:', err)
    res.status(500).json({ error: 'Erro ao verificar curtida' })
  }
}

// ========== LISTAR CURTIDAS PÚBLICAS DE UM USUÁRIO ==========
const listarCurtidasPublicas = async (req, res) => {
  try {
    const { id } = req.params
    
    // 🔥 CONVERTE id PARA OBJECTID
    const userOid = mongoose.Types.ObjectId.isValid(id)
      ? new mongoose.Types.ObjectId(id)
      : id
    
    const [locais, externas] = await Promise.all([
      Curtida.find({ usuario: userOid })       // ✅ ObjectId
        .populate({
          path: 'musica',
          populate: { path: 'cantores', select: 'nome' }
        })
        .sort({ createdAt: -1 })
        .limit(50),
       CurtidaExterna.find({ usuario: userOid }) // ✅ ObjectId
        .sort({ createdAt: -1 })
        .limit(50)
    ])

    const musicasLocais = locais.map(c => ({
      id: String(c.musica?._id),
      nome: c.musica?.nome,
      artist: c.musica?.cantores?.map(cant => cant.nome).join(', ') || 'Artista desconhecido',
      cover: c.musica?.foto || c.musica?.albuns?.[0]?.foto,
      url: c.musica?.link,
      source: 'local'
    })).filter(m => m.id && m.nome)

  const musicasExternas = externas.map(c => ({
  id: String(c.musicaId),
  nome: c.dadosMusica?.titulo || 'Sem título',
  artist: c.dadosMusica?.artista || 'Artista desconhecido',
  cover: c.dadosMusica?.capa || '',
  url: c.dadosMusica?.previewUrl || '',
  source: c.source || 'spotify',
  duration: c.dadosMusica?.duration || 30,
  ano: c.dadosMusica?.ano || null,
  album: c.dadosMusica?.album || ''
})).filter(m => m.id && m.nome !== 'Sem título')

    res.json([...musicasLocais, ...musicasExternas])

  } catch (err) {
    console.error('Erro ao buscar curtidas públicas:', err)
    res.status(500).json({ error: 'Erro ao buscar curtidas públicas' })
  }
}

// ========== VERIFICAR ESTADO DA MÚSICA (playlists + favorito) ==========
const verificarEstadoMusica = async (req, res) => {
  try {
    const userId = req.user.id
    const musicaId = req.params.id
    const { source } = req.query

    const userObjectId = new mongoose.Types.ObjectId(userId)

    const [playlistsComMusica, isFav] = await Promise.all([
      curtidaService.getPlaylistsComMusica(userObjectId, musicaId, source),
      curtidaService.isFavorita(userObjectId, musicaId, source)
    ])

    res.json({
      playlists: playlistsComMusica, // array de IDs das playlists
      favoritada: isFav
    })

  } catch (err) {
    console.error('Erro ao verificar estado:', err)
    res.status(500).json({ error: 'Erro ao verificar estado da música' })
  }
}

module.exports = {
  toggle: toggleCurtida,
  getMinhasCurtidas,
  isCurtida,
  listarCurtidasPublicas,
  verificarEstadoMusica  // ← ADICIONAR
}