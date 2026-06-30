<template>
  <div class="local-playlist-page">
    <div class="local-container">
      
      <!-- Header -->
      <header class="local-header">
        <button class="btn-back" @click="$router.back()">
          <i class="fa fa-arrow-left"></i>
        </button>
        <div class="local-header-info">
          <div class="local-gradient-badge" :style="getLocalGradient(localNome)">
            <span class="local-emoji">📍</span>
          </div>
          <div class="local-text">
            <h1>{{ localNome }}</h1>

          </div>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Carregando músicas de {{ localNome }}...</span>
      </div>

      <!-- Conteúdo -->
      <div v-else class="local-content">
        
        <!-- Tabs -->
        <div class="local-tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
            <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <!-- Músicas -->
        <div v-if="activeTab === 'tracks'" class="tracks-section">
          <div v-if="tracks.length === 0" class="empty-state">
            <i class="fa fa-music"></i>
            <h3>Nenhuma música encontrada</h3>
            <p>Ainda não há músicas cadastradas para {{ localNome }}.</p>
          </div>
          
          <div v-else class="tracks-list">
            <div
              v-for="(track, index) in tracks"
              :key="track.id"
              class="track-list-item"
              @click="playTrack(track)"
            >
              <span class="track-list-number">{{ index + 1 }}</span>
              <div class="track-list-thumb">
                <img :src="getBestImage(track)" :alt="track.title" @error="$event.target.style.display='none'">
                <div class="track-list-play-overlay">
                  <i class="fa fa-play"></i>
                </div>
              </div>
              <div class="track-list-info">
                <span class="track-list-name">{{ track.title }}</span>
                <span class="track-list-artist">{{ track.artist?.name || 'Artista desconhecido' }}</span>
              </div>
             <span class="track-list-source">
  <span class="source-badge" :class="track.source">
    <i :class="getSourceIcon(track.source)"></i>
  </span>
</span>

<button
  v-if="!isLogged"
  class="btn-like-list"
  @click.stop="openLoginModal"
  title="Faça login para curtir"
>
  <i class="fa fa-heart-o"></i>
</button>

<button
  v-else-if="track.source !== 'spotify'"
  class="btn-like-list disabled"
  @click.stop="showToast('Faça login com Spotify para curtir', 'info')"
  title="Deezer: login necessário"
>
  <i class="fa fa-heart-o"></i>
</button>

<button
  v-else
  class="btn-like-list"
  @click.stop="toggleLikeTrack(track)"
  :class="{ liked: isTrackLiked(track.id) }"
>
  <i :class="isTrackLiked(track.id) ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
</button>

<span v-if="track.duration" class="track-list-duration">{{ formatDuration(track.duration) }}</span>

            </div>
          </div>
        </div>

        <!-- Artistas -->
        <div v-if="activeTab === 'artists'" class="artists-section">
          <div v-if="artists.length === 0" class="empty-state">
            <i class="fa fa-user"></i>
            <h3>Nenhum artista encontrado</h3>
          </div>
          
          <div v-else class="artists-grid">
            <div
              v-for="artist in artists"
              :key="artist.id"
              class="artist-card"
              @click="goToArtist(artist)"
            >
              <div class="artist-card-img">
                <img :src="artist.picture || artist.picture_medium || '/default-avatar.png'" :alt="artist.name">
              </div>
              <span class="artist-card-name">{{ artist.name }}</span>
              <span class="artist-card-type">Artista</span>
            </div>
          </div>
        </div>

        <!-- Álbuns -->
        <div v-if="activeTab === 'albums'" class="albums-section">
          <div v-if="albums.length === 0" class="empty-state">
            <i class="fa fa-circle"></i>
            <h3>Nenhum álbum encontrado</h3>
          </div>
          
          <div v-else class="albums-grid">
<div
  v-for="album in albums"
  :key="album.id"
  class="album-card"
  @click="openAlbumModal(album)"
>
  <div class="album-card-img">
    <img :src="album.cover || album.cover_medium || '/default-cover.png'" :alt="album.title">
    <div class="album-card-overlay" @click.stop="openAlbumModal(album)">
      <i class="fa fa-play"></i>
    </div>
  </div>
  <span class="album-card-name">{{ album.title }}</span>
  <span class="album-card-artist">{{ album.artist?.name || 'Artista' }}</span>
</div>
          </div>
        </div>

      </div>

    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <i :class="toast.icon"></i>
        <span>{{ toast.message }}</span>
      </div>
    </transition>
    <!-- MODAL DE LOGIN -->
<transition name="modal">
  <div v-if="showLoginModal" class="login-modal-overlay" @click="closeLoginModal">
    <div class="login-modal" @click.stop>
      <div class="modal-icon">
        <i class="fa fa-lock"></i>
      </div>
      <h3>Login Necessário</h3>
      <p>Faça login para curtir músicas do Spotify.</p>

      <div class="modal-actions">
        <button class="btn-primary" @click="goToLogin">
          <i class="fa fa-sign-in"></i>
          Fazer Login
        </button>
        <button class="btn-secondary" @click="closeLoginModal">
          Continuar Navegando
        </button>
      </div>
    </div>
  </div>
</transition>
    <!-- MODAL DE ÁLBUM -->
    <transition name="modal">
      <div v-if="showAlbumModal" class="album-modal-overlay" @click="closeAlbumModal">
        <div class="album-modal" @click.stop>
          <!-- Header -->
          <div class="album-modal-header">
            <div class="album-modal-cover">
              <img :src="selectedAlbum?.cover || selectedAlbum?.cover_medium || '/default-cover.png'" :alt="selectedAlbum?.title">
              <button class="album-play-all-btn" @click="playAllAlbumTracks" v-if="albumTracks.length > 0">
                <i class="fa fa-play"></i>
              </button>
            </div>
            <div class="album-modal-info">
              <h2>{{ selectedAlbum?.title }}</h2>
              <p class="album-modal-artist">{{ selectedAlbum?.artist?.name || 'Artista' }}</p>
              <span class="album-modal-count">{{ albumTracks.length }} {{ albumTracks.length === 1 ? 'música' : 'músicas' }}</span>
              <span class="source-badge" :class="selectedAlbum?.source">
                <i :class="getSourceIcon(selectedAlbum?.source)"></i>
                {{ selectedAlbum?.source === 'spotify' ? 'Spotify' : 'Deezer' }}
              </span>
            </div>
            <button class="album-modal-close" @click="closeAlbumModal">
              <i class="fa fa-times"></i>
            </button>
          </div>

          <!-- Tracks -->
          <div class="album-modal-body">
            <div v-if="albumTracksLoading" class="album-modal-loading">
              <div class="spinner"></div>
              <span>Carregando músicas...</span>
            </div>

            <div v-else-if="albumTracks.length === 0" class="album-modal-empty">
              <i class="fa fa-music"></i>
              <p>Nenhuma música disponível neste álbum</p>
            </div>

            <div v-else class="album-tracks-list">
              <div
                v-for="(track, index) in albumTracks"
                :key="track.id"
                class="album-track-item"
                @click="playAlbumTrack(track)"
              >
                <span class="album-track-number">{{ index + 1 }}</span>
                <div class="album-track-thumb">
                  <img :src="getBestImage(track)" :alt="track.title" @error="$event.target.style.display='none'">
                  <div class="album-track-play-overlay">
                    <i class="fa fa-play"></i>
                  </div>
                </div>
                <div class="album-track-info">
                  <span class="album-track-name">{{ track.title }}</span>
                  <span class="album-track-artist">{{ track.artist?.name || 'Artista desconhecido' }}</span>
                </div>
                <span v-if="track.duration" class="album-track-duration">{{ formatDuration(track.duration) }}</span>
                
                <!-- Botão de curtir seguindo a lógica existente -->
                <button
                  v-if="!isLogged"
                  class="btn-like-list"
                  @click.stop="openLoginModal"
                  title="Faça login para curtir"
                >
                  <i class="fa fa-heart-o"></i>
                </button>
                <button
                  v-else-if="track.source !== 'spotify'"
                  class="btn-like-list disabled"
                  @click.stop="showToast('Faça login com Spotify para curtir', 'info')"
                  title="Deezer: login necessário"
                >
                  <i class="fa fa-heart-o"></i>
                </button>
                <button
                  v-else
                  class="btn-like-list"
                  @click.stop="toggleLikeTrack(track)"
                  :class="{ liked: isTrackLiked(track.id) }"
                >
                  <i :class="isTrackLiked(track.id) ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'LocalPlaylist',

  data() {
    return {
      localNome: '',
      isLoading: false,
      activeTab: 'tracks',
      tracks: [],
      artists: [],
      albums: [],

      spotifyConnected: false,
      isLogged: false,
      currentMusicSource: 'deezer',

      likedTracks: [],
      showLoginModal: false,
            showAlbumModal: false,
      selectedAlbum: null,
      albumTracks: [],
      albumTracksLoading: false,

      tabs: [
        { id: 'tracks', label: 'Músicas', icon: 'fa fa-music', count: 0 },
        { id: 'artists', label: 'Artistas', icon: 'fa fa-user', count: 0 },
        { id: 'albums', label: 'Álbuns', icon: 'fa fa-circle', count: 0 }
      ],

      toast: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fa fa-check-circle'
      }
    }
  },

  computed: {
    totalResultados() {
      return this.tracks.length + this.artists.length + this.albums.length
    }
  },

  watch: {
    '$route.params.nome': {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          this.localNome = decodeURIComponent(newVal)
          await this.loadLocalData()
        }
      }
    }
  },

  methods: {
    async checkSpotifyStatus() {
      const token = localStorage.getItem('token')
      this.isLogged = !!token

      if (!token) {
        this.spotifyConnected = false
        return false
      }

      try {
        const res = await fetch('http://localhost:3002/spotify/status', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          this.spotifyConnected = false
          return false
        }

        const data = await res.json()
        this.spotifyConnected = !!(data.connected && data.tokenValid)
        return this.spotifyConnected
      } catch (err) {
        console.error('[LocalPlaylist] Erro ao verificar Spotify:', err)
        this.spotifyConnected = false
        return false
      }
    },

    async fetchSpotifyLocalData() {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Usuário não logado')

      const searchQuery = encodeURIComponent(this.localNome)

      const res = await fetch(
        `http://localhost:3002/spotify/search?q=${searchQuery}&type=track,artist,album&limit=20&market=BR`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!res.ok) {
        throw new Error('Spotify falhou')
      }

      const spotifyData = await res.json()

      return {
        results: [
          ...(spotifyData.tracks?.items || []).map(t => ({
            id: t.id,
            type: 'track',
            title: t.name,
            artist: {
              name: t.artists?.map(a => a.name).join(', ') || 'Artista desconhecido'
            },
            album: {
              title: t.album?.name || '',
              cover: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '',
              cover_medium: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || ''
            },
            cover: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '',
            preview: t.preview_url || '',
            duration: Math.round((t.duration_ms || 0) / 1000),
            source: 'spotify'
          })),

          ...(spotifyData.artists?.items || []).map(a => ({
            id: a.id,
            type: 'artist',
            name: a.name,
            picture: a.images?.[1]?.url || a.images?.[0]?.url || '',
            picture_medium: a.images?.[1]?.url || a.images?.[0]?.url || '',
            nb_fan: a.followers?.total || 0,
            source: 'spotify'
          })),

          ...(spotifyData.albums?.items || []).map(al => ({
            id: al.id,
            type: 'album',
            title: al.name,
            artist: {
              name: al.artists?.map(a => a.name).join(', ') || 'Artista'
            },
            cover: al.images?.[1]?.url || al.images?.[0]?.url || '',
            cover_medium: al.images?.[1]?.url || al.images?.[0]?.url || '',
            source: 'spotify'
          }))
        ]
      }
    },

    async fetchDeezerLocalData() {
      const res = await fetch(
        `http://localhost:3002/locais/${encodeURIComponent(this.localNome)}/musicas`
      )

      if (!res.ok) {
        throw new Error('Deezer falhou')
      }

      return await res.json()
    },

applyResults(data) {
  if (data.results && Array.isArray(data.results)) {
    // Define qual source é permitida baseado no login
    const allowedSource = this.isLogged ? 'spotify' : 'deezer'
        this.tracks = data.results
      .filter(r => r.type === 'track' && (r.source || this.currentMusicSource) === allowedSource)
          .map(r => ({
            id: r.id,
            title: r.title,
            artist: {
              name: r.artist?.name || 'Artista desconhecido'
            },
            album: {
              title: r.album?.title || '',
              cover: r.album?.cover || r.album?.cover_medium || r.cover || '',
              cover_medium: r.album?.cover_medium || r.album?.cover || r.cover || ''
            },
            cover: r.cover || r.album?.cover_medium || r.album?.cover || '',
            preview: r.preview || '',
            duration: r.duration || 0,
            source: r.source || this.currentMusicSource || 'deezer',
            type: 'track'
          }))

    this.artists = data.results
      .filter(r => r.type === 'artist' && (r.source || this.currentMusicSource) === allowedSource)
          .map(r => ({
            id: r.id,
            name: r.name,
            picture: r.picture || r.picture_medium || '',
            picture_medium: r.picture_medium || r.picture || '',
            nb_fan: r.nb_fan || 0,
            source: r.source || this.currentMusicSource || 'deezer',
            type: 'artist'
          }))

    this.albums = data.results
      .filter(r => r.type === 'album' && (r.source || this.currentMusicSource) === allowedSource)
          .map(r => ({
            id: r.id,
            title: r.title,
            artist: {
              name: r.artist?.name || 'Artista'
            },
            cover: r.cover || r.cover_medium || '',
            cover_medium: r.cover_medium || r.cover || '',
            source: r.source || this.currentMusicSource || 'deezer',
            type: 'album'
          }))
      } else {
        this.tracks = []
        this.artists = []
        this.albums = []
      }

      this.tabs[0].count = this.tracks.length
      this.tabs[1].count = this.artists.length
      this.tabs[2].count = this.albums.length
    },

    async loadLikedTracks() {
      try {
        const token = localStorage.getItem('token')

        if (!token) {
          this.likedTracks = []
          return
        }

        const res = await fetch('http://localhost:3002/curtidas', {
          headers: { Authorization: `Bearer ${token}` }
        })

        const data = await res.json()
        this.likedTracks = Array.isArray(data)
          ? data.map(c => String(c.id)).filter(Boolean)
          : []
      } catch (err) {
        this.likedTracks = []
      }
    },

    isTrackLiked(trackId) {
      if (!trackId) return false
      return this.likedTracks.some(id => String(id) === String(trackId))
    },

    async toggleLikeTrack(track) {
      if (!this.isLogged) {
        this.openLoginModal()
        return
      }

      if (track.source !== 'spotify') {
        this.showToast('Faça login com Spotify para curtir', 'info')
        return
      }

      try {
        const trackId = track.id

        const body = {
          source: 'spotify',
          dadosMusica: {
            titulo: track.title || 'Sem título',
            artista: track.artist?.name || 'Desconhecido',
            capa: this.getBestImage(track) || '',
            previewUrl: track.preview || '',
            duration: track.duration || 30,
            album: track.album?.title || ''
          }
        }

        const res = await fetch(`http://localhost:3002/curtidas/${trackId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          this.showToast(
            errorData.error || errorData.message || `Erro ${res.status}`,
            'error'
          )
          return
        }

        const data = await res.json()

        if (data.liked) {
          if (!this.likedTracks.includes(String(trackId))) {
            this.likedTracks.push(String(trackId))
          }
          this.showToast(`"${track.title}" curtida ❤️`, 'success')
        } else {
          this.likedTracks = this.likedTracks.filter(id => String(id) !== String(trackId))
          this.showToast(`"${track.title}" descurtida 💔`, 'info')
        }
      } catch (err) {
        console.error('[LocalPlaylist] Erro ao curtir:', err)
        this.showToast('Erro ao processar curtida', 'error')
      }
    },

async loadLocalData() {
  this.isLoading = true

  try {
    const canUseSpotify = await this.checkSpotifyStatus()

    if (this.isLogged) {
      await this.loadLikedTracks()
    } else {
      this.likedTracks = []
    }

    let data

    if (this.isLogged && canUseSpotify) {
      // Logado + Spotify conectado: SÓ Spotify
      data = await this.fetchSpotifyLocalData()
      this.currentMusicSource = 'spotify'
    } else {
      // Não logado OU Spotify não conectado: SÓ Deezer
      data = await this.fetchDeezerLocalData()
      this.currentMusicSource = 'deezer'
    }

        this.applyResults(data)
      } catch (err) {
        console.error('[LocalPlaylist] Erro ao carregar dados:', err)
        this.showToast('Erro ao carregar dados do local', 'error')
        this.tracks = []
        this.artists = []
        this.albums = []
        this.currentMusicSource = 'deezer'
        this.tabs[0].count = 0
        this.tabs[1].count = 0
        this.tabs[2].count = 0
      } finally {
        this.isLoading = false
      }
    },

    openLoginModal() {
      this.showLoginModal = true
    },

    closeLoginModal() {
      this.showLoginModal = false
    },

    goToLogin() {
      this.$router.push('/login')
    },

    playTrack(track) {
      const playerSong = {
        id: track.id,
        title: track.title,
        artist: track.artist?.name || 'Artista desconhecido',
        cover: this.getBestImage(track) || track.album?.cover_medium || '',
        url: track.preview || '',
        preview: track.preview || '',
        duration: track.duration || 30,
        type: 'track',
        source: track.source || this.currentMusicSource || 'deezer'
      }

      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: [playerSong],
          index: 0,
          context: 'local'
        }
      }))
    },

    goToArtist(artist) {
      this.$router.push({
        name: 'DetalheCantor',
        params: { id: artist.id },
        query: {
          source: artist.source || 'local',
          name: artist.name,
          picture: artist.picture || artist.picture_medium || ''
        }
      })
    },
        async openAlbumModal(album) {
      this.selectedAlbum = album
      this.showAlbumModal = true
      this.albumTracksLoading = true
      this.albumTracks = []

      try {
        // Buscar músicas do álbum baseado na source
        if (album.source === 'spotify' && this.isLogged) {
          const token = localStorage.getItem('token')
          const res = await fetch(
            `http://localhost:3002/spotify/albums/${album.id}/tracks?limit=50`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          if (!res.ok) throw new Error('Erro ao buscar tracks do álbum Spotify')
          const data = await res.json()
          this.albumTracks = (data.items || []).map(t => ({
            id: t.id,
            title: t.name,
            artist: {
              name: t.artists?.map(a => a.name).join(', ') || album.artist?.name || 'Artista desconhecido'
            },
            album: {
              title: album.title,
              cover: album.cover || album.cover_medium || '',
              cover_medium: album.cover_medium || album.cover || ''
            },
            cover: album.cover || album.cover_medium || '',
            preview: t.preview_url || '',
            duration: Math.round((t.duration_ms || 0) / 1000),
            source: 'spotify',
            type: 'track'
          }))
        } else {
          // Deezer ou local - buscar na API de locais ou álbum Deezer
        const res = await fetch(
  `http://localhost:3002/deezer/album/${encodeURIComponent(album.id)}/tracks`
)
          if (!res.ok) throw new Error('Erro ao buscar tracks do álbum')
          const data = await res.json()
          this.albumTracks = (data.data || data.tracks || data || []).map(t => ({
            id: t.id,
            title: t.title,
            artist: {
              name: t.artist?.name || album.artist?.name || 'Artista desconhecido'
            },
            album: {
              title: album.title,
              cover: album.cover || album.cover_medium || '',
              cover_medium: album.cover_medium || album.cover || ''
            },
            cover: album.cover || album.cover_medium || '',
            preview: t.preview || '',
            duration: t.duration || 0,
            source: album.source || 'deezer',
            type: 'track'
          }))
        }
      } catch (err) {
        console.error('[LocalPlaylist] Erro ao carregar tracks do álbum:', err)
        this.showToast('Erro ao carregar músicas do álbum', 'error')
      } finally {
        this.albumTracksLoading = false
      }
    },

    closeAlbumModal() {
      this.showAlbumModal = false
      this.selectedAlbum = null
      this.albumTracks = []
    },

    playAlbumTrack(track) {
      const playerSong = {
        id: track.id,
        title: track.title,
        artist: track.artist?.name || 'Artista desconhecido',
        cover: this.getBestImage(track) || track.album?.cover_medium || '',
        url: track.preview || '',
        preview: track.preview || '',
        duration: track.duration || 30,
        type: 'track',
        source: track.source || 'deezer'
      }

      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: [playerSong],
          index: 0,
          context: 'album'
        }
      }))
    },

    playAllAlbumTracks() {
      if (this.albumTracks.length === 0) return
      
      const tracks = this.albumTracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist?.name || 'Artista desconhecido',
        cover: this.getBestImage(t) || t.album?.cover_medium || '',
        url: t.preview || '',
        preview: t.preview || '',
        duration: t.duration || 30,
        type: 'track',
        source: t.source || 'deezer'
      }))

      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: tracks[0],
          playlist: tracks,
          index: 0,
          context: 'album'
        }
      }))
    },

    getBestImage(item) {
      if (item.type === 'track') {
        return item.album?.cover || item.cover || item.album?.cover_medium || ''
      }
      if (item.type === 'artist') {
        return item.picture || item.picture_medium || ''
      }
      if (item.type === 'album') {
        return item.cover || item.cover_medium || ''
      }
      return item.cover || item.picture || ''
    },

    getSourceIcon(source) {
      const icons = {
        spotify: 'fa fa-spotify',
        deezer: 'si si-deezer',
        local: 'fa fa-database'
      }
      return icons[source] || 'fa fa-music'
    },

    formatDuration(seconds) {
      if (!seconds) return '3:00'
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    getLocalGradient(loc) {
      const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
        'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
      ]
      const index = loc.length % colors.length
      return { background: colors[index] }
    },

    showToast(message, type = 'success') {
      const icons = {
        success: 'fa fa-check-circle',
        error: 'fa fa-exclamation-circle',
        info: 'fa fa-info-circle'
      }

      this.toast = {
        show: true,
        message,
        type,
        icon: icons[type]
      }

      setTimeout(() => {
        this.toast.show = false
      }, 3000)
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

.local-playlist-page {
  min-height: 100vh;
  width: 100%;
  color: #fff;
  font-family: 'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
  padding: 24px 0 120px 0;
  display: flex;
  justify-content: center;
}

.local-container {
  width: 100%;
  max-width: 1400px;
  padding: 0 32px;
}
.btn-like-list {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  opacity: 0;
}

.track-list-item:hover .btn-like-list {
  opacity: 1;
}

.btn-like-list:hover {
  color: #ec4899;
  transform: scale(1.2);
}

.btn-like-list.liked {
  opacity: 1;
  color: #ec4899;
}

.btn-like-list.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: auto;
}

.btn-like-list.disabled:hover {
  transform: none;
  color: #888;
}

/* MODAL DE LOGIN */
.login-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  animation: fadeIn 0.2s ease;
}

.login-modal {
  background: #181818;
  border-radius: 16px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(29, 185, 84, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.modal-icon i {
  font-size: 28px;
  color: #1db954;
}

.login-modal h3 {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
}

.login-modal p {
  font-size: 14px;
  color: #888;
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-primary {
  padding: 14px 24px;
  background: linear-gradient(135deg, #1db954, #1ed760);
  border: none;
  border-radius: 500px;
  color: #000;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(29, 185, 84, 0.4);
}

.btn-secondary {
  padding: 14px 24px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 500px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Header */
.local-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.source-indicator {
  margin-top: 4px;
}
.source-indicator .badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.source-indicator .badge.spotify {
  background: rgba(29, 185, 84, 0.15);
  color: #1db954;
  border: 1px solid rgba(29, 185, 84, 0.3);
}
.source-indicator .badge.deezer {
  background: rgba(255, 102, 0, 0.15);
  color: #ff6600;
  border: 1px solid rgba(255, 102, 0, 0.3);
}
.btn-back:hover {
  background: rgba(255,255,255,0.1);
  transform: translateX(-2px);
}

.local-header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.local-gradient-badge {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.local-emoji {
  font-size: 36px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.local-text h1 {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.local-text p {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* Tabs */
.local-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  padding-bottom: 16px;
}

.local-tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  color: #888;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.local-tabs button:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
  border-color: rgba(255,255,255,0.2);
}

.local-tabs button.active {
  background: #1db954;
  border-color: #1db954;
  color: #000;
}

.tab-count {
  background: rgba(0,0,0,0.3);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.local-tabs button.active .tab-count {
  background: rgba(0,0,0,0.2);
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(29, 185, 84, 0.3);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #666;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: #1db954;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 18px;
  color: #fff;
  margin: 0;
}

.empty-state p {
  font-size: 14px;
  color: #666;
  max-width: 400px;
  margin: 0;
}

/* Tracks List */
.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.track-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.track-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.track-list-number {
  width: 24px;
  text-align: center;
  font-size: 14px;
  color: #888;
  font-variant-numeric: tabular-nums;
}

.track-list-thumb {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.track-list-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-list-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.track-list-play-overlay i {
  font-size: 14px;
  color: #fff;
}

.track-list-item:hover .track-list-play-overlay {
  opacity: 1;
}

.track-list-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.track-list-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-list-artist {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-list-source {
  flex-shrink: 0;
}

.source-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
}

.source-badge.spotify {
  background: rgba(29, 185, 84, 0.15);
  border-color: rgba(29, 185, 84, 0.4);
  color: #1db954;
}

.source-badge.deezer {
  background: rgba(255, 102, 0, 0.15);
  border-color: rgba(255, 102, 0, 0.4);
  color: #ff6600;
}

.source-badge.local {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #888;
}

.track-list-duration {
  font-size: 12px;
  color: #888;
  font-variant-numeric: tabular-nums;
  width: 40px;
  text-align: right;
}

/* Artists Grid */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.artist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.artist-card-img {
  width: 180px;
  height: 180px;
  min-width: 180px;
  min-height: 180px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.artist-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.artist-card:hover {
  background: #282828;
  transform: translateY(-4px);
}

.artist-card-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-card-type {
  font-size: 12px;
  color: #888;
}

/* Albums Grid */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.album-card {
  display: flex;
  flex-direction: column;
  background: #181818;
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
  height: 100%;
}

.album-card-img {
  position: relative;
  width: 100%;
  height: 220px;
  min-height: 220px;
  max-height: 220px;
  overflow: hidden;
  border-radius: 8px;
  flex-shrink: 0;
}

.album-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.album-card:hover {
  background: #282828;
  transform: translateY(-4px);
}

/* Adicione APÓS .artist-card e .album-card: */
.artist-card,
.album-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.artist-card-img,
.album-card-img {
  flex-shrink: 0;
}

.album-card:hover .album-card-img img {
  transform: scale(1.05);
}

.album-card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.album-card:hover .album-card-overlay {
  opacity: 1;
}

.album-card-overlay i {
  font-size: 32px;
  color: #1db954;
}

.album-card-name {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* permite 2 linhas */
  -webkit-box-orient: vertical;
  overflow: hidden;

  width: 100%;
  margin-top: 12px;

  font-size: 14px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
  min-height: 40px; /* mantém todos alinhados */
}

.album-card-artist {
  width: 100%;
  font-size: 12px;
  color: #888;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  z-index: 2000;
  animation: toastIn 0.3s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.toast.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.toast.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.toast i {
  font-size: 20px;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 1200px) {
  .artists-grid, .albums-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .local-container {
    padding: 0 16px;
  }
  
  .local-header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .local-gradient-badge {
    width: 60px;
    height: 60px;
  }
  
  .local-text h1 {
    font-size: 24px;
  }
  
  .artists-grid, .albums-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .local-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .local-tabs button {
    flex-shrink: 0;
  }
  
  .track-list-number {
    display: none;
  }
  
  .track-list-duration {
    display: none;
  }
}
/* ═══════════════════════════════════════════════════════
   🔥 MODAL DE ÁLBUM
   ═══════════════════════════════════════════════════════ */

.album-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
  animation: fadeIn 0.3s ease;
  padding: 20px;
}

.album-modal {
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 20px;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7);
  animation: modalSlideUp 0.3s ease;
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.album-modal-header {
  display: flex;
  gap: 24px;
  padding: 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.album-modal-cover {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.album-modal-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.album-play-all-btn {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.album-modal-cover:hover .album-play-all-btn {
  opacity: 1;
}

.album-play-all-btn i {
  font-size: 48px;
  color: #1db954;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
}

.album-modal-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
}

.album-modal-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.3;
}

.album-modal-artist {
  font-size: 16px;
  color: #1db954;
  margin: 0;
  font-weight: 500;
}

.album-modal-count {
  font-size: 13px;
  color: #888;
}

.album-modal-info .source-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
  margin-top: 4px;
}

.album-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.album-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: rotate(90deg);
}

.album-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.album-modal-loading,
.album-modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #888;
}

.album-modal-empty i {
  font-size: 48px;
  color: #1db954;
  opacity: 0.3;
}

.album-tracks-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.album-track-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.album-track-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.album-track-number {
  width: 24px;
  text-align: center;
  font-size: 14px;
  color: #888;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.album-track-thumb {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.album-track-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-track-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.album-track-play-overlay i {
  font-size: 14px;
  color: #fff;
}

.album-track-item:hover .album-track-play-overlay {
  opacity: 1;
}

.album-track-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.album-track-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-track-artist {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-track-duration {
  font-size: 12px;
  color: #888;
  font-variant-numeric: tabular-nums;
  width: 40px;
  text-align: right;
  flex-shrink: 0;
}

/* Scrollbar do modal */
.album-modal-body::-webkit-scrollbar {
  width: 6px;
}

.album-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.album-modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

/* Responsivo */
@media (max-width: 768px) {
  .album-modal-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
    padding: 24px;
  }

  .album-modal-cover {
    width: 140px;
    height: 140px;
  }

  .album-modal-info h2 {
    font-size: 20px;
  }

  .album-modal-close {
    top: 12px;
    right: 12px;
  }

  .album-track-number {
    display: none;
  }

  .album-track-duration {
    display: none;
  }
}
</style>