<template>
  <div class="edit-container">
    <!-- Animated Background -->
    <div class="bg-effects">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Back Button -->
      <button class="back-button" @click="voltar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Voltar para lista</span>
      </button>

      <!-- Edit Card -->
      <div class="edit-card" :class="{ 'saving': loading, 'success': mensagem }">
        <!-- Header -->
        <div class="card-header">
          <div class="user-avatar" :style="{ background: userGradient }">
            {{ userInitials }}
          </div>
          <div class="header-text">
            <h1>Editar Usuário</h1>
            <p class="subtitle">Atualize as informações do perfil</p>
          </div>
          <div class="status-badge" :class="userStatus">
            <span class="status-dot"></span>
            {{ userStatus === 'active' ? 'Ativo' : 'Inativo' }}
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="salvar" class="edit-form">
          <!-- Name Field -->
          <div class="input-wrapper" :class="{ 'focused': focused === 'nome', 'filled': form.nome }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <input 
              v-model="form.nome" 
              type="text" 
              required
              @focus="focused = 'nome'"
              @blur="focused = null"
              placeholder=" "
            />
            <label>Nome completo</label>
            <div class="input-focus-line"></div>
          </div>

          <!-- Email Field -->
          <div class="input-wrapper" :class="{ 'focused': focused === 'email', 'filled': form.email }">
            <div class="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <input 
              v-model="form.email" 
              type="email" 
              required
              @focus="focused = 'email'"
              @blur="focused = null"
              placeholder=" "
            />
            <label>Endereço de email</label>
            <div class="input-focus-line"></div>
          </div>

          <!-- Change Password Section -->
          <div class="password-section">
            <button 
              type="button" 
              class="toggle-password-btn"
              @click="showPasswordFields = !showPasswordFields"
            >
              <svg v-if="!showPasswordFields" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              <span>{{ showPasswordFields ? 'Cancelar alteração' : 'Alterar senha' }}</span>
            </button>

            <transition name="expand">
              <div v-if="showPasswordFields" class="password-fields">
                <div class="input-wrapper" :class="{ 'focused': focused === 'senha', 'filled': form.senha }">
                  <div class="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input 
                    v-model="form.senha" 
                    :type="showPassword ? 'text' : 'password'"
                    @focus="focused = 'senha'"
                    @blur="focused = null"
                    placeholder=" "
                  />
                  <label>Nova senha</label>
                  <button 
                    type="button" 
                    class="password-toggle"
                    @click="showPassword = !showPassword"
                  >
                    <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  </button>
                  <div class="input-focus-line"></div>
                </div>

                <!-- Password Strength -->
                <div v-if="form.senha" class="password-strength">
                  <div class="strength-bar">
                    <div 
                      class="strength-fill" 
                      :style="{ width: passwordStrength + '%', background: strengthColor }"
                    ></div>
                  </div>
                  <span class="strength-text" :style="{ color: strengthColor }">
                    Força: {{ strengthText }}
                  </span>
                </div>
              </div>
            </transition>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button 
              type="button" 
              class="btn-secondary"
              @click="voltar"
              :disabled="loading"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              <span>Cancelar</span>
            </button>

            <button 
              type="submit" 
              class="btn-primary"
              :disabled="loading || !hasChanges"
              :class="{ 'loading': loading }"
            >
              <span v-if="!loading" class="btn-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span>Salvar Alterações</span>
              </span>
              <span v-else class="btn-loading">
                <div class="spinner"></div>
                <span>Salvando...</span>
              </span>
            </button>
          </div>
        </form>

        <!-- Messages -->
        <transition name="slide-up">
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
              <strong>{{ mensagem ? 'Sucesso!' : 'Erro!' }}</strong>
              <span>{{ mensagem || erro }}</span>
            </div>
          </div>
        </transition>

        <!-- User Info Footer -->
        <div class="user-meta">
          <div class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Cadastrado em {{ formatDate(createdAt) }}</span>
          </div>
          <div class="meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span>Última atualização: {{ formatDate(updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Animation Overlay -->
    <transition name="fade">
      <div v-if="showSuccessOverlay" class="success-overlay">
        <div class="success-content">
          <div class="success-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2>Alterações Salvas!</h2>
          <p>Redirecionando...</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "EditarUsuario",

  data() {
    return {
      form: {
        nome: "",
        email: "",
        senha: ""
      },
      originalData: {
        nome: "",
        email: ""
      },
      loading: false,
      mensagem: "",
      erro: "",
      focused: null,
      showPasswordFields: false,
      showPassword: false,
      showSuccessOverlay: false,
      createdAt: null,
      updatedAt: null,
      userStatus: "active"
    }
  },

  computed: {
    userInitials() {
      return this.form.nome
        ?.split(" ")
        .filter(Boolean)
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"
    },

    userGradient() {
      const colors = [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
      ]

      const index = (this.form.nome || "")
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)

      return colors[index % colors.length]
    },

    hasChanges() {
      return (
        this.form.nome !== this.originalData.nome ||
        this.form.email !== this.originalData.email ||
        !!this.form.senha
      )
    },

    passwordStrength() {
      const senha = this.form.senha || ""
      let strength = 0

      if (senha.length >= 6) strength += 25
      if (senha.length >= 8) strength += 25
      if (/[A-Z]/.test(senha)) strength += 25
      if (/[0-9!@#$%^&*]/.test(senha)) strength += 25

      return strength
    },

    strengthColor() {
      if (this.passwordStrength <= 25) return "#ef4444"
      if (this.passwordStrength <= 50) return "#f59e0b"
      if (this.passwordStrength <= 75) return "#3b82f6"
      return "#22c55e"
    },

    strengthText() {
      if (this.passwordStrength <= 25) return "Fraca"
      if (this.passwordStrength <= 50) return "Média"
      if (this.passwordStrength <= 75) return "Boa"
      return "Forte"
    }
  },

  async mounted() {
    await this.buscarUsuario()
  },

  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem("token")
      return {
        Authorization: `Bearer ${token}`
      }
    },

    async buscarUsuario() {
      try {
        const id = this.$route.params.id

        const res = await axios.get(`http://localhost:3002/usuarios/${id}`, {
          headers: this.getAuthHeaders()
        })

        const usuario = res.data

        this.form.nome = usuario.nome || ""
        this.form.email = usuario.email || ""
        this.form.senha = ""

        this.originalData = {
          nome: usuario.nome || "",
          email: usuario.email || ""
        }

        this.createdAt = usuario.createdAt || usuario.membroDesde || null
        this.updatedAt = usuario.updatedAt || usuario.createdAt || usuario.membroDesde || null

        // como no model existe perfilPrivado, e não status
        this.userStatus = usuario.perfilPrivado ? "inactive" : "active"
      } catch (err) {
        console.error("Erro ao carregar usuário:", err)
        this.erro =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao carregar usuário"

        setTimeout(() => {
          this.voltar()
        }, 2000)
      }
    },

    async salvar() {
      if (!this.hasChanges) return

      this.loading = true
      this.erro = ""
      this.mensagem = ""

      try {
        const id = this.$route.params.id

        const payload = {
          nome: this.form.nome,
          email: this.form.email
        }

        if (this.form.senha && this.form.senha.trim()) {
          payload.senha = this.form.senha.trim()
        }

        const res = await axios.put(
          `http://localhost:3002/usuarios/${id}`,
          payload,
          {
            headers: this.getAuthHeaders()
          }
        )

        this.mensagem = res.data?.message || "Usuário atualizado com sucesso!"

        const usuarioAtualizado = res.data?.user || {}

        this.originalData = {
          nome: this.form.nome,
          email: this.form.email
        }

        this.form.senha = ""
        this.showPasswordFields = false
        this.showPassword = false

        this.updatedAt =
          usuarioAtualizado.updatedAt ||
          new Date().toISOString()

        this.userStatus = usuarioAtualizado.perfilPrivado ? "inactive" : this.userStatus

        this.showSuccessOverlay = true

        setTimeout(() => {
          this.$router.push("/tabelausuario")
        }, 1500)
      } catch (err) {
        console.error("Erro ao salvar alterações:", err)
        this.erro =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao salvar alterações"
      } finally {
        this.loading = false
      }
    },

    voltar() {
      this.$router.push("/tabelausuario")
    },

    formatDate(date) {
      if (!date) return "-"

      const parsed = new Date(date)

      if (isNaN(parsed.getTime())) return "-"

      return parsed.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
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

.edit-container {
  min-height: 100vh;
  background: #020617;
  color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Background Effects */
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: #6366f1;
  top: -200px;
  right: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: #22c55e;
  bottom: -200px;
  left: -100px;
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Content Wrapper */
.content-wrapper {
  position: relative;
  z-index: 10;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Back Button */
.back-button {
  position: absolute;
  top: 40px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.back-button:hover {
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  border-color: rgba(148, 163, 184, 0.4);
  transform: translateX(-4px);
}

.back-button svg {
  width: 18px;
  height: 18px;
}

/* Edit Card */
.edit-card {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.edit-card.saving {
  opacity: 0.8;
  transform: scale(0.98);
}

.edit-card.success {
  border-color: rgba(34, 197, 94, 0.3);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(34, 197, 94, 0.2),
    0 0 30px rgba(34, 197, 94, 0.1);
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.header-text {
  flex: 1;
}

.header-text h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  transition: all 0.3s ease;
  z-index: 2;
}

.input-icon svg {
  width: 20px;
  height: 20px;
}

.input-wrapper.focused .input-icon {
  color: #6366f1;
}

input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  color: #f1f5f9;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

input:focus {
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
}

.input-wrapper.focused input {
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
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
.input-wrapper.filled label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #6366f1;
  background: #111827;
  padding: 0 6px;
  font-weight: 500;
}

.input-focus-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.input-wrapper.focused .input-focus-line {
  width: 100%;
}

/* Password Section */
.password-section {
  margin-top: 8px;
}

.toggle-password-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px dashed rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  color: #818cf8;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
  width: 100%;
  justify-content: center;
}

.toggle-password-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  border-style: solid;
}

.toggle-password-btn svg {
  width: 18px;
  height: 18px;
}

.password-fields {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.password-toggle:hover {
  color: #94a3b8;
}

.password-toggle svg {
  width: 20px;
  height: 20px;
}

/* Password Strength */
.password-strength {
  margin-top: 12px;
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
  font-size: 0.8rem;
  margin-top: 6px;
  display: block;
  font-weight: 500;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-secondary, .btn-primary {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-primary svg, .btn-secondary svg {
  width: 20px;
  height: 20px;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-loading {
  display: flex;
  align-items: center;
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
  margin-top: 24px;
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

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* User Meta */
.user-meta {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 0.875rem;
}

.meta-item svg {
  width: 16px;
  height: 16px;
}

/* Expand Transition */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
}

/* Success Overlay */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(2, 6, 23, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-content {
  text-align: center;
  animation: scaleIn 0.3s ease;
}

.success-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 20px 40px -10px rgba(34, 197, 94, 0.4);
  animation: checkmark 0.5s ease;
}

.success-circle svg {
  width: 50px;
  height: 50px;
  color: white;
}

.success-content h2 {
  font-size: 1.75rem;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.success-content p {
  color: #64748b;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes checkmark {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .content-wrapper {
    padding: 80px 16px 40px;
  }
  
  .back-button {
    top: 20px;
    left: 16px;
  }
  
  .edit-card {
    padding: 24px;
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    width: 60px;
    height: 60px;
    font-size: 1.25rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-secondary, .btn-primary {
    width: 100%;
  }
}
</style>