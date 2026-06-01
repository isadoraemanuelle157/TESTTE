<template>
  <div class="avatar-selector">
    <!-- Avatar Atual -->
    <div class="current-avatar-section">
      <div class="avatar-preview-large" :style="previewStyle">
        <img v-if="currentAvatar && !isGeneratedAvatar" :src="currentAvatar" @error="onImageError" />
        <div v-else class="generated-avatar" :style="generatedStyle">
          {{ userInitials }}
        </div>
      </div>
      
      <div class="avatar-actions">
        <button class="btn-upload" @click="triggerFileUpload">
          <i class="fa fa-camera"></i> Enviar foto
        </button>
        <button class="btn-suggestions" @click="showSuggestions = !showSuggestions">
          <i class="fa fa-magic"></i> Sugestões
        </button>
      </div>
      
      <input 
        type="file" 
        ref="fileInput" 
        accept="image/*" 
        style="display: none" 
        @change="handleFileChange"
      />
    </div>

    <!-- Painel de Sugestões -->
    <transition name="slide-down">
      <div v-if="showSuggestions" class="suggestions-panel">
        
        <!-- Opção 1: Iniciais Geradas -->
        <div class="suggestion-section">
          <h4><i class="fa fa-font"></i> Iniciais do seu nome</h4>
          <div class="initials-grid">
            <div 
              v-for="(style, index) in initialsStyles" 
              :key="`initial-${index}`"
              class="initial-option"
              :class="{ active: selectedType === 'initial' && selectedIndex === index }"
              @click="selectInitials(index)"
            >
              <div class="initial-avatar" :style="style">
                {{ userInitials }}
              </div>
            </div>
          </div>
        </div>

        <!-- Opção 2: Avatares de Desenhos -->
        <div class="suggestion-section">
          <h4><i class="fa fa-paint-brush"></i> Avatares de desenhos</h4>
          <div class="illustration-grid">
            <div 
              v-for="(avatar, index) in illustrationAvatars" 
              :key="`illus-${index}`"
              class="illustration-option"
              :class="{ active: selectedType === 'illustration' && selectedIndex === index }"
              @click="selectIllustration(index)"
            >
              <img :src="avatar" :alt="`Avatar ${index + 1}`" />
            </div>
          </div>
        </div>

        <!-- Opção 3: Avatares Abstratos -->
        <div class="suggestion-section">
          <h4><i class="fa fa-shapes"></i> Formas abstratas</h4>
          <div class="abstract-grid">
            <div 
              v-for="(avatar, index) in abstractAvatars" 
              :key="`abstract-${index}`"
              class="abstract-option"
              :class="{ active: selectedType === 'abstract' && selectedIndex === index }"
              @click="selectAbstract(index)"
            >
              <img :src="avatar" :alt="`Abstract ${index + 1}`" />
            </div>
          </div>
        </div>

        <!-- Opção 4: Cores Sólidas com Gradientes -->
        <div class="suggestion-section">
          <h4><i class="fa fa-palette"></i> Cores e gradientes</h4>
          <div class="gradient-grid">
            <div 
              v-for="(gradient, index) in gradientStyles" 
              :key="`gradient-${index}`"
              class="gradient-option"
              :class="{ active: selectedType === 'gradient' && selectedIndex === index }"
              @click="selectGradient(index)"
            >
              <div class="gradient-preview" :style="gradient">
                <i class="fa fa-user"></i>
              </div>
            </div>
          </div>
        </div>

      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'AvatarSelector',
  
  props: {
    userName: { type: String, default: 'Usuário' },
    currentAvatar: { type: String, default: null },
    userId: { type: String, default: '' }
  },

  emits: ['select', 'upload'],

  data() {
    return {
      showSuggestions: false,
      selectedType: null,
      selectedIndex: null,
      imageError: false,
      
      // Cores para iniciais (baseadas no nome do usuário)
      colorPalettes: [
        { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', text: '#333' },
        { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', text: '#333' },
        { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', text: '#333' },
        { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)', text: '#fff' }
      ],

      // Avatares de ilustração (usando DiceBear API - gratuita)
      illustrationAvatars: [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=',
        'https://api.dicebear.com/7.x/bottts/svg?seed=',
        'https://api.dicebear.com/7.x/fun-emoji/svg?seed=',
        'https://api.dicebear.com/7.x/lorelei/svg?seed=',
        'https://api.dicebear.com/7.x/notionists/svg?seed=',
        'https://api.dicebear.com/7.x/open-peeps/svg?seed=',
        'https://api.dicebear.com/7.x/pixel-art/svg?seed=',
        'https://api.dicebear.com/7.x/adventurer/svg?seed='
      ],

      // Avatares abstratos (usando DiceBear shapes)
      abstractAvatars: [
        'https://api.dicebear.com/7.x/identicon/svg?seed=',
        'https://api.dicebear.com/7.x/initials/svg?seed=',
        'https://api.dicebear.com/7.x/shapes/svg?seed=',
        'https://api.dicebear.com/7.x/blobs/svg?seed='
      ]
    }
  },

  computed: {
    userInitials() {
      if (!this.userName) return 'U'
      return this.userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    // Gera uma cor consistente baseada no userId ou nome
    userColorIndex() {
      const str = this.userId || this.userName || 'default'
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      return Math.abs(hash) % this.colorPalettes.length
    },

    initialsStyles() {
      return this.colorPalettes.map(palette => ({
        background: palette.bg,
        color: palette.text
      }))
    },

    generatedStyle() {
      return this.initialsStyles[this.userColorIndex]
    },

    isGeneratedAvatar() {
      return !this.currentAvatar || this.currentAvatar.includes('ui-avatars.com')
    },

    previewStyle() {
      if (this.selectedType === 'initial') {
        return { background: this.initialsStyles[this.selectedIndex].background }
      }
      if (this.selectedType === 'gradient') {
        return { background: this.gradientStyles[this.selectedIndex].background }
      }
      return {}
    },

    gradientStyles() {
      return [
        { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
        { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
        { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
        { background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
      ]
    }
  },

  mounted() {
    // Pré-carregar avatares com seed única baseada no usuário
    const seed = this.userId || this.userName || 'user'
    this.illustrationAvatars = this.illustrationAvatars.map(url => `${url}${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`)
    this.abstractAvatars = this.abstractAvatars.map(url => `${url}${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`)
  },

  methods: {
    onImageError() {
      this.imageError = true
    },

    triggerFileUpload() {
      this.$refs.fileInput.click()
    },

    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.$emit('upload', file)
        this.selectedType = 'upload'
        this.selectedIndex = null
      }
    },

    selectInitials(index) {
      this.selectedType = 'initial'
      this.selectedIndex = index
      const style = this.initialsStyles[index]
      
      // Cria uma imagem data URI com as iniciais
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${this.extractColor(style.background, 0)};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${this.extractColor(style.background, 1)};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill="url(#grad)"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
                fill="${style.color}" text-anchor="middle" dy=".35em">${this.userInitials}</text>
        </svg>
      `
      const dataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
      this.$emit('select', dataUri)
    },

    selectIllustration(index) {
      this.selectedType = 'illustration'
      this.selectedIndex = index
      this.$emit('select', this.illustrationAvatars[index])
    },

    selectAbstract(index) {
      this.selectedType = 'abstract'
      this.selectedIndex = index
      this.$emit('select', this.abstractAvatars[index])
    },

    selectGradient(index) {
      this.selectedType = 'gradient'
      this.selectedIndex = index
      const style = this.gradientStyles[index]
      
      // Cria um avatar com gradiente e ícone
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${this.extractColor(style.background, 0)};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${this.extractColor(style.background, 1)};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill="url(#grad)"/>
          <circle cx="100" cy="85" r="35" fill="rgba(255,255,255,0.9)"/>
          <path d="M50 170 Q100 120 150 170" stroke="rgba(255,255,255,0.9)" stroke-width="8" fill="none"/>
        </svg>
      `
      const dataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
      this.$emit('select', dataUri)
    },

    extractColor(gradient, index) {
      // Extrai cores do gradiente CSS
      const matches = gradient.match(/#[a-fA-F0-9]{6}/g)
      return matches ? matches[index] || matches[0] : '#667eea'
    },

    // Método público para obter avatar padrão
    getDefaultAvatar() {
      const style = this.initialsStyles[this.userColorIndex]
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
          <rect width="200" height="200" fill="${this.extractColor(style.background, 0)}"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
                fill="${style.color}" text-anchor="middle" dy=".35em">${this.userInitials}</text>
        </svg>
      `
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
    }
  }
}
</script>

<style scoped>
.avatar-selector {
  width: 100%;
}

.current-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.avatar-preview-large {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.avatar-preview-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.generated-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.avatar-actions {
  display: flex;
  gap: 12px;
}

.btn-upload, .btn-suggestions {
  padding: 10px 20px;
  border-radius: 24px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-upload {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
}

.btn-suggestions {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-upload:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
}

.btn-suggestions:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

/* Painel de Sugestões */
.suggestions-panel {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestion-section {
  margin-bottom: 24px;
}

.suggestion-section:last-child {
  margin-bottom: 0;
}

.suggestion-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-section h4 i {
  color: #ec4899;
}

/* Grids */
.initials-grid, .illustration-grid, .abstract-grid, .gradient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 12px;
}

.initial-option, .illustration-option, .abstract-option, .gradient-option {
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s;
  position: relative;
}

.initial-option:hover, .illustration-option:hover, 
.abstract-option:hover, .gradient-option:hover {
  transform: scale(1.1);
  border-color: rgba(236, 72, 153, 0.5);
}

.initial-option.active, .illustration-option.active, 
.abstract-option.active, .gradient-option.active {
  border-color: #ec4899;
  box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.3);
}

.initial-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.illustration-option img, .abstract-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #f0f0f0;
}

.gradient-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

/* Animações */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@media (max-width: 768px) {
  .avatar-preview-large {
    width: 120px;
    height: 120px;
  }
  
  .generated-avatar {
    font-size: 48px;
  }
  
  .initials-grid, .illustration-grid, .abstract-grid, .gradient-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>