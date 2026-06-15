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
  // EM: models/Room.js (linha ~80), adicionar ao schema:

syncState: {
  isPlaying: { type: Boolean, default: false },
  currentTime: { type: Number, default: 0 },
  trackId: { type: String, default: null },
  lastUpdated: { type: Date, default: Date.now }
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
    },
     promoteModerators: {
    type: String,
    enum: ['owner', 'moderators', 'everyone'],
    default: 'owner'
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
  // ========== LISTENERS ATIVOS ==========
activeListeners: [{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  name: String,
  avatar: String,
  role: {
    type: String,
    enum: ['owner', 'moderator', 'participant'],
    default: 'participant'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}],
// ======================================
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
  } else {
    // Garante que hasPassword esteja sincronizado com passwordHash
    this.hasPassword = !!this.passwordHash
  }
  next()
})

// Adicionar APÓS o pre('save')
roomSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate()
  if (update.isPublic === true || update.$set?.isPublic === true) {
    this.set({ passwordHash: null, hasPassword: false })
  } else if ((update.isPublic === false || update.$set?.isPublic === false) && !update.passwordHash && !update.$set?.passwordHash) {
    // Se está tornando privada sem senha, mantém hasPassword false
    this.set({ hasPassword: false })
  }
  next()
})

module.exports = mongoose.model('Room', roomSchema)