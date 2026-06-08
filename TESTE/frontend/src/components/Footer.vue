<template>
  <footer class="soundup-footer">
    <div class="footer-container">
      
      <!-- Logo e Descrição -->
      <div class="footer-brand">
        <div class="footer-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <span class="logo-text">SoundUp</span>
        </div>
        <p class="footer-desc">
          A melhor experiência musical. Descubra, ouça e compartilhe suas músicas favoritas com o mundo.
        </p>
        <div class="footer-social">
          <a href="#" class="social-link" aria-label="Instagram" @click.prevent="openSocial('instagram')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Twitter" @click.prevent="openSocial('twitter')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="YouTube" @click.prevent="openSocial('youtube')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.06c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Facebook" @click.prevent="openSocial('facebook')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
        </div>
      </div>

      <!-- Links Rápidos -->
      <div class="footer-section">
        <h4 class="footer-title">Navegação</h4>
        <ul class="footer-links">
          <li><a href="#" @click.prevent="navigateTo('/')">Início</a></li>
          <li><a href="#" @click.prevent="navigateTo('/search')">Buscar</a></li>
          <li><a href="#" @click.prevent="navigateTo('/playlist')">Playlists</a></li>
          <li><a href="#" @click.prevent="navigateTo('/artistas')">Artistas</a></li>
          <li><a href="#" @click.prevent="navigateTo('/dashboard')">Dashboard</a></li>
        </ul>
      </div>

      <!-- Minha Conta -->
      <div class="footer-section">
        <h4 class="footer-title">Minha Conta</h4>
        <ul class="footer-links">
          <li><a href="#" @click.prevent="navigateTo('/perfil')">Perfil</a></li>
          <li><a href="#" @click.prevent="navigateTo('/curtidas')">Curtidas</a></li>
          <li><a href="#" @click.prevent="navigateTo('/favoritas')">Favoritas</a></li>
         <li>
  <a href="#" @click.prevent="goToMadeForYou">
    Feito Para Você
  </a>
</li>
          <li><a href="#" @click.prevent="navigateTo('/notificacoes')">Notificações</a></li>
        </ul>
      </div>

      <!-- Diversão -->
      <div class="footer-section">
        <h4 class="footer-title">Diversão</h4>
        <ul class="footer-links">
          <li><a href="#" @click.prevent="navigateTo('/desafiomusical')">Desafio Musical</a></li>
          <li><a href="#" @click.prevent="navigateTo('/karaoke')">Karaokê</a></li>
          <li><a href="#" @click.prevent="navigateTo('/matchmusical')">Match Musical</a></li>
          <li><a href="#" @click.prevent="navigateTo('/rooms')">Sala de Música</a></li>
          <li><a href="#" @click.prevent="navigateTo('/chatiamusica')">Chat IA Música</a></li>
        </ul>
      </div>

      <!-- Suporte -->
      <div class="footer-section">
        <h4 class="footer-title">Suporte</h4>
        <ul class="footer-links">
          <li><a href="#" @click.prevent="navigateTo('/ajuda')">Ajuda</a></li>
          <li><a href="#" @click.prevent="navigateTo('/privacidade')">Privacidade</a></li>
          <li><a href="#" @click.prevent="navigateTo('/termos')">Termos</a></li>
          <li><a href="#" @click.prevent="navigateTo('/contato')">Contato</a></li>
          <li><a href="#" @click.prevent="navigateTo('/suporte')">Suporte</a></li>
        </ul>
      </div>

    </div>

    <!-- Barra Inferior -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p class="copyright">
          &copy; {{ currentYear }} SoundUp. Todos os direitos reservados.
        </p>
        <div class="footer-bottom-links">
          <a href="#" @click.prevent="navigateTo('/privacidade')">Privacidade</a>
          <span class="divider">|</span>
          <a href="#" @click.prevent="navigateTo('/termos')">Termos</a>
          <span class="divider">|</span>
          <a href="#" @click.prevent="showCookies">Cookies</a>
        </div>
        <div class="footer-music-wave">
          <span v-for="n in 5" :key="n" class="wave-bar" :style="{ animationDelay: (n * 0.1) + 's' }"></span>
        </div>
      </div>
    </div>

    <!-- Back to Top -->
    <button 
      v-show="showBackToTop" 
      class="back-to-top"
      @click="scrollToTop"
      aria-label="Voltar ao topo"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  
  data() {
    return {
      showBackToTop: false
    }
  },

  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  },

  mounted() {
    // 🔥 Observa o scroll do elemento .content (não do window)
    this.setupScrollListener()
  },

  beforeUnmount() {
    if (this.contentElement) {
      this.contentElement.removeEventListener('scroll', this.handleScroll)
    }
  },

  methods: {
    goToMadeForYou() {
  // Vai para o dashboard com hash da seção
  this.$router.push('/dashboard#feito-para-voce')

  this.$nextTick(() => {
    setTimeout(() => {
      const section = document.getElementById('feito-para-voce')

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }

      // mantém o scroll interno funcionando
      const content = this.getContentElement()
      if (content && section) {
        const top =
          section.getBoundingClientRect().top +
          content.scrollTop -
          80

        content.scrollTo({
          top,
          behavior: 'smooth'
        })
      }
    }, 300)
  })
},

    // 🔥 Encontra o elemento .content que tem overflow-y: auto
    getContentElement() {
      return document.querySelector('.content')
    },

    setupScrollListener() {
      this.contentElement = this.getContentElement()
      if (this.contentElement) {
        this.contentElement.addEventListener('scroll', this.handleScroll)
      }
    },

    handleScroll() {
      if (this.contentElement) {
        this.showBackToTop = this.contentElement.scrollTop > 500
      }
    },

    // 🔥 NAVEGAÇÃO + SCROLL PARA O TOPO (FUNCIONAL)
     // 🔥 NAVEGAÇÃO + SCROLL PARA O TOPO (FUNCIONAL)
    navigateTo(path) {
      // Verifica se está tentando ir para início (/) e já está logado
           // Verifica se está tentando ir para início (/) e já está logado
      if (path === '/' && localStorage.getItem('isLoggedIn') === 'true') {
        this.$router.push('/dashboard')
        this.showAlert('info', 'Você já está logado! Redirecionando para o Dashboard.')
        
        // Scrolla para o topo do .content após o redirect
        this.$nextTick(() => {
          const content = this.getContentElement()
          if (content) {
            content.scrollTo({
              top: 0,
              behavior: 'smooth'
            })
          }
        })
        
        return
      }

      // Verifica se está tentando acessar perfil sem estar logado
      if (path === '/perfil' && localStorage.getItem('isLoggedIn') !== 'true') {
        this.showAlert('warning', 'Você precisa estar logado para acessar o perfil.')
        this.$router.push('/login')
        return
      }
      
      // 1. Navega para a rota
      this.$router.push(path)
      
      // 2. Scrolla o elemento .content para o topo com animação suave
      this.$nextTick(() => {
        const content = this.getContentElement()
        if (content) {
          content.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }
      })
    },

        showAlert(type, message) {
      // Dispara evento customizado para o App.vue mostrar o alert
      window.dispatchEvent(new CustomEvent('show-app-alert', {
        detail: { type, message }
      }))
    },

    // 🔥 SCROLL PARA O TOPO (Back to Top)
    scrollToTop() {
      const content = this.getContentElement()
      if (content) {
        content.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    },

    openSocial(platform) {
      const urls = {
        instagram: 'https://instagram.com/soundup',
        twitter: 'https://twitter.com/soundup',
        youtube: 'https://youtube.com/soundup',
        facebook: 'https://facebook.com/soundup'
      }
      window.open(urls[platform] || '#', '_blank')
    },

    showHelp() {
      this.$emit('show-modal', 'help')
    },

    showPrivacy() {
      this.$emit('show-modal', 'privacy')
    },

    showTerms() {
      this.$emit('show-modal', 'terms')
    },

    showCookies() {
      this.$emit('show-modal', 'cookies')
    },

    contactUs() {
      this.$emit('show-modal', 'contact')
    }
  }
}
</script>

<style scoped>
/* ===== FOOTER PRINCIPAL ===== */
.soundup-footer {
  background: linear-gradient(180deg, #0a0a0f 0%, #050508 100%);
  border-top: 1px solid rgba(124, 58, 237, 0.15);
  position: relative;
  overflow: hidden;
  margin-top: auto;
}

/* Efeito de brilho no topo */
.soundup-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(37, 99, 235, 0.6) 20%, 
    rgba(124, 58, 237, 0.8) 50%, 
    rgba(236, 72, 153, 0.6) 80%, 
    transparent 100%
  );
}

/* ===== CONTAINER ===== */
.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 40px 40px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 40px;
  position: relative;
  z-index: 1;
}

/* ===== BRAND / LOGO ===== */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
}

.logo-icon svg {
  width: 22px;
  height: 22px;
  color: white;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.footer-desc {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 300px;
}

/* ===== SOCIAL LINKS ===== */
.footer-social {
  display: flex;
  gap: 12px;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.social-link svg {
  width: 18px;
  height: 18px;
}

.social-link:hover {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  border-color: transparent;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
}

/* ===== FOOTER SECTIONS ===== */
.footer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-title {
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  padding-bottom: 8px;
  position: relative;
}

.footer-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 2px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-links li {
  margin: 0;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.footer-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #2563eb, #ec4899);
  transition: width 0.3s ease;
}

.footer-links a:hover {
  color: white;
  transform: translateX(4px);
}

.footer-links a:hover::after {
  width: 100%;
}

/* ===== FOOTER BOTTOM ===== */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 24px 40px;
  position: relative;
}

.footer-bottom-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.copyright {
  color: rgba(255, 255, 255, 0.35);
  font-size: 0.8rem;
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-bottom-links a {
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s ease;
  cursor: pointer;
}

.footer-bottom-links a:hover {
  color: #7c3aed;
}

.divider {
  color: rgba(255, 255, 255, 0.15);
  font-size: 0.8rem;
}

/* ===== WAVE ANIMATION ===== */
.footer-music-wave {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
}

.wave-bar {
  width: 3px;
  background: linear-gradient(180deg, #2563eb, #7c3aed, #ec4899);
  border-radius: 3px;
  animation: wave 1.2s ease-in-out infinite;
}

.wave-bar:nth-child(1) { height: 8px; }
.wave-bar:nth-child(2) { height: 14px; }
.wave-bar:nth-child(3) { height: 20px; }
.wave-bar:nth-child(4) { height: 14px; }
.wave-bar:nth-child(5) { height: 8px; }

@keyframes wave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
}

/* ===== BACK TO TOP ===== */
.back-to-top {
  position: fixed;
  bottom: 110px;
  right: 30px;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
  transition: all 0.3s ease;
  z-index: 100;
  animation: pulse-glow 3s ease-in-out infinite;
}

.back-to-top svg {
  width: 20px;
  height: 20px;
}

.back-to-top:hover {
  transform: translateY(-4px) scale(1.1);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.6);
  animation: none;
}

.back-to-top:active {
  transform: translateY(-2px) scale(0.95);
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
  }
  50% {
    box-shadow: 0 6px 30px rgba(37, 99, 235, 0.6), 0 0 20px rgba(124, 58, 237, 0.4);
  }
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 1200px) {
  .footer-container {
    grid-template-columns: 2fr 1fr 1fr;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    padding: 40px 24px 30px;
  }

  .footer-brand {
    grid-column: 1 / -1;
    text-align: center;
    align-items: center;
  }

  .footer-desc {
    max-width: 100%;
  }

  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .back-to-top {
    bottom: 80px;
    right: 20px;
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .footer-container {
    grid-template-columns: 1fr;
    padding: 30px 20px 20px;
  }

  .footer-section {
    align-items: center;
    text-align: center;
  }

  .footer-title::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .footer-links {
    align-items: center;
  }

  .footer-music-wave {
    display: none;
  }
}
</style>