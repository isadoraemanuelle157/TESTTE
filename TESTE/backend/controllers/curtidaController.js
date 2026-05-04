const curtidaService = require('../services/curtidaService')
const Curtida = require('../models/Curtida')
const CurtidaExterna = require('../models/CurtidaExterna')
const mongoose = require('mongoose')

// ========== LISTAR TODAS AS CURTIDAS (locais + externas) ==========
const getMinhasCurtidas = async (req, res) => {
  try {
    const userId = req.user.id

    const { locais, externas } = await curtidaService.getTodasCurtidas(userId)

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
      id: String(c.musicaId),  // <-- ID da API externa como string
      nome: c.dadosMusica.titulo,
      artist: c.dadosMusica.artista,
      cover: c.dadosMusica.capa,
      url: c.dadosMusica.previewUrl,
      source: c.source,
      duration: c.dadosMusica.duration,
      ano: c.dadosMusica.ano,
      album: c.dadosMusica.album,
      createdAt: c.createdAt
    }))

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
const toggleCurtida = async (req, res) => {
  try {
    const userId = req.user.id
    const musicaId = req.params.id
    const { source, dadosMusica } = req.body

    // Validação básica
    if (!musicaId) {
      return res.status(400).json({ error: 'ID da música é obrigatório' })
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
        userId, 
        String(musicaId),  // Garante string
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

    const result = await curtidaService.toggleCurtida(userId, musicaId)
    res.json(result)

  } catch (err) {
    console.error('Erro ao processar curtida:', err)
    res.status(500).json({ error: 'Erro ao processar curtida', details: err.message })
  }
}

// ========== VERIFICAR SE MÚSICA ESTÁ CURTIDA ==========
const isCurtida = async (req, res) => {
  try {
    const userId = req.user.id
    const musicaId = req.params.id
    const { source } = req.query

    let isLiked = false

    if (source && source !== 'local') {
      // Verifica em externas
      const externa = await CurtidaExterna.findOne({
        usuario: userId,
        musicaId: String(musicaId),
        source: source
      })
      isLiked = !!externa
    } else {
      // Verifica em locais (se for ObjectId válido)
      if (mongoose.Types.ObjectId.isValid(musicaId)) {
        const local = await Curtida.findOne({
          usuario: userId,
          musica: musicaId
        })
        isLiked = !!local
      }
      
      // Se não achou local, verifica em externas (fallback sem source)
      if (!isLiked) {
        const externa = await CurtidaExterna.findOne({
          usuario: userId,
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
    
    const [locais, externas] = await Promise.all([
      Curtida.find({ usuario: id })
        .populate({
          path: 'musica',
          populate: { path: 'cantores', select: 'nome' }
        })
        .sort({ createdAt: -1 })
        .limit(50),
      CurtidaExterna.find({ usuario: id })
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
      nome: c.dadosMusica.titulo,
      artist: c.dadosMusica.artista,
      cover: c.dadosMusica.capa,
      url: c.dadosMusica.previewUrl,
      source: c.source,
      duration: c.dadosMusica.duration,
      ano: c.dadosMusica.ano,
      album: c.dadosMusica.album
    }))

    res.json([...musicasLocais, ...musicasExternas])

  } catch (err) {
    console.error('Erro ao buscar curtidas públicas:', err)
    res.status(500).json({ error: 'Erro ao buscar curtidas públicas' })
  }
}

module.exports = {
  toggle: toggleCurtida,
  getMinhasCurtidas,
  isCurtida,
  listarCurtidasPublicas
}