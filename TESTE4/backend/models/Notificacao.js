const mongoose = require('mongoose')

const notificacaoSchema = new mongoose.Schema({
  usuarioDestino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  usuarioOrigem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  tipo: {
    type: String,
    enum: ['follow_request', 'follow_accept', 'follow_reject'],
    required: true
  },
  mensagem: {
    type: String,
    default: ''
  },
  lida: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Notificacao', notificacaoSchema)
