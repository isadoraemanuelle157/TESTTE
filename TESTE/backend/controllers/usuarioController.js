const userService = require('../services/usuarioService')
const jwt = require('jsonwebtoken')

// CADASTRO
const create = async (req, res) => {
  try {
    const user = await userService.createUser(req.body)

    const token = jwt.sign(
      { id: user.id },
      "SEGREDO_SUPER_SECRETO",
      { expiresIn: '365d' }
    )

    res.status(201).json({ 
      message: 'Usuário criado', 
      user,
      token
    })

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// LOGIN
const login = async (req, res) => {
  try {
    const { email, senha } = req.body // 🔥 CORREÇÃO

    const user = await userService.loginUser(email, senha)

    const token = jwt.sign(
      { id: user.id },
      "SEGREDO_SUPER_SECRETO",
      { expiresIn: '7d' }
    )

    res.json({ 
      message: 'Login realizado', 
      user,
      token
    })

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// RESTO IGUAL
const list = async (req, res) => {
  try {
    const users = await userService.getUsers()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

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

const update = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body)

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json({ 
      message: "Usuário atualizado", 
      user
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

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

// Adicione no usuarioController.js
const search = async (req, res) => {
  try {
    const { q } = req.query
    const users = await userService.searchUsers(q)
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Exporte no module.exports
module.exports = {
  create,
  login,
  list,
  getById,
  update,
  remove,
  search // 
}
