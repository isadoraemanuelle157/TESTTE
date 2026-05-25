<!-- SplashScreen.vue - Página de Carregamento Profissional -->
<template>
  <div class="splash-screen" :class="{ 'fade-out': isFadingOut }">
    <!-- Background Animado -->
    <div class="splash-background">
      <div class="gradient-mesh">
        <div class="mesh-blob blob-1"></div>
        <div class="mesh-blob blob-2"></div>
        <div class="mesh-blob blob-3"></div>
      </div>
      <div class="particles-container">
        <div 
          v-for="n in 20" 
          :key="n" 
          class="particle"
          :style="getParticleStyle(n)"
        ></div>
      </div>
      <div class="noise-texture"></div>
    </div>

    <!-- Conteúdo Principal -->
    <div class="splash-content">
      <!-- Logo Container -->
      <div class="logo-wrapper" :class="{ 'loaded': loadingProgress > 20 }">
        <div class="logo-glow"></div>
        <div class="logo-container">
          <!-- Ícone de Onda Sonora Animado -->
          <div class="sound-wave-logo">
            <div class="wave-bar" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
          </div>
          <!-- Letra M Estilizada -->
          <div class="logo-mark">M</div>
        </div>
        
        <!-- Anel de Progresso ao redor do logo -->
        <svg class="progress-ring" viewBox="0 0 120 120">
          <circle 
            class="progress-ring-bg" 
            cx="60" cy="60" r="54" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            stroke-width="2"
          />
          <circle 
            class="progress-ring-fill" 
            cx="60" cy="60" r="54" 
            fill="none" 
            stroke="url(#gradient)" 
            stroke-width="3"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeOffset"
            transform="rotate(-90 60 60)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#1db954" />
              <stop offset="100%" stop-color="#1ed760" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <!-- Nome do App -->
      <div class="brand-text" :class="{ 'visible': loadingProgress > 30 }">
        <h1 class="app-name">
          <span v-for="(letter, index) in 'SoundUp'.split('')" 
                :key="index" 
                :style="{ animationDelay: `${index * 0.05}s` }"
                class="letter"
          >
            {{ letter }}
          </span>
        </h1>
        <p class="tagline" :class="{ 'visible': loadingProgress > 50 }">
          Sua música, seu momento, juntos
        </p>
      </div>

      <!-- Indicador de Carregamento -->
      <div class="loading-indicator" :class="{ 'visible': loadingProgress > 40 }">
        <div class="loading-text">
          <span class="loading-dots">
            {{ loadingText }}<span v-for="n in 3" :key="n" :style="{ animationDelay: `${n * 0.2}s` }">.</span>
          </span>
        </div>
        
        <!-- Barra de Progresso Linear -->
        <div class="progress-container">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${loadingProgress}%` }">
              <div class="progress-shine"></div>
            </div>
          </div>
          <span class="progress-percentage">{{ Math.round(loadingProgress) }}%</span>
        </div>

        <!-- Status de Carregamento Detalhado -->
        <div class="loading-status" :class="{ 'visible': showDetails }">
          <div class="status-item" v-for="(step, index) in loadingSteps" :key="index" :class="{ 'active': currentStep >= index, 'completed': currentStep > index }">
            <div class="status-icon">
              <svg v-if="currentStep > index" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div v-else-if="currentStep === index" class="spinner-mini"></div>
              <div v-else class="status-dot"></div>
            </div>
            <span class="status-label">{{ step }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="splash-footer" :class="{ 'visible': loadingProgress > 60 }">
      <div class="version-info">v2.4.0</div>
      <div class="copyright">© 2026 MusicFlow Inc.</div>
    </div>

    <!-- Transição para App -->
    <div class="transition-overlay" :class="{ 'active': isTransitioning }">
      <div class="expand-circle" :style="{ transform: isTransitioning ? 'scale(50)' : 'scale(0)' }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Estado do carregamento
const loadingProgress = ref(0)
const isFadingOut = ref(false)
const isTransitioning = ref(false)
const currentStep = ref(0)
const showDetails = ref(true)

// Configurações
const loadingSteps = [
  'Conectando aos servidores',
  'Sincronizando biblioteca',
  'Carregando preferências',
  'Preparando experiência'
]

const loadingText = computed(() => {
  if (loadingProgress.value < 25) return 'Inicializando'
  if (loadingProgress.value < 50) return 'Carregando'
  if (loadingProgress.value < 75) return 'Sincronizando'
  return 'Finalizando'
})

// Anel de progresso
const circumference = 2 * Math.PI * 54
const strokeOffset = computed(() => {
  return circumference - (loadingProgress.value / 100) * circumference
})

// Gerar estilos aleatórios para partículas
const getParticleStyle = (n) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 10 + 10
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

// Simular carregamento
onMounted(() => {
  const duration = 4000 // 4 segundos total
  const interval = 40 // atualizar a cada 40ms
  const increment = 100 / (duration / interval)
  
  const timer = setInterval(() => {
    loadingProgress.value += increment + (Math.random() * 0.5)
    
    // Atualizar etapas baseado no progresso
    if (loadingProgress.value > 20) currentStep.value = 0
    if (loadingProgress.value > 40) currentStep.value = 1
    if (loadingProgress.value > 60) currentStep.value = 2
    if (loadingProgress.value > 80) currentStep.value = 3
    
    if (loadingProgress.value >= 100) {
      loadingProgress.value = 100
      clearInterval(timer)
      
      // Iniciar transição para o app
      setTimeout(() => {
        isFadingOut.value = true
        setTimeout(() => {
          isTransitioning.value = true
          // Aqui você emitiria um evento ou navegaria para a próxima tela
          setTimeout(() => {
            console.log('Navegar para o app principal')
          }, 800)
        }, 400)
      }, 500)
    }
  }, interval)
})
</script>

<style scoped>
/* Reset e Base */
.splash-screen {
  position: fixed;
  inset: 0;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 9999;
  transition: opacity 0.6s ease, visibility 0.6s;
}

.splash-screen.fade-out {
  opacity: 0;
  visibility: hidden;
}

/* Background Animado */
.splash-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.gradient-mesh {
  position: absolute;
  inset: 0;
  filter: blur(60px);
  opacity: 0.6;
}

.mesh-blob {
  position: absolute;
  border-radius: 50%;
  animation: float 20s infinite ease-in-out;
}

.blob-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.blob-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  bottom: -150px;
  right: -150px;
  animation-delay: -7s;
}

.blob-3 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Partículas */
.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  bottom: -10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: rise linear infinite;
}

@keyframes rise {
  0% {
    transform: translateY(0) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) scale(1);
    opacity: 0;
  }
}

/* Textura de Ruído */
.noise-texture {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}

/* Conteúdo Principal */
.splash-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

/* Logo */
.logo-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-wrapper.loaded {
  opacity: 1;
  transform: scale(1);
}

.logo-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(29, 185, 84, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.logo-container {
  position: relative;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 20px 40px rgba(29, 185, 84, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

/* Onda Sonora no Logo */
.sound-wave-logo {
  position: absolute;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 30px;
  opacity: 0.3;
}

.wave-bar {
  width: 4px;
  background: white;
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

.wave-bar:nth-child(1) { height: 40%; }
.wave-bar:nth-child(2) { height: 70%; }
.wave-bar:nth-child(3) { height: 100%; }
.wave-bar:nth-child(4) { height: 70%; }
.wave-bar:nth-child(5) { height: 40%; }

@keyframes wave {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}

.logo-mark {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Anel de Progresso */
.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-fill {
  transition: stroke-dashoffset 0.1s linear;
  filter: drop-shadow(0 0 6px rgba(29, 185, 84, 0.5));
}

/* Texto da Marca */
.brand-text {
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.brand-text.visible {
  opacity: 1;
  transform: translateY(0);
}

.app-name {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
  display: flex;
  justify-content: center;
  gap: 0.05em;
}

.letter {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation: letter-in 0.4s ease forwards;
  background: linear-gradient(135deg, #ffffff 0%, #b3b3b3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes letter-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tagline {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.6s ease 0.3s;
}

.tagline.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Indicador de Carregamento */
.loading-indicator {
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.loading-indicator.visible {
  opacity: 1;
  transform: translateY(0);
}

.loading-text {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.loading-dots span {
  display: inline-block;
  animation: dots 1.4s infinite;
  opacity: 0;
}

@keyframes dots {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* Barra de Progresso */
.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1db954 0%, #1ed760 100%);
  border-radius: 2px;
  transition: width 0.1s linear;
  position: relative;
  overflow: hidden;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1db954;
  min-width: 40px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* Status de Carregamento Detalhado */
.loading-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.loading-status.visible {
  opacity: 1;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.status-item.active {
  color: rgba(255, 255, 255, 0.8);
}

.status-item.completed {
  color: #1db954;
}

.status-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.spinner-mini {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
.splash-footer {
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  text-align: center;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.splash-footer.visible {
  opacity: 1;
}

.version-info {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.copyright {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.3);
}

/* Transição para o App */
.transition-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.transition-overlay.active {
  opacity: 1;
}

.expand-circle {
  width: 100px;
  height: 100px;
  background: #1db954;
  border-radius: 50%;
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Responsividade */
@media (max-width: 480px) {
  .logo-wrapper {
    width: 120px;
    height: 120px;
  }
  
  .logo-container {
    width: 64px;
    height: 64px;
    border-radius: 20px;
  }
  
  .logo-mark {
    font-size: 2rem;
  }
  
  .app-name {
    font-size: 2rem;
  }
  
  .tagline {
    font-size: 0.875rem;
  }
}

/* Redução de Movimento */
@media (prefers-reduced-motion: reduce) {
  .mesh-blob,
  .particle,
  .wave-bar,
  .logo-glow,
  .progress-shine {
    animation: none;
  }
  
  .letter {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
</style>