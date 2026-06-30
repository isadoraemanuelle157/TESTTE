<template>
  <div class="cantor-detalhe">
    <!-- Loading State com Skeleton -->
    <div v-if="loading" class="loading-screen">
      <div class="skeleton-hero">
        <div class="skeleton-artista"></div>
        <div class="skeleton-info">
          <div class="skeleton-tag"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-meta"></div>
          <div class="skeleton-bio"></div>
          <div class="skeleton-btn"></div>
        </div>
      </div>
      <div class="skeleton-sections">
        <div v-for="n in 3" :key="n" class="skeleton-section">
          <div class="skeleton-header"></div>
          <div class="skeleton-grid">
            <div v-for="i in 4" :key="i" class="skeleton-card"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo Principal -->
    <div v-else-if="cantor" class="content-wrapper">
      <!-- Hero Section Premium -->
      <section class="hero" :style="heroStyle">
        <div class="hero-ambient-glow"></div>
        <div class="hero-particles" v-if="!isMobile">
          <div v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)"></div>
        </div>

        <div class="hero-content">
          <div class="artist-visual">
            <div class="artist-photo-wrapper">
              <img
                :src="getArtistImage()"
                :alt="getArtistName()"
                class="foto-artista"
                @error="handleImageError"
              />
              <div class="photo-ring"></div>
              <div class="photo-glow"></div>
              <div v-if="isVerifiedArtist" class="verified-badge" title="Artista Verificado">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="hero-info">
            <div class="info-header">
              <span v-if="isVerifiedArtist" class="tag">
                <span class="tag-pulse"></span>
                Artista Verificado
              </span>
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-value">{{ formatarSeguidores(getRealFollowers()) }}</span>
                  <span class="stat-label">seguidores</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-value">{{ getMonthlyListeners() }}</span>
                  <span class="stat-label">ouvintes mensais</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <span class="stat-value">#{{ getArtistRank() }}</span>
                  <span class="stat-label">no mundo</span>
                </div>
              </div>
            </div>

            <h1 class="artist-name">{{ getArtistName() }}</h1>



            <p class="bio" v-if="getArtistBio()">{{ getArtistBio() }}</p>

            <div class="hero-actions">
              <button @click="togglePlay" class="btn-play" :class="{ 'playing': isPlaying && currentTrackId }">
                <span class="btn-icon">
                  <svg v-if="!isPlaying || !currentTrackId" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                </span>
                <span class="btn-text">{{ isPlaying && currentTrackId ? 'Pausar' : 'Tocar' }}</span>
                <div class="btn-ripple" v-if="isPlaying && currentTrackId"></div>
              </button>

              <button @click="toggleFollow" class="btn-follow" :class="{ 'following': isFollowing }" :disabled="followLoading">
                <span class="follow-icon">
                  <svg v-if="!isFollowing" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </span>
                <span class="follow-text">{{ followLoading ? '...' : (isFollowing ? 'Seguindo' : 'Seguir') }}</span>
              </button>

              <button class="btn-more" @click.stop="toggleMoreOptions">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <div v-if="showMoreOptions" class="dropdown-menu">
                  <button @click="compartilhar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    Compartilhar
                  </button>
                  <button @click="reportar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Reportar
                  </button>
                </div>
              </button>
            </div>

            <!-- Visualizador de Áudio -->
            <div v-if="isPlaying && currentTrackId" class="audio-visualizer">
              <div v-for="n in 32" :key="n" class="bar" :style="{ animationDelay: `${n * 0.05}s` }"></div>
            </div>
          </div>
        </div>

        <div class="hero-fade"></div>
      </section>

      <!-- Navegação por Tabs -->
      <nav class="tabs-nav" :class="{ 'sticky': isTabsSticky }">
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-btn"
            :class="{ 'active': activeTab === tab.id }"
          >
            <i :class="`fas fa-${tab.icon} tab-icon`"></i>
            {{ tab.label }}
            <span v-if="tab.count !== undefined && tab.count !== null" class="tab-count">{{ tab.count }}</span>
          </button>
          <div class="tab-indicator" :style="indicatorStyle"></div>
        </div>
      </nav>

      <!-- Popular / Músicas -->
      <section v-show="activeTab === 'musicas'" class="section musicas-section">
        <div class="section-header">
          <h2>Populares</h2>
        </div>

        <div v-if="!musicasCarregadas" class="loading-musicas">
          <div class="spinner-musicas"></div>
          <p>Carregando músicas...</p>
        </div>

        <div v-else-if="!artistTracks || artistTracks.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <p>Nenhuma música disponível</p>
        </div>

        <div v-else class="musicas-list">
          <div
            v-for="(musica, index) in artistTracks"
            :key="getTrackId(musica) || index"
            class="musica-row"
            :class="{ 'playing': currentTrackId === getTrackId(musica) && isPlaying }"
            @mouseenter="hoveredTrack = getTrackId(musica)"
            @mouseleave="hoveredTrack = null"
            @click="playTrack(musica)"
          >
            <div class="track-number">
              <span v-if="hoveredTrack !== getTrackId(musica) && !(currentTrackId === getTrackId(musica) && isPlaying)" class="number">
                {{ String(index + 1).padStart(2, '0') }}
              </span>
              <button v-else class="track-play-btn" @click.stop="playTrack(musica)">
                <svg v-if="currentTrackId !== getTrackId(musica) || !isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <div v-else class="equalizer">
                  <span></span><span></span><span></span>
                </div>
              </button>
            </div>

            <div class="track-image" v-if="getTrackImage(musica)">
              <img :src="getTrackImage(musica)" :alt="getTrackName(musica)" @error="handleTrackImageError" />
              <div class="track-image-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            <div v-else class="track-image-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>

            <div class="track-info">
              <span class="track-name" :class="{ 'active': currentTrackId === getTrackId(musica) && isPlaying }">{{ getTrackName(musica) }}</span>
              <span class="track-artista">{{ getTrackArtists(musica) }}</span>
            </div>

            <div class="track-stats">
              <span class="track-plays">{{ formatarSeguidores(getTrackPlays(musica)) }} reproduções</span>
            </div>

            <div class="track-duration">{{ formatarDuracao(getTrackDuration(musica)) }}</div>

          </div>
        </div>
      </section>

      <!-- Álbuns -->
      <section v-show="activeTab === 'albuns'" class="section albuns-section">
        <div class="section-header">
          <h2>Discografia</h2>
          <div class="album-filters">

          </div>
        </div>

        <div v-if="!albunsCarregados" class="loading-musicas">
          <div class="spinner-musicas"></div>
          <p>Carregando discografia...</p>
        </div>

        <div v-else-if="!filteredAlbuns || filteredAlbuns.length === 0" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>Nenhum álbum disponível</p>
        </div>

        <div v-else class="albuns-grid">
          <div
            v-for="(album, index) in filteredAlbuns"
            :key="getAlbumId(album) || index"
            class="album-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @mouseenter="ensureAlbumTracks(album)"
            @click="abrirModalAlbum(album)"
          >
            <div class="album-cover-wrapper">
              <img v-if="getAlbumImage(album)" :src="getAlbumImage(album)" :alt="getAlbumName(album)" class="album-cover" @error="handleAlbumImageError" />
              <div v-else class="album-cover-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>

              <div class="album-overlay">
                <button class="album-play-btn" @click.stop="playAlbum(album)">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>

              <div class="album-year-badge">{{ getAlbumYear(album) }}</div>
            </div>

            <div class="album-info">
              <h3 class="album-name">{{ getAlbumName(album) }}</h3>
              <p class="album-meta">
                <span class="album-type">{{ getAlbumType(album) }}</span>
                <span class="album-tracks">{{ getAlbumTrackCount(album) }} músicas</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Sobre -->
      <section v-show="activeTab === 'sobre'" class="section sobre-section">
        <div class="about-container">
          <div class="about-main">
            <div class="about-card">
              <h2>Sobre o Artista</h2>
              <p class="about-bio">{{ getArtistBio() || 'Informações não disponíveis' }}</p>
             
              <div class="about-stats">
                <div class="stat-card">
                  <div class="stat-number">{{ formatarSeguidores(getRealFollowers()) }}</div>
                  <div class="stat-name">Seguidores</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{ artistTracks.length }}</div>
                  <div class="stat-name">Músicas</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">{{ artistAlbums.length }}</div>
                  <div class="stat-name">Álbuns</div>
                </div>
              </div>
            </div>

            <div v-if="getArtistGenres().length > 0" class="about-card">
              <h3>Gêneros</h3>
              <div class="genres-list">
                <span v-for="(genero, idx) in getArtistGenres()" :key="idx" class="genre-badge">
                  {{ genero }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="artistasRelacionados.length > 0" class="about-side">
            <div class="related-artists-card">
              <h3>Artistas Similares</h3>
              <div class="related-artists-list">
                <div v-for="(artista, idx) in artistasRelacionados" :key="idx" class="related-artist-item">
                  <img :src="getRelatedArtistImage(artista)" :alt="getRelatedArtistName(artista)"
                   class="related-artist-image" />
                  <div class="related-artist-info">
                    <div class="related-artist-name">{{ getRelatedArtistName(artista) }}</div>
                    <div class="related-artist-genre">{{ getRelatedArtistGenre(artista) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

   
    </div>

    <!-- ============================================ -->
    <!-- MODAL DE ÁLBUM - GLASSMORPHISM ELEGANTE -->
    <!-- ============================================ -->
    <transition name="modal-fade">
      <div v-if="albumModalAberto" class="modal-overlay" @click.self="fecharModalAlbum">
        <div class="modal-album" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-header-content">
              <img :src="getAlbumImage(albumSelecionado)" :alt="getAlbumName(albumSelecionado)" class="modal-album-cover" />
              <div class="modal-header-info">
                <h2 class="modal-album-title">{{ getAlbumName(albumSelecionado) }}</h2>
                <p class="modal-album-artist">{{ getArtistName() }}</p>
                <div class="modal-album-meta">
                  <span class="meta-item">{{ getAlbumYear(albumSelecionado) }}</span>
                  <span class="meta-divider">•</span>
                  <span class="meta-item">{{ getAlbumType(albumSelecionado) }}</span>
                  <span class="meta-divider">•</span>
                  <span class="meta-item">{{ getAlbumTrackCount(albumSelecionado) }} músicas</span>
                </div>
              </div>
            </div>
            <button class="modal-close" @click="fecharModalAlbum">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button class="modal-btn-play" @click="playAlbumFromModal(albumSelecionado)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Tocar Álbum</span>
            </button>
            <button class="modal-btn-like" :class="{ 'liked': likedAlbums.includes(getAlbumId(albumSelecionado)) }" @click="toggleAlbumLike(getAlbumId(albumSelecionado))">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>

          <!-- Modal Tracks List -->
          <div class="modal-tracks-container">
            <div v-if="!albumSelecionado.musicas || albumSelecionado.musicas.length === 0" class="modal-loading">
              <div class="spinner-small"></div>
              <p>Carregando faixas...</p>
            </div>

            <div v-else class="modal-tracks-list">
              <div
                v-for="(track, idx) in albumSelecionado.musicas"
                :key="getTrackId(track) || idx"
                class="modal-track-item"
                :class="{ 'playing': currentTrackId === getTrackId(track) && isPlaying }"
                @mouseenter="hoveredModalTrack = getTrackId(track)"
                @mouseleave="hoveredModalTrack = null"
              >
                <div class="modal-track-number">
                  <span v-if="hoveredModalTrack !== getTrackId(track) && !(currentTrackId === getTrackId(track) && isPlaying)" class="number">
                    {{ String(idx + 1).padStart(2, '0') }}
                  </span>
                  <button v-else class="modal-track-play-btn" @click.stop="playTrack(track)">
                    <svg v-if="currentTrackId !== getTrackId(track) || !isPlaying" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <div v-else class="equalizer-small">
                      <span></span><span></span><span></span>
                    </div>
                  </button>
                </div>

                <div class="modal-track-info">
                  <div class="modal-track-name" :class="{ 'active': currentTrackId === getTrackId(track) && isPlaying }">
                    {{ getTrackName(track) }}
                  </div>
                  <div class="modal-track-artist">{{ getTrackArtists(track) }}</div>
                </div>

                <div class="modal-track-duration">{{ formatarDuracao(getTrackDuration(track)) }}</div>

                <button class="modal-track-like" @click.stop="toggleLike(track)">
                  <svg :class="{ 'liked': isTrackLiked(getTrackId(track)) }" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <div class="toast-content">
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>
<script>
const API_BASE_URL = 'http://localhost:3002'

export default {
  name: 'CantorDetalhe',

  data() {
    return {
      loading: true,
      cantor: null,
      showsLoading: false,
      shows: [],
      isFollowing: false,
      followLoading: false,
      isPlaying: false,
      currentTrackId: null,
      hoveredTrack: null,
      hoveredModalTrack: null,
      likedTracks: [],
      likedAlbums: [],
      activeTab: 'musicas',
      albumModalAberto: false,
      albumSelecionado: null,
      activeAlbumFilter: 'todos',
      showMoreOptions: false,
      isTabsSticky: false,
      isMobile: false,
      musicasCarregadas: false,
      albunsCarregados: false,
      artistasRelacionados: [],
      source: 'db',
      loadingTracks: {},
      toastTimeout: null,
      toast: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },

  computed: {
    heroStyle() {
      const banner = this.cantor?.banner
        || this.cantor?.images?.[0]?.url
        || this.cantor?.picture_xl
        || this.cantor?.picture_big
      if (banner) {
        return {
          backgroundImage: `url(${banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
      }
      return {
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)'
      }
    },

    artistTracks() {
      if (!this.cantor) return []
      if (this.cantor.musicas && Array.isArray(this.cantor.musicas)) {
        return this.cantor.musicas
      }
      if (this.cantor.tracks && Array.isArray(this.cantor.tracks)) {
        return this.cantor.tracks
      }
      if (this.cantor.top && Array.isArray(this.cantor.top)) {
        return this.cantor.top
      }
      return []
    },

    artistAlbums() {
      if (!this.cantor) return []
      if (this.cantor.albuns && Array.isArray(this.cantor.albuns)) {
        return this.cantor.albuns
      }
      if (this.cantor.albums && Array.isArray(this.cantor.albums)) {
        return this.cantor.albums
      }
      return []
    },

    tabs() {
      return [
        { id: 'musicas', label: 'Músicas', icon: 'music', count: this.artistTracks.length },
        { id: 'albuns', label: 'Discografia', icon: 'compact-disc', count: this.artistAlbums.length },
        { id: 'sobre', label: 'Sobre', icon: 'user' }
      ]
    },

    indicatorStyle() {
      const index = this.tabs.findIndex(t => t.id === this.activeTab)
      return {
        transform: `translateX(${index * 100}%)`
      }
    },

    albumFilters() {
      return [
        { label: 'Todos', value: 'todos' },
        { label: 'Álbuns', value: 'album' },
        { label: 'Singles', value: 'single' },
        { label: 'EPs', value: 'ep' }
      ]
    },

    filteredAlbuns() {
      const albuns = this.artistAlbums
      if (this.activeAlbumFilter === 'todos') return albuns
      return albuns.filter(album => {
        const tipo = (this.getAlbumType(album) || 'album').toLowerCase()
        return tipo === this.activeAlbumFilter
      })
    },

    isVerifiedArtist() {
      if (!this.cantor) return false
      if (this.cantor.verificado) return true
      const popularity = this.cantor.popularity || this.cantor.popularidade || 0
      const fans = this.cantor.nb_fan || this.cantor.totalSeguidores || this.cantor.followers?.total || 0
      return popularity > 70 || fans > 100000
    }
  },

  async mounted() {
    this.isMobile = window.innerWidth < 768
    await this.carregarLikes()
    await this.carregarDetalhes()

    window.addEventListener('player-state-changed', this.handlePlayerStateChange)
    window.addEventListener('music-player-state-changed', this.handlePlayerStateChange)
    window.addEventListener('scroll', this.handleScroll)
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('click', this.handleDocumentClick)
    window.addEventListener('likes-updated', this.carregarLikes)
    window.addEventListener('curtidas-updated', this.carregarLikes)
    window.addEventListener('storage', this.handleStorageChange)
  },

  beforeUnmount() {
    window.removeEventListener('player-state-changed', this.handlePlayerStateChange)
    window.removeEventListener('music-player-state-changed', this.handlePlayerStateChange)
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('click', this.handleDocumentClick)
    window.removeEventListener('likes-updated', this.carregarLikes)
    window.removeEventListener('curtidas-updated', this.carregarLikes)
    window.removeEventListener('storage', this.handleStorageChange)

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout)
    }
  },

  methods: {
    // ========== HELPERS DE NORMALIZAÇÃO DE DADOS ==========

    getArtistName() {
      if (!this.cantor) return 'Artista Desconhecido'
      return this.cantor.nome || this.cantor.name || this.cantor.title || 'Artista Desconhecido'
    },

    getArtistImage() {
      if (!this.cantor) return '/default-artist.png'
      return this.cantor.foto
        || this.cantor.images?.[0]?.url
        || this.cantor.picture_big
        || this.cantor.picture_xl
        || this.cantor.picture_medium
        || '/default-artist.png'
    },

    getSecondaryImage() {
      if (!this.cantor) return null
      return this.cantor.fotoSecundaria
        || this.cantor.images?.[1]?.url
        || this.cantor.images?.[0]?.url
        || this.cantor.picture_big
        || null
    },

    getArtistGenres() {
      if (!this.cantor) return []
      if (this.cantor.genres && Array.isArray(this.cantor.genres) && typeof this.cantor.genres[0] === 'string') {
        return this.cantor.genres
      }
      if (this.cantor.generos && Array.isArray(this.cantor.generos)) {
        return this.cantor.generos.map(g => g.nome || g).filter(Boolean)
      }
 if (this.source === 'deezer') {
  // 🔥 Prioriza gêneros já processados no carregamento
  if (this.cantor.genres && Array.isArray(this.cantor.genres) && this.cantor.genres.length > 0) {
    return this.cantor.genres
  }
  if (this.cantor.generos && Array.isArray(this.cantor.generos)) {
    const generos = this.cantor.generos.map(g => g.nome || g).filter(Boolean)
    if (generos.length > 0) return generos
  }
  // Fallback só se realmente não achou nada
  return ['Música']
}
      return []
    },

    getArtistBio() {
      if (!this.cantor) return ''
      if (this.cantor.bio) return this.cantor.bio
      if (this.cantor.description) return this.cantor.description
      if (this.cantor.about) return this.cantor.about
      const name = this.getArtistName()
      const followers = this.getRealFollowers()
      if (this.source === 'deezer') {
        return `${name} é um artista popular no Deezer com ${this.formatarSeguidores(followers)} fãs.`
      }
      if (this.source === 'spotify') {
        return `${name} é um artista no Spotify com ${this.formatarSeguidores(followers)} seguidores.`
      }
      return ''
    },

    getRealFollowers() {
      if (!this.cantor) return 0
      if (this.source === 'spotify') {
        return this.cantor.followers?.total || this.cantor.totalSeguidores || 0
      }
      if (this.source === 'deezer') {
        return this.cantor.nb_fan || this.cantor.totalSeguidores || 0
      }
      return this.cantor.totalSeguidores || this.cantor.nb_fan || this.cantor.followers?.total || 0
    },

    getMonthlyListeners() {
      if (!this.cantor) return '2.4M'
      if (this.cantor.ouvintesMensais) return this.cantor.ouvintesMensais
      const popularity = this.cantor.popularity || this.cantor.popularidade || 42
      const base = popularity * 34000
      return this.formatarSeguidores(base) || '2.4M'
    },

    getArtistRank() {
      if (!this.cantor) return '42'
      return this.cantor.ranking || this.cantor.popularity || this.cantor.popularidade || '42'
    },

    // ========== HELPERS DE MÚSICA ==========

    getTrackId(musica) {
      if (!musica) return null
      // 🔥 CORREÇÃO: Sempre retorna string para comparação consistente
      const id = musica._id || musica.id || musica.track_id || null
      return id ? id.toString() : null
    },

    getTrackName(musica) {
      if (!musica) return 'Música Desconhecida'
      return musica.nome || musica.name || musica.title || 'Música Desconhecida'
    },

    getTrackImage(musica) {
      if (!musica) return null
      return musica.foto
        || musica.cover
        || musica.album?.images?.[0]?.url
        || musica.album?.images?.[1]?.url
        || musica.album?.cover_medium
        || musica.album?.cover_big
        || null
    },

    getTrackArtists(musica) {
      if (!musica) return this.getArtistName()
      if (musica.artists && Array.isArray(musica.artists)) {
        return musica.artists.map(a => a.name).join(', ')
      }
      if (musica.cantores && Array.isArray(musica.cantores)) {
        return musica.cantores.map(c => c.nome || c).join(', ')
      }
      if (musica.artist && typeof musica.artist === 'object') {
        return musica.artist.name || this.getArtistName()
      }
      if (musica.artist && typeof musica.artist === 'string') {
        return musica.artist
      }
      return this.getArtistName()
    },

getTrackDuration(musica) {
  if (!musica) return 0
  // 🔥 CORREÇÃO: Converte string "3:45" para segundos
  if (typeof musica.duracao === 'string' && musica.duracao.includes(':')) {
    const [mins, secs] = musica.duracao.split(':').map(Number)
    return (mins * 60) + secs
  }
  if (typeof musica.duracao === 'number') return musica.duracao
  if (musica.duration_ms) return Math.floor(musica.duration_ms / 1000)
  if (musica.duration) return musica.duration
  return 0
},

    getTrackPlays(musica) {
      if (!musica) return Math.floor(Math.random() * 5000000)
      if (musica.plays) return musica.plays
      if (musica.popularity) return musica.popularity * 50000
      if (musica.rank) return musica.rank * 1000
      return Math.floor(Math.random() * 5000000)
    },

getTrackPreviewUrl(musica) {
  if (!musica) return ''
  // 🔥 Prioriza link do banco de dados (YouTube/Spotify)
  if (musica.link) return musica.link
  if (musica.url) return musica.url
  if (musica.audioUrl) return musica.audioUrl
  return musica.preview || musica.preview_url || musica.previewUrl || ''
},

    // ========== HELPERS DE ÁLBUM ==========

    getAlbumId(album) {
      if (!album) return null
      return album._id || album.id || null
    },

    getAlbumName(album) {
      if (!album) return 'Álbum Desconhecido'
      return album.nome || album.name || album.title || 'Álbum Desconhecido'
    },

    getAlbumImage(album) {
      if (!album) return null
      return album.foto
        || album.cover
        || album.images?.[0]?.url
        || album.images?.[1]?.url
        || album.cover_medium
        || album.cover_big
        || null
    },

    getAlbumYear(album) {
      if (!album) return '2024'
      if (album.ano) return album.ano
      if (album.release_date) {
        const year = album.release_date.split('-')[0]
        if (year && year !== 'undefined') return year
      }
      if (album.release_year) return album.release_year
      return '2024'
    },

    getAlbumType(album) {
      if (!album) return 'Álbum'
      const tipo = album.tipo || album.album_type || album.type || 'album'
      const map = {
        'album': 'Álbum',
        'single': 'Single',
        'ep': 'EP',
        'compilation': 'Compilação',
        'live': 'Ao Vivo'
      }
      return map[tipo.toLowerCase()] || tipo.charAt(0).toUpperCase() + tipo.slice(1)
    },

    getAlbumTrackCount(album) {
      if (!album) return 0
      if (album.total_tracks !== undefined) return album.total_tracks
      if (album.nb_tracks !== undefined) return album.nb_tracks
      if (album.musicas && Array.isArray(album.musicas)) return album.musicas.length
      if (album.tracks && Array.isArray(album.tracks)) return album.tracks.length
      return 0
    },

    // ========== HELPERS DE ARTISTA RELACIONADO ==========

    getRelatedArtistImage(artista) {
      if (!artista) return '/default-artist.png'
      return artista.foto
        || artista.images?.[0]?.url
        || artista.picture_medium
        || artista.picture_big
        || '/default-artist.png'
    },

    getRelatedArtistName(artista) {
      if (!artista) return 'Artista'
      return artista.nome || artista.name || artista.title || 'Artista'
    },

    getRelatedArtistGenre(artista) {
      if (!artista) return 'Artista'
      if (artista.genero) return artista.genero
      if (artista.genres && Array.isArray(artista.genres) && artista.genres.length > 0) {
        return artista.genres[0]
      }
      return 'Artista'
    },

    // ========== HELPERS DE SHOW ==========

    getShowDay(show) {
      if (!show) return '??'
      const data = new Date(show.data || show.date)
      return data.getDate().toString().padStart(2, '0')
    },

    getShowMonth(show) {
      if (!show) return '???'
      const data = new Date(show.data || show.date)
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
      return meses[data.getMonth()]
    },

    formatarData(data) {
      if (!data) return 'Data não informada'
      const date = new Date(data)
      const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
      const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
      return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`
    },

    // ========== SINCRONIZAÇÃO COM MUSICPLAYER ==========
    handlePlayerStateChange(e) {
      const detail = e.detail || {}
      this.isPlaying = detail.isPlaying || false
      if (detail.track) {
        this.currentTrackId = detail.track.id || detail.track._id || null
      } else if (detail.currentTrack) {
        this.currentTrackId = detail.currentTrack._id || detail.currentTrack.id || null
      }
    },

    // ========== CARREGAMENTO DE DADOS ==========
    async carregarDetalhes() {
      try {
        this.loading = true
        this.musicasCarregadas = false
        this.albunsCarregados = false
        this.showsLoading = true

        const artistId = this.$route?.params?.id
        this.source = this.$route?.query?.source || 'db'

        if (!artistId) throw new Error('ID não encontrado')

        if (this.source === 'db') {
          await this.carregarArtistaBD(artistId)
          return
        }

        if (this.source === 'deezer') {
          await this.carregarArtistaDeezer(artistId)
          return
        }

        if (this.source === 'spotify') {
          await this.carregarArtistaSpotify(artistId)
          return
        }

      } catch (error) {
        console.error('Erro ao carregar artista:', error)
        this.cantor = null
        this.mostrarToast('Erro ao carregar artista', 'error')
      } finally {
        this.loading = false
        this.showsLoading = false
      }
    },

    async carregarArtistaBD(artistId) {
      try {
        const res = await fetch(`${API_BASE_URL}/cantores/${artistId}`)
        if (!res.ok) throw new Error('Artista não encontrado')
        this.cantor = await res.json()

        this.showsLoading = true
        try {
          const showsRes = await fetch(`${API_BASE_URL}/cantores/${artistId}/shows`)
          this.shows = showsRes.ok ? await showsRes.json() : []
        } catch (err) {
          console.warn('Erro ao carregar shows:', err)
          this.shows = []
        } finally {
          this.showsLoading = false
        }

        this.musicasCarregadas = true
        this.albunsCarregados = true

        const token = localStorage.getItem('token')
        if (token) {
          await this.verificarSeguindo(token, artistId)
        }
      } catch (error) {
        console.error('Erro ao carregar artista BD:', error)
        throw error
      }
    },

    async carregarArtistaDeezer(artistId) {
      try {
        const [artistRes, topTracksRes, albumsRes, relatedRes] = await Promise.all([
          fetch(`https://corsproxy.io/?https://api.deezer.com/artist/${artistId}`),
          fetch(`https://corsproxy.io/?https://api.deezer.com/artist/${artistId}/top?limit=50`),
          fetch(`https://corsproxy.io/?https://api.deezer.com/artist/${artistId}/albums?limit=100`),
          fetch(`https://corsproxy.io/?https://api.deezer.com/artist/${artistId}/related?limit=10`)
        ])

        const artistData = await artistRes.json()
        const topTracksData = await topTracksRes.json()
        const albumsData = await albumsRes.json()
        const relatedData = await relatedRes.json()

        const musicas = (topTracksData.data || []).map(track => ({
          _id: track.id,
          id: track.id,
          nome: track.title,
          name: track.title,
          title: track.title,
          foto: track.album?.cover_medium,
          cover: track.album?.cover_medium,
          cover_medium: track.album?.cover_medium,
          cover_big: track.album?.cover_big,
          duracao: track.duration,
          duration: track.duration,
          duration_ms: track.duration * 1000,
          preview: track.preview,
          preview_url: track.preview,
          album: {
            id: track.album?.id,
            title: track.album?.title,
            images: [{ url: track.album?.cover_medium }],
            cover_medium: track.album?.cover_medium
          },
          artist: { name: artistData.name },
          artists: [{ name: artistData.name }],
          popularity: track.rank ? Math.min(Math.floor(track.rank / 1000), 100) : Math.floor(Math.random() * 100),
          rank: track.rank,
          plays: track.rank ? track.rank * 1000 : Math.floor(Math.random() * 5000000)
        }))

        let albuns = (albumsData.data || []).map(album => ({
          _id: album.id,
          id: album.id,
          nome: album.title,
          name: album.title,
          title: album.title,
          foto: album.cover_medium,
          cover: album.cover_medium,
          cover_medium: album.cover_medium,
          cover_big: album.cover_big,
          images: [{ url: album.cover_medium }, { url: album.cover_big }],
          ano: album.release_date?.split('-')[0],
          release_date: album.release_date,
          release_year: album.release_date?.split('-')[0],
          tipo: album.type || 'album',
          album_type: album.type || 'album',
          type: album.type || 'album',
          total_tracks: album.nb_tracks,
          nb_tracks: album.nb_tracks,
          musicas: [],
          tracks: []
        }))

        albuns = await this.carregarTracksAlbunsEmLotes(albuns, 'deezer')

     // 🔥 BUSCA GÊNEROS REAIS DOS ÁLBUNS DO ARTISTA
const generosUnicos = new Set()
for (const album of (albumsData.data || [])) {
  if (album.genre_id) {
    try {
      const genreRes = await fetch(`https://corsproxy.io/?https://api.deezer.com/genre/${album.genre_id}`)
      if (genreRes.ok) {
        const genreData = await genreRes.json()
        if (genreData.name) {
          generosUnicos.add(genreData.name)
        }
      }
    } catch (e) {
      // ignora erro de gênero individual
    }
  }
}

const artistGenres = Array.from(generosUnicos)
const generosFormatados = artistGenres.length > 0 
  ? artistGenres.map(g => ({ nome: g }))
  : [{ nome: 'Música' }]

        this.cantor = {
          _id: artistData.id,
          id: artistData.id,
          nome: artistData.name,
          name: artistData.name,
          foto: artistData.picture_big,
          images: [
            { url: artistData.picture_xl },
            { url: artistData.picture_big },
            { url: artistData.picture_medium }
          ],
          banner: artistData.picture_xl,
          totalSeguidores: artistData.nb_fan,
          nb_fan: artistData.nb_fan,
          popularity: artistData.nb_fan ? Math.min(Math.floor(artistData.nb_fan / 10000), 100) : 50,
          bio: `${artistData.name} é um artista popular no Deezer com ${this.formatarSeguidores(artistData.nb_fan)} fãs.`,
          generos: generosFormatados,
  genres: artistGenres.length > 0 ? artistGenres : ['Música'],
          musicas,
          albuns
        }

        this.artistasRelacionados = (relatedData.data || []).map(artist => ({
          _id: artist.id,
          id: artist.id,
          nome: artist.name,
          name: artist.name,
          foto: artist.picture_medium,
          picture_medium: artist.picture_medium,
          picture_big: artist.picture_big,
          images: [{ url: artist.picture_medium }],
          genres: ['Música'],
          genero: 'Música',
          source: 'deezer'
        }))

        this.shows = []
        this.showsLoading = false
        this.musicasCarregadas = true
        this.albunsCarregados = true
      } catch (error) {
        console.error('Erro ao carregar artista Deezer:', error)
        throw error
      }
    },

    async carregarArtistaSpotify(artistId) {
      try {
        const [artistRes, topTracksRes, albumsRes, relatedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/spotify/artist/${artistId}`),
          fetch(`${API_BASE_URL}/spotify/artist/${artistId}/top-tracks?limit=50`),
          fetch(`${API_BASE_URL}/spotify/artist/${artistId}/albums?limit=50`),
          fetch(`${API_BASE_URL}/spotify/artist/${artistId}/related-artists`)
        ])

        const artistData = await artistRes.json()
        const topTracksData = await topTracksRes.json()
        const albumsData = await albumsRes.json()
        const relatedData = await relatedRes.json()

        const musicas = (topTracksData.tracks || []).map(track => ({
          _id: track.id,
          id: track.id,
          nome: track.name,
          name: track.name,
          title: track.name,
          foto: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url,
          cover: track.album?.images?.[0]?.url,
          images: track.album?.images,
          duracao: Math.floor(track.duration_ms / 1000),
          duration: Math.floor(track.duration_ms / 1000),
          duration_ms: track.duration_ms,
          preview: track.preview_url,
          preview_url: track.preview_url,
          album: track.album,
          artist: track.artists?.[0],
          artists: track.artists,
          popularity: track.popularity || Math.floor(Math.random() * 100),
          plays: track.popularity ? track.popularity * 50000 : Math.floor(Math.random() * 5000000)
        }))

        let albuns = (albumsData.items || []).map(album => ({
          _id: album.id,
          id: album.id,
          nome: album.name,
          name: album.name,
          title: album.name,
          foto: album.images?.[0]?.url,
          cover: album.images?.[0]?.url,
          images: album.images,
          ano: album.release_date?.split('-')[0],
          release_date: album.release_date,
          release_year: album.release_date?.split('-')[0],
          tipo: album.album_type || 'album',
          album_type: album.album_type || 'album',
          type: album.album_type || 'album',
          total_tracks: album.total_tracks,
          musicas: [],
          tracks: []
        }))

        albuns = await this.carregarTracksAlbunsEmLotes(albuns, 'spotify')

        this.cantor = {
          _id: artistData.id,
          id: artistData.id,
          nome: artistData.name,
          name: artistData.name,
          foto: artistData.images?.[0]?.url,
          images: artistData.images,
          banner: artistData.images?.[0]?.url,
          followers: artistData.followers,
          totalSeguidores: artistData.followers?.total,
          popularity: artistData.popularity,
          popularidade: artistData.popularity,
          bio: `${artistData.name} é um artista no Spotify com ${this.formatarSeguidores(artistData.followers?.total)} seguidores.`,
          generos: artistData.genres?.map(g => ({ nome: g })) || [],
          genres: artistData.genres || [],
          musicas,
          albuns
        }

        this.artistasRelacionados = (relatedData.artists || []).slice(0, 10).map(artist => ({
          _id: artist.id,
          id: artist.id,
          nome: artist.name,
          name: artist.name,
          foto: artist.images?.[0]?.url,
          images: artist.images,
          genres: artist.genres,
          genero: artist.genres?.[0],
          source: 'spotify'
        }))

        this.shows = []
        this.showsLoading = false
        this.musicasCarregadas = true
        this.albunsCarregados = true
      } catch (error) {
        console.error('Erro ao carregar artista Spotify:', error)
        throw error
      }
    },

    async carregarTracksAlbunsEmLotes(albuns, source, tamanhoLote = 5) {
      const albunsCopy = [...albuns]

      for (let i = 0; i < albunsCopy.length; i += tamanhoLote) {
        const lote = albunsCopy.slice(i, i + tamanhoLote)

        const promises = lote.map(album =>
          this.carregarTracksAlbum(album, source)
        )

        const resultados = await Promise.allSettled(promises)

        resultados.forEach((resultado, idx) => {
          if (resultado.status === 'fulfilled') {
            albunsCopy[i + idx] = resultado.value
          }
        })
      }

      return albunsCopy
    },

    async carregarTracksAlbum(album, source) {
      try {
        if (source === 'deezer') {
          const res = await fetch(`https://corsproxy.io/?https://api.deezer.com/album/${album.id}/tracks?limit=100`)
          if (!res.ok) return album

          const data = await res.json()
          const tracks = (data.data || []).map(track => ({
            _id: track.id,
            id: track.id,
            nome: track.title,
            name: track.title,
            title: track.title,
            duracao: track.duration,
            duration: track.duration,
            duration_ms: track.duration * 1000,
            preview: track.preview,
            preview_url: track.preview,
            artist: track.artist,
            artists: [track.artist],
            album: {
              id: track.album?.id,
              title: track.album?.title,
              images: [{ url: track.album?.cover_medium }]
            }
          }))

          album.musicas = tracks
          album.tracks = tracks
          return album
        }

        if (source === 'spotify') {
          const res = await fetch(`${API_BASE_URL}/spotify/album/${album.id}/tracks?limit=50`)
          if (!res.ok) return album

          const data = await res.json()
          const tracks = (data.items || []).map(track => ({
            _id: track.id,
            id: track.id,
            nome: track.name,
            name: track.name,
            title: track.name,
            duracao: Math.floor(track.duration_ms / 1000),
            duration: Math.floor(track.duration_ms / 1000),
            duration_ms: track.duration_ms,
            preview: track.preview_url,
            preview_url: track.preview_url,
            artist: track.artists?.[0],
            artists: track.artists
          }))

          album.musicas = tracks
          album.tracks = tracks
          return album
        }

        return album
      } catch (error) {
        console.warn(`Erro ao carregar tracks do álbum ${album.id}:`, error)
        return album
      }
    },

    async ensureAlbumTracks(album) {
      const id = this.getAlbumId(album)
      if (!id || (album.tracks && album.tracks.length > 0) || this.loadingTracks[id]) return

      this.loadingTracks[id] = true
      try {
        await this.carregarTracksAlbum(album, this.source)
      } catch (e) {
        console.warn('Falha ao carregar tracks do álbum', id)
      } finally {
        this.loadingTracks[id] = false
      }
    },

    async verificarSeguindo(token, artistId) {
      try {
        const res = await fetch(`${API_BASE_URL}/follows/verificar?seguindo_id=${artistId}&tipo=cantor`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          this.isFollowing = data.seguindo || false
        }
      } catch (err) {
        console.warn('Erro ao verificar follow:', err)
      }
    },

    // ========== FOLLOW / SEGUIR ==========
    async toggleFollow() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.mostrarToast('Faça login para seguir artistas', 'error')
        this.$router.push('/login')
        return
      }

      if (this.followLoading) return
      this.followLoading = true

      try {
        const artistId = this.cantor._id || this.cantor.id || this.$route.params.id
        const url = this.isFollowing
          ? `${API_BASE_URL}/follows/desseguir`
          : `${API_BASE_URL}/follows/seguir`

        const method = this.isFollowing ? 'DELETE' : 'POST'

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            seguindo_id: artistId,
            tipo: 'cantor'
          })
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.message || `Erro ${res.status}`)
        }

        this.isFollowing = !this.isFollowing

        const atual = Number(this.cantor.totalSeguidores || this.cantor.followers?.total || 0)
        const novoTotal = this.isFollowing ? atual + 1 : Math.max(0, atual - 1)

        this.cantor.totalSeguidores = novoTotal
        if (this.cantor.followers) {
          this.cantor.followers.total = novoTotal
        }
        if (this.cantor.nb_fan !== undefined) {
          this.cantor.nb_fan = novoTotal
        }

        this.mostrarToast(
          this.isFollowing ? 'Você seguiu este artista!' : 'Você deixou de seguir este artista',
          'success'
        )

      } catch (error) {
        console.error('Erro ao seguir/desseguir:', error)
        this.mostrarToast(error.message || 'Erro ao processar ação', 'error')
      } finally {
        this.followLoading = false
      }
    },

    // ========== PLAYER INTEGRADO ==========

    togglePlay() {
      const tracks = this.artistTracks
      if (!tracks || tracks.length === 0) return

      const primeiraMusica = tracks[0]
      const musicaId = this.getTrackId(primeiraMusica)

      if (this.currentTrackId === musicaId && this.isPlaying) {
        window.dispatchEvent(new CustomEvent('player-toggle-play'))
        return
      }

      this.playTrack(primeiraMusica)
    },

    async playTrack(musica) {
      if (!musica) return

      const musicaId = this.getTrackId(musica)
      if (!musicaId) return

      if (this.currentTrackId === musicaId && this.isPlaying) {
        window.dispatchEvent(new CustomEvent('player-toggle-play'))
        return
      }

      this.currentTrackId = musicaId
      this.isPlaying = true

      const duration = this.getTrackDuration(musica)
      const songData = {
        id: musicaId,
        _id: musicaId,
        title: this.getTrackName(musica),
        artist: this.getTrackArtists(musica),
        cover: this.getTrackImage(musica) || '/default-artist.png',
        url: this.getTrackPreviewUrl(musica),
        duration: this.getTrackDuration(musica) || 30,
        source: this.source || 'db'
      }

      const tracks = this.artistTracks
      const playlist = tracks.map((m, idx) => ({
        id: this.getTrackId(m),
        _id: this.getTrackId(m),
        title: this.getTrackName(m),
        artist: this.getTrackArtists(m),
        cover: this.getTrackImage(m) || '/default-artist.png',
        url: this.getTrackPreviewUrl(m),
        duration: this.getTrackDuration(m) || 30,
        source: this.source || 'db'
      })).filter(m => m.id)

      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: songData,
          playlist: playlist,
          index: tracks.findIndex(m => this.getTrackId(m) === musicaId),
          context: `artist_${this.cantor?._id || this.cantor?.id}`
        }
      }))
    },

    playAlbum(album) {
      if (!album) return

      const albumId = this.getAlbumId(album)
      const albumTracks = album.musicas || album.tracks || []

      if (!albumTracks || albumTracks.length === 0) {
        this.mostrarToast('Nenhuma música neste álbum', 'error')
        return
      }

      const primeiraMusica = albumTracks[0]
      const musicaId = this.getTrackId(primeiraMusica)

      const songData = {
        id: musicaId,
        _id: musicaId,
        title: this.getTrackName(primeiraMusica),
        artist: this.getTrackArtists(primeiraMusica),
        cover: this.getTrackImage(primeiraMusica) || this.getAlbumImage(album) || '/default-artist.png',
        url: this.getTrackPreviewUrl(primeiraMusica),
        duration: this.getTrackDuration(primeiraMusica) || 30,
        source: this.source || 'db'
      }

      const playlist = albumTracks.map((m, idx) => ({
        id: this.getTrackId(m),
        _id: this.getTrackId(m),
        title: this.getTrackName(m),
        artist: this.getTrackArtists(m),
        cover: this.getTrackImage(m) || this.getAlbumImage(album) || '/default-artist.png',
        url: this.getTrackPreviewUrl(m),
        duration: this.getTrackDuration(m) || 30,
        source: this.source || 'db'
      })).filter(m => m.id)

      this.currentTrackId = musicaId
      this.isPlaying = true

      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: songData,
          playlist: playlist,
          index: 0,
          context: `album_${albumId}`
        }
      }))

      this.mostrarToast(`Tocando: ${this.getAlbumName(album)}`, 'success')
    },

    // ========== LIKES / CURTIDAS (CORRIGIDO - MESMO PADRÃO DO CURTIDAS.VUE) ==========
   
    handleStorageChange(e) {
      if (e.key === 'likedTracks' || e.key === 'curtidas-updated') {
        this.carregarLikes()
      }
    },

    async carregarLikes() {
      // 🔥 CARREGA DO LOCALSTORAGE PRIMEIRO (igual Curtidas.vue)
      const stored = localStorage.getItem('likedTracks')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Garante que todos os IDs sejam strings
          this.likedTracks = parsed.map(id => id.toString())
        } catch (e) {
          this.likedTracks = []
        }
      }

      const storedAlbums = localStorage.getItem('likedAlbums')
      if (storedAlbums) {
        try {
          this.likedAlbums = JSON.parse(storedAlbums)
        } catch (e) {
          this.likedAlbums = []
        }
      }

      // 🔥 SINCRONIZA COM SERVIDOR (igual Curtidas.vue)
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const res = await fetch(`${API_BASE_URL}/curtidas`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) return

        const data = await res.json()

        // Extrai IDs do servidor e converte para string
        const serverLikes = data.map(c => {
          const id = c.id?.toString() || c._id?.toString() || c.musicaId?.toString()
          return id
        }).filter(Boolean)

        // Merge: local + servidor (remove duplicatas)
        const merged = [...new Set([...this.likedTracks, ...serverLikes])]
        this.likedTracks = merged
       
        // Atualiza localStorage
        localStorage.setItem('likedTracks', JSON.stringify(merged))

      } catch (err) {
        console.warn('Erro ao sincronizar curtidas:', err)
      }
    },

    // 🔥 NOVO: Verifica se música está curtida (usado no template)
    isTrackLiked(trackId) {
      if (!trackId) return false
      const trackIdStr = trackId.toString()
      return this.likedTracks.some(id => id.toString() === trackIdStr)
    },

    // 🔥 CORREÇÃO PRINCIPAL: toggleLike reescrito seguindo padrão do Curtidas.vue
    async toggleLike(musica) {
      if (!musica) {
        console.error('toggleLike: musica é null/undefined')
        return
      }

      const trackId = this.getTrackId(musica)
      if (!trackId) {
        console.error('toggleLike: trackId é null/undefined', musica)
        this.mostrarToast('Erro: ID da música não encontrado', 'error')
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        this.mostrarToast('Faça login para curtir músicas', 'error')
        this.$router.push('/login')
        return
      }

      const trackIdStr = trackId.toString()
      const isAlreadyLiked = this.isTrackLiked(trackIdStr)

      try {
        const body = {
          source: this.source || 'local'
        }

        // Se for externa (Spotify/Deezer), envia os dados completos
        if (this.source !== 'db' && this.source !== 'local') {
          // Extrai o nome do álbum de forma segura
          let albumName = ''
          if (musica.album) {
            if (typeof musica.album === 'string') {
              albumName = musica.album
            } else if (musica.album.title) {
              albumName = musica.album.title
            } else if (musica.album.name) {
              albumName = musica.album.name
            }
          }

          body.dadosMusica = {
            titulo: this.getTrackName(musica),
            artista: this.getTrackArtists(musica),
            capa: this.getTrackImage(musica) || '',
            previewUrl: this.getTrackPreviewUrl(musica) || '',
            duration: this.getTrackDuration(musica) || 30,
            ano: musica.ano || null,
            album: albumName  // Sempre uma string
          }
        }

        console.log('Enviando curtida:', { trackId: trackIdStr, body })

        const res = await fetch(`${API_BASE_URL}/curtidas/${trackIdStr}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        })

        console.log('Resposta status:', res.status)

        let data = {}
        try {
          const text = await res.text()
          console.log('Resposta texto:', text)
          data = text ? JSON.parse(text) : {}
        } catch (parseErr) {
          console.warn('Erro ao parsear resposta:', parseErr)
        }

        if (!res.ok) {
          throw new Error(data.error || data.message || `Erro HTTP ${res.status}`)
        }

        // O servidor retorna { liked: true/false }
        const liked = data.liked !== undefined ? data.liked : !isAlreadyLiked

        if (liked) {
          // Adiciona aos curtidos
          if (!this.isTrackLiked(trackIdStr)) {
            this.likedTracks.push(trackIdStr)
          }
          this.mostrarToast('Adicionada aos curtidos ❤️', 'success')
        } else {
          // Remove dos curtidos
          this.likedTracks = this.likedTracks.filter(id => id.toString() !== trackIdStr)
          this.mostrarToast('Removida dos curtidos', 'info')
        }

        // Salva no localStorage e dispara eventos (igual Curtidas.vue)
        localStorage.setItem('likedTracks', JSON.stringify(this.likedTracks))
       
        window.dispatchEvent(new Event('likes-updated'))
        window.dispatchEvent(new Event('curtidas-updated'))
       
        // Trigger storage event para outras abas
        localStorage.setItem('curtidas-updated', Date.now().toString())
        localStorage.removeItem('curtidas-updated')

      } catch (err) {
        console.error('Erro completo ao curtir:', err)
        this.mostrarToast(err.message || 'Erro ao curtir música', 'error')
      }
    },

    toggleAlbumLike(albumId) {
      if (!albumId) return
      const idx = this.likedAlbums.indexOf(albumId)
      if (idx > -1) {
        this.likedAlbums.splice(idx, 1)
      } else {
        this.likedAlbums.push(albumId)
      }
      localStorage.setItem('likedAlbums', JSON.stringify(this.likedAlbums))
    },

    // ========== UTILITÁRIOS ==========
    formatarSeguidores(num) {
      if (!num) return '0'
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return num.toString()
    },

    formatarDuracao(segundos) {
      if (!segundos) return '0:00'
      const mins = Math.floor(segundos / 60)
      const segs = segundos % 60
      return `${mins}:${String(segs).padStart(2, '0')}`
    },

    getParticleStyle(n) {
      const delay = Math.random() * 2
      const left = Math.random() * 100
      const duration = 3 + Math.random() * 4
      return {
        left: `${left}%`,
        top: '100%',
        animation: `float-up ${duration}s linear infinite`,
        animationDelay: `${delay}s`
      }
    },

    handleScroll() {
      this.isTabsSticky = window.scrollY > 300
    },

    handleResize() {
      this.isMobile = window.innerWidth < 768
    },

    handleDocumentClick(e) {
      if (!e.target.closest('.btn-more')) {
        this.showMoreOptions = false
      }
    },

    toggleMoreOptions() {
      this.showMoreOptions = !this.showMoreOptions
    },

    compartilhar() {
      const artistName = this.getArtistName()
      const text = `Confira ${artistName} em nossa plataforma!`
      if (navigator.share) {
        navigator.share({
          title: artistName,
          text: text,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(window.location.href)
        this.mostrarToast('Link copiado!', 'success')
      }
    },

    reportar() {
      this.mostrarToast('Obrigado por reportar. Analisaremos em breve.', 'success')
    },

    verTodasMusicas() {
      this.mostrarToast('Redirecionando para todas as músicas...', 'info')
    },

    showTrackMenu(musica) {
      this.mostrarToast(`Menu da música: ${this.getTrackName(musica)}`, 'info')
    },

    handleImageError(e) {
      e.target.src = '/default-artist.png'
    },

    handleTrackImageError(e) {
      e.target.src = '/default-track.png'
    },

    handleAlbumImageError(e) {
      e.target.src = '/default-album.png'
    },

    mostrarToast(message, type = 'success') {
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout)
      }
      this.toast = { show: true, message, type }
      this.toastTimeout = setTimeout(() => {
        this.toast.show = false
      }, 3000)
    },

    // ========== MODAL DE ÁLBUM ==========
    abrirModalAlbum(album) {
      this.albumSelecionado = album
      this.albumModalAberto = true
      this.ensureAlbumTracks(album)
      document.body.style.overflow = 'hidden'
    },

    fecharModalAlbum() {
      this.albumModalAberto = false
      this.albumSelecionado = null
      this.hoveredModalTrack = null
      document.body.style.overflow = 'auto'
    },

    playAlbumFromModal(album) {
      this.playAlbum(album)
      this.mostrarToast(`Tocando: ${this.getAlbumName(album)}`, 'success')
    }
  }
}
</script>
<style scoped>
:root {
  --primary: #8b5cf6;
  --primary-hover: #7c3aed;
  --bg-dark: #0a0a0f;
  --bg-card: rgba(255, 255, 255, 0.03);
  --bg-card-hover: rgba(255, 255, 255, 0.06);
  --bg-glass: rgba(255, 255, 255, 0.05);
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(139, 92, 246, 0.2);
  --radius: 16px;
  --radius-sm: 12px;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 48px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 40px rgba(139, 92, 246, 0.2);
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-dark);
  min-height: 100vh;
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

/* ===== LOADING SKELETON ===== */
.loading-screen {
  min-height: 100vh;
  background: var(--bg-dark);
  animation: fadeIn 0.3s ease;
}

.skeleton-hero {
  position: relative;
  min-height: 500px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  align-items: flex-end;
  padding: 60px 32px;
  gap: 40px;
}

.skeleton-artista {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-info {
  flex: 1;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-tag { width: 120px; height: 28px; border-radius: 20px; background: var(--bg-glass); animation: shimmer 1.5s infinite; }
.skeleton-title { width: 60%; height: 56px; border-radius: 8px; background: var(--bg-glass); animation: shimmer 1.5s infinite; }
.skeleton-meta { width: 40%; height: 20px; border-radius: 4px; background: var(--bg-glass); animation: shimmer 1.5s infinite; }
.skeleton-bio { width: 80%; height: 60px; border-radius: 4px; background: var(--bg-glass); animation: shimmer 1.5s infinite; }
.skeleton-btn { width: 140px; height: 48px; border-radius: 100px; background: var(--bg-glass); animation: shimmer 1.5s infinite; }

.skeleton-sections {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 32px;
}

.skeleton-section {
  margin-bottom: 48px;
}

.skeleton-header {
  width: 200px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-glass);
  margin-bottom: 24px;
  animation: shimmer 1.5s infinite;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.skeleton-card {
  aspect-ratio: 1;
  border-radius: var(--radius);
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== LOADING MÚSICAS / SHOWS ===== */
.loading-musicas {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: var(--text-muted);
}

.spinner-musicas {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(139, 92, 246, 0.3);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== HERO SECTION PREMIUM ===== */
.hero {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: flex-end;
  padding: 60px 0 80px;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 15, 0.2) 0%,
    rgba(10, 10, 15, 0.6) 40%,
    var(--bg-dark) 100%
  );
  z-index: 1;
}

.hero-ambient-glow {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.hero-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(139, 92, 246, 0.4);
  border-radius: 50%;
  animation: float-up linear infinite;
}

@keyframes float-up {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: flex-end;
  gap: 48px;
}

/* Artist Photo */
.artist-visual {
  position: relative;
  flex-shrink: 0;
}

.artist-photo-wrapper {
  position: relative;
  width: 232px;
  height: 232px;
}

.foto-artista {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 2;
  border: 3px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg);
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.artist-photo-wrapper:hover .foto-artista {
  transform: scale(1.05);
}

.photo-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--primary);
  border-right-color: var(--primary);
  animation: spin-slow 8s linear infinite;
  z-index: 1;
}

.photo-glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%);
  z-index: 0;
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes spin-slow {
  to { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.verified-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  animation: verified-bounce 2s ease-in-out infinite;
}

@keyframes verified-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Hero Info */
.hero-info {
  flex: 1;
  padding-bottom: 8px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(139, 92, 246, 0.15);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.tag-pulse {
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
}

.artist-name {
  font-size: 64px;
  font-weight: 900;
  margin: 0 0 12px;
  line-height: 1.05;
  letter-spacing: -2px;
  background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: title-reveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes title-reveal {
  to { opacity: 1; transform: translateY(0); }
}

.genres {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  flex-wrap: wrap;
}

.genre-tag {
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
}

.genre-separator {
  color: var(--text-muted);
  margin-left: 8px;
}

.bio {
  color: var(--text-secondary);
  font-size: 17px;
  line-height: 1.7;
  max-width: 640px;
  margin: 0 0 28px;
}

/* Hero Actions */
.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-play {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--primary);
  color: white;
  border: none;
  padding: 16px 36px;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 24px rgba(139, 92, 246, 0.35);
  position: relative;
  overflow: hidden;
}

.btn-play:hover {
  background: var(--primary-hover);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.5);
}

.btn-play:active {
  transform: translateY(0) scale(0.98);
}

.btn-play.playing {
  background: white;
  color: var(--bg-dark);
}

.btn-ripple {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
  animation: ripple 2s ease-out infinite;
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

.btn-follow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--text-primary);
  border: 1.5px solid var(--border);
  padding: 14px 28px;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
}

.btn-follow:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}

.btn-follow.following {
  background: rgba(139, 92, 246, 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

.btn-follow.following:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.btn-follow:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-more {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
}

.btn-more:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #1e1e2e;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px;
  min-width: 180px;
  box-shadow: var(--shadow-lg);
  z-index: 100;
}

.dropdown-menu button {
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-menu button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.dropdown-menu button svg {
  flex-shrink: 0;
}

/* Audio Visualizer */
.audio-visualizer {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 32px;
  margin-top: 24px;
  opacity: 0.8;
}

.bar {
  width: 4px;
  background: linear-gradient(to top, var(--primary), #c4b5fd);
  border-radius: 2px;
  animation: equalize 1s ease-in-out infinite;
  animation-fill-mode: both;
}

@keyframes equalize {
  0%, 100% { height: 20%; }
  50% { height: 100%; }
}

/* Hero Fade */
.hero-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(to top, var(--bg-dark), transparent);
  z-index: 1;
  pointer-events: none;
}

/* ===== TABS NAVIGATION ===== */
.tabs-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  transition: var(--transition);
}

.tabs-nav.sticky {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.tabs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  position: relative;
  gap: 4px;
}

.tab-btn {
  padding: 20px 24px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--text-primary);
}

.tab-icon {
  font-size: 18px;
}

.tab-count {
  background: rgba(139, 92, 246, 0.2);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 100px;
  margin-left: 4px;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--primary);
  border-radius: 3px 3px 0 0;
  width: 33.33%;
  transition: transform 0.3s ease;
}

/* ===== SECTIONS ===== */
.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h2 {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

.btn-ver-todos {
  background: transparent;
  color: var(--primary);
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-ver-todos:hover {
  color: var(--primary-hover);
}

/* ===== MÚSICAS ===== */
.musicas-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.musica-row {
  display: grid;
  grid-template-columns: 40px 60px 1fr 150px 60px 40px 40px;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid transparent;
  transition: var(--transition);
  cursor: pointer;
}

.musica-row:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
}

.musica-row.playing {
  background: rgba(139, 92, 246, 0.1);
  border-color: var(--primary);
}

.track-number {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.number {
  display: block;
}

.track-play-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.track-play-btn:hover {
  background: var(--primary-hover);
  transform: scale(1.1);
}

.equalizer {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.equalizer span {
  width: 2px;
  background: white;
  border-radius: 1px;
  animation: equalize-bar 0.6s ease-in-out infinite;
}

.equalizer span:nth-child(1) { animation-delay: 0s; }
.equalizer span:nth-child(2) { animation-delay: 0.15s; }
.equalizer span:nth-child(3) { animation-delay: 0.3s; }

@keyframes equalize-bar {
  0%, 100% { height: 4px; }
  50% { height: 12px; }
}

.track-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.track-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
  color: white;
}

.track-image:hover .track-image-overlay {
  opacity: 1;
}

.track-image-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.track-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.track-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: var(--transition);
}

.track-name.active {
  color: var(--primary);
}

.track-artista {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-stats {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}

.track-duration {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}

.track-like {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.track-like:hover {
  color: #ef4444;
}

.track-like svg.liked {
  fill: #ef4444;
  color: #ef4444;
}

.track-more {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.track-more:hover {
  color: var(--text-primary);
}

/* ===== ÁLBUNS ===== */
.album-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.filter-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.albuns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.album-card {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

.album-cover-wrapper {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-card);
  margin-bottom: 16px;
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.album-cover-wrapper:hover .album-cover {
  transform: scale(1.05);
}

.album-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: var(--bg-card);
}

.album-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: var(--transition);
}

.album-cover-wrapper:hover .album-overlay {
  opacity: 1;
}

.album-play-btn,
.album-like-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.album-play-btn:hover,
.album-like-btn:hover {
  background: var(--primary-hover);
  transform: scale(1.1);
}

.album-like-btn svg.liked {
  fill: #ef4444;
  color: #ef4444;
}

.album-year-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.album-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.album-type {
  font-weight: 600;
}

.album-tracks {
  opacity: 0.8;
}

/* ===== SOBRE ===== */
.about-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
}

.about-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.about-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.about-card h2 {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 16px;
}

.about-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px;
}

.about-bio {
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0;
}

.about-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.stat-card {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
}

.stat-name {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.genres-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-badge {
  background: rgba(139, 92, 246, 0.1);
  color: var(--primary);
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.about-side {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.related-artists-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}

.related-artists-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px;
}

.related-artists-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-artist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: var(--transition);
}

.related-artist-item:hover {
  background: var(--bg-card-hover);
}

.related-artist-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.related-artist-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.related-artist-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.related-artist-genre {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== SHOWS ===== */
.shows-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.show-card {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  gap: 24px;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  transition: var(--transition);
}

.show-card:hover {
  background: var(--bg-card-hover);
  border-color: var(--border-hover);
}

.show-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.1);
  border-radius: var(--radius-sm);
  padding: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.show-day {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
}

.show-month {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.show-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.show-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.show-venue {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.show-date-full {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.show-btn {
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.show-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

/* ===== EMPTY STATE ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: var(--text-muted);
}

.empty-state svg {
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* ===== TOAST ===== */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #10b981;
  color: white;
  padding: 16px 24px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  animation: slideInUp 0.3s ease;
}

.toast.error {
  background: #ef4444;
}

.toast.info {
  background: var(--primary);
}

@keyframes slideInUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ============================================ */
/* MODAL DE ÁLBUM - GLASSMORPHISM ELEGANTE */
/* ============================================ */

/* Transição do Modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-album,
.modal-fade-leave-active .modal-album {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.modal-fade-enter-from .modal-album,
.modal-fade-leave-to .modal-album {
  transform: scale(0.92) translateY(20px);
  opacity: 0;
}

/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Modal Container */
.modal-album {
  background: linear-gradient(
    145deg,
    rgba(30, 30, 46, 0.95) 0%,
    rgba(20, 20, 35, 0.98) 50%,
    rgba(15, 15, 25, 0.99) 100%
  );
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: var(--radius);
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    0 0 60px rgba(139, 92, 246, 0.08);
  position: relative;
}

/* Glow decorativo no topo do modal */
.modal-album::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(139, 92, 246, 0.5) 50%,
    transparent 100%
  );
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 32px 32px 24px;
  gap: 20px;
  flex-shrink: 0;
}

.modal-header-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.modal-album-cover {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding-top: 4px;
}

.modal-album-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-album-artist {
  font-size: 15px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

.modal-album-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.meta-item {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.meta-divider {
  color: var(--text-muted);
  opacity: 0.5;
  font-size: 13px;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
  transform: rotate(90deg);
}

/* Modal Actions */
.modal-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 32px 24px;
  flex-shrink: 0;
}

.modal-btn-play {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

.modal-btn-play:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(139, 92, 246, 0.4);
}

.modal-btn-play:active {
  transform: translateY(0) scale(0.98);
}

.modal-btn-play svg {
  flex-shrink: 0;
}

.modal-btn-like {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.modal-btn-like:hover {
  border-color: #ef4444;
  color: #ef4444;
  transform: scale(1.1);
}

.modal-btn-like.liked {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.modal-btn-like.liked:hover {
  background: rgba(239, 68, 68, 0.2);
}

.modal-btn-like svg {
  transition: transform 0.2s ease;
}

.modal-btn-like:hover svg {
  transform: scale(1.15);
}

/* Modal Tracks Container */
.modal-tracks-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px 32px;
  min-height: 0;
}

/* Scrollbar personalizada */
.modal-tracks-container::-webkit-scrollbar {
  width: 6px;
}

.modal-tracks-container::-webkit-scrollbar-track {
  background: transparent;
}

.modal-tracks-container::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.2);
  border-radius: 3px;
}

.modal-tracks-container::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.4);
}

/* Loading dentro do modal */
.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  gap: 16px;
  color: var(--text-muted);
}

.spinner-small {
  width: 32px;
  height: 32px;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Modal Tracks List */
.modal-tracks-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-track-item {
  display: grid;
  grid-template-columns: 40px 1fr 60px 36px;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid transparent;
  transition: var(--transition);
  cursor: pointer;
}

.modal-track-item:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(139, 92, 246, 0.1);
}

.modal-track-item.playing {
  background: rgba(139, 92, 246, 0.08);
  border-color: rgba(139, 92, 246, 0.2);
}

.modal-track-number {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  width: 28px;
}

.modal-track-play-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  padding: 0;
}

.modal-track-play-btn:hover {
  background: var(--primary-hover);
  transform: scale(1.15);
}

.equalizer-small {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}

.equalizer-small span {
  width: 2px;
  background: white;
  border-radius: 1px;
  animation: equalize-bar 0.5s ease-in-out infinite;
}

.equalizer-small span:nth-child(1) { animation-delay: 0s; }
.equalizer-small span:nth-child(2) { animation-delay: 0.1s; }
.equalizer-small span:nth-child(3) { animation-delay: 0.2s; }

.modal-track-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.modal-track-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: var(--transition);
}

.modal-track-name.active {
  color: var(--primary);
}

.modal-track-artist {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-track-duration {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.modal-track-like {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  padding: 0;
}

.modal-track-like:hover {
  color: #ef4444;
  transform: scale(1.15);
}

.modal-track-like svg.liked {
  fill: #ef4444;
  color: #ef4444;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero-content {
    gap: 32px;
  }

  .artist-photo-wrapper {
    width: 180px;
    height: 180px;
  }

  .artist-name {
    font-size: 48px;
  }

  .musica-row {
    grid-template-columns: 40px 1fr 60px 40px;
    gap: 12px;
  }

  .track-image,
  .track-image-placeholder {
    display: none;
  }

  .track-stats {
    display: none;
  }

  .albuns-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .about-container {
    grid-template-columns: 1fr;
  }

  .show-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  /* Modal responsivo tablet */
  .modal-album {
    max-width: 560px;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 400px;
    padding: 40px 0 60px;
  }

  .hero-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
  }

  .artist-visual {
    order: -1;
  }

  .artist-photo-wrapper {
    width: 160px;
    height: 160px;
  }

  .artist-name {
    font-size: 36px;
  }

  .bio {
    max-width: 100%;
  }

  .hero-actions {
    justify-content: center;
    width: 100%;
  }

  .section {
    padding: 32px 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .musica-row {
    grid-template-columns: 40px 1fr 40px 40px;
  }

  .track-duration {
    display: none;
  }

  .albuns-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .album-card {
    animation-delay: 0s !important;
  }

  .stats-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .stat-divider {
    display: none;
  }

  .tabs-container {
    padding: 0 16px;
    overflow-x: auto;
  }

  .tab-btn {
    padding: 16px 16px;
    font-size: 13px;
    white-space: nowrap;
  }

  /* Modal responsivo mobile */
  .modal-overlay {
    padding: 16px;
    align-items: flex-end;
  }

  .modal-album {
    max-height: 90vh;
    border-radius: var(--radius) var(--radius) 0 0;
  }

  .modal-header {
    padding: 24px 20px 16px;
    gap: 16px;
  }

  .modal-album-cover {
    width: 80px;
    height: 80px;
  }

  .modal-album-title {
    font-size: 18px;
  }

  .modal-album-artist {
    font-size: 14px;
  }

  .modal-actions {
    padding: 0 20px 16px;
  }

  .modal-tracks-container {
    padding: 0 20px 24px;
  }

  .modal-track-item {
    grid-template-columns: 36px 1fr 50px 32px;
    gap: 10px;
    padding: 8px 10px;
  }
}

@media (max-width: 480px) {
  .artist-name {
    font-size: 28px;
  }

  .artist-photo-wrapper {
    width: 120px;
    height: 120px;
  }

  .info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .hero-actions {
    flex-wrap: wrap;
  }

  .btn-play {
    padding: 12px 24px;
    font-size: 14px;
  }

  .btn-follow {
    padding: 12px 20px;
    font-size: 13px;
  }

  .musica-row {
    grid-template-columns: 40px 1fr 40px;
    gap: 8px;
  }

  .track-like {
    display: none;
  }

  .albuns-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .album-name {
    font-size: 13px;
  }

  .album-meta {
    font-size: 11px;
  }

  .show-card {
    padding: 16px;
  }

  .toast {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }

  /* Modal responsivo pequeno */
  .modal-header {
    padding: 20px 16px 12px;
  }

  .modal-album-cover {
    width: 64px;
    height: 64px;
  }

  .modal-album-title {
    font-size: 16px;
  }

  .modal-actions {
    padding: 0 16px 12px;
  }

  .modal-btn-play {
    padding: 10px 20px;
    font-size: 14px;
  }

  .modal-tracks-container {
    padding: 0 16px 20px;
  }

  .modal-track-item {
    grid-template-columns: 32px 1fr 45px 28px;
    gap: 8px;
    padding: 6px 8px;
  }

  .modal-track-name {
    font-size: 13px;
  }

  .modal-track-artist {
    font-size: 11px;
  }
}
</style>