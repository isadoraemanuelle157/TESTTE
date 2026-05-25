const mongoose = require('mongoose')

const DenunciaSchema = new mongoose.Schema({
  denunciante: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  denunciado: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  motivo: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ['pendente', 'analise', 'resolvida', 'rejeitada'], default: 'pendente' },
  respostaAdmin: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Denuncia', DenunciaSchema)