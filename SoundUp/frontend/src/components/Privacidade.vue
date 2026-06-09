<template>
  <div class="privacy-page">

    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="gradient-orb orb-4"></div>
      <div class="grid-overlay"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Floating Particles -->
    <div class="particles">
      <span v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)"></span>
    </div>

    <!-- Header -->
    <header class="privacy-header">
      <div class="logo-wrapper" @click="goHome">

      </div>

      <button class="back-button" @click="goBack">
        <i class="fa fa-arrow-left"></i>
        <span>Voltar</span>
      </button>
    </header>

    <!-- Main -->
    <main class="privacy-container">

      <!-- Hero Section -->
      <section class="hero-section">
<div class="hero-badge">
  <span class="badge-icon">
    <i class="fa-solid fa-lock"></i>
  </span>

  <span>Política de Privacidade</span>
</div>

        <h1 class="hero-title">
          Sua privacidade
          <span class="gradient-text">importa</span>
        </h1>

        <p class="hero-description">
          O SoundUp valoriza sua segurança e transparência.
          Esta política explica como coletamos, utilizamos e protegemos seus dados
          dentro da plataforma.
        </p>

        <div class="update-date">
          <i class="fa fa-calendar-o"></i>
          <span>Última atualização: {{ currentDate }}</span>
        </div>
      </section>

      <!-- Cards Grid -->
      <section class="privacy-grid">
        <div 
          v-for="(card, index) in privacyCards" 
          :key="index"
          class="privacy-card"
          :class="{ 'card-hover': hoveredCard === index }"
          @mouseenter="hoveredCard = index"
          @mouseleave="hoveredCard = null"
          :style="{ animationDelay: index * 0.1 + 's' }"
        >
          <div class="card-glow"></div>
         <div class="card-icon">
  <i :class="card.icon"></i>
</div>
          <h2>{{ card.title }}</h2>
          <p>{{ card.description }}</p>
          <div class="card-shine"></div>
        </div>
      </section>

      <!-- Highlight Section -->
      <section class="highlight-section">
        <div class="highlight-glow"></div>
<div class="highlight-icon">
  <i class="fa-solid fa-shield-halved"></i>
</div>
        <div class="highlight-content">
          <h3>Compromisso com Segurança</h3>
          <p>
            Trabalhamos constantemente para manter uma plataforma segura,
            confiável e transparente para todos os usuários da comunidade SoundUp.
          </p>
        </div>
      </section>

      <!-- Extra Info -->
      <section class="extra-info">
        <div class="info-box">
          <div class="info-header">
           <div class="info-icon">
  <i class="fa-solid fa-clipboard-list"></i>
</div>
            <h3>Direitos do Usuário</h3>
          </div>
          <ul>
            <li v-for="(right, index) in userRights" :key="index">
              <span class="check-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span class="right-text">{{ right }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Trust Badges -->
      <section class="trust-section">
<div class="trust-badge-item">
  <div class="trust-icon">
    <i class="fa-solid fa-lock"></i>
  </div>
  <span>SSL Seguro</span>
</div>

<div class="trust-badge-item">
  <div class="trust-icon">
    <i class="fa-solid fa-shield-halved"></i>
  </div>
  <span>LGPD Compatível</span>
</div>

<div class="trust-badge-item">
  <div class="trust-icon">
    <i class="fa-solid fa-cloud"></i>
  </div>
  <span>Dados Criptografados</span>
</div>

<div class="trust-badge-item">
  <div class="trust-icon">
    <i class="fa-solid fa-eye"></i>
  </div>
  <span>Transparência Total</span>
</div>
      </section>

      <!-- Actions -->
      <div class="actions">
<button class="primary-btn" @click="acceptPrivacy" :disabled="accepting" :class="{ 'accepted': privacyAccepted }">
  <span v-if="!privacyAccepted">
    <i class="fa fa-check" v-if="!accepting"></i>
    <i class="fa fa-spinner fa-spin" v-else></i>
    {{ accepting ? 'Processando...' : 'Aceitar Política' }}
  </span>
  <span v-else>
    <i class="fa fa-check-double"></i>
    Política Aceita!
  </span>
</button>

        <button class="secondary-btn" @click="goHome">
          <i class="fa fa-home"></i>
          Ir para o Início
        </button>
      </div>

    </main>

    <!-- Custom Alert -->
    <transition name="alert-slide">
      <div v-if="alert.visible" class="custom-alert" :class="alert.type">
        <div class="alert-icon">
          <i class="fa" :class="alertIcon"></i>
        </div>
        <div class="alert-content">
          <strong>{{ alert.title }}</strong>
          <span>{{ alert.message }}</span>
        </div>
        <button class="alert-close" @click="closeAlert">
          <i class="fa fa-times"></i>
        </button>
        <div class="alert-progress"></div>
      </div>
    </transition>

  </div>
</template>

<script>
export default {
  name: 'PrivacyPage',

  data() {
    return {
      hoveredCard: null,
      privacyAccepted: false,
      accepting: false,
      alert: {
        visible: false,
        type: 'success',
        title: '',
        message: ''
      },
      privacyCards: [
        {
          icon: 'fa-solid fa-clipboard-list',
          title: 'Informações Coletadas',
          description: 'Podemos coletar informações como nome, e-mail, playlists favoritas, curtidas e preferências musicais para melhorar sua experiência.'
        },
        {
           icon: 'fa-solid fa-headphones',
          title: 'Personalização',
          description: 'Utilizamos seus gostos musicais para recomendar artistas, playlists e conteúdos personalizados dentro do SoundUp.'
        },
        {
              icon: 'fa-solid fa-lock',
          title: 'Proteção de Dados',
          description: 'Seus dados são protegidos com tecnologias modernas de segurança, criptografia e autenticação para evitar acessos não autorizados.'
        },
        {
          icon: 'fa-solid fa-cookie-bite',
          title: 'Uso de Cookies',
          description: 'Utilizamos cookies para lembrar preferências, manter sessões ativas e melhorar o desempenho da plataforma.'
        },
        {
           icon: 'fa-solid fa-earth-americas',
          title: 'Compartilhamento',
          description: 'Não vendemos suas informações pessoais. Compartilhamentos acontecem apenas quando necessários para funcionamento da plataforma.'
        },
        {
         icon: 'fa-solid fa-gear',
          title: 'Controle do Usuário',
          description: 'Você pode atualizar suas informações, preferências e configurações de privacidade a qualquer momento.'
        }
      ],
      userRights: [
        'Solicitar acesso aos seus dados',
        'Corrigir informações pessoais',
        'Excluir sua conta permanentemente',
        'Controlar notificações e preferências',
        'Revogar permissões concedidas'
      ]
    }
  },

computed: {
  currentDate() {
    return new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  },
  currentYear() {
    return new Date().getFullYear()
  },
  alertIcon() {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    }
    return icons[this.alert.type] || 'fa-info-circle'
  }
},

mounted() {
  this.checkPrivacyAccepted()
},

  methods: {
    checkPrivacyAccepted() {
  this.privacyAccepted = localStorage.getItem('soundup_privacy_accepted') === 'true'
},
    getContentElement() {
  return document.querySelector('.content')
},

    getParticleStyle(n) {
      const size = Math.random() * 4 + 2
      const left = Math.random() * 100
      const delay = Math.random() * 15
      const duration = Math.random() * 10 + 10
      return {
        width: size + 'px',
        height: size + 'px',
        left: left + '%',
        animationDelay: delay + 's',
        animationDuration: duration + 's'
      }
    },

    showAlert(type, title, message) {
      this.alert = { visible: true, type, title, message }
      setTimeout(() => this.closeAlert(), 4000)
    },

    closeAlert() {
      this.alert.visible = false
    },

goHome() {
  const isLoggedIn = !!localStorage.getItem('token')
  this.$router.push(isLoggedIn ? '/dashboard' : '/').then(() => {
    this.$nextTick(() => {
      const content = this.getContentElement()
      if (content) {
        content.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  })
},

goBack() {
  this.$router.back()
  this.$nextTick(() => {
    const content = this.getContentElement()
    if (content) {
      content.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
},
createConfetti() {
  const colors = ['#2563eb', '#7c3aed', '#ec4899', '#10b981', '#f59e0b']
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    confetti.style.left = Math.random() * 100 + 'vw'
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.animationDelay = Math.random() * 2 + 's'
    document.body.appendChild(confetti)
    setTimeout(() => confetti.remove(), 3000)
  }
},

async acceptPrivacy() {
  this.accepting = true
  
  await new Promise(resolve => setTimeout(resolve, 800))
  
  localStorage.setItem('soundup_privacy_accepted', 'true')
  this.privacyAccepted = true
  this.createConfetti()
  
  this.showAlert('success', 'Sucesso!', 'Política de privacidade aceita com sucesso!')
  
  setTimeout(() => {
    const isLoggedIn = !!localStorage.getItem('token')
    this.$router.push(isLoggedIn ? '/dashboard' : '/').then(() => {
      this.$nextTick(() => {
        const content = this.getContentElement()
        if (content) {
          content.scrollTo({ top: 0, behavior: 'smooth' })
        }
      })
    })
  }, 2000)
},
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

/* ===== ANIMATIONS ===== */
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(1.05); }
}

@keyframes particle-float {
  0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes alert-slide {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes alert-progress {
  from { width: 100%; }
  to { width: 0%; }
}

/* ===== PAGE ===== */
.privacy-page {
  min-height: 100vh;
  background: #050508;
  color: white;
  overflow-x: hidden;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ===== BACKGROUND EFFECTS ===== */
.bg-effects {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.18;
  animation: pulse-glow 6s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: #2563eb;
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: #7c3aed;
  right: -100px;
  top: 30%;
  animation-delay: 2s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: #ec4899;
  bottom: -100px;
  left: 20%;
  animation-delay: 4s;
}

.orb-4 {
  width: 300px;
  height: 300px;
  background: #06b6d4;
  top: 60%;
  right: 20%;
  animation-delay: 1s;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* ===== PARTICLES ===== */
.particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: particle-float linear infinite;
}

/* ===== HEADER ===== */
.privacy-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(5, 5, 8, 0.7);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-wrapper:hover {
  transform: scale(1.02);
}

.logo-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
  transition: box-shadow 0.3s ease;
}

.logo-wrapper:hover .logo-icon {
  box-shadow: 0 12px 32px rgba(124, 58, 237, 0.5);
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

.logo-text {
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: white;
  transform: translateX(-4px);
}

/* ===== CONTAINER ===== */
.privacy-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 30px 40px;
  position: relative;
  z-index: 2;
}

/* ===== HERO ===== */
.hero-section {
  text-align: center;
  margin-bottom: 80px;
  animation: card-enter 0.8s ease;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(236, 72, 153, 0.1));
  border: 1px solid rgba(124, 58, 237, 0.25);
  color: #c4b5fd;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 28px;
  backdrop-filter: blur(10px);
}

.badge-icon {
  font-size: 1.1rem;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.1;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline;
}

.hero-description {
  max-width: 680px;
  margin: 0 auto 32px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.8;
  font-size: 1.15rem;
}

.update-date {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* ===== GRID ===== */
.privacy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}
.primary-btn.accepted {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4) !important;
  cursor: default;
}

.primary-btn.accepted:hover {
  transform: none !important;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4) !important;
}

/* ===== CARD ===== */
.privacy-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: card-enter 0.6s ease backwards;
  cursor: default;
}

.privacy-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 25px 50px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(124, 58, 237, 0.1);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.privacy-card:hover .card-glow {
  opacity: 1;
}

.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
  transition: left 0.6s ease;
  pointer-events: none;
}

.privacy-card:hover .card-shine {
  left: 150%;
}

.card-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;

  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.18),
    rgba(124, 58, 237, 0.14)
  );

  border: 1px solid rgba(255, 255, 255, 0.08);

  box-shadow:
    0 10px 25px rgba(124, 58, 237, 0.18),
    inset 0 1px 0 rgba(255,255,255,0.05);

  position: relative;
  overflow: hidden;

  transition: all 0.35s ease;
}

.card-icon i {
  font-size: 2rem;
  color: #c4b5fd;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.privacy-card:hover .card-icon {
  transform: scale(1.08) translateY(-2px);
  box-shadow:
    0 16px 35px rgba(124, 58, 237, 0.28),
    0 0 20px rgba(124, 58, 237, 0.12);
}

.privacy-card:hover .card-icon i {
  color: #ffffff;
}

.privacy-card:hover .card-icon {
  transform: scale(1.1) rotate(-5deg);
}

.privacy-card h2 {
  margin-bottom: 14px;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.privacy-card p {
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.7;
  font-size: 0.95rem;
}

/* ===== HIGHLIGHT ===== */
.highlight-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 40px;
  margin-bottom: 50px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  animation: card-enter 0.8s ease 0.3s backwards;
}

.highlight-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

.highlight-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(124, 58, 237, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 32px rgba(124, 58, 237, 0.2);
}

.highlight-content {
  position: relative;
  z-index: 1;
}

.highlight-content h3 {
  margin-bottom: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #93c5fd, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.highlight-content p {
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.7;
  font-size: 1rem;
}

/* ===== EXTRA INFO ===== */
.extra-info {
  margin-bottom: 50px;
  animation: card-enter 0.8s ease 0.5s backwards;
}

.info-box {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 40px;
  backdrop-filter: blur(20px);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.info-box h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
}

.info-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-box li {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  font-size: 1rem;
  padding: 8px 0;
  transition: all 0.3s ease;
}

.info-box li:hover {
  color: white;
  transform: translateX(8px);
}

.check-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6ee7b7;
  flex-shrink: 0;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.check-icon svg {
  width: 16px;
  height: 16px;
}

.right-text {
  transition: color 0.3s ease;
}

/* ===== TRUST BADGES ===== */
.trust-section {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  margin-bottom: 50px;
  animation: card-enter 0.8s ease 0.6s backwards;
}

.trust-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-width: 140px;
  transition: all 0.3s ease;
}

.trust-badge-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.trust-icon {
  font-size: 2rem;
}

.trust-badge-item span {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-align: center;
}

/* ===== ACTIONS ===== */
.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 60px;
  animation: card-enter 0.8s ease 0.7s backwards;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
  font-size: 1rem;
  padding: 16px 32px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.primary-btn {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.35);
}

.primary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.primary-btn:hover::before {
  left: 100%;
}

.primary-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px rgba(124, 58, 237, 0.5);
}

.primary-btn:active {
  transform: translateY(-2px);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

/* ===== FOOTER ===== */
.privacy-footer {
  position: relative;
  z-index: 2;
  padding: 40px 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(5, 5, 8, 0.5);
  backdrop-filter: blur(10px);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.divider {
  color: rgba(255, 255, 255, 0.2);
}

/* ===== CUSTOM ALERT ===== */
.custom-alert {
  position: fixed;
  top: 24px;
  right: 24px;
  max-width: 400px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  z-index: 9999;
  animation: alert-slide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.custom-alert.success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.08));
  border-color: rgba(16, 185, 129, 0.25);
}

.custom-alert.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.08));
  border-color: rgba(239, 68, 68, 0.25);
}

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.custom-alert.success .alert-icon { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
.custom-alert.error .alert-icon { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.alert-content strong {
  font-weight: 700;
  font-size: 1rem;
  color: white;
}

.alert-content span {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.alert-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.alert-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.alert-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  animation: alert-progress 4s linear forwards;
}

.custom-alert.success .alert-progress { background: rgba(16, 185, 129, 0.5); }
.custom-alert.error .alert-progress { background: rgba(239, 68, 68, 0.5); }

/* Alert transition */
.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.alert-slide-enter-from,
.alert-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .privacy-header {
    padding: 14px 20px;
  }

  .privacy-container {
    padding: 40px 20px 30px;
  }

  .hero-title {
    font-size: clamp(2rem, 8vw, 3rem);
  }

  .privacy-grid {
    grid-template-columns: 1fr;
  }

  .highlight-section {
    flex-direction: column;
    text-align: center;
    padding: 30px;
  }

  .highlight-icon {
    margin: 0 auto;
  }

  .trust-section {
    gap: 16px;
  }

  .trust-badge-item {
    min-width: 120px;
    padding: 16px;
  }

  .actions {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
    justify-content: center;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .custom-alert {
    left: 16px;
    right: 16px;
    max-width: none;
    top: 16px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }

  .back-button span {
    display: none;
  }

  .hero-badge {
    font-size: 0.8rem;
    padding: 8px 14px;
  }

  .info-box {
    padding: 24px;
  }
}

/* ===== SCROLLBAR ===== */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>