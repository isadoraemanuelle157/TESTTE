<template>
  <div class="home">
    <div class="home-content">
     

      <!-- WELCOME SECTION COM HORÁRIO -->
      <section class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            <span class="greeting">{{ greeting }}</span>
            <span class="user-highlight">{{ currentUser.firstName }}</span>
            <span class="wave-emoji">👋</span>
          </h1>
          <p class="welcome-subtitle">{{ welcomeMessage }}</p>
         
          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fa fa-clock-o"></i>
              </div>
              <div class="stat-data">
                <span class="stat-value">{{ userStats.hoursListened }}h</span>
                <span class="stat-label">Ouvidas este mês</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fa fa-heart"></i>
              </div>
              <div class="stat-data">
                <span class="stat-value">{{ userStats.likedSongs }}</span>
                <span class="stat-label">Músicas curtidas</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fa fa-list"></i>
              </div>
              <div class="stat-data">
                <span class="stat-value">{{ userStats.playlists }}</span>
                <span class="stat-label">Playlists criadas</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fa fa-fire"></i>
              </div>
              <div class="stat-data">
                <span class="stat-value">{{ userStats.streak }} dias</span>
                <span class="stat-label">Sequência</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- HERO DESTACADO - CONTINUE LISTENING -->
      <div v-if="continueListening.length > 0" class="hero-banner continue-listening" :style="heroGradient">
        <div class="hero-ambient"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <i class="fa fa-play-circle"></i> Continue Ouvindo
            <span class="badge-live" v-if="isPlaying">
              <span class="live-dot"></span> Tocando Agora
            </span>
          </div>
          <h1 class="hero-title">{{ currentTrack?.title || continueListening[0].title }}</h1>
          <p class="hero-artist">{{ currentTrack?.artist || continueListening[0].artist }}</p>
          <p class="hero-description">
            De onde você parou
            <span class="highlight">{{ Math.round(continueListening[0].progress) }}% completo</span>
          </p>
         
          <div class="hero-progress" v-if="continueListening[0]">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (continueListening[0].progress || 0) + '%' }"></div>
            </div>
            <div class="progress-time">
              <span>{{ formatTime(continueListening[0].currentTime) }}</span>
              <span>{{ formatTime(continueListening[0].duration) }}</span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn-primary btn-glow" @click="playContinueListening(0)">
              <i class="fa" :class="isPlaying && isCurrentTrack(continueListening[0]) ? 'fa-pause' : 'fa-play'"></i>
              {{ isPlaying && isCurrentTrack(continueListening[0]) ? 'Pausar' : 'Continuar' }}
            </button>
            <button class="btn-secondary" @click="playNextInQueue">
              <i class="fa fa-step-forward"></i> Próxima
            </button>
            <button class="btn-secondary btn-icon" @click="toggleLike" :class="{ 'active': isLiked }">
              <i class="fa" :class="isLiked ? 'fa-heart' : 'fa-heart-o'"></i>
            </button>
          </div>
        </div>

        <div class="hero-image">
          <div class="vinyl-container" :class="{ 'playing': isPlaying }">
            <div class="vinyl-record">
              <div class="vinyl-grooves"></div>
              <div class="vinyl-label">
                <img
                  v-if="continueListening[0]?.cover"
                  :src="continueListening[0].cover"
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

      <!-- SEÇÃO: Feito para Você -->
      <section class="section" v-if="madeForYou.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-magic section-icon personal"></i>
              Feito para Você
            </h2>
            <span class="section-subtitle">Baseado no seu gosto musical</span>
          </div>
          <button class="see-all" @click="showAllPersonal">
            Ver tudo <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row" :class="{ 'expanded': showAllPersonalContent }">
          <div
            v-for="(mix, index) in madeForYou.slice(0, showAllPersonalContent ? 10 : 5)"
            :key="'mix-'+mix.id"
            class="music-card mix-card"
            @click="playMix(mix)"
            :class="{ 'active': isCurrentMix(mix) }"
          >
            <div class="card-image">
              <img :src="mix.cover" @error="handleImageError" alt="Mix Cover" />
              <div class="play-button-overlay">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="mix-gradient-overlay" :style="{ background: mix.gradient }"></div>
              <div class="mix-info-badge">
                <i class="fa fa-magic"></i> {{ mix.tracks }} músicas
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ mix.title }}</h3>
              <p class="card-artist">{{ mix.description }}</p>
            </div>
          </div>
        </div>
      </section>

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
            {{ showAllRecentTracks ? 'Ver menos' : 'Ver tudo' }}
            <i class="fa" :class="showAllRecentTracks ? 'fa-chevron-up' : 'fa-chevron-right'"></i>
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
              <div class="time-badge">{{ formatTimeAgo(track.playedAt) }}</div>
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

      <!-- SEÇÃO: Suas Playlists (CONECTADA À API REAL) -->
      <section class="section" v-if="userPlaylists.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-folder-open section-icon playlist"></i>
              Suas Playlists
            </h2>
            <span class="section-subtitle">{{ userPlaylists.length }} criadas por você</span>
          </div>
          <div class="header-actions-group">
            <button class="btn-create" @click="createPlaylist">
              <i class="fa fa-plus"></i> Criar Nova
            </button>
            <button class="see-all" @click="goToLibrary">
              Ver biblioteca <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="cards-row">
          <div
            v-for="(playlist, index) in userPlaylists.slice(0, 5)"
            :key="'user-playlist-'+playlist.id"
            class="music-card playlist-card user-playlist"
            @click="openPlaylist(playlist)"
            :class="{ 'active': isCurrentPlaylist(playlist) }"
          >
            <div class="card-image">
              <img :src="playlist.cover || defaultPlaylistCover" @error="handleImageError" alt="Playlist" />
              <div class="play-button-overlay">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="playlist-type-badge" v-if="playlist.isPublic">
                <i class="fa fa-globe"></i> Pública
              </div>
              <div class="playlist-type-badge private" v-else>
                <i class="fa fa-lock"></i> Privada
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ playlist.title }}</h3>
              <p class="card-artist">Por {{ currentUser.name }} • {{ playlist.songs?.length || 0 }} músicas</p>
            </div>
          </div>
         
          <!-- Card Criar Nova -->
          <div class="music-card create-card" @click="createPlaylist">
            <div class="create-content">
              <div class="create-icon">
                <i class="fa fa-plus"></i>
              </div>
              <h3 class="create-title">Criar Playlist</h3>
              <p class="create-subtitle">Adicione suas músicas favoritas</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ESTADO VAZIO: Sem Playlists -->
      <section class="section" v-else-if="!loadingPlaylists">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-folder-open section-icon playlist"></i>
              Suas Playlists
            </h2>
            <span class="section-subtitle">0 criadas por você</span>
          </div>
          <button class="btn-create" @click="createPlaylist">
            <i class="fa fa-plus"></i> Criar Nova
          </button>
        </div>
        <div class="empty-playlists">
          <div class="empty-illustration">
            <i class="fa fa-music"></i>
            <div class="sound-waves">
              <span></span><span></span><span></span>
            </div>
          </div>
          <h3>Você ainda não tem playlists</h3>
          <p>Crie sua primeira playlist e organize suas músicas favoritas</p>
          <button class="btn-primary" @click="createPlaylist">
            <i class="fa fa-plus"></i> Criar Playlist
          </button>
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
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-artist">{{ track.artist?.name || track.artist }}</p>
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
            <span class="section-subtitle">Baseado nos seus artistas favoritos</span>
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
              <div class="match-badge">
                <i class="fa fa-thumbs-up"></i> {{ track.match }}% match
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-artist">{{ track.artist?.name || track.artist }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Artistas que Você Segue -->
      <section class="section" v-if="followedArtists.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-users section-icon artist"></i>
              Artistas que Você Segue
            </h2>
            <span class="section-subtitle">{{ followedArtists.length }} artistas</span>
          </div>
          <button class="see-all" @click="goToArtists">
            Ver todos <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row artists-row">
          <div
            v-for="(artist, index) in followedArtists.slice(0, 5)"
            :key="'followed-'+artist.id"
            class="music-card artist-card"
            @click="playArtistTopTrack(artist)"
            :class="{ 'active': currentArtist?.id === artist.id }"
          >
            <div class="card-image artist-image">
              <img :src="artist.picture_medium" @error="handleImageError" alt="Artist" />
              <div class="play-button-overlay artist-play">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="new-release-badge" v-if="artist.hasNewRelease">
                <i class="fa fa-star"></i> Novo
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ artist.name }}</h3>
              <p class="card-artist">Artista</p>
            </div>
            <button
              class="follow-btn"
              :class="{ 'following': artist.isFollowing }"
              @click.stop="toggleFollow(artist)"
            >
              <i class="fa" :class="artist.isFollowing ? 'fa-check' : 'fa-plus'"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Gêneros Populares -->
      <section class="section" v-if="genres.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-guitar section-icon genre"></i>
              Gêneros Populares
            </h2>
            <span class="section-subtitle">Explore por estilo musical</span>
          </div>
        </div>
        <div class="categories-grid">
          <div
            v-for="(genre, index) in genres.slice(0, 8)"
            :key="'genre-'+genre.id"
            class="category-tile"
            @click="navigateToGenre(genre)"
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

      <!-- LOADING STATE -->
<div v-if="!chartTracks.length" class="skeleton"></div>
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
  name: "Dashboard",

  data() {
    return {
      // API Configuration
      DEEZER_API: 'https://api.allorigins.win/raw?url=https://api.deezer.com',
      API_BASE_URL: 'http://localhost:3002', // 🔥 URL do seu backend
     
      // User State - Carrega do localStorage se disponível
      currentUser: {
        id: 1,
        name: "João Silva",
        firstName: "João",
        email: "joao@email.com",
        avatar: "https://i.pravatar.cc/150?img=11",
        plan: "Premium",
        memberSince: "2023-01-15"
      },
     
      // User Stats
      userStats: {
        hoursListened: 127,
        likedSongs: 342,
        playlists: 0, // 🔥 Será atualizado com dados reais
        streak: 15
      },
     
      // UI State
      greeting: "Bom dia",
      welcomeMessage: "Pronto para descobrir novas músicas hoje?",
     
      // Player State
      isPlaying: false,
      isLiked: false,
      currentTrack: null,
      currentPlaylist: null,
      currentAlbum: null,
      currentArtist: null,
      loading: false,
      loadingPlaylists: false, // 🔥 Loading específico para playlists
      loadingMoreTracks: false,
      showAllRecentTracks: false,
      showAllPersonalContent: false,
     
      // Audio Progress
      currentTime: 0,
      duration: 30,
      progressPercent: 0,
     
      // API Data
      chartTracks: [],
      popularArtists: [],
      newReleases: [],
      genres: [],
      recommendedTracks: [],
      followedArtists: [],
     
      // Personalized Data
      continueListening: [],
      madeForYou: [],
      recentlyPlayed: [],
     
      // 🔥 Playlists reais do usuário (conectadas à API)
      userPlaylists: [],
      defaultPlaylistCover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE4MTgxOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiMxZGI5NTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJoTwvdGV4dD48L3N2Zz4=',
     
      // Hero Section
      heroGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
     
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
    // Verifica autenticação primeiro
    this.checkAuth()
      this.loadAllData()
   
    // Carrega dados do usuário do localStorage se existir
    this.loadUserFromStorage()
    this.updateGreeting()
    window.addEventListener('player-update', this.handlePlayerUpdate)
      window.addEventListener('artists-updated', this.loadFollowedArtists)
   
    // 🔥 Carrega playlists reais do backend
    this.loadFollowedArtists()
   
    // Atualizar saudação a cada minuto
    setInterval(this.updateGreeting, 60000)
      // 🔥 carrega playlists depois (sem travar)
  setTimeout(() => {
    this.loadUserPlaylists()
  }, 0)
   
    // 🔥 Escuta eventos de atualização de playlists
    window.addEventListener('playlist-updated', this.loadUserPlaylists)
  },

  beforeDestroy() {
    window.removeEventListener('player-update', this.handlePlayerUpdate)
    window.removeEventListener('playlist-updated', this.loadUserPlaylists)
    if (this.$refs.audioPlayer) {
      this.$refs.audioPlayer.pause()
    }
    if (this.toast.timer) {
      clearInterval(this.toast.timer)
    }
  },

  methods: {
    // 🔥 NOVO: Carrega playlists reais do backend
    async loadUserPlaylists() {
      this.loadingPlaylists = true
     
      try {
        const user = JSON.parse(localStorage.getItem('usuario'))
        const userId = user?._id || user?.id

        if (!userId) {
          console.error('Usuário não autenticado')
          return
        }

        const token = localStorage.getItem("token")
       
        const res = await fetch(`${this.API_BASE_URL}/playlists`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()
        const safeArray = Array.isArray(data) ? data : []

        // 🔥 Mapeia as playlists do backend para o formato do componente
        this.userPlaylists = safeArray.map(p => ({
          id: p._id || p.id,
          title: p.nome || p.title,
          description: p.descricao || '',
          cover: p.capa || p.image || null,
          isPublic: p.publica !== undefined ? p.publica : p.isPublic,
          songs: Array.isArray(p.musicas) ? p.musicas : (p.songs || []),
          authorName: this.currentUser.name,
          // Dados adicionais úteis
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }))

        // 🔥 Atualiza o contador de playlists nas estatísticas
        this.userStats.playlists = this.userPlaylists.length

        console.log('✅ Playlists carregadas:', this.userPlaylists)

      } catch (err) {
        console.error('❌ Erro ao carregar playlists:', err)
        this.showToast('Erro', 'Falha ao carregar suas playlists', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loadingPlaylists = false
      }
    },

    // 🔥 NOVO: Abre uma playlist específica
    openPlaylist(playlist) {
      // Navega para a página da playlist ou emite evento
      this.$router?.push({ path: '/playlist', query: { id: playlist.id } })
        || this.showToast('Playlist', `Abrindo: ${playlist.title}`, 'info', 'fa fa-folder-open')
    },

    // 🔥 NOVO: Criar nova playlist (redireciona)
    createPlaylist() {
      this.$router?.push('/playlist')
        || this.showToast('Criar Playlist', 'Redirecionando para criar playlist...', 'info', 'fa fa-plus')
    },

    // Verifica se usuário está logado
    checkAuth() {
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      const token = localStorage.getItem('token')
     
      if (!isLoggedIn || !token) {
        // Se não estiver logado, redireciona para home
        this.$router.push('/')
      }
    },

async loadFollowedArtists() {
  try {
    const token = localStorage.getItem("token")

    if (!token) {
      this.followedArtists = []
      return
    }

    // 🔥 1. pega os follows
    const res = await fetch(
      'http://localhost:3002/follows/usuario/seguindo?tipo=cantor',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const follows = await res.json()

    // 🔥 2. extrai IDs
    const ids = follows.map(f =>
      String(f.seguindo_id?._id || f.seguindo_id)
    )

    // 🔥 3. busca TODOS cantores do banco
    const resCantores = await fetch('http://localhost:3002/cantores')
    const cantores = await resCantores.json()

    // 🔥 4. filtra só os que o usuário segue
    this.followedArtists = cantores
      .filter(c => ids.includes(String(c._id)))
      .map(c => ({
        id: c._id,
        name: c.nome,
        picture_medium: c.foto,
        isFollowing: true,
        hasNewRelease: false
      }))

  } catch (error) {
    console.error('Erro ao carregar artistas seguidos:', error)
    this.followedArtists = []
  }
},

    // Logout - limpa dados e vai para home
    logout() {
      // Limpar todos os dados do localStorage
      localStorage.removeItem('usuario')
      localStorage.removeItem('usuario_perfil')
      localStorage.removeItem('token')
      localStorage.removeItem('isLoggedIn')
     
      // Disparar evento de logout
      window.dispatchEvent(new CustomEvent('user-logged-out'))
     
      // Mostrar toast
      this.showToast('Até logo!', 'Você saiu da conta', 'info', 'fa fa-sign-out')
     
      // Redirecionar para home após logout
      setTimeout(() => {
        this.$router.push('/')
      }, 1000)
    },
   
    // ========== USER & UI ==========
   
    loadUserFromStorage() {
      const storedUser = localStorage.getItem('usuario')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          this.currentUser = {
            ...this.currentUser,
            ...userData,
            firstName: userData.nome ? userData.nome.split(' ')[0] : userData.firstName || "Usuário",
            name: userData.nome || userData.name || "Usuário",
            email: userData.email || this.currentUser.email,
            avatar: userData.avatar || userData.foto || this.currentUser.avatar,
            plan: userData.plano || userData.plan || "Free"
          }
        } catch (e) {
          console.error('Erro ao carregar usuário:', e)
        }
      }
    },

    updateGreeting() {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        this.greeting = "Bom dia"
        this.welcomeMessage = "Comece seu dia com boa música! 🌅"
      } else if (hour >= 12 && hour < 18) {
        this.greeting = "Boa tarde"
        this.welcomeMessage = "Hora de relaxar com suas favoritas! ☀️"
      } else {
        this.greeting = "Boa noite"
        this.welcomeMessage = "Termine o dia no ritmo certo! 🌙"
      }
    },

    goToLibrary() {
      this.$router?.push('/library') || this.showToast('Biblioteca', 'Abrindo sua biblioteca...', 'info')
    },

    goToArtists() {
      this.$router?.push('/artistas') || this.showToast('Artistas', 'Ver todos os artistas...', 'info')
    },

    // ========== DATA LOADING ==========

async loadAllData() {
  this.loading = true

  try {
    // 🔥 1. CARREGA O ESSENCIAL PRIMEIRO
    await this.loadChartTracks()

    // já mostra conteúdo rápido
    this.generateRecommendations()

    // 🔥 2. RESTO EM BACKGROUND (não trava UI)
    this.loadNewReleases()
    this.loadGenres()
    this.loadMockUserData()

  } catch (error) {
    console.error(error)
  } finally {
    this.loading = false
  }
},

async loadChartTracks() {
  const cache = localStorage.getItem('dashboard_chart')

  if (cache) {
    this.chartTracks = JSON.parse(cache)
    this.generateRecommendations()
  }

  try {
    const response = await fetch(`${this.DEEZER_API}/chart/0/tracks?limit=10`)
    const data = await response.json()

    if (data.data) {
      this.chartTracks = data.data
      localStorage.setItem('dashboard_chart', JSON.stringify(data.data))
    }
  } catch (e) {}
},

    async loadNewReleases() {
      try {
        const response = await fetch(`${this.DEEZER_API}/chart/0/albums?limit=10`)
        const data = await response.json()
        if (data.data) {
          this.newReleases = data.data
        }
      } catch (error) {
        console.error('Erro lançamentos:', error)
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

    loadMockUserData() {
      // Simulando dados do usuário logado
      this.continueListening = [
        {
          id: 101,
          title: "Leão",
          artist: "Marília Mendonça",
          cover: "https://e-cdns-images.dzcdn.net/images/cover/1a2b3c/250x250-000000-80-0-0.jpg",
          progress: 65,
          currentTime: 142,
          duration: 218,
          preview: "https://cdns-preview-1.dzcdn.net/stream/c-1a2b3c"
        }
      ]

      this.madeForYou = [
        { id: 1, title: "Mix Diário 1", description: "Marília Mendonça, Maiara & Maraisa...", tracks: 50, cover: "https://e-cdns-images.dzcdn.net/images/playlist/1/250x250.jpg", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
        { id: 2, title: "Mix Diário 2", description: "Henrique & Juliano, Jorge & Mateus...", tracks: 45, cover: "https://e-cdns-images.dzcdn.net/images/playlist/2/250x250.jpg", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
        { id: 3, title: "Descobertas", description: "Novas músicas para você", tracks: 30, cover: "https://e-cdns-images.dzcdn.net/images/playlist/3/250x250.jpg", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
        { id: 4, title: "On Repeat", description: "Músicas que você ama", tracks: 100, cover: "https://e-cdns-images.dzcdn.net/images/playlist/4/250x250.jpg", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
        { id: 5, title: "Radar", description: "Atualizado toda sexta", tracks: 30, cover: "https://e-cdns-images.dzcdn.net/images/playlist/5/250x250.jpg", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }
      ]

      this.recentlyPlayed = [
        { id: 201, title: "Infiel", artist: "Marília Mendonça", cover: "https://e-cdns-images.dzcdn.net/images/cover/201/250x250.jpg", playedAt: Date.now() - 3600000 },
        { id: 202, title: "Ciumeira", artist: "Marília Mendonça", cover: "https://e-cdns-images.dzcdn.net/images/cover/202/250x250.jpg", playedAt: Date.now() - 7200000 },
        { id: 203, title: "Supera", artist: "Marília Mendonça", cover: "https://e-cdns-images.dzcdn.net/images/cover/203/250x250.jpg", playedAt: Date.now() - 10800000 },
        { id: 204, title: "Bem Pior Que Eu", artist: "Maiara & Maraisa", cover: "https://e-cdns-images.dzcdn.net/images/cover/204/250x250.jpg", playedAt: Date.now() - 14400000 },
        { id: 205, title: "Medo Bobo", artist: "Maiara & Maraisa", cover: "https://e-cdns-images.dzcdn.net/images/cover/205/250x250.jpg", playedAt: Date.now() - 18000000 },
        { id: 206, title: "10%", artist: "Maiara & Maraisa", cover: "https://e-cdns-images.dzcdn.net/images/cover/206/250x250.jpg", playedAt: Date.now() - 21600000 }
      ]

    },

    generateRecommendations() {
      if (this.chartTracks.length > 0) {
        this.recommendedTracks = this.chartTracks.slice(0, 5).map(track => ({
          ...track,
          match: Math.floor(Math.random() * 30) + 70 // 70-99% match
        }))
      }
    },

    // ========== PLAYBACK METHODS ==========

    playContinueListening(index) {
      const track = this.continueListening[index]
      if (this.isCurrentTrack(track) && this.isPlaying) {
        this.pauseTrack()
      } else {
        this.playTrack(track, 'continue', index)
      }
    },

    playMix(mix) {
      this.showToast('Tocando Mix', mix.title, 'success', 'fa fa-music')
      // Implementar lógica de reprodução do mix
    },

    playPlaylist(playlist) {
      this.currentPlaylist = playlist
      this.showToast('Playlist', `Tocando: ${playlist.title}`, 'success', 'fa fa-list')
    },

    toggleFollow(artist) {
      artist.isFollowing = !artist.isFollowing
      const msg = artist.isFollowing ? 'Seguindo' : 'Deixou de seguir'
      this.showToast(msg, artist.name, 'success', 'fa fa-check')
    },

    async playTrack(track, context, index) {
      if (this.isCurrentTrack(track) && this.isPlaying) {
        this.pauseTrack()
        return
      }

      this.currentTrack = track
     
      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: track,
          playlist: this.recentlyPlayed,
          index: index,
          context: context
        }
      }))
     
      this.$nextTick(() => {
        const audio = this.$refs.audioPlayer
        if (audio) {
          audio.src = track.preview
          audio.play().then(() => {
            this.isPlaying = true
            this.showToast('Tocando Agora', track.title, 'success', 'fa fa-play-circle')
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

    playNextInQueue() {
      this.showToast('Fila', 'Reproduzindo próxima música', 'info', 'fa fa-step-forward')
    },

    pauseTrack() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.pause()
        this.isPlaying = false
      }
    },

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
    },

    // ========== NAVIGATION ==========

    navigateToGenre(genre) {
      this.$router?.push({ path: '/genre', query: { id: genre.id } })
        || this.showToast('Gênero', `Explorando: ${genre.name}`, 'info')
    },

    showAllPersonal() {
      this.showAllPersonalContent = !this.showAllPersonalContent
    },

    showAllRecent() {
      this.showAllRecentTracks = !this.showAllRecentTracks
    },

    refreshRecommendations() {
      this.generateRecommendations()
      this.showToast('Atualizado', 'Recomendações atualizadas!', 'success', 'fa fa-refresh')
    },

    loadMoreTracks() {
      this.loadingMoreTracks = true
      setTimeout(() => {
        this.loadingMoreTracks = false
        this.showToast('Carregado', 'Mais músicas adicionadas!', 'success')
      }, 1000)
    },

    loadMoreReleases() {
      this.showToast('Carregando', 'Buscando mais lançamentos...', 'info', 'fa fa-spinner fa-spin')
    },

    // ========== UTILITIES ==========

    isCurrentTrack(track) {
      if (!this.currentTrack || !track) return false
      return this.currentTrack.id === track.id
    },

    isCurrentPlaylist(playlist) {
      if (!this.currentPlaylist || !playlist) return false
      return this.currentPlaylist.id === playlist.id
    },

    isCurrentAlbum(album) {
      if (!this.currentAlbum || !album) return false
      return this.currentAlbum.id === album.id
    },

    isCurrentMix(mix) {
      // Implementar lógica se necessário
      return false
    },

    handlePlayerUpdate(e) {
      this.isPlaying = e.detail?.isPlaying || false
    },

    toggleLike() {
      this.isLiked = !this.isLiked
      const title = this.isLiked ? 'Adicionado aos Favoritos' : 'Removido dos Favoritos'
      this.showToast(title, this.currentTrack?.title || 'Música', this.isLiked ? 'success' : 'info', 'fa fa-heart')
    },

    showTrackOptions(track) {
      this.showToast('Opções', `Menu: ${track.title}`, 'info', 'fa fa-ellipsis-h')
    },

    formatTime(seconds) {
      if (!seconds) return "0:00"
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },

    formatTimeAgo(timestamp) {
      const seconds = Math.floor((Date.now() - timestamp) / 1000)
      if (seconds < 60) return 'Agora'
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes}min`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h`
      return `${Math.floor(hours / 24)}d`
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })
    },

    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE4MTgxOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiMxZGI5NTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJoTwvdGV4dD48L3N2Zz4='
    },

    // ========== TOAST SYSTEM ==========
   
    showToast(title, message, type = 'success', icon = 'fa fa-check-circle') {
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
     
      const duration = 3000
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
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

/* ========== NOVO: Top Bar com User Info e Logout ========== */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(29, 185, 84, 0.5);
  box-shadow: 0 0 10px rgba(29, 185, 84, 0.3);
}

.user-name {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 71, 87, 0.15);
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: #ff4757;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 71, 87, 0.3);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.2);
}

.logout-btn i {
  font-size: 14px;
}

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

@keyframes equalizer {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.5); }
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

@keyframes wave {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
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
  padding: 0 32px;
}

/* ========== WELCOME SECTION ========== */
.welcome-section {
  margin-bottom: 32px;
  padding: 24px 0;
}

.welcome-title {
  font-size: 42px;
  font-weight: 900;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.greeting {
  color: rgba(255,255,255,0.9);
}

.user-highlight {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.wave-emoji {
  animation: wave 2s ease-in-out infinite;
  display: inline-block;
}

.welcome-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.6);
  margin: 0 0 24px 0;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.stat-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
  border-color: rgba(29,185,84,0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(29,185,84,0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1db954;
  font-size: 20px;
}

.stat-data {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: 4px;
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

.hero-banner.continue-listening {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
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
.section-icon.personal { color: #c084fc; background: rgba(192,132,252,0.15); }

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

.header-actions-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-create {
  background: rgba(29,185,84,0.2);
  color: #1db954;
  border: 1px solid rgba(29,185,84,0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn-create:hover {
  background: rgba(29,185,84,0.3);
  transform: scale(1.05);
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

.time-badge {
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
}

.match-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(29,185,84,0.9);
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Mix Cards */
.mix-card .card-image {
  position: relative;
}

.mix-gradient-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  mix-blend-mode: overlay;
}

.mix-info-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
  backdrop-filter: blur(4px);
}

/* Playlist Cards */
.playlist-type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(29,185,84,0.9);
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.playlist-type-badge.private {
  background: rgba(255,71,87,0.9);
  color: #fff;
}

/* Create Card */
.create-card {
  border: 2px dashed rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.create-card:hover {
  border-color: #1db954;
  background: rgba(29,185,84,0.05);
}

.create-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.create-icon {
  width: 64px;
  height: 64px;
  background: rgba(29,185,84,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1db954;
  font-size: 24px;
  transition: all 0.3s ease;
}

.create-card:hover .create-icon {
  background: rgba(29,185,84,0.3);
  transform: scale(1.1);
}

.create-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.create-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin: 0;
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
  position: relative;
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

.new-release-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ffd700;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.follow-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
}

.artist-card:hover .follow-btn {
  opacity: 1;
}

.follow-btn:hover {
  background: rgba(29,185,84,0.9);
  border-color: #1db954;
  color: #000;
}

.follow-btn.following {
  opacity: 1;
  background: #1db954;
  border-color: #1db954;
  color: #000;
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

.genre-icon {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 64px;
  opacity: 0.2;
  transform: rotate(15deg);
}

/* ========== ESTADO VAZIO DE PLAYLISTS ========== */
.empty-playlists {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  background: rgba(255,255,255,0.02);
  border-radius: 16px;
  border: 2px dashed rgba(255,255,255,0.1);
}

.empty-illustration {
  position: relative;
  display: inline-flex;
  margin-bottom: 24px;
}

.empty-illustration i {
  font-size: 64px;
  opacity: 0.3;
  position: relative;
  z-index: 1;
  color: #1db954;
}

.sound-waves {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  align-items: flex-end;
}

.sound-waves span {
  width: 4px;
  background: #1db954;
  border-radius: 2px;
  animation: sound-wave 1s ease-in-out infinite;
}

.sound-waves span:nth-child(1) { height: 20px; animation-delay: 0s; }
.sound-waves span:nth-child(2) { height: 30px; animation-delay: 0.2s; }
.sound-waves span:nth-child(3) { height: 25px; animation-delay: 0.4s; }

@keyframes sound-wave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
}

.empty-playlists h3 {
  font-size: 20px;
  color: #f8fafc;
  margin: 0 0 8px 0;
}

.empty-playlists p {
  margin: 0 0 24px 0;
  font-size: 14px;
}

.empty-playlists .btn-primary {
  display: inline-flex;
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

/* Toast Notification */
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
 
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
 
  .hero-title {
    font-size: 48px;
  }
 
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
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
 
  .hero-progress {
    margin: 0 auto 24px;
  }
 
  .cards-row,
  .cards-row.expanded {
    grid-template-columns: repeat(3, 1fr);
  }
 
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
 
  .welcome-title {
    font-size: 32px;
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
 
  .welcome-title {
    font-size: 28px;
  }
 
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
 
  .stat-card {
    padding: 16px;
  }
 
  .stat-value {
    font-size: 20px;
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
 
  .quick-stats {
    grid-template-columns: 1fr;
  }
 
  /* NOVO: Ajustes para top bar no mobile */
  .top-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
 
  .logout-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>