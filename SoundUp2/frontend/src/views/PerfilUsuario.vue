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
            <div class="avatar-wrapper" :class="{ 'avatar-gold': usuario.hasGoldenAvatar || isAvatarGoldEquipped } ">
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
<div class="context-item" @click="openReportModal">
  <i class="fa fa-flag"></i> Denunciar usuário
</div>

<div class="context-item" @click="toggleUserBlock">
  <i :class="blockActionIcon"></i> {{ blockActionLabel }}
</div>
        </div>
      </transition>

      <div v-if="isBlockedProfile" class="blocked-profile-state">
  <div class="blocked-profile-card">
    <i class="fa fa-ban"></i>
    <h3>{{ blockedProfileMessage }}</h3>
    <p v-if="isBlockedByMe">
      Você bloqueou este usuário. Enquanto o bloqueio estiver ativo, o perfil fica indisponível.
    </p>
    <p v-else>
      Este perfil não está disponível para visualização.
    </p>

    <button
      v-if="isBlockedByMe"
      class="btn-follow"
      @click="toggleUserBlock"
    >
      <i class="fa fa-unlock"></i>
      Desbloquear
    </button>
  </div>
</div>

      <!-- Tabs de Navegação - Só Visão Geral aparece quando bloqueado -->
   <div
  v-if="canViewContent || !canViewActivities"
  class="tabs-nav-container"
>
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
  <div
  v-if="canViewContent || !canViewActivities"
  class="profile-content"
>
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
               <button class="btn-view-all" @click="handleStatClick('playlists')" v-if="canViewPlaylists && visiblePlaylists.length > 3">
                  Ver todas <i class="fa fa-arrow-right"></i>
                </button>
                <i v-else-if="!canViewActivities" class="fa fa-lock lock-icon"></i>
              </div>
              
              <!-- Conteúdo normal quando pode ver -->
              <div v-if="canViewActivities" class="playlist-grid">
<div
  v-for="playlist in visiblePlaylists.slice(0, 3)"
  :key="playlist._id || playlist.id"
  class="playlist-card"
  @click="openPlaylist(playlist)"
>
  <div style="position: relative;">
    <img :src="playlist.cover || playlist.capa || blackCover" :alt="playlist.nome" />
    <div v-if="isPlaylistPrivate(playlist)" class="playlist-private-badge">
      <i class="fa fa-lock"></i>
    </div>
  </div>

  <h4>{{ playlist.nome }}</h4>
  <p>{{ getPlaylistSongCount(playlist) }} {{ getPlaylistSongCount(playlist) === 1 ? 'música' : 'músicas' }}</p>
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
             <span class="count-badge">{{ formatNumber(estatisticas.musicasCurtidas) }} músicas</span>
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
  v-for="playlist in visiblePlaylists"
  :key="playlist._id || playlist.id"
  class="playlist-card-large"
  @click="openPlaylist(playlist)"
>
              <div class="playlist-cover-large">
                <img :src="playlist.cover || playlist.capa || blackCover" :alt="playlist.nome" />
        <div v-if="isPlaylistPrivate(playlist)" class="playlist-private-badge large">
  <i class="fa fa-lock"></i>
</div>
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
                <span>
  <i class="fa fa-music"></i>
  {{ getPlaylistSongCount(playlist) }}
  {{ getPlaylistSongCount(playlist) === 1 ? 'música' : 'músicas' }}
</span>

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
  <img
    :src="user.avatar || user.foto || defaultAvatar"
    :alt="user.nome || user.username"
    class="user-avatar-large"
    @error="$event.target.src = defaultAvatar"
  />
</div>
<h4>{{ user.nome || user.username }}</h4>
<p>@{{ user.username }}</p>
              <button
                v-if="!isOwnProfile && String(user._id) !== String(loggedUserId)"
                class="btn-follow-small"
                @click.stop="toggleFollowUser(user)"
                :class="{ 'following': user.isFollowing }"
              >
                {{ user.isFollowing ? 'Seguindo' : 'Seguir' }}
              </button>

              <button
  v-if="!isOwnProfile && isBlockedByMe"
  class="btn-follow following"
  @click="toggleUserBlock"
>
  <i class="fa fa-unlock"></i>
  Desbloquear
</button>

<button
  v-else-if="!isOwnProfile && !blockedMe"
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
  <img 
    :src="item.avatar || item.foto || defaultAvatar" 
    class="user-avatar-large"
    @error="$event.target.src = defaultAvatar"
  />
</div>
<h4>{{ item.nome || item.username || 'Usuário' }}</h4>
<p v-if="item.tipo === 'usuario'">@{{ item.username }}</p>
<p v-else class="cantor-label">{{ item.nome || 'Cantor' }}</p>
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
    </div> <!-- fecha profile-content-wrapper (v-else) -->

    <!-- ============================================ -->
    <!-- MODAIS GLOBAIS — FORA DE QUALQUER v-if/v-else -->
    <!-- ============================================ -->

    <!-- MODAL PLAYLIST -->
    <transition name="fade">
      <div
        v-if="showPlaylistModal && selectedPlaylist"
        class="playlist-modal-overlay"
        @click.self="showPlaylistModal = false"
      >
      <div class="playlist-modal">

  <button class="playlist-modal-close" @click="showPlaylistModal = false">
    <i class="fa fa-times"></i>
  </button>

  <!-- Loading -->
  <div v-if="loading" style="text-align: center; padding: 60px;">
    <div class="spinner-small" style="margin: 0 auto 16px;"></div>
    <p style="color: #94a3b8;">Carregando playlist...</p>
  </div>

  <template v-else>
        <img
      :src="selectedPlaylist.cover || selectedPlaylist.capa || selectedPlaylist.foto || blackCover"
      class="playlist-modal-cover"
    />

    <h2>{{ selectedPlaylist.nome || 'Playlist' }}</h2>

    <p>
      {{ selectedPlaylist.musicas?.length || 0 }}
      {{ (selectedPlaylist.musicas?.length || 0) === 1 ? 'música' : 'músicas' }}
    </p>

    <!-- Lista de músicas -->
    <div class="playlist-modal-list" v-if="selectedPlaylist.musicas?.length > 0">
      <div
        v-for="(musica, index) in selectedPlaylist.musicas"
        :key="musica.id || index"
        class="playlist-modal-song"
      >
        <span class="song-index">{{ index + 1 }}</span>

              <img :src="getMusicaCover(musica)" class="song-thumb" @error="$event.target.src = blackCover" :key="musica.id || musica._id" />

        <div class="playlist-modal-song-info" @click="playMusic(musica)">
          <h4>{{ musica.nome || 'Sem nome' }}</h4>
          <p>{{ musica.artist || 'Desconhecido' }}</p>
        </div>

     <div class="playlist-modal-song-actions">
  <button 
    class="btn-modal-action btn-like"
    :class="{ active: isMusicaCurtida(musica) }"
    @click.stop="curtirMusica(musica, $event)"
    :title="isMusicaCurtida(musica) ? 'Descurtir' : 'Curtir'"
  >
    <i :class="isMusicaCurtida(musica) ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
  </button>
  <button 
    class="btn-modal-action btn-star"
    :class="{ active: isMusicaFavoritada(musica) }"
    @click.stop="favoritarMusica(musica, $event)"
    :title="isMusicaFavoritada(musica) ? 'Remover dos favoritos' : 'Favoritar'"
  >
    <i :class="isMusicaFavoritada(musica) ? 'fa fa-star' : 'fa fa-star-o'"></i>
  </button>
  <button 
    class="btn-modal-action btn-add"
    @click.stop="abrirModalAdicionarPlaylist(musica, $event)"
    title="Adicionar à playlist"
  >
    <i class="fa fa-plus"></i>
  </button>
</div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state" style="padding: 40px; text-align: center;">
      <i class="fa fa-music" style="font-size: 48px; color: #64748b; margin-bottom: 16px; display: block;"></i>
      <p style="color: #94a3b8;">Esta playlist ainda não tem músicas</p>
    </div>
  </template>
</div>
      </div>
    </transition>

  <!-- MODAL ADICIONAR À PLAYLIST -->
    <transition name="fade">
      <div
        v-if="showAddToPlaylistModal"
        class="playlist-modal-overlay"
        @click.self="fecharModalAddPlaylist"
      >
        <div class="playlist-modal add-to-playlist-modal">
          <button class="playlist-modal-close" @click="fecharModalAddPlaylist">
            <i class="fa fa-times"></i>
          </button>

          <div class="modal-header-playlist">
            <div class="modal-music-preview">
              <img :src="musicaParaAdicionar?.cover || blackCover" />
              <div class="modal-music-info">
                <span class="modal-music-label">Adicionar à playlist</span>
                <h3 class="modal-music-title">{{ musicaParaAdicionar?.title }}</h3>
                <p class="modal-music-artist">{{ musicaParaAdicionar?.artist }}</p>
              </div>
            </div>
          </div>

          <div class="modal-actions-bar">
            <div class="search-playlist-box">
              <i class="fa fa-search"></i>
              <input
                type="text"
                v-model="playlistSearchQuery"
                placeholder="Buscar playlist..."
              />
            </div>
          </div>

          <div class="modal-body-playlist">
            <div v-if="isLoadingUserPlaylists" class="modal-loading">
              <div class="spinner-small"></div>
              <span>Carregando playlists...</span>
            </div>

            <div v-else-if="filteredUserPlaylists.length === 0" class="empty-playlists-modern">
              <div class="empty-playlist-icon">
                <i class="fa fa-list-ul"></i>
              </div>
              <p v-if="playlistSearchQuery">Nenhuma playlist encontrada</p>
              <p v-else>Você ainda não tem playlists</p>
            </div>

            <div v-else class="playlist-grid-modern">
             <div
  v-for="playlist in filteredUserPlaylists"
  :key="playlist._id"
  class="playlist-card-modern"
  :class="{ 
    adding: playlistBeingAdded === playlist._id, 
    added: playlistJustAdded === playlist._id,
    'already-in': isMusicaJaNaPlaylist(playlist._id)
  }"
  @click="handleClickPlaylistCard(playlist)"
>
  <div class="playlist-card-cover">
    <img
      v-if="getPlaylistCardCover(playlist)"
      :src="getPlaylistCardCover(playlist)"
    />
    <div v-else class="playlist-cover-placeholder">
      <i class="fa fa-music"></i>
    </div>
    <div v-if="playlistBeingAdded === playlist._id" class="playlist-overlay-loading">
      <div class="spinner-tiny"></div>
    </div>
    <div v-if="playlistJustAdded === playlist._id" class="playlist-overlay-success">
      <i class="fa fa-check"></i>
    </div>
    <!-- ✅ Badge fixo quando música já está na playlist -->
    <div 
      v-if="isMusicaJaNaPlaylist(playlist._id) && playlistJustAdded !== playlist._id" 
      class="playlist-overlay-already"
    >
      <i class="fa fa-check"></i>
    </div>
  </div>
  <div class="playlist-card-info">
    <strong class="playlist-card-name">
      {{ playlist.nome }}
      <span v-if="isMusicaJaNaPlaylist(playlist._id)" class="already-tag">
        já adicionada
      </span>
    </strong>
    <span class="playlist-card-count">
      {{ playlist.musicas?.length || 0 }} músicas
      <span v-if="playlist.privada" class="playlist-private-badge"><i class="fa fa-lock"></i></span>
    </span>
  </div>
  <button
    class="btn-add-modern"
    :class="{ 
      added: playlistJustAdded === playlist._id || isMusicaJaNaPlaylist(playlist._id)
    }"
    :disabled="playlistBeingAdded === playlist._id"
  >
    <i v-if="playlistJustAdded === playlist._id || isMusicaJaNaPlaylist(playlist._id)" class="fa fa-check"></i>
    <i v-else class="fa fa-plus"></i>
  </button>
</div>

            </div>
          </div>

          <div class="modal-footer-playlist">
            <button class="btn-cancel-modal" @click="fecharModalAddPlaylist">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </transition>

<transition name="fade">
  <div
    v-if="showReportModal"
    class="playlist-modal-overlay"
    @click.self="closeReportModal"
  >
    <div class="playlist-modal report-modal">
      <button class="playlist-modal-close" @click="closeReportModal">
        <i class="fa fa-times"></i>
      </button>

      <h2>Denunciar usuário</h2>
      <p class="report-subtitle">Escolha o motivo da denúncia</p>

      <div class="report-options">
        <button
          v-for="option in reportOptions"
          :key="option.value"
          type="button"
          class="report-option"
          :class="{ active: selectedReportReason === option.value }"
          @click="selectedReportReason = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <textarea
        v-model="reportDescription"
        class="report-textarea"
        rows="4"
        placeholder="Descreva rapidamente o problema (opcional)"
      ></textarea>

      <button
        class="btn-follow"
        @click="submitReport"
        :disabled="reporting"
      >
        <i v-if="reporting" class="fa fa-spinner fa-spin"></i>
        <i v-else class="fa fa-flag"></i>
        {{ reporting ? 'Enviando...' : 'Enviar denúncia' }}
      </button>
    </div>
  </div>
</transition>

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
       isAvatarGoldEquipped: false,
    isOwnProfile: false,
      activeTab: 'overview',
      showContextMenu: false,
      notFound: false,
      // === ESTADOS DE INTERAÇÃO DAS MÚSICAS ===
musicasCurtidasIds: new Set(),      // IDs das músicas já curtidas
musicasFavoritadasIds: new Set(),   // IDs das músicas já favoritadas
musicasEmPlaylists: new Map(),      // Map<musicaId, Set<playlistId>>
      showAddToPlaylistModal: false,
musicaParaAdicionar: null,
playlistsDoUsuario: [],
isLoadingUserPlaylists: false,
playlistSearchQuery: '',
playlistBeingAdded: null,
playlistJustAdded: null,
      defaultAvatar: '/default-avatar.png',
      loggedUserId: null,

      isBlockedByMe: false,
blockedMe: false,

showReportModal: false,
reporting: false,
selectedReportReason: '',
reportDescription: '',
reportOptions: [
  { value: 'spam', label: 'Spam ou golpe' },
  { value: 'assedio', label: 'Assédio ou ofensa' },
  { value: 'conteudo', label: 'Conteúdo impróprio' },
  { value: 'fake', label: 'Perfil falso ou personificação' },
  { value: 'outro', label: 'Outro' }
],
      
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
showPlaylistModal: false,
selectedPlaylist: null,
blackCover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwMDAiLz48L3N2Zz4=',
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

visiblePlaylists() {
  return (this.playlistsPublicas || []).filter(playlist => this.isPlaylistPublic(playlist))
},

filteredUserPlaylists() {
  if (!this.playlistSearchQuery) return this.playlistsDoUsuario
  const query = this.playlistSearchQuery.toLowerCase()
  return this.playlistsDoUsuario.filter(p => p.nome?.toLowerCase().includes(query))
},

isBlockedProfile() {
  return !!this.usuario?.perfilBloqueado || this.isBlockedByMe || this.blockedMe
},

blockActionLabel() {
  return this.isBlockedByMe ? 'Desbloquear usuário' : 'Bloquear usuário'
},

blockActionIcon() {
  return this.isBlockedByMe ? 'fa fa-unlock' : 'fa fa-ban'
},

blockedProfileMessage() {
  if (this.blockedMe) return 'Este usuário bloqueou você'
  if (this.isBlockedByMe) return 'Você bloqueou este usuário'
  return 'Perfil indisponível'
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
            (this.canViewPlaylists && this.visiblePlaylists.length > 0) ||
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
    count: this.visiblePlaylists.length,
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
mounted() {
  const loggedUser = localStorage.getItem('usuario');
  const loggedId = loggedUser ? JSON.parse(loggedUser).id || JSON.parse(loggedUser)._id : null;
  const profileId = this.usuario?.id || this.usuario?._id;
  
  this.isOwnProfile = loggedId && profileId && String(loggedId) === String(profileId);
  
  if (this.isOwnProfile) {
    const savedGoldState = localStorage.getItem('soundup_avatar_gold_equipped');
    if (savedGoldState !== null) {
      this.isAvatarGoldEquipped = savedGoldState === 'true';
    }
  }
  
  // Verificar se o perfil visualizado tem avatar dourado (vindo do backend)
  this.checkUserGoldenAvatar(profileId);
  
  // Listener para mudanças
  window.addEventListener('avatar-gold-changed', this.handleAvatarGoldChanged);

   this.handleOpenTab = (e) => {
    const tab = e.detail?.tab
    if (tab && this.allTabs.find(t => t.id === tab && !t.locked)) {
      this.activeTab = tab
    }
  }
  window.addEventListener('open-profile-tab', this.handleOpenTab);
},

beforeUnmount() {
  window.removeEventListener('avatar-gold-changed', this.handleAvatarGoldChanged);
   window.removeEventListener('open-profile-tab', this.handleOpenTab);
},

  methods: {
     handleAvatarGoldChanged(e) {
    if (this.isOwnProfile) {
      this.isAvatarGoldEquipped = e.detail?.equipped || false;
    }
  },
  
  async checkUserGoldenAvatar(userId) {
    // Verificar se o usuário do perfil tem avatar dourado equipado
    // Isso pode vir do backend ou de uma flag no objeto usuario
    try {
      const token = localStorage.getItem('token');
      if (!token || !userId) return;
      
      // Opcional: buscar do backend se o usuário tem avatar dourado
      // const res = await axios.get(`http://localhost:3002/usuarios/${userId}/avatar-status`);
      // this.usuario.hasGoldenAvatar = res.data.hasGoldenAvatar;
      
      // Por enquanto, verifica localmente se for o próprio perfil
      if (this.isOwnProfile) {
        const saved = localStorage.getItem('soundup_avatar_gold_equipped');
        this.usuario.hasGoldenAvatar = saved === 'true';
      }
    } catch (error) {
      console.error('Erro ao verificar avatar dourado:', error);
    }
  },
  
  // ✅ NOVO: Verifica se a música atual já está em determinada playlist
isMusicaJaNaPlaylist(playlistId) {
  if (!this.musicaParaAdicionar?.id) return false
  // Tenta com String() para garantir match
  const musicaId = String(this.musicaParaAdicionar.id)
  const playlists = this.musicasEmPlaylists.get(musicaId)
  // Também tenta sem String() como fallback
  if (!playlists) {
    const playlistsRaw = this.musicasEmPlaylists.get(this.musicaParaAdicionar.id)
    return playlistsRaw ? playlistsRaw.has(playlistId) : false
  }
  return playlists.has(playlistId)
},

// ✅ NOVO: Bloqueia o clique se já estiver adicionada
handleClickPlaylistCard(playlist) {
  if (this.isMusicaJaNaPlaylist(playlist._id)) {
    this.showToast('Essa música já está nessa playlist', 'info')
    return
  }
  this.adicionarMusicaNaPlaylist(playlist._id)
},

// ✅ NOVO: Pega a melhor cover possível para o card da playlist no modal
getPlaylistCardCover(playlist) {
  if (playlist.capa && playlist.capa !== this.blackCover) return playlist.capa
  if (playlist.cover && playlist.cover !== this.blackCover) return playlist.cover

  const musicas = playlist.musicas || playlist.songs || []
  for (const m of musicas) {
    const c = m.cover || m.capa || m.album?.cover || m.album?.capa
    if (c && c !== this.blackCover) return c
  }
  return null
},

// ✅ SUBSTITUIR: abrirModalAdicionarPlaylist (agora recarrega estado de playlists)
async abrirModalAdicionarPlaylist(musica, event) {
  event.stopPropagation()
  this.musicaParaAdicionar = {
    id: musica.id,
    title: musica.nome || musica.title,
    artist: musica.artist,
    cover: this.getMusicaCover(musica),  // 🔥 garante cover correta
    url: musica.url,
    source: musica.source || 'local',
    duration: musica.duration,
    album: musica.album,
    ano: musica.ano
  }
  this.showAddToPlaylistModal = true
  this.playlistSearchQuery = ''
  this.playlistBeingAdded = null
  this.playlistJustAdded = null
  
  // Carrega playlists e atualiza o mapa de "música está em quais playlists"
  await this.carregarPlaylistsDoUsuario()
  this.atualizarMapaPlaylists()
},

// ✅ NOVO: Atualiza o Map musicasEmPlaylists a partir de playlistsDoUsuario
atualizarMapaPlaylists() {
  this.musicasEmPlaylists = new Map()
  for (const pl of this.playlistsDoUsuario) {
    const plMusicas = pl.musicas || pl.songs || []
    for (const m of plMusicas) {
      const mId = m.id || m._id || m.trackId
      if (!mId) continue
      if (!this.musicasEmPlaylists.has(mId)) {
        this.musicasEmPlaylists.set(mId, new Set())
      }
      this.musicasEmPlaylists.get(mId).add(pl._id || pl.id)
    }
  }
},

// ✅ SUBSTITUIR: adicionarMusicaNaPlaylist (atualiza o Map ao final)
async adicionarMusicaNaPlaylist(playlistId) {
  if (this.playlistBeingAdded) return
  this.playlistBeingAdded = playlistId

  try {
    const token = localStorage.getItem('token')
    const musica = this.musicaParaAdicionar

    const body = { source: musica.source || 'local' }

    if (musica.source && musica.source !== 'local') {
      body.dadosMusica = {
        titulo: musica.title || 'Sem título',
        artista: musica.artist || 'Desconhecido',
        capa: musica.cover || '',
        previewUrl: musica.url || '',
        duration: musica.duration || 30,
        ano: musica.ano || null,
        album: musica.album || ''
      }
    }

    const res = await fetch(
      `http://localhost:3002/playlists/${playlistId}/musicas/${musica.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }
    )

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || `Erro ${res.status}`)
    }

    this.playlistBeingAdded = null
    this.playlistJustAdded = playlistId

    // 🔥 Atualiza o Map em tempo real para marcar como "já adicionada"
    if (!this.musicasEmPlaylists.has(musica.id)) {
      this.musicasEmPlaylists.set(musica.id, new Set())
    }
    this.musicasEmPlaylists.get(musica.id).add(playlistId)

    this.showToast(`"${musica.title}" adicionada à playlist!`, 'success')

    setTimeout(() => {
      this.showAddToPlaylistModal = false
      this.playlistJustAdded = null
      this.musicaParaAdicionar = null
    }, 1200)

  } catch (err) {
    this.playlistBeingAdded = null
    this.showToast(err.message || 'Erro ao adicionar', 'error')
  }
},

normalizarPlaylist(playlist) {
  const rawMusicas = playlist.musicas || playlist.songs || []
  const playlistCover = playlist.cover || playlist.capa || playlist.foto || null

  return {
    ...playlist,
    nome: playlist.nome || playlist.name || 'Playlist sem nome',
    cover: playlistCover || this.blackCover,
    capa: playlistCover || this.blackCover,
    musicas: rawMusicas.map(m => {
      // 🔥 PRIORIDADE MÁXIMA: foto do backend (playlistService retorna 'foto')
      let musicaCover = 
        m.foto ||              // ← ADICIONADO PRIMEIRO: backend usa 'foto'
        m.cover || 
        m.capa || 
        m.thumbnail ||
        m.image ||
        m.imagem ||
        m.album?.cover || 
        m.album?.capa ||
        m.album?.foto ||     // ← ADICIONADO
        m.album?.imagem ||
        (typeof m.album === 'object' ? m.album?.image : null)
      
      // Se ainda não achou, tenta dadosMusica (músicas externas vindas do backend)
      if (!musicaCover && m.dadosMusica) {
        musicaCover = m.dadosMusica.capa || m.dadosMusica.cover || m.dadosMusica.foto
      }
      
      // Fallback pra capa da playlist SÓ DEPOIS
      if (!musicaCover) musicaCover = playlistCover
      if (!musicaCover) musicaCover = this.blackCover

      return {
        id: m.id || m._id || m.trackId || Math.random().toString(36).substr(2, 9),
        nome: m.nome || m.title || m.titulo || 'Música sem nome',
        artist: m.artist || m.artista || 'Desconhecido',
        cover: musicaCover,
        capa: musicaCover,
        foto: musicaCover,    // ← ADICIONADO: garante consistência
        url: m.url || m.previewUrl || m.link || '',
        source: m.source || 'local',
        duration: m.duration || m.duracao || 30,
        album: m.album || '',
        ano: m.ano || null
      }
    })
  }
},

// ✅ SUBSTITUIR o método getMusicaCover existente por este:
getMusicaCover(musica) {
  if (!musica) return this.blackCover
  
  // 🔥 PRIORIDADE 1: Capas diretas da música (TODAS as variações possíveis)
  const cover = 
    musica.cover || 
    musica.capa || 
    musica.foto ||           // ← ADICIONADO: backend playlistService usa 'foto'
    musica.thumbnail ||
    musica.image ||
    musica.imagem ||
    musica.album?.cover || 
    musica.album?.capa || 
    musica.album?.image ||
    musica.album?.imagem ||
    musica.album?.foto ||    // ← ADICIONADO
    (typeof musica.album === 'object' ? musica.album?.image : null)
  
  if (cover && cover !== this.blackCover && cover.startsWith('http')) return cover
  
  // 🔥 PRIORIDADE 2: Capa da playlist selecionada (fallback)
  if (this.selectedPlaylist) {
    const plCover = this.selectedPlaylist.cover || this.selectedPlaylist.capa
    if (plCover && plCover !== this.blackCover && plCover.startsWith('http')) return plCover
  }
  
  // 🔥 PRIORIDADE 3: Tentar extrair de dadosMusica (músicas externas)
  if (musica.dadosMusica) {
    const dmCover = musica.dadosMusica.capa || musica.dadosMusica.cover || musica.dadosMusica.image || musica.dadosMusica.foto
    if (dmCover && dmCover !== this.blackCover) return dmCover
  }
  
  // 🔥 PRIORIDADE 4: Para músicas da playlist que vêm do backend com 'foto'
  if (musica.foto && musica.foto.startsWith('http')) return musica.foto
  
  return this.blackCover
},

async openPlaylist(playlist) {
  if (this.isPlaylistPrivate(playlist)) {
    this.showToast('Esta playlist é privada', 'error')
    return
  }

  const jaTemMusicas = Array.isArray(playlist.musicas) && playlist.musicas.length > 0

  if (jaTemMusicas) {
    // 🔥 PRIMEIRO normaliza, DEPOIS carrega interações, DEPOIS mostra modal
    this.selectedPlaylist = this.normalizarPlaylist(playlist)
    await this.carregarEstadoInteracoes(this.selectedPlaylist)
    this.showPlaylistModal = true
    return
  }

  this.loading = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(
      `http://localhost:3002/playlists/${playlist._id || playlist.id}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
    const data = await res.json()

    const playlistCompleta = {
      ...playlist,
      ...data,
      musicas: data.musicas || data.songs || playlist.musicas || playlist.songs || []
    }

    this.selectedPlaylist = this.normalizarPlaylist(playlistCompleta)
    await this.carregarEstadoInteracoes(this.selectedPlaylist)
    this.showPlaylistModal = true
  } catch (err) {
    console.error('Erro ao carregar playlist:', err)
    this.selectedPlaylist = this.normalizarPlaylist(playlist)
    this.showPlaylistModal = true
  } finally {
    this.loading = false
  }
},

 async curtirMusica(musica, event) {
  event.stopPropagation()
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      this.showToast('Faça login para curtir músicas', 'info')
      return
    }

    const body = { source: musica.source || 'local' }
    if (musica.source && musica.source !== 'local') {
      body.dadosMusica = {
        titulo: musica.nome || musica.title,
        artista: musica.artist || 'Desconhecido',
        capa: musica.cover || '',
        previewUrl: musica.url || '',
        duration: musica.duration || 30,
        ano: musica.ano || null,
        album: musica.album || ''
      }
    }

    const res = await fetch(`http://localhost:3002/curtidas/${musica.id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    
    // 🔥 ATUALIZA O SET EM TEMPO REAL para o ícone mudar instantaneamente
    const musicaId = String(musica.id || musica._id || musica.trackId || musica.musicaId)
    if (data.liked) {
      this.musicasCurtidasIds.add(musicaId)
      this.showToast(`"${musica.nome || musica.title}" curtida!`, 'success')
      window.dispatchEvent(new Event('likes-updated'))
    } else {
      this.musicasCurtidasIds.delete(musicaId)
      this.showToast(`"${musica.nome || musica.title}" descurtida`, 'info')
    }
    // 🔥 Força reatividade do Vue para o Set (Vue 2 não detecta mudanças em Set nativo)
    this.musicasCurtidasIds = new Set(this.musicasCurtidasIds)
    
  } catch (err) {
    this.showToast('Erro ao curtir música', 'error')
  }
},

async favoritarMusica(musica, event) {
  event.stopPropagation()
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      this.showToast('Faça login para favoritar', 'info')
      return
    }

    const body = {
      tipo: 'musica',
      tipoItem: 'musica'
    }

    if (musica.source && musica.source !== 'local') {
      body.source = musica.source
      body.dadosItem = {
        titulo: musica.nome || musica.title,
        artista: musica.artist || 'Desconhecido',
        capa: musica.cover || '',
        previewUrl: musica.url || '',
        duration: musica.duration || 30,
        ano: musica.ano || null,
        album: musica.album || ''
      }
    }

    const res = await fetch(`http://localhost:3002/favoritas/${musica.id}/favoritar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    
    // 🔥 ATUALIZA O SET EM TEMPO REAL para o ícone mudar instantaneamente
    const musicaId = String(musica.id || musica._id || musica.trackId || musica.musicaId)
    if (data.favorited) {
      this.musicasFavoritadasIds.add(musicaId)
      this.showToast(`"${musica.nome || musica.title}" favoritada! ⭐`, 'success')
      window.dispatchEvent(new Event('favoritas-updated'))
    } else {
      this.musicasFavoritadasIds.delete(musicaId)
      this.showToast(`"${musica.nome || musica.title}" removida dos favoritos`, 'info')
    }
    // 🔥 Força reatividade do Vue para o Set (Vue 2 não detecta mudanças em Set nativo)
    this.musicasFavoritadasIds = new Set(this.musicasFavoritadasIds)
    
  } catch (err) {
    this.showToast('Erro ao favoritar música', 'error')
  }
},

async carregarPlaylistsDoUsuario() {
  this.isLoadingUserPlaylists = true
  try {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:3002/playlists', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    this.playlistsDoUsuario = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    this.showToast('Erro ao carregar playlists', 'error')
  } finally {
    this.isLoadingUserPlaylists = false
  }
},

fecharModalAddPlaylist() {
  this.showAddToPlaylistModal = false
  this.musicaParaAdicionar = null
  this.playlistSearchQuery = ''
  this.playlistBeingAdded = null
  this.playlistJustAdded = null
},

    openReportModal() {
  this.selectedReportReason = ''
  this.reportDescription = ''
  this.showReportModal = true
  this.closeContextMenu()
},

closeReportModal() {
  this.showReportModal = false
},

async submitReport() {
  try {
    if (!this.selectedReportReason) {
      this.showToast('Selecione um motivo para denunciar', 'error')
      return
    }

    const baseReason =
      this.reportOptions.find(item => item.value === this.selectedReportReason)?.label || ''

    const motivo = [baseReason, this.reportDescription?.trim()]
      .filter(Boolean)
      .join(' - ')

    this.reporting = true

    await axios.post(
      `http://localhost:3002/usuarios/${this.userId}/denunciar`,
      { motivo },
      this.getAuthConfig()
    )

    this.showToast('Denúncia enviada com sucesso', 'success')
    this.closeReportModal()
  } catch (error) {
    this.showToast(
      error.response?.data?.error || 'Não foi possível enviar a denúncia',
      'error'
    )
  } finally {
    this.reporting = false
  }
},

async toggleUserBlock() {
  try {
    if (this.isBlockedByMe) {
      await axios.delete(
        `http://localhost:3002/usuarios/${this.userId}/bloquear`,
        this.getAuthConfig()
      )

      this.showToast('Usuário desbloqueado', 'success')
    } else {
      await axios.post(
        `http://localhost:3002/usuarios/${this.userId}/bloquear`,
        {},
        this.getAuthConfig()
      )

      this.showToast('Usuário bloqueado', 'success')
    }

    await this.carregarPerfil()
    this.closeContextMenu()
  } catch (error) {
    this.showToast(
      error.response?.data?.error || 'Não foi possível atualizar o bloqueio',
      'error'
    )
  }
},

    getPlaylistSongCount(playlist) {
  if (!playlist) return 0

  const total =
    playlist.totalMusicas ??
    playlist.quantidadeMusicas ??
    playlist.trackCount ??
    (
      (Array.isArray(playlist.songs) ? playlist.songs.length : 0) +
      (Array.isArray(playlist.musicas) ? playlist.musicas.length : 0) +
      (Array.isArray(playlist.musicasExternas) ? playlist.musicasExternas.length : 0)
    )

  return Number(total) || 0
},

    isPlaylistPrivate(playlist) {
  if (!playlist) return false

  if (playlist.privada === true) return true
  if ('publica' in playlist) return playlist.publica === false
  if ('isPublic' in playlist) return playlist.isPublic === false

  return false
},

isPlaylistPublic(playlist) {
  return !this.isPlaylistPrivate(playlist)
},

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
    const [perfilRes, bloqueioRes] = await Promise.all([
      axios.get(
        `http://localhost:3002/usuarios/${this.userId}`,
        this.getAuthConfigOptional()
      ),
      axios.get(
        `http://localhost:3002/usuarios/${this.userId}/bloqueio-status`,
        this.getAuthConfigOptional()
      ).catch(() => ({ data: { blocked: false, blockedByMe: false, blockedMe: false } }))
    ])

    this.usuario = perfilRes.data || {}
    this.isBlockedByMe = !!bloqueioRes.data?.blockedByMe
    this.blockedMe = !!bloqueioRes.data?.blockedMe

    this.isOwnProfile = String(this.usuario.id) === String(this.loggedUserId)
    this.solicitacaoPendente = !!this.usuario.solicitacaoPendente

    if (this.isOwnProfile) {
      this.$router.replace('/perfil')
      return
    }

    if (this.isBlockedProfile) {
      this.permissions = {
        perfil: true,
        curtidas: false,
        playlists: false,
        atividades: false,
        seguidores: false,
        seguindo: false,
        estatisticas: false
      }

      this.musicasFavoritas = []
      this.playlistsPublicas = []
      this.seguidoresList = []
      this.seguindoList = []
      this.seguidoresCount = 0
      this.seguindoCount = 0
      this.estatisticas = {
        musicasCurtidas: 0,
        playlists: 0
      }
      return
    }

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
    } else {
      await Promise.allSettled([
        this.carregarEstatisticas(),
        this.carregarFollows(),
        this.carregarCurtidas(),
        this.carregarPlaylists(),
        this.carregarAtividades()
      ])
    }

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
    const [resSeguidores, resSeguindo] = await Promise.allSettled([
      axios.get(
        `http://localhost:3002/usuarios/${this.userId}/seguidores/publicos`,
        this.getAuthConfigOptional()
      ),
      axios.get(
        `http://localhost:3002/usuarios/${this.userId}/seguindo/publicos`,
        this.getAuthConfigOptional()
      )
    ])

    if (resSeguidores.status === 'fulfilled') {
      this.seguidoresList = resSeguidores.value.data || []
      this.seguidoresCount = this.seguidoresList.length
      this.permissions.seguidores = true

      if (this.loggedUserId) {
        this.isFollowing = this.seguidoresList.some(
          s => String(s._id || s.id) === String(this.loggedUserId)
        )
      }
    } else {
      this.permissions.seguidores = false
      this.seguidoresList = []
      this.seguidoresCount = 0
    }

    if (resSeguindo.status === 'fulfilled') {
      this.seguindoList = resSeguindo.value.data || []
      this.seguindoCount = this.seguindoList.length
      this.permissions.seguindo = true
    } else {
      this.permissions.seguindo = false
      this.seguindoList = []
      this.seguindoCount = 0
    }

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

    const rawPlaylists = Array.isArray(res.data) ? res.data : []

    // Segurança extra no frontend:
    // mesmo que venha algo indevido do backend, privada não aparece no perfil
    this.playlistsPublicas = rawPlaylists
      .filter(playlist => this.isPlaylistPublic(playlist))
      .map(playlist => ({
        ...playlist,
        totalMusicas: this.getPlaylistSongCount(playlist)
      }))

    this.estatisticas.playlists = this.playlistsPublicas.length
    this.permissions.playlists = true
  } catch (error) {
    if (error.response?.status === 403) {
      this.permissions.playlists = false
      this.playlistsPublicas = []
      this.estatisticas.playlists = 0
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
    if (String(this.userId) === String(this.loggedUserId)) {
    this.showToast('Você não pode seguir a si mesmo', 'error')
    return
  }
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

// ========== ESTADO DE INTERAÇÃO DAS MÚSICAS ==========

async carregarEstadoInteracoes(playlist) {
  const token = localStorage.getItem('token')
  if (!token || !playlist?.musicas?.length) return

  // 🔥 Extrai os IDs das músicas da playlist já normalizadas
  // Agora também inclui _id para músicas locais e musicaId para externas
  const ids = playlist.musicas.map(m => {
    return m.id || m._id || m.trackId || m.musicaId
  }).filter(Boolean)
  
  console.log('🔍 IDs das músicas na playlist:', ids)
  
  if (ids.length === 0) {
    console.warn('Nenhum ID de música encontrado na playlist')
    return
  }

  try {
    // Carrega curtidas, favoritas e playlists do usuário logado
    // Carrega curtidas, favoritas e playlists do usuário logado
    // 🔥 Usa os endpoints corretos que existem nas rotas
    const [curtidasRes, favoritasRes, playlistsRes] = await Promise.allSettled([
      fetch('http://localhost:3002/curtidas', {           // ← GET /curtidas (listar minhas)
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:3002/favoritas', {          // ← GET /favoritas (listar minhas)
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('http://localhost:3002/playlists', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    // ========== HELPERS ==========
    const safeJson = async (response, label) => {
      if (!response || !response.ok) {
        console.warn(`[${label}] Resposta não-OK:`, response?.status)
        return null
      }
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`[${label}] Content-Type inválido:`, contentType)
        // consome o body para não travar, mas ignora
        await response.text()
        return null
      }
      try {
        return await response.json()
      } catch (e) {
        console.warn(`[${label}] Erro ao fazer parse JSON:`, e.message)
        return null
      }
    }

    // ========== PROCESSA CURTIDAS ==========
    // ========== PROCESSA CURTIDAS ==========
    if (curtidasRes.status === 'fulfilled' && curtidasRes.value) {
      const data = await safeJson(curtidasRes.value, 'curtidas')
      if (data) {
        const curtidas = Array.isArray(data) ? data : (data.curtidas || data.data || [])
        this.musicasCurtidasIds = new Set()
        
        curtidas.forEach(c => {
          // Tenta TODAS as variações de ID possíveis
          const id = c.musicaId || c.id || c.trackId || c.musica?._id || c.musica?.id
          if (id) this.musicasCurtidasIds.add(String(id))
        })
        
        console.log('✅ Curtidas carregadas:', this.musicasCurtidasIds.size)
        console.log('🎵 IDs curtidos:', [...this.musicasCurtidasIds])
      }
    } else if (curtidasRes.status === 'rejected') {
      console.warn('❌ Fetch curtidas falhou:', curtidasRes.reason?.message)
    }

    // ========== PROCESSA FAVORITAS ==========
     // ========== PROCESSA FAVORITAS ==========
    if (favoritasRes.status === 'fulfilled' && favoritasRes.value) {
      const data = await safeJson(favoritasRes.value, 'favoritas')
      if (data) {
        const favoritas = Array.isArray(data) ? data : (data.favoritas || data.data || [])
        this.musicasFavoritadasIds = new Set()
        
        favoritas.forEach(f => {
          // Para favoritas locais: f.musica?._id
          // Para favoritas externas: f.musicaExterna?.id ou f.itemId
          const id = f.musicaId || f.id || f.trackId || 
                     f.musica?._id || f.musica?.id ||
                     f.musicaExterna?.id || f.itemId ||
                     f.albumExterno?.id || f.cantorExterno?.id
          if (id) this.musicasFavoritadasIds.add(String(id))
        })
        
        console.log('✅ Favoritas carregadas:', this.musicasFavoritadasIds.size)
        console.log('⭐ IDs favoritados:', [...this.musicasFavoritadasIds])
      }
    } else if (favoritasRes.status === 'rejected') {
      console.warn('❌ Fetch favoritas falhou:', favoritasRes.reason?.message)
    }

    // ========== PROCESSA PLAYLISTS ==========
     // ========== PROCESSA PLAYLISTS ==========
    if (playlistsRes.status === 'fulfilled' && playlistsRes.value) {
      const data = await safeJson(playlistsRes.value, 'playlists')
      if (data) {
        const playlists = Array.isArray(data) ? data : (data.playlists || data.data || [])
        this.musicasEmPlaylists = new Map()
        
        for (const pl of playlists) {
          const plMusicas = pl.musicas || pl.songs || []
          for (const m of plMusicas) {
            // Tenta TODAS as variações de ID
            const mId = m.id || m._id || m.trackId || m.musicaId
            if (!mId) continue
            
            // Armazena com String() para garantir consistência
            const mIdStr = String(mId)
            
            if (!this.musicasEmPlaylists.has(mIdStr)) {
              this.musicasEmPlaylists.set(mIdStr, new Set())
            }
            this.musicasEmPlaylists.get(mIdStr).add(pl._id || pl.id)
          }
        }
        console.log('✅ Playlists carregadas:', this.musicasEmPlaylists.size, 'músicas mapeadas')
      }
    } else if (playlistsRes.status === 'rejected') {
      console.warn('❌ Fetch playlists falhou:', playlistsRes.reason?.message)
    }

  } catch (err) {
    console.error('Erro geral ao carregar estados de interação:', err)
  }
},

isMusicaCurtida(musica) {
  if (!musica) return false
  // Tenta todos os IDs possíveis da música
  const id = musica.id || musica._id || musica.trackId || musica.musicaId
  return id ? this.musicasCurtidasIds.has(String(id)) : false
},

isMusicaFavoritada(musica) {
  if (!musica) return false
  // Tenta todos os IDs possíveis da música
  const id = musica.id || musica._id || musica.trackId || musica.musicaId
  return id ? this.musicasFavoritadasIds.has(String(id)) : false
},

isMusicaEmPlaylist(musica, playlistId) {
  const playlists = this.musicasEmPlaylists.get(musica.id)
  return playlists ? playlists.has(playlistId) : false
},

// ========== AJUSTE DE CAPA DAS MÚSICAS ==========

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
/* ========== ESTADO "JÁ ADICIONADA" NO MODAL DE PLAYLIST ========== */
.playlist-card-modern.already-in {
  background: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.15);
  cursor: default;
}

.playlist-card-modern.already-in:hover {
  background: rgba(16, 185, 129, 0.1);
  transform: none;
}

.playlist-overlay-already {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.85);
  backdrop-filter: blur(2px);
}

.playlist-overlay-already i {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.already-tag {
  display: inline-block;
  margin-left: 8px;
  font-size: 10px;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  padding: 2px 8px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Botão "+" pintado quando já está na playlist */
.btn-add-modern.added {
  background: rgba(16, 185, 129, 0.25);
  color: #10b981;
  cursor: default;
}

.btn-add-modern.added:hover {
  transform: none;
}

/* Reforço dos estados ativos dos botões no modal (curtido/favoritado) */
.btn-modal-action.btn-like.active {
  background: rgba(236, 72, 153, 0.25) !important;
  color: #ec4899 !important;
  box-shadow: 0 0 12px rgba(236, 72, 153, 0.3);
}

.btn-modal-action.btn-like.active i {
  color: #ec4899 !important;
  animation: heartBeat 0.4s ease;
}

.btn-modal-action.btn-star.active {
  background: rgba(251, 191, 36, 0.25) !important;
  color: #fbbf24 !important;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.3);
}

.btn-modal-action.btn-star.active i {
  color: #fbbf24 !important;
  animation: starPulse 0.4s ease;
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes starPulse {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.3) rotate(15deg); }
  100% { transform: scale(1) rotate(0deg); }
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
.playlist-private-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 5;
  backdrop-filter: blur(6px);
}

.playlist-private-badge.large {
  width: 40px;
  height: 40px;
}
.playlist-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.playlist-modal {
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  overflow-y: auto;
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  border-radius: 24px;
  padding: 28px;
  position: relative;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 25px 60px rgba(0,0,0,0.6);
}

.playlist-modal-cover {
  width: 100%;
  aspect-ratio: 16/7;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 20px;
}

.playlist-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  color: white;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.playlist-modal-close:hover {
  background: rgba(255,255,255,0.2);
  transform: rotate(90deg);
}

.playlist-modal > h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.playlist-modal > p {
  color: #94a3b8;
  font-size: 14px;
  margin: 0 0 20px 0;
}


.playlist-modal-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.playlist-modal-song:hover {
  background: rgba(255,255,255,0.05);
}

.song-index {
  width: 24px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.song-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.playlist-modal-song img {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
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
/* Estados ativos dos botões no modal */
.btn-modal-action.btn-like.active {
  background: rgba(236, 72, 153, 0.2);
  color: #ec4899;
}

.btn-modal-action.btn-like.active i {
  color: #ec4899;
}

.btn-modal-action.btn-star.active {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.btn-modal-action.btn-star.active i {
  color: #fbbf24;
}

/* Transição suave dos ícones */
.btn-modal-action i {
  transition: all 0.2s ease;
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
/* Ações da música no modal de playlist */
.playlist-modal-song {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: .2s;
  position: relative;
}

.playlist-modal-song-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.playlist-modal-song-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 3px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #f8fafc;
}

.playlist-modal-song-info p {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-modal-song-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  opacity: 1;
}

.playlist-modal-song:hover .playlist-modal-song-actions {
  opacity: 1;
}

.btn-modal-action {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.06);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 13px;
}

.btn-modal-action:hover {
  transform: scale(1.15);
}

.btn-modal-action.btn-like:hover {
  background: rgba(236, 72, 153, 0.2);
  color: #ec4899;
}

.btn-modal-action.btn-star:hover {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.btn-modal-action.btn-add:hover {
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
}

/* ========== MODAL ADICIONAR À PLAYLIST ========== */
.add-to-playlist-modal {
  max-width: 480px;
}

.modal-header-playlist {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(124, 58, 237, 0.08));
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin: -28px -28px 0 -28px;
  border-radius: 24px 24px 0 0;
}

.modal-music-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.modal-music-preview img {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.modal-music-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.modal-music-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #ec4899;
  font-weight: 600;
}

.modal-music-title {
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-music-artist {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-actions-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.search-playlist-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 14px;
  transition: all 0.2s;
}

.search-playlist-box:focus-within {
  border-color: rgba(236, 72, 153, 0.4);
  background: rgba(255, 255, 255, 0.07);
}

.search-playlist-box i {
  color: #64748b;
  font-size: 14px;
}

.search-playlist-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #f8fafc;
  font-size: 14px;
  width: 100%;
}

.search-playlist-box input::placeholder {
  color: #64748b;
}

.modal-body-playlist {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
  margin: 0 -12px;
}

.modal-body-playlist::-webkit-scrollbar {
  width: 6px;
}

.modal-body-playlist::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body-playlist::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 12px;
  color: #94a3b8;
}

.spinner-small {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(236, 72, 153, 0.2);
  border-top-color: #ec4899;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-playlists-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  gap: 16px;
}

.empty-playlist-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(124, 58, 237, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(236, 72, 153, 0.2);
}

.empty-playlist-icon i {
  font-size: 28px;
  color: #ec4899;
  opacity: 0.8;
}

.empty-playlists-modern p {
  color: #94a3b8;
  font-size: 14px;
  margin: 0;
}

.playlist-grid-modern {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.playlist-card-modern {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.playlist-card-modern:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

.playlist-card-modern.adding {
  opacity: 0.6;
  pointer-events: none;
}

.playlist-card-modern.added {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
}

.playlist-card-cover {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
}

.playlist-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(124, 58, 237, 0.2));
}

.playlist-cover-placeholder i {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.4);
}

.playlist-overlay-loading,
.playlist-overlay-success {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playlist-overlay-loading {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.playlist-overlay-success {
  background: rgba(16, 185, 129, 0.9);
}

.playlist-overlay-success i {
  color: white;
  font-size: 22px;
}

.spinner-tiny {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.playlist-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.playlist-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-card-count {
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.playlist-private-badge {
  font-size: 10px;
  color: #fbbf24;
}

.btn-add-modern {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  font-size: 13px;
}

.btn-add-modern:hover {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  transform: scale(1.1);
}

.btn-add-modern.added {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.btn-add-modern:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.modal-footer-playlist {
  padding: 16px 0 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: flex-end;
}

.btn-cancel-modal {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-modal:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

/* Responsivo: ações sempre visíveis em mobile */
@media (max-width: 768px) {
  .playlist-modal-song-actions {
    opacity: 1;
  }
  
  .btn-modal-action {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
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
.blocked-profile-state {
  padding: 24px 40px;
}

.blocked-profile-card {
  min-height: 320px;
  border-radius: 24px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  padding: 32px;
}

.blocked-profile-card i {
  font-size: 42px;
  color: #ef4444;
}

.blocked-profile-card h3 {
  margin: 0;
  font-size: 24px;
  color: #fff;
}

.blocked-profile-card p {
  margin: 0;
  color: #94a3b8;
  max-width: 420px;
}

.report-modal {
  max-width: 520px;
}

.report-subtitle {
  color: #94a3b8;
  margin-bottom: 16px;
}

.report-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.report-option {
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.04);
  color: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  transition: .2s ease;
}

.report-option.active {
  border-color: #ec4899;
  background: rgba(236,72,153,0.12);
}

.report-textarea {
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff;
  margin-bottom: 16px;
  resize: vertical;
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
/* ===== AVATAR DOURADO NO PERFILUSUARIO ===== */
.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 16px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.profile-avatar.avatar-gold {
  padding: 4px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
  box-shadow: 
    0 0 0 2px #B8860B,
    0 0 25px rgba(255, 215, 0, 0.6),
    0 8px 32px rgba(0, 0, 0, 0.4);
  border: none;
}

.profile-avatar.avatar-gold img {
  border-radius: 50%;
  border: 3px solid #1a1a2e;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  margin: 4px;
  object-fit: cover;
}

/* Avatar menor em listas/cards */
.chat-avatar.avatar-gold,
.user-list-avatar.avatar-gold {
  padding: 2px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
  box-shadow: 
    0 0 0 1px #B8860B,
    0 0 10px rgba(255, 215, 0, 0.4);
}

.chat-avatar.avatar-gold img,
.user-list-avatar.avatar-gold img {
  border-radius: 50%;
  border: 2px solid #1a1a2e;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  margin: 2px;
  object-fit: cover;
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