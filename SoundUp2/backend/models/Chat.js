const mongoose = require('mongoose')

const MensagemSchema = new mongoose.Schema({
  remetente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  conteudo: { type: String, required: true, maxlength: 2000 },
tipo: { type: String, enum: ['texto', 'musica', 'imagem', 'audio', 'arquivo'], default: 'texto' },
  musica: {
    trackId: String,
    title: String,
    artist: String,
    cover: String,
    preview: String
  },
  arquivo: {
  nome: String,
  url: String,
  tipo: String,      // MIME type
  tamanho: Number    // bytes
},
duracao: { type: Number, default: 0 },  // para áudio em segundos
  lida: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: true })

const ChatSchema = new mongoose.Schema({
  participantes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }],
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchMusical', required: true },
  mensagens: [MensagemSchema],
  ultimaMensagem: {
    conteudo: String,
    remetente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    data: Date
  },
  arquivado: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Índices para performance
ChatSchema.index({ participantes: 1 })
ChatSchema.index({ matchId: 1 }, { unique: true })
ChatSchema.index({ updatedAt: -1 })

module.exports = mongoose.model('Chat', ChatSchema)