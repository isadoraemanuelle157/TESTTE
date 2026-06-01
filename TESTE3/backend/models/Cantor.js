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

// número inicial/manual
  seguidoresBase: {
    type: Number,
    default: 0,
    min: 0
  },

  // usuários que seguem o cantor
  seguidores: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario' // ajuste se o nome do seu model for outro
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

cantorSchema.virtual('totalSeguidores').get(function () {
  return (this.seguidoresBase || 0) + (this.seguidores?.length || 0)
})

cantorSchema.virtual('seguidoresFormatado').get(function () {
  const total = (this.seguidoresBase || 0) + (this.seguidores?.length || 0)
  return formatarSeguidores(total)
})

module.exports = mongoose.models.Cantor || mongoose.model('Cantor', cantorSchema);
