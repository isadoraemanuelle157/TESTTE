<template>
  <div class="onboarding-container">
    <!-- Background Dinâmico -->
    <div class="dynamic-bg">
      <div
        class="bg-layer"
        v-for="(layer, index) in 3"
        :key="index"
        :class="{ active: headerStep === index + 1 }"
        :style="getBgStyle(index + 1)"
      ></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Header Global -->
    <header class="global-header onboarding-header">
      <div class="progress-steps">
        <div class="step" :class="{ completed: headerStep > 1, active: headerStep === 1 }">
          <div class="step-number">
            <svg v-if="headerStep > 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span v-else>1</span>
          </div>
          <span class="step-label">Gêneros</span>
        </div>
        <div class="step-line" :class="{ completed: headerStep > 1 }">
          <svg class="arrow-icon" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
        <div class="step" :class="{ completed: headerStep > 2, active: headerStep === 2 }">
          <div class="step-number">
            <svg v-if="headerStep > 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span v-else>2</span>
          </div>
          <span class="step-label">Artistas</span>
        </div>
        <div class="step-line" :class="{ completed: headerStep > 2 }">
          <svg class="arrow-icon" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
        <div class="step" :class="{ active: headerStep === 3 }">
          <div class="step-number">
            <svg v-if="headerStep > 3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span v-else>3</span>
          </div>
          <span class="step-label">Vibes</span>
        </div>
      </div>
    </header>

    <main class="content-area">
      <section v-show="currentStep === 1" class="step-section" key="step1">
        <div class="step-header">
          <span class="step-label">Etapa 1 de 3</span>
          <h1>Quais gêneros você curte? 🎸</h1>
          <p>Selecione pelo menos 3 para personalizar sua experiência</p>
          <div class="selection-counter" :class="{ 'is-valid': selectedGenres.length >= 3 }">
            <div class="counter-ring">
              <svg viewBox="0 0 36 36">
                <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="ring-progress" :stroke-dasharray="genreProgress + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span class="counter-text">{{ selectedGenres.length }}</span>
            </div>
            <span class="counter-label">{{ selectedGenres.length >= 3 ? 'Ótimo!' : 'Selecione 3+' }}</span>
          </div>
        </div>
        <div v-if="isLoading && genres.length === 0" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Carregando gêneros...</p>
        </div>
        <div v-else-if="loadError && genres.length === 0" class="error-state">
          <p>⚠️ Não foi possível carregar os gêneros</p>
          <button @click="loadInitialData" class="btn-retry">Tentar novamente</button>
        </div>
        <div v-else class="genres-masonry">
          <button v-for="(genre, index) in genres" :key="genre.id" class="genre-tile"
            :class="{ active: selectedGenres.some(g => g.id === genre.id), 'is-large': index % 7 === 0 }"
            :style="{ '--genre-color': genre.color, '--genre-gradient': genre.gradient, animationDelay: index * 0.04 + 's' }"
            @click="toggleGenre(genre)">
            <div class="tile-bg" :style="{ background: genre.gradient }"></div>
            <div class="tile-content">
              <span class="genre-emoji">{{ genre.emoji }}</span>
              <span class="genre-name">{{ genre.name }}</span>
            </div>
            <div class="tile-check">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <div class="tile-shine"></div>
          </button>
        </div>
      </section>

      <section v-show="currentStep === 2" class="step-section" key="step2">
        <div class="step-header">
          <span class="step-label">Etapa 2 de 3</span>
          <h1>Seus artistas favoritos 🎤</h1>
          <p>Escolha 2 ou mais artistas que você ama ouvir</p>
          <div class="selection-counter" :class="{ 'is-valid': selectedArtists.length >= 2 }">
            <div class="counter-ring">
              <svg viewBox="0 0 36 36">
                <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="ring-progress" :stroke-dasharray="artistProgress + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <span class="counter-text">{{ selectedArtists.length }}</span>
            </div>
            <span class="counter-label">{{ selectedArtists.length >= 2 ? 'Perfeito!' : 'Selecione 2+' }}</span>
          </div>
        </div>
        <div v-if="isLoading && artists.length === 0" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Carregando artistas...</p>
        </div>
        <div v-else-if="loadError && artists.length === 0" class="error-state">
          <p>⚠️ Não foi possível carregar os artistas</p>
          <button @click="loadInitialData" class="btn-retry">Tentar novamente</button>
        </div>
        <div v-else class="artists-grid artists-grid-flat">
          <div v-for="(artist, index) in displayedArtists" :key="artist.id" class="artist-card-large"
            :class="{ active: selectedArtists.some(a => a.id === artist.id) }"
            :style="{ animationDelay: index * 0.04 + 's' }"
            @click="toggleArtist(artist)">
            <div class="artist-image">
              <img :src="artist.photo" :alt="artist.name" @error="handleImageError($event)" loading="lazy">
              <div class="artist-gradient"></div>
              <div class="selection-indicator">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
            </div>
            <div class="artist-info">
              <h3>{{ artist.name }}</h3>
              <p>{{ artist.genre || 'Artista' }}</p>
              <div class="popularity-bar">
                <div class="popularity-fill" :style="{ width: artist.popularity + '%' }"></div>
              </div>
              <span class="popularity-label">{{ artist.popularity }}% popular</span>
            </div>
          </div>
        </div>
      </section>

      <section v-show="currentStep === 3" class="step-section" key="step3">
        <div class="step-header">
          <span class="step-label">Etapa 3 de 3</span>
          <h1>Qual é a sua vibe? ✨</h1>
          <p>Selecione os momentos em que você mais ouve música</p>
          <div class="selection-counter optional">
            <div class="counter-ring">
              <svg viewBox="0 0 36 36">
                <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path class="ring-progress" :stroke-dasharray="vibeProgress + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <span class="counter-text">{{ selectedVibes.length }}</span>
            </div>
            <span class="counter-label">Opcional</span>
          </div>
        </div>
        <div v-if="isLoading && vibes.length === 0" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Carregando vibes...</p>
        </div>
        <div v-else-if="loadError && vibes.length === 0" class="error-state">
          <p>⚠️ Não foi possível carregar as vibes</p>
          <button @click="loadInitialData" class="btn-retry">Tentar novamente</button>
        </div>
        <div v-else class="vibes-showcase">
          <div v-for="(vibe, index) in vibes" :key="vibe.id" class="vibe-showcase-card"
            :class="{ active: selectedVibes.some(v => v.id === vibe.id) }"
            :style="{ '--vibe-gradient': vibe.gradient, animationDelay: index * 0.06 + 's' }"
            @click="toggleVibe(vibe)">
            <div class="vibe-bg" :style="{ background: vibe.gradient }"></div>
            <div class="vibe-illustration">
              <span class="vibe-emoji-large">{{ vibe.emoji }}</span>
              <div class="floating-notes">
                <span v-for="n in 3" :key="n" class="note">♪</span>
              </div>
            </div>
            <div class="vibe-content">
              <h3>{{ vibe.name }}</h3>
              <p>{{ vibe.description }}</p>
              <div class="vibe-tags">
                <span v-for="tag in vibe.tags" :key="tag" class="vibe-tag">{{ tag }}</span>
              </div>
            </div>
            <div class="vibe-check">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div class="preview-bar" :class="{ expanded: selectedItems.length > 0 }">
      <div class="preview-content">
        <div class="preview-chips">
          <transition-group name="chip">
            <div v-for="item in selectedItems.slice(0, 5)" :key="item.id || item.name" class="preview-chip"
              :style="{ background: item.color || item.gradient }">
              <span>{{ item.emoji || item.name }}</span>
              <button @click.stop="removeItem(item)" class="remove-chip-btn">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          </transition-group>
          <span v-if="selectedItems.length > 5" class="more-indicator">+{{ selectedItems.length - 5 }}</span>
        </div>
        <span class="preview-count">{{ selectedItems.length }} selecionados</span>
      </div>
    </div>

    <footer class="step-footer">
      <button class="btn-nav btn-prev" :disabled="currentStep === 1" @click="prevStep">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        Voltar
      </button>
      <button class="btn-nav btn-next" :class="{ 'btn-primary': canProceed, 'btn-disabled': !canProceed }"
        :disabled="!canProceed || isSaving" @click="nextStep">
        <span v-if="isSaving" class="btn-spinner"></span>
        <template v-else>
          {{ currentStep === 3 ? 'Finalizar' : 'Continuar' }}
          <svg v-if="currentStep < 3" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
        </template>
      </button>
    </footer>

    <transition name="modal">
      <div v-if="showSuccess" class="success-modal">
        <button class="btn-back-modal" @click="goBackFromSuccess">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Voltar
        </button>
        <div class="success-content">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </div>
          <h2>Perfil Criado! 🎉</h2>
          <p>Sua experiência musical está pronta</p>
          <div class="summary-tags">
            <span v-for="tag in summaryTags" :key="tag" class="summary-tag">{{ tag }}</span>
          </div>
          <button class="btn-start" @click="finishOnboarding" :disabled="isSaving">
            <span v-if="isSaving" class="btn-spinner"></span>
            <span v-else>Começar a Ouvir</span>
          </button>
        </div>
      </div>
    </transition>

    <div v-show="showSplash" class="splash-overlay">
      <div class="splash-content">
        <div class="splash-logo-wrapper">
          <div class="splash-logo-glow"></div>
          <div class="splash-logo">
            <div class="sound-wave">
              <span v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.15}s` }"></span>
            </div>
            <span class="logo-letter">S</span>
          </div>
          <svg class="splash-ring" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#1db954" />
                <stop offset="100%" stop-color="#1ed760" />
              </linearGradient>
            </defs>
            <circle class="ring-track" cx="60" cy="60" r="52" />
            <circle class="ring-fill" cx="60" cy="60" r="52"
              :stroke-dasharray="splashCircumference"
              :stroke-dashoffset="splashStrokeOffset" />
          </svg>
        </div>
        <div class="splash-brand" :class="{ 'show': splashProgress > 20 }">
          <h1 class="splash-title">
            <span v-for="(letter, i) in 'SoundUp'.split('')" :key="i" :style="{ animationDelay: `${0.3 + i * 0.08}s` }">{{ letter }}</span>
          </h1>
          <p class="splash-subtitle" :class="{ 'show': splashProgress > 40 }">Preparando sua experiência musical</p>
        </div>
        <div class="splash-progress-wrapper" :class="{ 'show': splashProgress > 30 }">
          <div class="splash-progress-track">
            <div class="splash-progress-fill" :style="{ width: splashProgress + '%' }">
              <div class="splash-progress-shine"></div>
            </div>
          </div>
          <span class="splash-percent">{{ Math.round(splashProgress) }}%</span>
        </div>
        <div class="splash-steps" :class="{ 'show': splashProgress > 50 }">
          <div v-for="(step, i) in splashSteps" :key="i" class="splash-step"
            :class="{ 'active': splashCurrentStep === i, 'done': splashCurrentStep > i }">
            <div class="step-dot">
              <svg v-if="splashCurrentStep > i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <div v-else-if="splashCurrentStep === i" class="step-spinner"></div>
              <div v-else class="step-idle"></div>
            </div>
            <span>{{ step }}</span>
          </div>
        </div>
      </div>
      <div class="splash-particles">
        <div v-for="n in 15" :key="n" class="particle" :style="getSplashParticleStyle(n)"></div>
      </div>
      <div class="expand-circle" :class="{ 'expand': isExpanding }"></div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2"

export default {
  name: "FeitoParaVoce",

  data() {
    return {
      currentStep: 1,
      selectedGenres: [],
      selectedArtists: [],
      selectedVibes: [],
      showSuccess: false,
      genres: [],
      artists: [],
      vibes: [],
      showSplash: false,
      splashProgress: 0,
      splashCurrentStep: 0,
      isExpanding: false,
      dataLoaded: false,
      isLoading: false,
      isSaving: false,
      loadError: false,
      splashSteps: [
        'Salvando preferências',
        'Sincronizando biblioteca',
        'Carregando artistas',
        'Preparando dashboard'
      ],
      splashCircumference: 2 * Math.PI * 52
    }
  },

  async mounted() {
    const onboardingCompleto = localStorage.getItem("onboardingCompleto")
    if (onboardingCompleto === "true") {
      this.redirectToDashboard()
      return
    }
    if (!this.dataLoaded && !this.isLoading) {
      await this.loadInitialData()
    }
  },

  computed: {
    splashStrokeOffset() {
      return this.splashCircumference - (this.splashProgress / 100) * this.splashCircumference
    },
    headerStep() { return this.currentStep },
    genreProgress() { return Math.min((this.selectedGenres.length / 3) * 100, 100) },
    artistProgress() { return Math.min((this.selectedArtists.length / 2) * 100, 100) },
    vibeProgress() { return Math.min((this.selectedVibes.length / 2) * 100, 100) },
    canProceed() {
      if (this.currentStep === 1) return this.selectedGenres.length >= 3
      if (this.currentStep === 2) return this.selectedArtists.length >= 2
      return true
    },
    selectedItems() {
      return [...this.selectedGenres, ...this.selectedArtists, ...this.selectedVibes]
    },
    summaryTags() {
      return [
        ...this.selectedGenres.slice(0, 3).map(g => g.name),
        ...this.selectedArtists.slice(0, 2).map(a => a.name),
        ...this.selectedVibes.slice(0, 2).map(v => v.name)
      ]
    },
    displayedArtists() {
      return this.artists.length > 0 ? this.artists.slice(0, 45) : []
    }
  },

  methods: {
    redirectToDashboard() {
      if (this.$router) {
        this.$router.replace('/dashboard')
      } else {
        window.location.href = '/dashboard'
      }
    },

    async scrollToTop() {
      await this.$nextTick()
      const contentArea = document.querySelector('.content-area')
      if (contentArea) contentArea.scrollTo({ top: 0, behavior: 'smooth' })
    },

    getSplashParticleStyle(n) {
      const size = Math.random() * 3 + 1
      const left = Math.random() * 100
      const delay = Math.random() * 4
      const duration = Math.random() * 8 + 8
      return {
        width: `${size}px`, height: `${size}px`, left: `${left}%`,
        animationDelay: `${delay}s`, animationDuration: `${duration}s`
      }
    },

    async startSplashTransition() {
      this.showSplash = true
      this.splashProgress = 0
      this.splashCurrentStep = 0
      this.isExpanding = false
      const duration = 3000
      const interval = 30
      const increment = 100 / (duration / interval)
      return new Promise((resolve) => {
        let resolved = false
        const timer = setInterval(() => {
          this.splashProgress = Math.min(this.splashProgress + increment + (Math.random() * 0.8), 100)
          if (this.splashProgress > 15) this.splashCurrentStep = 0
          if (this.splashProgress > 40) this.splashCurrentStep = 1
          if (this.splashProgress > 65) this.splashCurrentStep = 2
          if (this.splashProgress > 85) this.splashCurrentStep = 3
          if (this.splashProgress >= 100 && !resolved) {
            resolved = true
            clearInterval(timer)
            setTimeout(() => {
              this.isExpanding = true
              setTimeout(() => { this.showSplash = false; resolve() }, 700)
            }, 400)
          }
        }, interval)
      })
    },

    getPlaceholderImage(seed = 1) {
      const hues = [320, 200, 150, 45, 280, 180, 30, 250]
      const hue = hues[seed % hues.length]
      return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(${hue},70%,20%)"/><stop offset="100%" stop-color="hsl(${hue},70%,10%)"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="150" r="50" fill="rgba(255,255,255,0.1)"/><ellipse cx="200" cy="340" rx="90" ry="70" fill="rgba(255,255,255,0.1)"/><circle cx="200" cy="135" r="45" fill="rgba(255,255,255,0.15)"/><ellipse cx="200" cy="330" rx="80" ry="60" fill="rgba(255,255,255,0.15)"/></svg>`)}`
    },

    handleImageError(event) {
      event.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%231a1a2e"/><circle cx="200" cy="160" r="60" fill="%23333"/><ellipse cx="200" cy="320" rx="100" ry="80" fill="%23333"/><text x="200" y="380" font-family="Arial" font-size="16" fill="%23666" text-anchor="middle">Artista</text></svg>`)}`
    },

    limitGenres(list) {
      return this.mergeUniqueByName([], list).slice(0, 15)
    },

    limitVibes(list) {
      return this.mergeUniqueByName([], list).slice(0, 18)
    },

    limitArtistsByGenre(list) {
      if (list.length <= 45) return list
      const groups = new Map()
      list.forEach(artist => {
        const genreKey = artist.genreGroup || artist.genre?.split(',')[0]?.trim() || 'Outros'
        if (!groups.has(genreKey)) groups.set(genreKey, [])
        const group = groups.get(genreKey)
        const alreadyExists = group.some(a => this.normalizeText(a.name) === this.normalizeText(artist.name))
        if (!alreadyExists && group.length < 5) {
          group.push({ ...artist, genre: genreKey, genreGroup: genreKey })
        }
      })
      return Array.from(groups.entries()).slice(0, 20).flatMap(([genre, artists]) => artists)
    },

    async fetchJson(url, label = "requisicao") {
      const token = localStorage.getItem("token")
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const text = await res.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch (e) {
        throw new Error(`${label}: resposta invalida -> ${text}`)
      }
      if (!res.ok) {
        throw new Error(`${label} falhou (${res.status}): ${data?.error || data?.message || text}`)
      }
      console.log(`✅ ${label}`, data)
      return data
    },

    async loadInitialData() {
      if (this.isLoading) return
      this.isLoading = true
      this.loadError = false
      try {
        const [spotifyData, localData] = await Promise.allSettled([
          this.loadAllSpotifyData(),
          this.loadAllLocalData()
        ])
        let allGenres = [], allArtists = [], allVibes = []
        if (spotifyData.status === 'fulfilled') {
          allGenres = [...allGenres, ...spotifyData.value.genres]
          allArtists = [...allArtists, ...spotifyData.value.artists]
          allVibes = [...allVibes, ...spotifyData.value.vibes]
        }
        if (localData.status === 'fulfilled') {
          allGenres = [...allGenres, ...localData.value.genres]
          allArtists = [...allArtists, ...localData.value.artists]
          allVibes = [...allVibes, ...localData.value.vibes]
        }
        this.genres = this.limitGenres(this.mergeUniqueByName([], allGenres))
        this.artists = this.limitArtistsByGenre(this.mergeUniqueByName([], allArtists))
        this.vibes = this.limitVibes(this.mergeUniqueByName([], allVibes))
        console.log('📊 Dados carregados:', { genres: this.genres.length, artists: this.artists.length, vibes: this.vibes.length })
        this.dataLoaded = true
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error)
        this.loadError = true
      } finally {
        this.isLoading = false
      }
    },

    async loadAllSpotifyData() {
      try {
        const data = await this.fetchJson("http://localhost:3002/spotify/artists/popular", "Spotify artists popular")
        const generosUnicos = new Map()
        const artists = []
        ;(data.groups || []).forEach((group, i) => {
          if (group.genre) {
            const nomeFormatado = group.genre.replace('brazilian ', '').replace(/^./, str => str.toUpperCase())
            const genreKey = this.normalizeText(group.genre)
            if (!generosUnicos.has(genreKey)) {
              generosUnicos.set(genreKey, {
                id: "spotify_" + genreKey, name: nomeFormatado,
                emoji: this.getEmoji(group.genre), color: this.getColor(i),
                gradient: this.getGradient(i), source: "spotify"
              })
            }
          }
          ;(group.artists || []).slice(0, 3).forEach((artist, index) => {
            artists.push({
              id: artist.id, name: artist.name,
              photo: artist.images?.[0]?.url || this.getPlaceholderImage(i * 3 + index),
              genre: group.genre, genreGroup: group.genre,
              popularity: artist.popularity || Math.floor(Math.random() * 20) + 70,
              source: "spotify"
            })
          })
        })
        let vibes = []
        try {
          const vibesData = await this.fetchJson("http://localhost:3002/spotify/vibes", "Spotify vibes")
          vibes = (Array.isArray(vibesData) ? vibesData : []).slice(0, 18).map((v, index) => ({
            id: v.id || `api_vibe_${index}`, name: v.name,
            emoji: v.emoji || "✨", gradient: v.gradient || this.getGradient(index),
            description: v.description || "Vibe vinda da API",
            tags: v.tags || [], source: v.source || "spotify"
          }))
        } catch (e) { console.warn("⚠️ Vibes Spotify falhou, usando padrão") }
        return { genres: Array.from(generosUnicos.values()), artists, vibes }
      } catch (e) {
        console.error("❌ Erro Spotify data:", e)
        return { genres: [], artists: [], vibes: [] }
      }
    },

    async loadAllLocalData() {
      const [generosRes, cantoresRes, vibesRes] = await Promise.allSettled([
        fetch("http://localhost:3002/generos"),
        fetch("http://localhost:3002/cantores"),
        fetch("http://localhost:3002/vibes")
      ])
      let genres = [], artists = [], vibes = []
      if (generosRes.status === 'fulfilled' && generosRes.value.ok) {
        try {
          const data = await generosRes.value.json()
          const generosArray = Object.values(data).flat()
          genres = generosArray.map((g, index) => ({
            id: g._id, name: g.nome,
            emoji: g.icon || this.getEmoji(g.nome),
            color: g.color || this.getColor(index),
            gradient: g.gradient || this.getGradient(index),
            source: "local"
          }))
        } catch (e) { console.error("Erro generos:", e) }
      }
      if (cantoresRes.status === 'fulfilled' && cantoresRes.value.ok) {
        try {
          const data = await cantoresRes.value.json()
          artists = data.map((c, index) => ({
            id: c._id, name: c.nome,
            photo: c.foto || this.getPlaceholderImage(index + 10),
            genre: c.generos?.length ? c.generos.map(g => g.nome).join(", ") : "Sem genero",
            popularity: Math.floor(Math.random() * 20) + 80,
            source: "local"
          }))
        } catch (e) { console.error("Erro cantores:", e) }
      }
      if (vibesRes.status === 'fulfilled' && vibesRes.value.ok) {
        try {
          const data = await vibesRes.value.json()
          vibes = data.map((v, index) => ({
            id: v._id, name: v.nome,
            emoji: v.emoji || "🎵",
            gradient: v.gradient || this.getGradient(index),
            description: v.descricao || "Vibe musical",
            tags: v.tags || [], source: "local"
          }))
        } catch (e) { console.error("Erro vibes:", e) }
      }
      return { genres, artists, vibes }
    },

    normalizeText(value) {
      return (value || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim()
    },

    mergeUniqueByName(currentList, newList) {
      const map = new Map()
      ;[...currentList, ...newList].forEach(item => {
        const key = this.normalizeText(item.name)
        if (!key) return
        if (!map.has(key)) {
          map.set(key, item)
        } else {
          map.set(key, { ...map.get(key), ...item })
        }
      })
      return Array.from(map.values())
    },

    generateVibesFromGenres() {
      const map = {
        funk: { name: "Festa", emoji: "🎉", tags: ["danca", "noite"] },
        rock: { name: "Energia", emoji: "⚡", tags: ["treino", "acao"] },
        pop: { name: "Chill", emoji: "🌈", tags: ["leve", "happy"] },
        gospel: { name: "Relax", emoji: "🙏", tags: ["paz", "fe"] },
        eletronica: { name: "Night", emoji: "🌙", tags: ["balada"] }
      }
      const novas = []
      this.selectedGenres.forEach(g => {
        const key = this.normalizeText(g.name)
        if (map[key]) {
          novas.push({
            id: "auto_" + key, name: map[key].name, emoji: map[key].emoji,
            description: "Gerado automaticamente",
            gradient: this.getGradient(Math.floor(Math.random() * 10)),
            tags: map[key].tags, source: "externo"
          })
        }
      })
      this.vibes = this.limitVibes(this.mergeUniqueByName(this.vibes, novas))
    },

    getEmoji(nome) {
      const map = {
        pop: "🎵", rock: "🎸", funk: "🔥", hiphop: "🎤", trap: "🎤", rap: "🎤",
        eletronica: "🎹", gospel: "🙏", samba: "🥁", sertanejo: "🌾", mpb: "🇧🇷",
        pagode: "🪘", reggae: "🌿", indie: "🎧", metal: "🤘", jazz: "🎷",
        blues: "🎺", country: "🤠", classical: "🎻", reggaeton: "🔊", kpop: "🇰🇷",
        latino: "💃", rnb: "🎶", soul: "🕊️", disco: "🕺", punk: "👿", folk: "🪕",
        ambient: "🌊", "lo-fi": "☕", house: "🏠", techno: "🤖", trance: "🌀",
        dubstep: "💥", drumnbass: "🥁", afrobeat: "🌍", bossa: "🌴", forro: "🪗",
        axe: "🎉", brega: "💎", arrocha: "💔", sambarock: "🎸", tropical: "🌺",
        chill: "😌", workout: "💪", party: "🎊", study: "📚", sleep: "😴",
        focus: "🎯", commute: "🚗", cooking: "🍳", gaming: "🎮", meditation: "🧘",
        romance: "💕", sad: "😢", happy: "😊", angry: "😤", nostalgic: "📸"
      }
      const key = this.normalizeText(nome).replace(/\\s/g, "")
      return map[key] || "🎶"
    },

    getColor(index) {
      const colors = ["#E91E63", "#F44336", "#FF9800", "#00BCD4", "#9C27B0",
        "#4CAF50", "#3F51B5", "#FF5722", "#009688", "#795548",
        "#607D8B", "#8BC34A", "#CDDC39", "#FFEB3B", "#00ACC1"]
      return colors[index % colors.length]
    },

    getGradient(index) {
      const gradients = [
        "linear-gradient(135deg,#E91E63,#F48FB1)",
        "linear-gradient(135deg,#F44336,#EF5350)",
        "linear-gradient(135deg,#FF9800,#FFB74D)",
        "linear-gradient(135deg,#00BCD4,#4DD0E1)",
        "linear-gradient(135deg,#9C27B0,#CE93D8)",
        "linear-gradient(135deg,#4CAF50,#81C784)",
        "linear-gradient(135deg,#3F51B5,#7986CB)",
        "linear-gradient(135deg,#FF5722,#FF8A65)",
        "linear-gradient(135deg,#009688,#80CBC4)",
        "linear-gradient(135deg,#795548,#BCAAA4)",
        "linear-gradient(135deg,#607D8B,#B0BEC5)",
        "linear-gradient(135deg,#8BC34A,#C5E1A5)",
        "linear-gradient(135deg,#CDDC39,#E6EE9C)",
        "linear-gradient(135deg,#FFEB3B,#FFF59D)",
        "linear-gradient(135deg,#00ACC1,#80DEEA)"
      ]
      return gradients[index % gradients.length]
    },

    getBgStyle(step) {
      const gradients = {
        1: 'radial-gradient(circle at 20% 50%, rgba(233, 30, 99, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%)',
        2: 'radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(138, 43, 226, 0.1) 0%, transparent 50%)',
        3: 'radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(240, 147, 251, 0.1) 0%, transparent 50%)'
      }
      return { background: gradients[step] }
    },

    toggleGenre(genre) {
      const existe = this.selectedGenres.find(g => g.id === genre.id)
      if (existe) { this.selectedGenres = this.selectedGenres.filter(g => g.id !== genre.id) }
      else { this.selectedGenres.push(genre) }
    },

    toggleArtist(artist) {
      const existe = this.selectedArtists.find(a => a.id === artist.id)
      if (existe) { this.selectedArtists = this.selectedArtists.filter(a => a.id !== artist.id) }
      else { this.selectedArtists.push(artist) }
    },

    toggleVibe(vibe) {
      const existe = this.selectedVibes.find(v => v.id === vibe.id)
      if (existe) { this.selectedVibes = this.selectedVibes.filter(v => v.id !== vibe.id) }
      else { this.selectedVibes.push(vibe) }
    },

    removeItem(item) {
      this.selectedGenres = this.selectedGenres.filter(g => g.id !== item.id)
      this.selectedArtists = this.selectedArtists.filter(a => a.id !== item.id)
      this.selectedVibes = this.selectedVibes.filter(v => v.id !== item.id)
    },

    async nextStep() {
      if (this.currentStep === 1) this.generateVibesFromGenres()
      if (this.currentStep === 3) { this.showSuccess = true }
      else { this.currentStep++; await this.scrollToTop() }
    },

    async prevStep() {
      if (this.currentStep > 1) { this.currentStep--; await this.scrollToTop() }
    },

    goToStep(step) { if (step < this.currentStep) this.currentStep = step },
    goBackFromSuccess() { this.showSuccess = false },

    skipOnboarding() {
      if (confirm('Tem certeza que deseja pular?')) { this.finishOnboarding() }
    },

    async finishOnboarding() {
      if (this.isSaving) return
      this.isSaving = true
      try {
        const usuarioRaw = localStorage.getItem("usuario")
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Você precisa estar logado para salvar seu perfil. Faça login novamente.")
        let usuario = null
        try { usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null }
        catch (e) { throw new Error("Dados do usuário corrompidos. Faça login novamente.") }
        const userId = usuario?._id || usuario?.id
        if (!userId) throw new Error("ID do usuário não encontrado. Faça login novamente.")
        console.log('👤 Usuário identificado:', userId)

        const generosPayload = this.selectedGenres.map(g => ({
          source: g.source || 'local',
          externalId: String(g.id || ''),
          nome: g.name || g.nome || 'Gênero',
          icon: g.emoji || g.icon || '🎵',
          color: g.color || '#1DB954'
        }))

        const artistasPayload = this.selectedArtists.map(a => ({
          source: a.source || 'local',
          externalId: String(a.id || ''),
          nome: a.name || a.nome || 'Artista',
          imagem: a.photo || a.imagem || a.foto || null,
          extra: { genero: a.genre || a.genero || '', popularidade: Number(a.popularity) || 0 }
        }))

        const vibesPayload = this.selectedVibes.map(v => ({
          source: v.source || 'local',
          externalId: String(v.id || ''),
          nome: v.name || v.nome || 'Vibe',
          emoji: v.emoji || '✨',
          descricao: v.description || v.descricao || '',
          gradient: v.gradient || 'linear-gradient(135deg,#667eea,#764ba2)',
          tags: Array.isArray(v.tags) ? v.tags : []
        }))

        // CORREÇÃO: Enviar arrays diretos conforme backend espera
        const payload = {
          generos: generosPayload,
          artistasFavoritos: artistasPayload,
          vibesFavoritas: vibesPayload,
          onboardingCompleto: true
        }

        console.log('📤 Enviando payload:', JSON.stringify(payload, null, 2))

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)
        let response
        try {
          response = await fetch(`http://localhost:3002/usuarios/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          })
        } catch (fetchError) {
          clearTimeout(timeoutId)
          if (fetchError.name === 'AbortError') throw new Error("A conexão demorou muito. Verifique sua internet e tente novamente.")
          throw new Error(`Erro de conexão: ${fetchError.message}`)
        }
        clearTimeout(timeoutId)

        let responseData = null
        const responseText = await response.text()
        if (responseText) {
          try { responseData = JSON.parse(responseText) }
          catch (e) { responseData = { message: responseText } }
        }
        console.log('📥 Resposta do servidor:', response.status, responseData)
        if (!response.ok) {
          const errorMessage = responseData?.message || responseData?.error || `Erro ${response.status}: ${responseText || 'Erro desconhecido do servidor'}`
          throw new Error(errorMessage)
        }

        const artistasLocais = this.selectedArtists.filter(a => !a.source || a.source === 'local')
        if (artistasLocais.length > 0) {
          console.log('⭐ Favoritando artistas locais:', artistasLocais.length)
          const favoritarPromises = artistasLocais.map(artist =>
            fetch(`http://localhost:3002/favoritas/${artist.id}/favoritar`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ tipo: "cantor" })
            }).catch(err => {
              console.warn(`⚠️ Falha ao favoritar artista ${artist.id}:`, err.message)
              return null
            })
          )
          await Promise.allSettled(favoritarPromises)
        }

        localStorage.setItem("artistasFavoritos", JSON.stringify(this.selectedArtists.map(a => a.id)))
        localStorage.setItem("onboardingCompleto", "true")

        this.showSuccess = false
        await new Promise(r => setTimeout(r, 300))
        await this.startSplashTransition()
        this.redirectToDashboard()

      } catch (err) {
        console.error('❌ Erro ao finalizar onboarding:', err)
        Swal.fire({
          title: "Erro ao salvar 😢",
          text: err.message || "Não foi possível finalizar o cadastro. Tente novamente.",
          icon: "error", background: "#121212", color: "#fff",
          confirmButtonColor: "#ff4757", confirmButtonText: "Entendi",
          showCancelButton: true, cancelButtonText: "Tentar novamente", cancelButtonColor: "#1DB954"
        })
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

.onboarding-container {
  min-height: 100vh; width: 100%;
  background: #0a0a0a; color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex; flex-direction: column;
  position: relative; overflow-x: hidden;
}

.dynamic-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }

.progress-steps { display: flex; align-items: center; gap: 12px; }

.step-line {
  position: relative; width: 60px; height: 2px;
  background: rgba(255,255,255,0.2); transition: all 0.3s;
}
.step-line.completed { background: #1DB954; }

.arrow-icon {
  width: 28px; height: 28px;
  color: rgba(255, 255, 255, 0.5); transition: all 0.3s;
}
.step-line.completed .arrow-icon { color: #1DB954; transform: scale(1.1); }

.bg-layer { position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease; }
.bg-layer.active { opacity: 1; }

.noise-overlay {
  position: absolute; inset: 0; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

.global-header {
  position: sticky; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  padding: 16px 32px;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.content-area {
  flex: 1; position: relative; z-index: 1;
  margin-top: 0; margin-bottom: 0;
  overflow-y: auto; overflow-x: hidden;
  padding: 24px 32px; width: 100%;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}
.content-area::-webkit-scrollbar { width: 6px; }
.content-area::-webkit-scrollbar-track { background: transparent; }
.content-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }

.step-section { min-height: auto; display: flex; flex-direction: column; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-header { text-align: center; margin-bottom: 32px; position: relative; }

.step-header .step-label {
  display: inline-block; font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.2em; color: #1DB954; font-weight: 700;
  margin-bottom: 12px; padding: 6px 14px;
  background: rgba(29, 185, 84, 0.1); border-radius: 20px;
}

.step-header h1 {
  font-size: 36px; font-weight: 800; margin-bottom: 10px;
  background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.step-header p { font-size: 16px; color: #888; margin-bottom: 20px; }

.selection-counter {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50px; border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}
.selection-counter.is-valid {
  border-color: #1DB954; background: rgba(29, 185, 84, 0.1);
}
.selection-counter.optional {
  border-color: #ffc107; background: rgba(255, 193, 7, 0.1);
}

.counter-ring { width: 36px; height: 36px; position: relative; }
.counter-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: rgba(255, 255, 255, 0.1); stroke-width: 3; }
.ring-progress {
  fill: none; stroke: #1DB954; stroke-width: 3; stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}
.counter-text {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px; font-weight: 700;
}
.counter-label { font-size: 13px; font-weight: 600; color: #888; }
.selection-counter.is-valid .counter-label { color: #1ed760; }

.loading-state, .error-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 60px 20px; gap: 16px; color: #888;
}
.loading-spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #1DB954; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.btn-retry {
  padding: 10px 24px;
  background: rgba(29, 185, 84, 0.2);
  border: 1px solid #1DB954; border-radius: 20px;
  color: #1DB954; font-weight: 600; cursor: pointer; transition: all 0.3s;
}
.btn-retry:hover { background: rgba(29, 185, 84, 0.3); }

/* SPLASH SCREEN */
.splash-overlay {
  position: fixed; inset: 0; background: #0a0a0a; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.splash-content {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center;
  gap: 2rem; width: 100%; max-width: 400px; padding: 2rem;
}
.splash-logo-wrapper {
  position: relative; width: 130px; height: 130px;
  display: flex; align-items: center; justify-content: center;
}
.splash-logo-glow {
  position: absolute; inset: -25px;
  background: radial-gradient(circle, rgba(29, 185, 84, 0.35) 0%, transparent 70%);
  border-radius: 50%; animation: glowPulse 2.5s ease-in-out infinite;
}
@keyframes glowPulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0.9; }
}
.splash-logo {
  position: relative; width: 72px; height: 72px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  border-radius: 22px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 16px 40px rgba(29, 185, 84, 0.35), inset 0 1px 0 rgba(255,255,255,0.25);
}
.sound-wave {
  position: absolute; display: flex; align-items: flex-end;
  gap: 3px; height: 24px; opacity: 0.25;
}
.sound-wave span {
  width: 3px; background: white; border-radius: 2px;
  animation: soundWave 1.2s ease-in-out infinite;
}
.sound-wave span:nth-child(1) { height: 30%; }
.sound-wave span:nth-child(2) { height: 60%; }
.sound-wave span:nth-child(3) { height: 90%; }
.sound-wave span:nth-child(4) { height: 60%; }
.sound-wave span:nth-child(5) { height: 30%; }
@keyframes soundWave {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
.logo-letter { font-size: 2.2rem; font-weight: 900; color: white; z-index: 2; }

.splash-ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-track { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 2.5; }
.ring-fill {
  fill: none; stroke: url(#splashGradient); stroke-width: 3; stroke-linecap: round;
  transition: stroke-dashoffset 0.1s linear;
  filter: drop-shadow(0 0 8px rgba(29, 185, 84, 0.4));
}

.splash-brand { text-align: center; opacity: 0; transform: translateY(15px); transition: all 0.5s ease; }
.splash-brand.show { opacity: 1; transform: translateY(0); }
.splash-title { font-size: 2.2rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; display: flex; justify-content: center; gap: 0.06em; }
.splash-title span {
  display: inline-block; opacity: 0; transform: translateY(20px);
  animation: letterPop 0.5s ease forwards;
  background: linear-gradient(135deg, #fff 0%, #b0b0b0 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
@keyframes letterPop { to { opacity: 1; transform: translateY(0); } }
.splash-subtitle { margin: 0.6rem 0 0; font-size: 0.95rem; color: rgba(255,255,255,0.5); opacity: 0; transform: translateY(10px); transition: all 0.5s ease 0.2s; }
.splash-subtitle.show { opacity: 1; transform: translateY(0); }

.splash-progress-wrapper { width: 100%; display: flex; align-items: center; gap: 1rem; opacity: 0; transform: translateY(15px); transition: all 0.5s ease; }
.splash-progress-wrapper.show { opacity: 1; transform: translateY(0); }
.splash-progress-track { flex: 1; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
.splash-progress-fill { height: 100%; background: linear-gradient(90deg, #1db954 0%, #1ed760 100%); border-radius: 2px; transition: width 0.1s linear; position: relative; overflow: hidden; }
.splash-progress-shine { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); animation: shineSlide 1.8s infinite; }
@keyframes shineSlide { 0% { left: -100%; } 100% { left: 100%; } }
.splash-percent { font-size: 0.85rem; font-weight: 700; color: #1ed760; min-width: 38px; text-align: right; font-variant-numeric: tabular-nums; }

.splash-steps { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; opacity: 0; transition: opacity 0.5s ease; }
.splash-steps.show { opacity: 1; }
.splash-step { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; color: rgba(255,255,255,0.35); transition: all 0.3s ease; }
.splash-step.active { color: rgba(255,255,255,0.85); }
.splash-step.done { color: #1ed760; }
.step-dot { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
.step-dot svg { width: 14px; height: 14px; }
.step-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.15); border-top-color: #1ed760; border-radius: 50%; animation: spin 0.7s linear infinite; }
.step-idle { width: 6px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 50%; }

.splash-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.particle { position: absolute; bottom: -5px; background: rgba(255,255,255,0.4); border-radius: 50%; animation: riseUp linear infinite; }
@keyframes riseUp {
  0% { transform: translateY(0) scale(0); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translateY(-100vh) scale(1); opacity: 0; }
}

.expand-circle {
  position: absolute; width: 100px; height: 100px;
  background: #1db954; border-radius: 50%;
  top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0);
  transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 100;
}
.expand-circle.expand { transform: translate(-50%, -50%) scale(50); }

/* Genres Masonry */
.genres-masonry {
  flex: 1; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 12px; grid-auto-flow: dense; align-content: start; padding-bottom: 20px;
}
.genre-tile {
  position: relative; aspect-ratio: 1;
  border: none; border-radius: 16px; cursor: pointer;
  overflow: hidden; background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: scaleIn 0.5s ease backwards;
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
.genre-tile.is-large { grid-column: span 1; grid-row: span 1; aspect-ratio: 1; }
.genre-tile:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4); }
.genre-tile.active { transform: scale(0.95); }
.tile-bg { position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; }
.genre-tile.active .tile-bg { opacity: 1; }
.tile-content {
  position: relative; z-index: 2; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; padding: 12px;
}
.genre-emoji { font-size: 24px; filter: grayscale(100%); transition: all 0.3s; }
.genre-tile.active .genre-emoji { filter: grayscale(0%); transform: scale(1.1); }
.is-large .genre-emoji { font-size: 28px; }
.genre-name { font-size: 12px; font-weight: 700; color: rgba(255, 255, 255, 0.8); text-align: center; }
.genre-tile.active .genre-name { color: white; }
.is-large .genre-name { font-size: 14px; }
.tile-check {
  position: absolute; top: 8px; right: 8px;
  width: 20px; height: 20px; background: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(0);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.genre-tile.active .tile-check { opacity: 1; transform: scale(1); }
.tile-check svg { width: 14px; height: 14px; color: var(--genre-color); }
.tile-shine { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%); opacity: 0; transition: opacity 0.3s; }
.genre-tile:hover .tile-shine { opacity: 1; }

/* Artists Grid */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px; padding-bottom: 20px;
}
.artist-card-large {
  position: relative; background: rgba(255, 255, 255, 0.03);
  border-radius: 16px; overflow: hidden; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.5s ease backwards;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.artist-card-large:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
.artist-card-large.active { box-shadow: 0 0 0 3px #1DB954, 0 20px 40px rgba(29, 185, 84, 0.2); }
.artist-image { position: relative; aspect-ratio: 1; overflow: hidden; }
.artist-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.artist-card-large:hover .artist-image img { transform: scale(1.1); }
.artist-gradient { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%); }
.selection-indicator {
  position: absolute; top: 10px; right: 10px;
  width: 24px; height: 24px; background: #1DB954; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(0);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 3px 10px rgba(29, 185, 84, 0.4);
}
.artist-card-large.active .selection-indicator { opacity: 1; transform: scale(1); }
.selection-indicator svg { width: 16px; height: 16px; color: white; }
.artist-info { padding: 12px; }
.artist-info h3 { font-size: 14px; font-weight: 700; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist-info p { font-size: 12px; color: #888; margin-bottom: 8px; }
.popularity-bar { height: 3px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden; margin-bottom: 4px; }
.popularity-fill { height: 100%; background: linear-gradient(90deg, #1DB954 0%, #1ed760 100%); border-radius: 2px; transition: width 0.5s ease; }
.popularity-label { font-size: 10px; color: #666; }

/* Vibes Showcase */
.vibes-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px; padding-bottom: 20px;
}
.vibe-showcase-card {
  position: relative; border-radius: 20px; overflow: hidden;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 160px; animation: fadeInUp 0.6s ease backwards;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.vibe-showcase-card:hover { transform: translateY(-4px) scale(1.01); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
.vibe-showcase-card.active { box-shadow: 0 0 0 3px white, 0 20px 40px rgba(0, 0, 0, 0.5); }
.vibe-bg { position: absolute; inset: 0; opacity: 0.9; transition: opacity 0.3s; }
.vibe-showcase-card:hover .vibe-bg { opacity: 1; }
.vibe-illustration { position: absolute; top: 16px; right: 16px; }
.vibe-emoji-large { font-size: 44px; display: block; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.floating-notes { position: absolute; top: -16px; right: -16px; font-size: 20px; color: rgba(255, 255, 255, 0.3); }
.note { position: absolute; animation: noteFloat 2s ease-in-out infinite; }
.note:nth-child(1) { animation-delay: 0s; left: 0; }
.note:nth-child(2) { animation-delay: 0.5s; left: 16px; }
.note:nth-child(3) { animation-delay: 1s; left: 32px; }
@keyframes noteFloat { 0%, 100% { opacity: 0; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-16px); } }
.vibe-content { position: relative; z-index: 2; padding: 16px; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; }
.vibe-content h3 { font-size: 20px; font-weight: 800; margin-bottom: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.vibe-content p { font-size: 12px; opacity: 0.9; margin-bottom: 10px; line-height: 1.4; }

.step { display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.4; transition: all 0.3s; }
.step.active { opacity: 1; transform: scale(1.1); }
.step.completed { opacity: 1; }
.step-number {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  font-weight: bold;
}
.step.active .step-number { background: #1DB954; }
.step.completed .step-number { background: #1DB954; }

.vibe-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.vibe-tag { font-size: 10px; padding: 4px 8px; background: rgba(255, 255, 255, 0.2); border-radius: 16px; backdrop-filter: blur(10px); }
.vibe-check {
  position: absolute; top: 16px; left: 16px;
  width: 32px; height: 32px; background: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(0);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.vibe-showcase-card.active .vibe-check { opacity: 1; transform: scale(1); }
.vibe-check svg { width: 20px; height: 20px; color: #333; }

/* Preview Bar */
.preview-bar {
  position: sticky; bottom: 90px; left: 50%;
  transform: translateX(-50%) translateY(100px);
  max-width: 700px; width: 90%;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px); border-radius: 50px;
  padding: 14px 20px; opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50; border: 1px solid rgba(255, 255, 255, 0.1);
}
.preview-bar.expanded { transform: translateX(-50%) translateY(0); opacity: 1; }
.preview-content { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.preview-chips { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.preview-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 16px;
  font-size: 12px; font-weight: 600; animation: chipIn 0.3s ease;
}
@keyframes chipIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
.chip-enter-active, .chip-leave-active { transition: all 0.3s; }
.chip-enter-from, .chip-leave-to { opacity: 0; transform: scale(0.8); }
.remove-chip-btn {
  width: 16px; height: 16px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.3); color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
.remove-chip-btn:hover { background: rgba(255, 68, 68, 0.8); }
.remove-chip-btn svg { width: 10px; height: 10px; }
.more-indicator { font-size: 12px; color: #888; font-weight: 600; }
.preview-count { font-size: 13px; color: #888; font-weight: 600; white-space: nowrap; }

/* Footer */
.step-footer {
  position: sticky; bottom: 0; left: 0; right: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 32px;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.05); z-index: 100;
}
.btn-nav {
  display: flex; align-items: center; gap: 6px;
  padding: 12px 24px; border-radius: 25px;
  font-size: 15px; font-weight: 700; cursor: pointer;
  transition: all 0.3s; border: none;
}
.btn-nav svg { width: 18px; height: 18px; }
.btn-prev {
  background: transparent; color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.btn-prev:hover:not(:disabled) { border-color: rgba(255, 255, 255, 0.4); color: white; }
.btn-prev:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-next { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.5); cursor: not-allowed; }
.btn-primary { background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%) !important; color: white !important; cursor: pointer !important; box-shadow: 0 8px 25px rgba(29, 185, 84, 0.3); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(29, 185, 84, 0.4); }
.btn-disabled { opacity: 0.5; cursor: not-allowed; }

.btn-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%;
  animation: spin 0.8s linear infinite; display: inline-block;
}

/* Success Modal */
.success-modal {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(20px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fadeIn 0.3s ease;
}
.btn-back-modal {
  position: absolute; top: 24px; left: 24px;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 25px;
  color: white; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.3s; z-index: 10;
}
.btn-back-modal:hover { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.4); transform: translateX(-3px); }
.btn-back-modal svg { width: 20px; height: 20px; }
.success-content { text-align: center; max-width: 500px; padding: 40px; animation: scaleIn 0.5s ease 0.1s both; }
.success-icon {
  width: 90px; height: 90px;
  background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 24px; box-shadow: 0 15px 50px rgba(29, 185, 84, 0.4);
  animation: pulse 2s infinite;
}
.success-icon svg { width: 45px; height: 45px; color: white; }
.success-content h2 { font-size: 28px; font-weight: 800; margin-bottom: 10px; }
.success-content p { font-size: 16px; color: #888; margin-bottom: 24px; }
.summary-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 32px; }
.summary-tag { padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border-radius: 20px; font-size: 14px; font-weight: 600; }
.btn-start {
  padding: 16px 40px;
  background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%);
  border: none; border-radius: 30px; color: white;
  font-size: 16px; font-weight: 700; cursor: pointer;
  transition: all 0.3s; box-shadow: 0 10px 30px rgba(29, 185, 84, 0.3);
}
.btn-start:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(29, 185, 84, 0.4); }
.btn-start:disabled { opacity: 0.6; cursor: not-allowed; }

.modal-enter-active, .modal-leave-active { transition: all 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* Responsive */
@media (max-width: 1024px) {
  .global-header { padding: 14px 20px; }
  .content-area { padding: 20px; margin-top: 65px; }
  .step-header h1 { font-size: 28px; }
  .genres-masonry { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
  .artists-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; }
  .vibes-showcase { grid-template-columns: 1fr; }
  .step-footer { padding: 16px 20px; }
  .btn-nav { padding: 10px 18px; font-size: 14px; }
}

@media (max-width: 480px) {
  .step-header h1 { font-size: 24px; }
  .genre-tile.is-large { grid-column: span 1; grid-row: span 1; }
  .preview-bar { bottom: 80px; padding: 10px 14px; }
  .preview-chip { padding: 5px 10px; font-size: 11px; }
  .btn-back-modal { top: 16px; left: 16px; padding: 10px 16px; font-size: 13px; }
  .btn-back-modal svg { width: 18px; height: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .splash-logo-glow, .sound-wave span, .splash-progress-shine, .particle, .step-spinner { animation: none; }
  .splash-title span { opacity: 1; transform: none; animation: none; }
}
</style>