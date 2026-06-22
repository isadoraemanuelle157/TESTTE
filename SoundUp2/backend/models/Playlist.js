const mongoose = require('mongoose')

const PlaylistSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
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
  // Músicas do banco local (ObjectIds)
  musicas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Musica'
  }],
  // Músicas externas (Spotify/Deezer) - referências ao modelo MusicaExterna
  musicasExternas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MusicaExterna'
  }],
  publica: {
    type: Boolean,
    default: true
  },
  favoritas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }]
}, {
  timestamps: true
})

module.exports = mongoose.model('Playlist', PlaylistSchema)