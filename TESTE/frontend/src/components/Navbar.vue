<!-- Navbar.vue -->
<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-content">
      <div class="navbar-brand" @click="$router.push('/')">
        <div class="brand-icon">
          <i class="fa fa-headphones"></i>
        </div>
        <span class="brand-text">SoundUp</span>
      </div>

      <div class="nav-links" v-if="showNavLinks">
        <router-link to="/" class="nav-link" exact-active-class="active">
          <i class="fa fa-home"></i>
          <span>Início</span>
        </router-link>
        <router-link to="/explore" class="nav-link" exact-active-class="active">
          <i class="fa fa-compass"></i>
          <span>Explorar</span>
        </router-link>
        <router-link to="/library" class="nav-link" exact-active-class="active">
          <i class="fa fa-music"></i>
          <span>Biblioteca</span>
        </router-link>
      </div>

      <div class="nav-right">
        <div class="search-container" :class="{ expanded: isSearchFocused }">
          <div class="search-wrapper">
            <i class="fa fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Buscar músicas, artistas..."
              class="search-input"
              v-model="searchQuery"
              @focus="isSearchFocused = true"
              @blur="isSearchFocused = false"
              @keyup.enter="handleSearch"
            />
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
              <i class="fa fa-times-circle"></i>
            </button>
          </div>
        </div>

        <!-- NOTIFICAÇÕES -->
        <div class="notif-wrapper">
          <button
            class="icon-btn notif-btn"
            @click="toggleNotifications"
            :class="{ active: showNotifications }"
          >
            <div class="btn-bg"></div>
            <i class="fa" :class="hasNewNotifications ? 'fa-bell' : 'fa-bell-o'"></i>
            <span v-if="notificationCount > 0" class="badge pulse">
              {{ notificationCount > 9 ? '9+' : notificationCount }}
            </span>
          </button>

          <transition name="dropdown">
            <div v-if="showNotifications" class="dropdown-panel notif-dropdown">
              <div class="dropdown-header">
                <h4>Notificações</h4>
                <button
                  v-if="notificationCount > 0"
                  class="text-btn"
                  @click="markAllRead"
                >
                  Marcar todas
                </button>
              </div>

              <div class="dropdown-body">
                <div v-if="notifications.length === 0" class="empty-state">
                  <i class="fa fa-bell-slash"></i>
                  <p>Sem notificações</p>
                </div>

                <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  class="notif-item"
                  :class="{ unread: !notif.read }"
                  @click="markAsRead(notif)"
                >
                  <div class="notif-avatar" :style="{ background: notif.color }">
                    <i :class="notif.icon"></i>
                  </div>

                  <div class="notif-content">
                    <p class="notif-title">{{ notif.title }}</p>
                    <p class="notif-time">{{ notif.time }}</p>

                    <div
                      v-if="notif.tipo === 'follow_request'"
                      class="notif-actions"
                      @click.stop
                    >
                      <button class="notif-action accept" @click="aceitar(notif)">
                        Aceitar
                      </button>
                    </div>
                  </div>

                  <div v-if="!notif.read" class="unread-dot"></div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- USER MENU -->
        <div class="user-wrapper" v-if="isLoggedIn">
          <button
            class="user-btn"
            @click="toggleUserMenu"
            :class="{ active: showUserMenu }"
          >
            <div class="user-avatar">
              <img
                v-if="userAvatar"
                :src="userAvatar"
                alt="Avatar"
                @error="handleAvatarError"
              />
              <i v-else class="fa fa-user"></i>
            </div>
            <span class="user-name">{{ userName }}</span>
            <i class="fa fa-chevron-down arrow-icon" :class="{ rotate: showUserMenu }"></i>
          </button>

          <transition name="dropdown">
            <div v-if="showUserMenu" class="dropdown-panel user-dropdown">
              <div class="dropdown-header user-header">
                <div class="header-avatar">
                  <img v-if="userAvatar" :src="userAvatar" @error="handleAvatarError" />
                  <i v-else class="fa fa-user"></i>
                </div>
                <div class="header-info">
                  <h4>{{ userName }}</h4>
                  <p>{{ userEmail }}</p>
                </div>
              </div>

              <div class="dropdown-body">
                <div class="dropdown-item" @click="goToProfile">
                  <div class="item-icon">
                    <i class="fa fa-user-circle"></i>
                  </div>
                  <span>Meu Perfil</span>
                </div>

                <div class="dropdown-item" @click="goToSettings">
                  <div class="item-icon">
                    <i class="fa fa-cog"></i>
                  </div>
                  <span>Configurações</span>
                </div>

                <div class="dropdown-item" @click="goToLibrary">
                  <div class="item-icon">
                    <i class="fa fa-heart"></i>
                  </div>
                  <span>Favoritos</span>
                </div>

                <div class="dropdown-divider"></div>

                <div class="dropdown-item" @click="goToHelp">
                  <div class="item-icon">
                    <i class="fa fa-question-circle"></i>
                  </div>
                  <span>Ajuda & Suporte</span>
                </div>

                <div class="dropdown-item danger" @click="handleLogout">
                  <div class="item-icon" style="background: rgba(239, 68, 68, 0.2); color: #ef4444;">
                    <i class="fa fa-sign-out"></i>
                  </div>
                  <span>Sair</span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <div class="auth-buttons" v-else>
          <button class="btn-login" @click="handleLogin">
            Entrar
          </button>
          <button class="btn-register" @click="handleRegister">
            Criar conta
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from 'axios'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Navbar',

  props: {
    showBrand: {
      type: Boolean,
      default: true
    },
    showNavLinks: {
      type: Boolean,
      default: false
    }
  },

  emits: ['login', 'register', 'logout', 'search'],

  setup(props, { emit }) {
    const router = useRouter()

    const isScrolled = ref(false)
    const showNotifications = ref(false)
    const showUserMenu = ref(false)
    const isSearchFocused = ref(false)
    const searchQuery = ref('')

    const isLoggedIn = ref(false)
    const userName = ref('')
    const userEmail = ref('')
    const userAvatar = ref(null)
    const userId = ref(null)

    const notifications = ref([])
    const notificationCount = ref(0)
    const hasNewNotifications = computed(() => notificationCount.value > 0)

    const loadUserData = () => {
      const storedUser = localStorage.getItem('usuario')
      const storedProfile = localStorage.getItem('usuario_perfil')
      const loggedIn = localStorage.getItem('isLoggedIn')

      if (loggedIn === 'true' && (storedUser || storedProfile)) {
        const userData = storedUser ? JSON.parse(storedUser) : {}
        const profileData = storedProfile ? JSON.parse(storedProfile) : {}

        const mergedUser = {
          ...userData,
          ...profileData
        }

        isLoggedIn.value = true
        userName.value = mergedUser.nome || 'Usuário'
        userEmail.value = mergedUser.email || ''
        userAvatar.value = mergedUser.avatar || null
        userId.value = mergedUser.id || mergedUser._id || null
      } else {
        isLoggedIn.value = false
        userName.value = ''
        userEmail.value = ''
        userAvatar.value = null
        userId.value = null
      }
    }

    const formatTimeAgo = (dateString) => {
      if (!dateString) return 'Agora'
      const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)

      if (diff < 60) return 'Agora'
      if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`
      if (diff < 86400) return `${Math.floor(diff / 3600)} h atrás`
      return `${Math.floor(diff / 86400)} dia(s) atrás`
    }

    const getNotifVisual = (tipo) => {
      const map = {
        follow_request: {
          icon: 'fa fa-user-plus',
          color: 'linear-gradient(135deg, #2563eb, #7c3aed)'
        },
        follow_accept: {
          icon: 'fa fa-check',
          color: 'linear-gradient(135deg, #10b981, #34d399)'
        },
        follow_reject: {
          icon: 'fa fa-times',
          color: 'linear-gradient(135deg, #ef4444, #f97316)'
        }
      }

      return map[tipo] || {
        icon: 'fa fa-bell',
        color: 'linear-gradient(135deg, #64748b, #334155)'
      }
    }

    const carregarNotificacoes = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await axios.get('http://localhost:3002/notificacoes', {
          headers: { Authorization: `Bearer ${token}` }
        })

        notifications.value = (res.data || []).map(n => {
          const visual = getNotifVisual(n.tipo)

          const nome = n.usuarioOrigem?.nome || 'Alguém'

let mensagemFormatada = n.mensagem

// exemplo: você pode personalizar por tipo
if (n.tipo === 'follow_request') {
  mensagemFormatada = `${nome} quer te seguir`
}

if (n.tipo === 'follow_accept') {
  mensagemFormatada = `${nome} aceitou sua solicitação`
}

          return {
            id: n._id,
            tipo: n.tipo,
            title: mensagemFormatada,
            time: formatTimeAgo(n.createdAt),
            icon: visual.icon,
            color: visual.color,
            read: n.lida,
            user: n.usuarioOrigem
          }
        })

        notificationCount.value = notifications.value.filter(n => !n.read).length
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
      }
    }

    const handleScroll = () => {
      isScrolled.value = window.scrollY > 20
    }

    const toggleNotifications = async () => {
      showNotifications.value = !showNotifications.value
      showUserMenu.value = false

      if (showNotifications.value) {
        await carregarNotificacoes()
      }
    }

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
      showNotifications.value = false
    }

    const markAsRead = async (notif) => {
      try {
        if (notif.read) return

        const token = localStorage.getItem('token')
        await axios.patch(
          `http://localhost:3002/notificacoes/${notif.id}/lida`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )

        notif.read = true
        notificationCount.value = Math.max(0, notificationCount.value - 1)
      } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error)
      }
    }

 const markAllRead = async () => {
  try {
    const token = localStorage.getItem('token')

    await axios.patch(
      'http://localhost:3002/notificacoes/marcar-todas',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )

    notifications.value.forEach(n => n.read = true)
    notificationCount.value = 0

  } catch (error) {
    console.error('Erro ao marcar todas:', error)
  }
}

    const aceitar = async (notif) => {
      try {
        const token = localStorage.getItem('token')

        await axios.post(
          'http://localhost:3002/follows/aceitar',
          { solicitanteId: notif.user?._id || notif.user?.id },
          { headers: { Authorization: `Bearer ${token}` } }
        )

        
        await carregarNotificacoes()
        await markAsRead(notif)

// remove da lista (opcional melhor UX)
notifications.value = notifications.value.filter(n => n.id !== notif.id)

notificationCount.value = notifications.value.filter(n => !n.read).length

        window.dispatchEvent(new CustomEvent('follow-request-accepted'))
      } catch (error) {
        console.error('Erro ao aceitar solicitação:', error)
      }
    }

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        emit('search', searchQuery.value)
        router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
      }
    }

    const handleLogin = () => {
      showUserMenu.value = false
      emit('login')
      router.push('/login')
    }

    const handleRegister = () => {
      showUserMenu.value = false
      emit('register')
      router.push('/registrar')
    }

    const handleLogout = () => {
      localStorage.removeItem('usuario')
      localStorage.removeItem('usuario_perfil')
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('token')

      isLoggedIn.value = false
      userName.value = ''
      userEmail.value = ''
      userAvatar.value = null
      userId.value = null
      notifications.value = []
      notificationCount.value = 0

      showUserMenu.value = false
      showNotifications.value = false

      window.dispatchEvent(new Event('user-logged-out'))
      emit('logout')
      router.push('/login')
    }

    const goToProfile = () => {
      showUserMenu.value = false
      router.push('/perfil')
    }

    const goToSettings = () => {
      showUserMenu.value = false
      router.push('/settings')
    }

    const goToLibrary = () => {
      showUserMenu.value = false
      router.push('/favoritas')
    }

    const goToHelp = () => {
      showUserMenu.value = false
      router.push('/help')
    }

    const handleAvatarError = () => {
      userAvatar.value = null
    }

    const handleClickOutside = (e) => {
      const nav = document.querySelector('.navbar')
      if (nav && !nav.contains(e.target)) {
        showNotifications.value = false
        showUserMenu.value = false
      }
    }

    const handleUserLoggedIn = async () => {
      loadUserData()
      await carregarNotificacoes()
    }

    const handleUserLoggedOut = () => {
      isLoggedIn.value = false
      userName.value = ''
      userEmail.value = ''
      userAvatar.value = null
      userId.value = null
      notifications.value = []
      notificationCount.value = 0
      showUserMenu.value = false
    }

    const handleProfileUpdated = () => {
      loadUserData()
    }

    const handleStorage = (e) => {
      if (
        e.key === 'usuario' ||
        e.key === 'usuario_perfil' ||
        e.key === 'isLoggedIn'
      ) {
        loadUserData()
      }
    }

    onMounted(async () => {
      loadUserData()

      if (isLoggedIn.value) {
        await carregarNotificacoes()
      }

      window.addEventListener('scroll', handleScroll)
      document.addEventListener('click', handleClickOutside)

      window.addEventListener('user-logged-in', handleUserLoggedIn)
      window.addEventListener('user-logged-out', handleUserLoggedOut)
      window.addEventListener('perfil-updated', handleProfileUpdated)
      window.addEventListener('storage', handleStorage)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)

      window.removeEventListener('user-logged-in', handleUserLoggedIn)
      window.removeEventListener('user-logged-out', handleUserLoggedOut)
      window.removeEventListener('perfil-updated', handleProfileUpdated)
      window.removeEventListener('storage', handleStorage)
    })

    return {
      isScrolled,
      showNotifications,
      showUserMenu,
      isSearchFocused,
      searchQuery,
      notificationCount,
      hasNewNotifications,
      notifications,
      isLoggedIn,
      userName,
      userEmail,
      userAvatar,
      toggleNotifications,
      toggleUserMenu,
      markAsRead,
      markAllRead,
      aceitar,
      handleSearch,
      handleLogin,
      handleRegister,
      handleLogout,
      goToProfile,
      goToSettings,
      goToLibrary,
      goToHelp,
      handleAvatarError
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');


/* ===== NAVBAR PRINCIPAL ===== */
.navbar {
  position: fixed;
  top: 0;
  left: 260px;
  right: 0;
  height: 70px;
  z-index: 1000;
  transition: all 0.3s ease;
}


.navbar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg,
    rgba(5, 5, 8, 0.95) 0%,
    rgba(10, 10, 26, 0.85) 50%,
    rgba(10, 10, 26, 0.7) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
  transition: all 0.3s ease;
}


.navbar.scrolled::before {
  background: linear-gradient(180deg,
    rgba(5, 5, 8, 0.98) 0%,
    rgba(10, 10, 26, 0.95) 100%
  );
  border-bottom: 1px solid rgba(37, 99, 235, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
}


.navbar-content {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
}


/* ===== BRAND ===== */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}


.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  transition: transform 0.3s ease;
}


.navbar-brand:hover .brand-icon {
  transform: scale(1.05) rotate(-5deg);
}


.brand-text {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}


/* ===== NAV LINKS ===== */
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 40px;
}


.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}


.nav-link:hover {
  color: #f8fafc;
  background: rgba(37, 99, 235, 0.1);
}


.nav-link.active {
  color: #f8fafc;
  background: rgba(37, 99, 235, 0.15);
}


.nav-link.active::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 3px 3px 0 0;
}


/* ===== RIGHT SECTION ===== */
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}


/* ===== SEARCH ===== */
.search-container {
  position: relative;
  transition: all 0.3s ease;
}


.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}


.search-icon {
  position: absolute;
  left: 16px;
  color: #64748b;
  font-size: 14px;
  transition: color 0.3s ease;
  z-index: 2;
}


.search-input {
  width: 280px;
  height: 42px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 21px;
  padding: 0 40px;
  color: #f8fafc;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}


.search-input::placeholder {
  color: #64748b;
}


.search-input:focus {
  width: 320px;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}


.search-input:focus + .search-icon,
.search-container.expanded .search-icon {
  color: #2563eb;
}


.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  transition: color 0.3s ease;
}


.clear-search:hover {
  color: #f8fafc;
}


/* ===== ICON BUTTONS ===== */
.icon-btn {
  position: relative;
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}


.btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(124, 58, 237, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
}


.icon-btn:hover {
  color: #f8fafc;
  border-color: rgba(37, 99, 235, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.2);
}


.icon-btn:hover .btn-bg {
  opacity: 1;
}


.icon-btn.active {
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.5);
  background: rgba(37, 99, 235, 0.1);
}


/* Badge */
.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ef4444, #f43f5e);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border: 2px solid #050508;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}


.badge.pulse {
  animation: pulse 2s infinite;
}


@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}


/* ===== AUTH BUTTONS (Não logado) ===== */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}


.btn-login {
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}


.btn-login:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}


.btn-register {
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}


.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}


/* ===== USER BUTTON (Logado) ===== */
.user-wrapper {
  position: relative;
}


.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 4px 4px 4px 4px;
  padding-right: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  cursor: pointer;
  transition: all 0.3s ease;
}


.user-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.15);
}


.user-btn.active {
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.5);
}


.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 16px;
  color: white;
}


.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.user-name {
  color: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.arrow-icon {
  font-size: 12px;
  color: #64748b;
  transition: transform 0.3s ease;
  margin-left: 4px;
}


.arrow-icon.rotate {
  transform: rotate(180deg);
}


/* ===== DROPDOWNS ===== */
.notif-wrapper,
.user-wrapper {
  position: relative;
}


.dropdown-panel {
  position: absolute;
  top: 55px;
  right: 0;
  width: 360px;
  background: linear-gradient(180deg,
    rgba(20, 20, 35, 0.98) 0%,
    rgba(15, 15, 25, 0.98) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 1001;
}


.notif-dropdown {
  right: -10px;
}


.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}


.dropdown-header h4 {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}


.text-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}


.text-btn:hover {
  background: rgba(37, 99, 235, 0.1);
}


.dropdown-body {
  max-height: 400px;
  overflow-y: auto;
}


.dropdown-body::-webkit-scrollbar {
  width: 6px;
}


.dropdown-body::-webkit-scrollbar-track {
  background: transparent;
}


.dropdown-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}


/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  text-align: center;
}


.empty-state i {
  font-size: 40px;
  margin-bottom: 12px;
  opacity: 0.5;
}


.empty-state p {
  font-size: 14px;
  margin: 0;
}


/* Notif Item */
.notif-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}


.notif-item:hover {
  background: rgba(37, 99, 235, 0.05);
}


.notif-item.unread {
  background: rgba(37, 99, 235, 0.08);
}


.notif-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  flex-shrink: 0;
}


.notif-content {
  flex: 1;
  min-width: 0;
}


.notif-title {
  color: #f8fafc;
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  line-height: 1.4;
}


.notif-time {
  color: #64748b;
  font-size: 12px;
  margin: 0;
}


.unread-dot {
  width: 8px;
  height: 8px;
  background: #2563eb;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
}


/* User Dropdown Specifics */
.user-dropdown {
  width: 320px;
}


.user-header {
  background: linear-gradient(135deg,
    rgba(37, 99, 235, 0.15) 0%,
    rgba(124, 58, 237, 0.15) 100%
  );
  padding: 24px 20px;
}


.header-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.1);
}


.header-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.header-info {
  margin-left: 16px;
}


.header-info h4 {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}


.header-info p {
  color: #94a3b8;
  font-size: 13px;
  margin: 0;
}


/* Dropdown Items */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #cbd5e1;
  font-size: 14px;
}


.dropdown-item:hover {
  background: rgba(37, 99, 235, 0.1);
  color: #f8fafc;
}


.item-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}


.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 8px 0;
}

/* ===== TRANSITIONS ===== */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.notif-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.notif-action {
  border: none;
  border-radius: 8px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.notif-action.accept {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.notif-action.accept:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .navbar {
    left: 220px;
  }
 
  .search-input {
    width: 200px;
  }
 
  .search-input:focus {
    width: 240px;
  }
}


@media (max-width: 992px) {
  .navbar {
    left: 0;
  }
 
  .navbar-content {
    padding: 0 20px;
  }
 
  .nav-links {
    display: none;
  }
 
  .brand-text {
    display: none;
  }
}


@media (max-width: 768px) {
  .search-container {
    display: none;
  }
 
  .user-name {
    display: none;
  }
 
  .user-btn {
    padding-right: 12px;
  }
 
  .auth-buttons {
    gap: 8px;
  }
 
  .btn-login,
  .btn-register {
    padding: 8px 16px;
    font-size: 13px;
  }
 
  .dropdown-panel {
    position: fixed;
    top: 70px;
    left: 10px;
    right: 10px;
    width: auto;
  }
}


@media (max-width: 480px) {
  .navbar-content {
    padding: 0 16px;
  }
 
  .icon-btn {
    width: 38px;
    height: 38px;
  }
 
  .auth-buttons .btn-login {
    display: none;
  }
}
</style> 