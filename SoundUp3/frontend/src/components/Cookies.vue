<template>
  <div class="cookies-page">

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

    <!-- Reading Progress -->
    <div class="reading-progress" :style="{ width: scrollProgress + '%' }"></div>

    <!-- Header -->
<header class="cookies-header">
  <div></div> <!-- espaçador vazio para manter o flex space-between -->

  <button class="back-button" @click="goBack">
    <i class="fa-solid fa-arrow-left"></i>
    <span>Voltar</span>
  </button>
</header>

    <!-- Main -->
    <main class="cookies-container" ref="container">

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-glow"></div>
        
        <div class="hero-badge" @mouseenter="badgeHover = true" @mouseleave="badgeHover = false" :class="{ 'hover': badgeHover }">
          <span class="badge-icon">
            <i class="fa-solid fa-cookie-bite"></i>
          </span>
          <span>Política de Cookies</span>
        </div>

        <h1 class="hero-title">
          Sua experiência
          <span class="gradient-text">personalizada</span>
        </h1>

        <p class="hero-description">
          Utilizamos cookies e tecnologias similares para melhorar sua navegação,
          lembrar suas preferências e oferecer uma experiência musical única no SoundUp.
        </p>

        <div class="update-date">
          <i class="fa-regular fa-calendar"></i>
          <span>Última atualização: {{ currentDate }}</span>
        </div>

        <!-- Scroll Indicator -->
        <div class="scroll-indicator">
          <div class="mouse">
            <div class="wheel"></div>
          </div>
          <span>Role para explorar</span>
        </div>
      </section>

      <!-- Cookie Types Grid -->
      <section class="cookies-grid">
        <div 
          v-for="(cookie, index) in cookieTypes" 
          :key="index"
          class="cookie-card"
          :class="{ 'card-hover': hoveredCard === index, 'active': activeCard === index }"
          @mouseenter="hoveredCard = index"
          @mouseleave="hoveredCard = null"
          :style="{ animationDelay: index * 0.1 + 's' }"
        >
          <div class="card-glow" :class="`glow-${cookie.color}`"></div>
          <div class="card-shine"></div>
          
          <div class="card-header">
            <div class="card-icon" :class="`icon-${cookie.color}`">
              <i :class="cookie.icon"></i>
            </div>
            <div class="card-toggle">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="cookie.enabled"
                  :disabled="cookie.required"
                  @change="toggleCookie(cookie)"
                >
                <span class="toggle-slider" :class="{ 'required': cookie.required }"></span>
              </label>
            </div>
          </div>

          <h2>{{ cookie.title }}</h2>
          <p>{{ cookie.description }}</p>

          <div class="card-tags">
            <span v-for="(tag, tIdx) in cookie.tags" :key="tIdx" class="tag">
              {{ tag }}
            </span>
          </div>

          <div class="card-footer">
            <span class="duration">
              <i class="fa-regular fa-clock"></i>
              {{ cookie.duration }}
            </span>
            <button class="read-more" @click="openModal(cookie)">
              Detalhes
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- Cookie Manager -->
      <section class="manager-section">
        <div class="manager-glow"></div>
        <div class="manager-content">
          <div class="manager-icon">
            <i class="fa-solid fa-sliders"></i>
          </div>
          <div class="manager-text">
            <h3>Gerenciar Preferências</h3>
            <p>
              Você tem controle total sobre quais cookies deseja permitir. 
              Cookies necessários não podem ser desativados pois são essenciais 
              para o funcionamento da plataforma.
            </p>
          </div>
          <button class="manager-btn" @click="openPreferencesModal">
            <i class="fa-solid fa-gear"></i>
            Configurar
          </button>
        </div>
      </section>

      <!-- How It Works -->
      <section class="how-it-works">
        <h3 class="section-title">Como Funciona</h3>
        <div class="steps-grid">
          <div 
            v-for="(step, idx) in steps" 
            :key="idx"
            class="step-card"
            :class="{ 'active': activeStep >= idx }"
            :style="{ animationDelay: idx * 0.15 + 's' }"
          >
            <div class="step-number">0{{ idx + 1 }}</div>
            <div class="step-icon" :class="`icon-${step.color}`">
              <i :class="step.icon"></i>
            </div>
            <h4>{{ step.title }}</h4>
            <p>{{ step.description }}</p>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="stats-section">
        <div class="stat-item" v-for="(stat, idx) in stats" :key="idx">
          <div class="stat-icon" :class="`stat-${stat.color}`">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </section>

      <!-- Transparency -->
      <section class="transparency-section">
        <div class="transparency-glow"></div>
        <div class="transparency-content">
          <div class="transparency-icon">
            <i class="fa-solid fa-eye"></i>
          </div>
          <div class="transparency-text">
            <h3>Transparência Total</h3>
            <p>
              Não vendemos seus dados para terceiros. Os cookies são utilizados 
              exclusivamente para melhorar sua experiência no SoundUp e garantir 
              a segurança da sua conta.
            </p>
            <div class="transparency-badges">
              <span class="badge">
                <i class="fa-solid fa-shield-halved"></i>
                Dados Protegidos
              </span>
              <span class="badge">
                <i class="fa-solid fa-user-lock"></i>
                LGPD Compliant
              </span>
              <span class="badge">
                <i class="fa-solid fa-eraser"></i>
                Exclusão Sob Demanda
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <div class="actions">
        <button class="primary-btn" @click="acceptAll" :class="{ 'accepted': allAccepted }">
          <span v-if="!allAccepted">
            <i class="fa-solid fa-check-circle"></i>
            Aceitar Todos
          </span>
          <span v-else>
            <i class="fa-solid fa-check-double"></i>
            Todos Aceitos!
          </span>
          <div class="btn-shine"></div>
        </button>

        <button class="secondary-btn" @click="acceptNecessaryOnly">
          <i class="fa-solid fa-shield-halved"></i>
          Apenas Necessários
        </button>

        <button class="ghost-btn" @click="goHome">
          <i class="fa-solid fa-house"></i>
          Voltar ao Início
        </button>
      </div>

      <!-- Footer Note -->
      <div class="footer-note">
        <i class="fa-solid fa-circle-info"></i>
        <p>
          Ao utilizar o SoundUp, você concorda com nossa 
          <a href="#" @click.prevent="goToPrivacy">Política de Privacidade</a> e 
          <a href="#" @click.prevent="goToTerms">Termos de Uso</a>.
        </p>
      </div>

    </main>

    <!-- Cookie Detail Modal -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-glow" :class="`glow-${selectedCookie.color}`"></div>
          
          <button class="modal-close" @click="closeModal">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="modal-header">
            <div class="modal-icon" :class="`icon-${selectedCookie.color}`">
              <i :class="selectedCookie.icon"></i>
            </div>
            <div class="modal-title-section">
              <span class="modal-badge" :class="{ 'required': selectedCookie.required }">
                {{ selectedCookie.required ? 'Obrigatório' : 'Opcional' }}
              </span>
              <h2>{{ selectedCookie.title }}</h2>
            </div>
          </div>

          <div class="modal-divider"></div>

          <div class="modal-body">
            <p class="modal-description">{{ selectedCookie.fullDescription }}</p>
            
            <div class="modal-details">
              <h4><i class="fa-solid fa-list-check"></i> O que fazemos</h4>
              <ul>
                <li v-for="(item, i) in selectedCookie.details" :key="i">
                  <i class="fa-solid fa-chevron-right"></i>
                  {{ item }}
                </li>
              </ul>
            </div>

            <div class="modal-info-grid">
              <div class="info-item">
                <span class="info-label">Duração</span>
                <span class="info-value">
                  <i class="fa-regular fa-clock"></i>
                  {{ selectedCookie.duration }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Provedor</span>
                <span class="info-value">
                  <i class="fa-solid fa-server"></i>
                  {{ selectedCookie.provider }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Tipo</span>
                <span class="info-value">
                  <i class="fa-solid fa-tag"></i>
                  {{ selectedCookie.type }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="modal-btn-close" @click="closeModal">
              <i class="fa-solid fa-check"></i>
              Entendi
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Preferences Modal -->
    <transition name="modal-fade">
      <div v-if="showPreferences" class="modal-overlay" @click="closePreferencesModal">
        <div class="modal-container preferences-modal" @click.stop>
          <div class="modal-glow glow-purple"></div>
          
          <button class="modal-close" @click="closePreferencesModal">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="modal-header">
            <div class="modal-icon icon-purple">
              <i class="fa-solid fa-sliders"></i>
            </div>
            <div class="modal-title-section">
              <span class="modal-badge">Configurações</span>
              <h2>Preferências de Cookies</h2>
            </div>
          </div>

          <div class="modal-divider"></div>

          <div class="modal-body">
            <div class="preference-list">
              <div 
                v-for="(cookie, index) in cookieTypes" 
                :key="index"
                class="preference-item"
              >
                <div class="preference-info">
                  <div class="preference-icon" :class="`icon-${cookie.color}`">
                    <i :class="cookie.icon"></i>
                  </div>
                  <div class="preference-text">
                    <h4>{{ cookie.title }}</h4>
                    <p>{{ cookie.shortDesc }}</p>
                  </div>
                </div>
                <label class="toggle-switch">
                  <input 
                    type="checkbox" 
                    v-model="cookie.enabled"
                    :disabled="cookie.required"
                  >
                  <span class="toggle-slider" :class="{ 'required': cookie.required }"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="modal-btn-save" @click="savePreferences">
              <i class="fa-solid fa-floppy-disk"></i>
              Salvar Preferências
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Custom Alert -->
    <transition name="alert-slide">
      <div v-if="alert.visible" class="custom-alert" :class="alert.type">
        <div class="alert-icon">
          <i class="fa-solid" :class="alertIcon"></i>
        </div>
        <div class="alert-content">
          <strong>{{ alert.title }}</strong>
          <span>{{ alert.message }}</span>
        </div>
        <button class="alert-close" @click="closeAlert">
          <i class="fa-solid fa-times"></i>
        </button>
        <div class="alert-progress"></div>
      </div>
    </transition>

    <!-- Confetti -->
    <div v-if="showConfetti" class="confetti-container">
      <div v-for="n in 50" :key="n" class="confetti" :style="getConfettiStyle(n)"></div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'CookiesPage',

  data() {
    return {
      hoveredCard: null,
      activeCard: null,
      badgeHover: false,
      showModal: false,
      showPreferences: false,
      selectedCookie: {},
      scrollProgress: 0,
      activeStep: 0,
      showConfetti: false,
      allAccepted: false,
      
      alert: {
        visible: false,
        type: 'success',
        title: '',
        message: ''
      },

      cookieTypes: [
        {
          title: 'Cookies Necessários',
          description: 'Essenciais para o funcionamento básico da plataforma. Não podem ser desativados.',
          shortDesc: 'Essenciais para o funcionamento',
          fullDescription: 'Os cookies necessários são fundamentais para o funcionamento do SoundUp. Eles permitem que você navegue pelo site e use recursos essenciais como login, segurança e acessibilidade. Sem esses cookies, a plataforma não funcionaria corretamente.',
          icon: 'fa-solid fa-shield-halved',
          color: 'blue',
          enabled: true,
          required: true,
          duration: 'Sessão / 1 ano',
          provider: 'SoundUp',
          type: 'Primeira parte',
          tags: ['Essencial', 'Segurança'],
          details: [
            'Autenticação e manutenção de sessão',
            'Proteção contra fraudes e abusos',
            'Preferências de acessibilidade',
            'Balanceamento de carga dos servidores',
            'Armazenamento de consentimento básico'
          ]
        },
        {
          title: 'Cookies de Preferências',
          description: 'Lembram suas escolhas e personalizam a interface do SoundUp.',
          shortDesc: 'Lembram suas preferências',
          fullDescription: 'Esses cookies permitem que o SoundUp lembre suas preferências e configurações, como idioma, tema escuro, volume padrão e layout da interface. Eles proporcionam uma experiência mais personalizada e conveniente.',
          icon: 'fa-solid fa-sliders',
          color: 'purple',
          enabled: false,
          required: false,
          duration: '1 ano',
          provider: 'SoundUp',
          type: 'Primeira parte',
          tags: ['Personalização', 'UX'],
          details: [
            'Idioma e localização preferidos',
            'Tema visual e configurações de interface',
            'Volume e qualidade de áudio padrão',
            'Preferências de notificação',
            'Filtros e ordenação personalizada'
          ]
        },
        {
          title: 'Cookies Analíticos',
          description: 'Nos ajudam a entender como você utiliza o SoundUp para melhorar a plataforma.',
          shortDesc: 'Análise de uso e performance',
          fullDescription: 'Utilizamos cookies analíticos para entender como os usuários interagem com o SoundUp. Esses dados nos ajudam a identificar problemas, otimizar performance e desenvolver novos recursos que realmente importam para você.',
          icon: 'fa-solid fa-chart-line',
          color: 'pink',
          enabled: false,
          required: false,
          duration: '2 anos',
          provider: 'SoundUp / Google Analytics',
          type: 'Terceira parte',
          tags: ['Analytics', 'Performance'],
          details: [
            'Métricas de engajamento e retenção',
            'Análise de fluxo de navegação',
            'Identificação de erros e bugs',
            'Testes A/B de novas funcionalidades',
            'Relatórios de performance agregados'
          ]
        },
        {
          title: 'Cookies de Marketing',
          description: 'Utilizados para mostrar recomendações e anúncios relevantes sobre música.',
          shortDesc: 'Recomendações e campanhas',
          fullDescription: 'Esses cookies nos permitem oferecer recomendações musicais mais relevantes e informar você sobre novos lançamentos, eventos e artistas que possam interessar. Eles também ajudam a medir a eficácia de nossas campanhas.',
          icon: 'fa-solid fa-bullhorn',
          color: 'cyan',
          enabled: false,
          required: false,
          duration: '6 meses',
          provider: 'SoundUp / Parceiros',
          type: 'Terceira parte',
          tags: ['Marketing', 'Recomendações'],
          details: [
            'Recomendações personalizadas de artistas',
            'Alertas de novos lançamentos favoritos',
            'Campanhas de eventos e shows',
            'Medição de conversão de campanhas',
            'Segmentação de público musical'
          ]
        },
        {
          title: 'Cookies de Mídia Social',
          description: 'Permitem compartilhar conteúdo e conectar-se com amigos músicos.',
          shortDesc: 'Integração social',
          fullDescription: 'Esses cookies são utilizados quando você interage com recursos de mídia social no SoundUp, como compartilhar playlists, seguir artistas ou conectar sua conta com plataformas sociais. Eles facilitam a integração e o compartilhamento.',
          icon: 'fa-solid fa-share-nodes',
          color: 'green',
          enabled: false,
          required: false,
          duration: '1 ano',
          provider: 'Redes Sociais',
          type: 'Terceira parte',
          tags: ['Social', 'Compartilhamento'],
          details: [
            'Botões de compartilhamento integrados',
            'Feed de atividades de amigos',
            'Login via redes sociais',
            'Exibição de conteúdo embedado',
            'Interações com widgets sociais'
          ]
        },
        {
          title: 'Cookies de Performance',
          description: 'Otimizam a velocidade e a estabilidade da plataforma em tempo real.',
          shortDesc: 'Velocidade e estabilidade',
          fullDescription: 'Cookies de performance garantem que o SoundUp funcione de forma rápida e estável. Eles ajudam a distribuir o tráfego entre servidores, armazenar conteúdo em cache e otimizar a entrega de músicas e dados.',
          icon: 'fa-solid fa-bolt',
          color: 'orange',
          enabled: false,
          required: false,
          duration: 'Sessão',
          provider: 'SoundUp / CDN',
          type: 'Primeira parte',
          tags: ['Performance', 'CDN'],
          details: [
            'Cache de conteúdo estático',
            'Balanceamento de carga inteligente',
            'Otimização de streaming de áudio',
            'Compressão e minificação de assets',
            'Monitoramento de latência em tempo real'
          ]
        }
      ],

      steps: [
        {
          title: 'Você Acessa',
          description: 'Ao entrar no SoundUp, solicitamos seu consentimento para cookies.',
          icon: 'fa-solid fa-door-open',
          color: 'blue'
        },
        {
          title: 'Escolhe Preferências',
          description: 'Selecione quais categorias de cookies deseja permitir.',
          icon: 'fa-solid fa-hand-pointer',
          color: 'purple'
        },
        {
          title: 'Nós Otimizamos',
          description: 'Utilizamos os cookies aceitos para personalizar sua experiência.',
          icon: 'fa-solid fa-wand-magic-sparkles',
          color: 'pink'
        },
        {
          title: 'Você Controla',
          description: 'Acesse esta página a qualquer momento para alterar suas escolhas.',
          icon: 'fa-solid fa-user-gear',
          color: 'cyan'
        }
      ],

      stats: [
        { icon: 'fa-solid fa-cookie', value: '6', label: 'Categorias', color: 'blue' },
        { icon: 'fa-solid fa-clock', value: '24h', label: 'Expiração Mín.', color: 'purple' },
        { icon: 'fa-solid fa-lock', value: '100%', label: 'Criptografados', color: 'green' },
        { icon: 'fa-solid fa-user-shield', value: 'LGPD', label: 'Compliance', color: 'pink' }
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
    this.$nextTick(() => {
      const content = this.getContentElement()
      if (content) {
        content.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })

    const content = this.getContentElement()
    if (content) {
      content.addEventListener('scroll', this.handleScroll)
    }

    this.startStepsAnimation()
    this.loadSavedPreferences()
  },

  beforeDestroy() {
    const content = this.getContentElement()
    if (content) {
      content.removeEventListener('scroll', this.handleScroll)
    }
  },

  methods: {
    getContentElement() {
      return document.querySelector('.content')
    },

    handleScroll() {
      const content = this.getContentElement()
      if (!content) return
      
      const scrollHeight = content.scrollHeight - content.clientHeight
      this.scrollProgress = scrollHeight > 0 ? (content.scrollTop / scrollHeight) * 100 : 0
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

    startStepsAnimation() {
      const interval = setInterval(() => {
        if (this.activeStep < this.steps.length - 1) {
          this.activeStep++
        } else {
          this.activeStep = 0
        }
      }, 3000)
    },

    loadSavedPreferences() {
      const saved = localStorage.getItem('soundup_cookie_preferences')
      if (saved) {
        try {
          const prefs = JSON.parse(saved)
          this.cookieTypes.forEach((cookie, idx) => {
            if (prefs[idx] !== undefined && !cookie.required) {
              cookie.enabled = prefs[idx]
            }
          })
        } catch (e) {
          console.error('Erro ao carregar preferências:', e)
        }
      }
      
      this.allAccepted = localStorage.getItem('soundup_cookies_accepted') === 'true'
    },

    toggleCookie(cookie) {
      this.savePreferences()
    },

    savePreferences() {
      const prefs = this.cookieTypes.map(c => c.enabled)
      localStorage.setItem('soundup_cookie_preferences', JSON.stringify(prefs))
      this.showAlert('success', 'Preferências Salvas!', 'Suas configurações de cookies foram atualizadas.')
    },

    acceptAll() {
      this.cookieTypes.forEach(cookie => {
        cookie.enabled = true
      })
      this.savePreferences()
      localStorage.setItem('soundup_cookies_accepted', 'true')
      this.allAccepted = true
      this.triggerConfetti()
      this.showAlert('success', 'Tudo Certo!', 'Todos os cookies foram aceitos com sucesso.')
      
      setTimeout(() => {
        this.goHome()
      }, 2000)
    },

    acceptNecessaryOnly() {
      this.cookieTypes.forEach(cookie => {
        cookie.enabled = cookie.required
      })
      this.savePreferences()
      localStorage.setItem('soundup_cookies_accepted', 'necessary')
      this.showAlert('info', 'Cookies Necessários', 'Apenas cookies essenciais foram ativados.')
    },

    openModal(cookie) {
      this.selectedCookie = cookie
      this.showModal = true
      document.body.style.overflow = 'hidden'
    },

    closeModal() {
      this.showModal = false
      document.body.style.overflow = ''
      setTimeout(() => {
        this.selectedCookie = {}
      }, 300)
    },

    openPreferencesModal() {
      this.showPreferences = true
      document.body.style.overflow = 'hidden'
    },

    closePreferencesModal() {
      this.showPreferences = false
      document.body.style.overflow = ''
    },

    triggerConfetti() {
      this.showConfetti = true
      setTimeout(() => {
        this.showConfetti = false
      }, 3000)
    },

    getConfettiStyle(n) {
      const colors = ['#2563eb', '#7c3aed', '#ec4899', '#10b981', '#f59e0b', '#06b6d4']
      return {
        left: Math.random() * 100 + 'vw',
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: Math.random() * 2 + 's',
        animationDuration: (2 + Math.random() * 2) + 's'
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

    goToPrivacy() {
      this.$router.push('/privacidade').then(() => {
        this.$nextTick(() => {
          const content = this.getContentElement()
          if (content) {
            content.scrollTo({ top: 0, behavior: 'smooth' })
          }
        })
      })
    },

    goToTerms() {
      this.$router.push('/termos').then(() => {
        this.$nextTick(() => {
          const content = this.getContentElement()
          if (content) {
            content.scrollTo({ top: 0, behavior: 'smooth' })
          }
        })
      })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

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

@keyframes confetti-fall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

/* ===== PAGE ===== */
.cookies-page {
  min-height: 100vh;
  background: #050508;
  color: white;
  overflow-x: hidden;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ===== READING PROGRESS ===== */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #2563eb, #7c3aed, #ec4899);
  z-index: 1001;
  transition: width 0.1s ease;
  box-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
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
  background: #f59e0b;
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
.cookies-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* alinha tudo à direita */
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
  color: white;
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
.cookies-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 30px 40px;
  position: relative;
  z-index: 2;
}

/* ===== HERO ===== */
.hero-section {
  text-align: center;
  margin-bottom: 100px;
  position: relative;
  animation: card-enter 0.8s ease;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 32px;
  transition: all 0.4s ease;
  cursor: default;
}

.hero-badge.hover {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
  transform: scale(1.05);
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
  background: linear-gradient(135deg, #f59e0b, #ec4899, #7c3aed);
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
  padding: 10px 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Scroll Indicator */
.scroll-indicator {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: 0.5;
  animation: bounce-scroll 2s infinite;
}

.mouse {
  width: 26px;
  height: 40px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 13px;
  position: relative;
}

.wheel {
  width: 4px;
  height: 8px;
  background: rgba(255,255,255,0.5);
  border-radius: 2px;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  animation: wheel-scroll 1.5s infinite;
}

@keyframes wheel-scroll {
  0% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(12px); }
}

@keyframes bounce-scroll {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

.scroll-indicator span {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ===== COOKIES GRID ===== */
.cookies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 24px;
  margin-bottom: 80px;
}

/* ===== COOKIE CARD ===== */
.cookie-card {
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

.cookie-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(245, 158, 11, 0.3);
  box-shadow: 0 25px 50px rgba(245, 158, 11, 0.1), 0 0 0 1px rgba(245, 158, 11, 0.1);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.cookie-card:hover .card-glow {
  opacity: 1;
}

.glow-blue { background: radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.15), transparent 50%); }
.glow-purple { background: radial-gradient(circle at 30% 30%, rgba(124, 58, 237, 0.15), transparent 50%); }
.glow-pink { background: radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.15), transparent 50%); }
.glow-cyan { background: radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.15), transparent 50%); }
.glow-green { background: radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.15), transparent 50%); }
.glow-orange { background: radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.15), transparent 50%); }

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

.cookie-card:hover .card-shine {
  left: 150%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.icon-blue { background: rgba(37, 99, 235, 0.15); color: #60a5fa; }
.icon-purple { background: rgba(124, 58, 237, 0.15); color: #a78bfa; }
.icon-pink { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
.icon-cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
.icon-green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.icon-orange { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

.cookie-card:hover .card-icon {
  transform: scale(1.1) rotate(-5deg);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: 0.3s;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: rgba(255, 255, 255, 0.5);
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-color: transparent;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
  background-color: white;
}

.toggle-slider.required {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-slider.required:before {
  transform: translateX(24px);
  background-color: white;
}

input:disabled + .toggle-slider {
  cursor: not-allowed;
}

.cookie-card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;
}

.cookie-card p {
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.7;
  font-size: 0.95rem;
  margin-bottom: 16px;
}

.card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.tag {
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.duration {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(245, 158, 11, 0.8);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  background: none;
  border: none;
}

.read-more i {
  transition: transform 0.3s ease;
}

.read-more:hover {
  color: #fbbf24;
}

.read-more:hover i {
  transform: translateX(4px);
}

/* ===== MANAGER SECTION ===== */
.manager-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 40px;
  margin-bottom: 80px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08), rgba(236, 72, 153, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  animation: card-enter 0.8s ease 0.3s backwards;
}

.manager-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 60%);
  pointer-events: none;
}

.manager-content {
  display: flex;
  align-items: center;
  gap: 28px;
  position: relative;
  z-index: 1;
  width: 100%;
}

.manager-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 20px 50px rgba(124, 58, 237, 0.3);
}

.manager-text {
  flex: 1;
}

.manager-text h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #93c5fd, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.manager-text p {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  font-size: 1rem;
}

.manager-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3);
  flex-shrink: 0;
}

.manager-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 40px rgba(124, 58, 237, 0.4);
}

/* ===== HOW IT WORKS ===== */
.how-it-works {
  margin-bottom: 80px;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 48px;
  background: linear-gradient(135deg, white, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.step-card {
  text-align: center;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  position: relative;
  transition: all 0.4s ease;
  animation: card-enter 0.6s ease backwards;
}

.step-card.active {
  border-color: rgba(124, 58, 237, 0.3);
  background: rgba(124, 58, 237, 0.05);
}

.step-number {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
}

.step-card.active .step-number {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  border-color: transparent;
}

.step-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 12px auto 20px;
}

.step-card h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: white;
}

.step-card p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
}

/* ===== STATS ===== */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 80px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.3), transparent);
}

.stat-item {
  text-align: center;
  position: relative;
}

.stat-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 20%;
  height: 60%;
  width: 1px;
  background: rgba(255, 255, 255, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  margin: 0 auto 16px;
}

.stat-blue { background: rgba(37, 99, 235, 0.15); color: #60a5fa; }
.stat-purple { background: rgba(124, 58, 237, 0.15); color: #a78bfa; }
.stat-green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.stat-pink { background: rgba(236, 72, 153, 0.15); color: #f472b6; }

.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, white, rgba(255, 255, 255, 0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ===== TRANSPARENCY ===== */
.transparency-section {
  position: relative;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 48px;
  margin-bottom: 80px;
  border-radius: 32px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08));
  border: 1px solid rgba(16, 185, 129, 0.15);
  overflow: hidden;
}

.transparency-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent 70%);
  pointer-events: none;
}

.transparency-content {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  position: relative;
  z-index: 2;
}

.transparency-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 20px 50px rgba(16, 185, 129, 0.3);
  animation: icon-pulse 3s ease infinite;
}

@keyframes icon-pulse {
  0%, 100% { box-shadow: 0 20px 50px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 20px 60px rgba(16, 185, 129, 0.5); }
}

.transparency-text h3 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, white, #6ee7b7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.transparency-text p {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.8;
  font-size: 1.05rem;
  margin-bottom: 24px;
}

.transparency-badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.transparency-badges .badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.transparency-badges .badge:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

/* ===== ACTIONS ===== */
.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.primary-btn,
.secondary-btn,
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 18px 36px;
  border-radius: 18px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #f59e0b, #ec4899);
  color: white;
  box-shadow: 0 10px 40px rgba(245, 158, 11, 0.3);
}

.primary-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 50px rgba(245, 158, 11, 0.4);
}

.primary-btn.accepted {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.primary-btn:hover .btn-shine {
  left: 100%;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.06);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
  border-color: rgba(245, 158, 11, 0.3);
}

.ghost-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ghost-btn:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

/* ===== FOOTER NOTE ===== */
.footer-note {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  max-width: 700px;
  margin: 0 auto 60px;
}

.footer-note i {
  font-size: 1.5rem;
  color: rgba(245, 158, 11, 0.6);
  flex-shrink: 0;
}

.footer-note p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  line-height: 1.6;
}

.footer-note a {
  color: #fbbf24;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-note a:hover {
  color: #f59e0b;
  text-decoration: underline;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 5, 8, 0.85);
  backdrop-filter: blur(20px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: modal-overlay-in 0.3s ease;
}

@keyframes modal-overlay-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: linear-gradient(145deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 15, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  padding: 48px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  animation: modal-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.preferences-modal {
  max-width: 500px;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-glow {
  position: absolute;
  top: -30%;
  right: -20%;
  width: 400px;
  height: 400px;
  opacity: 0.3;
  pointer-events: none;
  filter: blur(80px);
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
  transform: rotate(90deg);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
}

.modal-title-section {
  flex: 1;
}

.modal-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.modal-badge.required {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(124, 58, 237, 0.2));
  color: #a78bfa;
}

.modal-title-section h2 {
  font-size: 1.6rem;
  font-weight: 800;
  background: linear-gradient(135deg, white, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modal-divider {
  height: 2px;
  background: linear-gradient(90deg, #f59e0b, #ec4899, #7c3aed);
  border-radius: 2px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.modal-body {
  margin-bottom: 32px;
}

.modal-description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
  font-size: 1rem;
  margin-bottom: 28px;
}

.modal-details {
  margin-bottom: 24px;
}

.modal-details h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
}

.modal-details h4 i {
  color: #10b981;
}

.modal-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.modal-details li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.5;
  transition: all 0.3s ease;
  animation: modal-item-in 0.4s ease both;
}

.modal-details li:nth-child(1) { animation-delay: 0.1s; }
.modal-details li:nth-child(2) { animation-delay: 0.15s; }
.modal-details li:nth-child(3) { animation-delay: 0.2s; }
.modal-details li:nth-child(4) { animation-delay: 0.25s; }
.modal-details li:nth-child(5) { animation-delay: 0.3s; }

@keyframes modal-item-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.modal-details li:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(124, 58, 237, 0.2);
  transform: translateX(4px);
}

.modal-details li i {
  color: #a78bfa;
  font-size: 0.7rem;
  margin-top: 5px;
  flex-shrink: 0;
}

.modal-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.info-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.info-value i {
  color: #a78bfa;
  font-size: 0.85rem;
}

/* Preference List in Modal */
.preference-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.preference-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(124, 58, 237, 0.2);
}

.preference-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preference-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.preference-text h4 {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.preference-text p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Modal Footer Buttons */
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.modal-btn-close,
.modal-btn-save {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: 16px;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn-close {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.3);
}

.modal-btn-save {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.3);
}

.modal-btn-close:hover,
.modal-btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(124, 58, 237, 0.4);
}

.modal-btn-save:hover {
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4);
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
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

.custom-alert.info {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(124, 58, 237, 0.08));
  border-color: rgba(37, 99, 235, 0.25);
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
.custom-alert.info .alert-icon { background: rgba(37, 99, 235, 0.2); color: #93c5fd; }

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
.custom-alert.info .alert-progress { background: rgba(37, 99, 235, 0.5); }

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

/* ===== CONFETTI ===== */
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  border-radius: 2px;
  animation: confetti-fall linear forwards;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .steps-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-item:nth-child(2)::after {
    display: none;
  }
}

@media (max-width: 768px) {
  .cookies-header {
    padding: 14px 20px;
  }

  .cookies-container {
    padding: 40px 20px 30px;
  }

  .hero-title {
    font-size: clamp(2rem, 8vw, 3rem);
  }

  .cookies-grid {
    grid-template-columns: 1fr;
  }

  .manager-content {
    flex-direction: column;
    text-align: center;
  }

  .manager-icon {
    margin: 0 auto;
  }

  .manager-btn {
    width: 100%;
    justify-content: center;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }

  .stats-section {
    grid-template-columns: 1fr 1fr;
    padding: 24px;
    gap: 24px;
  }

  .stat-item::after {
    display: none;
  }

  .transparency-content {
    flex-direction: column;
    text-align: center;
  }

  .transparency-icon {
    margin: 0 auto;
  }

  .transparency-badges {
    justify-content: center;
  }

  .actions {
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn,
  .ghost-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-container {
    padding: 32px 24px;
    border-radius: 24px;
  }

  .modal-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .modal-icon {
    margin: 0 auto;
  }

  .modal-info-grid {
    grid-template-columns: 1fr;
  }

  .preference-item {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .preference-info {
    flex-direction: column;
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

  .manager-section,
  .transparency-section {
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

/* Modal scrollbar */
.modal-container::-webkit-scrollbar {
  width: 6px;
}

.modal-container::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container::-webkit-scrollbar-thumb {
  background: rgba(245, 158, 11, 0.2);
  border-radius: 3px;
}
</style>