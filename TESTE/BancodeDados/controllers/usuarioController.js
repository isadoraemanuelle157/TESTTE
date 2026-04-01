const userService = require('../services/usuarioService')

// CADASTRO
const create = async (req, res) => {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json({ 
      message: 'Usuário criado', 
      user // ← já vem formatado do service
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// LOGIN
const login = async (req, res) => {
  try {
    const { email, senha } = req.body
    const user = await userService.loginUser(email, senha)

    res.json({ 
      message: 'Login realizado', 
      user // ← já vem formatado
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// LISTAR
const list = async (req, res) => {
  try {
    const users = await userService.getUsers()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// BUSCAR POR ID
const getById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// EDITAR USUÁRIO
const update = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json({ 
      message: "Usuário atualizado", 
      user // ← já vem formatado com id
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// EXCLUIR USUÁRIO
const remove = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json({ message: "Usuário removido", user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = {
  create,
  login,
  list,
  getById,
  update,
  remove
}
