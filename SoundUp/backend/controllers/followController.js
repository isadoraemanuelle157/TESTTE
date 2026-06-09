const followService = require('../services/followService')

const seguir = async (req, res) => {
  try {
    // ✅ VALIDAÇÃO CRÍTICA: Verifica se req.user existe
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado',
        detail: 'Token JWT inválido ou não fornecido'
      })
    }

    const seguidor_id = req.user.id
    const { seguindo_id, tipo, artistData } = req.body

    // ✅ VALIDAÇÃO: Campos obrigatórios no body
    if (!seguindo_id) {
      return res.status(400).json({ 
        error: 'seguindo_id é obrigatório no body',
        detail: 'Envie: { seguindo_id: "id_do_usuario", tipo: "usuario" }'
      })
    }

    if (!tipo) {
      return res.status(400).json({ 
        error: 'tipo é obrigatório no body',
        detail: 'Envie: { seguindo_id: "id", tipo: "usuario" ou "cantor" }'
      })
    }

    if (!['usuario', 'cantor'].includes(tipo.toLowerCase())) {
      return res.status(400).json({ 
        error: 'tipo inválido',
        detail: 'tipo deve ser "usuario" ou "cantor"'
      })
    }

    let resultado
    
    if (artistData && tipo === 'cantor') {
      resultado = await followService.seguirArtistaExterno(seguidor_id, artistData)
    } else {
      resultado = await followService.seguir(seguidor_id, seguindo_id, tipo)
    }

    res.json({
      message: resultado.solicitado
        ? 'Solicitação enviada com sucesso'
        : 'Seguiu com sucesso',
      ...resultado
    })
  } catch (error) {
    console.error('ERRO FOLLOW:', error)

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Você já segue este usuário',
        keyPattern: error.keyPattern,
        keyValue: error.keyValue
      })
    }

    res.status(400).json({ error: error.message })
  }
}

const desseguir = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const seguidor_id = req.user.id
    const { seguindo_id, tipo } = req.body

    if (!seguindo_id || !tipo) {
      return res.status(400).json({ error: 'seguindo_id e tipo são obrigatórios' })
    }

    await followService.desseguir(seguidor_id, seguindo_id, tipo)

    res.json({ message: 'Deixou de seguir' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const seguidores = async (req, res) => {
  try {
    const { tipo } = req.query
    const seguidores = await followService.getSeguidores(req.params.id, tipo)
    res.json(seguidores)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const seguindo = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const usuario_id = req.user.id
    const { tipo } = req.query

    const seguindo = await followService.getSeguindo(usuario_id, tipo)
    res.json(seguindo)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const seguindoPorId = async (req, res) => {
  try {
    const { tipo } = req.query
    const seguindo = await followService.getSeguindo(req.params.id, tipo)
    res.json(seguindo)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const total = async (req, res) => {
  try {
    const { tipo } = req.query
    const total = await followService.contarSeguidores(req.params.id, tipo)
    res.json({ total })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const verificar = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const seguidor_id = req.user.id
    const { seguindo_id, tipo } = req.query

    if (!seguindo_id || !tipo) {
      return res.status(400).json({ error: 'seguindo_id e tipo são obrigatórios na query' })
    }

    const seguindo = await followService.verificar(seguidor_id, seguindo_id, tipo)
    res.json({ seguindo })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const aceitarSolicitacao = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const follow = await followService.aceitarSolicitacao(
      req.user.id,
      req.body.solicitanteId
    )

    res.json({ message: 'Solicitação aceita', follow })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = {
  seguir,
  desseguir,
  seguidores,
  seguindo,
  seguindoPorId,
  total,
  verificar,
  aceitarSolicitacao
}