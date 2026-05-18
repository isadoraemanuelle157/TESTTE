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
          🎧 Suporte SoundUp
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

          <div class="card-icon">💬</div>

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

          <div class="card-icon">📧</div>

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

          <div class="card-icon">📞</div>

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
              📝
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

    </main>

  </div>
</template>

<script>
export default {
  name: 'SupportPage',

  data() {
    return {
      ticket: {
        name: '',
        email: '',
        category: '',
        description: ''
      }
    }
  },

  methods: {
    goHome() {
      this.$router.push('/')
    },

    goBack() {
      this.$router.back()
    },

    openChat() {
      alert('💬 Abrindo chat de suporte...')
    },

    sendEmail() {
      window.location.href = 'mailto:suporte@soundup.com'
    },

    callSupport() {
      alert('📞 Conectando ao suporte...')
    },

    submitTicket() {
      alert('✅ Ticket enviado com sucesso!')

      this.ticket = {
        name: '',
        email: '',
        category: '',
        description: ''
      }
    }
  }
}
</script>

<style scoped>

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