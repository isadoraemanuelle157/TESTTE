const mongoose = require('mongoose')

const vibeSchema = new mongoose.Schema({
  nome: { 
    type: String, 
    required: [true, 'Nome é obrigatório'],
    trim: true 
  },

  emoji: { 
    type: String, 
    required: [true, 'Emoji é obrigatório'],
    trim: true
  },

  descricao: { 
    type: String, 
    required: [true, 'Descrição é obrigatória'],
    trim: true
  },

  gradient: { 
    type: String, 
    required: [true, 'Gradiente é obrigatório']
  },

  tags: {
    type: [String],
    required: true,
    validate: {
      validator: function(v){
        return Array.isArray(v) && v.length > 0
      },
      message: 'Pelo menos uma tag é obrigatória'
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Vibe', vibeSchema)
