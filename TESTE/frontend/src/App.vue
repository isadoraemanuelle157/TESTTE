<template>
  <div class="app" :class="{ 'sidebar-open': sidebarOpen }">
    
    <!-- Botão de Menu -->
    <button 
      class="menu-toggle"
      @click="toggleSidebar"
      :class="{ 'active': sidebarOpen }"
      aria-label="Toggle menu"
    >
      <div class="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <!-- Sidebar -->
    <Sidebar 
      :isOpen="sidebarOpen" 
      @close="sidebarOpen = false"
    />

    <!-- Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <div class="main" :class="{ 'full-width': !sidebarOpen }">
      <!-- NAVBAR - SEMPRE VISÍVEL -->
      <Navbar :sidebarOpen="sidebarOpen" />
      
      <div class="content">
        <router-view />
        <!-- FOOTER - SÓ SOME NAS PÁGINAS DE AUTH E KARAOKE -->
        <Footer v-show="showFooter" />
      </div>
    </div>

    <!-- MUSICPLAYER - SEMPRE VISÍVEL -->
    <MusicPlayer />
  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue"
import Navbar from "@/components/Navbar.vue"
import MusicPlayer from "@/components/MusicPlayer.vue"
import Footer from "@/components/Footer.vue"

export default {
  name: 'App',
  
  components: {
    Sidebar,
    Navbar,
    MusicPlayer,
    Footer
  },
  
  data() {
    return {
      sidebarOpen: false,
      showFooter: true
    }
  },

  watch: {
    // Observa mudanças de rota
    '$route.path': {
      immediate: true,
      handler(newPath) {
        const noFooterPages = ['/login', '/registrar', '/registrar2', '/recuperar-senha', '/karaoke', '/desafiomusical']
        this.showFooter = !noFooterPages.includes(newPath)
        console.log('[App] Rota:', newPath, '| Footer visível:', this.showFooter)
      }
    }
  },

  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

html, body, #app {
  margin: 0;
  height: 100%;
}

.app {
  display: flex;
  height: 100vh;
  position: relative;
}

.menu-toggle {
  position: fixed;
  top: 12px;
  left: 20px;
  z-index: 1001;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 20px rgba(37, 99, 235, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.menu-toggle:hover {
  transform: scale(1.1);
  box-shadow: 
    0 6px 30px rgba(37, 99, 235, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.menu-toggle.active {
  background: linear-gradient(135deg, #ec4899 0%, #7c3aed 100%);
}

.hamburger {
  width: 24px;
  height: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.menu-toggle.active .hamburger span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.menu-toggle.active .hamburger span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.menu-toggle.active .hamburger span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 5, 8, 0.8);
  backdrop-filter: blur(4px);
  z-index: 998;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.main {
  width: 100%;
  overflow-x: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

.app.sidebar-open .main {
  margin-left: 260px;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding-top: 80px;
}

@media (max-width: 768px) {
  .menu-toggle {
    top: 8px;
    left: 16px;
    width: 44px;
    height: 44px;
  }

  .menu-toggle.active {
    left: 16px;
    background: rgba(236, 72, 153, 0.9);
  }

  .app.sidebar-open .main {
    margin-left: 0;
  }

  .content {
    padding-top: 70px;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 
      0 4px 20px rgba(37, 99, 235, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 6px 30px rgba(37, 99, 235, 0.6),
      0 0 20px rgba(124, 58, 237, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.2);
  }
}

.menu-toggle {
  animation: pulse-glow 3s ease-in-out infinite;
}

.menu-toggle:hover {
  animation: none;
}
</style>