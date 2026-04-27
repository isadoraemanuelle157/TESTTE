const mongoose = require('mongoose');

const generosMusicaisSchema = new mongoose.Schema({
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

  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    trim: true
  },

  icon: { 
    type: String,
    required: [true, 'Ícone é obrigatório']
  },

  color: {
    type: String,
    required: [true, 'Cor é obrigatória']
  },

  popularidade: {
    type: Number,
    default: 0
  },

  musicas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Musica'
  }],

  albuns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],

  cantores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor'
  }]
});

module.exports = mongoose.models.Genero || mongoose.model('Genero', generosMusicaisSchema);
