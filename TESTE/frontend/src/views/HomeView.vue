<template>
  <div class="home">
    <div class="home-content">

      <!-- HEADER COM BRAND SOUNDUP -->
      <header class="home-header">
        <div class="header-brand">
          <div class="brand-icon-wrapper">
            <i class="fa fa-music brand-icon"></i>
            <div class="brand-pulse"></div>
          </div>
          <div class="brand-info">
            <span class="brand-text">SoundUp</span>
            <span class="brand-tagline">Milhões de músicas • Deezer API</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-header" @click="refreshAllData" title="Atualizar">
            <i class="fa fa-refresh" :class="{ 'spinning': loading }"></i>
          </button>
        </div>
      </header>

      <!-- HERO DESTACADO COM MÚSICA ALEATÓRIA DA API -->
      <div class="hero-banner" :style="heroGradient">
        <div class="hero-ambient"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <i class="fa fa-certificate"></i> {{ heroBadge }}
            <span class="badge-live" v-if="isPlaying">
              <span class="live-dot"></span> AO VIVO
            </span>
          </div>
          <h1 class="hero-title">{{ heroTitle }}</h1>
          <p class="hero-artist">{{ heroArtist }}</p>
          <p class="hero-description">
            {{ heroDescription }}
            <span class="highlight">{{ heroHighlight }}</span>
          </p>
          
          <div class="hero-progress" v-if="currentTrack && isPlaying">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="progress-time">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn-primary btn-glow" @click="playHeroSong" :disabled="!currentRandomSong">
              <i class="fa" :class="isPlaying && isCurrentTrack(currentRandomSong) ? 'fa-pause' : 'fa-play'"></i>
              {{ isPlaying && isCurrentTrack(currentRandomSong) ? 'Pausar' : 'Ouvir Agora' }}
            </button>
            <button class="btn-secondary" @click="skipHeroSong" :disabled="loading">
              <i class="fa fa-step-forward"></i> Próxima
            </button>
            <button class="btn-secondary btn-icon" @click="toggleLike" :class="{ 'active': isLiked }">
              <i class="fa" :class="isLiked ? 'fa-heart' : 'fa-heart-o'"></i>
            </button>
          </div>

          <div class="hero-stats" v-if="currentRandomSong">
            <div class="stat-item">
              <i class="fa fa-music"></i>
              <span>{{ currentRandomSong.title }}</span>
            </div>
            <div class="stat-item">
              <i class="fa fa-user"></i>
              <span>{{ currentRandomSong.artist }}</span>
            </div>
            <div class="stat-item" v-if="currentRandomSong.duration">
              <i class="fa fa-clock-o"></i>
              <span>{{ formatDuration(currentRandomSong.duration) }}</span>
            </div>
            <div class="stat-item" v-if="currentRandomSong.rank">
              <i class="fa fa-bar-chart"></i>
              <span>Rank #{{ currentRandomSong.rank }}</span>
            </div>
          </div>
        </div>

        <div class="hero-image">
          <div class="vinyl-container" :class="{ 'playing': isPlaying }">
            <div class="vinyl-record">
              <div class="vinyl-grooves"></div>
              <div class="vinyl-label">
                <img 
                  v-if="currentRandomSong && currentRandomSong.cover" 
                  :src="currentRandomSong.cover" 
                  @error="handleImageError"
                  alt="Album Cover"
                />
                <i v-else class="fa fa-music"></i>
              </div>
            </div>
            <div class="vinyl-reflection"></div>
          </div>
          <div class="floating-notes" v-if="isPlaying">
            <i class="fa fa-music note-1"></i>
            <i class="fa fa-music note-2"></i>
            <i class="fa fa-music note-3"></i>
          </div>
        </div>
      </div>

      <!-- PLAYER EMBEDDED -->
      <div class="embedded-player" v-if="currentTrack">
        <audio 
          ref="audioPlayer" 
          :src="currentTrack.preview" 
          @timeupdate="updateProgress"
          @ended="onTrackEnded"
          @loadedmetadata="onLoadedMetadata"
          autoplay
        ></audio>
      </div>

      <!-- SEÇÃO: Tocadas Recentemente -->
      <section class="section" v-if="recentlyPlayed.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-history section-icon"></i>
              Tocadas Recentemente
            </h2>
            <span class="section-count">{{ recentlyPlayed.length }} músicas</span>
          </div>
          <button class="see-all" @click="showAllRecent">
            Ver tudo <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row" :class="{ 'expanded': showAllRecentTracks }">
          <div 
            v-for="(track, index) in recentlyPlayed.slice(0, showAllRecentTracks ? 12 : 6)" 
            :key="'recent-'+track.id"
            class="music-card"
            @click="playTrack(track, 'recent', index)"
            :class="{ 'active': isCurrentTrack(track), 'playing': isCurrentTrack(track) && isPlaying }"
          >
            <div class="card-image">
              <img :src="track.cover" @error="handleImageError" alt="Cover" />
              <div class="play-button-overlay">
                <i class="fa" :class="isCurrentTrack(track) && isPlaying ? 'fa-pause-circle' : 'fa-play-circle'"></i>
              </div>
              <div class="equalizer" v-if="isCurrentTrack(track) && isPlaying">
                <span v-for="n in 4" :key="n"></span>
              </div>
              <div class="preview-badge"><i class="fa fa-headphones"></i> 30s</div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-artist">{{ track.artist }}</p>
            </div>
            <button class="card-more" @click.stop="showTrackOptions(track)">
              <i class="fa fa-ellipsis-h"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Top 10 Brasil -->
      <section class="section" v-if="chartTracks.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-fire section-icon hot"></i>
              Top 10 Brasil
            </h2>
            <span class="section-subtitle">Mais tocados do momento</span>
          </div>
          <button class="see-all" @click="loadMoreTracks">
            {{ loadingMoreTracks ? 'Carregando...' : 'Ver mais' }} 
            <i class="fa" :class="loadingMoreTracks ? 'fa-spinner fa-spin' : 'fa-chevron-right'"></i>
          </button>
        </div>
        <div class="cards-row">
          <div 
            v-for="(track, index) in chartTracks.slice(0, 5)" 
            :key="'chart-'+track.id"
            class="music-card"
            @click="playTrack(track, 'chart', index)"
            :class="{ 'active': isCurrentTrack(track), 'playing': isCurrentTrack(track) && isPlaying }"
          >
            <div class="card-image">
              <img :src="track.album?.cover_medium || track.cover" @error="handleImageError" alt="Cover" />
              <div class="rank-badge" :class="{ 'top3': index < 3 }">{{ index + 1 }}</div>
              <div class="play-button-overlay">
                <i class="fa" :class="isCurrentTrack(track) && isPlaying ? 'fa-pause-circle' : 'fa-play-circle'"></i>
              </div>
              <div class="equalizer" v-if="isCurrentTrack(track) && isPlaying">
                <span v-for="n in 4" :key="n"></span>
              </div>
              <div class="preview-badge"><i class="fa fa-headphones"></i> Preview</div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-artist">{{ track.artist?.name || track.artist }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Lançamentos Recentes -->
      <section class="section" v-if="newReleases.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-bullhorn section-icon new"></i>
              Lançamentos
            </h2>
            <span class="section-subtitle">Novidades da semana</span>
          </div>
          <button class="see-all" @click="loadMoreReleases">
            Ver mais <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row">
          <div 
            v-for="(album, index) in newReleases.slice(0, 5)" 
            :key="'release-'+album.id"
            class="music-card album-card"
            @click="playAlbumTracks(album)"
            :class="{ 'active': isCurrentAlbum(album) }"
          >
            <div class="card-image">
              <img :src="album.cover_medium" @error="handleImageError" alt="Album Cover" />
              <div class="play-button-overlay">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="new-badge"><i class="fa fa-star"></i> NEW</div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ album.title }}</h3>
              <p class="card-artist">{{ album.artist?.name }}</p>
              <p class="card-date"><i class="fa fa-calendar"></i> {{ formatDate(album.release_date) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Artistas Populares -->
      <section class="section" v-if="popularArtists.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-microphone section-icon artist"></i>
              Artistas em Alta
            </h2>
            <span class="section-subtitle">Tendências do momento</span>
          </div>
          <button class="see-all" @click="loadMoreArtists">
            Ver todos <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row artists-row">
          <div 
            v-for="(artist, index) in popularArtists.slice(0, 5)" 
            :key="'artist-'+artist.id"
            class="music-card artist-card"
            @click="playArtistTopTrack(artist)"
            :class="{ 'active': currentArtist?.id === artist.id }"
          >
            <div class="card-image artist-image">
              <img :src="artist.picture_medium" @error="handleImageError" alt="Artist" />
              <div class="play-button-overlay artist-play">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="artist-fans">
                <i class="fa fa-users"></i> {{ formatFans(artist.nb_fan) }}
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ artist.name }}</h3>
              <p class="card-artist">Artista</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Gêneros Populares -->
      <section class="section" v-if="genres.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-guitar section-icon genre"></i>
              Gêneros
            </h2>
            <span class="section-subtitle">Explore por estilo</span>
          </div>
        </div>
        <div class="categories-grid">
          <div
            v-for="(genre, index) in genres.slice(0, 8)"
            :key="'genre-'+genre.id"
            class="category-tile"
            @click="navigateToSearch(genre.name)"
            :style="{ background: genreGradients[index % genreGradients.length] }"
          >
            <div class="category-content">
              <h3>{{ genre.name }}</h3>
              <span class="category-explore">
                Explorar <i class="fa fa-arrow-right"></i>
              </span>
            </div>
            <img 
              v-if="genre.picture_medium" 
              :src="genre.picture_medium" 
              class="genre-image" 
              @error="handleImageError"
              alt="Genre"
            />
            <i v-else class="fa fa-music genre-icon"></i>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Playlists Populares -->
      <section class="section" v-if="popularPlaylists.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-list-alt section-icon playlist"></i>
              Playlists em Destaque
            </h2>
            <span class="section-subtitle">Curadoria especial</span>
          </div>
          <button class="see-all" @click="loadMorePlaylists">
            Ver tudo <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row">
          <div 
            v-for="(playlist, index) in popularPlaylists.slice(0, 5)" 
            :key="'playlist-'+playlist.id"
            class="music-card playlist-card"
            @click="playPlaylistTracks(playlist)"
            :class="{ 'active': isCurrentPlaylist(playlist) }"
          >
            <div class="card-image">
              <img :src="playlist.picture_medium" @error="handleImageError" alt="Playlist" />
              <div class="play-button-overlay">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="playlist-badge">
                <i class="fa fa-list"></i> {{ playlist.nb_tracks }} músicas
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ playlist.title }}</h3>
              <p class="card-artist">Por {{ playlist.user?.name || 'Deezer' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Recomendado para Você -->
      <section class="section" v-if="recommendedTracks.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-lightbulb-o section-icon rec"></i>
              Recomendado para Você
            </h2>
            <span class="section-subtitle">Baseado nos charts</span>
          </div>
          <button class="see-all" @click="refreshRecommendations">
            <i class="fa fa-refresh"></i> Atualizar
          </button>
        </div>
        <div class="cards-row">
          <div 
            v-for="(track, index) in recommendedTracks.slice(0, 5)" 
            :key="'rec-'+track.id"
            class="music-card"
            @click="playTrack(track, 'recommended', index)"
            :class="{ 'active': isCurrentTrack(track), 'playing': isCurrentTrack(track) && isPlaying }"
          >
            <div class="card-image">
              <img :src="track.album?.cover_medium || track.cover" @error="handleImageError" alt="Cover" />
              <div class="play-button-overlay">
                <i class="fa" :class="isCurrentTrack(track) && isPlaying ? 'fa-pause-circle' : 'fa-play-circle'"></i>
              </div>
              <div class="equalizer" v-if="isCurrentTrack(track) && isPlaying">
                <span v-for="n in 4" :key="n"></span>
              </div>
              <div class="preview-badge"><i class="fa fa-headphones"></i> Preview</div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-artist">{{ track.artist?.name || track.artist }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Mixes Diários -->
      <section class="section" v-if="radioMixes.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-headphones section-icon mix"></i>
              Mixes Diários
            </h2>
            <span class="section-subtitle">Feitos só para você</span>
          </div>
        </div>
        <div class="mixes-grid">
          <div 
            v-for="(mix, index) in radioMixes.slice(0, 4)" 
            :key="'mix-'+mix.id"
            class="mix-card"
            @click="playRadioTracks(mix)"
            :style="{ background: mix.gradient || genreGradients[index] }"
          >
            <div class="mix-content">
              <i :class="mix.icon || 'fa fa-music'"></i>
              <h3 class="mix-title">{{ mix.title }}</h3>
              <p class="mix-description">{{ mix.description || 'Mix baseado nas tendências' }}</p>
            </div>
            <div class="mix-play">
              <i class="fa fa-play"></i>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Rádios -->
      <section class="section" v-if="radios.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-rss section-icon radio"></i>
              Rádios
            </h2>
            <span class="section-subtitle">Estações sem parar</span>
          </div>
          <button class="see-all" @click="loadMoreRadios">
            Ver todas <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row">
          <div 
            v-for="(radio, index) in radios.slice(0, 5)" 
            :key="'radio-'+radio.id"
            class="music-card radio-card"
            @click="playRadioTracks(radio)"
          >
            <div class="card-image">
              <img :src="radio.picture_medium" @error="handleImageError" alt="Radio" />
              <div class="play-button-overlay">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="radio-wave" :class="{ 'active': isCurrentRadio(radio) && isPlaying }">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ radio.title }}</h3>
              <p class="card-artist">Rádio • {{ radio.type || 'Música' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Categorias -->
      <section class="section">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-compass section-icon browse"></i>
              Navegar por Categoria
            </h2>
            <span class="section-subtitle">Encontre seu estilo</span>
          </div>
        </div>
        <div class="categories-grid">
          <div
            v-for="(cat, index) in categories"
            :key="index"
            class="category-tile"
            @click="navigateToSearch(cat.name)"
            :style="{ background: cat.gradient }"
          >
            <div class="category-content">
              <h3>{{ cat.name }}</h3>
              <span class="category-explore">
                Explorar <i class="fa fa-arrow-right"></i>
              </span>
            </div>
            <i :class="cat.icon" class="category-icon"></i>
          </div>
        </div>
      </section>

      <!-- LOADING STATE -->
      <div v-if="loading && !chartTracks.length" class="loading-overlay">
        <div class="spinner-container">
          <div class="spinner"></div>
          <div class="spinner-pulse"></div>
        </div>
        <p>Carregando músicas do SoundUp...</p>
        <span class="loading-sub">Conectando à API</span>
      </div>

      <!-- TOAST NOTIFICATION -->
      <transition name="toast">
        <div v-if="toast.visible" class="toast-notification" :class="toast.type">
          <div class="toast-icon-wrapper">
            <i :class="toast.icon"></i>
          </div>
          <div class="toast-content">
            <span class="toast-title">{{ toast.title }}</span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <button class="toast-close" @click="hideToast">
            <i class="fa fa-times"></i>
          </button>
          <div class="toast-progress" :style="{ width: toast.progress + '%' }"></div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script>
export default {
  name: "Home",

  data() {
    return {
      // API Configuration
      DEEZER_API: 'https://api.allorigins.win/raw?url=https://api.deezer.com',
      
      // Player State
      isPlaying: false,
      isLiked: false,
      currentTrack: null,
      currentPlaylist: null,
      currentAlbum: null,
      currentArtist: null,
      currentRadio: null,
      loading: false,
      loadingMoreTracks: false,
      showAllRecentTracks: false,
      
      // Audio Progress
      currentTime: 0,
      duration: 30,
      progressPercent: 0,
      
      // API Data
      chartTracks: [],
      popularArtists: [],
      newReleases: [],
      popularPlaylists: [],
      genres: [],
      radios: [],
      recommendedTracks: [],
      radioMixes: [],
      allApiTracksPool: [],
      
      // Hero Section
      heroTitle: "Descubra Agora",
      heroArtist: "Artistas em destaque",
      heroDescription: "Milhões de músicas da API Deezer.",
      heroHighlight: "Previews de 30s disponíveis.",
      heroBadge: "SoundUp",
      heroGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      currentRandomSong: null,
      
      // Recently Played
      recentlyPlayed: [],
      
      // Toast
      toast: {
        visible: false,
        title: '',
        message: '',
        type: 'success',
        icon: 'fa fa-check-circle',
        progress: 100,
        timer: null
      },

      // Categories with Font Awesome icons only
      categories: [
        { name: "Pop", icon: "fa fa-star", gradient: "linear-gradient(135deg, #f093fb, #f5576c)" },
        { name: "Rock", icon: "fa fa-bolt", gradient: "linear-gradient(135deg, #fa709a, #fee140)" },
        { name: "Hip Hop", icon: "fa fa-fire", gradient: "linear-gradient(135deg, #ff0844, #ffb199)" },
        { name: "Eletrônica", icon: "fa fa-headphones", gradient: "linear-gradient(135deg, #4facfe, #00f2fe)" },
        { name: "Sertanejo", icon: "fa fa-guitar", gradient: "linear-gradient(135deg, #8fd3f4, #84fab0)" },
        { name: "Funk", icon: "fa fa-fire", gradient: "linear-gradient(135deg, #ff5722, #ffab91)" },
        { name: "MPB", icon: "fa fa-music", gradient: "linear-gradient(135deg, #9C27B0, #E1BEE7)" },
        { name: "Jazz", icon: "fa fa-saxophone", gradient: "linear-gradient(135deg, #FFC107, #FFECB3)" }
      ],

      // Gradients
      genreGradients: [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
        "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
      ]
    }
  },

  mounted() {
    window.addEventListener('player-update', this.handlePlayerUpdate)
    this.loadAllApiData()
  },

  beforeDestroy() {
    window.removeEventListener('player-update', this.handlePlayerUpdate)
    if (this.$refs.audioPlayer) {
      this.$refs.audioPlayer.pause()
    }
    if (this.toast.timer) {
      clearInterval(this.toast.timer)
    }
  },

  methods: {
    // ============ NAVIGATION ============
    
    navigateToSearch(query) {
      // Navega para a rota de busca com o parâmetro de query
      if (this.$router) {
        this.$router.push({ 
          path: '/search', 
          query: { q: query } 
        })
      } else {
        // Fallback para navegação direta se router não estiver disponível
        window.location.href = `http://localhost:5173/search?q=${encodeURIComponent(query)}`
      }
      this.showToast('Busca', `Pesquisando por: ${query}`, 'info', 'fa fa-search')
    },

    // ============ API LOADING ============
    
    async loadAllApiData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadChartTracks(),
          this.loadPopularArtists(),
          this.loadNewReleases(),
          this.loadPopularPlaylists(),
          this.loadGenres(),
          this.loadRadios()
        ])
        
        this.generateRecommendations()
        this.generateRadioMixes()
        this.buildRandomPool()
        this.selectRandomHeroSong()
        
        this.showToast('Sucesso', 'Dados carregados com sucesso!', 'success', 'fa fa-check-circle')
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        this.showToast('Erro', 'Falha ao carregar dados da API', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },

    async refreshAllData() {
      this.chartTracks = []
      this.recommendedTracks = []
      await this.loadAllApiData()
    },

    async loadChartTracks() {
      try {
        const response = await fetch(`${this.DEEZER_API}/chart/0/tracks?limit=20`)
        const data = await response.json()
        if (data.data) {
          this.chartTracks = data.data
        }
      } catch (error) {
        console.error('Erro chart:', error)
      }
    },

    async loadPopularArtists() {
      try {
        const response = await fetch(`${this.DEEZER_API}/chart/0/artists?limit=15`)
        const data = await response.json()
        if (data.data) {
          this.popularArtists = data.data
        }
      } catch (error) {
        console.error('Erro artistas:', error)
      }
    },

    async loadNewReleases() {
      try {
        const response = await fetch(`${this.DEEZER_API}/chart/0/albums?limit=15`)
        const data = await response.json()
        if (data.data) {
          this.newReleases = data.data
        }
      } catch (error) {
        console.error('Erro lançamentos:', error)
      }
    },

    async loadPopularPlaylists() {
      try {
        const response = await fetch(`${this.DEEZER_API}/chart/0/playlists?limit=15`)
        const data = await response.json()
        if (data.data) {
          this.popularPlaylists = data.data
        }
      } catch (error) {
        console.error('Erro playlists:', error)
      }
    },

    async loadGenres() {
      try {
        const response = await fetch(`${this.DEEZER_API}/genre`)
        const data = await response.json()
        if (data.data) {
          this.genres = data.data.filter(g => g.id !== 0)
        }
      } catch (error) {
        console.error('Erro gêneros:', error)
      }
    },

    async loadRadios() {
      try {
        const response = await fetch(`${this.DEEZER_API}/radio/top?limit=20`)
        const data = await response.json()
        if (data.data) {
          this.radios = data.data
        }
      } catch (error) {
        console.error('Erro rádios:', error)
      }
    },

    // ============ CONTENT GENERATION ============

    generateRecommendations() {
      if (this.chartTracks.length > 0) {
        const shuffled = [...this.chartTracks].sort(() => 0.5 - Math.random())
        this.recommendedTracks = shuffled.slice(0, 10)
      }
    },

    generateRadioMixes() {
      if (this.radios.length > 0) {
        this.radioMixes = this.radios.slice(0, 4).map((radio, index) => ({
          ...radio,
          gradient: this.genreGradients[index % this.genreGradients.length],
          icon: 'fa fa-music',
          description: `Mix baseado em ${radio.title}`
        }))
      }
    },

    buildRandomPool() {
      this.allApiTracksPool = [...this.chartTracks]
      this.newReleases.forEach(album => {
        if (album.tracks?.data) {
          this.allApiTracksPool.push(...album.tracks.data)
        }
      })
    },

    // ============ HERO SECTION ============

    selectRandomHeroSong() {
      if (this.allApiTracksPool.length === 0) return
      
      const randomIndex = Math.floor(Math.random() * this.allApiTracksPool.length)
      const track = this.allApiTracksPool[randomIndex]
      
      this.currentRandomSong = this.convertTrackForPlayer(track)
      
      if (this.currentRandomSong) {
        this.heroTitle = this.currentRandomSong.title
        this.heroArtist = this.currentRandomSong.artist
        this.heroDescription = "Preview disponível"
        this.heroHighlight = "30 segundos de música"
        this.heroBadge = "Descoberta do Dia"
        
        const gradients = [
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        ]
        this.heroGradient = gradients[randomIndex % gradients.length]
      }
    },

    playHeroSong() {
      if (!this.currentRandomSong) return
      
      if (this.isCurrentTrack(this.currentRandomSong) && this.isPlaying) {
        this.pauseTrack()
      } else {
        this.playTrack(this.currentRandomSong, 'hero', 0)
      }
    },

    skipHeroSong() {
      this.selectRandomHeroSong()
      this.showToast('Nova Música', 'Nova descoberta selecionada', 'info', 'fa fa-music')
    },

    toggleLike() {
      this.isLiked = !this.isLiked
      const title = this.isLiked ? 'Adicionado aos Favoritos' : 'Removido dos Favoritos'
      const icon = this.isLiked ? 'fa fa-heart' : 'fa fa-heart-o'
      this.showToast(title, this.currentRandomSong?.title || 'Música', this.isLiked ? 'success' : 'info', icon)
    },

    // ============ AUDIO PLAYER ============

    updateProgress() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        this.currentTime = audio.currentTime
        this.duration = audio.duration || 30
        this.progressPercent = (this.currentTime / this.duration) * 100
      }
    },

    onLoadedMetadata() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        this.duration = audio.duration || 30
      }
    },

    onTrackEnded() {
      this.isPlaying = false
      this.progressPercent = 0
      this.currentTime = 0
      this.showToast('Preview Finalizado', 'A música terminou', 'info', 'fa fa-info-circle')
    },

    pauseTrack() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.pause()
        this.isPlaying = false
      }
    },

    // ============ PLAYBACK METHODS ============

    async playTrack(track, context, index) {
      if (this.isCurrentTrack(track) && this.isPlaying) {
        this.pauseTrack()
        return
      }

      this.currentTrack = track
      const playerTrack = this.convertTrackForPlayer(track)
      
      this.addToRecentlyPlayed(playerTrack)
      
      let playlist = []
      if (context === 'chart') {
        playlist = this.chartTracks.map(t => this.convertTrackForPlayer(t))
      } else if (context === 'recommended') {
        playlist = this.recommendedTracks.map(t => this.convertTrackForPlayer(t))
      } else if (context === 'recent') {
        playlist = this.recentlyPlayed
      } else {
        playlist = [playerTrack]
      }
      
      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerTrack,
          playlist: playlist,
          index: index,
          context: context
        }
      }))
      
      this.$nextTick(() => {
        const audio = this.$refs.audioPlayer
        if (audio) {
          audio.src = playerTrack.preview
          audio.play().then(() => {
            this.isPlaying = true
            this.showToast('Tocando Agora', playerTrack.title, 'success', 'fa fa-play-circle')
          }).catch(err => {
            console.error('Erro ao tocar:', err)
            this.showToast('Erro', 'Não foi possível tocar a música', 'error', 'fa fa-exclamation-circle')
          })
        }
      })
    },

    async playArtistTopTrack(artist) {
      this.loading = true
      try {
        const response = await fetch(`${this.DEEZER_API}/artist/${artist.id}/top?limit=5`)
        const data = await response.json()
        if (data.data?.length > 0) {
          this.currentArtist = artist
          this.playTrack(data.data[0], 'artist', 0)
        }
      } catch (error) {
        this.showToast('Erro', 'Falha ao carregar artista', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },

    async playAlbumTracks(album) {
      this.loading = true
      try {
        const response = await fetch(`${this.DEEZER_API}/album/${album.id}/tracks`)
        const data = await response.json()
        if (data.data?.length > 0) {
          this.currentAlbum = album
          this.playTrack(data.data[0], 'album', 0)
        }
      } catch (error) {
        this.showToast('Erro', 'Falha ao carregar álbum', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },

    async playPlaylistTracks(playlist) {
      this.loading = true
      try {
        const response = await fetch(`${this.DEEZER_API}/playlist/${playlist.id}/tracks`)
        const data = await response.json()
        if (data.data?.length > 0) {
          this.currentPlaylist = playlist
          this.playTrack(data.data[0], 'playlist', 0)
        }
      } catch (error) {
        this.showToast('Erro', 'Falha ao carregar playlist', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },

    async playRadioTracks(radio) {
      this.loading = true
      try {
        const response = await fetch(`${this.DEEZER_API}/radio/${radio.id}/tracks`)
        const data = await response.json()
        if (data.data?.length > 0) {
          this.currentRadio = radio
          this.playTrack(data.data[0], 'radio', 0)
        }
      } catch (error) {
        this.showToast('Erro', 'Falha ao carregar rádio', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },

    async playGenreTopTrack(genre) {
      this.loading = true
      try {
        const response = await fetch(`${this.DEEZER_API}/genre/${genre.id}/artists`)
        const data = await response.json()
        if (data.data?.length > 0) {
          const artist = data.data[0]
          const trackResponse = await fetch(`${this.DEEZER_API}/artist/${artist.id}/top?limit=1`)
          const trackData = await trackResponse.json()
          if (trackData.data?.length > 0) {
            this.playTrack(trackData.data[0], 'genre', 0)
          }
        }
      } catch (error) {
        this.showToast('Erro', 'Falha ao carregar gênero', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },

    // ============ UTILITIES ============

    convertTrackForPlayer(track) {
      if (track.type === 'api') return track
      
      return {
        id: track.id,
        title: track.title,
        artist: track.artist?.name || track.artist,
        cover: track.album?.cover_medium || track.cover || track.artist?.picture_medium,
        url: track.preview,
        preview: track.preview,
        duration: track.duration,
        type: 'api',
        explicit: track.explicit_lyrics,
        rank: track.rank
      }
    },

    addToRecentlyPlayed(track) {
      this.recentlyPlayed = this.recentlyPlayed.filter(t => t.id !== track.id)
      this.recentlyPlayed.unshift(track)
      this.recentlyPlayed = this.recentlyPlayed.slice(0, 10)
    },

    handlePlayerUpdate(e) {
      this.isPlaying = e.detail?.isPlaying || false
    },

    isCurrentTrack(track) {
      if (!this.currentTrack || !track) return false
      return this.currentTrack.id === track.id
    },

    isCurrentAlbum(album) {
      if (!this.currentAlbum || !album) return false
      return this.currentAlbum.id === album.id
    },

    isCurrentPlaylist(playlist) {
      if (!this.currentPlaylist || !playlist) return false
      return this.currentPlaylist.id === playlist.id
    },

    isCurrentRadio(radio) {
      if (!this.currentRadio || !radio) return false
      return this.currentRadio.id === radio.id
    },

    formatDuration(seconds) {
      if (!seconds) return "0:00"
      const m = Math.floor(seconds / 60)
      const s = seconds % 60
      return `${m}:${s.toString().padStart(2, '0')}`
    },

    formatTime(seconds) {
      if (!seconds) return "0:00"
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })
    },

    formatFans(num) {
      if (!num) return "0"
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return num.toString()
    },

    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE4MTgxOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiMxZGI5NTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJoTwvdGV4dD48L3N2Zz4='
    },

    // ============ TOAST SYSTEM ============
    
    showToast(title, message, type = 'success', icon = 'fa fa-check-circle') {
      // Limpa timer anterior se existir
      if (this.toast.timer) {
        clearInterval(this.toast.timer)
      }
      
      this.toast = {
        visible: true,
        title,
        message,
        type,
        icon,
        progress: 100,
        timer: null
      }
      
      // Animação da barra de progresso
      const duration = 3000 // 3 segundos
      const interval = 30
      const step = 100 / (duration / interval)
      
      this.toast.timer = setInterval(() => {
        this.toast.progress -= step
        if (this.toast.progress <= 0) {
          this.hideToast()
        }
      }, interval)
    },

    hideToast() {
      if (this.toast.timer) {
        clearInterval(this.toast.timer)
        this.toast.timer = null
      }
      this.toast.visible = false
    },

    showTrackOptions(track) {
      this.showToast('Opções', `Menu de opções: ${track.title}`, 'info', 'fa fa-ellipsis-h')
    },

    showAllRecent() {
      this.showAllRecentTracks = !this.showAllRecentTracks
    },

    async loadMoreTracks() {
      if (this.loadingMoreTracks) return
      this.loadingMoreTracks = true
      try {
        const response = await fetch(`${this.DEEZER_API}/chart/0/tracks?limit=50&index=${this.chartTracks.length}`)
        const data = await response.json()
        if (data.data) {
          this.chartTracks = [...this.chartTracks, ...data.data]
          this.buildRandomPool()
          this.showToast('Sucesso', 'Mais músicas carregadas!', 'success', 'fa fa-check-circle')
        }
      } catch (error) {
        this.showToast('Erro', 'Falha ao carregar mais músicas', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loadingMoreTracks = false
      }
    },

    refreshRecommendations() {
      this.generateRecommendations()
      this.showToast('Atualizado', 'Recomendações atualizadas!', 'success', 'fa fa-refresh')
    },

    loadMoreArtists() {
      this.showToast('Carregando', 'Buscando mais artistas...', 'info', 'fa fa-spinner fa-spin')
    },

    loadMoreReleases() {
      this.showToast('Carregando', 'Buscando mais lançamentos...', 'info', 'fa fa-spinner fa-spin')
    },

    loadMorePlaylists() {
      this.showToast('Carregando', 'Buscando mais playlists...', 'info', 'fa fa-spinner fa-spin')
    },

    loadMoreRadios() {
      this.showToast('Carregando', 'Buscando mais rádios...', 'info', 'fa fa-spinner fa-spin')
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

/* ========== ANIMATIONS ========== */
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes wave {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}

@keyframes equalizer {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.5); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes noteFloat {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-50px) rotate(20deg); opacity: 0; }
}

@keyframes livePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(29,185,84,0.5); }
  50% { box-shadow: 0 0 20px rgba(29,185,84,0.8), 0 0 40px rgba(29,185,84,0.4); }
}

/* ========== LAYOUT BASE ========== */
.home {
  min-height: 100vh;
  color: #fff;
  font-family: 'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  width: 100%;
  margin-left: 0;
  background: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
  padding: 24px 0 120px 0;
  display: flex;
  justify-content: center;
  position: relative;
  overflow-x: hidden;
}

.home-content {
  width: 100%;
  max-width: 1200px;
    max-width: 100%;
  padding: 0 32px;
}

/* ========== HEADER ========== */
.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon {
  font-size: 32px;
  color: #1db954;
  z-index: 2;
}

.brand-pulse {
  position: absolute;
  width: 50px;
  height: 50px;
  background: rgba(29,185,84,0.3);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  z-index: 1;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-text {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  letter-spacing: -1px;
}

.brand-tagline {
  font-size: 13px;
  color: #888;
  font-weight: 500;
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-header {
  background: rgba(255,255,255,0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-header:hover {
  background: rgba(255,255,255,0.2);
  transform: rotate(180deg);
}

.btn-header i.spinning {
  animation: spin 1s linear infinite;
}

/* ========== HERO BANNER ========== */
.hero-banner {
  border-radius: 16px;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 400px;
}

.hero-ambient {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  filter: blur(60px);
  animation: pulse 4s ease-in-out infinite;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 60%;
  flex: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

.badge-live {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
  color: #1db954;
  font-size: 10px;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #1db954;
  border-radius: 50%;
  animation: livePulse 1.5s ease-in-out infinite;
}

.hero-title {
  font-size: 56px;
  font-weight: 900;
  margin: 0 0 12px 0;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  background: linear-gradient(to right, #fff, rgba(255,255,255,0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-artist {
  font-size: 24px;
  color: rgba(255,255,255,0.9);
  margin: 0 0 16px 0;
  font-weight: 600;
}

.hero-description {
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.highlight {
  font-weight: 700;
  color: #fff;
  display: block;
  margin-top: 8px;
}

/* Progress Bar no Hero */
.hero-progress {
  margin-bottom: 24px;
  max-width: 400px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #1db954;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}

/* Hero Actions */
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.btn-primary {
  background: #1db954;
  color: #000;
  border: none;
  padding: 16px 32px;
  border-radius: 500px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(29,185,84,0.4);
}

.btn-primary:hover:not(:disabled) {
  background: #1ed760;
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 8px 24px rgba(29,185,84,0.6);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-glow {
  animation: glow 2s ease-in-out infinite;
}

.btn-secondary {
  background: rgba(0,0,0,0.3);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 16px 32px;
  border-radius: 500px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(0,0,0,0.5);
  border-color: #fff;
  transform: scale(1.05);
}

.btn-secondary.active {
  background: rgba(255,255,255,0.2);
  border-color: #1db954;
  color: #1db954;
}

.btn-icon {
  padding: 16px;
  border-radius: 50%;
}

/* Hero Stats */
.hero-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.2);
  padding: 8px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* Hero Image - Vinyl */
.hero-image {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 300px;
}

.vinyl-container {
  position: relative;
  width: 280px;
  height: 280px;
}

.vinyl-record {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #000;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 10px rgba(255,255,255,0.05);
  animation: spin 8s linear infinite;
  animation-play-state: paused;
  overflow: hidden;
}

.vinyl-container.playing .vinyl-record {
  animation-play-state: running;
}

.vinyl-grooves {
  position: absolute;
  inset: 15px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #1a1a1a 0px,
    #1a1a1a 2px,
    #000 3px,
    #000 4px
  );
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: #1db954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.vinyl-label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vinyl-label i {
  font-size: 32px;
  color: #000;
}

.vinyl-reflection {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  pointer-events: none;
}

.floating-notes {
  position: absolute;
  top: -20px;
  right: -20px;
  font-size: 24px;
  color: rgba(255,255,255,0.3);
}

.floating-notes i {
  position: absolute;
  animation: noteFloat 3s ease-in-out infinite;
}

.note-1 { left: 0; animation-delay: 0s; }
.note-2 { left: 30px; animation-delay: 1s; }
.note-3 { left: 60px; animation-delay: 2s; }

/* ========== SECTIONS ========== */
.section {
  margin-bottom: 48px;
  animation: slideIn 0.6s ease-out;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.5px;
}

.section-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.section-icon.hot { color: #ff6b6b; background: rgba(255,107,107,0.15); }
.section-icon.new { color: #ffd93d; background: rgba(255,217,61,0.15); }
.section-icon.artist { color: #a855f7; background: rgba(168,85,247,0.15); }
.section-icon.genre { color: #22d3ee; background: rgba(34,211,238,0.15); }
.section-icon.playlist { color: #f472b6; background: rgba(244,114,182,0.15); }
.section-icon.rec { color: #fbbf24; background: rgba(251,191,36,0.15); }
.section-icon.mix { color: #34d399; background: rgba(52,211,153,0.15); }
.section-icon.radio { color: #f87171; background: rgba(248,113,113,0.15); }
.section-icon.browse { color: #60a5fa; background: rgba(96,165,250,0.15); }

.section-title:hover .section-icon {
  transform: scale(1.1) rotate(5deg);
}

.section-subtitle {
  font-size: 14px;
  color: #888;
  font-weight: 500;
}

.section-count {
  font-size: 12px;
  color: #666;
  background: rgba(255,255,255,0.1);
  padding: 4px 10px;
  border-radius: 12px;
  margin-left: 12px;
}

.see-all {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: #b3b3b3;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.see-all:hover {
  color: #fff;
  border-color: #fff;
  background: rgba(255,255,255,0.1);
}

.see-all i {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.see-all:hover i {
  transform: translateX(3px);
}

/* ========== CARDS ========== */
.cards-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.cards-row.expanded {
  grid-template-columns: repeat(6, 1fr);
}

.music-card {
  background: rgba(24, 24, 24, 0.6);
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
}

.music-card:hover {
  background: rgba(40, 40, 40, 0.8);
  transform: translateY(-8px);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.music-card.active {
  background: rgba(40, 40, 40, 0.9);
  border-color: #1db954;
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.music-card:hover .card-image img {
  transform: scale(1.08);
}

.play-button-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 48px;
  height: 48px;
  background: #1db954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(8px) scale(0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  z-index: 2;
}

.music-card:hover .play-button-overlay,
.music-card.active .play-button-overlay {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.play-button-overlay i {
  font-size: 20px;
  color: #000;
  margin-left: 2px;
}

/* Equalizer Animation */
.equalizer {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 24px;
  padding: 4px 8px;
  background: #1db954;
  border-radius: 4px;
  z-index: 3;
}

.equalizer span {
  width: 3px;
  background: #000;
  border-radius: 1px;
  animation: equalizer 0.5s ease-in-out infinite;
  height: 16px;
}

.equalizer span:nth-child(1) { animation-delay: 0s; height: 8px; }
.equalizer span:nth-child(2) { animation-delay: 0.1s; height: 16px; }
.equalizer span:nth-child(3) { animation-delay: 0.2s; height: 12px; }
.equalizer span:nth-child(4) { animation-delay: 0.3s; height: 10px; }

/* Badges */
.rank-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  background: #1db954;
  color: #000;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 2;
}

.rank-badge.top3 {
  background: #ffd700;
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.new-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4757;
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.preview-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  z-index: 2;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 4px;
}

.playlist-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
}

/* Card Info */
.card-info {
  position: relative;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.card-artist {
  font-size: 13px;
  color: #b3b3b3;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-date {
  font-size: 11px;
  color: #666;
  margin: 4px 0 0 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-more {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 50%;
}

.music-card:hover .card-more {
  opacity: 1;
}

.card-more:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

/* Artist Cards */
.artists-row {
  grid-template-columns: repeat(5, 1fr);
}

.artist-card {
  text-align: center;
}

.artist-image {
  border-radius: 50%;
  overflow: hidden;
}

.artist-image img {
  border-radius: 50%;
}

.artist-play {
  opacity: 0;
  transform: scale(0.8);
}

.artist-card:hover .artist-play {
  opacity: 1;
  transform: scale(1);
}

.artist-fans {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  backdrop-filter: blur(4px);
}

/* Radio Cards */
.radio-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 3px;
  opacity: 0;
  transition: opacity 0.3s;
}

.radio-card:hover .radio-wave,
.radio-wave.active {
  opacity: 1;
}

.radio-wave span {
  width: 4px;
  height: 20px;
  background: #1db954;
  border-radius: 2px;
  animation: wave 0.5s ease-in-out infinite;
}

.radio-wave span:nth-child(1) { animation-delay: 0s; }
.radio-wave span:nth-child(2) { animation-delay: 0.1s; }
.radio-wave span:nth-child(3) { animation-delay: 0.2s; }

/* Mixes Grid */
.mixes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.mix-card {
  padding: 24px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 140px;
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}

.mix-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.mix-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.mix-card:hover::before {
  opacity: 1;
}

.mix-content {
  z-index: 1;
}

.mix-content i {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.9;
}

.mix-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: #fff;
}

.mix-description {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  margin: 0;
  line-height: 1.4;
}

.mix-play {
  width: 48px;
  height: 48px;
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.3);
  transition: all 0.3s ease;
  z-index: 1;
}

.mix-card:hover .mix-play {
  background: #1db954;
  border-color: #1db954;
  transform: scale(1.1);
}

.mix-play i {
  color: #fff;
  font-size: 16px;
  margin-left: 2px;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.category-tile {
  position: relative;
  height: 200px;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255,255,255,0.1);
}

.category-tile:hover {
  transform: scale(1.03);
  filter: brightness(1.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.category-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.category-tile h3 {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.category-explore {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.category-tile:hover .category-explore {
  opacity: 1;
  transform: translateY(0);
}

.category-explore i {
  transition: transform 0.3s ease;
}

.category-tile:hover .category-explore i {
  transform: translateX(4px);
}

.category-icon,
.genre-icon {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 64px;
  opacity: 0.2;
  transform: rotate(15deg);
  transition: all 0.3s ease;
}

.category-tile:hover .category-icon {
  transform: rotate(0deg) scale(1.1);
  opacity: 0.3;
}

.genre-image {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.2;
  transform: rotate(15deg);
  object-fit: cover;
  transition: all 0.3s ease;
}

.category-tile:hover .genre-image {
  transform: rotate(0deg) scale(1.1);
  opacity: 0.3;
}

/* ========== LOADING & TOAST ========== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5,5,8,0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.spinner-container {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 24px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 4px solid rgba(29,185,84,0.2);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-pulse {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(29,185,84,0.1);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.loading-overlay p {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.loading-sub {
  margin-top: 8px;
  color: #666;
  font-size: 13px;
}

/* Toast Notification - NOVO DESIGN */
.toast-notification {
  position: fixed;
  bottom: 100px;
  right: 24px;
  background: rgba(24, 24, 24, 0.95);
  color: #fff;
  padding: 16px 20px;
  border-radius: 16px;
  font-weight: 600;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
  min-width: 320px;
  max-width: 420px;
  overflow: hidden;
}

.toast-notification.success {
  border-left: 4px solid #1db954;
}

.toast-notification.error {
  border-left: 4px solid #ff4757;
}

.toast-notification.info {
  border-left: 4px solid #3498db;
}

.toast-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-notification.success .toast-icon-wrapper {
  background: rgba(29,185,84,0.2);
  color: #1db954;
}

.toast-notification.error .toast-icon-wrapper {
  background: rgba(255,71,87,0.2);
  color: #ff4757;
}

.toast-notification.info .toast-icon-wrapper {
  background: rgba(52,152,219,0.2);
  color: #3498db;
}

.toast-icon-wrapper i {
  font-size: 20px;
}

.toast-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.toast-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toast-message {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  font-weight: 500;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.toast-close:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.toast-close i {
  font-size: 14px;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #1db954, #1ed760);
  transition: width 0.1s linear;
}

.toast-notification.error .toast-progress {
  background: linear-gradient(90deg, #ff4757, #ff6b7a);
}

.toast-notification.info .toast-progress {
  background: linear-gradient(90deg, #3498db, #5dade2);
}

/* Toast Transitions */
.toast-enter-active {
  animation: toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  animation: toastSlideOut 0.3s ease;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1400px) {
  .home-content {
    max-width: 100%;
    padding: 0 24px;
  }
}

@media (max-width: 1200px) {
  .cards-row {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .cards-row.expanded {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .mixes-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .hero-title {
    font-size: 48px;
  }
}

@media (max-width: 1024px) {
  .home {
    margin-left: 200px;
    width: calc(100% - 200px);
  }
  
  .hero-banner {
    flex-direction: column;
    text-align: center;
    padding: 40px 32px;
    min-height: auto;
  }
  
  .hero-content {
    max-width: 100%;
    order: 2;
  }
  
  .hero-image {
    order: 1;
    margin-bottom: 32px;
    flex: 0 0 auto;
  }
  
  .vinyl-container {
    width: 220px;
    height: 220px;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .hero-progress {
    margin: 0 auto 24px;
  }
  
  .cards-row,
  .cards-row.expanded {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .mixes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .toast-notification {
    left: 24px;
    right: 24px;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .home {
    margin-left: 0;
    width: 100%;
  }
  
  .home-content {
    padding: 0 16px;
  }
  
  .home-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .hero-banner {
    padding: 32px 24px;
    margin-bottom: 32px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .hero-artist {
    font-size: 18px;
  }
  
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
  
  .cards-row,
  .cards-row.expanded {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .section-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
  
  .mixes-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .category-tile {
    height: 140px;
  }
  
  .category-tile h3 {
    font-size: 18px;
  }
  
  .vinyl-container {
    width: 180px;
    height: 180px;
  }
  
  .toast-notification {
    left: 16px;
    right: 16px;
    bottom: 80px;
    min-width: auto;
    padding: 12px 16px;
  }
  
  .toast-icon-wrapper {
    width: 36px;
    height: 36px;
  }
  
  .toast-title {
    font-size: 13px;
  }
  
  .toast-message {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .hero-banner {
    padding: 24px 16px;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-artist {
    font-size: 16px;
  }
  
  .hero-badge {
    font-size: 10px;
    padding: 6px 12px;
  }
  
  .cards-row,
  .cards-row.expanded {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .music-card {
    padding: 12px;
  }
  
  .card-title {
    font-size: 13px;
  }
  
  .card-artist {
    font-size: 11px;
  }
  
  .vinyl-container {
    width: 150px;
    height: 150px;
  }
  
  .play-button-overlay {
    width: 40px;
    height: 40px;
  }
  
  .play-button-overlay i {
    font-size: 16px;
  }
  
  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .see-all {
    font-size: 11px;
    padding: 6px 12px;
  }
  
  .category-tile {
    height: 120px;
    padding: 16px;
  }
  
  .category-tile h3 {
    font-size: 16px;
  }
  
  .mix-card {
    padding: 16px;
    min-height: 100px;
  }
  
  .mix-title {
    font-size: 16px;
  }
  
  .mix-description {
    font-size: 11px;
  }
}

/* Embedded Player (hidden) */
.embedded-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
</style>