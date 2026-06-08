const mongoose = require('mongoose')

const GameSessionSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },

  modo: {
    type: String,
    enum: ['guess-song', 'guess-artist', 'complete-lyric', 'music-trivia'],
    required: true
  },

  dificuldade: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },

  perguntaAtual: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  pontuacao: {
    type: Number,
    default: 0
  },

  moedasGanhas: {
    type: Number,
    default: 0
  },

  acertos: {
    type: Number,
    default: 0
  },

  sequenciaAtual: {
  type: Number,
  default: 0
},
maiorSequenciaSessao: {
  type: Number,
  default: 0
},

  erros: {
    type: Number,
    default: 0
  },

  totalPerguntas: {
    type: Number,
    default: 10
  },

  perguntasRespondidas: {
    type: Number,
    default: 0
  },

  tempoTotal: {
    type: Number,
    default: 0
  },

  completada: {
    type: Boolean,
    default: false
  },

  nivelDesbloqueado: {
    type: String,
    enum: ['easy', 'medium', 'hard', null],
    default: null
  },

  dataInicio: {
    type: Date,
    default: Date.now
  },

  dataFim: {
    type: Date
  }
}, {
  timestamps: true
})

GameSessionSchema.index({ pontuacao: -1, dataFim: -1 })
GameSessionSchema.index({ modo: 1, dificuldade: 1, pontuacao: -1 })

module.exports = mongoose.model('GameSession', GameSessionSchema)
