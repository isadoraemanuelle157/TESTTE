
<template>
  <div class="container">
    <div class="main-card">
      <!-- Header Animado -->
      <div class="header-section">
        <div class="header-bg"></div>
        <div class="header-content">
          <div class="music-icon">🎵</div>
          <h1>Gerenciador de Gêneros</h1>
          <p class="subtitle">Cadastre, edite e organize seus gêneros musicais favoritos</p>
        </div>
      </div>

      <!-- Formulário Moderno -->
      <div class="form-section" ref="formSection">
        <div class="section-header">
          <div class="section-icon" :class="modoEdicao ? 'edit-mode' : 'create-mode'">
            {{ modoEdicao ? '✏️' : '➕' }}
          </div>
          <h2>{{ modoEdicao ? "Editar Gênero" : "Novo Gênero" }}</h2>
        </div>
        
        <form @submit.prevent="salvarGenero">
          <!-- Nome -->
          <div class="input-group floating">
            <input 
              v-model="form.nome" 
              id="nome"
              placeholder=" "
              required 
            />
            <label for="nome">Nome do Gênero</label>
            <span class="input-hint">Ex: Rock, Jazz, MPB, Samba...</span>
          </div>

          <!-- Descrição -->
          <div class="input-group floating">
            <textarea 
              v-model="form.descricao" 
              id="descricao"
              placeholder=" "
              required
            ></textarea>
            <label for="descricao">Descrição</label>
            <span class="input-hint">Descreva as características deste gênero musical</span>
          </div>

          <!-- Categoria Combobox -->
          <div class="input-group">
            <label>Categoria</label>
            <div class="combobox-wrapper">
              <div class="combobox-input-wrapper">
                <input 
                  v-model="form.categoria" 
                  @focus="showCategoriaDropdown = true"
                  @blur="hideCategoriaDropdown"
                  @keydown.enter.prevent="addCustomCategoria"
                  placeholder="Digite ou selecione uma categoria..."
                  class="combobox-input"
                />
                <button 
                  type="button" 
                  class="combobox-toggle"
                  @click="showCategoriaDropdown = !showCategoriaDropdown"
                >
                  <span class="chevron" :class="{ 'open': showCategoriaDropdown }">▼</span>
                </button>
              </div>
              
              <transition name="dropdown">
                <div v-if="showCategoriaDropdown" class="combobox-dropdown">
                  <div class="dropdown-header">Categorias Sugeridas</div>
                  <div 
                    v-for="cat in categoriasPredefinidas" 
                    :key="cat.value"
                    class="dropdown-item"
                    :class="{ 'active': form.categoria === cat.value }"
                    @mousedown.prevent="selectCategoria(cat.value)"
                  >
                    <span class="cat-icon">{{ cat.icon }}</span>
                    <span class="cat-label">{{ cat.label }}</span>
                  </div>
                  <div v-if="form.categoria && !categoriasPredefinidas.find(c => c.value === form.categoria)" class="dropdown-divider"></div>
                  <div v-if="form.categoria && !categoriasPredefinidas.find(c => c.value === form.categoria)" class="dropdown-item custom">
                    <span class="cat-icon">✨</span>
                    <span class="cat-label">Usar "{{ form.categoria }}"</span>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Icon Picker -->
          <div class="input-group">
            <label>Ícone</label>
            <div class="icon-picker-trigger" @click="showIconPicker = true">
              <div class="selected-icon" v-if="form.icon">
                {{ form.icon }}
              </div>
              <div class="selected-icon-placeholder" v-else>
                <span>🎵</span> Clique para escolher um ícone
              </div>
              <span class="change-icon">Alterar</span>
            </div>
          </div>

          <!-- Color Picker -->
        <!-- Color Picker -->
<div class="input-group">
  <label>Cor do Gênero</label>
  <div class="color-picker-wrapper">
    <!-- Preview da cor selecionada -->
    <div class="color-preview-section">
      <div 
        class="color-preview-circle" 
        :style="{ background: form.color || '#6366f1' }"
      ></div>
      <div class="color-input-wrapper">
        <input 
          v-model="form.color" 
          type="text" 
          class="color-input-text"
          placeholder="#6366f1"
        />
        <button 
          type="button"
          class="btn-add-color"
          :class="{ 'active': podeAdicionarCor }"
          @click="adicionarCorCustomizada"
          :disabled="!podeAdicionarCor"
          title="Adicionar cor à paleta"
        >
          <span v-if="!loadingCor">+</span>
          <span v-else class="spinner-small"></span>
        </button>
      </div>
    </div>
    
    <!-- Paleta de cores -->
    <div class="color-palette">
      <!-- Cores predefinidas -->
      <div 
        v-for="cor in coresPredefinidas" 
        :key="cor"
        class="color-swatch"
        :class="{ 'active': form.color === cor }"
        :style="{ background: cor }"
        @click="form.color = cor"
      ></div>
      
      <!-- Cores customizadas adicionadas -->
      <div 
        v-for="(cor, index) in coresCustomizadas" 
        :key="'custom-' + index"
        class="color-swatch custom-color"
        :class="{ 'active': form.color === cor }"
        :style="{ background: cor }"
        @click="form.color = cor"
        @contextmenu.prevent="removerCorCustomizada(index)"
        title="Clique direito para remover"
      ></div>
      
      <!-- Color picker nativo -->
      <div class="color-swatch custom-picker">
        <input 
          type="color" 
          v-model="form.color"
          class="native-color-picker"
          @change="onColorPickerChange"
        />
        <span>+</span>
      </div>
    </div>
    
    <!-- Legenda -->
    <div class="custom-colors-label" v-if="coresCustomizadas.length > 0">
      <span class="dot"></span>
      <span>Cores customizadas (clique direito para remover)</span>
      <button class="btn-clear-colors" @click="limparCoresCustomizadas">
        Limpar todas
      </button>
    </div>
  </div>
</div>

          <!-- Botões -->
          <div class="button-group">
            <button 
              type="submit" 
              :class="['btn-primary', { 'loading': loading }]"
              :disabled="loading"
            >
              <span v-if="!loading" class="btn-content">
                <span class="btn-icon">{{ modoEdicao ? '💾' : '✨' }}</span>
                {{ modoEdicao ? "Atualizar" : "Cadastrar" }}
              </span>
              <span v-else class="spinner"></span>
            </button>
            
            <button 
              v-if="modoEdicao" 
              type="button" 
              class="btn-secondary"
              @click="cancelarEdicao"
            >
              <span class="btn-icon">❌</span>
              Cancelar
            </button>
          </div>
        </form>

        <transition name="slide-fade">
          <div v-if="mensagem" :class="['alert', mensagem.tipo]">
            <span class="alert-icon">{{ mensagem.tipo === 'success' ? '✅' : '⚠️' }}</span>
            {{ mensagem.texto }}
          </div>
        </transition>
      </div>

      <!-- Lista de Gêneros -->
      <div class="list-section">
        <div class="list-header">
          <div class="list-title-group">
            <h2>📋 Gêneros Cadastrados</h2>
            <span class="badge">{{ generos.length }} itens</span>
          </div>
          <div class="view-toggle">
            <button 
              :class="{ 'active': viewMode === 'grid' }"
              @click="viewMode = 'grid'"
              title="Visualização em Grade"
            >
              ⊞
            </button>
            <button 
              :class="{ 'active': viewMode === 'list' }"
              @click="viewMode = 'list'"
              title="Visualização em Lista"
            >
              ☰
            </button>
          </div>
        </div>

        <div v-if="loadingList" class="loading-state">
          <div class="spinner-large"></div>
          <p>Carregando gêneros...</p>
        </div>

        <div v-else-if="generos.length === 0" class="empty-state">
          <div class="empty-animation">
            <div class="note">🎵</div>
            <div class="note">🎶</div>
            <div class="note">🎼</div>
          </div>
          <h3>Nenhum gênero cadastrado</h3>
          <p>Adicione seu primeiro gênero musical acima!</p>
        </div>

        <!-- Grid View -->
        <transition-group 
          v-else-if="viewMode === 'grid'"
          name="card-fade" 
          tag="div" 
          class="generos-grid"
        >
          <div 
            v-for="genero in generos" 
            :key="genero._id" 
            class="genero-card"
            :style="{ borderLeftColor: genero.color || '#6366f1' }"
          >
            <div class="card-header">
              <div class="card-icon" :style="{ background: genero.color || '#6366f1' }">
                {{ genero.icon || '🎵' }}
              </div>
              <div class="card-category">{{ genero.categoria || 'Outros' }}</div>
            </div>
            <div class="card-body">
              <h3>{{ genero.nome }}</h3>
              <p>{{ genero.descricao }}</p>
            </div>
            <div class="card-actions">
              <button 
                class="btn-card edit"
                @click="iniciarEdicao(genero)"
                title="Editar"
              >
                ✏️
              </button>
              <button 
                class="btn-card delete"
                @click="confirmarExclusao(genero)"
                title="Excluir"
              >
                🗑️
              </button>
            </div>
          </div>
        </transition-group>

        <!-- List View -->
        <transition-group 
          v-else
          name="list" 
          tag="ul" 
          class="generos-list"
        >
          <li 
            v-for="genero in generos" 
            :key="genero._id" 
            class="genero-item"
          >
            <div class="item-icon" :style="{ background: genero.color || '#6366f1' }">
              {{ genero.icon || '🎵' }}
            </div>
            <div class="genero-info">
              <div class="info-header">
                <h3>{{ genero.nome }}</h3>
                <span class="category-tag">{{ genero.categoria || 'Outros' }}</span>
              </div>
              <p>{{ genero.descricao }}</p>
            </div>
            
            <div class="genero-actions">
              <button 
                class="btn-icon-action edit"
                @click="iniciarEdicao(genero)"
                title="Editar"
              >
                ✏️
              </button>
              <button 
                class="btn-icon-action delete"
                @click="confirmarExclusao(genero)"
                title="Excluir"
              >
                🗑️
              </button>
            </div>
          </li>
        </transition-group>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <transition name="modal">
      <div v-if="modalExcluir" class="modal-overlay" @click.self="modalExcluir = false">
        <div class="modal-content">
          <div class="modal-icon">⚠️</div>
          <h3>Confirmar Exclusão</h3>
          <p>
            Tem certeza que deseja excluir o gênero 
            <strong>"{{ generoParaExcluir?.nome }}"</strong>?
          </p>
          <p class="modal-warning">Esta ação não pode ser desfeita.</p>
          
          <div class="modal-actions">
            <button class="btn-secondary" @click="modalExcluir = false">
              Cancelar
            </button>
            <button 
              class="btn-danger" 
              @click="excluirGenero"
              :disabled="loadingDelete"
            >
              {{ loadingDelete ? "Excluindo..." : "Sim, Excluir" }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Icon Picker Modal -->
    <transition name="modal">
      <div v-if="showIconPicker" class="modal-overlay" @click.self="showIconPicker = false">
        <div class="modal-content icon-picker-modal">
          <div class="modal-header">
            <h3>🎨 Escolha um Ícone</h3>
            <button class="close-btn" @click="showIconPicker = false">✕</button>
          </div>
          
          <div class="icon-search">
            <input 
              v-model="iconSearch" 
              placeholder="Buscar ícones..."
              class="search-input"
            />
          </div>
          
          <div class="icon-categories">
            <button 
              v-for="cat in iconCategories" 
              :key="cat.name"
              :class="{ 'active': selectedIconCategory === cat.name }"
              @click="selectedIconCategory = cat.name"
            >
              {{ cat.icon }} {{ cat.label }}
            </button>
          </div>
          
          <div class="icons-grid">
            <div 
              v-for="icon in filteredIcons" 
              :key="icon"
              class="icon-option"
              :class="{ 'selected': form.icon === icon }"
              @click="selectIcon(icon)"
            >
              {{ icon }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios"

const API_URL = "http://localhost:3002/generos"

export default {
  name: "Generos",

  data() {
    return {
      form: {
        id: null,
        nome: "",
        descricao: "",
        categoria: "",
        icon: "",
        color: "#6366f1"
      },
      generos: [],
      loading: false,
      loadingList: false,
      loadingDelete: false,
      mensagem: null,
      modoEdicao: false,
      modalExcluir: false,
      generoParaExcluir: null,
      viewMode: 'grid',
      
      // Color picker
      coresPredefinidas: [
        '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
        '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
        '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
        '#ec4899', '#f43f5e', '#78716c', '#64748b', '#0f172a'
      ],
      coresCustomizadas: [],
      
      // Categorias
      categoriasPredefinidas: [
        { value: 'popular', label: 'Popular', icon: '🌟' },
        { value: 'regional', label: 'Regional', icon: '🌍' },
        { value: 'electronic', label: 'Eletrônico', icon: '⚡' },
        { value: 'classical', label: 'Clássica', icon: '🎻' },
        { value: 'jazz', label: 'Jazz', icon: '🎷' },
        { value: 'rock', label: 'Rock', icon: '🎸' },
        { value: 'pop', label: 'Pop', icon: '🎤' },
        { value: 'hiphop', label: 'Hip Hop', icon: '🎧' },
        { value: 'outros', label: 'Outros', icon: '📦' }
      ],
      showCategoriaDropdown: false,
      
      // Icon picker
      showIconPicker: false,
      iconSearch: '',
      selectedIconCategory: 'music',
      iconCategories: [
        { name: 'music', label: 'Música', icon: '🎵' },
        { name: 'instruments', label: 'Instrumentos', icon: '🎸' },
        { name: 'mood', label: 'Humor', icon: '😊' },
        { name: 'nature', label: 'Natureza', icon: '🌿' },
        { name: 'objects', label: 'Objetos', icon: '📦' }
      ],
      icons: {
        music: ['🎵', '🎶', '🎼', '🎹', '🎺', '🎻', '🎷', '🎸', '🎤', '🎧', '🎚️', '🎛️', '🎙️', '📻', '🔊', '🔈', '🔇', '🔔', '🎵', '♪', '♫', '♬', '♭', '♮', '♯'],
        instruments: ['🎸', '🎹', '🎺', '🎻', '🎷', '🥁', '🪘', '🪗', '🪕', '🎻', '🎺', '🎹', '🎸', '🎷', '🎤', '🎧', '🎚️', '🎛️', '🎙️', '📯', '🪗', '🪘'],
        mood: ['😊', '😎', '🤩', '😍', '🥰', '😘', '😗', '😙', '😚', '☺️', '🙂', '🤗', '🤔', '🤭', '🤫', '🤠', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
        nature: ['🌿', '🍀', '🌲', '🌳', '🌴', '🌵', '🌷', '🌸', '🌹', '🌺', '🌻', '🌼', '🌽', '🌾', '🌰', '🌱', '🌲', '🌳', '🌴', '🌵', '🌶️', '🌷', '🌸', '🌹', '🌺', '🌻', '🌼', '🌽', '🌾', '🌿', '🍀', '🍁', '🍂', '🍃', '🍄', '🌰', '🌍', '🌎', '🌏', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜', '☀️', '🌝', '🌞', '⭐', '🌟', '🌠', '☁️', '⛅', '⛈️', '🌤️', '🌥️', '🌦️', '🌧️', '🌨️', '🌩️', '🌪️', '🌫️', '🌬️', '🌀', '🌈', '🌂', '☂️', '☔', '⛱️', '⚡', '❄️', '☃️', '⛄', '☄️', '🔥', '💧', '🌊'],
        objects: ['📦', '🎁', '🎀', '🎊', '🎉', '🎈', '🎎', '🎏', '🎐', '🎑', '🧧', '🎀', '🎁', '🎗️', '🎟️', '🎫', '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉', '⚽', '⚾', '🥎', '🏀', '🏐', '🏈', '🏉', '🎾', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🥏', '🎱', '🔮', '🧿', '🎮', '🕹️', '🎰', '🎲', '🧩', '🧸', '🪅', '🪆', '🪀', '🪁', '🎨', '🧵', '🧶', '👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓', '🧢', '🪖', '⛑️', '📷', '📸', '📹', '📼', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🪤', '🪚', '🔨', '⛏️', '⚒️', '🛠️', '🪤', '🪛', '🪜', '⚙️', '🪤', '🪛', '🔩', '🪤', '🪛', '⚗️', '🧪', '🧫', '🧬', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '🎀', '🎁', '🎗️', '🎟️', '🎫', '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉']
      }
    }
  },

  computed: {
       filteredIcons() {
      const categoryIcons = this.icons[this.selectedIconCategory] || []
      if (!this.iconSearch) return categoryIcons
      return categoryIcons.filter(icon => icon.includes(this.iconSearch))
    },
    
    // ✅ MOVER podeAdicionarCor PARA DENTRO DE computed
    podeAdicionarCor() {
      const cor = this.form.color?.toLowerCase().trim()
      if (!cor || !cor.match(/^#[0-9a-f]{6}$/)) return false
      return !this.coresPredefinidas.includes(cor) && 
             !this.coresCustomizadas.includes(cor)
    }
  },

  mounted() {
    this.carregarGeneros()
    this.carregarGeneros()
  
  // Carregar cores customizadas do localStorage
  const coresSalvas = localStorage.getItem('coresCustomizadas')
  if (coresSalvas) {
    try {
      this.coresCustomizadas = JSON.parse(coresSalvas)
    } catch (e) {
      console.error('Erro ao carregar cores customizadas:', e)
    }
  }
  },

  methods: {
    // Carregar lista de gêneros
 async carregarGeneros() {
  this.loadingList = true
  try {
    const res = await axios.get(API_URL)
    
    // CORREÇÃO: verificar se res.data é array ou objeto
    let data = res.data
    
    // Se for objeto com chaves (ex: {popular: [...], regional: [...]}), converter para array
    if (!Array.isArray(data)) {
      data = Object.values(data).flat()
    }
    
    this.generos = data

  } catch (err) {
    this.mostrarMensagem("Erro ao carregar gêneros", "error")
    this.generos = [] // garantir que não fica undefined
  } finally {
    this.loadingList = false
  }
},

    // Criar ou atualizar gênero
    async salvarGenero() {
      this.loading = true
      this.limparMensagem()

      try {
        if (this.modoEdicao) {
          await axios.put(`${API_URL}/${this.form.id}`, this.form)
          this.mostrarMensagem("Gênero atualizado com sucesso!", "success")
        } else {
          await axios.post(API_URL, this.form)
          this.mostrarMensagem("Gênero cadastrado com sucesso!", "success")
        }

        this.resetarFormulario()
        await this.carregarGeneros()

      } catch (err) {
        const msg = err.response?.data?.error || "Erro ao salvar gênero"
        this.mostrarMensagem(msg, "error")
      } finally {
        this.loading = false
      }
    },
    adicionarCorCustomizada() {
    const cor = this.form.color?.toLowerCase().trim()
    if (!cor || !cor.match(/^#[0-9a-f]{6}$/)) return
    
    if (!this.coresPredefinidas.includes(cor) && 
        !this.coresCustomizadas.includes(cor)) {
      this.coresCustomizadas.push(cor)
      // Salvar no localStorage para persistir
      localStorage.setItem('coresCustomizadas', JSON.stringify(this.coresCustomizadas))
      this.mostrarMensagem("Cor adicionada à paleta!", "success")
    }
  },
  
  // Remover cor customizada
  removerCorCustomizada(index) {
    this.coresCustomizadas.splice(index, 1)
    localStorage.setItem('coresCustomizadas', JSON.stringify(this.coresCustomizadas))
    this.mostrarMensagem("Cor removida da paleta", "success")
  },
  
  // Limpar todas as cores customizadas
  limparCoresCustomizadas() {
    this.coresCustomizadas = []
    localStorage.removeItem('coresCustomizadas')
    this.mostrarMensagem("Todas as cores customizadas removidas", "success")
  },
  
  // Quando muda no color picker nativo
  onColorPickerChange(e) {
    this.form.color = e.target.value.toLowerCase()
  },

    // Iniciar modo de edição
    iniciarEdicao(genero) {
      this.form = {
        id: genero._id,
        nome: genero.nome,
        descricao: genero.descricao,
        categoria: genero.categoria || "",
        icon: genero.icon || "",
        color: genero.color || "#6366f1"
      }
      this.modoEdicao = true
      this.limparMensagem()
      this.$nextTick(() => {
  this.$refs.formSection.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
})
    },

    // Cancelar edição
    cancelarEdicao() {
      this.resetarFormulario()
    },

    // Confirmar exclusão
    confirmarExclusao(genero) {
      this.generoParaExcluir = genero
      this.modalExcluir = true
    },

    // Excluir gênero
    async excluirGenero() {
      if (!this.generoParaExcluir) return
      
      this.loadingDelete = true
      try {
        await axios.delete(`${API_URL}/${this.generoParaExcluir._id}`)
        this.mostrarMensagem("Gênero excluído com sucesso!", "success")
        await this.carregarGeneros()
        this.modalExcluir = false
        this.generoParaExcluir = null
      } catch (err) {
        this.mostrarMensagem("Erro ao excluir gênero", "error")
      } finally {
        this.loadingDelete = false
      }
    },

    // Categoria combobox
    selectCategoria(value) {
      this.form.categoria = value
      this.showCategoriaDropdown = false
    },
    
    hideCategoriaDropdown() {
      setTimeout(() => {
        this.showCategoriaDropdown = false
      }, 200)
    },
    
    addCustomCategoria() {
      this.showCategoriaDropdown = false
    },

    // Icon picker
    selectIcon(icon) {
      this.form.icon = icon
      this.showIconPicker = false
    },

    // Utilitários
    resetarFormulario() {
      this.form = {
        id: null,
        nome: "",
        descricao: "",
        categoria: "",
        icon: "",
        color: "#6366f1"
      }
      this.modoEdicao = false
    },

    mostrarMensagem(texto, tipo) {
      this.mensagem = { texto, tipo }
      setTimeout(() => this.limparMensagem(), 5000)
    },

    limparMensagem() {
      this.mensagem = null
    }
  }
}
</script>

<style scoped>
/* Reset e Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* Color Picker - Input com botão + */
/* Color Picker - Input com botão + */
.color-input-wrapper {
  flex: 1;
  display: flex;
  gap: 8px;
}

.btn-add-color {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.6);
  color: #64748b;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-add-color.active {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-color: transparent;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);
}

.btn-add-color.active:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5);
}

.btn-add-color.active:active {
  transform: scale(0.95);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

/* Estilo especial para cores customizadas */
.color-swatch.custom-color {
  position: relative;
}

.color-swatch.custom-color::after {
  content: '★';
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 8px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.8;
}

/* Legenda de cores customizadas */
.custom-colors-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.custom-colors-label .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  position: relative;
}

.custom-colors-label .dot::after {
  content: '★';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 6px;
  color: white;
}

.btn-clear-colors {
  margin-left: auto;
  padding: 4px 8px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.btn-clear-colors:hover {
  background: rgba(239, 68, 68, 0.2);
}
.color-input-text {
  flex: 1;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.color-input-text:focus {
  outline: none;
  border-color: #6366f1;
}

.btn-add-color {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.6);
  color: #64748b;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-add-color.active {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-color: transparent;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);
}

.btn-add-color.active:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5);
}

.btn-add-color.active:active {
  transform: scale(0.95);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.container {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Card Principal com Glassmorphism */
.main-card {
  width: 100%;
  max-width: 900px;
  background: rgba(17, 24, 39, 0.7);
  border-radius: 32px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

/* Header Animado */
.header-section {
  position: relative;
  padding: 50px 40px;
  text-align: center;
  color: white;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at top, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
    radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(2deg); }
}

.header-content {
  position: relative;
  z-index: 1;
}

.music-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  animation: bounce 2s ease infinite;
  display: inline-block;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.header-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  letter-spacing: -0.02em;
}

.subtitle {
  opacity: 0.9;
  font-size: 1.1rem;
  font-weight: 400;
}

/* Seções */
.form-section, .list-section {
  padding: 40px;
}

.form-section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
}

.section-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.section-icon.create-mode {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);
}

.section-icon.edit-mode {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
}

.form-section h2, .list-header h2 {
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 700;
}

/* Floating Label Inputs */
.input-group {
  margin-bottom: 24px;
  position: relative;
}

.input-group.floating {
  position: relative;
}

.input-group.floating input,
.input-group.floating textarea {
  width: 100%;
  padding: 16px;
  padding-top: 24px;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  color: #f1f5f9;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group.floating label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  pointer-events: none;
}

.input-group.floating textarea ~ label {
  top: 24px;
  transform: translateY(0);
}

.input-group.floating input:focus,
.input-group.floating textarea:focus,
.input-group.floating input:not(:placeholder-shown),
.input-group.floating textarea:not(:placeholder-shown) {
  border-color: #6366f1;
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-group.floating input:focus ~ label,
.input-group.floating textarea:focus ~ label,
.input-group.floating input:not(:placeholder-shown) ~ label,
.input-group.floating textarea:not(:placeholder-shown) ~ label {
  top: 8px;
  transform: translateY(0);
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
}

.input-group.floating textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.input-hint {
  display: block;
  margin-top: 6px;
  font-size: 0.8rem;
  color: #64748b;
  padding-left: 4px;
}

/* Labels normais */
.input-group > label {
  display: block;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Combobox */
.combobox-wrapper {
  position: relative;
}

.combobox-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.combobox-input-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.combobox-input {
  flex: 1;
  padding: 14px 16px;
  background: transparent;
  border: none;
  color: #f1f5f9;
  font-size: 1rem;
  outline: none;
}

.combobox-input::placeholder {
  color: #64748b;
}

.combobox-toggle {
  padding: 14px 16px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.combobox-toggle:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.05);
}

.chevron {
  display: inline-block;
  transition: transform 0.3s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.combobox-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-header {
  padding: 12px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(15, 23, 42, 0.5);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(99, 102, 241, 0.1);
}

.dropdown-item.active {
  background: rgba(99, 102, 241, 0.2);
}

.dropdown-item.custom {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.dropdown-item.custom:hover {
  background: rgba(34, 197, 94, 0.2);
}

.cat-icon {
  font-size: 1.2rem;
}

.cat-label {
  font-weight: 500;
  color: #e2e8f0;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

/* Icon Picker Trigger */
.icon-picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-picker-trigger:hover {
  border-color: #6366f1;
  background: rgba(15, 23, 42, 0.8);
}

.selected-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 12px;
}

.selected-icon-placeholder {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 0.95rem;
}

.selected-icon-placeholder span {
  font-size: 1.5rem;
}

.change-icon {
  font-size: 0.875rem;
  color: #6366f1;
  font-weight: 600;
}

/* Color Picker */
.color-picker-wrapper {
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 20px;
}

.color-preview-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.color-preview-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
}

.color-preview-circle:hover {
  transform: scale(1.05);
}

.color-input-text {
  flex: 1;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 1rem;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.color-input-text:focus {
  outline: none;
  border-color: #6366f1;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
}

.color-swatch {
  aspect-ratio: 1;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 2px solid transparent;
}

.color-swatch:hover {
  transform: scale(1.15);
  z-index: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.color-swatch.active {
  border-color: white;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
  transform: scale(1.1);
}

/* Estilo especial para cores customizadas */
.color-swatch.custom-color {
  position: relative;
}

.color-swatch.custom-color::after {
  content: '★';
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 8px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0.8;
}

.color-swatch.custom-picker {
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  overflow: hidden;
  position: relative;
}

.native-color-picker {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

/* Legenda de cores customizadas */
.custom-colors-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.custom-colors-label .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  position: relative;
}

.custom-colors-label .dot::after {
  content: '★';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 6px;
  color: white;
}

/* Botões */
.button-group {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 14px 28px;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  flex: 1;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.5);
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.25);
  transform: translateY(-2px);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.5);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  font-size: 1.2rem;
}

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.spinner-large {
  width: 56px;
  height: 56px;
  border: 4px solid rgba(99, 102, 241, 0.3);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Alertas */
.alert {
  padding: 16px 20px;
  border-radius: 16px;
  margin-top: 24px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.4s ease;
}

.alert.success {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.alert.error {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.alert-icon {
  font-size: 1.3rem;
}

/* Lista Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.list-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.view-toggle button {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.view-toggle button.active {
  background: rgba(99, 102, 241, 0.3);
  color: #6366f1;
}

/* Grid View */
.generos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.genero-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  transition: all 0.3s ease;
  border-left: 4px solid;
  position: relative;
  overflow: hidden;
}

.genero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
  pointer-events: none;
}

.genero-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.card-category {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px 10px;
  border-radius: 20px;
}

.card-body h3 {
  color: #f8fafc;
  font-size: 1.25rem;
  margin-bottom: 8px;
  font-weight: 700;
}

.card-body p {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-card {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
}

.btn-card.edit {
  color: #60a5fa;
}

.btn-card.edit:hover {
  background: rgba(59, 130, 246, 0.2);
}

.btn-card.delete {
  color: #f87171;
}

.btn-card.delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* List View */
.generos-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.genero-item {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.genero-item:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateX(4px);
}

.item-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.genero-info {
  flex: 1;
  min-width: 0;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.info-header h3 {
  color: #f8fafc;
  font-size: 1.1rem;
  font-weight: 700;
}

.category-tag {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(15, 23, 42, 0.6);
  padding: 2px 8px;
  border-radius: 10px;
}

.genero-info p {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.genero-actions {
  display: flex;
  gap: 8px;
}

.btn-icon-action {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
}

.btn-icon-action.edit {
  color: #60a5fa;
}

.btn-icon-action.edit:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}

.btn-icon-action.delete {
  color: #f87171;
}

.btn-icon-action.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

/* Estados Vazios e Loading */
.empty-state, .loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

.empty-animation {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.note {
  font-size: 3rem;
  animation: float 3s ease infinite;
}

.note:nth-child(1) { animation-delay: 0s; }
.note:nth-child(2) { animation-delay: 0.5s; }
.note:nth-child(3) { animation-delay: 1s; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.empty-state h3 {
  color: #e2e8f0;
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.empty-state p {
  color: #64748b;
}

.loading-state p {
  margin-top: 16px;
  color: #94a3b8;
}

/* Modais */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: #1e293b;
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.modal-content h3 {
  color: #f8fafc;
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.modal-content p {
  color: #94a3b8;
  line-height: 1.6;
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

.modal-actions button {
  flex: 1;
}

/* Icon Picker Modal */
.icon-picker-modal {
  max-width: 500px;
  padding: 0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
}

.modal-header h3 {
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.icon-search {
  padding: 16px 24px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
}

.icon-categories {
  display: flex;
  gap: 8px;
  padding: 0 24px 16px;
  overflow-x: auto;
  scrollbar-width: none;
}

.icon-categories::-webkit-scrollbar {
  display: none;
}

.icon-categories button {
  padding: 8px 14px;
  border: none;
  background: rgba(15, 23, 42, 0.6);
  color: #94a3b8;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.icon-categories button.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 0 24px 24px;
  max-height: 300px;
  overflow-y: auto;
}

.icon-option {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-option:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.5);
  transform: scale(1.1);
}

.icon-option.selected {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

/* Animações */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.4s ease;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.list-enter-active, .list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-move {
  transition: transform 0.4s ease;
}

.card-fade-enter-active, .card-fade-leave-active {
  transition: all 0.4s ease;
}

.card-fade-enter-from, .card-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.card-fade-move {
  transition: transform 0.4s ease;
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsividade */
@media (max-width: 768px) {
  .container {
    padding: 20px 12px;
  }
  
  .form-section, .list-section {
    padding: 24px;
  }
  
  .header-section {
    padding: 30px 24px;
  }
  
  .header-section h1 {
    font-size: 1.75rem;
  }
  
  .generos-grid {
    grid-template-columns: 1fr;
  }
  
  .genero-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .genero-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .color-palette {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .icons-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 480px) {
  .color-palette {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .icons-grid {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .list-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>

