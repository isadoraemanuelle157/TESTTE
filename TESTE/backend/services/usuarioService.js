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

   // Gera avatar padrão com iniciais
  const defaultAvatar = generateDefaultAvatar(nome, null)

 // No createUser, adicione explicitamente:
const user = new Usuario({
  nome,
  username,
  email,
  senha: senhaHash,
  bio: '',        // ← explícito
   avatar: defaultAvatar, // ← Avatar gerado automaticamente
  cover: null,    // ← explícito
  localizacao: '' // ← explícito
})

  const savedUser = await user.save()

    // Regenera com o ID real
  if (savedUser._id) {
    savedUser.avatar = generateDefaultAvatar(nome, savedUser._id.toString())
    await savedUser.save()
  }
  
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
  const {
    nome,
    username,
    bio,
    avatar,
    cover,
    localizacao,
    email,
    website,
    generos,
    perfilPrivado,
    mostrarAtividade
  } = data

  const updateData = {}

  if (nome !== undefined) updateData.nome = nome
  if (username !== undefined) updateData.username = username
  if (bio !== undefined) updateData.bio = bio
  if (avatar !== undefined) updateData.avatar = avatar
  if (cover !== undefined) updateData.cover = cover
  if (localizacao !== undefined) updateData.localizacao = localizacao
  if (email !== undefined) updateData.email = email
  if (website !== undefined) updateData.website = website
  if (generos !== undefined) updateData.generos = generos
  if (perfilPrivado !== undefined) updateData.perfilPrivado = perfilPrivado
  if (mostrarAtividade !== undefined) updateData.mostrarAtividade = mostrarAtividade

  const user = await Usuario.findByIdAndUpdate(
    id,
    updateData,
    { new: true, select: '-senha' }
  )

  return formatUser(user)
}

const deleteUser = async (id) => {
  const user = await Usuario.findByIdAndDelete(id)
  return formatUser(user)
}

// Adicione esta função no usuarioservice.js
const searchUsers = async (query) => {
  if (!query || query.trim() === '') return []
  
  const regex = new RegExp(query, 'i') // case-insensitive
  
  const users = await Usuario.find({
    $or: [
      { nome: { $regex: regex } },
      { username: { $regex: regex } },
      { email: { $regex: regex } }
    ]
  }, '-senha').limit(10)
  
  return users.map(formatUser)
}
const generateDefaultAvatar = (nome, id) => {
  const initials = nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'
  
  // Gera cor consistente baseada no ID
  const str = id || nome || 'default'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const gradients = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#30cfd0', '#330867']
  ]
  
  const colorIndex = Math.abs(hash) % gradients.length
  const [color1, color2] = gradients[colorIndex]
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}"/>
          <stop offset="100%" stop-color="${color2}"/>
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#g)"/>
      <text x="50%" y="50%" font-family="Arial,sans-serif" font-size="80" 
            font-weight="bold" fill="white" text-anchor="middle" dy=".35em">
        ${initials}
      </text>
    </svg>
  `
  
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
}
// Exporte no module.exports
module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  generateDefaultAvatar 
}