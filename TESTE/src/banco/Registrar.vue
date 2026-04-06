<!-- Registrar.vue - Etapa 1 -->
<template>
  <div class="container">
    <!-- Background Elements -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>


    <div class="card" :class="{ 'loading-state': loading }">
      <!-- Progress Steps -->
      <div class="progress-steps">
        <div class="step active">
          <div class="step-number">1</div>
          <span class="step-label">Conta</span>
        </div>
        <div class="step-line"></div>
        <div class="step">
          <div class="step-number">2</div>
          <span class="step-label">Perfil</span>
        </div>
      </div>


      <!-- Logo/Icon Section -->
      <div class="brand-section">
        <div class="logo-wrapper">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="pulse-ring"></div>
        </div>
        <h1>Criar Conta</h1>
        <p class="subtitle">Junte-se a nós hoje mesmo</p>
      </div>


      <form @submit.prevent="registrar" class="form-content">
        <!-- Nome -->
        <div class="input-group" :class="{ 'focused': focused === 'nome', 'filled': form.nome }">
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              v-model="form.nome"
              type="text"
              required
              @focus="focused = 'nome'"
              @blur="focused = null"
              placeholder=" "
            />
            <label>Nome completo</label>
          </div>
        </div>


        <!-- Email -->
        <div class="input-group" :class="{ 'focused': focused === 'email', 'filled': form.email }">
          <div class="input-wrapper">
            <span class="input-icon">✉️</span>
            <input
              v-model="form.email"
              type="email"
              required
              @focus="focused = 'email'"
              @blur="focused = null"
              placeholder=" "
            />
            <label>Email</label>
          </div>
        </div>


        <!-- Senha -->
        <div class="input-group" :class="{ 'focused': focused === 'senha', 'filled': form.senha }">
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              v-model="form.senha"
              :type="showPassword ? 'text' : 'password'"
              required
              @focus="focused = 'senha'"
              @blur="focused = null"
              placeholder=" "
            />
            <label>Senha</label>
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <!-- Password Strength -->
          <div class="password-strength" v-if="form.senha">
            <div class="strength-bar">
              <div class="strength-fill" :style="{ width: passwordStrength + '%', background: strengthColor }"></div>
            </div>
            <span class="strength-text" :style="{ color: strengthColor }">
              {{ strengthText }}
            </span>
          </div>
        </div>


        <!-- Confirmar Senha -->
        <div class="input-group" :class="{ 'focused': focused === 'confirmarSenha', 'filled': form.confirmarSenha }">
          <div class="input-wrapper">
            <span class="input-icon">🔐</span>
            <input
              v-model="form.confirmarSenha"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              @focus="focused = 'confirmarSenha'"
              @blur="focused = null"
              placeholder=" "
            />
            <label>Confirmar senha</label>
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <span class="error-text" v-if="senhasNaoCoincidem">As senhas não coincidem</span>
        </div>


        <!-- Submit Button -->
        <button type="submit" :disabled="loading || !isValid" class="submit-btn">
          <span class="btn-content" v-if="!loading">
            <span>Continuar</span>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
          <span v-else class="loading-spinner">
            <span class="spinner"></span>
            <span>Criando conta...</span>
          </span>
        </button>
      </form>


      <!-- Messages -->
      <transition name="slide-up">
        <div v-if="mensagem || erro" :class="['alert', mensagem ? 'success' : 'error']">
          <span class="alert-icon">{{ mensagem ? '✓' : '!' }}</span>
          <span>{{ mensagem || erro }}</span>
        </div>
      </transition>


      <!-- Divider -->
      <div class="divider">
        <span>ou</span>
      </div>


      <!-- Login Link -->
      <div class="footer-section">
        <p class="login-text">
          Já tem uma conta?
          <span class="link" @click="$router.push('/login')">
            Fazer login
            <svg class="link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </p>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios"


export default {
  name: "Registrar",
  data() {
    return {
      form: {
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: ""
      },
      loading: false,
      mensagem: "",
      erro: "",
      focused: null,
      showPassword: false,
      showConfirmPassword: false
    }
  },
  computed: {
    passwordStrength() {
      const senha = this.form.senha
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
    },
    senhasNaoCoincidem() {
      return this.form.confirmarSenha && this.form.senha !== this.form.confirmarSenha
    },
    isValid() {
      return this.form.nome &&
             this.form.email &&
             this.form.senha.length >= 6 &&
             this.form.confirmarSenha &&
             !this.senhasNaoCoincidem
    }
  },
  methods: {
    async registrar() {
      this.loading = true
      this.erro = ""
      this.mensagem = ""


      if (!this.isValid) {
        if (this.senhasNaoCoincidem) {
          this.erro = "As senhas não coincidem!"
        } else {
          this.erro = "Preencha todos os campos corretamente!"
        }
        this.loading = false
        return
      }


      try {
        const response = await axios.post(
          "http://localhost:3002/usuarios/registrar",
          {
            nome: this.form.nome,
            email: this.form.email,
            senha: this.form.senha
          }
        )

const userData = response.data.user
const token = response.data.token

localStorage.setItem("usuario_temp", JSON.stringify(userData))
localStorage.setItem("token", token) // 🔥 ADICIONAR



        this.mensagem = "Conta criada! Complete seu perfil..."
       
        // Redirecionar para etapa 2 após 1 segundo
        setTimeout(() => {
          this.$router.push("/registrar2")
        }, 1000)


      } catch (err) {
        this.erro = err.response?.data?.error || "Erro ao criar conta. Tente novamente."
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
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}


/* Background Shapes */
.bg-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}


.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}


.shape-1 {
  width: 400px;
  height: 400px;
  background: #6366f1;
  top: -200px;
  left: -100px;
  animation-delay: 0s;
}


.shape-2 {
  width: 300px;
  height: 300px;
  background: #8b5cf6;
  bottom: -150px;
  right: -50px;
  animation-delay: 5s;
}


.shape-3 {
  width: 250px;
  height: 250px;
  background: #ec4899;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}


@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}


/* Card */
.card {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px 40px 40px;
  width: 100%;
  max-width: 420px;
  color: white;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 10;
  transition: transform 0.3s ease;
}


.card.loading-state {
  transform: scale(0.98);
  opacity: 0.9;
}


/* Progress Steps */
.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
}


.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}


.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
  color: #64748b;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}


.step.active .step-number {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}


.step-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}


.step.active .step-label {
  color: #f8fafc;
}


.step-line {
  width: 60px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1px;
}


/* Brand Section */
.brand-section {
  text-align: center;
  margin-bottom: 32px;
}


.logo-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}


.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
}


.logo svg {
  width: 40px;
  height: 40px;
  color: white;
}


.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.3);
  animation: pulse 2s infinite;
  z-index: 1;
}


@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}


h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}


.subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
}


/* Form */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}


.input-group {
  position: relative;
}


.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}


.input-icon {
  position: absolute;
  left: 16px;
  font-size: 1.25rem;
  z-index: 2;
  transition: all 0.3s ease;
  opacity: 0.6;
}


.input-group.focused .input-icon {
  opacity: 1;
  transform: scale(1.1);
}


input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}


input:focus {
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}


.input-group.focused input {
  border-color: #6366f1;
}


label {
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s ease;
  background: transparent;
  padding: 0 4px;
}


input:focus + label,
input:not(:placeholder-shown) + label,
.input-group.filled label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #6366f1;
  background: #111827;
  font-weight: 500;
}


.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  opacity: 0.6;
  transition: opacity 0.3s;
  padding: 0;
}


.toggle-password:hover {
  opacity: 1;
}


/* Password Strength */
.password-strength {
  margin-top: 8px;
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


/* Error Text */
.error-text {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 4px;
  display: block;
  padding: 0 4px;
}


/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
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
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}


.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}


.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
}


.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.5);
}


.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}


.arrow-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}


.submit-btn:hover .arrow-icon {
  transform: translateX(4px);
}


.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}


.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}


@keyframes spin {
  to { transform: rotate(360deg); }
}


/* Alert */
.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  font-size: 0.95rem;
  animation: slideUp 0.3s ease;
}


.alert.success {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}


.alert.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}


.alert-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}


.alert.success .alert-icon {
  background: rgba(34, 197, 94, 0.2);
}


.alert.error .alert-icon {
  background: rgba(239, 68, 68, 0.2);
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


.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}


.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}


/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: #64748b;
  font-size: 0.875rem;
}


.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(148, 163, 184, 0.2);
}


.divider span {
  padding: 0 16px;
}


/* Footer */
.footer-section {
  text-align: center;
}


.login-text {
  color: #94a3b8;
  font-size: 0.95rem;
}


.link {
  color: #818cf8;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
  position: relative;
}


.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #818cf8;
  transition: width 0.3s;
}


.link:hover {
  color: #a5b4fc;
}


.link:hover::after {
  width: 100%;
}


.link-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.3s;
}


.link:hover .link-arrow {
  transform: translateX(4px);
}


/* Responsive */
@media (max-width: 480px) {
  .card {
    padding: 24px 20px 32px;
  }
 
  h1 {
    font-size: 1.5rem;
  }
 
  .logo-wrapper {
    width: 60px;
    height: 60px;
  }
 
  .logo {
    width: 60px;
    height: 60px;
  }
 
  .logo svg {
    width: 30px;
    height: 30px;
  }
 
  .step-line {
    width: 40px;
  }
}
</style>