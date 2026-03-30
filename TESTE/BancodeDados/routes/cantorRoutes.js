const express = require('express')
    const router = express.Router()
    const cantorController = require('../controllers/cantorController')

    // Rotas
    router.post('/', cantorController.create)           // Criar
    router.get('/', cantorController.list)              // Listar todos
    router.get('/:id', cantorController.getById)        // Buscar por ID
    router.get('/nome/:nome', cantorController.getByNome) // Buscar por nome
    router.put('/:id', cantorController.update)         // Atualizar
    router.delete('/:id', cantorController.remove)      // Deletar

    module.exports = router