<template>
  <div class="container">
    <!-- Animated Background -->
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
            <!-- 🔒 → SVG cadeado -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
        </div>
        <h1>Recuperar senha</h1>
        <p class="subtitle">Digite seu e-mail e escolha uma nova senha</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="trocarSenha" class="login-form" novalidate>
        <!-- Email -->
        <div class="input-wrapper" :class="{ active: focused === 'email', 'has-value': form.email, 'input-error': fieldErrors.email }">
          <div class="input-field">
            <div class="input-icon">
              <!-- 📧 → SVG envelope -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <input
              v-model="form.email"
              type="email"
              @focus="focused = 'email'; clearFieldError('email')"
              @blur="focused = null; validateField('email')"
              placeholder=" "
            />
            <label>Email cadastrado</label>
            <div class="input-line"></div>
          </div>
          <transition name="field-error">
            <div v-if="fieldErrors.email" class="field-error-msg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ fieldErrors.email }}</span>
            </div>
          </transition>
        </div>

        <!-- Nova senha -->
             <!-- Nova senha -->
        <div class="input-wrapper" :class="{ active: focused === 'novaSenha', 'has-value': form.novaSenha, 'input-error': fieldErrors.novaSenha }">
          <div class="input-field">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
            </div>
            <input
              v-model="form.novaSenha"
              :type="showPassword ? 'text' : 'password'"
              @focus="focused = 'novaSenha'; clearFieldError('novaSenha')"
              @blur="focused = null; validateField('novaSenha')"
              placeholder=" "
            />
            <label>Nova senha</label>
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
            <div class="input-line"></div>
          </div>
          <transition name="field-error">
            <div v-if="fieldErrors.novaSenha" class="field-error-msg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ fieldErrors.novaSenha }}</span>
            </div>
          </transition>
        </div>

        <!-- ===== BARRA DE FORÇA DA SENHA (NOVO) ===== -->
        <div class="password-strength" v-if="form.novaSenha">
          <div class="strength-bar">
            <div class="strength-fill" :style="{ width: passwordStrength + '%', background: strengthColor }"></div>
          </div>
          <span class="strength-text" :style="{ color: strengthColor }">
            {{ strengthText }}
          </span>
        </div>
        <!-- =========================================== -->

        <!-- Confirmar senha -->
        <div class="input-wrapper" :class="{ active: focused === 'confirmarSenha', 'has-value': form.confirmarSenha, 'input-error': fieldErrors.confirmarSenha }">
          <div class="input-field">
            <div class="input-icon">
              <!-- 🔐 → SVG cadeado fechado -->
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
                <circle cx="12" cy="16" r="1"/>
                <line x1="12" y1="16" x2="12" y2="16"/>
              </svg>
            </div>
            <input
              v-model="form.confirmarSenha"
              :type="showPassword ? 'text' : 'password'"
              @focus="focused = 'confirmarSenha'; clearFieldError('confirmarSenha')"
              @blur="focused = null; validateField('confirmarSenha')"
              placeholder=" "
            />
            <label>Confirmar senha</label>
            <div class="input-line"></div>
          </div>
          <transition name="field-error">
            <div v-if="fieldErrors.confirmarSenha" class="field-error-msg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ fieldErrors.confirmarSenha }}</span>
            </div>
          </transition>
        </div>

        <!-- Botão -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="loading || !isValid"
          :class="{ loading: loading }"
        >
          <div class="btn-content" v-if="!loading">
            <span>Alterar senha</span>
            <div class="btn-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
          <div v-else class="btn-loader">
            <div class="loader-spinner"></div>
            <span>Alterando...</span>
          </div>
        </button>
      </form>

      <!-- ALERTS BONITOS (mesmo estilo do login) -->
      <transition name="alert-slide">
        <div v-if="mensagem || erro" :class="['alert', mensagem ? 'alert-success' : 'alert-error']">
          <div class="alert-icon">
            <svg v-if="mensagem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div class="alert-content">
            <strong>{{ mensagem ? 'Sucesso!' : 'Ops!' }}</strong>
            <span>{{ mensagem || erro }}</span>
          </div>
        </div>
      </transition>

      <!-- Voltar para login -->
      <div class="register-section">
        <p>
          Lembrou sua senha?
          <span class="register-link" @click="$router.push('/login')">
            Voltar para login
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </p>
      </div>
    </div>

    <!-- Floating Elements -->
    <div class="floating-elements">
      <div class="float-item" style="--delay: 0s">🎵</div>
      <div class="float-item" style="--delay: 2s">🎸</div>
      <div class="float-item" style="--delay: 4s">🎹</div>
      <div class="float-item" style="--delay: 6s">🥁</div>
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
      fieldErrors: { email: "", novaSenha: "", confirmarSenha: "" },
      loading: false,
      mensagem: "",
      erro: "",
      focused: null,
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
    },

    // ========== FORÇA DA SENHA ==========
    passwordStrength() {
      const senha = this.form.novaSenha
      let strength = 0
      if (senha.length >= 6) strength += 25
      if (senha.length >= 8) strength += 25
      if (/[A-Z]/.test(senha)) strength += 25
      if (/[0-9!@#$%^&*]/.test(senha)) strength += 25
      return strength
    },
    strengthColor() {
      if (this.passwordStrength <= 25) return '#ef4444'
      if (this.passwordStrength <= 50) return '#f59e0b'
      if (this.passwordStrength <= 75) return '#3b82f6'
      return '#22c55e'
    },
    strengthText() {
      if (this.passwordStrength <= 25) return 'Fraca'
      if (this.passwordStrength <= 50) return 'Média'
      if (this.passwordStrength <= 75) return 'Boa'
      return 'Forte'
    }
    // =====================================
  },

  methods: {
    validateField(field) {
      this.fieldErrors[field] = ""
      if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!this.form.email) {
          this.fieldErrors.email = "O email é obrigatório"
        } else if (!emailRegex.test(this.form.email)) {
          this.fieldErrors.email = "Digite um email válido (ex: usuario@email.com)"
        }
      }
      if (field === 'novaSenha') {
        if (!this.form.novaSenha) {
          this.fieldErrors.novaSenha = "A nova senha é obrigatória"
        } else if (this.form.novaSenha.length < 6) {
          this.fieldErrors.novaSenha = "A senha deve ter no mínimo 6 caracteres"
        }
      }
      if (field === 'confirmarSenha') {
        if (!this.form.confirmarSenha) {
          this.fieldErrors.confirmarSenha = "Confirme sua senha"
        } else if (this.form.confirmarSenha !== this.form.novaSenha) {
          this.fieldErrors.confirmarSenha = "As senhas não coincidem"
        }
      }
    },

    clearFieldError(field) {
      this.fieldErrors[field] = ""
    },

    validateAll() {
      this.validateField('email')
      this.validateField('novaSenha')
      this.validateField('confirmarSenha')
      return !this.fieldErrors.email && !this.fieldErrors.novaSenha && !this.fieldErrors.confirmarSenha
    },

    async trocarSenha() {
      this.erro = ""
      this.mensagem = ""

      if (!this.validateAll()) {
        this.erro = "Por favor, corrija os erros nos campos acima"
        setTimeout(() => this.erro = "", 5000)
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
        // ========== ALERTA EMAIL NÃO ENCONTRADO ==========
        const serverError = err.response?.data?.error || ""
        if (serverError.toLowerCase().includes("não encontrado") || 
            serverError.toLowerCase().includes("not found") ||
            serverError.toLowerCase().includes("não existe") ||
            err.response?.status === 404) {
          this.erro = "Conta não encontrada. Verifique se o email está correto ou crie uma nova conta."
        } else {
          this.erro = serverError || "Erro ao alterar senha"
        }
        // ==================================================
        setTimeout(() => this.erro = "", 5000)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #020617;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
}

/* ===== BACKGROUND ANIMADO ===== */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.gradient-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
  animation: float 20s infinite ease-in-out;
}

.sphere-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #6366f1 0%, transparent 70%);
  top: -300px;
  left: -200px;
  animation-delay: 0s;
}

.sphere-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #ec4899 0%, transparent 70%);
  bottom: -200px;
  right: -100px;
  animation-delay: -7s;
}

.sphere-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #22c55e 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(50px, -50px) rotate(120deg); }
  66% { transform: translate(-30px, 30px) rotate(240deg); }
}

.grid-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
}

/* ===== CARD ===== */
.login-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 10;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
}

.login-card.shake {
  animation: shake 0.5s ease-in-out;
}

.login-card.success-pulse {
  animation: successPulse 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

/* ===== HEADER ===== */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
}

.logo-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}

.ring-1 {
  width: 100%;
  height: 100%;
  border-top-color: #6366f1;
  border-right-color: #6366f1;
  animation: spin 3s linear infinite;
}

.ring-2 {
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
  border-bottom-color: #ec4899;
  border-left-color: #ec4899;
  animation: spin 3s linear infinite reverse;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.logo-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  letter-spacing: -0.025em;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
}

/* ===== FORM ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-wrapper {
  position: relative;
}

.input-field {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #64748b;
  transition: all 0.3s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon svg {
  width: 20px;
  height: 20px;
}

.input-wrapper.active .input-icon {
  color: #6366f1;
  transform: scale(1.1);
}

.input-wrapper.input-error .input-icon {
  color: #ef4444;
}

input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

input:focus {
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
}

.input-wrapper.active input {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-wrapper.input-error input {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

label {
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s ease;
  background: transparent;
}

input:focus + label,
input:not(:placeholder-shown) + label,
.input-wrapper.has-value label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #6366f1;
  background: #111827;
  padding: 0 6px;
  font-weight: 500;
}

.input-wrapper.input-error label {
  color: #ef4444 !important;
}

.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
  z-index: 2;
}

.toggle-password:hover {
  color: #94a3b8;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.input-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #ec4899);
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 0 0 16px 16px;
}

.input-wrapper.active .input-line {
  width: 100%;
}

.input-wrapper.input-error .input-line {
  background: linear-gradient(90deg, #ef4444, #f87171);
  width: 100%;
}

/* ===== ERROS DE CAMPO ===== */
.field-error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #f87171;
  font-size: 0.8rem;
  font-weight: 500;
}

.field-error-msg svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.field-error-enter-active, .field-error-leave-active {
  transition: all 0.25s ease;
}

.field-error-enter-from, .field-error-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ===== BOTÃO SUBMIT ===== */
.submit-btn {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-top: 8px;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s;
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.btn-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.submit-btn:hover .btn-icon {
  transform: translateX(4px);
}

.btn-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loader-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ===== ALERTS BONITOS ===== */
.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  animation: slideUp 0.3s ease;
}

.alert-success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.alert-error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.alert-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.alert-icon svg {
  width: 100%;
  height: 100%;
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.alert-content strong {
  font-size: 0.875rem;
  font-weight: 600;
}

.alert-content span {
  font-size: 0.875rem;
  opacity: 0.9;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-slide-enter-active, .alert-slide-leave-active {
  transition: all 0.3s ease;
}

.alert-slide-enter-from, .alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ===== VOLTAR PARA LOGIN ===== */
.register-section {
  text-align: center;
  margin-top: 24px;
}

.register-section p {
  color: #64748b;
  font-size: 0.95rem;
}

.register-link {
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  transition: all 0.3s;
  position: relative;
}

.register-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #6366f1;
  transition: width 0.3s;
}

.register-link:hover {
  color: #818cf8;
}

.register-link:hover::after {
  width: 100%;
}

.register-link svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s;
}

.register-link:hover svg {
  transform: translateX(4px);
}

/* ===== FLOATING ELEMENTS ===== */
.floating-elements {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}

.float-item {
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  animation: floatUp 15s infinite ease-in-out;
  animation-delay: var(--delay);
}

.float-item:nth-child(1) { left: 10%; bottom: -50px; }
.float-item:nth-child(2) { left: 30%; bottom: -50px; animation-duration: 18s; }
.float-item:nth-child(3) { right: 30%; bottom: -50px; animation-duration: 20s; }
.float-item:nth-child(4) { right: 10%; bottom: -50px; animation-duration: 16s; }

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.1;
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}
/* ===== BARRA DE FORÇA DA SENHA ===== */
.password-strength {
  margin-top: -12px;
  padding: 0 4px;
}

.strength-bar {
  height: 4px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-text {
  font-size: 0.75rem;
  margin-top: 4px;
  display: block;
  text-align: right;
  font-weight: 600;
  transition: color 0.3s;
}
/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .logo-container {
    width: 60px;
    height: 60px;
  }

  .logo-icon svg {
    width: 20px;
    height: 20px;
  }
}
</style>