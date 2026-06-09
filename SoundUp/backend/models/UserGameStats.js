const mongoose = require('mongoose')

const UserGameStatsSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  },
  
  // Progresso de níveis por modo
  progresso: {
    'guess-song': {
      easy: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 } },
      medium: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 }, bloqueado: { type: Boolean, default: true } },
      hard: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 }, bloqueado: { type: Boolean, default: true } }
    },
    'guess-artist': {
      easy: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 } },
      medium: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 }, bloqueado: { type: Boolean, default: true } },
      hard: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 }, bloqueado: { type: Boolean, default: true } }
    },
    'complete-lyric': {
      easy: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 } },
      medium: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 }, bloqueado: { type: Boolean, default: true } },
      hard: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 }, bloqueado: { type: Boolean, default: true } }
    },
    'music-trivia': {
      easy: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 } },
      medium: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 }, bloqueado: { type: Boolean, default: true } },
      hard: { completado: { type: Boolean, default: false }, melhorPontuacao: { type: Number, default: 0 }, bloqueado: { type: Boolean, default: true } }
    }
  },
  
  // Estatísticas gerais
  estatisticas: {
    totalPartidas: { type: Number, default: 0 },
    totalPontos: { type: Number, default: 0 },
    totalMoedas: { type: Number, default: 0 },
    totalAcertos: { type: Number, default: 0 },
    totalErros: { type: Number, default: 0 },
    sequenciaVitorias: { type: Number, default: 0 },
    maiorSequencia: { type: Number, default: 0 },
    precisaoMedia: { type: Number, default: 0 }
  },
  
  // Conquistas
conquistas: [{
  id: String,
  titulo: String,
  descricao: String,
  icon: String,
  iconClass: String,
  desbloqueada: { type: Boolean, default: false },
  dataDesbloqueio: Date,
  resgatada: { type: Boolean, default: false },
  moedas: Number
}],

  // Recompensas diárias
  recompensasDiarias: {
    ultimaReivindicacao: Date,
    diaAtual: { type: Number, default: 0 }, // 1-7
    historico: [{
      dia: Number,
      reivindicado: Boolean,
      data: Date
    }]
  },
  
  // Itens da loja
inventario: [{
  itemId: String,
  nome: String,
  icon: String,
  tipo: { type: String, default: 'geral' },  // ← ADICIONAR
  comprado: { type: Boolean, default: true },
  ativo: { type: Boolean, default: true },   // ← ADICIONAR
  dataCompra: { type: Date, default: Date.now }
}],
  
  // Nível do jogador
  nivel: {
    atual: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpProximoNivel: { type: Number, default: 100 }
  }
}, {
  timestamps: true
})

// Método para calcular nível
UserGameStatsSchema.methods.adicionarXP = function(xpGanho) {
  this.nivel.xp += xpGanho

  let subiuNivel = false

  while (this.nivel.xp >= this.nivel.xpProximoNivel) {
    this.nivel.xp -= this.nivel.xpProximoNivel
    this.nivel.atual += 1
    this.nivel.xpProximoNivel = Math.floor(this.nivel.xpProximoNivel * 1.5)
    subiuNivel = true
  }

  return {
    subiuNivel,
    nivel: this.nivel.atual,
    xp: this.nivel.xp,
    xpProximo: this.nivel.xpProximoNivel
  }
}

UserGameStatsSchema.pre('save', function(next) {
  const modos = ['guess-song', 'guess-artist', 'complete-lyric', 'music-trivia'];
  const dificuldades = ['easy', 'medium', 'hard'];
  
  if (!this.progresso) this.progresso = {};
  
  modos.forEach(modo => {
    if (!this.progresso[modo]) this.progresso[modo] = {};
    dificuldades.forEach(diff => {
      if (!this.progresso[modo][diff]) {
        this.progresso[modo][diff] = { 
          completado: false, 
          melhorPontuacao: 0, 
          bloqueado: diff !== 'easy' 
        };
      }
    });
  });
  next();
});

module.exports = mongoose.model('UserGameStats', UserGameStatsSchema)