<template>
  <div class="playlist-app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="currentColor" class="logo-icon">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span class="logo-text">MusicFlow</span>
        </div>
        <button @click="showCreateModal = true" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Criar Playlist
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Empty State -->
        <div v-if="playlists.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg viewBox="0 0 200 200" class="empty-svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.2" />
                  <stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.2" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="url(#grad1)"/>
              <path d="M70 80 Q100 60 130 80 T130 120 Q100 140 70 120 T70 80" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>
              <circle cx="85" cy="95" r="5" fill="#6366f1"/>
              <circle cx="115" cy="95" r="5" fill="#6366f1"/>
              <path d="M90 110 Q100 118 110 110" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <h2>Nenhuma playlist ainda</h2>
          <p>Crie sua primeira playlist para começar a organizar suas músicas</p>
          <button @click="showCreateModal = true" class="btn-secondary">
            Criar Playlist
          </button>
        </div>

        <!-- Playlists Grid - LADO A LADO -->
        <div v-else class="playlists-grid">
          <div 
            v-for="playlist in playlists" 
            :key="playlist.id"
            class="playlist-card"
            :class="{ 'with-image': playlist.coverImage }"
          >
            <div class="card-image" :style="getPlaylistStyle(playlist)">
              <div v-if="!playlist.coverImage" class="gradient-overlay">
                <svg viewBox="0 0 24 24" fill="currentColor" class="music-icon">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <img v-else :src="playlist.coverImage" :alt="playlist.name">
              
              <!-- Overlay com botões -->
              <div class="card-overlay">
                <button @click.stop="openPlaylist(playlist)" class="play-button">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <!-- Botão excluir playlist -->
                <button @click.stop="deletePlaylist(playlist.id)" class="delete-btn" title="Excluir playlist">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="card-info" @click="openPlaylist(playlist)">
              <h3 class="playlist-name">{{ playlist.name || 'Minha Playlist' }}</h3>
              <p class="playlist-count">{{ playlist.songs.length }} música{{ playlist.songs.length !== 1 ? 's' : '' }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Playlist Modal - TUDO VISÍVEL COM SCROLL -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content create-modal">
          <div class="modal-header">
            <h2>Criar Nova Playlist</h2>
            <button @click="closeModal" class="close-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <!-- Scroll container para o conteúdo -->
          <div class="modal-scroll-content">
            <div class="modal-body">
              <!-- Image Upload -->
              <div class="upload-section">
                <div 
                  class="upload-area"
                  :class="{ 'has-image': previewImage }"
                  @click="triggerFileInput"
                  @dragover.prevent
                  @drop.prevent="handleDrop"
                >
                  <input 
                    ref="fileInput"
                    type="file" 
                    accept="image/*" 
                    @change="handleFileSelect"
                    class="hidden-input"
                  >
                  <div v-if="!previewImage" class="upload-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="upload-icon">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    <span>Adicionar foto</span>
                    <small>ou arraste uma imagem</small>
                  </div>
                  <img v-else :src="previewImage" class="preview-image" alt="Preview">
                  <button v-if="previewImage" @click.stop="removeImage" class="remove-image">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Name Input -->
              <div class="form-group">
                <label for="playlist-name">Nome da Playlist</label>
                <input 
                  id="playlist-name"
                  v-model="newPlaylist.name"
                  type="text" 
                  placeholder="Digite um nome (opcional)"
                  class="text-input"
                >
              </div>

              <!-- Color Picker (shown when no name) -->
              <div class="form-group color-section" v-if="!newPlaylist.name">
                <label>Escolha uma cor</label>
                <div class="color-grid">
                  <button 
                    v-for="color in colors" 
                    :key="color"
                    @click="newPlaylist.color = color"
                    class="color-btn"
                    :class="{ active: newPlaylist.color === color }"
                    :style="{ background: color }"
                  >
                    <svg v-if="newPlaylist.color === color" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn-text">Cancelar</button>
            <button 
              @click="createPlaylist" 
              class="btn-primary"
              :disabled="!isValid"
            >
              Criar
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Playlist Detail Modal -->
    <Transition name="modal">
      <div v-if="selectedPlaylist" class="modal-overlay playlist-detail-overlay" @click.self="closePlaylistDetail">
        <div class="modal-content playlist-detail">
          <div class="detail-header" :style="getPlaylistStyle(selectedPlaylist)">
            <button @click="closePlaylistDetail" class="back-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <div class="detail-info">
              <div class="detail-image" :style="getPlaylistStyle(selectedPlaylist)">
                <div v-if="!selectedPlaylist.coverImage" class="gradient-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <img v-else :src="selectedPlaylist.coverImage" :alt="selectedPlaylist.name">
              </div>
              <div class="detail-text">
                <h1>{{ selectedPlaylist.name || 'Minha Playlist' }}</h1>
                <p>{{ selectedPlaylist.songs.length }} música{{ selectedPlaylist.songs.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
          </div>

          <div class="detail-body">
            <div v-if="selectedPlaylist.songs.length === 0" class="empty-songs">
              <p>Esta playlist está vazia</p>
              <button class="btn-secondary">Adicionar músicas</button>
            </div>
            
            <div v-else class="songs-list">
              <div 
                v-for="(song, index) in selectedPlaylist.songs" 
                :key="index"
                class="song-item"
              >
                <div class="song-number">{{ index + 1 }}</div>
                <div class="song-info">
                  <h4>{{ song.title }}</h4>
                  <p>{{ song.artist }}</p>
                </div>
                <div class="song-duration">{{ song.duration }}</div>
                
                <!-- Menu de 3 pontos com opções -->
                <div class="song-menu-container">
                  <button class="song-menu-btn" @click.stop="toggleSongMenu(index)">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  
                  <!-- Dropdown menu -->
                  <div v-if="activeSongMenu === index" class="song-dropdown">
                    <button @click="playSong(song)" class="dropdown-item">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      <span>Tocar</span>
                    </button>
                    <button @click="editSong(song)" class="dropdown-item">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                      <span>Editar</span>
                    </button>
                    <button @click="removeSong(index)" class="dropdown-item danger">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                      <span>Remover da playlist</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Overlay para fechar menu quando clicar fora -->
    <div v-if="activeSongMenu !== null" class="menu-overlay" @click="activeSongMenu = null"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const showCreateModal = ref(false)
const selectedPlaylist = ref(null)
const fileInput = ref(null)
const previewImage = ref(null)
const activeSongMenu = ref(null)

const colors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
]

const newPlaylist = ref({
  name: '',
  color: colors[0],
  coverImage: null
})

// Sample data
const playlists = ref([
  {
    id: 1,
    name: 'Rock Classics',
    color: colors[1],
    coverImage: null,
    songs: [
      { title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55' },
      { title: 'Hotel California', artist: 'Eagles', duration: '6:30' },
      { title: 'Stairway to Heaven', artist: 'Led Zeppelin', duration: '8:02' }
    ]
  },
  {
    id: 2,
    name: 'Pop Hits',
    color: colors[3],
    coverImage: null,
    songs: [
      { title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
      { title: 'Levitating', artist: 'Dua Lipa', duration: '3:23' }
    ]
  },
  {
    id: 3,
    name: 'Minha Playlist',
    color: colors[0],
    coverImage: null,
    songs: []
  }
])

const isValid = computed(() => {
  return newPlaylist.value.name.trim() || newPlaylist.value.color
})

const getPlaylistStyle = (playlist) => {
  if (playlist.coverImage) {
    return { backgroundImage: `url(${playlist.coverImage})` }
  }
  return { background: playlist.color || colors[0] }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
      newPlaylist.value.coverImage = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
      newPlaylist.value.coverImage = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  previewImage.value = null
  newPlaylist.value.coverImage = null
  if (fileInput.value) fileInput.value.value = ''
}

const createPlaylist = () => {
  const playlist = {
    id: Date.now(),
    name: newPlaylist.value.name || '',
    color: newPlaylist.value.color,
    coverImage: newPlaylist.value.coverImage,
    songs: []
  }
  
  playlists.value.unshift(playlist)
  closeModal()
}

const deletePlaylist = (id) => {
  if (confirm('Tem certeza que deseja excluir esta playlist?')) {
    playlists.value = playlists.value.filter(p => p.id !== id)
    if (selectedPlaylist.value?.id === id) {
      selectedPlaylist.value = null
    }
  }
}

const closeModal = () => {
  showCreateModal.value = false
  newPlaylist.value = { name: '', color: colors[0], coverImage: null }
  previewImage.value = null
}

const openPlaylist = (playlist) => {
  selectedPlaylist.value = playlist
}

const closePlaylistDetail = () => {
  selectedPlaylist.value = null
  activeSongMenu.value = null
}

// Menu de músicas
const toggleSongMenu = (index) => {
  activeSongMenu.value = activeSongMenu.value === index ? null : index
}

const playSong = (song) => {
  alert(`Tocando: ${song.title} - ${song.artist}`)
  activeSongMenu.value = null
}

const editSong = (song) => {
  const newTitle = prompt('Novo título:', song.title)
  if (newTitle !== null && newTitle.trim() !== '') {
    song.title = newTitle.trim()
  }
  activeSongMenu.value = null
}

const removeSong = (index) => {
  if (confirm('Remover esta música da playlist?')) {
    selectedPlaylist.value.songs.splice(index, 1)
  }
  activeSongMenu.value = null
}

// Fechar menu ao pressionar ESC
const handleEsc = (e) => {
  if (e.key === 'Escape') {
    activeSongMenu.value = null
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEsc)
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.playlist-app {
  min-height: 100vh;
  background: #0f0f0f;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.app-header {
  background: rgba(15, 15, 15, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 1rem 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #6366f1;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.875rem 2rem;
  background: transparent;
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-text {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s;
}

.btn-text:hover {
  color: #fff;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* Main Content */
.main-content {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-illustration {
  margin-bottom: 2rem;
}

.empty-svg {
  width: 200px;
  height: 200px;
  opacity: 0.8;
}

.empty-state h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 2rem;
}

/* Playlists Grid - LADO A LADO FIXO */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.playlist-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: fit-content;
}

.playlist-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.card-image {
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
}

.gradient-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-icon {
  width: 48px;
  height: 48px;
  opacity: 0.8;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Overlay com botões */
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .card-overlay {
  opacity: 1;
}

.play-button {
  width: 56px;
  height: 56px;
  background: rgba(99, 102, 241, 0.9);
  border-radius: 50%;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: scale(0.8);
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.play-button:hover {
  transform: scale(1.1);
  background: rgba(99, 102, 241, 1);
}

.play-button svg {
  width: 28px;
  height: 28px;
  margin-left: 4px;
}

/* Botão excluir */
.delete-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.8);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.delete-btn svg {
  width: 20px;
  height: 20px;
}

.card-info {
  padding: 1rem;
}

.playlist-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-count {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

/* Modal - CORREÇÃO PARA VISIBILIDADE TOTAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #1a1a1a;
  border-radius: 20px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* Modal de criação com scroll */
.create-modal {
  max-width: 480px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

/* Container de scroll para o body */
.modal-scroll-content {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.modal-body {
  padding: 1.5rem;
}

/* Upload Section */
.upload-section {
  margin-bottom: 1.5rem;
}

.upload-area {
  aspect-ratio: 16/9;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
}

.upload-area:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.upload-area.has-image {
  border-style: solid;
  border-color: transparent;
}

.hidden-input {
  display: none;
}

.upload-placeholder {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.upload-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.upload-placeholder span {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.upload-placeholder small {
  font-size: 0.875rem;
  opacity: 0.7;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.remove-image:hover {
  background: rgba(239, 68, 68, 0.9);
}

.remove-image svg {
  width: 18px;
  height: 18px;
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
}

.text-input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s;
}

.text-input:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(255, 255, 255, 0.08);
}

.text-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Color Grid */
.color-section {
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

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.color-btn {
  aspect-ratio: 1;
  border-radius: 12px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.color-btn:hover {
  transform: scale(1.05);
}

.color-btn.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px #6366f1;
}

.color-btn svg {
  width: 24px;
  height: 24px;
  color: #fff;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

/* Playlist Detail */
.playlist-detail-overlay {
  align-items: flex-start;
  padding-top: 2rem;
}

.playlist-detail {
  max-width: 600px;
  max-height: 85vh;
}

.detail-header {
  padding: 2rem;
  position: relative;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.detail-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8));
}

.back-btn {
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.6);
  transform: translateX(-2px);
}

.back-btn svg {
  width: 24px;
  height: 24px;
}

.detail-info {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
}

.detail-image {
  width: 150px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  flex-shrink: 0;
  background-size: cover;
  background-position: center;
}

.gradient-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gradient-icon svg {
  width: 48px;
  height: 48px;
  opacity: 0.8;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-text h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.detail-text p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.detail-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.empty-songs {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.6);
}

.empty-songs p {
  margin-bottom: 1rem;
}

.songs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.3s;
  position: relative;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.song-number {
  width: 32px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-info h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

/* Menu de 3 pontos */
.song-menu-container {
  position: relative;
  flex-shrink: 0;
}

.song-menu-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.song-item:hover .song-menu-btn {
  opacity: 1;
}

.song-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.song-menu-btn svg {
  width: 20px;
  height: 20px;
}

/* Dropdown menu */
.song-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #2a2a2a;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item.danger {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.dropdown-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Overlay para fechar menus */
.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .playlists-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  .detail-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .detail-image {
    width: 120px;
    height: 120px;
  }
  
  .detail-text h1 {
    font-size: 1.5rem;
  }
  
  .song-menu-btn {
    opacity: 1;
  }
}
</style>