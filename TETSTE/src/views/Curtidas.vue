'<template>
  <div class="curtidas">
    <div class="header">
      <h1><i class="fa fa-heart"></i> Músicas Curtidas</h1>
      <span class="count" v-if="musicas.length > 0">
        {{ musicas.length }} {{ musicas.length === 1 ? 'música' : 'músicas' }}
      </span>
    </div>

    <!-- Estado Vazio -->
    <div v-if="musicas.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fa fa-heart-o"></i>
      </div>
      <h3>Nenhuma música curtida ainda</h3>
      <p>As músicas que você curtir na busca aparecerão aqui</p>
      <button class="btn-explore" @click="goToSearch">
        <i class="fa fa-search"></i> Buscar músicas
      </button>
    </div>

    <!-- Lista de Músicas -->
    <div v-else class="music-list">
      <div class="list-header">
        <button class="btn-play-all" @click="playAll">
          <i class="fa fa-play"></i> Tocar todas
        </button>
      </div>

      <div v-for="(musica, index) in musicas" :key="musica.id" class="music-card" @dblclick="playMusic(index)">
        <div class="music-number">{{ index + 1 }}</div>
        
        <img :src="musica.cover" :alt="musica.title" />
        
        <div class="music-info">
          <h3>{{ musica.title }}</h3>
          <p>{{ musica.artist }} • {{ musica.album }}</p>
        </div>

        <div class="music-actions">
          <button 
            class="btn-like active" 
            @click="removerCurtida(musica)"
            title="Remover dos curtidos"
          >
            <i class="fa fa-heart"></i>
          </button>
          
          <button class="btn-more" @click="showOptions(musica)">
            <i class="fa fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Toast de Notificação Melhorado -->
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
  </div>
</template>

<script>
export default {
  name: "Curtidas",
  
  data() {
    return {
      musicas: [],
      ultimaMusicaRemovida: null,
      ultimoIndiceRemovido: null,
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
    this.carregarCurtidas()
    
    // Atualizar quando a aba ganhar foco
    window.addEventListener('focus', this.carregarCurtidas)
    
    // Atualizar quando houver mudanças no localStorage
    window.addEventListener('storage', this.handleStorageChange)
  },

  beforeUnmount() {
    window.removeEventListener('focus', this.carregarCurtidas)
    window.removeEventListener('storage', this.handleStorageChange)
  },

  methods: {
    carregarCurtidas() {
      const stored = localStorage.getItem("curtidas")
      if (stored) {
        this.musicas = JSON.parse(stored)
      }
    },
    
    handleStorageChange(e) {
      if (e.key === 'curtidas') {
        this.carregarCurtidas()
      }
    },

    removerCurtida(musica) {
      const index = this.musicas.findIndex(m => m.id === musica.id)
      if (index !== -1) {
        // Salvar para possível desfazer
        this.ultimaMusicaRemovida = { ...musica }
        this.ultimoIndiceRemovido = index
        
        // Remover da lista
        this.musicas.splice(index, 1)
        localStorage.setItem("curtidas", JSON.stringify(this.musicas))
        
        // Mostrar toast melhorado com opção de desfazer
        this.showToast({
          title: "Removida dos curtidos",
          message: `"${musica.title}" foi removida da sua coleção`,
          type: "info",
          icon: "fa fa-heart-broken",
          showUndo: true,
          duration: 5000
        })
      }
    },

    desfazerRemocao() {
      if (this.ultimaMusicaRemovida && this.ultimoIndiceRemovido !== null) {
        // Restaurar música na posição original
        this.musicas.splice(this.ultimoIndiceRemovido, 0, this.ultimaMusicaRemovida)
        localStorage.setItem("curtidas", JSON.stringify(this.musicas))
        
        // Mostrar toast de confirmação
        this.showToast({
          title: "Ação desfeita",
          message: `"${this.ultimaMusicaRemovida.title}" foi restaurada`,
          type: "success",
          icon: "fa fa-check-circle",
          showUndo: false,
          duration: 3000
        })
        
        // Limpar backup
        this.ultimaMusicaRemovida = null
        this.ultimoIndiceRemovido = null
      }
    },

    showToast(options) {
      // Limpar timeout anterior se existir
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
      
      // Auto-esconder após duração especificada
      const duration = options.duration || 3000
      this.toastTimeout = setTimeout(() => {
        this.toast.show = false
      }, duration)
    },

    playMusic(index) {
      const musica = this.musicas[index]
      
      // Converter para formato do player global
      const playerSong = {
        id: musica.id,
        title: musica.title,
        artist: musica.artist,
        cover: musica.cover,
        url: musica.preview || musica.url,
        duration: musica.duration || 30,
        type: 'liked'
      }
      
      // Disparar evento global para o player
      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: this.musicas.map(m => ({
            id: m.id,
            title: m.title,
            artist: m.artist,
            cover: m.cover,
            url: m.preview || m.url,
            duration: m.duration || 30,
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
      // Navegar para a página de busca
      this.$router.push('/search')
    },

    showOptions(musica) {
      console.log("Opções para:", musica)
      // Implementar menu de opções (pode ser um dropdown)
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

.curtidas {
  margin-left: 260px;
  padding: 40px;
  color: #f8fafc;
  font-family: 'Segoe UI', system-ui;
  min-height: 100vh;
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
}

.count {
  font-size: 14px;
  color: #94a3b8;
  background: rgba(255,255,255,0.05);
  padding: 8px 16px;
  border-radius: 20px;
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
  background: rgba(236, 72, 153, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.empty-icon i {
  font-size: 48px;
  color: #ec4899;
  opacity: 0.7;
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
  transition: all 0.3s;
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
  transition: all 0.3s;
}

.music-card:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(236, 72, 153, 0.3);
  transform: translateX(4px);
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
}

.music-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

.btn-more:hover {
  color: #f8fafc;
  background: rgba(255,255,255,0.1);
}

/* ===== TOAST NOTIFICATION MELHORADO ===== */
.toast-notification {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #1e1e2e;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 
              0 0 0 1px rgba(255, 255, 255, 0.1);
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

  .toast-notification {
    left: 16px;
    right: 16px;
    transform: none;
    min-width: auto;
    max-width: none;
    padding: 14px 16px;
  }

  .toast-enter-active,
  .toast-leave-active {
    animation-name: toastSlideInMobile;
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
</style>'''


