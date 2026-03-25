<template>
  <div class="app-container">
    <!-- Background Effects -->
    <div class="bg-gradient"></div>
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>

    <div class="container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">🎵</span>
            <h1>Músicas Cadastradas</h1>
          </div>
          <p class="subtitle">Gerencie sua biblioteca musical</p>
        </div>
        
        <!-- Botão Adicionar Nova Música -->
        <button class="btn-add-new" @click="irParaCadastro">
          <span>➕</span> Nova Música
        </button>
      </header>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">🎶</span>
          <div class="stat-info">
            <span class="stat-value">{{ musicas.length }}</span>
            <span class="stat-label">Total de Músicas</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⏱️</span>
          <div class="stat-info">
            <span class="stat-value">{{ calcularDuracaoTotal() }}</span>
            <span class="stat-label">Duração Total</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🎸</span>
          <div class="stat-info">
            <span class="stat-value">{{ contarGenerosUnicos() }}</span>
            <span class="stat-label">Gêneros</span>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            v-model="filtro" 
            type="text"
            placeholder="Buscar música por nome..."
            class="input-filtro"
          />
          <button v-if="filtro" class="btn-clear" @click="filtro = ''">✕</button>
        </div>
        <span class="results-count" v-if="filtro">
          {{ musicasFiltradas.length }} resultado(s)
        </span>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th class="th-small"></th>
              <th>Capa</th>
              <th>Nome</th>
              <th>Duração</th>
              <th>Humor</th>
              <th>Gênero</th>
              <th>Ouvir</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="musica in musicasFiltradas" :key="musica._id">
              <!-- Linha Principal -->
              <tr :class="{ 'expanded': expandido === musica._id }">
                <td>
                  <button 
                    class="btn-expand" 
                    @click="toggleExpand(musica._id)"
                    :class="{ 'active': expandido === musica._id }"
                  >
                    <span class="expand-icon" :class="{ 'rotated': expandido === musica._id }">▼</span>
                  </button>
                </td>

                <!-- Capa -->
                <td>
                  <div class="cover-wrapper">
                    <img 
                      :src="musica.foto || defaultImage" 
                      class="capa"
                      @error="handleImageError"
                    />
                    <div class="cover-overlay" @click="abrirModal(musica)">
                      <span>👁️</span>
                    </div>
                  </div>
                </td>

                <td>
                  <span class="music-name">{{ musica.nome }}</span>
                </td>

                <td>
                  <span class="duration-badge">
                    <span class="clock-icon">⏱️</span>
                    {{ musica.duracao }}
                  </span>
                </td>

                <td>
                  <span class="mood-badge" :class="getMoodClass(musica.humor)">
                    {{ musica.humor || '---' }}
                  </span>
                </td>

                <!-- Gênero -->
                <td>
                  <span class="genre-badge">
                    {{ getGeneroNome(musica) }}
                  </span>
                </td>

                <!-- Link -->
                <td>
                  <a 
                    v-if="musica.link" 
                    :href="musica.link" 
                    target="_blank" 
                    class="btn-listen-small"
                  >
                    <span>▶️</span>
                  </a>
                  <span v-else class="no-link">---</span>
                </td>

                <td class="acoes">
                  <button class="btn-action btn-edit" @click="editar(musica)" title="Editar">
                    <span>✏️</span>
                  </button>
                  <button class="btn-action btn-delete" @click="deletar(musica._id)" title="Excluir">
                    <span>🗑️</span>
                  </button>
                </td>
              </tr>

              <!-- Linha Expandida -->
              <tr v-if="expandido === musica._id" class="expanded-row">
                <td colspan="8">
                  <div class="expanded-content">
                    <div class="expanded-header">
                      <h4>🎼 Letra</h4>
                      <button class="btn-view-details" @click="abrirModal(musica)">
                        🔍 Ver detalhes completos
                      </button>
                    </div>
                    
                    <div class="lyrics-box">
                      <p v-if="musica.letra" class="letra">{{ musica.letra }}</p>
                      <p v-else class="no-lyrics">Letra não disponível para esta música</p>
                    </div>

                    <div class="expanded-actions">
                      <button class="btn-quick-edit" @click="editar(musica)">
                        ✏️ Editar Música
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Empty States -->
        <div v-if="musicasFiltradas.length === 0 && musicas.length > 0" class="empty-state-table">
          <span class="empty-icon">🔍</span>
          <h3>Nenhuma música encontrada</h3>
          <p>Tente buscar com outro termo</p>
        </div>

        <div v-if="musicas.length === 0" class="empty-state-table">
          <span class="empty-icon">🎵</span>
          <h3>Nenhuma música cadastrada</h3>
          <p>Comece adicionando sua primeira música</p>
          <button class="btn-add-new large" @click="irParaCadastro">
            <span>➕</span> Adicionar Música
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <Transition name="modal">
      <div v-if="modal" class="modal-overlay" @click.self="modal = null">
        <div class="modal glass">
          <button class="btn-close-float" @click="modal = null">✕</button>
          
          <div class="modal-hero">
            <div class="vinyl-record">
              <img :src="modal.foto || defaultImage" @error="handleImageError" />
            </div>
          </div>

          <div class="modal-content">
            <h2 class="modal-title">{{ modal.nome }}</h2>
            
            <div class="modal-tags">
              <span class="tag tag-duration">⏱️ {{ modal.duracao }}</span>
              <span class="tag tag-mood" :class="getMoodClass(modal.humor)">
                {{ modal.humor || 'Sem humor' }}
              </span>
              <span class="tag tag-genre">
                {{ getGeneroNome(modal) }}
              </span>
            </div>

            <div class="lyrics-section-modal">
              <h4>🎼 Letra</h4>
              <div class="lyrics-box-modal">
                <p v-if="modal.letra" class="letra">{{ modal.letra }}</p>
                <p v-else class="no-lyrics">Letra não disponível</p>
              </div>
            </div>

            <div class="modal-actions">
              <a 
                v-if="modal.link" 
                :href="modal.link" 
                target="_blank" 
                class="btn-listen-modal"
              >
                <span>🎧</span> Ouvir Agora
              </a>
              
              <button class="btn-edit-modal" @click="editar(modal); modal = null">
                <span>✏️</span> Editar
              </button>
              
              <button class="btn-delete-modal" @click="deletar(modal._id); modal = null">
                <span>🗑️</span> Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import axios from "axios"

const API = "http://localhost:3002/musicas"

export default {
  name: "MusicasTabela",

  data() {
    return {
      musicas: [],
      expandido: null,
      modal: null,
      defaultImage: "https://via.placeholder.com/60x60/1e293b/a78bfa?text=🎵",
      filtro: ""
    }
  },

  computed: {
    musicasFiltradas() {
      if (!this.filtro) return this.musicas
      
      const filtroLower = this.filtro.toLowerCase()
      return this.musicas.filter(m =>
        m.nome.toLowerCase().includes(filtroLower) ||
        (m.humor && m.humor.toLowerCase().includes(filtroLower)) ||
        this.getGeneroNome(m).toLowerCase().includes(filtroLower)
      )
    }
  },

  mounted() {
    this.carregar()
    document.addEventListener('keydown', this.handleKeydown)
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  },

  methods: {
    async carregar() {
      try {
        const res = await axios.get(API)
        this.musicas = res.data.map(m => ({
          ...m,
          id: m.id || m._id,
        }))
      } catch (err) {
        console.error("Erro ao carregar músicas:", err)
      }
    },

    handleKeydown(e) {
      if (e.key === 'Escape') {
        this.modal = null
        this.expandido = null
        this.filtro = ''
      }
    },

    toggleExpand(id) {
      this.expandido = this.expandido === id ? null : id
    },

    abrirModal(musica) {
      this.modal = { ...musica }
    },

    editar(musica) {
      const id = musica.id || musica._id
      this.$router.push({
        name: "editar-musica",
        params: { id }
      })
    },

    async deletar(id) {
      if (!confirm("Deseja realmente excluir esta música?")) return

      try {
        await axios.delete(`${API}/${id}`)
        this.carregar()
        this.modal = null
      } catch (err) {
        console.error("Erro ao excluir:", err)
        alert("Erro ao excluir música")
      }
    },

    irParaCadastro() {
      this.$router.push({ name: "cadastrar-musica" })
    },

    handleImageError(e) {
      e.target.src = this.defaultImage
    },

    getGeneroNome(musica) {
      return musica.genero?.nome || musica.generoId?.nome || 'Sem gênero'
    },

    getMoodClass(humor) {
      const moods = {
        'Feliz': 'mood-happy',
        'Triste': 'mood-sad',
        'Animado': 'mood-energetic',
        'Calmo': 'mood-calm',
        'Romântico': 'mood-romantic',
        'Melancólico': 'mood-melancholic'
      }
      return moods[humor] || 'mood-default'
    },

    calcularDuracaoTotal() {
      // Simplificação - retorna o total de músicas como string
      return this.musicas.length.toString()
    },

    contarGenerosUnicos() {
      const generos = new Set()
      this.musicas.forEach(m => {
        const nome = this.getGeneroNome(m)
        if (nome !== 'Sem gênero') generos.add(nome)
      })
      return generos.size
    }
  }
}
</script>

<style scoped>
/* ===== Background Effects ===== */
.app-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
}

.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.bg-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  top: -100px;
  right: -100px;
  animation: float 20s infinite ease-in-out;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #ec4899, #be185d);
  bottom: -50px;
  left: -50px;
  animation: float 25s infinite ease-in-out reverse;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  top: 50%;
  left: 50%;
  animation: float 30s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* ===== Container ===== */
.container {
  position: relative;
  z-index: 1;
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Header ===== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  font-size: 2.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.subtitle {
  color: #94a3b8;
  font-size: 1rem;
  margin: 5px 0 0 0;
  padding-left: 55px;
}

.btn-add-new {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-add-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-add-new.large {
  margin-top: 20px;
  padding: 16px 32px;
  font-size: 1rem;
}

/* ===== Stats Grid ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.2);
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3));
  border-radius: 12px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.9rem;
  color: #94a3b8;
}

/* ===== Search Section ===== */
.search-section {
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  opacity: 0.6;
  z-index: 1;
}

.input-filtro {
  width: 100%;
  padding: 14px 45px 14px 50px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-filtro::placeholder {
  color: #64748b;
}

.input-filtro:focus {
  outline: none;
  border-color: #8b5cf6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
}

.btn-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.results-count {
  font-size: 0.9rem;
  color: #94a3b8;
  background: rgba(139, 92, 246, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

/* ===== Table ===== */
.table-container {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3));
}

th {
  padding: 18px 15px;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.th-small {
  width: 60px;
  text-align: center;
}

tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

tbody tr.expanded {
  background: rgba(139, 92, 246, 0.1);
}

td {
  padding: 15px;
  color: #e2e8f0;
  vertical-align: middle;
}

/* Expand Button */
.btn-expand {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-expand:hover {
  background: rgba(139, 92, 246, 0.3);
}

.btn-expand.active {
  background: rgba(139, 92, 246, 0.5);
}

.expand-icon {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

/* Cover Image */
.cover-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
}

.capa {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-wrapper:hover .capa {
  transform: scale(1.1);
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-wrapper:hover .cover-overlay {
  opacity: 1;
}

/* Music Name */
.music-name {
  font-weight: 600;
  color: white;
  font-size: 1rem;
}

/* Badges */
.duration-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(6, 182, 212, 0.2);
}

.clock-icon {
  font-size: 0.8rem;
}

.mood-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid transparent;
}

.mood-happy {
  background: rgba(250, 204, 21, 0.15);
  color: #facc15;
  border-color: rgba(250, 204, 21, 0.3);
}

.mood-sad {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}

.mood-energetic {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

.mood-calm {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

.mood-romantic {
  background: rgba(236, 72, 153, 0.15);
  color: #f472b6;
  border-color: rgba(236, 72, 153, 0.3);
}

.mood-melancholic {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
  border-color: rgba(139, 92, 246, 0.3);
}

.mood-default {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  border-color: rgba(148, 163, 184, 0.3);
}

.genre-badge {
  display: inline-block;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
  color: #e2e8f0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

/* Listen Button */
.btn-listen-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
}

.btn-listen-small:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4);
}

.no-link {
  color: #64748b;
  font-size: 0.9rem;
}

/* Actions */
.acoes {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-edit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
}

/* Expanded Row */
.expanded-row {
  background: rgba(15, 23, 42, 0.5) !important;
}

.expanded-row td {
  padding: 0;
}

.expanded-content {
  padding: 24px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.expanded-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.expanded-header h4 {
  margin: 0;
  color: #a78bfa;
  font-size: 1.1rem;
}

.btn-view-details {
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #a78bfa;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-view-details:hover {
  background: rgba(139, 92, 246, 0.3);
}

.lyrics-box {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.letra {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.6;
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
}

.no-lyrics {
  margin: 0;
  color: #64748b;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.expanded-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-quick-edit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-quick-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

/* Empty States */
.empty-state-table {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

.empty-state-table .empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state-table h3 {
  color: #94a3b8;
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.empty-state-table p {
  margin: 0;
}

/* ===== Modal ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal.glass {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
}

.btn-close-float {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 10;
  transition: all 0.3s;
}

.btn-close-float:hover {
  background: rgba(239, 68, 68, 0.8);
  transform: rotate(90deg);
}

.modal-hero {
  padding: 40px 40px 20px;
  text-align: center;
}

.vinyl-record {
  width: 180px;
  height: 180px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  box-shadow: 
    0 0 0 8px rgba(0, 0, 0, 0.3),
    0 20px 60px rgba(0, 0, 0, 0.5);
  animation: spin 20s linear infinite;
}

.vinyl-record::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: #1e293b;
  border-radius: 50%;
  z-index: 2;
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.vinyl-record img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-content {
  padding: 0 40px 40px;
  text-align: center;
}

.modal-title {
  font-size: 1.8rem;
  margin: 0 0 20px;
  background: linear-gradient(135deg, #fff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modal-tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.tag {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tag-duration {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(8, 145, 178, 0.3));
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.tag-mood {
  border: 1px solid transparent;
}

.tag-genre {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3));
  color: #e2e8f0;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.lyrics-section-modal {
  text-align: left;
  margin-bottom: 25px;
}

.lyrics-section-modal h4 {
  color: #94a3b8;
  margin: 0 0 12px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.lyrics-box-modal {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-listen-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  text-decoration: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.btn-listen-modal:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
}

.btn-edit-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit-modal:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
}

.btn-delete-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: transparent;
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.3);
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-delete-modal:hover {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border-color: transparent;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
}

/* ===== Transitions ===== */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .container {
    padding: 20px;
  }

  .header {
    flex-direction: column;
    text-align: center;
  }

  .subtitle {
    padding-left: 0;
  }

  h1 {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .search-wrapper {
    min-width: 100%;
  }

  table {
    font-size: 0.85rem;
  }

  th, td {
    padding: 12px 8px;
  }

  .cover-wrapper {
    width: 50px;
    height: 50px;
  }

  .acoes {
    flex-direction: column;
    gap: 5px;
  }

  .btn-action {
    width: 32px;
    height: 32px;
  }

  .modal {
    margin: 10px;
  }

  .vinyl-record {
    width: 150px;
    height: 150px;
  }
}
</style>