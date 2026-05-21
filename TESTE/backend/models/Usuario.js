const mongoose = require('mongoose')

// Subdocumento para itens externos (Spotify/Deezer)
const ItemExternoSchema = new mongoose.Schema({
  source: { type: String, enum: ['spotify', 'deezer'], required: true },
  externalId: { type: String, required: true },
  nome: { type: String, required: true },
  imagem: { type: String, default: null },
  extra: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false })

const GeneroExternoSchema = new mongoose.Schema({
  source: { type: String, enum: ['spotify', 'deezer', 'local'], required: true },
  externalId: { type: String, default: null },
  nome: { type: String, required: true },
  icon: { type: String, default: '🎵' },
  color: { type: String, default: '#1DB954' }
}, { _id: false })

const VibeExternaSchema = new mongoose.Schema({
  source: { type: String,  enum: ['local', 'externo', 'spotify', 'deezer', 'auto'], required: true },
  externalId: { type: String, default: null },
  nome: { type: String, required: true },
  emoji: { type: String, default: '✨' },
  descricao: { type: String, default: '' },
  gradient: { type: String, default: 'linear-gradient(135deg,#667eea,#764ba2)' },
  tags: [{ type: String }]
}, { _id: false })

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  
  role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user'
},

  idade: { type: Number, min: 18, max: 100, default: null },
  bio: { type: String, default: '' },
  avatar: { type: String, default: null },
  cover: { type: String, default: null },
  localizacao: { type: String, default: '' },
  website: { type: String, default: '' },

  perfilPrivado: { type: Boolean, default: false },
  mostrarAtividade: { type: Boolean, default: true },

  // ===== GÊNEROS: Mix de ObjectId (banco) + externos =====
  generos: {
    locais: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genero'
    }],
    externos: [GeneroExternoSchema]
  },

  // ===== ARTISTAS: Mix de ObjectId (banco) + externos =====
  artistasFavoritos: {
    locais: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cantor'
    }],
    externos: [ItemExternoSchema]
  },

  // ===== VIBES: Mix de ObjectId (banco) + externas =====
  vibesFavoritas: {
    locais: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vibe'
    }],
    externas: [VibeExternaSchema]
  },

  seguindo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor'
  }],

  solicitacoesSeguir: [{
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    status: {
      type: String,
      enum: ['pendente', 'aceito', 'recusado'],
      default: 'pendente'
    }
  }],

  onboardingCompleto: { type: Boolean, default: false },
  membroDesde: { type: Date, default: Date.now }
}, { 
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

// ===== MÉTODOS AUXILIARES =====

usuarioSchema.methods.getGenerosCompletos = async function() {
  const Genero = mongoose.model('Genero')
  
  const locais = await Genero.find({ _id: { $in: this.generos?.locais || [] } })
    .select('nome icon color popularidade')
    .lean()
  
  const locaisFormatados = locais.map(g => ({
    id: g._id.toString(),
    nome: g.nome,
    icon: g.icon,
    color: g.color,
    source: 'local',
    tipo: 'genero'
  }))
  
  const externosFormatados = (this.generos?.externos || []).map(g => ({
    id: `ext_${g.source}_${g.externalId}`,
    nome: g.nome,
    icon: g.icon,
    color: g.color,
    source: g.source,
    tipo: 'genero'
  }))
  
  return [...locaisFormatados, ...externosFormatados]
}

usuarioSchema.methods.getArtistasCompletos = async function() {
  const Cantor = mongoose.model('Cantor')
  
  const locais = await Cantor.find({ _id: { $in: this.artistasFavoritos?.locais || [] } })
    .select('nome foto generos')
    .populate('generos', 'nome')
    .lean()
  
  const locaisFormatados = locais.map(a => ({
    id: a._id.toString(),
    nome: a.nome,
    foto: a.foto,
    generos: a.generos?.map(g => g.nome).join(', ') || '',
    source: 'local',
    tipo: 'artista'
  }))
  
  const externosFormatados = (this.artistasFavoritos?.externos || []).map(a => ({
    id: `ext_${a.source}_${a.externalId}`,
    nome: a.nome,
    foto: a.imagem,
    generos: a.extra?.genero || '',
    source: a.source,
    tipo: 'artista'
  }))
  
  return [...locaisFormatados, ...externosFormatados]
}

usuarioSchema.methods.getVibesCompletas = async function() {
  const Vibe = mongoose.model('Vibe')
  
  const locais = await Vibe.find({ _id: { $in: this.vibesFavoritas?.locais || [] } })
    .select('nome emoji descricao gradient tags')
    .lean()
  
  const locaisFormatados = locais.map(v => ({
    id: v._id.toString(),
    nome: v.nome,
    emoji: v.emoji,
    descricao: v.descricao,
    gradient: v.gradient,
    tags: v.tags || [],
    source: 'local',
    tipo: 'vibe'
  }))
  
  const externasFormatadas = (this.vibesFavoritas?.externas || []).map(v => ({
    id: `ext_${v.source}_${v.externalId}`,
    nome: v.nome,
    emoji: v.emoji,
    descricao: v.descricao,
    gradient: v.gradient,
    tags: v.tags || [],
    source: v.source,
    tipo: 'vibe'
  }))
  
  return [...locaisFormatados, ...externasFormatadas]
}

usuarioSchema.pre('save', function(next) {
  // Se generos vier como array simples (do onboarding), converter para formato interno
   if (Array.isArray(this.generos)) {
    const externos = this.generos
      .filter(g => g && typeof g === 'object' && g.source && g.source !== 'local')
      .map(g => ({
        source: g.source,
        externalId: g.id?.toString() || g.externalId,
        nome: g.nome || g.name,
        icon: g.icon || '🎵',
        color: g.color || '#1DB954'
      }))
    
    const locais = this.generos
      .filter(g => {
        if (!g) return false
        if (typeof g === 'string') return mongoose.Types.ObjectId.isValid(g)
        return !g.source || g.source === 'local'
      })
      .map(g => typeof g === 'string' ? g : (g.id || g._id))
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
    
    this.generos = { locais, externos }
  }
  
  // ✅ NOVO: Se generos já é objeto { locais, externos }, validar locais
  if (this.generos && typeof this.generos === 'object' && !Array.isArray(this.generos)) {
    // Validar locais
    if (Array.isArray(this.generos.locais)) {
      this.generos.locais = this.generos.locais
        .map(id => {
          if (typeof id === 'object') return id._id?.toString() || id.id?.toString() || id.toString()
          return String(id)
        })
        .filter(id => mongoose.Types.ObjectId.isValid(id))
    } else {
      this.generos.locais = []
    }
    
    // Garantir externos é array
    if (!Array.isArray(this.generos.externos)) {
      this.generos.externos = []
    }
  }
  
  // Se artistasFavoritos vier como array simples
  if (Array.isArray(this.artistasFavoritos)) {
    const externos = this.artistasFavoritos
      .filter(a => a.source && a.source !== 'local')
      .map(a => ({
        source: a.source,
        externalId: a.id?.toString() || a.externalId,
        nome: a.nome || a.name,
        imagem: a.imagem || a.photo || null,
        extra: a.extra || {}
      }))
    
    const locais = this.artistasFavoritos
      .filter(a => !a.source || a.source === 'local')
      .map(a => a.id || a._id)
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
    
    this.artistasFavoritos = { locais, externos }
  }
  
  // Se vibesFavoritas vier como array simples
  if (Array.isArray(this.vibesFavoritas)) {
    const externas = this.vibesFavoritas
      .filter(v => v.source && v.source !== 'local')
      .map(v => ({
        source: v.source,
        externalId: v.id?.toString() || v.externalId,
        nome: v.nome || v.name,
        emoji: v.emoji || '✨',
        descricao: v.descricao || v.description || '',
        gradient: v.gradient || 'linear-gradient(135deg,#667eea,#764ba2)',
        tags: v.tags || []
      }))
    
    const locais = this.vibesFavoritas
      .filter(v => !v.source || v.source === 'local')
      .map(v => v.id || v._id)
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
    
    this.vibesFavoritas = { locais, externas }
  }
  
  next()
})

// Também adicione um método para facilitar o update do onboarding:
usuarioSchema.methods.updateOnboarding = async function(generos, artistas, vibes) {
  this.generos = generos || []
  this.artistasFavoritos = artistas || []
  this.vibesFavoritas = vibes || []
  this.onboardingCompleto = true
  return this.save()
}

module.exports = mongoose.model('Usuario', usuarioSchema)