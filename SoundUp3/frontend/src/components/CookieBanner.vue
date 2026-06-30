<template>
  <transition name="banner-slide">
    <div v-if="visible" class="cookie-banner">
      <!-- Glow effect -->
      <div class="banner-glow"></div>

      <div class="banner-content">
        <!-- Icon -->
        <div class="banner-icon">
          <i class="fa-solid fa-cookie-bite"></i>
        </div>

        <!-- Text -->
        <div class="banner-text">
          <h4>
            <i class="fa-solid fa-shield-halved"></i>
            Sua privacidade importa
          </h4>
          <p>
            Utilizamos cookies para melhorar sua experiência no SoundUp. 
            Você pode personalizar suas preferências a qualquer momento.
            <router-link to="/cookies" class="learn-more">
              Saiba mais
            </router-link>
          </p>
        </div>

        <!-- Actions -->
        <div class="banner-actions">
          <button class="btn-necessary" @click="acceptNecessary">
            <i class="fa-solid fa-shield-halved"></i>
            Apenas Necessários
          </button>
          <button class="btn-accept" @click="acceptAll">
            <i class="fa-solid fa-check"></i>
            Aceitar Todos
          </button>
        </div>

        <!-- Close -->
        <button class="banner-close" @click="dismiss" aria-label="Fechar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Progress bar (auto-dismiss) -->
      <div class="banner-progress" v-if="progressVisible">
        <div class="progress-bar" :style="{ width: progressWidth + '%' }"></div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'CookieBanner',

  data() {
    return {
      visible: false,
      progressVisible: false,
      progressWidth: 100,
      progressInterval: null
    }
  },

  mounted() {
    // ⏱️ Só mostra se o usuário ainda não interagiu
    const consent = localStorage.getItem('soundup_cookie_consent')
    if (!consent) {
      // Delay de 1.5s para não ser invasivo ao carregar
      setTimeout(() => {
        this.visible = true
        this.startProgress()
      }, 1500)
    }
  },

  beforeDestroy() {
    this.clearProgress()
  },

  methods: {
    acceptAll() {
      localStorage.setItem('soundup_cookie_consent', 'all')
      localStorage.setItem('soundup_cookies_accepted', 'true')
      
      // Ativa todos os cookies no localStorage de preferências
      const allEnabled = [true, true, true, true, true, true]
      localStorage.setItem('soundup_cookie_preferences', JSON.stringify(allEnabled))
      
      this.showAlert('success', 'Cookies Aceitos!', 'Todos os cookies foram ativados.')
      this.closeBanner()
    },

    acceptNecessary() {
      localStorage.setItem('soundup_cookie_consent', 'necessary')
      localStorage.setItem('soundup_cookies_accepted', 'necessary')
      
      // Ativa apenas o necessário (índice 0)
      const prefs = [true, false, false, false, false, false]
      localStorage.setItem('soundup_cookie_preferences', JSON.stringify(prefs))
      
      this.showAlert('info', 'Cookies Necessários', 'Apenas cookies essenciais foram ativados.')
      this.closeBanner()
    },

    dismiss() {
      // Só fecha, não salva nada — vai aparecer de novo depois
      this.closeBanner()
    },

    closeBanner() {
      this.clearProgress()
      this.visible = false
    },

    startProgress() {
      // Barra de progresso de 10s (opcional, para auto-fechar visual)
      this.progressVisible = true
      this.progressWidth = 100
      
      this.progressInterval = setInterval(() => {
        this.progressWidth -= 1
        if (this.progressWidth <= 0) {
          this.clearProgress()
        }
      }, 100) // 100ms * 100 = 10s
    },

    clearProgress() {
      if (this.progressInterval) {
        clearInterval(this.progressInterval)
        this.progressInterval = null
      }
      this.progressVisible = false
    },

    showAlert(type, title, message) {
      // Emite evento pro App.vue ou usa o sistema de alert que você já tem
      this.$emit('alert', { type, title, message })
    }
  }
}
</script>

<style scoped>
/* ===== BANNER ===== */
.cookie-banner {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 1100px;
  z-index: 9999;
  background: linear-gradient(145deg, rgba(20, 20, 30, 0.98), rgba(10, 10, 15, 0.99));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px 28px;
  box-shadow: 
    0 25px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 60px rgba(124, 58, 237, 0.15);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.banner-glow {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.12), transparent 70%);
  pointer-events: none;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 2;
}

/* Icon */
.banner-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f59e0b, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
  animation: icon-float 3s ease-in-out infinite;
}

@keyframes icon-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Text */
.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-text h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-text h4 i {
  color: #fbbf24;
  font-size: 0.9rem;
}

.banner-text p {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  margin: 0;
}

.learn-more {
  color: #fbbf24;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
}

.learn-more:hover {
  color: #f59e0b;
  border-bottom-color: #f59e0b;
}

/* Actions */
.banner-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-necessary,
.btn-accept {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  white-space: nowrap;
}

.btn-necessary {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-necessary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-accept {
  background: linear-gradient(135deg, #f59e0b, #ec4899);
  color: white;
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.btn-accept:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(245, 158, 11, 0.4);
}

/* Close */
.banner-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.banner-close:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #f87171;
  transform: rotate(90deg);
}

/* Progress bar */
.banner-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #ec4899);
  transition: width 0.1s linear;
}

/* ===== TRANSITION ===== */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.banner-slide-enter-from,
.banner-slide-leave-to {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .cookie-banner {
    bottom: 16px;
    left: 16px;
    right: 16px;
    transform: none;
    width: auto;
    max-width: none;
    padding: 20px;
  }

  .banner-content {
    flex-wrap: wrap;
    gap: 16px;
  }

  .banner-text {
    order: 2;
    width: 100%;
  }

  .banner-icon {
    order: 1;
  }

  .banner-actions {
    order: 3;
    width: 100%;
    justify-content: stretch;
  }

  .btn-necessary,
  .btn-accept {
    flex: 1;
    justify-content: center;
  }

  .banner-close {
    order: 1;
    margin-left: auto;
  }
}

@media (max-width: 480px) {
  .cookie-banner {
    border-radius: 20px;
    padding: 16px;
  }

  .banner-icon {
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
  }

  .banner-text h4 {
    font-size: 0.95rem;
  }

  .banner-text p {
    font-size: 0.8rem;
  }

  .btn-necessary,
  .btn-accept {
    padding: 10px 14px;
    font-size: 0.8rem;
  }
}
</style>