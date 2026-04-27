<template>
  <div class="app-container">
    <!-- Background Animado -->
    <div class="gradient-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- Layout Principal -->
    <div class="main-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-icon">🎵</div>
          <h1>MusicAI</h1>
        </div>

        <nav class="nav-menu">
          <div 
            v-for="item in navItems" 
            :key="item.id"
            class="nav-item"
            :class="{ active: activeNav === item.id }"
            @click="activeNav = item.id"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </div>
        </nav>

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

        <div class="now-playing" v-if="currentTrack">
          <div class="np-header">
            <span class="np-label">Tocando Agora</span>
            <div class="np-wave">
              <span v-for="i in 4" :key="i" class="wave-bar"></span>
            </div>
          </div>
          <div class="np-track">
            <div class="np-cover">🎵</div>
            <div class="np-info">
              <h4>{{ currentTrack.title }}</h4>
              <p>{{ currentTrack.artist }}</p>
            </div>
          </div>
          <div class="np-controls">
            <button @click="prevTrack">⏮</button>
            <button class="play-pause" @click="togglePlay">
              {{ isPlaying ? '⏸' : '▶️' }}
            </button>
            <button @click="nextTrack">⏭</button>
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
              <div class="status-indicator"></div>
            </div>
            <div class="header-text">
              <h2>Assistente Musical</h2>
              <p>{{ isTyping ? 'Digitando...' : 'Online • Pronto para ajudar' }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button class="icon-btn" @click="clearChat" title="Limpar conversa">🗑️</button>
            <button class="icon-btn" title="Configurações">⚙️</button>
          </div>
        </header>

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
                
                <div class="message-content">
                  <p class="message-text">{{ message.content }}</p>
                  
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
                          <div class="cover-art" :style="{ background: track.color }">
                            <span>{{ track.emoji }}</span>
                          </div>
                          <div class="play-overlay">
                            <span>{{ currentTrack?.id === track.id && isPlaying ? '⏸' : '▶️' }}</span>
                          </div>
                        </div>
                        <div class="track-meta">
                          <h4>{{ track.title }}</h4>
                          <p>{{ track.artist }} • {{ track.album }}</p>
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
                    
                    <div class="artists-section" v-if="message.recommendations.artists.length">
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

                    <div class="albums-section" v-if="message.recommendations.albums?.length">
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
          <div class="input-container">
            <button class="input-action" title="Anexar">📎</button>
            <input 
              v-model="inputMessage"
              @keyup.enter="sendMessage"
              type="text" 
              placeholder="Digite um gênero, artista, álbum ou como você está se sentindo..."
              class="message-input"
              ref="inputRef"
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
              :disabled="!canSend || isTyping"
            >
              <span v-if="!isTyping">➤</span>
              <span v-else class="spinner">⟳</span>
            </button>
          </div>
          <p class="input-hint">
            <span class="hint-tag">Pop</span>
            <span class="hint-tag">Rock</span>
            <span class="hint-tag">Jazz</span>
            <span class="hint-tag">Para treinar</span>
            <span class="hint-tag">Relaxar</span>
            <span class="hint-tag">Anos 80</span>
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
  </div>
</template>


<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

// ============ ESTADO REATIVO ============
const messages = ref([
  {
    id: Date.now(),
    type: 'ai',
    content: 'Olá! 🎵 Sou seu assistente musical pessoal. Posso te ajudar a descobrir novas músicas, artistas e álbuns baseado no seu gosto ou humor. Como posso te ajudar hoje?',
    timestamp: new Date(),
    recommendations: null
  }
])
const inputMessage = ref('')
const isTyping = ref(false)
const chatContainer = ref(null)
const inputRef = ref(null)
const activeNav = ref('chat')
const selectedGenre = ref(null)
const currentTrack = ref(null)
const isPlaying = ref(false)
const favorites = ref(new Set())
const toast = ref({ show: false, message: '', type: 'info' })

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
  { icon: '🎸', text: 'Rock clássico dos anos 80', genre: 'rock', mood: 'nostalgic' },
  { icon: '🎤', text: 'Pop atual para festa', genre: 'pop', mood: 'happy' },
  { icon: '🎹', text: 'Eletrônica para treinar', genre: 'electronic', mood: 'workout' },
  { icon: '🎺', text: 'Jazz suave para relaxar', genre: 'jazz', mood: 'relax' },
  { icon: '🎧', text: 'Hip-hop moderno', genre: 'hiphop', mood: 'focus' },
  { icon: '🌙', text: 'Indie para estudar', genre: 'indie', mood: 'study' },
  { icon: '❤️', text: 'Músicas românticas', genre: 'rnb', mood: 'romantic' },
  { icon: '🎻', text: 'Clássica tranquila', genre: 'classical', mood: 'calm' }
]

// Base de dados de músicas
const musicDatabase = {
  rock: {
    tracks: [
      { id: 1, title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: '5:55', emoji: '👑', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 2, title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: '6:30', emoji: '🦅', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 3, title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', duration: '8:02', emoji: '🪜', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 4, title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction', duration: '5:03', emoji: '🌹', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    ],
    artists: ['Queen', 'Led Zeppelin', 'Pink Floyd', 'The Beatles', 'Nirvana', 'Guns N\' Roses'],
    albums: [
      { name: 'Dark Side of the Moon', artist: 'Pink Floyd', emoji: '🌈', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Abbey Road', artist: 'The Beatles', emoji: '🚶', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    ],
    description: 'Clássicos do rock que definiram gerações e continuam inspirando músicos até hoje.'
  },
  pop: {
    tracks: [
      { id: 5, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', emoji: '💡', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
      { id: 6, title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23', emoji: '🚀', color: 'linear-gradient(135deg, #ff8a80 0%, #ea6100 100%)' },
      { id: 7, title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:47', emoji: '🏠', color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
      { id: 8, title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', duration: '3:20', emoji: '🌙', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }
    ],
    artists: ['The Weeknd', 'Dua Lipa', 'Harry Styles', 'Taylor Swift', 'Ed Sheeran', 'Ariana Grande'],
    albums: [
      { name: 'Future Nostalgia', artist: 'Dua Lipa', emoji: '🕺', color: 'linear-gradient(135deg, #ff8a80 0%, #ea6100 100%)' },
      { name: 'Midnights', artist: 'Taylor Swift', emoji: '🌌', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }
    ],
    description: 'Hits populares que estão dominando as paradas e fazendo todo mundo dançar.'
  },
  jazz: {
    tracks: [
      { id: 9, title: 'Take Five', artist: 'Dave Brubeck', album: 'Time Out', duration: '5:24', emoji: '🎷', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 10, title: 'So What', artist: 'Miles Davis', album: 'Kind of Blue', duration: '9:22', emoji: '🎺', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 11, title: 'Autumn Leaves', artist: 'Chet Baker', album: 'Chet Baker Sings', duration: '5:42', emoji: '🍂', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 12, title: 'Fly Me to the Moon', artist: 'Frank Sinatra', album: 'It Might as Well Be Swing', duration: '2:27', emoji: '🌙', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    ],
    artists: ['Miles Davis', 'John Coltrane', 'Chet Baker', 'Billie Holiday', 'Duke Ellington', 'Frank Sinatra'],
    albums: [
      { name: 'Kind of Blue', artist: 'Miles Davis', emoji: '🔵', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Time Out', artist: 'Dave Brubeck', emoji: '⏰', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    ],
    description: 'Jazz clássico para relaxar, contemplar e apreciar a arte da improvisação.'
  },
  electronic: {
    tracks: [
      { id: 13, title: 'Get Lucky', artist: 'Daft Punk', album: 'Random Access Memories', duration: '6:09', emoji: '🍀', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 14, title: 'Titanium', artist: 'David Guetta ft. Sia', album: 'Nothing but the Beat', duration: '4:05', emoji: '🔩', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 15, title: 'Clarity', artist: 'Zedd', album: 'Clarity', duration: '4:31', emoji: '💎', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 16, title: 'Levels', artist: 'Avicii', album: 'True', duration: '3:18', emoji: '📶', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    ],
    artists: ['Daft Punk', 'Calvin Harris', 'Avicii', 'Zedd', 'Deadmau5', 'David Guetta'],
    albums: [
      { name: 'Random Access Memories', artist: 'Daft Punk', emoji: '🤖', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'True', artist: 'Avicii', emoji: '✅', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    ],
    description: 'Batidas eletrônicas energéticas perfeitas para treinar ou animar a festa.'
  },
  hiphop: {
    tracks: [
      { id: 17, title: 'Sicko Mode', artist: 'Travis Scott', album: 'Astroworld', duration: '5:12', emoji: '🚀', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 18, title: 'God\'s Plan', artist: 'Drake', album: 'Scorpion', duration: '3:18', emoji: '🙏', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 19, title: 'HUMBLE.', artist: 'Kendrick Lamar', album: 'DAMN.', duration: '2:57', emoji: '🙇', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 20, title: 'N95', artist: 'Kendrick Lamar', album: 'Mr. Morale', duration: '3:15', emoji: '😷', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    ],
    artists: ['Kendrick Lamar', 'Drake', 'Travis Scott', 'J. Cole', 'Tyler, The Creator', 'Kanye West'],
    albums: [
      { name: 'DAMN.', artist: 'Kendrick Lamar', emoji: '🔴', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Astroworld', artist: 'Travis Scott', emoji: '🎢', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    ],
    description: 'Hip-hop contemporâneo com flow afiado, letras profundas e batidas poderosas.'
  },
  indie: {
    tracks: [
      { id: 21, title: 'Mr. Brightside', artist: 'The Killers', album: 'Hot Fuss', duration: '3:43', emoji: '🔪', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 22, title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', album: 'AM', duration: '4:32', emoji: '🐒', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 23, title: 'Take Me Out', artist: 'Franz Ferdinand', album: 'Franz Ferdinand', duration: '3:57', emoji: '🎯', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 24, title: 'Last Nite', artist: 'The Strokes', album: 'Is This It', duration: '3:13', emoji: '🌃', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    ],
    artists: ['Arctic Monkeys', 'Tame Impala', 'The Strokes', 'Bon Iver', 'Phoebe Bridgers', 'The Killers'],
    albums: [
      { name: 'AM', artist: 'Arctic Monkeys', emoji: '🌙', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Currents', artist: 'Tame Impala', emoji: '🔮', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    ],
    description: 'Indie rock alternativo com identidade única e sons autênticos.'
  },
  rnb: {
    tracks: [
      { id: 25, title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', emoji: '✨', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 26, title: 'Adorn', artist: 'Miguel', album: 'Kaleidoscope Dream', duration: '3:13', emoji: '💎', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 27, title: 'Thinkin Bout You', artist: 'Frank Ocean', album: 'Channel Orange', duration: '3:21', emoji: '🍊', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 28, title: 'Exchange', artist: 'Bryson Tiller', album: 'Trapsoul', duration: '3:14', emoji: '💱', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    ],
    artists: ['The Weeknd', 'Frank Ocean', 'Bryson Tiller', 'Miguel', 'SZA', 'Daniel Caesar'],
    albums: [
      { name: 'Channel Orange', artist: 'Frank Ocean', emoji: '🍊', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Trapsoul', artist: 'Bryson Tiller', emoji: '🎤', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    ],
    description: 'R&B suave e sensual, perfeito para momentos românticos.'
  },
  classical: {
    tracks: [
      { id: 29, title: 'Clair de Lune', artist: 'Claude Debussy', album: 'Suite Bergamasque', duration: '5:09', emoji: '🌙', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { id: 30, title: 'Four Seasons', artist: 'Vivaldi', album: 'The Four Seasons', duration: '3:15', emoji: '🍃', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
      { id: 31, title: 'Moonlight Sonata', artist: 'Beethoven', album: 'Piano Sonata No. 14', duration: '6:00', emoji: '🌙', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
      { id: 32, title: 'Canon in D', artist: 'Pachelbel', album: 'Canon and Gigue', duration: '5:00', emoji: '🎻', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
    ],
    artists: ['Beethoven', 'Mozart', 'Bach', 'Vivaldi', 'Debussy', 'Chopin'],
    albums: [
      { name: 'The Four Seasons', artist: 'Vivaldi', emoji: '🍂', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      { name: 'Greatest Hits', artist: 'Mozart', emoji: '🎼', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    ],
    description: 'Música clássica atemporal que traz paz e sofisticação.'
  }
}

// Mapeamento de moods para gêneros
const moodMap = {
  'feliz': 'pop', 'animado': 'pop', 'alegre': 'pop', 'festa': 'pop', 'dançar': 'pop',
  'triste': 'indie', 'melancolico': 'indie', 'nostalgico': 'rock', 'saudade': 'indie',
  'relaxar': 'jazz', 'calmo': 'jazz', 'tranquilo': 'classical', 'meditar': 'classical',
  'treinar': 'electronic', 'academia': 'electronic', 'corrida': 'electronic', 'energia': 'electronic',
  'focar': 'classical', 'estudar': 'jazz', 'concentrar': 'classical',
  'romantico': 'rnb', 'namorar': 'rnb', 'amor': 'rnb', 'paixao': 'rnb',
  'dirigir': 'rock', 'viagem': 'rock', 'estrada': 'rock',
  'cansado': 'indie', 'descansar': 'jazz', 'dormir': 'classical'
}

// ============ COMPUTED ============
const canSend = computed(() => inputMessage.value.trim().length > 0)
const showQuickQuestions = computed(() => messages.value.length < 3)

// ============ MÉTODOS ============
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const showToast = (message, type = 'info') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const detectGenre = (text) => {
  const lowerText = text.toLowerCase()
  
  // Verificar gêneros diretos
  for (const [genre, data] of Object.entries(musicDatabase)) {
    if (lowerText.includes(genre) || lowerText.includes(genre.replace(' ', ''))) return genre
  }
  
  // Verificar moods
  for (const [mood, genre] of Object.entries(moodMap)) {
    if (lowerText.includes(mood)) return genre
  }
  
  return null
}

const generateAIResponse = (userText, genre) => {
  if (!genre) {
    const suggestions = ['rock', 'pop', 'jazz', 'eletrônica', 'hip-hop', 'indie']
    return {
      content: `Posso te ajudar a encontrar música por gênero (${suggestions.join(', ')}) ou humor (feliz, relaxar, treinar, romântico, etc). Qual seu gênero favorito ou como você está se sentindo hoje? 🎵`,
      recommendations: null
    }
  }
  
  const data = musicDatabase[genre]
  const responses = [
    `Baseado no seu pedido, preparei uma seleção especial de ${genre}! ${data.description}`,
    `Encontrei essas gems de ${genre} que combinam perfeitamente com você! 🎶`,
    `Aqui está uma playlist curada de ${genre} especialmente para você:`,
    `Perfeito! Essas tracks de ${genre} vão te surpreender:`,
    `Selecionei os melhores hits de ${genre} para você aproveitar:`
  ]
  
  return {
    content: responses[Math.floor(Math.random() * responses.length)],
    recommendations: {
      genre: genre.charAt(0).toUpperCase() + genre.slice(1),
      tracks: data.tracks,
      artists: data.artists.slice(0, 6),
      albums: data.albums || [],
      description: data.description
    }
  }
}

const sendMessage = async () => {
  if (!canSend.value || isTyping.value) return
  
  const userText = inputMessage.value.trim()
  inputMessage.value = ''
  
  // Adicionar mensagem do usuário
  messages.value.push({
    id: Date.now(),
    type: 'user',
    content: userText,
    timestamp: new Date(),
    recommendations: null
  })
  
  await scrollToBottom()
  
  // Simular digitação da IA
  isTyping.value = true
  await scrollToBottom()
  
  // Detectar intenção e gerar resposta
  const genre = detectGenre(userText)
  
  setTimeout(async () => {
    isTyping.value = false
    const response = generateAIResponse(userText, genre)
    
    messages.value.push({
      id: Date.now() + 1,
      type: 'ai',
      content: response.content,
      timestamp: new Date(),
      recommendations: response.recommendations
    })
    
    await scrollToBottom()
  }, 1500 + Math.random() * 1000) // Variação natural no tempo de resposta
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

const playTrack = (track) => {
  if (currentTrack.value?.id === track.id) {
    isPlaying.value = !isPlaying.value
  } else {
    currentTrack.value = track
    isPlaying.value = true
  }
  showToast(`Tocando: ${track.title} - ${track.artist}`, 'success')
}

const playAll = (tracks) => {
  if (tracks.length > 0) {
    currentTrack.value = tracks[0]
    isPlaying.value = true
    showToast(`Playlist iniciada com ${tracks.length} músicas`, 'success')
  }
}

const togglePlay = () => {
  if (currentTrack.value) {
    isPlaying.value = !isPlaying.value
  }
}

const prevTrack = () => {
  showToast('⏮️ Música anterior', 'info')
}

const nextTrack = () => {
  showToast('⏭️ Próxima música', 'info')
}

const toggleFavorite = (track) => {
  if (favorites.value.has(track.id)) {
    favorites.value.delete(track.id)
    showToast('Removido dos favoritos', 'info')
  } else {
    favorites.value.add(track.id)
    showToast('Adicionado aos favoritos ❤️', 'success')
  }
}

const isFavorite = (track) => favorites.value.has(track.id)

const addToPlaylist = (track) => {
  showToast(`"${track.title}" adicionada à playlist`, 'success')
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
      recommendations: null
    }]
    showToast('Chat limpo com sucesso', 'success')
  }
}

const formatTime = (date) => {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// ============ LIFECYCLE ============
onMounted(() => {
  scrollToBottom()
  inputRef.value?.focus()
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
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
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

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
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

/* Now Playing Widget */
.now-playing {
  margin-top: auto;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
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
  transform: translateY(20px) scale(0.95);
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
}
</style>