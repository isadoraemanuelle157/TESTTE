<template>
  <!-- Modal de Confirmação de Exclusão -->
<<Transition name="modal-scale">
  <div v-if="showDeleteModal" class="delete-modal-overlay" @click.self="cancelDelete">
    <div class="delete-modal">
      <div class="delete-modal-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </div>
      <h3 class="delete-modal-title">Excluir Conversa</h3>
      <p class="delete-modal-text">
        Tem certeza que deseja excluir <strong>"{{ deleteTargetTitle }}"</strong>?
      </p>
      <p class="delete-modal-warning">Esta ação não pode ser desfeita.</p>
      <div class="delete-modal-actions">
        <button class="btn-cancel" @click="cancelDelete">
          <span>Cancelar</span>
        </button>
        <button class="btn-confirm-delete" @click="confirmDelete">
          <span v-if="!isDeleting">Excluir</span>
          <span v-else class="delete-spinner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  </div>
</Transition>
  <div class="app-container">
    <!-- Background Animado -->
    <div class="gradient-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- Overlay de Login Obrigatório -->
    <Transition name="fade">
      <div v-if="showLoginOverlay" class="login-overlay" @click.self="showLoginOverlay = false">
        <div class="login-modal">
          <div class="login-icon">🔒</div>
          <h2>Limite Atingido</h2>
          <p>Você usou {{ chatLimit.used }} de {{ chatLimit.limit }} mensagens gratuitas.</p>
          <p class="login-sub">Faça login para continuar usando o chat ilimitado!</p>
          <div class="login-actions">
            <button class="btn-login" @click="redirectToLogin">
              Fazer Login
            </button>
            <button class="btn-register" @click="redirectToRegister">
              Criar Conta
            </button>
          </div>
          <button class="btn-close" @click="showLoginOverlay = false">✕</button>
        </div>
      </div>
    </Transition>

    <!-- Modal do Player Expandido -->
    <Transition name="fade">
      <div v-if="showFullPlayer" class="full-player-overlay" @click.self="showFullPlayer = false">
        <div class="full-player">
          <button class="close-full-player" @click="showFullPlayer = false">✕</button>
          <div class="full-player-content">
            <div class="full-cover" :style="{ background: currentTrack?.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
              <span class="full-cover-emoji">{{ currentTrack?.emoji || '🎵' }}</span>
              <img v-if="currentTrack?.cover" :src="currentTrack.cover" :alt="currentTrack.title" class="full-cover-img" @error="handleImgError">
            </div>
            <div class="full-track-info">
              <h2>{{ currentTrack?.title || 'Selecione uma música' }}</h2>
              <p>{{ currentTrack?.artist || 'Assistente Musical' }}</p>
            </div>
            <div class="full-progress">
              <span class="time-current">{{ formatDuration(currentTime) }}</span>
              <div class="progress-bar" @click="seekTo($event)">
                <div class="progress-fill" :style="{ width: (duration ? (currentTime / duration * 100) : 0) + '%' }"></div>
                <div class="progress-handle" :style="{ left: (duration ? (currentTime / duration * 100) : 0) + '%' }"></div>
              </div>
              <span class="time-duration">{{ formatDuration(duration) }}</span>
            </div>
            <div class="full-controls">
              <button @click="prevTrack" :disabled="!canPrev">⏮</button>
              <button class="main-control" @click="togglePlay">
                {{ isPlaying ? '⏸' : '▶️' }}
              </button>
              <button @click="nextTrack" :disabled="!canNext">⏭</button>
            </div>
            <div class="full-volume">
              <span>🔊</span>
              <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="updateVolume">
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Layout Principal -->
    <div class="main-layout">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="logo">
          <div class="logo-icon">🎵</div>
          <h1>MusicAI</h1>
          <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
            {{ sidebarCollapsed ? '→' : '←' }}
          </button>
        </div>

        <!-- Botão Novo Chat -->
        <button v-if="isAuthenticated" class="new-chat-btn" @click="createNewChat">
          <span>➕</span>
          <span class="new-chat-label">Novo Chat</span>
        </button>

        <nav class="nav-menu">
          <div
            v-for="item in navItems"
            :key="item.id"
            class="nav-item"
            :class="{ active: activeNav === item.id }"
            @click="handleNavClick(item)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            <span v-if="item.id === 'favorites' && favorites.size > 0" class="nav-badge">{{ favorites.size }}</span>
          </div>
        </nav>

        <!-- Seção de Chats Salvos -->
        <div v-if="isAuthenticated && savedChats.length > 0" class="chats-section">
          <h3>Conversas</h3>
          <div class="chats-list">
            <div
              v-for="chat in savedChats"
              :key="chat.id"
              class="chat-item"
              :class="{ active: currentChatId === chat.id }"
              @click="loadChat(chat.id)"
            >
              <span class="chat-icon">💬</span>
              <div class="chat-info">
                <span class="chat-title">{{ chat.title }}</span>
                <span class="chat-date">{{ formatDate(chat.updatedAt) }}</span>
              </div>
              <button class="chat-delete" @click.stop="openDeleteModal(chat.id)" title="Excluir conversa">🗑️</button>
            </div>
          </div>
        </div>

        <div class="genre-section">
          <h3>Gêneros Populares</h3>
          <div class="genre-tags">
            <span
              v-for="genre in availableGenres"
              :key="genre"
              class="genre-tag"
              :class="{ active: selectedGenre === genre }"
              @click="selectGenre(genre)"
            >
              {{ genre }}
            </span>
          </div>
        </div>

        <!-- Widget de Limite -->
        <div v-if="!isAuthenticated" class="limit-widget">
          <div class="limit-header">
            <span class="limit-label">Mensagens Grátis</span>
            <span class="limit-badge" :class="{ warning: chatLimit.remaining <= 2, danger: chatLimit.remaining === 0 }">
              {{ chatLimit.remaining }}/{{ chatLimit.limit }}
            </span>
          </div>
          <div class="limit-bar">
            <div class="limit-progress" :style="{ width: (chatLimit.used / chatLimit.limit * 100) + '%' }"></div>
          </div>
          <p v-if="chatLimit.remaining === 0" class="limit-text danger">
            Faça login para continuar!
          </p>
        </div>

        <!-- Playlist Atual -->
        <div v-if="currentPlaylist.length > 0" class="playlist-widget">
          <div class="playlist-header">
            <span class="playlist-label">Fila de Reprodução</span>
            <span class="playlist-count">{{ currentPlaylist.length }} músicas</span>
          </div>
          <div class="playlist-tracks">
            <div
              v-for="(track, index) in currentPlaylist.slice(0, 5)"
              :key="track.id"
              class="playlist-track"
              :class="{ active: currentTrack?.id === track.id }"
              @click="playTrackAtIndex(index)"
            >
              <span class="pl-number">{{ index + 1 }}</span>
              <span class="pl-title">{{ track.title }}</span>
              <span class="pl-artist">{{ track.artist }}</span>
            </div>
            <div v-if="currentPlaylist.length > 5" class="playlist-more">
              +{{ currentPlaylist.length - 5 }} mais...
            </div>
          </div>
        </div>

        <!-- Mini Now Playing -->
        <div class="now-playing" v-if="currentTrack" @click="showFullPlayer = true">
          <div class="np-header">
            <span class="np-label">Tocando Agora</span>
            <div class="np-wave" v-if="isPlaying">
              <span v-for="i in 4" :key="i" class="wave-bar"></span>
            </div>
          </div>
          <div class="np-track">
            <div class="np-cover">
              <img v-if="currentTrack.cover" :src="currentTrack.cover" :alt="currentTrack.title" @error="handleImgError">
              <div v-else class="cover-placeholder-mini" :style="{ background: currentTrack.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
                <span>{{ currentTrack.emoji || currentTrack.title?.charAt(0) || '🎵' }}</span>
              </div>
            </div>
            <div class="np-info">
              <h4>{{ currentTrack.title }}</h4>
              <p>{{ currentTrack.artist }}</p>
            </div>
          </div>
          <div class="np-controls">
            <button @click.stop="prevTrack">⏮</button>
            <button class="play-pause" @click.stop="togglePlay">
              {{ isPlaying ? '⏸' : '▶️' }}
            </button>
            <button @click.stop="nextTrack">⏭</button>
          </div>
          <div class="np-progress-mini">
            <div class="np-progress-bar">
              <div class="np-progress-fill" :style="{ width: (duration ? (currentTime / duration * 100) : 0) + '%' }"></div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Área do Chat -->
      <main class="chat-wrapper">
        <!-- Header -->
        <header class="chat-header">
          <div class="header-info">
            <div class="ai-avatar">
              <span>🤖</span>
              <div class="status-indicator" :class="{ offline: !isOnline }"></div>
            </div>
            <div class="header-text">
              <h2>Assistente Musical</h2>
              <p>{{ isTyping ? 'Digitando...' : isOnline ? (isAuthenticated ? 'Online • Pronto para ajudar' : `Online • ${chatLimit.remaining} mensagens restantes`) : 'Offline' }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="icon-btn" @click="clearChat" title="Limpar conversa">🗑️</button>
            <button class="icon-btn" @click="showSettings = !showSettings" title="Configurações">⚙️</button>
            <button v-if="!isAuthenticated" class="icon-btn login-btn" @click="redirectToLogin" title="Login">👤</button>
            <button v-else class="icon-btn logout-btn" @click="logout" title="Sair">🚪</button>
          </div>
        </header>

        <!-- Settings Panel -->
        <Transition name="slide-down">
          <div v-if="showSettings" class="settings-panel">
            <div class="setting-item">
              <span>Modo Escuro</span>
              <button class="toggle-btn active">🌙</button>
            </div>
            <div class="setting-item">
              <span>Notificações</span>
              <button class="toggle-btn active">🔔</button>
            </div>
            <div class="setting-item">
              <span>Qualidade do Áudio</span>
              <select v-model="audioQuality">
                <option value="low">Econômica</option>
                <option value="medium">Padrão</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
        </Transition>

        <!-- Mensagens -->
        <div class="chat-container" ref="chatContainer">
          <TransitionGroup name="message">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-wrapper"
              :class="message.type"
            >
              <div class="message-bubble">
                <div class="message-avatar" v-if="message.type === 'ai'">
                  <span>🎵</span>
                </div>
                <div v-else class="message-avatar user-avatar">
                  <span>{{ userInitials }}</span>
                </div>
               
                <div class="message-content">
                  <p class="message-text" v-html="formatMessage(message.content)"></p>
                 
                  <!-- Card de Resultados de Letra -->
                  <div v-if="message.lyricResults && message.lyricResults.length > 0" class="lyric-results-card">
                    <div class="lyric-header">
                      <span class="lyric-badge">🔍 Resultados da busca</span>
                      <span class="lyric-query">"{{ message.lyricQuery }}"</span>
                    </div>
                    <div class="lyric-songs">
                      <div
                        v-for="(song, index) in message.lyricResults"
                        :key="song.id"
                        class="lyric-song-item"
                        @click="playTrackFromLyrics(song)"
                      >
                        <div class="lyric-number">{{ index + 1 }}</div>
                        <div class="lyric-cover">
                          <img v-if="song.albumArt" :src="song.albumArt" :alt="song.title" @error="handleImgError">
                          <div v-else class="cover-placeholder" :style="{ background: getRandomGradient(index) }">
                            <span>{{ song.title?.charAt(0) || '🎵' }}</span>
                          </div>
                        </div>
                        <div class="lyric-meta">
                          <h4>{{ song.title }}</h4>
                          <p>{{ song.artist }}</p>
                          <div v-if="song.lyrics" class="lyric-preview">
                            "{{ song.lyrics.substring(0, 80) }}..."
                          </div>
                        </div>
                        <button class="lyric-play-btn" @click.stop="playTrackFromLyrics(song)">▶️</button>
                      </div>
                    </div>
                  </div>
                 
                  <!-- Card de Recomendações -->
                  <div v-if="message.recommendations" class="recommendations-card">
                    <div class="rec-header">
                      <div class="rec-title">
                        <span class="rec-genre">{{ message.recommendations.genre }}</span>
                        <span class="rec-badge">{{ message.recommendations.tracks.length }} músicas</span>
                      </div>
                      <button
                        class="play-all-btn"
                        @click="playAll(message.recommendations.tracks)"
                      >
                        ▶️ Tocar todas
                      </button>
                    </div>
                   
                    <div class="tracks-list">
                      <div
                        v-for="(track, index) in message.recommendations.tracks"
                        :key="track.id"
                        class="track-item"
                        :class="{ playing: currentTrack?.id === track.id && isPlaying }"
                        @click="playTrack(track)"
                      >
                        <div class="track-number">
                          <span v-if="currentTrack?.id === track.id && isPlaying">🎵</span>
                          <span v-else>{{ index + 1 }}</span>
                        </div>
                        <div class="track-cover">
                          <img v-if="track.cover" :src="track.cover" class="cover-art-img" @error="handleImgError">
                          <div v-else class="cover-art" :style="{ background: track.color }">
                            <span>{{ track.emoji }}</span>
                          </div>
                          <div class="play-overlay">
                            <span>{{ currentTrack?.id === track.id && isPlaying ? '⏸' : '▶️' }}</span>
                          </div>
                        </div>
                        <div class="track-meta">
                          <h4>{{ track.title }}</h4>
                          <p>{{ track.artist }} <span v-if="track.album">• {{ track.album }}</span></p>
                        </div>
                        <div class="track-actions">
                          <span class="duration">{{ track.duration }}</span>
                          <button
                            class="action-btn"
                            @click.stop="toggleFavorite(track)"
                            :class="{ active: isFavorite(track) }"
                          >
                            {{ isFavorite(track) ? '❤️' : '🤍' }}
                          </button>
                          <button class="action-btn" @click.stop="addToPlaylist(track)">
                            ➕
                          </button>
                        </div>
                      </div>
                    </div>
                   
                    <div class="artists-section" v-if="message.recommendations.artists && message.recommendations.artists.length">
                      <p class="section-title">Artistas relacionados</p>
                      <div class="artists-chips">
                        <span
                          v-for="artist in message.recommendations.artists"
                          :key="artist"
                          class="artist-chip"
                          @click="askAboutArtist(artist)"
                        >
                          {{ artist }}
                        </span>
                      </div>
                    </div>

                    <div class="albums-section" v-if="message.recommendations.albums && message.recommendations.albums.length">
                      <p class="section-title">Álbuns recomendados</p>
                      <div class="albums-grid">
                        <div
                          v-for="album in message.recommendations.albums"
                          :key="album.name"
                          class="album-card"
                          @click="askAboutAlbum(album)"
                        >
                          <div class="album-cover" :style="{ background: album.color }">
                            <span>{{ album.emoji }}</span>
                          </div>
                          <div class="album-info">
                            <h4>{{ album.name }}</h4>
                            <p>{{ album.artist }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                 
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <!-- Indicador de Digitação -->
          <div v-if="isTyping" class="typing-wrapper">
            <div class="typing-bubble">
              <div class="typing-dots">
                <span v-for="i in 3" :key="i"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Perguntas Rápidas -->
        <div class="quick-questions" v-if="showQuickQuestions">
          <p class="quick-label">Comece por aqui:</p>
          <div class="quick-chips">
            <button
              v-for="question in quickQuestions"
              :key="question.text"
              class="quick-chip"
              @click="handleQuickQuestion(question)"
            >
              <span class="chip-icon">{{ question.icon }}</span>
              <span>{{ question.text }}</span>
            </button>
          </div>
        </div>

        <!-- Área de Input -->
        <div class="input-wrapper">
          <div v-if="!isAuthenticated && chatLimit.remaining === 0" class="input-blocked">
            <p>🔒 Limite de mensagens atingido. <button @click="redirectToLogin">Faça login</button> para continuar.</p>
          </div>
          <div v-else class="input-container">
            <button class="input-action" title="Anexar" @click="showAttachMenu = !showAttachMenu">📎</button>
            <input
              v-model="inputMessage"
              @keyup.enter="sendMessage"
              type="text"
              :placeholder="getPlaceholder()"
              class="message-input"
              ref="inputRef"
              :disabled="isTyping || (!isAuthenticated && chatLimit.remaining === 0)"
            />
            <button
              v-if="inputMessage"
              class="input-action clear"
              @click="inputMessage = ''"
              title="Limpar"
            >✕</button>
            <button
              class="send-btn"
              :class="{ active: canSend, loading: isTyping }"
              @click="sendMessage"
              :disabled="!canSend || isTyping || (!isAuthenticated && chatLimit.remaining === 0)"
            >
              <span v-if="!isTyping">➤</span>
              <span v-else class="spinner">⟳</span>
            </button>
          </div>
          <p class="input-hint">
            <span class="hint-tag" @click="inputMessage = 'quem canta '" title="Buscar artista">🎤 Artista</span>
            <span class="hint-tag" @click="inputMessage = 'letra de '" title="Buscar letra">📝 Letra</span>
            <span class="hint-tag" @click="inputMessage = 'álbum '" title="Buscar álbum">💿 Álbum</span>
            <span class="hint-tag" @click="inputMessage = 'quando lançou '" title="Data de lançamento">📅 Lançamento</span>
            <span class="hint-tag" @click="inputMessage = 'curiosidade '" title="Curiosidades">💡 Curiosidade</span>
            <span class="hint-tag" @click="inputMessage = 'pop'">Pop</span>
            <span class="hint-tag" @click="inputMessage = 'rock'">Rock</span>
          </p>
        </div>
      </main>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- Audio Element -->
    <audio
      ref="audioPlayer"
      :src="currentTrack?.url"
      @timeupdate="onTimeUpdate"
      @ended="onTrackEnded"
      @loadedmetadata="onLoadedMetadata"
      @error="onAudioError"
    ></audio>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

// ============ ESTADO REATIVO ============
const messages = ref([
  {
    id: Date.now(),
    type: 'ai',
    content: `Olá! 🎵 Sou seu assistente musical pessoal. Posso te ajudar com:\n\n• **Encontrar músicas** por trecho de letra\n• **Descobrir artistas** e suas histórias\n• **Buscar álbuns** e discografias\n• **Dúvidas sobre músicas**: quem canta, quando lançou, curiosidades\n• **Recomendações** por gênero ou humor\n• **Criar playlists** personalizadas\n\nMe pergunte qualquer coisa sobre música! 🎧`,
    timestamp: new Date(),
    recommendations: null,
    lyricResults: null
  }
])
const inputMessage = ref('')
const isTyping = ref(false)
const chatContainer = ref(null)
const inputRef = ref(null)
const activeNav = ref('chat')
const selectedGenre = ref(null)
const toast = ref({ show: false, message: '', type: 'info' })
const isAuthenticated = ref(false)
const chatLimit = ref({ limit: 5, used: 0, remaining: 5 })
const showLoginOverlay = ref(false)
const showFullPlayer = ref(false)
const showSettings = ref(false)
const sidebarCollapsed = ref(false)
const isOnline = ref(true)
const audioQuality = ref('medium')
const showAttachMenu = ref(false)
const showDeleteModal = ref(false)
const deleteTargetId = ref(null)
const deleteTargetTitle = ref('')
const isDeleting = ref(false)

// Chat History
const savedChats = ref([])
const currentChatId = ref(null)

// Player State
const audioPlayer = ref(null)
const currentTrack = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const currentPlaylist = ref([])
const currentTrackIndex = ref(-1)
const favorites = ref(new Set())

// User
const userName = ref('')

// ============ DADOS ============
const navItems = [
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'library', icon: '📚', label: 'Biblioteca' },
  { id: 'favorites', icon: '❤️', label: 'Favoritos' },
  { id: 'playlists', icon: '🎧', label: 'Playlists' },
  { id: 'history', icon: '🕐', label: 'Histórico' }
]

const availableGenres = ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'Eletrônica', 'Indie', 'R&B', 'Clássica']

const quickQuestions = [
  { icon: '🎸', text: 'Rock clássico dos anos 80', genre: 'rock', mood: 'nostalgic', type: 'genre' },
  { icon: '🎤', text: 'Pop atual para festa', genre: 'pop', mood: 'happy', type: 'genre' },
  { icon: '🎹', text: 'Eletrônica para treinar', genre: 'electronic', mood: 'workout', type: 'genre' },
  { icon: '🎺', text: 'Jazz suave para relaxar', genre: 'jazz', mood: 'relax', type: 'genre' },
  { icon: '🎧', text: 'Hip-hop moderno', genre: 'hiphop', mood: 'focus', type: 'genre' },
  { icon: '🌙', text: 'Indie para estudar', genre: 'indie', mood: 'study', type: 'genre' },
  { icon: '❤️', text: 'Músicas românticas', genre: 'rnb', mood: 'romantic', type: 'genre' },
  { icon: '🎻', text: 'Clássica tranquila', genre: 'classical', mood: 'calm', type: 'genre' }
]

const genreSearchMap = {
  'rock': 'rock', 'pop': 'pop', 'jazz': 'jazz', 'hip hop': 'hip hop',
  'hiphop': 'hip hop', 'rap': 'hip hop', 'eletrônica': 'electronic',
  'eletronica': 'electronic', 'electronic': 'electronic', 'indie': 'indie',
  'r&b': 'rnb', 'rnb': 'rnb', 'clássica': 'classical', 'classica': 'classical',
  'classical': 'classical'
}

const intentPatterns = {
  artistInfo: [
    'quem canta', 'quem é', 'quem fez', 'quem compôs', 'quem produziu',
    'artista', 'cantor', 'cantora', 'banda', 'grupo musical',
    'biografia', 'história de', 'sobre o artista', 'sobre a banda',
    'quem é o vocalista', 'quem toca', 'membros da banda',
    'quando começou', 'carreira de', 'discografia de'
  ],
  lyricsInfo: [
    'letra de', 'letra da', 'letras de', 'letras da',
    'trecho de', 'parte de', 'verso de', 'refrão de',
    'significado da letra', 'significado da música',
    'o que significa', 'qual o significado',
    'traduzir', 'tradução de', 'tradução da'
  ],
  albumInfo: [
    'álbum de', 'album de', 'álbum da', 'album da',
    'disco de', 'disco da', 'lp de', 'ep de',
    'discografia', 'discografia completa',
    'quando lançou o álbum', 'data de lançamento',
    'primeiro álbum', 'último álbum', 'novo álbum'
  ],
  releaseInfo: [
    'quando lançou', 'quando foi lançado', 'data de lançamento',
    'ano de', 'em que ano', 'quando surgiu',
    'quando estreou', 'quando começou', 'quando foi gravado',
    'lançamento de', 'estreia de'
  ],
  trivia: [
    'curiosidade', 'curiosidades', 'sabia que', 'você sabia',
    'fato sobre', 'fatos sobre', 'história por trás',
    'inspiração de', 'inspiração para', 'por que escreveu',
    'como surgiu', 'origem de', 'como nasceu',
    'backstage', 'making of', 'processo criativo'
  ],
  similar: [
    'parecido com', 'similar a', 'igual a', 'mesmo estilo',
    'quem soa como', 'artistas parecidos', 'bandas parecidas',
    'músicas parecidas', 'se gosto de', 'se curto',
    'recomendação baseada em', 'mais como', 'outros como'
  ],
  genre: [
    'gênero', 'genero', 'estilo', 'tipo de música',
    'pop', 'rock', 'jazz', 'hip hop', 'eletrônica', 'indie', 'r&b', 'clássica',
    'sertanejo', 'funk', 'samba', 'pagode', 'mpb', 'gospel',
    'para festa', 'para treinar', 'para relaxar', 'para estudar',
    'para dormir', 'para namorar', 'para dirigir', 'para chorar',
    'animado', 'triste', 'calmo', 'romântico', 'energético'
  ],
  trackSearch: [
    'música', 'musica', 'som', 'song', 'track',
    'tocar', 'ouvir', 'quero ouvir', 'queria ouvir',
    'me toca', 'me põe', 'me poe', 'coloca'
  ]
}

// ============ COMPUTED ============
const canSend = computed(() => inputMessage.value.trim().length > 0)
const showQuickQuestions = computed(() => messages.value.length < 3)
const userInitials = computed(() => {
  if (userName.value) return userName.value.charAt(0).toUpperCase()
  return 'U'
})
const canPrev = computed(() => currentTrackIndex.value > 0)
const canNext = computed(() => currentTrackIndex.value < currentPlaylist.value.length - 1)

// ============ CHAT HISTORY ============
function loadSavedChats() {
  if (!isAuthenticated.value) {
    savedChats.value = []
    return
  }
  const stored = localStorage.getItem('musicai_chats')
  if (stored) {
    try {
      savedChats.value = JSON.parse(stored)
    } catch (e) {
      savedChats.value = []
    }
  }
}

function saveChats() {
  if (!isAuthenticated.value) return
  localStorage.setItem('musicai_chats', JSON.stringify(savedChats.value))
}

function createNewChat() {
  if (isAuthenticated.value && messages.value.length > 1) {
    saveCurrentChat()
  }
  currentChatId.value = null
  messages.value = [{
    id: Date.now(),
    type: 'ai',
    content: `Olá! 🎵 Sou seu assistente musical pessoal. Posso te ajudar com:\n\n• **Encontrar músicas** por trecho de letra\n• **Descobrir artistas** e suas histórias\n• **Buscar álbuns** e discografias\n• **Dúvidas sobre músicas**: quem canta, quando lançou, curiosidades\n• **Recomendações** por gênero ou humor\n• **Criar playlists** personalizadas\n\nMe pergunte qualquer coisa sobre música! 🎧`,
    timestamp: new Date(),
    recommendations: null,
    lyricResults: null
  }]
  showToastFn('Novo chat iniciado!', 'success')
  nextTick(() => inputRef.value?.focus())
}

function saveCurrentChat() {
  if (!isAuthenticated.value || messages.value.length <= 1) return
  const title = messages.value.find(m => m.type === 'user')?.content?.substring(0, 30) + '...' || 'Nova conversa'
  if (currentChatId.value) {
    const index = savedChats.value.findIndex(c => c.id === currentChatId.value)
    if (index > -1) {
      savedChats.value[index] = {
        ...savedChats.value[index],
        messages: [...messages.value],
        title,
        updatedAt: new Date().toISOString()
      }
    }
  } else {
    const newChat = {
      id: Date.now().toString(),
      title,
      messages: [...messages.value],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    savedChats.value.unshift(newChat)
    currentChatId.value = newChat.id
  }
  saveChats()
}

function loadChat(chatId) {
  const chat = savedChats.value.find(c => c.id === chatId)
  if (!chat) return
  if (currentChatId.value && currentChatId.value !== chatId) {
    saveCurrentChat()
  }
  currentChatId.value = chatId
  messages.value = [...chat.messages]
  showToastFn('Conversa carregada', 'success')
  nextTick(() => scrollToBottom())
}

const openDeleteModal = (chatId) => {
  const chat = savedChats.value.find(c => c.id === chatId)
  if (!chat) return
  deleteTargetId.value = chatId
  deleteTargetTitle.value = chat.title || 'Nova conversa'
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteTargetId.value = null
  deleteTargetTitle.value = ''
  isDeleting.value = false
}

const confirmDelete = async () => {
  if (!deleteTargetId.value || isDeleting.value) return

  isDeleting.value = true
  await new Promise(resolve => setTimeout(resolve, 400))

  savedChats.value = savedChats.value.filter(c => c.id !== deleteTargetId.value)
  saveChats()

  if (currentChatId.value === deleteTargetId.value) {
    currentChatId.value = null
    createNewChat()
  }

  showToastFn('Conversa excluída', 'info')
  cancelDelete()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return 'Agora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ============ API - BUSCA REAL DEEZER/SPOTIFY ============
async function searchRealMusic(query, type = 'track', limit = 6) {
  try {
    const token = localStorage.getItem('token')
    const isLogged = !!token
    if (isLogged) {
      return await searchSpotify(query, type, limit)
    } else {
      return await searchDeezer(query, type, limit)
    }
  } catch (error) {
    console.error('Erro na busca de músicas:', error)
    return []
  }
}

async function searchDeezer(query, type = 'track', limit = 6) {
  try {
    const response = await fetch(
      `${API_URL}/deezer/search?q=${encodeURIComponent(query)}&limit=${limit}`
    )
    if (!response.ok) throw new Error(`Deezer error: ${response.status}`)
    const data = await response.json()
    if (!data.data || !Array.isArray(data.data)) return []
    return data.data.map((item, index) => convertDeezerToTrack(item, index))
  } catch (error) {
    console.warn('Deezer search failed:', error.message)
    return []
  }
}

async function searchSpotify(query, type = 'track', limit = 6) {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(
      `${API_URL}/spotify/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}&market=BR`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    )
    if (!response.ok) {
      if (response.status === 401) {
        return await searchDeezer(query, type, limit)
      }
      throw new Error(`Spotify error: ${response.status}`)
    }
    const data = await response.json()
    let items = []
    if (type.includes('track') && data.tracks?.items) {
      items = data.tracks.items
    } else if (type === 'artist' && data.artists?.items) {
      items = data.artists.items
    } else if (type === 'album' && data.albums?.items) {
      items = data.albums.items
    }
    return items.map((item, index) => convertSpotifyToTrack(item, index))
  } catch (error) {
    console.warn('Spotify search failed, fallback to Deezer:', error.message)
    return await searchDeezer(query, type, limit)
  }
}

function convertDeezerToTrack(item, index = 0) {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ]
  return {
    id: `deezer_${item.id}`,
    title: item.title || 'Música Desconhecida',
    artist: item.artist?.name || 'Artista Desconhecido',
    album: item.album?.title || '',
    duration: formatDurationFromSeconds(item.duration),
    emoji: getEmojiForGenre(item.artist?.name) || '🎵',
    color: gradients[index % gradients.length],
    cover: item.album?.cover_medium || item.album?.cover || '',
    url: item.preview || '',
    source: 'deezer',
    externalId: item.id,
    releaseDate: item.release_date || '',
    rank: item.rank || 0
  }
}

function convertSpotifyToTrack(item, index = 0) {
  const gradients = [
    'linear-gradient(135deg, #1db954 0%, #1ed760 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
  ]
  const durationMs = item.duration_ms || 0
  const mins = Math.floor(durationMs / 60000)
  const secs = Math.floor((durationMs % 60000) / 1000)
  const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`
  return {
    id: `spotify_${item.id}`,
    title: item.name || 'Música Desconhecida',
    artist: item.artists?.map(a => a.name).join(', ') || 'Artista Desconhecido',
    album: item.album?.name || '',
    duration: durationStr,
    emoji: getEmojiForGenre(item.artists?.[0]?.name) || '🎵',
    color: gradients[index % gradients.length],
    cover: item.album?.images?.[0]?.url || '',
    url: item.preview_url || '',
    source: 'spotify',
    externalId: item.id,
    releaseDate: item.album?.release_date || '',
    popularity: item.popularity || 0
  }
}

async function searchRelatedArtists(query, limit = 6) {
  try {
    const tracks = await searchRealMusic(query, 'track', limit)
    const artistsMap = new Map()
    tracks.forEach(track => {
      if (!artistsMap.has(track.artist)) {
        artistsMap.set(track.artist, { name: track.artist, cover: track.cover })
      }
    })
    return Array.from(artistsMap.values()).slice(0, 6)
  } catch (error) {
    return []
  }
}

async function searchRelatedAlbums(query, limit = 3) {
  try {
    const albums = await searchRealMusic(query, 'album', limit)
    return albums.map(album => ({
      name: album.title || album.album,
      artist: album.artist,
      emoji: '💿',
      color: album.color
    }))
  } catch (error) {
    return []
  }
}

// ============ DETECÇÃO DE INTENÇÃO ============
function detectIntent(text) {
  const lower = text.toLowerCase()
  for (const [intent, keywords] of Object.entries(intentPatterns)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return { intent, keyword, originalText: text }
      }
    }
  }
  const genre = detectGenre(text)
  if (genre) {
    return { intent: 'genre', genre, originalText: text }
  }
  return { intent: 'general', originalText: text }
}

function detectGenre(text) {
  const lowerText = text.toLowerCase()
  for (const [genreKey, searchTerm] of Object.entries(genreSearchMap)) {
    if (lowerText.includes(genreKey) || lowerText.includes(searchTerm)) return searchTerm
  }
  const moodMap = {
    'feliz': 'pop', 'animado': 'pop', 'alegre': 'pop', 'festa': 'pop', 'dançar': 'pop', 'balada': 'pop',
    'triste': 'indie', 'melancolico': 'indie', 'nostalgico': 'rock', 'saudade': 'indie', 'depressivo': 'indie',
    'relaxar': 'jazz', 'calmo': 'jazz', 'tranquilo': 'classical', 'meditar': 'classical', 'dormir': 'classical',
    'treinar': 'electronic', 'academia': 'electronic', 'corrida': 'electronic', 'energia': 'electronic', 'malhar': 'electronic',
    'focar': 'classical', 'estudar': 'jazz', 'concentrar': 'classical', 'trabalhar': 'electronic',
    'romantico': 'rnb', 'namorar': 'rnb', 'amor': 'rnb', 'paixao': 'rnb', 'casamento': 'classical',
    'dirigir': 'rock', 'viagem': 'rock', 'estrada': 'rock', 'carro': 'rock',
    'cansado': 'indie', 'descansar': 'jazz', 'domingo': 'jazz', 'chuva': 'indie'
  }
  for (const [mood, genre] of Object.entries(moodMap)) {
    if (lowerText.includes(mood)) return genre
  }
  return null
}

function isLyricSearch(text) {
  const lower = text.toLowerCase()
  const lyricKeywords = ['letra', 'lyrics', 'trecho', 'diz que', 'fala que', 'música que', 'song that', 'lyrics that', 'canta que', 'versos']
  return lyricKeywords.some(kw => lower.includes(kw))
}

function extractSearchQuery(text, intent) {
  let query = text
  const removePatterns = {
    artistInfo: ['quem canta', 'quem é', 'quem fez', 'quem compôs', 'quem produziu', 'artista', 'cantor', 'cantora', 'banda', 'grupo musical', 'biografia', 'história de', 'sobre o artista', 'sobre a banda', 'quem é o vocalista', 'quem toca', 'membros da banda', 'quando começou', 'carreira de', 'discografia de'],
    lyricsInfo: ['letra de', 'letra da', 'letras de', 'letras da', 'trecho de', 'parte de', 'verso de', 'refrão de', 'significado da letra', 'significado da música', 'o que significa', 'qual o significado', 'traduzir', 'tradução de', 'tradução da'],
    albumInfo: ['álbum de', 'album de', 'álbum da', 'album da', 'disco de', 'disco da', 'lp de', 'ep de', 'discografia', 'discografia completa', 'quando lançou o álbum', 'data de lançamento', 'primeiro álbum', 'último álbum', 'novo álbum'],
    releaseInfo: ['quando lançou', 'quando foi lançado', 'data de lançamento', 'ano de', 'em que ano', 'quando surgiu', 'quando estreou', 'quando começou', 'quando foi gravado', 'lançamento de', 'estreia de'],
    trivia: ['curiosidade', 'curiosidades', 'sabia que', 'você sabia', 'fato sobre', 'fatos sobre', 'história por trás', 'inspiração de', 'inspiração para', 'por que escreveu', 'como surgiu', 'origem de', 'como nasceu', 'backstage', 'making of', 'processo criativo'],
    similar: ['parecido com', 'similar a', 'igual a', 'mesmo estilo', 'quem soa como', 'artistas parecidos', 'bandas parecidas', 'músicas parecidas', 'se gosto de', 'se curto', 'recomendação baseada em', 'mais como', 'outros como'],
    trackSearch: ['música', 'musica', 'som', 'song', 'track', 'tocar', 'ouvir', 'quero ouvir', 'queria ouvir', 'me toca', 'me põe', 'me poe', 'coloca']
  }
  const patterns = removePatterns[intent] || []
  for (const pattern of patterns) {
    query = query.replace(new RegExp(pattern, 'gi'), '')
  }
  return query.trim() || text
}

// ============ RESPOSTAS INTELIGENTES ============
async function generateSmartResponse(userText, intentData) {
  const { intent, originalText } = intentData
  const searchQuery = extractSearchQuery(originalText, intent)
  switch (intent) {
    case 'artistInfo': return await generateArtistResponse(searchQuery)
    case 'lyricsInfo': return await generateLyricsResponse(searchQuery)
    case 'albumInfo': return await generateAlbumResponse(searchQuery)
    case 'releaseInfo': return await generateReleaseResponse(searchQuery)
    case 'trivia': return await generateTriviaResponse(searchQuery)
    case 'similar': return await generateSimilarResponse(searchQuery)
    case 'genre': return await generateGenreResponse(searchQuery, intentData.genre)
    case 'trackSearch': return await generateTrackSearchResponse(searchQuery)
    default: return await generateGeneralResponse(searchQuery)
  }
}

async function generateArtistResponse(query) {
  const tracks = await searchRealMusic(query, 'track', 5)
  const artistTracks = tracks.filter(t =>
    t.artist.toLowerCase().includes(query.toLowerCase()) ||
    query.toLowerCase().includes(t.artist.toLowerCase())
  )
  if (artistTracks.length > 0) {
    const artist = artistTracks[0].artist
    const allTracks = await searchRealMusic(artist, 'track', 8)
    const albums = await searchRelatedAlbums(artist, 4)
    const responses = [
      `**${artist}** é um artista incrível! 🎤 Aqui estão algumas informações e músicas dele(a):`,
      `Descobrindo **${artist}**! 🌟 Veja o que encontrei sobre esse talento:`,
      `**${artist}** tem uma discografia fantástica! 🎵 Confira:`
    ]
    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      recommendations: {
        genre: artist,
        tracks: allTracks.slice(0, 6),
        artists: [],
        albums: albums,
        description: `Músicas e informações sobre ${artist}`
      },
      lyricResults: null
    }
  }
  const generalTracks = await searchRealMusic(query, 'track', 6)
  if (generalTracks.length > 0) {
    return {
      content: `Encontrei artistas relacionados a **"${query}"**. Aqui estão as principais músicas: 🎧`,
      recommendations: {
        genre: 'Resultados da busca',
        tracks: generalTracks,
        artists: generalTracks.map(t => t.artist).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5),
        albums: [],
        description: `Resultados para: ${query}`
      },
      lyricResults: null
    }
  }
  return {
    content: `Não encontrei informações específicas sobre **"${query}"**. Tente me perguntar de outra forma, como:\n\n• "Quem canta [nome da música]"\n• "Músicas de [nome do artista]"\n• "Álbuns de [artista]"\n• Ou simplesmente diga um gênero que gosta! 🎵`,
    recommendations: null,
    lyricResults: null
  }
}

async function generateLyricsResponse(query) {
  const tracks = await searchRealMusic(query, 'track', 6)
  if (tracks.length > 0) {
    return {
      content: `Aqui estão músicas relacionadas a **"${query}"**! 📝 Se você está procurando a letra completa, posso te ajudar a encontrar a música certa para ouvir:`,
      recommendations: {
        genre: 'Letras e Músicas',
        tracks: tracks,
        artists: tracks.map(t => t.artist).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
        albums: [],
        description: `Músicas relacionadas a: ${query}`
      },
      lyricResults: null
    }
  }
  return {
    content: `Não encontrei músicas com **"${query}"** no título. Tente:\n\n• Digitar trechos mais longos da letra\n• Buscar pelo nome do artista\n• Ou perguntar por gênero musical 🎵`,
    recommendations: null,
    lyricResults: null
  }
}

async function generateAlbumResponse(query) {
  const tracks = await searchRealMusic(query, 'track', 8)
  const albums = await searchRelatedAlbums(query, 6)
  if (tracks.length > 0 || albums.length > 0) {
    const artistName = tracks[0]?.artist || query
    return {
      content: `**${artistName}** tem uma discografia incrível! 💿 Aqui estão álbuns e músicas encontrados:`,
      recommendations: {
        genre: `Discografia: ${artistName}`,
        tracks: tracks.slice(0, 6),
        artists: [artistName],
        albums: albums.length > 0 ? albums : tracks.slice(0, 4).map(t => ({
          name: t.album || 'Álbum Desconhecido',
          artist: t.artist,
          emoji: '💿',
          color: t.color
        })),
        description: `Álbuns e músicas de ${artistName}`
      },
      lyricResults: null
    }
  }
  return {
    content: `Não encontrei álbuns de **"${query}"**. Tente:\n\n• "Álbuns de [nome do artista]"\n• "Discografia de [artista]"\n• Ou busque pelo artista diretamente 🎵`,
    recommendations: null,
    lyricResults: null
  }
}

async function generateReleaseResponse(query) {
  const tracks = await searchRealMusic(query, 'track', 5)
  if (tracks.length > 0) {
    const track = tracks[0]
    const releaseYear = track.releaseDate ? track.releaseDate.split('-')[0] : 'ano desconhecido'
    return {
      content: `**${track.title}** de **${track.artist}** foi lançada em **${releaseYear}**! 📅\n\nAqui estão mais informações e músicas relacionadas:`,
      recommendations: {
        genre: `Lançamentos: ${track.artist}`,
        tracks: tracks.slice(0, 6),
        artists: [track.artist],
        albums: [],
        description: `Músicas de ${track.artist} incluindo ${track.title}`
      },
      lyricResults: null
    }
  }
  return {
    content: `Não encontrei informações de lançamento para **"${query}"**. Tente me perguntar sobre o artista ou música específica! 🎵`,
    recommendations: null,
    lyricResults: null
  }
}

async function generateTriviaResponse(query) {
  const tracks = await searchRealMusic(query, 'track', 6)
  if (tracks.length > 0) {
    const track = tracks[0]
    const trivias = [
      `**${track.title}** de **${track.artist}** é um clássico! 💡 Aqui estão mais músicas desse artista para você explorar:`,
      `**${track.artist}** é conhecido por hits incríveis como **${track.title}**! 🌟 Confira mais:`,
      `A música **${track.title}** faz parte do repertório de **${track.artist}**! 🎵 Veja mais curiosidades musicais:`
    ]
    return {
      content: trivias[Math.floor(Math.random() * trivias.length)],
      recommendations: {
        genre: `Curiosidades: ${track.artist}`,
        tracks: tracks,
        artists: [track.artist],
        albums: [],
        description: `Músicas e fatos sobre ${track.artist}`
      },
      lyricResults: null
    }
  }
  return {
    content: `Não encontrei curiosidades sobre **"${query}"**. Tente perguntar sobre um artista ou música específica! 💡`,
    recommendations: null,
    lyricResults: null
  }
}

async function generateSimilarResponse(query) {
  const tracks = await searchRealMusic(query, 'track', 6)
  if (tracks.length > 0) {
    const baseArtist = tracks[0].artist
    const genre = detectGenre(baseArtist) || 'pop'
    const similarTracks = await searchRealMusic(genre, 'track', 6)
    const filteredSimilar = similarTracks.filter(t =>
      !t.artist.toLowerCase().includes(baseArtist.toLowerCase())
    )
    const allResults = [...tracks.slice(0, 3), ...filteredSimilar.slice(0, 3)]
    return {
      content: `Se você gosta de **${baseArtist}**, vai adorar essas recomendações! 🎧 Artistas e músicas no mesmo estilo:`,
      recommendations: {
        genre: `Similares a: ${baseArtist}`,
        tracks: allResults,
        artists: allResults.map(t => t.artist).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5),
        albums: [],
        description: `Músicas similares a ${baseArtist}`
      },
      lyricResults: null
    }
  }
  return {
    content: `Não encontrei artistas similares a **"${query}"**. Tente me dizer um artista ou música que você gosta! 🎵`,
    recommendations: null,
    lyricResults: null
  }
}

async function generateGenreResponse(searchQuery, genre) {
  const tracks = await searchRealMusic(genre || searchQuery, 'track', 6)
  const artists = await searchRelatedArtists(genre || searchQuery, 6)
  const albums = await searchRelatedAlbums(genre || searchQuery, 3)
  let finalTracks = tracks
  if (finalTracks.length === 0) {
    finalTracks = await searchRealMusic(searchQuery, 'track', 6)
  }
  if (finalTracks.length === 0) {
    return {
      content: `Não consegui encontrar músicas de **${genre || searchQuery}** no momento. O serviço de música pode estar indisponível. Tente novamente mais tarde ou me diga outro gênero/artista! 🎵`,
      recommendations: null,
      lyricResults: null
    }
  }
  const responses = [
    `Baseado no seu pedido, encontrei essas músicas de **${genre || searchQuery}**! 🎶`,
    `Aqui está uma seleção especial de **${genre || searchQuery}** para você:`,
    `Encontrei essas gems de **${genre || searchQuery}** que combinam com você!`,
    `Perfeito! Essas tracks de **${genre || searchQuery}** vão te surpreender:`,
    `Selecionei os melhores hits de **${genre || searchQuery}** para você aproveitar:`
  ]
  return {
    content: responses[Math.floor(Math.random() * responses.length)],
    recommendations: {
      genre: (genre || searchQuery).charAt(0).toUpperCase() + (genre || searchQuery).slice(1),
      tracks: finalTracks,
      artists: artists.map(a => a.name).filter(Boolean),
      albums: albums,
      description: `Músicas reais de ${genre || searchQuery} do catálogo mundial`
    },
    lyricResults: null
  }
}

async function generateTrackSearchResponse(query) {
  const tracks = await searchRealMusic(query, 'track', 6)
  if (tracks.length > 0) {
    return {
      content: `Encontrei essas músicas para **"${query}"**! 🎵 Clique para ouvir:`,
      recommendations: {
        genre: `Busca: ${query}`,
        tracks: tracks,
        artists: tracks.map(t => t.artist).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5),
        albums: [],
        description: `Resultados para: ${query}`
      },
      lyricResults: null
    }
  }
  return {
    content: `Não encontrei músicas para **"${query}"**. Tente:\n\n• Digitar o nome exato da música\n• Buscar pelo artista\n• Ou perguntar por gênero musical 🎧`,
    recommendations: null,
    lyricResults: null
  }
}

async function generateGeneralResponse(query) {
  const artistTracks = await searchRealMusic(query, 'track', 4)
  if (artistTracks.length > 0) {
    const artists = [...new Set(artistTracks.map(t => t.artist))]
    return {
      content: `Encontrei resultados para **"${query}"**! 🎵 Aqui estão músicas e artistas relacionados:`,
      recommendations: {
        genre: `Resultados: ${query}`,
        tracks: artistTracks,
        artists: artists.slice(0, 5),
        albums: [],
        description: `Resultados da busca por ${query}`
      },
      lyricResults: null
    }
  }
    return {
    content: `Posso te ajudar de várias formas! 🎧\n\n• **Dúvidas**: "Quem canta [música]?", "Quando lançou [álbum]?"\n• **Letras**: "Letra de [música]"\n• **Artistas**: "Biografia de [artista]"\n• **Curiosidades**: "Curiosidade sobre [música]"\n• **Gêneros**: "Quero ouvir [gênero]"\n\nComo posso te ajudar? 🎵`,
    recommendations: null,
    lyricResults: null
  }
}

// ============ MÉTODOS ============
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const showToastFn = (message, type = 'info') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const checkAuth = () => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  isAuthenticated.value = !!token
  if (user) {
    try {
      const userData = JSON.parse(user)
      userName.value = userData.name || userData.email?.split('@')[0] || ''
    } catch (e) {
      userName.value = ''
    }
  }
  loadSavedChats()
}

const fetchChatLimit = async () => {
  try {
    const stored = localStorage.getItem('chatLimit')
    if (stored) {
      chatLimit.value = JSON.parse(stored)
    } else {
      chatLimit.value = { limit: 5, used: 0, remaining: 5 }
    }
  } catch (error) {
    chatLimit.value = { limit: 5, used: 0, remaining: 5 }
  }
}

const saveChatLimit = () => {
  localStorage.setItem('chatLimit', JSON.stringify(chatLimit.value))
}

const searchByLyrics = async (query) => {
  try {
    const tracks = await searchRealMusic(query, 'track', 5)
    const results = tracks
      .filter(t => t.url && t.url.length > 0)
      .map((track, index) => ({
        id: track.externalId || index,
        title: track.title,
        artist: track.artist,
        lyrics: `Trecho encontrado em "${track.title}"`,
        albumArt: track.cover,
        url: track.url
      }))
    if (results.length === 0) {
      const broaderTracks = await searchRealMusic(query.split(' ').slice(0, 3).join(' '), 'track', 5)
      return broaderTracks.map((track, index) => ({
        id: track.externalId || index,
        title: track.title,
        artist: track.artist,
        lyrics: `Resultado relacionado à busca`,
        albumArt: track.cover,
        url: track.url
      }))
    }
    return results
  } catch (error) {
    return []
  }
}

const getEmojiForGenre = (genreOrArtist) => {
  const text = (genreOrArtist || '').toLowerCase()
  const emojiMap = {
    'rock': '🎸', 'pop': '🎤', 'jazz': '🎺', 'hip hop': '🎧', 'rap': '🎤',
    'eletrônica': '🎹', 'electronic': '🎹', 'indie': '🌙', 'r&b': '❤️',
    'rnb': '❤️', 'clássica': '🎻', 'classical': '🎻', 'sertanejo': '🤠',
    'funk': '🔥', 'samba': '🥁', 'pagode': '🪕', 'mpb': '🎵', 'gospel': '✝️'
  }
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (text.includes(key)) return emoji
  }
  return '🎵'
}

const formatDurationFromSeconds = (seconds) => {
  if (!seconds) return '3:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const sendMessage = async () => {
  if (!canSend.value || isTyping.value) return
  if (!isAuthenticated.value && chatLimit.value.remaining <= 0) {
    showLoginOverlay.value = true
    return
  }
  const userText = inputMessage.value.trim()
  inputMessage.value = ''
  messages.value.push({
    id: Date.now(),
    type: 'user',
    content: userText,
    timestamp: new Date(),
    recommendations: null,
    lyricResults: null
  })
  await scrollToBottom()
  if (!isAuthenticated.value) {
    chatLimit.value.used++
    chatLimit.value.remaining = Math.max(0, chatLimit.value.limit - chatLimit.value.used)
    saveChatLimit()
  }
  isTyping.value = true
  await scrollToBottom()
  const intentData = detectIntent(userText)
  const isLyricQuery = isLyricSearch(userText)
  setTimeout(async () => {
    isTyping.value = false
    let response
    if (isLyricQuery) {
      const lyricResults = await searchByLyrics(userText)
      if (lyricResults.length > 0) {
        response = {
          content: `Encontrei **${lyricResults.length}** música(s) com trechos relacionados à sua busca:`,
          recommendations: null,
          lyricResults: lyricResults,
          lyricQuery: userText
        }
      } else {
        response = {
          content: `Não encontrei músicas com esse trecho exato. Tente digitar palavras-chave diferentes ou me diga o **artista/gênero** que lembra. 🎵\n\nVocê pode tentar buscar por:\n• Nome do artista\n• Gênero musical\n• Humor (feliz, triste, relaxante)`,
          recommendations: null,
          lyricResults: null
        }
      }
    } else {
      response = await generateSmartResponse(userText, intentData)
    }
    messages.value.push({
      id: Date.now() + 1,
      type: 'ai',
      content: response.content,
      timestamp: new Date(),
      recommendations: response.recommendations,
      lyricResults: response.lyricResults,
      lyricQuery: response.lyricQuery
    })
    if (!isAuthenticated.value && chatLimit.value.remaining === 0) {
      setTimeout(() => {
        showLoginOverlay.value = true
      }, 2000)
    }
    // Auto-save chat after each message for logged users
    if (isAuthenticated.value) {
      saveCurrentChat()
    }
    await scrollToBottom()
  }, 1500 + Math.random() * 1000)
}

const handleQuickQuestion = (question) => {
  inputMessage.value = question.text
  selectedGenre.value = question.genre
  sendMessage()
}

const selectGenre = (genre) => {
  inputMessage.value = `Quero ouvir ${genre}`
  selectedGenre.value = genre.toLowerCase()
  sendMessage()
}

const handleNavClick = (item) => {
  activeNav.value = item.id
  if (item.id === 'favorites') {
    showFavorites()
  } else if (item.id === 'library') {
    showLibrary()
  } else if (item.id === 'history') {
    showHistory()
  } else if (item.id === 'playlists') {
    showPlaylists()
  }
}

const showFavorites = async () => {
  const savedFavs = JSON.parse(localStorage.getItem('favorites_data') || '[]')
  const favTracks = Array.from(favorites.value).map(id => {
    return savedFavs.find(f => f.id === id)
  }).filter(Boolean)
  if (favTracks.length > 0) {
    messages.value.push({
      id: Date.now(),
      type: 'ai',
      content: `Aqui estão suas **${favTracks.length}** músicas favoritas: ❤️`,
      timestamp: new Date(),
      recommendations: {
        genre: 'Favoritos',
        tracks: favTracks,
        artists: [],
        albums: []
      }
    })
  } else {
    messages.value.push({
      id: Date.now(),
      type: 'ai',
      content: 'Você ainda não tem músicas favoritas. Clique no coração ❤️ nas músicas para adicioná-las aqui!',
      timestamp: new Date(),
      recommendations: null
    })
  }
  scrollToBottom()
}

const showLibrary = async () => {
  const allTracks = await searchRealMusic('popular', 'track', 8)
  messages.value.push({
    id: Date.now(),
    type: 'ai',
    content: `Sua biblioteca contém **${allTracks.length}** músicas populares do catálogo:`,
    timestamp: new Date(),
    recommendations: {
      genre: 'Biblioteca',
      tracks: allTracks,
      artists: [],
      albums: []
    }
  })
  scrollToBottom()
}

const showHistory = () => {
  messages.value.push({
    id: Date.now(),
    type: 'ai',
    content: '🕐 **Histórico de reprodução**\n\nAqui você verá todas as músicas que já tocou. Continue explorando para preencher seu histórico!',
    timestamp: new Date(),
    recommendations: null
  })
  scrollToBottom()
}

const showPlaylists = () => {
  messages.value.push({
    id: Date.now(),
    type: 'ai',
    content: '🎧 **Suas Playlists**\n\nVocê pode criar playlists personalizadas adicionando músicas pelo botão ➕. Comece a explorar músicas para criar sua primeira playlist!',
    timestamp: new Date(),
    recommendations: null
  })
  scrollToBottom()
}

// ═══════════════════════════════════════════════════════
// PLAYER DE MÚSICA FUNCIONAL
// ═══════════════════════════════════════════════════════
const playTrack = (track) => {
  if (!track || !track.url) {
    showToastFn('Música não disponível no momento', 'error')
    return
  }
  if (currentTrack.value?.id === track.id) {
    togglePlay()
    return
  }
  currentTrack.value = track
  const existingIndex = currentPlaylist.value.findIndex(t => t.id === track.id)
  if (existingIndex === -1) {
    currentPlaylist.value.push(track)
    currentTrackIndex.value = currentPlaylist.value.length - 1
  } else {
    currentTrackIndex.value = existingIndex
  }
  nextTick(() => {
    if (audioPlayer.value) {
      audioPlayer.value.src = track.url
      audioPlayer.value.volume = volume.value
      audioPlayer.value.play()
        .then(() => {
          isPlaying.value = true
          showToastFn(`Tocando: ${track.title} - ${track.artist}`, 'success')
        })
        .catch(err => {
          console.error('Erro ao tocar:', err)
          showToastFn('Erro ao reproduzir música', 'error')
        })
    }
  })
}

const playTrackAtIndex = (index) => {
  if (index >= 0 && index < currentPlaylist.value.length) {
    currentTrackIndex.value = index
    playTrack(currentPlaylist.value[index])
  }
}

const playTrackFromLyrics = (song) => {
  const track = {
    id: `lyric_${song.id}`,
    title: song.title,
    artist: song.artist,
    cover: song.albumArt || '',
    duration: '3:30',
    emoji: '🎵',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    url: song.url || '',
    source: 'deezer'
  }
  playTrack(track)
}

const playAll = (tracks) => {
  if (!tracks || tracks.length === 0) return
  currentPlaylist.value = [...tracks]
  currentTrackIndex.value = 0
  playTrack(tracks[0])
  showToastFn(`Playlist iniciada com ${tracks.length} músicas`, 'success')
}

const togglePlay = () => {
  if (!audioPlayer.value || !currentTrack.value) {
    showToastFn('Selecione uma música primeiro', 'info')
    return
  }
  if (isPlaying.value) {
    audioPlayer.value.pause()
    isPlaying.value = false
  } else {
    audioPlayer.value.play()
      .then(() => {
        isPlaying.value = true
      })
      .catch(err => {
        console.error('Erro ao tocar:', err)
        showToastFn('Erro ao reproduzir', 'error')
      })
  }
}

const prevTrack = () => {
  if (currentTrackIndex.value > 0) {
    currentTrackIndex.value--
    playTrack(currentPlaylist.value[currentTrackIndex.value])
  } else {
    if (currentPlaylist.value.length > 0) {
      currentTrackIndex.value = currentPlaylist.value.length - 1
      playTrack(currentPlaylist.value[currentTrackIndex.value])
    }
  }
}

const nextTrack = () => {
  if (currentTrackIndex.value < currentPlaylist.value.length - 1) {
    currentTrackIndex.value++
    playTrack(currentPlaylist.value[currentTrackIndex.value])
  } else {
    if (currentPlaylist.value.length > 0) {
      currentTrackIndex.value = 0
      playTrack(currentPlaylist.value[0])
    }
  }
}

const onTimeUpdate = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
  }
}

const onLoadedMetadata = () => {
  if (audioPlayer.value) {
    duration.value = audioPlayer.value.duration || 0
  }
}

const onTrackEnded = () => {
  isPlaying.value = false
  nextTrack()
}

const onAudioError = (e) => {
  console.error('Erro de áudio:', e)
  showToastFn('Erro ao carregar áudio. Tente outra música.', 'error')
  isPlaying.value = false
}

const seekTo = (event) => {
  if (!audioPlayer.value || !duration.value) return
  const rect = event.currentTarget.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * duration.value
  audioPlayer.value.currentTime = newTime
  currentTime.value = newTime
}

const updateVolume = () => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value
  }
}

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const openFullPlayer = () => {
  if (currentTrack.value) {
    showFullPlayer.value = true
  }
}

// ═══════════════════════════════════════════════════════
// UTILITÁRIOS E FAVORITOS
// ═══════════════════════════════════════════════════════
const toggleFavorite = (track) => {
  if (!track || !track.id) return
  if (favorites.value.has(track.id)) {
    favorites.value.delete(track.id)
    showToastFn('Removido dos favoritos', 'info')
  } else {
    favorites.value.add(track.id)
    showToastFn('Adicionado aos favoritos ❤️', 'success')
  }
  const savedFavs = JSON.parse(localStorage.getItem('favorites_data') || '[]')
  const existingIndex = savedFavs.findIndex(f => f.id === track.id)
  if (favorites.value.has(track.id)) {
    if (existingIndex === -1) {
      savedFavs.push(track)
    }
  } else {
    if (existingIndex > -1) {
      savedFavs.splice(existingIndex, 1)
    }
  }
  localStorage.setItem('favorites_data', JSON.stringify(savedFavs))
  localStorage.setItem('favorites', JSON.stringify(Array.from(favorites.value)))
}

const isFavorite = (track) => {
  if (!track || !track.id) return false
  return favorites.value.has(track.id)
}

const addToPlaylist = (track) => {
  if (!currentPlaylist.value.find(t => t.id === track.id)) {
    currentPlaylist.value.push(track)
    showToastFn(`"${track.title}" adicionada à fila`, 'success')
  } else {
    showToastFn(`"${track.title}" já está na fila`, 'info')
  }
}

const askAboutArtist = (artist) => {
  inputMessage.value = `Me fale mais sobre ${artist}`
  sendMessage()
}

const askAboutAlbum = (album) => {
  inputMessage.value = `Quero ouvir o álbum ${album.name} do ${album.artist}`
  sendMessage()
}

const clearChat = () => {
  if (confirm('Deseja limpar toda a conversa?')) {
    messages.value = [{
      id: Date.now(),
      type: 'ai',
      content: 'Conversa limpa! 🎵 Como posso te ajudar agora?',
      timestamp: new Date(),
      recommendations: null,
      lyricResults: null
    }]
    currentChatId.value = null
    showToastFn('Chat limpo com sucesso', 'success')
  }
}

const formatMessage = (text) => {
  if (!text) return ''
  let formatted = text
    .replace(/(^|\s)\*\*(.+?)\*\*(?=\s|$)/g, '$1<strong>$2</strong>')
    .replace(/(^|\s)\*(.+?)\*(?=\s|$)/g, '$1<em>$2</em>')
  return formatted.split(String.fromCharCode(10)).join('<br>')
}

const formatTime = (date) => {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const getPlaceholder = () => {
  if (!isAuthenticated.value && chatLimit.value.remaining === 0) {
    return '🔒 Faça login para continuar...'
  }
  return 'Pergunte sobre artistas, músicas, álbuns, letras, curiosidades...'
}

const getRandomGradient = (index) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
  ]
  return gradients[index % gradients.length]
}

const handleImgError = (e) => {
  e.target.style.display = 'none'
  if (e.target.parentElement) {
    e.target.parentElement.classList.add('img-error')
  }
}

const redirectToLogin = () => {
  showLoginOverlay.value = false
  router.push('/login')
}

const redirectToRegister = () => {
  showLoginOverlay.value = false
  router.push('/register')
}

const logout = () => {
  // Save current chat before logout
  if (isAuthenticated.value && messages.value.length > 1) {
    saveCurrentChat()
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  userName.value = ''
  savedChats.value = []
  currentChatId.value = null
  showToastFn('Logout realizado com sucesso', 'success')
  setTimeout(() => {
    window.location.reload()
  }, 1000)
}

// ============ LIFECYCLE ============
onMounted(() => {
  checkAuth()
  fetchChatLimit()
  scrollToBottom()
  inputRef.value?.focus()
  const savedFavorites = localStorage.getItem('favorites')
  if (savedFavorites) {
    try {
      favorites.value = new Set(JSON.parse(savedFavorites))
    } catch (e) {
      console.warn('Erro ao carregar favoritos:', e)
    }
  }
  isOnline.value = navigator.onLine
  window.addEventListener('online', () => { isOnline.value = true })
  window.addEventListener('offline', () => { isOnline.value = false })
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault()
      togglePlay()
    }
    if (e.code === 'ArrowRight' && e.ctrlKey) {
      nextTrack()
    }
    if (e.code === 'ArrowLeft' && e.ctrlKey) {
      prevTrack()
    }
  })
  // Auto-save chat periodically
  setInterval(() => {
    if (isAuthenticated.value && messages.value.length > 1) {
      saveCurrentChat()
    }
  }, 30000)
})

onBeforeUnmount(() => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
  // Save chat before unmount
  if (isAuthenticated.value && messages.value.length > 1) {
    saveCurrentChat()
  }
})

watch(messages, () => {
  scrollToBottom()
}, { deep: true })
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --primary-dark: #4f46e5;
  --secondary: #ec4899;
  --accent: #06b6d4;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --bg-dark: #0f0f1a;
  --bg-card: rgba(255, 255, 255, 0.05);
  --bg-glass: rgba(255, 255, 255, 0.08);
  --bg-glass-hover: rgba(255, 255, 255, 0.12);
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --border: rgba(255, 255, 255, 0.1);
  --shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.5);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-dark);
  color: var(--text-primary);
  overflow: hidden;
  line-height: 1.6;
}

.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Login Overlay */
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-modal {
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  max-width: 420px;
  width: 90%;
  position: relative;
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-lg);
}

.login-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.login-modal h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.login-modal p {
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.login-sub {
  color: var(--primary-light);
  font-weight: 500;
}

.login-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}

.btn-login, .btn-register {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 15px;
}

.btn-login {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.btn-register {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-register:hover {
  background: var(--bg-glass-hover);
}

.btn-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

/* Full Player Overlay */
.full-player-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.full-player {
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 32px;
  padding: 48px;
  max-width: 500px;
  width: 90%;
  position: relative;
  backdrop-filter: blur(20px);
}

.close-full-player {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-full-player:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

.full-player-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.full-cover {
  width: 280px;
  height: 280px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.full-cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.full-cover-emoji {
  position: relative;
  z-index: 1;
}

.full-track-info {
  text-align: center;
}

.full-track-info h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.full-track-info p {
  font-size: 16px;
  color: var(--text-secondary);
}

.full-progress {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-current, .time-duration {
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-card);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 3px;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

.full-controls {
  display: flex;
  align-items: center;
  gap: 24px;
}

.full-controls button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
}

.full-controls button:hover:not(:disabled) {
  color: var(--text-primary);
  transform: scale(1.1);
}

.full-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.full-controls .main-control {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  color: white;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.full-controls .main-control:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(99, 102, 241, 0.6);
}

.full-volume {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.full-volume span {
  font-size: 20px;
}

.full-volume input[type="range"] {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-card);
  border-radius: 3px;
  outline: none;
}

.full-volume input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Background Animado */
.gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float 20s infinite ease-in-out;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #ec4899, #f43f5e);
  bottom: -100px;
  left: -100px;
  animation-delay: -7s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #06b6d4, #14b8a6);
  top: 50%;
  left: 30%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Layout Principal */
.main-layout {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100vh;
  backdrop-filter: blur(10px);
}

/* Sidebar */
.sidebar {
  width: 300px;
  background: var(--bg-glass);
  border-right: 1px solid var(--border);
  padding: 24px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
  overflow-y: auto;
  transition: width 0.3s ease;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-collapsed .nav-label,
.sidebar-collapsed .genre-section,
.sidebar-collapsed .limit-widget,
.sidebar-collapsed .playlist-widget,
.sidebar-collapsed .now-playing .np-info,
.sidebar-collapsed .now-playing .np-controls,
.sidebar-collapsed .now-playing .np-progress-mini,
.sidebar-collapsed .chats-section,
.sidebar-collapsed .new-chat-label {
  display: none;
}

.sidebar-collapsed .logo h1 {
  display: none;
}

.sidebar-collapsed .new-chat-btn {
  padding: 12px;
  justify-content: center;
}

.sidebar-collapsed .chat-item .chat-info,
.sidebar-collapsed .chat-item .chat-delete {
  display: none;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  position: relative;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 4px 30px rgba(99, 102, 241, 0.6); }
}

.logo h1 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff, var(--primary-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar-toggle {
  position: absolute;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  background: var(--primary);
  color: white;
}

/* Novo Chat Button */
.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.new-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5);
}

.new-chat-btn span:first-child {
  font-size: 18px;
}

/* Nav Menu */
.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary);
  font-weight: 500;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-card);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2));
  color: var(--text-primary);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.nav-icon {
  font-size: 20px;
}

.nav-badge {
  margin-left: auto;
  background: var(--secondary);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

/* Chats Section */
.chats-section {
  margin-bottom: 24px;
}

.chats-section h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  margin-bottom: 12px;
  font-weight: 600;
}

.chats-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-card);
  border: 1px solid transparent;
  position: relative;
}

.chat-item:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border);
}

.chat-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2));
  border-color: rgba(99, 102, 241, 0.3);
}

.chat-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-date {
  font-size: 11px;
  color: var(--text-muted);
}

.chat-delete {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.3s ease;
}

.chat-item:hover .chat-delete {
  opacity: 1;
}

.chat-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

/* Genre Section */
.genre-section h3 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  margin-bottom: 16px;
  font-weight: 600;
}

.genre-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-tag {
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: capitalize;
  font-weight: 500;
}

.genre-tag:hover, .genre-tag.active {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

/* Limit Widget */
.limit-widget {
  margin-top: 16px;
  margin-bottom: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}

.limit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.limit-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.limit-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  background: var(--bg-glass);
  color: var(--success);
  transition: all 0.3s ease;
}

.limit-badge.warning {
  color: var(--warning);
  background: rgba(245, 158, 11, 0.2);
}

.limit-badge.danger {
  color: var(--error);
  background: rgba(239, 68, 68, 0.2);
}

.limit-bar {
  height: 6px;
  background: var(--bg-glass);
  border-radius: 3px;
  overflow: hidden;
}

.limit-progress {
  height: 100%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.limit-text {
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}

.limit-text.danger {
  color: var(--error);
  font-weight: 600;
}

/* Playlist Widget */
.playlist-widget {
  margin-top: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.playlist-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 600;
}

.playlist-count {
  font-size: 11px;
  color: var(--primary-light);
  font-weight: 600;
}

.playlist-tracks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-track {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
}

.playlist-track:hover {
  background: var(--bg-glass-hover);
}

.playlist-track.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2));
}

.pl-number {
  color: var(--text-muted);
  font-weight: 600;
  min-width: 20px;
}

.pl-title {
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.pl-artist {
  color: var(--text-muted);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-more {
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  padding: 8px;
}

/* Now Playing Widget */
.now-playing {
  margin-top: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.now-playing:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}

.np-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.np-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--primary-light);
  font-weight: 600;
}

.np-wave {
  display: flex;
  gap: 3px;
  align-items: end;
  height: 16px;
}

.wave-bar {
  width: 3px;
  background: var(--primary);
  border-radius: 2px;
  animation: wave 1s ease-in-out infinite;
}

.wave-bar:nth-child(1) { height: 8px; animation-delay: 0s; }
.wave-bar:nth-child(2) { height: 16px; animation-delay: 0.1s; }
.wave-bar:nth-child(3) { height: 12px; animation-delay: 0.2s; }
.wave-bar:nth-child(4) { height: 6px; animation-delay: 0.3s; }

@keyframes wave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.5); }
}

.np-track {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.np-cover {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  overflow: hidden;
  flex-shrink: 0;
}

.np-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder-mini {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.np-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.np-info p {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.np-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  align-items: center;
}

.np-controls button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.np-controls button:hover {
  color: var(--text-primary);
  transform: scale(1.2);
}

.np-controls .play-pause {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.np-progress-mini {
  margin-top: 12px;
}

.np-progress-bar {
  height: 4px;
  background: var(--bg-glass);
  border-radius: 2px;
  overflow: hidden;
}

.np-progress-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Chat Wrapper */
.chat-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(15, 15, 26, 0.6);
  backdrop-filter: blur(20px);
  min-width: 0;
}

/* Header */
.chat-header {
  height: 80px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  background: var(--bg-glass);
  flex-shrink: 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ai-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: var(--success);
  border-radius: 50%;
  border: 2px solid var(--bg-dark);
  animation: pulse 2s infinite;
}

.status-indicator.offline {
  background: var(--error);
  animation: none;
}

.header-text h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.header-text p {
  font-size: 13px;
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: scale(1.1);
}

.icon-btn.login-btn:hover {
  background: var(--success);
  border-color: var(--success);
}

.icon-btn.logout-btn:hover {
  background: var(--error);
  border-color: var(--error);
}

/* Settings Panel */
.settings-panel {
  position: absolute;
  top: 80px;
  right: 32px;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  min-width: 280px;
  backdrop-filter: blur(20px);
  z-index: 100;
  box-shadow: var(--shadow-lg);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item span {
  font-size: 14px;
  color: var(--text-secondary);
}

.toggle-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background: var(--primary);
  border-color: var(--primary);
}

.setting-item select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
}

/* Chat Container */
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  scroll-behavior: smooth;
}

/* Mensagens */
.message-wrapper {
  display: flex;
  width: 100%;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-bubble {
  display: flex;
  gap: 12px;
  max-width: 75%;
  animation: messageSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-wrapper.user .message-bubble {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-avatar.user-avatar {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.message-content {
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 16px 20px;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow);
}

.message-wrapper.user .message-content {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-color: transparent;
}

.message-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-primary);
}

.message-text :deep(strong) {
  color: var(--primary-light);
}

.message-wrapper.user .message-text :deep(strong) {
  color: white;
}

.message-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 8px;
  display: block;
}

.message-wrapper.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* Transições de mensagem */
.message-enter-active,
.message-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Lyric Results Card */
.lyric-results-card {
  margin-top: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 20px;
  border: 1px solid var(--border);
}

.lyric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.lyric-badge {
  font-size: 12px;
  color: var(--primary-light);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.lyric-query {
  font-size: 13px;
  color: var(--text-secondary);
  font-style: italic;
}

.lyric-songs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lyric-song-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.lyric-song-item:hover {
  background: var(--bg-glass-hover);
  border-color: var(--primary);
  transform: translateX(8px);
}

.lyric-number {
  width: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 700;
  flex-shrink: 0;
}

.lyric-cover {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.lyric-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.lyric-meta {
  flex: 1;
  min-width: 0;
}

.lyric-meta h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lyric-meta p {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lyric-preview {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  font-style: italic;
  line-height: 1.4;
}

.lyric-play-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.lyric-play-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

/* Recommendations Card */
.recommendations-card {
  margin-top: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.rec-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rec-genre {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--primary-light);
  font-weight: 700;
}

.rec-badge {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-card);
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.play-all-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: 24px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.play-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

/* Tracks List */
.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.track-item:hover {
  background: var(--bg-glass-hover);
  border-color: var(--primary);
  transform: translateX(8px);
}

.track-item.playing {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2));
  border-color: var(--primary);
}

.track-number {
  width: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 700;
  flex-shrink: 0;
}

.track-cover {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-art-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-art {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 24px;
}

.track-item:hover .play-overlay,
.track-item.playing .play-overlay {
  opacity: 1;
}

.track-meta {
  flex: 1;
  min-width: 0;
}

.track-meta h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-meta p {
  font-size: 13px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.duration {
  font-size: 13px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 16px;
}

.action-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  transform: scale(1.1);
}

.action-btn.active {
  background: var(--secondary);
  border-color: var(--secondary);
  color: white;
}

/* Artists Section */
.artists-section {
  border-top: 1px solid var(--border);
  padding-top: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.artists-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.artist-chip {
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  font-size: 13px;
  transition: all 0.3s ease;
  cursor: pointer;
  font-weight: 500;
}

.artist-chip:hover {
  background: var(--primary);
  border-color: var(--primary);
  transform: translateY(-2px);
}

/* Albums Grid */
.albums-section {
  border-top: 1px solid var(--border);
  padding-top: 20px;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.album-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.album-card:hover {
  transform: translateY(-4px);
}

.album-cover {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin-bottom: 8px;
  box-shadow: var(--shadow);
}

.album-info h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-info p {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Typing Indicator */
.typing-wrapper {
  display: flex;
  justify-content: flex-start;
  animation: messageSlide 0.3s ease;
}

.typing-bubble {
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 52px;
}

.typing-dots {
  display: flex;
  gap: 6px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: var(--primary-light);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* Quick Questions */
.quick-questions {
  padding: 0 32px 20px;
  border-top: 1px solid var(--border);
  background: var(--bg-glass);
  flex-shrink: 0;
}

.quick-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 12px;
  margin-top: 20px;
  font-weight: 500;
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 28px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
}

.quick-chip:hover {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.chip-icon {
  font-size: 18px;
}

/* Input Area */
.input-wrapper {
  padding: 24px 32px;
  background: var(--bg-glass);
  border-top: 1px solid var(--border);
  backdrop-filter: blur(20px);
  flex-shrink: 0;
}

.input-blocked {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--error);
  border-radius: 16px;
  color: var(--error);
  font-weight: 500;
}

.input-blocked button {
  background: none;
  border: none;
  color: var(--primary-light);
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 4px;
}

.input-blocked button:hover {
  color: var(--primary);
}

.input-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border);
  border-radius: 28px;
  padding: 8px 8px 8px 20px;
  transition: all 0.3s ease;
}

.input-container:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-action {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-action:hover {
  color: var(--text-primary);
  transform: scale(1.1);
}

.input-action.clear {
  font-size: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.input-action.clear:hover {
  background: var(--bg-card);
}

.message-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
  padding: 8px 0;
  font-family: inherit;
}

.message-input::placeholder {
  color: var(--text-muted);
}

.message-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-btn.active {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.send-btn.active:hover {
  transform: scale(1.1) rotate(-10deg);
}

.send-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.input-hint {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.hint-tag {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-card);
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.3s ease;
}

.hint-tag:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Toast Notification */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  padding: 16px 24px;
  background: var(--bg-glass);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transition: all 0.3s ease;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.toast.success {
  border-color: var(--success);
  background: rgba(34, 197, 94, 0.2);
}

.toast.error {
  border-color: var(--error);
  background: rgba(239, 68, 68, 0.2);
}

/* Transições do Toast */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Scrollbar */
.chat-container::-webkit-scrollbar,
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track,
.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.chat-container::-webkit-scrollbar-thumb,
.sidebar::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover,
.sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Responsivo */
@media (max-width: 1024px) {
  .sidebar {
    width: 260px;
  }
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .message-bubble {
    max-width: 90%;
  }
  .chat-container {
    padding: 20px;
  }
  .quick-chip {
    font-size: 13px;
    padding: 10px 16px;
  }
  .albums-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .lyric-song-item {
    gap: 12px;
  }
  .lyric-cover {
    width: 48px;
    height: 48px;
  }
  .settings-panel {
    right: 16px;
    left: 16px;
  }
  .full-player {
    padding: 32px 24px;
  }
  .full-cover {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: 0 16px;
  }
  .input-wrapper {
    padding: 16px;
  }
  .quick-questions {
    padding: 0 16px 16px;
  }
  .message-bubble {
    max-width: 95%;
  }
  .login-modal {
    padding: 32px 24px;
  }
  .login-actions {
    flex-direction: column;
  }
  .btn-login, .btn-register {
    width: 100%;
  }
  .full-track-info h2 {
    font-size: 18px;
  }
  .full-controls button {
    font-size: 22px;
  }
  .full-controls .main-control {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }
}
/* ═══════════════════════════════════════════════════════
   MODAL DE EXCLUSÃO DE CONVERSA
   ═══════════════════════════════════════════════════════ */

.delete-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.delete-modal {
  background: linear-gradient(145deg, #1a1a2e, #0f0f1a);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 24px;
  padding: 40px 36px 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(239, 68, 68, 0.1);
  position: relative;
  overflow: hidden;
}

.delete-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--error), #f43f5e, var(--error));
  opacity: 0.6;
}

.delete-modal-icon {
  width: 72px;
  height: 72px;
  background: rgba(239, 68, 68, 0.15);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  animation: modalIconPulse 2s ease-in-out infinite;
}

.delete-modal-icon svg {
  width: 32px;
  height: 32px;
  color: var(--error);
}

@keyframes modalIconPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
}

.delete-modal-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.delete-modal-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 8px;
}

.delete-modal-text strong {
  color: var(--text-primary);
  font-weight: 600;
}

.delete-modal-warning {
  font-size: 13px;
  color: var(--error);
  font-weight: 500;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.delete-modal-warning::before {
  content: '⚠️';
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  flex: 1;
  padding: 14px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.btn-cancel:hover {
  background: var(--bg-glass-hover);
  color: var(--text-primary);
  border-color: var(--text-muted);
  transform: translateY(-1px);
}

.btn-confirm-delete {
  flex: 1;
  padding: 14px 20px;
  background: linear-gradient(135deg, #dc2626, var(--error));
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.btn-confirm-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c, #dc2626);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.btn-confirm-delete:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.btn-confirm-delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.delete-spinner {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

.delete-spinner svg {
  width: 20px;
  height: 20px;
}

.modal-scale-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  transition: all 0.25s ease;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 480px) {
  .delete-modal {
    padding: 32px 24px 24px;
    border-radius: 20px;
  }
  .delete-modal-icon {
    width: 60px;
    height: 60px;
  }
  .delete-modal-icon svg {
    width: 28px;
    height: 28px;
  }
  .delete-modal-title {
    font-size: 20px;
  }
  .delete-modal-actions {
    flex-direction: column;
  }
  .btn-cancel,
  .btn-confirm-delete {
    width: 100%;
  }
}
</style>
<template>
  <div class="music-player" v-if="currentTrack">
    <!-- Lado esquerdo: Info da música -->
    <div class="player-left">
      <div class="cover-container">
        <img
          :src="currentTrack.cover"
          class="player-cover"
          :class="{ 'spinning': isPlaying }"
          @error="handleImageError"
        />
        <div class="playing-indicator" v-show="isPlaying">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div class="track-info">
        <span class="track-title">{{ currentTrack.title }}</span>
        <span class="track-artist">{{ currentTrack.artist }}</span>
      </div>

      <button
        @click="toggleLike"
        class="like-btn"
        :class="{ liked: isLiked }"
        title="Curtir"
      >
        <i :class="isLiked ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
      </button>
    </div>

    <!-- Centro: Controles principais -->
    <div class="player-center">
      <div class="controls">
        <button
          @click="prevTrack"
          class="control-btn"
          :disabled="currentIndex <= 0"
          title="Anterior"
        >
          <i class="fa fa-step-backward"></i>
        </button>

        <button
          class="play-btn main-play-btn"
          @click="togglePlay"
          :class="{ 'playing': isPlaying }"
          :title="isPlaying ? 'Pausar' : 'Tocar'"
        >
          <i :class="isPlaying ? 'fa fa-pause' : 'fa fa-play'"></i>
        </button>

        <button
          @click="nextTrack"
          class="control-btn"
          title="Próxima"
        >
          <i class="fa fa-step-forward"></i>
        </button>

        <button
          @click="toggleRepeat"
          :class="{ active: repeatMode }"
          class="control-btn repeat-btn"
          title="Repetir"
        >
          <i :class="repeatMode ? 'fa fa-repeat' : 'fa fa-long-arrow-right'"></i>
        </button>
      </div>

      <div class="progress-container">
        <span class="time current">{{ formatTime(currentTime) }}</span>

        <div
          class="progress-bar-wrapper"
          @click="seekTo"
          ref="progressBar"
        >
          <div class="progress-bg"></div>
          <div
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
          <div
            class="progress-handle"
            :style="{ left: progressPercent + '%' }"
          ></div>
          <input
            type="range"
            min="0"
            :max="duration || 100"
            :value="currentTime"
            @input="onSeekInput"
            @change="onSeekChange"
            class="progress-input"
          />
        </div>

        <span class="time total">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Direita: Volume -->
    <div class="player-right">
      <button
        @click="toggleMute"
        class="mute-btn"
        title="Volume"
      >
        <i :class="volumeIcon"></i>
      </button>

      <div class="volume-section">
        <div
          class="volume-bar-wrapper"
          @click="setVolume"
          ref="volumeBar"
        >
          <div class="volume-bg"></div>
          <div
            class="volume-fill"
            :style="{ width: (isMuted ? 0 : volume) * 100 + '%' }"
          ></div>
          <div
            class="volume-handle"
            :style="{ left: (isMuted ? 0 : volume) * 100 + '%' }"
          ></div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            @input="onVolumeInput"
            class="volume-input"
          />
        </div>
      </div>
    </div>

    <!-- ÁUDIO - ELEMENTO CRÍTICO -->
    <audio
      ref="audioPlayer"
      :src="currentTrack.url"
      @play="onAudioPlay"
      @pause="onAudioPause"
      @ended="onAudioEnded"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @canplay="onCanPlay"
      @error="onAudioError"
      preload="auto"
      crossorigin="anonymous"
    ></audio>
  </div>
 
</template>

<script>
export default {
  name: 'MusicPlayer',

  data() {
    return {
      queue: [],
      currentIndex: 0,
     
      // Estado do player
      isPlaying: false,
      isLiked: false,
      isMuted: false,
      isDragging: false,
      isLoading: false,
     
      // Progresso
      currentTime: 0,
      duration: 0,
      canPlay: false,
     
      // Volume
      volume: 0.7,
      previousVolume: 0.7,
     
      // Configurações
      repeatMode: false,
     
      // Controle
      hasTrack: false,
      playPromise: null,
     
      // Controle de histórico
      _trackStartTime: null,
      _totalListenedTime: 0,
      _lastSyncTime: 0,
      _syncInterval: null
    }
  },

  computed: {
    currentTrack() {
      if (!this.hasTrack || this.queue.length === 0) return null
      return this.queue[this.currentIndex] || null
    },
   
    progressPercent() {
      if (!this.duration || this.duration === 0) return 0
      return (this.currentTime / this.duration) * 100
    },
   
    volumeIcon() {
      if (this.isMuted || this.volume === 0) return 'fa fa-volume-off'
      if (this.volume < 0.3) return 'fa fa-volume-down'
      return 'fa fa-volume-up'
    }
  },

  mounted() {
    console.log('🎵 MusicPlayer montado - Aguardando música...')
   
    // Configurar volume inicial
    this.$nextTick(() => {
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.volume = this.volume
      }
    })
   
    // Eventos globais
    window.addEventListener('play-song', this.handlePlaySong)
    window.addEventListener('playlist-playback-started', this.handlePlaylistPlayback)
   
    // Comandos do Dashboard/Chat
    window.addEventListener('player-toggle-play', this.handleTogglePlayCommand)
    window.addEventListener('player-next-track', this.handleNextCommand)
    window.addEventListener('player-prev-track', this.handlePrevCommand)
   
    // Iniciar sincronização contínua com o Dashboard/Chat
    this.startSyncInterval()
  },

  beforeDestroy() {
    window.removeEventListener('play-song', this.handlePlaySong)
    window.removeEventListener('playlist-playback-started', this.handlePlaylistPlayback)
    window.removeEventListener('player-toggle-play', this.handleTogglePlayCommand)
    window.removeEventListener('player-next-track', this.handleNextCommand)
    window.removeEventListener('player-prev-track', this.handlePrevCommand)
   
    this.stopSyncInterval()
  },

  methods: {
    handlePrevCommand() {
      console.log('🎮 Comando prev recebido')
      this.prevTrack()
    },
   
    // ═══════════════════════════════════════════════════════
    // SINCRONIZAÇÃO COM DASHBOARD/CHAT
    // ═══════════════════════════════════════════════════════

    startSyncInterval() {
      // Envia estado a cada 300ms para sincronizar UI
      this._syncInterval = setInterval(() => {
        this.syncStateToDashboard()
      }, 300)
    },

    stopSyncInterval() {
      if (this._syncInterval) {
        clearInterval(this._syncInterval)
        this._syncInterval = null
      }
    },

    syncStateToDashboard() {
      if (!this.currentTrack) return
     
      const audio = this.$refs.audioPlayer
      if (!audio) return
     
      // Evita enviar se nada mudou significativamente
      const now = Date.now()
      if (now - this._lastSyncTime < 250) return
     
      const progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0
     
      window.dispatchEvent(new CustomEvent('player-state-changed', {
        detail: {
          track: {
            id: this.currentTrack.id,
            title: this.currentTrack.title,
            artist: this.currentTrack.artist,
            cover: this.currentTrack.cover,
            url: this.currentTrack.url,
            duration: this.currentTrack.duration,
            emoji: this.currentTrack.emoji,
            color: this.currentTrack.color
          },
          isPlaying: this.isPlaying,
          currentTime: this.currentTime,
          duration: this.duration,
          progress: progress,
          context: this.currentTrack.source || 'unknown',
          timestamp: now
        }
      }))
     
      this._lastSyncTime = now
    },

    // ═══════════════════════════════════════════════════════
    // COMANDOS EXTERNOS
    // ═══════════════════════════════════════════════════════

    handleTogglePlayCommand() {
      console.log('🎮 Comando toggle-play recebido')
      this.togglePlay()
    },

    handleNextCommand() {
      console.log('⏭️ Comando next recebido')
      this.nextTrack()
    },

    // ═══════════════════════════════════════════════════════
    // HANDLERS DE EVENTOS GLOBAIS
    // ═══════════════════════════════════════════════════════

    handlePlaySong(e) {
      console.log('📥 Evento play-song recebido:', e.detail)
     
      // Notificar que track começou
      const detail = e.detail
      if (detail && detail.song) {
        window.dispatchEvent(new CustomEvent('player-track-started', {
          detail: {
            track: detail.song,
            timestamp: Date.now()
          }
        }))
      }
     
      this.loadSongFromEvent(e.detail)
    },

    handlePlaylistPlayback(e) {
      console.log('📥 Evento playlist-playback-started recebido:', e.detail)
      this.loadSongFromEvent(e.detail)
    },

    // ═══════════════════════════════════════════════════════
    // CARREGAR MÚSICA DO EVENTO
    // ═══════════════════════════════════════════════════════

    loadSongFromEvent({ song, playlist, index, context }) {
      // Se já tinha uma música tocando, registra ela no histórico ANTES de trocar
      if (this.currentTrack && this._trackStartTime) {
        this.notifyTrackEnded(false)
      }

      // Atualizar playlist
      if (playlist && Array.isArray(playlist) && playlist.length > 0) {
        this.queue = [...playlist]
      } else if (song) {
        this.queue = [song]
      }
     
      // Definir índice
      this.currentIndex = (index !== undefined) ? index : 0
     
      // Marcar que tem música
      this.hasTrack = true
     
      // Resetar contadores de histórico
      this._trackStartTime = Date.now()
      this._totalListenedTime = 0
     
      console.log('🎵 Carregando música:', this.queue[this.currentIndex]?.title)
     
      // Resetar estado
      this.isPlaying = false
      this.canPlay = false
      this.currentTime = 0
      this.duration = 0
     
      // Carregar e tocar
      this.$nextTick(() => {
        this.loadAndPlay()
      })
    },

    // ═══════════════════════════════════════════════════════
    // CARREGAR E TOCAR
    // ═══════════════════════════════════════════════════════

    async loadAndPlay() {
      const audio = this.$refs.audioPlayer
      if (!audio) {
        console.error('❌ Elemento de áudio não encontrado!')
        return
      }
     
      console.log('🔄 Carregando áudio:', this.currentTrack.url)
     
      // Se houver uma promise pendente, aguardar
      if (this.playPromise) {
        try {
          await this.playPromise
        } catch (e) {
          // Ignorar erros de abort
        }
      }
     
      // Pausar primeiro
      audio.pause()
      this.isPlaying = false
     
      // Forçar recarregamento do src
      audio.load()
     
      // Tentar tocar após pequeno delay para garantir carregamento
      setTimeout(() => {
        this.attemptPlay()
      }, 100)
    },

    // ═══════════════════════════════════════════════════════
    // TENTAR TOCAR COM TRATAMENTO ROBUSTO
    // ═══════════════════════════════════════════════════════

    async attemptPlay() {
      const audio = this.$refs.audioPlayer
      if (!audio) return
     
      console.log('▶️ Tentando tocar... Estado:', audio.readyState)
     
      // Verificar se pode tocar
      if (audio.readyState < 2) {
        console.log('⏳ Áudio não pronto, aguardando canplay...')
        return
      }
     
      try {
        this.isLoading = true
       
        // GUARDAR A PROMISE - ISSO É CRÍTICO
        this.playPromise = audio.play()
       
        await this.playPromise
       
        // Só atualizar estado se a promise resolver com sucesso
        console.log('✅ Tocando com sucesso!')
        this.isPlaying = true
        this.isLoading = false
       
        // Resetar contador quando começa a tocar de verdade
        if (!this._trackStartTime) {
          this._trackStartTime = Date.now()
        }
       
      } catch (err) {
        console.error('❌ Erro ao tocar:', err.name, err.message)
        this.isPlaying = false
        this.isLoading = false
       
        if (err.name === 'NotAllowedError') {
          console.log('⚠️ Autoplay bloqueado - interação do usuário necessária')
        } else if (err.name === 'NotSupportedError') {
          console.error('❌ Formato de áudio não suportado')
        }
      } finally {
        this.playPromise = null
      }
    },

    // ═══════════════════════════════════════════════════════
    // TOGGLE PLAY/PAUSE
    // ═══════════════════════════════════════════════════════

    async togglePlay() {
      const audio = this.$refs.audioPlayer
      if (!audio || !this.currentTrack) return
     
      console.log('🎮 Toggle play. Estado atual:', this.isPlaying, 'Paused:', audio.paused)
     
      // Se há uma promise pendente, aguardar
      if (this.playPromise) {
        console.log('⏳ Aguardando promise pendente...')
        try {
          await this.playPromise
        } catch (e) {
          // Ignorar
        }
      }
     
      if (this.isPlaying) {
        // PAUSAR
        console.log('⏸️ Pausando...')
        audio.pause()
        this.isPlaying = false
       
        // Acumular tempo ouvido
        if (this._trackStartTime) {
          const sessionTime = Date.now() - this._trackStartTime
          this._totalListenedTime += sessionTime
          this._trackStartTime = null
        }
       
      } else {
        // TOCAR
        console.log('▶️ Iniciando reprodução...')
       
        if (audio.ended) {
          audio.currentTime = 0
        }
       
        try {
          this.playPromise = audio.play()
          await this.playPromise
          this.isPlaying = true
         
          // Retomar contador
          if (!this._trackStartTime) {
            this._trackStartTime = Date.now()
          }
         
          console.log('✅ Reprodução iniciada!')
        } catch (err) {
          console.error('❌ Erro ao tocar:', err)
          this.isPlaying = false
        } finally {
          this.playPromise = null
        }
      }
    },

    // ═══════════════════════════════════════════════════════
    // EVENTOS DO ÁUDIO
    // ═══════════════════════════════════════════════════════

    onAudioPlay() {
      console.log('🔊 Evento: play disparado')
      if (!this.playPromise) {
        this.isPlaying = true
      }
    },

    onAudioPause() {
      console.log('🔇 Evento: pause disparado')
      if (!this.playPromise) {
        this.isPlaying = false
      }
    },

    onCanPlay() {
      console.log('✅ Evento: canplay - áudio pronto')
      this.canPlay = true
     
      const audio = this.$refs.audioPlayer
      if (audio && audio.paused && this.hasTrack) {
        console.log('🔄 Auto-play após canplay')
        this.attemptPlay()
      }
    },

    onAudioEnded() {
      console.log('⏹️ Evento: ended - Música terminou!')
      this.isPlaying = false
     
      // Notificar que a música terminou naturalmente
      this.notifyTrackEnded(true)
     
      if (this.repeatMode) {
        const audio = this.$refs.audioPlayer
        audio.currentTime = 0
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.attemptPlay()
      } else {
        this.nextTrack()
      }
    },

    notifyTrackEnded(naturallyEnded = true) {
      if (!this.currentTrack) return
     
      // Calcular tempo total ouvido
      let listenedDuration = this._totalListenedTime
     
      // Se ainda estava tocando quando terminou, adiciona o tempo da sessão atual
      if (this._trackStartTime) {
        listenedDuration += (Date.now() - this._trackStartTime)
      }
     
      console.log(`📊 Música finalizada. Tempo ouvido: ${Math.round(listenedDuration/1000)}s`)
     
      window.dispatchEvent(new CustomEvent('player-track-ended', {
        detail: {
          track: {
            id: this.currentTrack.id,
            title: this.currentTrack.title,
            artist: this.currentTrack.artist,
            cover: this.currentTrack.cover,
            url: this.currentTrack.url,
            duration: this.currentTrack.duration,
            source: this.currentTrack.source || 'unknown'
          },
          listenedDuration: listenedDuration,
          totalDuration: this.duration * 1000,
          context: this.currentTrack.source || 'unknown',
          naturallyEnded: naturallyEnded,
          timestamp: Date.now()
        }
      }))
     
      // Resetar contadores
      this._trackStartTime = null
      this._totalListenedTime = 0
    },

    onAudioError(e) {
      console.error('❌ Erro no áudio:', e)
      this.isPlaying = false
      this.isLoading = false
    },

    onTimeUpdate() {
      const audio = this.$refs.audioPlayer
      if (audio && !this.isDragging) {
        this.currentTime = audio.currentTime
      }
    },

    onLoadedMetadata() {
      const audio = this.$refs.audioPlayer
      if (audio) {
        this.duration = audio.duration || this.currentTrack?.duration || 0
        console.log('📊 Duração carregada:', this.duration)
      }
    },

    // ═══════════════════════════════════════════════════════
    // NAVEGAÇÃO
    // ═══════════════════════════════════════════════════════

    prevTrack() {
      const audio = this.$refs.audioPlayer
     
      if (this.currentTime > 3) {
        audio.currentTime = 0
        this.currentTime = 0
        return
      }
     
      // Registrar música atual antes de trocar
      if (this.currentTrack) {
        this.notifyTrackEnded(false)
      }
     
      if (this.currentIndex > 0) {
        this.currentIndex--
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.loadAndPlay()
      }
    },

    nextTrack() {
      // Registrar música atual antes de trocar
      if (this.currentTrack) {
        this.notifyTrackEnded(false)
      }
     
      if (this.currentIndex < this.queue.length - 1) {
        this.currentIndex++
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.loadAndPlay()
      } else if (this.repeatMode) {
        this.currentIndex = 0
        this._trackStartTime = Date.now()
        this._totalListenedTime = 0
        this.loadAndPlay()
      }
    },

    // ═══════════════════════════════════════════════════════
    // CONTROLES
    // ═══════════════════════════════════════════════════════

    toggleLike() {
      this.isLiked = !this.isLiked
    },

    toggleRepeat() {
      this.repeatMode = !this.repeatMode
    },

    toggleMute() {
      const audio = this.$refs.audioPlayer
     
      if (this.isMuted) {
        this.volume = this.previousVolume || 0.7
        this.isMuted = false
        if (audio) audio.volume = this.volume
      } else {
        this.previousVolume = this.volume
        this.volume = 0
        this.isMuted = true
        if (audio) audio.volume = 0
      }
    },

    // ═══════════════════════════════════════════════════════
    // SEEK
    // ═══════════════════════════════════════════════════════

    onSeekInput(e) {
      this.isDragging = true
      this.currentTime = parseFloat(e.target.value)
    },

    onSeekChange(e) {
      this.isDragging = false
      const time = parseFloat(e.target.value)
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.currentTime = time
        this.currentTime = time
      }
    },

    seekTo(e) {
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const time = percent * this.duration
     
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.currentTime = time
        this.currentTime = time
      }
    },

    // ═══════════════════════════════════════════════════════
    // VOLUME
    // ═══════════════════════════════════════════════════════

    onVolumeInput(e) {
      const vol = parseFloat(e.target.value)
      this.volume = vol
      this.isMuted = (vol === 0)
     
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.volume = vol
      }
    },

    setVolume(e) {
      const rect = this.$refs.volumeBar.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const vol = Math.max(0, Math.min(1, percent))
     
      this.volume = vol
      this.isMuted = (vol === 0)
     
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.volume = vol
      }
    },

    // ═══════════════════════════════════════════════════════
    // UTILIDADES
    // ═══════════════════════════════════════════════════════

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "0:00"
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },

    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMTgxODE4Ii8+PHRleHQgeD0iMzAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiMxZGI5NTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJoTwvdGV4dD48L3N2Zz4='
    },

    stop() {
      // Registrar no histórico antes de parar
      if (this.currentTrack) {
        this.notifyTrackEnded(false)
      }
     
      const audio = this.$refs.audioPlayer
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      this.isPlaying = false
      this.hasTrack = false
      this.queue = []
      this.currentIndex = 0
      this._trackStartTime = null
      this._totalListenedTime = 0
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

.player-fade-enter-active,
.player-fade-leave-active {
  transition: all 0.4s ease;
}

.player-fade-enter-from,
.player-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.player-fade-enter-to,
.player-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background: linear-gradient(180deg, #0a0a1a 0%, #050508 100%);
  border-top: 1px solid rgba(37, 99, 235, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 999;
  font-family: 'Segoe UI', system-ui, sans-serif;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* LADO ESQUERDO */
.player-left {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 30%;
  min-width: 250px;
}

.cover-container {
  position: relative;
}

.player-cover {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease;
}

.player-cover.spinning {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.playing-indicator {
  position: absolute;
  bottom: -6px;
  right: -6px;
  display: flex;
  gap: 2px;
  background: rgba(37, 99, 235, 0.9);
  padding: 3px 5px;
  border-radius: 3px;
}

.playing-indicator span {
  width: 2px;
  height: 10px;
  background: white;
  border-radius: 1px;
  animation: sound 0.5s ease-in-out infinite;
}

.playing-indicator span:nth-child(2) { animation-delay: 0.1s; }
.playing-indicator span:nth-child(3) { animation-delay: 0.2s; }

@keyframes sound {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

.track-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.track-title {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.like-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s;
  margin-left: 10px;
}

.like-btn:hover {
  color: #ec4899;
  transform: scale(1.1);
}

.like-btn.liked {
  color: #ec4899;
}

/* CENTRO - CONTROLES */
.player-center {
  width: 40%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.2s;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  color: #f8fafc;
  background: rgba(37, 99, 235, 0.1);
}

.control-btn.active {
  color: #2563eb;
}

.control-btn:disabled {
  color: #535353;
  cursor: not-allowed;
}

.main-play-btn {
  font-size: 20px !important;
  width: 42px !important;
  height: 42px !important;
  background: linear-gradient(135deg, #2563eb, #7c3aed) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  transition: all 0.2s ease !important;
}

.main-play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
}

.main-play-btn:active {
  transform: scale(0.95);
}

.main-play-btn.playing {
  background: linear-gradient(135deg, #ec4899, #8b5cf6) !important;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
}

/* Progresso */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 600px;
}

.time {
  color: #94a3b8;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  min-width: 35px;
}

.time.current {
  text-align: right;
}

.progress-bar-wrapper {
  flex: 1;
  position: relative;
  height: 4px;
  cursor: pointer;
  border-radius: 2px;
}

.progress-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 2px;
  pointer-events: none;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.progress-bar-wrapper:hover .progress-handle {
  opacity: 1;
}

.progress-input {
  position: absolute;
  inset: -8px 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

/* LADO DIREITO - VOLUME */
.player-right {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 30%;
  min-width: 150px;
  justify-content: flex-end;
}

.mute-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  padding: 8px;
  transition: all 0.2s;
}

.mute-btn:hover {
  color: #f8fafc;
}

.volume-section {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 136px;
}

.volume-bar-wrapper {
  flex: 1;
  position: relative;
  height: 4px;
  cursor: pointer;
  border-radius: 2px;
}

.volume-bg {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.volume-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 2px;
  pointer-events: none;
  transition: width 0.1s ease;
}

.volume-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  transition: transform 0.2s ease;
  pointer-events: none;
}

.volume-bar-wrapper:hover .volume-handle {
  transform: translate(-50%, -50%) scale(1);
}

.volume-input {
  position: absolute;
  inset: -8px 0;
  width: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

/* Responsivo */
@media (max-width: 1024px) {
  .music-player {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .music-player {
    padding: 0 16px;
  }
 
  .player-left {
    min-width: 150px;
  }
 
  .track-info p {
    display: none;
  }
 
  .player-center {
    max-width: 50%;
  }
 
  .player-right {
    min-width: 100px;
  }
 
  .volume-section {
    display: none;
  }
}

@media (max-width: 480px) {
  .like-btn {
    display: none;
  }
 
  .control-btn:not(.main-play-btn) {
    display: none;
  }
 
  .time {
    font-size: 10px;
    min-width: 30px;
  }
}
</style>