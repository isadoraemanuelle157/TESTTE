const express = require('express')
    const router = express.Router()
    const cantorController = require('../controllers/cantorController')
const { requireAuth } = require('../middleware/auth')

    // Rotas
    router.post('/', cantorController.create)           // Criar
    router.get('/', cantorController.list)              // Listar todos
    router.get('/search', cantorController.search)
router.get('/nome/:nome', cantorController.getByNome)

router.patch('/:id/seguir', requireAuth, cantorController.seguir)         // ✅ requireAuth
router.patch('/:id/deixar-seguir', requireAuth, cantorController.deixarSeguir)

router.get('/:id/shows', cantorController.getShowsByCantor)
router.get('/:id', cantorController.getById)
    router.put('/:id', cantorController.update)         // Atualizar
    router.delete('/:id', cantorController.remove)      // Deletar

    module.exports = router