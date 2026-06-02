const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
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
  hasPassword: {
    type: Boolean,
    default: false
  },
  passwordHash: {
    type: String,
    default: null,
    select: false
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
  // ========== PERMISSÕES ==========
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }],
  permissions: {
    addMusic: {
      type: String,
      enum: ['owner', 'moderators', 'everyone'],
      default: 'everyone'
    },
    invitePeople: {
      type: String,
      enum: ['owner', 'moderators', 'everyone'],
      default: 'moderators'
    }
  },
  // ================================
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
}, {
  timestamps: true
})

roomSchema.index({ createdBy: 1 })
roomSchema.index({ isPublic: 1 })

roomSchema.pre('save', function(next) {
  if (this.isPublic) {
    this.passwordHash = null
    this.hasPassword = false
  }
  next()
})

module.exports = mongoose.model('Room', roomSchema)