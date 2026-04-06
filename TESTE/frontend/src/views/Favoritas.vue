<template>
  <div class="favoritas-page">
    <!-- Background Effects -->
    <div class="bg-effects"></div>
    <div class="grid-overlay"></div>
    
    <!-- Header -->
    <div class="header">
      <div class="header-top">
        <div class="header-title">
          <div class="header-icon">
            <!-- ÍCONE TOTAL: Coração + Onda Sonora -->
            <svg viewBox="0 0 24 24" fill="none" class="custom-icon">
              <defs>
                <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffffff"/>
                  <stop offset="100%" style="stop-color:#e0e7ff"/>
                </linearGradient>
              </defs>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                fill="url(#iconGradient)" opacity="0.9"/>
              <path d="M7 12h2v3H7zm3-2h2v5h-2zm3-1h2v6h-2zm3 2h2v3h-2z" 
                fill="#6366f1" opacity="0.8"/>
            </svg>
          </div>
          <div class="header-text">
            <h1>Minhas Favoritas</h1>
            <p class="header-subtitle">Suas músicas e playlists preferidas em um só lugar</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-header" @click="exportarFavoritas">
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <span>Exportar</span>
          </button>
          <button class="btn-header primary" @click="tocarTudo">
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Tocar Tudo</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar" v-if="!loading && favoritas.length > 0">
      <div class="stat-card">
        <div class="stat-icon total">
          <svg viewBox="0 0 24 24" fill="none" class="stat-svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                  fill="currentColor"/>
            <path d="M7 12h2v3H7zm3-2h2v5h-2zm3-1h2v6h-2zm3 2h2v3h-2z" 
                  fill="white" opacity="0.6"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ favoritas.length }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon music">
          <svg viewBox="0 0 24 24" fill="none" class="stat-svg">
            <defs>
              <linearGradient id="musicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#818cf8"/>
                <stop offset="100%" style="stop-color:#6366f1"/>
              </linearGradient>
            </defs>
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" 
                  fill="url(#musicGradient)"/>
            <path d="M8 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" 
                  fill="#818cf8" opacity="0.6"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ musicasCount }}</span>
          <span class="stat-label">Músicas</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon playlist">
          <svg viewBox="0 0 24 24" fill="none" class="stat-svg">
            <defs>
              <linearGradient id="playlistGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f472b6"/>
                <stop offset="100%" style="stop-color:#ec4899"/>
              </linearGradient>
            </defs>
            <rect x="3" y="6" width="18" height="2" rx="1" fill="url(#playlistGradient)"/>
            <rect x="3" y="11" width="14" height="2" rx="1" fill="url(#playlistGradient)" opacity="0.8"/>
            <rect x="3" y="16" width="10" height="2" rx="1" fill="url(#playlistGradient)" opacity="0.6"/>
            <circle cx="18" cy="17" r="4" fill="#ec4899"/>
            <path d="M17 16l2 1-2 1v-2z" fill="white"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ playlistsCount }}</span>
          <span class="stat-label">Playlists</span>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs" v-if="!loading && favoritas.length > 0">
      <button class="filter-tab" :class="{ active: filtroAtivo === 'todos' }" @click="filtroAtivo = 'todos'">
        <svg viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
          <path d="M3 3h8v8H3zm0 10h8v8H3zm10-10h8v8h-8zm0 10h8v8h-8z"/>
        </svg>
        Todos
      </button>
      <button class="filter-tab" :class="{ active: filtroAtivo === 'musica' }" @click="filtroAtivo = 'musica'">
        <svg viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        Músicas
      </button>
      <button class="filter-tab" :class="{ active: filtroAtivo === 'playlist' }" @click="filtroAtivo = 'playlist'">
        <svg viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
          <rect x="3" y="6" width="14" height="2" rx="1"/>
          <rect x="3" y="11" width="10" height="2" rx="1"/>
          <rect x="3" y="16" width="6" height="2" rx="1"/>
        </svg>
        Playlists
      </button>
      <button class="filter-tab" :class="{ active: filtroAtivo === 'recentes' }" @click="filtroAtivo = 'recentes'">
        <svg viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
        Recentes
      </button>
    </div>

    <!-- Loading -->
    <div class="loading-container" v-if="loading">
      <div class="spinner"></div>
      <p class="loading-text">Carregando seus favoritos...</p>
    </div>

    <!-- Empty State -->
    <transition name="fade">
      <div v-if="!loading && favoritasFiltradas.length === 0" class="empty-state">
        <div class="empty-illustration">
          <svg viewBox="0 0 120 120" fill="none" class="empty-icon-svg">
            <defs>
              <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3"/>
                <stop offset="100%" style="stop-color:#ec4899;stop-opacity:0.3"/>
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="55" fill="url(#emptyGradient)"/>
            <path d="M60 95l-2-1.8c-18-16.3-29-26.3-29-39.2 0-10.3 8.2-18.5 18.5-18.5 5.8 0 11.4 2.7 15 7 3.6-4.3 9.2-7 15-7 10.3 0 18.5 8.2 18.5 18.5 0 12.9-11 22.9-29 39.2L60 95z" 
                  fill="#6366f1" opacity="0.5"/>
            <path d="M45 65h5v8h-5zm10-5h5v13h-5zm10-3h5v16h-5zm10 3h5v8h-5z" 
                  fill="#ec4899" opacity="0.8"/>
          </svg>
        </div>
        <h3>{{ favoritas.length === 0 ? 'Nenhuma favorita ainda' : 'Nenhum resultado encontrado' }}</h3>
        <p>{{ favoritas.length === 0 ? 'Comece a explorar e adicione músicas e playlists aos seus favoritos para vê-las aqui!' : 'Tente mudar o filtro para ver outros itens.' }}</p>
        <button class="btn-explore" @click="$router.push('/search')">
          <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          Explorar Músicas
        </button>
      </div>
    </transition>

    <!-- Lista -->
    <transition-group name="list" tag="div" class="lista" v-if="!loading && favoritasFiltradas.length > 0">
      <div v-for="item in favoritasFiltradas" :key="item.id" class="card"
           @click="item.type === 'musica' ? play(item) : abrirPlaylist(item)">
        <div class="cover-wrapper">
          <img :src="item.cover || '/api/placeholder/150/150'" class="cover" />
          <div class="cover-overlay" v-if="item.type === 'musica'">
            <div class="play-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; margin-left: 2px;">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div class="type-badge" :class="item.type">
            <svg v-if="item.type === 'musica'" viewBox="0 0 24 24" fill="currentColor" class="badge-icon">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" class="badge-icon">
              <rect x="3" y="6" width="14" height="2" rx="1"/>
              <rect x="3" y="11" width="10" height="2" rx="1"/>
              <rect x="3" y="16" width="6" height="2" rx="1"/>
            </svg>
          </div>
        </div>

        <div class="info">
          <h3>{{ item.title }}</h3>
          <p>{{ item.subtitle }}</p>
          <div class="info-meta" v-if="item.type === 'musica'">
            <span>
              <svg viewBox="0 0 24 24" fill="currentColor" class="meta-icon">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              {{ item.duration || '3:00' }}
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="currentColor" class="meta-icon">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
              </svg>
              {{ tempoDecorrido(item.addedAt) }}
            </span>
          </div>
          <div class="info-meta" v-else>
            <span>
              <svg viewBox="0 0 24 24" fill="currentColor" class="meta-icon">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              {{ item.trackCount || 0 }} músicas
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="currentColor" class="meta-icon">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              {{ item.totalDuration || '1h 30min' }}
            </span>
          </div>
        </div>

        <div class="acoes">
          <button v-if="item.type === 'musica'" class="btn btn-play" @click.stop="play(item)" title="Tocar">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px; margin-left: 2px;">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          <button class="btn btn-favorite" @click.stop="remover(item)" title="Remover dos favoritos">
            <svg viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>

          <button class="btn btn-more" @click.stop="mostrarOpcoes(item)" title="Mais opções">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 16px; height: 16px;">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
    </transition-group>

    <!-- Toast Container -->
    <div class="toast-container">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="currentColor" class="toast-svg">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="currentColor" class="toast-svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" class="toast-svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <div class="toast-content">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
export default {
  name: "Favoritas",
  data() {
    return {
      favoritas: [],
      loading: true,
      filtroAtivo: 'todos',
      toasts: [],
      toastId: 0
    }
  },
  computed: {
    musicasCount() {
      return this.favoritas.filter(f => f.type === 'musica').length
    },
    playlistsCount() {
      return this.favoritas.filter(f => f.type === 'playlist').length
    },
    favoritasFiltradas() {
      if (this.filtroAtivo === 'todos') return this.favoritas
      if (this.filtroAtivo === 'recentes') {
        return [...this.favoritas].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
      }
      return this.favoritas.filter(f => f.type === this.filtroAtivo)
    }
  },
  mounted() {
    this.carregarFavoritas()
    window.addEventListener("focus", this.carregarFavoritas)
  },
  beforeUnmount() {
    window.removeEventListener("focus", this.carregarFavoritas)
  },
  methods: {
    showToast(message, type = 'success', title = null) {
      const titles = {
        success: 'Sucesso!',
        error: 'Erro!',
        info: 'Informação'
      }
      const toast = {
        id: ++this.toastId,
        message,
        type,
        title: title || titles[type]
      }
      this.toasts.push(toast)
      setTimeout(() => {
        const index = this.toasts.findIndex(t => t.id === toast.id)
        if (index > -1) this.toasts.splice(index, 1)
      }, 3000)
    },
    tempoDecorrido(date) {
      if (!date) return 'Recente'
      const now = new Date()
      const past = new Date(date)
      const diff = Math.floor((now - past) / 1000)
      if (diff < 60) return 'Agora'
      if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`
      if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
      if (diff < 604800) return `${Math.floor(diff / 86400)} dias atrás`
      return past.toLocaleDateString('pt-BR')
    },
    async carregarFavoritas() {
      this.loading = true
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:3002/favoritas", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Erro ao carregar favoritas')
        const data = await res.json()
        this.favoritas = data.map(f => {
          if (f.musica) {
            return {
              id: f.musica._id,
              title: f.musica.nome,
              subtitle: f.musica.cantores?.[0]?.nome || "Artista Desconhecido",
              cover: f.musica.foto,
              url: f.musica.link,
              duration: f.musica.duracao,
              addedAt: f.createdAt,
              type: "musica"
            }
          }
          if (f.playlist) {
            return {
              id: f.playlist._id,
              title: f.playlist.nome,
              subtitle: f.playlist.descricao || "Playlist",
              cover: f.playlist.capa,
              trackCount: f.playlist.quantidadeMusicas,
              totalDuration: f.playlist.duracaoTotal,
              addedAt: f.createdAt,
              type: "playlist"
            }
          }
        }).filter(Boolean)
      } catch (err) {
        console.error(err)
        this.showToast('Erro ao carregar favoritas', 'error')
      } finally {
        this.loading = false
      }
    },
    async remover(item) {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:3002/favoritas/${item.id}/favoritar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ tipo: item.type })
        })
        if (!res.ok) throw new Error('Erro ao remover')
        this.favoritas = this.favoritas.filter(f => f.id !== item.id)
        this.showToast(`${item.title} removido dos favoritos`, 'info', 'Removido')
      } catch (err) {
        console.error(err)
        this.showToast('Erro ao remover favorito', 'error')
      }
    },
    play(item) {
      if (item.type !== "musica") return
      window.dispatchEvent(new CustomEvent("play-song", {
        detail: {
          song: {
            id: item.id,
            title: item.title,
            artist: item.subtitle,
            cover: item.cover,
            url: item.url,
            duration: item.duration || 30
          },
          playlist: [item],
          index: 0
        }
      }))
      this.showToast(`Tocando: ${item.title}`, 'success', 'Reproduzindo')
    },
    abrirPlaylist(item) {
      this.$router.push(`/playlist/${item.id}`)
    },
    tocarTudo() {
      const musicas = this.favoritas.filter(f => f.type === 'musica')
      if (musicas.length === 0) {
        this.showToast('Nenhuma música para tocar', 'info')
        return
      }
      this.showToast(`Tocando ${musicas.length} músicas`, 'success', 'Playlist iniciada')
    },
    exportarFavoritas() {
      this.showToast('Lista exportada com sucesso!', 'success')
    },
    mostrarOpcoes(item) {
      console.log('Opções para:', item)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

.favoritas-page {
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: 40px 32px;
  background: #0a0a0f;
  color: #fff;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.bg-effects, .grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-effects::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 85%, rgba(99, 102, 241, 0.15), transparent 50%),
    radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.12), transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05), transparent 70%);
  animation: bgFloat 25s infinite ease-in-out;
}

.bg-effects::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 80%, rgba(99, 102, 241, 0.08), transparent 40%);
  animation: bgFloat 20s infinite ease-in-out reverse;
}

@keyframes bgFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.grid-overlay {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* Header */
.header {
  position: relative;
  z-index: 2;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
  position: relative;
  overflow: hidden;
}

.header-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
}

.custom-icon {
  width: 32px;
  height: 32px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.header-text h1 {
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.header-subtitle {
  color: #a1a1aa;
  font-size: 1rem;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-header {
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #15151f;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-header:hover {
  background: #1e1e2d;
  border-color: #818cf8;
  transform: translateY(-2px);
}

.btn-header.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border: none;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.btn-header.primary:hover {
  box-shadow: 0 6px 30px rgba(99, 102, 241, 0.4);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* Stats Bar */
.stats-bar {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.stat-card {
  background: #15151f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px 28px;
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: #1e1e2d;
  transform: translateY(-3px);
  border-color: rgba(99, 102, 241, 0.3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-svg {
  width: 24px;
  height: 24px;
}

.stat-icon.music {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.stat-icon.playlist {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
}

.stat-icon.total {
  background: rgba(139, 92, 246, 0.15);
  color: #8b5cf6;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #a1a1aa;
  margin-top: 4px;
}

/* Filter Tabs */
.filter-tabs {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 6px;
  background: #15151f;
  border-radius: 12px;
  width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.filter-tab {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #a1a1aa;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tab:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.filter-tab.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.tab-icon {
  width: 16px;
  height: 16px;
}

/* Loading */
.loading-container {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.spinner {
  width: 56px;
  height: 56px;
  position: relative;
}

.spinner::before, .spinner::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
}

.spinner::before {
  border-top-color: #6366f1;
  border-right-color: #ec4899;
  animation: spin 1s linear infinite;
}

.spinner::after {
  border-bottom-color: #8b5cf6;
  border-left-color: #6366f1;
  animation: spin 1.5s linear infinite reverse;
  opacity: 0.5;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 24px;
  color: #a1a1aa;
  font-size: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Empty State */
.empty-state {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
}

.empty-illustration {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.empty-icon-svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #fff;
}

.empty-state p {
  color: #a1a1aa;
  max-width: 400px;
  margin-bottom: 24px;
  line-height: 1.6;
}

.btn-explore {
  padding: 14px 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-explore:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(99, 102, 241, 0.4);
}

/* Lista */
.lista {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

/* Card */
.card {
  display: flex;
  align-items: center;
  background: #15151f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px;
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.15);
}

.card:hover::before {
  opacity: 0.03;
}

.cover-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.card:hover .cover {
  transform: scale(1.1);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);
}

.card:hover .cover-overlay {
  opacity: 1;
}

.play-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.card:hover .play-icon {
  transform: scale(1);
}

.type-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.type-badge.musica {
  background: rgba(99, 102, 241, 0.9);
  color: white;
}

.type-badge.playlist {
  background: rgba(236, 72, 153, 0.9);
  color: white;
}

.badge-icon {
  width: 12px;
  height: 12px;
}

.info {
  flex: 1;
  margin-left: 16px;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.info p {
  font-size: 0.875rem;
  color: #a1a1aa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
  font-size: 0.75rem;
  color: #71717a;
}

.info-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  width: 12px;
  height: 12px;
}

.acoes {
  display: flex;
  gap: 8px;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.card:hover .acoes {
  opacity: 1;
  transform: translateX(0);
}

.btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 14px;
}

.btn-play {
  background: #6366f1;
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-play:hover {
  background: #818cf8;
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-favorite {
  background: rgba(236, 72, 153, 0.15);
  color: #ec4899;
  border: 1px solid rgba(236, 72, 153, 0.2);
}

.btn-favorite:hover {
  background: #ec4899;
  color: white;
  transform: scale(1.1);
}

.heart-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.btn-more {
  background: rgba(255, 255, 255, 0.05);
  color: #a1a1aa;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-more:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Toast */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  background: #15151f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  min-width: 300px;
  border-left: 4px solid transparent;
}

.toast.success { border-left-color: #22c55e; }
.toast.error { border-left-color: #ef4444; }
.toast.info { border-left-color: #6366f1; }

.toast-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.toast.success .toast-icon { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
.toast.error .toast-icon { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.toast.info .toast-icon { background: rgba(99, 102, 241, 0.15); color: #818cf8; }

.toast-svg {
  width: 16px;
  height: 16px;
}

.toast-content { flex: 1; }

.toast-title {
  font-weight: 600;
  color: #fff;
  font-size: 0.9375rem;
}

.toast-message {
  color: #a1a1aa;
  font-size: 0.875rem;
  margin-top: 2px;
}

/* Animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.list-enter-active, .list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .favoritas-page { padding: 24px 16px; }
  .header-text h1 { font-size: 1.5rem; }
  .header-icon { width: 44px; height: 44px; }
  .custom-icon { width: 24px; height: 24px; }
  .stats-bar { gap: 12px; }
  .stat-card { padding: 16px 20px; min-width: auto; flex: 1; }
  .stat-value { font-size: 1.25rem; }
  .lista { grid-template-columns: 1fr; }
  .acoes { opacity: 1; transform: none; }
  .filter-tabs { width: 100%; overflow-x: auto; }
  .btn-header span { display: none; }
  .toast-container { left: 16px; right: 16px; bottom: 16px; }
  .toast { min-width: auto; }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: #1e1e2d; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #6366f1; }
</style>