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
            <p>Música local • {{ totalResultados }} resultados</p>
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
              @click="goToAlbum(album)"
            >
              <div class="album-card-img">
                <img :src="album.cover || album.cover_medium || '/default-cover.png'" :alt="album.title">
                <div class="album-card-overlay">
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
      handler(newVal) {
        if (newVal) {
          this.localNome = decodeURIComponent(newVal)
          this.loadLocalData()
        }
      }
    }
  },

  methods: {
    async loadLocalData() {
      this.isLoading = true
      try {
        const res = await fetch(
          `http://localhost:3002/locais/${encodeURIComponent(this.localNome)}/musicas`
        )
        const data = await res.json()

        if (data.results && Array.isArray(data.results)) {
          this.tracks = data.results.filter(r => r.type === 'track').map(r => ({
            id: r.id,
            title: r.title,
            artist: { name: r.artist?.name || 'Artista desconhecido' },
            album: {
              title: r.album?.title || '',
              cover: r.album?.cover_medium || r.cover || ''
            },
            cover: r.cover || r.album?.cover_medium,
            preview: r.preview,
            duration: r.duration,
            source: r.source || 'local',
            type: 'track'
          }))

          this.artists = data.results.filter(r => r.type === 'artist').map(r => ({
            id: r.id,
            name: r.name,
            picture: r.picture || r.picture_medium,
            picture_medium: r.picture_medium,
            nb_fan: r.nb_fan || 0,
            source: r.source || 'local',
            type: 'artist'
          }))

          this.albums = data.results.filter(r => r.type === 'album').map(r => ({
            id: r.id,
            title: r.title,
            artist: { name: r.artist?.name || 'Artista' },
            cover: r.cover || r.cover_medium,
            cover_medium: r.cover_medium,
            source: r.source || 'local',
            type: 'album'
          }))
        } else {
          this.tracks = []
          this.artists = []
          this.albums = []
        }

        // Atualiza counts
        this.tabs[0].count = this.tracks.length
        this.tabs[1].count = this.artists.length
        this.tabs[2].count = this.albums.length

      } catch (err) {
        this.showToast('Erro ao carregar dados do local', 'error')
        this.tracks = []
        this.artists = []
        this.albums = []
      } finally {
        this.isLoading = false
      }
    },

    playTrack(track) {
      const playerSong = {
        id: track.id,
        title: track.title,
        artist: track.artist?.name || 'Artista desconhecido',
        cover: this.getBestImage(track) || track.album?.cover_medium,
        url: track.preview || '',
        preview: track.preview || '',
        duration: track.duration || 30,
        type: 'track',
        source: track.source || 'local'
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
      if (artist.source === 'local') {
        this.$router.push(`/cantor/${artist.id}`)
      } else {
        this.showToast('Artista externo - redirecionamento limitado', 'info')
      }
    },

    goToAlbum(album) {
      if (album.source === 'local') {
        this.$router.push(`/album/${album.id}`)
      } else {
        this.showToast('Álbum externo - redirecionamento limitado', 'info')
      }
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
      this.toast = { show: true, message, type, icon: icons[type] }
      setTimeout(() => { this.toast.show = false }, 3000)
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
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.artist-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 16px;
  border-radius: 8px;
  background: #181818;
}

.artist-card:hover {
  background: #282828;
  transform: translateY(-4px);
}

.artist-card-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;
}

.artist-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.album-card {
  cursor: pointer;
  transition: all 0.2s;
  padding: 16px;
  border-radius: 8px;
  background: #181818;
}

.album-card:hover {
  background: #282828;
  transform: translateY(-4px);
}

.album-card-img {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.album-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
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
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-card-artist {
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
</style>