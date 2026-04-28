const mongoose = require('mongoose')

const matchSchema = new mongoose.Schema({
  usuarioA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  usuarioB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },

  musicasComuns: [{
    deezerId: { type: Number, required: true },
    titulo: String,
    artista: String,
    capa: String,
    preview: String
  }],

  generosComuns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneroMusical'
  }],

  compatibilidade: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  status: {
    type: String,
    enum: ['pendente', 'aceito', 'recusado', 'bloqueado'],
    default: 'pendente'
  },

  iniciadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },

  vistoPorA: { type: Boolean, default: false },
  vistoPorB: { type: Boolean, default: false },

  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    default: null
  },

  ultimaInteracao: { type: Date, default: Date.now }
}, {
  timestamps: true
})

matchSchema.index({ usuarioA: 1, usuarioB: 1 }, { unique: true })

matchSchema.pre('validate', function (next) {
  if (!this.usuarioA || !this.usuarioB) return next()

  const a = this.usuarioA.toString()
  const b = this.usuarioB.toString()

  if (a > b) {
    const temp = this.usuarioA
    this.usuarioA = this.usuarioB
    this.usuarioB = temp
  }

  next()
})

module.exports = mongoose.model('Match', matchSchema)
