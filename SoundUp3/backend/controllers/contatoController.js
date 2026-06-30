const contatoService = require('../services/contatoService')

const criar = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'LOGIN_REQUIRED',
        message: 'Faça login para enviar e salvar mensagens de contato'
      })
    }

    const { assunto, categoria, mensagem } = req.body

    if (!assunto || !mensagem) {
      return res.status(400).json({
        error: 'Campos obrigatórios: assunto e mensagem'
      })
    }

    const data = await contatoService.criarMensagem({
      user: req.user,
      assunto,
      categoria,
      mensagem
    })

    res.status(201).json(data)
  } catch (error) {
    console.error('❌ ERRO CONTATO:', error)
    res.status(500).json({
      error: error.message || 'Erro interno ao criar mensagem de contato'
    })
  }
}

const minhas = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const data = await contatoService.listarMinhasMensagens(userId)
    res.json(data)
  } catch (error) {
    console.error('❌ ERRO LISTAR CONTATO:', error)
    res.status(500).json({ error: error.message })
  }
}

const todas = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'

    if (!isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
    }

    const data = await contatoService.listarTodasMensagens()
    res.json(data)
  } catch (error) {
    console.error('❌ ERRO LISTAR TODAS CONTATO:', error)
    res.status(500).json({ error: error.message })
  }
}

const responder = async (req, res) => {
  try {
    const { mensagem } = req.body

    if (!mensagem) {
      return res.status(400).json({ error: 'Mensagem obrigatória' })
    }

    const data = await contatoService.responderMensagem({
      contatoId: req.params.id,
      user: req.user,
      mensagem
    })

    res.json(data)
  } catch (error) {
    console.error('❌ ERRO RESPONDER CONTATO:', error)
    res.status(500).json({ error: error.message })
  }
}

const excluir = async (req, res) => {
  try {
    await contatoService.excluirMensagem({
      contatoId: req.params.id,
      user: req.user
    })

    res.json({
      success: true
    })
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

module.exports = {
  criar,
  minhas,
  todas,
  responder,
  excluir
}