<!-- Perfil.vue - Versão Melhorada -->
<template>
  <div class="perfil">
    <!-- Header do Perfil -->
    <div class="profile-header">
 <div class="cover-image" :style="coverStyle">
  <div class="cover-gradient"></div>

  <div class="cover-actions" v-if="isOwnProfile">
    <button
      type="button"
      class="btn-cover-action"
      @click.stop.prevent="triggerCoverUpload"
    >
      <i class="fa fa-camera"></i> Alterar capa
    </button>
  </div>

  <input
    type="file"
    ref="coverInput"
    accept="image/*"
    style="display: none"
    @change="handleCoverChange"
  />
</div>
     
      <div class="profile-info-container">
        <div class="avatar-section">
          <div class="avatar-wrapper" :class="{ 'online': isOnline }">
            <img :src="usuario.avatar || defaultAvatar" :alt="usuario.nome" class="avatar" @error="handleAvatarError" />
            <div class="avatar-status" v-if="isOwnProfile"></div>
          <button
  type="button"
  class="btn-edit-avatar"
  @click="triggerAvatarUpload"
  v-if="isOwnProfile"
>
  <i class="fa fa-camera"></i>
</button>

            <input
              type="file"
              ref="avatarInput"
              accept="image/*"
              @change="handleAvatarChange"
              style="display: none"
            />
          </div>
        </div>
       
        <div class="user-details">
          <div class="user-badges" v-if="usuario.membroDesde">
            <span class="badge badge-pro" v-if="isPro">PRO</span>
            <span class="badge badge-new" v-if="isNewMember">NOVO</span>
            <span class="badge badge-verified" v-if="usuario.verificado">
              <i class="fa fa-check-circle"></i> Verificado
            </span>
          </div>
         
          <h1 class="user-name">{{ usuario.nome || 'Usuário' }}</h1>
          <p class="user-handle">@{{ usuario.username || 'usuario' }}</p>
         
          <div class="user-meta">
            <span class="meta-item" v-if="usuario.localizacao">
              <i class="fa fa-map-marker"></i> {{ usuario.localizacao }}
            </span>
            <span class="meta-item">
              <i class="fa fa-calendar"></i> Membro desde {{ formatDate(usuario.membroDesde) }}
            </span>
            <span class="meta-item" v-if="usuario.ultimoAcesso">
              <i class="fa fa-clock-o"></i> Último acesso {{ timeAgo(usuario.ultimoAcesso) }}
            </span>
          </div>
         
          <p class="user-bio" v-if="usuario.bio">{{ usuario.bio }}</p>
          <p class="user-bio empty" v-else-if="isOwnProfile">
            <i class="fa fa-quote-left"></i> Adicione uma bio para que as pessoas te conheçam melhor
          </p>
         
          <div class="user-stats">
            <div class="stat-item" @click="activeTab = 'likes'">
              <span class="stat-value">{{ formatNumber(estatisticas.musicasCurtidas) }}</span>
              <span class="stat-label">Curtidas</span>
            </div>
            <div class="stat-item" @click="activeTab = 'playlists'">
              <span class="stat-value">{{ formatNumber(estatisticas.playlists) }}</span>
              <span class="stat-label">Playlists</span>
            </div>
        <div class="stat-item" @click="activeTab = 'followers'">
  <span class="stat-value">{{ seguidoresList?.length || 0 }}</span>
  <span class="stat-label">Seguidores</span>
</div>

<div class="stat-item" @click="activeTab = 'following'">
  <span class="stat-value">{{ seguindoList?.length || 0 }}</span>
  <span class="stat-label">Seguindo</span>
</div>

            <div class="stat-item" v-if="estatisticas.ouvintesMensais">
              <span class="stat-value highlight">{{ formatNumber(estatisticas.ouvintesMensais) }}</span>
              <span class="stat-label">Ouvintes/mês</span>
            </div>
          </div>
        </div>
       
        <div class="profile-actions">
        <button type="button" class="btn-primary" @click="openEditModal" v-if="isOwnProfile">
  <i class="fa fa-pencil"></i> Editar perfil
</button>
          <button class="btn-follow" @click="toggleFollow" v-else :class="{ 'following': isFollowing }">
            <i :class="isFollowing ? 'fa fa-check' : 'fa fa-plus'"></i>
            {{ isFollowing ? 'Seguindo' : 'Seguir' }}
          </button>
         
          <button class="btn-secondary" @click="shareProfile">
            <i class="fa fa-share-alt"></i>
          </button>
          <button class="btn-secondary" @click="showMoreOptions">
            <i class="fa fa-ellipsis-h"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Menu de Contexto (Mais opções) -->
    <transition name="fade">
      <div v-if="showContextMenu" class="context-menu" v-click-outside="closeContextMenu">
        <div class="context-item" @click="copyProfileUrl">
          <i class="fa fa-link"></i> Copiar link do perfil
        </div>
        <div class="context-item" @click="shareProfile" v-if="!isOwnProfile">
          <i class="fa fa-share"></i> Compartilhar perfil
        </div>
        <div class="context-item" @click="reportUser" v-if="!isOwnProfile">
          <i class="fa fa-flag"></i> Denunciar usuário
        </div>
        <div class="context-item" @click="blockUser" v-if="!isOwnProfile">
          <i class="fa fa-ban"></i> Bloquear usuário
        </div>
        <div class="context-divider" v-if="!isOwnProfile"></div>
        <div class="context-item danger" @click="confirmDeleteAccount" v-if="isOwnProfile">
          <i class="fa fa-trash"></i> Excluir conta
        </div>
      </div>
    </transition>

    <!-- Conteúdo Principal -->
    <div class="profile-content">
      <!-- Tabs de Navegação -->
      <div class="tabs-nav-container">
        <div class="tabs-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
            <span class="tab-badge" v-if="tab.count">{{ tab.count }}</span>
          </button>
        </div>
       
        <div class="tabs-actions">
          <button class="btn-filter" @click="showFilters = !showFilters">
            <i class="fa fa-filter"></i> Filtros
          </button>
          <button class="btn-sort" @click="toggleSort">
            <i :class="sortDesc ? 'fa fa-sort-amount-desc' : 'fa fa-sort-amount-asc'"></i>
          </button>
        </div>
      </div>

      <!-- Painel de Filtros -->
      <transition name="slide-down">
        <div v-if="showFilters" class="filters-panel">
          <div class="filter-group">
            <label>Período</label>
            <div class="filter-options">
              <button
                v-for="period in filterPeriods"
                :key="period.value"
                :class="['filter-chip', { active: activeFilter === period.value }]"
                @click="activeFilter = period.value"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <div class="filter-group">
            <label>Gênero</label>
            <div class="filter-options">
              <button
                v-for="genre in genres"
                :key="genre"
                :class="['filter-chip', { active: selectedGenres.includes(genre) }]"
                @click="toggleGenre(genre)"
              >
                {{ genre }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Tab: Visão Geral -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <div class="content-grid">
          <!-- Destaque: Música mais ouvida -->
          <div class="highlight-card" v-if="topTrack">
            <div class="highlight-header">
              <i class="fa fa-trophy"></i>
              <span>Mais ouvida este mês</span>
            </div>
            <div class="highlight-content" @click="playMusic(topTrack)">
              <img :src="topTrack.cover" :alt="topTrack.title" />
              <div class="highlight-info">
                <h4>{{ topTrack.title }}</h4>
                <p>{{ topTrack.artist }}</p>
                <span class="highlight-plays">{{ formatNumber(topTrack.plays) }} plays</span>
              </div>
              <button class="btn-play-highlight">
                <i class="fa fa-play"></i>
              </button>
            </div>
          </div>

          <!-- Músicas Favoritas -->
          <div class="content-section">
            <div class="section-header">
              <h3><i class="fa fa-heart"></i> Músicas Favoritas</h3>
              <button class="btn-view-all" @click="activeTab = 'likes'" v-if="musicasFavoritas.length > 0">
                Ver todas <i class="fa fa-arrow-right"></i>
              </button>
            </div>
            <div class="mini-list" v-if="musicasFavoritas.length > 0">
              <div
                v-for="(musica, index) in musicasFavoritas.slice(0, 5)"
                :key="musica.id"
                class="mini-item"
                @click="playMusic(musica)"
                @contextmenu.prevent="showMusicContext($event, musica)"
              >
                <div class="mini-rank" v-if="index < 3">
                  <i class="fa fa-trophy" :class="`rank-${index + 1}`"></i>
                </div>
                <span class="mini-number" v-else>{{ index + 1 }}</span>
                <img :src="musica.cover" :alt="musica.nome" />
                <div class="mini-info">
                  <h4>{{ musica.nome }}</h4>
                  <p>{{ musica.artist }}</p>
                </div>
                <button class="btn-like-mini" @click.stop="toggleLike(musica)" :class="{ 'active': musica.curtido }">
                  <i :class="musica.curtido ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
                </button>
                <button class="btn-play-mini" @click.stop="playMusic(musica)">
                  <i class="fa fa-play"></i>
                </button>
              </div>
            </div>
            <div class="empty-state" v-else>
              <div class="empty-icon">
                <i class="fa fa-music"></i>
              </div>
              <h4>Nenhuma música curtida</h4>
              <p v-if="isOwnProfile">Comece a curtir músicas para vê-las aqui</p>
              <button class="btn-explore" @click="$router.push('/search')" v-if="isOwnProfile">
                <i class="fa fa-compass"></i> Explorar músicas
              </button>
            </div>
          </div>

          <!-- Playlists Recentes -->
          <div class="content-section">
            <div class="section-header">
              <h3><i class="fa fa-list"></i> Playlists</h3>
              <button class="btn-view-all" @click="activeTab = 'playlists'" v-if="playlistsRecentes.length > 0">
                Ver todas <i class="fa fa-arrow-right"></i>
              </button>
            </div>
           <div class="playlist-list" v-if="playlistsRecentes.length > 0">
  <div
    v-for="playlist in playlistsRecentes"
    :key="playlist._id"
    class="playlist-row"
  >
    <!-- LINHA PRINCIPAL -->
    <div class="playlist-header" @click="togglePlaylist(playlist._id)">
      
      <div class="playlist-left">
        <i 
          class="fa"
          :class="openedPlaylist === playlist._id ? 'fa-chevron-down' : 'fa-chevron-right'"
        ></i>

        <img :src="playlist.cover || playlist.capa"  class="playlist-thumb" />

        <div>
          <h4>{{ playlist.nome }}</h4>
          <p>{{ playlist.totalMusicas }} músicas • {{ playlist.privacidade }}</p>
        </div>
      </div>

      <button class="btn-play-mini">
        <i class="fa fa-play"></i>
      </button>
    </div>

    <!-- MÚSICAS (EXPANSÍVEL) -->
    <transition name="fade">
      <div v-if="openedPlaylist === playlist._id" class="playlist-musicas">
        
        <div
          v-for="(musica, index) in playlist.musicas"
          :key="musica._id"
          class="musica-item"
          @click="playMusic(musica)"
        >
          <span>{{ index + 1 }}</span>
          <img :src="musica.foto" />
          
          <div>
            <h5>{{ musica.nome }}</h5>
            <p>{{ musica.duracao }}</p>
          </div>

          <button @click.stop="playMusic(musica)">
            <i class="fa fa-play"></i>
          </button>
        </div>

      </div>
    </transition>

  </div>
</div>
            <div class="empty-state" v-else>
              <div class="empty-icon">
                <i class="fa fa-list"></i>
              </div>
              <h4>Nenhuma playlist</h4>
            </div>
          </div>

          <!-- Artistas Favoritos -->
          <div class="content-section">
            <div class="section-header">
              <h3><i class="fa fa-star"></i> Artistas Favoritos</h3>
            </div>
            <div class="artists-list" v-if="artistasFavoritos.length > 0">
              <div
                v-for="artista in artistasFavoritos.slice(0, 6)"
                :key="artista.id"
                class="artist-item"
                @click="goToArtist(artista)"
              >
                <img :src="artista.image" :alt="artista.name" class="artist-avatar" />
                <span class="artist-name">{{ artista.name }}</span>
                <span class="artist-plays">{{ formatNumber(artista.plays) }} plays</span>
              </div>
            </div>
            <div class="empty-state compact" v-else>
              <p>Nenhum artista favorito ainda</p>
            </div>
          </div>
          
           <!-- Favoritos -->
         <div class="content-section">
  <div class="section-header">
    <h3><i class="fa fa-star"></i> Favoritos</h3>
  </div>

  <div class="mini-list" v-if="favoritosRecentes.length > 0">
    <div
      v-for="(item, index) in favoritosRecentes"
     :key="`${item.type}-${item.id || item._id}`"
      class="mini-item"
      @click="abrirFavorito(item)"
    >
      <div class="mini-rank" v-if="index < 3">
        <i class="fa fa-star" :class="`rank-${index + 1}`"></i>
      </div>
      <span class="mini-number" v-else>{{ index + 1 }}</span>

      <img :src="item.cover" :alt="item.nome" />

      <div class="mini-info">
        <h4>{{ item.nome }}</h4>
        <p>
          {{ item.type === 'musica'
            ? item.artist
            : `${item.musicas || 0} músicas • ${item.duracaoTotal || '0 min'}` }}
        </p>
      </div>

      <button
        class="btn-play-mini"
        @click.stop="abrirFavorito(item)"
      >
        <i :class="item.type === 'musica' ? 'fa fa-play' : 'fa fa-list'"></i>
      </button>
    </div>
  </div>

  <div class="empty-state compact" v-else>
    <p>Nenhum favorito ainda</p>
  </div>
</div>
          
          <!-- Atividade Recente -->
          <div class="content-section full-width">
            <div class="section-header">
              <h3><i class="fa fa-pulse"></i> Atividade Recente</h3>
              <button class="btn-view-all" @click="activeTab = 'activity'" v-if="atividadesRecentes.length > 0">
                Ver tudo <i class="fa fa-arrow-right"></i>
              </button>
            </div>
            <div class="activity-list" v-if="atividadesRecentes.length > 0">
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
                <img :src="atividade.imagem" alt="" class="activity-image" v-if="atividade.imagem" />
              </div>
            </div>
            <div class="empty-state compact" v-else>
              <p>Sem atividades recentes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Curtidas -->
      <div v-if="activeTab === 'likes'" class="tab-content">
        <div class="content-section">
          <div class="section-header">
            <div class="header-title">
              <h3><i class="fa fa-heart"></i> Músicas Curtidas</h3>
              <span class="count-badge">{{ formatNumber(musicasFavoritas.length) }} músicas</span>
            </div>
            <div class="header-actions">
              <button class="btn-shuffle" @click="shufflePlay" :disabled="musicasFavoritas.length === 0">
                <i class="fa fa-random"></i> Aleatório
              </button>
              <button class="btn-play-all" @click="playAll" :disabled="musicasFavoritas.length === 0">
                <i class="fa fa-play"></i> Tocar tudo
              </button>
            </div>
          </div>
         
          <div class="music-list-detailed" v-if="musicasFavoritas.length > 0">
            <div class="list-header">
              <span class="col-number">#</span>
              <span class="col-title">Título</span>
              <span class="col-album">Álbum</span>
              <span class="col-date">Adicionado</span>
              <span class="col-duration"><i class="fa fa-clock-o"></i></span>
              <span class="col-actions"></span>
            </div>
           
            <div
              v-for="(musica, index) in filteredMusicas"
              :key="musica.id"
              class="music-row"
              :class="{ 'playing': currentPlayingId === musica.id }"
              @dblclick="playMusic(musica)"
              @contextmenu.prevent="showMusicContext($event, musica)"
            >
              <span class="row-number">
                <span v-if="currentPlayingId !== musica.id">{{ index + 1 }}</span>
                <i v-else class="fa fa-volume-up playing-icon"></i>
              </span>
              <img :src="musica.cover" :alt="musica.nome" />
              <div class="row-info">
                <h4 :class="{ 'playing': currentPlayingId === musica.id }">{{ musica.nome}}</h4>
                <p>{{ musica.artist }}</p>
              </div>
              <span class="row-album">{{ musica.album }}</span>
              <span class="row-date">{{ timeAgo(musica.dataCurtida) }}</span>
              <span class="row-duration">{{ formatDuration(musica.duration) }}</span>
              <div class="row-actions">
                <button
                  class="btn-like active"
                  @click="removerCurtida(musica)"
                  title="Remover dos curtidos"
                >
                  <i class="fa fa-heart"></i>
                </button>
                <button class="btn-add" @click="addToPlaylist(musica)" title="Adicionar à playlist">
                  <i class="fa fa-plus"></i>
                </button>
                <button class="btn-more" @click="showMusicOptions(musica)">
                  <i class="fa fa-ellipsis-v"></i>
                </button>
              </div>
            </div>
          </div>
         
          <div class="empty-state large" v-else>
            <div class="empty-icon large">
              <i class="fa fa-heart-o"></i>
            </div>
            <h4>Sua coleção está vazia</h4>
            <p>As músicas que você curtir aparecerão aqui</p>
            <button class="btn-explore" @click="$router.push('/search')">
              <i class="fa fa-compass"></i> Descobrir músicas
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: Playlists -->
      <div v-if="activeTab === 'playlists'" class="tab-content">
        <div class="playlists-full-grid">        
          <div
            v-for="playlist in filteredPlaylists"
            :key="playlist._id"
            class="playlist-card-large"
            @click="openPlaylist(playlist)"
          >
            <div class="playlist-cover-large">
              <img :src="playlist.cover || playlist.capa"  :alt="playlist.nome" />
              <div class="playlist-overlay">
                <button class="btn-play-playlist-large">
                  <i class="fa fa-play"></i>
                </button>
              </div>
              <div class="playlist-privacy-badge" :class="playlist.privacidade.toLowerCase()">
                <i :class="playlist.privacidade === 'Pública' ? 'fa fa-globe' : 'fa fa-lock'"></i>
                {{ playlist.privacidade }}
              </div>
            </div>
            <div class="playlist-info-large">
              <h4>{{ playlist.nome }}</h4>
              <p>{{ playlist.descricao || 'Sem descrição' }}</p>
              <div class="playlist-meta-large">
                <span><i class="fa fa-music"></i> {{ playlist.musicas.length }} músicas</span>
                <span><i class="fa fa-clock-o"></i> {{ playlist.duracaoTotal || '0 min' }}</span>
                <span><i class="fa fa-heart"></i> {{ playlist.curtidas || 0 }} curtidas</span>
              </div>
              <div class="playlist-tags" v-if="playlist.tags">
                <span v-for="tag in playlist.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <div class="playlist-actions">
              <button class="btn-icon" @click.stop="togglePlaylistLike(playlist)" :class="{ 'active': playlist.curtida }">
                <i :class="playlist.curtida ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
              </button>
              <button class="btn-icon" @click.stop="showPlaylistOptions(playlist)">
                <i class="fa fa-ellipsis-v"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Histórico -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div class="content-section">
          <div class="section-header">
            <div class="header-title">
              <h3><i class="fa fa-history"></i> Histórico de Reprodução</h3>
              <span class="count-badge">{{ formatNumber(historicoCompleto.length) }} reproduções</span>
            </div>
            <div class="header-actions">
              <button class="btn-clear" @click="clearHistory" v-if="historicoCompleto.length > 0 && isOwnProfile">
                <i class="fa fa-trash"></i> Limpar
              </button>
            </div>
          </div>
         
          <div class="history-timeline" v-if="historicoCompleto.length > 0">
            <div
              v-for="(item, index) in groupedHistory"
              :key="index"
              class="history-group"
            >
              <div class="history-date-header">
                <span class="date-label">{{ item.date }}</span>
                <span class="date-count">{{ item.items.length }} músicas</span>
              </div>
             
              <div class="history-items">
                <div
                  v-for="music in item.items"
                  :key="music.id"
                  class="history-item-detailed"
                  @click="playMusic(music)"
                >
                  <img :src="music.cover" :alt="music.title" />
                  <div class="history-item-info">
                    <h4>{{ music.title }}</h4>
                    <p>{{ music.artist }}</p>
                  </div>
                  <span class="history-time">{{ music.hora }}</span>
                  <button class="btn-like" @click.stop="toggleLike(music)">
                    <i :class="music.curtido ? 'fa fa-heart' : 'fa fa-heart-o'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
         
          <div class="empty-state large" v-else>
            <div class="empty-icon large">
              <i class="fa fa-history"></i>
            </div>
            <h4>Histórico vazio</h4>
            <p>Suas reproduções aparecerão aqui</p>
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
      <img :src="user.avatar || defaultAvatar" :alt="user.nome" class="user-avatar-large" />
      <h4>{{ user.nome }}</h4>
      <p>@{{ user.username }}</p>

      <button
        v-if="String(user._id) !== String(getLoggedUserId())"
        class="btn-follow-small"
        @click.stop="toggleFollowUser(user)"
        :class="{ 'following': user.isFollowing }"
      >
        {{ user.isFollowing ? 'Seguindo' : 'Seguir' }}
      </button>
    </div>
  </div>

  <div class="empty-state large" v-else>
    <div class="empty-icon large">
      <i class="fa fa-users"></i>
    </div>
    <h4>Nenhum seguidor ainda</h4>
    <p>Quando alguém seguir este perfil, aparecerá aqui</p>
  </div>
</div>
<div v-if="activeTab === 'following'" class="tab-content">
  <div class="users-grid" v-if="seguindoList.length">
    <div
      v-for="user in seguindoList"
      :key="user._id"
      class="user-card"
      @click="goToProfile(user)"
    >
      <img :src="user.avatar || defaultAvatar" :alt="user.nome" class="user-avatar-large" />
      <h4>{{ user.nome }}</h4>
      <p>@{{ user.username }}</p>

      <button
        v-if="String(user._id) !== String(getLoggedUserId())"
        class="btn-follow-small following"
        @click.stop="toggleFollowUser(user)"
      >
        Seguindo
      </button>
    </div>
  </div>

  <div class="empty-state large" v-else>
    <div class="empty-icon large">
      <i class="fa fa-user-plus"></i>
    </div>
    <h4>Não segue ninguém ainda</h4>
    <p>Os usuários seguidos aparecerão aqui</p>
  </div>
</div>

    </div>

    <!-- Modal de Edição de Perfil -->
    <transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <div class="header-info">
              <h3><i class="fa fa-pencil"></i> Editar Perfil</h3>
              <p>Personalize como as pessoas te veem</p>
            </div>
            <button class="btn-close" @click="closeEditModal">
              <i class="fa fa-times"></i>
            </button>
          </div>
         
          <div class="modal-body">
            <!-- Preview do Perfil -->
            <div class="profile-preview">
              <div class="preview-cover" :style="previewCoverStyle">
                <div class="preview-cover-overlay">
                  <button class="btn-change-cover" @click="triggerCoverUpload">
                    <i class="fa fa-camera"></i> Alterar capa
                  </button>
                </div>
              </div>
              <div class="preview-avatar-wrapper">
                <img :src="editForm.avatar || defaultAvatar" class="preview-avatar" />
                <button class="btn-change-avatar" @click="triggerAvatarUpload">
                  <i class="fa fa-camera"></i>
                </button>
              </div>
            </div>

            <!-- Formulário -->
            <div class="form-grid">
              <div class="form-group">
                <label>Nome completo <span class="required">*</span></label>
                <input
                  v-model="editForm.nome"
                  type="text"
                  placeholder="Como você quer ser chamado"
                  maxlength="50"
                  :class="{ 'error': formErrors.nome }"
                />
                <span class="error-message" v-if="formErrors.nome">{{ formErrors.nome }}</span>
                <span class="char-count">{{ editForm.nome?.length || 0 }}/50</span>
              </div>
             
              <div class="form-group">
                <label>Nome de usuário <span class="required">*</span></label>
                <div class="input-prefix">
                  <span class="prefix">@</span>
                  <input
                    v-model="editForm.username"
                    type="text"
                    placeholder="seu_username"
                    maxlength="30"
                    :class="{ 'error': formErrors.username }"
                    @blur="checkUsernameAvailability"
                  />
                </div>
                <span class="error-message" v-if="formErrors.username">{{ formErrors.username }}</span>
                <span class="hint" v-else>URL do perfil: spotify-clone.com/u/{{ editForm.username }}</span>
                <span class="availability" :class="usernameStatus.type" v-if="usernameStatus.message">
                  <i :class="usernameStatus.icon"></i> {{ usernameStatus.message }}
                </span>
              </div>
             
              <div class="form-group full-width">
                <label>Bio</label>
                <textarea
                  v-model="editForm.bio"
                  placeholder="Conte um pouco sobre você, seus gostos musicais, bandas favoritas..."
                  maxlength="160"
                  rows="3"
                  :class="{ 'error': formErrors.bio }"
                ></textarea>
                <span class="error-message" v-if="formErrors.bio">{{ formErrors.bio }}</span>
                <span class="char-count">{{ editForm.bio?.length || 0 }}/160</span>
              </div>
             
              <div class="form-group">
                <label>Email <span class="required">*</span></label>
                <input
                  v-model="editForm.email"
                  type="email"
                  placeholder="seu@email.com"
                  :class="{ 'error': formErrors.email }"
                />
                <span class="error-message" v-if="formErrors.email">{{ formErrors.email }}</span>
              </div>
             
              <div class="form-group">
                <label>Localização</label>
                <input
                  v-model="editForm.localizacao"
                  type="text"
                  placeholder="Cidade, País"
                  maxlength="50"
                />
                <span class="hint">Ex: São Paulo, Brasil</span>
              </div>

              <div class="form-group">
                <label>Site / Link</label>
                <input
                  v-model="editForm.website"
                  type="url"
                  placeholder="https://seusite.com"
                />
              </div>

              <div class="form-group">
                <label>Gêneros favoritos</label>
                <div class="genre-selector">
                  <button
                    v-for="genre in availableGenres"
                    :key="genre"
                    :class="['genre-chip', { active: (editForm.generos || []).includes(genre) }]"
                    @click="toggleEditGenre(genre)"
                  >
                    {{ genre }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Preferências -->
            <div class="preferences-section">
              <h4><i class="fa fa-cog"></i> Preferências</h4>
             
              <div class="preference-item">
                <div class="preference-info">
                  <span class="preference-title">Perfil privado</span>
                  <span class="preference-desc">Apenas seguidores aprovados podem ver seu perfil</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="editForm.perfilPrivado" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
             
              <div class="preference-item">
                <div class="preference-info">
                  <span class="preference-title">Mostrar atividade</span>
                  <span class="preference-desc">Deixar outros usuários verem o que você está ouvindo</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="editForm.mostrarAtividade" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
         
          <div class="modal-footer">
            <div class="footer-actions">
              <button class="btn-secondary" @click="closeEditModal">Cancelar</button>
              <button class="btn-danger" @click="confirmDeleteAccount">
                <i class="fa fa-trash"></i> Excluir conta
              </button>
            </div>
            <button class="btn-primary btn-large" @click="saveProfile" :disabled="saving || !isFormValid">
              <i v-if="saving" class="fa fa-spinner fa-spin"></i>
              <i v-else class="fa fa-check"></i>
              {{ saving ? 'Salvando...' : 'Salvar alterações' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de Confirmação de Exclusão -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
        <div class="modal-content modal-danger">
          <div class="modal-header danger">
            <div class="danger-icon">
              <i class="fa fa-exclamation-triangle"></i>
            </div>
            <h3>Excluir conta permanentemente</h3>
          </div>
         
          <div class="modal-body">
            <div class="warning-box">
              <p><strong>Esta ação não pode ser desfeita!</strong></p>
              <p>Todos os seus dados serão permanentemente removidos, incluindo:</p>
              <ul>
                <li><i class="fa fa-music"></i> {{ musicasFavoritas.length }} músicas curtidas</li>
                <li><i class="fa fa-list"></i> {{ todasPlaylists.length }} playlists criadas</li>
                <li><i class="fa fa-history"></i> Histórico completo de reprodução</li>
                <li><i class="fa fa-user"></i> Seguidores e seguindo</li>
                <li><i class="fa fa-cog"></i> Todas as configurações</li>
              </ul>
            </div>
           
            <div class="confirm-section">
              <p>Para confirmar, digite <strong>"{{ usuario.username }}"</strong> abaixo:</p>
              <input
                v-model="deleteConfirmText"
                type="text"
                placeholder="Digite seu nome de usuário"
                class="confirm-input"
                :class="{ 'error': deleteError }"
              />
              <span class="error-message" v-if="deleteError">{{ deleteError }}</span>
            </div>
           
            <div class="password-section">
              <label>Digite sua senha</label>
              <div class="password-input">
                <input
                  v-model="deletePassword"
                  :type="showDeletePassword ? 'text' : 'password'"
                  placeholder="Sua senha atual"
                />
                <button @click="showDeletePassword = !showDeletePassword">
                  <i :class="showDeletePassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                </button>
              </div>
            </div>
          </div>
         
          <div class="modal-footer danger">
            <button class="btn-secondary" @click="closeDeleteModal">Cancelar</button>
            <button
              class="btn-danger btn-large"
              @click="executeDeleteAccount"
              :disabled="deleting || deleteConfirmText !== usuario.username || !deletePassword"
            >
              <i v-if="deleting" class="fa fa-spinner fa-spin"></i>
              <i v-else class="fa fa-trash"></i>
              {{ deleting ? 'Excluindo...' : 'Excluir minha conta' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de Adicionar à Playlist -->
    <transition name="modal">
      <div v-if="showAddToPlaylistModal" class="modal-overlay" @click.self="closeAddToPlaylistModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Adicionar à playlist</h3>
            <button class="btn-close" @click="closeAddToPlaylistModal">
              <i class="fa fa-times"></i>
            </button>
          </div>
         
          <div class="modal-body">
            <div class="playlist-selector">
              <div
                v-for="playlist in minhasPlaylists"
                :key="playlist._id"
                class="playlist-option"
                @click="addMusicToPlaylist(playlist)"
                :class="{ 'selected': selectedPlaylist === playlist._id }"
              >
                <img :src="playlist.cover || playlist.capa"  :alt="playlist.nome" />
                <div class="playlist-option-info">
                  <h4>{{ playlist.nome }}</h4>
                  <p>{{ playlist.musicas.length }} músicas</p>
                </div>
                <i class="fa fa-check" v-if="selectedPlaylist === playlist._id"></i>
              </div>
             
              <div class="playlist-option create-new" @click="createAndAdd">
                <div class="create-icon-small">
                  <i class="fa fa-plus"></i>
                </div>
                <span>Criar nova playlist</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast de Notificação -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <div class="toast-content">
          <div class="toast-icon">
            <i :class="toast.icon"></i>
          </div>
          <div class="toast-text">
            <span class="toast-title">{{ toast.title }}</span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
        </div>
        <button class="toast-close" @click="toast.show = false">
          <i class="fa fa-times"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'

// Diretiva para clicar fora
const clickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

export default {
  name: "Perfil",
 
  directives: {
    'click-outside': clickOutside
  },
 
  data() {
    return {
      activeTab: 'overview',
      seguindoList: [],
       openedPlaylist: null,
    tabs: [
  { id: 'overview', label: 'Visão Geral', icon: 'fa fa-home', count: null },
  { id: 'likes', label: 'Curtidas', icon: 'fa fa-heart', count: 0 },
  { id: 'playlists', label: 'Playlists', icon: 'fa fa-list', count: 0 },
  { id: 'history', label: 'Histórico', icon: 'fa fa-history', count: null },
  { id: 'followers', label: 'Seguidores', icon: 'fa fa-users', count: 0 },
  { id: 'following', label: 'Seguindo', icon: 'fa fa-user-plus', count: 0 }
],
     
      // Dados do usuário
      usuario: {
        id: null,
        nome: "",
        username: "",
        email: "",
        bio: "",
        avatar: null,
        cover: null,
        localizacao: "",
        website: "",
        membroDesde: null,
        ultimoAcesso: null,
        verificado: false,
        perfilPrivado: false,
        mostrarAtividade: true,
        generos: []
      },
     
      defaultAvatar: "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff",
     
      // Estados
      isOwnProfile: true,
      isOnline: true,
      isPro: false,
      isFollowing: false,
      currentPlayingId: null,
     
      // Estatísticas
      estatisticas: {
        musicasCurtidas: 0,
        playlists: 0,
        seguidores: 128,
        seguindo: 45,
        ouvintesMensais: 0
      },
     
 // Listas
musicasFavoritas: [],
playlistsRecentes: [],
todasPlaylists: [],
minhasPlaylists: [],
historicoRecente: [],
historicoCompleto: [],
artistasFavoritos: [],
favoritos: [],
favoritosRecentes: [],
atividadesRecentes: [],
seguidoresList: [],
topTrack: null,
     
      // Filtros e Ordenação
      showFilters: false,
      activeFilter: 'all',
      selectedGenres: [],
      sortDesc: true,
      filterPeriods: [
        { value: 'all', label: 'Tudo' },
        { value: 'week', label: 'Esta semana' },
        { value: 'month', label: 'Este mês' },
        { value: 'year', label: 'Este ano' }
      ],
      genres: ['Pop', 'Rock', 'Hip Hop', 'Eletrônica', 'Jazz', 'Clássica', 'R&B', 'Country', 'Latina', 'Indie'],
     
      // Modal de edição
      showEditModal: false,
      editForm: {},
      formErrors: {},
      saving: false,
      usernameStatus: { type: '', message: '', icon: '' },
      availableGenres: ['Pop', 'Rock', 'Hip Hop', 'Eletrônica', 'Jazz', 'Clássica', 'R&B', 'Country', 'Latina', 'Indie', 'Metal', 'Funk', 'Samba', 'MPB', 'Reggae', 'Blues'],
     
      // Modal de exclusão
      showDeleteModal: false,
      showContextMenu: false,
      deleteConfirmText: '',
      deletePassword: '',
      showDeletePassword: false,
      deleting: false,
      deleteError: '',
     
      // Modal de playlist
      showAddToPlaylistModal: false,
      selectedPlaylist: null,
      musicToAdd: null,
     
      // Toast
      toast: {
        show: false,
        title: "",
        message: "",
        type: "success",
        icon: "fa fa-check-circle"
      },
     
      toastTimeout: null
    }
  },

  computed: {
   coverStyle() {
  return this.usuario.cover
    ? {
        backgroundImage: `url(${this.usuario.cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      }
},
   
previewCoverStyle() {
  const cover = this.editForm.cover || this.usuario.cover

  return cover
    ? {
        backgroundImage: `url(${cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
      }
},
   
    isNewMember() {
      if (!this.usuario.membroDesde) return false
      const dias = Math.floor((Date.now() - new Date(this.usuario.membroDesde)) / (1000 * 60 * 60 * 24))
      return dias <= 30
    },
   
    isFormValid() {
      return this.editForm.nome?.length >= 2 &&
             this.editForm.username?.length >= 3 &&
             this.editForm.email?.includes('@') &&
             !this.formErrors.username
    },
   
    filteredMusicas() {
      let musicas = [...this.musicasFavoritas]
     
      // Filtro de período
      if (this.activeFilter !== 'all') {
        const now = Date.now()
        const limits = {
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000
        }
        musicas = musicas.filter(m => {
          const data = new Date(m.dataCurtida || m.adicionadoEm)
          return (now - data.getTime()) < limits[this.activeFilter]
        })
      }
     
      // Filtro de gênero
      if (this.selectedGenres.length > 0) {
        musicas = musicas.filter(m => this.selectedGenres.some(g => m.genero?.includes(g)))
      }
     
      // Ordenação
      musicas.sort((a, b) => {
        const dateA = new Date(a.dataCurtida || a.adicionadoEm)
        const dateB = new Date(b.dataCurtida || b.adicionadoEm)
        return this.sortDesc ? dateB - dateA : dateA - dateB
      })
     
      return musicas
    },
   
    filteredPlaylists() {
      return this.todasPlaylists.filter(p => {
        if (p.privacidade === 'Privada' && !this.isOwnProfile) return false
        return true
      })
    },
   
    groupedHistory() {
      const groups = {}
      this.historicoCompleto.forEach(item => {
        const date = new Date(item.data).toLocaleDateString('pt-BR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        if (!groups[date]) groups[date] = []
        groups[date].push(item)
      })
     
      return Object.entries(groups).map(([date, items]) => ({
        date: date.charAt(0).toUpperCase() + date.slice(1),
        items
      }))
    }
  },

mounted() {
  this.carregarUsuarioLogado()
  this.carregarDados()
  this.carregarCurtidas()
  this.carregarFavoritos()
  this.carregarArtistas()
  this.carregarAtividades()
  this.carregarFollows() 

  this.onPlaylistUpdated = () => this.carregarDados()
  this.onLikesUpdated = () => this.carregarCurtidas()
  this.onFavoritesUpdated = () => this.carregarFavoritos()
  this.onPerfilUpdated = () => this.carregarUsuarioLogado()

  window.addEventListener('playlist-updated', this.onPlaylistUpdated)
  window.addEventListener('likes-updated', this.onLikesUpdated)
  window.addEventListener('favoritas-updated', this.onFavoritesUpdated)
  window.addEventListener('perfil-updated', this.onPerfilUpdated)
  window.addEventListener('focus', this.handleFocus)
  window.addEventListener('storage', this.handleStorage)
},

beforeUnmount() {
  if (this.toastTimeout) clearTimeout(this.toastTimeout)

  window.removeEventListener('playlist-updated', this.onPlaylistUpdated)
  window.removeEventListener('likes-updated', this.onLikesUpdated)
  window.removeEventListener('favoritas-updated', this.onFavoritesUpdated)
  window.removeEventListener('perfil-updated', this.onPerfilUpdated)
  window.removeEventListener('focus', this.handleFocus)
  window.removeEventListener('storage', this.handleStorage)
},

  methods: {
    
    carregarUsuarioLogado() {
      const storedUser = localStorage.getItem('usuario')
      const storedProfile = localStorage.getItem('usuario_perfil')
     
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        this.usuario = {
  ...this.usuario,
  ...userData,
  id: userData.id || userData._id || this.usuario.id
}
     
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile)
      this.usuario = {
  ...this.usuario,
  ...profileData,
  id: profileData.id || profileData._id || this.usuario.id
}
        }
       
        // Atualizar counts das tabs
        this.tabs[1].count = this.estatisticas.musicasCurtidas
        this.tabs[2].count = this.estatisticas.playlists
        this.tabs[4].count = this.estatisticas.seguidores
      } else {
  this.$router.push('/login')
}
    },
    getLoggedUserId() {
  return String(this.usuario?._id || this.usuario?.id || '')
},

getProfileUserId() {
  return String(this.usuario?._id || this.usuario?.id || '')
},

setTabCount(tabId, count) {
  const tab = this.tabs.find(t => t.id === tabId)
  if (tab) tab.count = count
},

async carregarFollows() {
  try {
    const token = localStorage.getItem("token")
    const userId = this.getProfileUserId()

    if (!userId || !token) return

    const authConfig = {
      headers: { Authorization: `Bearer ${token}` }
    }

    const [resSeguidores, resSeguindoUsuarios, resSeguindoCantores] = await Promise.all([
      axios.get(`http://localhost:3002/follows/seguidores/${userId}?tipo=usuario`),
      axios.get(`http://localhost:3002/follows/usuario/seguindo?tipo=usuario`, authConfig),
      axios.get(`http://localhost:3002/follows/usuario/seguindo?tipo=cantor`, authConfig)
    ])

    const seguindoUsuarios = (resSeguindoUsuarios.data || [])
      .filter(f => f.seguindo_id)
      .map(f => ({
        _id: String(f.seguindo_id?._id || f.seguindo_id?.id || f.seguindo_id),
        nome: f.seguindo_id?.nome || 'Usuário',
        username: f.seguindo_id?.username || 'usuario',
        avatar: f.seguindo_id?.avatar || null,
        tipo: 'usuario',
        isFollowing: true
      }))

    const seguindoCantores = (resSeguindoCantores.data || [])
      .filter(f => f.seguindo_id)
      .map(f => ({
        _id: String(f.seguindo_id?._id || f.seguindo_id?.id || f.seguindo_id),
        nome: f.seguindo_id?.nome || 'Artista',
        username: null,
        avatar:
          f.seguindo_id?.foto ||
          f.seguindo_id?.avatar ||
          'https://e-cdns-images.dzcdn.net/images/artist/d41d8cd98f00b204e9800998ecf8427e/500x500.jpg',
        tipo: 'cantor',
        isFollowing: true,
        generos: f.seguindo_id?.generos || []
      }))

    const seguindoUsuariosIds = new Set(
      seguindoUsuarios.map(u => String(u._id))
    )

    this.seguidoresList = (resSeguidores.data || [])
      .filter(f => f.seguidor_id)
      .map(f => ({
        _id: String(f.seguidor_id?._id || f.seguidor_id?.id),
        nome: f.seguidor_id?.nome || 'Usuário',
        username: f.seguidor_id?.username || 'usuario',
        avatar: f.seguidor_id?.avatar || null,
        tipo: 'usuario',
        isFollowing: seguindoUsuariosIds.has(String(f.seguidor_id?._id || f.seguidor_id?.id))
      }))

    // junta usuários + artistas na mesma aba "Seguindo"
    this.seguindoList = [...seguindoUsuarios, ...seguindoCantores]

    this.estatisticas.seguidores = this.seguidoresList.length
    this.estatisticas.seguindo = this.seguindoList.length

    this.setTabCount('followers', this.seguidoresList.length)
    this.setTabCount('following', this.seguindoList.length)

  } catch (error) {
    console.error("Erro ao carregar follows:", error)
  }
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
async handleCoverChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    this.showToast({
      title: "Erro",
      message: "Selecione uma imagem válida para a capa",
      type: "error",
      icon: "fa fa-exclamation-circle"
    })
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    this.showToast({
      title: "Erro",
      message: "A imagem da capa deve ter no máximo 5MB",
      type: "error",
      icon: "fa fa-exclamation-circle"
    })
    return
  }

  try {
    const novaCover = await this.compressImage(file, {
      maxWidth: 1600,
      maxHeight: 900,
      quality: 0.82,
      mimeType: 'image/jpeg'
    })

    if (!this.showEditModal) {
      this.openEditModal()
      this.$nextTick(() => {
        this.editForm.cover = novaCover
      })
    } else {
      this.editForm.cover = novaCover
    }

    this.showToast({
      title: "Capa atualizada",
      message: "A nova capa foi carregada no preview",
      type: "success",
      icon: "fa fa-check"
    })
  } catch (error) {
    this.showToast({
      title: "Erro",
      message: "Não foi possível processar a imagem da capa",
      type: "error",
      icon: "fa fa-exclamation-circle"
    })
  } finally {
    event.target.value = ''
  }
},
abrirFavorito(item) {
  if (item.type === 'musica') {
    this.playMusic(item)
    return
  }

  if (item.type === 'playlist') {
    this.openPlaylist({ _id: item.id })
    return
  }

  if (item.type === 'album') {
    this.$router.push(`/album/${item.id}`)
    return
  }

  if (item.type === 'cantor') {
    this.$router.push(`/cantor/${item.id}`)
    return
  }
},

async compressImage(file, {
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.75,
  mimeType = 'image/jpeg'
} = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL(mimeType, quality)
        resolve(compressedBase64)
      }

      img.onerror = reject
      img.src = e.target.result
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
},

persistUsuario(user) {
  localStorage.setItem('usuario', JSON.stringify(user))
  localStorage.setItem('usuario_perfil', JSON.stringify(user))
  window.dispatchEvent(new Event('perfil-updated'))
},

  handleFocus() {
  this.carregarCurtidas()
  this.carregarDados()
  this.carregarFavoritos()
},

handleStorage(e) {
  if (e.key === 'usuario_perfil') {
    this.carregarUsuarioLogado()
  }
},
   
async carregarDados() {
  const token = localStorage.getItem("token")

const res = await fetch("http://localhost:3002/playlists", {
  headers: { Authorization: `Bearer ${token}` }
})

if (!res.ok) {
  console.error("Erro ao buscar playlists")
  return
}

const data = await res.json() || []

this.todasPlaylists = data.map(p => ({
  _id: p._id,
  nome: p.nome,
  cover: p.cover || p.capa || 'https://via.placeholder.com/150',
  musicas: p.musicas?.length || 0,
  privacidade: p.privacidade || (p.privada ? 'Privada' : 'Pública'),
  descricao: p.descricao || '',
  duracaoTotal: p.duracaoTotal || '0 min',
  curtidas: p.curtidas || 0
}))
this.minhasPlaylists = data
this.playlistsRecentes = data.slice(0, 4)
this.estatisticas.playlists = data.length
this.tabs[2].count = data.length
},
   
async carregarCurtidas() {
  try {
    const token = localStorage.getItem("token")

    const res = await fetch(`http://localhost:3002/curtidas`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) throw new Error("Erro ao buscar curtidas")

    const data = await res.json()

    this.musicasFavoritas = data.map(c => ({
      id: c.musica._id,
      nome: c.musica.nome,
     cantores: (c.musica.cantores || []).filter(c => c && c.nome),
      cover: c.musica.foto,
      url: c.musica.link,
      duration: c.musica.duracao,
      curtido: true,              // 🔥 MUITO IMPORTANTE
      dataCurtida: c.createdAt    // 🔥 para ordenação
    }))

    this.estatisticas.musicasCurtidas = data.length
    this.tabs[1].count = data.length

  } catch (error) {
    console.error(error)
  }
}, 

async carregarFavoritos() {
  try {
    const token = localStorage.getItem("token")

    const res = await fetch("http://localhost:3002/favoritas", {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) throw new Error("Erro ao buscar favoritas")

    const data = await res.json()

    this.favoritos = data.map(f => {

if (f.musica) {
        return {
          id: f.musica._id,
          type: "musica",
          nome: f.musica.nome,
          artist: f.musica.cantores?.length
            ? f.musica.cantores.map(c => c.nome).join(', ')
            : "Artista desconhecido",
          cover: f.musica.foto,
          url: f.musica.link,
          duration: f.musica.duracao,
          dataFavoritado: f.createdAt
        }
      }
 // 📀 PLAYLIST
      if (f.playlist) {
        return {
          id: f.playlist._id,
          type: "playlist",
          nome: f.playlist.nome,
          artist: f.playlist.descricao || "Playlist",
          cover: f.playlist.capa || f.playlist.cover || "https://via.placeholder.com/150",
          musicas: f.playlist.quantidadeMusicas || f.playlist.musicas?.length || 0,
          duracaoTotal: f.playlist.duracaoTotal || "0 min",
          dataFavoritado: f.createdAt
        }
      }
       // 💿 ÁLBUM (NOVO)
      if (f.album) {
        return {
          id: f.album._id,
          type: "album",
          nome: f.album.nome,
          artist: f.album.cantor?.nome || "Álbum",
          cover: f.album.foto,
          musicas: f.album.musicas?.length || 0,
          dataFavoritado: f.createdAt
        }
      }

      // 🎤 CANTOR (NOVO)
      if (f.cantor) {
        return {
          id: f.cantor._id,
          type: "cantor",
          nome: f.cantor.nome,
          artist: "Artista",
          cover: f.cantor.foto,
          dataFavoritado: f.createdAt
        }
      }

      return null
    }).filter(Boolean)

    this.favoritosRecentes = [...this.favoritos]
      .sort((a, b) => new Date(b.dataFavoritado) - new Date(a.dataFavoritado))
      .slice(0, 6)

  } catch (error) {
    console.error(error)
    this.favoritos = []
    this.favoritosRecentes = []
  }
},
   
    carregarArtistas() {
      this.artistasFavoritos = [
        { id: 1, name: "Queen", plays: 5234, image: "https://ui-avatars.com/api/?name=Queen&background=e91e63&color=fff" },
        { id: 2, name: "The Beatles", plays: 4891, image: "https://ui-avatars.com/api/?name=Beatles&background=2196f3&color=fff" },
        { id: 3, name: "Pink Floyd", plays: 3654, image: "https://ui-avatars.com/api/?name=Pink+Floyd&background=9c27b0&color=fff" },
        { id: 4, name: "Led Zeppelin", plays: 2987, image: "https://ui-avatars.com/api/?name=Led+Zeppelin&background=ff9800&color=fff" },
        { id: 5, name: "Nirvana", plays: 2456, image: "https://ui-avatars.com/api/?name=Nirvana&background=4caf50&color=fff" },
        { id: 6, name: "Arctic Monkeys", plays: 1987, image: "https://ui-avatars.com/api/?name=Arctic+Monkeys&background=00bcd4&color=fff" }
      ]
    },
   
    carregarAtividades() {
      this.atividadesRecentes = [
        { id: 1, tipo: 'like', texto: 'Curtiu <strong>Yesterday</strong> de <strong>The Beatles</strong>', data: new Date(Date.now() - 1000 * 60 * 30), imagem: 'https://images.unsplash.com/photo-1511735111819-9a3f77ebd235?w=100&h=100&fit=crop' },
        { id: 2, tipo: 'playlist', texto: 'Criou a playlist <strong>Rock Clássico</strong>', data: new Date(Date.now() - 1000 * 60 * 60 * 2), imagem: null },
        { id: 3, tipo: 'follow', texto: 'Começou a seguir <strong>Rock Classics</strong>', data: new Date(Date.now() - 1000 * 60 * 60 * 5), imagem: null },
        { id: 4, tipo: 'share', texto: 'Compartilhou <strong>Bohemian Rhapsody</strong>', data: new Date(Date.now() - 1000 * 60 * 60 * 24), imagem: 'https://images.unsplash.com/photo-1511735111819-9a3f77ebd235?w=100&h=100&fit=crop' }
      ]
    },

    handleAvatarError() {
      this.usuario.avatar = this.defaultAvatar
    },

 triggerAvatarUpload() {
  if (this.$refs.avatarInput) {
    this.$refs.avatarInput.click()
  }
},

triggerCoverUpload() {
  if (this.$refs.coverInput) {
    this.$refs.coverInput.click()
  }
},

async handleAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    this.showToast({
      title: "Erro",
      message: "Selecione uma imagem válida",
      type: "error",
      icon: "fa fa-exclamation-circle"
    })
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    this.showToast({
      title: "Erro",
      message: "Avatar original deve ter no máximo 2MB",
      type: "error",
      icon: "fa fa-exclamation-circle"
    })
    return
  }

  try {
    const novoAvatar = await this.compressImage(file, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.78,
      mimeType: 'image/jpeg'
    })

    if (!this.showEditModal) {
      this.openEditModal()
      this.$nextTick(() => {
        this.editForm.avatar = novoAvatar
      })
    } else {
      this.editForm.avatar = novoAvatar
    }

    this.showToast({
      title: "Imagem carregada",
      message: "Avatar atualizado no preview",
      type: "success",
      icon: "fa fa-check"
    })
  } catch (error) {
    this.showToast({
      title: "Erro",
      message: "Não foi possível processar o avatar",
      type: "error",
      icon: "fa fa-exclamation-circle"
    })
  } finally {
    event.target.value = ''
  }
},

openEditModal() {
  this.editForm = {
    nome: this.usuario.nome || '',
    username: this.usuario.username || '',
    email: this.usuario.email || '',
    bio: this.usuario.bio || '',
    avatar: this.usuario.avatar || null,
    cover: this.usuario.cover || null,
    localizacao: this.usuario.localizacao || '',
    website: this.usuario.website || '',
    generos: [...(this.usuario.generos || [])],
    perfilPrivado: !!this.usuario.perfilPrivado,
    mostrarAtividade: this.usuario.mostrarAtividade !== false
  }

  this.formErrors = {}
  this.usernameStatus = { type: '', message: '', icon: '' }
  this.showEditModal = true
},

    closeEditModal() {
      this.showEditModal = false
      this.editForm = {}
    },

    async checkUsernameAvailability() {
      if (!this.editForm.username || this.editForm.username === this.usuario.username) return
     
      // Simulação de verificação
      this.usernameStatus = { type: 'loading', message: 'Verificando...', icon: 'fa fa-spinner fa-spin' }
     
      setTimeout(() => {
        const taken = ['admin', 'root', 'user', 'test'].includes(this.editForm.username.toLowerCase())
        if (taken) {
          this.usernameStatus = { type: 'error', message: 'Nome de usuário já existe', icon: 'fa fa-times-circle' }
          this.formErrors.username = 'Este nome de usuário já está em uso'
        } else {
          this.usernameStatus = { type: 'success', message: 'Nome de usuário disponível', icon: 'fa fa-check-circle' }
          this.formErrors.username = ''
        }
      }, 800)
    },

    toggleEditGenre(genre) {
      if (!this.editForm.generos) this.editForm.generos = []
      const index = this.editForm.generos.indexOf(genre)
      if (index > -1) {
        this.editForm.generos.splice(index, 1)
      } else if (this.editForm.generos.length < 5) {
        this.editForm.generos.push(genre)
      }
    },

    validateForm() {
      this.formErrors = {}
     
      if (!this.editForm.nome || this.editForm.nome.length < 2) {
        this.formErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
      }
     
      if (!this.editForm.username || this.editForm.username.length < 3) {
        this.formErrors.username = 'Nome de usuário deve ter pelo menos 3 caracteres'
      } else if (!/^[a-zA-Z0-9_]+$/.test(this.editForm.username)) {
        this.formErrors.username = 'Use apenas letras, números e underline'
      }
     
      if (!this.editForm.email || !this.editForm.email.includes('@')) {
        this.formErrors.email = 'Email inválido'
      }
     
      return Object.keys(this.formErrors).length === 0
    },

 async saveProfile() {
  if (!this.validateForm()) return

  this.saving = true

  try {
    if (!this.usuario?.id) {
      throw new Error("Usuário não identificado")
    }

    const payload = {
      nome: this.editForm.nome,
      username: this.editForm.username,
      bio: this.editForm.bio,
      email: this.editForm.email,
      localizacao: this.editForm.localizacao
    }

    if (this.editForm.avatar !== this.usuario.avatar) {
      payload.avatar = this.editForm.avatar ?? null
    }

    if (this.editForm.cover !== this.usuario.cover) {
      payload.cover = this.editForm.cover ?? null
    }

    if (this.editForm.website !== this.usuario.website) {
      payload.website = this.editForm.website ?? ''
    }

    if (JSON.stringify(this.editForm.generos || []) !== JSON.stringify(this.usuario.generos || [])) {
      payload.generos = this.editForm.generos ?? []
    }

    if (this.editForm.perfilPrivado !== this.usuario.perfilPrivado) {
      payload.perfilPrivado = !!this.editForm.perfilPrivado
    }

    if (this.editForm.mostrarAtividade !== this.usuario.mostrarAtividade) {
      payload.mostrarAtividade = this.editForm.mostrarAtividade !== false
    }

    const response = await axios.put(
      `http://localhost:3002/usuarios/${this.usuario.id}`,
      payload,
      this.getAuthConfig()
    )

    const updatedUser = response.data.user
      ? { ...this.usuario, ...response.data.user }
      : { ...this.usuario, ...payload }

    this.usuario = updatedUser
    this.persistUsuario(this.usuario)

    this.closeEditModal()

    this.showToast({
      title: "Perfil atualizado! 🎉",
      message: "Suas alterações foram salvas com sucesso",
      type: "success",
      icon: "fa fa-check-circle",
      duration: 4000
    })
  } catch (error) {
    this.showToast({
      title: "Erro ao salvar",
      message: error.response?.data?.error || error.message || "Tente novamente mais tarde",
      type: "error",
      icon: "fa fa-exclamation-circle"
    })
  } finally {
    this.saving = false
  }
},

    showMoreOptions() {
      this.showContextMenu = !this.showContextMenu
    },

    closeContextMenu() {
      this.showContextMenu = false
    },

    copyProfileUrl() {
      const url = `${window.location.origin}/perfil/${this.usuario.username}`
      navigator.clipboard.writeText(url)
      this.showToast({
        title: "Link copiado!",
        message: "URL do perfil copiada para a área de transferência",
        type: "success",
        icon: "fa fa-link"
      })
      this.closeContextMenu()
    },

    reportUser() {
      this.showToast({
        title: "Denúncia enviada",
        message: "Obrigado por ajudar a manter a comunidade segura",
        type: "info",
        icon: "fa fa-flag"
      })
      this.closeContextMenu()
    },

    blockUser() {
      this.showToast({
        title: "Usuário bloqueado",
        message: "Você não verá mais conteúdo deste usuário",
        type: "info",
        icon: "fa fa-ban"
      })
      this.closeContextMenu()
    },

    confirmDeleteAccount() {
      this.closeContextMenu()
      this.deleteConfirmText = ''
      this.deletePassword = ''
      this.deleteError = ''
      this.showDeleteModal = true
    },

    closeDeleteModal() {
      this.showDeleteModal = false
    },

    async executeDeleteAccount() {
      if (this.deleteConfirmText !== this.usuario.username) {
        this.deleteError = 'Nome de usuário não confere'
        return
      }
     
      if (!this.deletePassword) {
        this.deleteError = 'Digite sua senha'
        return
      }
     
      this.deleting = true
     
      try {
       await axios.delete(`http://localhost:3002/usuarios/${this.usuario.id}`, {
  data: { senha: this.deletePassword },
  ...this.getAuthConfig()
})
       
        // Limpar dados locais
        localStorage.removeItem('usuario')
        localStorage.removeItem('usuario_perfil')
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('curtidas')
        localStorage.removeItem('playlists')
        localStorage.removeItem('historico')
       
        this.showToast({
          title: "Conta excluída",
          message: "Sua conta foi permanentemente removida",
          type: "success",
          icon: "fa fa-check-circle"
        })
       
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
       
      } catch (error) {
        this.deleting = false
        this.deleteError = error.response?.data?.error || 'Senha incorreta ou erro ao excluir'
      }
    },

   async toggleFollow() {
  try {
    const token = localStorage.getItem('token')
    const targetId = this.getProfileUserId()

    if (!token || !targetId) return
    if (this.isOwnProfile) return

    const tipo = 'usuario'

    if (this.isFollowing) {
      await axios.delete(`http://localhost:3002/follows/desseguir`, {
        data: {
          seguindo_id: targetId,
          tipo
        },
        headers: { Authorization: `Bearer ${token}` }
      })

      this.isFollowing = false
      this.estatisticas.seguidores = Math.max(0, this.estatisticas.seguidores - 1)

      this.showToast({
        title: "Deixou de seguir",
        message: `Você deixou de seguir ${this.usuario.nome}`,
        type: "info",
        icon: "fa fa-user-times"
      })
    } else {
      await axios.post(`http://localhost:3002/follows/seguir`, {
        seguindo_id: targetId,
        tipo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      this.isFollowing = true
      this.estatisticas.seguidores += 1

      this.showToast({
        title: "Seguindo!",
        message: `Você está seguindo ${this.usuario.nome}`,
        type: "success",
        icon: "fa fa-user-plus"
      })
    }

    this.setTabCount('followers', this.estatisticas.seguidores)
  } catch (error) {
    console.error(error)
    this.showToast({
      title: "Erro",
      message: error.response?.data?.message || "Não foi possível atualizar o follow",
      type: "error",
      icon: "fa fa-exclamation-circle"
    })
  }
},

 shareProfile() {
  const profileUrl = `${window.location.origin}/perfil/${this.usuario.username || this.usuario.id}`
 
  if (navigator.share) {
    navigator.share({
      title: `Perfil de ${this.usuario.nome}`,
      text: `Confira o perfil musical de ${this.usuario.nome}! 🎵`,
      url: profileUrl
    })
  } else {
    navigator.clipboard.writeText(profileUrl)
    this.showToast({
      title: "Link copiado! 📋",
      message: "O link do perfil foi copiado para a área de transferência",
      type: "success",
      icon: "fa fa-link"
    })
  }
},

    playMusic(musica) {
      this.currentPlayingId = musica.id
     
const playerSong = {
  id: musica.id,
  title: musica.nome,
artist: musica.cantores?.length
  ? musica.cantores
      .filter(c => c && c.nome)
      .map(c => c.nome)
      .join(', ')
  : 'Artista desconhecido',
  cover: musica.cover,
  url: musica.preview || musica.url,
  duration: musica.duration || 30,
  type: 'profile'
}
     
      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: this.musicasFavoritas.map(m => ({
            id: m.id,
        title: m.nome,
artist: m.cantores && m.cantores.length
  ? m.cantores.map(c => c.nome).join(', ')
  : 'Artista desconhecido',
            cover: m.cover,
            url: m.preview || m.url,
            duration: m.duration || 30,
            type: 'profile'
          })),
          index: this.musicasFavoritas.findIndex(m => m.id === musica.id),
          context: 'perfil'
        }
      }))
    },

    shufflePlay() {
      if (this.musicasFavoritas.length === 0) return
     
      const randomIndex = Math.floor(Math.random() * this.musicasFavoritas.length)
      this.playMusic(this.musicasFavoritas[randomIndex])
     
      this.showToast({
        title: "Modo aleatório 🔀",
        message: "Reproduzindo suas músicas curtidas em ordem aleatória",
        type: "success",
        icon: "fa fa-random"
      })
    },

    playAll() {
      if (this.musicasFavoritas.length === 0) return
     
      this.playMusic(this.musicasFavoritas[0])
     
      this.showToast({
        title: "Tocando tudo 🎵",
        message: `Reproduzindo ${this.musicasFavoritas.length} músicas`,
        type: "success",
        icon: "fa fa-play-circle"
      })
    },

   async removerCurtida(musica) {
  try {
    const token = localStorage.getItem("token")

    await fetch(`http://localhost:3002/curtidas/${musica.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // remove da tela
    this.musicasFavoritas = this.musicasFavoritas.filter(
      m => m.id !== musica.id
    )

    this.estatisticas.musicasCurtidas = this.musicasFavoritas.length
    this.tabs[1].count = this.musicasFavoritas.length

    this.showToast({
      title: "Removida dos curtidos 💔",
      message: `"${musica.nome}" foi removida da sua coleção`,
      type: "info",
      icon: "fa fa-heart-broken"
    })

  } catch (error) {
    console.error(error)
  }
},

  async toggleLike(musica) {
  try {
    const token = localStorage.getItem("token")

    const res = await fetch(`http://localhost:3002/curtidas/${musica.id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()

    musica.curtido = data.liked

    if (!data.liked) {
      // 🔥 remove da lista
      this.musicasFavoritas = this.musicasFavoritas.filter(
        m => m.id !== musica.id
      )
    } else {
      // 🔥 adiciona no topo
      this.musicasFavoritas.unshift({
        ...musica,
        curtido: true,
        dataCurtida: new Date()
      })
    }

    this.estatisticas.musicasCurtidas = this.musicasFavoritas.length
    this.tabs[1].count = this.musicasFavoritas.length

  } catch (error) {
    console.error(error)
  }
},

    addToPlaylist(musica) {
      this.musicToAdd = musica
      this.showAddToPlaylistModal = true
    },

    closeAddToPlaylistModal() {
      this.showAddToPlaylistModal = false
      this.musicToAdd = null
      this.selectedPlaylist = null
    },

    addMusicToPlaylist(playlist) {
      this.selectedPlaylist = playlist._id
     
      setTimeout(() => {
        this.showToast({
          title: "Adicionada! ✅",
          message: `"${this.musicToAdd.nome}" foi adicionada à playlist "${playlist.nome}"`,
          type: "success",
          icon: "fa fa-check"
        })
        this.closeAddToPlaylistModal()
      }, 500)
    },

    createAndAdd() {
      this.closeAddToPlaylistModal()
    },

    openPlaylist(playlist) {
      this.$router.push(`/playlist/${playlist._id}`)
    },
     togglePlaylist(id) {
    this.openedPlaylist = this.openedPlaylist === id ? null : id
  },

    togglePlaylistLike(playlist) {
      playlist.curtida = !playlist.curtida
      this.showToast({
        title: playlist.curtida ? "Playlist curtida ❤️" : "Curtida removida",
        message: playlist.curtida
          ? `"${playlist.nome}" adicionada às suas curtidas`
          : `"${playlist.nome}" removida das suas curtidas`,
        type: "success",
        icon: playlist.curtida ? "fa fa-heart" : "fa fa-heart-o"
      })
    },

    showPlaylistOptions(playlist) {
      console.log("Opções da playlist:", playlist)
    },

    showMusicOptions(musica) {
      console.log("Opções da música:", musica)
    },

    showMusicContext(event, musica) {
      // Implementar menu de contexto customizado
      console.log("Context menu for:", musica)
    },

    clearHistory() {
      if (confirm("Tem certeza que deseja limpar todo o histórico de reprodução? Esta ação não pode ser desfeita.")) {
        this.historicoCompleto = []
        this.historicoRecente = []
        localStorage.removeItem('historico')
       
        this.showToast({
          title: "Histórico limpo 🗑️",
          message: "Seu histórico de reprodução foi completamente apagado",
          type: "success",
          icon: "fa fa-trash"
        })
      }
    },

    goToArtist(artista) {
      this.$router.push(`/artista/${artista.id}`)
    },

  goToProfile(user) {
  if (user.tipo === 'cantor') {
    this.$router.push(`/cantor/${user._id}`)
    return
  }

  this.$router.push(`/perfil/${user.username || user.id || user._id}`)
},

 async toggleFollowUser(user) {
  try {
    const token = localStorage.getItem("token")
    const targetId = String(user._id || user.id)
    const tipo = user.tipo || 'usuario'

    if (!token || !targetId) return

    if (tipo === 'usuario' && String(targetId) === String(this.getLoggedUserId())) {
      return
    }

    if (user.isFollowing) {
      await axios.delete(`http://localhost:3002/follows/desseguir`, {
        data: {
          seguindo_id: targetId,
          tipo
        },
        headers: { Authorization: `Bearer ${token}` }
      })

      user.isFollowing = false

      this.seguindoList = this.seguindoList.filter(
        item => !(String(item._id) === targetId && item.tipo === tipo)
      )

      this.showToast({
        title: "Deixou de seguir",
        message: `Você deixou de seguir ${user.nome}`,
        type: "info",
        icon: "fa fa-user-times"
      })
    } else {
      await axios.post(`http://localhost:3002/follows/seguir`, {
        seguindo_id: targetId,
        tipo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      user.isFollowing = true

      const jaExiste = this.seguindoList.some(
        item => String(item._id) === targetId && item.tipo === tipo
      )

      if (!jaExiste) {
        this.seguindoList.unshift({
          _id: targetId,
          nome: user.nome,
          username: user.username || null,
          avatar: user.avatar || null,
          tipo,
          isFollowing: true
        })
      }

      this.showToast({
        title: "Agora seguindo",
        message: `Você está seguindo ${user.nome}`,
        type: "success",
        icon: "fa fa-user-plus"
      })
    }

    this.estatisticas.seguindo = this.seguindoList.length
    this.setTabCount('following', this.seguindoList.length)

    // sincroniza apenas seguidores de usuário
    if (tipo === 'usuario') {
      this.seguidoresList = this.seguidoresList.map(follower => ({
        ...follower,
        isFollowing: String(follower._id) === targetId ? user.isFollowing : follower.isFollowing
      }))
    }

  } catch (error) {
    console.error(error)
    this.showToast({
      title: "Erro",
      message: error.response?.data?.message || "Não foi possível atualizar o follow",
      type: "error",
      icon: "fa fa-exclamation-circle"
    })
  }
},

    toggleSort() {
      this.sortDesc = !this.sortDesc
    },

    toggleGenre(genre) {
      const index = this.selectedGenres.indexOf(genre)
      if (index > -1) {
        this.selectedGenres.splice(index, 1)
      } else {
        this.selectedGenres.push(genre)
      }
    },

    formatDuration(seconds) {
      if (!seconds) return '0:00'
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },

    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
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
     
      let interval = seconds / 31536000
      if (interval > 1) return Math.floor(interval) + ' anos atrás'
     
      interval = seconds / 2592000
      if (interval > 1) return Math.floor(interval) + ' meses atrás'
     
      interval = seconds / 86400
      if (interval > 1) return Math.floor(interval) + ' dias atrás'
     
      interval = seconds / 3600
      if (interval > 1) return Math.floor(interval) + ' horas atrás'
     
      interval = seconds / 60
      if (interval > 1) return Math.floor(interval) + ' minutos atrás'
     
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

    showToast(options) {
     if (this.toastTimeout) {
  clearTimeout(this.toastTimeout)
  this.toastTimeout = null
}
     
      this.toast = {
        show: true,
        title: options.title || "",
        message: options.message || "",
        type: options.type || "success",
        icon: options.icon || "fa fa-check-circle"
      }
     
      this.toastTimeout = setTimeout(() => {
        this.toast.show = false
      }, options.duration || 3000)
    }
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

.perfil {
  margin-left: 260px;
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  color: #f8fafc;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  padding-bottom: 100px;
}
.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.playlist-row {
  background: #181818;
  border-radius: 10px;
  overflow: hidden;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  cursor: pointer;
}

.playlist-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.playlist-thumb {
  width: 45px;
  height: 45px;
  border-radius: 6px;
}

.playlist-musicas {
  padding: 10px 15px;
  background: #121212;
}

.musica-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  cursor: pointer;
}

.musica-item img {
  width: 35px;
  height: 35px;
  border-radius: 4px;
}
/* ===== HEADER DO PERFIL ===== */
.profile-header {
  position: relative;
  margin-bottom: 40px;
}

.cover-image {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.cover-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(15, 23, 42, 0.75) 0%,
    rgba(15, 23, 42, 0.25) 45%,
    rgba(15, 23, 42, 0.05) 100%
  );
  pointer-events: none;
}

.cover-actions {
  position: absolute;
  right: 16px;
  bottom: 96px; /* sobe o botão acima da área sobreposta */
  z-index: 30;
  pointer-events: auto;
}

.btn-cover-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: none;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
    position: relative;
  z-index: 31;
}

.btn-cover-action:hover {
  background: rgba(0, 0, 0, 0.72);
  transform: translateY(-1px);
}

.btn-cover-action.btn-gradient {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border: none;
}

.btn-cover-action.btn-gradient:hover {
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
}

.profile-info-container {
  display: flex;
  align-items: flex-end;
  gap: 32px;
  padding: 0 40px;
  margin-top: -80px;
  position: relative;
  z-index: 10;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
}

.avatar-wrapper.online .avatar {
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4);
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #0f172a;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: all 0.3s;
}

.avatar-status {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  background: #22c55e;
  border: 3px solid #0f172a;
  border-radius: 50%;
}

.btn-edit-avatar {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border: 3px solid #0f172a;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
}

.btn-edit-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5);
}

.user-details {
  flex: 1;
  padding-bottom: 16px;
}

.user-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-pro {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000;
}

.badge-new {
  background: #22c55e;
  color: white;
}

.badge-verified {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-name {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}

.user-handle {
  font-size: 18px;
  color: #64748b;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.user-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #94a3b8;
}

.meta-item i {
  color: #64748b;
}

.user-bio {
  font-size: 16px;
  color: #cbd5e1;
  margin: 0 0 20px 0;
  max-width: 600px;
  line-height: 1.6;
}

.user-bio.empty {
  font-style: italic;
  opacity: 0.6;
  color: #64748b;
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: #f8fafc;
  line-height: 1;
}

.stat-value.highlight {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}
.btn-cover-action {
  padding: 10px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.profile-actions {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
}

.btn-primary {
  padding: 12px 28px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
}

.btn-secondary {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-follow {
  padding: 12px 28px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
}

.btn-follow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
}

.btn-follow.following {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

/* Menu de Contexto */
.context-menu {
  position: absolute;
  top: 420px;
  right: 40px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 8px;
  min-width: 220px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #cbd5e1;
  transition: all 0.2s;
}

.context-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.context-item.danger {
  color: #ef4444;
}

.context-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.context-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 8px 0;
}

/* ===== TABS ===== */
.tabs-nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  transition: all 0.3s;
  position: relative;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: #f8fafc;
}

.tab-btn.active {
  color: #ec4899;
  border-bottom-color: #ec4899;
}

.tab-badge {
  background: rgba(236, 72, 153, 0.2);
  color: #ec4899;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.tabs-actions {
  display: flex;
  gap: 8px;
}

.btn-filter, .btn-sort {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.btn-filter:hover, .btn-sort:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Filtros */
.filters-panel {
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.filter-chip.active {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border-color: transparent;
  color: white;
}

/* ===== CONTEÚDO ===== */
.profile-content {
  padding: 0 40px;
}

.tab-content {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.content-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
}

.content-section.full-width {
  grid-column: 1 / -1;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f8fafc;
}

.section-header h3 i {
  color: #ec4899;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-shuffle, .btn-play-all {
  padding: 10px 20px;
  border-radius: 20px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-shuffle {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

.btn-shuffle:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-play-all {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.3);
}

.btn-play-all:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
}

.btn-shuffle:disabled, .btn-play-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-view-all {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.btn-view-all:hover {
  color: #ec4899;
}

/* Highlight Card */
.highlight-card {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15));
  border: 1px solid rgba(236, 72, 153, 0.2);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 8px;
}

.highlight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #ec4899;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.highlight-content {
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  padding: 12px;
  border-radius: 16px;
  transition: all 0.3s;
}

.highlight-content:hover {
  background: rgba(255, 255, 255, 0.05);
}

.highlight-content img {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
}

.highlight-info {
  flex: 1;
}

.highlight-info h4 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #f8fafc;
}

.highlight-info p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 8px 0;
}

.highlight-plays {
  font-size: 13px;
  color: #ec4899;
  font-weight: 600;
}

.btn-play-highlight {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
}

.btn-play-highlight:hover {
  transform: scale(1.1);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: #64748b;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon i {
  font-size: 32px;
  color: #475569;
}

.empty-icon.large {
  width: 120px;
  height: 120px;
}

.empty-icon.large i {
  font-size: 48px;
}

.empty-state h4 {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
}

.btn-explore, .btn-create {
  padding: 12px 24px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-explore:hover, .btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
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
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.mini-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mini-rank {
  width: 32px;
  text-align: center;
}

.mini-rank i {
  font-size: 16px;
}

.mini-rank i.rank-1 { color: #fbbf24; }
.mini-rank i.rank-2 { color: #94a3b8; }
.mini-rank i.rank-3 { color: #b45309; }

.mini-number {
  width: 32px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.mini-item img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.mini-info {
  flex: 1;
  min-width: 0;
}

.mini-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-info p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.btn-like-mini {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-like-mini:hover, .btn-like-mini.active {
  color: #ec4899;
}

.btn-play-mini {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.mini-item:hover .btn-play-mini {
  opacity: 1;
}

.btn-play-mini:hover {
  background: #ec4899;
  transform: scale(1.1);
}

/* Playlists Grid */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.playlist-card {
  cursor: pointer;
  transition: all 0.3s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
}

.playlist-cover img {
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
  transition: all 0.3s;
}

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.btn-play-playlist {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: all 0.3s;
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
}

.playlist-card:hover .btn-play-playlist {
  transform: scale(1);
}

.playlist-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  backdrop-filter: blur(10px);
}

.playlist-info-card h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #f8fafc;
}

.playlist-info-card p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* Artistas */
.artists-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.artist-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 100px;
}

.artist-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-4px);
}

.artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.artist-name {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
  text-align: center;
}

.artist-plays {
  font-size: 12px;
  color: #64748b;
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
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s;
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
  flex-shrink: 0;
}

.activity-icon.like { background: rgba(236, 72, 153, 0.2); color: #ec4899; }
.activity-icon.playlist { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.activity-icon.follow { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.activity-icon.share { background: rgba(168, 85, 247, 0.2); color: #a855f7; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #cbd5e1;
  margin: 0 0 4px 0;
  line-height: 1.5;
}

.activity-text strong {
  color: #f8fafc;
}

.activity-time {
  font-size: 12px;
  color: #64748b;
}

.activity-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

/* Lista Detalhada de Músicas */
.music-list-detailed {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;
}

.col-number { width: 40px; text-align: center; }
.col-title { flex: 2; }
.col-album { flex: 1; }
.col-date { width: 120px; }
.col-duration { width: 60px; text-align: right; }
.col-actions { width: 120px; }

.music-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.music-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.music-row.playing {
  background: rgba(236, 72, 153, 0.1);
}

.row-number {
  width: 40px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.playing-icon {
  color: #ec4899;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.music-row img {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.row-info {
  flex: 2;
  min-width: 0;
}

.row-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-info h4.playing {
  color: #ec4899;
}

.row-info p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.row-album {
  flex: 1;
  font-size: 13px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-date {
  width: 120px;
  font-size: 13px;
  color: #64748b;
}

.row-duration {
  width: 60px;
  text-align: right;
  font-size: 13px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.row-actions {
  width: 120px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.row-actions button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.row-actions button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.row-actions .btn-like.active {
  color: #ec4899;
}

.row-actions .btn-add:hover {
  color: #22c55e;
}

/* Playlists Full Grid */
.playlists-full-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.create-playlist-card {
  aspect-ratio: 16/10;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  padding: 24px;
}

.create-playlist-card:hover {
  border-color: #ec4899;
  background: rgba(236, 72, 153, 0.05);
}

.create-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ec4899;
  transition: all 0.3s;
}

.create-playlist-card:hover .create-icon {
  background: rgba(236, 72, 153, 0.2);
  transform: scale(1.1);
}

.create-playlist-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.create-playlist-card p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.playlist-card-large {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.playlist-card-large:hover {
  transform: translateY(-4px);
  border-color: rgba(236, 72, 153, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.playlist-cover-large {
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
}

.playlist-cover-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-cover-large .playlist-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.playlist-card-large:hover .playlist-overlay {
  opacity: 1;
}

.btn-play-playlist-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.8);
  transition: all 0.3s;
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.4);
}

.playlist-card-large:hover .btn-play-playlist-large {
  transform: scale(1);
}

.playlist-privacy-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(10px);
}

.playlist-privacy-badge.pública {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.playlist-privacy-badge.privada {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.playlist-info-large {
  padding: 20px;
  flex: 1;
}

.playlist-info-large h4 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #f8fafc;
}

.playlist-info-large p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.playlist-meta-large {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.playlist-meta-large span {
  font-size: 13px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.playlist-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  font-size: 11px;
  color: #94a3b8;
}

.playlist-actions {
  display: flex;
  gap: 8px;
  padding: 0 20px 20px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-icon.active {
  color: #ec4899;
}

/* Histórico Timeline */
.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.history-date-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.date-label {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  text-transform: capitalize;
}

.date-count {
  font-size: 13px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 12px;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item-detailed {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item-detailed:hover {
  background: rgba(255, 255, 255, 0.05);
}

.history-item-detailed img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.history-item-info {
  flex: 1;
}

.history-item-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #f8fafc;
}

.history-item-info p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.history-time {
  font-size: 13px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

/* Users Grid (Seguidores) */
.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.user-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.user-card:hover {
  transform: translateY(-4px);
  border-color: rgba(236, 72, 153, 0.3);
}

.user-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 3px solid rgba(255, 255, 255, 0.1);
}

.user-card h4 {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 4px 0;
}

.user-card p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
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
  transition: all 0.3s;
}

.btn-follow-small.following {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #94a3b8;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-content.modal-large {
  max-width: 700px;
}

.modal-content.modal-danger {
  max-width: 480px;
  border-color: rgba(239, 68, 68, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header.danger {
  flex-direction: column;
  text-align: center;
  gap: 16px;
  border-bottom-color: rgba(239, 68, 68, 0.2);
}

.danger-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #ef4444;
}

.header-info h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-info p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #f8fafc;
}

.modal-body {
  padding: 24px;
}

/* Profile Preview no Modal */
.profile-preview {
  position: relative;
  margin-bottom: 24px;
}

.preview-cover {
  height: 150px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.preview-cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s;
}

.preview-cover:hover .preview-cover-overlay {
  opacity: 1;
}

.btn-change-cover {
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

.preview-avatar-wrapper {
  position: relative;
  margin-top: -50px;
  margin-left: 24px;
  width: 100px;
  height: 100px;
}

.preview-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #1e293b;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.btn-change-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid #1e293b;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-group label .required {
  color: #ef4444;
}

.form-group input,
.form-group textarea {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ec4899;
  background: rgba(255, 255, 255, 0.08);
}

.form-group input.error,
.form-group textarea.error {
  border-color: #ef4444;
}

.input-prefix {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.input-prefix .prefix {
  padding: 12px 16px;
  color: #64748b;
  font-weight: 600;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.input-prefix input {
  flex: 1;
  border: none;
  border-radius: 0;
  background: transparent;
}

.error-message {
  font-size: 12px;
  color: #ef4444;
}

.hint {
  font-size: 12px;
  color: #64748b;
}

.availability {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.availability.success { color: #22c55e; }
.availability.error { color: #ef4444; }
.availability.loading { color: #64748b; }

.char-count {
  font-size: 12px;
  color: #64748b;
  text-align: right;
}

/* Genre Selector */
.genre-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-chip {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.genre-chip:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.genre-chip.active {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border-color: transparent;
  color: white;
}

/* Preferences */
.preferences-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.preferences-section h4 {
  font-size: 16px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preference-title {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.preference-desc {
  font-size: 13px;
  color: #64748b;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  transition: all 0.3s;
}

.toggle-slider:before {
  content: "";
  position: absolute;
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* Warning Box */
.warning-box {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.warning-box p {
  margin: 0 0 12px 0;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.6;
}

.warning-box ul {
  margin: 0;
  padding-left: 20px;
  color: #94a3b8;
  font-size: 14px;
}

.warning-box li {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-box li i {
  color: #ef4444;
}

.confirm-section {
  margin-bottom: 20px;
}

.confirm-section p {
  font-size: 14px;
  color: #cbd5e1;
  margin: 0 0 12px 0;
}

.confirm-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #f8fafc;
  font-size: 14px;
}

.confirm-input.error {
  border-color: #ef4444;
}

.password-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
}

.password-input {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.password-input input {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 14px;
}

.password-input button {
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-footer.danger {
  justify-content: space-between;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel {
  padding: 12px 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.btn-danger {
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-large {
  padding: 14px 32px;
  font-size: 15px;
}

/* Playlist Selector */
.playlist-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.playlist-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.playlist-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.playlist-option.selected {
  background: rgba(236, 72, 153, 0.1);
}

.playlist-option img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
}

.playlist-option-info {
  flex: 1;
}

.playlist-option-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 4px 0;
}

.playlist-option-info p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.playlist-option i.fa-check {
  color: #ec4899;
  font-size: 18px;
}

.playlist-option.create-new {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  justify-content: center;
}

.create-icon-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ec4899;
}

/* ===== TOAST ===== */
.toast-notification {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #1e1e2e;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 99999;
  min-width: 320px;
  max-width: 480px;
  backdrop-filter: blur(20px);
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
  gap: 14px;
  flex: 1;
}

.toast-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.toast-notification.success .toast-icon {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.toast-notification.error .toast-icon {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.toast-notification.info .toast-icon {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.toast-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toast-title {
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
}

.toast-message {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
}

.toast-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

/* Animações */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}

.toast-enter-active {
  animation: toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  animation: toastSlideOut 0.3s ease forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.95);
  }
}

/* ===== RESPONSIVO ===== */
@media (max-width: 1024px) {
  .perfil {
    margin-left: 0;
  }
 
  .content-grid {
    grid-template-columns: 1fr;
  }
 
  .playlists-full-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .profile-info-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -90px;
    padding: 0 20px;
  }
 
  .avatar-wrapper {
    width: 140px;
    height: 140px;
  }
 
  .user-name {
    font-size: 32px;
  }
 
  .user-stats {
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
  }
 
  .profile-actions {
    width: 100%;
    justify-content: center;
  }
 
  .tabs-nav-container {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
 
  .tabs-nav {
    padding: 0 20px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
 
  .tab-btn {
    padding: 12px 16px;
    white-space: nowrap;
  }
 
  .tabs-actions {
    padding: 0 20px;
    justify-content: flex-end;
  }
 
  .profile-content {
    padding: 0 20px;
  }
 
  .cover-image {
    height: 200px;
  }
 
  .context-menu {
    right: 20px;
    top: 380px;
  }
 
  .form-grid {
    grid-template-columns: 1fr;
  }
 
  .modal-footer {
    flex-direction: column;
  }
 
  .footer-actions {
    width: 100%;
    justify-content: space-between;
  }
 
  .row-album,
  .row-date {
    display: none;
  }
 
  .toast-notification {
    left: 16px;
    right: 16px;
    transform: none;
    min-width: auto;
  }
}
</style>