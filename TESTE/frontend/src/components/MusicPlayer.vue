<template>
  <div class="music-player" v-if="currentTrack">
    <!-- Lado esquerdo: Info da música -->
    <div class="player-left">
      <div class="cover-container">
        <img 
          :src="currentTrack.cover" 
          class="player-cover" 
          :class="{ 'spinning': isPlaying }"
          @error="handleImageError"
        />
        <div class="playing-indicator" v-show="isPlaying">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div class="track-info">
        <span class="track-title">{{ currentTrack.title }}</span>
        <span class="track-artist">{{ currentTrack.artist }}</span>
      </div>

      <button 
        @click="toggleLike" 
        class="like-btn" 
        :class="{ liked: isLiked }"
        title="Curtir"
      >
        <i :class="isLiked ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
      </button>
    </div>

    <!-- Centro: Controles principais -->
    <div class="player-center">
      <div class="controls">
        <button 
          @click="prevTrack" 
          class="control-btn"
          :disabled="currentIndex <= 0"
          title="Anterior"
        >
          <i class="fa fa-step-backward"></i>
        </button>

        <button 
          class="play-btn main-play-btn" 
          @click="togglePlay"
          :class="{ 'playing': isPlaying }"
          :title="isPlaying ? 'Pausar' : 'Tocar'"
        >
          <i :class="isPlaying ? 'fa fa-pause' : 'fa fa-play'"></i>
        </button>

        <button 
          @click="nextTrack" 
          class="control-btn"
          title="Próxima"
        >
          <i class="fa fa-step-forward"></i>
        </button>

        <button 
          @click="toggleRepeat" 
          :class="{ active: repeatMode }"
          class="control-btn repeat-btn"
          title="Repetir"
        >
          <i :class="repeatMode ? 'fa fa-repeat' : 'fa fa-long-arrow-right'"></i>
        </button>
      </div>

      <div class="progress-container">
        <span class="time current">{{ formatTime(currentTime) }}</span>

        <div 
          class="progress-bar-wrapper" 
          @click="seekTo"
          ref="progressBar"
        >
          <div class="progress-bg"></div>
          <div 
            class="progress-fill" 
            :style="{ width: progressPercent + '%' }"
          ></div>
          <div 
            class="progress-handle" 
            :style="{ left: progressPercent + '%' }"
          ></div>
          <input
            type="range"
            min="0"
            :max="duration || 100"
            :value="currentTime"
            @input="onSeekInput"
            @change="onSeekChange"
            class="progress-input"
          />
        </div>

        <span class="time total">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Direita: Volume -->
    <div class="player-right">
      <button 
        @click="toggleMute" 
        class="mute-btn"
        title="Volume"
      >
        <i :class="volumeIcon"></i>
      </button>

      <div class="volume-section">
        <div 
          class="volume-bar-wrapper" 
          @click="setVolume"
          ref="volumeBar"
        >
          <div class="volume-bg"></div>
          <div 
            class="volume-fill" 
            :style="{ width: (isMuted ? 0 : volume) * 100 + '%' }"
          ></div>
          <div 
            class="volume-handle" 
            :style="{ left: (isMuted ? 0 : volume) * 100 + '%' }"
          ></div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            @input="onVolumeInput"
            class="volume-input"
          />
        </div>
      </div>
    </div>

    <!-- ÁUDIO - ELEMENTO CRÍTICO -->
    <audio
      ref="audioPlayer"
      :src="currentTrack.url"
      @play="onAudioPlay"
      @pause="onAudioPause"
      @ended="onAudioEnded"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @canplay="onCanPlay"
      @error="onAudioError"
      preload="auto"
      crossorigin="anonymous"
    ></audio>
  </div>
  
  <!-- ESTADO VAZIO -->
  <div v-else class="music-player-empty">
    <div class="empty-content">
      <i class="fa fa-music"></i>
      <span>Nenhuma música tocando</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicPlayer',

  data() {
    return {
      queue: [],
      currentIndex: 0,
      
      // Estado do player
      isPlaying: false,
      isLiked: false,
      isMuted: false,
      isDragging: false,
      isLoading: false,
      
      // Progresso
      currentTime: 0,
      duration: 0,
      canPlay: false,
      
      // Volume
      volume: 0.7,
      previousVolume: 0.7,
      
      // Configurações
      repeatMode: false,
      
      // Controle
      hasTrack: false,
      playPromise: null
    }
  },

  computed: {
    currentTrack() {
      if (!this.hasTrack || this.queue.length === 0) return null
      return this.queue[this.currentIndex] || null
    },
    
    progressPercent() {
      if (!this.duration || this.duration === 0) return 0
      return (this.currentTime / this.duration) * 100
    },
    
    volumeIcon() {
      if (this.isMuted || this.volume === 0) return 'fa fa-volume-off'
      if (this.volume < 0.3) return 'fa fa-volume-down'
      return 'fa fa-volume-up'
    }
  },

  mounted() {
    console.log('🎵 MusicPlayer montado - Aguardando música...')
    
    // Configurar volume inicial
    this.$nextTick(() => {
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.volume = this.volume
      }
    })
    
    // Eventos globais
    window.addEventListener('play-song', this.handlePlaySong)
    window.addEventListener('playlist-playback-started', this.handlePlaylistPlayback)
  },

  beforeDestroy() {
    window.removeEventListener('play-song', this.handlePlaySong)
    window.removeEventListener('playlist-playback-started', this.handlePlaylistPlayback)
  },

  methods: {
    // 🎵 HANDLERS DE EVENTOS GLOBAIS
    handlePlaySong(e) {
      console.log('📥 Evento play-song recebido:', e.detail)
      this.loadSongFromEvent(e.detail)
    },

    handlePlaylistPlayback(e) {
      console.log('📥 Evento playlist-playback-started recebido:', e.detail)
      this.loadSongFromEvent(e.detail)
    },

    // 🎵 CARREGAR MÚSICA DO EVENTO
    loadSongFromEvent({ song, playlist, index }) {
      // Atualizar playlist
      if (playlist && Array.isArray(playlist) && playlist.length > 0) {
        this.queue = [...playlist]
      } else if (song) {
        this.queue = [song]
      }
      
      // Definir índice
      this.currentIndex = (index !== undefined) ? index : 0
      
      // Marcar que tem música
      this.hasTrack = true
      
      console.log('🎵 Carregando música:', this.queue[this.currentIndex]?.title)
      
      // Resetar estado
      this.isPlaying = false
      this.canPlay = false
      this.currentTime = 0
      this.duration = 0
      
      // Carregar e tocar
      this.$nextTick(() => {
        this.loadAndPlay()
      })
    },

    // 🎵 CARREGAR E TOCAR (CORRIGIDO)
    async loadAndPlay() {
      const audio = this.$refs.audioPlayer
      if (!audio) {
        console.error('❌ Elemento de áudio não encontrado!')
        return
      }
      
      console.log('🔄 Carregando áudio:', this.currentTrack.url)
      
      // Se houver uma promise pendente, aguardar
      if (this.playPromise) {
        try {
          await this.playPromise
        } catch (e) {
          // Ignorar erros de abort
        }
      }
      
      // Pausar primeiro
      audio.pause()
      this.isPlaying = false
      
      // Forçar recarregamento do src
      audio.load()
      
      // Tentar tocar após pequeno delay para garantir carregamento
      setTimeout(() => {
        this.attemptPlay()
      }, 100)
    },

    // 🎵 TENTAR TOCAR COM TRATAMENTO ROBUSTO
    async attemptPlay() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      
      console.log('▶️ Tentando tocar... Estado:', audio.readyState)
      
      // Verificar se pode tocar
      if (audio.readyState < 2) {
        console.log('⏳ Áudio não pronto, aguardando canplay...')
        return
      }
      
      try {
        this.isLoading = true
        
        // GUARDAR A PROMISE - ISSO É CRÍTICO
        this.playPromise = audio.play()
        
        await this.playPromise
        
        // Só atualizar estado se a promise resolver com sucesso
        console.log('✅ Tocando com sucesso!')
        this.isPlaying = true
        this.isLoading = false
        
        // Notificar
        this.notifyPlayerUpdate()
        
      } catch (err) {
        console.error('❌ Erro ao tocar:', err.name, err.message)
        this.isPlaying = false
        this.isLoading = false
        
        if (err.name === 'NotAllowedError') {
          console.log('⚠️ Autoplay bloqueado - interação do usuário necessária')
          alert('Clique no botão play para iniciar a música (autoplay bloqueado pelo navegador)')
        } else if (err.name === 'NotSupportedError') {
          console.error('❌ Formato de áudio não suportado')
          alert('Formato de áudio não suportado')
        }
      } finally {
        this.playPromise = null
      }
    },

    // 🎵 TOGGLE PLAY/PAUSE (CORRIGIDO)
    async togglePlay() {
      const audio = this.$refs.audioPlayer
      if (!audio || !this.currentTrack) return
      
      console.log('🎮 Toggle play. Estado atual:', this.isPlaying, 'Paused:', audio.paused)
      
      // Se há uma promise pendente, aguardar
      if (this.playPromise) {
        console.log('⏳ Aguardando promise pendente...')
        try {
          await this.playPromise
        } catch (e) {
          // Ignorar
        }
      }
      
      if (this.isPlaying) {
        // PAUSAR
        console.log('⏸️ Pausando...')
        audio.pause()
        this.isPlaying = false
        
      } else {
        // TOCAR
        console.log('▶️ Iniciando reprodução...')
        
        if (audio.ended) {
          audio.currentTime = 0
        }
        
        try {
          this.playPromise = audio.play()
          await this.playPromise
          this.isPlaying = true
          console.log('✅ Reprodução iniciada!')
        } catch (err) {
          console.error('❌ Erro ao tocar:', err)
          this.isPlaying = false
        } finally {
          this.playPromise = null
        }
      }
      
      this.notifyPlayerUpdate()
    },

    // 🎵 EVENTOS DO ÁUDIO (SINCRONIZAÇÃO DE ESTADO)
    onAudioPlay() {
      console.log('🔊 Evento: play disparado')
      // Só atualizar se não estivermos no meio de uma operação
      if (!this.playPromise) {
        this.isPlaying = true
      }
    },

    onAudioPause() {
      console.log('🔇 Evento: pause disparado')
      if (!this.playPromise) {
        this.isPlaying = false
      }
    },

    onCanPlay() {
      console.log('✅ Evento: canplay - áudio pronto')
      this.canPlay = true
      
      // Se deveria estar tocando mas não está, tentar tocar
      const audio = this.$refs.audioPlayer
      if (audio && audio.paused && this.hasTrack) {
        console.log('🔄 Auto-play após canplay')
        this.attemptPlay()
      }
    },

    onAudioEnded() {
      console.log('⏹️ Evento: ended')
      this.isPlaying = false
      
      if (this.repeatMode) {
        const audio = this.$refs.audioPlayer
        audio.currentTime = 0
        this.attemptPlay()
      } else {
        this.nextTrack()
      }
    },

    onAudioError(e) {
      console.error('❌ Erro no áudio:', e)
      this.isPlaying = false
      this.isLoading = false
    },

    onTimeUpdate() {
      const audio = this.$refs.audioPlayer
      if (audio && !this.isDragging) {
        this.currentTime = audio.currentTime
      }
    },

    onLoadedMetadata() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        this.duration = audio.duration || this.currentTrack?.duration || 0
        console.log('📊 Duração carregada:', this.duration)
      }
    },

    // 🎵 NAVEGAÇÃO
    prevTrack() {
      const audio = this.$refs.audioPlayer
      
      if (this.currentTime > 3) {
        audio.currentTime = 0
        this.currentTime = 0
        return
      }
      
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.loadAndPlay()
      }
    },

    nextTrack() {
      if (this.currentIndex < this.queue.length - 1) {
        this.currentIndex++
        this.loadAndPlay()
      } else if (this.repeatMode) {
        this.currentIndex = 0
        this.loadAndPlay()
      }
    },

    // 🎵 CONTROLES
    toggleLike() {
      this.isLiked = !this.isLiked
    },

    toggleRepeat() {
      this.repeatMode = !this.repeatMode
    },

    toggleMute() {
      const audio = this.$refs.audioPlayer
      
      if (this.isMuted) {
        this.volume = this.previousVolume || 0.7
        this.isMuted = false
        if (audio) audio.volume = this.volume
      } else {
        this.previousVolume = this.volume
        this.volume = 0
        this.isMuted = true
        if (audio) audio.volume = 0
      }
    },

    // 🎵 SEEK
    onSeekInput(e) {
      this.isDragging = true
      this.currentTime = parseFloat(e.target.value)
    },

    onSeekChange(e) {
      this.isDragging = false
      const time = parseFloat(e.target.value)
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.currentTime = time
        this.currentTime = time
      }
    },

    seekTo(e) {
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const time = percent * this.duration
      
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.currentTime = time
        this.currentTime = time
      }
    },

    // 🎵 VOLUME
    onVolumeInput(e) {
      const vol = parseFloat(e.target.value)
      this.volume = vol
      this.isMuted = (vol === 0)
      
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.volume = vol
      }
    },

    setVolume(e) {
      const rect = this.$refs.volumeBar.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const vol = Math.max(0, Math.min(1, percent))
      
      this.volume = vol
      this.isMuted = (vol === 0)
      
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.volume = vol
      }
    },

    // 🎵 UTILIDADES
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "0:00"
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },

    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMTgxODE4Ii8+PHRleHQgeD0iMzAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMxZGI5NTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJoTwvdGV4dD48L3N2Zz4='
    },

    notifyPlayerUpdate() {
      window.dispatchEvent(new CustomEvent('player-update', {
        detail: { isPlaying: this.isPlaying }
      }))
    },

    stop() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      this.isPlaying = false
      this.hasTrack = false
      this.queue = []
      this.currentIndex = 0
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

.music-player {
  position: fixed;
  bottom: 0;
  right: 0;
  height: 90px;
  background: linear-gradient(180deg, #0a0a1a 0%, #050508 100%);
  border-top: 1px solid rgba(37, 99, 235, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 999;
  font-family: 'Segoe UI', system-ui, sans-serif;
  animation: slideUp 0.3s ease;
}

.music-player-empty {
  position: fixed;
  bottom: 0;
  right: 0;
  height: 70px;
  background: linear-gradient(180deg, #0a0a1a 0%, #050508 100%);
  border-top: 1px solid rgba(37, 99, 235, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.music-player,
.music-player-empty {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  transition: left 0.3s ease;
}

.empty-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 14px;
}

.empty-content i {
  font-size: 20px;
  color: #2563eb;
  opacity: 0.5;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* LADO ESQUERDO */
.player-left {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 30%;
  min-width: 250px;
}

.cover-container {
  position: relative;
}

.player-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}

.player-cover.spinning {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.playing-indicator {
  position: absolute;
  bottom: -6px;
  right: -6px;
  display: flex;
  gap: 2px;
  background: rgba(37, 99, 235, 0.9);
  padding: 3px 5px;
  border-radius: 3px;
}

.playing-indicator span {
  width: 2px;
  height: 10px;
  background: white;
  border-radius: 1px;
  animation: sound 0.5s ease-in-out infinite;
}

.playing-indicator span:nth-child(2) { animation-delay: 0.1s; }
.playing-indicator span:nth-child(3) { animation-delay: 0.2s; }

@keyframes sound {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

.track-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.track-title {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.like-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s;
  margin-left: 10px;
}

.like-btn:hover {
  color: #ec4899;
  transform: scale(1.1);
}

.like-btn.liked {
  color: #ec4899;
}

/* CENTRO - CONTROLES */
.player-center {
  width: 40%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.2s;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  color: #f8fafc;
  background: rgba(37, 99, 235, 0.1);
}

.control-btn.active {
  color: #2563eb;
}

.control-btn:disabled {
  color: #535353;
  cursor: not-allowed;
}

.main-play-btn {
  font-size: 20px !important;
  width: 42px !important;
  height: 42px !important;
  background: linear-gradient(135deg, #2563eb, #7c3aed) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  transition: all 0.2s ease !important;
}

.main-play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
}

.main-play-btn:active {
  transform: scale(0.95);
}

.main-play-btn.playing {
  background: linear-gradient(135deg, #ec4899, #8b5cf6) !important;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
}

/* Progresso */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 600px;
}

.time {
  color: #94a3b8;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  min-width: 35px;
}

.time.current {
  text-align: right;
}

.progress-bar-wrapper {
  flex: 1;
  position: relative;
  height: 4px;
  cursor: pointer;
  border-radius: 2px;
}

.progress-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 2px;
  pointer-events: none;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.progress-bar-wrapper:hover .progress-handle {
  opacity: 1;
}

.progress-input {
  position: absolute;
  inset: -8px 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

/* LADO DIREITO - VOLUME */
.player-right {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 30%;
  min-width: 150px;
  justify-content: flex-end;
}

.mute-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s;
}

.mute-btn:hover {
  color: #f8fafc;
}

.volume-section {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 136px;
}

.volume-bar-wrapper {
  flex: 1;
  position: relative;
  height: 4px;
  cursor: pointer;
  border-radius: 2px;
}

.volume-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.volume-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 2px;
  pointer-events: none;
  transition: width 0.1s ease;
}

.volume-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  transition: transform 0.2s ease;
  pointer-events: none;
}

.volume-bar-wrapper:hover .volume-handle {
  transform: translate(-50%, -50%) scale(1);
}

.volume-input {
  position: absolute;
  inset: -8px 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

/* Quando sidebar estiver aberto */
.app.sidebar-open .music-player,
.app.sidebar-open .music-player-empty {
  left: 260px;
}

/* Responsivo */
@media (max-width: 1024px) {
  .music-player,
  .music-player-empty {
    left: 220px;
  }
}

@media (max-width: 768px) {
  .music-player,
  .music-player-empty {
    left: 0;
    padding: 0 16px;
  }
  
  .player-left {
    min-width: 150px;
  }
  
  .track-info p {
    display: none;
  }
  
  .player-center {
    max-width: 50%;
  }
  
  .player-right {
    min-width: 100px;
  }
  
  .volume-section {
    display: none;
  }
}

@media (max-width: 480px) {
  .like-btn {
    display: none;
  }
  
  .control-btn:not(.main-play-btn) {
    display: none;
  }
  
  .time {
    font-size: 10px;
    min-width: 30px;
  }
  
  .empty-content span {
    display: none;
  }
}
</style>