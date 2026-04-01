const Usuario = require('../models/Usuario')
const bcrypt = require('bcrypt')

// Helper para formatar usuário (remove _id e senha, adiciona id)
const formatUser = (user) => {
  if (!user) return null
  
  // Se for documento MongoDB, converte para objeto plano
  const userObj = user.toObject ? user.toObject() : user
  
  // Remove _id e senha, cria id
  const { _id, senha, ...rest } = userObj
  
  return {
    id: _id.toString(), // ← Converte ObjectId para string
    ...rest
  }
}

// CADASTRAR
const createUser = async (data) => {
  const { nome, email, senha } = data

  // verifica se já existe
  const jaExiste = await Usuario.findOne({ email })
  if (jaExiste) {
    throw new Error('E-mail já cadastrado')
  }

  // gera username a partir do email (parte antes do @)
  const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')

  // criptografa senha
  const senhaHash = await bcrypt.hash(senha, 10)

 // No createUser, adicione explicitamente:
const user = new Usuario({
  nome,
  username,
  email,
  senha: senhaHash,
  bio: '',        // ← explícito
  avatar: null,   // ← explícito
  cover: null,    // ← explícito
  localizacao: '' // ← explícito
})

  const savedUser = await user.save()
  return formatUser(savedUser) // ← retorna formatado com id em vez de _id
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

  return formatUser(user) // ← usa helper
}

// OUTROS
const getUsers = async () => {
  const users = await Usuario.find({}, '-senha')
  return users.map(formatUser)
}

const getUserById = async (id) => {
  const user = await Usuario.findById(id, '-senha')
  return formatUser(user)
}

const updateUser = async (id, data) => {
  const { nome, username, bio, avatar, cover, localizacao, email } = data
  
  const updateData = {}
  if (nome) updateData.nome = nome
  if (username) updateData.username = username
  if (bio !== undefined) updateData.bio = bio
  if (avatar !== undefined) updateData.avatar = avatar // ← corrigido: verifica undefined não só truthy
  if (cover !== undefined) updateData.cover = cover     // ← corrigido
  if (localizacao !== undefined) updateData.localizacao = localizacao // ← corrigido
  if (email) updateData.email = email

  const user = await Usuario.findByIdAndUpdate(
    id,
    updateData,
    { new: true, select: '-senha' }
  )
  
  return formatUser(user) // ← retorna formatado com id
}

const deleteUser = async (id) => {
  const user = await Usuario.findByIdAndDelete(id)
  return formatUser(user)
}

module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
}