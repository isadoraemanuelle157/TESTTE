<template>
  
<!-- 🔥 PLAYER MINIMIZADO (quando fechado) -->
    <transition name="minimize-pop">
      <div
        v-if="currentTrack && isMinimized"
        class="player-minimized"
        @click="expandPlayer"
        title="Expandir player"
      >
        <img
          :src="currentTrack.cover"
          class="minimized-cover"
          :class="{ 'spinning': isPlaying }"
          @error="handleImageError"
        />
        <div class="minimized-info">
          <span class="minimized-title">{{ currentTrack.title }}</span>
          <span class="minimized-artist">{{ currentTrack.artist }}</span>
        </div>
        <div class="minimized-indicator" v-if="isPlaying">
          <span></span><span></span><span></span>
        </div>
        <button class="minimized-expand-btn" @click.stop="expandPlayer">
          <i class="fa fa-chevron-up"></i>
        </button>
      </div>
    </transition>
<div class="music-player" v-if="currentTrack && !isMinimized">
    <!-- 🔥 BOTÃO MINIMIZAR/EXPANDIR -->
    <button
      v-if="!isMinimized"
      @click="minimizePlayer"
      class="minimize-btn"
      title="Minimizar player"
    >
      <i class="fa fa-chevron-down"></i>
    </button>

    

    <!-- CONTEÚDO ORIGINAL DO PLAYER (só aparece quando NÃO minimizado) -->
    <div v-show="!isMinimized" class="player-content">
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

        <!-- 🔥 BOTÕES DE AÇÃO -->
        <div class="track-actions">
          <!-- Curtir (Coração) -->
          <button
            @click="toggleLike"
            class="action-btn like-btn"
            :class="{ liked: isLiked }"
            :disabled="likeLoading"
            title="Curtir"
          >
            <i :class="isLiked ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
          </button>

          <!-- Favoritar (Estrela) -->
          <button
            @click="toggleFavorite"
            class="action-btn favorite-btn"
            :class="{ favorited: isFavorited }"
            :disabled="favoriteLoading"
            title="Favoritar"
          >
            <i :class="isFavorited ? 'fa fa-star' : 'fa fa-star-o'"></i>
          </button>

          <!-- Adicionar à Playlist (+) -->
          <button
            @click="openPlaylistModal"
            class="action-btn add-btn"
            title="Adicionar à playlist"
          >
            <i class="fa fa-plus"></i>
          </button>
        </div>
      </div>

      <!-- Centro: Controles principais -->
      <div class="player-center">
        <div class="controls">
          <!-- 🔥 NOVO: Botão Aleatório (modo de reprodução) -->
          <button
            @click="toggleShuffle"
            class="control-btn shuffle-btn"
            :class="{ active: isShuffled }"
            title="Aleatório"
          >
            <i class="fa fa-random"></i>
          </button>

          <button
            @click="prevTrack"
            class="control-btn"
            :disabled="currentIndex <= 0 && !isShuffled"
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

          <!-- 🔥 NOVO: Botão Fila -->
          <button
            @click="toggleQueue"
            class="control-btn queue-toggle-btn"
            :class="{ active: showQueue }"
            title="Fila de reprodução"
          >
            <i class="fa fa-list-ul"></i>
            <span v-if="queue.length > 0" class="queue-badge">{{ queue.length }}</span>
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

      <!-- 🔥 NOVO: Modal da Fila de Reprodução -->
      <transition name="queue-slide">
        <div v-if="showQueue" class="queue-modal">
          <div class="queue-header">
            <h3>Fila de Reprodução</h3>
            <div class="queue-actions">
              <button
                @click="shuffleQueue"
                class="queue-action-btn"
                title="Embaralhar fila"
              >
                <i class="fa fa-random"></i> Embaralhar
              </button>
              <button
                @click="toggleQueue"
                class="queue-close-btn"
                title="Fechar"
              >
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>

          <div class="queue-list">
            <div
              v-for="(track, index) in displayQueue"
              :key="track.id + index"
              class="queue-item"
              :class="{ 'current': track.isCurrent }"
              @click="playFromQueue(index)"
            >
              <img
                :src="track.cover"
                class="queue-item-cover"
                @error="handleImageError"
              />
              <div class="queue-item-info">
                <span class="queue-item-title">{{ track.title }}</span>
                <span class="queue-item-artist">{{ track.artist }}</span>
              </div>
              <div class="queue-item-actions">
                <span v-if="track.isCurrent" class="now-playing">
                  <span></span><span></span><span></span>
                </span>
                <button
                  @click.stop="removeFromQueue(index)"
                  class="queue-remove-btn"
                  title="Remover da fila"
                >
                  <i class="fa fa-trash-o"></i>
                </button>
              </div>
            </div>

            <div v-if="queue.length === 0" class="queue-empty">
              <i class="fa fa-music"></i>
              <p>Nenhuma música na fila</p>
            </div>
          </div>
        </div>
      </transition>

      <!-- 🔥 MODAL: Adicionar à Playlist -->
      <transition name="modal-fade">
        <div v-if="showPlaylistModal" class="playlist-modal-overlay" @click="closePlaylistModal">
          <div class="playlist-modal" @click.stop>
            <div class="modal-header">
              <h3>Adicionar à Playlist</h3>
              <button class="modal-close" @click="closePlaylistModal">
                <i class="fa fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <!-- Loading -->
              <div v-if="playlistModalLoading" class="modal-loading">
                <div class="spinner-small"></div>
                <span>Carregando playlists...</span>
              </div>

              <!-- Lista de Playlists -->
              <div v-else-if="userPlaylists.length > 0" class="playlists-list">
                <div
                  v-for="playlist in userPlaylists"
                  :key="playlist.id"
                  class="playlist-option"
                  @click="addToPlaylist(playlist.id)"
                >
                  <img
                    :src="playlist.capa || fallbackImage"
                    class="playlist-option-cover"
                    @error="handleImageError"
                  />
                  <div class="playlist-option-info">
                    <span class="playlist-option-name">{{ playlist.nome }}</span>
                    <span class="playlist-option-count">
                      {{ playlist.totalMusicas }} {{ playlist.totalMusicas === 1 ? 'música' : 'músicas' }}
                    </span>
                  </div>
                  <button
                    class="playlist-option-add"
                    :disabled="addToPlaylistLoading"
                  >
                    <i class="fa fa-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Sem playlists -->
              <div v-else class="modal-empty">
                <i class="fa fa-music"></i>
                <p>Você não tem playlists ainda</p>
                <button class="btn-create-playlist" @click="goToCreatePlaylist">
                  Criar Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
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
      isPlaying: false,
      isLiked: false,
      spotifyPremium: false,
      spotifyToken: null,
      spotifySdkReady: false,
      spotifyConnected: false,
      isFavorited: false,
      isMuted: false,
      isDragging: false,
      isLoading: false,
      spotifyPlayer: null,
      spotifyDeviceId: null,
      isSpotifyPremium: false,
      spotifyMode: false,
      showQueue: false,
      isShuffled: false,
      originalQueue: [],
      shuffledIndices: [],
      likeLoading: false,
      favoriteLoading: false,
      showPlaylistModal: false,
      userPlaylists: [],
      playlistModalLoading: false,
      addToPlaylistLoading: false,
      isLogged: false,
      currentTime: 0,
      duration: 0,
      canPlay: false,
      volume: 0.7,
      previousVolume: 0.7,
      repeatMode: false,
      hasTrack: false,
      playPromise: null,
      isMinimized: false,
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
    },
    displayQueue() {
      return this.queue.map((track, index) => ({
        ...track,
        queueIndex: index,
        isCurrent: index === this.currentIndex
      }))
    },
    isExternalTrack() {
      if (!this.currentTrack) return false
      const source = (this.currentTrack.source || '').toLowerCase()
      if (source && source !== 'local') {
        return true
      }
      const id = String(this.currentTrack.id || '')
      const isMongoId = /^[a-f\d]{24}$/i.test(id)
      return !isMongoId
    },
    currentTrackSource() {
      if (!this.currentTrack) return 'local'
      const source = (this.currentTrack.source || '').toLowerCase()
      if (source) return source
      const id = String(this.currentTrack.id || '')
      const isMongoId = /^[a-f\d]{24}$/i.test(id)
      return isMongoId ? 'local' : 'spotify'
    }
  },

  mounted() {
    console.log('🎵 MusicPlayer montado - Aguardando música...')
    this.checkLoginStatus()
    this.checkLikeStatus()
    this.checkFavoriteStatus()
    if (this.isLogged) {
      this.checkSpotifyStatus()
    }

    this.$nextTick(() => {
      const audio = this.$refs.audioPlayer
      if (audio) audio.volume = this.volume
    })

    window.addEventListener('play-song', this.handlePlaySong)
    window.addEventListener('playlist-playback-started', this.handlePlaylistPlayback)
    window.addEventListener('player-toggle-play', this.handleTogglePlayCommand)
    window.addEventListener('player-next-track', this.handleNextCommand)
    window.addEventListener('player-prev-track', this.handlePrevCommand)
    window.addEventListener('player-paused', this.handleExternalPause)
    window.addEventListener('favoritas-updated', this.checkFavoriteStatus)
    window.addEventListener('curtidas-updated', this.checkLikeStatus)

    this.startSyncInterval()

    // 🔥 RESTAURAR ESTADO MINIMIZADO
    const savedMinimized = localStorage.getItem('musicplayer_minimized')
    if (savedMinimized === 'true') {
      this.isMinimized = true
    }
    if (this.isLogged && this.spotifyConnected) {
    this.initSpotifyPlayer()
  }
  },

  watch: {
  // ... watch existentes ...
  
  spotifyConnected(newVal) {
    if (newVal && this.isLogged && !this.spotifyPlayer) {
      console.log('[PLAYER] Spotify conectado detectado, inicializando player...')
      this.initSpotifyPlayer()
    }
  }
},

  beforeDestroy() {
    window.removeEventListener('play-song', this.handlePlaySong)
    window.removeEventListener('playlist-playback-started', this.handlePlaylistPlayback)
    window.removeEventListener('player-toggle-play', this.handleTogglePlayCommand)
    window.removeEventListener('player-next-track', this.handleNextCommand)
    window.removeEventListener('player-prev-track', this.handlePrevCommand)
    window.removeEventListener('player-paused', this.handleExternalPause)
    window.removeEventListener('favoritas-updated', this.checkFavoriteStatus)
    window.removeEventListener('curtidas-updated', this.checkLikeStatus)
    this.stopSyncInterval()
    if (this.spotifyPlayer) {
      this.spotifyPlayer.disconnect()
    }
  },

  methods: {
    updateCurrentTrack(patch = {}) {
  if (!this.queue.length || this.currentIndex < 0 || this.currentIndex >= this.queue.length) return

  const updated = {
    ...this.queue[this.currentIndex],
    ...patch
  }

  this.queue.splice(this.currentIndex, 1, updated)
},

async waitForSpotifyDevice(timeout = 15000) {
  const start = Date.now()

  while (!this.spotifyDeviceId) {
    if (Date.now() - start > timeout) {
      throw new Error('Timeout aguardando device do Spotify')
    }
    await new Promise(resolve => setTimeout(resolve, 200))
  }
},

async activateSpotifyElement() {
  if (this.spotifyPlayer && typeof this.spotifyPlayer.activateElement === 'function') {
    try {
      await this.spotifyPlayer.activateElement()
    } catch (err) {
      console.warn('[SPOTIFY] activateElement falhou:', err?.message || err)
    }
  }
},

async transferPlaybackToSdk(spotifyUri, positionMs = 0) {
  const token = localStorage.getItem('token')

  const res = await fetch('http://localhost:3002/spotify/transfer-playback', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      device_id: this.spotifyDeviceId,
      uris: [spotifyUri],
      position_ms: positionMs
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || err.error || 'Erro ao transferir playback')
  }

  return res.json().catch(() => ({}))
},

    minimizePlayer() {
      this.isMinimized = true
      localStorage.setItem('musicplayer_minimized', 'true')
      this.showToast('Player minimizado', 'info')
    },

    expandPlayer() {
      this.isMinimized = false
      localStorage.setItem('musicplayer_minimized', 'false')
    },

    async registrarHistorico(track, extraData = {}) {
      if (!track) {
        console.warn('⚠️ registrarHistorico chamado sem track')
        return
      }

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.warn('⚠️ Sem token, histórico não registrado')
          return
        }

        const musicaId = String(track.id || track._id || track.musicaId || '')
        if (!musicaId || musicaId === 'undefined' || musicaId === 'null') {
          console.error('❌ ID da música inválido:', track)
          return
        }

        const body = {
          musicaId: musicaId,
          titulo: track.title || track.nome || track.titulo || 'Sem título',
          artista: track.artist || track.artista || 'Desconhecido',
          capa: track.cover || track.capa || track.foto || '',
          source: (track.source || 'local').toLowerCase(),
          tipo: track.type || 'musica',
          ...extraData
        }

        console.log('📤 Enviando histórico:', body)

        const res = await fetch('http://localhost:3002/historico/reproducao', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        })

        if (!res.ok) {
          const errText = await res.text()
          console.error('❌ Erro ao registrar histórico:', res.status, errText)
        } else {
          const data = await res.json()
          console.log('✅ Histórico registrado:', data)
        }

      } catch (err) {
        console.error('❌ Erro ao registrar histórico:', err)
      }
    },

    goToCreatePlaylist() {
      this.closePlaylistModal()
      this.$router?.push('/playlist').catch(() => {})
    },

async initSpotifyPlayer() {
  if (!this.isLogged || !this.spotifyConnected) return
  if (this.spotifyPlayer && this.spotifyDeviceId) return
  if (this._spotifyInitPromise) return this._spotifyInitPromise

  this._spotifyInitPromise = (async () => {
    if (!window.Spotify) {
      await new Promise((resolve, reject) => {
        if (window.SpotifySDKReady && window.Spotify) {
          resolve()
          return
        }

        const onReady = () => {
          window.removeEventListener('spotify-sdk-ready', onReady)
          resolve()
        }

        window.addEventListener('spotify-sdk-ready', onReady)

        setTimeout(() => {
          window.removeEventListener('spotify-sdk-ready', onReady)
          if (window.Spotify) resolve()
          else reject(new Error('Spotify SDK não carregado'))
        }, 15000)
      })
    }

    let readyResolved = false

    this.spotifyPlayer = new window.Spotify.Player({
      name: 'SoundUp Music',
      getOAuthToken: async (cb) => {
        try {
          const token = await this.fetchUserSpotifyToken()
          cb(token || '')
        } catch (err) {
          console.error('[SPOTIFY] Erro ao obter token:', err)
          cb('')
        }
      },
      volume: this.volume
    })

    const readyPromise = new Promise((resolve, reject) => {
      this.spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('[SPOTIFY] Device pronto:', device_id)
        this.spotifyDeviceId = device_id
        this.spotifySdkReady = true
        readyResolved = true
        resolve(device_id)
      })

      this.spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.warn('[SPOTIFY] Device offline:', device_id)
        if (this.spotifyDeviceId === device_id) {
          this.spotifyDeviceId = null
        }
        this.spotifySdkReady = false
      })

      this.spotifyPlayer.addListener('player_state_changed', (state) => {
        if (!state) return
        this.syncSpotifyState(state)
      })

      this.spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error('[SPOTIFY] Init error:', message)
        if (!readyResolved) reject(new Error(message))
      })

      this.spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error('[SPOTIFY] Auth error:', message)
        if (!readyResolved) reject(new Error(message))
      })

      this.spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error('[SPOTIFY] Account error:', message)
        this.showToast('Spotify Premium necessário para streaming completo', 'warning')
      })

      this.spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error('[SPOTIFY] Playback error:', message)
      })
    })

    const connected = await this.spotifyPlayer.connect()

    if (!connected) {
      throw new Error('spotifyPlayer.connect() retornou false')
    }

    await readyPromise
  })()

  try {
    await this._spotifyInitPromise
  } finally {
    this._spotifyInitPromise = null
  }
},

async playSpotifyFullTrack() {
  try {
    await this.initSpotifyPlayer()
    await this.waitForSpotifyDevice()
    await this.activateSpotifyElement()

    const track = this.currentTrack
    if (!track) return

    const spotifyId = track.spotifyId || track.id
    if (!spotifyId) {
      throw new Error('Track do Spotify sem id')
    }

    const spotifyUri = track.uri || `spotify:track:${spotifyId}`

    await this.transferPlaybackToSdk(spotifyUri, Math.floor((this.currentTime || 0) * 1000))

    this.spotifyMode = true
    this.isPlaying = true

    this.updateCurrentTrack({
      spotifyId,
      uri: spotifyUri,
      source: 'spotify_full',
      url: '',
      preview: track.preview || ''
    })

    console.log('✅ Tocando via Spotify Web Playback SDK:', spotifyUri)
  } catch (e) {
    console.error('[SPOTIFY] Erro ao tocar full track:', e)
    this.showToast(e.message || 'Erro ao tocar no Spotify', 'error')
    this.spotifyMode = false

    if (this.currentTrack?.preview && this.currentTrack.preview !== 'null') {
      this.attemptPlay()
    } else {
      setTimeout(() => this.nextTrack(), 1500)
    }
  }
},

syncSpotifyState(state) {
  const prevTime = this.currentTime
  const prevDuration = this.duration
  const wasPlaying = this.isPlaying

  this.spotifyMode = true
  this.isPlaying = !state.paused
  this.currentTime = (state.position || 0) / 1000
  this.duration = (state.duration || 0) / 1000

  const sdkTrack = state.track_window?.current_track
  if (sdkTrack) {
    this.updateCurrentTrack({
      id: sdkTrack.id,
      spotifyId: sdkTrack.id,
      uri: `spotify:track:${sdkTrack.id}`,
      title: sdkTrack.name,
      artist: sdkTrack.artists.map(a => a.name).join(', '),
      cover: sdkTrack.album?.images?.[0]?.url || this.currentTrack?.cover,
      duration: (sdkTrack.duration_ms || 0) / 1000,
      source: 'spotify_full',
      url: ''
    })
  }

  const terminou =
    wasPlaying &&
    state.paused &&
    state.position === 0 &&
    prevDuration > 0 &&
    prevTime >= Math.max(prevDuration - 2, 0)

  if (terminou) {
    this.notifyTrackEnded(true)
    this.nextTrack()
  }
},

    async checkSpotifyStatus() {
      if (!this.isLogged) return
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3002/spotify/status', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        this.spotifyConnected = data.connected && data.tokenValid
      } catch (err) {
        console.error('Erro ao verificar Spotify:', err)
        this.spotifyConnected = false
      }
    },


    async fetchUserSpotifyToken() {
      const res = await fetch('http://localhost:3002/spotify/refresh', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      return data.access_token
    },
    checkLoginStatus() {
      const token = localStorage.getItem('token')
      this.isLogged = !!token
    },

    async checkLikeStatus() {
      if (!this.isLogged || !this.currentTrack) {
        this.isLiked = false
        return
      }
      try {
        const token = localStorage.getItem('token')
        const trackId = this.currentTrack.id
        const sourceParam = this.isExternalTrack ? `?source=${this.currentTrackSource}` : ''
        const res = await fetch(`http://localhost:3002/curtidas/${trackId}/is-curtida${sourceParam}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          this.isLiked = data.liked
        }
      } catch (err) {
        console.error('Erro ao verificar curtida:', err)
      }
    },

    async toggleLike() {
      if (!this.isLogged) {
        this.showToast('Faça login para curtir músicas', 'info')
        return
      }
      if (!this.currentTrack) return
      if (this.likeLoading) return
      this.likeLoading = true
      try {
        const token = localStorage.getItem('token')
        const trackId = this.currentTrack.id
        const body = {}
        if (this.isExternalTrack) {
          body.source = this.currentTrackSource
          body.dadosMusica = {
            titulo: this.currentTrack.title,
            artista: this.currentTrack.artist,
            capa: this.currentTrack.cover || '',
            previewUrl: this.currentTrack.url || this.currentTrack.preview || '',
            duration: this.currentTrack.duration || 30,
            ano: this.currentTrack.ano || null,
            album: this.currentTrack.album || ''
          }
        }
        const res = await fetch(`http://localhost:3002/curtidas/${trackId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Erro ao curtir')
        }
        const data = await res.json()
        this.isLiked = data.liked
        window.dispatchEvent(new Event('curtidas-updated'))
        this.showToast(
          data.liked ? '❤️ Adicionada às curtidas' : '💔 Removida das curtidas',
          'success'
        )
      } catch (err) {
        console.error('Erro ao curtir:', err)
        this.showToast(err.message || 'Erro ao curtir música', 'error')
      } finally {
        this.likeLoading = false
      }
    },

    async checkFavoriteStatus() {
      if (!this.isLogged || !this.currentTrack) {
        this.isFavorited = false
        return
      }
      try {
        const token = localStorage.getItem('token')
        const trackId = this.currentTrack.id
        const params = new URLSearchParams()
        params.append('tipo', 'musica')
        if (this.isExternalTrack) {
          params.append('source', this.currentTrackSource)
        }
        const res = await fetch(`http://localhost:3002/favoritas/${trackId}/is-favorita?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          this.isFavorited = data.isFavorita
        }
      } catch (err) {
        console.error('Erro ao verificar favorita:', err)
      }
    },

    async toggleFavorite() {
      if (!this.isLogged) {
        this.showToast('Faça login para favoritar músicas', 'info')
        return
      }
      if (!this.currentTrack) return
      if (this.favoriteLoading) return
      this.favoriteLoading = true
      try {
        const token = localStorage.getItem('token')
        const trackId = this.currentTrack.id
        const body = {
          tipo: 'musica',
          acao: this.isFavorited ? 'remover' : 'toggle'
        }
        if (this.isExternalTrack) {
          if (this.currentTrackSource === 'deezer') {
            this.showToast('Faça login com Spotify para favoritar itens do Deezer', 'warning')
            this.favoriteLoading = false
            return
          }
          body.source = this.currentTrackSource
          body.tipoItem = 'musica'
          body.dadosMusica = {
            titulo: this.currentTrack.title,
            artista: this.currentTrack.artist,
            capa: this.currentTrack.cover || '',
            previewUrl: this.currentTrack.url || this.currentTrack.preview || '',
            duration: this.currentTrack.duration || 30,
            ano: this.currentTrack.ano || null,
            album: this.currentTrack.album || ''
          }
        }
        const res = await fetch(`http://localhost:3002/favoritas/${trackId}/favoritar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Erro ao favoritar')
        }
        const data = await res.json()
        this.isFavorited = data.favorited
        window.dispatchEvent(new Event('favoritas-updated'))
        this.showToast(
          data.favorited ? '⭐ Adicionada às favoritas' : '☆ Removida das favoritas',
          'success'
        )
      } catch (err) {
        console.error('Erro ao favoritar:', err)
        this.showToast(err.message || 'Erro ao favoritar música', 'error')
      } finally {
        this.favoriteLoading = false
      }
    },

    async openPlaylistModal() {
      if (!this.isLogged) {
        this.showToast('Faça login para adicionar à playlist', 'info')
        return
      }
      if (!this.currentTrack) return
      this.showPlaylistModal = true
      this.playlistModalLoading = true
      this.userPlaylists = []
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3002/playlists', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Erro ao carregar playlists')
        const data = await res.json()
        const playlists = Array.isArray(data) ? data : []
        if (playlists.length === 0) {
          this.showToast('Você não tem nenhuma playlist. Crie uma primeiro!', 'warning')
          setTimeout(() => {
            this.showPlaylistModal = false
          }, 4000)
          return
        }
        this.userPlaylists = playlists.map(p => ({
          id: p._id || p.id,
          nome: p.nome || p.title,
          capa: p.capa || p.image,
          totalMusicas: p.totalMusicas || p.quantidadeMusicas || 0
        }))
      } catch (err) {
        console.error('Erro ao carregar playlists:', err)
        this.showToast('Erro ao carregar playlists', 'error')
        this.showPlaylistModal = false
      } finally {
        this.playlistModalLoading = false
      }
    },

    closePlaylistModal() {
      this.showPlaylistModal = false
      this.userPlaylists = []
    },

    async addToPlaylist(playlistId) {
      if (!this.currentTrack || this.addToPlaylistLoading) return
      this.addToPlaylistLoading = true
      try {
        const token = localStorage.getItem('token')
        const trackId = this.currentTrack.id
        const body = {
          source: this.isExternalTrack ? this.currentTrackSource : 'local'
        }
        if (this.isExternalTrack) {
          body.dadosMusica = {
            titulo: this.currentTrack.title,
            artista: this.currentTrack.artist,
            capa: this.currentTrack.cover || '',
            previewUrl: this.currentTrack.url || this.currentTrack.preview || '',
            duration: this.currentTrack.duration || 30,
            ano: this.currentTrack.ano || null,
            album: this.currentTrack.album || ''
          }
        }
        const res = await fetch(
          `http://localhost:3002/playlists/${playlistId}/musicas/${trackId}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          }
        )
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Erro ao adicionar')
        }
        this.showToast(`"${this.currentTrack.title}" adicionada à playlist!`, 'success')
        this.closePlaylistModal()
        window.dispatchEvent(new Event('playlist-updated'))
      } catch (err) {
        console.error('Erro ao adicionar à playlist:', err)
        this.showToast(err.message || 'Erro ao adicionar à playlist', 'error')
      } finally {
        this.addToPlaylistLoading = false
      }
    },

    toggleQueue() {
      this.showQueue = !this.showQueue
    },

    removeFromQueue(index) {
      if (index < 0 || index >= this.queue.length) return
      if (this.queue.length === 1 && index === this.currentIndex) {
        this.showToast('Não é possível remover a única música da fila', 'warning')
        return
      }
      const wasCurrent = index === this.currentIndex
      this.queue.splice(index, 1)
      if (index < this.currentIndex) this.currentIndex--
      if (wasCurrent) {
        if (this.currentIndex >= this.queue.length) {
          this.currentIndex = this.queue.length - 1
        }
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.loadAndPlay()
      }
      if (this.isShuffled) this.generateShuffledOrder()
      this.showToast('Música removida da fila', 'info')
    },

    shuffleQueue() {
      if (this.queue.length <= 1) {
        this.showToast('Fila muito curta para embaralhar', 'warning')
        return
      }
      const shuffled = [...this.queue]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      if (this.currentTrack && this.isPlaying) {
        const currentTrackId = this.currentTrack.id
        const currentInShuffled = shuffled.findIndex(t => t.id === currentTrackId)
        if (currentInShuffled !== -1 && currentInShuffled !== this.currentIndex) {
          [shuffled[this.currentIndex], shuffled[currentInShuffled]] =
          [shuffled[currentInShuffled], shuffled[this.currentIndex]]
        }
      }
      this.queue = shuffled
      this.showToast('Fila embaralhada!', 'success')
      if (this.isShuffled) this.generateShuffledOrder()
    },

    toggleShuffle() {
      this.isShuffled = !this.isShuffled
      if (this.isShuffled) {
        this.originalQueue = [...this.queue]
        this.generateShuffledOrder()
        this.showToast('Modo aleatório ativado', 'success')
      } else {
        this.queue = [...this.originalQueue]
        this.originalQueue = []
        this.shuffledIndices = []
        this.showToast('Modo aleatório desativado', 'info')
      }
    },

    generateShuffledOrder() {
      const indices = Array.from({ length: this.queue.length }, (_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
      }
      if (this.currentIndex !== undefined && indices.length > 1) {
        const currentPos = indices.indexOf(this.currentIndex)
        if (currentPos !== -1) indices.splice(currentPos, 1)
      }
      this.shuffledIndices = indices
      console.log('🔀 Ordem embaralhada:', this.shuffledIndices)
    },

    playFromQueue(index) {
      if (index < 0 || index >= this.queue.length) return
      if (this.currentTrack) this.notifyTrackEnded(false)
      this.currentIndex = index
      this._trackStartTime = Date.now()
      this._totalListenedTime = 0
      this.loadAndPlay()
      this.registrarHistorico(this.currentTrack)
      if (this.isShuffled) this.generateShuffledOrder()
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

    handleExternalPause(e) {
      const { source } = e.detail || {}
      console.log(`⏸️ MusicPlayer: Pausa externa recebida de ${source || 'desconhecido'}`)
      if (this.spotifyMode && this.spotifyPlayer) {
        this.spotifyPlayer.pause().then(() => {
          this.isPlaying = false
        }).catch(err => console.error('Erro ao pausar Spotify:', err))
        return
      }
      const audio = this.$refs.audioPlayer
      if (audio && !audio.paused) {
        audio.pause()
        this.isPlaying = false
        if (this._trackStartTime) {
          const sessionTime = Date.now() - this._trackStartTime
          this._totalListenedTime += sessionTime
          this._trackStartTime = null
        }
      }
    },

    startSyncInterval() {
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

    handleTogglePlayCommand() {
      console.log('🎮 Comando toggle-play recebido')
      this.togglePlay()
    },

    handleNextCommand() {
      console.log('⏭️ Comando next recebido')
      this.nextTrack()
    },

    handlePlaySong(e) {
      console.log('📥 Evento play-song recebido:', e.detail)
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

    loadSongFromEvent({ song, playlist, index, context, append = false }) {
      if (this.currentTrack && this._trackStartTime && !append) {
        this.notifyTrackEnded(false)
      }
      const normalizedSong = song ? {
        id: song.id || song._id || song.musicaId || '',
        title: song.title || song.nome || song.titulo || 'Sem título',
        artist: song.artist || song.artista || 'Desconhecido',
        cover: song.cover || song.capa || song.foto || '',
        url: song.url || song.preview || song.previewUrl || song.link || '',
        duration: song.duration || song.duracao || 30,
        source: song.source || 'local',
        type: song.type || 'musica',
        album: song.album || '',
        genero: song.genero || song.generos?.[0] || null
      } : null

      if (playlist && Array.isArray(playlist) && playlist.length > 0) {
        const normalizedPlaylist = playlist.map(track => ({
          id: track.id || track._id || track.musicaId || '',
          title: track.title || track.nome || track.titulo || 'Sem título',
          artist: track.artist || track.artista || 'Desconhecido',
          cover: track.cover || track.capa || track.foto || '',
          url: track.url || track.preview || track.previewUrl || track.link || '',
          duration: track.duration || track.duracao || 30,
          source: track.source || 'local',
          type: track.type || 'musica',
          album: track.album || '',
          genero: track.genero || track.generos?.[0] || null
        }))

        if (append) {
          this.queue = [...this.queue, ...normalizedPlaylist]
        } else {
          this.queue = [...normalizedPlaylist]
          this.currentIndex = (index !== undefined) ? index : 0
        }
      } else if (normalizedSong) {
        if (append) {
          this.queue.push(normalizedSong)
          this.showToast('Adicionado à fila', 'success')
          return
        } else {
          this.queue = [normalizedSong]
          this.currentIndex = 0
        }
      }
      this.hasTrack = true
      this._trackStartTime = Date.now()
      this._totalListenedTime = 0
      console.log('🎵 Carregando música:', this.queue[this.currentIndex]?.title)
      this.isPlaying = false
      this.canPlay = false
      this.currentTime = 0
      this.duration = 0
      if (this.isShuffled) {
        this.originalQueue = [...this.queue]
        this.generateShuffledOrder()
      }
      if (!append) {
        this.$nextTick(() => {
          this.loadAndPlay()
        })
      }
      this.$nextTick(() => {
        this.checkLikeStatus()
        this.checkFavoriteStatus()
      })
    },

async loadAndPlay() {
  const track = this.currentTrack
  if (!track) return

  const audio = this.$refs.audioPlayer

  const isSpotifyTrack =
    track.source === 'spotify_full' ||
    track.source === 'spotify' ||
    !!track._fullTrack

  const hasPreview = !!(track.url && track.url !== 'null' && track.url !== 'undefined')

  if (isSpotifyTrack && this.spotifyConnected) {
    await this.playSpotifyFullTrack()
    return
  }

  if (isSpotifyTrack && !this.spotifyConnected && !hasPreview) {
    this.showToast('Conecte o Spotify para ouvir músicas completas', 'warning')
    setTimeout(() => this.nextTrack(), 1500)
    return
  }

  this.spotifyMode = false

  if (!audio) {
    console.error('❌ Elemento de áudio não encontrado')
    return
  }

  audio.pause()
  audio.load()

  this.currentTime = 0
  this.duration = 0
  this.canPlay = false

  this.$nextTick(() => {
    audio.load()
    this.attemptPlay()
  })
},

    async attemptPlay() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
      console.log('▶️ Tentando tocar... Estado:', audio.readyState)
      if (audio.readyState < 2) {
        console.log('⏳ Áudio não pronto, aguardando canplay...')
        return
      }
      try {
        this.isLoading = true
        this.playPromise = audio.play()
        await this.playPromise
        console.log('✅ Tocando com sucesso!')
        this.isPlaying = true
        this.isLoading = false
        if (!this._trackStartTime) this._trackStartTime = Date.now()

        if (this.currentTrack) {
          this.registrarHistorico(this.currentTrack, {
            tempoOuvido: 0,
            reproduzidaAteOFim: false
          })
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

async togglePlay() {
  if (!this.currentTrack) return

  if (this.spotifyMode && this.spotifyPlayer) {
    try {
      await this.activateSpotifyElement()

      const state = await this.spotifyPlayer.getCurrentState()

      if (!state) {
        await this.playSpotifyFullTrack()
        return
      }

      if (!state.paused) {
        await this.spotifyPlayer.pause()
        this.isPlaying = false
      } else {
        await this.spotifyPlayer.resume()
        this.isPlaying = true
      }
    } catch (err) {
      console.error('❌ Erro no togglePlay do Spotify:', err)
      this.showToast('Erro ao controlar reprodução do Spotify', 'error')
    }
    return
  }

  const audio = this.$refs.audioPlayer
  if (!audio) return

  if (this.playPromise) {
    try { await this.playPromise } catch (e) {}
  }

  if (this.isPlaying) {
    audio.pause()
    this.isPlaying = false
  } else {
    try {
      this.playPromise = audio.play()
      await this.playPromise
      this.isPlaying = true
    } catch (err) {
      console.error('❌ Erro ao tocar áudio local:', err)
      this.isPlaying = false
    } finally {
      this.playPromise = null
    }
  }
},

    onAudioPlay() {
      console.log('🔊 Evento: play disparado')
      if (!this.playPromise) this.isPlaying = true
    },

    onAudioPause() {
      console.log('🔇 Evento: pause disparado')
      if (!this.playPromise) this.isPlaying = false
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
      this.isLiked = false
      this.isFavorited = false
    },

    notifyTrackEnded(naturallyEnded = true) {
      if (!this.currentTrack) return
      let listenedDuration = this._totalListenedTime
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
      if (this.currentTrack && listenedDuration > 10000) {
        this.registrarHistorico(this.currentTrack, {
          tempoOuvido: listenedDuration,
          reproduzidaAteOFim: naturallyEnded
        })
      }

      this._trackStartTime = null
      this._totalListenedTime = 0
    },

    onAudioError(e) {
      console.error('❌ Erro no áudio:', e)
      this.isPlaying = false
      this.isLoading = false
      this.isLiked = false
      this.isFavorited = false
    },

    onTimeUpdate() {
      const audio = this.$refs.audioPlayer
      if (audio && !this.isDragging) this.currentTime = audio.currentTime
    },

    onLoadedMetadata() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        this.duration = audio.duration || this.currentTrack?.duration || 0
        console.log('📊 Duração carregada:', this.duration)
      }
    },

    async prevTrack() {
      const audio = this.$refs.audioPlayer
      if (this.currentTime > 3) {
        audio.currentTime = 0
        this.currentTime = 0
        return
      }
      if (this.currentTrack) this.notifyTrackEnded(false)
      if (this.isShuffled && this.shuffledIndices.length > 0) {
        const currentShufflePos = this.shuffledIndices.indexOf(this.currentIndex)
        if (currentShufflePos > 0) {
          this.currentIndex = this.shuffledIndices[currentShufflePos - 1]
          this._trackStartTime = Date.now()
          this._totalListenedTime = 0
          this.loadAndPlay()
          this.registrarHistorico(this.currentTrack)
          return
        }
      }
      if (this.currentIndex > 0) {
        this.currentIndex--
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.loadAndPlay()
        this.registrarHistorico(this.currentTrack)
        this.$nextTick(() => {
          this.checkLikeStatus()
          this.checkFavoriteStatus()
        })
      }
    },

    async nextTrack() {
      if (this.currentTrack) this.notifyTrackEnded(false)
      if (this.isShuffled && this.shuffledIndices.length > 0) {
        const currentShufflePos = this.shuffledIndices.indexOf(this.currentIndex)
        if (currentShufflePos < this.shuffledIndices.length - 1) {
          this.currentIndex = this.shuffledIndices[currentShufflePos + 1]
          this._trackStartTime = Date.now()
          this._totalListenedTime = 0
          this.loadAndPlay()
          this.registrarHistorico(this.currentTrack)
          return
        } else {
          this.generateShuffledOrder()
          this.currentIndex = this.shuffledIndices[0]
          this._trackStartTime = Date.now()
          this._totalListenedTime = 0
          this.loadAndPlay()
          this.registrarHistorico(this.currentTrack)
          return
        }
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
      this.registrarHistorico(this.currentTrack)
    },

async toggleMute() {
  const audio = this.$refs.audioPlayer

  if (this.isMuted) {
    this.volume = this.previousVolume || 0.7
    this.isMuted = false

    if (this.spotifyMode && this.spotifyPlayer) {
      await this.spotifyPlayer.setVolume(this.volume)
    } else if (audio) {
      audio.volume = this.volume
    }
  } else {
    this.previousVolume = this.volume
    this.volume = 0
    this.isMuted = true

    if (this.spotifyMode && this.spotifyPlayer) {
      await this.spotifyPlayer.setVolume(0)
    } else if (audio) {
      audio.volume = 0
    }
  }
},

    onSeekInput(e) {
      this.isDragging = true
      this.currentTime = parseFloat(e.target.value)
    },

async onSeekChange(e) {
  this.isDragging = false
  const time = parseFloat(e.target.value)

  if (this.spotifyMode && this.spotifyPlayer) {
    await this.spotifyPlayer.seek(Math.floor(time * 1000))
    this.currentTime = time
    return
  }

  const audio = this.$refs.audioPlayer
  if (audio) {
    audio.currentTime = time
    this.currentTime = time
  }
},

    async seekTo(e) {
      if (this.spotifyMode && this.spotifyPlayer) {
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

async onVolumeInput(e) {
  const vol = parseFloat(e.target.value)
  this.volume = vol
  this.isMuted = vol === 0

  const audio = this.$refs.audioPlayer

  if (this.spotifyMode && this.spotifyPlayer) {
    await this.spotifyPlayer.setVolume(vol)
  } else if (audio) {
    audio.volume = vol
  }
},

async setVolume(e) {
  const rect = this.$refs.volumeBar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const vol = Math.max(0, Math.min(1, percent))

  this.volume = vol
  this.isMuted = vol === 0

  const audio = this.$refs.audioPlayer

  if (this.spotifyMode && this.spotifyPlayer) {
    await this.spotifyPlayer.setVolume(vol)
  } else if (audio) {
    audio.volume = vol
  }
},

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "0:00"
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },

    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMTgxODE4Ii8+PHRleHQgeD0iMzAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMxZGI5NTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJoTwvdGV4dD48L3N2Zz4='
    },

async stop() {
  if (this.currentTrack) this.notifyTrackEnded(false)

  if (this.spotifyMode && this.spotifyPlayer) {
    try {
      await this.spotifyPlayer.pause()
      await this.spotifyPlayer.seek(0)
    } catch (err) {
      console.warn('⚠️ Erro ao parar Spotify:', err)
    }
  }

  const audio = this.$refs.audioPlayer
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }

  this.isPlaying = false
  this.spotifyMode = false
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
/* ═══════════════════════════════════════════════════════
   🔥 BOTÕES NOVOS
   ═══════════════════════════════════════════════════════ */

.shuffle-btn.active {
  color: #1db954 !important;
  background: rgba(29, 185, 84, 0.15) !important;
}

.queue-toggle-btn {
  position: relative;
}

.queue-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #1db954;
  color: white;
  font-size: 9px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ═══════════════════════════════════════════════════════
   🔥 MODAL DA FILA
   ═══════════════════════════════════════════════════════ */

.queue-slide-enter-active,
.queue-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.queue-slide-enter-from,
.queue-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.queue-modal {
  position: absolute;
  bottom: 100%;
  right: 20px;
  width: 380px;
  max-height: 500px;
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 16px 16px 4px 4px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  margin-bottom: 10px;
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.queue-header h3 {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.queue-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.queue-action-btn {
  background: rgba(29, 185, 84, 0.1);
  border: 1px solid rgba(29, 185, 84, 0.3);
  color: #1db954;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.queue-action-btn:hover {
  background: rgba(29, 185, 84, 0.2);
  transform: scale(1.02);
}

.queue-close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  transition: all 0.2s;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.queue-close-btn:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.1);
}

/* Lista */
.queue-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.queue-list::-webkit-scrollbar {
  width: 6px;
}

.queue-list::-webkit-scrollbar-track {
  background: transparent;
}

.queue-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.queue-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.queue-item.current {
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.queue-item-cover {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.queue-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.queue-item-title {
  color: #f8fafc;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-item-artist {
  color: #94a3b8;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Indicador "Tocando agora" */
.now-playing {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  padding: 0 4px;
}

.now-playing span {
  width: 3px;
  background: #1db954;
  border-radius: 1px;
  animation: sound 0.5s ease-in-out infinite;
}

.now-playing span:nth-child(1) { height: 8px; animation-delay: 0s; }
.now-playing span:nth-child(2) { height: 14px; animation-delay: 0.1s; }
.now-playing span:nth-child(3) { height: 10px; animation-delay: 0.2s; }

.queue-remove-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s;
  opacity: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.queue-item:hover .queue-remove-btn {
  opacity: 1;
}

.queue-remove-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.queue-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  gap: 10px;
}

.queue-empty i {
  font-size: 32px;
  opacity: 0.5;
}

.queue-empty p {
  font-size: 13px;
  margin: 0;
}
/* ═══════════════════════════════════════════════════════
   🔥 BOTÕES DE AÇÃO DA MÚSICA
   ═══════════════════════════════════════════════════════ */

.track-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  color: #94a3b8;
}

.action-btn:hover {
  transform: scale(1.15);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Like (Coração) */
.like-btn:hover {
  color: #ec4899;
}

.like-btn.liked {
  color: #ec4899;
}

.like-btn.liked:hover {
  color: #f472b6;
}

/* Favorite (Estrela) */
.favorite-btn:hover {
  color: #fbbf24;
}

.favorite-btn.favorited {
  color: #fbbf24;
}

.favorite-btn.favorited:hover {
  color: #f59e0b;
}

/* Add (Plus) */
.add-btn:hover {
  color: #22c55e;
}

/* ═══════════════════════════════════════════════════════
   🔥 MODAL DE PLAYLISTS
   ═══════════════════════════════════════════════════════ */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .playlist-modal,
.modal-fade-leave-to .playlist-modal {
  transform: translateY(20px) scale(0.95);
}

.playlist-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.playlist-modal {
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  animation: modalSlideUp 0.3s ease;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header h3 {
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.modal-close:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: #94a3b8;
}

.spinner-small {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(37, 99, 235, 0.2);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.playlists-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.playlist-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.playlist-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.playlist-option-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #1e1e2d;
}

.playlist-option-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.playlist-option-name {
  color: #f8fafc;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-option-count {
  color: #94a3b8;
  font-size: 12px;
}

.playlist-option-add {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.15);
  border: none;
  color: #22c55e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.playlist-option-add:hover {
  background: #22c55e;
  color: white;
  transform: scale(1.1);
}

.playlist-option-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: #94a3b8;
}

.modal-empty i {
  font-size: 40px;
  opacity: 0.5;
}

.btn-create-playlist {
  margin-top: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-playlist:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
}

/* ═══════════════════════════════════════════════════════
   RESPONSIVO FILA
   ═══════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .queue-modal {
    width: calc(100vw - 40px);
    right: 10px;
    max-height: 400px;
  }
 
  .queue-badge {
    width: 14px;
    height: 14px;
    font-size: 8px;
  }
}

@media (max-width: 480px) {
  .queue-modal {
    width: calc(100vw - 20px);
    right: 10px;
    border-radius: 12px 12px 4px 4px;
  }
 
  .queue-action-btn span {
    display: none;
  }
 
  .queue-remove-btn {
    opacity: 1;
  }
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
/* ═══════════════════════════════════════════════════════
   🔥 BOTÃO MINIMIZAR
   ═══════════════════════════════════════════════════════ */

.minimize-btn {
  position: absolute;
  top: -28px;
  right: 20px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border: none;
  color: white;
  width: 36px;
  height: 28px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  z-index: 1000;
  box-shadow: 0 -4px 15px rgba(37, 99, 235, 0.3);
}

.minimize-btn:hover {
  transform: translateY(-2px);
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

/* ═══════════════════════════════════════════════════════
   🔥 PLAYER MINIMIZADO
   ═══════════════════════════════════════════════════════ */

.minimize-pop-enter-active,
.minimize-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.minimize-pop-enter-from,
.minimize-pop-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.player-minimized {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
  border: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: 50px;
  padding: 8px 16px 8px 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(37, 99, 235, 0.1);
  cursor: pointer;
  z-index: 999;
  transition: all 0.3s ease;
  max-width: 320px;
  animation: popIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.player-minimized:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(37, 99, 235, 0.2);
  border-color: rgba(37, 99, 235, 0.5);
}

.minimized-cover {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.minimized-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.minimized-title {
  color: #f8fafc;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.minimized-artist {
  color: #94a3b8;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.minimized-indicator {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
  padding: 0 4px;
}

.minimized-indicator span {
  width: 2px;
  background: #1db954;
  border-radius: 1px;
  animation: sound 0.5s ease-in-out infinite;
}

.minimized-indicator span:nth-child(1) { height: 6px; animation-delay: 0s; }
.minimized-indicator span:nth-child(2) { height: 12px; animation-delay: 0.1s; }
.minimized-indicator span:nth-child(3) { height: 8px; animation-delay: 0.2s; }

.minimized-expand-btn {
  background: rgba(37, 99, 235, 0.15);
  border: none;
  color: #2563eb;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.minimized-expand-btn:hover {
  background: #2563eb;
  color: white;
  transform: scale(1.1);
}

/* Ajuste no .music-player para posicionamento relativo */
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  /* ... resto das propriedades existentes ... */
}

/* Wrapper do conteúdo quando expandido */
.player-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

/* Responsivo do minimizado */
@media (max-width: 480px) {
  .player-minimized {
    bottom: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    padding: 6px 12px 6px 6px;
  }

  .minimized-cover {
    width: 36px;
    height: 36px;
  }

  .minimized-title {
    font-size: 12px;
  }

  .minimized-artist {
    font-size: 10px;
  }
}
</style>