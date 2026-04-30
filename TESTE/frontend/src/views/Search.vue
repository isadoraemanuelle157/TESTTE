<template>
  <div class="search-page">
    <div class="search-container">
      
      <!-- Header com Logo -->
      <header class="search-header">
        <div class="header-brand">
          <i class="fa fa-music brand-icon"></i>
          <span class="brand-text">SoundUp</span>
        </div>
        
        <!-- Botão de Histórico removido do header -->
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
                  <img v-if="item.image" :src="item.image" class="item-thumb">
                  <div v-else class="item-thumb-placeholder" :class="group.typeClass">
                    <i :class="getIconForType(group.type)"></i>
                  </div>
                  <div class="item-details">
                    <span class="item-name" v-html="highlightText(item.name)"></span>
                    <span v-if="item.subtitle" class="item-sub">{{ item.subtitle }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resto do template permanece igual... -->
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
                   <div class="category-section">
  <h4>Populares</h4>
  <div v-if="generosPorCategoria.popular.length === 0" class="empty-category">
    <span class="empty-text">Nenhum gênero popular cadastrado</span>
  </div>
  <div class="category-tags detailed">
    <button
      v-for="genre in generosPorCategoria.popular"
      :key="genre._id"
      class="tag-btn detailed"
      @click="searchAndGo(genre.nome); showCategoriesDropdown = false"
    >
      <i class="fa fa-music"></i>
      <span>{{ genre.nome }}</span>
      <small>
        🎵 {{ genre.musicas?.length || 0 }} • 
        💿 {{ genre.albuns?.length || 0 }} • 
        🎤 {{ genre.cantores?.length || 0 }}
      </small>
    </button>
  </div>
</div>

                        
                      <div class="category-section">
  <h4>Estilos Regionais</h4>
  <div class="category-tags detailed">
    <button
      v-for="genre in generosPorCategoria.regional"
      :key="genre._id"
      class="tag-btn detailed"
      @click="searchAndGo(genre.nome); showCategoriesDropdown = false"
    >
      <i class="fa fa-map"></i>
      <span>{{ genre.nome }}</span>
    </button>
  </div>
</div>
                       
      <div class="category-section">
  <h4>Eletrônica & Dance</h4>
  <div class="category-tags detailed">
    <button
      v-for="genre in generosPorCategoria.electronic"
      :key="genre._id"
      class="tag-btn detailed"
      @click="searchAndGo(genre.nome); showCategoriesDropdown = false"
    >
      <i class="fa fa-headphones"></i>
      <span>{{ genre.nome }}</span>
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
                v-for="cat in quickCategories"
                :key="cat"
                class="tag-btn"
                @click="searchAndGo(cat)"
              >
                {{ cat }}
              </button>
            </div>
          </div>

          <!-- Grid de Descoberta -->
          <div class="discovery-grid">
            
          </div>

          <!-- Top Músicas -->
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
                <img :src="track.album.cover_medium" :alt="track.title">
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

          <!-- Artistas Populares -->
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
                <img :src="artist.picture_medium" :alt="artist.name">
                <span class="artist-name">{{ artist.name }}</span>
                <span class="artist-fans">{{ formatFans(artist.nb_fan) }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Resultados da Busca -->
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

          <div v-else class="results-grid">
            <div
              v-for="(result, index) in filteredResults"
              :key="result.id || index"
              class="result-card"
               :class="{ 'has-decade': result.decada || result.ano }"
            >
              <div class="result-image" @click="handleResultClick(result)">
                <img :src="getBestImage(result)" :alt="getResultTitle(result)">
                <div class="result-overlay">
                  <i class="fa fa-play"></i>
                </div>
                <span class="result-type">{{ getResultType(result) }}</span>

                  <span
    v-if="result.decada || result.ano"
    class="decade-badge"
    :style="{ background: getDecadeColor(result.decada || result.ano) }"
  >
    {{ result.decada || getDecadeFromYear(result.ano) }}
  </span>
              </div>
              
            <!-- Música = coração -->
<button 
  v-if="result.type === 'track'"
  class="btn-like-result"
  @click.stop="toggleLikeTrack(result)"
  :class="{ liked: isTrackLiked(result.id) }"
  :title="isTrackLiked(result.id) ? 'Remover dos curtidos' : 'Adicionar aos curtidos'"
>
  <i :class="isTrackLiked(result.id) ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
</button>

<!-- Álbum = estrela (LOCAL E DEEZER) -->
<button 
  v-else-if="result.type === 'album'"
  class="btn-like-result btn-star"
  @click.stop="toggleFavoriteItem(result)"
  :class="{ liked: isAlbumFavorited(result.id) }"
  :title="isAlbumFavorited(result.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
>
  <i :class="isAlbumFavorited(result.id) ? 'fa fa-star' : 'fa fa-star-o'"></i>
</button>

<!-- Artista = estrela (LOCAL E DEEZER) -->
<button 
  v-else-if="result.type === 'artist'"
  class="btn-like-result btn-star"
  @click.stop="toggleFavoriteItem(result)"
  :class="{ liked: isArtistFavorited(result.id) }"
  :title="isArtistFavorited(result.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
>
  <i :class="isArtistFavorited(result.id) ? 'fa fa-star' : 'fa fa-star-o'"></i>
</button>
              
              <div class="result-info" @click="handleResultClick(result)">
                <h4>{{ getResultTitle(result) }}</h4>
                <p>{{ getResultSubtitle(result) }}</p>
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
      DEEZER_API: 'https://proxy.corsfix.com/?https://api.deezer.com',

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

      searchFilters: ['Todos', 'Músicas', 'Artistas', 'Álbuns', 'Usuários', 'Décadas'],

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
    'Usuários': 'user'
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

      if (!Array.isArray(this.generosDB) || this.generosDB.length === 0) {
        return grupos
      }

      this.generosDB.forEach(g => {
        const cat = (g.categoria || 'outros').toLowerCase().trim()
        if (grupos[cat]) grupos[cat].push(g)
        else grupos.outros.push(g)
      })

      return grupos
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
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '-'),
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

  const initialCategory = this.$route?.query?.q || 'Brasil'
  this.currentTopCategory = initialCategory
  this.searchQuery = this.$route?.query?.q || ''

  this.loadInitialData(initialCategory)
  this.loadLikedTracks()
  this.loadFavoritas()
  this.loadVibes()
  this.loadGeneros()
  this.loadHistory()
},

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    if (this.searchTimeout) clearTimeout(this.searchTimeout)
  },
watch: {
  '$route.query.q': {
    immediate: false,
    handler(newValue) {
      const category = newValue || 'Brasil'
      this.currentTopCategory = category
      this.loadTopTracksByCategory(category)
    }
  }
},

  methods: {
    // ===== SISTEMA DE CURTIDAS =====
    
    // Carregar músicas curtidas do localStorage
    async loadLikedTracks() {
      try {
        const token = localStorage.getItem("token")

        const res = await fetch(`http://localhost:3002/curtidas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()

        // salvar só os IDs das músicas
        this.likedTracks = data.map(c => c.musica?._id || c.musica?.id)

      } catch (err) {
        console.error(err)
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
    console.log("HISTORICO:", data)

    // 🔥 GARANTE QUE É ARRAY
    if (Array.isArray(data)) {
      this.searchHistory = data.map(h => h.termo)
    } else {
      this.searchHistory = []
      console.error("Resposta inesperada:", data)
    }

  } catch (err) {
    console.error("Erro ao carregar histórico:", err)
  }
},
// Adicione este método no objeto methods:
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

    // Remove do array local
    this.searchHistory = this.searchHistory.filter(h => h !== item)
    
  } catch (err) {
    console.error("Erro ao remover item do histórico:", err)
    // Fallback: remove localmente mesmo se API falhar
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
        if (!token) return

        const res = await fetch(`http://localhost:3002/favoritas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()

        this.favoriteAlbums = data
          .filter(f => f.album && f.album._id)
          .map(f => String(f.album._id))

        this.favoriteArtists = data
          .filter(f => f.cantor && f.cantor._id)
          .map(f => String(f.cantor._id))

      } catch (err) {
        console.error("Erro ao carregar favoritas:", err)
      }
    },

async loadGeneros() {
  try {
    const res = await fetch("http://localhost:3002/generos")
    const data = await res.json()

    console.log('Gêneros carregados:', data) // debug

    // Garantir que é um array
    let generosArray = data
    if (!Array.isArray(data)) {
      // Se vier como objeto agrupado, achatar
      generosArray = Object.values(data).flat()
    }

    this.generosDB = generosArray
    
    // Atualizar quickCategories automaticamente
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

  if (/^\d{4}$/.test(String(decadeOrYear))) {
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
      return this.favoriteAlbums.includes(String(albumId))
    },

    isArtistFavorited(artistId) {
      return this.favoriteArtists.includes(String(artistId))
    },

  async toggleFavoriteItem(item) {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      this.showToast("Faça login para favoritar", "info")
      return
    }

    const tipo = item.type === 'album' ? 'album' : 'cantor'
    
    const body = { tipo }
    
    // Se for item da API externa (Deezer), envia source e dados
    if (item.source === 'deezer') {
      body.source = 'deezer'
      body.dadosItem = {
        titulo: item.title || item.name || 'Sem título',
        artista: item.artist?.name || item.subtitle || 'Artista Desconhecido',
        capa: this.getBestImage(item) || '',
        ano: item.ano || null
      }
    }

    const res = await fetch(`http://localhost:3002/favoritas/${String(item.id)}/favoritar`, {
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
        if (!this.favoriteAlbums.includes(String(item.id))) {
          this.favoriteAlbums.push(String(item.id))
        }
        this.showToast(`"${this.getResultTitle(item)}" adicionado aos favoritos ⭐`, "success")
      } else {
        this.favoriteAlbums = this.favoriteAlbums.filter(id => String(id) !== String(item.id))
        this.showToast(`"${this.getResultTitle(item)}" removido dos favoritos`, "info")
      }
    }

    if (item.type === 'artist') {
      if (data.favorited) {
        if (!this.favoriteArtists.includes(String(item.id))) {
          this.favoriteArtists.push(String(item.id))
        }
        this.showToast(`"${this.getResultTitle(item)}" adicionado aos favoritos ⭐`, "success")
      } else {
        this.favoriteArtists = this.favoriteArtists.filter(id => String(id) !== String(item.id))
        this.showToast(`"${this.getResultTitle(item)}" removido dos favoritos`, "info")
      }
    }

    window.dispatchEvent(new Event('favoritas-updated'))

  } catch (err) {
    console.error(err)
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

  // Se clicou no próprio usuário
  if (loggedId && loggedId === targetId) {
    return this.$router.push('/perfil')
  }

  // Outro usuário → página pública/externa estilo Instagram
  return this.$router.push({
    name: 'PerfilUsuario',
    params: { id: targetId }
  })
}, 
    // Verificar se uma música está curtida
    isTrackLiked(trackId) {
      return this.likedTracks.some(id => String(id) === String(trackId))
    },
    
    // Curtir/descurtir uma música
    async toggleLikeTrack(track) {
      try {
        const token = localStorage.getItem("token")

        const res = await fetch(
          `http://localhost:3002/musicas/${track.id}/curtir`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const data = await res.json()

        if (data.liked) {
          this.likedTracks.push(track.id)
          this.showToast(`"${this.getResultTitle(track)}" curtida ❤️`, "success")
        } else {
          this.likedTracks = this.likedTracks.filter(id => id != track.id)
          this.showToast(`"${this.getResultTitle(track)}" descurtida 💔`, "info")
        }

      } catch (err) {
        console.error(err)
      }
    },
    
    // Formatar duração
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

    let url = `${this.DEEZER_API}/chart/0/tracks?limit=10`

    if (category && category !== 'Brasil') {
      url = `${this.DEEZER_API}/search/track?q=${encodeURIComponent(category)}&limit=10`
    }

    const response = await fetch(url)
    const data = await response.json()

    this.chartTracks = Array.isArray(data.data) ? data.data : []
  } catch (error) {
    console.error('Erro ao carregar top da categoria:', error)
    this.chartTracks = []
  }
},

async loadPopularArtists() {
  try {
    const response = await fetch('http://localhost:3002/cantores')
    const data = await response.json()

    // 🔥 adaptar para o formato que o front espera
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
      fetch(`http://localhost:3002/generos/search?q=${encodeURIComponent(query)}`)
.then(r=>r.json()),
      fetch(`http://localhost:3002/usuarios/search?q=${encodeURIComponent(query)}`, {
        headers: authHeaders
      })
        .then(async r => r.ok ? r.json() : [])
        .catch(() => [])
    ])

    const [tracks, artists, albums] = await Promise.all([
      fetch(`${this.DEEZER_API}/search/track?q=${encodeURIComponent(query)}`).then(r => r.json()),
      fetch(`${this.DEEZER_API}/search/artist?q=${encodeURIComponent(query)}`).then(r => r.json()),
      fetch(`${this.DEEZER_API}/search/album?q=${encodeURIComponent(query)}`).then(r => r.json())
    ])

    let results = []

    // USUÁRIOS LOCAIS
    if (Array.isArray(localUsuarios)) {
  results.push(...localUsuarios.map(u => ({
    id: u.id || u._id,
    name: u.nome,
    username: u.username,
    picture: u.avatar,
    bio: u.bio || '',
    perfilPrivado: !!u.perfilPrivado,
    mostrarAtividade: u.mostrarAtividade !== false,
    localizacao: u.localizacao || '',
    membroDesde: u.membroDesde || null,
    type: 'user',
    source: 'local'
  })))
}

    // MUSICAS LOCAIS
    if (Array.isArray(localMusicas)) {
      results.push(...localMusicas.map(m => ({
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
        decada: m.ano ? this.getDecadeFromYear(m.ano) : null,
        type: 'track',
        source: 'local'
      })))
    }

    // CANTORES LOCAIS
 // CANTORES LOCAIS
if (Array.isArray(localCantores)) {
  results.push(...localCantores.map(c => ({
    id: c._id,
    name: c.nome,
    picture: c.foto,
    nb_fan: c.totalSeguidores || 0,        // ← ADICIONADO
    ano: c.ano,
    decada: c.ano ? this.getDecadeFromYear(c.ano) : null,  // ← CORRIGIDO: c.ano
    type: 'artist',
    source: 'local'
  })))
}

// ÁLBUNS LOCAIS
    if (Array.isArray(localAlbuns)) {
      results.push(...localAlbuns.map(a => ({
        id: a._id,
        title: a.nome,
        artist: {
          name: a.cantor?.nome || ''
        },
        cover: a.foto,
        ano: a.ano,
        decada: a.ano ? this.getDecadeFromYear(a.ano) : null,
        type: 'album',
        source: 'local'
      })))
    }

    // GÊNEROS
if (Array.isArray(localGeneros)) {

  localGeneros.forEach(g=>{
    // músicas do gênero
    if(g.musicas?.length){
      results.push(
       ...g.musicas.map(m=>({
          id:m._id,
          title:m.nome,
          artist:{
             name:m.cantores?.map(c=>c.nome).join(', ')
          },
          album:{
             title:m.albuns?.[0]?.nome || '',
             cover:m.albuns?.[0]?.foto || ''
          },
          cover:m.foto,
          preview:m.link,
          ano:m.ano,
          decada:m.ano
            ? this.getDecadeFromYear(m.ano)
            : null,
          type:'track',
          source:'local'
       }))
      )
    }

    // albuns do gênero
    if(g.albuns?.length){
      results.push(
       ...g.albuns.map(a=>({
         id:a._id,
         title:a.nome,
         artist:{
            name:a.cantor?.nome || ''
         },
         cover:a.foto,
         ano:a.ano,
         decada:a.ano
           ? this.getDecadeFromYear(a.ano)
           : null,
         type:'album',
         source:'local'
       }))
      )
    }

    // cantores do gênero
    if(g.cantores?.length){
      results.push(
       ...g.cantores.map(c=>({
         id:c._id,
         name:c.nome,
         picture:c.foto,
         nb_fan:c.totalSeguidores || 0,
         ano:c.ano,
         decada:c.ano
           ? this.getDecadeFromYear(c.ano)
           : null,
         type:'artist',
         source:'local'
       }))
      )
    }

  })

}

    // DEEZER
    if (tracks.data) results.push(...tracks.data.map(t => ({ ...t, type: 'track', source: 'deezer' })))
    if (artists.data) results.push(...artists.data.map(a => ({ ...a, type: 'artist', source: 'deezer' })))
    if (albums.data) results.push(...albums.data.map(a => ({ ...a, type: 'album', source: 'deezer' })))

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
          
          // Filtrar músicas do ano
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
          
          // Filtrar álbuns do ano
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
          
            // 🎤 ARTISTAS DO ANO
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
  // 🎵 TRACK
  if (item.type === 'track') {
    let subtitle = item.artist?.name || 'Artista desconhecido'

    if (item.ano) {
      const decada = item.decada || (Math.floor(item.ano / 10) * 10 + 's')
      subtitle += ` • ${item.ano} (${decada})`
    }

    return subtitle
  }

  // 🎤 ARTISTA
  if (item.type === 'artist') {
    let subtitle = `${this.formatFans(item.nb_fan)} fãs`

    if (item.ano) {
      const decada = item.decada || (Math.floor(item.ano / 10) * 10 + 's')
      subtitle += ` • ${item.ano} (${decada})`
    }

    return subtitle
  }

  // 💿 ÁLBUM
  if (item.type === 'album') {
    let subtitle = item.artist?.name || 'Artista desconhecido'

    if (item.ano) {
      const decada = item.decada || (Math.floor(item.ano / 10) * 10 + 's')
      subtitle += ` • ${item.ano} (${decada})`
    }

    return subtitle
  }

  // 👤 USUÁRIO
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

  // 🎼 GÊNERO
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
  if (item.source === 'local') {
    if (item.type === 'track') {
      return item.album?.cover || item.cover
    }
    if (item.type === 'artist') {
      return item.picture
    }
    if (item.type === 'album') {
      return item.cover
    }
    
    // ✅ USUÁRIO: Priorizar avatar
    if (item.type === 'user') {
      return item.picture || item.avatar || '/default-avatar.png'
    }
    
    if (item.type === 'genre') {
      return '/default-genre.png'
    }
  }
      // Deezer
      if (item.type === 'track') {
        return item.album?.cover_medium
      }
      if (item.type === 'artist') {
        return item.picture_medium
      }
      if (item.type === 'album') {
        return item.cover_medium
      }

      return ''
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
    
    // Se for um ano (4 dígitos entre 1900-2100), buscar por ano
    if (/^\d{4}$/.test(query)) {
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
      
      // Se for um ano (4 dígitos entre 1900-2100), buscar por ano
      if (/^\d{4}$/.test(query)) {
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
      
      // Save to history
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
      // Converter para formato do player
      const playerSong = this.convertToPlayerFormat(track)
      
      // Disparar evento global
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

/* Header */
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

/* History */
.history-wrapper {
  position: relative;
}

.history-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #b3b3b3;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.history-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: #1db954;
}

.history-badge {
  width: 20px;
  height: 20px;
  background: #1db954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #000;
  font-weight: 700;
}

.history-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 300px;
  background: #181818;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  overflow: hidden;
  z-index: 100;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.history-header span {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
}

.clear-btn {
  font-size: 12px;
  color: #1db954;
  background: none;
  border: none;
  cursor: pointer;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
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
.history-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.history-icon {
  color: #1db954;
  font-size: 12px;
}

/* Search Box */
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
/* ===== HISTÓRICO NO DROPDOWN DO INPUT ===== */

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

/* Animação suave */
.history-list-item {
  animation: fadeInLeft 0.2s ease forwards;
  animation-delay: calc(var(--i, 0) * 0.03s);
  opacity: 0;
}

.history-list-item:nth-child(1) { --i: 1; }
.history-list-item:nth-child(2) { --i: 2; }
.history-list-item:nth-child(3) { --i: 3; }
.history-list-item:nth-child(4) { --i: 4; }
.history-list-item:nth-child(5) { --i: 5; }

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Mobile: sempre mostrar botão de excluir */
@media (max-width: 768px) {
  .history-delete-btn {
    opacity: 1;
    color: #888;
  }
  
  .history-list-item {
    padding: 14px 16px;
  }
  
  .history-header-row {
    padding: 8px 16px 12px;
  }
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

/* Suggestions */
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

/* Suggested Section */
.suggested-section {
  padding: 20px;
}

.result-card.has-decade .result-type {
  background: linear-gradient(135deg, #1db954, #1ed760);
  color: #000;
  font-weight: 700;
}

.decade-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255,255,255,0.15);
  z-index: 2;
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

/* Grouped Results */
.grouped-results {
  padding: 16px 0;
}
/* ===== HISTÓRICO ABAIXO DO INPUT ===== */
.history-below-input {
  margin-top: 16px;
  background: rgba(24, 24, 24, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-below-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(29, 185, 84, 0.05);
}

.history-below-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #1db954;
}

.history-below-title i {
  font-size: 16px;
}

.clear-all-btn {
  font-size: 12px;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  font-weight: 600;
}

.clear-all-btn:hover {
  color: #ff4444;
}

.history-below-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 20px;
}

.history-below-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: all 0.2s;
  max-width: 100%;
}

.history-below-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(29, 185, 84, 0.5);
}

.history-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-text:hover {
  color: #1db954;
}

.history-icon {
  color: #888;
  font-size: 12px;
  flex-shrink: 0;
}

.delete-history-item {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #888;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.delete-history-item:hover {
  background: rgba(255, 68, 68, 0.8);
  color: #fff;
  transform: scale(1.1);
}

/* Responsivo */
@media (max-width: 768px) {
  .history-below-list {
    padding: 12px 16px;
  }
  
  .history-below-item {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .history-below-header {
    padding: 12px 16px;
  }
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

.item-thumb-placeholder.artista {
  background: rgba(29, 185, 84, 0.1);
  color: #1db954;
}

.item-thumb-placeholder.musica {
  background: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.item-thumb-placeholder.album {
  background: rgba(156, 39, 176, 0.1);
  color: #9C27B0;
}
/* ✅ ADICIONAR AQUI: */
.item-thumb-placeholder.usuario {
  background: rgba(29, 185, 84, 0.1);
  color: #1db954;
}

.item-thumb-placeholder.genero {
  background: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}
.item-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

/* Content */
.search-content {
  padding-bottom: 40px;
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

/* Discover Section */
.discover-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Quick Tags com Categorias Detalhadas */
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

/* Botão Categorias */
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

/* Dropdown de Categorias */
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

/* Tabs de Categorias */
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

/* Conteúdo das Categorias */
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

/* Tags Detalhadas */
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

/* Mood Grid Detalhado */
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

.mood-card-detailed i {
  font-size: 24px;
  color: #fff;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
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

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.activity-item:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.1);
  transform: translateX(4px);
}

.activity-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.activity-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.btn-star {
  color: #fbbf24 !important;
}

.btn-star:hover {
  background: rgba(251, 191, 36, 0.9) !important;
  color: #0a0a0f !important;
}

.btn-star.liked {
  background: rgba(251, 191, 36, 0.9) !important;
  color: #0a0a0f !important;
}

.activity-desc {
  font-size: 12px;
  color: #888;
}

.activity-arrow {
  color: #888;
  font-size: 12px;
  transition: all 0.2s;
}

.activity-item:hover .activity-arrow {
  color: #1db954;
  transform: translateX(4px);
}

/* Decade Timeline */
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

/* Tags Row (Explorar rápido) */
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

/* Transitions */
.dropdown-enter-active {
  animation: dropdownIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dropdown-leave-active {
  animation: dropdownOut 0.2s ease;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes dropdownOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
}

/* Discovery Grid */
.discovery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.discovery-card {
  background: #181818;
  border-radius: 8px;
  padding: 20px;
}

.card-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #888;
  margin-bottom: 16px;
}

/* Trend List */
.trend-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trend-item {
  padding: 12px 16px;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.trend-item:hover {
  transform: translateX(4px);
  filter: brightness(1.1);
}

/* Genre Cloud */
.genre-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-pill {
  padding: 8px 14px;
  border-radius: 16px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.genre-pill:hover {
  transform: scale(1.05);
  filter: brightness(1.2);
}

/* Mood Grid */
.mood-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.mood-item {
  aspect-ratio: 16/9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.mood-item:hover {
  transform: scale(1.02);
}

/* Top Section */
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

/* Top Tracks */
.top-tracks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.track-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 6px;
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
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.track-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #888;
  font-size: 16px;
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
  width: 36px;
  height: 36px;
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

/* Artists Row */
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

/* Search Results */
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

/* No Results */
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

/* Results Grid */
.results-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.result-card {
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.result-card:hover {
  transform: translateY(-4px);
}

.result-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.result-card:hover .result-image img {
  transform: scale(1.05);
}

.result-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.result-card:hover .result-overlay {
  opacity: 1;
}

.result-overlay i {
  font-size: 32px;
  color: #1db954;
}

.result-type {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0,0,0,0.7);
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1db954;
  font-weight: 700;
}

/* Botão de curtir no resultado da busca */
.btn-like-result {
  position: absolute;
  bottom: 50px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  opacity: 0;
  z-index: 10;
}

.result-card:hover .btn-like-result {
  opacity: 1;
}

.btn-like-result:hover {
  background: rgba(236, 72, 153, 0.9);
  color: #fff;
  transform: scale(1.1);
}

.btn-like-result.liked {
  opacity: 1;
  background: rgba(236, 72, 153, 0.9);
  color: #fff;
  animation: heartBeat 0.3s ease;
}

.result-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-info p {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
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

/* Animações de transição Vue */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 1200px) {
  .results-grid {
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
  
  .discovery-grid {
    grid-template-columns: 1fr;
  }
  
  .results-grid {
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
  
  .results-grid {
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
  
  /* Mostrar botão de curtir em mobile */
  .btn-like-track,
  .btn-like-result {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .search-box {
    padding: 12px 16px;
  }
  
  .search-box input {
    font-size: 16px;
  }
  
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .result-info h4 {
    font-size: 12px;
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
}
</style>