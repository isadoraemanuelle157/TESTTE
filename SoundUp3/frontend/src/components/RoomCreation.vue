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
            placeholder="Ex: Sessão Chill Vibes"
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
      type="button"
      class="visibility-btn"
      :class="{ 'active': roomForm.isPublic }"
      @click="setRoomVisibility(true)"
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
      type="button"
      class="visibility-btn"
      :class="{ 'active': !roomForm.isPublic }"
      @click="setRoomVisibility(false)"
      :disabled="!canCreate"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      <div class="visibility-info">
        <strong>Privada</strong>
        <span>Somente convidados ou quem tiver a senha</span>
      </div>
    </button>
  </div>
</div>

<div class="form-group" v-if="!roomForm.isPublic">
  <label>Senha da Sala <span class="required">*</span></label>
  <input
    v-model="roomForm.password"
    type="password"
    maxlength="30"
    placeholder="Mínimo 4 caracteres"
    :disabled="!canCreate"
  />
  <span class="char-count">{{ roomForm.password.length }}/30</span>
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
  <i class="fa-solid fa-lock"></i>
  <a @click="$router.push('/login')">Conecte-se</a> para ouvir músicas completas do Spotify
</p>
        </div>

        <!-- Permissions Section (only for logged users) -->
<div class="form-group" v-if="isLoggedIn">
  <label>Permissões da Sala</label>
  <div class="permissions-section">
    <!-- Role Info -->
    <div class="role-badge owner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span>Você será o <strong>Dono</strong> da sala</span>
    </div>

    <!-- Add Music Permission -->
    <div class="permission-item">
      <div class="permission-info">
        <strong>Adicionar Músicas</strong>
        <span>Quem pode adicionar músicas à fila</span>
      </div>
      <div class="permission-options">
        <button
          type="button"
          class="perm-btn"
          :class="{ 'active': roomForm.permissions.addMusic === 'everyone' }"
          @click="roomForm.permissions.addMusic = 'everyone'"
        >
          Todos
        </button>
        <button
          type="button"
          class="perm-btn"
          :class="{ 'active': roomForm.permissions.addMusic === 'moderators' }"
          @click="roomForm.permissions.addMusic = 'moderators'"
        >
          Moderadores
        </button>
        <button
          type="button"
          class="perm-btn"
          :class="{ 'active': roomForm.permissions.addMusic === 'owner' }"
          @click="roomForm.permissions.addMusic = 'owner'"
        >
          Apenas Dono
        </button>
      </div>
    </div>

    <!-- Invite Permission -->
    <div class="permission-item">
      <div class="permission-info">
        <strong>Convidar Pessoas</strong>
        <span>Quem pode convidar novos participantes</span>
      </div>
      <div class="permission-options">
        <button
          type="button"
          class="perm-btn"
          :class="{ 'active': roomForm.permissions.invitePeople === 'everyone' }"
          @click="roomForm.permissions.invitePeople = 'everyone'"
        >
          Todos
        </button>
        <button
          type="button"
          class="perm-btn"
          :class="{ 'active': roomForm.permissions.invitePeople === 'moderators' }"
          @click="roomForm.permissions.invitePeople = 'moderators'"
        >
          Moderadores
        </button>
        <button
          type="button"
          class="perm-btn"
          :class="{ 'active': roomForm.permissions.invitePeople === 'owner' }"
          @click="roomForm.permissions.invitePeople = 'owner'"
        >
          Apenas Dono
        </button>
      </div>
    </div>
    <!-- Adicionar após o bloco de "Convidar Pessoas" -->
<div class="permission-item">
  <div class="permission-info">
    <strong>Promover Moderadores</strong>
    <span>Quem pode promover outros a moderador</span>
  </div>
  <div class="permission-options">
    <button
      type="button"
      class="perm-btn"
      :class="{ 'active': roomForm.permissions.promoteModerators === 'owner' }"
      @click="roomForm.permissions.promoteModerators = 'owner'"
    >
      Apenas Dono
    </button>
    <button
      type="button"
      class="perm-btn"
      :class="{ 'active': roomForm.permissions.promoteModerators === 'moderators' }"
      @click="roomForm.permissions.promoteModerators = 'moderators'"
    >
      Moderadores
    </button>
  </div>
</div>
  </div>
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
               <span class="tab-count" v-else><i class="fa-solid fa-lock"></i></span>
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
               <div v-if="followers.length > 0" class="select-all-bar">
    <button class="select-all-btn" @click="toggleSelectAllFollowers">
      <i class="fa" :class="allFollowersSelected ? 'fa-check-square' : 'fa-square-o'"></i>
      {{ allFollowersSelected ? 'Desmarcar todos' : 'Marcar todos' }}
    </button>
  </div>
              <div v-if="followers.length === 0" class="empty-friends">
                <p>Você ainda não tem seguidores</p>
              </div>
<div v-for="friend in followers" 
  :key="friend.id || friend._id"
  class="friend-item"
  :class="{ 
    'selected': selectedInvites.has(friend.id || friend._id),
    'moderator': selectedModerators.has(friend.id || friend._id)
  }"
  @click="toggleInvite(friend.id || friend._id)"
>
  <img :src="friend.avatar" class="friend-avatar" />
  <div class="friend-info">
    <span class="friend-name">{{ friend.name }}</span>
    <span class="friend-username">@{{ friend.username }}</span>
  </div>
  
  <!-- Botão de Moderador -->
<button
  class="mod-btn"
  :class="{ 'active': selectedModerators.has(friend.id || friend._id) }"
  @click.stop="toggleModerator(friend.id || friend._id)"
    title="Declarar como moderador"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
    <span>Mod</span>
  </button>

  <!-- Check de convite (mantém o existente) -->
  <div class="check-indicator" v-if="selectedInvites.has(friend.id)" @click.stop="toggleInvite(friend.id)">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  </div>
</div>
            </div>

            <!-- Following List -->
         <div v-else class="friends-list">
  <!-- ✅ ADICIONAR AQUI: -->
  <div v-if="following.length > 0" class="select-all-bar">
    <button class="select-all-btn" @click="toggleSelectAllFollowing">
      <i class="fa" :class="allFollowingSelected ? 'fa-check-square' : 'fa-square-o'"></i>
      {{ allFollowingSelected ? 'Desmarcar todos' : 'Marcar todos' }}
    </button>
  </div>
              <div v-if="following.length === 0" class="empty-friends">
                <p>Você ainda não segue ninguém</p>
              </div>
   <div 
  v-for="friend in following" 
  :key="friend.id || friend._id"
  class="friend-item"
  :class="{ 'selected': selectedInvites.has(friend.id || friend._id) }"
  @click="toggleInvite(friend.id || friend._id)"
>
                <img :src="friend.avatar" class="friend-avatar" />
                <div class="friend-info">
                  <span class="friend-name">{{ friend.name }}</span>
                  <span class="friend-username">@{{ friend.username }}</span>
                </div>
<button
  class="mod-btn"
  :class="{ 'active': selectedModerators.has(friend.id || friend._id) }"
  @click.stop="toggleModerator(friend.id || friend._id)"
    title="Declarar como moderador"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
    <span>Mod</span>
  </button>
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
  :disabled="!canCreate || !roomForm.name.trim() || isCreating || (!roomForm.isPublic && roomForm.password.trim().length < 4)"
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
            :key="room.id || room._id"
            class="room-card"
           @click="enterRoom(room.id || room._id)"
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
  <i v-if="room.isPublic" class="fa-solid fa-globe"></i>
  <i v-else class="fa-solid fa-lock"></i>
  {{ room.isPublic ? ' Pública' : ' Privada' }}
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

<button 
  class="delete-room-btn" 
  @click.stop="confirmDeleteRoom(room)"
  title="Deletar sala"
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

    <Teleport to="body">
  <Transition name="modal">
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content delete-modal">
        <div class="modal-header">
          <h3>Deletar Sala</h3>
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
            <span>Esta ação não pode ser desfeita.</span>
          </div>
          <div class="delete-actions">
            <button class="cancel-btn" @click="showDeleteModal = false" :disabled="isDeleting">
              Cancelar
            </button>
            <button class="confirm-delete-btn" @click="deleteRoom" :disabled="isDeleting">
              <span v-if="isDeleting" class="loader"></span>
              <span v-else>Deletar</span>
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
import axios from 'axios'

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

const mapUser = (u) => ({
  id: u?.id || u?._id,
  name: u?.nome || u?.name || 'Usuário',
  username: u?.username || '',
  avatar: u?.avatar || u?.foto || 'https://via.placeholder.com/150'
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
      localStorage.removeItem('guest_rooms')
      return
    } catch (e) {
      console.error('Erro ao ler usuário do localStorage:', e)
    }
  }

  isLoggedIn.value = false
}

// ============================================
// ROOM FORM
// ============================================
const roomForm = ref({
  name: '',
  description: '',
  isPublic: true,
  password: '',
  permissions: {
    addMusic: 'everyone',
    invitePeople: 'moderators',
        promoteModerators: 'owner'

  }
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
const allFollowersSelected = computed(() => {
  if (followers.value.length === 0) return false
  return followers.value.every(f => {
    const id = f.id || f._id
    return id && selectedInvites.value.has(id)
  })
})

const allFollowingSelected = computed(() => {
  if (following.value.length === 0) return false
  return following.value.every(f => {
    const id = f.id || f._id
    return id && selectedInvites.value.has(id)
  })
})
// ============================================
// INVITE SYSTEM
// ============================================
const inviteTab = ref('followers')
const followers = ref([])
const following = ref([])
const selectedInvites = ref(new Set())

const toggleInvite = (id) => {
  if (!id) return
  if (selectedInvites.value.has(id)) {
    selectedInvites.value.delete(id)
  } else {
    selectedInvites.value.add(id)
  }
  // Forçar reatividade
  selectedInvites.value = new Set(selectedInvites.value)
}

const setRoomVisibility = (isPublic) => {
  roomForm.value.isPublic = isPublic
  if (isPublic) {
    roomForm.value.password = ''
  }
}

// ============================================
// MODALS
// ============================================
const showShareModal = ref(false)
const shareRoomData = ref(null)
const copiedLink = ref(false)
const showDeleteModal = ref(false)
const roomToDelete = ref(null)
const isDeleting = ref(false)

// ============================================
// API FUNCTIONS
// ============================================
const fetchFollowersAndFollowing = async () => {
  if (!isLoggedIn.value || !currentUser.value.id) {
    followers.value = []
    following.value = []
    return
  }

  try {
    const [followersRes, followingRes] = await Promise.all([
      apiFetch(`/usuarios/${currentUser.value.id}/seguidores/publicos`),
      apiFetch(`/usuarios/${currentUser.value.id}/seguindo/publicos`)
    ])

    const followersData = followersRes.ok ? await followersRes.json() : []
    const followingData = followingRes.ok ? await followingRes.json() : []

    followers.value = Array.isArray(followersData)
      ? followersData
          .filter(item => !item.tipo || item.tipo === 'usuario')
          .map(mapUser)
      : []

    following.value = Array.isArray(followingData)
      ? followingData
          .filter(item => !item.tipo || item.tipo === 'usuario')
          .map(mapUser)
      : []
  } catch (error) {
    console.error('Erro ao carregar seguidores/seguindo:', error)
    followers.value = []
    following.value = []
  }
}

const fetchMyRooms = async () => {
  if (!isLoggedIn.value) {
    const guestRooms = JSON.parse(localStorage.getItem('guest_rooms') || '[]')
    myRooms.value = guestRooms.map(normalizeRoom)
    userRoomsCount.value = myRooms.value.length
    return
  }

  try {
    const response = await apiFetch('/api/rooms/my')
    if (!response.ok) throw new Error('Erro ao buscar salas')

    const data = await response.json()
    myRooms.value = Array.isArray(data) ? data.map(normalizeRoom) : []
    userRoomsCount.value = myRooms.value.length
  } catch (error) {
    console.error('Erro ao buscar salas:', error)
  }
}
const selectedModerators = ref(new Set())

const toggleModerator = (id) => {
  if (!id) return
  if (selectedModerators.value.has(id)) {
    selectedModerators.value.delete(id)
  } else {
    selectedModerators.value.add(id)
  }
  // Forçar reatividade
  selectedModerators.value = new Set(selectedModerators.value)
}
// ============================================
// CREATE ROOM
// ============================================
const resetRoomForm = () => {
  roomForm.value = {
    name: '',
    description: '',
    isPublic: true,
    password: '',
    permissions: {
      addMusic: 'everyone',
      invitePeople: 'moderators'
    }
  }
  selectedInvites.value = new Set()
  inviteTab.value = 'followers'
}
const createRoom = async () => {
  if (!canCreate.value || !roomForm.value.name.trim()) return

  const trimmedName = roomForm.value.name.trim()

  if (!roomForm.value.isPublic && roomForm.value.password.trim().length < 4) {
    alert('A senha da sala privada deve ter pelo menos 4 caracteres.')
    return
  }

  isCreating.value = true

  try {
    // visitante
    if (!isLoggedIn.value) {
      const guestRooms = JSON.parse(localStorage.getItem('guest_rooms') || '[]')

      const duplicateGuest = guestRooms.some(
        room => room.name?.trim()?.toLowerCase() === trimmedName.toLowerCase()
      )

      if (duplicateGuest) {
        throw new Error('Já existe uma sala com esse nome')
      }

      const guestRoom = {
        id: generateRoomId(),
        name: trimmedName,
        description: roomForm.value.description?.trim() || '',
        isPublic: roomForm.value.isPublic,
        password: roomForm.value.isPublic ? '' : roomForm.value.password.trim(),
        source: 'deezer',
        gradient: generateRandomGradient(),
        listeners: 0,
        invitedUsers: [],
        currentTrack: null,
        queue: [],
        messages: [],
        createdAt: new Date().toISOString()
      }

      localStorage.setItem(`room_${guestRoom.id}_owner`, 'true')

      guestRooms.unshift(guestRoom)
      localStorage.setItem('guest_rooms', JSON.stringify(guestRooms))

      myRooms.value = guestRooms.map(normalizeRoom)
      userRoomsCount.value = myRooms.value.length
      resetRoomForm()
      router.push(`/room?room=${guestRoom.id}`)
      return
    }

    // logado
const roomData = {
  name: trimmedName,
  description: roomForm.value.description?.trim() || '',
  isPublic: roomForm.value.isPublic,
  password: roomForm.value.isPublic ? undefined : roomForm.value.password.trim(),
  invitedUsers: Array.from(selectedInvites.value),
  moderators: Array.from(selectedModerators.value), // <-- ADICIONAR ESTA LINHA
  permissions: roomForm.value.permissions
}

    const response = await apiFetch('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData)
    })

    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(payload.error || payload.message || `Erro ${response.status} ao criar sala`)
    }

    const savedRoom = normalizeRoom(payload)

    if (selectedInvites.value.size > 0) {
      await sendInvites(savedRoom.id)
    }

    myRooms.value = [savedRoom, ...myRooms.value.filter(r => r.id !== savedRoom.id)]
    userRoomsCount.value = myRooms.value.length

    resetRoomForm()

    router.push(`/room?room=${savedRoom.id}`)
  } catch (error) {
    console.error('Erro ao criar sala:', error)
    alert(error.message || 'Não foi possível criar a sala')
  } finally {
    isCreating.value = false
  }
}

const sendInvites = async (roomId) => {
  const invites = Array.from(selectedInvites.value).map((userId) =>
    apiFetch('/api/rooms/invite', {
      method: 'POST',
      body: JSON.stringify({ roomId, userId })
    })
  )

  await Promise.allSettled(invites)
}


const toggleSelectAllFollowers = () => {
  if (allFollowersSelected.value) {
    // Desmarcar todos os seguidores
    followers.value.forEach(f => {
      const id = f.id || f._id
      if (id) selectedInvites.value.delete(id)
    })
  } else {
    // Marcar todos os seguidores
    followers.value.forEach(f => {
      const id = f.id || f._id
      if (id) selectedInvites.value.add(id)
    })
  }
  selectedInvites.value = new Set(selectedInvites.value)
}

const toggleSelectAllFollowing = () => {
  if (allFollowingSelected.value) {
    // Desmarcar todos os seguindo
    following.value.forEach(f => {
      const id = f.id || f._id
      if (id) selectedInvites.value.delete(id)
    })
  } else {
    // Marcar todos os seguindo
    following.value.forEach(f => {
      const id = f.id || f._id
      if (id) selectedInvites.value.add(id)
    })
  }
  selectedInvites.value = new Set(selectedInvites.value)
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
  const normalized = normalizeRoom(room)
  const baseUrl = window.location.origin
  shareRoomData.value = {
    ...normalized,
    url: `${baseUrl}/room?room=${normalized.id}`
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

const confirmDeleteRoom = (room) => {
  roomToDelete.value = room
  showDeleteModal.value = true
}

const deleteRoom = async () => {
  if (!roomToDelete.value) return

  isDeleting.value = true

  try {
    const roomId = roomToDelete.value.id

    if (!isLoggedIn.value) {
      // Deletar sala de visitante do localStorage
      const guestRooms = JSON.parse(localStorage.getItem('guest_rooms') || '[]')
      const updatedRooms = guestRooms.filter(r => (r.id || r._id) !== roomId)
      localStorage.setItem('guest_rooms', JSON.stringify(updatedRooms))
      myRooms.value = updatedRooms.map(normalizeRoom)
      userRoomsCount.value = myRooms.value.length
    } else {
      // ✅ Backend já verifica se é admin ou dono
      const response = await apiFetch(`/api/rooms/${roomId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || `Erro ${response.status}`)
      }

      myRooms.value = myRooms.value.filter(r => r.id !== roomId)
      userRoomsCount.value = myRooms.value.length
    }

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
// LIFECYCLE
// ============================================
onMounted(async () => {
  checkAuth()
  await fetchMyRooms()
  await fetchFollowersAndFollowing()
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
.mod-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.625rem;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  color: #ffc107;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 0.5rem;
}

.mod-btn:hover {
  background: rgba(255, 193, 7, 0.2);
}

.mod-btn.active {
  background: rgba(255, 193, 7, 0.3);
  border-color: #ffc107;
}

.friend-item.moderator {
  border-left: 3px solid #ffc107;
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
/* Delete Button */
.delete-room-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  background: rgba(255, 107, 107, 0.2);
  border: none;
  border-radius: 50%;
  color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.select-all-bar {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
}

.select-all-btn {
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.select-all-btn:hover {
  color: var(--primary-dark);
}

.delete-room-btn:hover {
  background: rgba(255, 107, 107, 0.4);
  transform: scale(1.1);
}

/* Delete Modal */
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
.visibility-badge i {
  margin-right: 0.375rem;
  font-size: 0.875rem;
}

.source-hint i {
  margin-right: 0.375rem;
  color: var(--primary);
}

.tab-count i {
  font-size: 0.75rem;
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
  right: 3.5rem;
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
/* Permissions Section */
.permissions-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.role-badge.owner {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.role-badge svg {
  flex-shrink: 0;
}

.permission-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.permission-item:first-of-type {
  border-top: none;
  padding-top: 0;
}

.permission-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.permission-info strong {
  font-size: 0.9375rem;
  color: var(--text-primary);
}

.permission-info span {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.permission-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.perm-btn {
  flex: 1;
  min-width: 80px;
  padding: 0.625rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.perm-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.perm-btn.active {
  background: rgba(29, 185, 84, 0.2);
  border-color: var(--primary);
  color: var(--primary);
}

@media (max-width: 640px) {
  .permission-options {
    flex-direction: column;
  }
  
  .perm-btn {
    width: 100%;
  }
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