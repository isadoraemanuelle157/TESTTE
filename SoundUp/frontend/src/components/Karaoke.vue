<template>
  <div class="karaoke-container" :class="{ 'fullscreen': isFullscreen, [displayMode]: true }">
    <!-- Toast de Permissão do Microfone -->
    <transition name="toast">
      <div v-if="micPermissionToast.show" class="mic-permission-toast" :class="micPermissionToast.type">
        <div class="toast-icon">
          <svg v-if="micPermissionToast.type === 'error'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg v-else-if="micPermissionToast.type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="toast-content">
          <p class="toast-title">{{ micPermissionToast.title }}</p>
          <p class="toast-message">{{ micPermissionToast.message }}</p>
        </div>
        <button class="toast-close" @click="hideMicPermissionToast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </transition>

    <!-- Background Visualizer -->
    <div class="visualizer-bg">
      <canvas ref="bgCanvas"></canvas>
      <div class="gradient-overlay"></div>
    </div>

    <!-- SONG SELECTION SCREEN -->
    <div v-if="showSongSelection" class="song-selection-overlay">
      <div class="selection-content">
        <h1><i class="fas fa-microphone-lines"></i> KARAOKÊ</h1>
        <p class="subtitle">
          Escolha uma música para começar • Fonte: {{ currentProviderLabel }}
        </p>

        <!-- MODO DE JOGO - SEMPRE VISÍVEL E CLARO -->
        <div class="mode-selection">
          <h3><i class="fas fa-gamepad"></i> Modo de Jogo</h3>
          <div class="mode-buttons">
            <button
              :class="{ active: withMicrophone }"
              @click="withMicrophone = true"
            >
              <i class="fas fa-microphone"></i>
              Com Microfone
            </button>
            <button
              :class="{ active: !withMicrophone }"
              @click="withMicrophone = false"
            >
              <i class="fas fa-music"></i>
              Sem Microfone
            </button>
          </div>
          <p class="mode-hint">
            {{ withMicrophone ? 'Cante e ganhe pontos pela precisão!' : 'Apenas acompanhe as letras e a música.' }}
          </p>
        </div>

        <div class="difficulty-filter">
          <button
            v-for="diff in ['easy', 'medium', 'hard']"
            :key="diff"
            :class="{ active: selectedDifficulty === diff }"
            @click="selectedDifficulty = diff"
          >
            {{ getDifficultyLabel(diff) }}
          </button>
        </div>

        <div class="search-wrapper-selection">
          <svg viewBox="0 0 24 24" fill="currentColor" class="search-icon">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar música..."
            @keyup.enter="searchMusic"
            @input="handleInput"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Result count indicator -->
        <div v-if="searchResults.length > 0 && !isLoading" class="results-count">
          <span>{{ filteredSearchResults.length }} música(s) encontrada(s)</span>
          <span v-if="filteredSearchResults.length > displayLimit" class="show-more-hint">
            Mostrando {{ displayLimit }} de {{ filteredSearchResults.length }}
          </span>
        </div>

        <div class="songs-grid">
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Carregando músicas...</p>
          </div>

          <div
            v-else-if="filteredSearchResults.length > 0"
            v-for="(track, index) in paginatedResults"
            :key="track.id || index"
            class="song-card"
            @click="selectTrackAndStart(track)"
          >
            <img :src="track.album?.cover_medium || track.cover || 'https://via.placeholder.com/160'" :alt="track.title" class="song-cover">
            <div class="song-card-info">
              <h3>{{ track.title }}</h3>
              <p>{{ track.artist?.name || track.artist }}</p>
       <span class="difficulty-badge" :class="track.difficulty">
  {{ getDifficultyLabel(track.difficulty) }}
</span>
            </div>
          </div>

          <div v-else-if="searchQuery && !isLoading" class="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="no-results-icon">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <div class="no-results-text">
              <p>Nenhuma música encontrada</p>
              <small>Tente buscar por outro termo</small>
            </div>
          </div>

          <div v-else-if="!searchQuery && !isLoading" class="no-results empty-state">
            <div class="empty-illustration">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="music-icon">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <div class="sound-waves">
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
            <div class="no-results-text">
              <p>Digite algo para buscar músicas</p>
              <small>Explore milhares de músicas para cantar</small>
            </div>
          </div>
        </div>

        <!-- Load more button -->
        <div v-if="filteredSearchResults.length > displayLimit && !isLoading" class="load-more-wrapper">
          <button class="btn-load-more" @click="displayLimit += 18">
            <i class="fas fa-chevron-down"></i>
            Carregar mais ({{ filteredSearchResults.length - displayLimit }} restantes)
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header v-if="!showSongSelection" class="karaoke-header">
      <button class="btn-icon" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div class="song-info-mini">
        <span class="live-badge" :class="{ 'recording': isRecording }">LIVE</span>
        <h3>{{ currentSong.title }}</h3>
        <p>{{ currentSong.artist }}</p>
      </div>

      <div class="header-actions">
        <button v-if="withMicrophone" class="btn-icon" @click="toggleMic" :class="{ 'active': micActive }" title="Ativar Microfone">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2c-1.66 0-3 1.34-3 3v7c0 1.66 1.34 3 3 3s3-1.34 3-3V5c0-1.66-1.34-3-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <button class="btn-icon" @click="toggleFullscreen">
          <svg v-if="!isFullscreen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        </button>
        <button class="btn-icon" @click="toggleSettings">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button v-if="!visualFeedback" class="btn-icon warning" title="Feedback Visual Desativado">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
</button>
      </div>
    </header>

    <!-- Main Stage -->
    <main v-if="!showSongSelection" class="karaoke-stage">
      <!-- Album Art (Left) -->
      <div class="album-section" :class="{ 'hidden': isFullscreen || displayMode === 'minimal' }">
        <div class="album-art" :style="{ backgroundImage: `url(${currentSong.cover})` }">
          <div class="vinyl-ring" :class="{ 'spinning': isPlaying }">
            <div class="vinyl-center"></div>
          </div>
          <div class="difficulty-badge-large" :class="currentSong.difficulty">
            {{ getDifficultyLabel(currentSong.difficulty) }}
          </div>
        </div>

        <div class="song-info-mini">
          <span class="live-badge" :class="{ 'recording': isRecording }">LIVE</span>
          <p class="artist">{{ currentSong.artist }}</p>
          <h3 class="title">{{ currentSong.title }}</h3>
        </div>

        <div class="song-stats" v-if="currentSong.stats">
          <div class="stat">
            <span class="stat-value">{{ currentSong.stats.wordDensity }}</span>
            <span class="stat-label">palavras/min</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ currentSong.stats.uniqueWords }}</span>
            <span class="stat-label">vocabulário</span>
          </div>
        </div>

        <div class="badges">
          <span class="badge">{{ currentSong.genre || 'Pop' }}</span>
          <span class="badge difficulty" :class="currentSong.difficulty">
            {{ getDifficultyLabel(currentSong.difficulty) }}
          </span>
        </div>
      </div>

      <!-- Lyrics Display (Center) -->
      <div class="lyrics-section" ref="lyricsContainer">
        <div v-if="isLoadingLyrics" class="lyrics-loading">
          <div class="spinner"></div>
          <p>Carregando letras...</p>
        </div>

        <div v-else-if="lyricsError" class="lyrics-error">
          <p>{{ lyricsError }}</p>
          <button @click="loadLyricsForCurrentSong">Tentar novamente</button>
        </div>

        <div v-else class="lyrics-wrapper">
        <!-- ========== SUBSTITUIR o bloco da lyric-line (linha ~380) ========== -->

<div
  v-for="(line, index) in processedLyrics"
  :key="index"
  class="lyric-line"
  :class="{
    'active': currentLineIndex === index,
    'past': currentLineIndex > index,
    'future': currentLineIndex < index,
    'correct': line.correct,
    'wrong': line.wrong,
    'instrumental': line.isInstrumental
  }"
  :data-time="line.time"
>
  <!-- Container principal da linha -->
  <div class="lyric-content">
    <span v-if="line.isInstrumental" class="instrumental-indicator">
      <i class="fas fa-wave-square"></i>
      Instrumental
    </span>
   
    <!-- Texto da música -->
    <span v-else class="lyric-text" :style="{ fontSize: fontSize + 'px' }">
      {{ line.text }}
    </span>
   
    <!-- ✅ MOVIDO PARA DENTRO de .lyric-content, DEPOIS do texto -->
    <div v-if="showPhonetic && line.phonetic" class="lyric-phonetic">
      {{ line.phonetic }}
    </div>
  </div>

  <!-- Ícones de feedback (mantidos fora do flow central) -->
  <span v-if="visualFeedback && line.correct && withMicrophone" class="feedback-icon correct">
    <i class="fas fa-check"></i>
  </span>
  <span v-if="visualFeedback && line.wrong && withMicrophone" class="feedback-icon wrong">
    <i class="fas fa-xmark"></i>
  </span>
</div>
        </div>

        <div class="progress-line"></div>
      </div>

      <!-- Score Panel (Right) -->
      <div class="score-section" :class="{ 'hidden': isFullscreen || displayMode === 'minimal' }">
        <div class="score-card">
          <div class="score-header">
            <span>{{ withMicrophone ? 'PONTUAÇÃO' : 'TEMPO' }}</span>
            <div class="combo" v-if="combo > 0 && withMicrophone">
              <span class="combo-count">{{ combo }}x</span>
              <span class="combo-label">COMBO</span>
            </div>
          </div>
          <div class="score-value" :class="scoreAnimation">{{ withMicrophone ? Math.round(currentScore) : formatTime(currentTime) }}</div>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: (currentScore / maxScore * 100) + '%' }"></div>
          </div>
          <div v-if="withMicrophone" class="rating-stars">
            <span v-for="n in 5" :key="n" :class="{ 'filled': n <= starRating }">★</span>
          </div>
        </div>

        <div class="accuracy-panel" v-if="visualFeedback && withMicrophone">
          <div class="accuracy-item">
            <span>Precisão</span>
            <div class="accuracy-bar">
              <div class="accuracy-fill" :style="{ width: accuracyPercent + '%', background: getAccuracyColor(accuracyPercent) }"></div>
            </div>
            <span>{{ Math.round(accuracyPercent) }}%</span>
          </div>
        </div>

        <div class="pitch-visualizer" v-if="visualFeedback && withMicrophone && currentSong.difficulty !== 'easy'">
          <canvas ref="pitchCanvas"></canvas>
          <div class="pitch-guide">
            <div class="target-line"></div>
            <div class="your-line" :style="{ bottom: pitchPosition + '%' }"></div>
          </div>
        </div>

        <div v-if="withMicrophone" class="mic-level">
          <span :class="{ 'active': micActive }">Mic {{ micActive ? 'ON' : 'OFF' }}</span>
          <div class="level-bar">
            <div class="level-fill" :style="{ height: micLevel + '%', background: micActive ? '#1DB954' : '#666' }"></div>
          </div>
        </div>

        <div v-if="lastRecognizedText && visualFeedback && withMicrophone" class="recognized-text">
          <small>Ouviu: "{{ lastRecognizedText }}"</small>
        </div>
      </div>
    </main>

    <!-- Audio Visualizer Bottom -->
    <div class="audio-visualizer" v-if="visualFeedback && !showSongSelection">
      <canvas ref="audioCanvas"></canvas>
    </div>

    <!-- Controls -->
    <footer v-if="!showSongSelection" class="karaoke-controls">
      <div class="controls-main">
        <button class="btn-control" @click="skipBackward">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
          </svg>
          <span>-5s</span>
        </button>

        <button class="btn-play" :class="{ 'playing': isPlaying }" @click="togglePlay">
          <svg v-if="!isPlaying" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>

        <button class="btn-control" @click="skipForward">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
          </svg>
          <span>+5s</span>
        </button>
      </div>

      <div class="controls-secondary">
        <div class="volume-control">
          <button class="btn-icon" @click="toggleMute">
            <svg v-if="!isMuted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          </button>
          <input type="range" min="0" max="100" v-model="volume" class="volume-slider" @input="updateVolume">
        </div>

        <div class="pitch-control" v-if="currentSong.difficulty !== 'easy' && withMicrophone">
          <span>Tom</span>
          <div class="pitch-buttons">
            <button @click="changePitch(-1)">-</button>
            <span class="pitch-value">{{ pitchShift > 0 ? '+' : '' }}{{ pitchShift }}</span>
            <button @click="changePitch(1)">+</button>
          </div>
        </div>

        <div class="tempo-control">
          <span>Velocidade</span>
          <input type="range" min="0.5" max="1.5" step="0.1" v-model="playbackRate" class="tempo-slider" @change="updatePlaybackRate">
          <span class="tempo-value">{{ Math.round(playbackRate * 100) }}%</span>
        </div>

        <button v-if="withMicrophone" class="btn-record" :class="{ 'recording': isRecording }" @click="toggleRecording">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <span>{{ isRecording ? 'Gravando' : 'Gravar' }}</span>
        </button>
      </div>

      <div class="progress-container">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="seekTo" ref="progressBar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }">
            <div class="progress-handle"></div>
          </div>
          <div
            v-for="marker in lyricsMarkers"
            :key="marker.time"
            class="lyric-marker"
            :style="{ left: (marker.time / duration * 100) + '%' }"
          ></div>
        </div>
        <span class="time">{{ formatTime(duration) }}</span>
      </div>
    </footer>

    <!-- Settings Modal -->
  <!-- Settings Modal -->
<transition name="fade">
  <div v-if="showSettings" class="settings-modal" @click.self="toggleSettings">
    <div class="settings-content">
      <h3>
        <i class="fas fa-gear"></i>
        Configurações
      </h3>

      <div class="setting-item">
        <label>Modo de Exibição</label>
        <div class="setting-options">
          <button
            v-for="mode in displayModes"
            :key="mode.value"
            :class="{ active: displayMode === mode.value }"
            @click="setDisplayMode(mode.value)"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>

      <div class="setting-item">
        <label>Tamanho da Letra: {{ fontSize }}px</label>
        <input type="range" min="16" max="48" v-model.number="fontSize" class="setting-slider">
      </div>

      <div class="setting-item">
        <label>Ajuste de Sincronia das Letras: {{ lyricsSyncOffset.toFixed(1) }}s</label>
        <input type="range" min="-5" max="5" step="0.1" v-model.number="lyricsSyncOffset" class="setting-slider">
        <small style="opacity:0.6; font-size:11px; display:block; margin-top:4px;">
          Negativo = letras antecipam | Positivo = letras atrasam
        </small>
      </div>

      <div class="setting-item checkbox">
        <input type="checkbox" v-model="showPhonetic" id="phonetic" @change="saveSettings">
        <label for="phonetic">Mostrar Pronúncia</label>
      </div>

      <div class="setting-item checkbox">
        <input type="checkbox" v-model="visualFeedback" id="feedback" @change="saveSettings">
        <label for="feedback">Feedback Visual</label>
      </div>

      <div class="setting-item checkbox">
        <input type="checkbox" v-model="autoScroll" id="autoscroll" @change="saveSettings">
        <label for="autoscroll">Auto-scroll de Letras</label>
      </div>

   <!-- ✅ NOVO: Slider de intensidade da remoção vocal -->
<div class="setting-item vocal-remover-slider">
  <label>
    <i class="fas fa-microphone-slash"></i>
    Redução da Voz do Cantor: {{ vocalRemovalIntensity }}%
  </label>
  <input
    type="range"
    min="0"
    max="100"
    step="5"
    v-model.number="vocalRemovalIntensity"
    class="setting-slider"
    @input="updateVocalRemovalIntensity"
  >
  <div class="vocal-labels">
   
  </div>
  <small v-if="vocalRemovalIntensity > 0" class="vocal-hint" :class="{ 'strong': vocalRemovalIntensity >= 70 }">
    <i class="fas fa-microphone-slash"></i>
    <span v-if="vocalRemovalIntensity < 30">Redução leve da voz</span>
    <span v-else-if="vocalRemovalIntensity < 70">Redução moderada da voz</span>
    <span v-else>Redução agressiva da voz — ideal para cantar!</span>
  </small>
</div>

      <div v-if="withMicrophone" class="setting-item">
        <label>Sensibilidade do Microfone: {{ micSensitivity }}%</label>
        <input type="range" min="0" max="100" v-model.number="micSensitivity" class="setting-slider">
      </div>

      <div class="setting-item">
        <button class="btn-history" @click="openHistoryModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Últimas Jogadas
        </button>
      </div>

      <button class="btn-close" @click="toggleSettings">Fechar</button>
    </div>
  </div>
</transition>

    <!-- History Modal -->
<transition name="fade">
  <div v-if="showHistoryModal" class="settings-modal history-modal" @click.self="closeHistoryModal">
    <div class="settings-content history-content">
      <h3>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Últimas Jogadas
      </h3>

      <div v-if="gameHistory.length === 0" class="history-empty">
        <p>Nenhuma jogada registrada ainda</p>
        <small>Cante uma música para ver seu histórico aqui</small>
      </div>

      <div v-else class="history-list">
        <div
          v-for="(game, index) in gameHistory.slice().reverse()"
          :key="index"
          class="history-item"
        >
          <div class="history-song">
            <img :src="game.cover || 'https://via.placeholder.com/40'" class="history-cover">
            <div class="history-info">
              <strong>{{ game.song }}</strong>
              <span>{{ game.artist }}</span>
            </div>
          </div>
         
          <div class="history-stats">
            <div class="history-stat">
              <span class="stat-label">Pontuação</span>
              <span class="stat-value" :class="getScoreClass(game.score)">
                {{ Math.round(game.score) }}
              </span>
            </div>
            <div class="history-stat">
              <span class="stat-label">Precisão</span>
              <span class="stat-value">{{ Math.round(game.accuracy) }}%</span>
            </div>
            <div class="history-stat">
              <span class="stat-label">Dificuldade</span>
              <span class="difficulty-badge" :class="game.difficulty">
                {{ getDifficultyLabel(game.difficulty) }}
              </span>
            </div>
            <div class="history-stat">
              <span class="stat-label">Gravado</span>
              <span class="stat-value" :class="game.recorded ? 'yes' : 'no'">
                {{ game.recorded ? 'Sim' : 'Não' }}
              </span>
            </div>
          </div>
         
          <div class="history-date">{{ formatDate(game.date) }}</div>
        </div>
      </div>

      <div class="history-actions">
        <button v-if="gameHistory.length > 0" class="btn-clear-history" @click="clearHistory">
          Limpar Histórico
        </button>
        <button class="btn-close" @click="closeHistoryModal">Fechar</button>
      </div>
    </div>
  </div>
</transition>

<!-- ============ ADICIONAR DEPOIS do History Modal ============ -->
<transition name="fade">
  <div v-if="showDeleteConfirmModal" class="settings-modal confirm-modal" @click.self="showDeleteConfirmModal = false">
    <div class="settings-content confirm-content">
      <div class="confirm-icon warning">
        <i class="fas fa-triangle-exclamation"></i>
      </div>
      <h3>Apagar Histórico?</h3>
      <p class="confirm-text">
        Esta ação não pode ser desfeita. Todas as suas jogadas serão permanentemente removidas.
      </p>
      <div class="confirm-actions">
        <button class="btn-cancel" @click="showDeleteConfirmModal = false">
          <i class="fas fa-xmark"></i>
          Cancelar
        </button>
        <button class="btn-confirm-delete" @click="confirmClearHistory">
          <i class="fas fa-trash-can"></i>
          Sim, apagar
        </button>
      </div>
    </div>
  </div>
</transition>

    <!-- Hidden Audio Player -->
    <audio
      ref="audioPlayer"
      @loadedmetadata="onAudioLoaded"
      @timeupdate="onAudioTimeUpdate"
      @ended="handleAudioEnded"
      :src="audioPreviewUrl"
      crossorigin="anonymous"
      loop
    ></audio>
        <!-- Exit Confirmation Modal -->
    <transition name="fade">
      <div v-if="showExitConfirmModal" class="exit-confirm-modal" @click.self="cancelExitKaraoke">
        <div class="exit-confirm-content">
          <div class="exit-confirm-icon">
            <i class="fas fa-door-open"></i>
          </div>
          <h3>Sair do Karaokê?</h3>
          <p class="exit-confirm-text">
            <span v-if="currentScore > 0">
              Você tem <strong>{{ Math.round(currentScore) }}</strong> pontos e
              <strong>{{ Math.round(accuracyPercent) }}%</strong> de precisão.
              Se sair agora, seu progresso será salvo no histórico.
            </span>
            <span v-else>
              Tem certeza que deseja sair? Sua sessão atual será encerrada.
            </span>
          </p>
          <div class="exit-confirm-actions">
            <button class="btn-exit-cancel" @click="cancelExitKaraoke">
              <i class="fas fa-play"></i>
              Continuar Cantando
            </button>
            <button class="btn-exit-confirm" @click="doExitKaraoke">
              <i class="fas fa-sign-out-alt"></i>
              Sair
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
export default {
  name: 'KaraokeComponent',

  data() {
    return {
      // Toast
      micPermissionToast: {
        show: false,
        type: 'error',
        title: '',
        message: '',
        timer: null
      },

      // Song selection
      showSongSelection: true,
      withMicrophone: true,
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
      isSearchFocused: false,
      searchTimeout: null,
      isLoading: false,
      displayLimit: 24,
      showHistoryModal: false,
      showDeleteConfirmModal: false,
      showExitConfirmModal: false,
      wasPlayingBeforeConfirm: false,
      spotifyPlayer: null,
spotifyDeviceId: null,
isSpotifyPremium: false,
spotifyToken: null,
    gameHistory: [],

      // Difficulty
      selectedDifficulty: 'medium',
      difficultySeedQueries: {
        easy: 'Ed Sheeran Jason Mraz Beatles Elvis Presley',
        medium: 'Adele Coldplay Dua Lipa The Weeknd Rihanna',
        hard: 'Queen Whitney Houston Mariah Carey Eminem Ariana Grande Bruno Mars'
      },

      // Current song
      currentSong: {
        title: 'Selecione uma música',
        artist: 'Artista',
        cover: 'https://via.placeholder.com/200',
        genre: 'Pop',
        difficulty: 'medium',
        duration: 180,
        previewDuration: 30,
        preview_url: '',
        deezerId: null,
        spotifyId: null,
        source: 'deezer',
        stats: null
      },

      // Lyrics
      rawLyrics: '',
      processedLyrics: [],
      currentLineIndex: 0,
      isLoadingLyrics: false,
      lyricsError: null,
      lyricsStartTime: 0,
      hasRealLRC: false,
      lyricsTimeScale: 1,
      previewStartOffset: 0,
      lyricsSyncOffset: 0,

      // Audio
      audioPreviewUrl: '',
      isPlaying: false,
      currentTime: 0,
      duration: 30,
      progressPercent: 0,
      playbackRate: 1,
      isMuted: false,
      volume: 70,

      // Score
      currentScore: 0,
      maxScore: 10000,
      combo: 0,
      starRating: 0,
      accuracyPercent: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      scoreAnimation: '',
      strictMode: false,

      // Pitch
      pitchShift: 0,
      pitchPosition: 30,

      // Display
      isFullscreen: false,
      showSettings: false,
      displayMode: 'standard',
      displayModes: [
        { value: 'standard', label: 'Padrão' },
        { value: 'minimal', label: 'Minimalista' },
        { value: 'party', label: 'Festa' }
      ],
      fontSize: 28,
      showPhonetic: false,
      visualFeedback: true,
      autoScroll: true,
// ✅ NOVO: Controle de intensidade da remoção vocal (0-100%)
vocalRemovalIntensity: 0, // 0 = sem remoção, 100 = máxima remoção
vocalRemovalNode: null,
audioSourceNode: null,
audioContextPlayer: null,
isVocalRemovalSetup: false,


      // Microphone
      micActive: false,
      micStream: null,
      micLevel: 0,
      micSensitivity: 70,
      audioContext: null,
      analyser: null,
      microphone: null,
      javascriptNode: null,
      recognition: null,
      isListening: false,
      lastRecognizedText: '',
      lastSpeechSyncAt: 0,

      // Recording
      isRecording: false,
      recordingTime: 0,
      recordingInterval: null,
      mediaRecorder: null,
      recordedChunks: [],

      // Animation / Loop
      playbackInterval: null,
      animationFrame: null,
      scoringTimer: null,

      // API
      API_BASE: import.meta.env.VITE_API_URL || 'http://localhost:3002',
      CORS_PROXY: 'https://proxy.corsfix.com/?',
      DEEZER_API: 'https://api.deezer.com',
      GENIUS_API: 'https://api.genius.com',
      GENIUS_TOKEN: '',
      isAuthenticated: false,
      musicProvider: 'deezer'
    }
  },

  computed: {
    lyricsMarkers() {
      const previewDuration = this.currentSong.previewDuration || this.duration || 30
      return this.processedLyrics.map((l, i) => ({
        time: l.time / this.lyricsTimeScale,
        index: i
      })).filter(l => l.time > 0 && l.time <= previewDuration)
    },

    filteredSearchResults() {
      if (!this.selectedDifficulty) return this.searchResults
      return this.searchResults.filter(track => track.difficulty === this.selectedDifficulty)
    },

    paginatedResults() {
      return this.filteredSearchResults.slice(0, this.displayLimit)
    },

    currentProviderLabel() {
      return this.isAuthenticated ? 'Spotify' : 'Deezer'
    }
  },

watch: {
  vocalRemovalIntensity(newVal) {
    this.saveSettings()
    this.updateVocalRemovalIntensity()
  },
  lyricsSyncOffset(newVal, oldVal) {
    if (newVal !== oldVal) {
      // Força re-sync imediato
      this.syncLyricsWithAudio()
      this.saveSettings()
    }
  },

  selectedDifficulty: {
    immediate: false,
    async handler(newVal) {
      if (newVal === 'easy') {
        this.showPhonetic = false
        this.visualFeedback = true
        this.strictMode = false
      } else if (newVal === 'hard') {
        this.showPhonetic = true
        this.strictMode = true
      } else {
        this.strictMode = false
      }

      this.saveSettings()

      if (!this.searchQuery.trim()) {
        await this.loadSongsByDifficulty(newVal)
      }
    }
  },

 currentLineIndex(newVal, oldVal) {
  if (newVal === oldVal) return
  if (!this.autoScroll) return

  this.$nextTick(() => {
    const container = this.$refs.lyricsContainer
    const activeLine = container?.querySelector('.lyric-line.active')
    if (!activeLine || !container) return

    const containerRect = container.getBoundingClientRect()
    const lineRect = activeLine.getBoundingClientRect()

    // ✅ Linha ativa MUITO mais para cima em fullscreen (18% do topo)
    const anchorRatio = this.isFullscreen ? 0.18 : 0.35
    const targetTop = container.clientHeight * anchorRatio

    const delta =
      (lineRect.top - containerRect.top) -
      targetTop +
      (lineRect.height / 2)

    container.scrollTo({
      top: Math.max(0, container.scrollTop + delta),
      behavior: 'smooth'
    })
  })
},

  showPhonetic() {
    this.saveSettings()
  },

  visualFeedback() {
    this.saveSettings()
  },

  autoScroll() {
    this.saveSettings()
  },

  fontSize() {
    this.saveSettings()
  },

  micSensitivity() {
    this.saveSettings()
  },

  playbackRate() {
    this.saveSettings()
  }
},

 async mounted() {
  this.detectAuthProvider()
  this.initAudio()
 
  // Inicializa Spotify Player se tiver token
  await this.initSpotifyPlayer()
 
  if (this.withMicrophone) {
    this.initSpeechRecognition()
  }
    window.addEventListener('keydown', this.handleKeydown)
    this.loadSettings()
    this.loadSongsByDifficulty(this.selectedDifficulty)
    this.$emit('karaoke-active', true)
      this.loadGameHistory()
  },


beforeUnmount() {
  // ✅ SALVAR antes de destruir se tiver score
  if (this.withMicrophone && !this.showSongSelection && this.currentScore > 0) {
    this.saveGameToHistory()
  }
 
  this.stopPlayback()
  this.stopMicrophone()
  window.removeEventListener('keydown', this.handleKeydown)
  cancelAnimationFrame(this.animationFrame)
  if (this.recognition) this.recognition.stop()
  this.hideMicPermissionToast()
  this.$emit('karaoke-active', false)
},

  methods: {
    // ===================== AUTH / PROVIDER =====================
detectAuthProvider() {
  // Token do app (seu backend)
  const appToken =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('access_token')
  
  // Token do Spotify (conexão com Spotify)
  const spotifyToken = localStorage.getItem('spotify_access_token')

  this.isAuthenticated = !!appToken
  // ✅ Só usa Spotify se tiver ambos: login no app + Spotify conectado
  this.musicProvider = (appToken && spotifyToken) ? 'spotify' : 'deezer'
  
  // ✅ Guarda se tem Spotify Premium
  this.isSpotifyPremium = !!spotifyToken
},

    getAuthHeaders() {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('access_token')

      return token
        ? { Authorization: `Bearer ${token}` }
        : {}
    },
getEffectiveLyricsTime(includeManualOffset = true) {
  const manualOffset = includeManualOffset ? this.lyricsSyncOffset : 0

  if (this.hasRealLRC) {
    // ✅ Aplica o offset do preview (quando o preview começa na música)
    // + offset manual do usuário (ajuste fino)
    return (this.currentTime + this.previewStartOffset) + manualOffset
  }

  return (
    this.previewStartOffset +
    (this.currentTime * this.lyricsTimeScale) +
    manualOffset
  )
},

openHistoryModal() {
  this.showHistoryModal = true
  this.loadGameHistory()
},

closeHistoryModal() {
  this.showHistoryModal = false
},

loadGameHistory() {
  const saved = localStorage.getItem('karaokeGameHistory')
  if (saved) {
    try {
      this.gameHistory = JSON.parse(saved)
    } catch (e) {
      this.gameHistory = []
    }
  }
},

saveGameToHistory() {
  if (!this.withMicrophone) return // só salva no modo com microfone
 
  const game = {
    date: new Date().toISOString(),
    song: this.currentSong.title,
    artist: this.currentSong.artist,
    cover: this.currentSong.cover,
    score: this.currentScore,
    accuracy: this.accuracyPercent,
    difficulty: this.currentSong.difficulty,
    recorded: this.isRecording,
    combo: this.combo,
    stars: this.starRating
  }
 
  this.gameHistory.push(game)
 
  // Mantém apenas últimas 50 jogadas
  if (this.gameHistory.length > 50) {
    this.gameHistory = this.gameHistory.slice(-50)
  }
 
  localStorage.setItem('karaokeGameHistory', JSON.stringify(this.gameHistory))
},

clearHistory() {
  this.showDeleteConfirmModal = true
},
// ============ ADICIONAR ============
confirmClearHistory() {
  this.gameHistory = []
  localStorage.removeItem('karaokeGameHistory')
  this.showDeleteConfirmModal = false
 
  this.showMicPermissionToast(
    'success',
    'Histórico apagado',
    'Todas as jogadas foram removidas com sucesso.'
  )
},

getScoreClass(score) {
  if (score >= 8000) return 'excellent'
  if (score >= 5000) return 'good'
  if (score >= 2000) return 'average'
  return 'low'
},

formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
},

    // ===================== TRACK MAPPING =====================
    mapSpotifyTrack(track) {
      return {
        id: track.id,
        title: track.name,
        artist: {
          name: track.artists?.map(a => a.name).join(', ') || 'Artista desconhecido'
        },
        album: {
          cover: track.album?.images?.[2]?.url || track.album?.images?.[1]?.url || track.album?.images?.[0]?.url,
          cover_medium: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url,
          cover_big: track.album?.images?.[0]?.url
        },
        cover: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url,
        preview: track.preview_url || '',
        duration: track.duration_ms ? Math.round(track.duration_ms / 1000) : 30,
        source: 'spotify',
        raw: track
      }
    },

    mapDeezerTrack(track) {
      return {
        ...track,
        source: 'deezer'
      }
    },

    // ===================== SEARCH =====================
    async searchTracksByProvider(query, limit = 40) {
      this.detectAuthProvider()

      if (this.isAuthenticated) {
        const response = await fetch(
          `${this.API_BASE}/spotify/search?q=${encodeURIComponent(query)}&type=track&market=BR`,
          {
            headers: this.getAuthHeaders()
          }
        )

        if (!response.ok) {
          throw new Error(`Spotify HTTP ${response.status}`)
        }

        const data = await response.json()
        return (data.tracks?.items || []).map(track => this.mapSpotifyTrack(track))
      }

      const response = await fetch(
        `${this.API_BASE}/deezer/search?q=${encodeURIComponent(query)}&limit=${limit}`
      )

      if (!response.ok) {
        throw new Error(`Deezer HTTP ${response.status}`)
      }

      const data = await response.json()
      return (data.data || []).map(track => this.mapDeezerTrack(track))
    },

    async searchMusic() {
      if (!this.searchQuery.trim()) return

      this.isLoading = true
      this.searchResults = []
      this.displayLimit = 24

      try {
        const tracks = await this.searchTracksByProvider(this.searchQuery, 60)

        this.searchResults = tracks.map(track => ({
          ...track,
          difficulty: this.calculateDifficulty(track)
        }))

        this.showSearchResults = true
      } catch (error) {
        console.error('Erro na busca:', error)
        this.searchResults = []
        this.showMicPermissionToast(    // ✅ REUSA O TOAST QUE JÁ EXISTE
    'error',
    'Erro na busca',
    `Não foi possível buscar músicas via ${this.currentProviderLabel}. Verifique sua conexão.`
  )
      } finally {
        this.isLoading = false
      }
    },

    handleInput() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        if (this.searchQuery.length >= 2) this.searchMusic()
      }, 400)
    },

    clearSearch() {
      this.searchQuery = ''
      this.searchResults = []
      this.showSearchResults = false
      this.displayLimit = 12
      this.loadSongsByDifficulty(this.selectedDifficulty)
    },

    // ===================== SONG SELECTION =====================
async selectTrackAndStart(track) {
  // ✅ 1. ESCONDE A SELEÇÃO IMEDIATAMENTE (feedback visual instantâneo)
  this.showSongSelection = false
  this.searchQuery = ''
  this.displayLimit = 12
  
  // ✅ 2. Carrega dados da música em background
  await this.setSongData(track)
  
  // ✅ 3. Inicia o playback (Spotify ou preview)
  if (track.source === 'spotify' && this.isSpotifyPremium && this.spotifyPlayer) {
    try {
      await this.spotifyPlayer._options.getOAuthToken(async (token) => {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.spotifyDeviceId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: [`spotify:track:${track.id}`]
          })
        })
      })
      this.duration = track.duration || 180
      this.currentSong.previewDuration = track.duration || 180
      this.startKaraokeSync()
    } catch (e) {
      console.error('Erro ao tocar no Spotify:', e)
      this.audioPreviewUrl = track.preview || track.preview_url || ''
    }
  } else {
    this.audioPreviewUrl = track.preview || track.preview_url || ''
  }
},

// ========== ADICIONAR startKaraokeSync ==========
startKaraokeSync() {
  // Em vez de usar timeupdate do audio, usa o estado do Spotify SDK
  if (!this.spotifyPlayer) return
 
  const syncInterval = setInterval(async () => {
    const state = await this.spotifyPlayer.getCurrentState()
    if (!state) return
   
    this.currentTime = state.position / 1000
    this.duration = state.duration / 1000
    this.progressPercent = (this.currentTime / this.duration) * 100
    this.syncLyricsWithAudio()
   
    if (state.paused) {
      this.isPlaying = false
    } else {
      this.isPlaying = true
    }
  }, 300)
 
  // Limpa no beforeUnmount
  this._karaokeSyncInterval = syncInterval
},

    async setSongData(track) {
      const difficulty = track.difficulty || this.calculateDifficulty(track)
      const previewDuration = 30
      const artistName = track.artist?.name || track.artist || 'Artista'

      this.currentSong = {
        title: track.title || track.name,
        artist: artistName,
        cover: track.album?.cover_big || track.album?.cover_medium || track.album?.cover || track.cover,
        genre: track.genre?.name || track.genre || 'Pop',
        difficulty,
        duration: track.duration || 30,
        previewDuration,
        preview_url: track.preview || track.preview_url || '',
        deezerId: track.source === 'deezer' ? track.id : null,
        spotifyId: track.source === 'spotify' ? track.id : null,
        source: track.source,
        stats: null
      }

      // Fallback caso Spotify não tenha preview_url
      if (!this.currentSong.preview_url) {
        try {
          const audioRes = await fetch(
            `${this.API_BASE}/musicas/${encodeURIComponent(this.currentSong.title + ' ' + this.currentSong.artist)}/audio`,
            { headers: this.getAuthHeaders() }
          )
          if (audioRes.ok) {
            const audioData = await audioRes.json()
            this.currentSong.preview_url = audioData.url || ''
            this.currentSong.cover = this.currentSong.cover || audioData.cover
          }
        } catch (e) {
          console.warn('Fallback de preview falhou:', e)
        }
      }

      this.duration = previewDuration
      this.audioPreviewUrl = this.currentSong.preview_url
      this.currentTime = 0
      this.progressPercent = 0
      this.currentLineIndex = 0
      this.lyricsStartTime = 0
      this.lyricsSyncOffset = 0
      this.hasRealLRC = false
      this.lyricsTimeScale = 1
      this.previewStartOffset = 0
      this.resetScore()

      await this.loadLyricsForCurrentSong()

      // Após carregar letras, calcular escala de sincronização
      this.calculateLyricsTimeScale()
    },

    async loadSongsByDifficulty(difficulty = this.selectedDifficulty) {
      this.isLoading = true

      try {
        const seedQuery = this.difficultySeedQueries[difficulty] || this.difficultySeedQueries.medium
        const tracks = await this.searchTracksByProvider(seedQuery, 60)

        const normalizedTracks = tracks.map(track => ({
          ...track,
          difficulty: this.calculateDifficulty(track)
        }))

        const exactMatches = normalizedTracks.filter(track => track.difficulty === difficulty)
        this.searchResults = exactMatches.length ? exactMatches : normalizedTracks
      } catch (error) {
        console.error('Erro ao carregar músicas por dificuldade:', error)
        this.searchResults = []
      } finally {
        this.isLoading = false
      }
    },

    // ===================== DIFFICULTY =====================
    calculateDifficulty(track, lyrics = '') {
      let score = 2

      const duration = Number(track.duration || 180)
      const artistName = track.artist?.name || track.artist || ''
      const genre = (track.genre?.name || track.genre || '').toLowerCase()

      if (duration >= 240) score += 1
      if (duration >= 330) score += 1
      if (duration <= 140) score -= 1

      score += this.getArtistDifficultyBoost(artistName)

      const fastGenres = ['rap', 'hip hop', 'hip-hop', 'drum & bass', 'techno', 'metal', 'trap']
      const slowGenres = ['ballad', 'acoustic', 'jazz', 'blues', 'folk']

      if (fastGenres.some(g => genre.includes(g))) score += 1
      if (slowGenres.some(g => genre.includes(g))) score -= 1

      if (lyrics) {
        const cleanLyrics = lyrics
          .toLowerCase()
          .replace(/[^\w\s']/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        const words = cleanLyrics.split(' ').filter(Boolean)
        const totalWords = words.length || 1
        const uniqueWords = new Set(words).size
        const wordDensity = totalWords / Math.max(1, duration / 60)

        const lines = lyrics.split('\n').map(l => l.trim()).filter(Boolean)
        const avgWordsPerLine = lines.length
          ? lines.reduce((sum, line) => sum + line.split(/\s+/).length, 0) / lines.length
          : 0

        const complexityRatio = uniqueWords / totalWords

        if (wordDensity >= 120) score += 2
        else if (wordDensity >= 90) score += 1

        if (complexityRatio >= 0.55) score += 1
        if (avgWordsPerLine >= 7) score += 1
      }

      if (score >= 5) return 'hard'
      if (score >= 3) return 'medium'
      return 'easy'
    },

    getArtistDifficultyBoost(artistName = '') {
      const artist = artistName.toLowerCase()

      const hardArtists = [
        'whitney houston', 'mariah carey', 'queen', 'ariana grande',
        'celine dion', 'eminem', 'twista', 'busta rhymes',
        'guns n roses', 'bruno mars'
      ]

      const mediumArtists = [
        'adele', 'coldplay', 'dua lipa', 'the weeknd',
        'imagine dragons', 'rihanna', 'sia', 'lady gaga'
      ]

      const easyArtists = [
        'bob dylan', 'johnny cash', 'ed sheeran', 'jason mraz',
        'beatles', 'elvis presley'
      ]

      if (hardArtists.some(a => artist.includes(a))) return 3
      if (mediumArtists.some(a => artist.includes(a))) return 1
      if (easyArtists.some(a => artist.includes(a))) return -1

      return 0
    },

    getDifficultyColor(difficulty) {
      const colors = {
        easy: '#22c55e',
        medium: '#f59e0b',
        hard: '#ef4444'
      }
      return colors[difficulty] || '#888'
    },

    getDifficultyLabel(difficulty) {
      const labels = {
        easy: 'Fácil',
        medium: 'Médio',
        hard: 'Difícil'
      }
      return labels[difficulty] || difficulty
    },

    getAccuracyColor(percent) {
      if (percent >= 90) return '#22c55e'
      if (percent >= 70) return '#f59e0b'
      if (percent >= 50) return '#ef4444'
      return '#8b5cf6'
    },

    // ===================== LYRICS SYNC =====================
    async fetchLRCFromLRCLIB(title, artist, duration) {
      try {
        const query = `${title} ${artist}`.toLowerCase().trim()
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`
        const response = await fetch(searchUrl)

        if (!response.ok) return null

        const data = await response.json()
        if (!data || data.length === 0) return null

        let bestMatch = null
        let bestDurationDiff = Infinity

        for (const track of data) {
          const diff = Math.abs((track.duration || 0) - (duration || 180))
          if (diff < bestDurationDiff) {
            bestDurationDiff = diff
            bestMatch = track
          }
        }

        if (!bestMatch || !bestMatch.syncedLyrics) return null

        const lrcLines = bestMatch.syncedLyrics.split('\n')
        const parsed = []

        for (const line of lrcLines) {
          const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
          if (match) {
            const minutes = parseInt(match[1])
            const seconds = parseInt(match[2])
            const centis = parseInt(match[3].padEnd(3, '0').substring(0, 3))
            const time = minutes * 60 + seconds + centis / 1000
            const text = match[4].trim()

            if (text) {
              parsed.push({ time, text })
            }
          }
        }

        return parsed.sort((a, b) => a.time - b.time)
      } catch (error) {
        console.warn('LRCLIB falhou:', error)
        return null
      }
    },

    async fetchLyricsFromGenius(title, artist) {
      if (!this.GENIUS_TOKEN) {
        console.log('Genius token não configurado, pulando...')
        return null
      }

      try {
        const searchUrl = `${this.CORS_PROXY}${this.GENIUS_API}/search?q=${encodeURIComponent(title + ' ' + artist)}&access_token=${this.GENIUS_TOKEN}`
        const searchRes = await fetch(searchUrl)

        if (!searchRes.ok) {
          throw new Error(`HTTP ${searchRes.status}`)
        }

        const searchData = await searchRes.json()

        if (!searchData.response.hits.length) {
          throw new Error('Música não encontrada no Genius')
        }

        const song = searchData.response.hits[0].result
        const songUrl = song.url

        const lyricsPage = await fetch(`${this.CORS_PROXY}${songUrl}`)
        const html = await lyricsPage.text()

        const lyricsMatch = html.match(/<div class="lyrics">([\s\S]*?)<\/div>/)
        if (lyricsMatch) {
          return this.cleanLyrics(lyricsMatch[1])
        }

        throw new Error('Formato de letras não reconhecido')
      } catch (error) {
        console.error('Erro ao buscar letras:', error)
        return null
      }
    },

    async fetchLyricsFromAlternativeAPI(title, artist) {
      const apis = [
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
        `https://api.textyl.co/api/lyrics?q=${encodeURIComponent(title + ' ' + artist)}`
      ]

      for (const api of apis) {
        try {
          const res = await fetch(api)
          if (!res.ok) continue
          const data = await res.json()
          if (data.lyrics) return data.lyrics
        } catch (e) {
          continue
        }
      }
      return null
    },

    cleanLyrics(rawLyrics) {
      return rawLyrics
        .replace(/<[^>]+>/g, '')
        .replace(/\\[.*?\\]/g, '')
        .replace(/\\n{3,}/g, '\\n\\n')
        .trim()
    },

    analyzeLyricStructure(lines) {
      const chorusLines = []
      const bridgeLines = []

      const lineCounts = new Map()
      for (let i = 0; i < lines.length; i++) {
        const normalized = lines[i].toLowerCase().replace(/[^\w\s]/g, '').trim()
        if (normalized.length > 10) {
          const count = lineCounts.get(normalized) || []
          count.push(i)
          lineCounts.set(normalized, count)
        }
      }

      for (const [_, indices] of lineCounts) {
        if (indices.length >= 2) {
          chorusLines.push(...indices)
        }
      }

      const totalLines = lines.length
      const middleStart = Math.floor(totalLines * 0.4)
      const middleEnd = Math.floor(totalLines * 0.7)

      for (let i = middleStart; i < middleEnd; i++) {
        if (!chorusLines.includes(i)) {
          bridgeLines.push(i)
        }
      }

      return { chorusLines, bridgeLines }
    },

    processLyricsWithTiming(lyricsText, songDuration, lrcData = null) {
      if (lrcData && lrcData.length > 0) {
        return lrcData.map(item => ({
          time: item.time,
          text: item.text,
          phonetic: this.generatePhonetic(item.text),
          correct: false,
          wrong: false,
          sung: false,
          isInstrumental: item.text.includes('♪') || item.text.includes('Instrumental'),
          duration: 0
        })).map((line, i, arr) => {
          const next = arr[i + 1]
          line.duration = next ? next.time - line.time : 3
          return line
        })
      }

      const lines = lyricsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)

      const structure = this.analyzeLyricStructure(lines)

      let currentTime = 0
      const avgLineDuration = songDuration / lines.length

      return lines.map((line, index) => {
        const isInstrumental = line.includes('Instrumental') || line.includes('♪')
        const isChorus = structure.chorusLines.includes(index)

        let duration = avgLineDuration
        if (isInstrumental) duration *= 2
        if (isChorus) duration *= 0.9
        if (line.length < 10) duration *= 0.7
        if (line.length > 50) duration *= 1.3

        if (isChorus && structure.chorusLines[structure.chorusLines.length - 1] === index) {
          duration *= 1.2
        }

        const processedLine = {
          time: currentTime,
          text: line,
          phonetic: this.generatePhonetic(line),
          correct: false,
          wrong: false,
          sung: false,
          isInstrumental,
          duration
        }

        currentTime += duration
        return processedLine
      })
    },

 calculateLyricsTimeScale() {
  if (!this.processedLyrics.length) return
  const previewDuration = this.duration || 30
  const fullDuration = this.currentSong.duration || 180

  if (!this.hasRealLRC) {
    this.lyricsTimeScale = fullDuration / previewDuration
    // ✅ Se já temos offset do backend, usa ele. Senão, estima o meio
    this.previewStartOffset = this.previewStartOffset || Math.max(0, (fullDuration - previewDuration) / 2)
    return
  }
this.lyricsTimeScale = 1
      const lines = this.processedLyrics

      let bestWindow = {
        score: -Infinity,
        startTime: 0,
        endTime: previewDuration
      }

      for (let i = 0; i < lines.length; i++) {
        const start = lines[i].time
        const end = start + previewDuration

        const windowLines = lines.filter(l => l.time >= start && l.time <= end)

        if (!windowLines.length) continue

        let score = 0
        const unique = new Set()

        windowLines.forEach(line => {
          const txt = line.text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .trim()

          if (unique.has(txt)) {
            score += 5
          }

          unique.add(txt)
          score += Math.min(txt.length / 10, 4)

          if (line.isInstrumental) {
            score -= 3
          }
        })

        const center = fullDuration / 2
        const distance = Math.abs(start - center)
        score += Math.max(0, 15 - distance / 5)

        if (score > bestWindow.score) {
          bestWindow = { score, startTime: start, endTime: end }
        }
      }

      const clippedLyrics = lines
        .filter(line => line.time >= bestWindow.startTime && line.time <= bestWindow.endTime)
        .map(line => ({
          ...line,
          time: line.time - bestWindow.startTime
        }))

      this.processedLyrics = clippedLyrics
      this.previewStartOffset = bestWindow.startTime
      this.lyricsTimeScale = 1

      console.log('Preview detectado:', `${bestWindow.startTime.toFixed(1)}s → ${bestWindow.endTime.toFixed(1)}s`)
      console.log('Linhas recortadas:', clippedLyrics.length)
    },

generatePhonetic(text) {
  const ptPhoneticMap = {
    // Palavras simples
    'love': 'lóvi', 'you': 'iu', 'me': 'mi', 'heart': 'rárti',
    'night': 'náiti', 'day': 'dêi', 'way': 'uêi', 'time': 'táimi',
    'life': 'láifi', 'baby': 'bêibi', 'oh': 'ôu', 'yeah': 'ié',
    'i': 'ái', 'my': 'mái', 'your': 'iór', 'the': 'dâ',
    'and': 'éndi', 'to': 'tu', 'a': 'â', 'of': 'óvi',
    'in': 'in', 'is': 'iz', 'it': 'iti', 'that': 'dât',
    'for': 'fór', 'on': 'ón', 'with': 'uífi', 'he': 'rí',
    'she': 'xí', 'we': 'uí', 'they': 'dêi', 'this': 'dis',
    'have': 'révi', 'has': 'réz', 'had': 'réd', 'do': 'du',
    'does': 'dáz', 'did': 'díd', 'will': 'uîu', 'would': 'uûd',
    'can': 'quén', 'could': 'cûd', 'should': 'xûd', 'may': 'méi',
    'might': 'máiti', 'must': 'mást', 'shall': 'xóu', 'let': 'lét',
    'go': 'gôu', 'come': 'câm', 'see': 'sí', 'know': 'nôu',
    'get': 'gét', 'make': 'mêiki', 'take': 'têiki', 'think': 'fínki',
    'say': 'sêi', 'tell': 'téu', 'give': 'gívi', 'find': 'fáindi',
    'feel': 'fíu', 'become': 'bikâm', 'leave': 'lívi', 'put': 'pût',
    'mean': 'mín', 'keep': 'kípi', 'begin': 'bigín', 'seem': 'síim',
    'help': 'rélpi', 'show': 'xôu', 'hear': 'ríer', 'play': 'plêi',
    'run': 'rân', 'move': 'mûvi', 'live': 'lívi', 'believe': 'bilívi',
    'bring': 'brín', 'happen': 'répân', 'stand': 'isténdi', 'lose': 'lûzi',
    'pay': 'pêi', 'meet': 'míti', 'include': 'inklûdi', 'continue': 'kântinûu',
    'set': 'sét', 'learn': 'lérni', 'change': 'tchêinji', 'lead': 'lídi',
    'understand': 'ândêristéndi', 'watch': 'uótchi', 'follow': 'fóloû',
    'stop': 'istópi', 'create': 'kriêiti', 'speak': 'ispíiki', 'read': 'rídi',
    'allow': 'éláû', 'add': 'édi', 'spend': 'ispéndi', 'grow': 'grôu',
    'open': 'ôupân', 'walk': 'uóki', 'win': 'uín', 'offer': 'ófer',
    'remember': 'rimémber', 'consider': 'kânsíder', 'appear': 'ápír', 'buy': 'bái',
    'wait': 'uêiti', 'serve': 'sérvi', 'die': 'dái', 'send': 'séndi',
    'expect': 'ikspékti', 'build': 'bíu', 'stay': 'istêi', 'fall': 'fóu',
    'cut': 'kât', 'reach': 'ríchi', 'kill': 'kíu', 'remain': 'rimêin',
    'suggest': 'sajésti', 'raise': 'rêizi', 'pass': 'pés', 'sell': 'séu',
    'require': 'riquáier', 'report': 'ripórti', 'decide': 'disáidi', 'pull': 'pûu',
    'son': 'sân', 'sometimes': 'sâmtáimzi', 'may': 'méi', 'seem': 'síim',
    'dark': 'dárki', 'told': 'tôu', 'never': 'néver', 'tender': 'ténder',
    'sweet': 'suíti', 'complete': 'kâmplíti', 'real': 'ríou', 'fantasy': 'féntâsi',
    'caught': 'cóti', 'landslide': 'léndiisláidi', 'escape': 'iskêipi',
    'reality': 'riéliti', 'eyes': 'áizi', 'smile': 'smáili',
    'childhood': 'tcháildrûdi', 'memories': 'mémoûrizi', 'everything': 'évritín',
    'fresh': 'fréxi', 'bright': 'bráiti', 'blue': 'blû', 'sky': 'skái',
    'world': 'uórudi', 'song': 'sóngi', 'dance': 'dénsi', 'dream': 'dríim',
    'star': 'istár', 'moon': 'mûn', 'sun': 'sân', 'rain': 'rêin',
    'wind': 'uíndi', 'fire': 'fáier', 'water': 'uóter', 'earth': 'érzi',
    'friend': 'fréndi', 'home': 'rôum', 'hope': 'rôupi', 'peace': 'písi',
    'joy': 'dchói', 'pain': 'pêin', 'fear': 'fíer', 'courage': 'kériji',
    'free': 'frí', 'true': 'trû', 'good': 'gûdi', 'bad': 'bédi',
    'new': 'niû', 'old': 'ôudi', 'young': 'iângi', 'big': 'bígi',
    'small': 'ismóu', 'long': 'lóngi', 'short': 'xórti', 'high': 'rái',
    'low': 'lôu', 'fast': 'fésti', 'slow': 'islôu', 'hot': 'róti',
    'cold': 'côudi', 'warm': 'uórmi', 'cool': 'cûu', 'happy': 'répi',
    'sad': 'sédi', 'angry': 'éngrí', 'tired': 'táierdi', 'hungry': 'rângri',
    'thirsty': 'férsiti', 'sick': 'síki', 'healthy': 'réuzi', 'beautiful': 'biútifou',
    'ugly': 'ágli', 'rich': 'ríxi', 'poor': 'pûer', 'clean': 'klín',
    'dirty': 'dérti', 'easy': 'ízi', 'hard': 'rár', 'soft': 'sôfti',
    'rough': 'râfi', 'smooth': 'ismûfi', 'sharp': 'xárpi', 'dull': 'dâu',
    'light': 'láiti', 'heavy': 'révi', 'deep': 'dípi', 'shallow': 'xéloû',
    'wide': 'uáidi', 'narrow': 'néroû', 'full': 'fûu', 'empty': 'émpti',
    'right': 'ráiti', 'wrong': 'róngi', 'left': 'léfti', 'straight': 'istrêiti',
    'round': 'ráundi', 'square': 'skuéer', 'late': 'lêiti', 'early': 'érlí',
    'now': 'náû', 'then': 'dên', 'today': 'tudêi', 'tomorrow': 'tumóroû',
    'yesterday': 'iésterdêi', 'always': 'óuêizi', 'often': 'ófân',
    'usually': 'iûxûali', 'again': 'agêin', 'still': 'istíu', 'yet': 'iéti',
    'already': 'órédí', 'just': 'djâsti', 'only': 'ôunli', 'even': 'ívan',
    'also': 'óusôu', 'too': 'tû', 'very': 'véri', 'really': 'ríali',
    'quite': 'kuáiti', 'rather': 'ráder', 'pretty': 'príti', 'fairly': 'féerli',
    'almost': 'óumôusti', 'nearly': 'níerli', 'hardly': 'rárli', 'barely': 'béerli',
    'scarcely': 'skéersli', 'seldom': 'séldâm', 'rarely': 'réerli',
    'frequently': 'fríquântli', 'occasionally': 'akêiçonali', 'constantly': 'kânstântli',
    'continuously': 'kântínûasli', 'regularly': 'régûlerli', 'daily': 'dêili',
    'weekly': 'uíkli', 'monthly': 'mânflí', 'yearly': 'íerli',
    'hourly': 'áuerli', 'minute': 'míniti', 'second': 'sékândi', 'moment': 'môumânt',
    'while': 'uáili', 'during': 'djûring', 'before': 'bifór', 'after': 'éfter',
    'since': 'sins', 'until': 'ântíu', 'till': 'tíu', 'as': 'éz',
    'when': 'uén', 'whenever': 'uéneva', 'once': 'uâns', 'twice': 'tuáisi',
    'here': 'ríer', 'there': 'déer', 'everywhere': 'évriuér', 'somewhere': 'sâmuér',
    'nowhere': 'nôuér', 'anywhere': 'énniuér', 'elsewhere': 'élsuér',
    'above': 'abâvi', 'below': 'bilôu', 'over': 'ôuva', 'under': 'ândâ',
    'between': 'bituíni', 'among': 'amângi', 'through': 'frû', 'across': 'acrôsi',
    'into': 'intû', 'onto': 'ântû', 'towards': 'tuórzi', 'against': 'agênsti',
    'beside': 'bisáidi', 'besides': 'bisáidzi', 'beyond': 'biândi', 'within': 'uífini',
    'without': 'uífáûti', 'inside': 'insáidi', 'outside': 'autsáidi', 'along': 'alóngi',
    'around': 'aráundi', 'behind': 'biráindi', 'except': 'ikcépti',
    'despite': 'dispáiti', 'regarding': 'rigárding', 'concerning': 'kânsérning',
    'according': 'akórding', 'depending': 'dipénding', 'following': 'fóloûing',
    'throughout': 'frûáûti', 'upon': 'apân', 'toward': 'tuórde',
    'whether': 'uéder', 'either': 'áider', 'neither': 'níder', 'both': 'bôufi',
    'all': 'óu', 'each': 'ítchi', 'every': 'évri', 'another': 'anâder',
    'other': 'âder', 'others': 'âderzi', 'such': 'sâtchi', 'what': 'uót',
    'which': 'uítchi', 'who': 'rû', 'whom': 'rûm', 'whose': 'rûzi',
    'where': 'uér', 'why': 'uái', 'how': 'ráû', 'whatever': 'uóteva',
    'whoever': 'rûeva', 'whichever': 'uítcheva', 'however': 'ráueva',
    'whenever': 'uéneva', 'wherever': 'uéreva', 'because': 'bikôzi', 'since': 'sins',
    'although': 'óudôu', 'though': 'dôu', 'while': 'uáili', 'whereas': 'uéréz',
    'unless': 'anlés', 'provided': 'praváidi', 'assuming': 'asúming',
    'supposing': 'sapôuzi', 'if': 'ifi', 'than': 'dân', 'like': 'láiki',
    'so': 'sôu', 'thus': 'dás', 'therefore': 'déerfór', 'hence': 'réns',
    'consequently': 'kânsikuentli', 'accordingly': 'akórdingli',
    'otherwise': 'âderuáizi', 'instead': 'instéd', 'meanwhile': 'mínuáili',
    'moreover': 'morôuva', 'furthermore': 'fédermór', 'nevertheless': 'néverdaless',
    'nonetheless': 'nândaless', 'however': 'ráueva', 'still': 'istíu', 'yet': 'iéti',
    'though': 'dôu', 'although': 'óudôu', 'even': 'ívan', 'despite': 'dispáiti',
    'regardless': 'rigárles', 'notwithstanding': 'nâtuífisténdi', 'whereas': 'uéréz',
    'else': 'éls', 'perhaps': 'pérépzi', 'maybe': 'méibi', 'probably': 'próbâbli',
    'possibly': 'pósibli', 'likely': 'láikli', 'unlikely': 'anláikli',
    'certainly': 'sértânli', 'definitely': 'définitli', 'absolutely': 'ébsalûtli',
    'exactly': 'igzéktli', 'precisely': 'prisáisli', 'specifically': 'spisífikli',
    'particularly': 'partíkûlerli', 'especially': 'espéciali', 'mainly': 'mêinli',
    'mostly': 'môustli', 'largely': 'lárjli', 'partly': 'pártli', 'slightly': 'sláitli',
    'somewhat': 'sâmuót', 'somehow': 'sâmráû', 'anyway': 'énniuêi', 'anyhow': 'énni-ráû',
    'besides': 'bisáidzi', 'moreover': 'morôuva', 'furthermore': 'fédermór',
    'additionally': 'adíçonali', 'also': 'óusôu', 'too': 'tû', 'well': 'uél',
    'nor': 'nór', 'or': 'ór', 'and': 'éndi', 'but': 'bât', 'for': 'fór',
    'soon': 'sûn', 'long': 'lóngi', 'enough': 'inâfi', 'very': 'véri',
    'enough': 'inâfi', 'almost': 'óumôusti', 'nearly': 'níerli', 'barely': 'béerli',
    'hardly': 'rárli', 'scarcely': 'skéersli', 'seldom': 'séldâm', 'rarely': 'réerli',
    'never': 'néver', 'always': 'óuêizi', 'often': 'ófân', 'frequently': 'fríquântli',
    'occasionally': 'akêiçonali', 'sometimes': 'sâmtáimzi', 'usually': 'iûxûali',
    'generally': 'dchénerali', 'normally': 'nórmali', 'typically': 'típicli',
    'commonly': 'kâmânli', 'widely': 'uáidli', 'extensively': 'iksténsivli',
    'broadly': 'bródi', 'loosely': 'lûsli', 'strictly': 'istríktli',
    'rigorously': 'rígorasli', 'carefully': 'kérfuli', 'cautiously': 'côçasli',
    'warily': 'uérili', 'hesitantly': 'hézitântli', 'reluctantly': 'rilâktântli',
    'grudgingly': 'grâdingli', 'willingly': 'uílingli', 'eagerly': 'ígerli',
    'enthusiastically': 'enfuziástikli', 'passionately': 'péçonâtli',
    'intensely': 'inténsli', 'fiercely': 'fíersli', 'violently': 'váiolântli',
    'aggressively': 'agrésivli', 'forcibly': 'fórsibli', 'powerfully': 'páuerfuli',
    'strongly': 'istróngli', 'firmly': 'férmali', 'solidly': 'sólidli',
    'steadily': 'stédali', 'constantly': 'kânstântli', 'continuously': 'kântínûasli',
    'continually': 'kântínûali', 'repeatedly': 'ripítidli', 'regularly': 'régûlerli',
    'routinely': 'rutínli', 'habitually': 'râbitxuáli', 'customarily': 'kâstumérili',
    'traditionally': 'trâdíçonali', 'conventionally': 'kânvençonali', 'ordinarily': 'órdinerili',
    'universally': 'iunivérsali', 'globally': 'glôubali', 'internationally': 'internéçonali',
    'nationally': 'néçonali', 'locally': 'lôkali', 'regionally': 'ríjonali',
    'provincially': 'pravínçali', 'rurally': 'rûrali', 'domestically': 'dâméstikli',
    'internally': 'intérnali', 'externally': 'ikstérnali', 'outwardly': 'autuérdli',
    'inwardly': 'inuérdli', 'overtly': 'ôuvértli', 'covertly': 'côuvértli',
    'secretly': 'síkrâtli', 'privately': 'práivâtli', 'personally': 'pérsânli',
    'individually': 'indivíduali', 'separately': 'séparâtli', 'independently': 'indipéndântli',
    'alone': 'alôun', 'together': 'tugéder', 'jointly': 'djóintli', 'collectively': 'kâléktivli',
    'mutually': 'mûtuali', 'reciprocally': 'resíprocali', 'respectively': 'rispektívli',
    'correspondingly': 'kârispândingli', 'similarly': 'símilarli', 'likewise': 'láik-uáizi',
    'equally': 'íkuali', 'identically': 'aidéntikli', 'uniformly': 'iúniformli',
    'consistently': 'kânsístântli', 'coherently': 'kouhírentli', 'logically': 'lódjikli',
    'rationally': 'réçonali', 'reasonably': 'rízanabli', 'sensibly': 'sénsibli',
    'practically': 'préktikli', 'realistically': 'riâlístikli', 'optimistically': 'optimístikli',
    'pessimistically': 'pessimístikli', 'idealistically': 'aidiâlístikli', 'romantically': 'romântikli',
    'pragmatically': 'pragmátikli', 'dogmatically': 'dogmátikli', 'systematically': 'sistimátikli',
    'methodically': 'mefódikli', 'orderly': 'órdeli', 'neatly': 'níitli', 'tidily': 'táidili',
    'cleanly': 'klínli', 'smoothly': 'ismûfli', 'evenly': 'ívânli', 'stably': 'stêibili',
    'securely': 'sikiúrli', 'safely': 'sêifli', 'dangerously': 'dêinjerosli',
    'hazardously': 'rézardosli', 'riskily': 'rískili', 'perilously': 'périlosli',
    'precariously': 'prikériasli', 'uncertainly': 'ansértânli', 'doubtfully': 'dáutfli',
    'skeptically': 'sképtikli', 'cynically': 'sínikli', 'suspiciously': 'saspíçasli',
    'dubiously': 'djúbiasli', 'questionably': 'kuéçionabli', 'debatable': 'dibêitâbli',
    'arguably': 'árgiuabli', 'conceivably': 'kânsíivabli', 'potentially': 'poténçali',
    'theoretically': 'fiârétikli', 'hypothetically': 'haipotétikli', 'ideally': 'aidíali',
    'preferably': 'préferabli', 'optimally': 'óptimabli', 'perfectly': 'pérfiktli',
    'flawlessly': 'flólisli', 'impeccably': 'impekâbli', 'excellently': 'ékselântli',
    'superbly': 'supérbli', 'magnificently': 'magnífisântli', 'splendidly': 'spléndidli',
    'gloriously': 'glóriasli', 'brilliantly': 'bríliântli', 'outstandingly': 'autsténdiŋli',
    'remarkably': 'rimárkâbli', 'extraordinarily': 'ikstrôrdinérili', 'exceptionally': 'iksepçonali',
    'unusually': 'aníuuali', 'abnormally': 'abnórmali', 'incredibly': 'inkrédibili',
    'unbelievably': 'anbilívabli', 'astonishingly': 'astôniçingli', 'amazingly': 'amêizingli',
    'surprisingly': 'surpráizingli', 'unexpectedly': 'anikspéktidli', 'suddenly': 'sâdânli',
    'abruptly': 'abrâptli', 'immediately': 'imídiâtli', 'instantly': 'ínstântli',
    'promptly': 'prómptli', 'quickly': 'kuíkli', 'rapidly': 'répidli', 'swiftly': 'suíftli',
    'speedily': 'spíidili', 'hastily': 'hêistili', 'hurriedly': 'hâridli', 'slowly': 'islôuli',
    'gradually': 'grédiuali', 'gently': 'djéntli', 'softly': 'sôftli', 'quietly': 'kuáiatli',
    'silently': 'sáilântli', 'peacefully': 'písfali', 'calmly': 'kâmli', 'serenely': 'serínli',
    'tranquilly': 'tránkuili', 'placidly': 'plésidli', 'mildly': 'máildli', 'moderately': 'móderâtli',
    'marginally': 'márjinâli', 'minimally': 'mínimâli', 'infrequently': 'infriquântli'
  }

  // Tenta frases exatas primeiro (mais preciso)
  const phraseMap = {
    'he told me': 'ri tôu-di mí',
    'son sometimes': 'sân sâm-táimzi',
    'it may seem dark': 'iti méi síim dárki',
    'love me tender': 'lóvi mí tén-der',
    'love me sweet': 'lóvi mí suít',
    'never let me go': 'né-ver lét mí gôu',
    'you have made': 'iu révi mêidi',
    'my life complete': 'mái láifi kâm-plíti',
    'and i love you so': 'éndi ái lóvi iu sôu',
    'is this the real life': 'iz dis dâ rí-ou láifi',
    'is this just fantasy': 'iz dis djâsti fén-tâ-si',
    'caught in a landslide': 'cóti in â lén-di-sláidi',
    'no escape from reality': 'nôu is-kêipi frâm ri-é-li-ti',
    'open your eyes': 'ôu-pân iór ái-zi',
    'she\'s got a smile': 'xí góti â smái-li',
    'that it seems to me': 'dât iti síimz tu mí',
    'reminds me of': 'ri-máindi mí óvi',
    'childhood memories': 'tchái-ldrû-di mé-moû-rizi',
    'where everything': 'uér é-vri-tín',
    'was as fresh': 'uóz éz fréxi',
    'as the bright blue sky': 'éz dâ bráiti blû skái'
  }

  const lowerText = text.toLowerCase().trim().replace(/[^\w\s']/g, '')
 
  // Tenta frase exata primeiro
  if (phraseMap[lowerText]) {
    return phraseMap[lowerText]
  }

  // Tenta frases parciais (2-3 palavras)
  const words = lowerText.split(/\s+/).filter(Boolean)
  for (let i = 0; i < words.length - 1; i++) {
    const twoWords = words.slice(i, i + 2).join(' ')
    const threeWords = words.slice(i, i + 3).join(' ')
    if (phraseMap[threeWords]) return phraseMap[threeWords]
    if (phraseMap[twoWords]) return phraseMap[twoWords]
  }

  // Fallback: palavra por palavra
  const phonetics = words.map(word => {
    const clean = word.replace(/[^a-z']/g, '')
    return ptPhoneticMap[clean] || ''
  }).filter(Boolean)

  return phonetics.join(' ') || lowerText
},

  async loadLyricsForCurrentSong() {
  this.isLoadingLyrics = true
  this.lyricsError = null

  try {
    // ✅ NOVO: Tenta primeiro o backend karaoke para sincronia perfeita
    let lrcData = null
    let previewOffset = 0
   
    try {
      const syncRes = await fetch(
        `${this.API_BASE}/api/karaoke/lyrics-sync?` +
        `title=${encodeURIComponent(this.currentSong.title)}&` +
        `artist=${encodeURIComponent(this.currentSong.artist)}&` +
        `previewDuration=${this.currentSong.previewDuration || 30}`
      )
     
    if (syncRes.ok) {
  const syncData = await syncRes.json()
  lrcData = syncData.lyrics
  previewOffset = syncData.suggestedOffset || 0
  this.currentSong.duration = syncData.fullDuration || this.currentSong.duration
 
  // ✅ LOG para debug (remova depois)
  console.log(`[KARAOKE] Preview offset: ${previewOffset}s, Full: ${syncData.fullDuration}s`)
}
    } catch (e) {
     console.warn('[KARAOKE] Backend indisponível, usando fallback LRCLIB:', e)
    }
   
    // Fallback direto pro LRCLIB se backend falhar
    if (!lrcData) {
      lrcData = await this.fetchLRCFromLRCLIB(
        this.currentSong.title,
        this.currentSong.artist,
        this.currentSong.duration
      )
    }

    if (lrcData && lrcData.length > 0) {
      this.rawLyrics = lrcData.map(l => l.text).join('\n')
     
      // ✅ Aplica o offset do preview nos tempos
      const adjustedLrc = lrcData.map(l => ({
        ...l,
        time: Math.max(0, l.time - previewOffset)  // Ajusta tempo pro preview
      })).filter(l => l.time >= 0 && l.time <= (this.currentSong.previewDuration || 30))
     
      this.processedLyrics = this.processLyricsWithTiming(
        this.rawLyrics,
        this.currentSong.duration,
        adjustedLrc
      )
     
      this.hasRealLRC = true
      this.previewStartOffset = previewOffset  // Guarda o offset usado
     console.log('[KARAOKE] Letra sincronizada. Offset do preview:', previewOffset)
     
    } else {
      // Fallback para letras não sincronizadas
      let lyricsText = await this.fetchLyricsFromGenius(
        this.currentSong.title,
        this.currentSong.artist
      )

      if (!lyricsText) {
        lyricsText = await this.fetchLyricsFromAlternativeAPI(
          this.currentSong.title,
          this.currentSong.artist
        )
      }

      if (lyricsText) {
        this.rawLyrics = lyricsText
        const estimatedSongDuration = this.currentSong.duration || 180
        this.processedLyrics = this.processLyricsWithTiming(
          lyricsText,
          estimatedSongDuration
        )
        this.hasRealLRC = false
      } else {
        throw new Error('Letras não disponíveis')
      }
    }

       const realDifficulty = this.calculateDifficulty(this.currentSong, this.rawLyrics)
    this.currentSong.difficulty = realDifficulty

    const words = this.rawLyrics.split(/\s+/).length
    this.currentSong.stats = {
      wordDensity: Math.round((words / this.currentSong.duration) * 60),
      uniqueWords: new Set(this.rawLyrics.toLowerCase().split(/\s+/)).size,
      totalLines: this.processedLyrics.length
    }

  } catch (error) {
    console.error('Erro ao carregar letras:', error)
    this.lyricsError = 'Letras não disponíveis. Usando letras de exemplo.'
    this.loadFallbackLyrics()
  } finally {
    this.isLoadingLyrics = false
  }
},

    loadFallbackLyrics() {
      const fallbackLyrics = {
        easy: [
          { time: 0, text: "Love me tender", phonetic: "lʌv miː ˈtɛndər", duration: 3 },
          { time: 3, text: "Love me sweet", phonetic: "lʌv miː swiːt", duration: 3 },
          { time: 6, text: "Never let me go", phonetic: "ˈnɛvər lɛt miː ɡoʊ", duration: 3 },
          { time: 9, text: "You have made my life complete", phonetic: "juː hæv meɪd maɪ laɪf kəmˈpliːt", duration: 3 },
          { time: 12, text: "And I love you so", phonetic: "ænd aɪ lʌv juː soʊ", duration: 3 }
        ],
        medium: [
          { time: 0, text: "Is this the real life?", phonetic: "ɪz ðɪs ðə riːl laɪf", duration: 4 },
          { time: 4, text: "Is this just fantasy?", phonetic: "ɪz ðɪs dʒʌst fænˈtæzi", duration: 4 },
          { time: 8, text: "Caught in a landslide", phonetic: "kɔːt ɪn ə ˈlændslaɪd", duration: 4 },
          { time: 12, text: "No escape from reality", phonetic: "noʊ ɪˈskeɪp frɒm riˈælɪti", duration: 4 },
          { time: 16, text: "Open your eyes", phonetic: "ˈoʊpən jɔːr aɪz", duration: 4 }
        ],
        hard: [
          { time: 0, text: "She's got a smile that it seems to me", phonetic: "ʃiːz ɡɒt ə smaɪl ðæt ɪt siːmz tuː miː", duration: 4 },
          { time: 4, text: "Reminds me of childhood memories", phonetic: "rɪˈmaɪndz miː ʌv ˈtʃaɪldhʊd ˈmɛməriz", duration: 4 },
          { time: 8, text: "Where everything was as fresh", phonetic: "weər ˈɛvriθɪŋ wʌz æz frɛʃ", duration: 4 },
          { time: 12, text: "As the bright blue sky", phonetic: "æz ðə braɪt bluː skaɪ", duration: 4 }
        ]
      }

      const diff = this.currentSong.difficulty || 'medium'
      this.processedLyrics = fallbackLyrics[diff] || fallbackLyrics.medium
      this.hasRealLRC = false
    },

    // ===================== AUDIO SYNC =====================
syncLyricsWithAudio() {
  if (!this.processedLyrics.length) return
  if (!this.autoScroll) return

  // Bloqueia auto-sync se reconhecimento de voz acabou de sincronizar
  if (this.withMicrophone && Date.now() - this.lastSpeechSyncAt < 800) {
    return
  }

  // ✅ APLICA O OFFSET AQUI — sem lookahead que anula o offset
   const effectiveTime = this.getEffectiveLyricsTime(true)

  let newLineIndex = -1

  // Busca a linha ativa baseada no tempo EFETIVO (com offset)
  for (let i = 0; i < this.processedLyrics.length; i++) {
    const line = this.processedLyrics[i]
    const nextLine = this.processedLyrics[i + 1]
   
    const start = line.time
    const end = nextLine ? nextLine.time : line.time + (line.duration || 3)
   
    // ✅ Compara com effectiveTime que JÁ INCLUI o offset
    if (effectiveTime >= start && effectiveTime < end) {
      newLineIndex = i
      break
    }
  }

  // Fallback
  if (newLineIndex === -1) {
    if (effectiveTime < this.processedLyrics[0].time) {
      newLineIndex = 0
    } else {
      for (let i = this.processedLyrics.length - 1; i >= 0; i--) {
        if (this.processedLyrics[i].time <= effectiveTime) {
          newLineIndex = i
          break
        }
      }
      if (newLineIndex === -1) newLineIndex = 0
    }
  }

  if (newLineIndex !== this.currentLineIndex) {
    this.currentLineIndex = newLineIndex
  }
},

onAudioTimeUpdate() {
  // ✅ Se está usando Spotify Premium, NÃO usa o audio element
  if (this.isSpotifyPremium && this.currentSong.spotifyId) {
    return  // O startKaraokeSync já cuida da sincronização
  }
  
  const audio = this.$refs.audioPlayer
  if (!audio) return

  this.currentTime = audio.currentTime
  this.duration = this.currentSong.previewDuration || 30
  this.progressPercent = (this.currentTime / this.duration) * 100
  this.syncLyricsWithAudio()
 
  // ✅ NOVO: Auto-salva a cada 10 segundos se estiver com microfone e pontuando
  if (this.withMicrophone && this.currentScore > 0 && Math.floor(this.currentTime) % 10 === 0) {
    this.saveGameToHistory()
  }
},

    onAudioLoaded() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.volume = this.volume / 100
        audio.playbackRate = this.playbackRate
      }
    },
handleAudioEnded() {
  // ✅ Se Spotify Premium, o player_state_changed já cuida
  if (this.isSpotifyPremium && this.currentSong.spotifyId) {
    this.isPlaying = false
    if (this.withMicrophone) {
      this.saveGameToHistory()
    }
    return
  }
  
  const audio = this.$refs.audioPlayer
  if (audio) {
    this.isPlaying = false
    if (this.withMicrophone) {
      this.saveGameToHistory()
    }
  }
},

    // ===================== PLAYBACK CONTROLS =====================
async togglePlay() {
  // Se tem Spotify Premium e música do Spotify, usa o player completo
  if (this.isSpotifyPremium && this.currentSong.spotifyId) {
    if (this.isPlaying) {
      await this.spotifyPlayer.pause()
      this.isPlaying = false
    } else {
      await this.spotifyPlayer.resume()
      this.isPlaying = true
      if (this.withMicrophone && !this.micActive) this.startMicrophone()
    }
    return
  }

  // Fallback: preview de 30s (Deezer ou Spotify sem Premium)
  if (!this.audioPreviewUrl) {
    this.showMicPermissionToast(
      'warning',
      'Preview indisponível',
      'Esta música não possui preview disponível. Faça login com Spotify Premium para ouvir músicas completas.'
    )
    return
  }

  this.isPlaying = !this.isPlaying

  if (this.isPlaying) {
    this.$refs.audioPlayer?.play()
    if (this.withMicrophone && !this.micActive) this.startMicrophone()
  } else {
    this.$refs.audioPlayer?.pause()
  }
},

    skipBackward() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.currentTime = Math.max(0, audio.currentTime - 5)
        this.currentTime = audio.currentTime
        this.syncLyricsWithAudio()
      }
    },

    skipForward() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.currentTime = Math.min(this.duration, audio.currentTime + 5)
        this.currentTime = audio.currentTime
        this.syncLyricsWithAudio()
      }
    },

    seekTo(event) {
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const percent = (event.clientX - rect.left) / rect.width
      const newTime = percent * this.duration

      const audio = this.$refs.audioPlayer
      if (audio) audio.currentTime = newTime

      this.currentTime = newTime
      this.progressPercent = percent * 100
      this.syncLyricsWithAudio()
    },

    updateVolume() {
      const audio = this.$refs.audioPlayer
      if (audio) audio.volume = this.volume / 100
    },

    updatePlaybackRate() {
      const audio = this.$refs.audioPlayer
      if (audio) audio.playbackRate = this.playbackRate
    },

    toggleMute() {
      this.isMuted = !this.isMuted
      const audio = this.$refs.audioPlayer
      if (audio) audio.muted = this.isMuted
    },

    stopPlayback() {
      this.isPlaying = false
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      this.stopMicrophone()
    },

    // ===================== SCORING =====================
    resetScore() {
      this.currentScore = 0
      this.combo = 0
      this.starRating = 0
      this.accuracyPercent = 0
      this.totalAttempts = 0
      this.correctAttempts = 0
    },

    addScore(points, type) {
      if (this.strictMode && type !== 'perfect') {
        points *= 0.5
      }

      this.currentScore = Math.min(this.maxScore, this.currentScore + points)
      this.scoreAnimation = type
      setTimeout(() => this.scoreAnimation = '', 300)

      this.starRating = Math.min(5, Math.floor(this.currentScore / 2000))
    },

    // ===================== SPEECH RECOGNITION =====================
    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        console.warn('Speech API não suportada')
        this.showMicPermissionToast(
          'warning',
          'Reconhecimento de voz indisponível',
          'Seu navegador não suporta reconhecimento de voz. O modo com microfone pode não funcionar corretamente.'
        )
        return
      }

      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'

      this.recognition.onresult = (event) => {
        const results = event.results
        if (results.length > 0) {
          const lastResult = results[results.length - 1]
          const transcript = lastResult[0].transcript.toLowerCase().trim()
          this.lastRecognizedText = transcript
          this.checkSingingAccuracy(transcript)
        }
      }

      this.recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          this.showMicPermissionToast(
            'error',
            'Microfone bloqueado',
            'Você negou o acesso ao microfone. Para usar o modo com microfone, permita o acesso nas configurações do navegador e recarregue a página.'
          )
          this.micActive = false
        } else if (event.error === 'no-speech') {
          // Silencioso
        } else {
          console.error('Speech error:', event.error)
          this.showMicPermissionToast(
            'warning',
            'Erro no microfone',
            `Ocorreu um erro: ${event.error}. Tente desativar e reativar o microfone.`
          )
        }
      }
    },

    async toggleMic() {
      if (this.micActive) {
        this.stopMicrophone()
      } else {
        await this.startMicrophone()
      }
    },

    async startMicrophone() {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.micActive = true

        this.showMicPermissionToast(
          'success',
          'Microfone ativado',
          'Microfone conectado com sucesso! Comece a cantar quando a música iniciar.'
        )

        if (this.recognition && !this.isListening) {
          try {
            this.recognition.start()
            this.isListening = true
          } catch (e) {
            console.warn('Erro ao iniciar reconhecimento:', e)
          }
        }

        this.setupAudioAnalysis()
      } catch (error) {
        console.error('Erro ao acessar microfone:', error)

        let errorTitle = 'Erro no microfone'
        let errorMessage = 'Não foi possível acessar o microfone.'

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorTitle = 'Permissão negada'
          errorMessage = 'Você negou o acesso ao microfone. Para usar o modo com microfone, clique no ícone de cadeado na barra de endereço e permita o acesso ao microfone, depois recarregue a página.'
        } else if (error.name === 'NotFoundError') {
          errorTitle = 'Microfone não encontrado'
          errorMessage = 'Nenhum microfone foi detectado no seu dispositivo. Conecte um microfone e tente novamente.'
        } else if (error.name === 'NotReadableError') {
          errorTitle = 'Microfone em uso'
          errorMessage = 'O microfone está sendo usado por outro aplicativo. Feche outros aplicativos e tente novamente.'
        }

        this.showMicPermissionToast('error', errorTitle, errorMessage)
        this.micActive = false
      }
    },

    stopMicrophone() {
      if (this.recognition && this.isListening) {
        try {
          this.recognition.stop()
        } catch (e) {}
        this.isListening = false
      }

      if (this.micStream) {
        this.micStream.getTracks().forEach(track => track.stop())
        this.micStream = null
      }

      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }

      this.micActive = false
      this.micLevel = 0
    },

    setupAudioAnalysis() {
      if (!this.micStream) return

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256

      this.microphone = this.audioContext.createMediaStreamSource(this.micStream)
      this.microphone.connect(this.analyser)

      this.analyzeAudio()
    },

    analyzeAudio() {
      if (!this.analyser || !this.micActive) return

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
      this.analyser.getByteFrequencyData(dataArray)

      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      const sensitivity = this.micSensitivity / 100
      this.micLevel = Math.min(100, (average / 255) * 100 * (1 + sensitivity))
      this.pitchPosition = 30 + (average / 255) * 40

        // ✅ NOVO: Pontuação por energia vocal contínua
  if (this.isPlaying && this.withMicrophone && this.micActive) {
    const energyThreshold = 15 // mínimo de energia para considerar "cantando"
    if (average > energyThreshold) {
      // Pontos baseados na intensidade do som (quanto mais forte/melhor, mais pontos)
      const energyScore = (average / 255) * 2 // 0~2 pontos por frame
      this.addScore(energyScore, 'good')
    }
  }

      if (this.micActive) {
        requestAnimationFrame(() => this.analyzeAudio())
      }
    },

    // ===================== SINGING ACCURACY =====================
  checkSingingAccuracy(transcript) {
  if (!this.processedLyrics.length) return

  const match = this.findBestLyricMatch(transcript)
  if (!match) return

  const matchedLine = this.processedLyrics[match.index]
  if (!matchedLine) return

  const predictedTime = this.getEffectiveLyricsTime(false)
  const rawOffset = matchedLine.time - predictedTime
  const maxCorrection = 5

  let newOffset = rawOffset
  if (Math.abs(rawOffset) > maxCorrection) {
    newOffset = this.lyricsSyncOffset + (rawOffset - this.lyricsSyncOffset) * 0.3
  } else {
    newOffset = this.lyricsSyncOffset * 0.7 + rawOffset * 0.3
  }

  this.lyricsSyncOffset = newOffset
  this.currentLineIndex = match.index
  this.lastSpeechSyncAt = Date.now()

  if (matchedLine.sung || matchedLine.isInstrumental) return

  const thresholds = {
    easy: 0.50,
    medium: 0.62,
    hard: 0.72
  }

  const threshold = thresholds[this.currentSong.difficulty] || 0.62
  this.totalAttempts++

  if (match.score >= threshold) {
    matchedLine.sung = true
    matchedLine.correct = true
    matchedLine.wrong = false
    this.combo++

let points = 150
if (match.score >= 0.90) points = 300  // perfect hit
else if (match.score >= 0.80) points = 220
else if (match.score >= 0.70) points = 180

    if (this.currentSong.difficulty === 'hard') {
      points *= 1.5
    }

    this.addScore(points * (1 + this.combo * 0.05), match.score >= 0.90 ? 'perfect' : 'good')
    this.correctAttempts++
  } else {
    matchedLine.sung = true
    matchedLine.correct = false
    matchedLine.wrong = true
    this.combo = 0
    this.addScore(30, 'ok')
  }

  this.accuracyPercent = this.totalAttempts
    ? (this.correctAttempts / this.totalAttempts) * 100
    : 0
},

    normalizeLyricText(text = '') {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s']/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    },

    findBestLyricMatch(transcript) {
      const normalizedTranscript = this.normalizeLyricText(transcript)

      if (!normalizedTranscript || normalizedTranscript.split(' ').length < 2) {
        return null
      }

      let bestMatch = { index: -1, score: 0 }

      let start = 0
      let end = this.processedLyrics.length - 1

      if (this.currentLineIndex > 0 || this.lyricsSyncOffset !== 0) {
        start = Math.max(0, this.currentLineIndex - 4)
        end = Math.min(this.processedLyrics.length - 1, this.currentLineIndex + 6)
      }

      for (let i = start; i <= end; i++) {
        const line = this.processedLyrics[i]
        if (!line || line.isInstrumental) continue

        const score = this.calculateSimilarity(
          normalizedTranscript,
          this.normalizeLyricText(line.text)
        )

        if (score > bestMatch.score) {
          bestMatch = { index: i, score }
        }
      }

      if (bestMatch.score < 0.55) {
        for (let i = 0; i < this.processedLyrics.length; i++) {
          const line = this.processedLyrics[i]
          if (!line || line.isInstrumental) continue

          const score = this.calculateSimilarity(
            normalizedTranscript,
            this.normalizeLyricText(line.text)
          )

          if (score > bestMatch.score) {
            bestMatch = { index: i, score }
          }
        }
      }

      return bestMatch.score >= 0.55 ? bestMatch : null
    },

    calculateSimilarity(str1, str2) {
      const clean1 = str1.toLowerCase().replace(/[^\w\s]/g, '')
      const clean2 = str2.toLowerCase().replace(/[^\w\s]/g, '')

      const words1 = clean1.split(/\s+/)
      const words2 = clean2.split(/\s+/)

      if (words1.length === 0 || words2.length === 0) return 0

      let matches = 0
      const used = new Set()

      words2.forEach(word2 => {
        words1.forEach((word1, idx) => {
          if (!used.has(idx)) {
            const dist = this.levenshteinDistance(word1, word2)
            const maxLen = Math.max(word1.length, word2.length)
            if (dist / maxLen < 0.4) {
              matches++
              used.add(idx)
            }
          }
        })
      })

      return matches / Math.max(words1.length, words2.length)
    },

    levenshteinDistance(str1, str2) {
      const matrix = []
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
      }
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
      }
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1]
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            )
          }
        }
      }
      return matrix[str2.length][str1.length]
    },

// ===================== VOCAL REMOVAL (Karaokê) =====================
updateVocalRemovalIntensity() {
  const intensity = this.vocalRemovalIntensity
 
  if (intensity > 0 && !this.isVocalRemovalSetup) {
    this.setupVocalRemoval()
  } else if (intensity === 0 && this.isVocalRemovalSetup) {
    this.disableVocalRemoval()
  } else if (this.isVocalRemovalSetup && this.vocalRemovalNode) {
    // Atualiza o ganho baseado na intensidade
    const gainValue = intensity / 100  // 0.0 a 1.0
    this.vocalRemovalNode.gain.value = 0.5 + (gainValue * 2.5)  // 0.5 a 3.0
  }
 
  this.saveSettings()
},

setupVocalRemoval() {
  const audio = this.$refs.audioPlayer
  if (!audio) return

  try {
    if (!this.audioContextPlayer) {
      this.audioContextPlayer = new (window.AudioContext || window.webkitAudioContext)()
    }

    if (this.isVocalRemovalSetup && this.vocalRemovalNode) {
      return
    }

    if (!this.audioSourceNode) {
      this.audioSourceNode = this.audioContextPlayer.createMediaElementSource(audio)
    }

    const ctx = this.audioContextPlayer
    const source = this.audioSourceNode
    const intensity = this.vocalRemovalIntensity / 100  // 0.0 a 1.0

    // ==== CADEIA DE REMOÇÃO DE VOZ COM INTENSIDADE VARIÁVEL ====
   
    // 1. Splitter stereo
    const splitter = ctx.createChannelSplitter(2)
   
    // 2. Ganho para canal invertido (fase invertida proporcional à intensidade)
    const invertGain = ctx.createGain()
    invertGain.gain.value = -0.5 - (intensity * 0.5)  // -0.5 a -1.0

    // 3. Merger L - R (cancela o centro onde está a voz)
    const merger = ctx.createChannelMerger(2)

    // 4. NOTCH: corta frequência fundamental da voz (grave)
    const notchLow = ctx.createBiquadFilter()
    notchLow.type = 'notch'
    notchLow.frequency.value = 180
    notchLow.Q.value = 0.3 + (intensity * 0.4)  // Mais largo = mais agressivo

    // 5. NOTCH: corpo da voz (255-500Hz)
    const notchMid1 = ctx.createBiquadFilter()
    notchMid1.type = 'notch'
    notchMid1.frequency.value = 350
    notchMid1.Q.value = 0.4 + (intensity * 0.3)

    // 6. NOTCH: presença vocal (500Hz-2kHz) — ONDE A VOZ MAIS ESTÁ
    const notchMid2 = ctx.createBiquadFilter()
    notchMid2.type = 'notch'
    notchMid2.frequency.value = 1000
    notchMid2.Q.value = 0.5 + (intensity * 0.4)

    // 7. NOTCH: harmônicos agudos da voz (2-4kHz)
    const notchHigh = ctx.createBiquadFilter()
    notchHigh.type = 'notch'
    notchHigh.frequency.value = 3000
    notchHigh.Q.value = 0.6 + (intensity * 0.2)

    // 8. BANDPASS: deixa passar o que NÃO é voz (instrumentos)
    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = 6000 + (intensity * 4000)  // 6kHz a 10kHz
    bandpass.Q.value = 0.4

    // 9. PEAKING: boost em frequências de instrumentos
    const peakBoost = ctx.createBiquadFilter()
    peakBoost.type = 'peaking'
    peakBoost.frequency.value = 8000
    peakBoost.gain.value = intensity * 10  // 0 a 10dB boost
    peakBoost.Q.value = 0.5

    // 10. Compressor para nivelar
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -30
    compressor.knee.value = 20
    compressor.ratio.value = 10 + (intensity * 15)  // 10 a 25
    compressor.attack.value = 0.001
    compressor.release.value = 0.1

    // 11. Ganho final (compensatório baseado na intensidade)
    this.vocalRemovalNode = ctx.createGain()
    this.vocalRemovalNode.gain.value = 0.8 + (intensity * 2.2)  // 0.8 a 3.0

    // === CONEXÕES ===
    source.connect(splitter)
   
    splitter.connect(merger, 0, 0)      // L → L
    splitter.connect(invertGain, 1)      // R → invert
    invertGain.connect(merger, 0, 1)     // -R → R

    // Cadeia de filtros
    merger.connect(notchLow)
    notchLow.connect(notchMid1)
    notchMid1.connect(notchMid2)
    notchMid2.connect(notchHigh)
    notchHigh.connect(bandpass)
    bandpass.connect(peakBoost)
    peakBoost.connect(compressor)
    compressor.connect(this.vocalRemovalNode)
    this.vocalRemovalNode.connect(ctx.destination)

    this.isVocalRemovalSetup = true

    this.showMicPermissionToast(
      'success',
      'Modo Karaokê ATIVADO',
      `Redução de voz em ${this.vocalRemovalIntensity}% — cante por cima!`
    )
  } catch (error) {
    console.error('Erro ao configurar vocal removal:', error)
    this.vocalRemovalIntensity = 0
    this.showMicPermissionToast(
      'warning',
      'Não foi possível ativar',
      'Seu navegador não suporta processamento de áudio avançado.'
    )
  }
},

disableVocalRemoval() {
  if (this.audioSourceNode && this.audioContextPlayer) {
    try {
      this.audioSourceNode.disconnect()
      this.audioSourceNode.connect(this.audioContextPlayer.destination)
     
      this.isVocalRemovalSetup = false
      this.vocalRemovalNode = null
    } catch (e) {
      console.warn('Erro ao desativar vocal removal:', e)
    }
  }

  this.showMicPermissionToast(
    'success',
    'Modo normal restaurado',
    'A música voltou ao original.'
  )
},

    // ===================== SETTINGS =====================
   loadSettings() {
  const saved = localStorage.getItem('karaokeSettings')
  if (!saved) return

  try {
    const settings = JSON.parse(saved)

    this.displayMode = settings.displayMode ?? 'standard'
    this.fontSize = Number(settings.fontSize ?? 28)

    this.showPhonetic =
      typeof settings.showPhonetic === 'boolean'
        ? settings.showPhonetic
        : false

    this.visualFeedback =
      typeof settings.visualFeedback === 'boolean'
        ? settings.visualFeedback
        : true

    this.autoScroll =
      typeof settings.autoScroll === 'boolean'
        ? settings.autoScroll
        : true

    this.micSensitivity = Number(settings.micSensitivity ?? 70)
    this.selectedDifficulty = settings.selectedDifficulty ?? 'medium'
    this.playbackRate = Number(settings.playbackRate ?? 1)
    this.vocalRemovalIntensity = Number(settings.vocalRemovalIntensity ?? 0)

  } catch (e) {
    console.error('Erro ao carregar configurações:', e)
  }
},

    saveSettings() {
      const settings = {
        displayMode: this.displayMode,
        fontSize: this.fontSize,
        showPhonetic: this.showPhonetic,
        visualFeedback: this.visualFeedback,
        autoScroll: this.autoScroll,
        micSensitivity: this.micSensitivity,
        selectedDifficulty: this.selectedDifficulty,
        vocalRemovalIntensity: this.vocalRemovalIntensity
      }
      localStorage.setItem('karaokeSettings', JSON.stringify(settings))
    },

setDisplayMode(mode) {
  this.displayMode = mode
  this.saveSettings()
 
  // ✅ NOVO: Aplica classes CSS específicas para cada modo
  const container = this.$el
  if (container) {
    container.classList.remove('standard', 'minimal', 'party')
    container.classList.add(mode)
  }
},

    toggleSettings() {
      this.showSettings = !this.showSettings
      if (!this.showSettings) this.saveSettings()
    },

    // ===================== RECORDING =====================
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording()
      } else {
        this.startRecording()
      }
    },

    startRecording() {
      if (!this.micStream) {
        this.showMicPermissionToast(
          'warning',
          'Microfone necessário',
          'Ative o microfone primeiro antes de começar a gravar.'
        )
        return
      }

      this.recordedChunks = []
      this.mediaRecorder = new MediaRecorder(this.micStream)

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data)
      }

      this.mediaRecorder.start()
      this.isRecording = true
      this.recordingTime = 0

      this.recordingInterval = setInterval(() => {
        this.recordingTime++
      }, 1000)
    },

    stopRecording() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop()
        this.isRecording = false
        clearInterval(this.recordingInterval)

        setTimeout(() => {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `karaoke-${Date.now()}.webm`
          a.click()
        }, 100)
      }
    },

    // ===================== UI / MISC =====================
    showMicPermissionToast(type, title, message, duration = 5000) {
      if (this.micPermissionToast.timer) {
        clearTimeout(this.micPermissionToast.timer)
      }
      this.micPermissionToast = {
        show: true,
        type,
        title,
        message,
        timer: setTimeout(() => {
          this.hideMicPermissionToast()
        }, duration)
      }
    },

    hideMicPermissionToast() {
      if (this.micPermissionToast.timer) {
        clearTimeout(this.micPermissionToast.timer)
      }
      this.micPermissionToast.show = false
    },

    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
      if (this.isFullscreen) {
        document.documentElement.requestFullscreen?.()
      } else {
        document.exitFullscreen?.()
      }
    },

    changePitch(delta) {
      this.pitchShift = Math.max(-5, Math.min(5, this.pitchShift + delta))
    },

     // ===================== UI / MISC =====================
    showMicPermissionToast(type, title, message, duration = 5000) {
      if (this.micPermissionToast.timer) {
        clearTimeout(this.micPermissionToast.timer)
      }
      this.micPermissionToast = {
        show: true,
        type,
        title,
        message,
        timer: setTimeout(() => {
          this.hideMicPermissionToast()
        }, duration)
      }
    },

    hideMicPermissionToast() {
      if (this.micPermissionToast.timer) {
        clearTimeout(this.micPermissionToast.timer)
      }
      this.micPermissionToast.show = false
    },

    // ============ MODAL DE CONFIRMAÇÃO DE SAÍDA ============
    confirmExitKaraoke() {
      // Se não está tocando ou não tem score, sai direto
      if (this.showSongSelection || (!this.isPlaying && this.currentScore === 0)) {
        this.doExitKaraoke()
        return
      }

      // Abre o modal de confirmação
      this.showExitConfirmModal = true

      // Pausa a música enquanto o modal está aberto
      if (this.isPlaying) {
        this.wasPlayingBeforeConfirm = true
        this.togglePlay()
      } else {
        this.wasPlayingBeforeConfirm = false
      }
    },

    doExitKaraoke() {
      // Salva no histórico se tiver score
      if (this.withMicrophone && this.currentScore > 0) {
        this.saveGameToHistory()
      }

      this.showExitConfirmModal = false
      this.showSongSelection = true
      this.stopPlayback()
      this.stopMicrophone()
    },

    cancelExitKaraoke() {
      this.showExitConfirmModal = false

      // Retoma a música se estava tocando
      if (this.wasPlayingBeforeConfirm && !this.isPlaying) {
        this.togglePlay()
      }
    },

    goBack() {
      this.confirmExitKaraoke()
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    initAudio() {
      this.$nextTick(() => {
        this.initAudioVisualizer()
        this.initBackgroundVisualizer()
      })
    },

    // ============ ADICIONAR ============
async initSpotifyPlayer() {
  // Só inicializa se estiver logado com Spotify
  const spotifyToken = localStorage.getItem('spotify_access_token')
  if (!spotifyToken) return

  this.spotifyToken = spotifyToken

  // Carrega o SDK do Spotify
  if (!window.Spotify) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  this.spotifyPlayer = new window.Spotify.Player({
    name: 'SoundUp Karaokê',
    getOAuthToken: cb => cb(this.spotifyToken),
    volume: this.volume / 100
  })

  this.spotifyPlayer.addListener('ready', ({ device_id }) => {
    console.log('[SPOTIFY] Player pronto:', device_id)
    this.spotifyDeviceId = device_id
    this.isSpotifyPremium = true
  })

  this.spotifyPlayer.addListener('not_ready', ({ device_id }) => {
    console.log('[SPOTIFY] Device offline:', device_id)
    this.isSpotifyPremium = false
  })

  this.spotifyPlayer.addListener('player_state_changed', (state) => {
    if (!state) return
    this.isPlaying = !state.paused
    this.currentTime = state.position / 1000
    this.duration = state.duration / 1000
    this.progressPercent = (this.currentTime / this.duration) * 100
  })

  this.spotifyPlayer.addListener('initialization_error', ({ message }) => {
    console.error('[SPOTIFY] Init error:', message)
    this.isSpotifyPremium = false
  })

  this.spotifyPlayer.addListener('authentication_error', ({ message }) => {
    console.error('[SPOTIFY] Auth error:', message)
    this.isSpotifyPremium = false
    // Token expirado, tenta refresh
    this.refreshSpotifyToken()
  })

  this.spotifyPlayer.addListener('account_error', ({ message }) => {
    console.error('[SPOTIFY] Account error:', message)
    this.isSpotifyPremium = false
    this.showMicPermissionToast(
      'warning',
      'Spotify Premium necessário',
      'Para tocar músicas completas, você precisa de uma conta Spotify Premium.'
    )
  })

  await this.spotifyPlayer.connect()
},

async refreshSpotifyToken() {
  try {
    const res = await fetch(`${this.API_BASE}/spotify/refresh-token`, {
      headers: this.getAuthHeaders()
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('spotify_access_token', data.access_token)
      this.spotifyToken = data.access_token
      // Reconecta o player
      await this.initSpotifyPlayer()
    }
  } catch (e) {
    console.error('Erro ao refresh token Spotify:', e)
  }
},

    initAudioVisualizer() {
      const canvas = this.$refs.audioCanvas
      if (!canvas) return
      canvas.width = canvas.offsetWidth || 800
      canvas.height = canvas.offsetHeight || 100
    },

    initBackgroundVisualizer() {
      const canvas = this.$refs.bgCanvas
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    },

    handleKeydown(e) {
      if (e.code === 'Space') {
        if (this.showSongSelection) return
        e.preventDefault()
        this.togglePlay()
      } else if (e.code === 'ArrowLeft') {
        if (this.showSongSelection) return
        this.skipBackward()
      } else if (e.code === 'ArrowRight') {
        if (this.showSongSelection) return
        this.skipForward()
      } else if (e.code === 'KeyF') {
        if (this.showSongSelection) return
        this.toggleFullscreen()
      } else if (e.code === 'KeyM' && this.withMicrophone) {
        if (this.showSongSelection) return
        this.toggleMic()
      }
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.karaoke-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ============ TOAST DE PERMISSÃO DO MICROFONE ============ */

.mic-permission-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.mic-permission-toast.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
  border-color: rgba(239, 68, 68, 0.3);
}

.mic-permission-toast.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
  border-color: rgba(245, 158, 11, 0.3);
}

.mic-permission-toast.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
  border-color: rgba(34, 197, 94, 0.3);
}

.toast-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mic-permission-toast.error .toast-icon {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.mic-permission-toast.warning .toast-icon {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.mic-permission-toast.success .toast-icon {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #fff;
}

.toast-message {
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
}

.toast-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

@keyframes toastSlideIn {
  from {
    transform: translateX(120%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active {
  animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

/* ============ SONG SELECTION SCREEN ============ */

.song-selection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.selection-content {
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
}

.selection-content h1 {
  text-align: center;
  font-size: 48px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ff006e, #8338ec);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.selection-content .subtitle {
  text-align: center;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
}

/* ============ MODO DE JOGO ============ */

.mode-selection {
  background: linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(131, 56, 236, 0.1));
  border-radius: 20px;
  padding: 28px;
  border: 2px solid rgba(255, 0, 110, 0.3);
  margin-bottom: 32px;
}

.mode-selection h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 20px;
  color: #fff;
  font-weight: 700;
}

.mode-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.mode-buttons button {
  flex: 1;
  max-width: 280px;
  padding: 20px 28px;
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.mode-buttons button:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.mode-buttons button.active {
  background: linear-gradient(135deg, #ff006e, #8338ec);
  border-color: transparent;
  box-shadow: 0 8px 32px rgba(255, 0, 110, 0.5);
  transform: scale(1.02);
}

.mode-hint {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* ============ DIFFICULTY FILTER ============ */

.difficulty-filter {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.difficulty-filter button {
  padding: 10px 24px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.difficulty-filter button:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.1);
}

.difficulty-filter button.active {
  background: linear-gradient(135deg, #ff006e, #8338ec);
  border-color: transparent;
  box-shadow: 0 0 20px rgba(255, 0, 110, 0.4);
}
/* ============ FULLSCREEN ALBUM TOP ============ */
.fullscreen-album {
  display: none;
}

.karaoke-container.fullscreen .fullscreen-album {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
 padding: 0;
  margin-bottom: -40px;
  z-index: 10;
  position: relative;
}

.fullscreen-album .album-art-mini {
  width: 60px; /* ✅ Menor ainda */
  height: 60px;
  margin-bottom: 2px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  position: relative;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}

.karaoke-container.fullscreen .fullscreen-album .vinyl-ring-mini {
  width: 32px;
  height: 32px;
}

.karaoke-container.fullscreen .fullscreen-album .vinyl-center-mini {
  width: 12px;
  height: 12px;
}

.karaoke-container.fullscreen .fullscreen-song-info h3 {
  font-size: 14px;
}

.karaoke-container.fullscreen .fullscreen-song-info p {
  font-size: 11px;
}

.fullscreen-album .vinyl-ring-mini {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
 width: 42px;
  height: 42px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
}

.fullscreen-album .vinyl-ring-mini.spinning {
  animation: spin 2s linear infinite;
}

.fullscreen-album .vinyl-center-mini {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
width: 16px;
  height: 16px;
  background: #1a1a2e;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.5);
}

.fullscreen-album .fullscreen-song-info {
  text-align: center;
}

.fullscreen-album .fullscreen-song-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.fullscreen-album .fullscreen-song-info p {
  margin: 2px 0 0;
  font-size: 12px;
  opacity: 0.7;
}

.karaoke-container.fullscreen .karaoke-stage {
  grid-template-columns: 1fr;
  align-items: stretch;
  padding: 0;
  gap: 0;
  height: 100vh;
  min-height: 0;
}

.karaoke-container.fullscreen .lyrics-section {
 height: calc(100vh - 180px);
  margin-top: 0;
  padding-top: 40px;   /* Espaço pro header flutuante */
  justify-content: flex-start; /* Começa do topo, mas scrolla */
 padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  mask-image: linear-gradient(to bottom, black 0%, black 95%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 95%, transparent 100%);
}

/* ============ SEARCH ============ */

.search-wrapper-selection {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.search-wrapper-selection:focus-within {
  background: rgba(255, 255, 255, 0.15);
  border-color: #1DB954;
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.3);
}

.search-wrapper-selection .search-icon {
  width: 20px;
  height: 20px;
  color: #888;
  flex-shrink: 0;
}

.search-wrapper-selection input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: white;
  font-size: 15px;
}

.search-wrapper-selection input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-search-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.confirm-modal .confirm-content {
  text-align: center;
  padding: 40px 32px;
  max-width: 400px;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 28px;
}

.confirm-icon.warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  color: #f59e0b;
  border: 2px solid rgba(245, 158, 11, 0.3);
}

.confirm-content h3 {
  margin: 0 0 12px;
  font-size: 22px;
  font-weight: 700;
}

.confirm-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 28px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-confirm-delete {
  flex: 1;
  padding: 14px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-confirm-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
}

.btn-confirm-delete:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}
.clear-search-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

/* ============ RESULTS COUNT ============ */

.results-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.show-more-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

/* ============ LOAD MORE BUTTON ============ */

.load-more-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-bottom: 20px;
}

.btn-load-more {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-load-more:hover {
  background: linear-gradient(135deg, #ff006e, #8338ec);
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 0, 110, 0.4);
}

/* ============ SONGS GRID ============ */

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.loading-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 16px;
  color: rgba(255,255,255,0.7);
}

.song-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.song-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.song-cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.song-card-info {
  padding: 12px;
}

.song-card-info h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-card-info p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.difficulty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  min-width: 60px;
  white-space: nowrap;
  line-height: 1;
}

.difficulty-badge.easy { background: #22c55e; color: #000; }
.difficulty-badge.medium { background: #f59e0b; color: #000; }
.difficulty-badge.hard { background: #ef4444; color: #fff; }
/* ============ NO RESULTS ============ */

.no-results {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  text-align: center;
}

.no-results-icon {
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.no-results-text {
  text-align: left;
}

.no-results-text p {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.no-results-text small {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
}

/* ============ EMPTY STATE ============ */

.empty-state {
  flex-direction: column;
  gap: 24px;
  padding: 50px 20px;
}

.empty-illustration {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-illustration .music-icon {
  color: rgba(255, 0, 110, 0.6);
  animation: float 3s ease-in-out infinite;
}

.sound-waves {
  position: absolute;
  display: flex;
  gap: 4px;
  align-items: center;
  bottom: -20px;
}

.sound-waves span {
  display: block;
  width: 4px;
  background: linear-gradient(to top, #ff006e, #8338ec);
  border-radius: 2px;
  animation: soundWave 1.2s ease-in-out infinite;
}

.sound-waves span:nth-child(1) { height: 12px; animation-delay: 0s; }
.sound-waves span:nth-child(2) { height: 20px; animation-delay: 0.15s; }
.sound-waves span:nth-child(3) { height: 16px; animation-delay: 0.3s; }
.sound-waves span:nth-child(4) { height: 24px; animation-delay: 0.45s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes soundWave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
}

/* ============ MAIN CONTAINER ============ */

.karaoke-container.minimal .album-section,
.karaoke-container.minimal .score-section {
  display: none;
}

.karaoke-container.minimal .karaoke-stage {
  grid-template-columns: 1fr;
}

.karaoke-container.party .visualizer-bg {
  animation: partyBg 10s infinite;
}

@keyframes partyBg {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(180deg); }
}

/* ============ VISUALIZER ============ */

.visualizer-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.visualizer-bg canvas {
  width: 100%;
  height: 100%;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%);
}

/* ============ HEADER ============ */

.karaoke-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
  gap: 20px;
}

.btn-icon {
  background: rgba(255,255,255,0.1);
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.btn-icon:hover {
  background: rgba(255,255,255,0.2);
  transform: scale(1.1);
}

.btn-icon.active {
  background: #1DB954;
  color: white;
  animation: pulse 2s infinite;
}

.song-info-mini {
  text-align: center;
  flex: 1;
  min-width: 0;
  max-width: 400px;
  margin: 0 auto;
}

.song-info-mini h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.song-info-mini p {
  margin: 4px 0 0;
  font-size: 14px;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.live-badge {
  display: inline-block;
  background: #ff006e;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.live-badge.recording {
  background: #ef4444;
  animation: blink 1s infinite;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* ============ STAGE ============ */

.karaoke-stage {
  position: relative;
  z-index: 5;
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr 280px;
  gap: 40px;
  padding: 20px 40px;
  align-items: center;
}

.album-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.5s ease;
  gap: 16px;
}

.album-section.hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-100%);
}

.album-art {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  flex-shrink: 0;
}

.vinyl-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.vinyl-ring.spinning {
  animation: spin 2s linear infinite;
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: #1a1a2e;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.5);
}

.difficulty-badge-large {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(10px);
}

.difficulty-badge-large.easy { background: #22c55e; color: #000; }
.difficulty-badge-large.medium { background: #f59e0b; color: #000; }
.difficulty-badge-large.hard { background: #ef4444; }

.song-meta {
  text-align: center;
  width: 100%;
}

.song-meta h2 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.song-meta p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.song-stats {
  display: flex;
  gap: 24px;
  justify-content: center;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: 800;
  color: #1DB954;
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badges {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 4px;
}

.badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(255,255,255,0.1);
}

.badge.difficulty.easy { background: #22c55e; color: #000; }
.badge.difficulty.medium { background: #f59e0b; color: #000; }
.badge.difficulty.hard { background: #ef4444; }

/* ============ LYRICS ============ */

.lyrics-section {
  position: relative;
  height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  padding-top: 8px;
  mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
}

.lyrics-wrapper {
  padding: 12px 0 80px;
}

.karaoke-container.fullscreen .lyrics-wrapper {
  padding-top: 0;
  padding-bottom: 60px;  /* Menos espaço embaixo */
}

.karaoke-container.fullscreen .lyric-line {
  min-height: auto;     /* Remove altura mínima fixa */
  padding: 6px 20px;    /* Menos padding vertical */
  margin: 2px 0;        /* Espaço entre linhas */
}

.karaoke-container.fullscreen .lyric-text {
  font-size: 32px !important;  /* MAIOR — era 22px */
  line-height: 1.3;
}

/* ✅ Linha de progresso (indicador) mais ao topo */
.karaoke-container.fullscreen .progress-line {
  top: 12%;
}

.karaoke-container.fullscreen .karaoke-header {
  padding: 2px 20px;
  min-height: 36px;  /* Header bem compacto */
  background: transparent;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
}


/* ============ VOCAL REMOVAL TOGGLE ============ */

.setting-item.checkbox.vocal-remover {
  background: linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(131, 56, 236, 0.1));
  border: 2px solid rgba(255, 0, 110, 0.25);
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 8px;
}

.setting-item.checkbox.vocal-remover label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
}

.setting-item.checkbox.vocal-remover label i {
  color: #ff006e;
  font-size: 16px;
}

.vocal-hint {
  display: block;
  margin: -16px 0 16px 0;
  padding: 8px 14px;
  background: rgba(34, 197, 94, 0.1);
  border-left: 3px solid #22c55e;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  line-height: 1.4;
}

.lyrics-loading, .lyrics-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: rgba(255,255,255,0.7);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #1DB954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.lyrics-error button {
  padding: 10px 20px;
  background: #1DB954;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.lyric-line {
  text-align: center;
  padding: 16px 20px;
  position: relative;
  opacity: 0.25;
  transform: scale(0.92);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ✅ NOVO: Container que empilha texto + fonética verticalmente */
.lyric-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px; /* espaço entre frase e pronúncia */
  width: 100%;
}

.lyric-text {
  display: block;
  font-weight: 700;
  line-height: 1.4;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ✅ AJUSTADO: phonetic agora é block dentro da coluna */
.lyric-phonetic {
  display: block;
  font-size: 14px;
  opacity: 0.7;
  font-style: italic;
  color: #a5b4fc;
  width: 100%;
  text-align: center;
  line-height: 1.3;
  margin-top: 2px;
}

/* ADICIONE para fullscreen: */
.karaoke-container.fullscreen .lyric-phonetic {
  font-size: 18px !important;  /* Era 14px */
  margin-top: 4px;
  opacity: 0.85;
  width: 100%;
  text-align: center;
}

.karaoke-container.fullscreen .lyric-line.active .lyric-text {
  font-size: 38px !important;  /* Destaque na linha ativa */
}

.karaoke-container.fullscreen .lyric-content {
  gap: 8px;
}

.lyric-line.active {
  opacity: 1;
  transform: scale(1.08);
  font-weight: 800;
}

.lyric-line.past {
  opacity: 0.4;
}

.lyric-line.future {
  opacity: 0.15;
}

.lyric-line.instrumental {
  opacity: 0.4;
}

.instrumental-indicator {
  font-size: 24px;
  opacity: 0.5;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lyric-line.active .lyric-text {
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: glow 2s ease-in-out infinite;
}

.lyric-line.correct .lyric-text {
  color: #1DB954;
  text-shadow: 0 0 20px rgba(29, 185, 84, 0.5);
}

.lyric-line.wrong .lyric-text {
  color: #e74c3c;
  text-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
}

.progress-line {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,0,110,0.5), transparent);
  pointer-events: none;
}

.feedback-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  animation: popIn 0.3s ease;
}

.feedback-icon.correct {
  color: #1DB954;
}

.feedback-icon.wrong {
  color: #e74c3c;
}

/* ============ SCORE ============ */

.score-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.5s ease;
}

.score-section.hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateX(100%);
}

.score-card {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 12px;
  letter-spacing: 1px;
  opacity: 0.7;
}

.combo {
  text-align: right;
}

.combo-count {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #ff006e;
  animation: bounce 0.5s ease;
}

.combo-label {
  font-size: 10px;
  opacity: 0.8;
}

.score-value {
  font-size: 56px;
  font-weight: 800;
  text-align: center;
  margin: 16px 0;
  background: linear-gradient(135deg, #fff 0%, #ff006e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: transform 0.3s ease;
}

.score-value.perfect {
  animation: scorePop 0.3s ease;
  color: #fbbf24;
}

.score-value.good {
  animation: scorePop 0.3s ease;
  color: #22c55e;
}

.score-bar {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 16px;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff006e, #8338ec);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 24px;
  color: rgba(255,255,255,0.2);
}

.rating-stars .filled {
  color: #fbbf24;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.accuracy-panel {
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px;
  margin-top: 10px;
}

.accuracy-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.accuracy-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.accuracy-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.pitch-visualizer {
  position: relative;
  height: 120px;
  background: rgba(0,0,0,0.3);
  border-radius: 16px;
  overflow: hidden;
}

.pitch-visualizer canvas {
  width: 100%;
  height: 100%;
}

.pitch-guide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.target-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(255,255,255,0.3);
  top: 50%;
}

.your-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px;
  background: #ff006e;
  border-radius: 2px;
  box-shadow: 0 0 10px #ff006e;
  transition: bottom 0.1s ease;
}

.mic-level {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  opacity: 0.7;
}

.mic-level .active {
  color: #1DB954;
  font-weight: bold;
}

.level-bar {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
}

.level-fill {
  width: 100%;
  border-radius: 4px;
  transition: height 0.1s ease;
}

.recognized-text {
  margin-top: 10px;
  padding: 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  font-size: 11px;
  color: #888;
}

/* ============ AUDIO VISUALIZER ============ */

.audio-visualizer {
  position: fixed;
  bottom: 100px;
  left: 0;
  width: 100%;
  height: 60px;
  z-index: 2;
  opacity: 0.4;
  pointer-events: none;
}

.audio-visualizer canvas {
  width: 100%;
  height: 100%;
}

/* ============ CONTROLS ============ */

.karaoke-controls {
  position: relative;
  z-index: 10;
  padding: 24px 40px;
  background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7));
  backdrop-filter: blur(20px);
}

.controls-main {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
  margin-bottom: 24px;
}

.btn-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.btn-control:hover {
  opacity: 1;
  transform: scale(1.1);
}

.btn-control span {
  font-size: 10px;
  letter-spacing: 1px;
}

.btn-play {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(255,0,110,0.4);
  transition: all 0.3s ease;
}

.btn-play:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(255,0,110,0.6);
}

.btn-play.playing {
  animation: pulse 2s infinite;
}

.controls-secondary {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.volume-control,
.pitch-control,
.tempo-control {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  opacity: 0.8;
}

.volume-slider,
.tempo-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb,
.tempo-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.pitch-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 4px;
}

.pitch-buttons button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.1);
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.pitch-buttons button:hover {
  background: rgba(255,255,255,0.2);
}

.pitch-value {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}

.tempo-value {
  min-width: 36px;
  text-align: center;
}

.btn-record {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 24px;
  border: 2px solid #ef4444;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-record:hover {
  background: rgba(239, 68, 68, 0.1);
}

.btn-record.recording {
  background: #ef4444;
  color: #fff;
  animation: pulse 1s infinite;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time {
  font-size: 12px;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff006e, #8338ec);
  border-radius: 3px;
  position: relative;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

.lyric-marker {
  position: absolute;
  top: -2px;
  width: 4px;
  height: 10px;
  background: rgba(255,255,255,0.5);
  border-radius: 2px;
  transform: translateX(-50%);
}

/* ============ SETTINGS ============ */

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 480px;
  border: 1px solid rgba(255,255,255,0.1);
}

.settings-content h3 {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 700;
}

.setting-item {
  margin-bottom: 24px;
}

.setting-item label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  opacity: 0.8;
}

.setting-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.setting-options button {
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.setting-options button.active {
  background: linear-gradient(135deg, #ff006e, #8338ec);
  border-color: transparent;
}

.setting-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  outline: none;
  margin-top: 10px;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1DB954;
  cursor: pointer;
}

.setting-item.checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
}

.setting-item.checkbox label {
  margin: 0;
  cursor: pointer;
  user-select: none;
  opacity: 1;
}

.setting-item.checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #1DB954;
  cursor: pointer;
  flex-shrink: 0;
}

.btn-close {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: rgba(255,255,255,0.1);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(255,255,255,0.2);
}

/* ============ HISTORY BUTTON ============ */
/* ✅ ADICIONAR DEPOIS de .btn-close */

.btn-history {
  width: 100%;
  padding: 14px 20px;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(135deg, rgba(255, 0, 110, 0.15), rgba(131, 56, 236, 0.15));
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  backdrop-filter: blur(10px);
  margin-bottom: 8px;
}

.btn-history:hover {
  background: linear-gradient(135deg, rgba(255, 0, 110, 0.3), rgba(131, 56, 236, 0.3));
  border-color: rgba(255, 0, 110, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 0, 110, 0.2);
}

.btn-history svg {
  flex-shrink: 0;
}

/* ============ HISTORY MODAL ============ */

.history-content {
  max-width: 560px;
  max-height: 80vh;
  overflow-y: auto;
}

.history-content h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 24px;
  font-size: 22px;
  font-weight: 700;
}

.history-content h3 svg {
  color: #ff006e;
}

.history-empty {
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
}

.history-empty p {
  font-size: 16px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.7);
}

.history-empty small {
  font-size: 13px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.history-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.history-song {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.history-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.1);
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.history-info strong {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-info span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.history-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.history-stat .stat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
}

.history-stat .stat-value {
  font-size: 16px;
  font-weight: 700;
}

.history-stat .stat-value.excellent {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
}

.history-stat .stat-value.good {
  color: #22c55e;
}

.history-stat .stat-value.average {
  color: #f59e0b;
}

.history-stat .stat-value.low {
  color: #ef4444;
}

.history-stat .stat-value.yes {
  color: #22c55e;
}

.history-stat .stat-value.no {
  color: rgba(255, 255, 255, 0.4);
}

.history-date {
  text-align: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.history-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-clear-history {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear-history:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* ============ ANIMATIONS ============ */

@keyframes spin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes scorePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes popIn {
  0% { transform: translateY(-50%) scale(0); }
  80% { transform: translateY(-50%) scale(1.2); }
  100% { transform: translateY(-50%) scale(1); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.karaoke-container.fullscreen .song-info-mini h3 {
  font-size: 22px;  /* ✅ Ligeiramente maior para destaque */
}

/* ============ PARTY MODE ============ */
.karaoke-container.party {
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%);
  animation: partyBg 8s infinite alternate;
}

.karaoke-container.party .lyric-line.active .lyric-text {
  background: linear-gradient(135deg, #ff006e, #ffeb3b, #00e676);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: glow 1s ease-in-out infinite, partyPulse 2s infinite;
}

.karaoke-container.party .visualizer-bg {
  opacity: 0.8;
  animation: partyBg 5s infinite;
}

@keyframes partyPulse {
  0%, 100% { transform: scale(1.08); }
  50% { transform: scale(1.15); }
}

/* ============ MINIMAL MODE ============ */
.karaoke-container.minimal .album-section,
.karaoke-container.minimal .score-section {
  display: none !important;
}

.karaoke-container.minimal .karaoke-stage {
  grid-template-columns: 1fr !important;
}

.karaoke-container.minimal .lyrics-section {
  height: 70vh;
}

/* ============ RESPONSIVE ============ */

@media (max-width: 1200px) {
  .karaoke-stage {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .karaoke-header {
    padding: 16px 20px;
  }

  .karaoke-stage {
    padding: 16px 20px;
    gap: 16px;
  }

  .karaoke-controls {
    padding: 16px 20px;
  }

  .controls-secondary {
    gap: 20px;
  }

  .album-section {
    display: none;
  }

  .score-section {
    display: none;
  }

  .karaoke-stage {
    grid-template-columns: 1fr;
  }

  .selection-content {
    padding: 20px;
  }

  .songs-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .mic-permission-toast {
    left: 16px;
    right: 16px;
    max-width: none;
  }

  .mode-buttons {
    flex-direction: column;
    align-items: center;
  }

  .mode-buttons button {
    max-width: 100%;
    width: 100%;
  }

  .no-results {
    flex-direction: column;
  }

  .no-results-text {
    text-align: center;
  }

  .empty-state {
    padding: 40px 20px;
  }

  .results-count {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
}

/* ============ MODAL DE CONFIRMAÇÃO DE SAÍDA ============ */

.exit-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.exit-confirm-content {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px 36px 32px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  animation: exitConfirmPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes exitConfirmPop {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.exit-confirm-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 0, 110, 0.2), rgba(131, 56, 236, 0.2));
  border: 2px solid rgba(255, 0, 110, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 28px;
  color: #ff006e;
  animation: exitIconBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

@keyframes exitIconBounce {
  0% { transform: scale(0); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.exit-confirm-content h3 {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.3px;
}

.exit-confirm-text {
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
}

.exit-confirm-text strong {
  color: #ff006e;
  font-weight: 700;
}

.exit-confirm-actions {
  display: flex;
  gap: 12px;
}

.exit-confirm-actions button {
  flex: 1;
  padding: 14px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  white-space: nowrap;
}

.btn-exit-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}

.btn-exit-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
}

.btn-exit-cancel i {
  color: #22c55e;
}

.btn-exit-confirm {
  background: linear-gradient(135deg, #ff006e, #8338ec);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255, 0, 110, 0.3);
}

.btn-exit-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 0, 110, 0.5);
  background: linear-gradient(135deg, #e6005c, #752fd1);
}

.btn-exit-confirm i {
  opacity: 0.9;
}

/* Animação de saída do modal */
.exit-confirm-modal.fade-leave-active .exit-confirm-content {
  animation: exitConfirmFadeOut 0.3s ease forwards;
}

@keyframes exitConfirmFadeOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .exit-confirm-content {
    padding: 32px 24px 24px;
    border-radius: 20px;
  }

  .exit-confirm-icon {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }

  .exit-confirm-content h3 {
    font-size: 20px;
  }

  .exit-confirm-text {
    font-size: 14px;
  }

  .exit-confirm-actions {
    flex-direction: column;
  }

  .exit-confirm-actions button {
    width: 100%;
  }
}
/* ============ VOCAL REMOVAL SLIDER ============ */

.setting-item.vocal-remover-slider {
  background: linear-gradient(135deg, rgba(255, 0, 110, 0.08), rgba(131, 56, 236, 0.08));
  border: 2px solid rgba(255, 0, 110, 0.15);
  border-radius: 16px;
  padding: 18px 20px;
  margin-top: 8px;
  transition: all 0.3s ease;
}

.setting-item.vocal-remover-slider:hover {
  border-color: rgba(255, 0, 110, 0.3);
  background: linear-gradient(135deg, rgba(255, 0, 110, 0.12), rgba(131, 56, 236, 0.12));
}

.setting-item.vocal-remover-slider label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 14px;
}

.setting-item.vocal-remover-slider label i {
  color: #ff006e;
  font-size: 16px;
}

.vocal-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vocal-hint {
  display: block;
  margin-top: 10px;
  padding: 8px 14px;
  background: rgba(34, 197, 94, 0.08);
  border-left: 3px solid #22c55e;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.vocal-hint.strong {
  background: linear-gradient(135deg, rgba(255, 0, 110, 0.15), rgba(131, 56, 236, 0.15));
  border-left-color: #ff006e;
  color: rgba(255, 255, 255, 0.9);
}

.vocal-hint i {
  margin-right: 6px;
  color: #22c55e;
}

.vocal-hint.strong i {
  color: #ff006e;
}

/* Slider estilizado para vocal removal */
.setting-item.vocal-remover-slider .setting-slider {
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg,
    rgba(255,255,255,0.15) 0%,
    rgba(255, 0, 110, 0.4) 50%,
    rgba(131, 56, 236, 0.6) 100%
  );
}

.setting-item.vocal-remover-slider .setting-slider::-webkit-slider-thumb {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #ff006e, #8338ec);
  box-shadow: 0 2px 12px rgba(255, 0, 110, 0.5);
}
</style>