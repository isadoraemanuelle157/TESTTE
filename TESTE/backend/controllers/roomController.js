const roomService = require('../services/roomService')

const criar = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { name, description, isPublic, invitedUsers } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da sala é obrigatório' })
    }

    const roomData = {
      name: name.trim(),
      description: description || '',
      isPublic: isPublic !== false,
      invitedUsers: invitedUsers || [],
      source: 'spotify' // usuário logado = spotify
    }

    const room = await roomService.criar(roomData, req.user.id)
    res.status(201).json(room)
  } catch (error) {
    console.error('ERRO CRIAR SALA:', error)
    res.status(400).json({ error: error.message })
  }
}

const listarMinhas = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const rooms = await roomService.listarMinhas(req.user.id)
    res.json(rooms)
  } catch (error) {
    console.error('ERRO LISTAR SALAS:', error)
    res.status(500).json({ error: error.message })
  }
}

const listarPublicas = async (req, res) => {
  try {
    const rooms = await roomService.listarPublicas()
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const buscarPorId = async (req, res) => {
  try {
    const room = await roomService.buscarPorId(req.params.id)
    if (!room) return res.status(404).json({ error: 'Sala não encontrada' })
    res.json(room)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const atualizar = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const room = await roomService.atualizar(req.params.id, req.user.id, req.body)
    res.json(room)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const deletar = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    await roomService.deletar(req.params.id, req.user.id)
    res.json({ message: 'Sala deletada com sucesso' })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const convidar = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { roomId, userId } = req.body
    if (!roomId || !userId) {
      return res.status(400).json({ error: 'roomId e userId são obrigatórios' })
    }

    const room = await roomService.convidar(roomId, req.user.id, userId)
    res.json({ message: 'Convite enviado', room })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const verificarAcesso = async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user?.id || null
    const temAcesso = await roomService.verificarAcesso(roomId, userId)
    res.json({ acesso: temAcesso })
  } catch (error) {
    res.status(403).json({ error: error.message, acesso: false })
  }
}

const atualizarTrack = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const room = await roomService.atualizarTrack(req.params.id, req.user.id, req.body)
    res.json(room)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const adicionarNaFila = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const room = await roomService.adicionarNaFila(req.params.id, req.user.id, req.body)
    res.json(room)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const enviarMensagem = async (req, res) => {
  try {
    const room = await roomService.enviarMensagem(req.params.id, req.body)
    res.json(room)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  criar,
  listarMinhas,
  listarPublicas,
  buscarPorId,
  atualizar,
  deletar,
  convidar,
  verificarAcesso,
  atualizarTrack,
  adicionarNaFila,
  enviarMensagem
}