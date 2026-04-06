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
            <h1>Gêneros Musicais</h1>
          </div>
          <p class="subtitle">Explore e gerencie sua biblioteca musical</p>
        </div>
      </header>

      <!-- Search Bar -->
      <div class="search-section">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="filtro"
            type="text"
            placeholder="Buscar gênero..."
            class="input-filtro"
          />
          <span class="search-hint" v-if="filtro">Pressione ESC para limpar</span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">🎸</span>
          <div class="stat-info">
            <span class="stat-value">{{ generos.length }}</span>
            <span class="stat-label">Gêneros</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🎶</span>
          <div class="stat-info">
            <span class="stat-value">{{ musicas.length }}</span>
            <span class="stat-label">Músicas</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📊</span>
          <div class="stat-info">
            <span class="stat-value">{{ generosComQtd.reduce((acc, g) => acc + g.quantidade, 0) }}</span>
            <span class="stat-label">Total Vinculadas</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Quantidade</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <template v-for="g in generosFiltrados">
              <!-- Main Row -->
              <tr :class="{ 'expanded': expandedGenero === g._id }">
                <td>
                  <div class="genre-info">
                    <span class="genre-icon">🎼</span>
                    <span class="genre-name">{{ g.nome }}</span>
                  </div>
                </td>
                <td>
                  <span class="genre-desc">{{ g.descricao || 'Sem descrição' }}</span>
                </td>
                <td>
                  <button 
                    class="btn-qtd" 
                    @click="toggleExpand(g._id)"
                    :class="{ 'active': expandedGenero === g._id }"
                  >
                    <span class="qtd-number">{{ g.quantidade }}</span>
                    <span class="qtd-label">{{ g.quantidade === 1 ? 'música' : 'músicas' }}</span>
                    <span class="expand-icon" :class="{ 'rotated': expandedGenero === g._id }">▼</span>
                  </button>
                </td>
                <td class="acoes">
                  <button class="btn-action btn-edit" @click="editarGenero(g)" title="Editar">
                    <span>✏️</span>
                  </button>
                  <button class="btn-action btn-delete" @click="deletarGenero(g._id)" title="Excluir">
                    <span>🗑️</span>
                  </button>
                </td>
              </tr>

              <!-- Expanded Row -->
              <tr v-if="expandedGenero === g._id" class="expanded-row">
                <td colspan="4">
                  <div class="lista-musicas-wrapper">
                    <div class="lista-header">
                      <h4>🎵 Músicas do gênero {{ g.nome }}</h4>
                      <div class="lista-actions">
                        <span class="lista-count">{{ g.listaMusicas.length }} encontrada(s)</span>
                        <!-- ➕ BOTÃO ADICIONAR MÚSICA -->
                        <button 
                          class="btn-add-music" 
                          @click="abrirModalAddMusica(g)"
                        >
                          <span>➕</span> Adicionar Música
                        </button>
                      </div>
                    </div>
                    
                    <div class="lista-musicas">
                      <p v-if="g.listaMusicas.length === 0" class="empty-state">
                        <span class="empty-icon">🎧</span>
                        Nenhuma música vinculada a este gênero
                      </p>

                      <div v-else class="music-grid">
                        <div 
  v-for="m in g.listaMusicas" 
  :key="m._id"
  class="music-card"
>
                          <div class="music-card-content" @click="abrirMusica(m)">
                            <div class="music-cover">
                              <img :src="m.foto || 'https://via.placeholder.com/60x60/7c3aed/ffffff?text=🎵'" :alt="m.nome" />
                              <div class="play-overlay">
                                <span>▶️</span>
                              </div>
                            </div>
                            <div class="music-info">
                              <span class="music-name">{{ m.nome }}</span>
                              <span class="music-meta">{{ m.duracao }} • {{ m.humor }}</span>
                            </div>
                          </div>
                          
                          <!-- BOTÃO EXCLUIR MÚSICA -->
                          <button 
                            class="btn-delete-music" 
                            @click.stop="deletarMusica(m)"
                            title="Excluir música"
                          >
                            <span>🗑️</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="generosFiltrados.length === 0" class="empty-table">
          <span class="empty-icon-large">🔍</span>
          <h3>Nenhum gênero encontrado</h3>
          <p>Tente buscar com outro termo</p>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Transition name="modal">
      <div v-if="modoEdicao" class="modal-overlay" @click.self="cancelar">
        <div class="modal glass">
          <div class="modal-header">
            <h2>✏️ Editar Gênero</h2>
            <button class="btn-close" @click="cancelar">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Nome do Gênero</label>
              <input v-model="form.nome" placeholder="Ex: Rock, Jazz, Pop..." class="form-input" />
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <textarea 
                v-model="form.descricao" 
                placeholder="Descreva as características deste gênero..."
                class="form-input textarea"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="cancelar">Cancelar</button>
            <button class="btn-primary" @click="atualizarGenero">
              <span>💾</span> Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Music Modal -->
    <Transition name="modal">
      <div v-if="showMusicaModal" class="modal-overlay" @click.self="showMusicaModal = false">
        <div class="modal modal-music glass" v-if="musicaSelecionada">
          <button class="btn-close-float" @click="showMusicaModal = false">✕</button>
          
          <div class="music-hero">
            <div class="vinyl-record">
              <img :src="musicaSelecionada.foto || 'https://via.placeholder.com/300x300/7c3aed/ffffff?text=🎵'" />
            </div>
          </div>

          <div class="music-details">
            <h2 class="music-title">{{ musicaSelecionada.nome }}</h2>
            
            <div class="music-tags">
              <span class="tag tag-genre">{{ musicaSelecionada.generoId?.nome || 'Sem gênero' }}</span>
              <span class="tag tag-mood">{{ musicaSelecionada.humor }}</span>
              <span class="tag tag-duration">⏱️ {{ musicaSelecionada.duracao }}</span>
            </div>

            <div class="lyrics-section">
              <h4>📝 Letra</h4>
              <div class="lyrics-box">
                <p>{{ musicaSelecionada.letra || 'Letra não disponível' }}</p>
              </div>
            </div>

            <div class="modal-actions">
              <a 
                :href="musicaSelecionada.link" 
                target="_blank" 
                class="btn-listen"
                v-if="musicaSelecionada.link"
              >
                <span>🔗</span> Ouvir Agora
              </a>
              
              <!-- BOTÃO EXCLUIR NO MODAL -->
              <button 
                class="btn-delete-modal" 
                @click="deletarMusica(musicaSelecionada); showMusicaModal = false"
              >
                <span>🗑️</span> Excluir Música
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ➕ MODAL ADICIONAR MÚSICA AO GÊNERO -->
    <Transition name="modal">
      <div v-if="showAddMusicaModal" class="modal-overlay" @click.self="fecharModalAddMusica">
        <div class="modal modal-add-music glass">
          <div class="modal-header">
            <div class="header-with-subtitle">
              <h2>➕ Adicionar Músicas</h2>
              <p class="modal-subtitle" v-if="generoSelecionado">
                Ao gênero: <strong>{{ generoSelecionado.nome }}</strong>
              </p>
            </div>
            <button class="btn-close" @click="fecharModalAddMusica">✕</button>
          </div>

          <!-- Busca de músicas disponíveis -->
          <div class="modal-search">
            <div class="search-wrapper small">
              <span class="search-icon">🔍</span>
              <input 
                v-model="filtroMusicasDisponiveis" 
                type="text" 
                placeholder="Buscar música..."
                class="form-input"
              />
            </div>
            <span class="available-count">
              {{ musicasDisponiveisFiltradas.length }} disponível(is)
            </span>
          </div>

          <div class="modal-body no-padding">
            <!-- Lista de músicas disponíveis -->
            <div class="available-music-list" v-if="musicasDisponiveisFiltradas.length > 0">
              <div 
                v-for="m in musicasDisponiveisFiltradas" 
                :key="m._id"
                class="available-music-item"
                :class="{ 'selected': musicasSelecionadas.includes(m._id) }"
                @click="toggleMusicaSelecao(m._id)"
              >
                <div class="checkbox-wrapper">
                  <div class="custom-checkbox" :class="{ 'checked': musicasSelecionadas.includes(m._id) }">
                    <span v-if="musicasSelecionadas.includes(m._id)">✓</span>
                  </div>
                </div>
                
                <img 
                  :src="m.foto || 'https://via.placeholder.com/50x50/7c3aed/ffffff?text=🎵'" 
                  class="music-thumb"
                  :alt="m.nome"
                />
                
                <div class="available-music-info">
                  <span class="available-music-name">{{ m.nome }}</span>
                  <span class="available-music-meta">
                    {{ m.duracao }} • {{ m.humor }} • Gênero atual: {{ m.genero || 'Nenhum' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="empty-available">
              <span class="empty-icon-large">🎵</span>
              <p v-if="musicasDisponiveis.length === 0">
                Não há músicas disponíveis no banco de dados
              </p>
              <p v-else>
                Nenhuma música encontrada com "{{ filtroMusicasDisponiveis }}"
              </p>
            </div>
          </div>

          <div class="modal-footer" v-if="musicasDisponiveis.length > 0">
            <button class="btn-secondary" @click="fecharModalAddMusica">
              Cancelar
            </button>
            <button 
              class="btn-primary" 
              @click="vincularMusicasAoGenero"
              :disabled="musicasSelecionadas.length === 0"
              :class="{ 'disabled': musicasSelecionadas.length === 0 }"
            >
              <span>➕</span> 
              Vincular {{ musicasSelecionadas.length }} música(s)
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import axios from "axios"

const API_GENEROS = "http://localhost:3002/generos"
const API_MUSICAS = "http://localhost:3002/musicas"

export default {
  name: "TabelaGeneros",

  data() {
    return {
      generos: [],
      musicas: [],
      filtro: "",
      modoEdicao: false,
      expandedGenero: null,
      musicaSelecionada: null,
      showMusicaModal: false,

      // ➕ Novos dados para adicionar música
      showAddMusicaModal: false,
      generoSelecionado: null,
      filtroMusicasDisponiveis: "",
      musicasSelecionadas: [],

      form: {
        id: null,
        nome: "",
        descricao: ""
      }
    }
  },

  computed: {
generosComQtd() {
  return this.generos.map(g => {
    const lista = this.musicas.filter(
      m => String(m.generoId?._id) === String(g._id)
    )

    return {
      ...g,
      quantidade: lista.length,
      listaMusicas: lista
    }
  })
},

    generosFiltrados() {
      return this.generosComQtd.filter(g =>
        g.nome.toLowerCase().includes(this.filtro.toLowerCase())
      )
    },

    // ➕ Computed para músicas disponíveis (que não estão no gênero atual)
    musicasDisponiveis() {
  if (!this.generoSelecionado) return []
  
  return this.musicas.filter(m => m.generoId !== this.generoSelecionado._id)
},

    // ➕ Computed para filtrar músicas disponíveis
    musicasDisponiveisFiltradas() {
      if (!this.filtroMusicasDisponiveis) return this.musicasDisponiveis
      
      const filtro = this.filtroMusicasDisponiveis.toLowerCase()
      return this.musicasDisponiveis.filter(m => 
        m.nome.toLowerCase().includes(filtro) ||
        (m.humor && m.humor.toLowerCase().includes(filtro))
      )
    }
  },

  mounted() {
    this.carregarDados()
    document.addEventListener('keydown', this.handleKeydown)
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
  },

  methods: {
    async carregarDados() {
      try {
        const [resG, resM] = await Promise.all([
          axios.get(API_GENEROS),
          axios.get(API_MUSICAS)
        ])

        this.generos = resG.data
        this.musicas = resM.data
      } catch (err) {
        console.error("Erro ao carregar", err)
      }
    },
    buscarNomeGenero(generoId) {
  const genero = this.generos.find(g => g._id === generoId)
  return genero ? genero.nome : 'Sem gênero'
},

    handleKeydown(e) {
      if (e.key === 'Escape') {
        this.filtro = ''
        this.cancelar()
        this.showMusicaModal = false
        this.fecharModalAddMusica()
      }
    },

   toggleExpand(id) {
  if (this.expandedGenero === id) {
    this.expandedGenero = null
  } else {
    this.expandedGenero = id
  }
},

    abrirMusica(musica) {
      this.musicaSelecionada = musica
      this.showMusicaModal = true
    },

    editarGenero(g) {
      this.form = { ...g, id: g._id }
      this.modoEdicao = true
    },

    async atualizarGenero() {
      await axios.put(`${API_GENEROS}/${this.form.id}`, {
        nome: this.form.nome,
        descricao: this.form.descricao
      })

      this.modoEdicao = false
      this.reset()
      this.carregarDados()
    },

    cancelar() {
      this.modoEdicao = false
      this.reset()
    },

    reset() {
      this.form = { id: null, nome: "", descricao: "" }
    },

    async deletarGenero(id) {
      if (!confirm("Deseja excluir esse gênero?")) return

      await axios.delete(`${API_GENEROS}/${id}`)
      this.carregarDados()
    },

    // 🗑️ DELETAR MÚSICA
    async deletarMusica(musica) {
      if (!confirm(`Deseja excluir a música "${musica.nome}"?`)) return

      try {
        await axios.delete(`${API_MUSICAS}/${musica._id}`)
        
        if (this.musicaSelecionada && this.musicaSelecionada._id === musica._id) {
          this.showMusicaModal = false
          this.musicaSelecionada = null
        }
        
        await this.carregarDados()
      } catch (err) {
        console.error("Erro ao excluir música:", err)
        alert("Erro ao excluir música. Tente novamente.")
      }
    },

    // ➕ NOVOS MÉTODOS PARA ADICIONAR MÚSICA
    abrirModalAddMusica(genero) {
      this.generoSelecionado = genero
      this.musicasSelecionadas = []
      this.filtroMusicasDisponiveis = ""
      this.showAddMusicaModal = true
    },

    fecharModalAddMusica() {
      this.showAddMusicaModal = false
      this.generoSelecionado = null
      this.musicasSelecionadas = []
      this.filtroMusicasDisponiveis = ""
    },

    toggleMusicaSelecao(musicaId) {
      const index = this.musicasSelecionadas.indexOf(musicaId)
      if (index > -1) {
        this.musicasSelecionadas.splice(index, 1)
      } else {
        this.musicasSelecionadas.push(musicaId)
      }
    },

   async vincularMusicasAoGenero() {
  if (this.musicasSelecionadas.length === 0 || !this.generoSelecionado) return

  try {
    const generoId = this.generoSelecionado._id // 🔥 SALVA ANTES

    const promises = this.musicasSelecionadas.map(musicaId => {
      const musica = this.musicas.find(m => m._id === musicaId)
      if (musica) {
        return axios.put(`${API_MUSICAS}/${musicaId}`, {
          nome: musica.nome,
          duracao: musica.duracao,
          humor: musica.humor,
          foto: musica.foto,
          letra: musica.letra,
          link: musica.link,
          generoId: generoId // 🔥 usa aqui
        })
      }
    })

    await Promise.all(promises)

    await this.carregarDados()

    this.fecharModalAddMusica()

    // 🔥 usa o ID salvo
    this.expandedGenero = generoId

  } catch (err) {
    console.error("Erro ao vincular músicas:", err)
    alert("Erro ao vincular músicas. Tente novamente.")
  }
}
  }
}
</script>

<style scoped>
/* ===== CSS Variables ===== */
:root {
  --primary: #8b5cf6;
  --primary-dark: #7c3aed;
  --secondary: #ec4899;
  --accent: #06b6d4;
  --bg-dark: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.6);
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --border: rgba(255, 255, 255, 0.1);
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  --glass: rgba(255, 255, 255, 0.05);
}

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
  margin-bottom: 40px;
  text-align: center;
}

.header-content {
  display: inline-block;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.logo-icon {
  font-size: 3rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -1px;
}

.subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0;
}

/* ===== Search Section ===== */
.search-section {
  margin-bottom: 30px;
}

.search-wrapper {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-wrapper.small {
  max-width: 100%;
  margin: 0;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  opacity: 0.6;
  z-index: 1;
}

.input-filtro {
  width: 100%;
  padding: 16px 20px 16px 50px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
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

.search-hint {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: #64748b;
  opacity: 0;
  transition: opacity 0.3s;
}

.search-wrapper:focus-within .search-hint {
  opacity: 1;
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
  padding: 20px;
  text-align: left;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  padding: 20px;
  color: #e2e8f0;
}

/* Genre Info */
.genre-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.genre-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border-radius: 10px;
}

.genre-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.genre-desc {
  color: #94a3b8;
  font-size: 0.95rem;
}

/* Quantity Button */
.btn-qtd {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-qtd:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn-qtd.active {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.qtd-number {
  font-size: 1.2rem;
}

.qtd-label {
  font-size: 0.8rem;
  opacity: 0.9;
}

.expand-icon {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
  margin-left: 4px;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

/* Actions */
.acoes {
  display: flex;
  gap: 10px;
}

.btn-action {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.1rem;
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

.lista-musicas-wrapper {
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

.lista-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.lista-header h4 {
  margin: 0;
  color: #a78bfa;
  font-size: 1.1rem;
}

.lista-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.lista-count {
  font-size: 0.85rem;
  color: #64748b;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 12px;
  border-radius: 20px;
}

/* ➕ BOTÃO ADICIONAR MÚSICA */
.btn-add-music {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.btn-add-music:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
}

.lista-musicas {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 20px;
}

.empty-state {
  text-align: center;
  color: #64748b;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.music-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.music-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
}

.music-card-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.music-cover {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.music-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
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

.music-card-content:hover .play-overlay {
  opacity: 1;
}

.music-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.music-name {
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-meta {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 2px;
}

/* 🗑️ BOTÃO EXCLUIR MÚSICA */
.btn-delete-music {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
  flex-shrink: 0;
}

.btn-delete-music:hover {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* Empty Table State */
.empty-table {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

.empty-icon-large {
  font-size: 4rem;
  display: block;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-table h3 {
  color: #94a3b8;
  margin: 0 0 10px 0;
}

/* ===== Modals ===== */
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal.glass {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(20px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 0;
}

.header-with-subtitle {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.header-with-subtitle h2 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #fff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modal-subtitle {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.modal-subtitle strong {
  color: #a78bfa;
}

.btn-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.modal-body {
  padding: 24px;
}

.modal-body.no-padding {
  padding: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
}

.btn-primary.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Music Modal Specific */
.modal-music {
  max-width: 450px;
  text-align: center;
  position: relative;
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

.music-hero {
  padding: 40px 40px 20px;
}

.vinyl-record {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  box-shadow: 
    0 0 0 10px rgba(0, 0, 0, 0.3),
    0 20px 60px rgba(0, 0, 0, 0.5);
  animation: spin 20s linear infinite;
}

.vinyl-record::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
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

.music-details {
  padding: 0 40px 40px;
}

.music-title {
  font-size: 1.8rem;
  margin: 0 0 20px;
  background: linear-gradient(135deg, #fff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.music-tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tag {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.tag-genre {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3));
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.tag-mood {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(219, 39, 119, 0.3));
  color: #f472b6;
  border: 1px solid rgba(236, 72, 153, 0.3);
}

.tag-duration {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(8, 145, 178, 0.3));
  color: #22d3ee;
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.lyrics-section {
  text-align: left;
  margin-bottom: 30px;
}

.lyrics-section h4 {
  color: #94a3b8;
  margin: 0 0 12px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.lyrics-box {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 20px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.lyrics-box p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.6;
  white-space: pre-wrap;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-listen {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  text-decoration: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.btn-listen:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(16, 185, 129, 0.4);
}

.btn-delete-modal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: transparent;
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.3);
  padding: 14px 32px;
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

/* ===== MODAL ADICIONAR MÚSICA ===== */
.modal-add-music {
  max-width: 600px;
  max-height: 85vh;
}

.modal-search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 16px;
  gap: 15px;
  flex-wrap: wrap;
}

.modal-search .search-wrapper {
  flex: 1;
  min-width: 200px;
}

.modal-search .form-input {
  width: 100%;
  padding: 12px 16px 12px 45px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.modal-search .form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  background: rgba(0, 0, 0, 0.3);
}

.available-count {
  font-size: 0.85rem;
  color: #94a3b8;
  background: rgba(139, 92, 246, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.available-music-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 24px 24px;
}

.available-music-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid transparent;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.available-music-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(139, 92, 246, 0.3);
}

.available-music-item.selected {
  background: rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
}

.checkbox-wrapper {
  flex-shrink: 0;
}

.custom-checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: white;
  font-size: 0.9rem;
}

.available-music-item:hover .custom-checkbox {
  border-color: #8b5cf6;
}

.custom-checkbox.checked {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border-color: #8b5cf6;
}

.music-thumb {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.available-music-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.available-music-name {
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.available-music-meta {
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 4px;
}

.empty-available {
  text-align: center;
  padding: 60px 24px;
  color: #64748b;
}

.empty-available p {
  margin: 15px 0 0;
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

  h1 {
    font-size: 1.8rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  table {
    font-size: 0.9rem;
  }

  th, td {
    padding: 15px 10px;
  }

  .music-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    margin: 10px;
  }

  .music-card {
    padding: 10px;
  }

  .btn-delete-music {
    width: 32px;
    height: 32px;
  }

  .lista-actions {
    width: 100%;
    justify-content: space-between;
  }

  .modal-search {
    flex-direction: column;
    align-items: stretch;
  }

  .available-count {
    text-align: center;
  }

  .available-music-list {
    padding: 0 16px 16px;
  }
}
</style>