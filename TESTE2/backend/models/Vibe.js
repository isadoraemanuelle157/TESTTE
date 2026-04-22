const mongoose = require('mongoose')

const vibeSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  emoji: { type: String, default: "🎵" },
  descricao: { type: String, default: "" },
  gradient: { type: String, default: "" },

  tags: {
    type: [String],
    default: []
  },

  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Vibe', vibeSchema)