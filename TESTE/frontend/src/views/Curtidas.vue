<template>
  <div class="curtidas">
    <div class="header">
      <h1><i class="fa fa-heart"></i> Músicas Curtidas</h1>
      <span class="count" v-if="musicas.length > 0">
        {{ musicas.length }} {{ musicas.length === 1 ? 'música' : 'músicas' }}
      </span>
    </div>

    <!-- Estado Vazio -->
    <div v-if="musicas.length === 0 && !isLoading" class="empty-state">
      <div class="empty-icon">
        <i class="fa fa-heart-o"></i>
      </div>
      <h3>Nenhuma música curtida ainda</h3>
      <p>As músicas que você curtir na busca aparecerão aqui</p>
      <button class="btn-explore" @click="goToSearch">
        <i class="fa fa-search"></i> Buscar músicas
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Carregando suas curtidas...</span>
    </div>

    <!-- Lista de Músicas -->
    <div v-if="musicas.length > 0" class="music-list">
      <div class="list-header">
        <button class="btn-play-all" @click="playAll">
          <i class="fa fa-play"></i> Tocar todas
        </button>
      </div>

      <div 
        v-for="(musica, index) in musicas" 
        :key="`${musica.source}-${musica.id}`" 
        class="music-card" 
        @dblclick="playMusic(index)"
      >
        <div class="music-number">{{ index + 1 }}</div>
        
        <img :src="musica.cover || '/default-cover.png'" :alt="musica.title" />
        
        <div class="music-info">
          <h3>{{ musica.title }}</h3>
          <p>
            {{ musica.artist }}
            <span v-if="musica.album"> • {{ musica.album }}</span>
           
          </p>
        </div>

        <div class="music-actions">
          <button 
            class="btn-like active" 
            @click="removerCurtida(musica, index)"
            title="Remover dos curtidos"
          >
            <i class="fa fa-heart"></i>
          </button>
          
          <div class="dropdown-container" ref="dropdownContainers">
            <button 
              class="btn-more" 
              @click="toggleMenu(index, $event)"
              :class="{ 'active': activeMenuIndex === index }"
            >
              <i class="fa fa-ellipsis-v"></i>
            </button>
            
            <!-- Menu Dropdown Moderno -->
            <transition name="menu-pop">
              <div 
                v-if="activeMenuIndex === index" 
                class="modern-dropdown"
                :style="getDropdownPosition(index)"
                ref="dropdownMenus"
              >
                <!-- Opções -->
                <div class="dropdown-options">
                  <button class="dropdown-option" @click="adicionarAPlaylist(musica)">
                    <div class="option-icon playlist-icon">
                      <i class="fa fa-plus-square-o"></i>
                    </div>
                    <div class="option-content">
                      <span class="option-label">Adicionar à playlist</span>
                      <span class="option-hint">Escolha uma playlist existente</span>
                    </div>
                    <i class="fa fa-chevron-right option-arrow"></i>
                  </button>
                  
                  <button class="dropdown-option" @click="favoritarMusica(musica)">
                    <div class="option-icon favorite-icon">
                      <i class="fa fa-star-o"></i>
                    </div>
                    <div class="option-content">
                      <span class="option-label">Favoritar</span>
                      <span class="option-hint">Adicionar aos favoritos especiais</span>
                    </div>
                    <i class="fa fa-chevron-right option-arrow"></i>
                  </button>
                </div>
                
                <!-- Footer -->
                <div class="dropdown-footer">
                  <button class="dropdown-close" @click="closeMenu">
                    <i class="fa fa-times"></i> Fechar
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de Notificação -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <div class="toast-content">
          <div class="toast-icon">
            <i :class="toast.icon"></i>
          </div>
          <div class="toast-text">
            <span class="toast-title">{{ toast.title }}</span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
        </div>
        <button v-if="toast.showUndo" class="toast-undo" @click="desfazerRemocao">
          <i class="fa fa-undo"></i> Desfazer
        </button>
        <button class="toast-close" @click="toast.show = false">
          <i class="fa fa-times"></i>
        </button>
      </div>
    </transition>

    <!-- MODAL PLAYLIST -->
    <transition name="fade">
      <div v-if="showPlaylistModal" class="modal-overlay" @click.self="showPlaylistModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3>Adicionar à playlist</h3>
            <button @click="showPlaylistModal = false">
              <i class="fa fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="playlists.length === 0" class="empty-playlists">
              <p>Você não tem playlists ainda</p>
            </div>

            <div v-else class="playlist-list">
              <div 
                v-for="playlist in playlists" 
                :key="playlist._id"
                class="playlist-item"
              >
                <div>
                  <strong>{{ playlist.nome }}</strong>
                  <p>{{ playlist.musicas?.length || 0 }} músicas</p>
                </div>

                <button 
                  class="btn-add"
                  @click="adicionarNaPlaylist(playlist._id)"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "Curtidas",
  
  data() {
    return {
      musicas: [],
      isLoading: false,
      ultimaMusicaRemovida: null,
      ultimoIndiceRemovido: null,
      activeMenuIndex: null,
      showPlaylistModal: false,
      playlists: [],
      musicaSelecionada: null,
      usuarioId: null,
      toast: {
        show: false,
        title: "",
        message: "",
        type: "success",
        icon: "fa fa-check-circle",
        showUndo: false
      }
    }
  },

  mounted() {
    const user = JSON.parse(localStorage.getItem("usuario") || "{}")
    this.usuarioId = user?._id || user?.id

    this.carregarCurtidas()
    
    // Atualiza quando voltar pra página
    window.addEventListener('focus', this.carregarCurtidas)
    document.addEventListener('click', this.handleClickOutside)
    
    // Escuta evento de curtidas atualizadas
    window.addEventListener('curtidas-updated', this.carregarCurtidas)
    window.addEventListener('likes-updated', this.carregarCurtidas)
  },

  beforeUnmount() {
    window.removeEventListener('focus', this.carregarCurtidas)
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('curtidas-updated', this.carregarCurtidas)
    window.removeEventListener('likes-updated', this.carregarCurtidas)
  },

  methods: {
parseDuration(durationStr) {
  if (!durationStr) return 30
  if (typeof durationStr === 'number') {
    return Number.isFinite(durationStr) ? Math.floor(durationStr) : 30
  }
  if (typeof durationStr === 'string') {
    if (durationStr.includes(':')) {
      const [m, s] = durationStr.split(':').map(Number)
      if (Number.isFinite(m) && Number.isFinite(s)) return (m * 60) + s
    }
    const num = parseInt(durationStr, 10)
    if (Number.isFinite(num)) return num
  }
  return 30
},

    async carregarCurtidas() {
      this.isLoading = true
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          this.musicas = []
          return
        }

        const res = await fetch(`http://localhost:3002/curtidas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          const text = await res.text()
          console.error("Erro API:", text)
          this.musicas = []
          return
        }

        const data = await res.json()

        // A API agora retorna array unificado com { id, nome, artist, cover, url, source, ... }
        this.musicas = data.map(c => ({
          id: c.id,
          title: c.nome,
          artist: c.artist || 'Artista desconhecido',
          album: c.album || '',
          cover: c.cover,
          url: c.url,
          source: c.source || 'local',
          duration: c.duration || 180,
          ano: c.ano || null
        }))

      } catch (err) {
        console.error("Erro ao carregar curtidas:", err)
        this.musicas = []
      } finally {
        this.isLoading = false
      }
    },

    toggleMenu(index, event) {
      event.stopPropagation()
      if (this.activeMenuIndex === index) {
        this.activeMenuIndex = null
      } else {
        this.activeMenuIndex = index
      }
    },

    closeMenu() {
      this.activeMenuIndex = null
    },

    handleClickOutside(event) {
      const dropdowns = this.$refs.dropdownContainers
      if (dropdowns) {
        const containers = Array.isArray(dropdowns) ? dropdowns : [dropdowns]
        const clickedInside = containers.some(container => 
          container && container.contains(event.target)
        )
        if (!clickedInside) {
          this.activeMenuIndex = null
        }
      }
    },

    getDropdownPosition(index) {
      return {}
    },

    async adicionarAPlaylist(musica) {
      this.closeMenu()
      this.musicaSelecionada = musica
      this.showPlaylistModal = true

      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:3002/playlists`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        this.playlists = data
      } catch (err) {
        console.error(err)
      }
    },
    
   async adicionarNaPlaylist(playlistId) {
  try {
    const token = localStorage.getItem("token")
    const musica = this.musicaSelecionada

    // ✅ MONTAR O BODY CORRETAMENTE
    const body = {
      source: musica.source || 'local'
    }

    // Se for externa, envia dadosMusica completos
    if (musica.source && musica.source !== 'local') {
      body.dadosMusica = {
        titulo: musica.title || 'Sem título',
        artista: musica.artist || 'Desconhecido',
        capa: musica.cover || '',
        previewUrl: musica.url || '',
        duration: this.parseDuration(musica.duration),
        ano: musica.ano || null,
        album: musica.album || ''
      }
    }

    const res = await fetch(
      `http://localhost:3002/playlists/${playlistId}/musicas/${musica.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // ✅ ESSENCIAL
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)  // ✅ ENVIAR O BODY
      }
    )

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || `Erro ${res.status}`)
    }

    this.showToast({
      title: "Adicionado!",
      message: `"${musica.title}" foi adicionada à playlist`,
      type: "success",
      icon: "fa fa-check"
    })

    this.showPlaylistModal = false
  } catch (err) {
    console.error(err)
    this.showToast({
      title: "Erro",
      message: err.message || "Não foi possível adicionar",
      type: "error",
      icon: "fa fa-times"
    })
  }
},

    async favoritarMusica(musica) {
  this.closeMenu()

  try {
    const token = localStorage.getItem("token")

    const body = {
      tipo: "musica"
    }

    // Se for externa, envia source e dadosMusica
    if (musica.source && musica.source !== 'local') {
      body.source = musica.source
      body.dadosMusica = {
        titulo: musica.title || 'Sem título',
        artista: musica.artist || 'Desconhecido',
        capa: musica.cover || '',
        previewUrl: musica.url || '',
        duration: this.parseDuration(musica.duration),
        ano: musica.ano || null,
        album: musica.album || ''
      }
    }

    const res = await fetch(`http://localhost:3002/favoritas/${musica.id}/favoritar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error("Erro ao favoritar")

    const data = await res.json()

    if (data.favorited) {
      this.showToast({
        title: "⭐ Favoritada!",
        message: `"${musica.title}" adicionada aos favoritos`,
        type: "success",
        icon: "fa fa-star"
      })
      window.dispatchEvent(new Event('favoritas-updated'))
    } else {
      this.showToast({
        title: "Removida",
        message: `"${musica.title}" removida dos favoritos`,
        type: "info",
        icon: "fa fa-star-o"
      })
    }
  } catch (err) {
    console.error(err)
    this.showToast({
      title: "Erro",
      message: "Não foi possível favoritar",
      type: "error",
      icon: "fa fa-times"
    })
  }
},

    async removerCurtida(musica, index) {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          this.showToast({
            title: "Login necessário",
            message: "Faça login para gerenciar suas curtidas",
            type: "info",
            icon: "fa fa-info-circle"
          })
          return
        }

        // Salva para possível desfazer
        this.ultimaMusicaRemovida = musica
        this.ultimoIndiceRemovido = index

        // Remove do front imediatamente (UX mais fluida)
        this.musicas.splice(index, 1)

 const body = {
  source: musica.source || 'local'
}

// 🔥 SE FOR EXTERNA → precisa mandar dadosMusica
if (musica.source !== 'local') {
  body.dadosMusica = {
    titulo: musica.title,
    artista: musica.artist,
    capa: musica.cover || '',
    previewUrl: musica.url || '',
    duration: musica.duration || 30,
    ano: musica.ano || null,
    album: musica.album || ''
  }
}

const res = await fetch(`http://localhost:3002/curtidas/${musica.id}`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
})

        const data = await res.json()

        if (data.liked === false) {
          // Curtida removida com sucesso
          this.showToast({
            title: "Removida dos curtidos",
            message: `"${musica.title}" foi removida`,
            type: "info",
            icon: "fa fa-heart-broken",
            showUndo: true,
            duration: 5000
          })
        } else {
          // Se voltou liked: true, algo deu errado, restaura
          this.musicas.splice(index, 0, musica)
          this.showToast({
            title: "Erro",
            message: "Não foi possível remover a curtida",
            type: "error",
            icon: "fa fa-times"
          })
        }

        window.dispatchEvent(new Event('likes-updated'))
        window.dispatchEvent(new Event('curtidas-updated'))

      } catch (err) {
        console.error("Erro ao remover curtida:", err)
        // Restaura a música em caso de erro
        if (this.ultimaMusicaRemovida && this.ultimoIndiceRemovido !== null) {
          this.musicas.splice(this.ultimoIndiceRemovido, 0, this.ultimaMusicaRemovida)
        }
        this.showToast({
          title: "Erro",
          message: "Erro ao remover curtida. Tente novamente.",
          type: "error",
          icon: "fa fa-times"
        })
      }
    },

    desfazerRemocao() {
      if (this.ultimaMusicaRemovida && this.ultimoIndiceRemovido !== null) {
        this.musicas.splice(this.ultimoIndiceRemovido, 0, this.ultimaMusicaRemovida)
        
        // Re-curtir a música (chama a API novamente)
        this.recurtirMusica(this.ultimaMusicaRemovida)
        
        this.showToast({
          title: "Ação desfeita",
          message: `"${this.ultimaMusicaRemovida.title}" foi restaurada`,
          type: "success",
          icon: "fa fa-check-circle",
          showUndo: false,
          duration: 3000
        })
        
        this.ultimaMusicaRemovida = null
        this.ultimoIndiceRemovido = null
      }
    },

    async recurtirMusica(musica) {
      try {
        const token = localStorage.getItem("token")
        
        const body = {
          source: musica.source || 'local'
        }

        // Se for externa, precisa enviar os dados novamente
        if (musica.source !== 'local') {
          body.dadosMusica = {
            titulo: musica.title,
            artista: musica.artist,
            capa: musica.cover || '',
            previewUrl: musica.url || '',
            duration: musica.duration || 30,
            ano: musica.ano || null,
            album: musica.album || ''
          }
        }

        await fetch(`http://localhost:3002/curtidas/${musica.id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })

        window.dispatchEvent(new Event('likes-updated'))
      } catch (err) {
        console.error("Erro ao recurtir:", err)
      }
    },

    showToast(options) {
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout)
      }
      
      this.toast = {
        show: true,
        title: options.title || "",
        message: options.message || "",
        type: options.type || "success",
        icon: options.icon || "fa fa-check-circle",
        showUndo: options.showUndo || false
      }
      
      const duration = options.duration || 3000
      this.toastTimeout = setTimeout(() => {
        this.toast.show = false
      }, duration)
    },

    playMusic(index) {
      const musica = this.musicas[index]
      const playerSong = {
        id: musica.id,
        title: musica.title,
        artist: musica.artist,
        cover: musica.cover,
        url: musica.url,
        duration: musica.duration || 30,
        source: musica.source,
        type: 'liked'
      }
      
      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: this.musicas.map(m => ({
            id: m.id,
            title: m.title,
            artist: m.artist,
            cover: m.cover,
            url: m.url,
            duration: m.duration || 30,
            source: m.source,
            type: 'liked'
          })),
          index: index,
          context: 'curtidas'
        }
      }))
    },

    playAll() {
      if (this.musicas.length > 0) {
        this.playMusic(0)
      }
    },

    goToSearch() {
      this.$router.push('/search')
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

.curtidas {
  position: relative;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 30px 60px;
  box-sizing: border-box;
  color: #f8fafc;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header h1 i {
  color: #ec4899;
  filter: drop-shadow(0 0 10px rgba(236, 72, 153, 0.5));
}

.count {
  font-size: 14px;
  color: #94a3b8;
  background: rgba(255,255,255,0.05);
  padding: 8px 16px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #94a3b8;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(236, 72, 153, 0.2);
  border-top-color: #ec4899;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Estado Vazio */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

.empty-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(236, 72, 153, 0.05));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  animation: pulse 2s ease-in-out infinite;
  border: 1px solid rgba(236, 72, 153, 0.3);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.empty-icon i {
  font-size: 48px;
  color: #ec4899;
  opacity: 0.9;
}

.empty-state h3 {
  font-size: 24px;
  color: #f8fafc;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 24px 0;
}

.btn-explore {
  padding: 14px 28px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(37,99,235,0.3);
}

.btn-explore:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(37,99,235,0.4);
}

/* Lista de Músicas */
.list-header {
  margin-bottom: 20px;
}

.btn-play-all {
  padding: 12px 24px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.btn-play-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
}

.music-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.music-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.music-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(236, 72, 153, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.music-number {
  width: 32px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.music-card img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.music-info {
  flex: 1;
  min-width: 0;
}

.music-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-info p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.source-badge.spotify {
  background: rgba(29, 185, 84, 0.15);
  color: #1db954;
}

.source-badge.deezer {
  background: rgba(239, 89, 60, 0.15);
  color: #ef593c;
}

.music-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.btn-like {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-like.active {
  color: #ec4899;
  background: rgba(236, 72, 153, 0.1);
}

.btn-like:hover {
  transform: scale(1.1);
  background: rgba(236, 72, 153, 0.2);
}

/* Container do Dropdown */
.dropdown-container {
  position: relative;
}

.btn-more {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-more:hover, .btn-more.active {
  color: #f8fafc;
  background: rgba(255,255,255,0.1);
  transform: rotate(90deg);
}

/* ===== MENU DROPDOWN MODERNO ===== */
.modern-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 280px;
  background: rgba(30, 30, 46, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 1000;
  overflow: hidden;
  transform-origin: top right;
}

/* Animação do Menu */
.menu-pop-enter-active {
  animation: menuPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.menu-pop-leave-active {
  animation: menuPopOut 0.2s ease forwards;
}

@keyframes menuPop {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes menuPopOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
}

/* Header do Dropdown */
.dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(124, 58, 237, 0.1));
}

.dropdown-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.dropdown-header-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dropdown-title {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-artist {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  margin: 0 16px;
}

/* Opções do Dropdown */
.dropdown-options {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  color: inherit;
}

.dropdown-option:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  transition: all 0.3s;
}

.playlist-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
  color: #60a5fa;
}

.favorite-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1));
  color: #fbbf24;
}

.dropdown-option:hover .playlist-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2));
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.dropdown-option:hover .favorite-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.2));
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.option-label {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.option-hint {
  font-size: 12px;
  color: #64748b;
}

.option-arrow {
  color: #475569;
  font-size: 12px;
  transition: all 0.2s;
}

.dropdown-option:hover .option-arrow {
  color: #94a3b8;
  transform: translateX(4px);
}

/* Footer do Dropdown */
.dropdown-footer {
  padding: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.dropdown-close {
  width: 100%;
  padding: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.dropdown-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: #121212;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  color: #f8fafc;
}

.modal-header button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 18px;
}

.playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: #1e1e1e;
  border-radius: 8px;
}

.playlist-item strong {
  color: #f8fafc;
  display: block;
}

.playlist-item p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.btn-add {
  background: #1db954;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: 600;
}

.empty-playlists {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
}

/* ===== TOAST NOTIFICATION ===== */
.toast-notification {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(30, 30, 46, 0.98);
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5), 
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 9999;
  min-width: 320px;
  max-width: 480px;
  backdrop-filter: blur(20px);
}

.toast-notification.success {
  border-left: 4px solid #10b981;
}

.toast-notification.info {
  border-left: 4px solid #3b82f6;
}

.toast-notification.error {
  border-left: 4px solid #ef4444;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.toast-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.toast-notification.success .toast-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.toast-notification.info .toast-icon {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.toast-notification.error .toast-icon {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.toast-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-title {
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
}

.toast-message {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
}

.toast-undo {
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.toast-undo:hover {
  background: rgba(59, 130, 246, 0.25);
  transform: translateY(-1px);
}

.toast-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

/* Animações do Toast */
.toast-enter-active {
  animation: toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  animation: toastSlideOut 0.3s ease forwards;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.95);
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .curtidas {
    margin-left: 0;
    padding: 20px;
  }

  .header h1 {
    font-size: 24px;
  }

  .music-card {
    padding: 10px 12px;
  }

  .music-card img {
    width: 48px;
    height: 48px;
  }

  .music-info h3 {
    font-size: 14px;
  }

  .modern-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    border-radius: 20px 20px 0 0;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .toast-notification {
    left: 16px;
    right: 16px;
    transform: none;
    min-width: auto;
    max-width: none;
    padding: 14px 16px;
  }

  .toast-enter-active {
    animation: toastSlideInMobile 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes toastSlideInMobile {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>