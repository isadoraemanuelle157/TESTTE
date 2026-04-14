<template>
  <aside class="sidebar" :class="{ 'open': isOpen }">
    <div class="sidebar-content">
      <!-- Botão fechar (X) dentro do sidebar -->
    

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
            <li>
              <router-link to="/" class="nav-link" @click="$emit('close')">
                <i class="fa fa-home"></i>
                <span>Home</span>
              </router-link>
            </li>

            <li>
              <router-link to="/search" class="nav-link" @click="$emit('close')">
                <i class="fa fa-search"></i>
                <span>Pesquisar</span>
              </router-link>
            </li>

            <li>
              <router-link to="/curtidas" class="nav-link" @click="$emit('close')">
                <i class="fa fa-heart"></i>
                <span>Curtidas</span>
              </router-link>
            </li>

            <li>
              <router-link to="/favoritas" class="nav-link" @click="$emit('close')">
                <i class="fa fa-star"></i>
                <span>Favoritas</span>
              </router-link>
            </li>

            <li>
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

  emits: ['close']
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

/* ... (todo o resto do CSS do logo permanece igual) ... */

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

/* ... (resto do CSS permanece igual) ... */

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
    width: 280px; /* Um pouco maior no mobile */
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
    margin-top: 20px; /* Espaço para o botão fechar */
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
}
</style>