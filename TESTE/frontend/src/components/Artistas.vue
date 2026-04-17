<template>
  <section class="artists-section">
    <div class="section-header">
      <div class="header-content">
        <h2 class="section-title">Artistas em Alta</h2>
        <p class="section-subtitle">{{ subtitle }}</p>
      </div>
      <button @click="openAllArtists" class="view-all-btn">
        Ver todos
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Carregando artistas...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadArtists" class="retry-btn">Tentar novamente</button>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </div>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </Transition>

    <div v-if="!isLoading && !error" class="carousel-container">
      <button
        v-if="showLeft"
        class="nav-btn prev"
        @click="scroll(-320)"
        aria-label="Anterior"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      <div class="artists-track" ref="scrollContainer" @scroll="checkArrows">
        <article
          v-for="artist in artists"
          :key="artist.id"
          class="artist-card"
          @click="goToArtist(artist)"
        >
          <div class="image-wrapper">
            <div class="image-container">
              <img 
                :src="artist.picture_big || artist.picture_medium || artist.picture" 
                :alt="artist.name"
                loading="lazy"
                @error="handleImageError"
              />
            </div>
            <button 
              class="follow-btn-float"
              :class="{ 'following': isFollowing(artist.id) }"
              @click.stop="toggleFollow(artist)"
            >
              <svg v-if="!isFollowing(artist.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </button>
          </div>
          
          <div class="artist-info">
            <h3 class="artist-name">{{ artist.name }}</h3>
            <p class="artist-genre">{{ getArtistGenre(artist) }}</p>
            <div class="monthly-listeners">
              <span class="listeners-count">{{ formatListeners(artist.nb_fan || artist.fans) }}</span>
              <span class="listeners-label">fãs</span>
            </div>
            <button 
              class="follow-btn"
              :class="{ 'following': isFollowing(artist.id) }"
              @click.stop="toggleFollow(artist)"
            >
              <span class="btn-text">{{ isFollowing(artist.id) ? 'Seguindo' : 'Seguir' }}</span>
              <span class="btn-icon">
                <svg v-if="!isFollowing(artist.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </span>
            </button>
          </div>
        </article>
      </div>

      <button
        v-if="showRight"
        class="nav-btn next"
        @click="scroll(320)"
        aria-label="Próximo"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>

    <!-- Modal Todos os Artistas -->
    <Transition name="modal">
      <div v-if="showAllModal" class="modal-overlay" @click.self="closeAllModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Todos os Artistas</h3>
            <button @click="closeAllModal" class="close-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="artists-list">
              <div
                v-for="artist in artists"
                :key="artist.id"
                class="list-item"
                @click="goToArtistFromModal(artist)"
              >
                <div class="list-image">
                  <img :src="artist.picture_medium || artist.picture" :alt="artist.name" @error="handleImageError">
                </div>
                <div class="list-info">
                  <h4>{{ artist.name }}</h4>
                  <p>{{ getArtistGenre(artist) }} • {{ formatListeners(artist.nb_fan || artist.fans) }} fãs</p>
                </div>
                <button 
                  class="list-follow-btn"
                  :class="{ 'following': isFollowing(artist.id) }"
                  @click.stop="toggleFollow(artist)"
                >
                  <span>{{ isFollowing(artist.id) ? 'Seguindo' : 'Seguir' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script>
export default {
  name: "TopArtists",
  
  data() {
    return {
      showLeft: false,
      showRight: true,
      showAllModal: false,
      isLoading: true,
      error: null,
      subtitle: 'Os maiores nomes da música global',
      toast: {
        show: false,
        message: '',
        type: 'success',
        timeout: null
      },
      artists: [],
      followedArtists: [],
      // API Configuration
      DEEZER_API: 'https://api.deezer.com',
      CORS_PROXY: 'https://corsproxy.io/?'
    };
  },

async mounted() {
  await this.loadFollowedArtists()
  await this.loadArtists()
  window.addEventListener('resize', this.checkArrows)
  window.dispatchEvent(new Event('artists-updated'))
},

  beforeUnmount() {
    window.removeEventListener('resize', this.checkArrows);
    if (this.toast.timeout) {
      clearTimeout(this.toast.timeout);
    }
  },

  methods: {
    // ============ API DEEZER ============
    async loadCantoresFromDB() {
  try {
    const response = await fetch('http://localhost:3002/cantores')
    const data = await response.json()

    // converter para formato parecido com Deezer
    return data.map(cantor => ({
      id: cantor._id,
      name: cantor.nome,
      picture: cantor.foto || 'https://e-cdns-images.dzcdn.net/images/artist/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg',
      picture_medium: cantor.foto,
      picture_big: cantor.foto,
      nb_fan: cantor.totalSeguidores || 0,
      source: 'db', // 🔥 importante para diferenciar
      generos: cantor.generos || []
    }))

  } catch (error) {
    console.error('Erro ao buscar cantores do banco:', error)
    return []
  }
},

setFollowingState(artistId, shouldFollow) {
  const id = String(artistId)

  if (shouldFollow) {
    if (!this.followedArtists.includes(id)) {
      this.followedArtists = [...this.followedArtists, id]
    }
  } else {
    this.followedArtists = this.followedArtists.filter(item => String(item) !== id)
  }
},

updateArtistInList(artistId, newData = {}) {
  const id = String(artistId)
  this.artists = this.artists.map(artist =>
    String(artist.id) === id
      ? { ...artist, ...newData }
      : artist
  )
},

updateFollowersCount(artist, isNowFollowing) {
  if (!artist.nb_fan) artist.nb_fan = 0;

  if (isNowFollowing) {
    artist.nb_fan++;
  } else {
    artist.nb_fan = Math.max(0, artist.nb_fan - 1);
  }
},

async getFollowersCount(artist) {
  try {
    const res = await fetch(
      `http://localhost:3002/follows/seguidores/${artist.id}?tipo=cantor`
    )

    const data = await res.json()
    artist.nb_fan = data.length

  } catch (error) {
    console.error(error)
  }
},
   async loadArtists() {
  this.isLoading = true;
  this.error = null;

  try {
    // 🔥 1. Deezer
    const deezerResponse = await fetch(`${this.CORS_PROXY}${this.DEEZER_API}/chart/0/artists?limit=10`);
    const deezerData = await deezerResponse.json();

    let deezerArtists = []
    if (deezerData.data) {
      deezerArtists = await this.enrichArtistsData(deezerData.data)
    }

    // 🔥 2. Banco
    const dbArtists = await this.loadCantoresFromDB()

    // 🔥 3. JUNTAR OS DOIS
    this.artists = [...dbArtists, ...deezerArtists]

    this.subtitle = `Artistas do sistema + Top globais`

    this.$nextTick(() => {
      this.checkArrows()
    })

  } catch (error) {
    console.error('Erro geral:', error)
    this.error = 'Erro ao carregar artistas'
  } finally {
    this.isLoading = false
  }
},
normalizeMongoId(value) {
  if (!value) return null

  if (typeof value === 'string') return value

  if (typeof value === 'object') {
    return value._id ? String(value._id) : String(value)
  }

  return String(value)
},
    
    async loadGenreArtists() {
      // Fallback: buscar artistas de gêneros populares
      try {
        const genres = [132, 116, 152, 113]; // Pop, Rap/Hip Hop, Rock, Dance
        const randomGenre = genres[Math.floor(Math.random() * genres.length)];
        
        const response = await fetch(`${this.CORS_PROXY}${this.DEEZER_API}/genre/${randomGenre}/artists?limit=15`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          this.artists = data.data;
          this.subtitle = 'Artistas populares do momento';
          this.error = null;
        }
      } catch (fallbackError) {
        console.error('Fallback também falhou:', fallbackError);
      }
    },
    
    async enrichArtistsData(artists) {
      // Buscar informações detalhadas de cada artista (opcional, pode ser otimizado)
      const enriched = [];
      
      for (const artist of artists.slice(0, 12)) { // Limitar a 12 para não sobrecarregar
        try {
          // Buscar detalhes do artista
          const detailsResponse = await fetch(`${this.CORS_PROXY}${this.DEEZER_API}/artist/${artist.id}`);
          const details = await detailsResponse.json();
          
          enriched.push({
            ...artist,
            nb_fan: details.nb_fan || artist.nb_fan,
            picture_big: details.picture_big || artist.picture_big,
            picture_medium: details.picture_medium || artist.picture_medium
          });
        } catch (e) {
          // Se falhar, usar dados básicos
          enriched.push(artist);
        }
      }
      
      return enriched;
    },
    
    async searchArtists(query) {
      // Método para buscar artistas específicos
      if (!query || query.length < 2) return;
      
      this.isLoading = true;
      
      try {
        const response = await fetch(
          `${this.CORS_PROXY}${this.DEEZER_API}/search/artist?q=${encodeURIComponent(query)}&limit=10`
        );
        const data = await response.json();
        
        if (data.data) {
          this.artists = data.data;
          this.subtitle = `Resultados para "${query}"`;
        }
      } catch (error) {
        console.error('Erro na busca:', error);
      } finally {
        this.isLoading = false;
      }
    },

    // ============ UI METHODS ============
    
    scroll(amount) {
      const container = this.$refs.scrollContainer;
      container.scrollBy({ left: amount, behavior: "smooth" });
      setTimeout(this.checkArrows, 350);
    },

    checkArrows() {
      const container = this.$refs.scrollContainer;
      if (!container) return;
      
      const tolerance = 5;
      this.showLeft = container.scrollLeft > tolerance;
      this.showRight = 
        container.scrollLeft + container.clientWidth < container.scrollWidth - tolerance;
    },

    formatListeners(num) {
      if (!num) return '0';
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'K';
      }
      return num.toString();
    },
    
    getArtistGenre(artist) {
  // 🔥 se vier do banco
  if (artist.source === 'db') {
    return artist.generos?.map(g => g.nome).join(', ') || 'Artista Local'
  }

  // Deezer (fallback atual)
  if (artist.genres && artist.genres.length > 0) {
    return artist.genres[0].name;
  }

  return 'Música';
},

    // ============ FOLLOW SYSTEM ============
    
 async toggleFollow(artist) {
  try {
    const token = localStorage.getItem("token")

    if (!token) {
      this.showToast('Faça login para seguir artistas', 'error')
      return
    }

    if (artist.source !== 'db') {
      this.showToast('Só é possível seguir artistas do sistema', 'info')
      return
    }

    const artistId = String(artist.id)
    const currentlyFollowing = this.isFollowing(artistId)

    const url = currentlyFollowing
      ? 'http://localhost:3002/follows/desseguir'
      : 'http://localhost:3002/follows/seguir'

    const method = currentlyFollowing ? 'DELETE' : 'POST'

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

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao seguir')
    }

    // 🔥 ATUALIZA FRONT NA HORA (IMPORTANTE)
    this.setFollowingState(artistId, !currentlyFollowing)

    // 🔥 atualiza contador visual (opcional)
    this.updateFollowersCount(artist, !currentlyFollowing)

    this.showToast(
      currentlyFollowing
        ? `Você deixou de seguir ${artist.name}`
        : `Agora você segue ${artist.name}`,
      currentlyFollowing ? 'info' : 'success'
    )

  } catch (error) {
    console.error(error)
    this.showToast(error.message, 'error')
  }
},

isFollowing(artistId) {
  return this.followedArtists.some(id => String(id) === String(artistId))
},

    showToast(message, type = 'success') {
      if (this.toast.timeout) {
        clearTimeout(this.toast.timeout);
      }
      
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;
      
      this.toast.timeout = setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },

 saveFollowedArtists() {
  localStorage.setItem('followedArtists', JSON.stringify(this.followedArtists))
},

async loadFollowedArtists() {
  try {
    const token = localStorage.getItem("token")

    if (!token) {
      this.followedArtists = []
      return
    }

    const res = await fetch(
      'http://localhost:3002/follows/usuario/seguindo?tipo=cantor',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await res.json()

    // 🔥 agora vem da tabela Follow
    this.followedArtists = data.map(f => 
      String(f.seguindo_id?._id || f.seguindo_id)
    )

  } catch (error) {
    console.error('Erro ao carregar seguindo:', error)
    this.followedArtists = []
  }
},
    // ============ NAVIGATION ============
    
    goToArtist(artist) {
  if (artist.source === 'db') {
    // 👉 rota interna
    this.$router?.push(`/cantor/${artist.id}`)
  } else {
    // 👉 Deezer
    window.open(`https://www.deezer.com/artist/${artist.id}`, '_blank')
  }
},

    goToArtistFromModal(artist) {
      this.closeAllModal();
      setTimeout(() => {
        this.goToArtist(artist);
      }, 300);
    },

    openAllArtists() {
      this.showAllModal = true;
      document.body.style.overflow = 'hidden';
    },

    closeAllModal() {
      this.showAllModal = false;
      document.body.style.overflow = '';
    },

    handleImageError(e) {
      e.target.src = 'https://e-cdns-images.dzcdn.net/images/artist/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg';
    }
  }
};
</script>

<style scoped>
.artists-section {
  padding: 40px 0;
  background: linear-gradient(180deg, #0a0a0a 0%, #121212 100%);
  position: relative;
  overflow: hidden;
}

.artists-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}

/* Loading & Error States */
.loading-state,
.error-state {
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

.retry-btn {
  padding: 10px 20px;
  background: #1DB954;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
}

.retry-btn:hover {
  background: #1ed760;
}

.section-header {
  max-width: 1400px;
  margin: 0 auto 32px;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #b3b3b3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-subtitle {
  font-size: 16px;
  color: #a7a7a7;
  margin: 0;
  font-weight: 500;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #b3b3b3;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-family: inherit;
}

.view-all-btn:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
  transform: translateX(4px);
}

.view-all-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.view-all-btn:hover svg {
  transform: translateX(4px);
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  backdrop-filter: blur(20px);
  min-width: 280px;
  justify-content: center;
}

.toast-notification.success {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: #fff;
}

.toast-notification.info {
  background: linear-gradient(135deg, #535353 0%, #6a6a6a 100%);
  color: #fff;
}

.toast-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  flex-shrink: 0;
}

.toast-icon svg {
  width: 16px;
  height: 16px;
}

.toast-message {
  white-space: nowrap;
}

/* Toast Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.95);
}

/* Carousel Container */
.carousel-container {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
}

.artists-track {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 20px 0 40px;
  -webkit-overflow-scrolling: touch;
}

.artists-track::-webkit-scrollbar {
  height: 4px;
}

.artists-track::-webkit-scrollbar-track {
  background: transparent;
}

.artists-track::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
}

/* Artist Card */
.artist-card {
  flex: 0 0 auto;
  width: 200px;
  scroll-snap-align: start;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.artist-card:hover {
  transform: translateY(-8px);
}

.image-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.image-container {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.artist-card:hover .image-container {
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  transform: scale(1.02);
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.artist-card:hover .image-container img {
  transform: scale(1.08);
}

/* Follow Button Float (imagem) */
.follow-btn-float {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #1db954;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.4);
  z-index: 5;
}

.follow-btn-float.following {
  opacity: 1;
  transform: scale(1);
  background: #fff;
  color: #1db954;
}

.artist-card:hover .follow-btn-float {
  opacity: 1;
  transform: scale(1);
}

.follow-btn-float:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 20px rgba(29, 185, 84, 0.6);
}

.follow-btn-float.following:hover {
  background: #ff6b6b;
  color: #fff;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.follow-btn-float svg {
  width: 20px;
  height: 20px;
}

.artist-info {
  text-align: center;
}

.artist-name {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.3px;
  transition: color 0.3s ease;
}

.artist-card:hover .artist-name {
  color: #1db954;
}

.artist-genre {
  font-size: 14px;
  color: #a7a7a7;
  margin: 0 0 10px 0;
  font-weight: 500;
}

.monthly-listeners {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-bottom: 12px;
}

.listeners-count {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.listeners-label {
  font-size: 12px;
  color: #6a6a6a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Follow Button Principal */
.follow-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(255,255,255,0.3);
  background: transparent;
  color: #fff;
  font-family: inherit;
  min-width: 120px;
}

.follow-btn:hover {
  border-color: #fff;
  background: rgba(255,255,255,0.1);
  transform: scale(1.05);
}

.follow-btn.following {
  background: #1db954;
  border-color: #1db954;
  color: #fff;
}

.follow-btn.following:hover {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: #fff;
}

.follow-btn:active {
  transform: scale(0.95);
}

.btn-text {
  transition: all 0.3s ease;
}

.btn-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}

/* Navigation Buttons */
.nav-btn {
  position: absolute;
  top: 100px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: scale(0.8);
}

.carousel-container:hover .nav-btn {
  opacity: 1;
  transform: scale(1);
}

.nav-btn:hover {
  background: rgba(40,40,40,0.9);
  transform: scale(1.1) !important;
  border-color: rgba(255,255,255,0.2);
}

.nav-btn:active {
  transform: scale(0.95) !important;
}

.nav-btn.prev {
  left: 8px;
}

.nav-btn.next {
  right: 8px;
}

.nav-btn svg {
  width: 24px;
  height: 24px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: #181818;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
  animation: modalSlide 0.3s ease;
}

@keyframes modalSlide {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  background: linear-gradient(180deg, #1f1f1f 0%, #181818 100%);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
  transform: rotate(90deg);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}

.artists-list {
  padding: 8px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.list-item:hover {
  background: rgba(255,255,255,0.05);
}

.list-item:active {
  transform: scale(0.98);
}

.list-image {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.list-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-info p {
  margin: 0;
  font-size: 13px;
  color: #a7a7a7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* List Follow Button */
.list-follow-btn {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255,255,255,0.3);
  background: transparent;
  color: #fff;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}

.list-follow-btn:hover {
  border-color: #fff;
  background: rgba(255,255,255,0.1);
}

.list-follow-btn.following {
  background: #1db954;
  border-color: #1db954;
  color: #fff;
}

.list-follow-btn.following:hover {
  background: #ff6b6b;
  border-color: #ff6b6b;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .carousel-container {
    padding: 0 24px;
  }
  
  .section-header {
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 24px;
  }
  
  .section-subtitle {
    font-size: 14px;
  }
  
  .artist-card {
    width: 160px;
  }
  
  .image-container {
    width: 160px;
    height: 160px;
  }
  
  .nav-btn {
    display: none;
  }
  
  .artists-track {
    gap: 16px;
    padding: 16px 0 32px;
  }
  
  .view-all-btn {
    font-size: 12px;
    padding: 6px 12px;
  }

  .modal-content {
    max-height: 90vh;
    margin: 20px;
  }

  .follow-btn {
    padding: 8px 16px;
    font-size: 11px;
    min-width: 100px;
  }

  .toast-notification {
    padding: 12px 20px;
    font-size: 13px;
    min-width: 240px;
  }
}

@media (max-width: 480px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .artist-card {
    width: 140px;
  }
  
  .image-container {
    width: 140px;
    height: 140px;
  }

  .modal-content {
    border-radius: 12px;
  }

  .follow-btn-float {
    width: 36px;
    height: 36px;
    bottom: 4px;
    right: 4px;
  }

  .follow-btn-float svg {
    width: 16px;
    height: 16px;
  }
}
</style>