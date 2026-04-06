const mongoose = require('mongoose');

const generosMusicaisSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },

  // 🔥 RELAÇÃO COM MÚSICAS
  musicas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Musica'
    }
  ],

  albuns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }
  ],

  cantores: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor'
  }
]

});

module.exports = mongoose.model('Genero', generosMusicaisSchema);