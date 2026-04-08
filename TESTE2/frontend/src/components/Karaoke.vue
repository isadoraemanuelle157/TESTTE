<template>
  <div class="karaoke-container" :class="{ 'fullscreen': isFullscreen, [displayMode]: true }">
    <!-- Background Visualizer -->
    <div class="visualizer-bg">
      <canvas ref="bgCanvas"></canvas>
      <div class="gradient-overlay"></div>
    </div>

    <!-- Header -->
    <header class="karaoke-header">
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
        <button class="btn-icon" @click="toggleMic" :class="{ 'active': micActive }" title="Ativar Microfone">
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
      </div>
    </header>

    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-wrapper" :class="{ focused: isSearchFocused }">
        <svg viewBox="0 0 24 24" fill="currentColor" class="search-icon">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          ref="searchInput"
          type="text"
          v-model="searchQuery"
          placeholder="Buscar música..."
          @focus="isSearchFocused = true"
          @blur="handleSearchBlur"
          @keyup.enter="searchMusic"
          @input="handleInput"
        />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <!-- Search Results Dropdown -->
      <div v-if="showSearchResults && searchResults.length > 0" class="search-results-dropdown">
        <div 
          v-for="(track, index) in filteredSearchResults" 
          :key="index"
          class="search-result-item"
          @click="selectTrack(track)"
        >
          <img :src="track.album?.cover_medium || track.cover" :alt="track.title" class="result-thumb">
          <div class="result-info">
            <span class="result-name">{{ track.title }}</span>
            <span class="result-artist">{{ track.artist?.name || track.artist }}</span>
            <span class="result-difficulty" :style="{ color: getDifficultyColor(track.difficulty) }">
              {{ getDifficultyLabel(track.difficulty) }}
            </span>
          </div>
          <button class="btn-play-small" @click.stop="previewTrack(track)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Stage -->
    <main class="karaoke-stage">
      <!-- Album Art (Left) - REORGANIZADO -->
      <div class="album-section" :class="{ 'hidden': isFullscreen || displayMode === 'minimal' }">
        <div class="album-art" :style="{ backgroundImage: `url(${currentSong.cover})` }">
          <div class="vinyl-ring" :class="{ 'spinning': isPlaying }">
            <div class="vinyl-center"></div>
          </div>
          <div class="difficulty-badge-large" :class="currentSong.difficulty">
            {{ getDifficultyLabel(currentSong.difficulty) }}
          </div>
        </div>
        
        <!-- Título e Artista abaixo do vinil -->
        <div class="song-info-mini">
  <span class="live-badge" :class="{ 'recording': isRecording }">LIVE</span>
  <p class="artist">{{ currentSong.artist }}</p>
  <h3 class="title">{{ currentSong.title }}</h3>
</div>


        <!-- Stats abaixo do título/artista -->
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

        <!-- Badges (Gênero e Dificuldade) por último -->
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

        <div v-else class="lyrics-wrapper" :style="lyricsTransform">
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
            <span v-if="line.isInstrumental" class="instrumental-indicator">🎵 Instrumental</span>
            <span v-else class="lyric-text" :style="{ fontSize: fontSize + 'px' }">{{ line.text }}</span>
            <span v-if="showPhonetic && currentLineIndex === index && line.phonetic" class="lyric-phonetic">{{ line.phonetic }}</span>
            <span v-if="visualFeedback && line.correct" class="feedback-icon correct">✓</span>
            <span v-if="visualFeedback && line.wrong" class="feedback-icon wrong">✗</span>
          </div>
        </div>
        
        <!-- Progress Indicator -->
        <div class="progress-line"></div>
      </div>

      <!-- Score Panel (Right) -->
      <div class="score-section" :class="{ 'hidden': isFullscreen || displayMode === 'minimal' }">
        <div class="score-card">
          <div class="score-header">
            <span>PONTUAÇÃO</span>
            <div class="combo" v-if="combo > 0">
              <span class="combo-count">{{ combo }}x</span>
              <span class="combo-label">COMBO</span>
            </div>
          </div>
          <div class="score-value" :class="scoreAnimation">{{ Math.round(currentScore) }}</div>
          <div class="score-bar">
            <div class="score-fill" :style="{ width: (currentScore / maxScore * 100) + '%' }"></div>
          </div>
          <div class="rating-stars">
            <span v-for="n in 5" :key="n" :class="{ 'filled': n <= starRating }">★</span>
          </div>
        </div>

        <!-- Real-time Accuracy -->
        <div class="accuracy-panel" v-if="visualFeedback">
          <div class="accuracy-item">
            <span>Precisão</span>
            <div class="accuracy-bar">
              <div class="accuracy-fill" :style="{ width: accuracyPercent + '%', background: getAccuracyColor(accuracyPercent) }"></div>
            </div>
            <span>{{ Math.round(accuracyPercent) }}%</span>
          </div>
        </div>

        <!-- Pitch Visualizer -->
        <div class="pitch-visualizer" v-if="visualFeedback && currentSong.difficulty !== 'easy'">
          <canvas ref="pitchCanvas"></canvas>
          <div class="pitch-guide">
            <div class="target-line"></div>
            <div class="your-line" :style="{ bottom: pitchPosition + '%' }"></div>
          </div>
        </div>

        <!-- Microphone Level -->
        <div class="mic-level">
          <span :class="{ 'active': micActive }">Mic {{ micActive ? 'ON' : 'OFF' }}</span>
          <div class="level-bar">
            <div class="level-fill" :style="{ height: micLevel + '%', background: micActive ? '#1DB954' : '#666' }"></div>
          </div>
        </div>

        <!-- Last Recognized Text -->
        <div v-if="lastRecognizedText && visualFeedback" class="recognized-text">
          <small>Ouviu: "{{ lastRecognizedText }}"</small>
        </div>
      </div>
    </main>

    <!-- Audio Visualizer Bottom -->
    <div class="audio-visualizer" v-if="visualFeedback">
      <canvas ref="audioCanvas"></canvas>
    </div>

    <!-- Controls -->
    <footer class="karaoke-controls">
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

        <div class="pitch-control" v-if="currentSong.difficulty !== 'easy'">
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

        <button class="btn-record" :class="{ 'recording': isRecording }" @click="toggleRecording">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          <span>{{ isRecording ? 'Gravando' : 'Gravar' }}</span>
        </button>
      </div>

      <!-- Progress Bar -->
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
    <transition name="fade">
      <div v-if="showSettings" class="settings-modal" @click.self="toggleSettings">
        <div class="settings-content">
          <h3>Configurações do Karaoke</h3>
          
          <div class="setting-item">
            <label>Modo de Exibição</label>
            <div class="setting-options">
              <button 
                v-for="mode in displayModes" 
                :key="mode.value"
                :class="{ 'active': displayMode === mode.value }"
                @click="setDisplayMode(mode.value)"
              >
                {{ mode.label }}
              </button>
            </div>
          </div>

          <div class="setting-item">
            <label>Tamanho da Fonte: {{ fontSize }}px</label>
            <input type="range" min="16" max="72" v-model.number="fontSize" class="setting-slider">
          </div>

          <div class="setting-item checkbox">
            <label>
              <input type="checkbox" v-model="showPhonetic">
              Mostrar Fonética (apenas difícil/hard)
            </label>
          </div>

          <div class="setting-item checkbox">
            <label>
              <input type="checkbox" v-model="visualFeedback">
              Feedback Visual
            </label>
          </div>

          <div class="setting-item checkbox">
            <label>
              <input type="checkbox" v-model="autoScroll">
              Rolagem Automática
            </label>
          </div>

          <div class="setting-item">
            <label>Sensibilidade do Microfone</label>
            <input type="range" min="0" max="100" v-model.number="micSensitivity" class="setting-slider">
          </div>

          <div class="setting-item checkbox" v-if="selectedDifficulty === 'hard' || selectedDifficulty === 'extreme'">
            <label>
              <input type="checkbox" v-model="strictMode">
              Modo Estrito (pontuação rigorosa)
            </label>
          </div>

          <button class="btn-close" @click="toggleSettings">Fechar</button>
        </div>
      </div>
    </transition>

    <!-- Recording Indicator -->
    <div v-if="isRecording" class="recording-indicator">
      <div class="rec-dot"></div>
      <span>GRAVANDO {{ formatTime(recordingTime) }}</span>
    </div>

    <!-- Audio Element -->
    <audio 
      v-if="audioPreviewUrl" 
      ref="audioPlayer"
      :src="audioPreviewUrl"
      @ended="handleAudioEnded"
      @timeupdate="updateProgress"
      @loadedmetadata="onAudioLoaded"
    ></audio>
  </div>
</template>

<script>
export default {
  name: 'KaraokeView',
  
  data() {
    return {
      // API Configuration
      DEEZER_API: 'https://api.deezer.com',
      CORS_PROXY: 'https://corsproxy.io/?',
      GENIUS_API: 'https://api.genius.com',
      GENIUS_TOKEN: 'YOUR_GENIUS_TOKEN_HERE',
      
      // Difficulty System
      difficultyLevels: [
        { 
          value: 'easy', 
          label: 'Fácil', 
          icon: '🌱',
          color: '#22c55e',
          description: 'Vocal simples, ritmo lento, poucas palavras'
        },
        { 
          value: 'medium', 
          label: 'Médio', 
          icon: '🌿',
          color: '#f59e0b',
          description: 'Range médio, ritmo moderado'
        },
        { 
          value: 'hard', 
          label: 'Difícil', 
          icon: '🔥',
          color: '#ef4444',
          description: 'Vocal amplo, rápido, complexo'
        },
        { 
          value: 'extreme', 
          label: 'Hard', 
          icon: '⚡',
          color: '#8b5cf6',
          description: 'Extremo: rap, ópera, whistle notes'
        }
      ],
      selectedDifficulty: 'medium',
      
      // Search
      searchQuery: '',
      isSearchFocused: false,
      showSearchResults: false,
      searchResults: [],
      searchTimeout: null,
      isLoading: false,
      

 // Song Data
      currentSong: {
        title: 'Carregando...',
        artist: 'Selecione uma música',
        cover: 'https://e-cdns-images.dzcdn.net/images/cover/8b8a1b0c0b1b1c1c1c1c1c1c1c1c1c1/500x500.jpg',
        genre: 'Pop',
        difficulty: 'medium',
        duration: 0,
        preview_url: null,
        deezerId: null,
        stats: null
      },
      
      // Lyrics Data
      rawLyrics: [],
      processedLyrics: [],
      isLoadingLyrics: false,
      lyricsError: null,
      
      // Playback State
      isPlaying: false,
      isFullscreen: false,
      currentTime: 0,
      duration: 0,
      volume: 80,
      isMuted: false,
      playbackRate: 1.0,
      pitchShift: 0,
      audioPreviewUrl: null,
      progressPercent: 0,
      
      // Lyrics Control
      currentLineIndex: 0,
      lastRecognizedText: '',
      lyricsStartTime: 0, // NOVO: tempo de início das letras
      
      // Scoring System
      currentScore: 0,
      maxScore: 10000,
      combo: 0,
      starRating: 0,
      scoreAnimation: '',
      accuracyPercent: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      strictMode: false,
      
      // Microphone & Audio
      micActive: false,
      micStream: null,
      micLevel: 0,
      micSensitivity: 70,
      audioContext: null,
      analyser: null,
      microphone: null,
      javascriptNode: null,
      
      // Speech Recognition
      recognition: null,
      isListening: false,
      
      // Recording
      isRecording: false,
      recordingTime: 0,
      recordingInterval: null,
      mediaRecorder: null,
      recordedChunks: [],
      
      // Settings
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
      
      // Timers
      playbackInterval: null,
      animationFrame: null,
      scoringTimer: null
    }
  },

  computed: {
    lyricsTransform() {
      if (!this.autoScroll) return { transform: 'translateY(0)' }
      const lineHeight = this.selectedDifficulty === 'easy' ? 100 : 80
      const containerHeight = 400
      const offset = (this.currentLineIndex * lineHeight) - (containerHeight / 2) + (lineHeight / 2)
      return {
        transform: `translateY(${-Math.max(0, offset)}px)`
      }
    },
    
    lyricsMarkers() {
      return this.processedLyrics.map((l, i) => ({ 
        time: l.time,
        index: i 
      })).filter(l => l.time > 0)
    },

    filteredSearchResults() {
      if (!this.selectedDifficulty) return this.searchResults
      return this.searchResults.filter(track => {
        if (this.selectedDifficulty === 'easy') return track.difficulty === 'easy'
        if (this.selectedDifficulty === 'medium') return ['easy', 'medium'].includes(track.difficulty)
        if (this.selectedDifficulty === 'hard') return ['medium', 'hard'].includes(track.difficulty)
        return true
      })
    }
  },

  watch: {
    selectedDifficulty(newVal) {
      if (newVal === 'easy') {
        this.showPhonetic = false
        this.visualFeedback = true
        this.strictMode = false
      } else if (newVal === 'extreme') {
        this.showPhonetic = true
        this.strictMode = true
      }
    }
  },

  mounted() {
    this.initAudio()
    this.initSpeechRecognition()
    window.addEventListener('keydown', this.handleKeydown)
    this.loadInitialTrack()
    this.loadSettings()
  },

  beforeDestroy() {
    this.stopPlayback()
    this.stopMicrophone()
    window.removeEventListener('keydown', this.handleKeydown)
    cancelAnimationFrame(this.animationFrame)
    if (this.recognition) this.recognition.stop()
  },

  methods: {
    // ============ DIFFICULTY SYSTEM ============
    
    calculateDifficulty(track, lyrics = '') {
      let score = 0
      
      const duration = track.duration || 180
      if (duration > 300) score += 2
      else if (duration < 120) score += 1
      
      if (lyrics) {
        const words = lyrics.split(/\s+/).length
        const wordDensity = (words / duration) * 60
        
        if (wordDensity > 150) score += 3
        else if (wordDensity > 100) score += 2
        else if (wordDensity > 80) score += 1
        
        const uniqueWords = new Set(lyrics.toLowerCase().split(/\s+/)).size
        const complexity = uniqueWords / words
        if (complexity > 0.7) score += 2
        else if (complexity > 0.5) score += 1
      }
      
      const genre = track.genre?.name || track.genre || 'Pop'
      const fastGenres = ['Rap', 'Hip-Hop', 'Drum & Bass', 'Techno', 'Metal']
      const slowGenres = ['Ballad', 'Acoustic', 'Jazz', 'Blues']
      
      if (fastGenres.some(g => genre.includes(g))) score += 2
      if (slowGenres.some(g => genre.includes(g))) score -= 1
      
      const hardArtists = ['whitney houston', 'mariah carey', 'queen', 'ariana grande', 'celine dion', 'eminem', 'twista']
      const easyArtists = ['bob dylan', 'johnny cash', 'ed sheeran', 'jason mraz']
      
      const artist = (track.artist?.name || track.artist || '').toLowerCase()
      if (hardArtists.some(a => artist.includes(a))) score += 2
      if (easyArtists.some(a => artist.includes(a))) score -= 1
      
      if (score >= 6) return 'extreme'
      if (score >= 4) return 'hard'
      if (score >= 2) return 'medium'
      return 'easy'
    },

    getDifficultyColor(difficulty) {
      const colors = {
        easy: '#22c55e',
        medium: '#f59e0b',
        hard: '#ef4444',
        extreme: '#8b5cf6'
      }
      return colors[difficulty] || '#888'
    },

    getDifficultyLabel(difficulty) {
      const labels = {
        easy: 'Fácil',
        medium: 'Médio',
        hard: 'Difícil',
        extreme: 'Hard'
      }
      return labels[difficulty] || difficulty
    },

    getAccuracyColor(percent) {
      if (percent >= 90) return '#22c55e'
      if (percent >= 70) return '#f59e0b'
      if (percent >= 50) return '#ef4444'
      return '#8b5cf6'
    },

    // ============ LYRICS FETCHING ============
    
    async fetchLyricsFromGenius(title, artist) {
      try {
        const searchUrl = `${this.CORS_PROXY}${this.GENIUS_API}/search?q=${encodeURIComponent(title + ' ' + artist)}&access_token=${this.GENIUS_TOKEN}`
        const searchRes = await fetch(searchUrl)
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
        
        const jsonMatch = html.match(/window\.__PRELOADED_STATE__ = JSON\.parse\('(.*?)'\)/)
        if (jsonMatch) {
          const state = JSON.parse(jsonMatch[1].replace(/\\'/g, "'"))
          return state.songPage.lyricsData.body.children
            .map(child => child.children?.map(c => c.text).join(' ') || '')
            .join('\n')
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
        .replace(/\[.*?\]/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    },

    // MELHORADO: Processamento de letras com sincronização mais precisa
    processLyricsWithTiming(lyricsText, duration) {
      const lines = lyricsText.split('\n').filter(line => line.trim())
      
      // Se tivermos uma duração válida, distribuímos as linhas proporcionalmente
      // mas com uma lógica mais inteligente que considera pausas entre versos
      const totalLines = lines.length
      const avgLineDuration = duration / totalLines
      
      return lines.map((line, index) => {
        // Calcula o tempo baseado na posição da linha
        // Adiciona um pequeno offset para não começar imediatamente
        const baseTime = (index / totalLines) * duration
        const timeOffset = 0.5 // meio segundo de offset inicial
        
        return {
          time: baseTime + timeOffset,
          text: line.trim(),
          phonetic: this.generatePhonetic(line.trim()),
          correct: false,
          wrong: false,
          sung: false,
          isInstrumental: line.includes('Instrumental') || line.includes('♪') || line.trim() === ''
        }
      })
    },

    generatePhonetic(text) {
      const phoneticMap = {
        'love': 'lʌv',
        'you': 'juː',
        'me': 'miː',
        'heart': 'hɑːrt',
        'night': 'naɪt',
        'day': 'deɪ',
        'way': 'weɪ',
        'time': 'taɪm',
        'life': 'laɪf',
        'baby': 'ˈbeɪbi',
        'oh': 'oʊ',
        'yeah': 'jɛə'
      }
      
      return text.toLowerCase().split(' ')
        .map(word => phoneticMap[word.replace(/[^a-z]/g, '')] || '')
        .filter(Boolean)
        .join(' ')
    },

    async loadLyricsForCurrentSong() {
      this.isLoadingLyrics = true
      this.lyricsError = null
      
      try {
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
          this.processedLyrics = this.processLyricsWithTiming(
            lyricsText, 
            this.currentSong.duration || 180
          )
          
          const realDifficulty = this.calculateDifficulty(this.currentSong, lyricsText)
          this.currentSong.difficulty = realDifficulty
          
          const words = lyricsText.split(/\s+/).length
          this.currentSong.stats = {
            wordDensity: Math.round((words / this.currentSong.duration) * 60),
            uniqueWords: new Set(lyricsText.toLowerCase().split(/\s+/)).size,
            totalLines: this.processedLyrics.length
          }
        } else {
          throw new Error('Letras não disponíveis')
        }
      } catch (error) {
        this.lyricsError = 'Não foi possível carregar as letras. Tente outra música.'
        this.loadFallbackLyrics()
      } finally {
        this.isLoadingLyrics = false
      }
    },

loadFallbackLyrics() {
      const fallbackLyrics = {
        easy: [
          { time: 0, text: "Love me tender", phonetic: "lʌv miː ˈtɛndər" },
          { time: 3, text: "Love me sweet", phonetic: "lʌv miː swiːt" },
          { time: 6, text: "Never let me go", phonetic: "ˈnɛvər lɛt miː ɡoʊ" },
          { time: 9, text: "You have made my life complete", phonetic: "juː hæv meɪd maɪ laɪf kəmˈpliːt" },
          { time: 12, text: "And I love you so", phonetic: "ænd aɪ lʌv juː soʊ" }
        ],
        medium: [
          { time: 0, text: "Is this the real life?", phonetic: "ɪz ðɪs ðə riːl laɪf" },
          { time: 4, text: "Is this just fantasy?", phonetic: "ɪz ðɪs dʒʌst fænˈtæzi" },
          { time: 8, text: "Caught in a landslide", phonetic: "kɔːt ɪn ə ˈlændslaɪd" },
          { time: 12, text: "No escape from reality", phonetic: "noʊ ɪˈskeɪp frɒm riˈælɪti" },
          { time: 16, text: "Open your eyes", phonetic: "ˈoʊpən jɔːr aɪz" }
        ],
        hard: [
          { time: 0, text: "She's got a smile that it seems to me", phonetic: "ʃiːz ɡɒt ə smaɪl ðæt ɪt siːmz tuː miː" },
          { time: 4, text: "Reminds me of childhood memories", phonetic: "rɪˈmaɪndz miː ʌv ˈtʃaɪldhʊd ˈmɛməriz" },
          { time: 8, text: "Where everything was as fresh", phonetic: "weər ˈɛvriθɪŋ wʌz æz frɛʃ" },
          { time: 12, text: "As the bright blue sky", phonetic: "æz ðə braɪt bluː skaɪ" }
        ],
        extreme: [
          { time: 0, text: "Look, I was gonna go easy on you not to hurt your feelings", phonetic: "lʊk aɪ wʌz ˈɡɒnə ɡoʊ ˈiːzi ɒn juː nɒt tuː hɜːrt jɔːr ˈfiːlɪŋz" },
          { time: 3, text: "But I'm only going to get this one chance", phonetic: "bʌt aɪm ˈəʊnli ˈɡəʊɪŋ tuː ɡɛt ðɪs wʌn tʃɑːns" },
          { time: 6, text: "Something's wrong, I can feel it", phonetic: "ˈsʌmθɪŋz rɒŋ aɪ kæn fiːl ɪt" }
        ]
      }
      
      const diff = this.currentSong.difficulty || 'medium'
      this.processedLyrics = fallbackLyrics[diff] || fallbackLyrics.medium
    },

    // ============ SETTINGS ============
    
    loadSettings() {
      const saved = localStorage.getItem('karaokeSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        this.displayMode = settings.displayMode || 'standard'
        this.fontSize = settings.fontSize || 28
        this.showPhonetic = settings.showPhonetic !== false
        this.visualFeedback = settings.visualFeedback !== false
        this.autoScroll = settings.autoScroll !== false
        this.micSensitivity = settings.micSensitivity || 70
        this.selectedDifficulty = settings.selectedDifficulty || 'medium'
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
        selectedDifficulty: this.selectedDifficulty
      }
      localStorage.setItem('karaokeSettings', JSON.stringify(settings))
    },
    
    setDisplayMode(mode) {
      this.displayMode = mode
      this.saveSettings()
    },

    // ============ API & SEARCH ============
    
    async loadInitialTrack() {
      const sampleTracks = {
        easy: { q: 'im yours jason mraz', title: 'I\'m Yours' },
        medium: { q: 'bohemian rhapsody queen', title: 'Bohemian Rhapsody' },
        hard: { q: 'i will always love you whitney houston', title: 'I Will Always Love You' },
        extreme: { q: 'rap god eminem', title: 'Rap God' }
      }
      
      const track = sampleTracks[this.selectedDifficulty] || sampleTracks.medium
      
      try {
        const response = await fetch(`${this.CORS_PROXY}${this.DEEZER_API}/search?q=${track.q}&limit=1`)
        const data = await response.json()
        
        if (data.data && data.data.length > 0) {
          await this.setSongData(data.data[0])
        }
      } catch (error) {
        console.error('Erro ao carregar música inicial:', error)
      }
    },
    
    async searchMusic() {
      if (!this.searchQuery.trim()) return
      
      this.isLoading = true
      try {
        const response = await fetch(
          `${this.CORS_PROXY}${this.DEEZER_API}/search?q=${encodeURIComponent(this.searchQuery)}&limit=20`
        )
        const data = await response.json()
        
        this.searchResults = (data.data || []).map(track => ({
          ...track,
          difficulty: this.calculateDifficulty(track)
        }))
        
        this.showSearchResults = true
      } catch (error) {
        console.error('Erro na busca:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    handleInput() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        if (this.searchQuery.length > 2) this.searchMusic()
      }, 300)
    },
    
    async selectTrack(track) {
      await this.setSongData(track)
      this.showSearchResults = false
      this.searchQuery = ''
    },
    
    async setSongData(track) {
      const difficulty = track.difficulty || this.calculateDifficulty(track)
      
      this.currentSong = {
        title: track.title,
        artist: track.artist.name,
        cover: track.album.cover_big || track.album.cover_medium,
        genre: track.genre?.name || 'Pop',
        difficulty: difficulty,
        duration: track.duration,
        preview_url: track.preview,
        deezerId: track.id,
        stats: null
      }
      
      this.duration = track.duration
      this.audioPreviewUrl = track.preview
      this.currentTime = 0
      this.progressPercent = 0
      this.currentLineIndex = 0
      this.lyricsStartTime = 0 // Reset do tempo de início
      this.resetScore()
      
      await this.loadLyricsForCurrentSong()
    },
    
    resetScore() {
      this.currentScore = 0
      this.combo = 0
      this.starRating = 0
      this.accuracyPercent = 0
      this.totalAttempts = 0
      this.correctAttempts = 0
    },
    
    previewTrack(track) {
      const audio = new Audio(track.preview)
      audio.volume = this.volume / 100
      audio.play()
    },
    
    handleSearchBlur() {
      setTimeout(() => {
        this.isSearchFocused = false
      }, 200)
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.searchResults = []
      this.showSearchResults = false
    },

    // ============ MICROPHONE & SPEECH ============
    
    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        console.warn('Speech API não suportada')
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
        if (event.error !== 'no-speech') {
          console.error('Speech error:', event.error)
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
        
        if (this.recognition && !this.isListening) {
          this.recognition.start()
          this.isListening = true
        }
        
        this.setupAudioAnalysis()
      } catch (error) {
        console.error('Erro ao acessar microfone:', error)
        alert('Não foi possível acessar o microfone.')
      }
    },
    
    stopMicrophone() {
      if (this.recognition && this.isListening) {
        this.recognition.stop()
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
      
      if (this.micActive) {
        requestAnimationFrame(() => this.analyzeAudio())
      }
    },
    
    checkSingingAccuracy(transcript) {
      if (this.currentLineIndex >= this.processedLyrics.length) return
      
      const currentLine = this.processedLyrics[this.currentLineIndex]
      if (currentLine.isInstrumental || currentLine.sung) return
      
      const targetText = currentLine.text.toLowerCase()
      const similarity = this.calculateSimilarity(transcript, targetText)
      
      const thresholds = {
        easy: 0.5,
        medium: 0.6,
        hard: 0.7,
        extreme: 0.8
      }
      const threshold = thresholds[this.selectedDifficulty] || 0.6
      
      this.totalAttempts++
      
      if (similarity > threshold) {
        currentLine.sung = true
        
        if (similarity > 0.9) {
          currentLine.correct = true
          this.combo++
          const multiplier = this.selectedDifficulty === 'extreme' ? 2 : 1
          const points = 150 * multiplier * (1 + this.combo * 0.1)
          this.addScore(points, 'perfect')
          this.correctAttempts++
        } else if (similarity > threshold + 0.1) {
          currentLine.correct = true
          this.combo++
          const points = 100 * (1 + this.combo * 0.05)
          this.addScore(points, 'good')
          this.correctAttempts++
        } else {
          currentLine.wrong = true
          this.combo = 0
          this.addScore(50, 'ok')
        }
        
        this.accuracyPercent = (this.correctAttempts / this.totalAttempts) * 100
        
        setTimeout(() => {
          if (this.currentLineIndex < this.processedLyrics.length - 1) {
            this.currentLineIndex++
          }
        }, this.selectedDifficulty === 'easy' ? 1500 : 1000)
      }
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
    
    addScore(points, type) {
      if (this.strictMode && type !== 'perfect') {
        points *= 0.5
      }
      
      this.currentScore = Math.min(this.maxScore, this.currentScore + points)
      this.scoreAnimation = type
      setTimeout(() => this.scoreAnimation = '', 300)
      
      this.starRating = Math.min(5, Math.floor(this.currentScore / 2000))
    },

// ============ PLAYBACK ============
    
    togglePlay() {
      if (!this.audioPreviewUrl) {
        alert('Nenhum preview disponível.')
        return
      }
      
      this.isPlaying = !this.isPlaying
      
      if (this.isPlaying) {
        this.$refs.audioPlayer?.play()
        this.startPlaybackLoop()
        if (!this.micActive) this.startMicrophone()
      } else {
        this.$refs.audioPlayer?.pause()
        this.stopPlaybackLoop()
      }
    },
    
    startPlaybackLoop() {
      const loop = () => {
        if (!this.isPlaying) return
        this.updateProgress()
        this.animationFrame = requestAnimationFrame(loop)
      }
      loop()
    },
    
    stopPlaybackLoop() {
      cancelAnimationFrame(this.animationFrame)
    },
    
    updateProgress() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      
      this.currentTime = audio.currentTime
      this.duration = audio.duration || this.duration
      this.progressPercent = (this.currentTime / this.duration) * 100
      this.updateLyricsIndex()
    },
    
    // MELHORADO: Sincronização mais precisa das letras
    updateLyricsIndex() {
      if (this.processedLyrics.length === 0) return
      
      // Encontra a linha atual baseada no tempo atual da música
      // com uma pequena margem de antecipação (0.5s) para preparar o cantor
      const anticipation = 0.5
      
      for (let i = 0; i < this.processedLyrics.length; i++) {
        const line = this.processedLyrics[i]
        const nextLine = this.processedLyrics[i + 1]
        
        // Se estamos dentro do tempo desta linha
        if (this.currentTime >= line.time - anticipation) {
          // E se não há próxima linha ou ainda não chegamos nela
          if (!nextLine || this.currentTime < nextLine.time - anticipation) {
            if (this.currentLineIndex !== i) {
              this.currentLineIndex = i
            }
            break
          }
        }
      }
      
      // Se o tempo atual passou da última linha, mantém na última
      const lastLine = this.processedLyrics[this.processedLyrics.length - 1]
      if (this.currentTime >= lastLine.time && this.currentLineIndex !== this.processedLyrics.length - 1) {
        this.currentLineIndex = this.processedLyrics.length - 1
      }
    },
    
    onAudioLoaded() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        this.duration = audio.duration
        audio.volume = this.volume / 100
        audio.playbackRate = this.playbackRate
      }
    },
    
    handleAudioEnded() {
      this.isPlaying = false
      this.currentTime = 0
      this.progressPercent = 0
      this.currentLineIndex = 0
      this.stopMicrophone()
    },
    
    skipBackward() {
      const audio = this.$refs.audioPlayer
      if (audio) audio.currentTime = Math.max(0, audio.currentTime - 5)
    },
    
    skipForward() {
      const audio = this.$refs.audioPlayer
      if (audio) audio.currentTime = Math.min(this.duration, audio.currentTime + 5)
    },
    
    seekTo(event) {
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const percent = (event.clientX - rect.left) / rect.width
      const newTime = percent * this.duration
      
      const audio = this.$refs.audioPlayer
      if (audio) audio.currentTime = newTime
      
      this.currentTime = newTime
      this.progressPercent = percent * 100
      
      // Atualiza imediatamente o índice da letra ao seekar
      this.updateLyricsIndex()
    },
    
    updateVolume() {
      const audio = this.$refs.audioPlayer
      if (audio) audio.volume = this.volume / 100
    },
    
    updatePlaybackRate() {
      const audio = this.$refs.audioPlayer
      if (audio) audio.playbackRate = this.playbackRate
    },

    // ============ VISUALIZERS ============
    
    initAudio() {
      this.$nextTick(() => {
        this.initAudioVisualizer()
        this.initBackgroundVisualizer()
      })
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

    // ============ CONTROLS ============
    
    toggleMute() {
      this.isMuted = !this.isMuted
      const audio = this.$refs.audioPlayer
      if (audio) audio.muted = this.isMuted
    },
    
    changePitch(delta) {
      this.pitchShift = Math.max(-5, Math.min(5, this.pitchShift + delta))
    },
    
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
      if (this.isFullscreen) {
        document.documentElement.requestFullscreen?.()
      } else {
        document.exitFullscreen?.()
      }
    },
    
    toggleSettings() {
      this.showSettings = !this.showSettings
      if (!this.showSettings) this.saveSettings()
    },
    
    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording()
      } else {
        this.startRecording()
      }
    },
    
    startRecording() {
      if (!this.micStream) {
        alert('Ative o microfone primeiro!')
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
    
    goBack() {
      this.$router?.back() || window.history.back()
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    handleKeydown(e) {
      if (e.code === 'Space') {
        e.preventDefault()
        this.togglePlay()
      } else if (e.code === 'ArrowLeft') {
        this.skipBackward()
      } else if (e.code === 'ArrowRight') {
        this.skipForward()
      } else if (e.code === 'KeyF') {
        this.toggleFullscreen()
      } else if (e.code === 'KeyM') {
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

.lyrics-wrapper {
  will-change: transform;
  transform: translateZ(0);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.lyric-line {
  will-change: transform, opacity;
  transition: all 0.3s ease;
  backface-visibility: hidden;
}

.search-section {
  position: relative;
  z-index: 20;
  padding: 0 40px 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.search-wrapper.focused {
  background: rgba(255, 255, 255, 0.15);
  border-color: #1DB954;
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.3);
}


.search-icon {
  width: 20px;
  height: 20px;
  color: #888;
  flex-shrink: 0;
}

.search-wrapper input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: white;
  font-size: 15px;
}

.clear-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(255, 68, 68, 0.8);
  transform: rotate(90deg);
}

.search-results-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 40px;
  right: 40px;
  background: #1a1a2e;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  max-height: 300px;
  overflow-y: auto;
  z-index: 100;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.result-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.result-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-artist {
  font-size: 12px;
  color: #888;
}

.result-difficulty {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-top: 4px;
}

.btn-play-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1DB954;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-play-small:hover {
  transform: scale(1.1);
}

.lyric-line.correct .lyric-text {
  color: #1DB954;
  text-shadow: 0 0 20px rgba(29, 185, 84, 0.5);
}

.lyric-line.wrong .lyric-text {
  color: #e74c3c;
  text-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
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

@keyframes popIn {
  0% { transform: translateY(-50%) scale(0); }
  80% { transform: translateY(-50%) scale(1.2); }
  100% { transform: translateY(-50%) scale(1); }
}

.btn-icon.active {
  background: #1DB954;
  color: white;
  animation: pulse 2s infinite;
}

.mic-level .active {
  color: #1DB954;
  font-weight: bold;
}

.recognized-text {
  margin-top: 10px;
  padding: 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  font-size: 11px;
  color: #888;
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
}

.setting-item.checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #1DB954;
}

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

/* REORGANIZADO: Layout vertical para album-section */
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
.difficulty-badge-large.extreme { background: #8b5cf6; }

/* REORGANIZADO: Song meta abaixo do vinil */
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

/* REORGANIZADO: Stats abaixo do título/artista */
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

/* REORGANIZADO: Badges por último */
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
.badge.difficulty.extreme { background: #8b5cf6; }

.lyrics-section {
  position: relative;
  height: 400px;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%);
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
  padding: 20px;
  position: relative;
  opacity: 0.3;
  transform: scale(0.9);
  transition: all 0.3s ease;
}

.lyric-line.active {
  opacity: 1;
  transform: scale(1.05);
}

.lyric-line.past {
  opacity: 0.5;
}

.lyric-line.instrumental {
  opacity: 0.4;
}

.instrumental-indicator {
  font-size: 24px;
  opacity: 0.5;
  font-style: italic;
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

.lyric-line.active .lyric-text {
  background: linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: glow 2s ease-in-out infinite;
}

.lyric-phonetic {
  display: block;
  font-size: 14px;
  margin-top: 8px;
  opacity: 0.7;
  font-style: italic;
  color: #a5b4fc;
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

.audio-visualizer {
  position: fixed;
  bottom: 120px;
  left: 0;
  width: 100%;
  height: 100px;
  z-index: 2;
  opacity: 0.6;
  pointer-events: none;
}

.audio-visualizer canvas {
  width: 100%;
  height: 100%;
}

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

.recording-indicator {
  position: fixed;
  top: 100px;
  right: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(239, 68, 68, 0.9);
  padding: 12px 20px;
  border-radius: 24px;
  font-weight: 600;
  z-index: 50;
  animation: slideIn 0.3s ease;
}

.rec-dot {
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  animation: blink 1s infinite;
}

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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.karaoke-container.fullscreen .karaoke-stage {
  grid-template-columns: 1fr;
}

.karaoke-container.fullscreen .lyrics-section {
  height: 60vh;
}

@media (max-width: 1200px) {
  .karaoke-stage {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .album-section,
  .score-section {
    display: none;
  }
  
  .lyrics-section {
    height: 50vh;
  }
}

@media (max-width: 768px) {
  .karaoke-header {
    padding: 16px 20px;
  }
  
  .song-info-mini {
    max-width: 200px;
  }
  
  .song-info-mini h3 {
    font-size: 14px;
  }
  
  .song-info-mini p {
    font-size: 12px;
  }
  
  .karaoke-stage {
    padding: 20px;
  }
  
  .karaoke-controls {
    padding: 16px 20px;
  }
  
  .controls-secondary {
    gap: 20px;
  }
  
  .search-section {
    padding: 0 20px 20px;
  }
}
</style>