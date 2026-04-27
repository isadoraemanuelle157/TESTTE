<template>
  <aside class="sidebar" :class="{ 'open': isOpen }">
    <div class="sidebar-content">
      <!-- Botão fechar (X) dentro do sidebar -->
      <button class="close-btn" @click="$emit('close')" v-if="isOpen">
        <i class="fa fa-times"></i>
      </button>

      <div>
        <!-- Logo FODA -->
        <div class="logo-container">
          <div class="logo-orbit">
            <div class="orbit-ring ring-1"></div>
            <div class="orbit-ring ring-2"></div>
            <div class="orbit-ring ring-3"></div>
          </div>
          
          <div class="logo-core">
            <div class="pulse-waves">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="logo-icon">
              <i class="fa fa-headphones"></i>
              <div class="sound-bars">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
          
          <div class="logo-glow"></div>
        </div>

        <h1 class="logo-text">
          <span class="letter" v-for="(letter, index) in 'SoundUp'" :key="index" :style="{ '--delay': index * 0.05 + 's' }">
            {{ letter }}
          </span>
        </h1>

        <div class="divider">
          <div class="line-left"></div>
          <div class="center-pulse"></div>
          <div class="line-right"></div>
        </div>

 

        <!-- Navegação -->
        <nav>
          <ul>
            <!-- 🔥 MUDADO: Home vai para /dashboard quando logado -->
            <li>
              <router-link :to="isLoggedIn ? '/dashboard' : '/'" class="nav-link" @click="$emit('close')">
                <i class="fa fa-home"></i>
                <span>{{ isLoggedIn ? 'Dashboard' : 'Home' }}</span>
              </router-link>
            </li>

            <li>
              <router-link to="/search" class="nav-link" @click="$emit('close')">
                <i class="fa fa-search"></i>
                <span>Pesquisar</span>
              </router-link>
            </li>

            <li v-if="isLoggedIn">
              <router-link to="/curtidas" class="nav-link" @click="$emit('close')">
                <i class="fa fa-heart"></i>
                <span>Curtidas</span>
              </router-link>
            </li>

            <li v-if="isLoggedIn">
              <router-link to="/favoritas" class="nav-link" @click="$emit('close')">
                <i class="fa fa-star"></i>
                <span>Favoritas</span>
              </router-link>
            </li>

            <li v-if="isLoggedIn">
              <router-link to="/playlist" class="nav-link" @click="$emit('close')">
                <i class="fa fa-list-ul"></i>
                <span>Playlists</span>
              </router-link>
            </li>

            <li>
              <router-link to="/salademusica" class="nav-link" @click="$emit('close')">
                <i class="fa fa-music"></i>
                <span>Sala de Música</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/karaoke" class="nav-link" @click="$emit('close')">
                <i class="fa fa-microphone"></i>
                <span>Karaoke</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/desafiomusical" class="nav-link" @click="$emit('close')">
                <i class="fa fa-trophy"></i>
                <span>Desafio Musical</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/carregamento2" class="nav-link" @click="$emit('close')">
                <i class="fa fa-spinner"></i>
                <span>Carregamento 1</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/carregamento1" class="nav-link" @click="$emit('close')">
                <i class="fa fa-circle-o-notch"></i>
                <span>Carregamento 2</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/chatiamusica" class="nav-link" @click="$emit('close')">
                <i class="fa fa-comments"></i>
                <span>Chat IA</span>
              </router-link>
            </li>

            <li>
              <router-link to="/matchmusical" class="nav-link" @click="$emit('close')">
                <img src="@/assets/icon-match.png" class="icon-match">
                <span>Match Musical</span>
              </router-link>
            </li>

          </ul>
        </nav>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: "Sidebar",
  
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'logout'],

  data() {
    return {
      isLoggedIn: false,
      currentUser: {
        firstName: 'Usuário',
        avatar: 'https://i.pravatar.cc/150?img=11',
        plan: 'Free'
      }
    }
  },

  mounted() {
    this.checkAuthStatus()
    
    // Escuta eventos de login/logout
    window.addEventListener('user-logged-in', this.handleLogin)
    window.addEventListener('user-logged-out', this.handleLogout)
    window.addEventListener('storage', this.checkAuthStatus)
  },

  beforeDestroy() {
    window.removeEventListener('user-logged-in', this.handleLogin)
    window.removeEventListener('user-logged-out', this.handleLogout)
    window.removeEventListener('storage', this.checkAuthStatus)
  },

  methods: {
    checkAuthStatus() {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      this.isLoggedIn = isLoggedIn
      
      if (isLoggedIn) {
        this.loadUserData()
      }
    },

    loadUserData() {
      const storedUser = localStorage.getItem('usuario')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          this.currentUser = {
            firstName: userData.nome ? userData.nome.split(' ')[0] : userData.firstName || 'Usuário',
            avatar: userData.avatar || userData.foto || 'https://i.pravatar.cc/150?img=11',
            plan: userData.plano || userData.plan || 'Free'
          }
        } catch (e) {
          console.error('Erro ao carregar usuário:', e)
        }
      }
    },

    handleLogin(e) {
      this.isLoggedIn = true
      if (e.detail) {
        this.currentUser = {
          firstName: e.detail.nome ? e.detail.nome.split(' ')[0] : e.detail.firstName || 'Usuário',
          avatar: e.detail.avatar || e.detail.foto || 'https://i.pravatar.cc/150?img=11',
          plan: e.detail.plano || e.detail.plan || 'Free'
        }
      }
    },

    handleLogout() {
      this.isLoggedIn = false
      this.currentUser = {
        firstName: 'Usuário',
        avatar: 'https://i.pravatar.cc/150?img=11',
        plan: 'Free'
      }
    },

    logout() {
      // Limpar todos os dados do localStorage
      localStorage.removeItem('usuario')
      localStorage.removeItem('usuario_perfil')
      localStorage.removeItem('token')
      localStorage.removeItem('isLoggedIn')
      
      // Disparar evento de logout
      window.dispatchEvent(new CustomEvent('user-logged-out'))
      
      // Emitir evento para o componente pai
      this.$emit('logout')
      
      // Fechar sidebar no mobile
      this.$emit('close')
      
      // Redirecionar para home
      this.$router.push('/')
    },

    handleAvatarError(e) {
      e.target.src = 'https://i.pravatar.cc/150?img=11'
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

.sidebar {
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
  border-right: 1px solid rgba(37, 99, 235, 0.1);
  position: fixed;
  left: 0;
  top: 0;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow: hidden;
  z-index: 999;
  
  /* 🔥 Animação de entrada/saída */
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🔥 Quando aberto */
.sidebar.open {
  transform: translateX(0);
}

.sidebar-content {
  height: 100%;
  padding: 30px 0;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

/* 🔥 Botão Fechar (X) */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(236, 72, 153, 0.3);
  color: #ec4899;
  transform: rotate(90deg);
}

.close-btn i {
  font-size: 18px;
}

/* ========== LOGO FODA ========== */
.logo-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-orbit {
  position: absolute;
  width: 100%;
  height: 100%;
}

.orbit-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  animation: orbit 3s linear infinite;
}

.ring-1 {
  width: 100%;
  height: 100%;
  border-top-color: #2563eb;
  border-right-color: #2563eb;
  animation-duration: 3s;
}

.ring-2 {
  width: 75%;
  height: 75%;
  top: 12.5%;
  left: 12.5%;
  border-bottom-color: #7c3aed;
  border-left-color: #7c3aed;
  animation-duration: 2s;
  animation-direction: reverse;
}

.ring-3 {
  width: 50%;
  height: 50%;
  top: 25%;
  left: 25%;
  border-top-color: #ec4899;
  border-right-color: #ec4899;
  animation-duration: 1.5s;
}

@keyframes orbit {
  to { transform: rotate(360deg); }
}

.logo-core {
  position: relative;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 0 30px rgba(37, 99, 235, 0.5);
}

.pulse-waves {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.pulse-waves span {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.3);
  animation: pulse-wave 2s ease-out infinite;
}

.pulse-waves span:nth-child(1) { animation-delay: 0s; }
.pulse-waves span:nth-child(2) { animation-delay: 0.5s; }
.pulse-waves span:nth-child(3) { animation-delay: 1s; }

@keyframes pulse-wave {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(2); opacity: 0; }
}

.logo-icon {
  position: relative;
  color: #fff;
  font-size: 28px;
  z-index: 3;
}

.sound-bars {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  align-items: flex-end;
}

.sound-bars span {
  width: 3px;
  background: #fff;
  border-radius: 1px;
  animation: sound-bar 1s ease-in-out infinite;
}

.sound-bars span:nth-child(1) { height: 8px; animation-delay: 0s; }
.sound-bars span:nth-child(2) { height: 12px; animation-delay: 0.2s; }
.sound-bars span:nth-child(3) { height: 6px; animation-delay: 0.4s; }
.sound-bars span:nth-child(4) { height: 10px; animation-delay: 0.6s; }

@keyframes sound-bar {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.5); }
}

.logo-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.4), transparent 70%);
  filter: blur(20px);
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* ========== TEXTO DA LOGO ========== */
.logo-text {
  color: #ffffff;
  text-align: center;
  margin: 0 0 20px 0;
  font-weight: 800;
  letter-spacing: 3px;
  font-size: 24px;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  gap: 1px;
}

.letter {
  display: inline-block;
  animation: letter-glow 2s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes letter-glow {
  0%, 100% { text-shadow: 0 0 5px rgba(37, 99, 235, 0.5); }
  50% { text-shadow: 0 0 20px rgba(37, 99, 235, 0.8), 0 0 40px rgba(124, 58, 237, 0.4); }
}

/* ========== DIVIDER ========== */
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 20px 24px;
}

.line-left, .line-right {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.5));
}

.line-right {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.5), transparent);
}

.center-pulse {
  width: 8px;
  height: 8px;
  background: #2563eb;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);
  animation: center-pulse 2s ease-in-out infinite;
}

@keyframes center-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
}

/* ========== USER SECTION (NOVO) ========== */
.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  margin: 0 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(29, 185, 84, 0.5);
  box-shadow: 0 0 10px rgba(29, 185, 84, 0.3);
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-name {
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-plan {
  color: #1db954;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ========== NAVEGAÇÃO ========== */
.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  margin: 4px 12px;
  text-decoration: none;
  color: #94a3b8;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  width: calc(100% - 24px);
  cursor: pointer;
  font-family: inherit;
}

.nav-link:hover {
  color: #f8fafc;
  background: rgba(37, 99, 235, 0.1);
  transform: translateX(4px);
}

.nav-link:hover i {
  color: #2563eb;
  transform: scale(1.1);
}

.nav-link:hover .icon-match {
  filter: brightness(0) invert(1);
  transform: scale(1.1);
}

.router-link-active {
  color: #f8fafc;
  background: rgba(37, 99, 235, 0.15);
}

.router-link-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(180deg, #2563eb, #7c3aed);
  border-radius: 0 3px 3px 0;
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);
}

.router-link-active i {
  color: #2563eb;
}

.router-link-active .icon-match {
  filter: brightness(0) invert(1);
}

.nav-link i {
  width: 20px;
  text-align: center;
  font-size: 16px;
  transition: all 0.3s ease;
}

.icon-match {
  width: 18px;
  height: 18px;
  object-fit: contain;
  filter: brightness(0) invert(0.6);
  transition: all 0.3s ease;
}

/* ========== LOGOUT ITEM (NOVO) ========== */
.logout-item {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-link {
  color: #ff4757 !important;
}

.logout-link:hover {
  background: rgba(255, 71, 87, 0.15) !important;
  color: #ff6b7a !important;
}

.logout-link:hover i {
  color: #ff4757 !important;
}

/* Scrollbar estilizada */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.3);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 99, 235, 0.5);
}

/* ========== RESPONSIVIDADE ========== */
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
  }

  .close-btn {
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
  }

  .logo-container {
    width: 80px;
    height: 80px;
    margin-top: 20px;
  }

  .logo-core {
    width: 48px;
    height: 48px;
  }

  .logo-icon {
    font-size: 22px;
  }

  .logo-text {
    font-size: 20px;
  }
  
  .user-section {
    padding: 12px 16px;
  }
}
</style>