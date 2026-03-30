const mongoose = require('mongoose')

const musicaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  duracao: { type: String, required: true },
  foto: { type: String, required: true },
  humor: { type: String, required: true },
  letra: { type: String, required: true },
  link: { type: String, required: true },

  // 🔥 RELAÇÃO CORRETA
  generos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genero'
  }],

  albuns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],

  cantores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor',
    required: true
  }]

}, {
  timestamps: true
})

module.exports = mongoose.model('Musica', musicaSchema)