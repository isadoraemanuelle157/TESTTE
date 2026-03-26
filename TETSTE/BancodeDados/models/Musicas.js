const mongoose = require('mongoose')

const musicaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  duracao: { type: String, required: true },
  foto: { type: String, required: true },
  humor: { type: String, required: true },
  letra: { type: String, required: true },
  link: { type: String, required: true },

  // 🔥 RELAÇÃO CORRETA
  generoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genero',
  }

}, {
  timestamps: true
})

module.exports = mongoose.model('Musica', musicaSchema)