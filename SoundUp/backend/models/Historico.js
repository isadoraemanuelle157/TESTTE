const mongoose = require('mongoose')

const historicoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  // 🔥 NOVO: tipo do histórico
  tipo: {
    type: String,
    enum: ['busca', 'reproducao'],
    default: 'busca'
  },
  // Para buscas (existente)
  termo: {
    type: String,
    required: function() { return this.tipo === 'busca' }
  },
  // 🔥 NOVOS: Para reproduções
  musicaId: {
    type: String,
    required: function() { return this.tipo === 'reproducao' }
  },
  titulo: {
    type: String,
    required: function() { return this.tipo === 'reproducao' }
  },
  artista: String,
  capa: String,
  source: {
    type: String,
    default: 'local'
  },
  tempoOuvido: {
    type: Number, // em ms
    default: 0
  },
  reproduzidaAteOFim: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// 🔥 NOVO: Índice composto para evitar duplicados recentes na reprodução
historicoSchema.index({ usuario: 1, musicaId: 1, createdAt: -1 })

module.exports = mongoose.model('Historico', historicoSchema)