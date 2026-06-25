<!-- RoomsList.vue - Página de Listagem de Salas de Música -->
<template>
  <div class="rooms-list-page">
    <!-- Ambient Background -->
    <div class="ambient-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Header -->
    <header class="rooms-header">
      <div class="header-left">

        <h1>Salas de Música</h1>
      </div>
      <div class="header-right">
        <div class="user-status" v-if="isLoggedIn">
          <img :src="currentUser.avatar" class="user-avatar-small" alt="avatar" />
          <span>{{ currentUser.name }}</span>
        </div>
        <button v-else class="login-prompt-btn" @click="$router.push('/login')">
          Fazer Login
        </button>
        <button class="create-room-btn-top" @click="$router.push('/rooms/create')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Criar Sala
        </button>
      </div>
    </header>

<main class="rooms-content">
  <!-- Search & Filter -->
  <div class="search-section">
    <div class="search-row">
      <div class="search-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="searchQuery" 
          placeholder="Buscar salas..."
          type="text"
        />
      </div>
      <button class="join-by-link-btn" @click="showJoinByLinkModal = true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        Entrar com Link
      </button>
    </div>
    
    <div class="filter-tabs">
      <button 
        class="filter-btn" 
        :class="{ 'active': activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >
        Todas
      </button>
      <button 
        class="filter-btn" 
        :class="{ 'active': activeFilter === 'public' }"
        @click="activeFilter = 'public'"
      >
        Públicas
      </button>
      <button 
        class="filter-btn" 
        :class="{ 'active': activeFilter === 'private' }"
        @click="activeFilter = 'private'"
      >
        Privadas
      </button>
    </div>
  </div>

  <!-- Loading State -->
  <div v-if="isLoading" class="loading-state">
    <div class="loader"></div>
    <p>Carregando salas...</p>
  </div>

  <!-- Empty State -->
  <div v-else-if="filteredRooms.length === 0" class="empty-state">
    <div class="empty-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="2" x2="12" y2="4"/>
        <line x1="12" y1="20" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="4" y2="12"/>
        <line x1="20" y1="12" x2="22" y2="12"/>
      </svg>
    </div>
    <h3>Nenhuma sala encontrada</h3>
    <p v-if="searchQuery">Tente buscar com outro termo</p>
    <p v-else-if="activeFilter === 'private'">Não há salas privadas disponíveis</p>
    <p v-else>Seja o primeiro a criar uma sala!</p>
    <button class="create-room-empty-btn" @click="$router.push('/rooms/create')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Criar Nova Sala
    </button>
  </div>

  <!-- Rooms Grid -->
  <div v-else class="rooms-grid">
    <div 
      v-for="room in filteredRooms" 
      :key="room.id || room._id"
      class="room-card"
      @click="handleRoomClick(room)"
    >
      <div class="room-card-bg" :style="{ background: room.gradient || 'linear-gradient(135deg, #667eea, #764ba2)' }">
        <div class="vinyl-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div class="room-card-overlay">
          <span class="enter-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Entrar
          </span>
        </div>
      </div>
      <div class="room-card-info">
        <h3>{{ room.name }}</h3>
        <p v-if="room.description" class="room-description">{{ room.description }}</p>
        <div class="room-card-meta">
          <span class="visibility-badge" :class="{ 'public': room.isPublic }">
            <svg v-if="room.isPublic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {{ room.isPublic ? 'Pública' : 'Privada' }}
          </span>
          <span class="listener-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {{ room.listeners || 0 }} ouvindo
          </span>
        </div>
        <div class="room-card-footer">
          <div class="room-owner" v-if="room.createdBy">
            <img :src="room.createdBy.avatar || 'https://via.placeholder.com/150'" class="owner-avatar" alt="owner" />
            <span class="owner-name">{{ room.createdBy.name || room.createdBy.nome || 'Anônimo' }}</span>
          </div>
          <span class="source-tag" :class="room.source || 'deezer'">
            {{ room.source === 'spotify' ? 'Spotify' : 'Deezer' }}
          </span>
        </div>
      </div>
      <!-- Lock Icon for Private Rooms -->
      <div v-if="!room.isPublic" class="lock-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
       <button 
    v-if="isAdmin"
    class="delete-room-admin-btn" 
    @click.stop="confirmDeleteRoom(room)"
    title="Deletar sala (Admin)"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  </button>
    </div>
  </div>
</main>

    <!-- Password Modal for Private Rooms -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
          <div class="modal-content password-modal">
            <div class="modal-header">
              <h3>Sala Privada</h3>
              <button class="close-btn" @click="showPasswordModal = false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="password-content">
              <div class="password-preview">
                <div class="password-vinyl" :style="{ background: selectedRoom?.gradient || 'linear-gradient(135deg, #667eea, #764ba2)' }">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <h4>{{ selectedRoom?.name }}</h4>
                <p>Esta sala é privada. Digite a senha para entrar.</p>
              </div>
              
              <div class="password-input-group">
                <input 
                  v-model="roomPassword" 
                  type="password" 
                  placeholder="Digite a senha da sala"
                  maxlength="30"
                  @keyup.enter="submitPassword"
                  ref="passwordInput"
                />
                <span class="char-count">{{ roomPassword.length }}/30</span>
              </div>

              <p v-if="passwordError" class="password-error">{{ passwordError }}</p>

              <button 
                class="submit-password-btn"
                :disabled="!roomPassword.trim() || isJoining"
                @click="submitPassword"
              >
                <span v-if="isJoining" class="loader"></span>
                <span v-else>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Entrar na Sala
                </span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
          <!-- Join by Link Modal -->
    <Transition name="modal">
      <div v-if="showJoinByLinkModal" class="modal-overlay" @click.self="showJoinByLinkModal = false">
        <div class="modal-content join-link-modal">
          <div class="modal-header">
            <h3>Entrar com Link da Sala</h3>
            <button class="close-btn" @click="showJoinByLinkModal = false">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="join-link-content">
            <div class="join-link-preview">
              <div class="link-vinyl" :style="{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <p>Cole o link da sala ou digite o código para entrar</p>
            </div>
            
            <div class="link-input-group">
              <input 
                v-model="joinLinkInput" 
                type="text" 
                placeholder="Cole o link ou código da sala"
                @keyup.enter="submitJoinLink"
                ref="joinLinkInputRef"
              />
            </div>

            <p v-if="joinLinkError" class="join-link-error">{{ joinLinkError }}</p>

            <button 
              class="submit-link-btn"
              :disabled="!joinLinkInput.trim() || isJoiningLink"
              @click="submitJoinLink"
            >
              <span v-if="isJoiningLink" class="loader"></span>
              <span v-else>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Entrar na Sala
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>
    <!-- ✅ ADICIONAR este modal de delete admin APÓS o </Teleport> do join-by-link -->
<Teleport to="body">
  <Transition name="modal">
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <h3>Deletar Sala (Admin)</h3>
          <button class="close-btn" @click="showDeleteModal = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="delete-content">
          <div class="delete-warning">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="1.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p>Tem certeza que deseja deletar a sala <strong>"{{ roomToDelete?.name }}"</strong>?</p>
            <span>Esta ação não pode ser desfeita. Como admin, você pode deletar qualquer sala.</span>
          </div>
          <div class="delete-actions">
            <button class="cancel-btn" @click="showDeleteModal = false" :disabled="isDeleting">
              Cancelar
            </button>
            <button class="confirm-delete-btn" @click="deleteRoom" :disabled="isDeleting">
              <span v-if="isDeleting" class="loader"></span>
              <span v-else>Deletar Sala</span>
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
import { useRouter } from 'vue-router'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('token')

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers
  })
}

const normalizeRoom = (room) => ({
  ...room,
  id: room?.id || room?._id
})

// ============================================
// AUTH STATE
// ============================================
const isLoggedIn = ref(false)
const currentUser = ref({
  id: null,
  name: 'Visitante',
  avatar: 'https://via.placeholder.com/150'
})

const checkAuth = () => {
  const token = localStorage.getItem('token')
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
      return
    } catch (e) {
      console.error('Erro ao ler usuário do localStorage:', e)
    }
  }

  isLoggedIn.value = false
}

const isAdmin = computed(() => {
  const userRaw = localStorage.getItem('usuario') || localStorage.getItem('user')
  if (!userRaw) return false
  try {
    const userData = JSON.parse(userRaw)
    return userData.role === 'admin' || userData.tipo === 'admin'
  } catch {
    return false
  }
})

const showDeleteModal = ref(false)
const roomToDelete = ref(null)
const isDeleting = ref(false)

// ✅ ADICIONAR: funções de delete
const confirmDeleteRoom = (room) => {
  roomToDelete.value = room
  showDeleteModal.value = true
}

// ✅ CONFIRME que a função deleteRoom no RoomsList.vue está assim:
const deleteRoom = async () => {
  if (!roomToDelete.value) return
  isDeleting.value = true

  try {
    const roomId = roomToDelete.value.id || roomToDelete.value._id
    
    // Admin deleta via API (backend já verifica role)
    const response = await apiFetch(`/api/rooms/${roomId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.error || `Erro ${response.status}`)
    }

    // Remove da lista local
    allRooms.value = allRooms.value.filter(r => (r.id || r._id) !== roomId)
    
    showDeleteModal.value = false
    roomToDelete.value = null
  } catch (error) {
    console.error('Erro ao deletar sala:', error)
    alert(error.message || 'Não foi possível deletar a sala')
  } finally {
    isDeleting.value = false
  }
}

// ============================================
// ROOMS STATE
// ============================================
const allRooms = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const activeFilter = ref('all')

// ============================================
// PASSWORD MODAL STATE
// ============================================
const showPasswordModal = ref(false)
const selectedRoom = ref(null)
const roomPassword = ref('')
const passwordError = ref('')
const isJoining = ref(false)
const passwordInput = ref(null)

// ============================================
// JOIN BY LINK MODAL STATE
// ============================================
const showJoinByLinkModal = ref(false)
const joinLinkInput = ref('')
const joinLinkError = ref('')
const isJoiningLink = ref(false)
const joinLinkInputRef = ref(null)

// ============================================
// COMPUTED
// ============================================
const filteredRooms = computed(() => {
  let rooms = allRooms.value

  // Filter by type
  if (activeFilter.value === 'public') {
    rooms = rooms.filter(r => r.isPublic)
  } else if (activeFilter.value === 'private') {
    rooms = rooms.filter(r => !r.isPublic)
  }

  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    rooms = rooms.filter(r => 
      r.name?.toLowerCase().includes(query) || 
      r.description?.toLowerCase().includes(query) ||
      r.createdBy?.name?.toLowerCase().includes(query) ||
      r.createdBy?.nome?.toLowerCase().includes(query)
    )
  }

  return rooms
})
// ============================================
// JOIN BY CODE STATE
// ============================================
const joinCode = ref('')
const joinCodeError = ref('')

// ============================================
// JOIN BY CODE FUNCTION
// ============================================
const joinByCode = async () => {
  const code = joinCode.value.trim()
  if (!code) return

  joinCodeError.value = ''

  // Verifica se é uma sala do banco (MongoDB ID = 24 hex chars)
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(code)
  
  // Verifica se é sala de visitante (ID curto gerado no frontend)
  const guestRooms = JSON.parse(localStorage.getItem('guest_rooms') || '[]')
  const guestRoom = guestRooms.find(r => (r.id || r._id) === code)

  try {
    if (isMongoId) {
      // Sala do banco - busca na API
      const response = await apiFetch(`/api/rooms/${code}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          joinCodeError.value = 'Sala não encontrada'
          return
        }
        throw new Error('Erro ao buscar sala')
      }

      const roomData = await response.json()
      
      // Se sala privada, mostra modal de senha
      if (!roomData.isPublic) {
        selectedRoom.value = normalizeRoom(roomData)
        roomPassword.value = ''
        passwordError.value = ''
        showPasswordModal.value = true
        nextTick(() => passwordInput.value?.focus())
        return
      }

      // Sala pública - entra direto
      enterRoom(code)
      return
    }

    // Sala de visitante (localStorage)
    if (guestRoom) {
      if (!guestRoom.isPublic) {
        // Sala privada de visitante - mostra modal de senha
        selectedRoom.value = normalizeRoom(guestRoom)
        roomPassword.value = ''
        passwordError.value = ''
        showPasswordModal.value = true
        nextTick(() => passwordInput.value?.focus())
        return
      }
      // Pública - entra direto
      enterRoom(code)
      return
    }

    joinCodeError.value = 'Sala não encontrada. Verifique o código.'

  } catch (error) {
    console.error('Erro ao entrar com código:', error)
    joinCodeError.value = 'Erro ao conectar. Tente novamente.'
  }
}
// ============================================
// JOIN BY LINK FUNCTION
// ============================================

// Extrai o roomId de uma URL ou retorna o próprio valor se for só o ID
const extractRoomId = (input) => {
  const trimmed = input.trim()
  
  // Tenta extrair de uma URL completa tipo: http://localhost:5173/room?room=6a25f716aa636269fe4cf178
  try {
    const url = new URL(trimmed)
    const roomId = url.searchParams.get('room')
    if (roomId) return roomId
  } catch {
    // Não é uma URL válida, continua...
  }
  
  // Tenta extrair de query string solta tipo: room?room=6a25f716aa636269fe4cf178
  const queryMatch = trimmed.match(/[?&]room=([a-zA-Z0-9]+)/)
  if (queryMatch) return queryMatch[1]
  
  // Retorna o input limpo (assumindo que é o ID puro)
  return trimmed
}

const submitJoinLink = async () => {
  const rawInput = joinLinkInput.value.trim()
  if (!rawInput) return

  isJoiningLink.value = true
  joinLinkError.value = ''

  const roomId = extractRoomId(rawInput)

  try {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(roomId)
    
    // Sala do banco (MongoDB)
    if (isMongoId) {
      const response = await apiFetch(`/api/rooms/${roomId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          joinLinkError.value = 'Sala não encontrada'
          isJoiningLink.value = false
          return
        }
        throw new Error('Erro ao buscar sala')
      }

      const roomData = await response.json()
      
      // Se sala privada, mostra modal de senha
      if (!roomData.isPublic) {
        selectedRoom.value = normalizeRoom(roomData)
        roomPassword.value = ''
        passwordError.value = ''
        showJoinByLinkModal.value = false
        joinLinkInput.value = ''
        showPasswordModal.value = true
        nextTick(() => passwordInput.value?.focus())
        isJoiningLink.value = false
        return
      }

      // Sala pública - entra direto
      showJoinByLinkModal.value = false
      joinLinkInput.value = ''
      enterRoom(roomId)
      isJoiningLink.value = false
      return
    }

    // Sala de visitante (localStorage)
    const guestRooms = JSON.parse(localStorage.getItem('guest_rooms') || '[]')
    const guestRoom = guestRooms.find(r => (r.id || r._id) === roomId)

    if (guestRoom) {
      if (!guestRoom.isPublic) {
        // Sala privada de visitante - mostra modal de senha
        selectedRoom.value = normalizeRoom(guestRoom)
        roomPassword.value = ''
        passwordError.value = ''
        showJoinByLinkModal.value = false
        joinLinkInput.value = ''
        showPasswordModal.value = true
        nextTick(() => passwordInput.value?.focus())
        isJoiningLink.value = false
        return
      }
      // Pública - entra direto
      showJoinByLinkModal.value = false
      joinLinkInput.value = ''
      enterRoom(roomId)
      isJoiningLink.value = false
      return
    }

    joinLinkError.value = 'Sala não encontrada. Verifique o link ou código.'

  } catch (error) {
    console.error('Erro ao entrar com link:', error)
    joinLinkError.value = 'Erro ao conectar. Tente novamente.'
  } finally {
    isJoiningLink.value = false
  }
}

// Watch para focar no input quando abrir o modal
watch(showJoinByLinkModal, (val) => {
  if (val) {
    nextTick(() => joinLinkInputRef.value?.focus())
  }
})
// ============================================
// API FUNCTIONS
// ============================================
const fetchAllRooms = async () => {
  isLoading.value = true
  
  try {
   const promises = [apiFetch('/api/rooms/todas')]

    // Se usuário estiver logado, busca também as salas dele (incluindo privadas)
    if (isLoggedIn.value) {
      promises.push(apiFetch('/api/rooms/my'))
    }

    const responses = await Promise.all(promises)
    
    let apiRooms = []
    
    // Salas públicas
    if (responses[0].ok) {
      const publicData = await responses[0].json()
      apiRooms = Array.isArray(publicData) ? publicData.map(normalizeRoom) : []
    }

    // Salas do usuário (inclui privadas)
    if (isLoggedIn.value && responses[1]?.ok) {
      const myData = await responses[1].json()
      const myRooms = Array.isArray(myData) ? myData.map(normalizeRoom) : []
      
      // Merge: adiciona as salas do usuário que ainda não estão na lista
      const existingIds = new Set(apiRooms.map(r => r.id || r._id))
      for (const room of myRooms) {
        const roomId = room.id || room._id
        if (!existingIds.has(roomId)) {
          apiRooms.push(room)
          existingIds.add(roomId)
        }
      }
    }

    // Fetch guest rooms from localStorage
    const guestRooms = JSON.parse(localStorage.getItem('guest_rooms') || '[]')
    const normalizedGuestRooms = guestRooms.map(normalizeRoom)

    // Combine and remove duplicates
    const all = [...apiRooms, ...normalizedGuestRooms]
    const seen = new Set()
    allRooms.value = all.filter(room => {
      const id = room.id || room._id
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
  } catch (error) {
    console.error('Erro ao buscar salas:', error)
    allRooms.value = []
  } finally {
    isLoading.value = false
  }
}

// ============================================
// NAVIGATION & ACTIONS
// ============================================
const handleRoomClick = (room) => {
  if (!room.isPublic) {
    // Show password modal for private rooms
    selectedRoom.value = room
    roomPassword.value = ''
    passwordError.value = ''
    showPasswordModal.value = true
    nextTick(() => {
      passwordInput.value?.focus()
    })
  } else {
    // Enter public room directly
    enterRoom(room.id || room._id)
  }
}

// SUBSTITUA O MÉTODO submitPassword() EXISTENTE POR ESTE:

const submitPassword = async () => {
  const senha = roomPassword.value.trim()
  if (!senha || !selectedRoom.value) return

  isJoining.value = true
  passwordError.value = ''

  try {
    const roomId = selectedRoom.value.id || selectedRoom.value._id

    // ✅ Salas de visitante (localStorage): verifica localmente
    const isGuestRoom = !String(roomId).match(/^[0-9a-fA-F]{24}$/)
    
    if (isGuestRoom) {
      const guestRooms = JSON.parse(localStorage.getItem('guest_rooms') || '[]')
      const guestRoom = guestRooms.find(r => (r.id || r._id) === roomId)
      
      if (!guestRoom) {
        passwordError.value = 'Sala não encontrada.'
        isJoining.value = false  // ← reset aqui antes do return
        return
      }

      // Comparação direta de senha (visitante)
      if (String(guestRoom.password || '') !== senha) {
        passwordError.value = 'Senha incorreta. Tente novamente.'
        roomPassword.value = ''
        isJoining.value = false  // ← reset aqui antes do return
        return
      }

      // ✅ Senha correta
      showPasswordModal.value = false
      enterRoom(roomId)
      isJoining.value = false  // ← reset aqui antes do return
      return
    }

    // ✅ Salas da API (MongoDB): valida no backend
    const response = await apiFetch(`/api/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify({ password: senha })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      passwordError.value = errorData.error || 'Senha incorreta. Tente novamente.'
      roomPassword.value = ''
      isJoining.value = false  // ← reset aqui antes do return
      return
    }

    const data = await response.json().catch(() => null)
    
    if (!data || !(data._id || data.id)) {
      passwordError.value = 'Resposta inválida do servidor. Tente novamente.'
      isJoining.value = false  // ← reset aqui antes do return
      return
    }

    // ✅ Tudo certo
    showPasswordModal.value = false
    enterRoom(roomId)

  } catch (error) {
    console.error('Erro ao entrar na sala:', error)
    passwordError.value = 'Erro ao verificar senha. Tente novamente.'
  } finally {
    isJoining.value = false  // ← garante reset no final
  }
}


const enterRoom = (roomId) => {
  router.push(`/room?room=${roomId}`)
}

const goBack = () => {
  router.back()
}

// ============================================
// ATUALIZAÇÃO PERIÓDICA DA LISTA
// ============================================
let roomsRefreshInterval = null

const startRoomsRefresh = () => {
  // Atualiza a lista a cada 10 segundos para refletir mudanças de listeners
  roomsRefreshInterval = setInterval(() => {
    fetchAllRooms()
  }, 10000)
}

const stopRoomsRefresh = () => {
  if (roomsRefreshInterval) {
    clearInterval(roomsRefreshInterval)
    roomsRefreshInterval = null
  }
}

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  checkAuth() // sincroniza o estado de login
  await fetchAllRooms() // agora já sabe se está logado e busca /api/rooms/my também
  startRoomsRefresh()   // ← INICIAR POLLING
})


onUnmounted(() => {
  stopRoomsRefresh()
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

.rooms-list-page {
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
.rooms-header {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-right {
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

.rooms-header h1 {
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

.create-room-btn-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  border: none;
  border-radius: 24px;
  color: black;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9375rem;
}

.create-room-btn-top:hover {
  transform: scale(1.05);
  background: var(--primary-dark);
  box-shadow: 0 8px 32px rgba(29, 185, 84, 0.3);
}

/* Content */
.rooms-content {
  position: relative;
  z-index: 5;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0.875rem 1.25rem;
  transition: all 0.3s;
}

.search-box:focus-within {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
}

.search-box svg {
  color: var(--text-secondary);
  flex-shrink: 0;
}
/* Search Row */
.search-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-box {
  flex: 1;
}

.join-by-link-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: rgba(29, 185, 84, 0.15);
  border: 1px solid rgba(29, 185, 84, 0.3);
  border-radius: 16px;
  color: var(--primary);
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.join-by-link-btn:hover {
  background: rgba(29, 185, 84, 0.25);
  transform: translateY(-1px);
}

/* Join Link Modal */
.join-link-modal {
  max-width: 420px;
}

.join-link-content {
  padding: 1.5rem;
}

.join-link-preview {
  text-align: center;
  margin-bottom: 1.5rem;
}

.link-vinyl {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.join-link-preview p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

.link-input-group {
  margin-bottom: 0.75rem;
}

.link-input-group input {
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

.link-input-group input:focus {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
}

.link-input-group input::placeholder {
  color: var(--text-secondary);
}

.join-link-error {
  color: #ff6b6b;
  font-size: 0.875rem;
  margin: 0 0 1rem;
  text-align: center;
}

.submit-link-btn {
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

.submit-link-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: var(--primary-dark);
  box-shadow: 0 8px 32px rgba(29, 185, 84, 0.3);
}

.submit-link-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
  }
  
  .join-by-link-btn {
    width: 100%;
    justify-content: center;
  }
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

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.625rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.filter-btn.active {
  background: rgba(29, 185, 84, 0.2);
  border-color: var(--primary);
  color: var(--primary);
}
.join-code-section {
  margin-bottom: 1rem;
}

.join-code-input-group {
  display: flex;
  gap: 0.5rem;
  max-width: 400px;
}

.join-code-input-group input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  outline: none;
  transition: all 0.3s;
}

.join-code-input-group input:focus {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
}

.join-code-input-group input::placeholder {
  color: var(--text-secondary);
}

.join-code-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  color: black;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.join-code-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.join-code-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.join-code-error {
  color: #ff6b6b;
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
}
/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: var(--text-secondary);
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 1rem;
}

.empty-icon {
  color: var(--text-secondary);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin: 0;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0;
}

.create-room-empty-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--primary);
  border: none;
  border-radius: 24px;
  color: black;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
  font-size: 1rem;
}

.create-room-empty-btn:hover {
  transform: scale(1.05);
  background: var(--primary-dark);
  box-shadow: 0 8px 32px rgba(29, 185, 84, 0.3);
}

/* Rooms Grid */
.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.room-card-bg {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.vinyl-icon {
  opacity: 0.8;
  transition: all 0.3s;
}

.room-card:hover .vinyl-icon {
  transform: scale(1.1);
  opacity: 1;
}

.room-card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.room-card:hover .room-card-overlay {
  opacity: 1;
}

.enter-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--primary);
  border-radius: 24px;
  color: black;
  font-weight: 700;
  font-size: 0.875rem;
}

.room-card-info {
  padding: 1.25rem;
}

.room-card-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
}

.room-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.room-card-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.visibility-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
  font-size: 0.75rem;
  font-weight: 600;
}

.visibility-badge.public {
  background: rgba(29, 185, 84, 0.15);
  color: var(--primary);
}

.listener-count {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.room-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.room-owner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.owner-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.owner-name {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.source-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.source-tag.spotify {
  background: rgba(29, 185, 84, 0.2);
  color: var(--primary);
}

.source-tag.deezer {
  background: rgba(255, 0, 146, 0.2);
  color: #ff0092;
}
/* ✅ ADICIONAR no final do <style> */
.delete-room-admin-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  background: rgba(239, 68, 68, 0.8);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.delete-room-admin-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.1);
}

.delete-modal {
  max-width: 400px;
}

.delete-content {
  padding: 1.5rem;
}

.delete-warning {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.delete-warning p {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.delete-warning span {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.delete-actions {
  display: flex;
  gap: 0.75rem;
}

.delete-actions button {
  flex: 1;
  padding: 0.875rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.confirm-delete-btn {
  background: #ff6b6b;
  color: white;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-1px);
}

.delete-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.lock-icon {
  position: absolute;
  top: 1rem;
 left: 1rem;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(4px);
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
  max-width: 420px;
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

/* Password Modal */
.password-content {
  padding: 1.5rem;
}

.password-preview {
  text-align: center;
  margin-bottom: 1.5rem;
}

.password-vinyl {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-preview h4 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.password-preview p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.875rem;
}

.password-input-group {
  position: relative;
  margin-bottom: 0.75rem;
}

.password-input-group input {
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

.password-input-group input:focus {
  border-color: var(--primary);
  background: rgba(255, 255, 255, 0.08);
}

.password-input-group input::placeholder {
  color: var(--text-secondary);
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.password-error {
  color: #ff6b6b;
  font-size: 0.875rem;
  margin: 0 0 1rem;
  text-align: center;
}

.submit-password-btn {
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

.submit-password-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: var(--primary-dark);
  box-shadow: 0 8px 32px rgba(29, 185, 84, 0.3);
}

.submit-password-btn:disabled {
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

/* Responsive */
@media (max-width: 768px) {
  .rooms-header {
    padding: 1rem;
  }
  
  .rooms-header h1 {
    font-size: 1.25rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .rooms-content {
    padding: 1rem;
  }
  
  .rooms-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-tabs {
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
}
</style>