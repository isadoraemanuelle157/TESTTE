const mongoose = require('mongoose')

const matchSchema = new mongoose.Schema({
  usuarioA: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  usuarioB: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  
  // Músicas curtidas em comum (referências à Deezer)
  musicasComuns: [{
    deezerId: { type: Number, required: true },
    titulo: String,
    artista: String,
    capa: String,
    preview: String
  }],
  
  // Gêneros em comum (referências ao seu modelo GeneroMusical)
  generosComuns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneroMusical'
  }],
  
  // Score de compatibilidade 0-100
  compatibilidade: { type: Number, min: 0, max: 100, default: 0 },
  
  // Status do match
  status: {
    type: String,
    enum: ['pendente', 'aceito', 'recusado'],
    default: 'pendente'
  },
  
  // Quem deu like primeiro (para notificações)
  iniciadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  
  // Para controle de notificações
  vistoPorA: { type: Boolean, default: false },
  vistoPorB: { type: Boolean, default: false },
  
  // Última interação
  ultimaInteracao: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Índice composto para evitar duplicatas
matchSchema.index({ usuarioA: 1, usuarioB: 1 }, { unique: true })

// Garantir que usuarioA sempre seja o menor ID (consistência)
matchSchema.pre('save', function(next) {
  if (this.usuarioA > this.usuarioB) {
    const temp = this.usuarioA
    this.usuarioA = this.usuarioB
    this.usuarioB = temp
  }
  next()
})

module.exports = mongoose.model('Match', matchSchema)