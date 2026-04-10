const express = require('express')
    const router = express.Router()
    const cantorController = require('../controllers/cantorController')

    // Rotas
    router.post('/', cantorController.create)           // Criar
    router.get('/', cantorController.list)              // Listar todos
router.get('/nome/:nome', cantorController.getByNome)
router.get('/search', cantorController.search)
router.get('/:id', cantorController.getById)
    router.put('/:id', cantorController.update)         // Atualizar
    router.delete('/:id', cantorController.remove)      // Deletar

    module.exports = router