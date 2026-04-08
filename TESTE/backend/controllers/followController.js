const followService = require('../services/followService')

// SEGUIR
const seguir = async (req, res) => {
  try {
    const usuario_id = req.user.id // 🔥 vem do token
    const { cantor_id } = req.body

    const follow = await followService.seguirCantor(usuario_id, cantor_id)

    res.json({ message: 'Seguiu o cantor', follow })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Você já segue esse cantor' })
    }
    res.status(500).json({ error: error.message })
  }
}

// DESSEGUIR
const desseguir = async (req, res) => {
  try {
    const usuario_id = req.user.id
    const { cantor_id } = req.body

    await followService.desseguirCantor(usuario_id, cantor_id)

    res.json({ message: 'Deixou de seguir' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// SEGUIDORES DO CANTOR
const seguidores = async (req, res) => {
  try {
    const seguidores = await followService.getSeguidores(req.params.id)
    res.json(seguidores)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// QUEM O USUÁRIO SEGUE (🔥 usa token)
const seguindo = async (req, res) => {
  try {
    const usuario_id = req.user.id

    const seguindo = await followService.getSeguindo(usuario_id)
    res.json(seguindo)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// TOTAL DE SEGUIDORES
const total = async (req, res) => {
  try {
    const total = await followService.contarSeguidores(req.params.id)
    res.json({ total })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// VERIFICAR SE SEGUE
const verificar = async (req, res) => {
  try {
    const usuario_id = req.user.id
    const { cantor_id } = req.query

    const seguindo = await followService.verificar(usuario_id, cantor_id)

    res.json({ seguindo })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  seguir,
  desseguir,
  seguidores,
  seguindo,
  total,
  verificar
}