const curtidaService = require('../services/curtidaService')
const Curtida = require('../models/Curtida')
const CurtidaExterna = require('../models/CurtidaExterna')

// ========== LISTAR TODAS AS CURTIDAS (locais + externas) ==========
const getMinhasCurtidas = async (req, res) => {
  try {
    const userId = req.user.id

    const { locais, externas } = await curtidaService.getTodasCurtidas(userId)

    // Formata curtidas locais
    const musicasLocais = locais.map(c => ({
      id: c.musica?._id || c.musica?.id,
      nome: c.musica?.nome,
      artist: c.musica?.cantores?.map(cant => cant.nome).join(', ') || 'Artista desconhecido',
      cover: c.musica?.foto || c.musica?.albuns?.[0]?.foto,
      url: c.musica?.link,
      source: 'local',
      createdAt: c.createdAt
    })).filter(m => m.id && m.nome)

    // Formata curtidas externas
    const musicasExternas = externas.map(c => ({
      id: c.musicaId,
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

    // Se for música externa (spotify/deezer)
    if (source && source !== 'local') {
      if (!dadosMusica || !dadosMusica.titulo || !dadosMusica.artista) {
        return res.status(400).json({ 
          error: 'Dados da música são obrigatórios para curtidas externas',
          details: { titulo: dadosMusica?.titulo, artista: dadosMusica?.artista }
        })
      }

      const result = await curtidaService.toggleCurtidaExterna(
        userId, 
        musicaId, 
        source, 
        dadosMusica
      )
      return res.json(result)
    }

    // Se for música local (comportamento anterior)
    // Verifica se o ID é um ObjectId válido do MongoDB
    const mongoose = require('mongoose')
    if (!mongoose.Types.ObjectId.isValid(musicaId)) {
      return res.status(400).json({ 
        error: 'ID inválido para música local',
        message: 'Para músicas externas, envie source: "spotify" ou "deezer" no body'
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
      const externa = await CurtidaExterna.findOne({
        usuario: userId,
        musicaId: musicaId,
        source: source
      })
      isLiked = !!externa
    } else {
      const mongoose = require('mongoose')
      if (mongoose.Types.ObjectId.isValid(musicaId)) {
        const local = await Curtida.findOne({
          usuario: userId,
          musica: musicaId
        })
        isLiked = !!local
      }
      
      // Também verifica em externas (fallback)
      if (!isLiked) {
        const externa = await CurtidaExterna.findOne({
          usuario: userId,
          musicaId: musicaId
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
      id: c.musica?._id,
      nome: c.musica?.nome,
      artist: c.musica?.cantores?.map(cant => cant.nome).join(', ') || 'Artista desconhecido',
      cover: c.musica?.foto || c.musica?.albuns?.[0]?.foto,
      url: c.musica?.link,
      source: 'local'
    })).filter(m => m.id && m.nome)

    const musicasExternas = externas.map(c => ({
      id: c.musicaId,
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