<template>
  <div class="search-page-clean">
    <!-- Header com Histórico de Buscas -->
    <header class="top-header">
      <div class="header-left">
        <svg viewBox="0 0 24 24" fill="currentColor" class="logo">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span>SoundUp</span>
      </div>

      <!-- Histórico de Buscas Compacto -->
      <div class="history-compact" ref="historyContainer">
        <button 
          v-if="searchHistory.length > 0" 
          class="history-toggle"
          @click="showHistory = !showHistory"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
          Histórico
          <span class="history-count">{{ searchHistory.length }}</span>
        </button>
        
        <div v-if="showHistory && searchHistory.length" class="history-dropdown">
          <div class="history-header-dropdown">
            <span>Buscas Recentes</span>
            <button @click="clearHistory" class="clear-btn-small">Limpar</button>
          </div>
          <div class="history-items">
            <button
              v-for="(item, index) in searchHistory.slice(0, 10)"
              :key="index"
              class="history-item-small"
              @click="selectFromHistory(item)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" class="history-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {{ item }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Barra de Busca Expandida -->
    <div class="search-section-expanded">
      <div class="search-wrapper-full" :class="{ focused: isFocused }">
        <svg viewBox="0 0 24 24" fill="currentColor" class="search-icon-large">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          ref="searchInput"
          type="text"
          v-model="searchQuery"
          placeholder="Buscar músicas, artistas, álbuns, playlists..."
          @focus="isFocused = true; showSuggestions = true"
          @blur="handleBlur"
          @keyup.enter="performSearch"
          @input="handleInput"
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <!-- Sugestões Agrupadas por Tipo -->
      <div v-if="showSuggestions && (groupedSuggestions.length > 0 || searchQuery.length === 0)" class="suggestions-panel">
        
        <!-- Recomendado para você (quando não há busca) -->
        <div v-if="searchQuery.length === 0" class="suggestion-group recommended-section">
          <div class="group-header">
            <svg viewBox="0 0 24 24" fill="currentColor" class="group-icon">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <span>Recomendado para você</span>
          </div>
          <div class="recommended-grid">
            <div
              v-for="(item, index) in recommendedItems"
              :key="index"
              class="recommended-item"
              @click="selectSuggestion(item.name)"
            >
              <img :src="item.image" :alt="item.name" class="recommended-img">
              <div class="recommended-info">
                <span class="recommended-name">{{ item.name }}</span>
                <span class="recommended-type">{{ item.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sugestões Agrupadas por Tipo -->
        <div v-else>
          <div
            v-for="group in groupedSuggestions"
            :key="group.type"
            class="suggestion-group"
          >
            <div class="group-header">
              <span :class="['type-badge', group.typeClass]">{{ group.type }}</span>
            </div>
            <div class="group-items">
              <div
                v-for="(item, idx) in group.items"
                :key="idx"
                class="suggestion-item-smart"
                @click="selectSuggestion(item.name)"
              >
                <img v-if="item.image" :src="item.image" class="suggestion-thumb">
                <div v-else class="suggestion-thumb placeholder" :class="group.typeClass">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path v-if="group.type === 'Artista'" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    <path v-else-if="group.type === 'Música'" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    <path v-else-if="group.type === 'Álbum'" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                    <path v-else d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </div>
                <div class="suggestion-text">
                  <span class="suggestion-name" v-html="highlightText(item.name)"></span>
                  <span v-if="item.subtitle" class="suggestion-subtitle">{{ item.subtitle }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Conteúdo Principal - Largura Total -->
    <main class="main-content-full">
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Buscando músicas...</span>
      </div>

      <!-- Estado Inicial -->
      <div v-if="!hasSearched && !isLoading" class="discover-fullwidth">
        
        <!-- Grid de Categorias Compacto -->
        <div class="quick-categories">
          <h2 class="section-title">Explorar</h2>
          <div class="category-pills">
            <button
              v-for="cat in quickCategories"
              :key="cat"
              class="cat-pill"
              @click="searchAndGo(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Grid Principal de Descoberta -->
        <div class="discovery-grid">
          
          <!-- Tendências -->
          <div class="grid-section">
            <h3 class="grid-title">Tendências</h3>
            <div class="trend-boxes">
              <div
                v-for="(trend, index) in trending"
                :key="trend"
                class="trend-box"
                :style="{ background: getTrendGradient(index) }"
                @click="searchAndGo(trend)"
              >
                {{ trend }}
              </div>
            </div>
          </div>

          <!-- Gêneros -->
          <div class="grid-section">
            <h3 class="grid-title">Gêneros</h3>
            <div class="genre-list-horizontal">
              <div
                v-for="genre in genres"
                :key="genre.name"
                class="genre-tag-large"
                :style="{ background: genre.color }"
                @click="searchAndGo(genre.name)"
              >
                {{ genre.name }}
              </div>
            </div>
          </div>

          <!-- Moods -->
          <div class="grid-section">
            <h3 class="grid-title">Estados de Espírito</h3>
            <div class="mood-cards">
              <div
                v-for="mood in moods"
                :key="mood.name"
                class="mood-card"
                :style="{ background: mood.gradient }"
                @click="searchAndGo(mood.name)"
              >
                <span class="mood-label">{{ mood.name }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Top Músicas do Deezer -->
        <div class="content-block" v-if="chartTracks.length > 0">
          <div class="block-header">
            <h3>Top Músicas Brasil</h3>
            <button @click="searchAndGo('Top Brasil')">Ver todas</button>
          </div>
          <div class="block-grid albums">
            <div
              v-for="track in chartTracks.slice(0, 4)"
              :key="track.id"
              class="grid-item album"
              @click="playTrack(track)"
            >
              <img :src="track.album.cover_medium" :alt="track.title">
              <span class="item-title">{{ track.title }}</span>
              <span class="item-sub">{{ track.artist.name }}</span>
            </div>
          </div>
        </div>

        <!-- Artistas Populares do Deezer -->
        <div class="content-block" v-if="popularArtistsReal.length > 0">
          <div class="block-header">
            <h3>Artistas Populares</h3>
            <button @click="searchAndGo('Artistas')">Ver todos</button>
          </div>
          <div class="block-grid artists">
            <div
              v-for="artist in popularArtistsReal.slice(0, 8)"
              :key="artist.id"
              class="grid-item artist"
              @click="searchArtist(artist.name)"
            >
              <img :src="artist.picture_medium" :alt="artist.name">
              <span>{{ artist.name }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Resultados da Busca -->
      <div v-else-if="hasSearched && !isLoading" class="search-results-full">
        <div class="results-toolbar">
          <h2>Resultados para "{{ lastSearch }}"</h2>
          <div class="filter-chips">
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

        <div v-if="searchResults.length === 0" class="no-results">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <p>Nenhum resultado encontrado para "{{ lastSearch }}"</p>
        </div>

        <div v-else class="results-masonry">
          <div
            v-for="(result, index) in filteredResults"
            :key="result.id || index"
            class="result-tile"
            @click="playTrack(result)"
          >
            <div class="tile-visual">
              <img :src="getBestImage(result)" :alt="getResultTitle(result)">
              <button class="tile-play">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <span class="tile-type">{{ getResultType(result) }}</span>
            </div>
            <div class="tile-info">
              <h4>{{ getResultTitle(result) }}</h4>
              <p>{{ getResultSubtitle(result) }}</p>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Player Fixo -->
    <div v-if="currentTrack" class="fixed-player">
      <div class="player-info">
        <img :src="getPlayerImage(currentTrack)" :alt="getResultTitle(currentTrack)">
        <div class="player-text">
          <span class="player-title">{{ getResultTitle(currentTrack) }}</span>
          <span class="player-artist">{{ getResultSubtitle(currentTrack) }}</span>
        </div>
      </div>
      <div class="player-controls">
        <button @click="togglePlay" class="play-btn">
          <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
      <audio 
        v-if="currentTrack && currentTrack.preview" 
        ref="audioPlayer"
        :src="currentTrack.preview"
        @ended="isPlaying = false"
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></audio>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchClean',
  
 data() {
  return {
    // ============ CONFIGURAÇÃO DA API ============
    // ✅ Use este proxy para desenvolvimento (funciona imediatamente)
    DEEZER_API: 'https://proxy.corsfix.com/?https://api.deezer.com',
    
    // ❌ API direta NÃO FUNCIONA no navegador (CORS bloqueado)
    // DEEZER_API: 'https://api.deezer.com',
    
    // ==============================================
    
    searchQuery: '',
    lastSearch: '',
    isFocused: false,
    hasSearched: false,
    showSuggestions: false,
    showHistory: false,
    activeFilter: 'Todos',
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    
    searchHistory: JSON.parse(localStorage.getItem('searchHistory')) || [],
    suggestions: [],
    searchResults: [],
    chartTracks: [],
    popularArtistsReal: [],

    searchFilters: ['Todos', 'Músicas', 'Artistas', 'Álbuns'],

    quickCategories: [
      'Pop', 'Rock', 'Hip Hop', 'Eletrônica', 'Sertanejo', 
      'Funk', 'MPB', 'Jazz', 'Clássica', 'Indie', 'Pagode', 'Forró'
    ],

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
      { name: 'Funk', color: '#FF5722' },
      { name: 'MPB', color: '#9C27B0' },
      { name: 'Gospel', color: '#1976D2' },
      { name: 'Jazz', color: '#FFC107' },
      { name: 'Clássica', color: '#795548' }
    ],

    moods: [
      { name: 'Treino', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)' },
      { name: 'Foco', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Relaxar', gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)' },
      { name: 'Festa', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { name: 'Triste', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Romântico', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    ],

    recommendedItems: [
      { name: 'The Weeknd', type: 'Artista', image: 'https://e-cdns-images.dzcdn.net/images/artist/9f6c0d74b0f2c27b2f0c6a5b5e5b5e5b/250x250-000000-80-0-0.jpg' },
      { name: 'Blinding Lights', type: 'Música', image: 'https://e-cdns-images.dzcdn.net/images/cover/9f6c0d74b0f2c27b2f0c6a5b5e5b5e5b/250x250-000000-80-0-0.jpg' },
      { name: 'After Hours', type: 'Álbum', image: 'https://e-cdns-images.dzcdn.net/images/cover/9f6c0d74b0f2c27b2f0c6a5b5e5b5e5b/250x250-000000-80-0-0.jpg' },
      { name: 'Taylor Swift', type: 'Artista', image: 'https://e-cdns-images.dzcdn.net/images/artist/9f6c0d74b0f2c27b2f0c6a5b5e5b5e5b/250x250-000000-80-0-0.jpg' }
    ]
  }
},

  computed: {
    filteredResults() {
      if (this.activeFilter === 'Todos') return this.searchResults
      
      const typeMap = {
        'Músicas': 'track',
        'Artistas': 'artist', 
        'Álbuns': 'album'
      }
      
      const filterType = typeMap[this.activeFilter]
      return this.searchResults.filter(r => r.type === filterType || r.type === this.activeFilter)
    },
    
    // Agrupar sugestões por tipo
    groupedSuggestions() {
      if (!this.searchQuery.trim()) return []
      
      const query = this.searchQuery.toLowerCase()
      const groups = {}
      
      // Agrupar resultados da busca atual
      const matches = this.searchResults.filter(item => {
        const title = this.getResultTitle(item).toLowerCase()
        return title.includes(query)
      })
      
      matches.forEach(item => {
        const type = this.getResultType(item)
        if (!groups[type]) {
          groups[type] = {
            type: type,
            typeClass: type.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-'),
            items: []
          }
        }
        
        groups[type].items.push({
          name: this.getResultTitle(item),
          image: this.getBestImage(item),
          subtitle: this.getResultSubtitle(item)
        })
      })
      
      const typeOrder = ['Artista', 'Música', 'Álbum', 'Playlist']
      
      return Object.values(groups)
        .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type))
        .map(group => ({
          ...group,
          items: group.items.slice(0, 3)
        }))
    }
  },

  mounted() {
    document.addEventListener('click', this.handleClickOutside)
    this.loadInitialData()
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },

  methods: {
    // MÉTODOS DA API DEEZER
    
    async loadInitialData() {
      await this.loadChartTracks()
      await this.loadPopularArtists()
    },

    async loadChartTracks() {
      try {
        // Top tracks do Brasil (chart/0 = global, mas vamos buscar playlist BR)
        const response = await fetch(`${this.DEEZER_API}/chart/0/tracks?limit=10`)
        const data = await response.json()
        if (data.data) {
          this.chartTracks = data.data
        }
      } catch (error) {
        console.error('Erro ao carregar chart:', error)
      }
    },

    async loadPopularArtists() {
      try {
        // Buscar artistas populares (usando search por popularidade)
        const response = await fetch(`${this.DEEZER_API}/chart/0/artists?limit=10`)
        const data = await response.json()
        if (data.data) {
          this.popularArtistsReal = data.data
        }
      } catch (error) {
        console.error('Erro ao carregar artistas:', error)
      }
    },

    async searchDeezer(query) {
      this.isLoading = true
      try {
        // Busca tracks
        const trackResponse = await fetch(`${this.DEEZER_API}/search/track?q=${encodeURIComponent(query)}&limit=20`)
        const trackData = await trackResponse.json()
        
        // Busca artistas
        const artistResponse = await fetch(`${this.DEEZER_API}/search/artist?q=${encodeURIComponent(query)}&limit=10`)
        const artistData = await artistResponse.json()
        
        // Busca álbuns
        const albumResponse = await fetch(`${this.DEEZER_API}/search/album?q=${encodeURIComponent(query)}&limit=10`)
        const albumData = await albumResponse.json()

        // Combinar resultados
        const results = []
        
        if (trackData.data) {
          results.push(...trackData.data.map(item => ({...item, type: 'track'})))
        }
        if (artistData.data) {
          results.push(...artistData.data.map(item => ({...item, type: 'artist'})))
        }
        if (albumData.data) {
          results.push(...albumData.data.map(item => ({...item, type: 'album'})))
        }

        this.searchResults = results
      } catch (error) {
        console.error('Erro na busca:', error)
        this.searchResults = []
      } finally {
        this.isLoading = false
      }
    },

    async searchArtist(artistName) {
      this.searchQuery = artistName
      await this.performSearch()
    },

    // MÉTODOS UTILITÁRIOS
    
    getResultTitle(item) {
      if (item.type === 'track') return item.title
      if (item.type === 'artist') return item.name
      if (item.type === 'album') return item.title
      return item.name || item.title || 'Desconhecido'
    },

    getResultSubtitle(item) {
      if (item.type === 'track') return item.artist?.name || 'Artista desconhecido'
      if (item.type === 'artist') return `${item.nb_fan || 0} fãs`
      if (item.type === 'album') return item.artist?.name || 'Artista desconhecido'
      return item.description || ''
    },

    getResultType(item) {
      const typeMap = {
        'track': 'Música',
        'artist': 'Artista',
        'album': 'Álbum'
      }
      return typeMap[item.type] || item.type
    },

    getBestImage(item) {
      if (item.type === 'track') {
        return item.album?.cover_medium || item.album?.cover || 'https://via.placeholder.com/250'
      }
      if (item.type === 'artist') {
        return item.picture_medium || item.picture || 'https://via.placeholder.com/250'
      }
      if (item.type === 'album') {
        return item.cover_medium || item.cover || 'https://via.placeholder.com/250'
      }
      return 'https://via.placeholder.com/250'
    },

    getPlayerImage(track) {
      if (track.type === 'track') {
        return track.album?.cover_small || track.album?.cover
      }
      return track.picture_small || track.cover_small || 'https://via.placeholder.com/50'
    },

    // MÉTODOS DE INTERAÇÃO

    handleClickOutside(event) {
      const historyEl = this.$refs.historyContainer
      if (historyEl && !historyEl.contains(event.target)) {
        this.showHistory = false
      }
    },

    getTrendGradient(index) {
      return this.trendGradients[index % this.trendGradients.length]
    },

    handleInput() {
      this.showSuggestions = true
      // Debounce para busca automática de sugestões
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        if (this.searchQuery.length > 2) {
          this.searchDeezer(this.searchQuery)
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

    selectSuggestion(sugg) {
      this.searchQuery = sugg
      this.performSearch()
    },

    selectFromHistory(item) {
      this.searchQuery = item
      this.performSearch()
      this.showHistory = false
    },

    async performSearch() {
      if (!this.searchQuery.trim()) return
      
      this.lastSearch = this.searchQuery
      this.hasSearched = true
      this.showSuggestions = false
      this.showHistory = false
      
      // Salvar no histórico
      this.searchHistory = [this.searchQuery, ...this.searchHistory.filter(h => h !== this.searchQuery)].slice(0, 10)
      localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory))
      
      // Buscar na API
      await this.searchDeezer(this.searchQuery)
    },

    searchAndGo(term) {
      this.searchQuery = term
      this.performSearch()
    },

    clearSearch() {
      this.searchQuery = ''
      this.hasSearched = false
      this.suggestions = []
      this.searchResults = []
      this.$refs.searchInput.focus()
    },

    clearHistory() {
      this.searchHistory = []
      localStorage.removeItem('searchHistory')
      this.showHistory = false
    },

    playTrack(track) {
      this.currentTrack = track
      this.isPlaying = true
      // Aguardar o DOM atualizar para acessar o audio
      this.$nextTick(() => {
        if (this.$refs.audioPlayer) {
          this.$refs.audioPlayer.play()
        }
      })
    },

    togglePlay() {
      if (this.$refs.audioPlayer) {
        if (this.isPlaying) {
          this.$refs.audioPlayer.pause()
        } else {
          this.$refs.audioPlayer.play()
        }
      }
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.search-page-clean {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: #0a0a0a;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  inset: 0;
}

.top-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 32px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left .logo {
  width: 24px;
  height: 24px;
  color: #1DB954;
}

.header-left span {
  font-size: 18px;
  font-weight: 700;
}

.history-compact {
  position: relative;
}

.history-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.history-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.history-toggle svg {
  width: 14px;
  height: 14px;
}

.history-count {
  width: 18px;
  height: 18px;
  background: #1DB954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
}

.history-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 280px;
  background: #1a1a1a;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  overflow: hidden;
  z-index: 1000;
}

.history-header-dropdown {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.history-header-dropdown span {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}

.clear-btn-small {
  font-size: 11px;
  color: #1DB954;
  background: none;
  border: none;
  cursor: pointer;
}

.history-items {
  max-height: 260px;
  overflow-y: auto;
}

.history-item-small {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item-small:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.history-icon {
  width: 16px;
  height: 16px;
  color: #1DB954;
  flex-shrink: 0;
}

.search-section-expanded {
  flex-shrink: 0;
  padding: 16px 32px;
  position: relative;
  z-index: 90;
}

.search-wrapper-full {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #1a1a1a;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 12px 18px;
  transition: all 0.2s;
}

.search-wrapper-full.focused {
  background: #242424;
  border-color: #1DB954;
  box-shadow: 0 0 25px rgba(29, 185, 84, 0.15);
}

.search-icon-large {
  width: 20px;
  height: 20px;
  color: #888;
  flex-shrink: 0;
}

.search-wrapper-full.focused .search-icon-large {
  color: #1DB954;
}

.search-wrapper-full input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: white;
  font-size: 15px;
}

.search-wrapper-full input::placeholder {
  color: #666;
}

.clear-search-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: rgba(255, 68, 68, 0.8);
  transform: rotate(90deg);
}

.clear-search-btn svg {
  width: 14px;
  height: 14px;
}

/* Sugestões Inteligentes Agrupadas */
.suggestions-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 32px;
  right: 32px;
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-group {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestion-group:last-child {
  border-bottom: none;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.02);
}

.group-icon {
  width: 16px;
  height: 16px;
  color: #1DB954;
}

.group-header span {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}

.type-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-badge.artista {
  background: rgba(29, 185, 84, 0.2);
  color: #1DB954;
}

.type-badge.musica {
  background: rgba(33, 150, 243, 0.2);
  color: #2196F3;
}

.type-badge.album {
  background: rgba(156, 39, 176, 0.2);
  color: #9C27B0;
}

.type-badge.playlist {
  background: rgba(255, 152, 0, 0.2);
  color: #FF9800;
}

.group-items {
  padding: 4px 0;
}

.suggestion-item-smart {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.suggestion-item-smart:hover {
  background: rgba(255, 255, 255, 0.05);
}

.suggestion-thumb {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.suggestion-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #333;
}

.suggestion-thumb.placeholder svg {
  width: 20px;
  height: 20px;
  color: #666;
}

.suggestion-thumb.placeholder.artista {
  background: rgba(29, 185, 84, 0.1);
}

.suggestion-thumb.placeholder.artista svg {
  color: #1DB954;
}

.suggestion-thumb.placeholder.musica {
  background: rgba(33, 150, 243, 0.1);
}

.suggestion-thumb.placeholder.musica svg {
  color: #2196F3;
}

.suggestion-thumb.placeholder.album {
  background: rgba(156, 39, 176, 0.1);
}

.suggestion-thumb.placeholder.album svg {
  color: #9C27B0;
}

.suggestion-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.suggestion-name {
  font-size: 14px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-name mark {
  background: none;
  color: #1DB954;
  font-weight: 600;
}

.suggestion-subtitle {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Recomendado para você */
.recommended-section {
  padding: 16px;
}

.recommended-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.recommended-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.recommended-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.recommended-img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
}

.recommended-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.recommended-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommended-type {
  font-size: 11px;
  color: #1DB954;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.main-content-full {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 32px 32px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.main-content-full::-webkit-scrollbar {
  width: 6px;
}

.main-content-full::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.quick-categories {
  margin-bottom: 24px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #888;
  margin-bottom: 12px;
}

.category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-pill {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cat-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #1DB954;
  color: #1DB954;
  transform: translateY(-2px);
}

.discovery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.grid-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px;
}

.grid-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  margin-bottom: 12px;
}

.trend-boxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trend-box {
  padding: 10px 12px;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.trend-box:hover {
  transform: translateX(3px);
  filter: brightness(1.1);
}

.genre-list-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.genre-tag-large {
  padding: 8px 12px;
  border-radius: 16px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.genre-tag-large:hover {
  transform: scale(1.05);
  filter: brightness(1.2);
}

.mood-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.mood-card {
  aspect-ratio: 16/10;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.mood-card:hover {
  transform: scale(1.02);
}

.mood-label {
  font-size: 13px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.content-block {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.block-header h3 {
  font-size: 13px;
  font-weight: 700;
}

.block-header button {
  font-size: 11px;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.block-header button:hover {
  color: #1DB954;
}

.block-grid {
  display: grid;
  gap: 10px;
}

.block-grid.artists {
  grid-template-columns: repeat(4, 1fr);
}

.block-grid.albums,
.block-grid.podcasts {
  grid-template-columns: repeat(2, 1fr);
}

.block-grid.playlists,
.block-grid.radios,
.block-grid.shows,
.block-grid.discover {
  grid-template-columns: 1fr;
}

.grid-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.grid-item:hover {
  transform: translateY(-3px);
}

.grid-item.artist {
  text-align: center;
}

.grid-item.artist img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 6px;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.grid-item.artist:hover img {
  border-color: #1DB954;
}

.grid-item.artist span {
  font-size: 11px;
  color: #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.grid-item.album img,
.grid-item.podcast img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  object-fit: cover;
  margin-bottom: 6px;
}

.grid-item.album .item-title,
.grid-item.podcast .item-title {
  font-size: 12px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.grid-item.album .item-sub,
.grid-item.podcast .item-sub {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.grid-item.playlist,
.grid-item.radio,
.grid-item.show,
.grid-item.discover {
  aspect-ratio: 16/8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px;
  gap: 2px;
}

.playlist-badge,
.radio-icon,
.show-date,
.discover-icon {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
}

.item-title {
  font-size: 13px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #888;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(29, 185, 84, 0.3);
  border-top-color: #1DB954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* No Results */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #666;
}

.no-results svg {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

.search-results-full {
  padding-bottom: 100px;
}

.results-toolbar {
  margin-bottom: 20px;
}

.results-toolbar h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chips button {
  padding: 6px 16px;
  border-radius: 16px;
  border: none;
  background: #1a1a1a;
  color: #888;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chips button:hover {
  background: #242424;
  color: white;
}

.filter-chips button.active {
  background: #1DB954;
  color: white;
}

.results-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.result-tile {
  cursor: pointer;
  transition: transform 0.2s;
}

.result-tile:hover {
  transform: translateY(-3px);
}

.tile-visual {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.tile-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.result-tile:hover .tile-visual img {
  transform: scale(1.05);
}

.tile-play {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}

.result-tile:hover .tile-play {
  opacity: 1;
}

.tile-play svg {
  width: 32px;
  height: 32px;
  color: #1DB954;
}

.tile-type {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 3px 6px;
  background: rgba(0,0,0,0.6);
  border-radius: 3px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1DB954;
}

.tile-info h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tile-info p {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Fixed Player */
.fixed-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.player-info img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.player-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.player-artist {
  font-size: 12px;
  color: #888;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1DB954;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-btn:hover {
  transform: scale(1.1);
}

.play-btn svg {
  width: 20px;
  height: 20px;
}

@media screen and (max-width: 1200px) {
  .discovery-grid {
    grid-template-columns: 1fr;
  }
  
  .block-grid.artists {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .recommended-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .top-header,
  .search-section-expanded {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .main-content-full {
    padding: 0 16px 100px;
  }
  
  .block-grid.artists {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .suggestions-panel {
    left: 16px;
    right: 16px;
  }
  
  .recommended-grid {
    grid-template-columns: 1fr;
  }

  .fixed-player {
    padding: 12px 16px;
  }
}
</style>