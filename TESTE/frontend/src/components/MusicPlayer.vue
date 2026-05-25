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
       spotifyPlayer: null,
    spotifyDeviceId: null,
    isSpotifyPremium: false,
    spotifyMode: false,
      
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
      playPromise: null,
      
      // Controle de histórico
      _trackStartTime: null,
      _totalListenedTime: 0,
      _lastSyncTime: 0,
      _syncInterval: null
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
  
  // Comandos do Dashboard/Chat/Home
  window.addEventListener('player-toggle-play', this.handleTogglePlayCommand)
  window.addEventListener('player-next-track', this.handleNextCommand)
  window.addEventListener('player-prev-track', this.handlePrevCommand)
  
  // 🔥 NOVO: Escutar pausa vinda do Home.vue
  window.addEventListener('player-paused', this.handleExternalPause)
  
  // Iniciar sincronização contínua
  this.startSyncInterval()
},

beforeDestroy() {
  window.removeEventListener('play-song', this.handlePlaySong)
  window.removeEventListener('playlist-playback-started', this.handlePlaylistPlayback)
  window.removeEventListener('player-toggle-play', this.handleTogglePlayCommand)
  window.removeEventListener('player-next-track', this.handleNextCommand)
  window.removeEventListener('player-prev-track', this.handlePrevCommand)
  // 🔥 NOVO: Remover listener de pausa externa
  window.removeEventListener('player-paused', this.handleExternalPause)
  
  this.stopSyncInterval()
},

  methods: {
    async initSpotifyPlayer() {
  if (!this.isLogged || !this.spotifyConnected) return
  if (this.spotifyPlayer) return // Já inicializado

  try {
    const { initSpotifyPlayer } = await import('@/utils/spotifyPlayer.js')
    
    const { player, deviceId } = await initSpotifyPlayer(async () => {
      // Busca token fresco do backend
      const res = await fetch('http://localhost:3002/spotify/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await res.json()
      if (!data.success) throw new Error('Falha no refresh token')
      return data.access_token
    })

    this.spotifyPlayer = player
    this.spotifyDeviceId = deviceId

    // Sincroniza estado
    player.addListener('player_state_changed', (state) => {
      if (!state) return
      this.syncSpotifyState(state)
    })

  } catch (e) {
    console.error('[SPOTIFY] Erro ao inicializar:', e)
    this.showToast('Erro ao conectar player Spotify', 'error')
  }
},

async playSpotifyFullTrack() {
  if (!this.spotifyPlayer || !this.spotifyDeviceId) {
    this.showToast('Spotify não conectado', 'error')
    return
  }

  try {
    // ✅ Busca token fresco
    const tokenRes = await fetch('http://localhost:3002/spotify/refresh', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    const tokenData = await tokenRes.json()
    
    if (!tokenData.success) {
      this.showToast('Token Spotify expirado. Reconecte.', 'error')
      return
    }

    // ✅ CORREÇÃO: Usar o título + artista para busca mais precisa
    const searchQuery = `${this.currentTrack.title} ${this.currentTrack.artist}`
    
    const searchRes = await fetch(
      `http://localhost:3002/spotify/search/full?q=${encodeURIComponent(searchQuery)}&type=track`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    )
    const searchData = await searchRes.json()

    if (searchData.tracks?.items?.[0]) {
      const spotifyTrack = searchData.tracks.items[0]
      
      // ✅ CORREÇÃO: Usar o SDK Player para tocar, não fetch direto
      await this.spotifyPlayer._options.getOAuthToken(async (token) => {
        // Primeiro ativa o device
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            device_ids: [this.spotifyDeviceId],
            play: false
          })
        })
        
        // Depois toca a música
        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${this.spotifyDeviceId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              uris: [`spotify:track:${spotifyTrack.id}`]
            })
          }
        )
      })

      this.spotifyMode = true
      this.isPlaying = true
      this.duration = this.currentTrack.duration || 30
      
      // ✅ CORREÇÃO: Atualizar UI com dados reais do Spotify
      this.currentTrack = {
        ...this.currentTrack,
        id: spotifyTrack.id,
        title: spotifyTrack.name,
        artist: spotifyTrack.artists.map(a => a.name).join(', '),
        cover: spotifyTrack.album?.images?.[0]?.url || this.currentTrack.cover,
        duration: spotifyTrack.duration_ms / 1000
      }
      
      console.log('✅ Tocando via Spotify SDK:', spotifyTrack.name)
    } else {
      this.showToast('Música não encontrada no Spotify', 'warning')
      setTimeout(() => this.nextTrack(), 1500)
    }
  } catch (e) {
    console.error('[SPOTIFY] Erro ao tocar full track:', e)
    this.showToast('Erro ao tocar no Spotify', 'error')
    this.spotifyMode = false
  }
},

showToast(message, type = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type }
  }))
},
    handlePrevCommand() {
      console.log('🎮 Comando prev recebido')
      this.prevTrack()
    },

    // 🔥 NOVO: Handler para pausa vinda de outros componentes (Home.vue)
handleExternalPause(e) {
  const { source } = e.detail || {}
  console.log(`⏸️ MusicPlayer: Pausa externa recebida de ${source || 'desconhecido'}`)
  
  // Se está em modo Spotify
  if (this.spotifyMode && this.spotifyPlayer) {
    this.spotifyPlayer.pause().then(() => {
      this.isPlaying = false
    }).catch(err => console.error('Erro ao pausar Spotify:', err))
    return
  }
  
  // Modo audio element
  const audio = this.$refs.audioPlayer
  if (audio && !audio.paused) {
    audio.pause()
    this.isPlaying = false
    
    // Acumular tempo ouvido
    if (this._trackStartTime) {
      const sessionTime = Date.now() - this._trackStartTime
      this._totalListenedTime += sessionTime
      this._trackStartTime = null
    }
  }
},
    
    // ═══════════════════════════════════════════════════════
    // SINCRONIZAÇÃO COM DASHBOARD/CHAT
    // ═══════════════════════════════════════════════════════

    startSyncInterval() {
      // Envia estado a cada 300ms para sincronizar UI
      this._syncInterval = setInterval(() => {
        this.syncStateToDashboard()
      }, 300)
    },

    stopSyncInterval() {
      if (this._syncInterval) {
        clearInterval(this._syncInterval)
        this._syncInterval = null
      }
    },

    syncStateToDashboard() {
      if (!this.currentTrack) return
      
      const audio = this.$refs.audioPlayer
      if (!audio) return
      
      // Evita enviar se nada mudou significativamente
      const now = Date.now()
      if (now - this._lastSyncTime < 250) return
      
      const progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0
      
      window.dispatchEvent(new CustomEvent('player-state-changed', {
        detail: {
          track: {
            id: this.currentTrack.id,
            title: this.currentTrack.title,
            artist: this.currentTrack.artist,
            cover: this.currentTrack.cover,
            url: this.currentTrack.url,
            duration: this.currentTrack.duration,
            emoji: this.currentTrack.emoji,
            color: this.currentTrack.color
          },
          isPlaying: this.isPlaying,
          currentTime: this.currentTime,
          duration: this.duration,
          progress: progress,
          context: this.currentTrack.source || 'unknown',
          timestamp: now
        }
      }))
      
      this._lastSyncTime = now
    },

    // ═══════════════════════════════════════════════════════
    // COMANDOS EXTERNOS
    // ═══════════════════════════════════════════════════════

    handleTogglePlayCommand() {
      console.log('🎮 Comando toggle-play recebido')
      this.togglePlay()
    },

    handleNextCommand() {
      console.log('⏭️ Comando next recebido')
      this.nextTrack()
    },

    // ═══════════════════════════════════════════════════════
    // HANDLERS DE EVENTOS GLOBAIS
    // ═══════════════════════════════════════════════════════

    handlePlaySong(e) {
      console.log('📥 Evento play-song recebido:', e.detail)
      
      // Notificar que track começou
      const detail = e.detail
      if (detail && detail.song) {
        window.dispatchEvent(new CustomEvent('player-track-started', {
          detail: {
            track: detail.song,
            timestamp: Date.now()
          }
        }))
      }
      
      this.loadSongFromEvent(e.detail)
    },

    handlePlaylistPlayback(e) {
      console.log('📥 Evento playlist-playback-started recebido:', e.detail)
      this.loadSongFromEvent(e.detail)
    },

    // ═══════════════════════════════════════════════════════
    // CARREGAR MÚSICA DO EVENTO
    // ═══════════════════════════════════════════════════════

    loadSongFromEvent({ song, playlist, index, context }) {
      // Se já tinha uma música tocando, registra ela no histórico ANTES de trocar
      if (this.currentTrack && this._trackStartTime) {
        this.notifyTrackEnded(false)
      }

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
      
      // Resetar contadores de histórico
      this._trackStartTime = Date.now()
      this._totalListenedTime = 0
      
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

    // ═══════════════════════════════════════════════════════
    // CARREGAR E TOCAR
    // ═══════════════════════════════════════════════════════

async loadAndPlay() {
  const audio = this.$refs.audioPlayer
  if (!audio) {
    console.error('❌ Elemento de áudio não encontrado!')
    return
  }
  
  const url = this.currentTrack?.url || this.currentTrack?.preview
  
  // 🔥 CORREÇÃO 1: Detectar Spotify full track corretamente
  const isSpotifyFull = this.currentTrack?.source === 'spotify' && 
    (!url || url === 'null' || url === 'undefined' || url === '')
  
  if (isSpotifyFull || this.currentTrack?._fullTrack) {
    console.log('🎵 Detectado Spotify Full Track, tentando SDK...')
    
    // Inicializa player se necessário
    if (!this.spotifyPlayer) {
      await this.initSpotifyPlayer()
    }
    
    // Toca via Spotify SDK
    if (this.spotifyPlayer && this.spotifyDeviceId) {
      await this.playSpotifyFullTrack()
      return
    } else {
      console.warn('⚠️ Spotify SDK não disponível, pulando...')
      this.showToast('Spotify não conectado para tocar música completa', 'warning')
      setTimeout(() => this.nextTrack(), 1500)
      return
    }
  }
  
  console.log('🔄 Carregando áudio:', url)
  
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
  
  // 🔥 GARANTIR QUE O SRC ESTÁ SETADO CORRETAMENTE
  if (audio.src !== url) {
    audio.src = url
  }
  
  // Forçar recarregamento do src
  audio.load()
  
  // Tentar tocar após pequeno delay
  setTimeout(() => {
    this.attemptPlay()
  }, 100)
},

    // ═══════════════════════════════════════════════════════
    // TENTAR TOCAR COM TRATAMENTO ROBUSTO
    // ═══════════════════════════════════════════════════════

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
        
        // Resetar contador quando começa a tocar de verdade
        if (!this._trackStartTime) {
          this._trackStartTime = Date.now()
        }
        
      } catch (err) {
        console.error('❌ Erro ao tocar:', err.name, err.message)
        this.isPlaying = false
        this.isLoading = false
        
        if (err.name === 'NotAllowedError') {
          console.log('⚠️ Autoplay bloqueado - interação do usuário necessária')
        } else if (err.name === 'NotSupportedError') {
          console.error('❌ Formato de áudio não suportado')
        }
      } finally {
        this.playPromise = null
      }
    },

    // ═══════════════════════════════════════════════════════
    // TOGGLE PLAY/PAUSE
    // ═══════════════════════════════════════════════════════

async togglePlay() {
  // Se está em modo Spotify
  if (this.spotifyMode && this.spotifyPlayer) {
    const state = await this.spotifyPlayer.getCurrentState()
    if (state && !state.paused) {
      await this.spotifyPlayer.pause()
      this.isPlaying = false
    } else {
      await this.spotifyPlayer.resume()
      this.isPlaying = true
    }
    return
  }

  // Fallback: modo audio element (seu código atual)
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
        
        // Acumular tempo ouvido
        if (this._trackStartTime) {
          const sessionTime = Date.now() - this._trackStartTime
          this._totalListenedTime += sessionTime
          this._trackStartTime = null
            window.dispatchEvent(new CustomEvent('player-paused', {
    detail: { source: 'musicplayer' }
  }))
        }
        
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
          
          // Retomar contador
          if (!this._trackStartTime) {
            this._trackStartTime = Date.now()
          }
          
          console.log('✅ Reprodução iniciada!')
        } catch (err) {
          console.error('❌ Erro ao tocar:', err)
          this.isPlaying = false
        } finally {
          this.playPromise = null
        }
      }
    },

    // ═══════════════════════════════════════════════════════
    // EVENTOS DO ÁUDIO
    // ═══════════════════════════════════════════════════════

    onAudioPlay() {
      console.log('🔊 Evento: play disparado')
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
      
      const audio = this.$refs.audioPlayer
      if (audio && audio.paused && this.hasTrack) {
        console.log('🔄 Auto-play após canplay')
        this.attemptPlay()
      }
    },

    onAudioEnded() {
      console.log('⏹️ Evento: ended - Música terminou!')
      this.isPlaying = false
      
      // Notificar que a música terminou naturalmente
      this.notifyTrackEnded(true)
      
      if (this.repeatMode) {
        const audio = this.$refs.audioPlayer
        audio.currentTime = 0
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.attemptPlay()
      } else {
        this.nextTrack()
      }
    },

    notifyTrackEnded(naturallyEnded = true) {
      if (!this.currentTrack) return
      
      // Calcular tempo total ouvido
      let listenedDuration = this._totalListenedTime
      
      // Se ainda estava tocando quando terminou, adiciona o tempo da sessão atual
      if (this._trackStartTime) {
        listenedDuration += (Date.now() - this._trackStartTime)
      }
      
      console.log(`📊 Música finalizada. Tempo ouvido: ${Math.round(listenedDuration/1000)}s`)
      
      window.dispatchEvent(new CustomEvent('player-track-ended', {
        detail: {
          track: {
            id: this.currentTrack.id,
            title: this.currentTrack.title,
            artist: this.currentTrack.artist,
            cover: this.currentTrack.cover,
            url: this.currentTrack.url,
            duration: this.currentTrack.duration,
            source: this.currentTrack.source || 'unknown'
          },
          listenedDuration: listenedDuration,
          totalDuration: this.duration * 1000,
          context: this.currentTrack.source || 'unknown',
          naturallyEnded: naturallyEnded,
          timestamp: Date.now()
        }
      }))
      
      // Resetar contadores
      this._trackStartTime = null
      this._totalListenedTime = 0
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

    // ═══════════════════════════════════════════════════════
    // NAVEGAÇÃO
    // ═══════════════════════════════════════════════════════

   async prevTrack() {
  if (this.spotifyMode && this.spotifyPlayer) {
    await this.spotifyPlayer.previousTrack()
    return
  }
      const audio = this.$refs.audioPlayer
      
      if (this.currentTime > 3) {
        audio.currentTime = 0
        this.currentTime = 0
        return
      }
      
      // Registrar música atual antes de trocar
      if (this.currentTrack) {
        this.notifyTrackEnded(false)
      }
      
      if (this.currentIndex > 0) {
        this.currentIndex--
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.loadAndPlay()
      }
    },

async nextTrack() {
  if (this.spotifyMode && this.spotifyPlayer) {
    await this.spotifyPlayer.nextTrack()
    return
  }
      // Registrar música atual antes de trocar
      if (this.currentTrack) {
        this.notifyTrackEnded(false)
      }
      
      if (this.currentIndex < this.queue.length - 1) {
        this.currentIndex++
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.loadAndPlay()
      } else if (this.repeatMode) {
        this.currentIndex = 0
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.loadAndPlay()
      }
    },

    // ═══════════════════════════════════════════════════════
    // CONTROLES
    // ═══════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════
    // SEEK
    // ═══════════════════════════════════════════════════════

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

  async seekTo(e) {
  if (this.spotifyMode && this.spotifyPlayer) {
    // Calcular percentual baseado na posição do clique
    const rect = this.$refs.progressBar.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const positionMs = percent * this.duration * 1000
    await this.spotifyPlayer.seek(positionMs)
    return
  }
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const time = percent * this.duration
      
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.currentTime = time
        this.currentTime = time
      }
    },

    // ═══════════════════════════════════════════════════════
    // VOLUME
    // ═══════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════
    // UTILIDADES
    // ═══════════════════════════════════════════════════════

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "0:00"
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },

    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMTgxODE4Ii8+PHRleHQgeD0iMzAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMxZGI5NTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJoTwvdGV4dD48L3N2Zz4='
    },

    stop() {
      // Registrar no histórico antes de parar
      if (this.currentTrack) {
        this.notifyTrackEnded(false)
      }
      
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      this.isPlaying = false
      this.hasTrack = false
      this.queue = []
      this.currentIndex = 0
      this._trackStartTime = null
      this._totalListenedTime = 0
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

.player-fade-enter-active,
.player-fade-leave-active {
  transition: all 0.4s ease;
}

.player-fade-enter-from,
.player-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.player-fade-enter-to,
.player-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
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

/* Responsivo */
@media (max-width: 1024px) {
  .music-player {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .music-player {
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
}
</style>