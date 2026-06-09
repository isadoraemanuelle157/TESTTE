const mongoose = require('mongoose')

const musicaSnapshotSchema = new mongoose.Schema({
  trackId: { type: String, required: true },
  title: { type: String, required: true },
  artist: {
    name: { type: String, default: '' }
  },
  album: {
    title: { type: String, default: '' },
    cover_medium: { type: String, default: '' },
    cover_small: { type: String, default: '' }
  },
  cover: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  preview: { type: String, default: '' },
  genre: { type: String, default: '' },
  link: { type: String, default: '' }
}, { _id: false })

const matchInteracaoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },

  trackId: {
    type: String,
    required: true,
    index: true
  },

  musicaRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Musica',
    default: null
  },

  tipo: {
    type: String,
    enum: ['like', 'favorite'],
    required: true,
    index: true
  },

  musica: {
    type: musicaSnapshotSchema,
    required: true
  }
}, {
  timestamps: true
})

matchInteracaoSchema.index(
  { usuario: 1, trackId: 1, tipo: 1 },
  { unique: true }
)

module.exports = mongoose.models.MatchInteracao || mongoose.model('MatchInteracao', matchInteracaoSchema)
