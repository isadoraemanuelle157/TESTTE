const mongoose = require('mongoose')

const FavoritaExternaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  // ID da música na API externa (Spotify/Deezer)
  musicaId: {
    type: String,
    required: true
  },
  // Qual API: 'spotify' | 'deezer'
  source: {
    type: String,
    enum: ['spotify', 'deezer'],
    required: true
  },
  // Dados cacheados da música
  dadosMusica: {
    titulo: { type: String, required: true },
    artista: { type: String, required: true },
    capa: { type: String, default: '' },
    previewUrl: { type: String, default: '' },
    duration: { type: Number, default: 30 },
    ano: { type: Number, default: null },
    album: { type: String, default: '' }
  }
}, { 
  timestamps: true 
})

// Índice composto para evitar duplicatas
FavoritaExternaSchema.index({ usuario: 1, musicaId: 1, source: 1 }, { unique: true })

module.exports = mongoose.model('FavoritaExterna', FavoritaExternaSchema)