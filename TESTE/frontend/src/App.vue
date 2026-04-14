<template>
  <div class="app" :class="{ 'sidebar-open': sidebarOpen }">
    
    <!-- 🔥 Botão de Menu Fixo no Canto Superior Esquerdo -->
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

    <!-- Sidebar (agora é um overlay drawer) -->
    <Sidebar 
      :isOpen="sidebarOpen" 
      @close="sidebarOpen = false"
    />

    <!-- Overlay escuro quando sidebar aberto (mobile) -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <div class="main" :class="{ 'full-width': !sidebarOpen }">
      <Navbar/>
      <div class="content">
        <router-view />
      </div>
    </div>

  </div>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue"
import Navbar from "@/components/Navbar.vue"

export default {
  components: {
    Sidebar,
    Navbar
  },
  
  data() {
    return {
      sidebarOpen: false // 🔥 Começa fechado por padrão
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

/* layout geral */
.app {
  display: flex;
  height: 100vh;
  position: relative;
}

/* 🔥 Botão de Menu Fixo */
.menu-toggle {
  position: fixed;
  top: 20px;
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

/* Hamburger Icon */
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

/* Animação quando ativo */


/* 🔥 Overlay escuro */
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

/* lado direito */
.main {
    width: 100%;
  overflow-x: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: 0; /* Sem margem quando sidebar fechado */
  transition: margin-left 0.3s ease;
}

/* Quando sidebar está aberto em desktop */
.app.sidebar-open .main {
  margin-left: 260px; /* Empurra conteúdo no desktop */
}

/* 🔥 Conteúdo que rola */
.content {
  flex: 1;
  overflow-y: auto;
  padding-top: 80px; /* Espaço para o botão de menu não cobrir conteúdo */
}

/* ========== RESPONSIVIDADE ========== */
@media (max-width: 768px) {
  .menu-toggle {
    top: 16px;
    left: 16px;
    width: 44px;
    height: 44px;
  }

  .menu-toggle.active {
    left: 16px; /* Não move no mobile, fica no mesmo lugar */
    background: rgba(236, 72, 153, 0.9);
  }

  /* No mobile, sidebar é overlay e não empurra conteúdo */
  .app.sidebar-open .main {
    margin-left: 0;
  }

  .content {
    padding-top: 70px;
  }
}

/* Animação suave para o botão */
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