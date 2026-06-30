const mongoose = require('mongoose')

const respostaSchema = new mongoose.Schema({
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  autorTipo: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  nomeAutor: {
    type: String,
    default: ''
  },
  mensagem: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true })

const suporteMensagemSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nome: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  categoria: {
    type: String,
    default: 'geral'
  },
  assunto: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['aberto', 'respondido', 'fechado'],
    default: 'aberto'
  },
  mensagens: [respostaSchema],
  ultimaMensagemEm: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

module.exports = mongoose.model('SuporteMensagem', suporteMensagemSchema)
