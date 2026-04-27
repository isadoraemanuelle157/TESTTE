const mongoose = require('mongoose')

function calcularDecada(ano) {
  if (!ano) return null
  const inicio = Math.floor(ano / 10) * 10
  return `Anos ${inicio}s`
}

const musicaSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  duracao: { type: String, required: true, trim: true },
  foto: { type: String, required: true, trim: true },
  humor: { type: String, required: true, trim: true },
  letra: { type: String, required: true, trim: true },
  link: { type: String, required: true, trim: true },

  ano: { 
    type: Number,
    min: 1920,
    max: 2020
  },

  decada: { type: String },

  generos: {
  type: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genero'
  }],
  required: true,
  validate: v => v.length > 0
},

  albuns: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }],
    default: []
  },

 cantores: {
  type: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor'
  }],
  required: true,
  validate: v => v.length > 0
},

}, {
  timestamps: true
})

// Middlewares para calcular década automaticamente
musicaSchema.pre('save', function(next) {
  if (this.isModified('ano')) {
    this.decada = calcularDecada(this.ano)
  }
  next()
})

musicaSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate()
  if (update.ano !== undefined) {
    update.decada = calcularDecada(update.ano)
  }
  next()
})

module.exports = mongoose.models.Musica || mongoose.model('Musica', musicaSchema);