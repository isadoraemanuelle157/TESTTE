const followService = require('../services/followService')

// SEGUIR
const seguir = async (req, res) => {
  try {
    const seguidor_id = req.user.id
    const { seguindo_id, tipo } = req.body

    const follow = await followService.seguir(seguidor_id, seguindo_id, tipo)

    res.json({ message: 'Seguiu com sucesso', follow })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Já está seguindo' })
    }
    res.status(500).json({ error: error.message })
  }
}
// DESSEGUIR
const desseguir = async (req, res) => {
  try {
    const seguidor_id = req.user.id
    const { seguindo_id, tipo } = req.body

    await followService.desseguir(seguidor_id, seguindo_id, tipo)

    res.json({ message: 'Deixou de seguir' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
// SEGUIDORES DO CANTOR
const seguidores = async (req, res) => {
  try {
    const { tipo } = req.query

    const seguidores = await followService.getSeguidores(req.params.id, tipo)
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
    const seguidor_id = req.user.id
    const { seguindo_id, tipo } = req.query

    const seguindo = await followService.verificar(seguidor_id, seguindo_id, tipo)

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