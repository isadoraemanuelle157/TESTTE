<template>
  <div class="music-dashboard">
    <!-- Animated Background -->
    <div class="bg-effects">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="sound-waves">
        <div v-for="i in 5" :key="i" class="wave" :style="{ animationDelay: `${i * 0.2}s` }"></div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="content-wrapper">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="brand">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <div class="brand-text">
              <h1>Studio Manager</h1>
              <span>Gerencie seu catálogo musical</span>
            </div>
          </div>
          
          <div class="stats">
            <div class="stat">
              <span class="stat-value">{{ musicas.length }}</span>
              <span class="stat-label">Músicas</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ totalDuration }}</span>
              <span class="stat-label">Minutos</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Card -->
      <main class="main-card">
        <!-- Form Section -->
        <section ref="formSection" class="form-section" :class="{ 'editing': modoEdicao }">
          <div class="section-header">
            <div class="section-icon">
              <span v-if="!modoEdicao">➕</span>
              <span v-else>✏️</span>
            </div>
            <h2>{{ modoEdicao ? 'Editar Música' : 'Nova Música' }}</h2>
            <p class="section-subtitle">
              {{ modoEdicao ? 'Atualize as informações da faixa' : 'Adicione uma nova música ao catálogo' }}
            </p>
          </div>

          <form @submit.prevent="salvarMusica" class="music-form">
            <div class="form-grid">
              <!-- Left Column -->
              <div class="form-column">
                <div class="input-group" :class="{ 'focused': focused === 'nome', 'filled': form.nome }">
                  <div class="input-icon">🎵</div>
                  <input 
                    v-model="form.nome" 
                    type="text" 
                    required
                    @focus="focused = 'nome'"
                    @blur="focused = null"
                    placeholder=" "
                  />
                  <label>Título da música</label>
                </div>

                <div class="input-group" :class="{ 'focused': focused === 'duracao', 'filled': form.duracao }">
                  <div class="input-icon">⏱️</div>
                  <input 
                    v-model="form.duracao" 
                    type="text" 
                    required
                    @focus="focused = 'duracao'"
                    @blur="focused = null"
                    placeholder=" "
                    pattern="[0-9]+:[0-9]{2}"
                  />
                  <label>Duração (ex: 3:45)</label>
                </div>

    <div class="input-group" :class="{ 'focused': focused === 'ano', 'filled': form.ano }">
  <div class="input-icon">📅</div>

  <select
    v-model="form.ano"
    required
    @focus="focused = 'ano'"
    @blur="focused = null"
  >
    <option value="" disabled selected hidden>Selecione o ano</option>
    
 <option
  v-for="ano in anosDisponiveis"
  :key="ano"
  :value="ano"
>
  {{ ano }}s
</option>
  </select>

  <label>Ano da música</label>
</div>

                <div class="input-group" :class="{ 'focused': focused === 'humor', 'filled': form.humor }">
                  <div class="input-icon">🎭</div>
                  <select 
                    v-model="form.humor" 
                    required
                    @focus="focused = 'humor'"
                    @blur="focused = null"
                  >
                    <option value="" disabled>Selecione o humor</option>
                    <option value="😊 Feliz">😊 Feliz</option>
                    <option value="😢 Triste">😢 Triste</option>
                    <option value="💪 Animado">💪 Animado</option>
                    <option value="😌 Relaxante">😌 Relaxante</option>
                    <option value="❤️ Romântico">❤️ Romântico</option>
                    <option value="😤 Raivoso">😤 Raivoso</option>
                  </select>
                  <label>Humor / Vibe</label>
                </div>

                <!-- GÊNEROS - MÚLTIPLOS COM DROPDOWN -->
                <div class="input-group selection-dropdown-group"
                 :class="{
                   'focused': dropdownOpen === 'generos',
                  'filled': form.generos.length > 0 }">
                  <div class="input-icon">🎶</div>
                  
                  <div class="custom-dropdown" :class="{ 'open': dropdownOpen === 'generos' }">
                    <div class="dropdown-trigger" @click.stop="toggleDropdown('generos')">
                      <span class="dropdown-text">
                        {{ form.generos.length > 0 ? `${form.generos.length} gênero(s) selecionado(s)` : 'Selecione os gêneros' }}
                      </span>
                      <span class="dropdown-arrow" :class="{ 'open': dropdownOpen === 'generos' }">▼</span>
                    </div>
                    
                    <transition name="dropdown">
                      <div v-if="dropdownOpen === 'generos'" class="dropdown-panel" @click.stop>
                        <div class="dropdown-search">
                          <input 
                            v-model="searchGeneros" 
                            placeholder="Buscar gênero..." 
                            @click.stop
                          />
                        </div>
                        <div class="dropdown-options">
  <button
    v-for="g in filteredGeneros"
    :key="g._id"
    type="button"
    class="dropdown-option"
    :class="{ selected: form.generos.includes(g._id) }"
    @click.stop="toggleGenero(g._id)"
  >
    <span class="check-icon">✓</span>
    <span class="option-text">{{ g.nome }}</span>
  </button>

  <div v-if="filteredGeneros.length === 0" class="no-results">
    Nenhum gênero encontrado
  </div>
</div>

                      </div>
                    </transition>
                  </div>
                  
                  <label>Gêneros</label>
                  
                  <!-- Tags dos gêneros selecionados -->
                  <div class="selected-tags-inline" v-if="form.generos && form.generos.length > 0">
                    <span 
                      v-for="generoId in form.generos" 
                      :key="generoId" 
                      class="mini-tag"
                    >
                      {{ getGeneroNome(generoId) }}
                      <button type="button" @click="removeGenero(generoId)" class="mini-remove">×</button>
                    </span>
                  </div>
                </div>

                <!-- ÁLBUM - SIMPLES -->
                <div class="input-group" :class="{ 'focused': focused === 'album', 'filled': form.album }">
                  <div class="input-icon">💿</div>
                  <select v-model="form.album" @focus="focused = 'album'" @blur="focused = null">
                    <option value="">Sem álbum (Single)</option>
                    <option 
                      v-for="a in albuns" 
                      :key="a._id" 
                      :value="a._id"
                    >
                      {{ a.nome }}
                    </option>
                  </select>
                  <label>Álbum</label>
                </div>

                <!-- CANTORES - MÚLTIPLOS COM DROPDOWN -->
                <div class="input-group selection-dropdown-group" :class="{ 'focused': dropdownOpen === 'cantores', 'filled': form.cantores.length > 0 }">
                  <div class="input-icon">🎤</div>
                  
                  <div class="custom-dropdown" :class="{ 'open': dropdownOpen === 'cantores' }">
                    <div class="dropdown-trigger" @click.stop="toggleDropdown('cantores')">
                      <span class="dropdown-text">
                        {{ form.cantores.length > 0 ? `${form.cantores.length} cantor(es) selecionado(s)` : 'Selecione os cantores' }}
                      </span>
                      <span class="dropdown-arrow" :class="{ 'open': dropdownOpen === 'cantores' }">▼</span>
                    </div>
                    
                    <transition name="dropdown">
                      <div v-if="dropdownOpen === 'cantores'" class="dropdown-panel" @click.stop>
                        <div class="dropdown-search">
                          <input 
                            v-model="searchCantores" 
                            placeholder="Buscar cantor..." 
                            @click.stop
                          />
                        </div>
                      <div class="dropdown-options">
  <button
    v-for="c in filteredCantores"
    :key="c._id"
    type="button"
    class="dropdown-option"
    :class="{ selected: form.cantores.includes(c._id) }"
    @click.stop="toggleCantor(c._id)"
  >
    <span class="check-icon">✓</span>
    <span class="option-text">{{ c.nome }}</span>
  </button>

  <div v-if="filteredCantores.length === 0" class="no-results">
    Nenhum cantor encontrado
  </div>
</div>

                      </div>
                    </transition>
                  </div>
                  
                  <label>Cantores</label>
                  
                  <!-- Tags dos cantores selecionados -->
                  <div class="selected-tags-inline" v-if="form.cantores.length > 0">
                    <span 
                      v-for="cantorId in form.cantores" 
                      :key="cantorId" 
                      class="mini-tag cantor-tag"
                    >
                      {{ getCantorNome(cantorId) }}
                      <button type="button" @click="removeCantor(cantorId)" class="mini-remove">×</button>
                    </span>
                  </div>
                </div>

                <div class="input-group" :class="{ 'focused': focused === 'link', 'filled': form.link }">
                  <div class="input-icon">🔗</div>
                  <input 
                    v-model="form.link" 
                    type="url" 
                    required
                    @focus="focused = 'link'"
                    @blur="focused = null"
                    placeholder=" "
                  />
                  <label>Link (YouTube/Spotify)</label>
                </div>
              </div>

              <!-- Right Column -->
              <div class="form-column">
                <div class="input-group" :class="{ 'focused': focused === 'foto', 'filled': form.foto }">
                  <div class="input-icon">🖼️</div>
                  <input 
                    v-model="form.foto" 
                    type="text"
                     required
                    @focus="focused = 'foto'"
                    @blur="focused = null"
                    placeholder=" "
                  />
                  <label>URL da capa</label>
                </div>

                <!-- Preview Image -->
                <div class="image-preview" v-if="form.foto && isValidUrl(form.foto)">
                  <img 
                    :src="form.foto" 
                    alt="Preview" 
                    @error="handleImageError"
                    @load="imageLoaded = true"
                  />
                  <div class="preview-overlay" v-if="imageLoaded">
                    <span>✓ Imagem carregada</span>
                  </div>
                  <div class="preview-overlay error" v-else>
                    <span>✗ Erro ao carregar</span>
                  </div>
                </div>
                
                <div class="image-preview placeholder" v-else-if="form.foto">
                  <div class="placeholder-content">
                    <span>🖼️</span>
                    <p>URL inválida ou imagem não encontrada</p>
                  </div>
                </div>

                <div class="input-group textarea-group" :class="{ 'focused': focused === 'letra', 'filled': form.letra }">
                  <div class="input-icon textarea-icon">📝</div>
                  <textarea 
                    v-model="form.letra" 
                    required
                    @focus="focused = 'letra'"
                    @blur="focused = null"
                    placeholder=" "
                    rows="6"
                  ></textarea>
                  <label>Letra da música</label>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button 
                v-if="modoEdicao" 
                type="button" 
                class="btn-secondary"
                @click="cancelarEdicao"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                <span>Cancelar</span>
              </button>

              <button 
                type="submit" 
                class="btn-primary"
                :class="{ 'loading': loading }"
                :disabled="loading"
              >
                <span v-if="!loading" class="btn-content">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="!modoEdicao" d="M12 5v14M5 12h14"/>
                    <path v-else d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  </svg>
                  <span>{{ modoEdicao ? 'Atualizar Música' : 'Adicionar ao Catálogo' }}</span>
                </span>
                <span v-else class="btn-loading">
                  <div class="spinner"></div>
                  <span>Salvando...</span>
                </span>
              </button>
            </div>
          </form>
        </section>

        <!-- Divider -->
        <div class="section-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">🎧</div>
          <div class="divider-line"></div>
        </div>

        <!-- List Section -->
        <section class="list-section">
          <div class="section-header list-header">
            <h2>📚 Catálogo</h2>
            <div class="list-filters">
              <button 
                v-for="filter in ['Todas', 'Feliz', 'Triste', 'Animado', 'Relaxante', 'Romântico', 'Raivoso']" 
                :key="filter"
                :class="['filter-btn', { active: activeFilter === filter }]"
                @click="activeFilter = filter"
              >
                {{ filter }}
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="musicasFiltradas.length === 0" class="empty-state">
            <div class="empty-illustration">
              <div class="vinyl-record">
                <div class="vinyl-grooves"></div>
                <div class="vinyl-label"></div>
              </div>
            </div>
            <h3>Nenhuma música encontrada</h3>
            <p>Comece adicionando sua primeira faixa ao catálogo</p>
          </div>

          <!-- Music Grid -->
          <div v-else-if="Array.isArray(musicasFiltradas) && musicasFiltradas.length > 0" class="music-grid">
            <div 
              v-for="musica in musicasFiltradas" 
              :key="musica._id" 
              class="music-card"
              :class="{ 'playing': playingId === musica._id }"
              @mouseenter="hoveredId = musica._id"
              @mouseleave="hoveredId = null"
            >
              <!-- Image Container -->
              <div class="card-image">
                <img 
                  :src="getImageUrl(musica.foto)" 
                  :alt="musica.nome"
                  @error="$event.target.src = defaultImage"
                />
                
                <!-- Overlay -->
                <div class="image-overlay">
                  <button 
                    class="play-btn"
                    @click="togglePlay(musica)"
                  >
                    <svg v-if="playingId !== musica._id" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  </button>
                  
                </div>

                <!-- Mood Badge -->
                <div class="mood-badge" :class="getMoodClass(musica.humor)">
                  {{ getMoodEmoji(musica.humor) }}
                </div>
              </div>

              <!-- Card Content -->
              <div class="card-content">
                <h3 class="music-title">{{ musica.nome }}</h3>
                <div class="music-meta">
                  <span class="duration">⏱️ {{ musica.duracao }}</span>
                  <span class="year">
  📅 {{ musica.ano || '---' }} ({{ musica.decada || '-' }})
</span>
                  <span class="mood">{{ musica.humor }}</span>
                  <span class="generos">🎶 {{ musica.generos?.map(g => g.nome).join(', ') || 'Sem gênero' }}</span>
                </div>
                
                <div class="cantores" v-if="musica.cantores?.length">
                  🎤 {{ musica.cantores.map(c => c.nome).join(', ') }}
                </div>
                
                <!-- Lyrics Preview -->
                <div class="lyrics-preview">
                  <p>{{ truncateLetra(musica.letra) }}</p>
                </div>
              </div>

              <!-- Card Actions -->
              <div class="card-actions">
                <button 
                  class="action-btn edit"
                  @click="editarMusica(musica)"
                  title="Editar"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                
                <button 
                  class="action-btn delete"
                  @click="confirmarExclusao(musica)"
                  title="Excluir"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>

              <!-- Playing Indicator -->
              <div v-if="playingId === musica._id" class="playing-indicator">
                <div v-for="i in 4" :key="i" class="bar" :style="{ animationDelay: `${i * 0.1}s` }"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Delete Modal -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-content">
          <div class="modal-icon warning">🗑️</div>
          <h3>Excluir Música</h3>
          <p>Tem certeza que deseja excluir <strong>"{{ musicaParaExcluir?.nome }}"</strong>?</p>
          <p class="modal-warning">Esta ação não pode ser desfeita.</p>
          
          <div class="modal-actions">
            <button class="btn-secondary" @click="showDeleteModal = false">
              Manter
            </button>
            <button 
              class="btn-danger" 
              @click="excluirConfirmado"
              :disabled="deleting"
            >
              <span v-if="!deleting">Sim, Excluir</span>
              <div v-else class="btn-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <div class="toast-icon">{{ toast.type === 'success' ? '✓' : '!' }}</div>
        <span>{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios"

const API = "http://localhost:3002/musicas"
const API_GENEROS = "http://localhost:3002/generos"
const API_ALBUNS = "http://localhost:3002/albuns"
const API_CANTORES = "http://localhost:3002/cantores"

// Imagem padrão quando não há URL ou URL inválida
const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='60' fill='%234b5563'%3E🎵%3C/text%3E%3C/svg%3E"

export default {
  name: "Musicas",

  data() {
    return {
      musicas: [],
      generos: [],
      albuns: [],
      cantores: [],
      modoEdicao: false,
      loading: false,
      deleting: false,
      focused: null,
      playingId: null,
      hoveredId: null,
      activeFilter: 'Todas',
      showDeleteModal: false,
      _skipAlbumWatch: false,
      musicaParaExcluir: null,
      imageLoaded: false,
      defaultImage: DEFAULT_IMAGE,
      toast: { show: false, message: '', type: 'success' },
      
      // Dropdown control
      dropdownOpen: null,
      searchGeneros: '',
      searchCantores: '',
      
      // Form com arrays para múltiplos
      form: {
        id: null,
        nome: "",
        duracao: "",
        foto: "",
        humor: "",
        letra: "",
        link: "",
        ano: "",
        generos: [],    // 🔥 Array para múltiplos gêneros
        album: "",      // String única para álbum
        cantores: []    // 🔥 Array para múltiplos cantores
      }
    }
  },

  computed: {
 musicasFiltradas() {
  // 🔒 Garante que é array
  const lista = Array.isArray(this.musicas) ? this.musicas : []
  if (this.activeFilter === 'Todas') return lista
  return lista.filter(m => m && m.humor?.includes(this.activeFilter))
},

anosDisponiveis() {
  const decadas = []
  for (let i = 1920; i <= 2020; i += 10) {
    decadas.push(i)
  }
  return decadas
},

    totalDuration() {
      return this.musicas.reduce((acc, m) => {
        const [min, sec] = m.duracao?.split(':').map(Number) || [0, 0]
        return acc + min + (sec / 60)
      }, 0).toFixed(0)
    },
    
  filteredGeneros() {
    // 🔒 Garante que é array antes de filtrar
    const lista = Array.isArray(this.generos) ? this.generos : []
    if (!this.searchGeneros) return lista
    const s = this.searchGeneros.toLowerCase()
    return lista.filter(g => g && g.nome && g.nome.toLowerCase().includes(s))
  },
  
  filteredCantores() {
    // 🔒 Garante que é array antes de filtrar
    const lista = Array.isArray(this.cantores) ? this.cantores : []
    if (!this.searchCantores) return lista
    const s = this.searchCantores.toLowerCase()
    return lista.filter(c => c && c.nome && c.nome.toLowerCase().includes(s))
  }
},

  mounted() {
    this.carregarMusicas()
    this.carregarGeneros()
    this.carregarAlbuns()
    this.carregarCantores()
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('mousedown', this.handleClickOutside)
  },

  beforeUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  },

watch: {
  dropdownOpen() {
    this.searchGeneros = ''
    this.searchCantores = ''
  },
  
  'form.album'(novoAlbum, antigoAlbum) {
    // 🔒 Ignora se estiver carregando dados do editar
    if (this._skipAlbumWatch) return
    
    // Ignora se o valor não mudou de verdade (evita loop no reset)
    if (novoAlbum === antigoAlbum) return
    
    if (!novoAlbum) return

    const album = this.albuns.find(a => a._id === novoAlbum)

    if (album && album.cantores?.length > 0) {
      const cantoresDoAlbum = album.cantores.map(c => 
        typeof c === 'object' ? c._id || c : c
      )
      this.form.cantores = [...new Set([...this.form.cantores, ...cantoresDoAlbum])]
    }
  }
},

  methods: {
    // 🔥 MÉTODOS PARA DROPDOWNS
    toggleDropdown(type) {
      this.dropdownOpen = this.dropdownOpen === type ? null : type
      
    },
    toggleGenero(id) {
  if (this.form.generos.includes(id)) {
    this.form.generos = this.form.generos.filter(g => g !== id)
  } else {
    this.form.generos = [...this.form.generos, id]
  }
},

toggleCantor(id) {
  if (this.form.cantores.includes(id)) {
    this.form.cantores = this.form.cantores.filter(c => c !== id)
  } else {
    this.form.cantores = [...this.form.cantores, id]
  }
},


    handleClickOutside(e) {
      if (!e.target.closest('.custom-dropdown')) {
        this.dropdownOpen = null
      }
    },

getGeneroNome(id) {
  // 🔒 Proteção máxima: garante que this.generos é um array válido
  if (!Array.isArray(this.generos)) return 'Carregando...'
  if (!id) return 'Desconhecido'
  
  const genero = this.generos.find(g => g && g._id === id)
  return genero?.nome || 'Desconhecido'
},

getCantorNome(id) {
  // 🔒 Proteção máxima: garante que this.cantores é um array válido
  if (!Array.isArray(this.cantores)) return 'Carregando...'
  if (!id) return 'Desconhecido'
  
  const cantor = this.cantores.find(c => c && c._id === id)
  return cantor?.nome || 'Desconhecido'
},

    removeGenero(id) {
      this.form.generos = this.form.generos.filter(g => g !== id)
    },

    removeCantor(id) {
      this.form.cantores = this.form.cantores.filter(c => c !== id)
    },

    // Validação de URL
    isValidUrl(string) {
      if (!string) return false
      try {
        new URL(string)
        return true
      } catch (_) {
        return false
      }
    },

    // Retorna URL da imagem ou padrão
    getImageUrl(url) {
      if (!url || !this.isValidUrl(url)) {
        return this.defaultImage
      }
      return url
    },

    // Handler de erro de imagem no preview
    handleImageError() {
      this.imageLoaded = false
      this.showToast('Erro ao carregar imagem. Verifique a URL.', 'error')
    },

forceFloatingLabels() {
  // Força o estado 'filled' em todos os campos para os labels subirem
  // Usa $nextTick para garantir que o DOM foi atualizado
  this.$nextTick(() => {
    // Força reatividade em todos os campos do form
    const formFields = ['nome', 'duracao', 'ano', 'humor', 'album', 'link', 'foto', 'letra']
    
    formFields.forEach(field => {
      // Trigger visual update
      if (this.form[field]) {
        const val = this.form[field]
        this.form[field] = ''
        this.$nextTick(() => {
          this.form[field] = val
        })
      }
    })
  })
},

async carregarGeneros() {
  try {
    const res = await axios.get(API_GENEROS)
    console.log('📦 RESPOSTA GENEROS:', res.data)

    let dados = res.data

    // 🔥 Se vier agrupado (objeto), transforma em array
    if (!Array.isArray(dados) && typeof dados === 'object') {
      dados = Object.values(dados).flat()
    }

    this.generos = Array.isArray(dados) ? dados : []

    console.log('✅ GENEROS TRATADOS:', this.generos)

  } catch (err) {
    console.error('❌ ERRO CARREGAR GENEROS:', err)
    this.generos = []
    this.showToast('Erro ao carregar gêneros', 'error')
  }
},

async carregarAlbuns() {
  try {
    const res = await axios.get(API_ALBUNS)
    this.albuns = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch (err) {
    this.albuns = []
    this.showToast('Erro ao carregar álbuns', 'error')
  }
},

async carregarCantores() {
  try {
    const res = await axios.get(API_CANTORES)
    this.cantores = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch (err) {
    this.cantores = []
    this.showToast('Erro ao carregar cantores', 'error')
  }
},

async carregarMusicas() {
  try {
    const res = await axios.get(API)
    this.musicas = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch (err) {
    this.musicas = []
    this.showToast('Erro ao carregar músicas', 'error')
  }
},

    async salvarMusica() {
      this.loading = true
      try {
        const payload = {
  nome: this.form.nome,
  duracao: this.form.duracao,
  foto: this.form.foto && this.isValidUrl(this.form.foto)
    ? this.form.foto
    : this.defaultImage,
  humor: this.form.humor,
  letra: this.form.letra,
  link: this.form.link,
  ano: this.form.ano,

  generos: this.form.generos || [],
  albuns: this.form.album ? [this.form.album] : [], // 🔥 CORRETO
  cantores: this.form.cantores || []
}

        if (!payload.albuns || payload.albuns.length === 0) {
          delete payload.albuns
        }

        if (this.modoEdicao) {
          await axios.put(`${API}/${this.form.id}`, payload)
          this.showToast('Música atualizada com sucesso!')
        } else {
          await axios.post(API, payload)
          this.showToast('Música adicionada ao catálogo!')
        }

        this.reset()
        this.carregarMusicas()
      } catch (err) {
        this.showToast(err.response?.data?.error || err.message, 'error')
console.error(err)
      } finally {
        this.loading = false
      }
    },

editarMusica(musica) {
  // 🔒 Desativa o watch do álbum temporariamente
  this._skipAlbumWatch = true

  // Garante que todos os IDs sejam strings
  const generoIds = (musica.generos || []).map(g => 
    typeof g === 'object' && g !== null ? g._id?.toString() : String(g)
  ).filter(Boolean)

  const cantorIds = (musica.cantores || []).map(c => 
    typeof c === 'object' && c !== null ? c._id?.toString() : String(c)
  ).filter(Boolean)

  // Pega o ID do álbum (primeiro álbum, se houver)
  let albumId = ""
  if (musica.albuns?.length > 0) {
    const firstAlbum = musica.albuns[0]
    albumId = typeof firstAlbum === 'object' && firstAlbum !== null
      ? firstAlbum._id?.toString() 
      : String(firstAlbum)
  }

  this.form = {
    id: musica._id?.toString() || null,
    nome: musica.nome || "",
    duracao: musica.duracao || "",
    foto: musica.foto || "",
    humor: musica.humor || "",
    letra: musica.letra || "",
    link: musica.link || "",
    ano: musica.ano ? String(musica.ano) : "",
    generos: generoIds,
    album: albumId,
    cantores: cantorIds
  }

  this.modoEdicao = true

  // Força os labels flutuantes a subirem e scrolla para o topo
  this.$nextTick(() => {
    this.forceFloatingLabels()
    this.scrollToForm()
    
    // Reativa o watch do álbum após um delay
    setTimeout(() => {
      this._skipAlbumWatch = false
    }, 500)
  })
},

    confirmarExclusao(musica) {
      this.musicaParaExcluir = musica
      this.showDeleteModal = true
    },

    async excluirConfirmado() {
      if (!this.musicaParaExcluir) return
      this.deleting = true
      
      try {
        await axios.delete(`${API}/${this.musicaParaExcluir._id}`)
        this.showToast('Música excluída')
        this.carregarMusicas()
        this.showDeleteModal = false
      } catch (err) {
        this.showToast('Erro ao excluir', 'error')
      } finally {
        this.deleting = false
        this.musicaParaExcluir = null
      }
    },

    togglePlay(musica) {
      if (this.playingId === musica._id) {
        this.playingId = null
      } else {
        this.playingId = musica._id
        setTimeout(() => this.playingId = null, 3000)
      }
    },

    getMoodClass(humor) {
      const classes = {
        'Feliz': 'mood-happy',
        'Triste': 'mood-sad',
        'Animado': 'mood-energetic',
        'Relaxante': 'mood-relax',
        'Romântico': 'mood-romantic',
        'Raivoso': 'mood-angry'
      }
      return classes[Object.keys(classes).find(k => humor?.includes(k))] || 'mood-default'
    },

    getMoodEmoji(humor) {
      const emojis = {
        'Feliz': '😊',
        'Triste': '😢',
        'Animado': '💪',
        'Relaxante': '😌',
        'Romântico': '❤️',
        'Raivoso': '😤'
      }
      return emojis[Object.keys(emojis).find(k => humor?.includes(k))] || '🎵'
    },

    truncateLetra(letra) {
      if (!letra) return ''
      return letra.length > 60 ? letra.substring(0, 60) + '...' : letra
    },

scrollToForm() {
  this.$nextTick(() => {
    const el = this.$refs.formSection

    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
},

reset() {
  this.form = {
    id: null,
    nome: "",
    duracao: "",
    foto: "",
    humor: "",
    letra: "",
    link: "",
    ano: "",
    generos: [],
    album: "",
    cantores: []
  }
  this.modoEdicao = false
  this.imageLoaded = false
  this.dropdownOpen = null
  this.searchGeneros = ''
  this.searchCantores = ''
  this._skipAlbumWatch = false // Reseta a flag
  
  // Limpa o foco para os labels voltarem ao normal
  this.focused = null
},

    cancelarEdicao() {
      this.reset()
    },

    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => this.toast.show = false, 3000)
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.dropdown-option {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  position: static;
  transform: none;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
  color: inherit;
}

.dropdown-option:hover {
  background: rgba(139, 92, 246, 0.1);
}

.dropdown-option.selected {
  background: rgba(139, 92, 246, 0.2);
}

.dropdown-option:focus {
  outline: none;
}

.dropdown-option:focus-visible {
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
}

.music-dashboard {
  min-height: 100vh;
  background: #020617;
  color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Background Effects */
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: #8b5cf6;
  top: -300px;
  left: -200px;
  animation: float 20s infinite ease-in-out;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: #ec4899;
  bottom: -200px;
  right: -100px;
  animation: float 20s infinite ease-in-out reverse;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: #22c55e;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 10s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(50px, -30px); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.2; }
}

.sound-waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  opacity: 0.1;
}

.wave {
  width: 4px;
  background: linear-gradient(to top, #8b5cf6, transparent);
  border-radius: 2px;
  animation: wave 3s infinite ease-in-out;
  height: 100px;
}

@keyframes wave {
  0%, 100% { height: 50px; }
  50% { height: 150px; }
}

/* Content Wrapper */
.content-wrapper {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Header */
.page-header {
  margin-bottom: 40px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4);
}

.logo svg {
  width: 32px;
  height: 32px;
  color: white;
}

.brand-text h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-text span {
  color: #94a3b8;
  font-size: 0.95rem;
}

.stats {
  display: flex;
  gap: 24px;
}

.stat {
  text-align: center;
  padding: 16px 24px;
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

/* Main Card */
.main-card {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Form Section */
.form-section {
  padding: 40px;
  background: rgba(30, 41, 59, 0.3);
  transition: all 0.3s ease;
}

.form-section.editing {
  background: rgba(139, 92, 246, 0.1);
  border-left: 4px solid #8b5cf6;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-icon {
  width: 64px;
  height: 64px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 16px;
}

.form-section.editing .section-icon {
  background: rgba(245, 158, 11, 0.2);
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.section-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Input Groups */
.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  z-index: 2;
  opacity: 0.6;
  transition: all 0.3s;
}

.input-group.focused .input-icon {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.textarea-icon {
  top: 24px;
  transform: none;
}

.input-group.focused .textarea-icon {
  transform: scale(1.1);
}

input, select, textarea {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  color: #f1f5f9;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

input:focus, select:focus, textarea:focus {
  border-color: #8b5cf6;
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 48px;
}

textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.input-group > label {
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s ease;
  background: transparent;
}

.textarea-group > label {
  top: 24px;
  transform: none;
}

input:focus + label,
input:not(:placeholder-shown) + label,
select:focus + label,
select:valid + label,
textarea:focus + label,
textarea:not(:placeholder-shown) + label,
.input-group.filled label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #8b5cf6;
  background: #111827;
  padding: 0 6px;
  font-weight: 500;
}

/* Força labels a subirem quando o form está preenchido */
.input-group.filled label,
.input-group.focused label,
/* Nova regra: quando o input tem valor (via JS) */
input:not([value=""]) + label,
select:has(option:checked:not([value=""])) + label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #8b5cf6;
  background: #111827;
  padding: 0 6px;
  font-weight: 500;
}

/* LABEL FLUTUANTE PARA DROPDOWNS */
.selection-dropdown-group > label {
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s ease;
  background: transparent;
  z-index: 5;
  opacity: 1;
}
/* LABEL FLUTUANTE PARA DROPDOWNS (GÊNEROS E CANTORES) */
.selection-dropdown-group {
  position: relative;
  padding-top: 10px;
}

/* LABEL SEMPRE FLUTUANTE PARA DROPDOWNS */
.selection-dropdown-group > label {
  top: 0 !important;
  transform: translateY(-50%) scale(0.85) !important;
  color: #8b5cf6 !important;
  background: #111827 !important;
  padding: 0 6px !important;
  font-weight: 500 !important;
  box-shadow: none !important;
}

/* Padding ajustado no trigger para não sobrepor o label */
.selection-dropdown-group .dropdown-trigger {
  padding-top: 20px !important;
  padding-bottom: 12px !important;
}

.selection-dropdown-group.focused .dropdown-trigger,
.selection-dropdown-group.filled .dropdown-trigger {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
}

.textarea-group.filled label,
.textarea-group.focused label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
}

/* ============================================
   DROPDOWN SELECTION (GÊNEROS & CANTORES)
   ============================================ */
.selection-dropdown-group {
  position: relative;
  padding-top: 0;
}
.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 16px 48px;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56px;
}

.dropdown-trigger:hover {
  border-color: rgba(139, 92, 246, 0.4);
}

.custom-dropdown.open .dropdown-trigger {
  border-color: #8b5cf6;
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.dropdown-text {
  font-size: 0.9375rem;
  color: #e2e8f0;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #94a3b8;
  transition: transform 0.3s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
  color: #8b5cf6;
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #0f172a;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 100;
  overflow: hidden;
  animation: dropdownIn 0.2s ease;
}

@keyframes dropdownIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-search {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-search input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
}

.dropdown-search input:focus {
  border-color: #8b5cf6;
}

.dropdown-options {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
}

.dropdown-options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-track {
  background: rgba(139, 92, 246, 0.1);
  border-radius: 3px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 3px;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.dropdown-option:hover {
  background: rgba(139, 92, 246, 0.1);
}

.dropdown-option.selected {
  background: rgba(139, 92, 246, 0.2);
}

.dropdown-option input[type="checkbox"] {
  display: none;
}

.check-icon {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}

.dropdown-option.selected .check-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-color: transparent;
  color: white;
}

.option-text {
  font-size: 0.9375rem;
  color: #e2e8f0;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

/* Selected Tags Inline */
.selected-tags-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-left: 48px;
}

.mini-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  animation: tagIn 0.3s ease;
}

.mini-tag.cantor-tag {
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
}

@keyframes tagIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.mini-remove {
  width: 18px;
  height: 18px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}

.mini-remove:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Transitions */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Image Preview */
.image-preview {
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(139, 92, 246, 0.3);
  background: rgba(15, 23, 42, 0.6);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-preview.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: rgba(239, 68, 68, 0.3);
}

.placeholder-content {
  text-align: center;
  color: #64748b;
}

.placeholder-content span {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
}

.placeholder-content p {
  font-size: 0.875rem;
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(34, 197, 94, 0.9), transparent);
  color: white;
  font-size: 0.875rem;
  text-align: center;
  font-weight: 500;
}

.preview-overlay.error {
  background: linear-gradient(to top, rgba(239, 68, 68, 0.9), transparent);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  color: white;
  box-shadow: 0 4px 15px -3px rgba(139, 92, 246, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.5);
}

.btn-primary.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-secondary:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.btn-content, .btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary svg, .btn-secondary svg {
  width: 20px;
  height: 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Divider */
.section-divider {
  display: flex;
  align-items: center;
  padding: 24px 40px;
  background: rgba(17, 24, 39, 0.5);
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.3), transparent);
}

.divider-icon {
  padding: 0 20px;
  font-size: 1.5rem;
}

/* List Section */
.list-section {
  padding: 40px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.list-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f1f5f9;
}

.list-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover, .filter-btn.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  color: #c4b5fd;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.vinyl-record {
  width: 120px;
  height: 120px;
  background: #1f2937;
  border-radius: 50%;
  margin: 0 auto 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  animation: spin 10s linear infinite;
}

.vinyl-grooves {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  border: 2px solid #374151;
  background: repeating-radial-gradient(
    circle at center,
    #1f2937 0px,
    #1f2937 2px,
    #111827 3px,
    #111827 4px
  );
}

.vinyl-label {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.empty-state p {
  color: #64748b;
}

/* Music Grid */
.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.music-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.music-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
  border-color: rgba(139, 92, 246, 0.3);
}

.music-card.playing {
  border-color: #22c55e;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
}

/* Card Image */
.card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #1f2937;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.music-card:hover .card-image img {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.music-card:hover .image-overlay {
  opacity: 1;
}

.play-btn, .external-link {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.play-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  color: white;
  box-shadow: 0 10px 25px -5px rgba(139, 92, 246, 0.4);
}

.play-btn:hover {
  transform: scale(1.1);
}

.play-btn svg {
  width: 28px;
  height: 28px;
}

.external-link {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.external-link:hover {
  background: rgba(255, 255, 255, 0.3);
}

.external-link svg {
  width: 24px;
  height: 24px;
}

/* Mood Badge */
.mood-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid;
}

.mood-happy { border-color: #fbbf24; }
.mood-sad { border-color: #60a5fa; }
.mood-energetic { border-color: #f87171; }
.mood-relax { border-color: #34d399; }
.mood-romantic { border-color: #f472b6; }
.mood-angry { border-color: #ef4444; }
.mood-default { border-color: #8b5cf6; }

/* Card Content */
.card-content {
  padding: 20px;
}

.music-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.duration {
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* SELECT COM LABEL FLUTUANTE IGUAL INPUT */
select:focus + label,
select:not([value=""]) + label,
.input-group.filled label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #8b5cf6;
  background: #111827;
  padding: 0 6px;
  font-weight: 500;
}

.mood {
  color: #c4b5fd;
  background: rgba(139, 92, 246, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.generos {
  color: #94a3b8;
  font-size: 0.75rem;
}

.cantores {
  font-size: 0.75rem;
  color: #ec4899;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lyrics-preview {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.5;
  font-style: italic;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 8px;
  padding: 0 20px 20px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.edit:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

/* Playing Indicator */
.playing-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 30px;
}

.bar {
  width: 4px;
  background: #22c55e;
  border-radius: 2px;
  animation: equalizer 0.8s ease-in-out infinite;
  height: 100%;
}

@keyframes equalizer {
  0%, 100% { height: 20%; }
  50% { height: 100%; }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1e293b;
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: modalIn 0.3s ease;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.modal-icon.warning {
  color: #f87171;
}

.modal-content h3 {
  font-size: 1.5rem;
  color: #f1f5f9;
  margin-bottom: 12px;
}

.modal-content p {
  color: #94a3b8;
  margin-bottom: 8px;
}

.modal-warning {
  color: #f87171 !important;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-danger {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  animation: toastIn 0.3s ease;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.toast.success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.toast.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.toast-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .stats {
    width: 100%;
    justify-content: center;
  }
  
  .form-section, .list-section {
    padding: 24px;
  }
  
  .music-grid {
    grid-template-columns: 1fr;
  }
  
  .dropdown-panel {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 20px 20px 0 0;
    max-height: 60vh;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
}
</style>