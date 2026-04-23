const mongoose = require('mongoose')

const albumSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  foto: { type: String, required: true },

  cantor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Cantor',
  required: true
},

  // 🔥 NOVO
  musicas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Musica'
  }],

   generos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genero'
  }],

  ano: { type: Number }, // ex: 1998
decada: { type: String }, // ex: "Anos 90"

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Album', albumSchema)