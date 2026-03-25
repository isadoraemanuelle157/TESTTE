const mongoose = require('mongoose')

const albumSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String, required: true },
  foto: { type: String, required: true }
})

module.exports = mongoose.model('Album', albumSchema)