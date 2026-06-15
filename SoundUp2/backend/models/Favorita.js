const mongoose = require('mongoose')

const favoritaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  musica: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Musica',
    default: null
  },
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    default: null
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    default: null
  },
  cantor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// 🔥 CORREÇÃO: Usar partialFilterExpression para garantir que o índice só aplique quando o campo não for null
favoritaSchema.index({ usuario: 1, musica: 1 }, { 
  unique: true, 
  partialFilterExpression: { musica: { $type: 'objectId' } }
})

favoritaSchema.index({ usuario: 1, playlist: 1 }, { 
  unique: true, 
  partialFilterExpression: { playlist: { $type: 'objectId' } }
})

favoritaSchema.index({ usuario: 1, album: 1 }, { 
  unique: true, 
  partialFilterExpression: { album: { $type: 'objectId' } }
})

favoritaSchema.index({ usuario: 1, cantor: 1 }, { 
  unique: true, 
  partialFilterExpression: { cantor: { $type: 'objectId' } }
})

module.exports = mongoose.model('Favorita', favoritaSchema)