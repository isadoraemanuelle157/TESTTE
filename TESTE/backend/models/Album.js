const mongoose = require('mongoose')

function calcularDecada(ano) {
  if (!ano) return null
  const inicio = Math.floor(ano / 10) * 10
  return `Anos ${inicio}`
}

const albumSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, 'Nome é obrigatório'],
    trim: true
  },

  descricao: { 
    type: String, 
    required: [true, 'Descrição é obrigatória'],
    trim: true
  },

  foto: { 
    type: String, 
    required: [true, 'Foto é obrigatória']
  },

  cantor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor',
    required: [true, 'Cantor é obrigatório']
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
    required: [true, 'Ano é obrigatório'],
    min: 1920,
    max: 2020
  },

  decada: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

albumSchema.path('musicas').validate(
  val => Array.isArray(val) && val.length > 0,
  'Selecione ao menos uma música'
)

albumSchema.path('generos').validate(
  val => Array.isArray(val) && val.length > 0,
  'Selecione ao menos um gênero'
)

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

module.exports = mongoose.models.Album || mongoose.model('Album', albumSchema)
