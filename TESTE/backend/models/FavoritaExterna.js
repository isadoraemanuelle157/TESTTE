const mongoose = require('mongoose')

const FavoritaExternaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  // ID do item na API externa (Spotify/Deezer)
  itemId: {
    type: String,
    required: true
  },
  // Qual API: 'spotify' | 'deezer'
  source: {
    type: String,
    enum: ['spotify', 'deezer'],
    required: true
  },
  // Tipo do item: 'musica' | 'album' | 'cantor'
  tipoItem: {
    type: String,
    enum: ['musica', 'album', 'cantor'],
    default: 'musica'
  },
  // Dados cacheados do item (padronizado para todos os tipos)
  dadosItem: {
    titulo: { type: String, required: true },
    artista: { type: String, default: '' },
    capa: { type: String, default: '' },
    previewUrl: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    ano: { type: Number, default: null },
    album: { type: String, default: '' }
  }
}, { 
  timestamps: true 
})

// Índice composto para evitar duplicatas (usuario + itemId + source + tipoItem)
FavoritaExternaSchema.index({ usuario: 1, itemId: 1, source: 1, tipoItem: 1 }, { unique: true })

module.exports = mongoose.model('FavoritaExterna', FavoritaExternaSchema)