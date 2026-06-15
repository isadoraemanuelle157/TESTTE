const express = require('express')
const router = express.Router()

const Musica = require('../models/Musicas')
const Cantor = require('../models/Cantor')
const Album = require('../models/Album')

router.get('/', async (req, res) => {
  try {
    const { q } = req.query

    const regex = new RegExp(q, 'i')

    // 🔥 BUSCAR MÚSICAS
    const musicas = await Musica.find({ nome: regex })
      .populate('cantores', 'nome foto')
      .populate('albuns', 'nome foto')

    // 🔥 BUSCAR CANTORES
    const cantores = await Cantor.find({ nome: regex })
      .populate('albuns', 'nome foto')

    // 🔥 BUSCAR ÁLBUNS
    const albuns = await Album.find({ nome: regex })
      .populate('cantor', 'nome foto')
      .populate('musicas', 'nome')

    res.json({
      musicas,
      cantores,
      albuns
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router