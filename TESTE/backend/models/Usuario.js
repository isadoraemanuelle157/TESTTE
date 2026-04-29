const mongoose = require('mongoose')

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },

  idade: { type: Number, min: 18, max: 100, default: null },

  bio: { type: String, default: '' },
  avatar: { type: String, default: null },
  cover: { type: String, default: null },
  localizacao: { type: String, default: '' },

  website: { type: String, default: '' },

  perfilPrivado: { type: Boolean, default: false },
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
  
  generos:[{
   type: mongoose.Schema.Types.ObjectId,
   ref:'Genero'
 }],

 artistasFavoritos:[{
   type: mongoose.Schema.Types.ObjectId,
   ref:'Cantor'
 }],

 vibesFavoritas:[{
   type: mongoose.Schema.Types.ObjectId,
   ref:'Vibe'
 }],

 onboardingCompleto:{
   type:Boolean,
   default:false
 },

  membroDesde: { type: Date, default: Date.now }
}, { 
  timestamps: { 
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt' 
  }
})

module.exports = mongoose.model('Usuario', usuarioSchema)
