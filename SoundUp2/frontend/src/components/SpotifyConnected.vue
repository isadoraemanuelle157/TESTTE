<<template>
  <div class="spotify-connected-page">
    <div class="connected-card" v-if="success">
      <div class="success-icon">
        <i class="fa fa-spotify"></i>
        <i class="fa fa-check-circle"></i>
      </div>
      <h2>Spotify Conectado!</h2>
      <p>Agora você pode ouvir músicas completas sem limites de 30 segundos.</p>
      <button @click="goToSearch" class="btn-primary">
        <i class="fa fa-search"></i>
        Voltar para Busca
      </button>
    </div>
    
    <div class="connected-card error" v-else-if="error">
      <div class="error-icon">
        <i class="fa fa-spotify"></i>
        <i class="fa fa-times-circle"></i>
      </div>
      <h2>Erro na Conexão</h2>
      <p>{{ errorMessage }}</p>
      <button @click="retry" class="btn-primary">
        <i class="fa fa-refresh"></i>
        Tentar Novamente
      </button>
    </div>
    
    <div class="connected-card loading" v-else>
      <div class="spinner"></div>
      <p>Conectando com Spotify...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpotifyConnected',
  
  data() {
    return {
      success: false,
      error: false,
      errorMessage: ''
    }
  },
  
  mounted() {
    // Verifica query params
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')
    
    if (success === 'true') {
      this.success = true
      // Atualiza status no localStorage para outras abas saberem
      localStorage.setItem('spotify_connected', 'true')
      localStorage.setItem('spotify_connected_at', Date.now().toString())
      
      // Dispara evento para atualizar Search.vue se estiver aberto em outra aba
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'spotify_connected',
        newValue: 'true'
      }))
      
      // Redireciona automaticamente após 3 segundos
      setTimeout(() => {
        this.goToSearch()
      }, 3000)
      
    } else if (error) {
      this.error = true
      this.errorMessage = decodeURIComponent(error)
    } else {
      // Sem params = acesso direto, redireciona
      this.$router.push('/search')
    }
  },
  
  methods: {
    goToSearch() {
      this.$router.push('/search')
    },
    
    retry() {
      this.$router.push('/search')
    }
  }
}
</script>

<style scoped>
.spotify-connected-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
  padding: 24px;
}

.connected-card {
  background: #181818;
  border-radius: 16px;
  padding: 48px 40px;
  text-align: center;
  max-width: 420px;
  width: 100%;
  border: 1px solid rgba(255,255,255,0.1);
}

.connected-card.error {
  border-color: rgba(239, 68, 68, 0.3);
}

.success-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.success-icon .fa-spotify {
  font-size: 64px;
  color: #1db954;
}

.success-icon .fa-check-circle {
  position: absolute;
  bottom: -4px;
  right: -8px;
  font-size: 28px;
  color: #1db954;
  background: #181818;
  border-radius: 50%;
}

.error-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.error-icon .fa-spotify {
  font-size: 64px;
  color: #ef4444;
}

.error-icon .fa-times-circle {
  position: absolute;
  bottom: -4px;
  right: -8px;
  font-size: 28px;
  color: #ef4444;
  background: #181818;
  border-radius: 50%;
}

.connected-card h2 {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px 0;
}

.connected-card p {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.btn-primary {
  padding: 14px 28px;
  background: linear-gradient(135deg, #1db954, #1ed760);
  border: none;
  border-radius: 24px;
  color: #000;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(29,185,84,0.4);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(29,185,84,0.2);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>