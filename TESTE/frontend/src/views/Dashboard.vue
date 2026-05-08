<template>
  <div class="dashboard">
    <div class="dashboard-content">

      <!-- WELCOME SECTION -->
      <section class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            <span class="greeting">{{ greeting }}</span>
            <span class="user-highlight">{{ currentUser.firstName }}</span>
            <span class="wave-emoji">👋</span>
          </h1>
          <p class="welcome-subtitle">{{ welcomeMessage }}</p>

          <!-- Quick Stats -->
          <div class="quick-stats">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fa fa-clock-o"></i>
              </div>
              <div class="stat-data">
                <span class="stat-value">{{ userStats.hoursListened }}h</span>
                <span class="stat-label">Ouvidas este mês</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fa fa-heart"></i>
              </div>
              <div class="stat-data">
                <span class="stat-value">{{ userStats.likedSongs }}</span>
                <span class="stat-label">Músicas curtidas</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fa fa-list"></i>
              </div>
              <div class="stat-data">
                <span class="stat-value">{{ userStats.playlists }}</span>
                <span class="stat-label">Playlists criadas</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fa fa-fire"></i>
              </div>
              <div class="stat-data">
                <span class="stat-value">{{ userStats.streak }} dias</span>
                <span class="stat-label">Sequência</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- HERO: CONTINUE LISTENING (SINCRONIZADO COM PLAYER) -->
      <div v-if="continueListening.length > 0" class="hero-banner continue-listening" :style="heroGradient">
        <div class="hero-ambient"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <i class="fa fa-play-circle"></i>
            {{ isPlaying ? 'Tocando Agora' : 'Continue Ouvindo' }}
            <span class="badge-live" v-if="isPlaying">
              <span class="live-dot"></span> LIVE
            </span>
          </div>
         
          <!-- Título dinâmico: mostra currentTrack do player se existir -->
          <h1 class="hero-title">{{ currentTrack?.title || continueListening[0].title }}</h1>
          <p class="hero-artist">{{ currentTrack?.artist || continueListening[0].artist }}</p>
         
          <p class="hero-description" v-if="!isPlaying && continueListening[0].progress < 95">
            De onde você parou
            <span class="highlight">{{ Math.round(continueListening[0].progress || 0) }}% completo</span>
          </p>
          <p class="hero-description" v-else-if="isPlaying">
            <span class="highlight">▶ Reproduzindo agora</span>
          </p>

          <!-- Progress Bar sincronizada com o player -->
          <div class="hero-progress" v-if="continueListening[0]">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: (isPlaying ? progressPercent : (continueListening[0].progress || 0)) + '%' }"
              ></div>
            </div>
            <div class="progress-time">
              <span>{{ formatTime(isPlaying ? currentTime : continueListening[0].currentTime) }}</span>
              <span>{{ formatTime(isPlaying ? duration : continueListening[0].duration) }}</span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn-primary btn-glow" @click="playContinueListening(0)">
              <i class="fa" :class="isPlaying ? 'fa-pause' : 'fa-play'"></i>
              {{ isPlaying ? 'Pausar' : (continueListening[0].progress > 0 ? 'Continuar' : 'Tocar') }}
            </button>
            <button class="btn-secondary" @click="playNextInQueue">
              <i class="fa fa-step-forward"></i> Próxima
            </button>
            <button
              class="btn-secondary btn-icon"
              @click="toggleLike"
              :class="{ 'active': isLiked }"
            >
              <i class="fa" :class="isLiked ? 'fa-heart' : 'fa-heart-o'"></i>
            </button>
          </div>
        </div>

        <div class="hero-image">
          <div class="vinyl-container" :class="{ 'playing': isPlaying }">
            <div class="vinyl-record">
              <div class="vinyl-grooves"></div>
              <div class="vinyl-label">
                <img
                  v-if="(currentTrack?.cover || continueListening[0]?.cover)"
                  :src="currentTrack?.cover || continueListening[0].cover"
                  @error="handleImageError"
                  alt="Album Cover"
                />
                <i v-else class="fa fa-music"></i>
              </div>
            </div>
            <div class="vinyl-reflection"></div>
          </div>
          <div class="floating-notes" v-if="isPlaying">
            <i class="fa fa-music note-1"></i>
            <i class="fa fa-music note-2"></i>
            <i class="fa fa-music note-3"></i>
          </div>
        </div>
      </div>

      <!-- SEÇÃO: MÚSICAS CURTIDAS -->
      <section class="section curtidas-section" v-if="musicas.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-heart section-icon liked"></i>
              Músicas Curtidas
            </h2>
            <span class="section-subtitle">{{ musicas.length }} {{ musicas.length === 1 ? 'música' : 'músicas' }} que você ama</span>
          </div>
          <div class="header-actions-group">
            <button class="btn-play-all" @click="playAllCurtidas">
              <i class="fa fa-play"></i> Tocar todas
            </button>
            <button class="see-all" @click="goToCurtidas">
              Ver tudo <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div class="curtidas-list">
          <div
            v-for="(musica, index) in musicas.slice(0, showAllCurtidas ? musicas.length : 5)"
            :key="`${musica.source}-${musica.id}`"
            class="curtida-item"
            @dblclick="playCurtida(index)"
            :class="{ 'active': isCurrentTrack(musica) && isPlaying }"
          >
            <div class="curtida-number">{{ index + 1 }}</div>

            <div class="curtida-cover-wrapper">
              <img :src="musica.cover || '/default-cover.png'" :alt="musica.title" @error="handleImageError" />
              <div class="curtida-play-overlay">
                <i class="fa" :class="isCurrentTrack(musica) && isPlaying ? 'fa-pause' : 'fa-play'"></i>
              </div>
              <div class="equalizer-mini" v-if="isCurrentTrack(musica) && isPlaying">
                <span v-for="n in 4" :key="n"></span>
              </div>
            </div>

            <div class="curtida-info">
              <h3 class="curtida-title">{{ musica.title }}</h3>
              <p class="curtida-artist">
                <span class="source-badge" :class="musica.source">
                  <i :class="getSourceIcon(musica.source)"></i>
                </span>
                {{ musica.artist }}
                <span v-if="musica.album" class="album-dot">•</span>
                <span v-if="musica.album" class="album-name">{{ musica.album }}</span>
              </p>
            </div>

            <div class="curtida-duration" v-if="musica.duration">
              {{ formatTime(musica.duration) }}
            </div>

            <div class="curtida-actions">
              <button
                class="btn-like active"
                @click.stop="removerCurtida(musica, index)"
                title="Remover dos curtidos"
              >
                <i class="fa fa-heart"></i>
              </button>

              <div class="dropdown-container" ref="dropdownContainers">
                <button class="btn-more" @click.stop="toggleMenu(index, $event)" :class="{ active: activeMenuIndex === index }">
                  <i class="fa fa-ellipsis-v"></i>
                </button>

                <transition name="menu-pop">
                  <div
                    v-if="activeMenuIndex === index"
                    class="modern-dropdown"
                    ref="dropdownMenus"
                  >
                    <div class="dropdown-options">
                      <button class="dropdown-option" @click="adicionarAPlaylist(musica)">
                        <div class="option-icon playlist-icon">
                          <i class="fa fa-plus-square-o"></i>
                        </div>
                        <div class="option-content">
                          <span class="option-label">Adicionar à playlist</span>
                          <span class="option-hint">Escolha uma playlist existente</span>
                        </div>
                        <i class="fa fa-chevron-right option-arrow"></i>
                      </button>

                      <button class="dropdown-option" @click="favoritarMusica(musica)">
                        <div class="option-icon favorite-icon">
                          <i class="fa fa-star-o"></i>
                        </div>
                        <div class="option-content">
                          <span class="option-label">Favoritar</span>
                          <span class="option-hint">Adicionar aos favoritos especiais</span>
                        </div>
                        <i class="fa fa-chevron-right option-arrow"></i>
                      </button>
                    </div>

                    <div class="dropdown-footer">
                      <button class="dropdown-close" @click="closeMenu">
                        <i class="fa fa-times"></i> Fechar
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>

        <button
          v-if="musicas.length > 5"
          class="btn-show-more"
          @click="showAllCurtidas = !showAllCurtidas"
        >
          {{ showAllCurtidas ? 'Ver menos' : 'Ver mais' }}
          <i class="fa" :class="showAllCurtidas ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>
      </section>

      <!-- SEÇÃO: Feito para Você -->
      <section class="section" v-if="madeForYou.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-magic section-icon personal"></i>
              Feito para Você
            </h2>
     <span class="section-subtitle">Baseado nas suas escolhas de gêneros, artistas e vibes</span>
          </div>
          <button class="see-all" @click="showAllPersonal">
            Ver tudo <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row" :class="{ 'expanded': showAllPersonalContent }">
          <div
            v-for="(mix, index) in madeForYou.slice(0, showAllPersonalContent ? 10 : 5)"
            :key="'mix-'+mix.id"
            class="music-card mix-card"
            @click="playMix(mix)"
            :class="{ 'active': isCurrentMix(mix) }"
          >
            <div class="card-image">
              <img :src="mix.cover" @error="handleImageError" alt="Mix Cover" />
              <div class="play-button-overlay">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="mix-gradient-overlay" :style="{ background: mix.gradient }"></div>
              <div class="mix-info-badge">
                <i class="fa fa-magic"></i> {{ mix.tracks }} músicas
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ mix.title }}</h3>
              <p class="card-artist">{{ mix.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Tocadas Recentemente (SINCRONIZADO COM PLAYER) -->
      <section class="section" v-if="recentlyPlayed.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-history section-icon"></i>
              Tocadas Recentemente
            </h2>
            <span class="section-count">{{ recentlyPlayed.length }} músicas</span>
          </div>
          <button class="see-all" @click="showAllRecent">
              {{ showAllRecentTracks ? 'Ver menos' : 'Ver tudo' }}
              <i class="fa" :class="showAllRecentTracks ? 'fa-chevron-up' : 'fa-chevron-right'"></i>
            </button>
        </div>
        <div class="cards-row" :class="{ 'expanded': showAllRecentTracks }">
          <div
            v-for="(track, index) in recentlyPlayed.slice(0, showAllRecentTracks ? 12 : 6)"
            :key="'recent-'+track.id+'-'+track.playedAt"
            class="music-card"
            @click="playTrack(track, 'recent', index)"
            :class="{ 'active': isCurrentTrack(track), 'playing': isCurrentTrack(track) && isPlaying }"
          >
            <div class="card-image">
              <img :src="track.cover" @error="handleImageError" alt="Cover" />
              <div class="play-button-overlay">
                <i class="fa" :class="isCurrentTrack(track) && isPlaying ? 'fa-pause-circle' : 'fa-play-circle'"></i>
              </div>
              <div class="equalizer" v-if="isCurrentTrack(track) && isPlaying">
                <span v-for="n in 4" :key="n"></span>
              </div>
              <!-- Mostra "Agora" se for a atual, senão mostra tempo relativo -->
              <div class="time-badge" :class="{ 'now-playing': isCurrentTrack(track) && isPlaying }">
                {{ isCurrentTrack(track) && isPlaying ? '▶ AGORA' : formatTimeAgo(track.playedAt) }}
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-artist">{{ track.artist }}</p>
            </div>
            <button class="card-more" @click.stop="showTrackOptions(track)">
              <i class="fa fa-ellipsis-h"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Suas Playlists -->
      <section class="section" v-if="userPlaylists.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-folder-open section-icon playlist"></i>
              Suas Playlists
            </h2>
            <span class="section-subtitle">{{ userPlaylists.length }} criadas por você</span>
          </div>
          <div class="header-actions-group">
            <button class="see-all" @click="goToPlaylist">
              Ver todos <i class="fa fa-chevron-right"></i>
            </button>
          </div>
        </div>
        <div class="cards-row">
          <div
            v-for="(playlist, index) in userPlaylists.slice(0, 5)"
            :key="'user-playlist-'+playlist.id"
            class="music-card playlist-card user-playlist"
            @click="openPlaylist(playlist)"
            :class="{ 'active': isCurrentPlaylist(playlist) }"
          >
            <div class="card-image">
              <img :src="playlist.cover || defaultPlaylistCover" @error="handleImageError" alt="Playlist" />
              <div class="play-button-overlay">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="playlist-type-badge" v-if="playlist.isPublic">
                <i class="fa fa-globe"></i> Pública
              </div>
              <div class="playlist-type-badge private" v-else>
                <i class="fa fa-lock"></i> Privada
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ playlist.title }}</h3>
              <p class="card-artist">Por {{ currentUser.name }} • {{ playlist.songs?.length || 0 }} músicas</p>
            </div>
          </div>

          <div class="music-card create-card" @click="createPlaylist">
            <div class="create-content">
              <div class="create-icon">
                <i class="fa fa-plus"></i>
              </div>
              <h3 class="create-title">Criar Playlist</h3>
              <p class="create-subtitle">Adicione suas músicas favoritas</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ESTADO VAZIO: Sem Playlists -->
      <section class="section" v-else-if="!loadingPlaylists">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-folder-open section-icon playlist"></i>
              Suas Playlists
            </h2>
            <span class="section-subtitle">0 criadas por você</span>
          </div>
          <button class="btn-create" @click="createPlaylist">
            <i class="fa fa-plus"></i> Criar Nova
          </button>
        </div>
        <div class="empty-playlists">
          <div class="empty-illustration">
            <i class="fa fa-music"></i>
            <div class="sound-waves">
              <span></span><span></span><span></span>
            </div>
          </div>
          <h3>Você ainda não tem playlists</h3>
          <p>Crie sua primeira playlist e organize suas músicas favoritas</p>
          <button class="btn-primary" @click="createPlaylist">
            <i class="fa fa-plus"></i> Criar Playlist
          </button>
        </div>
      </section>

      <!-- SEÇÃO: Top 10 Brasil -->
      <section class="section" v-if="chartTracks.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-fire section-icon hot"></i>
              Top 10 Brasil
            </h2>
            <span class="section-subtitle">Mais tocados do momento</span>
          </div>
          <button class="see-all" @click="loadMoreTracks">
            {{ loadingMoreTracks ? 'Carregando...' : 'Ver mais' }}
            <i class="fa" :class="loadingMoreTracks ? 'fa-spinner fa-spin' : 'fa-chevron-right'"></i>
          </button>
        </div>
        <div class="cards-row">
          <div
            v-for="(track, index) in chartTracks.slice(0, 5)"
            :key="'chart-'+track.id"
            class="music-card"
            @click="playTrack(track, 'chart', index)"
            :class="{ 'active': isCurrentTrack(track), 'playing': isCurrentTrack(track) && isPlaying }"
          >
            <div class="card-image">
              <img :src="track.album?.cover_medium || track.cover" @error="handleImageError" alt="Cover" />
              <div class="rank-badge" :class="{ 'top3': index < 3 }">{{ index + 1 }}</div>
              <div class="play-button-overlay">
                <i class="fa" :class="isCurrentTrack(track) && isPlaying ? 'fa-pause-circle' : 'fa-play-circle'"></i>
              </div>
              <div class="equalizer" v-if="isCurrentTrack(track) && isPlaying">
                <span v-for="n in 4" :key="n"></span>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-artist">{{ track.artist?.name || track.artist }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Recomendado para Você -->
      <section class="section" v-if="recommendedTracks.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-lightbulb-o section-icon rec"></i>
              Recomendado para Você
            </h2>
            <span class="section-subtitle">Baseado nos seus artistas favoritos</span>
          </div>
          <button class="see-all" @click="refreshRecommendations">
            <i class="fa fa-refresh"></i> Atualizar
          </button>
        </div>
        <div class="cards-row">
          <div
            v-for="(track, index) in recommendedTracks.slice(0, 5)"
            :key="'rec-'+track.id"
            class="music-card"
            @click="playTrack(track, 'recommended', index)"
            :class="{ 'active': isCurrentTrack(track), 'playing': isCurrentTrack(track) && isPlaying }"
          >
            <div class="card-image">
              <img :src="track.album?.cover_medium || track.cover" @error="handleImageError" alt="Cover" />
              <div class="play-button-overlay">
                <i class="fa" :class="isCurrentTrack(track) && isPlaying ? 'fa-pause-circle' : 'fa-play-circle'"></i>
              </div>
              <div class="equalizer" v-if="isCurrentTrack(track) && isPlaying">
                <span v-for="n in 4" :key="n"></span>
              </div>
              <div class="match-badge">
                <i class="fa fa-thumbs-up"></i> {{ track.match }}% match
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-artist">{{ track.artist?.name || track.artist }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Artistas que Você Segue -->
      <section class="section" v-if="followedArtists.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-users section-icon artist"></i>
              Artistas que Você Segue
            </h2>
            <span class="section-subtitle">{{ followedArtists.length }} artistas</span>
          </div>
          <button class="see-all" @click="goToArtists">
            Ver todos <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row artists-row">
          <div
            v-for="(artist, index) in followedArtists.slice(0, 5)"
            :key="'followed-'+artist.id"
            class="music-card artist-card"
            @click="playArtistTopTrack(artist)"
            :class="{ 'active': currentArtist?.id === artist.id }"
          >
            <div class="card-image artist-image">
              <img :src="artist.picture_medium" @error="handleImageError" alt="Artist" />
              <div class="play-button-overlay artist-play">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="new-release-badge" v-if="artist.hasNewRelease">
                <i class="fa fa-star"></i> Novo
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ artist.name }}</h3>
              <p class="card-artist">Artista</p>
            </div>
            <button
              class="follow-btn"
              :class="{ 'following': artist.isFollowing }"
              @click.stop="toggleFollow(artist)"
            >
              <i class="fa" :class="artist.isFollowing ? 'fa-check' : 'fa-plus'"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Gêneros Populares -->
      <section class="section" v-if="genres.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-guitar section-icon genre"></i>
              Gêneros Populares
            </h2>
            <span class="section-subtitle">Explore por estilo musical</span>
          </div>
        </div>
        <div class="categories-grid">
          <div
            v-for="(genre, index) in genres.slice(0, 8)"
            :key="'genre-'+genre.id"
            class="category-tile"
            @click="navigateToGenre(genre)"
            :style="{ background: genreGradients[index % genreGradients.length] }"
          >
            <div class="category-content">
              <h3>{{ genre.name }}</h3>
              <span class="category-explore">
                Explorar <i class="fa fa-arrow-right"></i>
              </span>
            </div>
            <img
              v-if="genre.picture_medium"
              :src="genre.picture_medium"
              class="genre-image"
              @error="handleImageError"
              alt="Genre"
            />
            <i v-else class="fa fa-music genre-icon"></i>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: Lançamentos Recentes -->
      <section class="section" v-if="newReleases.length > 0">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">
              <i class="fa fa-bullhorn section-icon new"></i>
              Lançamentos
            </h2>
            <span class="section-subtitle">Novidades da semana</span>
          </div>
          <button class="see-all" @click="loadMoreReleases">
            Ver mais <i class="fa fa-chevron-right"></i>
          </button>
        </div>
        <div class="cards-row">
          <div
            v-for="(album, index) in newReleases.slice(0, 5)"
            :key="'release-'+album.id"
            class="music-card album-card"
            @click="playAlbumTracks(album)"
            :class="{ 'active': isCurrentAlbum(album) }"
          >
            <div class="card-image">
              <img :src="album.cover_medium" @error="handleImageError" alt="Album Cover" />
              <div class="play-button-overlay">
                <i class="fa fa-play-circle"></i>
              </div>
              <div class="new-badge"><i class="fa fa-star"></i> NEW</div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ album.title }}</h3>
              <p class="card-artist">{{ album.artist?.name }}</p>
              <p class="card-date"><i class="fa fa-calendar"></i> {{ formatDate(album.release_date) }}</p>
            </div>
          </div>
        </div>
      </section>



      <!-- TOAST NOTIFICATION -->
      <transition name="toast">
        <div v-if="toast.visible" class="toast-notification" :class="toast.type">
          <div class="toast-icon-wrapper">
            <i :class="toast.icon"></i>
          </div>
          <div class="toast-content">
            <span class="toast-title">{{ toast.title }}</span>
            <span class="toast-message">{{ toast.message }}</span>
          </div>
          <button class="toast-close" @click="hideToast">
            <i class="fa fa-times"></i>
          </button>
          <div class="toast-progress" :style="{ width: toast.progress + '%' }"></div>
        </div>
      </transition>

      <!-- MODAL PLAYLIST -->
      <transition name="fade">
        <div v-if="showPlaylistModal" class="modal-overlay" @click.self="showPlaylistModal = false">
          <div class="modal">
            <div class="modal-header">
              <h3>Adicionar à playlist</h3>
              <button @click="showPlaylistModal = false">
                <i class="fa fa-times"></i>
              </button>
            </div>

            <div class="modal-body">
              <div v-if="playlists.length === 0" class="empty-playlists-modal">
                <p>Você não tem playlists ainda</p>
              </div>

              <div v-else class="playlist-list">
                <div
                  v-for="playlist in playlists"
                  :key="playlist._id"
                  class="playlist-item"
                >
                  <div>
                    <strong>{{ playlist.nome }}</strong>
                    <p>{{ playlist.musicas?.length || 0 }} músicas</p>
                  </div>

                  <button
                    class="btn-add"
                    @click="adicionarNaPlaylist(playlist._id)"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </div>
</template>
<script>
export default {
  name: "Dashboard",

  data() {
    return {
      // API Configuration
     DEEZER_API: 'https://api.deezer.com',
      API_BASE_URL: 'http://localhost:3002',

      // User State
      currentUser: {
        id: 1,
        name: "João Silva",
        firstName: "João",
        email: "joao@email.com",
        avatar: "https://i.pravatar.cc/150?img=11",
        plan: "Premium",
        memberSince: "2023-01-15"
      },

      // User Stats
      userStats: {
        hoursListened: 127,
        likedSongs: 0,
        playlists: 0,
        streak: 15
      },

      // UI State
      greeting: "Bom dia",
      welcomeMessage: "Pronto para descobrir novas músicas hoje?",

      // ═══════════════════════════════════════════════════════
      // PLAYER SYNC STATE (NOVO - Sincronizado com MusicPlayer)
      // ═══════════════════════════════════════════════════════
      isPlaying: false,
      isLiked: false,
      currentTrack: null,        // Track atual do player (sincronizado)
      currentTime: 0,          // Tempo atual do player
      duration: 0,             // Duração total do player
      progressPercent: 0,      // Porcentagem de progresso do player
      playerContext: null,       // Contexto da música (recent, chart, curtidas, etc)

      // Legacy Player State (mantido para compatibilidade)
      currentPlaylist: null,
      currentAlbum: null,
      currentArtist: null,
      loading: false,
      loadingPlaylists: false,
      loadingMoreTracks: false,
      showAllRecentTracks: false,
      showAllPersonalContent: false,
      showAllCurtidas: false,

      // API Data
      chartTracks: [],
      popularArtists: [],
      newReleases: [],
      genres: [],
      recommendedTracks: [],
      followedArtists: [],

      // Personalized Data (SINCRONIZADAS COM PLAYER)
      continueListening: [],   // [0] = música atual do player com progresso real
      madeForYou: [],
      recentlyPlayed: [],      // Histórico real de músicas escutadas

      // Playlists reais do usuário
      userPlaylists: [],
      defaultPlaylistCover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE4MTgxOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiMxZGI5NTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJoTwvdGV4dD48L3N2Zz4=',

      // Hero Section
      heroGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",

      // Toast
      toast: {
        visible: false,
        title: '',
        message: '',
        type: 'success',
        icon: 'fa fa-check-circle',
        progress: 100,
        timer: null
      },

      // Curtidas (integrado do Curtidas.vue)
      musicas: [],
      isLoading: false,
      ultimaMusicaRemovida: null,
      ultimoIndiceRemovido: null,
      activeMenuIndex: null,
      showPlaylistModal: false,
      playlists: [],
      musicaSelecionada: null,
      usuarioId: null,

      // Gradients
      genreGradients: [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
        "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
      ],

      // Controle de histórico
      _lastAddedToRecent: null,  // Evita duplicatas rápidas
      _minListenTime: 10000      // Mínimo 10s para contar como "ouvida"
    }
  },

mounted() {
  this.checkAuth()
  this.loadUserFromStorage()
  this.updateGreeting()
  this.loadAllData()

  window.addEventListener('player-state-changed', this.handlePlayerStateChange)
  window.addEventListener('player-track-ended', this.handlePlayerTrackEnded)
  window.addEventListener('play-song', this.handlePlaySongFromDashboard)

  window.addEventListener('artists-updated', this.loadFollowedArtists)
  window.addEventListener('playlist-updated', this.loadUserPlaylists)
  window.addEventListener('curtidas-updated', this.carregarCurtidas)
  window.addEventListener('likes-updated', this.carregarCurtidas)
  document.addEventListener('click', this.handleClickOutside)
  window.addEventListener('profile-updated', this.loadMadeForYou)

  setInterval(this.updateGreeting, 60000)

    setTimeout(() => {
      this.loadUserPlaylists()
      this.carregarCurtidas()
    }, 0)
  },

  beforeDestroy() {
    // Remover eventos do player
    window.removeEventListener('player-state-changed', this.handlePlayerStateChange)
    window.removeEventListener('player-track-ended', this.handlePlayerTrackEnded)
    window.removeEventListener('play-song', this.handlePlaySongFromDashboard)

    window.removeEventListener('playlist-updated', this.loadUserPlaylists)
    window.removeEventListener('curtidas-updated', this.carregarCurtidas)
    window.removeEventListener('likes-updated', this.carregarCurtidas)
    document.removeEventListener('click', this.handleClickOutside)
    window.removeEventListener('profile-updated', this.loadMadeForYou)

    if (this.toast.timer) {
      clearInterval(this.toast.timer)
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout)
    }
  },

  methods: {
async loadMadeForYou() {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}")
    const userId = usuario?._id || usuario?.id
    const token = localStorage.getItem("token")

    if (!userId || !token) {
      console.log("⚠️ Usuário não autenticado")
      this.loadMockMadeForYou()
      return
    }

    const response = await fetch(
      `${this.API_BASE_URL}/usuarios/${userId}/mixes?limit=12`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`)
    }

    const data = await response.json()

    if (Array.isArray(data.mixes) && data.mixes.length > 0) {
      this.madeForYou = data.mixes.map((mix, index) => ({
        id: mix.id,
        title: mix.title,
        description: mix.description,
        tracks: mix.tracks || mix._tracks?.length || 0,
        cover: mix.cover || mix._tracks?.[0]?.cover || "",
        gradient: mix.gradient || this.genreGradients[index % this.genreGradients.length],
        _tracks: mix._tracks || []
      }))

      console.log(`✅ ${this.madeForYou.length} mixes personalizados carregados`)
      return
    }

    this.loadMockMadeForYou()
  } catch (error) {
    console.error("❌ Erro ao carregar Feito para Você:", error)
    this.loadMockMadeForYou()
  }
},

  /**
   * Carrega mixes adicionais (gêneros, artistas, vibes)
   * NOTA: Se a rota /usuarios/:id/mixes não existir no backend,
   * comente ou remova esta função
   */
  async loadAdditionalMixes(userId, token) {
    try {
      const response = await fetch(
        `http://localhost:3002/usuarios/${userId}/mixes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) return

      const data = await response.json()

      if (data.mixes && data.mixes.length > 0) {
        // Adicionar mixes adicionais (máximo 4 total)
        const additionalMixes = data.mixes.slice(0, 4).map((mix, index) => ({
          id: mix.id || `mix_${index}`,
          title: mix.title,
          description: mix.description,
          tracks: mix.tracks || 10,
          cover: mix.cover || '',
          gradient: mix.gradient || this.genreGradients[index % this.genreGradients.length],
          _tracks: mix._tracks || []
        }))

        this.madeForYou = [...this.madeForYou, ...additionalMixes]
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar mixes adicionais:', error)
    }
  },

  /**
   * Dados mockados de fallback
   */
  loadMockMadeForYou() {
    this.madeForYou = [
      {
        id: 1,
        title: "Mix Diário 1",
        description: "Marília Mendonça, Maiara & Maraisa...",
        tracks: 50,
        cover: "https://e-cdns-images.dzcdn.net/images/playlist/1/250x250.jpg",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        _tracks: []
      },
      {
        id: 2,
        title: "Mix Diário 2",
        description: "Henrique & Juliano, Jorge & Mateus...",
        tracks: 45,
        cover: "https://e-cdns-images.dzcdn.net/images/playlist/2/250x250.jpg",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        _tracks: []
      },
      {
        id: 3,
        title: "Descobertas",
        description: "Novas músicas para você",
        tracks: 30,
        cover: "https://e-cdns-images.dzcdn.net/images/playlist/3/250x250.jpg",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        _tracks: []
      },
      {
        id: 4,
        title: "On Repeat",
        description: "Músicas que você ama",
        tracks: 100,
        cover: "https://e-cdns-images.dzcdn.net/images/playlist/4/250x250.jpg",
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        _tracks: []
      },
      {
        id: 5,
        title: "Radar",
        description: "Atualizado toda sexta",
        tracks: 30,
        cover: "https://e-cdns-images.dzcdn.net/images/playlist/5/250x250.jpg",
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        _tracks: []
      }
    ]
  },

  /**
   * Tocar um mix personalizado
   * Agora usa as tracks reais armazenadas no mix
   */
  playMix(mix) {
  if (!mix._tracks || mix._tracks.length === 0) {
    this.showToast("Mix vazio", "Nenhuma música disponível neste mix", "info", "fa fa-info-circle")
    return
  }

  const playerSongs = mix._tracks.map(t => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    cover: t.cover,
    url: t.preview || t.url,
    duration: t.duration || 30,
    source: t.source || "mixed"
  }))

  window.dispatchEvent(new CustomEvent("play-song", {
    detail: {
      song: playerSongs[0],
      playlist: playerSongs,
      index: 0,
      context: "made-for-you"
    }
  }))

  this.showToast("Tocando Mix", mix.title, "success", "fa fa-music")
},

  // ═══════════════════════════════════════════════════════
  // ATUALIZAÇÃO DO loadAllData()
  // ═══════════════════════════════════════════════════════
async loadAllData() {
  this.loading = true
  try {
    await Promise.all([
      this.loadChartTracks(),
      this.loadMadeForYou(),
      this.loadNewReleases(),
      this.loadGenres(),
      this.loadFollowedArtists(),
      Promise.resolve(this.loadRecentlyPlayed()),
      this.loadUserPlaylists(),
      this.carregarCurtidas()
    ])
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error)
  } finally {
    this.loading = false
  }
},
    // ═══════════════════════════════════════════════════════
    // PLAYER SYNC METHODS (NOVO)
    // ═══════════════════════════════════════════════════════

    /**
     * Recebe atualizações de estado do MusicPlayer em tempo real
     * Atualiza: continueListening[0], isPlaying, currentTrack, progresso
     */
    handlePlayerStateChange(e) {
      const { track, isPlaying, currentTime, duration, progress, context, timestamp } = e.detail || {}

      if (!track) return

      // Atualizar estado de reprodução
      this.isPlaying = isPlaying
      this.currentTrack = track
      this.currentTime = currentTime || 0
      this.duration = duration || track.duration || 0
      this.progressPercent = progress || 0
      this.playerContext = context

      // Atualizar "Continue Ouvindo" com a música atual em tempo real
      this.updateContinueListening(track, {
        progress: progress || 0,
        currentTime: currentTime || 0,
        duration: duration || track.duration || 0,
        isPlaying: isPlaying,
        timestamp: timestamp || Date.now()
      })

      // Se começou a tocar agora, adicionar ao início do histórico
      if (isPlaying && this._lastAddedToRecent !== track.id) {
        this._lastAddedToRecent = track.id
      }
    },

        /**
     * Quando uma música termina ou é trocada, adiciona ao "Tocadas Recentemente"
     */
    handlePlayerTrackEnded(e) {
      const { track, listenedDuration, totalDuration, context, naturallyEnded, timestamp } = e.detail || {}

      if (!track) {
        console.log('⚠️ player-track-ended recebido sem track')
        return
      }

      console.log(`📥 player-track-ended: "${track.title}" - ouvida ${Math.round((listenedDuration || 0)/1000)}s (naturallyEnded: ${naturallyEnded})`)

      // Calcular porcentagem ouvida
      const listenedPercent = totalDuration > 0
        ? ((listenedDuration || 0) / totalDuration) * 100
        : 0

      // Critérios para adicionar ao histórico:
      // 1. Terminou naturalmente (chegou ao fim) -> SEMPRE adiciona
      // 2. Ouveu mais de 30% da música -> Adiciona
      // 3. Ouveu mais de 10 segundos -> Adiciona
      const shouldAdd = naturallyEnded ||
                        listenedPercent > 30 ||
                        (listenedDuration || 0) > 10000

      if (!shouldAdd) {
        console.log(`⏭️ "${track.title}" ignorada (ouvida apenas ${Math.round(listenedPercent)}% / ${Math.round((listenedDuration||0)/1000)}s)`)
        return
      }

  // ✅ CHAME A FUNÇÃO AQUI
  this.addToRecentlyPlayed(track, context)
  },
      // Normalizar dados do track
    addToRecentlyPlayed(track, context) {
  const normalizedTrack = {
    id: track.id,
    title: track.title || 'Sem título',
    artist: track.artist || 'Artista desconhecido',
    cover: track.cover || track.album?.cover_medium || '',
    url: track.url || track.preview,
    duration: track.duration || 0,
    source: track.source || context || 'unknown',
    playedAt: Date.now()
  }

  const existingIndex = this.recentlyPlayed.findIndex(t => t.id === normalizedTrack.id)
  if (existingIndex >= 0) {
    this.recentlyPlayed.splice(existingIndex, 1)
  }

  this.recentlyPlayed.unshift(normalizedTrack)

  if (this.recentlyPlayed.length > 20) {
    this.recentlyPlayed = this.recentlyPlayed.slice(0, 20)
  }

  this.saveRecentlyPlayed()
  console.log('📋 Histórico atualizado. Total:', this.recentlyPlayed.length)
},
   
    /**
     * Atualiza o "Continue Ouvindo" com dados em tempo real do player
     */
    updateContinueListening(track, data) {
      const existingIndex = this.continueListening.findIndex(t => t.id === track.id)

      const trackData = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        cover: track.cover,
        preview: track.url || track.preview,
        progress: data.progress || 0,
        currentTime: data.currentTime || 0,
        duration: data.duration || track.duration || 0,
        isPlaying: data.isPlaying,
        lastPlayed: data.timestamp || Date.now()
      }

      if (existingIndex >= 0) {
        // Atualizar existente
        this.$set(this.continueListening, existingIndex, trackData)
      } else {
        // Adicionar no início
        this.continueListening.unshift(trackData)
        // Manter apenas 5 itens
        if (this.continueListening.length > 5) {
          this.continueListening = this.continueListening.slice(0, 5)
        }
      }
    },

    /**
     * Adiciona uma música ao "Tocadas Recentemente"
     * Evita duplicatas consecutivas e mantém ordem cronológica
     */
    addToRecentlyPlayed(track, context) {
      // Normalizar dados do track
      const normalizedTrack = {
        id: track.id,
        title: track.title || 'Sem título',
        artist: track.artist || 'Artista desconhecido',
        cover: track.cover || track.album?.cover_medium || '',
        url: track.url || track.preview,
        duration: track.duration || 0,
        source: track.source || context || 'unknown',
        playedAt: Date.now()
      }

      // Remover se já existe (para mover para o topo)
      const existingIndex = this.recentlyPlayed.findIndex(t => t.id === normalizedTrack.id)
      if (existingIndex >= 0) {
        this.recentlyPlayed.splice(existingIndex, 1)
      }

      // Adicionar no início
      this.recentlyPlayed.unshift(normalizedTrack)

      // Manter máximo de 20 itens
      if (this.recentlyPlayed.length > 20) {
        this.recentlyPlayed = this.recentlyPlayed.slice(0, 20)
      }

      // Persistir no localStorage para manter entre sessões
      this.saveRecentlyPlayed()

      console.log('📋 Adicionada ao histórico:', normalizedTrack.title)
    },

    /**
     * Persiste o histórico no localStorage
     */
    saveRecentlyPlayed() {
      try {
        localStorage.setItem('dashboard_recently_played', JSON.stringify(this.recentlyPlayed))
      } catch (e) {
        console.error('Erro ao salvar histórico:', e)
      }
    },

    /**
     * Carrega o histórico do localStorage
     */
    loadRecentlyPlayed() {
      try {
        const stored = localStorage.getItem('dashboard_recently_played')
        if (stored) {
          const parsed = JSON.parse(stored)
          // Filtrar apenas itens dos últimos 7 dias
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
          this.recentlyPlayed = parsed.filter(t => t.playedAt > sevenDaysAgo)
        }
      } catch (e) {
        console.error('Erro ao carregar histórico:', e)
      }
    },

    /**
     * Handler para quando o Dashboard dispara play-song (clique do usuário)
     * Notifica o MusicPlayer para tocar
     */
    handlePlaySongFromDashboard(e) {
      const { song, playlist, index, context } = e.detail || {}

      // O MusicPlayer vai receber este evento e disparar player-state-changed de volta
      // Não precisamos fazer nada aqui, apenas log
      console.log('🎵 Dashboard solicitou reprodução:', song?.title, 'context:', context)
    },

    // ═══════════════════════════════════════════════════════
    // CURTIDAS METHODS (do Curtidas.vue)
    // ═══════════════════════════════════════════════════════

    getSourceIcon(source) {
      const icons = {
        spotify: 'fa fa-spotify',
        deezer: 'si si-deezer',
        local: 'fa fa-database'
      }
      return icons[source] || 'fa fa-music'
    },

    parseDuration(durationStr) {
      if (!durationStr) return 30
      if (typeof durationStr === 'number') {
        return Number.isFinite(durationStr) ? Math.floor(durationStr) : 30
      }
      if (typeof durationStr === 'string') {
        if (durationStr.includes(':')) {
          const [m, s] = durationStr.split(':').map(Number)
          if (Number.isFinite(m) && Number.isFinite(s)) return (m * 60) + s
        }
        const num = parseInt(durationStr, 10)
        if (Number.isFinite(num)) return num
      }
      return 30
    },

    async carregarCurtidas() {
      this.isLoading = true
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          this.musicas = []
          this.userStats.likedSongs = 0
          return
        }

        const res = await fetch(`http://localhost:3002/curtidas`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          const text = await res.text()
          console.error("Erro API:", text)
          this.musicas = []
          this.userStats.likedSongs = 0
          return
        }

        const data = await res.json()

        this.musicas = data.map(c => ({
          id: c.id,
          title: c.nome,
          artist: c.artist || 'Artista desconhecido',
          album: c.album || '',
          cover: c.cover,
          url: c.url,
          source: c.source || 'local',
          duration: c.duration || 180,
          ano: c.ano || null
        }))

        this.userStats.likedSongs = this.musicas.length

      } catch (err) {
        console.error("Erro ao carregar curtidas:", err)
        this.musicas = []
        this.userStats.likedSongs = 0
      } finally {
        this.isLoading = false
      }
    },

    toggleMenu(index, event) {
      event.stopPropagation()
      this.activeMenuIndex = this.activeMenuIndex === index ? null : index
    },

    closeMenu() {
      this.activeMenuIndex = null
    },

    handleClickOutside(event) {
      const dropdowns = this.$refs.dropdownContainers
      if (dropdowns) {
        const containers = Array.isArray(dropdowns) ? dropdowns : [dropdowns]
        const clickedInside = containers.some(container =>
          container && container.contains(event.target)
        )
        if (!clickedInside) {
          this.activeMenuIndex = null
        }
      }
    },

    async adicionarAPlaylist(musica) {
      this.closeMenu()
      this.musicaSelecionada = musica
      this.showPlaylistModal = true

      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:3002/playlists`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        this.playlists = data
      } catch (err) {
        console.error(err)
      }
    },

    async adicionarNaPlaylist(playlistId) {
      try {
        const token = localStorage.getItem("token")
        const musica = this.musicaSelecionada

        const body = { source: musica.source || 'local' }

        if (musica.source && musica.source !== 'local') {
          body.dadosMusica = {
            titulo: musica.title || 'Sem título',
            artista: musica.artist || 'Desconhecido',
            capa: musica.cover || '',
            previewUrl: musica.url || '',
            duration: this.parseDuration(musica.duration),
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

        this.showToast('Adicionado!', `"${musica.title}" foi adicionada à playlist`, 'success', 'fa fa-check')
        this.showPlaylistModal = false
      } catch (err) {
        console.error(err)
        this.showToast('Erro', err.message || "Não foi possível adicionar", 'error', 'fa fa-times')
      }
    },

    async favoritarMusica(musica) {
      this.closeMenu()
      try {
        const token = localStorage.getItem("token")
        const body = { tipo: "musica" }

        if (musica.source && musica.source !== 'local') {
          body.source = musica.source
          body.dadosMusica = {
            titulo: musica.title || 'Sem título',
            artista: musica.artist || 'Desconhecido',
            capa: musica.cover || '',
            previewUrl: musica.url || '',
            duration: this.parseDuration(musica.duration),
            ano: musica.ano || null,
            album: musica.album || ''
          }
        }

        const res = await fetch(`http://localhost:3002/favoritas/${musica.id}/favoritar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        })

        if (!res.ok) throw new Error("Erro ao favoritar")
        const data = await res.json()

        if (data.favorited) {
          this.showToast('⭐ Favoritada!', `"${musica.title}" adicionada aos favoritos`, 'success', 'fa fa-star')
          window.dispatchEvent(new Event('favoritas-updated'))
        } else {
          this.showToast('Removida', `"${musica.title}" removida dos favoritos`, 'info', 'fa fa-star-o')
        }
      } catch (err) {
        console.error(err)
        this.showToast('Erro', 'Não foi possível favoritar', 'error', 'fa fa-times')
      }
    },

    async removerCurtida(musica, index) {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          this.showToast('Login necessário', 'Faça login para gerenciar suas curtidas', 'info', 'fa fa-info-circle')
          return
        }

        this.ultimaMusicaRemovida = musica
        this.ultimoIndiceRemovido = index
        this.musicas.splice(index, 1)
        this.userStats.likedSongs = this.musicas.length

        const body = { source: musica.source || 'local' }

        if (musica.source !== 'local') {
          body.dadosMusica = {
            titulo: musica.title,
            artista: musica.artist,
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

        if (data.liked === false) {
          this.showToast('Removida dos curtidos', `"${musica.title}" foi removida`, 'info', 'fa fa-heart-broken')
        } else {
          this.musicas.splice(index, 0, musica)
          this.userStats.likedSongs = this.musicas.length
          this.showToast('Erro', 'Não foi possível remover a curtida', 'error', 'fa fa-times')
        }

        window.dispatchEvent(new Event('likes-updated'))
        window.dispatchEvent(new Event('curtidas-updated'))

      } catch (err) {
        console.error("Erro ao remover curtida:", err)
        if (this.ultimaMusicaRemovida && this.ultimoIndiceRemovido !== null) {
          this.musicas.splice(this.ultimoIndiceRemovido, 0, this.ultimaMusicaRemovida)
          this.userStats.likedSongs = this.musicas.length
        }
        this.showToast('Erro', 'Erro ao remover curtida. Tente novamente.', 'error', 'fa fa-times')
      }
    },

    desfazerRemocao() {
      if (this.ultimaMusicaRemovida && this.ultimoIndiceRemovido !== null) {
        this.musicas.splice(this.ultimoIndiceRemovido, 0, this.ultimaMusicaRemovida)
        this.userStats.likedSongs = this.musicas.length
        this.recurtirMusica(this.ultimaMusicaRemovida)
        this.showToast('Ação desfeita', `"${this.ultimaMusicaRemovida.title}" foi restaurada`, 'success', 'fa fa-check-circle')
        this.ultimaMusicaRemovida = null
        this.ultimoIndiceRemovido = null
      }
    },

    async recurtirMusica(musica) {
      try {
        const token = localStorage.getItem("token")
        const body = { source: musica.source || 'local' }

        if (musica.source !== 'local') {
          body.dadosMusica = {
            titulo: musica.title,
            artista: musica.artist,
            capa: musica.cover || '',
            previewUrl: musica.url || '',
            duration: musica.duration || 30,
            ano: musica.ano || null,
            album: musica.album || ''
          }
        }

        await fetch(`http://localhost:3002/curtidas/${musica.id}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })

        window.dispatchEvent(new Event('likes-updated'))
      } catch (err) {
        console.error("Erro ao recurtir:", err)
      }
    },

    playCurtida(index) {
      const musica = this.musicas[index]
      const playerSong = {
        id: musica.id,
        title: musica.title,
        artist: musica.artist,
        cover: musica.cover,
        url: musica.url,
        duration: musica.duration || 30,
        source: musica.source,
        type: 'liked'
      }

      // Disparar evento para o MusicPlayer
      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: this.musicas.map(m => ({
            id: m.id,
            title: m.title,
            artist: m.artist,
            cover: m.cover,
            url: m.url,
            duration: m.duration || 30,
            source: m.source,
            type: 'liked'
          })),
          index: index,
          context: 'curtidas'
        }
      }))
    },

    playAllCurtidas() {
      if (this.musicas.length > 0) {
        this.playCurtida(0)
      }
    },

    goToCurtidas() {
      this.$router?.push('/curtidas')
    },

    // ═══════════════════════════════════════════════════════
    // PLAYLISTS METHODS
    // ═══════════════════════════════════════════════════════

    async loadUserPlaylists() {
      this.loadingPlaylists = true
      try {
        const user = JSON.parse(localStorage.getItem('usuario'))
        const userId = user?._id || user?.id
        if (!userId) return

        const token = localStorage.getItem("token")
        const res = await fetch(`${this.API_BASE_URL}/playlists`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const data = await res.json()
        const safeArray = Array.isArray(data) ? data : []

        this.userPlaylists = safeArray.map(p => ({
          id: p._id || p.id,
          title: p.nome || p.title,
          description: p.descricao || '',
          cover: p.capa || p.image || null,
          isPublic: p.publica !== undefined ? p.publica : p.isPublic,
          songs: Array.isArray(p.musicas) ? p.musicas : (p.songs || []),
          authorName: this.currentUser.name,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }))

        this.userStats.playlists = this.userPlaylists.length

      } catch (err) {
        console.error('Erro ao carregar playlists:', err)
      } finally {
        this.loadingPlaylists = false
      }
    },

    openPlaylist(playlist) {
      this.$router?.push({ path: '/playlist', query: { id: playlist.id } })
        || this.showToast('Playlist', `Abrindo: ${playlist.title}`, 'info', 'fa fa-folder-open')
    },

    createPlaylist() {
      this.$router?.push('/playlist')
        || this.showToast('Criar Playlist', 'Redirecionando para criar playlist...', 'info', 'fa fa-plus')
    },

    // ═══════════════════════════════════════════════════════
    // AUTH & USER
    // ═══════════════════════════════════════════════════════

    checkAuth() {
      const isLoggedIn = localStorage.getItem('isLoggedIn')
      const token = localStorage.getItem('token')
      if (!isLoggedIn || !token) {
        this.$router.push('/')
      }
    },

    loadUserFromStorage() {
      const storedUser = localStorage.getItem('usuario')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          this.currentUser = {
            ...this.currentUser,
            ...userData,
            firstName: userData.nome ? userData.nome.split(' ')[0] : userData.firstName || "Usuário",
            name: userData.nome || userData.name || "Usuário",
            email: userData.email || this.currentUser.email,
            avatar: userData.avatar || userData.foto || this.currentUser.avatar,
            plan: userData.plano || userData.plan || "Free"
          }
        } catch (e) {
          console.error('Erro ao carregar usuário:', e)
        }
      }
    },

    updateGreeting() {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        this.greeting = "Bom dia"
        this.welcomeMessage = "Comece seu dia com boa música! 🌅"
      } else if (hour >= 12 && hour < 18) {
        this.greeting = "Boa tarde"
        this.welcomeMessage = "Hora de relaxar com suas favoritas! ☀️"
      } else {
        this.greeting = "Boa noite"
        this.welcomeMessage = "Termine o dia no ritmo certo! 🌙"
      }
    },

    goToPlaylist() {
      this.$router?.push('/playlist') || this.showToast('Biblioteca', 'Abrindo sua biblioteca...', 'info')
    },

    goToArtists() {
      this.$router?.push('/artistas') || this.showToast('Artistas', 'Ver todos os artistas...', 'info')
    },

    // ═══════════════════════════════════════════════════════
    // DATA LOADING
    // ═══════════════════════════════════════════════════════

    async loadChartTracks() {
      const cache = localStorage.getItem('dashboard_chart')
      if (cache) {
        this.chartTracks = JSON.parse(cache)
        this.generateRecommendations()
      }
      try {
        const response = await fetch(`${this.DEEZER_API}/chart/0/tracks?limit=10`)
        const data = await response.json()
        if (data.data) {
          this.chartTracks = data.data
          localStorage.setItem('dashboard_chart', JSON.stringify(data.data))
        }
      } catch (e) {}
    },

    async loadNewReleases() {
      try {
        const response = await fetch(`${this.DEEZER_API}/chart/0/albums?limit=10`)
        const data = await response.json()
        if (data.data) this.newReleases = data.data
      } catch (error) {
        console.error('Erro lançamentos:', error)
      }
    },

async loadGenres() {
  try {
    const response = await fetch(`${this.DEEZER_API}/genre`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.data) {
      this.genres = data.data.filter(g => g.id !== 0)
    } else {
      this.genres = []
    }

  } catch (error) {
    console.error('❌ Erro gêneros:', error)
    this.genres = []
  }
},

    async loadFollowedArtists() {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          this.followedArtists = []
          return
        }

        const res = await fetch(
          'http://localhost:3002/follows/usuario/seguindo?tipo=cantor',
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const follows = await res.json()
        const ids = follows.map(f => String(f.seguindo_id?._id || f.seguindo_id))

        const resCantores = await fetch('http://localhost:3002/cantores')
        const cantores = await resCantores.json()

        this.followedArtists = cantores
          .filter(c => ids.includes(String(c._id)))
          .map(c => ({
            id: c._id,
            name: c.nome,
            picture_medium: c.foto,
            isFollowing: true,
            hasNewRelease: false
          }))

      } catch (error) {
        console.error('Erro ao carregar artistas seguidos:', error)
        this.followedArtists = []
      }
    },

    generateRecommendations() {
      if (this.chartTracks.length > 0) {
        this.recommendedTracks = this.chartTracks.slice(0, 5).map(track => ({
          ...track,
          match: Math.floor(Math.random() * 30) + 70
        }))
      }
    },

    // ═══════════════════════════════════════════════════════
    // PLAYBACK METHODS (Atualizados para sincronização)
    // ═══════════════════════════════════════════════════════

    playContinueListening(index) {
      const track = this.continueListening[index]
      if (!track) return

      // Se for a música atual e estiver tocando, pausar via evento
      if (this.isCurrentTrack(track) && this.isPlaying) {
        // Disparar evento de pausa para o MusicPlayer
        window.dispatchEvent(new CustomEvent('player-toggle-play'))
        return
      }

      // Converter para formato do player e disparar evento
      const playerSong = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        cover: track.cover,
        url: track.preview,
        duration: track.duration || 30,
        source: 'continue'
      }

      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: this.continueListening.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            cover: t.cover,
            url: t.preview,
            duration: t.duration || 30
          })),
          index: index,
          context: 'continue'
        }
      }))
    },


    playPlaylist(playlist) {
      this.currentPlaylist = playlist
      this.showToast('Playlist', `Tocando: ${playlist.title}`, 'success', 'fa fa-list')
    },

    toggleFollow(artist) {
      artist.isFollowing = !artist.isFollowing
      const msg = artist.isFollowing ? 'Seguindo' : 'Deixou de seguir'
      this.showToast(msg, artist.name, 'success', 'fa fa-check')
    },

    async playTrack(track, context, index) {
      // Se for a mesma track e estiver tocando, pausar
      if (this.isCurrentTrack(track) && this.isPlaying) {
        window.dispatchEvent(new CustomEvent('player-toggle-play'))
        return
      }

      // Normalizar track para o formato do player
      const playerSong = {
        id: track.id,
        title: track.title,
        artist: track.artist?.name || track.artist,
        cover: track.album?.cover_medium || track.cover,
        url: track.preview || track.url,
        duration: track.duration || 30,
        source: context
      }

      // Determinar playlist baseada no contexto
      let playlist = []
      switch(context) {
        case 'chart':
          playlist = this.chartTracks
          break
        case 'recommended':
          playlist = this.recommendedTracks
          break
        case 'recent':
          playlist = this.recentlyPlayed
          break
        default:
          playlist = [playerSong]
      }

      window.dispatchEvent(new CustomEvent('play-song', {
        detail: {
          song: playerSong,
          playlist: playlist,
          index: index,
          context: context
        }
      }))
    },

    async playArtistTopTrack(artist) {
      this.loading = true
      try {
        const response = await fetch(`${this.DEEZER_API}/artist/${artist.id}/top?limit=5`)
        const data = await response.json()
        if (data.data?.length > 0) {
          this.currentArtist = artist
         
          // Disparar evento para o player
          const playerSong = {
            id: data.data[0].id,
            title: data.data[0].title,
            artist: data.data[0].artist?.name,
            cover: data.data[0].album?.cover_medium,
            url: data.data[0].preview,
            duration: data.data[0].duration || 30,
            source: 'artist'
          }

          window.dispatchEvent(new CustomEvent('play-song', {
            detail: {
              song: playerSong,
              playlist: data.data.map(t => ({
                id: t.id,
                title: t.title,
                artist: t.artist?.name,
                cover: t.album?.cover_medium,
                url: t.preview,
                duration: t.duration || 30
              })),
              index: 0,
              context: 'artist'
            }
          }))
        }
      } catch (error) {
        this.showToast('Erro', 'Falha ao carregar artista', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },

    async playAlbumTracks(album) {
      this.loading = true
      try {
        const response = await fetch(`${this.DEEZER_API}/album/${album.id}/tracks`)
        const data = await response.json()
        if (data.data?.length > 0) {
          this.currentAlbum = album
         
          const playerSong = {
            id: data.data[0].id,
            title: data.data[0].title,
            artist: album.artist?.name,
            cover: album.cover_medium,
            url: data.data[0].preview,
            duration: data.data[0].duration || 30,
            source: 'album'
          }

          window.dispatchEvent(new CustomEvent('play-song', {
            detail: {
              song: playerSong,
              playlist: data.data.map(t => ({
                id: t.id,
                title: t.title,
                artist: album.artist?.name,
                cover: album.cover_medium,
                url: t.preview,
                duration: t.duration || 30
              })),
              index: 0,
              context: 'album'
            }
          }))
        }
      } catch (error) {
        this.showToast('Erro', 'Falha ao carregar álbum', 'error', 'fa fa-exclamation-circle')
      } finally {
        this.loading = false
      }
    },

    playNextInQueue() {
      // Disparar evento para o MusicPlayer avançar
      window.dispatchEvent(new CustomEvent('player-next-track'))
      this.showToast('Fila', 'Reproduzindo próxima música', 'info', 'fa fa-step-forward')
    },

    // ═══════════════════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════════════════

    navigateToGenre(genre) {
      this.$router?.push({ path: '/genre', query: { id: genre.id } })
        || this.showToast('Gênero', `Explorando: ${genre.name}`, 'info')
    },

    showAllPersonal() {
      this.showAllPersonalContent = !this.showAllPersonalContent
    },

    showAllRecent() {
      this.showAllRecentTracks = !this.showAllRecentTracks
    },

    refreshRecommendations() {
      this.generateRecommendations()
      this.showToast('Atualizado', 'Recomendações atualizadas!', 'success', 'fa fa-refresh')
    },

    loadMoreTracks() {
      this.loadingMoreTracks = true
      setTimeout(() => {
        this.loadingMoreTracks = false
        this.showToast('Carregado', 'Mais músicas adicionadas!', 'success')
      }, 1000)
    },

    loadMoreReleases() {
      this.showToast('Carregando', 'Buscando mais lançamentos...', 'info', 'fa fa-spinner fa-spin')
    },

    // ═══════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════

    isCurrentTrack(track) {
      if (!this.currentTrack || !track) return false
      return this.currentTrack.id === track.id
    },

    isCurrentPlaylist(playlist) {
      if (!this.currentPlaylist || !playlist) return false
      return this.currentPlaylist.id === playlist.id
    },

    isCurrentAlbum(album) {
      if (!this.currentAlbum || !album) return false
      return this.currentAlbum.id === album.id
    },

    isCurrentMix(mix) {
      return false
    },

    toggleLike() {
      this.isLiked = !this.isLiked
      const title = this.isLiked ? 'Adicionado aos Favoritos' : 'Removido dos Favoritos'
      this.showToast(title, this.currentTrack?.title || 'Música', this.isLiked ? 'success' : 'info', 'fa fa-heart')
    },

    showTrackOptions(track) {
      this.showToast('Opções', `Menu: ${track.title}`, 'info', 'fa fa-ellipsis-h')
    },

    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return "0:00"
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    },

    formatTimeAgo(timestamp) {
      const seconds = Math.floor((Date.now() - timestamp) / 1000)
      if (seconds < 60) return 'Agora'
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes}min`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h`
      return `${Math.floor(hours / 24)}d`
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' })
    },

    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE4MTgxOCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiMxZGI5NTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKJoTwvdGV4dD48L3N2Zz4='
    },

    // ═══════════════════════════════════════════════════════
    // TOAST SYSTEM
    // ═══════════════════════════════════════════════════════

    showToast(title, message, type = 'success', icon = 'fa fa-check-circle') {
      if (this.toast.timer) {
        clearInterval(this.toast.timer)
      }

      this.toast = {
        visible: true,
        title,
        message,
        type,
        icon,
        progress: 100,
        timer: null
      }

      const duration = 3000
      const interval = 30
      const step = 100 / (duration / interval)

      this.toast.timer = setInterval(() => {
        this.toast.progress -= step
        if (this.toast.progress <= 0) {
          this.hideToast()
        }
      }, interval)
    },

    hideToast() {
      if (this.toast.timer) {
        clearInterval(this.toast.timer)
        this.toast.timer = null
      }
      this.toast.visible = false
    }
  }
}
</script>
<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');

/* ========== ANIMATIONS ========== */
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes equalizer {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.5); }
}

@keyframes noteFloat {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translateY(-50px) rotate(20deg); opacity: 0; }
}

@keyframes livePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(29,185,84,0.5); }
  50% { box-shadow: 0 0 20px rgba(29,185,84,0.8), 0 0 40px rgba(29,185,84,0.4); }
}

@keyframes wave {
  0%, 100% { height: 4px; }
  50% { height: 16px; }
}

@keyframes sound-wave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.5; }
  50% { transform: scaleY(1); opacity: 1; }
}

@keyframes menuPop {
  from { opacity: 0; transform: scale(0.9) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes menuPopOut {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.9) translateY(-10px); }
}

@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(100%) scale(0.9); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes toastSlideOut {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to { opacity: 0; transform: translateX(100%) scale(0.9); }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ========== LAYOUT BASE ========== */
.dashboard {
  min-height: 100vh;
  color: #fff;
  font-family: 'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  width: 100%;
  margin-left: 0;
  background: linear-gradient(180deg, #050508 0%, #0a0a1a 30%, #0a1a3f 100%);
  padding: 24px 0 120px 0;
  display: flex;
  justify-content: center;
  position: relative;
  overflow-x: hidden;
}

.dashboard-content {
  width: 100%;
  max-width: 1200px;
  padding: 0 32px;
}

/* ========== WELCOME SECTION ========== */
.welcome-section {
  margin-bottom: 32px;
  padding: 24px 0;
}

.welcome-title {
  font-size: 42px;
  font-weight: 900;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.greeting {
  color: rgba(255,255,255,0.9);
}

.user-highlight {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.wave-emoji {
  animation: wave 2s ease-in-out infinite;
  display: inline-block;
}

.welcome-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.6);
  margin: 0 0 24px 0;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.stat-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  background: rgba(255,255,255,0.08);
  transform: translateY(-2px);
  border-color: rgba(29,185,84,0.3);
  box-shadow: 0 8px 32px rgba(29,185,84,0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(29,185,84,0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1db954;
  font-size: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
  background: rgba(29,185,84,0.25);
}

.stat-data {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-top: 4px;
}

/* ========== HERO BANNER ========== */
.hero-banner {
  border-radius: 24px;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 48px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 400px;
}

.hero-banner.continue-listening {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.hero-ambient {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: rgba(255,255,255,0.05);
  border-radius: 50%;
  filter: blur(60px);
  animation: pulse 4s ease-in-out infinite;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 60%;
  flex: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

.badge-live {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
  color: #1db954;
  font-size: 10px;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #1db954;
  border-radius: 50%;
  animation: livePulse 1.5s ease-in-out infinite;
}

.hero-title {
  font-size: 56px;
  font-weight: 900;
  margin: 0 0 12px 0;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  background: linear-gradient(to right, #fff, rgba(255,255,255,0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-artist {
  font-size: 24px;
  color: rgba(255,255,255,0.9);
  margin: 0 0 16px 0;
  font-weight: 600;
}

.hero-description {
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.highlight {
  font-weight: 700;
  color: #fff;
  display: block;
  margin-top: 8px;
}

/* Progress Bar no Hero */
.hero-progress {
  margin-bottom: 24px;
  max-width: 400px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #1db954;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}

/* Hero Actions */
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.btn-primary {
  background: #1db954;
  color: #000;
  border: none;
  padding: 16px 32px;
  border-radius: 500px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(29,185,84,0.4);
}

.btn-primary:hover:not(:disabled) {
  background: #1ed760;
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 8px 24px rgba(29,185,84,0.6);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-glow {
  animation: glow 2s ease-in-out infinite;
}

.btn-secondary {
  background: rgba(0,0,0,0.3);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 16px 32px;
  border-radius: 500px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(0,0,0,0.5);
  border-color: #fff;
  transform: scale(1.05);
}

.btn-secondary.active {
  background: rgba(255,255,255,0.2);
  border-color: #1db954;
  color: #1db954;
}

.btn-icon {
  padding: 16px;
  border-radius: 50%;
}

/* Hero Image - Vinyl */
.hero-image {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 300px;
}

.vinyl-container {
  position: relative;
  width: 280px;
  height: 280px;
}

.vinyl-record {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #000;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 10px rgba(255,255,255,0.05);
  animation: spin 8s linear infinite;
  animation-play-state: paused;
  overflow: hidden;
}

.vinyl-container.playing .vinyl-record {
  animation-play-state: running;
}

.vinyl-grooves {
  position: absolute;
  inset: 15px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    circle at center,
    #1a1a1a 0px,
    #1a1a1a 2px,
    #000 3px,
    #000 4px
  );
}

.vinyl-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: #1db954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.vinyl-label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vinyl-label i {
  font-size: 32px;
  color: #000;
}

.vinyl-reflection {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  pointer-events: none;
}

.floating-notes {
  position: absolute;
  top: -20px;
  right: -20px;
  font-size: 24px;
  color: rgba(255,255,255,0.3);
}

.floating-notes i {
  position: absolute;
  animation: noteFloat 3s ease-in-out infinite;
}

.note-1 { left: 0; animation-delay: 0s; }
.note-2 { left: 30px; animation-delay: 1s; }
.note-3 { left: 60px; animation-delay: 2s; }

/* ========== SECTIONS ========== */
.section {
  margin-bottom: 48px;
  animation: slideIn 0.6s ease-out;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: -0.5px;
}

.section-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.section-icon.hot { color: #ff6b6b; background: rgba(255,107,107,0.15); }
.section-icon.new { color: #ffd93d; background: rgba(255,217,61,0.15); }
.section-icon.artist { color: #a855f7; background: rgba(168,85,247,0.15); }
.section-icon.genre { color: #22d3ee; background: rgba(34,211,238,0.15); }
.section-icon.playlist { color: #f472b6; background: rgba(244,114,182,0.15); }
.section-icon.rec { color: #fbbf24; background: rgba(251,191,36,0.15); }
.section-icon.personal { color: #c084fc; background: rgba(192,132,252,0.15); }
.section-icon.liked { color: #ec4899; background: rgba(236,72,153,0.15); }

.section-title:hover .section-icon {
  transform: scale(1.1) rotate(5deg);
}

.section-subtitle {
  font-size: 14px;
  color: #888;
  font-weight: 500;
}

.section-count {
  font-size: 12px;
  color: #666;
  background: rgba(255,255,255,0.1);
  padding: 4px 10px;
  border-radius: 12px;
  margin-left: 12px;
}

.header-actions-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-create {
  background: rgba(29,185,84,0.2);
  color: #1db954;
  border: 1px solid rgba(29,185,84,0.3);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.btn-create:hover {
  background: rgba(29,185,84,0.3);
  transform: scale(1.05);
}

.btn-play-all {
  padding: 10px 20px;
  border-radius: 24px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.btn-play-all:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
}

.see-all {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: #b3b3b3;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.see-all:hover {
  color: #fff;
  border-color: #fff;
  background: rgba(255,255,255,0.1);
}

.see-all i {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.see-all:hover i {
  transform: translateX(3px);
}

/* ========== CURTIDAS SECTION ========== */
.curtidas-section {
  background: linear-gradient(180deg, rgba(236,72,153,0.05) 0%, transparent 100%);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(236,72,153,0.1);
}

.curtidas-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.curtida-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.curtida-item:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(236, 72, 153, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.curtida-item.active {
  background: rgba(236, 72, 153, 0.08);
  border-color: rgba(236, 72, 153, 0.4);
}

.curtida-number {
  width: 28px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.curtida-cover-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.curtida-cover-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.curtida-play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.curtida-item:hover .curtida-play-overlay {
  opacity: 1;
}

.curtida-play-overlay i {
  color: #fff;
  font-size: 18px;
}

.equalizer-mini {
  position: absolute;
  bottom: 4px;
  right: 4px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
  padding: 2px 4px;
  background: #1db954;
  border-radius: 3px;
  z-index: 3;
}

.equalizer-mini span {
  width: 2px;
  background: #000;
  border-radius: 1px;
  animation: equalizer 0.5s ease-in-out infinite;
  height: 16px;
}

.equalizer-mini span:nth-child(1) { animation-delay: 0s; height: 6px; }
.equalizer-mini span:nth-child(2) { animation-delay: 0.1s; height: 12px; }
.equalizer-mini span:nth-child(3) { animation-delay: 0.2s; height: 9px; }
.equalizer-mini span:nth-child(4) { animation-delay: 0.3s; height: 7px; }

.curtida-info {
  flex: 1;
  min-width: 0;
}

.curtida-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.curtida-artist {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}

.source-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.source-badge.spotify {
  background: rgba(29, 185, 84, 0.15);
  color: #1db954;
}

.source-badge.deezer {
  background: rgba(239, 89, 60, 0.15);
  color: #ef593c;
}

.source-badge.local {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.album-dot {
  color: #475569;
}

.album-name {
  color: #64748b;
}

.curtida-duration {
  font-size: 13px;
  color: #64748b;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.curtida-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  flex-shrink: 0;
}

.btn-like {
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

.btn-like.active {
  color: #ec4899;
  background: rgba(236, 72, 153, 0.1);
}

.btn-like:hover {
  transform: scale(1.1);
  background: rgba(236, 72, 153, 0.2);
}

.dropdown-container {
  position: relative;
}

.btn-more {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-more:hover, .btn-more.active {
  color: #f8fafc;
  background: rgba(255,255,255,0.1);
  transform: rotate(90deg);
}

/* Modern Dropdown */
.modern-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 280px;
  background: rgba(30, 30, 46, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 1000;
  overflow: hidden;
  transform-origin: top right;
}

.menu-pop-enter-active {
  animation: menuPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.menu-pop-leave-active {
  animation: menuPopOut 0.2s ease forwards;
}

.dropdown-options {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  color: inherit;
}

.dropdown-option:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.option-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  transition: all 0.3s;
}

.playlist-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1));
  color: #60a5fa;
}

.favorite-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1));
  color: #fbbf24;
}

.dropdown-option:hover .playlist-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.2));
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.dropdown-option:hover .favorite-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.2));
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.option-label {
  font-size: 14px;
  font-weight: 600;
  color: #f8fafc;
}

.option-hint {
  font-size: 12px;
  color: #64748b;
}

.option-arrow {
  color: #475569;
  font-size: 12px;
  transition: all 0.2s;
}

.dropdown-option:hover .option-arrow {
  color: #94a3b8;
  transform: translateX(4px);
}

.dropdown-footer {
  padding: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.dropdown-close {
  width: 100%;
  padding: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.dropdown-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.btn-show-more {
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-show-more:hover {
  background: rgba(255,255,255,0.06);
  color: #f8fafc;
  border-color: rgba(236, 72, 153, 0.3);
}

/* ========== CARDS ========== */
.cards-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

.cards-row.expanded {
  grid-template-columns: repeat(6, 1fr);
}

.music-card {
  background: rgba(24, 24, 24, 0.6);
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
}

.music-card:hover {
  background: rgba(40, 40, 40, 0.8);
  transform: translateY(-8px);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}

.music-card.active {
  background: rgba(40, 40, 40, 0.9);
  border-color: #1db954;
}

.card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.music-card:hover .card-image img {
  transform: scale(1.08);
}

.play-button-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 48px;
  height: 48px;
  background: #1db954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateY(8px) scale(0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  z-index: 2;
}

.music-card:hover .play-button-overlay,
.music-card.active .play-button-overlay {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.play-button-overlay i {
  font-size: 20px;
  color: #000;
  margin-left: 2px;
}

/* Equalizer Animation */
.equalizer {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 24px;
  padding: 4px 8px;
  background: #1db954;
  border-radius: 4px;
  z-index: 3;
}

.equalizer span {
  width: 3px;
  background: #000;
  border-radius: 1px;
  animation: equalizer 0.5s ease-in-out infinite;
  height: 16px;
}

.equalizer span:nth-child(1) { animation-delay: 0s; height: 8px; }
.equalizer span:nth-child(2) { animation-delay: 0.1s; height: 16px; }
.equalizer span:nth-child(3) { animation-delay: 0.2s; height: 12px; }
.equalizer span:nth-child(4) { animation-delay: 0.3s; height: 10px; }

/* Badges */
.rank-badge {
  position: absolute;
  top: -8px;
  left: -8px;
  background: #1db954;
  color: #000;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 2;
}

.rank-badge.top3 {
  background: #ffd700;
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.new-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4757;
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  z-index: 2;
  backdrop-filter: blur(4px);
}

.time-badge.now-playing {
  background: #1db954;
  color: #000;
  font-weight: 800;
  animation: livePulse 1.5s ease-in-out infinite;
}

.match-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(29,185,84,0.9);
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Mix Cards */
.mix-card .card-image {
  position: relative;
}

.mix-gradient-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.3;
  mix-blend-mode: overlay;
}

.mix-info-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
  backdrop-filter: blur(4px);
}

/* Playlist Cards */
.playlist-type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(29,185,84,0.9);
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.playlist-type-badge.private {
  background: rgba(255,71,87,0.9);
  color: #fff;
}

/* Create Card */
.create-card {
  border: 2px dashed rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.create-card:hover {
  border-color: #1db954;
  background: rgba(29,185,84,0.05);
}

.create-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.create-icon {
  width: 64px;
  height: 64px;
  background: rgba(29,185,84,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1db954;
  font-size: 24px;
  transition: all 0.3s ease;
}

.create-card:hover .create-icon {
  background: rgba(29,185,84,0.3);
  transform: scale(1.1);
}

.create-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.create-subtitle {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin: 0;
}

/* Card Info */
.card-info {
  position: relative;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.card-artist {
  font-size: 13px;
  color: #b3b3b3;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-date {
  font-size: 11px;
  color: #666;
  margin: 4px 0 0 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-more {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 50%;
}

.music-card:hover .card-more {
  opacity: 1;
}

.card-more:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

/* Artist Cards */
.artists-row {
  grid-template-columns: repeat(5, 1fr);
}

.artist-card {
  text-align: center;
  position: relative;
}

.artist-image {
  border-radius: 50%;
  overflow: hidden;
}

.artist-image img {
  border-radius: 50%;
}

.artist-play {
  opacity: 0;
  transform: scale(0.8);
}

.artist-card:hover .artist-play {
  opacity: 1;
  transform: scale(1);
}

.new-release-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ffd700;
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
}

.follow-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
}

.artist-card:hover .follow-btn {
  opacity: 1;
}

.follow-btn:hover {
  background: rgba(29,185,84,0.9);
  border-color: #1db954;
  color: #000;
}

.follow-btn.following {
  opacity: 1;
  background: #1db954;
  border-color: #1db954;
  color: #000;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.category-tile {
  position: relative;
  height: 200px;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255,255,255,0.1);
}

.category-tile:hover {
  transform: scale(1.03);
  filter: brightness(1.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.category-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.category-tile h3 {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.category-explore {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.category-tile:hover .category-explore {
  opacity: 1;
  transform: translateY(0);
}

.category-explore i {
  transition: transform 0.3s ease;
}

.category-tile:hover .category-explore i {
  transform: translateX(4px);
}

.genre-image {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.2;
  transform: rotate(15deg);
  object-fit: cover;
  transition: all 0.3s ease;
}

.category-tile:hover .genre-image {
  transform: rotate(0deg) scale(1.1);
  opacity: 0.3;
}

.genre-icon {
  position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 64px;
  opacity: 0.2;
  transform: rotate(15deg);
}

/* ========== ESTADO VAZIO DE PLAYLISTS ========== */
.empty-playlists {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
  background: rgba(255,255,255,0.02);
  border-radius: 16px;
  border: 2px dashed rgba(255,255,255,0.1);
}

.empty-illustration {
  position: relative;
  display: inline-flex;
  margin-bottom: 24px;
}

.empty-illustration i {
  font-size: 64px;
  opacity: 0.3;
  position: relative;
  z-index: 1;
  color: #1db954;
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
  background: #1db954;
  border-radius: 2px;
  animation: sound-wave 1s ease-in-out infinite;
}

.sound-waves span:nth-child(1) { height: 20px; animation-delay: 0s; }
.sound-waves span:nth-child(2) { height: 30px; animation-delay: 0.2s; }
.sound-waves span:nth-child(3) { height: 25px; animation-delay: 0.4s; }

.empty-playlists h3 {
  font-size: 20px;
  color: #f8fafc;
  margin: 0 0 8px 0;
}

.empty-playlists p {
  margin: 0 0 24px 0;
  font-size: 14px;
}

.empty-playlists .btn-primary {
  display: inline-flex;
}

/* ========== MODAL ========== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: #121212;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  color: #f8fafc;
}

.modal-header button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 18px;
}

.empty-playlists-modal {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
}

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #1e1e1e;
  border-radius: 8px;
}

.playlist-item strong {
  color: #f8fafc;
  display: block;
}

.playlist-item p {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #94a3b8;
}

.btn-add {
  background: #1db954;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: 600;
}

/* ========== LOADING & TOAST ========== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5,5,8,0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.spinner-container {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 24px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 4px solid rgba(29,185,84,0.2);
  border-top-color: #1db954;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-pulse {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(29,185,84,0.1);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.loading-overlay p {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.loading-sub {
  margin-top: 8px;
  color: #666;
  font-size: 13px;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: 100px;
  right: 24px;
  background: rgba(24, 24, 24, 0.95);
  color: #fff;
  padding: 16px 20px;
  border-radius: 16px;
  font-weight: 600;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
  min-width: 320px;
  max-width: 420px;
  overflow: hidden;
}

.toast-notification.success {
  border-left: 4px solid #1db954;
}

.toast-notification.error {
  border-left: 4px solid #ff4757;
}

.toast-notification.info {
  border-left: 4px solid #3498db;
}

.toast-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-notification.success .toast-icon-wrapper {
  background: rgba(29,185,84,0.2);
  color: #1db954;
}

.toast-notification.error .toast-icon-wrapper {
  background: rgba(255,71,87,0.2);
  color: #ff4757;
}

.toast-notification.info .toast-icon-wrapper {
  background: rgba(52,152,219,0.2);
  color: #3498db;
}

.toast-icon-wrapper i {
  font-size: 20px;
}

.toast-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.toast-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toast-message {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
  font-weight: 500;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.toast-close:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.toast-close i {
  font-size: 14px;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #1db954, #1ed760);
  transition: width 0.1s linear;
}

.toast-notification.error .toast-progress {
  background: linear-gradient(90deg, #ff4757, #ff6b7a);
}

.toast-notification.info .toast-progress {
  background: linear-gradient(90deg, #3498db, #5dade2);
}

/* Toast Transitions */
.toast-enter-active {
  animation: toastSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  animation: toastSlideOut 0.3s ease;
}

/* Fade transition for modal */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  height: 200px;
  margin-bottom: 48px;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1400px) {
  .dashboard-content {
    max-width: 100%;
    padding: 0 24px;
  }
}

@media (max-width: 1200px) {
  .cards-row {
    grid-template-columns: repeat(4, 1fr);
  }

  .cards-row.expanded {
    grid-template-columns: repeat(4, 1fr);
  }

  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .hero-title {
    font-size: 48px;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .dashboard {
    margin-left: 200px;
    width: calc(100% - 200px);
  }

  .hero-banner {
    flex-direction: column;
    text-align: center;
    padding: 40px 32px;
    min-height: auto;
  }

  .hero-content {
    max-width: 100%;
    order: 2;
  }

  .hero-image {
    order: 1;
    margin-bottom: 32px;
    flex: 0 0 auto;
  }

  .vinyl-container {
    width: 220px;
    height: 220px;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-progress {
    margin: 0 auto 24px;
  }

  .cards-row,
  .cards-row.expanded {
    grid-template-columns: repeat(3, 1fr);
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome-title {
    font-size: 32px;
  }

  .toast-notification {
    left: 24px;
    right: 24px;
    max-width: none;
  }

  .curtida-item {
    padding: 8px 12px;
  }

  .curtida-cover-wrapper {
    width: 40px;
    height: 40px;
  }

  .curtida-title {
    font-size: 13px;
  }

  .modern-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    border-radius: 20px 20px 0 0;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
}

@media (max-width: 768px) {
  .dashboard {
    margin-left: 0;
    width: 100%;
  }

  .dashboard-content {
    padding: 0 16px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 20px;
  }

  .hero-banner {
    padding: 32px 24px;
    margin-bottom: 32px;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-artist {
    font-size: 18px;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .cards-row,
  .cards-row.expanded {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .section-title {
    font-size: 20px;
  }

  .section-icon {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .category-tile {
    height: 140px;
  }

  .category-tile h3 {
    font-size: 18px;
  }

  .vinyl-container {
    width: 180px;
    height: 180px;
  }

  .toast-notification {
    left: 16px;
    right: 16px;
    bottom: 80px;
    min-width: auto;
    padding: 12px 16px;
  }

  .toast-icon-wrapper {
    width: 36px;
    height: 36px;
  }

  .toast-title {
    font-size: 13px;
  }

  .toast-message {
    font-size: 12px;
  }

  .curtidas-section {
    padding: 16px;
  }

  .curtida-item {
    gap: 10px;
    padding: 8px;
  }

  .curtida-number {
    font-size: 12px;
    width: 20px;
  }

  .curtida-cover-wrapper {
    width: 36px;
    height: 36px;
  }

  .curtida-title {
    font-size: 13px;
  }

  .curtida-artist {
    font-size: 11px;
  }

  .curtida-duration {
    display: none;
  }

  .btn-like, .btn-more {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .hero-banner {
    padding: 24px 16px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-artist {
    font-size: 16px;
  }

  .hero-badge {
    font-size: 10px;
    padding: 6px 12px;
  }

  .cards-row,
  .cards-row.expanded {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .music-card {
    padding: 12px;
  }

  .card-title {
    font-size: 13px;
  }

  .card-artist {
    font-size: 11px;
  }

  .vinyl-container {
    width: 150px;
    height: 150px;
  }

  .play-button-overlay {
    width: 40px;
    height: 40px;
  }

  .play-button-overlay i {
    font-size: 16px;
  }

  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .section-title {
    font-size: 18px;
  }

  .see-all {
    font-size: 11px;
    padding: 6px 12px;
  }

  .category-tile {
    height: 120px;
    padding: 16px;
  }

  .category-tile h3 {
    font-size: 16px;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>