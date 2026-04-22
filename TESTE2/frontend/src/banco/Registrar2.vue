<!-- RegistrarEtapa2.vue - Completar Perfil -->
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
        <div class="step completed">
          <div class="step-number">1</div>
          <span class="step-label">Conta</span>
        </div>
        <div class="step-line completed"></div>
        <div class="step active">
          <div class="step-number">2</div>
          <span class="step-label">Perfil</span>
        </div>
      </div>

      <!-- Header -->
      <div class="brand-section">
        <div class="avatar-upload" @click="triggerAvatarUpload">
          <div class="avatar-preview" :style="avatarPreviewStyle">
            <img v-if="form.avatar" :src="form.avatar" alt="Avatar" />
            <i v-else class="fa fa-camera"></i>
          </div>
          <div class="avatar-overlay">
            <i class="fa fa-camera"></i>
            <span>Adicionar foto</span>
          </div>
          <input 
            type="file" 
            ref="avatarInput" 
            accept="image/*" 
            @change="handleAvatarChange"
            style="display: none"
          />
        </div>
        <h1>Complete seu perfil</h1>
        <p class="subtitle">Personalize sua conta</p>
      </div>

      <form @submit.prevent="completarPerfil" class="form-content">
        <!-- Username -->
        <div class="input-group" :class="{ 'focused': focused === 'username', 'filled': form.username }">
          <div class="input-wrapper">
            <span class="input-icon">@</span>
            <input 
              v-model="form.username" 
              type="text" 
              required 
              @focus="focused = 'username'"
              @blur="focused = null"
              placeholder=" "
              maxlength="30"
            />
            <label>Nome de usuário</label>
          </div>
          <span class="hint">Este será seu identificador único</span>
        </div>

        <!-- Bio -->
        <div class="input-group" :class="{ 'focused': focused === 'bio', 'filled': form.bio }">
          <div class="input-wrapper textarea-wrapper">
            <span class="input-icon textarea-icon">📝</span>
            <textarea 
              v-model="form.bio" 
              @focus="focused = 'bio'"
              @blur="focused = null"
              placeholder=" "
              maxlength="150"
              rows="3"
            ></textarea>
            <label>Sobre você</label>
          </div>
          <span class="char-count">{{ form.bio.length }}/150</span>
        </div>

        <!-- Localização -->
        <!-- CEP -->
        <div class="input-group">
          <div class="input-wrapper">
            <span class="input-icon">📮</span>
            <input 
              v-model="form.cep"
              type="text"
              maxlength="9"
              @blur="buscarCEP"
              placeholder=" "
            />
            <label>CEP</label>
          </div>
        </div>

        <!-- Rua -->
        <div class="input-group">
          <div class="input-wrapper">
            <span class="input-icon">🏠</span>
            <input v-model="form.rua" type="text" placeholder=" " />
            <label>Rua</label>
          </div>
        </div>

        <!-- Número -->
        <div class="input-group">
          <div class="input-wrapper">
            <span class="input-icon">🔢</span>
            <input v-model="form.numero" @input="atualizarLocalizacao" type="text" placeholder=" " />
            <label>Número</label>
          </div>
        </div>
        <!-- Bairro -->
        <div class="input-group">
          <div class="input-wrapper">
            <span class="input-icon">📍</span>
            <input v-model="form.bairro" type="text" placeholder=" " />
            <label>Bairro</label>
          </div>
        </div>

        <!-- Cidade -->
        <div class="input-group">
          <div class="input-wrapper">
            <span class="input-icon">🏙️</span>
            <input v-model="form.cidade" type="text" placeholder=" " />
            <label>Cidade</label>
          </div>
        </div>

        <!-- Estado -->
        <div class="input-group">
          <div class="input-wrapper">
            <span class="input-icon">🗺️</span>
            <input v-model="form.estado" type="text" placeholder=" " />
            <label>Estado</label>
          </div>
        </div>
        <div v-if="form.localizacao" class="location-preview">
          📍 Sua localização será:
          <strong>{{ form.localizacao }}</strong>
        </div>

        <!-- Cover Image URL -->
        <div class="input-group" :class="{ 'focused': focused === 'cover', 'filled': form.cover }">
          <div class="input-wrapper">
            <span class="input-icon">🖼️</span>
            <input 
              v-model="form.cover" 
              type="url" 
              @focus="focused = 'cover'"
              @blur="focused = null"
              placeholder=" "
            />
            <label>URL da imagem de capa (opcional)</label>
          </div>
        </div>

        <!-- Preview da Capa -->
        <div class="cover-preview" v-if="form.cover">
          <img :src="form.cover" alt="Capa" @error="form.cover = ''" />
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="loading || !isValid" class="submit-btn">
          <span class="btn-content" v-if="!loading">
            <span>Finalizar</span>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
          <span v-else class="loading-spinner">
            <span class="spinner"></span>
            <span>Salvando...</span>
          </span>
        </button>

        <!-- Pular etapa -->
        <button type="button" class="skip-btn" @click="pularEtapa" :disabled="loading">
          Pular por agora
        </button>
      </form>

      <!-- Messages -->
      <transition name="slide-up">
        <div v-if="mensagem || erro" :class="['alert', mensagem ? 'success' : 'error']">
          <span class="alert-icon">{{ mensagem ? '✓' : '!' }}</span>
          <span>{{ mensagem || erro }}</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "RegistrarEtapa2",
  data() {
    return {
      form: {
        username: "",
        bio: "",
        avatar: "",
        cover: "",
        // NOVO
        cep: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        localizacao: ""
      },
      loading: false,
      mensagem: "",
      erro: "",
      focused: null,
      usuarioTemp: null,
      userId: null // ✅ NOVO: Armazenar ID separadamente
    }
  },
  computed: {
    isValid() {
      return this.form.username.length >= 3
    },
    avatarPreviewStyle() {
      if (this.form.avatar) {
        return { backgroundImage: `url(${this.form.avatar})` }
      }
      return {}
    }
  },
  mounted() {
    // Verificar se veio da etapa 1
    const tempUser = localStorage.getItem('usuario_temp')
    if (!tempUser) {
      // Se não tem dados temporários, redirecionar para registrar etapa 1
      this.$router.push('/registrar')
      return
    }
    
    this.usuarioTemp = JSON.parse(tempUser)
    
    // ✅ CORREÇÃO: Pegar ID de várias possíveis fontes (MongoDB usa _id)
    this.userId = this.usuarioTemp._id || this.usuarioTemp.id
    
    if (!this.userId) {
      this.erro = "Erro: ID do usuário não encontrado. Por favor, volte à etapa anterior."
      setTimeout(() => {
        this.$router.push('/registrar')
      }, 3000)
      return
    }
    
    // Sugerir username baseado no email
    if (this.usuarioTemp.email) {
      const suggestedUsername = this.usuarioTemp.email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
      this.form.username = suggestedUsername
    }
  },
  methods: {
    triggerAvatarUpload() {
      this.$refs.avatarInput.click()
    },
    
    handleAvatarChange(event) {
      const file = event.target.files[0]
      if (!file) return
      
      // Validar tipo e tamanho
      if (!file.type.startsWith('image/')) {
        this.erro = "Por favor, selecione uma imagem válida"
        setTimeout(() => this.erro = "", 3000)
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        this.erro = "A imagem deve ter no máximo 5MB"
        setTimeout(() => this.erro = "", 3000)
        return
      }
      
      // Converter para base64 (em produção, envie para servidor/S3)
      const reader = new FileReader()
      reader.onload = (e) => {
        this.form.avatar = e.target.result
      }
      reader.readAsDataURL(file)
    },
    
    async completarPerfil() {
      this.loading = true
      this.erro = ""
      this.mensagem = ""

      if (!this.isValid) {
        this.erro = "Escolha um nome de usuário válido (mínimo 3 caracteres)"
        this.loading = false
        return
      }

      // ✅ CORREÇÃO: Verificar se temos ID antes de fazer a requisição
      if (!this.userId) {
        this.erro = "Erro: ID do usuário não encontrado"
        this.loading = false
        return
      }

      try {
        // Atualizar usuário no backend com dados completos
        const token = localStorage.getItem("token")

        const response = await axios.put(
          `http://localhost:3002/usuarios/${this.userId}`,
          {
            username: this.form.username,
            bio: this.form.bio,
            localizacao: this.form.localizacao,
            avatar: this.form.avatar,
            cover: this.form.cover
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const userDataCompleto = response.data.user
        
        // Salvar dados completos no localStorage
        localStorage.setItem("usuario", JSON.stringify(userDataCompleto))
        localStorage.setItem("usuario_perfil", JSON.stringify(userDataCompleto))
        localStorage.setItem("isLoggedIn", "true")
        
        // Remover dados temporários
        localStorage.removeItem('usuario_temp')
        
        // Disparar evento para atualizar navbar
        window.dispatchEvent(new CustomEvent('user-logged-in', {
          detail: userDataCompleto
        }))

        this.mensagem = "Perfil completo! Redirecionando..."
        
        // ✅ ALTERAÇÃO: Redirecionar para "Feito Para Você" em vez do perfil
        setTimeout(() => {
          this.$router.push("/feitoparavoce")
        }, 1500)

      } catch (err) {
        this.erro = err.response?.data?.error || "Erro ao salvar perfil. Tente novamente."
        setTimeout(() => this.erro = "", 5000)
      } finally {
        this.loading = false
      }
    },

    async buscarCEP() {
      const cep = this.form.cep.replace(/\D/g, '')

      if (cep.length !== 8) return

      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)

        if (res.data.erro) {
          this.erro = "CEP não encontrado"
          return
        }

        this.form.rua = res.data.logradouro
        this.form.bairro = res.data.bairro
        this.form.cidade = res.data.localidade
        this.form.estado = res.data.uf

        this.atualizarLocalizacao()

      } catch (err) {
        this.erro = "Erro ao buscar CEP"
      }
    },
    
    atualizarLocalizacao() {
      this.form.localizacao = `${this.form.rua}, ${this.form.numero} - ${this.form.bairro}, ${this.form.cidade} - ${this.form.estado}`
    }, 
    
    pularEtapa() {
      // Usar dados básicos e redirecionar
      if (this.usuarioTemp) {
        localStorage.setItem("usuario", JSON.stringify(this.usuarioTemp))
        localStorage.setItem("usuario_perfil", JSON.stringify(this.usuarioTemp))
        localStorage.setItem("isLoggedIn", "true")
        localStorage.removeItem('usuario_temp')
        
        window.dispatchEvent(new CustomEvent('user-logged-in', {
          detail: this.usuarioTemp
        }))
      }
      
      // ✅ ALTERAÇÃO: Redirecionar para "Feito Para Você" também ao pular
      this.$router.push("/feitoparavoce")
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
  max-width: 480px;
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
  margin-bottom: 32px;
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

.step.completed .step-number {
  background: #22c55e;
  color: white;
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

.step-line.completed {
  background: #22c55e;
}

/* Brand Section */
.brand-section {
  text-align: center;
  margin-bottom: 32px;
}

/* Avatar Upload */
.avatar-upload {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  cursor: pointer;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload:hover .avatar-preview {
  transform: scale(1.05);
  border-color: rgba(99, 102, 241, 0.5);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  opacity: 0;
  transition: all 0.3s ease;
  color: white;
}

.avatar-overlay i {
  font-size: 24px;
}

.avatar-overlay span {
  font-size: 11px;
  font-weight: 500;
}

.avatar-upload:hover .avatar-overlay {
  opacity: 1;
}

h1 {
  font-size: 1.75rem;
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

.textarea-wrapper {
  align-items: flex-start;
}

.input-icon {
  position: absolute;
  left: 16px;
  font-size: 1.25rem;
  z-index: 2;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.textarea-icon {
  top: 16px;
}

.input-group.focused .input-icon {
  opacity: 1;
  transform: scale(1.1);
}

input, textarea {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
  resize: none;
}

textarea {
  padding-top: 16px;
  min-height: 100px;
}

input:focus, textarea:focus {
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-group.focused input,
.input-group.focused textarea {
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

.textarea-wrapper label {
  top: 16px;
  transform: none;
}

input:focus + label,
input:not(:placeholder-shown) + label,
.input-group.filled label,
textarea:focus + label,
textarea:not(:placeholder-shown) + label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #6366f1;
  background: #111827;
  font-weight: 500;
}

.textarea-wrapper textarea:focus + label,
.textarea-wrapper.input-group.filled label {
  transform: translateY(-50%) scale(0.85);
}

.hint {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 6px;
  display: block;
  padding: 0 4px;
}

.char-count {
  font-size: 0.75rem;
  color: #64748b;
  text-align: right;
  margin-top: 6px;
  display: block;
  padding: 0 4px;
}

/* Cover Preview */
.cover-preview {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Submit Button */
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
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.4);
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

/* Skip Button */
.skip-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: underline;
  text-decoration-color: transparent;
}

.skip-btn:hover:not(:disabled) {
  color: #94a3b8;
  text-decoration-color: #94a3b8;
}

.skip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Responsive */
@media (max-width: 480px) {
  .card {
    padding: 24px 20px 32px;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .avatar-upload {
    width: 100px;
    height: 100px;
  }
  
  .step-line {
    width: 40px;
  }
}
</style>