const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    enum: ['spotify', 'deezer'],
    default: 'deezer'
  },
  gradient: {
    type: String,
    default: 'linear-gradient(135deg, #667eea, #764ba2)'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  invitedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  listeners: {
    type: Number,
    default: 0
  },
  currentTrack: {
    id: String,
    title: String,
    artist: String,
    cover: String,
    duration: Number,
    preview: String,
    deezerId: String
  },
  queue: [{
    id: String,
    title: String,
    artist: String,
    cover: String,
    duration: Number,
    preview: String,
    deezerId: String
  }],
  messages: [{
    userId: String,
    userName: String,
    avatar: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

// Índice para buscar salas do usuário
roomSchema.index({ createdBy: 1 })
roomSchema.index({ isPublic: 1 })

module.exports = mongoose.model('Room', roomSchema)