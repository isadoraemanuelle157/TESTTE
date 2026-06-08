 const userService = require('../services/usuarioService')
 const Usuario = require('../models/Usuario')

const jwt = require('jsonwebtoken')

const create = async (req, res) => {
  try {
    const user = await userService.createUser(req.body)

const token = jwt.sign(
  { 
    id: user.id,
    role: user.role || 'user'  // ← ADICIONAR ISSO
  },
  process.env.JWT_SECRET || "SEGREDO_SUPER_SECRETO",
  { expiresIn: '365d' }
)

    res.status(201).json({
      message: 'Usuário criado',
      user,
      token
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, senha } = req.body

    const user = await userService.loginUser(email, senha)

    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET || "SEGREDO_SUPER_SECRETO",
      { expiresIn: '365d' }
    )

    res.json({
      message: 'Login realizado',
      user,
      token
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const list = async (req, res) => {
  try {
    const users = await userService.getUsers()

    const usersComData = users.map(user => ({
      ...user,
      createdAt: user.createdAt || user.membroDesde || null
    }))

    res.json(usersComData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user?.id)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const update = async (req, res) => {
  try {
    const usuarioLogado = await Usuario.findById(req.user?.id).select('role')

    const isOwner = String(req.user?.id) === String(req.params.id)
    const isAdmin = usuarioLogado?.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Sem permissão para editar este usuário' })
    }

    const user = await userService.updateUser(req.params.id, req.body)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json({
      message: "Usuário atualizado",
      user
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


const remove = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json({ message: "Usuário removido", user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const search = async (req, res) => {
  try {
    const { q } = req.query
    const users = await userService.searchUsers(q)
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// 🎯 NOVO: GET MIXES (Feito para Você)
const getMixes = async (req, res) => {
  try {
    const { id } = req.params
    const { limit = 6 } = req.query
    const viewerId = req.user?.id

    // Verificar permissão de acesso ao perfil
    const podeAcessar = await userService.canAccessProfile(id, viewerId)
    if (!podeAcessar) {
      return res.status(403).json({ message: "Perfil privado" })
    }

    const bloqueado = await userService.isResourceBlocked(id, viewerId, 'mixes')
    if (bloqueado) {
      return res.status(403).json({ message: "Mixes ocultos para você" })
    }

    const mixes = await userService.getUserMixes(id, parseInt(limit))
    res.json(mixes)

  } catch (error) {
    console.error('❌ Erro getMixes:', error)
    res.status(500).json({ error: error.message })
  }
}

const getPublicCurtidas = async (req, res) => {
  try {
    const { id } = req.params
    const viewerId = req.user?.id

    const user = await userService.getUserById(id, viewerId)
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    const podeAcessarPerfil = await userService.canAccessProfile(id, viewerId)
    if (!podeAcessarPerfil) {
      return res.status(403).json({ message: "Perfil privado" })
    }

    const bloqueado = await userService.isResourceBlocked(id, viewerId, 'curtidas')
    if (bloqueado) {
      return res.status(403).json({ message: "Curtidas ocultas para você" })
    }

    const Curtida = require('../models/Curtida')
    const CurtidaExterna = require('../models/CurtidaExterna')

    const [curtidasLocais, curtidasExternas] = await Promise.all([
      Curtida.find({ usuario: id })
        .populate({
          path: 'musica',
          populate: { path: 'cantores', select: 'nome' }
        })
        .limit(50)
        .sort({ createdAt: -1 }),
      CurtidaExterna.find({ usuario: id })
        .limit(50)
        .sort({ createdAt: -1 })
    ])

    const musicasLocais = curtidasLocais.map(c => ({
      id: c.musica?._id,
      nome: c.musica?.nome,
      artist: c.musica?.cantores?.map(cant => cant.nome).join(', ') || 'Artista desconhecido',
      cover: c.musica?.foto,
      url: c.musica?.link,
      source: 'local'
    })).filter(m => m.id)

    const musicasExternas = curtidasExternas.map(c => ({
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
    
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getPublicPlaylists = async (req, res) => {
  try {
    const { id } = req.params
    const viewerId = req.user?.id

    const user = await userService.getUserById(id, viewerId)
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    const podeAcessarPerfil = await userService.canAccessProfile(id, viewerId)
    if (!podeAcessarPerfil) {
      return res.status(403).json({ message: "Perfil privado" })
    }

    const bloqueado = await userService.isResourceBlocked(id, viewerId, 'playlists')
    if (bloqueado) {
      return res.status(403).json({ message: "Playlists ocultas para você" })
    }

    const Playlist = require('../models/Playlist')
    const playlists = await Playlist.find({
      usuario: id,
      privacidade: 'Pública'
    }).sort({ createdAt: -1 }).limit(20)

    res.json(playlists)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getEstatisticas = async (req, res) => {
  try {
    const { id } = req.params
    const viewerId = req.user?.id

    const user = await userService.getUserById(id, viewerId)
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    const podeAcessarPerfil = await userService.canAccessProfile(id, viewerId)
    if (!podeAcessarPerfil) {
      return res.status(403).json({ message: "Perfil privado" })
    }

    const bloqueado = await userService.isResourceBlocked(id, viewerId, 'estatisticas')
    if (bloqueado) {
      return res.status(403).json({ message: "Estatísticas ocultas para você" })
    }

    const stats = await userService.getUserStats(id)
    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const recuperarSenha = async (req, res) => {
  try {
    const { email, novaSenha } = req.body

    await userService.recuperarSenha(email, novaSenha)

    res.json({
      message: 'Senha alterada com sucesso'
    })

  } catch (error) {
    res.status(400).json({
      error: error.message
    })
  }
}

const getPublicSeguidores = async (req, res) => {
  try {
    const data = await userService.getPublicFollowers(req.params.id, req.user?.id)
    res.json(data)
  } catch (error) {
    if (error.code === 'PROFILE_PRIVATE') {
      return res.status(403).json({ message: 'Perfil privado' })
    }
    if (error.code === 'FOLLOWERS_BLOCKED') {
      return res.status(403).json({ message: 'Seguidores ocultos para você' })
    }
    res.status(500).json({ error: error.message })
  }
}

const getPublicSeguindo = async (req, res) => {
  try {
    const data = await userService.getPublicFollowing(req.params.id, req.user?.id)
    res.json(data)
  } catch (error) {
    if (error.code === 'PROFILE_PRIVATE') {
      return res.status(403).json({ message: 'Perfil privado' })
    }
    if (error.code === 'FOLLOWING_BLOCKED') {
      return res.status(403).json({ message: 'Seguindo oculto para você' })
    }
    res.status(500).json({ error: error.message })
  }
}

const getBlockStatus = async (req, res) => {
  try {
    const data = await userService.getBlockStatus(req.user.id, req.params.id)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const blockUser = async (req, res) => {
  try {
    const data = await userService.blockUser(req.user.id, req.params.id)
    res.json({
      message: 'Usuário bloqueado com sucesso',
      data
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const unblockUser = async (req, res) => {
  try {
    const data = await userService.unblockUser(req.user.id, req.params.id)
    res.json({
      message: 'Usuário desbloqueado com sucesso',
      data
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const reportUser = async (req, res) => {
  try {
    const { motivo, chat } = req.body

    const data = await userService.reportUser(
      req.user.id,
      req.params.id,
      motivo,
      chat || null
    )

    res.status(201).json({
      message: 'Denúncia enviada com sucesso',
      data
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// 🎯 NOVO: GET RECOMENDAÇÕES COMPLETAS (Feito para Você - Modal)
const getRecomendacoes = async (req, res) => {
  try {
    const { id } = req.params
    const { tipo = 'tudo', limit = 50 } = req.query
    const viewerId = req.user?.id

    // Verificar permissão de acesso ao perfil
    const podeAcessar = await userService.canAccessProfile(id, viewerId)
    if (!podeAcessar) {
      return res.status(403).json({ message: "Perfil privado" })
    }

    const bloqueado = await userService.isResourceBlocked(id, viewerId, 'mixes')
    if (bloqueado) {
      return res.status(403).json({ message: "Recomendações ocultas para você" })
    }

    const recomendacoes = await userService.buscarRecomendacoesCompletas(id, tipo, parseInt(limit))
    res.json(recomendacoes)

  } catch (error) {
    console.error('❌ Erro getRecomendacoes:', error)
    res.status(500).json({ error: error.message })
  }
}

const RECURSOS_VALIDOS = [
  'curtidas',
  'playlists',
  'atividades',
  'seguidores',
  'seguindo',
  'estatisticas',
  'mixes',
  'tudo'
]

module.exports = {
  create,
  login,
  list,
  getById,
  update,
  remove,
  search,
  getMixes,
  getRecomendacoes,
  getPublicCurtidas,
  getPublicPlaylists,
  getEstatisticas,
  recuperarSenha,
  getPublicSeguidores,
  getPublicSeguindo,
  getBlockStatus,
  blockUser,
  unblockUser,
  reportUser
}
