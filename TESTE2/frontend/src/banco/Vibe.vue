<template>
  <div class="create-vibe-container">
    <div class="header">
      <h1>Criar Nova Vibe <span class="sparkle">✨</span></h1>
      <p class="subtitle">Defina o mood perfeito para suas playlists</p>
    </div>

    <div class="content-grid">
      <!-- Formulário -->
      <form @submit.prevent="createVibe" class="form-card">
        
        <!-- Nome -->
        <div class="form-group">
          <label>
            <span class="label-icon">📝</span>
            Nome da vibe
          </label>
          <input 
            v-model="form.nome" 
            type="text" 
            placeholder="Ex: Lo-Fi Study"
            required 
            class="input-field"
          />
        </div>

        <!-- Emoji com Seletor Premium -->
        <div class="form-group">
          <label>
            <span class="label-icon">😀</span>
            Emoji
          </label>
          <div class="emoji-input-wrapper">
            <input 
              v-model="form.emoji" 
              type="text" 
              placeholder="Ex: 🎧" 
              maxlength="4"
              class="input-field emoji-input"
              readonly
            />
            <div class="emoji-preview-large">{{ form.emoji || '🎵' }}</div>
            <button 
              type="button" 
              @click="toggleEmojiPicker" 
              class="btn-emoji-picker"
              :class="{ active: showEmojiPicker }"
            >
              <span class="keyboard-icon">⌨️</span>
            </button>
          </div>

          <!-- Emoji Picker Premium -->
          <div v-if="showEmojiPicker" class="emoji-overlay" @click.self="closeEmojiPicker">
            <div class="emoji-picker-premium">
              <!-- Header -->
              <div class="picker-header">
                <div class="picker-title">
                  <span class="picker-icon">😊</span>
                  <div class="picker-text">
                    <h4>Escolha um Emoji</h4>
                    <p>Clique para selecionar</p>
                  </div>
                </div>
                <button @click="closeEmojiPicker" class="btn-close-picker">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <!-- Search -->
              <div class="picker-search">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input 
                  v-model="emojiSearch" 
                  type="text" 
                  placeholder="Buscar emoji..."
                  class="search-input"
                  ref="emojiSearchInput"
                />
              </div>

              <!-- Categories -->
              <div class="picker-categories">
                <button 
                  v-for="cat in emojiCategories" 
                  :key="cat.name"
                  @click="activeCategory = cat.name"
                  :class="{ active: activeCategory === cat.name }"
                  class="category-tab"
                  :title="cat.name"
                >
                  <span class="cat-icon">{{ cat.icon }}</span>
                  <span class="cat-name">{{ cat.name }}</span>
                </button>
              </div>

              <!-- Emoji Grid -->
              <div class="picker-emojis-container">
                <div class="emoji-grid-premium">
                  <button
                    v-for="emoji in filteredEmojis"
                    :key="emoji"
                    @click="selectEmoji(emoji)"
                    class="emoji-btn-premium"
                    :class="{ selected: form.emoji === emoji }"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>

              <!-- Footer -->
              <div class="picker-footer">
                <span class="selected-preview">{{ form.emoji || 'Nenhum selecionado' }}</span>
                <button @click="closeEmojiPicker" class="btn-done">Concluir</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Descrição -->
        <div class="form-group">
          <label>
            <span class="label-icon">📄</span>
            Descrição
          </label>
          <textarea 
        v-model="form.descricao"
 required
 minlength="5"
 placeholder="Descreva a vibe..."
 rows="3"
 class="input-field"
          ></textarea>
        </div>

        <!-- Seletor de Gradiente -->
        <div class="form-group">
          <label>
            <span class="label-icon">🎨</span>
            Cor do Gradiente
          </label>
          
          <!-- Grid de gradientes pré-definidos -->
          <div class="gradient-grid">
            <div 
              v-for="(gradient, index) in presetGradients" 
              :key="index"
              class="gradient-option"
              :class="{ active: selectedGradientIndex === index && !isCustomGradient }"
              :style="{ background: gradient }"
              @click="selectPresetGradient(index, gradient)"
            >
              <div v-if="selectedGradientIndex === index && !isCustomGradient" class="check-mark">✓</div>
            </div>
          </div>

          <!-- Gradiente customizado com múltiplas cores -->
          <div class="custom-gradient">
            <div class="custom-gradient-header">
              <label class="sublabel">Personalize seu gradiente:</label>
              <button 
                type="button" 
                @click="addColor" 
                class="btn-add-color"
                :disabled="customColors.length >= 5"
                title="Adicionar cor"
              >
                <span>+</span>
              </button>
            </div>
            
            <div class="color-stops">
              <div 
                v-for="(color, index) in customColors" 
                :key="index"
                class="color-stop"
              >
                <div class="color-picker-wrapper">
                  <input 
                    type="color" 
                    v-model="customColors[index]"
                    @input="updateCustomGradient"
                    class="color-input"
                  />
                  <div class="color-position">{{ getColorPosition(index) }}%</div>
                </div>
                <button 
                  v-if="customColors.length > 2"
                  @click="removeColor(index)"
                  class="btn-remove-color"
                  title="Remover cor"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- Preview do gradiente customizado -->
            <div 
              class="custom-gradient-preview"
              :style="{ background: customGradientString }"
              @click="selectCustomGradient"
              :class="{ active: isCustomGradient }"
            >
              <span v-if="isCustomGradient" class="check-mark">✓</span>
              <span class="preview-text">Clique para selecionar</span>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="form-group">
          <label>
            <span class="label-icon">🏷️</span>
            Tags
          </label>
          <div class="tag-input-wrapper">
            <input
              v-model="newTag"
              @keyup.enter.prevent="addTag"
              placeholder="Digite uma tag e pressione Enter"
              class="input-field"
            />
            <button type="button" @click="addTag" class="btn-add-tag">
              <span>+</span>
            </button>
          </div>
          <div class="tags-container" v-if="form.tags.length > 0">
            <span v-for="(tag, index) in form.tags" :key="index" class="tag">
              {{ tag }}
              <button @click="removeTag(index)" class="tag-remove">×</button>
            </span>
          </div>
        </div>

        <button type="submit" class="btn-submit"  :disabled="isLoading || form.tags.length === 0">
          <span v-if="isLoading">⏳ Salvando...</span>
          <span v-else>💾 Salvar Vibe</span>
        </button>
      </form>

      <!-- Preview -->
      <div class="preview-section">
        <h3>Preview ao vivo</h3>
        <div class="vibe-card-preview">
          <div
            class="vibe-card"
            :style="{ background: form.gradient || '#333' }"
          >
            <div class="card-content">
              <span class="emoji-display">{{ form.emoji || '🎵' }}</span>
              <h2 class="card-title">{{ form.nome || 'Nome da vibe' }}</h2>
              <p class="card-description">{{ form.descricao || 'Descrição da vibe...' }}</p>
              
              <div class="tags-preview" v-if="form.tags.length > 0">
                <span v-for="tag in form.tags" :key="tag" class="tag-pill">{{ tag }}</span>
              </div>
            </div>
            <div class="card-shine"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de Vibes -->
    <div class="vibes-list-section" v-if="vibes.length > 0">
      <div class="section-header">
        <h2>Suas Vibes <span class="count-badge">{{ vibes.length }}</span></h2>
        <button @click="loadVibes" class="btn-refresh" title="Atualizar lista">
          🔄
        </button>
      </div>

      <div class="table-container">
        <table class="vibes-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Tags</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="vibe in vibes" :key="vibe._id">
              <td>
                <div class="table-preview" :style="{ background: vibe.gradient }">
                  <span>{{ vibe.emoji }}</span>
                </div>
              </td>
              <td class="name-cell">{{ vibe.nome }}</td>
              <td class="desc-cell">{{ vibe.descricao || '-' }}</td>
              <td>
                <div class="table-tags">
                  <span v-for="tag in vibe.tags.slice(0, 3)" :key="tag" class="table-tag">
                    {{ tag }}
                  </span>
                  <span v-if="vibe.tags.length > 3" class="more-tags">+{{ vibe.tags.length - 3 }}</span>
                </div>
              </td>
              <td class="date-cell">{{ formatDate(vibe.createdAt) }}</td>
              <td class="actions-cell">
                <button @click="editVibe(vibe)" class="btn-action btn-edit" title="Editar">
                  ✏️
                </button>
                <button @click="confirmDelete(vibe)" class="btn-action btn-delete" title="Excluir">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Edição -->
<div v-if="editingVibe" class="modal-overlay" @click.self="cancelEdit">
  <div class="modal modal-edit">
    <div class="modal-header">
      <div class="header-title">
        <span class="header-icon">✏️</span>
        <div>
          <h3>Editar Vibe</h3>
          <p class="header-subtitle">Personalize sua vibe</p>
        </div>
      </div>
      <button @click="cancelEdit" class="btn-close">×</button>
    </div>
    
    <form @submit.prevent="updateVibe" class="edit-form">
      <!-- 🔥 Preview ao vivo -->
      <div class="edit-preview-section">
        <div 
          class="edit-preview-card"
          :style="{ background: editingVibe.gradient || '#333' }"
        >
          <span class="edit-preview-emoji">{{ editingVibe.emoji || '🎵' }}</span>
          <h4>{{ editingVibe.nome || 'Nome da vibe' }}</h4>
        </div>
      </div>

      <!-- Nome -->
      <div class="form-group">
        <label><span class="label-icon">📝</span> Nome</label>
        <input v-model="editingVibe.nome" type="text" required class="input-field" />
      </div>
      
      <!-- Emoji com picker -->
      <div class="form-group">
        <label><span class="label-icon">😀</span> Emoji</label>
        <div class="emoji-input-wrapper">
          <input v-model="editingVibe.emoji" type="text" maxlength="4" class="input-field emoji-input" readonly />
          <div class="emoji-preview-large">{{ editingVibe.emoji || '🎵' }}</div>
          <button type="button" @click="toggleEditEmojiPicker" class="btn-emoji-picker" :class="{ active: showEditEmojiPicker }">
            <span class="keyboard-icon">⌨️</span>
          </button>
        </div>

        <!-- Emoji Picker (mesmo componente reutilizado) -->
        <div v-if="showEditEmojiPicker" class="emoji-overlay" @click.self="closeEditEmojiPicker">
          <div class="emoji-picker-premium">
            <div class="picker-header">
              <div class="picker-title">
                <span class="picker-icon">😊</span>
                <div class="picker-text">
                  <h4>Escolha um Emoji</h4>
                  <p>Clique para selecionar</p>
                </div>
              </div>
              <button @click="closeEditEmojiPicker" class="btn-close-picker">×</button>
            </div>
            <div class="picker-search">
              <input v-model="editEmojiSearch" type="text" placeholder="Buscar emoji..." class="search-input" />
            </div>
            <div class="picker-categories">
              <button v-for="cat in emojiCategories" :key="cat.name" @click="editActiveCategory = cat.name" :class="{ active: editActiveCategory === cat.name }" class="category-tab">
                <span class="cat-icon">{{ cat.icon }}</span>
                <span class="cat-name">{{ cat.name }}</span>
              </button>
            </div>
            <div class="picker-emojis-container">
              <div class="emoji-grid-premium">
                <button v-for="emoji in filteredEditEmojis" :key="emoji" @click="selectEditEmoji(emoji)" class="emoji-btn-premium" :class="{ selected: editingVibe.emoji === emoji }">
                  {{ emoji }}
                </button>
              </div>
            </div>
            <div class="picker-footer">
              <span class="selected-preview">{{ editingVibe.emoji || 'Nenhum' }}</span>
              <button @click="closeEditEmojiPicker" class="btn-done">Concluir</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Descrição -->
      <div class="form-group">
        <label><span class="label-icon">📄</span> Descrição</label>
       <textarea 
 v-model="editingVibe.descricao"
 required
 minlength="5"
 rows="2"
 class="input-field">
</textarea>
      </div>

      <!-- 🔥 NOVO: Editor de Gradiente -->
      <div class="form-group">
        <label><span class="label-icon">🎨</span> Cor do Gradiente</label>
        
        <div class="gradient-grid edit-gradient-grid">
          <div v-for="(gradient, index) in presetGradients" :key="index" class="gradient-option" :class="{ active: editSelectedGradientIndex === index && !editingVibe.isCustomGradient }" :style="{ background: gradient }" @click="selectEditPresetGradient(index, gradient)">
            <div v-if="editSelectedGradientIndex === index && !editingVibe.isCustomGradient" class="check-mark">✓</div>
          </div>
        </div>

        <div class="custom-gradient">
          <div class="custom-gradient-header">
            <label class="sublabel">Personalize:</label>
            <button type="button" @click="addEditColor" class="btn-add-color" :disabled="editCustomColors.length >= 5"><span>+</span></button>
          </div>
          <div class="color-stops">
            <div v-for="(color, index) in editCustomColors" :key="index" class="color-stop">
              <div class="color-picker-wrapper">
                <input type="color" v-model="editCustomColors[index]" @input="updateEditCustomGradient" class="color-input" />
                <div class="color-position">{{ getEditColorPosition(index) }}%</div>
              </div>
              <button v-if="editCustomColors.length > 2" @click="removeEditColor(index)" class="btn-remove-color">×</button>
            </div>
          </div>
          <div class="custom-gradient-preview" :style="{ background: editCustomGradientString }" @click="selectEditCustomGradient" :class="{ active: editingVibe.isCustomGradient }">
            <span v-if="editingVibe.isCustomGradient" class="check-mark">✓</span>
            <span class="preview-text">Clique para selecionar</span>
          </div>
        </div>
      </div>
      
      <!-- Tags -->
      <div class="form-group">
        <label><span class="label-icon">🏷️</span> Tags</label>
        <div class="tag-input-wrapper">
          <input v-model="newEditTag" @keyup.enter.prevent="addEditTag" placeholder="Digite uma tag e pressione Enter" class="input-field" />
          <button type="button" @click="addEditTag" class="btn-add-tag"><span>+</span></button>
        </div>
        <div class="tags-container" v-if="editingVibe.tags.length > 0">
          <span v-for="(tag, index) in editingVibe.tags" :key="index" class="tag">
            {{ tag }}<button @click="removeEditTag(index)" class="tag-remove">×</button>
          </span>
        </div>
      </div>
      
      <div class="modal-actions">
        <button type="button" @click="cancelEdit" class="btn-cancel">Cancelar</button>
        <button type="submit" class="btn-save"  :disabled="isUpdating || editingVibe.tags.length === 0">
          {{ isUpdating ? '⏳ Salvando...' : '💾 Salvar Alterações' }}
        </button>
      </div>
    </form>
  </div>
</div>

    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="deletingVibe" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal modal-confirm">
        <div class="warning-icon">⚠️</div>
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir a vibe <strong>"{{ deletingVibe.nome }}"</strong>?</p>
        <p class="warning-text">Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="btn-cancel">Cancelar</button>
          <button @click="deleteVibe" class="btn-confirm-delete" :disabled="isDeleting">
            {{ isDeleting ? 'Excluindo...' : 'Sim, Excluir' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Lista de emojis categorizados
const EMOJI_DATA = {
  'Recentes': ['🎵', '🎧', '🎸', '🎹', '🥁', '🎺', '🎻', '🎬', '🎮', '🎲'],
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'],
  'Música': ['🎵', '🎶', '🎼', '🎹', '🥁', '🎸', '🎻', '🎺', '🎷', '🎤', '🎧', '📻', '🎙️', '📢', '📣', '🔔', '🎚️', '🎛️', '🎙️'],
  'Natureza': ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌵', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌾', '💐', '🌊', '🔥', '⚡', '❄️', '☃️', '⛄', '🌈', '☀️', '🌤️', '⛅'],
  'Comida': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🍍', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🍔', '🍕', '🌭'],
  'Atividades': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷'],
  'Viagem': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟'],
  'Objetos': ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️'],
  'Símbolos': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'],
  'Flags': ['🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇳', '🇦🇺', '🇧🇷', '🇨🇦', '🇨🇳', '🇩🇪', '🇪🇸', '🇫🇷', '🇬🇧', '🇮🇳', '🇮🇹', '🇯🇵', '🇰🇷', '🇲🇽', '🇷🇺', '🇺🇸', '🇿🇦']
}

export default {
  name: 'CreateVibe',
  
  data() {
    return {
      form: {
        nome: '',
        emoji: '',
        descricao: '',
        gradient: '',
        tags: []
      },
      newTag: '',
      vibes: [],
      isLoading: false,
      isUpdating: false,
      isDeleting: false,
      editingVibe: null,
      editingTagsString: '',
      deletingVibe: null,
      selectedGradientIndex: 0,
      isCustomGradient: false,
      customColors: ['#1db954', '#191414'],
      
      // Emoji picker state
      showEmojiPicker: false,
      editEmojiSearch: '',
editActiveCategory: 'Recentes',
editSelectedGradientIndex: -1,
editCustomColors: ['#1db954', '#191414'],
newEditTag: '',
      emojiSearch: '',
      activeCategory: 'Recentes',
      emojiCategories: [
        { name: 'Recentes', icon: '🕐' },
        { name: 'Smileys', icon: '😀' },
        { name: 'Música', icon: '🎵' },
        { name: 'Natureza', icon: '🌸' },
        { name: 'Comida', icon: '🍎' },
        { name: 'Atividades', icon: '⚽' },
        { name: 'Viagem', icon: '🚗' },
        { name: 'Objetos', icon: '💻' },
        { name: 'Símbolos', icon: '❤️' },
        { name: 'Flags', icon: '🏳️' }
      ],
      
      presetGradients: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        'linear-gradient(135deg, #1db954 0%, #191414 100%)',
        'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
      ]
    }
  },

  computed: {
    customGradientString() {
      if (this.customColors.length === 2) {
        return `linear-gradient(135deg, ${this.customColors[0]} 0%, ${this.customColors[1]} 100%)`
      }
      const step = 100 / (this.customColors.length - 1)
      const stops = this.customColors.map((color, index) => {
        return `${color} ${Math.round(index * step)}%`
      })
      return `linear-gradient(135deg, ${stops.join(', ')})`
    },

    editCustomGradientString() {
  if (this.editCustomColors.length === 2) {
    return `linear-gradient(135deg, ${this.editCustomColors[0]} 0%, ${this.editCustomColors[1]} 100%)`
  }
  const step = 100 / (this.editCustomColors.length - 1)
  const stops = this.editCustomColors.map((color, i) => `${color} ${Math.round(i * step)}%`)
  return `linear-gradient(135deg, ${stops.join(', ')})`
},

filteredEditEmojis() {
  const emojis = EMOJI_DATA[this.editActiveCategory] || []
  if (!this.editEmojiSearch) return emojis
  const search = this.editEmojiSearch.toLowerCase()
  return Object.values(EMOJI_DATA).flat().filter(e => 
    e.includes(search) || this.getEmojiName(e).includes(search)
  )
},
    
    filteredEmojis() {
      const emojis = EMOJI_DATA[this.activeCategory] || []
      if (!this.emojiSearch) return emojis
      
      const search = this.emojiSearch.toLowerCase()
      const allEmojis = Object.values(EMOJI_DATA).flat()
      return allEmojis.filter(emoji => {
        return emoji.includes(search) || this.getEmojiName(emoji).includes(search)
      })
    }
  },

  mounted() {
    this.loadVibes()
    this.selectPresetGradient(0, this.presetGradients[0])
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeEmojiPicker()
    })
  },

  methods: {
    // Emoji methods
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker
      if (this.showEmojiPicker) {
        this.emojiSearch = ''
        this.activeCategory = 'Recentes'
        // Focar no input de busca após abrir
        this.$nextTick(() => {
          this.$refs.emojiSearchInput?.focus()
        })
      }
    },
    
    closeEmojiPicker() {
      this.showEmojiPicker = false
    },
    
    selectEmoji(emoji) {
      this.form.emoji = emoji
    },
    
    getEmojiName(emoji) {
      const names = {
        '🎵': 'musica nota', '🎶': 'notas musicais', '🎼': 'partitura', '🎹': 'piano',
        '🥁': 'bateria', '🎸': 'guitarra', '🎻': 'violino', '🎺': 'trompete',
        '🎷': 'saxofone', '🎤': 'microfone', '🎧': 'fone', '📻': 'radio'
      }
      return names[emoji] || ''
    },

    // Gradient methods
    selectPresetGradient(index, gradient) {
      this.selectedGradientIndex = index
      this.form.gradient = gradient
      this.isCustomGradient = false
    },

    selectCustomGradient() {
      this.isCustomGradient = true
      this.selectedGradientIndex = null
      this.form.gradient = this.customGradientString
    },

    updateCustomGradient() {
      if (this.isCustomGradient) {
        this.form.gradient = this.customGradientString
      }
    },

    addColor() {
      if (this.customColors.length < 5) {
        this.customColors.push('#ffffff')
        this.updateCustomGradient()
      }
    },

    removeColor(index) {
      if (this.customColors.length > 2) {
        this.customColors.splice(index, 1)
        this.updateCustomGradient()
      }
    },

    getColorPosition(index) {
      if (this.customColors.length === 1) return 0
      return Math.round((index / (this.customColors.length - 1)) * 100)
    },

    addTag() {
      if (!this.newTag.trim()) return
      if (!this.form.tags.includes(this.newTag.trim())) {
        this.form.tags.push(this.newTag.trim())
      }
      this.newTag = ''
    },

    removeTag(index) {
      this.form.tags.splice(index, 1)
    },

    async createVibe() {
       if (
   !this.form.nome.trim() ||
   !this.form.emoji.trim() ||
   !this.form.descricao.trim() ||
   !this.form.gradient.trim() ||
   this.form.tags.length === 0
 ) {
   alert('Preencha todos os campos e adicione ao menos uma tag.')
   return
 }

      this.isLoading = true
      try {
        const res = await fetch("http://localhost:3002/vibes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form)
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        alert("Vibe criada com sucesso! 🎉")
        
        this.form = { nome: '', emoji: '', descricao: '', gradient: this.presetGradients[0], tags: [] }
        this.selectPresetGradient(0, this.presetGradients[0])
        
        await this.loadVibes()

      } catch (err) {
        alert("Erro: " + err.message)
      } finally {
        this.isLoading = false
      }
    },

    async loadVibes() {
      try {
        const res = await fetch("http://localhost:3002/vibes")
        const data = await res.json()
        if (res.ok) {
          this.vibes = data
        }
      } catch (err) {
        console.error("Erro ao carregar vibes:", err)
      }
    },
// ========== EMOJI PICKER EDIÇÃO ==========
toggleEditEmojiPicker() {
  this.showEditEmojiPicker = !this.showEditEmojiPicker
  if (this.showEditEmojiPicker) {
    this.editEmojiSearch = ''
    this.editActiveCategory = 'Recentes'
  }
},
closeEditEmojiPicker() {
  this.showEditEmojiPicker = false
},
selectEditEmoji(emoji) {
  this.editingVibe.emoji = emoji
},

// ========== GRADIENT EDIÇÃO ==========
selectEditPresetGradient(index, gradient) {
  this.editSelectedGradientIndex = index
  this.editingVibe.gradient = gradient
  this.editingVibe.isCustomGradient = false
},
selectEditCustomGradient() {
  this.editingVibe.isCustomGradient = true
  this.editSelectedGradientIndex = -1
  this.editingVibe.gradient = this.editCustomGradientString
},
updateEditCustomGradient() {
  if (this.editingVibe.isCustomGradient) {
    this.editingVibe.gradient = this.editCustomGradientString
  }
},
addEditColor() {
  if (this.editCustomColors.length < 5) {
    this.editCustomColors.push('#ffffff')
    this.updateEditCustomGradient()
  }
},
removeEditColor(index) {
  if (this.editCustomColors.length > 2) {
    this.editCustomColors.splice(index, 1)
    this.updateEditCustomGradient()
  }
},
getEditColorPosition(index) {
  if (this.editCustomColors.length === 1) return 0
  return Math.round((index / (this.editCustomColors.length - 1)) * 100)
},

// ========== TAGS EDIÇÃO ==========
addEditTag() {
  if (!this.newEditTag.trim()) return
  if (!this.editingVibe.tags.includes(this.newEditTag.trim())) {
    this.editingVibe.tags.push(this.newEditTag.trim())
  }
  this.newEditTag = ''
},
removeEditTag(index) {
  this.editingVibe.tags.splice(index, 1)
},

// ========== SUBSTITUIR editVibe ==========
editVibe(vibe) {
  this.editingVibe = { 
    ...vibe,
    tags: [...(vibe.tags || [])]
  }
  
  const vibeGradient = vibe.gradient || ''
  const presetIndex = this.presetGradients.findIndex(g => g === vibeGradient)
  
  if (presetIndex >= 0) {
    this.editSelectedGradientIndex = presetIndex
    this.editingVibe.isCustomGradient = false
    this.editCustomColors = ['#1db954', '#191414']
  } else if (vibeGradient.includes('linear-gradient')) {
    this.editingVibe.isCustomGradient = true
    this.editSelectedGradientIndex = -1
    const colors = vibeGradient.match(/#[a-fA-F0-9]{6}/g)
    this.editCustomColors = (colors && colors.length >= 2) ? [...colors] : ['#1db954', '#191414']
  } else {
    this.editSelectedGradientIndex = 0
    this.editingVibe.isCustomGradient = false
    this.editingVibe.gradient = this.presetGradients[0]
    this.editCustomColors = ['#1db954', '#191414']
  }
  
  this.newEditTag = ''
},

// ========== SUBSTITUIR updateVibe ==========
async updateVibe() {
  if (
 !this.editingVibe.nome.trim() ||
 !this.editingVibe.emoji.trim() ||
 !this.editingVibe.descricao.trim() ||
 this.editingVibe.tags.length === 0
){
 alert('Todos os campos são obrigatórios.')
 return
}
  this.isUpdating = true
  try {
    const finalGradient = this.editingVibe.isCustomGradient 
      ? this.editCustomGradientString 
      : this.editingVibe.gradient

    const res = await fetch(`http://localhost:3002/vibes/${this.editingVibe._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: this.editingVibe.nome,
        emoji: this.editingVibe.emoji,
        descricao: this.editingVibe.descricao,
        gradient: finalGradient,
        tags: this.editingVibe.tags
      })
    })

    if (!res.ok) throw new Error("Erro ao atualizar")

    alert("Vibe atualizada! ✨")
    this.cancelEdit()
    await this.loadVibes()

  } catch (err) {
    alert("Erro ao atualizar: " + err.message)
  } finally {
    this.isUpdating = false
  }
},

// ========== SUBSTITUIR cancelEdit ==========
cancelEdit() {
  this.editingVibe = null
  this.editingTagsString = ''
  this.showEditEmojiPicker = false
  this.editSelectedGradientIndex = -1
  this.editCustomColors = ['#1db954', '#191414']
  this.newEditTag = ''
},
    confirmDelete(vibe) {
      this.deletingVibe = vibe
    },

    cancelDelete() {
      this.deletingVibe = null
    },

    async deleteVibe() {
      this.isDeleting = true
      try {
        const res = await fetch(`http://localhost:3002/vibes/${this.deletingVibe._id}`, {
          method: "DELETE"
        })

        if (!res.ok) throw new Error("Erro ao excluir")

        alert("Vibe removida! 🗑️")
        this.cancelDelete()
        await this.loadVibes()

      } catch (err) {
        alert("Erro ao excluir: " + err.message)
      } finally {
        this.isDeleting = false
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.create-vibe-container {
  width: 100%;
  min-height: 100vh;

  /* 🔥 ocupa tudo menos o sidebar */
  margin-left: 0;
  
  padding: 40px 30px;
  box-sizing: border-box;

  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sparkle {
  animation: sparkle 2s infinite;
  display: inline-block;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(10deg); }
}

.subtitle {
  color: #b3b3b3;
  font-size: 1.1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
  margin-bottom: 50px;
}

@media (max-width: 968px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.form-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 600;
  color: #fff;
  font-size: 0.95rem;
}

.label-icon {
  font-size: 1.2rem;
}

.input-field {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #1db954;
  background: rgba(0, 0, 0, 0.5);
}

.input-field::placeholder {
  color: #666;
}

/* Emoji Input & Picker Premium */
.emoji-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.emoji-input {
  flex: 1;
  cursor: pointer;
}

.emoji-preview-large {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.btn-emoji-picker {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.keyboard-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-emoji-picker:hover {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  border-color: transparent;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.4);
}

.btn-emoji-picker.active {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  border-color: transparent;
  box-shadow: 0 0 30px rgba(29, 185, 84, 0.6);
}

.btn-emoji-picker.active .keyboard-icon {
  transform: scale(0.9);
}

/* Emoji Picker Premium Overlay */
.emoji-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Emoji Picker Premium Panel */
.emoji-picker-premium {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  background: linear-gradient(145deg, #1e1e2e 0%, #252535 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(40px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Header */
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.picker-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.picker-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
}

.picker-text h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}

.picker-text p {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #888;
}

.btn-close-picker {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-picker:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  transform: rotate(90deg);
}

/* Search */
.picker-search {
  position: relative;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-icon {
  position: absolute;
  left: 36px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
  transition: color 0.3s;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #1db954;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.1);
}

.search-input:focus + .search-icon {
  color: #1db954;
}

/* Categories */
.picker-categories {
  display: flex;
  gap: 6px;
  padding: 12px 24px;
  overflow-x: auto;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.picker-categories::-webkit-scrollbar {
  display: none;
}

.category-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 60px;
}

.cat-icon {
  font-size: 1.4rem;
  transition: transform 0.3s;
}

.cat-name {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateY(-2px);
}

.category-tab:hover .cat-icon {
  transform: scale(1.2);
}

.category-tab.active {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
}

.category-tab.active .cat-icon {
  transform: scale(1.1);
}

/* Emojis Container */
.picker-emojis-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.emoji-grid-premium {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
}

.emoji-btn-premium {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.emoji-btn-premium::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(29, 185, 84, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.emoji-btn-premium:hover {
  background: rgba(29, 185, 84, 0.15);
  border-color: rgba(29, 185, 84, 0.5);
  transform: scale(1.25);
  z-index: 10;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.emoji-btn-premium:hover::before {
  opacity: 1;
}

.emoji-btn-premium.selected {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  border-color: #fff;
  transform: scale(1.15);
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.5);
}

/* Footer */
.picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.selected-preview {
  font-size: 1.8rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 12px;
  min-width: 60px;
  text-align: center;
}

.btn-done {
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
}

.btn-done:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(29, 185, 84, 0.4);
}

/* Grid de Gradientes */
.gradient-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

@media (max-width: 600px) {
  .gradient-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.gradient-option {
  aspect-ratio: 1;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border: 3px solid transparent;
}

.gradient-option:hover {
  transform: scale(1.1);
  z-index: 10;
}

.gradient-option.active {
  border-color: #fff;
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.5);
}

.check-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #1db954;
  font-weight: bold;
}

/* Custom Gradient */
.custom-gradient {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.custom-gradient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.sublabel {
  font-size: 0.9rem;
  color: #b3b3b3;
  font-weight: 500;
}

.btn-add-color {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-color:hover:not(:disabled) {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.5);
}

.btn-add-color:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.color-stops {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 15px;
  justify-content: center;
}

.color-stop {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.color-picker-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.color-input {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: none;
  padding: 0;
  transition: transform 0.3s;
}

.color-input:hover {
  transform: scale(1.1);
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.color-position {
  font-size: 0.75rem;
  color: #888;
  font-weight: 600;
}

.btn-remove-color {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-color:hover {
  background: #dc2626;
  transform: scale(1.2);
}

.custom-gradient-preview {
  height: 60px;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  border: 3px solid transparent;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-gradient-preview:hover {
  transform: scale(1.02);
}

.custom-gradient-preview.active {
  border-color: #fff;
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.5);
}

.custom-gradient-preview .check-mark {
  position: relative;
  top: auto;
  left: auto;
  transform: none;
}

.preview-text {
  position: absolute;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  pointer-events: none;
}

/* Tags */
.tag-input-wrapper {
  display: flex;
  gap: 10px;
}

.btn-add-tag {
  width: 45px;
  height: 45px;
  border-radius: 12px;
  border: none;
  background: #1db954;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-tag:hover {
  background: #1ed760;
  transform: scale(1.05);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
/* ========== MODAL DE EDIÇÃO PREMIUM ========== */
.modal-edit {
  max-width: 560px;
  width: 100%;
}

.modal-edit .modal-header {
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.header-subtitle {
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: #888;
}

.edit-preview-section {
  margin-bottom: 24px;
}

.edit-preview-card {
  width: 100%;
  height: 120px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: previewPulse 2s infinite;
}

@keyframes previewPulse {
  0%, 100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
  50% { box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5); }
}

.edit-preview-emoji {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.edit-preview-card h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.edit-gradient-grid {
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

@media (max-width: 600px) {
  .edit-gradient-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-actions button {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.modal-actions .btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #b3b3b3;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-actions .btn-cancel:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.modal-actions .btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.modal-actions .btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.edit-form {
  padding: 0 28px 28px;
}

.modal-edit .emoji-overlay {
  z-index: 10000;
}
.tag {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
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
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: #fff;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.tag-remove:hover {
  background: rgba(255, 0, 0, 0.6);
}

/* Botão Submit */
.btn-submit {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(29, 185, 84, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Preview Section */
.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-section h3 {
  margin-bottom: 20px;
  color: #b3b3b3;
  font-weight: 500;
}

.vibe-card-preview {
  width: 100%;
  max-width: 350px;
}

.vibe-card {
  border-radius: 24px;
  padding: 30px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
}

.vibe-card:hover {
  transform: translateY(-5px) rotateX(5deg);
}

.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  transition: all 0.5s;
  opacity: 0;
}

.vibe-card:hover .card-shine {
  opacity: 1;
  transform: rotate(45deg) translate(20%, 20%);
}

.card-content {
  position: relative;
  z-index: 1;
}

.emoji-display {
  font-size: 4rem;
  display: block;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}

.card-title {
  font-size: 1.8rem;
  margin: 0 0 10px 0;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.card-description {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.tag-pill {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Lista de Vibes */
.vibes-list-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
}

.count-badge {
  background: #1db954;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.btn-refresh {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(180deg);
}

.table-container {
  overflow-x: auto;
}

.vibes-table {
  width: 100%;
  border-collapse: collapse;
}

.vibes-table th {
  text-align: left;
  padding: 15px;
  color: #888;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.vibes-table td {
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
}

.vibes-table tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.table-preview {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.name-cell {
  font-weight: 600;
  color: #fff;
}

.desc-cell {
  color: #b3b3b3;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.table-tag {
  background: rgba(29, 185, 84, 0.2);
  color: #1db954;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.more-tags {
  background: rgba(255, 255, 255, 0.1);
  color: #888;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
}

.date-cell {
  color: #666;
  font-size: 0.85rem;
  white-space: nowrap;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.btn-edit:hover {
  background: #3b82f6;
  color: #fff;
  transform: scale(1.1);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-delete:hover {
  background: #ef4444;
  color: #fff;
  transform: scale(1.1);
}

/* Modais */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
   align-items: flex-start;
  overflow-y: auto;
  padding: 24px 16px;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

.modal {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.btn-close {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.modal-confirm {
  text-align: center;
  max-width: 400px;
}

.warning-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.modal-confirm h3 {
  margin-bottom: 15px;
  color: #fff;
}

.modal-confirm p {
  color: #b3b3b3;
  margin-bottom: 10px;
}

.warning-text {
  color: #ef4444;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4);
}

.btn-confirm-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}

.btn-confirm-delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(239, 68, 68, 0.4);
}

.edit-form .form-group {
  margin-bottom: 20px;
}

.edit-form label {
  display: block;
  margin-bottom: 8px;
  color: #b3b3b3;
  font-size: 0.9rem;
}

/* Scrollbar estilizada */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #1db954;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1ed760;
}

/* Animações adicionais para o emoji picker */
@media (max-width: 640px) {
  .emoji-picker-premium {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 20px 20px 0 0;
    animation: slideUpMobile 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes slideUpMobile {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  .emoji-grid-premium {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .picker-categories {
    padding: 12px 16px;
  }
  
  .category-tab {
    min-width: 50px;
    padding: 6px 10px;
  }
  
  .cat-name {
    font-size: 0.6rem;
  }
}
</style>