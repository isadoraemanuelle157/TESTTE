const mongoose = require('mongoose');

const formatarSeguidores = (total) => {
  if (total >= 1000000) {
    const valor = total / 1000000
    return `${Number.isInteger(valor) ? valor : valor.toFixed(1).replace('.', ',')}M`
  }

  if (total >= 1000) {
    const valor = total / 1000
    return `${Number.isInteger(valor) ? valor : valor.toFixed(1).replace('.', ',')}k`
  }

  return String(total)
}

const cantorSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  foto: { type: String, default: '' },
  banner: { type: String, default: '' },

  bio: { type: String, default: '' },
  sobre: { type: String, default: '' },
  origem: { type: String, default: '' },
  pais: { type: String, default: '' },

  instagram: { type: String, default: '' },
  spotifyUrl: { type: String, default: '' },
  youtubeUrl: { type: String, default: '' },
  siteOficial: { type: String, default: '' },

  // ===== ORIGEM DO ARTISTA =====
  // Se veio de API externa ou é cadastro local
  source: {
    type: String,
    enum: ['local', 'deezer', 'spotify'],
    default: 'local'
  },

  // Dados da API externa (só preenchido quando source !== 'local')
  externo: {
    externalId: { type: String, default: null },      // ID original na API (ex: 12345 do Deezer)
    pictureMedium: { type: String, default: null },   // foto média da API
    pictureBig: { type: String, default: null },       // foto grande da API
    nbFan: { type: Number, default: 0 },             // fãs na API externa
    apiUrl: { type: String, default: null },          // URL na API externa
    tracklist: { type: String, default: null }        // URL da tracklist
  },

  albuns: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }],
    default: []
  },

  musicas: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Musica'
    }],
    default: []
  },

  generos: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genero'
    }],
    default: []
  },

  // número inicial/manual (para artistas locais ou override)
  seguidoresBase: {
    type: Number,
    default: 0,
    min: 0
  },

  // usuários que seguem o cantor no sistema
  seguidores: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }],
    default: []
  },

  ano: { type: Number },
  decada: { type: String },

  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// ===== VIRTUAL: totalSeguidores =====
// Soma: base + seguidores no app + fãs da API externa (se houver)
cantorSchema.virtual('totalSeguidores').get(function () {
  const appSeguidores = this.seguidores?.length || 0
  const apiFans = this.externo?.nbFan || 0
  return (this.seguidoresBase || 0) + appSeguidores + apiFans
})

cantorSchema.virtual('seguidoresFormatado').get(function () {
  return formatarSeguidores(this.totalSeguidores)
})

// ===== MÉTODO: obter foto de melhor qualidade =====
cantorSchema.methods.getBestPicture = function() {
  // Prioridade: banner > foto local > externo.pictureBig > externo.pictureMedium > foto padrão
  return this.banner 
    || this.foto 
    || this.externo?.pictureBig 
    || this.externo?.pictureMedium 
    || 'https://e-cdns-images.dzcdn.net/images/artist/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg'
}

// ===== MÉTODO: verificar se é artista externo =====
cantorSchema.methods.isExterno = function() {
  return this.source !== 'local' && this.externo?.externalId
}

// ===== ÍNDICE: evitar duplicados de artistas externos =====
// Um artista do Deezer e outro do Spotify podem ter o mesmo nome,
// mas o mesmo externalId + source não pode repetir
cantorSchema.index(
  { 'externo.externalId': 1, source: 1 },
  { 
    unique: true, 
    partialFilterExpression: { source: { $in: ['deezer', 'spotify'] } }
  }
)

module.exports = mongoose.models.Cantor || mongoose.model('Cantor', cantorSchema);