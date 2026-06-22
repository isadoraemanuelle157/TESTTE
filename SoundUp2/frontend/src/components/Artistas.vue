<template>
  <section class="section artists-section" v-if="artists.length > 0">
    <div class="section-header">
      <div class="section-title-wrapper">
        <h2 class="section-title">
          <i class="fa fa-users section-icon artist"></i>
          Artistas em Alta
        </h2>
        <span class="section-subtitle">{{ subtitle }}</span>
      </div>
      <button class="see-all" @click="openAllArtists">
        Ver todos <i class="fa fa-chevron-right"></i>
      </button>
    </div>


    <!-- Error State -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadArtists" class="retry-btn">Tentar novamente</button>
    </div>


    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <div class="toast-icon-wrapper">
          <i :class="toastIcon"></i>
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


    <div v-if="artists.length && !error" class="carousel-container">
      <button
        v-if="showLeft"
        class="nav-btn prev"
        @click="scroll(-320)"
        aria-label="Anterior"
      >
        <i class="fa fa-chevron-left"></i>
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
              <i class="fa" :class="isFollowing(artist.id) ? 'fa-check' : 'fa-plus'"></i>
            </button>
          </div>


          <div class="artist-info">
            <h3 class="artist-name">{{ artist.name }}</h3>
            <div class="monthly-listeners">
              <span class="listeners-count">{{ formatListeners(getArtistFans(artist)) }}</span>
              <span class="listeners-label">fãs</span>
            </div>
            <button
              class="follow-btn"
              :class="{ 'following': isFollowing(artist.id) }"
              @click.stop="toggleFollow(artist)"
            >
              <span class="btn-text">{{ isFollowing(artist.id) ? 'Seguindo' : 'Seguir' }}</span>
              <span class="btn-icon">
                <i class="fa" :class="isFollowing(artist.id) ? 'fa-check' : 'fa-plus'"></i>
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
        <i class="fa fa-chevron-right"></i>
      </button>
    </div>


    <!-- ===== MODAL TODOS OS ARTISTAS - DESIGN PREMIUM ===== -->
    <transition name="modal">
      <div v-if="showAllModal" class="modal-overlay" @click.self="closeAllModal">
        <div class="modal-content">
          <!-- Header Premium -->
          <div class="modal-header">
            <div class="modal-header-bg"></div>
            <div class="modal-header-content">
              <div class="modal-title-section">
                <div class="modal-icon-wrapper">
                  <i class="fa fa-users"></i>
                </div>
                <div class="modal-title-text">
                  <h3>Todos os Artistas</h3>
                  <p>{{ artists.length }} artistas disponíveis</p>
                </div>
              </div>
              <button @click="closeAllModal" class="close-btn">
                <i class="fa fa-times"></i>
              </button>
            </div>
          </div>


          <!-- Search & Filter Bar -->
          <div class="modal-toolbar">
            <div class="search-box">
              <i class="fa fa-search"></i>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Buscar artista..."
                @input="filterArtists"
              />
              <button v-if="searchQuery" @click="searchQuery = ''; filterArtists()" class="clear-search">
                <i class="fa fa-times-circle"></i>
              </button>
            </div>
            <div class="filter-tabs">
              <button
                v-for="tab in filterTabs"
                :key="tab.value"
                :class="{ active: activeFilter === tab.value }"
                @click="activeFilter = tab.value; filterArtists()"
              >
                <i :class="tab.icon"></i>
                {{ tab.label }}
              </button>
            </div>
          </div>


          <!-- Artists Grid -->
          <div class="modal-body">
            <div v-if="filteredArtists.length === 0" class="empty-state">
              <div class="empty-icon">
                <i class="fa fa-search"></i>
              </div>
              <h4>Nenhum artista encontrado</h4>
              <p>Tente buscar com outro termo</p>
            </div>


            <div v-else class="artists-grid">
              <div
                v-for="(artist, index) in filteredArtists"
                :key="artist.id"
                class="grid-item"
                @click="goToArtist(artist)"
                :style="{ animationDelay: index * 0.05 + 's' }"
              >
                <div class="grid-image-wrapper">
                  <div class="grid-image">
                    <img :src="artist.picture_big || artist.picture_medium || artist.picture" :alt="artist.name" @error="handleImageError">
                  </div>
                  <div class="grid-source-badge" :class="artist.source">
                    <i v-if="artist.source === 'db'" class="fa fa-database"></i>
                    <i v-else-if="artist.source === 'deezer'" class="fa fa-headphones"></i>
                    <i v-else-if="artist.source === 'spotify'" class="fa fa-spotify"></i>
                  </div>
                  <div class="grid-overlay">
                    <button class="grid-play-btn">
                      <i class="fa fa-play"></i>
                    </button>
                  </div>
                </div>
                <div class="grid-info">
                  <h4 class="grid-name">{{ artist.name }}</h4>
                  <p class="grid-genre">{{ getArtistGenre(artist) }}</p>
                  <div class="grid-stats">
                    <span class="grid-fans">
                      <i class="fa fa-heart"></i>
                     {{ formatListeners(getArtistFans(artist)) }}
                    </span>
                  </div>
                </div>
                <button
                  class="grid-follow-btn"
                  :class="{ 'following': isFollowing(artist.id) }"
                  @click.stop="toggleFollow(artist)"
                >
                  <i :class="isFollowing(artist.id) ? 'fa fa-check' : 'fa fa-plus'"></i>
                  <span>{{ isFollowing(artist.id) ? 'Seguindo' : 'Seguir' }}</span>
                </button>
              </div>
            </div>
          </div>


          <!-- Modal Footer -->
          <div class="modal-footer">
            <div class="footer-stats">
              <span><i class="fa fa-music"></i> {{ artists.length }} artistas</span>
              <span v-if="followedArtists.length > 0">
                <i class="fa fa-heart"></i> {{ followedArtists.length }} seguindo
              </span>
            </div>
            <button class="footer-close" @click="closeAllModal">
              <i class="fa fa-times"></i> Fechar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>


<script>
export default {
  name: "Artistas",


  data() {
    return {
      showLeft: false,
      showRight: true,
      showAllModal: false,
      isLoading: false,
      error: null,
      subtitle: 'Os maiores nomes da música brasileira hoje',
      toast: {
        show: false,
        title: '',
        message: '',
        type: 'success',
        icon: 'fa fa-check-circle',
        progress: 100,
        timeout: null
      },
      artists: [],
      followedArtists: [],
      // Modal filter
      searchQuery: '',
      activeFilter: 'all',
      filteredArtists: [],
      filterTabs: [
        { value: 'all', label: 'Todos', icon: 'fa fa-th-large' },
        { value: 'db', label: 'Local', icon: 'fa fa-database' },
        { value: 'deezer', label: 'Deezer', icon: 'fa fa-headphones' }
      ],
      // API Configuration
      DEEZER_API: 'https://api.deezer.com',
      CORS_PROXY: 'https://corsproxy.io/?'
    };
  },


  computed: {
    toastIcon() {
      if (this.toast.type === 'success') return 'fa fa-check-circle';
      if (this.toast.type === 'error') return 'fa fa-exclamation-circle';
      return 'fa fa-info-circle';
    }
  },


async mounted() {
     localStorage.removeItem('artists_cache_spotify');
  localStorage.removeItem('artists_cache'); // 🔥 Força recarregar do zero


  const cached = localStorage.getItem('artists_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Se o cache não tiver original_nb_fan nos spotify, limpa
        const hasOldCache = parsed.some(a => a.source === 'spotify' && !a.original_nb_fan);
        if (hasOldCache) {
          console.log('🧹 Limpando cache antigo sem original_nb_fan');
          localStorage.removeItem('artists_cache');
          this.artists = [];
        } else {
          this.artists = parsed;
        }
      } catch {
        localStorage.removeItem('artists_cache');
      }
    }


    await this.loadFollowedArtists();
    this.loadArtists();


    window.addEventListener('resize', this.checkArrows);
  },


  beforeUnmount() {
    window.removeEventListener('resize', this.checkArrows);
    if (this.toast.timeout) {
      clearTimeout(this.toast.timeout);
    }
  },


  methods: {
    // ============ FILTER METHODS ============
    filterArtists() {
      let result = [...this.artists];
     
      // Filter by source
      if (this.activeFilter !== 'all') {
        result = result.filter(a => a.source === this.activeFilter);
      }
     
      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        result = result.filter(a =>
          a.name?.toLowerCase().includes(query) ||
          this.getArtistGenre(a)?.toLowerCase().includes(query)
        );
      }
     
      this.filteredArtists = result;
    },


    // ============ API DEEZER ============
    async loadCantoresFromDB() {
      try {
        const response = await fetch('http://localhost:3002/cantores');
        const data = await response.json();


        return data.map(cantor => ({
          id: cantor._id,
          name: cantor.nome,
          picture: cantor.foto || 'https://e-cdns-images.dzcdn.net/images/artist/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg',
          picture_medium: cantor.foto,
          picture_big: cantor.foto,
          nb_fan: cantor.totalSeguidores || 0,
          source: 'db',
          generos: cantor.generos || []
        }));
      } catch (error) {
        console.error('Erro ao buscar cantores do banco:', error);
        return [];
      }
    },


getArtistFans(artist) {
  const base = artist.original_nb_fan
    || artist.nb_fan
    || artist.fans
    || artist.nbFan
    || (artist.followers && typeof artist.followers === 'object' ? artist.followers.total : null)
    || artist.followers
    || 0;
  return Number(base) || 0;
},


    setFollowingState(artistId, shouldFollow) {
      const id = String(artistId);
      if (shouldFollow) {
        if (!this.followedArtists.includes(id)) {
          this.followedArtists = [...this.followedArtists, id];
        }
      } else {
        this.followedArtists = this.followedArtists.filter(item => String(item) !== id);
      }
    },


    updateArtistInList(artistId, newData = {}) {
      const id = String(artistId);
      this.artists = this.artists.map(artist =>
        String(artist.id) === id
          ? { ...artist, ...newData }
          : artist
      );
    },


updateFollowersCount(artist, isNowFollowing) {
  // 🔥 Só atualiza contagem local para artistas do DB
  if (artist.source !== 'db') {
    return; // Artistas Deezer: contagem vem da API, não altera localmente
  }


  const base = artist.original_nb_fan || artist.nb_fan || artist.fans || 0;
 
  const updated = isNowFollowing
    ? base + 1
    : Math.max(base - 1, 0);


  artist.nb_fan = updated;
  artist.fans = updated;
},


async getFollowersCount(artist) {
  try {
    // Só busca seguidores locais para artistas do DB (MongoDB _id)
    // Artistas Deezer têm ID numérico, não temos follows deles no backend
    if (artist.source !== 'db') {
      // Para Deezer, usa apenas o nb_fan da API
      if (!artist.original_nb_fan) {
        artist.original_nb_fan = artist.nb_fan || artist.fans || 0;
      }
      artist.nb_fan = artist.original_nb_fan;
      artist.fans = artist.original_nb_fan;
      return;
    }


    const res = await fetch(
      `http://localhost:3002/follows/seguidores/${artist.id}?tipo=cantor`
    );
    const data = await res.json();


    if (!artist.original_nb_fan) {
      artist.original_nb_fan = artist.nb_fan || artist.fans || 0;
    }


    const apiFollowers = artist.original_nb_fan;
    const localFollowers = Array.isArray(data) ? data.length : data.total || 0;
    const total = apiFollowers + localFollowers;


    artist.nb_fan = total;
    artist.fans = total;
    if (!artist.followers) artist.followers = {};
    artist.followers.total = total;


  } catch (error) {
    console.error('Erro seguidores:', error);
  }
},


async loadArtists() {
  this.error = null;
  this.isLoading = true;


  try {
    // ✅ APENAS Deezer + DB (sem Spotify)
    const [deezerRes, dbArtists] = await Promise.allSettled([
      fetch('http://localhost:3002/deezer/chart/0/artists?limit=10').then(r => r.json()),
      this.loadCantoresFromDB()
    ]);


    // Deezer direto do chart
    let deezerArtists = [];
    if (deezerRes.status === 'fulfilled' && deezerRes.value.data) {
   deezerArtists = deezerRes.value.data.map(a => ({
  id: a.id,
  name: a.name,
  picture: a.picture_medium || a.picture,
  picture_medium: a.picture_medium || a.picture,
  picture_big: a.picture_big || a.picture_medium || a.picture,
  // 🔥 Tenta múltiplos campos que a API pode retornar
  nb_fan: a.nb_fan || a.fans || a.nbFan || 0,
  source: 'deezer'
}));
    }


    const dbResult = dbArtists.status === 'fulfilled' ? dbArtists.value : [];


    // Junção + deduplica
    const all = [...dbResult, ...deezerArtists];
    const seen = new Set();
    this.artists = all.filter(a => {
      const key = a.name?.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });


    this.filteredArtists = [...this.artists];
    localStorage.setItem('artists_cache', JSON.stringify(this.artists));
    this.$nextTick(() => this.checkArrows());


  } catch (error) {
    console.error('Erro ao carregar artistas:', error);
    this.error = 'Erro ao carregar artistas.';
  } finally {
    this.isLoading = false;
  }
},
    normalizeMongoId(value) {
      if (!value) return null;
      if (typeof value === 'string') return value;
      if (typeof value === 'object') {
        return value._id ? String(value._id) : String(value);
      }
      return String(value);
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
      this.showRight = container.scrollLeft + container.clientWidth < container.scrollWidth - tolerance;
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
      if (artist.source === 'db') {
        return artist.generos?.map(g => g.nome).join(', ') || 'Artista Local';
      }
      if (artist.genres && artist.genres.length > 0) {
        return artist.genres[0].name;
      }
      return 'Música';
    },


    // ============ FOLLOW SYSTEM ============
   // ============ FOLLOW SYSTEM ============
async toggleFollow(artist) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      this.showToast('Faça login para seguir artistas', 'error');
      return;
    }


    const artistId = String(artist.id);
    const currentlyFollowing = this.isFollowing(artistId);


    const url = currentlyFollowing
      ? 'http://localhost:3002/follows/desseguir'
      : 'http://localhost:3002/follows/seguir';


    const method = currentlyFollowing ? 'DELETE' : 'POST';


    // ✅ CORRIGIDO: Body correto para artistas externos
    let body;
    if (artist.source === 'db') {
      // Artista local: manda o MongoDB _id direto
      body = { seguindo_id: artistId, tipo: 'cantor' };
    } else {
      // Artista externo: manda artistData para importar
 body = {
    tipo: 'cantor',
    artistData: {
      id: artist.id,
      name: artist.name,
      picture: artist.picture || artist.picture_medium,
      pictureMedium: artist.picture_medium,
      pictureBig: artist.picture_big,
      source: artist.source,  // 'deezer'
      nbFan: artist.nb_fan || 0
    }
  };
}
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      // ✅ CORRIGIDO: Usa o body correto (não hardcoded)
      body: JSON.stringify(body)
    });


    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao seguir');
    }


    this.setFollowingState(artistId, !currentlyFollowing);


    // ✅ CORRIGIDO: Atualiza contagem se seguiu
if (data.follow?.seguindo_id) {
  await this.getFollowersCount(artist);
}


    this.updateFollowersCount(artist, !currentlyFollowing);


    this.showToast(
      currentlyFollowing
        ? `Você deixou de seguir ${artist.name}`
        : `Agora você segue ${artist.name}`,
      currentlyFollowing ? 'info' : 'success'
    );


  } catch (error) {
    console.error(error);
    this.showToast(error.message, 'error');
  }
},


    isFollowing(artistId) {
      return this.followedArtists.some(id => String(id) === String(artistId));
    },


    showToast(message, type = 'success') {
      if (this.toast.timeout) {
        clearTimeout(this.toast.timeout);
      }


      this.toast.message = message;
      this.toast.type = type;
      this.toast.title = type === 'success' ? 'Sucesso' : type === 'error' ? 'Erro' : 'Info';
      this.toast.show = true;
      this.toast.progress = 100;


      const duration = 3000;
      const interval = 30;
      const step = 100 / (duration / interval);


      this.toast.timeout = setInterval(() => {
        this.toast.progress -= step;
        if (this.toast.progress <= 0) {
          this.hideToast();
        }
      }, interval);
    },


    hideToast() {
      if (this.toast.timeout) {
        clearInterval(this.toast.timeout);
        this.toast.timeout = null;
      }
      this.toast.show = false;
    },


    saveFollowedArtists() {
      localStorage.setItem('followedArtists', JSON.stringify(this.followedArtists));
    },


    async loadFollowedArtists() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          this.followedArtists = [];
          return;
        }


        const res = await fetch(
          'http://localhost:3002/follows/usuario/seguindo?tipo=cantor',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );


        const data = await res.json();
        this.followedArtists = data.map(f =>
          String(f.seguindo_id?._id || f.seguindo_id)
        );
      } catch (error) {
        console.error('Erro ao carregar seguindo:', error);
        this.followedArtists = [];
      }
    },


    // ============ NAVIGATION ============
    goToArtist(artist) {
      this.closeAllModal();
      this.$router.push({
        name: 'DetalheCantor',
        params: { id: artist.id },
        query: { source: artist.source }
      });
    },


    openAllArtists() {
      this.showAllModal = true;
      this.searchQuery = '';
      this.activeFilter = 'all';
      this.filteredArtists = [...this.artists];
      document.body.style.overflow = 'hidden';
    },


    closeAllModal() {
      this.showAllModal = false;
      document.body.style.overflow = '';
    },


    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzE4MTgxOCIvPjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJpzwvdGV4dD48L3N2Zz4=';
    }
  }
};
</script>


<style scoped>
/* ========== SECTION INTEGRATION ========== */
.artists-section {
  margin-bottom: 48px;
  animation: slideIn 0.6s ease-out;
}


/* ========== SEE ALL BUTTON ========== */
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
  font-family: inherit;
  margin-left: auto;
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


/* ========== CAROUSEL ========== */
.carousel-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
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


/* ========== ARTIST CARD ========== */
.artist-card {
  flex: 0 0 auto;
  width: 200px;
  scroll-snap-align: start;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(24, 24, 24, 0.6);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
}


.artist-card:hover {
  transform: translateY(-8px);
  background: rgba(40, 40, 40, 0.8);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}


.image-wrapper {
  position: relative;
  margin-bottom: 16px;
}


.image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
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


/* Source Badge */
.source-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


.source-badge.db { background: #6366f1; }
.source-badge.deezer { background: #ff6600; }
.source-badge.spotify { background: #1db954; }


/* Follow Button Float */
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
  font-size: 18px;
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


/* Artist Info */
.artist-info {
  text-align: center;
}


.artist-name {
  font-size: 15px;
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
  font-size: 13px;
  color: #b3b3b3;
  margin: 0 0 10px 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  color: #666;
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
  font-size: 14px;
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
  font-size: 20px;
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
  left: -24px;
}


.nav-btn.next {
  right: -24px;
}


/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #888;
}


.retry-btn {
  padding: 10px 20px;
  background: #1DB954;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}


.retry-btn:hover {
  background: #1ed760;
  transform: scale(1.05);
}


/* ========== TOAST NOTIFICATION ========== */
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
  font-size: 14px;
}


.toast-close:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
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


/* ========== MODAL PREMIUM ========== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}


@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}


.modal-content {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
  animation: modalSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
}


@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


/* Modal Header Premium */
.modal-header {
  position: relative;
  padding: 0;
  overflow: hidden;
  flex-shrink: 0;
}


.modal-header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  opacity: 0.15;
  filter: blur(40px);
}


.modal-header-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  z-index: 1;
}


.modal-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}


.modal-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  box-shadow: 0 8px 24px rgba(29, 185, 84, 0.3);
}


.modal-title-text h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}


.modal-title-text p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  font-weight: 500;
}


.close-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.1);
  color: #b3b3b3;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 18px;
  backdrop-filter: blur(10px);
}


.close-btn:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
  transform: rotate(90deg) scale(1.1);
  border-color: rgba(255,255,255,0.3);
}


/* Modal Toolbar */
.modal-toolbar {
  padding: 0 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}


.search-box {
  position: relative;
  display: flex;
  align-items: center;
}


.search-box i.fa-search {
  position: absolute;
  left: 16px;
  color: rgba(255,255,255,0.5);
  font-size: 16px;
}


.search-box input {
  width: 100%;
  padding: 14px 44px 14px 44px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
  outline: none;
}


.search-box input::placeholder {
  color: rgba(255,255,255,0.4);
}


.search-box input:focus {
  background: rgba(255,255,255,0.08);
  border-color: rgba(29, 185, 84, 0.5);
  box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.1);
}


.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}


.clear-search:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}


/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}


.filter-tabs::-webkit-scrollbar {
  height: 0;
}


.filter-tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  white-space: nowrap;
}


.filter-tabs button:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
  color: #fff;
}


.filter-tabs button.active {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  border-color: transparent;
  color: #000;
  box-shadow: 0 4px 16px rgba(29, 185, 84, 0.3);
}


.filter-tabs button i {
  font-size: 14px;
}


/* Modal Body */
.modal-body {
  overflow-y: auto;
  padding: 0 32px 20px;
  flex: 1;
}


.modal-body::-webkit-scrollbar {
  width: 8px;
}


.modal-body::-webkit-scrollbar-track {
  background: transparent;
}


.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 4px;
}


.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.25);
}


/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}


.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 32px;
  color: rgba(255,255,255,0.3);
}


.empty-state h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}


.empty-state p {
  margin: 0;
  font-size: 14px;
  color: rgba(255,255,255,0.5);
}


/* Artists Grid */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}


.grid-item {
  background: rgba(255,255,255,0.03);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255,255,255,0.05);
  animation: gridItemIn 0.4s ease backwards;
}


@keyframes gridItemIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}


.grid-item:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.1);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.3);
}


.grid-image-wrapper {
  position: relative;
  margin-bottom: 14px;
}


.grid-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}


.grid-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}


.grid-item:hover .grid-image img {
  transform: scale(1.08);
}


.grid-source-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}


.grid-source-badge.db { background: #6366f1; }
.grid-source-badge.deezer { background: #ff6600; }


.grid-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}


.grid-item:hover .grid-overlay {
  opacity: 1;
}


.grid-play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1db954;
  border: none;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(29, 185, 84, 0.4);
  transform: scale(0.8);
}


.grid-item:hover .grid-play-btn {
  transform: scale(1);
}


.grid-play-btn:hover {
  transform: scale(1.1) !important;
  background: #1ed760;
}


/* Grid Info */
.grid-info {
  text-align: center;
  margin-bottom: 12px;
}


.grid-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.grid-genre {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.grid-stats {
  display: flex;
  justify-content: center;
  gap: 12px;
}


.grid-fans {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  display: flex;
  align-items: center;
  gap: 4px;
}


.grid-fans i {
  color: #ff6b6b;
  font-size: 10px;
}


/* Grid Follow Button */
.grid-follow-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 12px;
  border: 1.5px solid rgba(255,255,255,0.15);
  background: transparent;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}


.grid-follow-btn:hover {
  border-color: rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.05);
}


.grid-follow-btn.following {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  border-color: transparent;
  color: #000;
}


.grid-follow-btn.following:hover {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
}


/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-top: 1px solid rgba(255,255,255,0.05);
  background: rgba(0,0,0,0.2);
  flex-shrink: 0;
}


.footer-stats {
  display: flex;
  gap: 20px;
}


.footer-stats span {
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  display: flex;
  align-items: center;
  gap: 6px;
}


.footer-stats i {
  color: #1db954;
}


.footer-close {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.8);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}


.footer-close:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.25);
  color: #fff;
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
  transform: translateY(40px) scale(0.95);
  opacity: 0;
}


/* ========== RESPONSIVE ========== */
@media (max-width: 1200px) {
  .carousel-container {
    padding: 0 16px;
  }


  .nav-btn.prev {
    left: 0;
  }


  .nav-btn.next {
    right: 0;
  }
}


@media (max-width: 768px) {
  .artist-card {
    width: 160px;
    padding: 12px;
  }


  .nav-btn {
    display: none;
  }


  .artists-track {
    gap: 16px;
    padding: 16px 0 32px;
  }


  .follow-btn {
    padding: 8px 16px;
    font-size: 11px;
    min-width: 100px;
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


  /* Modal Mobile */
  .modal-content {
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
    margin: auto 0 0 0;
  }


  .modal-header-content {
    padding: 20px 20px;
  }


  .modal-title-text h3 {
    font-size: 20px;
  }


  .modal-icon-wrapper {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }


  .modal-toolbar {
    padding: 0 20px 16px;
  }


  .modal-body {
    padding: 0 20px 16px;
  }


  .artists-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }


  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
  }


  .footer-stats {
    gap: 16px;
  }


  .footer-close {
    width: 100%;
    justify-content: center;
  }
}


@media (max-width: 480px) {
  .artist-card {
    width: 140px;
  }


  .modal-content {
    border-radius: 16px 16px 0 0;
  }


  .follow-btn-float {
    width: 36px;
    height: 36px;
    bottom: 4px;
    right: 4px;
    font-size: 14px;
  }


  .artists-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }


  .grid-item {
    padding: 12px;
    border-radius: 12px;
  }


  .grid-play-btn {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
}
</style>