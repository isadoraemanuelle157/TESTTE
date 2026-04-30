<template>
  <div class="playlist-container">
    
    <!-- MODO LISTA -->
    <div v-if="currentView === 'list'" class="playlists-list-view">
      <div class="list-header">
        <h1>Minhas Playlists</h1>
        <button class="btn-create-new" @click="startCreate">
          <i class="fa fa-plus"></i> Criar Playlist
        </button>
      </div>

      <div v-if="playlists.length > 0" class="playlists-grid">
        <div v-for="playlist in playlists" :key="playlist.id" class="playlist-card" @click="openPlaylist(playlist)">
          <div class="card-cover">
            <img v-if="playlist.image" :src="playlist.image" alt="Capa" />
            <div v-else class="cover-default"><i class="fa fa-music"></i></div>
            <div class="play-overlay">
              <button class="btn-play-card" @click.stop="playPlaylist(playlist)"><i class="fa fa-play"></i></button>
            </div>
          </div>
          <div class="card-info">
            <h3>{{ playlist.title }}</h3>
            <p class="card-meta">
              <i :class="playlist.isPublic ? 'fa fa-globe' : 'fa fa-lock'"></i>
              {{ playlist.songs.length }} {{ playlist.songs.length === 1 ? 'música' : 'músicas' }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="empty-playlists">
        <h2>Nenhuma playlist ainda</h2>
        <p>Crie sua primeira playlist e organize suas músicas favoritas</p>
      </div>
    </div>

    <!-- MODO CRIAÇÃO -->
    <div v-else-if="currentView === 'create'" class="create-view">
      <button class="btn-back" @click="backToList"><i class="fa fa-arrow-left"></i> Voltar</button>
      <div class="create-mode">
        <h1>Criar nova playlist</h1>
        <div class="create-form">
          <div class="cover-upload" @click="triggerImageUpload">
            <input type="file" ref="imageInput" accept="image/*" @change="handleImageUpload" hidden />
            <div v-if="playlistImage" class="preview-container">
              <img :src="playlistImage" alt="Preview" />
            </div>
            <div v-else class="upload-placeholder"><i class="fa fa-music"></i><span>Escolher foto</span></div>
          </div>
          <div class="form-fields">
            <div class="field-group">
              <label>Nome da playlist *</label>
              <input type="text" v-model="playlistTitle" placeholder="Ex: Minhas Favoritas" maxlength="100" ref="titleInput" />
            </div>
            <div class="field-group">
              <label>Descrição</label>
              <textarea v-model="playlistDescription" placeholder="Descrição opcional..." maxlength="300" rows="3"></textarea>
            </div>
            <div class="privacy-options">
              <button :class="{ active: isPublic }" @click="isPublic = true"><i class="fa fa-globe"></i> Pública</button>
              <button :class="{ active: !isPublic }" @click="isPublic = false"><i class="fa fa-lock"></i> Privada</button>
            </div>
          </div>
        </div>
        <div class="create-actions">
          <button class="btn-secondary" @click="cancelCreate">Cancelar</button>
          <button class="btn-primary" @click="createPlaylist" :disabled="!playlistTitle.trim()">
            <i class="fa fa-plus"></i> Criar playlist
          </button>
        </div>
      </div>
    </div>

    <!-- MODO VISUALIZAÇÃO -->
    <div v-else-if="currentView === 'view'" class="view-mode">
      <button class="btn-back" @click="backToList"><i class="fa fa-arrow-left"></i> Voltar</button>
      
      <div class="playlist-header">
        <div class="playlist-cover">
          <img v-if="currentPlaylist.image" :src="currentPlaylist.image" alt="Capa" />
          <div v-else class="cover-default large"><i class="fa fa-music"></i></div>
        </div>
        <div class="playlist-info">
          <span class="playlist-type">
            <i :class="currentPlaylist.isPublic ? 'fa fa-globe' : 'fa fa-lock'"></i>
            Playlist {{ currentPlaylist.isPublic ? 'pública' : 'privada' }}
          </span>
          <h1 class="playlist-title">{{ currentPlaylist.title }}</h1>
          <p v-if="currentPlaylist.description" class="playlist-description">{{ currentPlaylist.description }}</p>
          <div class="playlist-meta">
            <span><i class="fa fa-user-circle"></i> {{ currentPlaylist.authorName }}</span>
            <span>•</span>
            <span>{{ currentPlaylist.songs.length }} músicas</span>
            <span v-if="totalDuration">• {{ totalDuration }}</span>
          </div>
        </div>
      </div>

      <div class="playlist-controls">
        <button class="btn-play-big" @click="playAll" :disabled="!currentPlaylist.songs.length">
          <i :class="isPlaying ? 'fa fa-pause' : 'fa fa-play'"></i>
        </button>
        <button class="btn-icon" @click="toggleFavorita" :class="{ liked: currentPlaylist.isFavorita }">
          <i :class="currentPlaylist.isFavorita ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
        </button>
        <div class="dropdown-wrapper" v-click-outside="closeOptions">
          <button class="btn-icon" @click.stop="toggleOptions"><i class="fa fa-ellipsis-h"></i></button>
          <div v-show="showOptions" class="options-dropdown">
            <div class="option-item" @click="sharePlaylist"><i class="fa fa-share-alt"></i> Compartilhar</div>
            <div class="option-item" @click="startEdit"><i class="fa fa-pencil"></i> Editar</div>
            <div class="option-divider"></div>
            <div class="option-item danger" @click="confirmDeleteFromMenu"><i class="fa fa-trash-o"></i> Excluir</div>
          </div>
        </div>
      </div>

      <!-- Busca -->
      <div class="add-songs-section">
        <h3><i class="fa fa-plus-circle"></i> Adicionar músicas</h3>
        <div class="search-box">
          <i class="fa fa-search"></i>
          <input type="text" v-model="searchQuery" placeholder="Buscar músicas, artistas..." @input="debouncedSearch" />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch"><i class="fa fa-times"></i></button>
        </div>
      </div>

      <!-- Resultados da Busca -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div v-for="song in searchResults" :key="song.id+'-'+song.source" class="result-item">
          <img :src="song.cover || '/default-cover.png'" class="result-cover" />
          <div class="result-info">
            <span class="result-title">{{ song.title }}</span>
            <span class="result-artist">{{ song.artist }} • {{ song.album }}</span>
            <span v-if="song.source !== 'local'" class="result-source" :class="song.source">{{ song.source }}</span>
          </div>
          <button class="btn-add" @click="addSong(song)" :disabled="isSongAdded(song)">
            <i :class="isSongAdded(song) ? 'fa fa-check' : 'fa fa-plus'"></i>
          </button>
        </div>
      </div>

      <!-- Lista de Músicas -->
      <div v-if="currentPlaylist.songs.length > 0" class="songs-section">
        <div class="songs-header">
          <span>#</span><span>Título</span><span>Álbum</span><span><i class="fa fa-clock-o"></i></span><span></span>
        </div>
        <div v-for="(song, index) in currentPlaylist.songs" :key="(song.source||'local')+'-'+song.id" 
             class="song-item" :class="{ playing: currentPlayingIndex === index && isPlaying }" @dblclick="playSong(index)">
          <span class="song-number">
            <i v-if="currentPlayingIndex === index && isPlaying" class="fa fa-volume-up"></i>
            <span v-else>{{ index + 1 }}</span>
          </span>
          <div class="song-title">
            <img :src="song.cover || '/default-cover.png'" />
            <div>
              <div :class="{ active: currentPlayingIndex === index }">{{ song.title }}</div>
              <small>{{ song.artist }}</small>
              <span v-if="song.source && song.source !== 'local'" class="song-source-badge" :class="song.source">{{ song.source }}</span>
            </div>
          </div>
          <span class="song-album">{{ song.album }}</span>
          <span class="song-duration">{{ song.duration }}</span>
          <button class="btn-remove" @click="confirmRemoveSong(index)"><i class="fa fa-times"></i></button>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="fa fa-music"></i>
        <h3>Sua playlist está vazia</h3>
        <p>Use a busca acima para adicionar músicas</p>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <i :class="toast.icon"></i>
      <span>{{ toast.message }}</span>
    </div>

    <!-- Modal Excluir Playlist -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="delete-modal" @click.stop>
        <h3>Excluir playlist?</h3>
        <p>Tem certeza que deseja excluir "{{ playlistToDelete?.title }}"?</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelDelete">Cancelar</button>
          <button class="btn-danger" @click="executeDelete">Excluir</button>
        </div>
      </div>
    </div>

    <!-- Modal Remover Música -->
    <div v-if="showRemoveSongModal" class="modal-overlay" @click="cancelRemoveSong">
      <div class="delete-modal" @click.stop>
        <h3>Remover música?</h3>
        <p>"{{ songToRemove?.title }}" será removida da playlist.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="cancelRemoveSong">Cancelar</button>
          <button class="btn-danger" @click="executeRemoveSong">Remover</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const clickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) binding.value()
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}

export default {
  name: "PlaylistManager",
  directives: { 'click-outside': clickOutside },
  
  data() {
    return {
      DEEZER_API: 'https://proxy.corsfix.com/?https://api.deezer.com',
      SPOTIFY_PROXY: 'http://localhost:3002/spotify',
      
      currentView: 'list',
      playlists: [],
      favoritas: [],
      currentPlaylist: null,
      
      showDeleteModal: false,
      playlistToDelete: null,
      isDeleting: false,
      
      showRemoveSongModal: false,
      songToRemove: null,
      songToRemoveIndex: null,
      isRemovingSong: false,
      
      editMode: false,
      isLoading: false,
      isSearching: false,
      
      playlistTitle: "",
      playlistDescription: "",
      playlistImage: null,
      isPublic: true,
      
      editTitle: "",
      editDescription: "",
      editImage: null,
      editIsPublic: true,
      
      showOptions: false,
      searchQuery: "",
      searchFocused: false,
      searchError: null,
      
      searchResults: [],
      searchTimer: null,
      
      audioPlayer: null,
      currentPlayingIndex: null,
      isPlaying: false,
      currentTrack: null,
      
      toast: { show: false, message: '', type: 'success', icon: 'fa fa-check', timer: null }
    }
  },

  computed: {
    totalDuration() {
      if (!this.currentPlaylist || !this.currentPlaylist.songs.length) return ""
      const totalSeconds = this.currentPlaylist.songs.reduce((acc, s) => {
        const d = s.duration
        if (!d) return acc
        if (typeof d === 'number') return acc + d
        if (typeof d === 'string' && d.includes(':')) {
          const [m, sec] = d.split(':').map(Number)
          return acc + ((m || 0) * 60 + (sec || 0))
        }
        return acc
      }, 0)
      const hours = Math.floor(totalSeconds / 3600)
      const mins = Math.floor((totalSeconds % 3600) / 60)
      return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
    }
  },

  async mounted() {
    await this.loadPlaylists()
    await this.loadFavoritas()
    this.initAudioPlayer()
  },

  beforeUnmount() {
    if (this.audioPlayer) {
      this.audioPlayer.pause()
      this.audioPlayer.src = ''
    }
  },

  methods: {
    // ===== PLAYER =====
    initAudioPlayer() {
      this.audioPlayer = new Audio()
      this.audioPlayer.addEventListener('ended', () => {
        if (this.currentPlaylist && this.currentPlayingIndex < this.currentPlaylist.songs.length - 1) {
          this.playSong(this.currentPlayingIndex + 1)
        } else {
          this.isPlaying = false
          this.currentPlayingIndex = null
        }
      })
      this.audioPlayer.addEventListener('play', () => this.isPlaying = true)
      this.audioPlayer.addEventListener('pause', () => this.isPlaying = false)
      this.audioPlayer.addEventListener('error', () => {
        this.showToast({ message: 'Erro ao reproduzir', type: 'error' })
        this.isPlaying = false
      })
    },
    
    async playSong(index) {
      if (!this.currentPlaylist?.songs[index]) return
      const song = this.currentPlaylist.songs[index]
      
      if (this.currentPlayingIndex === index && this.currentTrack?.id === song.id) {
        this.isPlaying ? this.audioPlayer.pause() : this.audioPlayer.play()
        return
      }
      
      this.audioPlayer.pause()
      this.audioPlayer.src = ''
      this.currentPlayingIndex = index
      this.currentTrack = song
      
      const previewUrl = song.preview || song.url || song.link
      if (!previewUrl) {
        this.showToast({ message: 'Preview indisponível', type: 'warning' })
        return
      }
      
      try {
        this.audioPlayer.src = previewUrl
        this.audioPlayer.volume = 0.5
        await this.audioPlayer.play()
      } catch (err) {
        this.showToast({ message: 'Erro ao reproduzir', type: 'error' })
        this.isPlaying = false
      }
    },
    
    normalizeSong(song) {
      if (!song) return null
      return {
        id: String(song._id || song.id || song.musicaId),
        title: song.title || song.nome || 'Sem título',
        artist: song.artist || (song.cantores?.map(c => c.nome).join(', ')) || 'Desconhecido',
        album: song.album || song.albuns?.[0]?.nome || 'Sem álbum',
        duration: song.duration || song.duracao || '0:00',
        cover: song.cover || song.foto || '',
        preview: song.preview || song.link || song.url || '',
        source: song.source || 'local'
      }
    },
    
    playAll() {
      if (!this.currentPlaylist?.songs.length) {
        this.showToast({ message: 'Playlist vazia', type: 'warning' })
        return
      }
      this.isPlaying ? this.audioPlayer.pause() : this.playSong(0)
    },
    
    playPlaylist(playlist) {
      this.openPlaylist(playlist)
      if (playlist.songs.length > 0) {
        this.$nextTick(() => this.playSong(0))
      }
    },
    
    // ===== NAVEGAÇÃO =====
    startCreate() {
      this.resetForm()
      this.currentView = 'create'
      this.$nextTick(() => this.$refs.titleInput?.focus())
    },
    backToList() {
      this.currentView = 'list'
      this.currentPlaylist = null
      this.editMode = false
      this.clearSearch()
      this.showOptions = false
    },
    openPlaylist(playlist) {
      this.currentPlaylist = playlist
      this.currentView = 'view'
      this.clearSearch()
      this.showOptions = false
    },
    
    // ===== CRIAÇÃO =====
    async createPlaylist() {
      if (!this.playlistTitle.trim()) return
      this.isLoading = true
      try {
        const token = localStorage.getItem("token")
        const res = await fetch('http://localhost:3002/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            nome: this.playlistTitle,
            descricao: this.playlistDescription,
            capa: this.playlistImage,
            publica: this.isPublic
          })
        })
        await res.json()
        await this.loadPlaylists()
        window.dispatchEvent(new Event('playlist-updated'))
        this.showToast({ message: 'Playlist criada!', type: 'success' })
        this.backToList()
      } catch (err) {
        this.showToast({ message: 'Erro ao criar playlist', type: 'error' })
      } finally {
        this.isLoading = false
      }
    },

    async loadPlaylists() {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://localhost:3002/playlists`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      const safeArray = Array.isArray(data) ? data : []
      const user = JSON.parse(localStorage.getItem('usuario') || '{}')

      this.playlists = safeArray.map(p => ({
        id: p._id || p.id,
        title: p.nome || p.title,
        description: p.descricao || '',
        image: p.capa || null,
        isPublic: p.publica,
        isFavorita: false,
        songs: Array.isArray(p.musicas)
          ? p.musicas.map(m => this.normalizeSong(m)).filter(Boolean)
          : [],
        authorName: user.nome || 'Você'
      }))
    },
    
    async loadFavoritas() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:3002/favoritas`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        this.favoritas = data.filter(f => f.playlist).map(f => ({ id: f.playlist._id }))
        this.playlists.forEach(p => {
          p.isFavorita = this.favoritas.some(f => f.id === p.id)
        })
      } catch (err) { console.error(err) }
    },

    cancelCreate() {
      if (this.playlistTitle.trim() || this.playlistDescription.trim() || this.playlistImage) {
        if (!confirm("Descartar alterações?")) return
      }
      this.backToList()
    },
    resetForm() {
      this.playlistTitle = ""
      this.playlistDescription = ""
      this.playlistImage = null
      this.isPublic = true
      this.editMode = false
    },
    
    // ===== EDIÇÃO =====
    startEdit() {
      this.editTitle = this.currentPlaylist.title
      this.editDescription = this.currentPlaylist.description
      this.editImage = this.currentPlaylist.image
      this.editIsPublic = this.currentPlaylist.isPublic
      this.editMode = true
      this.showOptions = false
    },
    cancelEdit() { this.editMode = false },
    
    async saveEdit() {
      if (!this.editTitle.trim()) {
        this.showToast({ message: 'Título obrigatório', type: 'warning' })
        return
      }
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:3002/playlists/${this.currentPlaylist.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            nome: this.editTitle.trim(),
            descricao: this.editDescription.trim(),
            capa: this.editImage,
            publica: this.editIsPublic
          })
        })
        const data = await res.json()
        this.currentPlaylist.title = data.nome
        this.currentPlaylist.description = data.descricao
        this.currentPlaylist.image = data.capa
        this.currentPlaylist.isPublic = data.publica
        this.editMode = false
        this.showToast({ message: 'Playlist atualizada!', type: 'success' })
      } catch (err) {
        this.showToast({ message: 'Erro ao atualizar', type: 'error' })
      }
    },
    
    // ===== IMAGEM =====
    triggerImageUpload() { this.$refs.imageInput.click() },
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (this.editMode) {
            this.editImage = e.target.result
            this.currentPlaylist.image = e.target.result
          } else {
            this.playlistImage = e.target.result
          }
        }
        reader.readAsDataURL(file)
      }
    },
// ===== BUSCA (Local + Spotify + Deezer) =====
    debouncedSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.searchMusicas(), 400)
    },
    
    async searchMusicas() {
      if (this.searchQuery.length < 2) return
      this.isSearching = true
      this.searchError = null
      this.searchResults = []

      try {
        // 1. BUSCA LOCAL
        const token = localStorage.getItem("token")
        const resLocal = await fetch(
          `http://localhost:3002/musicas/search?q=${encodeURIComponent(this.searchQuery)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const dbMusicas = await resLocal.json()
        const safeArray = Array.isArray(dbMusicas) ? dbMusicas : []

        const formattedDb = safeArray.map(m => ({
          id: m._id,
          title: m.nome,
          artist: m.cantores?.map(c => c.nome).join(', ') || 'Desconhecido',
          album: m.albuns?.[0]?.nome || 'Sem álbum',
          duration: this.formatDuration(m.duracao),
          cover: m.foto,
          preview: m.link,
          source: 'local',
          isFromDB: true
        }))

        // 2. BUSCA SPOTIFY
        let spotifyResults = []
        try {
          const resSpotify = await fetch(
            `${this.SPOTIFY_PROXY}/search?q=${encodeURIComponent(this.searchQuery)}&type=track&limit=5&market=BR`
          )
          const spotifyData = await resSpotify.json()
          if (spotifyData?.tracks?.items) {
            spotifyResults = spotifyData.tracks.items.map(track => ({
              id: track.id,
              title: track.name,
              artist: track.artists?.map(a => a.name).join(', ') || 'Desconhecido',
              album: track.album?.name || 'Sem álbum',
              duration: this.formatDuration(Math.floor((track.duration_ms || 0) / 1000)),
              cover: track.album?.images?.[2]?.url || track.album?.images?.[0]?.url || '',
              preview: track.preview_url || '',
              source: 'spotify',
              isFromDB: false
            }))
          }
        } catch (e) { console.warn('Spotify error:', e.message) }

        // 3. BUSCA DEEZER
        let deezerResults = []
        try {
          const resDeezer = await fetch(
            `${this.DEEZER_API}/search/track?q=${encodeURIComponent(this.searchQuery)}&limit=5`
          )
          const deezerData = await resDeezer.json()
          if (deezerData.data) {
            deezerResults = deezerData.data.map(track => ({
              id: track.id,
              title: track.title,
              artist: track.artist?.name || 'Desconhecido',
              album: track.album?.title || 'Sem álbum',
              duration: this.formatDuration(track.duration),
              cover: track.album?.cover_small || '',
              preview: track.preview || '',
              source: 'deezer',
              isFromDB: false
            }))
          }
        } catch (e) { console.warn('Deezer error:', e.message) }

        this.searchResults = [...formattedDb, ...spotifyResults, ...deezerResults]
      } catch (err) {
        this.searchError = 'Erro ao buscar músicas'
      } finally {
        this.isSearching = false
      }
    },
    
    formatDuration(seconds) {
      if (!seconds) return '0:00'
      if (typeof seconds === 'string' && seconds.includes(':')) return seconds
      const mins = Math.floor(Number(seconds) / 60)
      const secs = Number(seconds) % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    
    clearSearch() {
      this.searchQuery = ""
      this.searchResults = []
      this.searchError = null
    },
    
    isSongAdded(song) {
      if (!this.currentPlaylist) return false
      return this.currentPlaylist.songs.some(s => 
        String(s.id) === String(song.id) && (s.source || 'local') === (song.source || 'local')
      )
    },
    
    // ===== ADICIONAR MÚSICA =====
    async addSong(song) {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      this.showToast({ message: 'Faça login para adicionar', type: 'info' })
      return
    }

const body = { 
  source: song.source && song.source !== 'local' ? song.source : 'local'
}

    // Se for externa, envia dados completos
    if (song.source && song.source !== 'local') {
      // ✅ CORREÇÃO: Validar e converter duration corretamente
      const durationInSeconds = this.parseDuration(song.duration)
      
      body.dadosMusica = {
        titulo: song.title || 'Sem título',
        artista: song.artist || 'Desconhecido',
        capa: song.cover || '',
        previewUrl: song.preview || song.url || '',
        duration: Number.isFinite(durationInSeconds) ? durationInSeconds : 30,
        ano: song.ano || null,
        album: song.album || ''
      }
      
      // ✅ DEBUG: Verifique no console se os dados estão corretos
      console.log('Enviando música externa:', {
        musicaId: song.id,
        source: song.source,
        dadosMusica: body.dadosMusica
      })
    }

    const res = await fetch(
      `http://localhost:3002/playlists/${this.currentPlaylist.id}/musicas/${song.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }
    )

    // ✅ CORREÇÃO: Melhor tratamento de erro
    if (!res.ok) {
      let errMessage = 'Erro ao adicionar'
      try {
        const errData = await res.json()
        errMessage = errData.error || errData.message || `Erro ${res.status}`
        console.error('Erro do servidor:', errData)
      } catch (e) {
        errMessage = `Erro ${res.status}: ${res.statusText}`
      }
      throw new Error(errMessage)
    }

    await this.loadPlaylists()
    const updated = this.playlists.find(p => p.id === this.currentPlaylist.id)
    if (updated) this.currentPlaylist = updated

    window.dispatchEvent(new Event('playlist-updated'))
    this.showToast({ message: `"${song.title}" adicionada!`, type: 'success' })

  } catch (err) {
    console.error('Erro completo:', err)
    this.showToast({ message: err.message || 'Erro ao adicionar', type: 'error' })
  }
},

parseDuration(durationStr) {
  if (!durationStr) return 30
  if (typeof durationStr === 'number') {
    return Number.isFinite(durationStr) ? Math.floor(durationStr) : 30
  }
  if (typeof durationStr === 'string') {
    // Se já estiver no formato mm:ss
    if (durationStr.includes(':')) {
      const parts = durationStr.split(':').map(Number)
      if (parts.length === 2) {
        const [m, s] = parts
        if (Number.isFinite(m) && Number.isFinite(s)) {
          return (m * 60) + s
        }
      }
    }
    // Se for um número em string
    const num = parseInt(durationStr, 10)
    if (Number.isFinite(num)) return num
  }
  return 30 // fallback seguro
},
    // ===== REMOVER MÚSICA =====
    confirmRemoveSong(index) {
      this.songToRemoveIndex = index
      this.songToRemove = this.currentPlaylist.songs[index]
      this.showRemoveSongModal = true
    },
    cancelRemoveSong() {
      this.showRemoveSongModal = false
      this.songToRemove = null
      this.songToRemoveIndex = null
    },
    
    async executeRemoveSong() {
      if (this.songToRemoveIndex === null) return
      this.isRemovingSong = true
      
      try {
        const token = localStorage.getItem("token")
        const song = this.currentPlaylist.songs[this.songToRemoveIndex]

// ✅ NOVO
const idToRemove = song.externalId || song.id
        
        if (this.currentPlayingIndex === this.songToRemoveIndex) {
          this.audioPlayer.pause()
          this.audioPlayer.src = ''
          this.isPlaying = false
          this.currentPlayingIndex = null
        }

        const body = { source: song.source || 'local' }

        const res = await fetch(
         `http://localhost:3002/playlists/${this.currentPlaylist.id}/musicas/${idToRemove}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
          }
        )

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Erro ao remover')
        }

        await this.loadPlaylists()
        const updated = this.playlists.find(p => p.id === this.currentPlaylist.id)
        if (updated) this.currentPlaylist = updated

        this.showToast({ message: `"${song.title}" removida`, type: 'info' })

      } catch (err) {
        this.showToast({ message: err.message || 'Erro ao remover', type: 'error' })
      } finally {
        this.isRemovingSong = false
        this.showRemoveSongModal = false
        this.songToRemove = null
        this.songToRemoveIndex = null
      }
    },
    
    // ===== FAVORITAR =====
    async toggleFavorita() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(
          `http://localhost:3002/favoritas/${this.currentPlaylist.id}/favoritar`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ tipo: 'playlist' })
          }
        )
        const data = await res.json()
        this.currentPlaylist.isFavorita = data.favorited
        const playlist = this.playlists.find(p => p.id === this.currentPlaylist.id)
        if (playlist) playlist.isFavorita = data.favorited
        this.showToast({ message: data.favorited ? 'Favoritada ❤️' : 'Removida 💔', type: 'success' })
        window.dispatchEvent(new Event('favoritas-updated'))
      } catch (err) {
        this.showToast({ message: 'Erro ao favoritar', type: 'error' })
      }
    },
    
    // ===== DROPDOWN =====
    toggleOptions() { this.showOptions = !this.showOptions },
    closeOptions() { this.showOptions = false },
    
    sharePlaylist() {
      navigator.clipboard?.writeText(`${window.location.origin}/playlist/${this.currentPlaylist.id}`)
      this.showToast({ message: 'Link copiado!', type: 'success' })
      this.showOptions = false
    },
    
    // ===== EXCLUIR PLAYLIST =====
    confirmDeleteFromMenu() {
      this.playlistToDelete = this.currentPlaylist
      this.showDeleteModal = true
      this.showOptions = false
    },
    cancelDelete() {
      this.showDeleteModal = false
      this.playlistToDelete = null
    },
    async executeDelete() {
      try {
        const token = localStorage.getItem("token")
        await fetch(`http://localhost:3002/playlists/${this.playlistToDelete.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        this.playlists = this.playlists.filter(p => p.id !== this.playlistToDelete.id)
        this.showToast({ message: 'Playlist excluída', type: 'success' })
        window.dispatchEvent(new Event('playlist-updated'))
        this.backToList()
      } catch (err) {
        this.showToast({ message: 'Erro ao excluir', type: 'error' })
      }
    },
    
    // ===== TOAST =====
    showToast({ message, type = 'success', icon = 'fa fa-check', title = '' }) {
      if (this.toast.timer) clearTimeout(this.toast.timer)
      this.toast = { show: true, message, title, type, icon, timer: null }
      this.toast.timer = setTimeout(() => { this.toast.show = false }, 3000)
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

/* ========== CORREÇÃO DO ESPAÇO À DIREITA ========== */
.playlist-container {
   min-height: 100%;
  color: #f8fafc;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  padding: 32px;
   width: 100%;
    margin-left: 0;
  margin-top: 1px;
  box-sizing: border-box;
  position: relative;
    max-width: 100%;
  overflow-x: hidden;
 padding: 32px;
}

/* ========== MODO DE EDIÇÃO APRIMORADO ========== */

/* Indicador visual de modo edição */
.edit-mode-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  animation: pulse-edit 2s infinite;
  width: fit-content;
}

@keyframes pulse-edit {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
}

/* Container dos campos de edição */
.edit-field {
  position: relative;
  margin-bottom: 16px;
  animation: slideIn 0.3s ease;
}

.edit-field label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

/* Input de título estilizado */
.edit-title-input {
  width: 100%;
  max-width: 500px;
  font-size: 28px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(37, 99, 235, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: #f8fafc;
  transition: all 0.3s ease;
  font-family: inherit;
}

.edit-title-input:focus {
  outline: none;
  border-color: #2563eb;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15), 0 4px 20px rgba(37, 99, 235, 0.2);
  transform: translateY(-1px);
}

/* Textarea de descrição estilizada */
.edit-desc-input {
  width: 100%;
  max-width: 500px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(37, 99, 235, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: #f8fafc;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.edit-desc-input:focus {
  outline: none;
  border-color: #2563eb;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15), 0 4px 20px rgba(37, 99, 235, 0.2);
}

/* Contador de caracteres nos inputs de edição */
.edit-char-count {
  position: absolute;
  right: 12px;
  bottom: -20px;
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

/* Seção de privacidade no modo edição */
.edit-privacy-section {
  margin-top: 20px;
  animation: slideIn 0.3s ease 0.1s both;
}

.edit-privacy-section label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.edit-privacy-options {
  display: flex;
  gap: 12px;
}

.edit-privacy-options button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 10px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-privacy-options button:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.edit-privacy-options button.active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.15);
  color: #f8fafc;
}

.edit-privacy-options button i {
  font-size: 16px;
}

/* Header em modo edição */
.playlist-header.edit-mode-active {
  background: rgba(245, 158, 11, 0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(245, 158, 11, 0.1);
  transition: all 0.3s ease;
}

/* Overlay de edição na capa melhorado */
.edit-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 8px;
}

.playlist-cover:hover .edit-overlay {
  opacity: 1;
}

.edit-overlay i {
  color: white;
  font-size: 32px;
  margin-bottom: 4px;
}

.edit-overlay span {
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 500;
}

/* Botões de ação no header melhorados */
.header-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-text {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-text:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.2);
}

/* Animações */
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

/* ===== TOAST NOTIFICATION APRIMORADO ===== */
.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  font-weight: 500;
  z-index: 10000;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  min-width: 320px;
  max-width: 450px;
  animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
}

.toast-exit {
  animation: slideOutRight 0.3s ease forwards;
}

.toast.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.toast.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.toast.info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.toast-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.toast-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toast-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.toast-message {
  font-size: 15px;
  line-height: 1.4;
  opacity: 0.95;
}

.toast-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(255,255,255,0.25);
  transform: rotate(90deg);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255,255,255,0.4);
  animation: progress linear forwards;
}

@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

/* ===== MODAL DE EXCLUSÃO ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

.delete-modal {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

.song-delete-modal {
  max-width: 420px;
}

.modal-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 36px;
  color: white;
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
  animation: pulse 2s infinite;
  position: relative;
}

.modal-icon.song-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
}

.remove-icon {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 32px;
  height: 32px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  border: 3px solid #1e293b;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.delete-modal h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #f8fafc;
}

.delete-modal p {
  color: #94a3b8;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.delete-modal strong {
  color: #f8fafc;
}

.modal-warning {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: #ef4444;
}

.remove-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: #fca5a5;
  margin-bottom: 24px;
}

.song-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.song-preview-img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
}

.song-preview-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.song-preview-info strong {
  color: #f8fafc;
  font-size: 15px;
}

.song-preview-info span {
  color: #94a3b8;
  font-size: 13px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-danger {
  padding: 12px 24px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-remove-song {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

/* ===== BOTÃO VOLTAR ===== */
.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 8px 0;
  transition: color 0.3s;
}

.btn-back:hover {
  color: #f8fafc;
}

/* ===== VIEW: LISTA DE PLAYLISTS ===== */
.playlists-list-view {
  width: 100%;
  animation: fadeIn 0.5s ease;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.list-header h1 {
  font-size: 32px;
  font-weight: 700;
}

.btn-create-new {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border: none;
  border-radius: 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(37,99,235,0.3);
}

.btn-create-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(37,99,235,0.4);
}

/* Grid de Playlists */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.playlist-card {
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255,255,255,0.05);
  position: relative;
}

.playlist-card:hover {
  transform: translateY(-4px);
  background: rgba(255,255,255,0.06);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.card-cover {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.playlist-card:hover .card-cover img {
  transform: scale(1.05);
}

.cover-default {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #334155, #1e293b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #475569;
}

.cover-default.large {
  font-size: 80px;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.btn-play-card {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(37,99,235,0.4);
  transition: transform 0.2s;
}

.btn-play-card:hover {
  transform: scale(1.1);
}

.card-info {
  padding: 16px;
}

.card-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 13px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.card-meta i {
  font-size: 12px;
}

.card-desc {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
}

/* Estado Vazio da Lista */
.empty-playlists {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

.empty-illustration {
  position: relative;
  display: inline-flex;
  margin-bottom: 32px;
}

.empty-illustration i {
  font-size: 80px;
  opacity: 0.3;
  position: relative;
  z-index: 1;
}

.sound-waves {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  align-items: flex-end;
}

.sound-waves span {
  width: 4px;
  background: #2563eb;
  border-radius: 2px;
  animation: sound-wave 1s ease-in-out infinite;
}

.sound-waves span:nth-child(1) { height: 20px; animation-delay: 0s; }
.sound-waves span:nth-child(2) { height: 30px; animation-delay: 0.2s; }
.sound-waves span:nth-child(3) { height: 25px; animation-delay: 0.4s; }

@keyframes sound-wave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
}

.empty-playlists h2 {
  font-size: 24px;
  color: #f8fafc;
  margin-bottom: 8px;
}

.empty-playlists p {
  margin-bottom: 24px;
  font-size: 16px;
}

/* ===== MODO CRIAÇÃO ===== */
.create-view {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

.create-mode {
  animation: fadeIn 0.5s ease;
}

.create-header {
  text-align: center;
  margin-bottom: 40px;
}

.create-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.create-header p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.create-form {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
  align-items: flex-start;
}

/* Upload de Capa na Criação */
.cover-upload {
  flex-shrink: 0;
  width: 232px;
  height: 232px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-radius: 16px;
  border: 2px dashed #334155;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
}

.cover-upload:hover {
  border-color: #2563eb;
  transform: scale(1.02);
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.change-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-container:hover .change-overlay {
  opacity: 1;
}

.change-overlay i {
  font-size: 32px;
  color: white;
}

.change-overlay span {
  font-size: 14px;
  color: #cbd5e1;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #64748b;
}

.upload-icon {
  position: relative;
  font-size: 48px;
  opacity: 0.5;
}

.plus-badge {
  position: absolute;
  bottom: -5px;
  right: -10px;
  width: 24px;
  height: 24px;
  background: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  font-weight: bold;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
}

.upload-placeholder small {
  font-size: 12px;
  opacity: 0.7;
}

/* Campos do Formulário */
.form-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.field-group label {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-group input,
.field-group textarea {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  color: #f8fafc;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.3s;
  resize: none;
}

.field-group input:focus,
.field-group textarea:focus {
  outline: none;
  border-color: #2563eb;
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.field-group input::placeholder,
.field-group textarea::placeholder {
  color: #475569;
}

.char-count {
  position: absolute;
  right: 16px;
  bottom: 16px;
  font-size: 12px;
  color: #64748b;
}

/* Opções de Privacidade */
.privacy-options {
  display: flex;
  gap: 12px;
}

.privacy-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border: 2px solid transparent;
  border-radius: 12px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.privacy-btn:hover {
  background: rgba(255,255,255,0.06);
}

.privacy-btn.active {
  border-color: #2563eb;
  background: rgba(37,99,235,0.1);
  color: #f8fafc;
}

.privacy-btn i {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.privacy-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.privacy-info strong {
  font-size: 14px;
  font-weight: 600;
}

.privacy-info small {
  font-size: 12px;
  opacity: 0.7;
}

/* Botões de Ação na Criação */
.create-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.2);
  background: transparent;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.3);
}

.btn-primary {
  padding: 12px 32px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(37,99,235,0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(37,99,235,0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary.small {
  padding: 10px 20px;
  font-size: 13px;
}

.btn-primary.loading {
  opacity: 0.8;
}

.spinner {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== MODO VISUALIZAÇÃO ===== */
.view-mode {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

.playlist-header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  align-items: flex-end;
  position: relative;
}

.playlist-cover {
  width: 232px;
  height: 232px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 8px;
}

.playlist-type {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #2563eb;
  display: flex;
  align-items: center;
  gap: 6px;
}

.playlist-title {
  font-size: 48px;
  font-weight: 900;
  margin: 0;
  line-height: 1.1;
}

.playlist-description {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.5;
  max-width: 400px;
}

.playlist-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #94a3b8;
  flex-wrap: wrap;
}

.meta-item.author {
  color: #f8fafc;
  font-weight: 500;
}

.meta-item i {
  color: #2563eb;
}

.meta-dot {
  color: #475569;
}

/* Controles */
.playlist-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
  position: relative;
}

.btn-play-big {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(37,99,235,0.4);
  transition: all 0.3s;
}

.btn-play-big:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-play-big:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-icon:hover {
  color: #f8fafc;
  background: rgba(255,255,255,0.1);
}

.btn-icon.liked {
  color: #ec4899;
}

/* DROPDOWN CORRIGIDO */
.dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.options-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

.option-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #e2e8f0;
  transition: all 0.2s;
  white-space: nowrap;
}

.option-item:hover {
  background: rgba(255,255,255,0.05);
}

.option-item i {
  width: 16px;
  color: #94a3b8;
}

.option-item.danger:hover {
  background: rgba(239,68,68,0.1);
}

.option-item.danger i,
.option-item.danger {
  color: #ef4444;
}

.option-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: 8px 0;
}

/* Busca */
.add-songs-section {
  margin-bottom: 32px;
}

.add-songs-section h3 {
  font-size: 18px;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f8fafc;
}

.add-songs-section h3 i {
  color: #2563eb;
}

.search-box {
  position: relative;
  background: rgba(255,255,255,0.05);
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.search-box.is-focused {
  background: rgba(255,255,255,0.08);
  border-color: rgba(37,99,235,0.5);
}

.search-box.is-loading {
  border-color: rgba(37,99,235,0.3);
}

.search-box i {
  color: #64748b;
  font-size: 20px;
}

.search-box input {
  flex: 1;
  background: none;
  border: none;
  color: #f8fafc;
  font-size: 16px;
  outline: none;
}

.search-box input::placeholder {
  color: #64748b;
}

.search-spinner {
  color: #2563eb !important;
}

.clear-search {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.clear-search:hover {
  color: #f8fafc;
}

.search-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  color: #ef4444;
  font-size: 14px;
}

/* Resultados */
.search-results {
  background: rgba(15,23,42,0.8);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  margin-bottom: 32px;
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: background 0.2s;
}

.result-item:hover {
  background: rgba(255,255,255,0.03);
}

.result-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-title {
  font-size: 15px;
  color: #f8fafc;
  font-weight: 500;
}

.result-artist {
  font-size: 13px;
  color: #94a3b8;
}

.result-duration {
  font-size: 13px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.btn-add {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(37,99,235,0.2);
  border: none;
  color: #2563eb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-add:hover:not(:disabled) {
  background: rgba(37,99,235,0.3);
  transform: scale(1.1);
}

.btn-add:disabled {
  background: rgba(34,197,94,0.2);
  color: #22c55e;
  cursor: default;
}

/* Lista de Músicas */
.songs-section {
  margin-bottom: 48px;
}

.songs-header {
  display: grid;
  grid-template-columns: 50px 2fr 1fr 80px 50px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.song-item {
  display: grid;
  grid-template-columns: 50px 2fr 1fr 80px 50px;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
}

.song-item:hover {
  background: rgba(255,255,255,0.05);
}

.song-item.playing {
  background: rgba(37,99,235,0.1);
  border-left: 3px solid #2563eb;
}

.song-number {
  color: #64748b;
  text-align: center;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.song-number i {
  color: #2563eb;
}

.animate-pulse {
  animation: pulse-icon 1.5s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.song-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.song-title img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.song-title div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-title .active {
  color: #2563eb;
}

.song-title small {
  color: #94a3b8;
  font-size: 13px;
}

.song-album {
  color: #94a3b8;
  font-size: 14px;
}

.song-duration {
  color: #94a3b8;
  font-size: 14px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.btn-remove {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.song-item:hover .btn-remove {
  opacity: 1;
}

.btn-remove:hover {
  color: #ef4444;
  background: rgba(239,68,68,0.1);
}

/* Estado Vazio */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
}

.empty-icon {
  position: relative;
  display: inline-flex;
  margin-bottom: 24px;
}

.empty-icon i {
  font-size: 64px;
  opacity: 0.3;
  position: relative;
  z-index: 1;
}

.pulse-ring {
  position: absolute;
  inset: -20px;
  border: 2px solid #2563eb;
  border-radius: 50%;
  opacity: 0;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}

.empty-state h3 {
  font-size: 20px;
  color: #f8fafc;
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* Animações */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== RESPONSIVO ========== */
@media (max-width: 1024px) {
  .playlist-container {
    width: 100%;
    margin-left: 0; /* Remove margem em telas menores */
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .playlist-container {
    padding: 16px;
    width: 100%;
  }

  .create-form {
    flex-direction: column;
    align-items: center;
  }

  .cover-upload {
    width: 180px;
    height: 180px;
  }

  .playlist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .playlist-cover {
    width: 200px;
    height: 200px;
  }

  .playlist-title {
    font-size: 32px;
  }

  .header-actions { 
    position: static;
    margin-top: 16px;
    width: 100%;
    justify-content: center;
  }

  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .songs-header,
  .song-item {
    grid-template-columns: 40px 2fr 60px 40px;
  }

  .song-album {
    display: none;
  }
  
  .toast {
    left: 16px;
    right: 16px;
    bottom: 16px;
    min-width: auto;
  }

  .delete-modal {
    padding: 32px 24px;
  }

  .modal-icon {
    width: 64px;
    height: 64px;
    font-size: 28px;
  }
  
  .options-dropdown {
    left: auto;
    right: 0;
  }

  /* Ajustes para modo edição em mobile */
  .edit-title-input {
    font-size: 22px;
    max-width: 100%;
  }

  .edit-desc-input {
    max-width: 100%;
  }

  .edit-privacy-options {
    justify-content: center;
  }
}
</style>