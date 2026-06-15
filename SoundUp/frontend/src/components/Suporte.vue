<template>
  <div class="support-page">

    <!-- Background -->
    <div class="background-effects">
      <div class="gradient-light light-1"></div>
      <div class="gradient-light light-2"></div>
      <div class="gradient-light light-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <!-- Header -->
    <header class="support-header">
      <div class="logo-wrapper" @click="goHome"></div>
      <button class="back-btn" @click="goBack">← Voltar</button>
    </header>

    <!-- Main -->
    <main class="support-container">

      <!-- Hero -->
      <section class="hero-section">
        <span class="hero-badge">
          <i class="fa-solid fa-headset"></i>
          <span>Suporte SoundUp</span>
        </span>
        <h1 class="hero-title">Estamos aqui para <span>ajudar você</span></h1>
        <p class="hero-description">
          Nossa equipe de suporte está disponível para resolver problemas,
          responder dúvidas e garantir a melhor experiência musical possível.
        </p>
      </section>

      <!-- Support Cards -->
      <section class="support-grid">
        <div class="support-card">
          <div class="card-icon"><i class="fa-solid fa-comments"></i></div>
          <h2>Chat ao Vivo</h2>
          <p>Converse em tempo real com nossa equipe de suporte e obtenha ajuda imediata.</p>
          <button class="card-btn" @click="openChat">Abrir Chat</button>
        </div>
        <div class="support-card">
          <div class="card-icon"><i class="fa-solid fa-envelope"></i></div>
          <h2>Suporte por E-mail</h2>
          <p>Envie detalhes do seu problema e nossa equipe responderá o mais rápido possível.</p>
          <button class="card-btn" @click="sendEmail">Enviar E-mail</button>
        </div>
        <div class="support-card">
          <div class="card-icon"><i class="fa-solid fa-headphones"></i></div>
          <h2>Atendimento</h2>
          <p>Atendimento disponível 24 horas para ajudar usuários em qualquer momento.</p>
          <button class="card-btn" @click="callSupport">Entrar em Contato</button>
        </div>
      </section>

      <!-- Ticket -->
      <section class="ticket-section">
        <div class="ticket-card">
          <div class="section-title">
            <div class="title-icon"><i class="fa-solid fa-clipboard-list"></i></div>
            <div>
              <h2>Abrir Ticket</h2>
              <p>Descreva o problema para nossa equipe.</p>
            </div>
          </div>

          <form @submit.prevent="submitTicket">
            <div class="form-grid">
              <div class="input-group">
                <label>Nome</label>
                <input type="text" v-model="ticket.name" placeholder="Digite seu nome" required />
              </div>
              <div class="input-group">
                <label>E-mail</label>
                <input type="email" v-model="ticket.email" placeholder="Digite seu e-mail" required />
              </div>
            </div>
            <div class="input-group">
              <label>Categoria</label>
              <select v-model="ticket.category" required>
                <option disabled value="">Selecione uma categoria</option>
                <option>Conta</option>
                <option>Bug</option>
                <option>Playlist</option>
                <option>Privacidade</option>
                <option>Outro</option>
              </select>
            </div>
            <div class="input-group">
              <label>Descrição</label>
              <textarea rows="6" v-model="ticket.description" placeholder="Explique seu problema..." required></textarea>
            </div>
            <button class="submit-btn" type="submit">Enviar Ticket</button>

            <!-- CONTATO ESCOLHIDO -->
            <div v-if="selectedContactType" class="selected-contact">
              <i class="fa-solid fa-circle-check"></i>
              <div>
                <strong>Forma de contato selecionada</strong>
                <p>{{ selectedContactType }}: {{ selectedContactValue }}</p>
              </div>
            </div>

            <!-- ALERTA LOGIN -->
            <div v-if="!isLoggedIn" class="login-warning">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <div>
                <strong>Atenção</strong>
                <p>Sem login o ticket não será salvo no histórico do suporte.</p>
              </div>
            </div>
          </form>
        </div>
      </section>

      <!-- Status -->
      <section class="status-section">
        <div class="status-card">
          <div class="status-indicator online"></div>
          <div>
            <h3>Servidores Online</h3>
            <p>Todos os sistemas funcionando normalmente.</p>
          </div>
        </div>
        <div class="status-card">
          <div class="status-indicator purple"></div>
          <div>
            <h3>Tempo Médio</h3>
            <p>Resposta em aproximadamente 5 minutos.</p>
          </div>
        </div>
        <div class="status-card">
          <div class="status-indicator pink"></div>
          <div>
            <h3>Suporte Ativo</h3>
            <p>Equipe disponível 24h por dia.</p>
          </div>
        </div>
      </section>

      <!-- ===== MINHAS CONVERSAS (logado) ===== -->
      <section class="history-local-section">
        <div class="history-local-card">
          <div class="history-header">
            <div class="header-icon"><i class="fa fa-comments"></i></div>
            <div>
              <h2>Minhas Conversas</h2>
              <p>Suas mensagens enviadas ao suporte.</p>
            </div>
          </div>

          <!-- Não logado: aviso -->
          <div v-if="!isLoggedIn" class="empty-history">
            <i class="fa fa-lock"></i>
            <span>Faça login para ver suas conversas com o suporte.</span>
          </div>

          <!-- Logado mas vazio -->
          <div v-else-if="myMessages.length === 0" class="empty-history">
            <i class="fa fa-inbox"></i>
            <span>Você ainda não enviou nenhuma mensagem.</span>
          </div>

          <!-- Logado com mensagens -->
          <div v-else>
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
                  <button class="soften-btn" @click.stop="softenConversation(item._id)">
                    <i class="fa" :class="collapsedThreads[item._id] ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
                  </button>
                  <button class="delete-btn" @click.stop="deleteConversation(item._id)" title="Excluir conversa">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>

              <transition name="expand">
                <div v-show="!collapsedThreads[item._id]" class="thread-content">
                  <!-- TODAS as mensagens da conversa (usuário + admin) -->
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
                        <small class="msg-time"><i class="fa fa-clock-o"></i> {{ formatDate(msg.createdAt) }}</small>
                      </div>
                    </div>
                  </div>

                  <!-- Caixa de resposta do usuário -->
                  <div class="thread-reply-box">
                    <div class="reply-input-wrapper">
                      <i class="fa fa-reply reply-icon"></i>
                      <textarea
                        v-model="replyMap[item._id]"
                        rows="2"
                        placeholder="Escreva uma resposta..."
                      ></textarea>
                    </div>
                    <button
                      @click="replySupportMessage(item._id)"
                      class="reply-btn"
                      :disabled="!replyMap[item._id] || !replyMap[item._id].trim()"
                    >
                      <i class="fa fa-paper-plane"></i> Responder
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </section>

      <!-- ===== ADMIN: TODAS AS MENSAGENS ===== -->
      <section v-if="isAdmin" class="admin-section">
        <div class="ticket-card">
          <div class="section-title">
            <div class="title-icon"><i class="fa-solid fa-headset"></i></div>
            <div>
              <h2>Painel de Suporte (Admin)</h2>
              <p>Todas as mensagens de suporte para responder.</p>
            </div>
          </div>

          <div v-if="allSupportMessages.length === 0" class="empty-history">
            <i class="fa fa-inbox"></i>
            <span>Nenhuma mensagem de suporte.</span>
          </div>

          <div v-else class="messages-list">
            <div
              v-for="item in allSupportMessages"
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
                      <span class="user-name">
                        <i class="fa fa-user"></i> {{ item.usuario?.nome || 'Usuário' }}
                      </span>
                    </p>
                  </div>
                </div>
                <div class="thread-actions">
                  <span class="status-badge" :class="item.status">{{ item.status }}</span>
                  <button class="soften-btn" @click.stop="softenConversation(item._id)">
                    <i class="fa" :class="collapsedThreads[item._id] ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
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
                          {{ msg.autorTipo === 'admin' ? 'Suporte' : msg.nomeAutor || 'Usuário' }}
                        </div>
                        <p>{{ msg.mensagem }}</p>
                        <small class="msg-time">{{ formatDate(msg.createdAt) }}</small>
                      </div>
                    </div>
                  </div>

                  <div class="thread-reply-box">
                    <div class="reply-input-wrapper">
                      <i class="fa fa-reply reply-icon"></i>
                      <textarea
                        v-model="replyMap[item._id]"
                        rows="2"
                        placeholder="Escreva uma resposta como administrador..."
                      ></textarea>
                    </div>
                    <button
                      @click="adminReply(item._id, replyMap[item._id])"
                      class="reply-btn"
                      :disabled="!replyMap[item._id] || !replyMap[item._id].trim()"
                    >
                      <i class="fa fa-paper-plane"></i> Responder como Suporte
                    </button>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- MODAL EMAIL -->
    <div v-if="showEmailModal" class="contact-modal-overlay">
      <div class="contact-modal">
        <h2><i class="fa-solid fa-envelope"></i> Escolha um e-mail</h2>
        <button v-for="email in emails" :key="email" class="contact-option" @click="chooseEmail(email)">
          <i class="fa-solid fa-envelope-circle-check"></i> {{ email }}
        </button>
        <button class="close-modal-btn" @click="showEmailModal = false">Fechar</button>
      </div>
    </div>

    <!-- MODAL TELEFONE -->
    <div v-if="showPhoneModal" class="contact-modal-overlay">
      <div class="contact-modal">
        <h2><i class="fa-solid fa-phone"></i> Escolha um telefone</h2>
        <button v-for="phone in phones" :key="phone" class="contact-option" @click="choosePhone(phone)">
          <i class="fa-solid fa-phone-volume"></i> {{ phone }}
        </button>
        <button class="close-modal-btn" @click="showPhoneModal = false">Fechar</button>
      </div>
    </div>

    <!-- MODAL DE CONFIRMAÇÃO -->
    <transition name="modal-fade">
      <div v-if="confirmModal.visible" class="confirm-modal-overlay" @click.self="closeConfirmModal">
        <div class="confirm-modal">
          <div class="modal-icon"><i class="fa fa-trash"></i></div>
          <h3 class="modal-title">{{ confirmModal.title }}</h3>
          <p class="modal-message">{{ confirmModal.message }}</p>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="closeConfirmModal">
              <i class="fa fa-times"></i> Cancelar
            </button>
            <button class="modal-btn confirm" @click="handleConfirmAction">
              <i class="fa fa-trash"></i> Excluir
            </button>
          </div>
        </div>
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
      isAdmin: false,
      allSupportMessages: [],
      myMessages: [],
      replyMap: {},
      collapsedThreads: {},
      confirmModal: {
        visible: false,
        title: '',
        message: '',
        action: null,
        actionId: null
      },
      ticket: {
        name: '',
        email: '',
        category: '',
        description: ''
      },
      selectedContactType: '',
      selectedContactValue: '',
      showEmailModal: false,
      showPhoneModal: false,
      emails: ['isa@gmail.com', 'pablo@gmail.com'],
      phones: ['(31) 98888-1111', '(11) 97777-2222'],
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
    this.checkAdmin()
    if (this.isAdmin) {
      this.loadAllMessages()
    }
    if (this.isLoggedIn) {
      this.loadMyMessages()
    }
  },

  methods: {
    closeConfirmModal() {
      this.confirmModal.visible = false
      this.confirmModal.action = null
      this.confirmModal.actionId = null
    },

    handleConfirmAction() {
      if (this.confirmModal.action && this.confirmModal.actionId) {
        this.confirmModal.action(this.confirmModal.actionId)
      }
      this.closeConfirmModal()
    },

    getCategoryIcon(categoria) {
      const icons = {
        Conta: 'fa-user',
        Playlist: 'fa-music',
        Bug: 'fa-bug',
        Privacidade: 'fa-shield',
        Outro: 'fa-file-text'
      }
      return icons[categoria] || 'fa-question'
    },

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
      }
    },

    loadAuth() {
      this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    },

    checkAdmin() {
      const user = JSON.parse(localStorage.getItem('usuario') || '{}')
      this.isAdmin = user.role === 'admin'
    },

    async loadAllMessages() {
      if (!this.isAdmin) return
      try {
        this.loadingMessages = true
        const { data } = await axios.get('http://localhost:3002/suporte/todas', {
          headers: { Authorization: `Bearer ${this.getToken()}` }
        })
        this.allSupportMessages = data
      } catch (error) {
        console.error('Erro ao carregar todas as mensagens:', error)
      } finally {
        this.loadingMessages = false
      }
    },

    async adminReply(suporteId, mensagem) {
      try {
        await axios.post(
          `http://localhost:3002/suporte/${suporteId}/responder`,
          { mensagem },
          { headers: { Authorization: `Bearer ${this.getToken()}` } }
        )
        this.showAlert('success', 'Respondido!', 'Resposta enviada ao usuário.')
        await this.loadAllMessages()
      } catch (error) {
        this.showAlert('error', 'Erro', 'Erro ao responder.')
      }
    },

    getToken() {
      return localStorage.getItem('token')
    },

    goHome() {
      this.$router.push('/')
    },

    goBack() {
      this.$router.back()
    },

    openChat() {
      const el = document.querySelector('.history-local-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        if (!this.isLoggedIn) {
          this.showAlert('info', 'Login necessário', 'Faça login para ver seu histórico de conversas.')
        } else {
          this.showAlert('info', 'Chat', 'Abrindo seu histórico de conversas...')
          this.loadMyMessages()
        }
      }
    },

    sendEmail() {
      this.showEmailModal = true
    },

    chooseEmail(email) {
      this.selectedContactType = 'email'
      this.selectedContactValue = email
      this.showEmailModal = false
      this.showAlert('success', 'E-mail selecionado', `Contato selecionado: ${email}`)
    },

    callSupport() {
      this.showPhoneModal = true
    },

    choosePhone(phone) {
      const confirmCall = confirm(`Deseja realmente ligar para ${phone}?`)
      if (!confirmCall) return
      this.selectedContactType = 'telefone'
      this.selectedContactValue = phone
      this.showPhoneModal = false
      window.location.href = `tel:${phone.replace(/\\D/g, '')}`
    },

    async submitTicket() {
      if (!this.isLoggedIn) {
        this.showAlert('warning', 'Login necessário', 'Você será redirecionado para o login para enviar um ticket.')
        setTimeout(() => { this.$router.push('/login') }, 2000)
        return
      }

      if (!this.ticket.name || !this.ticket.email || !this.ticket.category || !this.ticket.description) {
        this.showAlert('warning', 'Campos obrigatórios', 'Preencha todos os campos do ticket.')
        return
      }

      try {
        this.sending = true
        const contatoSelecionado = this.selectedContactValue || this.ticket.email
        const tipoContato = this.selectedContactType || 'email'

        await axios.post(
          'http://localhost:3002/suporte/mensagens',
          {
            assunto: `Suporte - ${this.ticket.category}`,
            categoria: this.ticket.category,
            mensagem: `Nome: ${this.ticket.name}\\nEmail: ${this.ticket.email}\\n\\nContato selecionado:\\n${tipoContato}\\n\\n${contatoSelecionado}\\n\\nMensagem:\\n${this.ticket.description}`
          },
          { headers: { Authorization: `Bearer ${this.getToken()}` } }
        )

        this.ticket = { name: '', email: '', category: '', description: '' }
        this.selectedContactType = ''
        this.selectedContactValue = ''

        this.showAlert('success', 'Ticket enviado', 'Seu ticket foi enviado com sucesso.')
        await this.loadMyMessages()
      } catch (error) {
        console.error(error)
        this.showAlert('error', 'Erro', error.response?.data?.message || 'Erro ao enviar ticket.')
      } finally {
        this.sending = false
      }
    },

    async loadMyMessages() {
      try {
        this.loadingMessages = true
        const { data } = await axios.get('http://localhost:3002/suporte/minhas', {
          headers: { Authorization: `Bearer ${this.getToken()}` }
        })
        this.myMessages = data
      } catch (error) {
        console.error(error)
      } finally {
        this.loadingMessages = false
      }
    },

    async replySupportMessage(suporteId) {
      const mensagem = this.replyMap[suporteId]
      if (!mensagem?.trim()) {
        return this.showAlert('warning', 'Atenção', 'Digite uma resposta.')
      }

      try {
        await axios.post(
          `http://localhost:3002/suporte/${suporteId}/responder`,
          { mensagem },
          { headers: { Authorization: `Bearer ${this.getToken()}` } }
        )
        this.replyMap[suporteId] = ''
        await this.loadMyMessages()
        this.showAlert('success', 'Resposta enviada', 'Mensagem respondida com sucesso.')
      } catch (error) {
        this.showAlert('error', 'Erro', 'Erro ao responder mensagem.')
      }
    },

    async deleteConversation(id) {
      this.confirmModal = {
        visible: true,
        title: 'Excluir conversa',
        message: 'Deseja realmente excluir esta conversa?',
        action: this.executeDeleteConversation,
        actionId: id
      }
    },

    async executeDeleteConversation(id) {
      try {
        await axios.delete(`http://localhost:3002/suporte/${id}`, {
          headers: { Authorization: `Bearer ${this.getToken()}` }
        })
        this.myMessages = this.myMessages.filter(item => item._id !== id)
        this.showAlert('success', 'Conversa excluída', 'A conversa foi removida.')
      } catch (error) {
        this.showAlert('error', 'Erro', 'Erro ao excluir conversa.')
      }
    },

    softenConversation(id) {
      this.collapsedThreads[id] = !this.collapsedThreads[id]
    },

    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');

.support-page {
  min-height: 100vh;
  background: #050508;
  color: white;
  overflow-x: hidden;
  position: relative;
}

.background-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.gradient-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.18;
}

.light-1 { width: 420px; height: 420px; background: #2563eb; top: -120px; left: -120px; }
.light-2 { width: 340px; height: 340px; background: #7c3aed; right: -100px; top: 40%; }
.light-3 { width: 300px; height: 300px; background: #ec4899; bottom: -100px; left: 30%; }

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.support-header {
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

.support-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 80px 30px;
  position: relative;
  z-index: 1;
}

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
  line-height: 1;
  font-weight: 800;
  margin-bottom: 24px;
}

.hero-title span {
  background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  max-width: 760px;
  margin: 0 auto;
  line-height: 1.8;
  color: rgba(255,255,255,0.65);
  font-size: 1.1rem;
}

.support-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 70px;
}

.support-card, .ticket-card, .status-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 32px;
  backdrop-filter: blur(20px);
}

.support-card {
  transition: 0.3s ease;
}

.support-card:hover {
  transform: translateY(-8px);
  border-color: rgba(124,58,237,0.35);
  box-shadow: 0 20px 50px rgba(124,58,237,0.15);
}

.card-icon {
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: rgba(124,58,237,0.12);
  font-size: 1.8rem;
  margin-bottom: 24px;
}

.support-card h2 { margin-bottom: 14px; }
.support-card p {
  color: rgba(255,255,255,0.65);
  line-height: 1.7;
  margin-bottom: 24px;
}

.card-btn, .submit-btn {
  padding: 16px 22px;
  border: none;
  border-radius: 18px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s ease;
}

.card-btn:hover, .submit-btn:hover {
  transform: translateY(-3px);
}

.ticket-section { margin-bottom: 70px; }

.section-title {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 32px;
}

.title-icon {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: rgba(124,58,237,0.12);
  font-size: 1.5rem;
}

.section-title h2 { margin-bottom: 6px; }
.section-title p { color: rgba(255,255,255,0.6); }

form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-group label { color: rgba(255,255,255,0.7); }

.input-group input,
.input-group select,
.input-group textarea {
  width: 100%;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.05);
  color: white;
  outline: none;
  transition: 0.3s ease;
  resize: none;
}

.input-group input:focus,
.input-group select:focus,
.input-group textarea:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 4px rgba(124,58,237,0.15);
}

.input-group input::placeholder,
.input-group textarea::placeholder { color: rgba(255,255,255,0.35); }

select option { background: #111; }

.status-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 18px;
}

.status-indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.online { background: #22c55e; box-shadow: 0 0 15px #22c55e; }
.purple { background: #7c3aed; box-shadow: 0 0 15px #7c3aed; }
.pink { background: #ec4899; box-shadow: 0 0 15px #ec4899; }

.status-card h3 { margin-bottom: 6px; }
.status-card p { color: rgba(255,255,255,0.65); }

.contact-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
}

.contact-modal {
  width: 100%;
  max-width: 420px;
  background: #111827;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: modalIn .25s ease;
}

.contact-modal h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.contact-option {
  width: 100%;
  border: none;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  color: white;
  cursor: pointer;
  transition: .25s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
}

.contact-option:hover {
  background: rgba(124,58,237,0.25);
  transform: translateY(-2px);
}

.close-modal-btn {
  margin-top: 10px;
  border: none;
  padding: 14px;
  border-radius: 16px;
  background: #ef4444;
  color: white;
  cursor: pointer;
}

.selected-contact {
  margin-top: 20px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(34,197,94,0.12);
  border: 1px solid rgba(34,197,94,0.25);
  display: flex;
  align-items: center;
  gap: 14px;
  color: #86efac;
}

.selected-contact i { font-size: 1.4rem; }

.login-warning {
  margin-top: 22px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.25);
  display: flex;
  gap: 14px;
  color: #fcd34d;
}

.login-warning i { font-size: 1.3rem; margin-top: 2px; }

.history-local-section { margin-top: 40px; }

.history-local-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 30px;
  backdrop-filter: blur(20px);
}

.history-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
}

.empty-history {
  padding: 40px;
  text-align: center;
  color: rgba(255,255,255,0.5);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-history i { font-size: 2rem; }

.message-thread {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 0;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;
  overflow: hidden;
  margin-bottom: 16px;
}

.message-thread:hover {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
}

.message-thread.expanded {
  border-color: rgba(124, 58, 237, 0.2);
}

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
}

.thread-icon.Conta { background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.15)); color: #93c5fd; }
.thread-icon.Playlist { background: linear-gradient(135deg, rgba(236,72,153,0.15), rgba(219,39,119,0.15)); color: #f9a8d4; }
.thread-icon.Bug { background: linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.15)); color: #fcd34d; }
.thread-icon.Privacidade { background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(109,40,217,0.15)); color: #c4b5fd; }
.thread-icon.Outro { background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15)); color: #a5b4fc; }

.thread-details { min-width: 0; flex: 1; }
.thread-details h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.thread-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
}

.category-tag {
  padding: 2px 10px;
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
  font-weight: 600;
  text-transform: capitalize;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.7);
}

.thread-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.soften-btn, .delete-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.05);
  font-size: 0.9rem;
}

.soften-btn:hover, .delete-btn:hover {
  background: rgba(255,255,255,0.1);
  color: white;
  transform: translateY(-2px);
}

.soften-btn.active {
  background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(139,92,246,0.2));
  color: #c4b5fd;
}

.delete-btn:hover {
  background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1));
  color: #fca5a5;
}

.thread-content { padding: 0 20px 20px; }

.thread-messages {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
  padding-top: 8px;
}

.thread-message { animation: expand-in 0.3s ease; }

.message-bubble {
  padding: 16px 18px;
  border-radius: 16px;
  position: relative;
}

.thread-message.user .message-bubble {
  background: linear-gradient(135deg, rgba(37,99,235,0.12), rgba(29,78,216,0.08));
  border: 1px solid rgba(37,99,235,0.15);
  margin-left: 20px;
  border-bottom-left-radius: 4px;
}

.thread-message.admin .message-bubble {
  background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(109,40,217,0.08));
  border: 1px solid rgba(124,58,237,0.15);
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
  color: rgba(255,255,255,0.85);
}

.msg-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
}

.thread-reply-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.reply-input-wrapper { position: relative; }

.reply-icon {
  position: absolute;
  left: 16px;
  top: 16px;
  color: rgba(255,255,255,0.4);
  font-size: 0.9rem;
}

.thread-reply-box textarea {
  width: 100%;
  border: 2px solid rgba(255,255,255,0.06);
  outline: none;
  border-radius: 16px;
  padding: 14px 16px 14px 44px;
  background: rgba(255,255,255,0.04);
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.thread-reply-box textarea:focus {
  border-color: #7c3aed;
  background: rgba(255,255,255,0.06);
  box-shadow: 0 0 0 4px rgba(124,58,237,0.15);
}

.reply-btn {
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(124,58,237,0.3);
}

.reply-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(124,58,237,0.4);
}

.reply-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.confirm-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.confirm-modal {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
  animation: modal-pop 0.3s cubic-bezier(0.4,0,0.2,1);
}

@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.1));
  border: 1px solid rgba(239,68,68,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 1.6rem;
  color: #fca5a5;
}

.modal-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 10px;
  color: white;
}

.modal-message {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin: 0 0 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 14px;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-btn.cancel {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.08);
}

.modal-btn.cancel:hover {
  background: rgba(255,255,255,0.1);
  color: white;
  transform: translateY(-2px);
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 8px 24px rgba(239,68,68,0.3);
}

.modal-btn.confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(239,68,68,0.4);
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .confirm-modal,
.modal-fade-leave-to .confirm-modal {
  transform: scale(0.9) translateY(20px);
}

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

@keyframes expand-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(.92); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 900px) {
  .form-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .support-header { padding: 18px 20px; }
  .support-container { padding: 60px 20px; }
  .support-card, .ticket-card, .status-card { padding: 26px; }
  .status-card { flex-direction: column; text-align: center; }
}
</style>