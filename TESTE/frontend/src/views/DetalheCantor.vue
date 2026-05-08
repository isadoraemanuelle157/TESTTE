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
                <img :src="cantor.foto || cantor.images?.[0]?.url || '/default-artist.png'" :alt="cantor.nome || cantor.name" class="foto-artista" @error="handleImageError" />
                <div class="photo-ring"></div>
                <div class="photo-glow"></div>
                <div v-if="cantor.verificado || cantor.popularity > 70" class="verified-badge" title="Artista Verificado">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="hero-info">
              <div class="info-header">
                <span v-if="cantor.verificado || cantor.popularity > 70" class="tag">
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
                    <span class="stat-value">{{ cantor.ouvintesMensais || formatarSeguidores(cantor.popularity * 34000) || '2.4M' }}</span>
                    <span class="stat-label">ouvintes mensais</span>
                  </div>
                  <div class="stat-divider"></div>
                  <div class="stat-item">
                    <span class="stat-value">#{{ cantor.ranking || cantor.popularity || '42' }}</span>
                    <span class="stat-label">no mundo</span>
                  </div>
                </div>
              </div>

              <h1 class="artist-name">{{ cantor.nome || cantor.name }}</h1>
           
              <p class="genres">
                <span v-for="(genero, idx) in (cantor.generos || cantor.genres || [])" :key="genero._id || genero || idx" class="genre-tag">
                  {{ genero.nome || genero }}
                  <span v-if="idx < (cantor.generos || cantor.genres || []).length - 1" class="genre-separator">•</span>
                </span>
              </p>

              <p class="bio" v-if="cantor.bio || cantor.description">{{ cantor.bio || cantor.description }}</p>

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
              <span class="tab-icon">{{ tab.icon }}</span>
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
            <button class="btn-ver-todos" @click="verTodasMusicas">Ver todos</button>
          </div>
       
          <div v-if="!musicasCarregadas" class="loading-musicas">
            <div class="spinner-musicas"></div>
            <p>Carregando músicas...</p>
          </div>
       
          <div v-else-if="!cantor.musicas || cantor.musicas.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            <p>Nenhuma música disponível</p>
          </div>
       
          <div v-else class="musicas-list">
            <div
              v-for="(musica, index) in cantor.musicas"
              :key="musica._id || musica.id || index"
              class="musica-row"
              :class="{ 'playing': currentTrackId === (musica._id || musica.id) && isPlaying }"
              @mouseenter="hoveredTrack = musica._id || musica.id"
              @mouseleave="hoveredTrack = null"
              @click="playTrack(musica)"
            >
              <div class="track-number">
                <span v-if="hoveredTrack !== (musica._id || musica.id) && !(currentTrackId === (musica._id || musica.id) && isPlaying)" class="number">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
                <button v-else class="track-play-btn" @click.stop="playTrack(musica)">
                  <svg v-if="currentTrackId !== (musica._id || musica.id) || !isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <div v-else class="equalizer">
                    <span></span><span></span><span></span>
                  </div>
                </button>
              </div>

              <div class="track-image" v-if="musica.foto || musica.album?.images?.[0]?.url || musica.cover">
                <img :src="musica.foto || musica.album?.images?.[0]?.url || musica.cover" :alt="musica.nome || musica.title" @error="handleTrackImageError" />
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
                <span class="track-name" :class="{ 'active': currentTrackId === (musica._id || musica.id) && isPlaying }">{{ musica.nome || musica.title }}</span>
                <span class="track-artista">{{ getArtistasNomes(musica) }}</span>
              </div>

              <div class="track-stats">
                <span class="track-plays">{{ formatarSeguidores(musica.plays || musica.popularity || Math.floor(Math.random() * 5000000)) }} reproduções</span>
              </div>

              <div class="track-duration">{{ formatarDuracao(musica.duracao || musica.duration_ms) }}</div>

              <button class="track-like" @click.stop="toggleLike(musica._id || musica.id)">
                <svg :class="{ 'liked': likedTracks.includes(musica._id || musica.id) }" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>

              <button class="track-more" @click.stop="showTrackMenu(musica)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </section>

        <!-- Álbuns -->
        <section v-show="activeTab === 'albuns'" class="section albuns-section">
          <div class="section-header">
            <h2>Discografia</h2>
            <div class="album-filters">
              <button
                v-for="filter in albumFilters"
                :key="filter.value"
                class="filter-btn"
                :class="{ 'active': activeAlbumFilter === filter.value }"
                @click="activeAlbumFilter = filter.value"
              >
                {{ filter.label }}
              </button>
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
              :key="album._id || album.id || index"
              class="album-card"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="album-cover-wrapper">
                <img v-if="album.foto || album.images?.[0]?.url" :src="album.foto || album.images?.[0]?.url" :alt="album.nome || album.name" class="album-cover" @error="handleAlbumImageError" />
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
                  <button class="album-like-btn" @click.stop="toggleAlbumLike(album._id || album.id)">
                    <svg :class="{ 'liked': likedAlbums.includes(album._id || album.id) }" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>

                <div class="album-year-badge">{{ album.ano || album.release_date?.split('-')[0] || '2024' }}</div>
              </div>

              <div class="album-info">
                <h3 class="album-name">{{ album.nome || album.name }}</h3>
                <p class="album-meta">
                  <span class="album-type">{{ album.tipo || album.album_type || 'Álbum' }}</span>
                  <span class="album-tracks">{{ (album.musicas || album.total_tracks || []).length }} músicas</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Sobre -->
        <section v-show="activeTab === 'sobre'" class="section sobre-section">
          <div class="sobre-grid">
            <div class="sobre-main">
              <h2>Sobre o Artista</h2>
              <p class="sobre-texto">{{ cantor.sobre || cantor.bio || cantor.description || 'Biografia não disponível.' }}</p>
           
              <div class="sobre-stats">
                <div class="sobre-stat">
                  <span class="sobre-stat-value">{{ cantor.cidade || 'São Paulo, BR' }}</span>
                  <span class="sobre-stat-label">Cidade Natal</span>
                </div>
                <div class="sobre-stat">
                  <span class="sobre-stat-value">{{ cantor.inicioCarreira || '2015' }}</span>
                  <span class="sobre-stat-label">Início da Carreira</span>
                </div>
                <div class="sobre-stat">
                  <span class="sobre-stat-value">{{ cantor.gravadora || 'Independente' }}</span>
                  <span class="sobre-stat-label">Gravadora</span>
                </div>
              </div>
            </div>

            <div class="sobre-image" v-if="cantor.fotoSecundaria || cantor.images?.[1]?.url">
              <img :src="cantor.fotoSecundaria || cantor.images?.[1]?.url" :alt="cantor.nome || cantor.name" @error="handleImageError" />
            </div>
          </div>
        </section>

        <!-- Shows -->
        <section v-show="activeTab === 'shows'" class="section shows-section">
          <div class="section-header">
            <h2>Próximos Shows</h2>
            <span class="section-subtitle">{{ shows.length }} data{{ shows.length !== 1 ? 's' : '' }} confirmada{{ shows.length !== 1 ? 's' : '' }}</span>
          </div>

          <div v-if="showsLoading" class="loading-musicas">
            <div class="spinner-musicas"></div>
            <p>Carregando shows...</p>
          </div>

          <div v-else-if="shows.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
            </svg>
            <p>Nenhum show agendado</p>
            <span class="empty-subtitle">Fique de olho! Novas datas em breve.</span>
          </div>

          <div v-else class="shows-timeline">
            <div v-for="(show, index) in shows" :key="show._id || index" class="show-item" :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="show-timeline-line"></div>
              <div class="show-timeline-dot"></div>
           
              <div class="show-card-premium">
                <div class="show-date-premium">
                  <span class="show-day">{{ formatarDia(show.data) }}</span>
                  <span class="show-month">{{ formatarMes(show.data) }}</span>
                  <span class="show-year">{{ formatarAno(show.data) }}</span>
                </div>

                <div class="show-content">
                  <div class="show-image" v-if="show.foto">
                    <img :src="show.foto" :alt="show.titulo" @error="handleImageError" />
                  </div>
                  <div class="show-details">
                    <h3>{{ show.titulo }}</h3>
                    <div class="show-location">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                      <span>{{ show.local }} — {{ show.cidade }}</span>
                    </div>
                    <div class="show-time" v-if="show.horario">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <span>{{ show.horario }}</span>
                    </div>
                  </div>
                </div>

                <a v-if="show.linkIngressos" :href="show.linkIngressos" target="_blank" rel="noopener noreferrer" class="btn-ingressos">
                  <span>Ingressos</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M7 17L17 7M17 7H7M17 7v10"/>
                  </svg>
                </a>
                <button v-else class="btn-ingressos disabled">
                  <span>Esgotado</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Artistas Relacionados -->
        <section v-if="artistasRelacionados && artistasRelacionados.length > 0" class="section relacionados-section">
          <div class="section-header">
            <h2>Fãs também curtem</h2>
          </div>
          <div class="relacionados-grid">
            <div v-for="artista in artistasRelacionados" :key="artista._id || artista.id" class="relacionado-card" @click="irParaArtista(artista._id || artista.id)">
              <div class="relacionado-image">
                <img :src="artista.foto || artista.images?.[0]?.url || '/default-artist.png'" :alt="artista.nome || artista.name" @error="handleImageError" />
                <button class="relacionado-play" @click.stop="playArtista(artista)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
              <h4>{{ artista.nome || artista.name }}</h4>
              <p>{{ artista.genero || artista.genres?.[0] || 'Artista' }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Erro -->
      <div v-else class="erro-premium">
        <div class="erro-animation">
          <div class="erro-disc">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
            </svg>
          </div>
        </div>
        <h2>Artista não encontrado</h2>
        <p>Não conseguimos encontrar esse artista no momento. Verifique o nome ou tente novamente mais tarde.</p>
        <button @click="$router.push('/')" class="btn-voltar">Voltar para o início</button>
      </div>

      <!-- Toast Notification -->
      <transition name="toast">
        <div v-if="toast.show" class="toast-notification" :class="toast.type">
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </transition>
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
          shows: [],
          showsLoading: false,
          isFollowing: false,
          followLoading: false,
          // === ESTADO DO PLAYER - CORRIGIDO ===
          isPlaying: false,
          currentTrackId: null,
          // =====================================
          hoveredTrack: null,
          likedTracks: [],
          likedAlbums: [],
          activeTab: 'musicas',
          activeAlbumFilter: 'todos',
          showMoreOptions: false,
          isTabsSticky: false,
          isMobile: false,
          musicasCarregadas: false,
          albunsCarregados: false,
          artistasRelacionados: [],
          source: 'db',
          toast: {
            show: false,
            message: '',
            type: 'success'
          }
        }
      },

      computed: {
        heroStyle() {
          if (this.cantor?.banner || this.cantor?.images?.[0]?.url) {
            return {
              backgroundImage: `url(${this.cantor.banner || this.cantor.images[0].url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }
          }
          return {
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)'
          }
        },

        tabs() {
          const musicas = this.cantor?.musicas || []
          const albuns = this.cantor?.albuns || []
          return [
            { id: 'musicas', label: 'Músicas', icon: '🎵', count: musicas.length },
            { id: 'albuns', label: 'Discografia', icon: '💿', count: albuns.length },
            { id: 'sobre', label: 'Sobre', icon: '👤' },
            { id: 'shows', label: 'Shows', icon: '🎤', count: this.shows?.length }
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
          const albuns = this.cantor?.albuns || []
          if (this.activeAlbumFilter === 'todos') return albuns
          return albuns.filter(album =>
            (album.tipo || album.album_type || 'album').toLowerCase() === this.activeAlbumFilter
          )
        }
      },

      async mounted() {
        this.isMobile = window.innerWidth < 768
        this.carregarLikes()
        await this.carregarDetalhes()
       
        // === ESCUTA EVENTOS DO MUSICPLAYER - CORRIGIDO ===
        window.addEventListener('player-state-changed', this.handlePlayerStateChange)
        window.addEventListener('music-player-state-changed', this.handlePlayerStateChange)
        // ================================================
       
        window.addEventListener('scroll', this.handleScroll)
        window.addEventListener('resize', this.handleResize)
        document.addEventListener('click', this.handleDocumentClick)
      },

      beforeUnmount() {
        // === REMOVE EVENTOS - CORRIGIDO ===
        window.removeEventListener('player-state-changed', this.handlePlayerStateChange)
        window.removeEventListener('music-player-state-changed', this.handlePlayerStateChange)
        // =================================
        window.removeEventListener('scroll', this.handleScroll)
        window.removeEventListener('resize', this.handleResize)
        document.removeEventListener('click', this.handleDocumentClick)
      },

      methods: {
        // ========== SINCRONIZAÇÃO COM MUSICPLAYER - CORRIGIDO ==========
        handlePlayerStateChange(e) {
          const detail = e.detail || {}
          console.log('🎵 CantorDetalhe recebeu estado do player:', detail)
         
          // Atualiza estado local baseado no evento global
          this.isPlaying = detail.isPlaying || false
         
          // Pega o ID da música atual do player
          if (detail.track) {
            this.currentTrackId = detail.track.id || detail.track._id || null
          } else if (detail.currentTrack) {
            this.currentTrackId = detail.currentTrack._id || detail.currentTrack.id || null
          }
        },
        // ==============================================================

        // ========== NOVO: Pega número real de seguidores ==========
        getRealFollowers() {
          if (!this.cantor) return 0
         
          if (this.source === 'spotify') {
            return this.cantor.followers?.total || this.cantor.totalSeguidores || 0
          }
         
          return this.cantor.totalSeguidores || this.cantor.nb_fan || this.cantor.followers?.total || 0
        },

        // ========== NOVO: Pega nomes dos artistas da música ==========
        getArtistasNomes(musica) {
          if (!musica) return this.cantor?.nome || this.cantor?.name || 'Artista Desconhecido'
         
          if (musica.artists && Array.isArray(musica.artists)) {
            return musica.artists.map(a => a.name).join(', ')
          }
         
          if (musica.cantores && Array.isArray(musica.cantores)) {
            return musica.cantores.map(c => c.nome || c).join(', ')
          }
         
          return this.cantor?.nome || this.cantor?.name || 'Artista Desconhecido'
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

            // ARTISTA DO BANCO
            if (this.source === 'db') {
              const res = await fetch(`${API_BASE_URL}/cantores/${artistId}`)
              if (!res.ok) throw new Error('Artista não encontrado')
              this.cantor = await res.json()

              // Carrega shows do banco
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
             
              // Verifica se está seguindo
              const token = localStorage.getItem('token')
              if (token) {
                await this.verificarSeguindo(token, artistId)
              }
              return
            }

            // DEEZER
            if (this.source === 'deezer') {
              const [artistRes, topTracksRes, albumsRes] = await Promise.all([
                fetch(`https://corsproxy.io/?https://api.deezer.com/artist/${artistId}`),
                fetch(`https://corsproxy.io/?https://api.deezer.com/artist/${artistId}/top?limit=20`),
                fetch(`https://corsproxy.io/?https://api.deezer.com/artist/${artistId}/albums?limit=20`)
              ])

              const artistData = await artistRes.json()
              const topTracksData = await topTracksRes.json()
              const albumsData = await albumsRes.json()

              this.cantor = {
                _id: artistData.id,
                id: artistData.id,
                nome: artistData.name,
                name: artistData.name,
                foto: artistData.picture_big,
                banner: artistData.picture_xl,
                totalSeguidores: artistData.nb_fan,
                nb_fan: artistData.nb_fan,
                bio: `Artista popular do Deezer com ${this.formatarSeguidores(artistData.nb_fan)} fãs`,
                generos: [{ nome: 'Música' }],
                genres: ['Música'],
                musicas: (topTracksData.data || []).map(track => ({
                  id: track.id,
                  _id: track.id,
                  nome: track.title,
                  title: track.title,
                  foto: track.album?.cover_medium,
                  cover: track.album?.cover_medium,
                  duracao: track.duration,
                  duration: track.duration,
                  preview: track.preview,
                  album: {
                    title: track.album?.title,
                    images: [{ url: track.album?.cover_medium }]
                  },
                  artists: [{ name: artistData.name }],
                  popularity: track.rank || Math.floor(Math.random() * 100)
                })),
                albuns: (albumsData.data || []).map(album => ({
                  id: album.id,
                  _id: album.id,
                  nome: album.title,
                  name: album.title,
                  foto: album.cover_medium,
                  cover: album.cover_medium,
                  images: [{ url: album.cover_medium }],
                  ano: album.release_date?.split('-')[0],
                  release_date: album.release_date,
                  tipo: album.type || 'album',
                  album_type: album.type || 'album',
                  total_tracks: album.nb_tracks,
                  musicas: []
                }))
              }

              this.shows = []
              this.showsLoading = false
              this.musicasCarregadas = true
              this.albunsCarregados = true
              return
            }

            // SPOTIFY
            if (this.source === 'spotify') {
              const [artistRes, topTracksRes, albumsRes, relatedRes] = await Promise.all([
                fetch(`${API_BASE_URL}/spotify/artist/${artistId}`),
                fetch(`${API_BASE_URL}/spotify/artist/${artistId}/top-tracks`),
                fetch(`${API_BASE_URL}/spotify/artist/${artistId}/albums?limit=20`),
                fetch(`${API_BASE_URL}/spotify/artist/${artistId}/related-artists`)
              ])

              const artistData = await artistRes.json()
              const topTracksData = await topTracksRes.json()
              const albumsData = await albumsRes.json()
              const relatedData = await relatedRes.json()

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
                bio: `Artista do Spotify com ${this.formatarSeguidores(artistData.followers?.total)} seguidores reais`,
                generos: artistData.genres?.map(g => ({ nome: g })) || [],
                genres: artistData.genres || [],
                musicas: (topTracksData.tracks || []).map(track => ({
                  id: track.id,
                  _id: track.id,
                  nome: track.name,
                  title: track.name,
                  foto: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url,
                  cover: track.album?.images?.[0]?.url,
                  duracao: Math.floor(track.duration_ms / 1000),
                  duration_ms: track.duration_ms,
                  preview_url: track.preview_url,
                  album: track.album,
                  artists: track.artists,
                  popularity: track.popularity || Math.floor(Math.random() * 100),
                  plays: track.popularity ? track.popularity * 50000 : Math.floor(Math.random() * 5000000)
                })),
                albuns: (albumsData.items || []).map(album => ({
                  id: album.id,
                  _id: album.id,
                  nome: album.name,
                  name: album.name,
                  foto: album.images?.[0]?.url,
                  images: album.images,
                  cover: album.images?.[0]?.url,
                  ano: album.release_date?.split('-')[0],
                  release_date: album.release_date,
                  tipo: album.album_type || 'album',
                  album_type: album.album_type || 'album',
                  total_tracks: album.total_tracks,
                  musicas: []
                }))
              }

              this.artistasRelacionados = (relatedData.artists || []).slice(0, 6).map(artist => ({
                id: artist.id,
                _id: artist.id,
                nome: artist.name,
                name: artist.name,
                foto: artist.images?.[0]?.url,
                images: artist.images,
                genres: artist.genres,
                genero: artist.genres?.[0]
              }))

              this.shows = []
              this.showsLoading = false
              this.musicasCarregadas = true
              this.albunsCarregados = true
              return
            }

          } catch (error) {
            console.error(error)
            this.cantor = null
            this.mostrarToast('Erro ao carregar artista', 'error')
          } finally {
            this.loading = false
            this.showsLoading = false
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

        // ========== PLAYER INTEGRADO - CORRIGIDO ==========
       
        // Botão principal "Tocar/Pausar" no hero
        togglePlay() {
          if (!this.cantor?.musicas?.length) return
         
          const primeiraMusica = this.cantor.musicas[0]
          const musicaId = primeiraMusica._id || primeiraMusica.id
         
          // Se já está tocando a primeira música, apenas alterna play/pause
          if (this.currentTrackId === musicaId && this.isPlaying) {
            window.dispatchEvent(new CustomEvent('player-toggle-play'))
            return
          }
         
          // Se está tocando outra música ou não está tocando nada, toca a primeira
          this.playTrack(primeiraMusica)
        },

        // Tocar uma música específica
        async playTrack(musica) {
          if (!musica) return
         
          const musicaId = musica._id || musica.id
          if (!musicaId) return
         
          // Se já está tocando esta música específica, apenas alterna play/pause
          if (this.currentTrackId === musicaId && this.isPlaying) {
            window.dispatchEvent(new CustomEvent('player-toggle-play'))
            return
          }

          console.log('🎵 CantorDetalhe: Solicitando tocar música:', musica.nome || musica.title)
         
          // Atualiza estado local imediatamente para feedback visual
          this.currentTrackId = musicaId
          this.isPlaying = true
         
          // Prepara dados da música no formato que o MusicPlayer espera
          const songData = {
            id: musicaId,
            _id: musicaId,
            title: musica.nome || musica.title || 'Música',
            artist: this.getArtistasNomes(musica),
            cover: musica.foto || musica.album?.images?.[0]?.url || musica.cover || '/default-artist.png',
            url: musica.preview || musica.preview_url || '',
            duration: musica.duracao || (musica.duration_ms ? Math.floor(musica.duration_ms / 1000) : 30),
            source: this.source || 'db'
          }

          // Envia evento para o MusicPlayer
          window.dispatchEvent(new CustomEvent('play-song', {
            detail: {
              song: songData,
              playlist: this.cantor.musicas.map((m, idx) => ({
                id: m._id || m.id,
                _id: m._id || m.id,
                title: m.nome || m.title || 'Música',
                artist: this.getArtistasNomes(m),
                cover: m.foto || m.album?.images?.[0]?.url || m.cover || '/default-artist.png',
                url: m.preview || m.preview_url || '',
                duration: m.duracao || (m.duration_ms ? Math.floor(m.duration_ms / 1000) : 30),
                source: this.source || 'db'
              })),
              index: this.cantor.musicas.findIndex(m => (m._id || m.id) === musicaId),
              context: `artist_${this.cantor._id || this.cantor.id}`
            }
          }))
        },

        // Tocar álbum
        playAlbum(album) {
          if (!album) return
         
          if (album.musicas && album.musicas.length > 0) {
            this.playTrack(album.musicas[0])
            this.mostrarToast(`Reproduzindo álbum: ${album.nome || album.name}`, 'success')
          } else {
            this.mostrarToast(`Álbum ${album.nome || album.name} - Em breve`, 'success')
          }
        },

        // Tocar artista relacionado
        playArtista(artista) {
          if (!artista) return
          this.$router.push(`/artista/${artista._id || artista.id}?source=${artista.source || 'spotify'}`)
        },
        // ================================================

        // ========== LIKES ==========
        toggleLike(trackId) {
          if (!trackId) return
          const index = this.likedTracks.indexOf(trackId)
          if (index > -1) {
            this.likedTracks.splice(index, 1)
          } else {
            this.likedTracks.push(trackId)
          }
          this.salvarLikes()
        },

        toggleAlbumLike(albumId) {
          if (!albumId) return
          const index = this.likedAlbums.indexOf(albumId)
          if (index > -1) {
            this.likedAlbums.splice(index, 1)
          } else {
            this.likedAlbums.push(albumId)
          }
          this.salvarLikes()
        },

        carregarLikes() {
          try {
            const likes = JSON.parse(localStorage.getItem('likedTracks') || '[]')
            const albumLikes = JSON.parse(localStorage.getItem('likedAlbums') || '[]')
            this.likedTracks = likes
            this.likedAlbums = albumLikes
          } catch (e) {
            this.likedTracks = []
            this.likedAlbums = []
          }
        },

        salvarLikes() {
          localStorage.setItem('likedTracks', JSON.stringify(this.likedTracks))
          localStorage.setItem('likedAlbums', JSON.stringify(this.likedAlbums))
        },

        // ========== COMPARTILHAR / REPORTAR ==========
        compartilhar() {
          this.showMoreOptions = false
          if (navigator.share) {
            navigator.share({
              title: this.cantor?.nome || this.cantor?.name || 'Artista',
              text: `Confira ${this.cantor?.nome || this.cantor?.name} na SoundUp!`,
              url: window.location.href
            }).catch(() => {})
          } else {
            navigator.clipboard.writeText(window.location.href)
            this.mostrarToast('Link copiado para a área de transferência!', 'success')
          }
        },

        reportar() {
          this.showMoreOptions = false
          this.mostrarToast('Obrigado pelo feedback. Analisaremos sua denúncia.', 'success')
        },

        toggleMoreOptions() {
          this.showMoreOptions = !this.showMoreOptions
        },

        handleDocumentClick(e) {
          const moreBtn = this.$el.querySelector('.btn-more')
          if (moreBtn && !moreBtn.contains(e.target)) {
            this.showMoreOptions = false
          }
        },

        // ========== NAVEGAÇÃO ==========
        irParaArtista(id) {
          if (id) {
            this.$router.push(`/artista/${id}`)
          }
        },

        verTodasMusicas() {
          this.mostrarToast('Todas as músicas serão exibidas em breve', 'success')
        },

        showTrackMenu(musica) {
          console.log('Menu da música:', musica?.nome || musica?.title)
        },

        // ========== UI HELPERS ==========
        handleScroll() {
          const tabsNav = this.$el?.querySelector('.tabs-nav')
          if (tabsNav) {
            this.isTabsSticky = tabsNav.getBoundingClientRect().top <= 0
          }
        },

        handleResize() {
          this.isMobile = window.innerWidth < 768
        },

        getParticleStyle(n) {
          return {
            left: `${(n * 5.3) % 100}%`,
            animationDelay: `${(n * 0.3) % 5}s`,
            animationDuration: `${5 + (n % 10)}s`,
            opacity: 0.2 + (n % 3) * 0.15
          }
        },

        // ========== FORMATADORES ==========
        formatarSeguidores(total) {
          if (!total || total === 0) return '0'
          if (total >= 1000000) return (total / 1000000).toFixed(1).replace('.0', '') + 'M'
          if (total >= 1000) return (total / 1000).toFixed(1).replace('.0', '') + 'K'
          return String(total)
        },

        formatarDuracao(duracao) {
          if (!duracao) return '3:45'
          if (typeof duracao === 'number') {
            if (duracao > 1000) {
              const totalSeconds = Math.floor(duracao / 1000)
              const min = Math.floor(totalSeconds / 60)
              const sec = totalSeconds % 60
              return `${min}:${String(sec).padStart(2, '0')}`
            }
            const min = Math.floor(duracao / 60)
            const sec = duracao % 60
            return `${min}:${String(sec).padStart(2, '0')}`
          }
          return duracao
        },

        formatarDia(dataStr) {
          try {
            return new Date(dataStr).getDate()
          } catch {
            return '--'
          }
        },

        formatarMes(dataStr) {
          try {
            return new Date(dataStr).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
          } catch {
            return '---'
          }
        },

        formatarAno(dataStr) {
          try {
            return new Date(dataStr).getFullYear()
          } catch {
            return '----'
          }
        },

        // ========== TOAST ==========
        mostrarToast(message, type = 'success') {
          this.toast = { show: true, message, type }
          setTimeout(() => {
            this.toast.show = false
          }, 3000)
        },

        // ========== IMAGE HANDLERS ==========
        handleImageError(e) {
          e.target.src = '/default-artist.png'
        },

        handleTrackImageError(e) {
          e.target.style.display = 'none'
          e.target.parentElement.classList.add('track-image-placeholder')
        },

        handleAlbumImageError(e) {
          e.target.style.display = 'none'
          const placeholder = e.target.parentElement.querySelector('.album-cover-placeholder')
          if (placeholder) placeholder.style.display = 'flex'
        }
      }
    }
    </script>
  <style scoped>
  /* ===== DESIGN SYSTEM ===== */
  .cantor-detalhe {
    --primary: #8b5cf6;
    --primary-hover: #7c3aed;
    --primary-light: rgba(139, 92, 246, 0.15);
    --primary-glow: rgba(139, 92, 246, 0.4);
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
    white-space: nowrap;
  }

  .tab-btn:hover {
    color: var(--text-secondary);
  }

  .tab-btn.active {
    color: var(--text-primary);
  }

  .tab-icon {
    font-size: 16px;
  }

  .tab-count {
    background: var(--bg-card);
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .tab-indicator {
    position: absolute;
    bottom: 0;
    left: 32px;
    width: calc((100% - 64px) / 4);
    height: 3px;
    background: var(--primary);
    border-radius: 3px 3px 0 0;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 -4px 12px rgba(139, 92, 246, 0.4);
  }

  /* ===== SECTIONS ===== */
  .section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 48px 32px;
    animation: fadeInUp 0.6s ease forwards;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .section-header h2 {
    font-size: 26px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .btn-ver-todos {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
  }

  .btn-ver-todos:hover {
    color: var(--primary);
  }

  .section-subtitle {
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;
  }

  /* ===== EMPTY STATE ===== */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 20px;
    color: var(--text-muted);
    gap: 16px;
  }

  .empty-state svg {
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 16px;
    margin: 0;
  }

  .empty-subtitle {
    font-size: 14px;
    opacity: 0.7;
  }

  /* ===== MUSICAS LIST ===== */
  .musicas-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .musica-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    transition: var(--transition);
    cursor: pointer;
    border: 1px solid transparent;
  }

  .musica-row:hover {
    background: var(--bg-card);
    border-color: var(--border);
  }

  .musica-row.playing {
    background: rgba(139, 92, 246, 0.08);
    border-color: rgba(139, 92, 246, 0.2);
  }

  .track-number {
    width: 40px;
    text-align: center;
    flex-shrink: 0;
  }

  .number {
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
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
    transform: scale(1.1);
    background: var(--primary-hover);
  }

  .equalizer {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 16px;
  }

  .equalizer span {
    width: 3px;
    background: var(--primary);
    border-radius: 1px;
    animation: eq-bar 0.8s ease-in-out infinite;
  }

  .equalizer span:nth-child(2) { animation-delay: 0.1s; }
  .equalizer span:nth-child(3) { animation-delay: 0.2s; }

  @keyframes eq-bar {
    0%, 100% { height: 30%; }
    50% { height: 100%; }
  }

  .track-image,
  .track-image-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
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
  }

  .track-image-overlay svg {
    color: white;
    width: 20px;
    height: 20px;
  }

  .musica-row:hover .track-image-overlay {
    opacity: 1;
  }

  .track-image-placeholder {
    background: linear-gradient(135deg, #1e1b4b, #312e81);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
  }

  .track-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .track-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-name.active {
    color: var(--primary);
  }

  .track-artista {
    font-size: 13px;
    color: var(--text-muted);
  }

  .track-stats {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .track-plays {
    font-size: 13px;
    color: var(--text-muted);
  }

  .track-duration {
    font-size: 14px;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    width: 48px;
    text-align: right;
  }

  .track-like,
  .track-more {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: none;
    border: none;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
    opacity: 0;
  }

  .musica-row:hover .track-like,
  .musica-row:hover .track-more {
    opacity: 1;
  }

  .track-like:hover {
    color: #ef4444;
    transform: scale(1.1);
  }

  .track-like svg.liked {
    color: #ef4444;
    fill: #ef4444;
  }

  .track-more:hover {
    color: var(--text-primary);
  }

  /* ===== ALBUNS GRID ===== */
  .albuns-section .section-header {
    flex-wrap: wrap;
    gap: 16px;
  }

  .album-filters {
    display: flex;
    gap: 8px;
  }

  .filter-btn {
    padding: 8px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 100px;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
  }

  .filter-btn:hover {
    background: var(--bg-card-hover);
    color: var(--text-secondary);
  }

  .filter-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .albuns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 28px;
  }

  .album-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    transition: var(--transition);
    animation: fadeInUp 0.5s ease forwards;
    opacity: 0;
  }

  .album-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: var(--border-hover);
  }

  .album-cover-wrapper {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
  }

  .album-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .album-card:hover .album-cover {
    transform: scale(1.1);
  }

  .album-cover-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1e1b4b, #312e81);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
  }

  .album-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%);
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 16px;
    opacity: 0;
    transition: var(--transition);
  }

  .album-card:hover .album-overlay {
    opacity: 1;
  }

  .album-play-btn {
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
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
  }

  .album-play-btn:hover {
    transform: scale(1.1);
    background: var(--primary-hover);
  }

  .album-like-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
    backdrop-filter: blur(10px);
  }

  .album-like-btn:hover {
    background: rgba(239, 68, 68, 0.8);
    transform: scale(1.1);
  }

  .album-like-btn svg.liked {
    color: #ef4444;
    fill: #ef4444;
  }

  .album-year-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .album-info {
    padding: 16px;
  }

  .album-name {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 6px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .album-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
  }

  .album-type {
    font-size: 13px;
    color: var(--primary);
    font-weight: 600;
  }

  .album-tracks {
    font-size: 13px;
    color: var(--text-muted);
  }

  /* ===== SOBRE SECTION ===== */
  .sobre-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }

  .sobre-main h2 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 20px;
  }

  .sobre-texto {
    color: var(--text-secondary);
    font-size: 17px;
    line-height: 1.9;
    margin: 0 0 32px;
  }

  .sobre-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .sobre-stat {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 20px;
    transition: var(--transition);
  }

  .sobre-stat:hover {
    border-color: var(--border-hover);
    transform: translateY(-2px);
  }

  .sobre-stat-value {
    display: block;
    font-size: 18px;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .sobre-stat-label {
    font-size: 12px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .sobre-image {
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
  }

  .sobre-image::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), transparent);
    z-index: 1;
    pointer-events: none;
  }

  .sobre-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ===== SHOWS TIMELINE ===== */
  .shows-timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
  }

  .show-item {
    position: relative;
    padding-left: 40px;
    padding-bottom: 32px;
    animation: fadeInUp 0.5s ease forwards;
    opacity: 0;
  }

  .show-timeline-line {
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--primary), transparent);
  }

  .show-item:last-child .show-timeline-line {
    display: none;
  }

  .show-timeline-dot {
    position: absolute;
    left: 8px;
    top: 24px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--primary);
    border: 4px solid var(--bg-dark);
    box-shadow: 0 0 0 2px var(--primary);
  }

  .show-card-premium {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 24px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: var(--transition);
  }

  .show-card-premium:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-hover);
    transform: translateX(8px);
  }

  .show-date-premium {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    height: 72px;
    background: linear-gradient(135deg, var(--primary), #a78bfa);
    border-radius: var(--radius-sm);
    color: white;
    flex-shrink: 0;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
  }

  .show-day {
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
  }

  .show-month {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 2px;
  }

  .show-year {
    font-size: 10px;
    opacity: 0.8;
    margin-top: 2px;
  }

  .show-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .show-image {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    flex-shrink: 0;
  }

  .show-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .show-details h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 8px;
    color: var(--text-primary);
  }

  .show-location,
  .show-time {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
    font-size: 14px;
    margin-bottom: 4px;
  }

  .btn-ingressos {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: var(--primary);
    border: 1.5px solid var(--primary);
    padding: 12px 24px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: var(--transition);
    flex-shrink: 0;
  }

  .btn-ingressos:hover {
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
  }

  .btn-ingressos.disabled {
    border-color: var(--text-muted);
    color: var(--text-muted);
    cursor: not-allowed;
  }

  .btn-ingressos.disabled:hover {
    background: transparent;
    transform: none;
    box-shadow: none;
  }

  /* ===== RELACIONADOS ===== */
  .relacionados-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 24px;
  }

  .relacionado-card {
    text-align: center;
    cursor: pointer;
    transition: var(--transition);
  }

  .relacionado-card:hover {
    transform: translateY(-4px);
  }

  .relacionado-image {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 12px;
    border: 3px solid var(--border);
    transition: var(--transition);
  }

  .relacionado-card:hover .relacionado-image {
    border-color: var(--primary);
    box-shadow: var(--shadow-glow);
  }

  .relacionado-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .relacionado-play {
    position: absolute;
    inset: 0;
    background: rgba(139, 92, 246, 0.8);
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: var(--transition);
  }

  .relacionado-image:hover .relacionado-play {
    opacity: 1;
  }

  .relacionado-card h4 {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 4px;
    color: var(--text-primary);
  }

  .relacionado-card p {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }

  /* ===== ERROR PREMIUM ===== */
  .erro-premium {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    background: var(--bg-dark);
    text-align: center;
    padding: 32px;
  }

  .erro-animation {
    position: relative;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .erro-disc {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), #1e1b4b);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    animation: disc-spin 4s linear infinite;
    box-shadow: var(--shadow-glow);
  }

  @keyframes disc-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .erro-premium h2 {
    font-size: 32px;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0;
  }

  .erro-premium p {
    color: var(--text-muted);
    font-size: 16px;
    margin: 0;
    max-width: 400px;
  }

  .btn-voltar {
    margin-top: 16px;
    padding: 14px 32px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 100px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
  }

  .btn-voltar:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-glow);
  }

  /* ===== TOAST NOTIFICATION ===== */
  .toast-notification {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(20px);
  }

  .toast-notification.success {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .toast-notification.error {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 968px) {
    .sobre-grid {
      grid-template-columns: 1fr;
    }
 
    .sobre-image {
      order: -1;
      max-height: 300px;
    }
  }

  @media (max-width: 768px) {
    .hero {
      min-height: auto;
      padding: 40px 0 60px;
    }
 
    .hero-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 0 20px;
      gap: 32px;
    }
 
    .artist-photo-wrapper {
      width: 180px;
      height: 180px;
    }
 
    .artist-name {
      font-size: 40px;
    }
 
    .info-header {
      justify-content: center;
    }
 
    .stats-row {
      justify-content: center;
    }
 
    .hero-actions {
      justify-content: center;
      flex-wrap: wrap;
    }
 
    .audio-visualizer {
      justify-content: center;
    }
 
    .tabs-container {
      padding: 0 16px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
 
    .tabs-container::-webkit-scrollbar {
      display: none;
    }
 
    .tab-btn {
      padding: 16px 16px;
      font-size: 14px;
    }
 
    .section {
      padding: 32px 20px;
    }
 
    .musica-row {
      padding: 10px 12px;
    }
 
    .track-stats,
    .track-duration {
      display: none;
    }
 
    .albuns-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
 
    .show-card-premium {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
 
    .btn-ingressos {
      width: 100%;
      justify-content: center;
    }
 
    .sobre-stats {
      grid-template-columns: 1fr;
    }
 
    .relacionados-grid {
      grid-template-columns: repeat(2, 1fr);
    }
 
    .toast-notification {
      left: 20px;
      right: 20px;
      transform: none;
      border-radius: var(--radius-sm);
    }
  }

  @media (max-width: 480px) {
    .artist-name {
      font-size: 32px;
    }
 
    .albuns-grid {
      grid-template-columns: 1fr;
    }
 
    .relacionados-grid {
      grid-template-columns: repeat(2, 1fr);
    }
 
    .hero-actions {
      gap: 12px;
    }
 
    .btn-play,
    .btn-follow {
      padding: 12px 24px;
      font-size: 14px;
    }
  }

  /* ===== UTILITIES ===== */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  </style>