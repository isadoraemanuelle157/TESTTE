<template>
  <div class="container">
    <!-- Background -->
    <div class="bg-animation">
      <div class="gradient-sphere sphere-1"></div>
      <div class="gradient-sphere sphere-2"></div>
      <div class="gradient-sphere sphere-3"></div>
      <div class="grid-overlay"></div>
    </div>

    <div class="login-card" :class="{ shake: erro, 'success-pulse': mensagem }">
      <!-- Header -->
      <div class="card-header">
        <div class="logo-container">
          <div class="logo-ring ring-1"></div>
          <div class="logo-ring ring-2"></div>

          <div class="logo-icon">
            🔒
          </div>
        </div>

        <h1>Recuperar senha</h1>
        <p class="subtitle">
          Digite seu e-mail e escolha uma nova senha
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="trocarSenha" class="login-form">
        <!-- Email -->
        <div class="input-wrapper">
          <div class="input-field">
            <div class="input-icon">📧</div>

            <input
              v-model="form.email"
              type="email"
              required
              placeholder=" "
            />

            <label>Email cadastrado</label>
            <div class="input-line"></div>
          </div>
        </div>

        <!-- Nova senha -->
        <div class="input-wrapper">
          <div class="input-field">
            <div class="input-icon">🔑</div>

            <input
              v-model="form.novaSenha"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder=" "
            />

            <label>Nova senha</label>

            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              👁️
            </button>

            <div class="input-line"></div>
          </div>
        </div>

        <!-- Confirmar senha -->
        <div class="input-wrapper">
          <div class="input-field">
            <div class="input-icon">🔐</div>

            <input
              v-model="form.confirmarSenha"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder=" "
            />

            <label>Confirmar senha</label>
            <div class="input-line"></div>
          </div>
        </div>

        <!-- Botão -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="loading || !isValid"
        >
          <div v-if="!loading" class="btn-content">
            <span>Alterar senha</span>
          </div>

          <div v-else class="btn-loader">
            <div class="loader-spinner"></div>
            <span>Alterando...</span>
          </div>
        </button>
      </form>

      <!-- Alertas -->
      <transition name="alert-slide">
        <div
          v-if="mensagem || erro"
          :class="[
            'alert',
            mensagem ? 'alert-success' : 'alert-error'
          ]"
        >
          <strong>
            {{ mensagem ? 'Sucesso!' : 'Erro!' }}
          </strong>

          <span>
            {{ mensagem || erro }}
          </span>
        </div>
      </transition>

      <!-- Voltar -->
      <div class="register-section">
        <p>
          Lembrou sua senha?
          <span
            class="register-link"
            @click="$router.push('/login')"
          >
            Voltar para login
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "RecuperarSenha",

  data() {
    return {
      form: {
        email: "",
        novaSenha: "",
        confirmarSenha: ""
      },

      loading: false,
      mensagem: "",
      erro: "",
      showPassword: false
    }
  },

  computed: {
    isValid() {
      return (
        this.form.email &&
        this.form.novaSenha.length >= 6 &&
        this.form.confirmarSenha.length >= 6
      )
    }
  },

  methods: {
  async trocarSenha() {
  this.erro = ""
  this.mensagem = ""

  if (this.form.novaSenha !== this.form.confirmarSenha) {
    this.erro = "As senhas não coincidem"
    return
  }

  try {
    this.loading = true

    const response = await axios.put(
      'http://localhost:3002/usuarios/recuperar-senha',
      {
        email: this.form.email,
        novaSenha: this.form.novaSenha
      }
    )

    this.mensagem = response.data.message

    setTimeout(() => {
      this.$router.push("/login")
    }, 2000)

  } catch (err) {
    console.log(err.response?.data)

    this.erro =
      err.response?.data?.error ||
      "Erro ao alterar senha"

  } finally {
    this.loading = false
  }
}
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  overflow: hidden;
  position: relative;
}

.login-card {
  width: 430px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 30px;
  padding: 40px;
  backdrop-filter: blur(20px);
  z-index: 10;
}

.card-header {
  text-align: center;
  margin-bottom: 35px;
}

.logo-icon {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg,#7c3aed,#06b6d4);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  margin: auto;
  color: white;
}

h1 {
  color: white;
  margin-top: 20px;
}

.subtitle {
  color: #94a3b8;
}

.input-wrapper {
  margin-bottom: 20px;
}

.input-field {
  position: relative;
}

.input-field input {
  width: 100%;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: white;
  outline: none;
}

.input-field label {
  position: absolute;
  left: 18px;
  top: -10px;
  background: #0f172a;
  padding: 0 6px;
  font-size: 12px;
  color: #cbd5e1;
}

.submit-btn {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg,#7c3aed,#06b6d4);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
}

.alert {
  margin-top: 20px;
  padding: 14px;
  border-radius: 14px;
  text-align: center;
}

.alert-success {
  background: rgba(34,197,94,0.15);
  color: #4ade80;
}

.alert-error {
  background: rgba(239,68,68,0.15);
  color: #f87171;
}

.register-section {
  margin-top: 25px;
  text-align: center;
}

.register-link {
  color: #22d3ee;
  cursor: pointer;
  margin-left: 5px;
}

.bg-animation,
.gradient-sphere,
.grid-overlay {
  position: absolute;
}

.gradient-sphere {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(90px);
}

.sphere-1 {
  background: #7c3aed;
  top: -100px;
  left: -100px;
}

.sphere-2 {
  background: #06b6d4;
  bottom: -100px;
  right: -100px;
}
</style>