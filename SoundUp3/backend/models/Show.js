const mongoose = require('mongoose')

const showSchema = new mongoose.Schema({
  cantor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor',
    required: true
  },

  titulo: { type: String, required: true },
  descricao: { type: String, default: '' },

  data: { type: Date, required: true },
  local: { type: String, required: true },
  cidade: { type: String, required: true },
  pais: { type: String, default: 'Brasil' },

  banner: { type: String, default: '' },
  linkIngressos: { type: String, default: '' },

  status: {
    type: String,
    enum: ['agendado', 'cancelado', 'encerrado'],
    default: 'agendado'
  }
}, { timestamps: true })

module.exports = mongoose.model('Show', showSchema)
