<template>
    <aside class="sidebar">
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
              <router-link to="/" class="nav-link">
                <i class="fa fa-home"></i>
                <span>Home</span>
              </router-link>
            </li>

            <li>
              <router-link to="/search" class="nav-link">
                <i class="fa fa-search"></i>
                <span>Pesquisar</span>
              </router-link>
            </li>

            <li>
              <router-link to="/curtidas" class="nav-link">
                <i class="fa fa-heart"></i>
                <span>Curtidas</span>
              </router-link>
            </li>

            <li>
              <router-link to="/favoritas" class="nav-link">
                <i class="fa fa-star"></i>
                <span>Favoritas</span>
              </router-link>
            </li>

            <li>
              <router-link to="/playlist" class="nav-link">
                <i class="fa fa-list-ul"></i>
                <span>Playlists</span>
              </router-link>
            </li>

            <li>
              <router-link to="/salademusica" class="nav-link">
                <i class="fa fa-music"></i>
                <span>Sala de Música</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/karaoke" class="nav-link">
                <i class="fa fa-microphone"></i>
                <span>Karaoke</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/desafiomusical" class="nav-link">
                <i class="fa fa-trophy"></i>
                <span>Desafio Musical</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/carregamento2" class="nav-link">
                <i class="fa fa-spinner"></i>
                <span>Carregamento 1</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/carregamento1" class="nav-link">
                <i class="fa fa-circle-o-notch"></i>
                <span>Carregamento 2</span>
              </router-link>
            </li>
            
            <li>
              <router-link to="/chatiamusica" class="nav-link">
                <i class="fa fa-comments"></i>
                <span>Chat IA</span>
              </router-link>
            </li>

            <li>
              <router-link to="/matchmusical" class="nav-link">
                <img src="@/assets/icon-match.png" class="icon-match">
                <span>Match Musical</span>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  </template>

  <script>
  export default {
    name: "Sidebar"
  }
  </script>

  <style scoped>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

  .sidebar {
    width: 260px;
    height: 100vh;
    background: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
    padding: 30px 0;
    border-right: 1px solid rgba(37, 99, 235, 0.1);
    position: fixed;
    left: 0;
    top: 0;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    overflow: hidden;
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

  /* Anéis orbitais */
  .logo-orbit {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .orbit-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid transparent;
    animation: orbit-spin linear infinite;
  }

  .ring-1 {
    width: 100%;
    height: 100%;
    border-top-color: #2563eb;
    border-right-color: rgba(37, 99, 235, 0.3);
    animation-duration: 8s;
    box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
  }

  .ring-2 {
    width: 75%;
    height: 75%;
    border-bottom-color: #7c3aed;
    border-left-color: rgba(124, 58, 237, 0.3);
    animation-duration: 6s;
    animation-direction: reverse;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
  }

  .ring-3 {
    width: 50%;
    height: 50%;
    border-top-color: #ec4899;
    border-bottom-color: rgba(236, 72, 153, 0.3);
    animation-duration: 4s;
    box-shadow: 0 0 10px rgba(236, 72, 153, 0.2);
  }

  @keyframes orbit-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Núcleo da logo */
  .logo-core {
    position: relative;
    z-index: 10;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      0 0 30px rgba(37, 99, 235, 0.6),
      0 0 60px rgba(124, 58, 237, 0.4),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
    animation: core-pulse 3s ease-in-out infinite;
  }

  @keyframes core-pulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 
        0 0 30px rgba(37, 99, 235, 0.6),
        0 0 60px rgba(124, 58, 237, 0.4),
        inset 0 0 20px rgba(255, 255, 255, 0.1);
    }
    50% { 
      transform: scale(1.05);
      box-shadow: 
        0 0 40px rgba(37, 99, 235, 0.8),
        0 0 80px rgba(124, 58, 237, 0.6),
        inset 0 0 30px rgba(255, 255, 255, 0.2);
    }
  }

  /* Ondas de pulso */
  .pulse-waves {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-waves span {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid rgba(37, 99, 235, 0.5);
    animation: wave-expand 2s ease-out infinite;
  }

  .pulse-waves span:nth-child(1) { animation-delay: 0s; }
  .pulse-waves span:nth-child(2) { animation-delay: 0.6s; }
  .pulse-waves span:nth-child(3) { animation-delay: 1.2s; }

  @keyframes wave-expand {
    0% {
      transform: scale(1);
      opacity: 0.8;
      border-color: rgba(37, 99, 235, 0.8);
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
      border-color: rgba(236, 72, 153, 0);
    }
  }

  /* Ícone de fones */
  .logo-icon {
    position: relative;
    font-size: 28px;
    color: white;
    z-index: 11;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  /* Barras de som animadas */
  .sound-bars {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 2px;
    align-items: flex-end;
    height: 12px;
  }

  .sound-bars span {
    width: 3px;
    background: white;
    border-radius: 2px;
    animation: sound-bar 0.8s ease-in-out infinite;
  }

  .sound-bars span:nth-child(1) { height: 40%; animation-delay: 0s; }
  .sound-bars span:nth-child(2) { height: 70%; animation-delay: 0.1s; }
  .sound-bars span:nth-child(3) { height: 50%; animation-delay: 0.2s; }
  .sound-bars span:nth-child(4) { height: 80%; animation-delay: 0.3s; }

  @keyframes sound-bar {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.4); }
  }

  /* Glow externo */
  .logo-glow {
    position: absolute;
    inset: -20px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, transparent 70%);
    filter: blur(20px);
    z-index: -1;
    animation: glow-rotate 10s linear infinite;
  }

  @keyframes glow-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
    text-shadow: 
      0 0 10px rgba(37, 99, 235, 0.5),
      0 0 20px rgba(124, 58, 237, 0.3);
    animation: letter-glow 2s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  @keyframes letter-glow {
    0%, 100% { 
      text-shadow: 
        0 0 10px rgba(37, 99, 235, 0.5),
        0 0 20px rgba(124, 58, 237, 0.3);
    }
    50% { 
      text-shadow: 
        0 0 20px rgba(37, 99, 235, 0.8),
        0 0 30px rgba(236, 72, 153, 0.6),
        0 0 40px rgba(124, 58, 237, 0.4);
    }
  }

  /* ========== DIVIDER FODA ========== */
  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0 20px 20px;
    height: 20px;
    position: relative;
  }

  .line-left, .line-right {
    height: 1px;
    flex: 1;
    background: linear-gradient(90deg, transparent, #2563eb);
  }

  .line-right {
    background: linear-gradient(90deg, #2563eb, transparent);
  }

  .center-pulse {
    width: 8px;
    height: 8px;
    background: #2563eb;
    border-radius: 50%;
    box-shadow: 
      0 0 10px #2563eb,
      0 0 20px #7c3aed,
      0 0 30px #ec4899;
    animation: center-pulse 2s ease-in-out infinite;
  }

  @keyframes center-pulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 
        0 0 10px #2563eb,
        0 0 20px #7c3aed,
        0 0 30px #ec4899;
    }
    50% { 
      transform: scale(1.3);
      box-shadow: 
        0 0 15px #2563eb,
        0 0 30px #7c3aed,
        0 0 45px #ec4899;
    }
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

  /* ========== RESPONSIVIDADE ========== */
  @media (max-width: 768px) {
    .sidebar {
      width: 260px;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 1000;
    }
    
    .sidebar.open {
      transform: translateX(0);
    }
    
    .logo-container {
      width: 80px;
      height: 80px;
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