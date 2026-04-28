const mongoose = require('mongoose')

const curtidaMusicalSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  deezerId: { type: Number, required: true },
  titulo: { type: String, required: true },
  artista: String,
  album: String,
  capa: String,
  preview: String,
  duracao: Number,

  tipo: {
    type: String,
    enum: ['like', 'favorite', 'superlike'],
    default: 'like'
  },

  generos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneroMusical'
  }]
}, {
  timestamps: true
})

curtidaMusicalSchema.index({ usuario: 1, deezerId: 1 }, { unique: true })

module.exports = mongoose.model('CurtidaMusical', curtidaMusicalSchema)
