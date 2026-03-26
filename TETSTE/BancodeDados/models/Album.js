const mongoose = require('mongoose')

const albumSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  foto: { type: String, required: true },

   cantores: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Cantor',
  required: true
}],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Album', albumSchema)