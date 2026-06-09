<template>
  <div class="onboarding-container">
    <div class="dynamic-bg">
      <div class="bg-layer" v-for="i in 3" :key="i" :class="{ active: headerStep === i }" :style="getBgStyle(i)"></div>
      <div class="noise-overlay"></div>
    </div>
<header class="global-header onboarding-header">
  <div class="progress-steps">
    <div class="step completed">
      <div class="step-number">1</div>
      <span class="step-label">Conta</span>
    </div>

    <div class="step-line completed"></div>

    <div class="step completed">
      <div class="step-number">2</div>
      <span class="step-label">Perfil</span>
    </div>

    <div class="step-line completed"></div>

    <div class="step active">
      <div class="step-number">3</div>
      <span class="step-label">Preferências</span>
    </div>
  </div>
</header>

    <!-- ✅ ADICIONAR no template, logo após o </header> e antes do <main>: -->
<div class="back-to-profile-bar">
  <button class="btn-back-to-profile" @click="voltarParaEtapa2">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
    Voltar para o Perfil
  </button>
</div>

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
            <span class="counter-label">{{ selectedGenres.length >= 3 ? 'Otimo!' : 'Selecione 3+' }}</span>
          </div>
        </div>
        <div v-if="isLoading && !genres.length" class="loading-state"><div class="loading-spinner"></div><p>Carregando gêneros...</p></div>
        <div v-else-if="loadError && !genres.length" class="error-state">
          <p>⚠️ Não foi possível carregar os gêneros</p>
          <button @click="loadInitialData" class="btn-retry">Tentar novamente</button>
        </div>
        <div v-else class="genres-masonry">
          <button v-for="(genre, i) in genres" :key="genre.id" class="genre-tile" :class="{ active: selectedGenres.some(g => g.id === genre.id), 'is-large': i % 7 === 0 }" :style="{ '--genre-color': genre.color, '--genre-gradient': genre.gradient, animationDelay: i * 0.04 + 's' }" @click="toggleGenre(genre)">
            <div class="tile-bg" :style="{ background: genre.gradient }"></div>
            <div class="tile-content"><span class="genre-emoji">{{ genre.emoji }}</span><span class="genre-name">{{ genre.name }}</span></div>
            <div class="tile-check"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
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
        <div v-if="isLoading && !artists.length" class="loading-state"><div class="loading-spinner"></div><p>Carregando artistas...</p></div>
        <div v-else-if="loadError && !artists.length" class="error-state">
          <p>⚠️ Não foi possível carregar os artistas</p>
          <button @click="loadInitialData" class="btn-retry">Tentar novamente</button>
        </div>
        <div v-else class="artists-grid artists-grid-flat">
          <div v-for="(artist, i) in displayedArtists" :key="artist.id" class="artist-card-large" :class="{ active: selectedArtists.some(a => a.id === artist.id) }" :style="{ animationDelay: i * 0.04 + 's' }" @click="toggleArtist(artist)">
            <div class="artist-image">
              <img :src="artist.photo" :alt="artist.name" @error="handleImageError($event)" loading="lazy">
              <div class="artist-gradient"></div>
              <div class="selection-indicator"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
            </div>
            <div class="artist-info">
              <h3>{{ artist.name }}</h3>
              <p>{{ artist.genre || 'Artista' }}</p>
              <div class="popularity-bar"><div class="popularity-fill" :style="{ width: artist.popularity + '%' }"></div></div>
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
        <div v-if="isLoading && !vibes.length" class="loading-state"><div class="loading-spinner"></div><p>Carregando vibes...</p></div>
        <div v-else-if="loadError && !vibes.length" class="error-state">
          <p>⚠️ Não foi possível carregar as vibes</p>
          <button @click="loadInitialData" class="btn-retry">Tentar novamente</button>
        </div>
        <div v-else class="vibes-showcase">
          <div v-for="(vibe, i) in vibes" :key="vibe.id" class="vibe-showcase-card" :class="{ active: selectedVibes.some(v => v.id === vibe.id) }" :style="{ '--vibe-gradient': vibe.gradient, animationDelay: i * 0.06 + 's' }" @click="toggleVibe(vibe)">
            <div class="vibe-bg" :style="{ background: vibe.gradient }"></div>
            <div class="vibe-illustration">
              <span class="vibe-emoji-large">{{ vibe.emoji }}</span>
              <div class="floating-notes"><span v-for="n in 3" :key="n" class="note">♪</span></div>
            </div>
            <div class="vibe-content">
              <h3>{{ vibe.name }}</h3>
              <p>{{ vibe.description }}</p>
              <div class="vibe-tags"><span v-for="tag in vibe.tags" :key="tag" class="vibe-tag">{{ tag }}</span></div>
            </div>
            <div class="vibe-check"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
          </div>
        </div>
      </section>
    </main>

    <div class="preview-bar" :class="{ expanded: selectedItems.length > 0 }">
      <div class="preview-content">
        <div class="preview-chips">
          <transition-group name="chip">
            <div v-for="item in selectedItems.slice(0, 5)" :key="item.id || item.name" class="preview-chip" :style="{ background: item.color || item.gradient }">
              <span>{{ item.emoji || item.name }}</span>
              <button @click.stop="removeItem(item)" class="remove-chip-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button>
            </div>
          </transition-group>
          <span v-if="selectedItems.length > 5" class="more-indicator">+{{ selectedItems.length - 5 }}</span>
        </div>
        <span class="preview-count">{{ selectedItems.length }} selecionados</span>
      </div>
    </div>

    <footer class="step-footer">
      <button class="btn-nav btn-prev" :disabled="currentStep === 1" @click="prevStep">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>Voltar
      </button>
      <button class="btn-nav btn-next" :class="{ 'btn-primary': canProceed, 'btn-disabled': !canProceed }" :disabled="!canProceed || isSaving" @click="nextStep">
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
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>Voltar
        </button>
        <div class="success-content">
          <div class="success-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
          <h2>Perfil Criado! 🎉</h2>
          <p>Sua experiência musical está pronta</p>
          <div class="summary-tags"><span v-for="tag in summaryTags" :key="tag" class="summary-tag">{{ tag }}</span></div>
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
            <div class="sound-wave"><span v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.15}s` }"></span></div>
            <span class="logo-letter">S</span>
          </div>
          <svg class="splash-ring" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#1db954" /><stop offset="100%" stop-color="#1ed760" />
              </linearGradient>
            </defs>
            <circle class="ring-track" cx="60" cy="60" r="52" />
            <circle class="ring-fill" cx="60" cy="60" r="52" :stroke-dasharray="splashCircumference" :stroke-dashoffset="splashStrokeOffset" />
          </svg>
        </div>
        <div class="splash-brand" :class="{ 'show': splashProgress > 20 }">
          <h1 class="splash-title"><span v-for="(letter, i) in 'SoundUp'.split('')" :key="i" :style="{ animationDelay: `${0.3 + i * 0.08}s` }">{{ letter }}</span></h1>
          <p class="splash-subtitle" :class="{ 'show': splashProgress > 40 }">Preparando sua experiência musical</p>
        </div>
        <div class="splash-progress-wrapper" :class="{ 'show': splashProgress > 30 }">
          <div class="splash-progress-track"><div class="splash-progress-fill" :style="{ width: splashProgress + '%' }"><div class="splash-progress-shine"></div></div></div>
          <span class="splash-percent">{{ Math.round(splashProgress) }}%</span>
        </div>
        <div class="splash-steps" :class="{ 'show': splashProgress > 50 }">
          <div v-for="(step, i) in splashSteps" :key="i" class="splash-step" :class="{ 'active': splashCurrentStep === i, 'done': splashCurrentStep > i }">
            <div class="step-dot">
              <svg v-if="splashCurrentStep > i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              <div v-else-if="splashCurrentStep === i" class="step-spinner"></div>
              <div v-else class="step-idle"></div>
            </div>
            <span>{{ step }}</span>
          </div>
        </div>
      </div>
      <div class="splash-particles"><div v-for="n in 15" :key="n" class="particle" :style="getSplashParticleStyle(n)"></div></div>
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
      currentStep: 1, selectedGenres: [], selectedArtists: [], selectedVibes: [],
      showSuccess: false, genres: [], artists: [], vibes: [], showSplash: false,
      splashProgress: 0, splashCurrentStep: 0, isExpanding: false, dataLoaded: false,
      isLoading: false, isSaving: false, loadError: false,
      API_BASE_URL: 'http://localhost:3002',
      splashSteps: ['Salvando preferências','Sincronizando biblioteca','Carregando artistas','Preparando dashboard'],
      splashCircumference: 2 * Math.PI * 52
    }
  },
  async mounted() {
    if (!this.dataLoaded && !this.isLoading) await this.loadInitialData()
  },
  computed: {
    splashStrokeOffset() { return this.splashCircumference - (this.splashProgress / 100) * this.splashCircumference },
    headerStep() { return this.currentStep },
    genreProgress() { return Math.min((this.selectedGenres.length / 3) * 100, 100) },
    artistProgress() { return Math.min((this.selectedArtists.length / 2) * 100, 100) },
    vibeProgress() { return Math.min((this.selectedVibes.length / 2) * 100, 100) },
    canProceed() {
      return this.currentStep === 1 ? this.selectedGenres.length >= 3 : this.currentStep === 2 ? this.selectedArtists.length >= 2 : true
    },
    selectedItems() { return [...this.selectedGenres, ...this.selectedArtists, ...this.selectedVibes] },
    summaryTags() { return [...this.selectedGenres.slice(0,3).map(g=>g.name), ...this.selectedArtists.slice(0,2).map(a=>a.name), ...this.selectedVibes.slice(0,2).map(v=>v.name)] },
    displayedArtists() { return this.artists.length > 0 ? this.artists.slice(0, 45) : [] }
  },
  methods: {
    redirectToDashboard() { this.$router ? this.$router.replace('/dashboard') : window.location.href = '/dashboard' },
    voltarParaEtapa2() {
  // Salvar seleções atuais para recuperar depois
  this.saveSelectionsToStorage()
  this.$router.push('/registrar2')
},
    async scrollToTop() { await this.$nextTick(); const el = document.querySelector('.content-area'); if (el) el.scrollTo({ top: 0, behavior: 'smooth' }) },
    getSplashParticleStyle(n) { const s = Math.random() * 3 + 1; return { width: `${s}px`, height: `${s}px`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 4}s`, animationDuration: `${Math.random() * 8 + 8}s` } },
    async startSplashTransition() {
      this.showSplash = true; this.splashProgress = 0; this.splashCurrentStep = 0; this.isExpanding = false
      const inc = 100 / (3000 / 30)
      return new Promise((resolve) => {
        let resolved = false
        const timer = setInterval(() => {
          this.splashProgress = Math.min(this.splashProgress + inc + Math.random() * 0.8, 100)
          if (this.splashProgress > 15) this.splashCurrentStep = 0
          if (this.splashProgress > 40) this.splashCurrentStep = 1
          if (this.splashProgress > 65) this.splashCurrentStep = 2
          if (this.splashProgress > 85) this.splashCurrentStep = 3
          if (this.splashProgress >= 100 && !resolved) {
            resolved = true; clearInterval(timer)
            setTimeout(() => { this.isExpanding = true; setTimeout(() => { this.showSplash = false; resolve() }, 700) }, 400)
          }
        }, 30)
      })
    },
    getPlaceholderImage(seed = 1) {
      const hue = [320,200,150,45,280,180,30,250][seed % 8]
      return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(${hue},70%,20%)"/><stop offset="100%" stop-color="hsl(${hue},70%,10%)"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="200" cy="150" r="50" fill="rgba(255,255,255,0.1)"/><ellipse cx="200" cy="340" rx="90" ry="70" fill="rgba(255,255,255,0.1)"/><circle cx="200" cy="135" r="45" fill="rgba(255,255,255,0.15)"/><ellipse cx="200" cy="330" rx="80" ry="60" fill="rgba(255,255,255,0.15)"/></svg>`)}`
    },
    handleImageError(e) { e.target.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%231a1a2e"/><circle cx="200" cy="160" r="60" fill="%23333"/><ellipse cx="200" cy="320" rx="100" ry="80" fill="%23333"/><text x="200" y="380" font-family="Arial" font-size="16" fill="%23666" text-anchor="middle">Artista</text></svg>`)}` },
    limitGenres(list) { return this.mergeUniqueByName([], list).slice(0, 15) },
    limitVibes(list) { return this.mergeUniqueByName([], list).slice(0, 18) },
    limitArtistsByGenre(list) {
      if (list.length <= 45) return list
      const groups = new Map()
      list.forEach(a => {
        const gk = a.genreGroup || a.genre?.split(',')[0]?.trim() || 'Outros'
        if (!groups.has(gk)) groups.set(gk, [])
        const g = groups.get(gk)
        if (!g.some(x => this.normalizeText(x.name) === this.normalizeText(a.name)) && g.length < 5) g.push({ ...a, genre: gk, genreGroup: gk })
      })
      return Array.from(groups.entries()).slice(0, 20).flatMap(([,a]) => a)
    },
    async fetchJson(url, label = "requisicao") {
      const token = localStorage.getItem("token")
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      const text = await res.text()
      let data = null
      try { data = text ? JSON.parse(text) : null } catch (e) { throw new Error(`${label}: resposta invalida -> ${text}`) }
      if (!res.ok) throw new Error(`${label} falhou (${res.status}): ${data?.error || data?.message || text}`)
      console.log(`✅ ${label}`, data)
      return data
    },
    async loadInitialData() {
      if (this.isLoading) return
      this.isLoading = true; this.loadError = false
      try {
        const [spotify, local] = await Promise.allSettled([this.loadAllSpotifyData(), this.loadAllLocalData()])
        let g = [], a = [], v = []
        if (spotify.status === 'fulfilled') { g = [...g, ...spotify.value.genres]; a = [...a, ...spotify.value.artists]; v = [...v, ...spotify.value.vibes] }
        if (local.status === 'fulfilled') { g = [...g, ...local.value.genres]; a = [...a, ...local.value.artists]; v = [...v, ...local.value.vibes] }
        this.genres = this.limitGenres(this.mergeUniqueByName([], g))
        this.artists = this.limitArtistsByGenre(this.mergeUniqueByName([], a))
        this.vibes = this.limitVibes(this.mergeUniqueByName([], v))
        console.log('📊 Dados carregados:', { genres: this.genres.length, artists: this.artists.length, vibes: this.vibes.length })
        this.dataLoaded = true
      } catch (e) { console.error('❌ Erro ao carregar dados:', e); this.loadError = true }
      finally { this.isLoading = false }
    },
    async loadAllSpotifyData() {
      try {
        const data = await this.fetchJson("http://localhost:3002/spotify/artists/popular", "Spotify artists popular")
        const generosUnicos = new Map(), artists = []
        ;(data.groups || []).forEach((group, i) => {
          if (group.genre) {
            const nomeFormatado = group.genre.replace('brazilian ', '').replace(/^./, s => s.toUpperCase())
            const genreKey = this.normalizeText(group.genre)
            if (!generosUnicos.has(genreKey)) generosUnicos.set(genreKey, { id: "spotify_" + genreKey, name: nomeFormatado, emoji: this.getEmoji(group.genre), color: this.getColor(i), gradient: this.getGradient(i), source: "spotify" })
          }
          ;(group.artists || []).slice(0, 3).forEach((artist, j) => {
            artists.push({ id: artist.id, name: artist.name, photo: artist.images?.[0]?.url || this.getPlaceholderImage(i * 3 + j), genre: group.genre, genreGroup: group.genre, popularity: artist.popularity || Math.floor(Math.random() * 20) + 70, source: "spotify" })
          })
        })
        let vibes = []
        try {
          const vd = await this.fetchJson("http://localhost:3002/spotify/vibes", "Spotify vibes")
          vibes = (Array.isArray(vd) ? vd : []).slice(0, 18).map((v, i) => ({ id: v.id || `api_vibe_${i}`, name: v.name, emoji: v.emoji || "✨", gradient: v.gradient || this.getGradient(i), description: v.description || "Vibe vinda da API", tags: v.tags || [], source: v.source || "spotify" }))
        } catch (e) { console.warn("⚠️ Vibes Spotify falhou, usando padrão") }
        return { genres: Array.from(generosUnicos.values()), artists, vibes }
      } catch (e) { console.error("❌ Erro Spotify data:", e); return { genres: [], artists: [], vibes: [] } }
    },
    async loadAllLocalData() {
      const [gr, cr, vr] = await Promise.allSettled([fetch("http://localhost:3002/generos"), fetch("http://localhost:3002/cantores"), fetch("http://localhost:3002/vibes")])
      let genres = [], artists = [], vibes = []
      if (gr.status === 'fulfilled' && gr.value.ok) {
        try { const d = await gr.value.json(); genres = Object.values(d).flat().map((g, i) => ({ id: g._id, name: g.nome, emoji: g.icon || this.getEmoji(g.nome), color: g.color || this.getColor(i), gradient: g.gradient || this.getGradient(i), source: "local" })) } catch (e) { console.error("Erro generos:", e) }
      }
      if (cr.status === 'fulfilled' && cr.value.ok) {
        try { const d = await cr.value.json(); artists = d.map((c, i) => ({ id: c._id, name: c.nome, photo: c.foto || this.getPlaceholderImage(i + 10), genre: c.generos?.length ? c.generos.map(g => g.nome).join(", ") : "Sem genero", popularity: Math.floor(Math.random() * 20) + 80, source: "local" })) } catch (e) { console.error("Erro cantores:", e) }
      }
      if (vr.status === 'fulfilled' && vr.value.ok) {
        try { const d = await vr.value.json(); vibes = d.map((v, i) => ({ id: v._id, name: v.nome, emoji: v.emoji || "🎵", gradient: v.gradient || this.getGradient(i), description: v.descricao || "Vibe musical", tags: v.tags || [], source: "local" })) } catch (e) { console.error("Erro vibes:", e) }
      }
      return { genres, artists, vibes }
    },
    normalizeText(v) { return (v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() },
    mergeUniqueByName(cur, list) {
      const map = new Map()
      ;[...cur, ...list].forEach(item => {
        const key = this.normalizeText(item.name)
        if (!key) return
        if (!map.has(key)) map.set(key, item)
        else map.set(key, { ...map.get(key), ...item })
      })
      return Array.from(map.values())
    },
    generateVibesFromGenres() {
      const map = { funk: { name: "Festa", emoji: "🎉", tags: ["danca", "noite"] }, rock: { name: "Energia", emoji: "⚡", tags: ["treino", "acao"] }, pop: { name: "Chill", emoji: "🌈", tags: ["leve", "happy"] }, gospel: { name: "Relax", emoji: "🙏", tags: ["paz", "fe"] }, eletronica: { name: "Night", emoji: "🌙", tags: ["balada"] } }
      const novas = []
      this.selectedGenres.forEach(g => {
        const key = this.normalizeText(g.name)
        if (map[key]) novas.push({ id: "auto_" + key, name: map[key].name, emoji: map[key].emoji, description: "Gerado automaticamente", gradient: this.getGradient(Math.floor(Math.random() * 10)), tags: map[key].tags, source: "externo" })
      })
      this.vibes = this.limitVibes(this.mergeUniqueByName(this.vibes, novas))
    },
    getEmoji(nome) {
      const map = { pop: "🎵", rock: "🎸", funk: "🔥", hiphop: "🎤", trap: "🎤", rap: "🎤", eletronica: "🎹", gospel: "🙏", samba: "🥁", sertanejo: "🌾", mpb: "🇧🇷", pagode: "🪘", reggae: "🌿", indie: "🎧", metal: "🤘", jazz: "🎷", blues: "🎺", country: "🤠", classical: "🎻", reggaeton: "🔊", kpop: "🇰🇷", latino: "💃", rnb: "🎶", soul: "🕊️", disco: "🕺", punk: "👿", folk: "🪕", ambient: "🌊", "lo-fi": "☕", house: "🏠", techno: "🤖", trance: "🌀", dubstep: "💥", drumnbass: "🥁", afrobeat: "🌍", bossa: "🌴", forro: "🪗", axe: "🎉", brega: "💎", arrocha: "💔", sambarock: "🎸", tropical: "🌺", chill: "😌", workout: "💪", party: "🎊", study: "📚", sleep: "😴", focus: "🎯", commute: "🚗", cooking: "🍳", gaming: "🎮", meditation: "🧘", romance: "💕", sad: "😢", happy: "😊", angry: "😤", nostalgic: "📸" }
      return map[this.normalizeText(nome).replace(/\s/g, "")] || "🎶"
    },
    getColor(i) { return ["#E91E63","#F44336","#FF9800","#00BCD4","#9C27B0","#4CAF50","#3F51B5","#FF5722","#009688","#795548","#607D8B","#8BC34A","#CDDC39","#FFEB3B","#00ACC1"][i % 15] },
    getGradient(i) { return ["linear-gradient(135deg,#E91E63,#F48FB1)","linear-gradient(135deg,#F44336,#EF5350)","linear-gradient(135deg,#FF9800,#FFB74D)","linear-gradient(135deg,#00BCD4,#4DD0E1)","linear-gradient(135deg,#9C27B0,#CE93D8)","linear-gradient(135deg,#4CAF50,#81C784)","linear-gradient(135deg,#3F51B5,#7986CB)","linear-gradient(135deg,#FF5722,#FF8A65)","linear-gradient(135deg,#009688,#80CBC4)","linear-gradient(135deg,#795548,#BCAAA4)","linear-gradient(135deg,#607D8B,#B0BEC5)","linear-gradient(135deg,#8BC34A,#C5E1A5)","linear-gradient(135deg,#CDDC39,#E6EE9C)","linear-gradient(135deg,#FFEB3B,#FFF59D)","linear-gradient(135deg,#00ACC1,#80DEEA)"][i % 15] },
    getBgStyle(step) { return { background: { 1: 'radial-gradient(circle at 20% 50%, rgba(233,30,99,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,152,0,0.1) 0%, transparent 50%)', 2: 'radial-gradient(circle at 50% 50%, rgba(29,185,84,0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(138,43,226,0.1) 0%, transparent 50%)', 3: 'radial-gradient(circle at 80% 20%, rgba(102,126,234,0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(240,147,251,0.1) 0%, transparent 50%)' }[step] } },
    toggleGenre(g) { this.selectedGenres = this.selectedGenres.some(x => x.id === g.id) ? this.selectedGenres.filter(x => x.id !== g.id) : [...this.selectedGenres, g] },
    toggleArtist(a) { this.selectedArtists = this.selectedArtists.some(x => x.id === a.id) ? this.selectedArtists.filter(x => x.id !== a.id) : [...this.selectedArtists, a] },
    toggleVibe(v) { this.selectedVibes = this.selectedVibes.some(x => x.id === v.id) ? this.selectedVibes.filter(x => x.id !== v.id) : [...this.selectedVibes, v] },
    removeItem(item) { this.selectedGenres = this.selectedGenres.filter(g => g.id !== item.id); this.selectedArtists = this.selectedArtists.filter(a => a.id !== item.id); this.selectedVibes = this.selectedVibes.filter(v => v.id !== item.id) },
    async nextStep() { if (this.currentStep === 1) this.generateVibesFromGenres(); if (this.currentStep === 3) this.showSuccess = true; else { this.currentStep++; await this.scrollToTop() } },
    async prevStep() { if (this.currentStep > 1) { this.currentStep--; await this.scrollToTop() } },
    goToStep(s) { if (s < this.currentStep) this.currentStep = s },
    goBackFromSuccess() { this.showSuccess = false },
    skipOnboarding() { if (confirm('Tem certeza que deseja pular?')) this.finishOnboarding() },
    saveSelectionsToStorage() { localStorage.setItem('feitoParaVoceSelections', JSON.stringify({ genres: this.selectedGenres, artists: this.selectedArtists, vibes: this.selectedVibes, timestamp: Date.now() })); console.log('✅ Seleções salvas no localStorage') },
    createPersonalizedMixes() {
      const m = []
      if (this.selectedGenres.length) m.push({ id: 'mix_generos_' + Date.now(), title: 'Mix dos Gêneros', description: `Baseado em: ${this.selectedGenres.map(g=>g.name).join(', ')}`, tracks: this.selectedGenres.length * 10, cover: this.selectedGenres[0]?.gradient || this.getGradient(0), gradient: this.selectedGenres[0]?.gradient || this.getGradient(0), _tracks: this.selectedGenres.map(g => ({ id: g.id, title: `Top ${g.name}`, artist: g.name, cover: '', url: '', duration: 180, source: g.source || 'mixed' })) })
      if (this.selectedArtists.length) m.push({ id: 'mix_artistas_' + Date.now(), title: 'Mix dos Artistas', description: `Com: ${this.selectedArtists.map(a=>a.name).join(', ')}`, tracks: this.selectedArtists.length * 5, cover: this.selectedArtists[0]?.photo || '', gradient: this.getGradient(3), _tracks: this.selectedArtists.map(a => ({ id: a.id, title: `Hits de ${a.name}`, artist: a.name, cover: a.photo || '', url: '', duration: 180, source: a.source || 'mixed' })) })
      if (this.selectedVibes.length) m.push({ id: 'mix_vibes_' + Date.now(), title: 'Mix das Vibes', description: `Para: ${this.selectedVibes.map(v=>v.name).join(', ')}`, tracks: this.selectedVibes.length * 8, cover: this.selectedVibes[0]?.gradient || this.getGradient(5), gradient: this.selectedVibes[0]?.gradient || this.getGradient(5), _tracks: this.selectedVibes.map(v => ({ id: v.id, title: `Vibe ${v.name}`, artist: v.name, cover: '', url: '', duration: 200, source: v.source || 'mixed' })) })
      m.push({ id: 'mix_diario_' + Date.now(), title: 'Mix Diário', description: 'Personalizado para você', tracks: 50, cover: this.getGradient(7), gradient: this.getGradient(7), _tracks: [...this.selectedGenres.map(g => ({ id: g.id, title: `Top ${g.name}`, artist: g.name, cover: '', url: '', duration: 180, source: g.source || 'mixed' })), ...this.selectedArtists.map(a => ({ id: a.id, title: `Hits de ${a.name}`, artist: a.name, cover: a.photo || '', url: '', duration: 180, source: a.source || 'mixed' }))] })
      m.push({ id: 'mix_descobertas_' + Date.now(), title: 'Descobertas', description: 'Novas músicas para você', tracks: 30, cover: this.getGradient(2), gradient: this.getGradient(2), _tracks: this.selectedGenres.slice(0,3).map(g => ({ id: 'discover_' + g.id, title: `Descubra ${g.name}`, artist: 'Vários artistas', cover: '', url: '', duration: 190, source: g.source || 'mixed' })) })
      m.push({ id: 'mix_onrepeat_' + Date.now(), title: 'On Repeat', description: 'Músicas que você ama', tracks: this.selectedArtists.length * 5 + this.selectedGenres.length * 5, cover: this.getGradient(4), gradient: this.getGradient(4), _tracks: this.selectedArtists.map(a => ({ id: 'repeat_' + a.id, title: `On Repeat: ${a.name}`, artist: a.name, cover: a.photo || '', url: '', duration: 180, source: a.source || 'mixed' })) })
      m.push({ id: 'mix_radar_' + Date.now(), title: 'Radar', description: 'Atualizado toda sexta', tracks: 30, cover: this.getGradient(6), gradient: this.getGradient(6), _tracks: this.selectedGenres.slice(0,2).map(g => ({ id: 'radar_' + g.id, title: `Radar ${g.name}`, artist: 'Novidades', cover: '', url: '', duration: 185, source: g.source || 'mixed' })) })
      localStorage.setItem('feitoParaVoceMixes', JSON.stringify(m))
      console.log('🎵 Mixes personalizados criados:', m.length)
      return m
    },
    saveFollowedArtists() {
      const fa = this.selectedArtists.map(a => ({ id: a.id, name: a.name, picture_medium: a.photo, picture_big: a.photo, isFollowing: true, hasNewRelease: false, source: a.source || 'local' }))
      localStorage.setItem('feitoParaVoceArtists', JSON.stringify(fa))
      console.log('🎤 Artistas seguidos salvos:', fa.length)
      return fa
    },
    dispatchDashboardUpdate() {
      window.dispatchEvent(new CustomEvent('feito-para-voce-updated', { detail: { madeForYou: JSON.parse(localStorage.getItem('feitoParaVoceMixes') || '[]'), followedArtists: JSON.parse(localStorage.getItem('feitoParaVoceArtists') || '[]'), selectedGenres: this.selectedGenres, selectedArtists: this.selectedArtists, selectedVibes: this.selectedVibes, timestamp: Date.now() } }))
      console.log('📡 Evento de atualização do Dashboard disparado')
    },
    async finishOnboarding() {
      if (this.isSaving) return
      this.isSaving = true
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Você precisa estar logado para salvar seu perfil. Faça login novamente.")
        let usuario = null
        try { usuario = JSON.parse(localStorage.getItem("usuario") || 'null') } catch (e) { throw new Error("Dados do usuário corrompidos. Faça login novamente.") }
        const userId = usuario?._id || usuario?.id
        if (!userId) throw new Error("ID do usuário não encontrado. Faça login novamente.")
        console.log('👤 Usuário identificado:', userId)
        const payload = {
          generos: this.selectedGenres.map(g => ({ source: g.source || 'local', externalId: String(g.id || ''), nome: g.name || g.nome || 'Gênero', icon: g.emoji || g.icon || '🎵', color: g.color || '#1DB954' })),
          artistasFavoritos: this.selectedArtists.map(a => ({ source: a.source || 'local', externalId: String(a.id || ''), nome: a.name || a.nome || 'Artista', imagem: a.photo || a.imagem || a.foto || null, extra: { genero: a.genre || a.genero || '', popularidade: Number(a.popularity) || 0 } })),
          vibesFavoritas: this.selectedVibes.map(v => ({ source: v.source || 'local', externalId: String(v.id || ''), nome: v.name || v.nome || 'Vibe', emoji: v.emoji || '✨', descricao: v.description || v.descricao || '', gradient: v.gradient || 'linear-gradient(135deg,#667eea,#764ba2)', tags: Array.isArray(v.tags) ? v.tags : [] })),
          onboardingCompleto: true
        }
        console.log('📤 Enviando payload:', JSON.stringify(payload, null, 2))
        const ctrl = new AbortController()
        const timeoutId = setTimeout(() => ctrl.abort(), 15000)
        let res
        try { res = await fetch(`http://localhost:3002/usuarios/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(payload), signal: ctrl.signal }) } catch (e) { clearTimeout(timeoutId); if (e.name === 'AbortError') throw new Error("A conexão demorou muito. Verifique sua internet e tente novamente."); throw new Error(`Erro de conexão: ${e.message}`) }
        clearTimeout(timeoutId)
        let rd = null
        const rt = await res.text()
        if (rt) try { rd = JSON.parse(rt) } catch (e) { rd = { message: rt } }
        console.log('📥 Resposta do servidor:', res.status, rd)
        if (!res.ok) throw new Error(rd?.message || rd?.error || `Erro ${res.status}: ${rt || 'Erro desconhecido do servidor'}`)
        const artistasLocais = this.selectedArtists.filter(a => !a.source || a.source === 'local')
        if (artistasLocais.length) {
          console.log('⭐ Favoritando artistas locais:', artistasLocais.length)
          await Promise.allSettled(artistasLocais.map(a => fetch(`http://localhost:3002/favoritas/${a.id}/favoritar`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify({ tipo: "cantor" }) }).catch(err => { console.warn(`⚠️ Falha ao favoritar artista ${a.id}:`, err.message); return null })))
        }
        this.saveSelectionsToStorage()
        this.createPersonalizedMixes()
        this.saveFollowedArtists()
        this.dispatchDashboardUpdate()
        localStorage.setItem("artistasFavoritos", JSON.stringify(this.selectedArtists.map(a => a.id)))
        localStorage.setItem("onboardingCompleto", "true")
        this.showSuccess = false
        await new Promise(r => setTimeout(r, 300))
        await this.startSplashTransition()
        this.redirectToDashboard()
      } catch (err) {
        console.error('❌ Erro ao finalizar onboarding:', err)
        Swal.fire({ title: "Erro ao salvar 😢", text: err.message || "Não foi possível finalizar o cadastro. Tente novamente.", icon: "error", background: "#121212", color: "#fff", confirmButtonColor: "#ff4757", confirmButtonText: "Entendi", showCancelButton: true, cancelButtonText: "Tentar novamente", cancelButtonColor: "#1DB954" })
      } finally { this.isSaving = false }
    }
  }
}
</script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
.onboarding-container{min-height:100vh;width:100%;background:#0a0a0a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;flex-direction:column;position:relative;overflow-x:hidden}

.dynamic-bg{position:fixed;inset:0;z-index:0;pointer-events:none}
.bg-layer{position:absolute;inset:0;opacity:0;transition:opacity 1s ease;will-change:opacity}
.bg-layer.active{opacity:1}
.noise-overlay{position:absolute;inset:0;opacity:.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");pointer-events:none}

.global-header{position:sticky;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px 32px;background:rgba(10,10,10,.8);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.05)}
.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

.content-area{flex:1;position:relative;z-index:1;overflow-y:auto;overflow-x:hidden;padding:24px 32px;width:100%;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.2) transparent}
.content-area::-webkit-scrollbar{width:6px}
.content-area::-webkit-scrollbar-track{background:transparent}
.content-area::-webkit-scrollbar-thumb{background:rgba(255,255,255,.2);border-radius:3px}
.step-section{min-height:auto;display:flex;flex-direction:column}

.step-header{text-align:center;margin-bottom:32px;position:relative}
.step-header .step-label{display:inline-block;font-size:11px;text-transform:uppercase;letter-spacing:.2em;color:#1DB954;font-weight:700;margin-bottom:12px;padding:6px 14px;background:rgba(29,185,84,.1);border-radius:20px}
.step-header h1{font-size:36px;font-weight:800;margin-bottom:10px;background:linear-gradient(135deg,#fff 0%,#a0a0a0 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.step-header p{font-size:16px;color:#888;margin-bottom:20px}

.selection-counter{display:inline-flex;align-items:center;gap:10px;padding:10px 20px;background:rgba(255,255,255,.05);border-radius:50px;border:2px solid rgba(255,255,255,.1);transition:all .3s ease}
.selection-counter.is-valid{border-color:#1DB954;background:rgba(29,185,84,.1)}
.selection-counter.optional{border-color:#ffc107;background:rgba(255,193,7,.1)}
.counter-ring{width:36px;height:36px;position:relative;flex-shrink:0}
.counter-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.ring-bg{fill:none;stroke:rgba(255,255,255,.1);stroke-width:3}
.ring-progress{fill:none;stroke:#1DB954;stroke-width:3;stroke-linecap:round;transition:stroke-dasharray .5s ease}
.counter-text{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:13px;font-weight:700}
.counter-label{font-size:13px;font-weight:600;color:#888}
.selection-counter.is-valid .counter-label{color:#1ed760}

.loading-state,.error-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:16px;color:#888}
.loading-spinner{width:40px;height:40px;border:3px solid rgba(255,255,255,.1);border-top-color:#1DB954;border-radius:50%;animation:spin .8s linear infinite;will-change:transform}
@keyframes spin{to{transform:rotate(360deg)}}
.btn-retry{padding:10px 24px;background:rgba(29,185,84,.2);border:1px solid #1DB954;border-radius:20px;color:#1DB954;font-weight:600;cursor:pointer;transition:all .3s ease;font-size:14px}
.btn-retry:hover{background:rgba(29,185,84,.3)}
.btn-retry:active{transform:scale(.97)}

.genres-masonry{flex:1;display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;grid-auto-flow:dense;align-content:start;padding-bottom:20px}
.genre-tile{position:relative;aspect-ratio:1;border:none;border-radius:16px;cursor:pointer;overflow:hidden;background:rgba(255,255,255,.03);transition:all .3s cubic-bezier(.4,0,.2,1);animation:scaleIn .5s ease backwards;will-change:transform,box-shadow;contain:layout style;-webkit-tap-highlight-color:transparent}
@keyframes scaleIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
.genre-tile.is-large{grid-column:span 1;grid-row:span 1;aspect-ratio:1}
.genre-tile:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 15px 30px rgba(0,0,0,.4)}
.genre-tile.active{transform:scale(.95)}
.tile-bg{position:absolute;inset:0;opacity:0;transition:opacity .3s ease}
.genre-tile.active .tile-bg{opacity:1}
.tile-content{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:12px}
.genre-emoji{font-size:24px;filter:grayscale(100%);transition:all .3s ease}
.genre-tile.active .genre-emoji{filter:grayscale(0%);transform:scale(1.1)}
.is-large .genre-emoji{font-size:28px}
.genre-name{font-size:12px;font-weight:700;color:rgba(255,255,255,.8);text-align:center;line-height:1.2}
.genre-tile.active .genre-name{color:#fff}
.is-large .genre-name{font-size:14px}
.tile-check{position:absolute;top:8px;right:8px;width:20px;height:20px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0);transition:all .3s cubic-bezier(.68,-.55,.265,1.55)}
.genre-tile.active .tile-check{opacity:1;transform:scale(1)}
.tile-check svg{width:14px;height:14px;color:var(--genre-color,#1DB954)}
.tile-shine{position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.2) 0%,transparent 50%);opacity:0;transition:opacity .3s ease;pointer-events:none}
.genre-tile:hover .tile-shine{opacity:1}

.artists-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;padding-bottom:20px}
.artist-card-large{position:relative;background:rgba(255,255,255,.03);border-radius:16px;overflow:hidden;cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1);animation:slideUp .5s ease backwards;will-change:transform,box-shadow;contain:layout style;-webkit-tap-highlight-color:transparent}
@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.artist-card-large:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.4)}
.artist-card-large.active{box-shadow:0 0 0 3px #1DB954,0 20px 40px rgba(29,185,84,.2)}
.artist-image{position:relative;aspect-ratio:1;overflow:hidden;background:#1a1a2e}
.artist-image img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease;will-change:transform}
.artist-card-large:hover .artist-image img{transform:scale(1.1)}
.artist-gradient{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.9) 0%,transparent 50%);pointer-events:none}
.selection-indicator{position:absolute;top:10px;right:10px;width:24px;height:24px;background:#1DB954;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0);transition:all .3s cubic-bezier(.68,-.55,.265,1.55);box-shadow:0 3px 10px rgba(29,185,84,.4)}
.artist-card-large.active .selection-indicator{opacity:1;transform:scale(1)}
.selection-indicator svg{width:16px;height:16px;color:#fff}
.artist-info{padding:12px}
.artist-info h3{font-size:14px;font-weight:700;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff}
.artist-info p{font-size:12px;color:#888;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.popularity-bar{height:3px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;margin-bottom:4px}
.popularity-fill{height:100%;background:linear-gradient(90deg,#1DB954 0%,#1ed760 100%);border-radius:2px;transition:width .5s ease;will-change:width}
.popularity-label{font-size:10px;color:#666}

.vibes-showcase{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;padding-bottom:20px}
.vibe-showcase-card{position:relative;border-radius:20px;overflow:hidden;cursor:pointer;transition:all .3s cubic-bezier(.4,0,.2,1);min-height:160px;animation:fadeInUp .6s ease backwards;will-change:transform,box-shadow;contain:layout style;-webkit-tap-highlight-color:transparent}
@keyframes fadeInUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
.vibe-showcase-card:hover{transform:translateY(-4px) scale(1.01);box-shadow:0 20px 40px rgba(0,0,0,.4)}
.vibe-showcase-card.active{box-shadow:0 0 0 3px #fff,0 20px 40px rgba(0,0,0,.5)}
.vibe-bg{position:absolute;inset:0;opacity:.9;transition:opacity .3s ease}
.vibe-showcase-card:hover .vibe-bg{opacity:1}
.vibe-illustration{position:absolute;top:16px;right:16px}
.vibe-emoji-large{font-size:44px;display:block;animation:float 3s ease-in-out infinite;will-change:transform}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.floating-notes{position:absolute;top:-16px;right:-16px;font-size:20px;color:rgba(255,255,255,.3)}
.note{position:absolute;animation:noteFloat 2s ease-in-out infinite;will-change:transform,opacity}
.note:nth-child(1){animation-delay:0s;left:0}
.note:nth-child(2){animation-delay:.5s;left:16px}
.note:nth-child(3){animation-delay:1s;left:32px}
@keyframes noteFloat{0%,100%{opacity:0;transform:translateY(0)}50%{opacity:1;transform:translateY(-16px)}}
.vibe-content{position:relative;z-index:2;padding:16px;height:100%;display:flex;flex-direction:column;justify-content:flex-end}
.vibe-content h3{font-size:20px;font-weight:800;margin-bottom:4px;text-shadow:0 2px 4px rgba(0,0,0,.3);color:#fff}
.vibe-content p{font-size:12px;opacity:.9;margin-bottom:10px;line-height:1.4;color:rgba(255,255,255,.85)}
.vibe-tags{display:flex;flex-wrap:wrap;gap:6px}
.vibe-tag{font-size:10px;padding:4px 8px;background:rgba(255,255,255,.2);border-radius:16px;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#fff}
.vibe-check{position:absolute;top:16px;left:16px;width:32px;height:32px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(0);transition:all .3s cubic-bezier(.68,-.55,.265,1.55)}
.vibe-showcase-card.active .vibe-check{opacity:1;transform:scale(1)}
.vibe-check svg{width:20px;height:20px;color:#333}

.preview-bar{position:sticky;bottom:90px;left:50%;transform:translateX(-50%) translateY(100px);max-width:700px;width:90%;background:rgba(30,30,30,.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-radius:50px;padding:14px 20px;opacity:0;transition:all .4s cubic-bezier(.4,0,.2,1);z-index:50;border:1px solid rgba(255,255,255,.1);will-change:transform,opacity}
.preview-bar.expanded{transform:translateX(-50%) translateY(0);opacity:1}
.preview-content{display:flex;align-items:center;justify-content:space-between;gap:14px}
.preview-chips{display:flex;align-items:center;gap:6px;flex-wrap:wrap;overflow:hidden}
.preview-chip{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:16px;font-size:12px;font-weight:600;animation:chipIn .3s ease;flex-shrink:0;max-width:140px}
.preview-chip span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@keyframes chipIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
.chip-enter-active,.chip-leave-active{transition:all .3s ease}
.chip-enter-from,.chip-leave-to{opacity:0;transform:scale(.8)}
.chip-move{transition:transform .3s ease}
.remove-chip-btn{width:16px;height:16px;border-radius:50%;border:none;background:rgba(0,0,0,.3);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s ease;flex-shrink:0;-webkit-tap-highlight-color:transparent}
.remove-chip-btn:hover{background:rgba(255,68,68,.8)}
.remove-chip-btn:active{transform:scale(.9)}
.remove-chip-btn svg{width:10px;height:10px}
.more-indicator{font-size:12px;color:#888;font-weight:600;flex-shrink:0}
.preview-count{font-size:13px;color:#888;font-weight:600;white-space:nowrap;flex-shrink:0}

.step-footer{position:sticky;bottom:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:20px 32px;background:rgba(10,10,10,.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,.05);z-index:100;gap:12px}
.btn-nav{display:flex;align-items:center;gap:6px;padding:12px 24px;border-radius:25px;font-size:15px;font-weight:700;cursor:pointer;transition:all .3s ease;border:none;outline:none;-webkit-tap-highlight-color:transparent}
.btn-nav:focus-visible{outline:2px solid #1DB954;outline-offset:2px}
.btn-nav svg{width:18px;height:18px;flex-shrink:0}
.btn-prev{background:transparent;color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.2)}
.btn-prev:hover:not(:disabled){border-color:rgba(255,255,255,.4);color:#fff}
.btn-prev:active:not(:disabled){transform:scale(.97)}
.btn-prev:disabled{opacity:.3;cursor:not-allowed}
.btn-next{background:rgba(255,255,255,.1);color:rgba(255,255,255,.5);cursor:not-allowed}
.btn-primary{background:linear-gradient(135deg,#1DB954 0%,#1ed760 100%)!important;color:#fff!important;cursor:pointer!important;box-shadow:0 8px 25px rgba(29,185,84,.3)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 35px rgba(29,185,84,.4)}
.btn-primary:active{transform:translateY(0) scale(.98)}
.btn-disabled{opacity:.5;cursor:not-allowed}
.btn-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block;will-change:transform}

.success-modal{position:fixed;inset:0;background:rgba(0,0,0,.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;z-index:1000;animation:fadeIn .3s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.btn-back-modal{position:absolute;top:24px;left:24px;display:flex;align-items:center;gap:8px;padding:12px 20px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:25px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;transition:all .3s ease;z-index:10;-webkit-tap-highlight-color:transparent}
.btn-back-modal:hover{background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.4);transform:translateX(-3px)}
.btn-back-modal:active{transform:translateX(-3px) scale(.97)}
.btn-back-modal svg{width:20px;height:20px;flex-shrink:0}
.success-content{text-align:center;max-width:500px;padding:40px;animation:scaleIn .5s ease .1s both}
.success-icon{width:90px;height:90px;background:linear-gradient(135deg,#1DB954 0%,#1ed760 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;box-shadow:0 15px 50px rgba(29,185,84,.4);animation:pulse 2s infinite;will-change:transform}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.success-icon svg{width:45px;height:45px;color:#fff}
.success-content h2{font-size:28px;font-weight:800;margin-bottom:10px;color:#fff}
.success-content p{font-size:16px;color:#888;margin-bottom:24px}
.summary-tags{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:32px}
.summary-tag{padding:8px 16px;background:rgba(255,255,255,.1);border-radius:20px;font-size:14px;font-weight:600;color:#fff}
.btn-start{padding:16px 40px;background:linear-gradient(135deg,#1DB954 0%,#1ed760 100%);border:none;border-radius:30px;color:#fff;font-size:16px;font-weight:700;cursor:pointer;transition:all .3s ease;box-shadow:0 10px 30px rgba(29,185,84,.3);-webkit-tap-highlight-color:transparent}
.btn-start:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 15px 40px rgba(29,185,84,.4)}
.btn-start:active:not(:disabled){transform:translateY(0) scale(.98)}
.btn-start:disabled{opacity:.6;cursor:not-allowed}
.modal-enter-active,.modal-leave-active{transition:all .3s ease}
.modal-enter-from,.modal-leave-to{opacity:0}

.splash-overlay{position:fixed;inset:0;background:#0a0a0a;z-index:9999;display:flex;align-items:center;justify-content:center;overflow:hidden}
.splash-content{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:2rem;width:100%;max-width:400px;padding:2rem}
.splash-logo-wrapper{position:relative;width:130px;height:130px;display:flex;align-items:center;justify-content:center}
.splash-logo-glow{position:absolute;inset:-25px;background:radial-gradient(circle,rgba(29,185,84,.35) 0%,transparent 70%);border-radius:50%;animation:glowPulse 2.5s ease-in-out infinite;will-change:transform,opacity}
@keyframes glowPulse{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.15);opacity:.9}}
.splash-logo{position:relative;width:72px;height:72px;background:linear-gradient(135deg,#1db954 0%,#1ed760 100%);border-radius:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 16px 40px rgba(29,185,84,.35),inset 0 1px 0 rgba(255,255,255,.25)}
.sound-wave{position:absolute;display:flex;align-items:flex-end;gap:3px;height:24px;opacity:.25}
.sound-wave span{width:3px;background:#fff;border-radius:2px;animation:soundWave 1.2s ease-in-out infinite;will-change:transform}
.sound-wave span:nth-child(1){height:30%}.sound-wave span:nth-child(2){height:60%}.sound-wave span:nth-child(3){height:90%}.sound-wave span:nth-child(4){height:60%}.sound-wave span:nth-child(5){height:30%}
@keyframes soundWave{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
.logo-letter{font-size:2.2rem;font-weight:900;color:#fff;z-index:2}
.splash-ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.ring-track{fill:none;stroke:rgba(255,255,255,.08);stroke-width:2.5}
.ring-fill{fill:none;stroke:url(#splashGradient);stroke-width:3;stroke-linecap:round;transition:stroke-dashoffset .1s linear;filter:drop-shadow(0 0 8px rgba(29,185,84,.4))}
.splash-brand{text-align:center;opacity:0;transform:translateY(15px);transition:all .5s ease}
.splash-brand.show{opacity:1;transform:translateY(0)}
.splash-title{font-size:2.2rem;font-weight:800;margin:0;letter-spacing:-.02em;display:flex;justify-content:center;gap:.06em}
.splash-title span{display:inline-block;opacity:0;transform:translateY(20px);animation:letterPop .5s ease forwards;background:linear-gradient(135deg,#fff 0%,#b0b0b0 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
@keyframes letterPop{to{opacity:1;transform:translateY(0)}}
.splash-subtitle{margin:.6rem 0 0;font-size:.95rem;color:rgba(255,255,255,.5);opacity:0;transform:translateY(10px);transition:all .5s ease .2s}
.splash-subtitle.show{opacity:1;transform:translateY(0)}
.splash-progress-wrapper{width:100%;display:flex;align-items:center;gap:1rem;opacity:0;transform:translateY(15px);transition:all .5s ease}
.splash-progress-wrapper.show{opacity:1;transform:translateY(0)}
.splash-progress-track{flex:1;height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}
.splash-progress-fill{height:100%;background:linear-gradient(90deg,#1db954 0%,#1ed760 100%);border-radius:2px;transition:width .1s linear;position:relative;overflow:hidden}
.splash-progress-shine{position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:shineSlide 1.8s infinite;will-change:left}
@keyframes shineSlide{0%{left:-100%}100%{left:100%}}
.splash-percent{font-size:.85rem;font-weight:700;color:#1ed760;min-width:38px;text-align:right;font-variant-numeric:tabular-nums}
.splash-steps{display:flex;flex-direction:column;gap:.5rem;width:100%;opacity:0;transition:opacity .5s ease}
.splash-steps.show{opacity:1}
.splash-step{display:flex;align-items:center;gap:.75rem;font-size:.8rem;color:rgba(255,255,255,.35);transition:all .3s ease}
.splash-step.active{color:rgba(255,255,255,.85)}
.splash-step.done{color:#1ed760}
.step-dot{width:18px;height:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.step-dot svg{width:14px;height:14px}
.step-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.15);border-top-color:#1ed760;border-radius:50%;animation:spin .7s linear infinite;will-change:transform}
.step-idle{width:6px;height:6px;background:rgba(255,255,255,.2);border-radius:50%;flex-shrink:0}
.splash-particles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.particle{position:absolute;bottom:-5px;background:rgba(255,255,255,.4);border-radius:50%;animation:riseUp linear infinite;will-change:transform,opacity}
@keyframes riseUp{0%{transform:translateY(0) scale(0);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateY(-100vh) scale(1);opacity:0}}
.expand-circle{position:absolute;width:100px;height:100px;background:#1db954;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);transition:transform .7s cubic-bezier(.34,1.56,.64,1);z-index:100;will-change:transform}
.expand-circle.expand{transform:translate(-50%,-50%) scale(50)}
/* ✅ ADICIONAR no style */
.back-to-profile-bar {
  position: sticky;
  top: 73px; /* abaixo do header */
  left: 0;
  right: 0;
  z-index: 90;
  display: flex;
  justify-content: center;
  padding: 8px 0;
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(10px);
}

.btn-back-to-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back-to-profile:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  transform: translateX(-3px);
}

.btn-back-to-profile:active {
  transform: scale(0.97);
}

.btn-back-to-profile svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
@media(max-width:1024px){.global-header{padding:14px 20px}.content-area{padding:20px}.step-header h1{font-size:28px}.genres-masonry{grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px}.artists-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px}.vibes-showcase{grid-template-columns:1fr}.step-footer{padding:16px 20px}.btn-nav{padding:10px 18px;font-size:14px}}
@media(max-width:480px){.step-header h1{font-size:24px}.genre-tile.is-large{grid-column:span 1;grid-row:span 1}.preview-bar{bottom:80px;padding:10px 14px;width:95%}.preview-chip{padding:5px 10px;font-size:11px}.btn-back-modal{top:16px;left:16px;padding:10px 16px;font-size:13px}.btn-back-modal svg{width:18px;height:18px}.success-content{padding:24px}.success-content h2{font-size:22px}}
@media(prefers-reduced-motion:reduce){.splash-logo-glow,.sound-wave span,.splash-progress-shine,.particle,.step-spinner,.loading-spinner,.btn-spinner{animation:none}.splash-title span{opacity:1;transform:none;animation:none}.genre-tile,.artist-card-large,.vibe-showcase-card,.btn-nav,.btn-start,.btn-back-modal,.btn-retry{transition:none}.genre-tile:hover,.artist-card-large:hover,.vibe-showcase-card:hover,.btn-primary:hover,.btn-start:hover{transform:none}.content-area{scroll-behavior:auto}}
@media(prefers-contrast:more){.step-header h1{-webkit-text-fill-color:#fff;background:none}.selection-counter{border-width:3px}.artist-card-large.active,.vibe-showcase-card.active{outline:3px solid #fff;outline-offset:2px}}
</style>