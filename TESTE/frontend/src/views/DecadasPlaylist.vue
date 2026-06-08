<template>
  <div class="decade-playlist-page">
    <div class="playlist-container">
      
      <!-- Header da Playlist -->
      <header class="playlist-header" :style="getDecadeGradient(decadeName)">
        <div class="header-content">
          <div class="decade-badge-large">
            <i :class="getDecadeIcon(decadeName)"></i>
          </div>
          <div class="header-text">
            <span class="playlist-type">Playlist da Década</span>
            <h1 class="decade-title">{{ decadeName }}</h1>
            <p class="decade-description">{{ decadeInfo.description || 'Os maiores sucessos desta época.' }}</p>
            <div class="playlist-stats">
              <span class="stat-item"><i class="fa fa-music"></i> {{ results.length }} músicas</span>
              <span class="stat-item"><i class="fa fa-clock-o"></i> {{ totalDuration }}</span>
             <!-- ✅ DEPOIS (correto): -->
<span v-if="isLogged && spotifyConnected" class="stat-item source-badge"><i class="fa fa-spotify"></i> Spotify</span>
<span v-else class="stat-item source-badge deezer"><i class="si si-deezer"></i> Deezer</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-play-all" @click="playAll" :disabled="results.length === 0">
            <i class="fa fa-play"></i>
            Tocar Tudo
          </button>
          <button class="btn-back" @click="$router.back()">
            <i class="fa fa-arrow-left"></i>
            Voltar
          </button>
        </div>
      </header>

      <!-- Lista de Músicas -->
      <main class="playlist-content">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>Carregando sucessos dos anos {{ decadeName }}...</span>
<!-- ✅ DEPOIS (correto): -->
<span v-if="!isLogged || !spotifyConnected" class="loading-source"><i class="si si-deezer"></i> via Deezer</span>
<span v-else class="loading-source"><i class="fa fa-spotify"></i> via Spotify</span>
        </div>

        <div v-else-if="results.length === 0" class="empty-state">
      <!-- ✅ DEPOIS (correto): -->
<i :class="(isLogged && spotifyConnected) ? 'fa fa-spotify' : 'si si-deezer'"></i>
          <h3>Nenhuma música encontrada</h3>
          <p>Não conseguimos encontrar músicas para esta década no momento.</p>
          <button @click="$router.back()" class="btn-secondary">Voltar para Busca</button>
        </div>

        <div v-else class="tracks-list">
          <div class="list-header">
            <span class="col-index">#</span>
            <span class="col-title">Título</span>
            <span class="col-album">Álbum</span>
            <span class="col-duration"><i class="fa fa-clock-o"></i></span>
          </div>

          <div 
            v-for="(track, index) in results" 
            :key="track.id" 
            class="track-row"
            @click="playTrack(track, index)"
          >
            <div class="col-index">
              <span class="track-number">{{ index + 1 }}</span>
              <i class="fa fa-play track-play-icon"></i>
            </div>
            <div class="col-title">
              <img :src="getTrackImage(track)" :alt="track.title" class="track-thumb" @error="$event.target.style.display='none'">
              <div class="track-info">
                <span class="track-name">{{ track.title }}</span>
                <span class="track-artist">{{ track.artist?.name || 'Artista Desconhecido' }}</span>
              </div>
            </div>
            <div class="col-album">{{ track.album?.title || '-' }}</div>
            <div class="col-duration">
              <span class="source-badge-list" :class="track.source">
                <i :class="getSourceIcon(track.source)"></i>
              </span>
              
              <!-- Curtir: só aparece se logado e Spotify conectado -->
             <button
  v-if="!isLogged"
  class="btn-like"
  @click.stop="openLoginModal"
  title="Faça login para curtir"
>
  <i class="fa fa-heart-o"></i>
</button>

<button
  v-else-if="track.source !== 'spotify'"
  class="btn-like disabled"
  @click.stop="showToast('Faça login com Spotify para curtir', 'info')"
  title="Deezer: login necessário"
>
  <i class="fa fa-heart-o"></i>
</button>

<button
  v-else
  class="btn-like"
  @click.stop="toggleLike(track)"
  :class="{ liked: isTrackLiked(track.id) }"
>
  <i :class="isTrackLiked(track.id) ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
</button>
              
              {{ formatDuration(track.duration) }}
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <i :class="toast.icon"></i>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- Modal de Login -->
    <transition name="modal">
      <div v-if="showLoginModal" class="login-modal-overlay" @click="closeLoginModal">
        <div class="login-modal" @click.stop>
          <div class="modal-icon">
            <i class="fa fa-lock"></i>
          </div>
          <h3>Login Necessário</h3>
          <p>Faça login para acessar recursos do Spotify: curtir músicas, favoritar artistas e álbuns, e ouvir previews exclusivos.</p>
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
  </div>
</template>
<script>
export default {
  name: 'DecadePlaylist',
  data() {
    return {
      decadeName: '',
      results: [],
      isLoading: true,
      isLogged: false,
      spotifyConnected: false,
      likedTracks: [],
      showLoginModal: false,
      toast: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fa fa-check-circle'
      },
    
      detailedCategories: {
        decades: [
          { name: '2020s', description: 'O som do presente e as novas tendências.', popularity: 95 },
          { name: '2010s', description: 'A era do streaming e do pop eletrônico.', popularity: 90 },
          { name: '2000s', description: 'O auge do indie, emo e o novo pop.', popularity: 85 },
          { name: '90s', description: 'Grunge, Britpop e a explosão do Hip Hop.', popularity: 88 },
          { name: '80s', description: 'Sintetizadores, New Wave e Rock clássico.', popularity: 92 },
          { name: '70s', description: 'Disco, Funk e o amadurecimento do Rock.', popularity: 80 },
          { name: '60s', description: 'A revolução cultural e a invasão britânica.', popularity: 75 },
          { name: '50s', description: 'O nascimento do Rock n Roll.', popularity: 65 },
          { name: '40s', description: 'A era das Big Bands e do Swing.', popularity: 50 },
          { name: '30s', description: 'Blues clássico e Jazz tradicional.', popularity: 40 },
          { name: '20s', description: 'Os loucos anos 20 e o Jazz primitivo.', popularity: 35 }
        ]
      }
    }
  },
  computed: {
    decadeInfo() {
      return this.detailedCategories.decades.find(d => d.name === this.decadeName) || {}
    },
    totalDuration() {
      const totalSeconds = this.results.reduce((acc, track) => acc + (track.duration || 0), 0)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      return hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`
    }
  },

async mounted() {
  const nomeParam = this.$route.params.nome
  this.decadeName = nomeParam ? decodeURIComponent(nomeParam) : ''
  
  await this.checkSpotifyStatus()
  
  if (this.isLogged) {
    await this.loadLikedTracks()
  }
  await this.loadDecadeTracks()
},

watch: {
  '$route.params.nome': {
    immediate: true,
    async handler(newVal) {
      if (newVal) {
        this.decadeName = decodeURIComponent(newVal)
        await this.checkSpotifyStatus()
        await this.loadDecadeTracks()
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
    console.error('[DecadePlaylist] Erro ao verificar Spotify:', err)
    this.spotifyConnected = false
    return false
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

 async loadDecadeTracks() {
  this.isLoading = true
  this.results = []
  try {
    const range = this.getDecadeRange(this.decadeName)
    if (!range) {
      this.isLoading = false
      return
    }

    // ← MUDANÇA PRINCIPAL: usa this.spotifyConnected em vez de só this.isLogged
    if (this.isLogged && this.spotifyConnected) {
      try {
        await this.loadSpotifyDecadeTracks(range)
      } catch (err) {
        console.error('Spotify falhou, fallback Deezer:', err)
        this.showToast('Spotify indisponível. Usando Deezer...', 'info')
        await this.loadDeezerDecadeTracks(range)
      }
    } else {
      await this.loadDeezerDecadeTracks(range)
    }
  } catch (err) {
    console.error('Erro ao carregar décadas:', err)
    this.results = []
  } finally {
    this.isLoading = false
  }
},

    // ========== DEEZER (NÃO LOGADO) ==========
    async loadDeezerDecadeTracks(range) {
      const deezerQuery = this.getDeezerDecadeQuery(this.decadeName)

      try {
        const res = await fetch(
          `http://localhost:3002/deezer/search?q=${encodeURIComponent(deezerQuery)}&limit=50`
        )
        const deezerData = await res.json()

        if (deezerData.data && Array.isArray(deezerData.data)) {
          this.results = deezerData.data.map(t => ({
            id: t.id,
            title: t.title,
            artist: {
              name: t.artist?.name || 'Artista desconhecido'
            },
            album: {
              title: t.album?.title || '',
              cover: t.album?.cover_medium || ''
            },
            cover: t.album?.cover_medium,
            preview: t.preview,
            duration: t.duration,
            type: 'track',
            source: 'deezer'
          }))
        }
      } catch (err) {
        console.error('Erro Deezer:', err)
        this.results = []
      }
    },

    // ========== SPOTIFY (LOGADO) ==========
    async loadSpotifyDecadeTracks(range) {
      const token = localStorage.getItem('token')
      const spotifyQuery = this.getSpotifyDecadeQuery(this.decadeName)

      try {
        // Busca tracks da década no Spotify
        const searchRes = await fetch(
          `http://localhost:3002/spotify/search?q=${encodeURIComponent(spotifyQuery)}&type=track&limit=50&market=BR`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (!searchRes.ok) {
          // Se der erro no Spotify (token expirado, etc), cai no fallback Deezer
          if (searchRes.status === 401 || searchRes.status === 403) {
            this.showToast('Spotify desconectado. Usando Deezer...', 'info')
            this.isSpotifyConnected = false
            await this.loadDeezerDecadeTracks(range)
            return
          }
          throw new Error(`Spotify search error: ${searchRes.status}`)
        }

        const searchData = await searchRes.json()

        if (searchData.tracks?.items && Array.isArray(searchData.tracks.items)) {
          this.results = searchData.tracks.items.map(t => ({
            id: t.id,
            title: t.name,
            artist: {
              name: t.artists?.map(a => a.name).join(', ') || 'Artista desconhecido'
            },
            album: {
              title: t.album?.name || '',
              cover: t.album?.images?.[0]?.url || ''
            },
            cover: t.album?.images?.[0]?.url,
            preview: t.preview_url || '',
            duration: Math.floor(t.duration_ms / 1000),
            type: 'track',
            source: 'spotify',
            spotifyUri: t.uri,
            explicit: t.explicit,
            popularity: t.popularity
          }))
        }
      } catch (err) {
        console.error('Erro Spotify, fallback para Deezer:', err)
        this.showToast('Erro no Spotify. Usando Deezer...', 'info')
        await this.loadDeezerDecadeTracks(range)
      }
    },

    getDeezerDecadeQuery(decade) {
      const queries = {
        '2020s': 'top hits 2020 2021 2022 2023 2024',
        '2010s': 'top hits 2010 2011 2012 2013 2014 2015',
        '2000s': 'top hits 2000 2001 2002 2003 2004 2005',
        '90s': 'top hits 1990 1995 1996 1997 1998 1999',
        '80s': 'top hits 1980 1985 1986 1987 1988 1989',
        '70s': 'top hits 1970 1975 1976 1977 1978 1979',
        '60s': 'top hits 1960 1965 1966 1967 1968 1969',
        '50s': 'top hits 1950 1955 1956 1957 1958 1959',
        '40s': 'top hits 1940 1945 1946 1947 1948 1949',
        '30s': 'top hits 1930 1935 1936 1937 1938 1939',
        '20s': 'top hits 1920 1925 1926 1927 1928 1929'
      }
      return queries[decade] || `top hits ${decade}`
    },

    getSpotifyDecadeQuery(decade) {
      const queries = {
        '2020s': 'year:2020-2024',
        '2010s': 'year:2010-2019',
        '2000s': 'year:2000-2009',
        '90s': 'year:1990-1999',
        '80s': 'year:1980-1989',
        '70s': 'year:1970-1979',
        '60s': 'year:1960-1969',
        '50s': 'year:1950-1959',
        '40s': 'year:1940-1949',
        '30s': 'year:1930-1939',
        '20s': 'year:1920-1929'
      }
      // Spotify search query com filtro de ano + termo popular
      const baseQuery = queries[decade] || ''
      return `${baseQuery} genre:pop`
    },

    getDecadeRange(decadeName) {
      const ranges = {
        '2020s': { start: 2020, end: 2029 },
        '2010s': { start: 2010, end: 2019 },
        '2000s': { start: 2000, end: 2009 },
        '90s': { start: 1990, end: 1999 },
        '80s': { start: 1980, end: 1989 },
        '70s': { start: 1970, end: 1979 },
        '60s': { start: 1960, end: 1969 },
        '50s': { start: 1950, end: 1959 },
        '40s': { start: 1940, end: 1949 },
        '30s': { start: 1930, end: 1939 },
        '20s': { start: 1920, end: 1929 }
      }
      return ranges[decadeName] || null
    },

    async loadLikedTracks() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.likedTracks = []
        return
      }
      try {
        const res = await fetch('http://localhost:3002/curtidas', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        this.likedTracks = data.map(c => String(c.id))
      } catch (err) {
        console.error('Erro ao carregar curtidas:', err)
        this.likedTracks = []
      }
    },

    async registrarHistoricoLocal(track) {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        await fetch('http://localhost:3002/historico/reproducao', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            musicaId: track.id,
            titulo: track.title,
            artista: track.artist?.name || 'Desconhecido',
            capa: this.getTrackImage(track),
            source: track.source,
            tipo: 'musica'
          })
        })
      } catch (err) {
        console.error('Erro ao registrar histórico:', err)
      }
    },

    getDecadeIcon(decade = '') {
      const icons = {
        '2020s': 'fa fa-rocket', '2010s': 'fa fa-wifi', '2000s': 'fa fa-play-circle',
        '90s': 'fa fa-television', '80s': 'fa fa-bolt', '70s': 'fa fa-dot-circle-o',
        '60s': 'fa fa-magic', '50s': 'fa fa-headphones', '40s': 'fa fa-volume-up',
        '30s': 'fa fa-microphone', '20s': 'fa fa-bullhorn'
      }
      return icons[decade] || 'fa fa-calendar'
    },

    getDecadeGradient(decade) {
      const colors = {
        '2020s': '#1db954', '2010s': '#4facfe', '2000s': '#f093fb',
        '90s': '#f5576c', '80s': '#fa709a', '70s': '#43e97b',
        '60s': '#30cfd0', '50s': '#a18cd1', '40s': '#ffecd2',
        '30s': '#84fab0', '20s': '#ff9a9e'
      }
      const color = colors[decade] || '#1db954'
      return { background: `linear-gradient(135deg, ${color} 0%, #0a0a1a 100%)` }
    },

    getTrackImage(track) {
      if (track.source === 'spotify') {
        return track.cover || track.album?.cover || '/default-cover.png'
      }
      if (track.source === 'deezer') {
        return track.cover || track.album?.cover || '/default-cover.png'
      }
      return track.cover || track.album?.cover || track.picture || '/default-cover.png'
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
      if (!seconds) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    isTrackLiked(id) {
      return this.likedTracks.includes(String(id))
    },

    playTrack(track, index) {
      // Registrar no histórico
      this.registrarHistoricoLocal(track)

      const playerSong = {
        id: track.id,
        title: track.title,
        artist: track.artist?.name || 'Artista desconhecido',
        cover: this.getTrackImage(track),
        url: track.preview || '',
        preview: track.preview || '',
        duration: track.duration || 30,
        type: 'track',
        source: track.source || 'deezer'
      }

      const playlist = this.results
        .filter(r => r.type === 'track' || r.preview)
        .map(t => ({
          id: t.id,
          title: t.title,
          artist: t.artist?.name || 'Artista desconhecido',
          cover: this.getTrackImage(t),
          url: t.preview || '',
          preview: t.preview || '',
          duration: t.duration || 30,
          source: t.source || 'deezer'
        }))

      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: playlist.length > 0 ? playlist : [playerSong],
          index: index,
          context: 'decade'
        }
      }))
    },

    playAll() {
      const playableTracks = this.results.filter(r => r.type === 'track' || r.preview)
      if (playableTracks.length > 0) {
        const firstIndex = this.results.indexOf(playableTracks[0])
        this.playTrack(playableTracks[0], firstIndex >= 0 ? firstIndex : 0)
      }
    },

async toggleLike(track) {
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
        const source = track.source || 'spotify'

        const body = {
          source: source,
          dadosMusica: {
            titulo: track.title || 'Sem título',
            artista: track.artist?.name || 'Desconhecido',
            capa: this.getTrackImage(track) || '',
            previewUrl: track.preview || '',
            duration: track.duration || 30,
            ano: track.ano || null,
            album: track.album?.title || ''
          }
        }

        const res = await fetch(
          `http://localhost:3002/curtidas/${trackId}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          }
        )

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          this.showToast(errorData.error || errorData.message || `Erro ${res.status}`, 'error')
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
        this.showToast('Erro ao processar curtida', 'error')
      }
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

.decade-playlist-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
  color: #fff;
  padding-bottom: 100px;
  font-family: 'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.playlist-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.playlist-header {
  padding: 60px 32px;
  border-radius: 0 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin: 0 -24px 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 32px;
}

.decade-badge-large {
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

.decade-badge-large i {
  font-size: 80px;
  color: #fff;
}

.header-text {
  flex: 1;
}

.playlist-type {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  display: block;
}

.decade-title {
  font-size: 72px;
  font-weight: 900;
  margin: 0 0 16px;
  letter-spacing: -2px;
  color: #fff;
}

.decade-description {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.playlist-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-badge {
  background: rgba(29, 185, 84, 0.15);
  border: 1px solid rgba(29, 185, 84, 0.4);
  color: #1db954;
  padding: 4px 12px;
  border-radius: 500px;
  font-size: 12px;
}

.source-badge.deezer {
  background: rgba(255, 102, 0, 0.15);
  border-color: rgba(255, 102, 0, 0.4);
  color: #ff6600;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.btn-play-all {
  padding: 14px 32px;
  background: #1db954;
  color: #000;
  border: none;
  border-radius: 500px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.btn-play-all:hover:not(:disabled) {
  transform: scale(1.05);
  background: #1ed760;
  box-shadow: 0 8px 24px rgba(29, 185, 84, 0.4);
}

.btn-play-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-back {
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  border-radius: 500px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
}
/* Lista de Músicas */
.tracks-list {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 50px 1fr 1fr 140px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #888;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.track-row {
  display: grid;
  grid-template-columns: 50px 1fr 1fr 140px;
  padding: 12px 24px;
  align-items: center;
  transition: background 0.2s;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
}

.track-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.track-row:hover .track-number {
  display: none;
}

.track-row:hover .track-play-icon {
  display: flex;
}

.col-index {
  color: #666;
  font-family: monospace;
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-number {
  display: block;
}

.track-play-icon {
  display: none;
  font-size: 12px;
  color: #fff;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.track-thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  background: #282828;
}

.track-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track-name {
  font-weight: 600;
  font-size: 15px;
  color: #fff;
}

.track-artist {
  font-size: 13px;
  color: #888;
}

.col-album {
  color: #888;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-duration {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  color: #888;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.source-badge-list {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  flex-shrink: 0;
}

.source-badge-list.spotify {
  background: rgba(29, 185, 84, 0.15);
  border-color: rgba(29, 185, 84, 0.4);
  color: #1db954;
}

.source-badge-list.deezer {
  background: rgba(255, 102, 0, 0.15);
  border-color: rgba(255, 102, 0, 0.4);
  color: #ff6600;
}

.source-badge-list.local {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #888;
}

.btn-like {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.btn-like:hover {
  color: #ec4899;
  background: rgba(236, 72, 153, 0.1);
}

.btn-like.liked {
  color: #ec4899;
}

.btn-like.liked:hover {
  color: #f472b6;
}

.btn-like.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-like.disabled:hover {
  color: #888;
  background: none;
  transform: none;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  gap: 20px;
  color: #888;
  text-align: center;
}

.loading-source {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.empty-state i {
  font-size: 48px;
  color: #1db954;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 20px;
  color: #fff;
  margin: 0;
}

.empty-state p {
  font-size: 14px;
  color: #666;
  max-width: 400px;
  margin: 0;
}

.btn-secondary {
  padding: 12px 24px;
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

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* Modal de Login */
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

.modal-actions .btn-primary {
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

.modal-actions .btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(29, 185, 84, 0.4);
}

.modal-actions .btn-secondary {
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

.modal-actions .btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  .decade-badge-large {
    width: 140px;
    height: 140px;
  }
  .decade-badge-large i {
    font-size: 60px;
  }
  .decade-title {
    font-size: 48px;
  }
  .spotify-connect-banner {
    flex-direction: column;
    text-align: center;
  }
  .col-album {
    display: none;
  }
  .list-header, .track-row {
    grid-template-columns: 40px 1fr 100px;
  }
  .playlist-header {
    padding: 40px 20px;
  }
  .header-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .decade-title {
    font-size: 36px;
  }
  .decade-description {
    font-size: 14px;
  }
  .playlist-stats {
    flex-direction: column;
    gap: 8px;
  }
  .track-thumb {
    width: 40px;
    height: 40px;
  }
  .track-name {
    font-size: 13px;
  }
  .track-artist {
    font-size: 11px;
  }
}
</style>