<template>
  <div class="albums-studio">
    <!-- Animated Background -->
    <div class="studio-bg">
      <div class="spotlight spotlight-1"></div>
      <div class="spotlight spotlight-2"></div>
      <div class="particles">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="studio-content">
      <!-- Header -->
      <header class="studio-header">
        <div class="header-brand">
          <div class="vinyl-logo">
            <div class="vinyl-disc">
              <div class="vinyl-grooves"></div>
              <div class="vinyl-center">💿</div>
            </div>
          </div>
          <div class="brand-text">
            <h1>Studio Albums</h1>
            <span class="tagline">Crie e gerencie sua discografia</span>
          </div>
        </div>
        
        <div class="studio-stats">
          <div class="stat-box">
            <span class="stat-number">{{ albuns.length }}</span>
            <span class="stat-name">Álbuns</span>
          </div>
          <div class="stat-box">
            <span class="stat-number">{{ totalTracks || '—' }}</span>
            <span class="stat-name">Faixas</span>
          </div>
        </div>
      </header>

      <!-- Main Stage -->
      <main class="main-stage">
        <!-- Form Panel -->
        <section ref="formPanel" class="panel form-panel" :class="{ editing: modoEdicao }">
          <div class="panel-header">
            <div class="panel-badge">{{ modoEdicao ? '✏️' : '➕' }}</div>
            <h2>{{ modoEdicao ? 'Editar Álbum' : 'Novo Álbum' }}</h2>
            <p class="panel-desc">{{ modoEdicao ? 'Atualize as informações do álbum' : 'Adicione um novo álbum à sua coleção' }}</p>
          </div>

          <form @submit.prevent="salvarAlbum" class="album-form">
            <div class="form-row">
              <div class="input-wrap" :class="{ 'active': focused === 'nome', 'filled': form.nome }">
                <span class="input-emoji">🎵</span>
               <input 
  ref="nomeInput"
  v-model="form.nome" 
  type="text" 
  required
  @focus="focused = 'nome'"
  @blur="focused = null"
  placeholder=" "
/>
                <label>Nome do álbum</label>
                <div class="input-glow"></div>
              </div>
            </div>

            <!-- Modern Select - Cantores -->
          <!-- Modern Select - Cantores -->
<div class="input-group modern-select">
  <label class="select-label">
    <span class="label-icon">🎤</span>
    Selecionar Cantor(a)
  </label>

  <div class="select-container" :class="{ open: dropdownOpen === 'cantor' }">
    <div class="select-trigger" @click.stop="toggleDropdown('cantor')">
      <div class="selected-tags">
        <span v-if="!form.cantor" class="placeholder">
          Escolha um artista...
        </span>

        <span v-else class="tag">
          {{ getCantorNome(form.cantor) }}
        <button
  type="button"
  class="tag-remove"
  @click.stop="removeCantor"
>
  ×
</button>
        </span>
      </div>

      <span class="dropdown-arrow" :class="{ open: dropdownOpen === 'cantor' }">▼</span>
    </div>

    <transition name="dropdown">
      <div
        v-if="dropdownOpen === 'cantor'"
        class="dropdown-menu"
        @click.stop
      >
        <div class="dropdown-search">
          <input
            v-model="searchCantores"
            type="text"
            placeholder="Buscar artista..."
            @click.stop
          />
        </div>

        <div class="dropdown-options">
          <button
            v-for="cantor in filteredCantores"
            :key="cantor._id"
            type="button"
            class="option option-button"
            :class="{ selected: form.cantor === cantor._id }"
            @click.stop="selecionarCantor(cantor)"
          >
            <span class="check-icon">✓</span>
            <span class="option-text">{{ cantor.nome }}</span>
          </button>

          <div v-if="filteredCantores.length === 0" class="no-results">
            Nenhum artista encontrado
          </div>
        </div>
      </div>
    </transition>
  </div>

  <small class="hint">
    <span class="hint-icon">💡</span>
    Clique para selecionar um artista
  </small>
</div>


            <!-- Modern Select - Músicas -->
            <div class="input-group modern-select">
  <label class="select-label">
    <span class="label-icon">🎵</span>
    Selecionar Músicas
  </label>

  <div class="select-container" :class="{ open: dropdownOpen === 'musicas' }">

    <div class="select-trigger" @mousedown.stop="toggleDropdown('musicas')">
      <div class="selected-tags">
        <span v-if="form.musicas.length === 0" class="placeholder">
          Escolha as músicas...
        </span>

        <span v-for="id in form.musicas" :key="id" class="tag">
          {{ getMusicaNome(id) }}
          <button type="button" @mousedown.stop="removeMusica(id)" class="tag-remove">×</button>

        </span>
      </div>

      <span class="dropdown-arrow" :class="{ open: dropdownOpen === 'musicas' }">▼</span>
    </div>

    <transition name="dropdown">
      <div v-if="dropdownOpen === 'musicas'" class="dropdown-menu" @mousedown.stop>

        <div class="dropdown-search">
          <input v-model="searchMusicas" placeholder="Buscar música..." />
        </div>

        <div class="dropdown-options">
          <label
            v-for="musica in filteredMusicas"
            :key="musica._id"
            class="option"
            :class="{ selected: form.musicas.includes(musica._id) }"
          >
            <input type="checkbox" :value="musica._id" v-model="form.musicas" />
            <span class="check-icon">✓</span>
            <span class="option-text">{{ musica.nome }}</span>
          </label>
                      <div v-if="filteredMusicas.length === 0" class="no-results">
                        Nenhuma música encontrada
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
              
              <small class="hint">
                <span class="hint-icon">💡</span>
                Clique para selecionar múltiplas músicas
              </small>
            </div>

            <!-- Modern Select - Gêneros -->
            <div class="input-group modern-select">
  <label class="select-label">
    <span class="label-icon">🎸</span>
    Selecionar Gênero(s)
  </label>

  <div class="select-container" :class="{ open: dropdownOpen === 'generos' }">

    <div class="select-trigger" @mousedown.stop="toggleDropdown('generos')">
      <div class="selected-tags">
        <span v-if="form.generos.length === 0" class="placeholder">
          Escolha os gêneros...
        </span>

        <span
          v-for="id in form.generos"
          :key="id"
          class="tag"
          :style="{ background: getGeneroColor(id) }"
        >
          {{ getGeneroNome(id) }}
          <button type="button" @mousedown.stop="removeGenero(id)" class="tag-remove">×</button>

        </span>
      </div>

      <span class="dropdown-arrow" :class="{ open: dropdownOpen === 'generos' }">▼</span>
    </div>

    <transition name="dropdown">
      <div v-if="dropdownOpen === 'generos'" class="dropdown-menu" @mousedown.stop>

        <div class="dropdown-search">
          <input v-model="searchGeneros" placeholder="Buscar gênero..." />
        </div>

        <div class="dropdown-options">
          <label
            v-for="genero in filteredGeneros"
            :key="genero._id"
            class="option"
            :class="{ selected: form.generos.includes(genero._id) }"
          >
            <input type="checkbox" :value="genero._id" v-model="form.generos" />
            <span class="check-icon">✓</span>
            <span class="option-text">{{ genero.nome }}</span>
          </label>
                      <div v-if="filteredGeneros.length === 0" class="no-results">
                        Nenhum gênero encontrado
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
              
              <small class="hint">
                <span class="hint-icon">💡</span>
                Clique para selecionar múltiplos gêneros
              </small>
            </div>

            <div class="form-row">
              <div class="input-wrap" :class="{ 'active': focused === 'foto', 'filled': form.foto }">
                <span class="input-emoji">🖼️</span>
                <input 
                  v-model="form.foto" 
                  type="text"
                  @focus="focused = 'foto'"
                  @blur="focused = null"
                  placeholder=" "
                />
                <label>URL da capa (opcional)</label>
                <div class="input-glow"></div>
              </div>
            </div>

            <!-- Cover Preview -->
            <div v-if="form.foto" class="cover-preview-stage">
              <div class="preview-frame" :class="{ 'error': imageError }">
                <img 
                  v-if="isValidUrl(form.foto) && !imageError"
                  :src="form.foto" 
                  @error="imageError = true"
                  @load="imageError = false"
                  alt="Capa do álbum"
                />
                <div v-else class="preview-placeholder">
                  <span class="placeholder-icon">💿</span>
                  <span class="placeholder-text">Imagem não disponível</span>
                </div>
                <div class="preview-gloss"></div>
              </div>
            </div>

 <!-- Ano do Álbum -->
<div class="input-group modern-select">
  <label class="select-label">
    <span class="label-icon">📅</span>
    Selecionar Década
  </label>

  <div class="select-container">
    <select
      v-model="form.ano"
      required
      class="custom-select"
       :class="{ 'is-placeholder': !form.ano }"
    >
      <option value="" disabled>Escolha a década...</option>
      <option 
        v-for="ano in anosDisponiveis" 
        :key="ano" 
        :value="ano"
      >
        {{ ano }}s
      </option>
    </select>
  </div>

  <small class="hint">
    <span class="hint-icon">💡</span>
    Selecione a década do álbum
  </small>
</div>

            <div class="form-row">
              <div class="input-wrap textarea-wrap" :class="{ 'active': focused === 'descricao', 'filled': form.descricao }">
                <span class="input-emoji textarea-emoji">📝</span>
                <textarea 
                  v-model="form.descricao" 
                  required
                  @focus="focused = 'descricao'"
                  @blur="focused = null"
                  placeholder=" "
                  rows="4"
                ></textarea>
                <label>Descrição do álbum</label>
                <div class="input-glow"></div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                v-if="modoEdicao" 
                type="button" 
                class="btn-cancel"
                @click="cancelarEdicao"
              >
                <span>✕</span>
                Cancelar
              </button>
              
              <button 
                type="submit" 
                class="btn-save"
                :class="{ 'loading': saving }"
                :disabled="saving"
              >
                <span v-if="!saving" class="btn-content">
                  <span>{{ modoEdicao ? '💾 Salvar' : '➕ Criar Álbum' }}</span>
                </span>
                <span v-else class="btn-loading">
                  <div class="save-spinner"></div>
                  Salvando...
                </span>
              </button>
            </div>
          </form>
        </section>

        <!-- Divider -->
        <div class="stage-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">🎧</div>
          <div class="divider-line"></div>
        </div>

        <!-- Collection Panel -->
        <section class="panel collection-panel">
          <div class="panel-header">
            <h2>📀 Sua Coleção</h2>
            <div class="view-toggle">
              <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">⊞</button>
              <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">☰</button>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="albuns.length === 0" class="empty-studio">
            <div class="empty-vinyl">
              <div class="spinning-disc">
                <div class="disc-grooves"></div>
                <div class="disc-label"></div>
              </div>
            </div>
            <h3>Estúdio vazio</h3>
            <p>Comece criando seu primeiro álbum</p>
            <button class="btn-first" @click="focusForm">Criar Álbum</button>
          </div>

          <!-- Grid View -->
          <div v-else-if="viewMode === 'grid'" class="albums-grid">
            <div 
              v-for="album in albuns" 
              :key="album._id" 
              class="album-card"
              @mouseenter="hoveredAlbum = album._id"
              @mouseleave="hoveredAlbum = null"
            >
              <div class="album-cover">
                <img 
                  :src="getAlbumCover(album.foto)" 
                  :alt="album.nome"
                  @error="$event.target.src = defaultCover"
                />
                <div class="cover-overlay" :class="{ 'show': hoveredAlbum === album._id }">
                  <button class="overlay-btn play" title="Visualizar">
                    <span>▶</span>
                  </button>
                </div>
                <div class="album-year">{{ album.ano || '---' }}</div>
              </div>
              
              <div class="album-info">
                <h3 class="album-title">{{ album.nome }}</h3>
                <p class="album-desc">{{ truncateDesc(album.descricao) }}</p>
              </div>

              <div class="album-actions">
             <button type="button" class="action-btn edit" @click.stop="editarAlbum(album)" title="Editar">
  ✏️
</button>
<button type="button" class="action-btn delete" @click.stop="confirmarExclusao(album)" title="Excluir">
  🗑️
</button>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="albums-list">
            <div 
              v-for="album in albuns" 
              :key="album._id" 
              class="list-item"
            >
              <img 
                class="list-thumb"
                :src="getAlbumCover(album.foto)" 
                :alt="album.nome"
                @error="$event.target.src = defaultCover"
              />
              <div class="list-info">
                <h4>{{ album.nome }}</h4>
                <p>{{ truncateDesc(album.descricao, 100) }}</p>
                <span class="list-year">📅 {{ album.ano || '---' }}</span>
              </div>
              <div class="list-actions">
               <button type="button" class="action-btn edit" @click.stop="editarAlbum(album)">✏️</button>
<button type="button" class="action-btn delete" @click.stop="confirmarExclusao(album)">🗑️</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Delete Modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="delete-modal">
          <div class="modal-disc">🗑️</div>
          <h3>Remover Álbum</h3>
          <p>Tem certeza que deseja excluir <strong>"{{ albumParaExcluir?.nome }}"</strong>?</p>
          <p class="warning-text">Esta ação não pode ser desfeita.</p>
          <div class="modal-buttons">
            <button class="btn-keep" @click="showDeleteModal = false">Manter</button>
            <button 
              class="btn-remove" 
              @click="excluirConfirmado"
              :disabled="deleting"
            >
              <span v-if="!deleting">Remover</span>
              <div v-else class="btn-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '!' }}</span>
        <span>{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios"

const API = "http://localhost:3002/albuns"
const API_MUSICAS = "http://localhost:3002/musicas"
const DEFAULT_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5cf6'/%3E%3Cstop offset='100%25' style='stop-color:%23ec4899'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='80'%3E💿%3C/text%3E%3C/svg%3E"

export default {
  name: "Albuns",

  data() {
    return {
      albuns: [],
      cantores: [],
      musicas: [],
      generos: [],
      anosDisponiveis: [],

      modoEdicao: false,
      saving: false,
      deleting: false,

      focused: null,
      dropdownOpen: null,
      hoveredAlbum: null,
      viewMode: 'grid',

      showDeleteModal: false,
      albumParaExcluir: null,

      imageError: false,
      defaultCover: DEFAULT_COVER,

      toast: { show: false, message: '', type: 'success' },


      // Search
      searchCantores: '',
      searchMusicas: '',
      searchGeneros: '',

      form: {
        id: null,
        nome: "",
        descricao: "",
        foto: "",
        ano:"",
        cantor: "",
        musicas: [],
        generos: []
      }
    }
  },

  computed: {
totalTracks() {
  return this.albuns.reduce((total, album) => {
    return total + (Array.isArray(album.musicas) ? album.musicas.length : 0)
  }, 0)
},

    filteredCantores() {
      if (!this.searchCantores) return this.cantores
      const s = this.searchCantores.toLowerCase()
      return this.cantores.filter(c => c.nome.toLowerCase().includes(s))
    },

    filteredMusicas() {
      if (!this.searchMusicas) return this.musicas
      const s = this.searchMusicas.toLowerCase()
      return this.musicas.filter(m => m.nome.toLowerCase().includes(s))
    },

    filteredGeneros() {
      if (!this.searchGeneros) return this.generos
      const s = this.searchGeneros.toLowerCase()
      return this.generos.filter(g => g.nome.toLowerCase().includes(s))
    }
  },

 watch: {
  dropdownOpen() {
    this.searchCantores = ''
    this.searchMusicas = ''
    this.searchGeneros = ''
  }
},


  mounted() {
    this.gerarAnos()
    this.carregarCantores()
    this.carregarAlbuns()
    this.carregarMusicas()
    this.carregarGeneros()

    // 🔥 clique fora correto
    this.handleClickOutside = (e) => {
      if (!e.target.closest('.select-container')) {
       this.dropdownOpen = null
      }
    }
    document.addEventListener('mousedown', this.handleClickOutside)
   },

 beforeUnmount() {
  document.removeEventListener('mousedown', this.handleClickOutside)
},

  methods: {
 gerarAnos() {
  const decadas = []
  for (let i = 1920; i <= 2020; i += 10) {
    decadas.push(i)
  }
  this.anosDisponiveis = decadas
},

     toggleDropdown(type) {
    this.dropdownOpen = this.dropdownOpen === type ? null : type
  },

  handleClickOutside(e) {
    if (!e.target.closest('.select-container')) {
      this.dropdownOpen = null
    }
  },

  normalizeIds(list) {
  if (!Array.isArray(list)) return []
  return list.map(item => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') return item._id || item.id
    return item
  }).filter(Boolean)
},

    async carregarCantores() {
      try {
        const res = await fetch('http://localhost:3002/cantores')
        this.cantores = await res.json()
      } catch {
        this.showToast('Erro ao carregar cantores', 'error')
      }
    },

async carregarGeneros() {
  try {
    const res = await axios.get("http://localhost:3002/generos")
    console.log("GENEROS:", res.data)

    let data = res.data

    // 🔥 CONVERSÃO CORRETA
    if (!Array.isArray(data)) {
      data = Object.values(data).flat()
    }

    this.generos = data

  } catch {
    this.generos = []
    this.showToast('Erro ao carregar gêneros', 'error')
  }
},

    async carregarMusicas() {
      try {
        const res = await axios.get(API_MUSICAS)
        this.musicas = res.data
      } catch {
        this.showToast('Erro ao carregar músicas', 'error')
      }
    },

    async carregarAlbuns() {
      try {
        const res = await axios.get(API)
        this.albuns = res.data
      } catch {
        this.showToast('Erro ao carregar álbuns', 'error')
      }
    },

    async carregarAlbumPorId(id) {
  const res = await axios.get(`${API}/${id}`)
  return res.data
},

    getParticleStyle() {
      return {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${15 + Math.random() * 10}s`
      }
    },

    isValidUrl(string) {
      try {
        new URL(string)
        return true
      } catch {
        return false
      }
    },

    getAlbumCover(url) {
      return this.isValidUrl(url) ? url : this.defaultCover
    },

    getCantorNome(id) {
      return this.cantores.find(c => c._id === id)?.nome || 'Desconhecido'
    },

    getMusicaNome(id) {
      return this.musicas.find(m => m._id === id)?.nome || 'Desconhecida'
    },

getGeneroNome(id) {
  return this.generos.find(g => g._id === id)?.nome || 'Desconhecido'
},

    getGeneroColor(id) {
      const colors = [
        'linear-gradient(135deg, #8b5cf6, #ec4899)',
        'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        'linear-gradient(135deg, #10b981, #3b82f6)',
        'linear-gradient(135deg, #f59e0b, #ef4444)'
      ]
    const index = this.generos.findIndex(g => g._id === id)
      return colors[index % colors.length]
    },

   removeCantor() {
  this.form.cantor = ''
  this.searchCantores = ''
},
    removeMusica(id) {
      this.form.musicas = this.form.musicas.filter(m => m !== id)
    },

    removeGenero(id) {
      this.form.generos = this.form.generos.filter(g => g !== id)
    },

  async salvarAlbum() {
  this.saving = true

  try {
 const payload = {
      nome: this.form.nome?.trim(),
      descricao: this.form.descricao?.trim(),
      foto: this.form.foto?.trim() || this.defaultCover,
      ano: this.form.ano || null,
      cantor: this.form.cantor || null,
      musicas: Array.isArray(this.form.musicas) ? this.form.musicas : [],
      generos: Array.isArray(this.form.generos) ? this.form.generos : []
    }

    if (!payload.nome || !payload.descricao || !payload.cantor) {
      this.showToast('Preencha nome, descrição e cantor', 'error')
      return
    }

    if (this.modoEdicao && this.form.id) {
      await axios.put(`${API}/${this.form.id}`, payload)
      await this.carregarAlbuns()
      this.showToast('Álbum atualizado!')
    } else {
      await axios.post(API, payload)
      await this.carregarAlbuns()
      this.showToast('Álbum criado!')
    }

    this.reset()
  } catch (err) {
    this.showToast(err.response?.data?.error || 'Erro ao salvar', 'error')
  } finally {
    this.saving = false
  }
},

    selecionarCantor(cantor) {
  this.form.cantor = cantor._id
  this.dropdownOpen = null
  this.searchCantores = ''
},

  async editarAlbum(album) {
  try {
    const albumCompleto = await this.carregarAlbumPorId(album._id)

this.form = {
      id: albumCompleto._id,
      nome: albumCompleto.nome || "",
      descricao: albumCompleto.descricao || "",
      foto: albumCompleto.foto === this.defaultCover ? "" : (albumCompleto.foto || ""),
      ano: albumCompleto.ano || "",
      cantor:
        albumCompleto.cantor && typeof albumCompleto.cantor === 'object'
          ? albumCompleto.cantor._id
          : (albumCompleto.cantor || ""),
      musicas: this.normalizeIds(albumCompleto.musicas),
      generos: this.normalizeIds(albumCompleto.generos)
    }

    this.modoEdicao = true
    this.dropdownOpen = null
    this.imageError = false

    await this.scrollToForm(true)
  } catch (err) {
    this.showToast('Erro ao carregar dados do álbum para edição', 'error')
  }
},

    confirmarExclusao(album) {
      this.albumParaExcluir = album
      this.showDeleteModal = true
    },

   async excluirConfirmado() {
  this.deleting = true

  try {
    const idExcluido = this.albumParaExcluir?._id

    await axios.delete(`${API}/${idExcluido}`)

    if (this.form.id === idExcluido) {
      this.reset()
    }

    await this.carregarAlbuns()

    this.showToast('Álbum removido')
    this.showDeleteModal = false
    this.albumParaExcluir = null
  } catch (err) {
    this.showToast(err.response?.data?.error || 'Erro ao excluir', 'error')
  } finally {
    this.deleting = false
  }
},

    truncateDesc(desc, limit = 60) {
      return desc?.length > limit ? desc.slice(0, limit) + '...' : desc
    },

async scrollToForm(focusInput = false) {
  await this.$nextTick()

  if (this.$refs.formPanel) {
    const top = this.$refs.formPanel.getBoundingClientRect().top + window.pageYOffset - 20
    window.scrollTo({
      top,
      behavior: 'smooth'
    })
  }

  if (focusInput) {
    setTimeout(() => {
      this.$refs.nomeInput?.focus()
    }, 350)
  }
},

focusForm() {
  this.scrollToForm(true)
},

reset() {
  this.form = {
    id: null,
    nome: "",
    descricao: "",
    foto: "",
    ano: "",
    cantor: "",
    musicas: [],
    generos: []
  }

  this.modoEdicao = false
  this.dropdownOpen = null
  this.searchCantores = ''
  this.searchMusicas = ''
  this.searchGeneros = ''
  this.imageError = false
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
.option-button {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
}

.option-button:focus {
  outline: none;
}

.option-button .check-icon {
  flex-shrink: 0;
}

.albums-studio {
  min-height: 100vh;
  background: #0a0a0f;
  color: #fafafa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Animated Background */
.studio-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.spotlight {
  position: absolute;
  border-radius: 50%;
  filter: blur(150px);
  opacity: 0.3;
  animation: float 15s ease-in-out infinite;
}

.spotlight-1 {
  width: 600px;
  height: 600px;
  background: #8b5cf6;
  top: -200px;
  left: -100px;
}

.spotlight-2 {
  width: 500px;
  height: 500px;
  background: #ec4899;
  bottom: -200px;
  right: -100px;
  animation-delay: -7s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}

.particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(139, 92, 246, 0.4);
  border-radius: 50%;
  animation: particle-float linear infinite;
}

@keyframes particle-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Content */
.studio-content {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Header */
.studio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 24px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 20px;
}

.vinyl-logo {
  width: 70px;
  height: 70px;
  position: relative;
}

.vinyl-disc {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
  animation: spin 20s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.vinyl-grooves {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.1);
  background: repeating-radial-gradient(
    circle at center,
    transparent 0px,
    transparent 2px,
    rgba(255,255,255,0.03) 3px,
    transparent 4px
  );
}

.vinyl-center {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 2;
}

.brand-text h1 {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}

.tagline {
  color: #64748b;
  font-size: 0.95rem;
}

/* Stats */
.studio-stats {
  display: flex;
  gap: 16px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px 24px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-number {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
  color: #8b5cf6;
}

.stat-name {
  font-size: 0.875rem;
  color: #64748b;
}

/* Main Stage */
.main-stage {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Panels */
.panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.form-panel {
  padding: 32px;
  transition: all 0.3s ease;
}

.form-panel.editing {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.1);
}

.panel-header {
  margin-bottom: 24px;
}

.panel-badge {
  width: 48px;
  height: 48px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 16px;
}

.form-panel.editing .panel-badge {
  background: rgba(245, 158, 11, 0.2);
}

.panel-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.panel-desc {
  color: #64748b;
  font-size: 0.95rem;
}

/* Form */
.album-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  position: relative;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-emoji {
  position: absolute;
  left: 16px;
  font-size: 1.25rem;
  z-index: 2;
  opacity: 0.6;
  transition: all 0.3s;
}

.custom-select.is-placeholder {
  color: #64748b; /* mesma cor do placeholder dos outros */
}

.custom-select option {
  color: #fff;
}

.input-wrap.active .input-emoji {
  opacity: 1;
  transform: scale(1.1);
}

.textarea-emoji {
  top: 16px;
  align-self: flex-start;
}

input, textarea {
  width: 100%;
  padding: 16px 16px 16px 48px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s;
  outline: none;
}

input:focus, textarea:focus {
  border-color: #8b5cf6;
  background: rgba(0, 0, 0, 0.5);
}

.textarea-wrap input,
.textarea-wrap textarea {
  padding-top: 16px;
}

textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.input-wrap > label {
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1rem;
  pointer-events: none;
  transition: all 0.3s;
}

.textarea-wrap > label {
  top: 16px;
  transform: none;
}

.input-wrap input:focus + label,
.input-wrap input:not(:placeholder-shown) + label,
.textarea-wrap textarea:focus + label,
.textarea-wrap textarea:not(:placeholder-shown) + label,
.input-wrap.filled > label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #8b5cf6;
  background: #0a0a0f;
  padding: 0 6px;
  font-weight: 500;
}

.textarea-wrap.filled > label,
.textarea-wrap.active > label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
}

.select-label,
.option {
  position: static;
  transform: none;
  pointer-events: auto;
}


.input-glow {
  position: absolute;
  inset: -2px;
  border-radius: 16px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s;
  filter: blur(8px);
}

.input-wrap.active .input-glow {
  opacity: 0.3;
}

/* Modern Select Styles */
.modern-select {
  margin-bottom: 24px;
}

.select-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 12px;
}

.label-icon {
  font-size: 1.2rem;
}

.select-container {
  position: relative;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56px;
}

.select-container.open .select-trigger {
  border-color: #8b5cf6;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  padding-right: 12px;
}

.placeholder {
  color: #64748b;
  font-size: 0.95rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  animation: tagIn 0.3s ease;
}

@keyframes tagIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.tag-remove {
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
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #64748b;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
  color: #8b5cf6;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #1a1a2e;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 100;
  overflow: hidden;
  animation: dropdownIn 0.3s ease;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-search {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-search input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s;
}

.dropdown-search input:focus {
  border-color: #8b5cf6;
  background: rgba(0, 0, 0, 0.5);
}

.dropdown-options {
  max-height: 240px;
  overflow-y: auto;
  padding: 8px;
}

.dropdown-options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.5);
  border-radius: 3px;
}

.option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.option:hover {
  background: rgba(139, 92, 246, 0.1);
}

.option.selected {
  background: rgba(139, 92, 246, 0.2);
}

.option input[type="checkbox"] {
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
}

.option.selected .check-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border-color: transparent;
  color: white;
}

.option-text {
  font-size: 0.95rem;
  color: #e2e8f0;
}

.option:hover .option-text {
  color: #fff;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #64748b;
}

.hint-icon {
  font-size: 0.9rem;
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Cover Preview */
.cover-preview-stage {
  margin: 8px 0;
}

.preview-frame {
  position: relative;
  width: 100%;
  max-width: 200px;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  border: 2px solid rgba(139, 92, 246, 0.3);
}

.preview-frame.error {
  border-color: rgba(239, 68, 68, 0.3);
}

.preview-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e, #0f0f1e);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 0.875rem;
  color: #64748b;
}

.preview-gloss {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  pointer-events: none;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.btn-cancel, .btn-save {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.btn-save {
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.5);
}

.btn-save.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.btn-content, .btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Divider */
.stage-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 32px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
}

.divider-icon {
  font-size: 1.5rem;
  opacity: 0.5;
}

/* Collection Panel */
.collection-panel {
  padding: 32px;
}

.collection-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.view-toggle {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px;
  border-radius: 10px;
}

.view-toggle button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 1.25rem;
  line-height: 1;
}

.view-toggle button.active {
  background: rgba(139, 92, 246, 0.2);
  color: #c4b5fd;
}

/* Empty State */
.empty-studio {
  text-align: center;
  padding: 80px 20px;
}

.empty-vinyl {
  margin-bottom: 24px;
}

.spinning-disc {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  background: #1a1a2e;
  border-radius: 50%;
  position: relative;
  animation: spin 10s linear infinite;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}

.disc-grooves {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.1);
  background: repeating-radial-gradient(
    circle at center,
    transparent 0px,
    transparent 3px,
    rgba(255,255,255,0.05) 4px,
    transparent 5px
  );
}

.disc-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border-radius: 50%;
}

.empty-studio h3 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: #f1f5f9;
}

.empty-studio p {
  color: #64748b;
  margin-bottom: 24px;
}

/* Select customizado */
.custom-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  width: 100%;
  padding: 16px 40px 16px 16px;

  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;

  color: #fff;
  font-size: 1rem;
  cursor: pointer;

  transition: all 0.3s ease;
}

/* Placeholder */
.custom-select.is-placeholder {
  color: #64748b;
}

/* Opções */
.custom-select option {
  background: #1a1a2e;
  color: #fff;
}

/* Focus */
.custom-select:focus {
  border-color: #8b5cf6;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3); /* glow roxo */
  outline: none;
}

/* Arrow customizada */
.input-wrap {
  position: relative;
}

.input-wrap::after {
  content: "⌄";
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b5cf6;
  font-size: 1.2rem;
  pointer-events: none;
  transition: transform 0.3s;
}

/* Rotação quando ativo */
.input-wrap.active::after {
  transform: translateY(-50%) rotate(180deg);
}

/* Options (limitado pelo browser, mas ajuda) */
.custom-select option {
  background: #1a1a2e;
  color: #fff;
}

.btn-first {
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-first:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}

/* Grid View */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.album-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.album-card:hover {
  transform: translateY(-8px);
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.album-cover {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.album-card:hover .album-cover img {
  transform: scale(1.1);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-overlay.show {
  opacity: 1;
}

.overlay-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}

.overlay-btn:hover {
  transform: scale(1.1);
}

.album-year {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 0.75rem;
  color: #fff;
}

.album-info {
  padding: 16px;
}

.album-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #f1f5f9;
}

.album-desc {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.album-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.05);
}

.action-btn.edit:hover {
  background: rgba(59, 130, 246, 0.2);
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* List View */
.albums-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s;
}

.list-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.2);
}

.list-thumb {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-info h4 {
  font-size: 1rem;
  margin-bottom: 4px;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-info p {
  font-size: 0.875rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.list-year {
  display: block;
  font-size: 0.8rem;
  color: #8b5cf6;
  margin-top: 4px;
  font-weight: 500;
}

.list-actions .action-btn {
  width: 40px;
  height: 40px;
  flex: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.delete-modal {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: modalIn 0.3s ease;
}

.modal-disc {
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 20px;
}

.delete-modal h3 {
  font-size: 1.5rem;
  margin-bottom: 12px;
  color: #f1f5f9;
}

.delete-modal p {
  color: #94a3b8;
  margin-bottom: 8px;
}

.warning-text {
  color: #f87171 !important;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-keep, .btn-remove {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-keep {
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
}

.btn-keep:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

.btn-remove {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-remove:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
}

.btn-remove:disabled {
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

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.3s;
}

.modal-fade-enter-from, .modal-fade-leave-to {
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
  backdrop-filter: blur(10px);
}

.toast.success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
}

.toast.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
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

.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.3s;
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .studio-header {
    flex-direction: column;
    text-align: center;
  }
  
  .vinyl-logo {
    margin: 0 auto;
  }
  
  .studio-stats {
    width: 100%;
    justify-content: center;
  }
  
  .form-panel, .collection-panel {
    padding: 24px;
  }
  
  .albums-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn-cancel, .btn-save {
    width: 100%;
    justify-content: center;
  }
  
  .selected-tags {
    max-height: 80px;
    overflow-y: auto;
  }
  
  .dropdown-menu {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 24px 24px 0 0;
    max-height: 70vh;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
}
</style>