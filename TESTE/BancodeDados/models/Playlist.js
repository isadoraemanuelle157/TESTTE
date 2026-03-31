const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },

  descricao: {
    type: String,
    default: ''
  },

  capa: {
    type: String,
    default: ''
  },

  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  musicas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Musica'
    }
  ],

  publica: {
    type: Boolean,
    default: true
  },

  favoritas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Playlist', playlistSchema)