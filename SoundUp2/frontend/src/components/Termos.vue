<template>
  <div class="terms-page">
    
    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="gradient-ball ball-1"></div>
      <div class="gradient-ball ball-2"></div>
      <div class="gradient-ball ball-3"></div>
      <div class="gradient-ball ball-4"></div>
      <div class="grid-overlay"></div>
      <div class="noise-texture"></div>
    </div>

    <!-- Floating Particles -->
    <div class="particles">
      <div v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)"></div>
    </div>

    <!-- Content -->
    <main class="terms-container">
      
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-glow"></div>
        
        <div class="hero-badge" @mouseenter="badgeHover = true" @mouseleave="badgeHover = false" :class="{ 'hover': badgeHover }">
          <span class="badge-dot"></span>
          <span>Termos de Uso</span>
        </div>

        <h1 class="hero-title">
          Termos e
          <span class="gradient-text">Condições</span>
        </h1>

        <p class="hero-description">
          Ao utilizar a plataforma SoundUp, você concorda com os termos descritos abaixo.
          Nosso objetivo é garantir uma experiência musical segura, divertida e transparente.
        </p>

        <div class="last-update">
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
      </div>

      <!-- Progress Bar -->
      <div class="reading-progress" :style="{ width: scrollProgress + '%' }"></div>

      <!-- Cards Grid -->
      <div class="terms-grid" id="terms">

        <section 
          v-for="(term, index) in termsList" 
          :key="index"
          class="term-card"
          :class="{ 'active': activeCard === index }"
          @mouseenter="activeCard = index"
          @mouseleave="activeCard = null"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="card-glow" :class="`glow-${term.color}`"></div>
          
          <div class="card-header">
            <div class="card-icon" :class="`icon-${term.color}`">
              <i :class="term.icon"></i>
            </div>
            <div class="card-number">0{{ index + 1 }}</div>
          </div>

          <h2>{{ term.title }}</h2>
          
          <div class="card-divider"></div>
          
          <p>{{ term.description }}</p>

          <div class="card-footer">
            <span class="read-more" @click="openModal(term)">
              Saiba mais
              <i class="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </section>

      </div>

      <!-- Interactive Stats -->
      <div class="stats-section">
        <div class="stat-item" v-for="(stat, idx) in stats" :key="idx">
          <div class="stat-icon" :class="`stat-${stat.color}`">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-value" :data-target="stat.value">{{ stat.displayValue }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Highlight Box -->
      <div class="highlight-box" id="privacy">
        <div class="highlight-glow"></div>
        
        <div class="highlight-content">
          <div class="highlight-icon">
            <i class="fa-solid fa-shield-halved"></i>
          </div>

          <div class="highlight-text">
            <h3>Compromisso SoundUp</h3>
            <p>
              Nosso compromisso é oferecer uma experiência musical moderna,
              segura e inspiradora para todos os usuários. Protegemos seus dados
              com criptografia de ponta e respeitamos sua privacidade.
            </p>
            
            <div class="highlight-features">
              <span class="feature-tag"><i class="fa-solid fa-lock"></i> Criptografia AES-256</span>
              <span class="feature-tag"><i class="fa-solid fa-user-shield"></i> GDPR Compliant</span>
              <span class="feature-tag"><i class="fa-solid fa-certificate"></i> SSL Seguro</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="timeline-section">
        <h3 class="timeline-title">Como Funciona</h3>
        
        <div class="timeline">
          <div 
            v-for="(step, idx) in timelineSteps" 
            :key="idx"
            class="timeline-item"
            :class="{ 'active': timelineActive >= idx }"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions" id="contact">
        <button class="primary-btn" @click="acceptTerms" :class="{ 'accepted': termsAccepted }">
          <span v-if="!termsAccepted">
            <i class="fa-solid fa-check-circle"></i>
            Aceitar Termos
          </span>
          <span v-else>
            <i class="fa-solid fa-check-double"></i>
            Termos Aceitos!
          </span>
          <div class="btn-shine"></div>
        </button>

        <button class="secondary-btn" @click="goHome">
          <i class="fa-solid fa-house"></i>
          Voltar ao Início
        </button>

        <button class="ghost-btn" @click="downloadTerms">
          <i class="fa-solid fa-download"></i>
          Baixar PDF
        </button>
      </div>

      <!-- Footer Note -->
<div class="footer-note">
  <i class="fa-solid fa-circle-info"></i>
  <p>
    Ao clicar em "Aceitar Termos", você concorda com nossa 
    <a href="#" @click.prevent="goToPrivacy">Política de Privacidade</a> e 
    <a href="#" @click.prevent="goToCookies">Cookies</a>.
  </p>
</div>

    </main>

    <!-- Modal -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-glow" :class="`glow-${selectedTerm.color}`"></div>
          
          <button class="modal-close" @click="closeModal">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="modal-header">
            <div class="modal-icon" :class="`icon-${selectedTerm.color}`">
              <i :class="selectedTerm.icon"></i>
            </div>
            <div class="modal-title-section">
              <span class="modal-number">0{{ selectedTermIndex + 1 }}</span>
              <h2>{{ selectedTerm.title }}</h2>
            </div>
          </div>

          <div class="modal-divider"></div>

          <div class="modal-body">
            <p class="modal-description">{{ selectedTerm.fullDescription }}</p>
            
            <div class="modal-details">
              <h4><i class="fa-solid fa-circle-check"></i> O que está incluído</h4>
              <ul>
                <li v-for="(item, i) in selectedTerm.details" :key="i">
                  <i class="fa-solid fa-chevron-right"></i>
                  {{ item }}
                </li>
              </ul>
            </div>

            <div class="modal-warning" v-if="selectedTerm.warning">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <p>{{ selectedTerm.warning }}</p>
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

  </div>
</template>

<script>
export default {
  name: 'TermsPage',

  data() {
    return {
      isScrolled: false,
      activeCard: null,
      badgeHover: false,
      termsAccepted: false,
      scrollProgress: 0,
      timelineActive: 0,
      showModal: false,
      selectedTerm: {},
      selectedTermIndex: 0,
      
      termsList: [
        {
          title: 'Uso da Plataforma',
          description: 'O SoundUp permite que usuários descubram músicas, criem playlists, curtam artistas e participem de experiências musicais interativas de forma segura e responsável.',
          fullDescription: 'A plataforma SoundUp foi desenvolvida para proporcionar uma experiência musical completa e imersiva. Ao utilizar nossos serviços, você terá acesso a milhões de faixas, playlists curadas por especialistas e ferramentas de descoberta musical personalizadas.',
          icon: 'fa-solid fa-music',
          color: 'blue',
          details: [
            'Acesso ilimitado ao catálogo musical completo',
            'Criação de playlists personalizadas ilimitadas',
            'Sistema de recomendações baseado em IA',
            'Modo offline para músicas salvas',
            'Sincronização entre dispositivos',
            'Experiências musicais interativas e eventos ao vivo'
          ],
          warning: 'O uso comercial da plataforma sem autorização prévia é estritamente proibido.'
        },
        {
          title: 'Privacidade & Dados',
          description: 'Suas informações são protegidas com criptografia de ponta e utilizadas apenas para melhorar sua experiência dentro da plataforma. Nunca vendemos seus dados.',
          fullDescription: 'A privacidade dos nossos usuários é uma prioridade absoluta. Implementamos as mais rigorosas medidas de segurança para garantir que seus dados pessoais e hábitos musicais estejam sempre protegidos.',
          icon: 'fa-solid fa-lock',
          color: 'purple',
          details: [
            'Criptografia AES-256 para todos os dados sensíveis',
            'Conformidade total com LGPD e GDPR',
            'Dados anonimizados para análises estatísticas',
            'Controle total sobre suas preferências de privacidade',
            'Exclusão permanente de dados sob solicitação',
            'Transparência total sobre como os dados são utilizados'
          ],
          warning: 'Compartilhar sua conta pode comprometer a segurança dos seus dados pessoais.'
        },
        {
          title: 'Conduta do Usuário',
          description: 'Não é permitido utilizar a plataforma para atividades ilegais, ofensivas, fraudulentas ou que prejudiquem outros usuários da comunidade.',
          fullDescription: 'Para manter uma comunidade musical saudável e respeitosa, estabelecemos diretrizes claras de conduta. Todos os usuários devem seguir estas regras para garantir uma experiência positiva para todos.',
          icon: 'fa-solid fa-user-shield',
          color: 'pink',
          details: [
            'Respeito mútuo entre todos os usuários',
            'Proibição de conteúdo ofensivo ou discriminatório',
            'Não tolerância com assédio ou bullying',
            'Proibição de spam ou conteúdo promocional não autorizado',
            'Uso adequado dos recursos de comentários e reviews',
            'Responsabilidade pelo conteúdo compartilhado'
          ],
          warning: 'Violações graves podem resultar em banimento permanente da plataforma.'
        },
        {
          title: 'Direitos Autorais',
          description: 'Todas as músicas, logos, artes e conteúdos pertencem aos seus respectivos proprietários e parceiros licenciados. Respeitamos a propriedade intelectual.',
          fullDescription: 'O SoundUp opera com licenças oficiais de gravadoras, editoras e artistas. Todo o conteúdo disponível na plataforma está devidamente licenciado e protegido por leis de direitos autorais.',
          icon: 'fa-solid fa-copyright',
          color: 'cyan',
          details: [
            'Licenciamento oficial com todas as grandes gravadoras',
            'Pagamento justo de royalties aos artistas',
            'Proteção contra pirataria e distribuição ilegal',
            'Respeito aos direitos de propriedade intelectual',
            'Processo de disputa de direitos autorais transparente',
            'Parcerias com associações de proteção aos artistas'
          ],
          warning: 'Qualquer tentativa de download ou redistribuição não autorizada é crime.'
        },
        {
          title: 'Suspensão de Conta',
          description: 'Contas que violarem nossos termos poderão ser suspensas ou removidas permanentemente sem aviso prévio, garantindo a segurança da comunidade.',
          fullDescription: 'Para proteger nossa comunidade, reservamo-nos o direito de suspender ou encerrar contas que violem nossos termos de uso. Cada caso é analisado individualmente e de forma justa.',
          icon: 'fa-solid fa-ban',
          color: 'red',
          details: [
            'Análise cuidadosa de cada caso de violação',
            'Notificação prévia quando aplicável',
            'Possibilidade de recurso e revisão',
            'Escalonamento progressivo de penalidades',
            'Preservação de dados por período legal determinado',
            'Cooperação com autoridades quando necessário'
          ],
          warning: 'Contas envolvidas em atividades ilegais serão encerradas imediatamente.'
        },
        {
          title: 'Atualizações',
          description: 'Os termos podem ser atualizados periodicamente para refletir melhorias, novas funcionalidades e mudanças legais. Notificaremos sobre alterações.',
          fullDescription: 'Estamos constantemente evoluindo para oferecer a melhor experiência possível. Por isso, nossos termos de uso podem ser atualizados periodicamente para refletir novas funcionalidades e requisitos legais.',
          icon: 'fa-solid fa-rotate',
          color: 'green',
          details: [
            'Notificação prévia de 30 dias para alterações significativas',
            'Histórico completo de versões anteriores dos termos',
            'Explicação clara sobre o que mudou e por quê',
            'Aceitação tácita após período de notificação',
            'Possibilidade de encerramento da conta sem penalidades',
            'Consulta pública para mudanças estruturais'
          ],
          warning: 'O uso continuado após atualizações implica aceitação dos novos termos.'
        }
      ],

      stats: [
        { icon: 'fa-solid fa-users', value: 50000, displayValue: '0', label: 'Usuários Ativos', color: 'blue' },
        { icon: 'fa-solid fa-music', value: 1200000, displayValue: '0', label: 'Músicas Indexadas', color: 'purple' },
        { icon: 'fa-solid fa-shield-halved', value: 99.9, displayValue: '0', label: 'Uptime Garantido', color: 'green' },
        { icon: 'fa-solid fa-headset', value: 24, displayValue: '0', label: 'Suporte 24/7', color: 'pink' }
      ],

      timelineSteps: [
        { title: 'Crie sua Conta', description: 'Registro rápido e seguro em menos de 1 minuto' },
        { title: 'Explore Músicas', description: 'Descubra milhões de faixas e artistas' },
        { title: 'Crie Playlists', description: 'Organize suas músicas favoritas' },
        { title: 'Compartilhe', description: 'Compartilhe com amigos e descubra juntos' }
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

  this.animateStats()
  this.startTimeline()
  this.checkTermsAccepted()
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

goToCookies() {
  this.$router.push('/cookies').then(() => {
    this.$nextTick(() => {
      const content = this.getContentElement()
      if (content) {
        content.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  })
},
  
scrollToTop() {
  const content = this.getContentElement()
  if (content) {
    content.scrollTo({ top: 0, behavior: 'smooth' })
  }
},

handleScroll() {
  const content = this.getContentElement()
  if (!content) return

  this.isScrolled = content.scrollTop > 50
  
  // Calculate scroll progress
  const scrollHeight = content.scrollHeight - content.clientHeight
  this.scrollProgress = scrollHeight > 0 ? (content.scrollTop / scrollHeight) * 100 : 0
},

    getParticleStyle(n) {
      return {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${15 + Math.random() * 20}s`,
        opacity: 0.1 + Math.random() * 0.3
      }
    },

    animateStats() {
      this.stats.forEach((stat, idx) => {
        const duration = 2000
        const start = performance.now()
        const target = stat.value
        
        const animate = (currentTime) => {
          const elapsed = currentTime - start
          const progress = Math.min(elapsed / duration, 1)
          const easeOut = 1 - Math.pow(1 - progress, 3)
          
          if (stat.value < 100) {
            stat.displayValue = (easeOut * target).toFixed(1)
          } else {
            stat.displayValue = Math.floor(easeOut * target).toLocaleString('pt-BR')
          }
          
          if (progress < 1) {
            requestAnimationFrame(animate)
          }
        }
        
        setTimeout(() => requestAnimationFrame(animate), idx * 200)
      })
    },

    startTimeline() {
      const interval = setInterval(() => {
        if (this.timelineActive < this.timelineSteps.length - 1) {
          this.timelineActive++
        } else {
          this.timelineActive = 0
        }
      }, 3000)
    },

    checkTermsAccepted() {
      this.termsAccepted = localStorage.getItem('soundup_terms_accepted') === 'true'
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

acceptTerms() {
  localStorage.setItem('soundup_terms_accepted', 'true')
  this.termsAccepted = true
  this.createConfetti()
  
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
  }, 1500)
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

async downloadTerms() {
  try {
    // Import dinâmico do jsPDF (funciona em Vite, Webpack, Vue CLI)
    const { jsPDF } = await import('jspdf')
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const currentDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    // === CONFIGURAÇÕES ===
    const MARGIN = 25
    const PAGE_WIDTH = 210
    const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)
    let y = 30

    const colors = {
      primary: [37, 99, 235],
      secondary: [124, 58, 237],
      accent: [236, 72, 153],
      text: [30, 30, 30],
      muted: [100, 100, 100],
      light: [245, 245, 250]
    }

    const centerText = (text, yPos, fontSize = 12, style = 'normal', color = colors.text) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', style)
      doc.setTextColor(...color)
      const textWidth = doc.getTextWidth(text)
      doc.text(text, (PAGE_WIDTH - textWidth) / 2, yPos)
    }

    const drawLine = (yPos, color = colors.primary) => {
      doc.setDrawColor(...color)
      doc.setLineWidth(0.5)
      doc.setLineDashPattern([3, 3], 0)
      doc.line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos)
      doc.setLineDashPattern([], 0)
    }

    // === HEADER COLORIDO ===
    doc.setFillColor(...colors.primary)
    doc.rect(0, 0, PAGE_WIDTH, 8, 'F')
    doc.setFillColor(...colors.secondary)
    doc.rect(PAGE_WIDTH * 0.33, 0, PAGE_WIDTH * 0.33, 8, 'F')
    doc.setFillColor(...colors.accent)
    doc.rect(PAGE_WIDTH * 0.66, 0, PAGE_WIDTH * 0.34, 8, 'F')

    y += 10
    centerText('SOUNDUP', y, 24, 'bold', colors.primary)
    y += 10
    centerText('Termos e Condições de Uso', y, 16, 'bold', colors.text)
    y += 8
    centerText('Plataforma de Streaming Musical', y, 11, 'italic', colors.muted)
    y += 12

    // Metadata box
    doc.setFillColor(250, 250, 252)
    doc.roundedRect(MARGIN + 20, y, CONTENT_WIDTH - 40, 22, 3, 3, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.muted)
    centerText(`Data: ${currentDate}  |  Versão: 1.0  |  Status: Vigente`, y + 8, 9, 'normal', colors.muted)
    centerText('SoundUp Tecnologia Musical Ltda.', y + 15, 9, 'italic', colors.muted)
    y += 32

    drawLine(y, colors.secondary)
    y += 10

    // === RESUMO ===
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('RESUMO', MARGIN, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.text)
    const resumoText = 'O presente documento estabelece os termos e condições de uso da plataforma SoundUp, serviço de streaming musical que permite aos usuários descobrir músicas, criar playlists, curtir artistas e participar de experiências musicais interativas.'
    const resumoLines = doc.splitTextToSize(resumoText, CONTENT_WIDTH)
    doc.text(resumoLines, MARGIN, y)
    y += (resumoLines.length * 5) + 5

    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...colors.muted)
    doc.text('Palavras-chave: streaming musical; termos de uso; privacidade; direitos autorais; plataforma digital.', MARGIN, y)
    y += 12

    drawLine(y, colors.primary)
    y += 10

    // === INTRODUÇÃO ===
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('1. INTRODUÇÃO', MARGIN, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.text)
    const introText = 'A plataforma SoundUp foi desenvolvida para proporcionar uma experiência musical completa e imersiva. Ao utilizar os serviços oferecidos, o usuário terá acesso a milhões de faixas, playlists curadas por especialistas e ferramentas de descoberta musical personalizadas. A aceitação dos termos é condição indispensável para a utilização dos serviços.'
    const introLines = doc.splitTextToSize(introText, CONTENT_WIDTH)
    doc.text(introLines, MARGIN, y)
    y += (introLines.length * 5) + 8

    // === SEÇÕES DOS TERMOS ===
    const sectionColors = ['primary', 'secondary', 'accent', 'primary', 'secondary', 'accent']
    
    this.termsList.forEach((term, index) => {
      // Nova página se necessário
      if (y > 250) {
        doc.addPage()
        y = 25
        doc.setFillColor(...colors.primary)
        doc.rect(0, 0, PAGE_WIDTH, 4, 'F')
        y += 8
      }

      // Número grande
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(230, 230, 240)
      doc.text(`0${index + 1}`, MARGIN, y + 5)

      // Título
      const secColor = colors[sectionColors[index]]
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...secColor)
      doc.text(`${index + 1}. ${term.title.toUpperCase()}`, MARGIN + 15, y)
      y += 10

      // Descrição
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.text)
      const descLines = doc.splitTextToSize(term.fullDescription, CONTENT_WIDTH)
      doc.text(descLines, MARGIN, y)
      y += (descLines.length * 5) + 5

      // Itens em caixa
      const boxHeight = 5 + (term.details.length * 5) + 5
      doc.setFillColor(248, 249, 255)
      doc.setDrawColor(200, 200, 220)
      doc.roundedRect(MARGIN, y - 3, CONTENT_WIDTH, boxHeight, 2, 2, 'FD')

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.primary)
      doc.text('O que está incluído:', MARGIN + 5, y + 5)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.text)
      let itemY = y + 12
      term.details.forEach(item => {
        doc.setTextColor(...colors.secondary)
        doc.text('•', MARGIN + 8, itemY)
        doc.setTextColor(...colors.text)
        doc.text(item, MARGIN + 13, itemY)
        itemY += 5
      })
      y += boxHeight + 5

      // Advertência
      if (term.warning) {
        doc.setFillColor(255, 248, 240)
        doc.setDrawColor(245, 158, 11)
        doc.roundedRect(MARGIN, y - 2, CONTENT_WIDTH, 12, 2, 2, 'FD')

        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(245, 158, 11)
        doc.text('!', MARGIN + 5, y + 4)

        doc.setFont('helvetica', 'italic')
        doc.setTextColor(120, 80, 40)
        const warnLines = doc.splitTextToSize(term.warning, CONTENT_WIDTH - 20)
        doc.text(warnLines, MARGIN + 12, y + 4)
        y += 14
      }

      drawLine(y, colors.secondary)
      y += 10
    })

    // === COMPROMISSO ===
    if (y > 230) {
      doc.addPage()
      y = 25
      doc.setFillColor(...colors.primary)
      doc.rect(0, 0, PAGE_WIDTH, 4, 'F')
      y += 8
    }

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('COMPROMISSO SOUNDUP', MARGIN, y)
    y += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.text)
    const compText = 'O compromisso da SoundUp é oferecer uma experiência musical moderna, segura e inspiradora para todos os usuários. A empresa protege os dados com criptografia de ponta e respeita a privacidade dos usuários.'
    const compLines = doc.splitTextToSize(compText, CONTENT_WIDTH)
    doc.text(compLines, MARGIN, y)
    y += (compLines.length * 5) + 8

    // Tags
    const tags = ['Criptografia AES-256', 'GDPR Compliant', 'SSL Seguro']
    let tagX = MARGIN
    tags.forEach((tag) => {
      const tagWidth = doc.getTextWidth(tag) + 16
      doc.setFillColor(240, 240, 250)
      doc.setDrawColor(200, 200, 220)
      doc.roundedRect(tagX, y - 4, tagWidth, 10, 2, 2, 'FD')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.secondary)
      doc.text('OK', tagX + 5, y + 2)
      doc.setTextColor(...colors.text)
      doc.text(tag, tagX + 12, y + 2)
      tagX += tagWidth + 8
    })
    y += 18

    // === ESTATÍSTICAS ===
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('ESTATÍSTICAS DA PLATAFORMA', MARGIN, y)
    y += 12

    const stats = [
      { value: '50.000', label: 'Usuários Ativos', color: colors.primary },
      { value: '1.200.000', label: 'Músicas Indexadas', color: colors.secondary },
      { value: '99,9%', label: 'Uptime Garantido', color: [16, 185, 129] },
      { value: '24/7', label: 'Suporte', color: colors.accent }
    ]

    const colWidth = CONTENT_WIDTH / 4
    stats.forEach((stat, i) => {
      const x = MARGIN + (i * colWidth)
      doc.setFillColor(250, 250, 252)
      doc.roundedRect(x + 2, y - 3, colWidth - 4, 28, 2, 2, 'F')
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...stat.color)
      const valWidth = doc.getTextWidth(stat.value)
      doc.text(stat.value, x + (colWidth / 2) - (valWidth / 2), y + 8)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.muted)
      const labelWidth = doc.getTextWidth(stat.label)
      doc.text(stat.label, x + (colWidth / 2) - (labelWidth / 2), y + 16)
    })
    y += 35

    // === TIMELINE ===
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('COMO FUNCIONA', MARGIN, y)
    y += 12

    this.timelineSteps.forEach((step, i) => {
      doc.setFillColor(...colors.secondary)
      doc.circle(MARGIN + 5, y + 3, 4, 'F')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(`${i + 1}`, MARGIN + 3.5, y + 4.5)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...colors.text)
      doc.text(step.title, MARGIN + 15, y + 2)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.muted)
      doc.text(step.description, MARGIN + 15, y + 8)

      if (i < this.timelineSteps.length - 1) {
        doc.setDrawColor(200, 200, 220)
        doc.setLineWidth(0.5)
        doc.line(MARGIN + 5, y + 8, MARGIN + 5, y + 20)
      }
      y += 18
    })
    y += 10

    // === CONSIDERAÇÕES FINAIS ===
    if (y > 240) {
      doc.addPage()
      y = 25
      doc.setFillColor(...colors.primary)
      doc.rect(0, 0, PAGE_WIDTH, 4, 'F')
      y += 8
    }

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('CONSIDERAÇÕES FINAIS', MARGIN, y)
    y += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...colors.text)
    const finalText = 'Ao clicar em "Aceitar Termos", o usuário concorda com a Política de Privacidade e a Política de Cookies da SoundUp. A SoundUp reserva-se o direito de alterar os presentes termos a qualquer momento, mediante notificação prévia aos usuários.'
    const finalLines = doc.splitTextToSize(finalText, CONTENT_WIDTH)
    doc.text(finalLines, MARGIN, y)
    y += (finalLines.length * 5) + 15

    // === REFERÊNCIAS ===
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...colors.primary)
    doc.text('REFERÊNCIAS', MARGIN, y)
    y += 10

    const refs = [
      'BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD).',
      'BRASIL. Lei nº 9.610, de 19 de fevereiro de 1998. Lei de Direitos Autorais.',
      'UNIÃO EUROPEIA. Regulamento Geral de Proteção de Dados (GDPR). Regulamento (UE) 2016/679.',
      'ABNT. NBR 6022:2018. Informação e documentação – Artigo em publicação periódica científica.',
      'ABNT. NBR 14724:2011. Informação e documentação – Trabalhos acadêmicos – Apresentação.'
    ]

    refs.forEach(ref => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...colors.muted)
      const refLines = doc.splitTextToSize(ref, CONTENT_WIDTH - 10)
      doc.text(refLines, MARGIN + 5, y)
      y += (refLines.length * 4.5) + 3
    })
    y += 10

    // === FOOTER ===
    doc.setFillColor(...colors.primary)
    doc.rect(0, 287, PAGE_WIDTH, 10, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 255)
    const footerText = `© SoundUp Tecnologia Musical Ltda.  |  ${currentDate}  |  Todos os direitos reservados.`
    const footerWidth = doc.getTextWidth(footerText)
    doc.text(footerText, (PAGE_WIDTH - footerWidth) / 2, 292)

    // Número de páginas
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`${i} / ${totalPages}`, PAGE_WIDTH - MARGIN, 292, { align: 'right' })
    }

    // Salvar
    doc.save('SoundUp-Termos-e-Condicoes-de-Uso.pdf')

  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    // Fallback: baixa como TXT se jsPDF falhar
    this.downloadTermsFallback()
  }
},

// Método de fallback caso jsPDF falhe
downloadTermsFallback() {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  let content = `SOUNDUP - TERMOS E CONDIÇÕES DE USO\n`
  content += `Plataforma de Streaming Musical\n`
  content += `Data: ${currentDate} | Versão: 1.0 | Status: Vigente\n\n`
  content += `RESUMO\n`
  content += `O presente documento estabelece os termos e condições de uso da plataforma SoundUp.\n\n`
  content += `1. INTRODUÇÃO\n`
  content += `A plataforma SoundUp foi desenvolvida para proporcionar uma experiência musical completa e imersiva.\n\n`

  this.termsList.forEach((term, index) => {
    content += `${index + 1}. ${term.title.toUpperCase()}\n`
    content += `${term.fullDescription}\n\n`
    content += `O que está incluído:\n`
    term.details.forEach(d => content += `  • ${d}\n`)
    if (term.warning) content += `\n  ⚠ ${term.warning}\n`
    content += `\n`
  })

  content += `COMPROMISSO SOUNDUP\n`
  content += `O compromisso da SoundUp é oferecer uma experiência musical moderna, segura e inspiradora.\n\n`
  content += `ESTATÍSTICAS\n`
  content += `• 50.000 Usuários Ativos\n`
  content += `• 1.200.000 Músicas Indexadas\n`
  content += `• 99,9% Uptime Garantido\n`
  content += `• Suporte 24/7\n\n`
  content += `COMO FUNCIONA\n`
  this.timelineSteps.forEach((step, i) => {
    content += `${i + 1}. ${step.title} - ${step.description}\n`
  })
  content += `\n`
  content += `CONSIDERAÇÕES FINAIS\n`
  content += `Ao clicar em "Aceitar Termos", o usuário concorda com a Política de Privacidade e Cookies.\n\n`
  content += `REFERÊNCIAS\n`
  content += `• BRASIL. Lei nº 13.709, de 2018. LGPD.\n`
  content += `• BRASIL. Lei nº 9.610, de 1998. Lei de Direitos Autorais.\n`
  content += `• UNIÃO EUROPEIA. GDPR. Regulamento (UE) 2016/679.\n`
  content += `• ABNT. NBR 6022:2018.\n`
  content += `• ABNT. NBR 14724:2011.\n\n`
  content += `© SoundUp Tecnologia Musical Ltda. ${currentDate}. Todos os direitos reservados.`

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'SoundUp-Termos-e-Condicoes-de-Uso.txt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
},

    openModal(term) {
      this.selectedTerm = term
      this.selectedTermIndex = this.termsList.indexOf(term)
      this.showModal = true
      document.body.style.overflow = 'hidden'
    },

    closeModal() {
      this.showModal = false
      document.body.style.overflow = ''
      setTimeout(() => {
        this.selectedTerm = {}
        this.selectedTermIndex = 0
      }, 300)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

/* ===== BASE ===== */
.terms-page {
  min-height: 100vh;
  background: #050508;
  color: white;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== BACKGROUND ===== */
.bg-effects {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.gradient-ball {
  position: absolute;
  border-radius: 50%;
  filter: blur(150px);
  opacity: 0.15;
  animation: float-ball 20s infinite ease-in-out;
}

.ball-1 {
  width: 600px;
  height: 600px;
  background: #2563eb;
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.ball-2 {
  width: 500px;
  height: 500px;
  background: #7c3aed;
  top: 30%;
  right: -200px;
  animation-delay: -5s;
}

.ball-3 {
  width: 400px;
  height: 400px;
  background: #ec4899;
  bottom: -150px;
  left: 20%;
  animation-delay: -10s;
}

.ball-4 {
  width: 350px;
  height: 350px;
  background: #06b6d4;
  top: 60%;
  left: -100px;
  animation-delay: -15s;
}

@keyframes float-ball {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, -30px) scale(1.1); }
  50% { transform: translate(-30px, 50px) scale(0.9); }
  75% { transform: translate(20px, -20px) scale(1.05); }
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

.noise-texture {
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
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  animation: particle-float linear infinite;
}

@keyframes particle-float {
  0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
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

/* ===== CONTENT ===== */
.terms-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 140px 30px 80px;
  position: relative;
  z-index: 2;
}

/* ===== HERO ===== */
.hero-section {
  text-align: center;
  margin-bottom: 100px;
  position: relative;
}

.hero-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.2);
  color: #c4b5fd;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 32px;
  transition: all 0.4s ease;
  cursor: default;
}

.hero-badge.hover {
  background: rgba(124, 58, 237, 0.2);
  border-color: rgba(124, 58, 237, 0.4);
  transform: scale(1.05);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

.hero-title {
  font-size: clamp(3rem, 8vw, 5.5rem);
  line-height: 1.05;
  font-weight: 900;
  margin-bottom: 28px;
  letter-spacing: -0.03em;
}

.gradient-text {
  background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradient-shift 5s ease infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-description {
  max-width: 700px;
  margin: 0 auto 32px;
  color: rgba(255,255,255,0.6);
  line-height: 1.8;
  font-size: 1.15rem;
  font-weight: 400;
}

.last-update {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.4);
  font-size: 0.9rem;
  padding: 10px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
}

/* ===== SCROLL INDICATOR ===== */
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

/* ===== GRID ===== */
.terms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 80px;
}

/* ===== CARD ===== */
.term-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  animation: card-appear 0.6s ease backwards;
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.term-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(124, 58, 237, 0.3);
  box-shadow: 0 25px 60px rgba(124, 58, 237, 0.15);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.term-card:hover .card-glow {
  opacity: 1;
}

.glow-blue { background: radial-gradient(circle at 30% 30%, rgba(37, 99, 235, 0.15), transparent 50%); }
.glow-purple { background: radial-gradient(circle at 30% 30%, rgba(124, 58, 237, 0.15), transparent 50%); }
.glow-pink { background: radial-gradient(circle at 30% 30%, rgba(236, 72, 153, 0.15), transparent 50%); }
.glow-cyan { background: radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.15), transparent 50%); }
.glow-red { background: radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.15), transparent 50%); }
.glow-green { background: radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.15), transparent 50%); }

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
.icon-red { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.icon-green { background: rgba(16, 185, 129, 0.15); color: #34d399; }

.term-card:hover .card-icon {
  transform: scale(1.1) rotate(-5deg);
}

.card-number {
  font-size: 3rem;
  font-weight: 900;
  color: rgba(255,255,255,0.05);
  line-height: 1;
  transition: color 0.3s ease;
}

.term-card:hover .card-number {
  color: rgba(124, 58, 237, 0.15);
}

.term-card h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.card-divider {
  width: 40px;
  height: 3px;
  border-radius: 2px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  transition: width 0.4s ease;
}

.term-card:hover .card-divider {
  width: 80px;
}

.term-card p {
  color: rgba(255,255,255,0.55);
  line-height: 1.7;
  font-size: 0.95rem;
}

.card-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(124, 58, 237, 0.8);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
}

.read-more i {
  transition: transform 0.3s ease;
}

.read-more:hover {
  color: #a78bfa;
}

.read-more:hover i {
  transform: translateX(4px);
}

/* ===== STATS SECTION ===== */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 80px;
  padding: 40px;
  background: rgba(255,255,255,0.02);
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.05);
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
  background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.3), transparent);
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
  background: rgba(255,255,255,0.05);
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
  background: linear-gradient(135deg, white, rgba(255,255,255,0.7));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ===== HIGHLIGHT BOX ===== */
.highlight-box {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(37,99,235,0.08),
    rgba(124,58,237,0.08),
    rgba(236,72,153,0.08)
  );
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 32px;
  padding: 48px;
  margin-bottom: 80px;
  overflow: hidden;
}

.highlight-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.2), transparent 70%);
  pointer-events: none;
}

.highlight-content {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  position: relative;
  z-index: 2;
}

.highlight-icon {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 20px 50px rgba(124, 58, 237, 0.3);
  animation: icon-pulse 3s ease infinite;
}

@keyframes icon-pulse {
  0%, 100% { box-shadow: 0 20px 50px rgba(124, 58, 237, 0.3); }
  50% { box-shadow: 0 20px 60px rgba(124, 58, 237, 0.5); }
}

.highlight-text h3 {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, white, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.highlight-text p {
  color: rgba(255,255,255,0.6);
  line-height: 1.8;
  font-size: 1.05rem;
  margin-bottom: 24px;
}

.highlight-features {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  transition: all 0.3s ease;
}

.feature-tag:hover {
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.3);
  transform: translateY(-2px);
}

/* ===== TIMELINE ===== */
.timeline-section {
  margin-bottom: 80px;
}

.timeline-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 48px;
  background: linear-gradient(135deg, white, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 0 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 40px;
  right: 40px;
  height: 2px;
  background: rgba(255,255,255,0.08);
}

.timeline-item {
  flex: 1;
  text-align: center;
  position: relative;
  padding: 0 16px;
}

.timeline-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.1);
  margin: 0 auto 20px;
  position: relative;
  z-index: 2;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-item.active .timeline-dot {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border-color: transparent;
  box-shadow: 0 0 30px rgba(124, 58, 237, 0.5);
}

.timeline-dot::after {
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-item.active .timeline-dot::after {
  opacity: 1;
}

.timeline-content h4 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
  transition: color 0.3s ease;
}

.timeline-item.active .timeline-content h4 {
  background: linear-gradient(135deg, #a78bfa, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.timeline-content p {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
  line-height: 1.5;
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
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  box-shadow: 0 10px 40px rgba(124, 58, 237, 0.4);
}

.primary-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 50px rgba(124, 58, 237, 0.5);
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
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s ease;
}

.primary-btn:hover .btn-shine {
  left: 100%;
}

.secondary-btn {
  background: rgba(255,255,255,0.06);
  color: white;
  border: 1px solid rgba(255,255,255,0.1);
}

.secondary-btn:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-4px);
  border-color: rgba(124, 58, 237, 0.3);
}

.ghost-btn {
  background: transparent;
  color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.08);
}

.ghost-btn:hover {
  color: white;
  border-color: rgba(255,255,255,0.2);
  transform: translateY(-4px);
}

/* ===== FOOTER NOTE ===== */
.footer-note {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(255,255,255,0.02);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  max-width: 700px;
  margin: 0 auto;
}

.footer-note i {
  font-size: 1.5rem;
  color: rgba(124, 58, 237, 0.6);
  flex-shrink: 0;
}

.footer-note p {
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  line-height: 1.6;
}

.footer-note a {
  color: #a78bfa;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-note a:hover {
  color: #c4b5fd;
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
  animation: modal-icon-in 0.5s ease 0.2s both;
}

@keyframes modal-icon-in {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

.modal-title-section {
  flex: 1;
}

.modal-number {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(124, 58, 237, 0.8);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
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
  background: linear-gradient(90deg, #2563eb, #7c3aed, #ec4899);
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
.modal-details li:nth-child(6) { animation-delay: 0.35s; }

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

.modal-warning {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 16px;
  animation: modal-warning-in 0.5s ease 0.4s both;
}

@keyframes modal-warning-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-warning i {
  color: #f59e0b;
  font-size: 1.2rem;
  margin-top: 2px;
  flex-shrink: 0;
}

.modal-warning p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: center;
}

.modal-btn-close {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.3);
}

.modal-btn-close:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(124, 58, 237, 0.4);
}

.modal-btn-close i {
  font-size: 0.9rem;
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

/* ===== CONFETTI ===== */
.confetti {
  position: fixed;
  width: 10px;
  height: 10px;
  top: -10px;
  border-radius: 2px;
  animation: confetti-fall 3s ease-out forwards;
  z-index: 9999;
}

@keyframes confetti-fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-item:nth-child(2)::after {
    display: none;
  }
  
  .timeline {
    flex-direction: column;
    gap: 32px;
  }
  
  .timeline::before {
    display: none;
  }
  
  .timeline-item {
    text-align: left;
    display: flex;
    gap: 20px;
    padding: 0;
  }
  
  .timeline-dot {
    margin: 0;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .terms-container {
    padding: 120px 20px 60px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .terms-grid {
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
  
  .highlight-content {
    flex-direction: column;
    text-align: center;
  }
  
  .highlight-icon {
    margin: 0 auto;
  }
  
  .highlight-features {
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
}

/* ===== SCROLLBAR ===== */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #050508;
}

::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.5);
}

/* Modal scrollbar */
.modal-container::-webkit-scrollbar {
  width: 6px;
}

.modal-container::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.2);
  border-radius: 3px;
}
</style>