const mongoose = require('mongoose');

const mensagemSchema = new mongoose.Schema({
  conversa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversa',
    required: true,
    index: true
  },
  remetente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  tipo: {
    type: String,
    enum: ['texto', 'imagem', 'audio', 'arquivo', 'emoji'],
    default: 'texto'
  },
  conteudo: {
    type: String,
    required: true  // URL para arquivo/imagem/audio, texto para texto/emoji
  },
  texto: {
    type: String,   // Texto original (para pesquisa)
    default: ''
  },
  metadata: {
    nomeArquivo: String,
    tamanho: Number,
    mimeType: String,
    duracaoAudio: Number,  // em segundos
    emoji: String
  },
  lida: {
    type: Boolean,
    default: false
  },
  dataLida: {
    type: Date,
    default: null
  },
  respostaA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mensagem',
    default: null
  }
}, {
  timestamps: true
});

// Índices para performance
mensagemSchema.index({ conversa: 1, createdAt: -1 });
mensagemSchema.index({ remetente: 1, destinatario: 1 });
mensagemSchema.index({ destinatario: 1, lida: 1 });

module.exports = mongoose.model('Mensagem', mensagemSchema);