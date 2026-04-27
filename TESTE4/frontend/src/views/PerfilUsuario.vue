<!-- PerfilUsuario.vue - Página de perfil de usuário (tipo Instagram) -->
<template>
  <div class="perfil-usuario">
    <!-- Loading -->
    <div v-if="loading" class="skeleton-wrapper">
      <div class="skeleton-cover"></div>
      <div class="skeleton-profile">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-line large"></div>
          <div class="skeleton-line medium"></div>
        </div>
      </div>
    </div>

    <!-- Perfil privado / Não encontrado -->
<!-- Não encontrado -->
<div v-else-if="notFound" class="private-profile">
  <i class="fa fa-user-times"></i>
  <h3>Usuário não encontrado</h3>
  <p>Este usuário não existe ou foi removido.</p>

  <button class="btn-secondary btn-secondary-inline" @click="$router.back()">
    <i class="fa fa-arrow-left"></i> Voltar
  </button>
</div>

<!-- Perfil visível (público OU privado bloqueado) -->
<div v-else class="profile-content-wrapper">

      <!-- Header do Perfil -->
      <div class="profile-header">
        <div class="cover-image" :style="coverStyle">
          <div class="cover-gradient"></div>
        </div>
       
        <div class="profile-info-container">
          <div class="avatar-section">
            <div class="avatar-wrapper" :class="{ 'online': isOnline }">
              <img
                v-if="usuario.avatar"
                :src="usuario.avatar"
                :alt="usuario.nome"
                class="avatar"
                @error="handleAvatarError"
              />
              <div v-else class="avatar generated-avatar" :style="generatedAvatarStyle">
                {{ userInitials }}
              </div>
              <div class="avatar-status" v-if="isOnline"></div>
            </div>
          </div>
         
          <div class="user-details">
            <div class="user-badges" v-if="usuario.verificado || isNewMember">
              <span class="badge badge-verified" v-if="usuario.verificado">
                <i class="fa fa-check-circle"></i> Verificado
              </span>
              <span class="badge badge-new" v-if="isNewMember">NOVO</span>
            </div>
           
            <h1 class="user-name">{{ usuario.nome || 'Usuário' }}</h1>
            <p class="user-handle">@{{ usuario.username || 'usuario' }}</p>
           
 <div class="user-private-info-wrapper" :class="{ locked: isLockedPrivateProfile }">
        <!-- BIO SEMPRE VISÍVEL (estilo Instagram) -->
        <p class="user-bio" v-if="usuario.bio"> {{ usuario.bio || 'Este usuário ainda não adicionou uma bio.' }}</p>

        <!-- Meta, gêneros e stats só aparecem se NÃO estiver bloqueado -->
        <div class="user-meta" v-if="!isLockedPrivateProfile && (usuario.localizacao || usuario.membroDesde)">
          <span class="meta-item" v-if="usuario.localizacao">
            <i class="fa fa-map-marker"></i> {{ usuario.localizacao }}
          </span>
          <span class="meta-item" v-if="usuario.membroDesde">
            <i class="fa fa-calendar"></i> {{ formatDate(usuario.membroDesde) }}
          </span>
        </div>

       <div class="user-genres" v-if="!isLockedPrivateProfile && usuario.generos && usuario.generos.length">
          <span v-for="genre in usuario.generos.slice(0, 4)" :key="genre" class="genre-tag">
            {{ genre }}
          </span>
        </div>

<div class="user-stats">
          <!-- Stats sempre visíveis, mas com "—" quando privado -->
          <div class="stat-item" @click="handleStatClick('likes')">
            <span class="stat-value">{{ isLockedPrivateProfile ? '—' : formatNumber(estatisticas.musicasCurtidas) }}</span>
            <span class="stat-label">Curtidas</span>
          </div>
          <div class="stat-item" @click="handleStatClick('playlists')">
            <span class="stat-value">{{ isLockedPrivateProfile ? '—' : formatNumber(estatisticas.playlists) }}</span>
            <span class="stat-label">Playlists</span>
          </div>
          <div class="stat-item" @click="handleStatClick('followers')">
            <span class="stat-value">{{ isLockedPrivateProfile ? '—' : formatNumber(seguidoresCount) }}</span>
            <span class="stat-label">Seguidores</span>
          </div>
          <div class="stat-item" @click="handleStatClick('following')">
            <span class="stat-value">{{ isLockedPrivateProfile ? '—' : formatNumber(seguindoCount) }}</span>
            <span class="stat-label">Seguindo</span>
          </div>
        </div>

    <!-- Overlay de lock apenas quando privado -->
        <div v-if="isLockedPrivateProfile" class="header-lock-overlay">
          <i class="fa fa-lock"></i>
          <span v-if="solicitacaoPendente">Solicitação enviada. Aguarde aprovação.</span>
          <span v-else>Informações privadas</span>
        </div>
      </div>
    </div>
         
          <div class="profile-actions">
          <button 
  v-if="!isOwnProfile"
  class="btn-follow"
  @click="handleFollowAction"
  :disabled="solicitacaoPendente"
  :class="{
    following: isFollowing,
    pending: solicitacaoPendente,
    private: isLockedPrivateProfile && !isFollowing && !solicitacaoPendente
  }"
>
  <i :class="followButtonIcon"></i>
  {{ followButtonText }}
</button>

            <button class="btn-secondary" @click="shareProfile" title="Compartilhar">
              <i class="fa fa-share-alt"></i>
            </button>
            <button class="btn-secondary" @click="showMoreOptions" title="Mais opções">
              <i class="fa fa-ellipsis-h"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Menu de Contexto -->
      <transition name="fade">
        <div v-if="showContextMenu" class="context-menu" v-click-outside="closeContextMenu">
          <div class="context-item" @click="copyProfileUrl">
            <i class="fa fa-link"></i> Copiar link do perfil
          </div>
          <div class="context-item" @click="shareProfile">
            <i class="fa fa-share"></i> Compartilhar perfil
          </div>
          <div class="context-item" @click="reportUser">
            <i class="fa fa-flag"></i> Denunciar usuário
          </div>
          <div class="context-item" @click="blockUser">
            <i class="fa fa-ban"></i> Bloquear usuário
          </div>
        </div>
      </transition>

      <!-- Tabs de Navegação - Só Visão Geral aparece quando bloqueado -->
    <div class="tabs-nav-container" v-if="canViewContent || !canViewActivities">
  <div class="tabs-nav">
    <button
      v-for="tab in allTabs"
      :key="tab.id"
      :class="['tab-btn', { 
        active: activeTab === tab.id,
        'tab-locked': tab.locked 
      }]"
      @click="handleTabClick(tab.id)"
    >
      <i :class="tab.locked ? 'fa fa-lock' : tab.icon"></i>
      <span>{{ tab.label }}</span>
      <span class="tab-badge" v-if="!tab.locked && tab.count !== null">
        {{ formatNumber(tab.count) }}
      </span>
      <span class="tab-badge tab-badge-locked" v-if="tab.locked">
        <i class="fa fa-lock"></i>
      </span>
    </button>
  </div>
</div>

      <!-- Conteúdo das Tabs -->
      <div class="profile-content" v-if="canViewContent || !canViewActivities">
         <div v-if="isCurrentTabLocked" class="tab-content">
    <div class="locked-tab-content">
      <div class="locked-blur-container">
        <div class="locked-mock-content">
          <div class="locked-mock-header">
            <div class="locked-mock-line large"></div>
          </div>
          <div class="locked-mock-grid">
            <div v-for="n in 6" :key="n" class="locked-mock-card">
              <div class="locked-mock-image"></div>
              <div class="locked-mock-line medium"></div>
              <div class="locked-mock-line small"></div>
            </div>
          </div>
        </div>
        <div class="locked-overlay">
          <div class="locked-icon-wrapper">
            <i class="fa fa-lock"></i>
          </div>
          <h3>Conteúdo Privado</h3>
          <p>Este usuário optou por não compartilhar esta informação publicamente.</p>
        </div>
      </div>
    </div>
  </div>

        <!-- Tab: Visão Geral -->
        <div v-if="activeTab === 'overview'" class="tab-content">
          <div class="content-grid">
            <!-- Músicas Favoritas - Sempre aparece mas bloqueada se não puder ver -->
            <div class="content-section" :class="{ 'blurred-section': !canViewActivities, 'compact-section': !canViewActivities }">
              <div class="section-header">
                <h3><i class="fa fa-heart"></i> Músicas Favoritas</h3>
                <button class="btn-view-all" @click="handleStatClick('likes')" v-if="canViewActivities && musicasFavoritas.length > 5">
                  Ver todas <i class="fa fa-arrow-right"></i>
                </button>
                <i v-else-if="!canViewActivities" class="fa fa-lock lock-icon"></i>
              </div>
              
              <!-- Conteúdo normal quando pode ver -->
              <div v-if="canViewActivities" class="mini-list">
                <div
                  v-for="(musica, index) in musicasFavoritas.slice(0, 5)"
                  :key="musica.id"
                  class="mini-item"
                  @click="playMusic(musica)"
                >
                  <span class="mini-number">{{ index + 1 }}</span>
                  <div class="mini-image-wrapper">
                    <img :src="musica.cover" :alt="musica.nome" />
                    <div class="mini-overlay">
                      <i class="fa fa-play"></i>
                    </div>
                  </div>
                  <div class="mini-info">
                    <h4>{{ musica.nome }}</h4>
                    <p>{{ musica.artist }}</p>
                  </div>
                </div>
              </div>

              <!-- Conteúdo bloqueado quando não pode ver -->
              <div v-else class="blurred-content">
                <div class="blur-item" v-for="n in 5" :key="n">
                  <span class="mini-number blur-text">{{ n }}</span>
                  <div class="mini-image-wrapper blur-image"></div>
                  <div class="mini-info">
                    <h4 class="blur-text">████████</h4>
                    <p class="blur-text">███████</p>
                  </div>
                </div>
                <div class="blur-overlay">
                  <i class="fa fa-lock"></i>
                  <span>Conteúdo privado</span>
                </div>
              </div>
            </div>

            <!-- Playlists - Sempre aparece mas bloqueada se não puder ver -->
            <div class="content-section" :class="{ 'blurred-section': !canViewActivities, 'compact-section': !canViewActivities }">
              <div class="section-header">
                <h3><i class="fa fa-list"></i> Playlists Públicas</h3>
                <button class="btn-view-all" @click="handleStatClick('playlists')" v-if="canViewActivities && playlistsPublicas.length > 3">
                  Ver todas <i class="fa fa-arrow-right"></i>
                </button>
                <i v-else-if="!canViewActivities" class="fa fa-lock lock-icon"></i>
              </div>
              
              <!-- Conteúdo normal quando pode ver -->
              <div v-if="canViewActivities" class="playlist-grid">
                <div
                  v-for="playlist in playlistsPublicas.slice(0, 3)"
                  :key="playlist._id"
                  class="playlist-card"
                  @click="openPlaylist(playlist)"
                >
                  <img :src="playlist.cover || playlist.capa" :alt="playlist.nome" />
                  <h4>{{ playlist.nome }}</h4>
                  <p>{{ playlist.totalMusicas }} músicas</p>
                </div>
              </div>

              <!-- Conteúdo bloqueado quando não pode ver -->
              <div v-else class="blurred-content playlists-blur">
                <div class="blur-playlist" v-for="n in 3" :key="n">
                  <div class="blur-playlist-cover"></div>
                  <h4 class="blur-text">████████</h4>
                  <p class="blur-text">██ músicas</p>
                </div>
                <div class="blur-overlay">
                  <i class="fa fa-lock"></i>
                  <span>Conteúdo privado</span>
                </div>
              </div>
            </div>

            <!-- Atividades - Sempre aparece mas bloqueada se não puder ver -->
            <div class="content-section full-width" :class="{ 'blurred-section': !canViewActivities, 'compact-section': !canViewActivities }">
              <div class="section-header">
                <h3><i class="fa fa-pulse"></i> Atividade Recente</h3>
                <i v-if="!canViewActivities" class="fa fa-lock lock-icon"></i>
              </div>
              
              <!-- Conteúdo normal quando pode ver -->
              <div v-if="canViewActivities" class="activity-list">
                <div
                  v-for="atividade in atividadesRecentes.slice(0, 5)"
                  :key="atividade.id"
                  class="activity-item"
                >
                  <div class="activity-icon" :class="atividade.tipo">
                    <i :class="getActivityIcon(atividade.tipo)"></i>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text" v-html="atividade.texto"></p>
                    <span class="activity-time">{{ timeAgo(atividade.data) }}</span>
                  </div>
                </div>
              </div>

              <!-- Conteúdo bloqueado quando não pode ver -->
              <div v-else class="blurred-content activity-blur">
                <div class="blur-activity" v-for="n in 3" :key="n">
                  <div class="blur-activity-icon"></div>
                  <div class="blur-activity-content">
                    <p class="blur-text">████████████████████</p>
                    <span class="blur-text">██ horas atrás</span>
                  </div>
                </div>
                <div class="blur-overlay">
                  <i class="fa fa-lock"></i>
                  <span>Atividades privadas</span>
                </div>
              </div>
            </div>

            <!-- Mensagem quando não há conteúdo visível -->
            <div class="content-section full-width empty-message" v-if="!hasVisibleContent && canViewActivities">
              <i class="fa fa-eye-slash"></i>
              <p>Este usuário ainda não tem conteúdo público disponível.</p>
            </div>
          </div>
        </div>

        <!-- Tab: Curtidas -->
        <div v-if="activeTab === 'likes'" class="tab-content">
          <div class="content-section">
            <div class="section-header">
              <h3><i class="fa fa-heart"></i> Músicas Curtidas</h3>
              <span class="count-badge">{{ formatNumber(musicasFavoritas.length) }} músicas</span>
            </div>
            <div class="music-grid" v-if="musicasFavoritas.length > 0">
              <div
                v-for="musica in musicasFavoritas"
                :key="musica.id"
                class="music-card"
                @click="playMusic(musica)"
              >
                <div class="music-image-wrapper">
                  <img :src="musica.cover" :alt="musica.nome" />
                  <div class="music-overlay">
                    <i class="fa fa-play"></i>
                  </div>
                </div>
                <h4>{{ musica.nome }}</h4>
                <p>{{ musica.artist }}</p>
              </div>
            </div>
            <div class="empty-state" v-else>
              <p>Nenhuma música curtida ainda</p>
            </div>
          </div>
        </div>

        <!-- Tab: Playlists -->
        <div v-if="activeTab === 'playlists'" class="tab-content">
          <div class="playlists-full-grid">
            <div
              v-for="playlist in playlistsPublicas"
              :key="playlist._id"
              class="playlist-card-large"
              @click="openPlaylist(playlist)"
            >
              <div class="playlist-cover-large">
                <img :src="playlist.cover || playlist.capa" :alt="playlist.nome" />
                <div class="playlist-overlay">
                  <button class="btn-play-playlist-large">
                    <i class="fa fa-play"></i>
                  </button>
                </div>
              </div>
              <div class="playlist-info-large">
                <h4>{{ playlist.nome }}</h4>
                <p>{{ playlist.descricao || 'Sem descrição' }}</p>
                <div class="playlist-meta-large">
                  <span><i class="fa fa-music"></i> {{ playlist.musicas?.length || 0 }} músicas</span>
                  <span><i class="fa fa-heart"></i> {{ playlist.curtidas || 0 }} curtidas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: Seguidores -->
        <div v-if="activeTab === 'followers'" class="tab-content">
          <div class="users-grid" v-if="seguidoresList.length">
            <div
              v-for="user in seguidoresList"
              :key="user._id"
              class="user-card"
              @click="goToProfile(user)"
            >
              <div class="user-avatar-wrapper">
                <img :src="user.avatar || defaultAvatar" :alt="user.nome" class="user-avatar-large" />
              </div>
              <h4>{{ user.nome }}</h4>
              <p>@{{ user.username }}</p>
              <button
                v-if="!isOwnProfile && String(user._id) !== String(loggedUserId)"
                class="btn-follow-small"
                @click.stop="toggleFollowUser(user)"
                :class="{ 'following': user.isFollowing }"
              >
                {{ user.isFollowing ? 'Seguindo' : 'Seguir' }}
              </button>
            </div>
          </div>
          <div class="empty-state large" v-else>
            <p>Nenhum seguidor ainda</p>
          </div>
        </div>

        <!-- Tab: Seguindo -->
        <div v-if="activeTab === 'following'" class="tab-content">
          <div class="users-grid" v-if="seguindoList.length">
            <div
              v-for="item in seguindoList"
              :key="item._id"
              class="user-card"
              @click="goToProfile(item)"
            >
              <div class="user-avatar-wrapper">
                <img :src="item.avatar || item.foto || defaultAvatar" class="user-avatar-large" />
              </div>
              <h4>{{ item.nome }}</h4>
              <p v-if="item.tipo === 'usuario'">@{{ item.username }}</p>
              <p v-else class="cantor-label">Cantor</p>
            </div>
          </div>
          <div class="empty-state large" v-else>
            <p>Não segue ninguém ainda</p>
          </div>
        </div>
      </div>

      <!-- Mensagem de privacidade limitada -->
      <div v-if="!canViewContent && !isPrivateOrNotFound && canViewActivities" class="limited-content">
        <i class="fa fa-eye-slash"></i>
        <h4>Conteúdo limitado</h4>
        <p>Este usuário desativou a visualização de atividades e playlists.</p>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <div class="toast-content">
          <i :class="toast.icon"></i>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PerfilUsuario',
  
  data() {
    return {
      loading: true,
      usuario: {},
      estatisticas: {
        musicasCurtidas: 0,
        playlists: 0
      },
      seguidoresCount: 0,
      seguindoCount: 0,
      seguidoresList: [],
      seguindoList: [],
      musicasFavoritas: [],
      playlistsPublicas: [],
      atividadesRecentes: [],
      isFollowing: false,
      isOwnProfile: false,
      activeTab: 'overview',
      showContextMenu: false,
      notFound: false,
      defaultAvatar: '/default-avatar.png',
      loggedUserId: null,
      
      tabs: [
        { id: 'overview', label: 'Visão Geral', icon: 'fa fa-home', count: null, requiresActivity: false },
        { id: 'likes', label: 'Curtidas', icon: 'fa fa-heart', count: 0, requiresActivity: true },
        { id: 'playlists', label: 'Playlists', icon: 'fa fa-list', count: 0, requiresActivity: false },
        { id: 'followers', label: 'Seguidores', icon: 'fa fa-users', count: 0, requiresActivity: false },
        { id: 'following', label: 'Seguindo', icon: 'fa fa-user-plus', count: 0, requiresActivity: false }
      ],
      
      toast: {
        show: false,
        message: '',
        type: 'success',
        icon: 'fa fa-check-circle'
      },
      permissions: {
  perfil: true,
  curtidas: true,
  playlists: true,
  atividades: true,
  seguidores: true,
  seguindo: true,
  estatisticas: true
},
solicitacaoPendente: false,

    }
  },

  computed: {
    userId() {
      return this.$route.params.id
    },
    
  isPrivateOrNotFound() {
  if (this.notFound) return true
  if (this.isOwnProfile) return false
  return this.usuario?.perfilPrivado === true && this.usuario?.acessoLiberado === false
},
 
canViewActivities() {
  if (this.isLockedPrivateProfile) return false
  return this.permissions.curtidas || this.permissions.atividades
},

canViewPlaylists() {
  if (this.isLockedPrivateProfile) return false
  return this.permissions.playlists
},

canViewFollows() {
  if (this.isLockedPrivateProfile) return false
  return this.permissions.seguidores || this.permissions.seguindo
},

canViewContent() {
  if (this.isLockedPrivateProfile) return false
  return (
    this.permissions.curtidas ||
    this.permissions.playlists ||
    this.permissions.atividades ||
    this.permissions.seguidores ||
    this.permissions.seguindo
  )
},

isLockedPrivateProfile() {
  return (
    !this.notFound &&
    !this.isOwnProfile &&
    this.usuario?.perfilPrivado === true &&
    this.usuario?.acessoLiberado !== true
  )
},

followButtonText() {
  if (this.solicitacaoPendente) return 'Solicitação enviada'
  if (this.isFollowing) return 'Seguindo'
  if (this.isLockedPrivateProfile) return 'Solicitar para seguir'
  return 'Seguir'
},

followButtonIcon() {
  if (this.solicitacaoPendente) return 'fa fa-clock-o'
  if (this.isFollowing) return 'fa fa-check'
  if (this.isLockedPrivateProfile) return 'fa fa-user-plus'
  return 'fa fa-plus'
},
    
    hasVisibleContent() {
      return (this.canViewActivities && this.musicasFavoritas.length > 0) ||
             (this.canViewPlaylists && this.playlistsPublicas.length > 0) ||
             (this.canViewActivities && this.atividadesRecentes.length > 0)
    },
    
allTabs() {
  const lockedByPrivate = this.isLockedPrivateProfile

  return [
    { 
      id: 'overview', 
      label: 'Visão Geral', 
      icon: 'fa fa-home', 
      count: null, 
      locked: false 
    },
    { 
      id: 'likes', 
      label: 'Curtidas', 
      icon: 'fa fa-heart', 
      count: this.estatisticas.musicasCurtidas, 
      locked: lockedByPrivate || !this.permissions.curtidas
    },
    { 
      id: 'playlists', 
      label: 'Playlists', 
      icon: 'fa fa-list', 
      count: this.playlistsPublicas.length, 
      locked: lockedByPrivate || !this.permissions.playlists
    },
    { 
      id: 'followers', 
      label: 'Seguidores', 
      icon: 'fa fa-users', 
      count: this.seguidoresCount, 
      locked: lockedByPrivate || !this.permissions.seguidores
    },
    { 
      id: 'following', 
      label: 'Seguindo', 
      icon: 'fa fa-user-plus', 
      count: this.seguindoCount, 
      locked: lockedByPrivate || !this.permissions.seguindo
    }
  ]
},

isCurrentTabLocked() {
  const tab = this.allTabs.find(t => t.id === this.activeTab)
  return tab ? tab.locked : false
},
    
    coverStyle() {
      return this.usuario.cover
        ? {
            backgroundImage: `url(${this.usuario.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }
        : {
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          }
    },
    
    userInitials() {
      if (!this.usuario.nome) return 'U'
      return this.usuario.nome
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    
    generatedAvatarStyle() {
      const str = this.usuario.id || this.usuario.nome || 'default'
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      
      const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
      ]
      
      return {
        background: gradients[Math.abs(hash) % gradients.length],
        color: '#fff'
      }
    },
    
    isNewMember() {
      if (!this.usuario.membroDesde) return false
      const dias = Math.floor((Date.now() - new Date(this.usuario.membroDesde)) / (1000 * 60 * 60 * 24))
      return dias <= 30
    },
    
    isOnline() {
      // Lógica simplificada - pode ser melhorada com WebSocket
      return Math.random() > 0.7 // Simulação
    }
  },

  watch: {
    '$route.params.id': {
      immediate: true,
      handler() {
        this.resetState()
        this.loggedUserId = this.getLoggedUserId()
        this.carregarPerfil()
      }
    }
  },

  methods: {
    resetState() {
      this.loading = true
      this.usuario = {}
      this.estatisticas = {
        musicasCurtidas: 0,
        playlists: 0
      }
      this.seguidoresCount = 0
      this.seguindoCount = 0
      this.seguidoresList = []
      this.seguindoList = []
      this.musicasFavoritas = []
      this.playlistsPublicas = []
      this.atividadesRecentes = []
      this.isFollowing = false
      this.isOwnProfile = false
      this.activeTab = 'overview'
      this.showContextMenu = false
      this.notFound = false
      this.permissions = {
  perfil: true,
  curtidas: true,
  playlists: true,
  atividades: true,
  seguidores: true,
  seguindo: true,
  estatisticas: true
}
this.solicitacaoPendente = false
    },

 handleTabClick(tab) {
  this.activeTab = tab
},

handleStatClick(type) {
  if (this.isLockedPrivateProfile) {
    this.showToast(
      this.solicitacaoPendente
        ? 'Solicitação enviada. Aguarde aprovação para ver este conteúdo'
        : 'Este perfil é privado. Envie uma solicitação para seguir',
      'info'
    )
    return
  }

  const tabMap = {
    likes: 'likes',
    playlists: 'playlists',
    followers: 'followers',
    following: 'following'
  }

  const permissionMap = {
    likes: this.permissions.curtidas,
    playlists: this.permissions.playlists,
    followers: this.permissions.seguidores,
    following: this.permissions.seguindo
  }

  if (!permissionMap[type]) {
    this.showToast('Não é possível ver essas informações', 'info')
    return
  }

  this.activeTab = tabMap[type]
},

handleFollowAction() {
  if (this.solicitacaoPendente) return
  this.toggleFollow()
},

    getLoggedUserId() {
      const user = localStorage.getItem('usuario')
      return user ? JSON.parse(user).id : null
    },
    
    getAuthConfig() {
      const token = localStorage.getItem('token')
      return {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    },

    getAuthConfigOptional() {
      const token = localStorage.getItem('token')
      return token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        : {}
    },

async carregarPerfil() {
  this.loading = true

  try {
    const res = await axios.get(
      `http://localhost:3002/usuarios/${this.userId}`,
      this.getAuthConfigOptional()
    )

    this.usuario = res.data || {}
    this.isOwnProfile = String(this.usuario.id) === String(this.loggedUserId)
    this.solicitacaoPendente = !!this.usuario.solicitacaoPendente

    if (this.isOwnProfile) {
      this.$router.replace('/perfil')
      return
    }

    // Se perfil privado e ainda não liberado → só dados públicos (bio, avatar, nome)
    if (this.usuario.perfilPrivado && this.usuario.acessoLiberado === false) {
      this.permissions = {
        perfil: true,
        curtidas: false,
        playlists: false,
        atividades: false,
        seguidores: false,
        seguindo: false,
        estatisticas: false
      }
      // ❌ NÃO chama nada aqui — mantém bio visível, resto bloqueado
    } else {
      // ✅ Só carrega o resto se tiver acesso liberado
      await Promise.allSettled([
        this.carregarEstatisticas(),
        this.carregarFollows(),
        this.carregarCurtidas(),
        this.carregarPlaylists(),
        this.carregarAtividades()
      ])
    }

    // Garante que a tab ativa seja válida
    const allowedTabs = this.allTabs.filter(t => !t.locked).map(t => t.id)
    if (!allowedTabs.includes(this.activeTab)) {
      this.activeTab = 'overview'
    }

  } catch (error) {
    if (error.response?.status === 404) {
      this.notFound = true
    } else {
      console.error(error)
      this.showToast('Erro ao carregar perfil', 'error')
    }
  } finally {
    this.loading = false
  }
},

   async carregarEstatisticas() {
  try {
    const res = await axios.get(
      `http://localhost:3002/usuarios/${this.userId}/estatisticas`,
      this.getAuthConfigOptional()
    )

    this.estatisticas = res.data || {
      musicasCurtidas: 0,
      playlists: 0
    }

    this.permissions.estatisticas = true
  } catch (error) {
    if (error.response?.status === 403) {
      this.permissions.estatisticas = false
      this.estatisticas = {
        musicasCurtidas: 0,
        playlists: 0
      }
      return
    }

    console.error('Erro ao carregar estatísticas:', error)
  }
},
    
    async carregarFollows() {
  try {
    const [resSeguidores, resSeguindoUsuarios, resSeguindoCantores] = await Promise.allSettled([
      axios.get(`http://localhost:3002/follows/seguidores/${this.userId}?tipo=usuario`),
      axios.get(`http://localhost:3002/follows/seguindo/${this.userId}?tipo=usuario`),
      axios.get(`http://localhost:3002/follows/seguindo/${this.userId}?tipo=cantor`)
    ])

    if (resSeguidores.status === 'fulfilled') {
      this.seguidoresList = resSeguidores.value.data || []
      this.seguidoresCount = this.seguidoresList.length
      this.permissions.seguidores = true

      if (this.loggedUserId) {
        this.isFollowing = this.seguidoresList.some(
          s => String(s.seguidor_id?._id || s.seguidor_id) === String(this.loggedUserId)
        )
      }
    } else {
      this.permissions.seguidores = false
      this.seguidoresList = []
      this.seguidoresCount = 0
    }

    const seguindoUsuarios = resSeguindoUsuarios.status === 'fulfilled'
      ? (resSeguindoUsuarios.value.data || []).map(u => ({ ...u, tipo: 'usuario' }))
      : []

    const seguindoCantores = resSeguindoCantores.status === 'fulfilled'
      ? (resSeguindoCantores.value.data || []).map(c => ({ ...c, tipo: 'cantor' }))
      : []

    this.seguindoList = [...seguindoUsuarios, ...seguindoCantores]
    this.seguindoCount = this.seguindoList.length
    this.permissions.seguindo = resSeguindoUsuarios.status === 'fulfilled' || resSeguindoCantores.status === 'fulfilled'
  } catch (error) {
    console.error('Erro ao carregar follows:', error)
  }
},
    
    async carregarCurtidas() {
  try {
    const res = await axios.get(
      `http://localhost:3002/usuarios/${this.userId}/curtidas/publicas`,
      this.getAuthConfigOptional()
    )

    this.musicasFavoritas = Array.isArray(res.data) ? res.data : []
    this.permissions.curtidas = true
  } catch (error) {
    if (error.response?.status === 403) {
      this.permissions.curtidas = false
      this.musicasFavoritas = []
      return
    }

    console.error('Erro ao carregar curtidas:', error)
  }
},
    
    async carregarPlaylists() {
  try {
    const res = await axios.get(
      `http://localhost:3002/usuarios/${this.userId}/playlists/publicas`,
      this.getAuthConfigOptional()
    )

    this.playlistsPublicas = Array.isArray(res.data) ? res.data : []
    this.permissions.playlists = true
  } catch (error) {
    if (error.response?.status === 403) {
      this.permissions.playlists = false
      this.playlistsPublicas = []
      return
    }

    console.error('Erro ao carregar playlists:', error)
  }
},
    
    async carregarAtividades() {
  try {
    // enquanto não existir endpoint real, você pode manter mock
    // mas agora respeitando a permissão
    this.permissions.atividades = true

    this.atividadesRecentes = [
      {
        id: 1,
        tipo: 'like',
        texto: `Curtiu <strong>Yesterday</strong> de <strong>The Beatles</strong>`,
        data: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: 2,
        tipo: 'playlist',
        texto: `Criou a playlist <strong>Rock Clássico</strong>`,
        data: new Date(Date.now() - 1000 * 60 * 60 * 2)
      }
    ]
  } catch (error) {
    this.permissions.atividades = false
    this.atividadesRecentes = []
  }
},

async toggleFollow() {
  try {
    const token = localStorage.getItem('token')

    if (this.isFollowing) {
      await axios.delete(
        `http://localhost:3002/follows/desseguir`,
        {
          data: {
            seguindo_id: this.userId,
            tipo: 'usuario'
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      this.isFollowing = false
      this.solicitacaoPendente = false
      this.seguidoresCount = Math.max(0, this.seguidoresCount - 1)

      this.showToast(`Você deixou de seguir ${this.usuario.nome}`, 'info')
      return
    }

    const res = await axios.post(
      `http://localhost:3002/follows/seguir`,
      {
        seguindo_id: this.userId,
        tipo: 'usuario'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (res.data?.solicitado) {
      this.solicitacaoPendente = true
      this.isFollowing = false

      this.showToast('Solicitação enviada! Aguarde aprovação.', 'success')
      return
    }

    if (res.data?.follow) {
      this.isFollowing = true
      this.solicitacaoPendente = false
      this.seguidoresCount++

      this.showToast(`Agora seguindo ${this.usuario.nome}`, 'success')
      await this.carregarPerfil()
    }

  } catch (error) {
    this.showToast(error.response?.data?.error || 'Erro', 'error')
  }
},
    
  async solicitarSeguir() {
  await this.toggleFollow()
},
    
    playMusic(musica) {
      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: {
            id: musica.id,
            title: musica.nome,
            artist: musica.artist,
            cover: musica.cover,
            url: musica.url
          },
          context: 'perfil-usuario'
        }
      }))
    },
    
    openPlaylist(playlist) {
      this.$router.push(`/playlist/${playlist._id}`)
    },
    
    goToProfile(item) {
      const id = item._id || item.id

      if (item.tipo === 'cantor') {
        this.$router.push(`/cantor/${id}`)
        return
      }

      if (String(id) === String(this.loggedUserId)) {
        return this.$router.push('/perfil')
      }

      this.$router.push({
        name: 'PerfilUsuario',
        params: { id }
      })
    },
    
    shareProfile() {
      const url = `${window.location.origin}/usuario/${this.userId}`
      navigator.clipboard.writeText(url)
      this.showToast('Link copiado!', 'success')
      this.closeContextMenu()
    },
    
    copyProfileUrl() {
      this.shareProfile()
    },
    
    reportUser() {
      this.showToast('Denúncia enviada. Obrigado!', 'info')
      this.closeContextMenu()
    },
    
    blockUser() {
      this.showToast('Usuário bloqueado', 'info')
      this.closeContextMenu()
    },
    
    showMoreOptions() {
      this.showContextMenu = !this.showContextMenu
    },
    
    closeContextMenu() {
      this.showContextMenu = false
    },
    
    handleAvatarError() {
      this.usuario.avatar = null
    },
    
    formatDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      })
    },
    
    formatNumber(num) {
      if (!num) return '0'
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
      return num.toString()
    },
    
    timeAgo(date) {
      if (!date) return ''
      const seconds = Math.floor((new Date() - new Date(date)) / 1000)
      const intervals = {
        ano: 31536000,
        mês: 2592000,
        dia: 86400,
        hora: 3600,
        minuto: 60
      }
      
      for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit)
        if (interval >= 1) {
          return `${interval} ${unit}${interval > 1 ? 's' : ''} atrás`
        }
      }
      return 'Agora'
    },
    
    getActivityIcon(tipo) {
      const icons = {
        like: 'fa fa-heart',
        playlist: 'fa fa-list',
        follow: 'fa fa-user-plus',
        share: 'fa fa-share'
      }
      return icons[tipo] || 'fa fa-circle'
    },
    
    showToast(message, type = 'success') {
      const icons = {
        success: 'fa fa-check-circle',
        error: 'fa fa-exclamation-circle',
        info: 'fa fa-info-circle'
      }
      
      this.toast = {
        show: true,
        message,
        type,
        icon: icons[type]
      }
      
      setTimeout(() => {
        this.toast.show = false
      }, 3000)
    }
  }
}
</script>

<style scoped>
.perfil-usuario {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  color: #f8fafc;
  font-family: 'Segoe UI', system-ui, sans-serif;
  padding-bottom: 100px;
}

.skeleton-wrapper {
  width: 100%;
}

.skeleton-cover {
  width: 100%;
  height: 380px;
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
/* 🔥 Modo compacto quando atividades desativadas */
.compact-section {
  padding: 12px !important;
}

/* diminuir altura dos itens */
.compact-section .blur-item,
.compact-section .blur-activity {
  padding: 6px;
  margin-bottom: 6px;
}

/* diminuir imagens */
.compact-section .blur-image {
  width: 36px;
  height: 36px;
}

.compact-section .blur-playlist-cover {
  height: 80px;
}

/* diminuir ícones */
.compact-section .blur-activity-icon {
  width: 28px;
  height: 28px;
}

/* diminuir textos fake */
.compact-section .blur-text {
  font-size: 10px;
}

/* reduzir overlay */
.compact-section .blur-overlay i {
  font-size: 22px;
}

.compact-section .blur-overlay span {
  font-size: 11px;
}

/* reduzir altura geral das seções */
.compact-section {
  max-height: 180px;
  overflow: hidden;
}

.skeleton-profile {
  display: flex;
  gap: 24px;
  padding: 24px 40px 0;
  margin-top: 0;
}

.skeleton-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border: 4px solid #0f172a;
}

.skeleton-info {
  flex: 1;
  padding-top: 20px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  margin-bottom: 12px;
}

.skeleton-line.large { width: 200px; height: 32px; }
.skeleton-line.medium { width: 150px; height: 20px; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Perfil Privado/Não Encontrado */
.private-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 40px;
}

.private-profile i {
  font-size: 64px;
  color: #64748b;
  margin-bottom: 24px;
}

.private-profile h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.private-profile p {
  color: #94a3b8;
  margin-bottom: 24px;
}

/* Header do Perfil */
.profile-header {
  position: relative;
  margin-bottom: 40px;
}

.cover-image {
  width: 100%;
  height: 420px;
  position: relative;
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 50%);
}

.profile-info-container {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 24px 40px 0;
  margin-top: 0; /* REMOVIDO: margin-top: -60px */
  position: relative;
  z-index: 10;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, transparent 100%);
}

.avatar-section {
  flex-shrink: 0;
  margin-top: 0; /* Avatar ainda sobrepõe levemente o banner */
}

.avatar-wrapper {
  position: relative;
  margin-top: 8px;
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #0f172a;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.avatar.generated-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
}

.avatar-status {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: #22c55e;
  border: 3px solid #0f172a;
  border-radius: 50%;
}

.user-details {
  flex: 1;
  padding-bottom: 16px;
  padding-top: 8px; /* Espaçamento para alinhar com avatar */
}
.user-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-verified {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-new {
  background: #22c55e;
  color: white;
}

.user-name {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 4px 0;
}

.user-handle {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.user-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #94a3b8;
}

.user-bio {
  font-size: 15px;
  color: #cbd5e1;
  margin: 0 0 16px 0;
  max-width: 500px;
  line-height: 1.5;
}

.user-genres {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.genre-tag {
  padding: 4px 12px;
  background: rgba(236, 72, 153, 0.15);
  border-radius: 16px;
  font-size: 12px;
  color: #ec4899;
  font-weight: 600;
}

.user-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.stat-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stat-item.disabled:hover {
  background: rgba(239, 68, 68, 0.1);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
}

.profile-actions {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
}

.user-private-info-wrapper {
  position: relative;
  border-radius: 16px;
  min-height: 150px;
}

.user-bio {
  position: relative;
  z-index: 3;
}

.user-private-info-wrapper.locked {
  padding: 18px;
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
}

.user-private-info-wrapper.locked::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(51, 65, 85, 0.45) 0%, rgba(71, 85, 105, 0.25) 50%, rgba(51, 65, 85, 0.45) 100%);
  filter: blur(10px);
  opacity: 0.9;
   z-index: 1;
}

.header-lock-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.52);
  backdrop-filter: blur(6px);
  border-radius: 16px;
  text-align: center;
  padding: 16px;
}

.header-lock-overlay i {
  font-size: 26px;
  color: #ef4444;
}

.header-lock-overlay span {
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 600;
}

.btn-follow.pending {
  background: transparent;
  border: 1px solid rgba(251, 191, 36, 0.35);
  color: #fbbf24;
}

.btn-follow.private {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.btn-secondary-inline {
  width: auto;
  height: auto;
  border-radius: 20px;
  padding: 10px 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-follow {
  padding: 10px 24px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-follow.following {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
}

.btn-secondary {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  cursor: pointer;
}

/* Context Menu */
.context-menu {
  position: absolute;
  top: 350px;
  right: 40px;
  background: #1e293b;
  border-radius: 12px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.context-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #cbd5e1;
}

.context-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Tabs */
.tabs-nav-container {
  padding: 0 40px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tabs-nav {
  display: flex;
  gap: 8px;
}

.tab-btn {
  padding: 16px 20px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}

.tab-btn:hover, .tab-btn.active {
  color: #ec4899;
  border-bottom-color: #ec4899;
}

.tab-badge {
  background: rgba(236, 72, 153, 0.2);
  color: #ec4899;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
}

/* Conteúdo */
.profile-content {
  padding: 0 40px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.content-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  position: relative;
}

.content-section.full-width {
  grid-column: 1 / -1;
}

.content-section.empty-message {
  text-align: center;
  padding: 48px;
  color: #64748b;
}

.content-section.empty-message i {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Seção bloqueada/blur */
.blurred-section {
  position: relative;
}

.lock-icon {
  color: #ef4444;
  font-size: 16px;
}

.blurred-content {
  position: relative;
  filter: blur(4px);
  user-select: none;
  pointer-events: none;
}

.blur-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  margin-bottom: 8px;
}

.blur-text {
  background: linear-gradient(90deg, #334155 0%, #475569 50%, #334155 100%);
  background-size: 200% 100%;
  color: transparent;
  border-radius: 4px;
  animation: shimmer 2s infinite;
}

.blur-image {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  border-radius: 6px;
  animation: shimmer 2s infinite;
}

.blur-playlist {
  text-align: center;
}

.blur-playlist-cover {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  border-radius: 8px;
  margin-bottom: 8px;
  animation: shimmer 2s infinite;
}

.blur-activity {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  margin-bottom: 8px;
}

.blur-activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  animation: shimmer 2s infinite;
}

.blur-activity-content {
  flex: 1;
}

.blur-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 16px;
  z-index: 10;
}

.blur-overlay i {
  font-size: 32px;
  color: #ef4444;
}

.blur-overlay span {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.btn-view-all {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-view-all:hover {
  color: #ec4899;
}

/* Mini Lista */
.mini-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.mini-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mini-number {
  width: 24px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.mini-image-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
}

.mini-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.mini-item:hover .mini-overlay {
  opacity: 1;
}

.mini-overlay i {
  color: white;
}

.mini-info {
  flex: 1;
  min-width: 0;
}

.mini-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-info p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* Grid de Playlists */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-card img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 8px;
}

.playlist-card h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-card p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* Atividades */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  transition: background 0.2s;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.activity-icon.like { background: rgba(236, 72, 153, 0.2); color: #ec4899; }
.activity-icon.playlist { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.activity-icon.follow { background: rgba(34, 197, 94, 0.2); color: #22c55e; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.activity-time {
  font-size: 12px;
  color: #64748b;
}

/* Grid de Músicas */
.music-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.music-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.music-card:hover {
  transform: translateY(-4px);
}
/* ========== TAB BLOQUEADA NO MENU ========== */
.tab-btn.tab-locked {
  color: #ef4444;
  opacity: 0.7;
  cursor: pointer;
}

.tab-btn.tab-locked:hover {
  color: #f87171;
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
}

.tab-btn.tab-locked.active {
  border-bottom-color: #ef4444;
  color: #f87171;
  opacity: 1;
}

.tab-badge-locked {
  background: rgba(239, 68, 68, 0.2) !important;
  color: #ef4444 !important;
  font-size: 10px;
  padding: 2px 6px;
}

/* ========== CONTEÚDO BLOQUEADO (TELA CHEIA) ========== */
.locked-tab-content {
  padding: 40px 0;
}

.locked-blur-container {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  min-height: 400px;
}

.locked-mock-content {
  filter: blur(8px) grayscale(0.6);
  opacity: 0.4;
  padding: 24px;
  pointer-events: none;
  user-select: none;
}

.locked-mock-header {
  margin-bottom: 24px;
}

.locked-mock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.locked-mock-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
}

.locked-mock-image {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  border-radius: 8px;
  margin-bottom: 12px;
  animation: shimmer 2s infinite;
}

.locked-mock-line {
  height: 12px;
  background: linear-gradient(90deg, #334155 0%, #475569 50%, #334155 100%);
  background-size: 200% 100%;
  border-radius: 6px;
  margin-bottom: 8px;
  animation: shimmer 2s infinite;
}

.locked-mock-line.large { width: 40%; height: 20px; }
.locked-mock-line.medium { width: 70%; }
.locked-mock-line.small { width: 50%; height: 10px; }

.locked-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.locked-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
  animation: pulse-lock 2s infinite;
}

.locked-icon-wrapper i {
  font-size: 36px;
  color: white;
}

.locked-overlay h3 {
  font-size: 22px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
}

.locked-overlay p {
  font-size: 14px;
  color: #94a3b8;
  max-width: 320px;
  text-align: center;
  margin: 0;
}

@keyframes pulse-lock {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
  }
  50% { 
    transform: scale(1.05); 
    box-shadow: 0 12px 40px rgba(239, 68, 68, 0.5);
  }
}

/* ========== MELHORIAS NO BLUR EXISTENTE DA OVERVIEW ========== */
.blur-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px) saturate(0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 16px;
  z-index: 10;
  transition: all 0.3s ease;
}

.blur-overlay i {
  font-size: 36px;
  color: #ef4444;
  filter: drop-shadow(0 4px 12px rgba(239, 68, 68, 0.4));
}

.blur-overlay span {
  font-size: 14px;
  color: #cbd5e1;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.blurred-section:hover .blur-overlay {
  background: rgba(15, 23, 42, 0.7);
}

.blurred-section:hover .blur-overlay i {
  transform: scale(1.1);
}
.music-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}

.music-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.music-card:hover .music-overlay {
  opacity: 1;
}

.music-overlay i {
  color: white;
  font-size: 24px;
}

.music-card h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-card p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* Playlists Full */
.playlists-full-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.playlist-card-large {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.playlist-card-large:hover {
  transform: translateY(-4px);
  border: 1px solid rgba(236, 72, 153, 0.3);
}

.playlist-cover-large {
  position: relative;
  aspect-ratio: 16/10;
}

.playlist-cover-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-card-large:hover .playlist-overlay {
  opacity: 1;
}

.btn-play-playlist-large {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  font-size: 20px;
  cursor: pointer;
}

.playlist-info-large {
  padding: 16px;
}

.playlist-info-large h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.playlist-info-large p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.playlist-meta-large {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #94a3b8;
}

/* Users Grid */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.user-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.user-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.user-avatar-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-card h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.user-card p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.btn-follow-small {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-follow-small.following {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
}

/* Limited Content */
.limited-content {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.limited-content i {
  font-size: 48px;
  margin-bottom: 16px;
}

.limited-content h4 {
  font-size: 18px;
  color: #f8fafc;
  margin-bottom: 8px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.empty-state.large {
  padding: 60px;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  background: #1e293b;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  z-index: 10000;
}

.toast-notification.success {
  border-left: 4px solid #22c55e;
}

.toast-notification.error {
  border-left: 4px solid #ef4444;
}

.toast-notification.info {
  border-left: 4px solid #3b82f6;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #f8fafc;
}

/* Animações */
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-enter-active {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .profile-info-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 20px;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .profile-actions {
    width: 100%;
    justify-content: center;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .tabs-nav-container {
    padding: 0 20px;
  }
  
  .tabs-nav {
    overflow-x: auto;
  }
  
  .profile-content {
    padding: 0 20px;
  }
  
  .context-menu {
    right: 20px;
  }
}
</style>