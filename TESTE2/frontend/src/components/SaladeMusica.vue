<!-- MusicRoom.vue - Sala de Música Colaborativa com Deezer API -->
<template>
  <div class="music-room">
    <!-- Ambient Background -->
    <div class="ambient-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Header -->
    <header class="room-header">
      <div class="header-left">
        <button class="back-btn" @click="leaveRoom">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="room-info">
          <h1>{{ room.name }}</h1>
          <div class="room-meta">
            <span class="live-indicator">
              <span class="pulse"></span>
              AO VIVO
            </span>
            <span class="separator">•</span>
            <span>{{ roomListeners.length + 1 }} ouvindo</span>
            <span class="separator">•</span>
            <span class="room-id">ID: {{ room.id }}</span>
          </div>
        </div>
      </div>
      
      <div class="header-actions">
        <button class="action-btn" @click="openInviteModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Convidar
        </button>
      
      </div>
    </header>

    <div class="room-layout">
      <!-- Main Stage -->
      <main class="stage-area">
        <!-- Vinyl Player -->
        <div class="player-container" :class="{ 'playing': isPlaying }">
          <div class="vinyl-record" :style="{ animationPlayState: isPlaying ? 'running' : 'paused' }">
            <div class="record-grooves"></div>
            <div class="record-label">
              <img :src="currentTrack.cover || 'https://via.placeholder.com/300'" :alt="currentTrack.title" />
            </div>
          </div>
          
          <div class="tonearm" :class="{ 'playing': isPlaying }">
            <div class="tonearm-pivot"></div>
            <div class="tonearm-stick"></div>
            <div class="cartridge"></div>
          </div>

          <!-- Visualizer Rings -->
          <div class="visualizer-rings">
            <div v-for="n in 3" :key="n" class="ring" :style="{ animationDelay: `${n * 0.2}s` }"></div>
          </div>
        </div>

        <!-- Track Info -->
        <div class="track-info">
          <h2 class="track-title">{{ currentTrack.title || 'Nenhuma música tocando' }}</h2>
          <p class="track-artist">{{ currentTrack.artist || 'Adicione músicas à fila' }}</p>
          <div class="track-badges" v-if="currentTrack.id">
            <span class="badge explicit" v-if="currentTrack.explicit">E</span>
            <span class="badge quality">Hi-Res</span>
            <span class="badge sync" v-if="syncStatus === 'synced'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Sincronizado
            </span>
            <span class="badge deezer" v-if="currentTrack.deezerId">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              Deezer
            </span>
          </div>
        </div>

        <!-- Audio Player -->
        <audio 
          ref="audioPlayer" 
          :src="currentTrack.preview" 
          @timeupdate="updateTime"
          @ended="nextTrack"
          @loadedmetadata="onLoadedMetadata"
        ></audio>

        <!-- Progress Bar -->
        <div class="progress-section" v-if="currentTrack.id">
          <div class="time-current">{{ formatTime(currentTime) }}</div>
          <div class="progress-bar" @click="seekTo($event)" ref="progressBar">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }">
              <div class="progress-handle"></div>
            </div>
            <div class="waveform-bg">
              <div v-for="n in 50" :key="n" class="wave-bar" :style="{ height: `${Math.random() * 100}%` }"></div>
            </div>
          </div>
          <div class="time-total">{{ formatTime(currentTrack.duration || 30) }}</div>
        </div>

        <!-- Controls -->
        <div class="player-controls" v-if="currentTrack.id">
          <button class="control-btn shuffle" :class="{ 'active': shuffle }" @click="toggleShuffle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 3 21 3 21 8"/>
              <line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/>
              <line x1="15" y1="15" x2="21" y2="21"/>
              <line x1="4" y1="4" x2="9" y2="9"/>
            </svg>
          </button>
          
          <button class="control-btn previous" @click="previousTrack">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button class="control-btn play-pause main" @click="togglePlay">
            <div class="play-icon" v-if="!isPlaying">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div class="pause-icon" v-else>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </div>
          </button>

          <button class="control-btn next" @click="nextTrack">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

          <button class="control-btn repeat" :class="{ 'active': repeatMode !== 'off', 'one': repeatMode === 'one' }" @click="toggleRepeat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span v-if="repeatMode === 'one'" class="repeat-badge">1</span>
          </button>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <p>Adicione músicas da Deezer para começar</p>
          <button class="add-music-btn-large" @click="showAddMusic = true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar Música
          </button>
        </div>
      </main>

      <!-- Sidebar -->
      <aside class="room-sidebar">
        <!-- Listeners -->
        <div class="listeners-section">
          <div class="section-header">
            <h3>Ouvindo agora</h3>
            <span class="listener-count">{{ roomListeners.length + 1 }}</span>
          </div>
          
          <div class="listeners-list">
            <!-- Host -->
            <div class="listener-item host">
              <div class="listener-avatar">
                <img :src="currentUser.avatar" :alt="currentUser.name" />
                <div class="host-badge">HOST</div>
              </div>
              <div class="listener-info">
                <span class="listener-name">{{ currentUser.name }} (Você)</span>
                <span class="listener-status">{{ isPlaying ? 'Tocando' : 'Pausado' }}</span>
              </div>
              <div class="listener-wave" v-if="isPlaying">
                <span v-for="n in 4" :key="n"></span>
              </div>
            </div>

            <!-- Other Listeners -->
            <div v-for="listener in roomListeners" :key="listener.id" class="listener-item">
              <div class="listener-avatar">
                <img :src="listener.avatar" :alt="listener.name" />
                <div v-if="listener.isFriend" class="friend-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </div>
              <div class="listener-info">
                <span class="listener-name">{{ listener.name }}</span>
                <span class="listener-status">{{ listener.status }}</span>
              </div>
              <div class="listener-wave" v-if="isPlaying && listener.synced">
                <span v-for="n in 4" :key="n"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Queue -->
        <div class="queue-section">
          <div class="section-header">
            <h3>Fila de reprodução</h3>
            <button class="clear-btn" @click="clearQueue" v-if="queue.length > 0">Limpar</button>
          </div>
          
          <div class="queue-list" ref="queueList" v-if="queue.length > 0">
            <div 
              v-for="(track, index) in queue" 
              :key="track.id"
              class="queue-item"
              :class="{ 'active': index === 0, 'next': index === 1 }"
              draggable="true"
              @dragstart="dragStart($event, index)"
              @dragover.prevent
              @drop="drop($event, index)"
            >
              <div class="queue-number">{{ index + 1 }}</div>
              <img :src="track.cover" class="queue-cover" />
              <div class="queue-info">
                <span class="queue-title">{{ track.title }}</span>
                <span class="queue-artist">{{ track.artist }}</span>
              </div>
              <div class="queue-actions">
                <span class="queue-duration">{{ formatTime(track.duration) }}</span>
                <button class="remove-btn" @click="removeFromQueue(index)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-queue">
            <p>Fila vazia</p>
          </div>

          <button class="add-music-btn" @click="showAddMusic = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar música
          </button>
        </div>

        <!-- Chat Preview -->
        <div class="chat-section">
          <div class="section-header">
            <h3>Chat da sala</h3>
            <span class="unread-badge" v-if="unreadMessages > 0">{{ unreadMessages }}</span>
          </div>
          <div class="chat-messages" ref="chatContainer">
            <div 
              v-for="msg in recentMessages" 
              :key="msg.id" 
              class="chat-message"
              :class="{ 'self': msg.userId === currentUser.id }"
            >
              <img :src="msg.avatar" class="msg-avatar" />
              <div class="msg-content">
                <span class="msg-author">{{ msg.userName }}</span>
                <p class="msg-text">{{ msg.text }}</p>
                <span class="msg-time">{{ formatTimeAgo(msg.timestamp) }}</span>
              </div>
            </div>
          </div>
          <div class="chat-input">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage"
              placeholder="Enviar mensagem..."
              type="text"
            />
            <button @click="sendMessage" :disabled="!newMessage.trim()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Invite Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
          <div class="modal-content invite-modal">
            <div class="modal-header">
              <h3>Convidar amigos</h3>
              <button class="close-btn" @click="showInviteModal = false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div class="invite-link">
              <label>Link da sala</label>
              <div class="link-input-group">
                <input type="text" :value="roomUrl" readonly ref="linkInput" />
                <button @click="copyLink" class="copy-btn">
                  <span v-if="!copied">Copiar</span>
                  <span v-else class="copied">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Copiado!
                  </span>
                </button>
              </div>
              <p class="invite-hint">Envie este link por email, WhatsApp ou qualquer lugar. Quem clicar entrará automaticamente nesta sala.</p>
            </div>

            <div class="share-options">
              <h4>Compartilhar via</h4>
              <div class="share-buttons">
                <button @click="shareVia('whatsapp')" class="share-btn whatsapp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <button @click="shareVia('email')" class="share-btn email">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Email
                </button>
                <button @click="shareVia('telegram')" class="share-btn telegram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </button>
              </div>
            </div>

            <div class="friends-list" v-if="onlineFriends.length > 0">
              <h4>Amigos online</h4>
              <div v-for="friend in onlineFriends" :key="friend.id" class="friend-item">
                <img :src="friend.avatar" class="friend-avatar" />
                <div class="friend-info">
                  <span class="friend-name">{{ friend.name }}</span>
                  <span class="friend-status">{{ friend.listeningTo || 'Online' }}</span>
                </div>
                <button 
                  class="invite-btn" 
                  :class="{ 'invited': friend.invited }"
                  @click="inviteFriend(friend)"
                >
                  {{ friend.invited ? 'Convidado' : 'Convidar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add Music Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddMusic" class="modal-overlay" @click.self="showAddMusic = false">
          <div class="modal-content add-music-modal">
            <div class="modal-header">
              <h3>Adicionar à fila</h3>
              <button class="close-btn" @click="showAddMusic = false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div class="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                v-model="searchQuery" 
                @input="debouncedSearch"
                placeholder="Buscar músicas, artistas ou álbuns na Deezer..."
                type="text"
                autofocus
              />
              <div v-if="isSearching" class="search-loader"></div>
            </div>

            <div class="search-results">
              <div v-if="searchResults.length === 0 && searchQuery && !isSearching" class="no-results">
                Nenhum resultado encontrado na Deezer
              </div>
              
              <div v-for="track in searchResults" :key="track.id" class="search-result-item">
                <img :src="track.album.cover_medium || track.album.cover" class="result-cover" />
                <div class="result-info">
                  <span class="result-title">{{ track.title }}</span>
                  <span class="result-artist">{{ track.artist.name }}</span>
                </div>
                <button class="add-btn" @click="addToQueue(track)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="quick-add" v-if="!searchQuery">
              <h4>Top Brasil - Deezer</h4>
              <div class="quick-tracks">
                <div v-for="track in deezerChart" :key="track.id" class="quick-track" @click="addToQueue(track)">
                  <img :src="track.album.cover_medium || track.album.cover" />
                  <div class="quick-info">
                    <span>{{ track.title }}</span>
                    <small>{{ track.artist.name }}</small>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Join Modal (para quem entra pelo link) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showJoinModal" class="modal-overlay">
          <div class="modal-content join-modal">
            <div class="modal-header">
              <h3>Entrar na Sala</h3>
            </div>
            <div class="join-content">
              <div class="room-preview">
                <div class="vinyl-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v20"/>
                  </svg>
                </div>
                <h2>{{ room.name }}</h2>
                <p>{{ roomListeners.length + 1 }} pessoas ouvindo</p>
                <div class="current-track-preview" v-if="currentTrack.id">
                  <small>Tocando agora:</small>
                  <strong>{{ currentTrack.title }}</strong>
                  <span>{{ currentTrack.artist }}</span>
                </div>
              </div>
              
              <div class="join-form">
                <input 
                  v-model="joinUserName" 
                  placeholder="Seu nome"
                  type="text"
                  maxlength="20"
                />
                <button @click="joinRoom" :disabled="!joinUserName.trim()" class="join-btn">
                  Entrar na Sala
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

// Room State - agora com ID da URL
const room = ref({
  name: 'Sessão Chill Vibes 🎵',
  id: '',
  createdAt: new Date()
})

const currentUser = ref({
  id: 'user-' + Math.random().toString(36).substr(2, 9),
  name: 'Você',
  avatar: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70)
})

// Player State
const isPlaying = ref(false)
const currentTime = ref(0)
const shuffle = ref(false)
const repeatMode = ref('off') // 'off', 'all', 'one'
const syncStatus = ref('synced')
const audioPlayer = ref(null)

const currentTrack = ref({
  id: null,
  title: '',
  artist: '',
  cover: '',
  duration: 0,
  explicit: false,
  deezerId: null,
  preview: ''
})

// Queue
const queue = ref([])

// Listeners
const roomListeners = ref([
  {
    id: 'user-2',
    name: 'Maria Silva',
    avatar: 'https://i.pravatar.cc/150?img=5',
    status: 'Sincronizado',
    synced: true,
    isFriend: true
  },
  {
    id: 'user-3',
    name: 'João Pedro',
    avatar: 'https://i.pravatar.cc/150?img=3',
    status: 'Sincronizado',
    synced: true,
    isFriend: true
  }
])

// Chat
const messages = ref([
  {
    id: 1,
    userId: 'user-2',
    userName: 'Maria Silva',
    avatar: 'https://i.pravatar.cc/150?img=5',
    text: 'Essa música é incrível! 🎵',
    timestamp: Date.now() - 300000
  },
  {
    id: 2,
    userId: 'user-3',
    userName: 'João Pedro',
    avatar: 'https://i.pravatar.cc/150?img=3',
    text: 'Concordo! Adoro o álbum todo',
    timestamp: Date.now() - 240000
  }
])

const newMessage = ref('')
const unreadMessages = ref(0)

// Modals
const showInviteModal = ref(false)
const showAddMusic = ref(false)
const showSettings = ref(false)
const showJoinModal = ref(false)

// Search Deezer
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const deezerChart = ref([])
let searchTimeout = null

// Join
const joinUserName = ref('')

// Invite
const copied = ref(false)

// Friends
const onlineFriends = ref([
  { id: 'f1', name: 'Carlos Mendes', avatar: 'https://i.pravatar.cc/150?img=12', listeningTo: 'Ouvindo Jazz', invited: false },
  { id: 'f2', name: 'Fernanda Lima', avatar: 'https://i.pravatar.cc/150?img=8', listeningTo: null, invited: false },
  { id: 'f3', name: 'Pedro Santos', avatar: 'https://i.pravatar.cc/150?img=15', listeningTo: 'Ouvindo Rock', invited: false }
])

// URL da sala
const roomUrl = computed(() => {
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?room=${room.value.id}`
})

const progressPercent = computed(() => {
  if (!currentTrack.value.duration) return 0
  return (currentTime.value / currentTrack.value.duration) * 100
})
const DEEZER_API = 'https://api.deezer.com'

// Proxies comuns (um pode cair; ter fallback ajuda muito)
const PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
]

async function fetchJsonDeezer(pathAndQuery) {
  const url = `${DEEZER_API}${pathAndQuery}`

  let lastError = null
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy(url))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      lastError = e
    }
  }

  console.error('Falha ao acessar Deezer via proxy:', lastError)
  return { data: [] }
}


// Computed
const recentMessages = computed(() => messages.value.slice(-10))

// Methods
const togglePlay = () => {
  if (!audioPlayer.value || !currentTrack.value.id) return
  
  if (isPlaying.value) {
    audioPlayer.value.pause()
  } else {
    audioPlayer.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const toggleShuffle = () => shuffle.value = !shuffle.value

const toggleRepeat = () => {
  const modes = ['off', 'all', 'one']
  const currentIndex = modes.indexOf(repeatMode.value)
  repeatMode.value = modes[(currentIndex + 1) % modes.length]
}

const previousTrack = () => {
  // Implementar histórico
}

const nextTrack = () => {
  if (queue.value.length > 0) {
    const next = queue.value.shift()
    loadTrack(next)
  } else {
    isPlaying.value = false
    currentTime.value = 0
  }
}

const loadTrack = (track) => {
  currentTrack.value = {
    id: track.id,
    title: track.title,
    artist: track.artist.name || track.artist,
    cover: track.album?.cover_medium || track.album?.cover || track.cover,
    duration: track.duration,
    explicit: track.explicit_lyrics || false,
    deezerId: track.id,
    preview: track.preview
  }
  currentTime.value = 0
  
  nextTick(() => {
    if (audioPlayer.value) {
      audioPlayer.value.load()
      if (isPlaying.value) {
        audioPlayer.value.play()
      }
    }
  })
}

const seekTo = (event) => {
  if (!audioPlayer.value || !currentTrack.value.duration) return
  const bar = event.currentTarget
  const clickPosition = event.offsetX / bar.offsetWidth
  const newTime = clickPosition * currentTrack.value.duration
  audioPlayer.value.currentTime = newTime
  currentTime.value = newTime
}

const updateTime = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
  }
}

const onLoadedMetadata = () => {
  if (audioPlayer.value) {
    currentTrack.value.duration = audioPlayer.value.duration
  }
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatTimeAgo = (timestamp) => {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `${minutes}min`
  return `${Math.floor(minutes / 60)}h`
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  messages.value.push({
    id: Date.now(),
    userId: currentUser.value.id,
    userName: currentUser.value.name,
    avatar: currentUser.value.avatar,
    text: newMessage.value,
    timestamp: Date.now()
  })
  newMessage.value = ''
  nextTick(() => {
    const container = document.querySelector('.chat-messages')
    if (container) container.scrollTop = container.scrollHeight
  })
}

// Deezer API Integration
const searchDeezer = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    // endpoint mais comum: /search?q=
    const data = await fetchJsonDeezer(`/search?q=${encodeURIComponent(searchQuery.value)}&limit=10`)
    searchResults.value = data.data || []
  } catch (error) {
    console.error('Erro ao buscar no Deezer:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}


const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchDeezer, 300)
}

const fetchDeezerChart = async () => {
  try {
    const data = await fetchJsonDeezer(`/chart/0/tracks?limit=5`)
    deezerChart.value = data.data || []
  } catch (error) {
    console.error('Erro ao carregar chart:', error)
    deezerChart.value = []
  }
}


const addToQueue = (track) => {
  const trackData = {
    id: track.id,
    title: track.title,
    artist: track.artist.name || track.artist,
    cover: track.album?.cover_medium || track.album?.cover || track.cover,
    duration: track.duration,
    explicit: track.explicit_lyrics || false,
    deezerId: track.id,
    preview: track.preview
  }
  
  queue.value.push(trackData)
  showAddMusic.value = false
  searchQuery.value = ''
  searchResults.value = []
  
  // Se não estiver tocando nada, começa a tocar
  if (!currentTrack.value.id) {
    nextTrack()
  }
}

const removeFromQueue = (index) => {
  queue.value.splice(index, 1)
}

const clearQueue = () => {
  if (confirm('Limpar toda a fila?')) {
    queue.value = []
  }
}

// Invite System
const openInviteModal = () => {
  showInviteModal.value = true
  // Gerar ID único se não tiver
  if (!room.value.id) {
    room.value.id = generateRoomId()
    updateUrlWithRoomId()
  }
}

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const updateUrlWithRoomId = () => {
  const url = new URL(window.location.href)
  url.searchParams.set('room', room.value.id)
  window.history.replaceState({}, '', url)
}

const copyLink = () => {
  navigator.clipboard.writeText(roomUrl.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

const shareVia = (platform) => {
  const text = `🎵 Entre na minha sala do Music Room! Estamos ouvindo: ${currentTrack.value.title || 'músicas incríveis'}\n\n${roomUrl.value}`
  
  switch(platform) {
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
      break
    case 'email':
      window.location.href = `mailto:?subject=Convite para Sala de Mús&body=${encodeURIComponent(text)}`
      break
    case 'telegram':
      window.open(`https://t.me/share/url?url=${encodeURIComponent(roomUrl.value)}&text=${encodeURIComponent(text)}`, '_blank')
      break
  }
}

const inviteFriend = (friend) => {
  friend.invited = true
  // Aqui você poderia enviar notificação real para o amigo
  setTimeout(() => friend.invited = false, 3000)
}

const leaveRoom = () => {
  if (confirm('Sair da sala?')) {
    // Limpar URL
    const url = new URL(window.location.href)
    url.searchParams.delete('room')
    window.history.replaceState({}, '', url)
    window.location.reload()
  }
}

// Join Room Logic
const checkRoomAccess = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const roomId = urlParams.get('room')
  
  if (roomId) {
    room.value.id = roomId
    // Verificar se é o dono ou convidado
    const isOwner = localStorage.getItem(`room_${roomId}_owner`) === 'true'
    
    if (!isOwner) {
      // Mostrar modal para entrar
      showJoinModal.value = true
      // Carregar dados da sala do backend/localStorage
      loadRoomData(roomId)
    }
  } else {
    // Criar nova sala
    room.value.id = generateRoomId()
    localStorage.setItem(`room_${room.value.id}_owner`, 'true')
    updateUrlWithRoomId()
  }
}

const loadRoomData = (roomId) => {
  // Simular carregamento de dados da sala
  const savedRoom = localStorage.getItem(`room_${roomId}_data`)
  if (savedRoom) {
    const data = JSON.parse(savedRoom)
    room.value.name = data.name || room.value.name
    if (data.currentTrack) {
      currentTrack.value = data.currentTrack
    }
    if (data.queue) {
      queue.value = data.queue
    }
  }
}

const joinRoom = () => {
  if (!joinUserName.value.trim()) return
  
  currentUser.value.name = joinUserName.value
  showJoinModal.value = false
  
  // Adicionar à lista de ouvintes (simulado)
  const newListener = {
    id: currentUser.value.id,
    name: joinUserName.value,
    avatar: currentUser.value.avatar,
    status: 'Entrou agora',
    synced: true,
    isFriend: false
  }
  
  // Notificar outros usuários (em implementação real, usar WebSocket)
  messages.value.push({
    id: Date.now(),
    userId: 'system',
    userName: 'Sistema',
    avatar: 'https://via.placeholder.com/150',
    text: `${joinUserName.value} entrou na sala!`,
    timestamp: Date.now()
  })
}

const saveRoomState = () => {
  // Salvar estado da sala para quem entrar pelo link
  if (room.value.id) {
    const roomData = {
      name: room.value.name,
      currentTrack: currentTrack.value,
      queue: queue.value,
      lastUpdate: Date.now()
    }
    localStorage.setItem(`room_${room.value.id}_data`, JSON.stringify(roomData))
  }
}

// Drag and drop
const dragStartIndex = ref(null)

const dragStart = (event, index) => {
  dragStartIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
}

const drop = (event, dropIndex) => {
  const dragIndex = dragStartIndex.value
  if (dragIndex === null || dragIndex === dropIndex) return
  
  const item = queue.value.splice(dragIndex, 1)[0]
  queue.value.splice(dropIndex, 0, item)
  dragStartIndex.value = null
}

// Lifecycle
onMounted(() => {
  checkRoomAccess()
  fetchDeezerChart()
  
  // Salvar estado periodicamente
  setInterval(saveRoomState, 5000)
  
  // Simular novos ouvintes entrando (para demo)
  setTimeout(() => {
    if (roomListeners.value.length < 5 && Math.random() > 0.5) {
      roomListeners.value.push({
        id: 'user-' + Date.now(),
        name: 'Novo Ouvinte',
        avatar: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70),
        status: 'Sincronizado',
        synced: true,
        isFriend: false
      })
    }
  }, 10000)
})

onUnmounted(() => {
  clearTimeout(searchTimeout)
})
</script>

<style scoped>
/* CSS Variables */
:root {
  --primary: #1db954;
  --primary-dark: #1ed760;
  --bg-dark: #0a0a0a;
  --bg-card: #121212;
  --bg-hover: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --border: #2a2a2a;
  --accent: #ff6b6b;
  --gradient-1: #667eea;
  --gradient-2: #764ba2;
  --gradient-3: #f093fb;
}

/* Base */
.music-room {
  min-height: 100vh;
  background: var(--bg-dark);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Ambient Background */
.ambient-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 20s infinite ease-in-out;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, var(--gradient-1), var(--gradient-2));
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, var(--gradient-3), var(--accent));
  bottom: -150px;
  right: -150px;
  animation-delay: -5s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--primary), var(--gradient-1));
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Header */
.room-header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.room-info h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.room-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.room-id {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff4757;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

.pulse {
  width: 8px;
  height: 8px;
  background: #ff4757;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.action-btn.settings {
  padding: 0.625rem;
}

/* Layout */
.room-layout {
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Stage Area */
.stage-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
}

/* Vinyl Player */
.player-container {
  position: relative;
  width: 400px;
  height: 400px;
  margin-bottom: 3rem;
}

.vinyl-record {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 0 0 2px rgba(255, 255, 255, 0.1);
  animation: spin 3s linear infinite;
  animation-play-state: paused;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.record-grooves {
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    transparent 0,
    transparent 2px,
    rgba(255, 255, 255, 0.03) 3px,
    rgba(255, 255, 255, 0.03) 4px
  );
}

.record-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #1a1a1a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.record-label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.record-label::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #0a0a0a;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* Tonearm */
.tonearm {
  position: absolute;
  top: -20px;
  right: 60px;
  width: 120px;
  height: 200px;
  transform-origin: top center;
  transform: rotate(-30deg);
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.tonearm.playing {
  transform: rotate(0deg);
}

.tonearm-pivot {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: linear-gradient(145deg, #c0c0c0, #808080);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tonearm-stick {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 160px;
  background: linear-gradient(90deg, #d0d0d0, #a0a0a0);
  border-radius: 4px;
}

.cartridge {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 24px;
  background: #ff4757;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Visualizer Rings */
.visualizer-rings {
  position: absolute;
  inset: -40px;
  pointer-events: none;
}

.ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(29, 185, 84, 0.3);
  border-radius: 50%;
  animation: ripple 3s infinite ease-out;
  opacity: 0;
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

/* Track Info */
.track-info {
  text-align: center;
  margin-bottom: 2rem;
}

.track-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff 0%, #b3b3b3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.track-artist {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.track-badges {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.explicit {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.badge.quality {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.badge.sync {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(29, 185, 84, 0.2);
  color: var(--primary);
}

.badge.deezer {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #ff0092;
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  color: var(--text-secondary);
}

.empty-state p {
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
}

.add-music-btn-large {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--primary);
  border: none;
  border-radius: 30px;
  color: black;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-music-btn-large:hover {
  transform: scale(1.05);
  background: var(--primary-dark);
}

/* Progress Section */
.progress-section {
  width: 100%;
  max-width: 600px;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.time-current, .time-total {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 45px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-dark));
  border-radius: 3px;
  position: relative;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%) scale(0);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;
}

.progress-bar:hover .progress-handle {
  transform: translateY(-50%) scale(1);
}

.waveform-bg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
  opacity: 0.3;
  pointer-events: none;
}

.wave-bar {
  flex: 1;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
  min-height: 20%;
}

/* Controls */
.player-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.control-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  color: var(--text-primary);
  transform: scale(1.1);
}

.control-btn.main {
  width: 72px;
  height: 72px;
  background: white;
  color: black;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.3);
}

.control-btn.main:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(255, 255, 255, 0.4);
}

.control-btn.active {
  color: var(--primary);
  position: relative;
}

.control-btn.repeat.one::after {
  content: '1';
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 10px;
  font-weight: 700;
  background: var(--primary);
  color: black;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Sidebar */
.room-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.listeners-section,
.queue-section,
.chat-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  backdrop-filter: blur(10px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin: 0;
}

.listener-count,
.unread-badge {
  background: var(--primary);
  color: black;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 0.3s;
}

.clear-btn:hover {
  color: var(--accent);
}

/* Listeners List */
.listeners-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.listener-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 12px;
  transition: background 0.3s;
}

.listener-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.listener-avatar {
  position: relative;
  width: 40px;
  height: 40px;
}

.listener-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.host-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: black;
  font-size: 0.5rem;
  font-weight: 800;
  padding: 2px 4px;
  border-radius: 4px;
  border: 2px solid var(--bg-card);
}

.friend-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--primary);
  color: black;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-card);
}

.listener-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.listener-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.listener-status {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.listener-wave {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 20px;
}

.listener-wave span {
  width: 3px;
  background: var(--primary);
  border-radius: 2px;
  animation: wave 1s infinite ease-in-out;
}

.listener-wave span:nth-child(1) { animation-delay: 0s; height: 30%; }
.listener-wave span:nth-child(2) { animation-delay: 0.1s; height: 60%; }
.listener-wave span:nth-child(3) { animation-delay: 0.2s; height: 40%; }
.listener-wave span:nth-child(4) { animation-delay: 0.3s; height: 80%; }

@keyframes wave {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}

/* Queue */
.queue-list {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.empty-queue {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  cursor: move;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.queue-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.queue-item.active {
  background: rgba(29, 185, 84, 0.1);
  border-color: rgba(29, 185, 84, 0.3);
}

.queue-item.next {
  opacity: 0.7;
}

.queue-number {
  width: 24px;
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.queue-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.queue-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.queue-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-artist {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.queue-duration {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.remove-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0;
  transition: all 0.3s;
}

.queue-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: var(--accent);
}

.add-music-btn {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.add-music-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Chat */
.chat-messages {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
}

.chat-message {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.chat-message.self {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.msg-content {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  max-width: 200px;
}

.chat-message.self .msg-content {
  background: var(--primary);
  color: black;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 4px;
}

.msg-author {
  font-size: 0.75rem;
  font-weight: 700;
  opacity: 0.7;
  display: block;
  margin-bottom: 0.25rem;
}

.msg-text {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

.msg-time {
  font-size: 0.625rem;
  opacity: 0.5;
  display: block;
  margin-top: 0.25rem;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
  transition: all 0.3s;
}

.chat-input input:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.chat-input input::placeholder {
  color: var(--text-secondary);
}

.chat-input button {
  width: 36px;
  height: 36px;
  background: var(--primary);
  border: none;
  border-radius: 50%;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.chat-input button:hover:not(:disabled) {
  transform: scale(1.1);
  background: var(--primary-dark);
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  background: #121212;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
}

/* Invite Modal */
.invite-link {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.invite-link label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.link-input-group {
  display: flex;
  gap: 0.5rem;
}

.link-input-group input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: monospace;
}

.copy-btn {
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.copy-btn:hover {
  background: rgba(255, 255, 200, 0.2);
}

.copied {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--primary);
}

.invite-hint {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.share-options {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.share-options h4 {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.share-buttons {
  display: flex;
  gap: 0.75rem;
}

.share-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.share-btn.whatsapp {
  background: #25d366;
  color: white;
}

.share-btn.email {
  background: #ea4335;
  color: white;
}

.share-btn.telegram {
  background: #0088cc;
  color: white;
}

.share-btn:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

.friends-list {
  padding: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.friends-list h4 {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  transition: background 0.3s;
}

.friend-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.friend-name {
  font-weight: 600;
  color: var(--text-primary);
}

.friend-status {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.invite-btn {
  padding: 0.5rem 1rem;
  background: var(--primary);
  border: none;
  border-radius: 20px;
  color: black;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.invite-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.invite-btn.invited {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  cursor: default;
}

/* Add Music Modal */
.add-music-modal {
  max-width: 520px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.search-box svg {
  color: var(--text-secondary);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
}

.search-box input::placeholder {
  color: var(--text-secondary);
}

.search-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.result-cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-title {
  font-weight: 600;
  color: var(--text-primary);
}

.result-artist {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.add-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s;
}

.search-result-item:hover .add-btn {
  opacity: 1;
}

.add-btn:hover {
  background: var(--primary);
  color: black;
}

.quick-add {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-add h4 {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.quick-tracks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quick-track {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.quick-track:hover {
  background: rgba(255, 255, 255, 0.05);
}

.quick-track img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.quick-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.quick-info span {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.quick-info small {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.quick-track svg {
  color: var(--text-secondary);
  opacity: 0;
  transition: all 0.3s;
}

.quick-track:hover svg {
  opacity: 1;
  color: var(--primary);
}

/* Join Modal */
.join-modal {
  max-width: 420px;
}

.join-content {
  padding: 2rem;
}

.room-preview {
  text-align: center;
  margin-bottom: 2rem;
}

.vinyl-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.room-preview h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.room-preview p {
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.current-track-preview {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.current-track-preview small {
  display: block;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.current-track-preview strong {
  display: block;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.current-track-preview span {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.join-form input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  text-align: center;
}

.join-form input:focus {
  border-color: var(--primary);
}

.join-btn {
  padding: 1rem;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: black;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.join-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.join-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .room-layout {
    grid-template-columns: 1fr;
  }
  
  .room-sidebar {
    order: 2;
  }
  
  .stage-area {
    min-height: auto;
    padding: 1rem;
  }
  
  .player-container {
    width: 300px;
    height: 300px;
  }
  
  .track-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 640px) {
  .room-header {
    padding: 1rem;
  }
  
  .room-info h1 {
    font-size: 1.125rem;
  }
  
  .action-btn span {
    display: none;
  }
  
  .player-container {
    width: 250px;
    height: 250px;
  }
  
  .control-btn.main {
    width: 60px;
    height: 60px;
  }
  
  .share-buttons {
    flex-direction: column;
  }
}
</style>