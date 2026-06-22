const mongoose = require('mongoose')

const ChatSilenciadoSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  createdAt: { type: Date, default: Date.now }
})

ChatSilenciadoSchema.index({ chat: 1, usuario: 1 }, { unique: true })

module.exports = mongoose.model('ChatSilenciado', ChatSilenciadoSchema)