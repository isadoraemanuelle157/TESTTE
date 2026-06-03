  <template>
    <div class="support-page">
      <!-- Hero Section com efeito de partículas sutis -->
      <section class="support-hero">
        <div class="hero-glow"></div>
        <h1>Fale Conosco</h1>
        <p>Envie sua dúvida, problema ou sugestão para nossa equipe.</p>
        <div class="hero-decoration">
          <span class="floating-icon">💬</span>
          <span class="floating-icon">🎵</span>
          <span class="floating-icon">✨</span>
        </div>
      </section>

      <!-- Grid Principal -->
      <section class="support-grid">
        <!-- Card de Contato -->
        <div class="support-card contact-card">
          <div class="card-header">
            <div class="header-icon">
              <i class="fa fa-address-book"></i>
            </div>
            <h2>Formas de contato</h2>
          </div>

          <div class="social-links">
            <a href="https://instagram.com" target="_blank" class="social-link instagram">
              <div class="link-icon">
                <i class="fa-brands fa-instagram"></i>
              </div>
              <div class="link-info">
                <span class="link-name">Instagram</span>
                <span class="link-handle">@SoundUp</span>
              </div>
              <i class="fa fa-external-link arrow-icon"></i>
            </a>

            <a href="https://facebook.com" target="_blank" class="social-link facebook">
              <div class="link-icon">
                <i class="fa-brands fa-facebook-f"></i>
              </div>
              <div class="link-info">
                <span class="link-name">Facebook</span>
                <span class="link-handle">/SoundUp</span>
              </div>
              <i class="fa fa-external-link arrow-icon"></i>
            </a>

            <a href="https://x.com" target="_blank" class="social-link twitter">
              <div class="link-icon x-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div class="link-info">
                <span class="link-name">X / Twitter</span>
                <span class="link-handle">@SoundUp</span>
              </div>
              <i class="fa fa-external-link arrow-icon"></i>
            </a>

            <a href="https://youtube.com" target="_blank" class="social-link youtube">
              <div class="link-icon">
                <i class="fa-brands fa-youtube"></i>
              </div>
              <div class="link-info">
                <span class="link-name">YouTube</span>
                <span class="link-handle">/SoundUpMusic</span>
              </div>
              <i class="fa fa-external-link arrow-icon"></i>
            </a>

            <a href="mailto:isa@gmail.com" class="social-link email">
              <div class="link-icon">
                <i class="fa fa-envelope"></i>
              </div>
              <div class="link-info">
                <span class="link-name">E-mail</span>
                <span class="link-handle">isa@gmail.com</span>
              </div>
              <i class="fa fa-external-link arrow-icon"></i>
            </a>
          </div>
        </div>

        <!-- Card de Formulário -->
        <div class="support-card form-card">
          <div class="card-header">
            <div class="header-icon">
              <i class="fa fa-paper-plane"></i>
            </div>
            <h2>Enviar mensagem</h2>
          </div>

          <div v-if="!isLoggedIn" class="login-warning">
            <div class="warning-icon">
              <i class="fa fa-exclamation-triangle"></i>
            </div>
            <div class="warning-content">
              <strong>Atenção</strong>
              <span>Sem login, a mensagem não ficará salva no histórico e não será enviada para o suporte.</span>
            </div>
          </div>

          <form class="support-form" @submit.prevent="sendSupportMessage">
            <div class="form-group">
              <label for="categoria">Categoria</label>
              <div class="select-wrapper">
                <select id="categoria" v-model="form.categoria">
                  <option value="geral">Geral</option>
                  <option value="conta">Conta</option>
                  <option value="playlist">Playlist</option>
                  <option value="bug">Bug</option>
                </select>
                <i class="fa fa-chevron-down select-arrow"></i>
              </div>
            </div>

            <div class="form-group">
              <label for="assunto">Assunto</label>
              <div class="input-wrapper">
                <i class="fa fa-pencil input-icon"></i>
                <input
                  id="assunto"
                  v-model.trim="form.assunto"
                  type="text"
                  placeholder="Digite o assunto da mensagem..."
                />
              </div>
            </div>

            <div class="form-group">
              <label for="mensagem">Mensagem</label>
              <div class="textarea-wrapper">
                <textarea
                  id="mensagem"
                  v-model.trim="form.mensagem"
                  rows="5"
                  placeholder="Descreva sua dúvida ou problema com detalhes..."
                ></textarea>
                <div class="char-count">{{ form.mensagem.length }} caracteres</div>
              </div>
            </div>

            <button type="submit" class="send-btn" :disabled="sending" :class="{ 'pulse': !isLoggedIn && !sending }">
              <i class="fa" :class="sending ? 'fa-spinner fa-spin' : (isLoggedIn ? 'fa-paper-plane' : 'fa-sign-in')"></i>
              <span>{{ isLoggedIn ? (sending ? 'Enviando...' : 'Enviar mensagem') : 'Entrar para enviar' }}</span>
            </button>
          </form>
        </div>
      </section>

      <!-- Histórico de Mensagens -->
      <section class="messages-history-card">
        <div class="history-header">
          <div class="header-title">
            <div class="header-icon">
              <i class="fa fa-comments"></i>
            </div>
            <h2>Suas mensagens</h2>
            <span v-if="isLoggedIn && myMessages.length > 0" class="message-count">
              {{ myMessages.length }}
            </span>
          </div>
          
          <button v-if="isLoggedIn" class="refresh-btn" @click="loadMyMessages" :class="{ 'spinning': loadingMessages }">
            <i class="fa fa-refresh"></i>
            <span>Atualizar</span>
          </button>
        </div>

        <div v-if="!isLoggedIn" class="history-empty">
          <div class="empty-illustration">
            <i class="fa fa-lock"></i>
          </div>
          <p>Faça login para ver o histórico das suas conversas com o suporte.</p>
          <button class="login-cta" @click="$router.push('/login')">
            <i class="fa fa-sign-in"></i>
            Fazer Login
          </button>
        </div>

        <div v-else-if="loadingMessages" class="history-empty loading-state">
          <div class="spinner-ring">
            <div></div><div></div><div></div><div></div>
          </div>
          <p>Carregando mensagens...</p>
        </div>

        <div v-else-if="myMessages.length === 0" class="history-empty">
          <div class="empty-illustration">
            <i class="fa fa-inbox"></i>
          </div>
          <p>Você ainda não enviou nenhuma mensagem para o suporte.</p>
          <span class="empty-hint">Use o formulário acima para iniciar uma conversa!</span>
        </div>

        <div v-else class="messages-list">
          <div
            v-for="item in myMessages"
            :key="item._id"
            class="message-thread"
            :class="{ 'expanded': !collapsedThreads[item._id] }"
          >
            <div class="thread-top" @click="softenConversation(item._id)">
              <div class="thread-info">
                <div class="thread-icon" :class="item.categoria">
                  <i class="fa" :class="getCategoryIcon(item.categoria)"></i>
                </div>
                <div class="thread-details">
                  <h3>{{ item.assunto }}</h3>
                  <p class="thread-meta">
                    <span class="category-tag">{{ item.categoria }}</span>
                    <span class="date">{{ formatDate(item.ultimaMensagemEm) }}</span>
                  </p>
                </div>
              </div>

              <div class="thread-actions">
                <span class="status-badge" :class="item.status">
                  <i class="fa" :class="getStatusIcon(item.status)"></i>
                  {{ item.status }}
                </span>
                
                <button
                  class="soften-btn"
                  @click.stop="softenConversation(item._id)"
                  :class="{ 'active': !collapsedThreads[item._id] }"
                >
                  <i class="fa" :class="collapsedThreads[item._id] ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
                </button>

                <button
                  class="delete-btn"
                  @click.stop="deleteConversation(item._id)"
                  title="Excluir conversa"
                >
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>

            <transition name="expand">
              <div v-show="!collapsedThreads[item._id]" class="thread-content">
                <div class="thread-messages">
                  <div
                    v-for="msg in item.mensagens"
                    :key="msg._id"
                    class="thread-message"
                    :class="msg.autorTipo"
                  >
                    <div class="message-bubble">
                      <div class="msg-label">
                        <i class="fa" :class="msg.autorTipo === 'admin' ? 'fa-headset' : 'fa-user'"></i>
                        {{ msg.autorTipo === 'admin' ? 'Suporte' : 'Você' }}
                      </div>
                      <p>{{ msg.mensagem }}</p>
                      <small class="msg-time">
                        <i class="fa fa-clock-o"></i>
                        {{ formatDate(msg.createdAt) }}
                      </small>
                    </div>
                  </div>
                </div>

                <div class="thread-reply-box">
                  <div class="reply-input-wrapper">
                    <i class="fa fa-reply reply-icon"></i>
                    <textarea
                      v-model="replyMap[item._id]"
                      rows="2"
                      placeholder="Escreva uma resposta..."
                      @keydown.enter.prevent="replySupportMessage(item._id)"
                    ></textarea>
                  </div>

                  <button 
                    @click="replySupportMessage(item._id)"
                    class="reply-btn"
                    :disabled="!replyMap[item._id] || !replyMap[item._id].trim()"
                  >
                    <i class="fa fa-paper-plane"></i>
                    Responder
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </section>

      <!-- Alerta customizado -->
      <transition name="alert-fade">
        <div v-if="alert.visible" class="custom-alert" :class="alert.type" @click="closeAlert">
          <div class="alert-icon">
            <i class="fa" :class="alertIcon"></i>
          </div>
          <div class="alert-content">
            <strong class="alert-title">{{ alert.title }}</strong>
            <span class="alert-message">{{ alert.message }}</span>
          </div>
          <button class="alert-close" @click.stop="closeAlert">
            <i class="fa fa-times"></i>
          </button>
          <div class="alert-progress" :style="{ animationDuration: alert.duration + 'ms' }"></div>
        </div>
      </transition>
    </div>
  </template>

  <script>
  import axios from 'axios'

  export default {
    name: 'SupportPage',

    data() {
      return {
        isLoggedIn: false,
        sending: false,
        loadingMessages: false,
        myMessages: [],
        replyMap: {},
        collapsedThreads: {},
        form: {
          categoria: 'geral',
          assunto: '',
          mensagem: ''
        },
        alert: {
          visible: false,
          type: 'info',
          title: '',
          message: '',
          duration: 4000,
          timer: null
        }
      }
    },

    computed: {
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
      this.loadAuth()
      if (this.isLoggedIn) {
        this.loadMyMessages()
      }
    },

    beforeUnmount() {
      if (this.alert.timer) {
        clearTimeout(this.alert.timer)
      }
    },

    methods: {
      showAlert(type, title, message, duration = 4000) {
        if (this.alert.timer) {
          clearTimeout(this.alert.timer)
        }
        
        this.alert = {
          visible: true,
          type,
          title,
          message,
          duration,
          timer: null
        }
        
        this.alert.timer = setTimeout(() => {
          this.closeAlert()
        }, duration)
      },

      closeAlert() {
        this.alert.visible = false
        if (this.alert.timer) {
          clearTimeout(this.alert.timer)
          this.alert.timer = null
        }
      },

      getCategoryIcon(categoria) {
        const icons = {
          geral: 'fa-file-text',
          conta: 'fa-user',
          pagamento: 'fa-credit-card',
          playlist: 'fa-music',
          bug: 'fa-bug'
        }
        return icons[categoria] || 'fa-question'
      },

      getStatusIcon(status) {
        const icons = {
          aberto: 'fa-envelope-open',
          respondido: 'fa-check-circle',
          fechado: 'fa-lock'
        }
        return icons[status] || 'fa-circle'
      },

      softenConversation(suporteId) {
        this.collapsedThreads[suporteId] = !this.collapsedThreads[suporteId]
      },

      async deleteConversation(suporteId) {
        const confirmar = confirm('Deseja realmente excluir esta conversa? Esta ação não pode ser desfeita.')

        if (!confirmar) return

        try {
          await axios.delete(
            `http://localhost:3002/suporte/${suporteId}`,
            {
              headers: {
                Authorization: `Bearer ${this.getToken()}`
              }
            }
          )

          this.myMessages = this.myMessages.filter(item => item._id !== suporteId)
          this.showAlert('success', 'Sucesso!', 'Conversa excluída com sucesso.')
        } catch (error) {
          this.showAlert('error', 'Erro', error.response?.data?.error || 'Erro ao excluir conversa.')
        }
      },

      loadAuth() {
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
      },

      getToken() {
        return localStorage.getItem('token')
      },

      async sendSupportMessage() {
        if (!this.isLoggedIn) {
          this.showAlert('warning', 'Atenção', 'Faça login para enviar e salvar sua mensagem no suporte.')
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
          return
        }

        if (!this.form.assunto || !this.form.mensagem) {
          this.showAlert('warning', 'Campos obrigatórios', 'Preencha o assunto e a mensagem.')
          return
        }

        try {
          this.sending = true

          await axios.post(
            'http://localhost:3002/suporte/mensagens',
            this.form,
            {
              headers: {
                Authorization: `Bearer ${this.getToken()}`
              }
            }
          )

          this.form = {
            categoria: 'geral',
            assunto: '',
            mensagem: ''
          }

          await this.loadMyMessages()
          this.showAlert('success', 'Enviado!', 'Mensagem enviada com sucesso!')
        } catch (error) {
          this.showAlert('error', 'Erro ao enviar', error.response?.data?.message || 'Erro ao enviar mensagem.')
        } finally {
          this.sending = false
        }
      },

      async loadMyMessages() {
        try {
          this.loadingMessages = true

          const { data } = await axios.get('http://localhost:3002/suporte/minhas', {
            headers: {
              Authorization: `Bearer ${this.getToken()}`
            }
          })

          this.myMessages = data
        } catch (error) {
          console.error('Erro ao carregar mensagens:', error)
          this.showAlert('error', 'Erro', 'Erro ao carregar mensagens.')
        } finally {
          this.loadingMessages = false
        }
      },

      async replySupportMessage(suporteId) {
        const mensagem = this.replyMap[suporteId]

        if (!mensagem || !mensagem.trim()) {
          return this.showAlert('warning', 'Atenção', 'Digite uma resposta.')
        }

        try {
          await axios.post(
            `http://localhost:3002/suporte/${suporteId}/responder`,
            { mensagem },
            {
              headers: {
                Authorization: `Bearer ${this.getToken()}`
              }
            }
          )

          this.replyMap[suporteId] = ''
          await this.loadMyMessages()
          this.showAlert('success', 'Respondido!', 'Resposta enviada com sucesso!')
        } catch (error) {
          this.showAlert('error', 'Erro', 'Erro ao responder mensagem.')
        }
      },

      formatDate(date) {
        if (!date) return ''
        const d = new Date(date)
        const now = new Date()
        const diff = now - d
        
        if (diff < 60000) return 'Agora mesmo'
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} dias atrás`
        
        return d.toLocaleString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
  }
  </script>

  <style scoped>
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

  /* ===== VARIÁVEIS CSS ===== */
  :root {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --secondary: #8b5cf6;
    --accent: #ec4899;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --dark: #0f172a;
    --darker: #020617;
    --card-bg: rgba(255, 255, 255, 0.03);
    --card-border: rgba(255, 255, 255, 0.06);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
  }

  /* ===== ANIMAÇÕES ===== */
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }

  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes expand-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slide-in {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes alert-slide {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes alert-progress {
    from { width: 100%; }
    to { width: 0%; }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* ===== LAYOUT BASE ===== */
  .support-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 100px 24px 60px;
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ===== HERO SECTION ===== */
  .support-hero {
    text-align: center;
    margin-bottom: 48px;
    position: relative;
    padding: 40px 0;
  }

  .hero-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
    pointer-events: none;
    animation: pulse-glow 4s ease-in-out infinite;
  }

  .support-hero h1 {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #c4b5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    z-index: 1;
  }

  .support-hero p {
    font-size: 1.2rem;
    color: var(--text-secondary);
    max-width: 500px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .hero-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .floating-icon {
    position: absolute;
    font-size: 2rem;
    opacity: 0.15;
    animation: float 6s ease-in-out infinite;
  }

  .floating-icon:nth-child(1) { top: 10%; left: 15%; animation-delay: 0s; }
  .floating-icon:nth-child(2) { top: 20%; right: 20%; animation-delay: 2s; }
  .floating-icon:nth-child(3) { bottom: 15%; left: 25%; animation-delay: 4s; }

  /* ===== GRID ===== */
  .support-grid {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 28px;
    margin-bottom: 40px;
  }

  /* ===== CARDS ===== */
  .support-card,
  .messages-history-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 24px;
    padding: 32px;
    backdrop-filter: blur(20px);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .support-card::before,
  .messages-history-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  }

  .support-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    color: white;
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
  }

  .card-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  /* ===== SOCIAL LINKS ===== */
  .social-links {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .social-link {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    border-radius: 16px;
    color: var(--text-primary);
    text-decoration: none;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .social-link::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .social-link:hover {
    transform: translateX(8px);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .social-link:hover::before {
    opacity: 1;
  }

  .link-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }

  .social-link:hover .link-icon {
    transform: scale(1.1);
  }

  .link-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 2px;
  }

  .link-name {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .link-handle {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .arrow-icon {
    font-size: 0.8rem;
    color: var(--text-muted);
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
  }

  .social-link:hover .arrow-icon {
    opacity: 1;
    transform: translateX(0);
  }

  /* Ícone do X (Twitter) */
  .x-icon {
    background: #000 !important;
  }

  .x-icon svg {
    width: 20px;
    height: 20px;
    fill: white;
  }

  /* Cores específicas das redes */
  .social-link.instagram .link-icon { background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
  .social-link.facebook .link-icon { background: linear-gradient(135deg, #1877f2, #0d65d9); }
  .social-link.twitter .link-icon { background: #000; }
  .social-link.youtube .link-icon { background: linear-gradient(135deg, #ff0000, #cc0000); }
  .social-link.email .link-icon { background: linear-gradient(135deg, #ea4335, #d33b28); }

  .social-link.instagram::before { background: linear-gradient(135deg, rgba(240, 148, 51, 0.1), rgba(188, 24, 136, 0.1)); }
  .social-link.facebook::before { background: linear-gradient(135deg, rgba(24, 119, 242, 0.1), rgba(13, 101, 217, 0.1)); }
  .social-link.twitter::before { background: linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(30, 30, 30, 0.1)); }
  .social-link.youtube::before { background: linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(204, 0, 0, 0.1)); }
  .social-link.email::before { background: linear-gradient(135deg, rgba(234, 67, 53, 0.1), rgba(211, 59, 40, 0.1)); }

  /* ===== FORMULÁRIO ===== */
  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .input-wrapper,
  .select-wrapper,
  .textarea-wrapper {
    position: relative;
  }

  .input-icon,
  .select-arrow {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 1rem;
    pointer-events: none;
    transition: color 0.3s ease;
  }

  .select-arrow {
    left: auto;
    right: 16px;
    font-size: 0.8rem;
  }

  .support-form input,
  .support-form select,
  .support-form textarea,
  .thread-reply-box textarea {
    width: 100%;
    border: 2px solid rgba(255, 255, 255, 0.06);
    outline: none;
    border-radius: 16px;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: all 0.3s ease;
    font-family: inherit;
  }

  .support-form input:focus,
  .support-form select:focus,
  .support-form textarea:focus {
    border-color: var(--primary);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }

  .support-form input::placeholder,
  .support-form textarea::placeholder {
    color: var(--text-muted);
  }

  .support-form input {
    padding-left: 44px;
  }

  .support-form select {
    padding-right: 40px;
    cursor: pointer;
    appearance: none;
  }

  .support-form select option {
    background: var(--dark);
    color: var(--text-primary);
  }

  .textarea-wrapper {
    position: relative;
  }

  .char-count {
    position: absolute;
    bottom: 12px;
    right: 16px;
    font-size: 0.75rem;
    color: var(--text-muted);
    pointer-events: none;
  }

  /* ===== BOTÃO ENVIAR ===== */
  .send-btn {
    width: 100%;
    border: none;
    border-radius: 16px;
    padding: 16px 24px;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
  }

  .send-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }

  .send-btn:hover::before {
    left: 100%;
  }

  .send-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4);
  }

  .send-btn:active {
    transform: translateY(0);
  }

  .send-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .send-btn.pulse {
    animation: pulse-border 2s ease-in-out infinite;
  }

  @keyframes pulse-border {
    0%, 100% { box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3); }
    50% { box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5), 0 0 0 4px rgba(99, 102, 241, 0.1); }
  }

  /* ===== WARNING LOGIN ===== */
  .login-warning {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(234, 179, 8, 0.04));
    border: 1px solid rgba(245, 158, 11, 0.2);
    color: #fcd34d;
    padding: 16px 18px;
    border-radius: 16px;
    margin-bottom: 24px;
    animation: slide-in 0.5s ease;
  }

  .warning-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(245, 158, 11, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.1rem;
  }

  .warning-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .warning-content strong {
    font-weight: 700;
    font-size: 0.95rem;
  }

  .warning-content span {
    font-size: 0.85rem;
    opacity: 0.9;
    line-height: 1.5;
  }

  /* ===== HISTÓRICO ===== */
  .messages-history-card {
    margin-top: 8px;
  }

  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .message-count {
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 700;
    min-width: 28px;
    text-align: center;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-secondary);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }

  .refresh-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .refresh-btn.spinning i {
    animation: spin 1s linear infinite;
  }

  /* ===== ESTADO VAZIO ===== */
  .history-empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
  }

  .empty-illustration {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 2rem;
    color: var(--primary);
    border: 1px solid rgba(99, 102, 241, 0.2);
  }

  .history-empty p {
    font-size: 1.05rem;
    margin-bottom: 8px;
    color: var(--text-primary);
  }

  .empty-hint {
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .login-cta {
    margin-top: 20px;
    padding: 12px 28px;
    border-radius: 14px;
    border: none;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
  }

  .login-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4);
  }

  /* Spinner de loading */
  .spinner-ring {
    display: inline-block;
    position: relative;
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
  }

  .spinner-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 51px;
    height: 51px;
    margin: 6px;
    border: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: var(--primary) transparent transparent transparent;
  }

  .spinner-ring div:nth-child(1) { animation-delay: -0.45s; }
  .spinner-ring div:nth-child(2) { animation-delay: -0.3s; }
  .spinner-ring div:nth-child(3) { animation-delay: -0.15s; }

  /* ===== LISTA DE MENSAGENS ===== */
  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .message-thread {
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 0;
    background: rgba(255, 255, 255, 0.02);
    transition: all 0.3s ease;
    overflow: hidden;
    animation: slide-in 0.4s ease;
  }

  .message-thread:hover {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
  }

  .message-thread.expanded {
    border-color: rgba(99, 102, 241, 0.2);
    background: rgba(255, 255, 255, 0.03);
  }

  /* ===== THREAD TOP ===== */
  .thread-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    cursor: pointer;
    transition: background 0.3s ease;
    user-select: none;
  }

  .thread-top:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .thread-info {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    min-width: 0;
  }

  .thread-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  .thread-icon.geral { background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15)); color: #a5b4fc; }
  .thread-icon.conta { background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15)); color: #93c5fd; }
  .thread-icon.pagamento { background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15)); color: #6ee7b7; }
  .thread-icon.playlist { background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.15)); color: #f9a8d4; }
  .thread-icon.bug { background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15)); color: #fcd34d; }

  .thread-details {
    min-width: 0;
    flex: 1;
  }

  .thread-details h3 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .thread-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .category-tag {
    padding: 2px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    font-weight: 600;
    text-transform: capitalize;
    font-size: 0.75rem;
  }

  .thread-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ===== BADGES E BOTÕES ===== */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: capitalize;
  }

  .status-badge.aberto {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1));
    color: #93c5fd;
    border: 1px solid rgba(59, 130, 246, 0.2);
  }

  .status-badge.respondido {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1));
    color: #6ee7b7;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .status-badge.fechado {
    background: linear-gradient(135deg, rgba(100, 116, 139, 0.15), rgba(71, 85, 105, 0.1));
    color: #94a3b8;
    border: 1px solid rgba(100, 116, 139, 0.2);
  }

  .soften-btn,
  .delete-btn {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
  }

  .soften-btn:hover,
  .delete-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    transform: translateY(-2px);
  }

  .soften-btn.active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
    color: var(--primary);
  }

  .delete-btn:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1));
    color: #fca5a5;
  }

  /* ===== CONTEÚDO EXPANDIDO ===== */
  .thread-content {
    padding: 0 20px 20px;
  }

  .thread-messages {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 20px;
    padding-top: 8px;
  }

  .thread-message {
    animation: expand-in 0.3s ease;
  }

  .message-bubble {
    padding: 16px 18px;
    border-radius: 16px;
    position: relative;
  }

  .thread-message.user .message-bubble {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(29, 78, 216, 0.08));
    border: 1px solid rgba(37, 99, 235, 0.15);
    margin-left: 20px;
    border-bottom-left-radius: 4px;
  }

  .thread-message.admin .message-bubble {
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(109, 40, 217, 0.08));
    border: 1px solid rgba(124, 58, 237, 0.15);
    margin-right: 20px;
    border-bottom-right-radius: 4px;
  }

  .msg-label {
    font-size: 0.8rem;
    font-weight: 700;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .thread-message.user .msg-label { color: #93c5fd; }
  .thread-message.admin .msg-label { color: #c4b5fd; }

  .message-bubble p {
    margin: 0 0 10px;
    line-height: 1.7;
    font-size: 0.95rem;
  }

  .msg-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  /* ===== CAIXA DE RESPOSTA ===== */
  .thread-reply-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .reply-input-wrapper {
    position: relative;
  }

  .reply-icon {
    position: absolute;
    left: 16px;
    top: 16px;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .thread-reply-box textarea {
    padding-left: 44px;
    resize: vertical;
    min-height: 80px;
  }

  .reply-btn {
    align-self: flex-end;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
  }

  .reply-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  }

  .reply-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* ===== ALERTA CUSTOMIZADO ===== */
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

  .custom-alert.warning {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.08));
    border-color: rgba(245, 158, 11, 0.25);
  }

  .custom-alert.info {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.08));
    border-color: rgba(59, 130, 246, 0.25);
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
  .custom-alert.warning .alert-icon { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
  .custom-alert.info .alert-icon { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }

  .alert-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .alert-title {
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-primary);
  }

  .alert-message {
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .alert-close {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .alert-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .alert-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.3);
    animation: alert-progress linear forwards;
  }

  .custom-alert.success .alert-progress { background: rgba(16, 185, 129, 0.5); }
  .custom-alert.error .alert-progress { background: rgba(239, 68, 68, 0.5); }
  .custom-alert.warning .alert-progress { background: rgba(245, 158, 11, 0.5); }
  .custom-alert.info .alert-progress { background: rgba(59, 130, 246, 0.5); }

  /* Transição do alerta */
  .alert-fade-enter-active,
  .alert-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .alert-fade-enter-from,
  .alert-fade-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }

  /* ===== TRANSITIONS ===== */
  .expand-enter-active,
  .expand-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .expand-enter-from,
  .expand-leave-to {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  /* ===== RESPONSIVO ===== */
  @media (max-width: 900px) {
    .support-grid {
      grid-template-columns: 1fr;
    }
    
    .support-hero h1 {
      font-size: 2.5rem;
    }
    
    .thread-top {
      flex-wrap: wrap;
    }
    
    .thread-actions {
      width: 100%;
      justify-content: flex-end;
      margin-top: 8px;
    }
    
    .custom-alert {
      left: 16px;
      right: 16px;
      max-width: none;
      top: 16px;
    }
  }

  @media (max-width: 600px) {
    .support-page {
      padding: 80px 16px 40px;
    }
    
    .support-card,
    .messages-history-card {
      padding: 20px;
    }
    
    .support-hero h1 {
      font-size: 2rem;
    }
    
    .thread-info {
      flex-wrap: wrap;
    }
    
    .thread-details h3 {
      white-space: normal;
    }
  }

  /* ===== SCROLLBAR CUSTOMIZADA ===== */
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