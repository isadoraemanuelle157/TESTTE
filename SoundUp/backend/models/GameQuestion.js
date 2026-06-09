const mongoose = require('mongoose')

const GameQuestionSchema = new mongoose.Schema({
  modo: {
    type: String,
    enum: ['guess-song', 'guess-artist', 'complete-lyric', 'music-trivia'],
    required: true,
    index: true
  },
  
  dificuldade: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  
  // Dados da música (para modos que usam preview)
  musica: {
    titulo: String,
    artista: String,
    album: String,
    ano: Number,
    capa: String,
    previewUrl: String,
    deezerId: String,
    spotifyId: String
  },
  
  // Para Complete a Música
  tituloMascarado: [{
    texto: String,
    oculto: Boolean
  }],
  
  // Para Quiz Musical
  pergunta: String,
  categoria: String,
  corCategoria: String,
  iconCategoria: String,
  
  // Opções de resposta
  opcoes: [{
    texto: String,
    correta: Boolean
  }],
  
  respostaCorreta: {
    type: Number, // índice da opção correta
    required: true
  },
  
  // Metadados
  vezesUsada: { type: Number, default: 0 },
  vezesAcertada: { type: Number, default: 0 },
  ativa: { type: Boolean, default: true }
}, {
  timestamps: true
})

GameQuestionSchema.index({ modo: 1, dificuldade: 1, ativa: 1 })

module.exports = mongoose.model('GameQuestion', GameQuestionSchema)