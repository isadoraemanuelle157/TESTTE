<template>
  <div class="soundup-container">
    <!-- Dynamic Animated Background -->
    <div class="ambient-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
      <div class="blob blob-4"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Header -->
    <header class="soundup-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon soundup-gradient">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <!-- SoundUp Icon - Sound Wave + Up Arrow -->
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 6v6l4.5 2.7.75-1.23-3.75-2.22V6H12z"/>
              <path d="M7 12c0-2.76 2.24-5 5-5v1.5c-1.93 0-3.5 1.57-3.5 3.5S10.07 15.5 12 15.5v1.5c-2.76 0-5-2.24-5-5z"/>
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4v-1.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 10.5 12 10.5V8z"/>
              <!-- Up Arrow -->
              <path d="M16 6l-1.41 1.41L16.17 9H9v2h7.17l-1.58 1.59L16 14l4-4-4-4z" transform="rotate(-45 16 10)"/>
            </svg>
          </div>
          <div class="title-section">
            <h1>Artistas</h1>
            <p class="subtitle">Seus cantores favoritos</p>
          </div>
        </div>
        <button @click="abrirModalCriar" class="btn-soundup">
          <span class="btn-icon">+</span>
          <span class="btn-text">Adicionar</span>
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-soundup">
      <div class="vinyl-loader">
        <div class="vinyl-grooves"></div>
        <div class="vinyl-label soundup-gradient"></div>
        <div class="tonearm"></div>
      </div>
      <p>Carregando artistas...</p>
    </div>

    <!-- Artists Grid - SoundUp Style -->
    <div v-else class="artists-grid">
      <!-- Add Artist Card -->
      <div class="artist-card add-card" @click="abrirModalCriar">
        <div class="circle-container">
          <div class="add-circle">
            <div class="plus-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
          </div>
        </div>
        <h3 class="artist-name">Novo Artista</h3>
        <p class="artist-meta">Adicionar cantor</p>
      </div>

      <!-- Artist Cards -->
      <div 
        v-for="cantor in cantores" 
        :key="cantor._id" 
        class="artist-card"
        @mouseenter="hoveredCard = cantor._id"
        @mouseleave="hoveredCard = null"
      >
        <!-- SoundUp Circle Image -->
        <div class="circle-container">
          <!-- Glow Effect -->
          <div class="circle-glow" :style="getGlowStyle(cantor.foto)"></div>
          
          <!-- Main Circle -->
          <div class="artist-circle" :class="{ 'playing': hoveredCard === cantor._id }">
            <div class="circle-inner">
              <img 
                v-if="cantor.foto" 
                :src="cantor.foto" 
                :alt="cantor.nome"
                class="artist-image"
                @error="handleImageError"
              />
              <div v-else class="artist-initials soundup-gradient">
                <span>{{ getIniciais(cantor.nome) }}</span>
              </div>
            </div>
            
            <!-- Hover Overlay with Edit Button -->
            <div class="circle-overlay">
              <button class="play-btn soundup-gradient" @click.stop="editarCantor(cantor)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V6.75c0-.76.46-1.45 1.17-1.75.71-.3 1.53-.13 2.06.43l5.25 5.25 5.25-5.25c.53-.56 1.35-.73 2.06-.43.71.3 1.17.99 1.17 1.75v10.5c0 .76-.46 1.45-1.17 1.75-.71.3-1.53.13-2.06-.43L12 13.5l-5.25 5.25c-.53.56-1.35.73-2.06.43-.71-.3-1.17-.99-1.17-1.75z"/>
                </svg>
                <span class="edit-tooltip">Editar</span>
              </button>
            </div>
          </div>

          <!-- Audio Wave Animation -->
          <div class="audio-wave" v-if="hoveredCard === cantor._id">
            <span v-for="n in 5" :key="n" :style="{ animationDelay: (n * 0.1) + 's' }"></span>
          </div>
        </div>

        <!-- Artist Info -->
        <div class="artist-info-row">
          <div class="artist-info-text">
            <h3 class="artist-name">{{ cantor.nome }}</h3>
            <p class="artist-meta">
              <span class="verified-badge soundup-gradient" v-if="hoveredCard === cantor._id">✓</span>
              Artista • {{ formatarData(cantor.createdAt) }}
            </p>
          </div>
          
          <!-- Delete Button - Always Visible -->
          <button 
            class="delete-btn-visible" 
            @click.stop="confirmarExclusao(cantor)"
            title="Excluir artista"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && cantores.length === 0" class="empty-soundup">
      <div class="empty-vinyl">
        <div class="vinyl-disc">
          <div class="vinyl-hole soundup-gradient"></div>
        </div>
      </div>
      <h2>Nenhum artista ainda</h2>
      <p>Adicione seus cantores favoritos para começar</p>
      <button @click="abrirModalCriar" class="btn-soundup large">
        Adicionar Primeiro Artista
      </button>
    </div>

    <!-- Create/Edit Modal - SoundUp Style -->
    <transition name="modal">
      <div v-if="showModal" class="modal-soundup" @click.self="fecharModal">
        <div class="modal-content">
          <button @click="fecharModal" class="modal-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <h2>{{ modoEdicao ? 'Editar Artista' : 'Novo Artista' }}</h2>

          <form @submit.prevent="salvarCantor">
            <!-- SoundUp Style Image Upload -->
            <div class="upload-soundup">
              <div 
                class="upload-circle" 
                @click="triggerFileInput"
                :class="{ 'has-image': previewFoto || form.foto }"
              >
                <img 
                  v-if="previewFoto || form.foto" 
                  :src="previewFoto || form.foto" 
                  alt="Preview"
                />
                <div v-else class="upload-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Escolher foto</span>
                </div>
                <div class="upload-hover soundup-gradient">
                  <span>Alterar</span>
                </div>
              </div>
              
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*" 
                @change="handleFileChange"
                hidden
              />
              
              <button 
                v-if="previewFoto || form.foto" 
                type="button" 
                @click="removerFoto"
                class="btn-remove"
              >
                Remover foto
              </button>
            </div>

            <!-- Form Fields -->
            <div class="form-soundup">
              <div class="input-group">
                <label>Nome</label>
                <input 
                  v-model="form.nome" 
                  type="text" 
                  placeholder="Nome do artista"
                  required
                  maxlength="100"
                />
              </div>

              <div class="input-group">
                <label>URL da imagem (opcional)</label>
                <input 
                  v-model="form.foto" 
                  type="url" 
                  placeholder="https://..."
                  @input="previewFoto = null"
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="button" @click="fecharModal" class="btn-cancel">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn-save soundup-gradient"
                :disabled="salvando || !form.nome.trim()"
              >
                <span v-if="salvando" class="spinner"></span>
                {{ salvando ? 'Salvando...' : (modoEdicao ? 'Salvar' : 'Criar') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete Modal -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-soundup" @click.self="showDeleteModal = false">
        <div class="modal-content modal-small">
          <div class="delete-icon">🗑️</div>
          <h2>Excluir {{ cantorParaExcluir?.nome }}?</h2>
          <p>Esta ação não pode ser desfeita.</p>
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="btn-cancel">
              Cancelar
            </button>
            <button 
              @click="excluirCantor" 
              class="btn-delete"
              :disabled="excluindo"
            >
              <span v-if="excluindo" class="spinner"></span>
              {{ excluindo ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification - SoundUp Style -->
    <transition name="toast">
      <div v-if="toast.show" :class="['toast-soundup', toast.type]">
        <div class="toast-icon">{{ toast.icon }}</div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'CantoresSoundUp',
  
  data() {
    return {
      cantores: [],
      loading: true,
      hoveredCard: null,
      
      showModal: false,
      modoEdicao: false,
      cantorEditando: null,
      
      form: {
        nome: '',
        foto: ''
      },
      previewFoto: null,
      arquivoSelecionado: null,
      
      salvando: false,
      excluindo: false,
      
      showDeleteModal: false,
      cantorParaExcluir: null,
      
      toast: {
        show: false,
        message: '',
        type: 'success',
        icon: '✅'
      }
    }
  },

  mounted() {
    this.carregarCantores()
  },

  methods: {
    // Extrair cor dominante para glow (simulado)
    getGlowStyle(foto) {
      // Cores azul baseadas na nova paleta
      const colors = [
        'radial-gradient(circle, rgba(37,99,235,0.5) 0%, transparent 70%)',
        'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 70%)',
        'radial-gradient(circle, rgba(96,165,250,0.5) 0%, transparent 70%)',
        'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)'
      ]
      const index = foto ? foto.length % colors.length : 0
      return { background: colors[index] }
    },

    async carregarCantores() {
      try {
        this.loading = true
        const response = await fetch('http://localhost:3002/cantores')
        if (!response.ok) throw new Error('Erro ao carregar')
        this.cantores = await response.json()
      } catch (error) {
        this.mostrarToast('Erro ao carregar artistas', 'error', '❌')
      } finally {
        this.loading = false
      }
    },

    async salvarCantor() {
      if (!this.form.nome.trim()) return
      
      try {
        this.salvando = true
        let fotoUrl = this.form.foto
        
        if (this.arquivoSelecionado) {
          fotoUrl = await this.converterParaBase64(this.arquivoSelecionado)
        }

        const dados = {
          nome: this.form.nome.trim(),
          foto: fotoUrl
        }

        let response
        
        if (this.modoEdicao) {
          response = await fetch(`http://localhost:3002/cantores/${this.cantorEditando._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
          })
          this.mostrarToast('Artista atualizado!', 'success', '✅')
        } else {
          response = await fetch('http://localhost:3002/cantores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
          })
          this.mostrarToast('Artista adicionado!', 'success', '✅')
        }

        this.fecharModal()
        this.carregarCantores()
      } catch (error) {
        this.mostrarToast(error.message, 'error', '❌')
      } finally {
        this.salvando = false
      }
    },

    async excluirCantor() {
      try {
        this.excluindo = true
        await fetch(`http://localhost:3002/cantores/${this.cantorParaExcluir._id}`, {
          method: 'DELETE'
        })
        this.mostrarToast('Artista removido', 'success', '🗑️')
        this.showDeleteModal = false
        this.carregarCantores()
      } catch (error) {
        this.mostrarToast(error.message, 'error', '❌')
      } finally {
        this.excluindo = false
        this.cantorParaExcluir = null
      }
    },

    converterParaBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        this.mostrarToast('Selecione uma imagem válida', 'error', '⚠️')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        this.mostrarToast('Máximo 5MB', 'error', '⚠️')
        return
      }

      this.arquivoSelecionado = file
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewFoto = e.target.result
        this.form.foto = ''
      }
      reader.readAsDataURL(file)
    },

    removerFoto() {
      this.previewFoto = null
      this.arquivoSelecionado = null
      this.form.foto = ''
    },

    handleImageError(event) {
      event.target.style.display = 'none'
      event.target.parentElement.classList.add('fallback')
    },

    abrirModalCriar() {
      this.modoEdicao = false
      this.cantorEditando = null
      this.resetForm()
      this.showModal = true
    },

    editarCantor(cantor) {
      this.modoEdicao = true
      this.cantorEditando = cantor
      this.form = { nome: cantor.nome, foto: cantor.foto || '' }
      this.previewFoto = null
      this.arquivoSelecionado = null
      this.showModal = true
    },

    fecharModal() {
      this.showModal = false
      this.resetForm()
    },

    resetForm() {
      this.form = { nome: '', foto: '' }
      this.previewFoto = null
      this.arquivoSelecionado = null
    },

    confirmarExclusao(cantor) {
      this.cantorParaExcluir = cantor
      this.showDeleteModal = true
    },

    getIniciais(nome) {
      return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    },

    formatarData(data) {
      if (!data) return ''
      return new Date(data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
    },

    mostrarToast(message, type = 'success', icon = '✅') {
      this.toast = { show: true, message, type, icon }
      setTimeout(() => this.toast.show = false, 3000)
    }
  }
}
</script>

<style scoped>
/* SoundUp Design System - Nova Paleta Azul Escuro */
:root {
  --soundup-bg-primary: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
  --soundup-black: #050508;
  --soundup-blue-dark: #0a0a1a;
  --soundup-blue-light: #0a1a3f;
  --soundup-blue-accent: #2563eb;
  --soundup-blue-bright: #3b82f6;
  --soundup-blue-soft: #60a5fa;
  --soundup-border: rgba(37, 99, 235, 0.1);
  --soundup-white: #FFFFFF;
  --soundup-gray: #94a3b8;
}

.soundup-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
  color: var(--soundup-white);
  font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
}

/* SoundUp Gradient - Azul */
.soundup-gradient {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
}

/* Animated Background */
.ambient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.2;
  animation: float 15s infinite ease-in-out;
}

.blob-1 {
  width: 600px;
  height: 600px;
  background: #2563eb;
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: #1e40af;
  bottom: 20%;
  left: -100px;
  animation-delay: -5s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: #3b82f6;
  top: 40%;
  right: 30%;
  animation-delay: -10s;
}

.blob-4 {
  width: 350px;
  height: 350px;
  background: #1d4ed8;
  bottom: -100px;
  right: 20%;
  animation-delay: -7s;
}

.noise-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Header */
.soundup-header {
  position: relative;
  z-index: 1;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(37, 99, 235, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--soundup-white);
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
}

.title-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--soundup-gray);
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}

/* SoundUp Button */
.btn-soundup {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
  color: var(--soundup-white);
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 500px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  transform: scale(1);
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
}

.btn-soundup:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.6);
}

.btn-soundup.large {
  padding: 1rem 2.5rem;
  font-size: 1rem;
}

.btn-icon {
  font-size: 1.25rem;
  font-weight: 300;
}

/* Loading - Vinyl Style */
.loading-soundup {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  color: var(--soundup-gray);
}

.vinyl-loader {
  width: 120px;
  height: 120px;
  position: relative;
  margin-bottom: 1.5rem;
}

.vinyl-grooves {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #0a0a1a 0px,
    #0a0a1a 2px,
    #050508 3px,
    #050508 4px
  );
  animation: spin 2s linear infinite;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 8px solid #0a0a1a;
}

.tonearm {
  position: absolute;
  top: -10px;
  right: 20px;
  width: 4px;
  height: 60px;
  background: #2563eb;
  transform-origin: top;
  animation: tonearmMove 2s ease-in-out infinite;
  border-radius: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes tonearmMove {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(5deg); }
}

/* Artists Grid */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
  position: relative;
  z-index: 1;
}

/* Artist Card - SoundUp Style */
.artist-card {
  background: rgba(10, 10, 26, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.artist-card:hover {
  background: rgba(10, 26, 63, 0.4);
  transform: translateY(-5px);
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 10px 40px rgba(37, 99, 235, 0.2);
}

/* Circle Container */
.circle-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 1rem;
}

/* Glow Effect */
.circle-glow {
  position: absolute;
  top: -10%;
  left: -10%;
  right: -10%;
  bottom: -10%;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  filter: blur(20px);
}

.artist-card:hover .circle-glow {
  opacity: 1;
}

/* Main Circle - SoundUp Style */
.artist-circle {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
}

.artist-circle.playing {
  box-shadow: 0 0 0 2px #2563eb, 0 8px 32px rgba(37, 99, 235, 0.4);
}

.circle-inner {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #0a1a3f 0%, #050508 100%);
}

.artist-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.artist-card:hover .artist-image {
  transform: scale(1.1);
}

.artist-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 900;
  color: white;
}

/* Overlay with Edit Button */
.circle-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  background: rgba(5, 5, 8, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.artist-card:hover .circle-overlay {
  opacity: 1;
}

.play-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  color: var(--soundup-white);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: translateY(10px);
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  position: relative;
}

.play-btn:hover {
  transform: translateY(0) scale(1.1);
  filter: brightness(1.2);
}

.play-btn svg {
  width: 24px;
  height: 24px;
  transform: rotate(90deg);
}

.edit-tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(5, 5, 8, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
  border: 1px solid rgba(37, 99, 235, 0.3);
}

.play-btn:hover .edit-tooltip {
  opacity: 1;
}

/* Audio Wave Animation */
.audio-wave {
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
}

.audio-wave span {
  width: 4px;
  background: linear-gradient(180deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

.audio-wave span:nth-child(1) { height: 8px; }
.audio-wave span:nth-child(2) { height: 16px; }
.audio-wave span:nth-child(3) { height: 12px; }
.audio-wave span:nth-child(4) { height: 20px; }
.audio-wave span:nth-child(5) { height: 10px; }

@keyframes wave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
}

/* Artist Info Row with Delete Button */
.artist-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.artist-info-text {
  flex: 1;
  min-width: 0;
}

.artist-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--soundup-white);
}

.artist-meta {
  font-size: 0.875rem;
  color: var(--soundup-gray);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.verified-badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  color: var(--soundup-white);
  font-weight: 900;
}

/* Delete Button - Always Visible */
.delete-btn-visible {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(37, 99, 235, 0.2);
  background: rgba(10, 10, 26, 0.8);
  color: var(--soundup-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.delete-btn-visible:hover {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
  transform: scale(1.1);
}

.delete-btn-visible svg {
  width: 18px;
  height: 18px;
}

/* Add Card */
.add-card {
  background: transparent;
  border: 2px dashed rgba(37, 99, 235, 0.2);
}

.add-card:hover {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

.add-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(10, 10, 26, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-card:hover .add-circle {
  background: rgba(37, 99, 235, 0.1);
  transform: scale(1.05);
}

.plus-icon {
  width: 40px;
  height: 40px;
  color: var(--soundup-gray);
  transition: all 0.3s ease;
}

.add-card:hover .plus-icon {
  color: #2563eb;
  transform: scale(1.2);
}

/* Empty State */
.empty-soundup {
  text-align: center;
  padding: 5rem 2rem;
  position: relative;
  z-index: 1;
}

.empty-vinyl {
  width: 150px;
  height: 150px;
  margin: 0 auto 2rem;
  position: relative;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #0a0a1a 0px,
    #0a0a1a 3px,
    #050508 4px,
    #050508 5px
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.vinyl-hole {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid #0a1a3f;
}

.empty-soundup h2 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-soundup p {
  color: var(--soundup-gray);
  margin: 0 0 2rem 0;
}

/* Modal - SoundUp Style */
.modal-soundup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 5, 8, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: linear-gradient(180deg, #0a0a1a 0%, #050508 100%);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.modal-small {
  max-width: 350px;
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(37, 99, 235, 0.1);
  color: var(--soundup-gray);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(37, 99, 235, 0.2);
  color: var(--soundup-white);
  transform: rotate(90deg);
}

.modal-content h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 1.5rem 0;
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Upload SoundUp Style */
.upload-soundup {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.upload-circle {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: rgba(10, 10, 26, 0.8);
  border: 3px solid rgba(37, 99, 235, 0.2);
  transition: all 0.3s ease;
}

.upload-circle:hover {
  border-color: #2563eb;
  transform: scale(1.05);
}

.upload-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--soundup-gray);
  gap: 0.5rem;
}

.upload-placeholder svg {
  width: 40px;
  height: 40px;
}

.upload-hover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: var(--soundup-white);
  font-weight: 600;
}

.upload-circle:hover .upload-hover {
  opacity: 1;
}

.btn-remove {
  margin-top: 1rem;
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Form SoundUp */
.form-soundup {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--soundup-white);
}

.input-group input {
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(37, 99, 235, 0.2);
  background: rgba(10, 10, 26, 0.5);
  color: var(--soundup-white);
  font-size: 1rem;
  transition: all 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #2563eb;
  background: rgba(10, 10, 26, 0.8);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-group input::placeholder {
  color: var(--soundup-gray);
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 1rem;
}

.btn-cancel {
  flex: 1;
  padding: 0.875rem;
  border-radius: 500px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  background: transparent;
  color: var(--soundup-white);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  transform: scale(1.02);
}

.btn-save {
  flex: 2;
  padding: 0.875rem;
  border-radius: 500px;
  border: none;
  color: var(--soundup-white);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-save:hover:not(:disabled) {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-delete {
  flex: 1;
  padding: 0.875rem;
  border-radius: 500px;
  border: none;
  background: #dc2626;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover:not(:disabled) {
  transform: scale(1.02);
  background: #ef4444;
}

.delete-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Toast - SoundUp Style */
.toast-soundup {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  box-shadow: 0 10px 40px rgba(37, 99, 235, 0.3);
  z-index: 2000;
  animation: toastSlideUp 0.3s ease;
  color: white;
}

.toast-soundup.success {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
}

.toast-soundup.error {
  background: #dc2626;
  box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
}

@keyframes toastSlideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .soundup-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .title-section h1 {
    font-size: 1.75rem;
  }

  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .artist-card {
    padding: 1rem;
  }

  .delete-btn-visible {
    width: 32px;
    height: 32px;
  }

  .modal-content {
    padding: 1.5rem;
  }
}
</style>