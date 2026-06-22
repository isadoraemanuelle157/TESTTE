const mongoose = require('mongoose');

const conversaSchema = new mongoose.Schema({
  participantes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }],
  ultimaMensagem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mensagem'
  },
  ultimaAtividade: {
    type: Date,
    default: Date.now,
    index: true
  },
  // ✅ ADICIONAR ESTE CAMPO (já está no seu arquivo mas está DENTRO de naoLidas, precisa sair)
  apagadaPara: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: []
  }],
  naoLidas: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    quantidade: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

conversaSchema.index({ participantes: 1 });
conversaSchema.index({ apagadaPara: 1 }); // ✅ ADICIONAR ÍNDICE

module.exports = mongoose.model('Conversa', conversaSchema);