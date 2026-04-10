const mongoose = require('mongoose')

const favoritaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  musica: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Musica'
  },
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  },
    album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  },
  cantor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// 🔥 evitar duplicar (um ou outro)
favoritaSchema.index({ usuario: 1, musica: 1 }, { unique: true, sparse: true })
favoritaSchema.index({ usuario: 1, playlist: 1 }, { unique: true, sparse: true })
favoritaSchema.index({ usuario: 1, album: 1 }, { unique: true, sparse: true })
favoritaSchema.index({ usuario: 1, cantor: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('Favorita', favoritaSchema)
