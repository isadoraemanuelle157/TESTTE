const curtidaService = require('../services/curtidaService')
const Curtida = require('../models/Curtida')

const getMinhasCurtidas = async (req, res) => {
  try {
    const userId = req.user.id

    const curtidas = await Curtida.find({ usuario: userId })
  .populate({
    path: 'musica',
    populate: {
      path: 'cantores',
      select: 'nome'
    }
  })

    res.json(curtidas)

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao buscar curtidas' })
  }
}

const toggleCurtida = async (req, res) => {
  const userId = req.user.id
  const musicaId = req.params.id

  const existente = await Curtida.findOne({
    usuario: userId,
    musica: musicaId
  })

  if (existente) {
    await existente.deleteOne()
    return res.json({ liked: false })
  }

  await Curtida.create({
    usuario: userId,
    musica: musicaId
  })

  res.json({ liked: true })
}

const listarCurtidas = async (req, res) => {
  const userId = req.user.id

  const curtidas = await Curtida.find({ usuario: userId })
    .populate('musica')

  res.json(curtidas)
}

module.exports = {
  toggle: toggleCurtida,
  getMinhasCurtidas,
  listarCurtidas
}
