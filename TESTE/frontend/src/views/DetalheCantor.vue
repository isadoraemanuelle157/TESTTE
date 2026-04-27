<template>
  <div class="cantor-detalhe" v-if="!loading && cantor">
    <!-- Hero Section with Banner -->
    <section class="hero" :style="heroStyle">
      <div class="overlay">
        <img :src="cantor.foto" :alt="cantor.nome" class="foto-artista" />
        <div class="hero-info">
          <p class="tag">Artista</p>
          <h1>{{ cantor.nome }}</h1>
          <p class="meta">
            {{ cantor.generos?.map(g => g.nome).join(', ') || 'Sem gênero' }}
            • {{ cantor.seguidoresFormatado || formatarSeguidores(cantor.totalSeguidores) }} fãs
          </p>
          <p class="bio" v-if="cantor.bio">{{ cantor.bio }}</p>

          <div class="hero-actions">
            <button @click="toggleFollow" class="btn-primary" :class="{ 'following': isFollowing }">
              <span v-if="!isFollowing" class="btn-icon">+</span>
              <span v-else class="btn-icon">✓</span>
              {{ isFollowing ? 'Seguindo' : 'Seguir' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="section about-section" v-if="cantor.sobre">
      <div class="section-header">
        <div class="section-icon">👤</div>
        <h2>Sobre</h2>
      </div>
      <p>{{ cantor.sobre }}</p>
    </section>

    <!-- Songs Section -->
    <section class="section" v-if="cantor.musicas?.length">
      <div class="section-header">
        <div class="section-icon">🎵</div>
        <h2>Músicas</h2>
        <span class="count">{{ cantor.musicas.length }}</span>
      </div>
      <div class="list-grid musicas-grid">
        <div v-for="(musica, index) in cantor.musicas" :key="musica._id" class="card musica-card">
          <div class="card-number">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="card-content">
            <strong>{{ musica.nome }}</strong>
            <span class="card-subtitle">{{ cantor.nome }}</span>
          </div>
          <button class="play-btn" title="Tocar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Albums Section -->
    <section class="section" v-if="cantor.albuns?.length">
      <div class="section-header">
        <div class="section-icon">💿</div>
        <h2>Álbuns</h2>
        <span class="count">{{ cantor.albuns.length }}</span>
      </div>
      <div class="list-grid albuns-grid">
        <div v-for="album in cantor.albuns" :key="album._id" class="card album-card">
          <div class="album-cover-wrapper">
            <img v-if="album.foto" :src="album.foto" :alt="album.nome" class="album-cover" />
            <div v-else class="album-cover-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div class="album-overlay">
              <button class="play-btn" title="Tocar álbum">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="album-info">
            <strong>{{ album.nome }}</strong>
            <p>{{ album.descricao }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Shows Section -->
    <section class="section" v-if="shows.length">
      <div class="section-header">
        <div class="section-icon">🎤</div>
        <h2>Próximos Shows</h2>
        <span class="count">{{ shows.length }}</span>
      </div>
      <div class="shows-list">
        <div v-for="show in shows" :key="show._id" class="show-card">
          <div class="show-date">
            <span class="show-day">{{ new Date(show.data).getDate() }}</span>
            <span class="show-month">{{ new Date(show.data).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase() }}</span>
          </div>
          <div class="show-info">
            <strong>{{ show.titulo }}</strong>
            <p>{{ show.cidade }} • {{ show.local }}</p>
          </div>
          <a v-if="show.linkIngressos" :href="show.linkIngressos" target="_blank" class="btn-tickets">
            Ingressos
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7M17 7H7M17 7v10"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  </div>

  <div v-else-if="loading" class="loading-screen">
    <div class="spinner"></div>
    <p>Carregando artista...</p>
  </div>

  <div v-else class="erro">
    <div class="erro-icon">🎸</div>
    <h2>Artista não encontrado</h2>
    <p>Não conseguimos encontrar esse artista no momento.</p>
  </div>
</template>

<script>
export default {
  name: 'CantorDetalhe',
  props: ['id'],

  data() {
    return {
      loading: true,
      cantor: null,
      shows: [],
      isFollowing: false
    }
  },

  computed: {
    heroStyle() {
      return this.cantor?.banner
        ? {
            backgroundImage: `url(${this.cantor.banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }
        : {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)'
          }
    }
  },

  async mounted() {
    await this.carregarDetalhes()
  },

  methods: {
    async carregarDetalhes() {
      try {
        this.loading = true

        const token = localStorage.getItem('token')

        const [cantorRes, showsRes] = await Promise.all([
          fetch(`http://localhost:3002/cantores/${this.id}`),
          fetch(`http://localhost:3002/cantores/${this.id}/shows`)
        ])

        if (!cantorRes.ok) throw new Error('Cantor não encontrado')

        this.cantor = await cantorRes.json()

        if (showsRes.ok) {
          this.shows = await showsRes.json()
        }

        if (token) {
          const seguindoRes = await fetch(
            'http://localhost:3002/follows/usuario/seguindo?tipo=cantor',
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          )

          if (seguindoRes.ok) {
            const seguindo = await seguindoRes.json()
            this.isFollowing = seguindo.some(
              f => String(f.seguindo_id?._id || f.seguindo_id) === String(this.id)
            )
          }
        }
      } catch (error) {
        console.error(error)
        this.cantor = null
      } finally {
        this.loading = false
      }
    },

    async toggleFollow() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const url = this.isFollowing
          ? 'http://localhost:3002/follows/desseguir'
          : 'http://localhost:3002/follows/seguir'

        const method = this.isFollowing ? 'DELETE' : 'POST'

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            seguindo_id: this.id,
            tipo: 'cantor'
          })
        })

        if (!res.ok) throw new Error('Erro ao seguir artista')

        this.isFollowing = !this.isFollowing

        const atual = Number(this.cantor.totalSeguidores || 0)
        this.cantor.totalSeguidores = this.isFollowing ? atual + 1 : Math.max(0, atual - 1)
      } catch (error) {
        console.error(error)
      }
    },

    formatarSeguidores(total) {
      if (!total) return '0'
      if (total >= 1000000) return (total / 1000000).toFixed(1).replace('.0', '') + 'M'
      if (total >= 1000) return (total / 1000).toFixed(1).replace('.0', '') + 'K'
      return String(total)
    },

    formatarData(data) {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
/* ===== RESET & BASE ===== */
.cantor-detalhe {
  --primary: #8b5cf6;
  --primary-hover: #7c3aed;
  --primary-light: rgba(139, 92, 246, 0.15);
  --bg-dark: #0a0a0f;
  --bg-card: rgba(255, 255, 255, 0.03);
  --bg-card-hover: rgba(255, 255, 255, 0.06);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: rgba(255, 255, 255, 0.06);
  --radius: 16px;
  --radius-sm: 10px;
  --shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 48px rgba(0, 0, 0, 0.6);

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-dark);
  min-height: 100vh;
  color: var(--text-primary);
  line-height: 1.6;
}

/* ===== HERO SECTION ===== */
.hero {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 60px;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 10, 15, 0.3) 0%,
    rgba(10, 10, 15, 0.7) 50%,
    var(--bg-dark) 100%
  );
  z-index: 1;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  z-index: 1;
  pointer-events: none;
}

.overlay {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: flex-end;
  gap: 40px;
}

.foto-artista {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-lg), 0 0 60px rgba(139, 92, 246, 0.2);
  flex-shrink: 0;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.foto-artista:hover {
  transform: scale(1.03);
  box-shadow: var(--shadow-lg), 0 0 80px rgba(139, 92, 246, 0.3);
}

.hero-info {
  flex: 1;
  padding-bottom: 8px;
}

.tag {
  display: inline-block;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.hero-info h1 {
  font-size: 56px;
  font-weight: 800;
  margin: 0 0 12px;
  line-height: 1.1;
  letter-spacing: -1.5px;
  background: linear-gradient(135deg, #fff 0%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.meta {
  color: var(--text-secondary);
  font-size: 15px;
  margin: 0 0 16px;
  font-weight: 500;
}

.bio {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 0 24px;
}

.hero-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
  letter-spacing: 0.3px;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary.following {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  box-shadow: none;
  border: 1px solid var(--border);
}

.btn-primary.following:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-icon {
  font-size: 18px;
  font-weight: 400;
}

/* ===== SECTIONS ===== */
.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 32px;
  border-bottom: 1px solid var(--border);
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.section-icon {
  width: 36px;
  height: 36px;
  background: var(--primary-light);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.section h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.count {
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  margin-left: auto;
}

.about-section p {
  color: var(--text-secondary);
  font-size: 17px;
  line-height: 1.8;
  max-width: 800px;
}

/* ===== MUSICAS GRID ===== */
.musicas-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.musica-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: all 0.25s ease;
}

.musica-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(139, 92, 246, 0.2);
  transform: translateX(4px);
}

.card-number {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  min-width: 28px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-content strong {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.musica-card:hover .play-btn {
  opacity: 1;
  transform: scale(1);
}

.play-btn:hover {
  background: var(--primary-hover);
  transform: scale(1.1) !important;
}

/* ===== ALBUNS GRID ===== */
.albuns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.album-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.35s ease;
}

.album-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(139, 92, 246, 0.2);
}

.album-cover-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.album-card:hover .album-cover {
  transform: scale(1.08);
}

.album-cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.album-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-card:hover .album-overlay {
  opacity: 1;
}

.album-overlay .play-btn {
  opacity: 1;
  transform: scale(1);
  width: 56px;
  height: 56px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.album-info {
  padding: 16px;
}

.album-info strong {
  display: block;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-info p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== SHOWS LIST ===== */
.shows-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.show-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all 0.3s ease;
}

.show-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(139, 92, 246, 0.15);
}

.show-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary), #a78bfa);
  border-radius: var(--radius-sm);
  color: white;
  flex-shrink: 0;
}

.show-day {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.show-month {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 2px;
}

.show-info {
  flex: 1;
}

.show-info strong {
  display: block;
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.show-info p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.btn-tickets {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-tickets:hover {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
}

/* ===== LOADING ===== */
.loading-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: var(--bg-dark);
  color: var(--text-secondary);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== ERROR ===== */
.erro {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: var(--bg-dark);
  text-align: center;
  padding: 32px;
}

.erro-icon {
  font-size: 64px;
  opacity: 0.5;
}

.erro h2 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.erro p {
  color: var(--text-muted);
  font-size: 16px;
  margin: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .overlay {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 20px;
    padding-bottom: 40px;
  }

  .foto-artista {
    width: 160px;
    height: 160px;
  }

  .hero-info h1 {
    font-size: 36px;
  }

  .hero {
    min-height: auto;
    padding-top: 60px;
    padding-bottom: 40px;
  }

  .section {
    padding: 32px 20px;
  }

  .albuns-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .show-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-tickets {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .albuns-grid {
    grid-template-columns: 1fr;
  }

  .hero-info h1 {
    font-size: 28px;
  }
}
</style>