const mongoose = require('mongoose')

const privacidadeAtividadeSchema = new mongoose.Schema({
  usuarioDono: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  usuarioBloqueado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  recursos: [{
    type: String,
    enum: ['curtidas', 'playlists', 'atividades', 'seguidores', 'seguindo', 'estatisticas', 'tudo']
  }]
}, { timestamps: true })

privacidadeAtividadeSchema.index(
  { usuarioDono: 1, usuarioBloqueado: 1 },
  { unique: true }
)

module.exports = mongoose.model('PrivacidadeAtividade', privacidadeAtividadeSchema)
