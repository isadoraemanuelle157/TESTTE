<template>
  <div class="help-page">
    <!-- Background -->
    <div class="background-effects">
      <div class="blur-circle circle-1"></div>
      <div class="blur-circle circle-2"></div>
      <div class="blur-circle circle-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- Header -->
    <header class="help-header">
      <div class="logo-wrapper" @click="goHome">

      </div>

<button class="back-btn" @click="goBack">
  <i class="fa-solid fa-arrow-left"></i>
  Voltar
</button>
    </header>

    <!-- Main -->
    <main class="help-container">
      <!-- Hero -->
      <section class="hero-section">
 <span class="hero-badge">
  <i class="fa-solid fa-circle-question"></i>
  Central de Ajuda
</span>

        <h1 class="hero-title">
          Como podemos
          <span>ajudar?</span>
        </h1>

        <p class="hero-description">
          Encontre respostas rápidas, resolva problemas,
          descubra funcionalidades e aproveite ao máximo sua experiência musical no SoundUp.
        </p>

        <!-- Search -->
        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            type="text"
            placeholder="Busque por playlist, senha, perfil, segurança, notificações..."
            v-model.trim="search"
          />

          <button
            v-if="search"
            class="clear-search"
            @click="search = ''"
          >
            Limpar
          </button>
        </div>

        <p v-if="search" class="search-feedback">
          Resultados para <strong>"{{ search }}"</strong>:
          <span>{{ filteredTopics.length }} tópicos</span> e
          <span>{{ filteredFaqs.length }} perguntas</span>
        </p>
      </section>

      <!-- Categories -->
      <section v-if="filteredTopics.length" class="categories-grid">
        <div
          class="help-card"
          v-for="topic in filteredTopics"
          :key="topic.id"
        >
          <div class="card-icon">
  <i :class="topic.icon"></i>
</div>

          <h2>{{ topic.title }}</h2>

          <p>{{ topic.description }}</p>

          <button @click="openTopic(topic.id)" class="card-btn">
            Ver mais
          </button>
        </div>
      </section>

      <!-- Empty state -->
      <section v-if="search && !hasResults" class="empty-state">
        <div class="empty-icon">
  <i class="fa-solid fa-magnifying-glass"></i>
</div>
        <h3>Nenhum resultado encontrado</h3>
        <p>
          Tente pesquisar com outros termos, como
          <strong>playlist</strong>, <strong>senha</strong>,
          <strong>perfil</strong>, <strong>segurança</strong> ou <strong>notificações</strong>.
        </p>
        <button class="support-btn secondary" @click="navigateToSupport">
          Ir para o suporte
        </button>
      </section>

      <!-- FAQ -->
      <section class="faq-section">
        <div class="section-header">
          <h2>Perguntas Frequentes</h2>
          <p>Respostas rápidas para as dúvidas mais comuns.</p>
        </div>

        <div v-if="filteredFaqs.length" class="faq-list">
          <div
            class="faq-item"
            v-for="faq in filteredFaqs"
            :key="faq.id"
            :class="{ active: openFaq === faq.id }"
          >
            <button
              class="faq-question"
              @click="toggleFaq(faq.id)"
            >
              <span>{{ faq.question }}</span>

<span class="faq-icon">
  <i
    :class="
      openFaq === faq.id
        ? 'fa-solid fa-minus'
        : 'fa-solid fa-plus'
    "
  ></i>
</span>
            </button>

            <transition name="faq">
              <div
                v-if="openFaq === faq.id"
                class="faq-answer"
              >
                {{ faq.answer }}
              </div>
            </transition>
          </div>
        </div>

        <div v-else class="empty-faq">
          Nenhuma pergunta encontrada para essa busca.
        </div>
      </section>

      <!-- Support Box -->
      <section class="support-box">
        <div class="support-icon">
  <i class="fa-solid fa-headset"></i>
</div>

        <div class="support-content">
          <h3>Não encontrou o que procura?</h3>
          <p>
            Nossa equipe está pronta para ajudar você a qualquer momento.
          </p>
        </div>

        <button class="support-btn" @click.prevent="navigateToSupport">
          Contatar suporte
        </button>
      </section>
    </main>

    <!-- Modal -->
    <transition name="modal">
      <div
        v-if="selectedTopic"
        class="modal-overlay"
        @click.self="closeTopic"
      >
        <div class="topic-modal">
          <button class="modal-close" @click="closeTopic">
            ×
          </button>

          <div class="modal-header">
           <div class="modal-icon">
  <i :class="selectedTopic.icon"></i>
</div>

            <div>
              <span class="modal-badge">Ajuda detalhada</span>
              <h3>{{ selectedTopic.title }}</h3>
              <p>{{ selectedTopic.modalDescription }}</p>
            </div>
          </div>

          <div class="modal-body">
            <div class="modal-section">
              <h4>O que você pode fazer</h4>
              <ul>
                <li
                  v-for="(item, index) in selectedTopic.items"
                  :key="index"
                >
                  {{ item }}
                </li>
              </ul>
            </div>

            <div class="modal-section tip-box">
              <h4>Dica rápida</h4>
              <p>{{ selectedTopic.tip }}</p>
            </div>
          </div>

          <div class="modal-actions">
            <button class="secondary-btn" @click="closeTopic">
              Fechar
            </button>

            <button class="primary-btn" @click="navigateToSupport">
              Ir para o suporte
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'HelpPage',

  data() {
    return {
      search: '',
      openFaq: null,
      selectedTopic: null,

      topics: [
        {
          id: 'playlist',
             icon: 'fa-solid fa-music',
          title: 'Músicas e Playlists',
          description: 'Aprenda a criar, organizar e editar playlists com facilidade.',
          modalDescription: 'Aqui você encontra ajuda para montar playlists, adicionar faixas, reorganizar músicas e compartilhar suas coleções favoritas.',
          items: [
            'Criar uma nova playlist em poucos passos',
            'Adicionar ou remover músicas',
            'Deixar uma playlist pública ou privada'
          ],
          tip: 'Se você ouve por estilo ou momento do dia, crie playlists separadas como “Treino”, “Relaxar” e “Favoritas”.',
          keywords: ['playlist', 'música', 'musicas', 'faixa', 'curtir', 'favoritos', 'compartilhar']
        },
        {
          id: 'profile',
           icon: 'fa-solid fa-user',
          title: 'Conta e Perfil',
          description: 'Edite seu perfil, altere senha, atualize dados e personalize sua conta.',
          modalDescription: 'Tudo o que você precisa para gerenciar sua conta, atualizar informações pessoais e manter seu perfil sempre em dia.',
          items: [
            'Alterar nome, foto e bio do perfil',
            'Atualizar e-mail e senha',
            'Gerenciar informações da conta',
            'Editar preferências de uso',
            'Recuperar acesso à conta'
          ],
          tip: 'Mantenha seu e-mail atualizado para facilitar a recuperação da conta e o recebimento de avisos importantes.',
          keywords: ['perfil', 'conta', 'senha', 'email', 'e-mail', 'foto', 'bio', 'usuário']
        },
        {
          id: 'security',
          icon: 'fa-solid fa-shield-halved',
          title: 'Privacidade e Segurança',
          description: 'Proteja sua conta e controle suas permissões com mais segurança.',
          modalDescription: 'Entenda como reforçar a segurança da sua conta, proteger seus dados e configurar permissões com tranquilidade.',
          items: [
            'Trocar a senha regularmente',
            'Revisar sessões ativas',
            'Controlar permissões da conta',
            'Proteger dados pessoais'
          ],
          tip: 'Use uma senha forte com letras, números e caracteres especiais para aumentar a proteção da conta.',
          keywords: ['segurança', 'privacidade', 'permissões', 'proteger', 'dados', 'acesso', 'login']
        },
        {
          id: 'community',
           icon: 'fa-solid fa-comments',
          title: 'Comunidade',
          description: 'Interaja com amigos, compartilhe músicas e participe do universo SoundUp.',
          modalDescription: 'Descubra como seguir pessoas, compartilhar conteúdos e participar da comunidade musical dentro da plataforma.',
          items: [
            'Compartilhar músicas com amigos',
            'Interagir com playlists públicas',
            'Acompanhar perfis e novidades',
            'Participar mais da comunidade',
            'Descobrir conteúdos recomendados'
          ],
          tip: 'Compartilhar músicas e playlists ajuda a aumentar sua interação com outros usuários da plataforma.',
          keywords: ['comunidade', 'amigos', 'compartilhar', 'seguir', 'interagir', 'social']
        }
      ],

      faqs: [
        {
          id: 1,
          question: 'Como criar uma playlist no SoundUp?',
          answer: 'Acesse a área de playlists, clique em "Criar playlist", escolha um nome, adicione uma capa se quiser e salve. Depois disso, você já pode incluir músicas manualmente.',
          keywords: ['playlist', 'criar playlist', 'músicas', 'faixas']
        },
        {
          id: 2,
          question: 'Como recuperar minha senha?',
          answer: 'Na tela de login, clique em "Esqueci minha senha", informe seu e-mail cadastrado e siga as instruções enviadas para redefinir o acesso à sua conta.',
          keywords: ['senha', 'recuperar senha', 'login', 'email', 'e-mail']
        },
        {
          id: 3,
          question: 'Como editar meu perfil?',
          answer: 'Entre na área de perfil, clique em "Editar perfil" e altere nome, foto, bio ou outras informações disponíveis. No final, clique em salvar.',
          keywords: ['perfil', 'editar', 'foto', 'bio', 'conta']
        },
        {
          id: 4,
          question: 'Como ativar ou desativar notificações?',
          answer: 'Abra Configurações > Notificações e escolha quais alertas deseja receber, como novidades, lançamentos, seguidores ou atualizações da conta.',
          keywords: ['notificações', 'avisos', 'configurações']
        },
        {
          id: 5,
          question: 'Como excluir minha conta?',
          answer: 'Vá em Configurações > Conta > Excluir conta. Antes de confirmar, revise as informações importantes, pois essa ação pode ser irreversível.',
          keywords: ['excluir conta', 'remover conta', 'deletar conta']
        },
        {
          id: 6,
          question: 'Como deixar minha conta mais segura?',
          answer: 'Troque sua senha periodicamente, evite compartilhá-la com outras pessoas e revise acessos suspeitos sempre que notar algo incomum na conta.',
          keywords: ['segurança', 'privacidade', 'senha forte', 'acesso suspeito']
        }
      ]
    }
  },

  computed: {
    filteredTopics() {
      return this.topics.filter(topic => this.matchesSearch(topic))
    },

    filteredFaqs() {
      return this.faqs.filter(faq => this.matchesSearch(faq))
    },

    hasResults() {
      return this.filteredTopics.length > 0 || this.filteredFaqs.length > 0
    }
  },

  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
    document.body.style.overflow = ''
  },

  methods: {
    normalizeText(value = '') {
      return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    },

    matchesSearch(item) {
      if (!this.search) return true

      const searchableText = [
        item.title,
        item.description,
        item.modalDescription,
        item.question,
        item.answer,
        ...(item.items || []),
        ...(item.keywords || [])
      ]
        .filter(Boolean)
        .join(' ')

      return this.normalizeText(searchableText).includes(
        this.normalizeText(this.search)
      )
    },

    goHome() {
      this.$router.push('/')
    },

    goBack() {
      this.$router.back()
    },

    getScrollElement() {
      return (
        document.querySelector('.content') ||
        document.querySelector('.page-content') ||
        document.querySelector('main') ||
        document.scrollingElement ||
        document.documentElement
      )
    },

    async navigateToSupport() {
      this.closeTopic()

      await this.$router.push('/suporte')

      this.$nextTick(() => {
        setTimeout(() => {
          const content = this.getScrollElement()

          if (content && typeof content.scrollTo === 'function') {
            content.scrollTo({
              top: 0,
              behavior: 'smooth'
            })
          }

          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })

          if (document.documentElement && document.documentElement.scrollTo) {
            document.documentElement.scrollTo({
              top: 0,
              behavior: 'smooth'
            })
          }

          if (document.body && document.body.scrollTo) {
            document.body.scrollTo({
              top: 0,
              behavior: 'smooth'
            })
          }
        }, 80)
      })
    },

    openTopic(topicId) {
      const topic = this.topics.find(item => item.id === topicId)
      if (!topic) return

      this.selectedTopic = topic
      document.body.style.overflow = 'hidden'
    },

    closeTopic() {
      this.selectedTopic = null
      document.body.style.overflow = ''
    },

    toggleFaq(id) {
      this.openFaq = this.openFaq === id ? null : id
    },

    handleKeydown(event) {
      if (event.key === 'Escape' && this.selectedTopic) {
        this.closeTopic()
      }
    }
  }
}
</script>

<style scoped>
/* ===== PAGE ===== */
.help-page {
  min-height: 100vh;
  background: #050508;
  color: white;
  overflow-x: hidden;
  position: relative;
}

/* ===== BACKGROUND ===== */
.background-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.blur-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.18;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: #2563eb;
  top: -120px;
  left: -120px;
}

.circle-2 {
  width: 320px;
  height: 320px;
  background: #7c3aed;
  top: 40%;
  right: -100px;
}

.circle-3 {
  width: 260px;
  height: 260px;
  background: #ec4899;
  bottom: -80px;
  left: 30%;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ===== HEADER ===== */
.help-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 40px;
  background: rgba(5,5,8,0.75);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899);
  font-size: 1.2rem;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ===== BUTTON ===== */
.back-btn {
  padding: 12px 18px;
  border: none;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  color: white;
  cursor: pointer;
  transition: 0.3s ease;
}

.back-btn:hover {
  background: rgba(255,255,255,0.12);
}

/* ===== CONTAINER ===== */
.help-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 30px;
  position: relative;
  z-index: 1;
}

/* ===== HERO ===== */
.hero-section {
  text-align: center;
  margin-bottom: 70px;
}

.hero-badge {
  display: inline-flex;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(124,58,237,0.15);
  border: 1px solid rgba(124,58,237,0.25);
  color: #c4b5fd;
  margin-bottom: 24px;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 800;
  line-height: 1;
  margin-bottom: 24px;
}

.hero-title span {
  background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  max-width: 760px;
  margin: 0 auto 40px;
  color: rgba(255,255,255,0.65);
  line-height: 1.8;
  font-size: 1.1rem;
}

/* ===== SEARCH ===== */
.search-box {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  border-radius: 20px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
}

.search-box svg {
  width: 22px;
  height: 22px;
  color: rgba(255,255,255,0.45);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 1rem;
}

.search-box input::placeholder {
  color: rgba(255,255,255,0.35);
}

.clear-search {
  border: none;
  background: rgba(255,255,255,0.08);
  color: white;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.3s ease;
}

.clear-search:hover {
  background: rgba(255,255,255,0.14);
}

.search-feedback {
  margin-top: 16px;
  color: rgba(255,255,255,0.72);
}

.search-feedback strong {
  color: white;
}

/* ===== GRID ===== */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 80px;
}

/* ===== CARD ===== */
.help-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 32px;
  backdrop-filter: blur(20px);
  transition: 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.help-card:hover {
  transform: translateY(-8px);
  border-color: rgba(124,58,237,0.35);
  box-shadow: 0 20px 50px rgba(124,58,237,0.15);
}

.card-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: rgba(124,58,237,0.12);
  font-size: 1.6rem;
  margin-bottom: 24px;
}

.help-card h2 {
  margin-bottom: 14px;
  font-size: 1.25rem;
}

.help-card p {
  color: rgba(255,255,255,0.65);
  line-height: 1.7;
  margin-bottom: 24px;
}

.card-btn {
  padding: 14px 20px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  cursor: pointer;
  transition: 0.3s ease;
  margin-top: auto;
}

.card-btn:hover {
  transform: translateY(-3px);
}

/* ===== EMPTY ===== */
.empty-state,
.empty-faq {
  text-align: center;
  padding: 40px 24px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  border-radius: 24px;
  margin-bottom: 80px;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.empty-state h3 {
  margin-bottom: 10px;
}

.empty-state p,
.empty-faq {
  color: rgba(255,255,255,0.68);
  line-height: 1.7;
}

/* ===== FAQ ===== */
.faq-section {
  margin-bottom: 80px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2rem;
  margin-bottom: 12px;
}

.section-header p {
  color: rgba(255,255,255,0.6);
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.faq-item {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  overflow: hidden;
  transition: 0.3s ease;
}

.faq-item.active {
  border-color: rgba(124,58,237,0.4);
  box-shadow: 0 10px 30px rgba(124,58,237,0.1);
}

.faq-question {
  width: 100%;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.faq-question:hover {
  background: rgba(255,255,255,0.02);
}

.faq-icon {
  font-size: 1.5rem;
  color: #c4b5fd;
  flex-shrink: 0;
}

.faq-answer {
  padding: 0 24px 24px;
  color: rgba(255,255,255,0.65);
  line-height: 1.7;
}

/* ===== FAQ ANIMATION ===== */
.faq-enter-active,
.faq-leave-active {
  transition: all 0.3s ease;
}

.faq-enter-from,
.faq-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===== SUPPORT ===== */
.support-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 36px;
  border-radius: 30px;
  background:
    linear-gradient(
      135deg,
      rgba(37,99,235,0.15),
      rgba(124,58,237,0.15),
      rgba(236,72,153,0.15)
    );
  border: 1px solid rgba(255,255,255,0.08);
}

.support-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  background: rgba(255,255,255,0.08);
  font-size: 2rem;
}

.support-content {
  flex: 1;
}

.support-content h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.support-content p {
  color: rgba(255,255,255,0.65);
}

.support-btn {
  padding: 16px 26px;
  border: none;
  border-radius: 18px;
  background: white;
  color: #111;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s ease;
}

.support-btn:hover {
  transform: translateY(-3px);
}

.support-btn.secondary {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(5, 5, 8, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.topic-modal {
  margin-top:70px;
  position: relative;
  width: 100%;
  max-width: 760px;
  border-radius: 28px;
  padding: 28px;
  background: linear-gradient(
    180deg,
    rgba(22, 22, 30, 0.96),
    rgba(12, 12, 18, 0.98)
  );
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow:
    0 30px 100px rgba(0,0,0,0.45),
    0 0 0 1px rgba(124,58,237,0.12);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 14px;
  background: rgba(255,255,255,0.07);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-close:hover {
  background: rgba(255,255,255,0.12);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding-right: 46px;
  margin-bottom: 24px;
}

.modal-icon {
  width: 68px;
  height: 68px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.28));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.modal-badge {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(124,58,237,0.16);
  border: 1px solid rgba(124,58,237,0.28);
  color: #d8b4fe;
  font-size: 0.9rem;
  margin-bottom: 14px;
}

.modal-header h3 {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.modal-header p {
  color: rgba(255,255,255,0.7);
  line-height: 1.7;
}

.modal-body {
  display: grid;
  gap: 18px;
}

.modal-section {
  padding: 22px;
  border-radius: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}

.modal-section h4 {
  margin-bottom: 14px;
  font-size: 1.05rem;
}

.modal-section ul {
  margin: 0;
  padding-left: 18px;
}

.modal-section li {
  color: rgba(255,255,255,0.75);
  line-height: 1.8;
  margin-bottom: 6px;
}

.tip-box p {
  color: rgba(255,255,255,0.72);
  line-height: 1.7;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  margin-top: 24px;
}

.secondary-btn,
.primary-btn {
  padding: 14px 20px;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s ease;
}

.secondary-btn {
  background: rgba(255,255,255,0.08);
  color: white;
}

.primary-btn {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
}

.secondary-btn:hover,
.primary-btn:hover {
  transform: translateY(-2px);
}

/* ===== MODAL ANIMATION ===== */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .topic-modal,
.modal-leave-to .topic-modal {
  transform: translateY(16px) scale(0.98);
  opacity: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .support-box {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .help-header {
    padding: 18px 20px;
  }

  .help-container {
    padding: 60px 20px;
  }

  .help-card {
    padding: 26px;
  }

  .faq-question {
    padding: 20px;
  }

  .faq-answer {
    padding: 0 20px 20px;
  }

  .support-box {
    padding: 28px;
  }

  .support-btn {
    width: 100%;
  }

  .search-box {
    flex-wrap: wrap;
  }

  .clear-search {
    width: 100%;
  }

  .modal-header {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }

  .secondary-btn,
  .primary-btn {
    width: 100%;
  }
}
</style>
