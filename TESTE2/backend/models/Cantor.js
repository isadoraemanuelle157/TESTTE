const mongoose = require('mongoose');

const cantorSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  foto: { type: String, default: '' },

  albuns: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }],
    default: []
  },

  musicas: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Musica'
    }],
    default: []
  },

  generos: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genero'
    }],
    default: []
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cantor', cantorSchema);
