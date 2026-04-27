const mongoose = require('mongoose')

const CurtidaSchema = new mongoose.Schema({
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
  }
}, { timestamps: true })

module.exports = mongoose.model('Curtida', CurtidaSchema)
