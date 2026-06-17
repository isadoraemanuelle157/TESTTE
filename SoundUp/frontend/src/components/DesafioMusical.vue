<template>
  <div id="app" class="rhythm-quest">
    <!-- Toast Container -->
<div class="toast-container">
  <div
    v-for="(toast, index) in toasts"
    :key="toast.id"
    class="toast-item"
    :class="toast.type"
  >
    <i :class="toast.icon"></i>
    <span>{{ toast.message }}</span>
  </div>
</div>
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
        </div>
       
        <div class="nav-links" :class="{ 'active': mobileMenuOpen }">
          <a href="#modes" class="nav-link">Modos</a>
          <a href="#leaderboard" class="nav-link">Ranking</a>
          <a href="#rewards" class="nav-link">Recompensas</a>
          <div class="user-coins" v-if="totalCoins > 0">
            <span class="coin-icon"><i class="fa-solid fa-coins"></i></span>
            <span class="coin-amount">{{ totalCoins }}</span>
          </div>
          <button class="btn-primary" @click="startGame">
            <span>Jogar Agora</span>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button
  v-if="hasEmojiPack"
  class="btn-emoji-toggle"
  :class="{ 'active': customIconsActive }"
  @click="toggleCustomIcons"
  title="Alternar ícones musicais customizados"
>
  <i :class="customIconsActive ? 'fa-solid fa-icons' : 'fa-solid fa-icons'"></i>
</button>
<button
  v-else
  class="btn-emoji-locked"
  title="Compre o Pack de Ícones na loja para desbloquear"
  @click="showNotification('Compre o Pack de Ícones na loja para desbloquear!', 'info')"
>
  <i class="fa-solid fa-lock"></i>
</button>
          <button
  v-if="hasThemeItem"
  class="btn-theme-toggle"
  :class="{ 'dark': themeDark }"
  @click="toggleTheme"
  title="Alternar tema claro/escuro"
>
  <i :class="themeDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
</button>
<button
  v-else
  class="btn-theme-locked"
  title="Compre o Tema Noturno na loja para desbloquear"
  @click="showNotification('Compre o Tema Noturno na loja para desbloquear!', 'info')"
>
  <i class="fa-solid fa-lock"></i>
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
                <img
  :src="activity.avatar"
  :alt="activity.user"
  class="ticker-avatar"
  @error="$event.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(activity.user) + '&background=6366f1&color=fff'"
>
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
  <div
    class="vinyl-record"
    :class="{
      'playing': isPlaying,
      'rare-vinyl': hasRareVinyl,
      'rare-vinyl-equipped': hasRareVinylEquipped || forceVinylEquipped  // ← ADICIONAR forceVinylEquipped
    }"
  >
    <div class="vinyl-grooves"></div>
    <div class="vinyl-label">
      <div class="label-center"></div>
    </div>
    <div class="tonearm" :class="{ 'active': isPlaying }"></div>
  </div>
 
  <!-- Botão de equipar/desequipar -->
  <div v-if="hasRareVinyl" class="vinil-controls">
    <button
      v-if="!hasRareVinylEquipped && !forceVinylEquipped"  
      class="btn-equip-vinil"
      @click="equipRareVinyl"
    >
      <i class="fa-solid fa-compact-disc"></i> Equipar Vinil
    </button>
    <button
      v-else
      class="btn-unequip-vinil"
      @click="unequipRareVinyl"
    >
      <i class="fa-solid fa-xmark"></i> Desequipar
    </button>
  </div>
       
    <div class="floating-cards">

  <div class="float-card card-1" :style="cardStyles[0]">
    <div class="card-icon">
      <i class="fa-solid fa-music"></i>
    </div>

    <div class="card-info">
      <div class="card-title">Complete a Música</div>
      <div class="card-meta">Nível Hard</div>
    </div>
  </div>

  <div class="float-card card-2" :style="cardStyles[1]">
    <div class="card-icon">
      <i class="fa-solid fa-microphone-lines"></i>
    </div>

    <div class="card-info">
      <div class="card-title">Adivinhe o Artista</div>
      <div class="card-meta">Pop 2024</div>
    </div>
  </div>

  <div class="float-card card-3" :style="cardStyles[2]">
    <div class="card-icon">
      <i class="fa-solid fa-guitar"></i>
    </div>

    <div class="card-info">
      <div class="card-title">Adivinhe a Música</div>
      <div class="card-meta">Rock Clássico</div>
    </div>
  </div>

  <div class="float-card card-4" :style="cardStyles[3]">
    <div class="card-icon">
      <i class="fa-solid fa-headphones"></i>
    </div>

    <div class="card-info">
      <div class="card-title">Quiz Musical</div>
      <div class="card-meta">Expert Mode</div>
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
  v-for="diff in serverDifficulties"
  :key="diff.level"
  class="difficulty-btn"
  :class="[diff.level, { 'completed': diff.completed }]"
  :disabled="diff.locked"
  @click="startGameWithDifficulty(diff)"
>
            <div class="diff-icon"><i :class="diff.iconClass || 'fa-solid fa-star'"></i></div>
            <div class="diff-info">
              <strong>{{ diff.name }}</strong>
              <span>{{ diff.description }}</span>
            </div>
            <div class="diff-status">
              <span v-if="diff.completed" class="completed-badge"><i class="fa-solid fa-check"></i> Completo</span>
              <span v-else-if="diff.locked" class="locked-badge"><i class="fa-solid fa-lock"></i> Bloqueado</span>
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
              <div class="progress-fill" :style="{ width: `${(currentQuestionNum / totalQuestions) * 100}%` }"></div>
            </div>
            <span class="progress-text">{{ currentQuestionNum }}/{{ totalQuestions }}</span>
          </div>
          <div class="game-stats">
            <div class="stat-item">
              <span class="stat-label">Pontos</span>
              <span class="score-value">{{ score }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Moedas</span>
              <span class="coin-value"><i class="fa-solid fa-coins"></i> {{ sessionCoins }}</span>
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
            <p><i class="fa-solid fa-triangle-exclamation"></i> Erro ao carregar músicas da API</p>
            <p class="error-subtext">Usando modo offline com músicas locais...</p>
            <button @click="useOfflineMode">Jogar Offline</button>
          </div>

          <!-- Game Completed State -->
          <div v-else-if="gameCompleted" class="game-completed">
            <div class="completion-animation">
              <div class="trophy"><i class="fa-solid fa-trophy"></i></div>
              <h2>Desafio Completado!</h2>
              <p>Você completou o nível {{ currentDifficulty?.name }}</p>
             
              <div class="completion-stats">
                <div class="comp-stat">
                  <span class="comp-label">Pontuação</span>
                  <span class="comp-value">{{ score }}</span>
                </div>
                <div class="comp-stat">
                  <span class="comp-label">Moedas</span>
                  <span class="comp-value"><i class="fa-solid fa-coins"></i> {{ sessionCoins }}</span>
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
  type="button"
>
  <span>Próximo Nível: {{ nextDifficulty?.name }}</span>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
</button>

<!-- ⚡ Mostra mensagem quando NÃO desbloqueou o próximo nível -->
<div
  v-else-if="nextDifficulty && currentDifficulty?.level !== 'hard'"
  class="unlock-hint"
>
  <i class="fa-solid fa-lock"></i>
  Acerte pelo menos <strong>70%</strong> para desbloquear o nível <strong>{{ nextDifficulty?.name }}</strong>
</div>
               
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
                <span class="mode-tag"><i class="fa-solid fa-headphones"></i> Adivinhe a Música</span>
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
               
             <div class="audio-visualizer-large" v-if="isAudioPlaying" @mouseenter="showPauseButton = true" @mouseleave="showPauseButton = false">
  <div v-for="n in 12" :key="n" class="viz-bar" :style="{ animationDelay: `${n * 0.1}s` }"></div>
  <button v-if="showPauseButton" class="btn-pause-overlay" @click.stop="toggleAudio">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  </button>
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
                <span class="mode-tag"><i class="fa-solid fa-microphone-lines"></i> Adivinhe o Artista</span>
                <span class="difficulty-tag" :class="currentDifficulty?.level">{{ currentDifficulty?.name }}</span>
              </div>
             
              <div class="artist-challenge">
                <div class="voice-wave-container">
                  <div class="voice-avatar" :class="{ 'speaking': isAudioPlaying }">
                    <div class="avatar-glow"></div>
                    <img v-if="currentTrack?.artist?.picture_medium" :src="currentTrack.artist.picture_medium" :alt="currentTrack.artist.name" class="artist-blur">
                    <span v-else class="mic-icon"><i class="fa-solid fa-microphone"></i></span>
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
                  <i class="fa-solid fa-music"></i> Modo Difícil: Sem preview de áudio!
                </p>
              </div>

              <div class="timer-bar">
                <div class="timer-fill" :style="{ width: `${timerWidth}%` }"></div>
              </div>
            </div>

            <!-- COMPLETE A MÚSICA - MELHORADO -->
            <div v-else-if="currentGame.id === 'complete-lyric'" class="question-card">
              <div class="mode-indicator">
                <span class="mode-tag"><i class="fa-solid fa-music"></i> Complete a Música</span>
                <span class="difficulty-tag" :class="currentDifficulty?.level">{{ currentDifficulty?.name }}</span>
              </div>
             
              <div class="lyrics-challenge">
               

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
                    Artista: {{ currentTrack?.musica?.artista }}
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
                <span class="mode-tag"><i class="fa-solid fa-guitar"></i> Quiz Musical</span>
                <span class="difficulty-tag" :class="currentDifficulty?.level">{{ currentDifficulty?.name }}</span>
              </div>
             
              <div class="trivia-challenge">
                <div class="trivia-category" :style="{ background: currentTrack?.corCategoria }">
                  {{ currentTrack?.categoria }}
                </div>
               
               <div class="trivia-question">
  <div class="question-icon">
    <i :class="getTriviaIcon(currentTrack?.categoria)"></i>
  </div>
  <h3>{{ currentTrack?.pergunta }}</h3>
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
            <div v-if="showAnswer && !gameCompleted" class="answer-feedback" :class="{ 'correct': selectedAnswer === correctAnswerIndex }">
              <div class="feedback-icon">
                <i :class="selectedAnswer === correctAnswerIndex ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
              </div>
              <div class="feedback-text">
                <strong>{{ selectedAnswer === correctAnswerIndex ? 'Correto!' : 'Errado!' }}</strong>
                <span v-if="selectedAnswer === correctAnswerIndex">
                 +{{ lastPointsGained }} pontos / <i class="fa-solid fa-coins"></i> {{ lastCoinsGained }} moedas
                </span>
                <span v-else>Era: {{ getCorrectAnswerText() }}</span>
              </div>
              <button class="btn-next" @click="nextQuestion">Próxima <i class="fa-solid fa-arrow-right"></i></button>
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
              <span class="stat-icon"><i class="fa-solid fa-coins"></i></span>
              <span class="stat-number">{{ totalCoins }}</span>
              <span class="stat-label">Moedas Totais</span>
            </div>
            <div class="stat-box">
              <span class="stat-icon"><i class="fa-solid fa-star"></i></span>
              <span class="stat-number">{{ totalScore }}</span>
              <span class="stat-label">Pontuação Máxima</span>
            </div>
            <div class="stat-box">
              <span class="stat-icon"><i class="fa-solid fa-fire"></i></span>
              <span class="stat-number">{{ streak }}</span>
              <span class="stat-label">Dias Seguidos</span>
            </div>
            <div class="stat-box">
              <span class="stat-icon"><i class="fa-solid fa-bullseye"></i></span>
           <span class="stat-number">{{ overallAccuracy }}%</span>
              <span class="stat-label">Precisão</span>
            </div>
          </div>
        </div>

        <!-- Daily Rewards -->
        <div class="daily-rewards">
          <h3>Recompensa Diária</h3>
          <div class="rewards-track">
        <div
  v-for="(day, idx) in serverDailyRewards"
  :key="idx"
  class="reward-day"
  :class="{
    'claimed': day.claimed,
    'available': day.disponivel && !day.claimed,
    'locked': !day.disponivel && !day.claimed
  }"
  @click="claimDailyReward(day)"
>
                <div class="day-number">Dia {{ day.dia }}</div>
              <div class="reward-icon"><i :class="day.iconClass || 'fa-solid fa-gift'"></i></div>
              <div class="reward-amount"><i class="fa-solid fa-coins"></i> {{ day.moedas }}</div>
              <div v-if="day.claimed" class="claimed-badge"><i class="fa-solid fa-check"></i></div>
            </div>
          </div>
          <p class="reward-hint" v-if="!canClaimDaily">
            Volte amanhã para mais recompensas! Próximo resgate em: {{ nextClaimTime }}
          </p>
          <p class="reward-hint" v-else-if="!serverDailyRewards.find(d => d.available && !d.claimed)">
            Clique no próximo dia disponível para resgatar!
          </p>
        </div>

        <!-- Achievements -->
        <div class="achievements-section">
          <h3>Conquistas</h3>
          <div class="achievements-grid">
            <div
              v-for="(achievement, idx) in serverAchievements"
              :key="idx"
              class="achievement-card"
          :class="{ 'unlocked': achievement.desbloqueada, 'claimable': achievement.claimable && !achievement.resgatada }"
            >
              <div class="achievement-icon"><i :class="achievement.iconClass || 'fa-solid fa-medal'"></i></div>
              <div class="achievement-info">
                 <h4>{{ achievement.titulo }}</h4>
    <p>{{ achievement.descricao }}</p>
                <div class="achievement-progress" v-if="!achievement.desbloqueada">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${(achievement.current/achievement.total)*100}%` }"></div>
                  </div>
                  <span>{{ achievement.current }}/{{ achievement.total }}</span>
                </div>
                <div class="achievement-reward" v-if="achievement.desbloqueada && !achievement.resgatada">
                   <span><i class="fa-solid fa-coins"></i> {{ achievement.moedas }}</span>
                  <button class="btn-claim" @click="claimAchievement(achievement)">Resgatar</button>
                </div>
                <div class="achievement-claimed" v-else-if="achievement.resgatada">
                  <span><i class="fa-solid fa-check"></i> Resgatado</span>
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
            <div v-for="(item, idx) in serverShopItems" :key="idx"
            class="shop-item" :class="{ 'owned': item.possuido }">
              <div class="item-icon"><i :class="item.iconClass || 'fa-solid fa-box-open'"></i></div>
              <div class="item-info">
                 <h4>{{ item.nome }}</h4>
    <p>{{ item.descricao }}</p>
              </div>
<button
  class="btn-buy"
  :class="{
    'owned': item.possuido,
    'affordable': totalCoins >= item.preco && !item.possuido,
    'equipped': item.equipado || item.ativo
  }"
  @click="item.possuido ? (item.tipo === 'emoji' ? toggleActivateEmoji(item) : toggleEquipItem(item)) : buyItem(item)"
  :disabled="!item.possuido && totalCoins < item.preco || (item.tipo === 'emoji' && item.ativo)"
>
  <span v-if="item.possuido && (item.equipado || item.ativo)">✓ Ativado</span>
  <span v-else-if="item.possuido && item.tipo === 'emoji'">Ativar Ícones</span>
  <span v-else-if="item.possuido">Equipar</span>
  <span v-else><i class="fa-solid fa-coins"></i> {{ item.preco }}</span>
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
<div class="podium-place second" v-if="top2">
    <div class="podium-avatar">
      <img :src="top2.usuario?.avatar || `https://i.pravatar.cc/150?img=12`" alt="2º lugar">
      <div class="place-badge">2</div>
    </div>
    <div class="podium-info">
      <h4>{{ top2.usuario?.nome || 'Anônimo' }}</h4>
      <span class="podium-score">{{ (top2.pontuacao || 0).toLocaleString() }} pts</span>
    </div>
   
  </div>

<div class="podium-place first" v-if="top1">
    <div class="crown"><i class="fa-solid fa-crown"></i></div>
    <div class="podium-avatar">
      <img :src="top1.usuario?.avatar || `https://i.pravatar.cc/150?img=11`" alt="1º lugar">
      <div class="place-badge">1</div>
    </div>
    <div class="podium-info">
      <h4>{{ top1.usuario?.nome || 'Anônimo' }}</h4>
      <span class="podium-score">{{ (top1.pontuacao || 0).toLocaleString() }} pts</span>
    </div>
  </div>

 <div class="podium-place third" v-if="top3">
    <div class="podium-avatar">
      <img :src="top3.usuario?.avatar || `https://i.pravatar.cc/150?img=5`" alt="3º lugar">
      <div class="place-badge">3</div>
    </div>
    <div class="podium-info">
      <h4>{{ top3.usuario?.nome || 'Anônimo' }}</h4>
      <span class="podium-score">{{ (top3.pontuacao || 0).toLocaleString() }} pts</span>
    </div>
  </div>
</div>

<div class="leaderboard-list">
<div
  v-for="(player, index) in restLeaderboard"
  :key="player._id || `player-${index}`"
  class="leaderboard-item"
  :class="{ 'highlight': index === 0 }"
>
  <span class="rank">{{ player.posicao || (index + 4) }}</span>
  <img
    :src="player.usuario?.avatar || `https://i.pravatar.cc/150?img=${((index + 6) % 70) + 1}`"
    :alt="player.usuario?.nome || 'Anônimo'"
    class="player-avatar"
    @error="$event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.usuario?.nome || 'Anon')}&background=6366f1&color=fff`"
  >
  <div class="player-info">
    <span class="player-name">{{ player.usuario?.nome || 'Anônimo' }}</span>
    <span class="player-mode">{{ formatModeName(player.modo) }} • {{ formatDifficulty(player.dificuldade) }}</span>
  </div>
  <span class="player-score">{{ (player.pontuacao || 0).toLocaleString() }} pts</span>
  <span class="player-trend up"><i class="fa-solid fa-arrow-trend-up"></i></span>
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
            <span><i class="fa-solid fa-coins"></i> +{{ levelUpRewards.coins }}</span>
            <span><i class="fa-solid fa-star"></i> +{{ levelUpRewards.xp }} XP</span>
          </div>
          <button @click="showLevelUp = false">Continuar</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { gameApi } from '@/services/gameApi'
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
    question: 'Qual artista tem o recorde de mais Grammys ganhos?',
    options: ['Beyoncé', 'Michael Jackson', 'Georg Solti', 'Alison Krauss'],
    correct: 2
  },
  {
    category: 'Recordes',
    categoryColor: '#f39c12',
    question: 'Qual música ficou mais tempo em #1 na Billboard?',
    options: ['Old Town Road', 'Despacito', 'One Sweet Day', 'Uptown Funk'],
    correct: 0
  },
  {
    category: 'Curiosidades',
    categoryColor: '#9b59b6',
    question: 'Qual é o álbum mais vendido de todos os tempos?',
    options: ['Thriller', 'Back in Black', 'The Dark Side of the Moon', 'Rumours'],
    correct: 0
  },
  {
    category: 'Rock',
    categoryColor: '#e67e22',
    question: 'Qual banda é conhecida como "Os Fab Four"?',
    options: ['The Rolling Stones', 'The Beatles', 'Led Zeppelin', 'Pink Floyd'],
    correct: 1
  },
  {
    category: 'Pop',
    categoryColor: '#3498db',
    question: 'Quem é conhecido como o "Rei do Pop"?',
    options: ['Elvis Presley', 'Prince', 'Michael Jackson', 'Justin Timberlake'],
    correct: 2
  },
  {
    category: 'Brasil',
    categoryColor: '#2ecc71',
    question: 'Quem compôs "Garota de Ipanema"?',
    options: ['Caetano Veloso', 'Antônio Carlos Jobim', 'Gilberto Gil', 'Chico Buarque'],
    correct: 1
  },
  {
    category: 'Instrumentos',
    categoryColor: '#1abc9c',
    question: 'Qual instrumento Beethoven continuou a compor mesmo após ficar surdo?',
    options: ['Violino', 'Piano', 'Violoncelo', 'Flauta'],
    correct: 1
  },
  {
    category: 'Hip Hop',
    categoryColor: '#34495e',
    question: 'Quem é considerado o "Rei do Hip Hop"?',
    options: ['Tupac', 'The Notorious B.I.G.', 'Jay-Z', 'Eminem'],
    correct: 2
  },
  {
    category: 'Anos 80',
    categoryColor: '#e91e63',
    question: 'Qual música de Queen foi usada no filme "Wayne\'s World"?',
    options: ['We Will Rock You', 'Bohemian Rhapsody', 'Another One Bites the Dust', 'Don\'t Stop Me Now'],
    correct: 1
  },
  {
    category: 'Prêmios',
    categoryColor: '#9c27b0',
    question: 'Qual foi o primeiro videoclipe a passar na MTV?',
    options: ['Video Killed the Radio Star', 'Billie Jean', 'Money for Nothing', 'Vogue'],
    correct: 0
  },
  {
    category: 'Rock',
    categoryColor: '#ff5722',
    question: 'Em que ano o cantor Elvis Presley faleceu?',
    options: ['1975', '1976', '1977', '1978'],
    correct: 2
  },
  {
    category: 'Pop',
    categoryColor: '#673ab7',
    question: 'Qual artista feminina tem mais #1 na Billboard Hot 100?',
    options: ['Madonna', 'Rihanna', 'Mariah Carey', 'Taylor Swift'],
    correct: 2
  },
  {
    category: 'Clássica',
    categoryColor: '#795548',
    question: 'Quem compôs a "Nona Sinfonia"?',
    options: ['Mozart', 'Bach', 'Beethoven', 'Chopin'],
    correct: 2
  },
  {
    category: 'Moderno',
    categoryColor: '#607d8b',
    question: 'Qual foi a primeira música a atingir 1 bilhão de views no YouTube?',
    options: ['Gangnam Style', 'Baby', 'Despacito', 'See You Again'],
    correct: 0
  },
  {
    category: 'Festival',
    categoryColor: '#8bc34a',
    question: 'Em que país acontece o festival Tomorrowland?',
    options: ['Holanda', 'Bélgica', 'Alemanha', 'França'],
    correct: 1
  }
];

export default {
  name: 'SoundUp',
  data() {
    return {
        toasts: [],           // ← ADICIONAR
    toastIdCounter: 0,    // ← ADICIONAR
      serverDifficulties: [],
      serverLeaderboard: [],
      serverDailyRewards: [],
      serverAchievements: [],
      serverShopItems: [],
      serverStats: null,
       forceVinylEquipped: false,
      sessionId: null,
      completionResult: null,
      lastPointsGained: 0,
      lastCoinsGained: 0,
      isScrolled: false,
      mobileMenuOpen: false,
      isPlaying: true,
      isPaused: false,
      isAudioPlaying: false,
      showPauseButton: false,
      hoveredMode: null,
      currentGame: null,
      currentDifficulty: null,
      showDifficultyModal: false,
      selectedMode: null,
      currentQuestionNum: 1,
      totalQuestions: 10,
      score: 0,
      sessionCoins: 0,
      totalCoins: 0,
      totalScore: 0,
      streak: 1,
      overallAccuracy: 0,
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
      nextQuestionData: null,
      themeDark: false,
      customIconsActive: false,
     
      cardStyles: [
        { transform: 'translateY(0px) rotate(-5deg)' },
        { transform: 'translateY(-20px) rotate(0deg)' },
        { transform: 'translateY(10px) rotate(5deg)' },
         { transform: 'translateY(-10px) rotate(3deg)' }
      ],
     
      activities: [
        { user: 'Pedro_Music', song: 'Blinding Lights', time: '2m', avatar: 'https://i.pravatar.cc/150?img=1' },
        { user: 'Ana_Rock', song: 'Levitating', time: '5m', avatar: 'https://i.pravatar.cc/150?img=2' },
        { user: 'Lucas_Pop', song: 'As It Was', time: '8m', avatar: 'https://i.pravatar.cc/150?img=3' },
        { user: 'Julia_Indie', song: 'Heat Waves', time: '12m', avatar: 'https://i.pravatar.cc/150?img=4' }
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
     
      currentTrivia: null,
      answerTime: 0,
      timerInterval: null,
      lastClaimDate: null,
       cardsInterval: null
    }
  },

  watch: {
  customIconsActive(val) {
    document.body.classList.toggle('custom-icons-active', val);
  }
},

 computed: {
  hasRareVinyl() {
  const token = localStorage.getItem('token');
  if (!token) {
    const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
    return offlineInventory.some(i => i.itemId === 'vinyl_rare' && i.comprado);
  }
  return this.serverShopItems.some(i => i.id === 'vinyl_rare' && i.possuido);
},

hasRareVinylEquipped() {
  const token = localStorage.getItem('token');
  if (!token) {
    const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
    const item = offlineInventory.find(i => i.itemId === 'vinyl_rare');
    return item?.ativo || false;  // ← Verifique se 'ativo' está sendo salvo como true
  }
  const item = this.serverShopItems.find(i => i.id === 'vinyl_rare');
  return item?.equipado || false;  // ← Verifique se 'equipado' vem true da API
},

 hasThemeItem() {
    const token = localStorage.getItem('token');
    if (!token) {
      const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
      return offlineInventory.some(i => i.itemId === 'theme_dark' && i.comprado);
    }
    return this.serverShopItems.some(i => i.id === 'theme_dark' && i.possuido);
  },

  hasEmojiPack() {
    const token = localStorage.getItem('token');
    if (!token) {
      const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
      return offlineInventory.some(i => i.itemId === 'emoji_set' && i.comprado);
    }
    return this.serverShopItems.some(i => i.id === 'emoji_set' && i.possuido);
  },

  sessionAccuracy() {
    const answered = Math.max(this.currentQuestionNum - 1, 0)
    if (answered === 0) return 0
    return Math.round((this.correctAnswers / answered) * 100)
  },

top1() {
  const entry = this.serverLeaderboard?.[0]
  if (!entry) return null
  return {
    ...entry,
    usuario: entry.usuario || { nome: 'Anônimo', avatar: null }
  }
},
top2() {
  const entry = this.serverLeaderboard?.[1]
  if (!entry) return null
  return {
    ...entry,
    usuario: entry.usuario || { nome: 'Anônimo', avatar: null }
  }
},
top3() {
  const entry = this.serverLeaderboard?.[2]
  if (!entry) return null
  return {
    ...entry,
    usuario: entry.usuario || { nome: 'Anônimo', avatar: null }
  }
},
restLeaderboard() {
  const rest = this.serverLeaderboard?.slice(3) || []
  return rest.map(entry => ({
    ...entry,
    usuario: entry.usuario || { nome: 'Anônimo', avatar: null }
  }))
},

canClaimDaily() {
  const token = localStorage.getItem('token')
  if (!token) return false  // Offline não tem recompensa diária do servidor
  return this.serverDailyRewards.some(d => d.disponivel && !d.claimed)
},

  nextClaimTime() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const diff = tomorrow - new Date()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  },

  showArtistPreviewButton() {
    return this.currentGame?.id === 'guess-artist' &&
      ['easy', 'medium'].includes(this.currentDifficulty?.level)
  },

  canAdvanceLevel() {
    if (!this.currentDifficulty) return false
    const levels = ['easy', 'medium', 'hard']
    const currentIndex = levels.indexOf(this.currentDifficulty.level)
    if (currentIndex < 0 || currentIndex >= levels.length - 1) return false

    const precision = this.totalQuestions > 0
      ? Math.round((this.correctAnswers / this.totalQuestions) * 100)
      : 0

    return precision >= 70
  },

  nextDifficulty() {
    if (!this.currentDifficulty) return null
    const levels = ['easy', 'medium', 'hard']
    const currentIndex = levels.indexOf(this.currentDifficulty.level)
    if (currentIndex < 0 || currentIndex >= levels.length - 1) return null

    const nextLevel = levels[currentIndex + 1]
    const found = this.serverDifficulties.find(d => d.level === nextLevel)
    if (found) return found

    const names = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }
    const times = { easy: 30, medium: 20, hard: 15 }
    const mults = { easy: 1, medium: 1.5, hard: 2.5 }

    return {
      level: nextLevel,
      name: names[nextLevel],
      timeLimit: times[nextLevel],
      multiplier: mults[nextLevel],
      description: `${times[nextLevel]}s por pergunta`,
      completed: false,
      locked: false,
      bestScore: 0
    }
  },

  maskedTitle() {
    if (!this.currentTrack?.tituloMascarado) return []
    return this.currentTrack.tituloMascarado.map(word => ({
      text: word.texto,
      hidden: word.oculto,
      revealed: !word.oculto || this.showAnswer
    }))
  }
},

async mounted() {
  window.addEventListener('scroll', this.handleScroll)
  this.animateCards()
  const savedTheme = localStorage.getItem('soundup_theme');
  if (savedTheme) {
    this.themeDark = savedTheme === 'dark';
    document.body.classList.toggle('theme-dark', this.themeDark);
    this.customIconsActive = localStorage.getItem('soundup_custom_icons') === 'true';
  }
 
  await this.loadServerData();
},

 
beforeUnmount() {
  window.removeEventListener('scroll', this.handleScroll)
  this.cleanupAudio()

  if (this.timerInterval) clearInterval(this.timerInterval)
  if (this.cardsInterval) clearInterval(this.cardsInterval)
},
 
  methods: {
    // ⬇️ ADICIONAR ISTO nos methods
getTriviaIcon(categoria) {
  const icons = {
    'História': 'fa-solid fa-landmark',
    'Recordes': 'fa-solid fa-trophy',
    'Curiosidades': 'fa-solid fa-lightbulb',
    'Rock': 'fa-solid fa-guitar',
    'Pop': 'fa-solid fa-microphone-lines',
    'Brasil': 'fa-solid fa-flag',
    'Instrumentos': 'fa-solid fa-drum',
    'Hip Hop': 'fa-solid fa-headphones',
    'Anos 80': 'fa-solid fa-compact-disc',
    'Prêmios': 'fa-solid fa-medal',
    'Clássica': 'fa-solid fa-music',
    'Moderno': 'fa-solid fa-mobile-screen',
    'Festival': 'fa-solid fa-calendar-star',
    'Álbuns': 'fa-solid fa-record-vinyl',
    'Produção': 'fa-solid fa-sliders',
    'Polêmica': 'fa-solid fa-fire',
    'Alternativo': 'fa-solid fa-compact-disc',
    'Eletrônica': 'fa-solid fa-bolt',
    'Mundo': 'fa-solid fa-globe',
    'MPB': 'fa-solid fa-music',
    'Internet': 'fa-solid fa-wifi',
    'Festivais': 'fa-solid fa-calendar-days'
  }
  return icons[categoria] || 'fa-solid fa-music'
},

    async toggleActivateEmoji(item) {
  if (item.ativo) return; // já ativo
 
  const token = localStorage.getItem('token');
 
  if (!token) {
    const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
    const invItem = offlineInventory.find(i => i.itemId === item.id);
    if (invItem) {
      invItem.ativo = true;
      localStorage.setItem('soundup_inventory', JSON.stringify(offlineInventory));
      this.customIconsActive = true;
      localStorage.setItem('soundup_custom_icons', 'true');
      this.loadOfflineInventory();
    }
    return;
  }
 
  try {
    await gameApi.equipItem(item.id);
    this.customIconsActive = true;
    localStorage.setItem('soundup_custom_icons', 'true');
    const shopRes = await gameApi.getShop();
    this.serverShopItems = shopRes.data.items.map(i => ({
      ...i,
      equipado: i.ativo || false,
      ativo: i.ativo || false
    }));
  } catch (error) {
    console.error('Erro ao ativar ícones:', error);
  }
},
   async equipRareVinyl() {
  const token = localStorage.getItem('token');
  if (!token) {
    const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
    const invItem = offlineInventory.find(i => i.itemId === 'vinyl_rare');
    if (invItem) {
      invItem.ativo = true;
      localStorage.setItem('soundup_inventory', JSON.stringify(offlineInventory));
      this.loadOfflineInventory();
      this.forceVinylEquipped = true;   // ← ADICIONAR AQUI
      this.showNotification('Vinil Raro equipado!', 'success');
    }
    return;
  }
  try {
    await gameApi.equipItem('vinyl_rare');
    const shopRes = await gameApi.getShop();
    this.serverShopItems = shopRes.data.items.map(i => ({
      ...i,
      equipado: i.ativo || false
    }));
    this.forceVinylEquipped = true;   // ← ADICIONAR AQUI
    this.showNotification('Vinil Raro equipado!', 'success');
  } catch (error) {
    console.error('Erro ao equipar vinil:', error);
    this.showNotification('Erro ao equipar vinil', 'error');
  }
},

async unequipRareVinyl() {
  const token = localStorage.getItem('token');
  if (!token) {
    const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
    const invItem = offlineInventory.find(i => i.itemId === 'vinyl_rare');
    if (invItem) {
      invItem.ativo = false;
      localStorage.setItem('soundup_inventory', JSON.stringify(offlineInventory));
      this.loadOfflineInventory();
      this.forceVinylEquipped = false;   // ← ADICIONAR AQUI
      this.showNotification('Vinil Raro desequipado!', 'success');
    }
    return;
  }
  try {
    await gameApi.unequipItem('vinyl_rare');
    const shopRes = await gameApi.getShop();
    this.serverShopItems = shopRes.data.items.map(i => ({
      ...i,
      equipado: i.ativo || false
    }));
    this.forceVinylEquipped = false;   // ← ADICIONAR AQUI
    this.showNotification('Vinil Raro desequipado!', 'success');
  } catch (error) {
    console.error('Erro ao desequipar vinil:', error);
    this.showNotification('Erro ao desequipar vinil', 'error');
  }
},

    toggleTheme() {
  this.themeDark = !this.themeDark;
  document.body.classList.toggle('theme-dark', this.themeDark);
  localStorage.setItem('soundup_theme', this.themeDark ? 'dark' : 'light');
},

    async toggleCustomIcons() {
      const token = localStorage.getItem('token');
     
      if (!token) {
        // Modo offline
        const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
        const invItem = offlineInventory.find(i => i.itemId === 'emoji_set');
        if (invItem) {
          invItem.ativo = !invItem.ativo;
          localStorage.setItem('soundup_inventory', JSON.stringify(offlineInventory));
          this.customIconsActive = invItem.ativo;
          localStorage.setItem('soundup_custom_icons', String(invItem.ativo));
          this.loadOfflineInventory();
          this.showNotification(
            invItem.ativo ? 'Ícones customizados ativados!' : 'Ícones customizados desativados!',
            'success'
          );
        }
        return;
      }
     
      // Modo online
      try {
        const newState = !this.customIconsActive;
        if (newState) {
          await gameApi.equipItem('emoji_set');
        } else {
          await gameApi.unequipItem('emoji_set');
        }
        this.customIconsActive = newState;
        localStorage.setItem('soundup_custom_icons', String(newState));
       
        const shopRes = await gameApi.getShop();
        this.serverShopItems = shopRes.data.items.map(i => ({
          ...i,
          equipado: i.ativo || false,
          ativo: i.ativo || false
        }));
       
        this.showNotification(
          newState ? 'Ícones customizados ativados!' : 'Ícones customizados desativados!',
          'success'
        );
      } catch (error) {
        console.error('Erro ao alternar ícones:', error);
        this.showNotification('Erro ao alternar ícones', 'error');
      }
    },

showNotification(message, type = 'info') {
  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-xmark',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info'
  }
 
  const toast = {
    id: ++this.toastIdCounter,
    message,
    type,
    icon: icons[type] || icons.info
  }
 
  this.toasts.push(toast)
 
  setTimeout(() => {
    const idx = this.toasts.findIndex(t => t.id === toast.id)
    if (idx !== -1) this.toasts.splice(idx, 1)
  }, 3000)
},

showCoinAnimation(coins) {
  console.log(`+${coins} moedas`)
},

 async buyItem(item) {
  if (item.possuido) {
    this.showNotification('Item já possuído!', 'warning')
    return
  }

  if (this.totalCoins < item.preco) {
    this.showNotification('Moedas insuficientes!', 'error')
    return
  }

  const token = localStorage.getItem('token')

  if (!token) {
    try {
      const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]')

      if (offlineInventory.some(i => i.itemId === item.id)) {
        this.showNotification('Item já possuído!', 'warning')
        return
      }

      offlineInventory.push({
        itemId: item.id,
        nome: item.nome,
        icon: item.icon,
        tipo: item.tipo || 'geral',
        comprado: true,
        ativo: true,
        dataCompra: new Date().toISOString()
      })

      localStorage.setItem('soundup_inventory', JSON.stringify(offlineInventory))

      this.totalCoins -= item.preco
      localStorage.setItem('soundup_coins', String(this.totalCoins))

      const itemIndex = this.serverShopItems.findIndex(i => i.id === item.id)
      if (itemIndex >= 0) {
        this.serverShopItems[itemIndex].possuido = true
        this.serverShopItems[itemIndex].equipado = true
        this.serverShopItems[itemIndex].podeComprar = false
      }

      this.showNotification(`🛒 ${item.nome} comprado e ativado!`, 'success')
    } catch (error) {
      console.error('Erro compra offline:', error)
      this.showNotification('Erro ao comprar item', 'error')
    }
    return
  }

  try {
    const res = await gameApi.buyItem({ itemId: item.id })

    if (res.data.success) {
      this.totalCoins = res.data.moedasRestantes

      const shopRes = await gameApi.getShop()
      this.serverShopItems = shopRes.data.items.map(i => ({
        ...i,
        equipado: i.ativo || i.equipado || false
      }))

      this.showNotification(`🛒 ${item.nome} comprado!`, 'success')
    } else {
      throw new Error(res.data.error || 'Erro desconhecido')
    }
  } catch (error) {
    console.error('Erro ao comprar:', error)
    const msg = error.response?.data?.error || error.message || 'Erro ao comprar item'
    this.showNotification(msg, 'error')
  }
},

// ⚡ NOVO: Equipar/Desequipar item
async toggleEquipItem(item) {
  // Se já está equipado, permite desequipar
  if (item.equipado) {
    // Desequipar
    await this.unequipItem(item);
    return;
  }
 
  const token = localStorage.getItem('token');
 
  if (!token) {
    // Modo offline
    const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
    const invItem = offlineInventory.find(i => i.itemId === item.id);
    if (invItem) {
      // Desativa TODOS os outros do mesmo tipo antes de equipar
      offlineInventory.forEach(i => {
        if (i.tipo === invItem.tipo && i.itemId !== item.id) {
          i.ativo = false;
        }
      });
      invItem.ativo = true;
      localStorage.setItem('soundup_inventory', JSON.stringify(offlineInventory));
      this.loadOfflineInventory();
      
      // Dispara evento para atualizar o perfil
      window.dispatchEvent(new CustomEvent('inventory-updated'));
    }
    return;
  }
 
  // Modo online
  try {
    // Primeiro desequipa todos do mesmo tipo
    const sameTypeItems = this.serverShopItems.filter(i => 
      i.tipo === item.tipo && i.id !== item.id && i.equipado
    );
    for (const otherItem of sameTypeItems) {
      await gameApi.unequipItem(otherItem.id);
    }
    
    // Depois equipa o selecionado
    await gameApi.equipItem(item.id);
    
    // Atualiza estado local
    this.serverShopItems = this.serverShopItems.map(i => ({
      ...i,
      equipado: i.id === item.id ? true : (i.tipo === item.tipo ? false : i.equipado)
    }));
    
    // Dispara evento
    window.dispatchEvent(new CustomEvent('inventory-updated'));
  } catch (error) {
    console.error('Erro ao equipar:', error);
  }
},
loadOfflineInventory() {
  const offlineInventory = JSON.parse(localStorage.getItem('soundup_inventory') || '[]');
  const offlineCoins = parseInt(localStorage.getItem('soundup_coins') || '0');
 
  // ← ADICIONAR: sincroniza estado do vinil
  const vinylItem = offlineInventory.find(i => i.itemId === 'vinyl_rare');
  this.forceVinylEquipped = vinylItem?.ativo || false;
 
  if (offlineInventory.length > 0 && this.serverShopItems.length > 0) {
    this.serverShopItems = this.serverShopItems.map(item => {
      const invItem = offlineInventory.find(i => i.itemId === item.id);
      const owned = !!invItem;
     
      return {
        ...item,
        possuido: owned,
        equipado: owned ? invItem.ativo : false,  // ← NOVO
        podeComprar: !owned && offlineCoins >= item.preco
      };
    });
  }
},
    formatModeName(mode) {
    const names = {
      'guess-song': '🎵 Adivinhe a Música',
      'guess-artist': '🎤 Adivinhe o Artista',
      'complete-lyric': '📝 Complete a Música',
      'music-trivia': '🎸 Quiz Musical'
    };
    return names[mode] || mode;
  },

   formatDifficulty(diff) {
    const names = {
      'easy': 'Fácil',
      'medium': 'Médio',
      'hard': 'Difícil'
    };
    return names[diff] || diff;
  },

normalizeQuestion(pergunta) {
  if (!pergunta) return null

  return {
    ...pergunta,
    title: pergunta?.musica?.titulo || pergunta?.title || '',
    preview: pergunta?.musica?.previewUrl || pergunta?.preview || null,
    release_date: pergunta?.musica?.ano ? `${pergunta.musica.ano}` : pergunta?.release_date || '',
    album: {
      title: pergunta?.musica?.album || pergunta?.album?.title || '',
      cover_medium: pergunta?.musica?.capa || pergunta?.album?.cover_medium || ''
    },
    artist: {
      name: pergunta?.musica?.artista || pergunta?.artist?.name || '',
      picture_medium: pergunta?.musica?.artistaImagem || pergunta?.artist?.picture_medium || ''
    },
    musica: pergunta?.musica || {},
    opcoes: pergunta?.opcoes || [],
    respostaCorreta: pergunta?.respostaCorreta,
    categoria: pergunta?.categoria || '',
    corCategoria: pergunta?.corCategoria || '',
    iconCategoria: pergunta?.iconCategoria || '🎵'
  }
},

async loadServerData() {
  try {
    const token = localStorage.getItem('token')
    const isLoggedIn = !!token

try {
  const leaderboardRes = await gameApi.getLeaderboard()
  // ⚡ Verifica se a resposta tem a estrutura correta
  const leaderboardData = leaderboardRes.data?.leaderboard || []
  
  // ⚡ Valida cada entrada do leaderboard
  this.serverLeaderboard = leaderboardData.map((entry, index) => ({
    _id: entry._id || `rank-${index}`,
    posicao: entry.posicao || (index + 1),
    usuario: {
      nome: entry.usuario?.nome || entry.usuario?.username || 'Anônimo',
      avatar: entry.usuario?.avatar || null,
      avatarDourado: entry.usuario?.avatarDourado || false
    },
    pontuacao: entry.pontuacao || 0,
    modo: entry.modo || 'guess-song',
    dificuldade: entry.dificuldade || 'easy',
    precisao: entry.precisao || 0
  }))
  
  console.log('✅ Leaderboard carregado:', this.serverLeaderboard.length, 'jogadores')
} catch (e) {
  console.error('❌ Erro ao carregar leaderboard:', e.message)
  this.serverLeaderboard = []
}

    try {
      const activitiesRes = await gameApi.getLiveActivities()
      this.activities = activitiesRes.data.activities || this.activities
    } catch (e) {
      console.warn('Activities offline:', e.message)
    }

    try {
      const shopRes = await gameApi.getShop()
      this.serverShopItems = (shopRes.data.items || []).map(i => ({
        ...i,
        possuido: i.possuido || i.owned || false,
  equipado: i.equipado || i.equipped || false,
  preco: i.preco || i.price || 0,
  tipo: i.tipo || i.type || 'geral'
      }))
    } catch (e) {
      console.warn('Shop offline:', e.message)
    }

    if (!isLoggedIn) {
      this.loadOfflineData()
      this.loadOfflineInventory()
      return
    }

    try {
      const statsRes = await gameApi.getStats()
      this.serverStats = statsRes.data
      this.totalCoins = this.serverStats.estatisticas?.totalMoedas || 0
      this.totalScore = this.serverStats.estatisticas?.totalPontos || 0
      this.overallAccuracy = this.serverStats.estatisticas?.precisaoMedia || 0
      this.streak = this.serverStats.estatisticas?.maiorSequencia || 0
    } catch (e) {
      console.error('Erro stats:', e.message)
    }

    try {
      const achievementsRes = await gameApi.getAchievements()
      this.serverAchievements = achievementsRes.data.achievements || []
    } catch (e) {
      console.error('Erro achievements:', e.message)
    }

    try {
      const rewardsRes = await gameApi.getDailyRewards()
      this.serverDailyRewards = (rewardsRes.data.dias || []).map(day => ({
        ...day,
        claimed: !!day.reivindicado,
        disponivel: !!day.disponivel
      }))
    } catch (e) {
      console.error('Erro rewards:', e.message)
    }

  } catch (error) {
    console.error('Erro geral:', error)
    this.loadOfflineData()
  }
},

loadOfflineData() {
  this.serverStats = {
    estatisticas: {
      totalMoedas: parseInt(localStorage.getItem('soundup_coins') || '0'),
      totalPontos: 0,
      precisaoMedia: 0
    }
  }
  this.serverAchievements = []
  this.serverDailyRewards = []
  this.serverShopItems = []

   this.loadOfflineInventory()
},
   
async loadDifficulties(modoId) {
  try {
    const res = await gameApi.getDifficulties(modoId)
    this.serverDifficulties = res.data.difficulties.map(diff => ({
      level: diff.level,
      name: diff.nome,
      icon: diff.icone,
      multiplier: diff.multiplicador,
      timeLimit: diff.tempo,
      description: `${diff.tempo}s por pergunta`,
      completed: diff.completed,
      locked: diff.locked,
      bestScore: diff.bestScore || 0
    }))
  } catch (error) {
    console.error('Erro ao carregar dificuldades:', error)
  }
},
   
async startGameWithDifficulty(difficulty) {
  if (difficulty.locked) return

  this.currentDifficulty = difficulty
  this.showDifficultyModal = false
  this.currentGame = this.selectedMode
  this.resetGame()
  this.isLoading = true
  this.loadError = false

  const token = localStorage.getItem('token')

  if (!token) {
    this.isOfflineMode = true
    this.loadNextOfflineQuestion()
    this.isLoading = false
    this.startTimer()

    this.$nextTick(() => {
      const gameSection = document.getElementById('game-demo')
      if (gameSection) gameSection.scrollIntoView({ behavior: 'smooth' })
    })
    return
  }

  try {
    const res = await gameApi.startGame(this.selectedMode.id, difficulty.level)

    this.sessionId = res.data.sessionId
    this.currentTrack = this.normalizeQuestion(res.data.pergunta)
    this.totalQuestions = res.data.config.totalPerguntas || 10
    this.currentQuestionNum = res.data.config.perguntaAtual || 1
    this.currentOptions = (this.currentTrack.opcoes || []).map(o => o.texto || o)
    this.correctAnswerIndex = this.currentTrack.respostaCorreta
    this.isOfflineMode = !!res.data.demo
    this.isLoading = false

    this.startTimer()

    this.$nextTick(() => {
      const gameSection = document.getElementById('game-demo')
      if (gameSection) gameSection.scrollIntoView({ behavior: 'smooth' })
    })
  } catch (error) {
    console.error('Erro ao iniciar jogo:', error)
    this.useOfflineMode()
    this.isLoading = false
    this.startTimer()
  }
},
   
async selectAnswer(index) {
  if (this.showAnswer) return;

  this.selectedAnswer = index;
  this.showAnswer = true;
  this.cleanupAudio();
 
  // ⚡ PARA o timer ao selecionar resposta
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
 
    // Modo offline/demo — processa localmente
    if (this.isOfflineMode || !this.sessionId || this.sessionId.toString().startsWith('demo-')) {
        this.processOfflineAnswer(index);
        return;
    }

    // Modo online — envia para API
 const answerPayload = {
  sessionId: this.sessionId,
  respostaIndex: index,
  tempoResposta: Math.floor(this.answerTime),
  // ⚡ NOVO: envia dados para demo mode funcionar corretamente
  perguntaAtual: this.currentTrack,
  respostaCorreta: this.correctAnswerIndex,
  pontuacaoAtual: this.score,
  perguntaNum: this.currentQuestionNum,
  totalPerguntas: this.totalQuestions,
  modo: this.currentGame?.id,
  dificuldade: this.currentDifficulty?.level
};

    try {
        const res = await gameApi.answerQuestion(answerPayload);
        const data = res.data;

        if (data.acertou) {
            this.correctAnswers++;
            this.lastPointsGained = data.pontosGanhos || 0;
            this.lastCoinsGained = data.moedasGanhas || 0;
            this.score = data.pontuacaoTotal || this.score;
            this.sessionCoins += data.moedasGanhas || 0;
            this.totalCoins += data.moedasGanhas || 0;
        }

        if (data.proximaPergunta) {
            this.nextQuestionData = data.proximaPergunta;
        }

        if (data.completado) {
            this.completionResult = data;
            this.gameCompleted = true;
            if (data.subiuNivel) {
                this.showLevelUp = true;
                this.levelUpRewards = { coins: data.moedasGanhas || 0, xp: data.xp || 0 };
            }
            await this.loadServerData();
        }
// ⚡ Garante que o timer pare mesmo em erro
if (this.timerInterval) {
  clearInterval(this.timerInterval);
  this.timerInterval = null;
}
    } catch (error) {
        console.error('Erro ao enviar resposta:', error);
        this.processOfflineAnswer(index);
    }
},

// NOVO MÉTODO: Processa resposta no modo offline
processOfflineAnswer(index) {
  const isCorrect = index === this.correctAnswerIndex;
 
  if (isCorrect) {
    this.correctAnswers++;
    // ⚡ RECOMPENSA DESDE A PRIMEIRA PERGUNTA
    const basePoints = 100;
    const baseCoins = 10;
    const multiplier = this.currentDifficulty?.multiplier || 1;
   
    // Bônus por streak (acertos seguidos)
    const streakBonus = Math.min(this.correctAnswers, 5); // max 5x streak
    const pts = Math.floor((basePoints + (streakBonus * 10)) * multiplier);
    const coins = Math.floor((baseCoins + (streakBonus * 2)) * multiplier);
   
    this.score += pts;
    this.sessionCoins += coins;
    this.totalCoins += coins;
    this.lastPointsGained = pts;
    this.lastCoinsGained = coins;
   
    // Efeito visual de moedas ganhas
    this.showCoinAnimation(coins);
  } else {
    this.lastPointsGained = 0;
    this.lastCoinsGained = 0;
  }
},
   
async nextQuestion() {
  // ⚡ LIMPA estados ANTES de tudo
  this.selectedAnswer = null;
  this.showAnswer = false;
  this.cleanupAudio();
 
  if (this.gameCompleted) return;
 
  // Incrementa número da pergunta
  this.currentQuestionNum++;
 
  // Verifica se completou o jogo
  if (this.currentQuestionNum > this.totalQuestions) {
  const levels = ['easy', 'medium', 'hard'];
  const currentIdx = levels.indexOf(this.currentDifficulty?.level);
  const precision = Math.round((this.correctAnswers / this.totalQuestions) * 100);
 
  // ⚡ Sempre define nivelDesbloqueado se houver próximo nível teórico
  // A regra de 70% agora é só no computed canAdvanceLevel (UI)
  const nextLevel = (currentIdx >= 0 && currentIdx < levels.length - 1)
    ? levels[currentIdx + 1]
    : null;

  this.completionResult = {
    nivelDesbloqueado: precision >= 70 ? nextLevel : null,
    proximoNivelTeorico: nextLevel,
    pontuacao: this.score,
    moedasGanhas: this.sessionCoins,
    acertos: this.correctAnswers,
    precisao: precision
  };
 
  this.completeGame();
  return;
}
 
  // Modo offline/demo: carrega próxima pergunta das tracks locais
  if (this.isOfflineMode || !this.sessionId || this.sessionId.toString().startsWith('demo-')) {
    this.loadNextOfflineQuestion();
    this.selectedAnswer = null;
    this.showAnswer = false;
    this.timerWidth = 100;
    this.answerTime = 0;
    this.startTimer();
    return;
  }
 
  // Modo online: usa próxima pergunta da API
  if (this.nextQuestionData) {
    this.currentTrack = this.normalizeQuestion(this.nextQuestionData);
    this.currentOptions = this.currentTrack.opcoes.map(o => o.texto || o);
    this.correctAnswerIndex = this.currentTrack.respostaCorreta;
    this.nextQuestionData = null;
  } else {
    // Fallback: tenta carregar do servidor ou offline
    this.loadNextOfflineQuestion();
  }
 
  this.selectedAnswer = null;
  this.showAnswer = false;
  this.timerWidth = 100;
  this.answerTime = 0;
  this.startTimer();
},
   
async claimDailyReward(day) {
  // ⚡ VALIDAÇÃO: garante que day.dia existe e é válido
  const diaNum = parseInt(day?.dia)
 
  if (!day || isNaN(diaNum) || diaNum < 1 || diaNum > 7) {
    console.error('Dia inválido:', day)
    this.showNotification('Erro: dia da recompensa inválido', 'error')
    return
  }

  // Só permite clicar se está disponível E não foi claimed
  if (!day.disponivel || day.claimed) return

  try {
    const res = await gameApi.claimDailyReward({ dia: day.dia })
    this.totalCoins = res.data.moedasTotais

    const rewardsRes = await gameApi.getDailyRewards()
    this.serverDailyRewards = rewardsRes.data.dias.map(d => ({
      ...d,
      claimed: !!d.reivindicado,
      disponivel: !!d.disponivel
    }))

    this.showNotification(`🎉 +${res.data.moedasGanhas} moedas!`, 'success')
  } catch (error) {
    this.showNotification(error.response?.data?.error || 'Erro', 'error')
  }
},
   
 async claimAchievement(achievement) {
  // Só permite resgatar se estiver desbloqueada e não resgatada
  if (!achievement.desbloqueada || achievement.resgatada) return;
 
  // Se não estiver logado, mostra alerta
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Faça login para resgatar conquistas!');
    return;
  }
 
  try {
    const res = await gameApi.claimAchievement(achievement.id);
    this.totalCoins = res.data.moedasTotais;
   
    // Recarrega conquistas do servidor
    const achievementsRes = await gameApi.getAchievements();
    this.serverAchievements = achievementsRes.data.achievements;
   
    alert(`🏆 +${res.data.moedasGanhas} moedas!`);
  } catch (error) {
    console.error('Erro ao resgatar conquista:', error);
    alert(error.response?.data?.error || 'Erro ao resgatar conquista');
  }
},
   
async advanceToNextLevel() {
  // ⚡ Usa nextDifficulty diretamente — não depende mais de completionResult
  const next = this.nextDifficulty;
  if (!next) {
    console.warn('Nenhum próximo nível disponível');
    return;
  }
 
  // Procura na lista de dificuldades; se não achar, usa o objeto retornado
  let diff = this.serverDifficulties.find(d => d.level === next.level);
  if (!diff) {
    this.serverDifficulties.push(next);
    diff = next;
  }
 
  // Desbloqueia e marca como não completado
  diff.locked = false;
  diff.completed = false;
 
  // Persiste progresso offline
  const savedProgress = JSON.parse(localStorage.getItem('soundup_progress') || '{}');
  if (!savedProgress[this.currentGame.id]) savedProgress[this.currentGame.id] = {};
  if (!savedProgress[this.currentGame.id][next.level]) {
    savedProgress[this.currentGame.id][next.level] = { completed: false, bestScore: 0 };
  }
  localStorage.setItem('soundup_progress', JSON.stringify(savedProgress));
 
  await this.startGameWithDifficulty(diff);
},

    handleScroll() {
      this.isScrolled = window.scrollY > 50;
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
       this.loadNextOfflineQuestion();
    },

loadNextOfflineQuestion() {
  const mode = this.currentGame?.id || 'guess-song'

  if (mode === 'music-trivia') {
    const used = new Set(this.usedTriviaIndices)
    let available = TRIVIA_QUESTIONS.map((q, i) => ({ ...q, _index: i }))
      .filter(q => !used.has(q._index))

    if (available.length === 0) {
      this.usedTriviaIndices = []
      available = TRIVIA_QUESTIONS.map((q, i) => ({ ...q, _index: i }))
    }

    const randomTrivia = available[Math.floor(Math.random() * available.length)]
    this.usedTriviaIndices.push(randomTrivia._index)

    this.currentTrack = {
      modo: 'music-trivia',
      pergunta: randomTrivia.question,
      categoria: randomTrivia.category,
      corCategoria: randomTrivia.categoryColor,
      iconCategoria: randomTrivia.icon,
      opcoes: randomTrivia.options.map((texto, idx) => ({
        texto,
        correta: idx === randomTrivia.correct
      })),
      respostaCorreta: randomTrivia.correct
    }

    this.currentOptions = this.currentTrack.opcoes.map(o => o.texto)
    this.correctAnswerIndex = this.currentTrack.respostaCorreta
    this.isLoading = false
    return
  }

  if (mode === 'complete-lyric') {
    // mantenha sua lógica atual do título mascarado
    // ela está quase certa
  }

  const tracks = OFFLINE_TRACKS[mode] || OFFLINE_TRACKS.guessSong
  if (!tracks.length) {
    this.loadError = true
    this.isLoading = false
    return
  }

  const randomTrack = tracks[Math.floor(Math.random() * tracks.length)]
  const options = this.generateOptions(randomTrack, tracks, mode)

  this.currentTrack = this.normalizeQuestion({
    musica: {
      titulo: randomTrack.title,
      artista: randomTrack.artist?.name,
      album: randomTrack.album?.title,
      capa: randomTrack.album?.cover_medium,
      previewUrl: randomTrack.preview,
      ano: randomTrack.release_date?.split('-')[0],
      artistaImagem: randomTrack.artist?.picture_medium || null
    },
    opcoes: options,
    respostaCorreta: options.findIndex(o => o.correta)
  })

  this.currentOptions = this.currentTrack.opcoes.map(o => o.texto || o)
  this.correctAnswerIndex = this.currentTrack.respostaCorreta
  this.isLoading = false
},

generateOptions(correctTrack, allTracks, mode) {
  const getLabel = (track) => {
    if (mode === 'guess-artist') return track.artist?.name
    return track.title
  }

  const wrong = allTracks
    .filter(t => t.id !== correctTrack.id)
    .filter(t => getLabel(t) !== getLabel(correctTrack))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)

  const options = [
    { texto: getLabel(correctTrack), correta: true },
    ...wrong.map(t => ({ texto: getLabel(t), correta: false }))
  ].sort(() => Math.random() - 0.5)

  return options
},

markDifficultyCompleted() {
  if (!this.currentDifficulty) return;
  const diff = this.serverDifficulties.find(d => d.level === this.currentDifficulty.level);
  if (diff) diff.completed = true;
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
   
   
    // Retorna o texto da resposta correta para o feedback
getCorrectAnswerText() {
  if (this.currentGame?.id === 'complete-lyric') {
    return this.currentTrack?.musica?.titulo || this.currentTrack?.title || '?';
  }
  if (!this.currentOptions || this.currentOptions.length === 0) return '?';
  return this.currentOptions[this.correctAnswerIndex] || '?';
},

    // Completa o jogo e mostra tela de conclusão
async completeGame() {
  this.gameCompleted = true;
  this.showAnswer = false;
  this.selectedAnswer = null;
  this.cleanupAudio();
  this.markDifficultyCompleted();
 
  // ⚡ LIMPA timer se estiver rodando
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
  // Finaliza no servidor se tiver sessão real (não demo)
  if (this.sessionId && !this.sessionId.toString().startsWith('demo-')) {
    try {
      await gameApi.answerQuestion(this.sessionId, -1, 0);
    } catch (e) {
      console.log('Sessão já finalizada ou erro:', e.message);
    }
  }
 const answeredCount = this.currentQuestionNum - 1; // quantas foram respondidas
const accuracy = answeredCount > 0
  ? Math.round((this.correctAnswers / answeredCount) * 100)
  : 0;
      this.accuracy = Math.round((this.accuracy + accuracy) / 2) || accuracy;
     
      const completionBonus = this.correctAnswers === this.totalQuestions ? 1000 :
                             this.correctAnswers >= this.totalQuestions / 2 ? 500 : 100;
     
      this.totalCoins += completionBonus;
      this.sessionCoins += completionBonus;
     
      // Salva progresso
      localStorage.setItem('soundup_coins', this.totalCoins);
      localStorage.setItem('soundup_score', this.totalScore);
      localStorage.setItem('soundup_accuracy', this.accuracy);
      const precision = Math.round((this.correctAnswers / this.totalQuestions) * 100);
if (precision >= 70) {
  const savedProgress = JSON.parse(localStorage.getItem('soundup_progress') || '{}');
  if (!savedProgress[this.currentGame.id]) savedProgress[this.currentGame.id] = {};
  savedProgress[this.currentGame.id][this.currentDifficulty.level] = {
    completed: true,
    bestScore: Math.max(
      savedProgress[this.currentGame.id][this.currentDifficulty.level]?.bestScore || 0,
      this.score
    )
  };
  localStorage.setItem('soundup_progress', JSON.stringify(savedProgress));
}
    },

    // Recomeça no mesmo nível
restartSameLevel() {
  if (!this.currentDifficulty) return
  this.startGameWithDifficulty(this.currentDifficulty)
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
   
async selectMode(mode) {
  // Verifica se usuário está logado para modos que precisam de auth
  const token = localStorage.getItem('token')
 
  if (!token) {
    // Modo demo/offline - não carrega dificuldades do servidor
    this.selectedMode = mode
    this.showDifficultyModal = true
    // Usa dificuldades padrão offline
// ← ADICIONAR: carregar progresso offline do localStorage
const savedProgress = JSON.parse(localStorage.getItem('soundup_progress') || '{}');
const modeProgress = savedProgress[this.selectedMode?.id] || {};

this.serverDifficulties = [
  { level: 'easy', name: 'Fácil', iconClass: 'fa-solid fa-seedling', multiplier: 1, timeLimit: 30, description: '30s por pergunta', completed: modeProgress.easy?.completed || false, locked: false, bestScore: modeProgress.easy?.bestScore || 0 },
  { level: 'medium', name: 'Médio', iconClass: 'fa-solid fa-fire', multiplier: 1.5, timeLimit: 20, description: '20s por pergunta', completed: modeProgress.medium?.completed || false, locked: !(modeProgress.easy?.completed), bestScore: modeProgress.medium?.bestScore || 0 },
  { level: 'hard', name: 'Difícil', iconClass: 'fa-solid fa-skull', multiplier: 2.5, timeLimit: 15, description: '15s por pergunta', completed: modeProgress.hard?.completed || false, locked: !(modeProgress.medium?.completed), bestScore: modeProgress.hard?.bestScore || 0 }
]
    return
  }
 
  this.selectedMode = mode
  await this.loadDifficulties(mode.id)
  this.showDifficultyModal = true
},
   
   resetGame() {
      this.currentQuestionNum = 1;
      this.score = 0;
      this.sessionCoins = 0;
      this.correctAnswers = 0;
      this.selectedAnswer = null;
      this.showAnswer = false;
      this.timerWidth = 100;
      this.isAudioPlaying = false;
      this.currentTrack = null;
      this.gameCompleted = false;
      this.completionResult = null;
      this.sessionId = null;        
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
   
animateCards() {
  if (this.cardsInterval) clearInterval(this.cardsInterval)

  this.cardsInterval = setInterval(() => {
    this.cardStyles = this.cardStyles.map((style, idx) => {
      const offset = Math.sin(Date.now() / 1000 + idx) * 10
      const rotate = (idx - 1.5) * 4 + Math.sin(Date.now() / 1500 + idx) * 3
      return {
        transform: `translateY(${offset}px) rotate(${rotate}deg)`
      }
    })
  }, 50)
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
  padding-top: 70px; /* altura da navbar fixa */
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
  top: 70px; /* abaixo da navbar principal */
  left: 0;
  right: 0;
  z-index: 999; /* abaixo da navbar principal (z-index: 1000) */
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
.btn-theme-toggle, .btn-theme-locked {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  color: var(--text);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 0.5rem;
}

.btn-theme-toggle:hover {
  background: var(--primary);
  border-color: var(--primary);
}

.btn-theme-toggle.dark {
  background: var(--warning);
  border-color: var(--warning);
  color: var(--dark);
}

.btn-theme-locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-theme-locked:hover {
  opacity: 0.7;
}

/* Tema escuro aplicado no body */
body.theme-dark {
  --darker: #f0f0f5;
  --dark: #e8e8f0;
  --card: #ffffff;
  --card-hover: #f5f5fa;
  --text: #1a1a2e;
  --text-muted: #64748b;
  --border: rgba(0,0,0,0.1);
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
  min-height: calc(100vh - 70px); /* desconta a navbar */
  display: flex;
  align-items: center;
  padding: 2rem 2rem 4rem; /* remove o padding-top excessivo */
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
/* Vinil Raro brilhante */
.vinyl-record.rare-vinyl {
  box-shadow:
    0 0 0 10px #111,
    0 0 0 12px #333,
    0 20px 60px rgba(0,0,0,0.8),
    0 0 30px rgba(255, 215, 0, 0.3);
}

.vinyl-record.rare-vinyl-equipped {
  animation: rareVinylGlow 3s ease-in-out infinite;
  box-shadow:
    0 0 0 10px #111,
    0 0 0 12px #ffd700,
    0 20px 60px rgba(0,0,0,0.8),
    0 0 50px rgba(255, 215, 0, 0.6),
    0 0 100px rgba(255, 215, 0, 0.3);
}

@keyframes rareVinylGlow {
  0%, 100% {
    box-shadow:
      0 0 0 10px #111,
      0 0 0 12px #ffd700,
      0 20px 60px rgba(0,0,0,0.8),
      0 0 50px rgba(255, 215, 0, 0.6),
      0 0 100px rgba(255, 215, 0, 0.3);
  }
  50% {
    box-shadow:
      0 0 0 10px #111,
      0 0 0 14px #ffd700,
      0 20px 60px rgba(0,0,0,0.8),
      0 0 70px rgba(255, 215, 0, 0.8),
      0 0 120px rgba(255, 215, 0, 0.5);
  }
}

.vinil-controls {
  position: absolute;
  bottom: 20px;        /* ajuste conforme necessário */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.btn-equip-vinil, .btn-unequip-vinil {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-equip-vinil {
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #1a1a2e;
}

.btn-equip-vinil:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.btn-unequip-vinil {
  background: rgba(239, 68, 68, 0.2);
  color: var(--error);
  border: 1px solid var(--error);
}

.btn-unequip-vinil:hover {
  background: var(--error);
  color: white;
}
/* Badge PRO - Sol com pontinhas */
.badge-pro-sun {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-pro-sun .sun-core {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  border-radius: 50%;
  position: relative;
  z-index: 2;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.badge-pro-sun .sun-ray {
  position: absolute;
  width: 3px;
  height: 12px;
  background: linear-gradient(to bottom, #ffd700, transparent);
  border-radius: 2px;
  top: 50%;
  left: 50%;
  transform-origin: center bottom;
  animation: sunRayFloat 3s ease-in-out infinite;
}

.badge-pro-sun .sun-ray:nth-child(1) { transform: translate(-50%, -100%) rotate(0deg); animation-delay: 0s; }
.badge-pro-sun .sun-ray:nth-child(2) { transform: translate(-50%, -100%) rotate(45deg); animation-delay: 0.2s; }
.badge-pro-sun .sun-ray:nth-child(3) { transform: translate(-50%, -100%) rotate(90deg); animation-delay: 0.4s; }
.badge-pro-sun .sun-ray:nth-child(4) { transform: translate(-50%, -100%) rotate(135deg); animation-delay: 0.6s; }
.badge-pro-sun .sun-ray:nth-child(5) { transform: translate(-50%, -100%) rotate(180deg); animation-delay: 0.8s; }
.badge-pro-sun .sun-ray:nth-child(6) { transform: translate(-50%, -100%) rotate(225deg); animation-delay: 1.0s; }
.badge-pro-sun .sun-ray:nth-child(7) { transform: translate(-50%, -100%) rotate(270deg); animation-delay: 1.2s; }
.badge-pro-sun .sun-ray:nth-child(8) { transform: translate(-50%, -100%) rotate(315deg); animation-delay: 1.4s; }

@keyframes sunRayFloat {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -100%) rotate(var(--rotation, 0deg)) scaleY(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -110%) rotate(var(--rotation, 0deg)) scaleY(1.3);
  }
}

/* Quando equipado, pontinhas soltas flutuam */
.badge-pro-equipped .sun-ray {
  animation: sunRayLoose 2s ease-in-out infinite;
}

@keyframes sunRayLoose {
  0%, 100% {
    transform: translate(-50%, -100%) rotate(var(--rotation, 0deg)) scaleY(1);
    opacity: 1;
  }
  25% {
    transform: translate(-50%, -120%) rotate(calc(var(--rotation, 0deg) + 10deg)) scaleY(1.2);
    opacity: 0.8;
  }
  75% {
    transform: translate(-50%, -90%) rotate(calc(var(--rotation, 0deg) - 5deg)) scaleY(0.9);
    opacity: 0.9;
  }
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
.activity-ticker,
.floating-cards {
  z-index: 1; /* garante que fiquem abaixo da navbar */
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

.card-4 {
  top: 30%;
  right: 5%;
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
/* Quando custom icons estão ativos */
body.custom-icons-active .card-icon i.fa-music::before { content: '\f7a6'; } /* guitar */
body.custom-icons-active .card-icon i.fa-microphone-lines::before { content: '\f569'; } /* drum */
body.custom-icons-active .card-icon i.fa-guitar::before { content: '\f7d8'; } /* record-vinyl */
body.custom-icons-active .card-icon i.fa-headphones::before { content: '\f1de'; } /* sliders */
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
.btn-buy.equipped {
  background: var(--success);
  color: white;
  border-color: var(--success);
  cursor: pointer;
}

.btn-buy.equipped:hover {
  background: #059669;
}

.shop-item.owned {
  opacity: 0.7;
  border-color: var(--success);
}

.shop-item.owned.equipped {
  opacity: 1;
  border-color: var(--success);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
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
.audio-visualizer-large {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  height: 100px;
  margin-bottom: 2rem;
}

.btn-pause-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: all 0.3s;
  z-index: 10;
}

.btn-pause-overlay:hover {
  background: rgba(239, 68, 68, 0.9);
  border-color: var(--error);
  transform: translate(-50%, -50%) scale(1.1);
}

.btn-pause-overlay svg {
  width: 28px;
  height: 28px;
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
  min-height: 300px;
}

.podium-place {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  max-width: 200px;
}

.podium-place.first {
  order: 2;
  transform: translateY(-20px);
  z-index: 3;
}

.podium-place.second {
  order: 1;
  z-index: 2;
}

.podium-place.third {
  order: 3;
  z-index: 1;
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
  gap: 1rem;
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
  text-align: center;
  flex-shrink: 0;
}

.player-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0; /* importante para ellipsis */
}

.player-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.player-status {
  font-size: 0.875rem;
  color: var(--success);
}

.player-stats {
  text-align: right;
}

.player-mode {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-score {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--primary);
  white-space: nowrap;
  flex-shrink: 0;
}

.player-trend {
  font-size: 0.875rem;
  flex-shrink: 0;
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
.game-section,
.modes-section,
.rewards-section,
.leaderboard-section {
  padding-bottom: 100px; /* espaço para o MusicPlayer */
}

/* Ou de forma mais específica para o container principal */
.rhythm-quest {
  padding-bottom: 100px; /* garante que último conteúdo não fique escondido */
}
/* Botão Pack de Ícones */
.btn-emoji-toggle, .btn-emoji-locked {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  color: var(--text);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-left: 0.5rem;
  font-size: 1.1rem;
}

.btn-emoji-toggle:hover {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border-color: #ec4899;
  transform: scale(1.1);
}

.btn-emoji-toggle.active {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border-color: #ec4899;
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
}

.btn-emoji-locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-emoji-locked:hover {
  opacity: 0.7;
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
.card-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #7c3aed, #2563eb);

  font-size: 24px;
  color: white;

  box-shadow:
    0 10px 25px rgba(124, 58, 237, 0.35),
    0 0 20px rgba(37, 99, 235, 0.25);
}
/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════ */
.toast-container {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275),
             toastOut 0.3s ease 2.7s forwards;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.15);
  min-width: 300px;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.toast-item.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95));
}
.toast-item.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
}
.toast-item.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95));
}
.toast-item.info {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(79, 70, 229, 0.95));
}

.toast-item i {
  font-size: 1.25rem;
  flex-shrink: 0;
}

@keyframes toastIn {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes toastOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(120%); opacity: 0; }
}

@media (max-width: 768px) {
  .toast-container {
    top: 80px;
    right: 10px;
    left: 10px;
    align-items: center;
  }
  .toast-item {
    min-width: auto;
    width: 100%;
    max-width: 100%;
  }
}
</style>