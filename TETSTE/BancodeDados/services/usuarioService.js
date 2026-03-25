const Usuario = require('../models/Usuario')
const bcrypt = require('bcrypt')

// CADASTRAR
const createUser = async (data) => {
  const { nome, email, senha } = data

  // verifica se já existe
  const jaExiste = await Usuario.findOne({ email })
  if (jaExiste) {
    throw new Error('E-mail já cadastrado')
  }

  // criptografa senha
  const senhaHash = await bcrypt.hash(senha, 10)

  const user = new Usuario({
    nome,
    email,
    senha: senhaHash
  })

  return await user.save()
}

// LOGIN
const loginUser = async (email, senha) => {
  const user = await Usuario.findOne({ email })

  if (!user) {
    throw new Error('Usuário não encontrado')
  }

  const senhaValida = await bcrypt.compare(senha, user.senha)

  if (!senhaValida) {
    throw new Error('Senha inválida')
  }

  return user
}

// OUTROS
const getUsers = async () => {
  return await Usuario.find()
}

const getUserById = async (id) => {
  return await Usuario.findById(id)
}

const deleteUser = async (id) => {
  return await Usuario.findByIdAndDelete(id)
}

module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  deleteUser
}