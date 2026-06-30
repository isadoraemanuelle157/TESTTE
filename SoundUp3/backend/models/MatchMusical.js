const mongoose = require('mongoose')

const commonSongSchema = new mongoose.Schema({
  trackId: { type: String, required: true },
  title: { type: String, required: true },
  artist: {
    name: { type: String, default: '' }
  },
  cover: { type: String, default: '' }
}, { _id: false })

const matchMusicalSchema = new mongoose.Schema({
  pairKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  usuarios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }],

  commonSongs: {
    type: [commonSongSchema],
    default: []
  },

  commonGenres: {
    type: [String],
    default: []
  },

  compatibility: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['pendente', 'aceito', 'recusado'],
    default: 'aceito'
  },

  vistosPor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],

  ocultoPor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }]
}, {
  timestamps: true
})

module.exports = mongoose.models.MatchMusical || mongoose.model('MatchMusical', matchMusicalSchema)
