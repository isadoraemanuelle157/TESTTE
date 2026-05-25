const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')

// ============================================
// CARREGA O MODEL
// ============================================
let Musica = null
try {
  Musica = require('../models/Musicas')
  console.log('✅ Model Musicas carregado com sucesso')
} catch (err) {
  console.error('❌ Erro ao carregar model Musicas:', err.message)
}

// ============================================
// MIDDLEWARE PARA VERIFICAR SE O MODEL ESTA OK
// ============================================
function checkModel(req, res, next) {
  if (!Musica) {
    return res.status(503).json({
      error: 'Servico indisponivel',
      message: 'Model Musicas nao carregado. Verifique o console do servidor.'
    })
  }
  next()
}

// ============================================
// 🔍 BUSCAR MUSICA
// ============================================
router.get('/search', checkModel, async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Termo de busca muito curto',
        message: 'Digite pelo menos 2 caracteres'
      })
    }

    const termo = q.trim()
    const regex = new RegExp(termo, 'i')

    const musicas = await Musica.find({
      $or: [
        { nome: regex },
        { humor: regex },
        { letra: regex },
        { decada: regex }
      ]
    })
    .populate('cantores', 'nome foto')
    .populate('generos', 'nome icon color')
    .populate('albuns', 'nome capa')
    .limit(20)
    .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: musicas.length,
      query: termo,
      results: musicas
    })

  } catch (error) {
    console.error('Erro busca musicas:', error.message)
    res.status(500).json({ 
      error: 'Erro ao buscar musicas',
      message: error.message 
    })
  }
})

// ============================================
// 📋 LISTAR TODAS
// ============================================
router.get('/', checkModel, async (req, res) => {
  try {
    const { page = 1, limit = 20, genero, cantor, decada } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    let filtro = {}
    
    if (genero) filtro.generos = genero
    if (cantor) filtro.cantores = cantor
    if (decada) filtro.decada = decada

    const [musicas, total] = await Promise.all([
      Musica.find(filtro)
        .populate('cantores', 'nome foto')
        .populate('generos', 'nome icon color')
        .populate('albuns', 'nome capa')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Musica.countDocuments(filtro)
    ])

    res.json({
      success: true,
      count: musicas.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      results: musicas
    })

  } catch (error) {
    console.error('Erro listar musicas:', error.message)
    res.status(500).json({ 
      error: 'Erro ao listar musicas',
      message: error.message 
    })
  }
})

// ============================================
// 🔍 BUSCAR POR ID
// ============================================
router.get('/:id', checkModel, async (req, res) => {
  try {
    const musica = await Musica.findById(req.params.id)
      .populate('cantores', 'nome foto biografia')
      .populate('generos', 'nome icon color gradient')
      .populate('albuns', 'nome capa ano')

    if (!musica) {
      return res.status(404).json({ 
        error: 'Musica nao encontrada' 
      })
    }

    res.json({
      success: true,
      result: musica
    })

  } catch (error) {
    console.error('Erro buscar musica por ID:', error.message)
    res.status(500).json({ 
      error: 'Erro ao buscar musica',
      message: error.message 
    })
  }
})

// ============================================
// ➕ CRIAR
// ============================================
router.post('/', requireAuth, checkModel, async (req, res) => {
  try {
    const musica = new Musica(req.body)
    await musica.save()
    
    const populada = await Musica.findById(musica._id)
      .populate('cantores', 'nome foto')
      .populate('generos', 'nome icon color')
      .populate('albuns', 'nome capa')

    res.status(201).json({
      success: true,
      message: 'Musica criada com sucesso',
      result: populada
    })

  } catch (error) {
    console.error('Erro criar musica:', error.message)
    res.status(500).json({ 
      error: 'Erro ao criar musica',
      message: error.message 
    })
  }
})

// ============================================
// ✏️ ATUALIZAR
// ============================================
router.put('/:id', requireAuth, checkModel, async (req, res) => {
  try {
    const musica = await Musica.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('cantores', 'nome foto')
    .populate('generos', 'nome icon color')
    .populate('albuns', 'nome capa')

    if (!musica) {
      return res.status(404).json({ 
        error: 'Musica nao encontrada' 
      })
    }

    res.json({
      success: true,
      message: 'Musica atualizada com sucesso',
      result: musica
    })

  } catch (error) {
    console.error('Erro atualizar musica:', error.message)
    res.status(500).json({ 
      error: 'Erro ao atualizar musica',
      message: error.message 
    })
  }
})

// ============================================
// 🗑️ DELETAR
// ============================================
router.delete('/:id', requireAuth, checkModel, async (req, res) => {
  try {
    const musica = await Musica.findByIdAndDelete(req.params.id)

    if (!musica) {
      return res.status(404).json({ 
        error: 'Musica nao encontrada' 
      })
    }

    res.json({
      success: true,
      message: 'Musica removida com sucesso'
    })

  } catch (error) {
    console.error('Erro deletar musica:', error.message)
    res.status(500).json({ 
      error: 'Erro ao remover musica',
      message: error.message 
    })
  }
})

module.exports = router