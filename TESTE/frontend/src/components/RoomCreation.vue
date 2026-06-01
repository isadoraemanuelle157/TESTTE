<!-- RoomCreation.vue - Página de Criação de Salas de Música -->
<template>
  <div class="room-creation-page">
    <!-- Ambient Background -->
    <div class="ambient-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Header -->
    <header class="creation-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1>Criar Sala de Música</h1>
      </div>
      <div class="user-status" v-if="isLoggedIn">
        <span>{{ currentUser.name }}</span>
      </div>
  <button v-else class="login-prompt-btn" @click="$router.push('/login')">
  Fazer Login
</button>
    </header>

    <main class="creation-content">
      <!-- Limit Warning for Guests -->
      <div v-if="!isLoggedIn && userRoomsCount >= 2" class="limit-warning">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>Você atingiu o limite de <strong>2 salas</strong> sem login. 
          <a @click="$router.push('/login')">Faça login</a> para criar salas ilimitadas com Spotify.</p>
      </div>

      <!-- Creation Form -->
      <div class="creation-form" :class="{ 'disabled': !isLoggedIn && userRoomsCount >= 2 }">
        <!-- Room Name -->
        <div class="form-group">
          <label>Nome da Sala <span class="required">*</span></label>
          <input 
            v-model="roomForm.name" 
            placeholder="Ex: Sessão Chill Vibes 🎵"
            maxlength="50"
            :disabled="!canCreate"
          />
          <span class="char-count">{{ roomForm.name.length }}/50</span>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label>Descrição</label>
          <textarea 
            v-model="roomForm.description" 
            placeholder="Descreva o tema da sala..."
            maxlength="200"
            rows="3"
            :disabled="!canCreate"
          ></textarea>
          <span class="char-count">{{ roomForm.description.length }}/200</span>
        </div>

        <!-- Visibility Toggle -->
        <div class="form-group">
          <label>Visibilidade da Sala</label>
          <div class="visibility-options">
            <button 
              class="visibility-btn"
              :class="{ 'active': roomForm.isPublic }"
              @click="roomForm.isPublic = true"
              :disabled="!canCreate"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <div class="visibility-info">
                <strong>Pública</strong>
                <span>Qualquer pessoa pode entrar pelo link</span>
              </div>
            </button>
            
            <button 
              class="visibility-btn"
              :class="{ 'active': !roomForm.isPublic }"
              @click="roomForm.isPublic = false"
              :disabled="!canCreate"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <div class="visibility-info">
                <strong>Privada</strong>
                <span>Apenas convidados podem entrar</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Music Source Indicator -->
        <div class="form-group">
          <label>Fonte de Música</label>
          <div class="source-badge" :class="{ 'premium': isLoggedIn }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path v-if="isLoggedIn" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              <path v-else d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span v-if="isLoggedIn">
              <strong>Spotify</strong> — Músicas completas + Deezer
            </span>
            <span v-else>
              <strong>Deezer</strong> — Apenas previews (30s)
            </span>
          </div>
          <p v-if="!isLoggedIn" class="source-hint">
            🔒 <a @click="$router.push('/login')">Conecte-se</a> para ouvir músicas completas do Spotify
          </p>
        </div>

        <!-- Invite Section (only for private rooms or always available) -->
        <div class="form-group" v-if="!roomForm.isPublic || true">
          <label>Convidar Amigos</label>
          <div class="invite-section">
            <!-- Tabs -->
            <div class="invite-tabs">
              <button 
                class="tab-btn" 
                :class="{ 'active': inviteTab === 'followers' }"
                @click="inviteTab = 'followers'"
                :disabled="!isLoggedIn"
              >
                Seguidores
                <span class="tab-count" v-if="isLoggedIn">{{ followers.length }}</span>
                <span class="tab-count" v-else>🔒</span>
              </button>
              <button 
                class="tab-btn" 
                :class="{ 'active': inviteTab === 'following' }"
                @click="inviteTab = 'following'"
                :disabled="!isLoggedIn"
              >
                Seguindo
                <span class="tab-count" v-if="isLoggedIn">{{ following.length }}</span>
                <span class="tab-count" v-else>🔒</span>
              </button>
            </div>

            <!-- Login required message -->
            <div v-if="!isLoggedIn" class="login-required-msg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p>Faça login para convidar seus seguidores e seguindo</p>
              <button class="login-btn-small" @click="$router.push('/login')">Entrar</button>
            </div>

            <!-- Followers List -->
            <div v-else-if="inviteTab === 'followers'" class="friends-list">
              <div v-if="followers.length === 0" class="empty-friends">
                <p>Você ainda não tem seguidores</p>
              </div>
              <div 
                v-for="friend in followers" 
                :key="friend.id"
                class="friend-item"
                :class="{ 'selected': selectedInvites.has(friend.id) }"
                @click="toggleInvite(friend.id)"
              >
                <img :src="friend.avatar" class="friend-avatar" />
                <div class="friend-info">
                  <span class="friend-name">{{ friend.name }}</span>
                  <span class="friend-username">@{{ friend.username }}</span>
                </div>
                <div class="check-indicator" v-if="selectedInvites.has(friend.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Following List -->
            <div v-else class="friends-list">
              <div v-if="following.length === 0" class="empty-friends">
                <p>Você ainda não segue ninguém</p>
              </div>
              <div 
                v-for="friend in following" 
                :key="friend.id"
                class="friend-item"
                :class="{ 'selected': selectedInvites.has(friend.id) }"
                @click="toggleInvite(friend.id)"
              >
                <img :src="friend.avatar" class="friend-avatar" />
                <div class="friend-info">
                  <span class="friend-name">{{ friend.name }}</span>
                  <span class="friend-username">@{{ friend.username }}</span>
                </div>
                <div class="check-indicator" v-if="selectedInvites.has(friend.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Selected Count -->
            <div v-if="isLoggedIn && selectedInvites.size > 0" class="selected-count">
              {{ selectedInvites.size }} pessoa(s) selecionada(s)
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          class="create-room-btn"
          :disabled="!canCreate || !roomForm.name.trim() || isCreating"
          @click="createRoom"
        >
          <span v-if="isCreating" class="loader"></span>
          <span v-else>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Criar Sala
          </span>
        </button>
      </div>

      <!-- My Rooms List -->
      <div class="my-rooms-section" v-if="myRooms.length > 0">
        <h2>Minhas Salas</h2>
        <div class="rooms-grid">
          <div 
            v-for="room in myRooms" 
            :key="room.id"
            class="room-card"
            @click="enterRoom(room.id)"
          >
            <div class="room-card-bg" :style="{ background: room.gradient || 'linear-gradient(135deg, #667eea, #764ba2)' }">
              <div class="vinyl-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
            </div>
            <div class="room-card-info">
              <h3>{{ room.name }}</h3>
              <div class="room-card-meta">
                <span class="visibility-badge" :class="{ 'public': room.isPublic }">
                  {{ room.isPublic ? '🌐 Pública' : '🔒 Privada' }}
                </span>
                <span class="listener-count">{{ room.listeners || 0 }} ouvindo</span>
              </div>
              <div class="room-card-source">
                <span v-if="room.source === 'spotify'" class="spotify-tag">Spotify</span>
                <span v-else class="deezer-tag">Deezer</span>
              </div>
            </div>
            <button class="share-room-btn" @click.stop="shareRoom(room)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Share Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showShareModal" class="modal-overlay" @click.self="showShareModal = false">
          <div class="modal-content share-modal">
            <div class="modal-header">
              <h3>Compartilhar Sala</h3>
              <button class="close-btn" @click="showShareModal = false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="share-content" v-if="shareRoomData">
              <div class="share-preview">
                <div class="share-vinyl" :style="{ background: shareRoomData.gradient }">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h4>{{ shareRoomData.name }}</h4>
                <p>{{ shareRoomData.isPublic ? 'Sala Pública' : 'Sala Privada' }}</p>
              </div>
              
              <div class="share-link-box">
                <input :value="shareRoomData.url" readonly ref="shareLinkInput" />
                <button @click="copyShareLink" :class="{ 'copied': copiedLink }">
                  {{ copiedLink ? 'Copiado!' : 'Copiar' }}
                </button>
              </div>

              <div class="share-buttons">
                <button class="share-btn whatsapp" @click="shareVia('whatsapp')">
                  WhatsApp
                </button>
                <button class="share-btn telegram" @click="shareVia('telegram')">
                  Telegram
                </button>
                <button class="share-btn twitter" @click="shareVia('twitter')">
                  X / Twitter
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ============================================
// AUTH STATE
// ============================================
const isLoggedIn = ref(false)
const currentUser = ref({
  id: null,
  name: 'Visitante',
  avatar: 'https://via.placeholder.com/150'
})

// Check auth on mount
const checkAuth = () => {
  const token = localStorage.getItem('token')
  // Tenta 'usuario' primeiro (formato da página /login), depois 'user' (formato antigo)
  const userRaw = localStorage.getItem('usuario') || localStorage.getItem('user')
  
  if (token && userRaw) {
    try {
      const userData = JSON.parse(userRaw)
      currentUser.value = {
        id: userData.id || userData._id,
        name: userData.nome || userData.name || 'Usuário',
        avatar: userData.avatar || userData.foto || 'https://via.placeholder.com/150'
      }
      isLoggedIn.value = true
    } catch (e) {
      isLoggedIn.value = false
    }
  }
}

// ============================================
// ROOM FORM
// ============================================
const roomForm = ref({
  name: '',
  description: '',
  isPublic: true
})

const isCreating = ref(false)

// ============================================
// ROOM LIMITS
// ============================================
const MAX_GUEST_ROOMS = 2
const userRoomsCount = ref(0)
const myRooms = ref([])

const canCreate = computed(() => {
  if (isLoggedIn.value) return true
  return userRoomsCount.value < MAX_GUEST_ROOMS
})

// ============================================
// INVITE SYSTEM
// ============================================
const inviteTab = ref('followers')
const followers = ref([])
const following = ref([])
const selectedInvites = ref(new Set())

const toggleInvite = (id) => {
  if (selectedInvites.value.has(id)) {
    selectedInvites.value.delete(id)
  } else {
    selectedInvites.value.add(id)
  }
}

// ============================================
// MODALS
// ============================================
const showShareModal = ref(false)
const shareRoomData = ref(null)
const copiedLink = ref(false)

// ============================================
// API FUNCTIONS
// ============================================

// Fetch user's followers
const fetchFollowers = async () => {
  if (!isLoggedIn.value || !currentUser.value.id) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/usuarios/${currentUser.value.id}/seguidores/publicos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      followers.value = data.map(f => ({
        id: f.id || f._id,
        name: f.nome,
        username: f.username,
        avatar: f.avatar || 'https://via.placeholder.com/150'
      }))
    }
  } catch (error) {
    console.error('Erro ao buscar seguidores:', error)
  }
}

// Fetch user's following
const fetchFollowing = async () => {
  if (!isLoggedIn.value || !currentUser.value.id) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/usuarios/${currentUser.value.id}/seguindo/publicos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      following.value = data.map(f => ({
        id: f.id || f._id,
        name: f.nome,
        username: f.username,
        avatar: f.avatar || f.foto || 'https://via.placeholder.com/150'
      }))
    }
  } catch (error) {
    console.error('Erro ao buscar seguindo:', error)
  }
}

// Fetch user's rooms
const fetchMyRooms = async () => {
  // For guests, get from localStorage
  if (!isLoggedIn.value) {
    const guestRooms = JSON.parse(localStorage.getItem('guest_rooms') || '[]')
    myRooms.value = guestRooms
    userRoomsCount.value = guestRooms.length
    return
  }

  // For logged users, fetch from API
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/rooms/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const data = await response.json()
      myRooms.value = data
      userRoomsCount.value = data.length
    }
  } catch (error) {
    console.error('Erro ao buscar salas:', error)
  }
}

// ============================================
// CREATE ROOM
// ============================================
const createRoom = async () => {
  if (!canCreate.value || !roomForm.value.name.trim()) return
  
  isCreating.value = true
  
  const roomData = {
    // REMOVA o 'id' — deixe o backend gerar
    name: roomForm.value.name,
    description: roomForm.value.description,
    isPublic: roomForm.value.isPublic,
    // REMOVA 'createdBy' — o backend pega do token
    // REMOVA 'createdAt' — o backend define
    // REMOVA 'source' — ou confirme se o backend aceita
    // REMOVA 'gradient' — ou confirme se o schema tem esse campo
    invitedUsers: Array.from(selectedInvites.value)
  }

  try {
    if (isLoggedIn.value) {
      const token = localStorage.getItem('token')
      
      console.log('📤 Enviando:', roomData)  // DEBUG
      
      const response = await fetch('/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roomData)
      })
      
      // 👇 ADICIONE ISSO para ver o erro real do backend:
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Status:', response.status)
        console.error('❌ Backend disse:', errorData)
        throw new Error(errorData.message || `Erro ${response.status} ao criar sala`)
      }
      
      const savedRoom = await response.json()
      // ...
    }
  } catch (error) {
    console.error('Erro ao criar sala:', error)
    alert(error.message)  // Mostra a mensagem real agora
  } finally {
    isCreating.value = false
  }
}

const sendInvites = async (roomId) => {
  const token = localStorage.getItem('token')
  const invites = Array.from(selectedInvites.value).map(userId => 
    fetch('/rooms/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ roomId, userId })
    })
  )
  await Promise.allSettled(invites)
}

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const generateRandomGradient = () => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  ]
  return gradients[Math.floor(Math.random() * gradients.length)]
}

// ============================================
// NAVIGATION
// ============================================
const enterRoom = (roomId) => {
  router.push(`/room?room=${roomId}`)
}

const goBack = () => {
  router.back()
}

// ============================================
// SHARE
// ============================================
const shareRoom = (room) => {
  const baseUrl = window.location.origin
  shareRoomData.value = {
    ...room,
    url: `${baseUrl}/room?room=${room.id}`
  }
  showShareModal.value = true
}

const copyShareLink = () => {
  if (shareRoomData.value?.url) {
    navigator.clipboard.writeText(shareRoomData.value.url)
    copiedLink.value = true
    setTimeout(() => copiedLink.value = false, 2000)
  }
}

const shareVia = (platform) => {
  const text = `🎵 Entre na minha sala do SoundUp: ${shareRoomData.value.name}\n${shareRoomData.value.url}`
  const urls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareRoomData.value.url)}&text=${encodeURIComponent(text)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  }
  window.open(urls[platform], '_blank')
}

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  checkAuth()
  fetchMyRooms()
  if (isLoggedIn.value) {
    fetchFollowers()
    fetchFollowing()
  }
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

.room-creation-page {
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
.creation-header {
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

.creation-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(29, 185, 84, 0.2);
  border-radius: 24px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.login-prompt-btn {
  padding: 0.625rem 1.25rem;
  background: var(--primary);
  border: none;
  border-radius: 24px;
  color: black;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.login-prompt-btn:hover {
  transform: scale(1.05);
  background: var(--primary-dark);
}

/* Content */
.creation-content {
  position: relative;
  z-index: 5;
  max-width: 680px;
  margin: 0 auto;
  padding: 2rem;
}

/* Limit Warning */
.limit-warning {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  color: #ff6b6b;
}

.limit-warning a {
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
}

/* Form */
.creation-form {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.creation-form.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.required {
  color: var(--accent);
}

.form-group input,
.form-group textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-secondary);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Visibility Options */
.visibility-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.visibility-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 2px solid transparent;
  border-radius: 16px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.visibility-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.visibility-btn.active {
  border-color: var(--primary);
  background: rgba(29, 185, 84, 0.1);
}

.visibility-btn svg {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.visibility-btn.active svg {
  color: var(--primary);
}

.visibility-info {
  display: flex;
  flex-direction: column;
}

.visibility-info strong {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.visibility-info span {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Source Badge */
.source-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.source-badge.premium {
  background: rgba(29, 185, 84, 0.1);
  border-color: rgba(29, 185, 84, 0.3);
}

.source-badge svg {
  color: var(--primary);
}

.source-hint {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.source-hint a {
  color: var(--primary);
  cursor: pointer;
  text-decoration: underline;
}

/* Invite Section */
.invite-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  overflow: hidden;
}

.invite-tabs {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.03);
}

.tab-btn.active {
  color: var(--primary);
  border-bottom: 2px solid var(--primary);
}

.tab-count {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.login-required-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 2rem;
  color: var(--text-secondary);
  text-align: center;
}

.login-btn-small {
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  border: none;
  border-radius: 24px;
  color: black;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.login-btn-small:hover {
  transform: scale(1.05);
}

/* Friends List */
.friends-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.empty-friends {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.friend-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.friend-item.selected {
  background: rgba(29, 185, 84, 0.1);
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

.friend-username {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.check-indicator {
  width: 24px;
  height: 24px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
}

.selected-count {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--primary);
  font-weight: 600;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Create Button */
.create-room-btn {
  width: 100%;
  padding: 1.25rem;
  background: var(--primary);
  border: none;
  border-radius: 16px;
  color: black;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.create-room-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: var(--primary-dark);
  box-shadow: 0 8px 32px rgba(29, 185, 84, 0.3);
}

.create-room-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.3);
  border-top-color: black;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* My Rooms Section */
.my-rooms-section {
  margin-top: 3rem;
}

.my-rooms-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.room-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.room-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
}

.room-card-bg {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.vinyl-icon svg {
  opacity: 0.8;
}

.room-card-info {
  padding: 1.25rem;
}

.room-card-info h3 {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
}

.room-card-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.visibility-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
}

.visibility-badge.public {
  background: rgba(29, 185, 84, 0.2);
  color: var(--primary);
}

.listener-count {
  color: var(--text-secondary);
}

.room-card-source {
  display: flex;
  gap: 0.5rem;
}

.spotify-tag, .deezer-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.spotify-tag {
  background: rgba(29, 185, 84, 0.2);
  color: var(--primary);
}

.deezer-tag {
  background: rgba(255, 0, 146, 0.2);
  color: #ff0092;
}

.share-room-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.share-room-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
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

/* Share Modal */
.share-content {
  padding: 1.5rem;
}

.share-preview {
  text-align: center;
  margin-bottom: 1.5rem;
}

.share-vinyl {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-preview h4 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.share-preview p {
  color: var(--text-secondary);
  margin: 0;
}

.share-link-box {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.share-link-box input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  color: var(--text-primary);
  font-family: monospace;
  font-size: 0.875rem;
}

.share-link-box button {
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.share-link-box button.copied {
  background: var(--primary);
  color: black;
}

.share-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}

.share-btn {
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.share-btn.whatsapp { background: #25d366; }
.share-btn.telegram { background: #0088cc; }
.share-btn.twitter { background: #000; border: 1px solid rgba(255,255,255,0.2); }

.share-btn:hover {
  transform: translateY(-2px);
  opacity: 0.9;
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

/* Responsive */
@media (max-width: 640px) {
  .creation-content {
    padding: 1rem;
  }
  
  .creation-form {
    padding: 1.5rem;
  }
  
  .visibility-options {
    grid-template-columns: 1fr;
  }
  
  .rooms-grid {
    grid-template-columns: 1fr;
  }
}
</style>