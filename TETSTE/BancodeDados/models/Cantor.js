const mongoose = require('mongoose');

const cantorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  foto: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cantor', cantorSchema);