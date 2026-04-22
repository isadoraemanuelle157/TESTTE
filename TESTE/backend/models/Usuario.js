const mongoose = require('mongoose')

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },

  bio: { type: String, default: '' },
  avatar: { type: String, default: null },
  cover: { type: String, default: null },
  localizacao: { type: String, default: '' },

  website: { type: String, default: '' },
  generos: { type: [String], default: [] },

  // AGORA: controla acesso ao perfil
  perfilPrivado: { type: Boolean, default: false },

  // pode continuar existindo por compatibilidade de front,
  // mas não será mais usado como bloqueio global
  mostrarAtividade: { type: Boolean, default: true },

  seguindo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cantor'
  }],

  solicitacoesSeguir: [{
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    status: {
      type: String,
      enum: ['pendente', 'aceito', 'recusado'],
      default: 'pendente'
    }
  }],

  membroDesde: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Usuario', usuarioSchema)
