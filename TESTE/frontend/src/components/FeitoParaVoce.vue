<template>
  <div class="onboarding-container">
    <!-- Background Dinâmico -->
    <div class="dynamic-bg">
      <div
        class="bg-layer"
        v-for="(layer, index) in 3"
        :key="index"
        :class="{ active: currentStep === index + 1 }"
        :style="getBgStyle(index + 1)"
      ></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Header Global -->
    <header class="global-header">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span>SoundUp</span>
      </div>
     
      <!-- Steps Indicator -->
      <div class="steps-nav">
        <div
          v-for="step in 3"
          :key="step"
          class="step-dot"
          :class="{
            active: currentStep === step,
            completed: currentStep > step
          }"
          @click="currentStep > step && goToStep(step)"
        >
          <span class="step-number">{{ step }}</span>
          <svg v-if="currentStep > step" class="check-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        <div class="connector-line" :style="{ width: ((currentStep - 1) / 2 * 100) + '%' }"></div>
      </div>

      <button class="btn-skip-header" @click="skipOnboarding">
        Pular
      </button>
    </header>

    <!-- Main Content Area - TELA TOTAL -->
    <main class="content-area">
      <!-- ETAPA 1: GÊNEROS -->
      <section v-show="currentStep === 1" class="step-section" key="step1">
        <div class="step-header">
          <span class="step-label">Etapa 1 de 3</span>
          <h1>Quais gêneros você curte? 🎸</h1>
          <p>Selecione pelo menos 3 para personalizar sua experiência</p>
         
          <div class="selection-counter" :class="{ 'is-valid': selectedGenres.length >= 3 }">
            <div class="counter-ring">
              <svg viewBox="0 0 36 36">
                <path
                  class="ring-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="ring-progress"
                  :stroke-dasharray="genreProgress + ', 100'"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span class="counter-text">{{ selectedGenres.length }}</span>
            </div>
            <span class="counter-label">{{ selectedGenres.length >= 3 ? 'Ótimo!' : 'Selecione 3+' }}</span>
          </div>
        </div>

        <div class="genres-masonry">
          <button
            v-for="(genre, index) in genres"
            :key="genre.id"
            class="genre-tile"
            :class="{
             active: selectedGenres.some(g=>g.id===genre.id),
              'is-large': index % 7 === 0
            }"
            :style="{
              '--genre-color': genre.color,
              '--genre-gradient': genre.gradient,
              animationDelay: index * 0.05 + 's'
            }"
            @click="toggleGenre(genre)"
          >
            <div class="tile-bg" :style="{ background: genre.gradient }"></div>
            <div class="tile-content">
              <span class="genre-emoji">{{ genre.emoji }}</span>
              <span class="genre-name">{{ genre.name }}</span>
            </div>
            <div class="tile-check">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div class="tile-shine"></div>
          </button>
        </div>
      </section>

      <!-- ETAPA 2: ARTISTAS -->
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

        <div class="artists-grid">
          <div
            v-for="(artist, index) in artists"
            :key="artist.id"
            class="artist-card-large"
            :class="{ active: selectedArtists.some(a=>a.id===artist.id) }"
            :style="{ animationDelay: index * 0.04 + 's' }"
            @click="toggleArtist(artist)"
          >
            <div class="artist-image">
              <img :src="artist.photo" :alt="artist.name">
              <div class="artist-gradient"></div>
             
              <div class="selection-indicator">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
            </div>
            <div class="artist-info">
              <h3>{{ artist.name }}</h3>
              <p>{{ artist.genre }}</p>
              <div class="popularity-bar">
                <div class="popularity-fill" :style="{ width: artist.popularity + '%' }"></div>
              </div>
              <span class="popularity-label">{{ artist.popularity }}% popular</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ETAPA 3: VIBES -->
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

        <div class="vibes-showcase">
          <div
            v-for="(vibe, index) in vibes"
            :key="vibe.id"
            class="vibe-showcase-card"
            :class="{ active: selectedVibes.some(v=>v.id===vibe.id) }"
            :style="{
              '--vibe-gradient': vibe.gradient,
              animationDelay: index * 0.08 + 's'
            }"
            @click="toggleVibe(vibe)"
          >
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
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Selected Items Preview Bar -->
    <div class="preview-bar" :class="{ expanded: selectedItems.length > 0 }">
      <div class="preview-content">
        <div class="preview-chips">
          <transition-group name="chip">
            <div
              v-for="item in selectedItems.slice(0, 5)"
              :key="item.name"
              class="preview-chip"
              :style="{ background: item.color || item.gradient }"
            >
              <span>{{ item.emoji || item.name }}</span>
              <button @click.stop="removeItem(item)" class="remove-chip-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </transition-group>
          <span v-if="selectedItems.length > 5" class="more-indicator">
            +{{ selectedItems.length - 5 }}
          </span>
        </div>
        <span class="preview-count">{{ selectedItems.length }} selecionados</span>
      </div>
    </div>

    <!-- Footer Navigation -->
    <footer class="step-footer">
      <button
        class="btn-nav btn-prev"
        :disabled="currentStep === 1"
        @click="prevStep"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
        Voltar
      </button>

      <button
        class="btn-nav btn-next"
        :class="{
          'btn-primary': canProceed,
          'btn-disabled': !canProceed
        }"
        :disabled="!canProceed"
        @click="nextStep"
      >
        {{ currentStep === 3 ? 'Finalizar' : 'Continuar' }}
        <svg v-if="currentStep < 3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
      </button>
    </footer>

    <!-- Success Modal com botão de voltar -->
    <transition name="modal">
      <div v-if="showSuccess" class="success-modal">
        <!-- Botão Voltar no canto esquerdo -->
        <button class="btn-back-modal" @click="goBackFromSuccess">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Voltar
        </button>
       
        <div class="success-content">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
          <h2>Perfil Criado! 🎉</h2>
          <p>Sua experiência musical está pronta</p>
          <div class="summary-tags">
            <span v-for="tag in summaryTags" :key="tag" class="summary-tag">{{ tag }}</span>
          </div>
          <button class="btn-start" @click="finishOnboarding">
            Começar a Ouvir
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "Onboarding",
  data() {
    return {
      currentStep: 1,

   selectedGenres:[],
   selectedArtists:[],
   selectedVibes:[],
   showSuccess:false,

   genres:[],
   artists:[],
   vibes:[]
    }
},
 
async mounted(){
 await Promise.all([
   this.loadGeneros(),
   this.loadCantores(),
   this.loadVibes()
 ])
},

  computed: {
    genreProgress() {
      return Math.min((this.selectedGenres.length / 3) * 100, 100)
    },
    artistProgress() {
      return Math.min((this.selectedArtists.length / 2) * 100, 100)
    },
    vibeProgress() {
      return Math.min((this.selectedVibes.length / 2) * 100, 100)
    },
    canProceed() {
      if (this.currentStep === 1) return this.selectedGenres.length >= 3
      if (this.currentStep === 2) return this.selectedArtists.length >= 2
      return true
    },
selectedItems(){
 return [
   ...this.selectedGenres,
   ...this.selectedArtists,
   ...this.selectedVibes
 ]
},

   summaryTags(){
 return [
  ...this.selectedGenres.slice(0,3).map(g=>g.name),
  ...this.selectedArtists.slice(0,2).map(a=>a.name),
  ...this.selectedVibes.slice(0,2).map(v=>v.name)
 ]
}
  },

  methods: {
async loadGeneros(){
 try{
   const res = await fetch("http://localhost:3002/generos")
   const data = await res.json()

   // backend retorna objeto agrupado
   const generosArray = Object.values(data).flat()

   this.genres = generosArray.map((g,index)=>({
      id:g._id,
      name:g.nome,
      emoji:g.icon || this.getEmoji(g.nome),
      color:g.color || this.getColor(index),
      gradient:this.getGradient(index)
   }))

 }catch(e){
   console.error("Erro gêneros:",e)
 }
},

// ==================== ARTISTAS ====================
async loadCantores(){
 try{

  const res = await fetch("http://localhost:3002/cantores")
  const data = await res.json()

  this.artists = data.map((c,index)=>({
      id:c._id,
      name:c.nome,

      photo:
        c.foto ||
        `https://i.pravatar.cc/400?img=${index+10}`,

      genre:
       c.generos?.length
        ? c.generos.map(g=>g.nome).join(", ")
        : "Sem gênero",

      popularity:
         Math.floor(Math.random()*20)+80
  }))

 }catch(e){
   console.error("Erro cantores:",e)
 }

},

// ==================== VIBES ====================
async loadVibes(){

 try{
   const res = await fetch("http://localhost:3002/vibes")
   const data = await res.json()

   this.vibes = data.map(v=>({

      id:v._id,
      name:v.nome,
      emoji:v.emoji || "🎵",

      gradient:
        v.gradient ||
       "linear-gradient(135deg,#667eea,#764ba2)",

      description:v.descricao,

      tags:v.tags || []

   }))

 }catch(e){
   console.error("Erro vibes:",e)
 }

},

  getEmoji(nome){
 const map={
   pop:"🎵",
   rock:"🎸",
   funk:"🔥",
   hiphop:"🎤",
   eletronica:"🎹",
   gospel:"🙏",
   samba:"🥁",
   sertanejo:"🌾",
   mpb:"🇧🇷"
 }

 const key=nome
  ?.toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .replace(/\s/g,"")

 return map[key] || "🎶"
},

getColor(index){
const colors=[
"#E91E63",
"#F44336",
"#FF9800",
"#00BCD4",
"#9C27B0",
"#4CAF50"
]
return colors[index%colors.length]
},

getGradient(index){
const gradients=[
"linear-gradient(135deg,#E91E63,#F48FB1)",
"linear-gradient(135deg,#F44336,#EF5350)",
"linear-gradient(135deg,#FF9800,#FFB74D)",
"linear-gradient(135deg,#00BCD4,#4DD0E1)",
"linear-gradient(135deg,#9C27B0,#CE93D8)",
"linear-gradient(135deg,#4CAF50,#81C784)"
]

return gradients[index%gradients.length]
},

    getBgStyle(step) {
      const gradients = {
        1: 'radial-gradient(circle at 20% 50%, rgba(233, 30, 99, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%)',
        2: 'radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(138, 43, 226, 0.1) 0%, transparent 50%)',
        3: 'radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(240, 147, 251, 0.1) 0%, transparent 50%)'
      }
      return { background: gradients[step] }
    },

toggleGenre(genre){
 const existe=this.selectedGenres.find(
   g=>g.id===genre.id
 )

 if(existe){
   this.selectedGenres=
    this.selectedGenres.filter(
      g=>g.id!==genre.id
    )
 }else{
   this.selectedGenres.push(genre)
 }
},

toggleArtist(artist){
 const existe=this.selectedArtists.find(
   a=>a.id===artist.id
 )

 if(existe){
  this.selectedArtists=
   this.selectedArtists.filter(
    a=>a.id!==artist.id
   )
 }else{
   this.selectedArtists.push(artist)
 }
},

toggleVibe(vibe){
 const existe=this.selectedVibes.find(
   v=>v.id===vibe.id
 )

 if(existe){
   this.selectedVibes=
    this.selectedVibes.filter(
      v=>v.id!==vibe.id
    )
 }else{
   this.selectedVibes.push(vibe)
 }
},

   removeItem(item){

this.selectedGenres=
 this.selectedGenres.filter(
   g=>g.id!==item.id
 )

this.selectedArtists=
 this.selectedArtists.filter(
   a=>a.id!==item.id
 )

this.selectedVibes=
 this.selectedVibes.filter(
   v=>v.id!==item.id
 )

},

    nextStep() {
      if (this.currentStep === 3) {
        this.showSuccess = true
      } else {
        this.currentStep++
      }
    },

    prevStep() {
      if (this.currentStep > 1) this.currentStep--
    },

    goToStep(step) {
      if (step < this.currentStep) this.currentStep = step
    },

    goBackFromSuccess() {
      this.showSuccess = false
    },

    skipOnboarding() {
      if (confirm('Tem certeza que deseja pular?')) {
        this.finishOnboarding()
      }
    },

 async finishOnboarding(){
 try{
   const usuario = JSON.parse(
      localStorage.getItem("usuario")
   )

   const token = localStorage.getItem("token")

   // 1) salva preferências no usuário
   await fetch(
      `http://localhost:3002/usuarios/${usuario.id}`,
      {
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({
          generos:
            this.selectedGenres.map(g=>g.id),

          artistasFavoritos:
            this.selectedArtists.map(a=>a.id),

          vibesFavoritas:
            this.selectedVibes.map(v=>v.id),

          onboardingCompleto:true
        })
      }
   )


   // 2) cria favoritos dos artistas escolhidos
   await Promise.all(
     this.selectedArtists.map(artist =>
       fetch(
         `http://localhost:3002/favoritas/${artist.id}/favoritar`,
         {
           method:"POST",
           headers:{
             "Content-Type":"application/json",
             Authorization:`Bearer ${token}`
           },
           body: JSON.stringify({
             tipo:"cantor"
           })
         }
       )
     )
   )

   // opcional: salva localmente para refletir rápido em outras páginas
   localStorage.setItem(
      "artistasFavoritos",
      JSON.stringify(
        this.selectedArtists.map(a=>a.id)
      )
   )

   this.$router.push('/dashboard')

 }catch(err){
   console.error(err)
 }
}
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.onboarding-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100vw;
  background: #0a0a0a;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0;
  overflow: hidden;
}

/* Background Dinâmico */
.dynamic-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1s ease;
}

.bg-layer.active {
  opacity: 1;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* Header Global */
.global-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.logo svg {
  width: 26px;
  height: 26px;
  color: #1DB954;
}

/* Steps Navigation */
.steps-nav {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 50px;
}

.step-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: all 0.3s;
}

.step-dot.active {
  background: #1DB954;
  border-color: #1DB954;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.5);
}

.step-dot.completed {
  background: #1DB954;
  border-color: #1DB954;
  cursor: pointer;
}

.step-dot.completed:hover {
  transform: scale(1.15);
}

.step-number {
  font-size: 13px;
  font-weight: 700;
}

.step-dot.completed .step-number {
  display: none;
}

.check-icon {
  width: 18px;
  height: 18px;
  display: none;
}

.step-dot.completed .check-icon {
  display: block;
}

.connector-line {
  position: absolute;
  left: 36px;
  top: 50%;
  height: 2px;
  background: #1DB954;
  transform: translateY(-50%);
  transition: width 0.5s ease;
  z-index: 1;
}

.btn-skip-header {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-skip-header:hover {
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}

/* Content Area - TELA TOTAL */
.content-area {
  flex: 1;
  position: relative;
  z-index: 1;
  margin-top: 70px;
  margin-bottom: 140px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 32px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-track {
  background: transparent;
}

.content-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* Step Sections */
.step-section {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Step Header */
.step-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
}

.step-label {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #1DB954;
  font-weight: 700;
  margin-bottom: 12px;
  padding: 6px 14px;
  background: rgba(29, 185, 84, 0.1);
  border-radius: 20px;
}

.step-header h1 {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #fff 0%, #a0a0a0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.step-header p {
  font-size: 16px;
  color: #888;
  margin-bottom: 20px;
}

/* Selection Counter */
.selection-counter {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.selection-counter.is-valid {
  border-color: #1DB954;
  background: rgba(29, 185, 84, 0.1);
}

.selection-counter.optional {
  border-color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}

.counter-ring {
  width: 36px;
  height: 36px;
  position: relative;
}

.counter-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 3;
}

.ring-progress {
  fill: none;
  stroke: #1DB954;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.counter-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  font-weight: 700;
}

.counter-label {
  font-size: 13px;
  font-weight: 600;
  color: #888;
}

.selection-counter.is-valid .counter-label {
  color: #1ed760;
}

/* Genres Masonry - CORREÇÃO: Tiles grandes reduzidos */
.genres-masonry {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 12px;
  grid-auto-flow: dense;
  align-content: start;
  padding-bottom: 20px;
}

.genre-tile {
  position: relative;
  aspect-ratio: 1;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: scaleIn 0.5s ease backwards;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* CORREÇÃO: Tile grande agora ocupa apenas 1 coluna e 1 linha (tamanho normal) */
.genre-tile.is-large {
  grid-column: span 1;
  grid-row: span 1;
  aspect-ratio: 1;
}

.genre-tile:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
}

.genre-tile.active {
  transform: scale(0.95);
}

.tile-bg {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s;
}

.genre-tile.active .tile-bg {
  opacity: 1;
}

.tile-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
}

.genre-emoji {
  font-size: 24px;
  filter: grayscale(100%);
  transition: all 0.3s;
}

.genre-tile.active .genre-emoji {
  filter: grayscale(0%);
  transform: scale(1.1);
}

.is-large .genre-emoji {
  font-size: 28px;
}

.genre-name {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.genre-tile.active .genre-name {
  color: white;
}

.is-large .genre-name {
  font-size: 14px;
}

.tile-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.genre-tile.active .tile-check {
  opacity: 1;
  transform: scale(1);
}

.tile-check svg {
  width: 14px;
  height: 14px;
  color: var(--genre-color);
}

.tile-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.genre-tile:hover .tile-shine {
  opacity: 1;
}

/* Artists Grid */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding-bottom: 20px;
}

.artist-card-large {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.5s ease backwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.artist-card-large:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.artist-card-large.active {
  box-shadow: 0 0 0 3px #1DB954, 0 20px 40px rgba(29, 185, 84, 0.2);
}

.artist-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.artist-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.artist-card-large:hover .artist-image img {
  transform: scale(1.1);
}

.artist-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%);
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 44px;
  height: 44px;
  background: #1DB954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.artist-card-large:hover .play-button {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}

.play-button svg {
  width: 20px;
  height: 20px;
  color: white;
  margin-left: 2px;
}

.selection-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: #1DB954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 3px 10px rgba(29, 185, 84, 0.4);
}

.artist-card-large.active .selection-indicator {
  opacity: 1;
  transform: scale(1);
}

.selection-indicator svg {
  width: 16px;
  height: 16px;
  color: white;
}

.artist-info {
  padding: 12px;
}

.artist-info h3 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-info p {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.popularity-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.popularity-fill {
  height: 100%;
  background: linear-gradient(90deg, #1DB954 0%, #1ed760 100%);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.popularity-label {
  font-size: 10px;
  color: #666;
}

/* Vibes Showcase */
.vibes-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  padding-bottom: 20px;
}

.vibe-showcase-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 160px;
  animation: fadeInUp 0.6s ease backwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.vibe-showcase-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.vibe-showcase-card.active {
  box-shadow: 0 0 0 3px white, 0 20px 40px rgba(0, 0, 0, 0.5);
}

.vibe-bg {
  position: absolute;
  inset: 0;
  opacity: 0.9;
  transition: opacity 0.3s;
}

.vibe-showcase-card:hover .vibe-bg {
  opacity: 1;
}

.vibe-illustration {
  position: absolute;
  top: 16px;
  right: 16px;
}

.vibe-emoji-large {
  font-size: 44px;
  display: block;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.floating-notes {
  position: absolute;
  top: -16px;
  right: -16px;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.3);
}

.note {
  position: absolute;
  animation: noteFloat 2s ease-in-out infinite;
}

.note:nth-child(1) { animation-delay: 0s; left: 0; }
.note:nth-child(2) { animation-delay: 0.5s; left: 16px; }
.note:nth-child(3) { animation-delay: 1s; left: 32px; }

@keyframes noteFloat {
  0%, 100% { opacity: 0; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-16px); }
}

.vibe-content {
  position: relative;
  z-index: 2;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.vibe-content h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.vibe-content p {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 10px;
  line-height: 1.4;
}

.vibe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.vibe-tag {
  font-size: 10px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.vibe-check {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.vibe-showcase-card.active .vibe-check {
  opacity: 1;
  transform: scale(1);
}

.vibe-check svg {
  width: 20px;
  height: 20px;
  color: #333;
}

/* Preview Bar */
.preview-bar {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  max-width: 700px;
  width: 90%;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 50px;
  padding: 14px 20px;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-bar.expanded {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.preview-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.preview-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  animation: chipIn 0.3s ease;
}

@keyframes chipIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.chip-enter-active,
.chip-leave-active {
  transition: all 0.3s;
}

.chip-enter-from,
.chip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.remove-chip-btn {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.3);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-chip-btn:hover {
  background: rgba(255, 68, 68, 0.8);
}

.remove-chip-btn svg {
  width: 10px;
  height: 10px;
}

.more-indicator {
  font-size: 12px;
  color: #888;
  font-weight: 600;
}

.preview-count {
  font-size: 13px;
  color: #888;
  font-weight: 600;
  white-space: nowrap;
}

/* Footer */
.step-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 100;
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-nav svg {
  width: 18px;
  height: 18px;
}

.btn-prev {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-prev:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}

.btn-prev:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-next {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%) !important;
  color: white !important;
  cursor: pointer !important;
  box-shadow: 0 8px 25px rgba(29, 185, 84, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(29, 185, 84, 0.4);
}

/* Success Modal */
.success-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

/* Botão Voltar no modal */
.btn-back-modal {
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.btn-back-modal:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateX(-3px);
}

.btn-back-modal svg {
  width: 20px;
  height: 20px;
}

.success-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  animation: scaleIn 0.5s ease 0.1s both;
}

.success-icon {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 15px 50px rgba(29, 185, 84, 0.4);
  animation: pulse 2s infinite;
}

.success-icon svg {
  width: 45px;
  height: 45px;
  color: white;
}

.success-content h2 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 10px;
}

.success-content p {
  font-size: 16px;
  color: #888;
  margin-bottom: 24px;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
}

.summary-tag {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.btn-start {
  padding: 16px 40px;
  background: linear-gradient(135deg, #1DB954 0%, #1ed760 100%);
  border: none;
  border-radius: 30px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(29, 185, 84, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(29, 185, 84, 0.4);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .global-header {
    padding: 14px 20px;
  }
 
  .steps-nav {
    gap: 40px;
  }
 
  .content-area {
    padding: 20px;
    margin-top: 65px;
  }
 
  .step-header h1 {
    font-size: 28px;
  }
 
  .genres-masonry {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
 
  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 14px;
  }
 
  .vibes-showcase {
    grid-template-columns: 1fr;
  }
 
  .step-footer {
    padding: 16px 20px;
  }
 
  .btn-nav {
    padding: 10px 18px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .step-header h1 {
    font-size: 24px;
  }
 
  .genre-tile.is-large {
    grid-column: span 1;
    grid-row: span 1;
  }
 
  .preview-bar {
    bottom: 80px;
    padding: 10px 14px;
  }
 
  .preview-chip {
    padding: 5px 10px;
    font-size: 11px;
  }
 
  .btn-back-modal {
    top: 16px;
    left: 16px;
    padding: 10px 16px;
    font-size: 13px;
  }
 
  .btn-back-modal svg {
    width: 18px;
    height: 18px;
  }
}
</style>