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
  source: { type: String, enum: ['local', 'externo'], required: true },
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

module.exports = mongoose.model('Usuario', usuarioSchema)