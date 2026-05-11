<template>
  <div class="search-page">
    <div class="search-container">
     
      <!-- Header com Logo -->
      <header class="search-header">
        <div class="header-brand">
          <i class="fa fa-music brand-icon"></i>
          <span class="brand-text">SoundUp</span>
        </div>
      </header>

      <!-- Barra de Busca Principal -->
      <div class="search-main">
        <div class="search-box" :class="{ focused: isFocused }">
          <i class="fa fa-search search-icon"></i>
          <input
            ref="searchInput"
            type="text"
            v-model="searchQuery"
            placeholder="O que você quer ouvir?"
            @focus="isFocused = true; showSuggestions = true"
            @blur="handleBlur"
            @keyup.enter="performSearch"
            @input="handleInput"
          />
          <button v-if="searchQuery" class="clear-btn-icon" @click="clearSearch">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <!-- Sugestões / Histórico Dropdown -->
        <div v-if="showSuggestions" class="suggestions-box">
         
          <!-- HISTÓRICO: quando input vazio e tem histórico -->
          <div v-if="searchQuery.length === 0 && searchHistory.length > 0" class="history-section">
            <div class="history-header-row">
              <span class="history-title">
                <i class="fa fa-history"></i>
                Buscas Recentes
              </span>
              <button @click="clearHistory" class="clear-all-link">
                Limpar tudo
              </button>
            </div>
            <div class="history-list-items">
              <div
                v-for="(item, index) in searchHistory.slice(0, 10)"
                :key="index"
                class="history-list-item"
              >
                <div class="history-item-content" @click="selectFromHistory(item)">
                  <i class="fa fa-search history-icon"></i>
                  <span class="history-text">{{ item }}</span>
                </div>
                <button
                  class="history-delete-btn"
                  @click.stop="removeHistoryItem(item)"
                  title="Remover do histórico"
                >
                  <i class="fa fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- RECOMENDADO: quando vazio e sem histórico -->
          <div v-else-if="searchQuery.length === 0 && searchHistory.length === 0" class="suggested-section">
            <div class="suggested-header">
              <i class="fa fa-star"></i>
              <span>Recomendado para você</span>
            </div>
            <div class="suggested-grid">
              <div
                v-for="(item, index) in recommendedItems"
                :key="index"
                class="suggested-card"
                @click="selectSuggestion(item.name)"
              >
                <img :src="item.image" :alt="item.name">
                <div class="suggested-info">
                  <span class="suggested-name">{{ item.name }}</span>
                  <span class="suggested-type">{{ item.type }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RESULTADOS AGRUPADOS: quando tem texto -->
          <div v-else-if="groupedSuggestions.length > 0" class="grouped-results">
            <div
              v-for="group in groupedSuggestions"
              :key="group.type"
              class="result-group"
            >
              <div class="group-label">{{ group.type }}</div>
              <div class="group-items">
                <div
                  v-for="(item, idx) in group.items"
                  :key="idx"
                  class="group-item"
                  @click="selectSuggestion(item.name, item)"
                >
                  <img v-if="item.image" :src="item.image" class="item-thumb" @error="$event.target.style.display='none'">
                  <div v-else class="item-thumb-placeholder" :class="group.typeClass">
                    <i :class="getIconForType(group.type)"></i>
                  </div>
                  <div class="item-details">
                    <div class="item-name-row">
                      <span class="item-name" v-html="highlightText(item.name)"></span>
                      <span class="source-badge" :class="item.source" :title="'Fonte: ' + item.source">
                        <i :class="getSourceIcon(item.source)"></i>
                      </span>
                    </div>
                    <span v-if="item.subtitle" class="item-sub">{{ item.subtitle }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Conteúdo Principal -->
      <main class="search-content">
       
        <!-- Loading -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>Buscando...</span>
        </div>

        <!-- Estado Inicial - Descoberta -->
        <div v-if="!hasSearched && !isLoading" class="discover-section">
         
          <!-- Categorias Rápidas com Botão Detalhado -->
          <div class="quick-tags">
            <div class="tags-header">
              <h3 class="section-label">Explorar</h3>
             
              <!-- Botão Categorias Detalhadas -->
              <div class="categories-dropdown-wrapper" ref="categoriesContainer">
                <button
                  class="categories-btn"
                  @click="showCategoriesDropdown = !showCategoriesDropdown"
                  :class="{ active: showCategoriesDropdown }"
                >
                  <i class="fa fa-th-large"></i>
                  <span>Categorias</span>
                  <i class="fa fa-chevron-down" :class="{ rotate: showCategoriesDropdown }"></i>
                </button>
               
                <!-- Dropdown de Categorias Detalhadas -->
                <transition name="dropdown">
                  <div v-if="showCategoriesDropdown" class="categories-dropdown">
                    <div class="categories-dropdown-header">
                      <i class="fa fa-th-large"></i>
                      <span>Todas as Categorias</span>
                      <button class="close-dropdown" @click="showCategoriesDropdown = false">
                        <i class="fa fa-times"></i>
                      </button>
                    </div>
                   
                    <div class="categories-tabs">
                      <button
                        v-for="tab in categoryTabs"
                        :key="tab.id"
                        :class="{ active: activeCategoryTab === tab.id }"
                        @click="activeCategoryTab = tab.id"
                      >
                        <i :class="tab.icon"></i>
                        {{ tab.name }}
                      </button>
                    </div>
                   
                    <div class="categories-content">
                      <!-- Tab: Gêneros -->
                     <div v-if="activeCategoryTab === 'genres'" class="category-tab-content">
  <div
    v-for="section in genreCategorySections"
    :key="section.key"
    class="category-section"
  >
    <h4>{{ section.title }}</h4>

    <div class="category-tags detailed">
      <button
        v-for="genre in section.items"
        :key="genre.id"
        class="tag-btn detailed"
        @click="searchAndGo(genre.nome); showCategoriesDropdown = false"
      >
        <i :class="section.icon"></i>
        <span>{{ genre.nome }}</span>

        <small v-if="genre.source === 'local'">
          🎵 {{ genre.musicasCount || 0 }} •
          💿 {{ genre.albunsCount || 0 }} •
          🎤 {{ genre.cantoresCount || 0 }}
        </small>

        <small v-else>
          API
        </small>
      </button>
    </div>
  </div>
</div>
                     
                      <!-- Tab: Moods -->
                      <div v-if="activeCategoryTab === 'moods'" class="category-tab-content">
                        <div class="mood-grid detailed">
                          <div
                            v-for="vibe in vibes"
                            :key="vibe._id"
                            class="mood-card-detailed"
                            :style="{ background: vibe.gradient }"
                            @click="searchVibe(vibe)"
                          >
                            <span style="font-size: 24px">{{ vibe.emoji }}</span>
                            <div class="mood-info">
                              <span class="mood-name">{{ vibe.nome }}</span>
                              <span class="mood-desc">{{ vibe.descricao }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                                 
                      <!-- Tab: Décadas -->
                      <div v-if="activeCategoryTab === 'decades'" class="category-tab-content">
                        <div class="decade-timeline">
                          <div
                            v-for="decade in detailedCategories.decades"
                            :key="decade.name"
                            class="decade-item"
                            @click="searchByDecade(decade.name); showCategoriesDropdown = false"
                          >
                            <div
                              class="decade-bar"
                              :style="{ width: decade.popularity + '%', background: getDecadeColor(decade.name) }"
                            ></div>
                            <div class="decade-info">
                              <span
                                class="decade-name"
                                :style="{ color: getDecadeColor(decade.name) }"
                              >
                                {{ decade.name }}
                              </span>
                              <span class="decade-desc">{{ decade.description }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
           
<div class="tags-row">
  <button
    v-for="cat in exploreGenres"
    :key="cat"
    class="tag-btn"
    @click="searchAndGo(cat)"
  >
    {{ cat }}
  </button>
</div>

          </div>

          <!-- Top Músicas - Layout em Linha tipo Spotify -->
          <div class="top-section" v-if="chartTracks.length > 0">
            <div class="top-header">
              <h3>{{ topSectionTitle }}</h3>
              <button @click="searchAndGo(currentTopCategory)" class="view-all">
                Ver todas
              </button>
            </div>
            <div class="top-tracks">
              <div
                v-for="(track, index) in chartTracks.slice(0, 5)"
                :key="track.id"
                class="track-card"
                @click="playTrack(track)"
              >
                <span class="track-number">{{ index + 1 }}</span>
                <img :src="track.album.cover_medium" :alt="track.title" @error="$event.target.style.display='none'">
                <div class="track-info">
                  <span class="track-name">{{ track.title }}</span>
                  <span class="track-artist">{{ track.artist.name }}</span>
                </div>
               
                <!-- Botão de curtir no Top Músicas -->
                <button
                  class="btn-like-track"
                  @click.stop="toggleLikeTrack(track)"
                  :class="{ liked: isTrackLiked(track.id) }"
                  :title="isTrackLiked(track.id) ? 'Remover dos curtidos' : 'Adicionar aos curtidos'"
                >
                  <i :class="isTrackLiked(track.id) ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
                </button>
               
                <button class="track-play">
                  <i class="fa fa-play"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Artistas Populares - Grid de Cards -->
          <div class="top-section" v-if="popularArtistsReal.length > 0">
            <div class="top-header">
              <h3>Artistas Populares</h3>
              <button @click="searchAndGo('Artistas')" class="view-all">Ver todos</button>
            </div>
            <div class="artists-row">
              <div
                v-for="artist in popularArtistsReal.slice(0, 6)"
                :key="artist.id"
                class="artist-item"
                @click="searchArtist(artist.name, artist.id)"
              >
                <img :src="artist.picture_medium" :alt="artist.name" @error="$event.target.style.display='none'">
                <span class="artist-name">{{ artist.name }}</span>
                <span class="artist-fans">{{ formatFans(artist.nb_fan) }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Resultados da Busca - Layout Spotify Style -->
        <div v-else-if="hasSearched && !isLoading" class="search-results">
          <div class="results-header">
            <h2>Resultados para "{{ lastSearch }}"</h2>
            <div class="filter-tabs">
              <button
                v-for="filter in searchFilters"
                :key="filter"
                :class="{ active: activeFilter === filter }"
                @click="activeFilter = filter"
              >
                {{ filter }}
              </button>
            </div>
          </div>

          <div v-if="filteredResults.length === 0" class="no-results">
            <i class="fa fa-search"></i>
            <p>Nenhum resultado encontrado</p>
          </div>

          <!-- MÚSICAS - Layout em lista tipo Spotify -->
          <div v-if="getFilteredByType('track').length > 0" class="results-section">
            <div class="section-header-row">
              <h3 class="section-title">Músicas</h3>
            </div>
            <div class="tracks-list">
              <div
                v-for="(track, index) in getFilteredByType('track')"
                :key="track.id"
                class="track-list-item"
                @click="playTrack(track)"
              >
                <span class="track-list-number">{{ index + 1 }}</span>
                <div class="track-list-thumb">
                  <img :src="getBestImage(track)" :alt="getResultTitle(track)" @error="$event.target.style.display='none'">
                  <div class="track-list-play-overlay">
                    <i class="fa fa-play"></i>
                  </div>
                </div>
                <div class="track-list-info">
                  <span class="track-list-name">{{ getResultTitle(track) }}</span>
                  <span class="track-list-artist">{{ getResultSubtitle(track) }}</span>
                </div>
                <div class="track-list-source">
                  <span class="source-badge" :class="track.source">
                    <i :class="getSourceIcon(track.source)"></i>
                  </span>
                </div>
                <button
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

          <!-- ARTISTAS - Grid de Cards Circulares -->
          <div v-if="getFilteredByType('artist').length > 0" class="results-section">
            <div class="section-header-row">
              <h3 class="section-title">Artistas</h3>
            </div>
            <div class="artists-grid">
              <div
                v-for="artist in getFilteredByType('artist')"
                :key="artist.id"
                class="artist-card"
                @click="handleResultClick(artist)"
              >
                <div class="artist-card-img">
                  <img :src="getBestImage(artist)" :alt="getResultTitle(artist)" @error="$event.target.src='/default-avatar.png'">
                </div>
                <span class="artist-card-name">{{ getResultTitle(artist) }}</span>
                <span class="artist-card-type">Artista</span>
                <button
                  class="btn-like-artist"
                  @click.stop="toggleFavoriteItem(artist)"
                  :class="{ liked: isArtistFavorited(artist.id) }"
                >
                  <i :class="isArtistFavorited(artist.id) ? 'fa fa-star' : 'fa fa-star-o'"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- ÁLBUNS - Grid de Cards Quadrados -->
          <div v-if="getFilteredByType('album').length > 0" class="results-section">
            <div class="section-header-row">
              <h3 class="section-title">Álbuns</h3>
            </div>
            <div class="albums-grid">
              <div
                v-for="album in getFilteredByType('album')"
                :key="album.id"
                class="album-card"
                @click="handleResultClick(album)"
              >
                <div class="album-card-img">
                  <img :src="getBestImage(album)" :alt="getResultTitle(album)" @error="$event.target.src='/default-cover.png'">
                  <div class="album-card-overlay">
                    <i class="fa fa-play"></i>
                  </div>
                  <span class="source-badge-card" :class="album.source">
                    <i :class="getSourceIcon(album.source)"></i>
                  </span>
                </div>
                <span class="album-card-name">{{ getResultTitle(album) }}</span>
                <span class="album-card-artist">{{ getResultSubtitle(album) }}</span>
                <button
                  class="btn-like-album"
                  @click.stop="toggleFavoriteItem(album)"
                  :class="{ liked: isAlbumFavorited(album.id) }"
                >
                  <i :class="isAlbumFavorited(album.id) ? 'fa fa-star' : 'fa fa-star-o'"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- USUÁRIOS - Grid de Cards -->
          <div v-if="getFilteredByType('user').length > 0" class="results-section">
            <div class="section-header-row">
              <h3 class="section-title">Usuários</h3>
            </div>
            <div class="users-grid">
              <div
                v-for="user in getFilteredByType('user')"
                :key="user.id"
                class="user-card"
                @click="goToUserProfile(user)"
              >
                <div class="user-card-img">
                  <img :src="user.picture || user.avatar || '/default-avatar.png'" :alt="user.name">
                </div>
                <span class="user-card-name">{{ user.name || user.username }}</span>
                <span class="user-card-type">Perfil</span>
                <span v-if="user.perfilPrivado" class="user-privacy">🔒 Privado</span>
              </div>
            </div>
          </div>

          <!-- GÊNEROS - Grid de Pills -->
          <div v-if="getFilteredByType('genre').length > 0" class="results-section">
            <div class="section-header-row">
              <h3 class="section-title">Gêneros</h3>
            </div>
            <div class="genres-grid">
              <div
                v-for="genre in getFilteredByType('genre')"
                :key="genre.id"
                class="genre-card"
                @click="searchAndGo(genre.name)"
              >
                <span class="genre-card-name">{{ genre.name }}</span>
                <span class="genre-card-desc">{{ genre.description || 'Gênero musical' }}</span>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>

    <!-- TOAST DE NOTIFICAÇÃO -->
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
  name: 'Search',

  data() {
    return {
      SPOTIFY_API: 'http://localhost:3002/spotify',
      DEEZER_API: 'https://api.deezer.com',

      // Search State
      searchQuery: '',
      lastSearch: '',
      isFocused: false,
      hasSearched: false,
      showSuggestions: false,
      showHistory: false,
      showCategoriesDropdown: false,
      activeFilter: 'Todos',
      isLoading: false,
      
      activeCategoryTab: 'genres',

      currentTopCategory: 'Brasil',

      // importante
      searchTimeout: null,
      quickCategories: [],

      // Curtidas
      likedTracks: [],
      favoriteAlbums: [],
      favoriteArtists: [],
      vibes: [],
      generosDB: [],
      apiGenres: [],

      // Data
      searchHistory: [],
      searchResults: [],
      chartTracks: [],
      popularArtistsReal: [],

      categoryTabs: [
        { id: 'genres', name: 'Gêneros', icon: 'fa fa-music' },
        { id: 'moods', name: 'Atividades', icon: 'fa fa-smile-o' },
        { id: 'decades', name: 'Décadas', icon: 'fa fa-calendar' }
      ],
      decadeColors: {
        '2020s': '#1db954',
        '2010s': '#00c2ff',
        '2000s': '#7c4dff',
        '90s': '#ff2d95',
        '80s': '#ff6b00',
        '70s': '#f4c542',
        '60s': '#8bc34a',
        '50s': '#a1887f',
        '40s': '#78909c',
        '30s': '#b0bec5',
        '20s': '#d4af37'
      },

      detailedCategories: {
        genres: {
          popular: [
            { name: 'Pop', icon: 'fa fa-star', color: '#E91E63', count: '2.4M' },
            { name: 'Rock', icon: 'fa fa-bolt', color: '#F44336', count: '1.8M' },
            { name: 'Hip Hop', icon: 'fa fa-microphone', color: '#FF9800', count: '3.2M' },
            { name: 'Eletrônica', icon: 'fa fa-headphones', color: '#00BCD4', count: '2.1M' },
            { name: 'R&B', icon: 'fa fa-heart', color: '#9C27B0', count: '890K' },
            { name: 'Indie', icon: 'fa fa-tree', color: '#4CAF50', count: '1.2M' }
          ],
          regional: [
            { name: 'Sertanejo', icon: 'fa fa-guitar', color: '#8D6E63' },
            { name: 'Funk', icon: 'fa fa-fire', color: '#FF5722' },
            { name: 'MPB', icon: 'fa fa-music', color: '#9C27B0' },
            { name: 'Gospel', icon: 'fa fa-book', color: '#1976D2' },
            { name: 'Forró', icon: 'fa fa-accordion', color: '#795548' },
            { name: 'Pagode', icon: 'fa fa-users', color: '#FF9800' },
            { name: 'Samba', icon: 'fa fa-drum', color: '#F44336' },
            { name: 'Bossa Nova', icon: 'fa fa-coffee', color: '#4CAF50' }
          ],
          electronic: [
            { name: 'House', icon: 'fa fa-home', color: '#00BCD4' },
            { name: 'Techno', icon: 'fa fa-cog', color: '#3F51B5' },
            { name: 'Trance', icon: 'fa fa-moon-o', color: '#9C27B0' },
            { name: 'Dubstep', icon: 'fa fa-bomb', color: '#FF5722' },
            { name: 'Drum & Bass', icon: 'fa fa-tachometer', color: '#E91E63' },
            { name: 'Ambient', icon: 'fa fa-cloud', color: '#607D8B' }
          ]
        },

        moods: [
          { name: 'Treino', icon: 'fa fa-heartbeat', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)', description: 'Energia máxima para se exercitar' },
          { name: 'Foco', icon: 'fa fa-brain', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', description: 'Concentração e produtividade' }
        ],

        activities: [],

        decades: [
          { name: '2020s', description: 'Os hits atuais', color: '#1db954', popularity: 95 },
          { name: '2010s', description: 'Streaming e pop global', color: '#00c2ff', popularity: 88 },
          { name: '2000s', description: 'Anos 2000', color: '#7c4dff', popularity: 82 },
          { name: '90s', description: 'Clássicos dos 90', color: '#ff2d95', popularity: 78 },
          { name: '80s', description: 'Ouro dos 80', color: '#ff6b00', popularity: 75 },
          { name: '70s', description: 'Disco e rock', color: '#f4c542', popularity: 70 },
          { name: '60s', description: 'Era clássica', color: '#8bc34a', popularity: 65 },
          { name: '50s', description: 'Nascimento do rock e jazz moderno', color: '#a1887f', popularity: 60 },
          { name: '40s', description: 'Swing, jazz e clássicos antigos', color: '#78909c', popularity: 55 },
          { name: '30s', description: 'Era do rádio e big bands', color: '#b0bec5', popularity: 50 },
          { name: '20s', description: 'Jazz raiz e música vintage', color: '#d4af37', popularity: 45 }
        ]
      },

   searchFilters: ['Todos', 'Músicas', 'Artistas', 'Álbuns', 'Usuários', 'Gêneros', 'Décadas'],

      trending: [
        'Funk 150 BPM', 'Sertanejo Raiz', 'Pop Internacional',
        'Trap Brasileiro', 'Rock Clássico', 'MPB Nova'
      ],

      trendGradients: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
      ],

      genres: [
        { name: 'Pop', color: '#E91E63' },
        { name: 'Rock', color: '#F44336' },
        { name: 'Hip Hop', color: '#FF9800' },
        { name: 'Eletrônica', color: '#00BCD4' },
        { name: 'Sertanejo', color: '#8D6E63' },
        { name: 'Funk', color: '#FF5722' }
      ],

      moods: [
        { name: 'Treino', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)' },
        { name: 'Foco', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
      ],

      recommendedItems: [
        { name: 'The Weeknd', type: 'Artista', image: 'https://i.ytimg.com/vi/34Na4j8AVgA/maxresdefault.jpg' },
        { name: 'Blinding Lights', type: 'Música', image: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/maxresdefault.jpg' },
        { name: 'After Hours', type: 'Álbum', image: 'https://i.ytimg.com/vi/yzTuBuRdAyA/maxresdefault.jpg' },
        { name: 'Taylor Swift', type: 'Artista', image: 'https://i.ytimg.com/vi/b1kbLwvquGKU/maxresdefault.jpg' }
      ],

      toast: {
        show: false,
        message: "",
        type: "success",
        icon: "fa fa-check-circle"
      }
    }
  },

  computed: {
    allGenres() {
  const local = (this.generosDB || []).map(g => this.normalizeLocalGenre(g))
  const api = (this.apiGenres || []).map(g => this.normalizeApiGenre(g))

  const map = new Map()

  ;[...local, ...api].forEach(genre => {
    const key = (genre.nome || '').trim().toLowerCase()
    if (!key) return

    if (!map.has(key)) {
      map.set(key, genre)
      return
    }

    const current = map.get(key)

    map.set(key, {
      ...current,
      ...genre,
      id: current.id,
      nome: current.nome || genre.nome,
      foto: current.foto || genre.foto || '',
      descricao: current.descricao || genre.descricao,
      categoria: current.categoria || genre.categoria || 'outros',
      source: current.source === 'local' ? 'local' : genre.source,
      musicasCount: current.musicasCount || genre.musicasCount || 0,
      albunsCount: current.albunsCount || genre.albunsCount || 0,
      cantoresCount: current.cantoresCount || genre.cantoresCount || 0
    })
  })

  return Array.from(map.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR')
  )
},

exploreGenres() {
  return this.allGenres.slice(0, 12).map(g => g.nome)
},

    topSectionTitle() {
      return this.currentTopCategory && this.currentTopCategory !== 'Brasil'
        ? `Top músicas de ${this.currentTopCategory}`
        : 'Top Músicas Brasil'
    },

    filteredResults() {
      if (this.activeFilter === 'Décadas') {
        const range = this.getDecadeRange(this.lastSearch)
        if (!range) return []

        return this.searchResults.filter(r => {
          if (!['track', 'album', 'artist'].includes(r.type)) return false
          if (!r.ano) return false

          const itemYear = parseInt(r.ano)
          return itemYear >= range.start && itemYear <= range.end
        })
      }

      if (this.activeFilter === 'Todos') return this.searchResults

const typeMap = {
  'Músicas': 'track',
  'Artistas': 'artist',
  'Álbuns': 'album',
  'Usuários': 'user',
  'Gêneros': 'genre'
}


      const filterType = typeMap[this.activeFilter]
      return this.searchResults.filter(r => r.type === filterType)
    },

generosPorCategoria() {
  const grupos = {
    popular: [],
    regional: [],
    electronic: [],
    classical: [],
    jazz: [],
    rock: [],
    pop: [],
    hiphop: [],
    outros: []
  }

  this.allGenres.forEach(g => {
    const cat = (g.categoria || this.detectGenreCategory(g.nome) || 'outros')
      .toLowerCase()
      .trim()

    if (grupos[cat]) grupos[cat].push(g)
    else grupos.outros.push(g)
  })

  return grupos
},
genreCategorySections() {
  const sections = [
    { key: 'popular', title: 'Populares', icon: 'fa fa-music' },
    { key: 'regional', title: 'Estilos Regionais', icon: 'fa fa-map' },
    { key: 'electronic', title: 'Eletrônica & Dance', icon: 'fa fa-headphones' },
    { key: 'rock', title: 'Rock & Alternativo', icon: 'fa fa-bolt' },
    { key: 'pop', title: 'Pop', icon: 'fa fa-star' },
    { key: 'hiphop', title: 'Hip Hop, Rap & R&B', icon: 'fa fa-microphone' },
    { key: 'jazz', title: 'Jazz, Soul & Blues', icon: 'fa fa-moon-o' },
    { key: 'classical', title: 'Clássica & Instrumental', icon: 'fa fa-university' },
    { key: 'outros', title: 'Outros Gêneros', icon: 'fa fa-th-large' }
  ]

  return sections
    .map(section => ({
      ...section,
      items: this.generosPorCategoria[section.key] || []
    }))
    .filter(section => section.items.length > 0)
},

    groupedSuggestions() {
      if (!this.searchQuery.trim()) return []

      const query = this.searchQuery.toLowerCase()
      const groups = {}

      const matches = this.searchResults.filter(item => {
        const title = (this.getResultTitle(item) || '').toLowerCase()
        const subtitle = (this.getResultSubtitle(item) || '').toLowerCase()
        return title.includes(query) || subtitle.includes(query)
      })

      matches.forEach(item => {
        const type = this.getResultType(item)

        if (!groups[type]) {
          groups[type] = {
            type,
            typeClass: type
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\\u0300-\\u036f]/g, '')
              .replace(/\\s+/g, '-'),
            items: []
          }
        }

        groups[type].items.push({
          id: item.id,
          type: item.type,
          source: item.source,
          name: this.getResultTitle(item),
          image: this.getBestImage(item),
          subtitle: this.getResultSubtitle(item),
          perfilPrivado: item.perfilPrivado,
          mostrarAtividade: item.mostrarAtividade
        })
      })

      const typeOrder = ['Artista', 'Música', 'Álbum', 'Usuário', 'Gênero']

      return Object.values(groups)
        .sort((a, b) => {
          const indexA = typeOrder.indexOf(a.type)
          const indexB = typeOrder.indexOf(b.type)
          if (indexA === -1) return 1
          if (indexB === -1) return -1
          return indexA - indexB
        })
        .map(group => ({
          ...group,
          items: group.items.slice(0, 4)
        }))
    }
  },

mounted() {
  document.addEventListener('click', this.handleClickOutside)

  // Verifica se veio de um gênero do Dashboard (query param 'q')
  const urlQuery = this.$route?.query?.q
  const urlType = this.$route?.query?.type

  if (urlQuery) {
    // Se veio do Dashboard via gênero
    this.searchQuery = urlQuery
    this.currentTopCategory = urlQuery
    
    if (urlType === 'genre') {
      // Busca específica por gênero
      this.searchAndGo(urlQuery)
    } else {
      // Busca normal
      this.loadTopTracksByCategory(urlQuery)
      this.performSearch()
    }
  } else {
    // Comportamento padrão
    const initialCategory = 'Brasil'
    this.currentTopCategory = initialCategory
    this.loadInitialData(initialCategory)
  }

  this.loadLikedTracks()
  this.loadFavoritas()
  this.loadVibes()
  this.loadGeneros()
  this.loadApiGenres()
  this.loadHistory()
},

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    if (this.searchTimeout) clearTimeout(this.searchTimeout)
  },
watch: {
  '$route.query.q': {
    immediate: true,
    handler(newValue) {
      if (newValue) {
        this.searchQuery = newValue
        this.currentTopCategory = newValue
        this.searchAndGo(newValue)
      }
    }
  }
},
  methods: {
    async loadApiGenres() {
  try {
    const res = await fetch('http://localhost:3002/deezer/genre')
    const data = await res.json()

    const genres = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []

    this.apiGenres = genres.filter(g =>
      g &&
      g.id !== 0 &&
      g.name &&
      g.name.toLowerCase() !== 'all'
    )
  } catch (err) {
    console.error('Erro ao carregar gêneros da API:', err)
    this.apiGenres = []
  }
},
normalizeLocalGenre(g) {
  return {
    id: `local-${g._id}`,
    nome: g.nome,
    descricao: g.descricao || 'Gênero musical',
    foto: g.foto || '',
    categoria: g.categoria || this.detectGenreCategory(g.nome),
    source: 'local',
    musicasCount: g.musicas?.length || 0,
    albunsCount: g.albuns?.length || 0,
    cantoresCount: g.cantores?.length || 0
  }
},

normalizeApiGenre(g) {
  return {
    id: `deezer-${g.id}`,
    nome: g.name,
    descricao: 'Gênero da API',
    foto: g.picture_medium || g.picture || g.picture_big || '',
    categoria: this.detectGenreCategory(g.name),
    source: 'deezer',
    musicasCount: 0,
    albunsCount: 0,
    cantoresCount: 0
  }
},

detectGenreCategory(name = '') {
  const value = String(name).toLowerCase().trim()

  if (
    ['house', 'techno', 'trance', 'edm', 'dubstep', 'drum & bass', 'electro', 'dance', 'electronic']
      .some(term => value.includes(term))
  ) return 'electronic'

  if (
    ['sertanejo', 'funk', 'mpb', 'gospel', 'forró', 'forro', 'pagode', 'samba', 'bossa', 'arrocha', 'piseiro']
      .some(term => value.includes(term))
  ) return 'regional'

  if (
    ['rock', 'metal', 'punk', 'grunge', 'alternative']
      .some(term => value.includes(term))
  ) return 'rock'

  if (
    ['hip hop', 'hip-hop', 'rap', 'trap', 'r&b']
      .some(term => value.includes(term))
  ) return 'hiphop'

  if (
    ['jazz', 'blues', 'soul']
      .some(term => value.includes(term))
  ) return 'jazz'

  if (
    ['classical', 'clássico', 'classico', 'opera', 'orquestra', 'instrumental']
      .some(term => value.includes(term))
  ) return 'classical'

  if (
    ['pop']
      .some(term => value.includes(term))
  ) return 'pop'

  if (
    ['pop', 'rock', 'hip hop', 'rap', 'funk', 'sertanejo', 'dance', 'electronic']
      .some(term => value.includes(term))
  ) return 'popular'

  return 'outros'
},

    // ===== NOVO: Filtrar por tipo para seções separadas =====
    getFilteredByType(type) {
      if (this.activeFilter === 'Todos') {
        return this.filteredResults.filter(r => r.type === type)
      }
      return this.filteredResults.filter(r => r.type === type)
    },

    getSourceIcon(source) {
      const icons = {
        spotify: 'fa fa-spotify',
        deezer: 'si si-deezer',
        local: 'fa fa-database'
      }
      return icons[source] || 'fa fa-music'
    },

    // ===== SISTEMA DE CURTIDAS =====
   
    async loadLikedTracks() {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          this.likedTracks = []
          return
        }

        const res = await fetch(`http://localhost:3002/curtidas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()
        this.likedTracks = data.map(c => String(c.id)).filter(Boolean)

      } catch (err) {
        console.error("Erro ao carregar curtidas:", err)
        this.likedTracks = []
      }
    },

    async loadVibes() {
      try {
        const res = await fetch("http://localhost:3002/vibes")
        const data = await res.json()
        this.vibes = data
      } catch (err) {
        console.error("Erro ao carregar vibes:", err)
      }
    },

    async loadHistory() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await fetch("http://localhost:3002/historico", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()
        if (Array.isArray(data)) {
          this.searchHistory = data.map(h => h.termo)
        } else {
          this.searchHistory = []
        }

      } catch (err) {
        console.error("Erro ao carregar histórico:", err)
      }
    },

    async removeHistoryItem(item) {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        await fetch(`http://localhost:3002/historico/item`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ termo: item })
        })

        this.searchHistory = this.searchHistory.filter(h => h !== item)
       
      } catch (err) {
        console.error("Erro ao remover item do histórico:", err)
        this.searchHistory = this.searchHistory.filter(h => h !== item)
      }
    },

    searchVibe(vibe) {
      const query = Array.isArray(vibe.tags) && vibe.tags.length
        ? vibe.tags.join(' ')
        : vibe.nome

      this.searchQuery = query
      this.performSearch()
    },

    async loadFavoritas() {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          this.favoriteAlbums = []
          this.favoriteArtists = []
          return
        }

        const res = await fetch(`http://localhost:3002/favoritas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()

        this.favoriteAlbums = data
          .filter(f => {
            if (f.album && f.album._id) return true
            if (f.albumExterno) return true
            return false
          })
          .map(f => {
            if (f.album && f.album._id) return String(f.album._id)
            if (f.albumExterno) return String(f.albumExterno.id)
            return null
          })
          .filter(Boolean)

        this.favoriteArtists = data
          .filter(f => {
            if (f.cantor && f.cantor._id) return true
            if (f.cantorExterno) return true
            return false
          })
          .map(f => {
            if (f.cantor && f.cantor._id) return String(f.cantor._id)
            if (f.cantorExterno) return String(f.cantorExterno.id)
            return null
          })
          .filter(Boolean)

      } catch (err) {
        console.error("Erro ao carregar favoritas:", err)
        this.favoriteAlbums = []
        this.favoriteArtists = []
      }
    },

    async loadGeneros() {
      try {
        const res = await fetch("http://localhost:3002/generos")
        const data = await res.json()

        let generosArray = data
        if (!Array.isArray(data)) {
          generosArray = Object.values(data).flat()
        }

        this.generosDB = generosArray
       
        if (this.generosDB.length > 0) {
          this.quickCategories = this.generosDB.map(g => g.nome)
        }

      } catch (err) {
        console.error("Erro ao carregar gêneros:", err)
        this.generosDB = []
      }
    },

    getDecadeFromYear(year) {
      const y = parseInt(year)
      if (isNaN(y)) return null

      if (y >= 2020 && y <= 2029) return '2020s'
      if (y >= 2010 && y <= 2019) return '2010s'
      if (y >= 2000 && y <= 2009) return '2000s'
      if (y >= 1990 && y <= 1999) return '90s'
      if (y >= 1980 && y <= 1989) return '80s'
      if (y >= 1970 && y <= 1979) return '70s'
      if (y >= 1960 && y <= 1969) return '60s'
      if (y >= 1950 && y <= 1959) return '50s'
      if (y >= 1940 && y <= 1949) return '40s'
      if (y >= 1930 && y <= 1939) return '30s'
      if (y >= 1920 && y <= 1929) return '20s'

      return null
    },

    getDecadeColor(decadeOrYear) {
      if (!decadeOrYear) return '#1db954'

      if (/^\\d{4}$/.test(String(decadeOrYear))) {
        const decade = this.getDecadeFromYear(decadeOrYear)
        return this.decadeColors[decade] || '#1db954'
      }

      return this.decadeColors[decadeOrYear] || '#1db954'
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

    isAlbumFavorited(albumId) {
      if (!albumId) return false
      return this.favoriteAlbums.some(id => String(id) === String(albumId))
    },

    isArtistFavorited(artistId) {
      if (!artistId) return false
      return this.favoriteArtists.some(id => String(id) === String(artistId))
    },

    async toggleFavoriteItem(item) {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          this.showToast("Faça login para favoritar", "info")
          return
        }

        const itemId = item.id
        const isDeezer = item.source === 'deezer'
        const isLocal = item.source === 'local'

        let tipo = ''
        if (item.type === 'album') tipo = 'album'
        else if (item.type === 'artist') tipo = 'cantor'
        else {
          this.showToast("Tipo de item não suportado", "error")
          return
        }

        const body = {
          tipo,
          source: item.source || 'local'
        }

        if (isDeezer) {
          body.source = 'deezer'
          body.dadosItem = {
            titulo: item.title || item.name || 'Sem título',
            artista: item.artist?.name || item.subtitle || 'Artista Desconhecido',
            capa: this.getBestImage(item) || '',
            previewUrl: item.preview || '',
            duration: item.duration || 0,
            ano: item.ano || null,
            album: item.album?.title || ''
          }
        } else if (isLocal) {
          body.source = 'local'
        }

        const res = await fetch(`http://localhost:3002/favoritas/${String(itemId)}/favoritar`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })

        const data = await res.json()

        if (item.type === 'album') {
          if (data.favorited) {
            if (!this.favoriteAlbums.includes(String(itemId))) {
              this.favoriteAlbums.push(String(itemId))
            }
            this.showToast(`"${this.getResultTitle(item)}" adicionado aos favoritos ⭐`, "success")
          } else {
            this.favoriteAlbums = this.favoriteAlbums.filter(id => String(id) !== String(itemId))
            this.showToast(`"${this.getResultTitle(item)}" removido dos favoritos`, "info")
          }
        }

        if (item.type === 'artist') {
          if (data.favorited) {
            if (!this.favoriteArtists.includes(String(itemId))) {
              this.favoriteArtists.push(String(itemId))
            }
            this.showToast(`"${this.getResultTitle(item)}" adicionado aos favoritos ⭐`, "success")
          } else {
            this.favoriteArtists = this.favoriteArtists.filter(id => String(id) !== String(itemId))
            this.showToast(`"${this.getResultTitle(item)}" removido dos favoritos`, "info")
          }
        }

        window.dispatchEvent(new Event('favoritas-updated'))

      } catch (err) {
        console.error("Erro ao favoritar item:", err)
        this.showToast("Erro ao favoritar item", "error")
      }
    },

    handleResultClick(result) {
      if (result.type === 'track') {
        return this.playTrack(result)
      }

      if (result.type === 'album' && result.source === 'local') {
        return this.$router.push(`/album/${result.id}`)
      }

      if (result.type === 'artist' && result.source === 'local') {
        return this.$router.push(`/cantor/${result.id}`)
      }

      if (result.type === 'user') {
        return this.goToUserProfile(result)
      }
    },

    goToUserProfile(user) {
      if (!user) return

      const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}')
      const loggedId = String(usuarioLogado.id || usuarioLogado._id || '')
      const targetId = String(user.id || user._id || '')

      if (!targetId) return

      this.showSuggestions = false
      this.showHistory = false

      if (loggedId && loggedId === targetId) {
        return this.$router.push('/perfil')
      }

      return this.$router.push({
        name: 'PerfilUsuario',
        params: { id: targetId }
      })
    },

    isTrackLiked(trackId) {
      if (!trackId) return false
      return this.likedTracks.some(id => String(id) === String(trackId))
    },
   
    async toggleLikeTrack(track) {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          this.showToast("Faça login para curtir músicas", "info")
          return
        }

        const trackId = track.id
       
        const body = {
          source: track.source || 'local'
        }

        if (track.source === 'deezer' || track.source === 'spotify') {
          body.dadosMusica = {
            titulo: track.title || 'Sem título',
            artista: track.artist?.name || 'Desconhecido',
            capa: this.getBestImage(track) || '',
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
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          }
        )

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error('Erro da API:', errorData)
          this.showToast(errorData.error || `Erro ${res.status}`, "error")
          return
        }

        const data = await res.json()

        if (data.liked) {
          if (!this.likedTracks.includes(String(trackId))) {
            this.likedTracks.push(String(trackId))
          }
          this.showToast(`"${this.getResultTitle(track)}" curtida ❤️`, "success")
        } else {
          this.likedTracks = this.likedTracks.filter(id => String(id) !== String(trackId))
          this.showToast(`"${this.getResultTitle(track)}" descurtida 💔`, "info")
        }

      } catch (err) {
        console.error("Erro ao curtir música:", err)
        this.showToast("Erro ao processar curtida", "error")
      }
    },
   
    formatDuration(seconds) {
      if (!seconds) return "3:00"
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    // API Methods
    async loadInitialData(category = 'Brasil') {
      await Promise.all([
        this.loadTopTracksByCategory(category),
        this.loadPopularArtists()
      ])
    },

    async loadTopTracksByCategory(category = 'Brasil') {
      try {
        this.currentTopCategory = category || 'Brasil'

        const res = await fetch(
          `${this.SPOTIFY_API}/search?q=${encodeURIComponent(category)}&type=track&limit=10`
        ).then(r => r.json())

        this.chartTracks = res.tracks?.items.map(t => ({
          id: t.id,
          title: t.name,
          artist: { name: t.artists.map(a => a.name).join(', ') },
          album: {
            cover_medium: t.album.images?.[0]?.url
          },
          preview: t.preview_url,
          source: 'spotify'
        })) || []

      } catch (error) {
        console.error('Erro ao carregar top da categoria:', error)
        this.chartTracks = []
      }
    },

    async loadPopularArtists() {
      try {
        const response = await fetch('http://localhost:3002/cantores')
        const data = await response.json()

        this.popularArtistsReal = data.map(cantor => ({
          id: cantor._id,
          name: cantor.nome,
          picture_medium: cantor.foto,
          nb_fan: cantor.totalSeguidores || 0,
          source: 'local'
        }))

      } catch (error) {
        console.error('Erro ao carregar artistas do banco:', error)
      }
    },
   
    async searchAll(query) {
      this.isLoading = true

      try {
        const token = localStorage.getItem("token")
        const authHeaders = token
          ? { Authorization: `Bearer ${token}` }
          : {}

        const [
          localMusicas,
          localCantores,
          localAlbuns,
          localGeneros,
          localUsuarios
        ] = await Promise.all([
          fetch(`http://localhost:3002/musicas/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
          fetch(`http://localhost:3002/cantores/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
          fetch(`http://localhost:3002/albuns/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
          fetch(`http://localhost:3002/generos/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
          fetch(`http://localhost:3002/usuarios/search?q=${encodeURIComponent(query)}`, {
            headers: authHeaders
          })
            .then(async r => r.ok ? r.json() : [])
            .catch(() => [])
        ])

        const spotifyRes = await fetch(
          `${this.SPOTIFY_API}/search?q=${encodeURIComponent(query)}&type=track,artist,album`
        ).then(r => r.json())

        const deezerRes = await fetch(
          `http://localhost:3002/deezer/search?q=${encodeURIComponent(query)}`
        ).then(r => r.json())

        const matchedApiGenres = (this.apiGenres || []).filter(g =>
  g.name?.toLowerCase().includes(query.toLowerCase())
)

        let results = []

        // USUÁRIOS LOCAIS
        if (Array.isArray(localUsuarios) && localUsuarios.length > 0) {
          results.push(...localUsuarios.map(u => ({
            id: u._id || u.id,
            name: u.nome || u.name || u.username,
            username: u.username || u.nome,
            picture: u.foto || u.avatar || u.picture,
            avatar: u.avatar || u.foto,
            bio: u.bio,
            perfilPrivado: u.perfilPrivado,
            mostrarAtividade: u.mostrarAtividade,
            type: 'user',
            source: 'local'
          })))
        }

        // MÚSICAS LOCAIS
        if (Array.isArray(localMusicas) && localMusicas.length > 0) {
          results.push(...localMusicas.map(m => ({
            id: m._id,
            title: m.nome,
            artist: {
              name: m.cantores?.map(c => c.nome).join(', ') || 'Artista desconhecido'
            },
            album: {
              title: m.albuns?.[0]?.nome || '',
              cover: m.albuns?.[0]?.foto || ''
            },
            cover: m.foto || m.albuns?.[0]?.foto || '',
            preview: m.link,
            ano: m.ano,
            decada: m.ano ? this.getDecadeFromYear(m.ano) : null,
            type: 'track',
            source: 'local'
          })))
        }

        // CANTORES LOCAIS
        if (Array.isArray(localCantores) && localCantores.length > 0) {
          results.push(...localCantores.map(c => ({
            id: c._id,
            name: c.nome,
            picture: c.foto,
            nb_fan: c.totalSeguidores || 0,
            ano: c.ano,
            decada: c.ano ? this.getDecadeFromYear(c.ano) : null,
            type: 'artist',
            source: 'local'
          })))
        }

        // ÁLBUNS LOCAIS
        if (Array.isArray(localAlbuns) && localAlbuns.length > 0) {
          results.push(...localAlbuns.map(a => ({
            id: a._id,
            title: a.nome,
            artist: {
              name: a.cantor?.nome || 'Artista desconhecido'
            },
            cover: a.foto,
            ano: a.ano,
            decada: a.ano ? this.getDecadeFromYear(a.ano) : null,
            type: 'album',
            source: 'local'
          })))
        }

        // SPOTIFY TRACKS
        if (spotifyRes.tracks?.items) {
          results.push(...spotifyRes.tracks.items.map(t => ({
            id: t.id,
            title: t.name,
            artist: { name: t.artists.map(a => a.name).join(', ') },
            album: {
              title: t.album.name,
              cover: t.album.images?.[0]?.url
            },
            cover: t.album.images?.[0]?.url,
            preview: t.preview_url,
            duration: Math.floor(t.duration_ms / 1000),
            type: 'track',
            source: 'spotify'
          })))
        }

        // DEEZER - MÚSICAS
        if (deezerRes.data) {
          results.push(...deezerRes.data.map(t => ({
            id: t.id,
            title: t.title,
            artist: { name: t.artist?.name },
            album: {
              title: t.album?.title,
              cover: t.album?.cover_medium
            },
            cover: t.album?.cover_medium,
            preview: t.preview,
            duration: t.duration,
            type: 'track',
            source: 'deezer'
          })))
        }

        // DEEZER - ARTISTAS
        if (deezerRes.data) {
          const deezerArtists = deezerRes.data
            .map(t => t.artist)
            .filter((a, i, arr) => a && arr.findIndex(x => x.id === a.id) === i)
         
          results.push(...deezerArtists.map(a => ({
            id: a.id,
            name: a.name,
            picture: a.picture_medium,
            picture_medium: a.picture_medium,
            picture_big: a.picture_big,
            nb_fan: a.nb_fan || 0,
            type: 'artist',
            source: 'deezer'
          })))
        }

        // DEEZER - ÁLBUNS
        if (deezerRes.data) {
          const deezerAlbums = deezerRes.data
            .map(t => t.album)
            .filter((a, i, arr) => a && arr.findIndex(x => x.id === a.id) === i)
         
          results.push(...deezerAlbums.map(a => ({
            id: a.id,
            title: a.title,
            artist: { name: 'Artista' },
            cover: a.cover_medium,
            cover_medium: a.cover_medium,
            cover_big: a.cover_big,
            type: 'album',
            source: 'deezer'
          })))
        }  

        // GÊNEROS
        if (Array.isArray(localGeneros)) {
          results.push(...localGeneros.map(g => ({
            id: g._id,
            name: g.nome,
            description: g.descricao || 'Gênero musical',
            type: 'genre',
            source: 'local'
          })))
        }
        if (matchedApiGenres.length > 0) {
  const existingGenreNames = new Set(
    results
      .filter(item => item.type === 'genre')
      .map(item => (item.name || '').toLowerCase())
  )

  results.push(
    ...matchedApiGenres
      .filter(g => !existingGenreNames.has(g.name.toLowerCase()))
      .map(g => ({
        id: `deezer-genre-${g.id}`,
        name: g.name,
        description: 'Gênero da API',
        picture: g.picture_medium || g.picture || g.picture_big || '',
        picture_medium: g.picture_medium || g.picture || g.picture_big || '',
        type: 'genre',
        source: 'deezer'
      }))
  )
}

        this.searchResults = results
      } catch (err) {
        console.error(err)
        this.searchResults = []
      } finally {
        this.isLoading = false
      }
    },

    searchByDecade(decadeName) {
      const range = this.getDecadeRange(decadeName)
      if (!range) return

      this.searchQuery = decadeName
      this.lastSearch = decadeName
      this.hasSearched = true
      this.showSuggestions = false
      this.showHistory = false
      this.showCategoriesDropdown = false
      this.activeFilter = 'Décadas'
      this.isLoading = true

      Promise.all([
        fetch(`http://localhost:3002/musicas`).then(r => r.json()),
        fetch(`http://localhost:3002/albuns`).then(r => r.json()),
        fetch(`http://localhost:3002/cantores`).then(r => r.json())
      ])
        .then(([musicasData, albunsData, cantoresData]) => {
          let results = []

          if (Array.isArray(musicasData)) {
            const musicasDaDecada = musicasData.filter(m => {
              if (!m.ano) return false
              const year = parseInt(m.ano)
              return year >= range.start && year <= range.end
            })

            results.push(...musicasDaDecada.map(m => ({
              id: m._id,
              title: m.nome,
              artist: {
                name: m.cantores?.map(c => c.nome).join(', ')
              },
              album: {
                title: m.albuns?.[0]?.nome || '',
                cover: m.albuns?.[0]?.foto || ''
              },
              cover: m.foto,
              preview: m.link,
              ano: m.ano,
              decada: this.getDecadeFromYear(m.ano),
              type: 'track',
              source: 'local'
            })))
          }

          if (Array.isArray(albunsData)) {
            const albunsDaDecada = albunsData.filter(a => {
              if (!a.ano) return false
              const year = parseInt(a.ano)
              return year >= range.start && year <= range.end
            })

            results.push(...albunsDaDecada.map(a => ({
              id: a._id,
              title: a.nome,
              artist: {
                name: a.cantor?.nome || ''
              },
              cover: a.foto,
              ano: a.ano,
              decada: this.getDecadeFromYear(a.ano),
              type: 'album',
              source: 'local'
            })))
          }

          if (Array.isArray(cantoresData)) {
            const cantoresDaDecada = cantoresData.filter(c => {
              if (!c.ano) return false
              const year = parseInt(c.ano)
              return year >= range.start && year <= range.end
            })

            results.push(...cantoresDaDecada.map(c => ({
              id: c._id,
              name: c.nome,
              picture: c.foto,
              nb_fan: c.totalSeguidores || 0,  
              ano: c.ano,
              decada: this.getDecadeFromYear(c.ano),
              type: 'artist',
              source: 'local'
            })))
          }

          this.searchResults = results

          if (results.length === 0) {
            this.showToast(`Nenhum resultado encontrado para ${decadeName}`, 'info')
          }
        })
        .catch(err => {
          console.error('Erro ao buscar por década:', err)
          this.searchResults = []
          this.showToast('Erro ao buscar resultados da década', 'error')
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    searchByYear(year) {
      const targetYear = parseInt(year)
      if (isNaN(targetYear)) return

      this.searchQuery = String(targetYear)
      this.lastSearch = String(targetYear)
      this.hasSearched = true
      this.showSuggestions = false
      this.showHistory = false
      this.showCategoriesDropdown = false
      this.activeFilter = 'Todos'
      this.isLoading = true

      Promise.all([
        fetch(`http://localhost:3002/musicas`).then(r => r.json()),
        fetch(`http://localhost:3002/albuns`).then(r => r.json()),
        fetch(`http://localhost:3002/cantores`).then(r => r.json())
      ])
        .then(([musicasData, albunsData, cantoresData]) => {
          let results = []
         
          if (Array.isArray(musicasData)) {
            const musicasDoAno = musicasData.filter(m => {
              if (!m.ano) return false
              return parseInt(m.ano) === targetYear
            })
           
            results.push(...musicasDoAno.map(m => ({
              id: m._id,
              title: m.nome,
              artist: {
                name: m.cantores?.map(c => c.nome).join(', ')
              },
              album: {
                title: m.albuns?.[0]?.nome || '',
                cover: m.albuns?.[0]?.foto || ''
              },
              cover: m.foto,
              preview: m.link,
              ano: m.ano,
              type: 'track',
              source: 'local'
            })))
          }
         
          if (Array.isArray(albunsData)) {
            const albunsDoAno = albunsData.filter(a => {
              if (!a.ano) return false
              return parseInt(a.ano) === targetYear
            })
           
            results.push(...albunsDoAno.map(a => ({
              id: a._id,
              title: a.nome,
              artist: {
                name: a.cantor?.nome || ''
              },
              cover: a.foto,
              ano: a.ano,
              type: 'album',
              source: 'local'
            })))
          }
         
          if (Array.isArray(cantoresData)) {
            const cantoresDoAno = cantoresData.filter(c => {
              if (!c.ano) return false
              return parseInt(c.ano) === targetYear
            })

            results.push(...cantoresDoAno.map(c => ({
              id: c._id,
              name: c.nome,
              picture: c.foto,
              nb_fan: c.totalSeguidores || 0,
              ano: c.ano,
              type: 'artist',
              source: 'local'
            })))
          }

          this.searchResults = results
         
          if (results.length === 0) {
            this.showToast(`Nenhum resultado encontrado para ${targetYear}`, 'info')
          }
        })
        .catch(err => {
          console.error('Erro ao buscar por ano:', err)
          this.searchResults = []
          this.showToast('Erro ao buscar resultados do ano', 'error')
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    async searchDeezer(query) {
      this.isLoading = true
      try {
        const [tracks, artists, albums] = await Promise.all([
          fetch(`${this.DEEZER_API}/search/track?q=${encodeURIComponent(query)}&limit=20`).then(r => r.json()),
          fetch(`${this.DEEZER_API}/search/artist?q=${encodeURIComponent(query)}&limit=10`).then(r => r.json()),
          fetch(`${this.DEEZER_API}/search/album?q=${encodeURIComponent(query)}&limit=10`).then(r => r.json())
        ])

        const results = []
        if (tracks.data) results.push(...tracks.data.map(item => ({...item, type: 'track'})))
        if (artists.data) results.push(...artists.data.map(item => ({...item, type: 'artist'})))
        if (albums.data) results.push(...albums.data.map(item => ({...item, type: 'album'})))

        this.searchResults = results
      } catch (error) {
        console.error('Erro na busca:', error)
        this.searchResults = []
      } finally {
        this.isLoading = false
      }
    },

    // Utility Methods
    getResultTitle(item) {
      if (item.type === 'track') return item.title
      if (item.type === 'artist') return item.name
      if (item.type === 'album') return item.title
      if (item.type === 'user') return item.name || item.username
      return item.name || item.title || 'Desconhecido'
    },

    getResultSubtitle(item) {
      if (item.type === 'track') {
        let subtitle = item.artist?.name || 'Artista desconhecido'
        if (item.ano) {
          const decada = item.decada || (Math.floor(item.ano / 10) * 10 + 's')
          subtitle += ` • ${item.ano} (${decada})`
        }
        return subtitle
      }

      if (item.type === 'artist') {
        let subtitle = `${this.formatFans(item.nb_fan)} fãs`
        if (item.ano) {
          const decada = item.decada || (Math.floor(item.ano / 10) * 10 + 's')
          subtitle += ` • ${item.ano} (${decada})`
        }
        return subtitle
      }

      if (item.type === 'album') {
        let subtitle = item.artist?.name || 'Artista desconhecido'
        if (item.ano) {
          const decada = item.decada || (Math.floor(item.ano / 10) * 10 + 's')
          subtitle += ` • ${item.ano} (${decada})`
        }
        return subtitle
      }

      if (item.type === 'user') {
        let subtitle = item.username ? `@${item.username}` : 'Usuário'
        if (item.bio) {
          subtitle += ` • ${item.bio.substring(0, 40)}${item.bio.length > 40 ? '...' : ''}`
        }
        if (item.perfilPrivado) {
          subtitle += ' • 🔒 Privado'
        } else {
          subtitle += ' • 🌍 Público'
        }
        if (item.mostrarAtividade === false) {
          subtitle += ' • atividade oculta'
        }
        return subtitle
      }

      if (item.type === 'genre') {
        return item.description || 'Gênero musical'
      }

      return ''
    },

    getResultType(item) {
      const typeMap = {
        'track': 'Música',
        'artist': 'Artista',
        'album': 'Álbum',
        'user': 'Usuário',
        'genre': 'Gênero'
      }
      return typeMap[item.type] || item.type
    },

    getBestImage(item) {
      if (item.source === 'deezer') {
        if (item.type === 'track') return item.album?.cover_medium || item.cover || item.album?.cover
        if (item.type === 'artist') return item.picture_medium || item.picture
        if (item.type === 'album') return item.cover_medium || item.cover
        return item.picture_medium || item.cover_medium || item.cover || ''
      }

      if (item.source === 'spotify') {
        if (item.type === 'track') return item.album?.cover || item.cover
        if (item.type === 'artist') return item.picture
        if (item.type === 'album') return item.cover
        return item.cover || item.picture || ''
      }

      if (item.source === 'local') {
        if (item.type === 'track') return item.cover || item.album?.cover || item.foto || ''
        if (item.type === 'artist') return item.picture || item.foto || ''
        if (item.type === 'album') return item.cover || item.foto || ''
        if (item.type === 'user') return item.picture || item.avatar || item.foto || '/default-avatar.png'
        if (item.type === 'genre') return item.foto || '/default-genre.png'
        return item.foto || item.cover || item.picture || ''
      }

      return item.cover || item.picture || item.foto || item.album?.cover || item.album?.cover_medium || ''
    },

    getIconForType(type) {
      const icons = {
        'Artista': 'fa fa-user',
        'Música': 'fa fa-music',
        'Álbum': 'fa fa-circle',
        'Usuário': 'fa fa-user-circle',
        'Gênero': 'fa fa-music'
      }
      return icons[type] || 'fa fa-music'
    },

    formatFans(num) {
      if (!num) return '0'
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return num.toString()
    },

    getTrendGradient(index) {
      return this.trendGradients[index % this.trendGradients.length]
    },

    // Interaction Methods
    handleClickOutside(event) {
      const categoriesEl = this.$refs.categoriesContainer
      if (categoriesEl && !categoriesEl.contains(event.target)) {
        this.showCategoriesDropdown = false
      }
    },

    handleInput() {
      this.showSuggestions = true

      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      this.searchTimeout = setTimeout(() => {
        const query = this.searchQuery.trim()
       
        if (/^\\d{4}$/.test(query)) {
          const year = parseInt(query)
          if (year >= 1900 && year <= 2100) {
            this.searchByYear(query)
            return
          }
        }
       
        if (query.length > 2) {
          this.searchAll(query)
        } else {
          this.searchResults = []
        }
      }, 300)
    },

    highlightText(text) {
      const query = this.searchQuery
      if (!query) return text
      const regex = new RegExp(`(${query})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },

    handleBlur() {
      setTimeout(() => {
        this.isFocused = false
        if (!this.$refs.searchInput?.contains(document.activeElement)) {
          this.showSuggestions = false
        }
      }, 200)
    },

    selectSuggestion(sugg, item = null) {
      if (item && item.type === 'user') {
        return this.goToUserProfile(item)
      }

      this.searchQuery = sugg
      this.performSearch()
    },

    selectFromHistory(item) {
      this.searchQuery = item
      this.performSearch()
      this.showHistory = false
    },

    async performSearch() {
      const query = this.searchQuery.trim()
      if (!query) return
     
      if (/^\\d{4}$/.test(query)) {
        const year = parseInt(query)
        if (year >= 1900 && year <= 2100) {
          this.searchByYear(query)
          await this.saveHistory(query)
          await this.loadHistory()
          return
        }
      }
     
      this.lastSearch = query
      this.hasSearched = true
      this.showSuggestions = false
      this.showHistory = false
      this.showCategoriesDropdown = false
     
      await this.saveHistory(query)
      await this.loadHistory()
     
      await this.searchAll(query)
    },
   
    async saveHistory(termo) {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        await fetch("http://localhost:3002/historico", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ termo })
        })
      } catch (err) {
        console.error("Erro ao salvar histórico:", err)
      }
    },

    searchAndGo(term) {
      this.currentTopCategory = term || 'Brasil'
      this.searchQuery = term
      this.loadTopTracksByCategory(this.currentTopCategory)
      this.performSearch()
    },

    searchArtist(artistName, artistId) {
      if (artistId) {
        this.$router.push(`/cantor/${artistId}`)
      } else {
        this.searchQuery = artistName
        this.performSearch()
      }
    },

    clearSearch() {
      this.searchQuery = ''
      this.hasSearched = false
      this.searchResults = []
      this.$refs.searchInput.focus()
    },

    async clearHistory() {
      try {
        const token = localStorage.getItem("token")

        await fetch("http://localhost:3002/historico", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.searchHistory = []
        this.showHistory = false
      } catch (err) {
        console.error("Erro ao limpar histórico:", err)
      }
    },

    playTrack(track) {
      const playerSong = this.convertToPlayerFormat(track)
     
      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: [playerSong],
          index: 0,
          context: 'search'
        }
      }))
    },

    convertToPlayerFormat(track) {
      return {
        id: track.id,
        title: this.getResultTitle(track),
        artist: track.artist?.name || 'Artista desconhecido',
        cover: this.getBestImage(track),
        url: track.preview || track.link,
        duration: track.duration || 30,
        type: track.type || 'search'
      }
    },
   
    // ===== TOAST =====
    showToast(message, type = "success") {
      const icons = {
        success: "fa fa-check-circle",
        error: "fa fa-exclamation-circle",
        info: "fa fa-info-circle"
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

html, body, #app {
  height: 100%;
  margin: 0;
}

.search-page {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  color: #fff;
  font-family: 'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
  padding: 24px 0 120px 0;
  display: flex;
  justify-content: center;
}

.search-container {
  width: 100%;
  max-width: 1400px;
  padding: 0 32px;
}

/* ===== HEADER ===== */
.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  font-size: 28px;
  color: #1db954;
}

.brand-text {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

/* ===== SEARCH BOX ===== */
.search-main {
  position: relative;
  margin-bottom: 40px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #181818;
  border: 2px solid transparent;
  border-radius: 500px;
  padding: 16px 24px;
  transition: all 0.2s;
}

.search-box.focused {
  background: #282828;
  border-color: #1db954;
  box-shadow: 0 0 30px rgba(29, 185, 84, 0.15);
}

.search-icon {
  font-size: 20px;
  color: #888;
  transition: color 0.2s;
}

.search-box.focused .search-icon {
  color: #1db954;
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.search-box input::placeholder {
  color: #666;
}

.clear-btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn-icon:hover {
  background: rgba(255, 68, 68, 0.8);
}

/* ===== SUGGESTIONS DROPDOWN ===== */
.suggestions-box {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #181818;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  overflow: hidden;
  z-index: 90;
  max-height: 400px;
  overflow-y: auto;
}

/* ===== HISTÓRICO NO DROPDOWN ===== */
.history-section {
  padding: 12px 0;
}

.history-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.history-title i {
  color: #1db954;
  font-size: 14px;
}

.clear-all-link {
  font-size: 12px;
  color: #b3b3b3;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.clear-all-link:hover {
  color: #ff4444;
  text-decoration: underline;
}

.history-list-items {
  display: flex;
  flex-direction: column;
}

.history-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
}

.history-list-item:last-child {
  border-bottom: none;
}

.history-list-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.history-item-content {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.history-icon {
  color: #888;
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.history-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-list-item:hover .history-text {
  color: #1db954;
}

.history-delete-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0;
  flex-shrink: 0;
  margin-left: 8px;
}

.history-list-item:hover .history-delete-btn {
  opacity: 1;
}

.history-delete-btn:hover {
  background: rgba(255, 68, 68, 0.2);
  color: #ff4444;
  transform: scale(1.1);
}

/* ===== SUGGESTED SECTION ===== */
.suggested-section {
  padding: 20px;
}

.suggested-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #1db954;
  font-size: 14px;
  font-weight: 700;
}

.suggested-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.suggested-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggested-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.suggested-card img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.suggested-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggested-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.suggested-type {
  font-size: 11px;
  color: #1db954;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ===== GROUPED RESULTS ===== */
.grouped-results {
  padding: 16px 0;
}

.result-group {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.result-group:last-child {
  border-bottom: none;
}

.group-label {
  padding: 12px 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
}

.group-items {
  padding: 0 16px 16px;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.group-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.item-thumb {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  background: #282828;
}

.item-thumb-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282828;
}

.item-thumb-placeholder.artista { background: rgba(29, 185, 84, 0.1); color: #1db954; }
.item-thumb-placeholder.musica { background: rgba(33, 150, 243, 0.1); color: #2196F3; }
.item-thumb-placeholder.album { background: rgba(156, 39, 176, 0.1); color: #9C27B0; }
.item-thumb-placeholder.usuario { background: rgba(29, 185, 84, 0.1); color: #1db954; }
.item-thumb-placeholder.genero { background: rgba(255, 152, 0, 0.1); color: #FF9800; }

.item-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.item-name {
  font-size: 14px;
  color: #fff;
}

.item-name mark {
  background: none;
  color: #1db954;
  font-weight: 600;
}

.item-sub {
  font-size: 12px;
  color: #888;
}

.source-badge {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s;
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

.group-item:hover .source-badge {
  transform: scale(1.1);
}

/* ===== LOADING ===== */
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

/* ===== DISCOVER SECTION ===== */
.discover-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== QUICK TAGS ===== */
.quick-tags {
  margin-bottom: 32px;
}

.tags-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
  margin: 0;
}

/* ===== CATEGORIES DROPDOWN ===== */
.categories-dropdown-wrapper {
  position: relative;
}

.categories-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(29, 185, 84, 0.1);
  border: 1px solid rgba(29, 185, 84, 0.3);
  border-radius: 20px;
  color: #1db954;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.categories-btn:hover {
  background: rgba(29, 185, 84, 0.2);
  border-color: #1db954;
  transform: translateY(-1px);
}

.categories-btn.active {
  background: #1db954;
  color: #000;
}

.categories-btn i.fa-chevron-down {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.categories-btn i.fa-chevron-down.rotate {
  transform: rotate(180deg);
}

.categories-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 600px;
  max-width: 90vw;
  background: #181818;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  overflow: hidden;
  z-index: 95;
}

.categories-dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(90deg, rgba(29,185,84,0.1) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.categories-dropdown-header i {
  font-size: 20px;
  color: #1db954;
}

.categories-dropdown-header span {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.close-dropdown {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-dropdown:hover {
  background: rgba(255, 68, 68, 0.8);
  color: #fff;
}

.categories-tabs {
  display: flex;
  gap: 0;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0,0,0,0.2);
}

.categories-tabs button {
  flex: 1;
  padding: 16px 12px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #888;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.categories-tabs button:hover {
  color: #fff;
  background: rgba(255,255,255,0.03);
}

.categories-tabs button.active {
  color: #1db954;
  border-bottom-color: #1db954;
  background: rgba(29,185,84,0.05);
}

.categories-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 20px 24px;
}

.category-tab-content {
  animation: fadeIn 0.3s ease;
}

.category-section {
  margin-bottom: 24px;
}

.category-section:last-child {
  margin-bottom: 0;
}

.category-section h4 {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
  margin-bottom: 12px;
}

.category-tags.detailed {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-btn.detailed {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: 1.5px solid;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn.detailed:hover {
  background: rgba(255,255,255,0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.tag-btn.detailed i {
  font-size: 12px;
}

.tag-btn.detailed small {
  font-size: 10px;
  opacity: 0.7;
  background: rgba(0,0,0,0.3);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

.empty-category {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 13px;
  background: rgba(255,255,255,0.03);
  border-radius: 8px;
  margin: 8px 0;
}

.empty-text {
  font-style: italic;
}

/* ===== MOOD GRID ===== */
.mood-grid.detailed {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mood-card-detailed {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255,255,255,0.1);
}

.mood-card-detailed:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  filter: brightness(1.1);
}

.mood-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mood-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.mood-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
}

/* ===== DECADE TIMELINE ===== */
.decade-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.decade-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.decade-item:hover {
  background: rgba(255,255,255,0.06);
}

.decade-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  opacity: 0.15;
  transition: opacity 0.3s;
}

.decade-item:hover .decade-bar {
  opacity: 0.25;
}

.decade-info {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.decade-name {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
}

.decade-desc {
  font-size: 12px;
  color: #888;
}

/* ===== TAGS ROW ===== */
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-btn {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #1db954;
  color: #1db954;
  transform: translateY(-2px);
}

/* ===== TRANSITIONS ===== */
.dropdown-enter-active {
  animation: dropdownIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dropdown-leave-active {
  animation: dropdownOut 0.2s ease;
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes dropdownOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(-10px) scale(0.95); }
}

/* ===== TOP SECTION ===== */
.top-section {
  background: #181818;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.top-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.view-all {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: color 0.2s;
}

.view-all:hover {
  color: #1db954;
}

/* ===== TOP TRACKS - LISTA TIPO SPOTIFY ===== */
.top-tracks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.track-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.track-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

.track-number {
  width: 24px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #888;
}

.track-card img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.track-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.track-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.track-artist {
  font-size: 12px;
  color: #888;
}

/* Botão de curtir no Top Músicas */
.btn-like-track {
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

.track-card:hover .btn-like-track {
  opacity: 1;
}

.btn-like-track:hover {
  color: #ec4899;
  transform: scale(1.2);
}

.btn-like-track.liked {
  opacity: 1;
  color: #ec4899;
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.track-play {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1db954;
  border: none;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
}

.track-card:hover .track-play {
  opacity: 1;
}

.track-play:hover {
  transform: scale(1.1);
}

/* ===== ARTISTS ROW ===== */
.artists-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.artist-item {
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.artist-item:hover {
  transform: translateY(-4px);
}

.artist-item img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.artist-item:hover img {
  border-color: #1db954;
}

.artist-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-fans {
  font-size: 11px;
  color: #888;
}

/* ===== SEARCH RESULTS ===== */
.search-results {
  animation: fadeIn 0.3s ease;
}

.results-header {
  margin-bottom: 24px;
}

.results-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tabs button {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background: #181818;
  color: #888;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tabs button:hover {
  background: #282828;
  color: #fff;
}

.filter-tabs button.active {
  background: #1db954;
  color: #000;
}

/* ===== NO RESULTS ===== */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #666;
}

.no-results i {
  font-size: 48px;
  opacity: 0.5;
}

/* ===== RESULTS SECTION ===== */
.results-section {
  margin-bottom: 40px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

/* ===== TRACKS LIST - LAYOUT SPOTIFY STYLE ===== */
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

.track-list-duration {
  font-size: 12px;
  color: #888;
  font-variant-numeric: tabular-nums;
  width: 40px;
  text-align: right;
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

/* ===== ARTISTS GRID ===== */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.artist-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
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

.btn-like-artist {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
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

.artist-card:hover .btn-like-artist {
  opacity: 1;
}

.btn-like-artist:hover {
  background: rgba(251, 191, 36, 0.9);
  color: #0a0a0f;
}

.btn-like-artist.liked {
  opacity: 1;
  background: rgba(251, 191, 36, 0.9);
  color: #0a0a0f;
}

/* ===== ALBUMS GRID ===== */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.album-card {
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
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

.source-badge-card {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0,0,0,0.7);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(4px);
  z-index: 3;
  transition: all 0.2s;
}

.source-badge-card.spotify {
  color: #1db954;
  background: rgba(0,0,0,0.75);
  border-color: rgba(29, 185, 84, 0.5);
}

.source-badge-card.deezer {
  color: #ff6600;
  background: rgba(0,0,0,0.75);
  border-color: rgba(255, 102, 0, 0.5);
}

.source-badge-card.local {
  color: #ccc;
  background: rgba(0,0,0,0.75);
  border-color: rgba(255,255,255,0.2);
}

.album-card:hover .source-badge-card {
  transform: scale(1.15);
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

.btn-like-album {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
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

.album-card:hover .btn-like-album {
  opacity: 1;
}

.btn-like-album:hover {
  background: rgba(251, 191, 36, 0.9);
  color: #0a0a0f;
}

.btn-like-album.liked {
  opacity: 1;
  background: rgba(251, 191, 36, 0.9);
  color: #0a0a0f;
}

/* ===== USERS GRID ===== */
.users-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.user-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 16px;
  border-radius: 8px;
  background: #181818;
}

.user-card:hover {
  background: #282828;
  transform: translateY(-4px);
}

.user-card-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 12px;
}

.user-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-card-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-card-type {
  font-size: 12px;
  color: #888;
}

.user-privacy {
  font-size: 11px;
  color: #fbbf24;
}

/* ===== GENRES GRID ===== */
.genres-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.genre-card {
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
}

.genre-card:hover {
  transform: translateY(-4px);
  filter: brightness(1.1);
}

.genre-card-name {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.genre-card-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}

/* ===== TOAST ===== */
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

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .artists-grid,
  .albums-grid,
  .users-grid {
    grid-template-columns: repeat(4, 1fr);
  }
 
  .suggested-grid {
    grid-template-columns: repeat(2, 1fr);
  }
 
  .artists-row {
    grid-template-columns: repeat(4, 1fr);
  }
 
  .categories-dropdown {
    width: 500px;
  }
}

@media (max-width: 1024px) {
  .search-page {
    margin-left: 200px;
    width: calc(100% - 200px);
  }
 
  .artists-grid,
  .albums-grid,
  .users-grid {
    grid-template-columns: repeat(3, 1fr);
  }
 
  .categories-dropdown {
    width: 450px;
    right: -100px;
  }
 
  .mood-grid.detailed {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .search-page {
    margin-left: 0;
    width: 100%;
  }
 
  .search-container {
    padding: 0 16px;
  }
 
  .search-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
 
  .artists-grid,
  .albums-grid,
  .users-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
 
  .artists-row {
    grid-template-columns: repeat(3, 1fr);
  }
 
  .suggested-grid {
    grid-template-columns: 1fr;
  }
 
  .filter-tabs {
    flex-wrap: wrap;
  }
 
  .categories-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-height: 80vh;
  }
 
  .categories-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
 
  .categories-tabs button {
    flex-shrink: 0;
  }
 
  .btn-like-track,
  .btn-like-list,
  .btn-like-artist,
  .btn-like-album {
    opacity: 1;
  }
 
  .track-list-item {
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .search-box {
    padding: 12px 16px;
  }
 
  .search-box input {
    font-size: 16px;
  }
 
  .artists-grid,
  .albums-grid,
  .users-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
 
  .artists-row {
    grid-template-columns: repeat(2, 1fr);
  }
 
  .tags-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
 
  .category-tags.detailed {
    gap: 8px;
  }
 
  .tag-btn.detailed {
    padding: 8px 12px;
    font-size: 12px;
  }
 
  .track-list-number {
    display: none;
  }
 
  .track-list-duration {
    display: none;
  }
}
</style>