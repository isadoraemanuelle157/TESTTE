// models/Usuario.js
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: null },
  cover: { type: String, default: null },
  localizacao: { type: String, default: '' },
  membroDesde: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', usuarioSchema);