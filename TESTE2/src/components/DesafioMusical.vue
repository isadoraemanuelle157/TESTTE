<template>
  <div id="app" class="rhythm-quest">
    <!-- Background Effects -->
    <div class="ambient-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Navigation -->
    <nav class="nav-bar" :class="{ 'scrolled': isScrolled }">
      <div class="nav-container">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <span class="logo-text">SoundUp</span>
        </div>
       
        <div class="nav-links" :class="{ 'active': mobileMenuOpen }">
          <a href="#modes" class="nav-link">Modos</a>
          <a href="#leaderboard" class="nav-link">Ranking</a>
          <a href="#rewards" class="nav-link">Recompensas</a>
          <div class="user-coins" v-if="totalCoins > 0">
            <span class="coin-icon">🪙</span>
            <span class="coin-amount">{{ totalCoins }}</span>
          </div>
          <button class="btn-primary" @click="startGame">
            <span>Jogar Agora</span>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <button class="mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="pulse-dot"></span>
          <span>+50 Mil Jogadores Online</span>
        </div>
       
        <h1 class="hero-title">
          Desafie seus
          <span class="gradient-text">ouvidos</span>
          <br/>
          Domine a música
        </h1>
       
        <p class="hero-subtitle">
          Complete letras, adivinhe artistas e prove que você é o verdadeiro
          expert musical. Compita com amigos e conquiste o topo do ranking.
        </p>

        <div class="hero-actions">
          <button class="btn-glow" @click="scrollToGame">
            <span class="btn-content">
              <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Começar Desafio</span>
            </span>
            <div class="glow-effect"></div>
          </button>
         
          <button class="btn-outline" @click="showDemo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M10 8l6 4-6 4V8z"/>
            </svg>
            <span>Ver Demo</span>
          </button>
        </div>

        <!-- Live Activity Ticker -->
        <div class="activity-ticker">
          <div class="ticker-label">Últimas conquistas:</div>
          <div class="ticker-content">
            <div class="ticker-track" :style="{ animationPlayState: isPaused ? 'paused' : 'running' }">
              <div v-for="(activity, index) in [...activities, ...activities]" :key="index" class="ticker-item">
                <img :src="activity.avatar" :alt="activity.user" class="ticker-avatar">
                <span class="ticker-text">
                  <strong>{{ activity.user }}</strong> acertou <span class="highlight">{{ activity.song }}</span>
                </span>
                <span class="ticker-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hero Visual -->
      <div class="hero-visual">
        <div class="vinyl-record" :class="{ 'playing': isPlaying }">
          <div class="vinyl-grooves"></div>
          <div class="vinyl-label">
            <div class="label-center"></div>
          </div>
          <div class="tonearm" :class="{ 'active': isPlaying }"></div>
        </div>
       
        <div class="floating-cards">
          <div class="float-card card-1" :style="cardStyles[0]">
            <div class="card-icon">🎵</div>
            <div class="card-info">
              <div class="card-title">Complete a Música</div>
              <div class="card-meta">Nível Hard</div>
            </div>
          </div>
         
          <div class="float-card card-2" :style="cardStyles[1]">
            <div class="card-icon">🎤</div>
            <div class="card-info">
              <div class="card-title">Adivinhe o Artista</div>
              <div class="card-meta">Pop 2024</div>
            </div>
          </div>
         
          <div class="float-card card-3" :style="cardStyles[2]">
            <div class="card-icon">🎸</div>
            <div class="card-info">
              <div class="card-title">Adivinhe a Música</div>
              <div class="card-meta">Rock Clássico</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Game Modes Grid -->
    <section id="modes" class="modes-section">
      <div class="section-header">
        <h2 class="section-title">Escolha seu <span class="gradient-text">Desafio</span></h2>
        <p class="section-subtitle">Diferentes modalidades para testar todos os aspectos do seu conhecimento musical</p>
      </div>

      <div class="modes-grid">
        <div
          v-for="(mode, index) in gameModes"
          :key="mode.id"
          class="mode-card"
          :class="{ 'featured': mode.featured, 'hovered': hoveredMode === index }"
          @mouseenter="hoveredMode = index"
          @mouseleave="hoveredMode = null"
          @click="selectMode(mode)"
        >
          <div class="mode-bg" :style="{ backgroundImage: `url(${mode.bgImage})` }"></div>
          <div class="mode-overlay"></div>
         
          <div class="mode-content">
            <div class="mode-icon" :style="{ background: mode.gradient }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="mode.icon"></svg>
            </div>
           
            <h3 class="mode-title">{{ mode.name }}</h3>
            <p class="mode-description">{{ mode.description }}</p>
           
            <div class="mode-stats">
              <div class="stat">
                <span class="stat-value">{{ mode.players }}</span>
                <span class="stat-label">jogando</span>
              </div>
              <div class="stat">
                <span class="difficulty-badge" :class="mode.difficultyClass">{{ mode.difficulty }}</span>
                <span class="stat-label">dificuldade</span>
              </div>
            </div>

            <div class="mode-action">
              <span>Jogar Modo</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

          <div v-if="mode.featured" class="featured-badge">POPULAR</div>
        </div>
      </div>
    </section>

    <!-- Difficulty Selector Modal -->
    <div v-if="showDifficultyModal" class="modal-overlay" @click.self="showDifficultyModal = false">
      <div class="modal-content difficulty-modal">
        <h3>Escolha a Dificuldade</h3>
        <p>Selecione o nível de desafio para {{ selectedMode?.name }}</p>
       
        <div class="difficulty-options">
          <button
            v-for="diff in difficulties"
            :key="diff.level"
            class="difficulty-btn"
            :class="[diff.level, { 'completed': isDifficultyCompleted(diff.level) }]"
            @click="startGameWithDifficulty(diff)"
            :disabled="isDifficultyLocked(diff.level)"
          >
            <div class="diff-icon">{{ diff.icon }}</div>
            <div class="diff-info">
              <strong>{{ diff.name }}</strong>
              <span>{{ diff.description }}</span>
            </div>
            <div class="diff-status">
              <span v-if="isDifficultyCompleted(diff.level)" class="completed-badge">✓ Completo</span>
              <span v-else-if="isDifficultyLocked(diff.level)" class="locked-badge">🔒 Bloqueado</span>
              <div v-else class="diff-reward">
                <span class="reward-multiplier">{{ diff.multiplier }}x</span>
                <small>recompensa</small>
              </div>
            </div>
          </button>
        </div>
       
        <button class="btn-close" @click="showDifficultyModal = false">Cancelar</button>
      </div>
    </div>

    <!-- Active Game Interface -->
    <section id="game-demo" class="game-section" v-if="currentGame">
      <div class="game-container">
        <div class="game-header">
          <button class="btn-back" @click="exitGame">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="game-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${(currentQuestion / totalQuestions) * 100}%` }"></div>
            </div>
            <span class="progress-text">{{ currentQuestion }}/{{ totalQuestions }}</span>
          </div>
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">Pontos</span>
              <span class="score-value">{{ score }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Moedas</span>
              <span class="coin-value">🪙 {{ sessionCoins }}</span>
            </div>
          </div>
        </div>

        <div class="game-content">
          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Carregando música...</p>
            <p class="loading-subtext">Isso pode levar alguns segundos</p>
          </div>

          <!-- Error State -->
          <div v-else-if="loadError" class="error-state">
            <p>⚠️ Erro ao carregar músicas da API</p>
            <p class="error-subtext">Usando modo offline com músicas locais...</p>
            <button @click="useOfflineMode">Jogar Offline</button>
          </div>

          <!-- Game Completed State -->
          <div v-else-if="gameCompleted" class="game-completed">
            <div class="completion-animation">
              <div class="trophy">🏆</div>
              <h2>Desafio Completado!</h2>
              <p>Você completou o nível {{ currentDifficulty?.name }}</p>
              
              <div class="completion-stats">
                <div class="comp-stat">
                  <span class="comp-label">Pontuação</span>
                  <span class="comp-value">{{ score }}</span>
                </div>
                <div class="comp-stat">
                  <span class="comp-label">Moedas</span>
                  <span class="comp-value">🪙 {{ sessionCoins }}</span>
                </div>
                <div class="comp-stat">
                  <span class="comp-label">Precisão</span>
                  <span class="comp-value">{{ Math.round((correctAnswers / totalQuestions) * 100) }}%</span>
                </div>
              </div>

              <div class="completion-actions">
                <button 
                  v-if="canAdvanceLevel" 
                  class="btn-advance" 
                  @click="advanceToNextLevel"
                >
                  <span>Próximo Nível: {{ nextDifficulty?.name }}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
                
                <button class="btn-restart" @click="restartSameLevel">
                  <span>Jogar Novamente</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
                
                <button class="btn-menu" @click="exitToMenu">
                  <span>Menu Principal</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Game Content -->
          <template v-else>
            <!-- ADIVINHE A MÚSICA (Preview) - CORRIGIDO -->
            <div v-if="currentGame.id === 'guess-song'" class="question-card">
              <div class="mode-indicator">
                <span class="mode-tag">🎧 Adivinhe a Música</span>
                <span class="difficulty-tag" :class="currentDifficulty?.level">{{ currentDifficulty?.name }}</span>
              </div>
             
              <div class="song-challenge">
                <div class="vinyl-player" :class="{ 'playing': isAudioPlaying }">
                  <div class="vinyl-disc">
                    <div class="disc-grooves"></div>
                    <div class="disc-label">
                      <img v-if="currentTrack?.album?.cover_medium" :src="currentTrack.album.cover_medium" alt="Album">
                      <span v-else>?</span>
                    </div>
                  </div>
                  <div class="tonearm-mini"></div>
                </div>
               
                <div class="audio-visualizer-large" v-if="isAudioPlaying">
                  <div v-for="n in 12" :key="n" class="viz-bar" :style="{ animationDelay: `${n * 0.1}s` }"></div>
                </div>
               
                <div v-else class="play-prompt">
                  <button class="btn-play-large" @click="toggleAudio">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>Tocar Preview</span>
                  </button>
                  <p class="prompt-text">Escute o trecho e adivinhe a música!</p>
                </div>

                <div class="track-hints" v-if="currentTrack">
                  <div class="hint-badge" v-if="currentDifficulty?.level !== 'easy'">
                    <span>Ano: {{ currentTrack.release_date?.split('-')[0] || '?' }}</span>
                  </div>
                  <div class="hint-badge" v-if="currentDifficulty?.level === 'hard'">
                    <span>Álbum: {{ currentTrack.album?.title }}</span>
                  </div>
                </div>
              </div>

              <div class="timer-bar">
                <div class="timer-fill" :style="{ width: `${timerWidth}%` }"></div>
              </div>
            </div>

            <!-- ADIVINHE O ARTISTA - CORRIGIDO: Preview apenas em Easy/Medium -->
            <div v-else-if="currentGame.id === 'guess-artist'" class="question-card">
              <div class="mode-indicator">
                <span class="mode-tag">🎤 Adivinhe o Artista</span>
                <span class="difficulty-tag" :class="currentDifficulty?.level">{{ currentDifficulty?.name }}</span>
              </div>
             
              <div class="artist-challenge">
                <div class="voice-wave-container">
                  <div class="voice-avatar" :class="{ 'speaking': isAudioPlaying }">
                    <div class="avatar-glow"></div>
                    <img v-if="currentTrack?.artist?.picture_medium" :src="currentTrack.artist.picture_medium" :alt="currentTrack.artist.name" class="artist-blur">
                    <span v-else class="mic-icon">🎤</span>
                  </div>
                  <div class="voice-waves" v-if="isAudioPlaying">
                    <div v-for="n in 20" :key="n" class="voice-bar"
                         :style="{ animationDelay: `${n * 0.05}s`, height: `${Math.random() * 60 + 20}%` }">
                    </div>
                  </div>
                </div>
               
                <div class="voice-clue">
                  <p class="clue-text">"{{ currentTrack?.title || 'Carregando...' }}"</p>
                  <span class="clue-hint" v-if="currentDifficulty?.level !== 'easy'">
                    Álbum: {{ currentTrack?.album?.title }}
                  </span>
                </div>

                <!-- Preview apenas em Easy e Medium -->
                <button 
                  v-if="showArtistPreviewButton"
                  class="btn-play-voice" 
                  @click="toggleAudio" 
                  :class="{ 'playing': isAudioPlaying }"
                >
                  <svg v-if="!isAudioPlaying" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <span v-else>Ouvindo...</span>
                </button>
                
                <p v-else class="no-preview-hint">
                  🎵 Modo Difícil: Sem preview de áudio!
                </p>
              </div>

              <div class="timer-bar">
                <div class="timer-fill" :style="{ width: `${timerWidth}%` }"></div>
              </div>
            </div>

            <!-- COMPLETE A MÚSICA - MELHORADO -->
            <div v-else-if="currentGame.id === 'complete-lyric'" class="question-card">
              <div class="mode-indicator">
                <span class="mode-tag">🎵 Complete a Música</span>
                <span class="difficulty-tag" :class="currentDifficulty?.level">{{ currentDifficulty?.name }}</span>
              </div>
             
              <div class="lyrics-challenge">
                <div class="audio-mini-player">
                  <button class="play-btn" @click="toggleAudio">
                    <svg v-if="!isAudioPlaying" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  </button>
                  <div class="audio-waves" v-if="isAudioPlaying">
                    <span v-for="n in 4" :key="n"></span>
                  </div>
                </div>

                <div class="title-puzzle">
                  <h3 class="puzzle-title">Qual é o título completo?</h3>
                  <div class="title-display">
                    <span
                      v-for="(word, idx) in maskedTitle"
                      :key="idx"
                      class="word-slot"
                      :class="{ 'hidden': word.hidden && !showAnswer, 'revealed': word.revealed || showAnswer }"
                    >
                      <template v-if="word.hidden && !showAnswer">
                        <span class="blank">___</span>
                      </template>
                      <template v-else>
                        {{ word.text }}
                      </template>
                    </span>
                  </div>
                  <p class="artist-hint" v-if="currentDifficulty?.level !== 'hard'">
                    Artista: {{ currentTrack?.artist?.name }}
                  </p>
                </div>
              </div>

              <div class="timer-bar">
                <div class="timer-fill" :style="{ width: `${timerWidth}%` }"></div>
              </div>
            </div>

            <!-- QUIZ MUSICAL - MAIS PERGUNTAS -->
            <div v-else-if="currentGame.id === 'music-trivia'" class="question-card">
              <div class="mode-indicator">
                <span class="mode-tag">🎸 Quiz Musical</span>
                <span class="difficulty-tag" :class="currentDifficulty?.level">{{ currentDifficulty?.name }}</span>
              </div>
             
              <div class="trivia-challenge">
                <div class="trivia-category" :style="{ background: currentTrivia?.categoryColor }">
                  {{ currentTrivia?.category }}
                </div>
               
                <div class="trivia-question">
                  <div class="question-icon">{{ currentTrivia?.icon }}</div>
                  <h3>{{ currentTrivia?.question }}</h3>
                </div>
              </div>

              <div class="timer-bar">
                <div class="timer-fill" :style="{ width: `${timerWidth}%` }"></div>
              </div>
            </div>

            <!-- ANSWERS GRID -->
            <div class="answers-grid" :class="{ 'single': currentOptions.length === 1 }">
              <button
                v-for="(option, idx) in currentOptions"
                :key="idx"
                class="answer-btn"
                :class="{
                  'selected': selectedAnswer === idx,
                  'correct': showAnswer && idx === correctAnswerIndex,
                  'wrong': showAnswer && selectedAnswer === idx && idx !== correctAnswerIndex
                }"
                @click="selectAnswer(idx)"
                :disabled="showAnswer || !currentTrack"
              >
                <span class="option-label">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                <span class="option-text">{{ option }}</span>
              </button>
            </div>

            <!-- FEEDBACK -->
            <div v-if="showAnswer" class="answer-feedback" :class="{ 'correct': selectedAnswer === correctAnswerIndex }">
              <div class="feedback-icon">{{ selectedAnswer === correctAnswerIndex ? '✅' : '❌' }}</div>
              <div class="feedback-text">
                <strong>{{ selectedAnswer === correctAnswerIndex ? 'Correto!' : 'Errado!' }}</strong>
                <span v-if="selectedAnswer === correctAnswerIndex">
                  +{{ calculatePoints() }} pontos / 🪙 {{ calculateCoins() }} moedas
                </span>
                <span v-else>Era: {{ getCorrectAnswerText() }}</span>
              </div>
              <button class="btn-next" @click="nextQuestion">Próxima →</button>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Rewards Section -->
    <section id="rewards" class="rewards-section">
      <div class="section-header">
        <h2 class="section-title">Suas <span class="gradient-text">Recompensas</span></h2>
        <p class="section-subtitle">Ganhe moedas e desbloqueie conquistas jogando</p>
      </div>

      <div class="rewards-content">
        <!-- Stats Card -->
        <div class="stats-card">
          <h3>Seu Progresso</h3>
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-icon">🪙</span>
              <span class="stat-number">{{ totalCoins }}</span>
              <span class="stat-label">Moedas Totais</span>
            </div>
            <div class="stat-box">
              <span class="stat-icon">⭐</span>
              <span class="stat-number">{{ totalScore }}</span>
              <span class="stat-label">Pontuação Máxima</span>
            </div>
            <div class="stat-box">
              <span class="stat-icon">🔥</span>
              <span class="stat-number">{{ streak }}</span>
              <span class="stat-label">Dias Seguidos</span>
            </div>
            <div class="stat-box">
              <span class="stat-icon">🎯</span>
              <span class="stat-number">{{ accuracy }}%</span>
              <span class="stat-label">Precisão</span>
            </div>
          </div>
        </div>

        <!-- Daily Rewards -->
        <div class="daily-rewards">
          <h3>Recompensa Diária</h3>
          <div class="rewards-track">
            <div
              v-for="(day, idx) in dailyRewards"
              :key="idx"
              class="reward-day"
              :class="{
                'claimed': day.claimed,
                'available': day.available && !day.claimed && canClaimDaily,
                'locked': !day.available && !day.claimed
              }"
              @click="claimDailyReward(day)"
            >
              <div class="day-number">Dia {{ day.day }}</div>
              <div class="reward-icon">{{ day.icon }}</div>
              <div class="reward-amount">🪙 {{ day.coins }}</div>
              <div v-if="day.claimed" class="claimed-badge">✓</div>
            </div>
          </div>
          <p class="reward-hint" v-if="!canClaimDaily">
            Volte amanhã para mais recompensas! Próximo resgate em: {{ nextClaimTime }}
          </p>
          <p class="reward-hint" v-else-if="!dailyRewards.find(d => d.available && !d.claimed)">
            Clique no próximo dia disponível para resgatar!
          </p>
        </div>

        <!-- Achievements -->
        <div class="achievements-section">
          <h3>Conquistas</h3>
          <div class="achievements-grid">
            <div
              v-for="(achievement, idx) in achievements"
              :key="idx"
              class="achievement-card"
              :class="{ 'unlocked': achievement.unlocked, 'claimable': achievement.claimable && !achievement.claimed }"
              @click="claimAchievement(achievement)"
            >
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <h4>{{ achievement.title }}</h4>
                <p>{{ achievement.description }}</p>
                <div class="achievement-progress" v-if="!achievement.unlocked">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${(achievement.current/achievement.total)*100}%` }"></div>
                  </div>
                  <span>{{ achievement.current }}/{{ achievement.total }}</span>
                </div>
                <div class="achievement-reward" v-if="achievement.unlocked && !achievement.claimed">
                  <span>🪙 {{ achievement.coins }}</span>
                  <button class="btn-claim">Resgatar</button>
                </div>
                <div class="achievement-claimed" v-else-if="achievement.claimed">
                  <span>✓ Resgatado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Shop Preview -->
        <div class="shop-preview">
          <h3>Loja de Recompensas</h3>
          <p>Use suas moedas para desbloquear itens exclusivos</p>
          <div class="shop-items">
            <div v-for="(item, idx) in shopItems" :key="idx" class="shop-item" :class="{ 'owned': item.owned }">
              <div class="item-icon">{{ item.icon }}</div>
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p>{{ item.description }}</p>
              </div>
              <button
                class="btn-buy"
                :class="{ 'owned': item.owned, 'affordable': totalCoins >= item.price && !item.owned }"
                @click="buyItem(item)"
                :disabled="item.owned || totalCoins < item.price"
              >
                <span v-if="item.owned">Adquirido</span>
                <span v-else>🪙 {{ item.price }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Leaderboard Section -->
    <section id="leaderboard" class="leaderboard-section">
      <div class="section-header">
        <h2 class="section-title">Hall da <span class="gradient-text">Fama</span></h2>
        <p class="section-subtitle">Os melhores jogadores desta semana</p>
      </div>

      <div class="leaderboard-container">
        <div class="podium">
          <div class="podium-place second">
            <div class="podium-avatar">
              <img src="https://i.pravatar.cc/150?img=12" alt="2nd">
              <div class="place-badge">2</div>
            </div>
            <div class="podium-info">
              <h4>Ana Beatriz</h4>
              <span class="podium-score">12.450 pts</span>
            </div>
            <div class="podium-base"></div>
          </div>
         
          <div class="podium-place first">
            <div class="crown">👑</div>
            <div class="podium-avatar">
              <img src="https://i.pravatar.cc/150?img=11" alt="1st">
              <div class="place-badge">1</div>
            </div>
            <div class="podium-info">
              <h4>Carlos Rock</h4>
              <span class="podium-score">15.890 pts</span>
            </div>
            <div class="podium-base"></div>
          </div>
         
          <div class="podium-place third">
            <div class="podium-avatar">
              <img src="https://i.pravatar.cc/150?img=5" alt="3rd">
              <div class="place-badge">3</div>
            </div>
            <div class="podium-info">
              <h4>Maria Pop</h4>
              <span class="podium-score">11.200 pts</span>
            </div>
            <div class="podium-base"></div>
          </div>
        </div>

        <div class="leaderboard-list">
          <div
            v-for="(player, index) in leaderboard"
            :key="index"
            class="leaderboard-item"
            :class="{ 'highlight': index === 0 }"
          >
            <span class="rank">{{ index + 4 }}</span>
            <img :src="player.avatar" :alt="player.name" class="player-avatar">
            <div class="player-info">
              <span class="player-name">{{ player.name }}</span>
              <span class="player-status">{{ player.status }}</span>
            </div>
            <div class="player-stats">
              <span class="player-score">{{ player.score }}</span>
              <span class="player-trend" :class="player.trend">
                {{ player.trend === 'up' ? '↑' : player.trend === 'down' ? '↓' : '→' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Level Up Modal -->
    <div v-if="showLevelUp" class="modal-overlay level-up">
      <div class="modal-content">
        <div class="level-up-animation">
          <div class="level-badge">LEVEL UP!</div>
          <h2>Parabéns!</h2>
          <p>Você subiu de nível!</p>
          <div class="rewards-gained">
            <span>🪙 +{{ levelUpRewards.coins }}</span>
            <span>⭐ +{{ levelUpRewards.xp }} XP</span>
          </div>
          <button @click="showLevelUp = false">Continuar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// MÚSICAS LOCAIS - Fallback quando API falhar
const OFFLINE_TRACKS = {
  // Músicas populares para "Adivinhe a Música"
  guessSong: [
    { id: 1, title: "Blinding Lights", artist: { name: "The Weeknd", id: 1 }, album: { title: "After Hours", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/2e018122cb56986277102d2041a592c8/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-1.dzcdn.net/stream/c-1ed50e5b3118c99be858fc305609e62a-3.mp3", release_date: "2020-03-20" },
    { id: 2, title: "Shape of You", artist: { name: "Ed Sheeran", id: 2 }, album: { title: "÷ (Divide)", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/3c5a8a1e17472e20f37526c0a2ae9142/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-4.dzcdn.net/stream/c-4d8f3b4f9b4c5c5b5b5b5b5b5b5b5b5-2.mp3", release_date: "2017-01-06" },
    { id: 3, title: "Someone Like You", artist: { name: "Adele", id: 3 }, album: { title: "21", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/44b64b3b5e9b6c1b1b1b1b1b1b1b1b1b/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-2.dzcdn.net/stream/c-2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d-1.mp3", release_date: "2011-01-24" },
    { id: 4, title: "Uptown Funk", artist: { name: "Mark Ronson ft. Bruno Mars", id: 4 }, album: { title: "Uptown Special", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-3.dzcdn.net/stream/c-3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c-4.mp3", release_date: "2014-11-10" },
    { id: 5, title: "Bad Guy", artist: { name: "Billie Eilish", id: 5 }, album: { title: "When We All Fall Asleep", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-5.dzcdn.net/stream/c-5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e-2.mp3", release_date: "2019-03-29" },
    { id: 6, title: "Perfect", artist: { name: "Ed Sheeran", id: 2 }, album: { title: "÷ (Divide)", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/3c5a8a1e17472e20f37526c0a2ae9142/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-6.dzcdn.net/stream/c-6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f-3.mp3", release_date: "2017-03-03" },
    { id: 7, title: "Levitating", artist: { name: "Dua Lipa", id: 6 }, album: { title: "Future Nostalgia", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/7g7g7g7g7g7g7g7g7g7g7g7g7g7g7g7g/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-7.dzcdn.net/stream/c-7g7g7g7g7g7g7g7g7g7g7g7g7g7g7g7g-1.mp3", release_date: "2020-03-27" },
    { id: 8, title: "As It Was", artist: { name: "Harry Styles", id: 7 }, album: { title: "Harry's House", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/8h8h8h8h8h8h8h8h8h8h8h8h8h8h8h8h/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-8.dzcdn.net/stream/c-8h8h8h8h8h8h8h8h8h8h8h8h8h8h8h8h-2.mp3", release_date: "2022-04-01" },
    { id: 9, title: "Stay", artist: { name: "The Kid LAROI & Justin Bieber", id: 8 }, album: { title: "F*CK LOVE 3", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/9i9i9i9i9i9i9i9i9i9i9i9i9i9i9i9i/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-9.dzcdn.net/stream/c-9i9i9i9i9i9i9i9i9i9i9i9i9i9i9i9i-4.mp3", release_date: "2021-07-09" },
    { id: 10, title: "Heat Waves", artist: { name: "Glass Animals", id: 9 }, album: { title: "Dreamland", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/0j0j0j0j0j0j0j0j0j0j0j0j0j0j0j0j/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-0.dzcdn.net/stream/c-0j0j0j0j0j0j0j0j0j0j0j0j0j0j0j0j-1.mp3", release_date: "2020-06-29" }
  ],
  
  // Artistas variados para "Adivinhe o Artista"
  guessArtist: [
    { id: 11, title: "Can't Feel My Face", artist: { name: "The Weeknd", id: 1, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a/250x250-000000-80-0-0.jpg" }, album: { title: "Beauty Behind the Madness", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-1.dzcdn.net/stream/c-1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a-2.mp3", release_date: "2015-08-28" },
    { id: 12, title: "Shake It Off", artist: { name: "Taylor Swift", id: 10, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c/250x250-000000-80-0-0.jpg" }, album: { title: "1989", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-2.dzcdn.net/stream/c-2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c-3.mp3", release_date: "2014-08-18" },
    { id: 13, title: "God's Plan", artist: { name: "Drake", id: 11, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e/250x250-000000-80-0-0.jpg" }, album: { title: "Scorpion", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f3f/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-3.dzcdn.net/stream/c-3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e-1.mp3", release_date: "2018-01-19" },
    { id: 14, title: "Therefore I Am", artist: { name: "Billie Eilish", id: 5, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/4g4g4g4g4g4g4g4g4g4g4g4g4g4g4g4g/250x250-000000-80-0-0.jpg" }, album: { title: "Happier Than Ever", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/4h4h4h4h4h4h4h4h4h4h4h4h4h4h4h4h/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-4.dzcdn.net/stream/c-4g4g4g4g4g4g4g4g4g4g4g4g4g4g4g4g-2.mp3", release_date: "2020-11-12" },
    { id: 15, title: "Photograph", artist: { name: "Ed Sheeran", id: 2, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/5i5i5i5i5i5i5i5i5i5i5i5i5i5i5i5i/250x250-000000-80-0-0.jpg" }, album: { title: "x (Multiply)", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/5j5j5j5j5j5j5j5j5j5j5j5j5j5j5j5j/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-5.dzcdn.net/stream/c-5i5i5i5i5i5i5i5i5i5i5i5i5i5i5i5i-3.mp3", release_date: "2014-06-20" },
    { id: 16, title: "7 Rings", artist: { name: "Ariana Grande", id: 12, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/6k6k6k6k6k6k6k6k6k6k6k6k6k6k6k6k/250x250-000000-80-0-0.jpg" }, album: { title: "thank u, next", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/6l6l6l6l6l6l6l6l6l6l6l6l6l6l6l6l/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-6.dzcdn.net/stream/c-6k6k6k6k6k6k6k6k6k6k6k6k6k6k6k6k-1.mp3", release_date: "2019-01-18" },
    { id: 17, title: "Watermelon Sugar", artist: { name: "Harry Styles", id: 7, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/7m7m7m7m7m7m7m7m7m7m7m7m7m7m7m7m/250x250-000000-80-0-0.jpg" }, album: { title: "Fine Line", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/7n7n7n7n7n7n7n7n7n7n7n7n7n7n7n7n/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-7.dzcdn.net/stream/c-7m7m7m7m7m7m7m7m7m7m7m7m7m7m7m7m-2.mp3", release_date: "2019-11-13" },
    { id: 18, title: "Don't Start Now", artist: { name: "Dua Lipa", id: 6, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/8o8o8o8o8o8o8o8o8o8o8o8o8o8o8o8o/250x250-000000-80-0-0.jpg" }, album: { title: "Future Nostalgia", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-8.dzcdn.net/stream/c-8o8o8o8o8o8o8o8o8o8o8o8o8o8o8o8o-3.mp3", release_date: "2019-10-31" },
    { id: 19, title: "Peaches", artist: { name: "Justin Bieber", id: 13, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q/250x250-000000-80-0-0.jpg" }, album: { title: "Justice", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r9r/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-9.dzcdn.net/stream/c-9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q-1.mp3", release_date: "2021-03-19" },
    { id: 20, title: "Drivers License", artist: { name: "Olivia Rodrigo", id: 14, picture_medium: "https://e-cdns-images.dzcdn.net/images/artist/0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s/250x250-000000-80-0-0.jpg" }, album: { title: "SOUR", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t0t/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-0.dzcdn.net/stream/c-0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s0s-2.mp3", release_date: "2021-01-08" }
  ],
  
  // Títulos curtos para "Complete a Música"
  completeLyric: [
    { id: 21, title: "Let It Be", artist: { name: "The Beatles", id: 15 }, album: { title: "Let It Be", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/1u1u1u1u1u1u1u1u1u1u1u1u1u1u1u1u/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-1.dzcdn.net/stream/c-1u1u1u1u1u1u1u1u1u1u1u1u1u1u1u1u-1.mp3", release_date: "1970-03-06" },
    { id: 22, title: "Hey Jude", artist: { name: "The Beatles", id: 15 }, album: { title: "Hey Jude", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/2v2v2v2v2v2v2v2v2v2v2v2v2v2v2v2v/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-2.dzcdn.net/stream/c-2v2v2v2v2v2v2v2v2v2v2v2v2v2v2v2v-2.mp3", release_date: "1968-08-26" },
    { id: 23, title: "Bohemian Rhapsody", artist: { name: "Queen", id: 16 }, album: { title: "A Night at the Opera", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/3w3w3w3w3w3w3w3w3w3w3w3w3w3w3w3w/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-3.dzcdn.net/stream/c-3w3w3w3w3w3w3w3w3w3w3w3w3w3w3w3w-3.mp3", release_date: "1975-10-31" },
    { id: 24, title: "Hotel California", artist: { name: "Eagles", id: 17 }, album: { title: "Hotel California", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-4.dzcdn.net/stream/c-4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x4x-1.mp3", release_date: "1976-12-08" },
    { id: 25, title: "Sweet Child O' Mine", artist: { name: "Guns N' Roses", id: 18 }, album: { title: "Appetite for Destruction", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-5.dzcdn.net/stream/c-5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y5y-2.mp3", release_date: "1987-07-21" },
    { id: 26, title: "Imagine", artist: { name: "John Lennon", id: 19 }, album: { title: "Imagine", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-6.dzcdn.net/stream/c-6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z6z-3.mp3", release_date: "1971-10-11" },
    { id: 27, title: "Billie Jean", artist: { name: "Michael Jackson", id: 20 }, album: { title: "Thriller", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-7.dzcdn.net/stream/c-7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a7a-1.mp3", release_date: "1983-01-02" },
    { id: 28, title: "Like a Prayer", artist: { name: "Madonna", id: 21 }, album: { title: "Like a Prayer", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-8.dzcdn.net/stream/c-8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b8b-2.mp3", release_date: "1989-03-03" },
    { id: 29, title: "Smells Like Teen Spirit", artist: { name: "Nirvana", id: 22 }, album: { title: "Nevermind", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-9.dzcdn.net/stream/c-9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c-3.mp3", release_date: "1991-09-24" },
    { id: 30, title: "Wonderwall", artist: { name: "Oasis", id: 23 }, album: { title: "(What's the Story) Morning Glory?", cover_medium: "https://e-cdns-images.dzcdn.net/images/cover/0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d/250x250-000000-80-0-0.jpg" }, preview: "https://cdns-preview-0.dzcdn.net/stream/c-0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d0d-1.mp3", release_date: "1995-10-30" }
  ],
  
  // Músicas clássicas para "Quiz Musical"
  musicTrivia: [
    { id: 31, title: "Thriller", artist: { name: "Michael Jackson", id: 20 }, album: { title: "Thriller", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-1.dzcdn.net/stream/c-1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e-1.mp3", release_date: "1982-11-30" },
    { id: 32, title: "Like a Virgin", artist: { name: "Madonna", id: 21 }, album: { title: "Like a Virgin", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-2.dzcdn.net/stream/c-2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f-2.mp3", release_date: "1984-11-12" },
    { id: 33, title: "Purple Rain", artist: { name: "Prince", id: 24 }, album: { title: "Purple Rain", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/3g3g3g3g3g3g3g3g3g3g3g3g3g3g3g3g/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-3.dzcdn.net/stream/c-3g3g3g3g3g3g3g3g3g3g3g3g3g3g3g3g-3.mp3", release_date: "1984-06-25" },
    { id: 34, title: "Sweet Dreams", artist: { name: "Eurythmics", id: 25 }, album: { title: "Sweet Dreams", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/4h4h4h4h4h4h4h4h4h4h4h4h4h4h4h4h/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-4.dzcdn.net/stream/c-4h4h4h4h4h4h4h4h4h4h4h4h4h4h4h4h-1.mp3", release_date: "1983-01-21" },
    { id: 35, title: "Take On Me", artist: { name: "a-ha", id: 26 }, album: { title: "Hunting High and Low", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/5i5i5i5i5i5i5i5i5i5i5i5i5i5i5i5i/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-5.dzcdn.net/stream/c-5i5i5i5i5i5i5i5i5i5i5i5i5i5i5i5i-2.mp3", release_date: "1984-10-19" },
    { id: 36, title: "Eye of the Tiger", artist: { name: "Survivor", id: 27 }, album: { title: "Eye of the Tiger", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-6.dzcdn.net/stream/c-6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j6j-3.mp3", release_date: "1982-06-14" },
    { id: 37, title: "I Want to Break Free", artist: { name: "Queen", id: 16 }, album: { title: "The Works", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/7k7k7k7k7k7k7k7k7k7k7k7k7k7k7k7k/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-7.dzcdn.net/stream/c-7k7k7k7k7k7k7k7k7k7k7k7k7k7k7k7k-1.mp3", release_date: "1984-04-02" },
    { id: 38, title: "Girls Just Want to Have Fun", artist: { name: "Cyndi Lauper", id: 28 }, album: { title: "She's So Unusual", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/8l8l8l8l8l8l8l8l8l8l8l8l8l8l8l8l/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-8.dzcdn.net/stream/c-8l8l8l8l8l8l8l8l8l8l8l8l8l8l8l8l-2.mp3", release_date: "1983-09-06" },
    { id: 39, title: "Wake Me Up Before You Go-Go", artist: { name: "Wham!", id: 29 }, album: { title: "Make It Big", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/9m9m9m9m9m9m9m9m9m9m9m9m9m9m9m9m/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-9.dzcdn.net/stream/c-9m9m9m9m9m9m9m9m9m9m9m9m9m9m9m9m-3.mp3", release_date: "1984-05-14" },
    { id: 40, title: "Tainted Love", artist: { name: "Soft Cell", id: 30 }, album: { title: "Non-Stop Erotic Cabaret", cover_small: "https://e-cdns-images.dzcdn.net/images/cover/0n0n0n0n0n0n0n0n0n0n0n0n0n0n0n0n/56x56-000000-80-0-0.jpg" }, preview: "https://cdns-preview-0.dzcdn.net/stream/c-0n0n0n0n0n0n0n0n0n0n0n0n0n0n0n0n-1.mp3", release_date: "1981-07-07" }
  ]
};

// CORS Proxies alternativos
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/'
];

const DEEZER_API = 'https://api.deezer.com';

// MAIS PERGUNTAS PARA O QUIZ
const TRIVIA_QUESTIONS = [
  {
    category: 'História',
    categoryColor: '#e74c3c',
    icon: '📚',
    question: 'Qual artista tem o recorde de mais Grammys ganhos?',
    options: ['Beyoncé', 'Michael Jackson', 'Georg Solti', 'Alison Krauss'],
    correct: 2
  },
  {
    category: 'Recordes',
    categoryColor: '#f39c12',
    icon: '🏆',
    question: 'Qual música ficou mais tempo em #1 na Billboard?',
    options: ['Old Town Road', 'Despacito', 'One Sweet Day', 'Uptown Funk'],
    correct: 0
  },
  {
    category: 'Curiosidades',
    categoryColor: '#9b59b6',
    icon: '💡',
    question: 'Qual é o álbum mais vendido de todos os tempos?',
    options: ['Thriller', 'Back in Black', 'The Dark Side of the Moon', 'Rumours'],
    correct: 0
  },
  {
    category: 'Rock',
    categoryColor: '#e67e22',
    icon: '🎸',
    question: 'Qual banda é conhecida como "Os Fab Four"?',
    options: ['The Rolling Stones', 'The Beatles', 'Led Zeppelin', 'Pink Floyd'],
    correct: 1
  },
  {
    category: 'Pop',
    categoryColor: '#3498db',
    icon: '🎤',
    question: 'Quem é conhecido como o "Rei do Pop"?',
    options: ['Elvis Presley', 'Prince', 'Michael Jackson', 'Justin Timberlake'],
    correct: 2
  },
  {
    category: 'Brasil',
    categoryColor: '#2ecc71',
    icon: '🇧🇷',
    question: 'Quem compôs "Garota de Ipanema"?',
    options: ['Caetano Veloso', 'Antônio Carlos Jobim', 'Gilberto Gil', 'Chico Buarque'],
    correct: 1
  },
  {
    category: 'Instrumentos',
    categoryColor: '#1abc9c',
    icon: '🎹',
    question: 'Qual instrumento Beethoven continuou a compor mesmo após ficar surdo?',
    options: ['Violino', 'Piano', 'Violoncelo', 'Flauta'],
    correct: 1
  },
  {
    category: 'Hip Hop',
    categoryColor: '#34495e',
    icon: '🎧',
    question: 'Quem é considerado o "Rei do Hip Hop"?',
    options: ['Tupac', 'The Notorious B.I.G.', 'Jay-Z', 'Eminem'],
    correct: 2
  },
  {
    category: 'Anos 80',
    categoryColor: '#e91e63',
    icon: '🕺',
    question: 'Qual música de Queen foi usada no filme "Wayne\'s World"?',
    options: ['We Will Rock You', 'Bohemian Rhapsody', 'Another One Bites the Dust', 'Don\'t Stop Me Now'],
    correct: 1
  },
  {
    category: 'Prêmios',
    categoryColor: '#9c27b0',
    icon: '🏅',
    question: 'Qual foi o primeiro videoclipe a passar na MTV?',
    options: ['Video Killed the Radio Star', 'Billie Jean', 'Money for Nothing', 'Vogue'],
    correct: 0
  },
  {
    category: 'Rock',
    categoryColor: '#ff5722',
    icon: '🤘',
    question: 'Em que ano o cantor Elvis Presley faleceu?',
    options: ['1975', '1976', '1977', '1978'],
    correct: 2
  },
  {
    category: 'Pop',
    categoryColor: '#673ab7',
    icon: '👑',
    question: 'Qual artista feminina tem mais #1 na Billboard Hot 100?',
    options: ['Madonna', 'Rihanna', 'Mariah Carey', 'Taylor Swift'],
    correct: 2
  },
  {
    category: 'Clássica',
    categoryColor: '#795548',
    icon: '🎼',
    question: 'Quem compôs a "Nona Sinfonia"?',
    options: ['Mozart', 'Bach', 'Beethoven', 'Chopin'],
    correct: 2
  },
  {
    category: 'Moderno',
    categoryColor: '#607d8b',
    icon: '📱',
    question: 'Qual foi a primeira música a atingir 1 bilhão de views no YouTube?',
    options: ['Gangnam Style', 'Baby', 'Despacito', 'See You Again'],
    correct: 0
  },
  {
    category: 'Festival',
    categoryColor: '#8bc34a',
    icon: '🎪',
    question: 'Em que país acontece o festival Tomorrowland?',
    options: ['Holanda', 'Bélgica', 'Alemanha', 'França'],
    correct: 1
  }
];

export default {
  name: 'SoundUp',
  data() {
    return {
      isScrolled: false,
      mobileMenuOpen: false,
      isPlaying: true,
      isPaused: false,
      isAudioPlaying: false,
      hoveredMode: null,
      currentGame: null,
      currentDifficulty: null,
      showDifficultyModal: false,
      selectedMode: null,
      currentQuestion: 1,
      totalQuestions: 10,
      score: 0,
      sessionCoins: 0,
      totalCoins: 0,
      totalScore: 0,
      streak: 1,
      accuracy: 0,
      timerWidth: 100,
      selectedAnswer: null,
      showAnswer: false,
      correctAnswerIndex: 0,
      isLoading: false,
      loadError: false,
      currentTrack: null,
      currentOptions: [],
      tracksPool: [],
      questionIndex: 0,
      correctAnswers: 0,
      showLevelUp: false,
      levelUpRewards: { coins: 0, xp: 0 },
      audioElement: null,
      isOfflineMode: false,
      currentProxyIndex: 0,
      gameCompleted: false,
      completedDifficulties: [],
      usedTriviaIndices: [],
     
      cardStyles: [
        { transform: 'translateY(0px) rotate(-5deg)' },
        { transform: 'translateY(-20px) rotate(0deg)' },
        { transform: 'translateY(10px) rotate(5deg)' }
      ],
     
      activities: [
        { user: 'Pedro_Music', song: 'Blinding Lights', time: '2m', avatar: 'https://i.pravatar.cc/150?img=1' },
        { user: 'Ana_Rock', song: 'Levitating', time: '5m', avatar: 'https://i.pravatar.cc/150?img=2' },
        { user: 'Lucas_Pop', song: 'As It Was', time: '8m', avatar: 'https://i.pravatar.cc/150?img=3' },
        { user: 'Julia_Indie', song: 'Heat Waves', time: '12m', avatar: 'https://i.pravatar.cc/150?img=4' }
      ],
     
      difficulties: [
        {
          level: 'easy',
          name: 'Fácil',
          description: 'Mais tempo, dicas visuais',
          icon: '🌟',
          multiplier: 1,
          timeLimit: 30,
          hintCount: 2
        },
        {
          level: 'medium',
          name: 'Médio',
          description: 'Tempo padrão, algumas dicas',
          icon: '⚡',
          multiplier: 1.5,
          timeLimit: 20,
          hintCount: 1
        },
        {
          level: 'hard',
          name: 'Difícil',
          description: 'Pouco tempo, sem dicas',
          icon: '🔥',
          multiplier: 2,
          timeLimit: 10,
          hintCount: 0
        },
        {
          level: 'expert',
          name: 'Expert',
          description: 'Tempo mínimo, apenas áudio',
          icon: '👑',
          multiplier: 3,
          timeLimit: 5,
          hintCount: 0
        }
      ],

      gameModes: [
        {
          id: 'guess-song',
          name: 'Adivinhe a Música',
          description: 'Ouça o preview e adivinhe o nome da música. Quanto mais rápido, mais pontos!',
          icon: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
          players: '5.2k',
          difficulty: 'Fácil',
          difficultyClass: 'easy',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          bgImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
          featured: true
        },
        {
          id: 'guess-artist',
          name: 'Adivinhe o Artista',
          description: 'Identifique o artista pela música. Modo desafiador para verdadeiros fãs!',
          icon: '<path d="M12 2a3 3 0 0 0 0 6 3 3 0 0 0 0-6z"/><path d="M12 8v14"/><path d="M9 18h6"/>',
          players: '3.8k',
          difficulty: 'Médio',
          difficultyClass: 'medium',
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          bgImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
          featured: false
        },
        {
          id: 'complete-lyric',
          name: 'Complete a Música',
          description: 'Ouça e complete o nome da música com letras faltando. Teste sua memória!',
          icon: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
          players: '2.4k',
          difficulty: 'Difícil',
          difficultyClass: 'hard',
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          bgImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
          featured: false
        },
        {
          id: 'music-trivia',
          name: 'Quiz Musical',
          description: 'Perguntas sobre artistas, álbuns e curiosidades do mundo da música.',
          icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
          players: '1.9k',
          difficulty: 'Expert',
          difficultyClass: 'expert',
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          bgImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop',
          featured: false
        }
      ],
     
      dailyRewards: [
        { day: 1, coins: 100, icon: '🎁', claimed: false, available: true },
        { day: 2, coins: 150, icon: '🎁', claimed: false, available: false },
        { day: 3, coins: 200, icon: '🎁', claimed: false, available: false },
        { day: 4, coins: 250, icon: '🎁', claimed: false, available: false },
        { day: 5, coins: 300, icon: '🎁', claimed: false, available: false },
        { day: 6, coins: 400, icon: '🎁', claimed: false, available: false },
        { day: 7, coins: 1000, icon: '👑', claimed: false, available: false }
      ],
     
      achievements: [
        {
          icon: '🎯',
          title: 'Precisão Perfeita',
          description: 'Acerte 10 questões seguidas',
          unlocked: false,
          claimable: false,
          claimed: false,
          progress: 0,
          current: 0,
          total: 10,
          coins: 500
        },
        {
          icon: '🔥',
          title: 'Em Chamas',
          description: 'Mantenha uma sequência de 7 dias',
          unlocked: true,
          claimable: true,
          claimed: false,
          progress: 100,
          current: 7,
          total: 7,
          coins: 1000
        },
        {
          icon: '🎸',
          title: 'Lendário',
          description: 'Complete 50 músicas no modo Expert',
          unlocked: false,
          claimable: false,
          claimed: false,
          progress: 0,
          current: 12,
          total: 50,
          coins: 2000
        },
        {
          icon: '💰',
          title: 'Colecionador',
          description: 'Acumule 5000 moedas',
          unlocked: false,
          claimable: false,
          claimed: false,
          progress: 0,
          current: 0,
          total: 5000,
          coins: 1000
        },
        {
          icon: '⚡',
          title: 'Velocista',
          description: 'Acerte 5 músicas em menos de 5s cada',
          unlocked: false,
          claimable: false,
          claimed: false,
          progress: 0,
          current: 2,
          total: 5,
          coins: 800
        },
        {
          icon: '🏆',
          title: 'Campeão',
          description: 'Chegue ao topo do ranking',
          unlocked: false,
          claimable: false,
          claimed: false,
          progress: 0,
          current: 4,
          total: 1,
          coins: 5000
        }
      ],
     
      shopItems: [
        { id: 1, name: 'Tema Dark Premium', description: 'Tema exclusivo escuro', icon: '🌙', price: 2000, owned: false },
        { id: 2, name: 'Avatar Dourado', description: 'Borda dourada no perfil', icon: '👤', price: 1500, owned: false },
        { id: 3, name: 'Efeitos Especiais', description: 'Animações exclusivas', icon: '✨', price: 3000, owned: false },
        { id: 4, name: 'Dobro de Moedas', description: '2x moedas por 24h', icon: '💎', price: 500, owned: false },
        { id: 5, name: 'Dicas Ilimitadas', description: 'Dicas ilimitadas por 1h', icon: '💡', price: 800, owned: false }
      ],
     
      leaderboard: [
        { name: 'RockStar_99', score: '10.450', avatar: 'https://i.pravatar.cc/150?img=6', status: 'Online', trend: 'up' },
        { name: 'MelodyQueen', score: '9.890', avatar: 'https://i.pravatar.cc/150?img=7', status: 'Jogando', trend: 'same' },
        { name: 'BassMaster', score: '9.200', avatar: 'https://i.pravatar.cc/150?img=8', status: 'Online', trend: 'down' },
        { name: 'GuitarHero', score: '8.950', avatar: 'https://i.pravatar.cc/150?img=9', status: 'Ausente', trend: 'up' }
      ],
     
      currentTrivia: null,
      answerTime: 0,
      timerInterval: null,
      lastClaimDate: null
    }
  },

  computed: {
    canClaimDaily() {
      if (!this.lastClaimDate) return true;
     
      const lastClaim = new Date(this.lastClaimDate);
      const now = new Date();
     
      const lastClaimDay = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
     
      return today > lastClaimDay;
    },
   
    nextClaimTime() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - new Date();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    },
   
    // Preview apenas em Easy e Medium para Adivinhe o Artista
    showArtistPreviewButton() {
      return this.currentGame?.id === 'guess-artist' && 
             ['easy', 'medium'].includes(this.currentDifficulty?.level);
    },
   
    // Verifica se pode avançar para próximo nível
    canAdvanceLevel() {
      if (!this.currentDifficulty) return false;
      const levels = ['easy', 'medium', 'hard', 'expert'];
      const currentIndex = levels.indexOf(this.currentDifficulty.level);
      return currentIndex < levels.length - 1;
    },
   
    // Próximo nível de dificuldade
    nextDifficulty() {
      if (!this.canAdvanceLevel) return null;
      const levels = ['easy', 'medium', 'hard', 'expert'];
      const currentIndex = levels.indexOf(this.currentDifficulty.level);
      const nextLevel = levels[currentIndex + 1];
      return this.difficulties.find(d => d.level === nextLevel);
    },
   
    // Título com palavras mascaradas para Complete a Música
    maskedTitle() {
      if (!this.currentTrack) return [];
      const title = this.currentTrack.title;
      const words = title.split(' ');
      
      // Determina quantas palavras esconder baseado na dificuldade
      let hiddenCount;
      if (this.currentDifficulty?.level === 'easy') {
        hiddenCount = 1;
      } else if (this.currentDifficulty?.level === 'medium') {
        hiddenCount = Math.max(1, Math.floor(words.length / 2));
      } else {
        // Hard/Expert: esconde todas menos a primeira (se houver mais de 1 palavra)
        hiddenCount = words.length > 1 ? words.length - 1 : 1;
      }
      
      // Se só tem 1 palavra, esconde ela toda no modo difícil, ou metade no fácil
      if (words.length === 1) {
        return [{
          text: words[0],
          hidden: true,
          revealed: this.showAnswer
        }];
      }
      
      // Esconde as últimas N palavras (nunca a primeira no modo fácil/médio)
      const indicesToHide = [];
      const startIdx = this.currentDifficulty?.level === 'easy' ? 1 : 0;
      
      while (indicesToHide.length < hiddenCount && indicesToHide.length < words.length) {
        const idx = Math.floor(Math.random() * (words.length - startIdx)) + startIdx;
        if (!indicesToHide.includes(idx)) {
          indicesToHide.push(idx);
        }
      }
      
      return words.map((word, idx) => ({
        text: word,
        hidden: indicesToHide.includes(idx),
        revealed: !indicesToHide.includes(idx) || this.showAnswer
      }));
    }
  },
 
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    this.animateCards();
    this.initializeUserData();
    this.loadDailyRewards();
    this.updateAchievements();
    this.loadCompletedDifficulties();
  },
 
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
    this.cleanupAudio();
    if (this.timerInterval) clearInterval(this.timerInterval);
  },
 
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    },
   
    initializeUserData() {
      this.totalCoins = parseInt(localStorage.getItem('soundup_coins')) || 0;
      this.totalScore = parseInt(localStorage.getItem('soundup_score')) || 0;
      this.streak = parseInt(localStorage.getItem('soundup_streak')) || 1;
      this.accuracy = parseInt(localStorage.getItem('soundup_accuracy')) || 0;
     
      const savedLastClaim = localStorage.getItem('soundup_last_claim_date');
      if (savedLastClaim) {
        this.lastClaimDate = savedLastClaim;
      }
     
      const savedRewards = localStorage.getItem('soundup_daily_rewards_progress');
      if (savedRewards) {
        const progress = JSON.parse(savedRewards);
        this.dailyRewards = this.dailyRewards.map((day, idx) => ({
          ...day,
          claimed: progress.claimedDays?.includes(day.day) || false,
          available: day.day === (progress.nextDay || 1)
        }));
      }
    },

    loadCompletedDifficulties() {
      const saved = localStorage.getItem('soundup_completed_difficulties');
      if (saved) {
        this.completedDifficulties = JSON.parse(saved);
      }
    },

    saveCompletedDifficulties() {
      localStorage.setItem('soundup_completed_difficulties', JSON.stringify(this.completedDifficulties));
    },

    isDifficultyCompleted(level) {
      return this.completedDifficulties.includes(`${this.currentGame?.id}_${level}`);
    },

    isDifficultyLocked(level) {
      const levels = ['easy', 'medium', 'hard', 'expert'];
      const index = levels.indexOf(level);
      if (index === 0) return false; // Easy nunca está bloqueado
      
      // Precisa completar o anterior
      const prevLevel = levels[index - 1];
      return !this.completedDifficulties.includes(`${this.currentGame?.id}_${prevLevel}`);
    },

    markDifficultyCompleted() {
      const key = `${this.currentGame.id}_${this.currentDifficulty.level}`;
      if (!this.completedDifficulties.includes(key)) {
        this.completedDifficulties.push(key);
        this.saveCompletedDifficulties();
      }
    },

    cleanupAudio() {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = '';
        this.audioElement = null;
      }
      this.isAudioPlaying = false;
    },

    getNextProxy() {
      this.currentProxyIndex = (this.currentProxyIndex + 1) % CORS_PROXIES.length;
      return CORS_PROXIES[this.currentProxyIndex];
    },
   
    async fetchFromDeezer(endpoint, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          const proxy = CORS_PROXIES[this.currentProxyIndex];
          const url = `${proxy}${encodeURIComponent(`${DEEZER_API}${endpoint}`)}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const data = await response.json();
          return data.contents ? JSON.parse(data.contents) : data;
        } catch (error) {
          console.warn(`Tentativa ${i + 1} falhou:`, error.message);
          
          if (i < retries - 1) {
            this.getNextProxy();
            await new Promise(r => setTimeout(r, 1000));
          } else {
            throw error;
          }
        }
      }
    },
   
    async loadChartTracks() {
      try {
        const data = await this.fetchFromDeezer('/chart/0/tracks?limit=100');
        return data.data || [];
      } catch (error) {
        console.error('Erro ao carregar charts:', error);
        return [];
      }
    },
   
    async searchTracks(query, limit = 50) {
      try {
        const data = await this.fetchFromDeezer(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        return data.data || [];
      } catch (error) {
        console.error('Erro na busca:', error);
        return [];
      }
    },

    useOfflineMode() {
      this.isOfflineMode = true;
      this.loadError = false;
      this.initializeOfflineTracks();
    },

    initializeOfflineTracks() {
      let pool = [];
      switch(this.currentGame.id) {
        case 'guess-song':
          pool = [...OFFLINE_TRACKS.guessSong];
          break;
        case 'guess-artist':
          pool = [...OFFLINE_TRACKS.guessArtist];
          break;
        case 'complete-lyric':
          pool = [...OFFLINE_TRACKS.completeLyric];
          break;
        case 'music-trivia':
          pool = [...OFFLINE_TRACKS.musicTrivia];
          break;
        default:
          pool = [...OFFLINE_TRACKS.guessSong];
      }
      
      this.tracksPool = pool.sort(() => Math.random() - 0.5);
      this.loadNextTrack();
    },
   
    async initializeGameTracks() {
      this.isLoading = true;
      this.loadError = false;
      this.isOfflineMode = false;
     
      try {
        let tracks = [];
        
        switch(this.currentGame.id) {
          case 'guess-song':
            tracks = await this.loadChartTracks();
            if (tracks.length < 10) {
              const searchResults = await this.searchTracks('artist:"the weeknd" OR artist:"dua lipa" OR artist:"harry styles"', 50);
              tracks = [...tracks, ...searchResults];
            }
            break;
            
          case 'guess-artist':
            const artistQueries = [
              'artist:"taylor swift"',
              'artist:"drake"', 
              'artist:"billie eilish"',
              'artist:"ed sheeran"',
              'artist:"ariana grande"',
              'artist:"justin bieber"'
            ];
            
            const artistResults = await Promise.all(
              artistQueries.map(q => this.searchTracks(q, 10))
            );
            
            tracks = artistResults.flat().filter((track, index, self) => {
              const artistCount = self.filter(t => t.artist.id === track.artist.id).length;
              return artistCount <= 3;
            });
            break;
            
          case 'complete-lyric':
            const titleQueries = [
              'track:"let it be"',
              'track:"hey jude"',
              'track:"imagine"',
              'track:"billie jean"',
              'track:"wonderwall"'
            ];
            
            const titleResults = await Promise.all(
              titleQueries.map(q => this.searchTracks(q, 10))
            );
            
            tracks = titleResults.flat();
            break;
            
          case 'music-trivia':
            const classicQueries = [
              'artist:"queen"',
              'artist:"michael jackson"',
              'artist:"madonna"',
              'artist:"prince"'
            ];

            const classicResults = await Promise.all(
              classicQueries.map(q => this.searchTracks(q, 15))
            );
            
            tracks = classicResults.flat();
            break;
            
          default:
            tracks = await this.loadChartTracks();
        }
       
        this.tracksPool = tracks.filter(t => t.preview && t.preview.length > 0);
        
        if (this.tracksPool.length < 4) {
          console.warn('Poucas músicas da API, usando modo offline');
          this.useOfflineMode();
          return;
        }
        
        this.tracksPool = this.tracksPool.sort(() => Math.random() - 0.5);
        
        this.loadNextTrack();
      } catch (error) {
        console.error('Erro na inicialização:', error);
        this.loadError = true;
        this.isLoading = false;
      }
    },
   
    loadNextTrack() {
      if (this.tracksPool.length < 4) {
        if (this.isOfflineMode) {
          this.initializeOfflineTracks();
        } else {
          this.initializeGameTracks();
        }
        return;
      }
     
      const randomIndex = Math.floor(Math.random() * this.tracksPool.length);
      this.currentTrack = this.tracksPool[randomIndex];
     
      this.tracksPool.splice(randomIndex, 1);
     
      this.generateOptions();
     
      this.selectedAnswer = null;
      this.showAnswer = false;
      this.isAudioPlaying = false;
      this.timerWidth = 100;
      this.answerTime = 0;
     
      this.startTimer();
     
      this.isLoading = false;
     
      // Auto-play no modo fácil
      if (this.currentDifficulty?.level === 'easy') {
        setTimeout(() => this.toggleAudio(), 500);
      }
    },
   
    // Gera opções diferentes para cada modo
    generateOptions() {
      const correct = this.currentTrack;
      
      // Para "Complete a Música", as opções são variações do título
      if (this.currentGame.id === 'complete-lyric') {
        this.generateCompleteLyricOptions(correct);
        return;
      }
      
      // Para Quiz, usa as opções da pergunta atual
      if (this.currentGame.id === 'music-trivia') {
        this.loadNextTrivia();
        return;
      }
      
      // Para outros modos, comportamento normal
      const options = [correct];
     
      let poolForOptions = this.tracksPool.filter(t => {
        if (this.currentGame.id === 'guess-artist') {
          return t.artist.id !== correct.artist.id;
        }
        return t.id !== correct.id;
      });
      
      if (poolForOptions.length < 3) {
        poolForOptions = this.tracksPool.filter(t => t.id !== correct.id);
      }
     
      const shuffled = [...poolForOptions].sort(() => Math.random() - 0.5);
      const incorrectOptions = shuffled.slice(0, 3);
     
      options.push(...incorrectOptions);
     
      while (options.length < 4 && this.tracksPool.length > 0) {
        const random = this.tracksPool[Math.floor(Math.random() * this.tracksPool.length)];
        const isDuplicate = options.some(o => {
          if (this.currentGame.id === 'guess-artist') return o.artist.id === random.artist.id;
          return o.id === random.id;
        });
       
        if (!isDuplicate) {
          options.push(random);
        }
      }
     
      const shuffledOptions = options.sort(() => Math.random() - 0.5);
      this.correctAnswerIndex = shuffledOptions.findIndex(o => {
        if (this.currentGame.id === 'guess-artist') {
          return o.artist.id === correct.artist.id;
        }
        return o.id === correct.id;
      });
     
      this.currentOptions = shuffledOptions.map(o => {
        if (this.currentGame.id === 'guess-artist') return o.artist.name;
        return o.title;
      });
    },
    
    // Gera opções específicas para "Complete a Música" - MELHORADO
    generateCompleteLyricOptions(correct) {
      const title = correct.title;
      const words = title.split(' ');
      
      // Cria 4 variações do título com diferentes palavras
      const variations = [title]; // A correta
      
      // Estratégias para criar alternativas plausíveis:
      const strategies = [
        // 1. Trocar palavras por sinônimos comuns em títulos de músicas
        () => {
          const commonReplacements = {
            'Love': ['Heart', 'Baby', 'You', 'Me'],
            'You': ['Me', 'Love', 'Her', 'Him'],
            'My': ['Your', 'The', 'Our'],
            'The': ['My', 'Your', 'A'],
            'Night': ['Day', 'Time', 'Sky'],
            'Heart': ['Soul', 'Mind', 'Love'],
            'World': ['Life', 'Dream', 'Heart'],
            'Baby': ['Honey', 'Love', 'Darling'],
            'Forever': ['Always', 'Eternity', 'Never'],
            'Time': ['Life', 'Moment', 'Day']
          };
          
          const newWords = [...words];
          let replaced = false;
          
          for (let i = 0; i < newWords.length; i++) {
            const word = newWords[i];
            const replacements = commonReplacements[word];
            if (replacements && !replaced && Math.random() > 0.3) {
              newWords[i] = replacements[Math.floor(Math.random() * replacements.length)];
              replaced = true;
            }
          }
          
          return newWords.join(' ');
        },
        
        // 2. Adicionar ou remover "The", "My", "Your"
        () => {
          const newWords = [...words];
          const articles = ['The', 'My', 'Your', 'Our'];
          
          if (Math.random() > 0.5 && !articles.includes(newWords[0])) {
            newWords.unshift(articles[Math.floor(Math.random() * articles.length)]);
          } else if (articles.includes(newWords[0])) {
            newWords.shift();
          }
          
          return newWords.join(' ');
        },
        
        // 3. Trocar a ordem de duas palavras (se tiver 3+ palavras)
        () => {
          if (words.length < 3) return title;
          const newWords = [...words];
          const idx1 = Math.floor(Math.random() * (newWords.length - 1)) + 1;
          const idx2 = Math.floor(Math.random() * (newWords.length - 1)) + 1;
          [newWords[idx1], newWords[idx2]] = [newWords[idx2], newWords[idx1]];
          return newWords.join(' ');
        },
        
        // 4. Substituir números ou adicionar números
        () => {
          const numbers = ['One', 'Two', 'Three', 'Four', 'Five', 'Seven', 'Ten', '100', '99'];
          const newWords = words.map(w => {
            if (!isNaN(w) || numbers.includes(w)) {
              return numbers[Math.floor(Math.random() * numbers.length)];
            }
            return w;
          });
          return newWords.join(' ');
        }
      ];
      
      // Gera 3 variações únicas
      const usedVariations = new Set([title.toLowerCase()]);
      
      while (variations.length < 4) {
        const strategy = strategies[Math.floor(Math.random() * strategies.length)];
        const variation = strategy();
        const lowerVariation = variation.toLowerCase();
        
        if (!usedVariations.has(lowerVariation) && variation !== title) {
          variations.push(variation);
          usedVariations.add(lowerVariation);
        }
        
        // Evita loop infinito
        if (variations.length < 4 && usedVariations.size > 10) {
          // Fallback: adiciona variações simples
          variations.push(`${title} (Remix)`, `${title} (Live)`, `The ${title}`);
          break;
        }
      }
      
      // Embaralha e encontra o índice correto
      const shuffled = variations.sort(() => Math.random() - 0.5);
      this.correctAnswerIndex = shuffled.indexOf(title);
      this.currentOptions = shuffled;
    },

    // Carrega próxima pergunta do trivia
    loadNextTrivia() {
      // Filtra perguntas não usadas recentemente
      const availableIndices = TRIVIA_QUESTIONS.map((_, idx) => idx)
        .filter(idx => !this.usedTriviaIndices.includes(idx));
      
      // Se usou todas, reseta
      if (availableIndices.length === 0) {
        this.usedTriviaIndices = [];
        availableIndices.push(...TRIVIA_QUESTIONS.map((_, idx) => idx));
      }
      
      // Seleciona aleatoriamente
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      this.currentTrivia = TRIVIA_QUESTIONS[randomIndex];
      this.usedTriviaIndices.push(randomIndex);
      
      this.currentOptions = this.currentTrivia.options;
      this.correctAnswerIndex = this.currentTrivia.correct;
    },
   
    toggleAudio() {
      if (!this.currentTrack?.preview) {
        console.error('Sem preview disponível');
        return;
      }
     
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.addEventListener('ended', () => {
          this.isAudioPlaying = false;
        });
        this.audioElement.addEventListener('error', (e) => {
          console.error('Erro no áudio:', e);
          this.isAudioPlaying = false;
        });
      }
     
      if (this.isAudioPlaying) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.isAudioPlaying = false;
      } else {
        this.audioElement.src = this.currentTrack.preview;
        this.audioElement.volume = 0.7;
        this.audioElement.play()
          .then(() => {
            this.isAudioPlaying = true;
          })
          .catch(e => {
            console.error('Erro ao tocar:', e);
            this.isAudioPlaying = false;
          });
      }
    },
   
    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
     
      const timeLimit = this.currentDifficulty?.timeLimit || 20;
      const step = 100 / (timeLimit * 10);
     
      this.timerInterval = setInterval(() => {
        if (!this.showAnswer && this.timerWidth > 0) {
          this.timerWidth -= step;
          this.answerTime += 0.1;
        } else if (this.timerWidth <= 0 && !this.showAnswer) {
          this.selectAnswer(-1);
        }
      }, 100);
    },
   
    calculatePoints() {
      if (!this.currentDifficulty) return 100;
     
      const basePoints = 100;
      const timeBonus = Math.max(0, Math.floor((100 - this.answerTime) * 2));
      const difficultyMultiplier = this.currentDifficulty.multiplier;
     
      return Math.floor((basePoints + timeBonus) * difficultyMultiplier);
    },
   
    calculateCoins() {
      const points = this.calculatePoints();
      return Math.floor(points / 10);
    },
   
    selectAnswer(index) {
      if (this.showAnswer) return;
     
      this.selectedAnswer = index;
      this.showAnswer = true;
     
      this.cleanupAudio();
     
      if (index === this.correctAnswerIndex) {
        this.correctAnswers++;
        const points = this.calculatePoints();
        const coins = this.calculateCoins();
       
        this.score += points;
        this.sessionCoins += coins;
        this.totalCoins += coins;
        this.totalScore = Math.max(this.totalScore, this.score);
       
        this.updateAchievements();
       
        if (this.score > 0 && this.score % 1000 === 0) {
          this.showLevelUp = true;
          this.levelUpRewards = {
            coins: 500,
            xp: 100
          };
        }
      }
    },
    
    // Retorna o texto da resposta correta para o feedback
    getCorrectAnswerText() {
      if (this.currentGame.id === 'complete-lyric') {
        return this.currentTrack?.title;
      }
      return this.currentOptions[this.correctAnswerIndex];
    },
   
    nextQuestion() {
      if (this.currentQuestion < this.totalQuestions) {
        this.currentQuestion++;
        this.loadNextTrack();
      } else {
        this.completeGame();
      }
    },

    // Completa o jogo e mostra tela de conclusão
    completeGame() {
      this.gameCompleted = true;
      this.markDifficultyCompleted();
      
      const accuracy = Math.round((this.correctAnswers / this.totalQuestions) * 100);
      this.accuracy = Math.round((this.accuracy + accuracy) / 2) || accuracy;
     
      const completionBonus = this.correctAnswers === this.totalQuestions ? 1000 :
                             this.correctAnswers >= this.totalQuestions / 2 ? 500 : 100;
     
      this.totalCoins += completionBonus;
      this.sessionCoins += completionBonus;
      
      // Salva progresso
      localStorage.setItem('soundup_coins', this.totalCoins);
      localStorage.setItem('soundup_score', this.totalScore);
      localStorage.setItem('soundup_accuracy', this.accuracy);
    },

    // Avança para próximo nível
    advanceToNextLevel() {
      const nextDiff = this.nextDifficulty;
      if (nextDiff) {
        this.startGameWithDifficulty(nextDiff);
      }
    },

    // Recomeça no mesmo nível
    restartSameLevel() {
      this.resetGame();
      this.initializeGameTracks();
    },

    // Sai para o menu
    exitToMenu() {
      this.currentGame = null;
      this.currentDifficulty = null;
      this.gameCompleted = false;
      this.cleanupAudio();
    },

    // Sai do jogo atual
    exitGame() {
      if (confirm('Deseja realmente sair? Seu progresso será perdido.')) {
        this.exitToMenu();
      }
    },
   
    selectMode(mode) {
      this.selectedMode = mode;
      this.showDifficultyModal = true;
    },
   
    startGameWithDifficulty(difficulty) {
      this.currentDifficulty = difficulty;
      this.showDifficultyModal = false;
      this.currentGame = this.selectedMode;
      this.resetGame();
      this.initializeGameTracks();
     
      setTimeout(() => {
        const gameSection = document.getElementById('game-demo');
        if (gameSection) {
          gameSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    },
   
    resetGame() {
      this.currentQuestion = 1;
      this.score = 0;
      this.sessionCoins = 0;
      this.questionIndex = 0;
      this.correctAnswers = 0;
      this.selectedAnswer = null;
      this.showAnswer = false;
      this.timerWidth = 100;
      this.isAudioPlaying = false;
      this.tracksPool = [];
      this.currentTrack = null;
      this.isOfflineMode = false;
      this.gameCompleted = false;
      this.usedTriviaIndices = [];
     
      this.cleanupAudio();
    },

    startGame() {
      this.selectMode(this.gameModes[0]);
    },
   
    scrollToGame() {
      const modesSection = document.getElementById('modes');
      if (modesSection) {
        modesSection.scrollIntoView({ behavior: 'smooth' });
      }
    },
   
    showDemo() {
      this.selectMode(this.gameModes[0]);
    },
   
    loadDailyRewards() {
      const saved = localStorage.getItem('soundup_daily_rewards_progress');
      const lastClaim = localStorage.getItem('soundup_last_claim_date');
     
      if (saved) {
        const progress = JSON.parse(saved);
        this.dailyRewards = this.dailyRewards.map(day => ({
          ...day,
          claimed: progress.claimedDays?.includes(day.day) || false,
          available: day.day === progress.nextDay && this.canClaimDaily
        }));
      }
     
      if (lastClaim) {
        this.lastClaimDate = lastClaim;
      }
    },
   
    claimDailyReward(day) {
      if (!this.canClaimDaily) {
        alert('Você já resgatou sua recompensa hoje! Volte amanhã.');
        return;
      }
     
      const nextAvailableDay = this.dailyRewards.find(d => !d.claimed);
      if (!nextAvailableDay || nextAvailableDay.day !== day.day) {
        return;
      }
     
      if (day.claimed || !day.available) return;
     
      day.claimed = true;
      day.available = false;
      this.totalCoins += day.coins;
     
      const now = new Date();
      this.lastClaimDate = now.toISOString();
      localStorage.setItem('soundup_last_claim_date', this.lastClaimDate);
     
      const claimedDays = this.dailyRewards
        .filter(d => d.claimed)
        .map(d => d.day);
     
      const nextDay = day.day + 1;
      localStorage.setItem('soundup_daily_rewards_progress', JSON.stringify({
        claimedDays,
        nextDay: nextDay > 7 ? 1 : nextDay
      }));
     
      alert(`🎉 Recompensa do Dia ${day.day} resgatada!\n🪙 +${day.coins} moedas`);
    },
   
    updateAchievements() {
      this.achievements.forEach(ach => {
        if (ach.id === 'coins') {
          ach.current = this.totalCoins;
        }
        ach.progress = Math.min(100, (ach.current / ach.total) * 100);
        ach.unlocked = ach.current >= ach.total;
        ach.claimable = ach.unlocked && !ach.claimed;
      });
    },
   
    claimAchievement(achievement) {
      if (!achievement.claimable || achievement.claimed) return;
     
      achievement.claimed = true;
      achievement.claimable = false;
      this.totalCoins += achievement.coins;
      this.updateAchievements();
    },
   
    buyItem(item) {
      if (item.owned || this.totalCoins < item.price) return;
     
      this.totalCoins -= item.price;
      item.owned = true;
      this.updateAchievements();
    },
   
    animateCards() {
      setInterval(() => {
        this.cardStyles = this.cardStyles.map((style, idx) => {
          const offset = Math.sin(Date.now() / 1000 + idx) * 10;
          const rotate = (idx - 1) * 5 + Math.sin(Date.now() / 1500 + idx) * 3;
          return {
            transform: `translateY(${offset}px) rotate(${rotate}deg)`
          };
        });
      }, 50);
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #ec4899;
  --accent: #8b5cf6;
  --dark: #0f0f1a;
  --darker: #08080f;
  --card: #1a1a2e;
  --card-hover: #252542;
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --border: rgba(255,255,255,0.1);
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --easy: #10b981;
  --medium: #f59e0b;
  --hard: #ef4444;
  --expert: #8b5cf6;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--darker);
  color: var(--text);
  overflow-x: hidden;
}

.rhythm-quest {
  min-height: 100vh;
  position: relative;
}

/* Ambient Background */
.ambient-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: var(--primary);
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: var(--secondary);
  bottom: -100px;
  left: -100px;
  animation-delay: -5s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: var(--accent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

.noise-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Navigation */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.5rem 2rem;
  transition: all 0.3s ease;
  background: transparent;
}

.nav-bar.scrolled {
  background: rgba(15, 15, 26, 0.8);
  backdrop-filter: blur(20px);
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.logo-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(to right, var(--text), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.user-coins {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(245, 158, 11, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.coin-icon {
  font-size: 1.2rem;
}

.coin-amount {
  font-weight: 700;
  color: var(--warning);
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

.nav-link:hover {
  color: var(--text);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s;
}

.nav-link:hover::after {
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
}

.btn-primary .icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s;
}

.btn-primary:hover .icon {
  transform: translateX(4px);
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.mobile-toggle span {
  width: 24px;
  height: 2px;
  background: var(--text);
  transition: all 0.3s;
}

/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 8rem 2rem 4rem;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
  width: fit-content;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradient 5s ease infinite;
}

@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-glow {
  position: relative;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  border-radius: 16px;
  z-index: 2;
}

.play-icon {
  width: 24px;
  height: 24px;
}

.glow-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.btn-glow:hover .glow-effect {
  opacity: 1;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-outline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: transparent;
  border: 2px solid var(--border);
  color: var(--text);
  font-weight: 600;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline:hover {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.btn-outline svg {
  width: 20px;
  height: 20px;
}

/* Activity Ticker */
.activity-ticker {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  max-width: 600px;
}

.ticker-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.ticker-content {
  overflow: hidden;
  flex: 1;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}

.ticker-track {
  display: flex;
  gap: 2rem;
  animation: ticker 20s linear infinite;
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.ticker-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.ticker-text {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.ticker-text strong {
  color: var(--text);
  font-weight: 600;
}

.ticker-text .highlight {
  color: var(--primary);
  font-weight: 500;
}

.ticker-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.6;
}

@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vinyl-record {
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
  position: relative;
  box-shadow:
    0 0 0 10px #111,
    0 0 0 12px #333,
    0 20px 60px rgba(0,0,0,0.8);
  animation: spin 4s linear infinite;
  animation-play-state: paused;
}

.vinyl-record.playing {
  animation-play-state: running;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-grooves {
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #111 0px,
    #111 2px,
    #0a0a0a 2px,
    #0a0a0a 4px
  );
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5);
}

.label-center {
  width: 20px;
  height: 20px;
  background: var(--darker);
  border-radius: 50%;
}

.tonearm {
  position: absolute;
  top: -20px;
  right: 60px;
  width: 120px;
  height: 8px;
}

.tonearm.active {
  transform: rotate(-15deg);
}

.tonearm::before {
  content: '';
  position: absolute;
  right: -10px;
  top: -6px;
  width: 20px;
  height: 20px;
  background: #444;
  border-radius: 50%;
}

/* Floating Cards */
.floating-cards {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.float-card {
  position: absolute;
  background: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  transition: transform 0.3s;
  pointer-events: auto;
}

.card-1 {
  top: 10%;
  left: -20px;
}

.card-2 {
  top: 50%;
  right: -40px;
}

.card-3 {
  bottom: 10%;
  left: 10%;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.card-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.card-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Modes Section */
.modes-section {
  padding: 6rem 2rem;
  position: relative;
  z-index: 1;
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 4rem;
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.section-subtitle {
  color: var(--text-muted);
  font-size: 1.125rem;
}

.modes-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.mode-card {
  position: relative;
  background: var(--card);
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border);
  height: 400px;
}

.mode-card:hover {
  transform: translateY(-8px);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.mode-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  transition: opacity 0.4s, transform 0.4s;
}

.mode-card:hover .mode-bg {
  opacity: 0.5;
  transform: scale(1.05);
}

.mode-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--card) 0%, transparent 100%);
}

.mode-content {
  position: relative;
  height: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 2;
}

.mode-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.mode-icon svg {
  width: 30px;
  height: 30px;
}

.mode-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.mode-description {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.mode-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-weight: 700;
  color: var(--primary);
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.difficulty-badge.easy {
  background: rgba(16, 185, 129, 0.2);
  color: var(--easy);
}

.difficulty-badge.medium {
  background: rgba(245, 158, 11, 0.2);
  color: var(--medium);
}

.difficulty-badge.hard {
  background: rgba(239, 68, 68, 0.2);
  color: var(--hard);
}

.difficulty-badge.expert {
  background: rgba(139, 92, 246, 0.2);
  color: var(--expert);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mode-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.mode-card:hover .mode-action {
  background: var(--primary);
  color: white;
}

.mode-action svg {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.mode-card:hover .mode-action svg {
  transform: translateX(4px);
}

.featured-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: var(--secondary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  z-index: 3;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.modal-content {
  background: var(--card);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 500px;
  width: 100%;
  border: 1px solid var(--border);
  text-align: center;
}

.modal-content h3 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.modal-content > p {
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.difficulty-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.difficulty-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255,255,255,0.05);
  border: 2px solid var(--border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  color: var(--text);
}

.difficulty-btn:hover:not(:disabled) {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.difficulty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.difficulty-btn.completed {
  border-color: var(--success);
  background: rgba(16, 185, 129, 0.1);
}

.diff-icon {
  font-size: 2rem;
}

.diff-info {
  flex: 1;
}

.diff-info strong {
  display: block;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.diff-info span {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.diff-status {
  text-align: center;
}

.completed-badge {
  display: block;
  font-size: 0.875rem;
  color: var(--success);
  font-weight: 700;
}

.locked-badge {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.diff-reward {
  text-align: center;
}

.reward-multiplier {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--warning);
}

.diff-reward small {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.btn-close {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 0.75rem 2rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close:hover {
  border-color: var(--error);
  color: var(--error);
}

/* Game Section */
.game-section {
  padding: 4rem 2rem;
  background: rgba(0,0,0,0.2);
}

.game-container {
  max-width: 800px;
  margin: 0 auto;
  background: var(--card);
  border-radius: 24px;
  border: 1px solid var(--border);
  overflow: hidden;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border);
  background: rgba(0,0,0,0.2);
}

.btn-back {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s;
}

.btn-back:hover {
  background: rgba(255,255,255,0.1);
  color: var(--text);
}

.btn-back svg {
  width: 24px;
  height: 24px;
}

.game-progress {
  flex: 1;
  margin: 0 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 600;
  min-width: 3rem;
  text-align: right;
}

.game-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  text-align: right;
}

.stat-item .stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.score-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--success);
}

.coin-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--warning);
}

.game-content {
  padding: 3rem 2rem;
}

.loading-state, .error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-subtext {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.error-subtext {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0.5rem 0 1.5rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255,255,255,0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

.error-state button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.error-state button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

/* Game Completed Screen */
.game-completed {
  text-align: center;
  padding: 4rem 2rem;
}

.completion-animation {
  max-width: 500px;
  margin: 0 auto;
}

.trophy {
  font-size: 6rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

.completion-animation h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.completion-animation > p {
  color: var(--text-muted);
  margin-bottom: 2rem;
  font-size: 1.125rem;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.comp-stat {
  background: rgba(255,255,255,0.05);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border);
}

.comp-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.comp-value {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}

.completion-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-advance, .btn-restart, .btn-menu {
  width: 100%;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s;
  border: none;
}

.btn-advance {
  background: linear-gradient(135deg, var(--success), #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.btn-advance:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.btn-restart {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-restart:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
}

.btn-menu {
  background: transparent;
  border: 2px solid var(--border);
  color: var(--text-muted);
}

.btn-menu:hover {
  border-color: var(--text);
  color: var(--text);
}

.question-card {
  background: rgba(0,0,0,0.3);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.mode-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.mode-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  color: var(--primary);
  font-weight: 600;
}

.difficulty-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.difficulty-tag.easy {
  background: rgba(16, 185, 129, 0.2);
  color: var(--easy);
}

.difficulty-tag.medium {
  background: rgba(245, 158, 11, 0.2);
  color: var(--medium);
}

.difficulty-tag.hard {
  background: rgba(239, 68, 68, 0.2);
  color: var(--hard);
}

.difficulty-tag.expert {
  background: rgba(139, 92, 246, 0.2);
  color: var(--expert);
}

/* Song Challenge */
.song-challenge {
  text-align: center;
  padding: 2rem 0;
}

.vinyl-player {
  width: 200px;
  height: 200px;
  margin: 0 auto 2rem;
  position: relative;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
  position: relative;
  box-shadow: 0 0 0 8px #111, 0 0 0 10px #333, 0 10px 30px rgba(0,0,0,0.5);
  animation: spin 3s linear infinite;
  animation-play-state: paused;
}

.vinyl-player.playing .vinyl-disc {
  animation-play-state: running;
}

.disc-grooves {
  position: absolute;
  inset: 15px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #111 0px,
    #111 2px,
    #0a0a0a 2px,
    #0a0a0a 4px
  );
}

.disc-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  overflow: hidden;
}

.disc-label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tonearm-mini {
  position: absolute;
  top: -10px;
  right: 30px;
  width: 60px;
  height: 4px;
  background: #666;
  border-radius: 2px;
}

.vinyl-player.playing .tonearm-mini {
  transform: rotate(-15deg);
  transform-origin: right center;
}

.audio-visualizer-large {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  height: 100px;
  margin-bottom: 2rem;
}

.viz-bar {
  width: 12px;
  background: linear-gradient(to top, var(--primary), var(--accent));
  border-radius: 6px;
  animation: equalizer 0.8s ease-in-out infinite;
  height: 20%;
}

@keyframes equalizer {
  0%, 100% { height: 20%; }
  50% { height: 100%; }
}

.play-prompt {
  margin-bottom: 2rem;
}

.btn-play-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0 auto 1rem;
  transition: transform 0.2s;
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
}

.btn-play-large:hover {
  transform: scale(1.1);
}

.btn-play-large svg {
  width: 32px;
  height: 32px;
}

.prompt-text {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.track-hints {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.hint-badge {
  background: rgba(255,255,255,0.05);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Artist Challenge */
.artist-challenge {
  text-align: center;
  padding: 2rem 0;
}

.voice-wave-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.voice-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--secondary), var(--accent));
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 3rem;
  overflow: hidden;
}

.voice-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(10px);
  transition: filter 0.3s;
}

.voice-avatar.speaking img {
  filter: blur(5px);
}

.avatar-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--secondary), var(--accent));
  opacity: 0.3;
  filter: blur(20px);
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

.mic-icon {
  z-index: 2;
}

.voice-waves {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 60px;
  width: 100%;
  max-width: 300px;
}

.voice-bar {
  width: 8px;
  background: linear-gradient(to top, var(--secondary), var(--accent));
  border-radius: 4px;
  transition: height 0.2s;
  animation: voice-wave 0.5s ease-in-out infinite alternate;
}

@keyframes voice-wave {
  from { height: 10%; }
  to { height: 80%; }
}

.voice-clue {
  margin-bottom: 2rem;
}

.clue-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.clue-hint {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.btn-play-voice {
  background: rgba(255,255,255,0.05);
  border: 2px solid var(--border);
  color: var(--text);
  padding: 1rem 2rem;
  border-radius: 50px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-play-voice:hover, .btn-play-voice.playing {
  background: var(--secondary);
  border-color: var(--secondary);
  color: white;
}

.btn-play-voice svg {
  width: 24px;
  height: 24px;
}

.no-preview-hint {
  color: var(--error);
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 1px solid var(--error);
}

/* Lyrics Challenge - MELHORADO */
.lyrics-challenge {
  text-align: center;
  padding: 2rem 0;
}

.audio-mini-player {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.play-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.play-btn:hover {
  transform: scale(1.1);
}

.play-btn svg {
  width: 28px;
  height: 28px;
}

.audio-waves {
  display: flex;
  gap: 3px;
  align-items: center;
  height: 30px;
}

.audio-waves span {
  width: 4px;
  background: var(--primary);
  border-radius: 2px;
  animation: wave 0.5s ease-in-out infinite alternate;
}

.audio-waves span:nth-child(1) { height: 10px; animation-delay: 0s; }
.audio-waves span:nth-child(2) { height: 20px; animation-delay: 0.1s; }
.audio-waves span:nth-child(3) { height: 15px; animation-delay: 0.2s; }
.audio-waves span:nth-child(4) { height: 25px; animation-delay: 0.3s; }

@keyframes wave {
  from { transform: scaleY(0.5); }
  to { transform: scaleY(1); }
}

.title-puzzle {
  background: rgba(0,0,0,0.2);
  border-radius: 16px;
  padding: 2rem;
}

.puzzle-title {
  font-size: 1.25rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.title-display {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  font-weight: 700;
}

.word-slot {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s;
}

.word-slot.revealed {
  background: rgba(99, 102, 241, 0.2);
  color: var(--text);
}

.word-slot.hidden {
  background: rgba(255,255,255,0.05);
  border: 2px dashed var(--primary);
  color: var(--primary);
  min-width: 80px;
}

.word-slot.hidden .blank {
  letter-spacing: 0.2em;
}

.artist-hint {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Trivia Challenge */
.trivia-challenge {
  text-align: center;
  padding: 2rem 0;
}

.trivia-category {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trivia-question {
  margin-bottom: 2rem;
}

.question-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.trivia-question h3 {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.4;
}

/* Timer Bar */
.timer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255,255,255,0.1);
  overflow: hidden;
}

.timer-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success), var(--warning), var(--error));
  transition: width 0.1s linear;
}

/* Answers Grid */
.answers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.answers-grid.single {
  grid-template-columns: 1fr;
}

.answer-btn {
  background: rgba(255,255,255,0.05);
  border: 2px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
  text-align: left;
}

.answer-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
  transform: translateX(4px);
}

.answer-btn.selected {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--primary);
}

.answer-btn.correct {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--success);
  animation: correct 0.5s;
}

.answer-btn.wrong {
  background: rgba(239, 68, 68, 0.2);
  border-color: var(--error);
  animation: shake 0.5s;
}

@keyframes correct {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.option-label {
  width: 36px;
  height: 36px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.answer-btn:hover .option-label {
  background: var(--primary);
}

.option-text {
  font-weight: 500;
  font-size: 1rem;
}

/* Feedback */
.answer-feedback {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  border-radius: 16px;
  margin-top: 1rem;
}

.answer-feedback.correct {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--success);
}

.feedback-icon {
  font-size: 2rem;
}

.feedback-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.feedback-text strong {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.feedback-text span {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.btn-next {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-next:hover {
  background: var(--primary-dark);
  transform: translateX(4px);
}

/* Rewards Section */
.rewards-section {
  padding: 6rem 2rem;
  background: rgba(0,0,0,0.2);
}

.rewards-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.stats-card {
  background: var(--card);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid var(--border);
}

.stats-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-box {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.stat-box:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}

.stat-box .stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.daily-rewards {
  background: var(--card);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid var(--border);
}

.daily-rewards h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.rewards-track {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.reward-day {
  flex: 1;
  min-width: 100px;
  text-align: center;
  padding: 1.5rem 1rem;
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.reward-day:hover:not(.claimed):not(.locked) {
  border-color: var(--warning);
  transform: translateY(-4px);
}

.reward-day.available {
  border-color: var(--warning);
  background: rgba(245, 158, 11, 0.1);
  animation: pulse-border 2s infinite;
}

.reward-day.claimed {
  opacity: 0.5;
  border-color: var(--success);
}

.reward-day.locked {
  opacity: 0.3;
  cursor: not-allowed;
}

@keyframes pulse-border {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
}

.day-number {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.reward-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.reward-amount {
  font-weight: 700;
  color: var(--warning);
}

.claimed-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: var(--success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.reward-hint {
  text-align: center;
  color: var(--text-muted);
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

.achievements-section {
  background: var(--card);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid var(--border);
}

.achievements-section h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border);
  display: flex;
  gap: 1rem;
  opacity: 0.6;
  transition: all 0.3s;
  cursor: pointer;
}

.achievement-card:hover {
  opacity: 1;
  transform: translateY(-4px);
}

.achievement-card.unlocked {
  opacity: 1;
  border-color: var(--success);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent);
}

.achievement-card.claimable {
  border-color: var(--warning);
  animation: pulse 2s infinite;
}

.achievement-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.achievement-info {
  flex: 1;
}

.achievement-info h4 {
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.achievement-info p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.achievement-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.achievement-progress .progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.3s;
}

.achievement-progress span {
  font-size: 0.75rem;
  color: var(--text-muted);
  min-width: 3rem;
  text-align: right;
}

.achievement-reward {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.achievement-reward span {
  color: var(--warning);
  font-weight: 700;
}

.btn-claim {
  background: var(--warning);
  color: var(--dark);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-claim:hover {
  transform: scale(1.05);
}

.achievement-claimed {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  color: var(--success);
  font-size: 0.875rem;
}

.shop-preview {
  background: var(--card);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid var(--border);
}

.shop-preview h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.shop-preview > p {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.shop-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.shop-item:hover {
  border-color: var(--primary);
}

.shop-item.owned {
  opacity: 0.5;
}

.item-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.item-info p {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.btn-buy {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-buy.affordable {
  background: var(--warning);
  color: var(--dark);
  border-color: var(--warning);
}

.btn-buy.affordable:hover {
  transform: scale(1.05);
}

.btn-buy.owned {
  background: var(--success);
  color: white;
  border-color: var(--success);
  cursor: default;
}

/* Leaderboard Section */
.leaderboard-section {
  padding: 6rem 2rem;
  position: relative;
  z-index: 1;
}

.leaderboard-container {
  max-width: 1000px;
  margin: 0 auto;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 4rem;
  padding: 2rem;
}

.podium-place {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.podium-place.first {
  order: 2;
  transform: translateY(-20px);
}

.podium-place.second {
  order: 1;
}

.podium-place.third {
  order: 3;
}

.crown {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.podium-avatar {
  position: relative;
  margin-bottom: 1rem;
}

.podium-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid var(--card);
  object-fit: cover;
}

.podium-place.first .podium-avatar img {
  width: 100px;
  height: 100px;
  border-color: gold;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
}

.place-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 28px;
  height: 28px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  border: 3px solid var(--card);
}

.podium-place.first .place-badge {
  background: gold;
  color: var(--dark);
  width: 32px;
  height: 32px;
}

.podium-info {
  text-align: center;
  margin-bottom: 1rem;
}

.podium-info h4 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.podium-score {
  color: var(--primary);
  font-weight: 700;
}

.podium-base {
  width: 120px;
  height: 60px;
  background: linear-gradient(to top, var(--card), var(--card-hover));
  border-radius: 8px 8px 0 0;
  position: relative;
}

.podium-place.first .podium-base {
  height: 100px;
  width: 140px;
  background: linear-gradient(to top, rgba(255,215,0,0.1), var(--card));
}

.podium-place.second .podium-base {
  height: 80px;
  background: linear-gradient(to top, rgba(192,192,192,0.1), var(--card));
}

.podium-place.third .podium-base {
  height: 60px;
  background: linear-gradient(to top, rgba(205,127,50,0.1), var(--card));
}

.leaderboard-list {
  background: var(--card);
  border-radius: 20px;
  border: 1px solid var(--border);
  overflow: hidden;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.3s;
}

.leaderboard-item:hover {
  background: rgba(255,255,255,0.02);
}

.leaderboard-item:last-child {
  border-bottom: none;
}

.rank {
  width: 40px;
  font-weight: 800;
  color: var(--text-muted);
  font-size: 1.125rem;
}

.player-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 1rem;
  object-fit: cover;
}

.player-info {
  flex: 1;
}

.player-name {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.player-status {
  font-size: 0.875rem;
  color: var(--success);
}

.player-stats {
  text-align: right;
}

.player-score {
  display: block;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--primary);
}

.player-trend {
  font-size: 0.875rem;
}

.player-trend.up { color: var(--success); }
.player-trend.down { color: var(--error); }
.player-trend.same { color: var(--text-muted); }

/* Level Up Modal */
.level-up .modal-content {
  background: linear-gradient(135deg, var(--card), rgba(99, 102, 241, 0.1));
  border-color: var(--primary);
}

.level-up-animation {
  text-align: center;
}

.level-badge {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 50px;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  animation: scale-in 0.5s ease;
}

@keyframes scale-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.level-up-animation h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.level-up-animation p {
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.rewards-gained {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.rewards-gained span {
  font-size: 1.5rem;
  font-weight: 700;
}

.level-up-animation button {
  padding: 1rem 3rem;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.level-up-animation button:hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
 
  .hero-title {
    font-size: 3rem;
  }
 
  .activity-ticker {
    margin: 0 auto;
  }
 
  .hero-visual {
    display: none;
  }
 
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .completion-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 80%;
    max-width: 300px;
    height: 100vh;
    background: var(--card);
    flex-direction: column;
    padding: 6rem 2rem 2rem;
    transition: right 0.3s;
    border-left: 1px solid var(--border);
  }
 
  .nav-links.active {
    right: 0;
  }
 
  .mobile-toggle {
    display: flex;
    z-index: 1001;
  }
 
  .hero-title {
    font-size: 2.5rem;
  }
 
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
 
  .modes-grid {
    grid-template-columns: 1fr;
  }
 
  .answers-grid {
    grid-template-columns: 1fr;
  }
 
  .podium {
    flex-direction: column;
    align-items: center;
  }
 
  .podium-place.first {
    order: 1;
    transform: none;
  }
 
  .podium-place.second {
    order: 2;
  }
 
  .podium-place.third {
    order: 3;
  }
 
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
 
  .rewards-track {
    overflow-x: scroll;
  }
  
  .title-display {
    font-size: 1.25rem;
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--darker);
}

::-webkit-scrollbar-thumb {
  background: var(--card);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--card-hover);
}
</style>