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

      <button class="back-btn" @click="voltar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

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

        <div class="step-line"></div>

        <div class="step">
          <div class="step-number">3</div>
          <span class="step-label">Preferências</span>
        </div>
      </div>

      <!-- Header -->
      <div class="brand-section">
        <div class="avatar-upload" @click="triggerAvatarUpload">
          <div class="avatar-preview" :style="avatarPreviewStyle">
            <img v-if="form.avatar" :src="form.avatar" alt="Avatar" />
            <i v-else class="fas fa-camera"></i>
          </div>
          <div class="avatar-overlay">
            <i class="fas fa-camera"></i>
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

      <form @submit.prevent="completarPerfil" class="form-content" novalidate>
        <!-- Username (OBRIGATÓRIO) -->
        <div class="input-group" :class="{ 'focused': focused === 'username', 'filled': form.username, 'error': errors.username }">
          <div class="input-wrapper">
            <span class="input-icon"><i class="fas fa-at"></i></span>
            <input 
              v-model="form.username" 
              type="text" 
              @focus="focused = 'username'"
              @blur="focused = null"
              placeholder=" "
              maxlength="30"
            />
            <label>Nome de usuário *</label>
          </div>
          <span class="hint">Este será seu identificador único</span>
          <span class="error-text" v-if="errors.username">{{ errors.username }}</span>
        </div>

        <!-- Bio (OBRIGATÓRIO) -->
        <div class="input-group" :class="{ 'focused': focused === 'bio', 'filled': form.bio, 'error': errors.bio }">
          <div class="input-wrapper textarea-wrapper">
            <span class="input-icon textarea-icon"><i class="fas fa-pen"></i></span>
            <textarea 
              v-model="form.bio" 
              @focus="focused = 'bio'"
              @blur="focused = null"
              placeholder=" "
              maxlength="150"
              rows="3"
            ></textarea>
            <label>Sobre você *</label>
          </div>
          <span class="char-count">{{ form.bio.length }}/150</span>
          <span class="error-text" v-if="errors.bio">{{ errors.bio }}</span>
        </div>

        <!-- CEP (OBRIGATÓRIO) -->
        <div class="input-group" :class="{ 'focused': focused === 'cep', 'filled': form.cep, 'error': errors.cep }">
          <div class="input-wrapper">
            <span class="input-icon"><i class="fas fa-map-marker-alt"></i></span>
            <input 
              v-model="form.cep"
              type="text"
              maxlength="9"
              @focus="focused = 'cep'"
              @blur="buscarCEP"
              placeholder=" "
            />
            <label>CEP *</label>
          </div>
          <span class="error-text" v-if="errors.cep">{{ errors.cep }}</span>
        </div>

        <!-- Rua -->
        <div class="input-group" :class="{ 'focused': focused === 'rua', 'filled': form.rua }">
          <div class="input-wrapper">
            <span class="input-icon"><i class="fas fa-road"></i></span>
            <input 
              v-model="form.rua" 
              type="text" 
              @focus="focused = 'rua'"
              @blur="focused = null"
              placeholder=" " 
            />
            <label>Rua</label>
          </div>
        </div>

        <!-- Número -->
        <div class="input-group" :class="{ 'focused': focused === 'numero', 'filled': form.numero }">
          <div class="input-wrapper">
            <span class="input-icon"><i class="fas fa-hashtag"></i></span>
            <input 
              v-model="form.numero" 
              @input="atualizarLocalizacao" 
              type="text" 
              @focus="focused = 'numero'"
              @blur="focused = null"
              placeholder=" " 
            />
            <label>Número</label>
          </div>
        </div>

        <!-- Bairro -->
        <div class="input-group" :class="{ 'focused': focused === 'bairro', 'filled': form.bairro }">
          <div class="input-wrapper">
            <span class="input-icon"><i class="fas fa-map-pin"></i></span>
            <input 
              v-model="form.bairro" 
              type="text" 
              @focus="focused = 'bairro'"
              @blur="focused = null"
              placeholder=" " 
            />
            <label>Bairro</label>
          </div>
        </div>

        <!-- Cidade -->
        <div class="input-group" :class="{ 'focused': focused === 'cidade', 'filled': form.cidade }">
          <div class="input-wrapper">
            <span class="input-icon"><i class="fas fa-city"></i></span>
            <input 
              v-model="form.cidade" 
              type="text" 
              @focus="focused = 'cidade'"
              @blur="focused = null"
              placeholder=" " 
            />
            <label>Cidade</label>
          </div>
        </div>

        <!-- Estado -->
        <div class="input-group" :class="{ 'focused': focused === 'estado', 'filled': form.estado }">
          <div class="input-wrapper">
            <span class="input-icon"><i class="fas fa-flag"></i></span>
            <input 
              v-model="form.estado" 
              type="text" 
              @focus="focused = 'estado'"
              @blur="focused = null"
              placeholder=" " 
            />
            <label>Estado</label>
          </div>
        </div>

        <!-- Cover Image URL -->
        <div class="input-group" :class="{ 'focused': focused === 'cover', 'filled': form.cover }">
          <div class="input-wrapper">
            <span class="input-icon"><i class="fas fa-image"></i></span>
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
        <button type="submit" :disabled="loading" class="submit-btn">
          <span class="btn-content" v-if="!loading">
            <span>Finalizar Cadastro</span>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
          <span v-else class="loading-spinner">
            <span class="spinner"></span>
            <span>Criando conta...</span>
          </span>
        </button>

        <!-- Pular etapa -->
        <button type="button" class="skip-btn" @click="pularEtapa" :disabled="loading">
          Pular por agora
        </button>
      </form>
              <!-- Alert Messages (estilo login) -->
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
        cep: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        localizacao: ""
      },
      loading: false,
      focused: null,
      etapa1Dados: null,
      errors: {},
          mensagem: "",
      erro: ""
    }
  },
  computed: {
    isValid() {
      return this.form.username.length >= 3 && 
             this.form.bio.length > 0 && 
             this.form.cep.replace(/\\D/g, '').length === 8
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
    const dadosEtapa1 = localStorage.getItem('registrar_etapa1_dados')
    if (!dadosEtapa1) {
      this.showAlert('error', 'Complete a etapa 1 primeiro. Redirecionando...')
      setTimeout(() => {
        this.$router.push('/registrar')
      }, 2000)
      return
    }

    this.etapa1Dados = JSON.parse(dadosEtapa1)

    // Sugerir username baseado no email
    if (this.etapa1Dados.email) {
      const suggestedUsername = this.etapa1Dados.email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
      this.form.username = suggestedUsername
    }

    // Recuperar dados salvos da etapa 2 se existirem
    const dadosEtapa2 = localStorage.getItem('registrar_etapa2_dados')
    if (dadosEtapa2) {
      try {
        const dados = JSON.parse(dadosEtapa2)
        Object.assign(this.form, dados)
      } catch (e) {
        console.error('Erro ao recuperar dados da etapa 2:', e)
      }
    }
  },
  methods: {
     showAlert(type, message) {
      this.mensagem = ""
      this.erro = ""
      if (type === 'success') {
        this.mensagem = message
      } else {
        this.erro = message
      }
      // Auto-limpar após 5 segundos
      setTimeout(() => {
        this.mensagem = ""
        this.erro = ""
      }, 5000)
    },

    triggerAvatarUpload() {
      this.$refs.avatarInput.click()
    },

    voltar() {
      // Salvar dados atuais da etapa 2 para recuperar ao voltar
      localStorage.setItem('registrar_etapa2_dados', JSON.stringify(this.form))
      this.$router.push('/registrar')
    },

    handleAvatarChange(event) {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        this.showAlert('error', 'Por favor, selecione uma imagem válida')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
       this.showAlert('error', 'A imagem deve ter no máximo 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        this.form.avatar = e.target.result
        this.showAlert('success', 'Avatar carregado com sucesso!')
      }
      reader.readAsDataURL(file)
    },

    async validateForm() {
      this.errors = {}
      let isValid = true

      // Username
      if (!this.form.username || this.form.username.length < 3) {
        this.errors.username = 'Nome de usuário é obrigatório (mínimo 3 caracteres)'
        isValid = false
      }

      // Bio
      if (!this.form.bio || this.form.bio.trim().length === 0) {
        this.errors.bio = 'A bio é obrigatória'
        isValid = false
      }

      // CEP - validação de formato
      const cepLimpo = this.form.cep.replace(/\D/g, '')
      if (!cepLimpo || cepLimpo.length !== 8) {
        this.errors.cep = 'CEP é obrigatório (8 dígitos)'
        isValid = false
      } else {
        // NOVO: validar CEP via API antes de prosseguir
        try {
          const res = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)
          if (res.data.erro) {
            this.errors.cep = 'CEP não encontrado'
            isValid = false
          }
        } catch (err) {
          this.errors.cep = 'Erro ao validar CEP'
          isValid = false
        }
      }
if (!isValid) {
    this.showAlert('error', 'Preencha todos os campos obrigatórios corretamente.')
}
return isValid
    },

    async completarPerfil() {
      this.loading = true

      const isValid = await this.validateForm()
if (!isValid) {
        this.loading = false
    this.showAlert('error', 'Preencha todos os campos obrigatórios corretamente.')
        return
      }

      if (!this.etapa1Dados) {
       this.showAlert('error', 'Dados da etapa 1 não encontrados. Volte e preencha novamente.')
        this.loading = false
        setTimeout(() => {
          this.$router.push('/registrar')
        }, 2000)
        return
      }

      try {
        // ETAPA 1: Criar a conta no backend
        const registerResponse = await axios.post(
          "http://localhost:3002/usuarios/registrar",
          {
            nome: this.etapa1Dados.nome,
            email: this.etapa1Dados.email,
            senha: this.etapa1Dados.senha
          }
        )

        const userData = registerResponse.data.user
        const token = registerResponse.data.token

        // ETAPA 2: Atualizar o perfil com dados da etapa 2
        const userId = userData._id || userData.id

        const updateResponse = await axios.put(
          `http://localhost:3002/usuarios/${userId}`,
          {
            username: this.form.username,
            bio: this.form.bio,
            localizacao: this.form.localizacao,
            avatar: this.form.avatar,
            cover: this.form.cover,
            onboardingCompleto: false 
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const userDataCompleto = updateResponse.data.user

        // Limpar dados temporários e salvar sessão
        localStorage.setItem("usuario", JSON.stringify(userDataCompleto))
        localStorage.setItem("usuario_perfil", JSON.stringify(userDataCompleto))
        localStorage.setItem("token", token)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.removeItem('usuario_temp')
        localStorage.setItem("onboardingStep", "2")   
        localStorage.removeItem('registrar_etapa1_dados')
        localStorage.removeItem('registrar_etapa2_dados')

        window.dispatchEvent(new CustomEvent('user-logged-in', {
          detail: userDataCompleto
        }))

        this.showAlert('success', 'Conta criada com sucesso! Redirecionando...')

        setTimeout(() => {
          this.$router.push("/feitoparavoce")
        }, 1500)

      } catch (err) {
        const errorMsg = err.response?.data?.error || "Erro ao criar conta. Tente novamente."
       this.showAlert('error', errorMsg)
      } finally {
        this.loading = false
      }
    },

    async buscarCEP() {
      const cep = this.form.cep.replace(/\\D/g, '')

      if (cep.length !== 8) {
        if (cep.length > 0) {
          this.errors.cep = 'CEP deve ter 8 dígitos'
        }
        return
      }

      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)

        if (res.data.erro) {
          this.errors.cep = 'CEP não encontrado'
          this.showAlert('error', 'CEP não encontrado. Preencha manualmente.')
          return
        }

        this.form.rua = res.data.logradouro
        this.form.bairro = res.data.bairro
        this.form.cidade = res.data.localidade
        this.form.estado = res.data.uf
        this.errors.cep = ''

        this.atualizarLocalizacao()
        this.showAlert('success', 'Endereço encontrado!')

      } catch (err) {
        this.showAlert('error', 'Erro ao buscar CEP. Tente novamente.')
      }
    },

    atualizarLocalizacao() {
      this.form.localizacao = `${this.form.rua}, ${this.form.numero} - ${this.form.bairro}, ${this.form.cidade} - ${this.form.estado}`
    }, 

    async pularEtapa() {
      if (!this.etapa1Dados) {
       this.showAlert('error', 'Dados da etapa 1 não encontrados')
        return
      }

      this.loading = true

      try {
        // Criar conta mesmo pulando a etapa 2
        const registerResponse = await axios.post(
          "http://localhost:3002/usuarios/registrar",
          {
            nome: this.etapa1Dados.nome,
            email: this.etapa1Dados.email,
            senha: this.etapa1Dados.senha
          }
        )

        const userData = registerResponse.data.user
        const token = registerResponse.data.token

        localStorage.setItem("usuario", JSON.stringify(userData))
        localStorage.setItem("usuario_perfil", JSON.stringify(userData))
        localStorage.setItem("token", token)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("onboardingStep", "2") 
        localStorage.removeItem('registrar_etapa1_dados')
        localStorage.removeItem('registrar_etapa2_dados')

        window.dispatchEvent(new CustomEvent('user-logged-in', {
          detail: userData
        }))

       this.showAlert('success', 'Conta criada! Você pode completar seu perfil depois.')

        setTimeout(() => {
          this.$router.push("/feitoparavoce")
        }, 1500)

      } catch (err) {
        const errorMsg = err.response?.data?.error || "Erro ao criar conta. Tente novamente."
       this.showAlert('error', errorMsg)
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

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: 20;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.back-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  color: white;
  transform: translateX(-3px);
}

.back-btn:active {
  transform: scale(0.95);
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

.input-group.error input,
.input-group.error textarea {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
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
  font-size: 1rem;
  z-index: 2;
  transition: all 0.3s ease;
  opacity: 0.6;
  color: #94a3b8;
}

.textarea-icon {
  top: 16px;
}

.input-group.focused .input-icon {
  opacity: 1;
  color: #6366f1;
  transform: scale(1.1);
}

.input-group.error .input-icon {
  color: #ef4444;
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

.input-group.error label {
  color: #ef4444;
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

.error-text {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 4px;
  display: block;
  padding: 0 4px;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
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
/* Alert Messages (estilo login) */
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

  .toast-container {
    left: 16px;
    right: 16px;
    max-width: none;
  }
}
</style>