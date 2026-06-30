const mongoose = require('mongoose')

const BloqueioSchema = new mongoose.Schema({
  bloqueador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  bloqueado: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  createdAt: { type: Date, default: Date.now }
})

BloqueioSchema.index({ bloqueador: 1, bloqueado: 1 }, { unique: true })

module.exports = mongoose.model('Bloqueio', BloqueioSchema)