const mongoose = require('mongoose')

const musicaSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  duracao: { type: String, required: true, trim: true },
  foto: { type: String, required: true, trim: true },
  humor: { type: String, required: true, trim: true },
  letra: { type: String, required: true, trim: true },
  link: { type: String, required: true, trim: true },

  ano: { type: Number }, // ex: 1998, 2005
  decada: { type: String }, // ex: "Anos 90", "Anos 2000"

  generos: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genero'
    }],
    default: []
  },

  albuns: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }],
    default: []
  },

  cantores: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cantor'
    }],
    default: []
  }

}, {
  timestamps: true
})

module.exports = mongoose.model('Musica', musicaSchema)
