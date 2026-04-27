const mongoose = require('mongoose')

const followSchema = new mongoose.Schema({
  seguidor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  seguindo_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'tipoRef'
  },

  tipo: {
    type: String,
    enum: ['usuario', 'cantor'],
    required: true
  },

  tipoRef: {
    type: String,
    enum: ['Usuario', 'Cantor'],
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

// evita duplicação
followSchema.index(
  { seguidor_id: 1, seguindo_id: 1, tipo: 1 },
  { unique: true }
)

module.exports = mongoose.model('Follow', followSchema)