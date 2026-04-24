const mongoose = require('mongoose')

function calcularDecada(ano) {
  if (!ano) return null
  const inicio = Math.floor(ano / 10) * 10
  return `Anos ${inicio}`
}

const albumSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  foto: { type: String, required: true },

  cantor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor',
    required: true
  },

  musicas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Musica'
  }],

  generos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genero'
  }],

  ano: { 
    type: Number,
    min: 1920,
    max: 2020
  },
  
  decada: { type: String },

  createdAt: { type: Date, default: Date.now }
});

// Middleware para calcular década automaticamente
albumSchema.pre('save', function(next) {
  if (this.isModified('ano')) {
    this.decada = calcularDecada(this.ano)
  }
  next()
})

albumSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate()
  if (update.ano !== undefined) {
    update.decada = calcularDecada(update.ano)
  }
  next()
})

module.exports = mongoose.models.Album || mongoose.model('Album', albumSchema);