const mongoose = require('mongoose')

const followSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  cantor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// 🔥 impede duplicação
followSchema.index({ usuario_id: 1, cantor_id: 1 }, { unique: true })

module.exports = mongoose.model('Follow', followSchema)