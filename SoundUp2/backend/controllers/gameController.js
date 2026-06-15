  const gameService = require('../services/gameService')

  // ============================================
  // 🎮 MODOS DE JOGO
  // ============================================

  const getGameModes = async (req, res) => {
    try {
      const modes = Object.entries(gameService.GAME_CONFIG).map(([id, config]) => ({
        id,
        ...config,
        players: Math.floor(Math.random() * 5000) + 1000, // Simulado
        difficultyClass: 'medium'
      }))
      
      res.json({ modes })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  const getDifficulties = async (req, res) => {
    try {
      const { modo } = req.params
      const stats = await gameService.getUserGameStats(req.user.id)
      
      const difficulties = Object.entries(gameService.DIFICULTIES).map(([level, config]) => ({
        level,
        ...config,
        completed: stats.progresso[modo]?.[level]?.completado || false,
        locked: level !== 'easy' && (stats.progresso[modo]?.[level]?.bloqueado ?? true),
        bestScore: stats.progresso[modo]?.[level]?.melhorPontuacao || 0
      }))
      
      res.json({ difficulties })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // ============================================
  // 🚀 INICIAR JOGO
  // ============================================

  const startGame = async (req, res) => {
    try {
      const { modo, dificuldade } = req.body
      
      if (!modo || !dificuldade) {
        return res.status(400).json({ error: 'Modo e dificuldade são obrigatórios' })
      }
      
      // Se não tiver usuário autenticado, retorna pergunta demo/offline
      if (!req.user || !req.user.id) {
        const { gerarPergunta } = require('../services/gameService')
        const pergunta = await gerarPergunta(modo, dificuldade)
        
        return res.json({
          sessionId: 'demo-' + Date.now(),
          pergunta,
          config: {
            tempoLimite: 30,
            totalPerguntas: 10,
            perguntaAtual: 1
          },
          demo: true
        })
      }
      
      const result = await gameService.iniciarSessao(req.user.id, modo, dificuldade)
      
      res.json(result)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

  // ============================================
  // ✅ RESPONDER
  // ============================================

  const answerQuestion = async (req, res) => {
    try {
      const { sessionId, respostaIndex, tempoResposta, perguntaAtual, respostaCorreta, pontuacaoAtual, perguntaNum, totalPerguntas, modo, dificuldade } = req.body;
      
      if (sessionId === undefined || respostaIndex === undefined) {
        return res.status(400).json({ error: 'sessionId e respostaIndex são obrigatórios' });
      }
      
      // Modo demo - resposta local sem salvar no banco
      if (sessionId && sessionId.toString().startsWith('demo-')) {
        const { gerarPergunta, DIFICULTIES } = require('../services/gameService');
        
        // Verifica se a resposta está correta
        let isCorrect = false;
        if (respostaCorreta !== undefined && respostaCorreta !== null) {
          isCorrect = parseInt(respostaIndex) === parseInt(respostaCorreta);
        } else if (perguntaAtual?.respostaCorreta !== undefined) {
          isCorrect = parseInt(respostaIndex) === parseInt(perguntaAtual.respostaCorreta);
        } else {
          isCorrect = Math.random() > 0.5;
        }
        
        const diffConfig = DIFICULTIES[dificuldade || 'easy'] || { multiplicador: 1, tempo: 30 };
        const pontosBase = 100;
        const bonusTempo = Math.max(0, diffConfig.tempo - (parseInt(tempoResposta) || 0)) * 5;
        const pontosGanhos = isCorrect ? Math.floor((pontosBase + bonusTempo) * diffConfig.multiplicador) : 0;
        const moedasGanhas = isCorrect ? Math.floor(10 * diffConfig.multiplicador) : 0;
        
        const perguntaAtualNum = parseInt(perguntaNum) || parseInt(req.body.perguntaAtual) || 1;
        const totalPerguntasNum = parseInt(totalPerguntas) || 10;
        const pontuacaoAtualNum = parseInt(pontuacaoAtual) || 0;
        
        // Só gera próxima pergunta se não for a última
        let proximaPergunta = null;
        if (perguntaAtualNum < totalPerguntasNum) {
          proximaPergunta = await gerarPergunta(modo || 'guess-song', dificuldade || 'easy', sessionId);
        }
        
        return res.json({
          acertou: isCorrect,
          pontosGanhos,
          moedasGanhas,
          pontuacaoTotal: pontuacaoAtualNum + pontosGanhos,
          progresso: `${perguntaAtualNum}/${totalPerguntasNum}`,
          proximaPergunta,
          config: {
            tempoLimite: diffConfig.tempo,
            perguntaAtual: perguntaAtualNum + 1
          },
          demo: true,
          completado: perguntaAtualNum >= totalPerguntasNum
        });
      }
      
      const result = await gameService.responderPergunta(
        sessionId,
        parseInt(respostaIndex),
        parseInt(tempoResposta) || 0
      );
      
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  // ============================================
  // 📊 LEADERBOARD
  // ============================================

  const getLeaderboard = async (req, res) => {
    try {
      const { periodo = 'semana', limite = 50 } = req.query
      const leaderboard = await gameService.getLeaderboard(periodo, parseInt(limite))
      
      res.json({ leaderboard })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // ============================================
  // 🎁 RECOMPENSAS
  // ============================================

  const getDailyRewards = async (req, res) => {
    try {
      const rewards = await gameService.getDailyRewards(req.user.id)
      res.json(rewards)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

const claimDailyReward = async (req, res) => {
  try {
    const { dia } = req.body
    
    if (dia === undefined || dia === null) {
      return res.status(400).json({ error: 'O campo "dia" é obrigatório' })
    }
    
    const diaNum = parseInt(dia)
    if (isNaN(diaNum) || diaNum < 1 || diaNum > 7) {
      return res.status(400).json({ error: 'Dia deve ser um número entre 1 e 7' })
    }
    
    const result = await gameService.claimDailyReward(req.user.id, diaNum)
    res.json(result)
  } catch (error) {
    console.error('Erro ao reivindicar recompensa:', error.message)
    res.status(400).json({ error: error.message })
  }
}

  // ============================================
  // 🛒 LOJA
  // ============================================

const getShop = async (req, res) => {
  try {
    const userId = req.user?.id;
    let items;
    if (userId) {
      items = await gameService.getShopItems(userId);
    } else {
      items = gameService.LOJA_ITENS.map(item => ({
        ...item,
        possuido: false,
        podeComprar: false
      }));
    }
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const buyItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const result = await gameService.buyItem(req.user.id, itemId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

  // ============================================
  // 🏆 CONQUISTAS
  // ============================================

  const getAchievements = async (req, res) => {
    try {
      const achievements = await gameService.getAchievements(req.user.id)
      // Garante que cada conquista tem os campos que o frontend espera
      const mappedAchievements = achievements.map(a => ({
        ...a,
        desbloqueada: a.desbloqueada || false,
        resgatada: a.resgatada || false,
        claimable: (a.desbloqueada || false) && !(a.resgatada || false),
        iconClass: a.iconClass || 'fa-solid fa-medal',
        titulo: a.titulo || a.title,
        descricao: a.descricao || a.description,
        moedas: a.moedas || a.coins || 0
      }))
      res.json({ achievements: mappedAchievements })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  const claimAchievement = async (req, res) => {
    try {
      const { conquistaId } = req.body
      const result = await gameService.claimAchievement(req.user.id, conquistaId)
      res.json(result)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

  // ============================================
  // 📈 STATS
  // ============================================

  const getStats = async (req, res) => {
    try {
      const stats = await gameService.getUserGameStats(req.user.id)
      res.json(stats)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // ============================================
  // 🔥 ATIVIDADES AO VIVO
  // ============================================

  const getLiveActivities = async (req, res) => {
    try {
      const activities = await gameService.getLiveActivities()
      res.json({ activities })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

// ============================================
// 🔄 EQUIPAR/DESATIVAR ITENS
// ============================================

const equipItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const result = await gameService.equiparItem(req.user.id, itemId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const unequipItem = async (req, res) => {
  try {
    const { itemId } = req.body;
    const result = await gameService.desativarItem(req.user.id, itemId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getActiveInventory = async (req, res) => {
  try {
    const inventory = await gameService.getInventarioAtivo(req.user.id);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ⚡ ADICIONAR ISTO AQUI:
const getEquippedItems = async (req, res) => {
  try {
    const equipped = await gameService.getEquippedItems(req.user.id);
    res.json({ equipped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getGameModes,
  getDifficulties,
  startGame,
  answerQuestion,
  getLeaderboard,
  getDailyRewards,
  claimDailyReward,
  getShop,
  buyItem,
  equipItem,        // ← ADICIONAR
  unequipItem,      // ← ADICIONAR
  getActiveInventory,
   getEquippedItems,  // ← ADICIONAR
  getAchievements,
  claimAchievement,
  getStats,
  getLiveActivities
}