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

      <div class="logo-wrapper" @click="goHome">

      </div>

      <button class="back-btn" @click="goBack">
        ← Voltar
      </button>

    </header>

    <!-- Main -->
    <main class="support-container">

      <!-- Hero -->
      <section class="hero-section">

<span class="hero-badge">
  <i class="fa-solid fa-headset"></i>
  <span>Suporte SoundUp</span>
</span>

        <h1 class="hero-title">
          Estamos aqui para
          <span>ajudar você</span>
        </h1>

        <p class="hero-description">
          Nossa equipe de suporte está disponível para resolver problemas,
          responder dúvidas e garantir a melhor experiência musical possível.
        </p>

      </section>

      <!-- Support Cards -->
      <section class="support-grid">

        <div class="support-card">

   <div class="card-icon">
  <i class="fa-solid fa-comments"></i>
</div>

          <h2>Chat ao Vivo</h2>

          <p>
            Converse em tempo real com nossa equipe de suporte
            e obtenha ajuda imediata.
          </p>

          <button class="card-btn" @click="openChat">
            Abrir Chat
          </button>

        </div>

        <div class="support-card">

   <div class="card-icon">
  <i class="fa-solid fa-envelope"></i>
</div>

          <h2>Suporte por E-mail</h2>

          <p>
            Envie detalhes do seu problema e nossa equipe responderá
            o mais rápido possível.
          </p>

          <button class="card-btn" @click="sendEmail">
            Enviar E-mail
          </button>

        </div>

        <div class="support-card">

          <div class="card-icon">
  <i class="fa-solid fa-headphones"></i>
</div>

          <h2>Atendimento</h2>

          <p>
            Atendimento disponível 24 horas para ajudar usuários
            em qualquer momento.
          </p>

          <button class="card-btn" @click="callSupport">
            Entrar em Contato
          </button>

        </div>

      </section>

      <!-- Ticket -->
      <section class="ticket-section">

        <div class="ticket-card">

          <div class="section-title">

<div class="title-icon">
  <i class="fa-solid fa-clipboard-list"></i>
</div>

            <div>
              <h2>Abrir Ticket</h2>
              <p>Descreva o problema para nossa equipe.</p>
            </div>

          </div>

          <form @submit.prevent="submitTicket">

            <div class="form-grid">

              <div class="input-group">
                <label>Nome</label>

                <input
                  type="text"
                  v-model="ticket.name"
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div class="input-group">
                <label>E-mail</label>

                <input
                  type="email"
                  v-model="ticket.email"
                  placeholder="Digite seu e-mail"
                  required
                />
              </div>

            </div>

            <div class="input-group">
              <label>Categoria</label>

              <select v-model="ticket.category" required>
                <option disabled value="">
                  Selecione uma categoria
                </option>

                <option>Conta</option>
                <option>Pagamento</option>
                <option>Bug</option>
                <option>Playlist</option>
                <option>Privacidade</option>
                <option>Outro</option>
              </select>
            </div>

            <div class="input-group">
              <label>Descrição</label>

              <textarea
                rows="6"
                v-model="ticket.description"
                placeholder="Explique seu problema..."
                required
              ></textarea>
            </div>

            <button class="submit-btn" type="submit">
              Enviar Ticket
            </button>

<!-- CONTATO ESCOLHIDO -->
<div
  v-if="selectedContactType"
  class="selected-contact"
>
  <i class="fa-solid fa-circle-check"></i>

  <div>
    <strong>Forma de contato selecionada</strong>

    <p>
      {{ selectedContactType }}:
      {{ selectedContactValue }}
    </p>
  </div>
</div>

<!-- ALERTA LOGIN -->
<div
  v-if="!isLoggedIn"
  class="login-warning"
>
  <i class="fa-solid fa-triangle-exclamation"></i>

  <div>
    <strong>Atenção</strong>

    <p>
      Sem login o ticket não será salvo
      no histórico do suporte.
    </p>
  </div>
</div>

          </form>
<!-- HISTÓRICO LOCAL -->
<section class="history-local-section">

  <div class="history-local-card">

    <div class="history-header">

      <div class="header-icon">
        <i class="fa fa-clock-rotate-left"></i>
      </div>

      <div>
        <h2>Histórico enviado</h2>
        <p>Mensagens enviadas recentemente.</p>
      </div>

    </div>

    <div
      v-if="supportHistory.length === 0"
      class="empty-history"
    >
      <i class="fa fa-inbox"></i>
      <span>Nenhuma mensagem enviada.</span>
    </div>

    <div
      v-for="item in supportHistory"
      :key="item.id"
      class="history-item"
       :class="{ 'collapsed': collapsedLocal[item.id] }"
    >

      <div class="history-top">

        <span class="history-category">
          {{ item.categoria }}
        </span>

        <button 
      class="minimize-btn"
      @click="toggleLocalHistory(item.id)"
      :title="collapsedLocal[item.id] ? 'Expandir' : 'Minimizar'"
    >
      <i class="fa" :class="collapsedLocal[item.id] ? 'fa-chevron-down' : 'fa-chevron-up'"></i>
    </button>

        <span class="history-date">
          {{ formatDate(item.data) }}
        </span>
      </div>

        <div v-show="!collapsedLocal[item.id]" class="history-content">
    <div class="history-user" v-if="item.nome">
      <i class="fa fa-user"></i>
      <strong>{{ item.nome }}</strong>
    </div>
    <h3>{{ item.assunto }}</h3>
    <p>{{ item.mensagem }}</p>
    <div class="history-contact">
      <i class="fa fa-envelope"></i>
      {{ item.contato }}
    </div>
  </div>
</div>
</div>

</section>
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

    </main>
<!-- ========================= -->
<!-- MODAL EMAIL -->
<!-- ========================= -->
<div
  v-if="showEmailModal"
  class="contact-modal-overlay"
>

  <div class="contact-modal">

    <h2>
      <i class="fa-solid fa-envelope"></i>
      Escolha um e-mail
    </h2>

    <button
      v-for="email in emails"
      :key="email"
      class="contact-option"
      @click="chooseEmail(email)"
    >
      <i class="fa-solid fa-envelope-circle-check"></i>
      {{ email }}
    </button>

    <button
      class="close-modal-btn"
      @click="showEmailModal = false"
    >
      Fechar
    </button>

  </div>

</div>

<!-- ========================= -->
<!-- MODAL TELEFONE -->
<!-- ========================= -->
<div
  v-if="showPhoneModal"
  class="contact-modal-overlay"
>

  <div class="contact-modal">

    <h2>
      <i class="fa-solid fa-phone"></i>
      Escolha um telefone
    </h2>

    <button
      v-for="phone in phones"
      :key="phone"
      class="contact-option"
      @click="choosePhone(phone)"
    >
      <i class="fa-solid fa-phone-volume"></i>
      {{ phone }}
    </button>

    <button
      class="close-modal-btn"
      @click="showPhoneModal = false"
    >
      Fechar
    </button>

  </div>

</div>
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
      supportHistory: [],
      replyMap: {},
      collapsedLocal: {},
      collapsedThreads: {},

      // =========================
      // TICKET
      // =========================
      ticket: {
        name: '',
        email: '',
        category: '',
        description: ''
      },

      // =========================
      // CONTATO ESCOLHIDO
      // =========================
      selectedContactType: '',
      selectedContactValue: '',

      // =========================
      // MODAIS
      // =========================
      showEmailModal: false,
      showPhoneModal: false,

      // =========================
      // DADOS
      // =========================
      emails: [
        'isa@gmail.com',
        'pablo@gmail.com'
      ],

      phones: [
        '(31) 98888-1111',
        '(11) 97777-2222'
      ],

      // =========================
      // ALERT
      // =========================
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
    this.supportHistory = JSON.parse(
  localStorage.getItem('supportHistory') || '[]'
)

    if (this.isLoggedIn) {
      this.loadMyMessages()
    }
  },

  methods: {
toggleLocalHistory(id) {
  // Cria uma cópia reativa do objeto para garantir que o Vue detecte a mudança
  this.collapsedLocal = {
    ...this.collapsedLocal,
    [id]: !this.collapsedLocal[id]
  }
},

    // =========================
    // ALERT
    // =========================
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

    // =========================
    // AUTH
    // =========================
    loadAuth() {
      this.isLoggedIn =
        localStorage.getItem('isLoggedIn') === 'true'
    },

    getToken() {
      return localStorage.getItem('token')
    },

    // =========================
    // NAVEGAÇÃO
    // =========================
    goHome() {
      this.$router.push('/')
    },

    goBack() {
      this.$router.back()
    },

    openChat() {
      this.showAlert(
        'info',
        'Chat',
        'Abrindo chat de suporte...'
      )
    },

    // =========================
    // EMAIL
    // =========================
    sendEmail() {
      this.showEmailModal = true
    },

    chooseEmail(email) {
      this.selectedContactType = 'email'
      this.selectedContactValue = email

      this.showEmailModal = false

      this.showAlert(
        'success',
        'E-mail selecionado',
        `Contato selecionado: ${email}`
      )
    },

    // =========================
    // TELEFONE
    // =========================
    callSupport() {
      this.showPhoneModal = true
    },

    choosePhone(phone) {
      const confirmCall = confirm(
        `Deseja realmente ligar para ${phone}?`
      )

      if (!confirmCall) return

      this.selectedContactType = 'telefone'
      this.selectedContactValue = phone

      this.showPhoneModal = false

      // LIGAÇÃO REAL
      window.location.href = `tel:${phone.replace(/\D/g, '')}`
    },

    // =========================
    // TICKET
    // =========================
 async submitTicket() {

  // =========================
  // LOGIN
  // =========================
  if (!this.isLoggedIn) {

    this.showAlert(
      'warning',
      'Login necessário',
      'Você será redirecionado para o login para enviar um ticket.'
    )

    setTimeout(() => {
      this.$router.push('/login')
    }, 2000)

    return
  }

  // =========================
  // VALIDAÇÃO
  // =========================
  if (
    !this.ticket.name ||
    !this.ticket.email ||
    !this.ticket.category ||
    !this.ticket.description
  ) {

    this.showAlert(
      'warning',
      'Campos obrigatórios',
      'Preencha todos os campos do ticket.'
    )

    return
  }

  try {

    this.sending = true

    const contatoSelecionado =
      this.selectedContactValue || this.ticket.email

    const tipoContato =
      this.selectedContactType || 'email'

    // =========================
    // ENVIO API
    // =========================
    await axios.post(
      'http://localhost:3002/suporte/mensagens',
      {
        assunto: `Suporte - ${this.ticket.category}`,

        categoria: this.ticket.category,

        mensagem: `
Nome: ${this.ticket.name}
Email: ${this.ticket.email}

Contato selecionado:
${tipoContato}

${contatoSelecionado}

Mensagem:
${this.ticket.description}
        `
      },
      {
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        }
      }
    )

    // =========================
    // HISTÓRICO LOCAL
    // =========================
    const novoItem = {
      id: Date.now(),

      assunto: `Suporte - ${this.ticket.category}`,

      categoria: this.ticket.category,

      mensagem: this.ticket.description,

      contato: contatoSelecionado,

      nome: this.ticket.name,

      data: new Date().toISOString()
    }

    // PEGA HISTÓRICO
    const historico = JSON.parse(
      localStorage.getItem('supportHistory') || '[]'
    )

    // ADICIONA NO INÍCIO
    historico.unshift(novoItem)

    // SALVA
    localStorage.setItem(
      'supportHistory',
      JSON.stringify(historico)
    )

    // ATUALIZA TELA
    this.supportHistory = historico

    // =========================
    // RESET FORM
    // =========================
    this.ticket = {
      name: '',
      email: '',
      category: '',
      description: ''
    }

    this.selectedContactType = ''
    this.selectedContactValue = ''

    // =========================
    // ALERT SUCESSO
    // =========================
    this.showAlert(
      'success',
      'Ticket enviado',
      'Seu ticket foi enviado com sucesso.'
    )

    // RECARREGA MENSAGENS
    await this.loadMyMessages()

  } catch (error) {

    console.error(error)

    this.showAlert(
      'error',
      'Erro',
      error.response?.data?.message ||
      'Erro ao enviar ticket.'
    )

  } finally {

    this.sending = false
  }
},
    // =========================
    // LISTAR
    // =========================
    async loadMyMessages() {
      try {

        this.loadingMessages = true

        const { data } = await axios.get(
          'http://localhost:3002/suporte/minhas',
          {
            headers: {
              Authorization: `Bearer ${this.getToken()}`
            }
          }
        )

        this.myMessages = data

      } catch (error) {
        console.error(error)
      } finally {
        this.loadingMessages = false
      }
    },

    // =========================
    // RESPONDER
    // =========================
    async replySupportMessage(suporteId) {

      const mensagem =
        this.replyMap[suporteId]

      if (!mensagem?.trim()) {
        return this.showAlert(
          'warning',
          'Atenção',
          'Digite uma resposta.'
        )
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

        this.showAlert(
          'success',
          'Resposta enviada',
          'Mensagem respondida com sucesso.'
        )

      } catch (error) {

        this.showAlert(
          'error',
          'Erro',
          'Erro ao responder mensagem.'
        )
      }
    },

    // =========================
    // EXCLUIR
    // =========================
    async deleteConversation(id) {

      const confirmDelete = confirm(
        'Deseja excluir esta conversa?'
      )

      if (!confirmDelete) return

      try {

        await axios.delete(
          `http://localhost:3002/suporte/${id}`,
          {
            headers: {
              Authorization: `Bearer ${this.getToken()}`
            }
          }
        )

        this.myMessages =
          this.myMessages.filter(
            item => item._id !== id
          )

        this.showAlert(
          'success',
          'Conversa excluída',
          'A conversa foi removida.'
        )

      } catch (error) {

        this.showAlert(
          'error',
          'Erro',
          'Erro ao excluir conversa.'
        )
      }
    },

    // =========================
    // UI
    // =========================
    softenConversation(id) {
      this.collapsedThreads[id] =
        !this.collapsedThreads[id]
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
/* ===== PAGE ===== */
.support-page {
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

.gradient-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.18;
}

.light-1 {
  width: 420px;
  height: 420px;
  background: #2563eb;
  top: -120px;
  left: -120px;
}

.light-2 {
  width: 340px;
  height: 340px;
  background: #7c3aed;
  right: -100px;
  top: 40%;
}

.light-3 {
  width: 300px;
  height: 300px;
  background: #ec4899;
  bottom: -100px;
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

.logo-icon {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: linear-gradient(
    135deg,
    #2563eb,
    #7c3aed,
    #ec4899
  );
}

.logo-icon svg {
  width: 22px;
  height: 22px;
}

.logo-text {
  font-size: 1.6rem;
  font-weight: 700;

  background: linear-gradient(
    135deg,
    #2563eb,
    #7c3aed,
    #ec4899
  );

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
.support-container {
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

  line-height: 1;
  font-weight: 800;

  margin-bottom: 24px;
}

.hero-title span {
  background: linear-gradient(
    135deg,
    #2563eb,
    #7c3aed,
    #ec4899
  );

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

/* ===== SUPPORT GRID ===== */
.support-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

  gap: 24px;

  margin-bottom: 70px;
}
.minimize-btn {
  background: rgba(255,255,255,0.06);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s ease;
  margin-left: auto;
  margin-right: 12px;
}

.minimize-btn:hover {
  background: rgba(124,58,237,0.25);
}

.history-item.collapsed {
  opacity: 0.7;
}

.history-item.collapsed .history-top {
  margin-bottom: 0;
}
/* ===== CARD ===== */
.support-card,
.ticket-card,
.status-card {
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

  box-shadow:
    0 20px 50px rgba(124,58,237,0.15);
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

.support-card h2 {
  margin-bottom: 14px;
}

.support-card p {
  color: rgba(255,255,255,0.65);

  line-height: 1.7;

  margin-bottom: 24px;
}

/* ===== BUTTON ===== */
.card-btn,
.submit-btn {
  padding: 16px 22px;

  border: none;
  border-radius: 18px;

  background: linear-gradient(
    135deg,
    #2563eb,
    #7c3aed
  );

  color: white;

  font-weight: 600;

  cursor: pointer;

  transition: 0.3s ease;
}

.card-btn:hover,
.submit-btn:hover {
  transform: translateY(-3px);
}

/* ===== TICKET ===== */
.ticket-section {
  margin-bottom: 70px;
}

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

.section-title h2 {
  margin-bottom: 6px;
}

.section-title p {
  color: rgba(255,255,255,0.6);
}

/* ===== FORM ===== */
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

.input-group label {
  color: rgba(255,255,255,0.7);
}

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

  box-shadow:
    0 0 0 4px rgba(124,58,237,0.15);
}

.input-group input::placeholder,
.input-group textarea::placeholder {
  color: rgba(255,255,255,0.35);
}

select option {
  background: #111;
}

/* ===== STATUS ===== */
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

.online {
  background: #22c55e;

  box-shadow:
    0 0 15px #22c55e;
}

.purple {
  background: #7c3aed;

  box-shadow:
    0 0 15px #7c3aed;
}

.pink {
  background: #ec4899;

  box-shadow:
    0 0 15px #ec4899;
}

.status-card h3 {
  margin-bottom: 6px;
}

.status-card p {
  color: rgba(255,255,255,0.65);
}
/* ========================= */
/* MODAL */
/* ========================= */
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
.history-user {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c4b5fd;
  font-size: 0.9rem;
  margin-bottom: 8px;
}
.history-user i {
  font-size: 0.8rem;
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

/* ========================= */
/* CONTATO SELECIONADO */
/* ========================= */
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

.selected-contact i {
  font-size: 1.4rem;
}

/* ========================= */
/* ALERTA LOGIN */
/* ========================= */
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

.login-warning i {
  font-size: 1.3rem;
  margin-top: 2px;
}
/* ========================= */
/* HISTÓRICO LOCAL */
/* ========================= */

.history-local-section {
  margin-top: 40px;
}

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

.empty-history i {
  font-size: 2rem;
}

.history-item {
  padding: 22px;

  border-radius: 20px;

  background: rgba(255,255,255,0.04);

  border: 1px solid rgba(255,255,255,0.06);

  margin-bottom: 18px;
}

.history-top {
  display: flex;
  justify-content: space-between;

  margin-bottom: 12px;
}

.history-category {
  background: rgba(124,58,237,0.2);

  color: #c4b5fd;

  padding: 6px 12px;

  border-radius: 999px;

  font-size: .85rem;
}

.history-date {
  color: rgba(255,255,255,0.5);

  font-size: .85rem;
}

.history-item h3 {
  margin-bottom: 12px;
}

.history-item p {
  color: rgba(255,255,255,0.7);

  line-height: 1.7;

  margin-bottom: 18px;
}

.history-contact {
  display: flex;
  align-items: center;
  gap: 10px;

  color: #93c5fd;

  font-size: .95rem;
}
/* ========================= */
/* ANIMAÇÃO */
/* ========================= */
@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(.92);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {

  .support-header {
    padding: 18px 20px;
  }

  .support-container {
    padding: 60px 20px;
  }

  .support-card,
  .ticket-card,
  .status-card {
    padding: 26px;
  }

  .status-card {
    flex-direction: column;
    text-align: center;
  }
}

</style>