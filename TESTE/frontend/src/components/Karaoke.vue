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
        </div>

        <div class="songs-grid">
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Carregando músicas...</p>
          </div>

          <div
            v-else-if="searchResults.length > 0"
            v-for="(track, index) in filteredSearchResults.slice(0, 12)"
            :key="index"
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
          <span v-if="line.isInstrumental" class="instrumental-indicator">
  <i class="fas fa-wave-square"></i>
  Instrumental
</span>
            <span v-else class="lyric-text" :style="{ fontSize: fontSize + 'px' }">{{ line.text }}</span>
            <span v-if="showPhonetic && currentLineIndex === index && line.phonetic" class="lyric-phonetic">{{ line.phonetic }}</span>
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

          <div class="setting-item checkbox">
            <input type="checkbox" v-model="showPhonetic" id="phonetic">
            <label for="phonetic">Mostrar Pronúncia</label>
          </div>

          <div class="setting-item checkbox">
            <input type="checkbox" v-model="visualFeedback" id="feedback">
            <label for="feedback">Feedback Visual</label>
          </div>

          <div class="setting-item checkbox">
            <input type="checkbox" v-model="autoScroll" id="autoscroll">
            <label for="autoscroll">Auto-scroll de Letras</label>
          </div>

          <div v-if="withMicrophone" class="setting-item">
            <label>Sensibilidade do Microfone: {{ micSensitivity }}%</label>
            <input type="range" min="0" max="100" v-model.number="micSensitivity" class="setting-slider">
          </div>

          <button class="btn-close" @click="toggleSettings">Fechar</button>
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
  </div>
</template>
<script>
export default {
  name: 'KaraokeComponent',

  data() {
    return {
      micPermissionToast: {
        show: false,
        type: 'error',
        title: '',
        message: '',
        timer: null
      },
      showSongSelection: true,
      withMicrophone: true,
      CORS_PROXY: 'https://proxy.corsfix.com/?',
      DEEZER_API: 'https://api.deezer.com',
      GENIUS_API: 'https://api.genius.com',
      GENIUS_TOKEN: '',
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
      isSearchFocused: false,
      searchTimeout: null,
      isLoading: false,
      currentSong: {
        title: 'Selecione uma música',
        artist: 'Artista',
        cover: 'https://via.placeholder.com/200',
        genre: 'Pop',
        difficulty: 'medium',
        duration: 180,
        preview_url: '',
        deezerId: null,
        lyricsTimeScale: 1,  
        previewStartOffset: 0,    // ← ADICIONAR
    hasRealLRC: false, 
        stats: null
      },
      rawLyrics: '',
      processedLyrics: [],
      currentLineIndex: 0,
      isLoadingLyrics: false,
      lyricsError: null,
      lyricsStartTime: 0,
      audioPreviewUrl: '',
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      progressPercent: 0,
      playbackRate: 1,
      isMuted: false,
      volume: 70,
      currentScore: 0,
      maxScore: 10000,
      combo: 0,
      starRating: 0,
      accuracyPercent: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      scoreAnimation: '',
      strictMode: false,
      selectedDifficulty: 'medium',
      pitchShift: 0,
      pitchPosition: 30,
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
      isRecording: false,
      recordingTime: 0,
      recordingInterval: null,
      mediaRecorder: null,
      recordedChunks: [],
      playbackInterval: null,
      animationFrame: null,
      scoringTimer: null,
      lyricsSyncOffset: 0,
  API_BASE: import.meta.env.VITE_API_URL || 'http://localhost:3002',
       isAuthenticated: false,
    musicProvider: 'deezer',

    micPermissionToast: {
      show: false,
      type: 'error',
      title: '',
      message: '',
      timer: null
    },
    showSongSelection: true,
    withMicrophone: true,
    CORS_PROXY: 'https://proxy.corsfix.com/?',
    DEEZER_API: 'https://api.deezer.com',
    GENIUS_API: 'https://api.genius.com',
    GENIUS_TOKEN: '',
    searchQuery: '',
    searchResults: [],
    showSearchResults: false,
    isSearchFocused: false,
    searchTimeout: null,
    isLoading: false,
    currentSong: {
      title: 'Selecione uma música',
      artist: 'Artista',
      cover: 'https://via.placeholder.com/200',
      genre: 'Pop',
      difficulty: 'medium',
      duration: 180,
      preview_url: '',
      deezerId: null,
      spotifyId: null,
      source: 'deezer',
      stats: null
    },
difficultySeedQueries: {
  easy: 'Ed Sheeran Jason Mraz Beatles Elvis Presley',
  medium: 'Adele Coldplay Dua Lipa The Weeknd Rihanna',
  hard: 'Queen Whitney Houston Mariah Carey Eminem Ariana Grande Bruno Mars'
},
lastSpeechSyncAt: 0

    }
  },

  computed: {
//  lyricsTransform() {
//     if (!this.autoScroll) return { transform: 'translateY(0)' }
//     const lineHeight = this.selectedDifficulty === 'easy' ? 100 : 80
//     const containerHeight = 400
//     const offset = (this.currentLineIndex * lineHeight) - (containerHeight / 2) + (lineHeight / 2)
//     return {
//       transform: `translateY(${-Math.max(0, offset)}px)`
//     }
//   },

lyricsMarkers() {
  // ← CORREÇÃO: Usar previewDuration para posicionar markers na barra de 30s
  const previewDuration = this.currentSong.previewDuration || this.duration || 30
  return this.processedLyrics.map((l, i) => ({
    time: l.time / this.lyricsTimeScale, // converter para escala do preview
    index: i
  })).filter(l => l.time > 0 && l.time <= previewDuration)
},

  filteredSearchResults() {
    if (!this.selectedDifficulty) return this.searchResults
    return this.searchResults.filter(track => track.difficulty === this.selectedDifficulty)
  },

  currentProviderLabel() {
    return this.isAuthenticated ? 'Spotify' : 'Deezer'
  }
  },

  watch: {
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

      if (!this.searchQuery.trim()) {
        await this.loadSongsByDifficulty(newVal)
      }
    }
  },
    currentLineIndex(newVal, oldVal) {
    if (newVal === oldVal) return
    this.$nextTick(() => {
      const container = this.$refs.lyricsContainer
      const activeLine = container?.querySelector('.lyric-line.active')
      if (activeLine && container) {
        const containerRect = container.getBoundingClientRect()
        const lineRect = activeLine.getBoundingClientRect()
        const scrollTop = container.scrollTop + (lineRect.top - containerRect.top) - (containerRect.height / 2) + (lineRect.height / 2)
        container.scrollTo({ top: scrollTop, behavior: 'smooth' })
      }
    })
  }
},

mounted() {
  this.detectAuthProvider()
  this.initAudio()
  if (this.withMicrophone) {
    this.initSpeechRecognition()
  }
  window.addEventListener('keydown', this.handleKeydown)
  this.loadSettings()
  this.loadSongsByDifficulty(this.selectedDifficulty)
  this.$emit('karaoke-active', true)
},

  beforeDestroy() {
    this.stopPlayback()
    this.stopMicrophone()
    window.removeEventListener('keydown', this.handleKeydown)
    cancelAnimationFrame(this.animationFrame)
    if (this.recognition) this.recognition.stop()
    this.hideMicPermissionToast()
    this.$emit('karaoke-active', false)
  },

  methods: {
 calculateLyricsTimeScale() {
  if (!this.processedLyrics.length) return

  const previewDuration = this.duration || 30
  const fullDuration = this.currentSong.duration || 180

  // se não for LRC real, usa fallback antigo
  if (!this.hasRealLRC) {
    this.lyricsTimeScale = fullDuration / previewDuration
    this.previewStartOffset = Math.max(
      0,
      (fullDuration - previewDuration) / 2
    )
    return
  }

  // =========================
  // DETECTAR TRECHO DO PREVIEW
  // =========================

  const lines = this.processedLyrics

  // Deezer/Spotify preview geralmente vem:
  // - refrão
  // - parte mais energética
  // - miolo da música
  //
  // então vamos procurar:
  // 1. trecho com mais repetição
  // 2. trecho mais "denso"
  // 3. janela de 30s mais relevante

  let bestWindow = {
    score: -Infinity,
    startTime: 0,
    endTime: previewDuration
  }

  for (let i = 0; i < lines.length; i++) {
    const start = lines[i].time
    const end = start + previewDuration

    const windowLines = lines.filter(
      l => l.time >= start && l.time <= end
    )

    if (!windowLines.length) continue

    let score = 0

    const unique = new Set()

    windowLines.forEach(line => {
      const txt = line.text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .trim()

      // linhas repetidas = provável refrão
      if (unique.has(txt)) {
        score += 5
      }

      unique.add(txt)

      // linhas maiores = mais cantadas
      score += Math.min(txt.length / 10, 4)

      // penalizar instrumental
      if (line.isInstrumental) {
        score -= 3
      }
    })

    // bônus para região central da música
    const center = fullDuration / 2
    const distance = Math.abs(start - center)

    score += Math.max(0, 15 - distance / 5)

    if (score > bestWindow.score) {
      bestWindow = {
        score,
        startTime: start,
        endTime: end
      }
    }
  }

  // =========================
  // RECORTAR APENAS TRECHO
  // =========================

  const clippedLyrics = lines
    .filter(
      line =>
        line.time >= bestWindow.startTime &&
        line.time <= bestWindow.endTime
    )
    .map(line => ({
      ...line,

      // reajustar tempo para começar do 0
      time: line.time - bestWindow.startTime
    }))

  this.processedLyrics = clippedLyrics

  this.previewStartOffset = bestWindow.startTime

  this.lyricsTimeScale = 1

  console.log('🎯 Preview detectado automaticamente:')
  console.log(
    `Trecho: ${bestWindow.startTime.toFixed(1)}s → ${bestWindow.endTime.toFixed(1)}s`
  )

  console.log(
    `Linhas recortadas: ${clippedLyrics.length}`
  )
},
    // ADICIONAR NO BLOCO methods: {}
analyzeLyricStructure(lines) {
  const chorusLines = []
  const bridgeLines = []
  
  // Detectar refrão: linhas que se repetem
  const lineCounts = new Map()
  for (let i = 0; i < lines.length; i++) {
    const normalized = lines[i].toLowerCase().replace(/[^\w\s]/g, '').trim()
    if (normalized.length > 10) {
      const count = lineCounts.get(normalized) || []
      count.push(i)
      lineCounts.set(normalized, count)
    }
  }

  // Linhas que aparecem 2+ vezes = provável refrão
  for (const [_, indices] of lineCounts) {
    if (indices.length >= 2) {
      chorusLines.push(...indices)
    }
  }

  // Detectar ponte: seção curta no meio (tipicamente 4-8 linhas)
  const totalLines = lines.length
  const middleStart = Math.floor(totalLines * 0.4)
  const middleEnd = Math.floor(totalLines * 0.7)
  
  // Heurística simples: seção entre 40-70% com linhas únicas = ponte
  for (let i = middleStart; i < middleEnd; i++) {
    if (!chorusLines.includes(i)) {
      bridgeLines.push(i)
    }
  }

  return { chorusLines, bridgeLines }
},

// ADICIONAR NO BLOCO methods: {}
async fetchLRCFromLRCLIB(title, artist, duration) {
  try {
    // LRCLIB API - https://lrclib.net/
    const query = `${title} ${artist}`.toLowerCase().trim()
    
    // Busca por track
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`
    const response = await fetch(searchUrl)
    
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data || data.length === 0) return null

    // Encontrar a melhor correspondência (mais próxima da duração)
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

    // Parse do formato LRC: [mm:ss.xx] letra
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
    detectAuthProvider() {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('access_token')

  this.isAuthenticated = !!token
  this.musicProvider = this.isAuthenticated ? 'spotify' : 'deezer'
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

async searchTracksByProvider(query, limit = 20) {
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

  // se já está sincronizado, procura perto da linha atual
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

  // fallback global se a busca local não foi boa
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

   async loadSongsByDifficulty(difficulty = this.selectedDifficulty) {
  this.isLoading = true

  try {
    const seedQuery = this.difficultySeedQueries[difficulty] || this.difficultySeedQueries.medium
    const tracks = await this.searchTracksByProvider(seedQuery, 40)

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


    getArtistDifficultyBoost(artistName = '') {
  const artist = artistName.toLowerCase()

  const hardArtists = [
    'whitney houston',
    'mariah carey',
    'queen',
    'ariana grande',
    'celine dion',
    'eminem',
    'twista',
    'busta rhymes',
    'guns n roses',
    'bruno mars'
  ]

  const mediumArtists = [
    'adele',
    'coldplay',
    'dua lipa',
    'the weeknd',
    'imagine dragons',
    'rihanna',
    'sia',
    'lady gaga'
  ]

  const easyArtists = [
    'bob dylan',
    'johnny cash',
    'ed sheeran',
    'jason mraz',
    'beatles',
    'elvis presley'
  ]

  if (hardArtists.some(a => artist.includes(a))) return 3
  if (mediumArtists.some(a => artist.includes(a))) return 1
  if (easyArtists.some(a => artist.includes(a))) return -1

  return 0
},

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

async selectTrackAndStart(track) {
  await this.setSongData(track)
  this.showSongSelection = false
  this.searchQuery = ''
},

   calculateDifficulty(track, lyrics = '') {
  let score = 2 // base: médio por padrão

  const duration = Number(track.duration || 180)
  const artistName = track.artist?.name || track.artist || ''
  const genre = (track.genre?.name || track.genre || '').toLowerCase()

  // duração
  if (duration >= 240) score += 1
  if (duration >= 330) score += 1
  if (duration <= 140) score -= 1

  // artista
  score += this.getArtistDifficultyBoost(artistName)

  // gênero
  const fastGenres = ['rap', 'hip hop', 'hip-hop', 'drum & bass', 'techno', 'metal', 'trap']
  const slowGenres = ['ballad', 'acoustic', 'jazz', 'blues', 'folk']

  if (fastGenres.some(g => genre.includes(g))) score += 1
  if (slowGenres.some(g => genre.includes(g))) score -= 1

  // se tiver letra, aí refina de verdade
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

  // NOVO processLyricsWithTiming() — substitua o método inteiro
processLyricsWithTiming(lyricsText, songDuration, lrcData = null) {
  // Se temos dados LRC com timestamps reais, use-os
  if (lrcData && lrcData.length > 0) {
    return lrcData.map(item => ({
      time: item.time,
      text: item.text,
      phonetic: this.generatePhonetic(item.text),
      correct: false,
      wrong: false,
      sung: false,
      isInstrumental: item.text.includes('♪') || item.text.includes('Instrumental'),
      duration: 0 // será calculado pelo próximo item
    })).map((line, i, arr) => {
      const next = arr[i + 1]
      line.duration = next ? next.time - line.time : 3
      return line
    })
  }

  // Fallback: heurísticas melhoradas para estimar timing
  const lines = lyricsText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  // Detectar estrutura: verso, refrão, ponte, instrumental
  const structure = this.analyzeLyricStructure(lines)
  
  let currentTime = 0
  const avgLineDuration = songDuration / lines.length

  return lines.map((line, index) => {
    const isInstrumental = line.includes('Instrumental') || line.includes('♪')
    const isChorus = structure.chorusLines.includes(index)
    const isBridge = structure.bridgeLines.includes(index)
    
    // Heurística de duração por tipo de linha
    let duration = avgLineDuration
    if (isInstrumental) duration *= 2
    if (isChorus) duration *= 0.9 // refrão costuma ser mais rápido
    if (line.length < 10) duration *= 0.7 // linhas curtas = mais rápido
    if (line.length > 50) duration *= 1.3 // linhas longas = mais devagar
    
    // Adicionar pausa após refrão
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

  // NOVO loadLyricsForCurrentSong() — substitua o método inteiro
async loadLyricsForCurrentSong() {
  this.isLoadingLyrics = true
  this.lyricsError = null

  try {
    // 1. TENTAR LRCLIB PRIMEIRO (tem timestamps reais!)
    let lrcData = await this.fetchLRCFromLRCLIB(
      this.currentSong.title,
      this.currentSong.artist,
      this.currentSong.duration
    )

    if (lrcData && lrcData.length > 0) {
      this.rawLyrics = lrcData.map(l => l.text).join('\n')
      this.processedLyrics = this.processLyricsWithTiming(
        this.rawLyrics,
        this.currentSong.duration,
        lrcData
      )
      console.log('✅ Letra sincronizada via LRCLIB')
    } else {
      // 2. Fallback: Genius API (sem timestamps)
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
      } else {
        throw new Error('Letras não disponíveis')
      }
    }

    // Calcular dificuldade real com base na letra
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
    },

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

   async searchMusic() {
  if (!this.searchQuery.trim()) return

  this.isLoading = true
  this.searchResults = []

  try {
    const tracks = await this.searchTracksByProvider(this.searchQuery, 20)

    this.searchResults = tracks.map(track => ({
      ...track,
      difficulty: this.calculateDifficulty(track)
    }))

    this.showSearchResults = true
  } catch (error) {
    console.error('Erro na busca:', error)
    this.searchResults = []
    alert(`Erro ao buscar músicas via ${this.currentProviderLabel}.`)
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

  // fallback caso Spotify não tenha preview_url
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
  this.hasRealLRC = false        // ← ADICIONAR
  this.lyricsTimeScale = 1       // ← ADICIONAR (default)
  this.resetScore()

  await this.loadLyricsForCurrentSong()

  // ← ADICIONAR AQUI: após carregar letras, calcular escala
  this.calculateLyricsTimeScale()
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
          // Silencioso - normal quando não há fala
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

      if (this.micActive) {
        requestAnimationFrame(() => this.analyzeAudio())
      }
    },

 checkSingingAccuracy(transcript) {
  if (!this.processedLyrics.length) return

  const match = this.findBestLyricMatch(transcript)
  if (!match) return

  const matchedLine = this.processedLyrics[match.index]
  if (!matchedLine) return

  // ← CORREÇÃO: Calcular offset usando tempo ESCALADO
const scaledCurrentTime =
  this.previewStartOffset +
  (this.currentTime * this.lyricsTimeScale)
  const rawOffset = matchedLine.time - scaledCurrentTime
  const maxCorrection = 5 // máximo 5 segundos na escala da letra
  
  let newOffset = rawOffset
  if (Math.abs(rawOffset) > maxCorrection) {
    // Correção muito grande = provavelmente erro de reconhecimento
    newOffset = this.lyricsSyncOffset + (rawOffset - this.lyricsSyncOffset) * 0.3
  } else {
    // Correção pequena = confiável, aplicar média móvel
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

    let points = 100
    if (match.score >= 0.90) points = 160
    else if (match.score >= 0.80) points = 130

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

    calculateSimilarity(str1, str2) {
      const clean1 = str1.toLowerCase().replace(/[^\\w\\s]/g, '')
      const clean2 = str2.toLowerCase().replace(/[^\\w\\s]/g, '')

      const words1 = clean1.split(/\\s+/)
      const words2 = clean2.split(/\\s+/)

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

    togglePlay() {
      if (!this.audioPreviewUrl) {
        alert('Nenhum preview disponível.')
        return
      }

      this.isPlaying = !this.isPlaying

      if (this.isPlaying) {
        this.$refs.audioPlayer?.play()
        this.startPlaybackLoop()
        if (this.withMicrophone && !this.micActive) this.startMicrophone()
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
      this.syncLyricsWithAudio()
    },

  syncLyricsWithAudio() {
  if (this.processedLyrics.length === 0) return

  // Se acabou de corrigir por voz, dê uma pausa
  if (this.withMicrophone && Date.now() - this.lastSpeechSyncAt < 1200) {
    return
  }

  // ← CORREÇÃO: Aplicar escala de tempo + offset
const scaledTime =
  this.previewStartOffset +
  (this.currentTime * this.lyricsTimeScale) +
  this.lyricsSyncOffset

  let newLineIndex = this.currentLineIndex

  // Procurar a linha ativa no tempo escalado
  for (let i = 0; i < this.processedLyrics.length; i++) {
    const line = this.processedLyrics[i]
    const nextLine = this.processedLyrics[i + 1]

    const lineStart = line.time - 0.3
    const lineEnd = nextLine ? nextLine.time : Number.MAX_SAFE_INTEGER

    if (scaledTime >= lineStart && scaledTime < lineEnd) {
      newLineIndex = i
      break
    }
  }

  // ← CORREÇÃO: Se passou do final da letra, voltar para o início (loop da letra)
  const lastLine = this.processedLyrics[this.processedLyrics.length - 1]
  if (scaledTime >= lastLine.time + lastLine.duration) {
    newLineIndex = 0
  }

  // Suavizar transição
  if (newLineIndex !== this.currentLineIndex) {
    const diff = Math.abs(newLineIndex - this.currentLineIndex)

    if (diff > 3) {
      this.currentLineIndex = newLineIndex
    } else {
      const direction = newLineIndex > this.currentLineIndex ? 1 : -1
      this.currentLineIndex += direction
    }
  }
},

    onAudioTimeUpdate() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      this.currentTime = audio.currentTime
      this.duration = audio.duration || this.duration
      this.progressPercent = (this.currentTime / this.duration) * 100
      this.syncLyricsWithAudio()
    },

onAudioLoaded() {
  const audio = this.$refs.audioPlayer
  if (audio) {
    // ← CORREÇÃO: Não sobrescrever duration! Manter o previewDuration (30s)
    // this.duration = audio.duration  // REMOVIDO
    audio.volume = this.volume / 100
    audio.playbackRate = this.playbackRate
  }
},

handleAudioEnded() {
  // NÃO resetar nada! O <audio loop> já cuida do loop nativamente.
  // Apenas verificar se realmente parou (não loopou)
  const audio = this.$refs.audioPlayer
  if (audio && audio.paused) {
    this.isPlaying = false
  }
  // REMOVIDO: this.currentTime = 0
  // REMOVIDO: this.progressPercent = 0
  // REMOVIDO: this.lyricsSyncOffset = 0
  // REMOVIDO: this.lastSpeechSyncAt = 0
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

    goBack() {
      this.showSongSelection = true
      this.stopPlayback()
      this.stopMicrophone()
    },

    stopPlayback() {
      this.isPlaying = false
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      this.stopPlaybackLoop()
      this.stopMicrophone()
    },

    formatTime(seconds) {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
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

/* ============ MODO DE JOGO - DESTAQUE MELHORADO ============ */

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

/* ============ SEARCH ============ */

.search-wrapper-selection {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 32px;
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

/* ============ SONGS GRID ============ */

.songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
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
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.difficulty-badge.easy { background: #22c55e; color: #000; }
.difficulty-badge.medium { background: #f59e0b; color: #000; }
.difficulty-badge.hard { background: #ef4444; }

/* ============ NO RESULTS - HORIZONTAL ============ */

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

/* ============ EMPTY STATE - DIGITE ALGO ============ */

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

.lyrics-wrapper {
  /* will-change: transform; */
  /* transform: translateZ(0); */
  /* transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); */
  padding: 160px 0;  /* espaço para scroll no topo e embaixo */
}

.lyric-line {
  text-align: center;
  padding: 16px 20px;
  position: relative;
  opacity: 0.25;
  transform: scale(0.92);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-height: 60px;  /* altura mínima para consistência */
  display: flex;
  align-items: center;
  justify-content: center;
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
  overflow-y: auto;        /* ← MUDAR de hidden para auto */
  overflow-x: hidden;
  scroll-behavior: smooth;
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
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

.lyric-line.correct .lyric-text {
  color: #1DB954;
  text-shadow: 0 0 20px rgba(29, 185, 84, 0.5);
}

.lyric-line.wrong .lyric-text {
  color: #e74c3c;
  text-shadow: 0 0 20px rgba(231, 76, 60, 0.5);
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
}

.setting-item.checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #1DB954;
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
}
</style>