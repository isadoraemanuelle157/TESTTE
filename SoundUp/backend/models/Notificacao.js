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
    enum: [
      'follow_request',
      'follow_accept',
      'follow_reject',
      'new_follower',  
      'support_message',
      'support_reply',
       'contact_message',   // ← NOVO
    'contact_reply'
    ],
    required: true
  },
  mensagem: {
    type: String,
    default: ''
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lida: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Notificacao', notificacaoSchema)
