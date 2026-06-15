<template>
  <div class="musical-match">
    <!-- ============================================ -->
    <!-- ONBOARDING / PROFILE CREATION FLOW           -->
    <!-- ============================================ -->
    <div v-if="!hasProfile" class="onboarding-flow">
     
      <!-- Step 1: Welcome -->
      <div v-if="onboardingStep === 1" class="onboarding-step welcome-step">
        <div class="onboarding-content">
          <div class="logo-large">
            <svg viewBox="0 0 24 24" fill="currentColor" class="logo-icon-large">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h1 class="welcome-title">Musical Match</h1>
          <p class="welcome-subtitle">Conecte-se através da música</p>

          <div class="features-preview">
            <div class="feature-item">
              <div class="feature-icon">
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
</div>
              <span>Descubra músicas</span>
            </div>
            <div class="feature-item">
            <div class="feature-icon">
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
</div>
              <span>Curta suas favoritas</span>
            </div>
            <div class="feature-item">
             <div class="feature-icon">
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
</div>
              <span>Encontre matches</span>
            </div>
          </div>

          <button @click="nextStep" class="btn-primary btn-large">
            Começar
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 2: Basic Info -->
      <div v-else-if="onboardingStep === 2" class="onboarding-step">
        <div class="onboarding-header">
          <button @click="prevStep" class="back-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div class="step-indicator">
            <span class="step-dot active"></span>
            <span class="step-dot active"></span>
            <span class="step-dot"></span>
            <span class="step-dot"></span>
          </div>
          <div class="placeholder"></div>
        </div>

        <div class="onboarding-content compact">
          <h2 class="step-title">Vamos criar seu perfil</h2>
          <p class="step-subtitle">Como devemos te chamar?</p>

          <div class="form-group">
            <label for="onboarding-name">Nome</label>
            <input
              id="onboarding-name"
              v-model="onboardingData.name"
              type="text"
              class="onboarding-input"
              placeholder="Seu nome"
              maxlength="30"
            >
            <span class="input-hint">{{ onboardingData.name.length }}/30</span>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label for="onboarding-age">Idade</label>
              <input
                id="onboarding-age"
                v-model.number="onboardingData.age"
                type="number"
                class="onboarding-input"
                placeholder="18"
                min="18"
                max="100"
              >
            </div>
            <div class="form-group half">
              <label for="onboarding-location">Cidade</label>
           <input
  id="onboarding-location"
  v-model="onboardingData.location"
  type="text"
  class="onboarding-input"
  placeholder="Cidade, Estado (ex: São Paulo, SP)"
  required
>
            </div>
          </div>
 <div class="login-line">
            <span>Já tem uma conta?</span>
            <button @click="openLoginModal" class="btn-login-link">
              Fazer login
            </button>
          </div>
   
          <button
            @click="nextStep"
            class="btn-primary btn-large"
            :disabled="!canProceedStep2"
          >
            Continuar
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 3: Photo -->
      <div v-else-if="onboardingStep === 3" class="onboarding-step">
        <div class="onboarding-header">
          <button @click="prevStep" class="back-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div class="step-indicator">
            <span class="step-dot active"></span>
            <span class="step-dot active"></span>
            <span class="step-dot active"></span>
            <span class="step-dot"></span>
          </div>
          <div class="placeholder"></div>
        </div>

        <div class="onboarding-content compact">
          <h2 class="step-title">Sua foto</h2>
          <p class="step-subtitle">Escolha uma foto que te represente</p>

          <div class="photo-upload-area">
            <div v-if="!onboardingData.avatar" class="upload-placeholder" @click="triggerOnboardingFileInput">
              <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
              <span>Clique para adicionar foto</span>
              <small>Ou arraste uma imagem aqui</small>
            </div>

            <div v-else class="photo-preview-container">
              <img :src="onboardingData.avatar" alt="Preview" class="photo-preview-large">
              <button @click="removePhoto" class="remove-photo-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <input
              ref="onboardingFileInput"
              type="file"
              accept="image/*"
              @change="handleOnboardingFileChange"
              class="hidden-input"
            >
          </div>

          <div class="avatar-presets">
            <p>Ou escolha um avatar:</p>
            <div class="preset-avatars">
              <button
                v-for="n in 6"
                :key="n"
                @click="selectPresetAvatar(n)"
                class="preset-avatar-btn"
                :class="{ active: onboardingData.avatar === getPresetAvatarUrl(n) }"
              >
                <img :src="getPresetAvatarUrl(n)" alt="Avatar option" @error="onAvatarError($event, n)">
              </button>
            </div>
          </div>

          <button
            @click="nextStep"
            class="btn-primary btn-large"
            :disabled="!onboardingData.avatar"
          >
            Continuar
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 4: Bio & Music Preferences -->
      <div v-else-if="onboardingStep === 4" class="onboarding-step">
        <div class="onboarding-header">
          <button @click="prevStep" class="back-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div class="step-indicator">
            <span class="step-dot active"></span>
            <span class="step-dot active"></span>
            <span class="step-dot active"></span>
            <span class="step-dot active"></span>
          </div>
          <div class="placeholder"></div>
        </div>

        <div class="onboarding-content compact">
          <h2 class="step-title">Quase lá!</h2>
          <p class="step-subtitle">Conte um pouco sobre você e seus gostos musicais</p>

          <div class="form-group">
            <label for="onboarding-bio">Bio</label>
          <textarea
  id="onboarding-bio"
  v-model="onboardingData.bio"
  class="onboarding-textarea"
  placeholder="Fale sobre você, seus estilos musicais favoritos, artistas preferidos..."
  rows="3"
  maxlength="150"
  @input="checkBioLimit"
></textarea>
            <span class="input-hint">{{ onboardingData.bio.length }}/150</span>
          </div>

          <div class="form-group">
            <label>Estilos musicais favoritos (selecione até 3)</label>
            <div class="genre-selector">
          <button
  v-for="genre in availableGenres"
  :key="genre._id"
  @click="toggleGenre(genre)"
  class="genre-select-btn"
  :class="{ active: isGenreSelected(genre._id) }"
  :disabled="
    !isGenreSelected(genre._id) &&
    onboardingData.favoriteGenres.length >= 3
  "
  :style="{
    borderColor: genre.color,
    color: isGenreSelected(genre._id) ? '#fff' : genre.color,
    background: isGenreSelected(genre._id)
      ? genre.color
      : 'transparent'
  }"
>
  {{ genre.nome }}
</button>
            </div>
         <div style="text-align: center; margin-top: 1rem;">
  <span
    class="input-hint"
    :class="{ 'limit-reached': onboardingData.favoriteGenres.length >= 3 }"
    style="position: static; transform: none;"
  >
    {{ onboardingData.favoriteGenres.length }}/3 selecionados
  </span>
</div>
          </div>

          <button
            @click="finishOnboarding"
            class="btn-primary btn-large btn-finish"
            :disabled="!canFinish"
          >
            <span v-if="creatingProfile">Criando perfil...</span>
            <span v-else>
              Começar a usar
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>

 <!-- ============================================ -->
    <!-- MAIN APP                                     -->
    <!-- ============================================ -->
    <template v-else>
      <header class="match-header">
        <div class="header-content">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="currentColor" class="logo-icon">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span class="logo-text">Musical Match</span>
          </div>

          <div class="header-actions">
            <button class="icon-btn chat-btn" @click="openChatList" :disabled="chats.length === 0 && !hasChatsLoaded">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
              <span v-if="totalUnread > 0" class="badge chat-badge">{{ totalUnread }}</span>
            </button>

         <button
  class="icon-btn"
  @click="showMatches = true"
  :disabled="matches.length === 0 && chats.length === 0"
>
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
  <span v-if="unreadMatches > 0" class="badge">{{ unreadMatches }}</span>
  <span v-if="matches.length === 0 && chats.length === 0" class="lock-icon">
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
    </svg>
  </span>
</button>

  <button class="icon-btn profile-btn" @click="openProfile">
  <div class="avatar-small-wrapper" :class="{ 'avatar-gold': isAvatarGoldEquipped }">
    <img :src="currentUser.avatar" alt="Profile" class="avatar-small">
  </div>
</button>
          </div>
        </div>
      </header>

      <main class="match-main">
        <!-- Loading State -->
        <div v-if="loading" class="empty-state">
          <div class="vinyl-animation">
            <div class="vinyl"></div>
          </div>
          <h2>Carregando músicas...</h2>
          <p>Buscando as melhores tracks para você</p>
        </div>

        <!-- Empty State (all songs explored) -->
        <div v-else-if="currentIndex >= songs.length" class="empty-state">
          <div class="empty-illustration">
            <div class="vinyl-animation">
              <div class="vinyl"></div>
            </div>
          </div>
          <h2>Você explorou todas as músicas!</h2>
          <p>Descubra seus matches musicais ou volte mais tarde para novas recomendações</p>
          <div class="empty-actions">
<button v-if="matches.length > 0 || chats.length > 0" @click="showMatches = true" class="btn-primary">
  Ver Meus Matches ({{ matches.length }})
</button>
            <button @click="loadMoreSongs" class="btn-secondary">
              Carregar Mais
            </button>
          </div>
        </div>

        <!-- Cards -->
        <div v-else class="cards-wrapper">
          <div class="cards-container">
            <div
              v-for="(song, index) in visibleSongs"
              :key="song.id"
              class="song-card"
              :class="{
                'top-card': index === visibleSongs.length - 1,
                'swiping-left': swipingLeft && index === visibleSongs.length - 1,
                'swiping-right': swipingRight && index === visibleSongs.length - 1
              }"
              :style="getCardStyle(index)"
              @mousedown="startDrag"
              @touchstart="startDrag"
              @mousemove="onDrag"
              @touchmove="onDrag"
              @mouseup="endDrag"
              @touchend="endDrag"
              @mouseleave="endDrag"
            >
              <div class="card-media">
                <img :src="song.cover || song.album?.cover_medium || 'https://e-cdns-images.dzcdn.net/images/cover/default/500x500.jpg'" :alt="song.title" class="cover-image">

                <div v-if="currentPlaying === song.id" class="visualizer">
                  <div
                    v-for="n in 5"
                    :key="n"
                    class="bar"
                    :style="{
                      animationDelay: n * 0.1 + 's',
                      height: Math.random() * 40 + 20 + 'px'
                    }"
                  ></div>
                </div>

                <button
                  class="play-overlay-btn"
                  @click.stop="togglePlay(song)"
                  :class="{ playing: currentPlaying === song.id }"
                >
                  <svg v-if="currentPlaying !== song.id" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                </button>

                <div class="swipe-indicator like" :class="{ active: dragOffset > 50 }">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>CURTIR</span>
                </div>

                <div class="swipe-indicator skip" :class="{ active: dragOffset < -50 }">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  <span>PULAR</span>
                </div>

                <div v-if="isFavorite(song)" class="favorite-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>

              <div class="card-info">
                <div class="song-header">
                  <h2 class="song-title">{{ song.title }}</h2>
                  <span v-if="currentPlaying === song.id" class="now-playing-badge">Tocando</span>
                </div>
                <p class="song-artist">{{ song.artist?.name || song.artist }}</p>

                <div class="song-details">
                  <span class="genre-tag">{{ song.album?.title || song.genre }}</span>
                  <span class="duration">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    {{ formatDuration(song.duration) }}
                  </span>
                </div>

                <div class="source-badge" :style="{ backgroundColor: sourceBadge?.color + '20', color: sourceBadge?.color, borderColor: sourceBadge?.color }">
                  <span v-html="sourceBadge?.icon"></span>
                  {{ sourceBadge?.text }}
                </div>

                <div v-if="currentPlaying === song.id" class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: progress + '%' }"></div>
                  </div>
                  <div class="time-display">
                    <span>{{ formatTime(currentTime) }}</span>
                    <span>{{ formatDuration(song.duration) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons-container">
            <div class="action-buttons">
              <button class="action-btn skip" @click="swipeLeft" aria-label="Pular">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>

              <button class="action-btn super-like" @click="toggleFavorite" :class="{ active: isFavorite(currentSong) }" aria-label="Favoritar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>

              <button class="action-btn like" @click="swipeRight" aria-label="Curtir">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>

            <p class="instructions">
              Arraste para os lados ou use os botões
            <span v-if="matches.length === 0 && chats.length === 0" class="unlock-hint">• Desbloqueie matches curtindo músicas</span>
            </p>
          </div>
        </div>
      </main>
    </template>

  <!-- ============================================ -->
    <!-- MATCHES MODAL                                -->
    <!-- ============================================ -->
    <Transition name="modal">
      <div v-if="showMatches" class="modal-overlay" @click.self="closeMatches">
        <div class="modal-content matches-modal">
          <div class="modal-header">
            <div class="header-title">
              <h3>Seus Matches Musicais</h3>
              <span v-if="matches.length > 0" class="match-count">{{ matches.length }} pessoa{{ matches.length !== 1 ? 's' : '' }}</span>
            </div>
            <button @click="closeMatches" class="close-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="matches.length === 0" class="empty-matches">
              <div class="lock-animation">
  <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
</div>
              <h4>Matches bloqueados</h4>
              <p>Curta pelo menos 3 músicas para desbloquear seus matches musicais!</p>
              <div class="progress-lock">
                <div class="progress-bar-lock">
                  <div class="fill" :style="{ width: Math.min((likedSongs.length / 3) * 100, 100) + '%' }"></div>
                </div>
                <span>{{ likedSongs.length }}/3 músicas</span>
              </div>
            </div>

            <div v-else class="matches-list">
              <div v-for="match in matches" :key="match.id" class="match-card" @click="openMatchDetail(match)">
                <div class="match-header-card">
        <div class="match-avatars">
  <div class="avatar-wrapper-match" :class="{ 'avatar-gold': isAvatarGoldEquipped }">
    <img :src="currentUser.avatar" alt="You" class="avatar you">
  </div>
  <img :src="match.user.avatar" alt="Match" class="avatar them">
  <div class="compatibility-badge">{{ match.compatibility }}%</div>
</div>
                  <div class="match-actions">
                    <button class="icon-btn-small" @click.stop="removeMatch(match)">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="match-info">
                  <h4>{{ match.user.name }}, {{ match.user.age }}</h4>
                  <p class="match-location" v-if="match.user.location">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {{ match.user.location }}
                  </p>

                  <div class="common-songs">
                    <h5>Músicas em comum</h5>
                    <div class="songs-tags">
                      <span v-for="(song, i) in match.commonSongs.slice(0, 3)" :key="i" class="song-tag">
                        {{ song }}
                      </span>
                      <span v-if="match.commonSongs.length > 3" class="more-tag">+{{ match.commonSongs.length - 3 }}</span>
                    </div>
                  </div>

                  <div class="match-genres">
                    <span v-for="genre in match.commonGenres" :key="genre" class="genre-pill">
                      {{ genre }}
                    </span>
                  </div>
                </div>

                <button class="chat-btn-main" @click.stop="startChat(match)">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                  Iniciar Conversa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ============================================ -->
    <!-- PROFILE MODAL                                -->
    <!-- ============================================ -->
    <Transition name="modal">
      <div v-if="showProfile" class="modal-overlay" @click.self="closeProfile">
        <div class="modal-content profile-modal-full">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Editar Perfil' : 'Meu Perfil' }}</h3>
            <div class="header-actions-modal">
              <button v-if="!isEditing" @click="startEdit" class="btn-text">
                Editar
              </button>
              <button @click="closeProfile" class="close-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="modal-body profile-body">
            <!-- Profile View -->
            <div v-if="!isEditing" class="profile-view">
              <div class="profile-hero">
<div class="avatar-container" :class="{ 'avatar-gold': isAvatarGoldEquipped }">
  <img :src="currentUser.avatar" alt="Profile" class="profile-avatar-large">
  <div class="online-status"></div>
</div>
                <h2>{{ currentUser.name }}, {{ currentUser.age }}</h2>
                <p class="profile-bio">{{ currentUser.bio }}</p>
                <p v-if="currentUser.location" class="profile-location">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {{ currentUser.location }}
                </p>
              </div>

              <div class="stats-grid">
                <div class="stat-card">
                  <span class="stat-number">{{ likedSongs.length }}</span>
                  <span class="stat-label">Músicas Curtidas</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">{{ favorites.length }}</span>
                  <span class="stat-label">Favoritos</span>
                </div>
                <div class="stat-card">
                  <span class="stat-number">{{ matches.length }}</span>
                  <span class="stat-label">Matches</span>
                </div>
              </div>

              <div class="music-preferences">
                <h4>Preferências Musicais</h4>
                <div class="genres-cloud">
                  <span
                    v-for="genre in favoriteGenreObjects"
                    :key="genre._id"
                    class="genre-cloud-tag"
                    :style="{ background: genre.color }"
                  >
                    <span v-html="genre.icon"></span> {{ genre.nome }}
                  </span>
                </div>
              </div>

              <div class="recent-likes" v-if="favorites.length > 0">
                <div class="recent-likes-header">
                  <h4>
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="vertical-align: middle; margin-right: 4px;">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
  Favoritos
</h4>
                  <span class="likes-count">{{ favorites.length }} música{{ favorites.length !== 1 ? 's' : '' }}</span>
                </div>
                <div class="mini-song-list">
                  <div v-for="song in [...favorites].reverse()" :key="song.id" class="mini-song">
                    <div class="mini-cover">
                      <img :src="song.album?.cover_small || song.cover" alt="cover" width="40" height="40" style="border-radius: 6px; object-fit: cover;">
                    </div>
                    <div class="mini-info">
                      <span class="mini-title">{{ song.title }}</span>
                      <span class="mini-artist">{{ song.artist?.name || song.artist }}</span>
                    </div>
                    <button
                      class="unlike-btn favorite-active"
                      @click="removeFavorite(song)"
                      title="Remover dos favoritos"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="recent-likes" v-if="likedSongs.length > 0">
                <div class="recent-likes-header">
                  <h4>Curtidas Recentes</h4>
                  <span class="likes-count">{{ likedSongs.length }} música{{ likedSongs.length !== 1 ? 's' : '' }}</span>
                </div>
                <div class="mini-song-list">
                  <div v-for="song in [...likedSongs].reverse()" :key="song.id" class="mini-song">
                    <div class="mini-cover">
                      <img :src="song.album?.cover_small || song.cover" alt="cover" width="40" height="40" style="border-radius: 6px; object-fit: cover;">
                    </div>
                    <div class="mini-info">
                      <span class="mini-title">{{ song.title }}</span>
                      <span class="mini-artist">{{ song.artist?.name || song.artist }}</span>
                    </div>
                    <button
                      class="unlike-btn"
                      @click="unlikeSong(song)"
                      title="Remover curtida"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="logout-section">
                <button @click="confirmLogout" class="btn-logout">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Sair da conta
                </button>
               
                <button @click="confirmDeleteAccount" class="btn-delete-account">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  Excluir conta
                </button>
              </div>
            </div>

            <!-- Profile Edit -->
            <div v-else class="profile-edit">
              <div class="edit-section">
                <label>Foto de Perfil</label>
                <div class="avatar-edit">
                  <img :src="editForm.avatar" alt="Preview" class="avatar-preview">
                  <button class="change-photo-btn" @click="triggerFileInput">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3zm3 6V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3zm7 9c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-3.2-5c0 1.77 1.43 3.2 3.2 3.2s3.2-1.43 3.2-3.2-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2z"/>
                    </svg>
                    Alterar foto
                  </button>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="handleFileChange"
                    class="hidden-input"
                  >
                </div>
              </div>

              <div class="edit-section">
                <label for="edit-name">Nome</label>
                <input
                  id="edit-name"
                  v-model="editForm.name"
                  type="text"
                  class="edit-input"
                  placeholder="Seu nome"
                >
              </div>

              <div class="edit-row">
                <div class="edit-section half">
                  <label for="edit-age">Idade</label>
                  <input
                    id="edit-age"
                    v-model.number="editForm.age"
                    type="number"
                    min="18"
                    max="100"
                    class="edit-input"
                  >
                </div>
                <div class="edit-section half">
                  <label for="edit-location">Localização</label>
                  <input
                    id="edit-location"
                    v-model="editForm.location"
                    type="text"
                    class="edit-input"
                    placeholder="Cidade, Estado"
                  >
                </div>
              </div>

              <div class="edit-section">
                <label for="edit-bio">Bio</label>
                <textarea
                  id="edit-bio"
                  v-model="editForm.bio"
                  class="edit-textarea"
                  rows="3"
                  placeholder="Conte sobre você e seus gostos musicais..."
                  maxlength="150"
                ></textarea>
                <span class="char-count">{{ editForm.bio.length }}/150</span>
              </div>

              <div class="edit-actions">
                <button @click="cancelEdit" class="btn-secondary">Cancelar</button>
                <button @click="saveProfile" class="btn-primary" :disabled="!isFormValid">
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ============================================ -->
    <!-- LOGOUT CONFIRMATION MODAL                    -->
    <!-- ============================================ -->
    <Transition name="modal">
      <div v-if="showLogoutConfirm" class="modal-overlay logout-confirm-overlay" @click.self="cancelLogout">
        <div class="modal-content logout-confirm-modal">
          <div class="logout-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h3>Sair da conta?</h3>
          <p>Você precisará fazer login novamente para acessar seu perfil e matches.</p>
          <div class="logout-actions">
            <button @click="cancelLogout" class="btn-secondary">Cancelar</button>
            <button @click="logout" class="btn-logout-confirm">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Sair
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ============================================ -->
    <!-- DELETE ACCOUNT CONFIRMATION MODAL            -->
    <!-- ============================================ -->
    <Transition name="modal">
      <div v-if="showDeleteAccountConfirm" class="modal-overlay logout-confirm-overlay" @click.self="cancelDeleteAccount">
        <div class="modal-content logout-confirm-modal">
          <div class="logout-icon" style="background: rgba(220, 38, 38, 0.1); color: #dc2626;">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </div>
          <h3>Excluir conta?</h3>
          <p>Esta ação é <strong>irreversível</strong>. Todos os seus dados, curtidas, favoritos e matches serão permanentemente apagados.</p>
          <div class="logout-actions">
            <button @click="cancelDeleteAccount" class="btn-secondary">Cancelar</button>
            <button @click="deleteAccount" class="btn-logout-confirm" style="background: #dc2626;" :disabled="deletingAccount">
              <span v-if="deletingAccount">Excluindo...</span>
              <span v-else>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Excluir Conta
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ============================================ -->
    <!-- MATCH NOTIFICATION TOAST                     -->
    <!-- ============================================ -->
    <Transition name="toast">
      <div v-if="showMatchNotification" class="match-toast">
        <div class="match-toast-content">
          <div class="match-avatars-toast">
            <img :src="currentUser.avatar" alt="You">
            <img :src="lastMatch?.user.avatar" alt="Match">
          </div>
          <div class="match-toast-text">
           <h4>
  It's a Musical Match!
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="vertical-align: middle; margin-left: 4px;">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
</h4>
            <p>Você e {{ lastMatch?.user.name }} curtiram as mesmas músicas</p>
          </div>
          <button @click="viewMatch" class="btn-primary-small">Ver</button>
        </div>
      </div>
    </Transition>

    <!-- ============================================ -->
    <!-- FAVORITE TOAST                               -->
    <!-- ============================================ -->
    <Transition name="toast">
      <div v-if="showFavoriteToast" class="match-toast favorite-toast">
        <div class="match-toast-content">
          <div class="match-toast-text">
            <h4>
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="vertical-align: middle; margin-right: 4px;">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
  Adicionado aos Favoritos!
</h4>
            <p>{{ lastFavorited?.title }} foi salva nos seus favoritos</p>
          </div>
          <button @click="showFavoriteToast = false" class="btn-primary-small">OK</button>
        </div>
      </div>
    </Transition>

  <!-- ============================================ -->
    <!-- CHAT LIST MODAL                              -->
    <!-- ============================================ -->
    <Transition name="modal">
      <div v-if="showChatList" class="modal-overlay chat-list-overlay" @click.self="closeChatList">
        <div class="modal-content chat-list-modal">
          <div class="chat-list-header">
            <div class="chat-list-title">
              <h3>Mensagens</h3>
              <span v-if="totalUnread > 0" class="unread-badge">{{ totalUnread }}</span>
            </div>
            <button @click="closeChatList" class="close-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <div class="chat-list-body">
            <div v-if="chats.length === 0" class="empty-chats">
              <div class="empty-chat-icon">
  <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
  </svg>
</div>
              <h4>Nenhuma conversa ainda</h4>
              <p>Curta músicas e faça matches para começar a conversar!</p>
            </div>

            <div v-else class="chat-items">
              <div
                v-for="chat in chats"
                :key="chat.id"
                class="chat-item"
                :class="{ unread: chat.unreadCount > 0 }"
                @click="openChat(chat)"
              >
                <div class="chat-avatar">
                  <img :src="chat.user.avatar" :alt="chat.user.name">
                  <div v-if="chat.unreadCount > 0" class="online-dot"></div>
                </div>
                <div class="chat-info">
                  <div class="chat-row">
                    <div class="chat-name-group">
                      <h4 class="chat-name">{{ chat.user.name }}</h4>
                      <span v-if="chat.silenciado" class="chat-muted-badge" title="Chat silenciado">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      </span>
                      <button
                        class="chat-delete-inline-btn"
                        @click.stop="abrirModalExcluirChat(chat)"
                        title="Excluir chat"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                    <span class="chat-time">{{ formatChatTime(chat.ultimaData) }}</span>
                  </div>
                  <div class="chat-row">
                    <p class="chat-preview">
                      {{ chat.bloqueado ? 'Usuário bloqueado' : chat.ultimaMensagem }}
                    </p>
                    <span v-if="chat.unreadCount > 0" class="unread-count">{{ chat.unreadCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ============================================ -->
    <!-- CHAT CONVERSATION MODAL (Whatsapp style)     -->
    <!-- ============================================ -->
    <Transition name="chat-slide">
      <div v-if="showChat" class="chat-overlay" @click.self="closeChat">
        <div class="chat-container">
          <!-- Chat Header -->
          <div class="chat-header">
            <button @click="closeChat" class="chat-back-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <div class="chat-user-info">
              <img :src="activeChatUser?.avatar" :alt="activeChatUser?.name" class="chat-user-avatar">
              <div class="chat-user-details">
                <h4>{{ activeChatUser?.name }}</h4>
                <span class="chat-status">online</span>
              </div>
            </div>
            <div class="chat-menu-container">
              <button class="chat-menu-btn" @click="showChatMenu = !showChatMenu">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div v-if="showChatMenu" class="chat-dropdown-menu">
                <button @click="limparChat" class="dropdown-item">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  <span>Limpar conversa</span>
                </button>
                <button @click="silenciarChat" class="dropdown-item">
                  <svg v-if="!chatSilenciado" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71 0 1.5-.37 2.91-1.03 4.15l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l5.73 5.73 1.27-1.27L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                  <span>{{ chatSilenciado ? 'Dessilenciar chat' : 'Silenciar chat' }}</span>
                </button>
<button
  v-if="!chatBloqueado || !bloqueadoPorMim"
  @click="abrirModalBloqueio"
  class="dropdown-item danger"
>
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
  </svg>
  <span>Bloquear</span>
</button>

<button
  v-else
  @click="desbloquearUsuario"
  class="dropdown-item"
  :disabled="unblockingUser"
>
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
  </svg>
  <span>{{ unblockingUser ? 'Desbloqueando...' : 'Desbloquear' }}</span>
</button>
                <button @click="denunciarChat" class="dropdown-item danger">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
                  </svg>
                  <span>Denunciar</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div class="chat-messages" ref="chatMessagesRef" id="chat-messages-container">
            <!-- Blocked State -->
            <div v-if="chatBloqueado" class="chat-blocked-state">
              <div class="chat-blocked-icon">
  <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
  </svg>
</div>
              <h4>{{ bloqueadoPorMim ? 'Usuário bloqueado' : 'Você foi bloqueado' }}</h4>
              <p v-if="bloqueadoPorMim">
                As mensagens foram ocultadas e você não pode mais enviar mensagens para esta pessoa.
              </p>
              <p v-else>
                Esta conversa está indisponível porque este usuário bloqueou você.
              </p>
            </div>

            <!-- Empty State -->
            <div v-else-if="chatMessages.length === 0" class="chat-welcome">
              <div class="empty-chat-content">
                <div class="empty-chat-icon">
  <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
</div>
                <h4>Comece a conversa</h4>
                <p>Envie uma mensagem para iniciar o chat</p>
              </div>
            </div>

            <!-- Messages List -->
            <div
              v-for="(msg, index) in chatMessages"
              :key="msg.id"
              class="message"
              :class="{
                'message-sent': msg.remetente === currentUserId,
                'message-received': msg.remetente !== currentUserId,
                'message-musica': msg.tipo === 'musica'
              }"
            >
              <!-- Music Message -->
              <div v-if="msg.tipo === 'musica'" class="musica-card">
                <img :src="msg.musica?.cover" alt="cover" class="musica-cover">
                <div class="musica-info">
                  <span class="musica-title">{{ msg.musica?.title }}</span>
                  <span class="musica-artist">{{ msg.musica?.artist }}</span>
                </div>
                <button v-if="msg.musica?.preview" @click="playPreview(msg.musica)" class="musica-play">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>

              <!-- Audio Message -->
              <div v-else-if="msg.tipo === 'audio'" class="audio-message">
                <button @click="tocarAudio(msg)" class="audio-play-btn">
                  <svg v-if="audioTocando !== msg.id" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                </button>
                <div class="audio-wave">
                  <div v-for="n in 20" :key="n" class="wave-bar" :style="{ height: Math.random() * 20 + 5 + 'px' }"></div>
                </div>
                <span class="audio-duration">{{ formatarTempoAudio(msg.duracao || 0) }}</span>
              </div>

              <!-- Image Message -->
              <div v-else-if="msg.tipo === 'imagem'" class="image-message">
                <img
                  :src="getFullUrl(msg.arquivo?.url)"
                  alt="Foto"
                  class="chat-image"
                  @click="abrirImagem(msg)"
                  @error="handleImageError($event, msg)"
                >
              </div>

              <!-- File Message -->
              <div v-else-if="msg.tipo === 'arquivo'" class="file-message">
                <div class="file-icon">
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
  </svg>
</div>
                <div class="file-info">
                  <span class="file-name">{{ msg.arquivo?.nome || 'Arquivo' }}</span>
                  <span class="file-size">{{ formatarTamanhoArquivo(msg.arquivo?.tamanho) }}</span>
                </div>
                <a :href="getFullUrl(msg.arquivo?.url)" target="_blank" download class="file-download">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                  </svg>
                </a>
              </div>

              <!-- Text Message -->
              <p v-else class="message-text">{{ msg.conteudo }}</p>

             <div class="message-meta">
  <span class="message-time">{{ formatChatTime(msg.createdAt) }}</span>
 
  <!-- Botão de apagar mensagem (apenas para mensagens enviadas pelo usuário) -->
  <button
    v-if="msg.remetente === currentUserId"
    class="delete-msg-btn"
    @click="abrirModalDeletarMensagem(msg)"
    title="Apagar mensagem"
  >
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  </button>
 
  <span v-if="msg.remetente === currentUserId" class="message-status">
    <svg v-if="msg.lida" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" class="read">
      <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
    </svg>
  </span>
</div>
            </div>
          </div>

          <!-- Media Preview Bar -->
          <div v-if="showPreviewMidia" class="media-preview-bar">
            <div class="preview-content">
              <img v-if="previewMidia.tipo === 'imagem'" :src="previewMidia.url" class="preview-image">
              <div v-else class="preview-file">
                <span class="file-icon-preview">
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
  </svg>
</span>
                <div class="preview-file-info">
                  <span class="preview-file-name">{{ previewMidia.nome }}</span>
                  <span class="preview-file-size">{{ formatarTamanhoArquivo(previewMidia.tamanho) }}</span>
                </div>
              </div>
            </div>
            <div class="preview-actions">
              <button @click="cancelarPreview" class="preview-btn cancel">✕</button>
              <button @click="confirmarEnvioMidia" class="preview-btn send">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Blocked Input State -->
          <div v-if="chatBloqueado" class="chat-input-blocked">
            <span v-if="bloqueadoPorMim">Você bloqueou este usuário</span>
            <span v-else>Você não pode responder nesta conversa</span>
          </div>

          <!-- Chat Input Area (only when not blocked) -->
          <div v-else class="chat-input-area">
            <!-- Emoji Picker Overlay -->
            <div v-if="showEmojiPicker" class="emoji-overlay" @click.self="closeEmojiPicker">
              <div class="emoji-picker-premium">
                <div class="picker-header">
                  <div class="picker-title">
                   <span class="picker-icon">
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
  </svg>
</span>
                    <div class="picker-text">
                      <h4>Escolha um Emoji</h4>
                      <p>Clique para selecionar</p>
                    </div>
                  </div>
                  <button @click="closeEmojiPicker" class="btn-close-picker">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <div class="picker-categories">
                  <button
                    v-for="cat in emojiCategories"
                    :key="cat.name"
                    @click="activeEmojiCategory = cat.name"
                    :class="{ active: activeEmojiCategory === cat.name }"
                    class="category-tab"
                    :title="cat.name"
                  >
                    <span class="cat-icon">{{ cat.icon }}</span>
                    <span class="cat-name">{{ cat.name }}</span>
                  </button>
                </div>

                <div class="picker-emojis-container">
                  <div class="emoji-grid-premium">
                    <button
                      v-for="emoji in filteredChatEmojis"
                      :key="emoji"
                      @click="insertEmoji(emoji)"
                      class="emoji-btn-premium"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                </div>

                <div class="picker-footer">
                  <span class="selected-preview">{{ emojiSearch || 'Nenhum' }}</span>
                  <button @click="closeEmojiPicker" class="btn-done">Concluir</button>
                </div>
              </div>
            </div>

            <!-- Emoji Button -->
            <button class="chat-emoji-btn" @click="toggleEmojiPicker" :class="{ active: showEmojiPicker }">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
            </button>

            <!-- Attach Button -->
            <button class="chat-attach-btn" @click="showAttachMenu = !showAttachMenu">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
              </svg>
            </button>

            <!-- Input Wrapper -->
            <div class="chat-input-wrapper">
              <!-- Text Input or Recording -->
              <template v-if="!gravandoAudio">
                <input
                  v-model="novaMensagem"
                  type="text"
                  class="chat-input"
                  placeholder="Mensagem..."
                  @keyup.enter="enviarMensagem"
                  ref="chatInputRef"
                >
              </template>
              <template v-else>
                <div class="audio-recording">
                  <div class="recording-dot"></div>
                  <span class="recording-time">{{ formatarTempoAudio(tempoGravacao) }}</span>
                  <span class="recording-label">Gravando...</span>
                </div>
              </template>

              <!-- Send Button (when text exists) -->
              <button v-if="novaMensagem.trim() && !gravandoAudio" @click="enviarMensagem" class="chat-send-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
             
              <!-- Mic Button (when no text) -->
              <button
                v-else-if="!gravandoAudio"
                class="chat-mic-btn"
                @mousedown="iniciarGravacao"
                @touchstart.prevent="iniciarGravacao"
                @mouseup="pararGravacao"
                @touchend.prevent="pararGravacao"
                @mouseleave="cancelarGravacao"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>

              <!-- Cancel Recording -->
              <button
                v-if="gravandoAudio"
                @click="cancelarGravacao"
                class="chat-cancel-audio"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>

              <!-- Confirm Recording -->
              <button
                v-if="gravandoAudio"
                @click="pararGravacao"
                class="chat-send-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Attach Menu -->
          <div v-if="showAttachMenu" class="attach-menu">
            <button @click="selecionarFoto" class="attach-option">
              <span class="attach-icon">
</span>
              <span>Foto</span>
            </button>
           
            <button @click="selecionarArquivo" class="attach-option">
             <span class="attach-icon">
</span>
              <span>Arquivo</span>
            </button>
          </div>

          <!-- Hidden File Inputs -->
          <input
            ref="fileInputFoto"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            class="hidden-input"
            @change="(e) => onFileSelected(e, 'imagem')"
          />

          <input
            ref="fileInputArquivo"
            type="file"
            accept=".pdf,.txt,.doc,.docx"
            class="hidden-input"
            @change="(e) => onFileSelected(e, 'arquivo')"
          />
 <!-- ============================================ -->
          <!-- DELETE MESSAGE CONFIRMATION MODAL            -->
          <!-- ============================================ -->
          <Transition name="modal">
            <div v-if="showDeleteMessageConfirm" class="modal-overlay logout-confirm-overlay" @click.self="cancelarDeletarMensagem">
              <div class="modal-content logout-confirm-modal">
                <div class="logout-icon" style="background: rgba(220, 38, 38, 0.1); color: #dc2626;">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </div>
                <h3>Apagar mensagem?</h3>
                <p>Esta ação é <strong>irreversível</strong>. A mensagem será removida permanentemente.</p>
                <div class="logout-actions">
                  <button @click="cancelarDeletarMensagem" class="btn-secondary">Cancelar</button>
                  <button @click="confirmarDeletarMensagem" class="btn-logout-confirm" style="background: #dc2626;" :disabled="deletingMessage">
                    <span v-if="deletingMessage">Apagando...</span>
                    <span v-else>Apagar</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>

           <!-- ============================================ -->
    <!-- BLOCK USER CONFIRMATION MODAL                -->
    <!-- ============================================ -->
    <Transition name="modal">
      <div v-if="showBlockConfirm" class="modal-overlay logout-confirm-overlay" @click.self="cancelarModalBloqueio">
        <div class="modal-content logout-confirm-modal">
          <div class="logout-icon" style="background: rgba(220, 38, 38, 0.1); color: #dc2626;">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
            </svg>
          </div>

          <h3>Bloquear usuário?</h3>
          <p>
            As mensagens desta conversa serão ocultadas e você não poderá mais enviar novas mensagens.
          </p>

          <div class="logout-actions">
            <button @click="cancelarModalBloqueio" class="btn-secondary">Cancelar</button>
            <button @click="confirmarBloqueioUsuario" class="btn-logout-confirm" style="background: #dc2626;" :disabled="blockingUser">
              <span v-if="blockingUser">Bloqueando...</span>
              <span v-else>Bloquear</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
        </div>
      </div>
    </Transition>

    <!-- ============================================ -->
    <!-- DELETE CHAT CONFIRMATION MODAL               -->
    <!-- ============================================ -->
    <Transition name="modal">
      <div v-if="showDeleteChatConfirm" class="modal-overlay logout-confirm-overlay" @click.self="cancelarExcluirChat">
        <div class="modal-content logout-confirm-modal">
          <div class="logout-icon" style="background: rgba(220, 38, 38, 0.1); color: #dc2626;">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </div>

          <h3>Excluir chat?</h3>
          <p>
            Esta conversa com <strong>{{ chatToDelete?.user?.name }}</strong> será removida da sua lista.
          </p>

          <div class="logout-actions">
            <button @click="cancelarExcluirChat" class="btn-secondary">Cancelar</button>
            <button @click="confirmarExcluirChat" class="btn-logout-confirm" style="background: #dc2626;" :disabled="deletingChat">
              <span v-if="deletingChat">Excluindo...</span>
              <span v-else>Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  <Transition name="toast">
  <div v-if="toast.show" class="toast-notification" :class="`toast-${toast.type}`">
    <div class="toast-icon">
      <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <svg v-else-if="toast.type === 'warning'" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
    </div>
    <div class="toast-content">
      <h4 v-if="toast.title" class="toast-title">{{ toast.title }}</h4>
      <p class="toast-message">{{ toast.message }}</p>
    </div>
    <button @click="hideToast" class="toast-close">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  </div>
</Transition>
    <!-- ============================================ -->
    <!-- LOGIN MODAL                                  -->
    <!-- ============================================ -->
    <Transition name="modal">
      <div v-if="showLoginModal" class="modal-overlay login-confirm-overlay" @click.self="closeLoginModal">
        <div class="modal-content login-confirm-modal">
          <div class="login-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
         
          <h3>Entrar na conta</h3>
          <p>Digite seu nome de usuário para verificar se você já tem uma conta.</p>
         
          <div class="login-form-group">
            <input
              v-model="loginUsername"
              type="text"
              class="login-input"
              placeholder="Nome de usuário"
              @keyup.enter="verifyAndLogin"
              ref="loginInputRef"
            >
          </div>
         
          <p v-if="loginError" class="login-error">{{ loginError }}</p>
          <p v-if="loginSuccess" class="login-success">Conta encontrada! Entrando...</p>
          <div v-if="!loginError && !loginSuccess" class="login-info-alert">
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
  <span>Digite seu nome exato para verificar se já possui uma conta</span>
</div>
         
          <div class="login-actions">
            <button @click="closeLoginModal" class="btn-secondary">Cancelar</button>
            <button
              @click="verifyAndLogin"
              class="btn-login-confirm"
              :disabled="!loginUsername.trim() || loginLoading"
            >
              <span v-if="loginLoading">Verificando...</span>
              <span v-else>Entrar</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
    <!-- ============================================ -->
<!-- REPORT USER MODAL                              -->
<!-- ============================================ -->
<Transition name="modal">
  <div v-if="showReportModal" class="modal-overlay logout-confirm-overlay" @click.self="showReportModal = false">
    <div class="modal-content logout-confirm-modal">
      <div class="logout-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
        <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
        </svg>
      </div>
      <h3>Denunciar usuário</h3>
      <p>Descreva o motivo da denúncia. Sua identidade será mantida em sigilo.</p>
      
      <div class="login-form-group" style="margin: 1rem 0;">
        <textarea
          v-model="reportMotivo"
          class="login-input"
          placeholder="Ex: Spam, comportamento inadequado, conteúdo ofensivo..."
          rows="3"
          style="resize: none; text-align: left; padding: 1rem;"
        ></textarea>
      </div>
      
      <div class="logout-actions">
        <button @click="showReportModal = false" class="btn-secondary">Cancelar</button>
        <button 
          @click="confirmarDenuncia" 
          class="btn-logout-confirm" 
          style="background: #f59e0b;"
        >
          Enviar denúncia
        </button>
      </div>
    </div>
  </div>
</Transition>

  </div>   <!-- ← fecha a div raiz .musical-match -->
</template>

    <script>
    import api from '@/services/api'
    import axios from 'axios'
// No topo do <script>, antes de export default
const EMOJI_DATA = {
  'Recentes': ['🎵', '🎧', '🎸', '🎹', '🥁', '🎺', '🎻', '🎬', '🎮', '🎲'],
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳'],
  'Música': ['🎵', '🎶', '🎼', '🎹', '🥁', '🎸', '🎻', '🎺', '🎷', '🎤', '🎧', '📻', '🎙️', '📢', '📣', '🔔', '🎚️', '🎛️', '🎙️'],
  'Natureza': ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌵', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🍄', '🌾', '💐', '🌊', '🔥', '⚡', '❄️', '☃️', '⛄', '🌈', '☀️', '🌤️', '⛅'],
  'Comida': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🍍', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🍔', '🍕', '🌭'],
  'Atividades': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷'],
  'Viagem': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟'],
  'Objetos': ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️'],
  'Símbolos': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'],
  'Flags': ['🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🇺🇳', '🇦🇺', '🇧🇷', '🇨🇦', '🇨🇳', '🇩🇪', '🇪🇸', '🇫🇷', '🇬🇧', '🇮🇳', '🇮🇹', '🇯🇵', '🇰🇷', '🇲🇽', '🇷🇺', '🇺🇸', '🇿🇦']
}

    export default {
      name: 'MusicalMatch',

      data() {
        return {
          hasProfile: false,
          onboardingStep: 1,
          creatingProfile: false,
          showEmojiPicker: false,
                    showLoginModal: false,
                    showReportModal: false,
reportMotivo: '',
          loginUsername: '',
          loginError: '',
          loginSuccess: false,
          loginLoading: false,
emojiSearch: '',
activeEmojiCategory: 'Recentes',
emojiCategories: [
  { name: 'Recentes', icon: '🕐' },
  { name: 'Smileys', icon: '😀' },
  { name: 'Música', icon: '🎵' },
  { name: 'Natureza', icon: '🌸' },
  { name: 'Comida', icon: '🍎' },
  { name: 'Atividades', icon: '⚽' },
  { name: 'Viagem', icon: '🚗' },
  { name: 'Objetos', icon: '💻' },
  { name: 'Símbolos', icon: '❤️' },
  { name: 'Flags', icon: '🏳️' }
],
          onboardingData: {
            name: '',
            age: null,
            location: '',
            avatar: '',
            bio: '',
            favoriteGenres: []
          },

          availableGenres: [],
          loadingGenres: false,

           toast: {
      show: false,
      type: 'success', // success | error | warning | info
      title: '',
      message: '',
      timer: null
    },

          currentIndex: 0,
          dragOffset: 0,
          dragStartX: 0,
          isDragging: false,
          swipingLeft: false,
          swipingRight: false,

          chatBloqueado: false,
bloqueadoPorMim: false,
bloqueadoPorOutro: false,
unblockingUser: false,

showBlockConfirm: false,
blockingUser: false,

showDeleteChatConfirm: false,
deletingChat: false,
chatToDelete: null,
isAvatarGoldEquipped: false,

          showMatches: false,
          showProfile: false,
          isEditing: false,
          showMatchNotification: false,
          showFavoriteToast: false,
          showLogoutConfirm: false,
showDeleteAccountConfirm: false,  // ← ADICIONAR
deletingAccount: false,  
gravandoAudio: false,
audioRecorder: null,
audioChunks: [],
tempoGravacao: 0,
intervaloGravacao: null,
    showChatMenu: false,
    chatSilenciado: false,
    gravandoAudio: false,
    audioRecorder: null,
    audioChunks: [],
    tempoGravacao: 0,
    intervaloGravacao: null,
    audioTocando: null,
    audioPlayer: null,
    previewMidia: null,        // { tipo: 'imagem'|'arquivo', file: File, url: string, nome: string, tamanho: number }
showPreviewMidia: false,

          unreadMatches: 0,
          currentPlaying: null,
          progress: 0,
          currentTime: 0,
          progressInterval: null,
          lastMatch: null,
          lastFavorited: null,
          loading: true,
          audio: null,
          showDeleteMessageConfirm: false,
    deletingMessage: false,
    messageToDelete: null,

           showChatList: false,
    showChat: false,
    chats: [],
    hasChatsLoaded: false,
    activeChat: null,
    activeChatUser: null,
    chatMessages: [],
    novaMensagem: '',
    showAttachMenu: false,
    currentUserId: null,
    chatPollingInterval: null,

          currentUser: {
            name: '',
            age: null,
            avatar: '',
            bio: '',
            location: '',
            favoriteGenres: []
          },

          editForm: {
            name: '',
            age: null,
            bio: '',
            location: '',
            avatar: ''
          },

          songs: [],
          likedSongs: [],
          favorites: [],
          matches: []
        }
      },

      computed: {
        filteredChatEmojis() {
  const emojis = EMOJI_DATA[this.activeEmojiCategory] || []
  if (!this.emojiSearch) return emojis
 
  const search = this.emojiSearch.toLowerCase()
  return Object.values(EMOJI_DATA).flat().filter(emoji => {
    return emoji.includes(search)
  })
},
         totalUnread() {
    return this.chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0)
  },

        sourceBadge() {
  const song = this.currentSong
  if (!song) return null

  const badges = {
    database: { text: 'Banco', color: '#1db954', icon: '<i class="fas fa-database"></i>' },
    deezer: { text: 'Deezer', color: '#ff0092', icon: '<i class="fas fa-music"></i>' },
    spotify: { text: 'Spotify', color: '#1ed760', icon: '<i class="fas fa-headphones"></i>' }
  }

  return badges[song.source] || { text: 'Desconhecido', color: '#666', icon: '<i class="fas fa-question"></i>' }
},
        favoriteGenreObjects() {
          return this.availableGenres.filter(g =>
            this.currentUser.favoriteGenres?.includes(g._id)
          )
        },

        visibleSongs() {
          return this.songs.slice(this.currentIndex, this.currentIndex + 3)
        },

        currentSong() {
          return this.songs[this.currentIndex]
        },

        topGenres() {
          const genres = {}
          this.likedSongs.forEach(song => {
            const genre = song.album?.title || song.genre || 'Pop'
            genres[genre] = (genres[genre] || 0) + 1
          })

          return Object.entries(genres)
            .map(([name, count]) => ({
              name,
              weight: Math.min(count * 0.15 + 0.4, 1),
              count
            }))
            .sort((a, b) => b.weight - a.weight)
        },

        isFormValid() {
          return this.editForm.name.trim().length >= 2 &&
            this.editForm.age >= 18 &&
            this.editForm.age <= 100 &&
            this.editForm.bio.trim().length > 0
        },
canProceedStep2() {
  return this.onboardingData.name.trim().length >= 2 &&
    this.onboardingData.age >= 18 &&
    this.onboardingData.age <= 100 &&
    this.onboardingData.location.trim().length >= 3  // ← ADICIONAR
},

        canProceedStep2() {
          return this.onboardingData.name.trim().length >= 2 &&
            this.onboardingData.age >= 18 &&
            this.onboardingData.age <= 100
        },

        canFinish() {
          return this.onboardingData.bio.trim().length >= 10 &&
            this.onboardingData.favoriteGenres.length > 0
        }
      },

async mounted() {
  // ✅ Verifica se usuário saiu do Musical Match
  const matchLoggedIn = localStorage.getItem('musicalMatchLoggedIn')
  if (matchLoggedIn === 'false') {
    this.hasProfile = false
    this.loading = false
    // NÃO chama bootstrapUser() — usuário escolheu sair
    localStorage.removeItem('musicalMatchLoggedIn')
    await this.fetchGenres() // Só carrega gêneros para onboarding
    return
  }
  
  await this.fetchGenres()
  await this.bootstrapUser()
     await this.buscarChats()
      const savedGoldState = localStorage.getItem('soundup_avatar_gold_equipped');
  if (savedGoldState !== null) {
    this.isAvatarGoldEquipped = savedGoldState === 'true';
  }
 
  // Listener para mudanças
  window.addEventListener('avatar-gold-changed', this.handleAvatarGoldChanged);
  },

      methods: {
                // ========== LOGIN MODAL ==========
        openLoginModal() {
          this.showLoginModal = true
          this.loginUsername = ''
          this.loginError = ''
          this.loginSuccess = false
          this.loginLoading = false
          this.$nextTick(() => {
            this.$refs.loginInputRef?.focus()
          })
        },

        closeLoginModal() {
          this.showLoginModal = false
          this.loginUsername = ''
          this.loginError = ''
          this.loginSuccess = false
          this.loginLoading = false
        },

async verifyAndLogin() {
   const username = this.loginUsername.trim()
 
  // ✅ BLOQUEIO: Verifica se conta foi excluída
  const accountDeleted = localStorage.getItem('musicalMatchAccountDeleted')
  if (accountDeleted === 'true') {
    this.loginError = 'Esta conta foi excluída. Crie uma nova conta para continuar.'
    this.loginLoading = false
    return
  }
 
  // ✅ ALERTA DE VALIDAÇÃO — antes de chamar a API
  if (!username) {
    this.loginError = 'Digite um nome de usuário'
    return
  }

  if (username.length < 2) {
    this.loginError = 'Nome muito curto (mínimo 2 caracteres)'
    return
  }

  this.loginLoading = true
  this.loginError = ''
  this.loginSuccess = false

  try {
    // 1. Buscar usuário pelo nome (rota agora é pública)
    const { data } = await api.get('/usuarios/buscar', {
      params: { nome: username }
    })

    const user = data.user || data.usuario || data

    // ✅ ALERTA: Conta NÃO encontrada
    if (!user || !user._id) {
      this.loginError = 'Conta não encontrada. Verifique o nome ou crie uma nova conta.'
      this.loginLoading = false
      return
    }

    // 2. Verificar se existe token no localStorage (de outra sessão)
    const token = localStorage.getItem('token')
   
    // ✅ ALERTA: Conta existe mas usuário precisa fazer login no app principal
    if (!token) {
      this.loginError = `Conta \"${user.nome || username}\" encontrada! Faça login no app principal primeiro para sincronizar.`
      this.loginLoading = false
      return
    }

            // Salvar dados do usuário
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('usuario', JSON.stringify(user))

            // 3. Atualizar estado do componente
            this.currentUser = this.mapApiUserToCurrentUser(user)
            this.hasProfile = true
            this.showLoginModal = false

            // 4. Carregar dados do usuário
            await Promise.all([
              this.buscarCurtidas(),
              this.buscarFavoritos(),
              this.buscarMatches()
            ])
            await this.buscarSugestoes()

            this.showToast({
              type: 'success',
              title: 'Bem-vindo de volta!',
              message: `Você entrou como ${user.nome || username}`
            })

          } catch (error) {
            console.error('Erro ao verificar conta:', error)
            if (error.response?.status === 404) {
              this.loginError = 'Conta não encontrada. Verifique o nome ou crie uma nova conta.'
            } else {
              this.loginError = error.response?.data?.error || 'Erro ao verificar conta. Tente novamente.'
            }
          } finally {
            this.loginLoading = false
          }
        },

        abrirModalDeletarMensagem(msg) {
    this.messageToDelete = msg
    this.showDeleteMessageConfirm = true
  },
 
  cancelarDeletarMensagem() {
    this.showDeleteMessageConfirm = false
    this.messageToDelete = null
  },
 
  async confirmarDeletarMensagem() {
    if (!this.messageToDelete || !this.activeChat) return
   
    try {
      this.deletingMessage = true
     
      await api.delete(`/chats/${this.activeChat.id}/mensagens/${this.messageToDelete.id}`)
     
      // Remove da lista local
      this.chatMessages = this.chatMessages.filter(m => m.id !== this.messageToDelete.id)
     
      this.showDeleteMessageConfirm = false
      this.messageToDelete = null
     
      this.showToast({
        type: 'success',
        title: 'Mensagem apagada',
        message: 'Mensagem removida com sucesso'
      })
     
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error)
      this.showToast({
        type: 'error',
        title: 'Erro',
        message: error.response?.data?.error || 'Erro ao apagar mensagem'
      })
    } finally {
      this.deletingMessage = false
    }
  },
        // ADICIONAR nos methods:
checkBioLimit() {
  if (this.onboardingData.bio.length >= 150) {
    this.showToast({
      type: 'warning',
      title: 'Limite atingido',
      message: 'A bio tem o limite máximo de 150 caracteres.',
      duration: 3000
    })
  }
},
         handleAvatarGoldChanged(e) {
    this.isAvatarGoldEquipped = e.detail?.equipped || false;
  },

         showToast({ type = 'success', title = '', message = '', duration = 4000 }) {
    // Limpa timer anterior se existir
    if (this.toast.timer) {
      clearTimeout(this.toast.timer)
    }

    this.toast = {
      show: true,
      type,
      title,
      message,
      timer: null
    }

    // Auto-hide após duration
    this.toast.timer = setTimeout(() => {
      this.hideToast()
    }, duration)
  },

  hideToast() {
    this.toast.show = false
    if (this.toast.timer) {
      clearTimeout(this.toast.timer)
      this.toast.timer = null
    }
  },

        async desbloquearUsuario() {
  if (!this.activeChat) return

  try {
    this.unblockingUser = true

    const { data } = await api.post(`/chats/${this.activeChat.id}/desbloquear`)

    this.chatBloqueado = false
    this.bloqueadoPorMim = false
    this.bloqueadoPorOutro = false
    this.showChatMenu = false

    // Atualiza a lista de chats
    this.chats = this.chats.map(chat =>
      chat.id === this.activeChat.id
        ? {
            ...chat,
            bloqueado: false,
            bloqueadoPorMim: false,
            bloqueadoPorOutro: false,
            ultimaMensagem: 'Usuário desbloqueado',
            unreadCount: 0
          }
        : chat
    )

    // Recarrega as mensagens
    const { data: refreshData } = await api.get(`/chats/${this.activeChat.id}/mensagens`)
    this.chatMessages = refreshData.mensagens || []

this.showToast({
  type: 'success',
  title: 'Desbloqueado',
  message: data.message || 'Usuário desbloqueado com sucesso'
})

  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error)
this.showToast({
  type: 'error',
  title: 'Erro',
  message: error.response?.data?.error || 'Erro ao desbloquear usuário'
})
  } finally {
    this.unblockingUser = false
  }
},
        abrirModalBloqueio() {
  this.showChatMenu = false
  this.showBlockConfirm = true
},

cancelarModalBloqueio() {
  this.showBlockConfirm = false
},

async confirmarBloqueioUsuario() {
  if (!this.activeChat) return

  try {
    this.blockingUser = true

    const { data } = await api.post(`/chats/${this.activeChat.id}/bloquear`)

    this.showBlockConfirm = false
    this.chatBloqueado = true
    this.bloqueadoPorMim = true
    this.bloqueadoPorOutro = false
    this.chatMessages = []
    this.novaMensagem = ''
    this.showChatMenu = false

    this.chats = this.chats.map(chat =>
      chat.id === this.activeChat.id
        ? {
            ...chat,
            bloqueado: true,
            bloqueadoPorMim: true,
            bloqueadoPorOutro: false,
            ultimaMensagem: 'Usuário bloqueado',
            unreadCount: 0
          }
        : chat
    )

    this.showToast({
  type: 'success',
  title: 'Bloqueado',
  message: data.message || 'Usuário bloqueado com sucesso'
})
  } catch (error) {
    console.error('Erro ao bloquear usuário:', error)
  this.showToast({
  type: 'error',
  title: 'Erro',
  message: error.response?.data?.error || 'Erro ao bloquear usuário'
})
  } finally {
    this.blockingUser = false
  }
},

abrirModalExcluirChat(chat) {
  this.chatToDelete = chat
  this.showDeleteChatConfirm = true
},

cancelarExcluirChat() {
  this.showDeleteChatConfirm = false
  this.chatToDelete = null
},

async confirmarExcluirChat() {
  if (!this.chatToDelete) return

  try {
    this.deletingChat = true

    await api.delete(`/chats/${this.chatToDelete.id}`)

    if (this.activeChat?.id === this.chatToDelete.id) {
      this.closeChat()
    }

    this.chats = this.chats.filter(chat => chat.id !== this.chatToDelete.id)

    this.showDeleteChatConfirm = false
    this.chatToDelete = null
  } catch (error) {
    console.error('Erro ao excluir chat:', error)
this.showToast({
  type: 'error',
  title: 'Erro',
  message: error.response?.data?.error || 'Erro ao excluir chat'
})
  } finally {
    this.deletingChat = false
  }
},

        getFullUrl(url) {
  if (!url) return ''
  // Se já for URL completa, retorna como está
  if (url.startsWith('http')) return url
  // Se for relativa, adiciona o base URL do backend
  return `http://localhost:3002${url}`
},

handleImageError(event, msg) {
  console.error('Erro ao carregar imagem:', msg.arquivo?.url)
  event.target.style.display = 'none'
  // Opcional: mostrar placeholder
},
abrirImagem(msg) {
  const url = this.getFullUrl(msg.arquivo?.url || msg.conteudo)
  if (url) {
    window.open(url, '_blank')
  }
},
        // ========== EMOJI PICKER ==========
toggleEmojiPicker() {
  this.showEmojiPicker = !this.showEmojiPicker
  if (this.showEmojiPicker) {
    this.emojiSearch = ''
    this.activeEmojiCategory = 'Recentes'
    this.$nextTick(() => {
      this.$refs.emojiSearchInput?.focus()
    })
  }
},

closeEmojiPicker() {
  this.showEmojiPicker = false
},

insertEmoji(emoji) {
  this.novaMensagem += emoji
  // Não fecha automaticamente para permitir múltiplos emojis
  this.$refs.chatInputRef?.focus()
},

          // ========== EMOJI ==========
focusInputForEmoji() {
  this.$refs.chatInputRef?.focus()
  // Em mobile, isso abre o teclado nativo que inclui emojis
},

  // ========== ÁUDIO ==========
  async iniciarGravacao() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.audioRecorder = new MediaRecorder(stream)
      this.audioChunks = []

      this.audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data)
      }

      this.audioRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        await this.enviarAudio(audioBlob)
       
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop())
      }

      this.audioRecorder.start()
      this.gravandoAudio = true
      this.tempoGravacao = 0
     
      this.intervaloGravacao = setInterval(() => {
        this.tempoGravacao++
        // Limite de 2 minutos
        if (this.tempoGravacao >= 120) this.pararGravacao()
      }, 1000)

    } catch (err) {
      console.error('Erro ao acessar microfone:', err)
   this.showToast({
  type: 'error',
  title: 'Microfone',
  message: 'Não foi possível acessar o microfone. Verifique as permissões.'
})
    }
  },

  pararGravacao() {
    if (this.audioRecorder && this.audioRecorder.state !== 'inactive') {
      this.audioRecorder.stop()
    }
    this.gravandoAudio = false
    clearInterval(this.intervaloGravacao)
    this.intervaloGravacao = null
  },

  cancelarGravacao() {
    if (this.audioRecorder && this.audioRecorder.state !== 'inactive') {
      this.audioRecorder.stop()
      // Limpa os chunks para não enviar
      this.audioChunks = []
    }
    this.gravandoAudio = false
    clearInterval(this.intervaloGravacao)
    this.intervaloGravacao = null
  },

  tocarAudio(msg) {
    if (this.audioTocando === msg.id) {
      this.audioPlayer?.pause()
      this.audioTocando = null
      this.audioPlayer = null
      return
    }

    this.audioPlayer = new Audio(msg.arquivo?.url || msg.conteudo)
    this.audioPlayer.play()
    this.audioTocando = msg.id

    this.audioPlayer.onended = () => {
      this.audioTocando = null
      this.audioPlayer = null
    }
  },

  formatarTempoAudio(segundos) {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  },

  // ========== FOTO ==========
selecionarFoto() {
  this.$refs.fileInputFoto?.click()
  this.showAttachMenu = false
},

selecionarArquivo() {
  this.$refs.fileInputArquivo?.click()
  this.showAttachMenu = false
},

onFileSelected(event, tipo) {
  const file = event.target.files?.[0]
  if (!file) return

  // Validações
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
this.showToast({
  type: 'warning',
  title: 'Arquivo grande',
  message: 'Arquivo muito grande. Máximo 10MB.'
})
    event.target.value = ''
    return
  }

  const url = tipo === 'imagem' ? URL.createObjectURL(file) : null
 
  this.previewMidia = {
    tipo,
    file,  // ← guarda o File real para upload
    url,
    nome: file.name,
    tamanho: file.size
  }
  this.showPreviewMidia = true
 
  event.target.value = '' // reset
},

cancelarPreview() {
  if (this.previewMidia?.url) URL.revokeObjectURL(this.previewMidia.url)
  this.previewMidia = null
  this.showPreviewMidia = false
},

async confirmarEnvioMidia() {
  if (!this.previewMidia || !this.activeChat || this.chatBloqueado) return

  const { tipo, file } = this.previewMidia

  try {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('midia', file, file.name)

    // ✅ CORRETO - Envia para a rota do backend que faz o upload
    const { data } = await api.post(
      `/chats/${this.activeChat.id}/midia`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      }
    )

    // Adiciona a mensagem recebida do backend na lista local
    if (data) {
      this.chatMessages.push({
        id: data.id || Date.now(),
        remetente: this.currentUserId,
        conteudo: file.name,
        tipo,
        arquivo: data.arquivo,
        lida: true,
        createdAt: new Date().toISOString()
      })

      this.$nextTick(() => this.scrollToBottom(true))
    }

    // Recarrega mensagens do servidor para sincronizar
    const { data: refreshData } = await api.get(`/chats/${this.activeChat.id}/mensagens`)
    this.chatMessages = refreshData.mensagens || []
    
    this.cancelarPreview()

  } catch (error) {
    console.error('Erro ao enviar mídia:', error)
    this.showToast({
      type: 'error',
      title: 'Erro ao enviar',
      message: error.response?.data?.error || error.message
    })
  }
},

// ========== ÁUDIO (gravação) ==========
async enviarAudio(audioBlob) {
if (!this.activeChat || audioBlob.size === 0 || this.chatBloqueado) return

  try {
    const formData = new FormData()
    formData.append('midia', audioBlob, 'audio.webm')
   
    // Envia duração como campo extra (multer ignora, mas podemos usar)
    // ou envia via query param se precisar
   
    const { data } = await api.post(`/chats/${this.activeChat.id}/midia`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    this.showAttachMenu = false
   
    if (data) {
      this.chatMessages.push({
        id: data.id || Date.now(),
        remetente: this.currentUserId,
        conteudo: '🎵 Áudio',
        tipo: 'audio',
        arquivo: data.arquivo,
        duracao: this.tempoGravacao,
        lida: true,
        createdAt: new Date().toISOString()
      })
      this.$nextTick(() => this.scrollToBottom(true))
    }

    // Refresh
    const { data: refreshData } = await api.get(`/chats/${this.activeChat.id}/mensagens`)
    this.chatMessages = refreshData.mensagens || []
   
  } catch (error) {
    console.error('Erro ao enviar áudio:', error)
  this.showToast({
  type: 'error',
  title: 'Erro',
  message: 'Erro ao enviar áudio. Tente novamente.'
})
  }
},

  formatarTamanhoArquivo(bytes) {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  },

  // ========== MENU 3 PONTOS ==========
async limparChat() {
  if (!confirm('Limpar todas as mensagens desta conversa?')) return
  if (!this.activeChat) return
 
  try {
    await api.delete(`/chats/${this.activeChat.id}/limpar`)
    this.chatMessages = []
    this.showChatMenu = false
   
    // Atualiza última mensagem na lista de chats
    await this.buscarChats()
  } catch (error) {
    console.error('Erro ao limpar chat:', error)
  this.showToast({
  type: 'error',
  title: 'Erro',
  message: 'Erro ao limpar conversa'
})
  }
},

async silenciarChat() {
  if (!this.activeChat) return

  try {
    const { data } = await api.put(`/chats/${this.activeChat.id}/silenciar`)

    this.chatSilenciado = data.silenciado
    this.showChatMenu = false

    this.chats = this.chats.map(chat =>
      chat.id === this.activeChat.id
        ? { ...chat, silenciado: data.silenciado }
        : chat
    )

 this.showToast({
  type: 'success',
  title: data.silenciado ? 'Chat silenciado' : 'Chat dessilenciado',
  message: data.silenciado
    ? 'Você não receberá mais notificações desta conversa.'
    : 'Notificações desta conversa foram reativadas.',
  duration: 3000
})
  } catch (error) {
    console.error('Erro ao silenciar chat:', error)
this.showToast({
  type: 'error',
  title: 'Erro',
  message: error.response?.data?.error || 'Erro ao silenciar chat'
})
  }
},

async bloquearUsuario() {
  if (!confirm('Bloquear este usuário? Você não receberá mais mensagens dele.')) return
  if (!this.activeChat) return
 
  try {
    const { data } = await api.post(`/chats/${this.activeChat.id}/bloquear`)
    this.showChatMenu = false
    this.closeChat()
    await this.buscarChats()
  this.showToast({
  type: 'success',
  title: 'Usuário bloqueado',
  message: data.message || 'Você não receberá mais mensagens deste usuário.',
  duration: 4000
})
  } catch (error) {
    console.error('Erro ao bloquear usuário:', error)
    const msg = error.response?.data?.error || 'Erro ao bloquear usuário'
   this.showToast({
  type: 'error',
  title: 'Erro',
  message: msg
})
   
    // Se for erro de autorização, redireciona para login
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Opcional: this.$router.push('/login')
    }
  }
},

async denunciarChat() {
  // Modal customizado em vez de prompt()
  this.showReportModal = true
  this.reportMotivo = ''
  this.showChatMenu = false
},

async confirmarDenuncia() {
  if (!this.reportMotivo.trim() || !this.activeChat) {
    this.showToast({
      type: 'warning',
      title: 'Atenção',
      message: 'Descreva o motivo da denúncia.'
    })
    return
  }

  try {
    await api.post(`/chats/${this.activeChat.id}/denunciar`, { 
      motivo: this.reportMotivo.trim() 
    })
    
    this.showReportModal = false
    this.reportMotivo = ''
    
    this.showToast({
      type: 'success',
      title: 'Denúncia enviada!',
      message: 'Agradecemos sua colaboração. Analisaremos em até 24h.'
    })
  } catch (error) {
    console.error('Erro ao denunciar:', error)
    this.showToast({
      type: 'error',
      title: 'Erro ao enviar',
      message: error.response?.data?.error || 'Tente novamente mais tarde.'
    })
  }
},

         async buscarChats() {
    try {
      const { data } = await api.get('/chats')
      this.chats = data.chats || []
      this.hasChatsLoaded = true
    } catch (error) {
      console.error('Erro ao buscar chats:', error)
    }
  },

  openChatList() {
    this.buscarChats()
    this.showChatList = true
  },

  closeChatList() {
    this.showChatList = false
  },

 async openChat(chat) {
  this.activeChat = chat
  this.activeChatUser = chat.user
  this.showChatList = false
  this.showChat = true
  this.chatMessages = []

  this.chatSilenciado = !!chat.silenciado
  this.chatBloqueado = !!chat.bloqueado
  this.bloqueadoPorMim = !!chat.bloqueadoPorMim
  this.bloqueadoPorOutro = !!chat.bloqueadoPorOutro
  this.currentUserId = this.getLoggedUserId()

  try {
    const { data } = await api.get(`/chats/${chat.id}/mensagens`)

    this.chatMessages = data.mensagens || []
    this.chatSilenciado = !!data.silenciado
    this.chatBloqueado = !!data.bloqueado
    this.bloqueadoPorMim = !!data.bloqueadoPorMim
    this.bloqueadoPorOutro = !!data.bloqueadoPorOutro

    this.$nextTick(() => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    })

    this.startChatPolling(chat.id)
  } catch (error) {
    console.error('Erro ao carregar mensagens:', error)
    this.chatMessages = []
  }
},

closeChat() {
  this.showChat = false
  this.activeChat = null
  this.activeChatUser = null
  this.chatMessages = []
  this.chatBloqueado = false
  this.bloqueadoPorMim = false
  this.bloqueadoPorOutro = false
  this.chatSilenciado = false
  this.showChatMenu = false
  this.stopChatPolling()
},

 async enviarMensagem() {
  if (!this.novaMensagem.trim() || !this.activeChat || this.chatBloqueado) return

  const conteudo = this.novaMensagem.trim()
  this.novaMensagem = ''

  try {
    await api.post(`/chats/${this.activeChat.id}/mensagens`, {
      conteudo,
      tipo: 'texto'
    })

    const { data } = await api.get(`/chats/${this.activeChat.id}/mensagens`)
    this.chatMessages = data.mensagens || []

    this.$nextTick(() => {
      this.scrollToBottom()
    })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
this.showToast({
  type: 'error',
  title: 'Erro',
  message: error.response?.data?.error || 'Erro ao enviar mensagem'
})
  }
},

 scrollToBottom(force = false) {
    const container = this.$refs.chatMessagesRef
    if (!container) return

    // Só rola se estiver próximo do bottom (ou forçado)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
   
    if (force || isNearBottom || this.chatMessages.length <= 5) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
    }
  },

 startChatPolling(chatId) {
  this.stopChatPolling()

  this.chatPollingInterval = setInterval(async () => {
    try {
      const { data } = await api.get(`/chats/${chatId}/mensagens`)
      const newMessages = data.mensagens || []

      this.chatSilenciado = !!data.silenciado
      this.chatBloqueado = !!data.bloqueado
      this.bloqueadoPorMim = !!data.bloqueadoPorMim
      this.bloqueadoPorOutro = !!data.bloqueadoPorOutro

      const hasNewMedia = newMessages.some(nm => 
  nm.tipo === 'imagem' && !this.chatMessages.some(om => om.id === nm.id)
)

      const hasNewMessages = newMessages.length > this.chatMessages.length

      if (JSON.stringify(newMessages) !== JSON.stringify(this.chatMessages)) {
        this.chatMessages = newMessages

        const lastMsg = newMessages[newMessages.length - 1]
        const shouldScroll = hasNewMessages &&
          (lastMsg?.remetente !== this.currentUserId || this.chatMessages.length <= 2)

        this.$nextTick(() => {
          this.scrollToBottom(shouldScroll)
        })
      }
    } catch (error) {
      console.error('Erro no polling:', error)
    }
  }, 3000)
},

  stopChatPolling() {
    if (this.chatPollingInterval) {
      clearInterval(this.chatPollingInterval)
      this.chatPollingInterval = null
    }
  },

  formatChatTime(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes}min`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  },

  playPreview(musica) {
    if (musica.preview) {
      this.playAudio({
        id: musica.trackId,
        preview: musica.preview,
        title: musica.title,
        artist: { name: musica.artist }
      })
    }
  },
  async startChat(match) {
    try {
      // Se o match está pendente, aceitar primeiro
      if (match.status === 'pendente') {
        await api.put(`/matches/${match.id}/responder`, {
          resposta: 'aceito'
        })
      }

      // Criar/obter chat pelo matchId
      const { data: chatData } = await api.post('/chats/iniciar', {
        matchId: match.id
      })

      this.showMatches = false

      // Montar objeto chat compatível com openChat
      // O backend retorna o chat populado com participantes
      const otherUser = chatData.participantes?.find(
        p => String(p._id || p.id) !== String(this.getLoggedUserId())
      ) || match.user

      const chat = {
        id: chatData._id || chatData.id,
        user: {
          id: otherUser?._id || otherUser?.id || match.user.id,
          name: otherUser?.nome || otherUser?.name || match.user.name,
          avatar: otherUser?.avatar || match.user.avatar
        }
      }

      // Abrir chat e garantir rolagem
      await this.openChat(chat)
     
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error)
      // Fallback: tentar abrir o chat list
      this.showChatList = true
      await this.buscarChats()
    }
  },

        getPresetAvatarUrl(n) {
    const seeds = ['Felix', 'Aneka', 'Zack', 'Molly', 'Buddy', 'Luna']
    const seed = seeds[n - 1] || `user${n}`
    return `https://ui-avatars.com/api/?name=${seed}&background=1db954&color=fff&size=128`
  },

  onAvatarError(event, n) {
    // Fallback se ui-avatars falhar
    event.target.src = `https://i.pravatar.cc/150?img=${n + 10}`
  },

  selectPresetAvatar(n) {
    const seeds = ['Felix', 'Aneka', 'Zack', 'Molly', 'Buddy', 'Luna']
    const seed = seeds[n - 1] || `user${n}`
    // Usa Dicebear via HTTP (evita certificado) ou fallback para UI Avatars
    this.onboardingData.avatar = `https://ui-avatars.com/api/?name=${seed}&background=1db954&color=fff&size=300`
  },

  getLoggedUser() {
    return JSON.parse(
      localStorage.getItem('user') ||
      localStorage.getItem('usuario') ||
      'null'
    )
  },

  getLoggedUserId() {
    // Tentar múltiplas fontes
    const sources = [
      localStorage.getItem('user'),
      localStorage.getItem('usuario'),
      localStorage.getItem('musicalMatchProfile')
    ]

    for (const source of sources) {
      if (!source || source === 'null') continue
      try {
        const user = JSON.parse(source)
        const id = user?.id || user?._id || user?.userId
        if (id) return id
      } catch (e) {
        continue
      }
    }

    // Tentar extrair do token JWT
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.id || payload._id || payload.userId || payload.sub
      } catch (e) {
        return null
      }
    }

    return null
  },

async bootstrapUser() {
  try {
    // ✅ Verifica se usuário já escolheu sair anteriormente
    const matchLoggedIn = localStorage.getItem('musicalMatchLoggedIn')
    if (matchLoggedIn === 'false') {
      this.loading = false
      this.hasProfile = false
      return
    }

    const savedAuthUser = JSON.parse(localStorage.getItem('user') || 'null')
    const token = localStorage.getItem('token')

    if (!savedAuthUser || !token) {
      this.loading = false
      this.hasProfile = false
      return
    }

      const userId = savedAuthUser.id || savedAuthUser._id

      if (!userId) {
        this.loading = false
        this.hasProfile = false
        return
      }

      const { data } = await api.get(`/usuarios/${userId}`)

      this.currentUser = this.mapApiUserToCurrentUser(data)

      localStorage.setItem('musicalMatchProfile', JSON.stringify(this.currentUser))

// ✅ ALTERNATIVA: garantir que curtidas/favoritos carreguem ANTES das sugestões
if (data.onboardingCompleto) {
  this.hasProfile = true

  // Primeiro: carregar preferências do usuário
  await Promise.all([
    this.buscarCurtidas(),
    this.buscarFavoritos(),
    this.buscarMatches()
  ])

  // Depois: carregar sugestões (que dependem de saber o que já foi curtido)
  await this.buscarSugestoes()

      } else {
        this.hasProfile = false

      this.onboardingData.name = data.nome || savedAuthUser.nome || ''
        this.onboardingData.age = data.idade || savedAuthUser.idade || null
        this.onboardingData.location = data.localizacao || savedAuthUser.localizacao || ''
        this.onboardingData.avatar = data.avatar || savedAuthUser.avatar || ''
        this.onboardingData.bio = data.bio || savedAuthUser.bio || ''
        this.onboardingData.favoriteGenres = this.extractGenreIds(data.generos || savedAuthUser.generos || [])

        this.loading = false
      }
    } catch (error) {
      console.error('Erro ao carregar usuário logado:', error)
      this.loading = false
      this.hasProfile = false
    }
  },

  extractGenreIds(generos) {
    if (!generos) return []
   
    if (Array.isArray(generos)) {
      return generos.map(g => {
        if (typeof g === 'string') return g
        if (typeof g === 'object' && g !== null) {
          return g._id || g.id || g.nome || g.name || null
        }
        return null
      }).filter(Boolean)
    }
   
    return []
  },
  mapApiUserToCurrentUser(apiUser) {
    // Extrair gêneros de qualquer formato que vier do backend
    let generos = []
   
    if (Array.isArray(apiUser?.generos)) {
      generos = apiUser.generos
    } else if (Array.isArray(apiUser?.favoriteGenres)) {
      generos = apiUser.favoriteGenres
    } else if (apiUser?.generos && typeof apiUser.generos === 'object') {
      // Formato { locais: [...], externos: [...] }
      generos = [
        ...(apiUser.generos.locais || []),
        ...(apiUser.generos.externos || []).map(e => e.nome || e.externalId)
      ]
    }

    // Normalizar para array de strings (nomes ou IDs)
    const normalizedGenres = generos.map(g => {
      if (typeof g === 'string') return g
      if (typeof g === 'object' && g !== null) {
        return g._id || g.id || g.nome || g.externalId || g.name
      }
      return null
    }).filter(Boolean)

    return {
      id: apiUser?._id || apiUser?.id,
      _id: apiUser?._id || apiUser?.id,
      name: apiUser?.nome || apiUser?.name || '',
      age: apiUser?.idade || apiUser?.age || null,
      avatar: apiUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      bio: apiUser?.bio || '',
      location: apiUser?.localizacao || apiUser?.location || '',
      favoriteGenres: normalizedGenres
    }
  },

 normalizeSong(track) {
  const id = track.trackId || track.id || track.deezerId || track._id

  return {
    id: String(id),
    trackId: String(id),
    title: track.title || track.titulo || track.nome,
    artist: typeof track.artist === 'object'
      ? track.artist
      : { name: track.artist || track.artista || 'Artista desconhecido' },
    album: {
      title: track.album?.title || track.genre || '',
      cover_medium: track.album?.cover_medium || track.cover || track.capa || '',
      cover_small: track.album?.cover_small || track.cover || track.capa || ''
    },
    cover: track.cover || track.album?.cover_medium || '',
    duration: track.duration || 0,
    preview: track.preview || '',
    genre: track.genre || '',
    link: track.link || '',
    source: track.source || 'unknown'  // ← NOVO: preserva a fonte
  }
},

async buscarSugestoes() {
  try {
    this.loading = true

    const userId = this.getLoggedUserId()
    if (!userId) {
      console.error('[buscarSugestoes] Usuário não logado')
      this.songs = []
      this.loading = false
      return
    }

    console.log('[buscarSugestoes] Buscando sugestões multi-fonte...')

    let tracks = []

    try {
      const { data } = await api.get('/matches/sugestoes')
      console.log('[buscarSugestoes] Resposta do backend:', data)

      tracks = Array.isArray(data?.cards) ? data.cards : []
      console.log('[buscarSugestoes] Tracks recebidas:', tracks.length)

      // Log das fontes
      const sources = tracks.reduce((acc, t) => {
        acc[t.source || 'unknown'] = (acc[t.source || 'unknown'] || 0) + 1
        return acc
      }, {})
      console.log('[buscarSugestoes] Fontes:', sources)

    } catch (apiError) {
      console.error('[buscarSugestoes] Erro na API:', apiError?.response?.status, apiError?.message)
      tracks = []
    }

    if (!tracks.length) {
      console.warn('[buscarSugestoes] Nenhuma track recebida')
      this.songs = []
      this.currentIndex = 0
      this.loading = false
      return
    }

    const likedIds = new Set(this.likedSongs.map(s => String(s.id || s.trackId)))
    const favoriteIds = new Set(this.favorites.map(s => String(s.id || s.trackId)))

    this.songs = tracks
      .map(track => this.normalizeSong(track))
      .filter(song => {
        const songId = String(song.id || song.trackId)
        return !likedIds.has(songId) && !favoriteIds.has(songId)
      })

    this.currentIndex = 0
    console.log('[buscarSugestoes] Sugestões finais:', this.songs.length)
  } catch (error) {
    console.error('[buscarSugestoes] Erro geral:', error)
    this.songs = []
  } finally {
    this.loading = false
  }
},

        async buscarCurtidas() {
          try {
            const { data } = await api.get('/matches/curtidas', {
              params: { tipo: 'like' }
            })
            this.likedSongs = (data.curtidas || []).map(item => this.normalizeSong(item.musica))
          } catch (error) {
            console.error('Erro ao buscar curtidas:', error)
          }
        },

        async buscarFavoritos() {
          try {
            const { data } = await api.get('/matches/curtidas', {
              params: { tipo: 'favorite' }
            })
            this.favorites = (data.curtidas || []).map(item => this.normalizeSong(item.musica))
          } catch (error) {
            console.error('Erro ao buscar favoritos:', error)
          }
        },

        async buscarMatches() {
          try {
            const { data } = await api.get('/matches')
            this.matches = data.matches || []
            this.unreadMatches = data.naoVistos || 0
          } catch (error) {
            console.error('Erro ao buscar matches:', error)
          }
        },

  async fetchGenres() {
    try {
      this.loadingGenres = true

      // ============================================
      // 1. Buscar gêneros do BANCO (sua API) — sempre disponível
      // ============================================
      let dbGenres = []
      try {
        const { data } = await api.get('/generos')
       
        let generos = []
        if (Array.isArray(data)) {
          generos = data
        } else if (data && typeof data === 'object') {
          generos = Object.values(data).flat()
        }

        const ids = new Set()
  dbGenres = generos
    .filter(g => {
      const id = g?._id || g?.id
      if (!id || ids.has(id)) return false
      ids.add(id)
      return true
    })
    .map(g => ({
      _id: String(g._id || g.id),
      nome: g.nome,
      icon: g.icon || '<i class="fas fa-music"></i>',
      color: g.color || '#8b5cf6',
      source: isValidObjectId(g._id || g.id) ? 'database' : 'local'  // ← Marca corretamente
    }))
      } catch (err) {
        console.warn('Erro ao carregar gêneros do banco:', err.message)
      }

      // ============================================
      // 2. Buscar gêneros do Spotify (público, sem auth)
      // ============================================
      let apiGenres = []
      try {
        const { data } = await api.get('/spotify/vibes') // ✅ sem header de auth
       
        const spotifyGenres = Array.isArray(data) ? data : (data.vibes || data.genres || [])
       
        apiGenres = spotifyGenres
          .filter(g => g && (g.name || g.nome))
          .map((g, index) => ({
            _id: g.id || `spotify_${index}`,
            nome: g.name || g.nome,
            icon: g.emoji || g.icon || this.getGenreEmoji(g.name || g.nome),
            color: this.extractColor(g.gradient) || this.getGenreColor(g.name || g.nome),
            source: 'spotify'
          }))
      } catch (err) {
        console.warn('Erro ao carregar gêneros do Spotify:', err.message)
      }

      // ============================================
      // 3. Buscar gêneros do Deezer (público)
      // ============================================
      let deezerGenres = []
      try {
        const { data } = await api.get('/deezer/genre', { // ✅ /genre não /genres
          timeout: 5000
        })
       
        const dzGenres = data.data || data.genres || data || []
       
        deezerGenres = dzGenres
          .filter(g => g && (g.name || g.nome))
          .map((g, index) => ({
            _id: `deezer_${g.id || index}`,
            nome: g.name || g.nome,
            icon: this.getGenreEmoji(g.name || g.nome),
            color: this.getGenreColor(g.name || g.nome),
            source: 'deezer'
          }))
      } catch (err) {
        console.warn('Erro ao carregar gêneros do Deezer:', err.message)
      }

      // ============================================
      // 4. COMBINAR todos (sem duplicar por nome)
      // ============================================
      const seenNames = new Set()
      const allGenres = []

      for (const genre of [...dbGenres, ...apiGenres, ...deezerGenres]) {
        const normalizedName = (genre.nome || '').toLowerCase().trim()
        if (!normalizedName || seenNames.has(normalizedName)) continue
        seenNames.add(normalizedName)
        allGenres.push(genre)
      }

      this.availableGenres = allGenres.sort((a, b) =>
        (a.nome || '').localeCompare(b.nome || '')
      )

      console.log(`✅ ${this.availableGenres.length} gêneros carregados`)

    } catch (error) {
      console.error('Erro ao carregar gêneros:', error)
      this.availableGenres = this.getFallbackGenres()
    } finally {
      this.loadingGenres = false
    }
  },

  // Helper para extrair cor do gradiente CSS
  extractColor(gradient) {
    if (!gradient) return null
    const match = gradient.match(/#[a-fA-F0-9]{6}/)
    return match ? match[0] : null
  },

  // Fallback se tudo falhar
 getFallbackGenres() {
    return [
      { _id: '1', nome: 'Pop', icon: '<i class="fas fa-microphone"></i>', color: '#ec4899', source: 'fallback' },
      { _id: '2', nome: 'Rock', icon: '<i class="fas fa-guitar"></i>', color: '#ef4444', source: 'fallback' },
      { _id: '3', nome: 'Hip Hop', icon: '<i class="fas fa-headphones"></i>', color: '#8b5cf6', source: 'fallback' },
      { _id: '4', nome: 'Eletrônica', icon: '<i class="fas fa-keyboard"></i>', color: '#06b6d4', source: 'fallback' },
      { _id: '5', nome: 'Sertanejo', icon: '<i class="fas fa-hat-cowboy"></i>', color: '#f59e0b', source: 'fallback' },
      { _id: '6', nome: 'MPB', icon: '<i class="fas fa-saxophone"></i>', color: '#10b981', source: 'fallback' },
      { _id: '7', nome: 'Funk', icon: '<i class="fas fa-fire"></i>', color: '#e91e63', source: 'fallback' },
      { _id: '8', nome: 'Pagode', icon: '<i class="fas fa-drum"></i>', color: '#ff6b35', source: 'fallback' },
      { _id: '9', nome: 'Samba', icon: '<i class="fas fa-drum"></i>', color: '#eab308', source: 'fallback' },
      { _id: '10', nome: 'Gospel', icon: '<i class="fas fa-cross"></i>', color: '#6366f1', source: 'fallback' },
      { _id: '11', nome: 'Reggae', icon: '<i class="fas fa-leaf"></i>', color: '#22c55e', source: 'fallback' },
      { _id: '12', nome: 'Indie', icon: '<i class="fas fa-seedling"></i>', color: '#84cc16', source: 'fallback' }
    ]
  },

  // Métodos auxiliares para cores/ícones
 // DE:
getGenreEmoji(name) {
    const map = {
      'pop': '🎤', 'rock': '🎸', 'hip hop': '🎧', 'rap': '🎤',
      'eletrônica': '🎹', 'electronic': '🎹', 'edm': '🎹',
      'sertanejo': '🤠', 'country': '🤠',
      'mpb': '🎷', 'jazz': '🎷', 'blues': '🎷',
      'classical': '🎻', 'classica': '🎻',
      'reggae': '🌴', 'funk': '🔥', 'samba': '🥁',
      'gospel': '✝️', 'r&b': '💜', 'soul': '💜',
      'indie': '🌿', 'metal': '🤘', 'punk': '🤘',
      'latina': '💃', 'latin': '💃', 'k-pop': '🇰🇷',
      'anime': '🇯🇵', 'folk': '🪕', 'disco': '🕺'
    }
    return map[(name || '').toLowerCase()] || '🎵'
  },

// PARA:
getGenreEmoji(name) {
    const map = {
      'pop': '<i class="fas fa-microphone"></i>',
      'rock': '<i class="fas fa-guitar"></i>',
      'hip hop': '<i class="fas fa-headphones"></i>',
      'rap': '<i class="fas fa-microphone"></i>',
      'eletrônica': '<i class="fas fa-keyboard"></i>',
      'electronic': '<i class="fas fa-keyboard"></i>',
      'edm': '<i class="fas fa-keyboard"></i>',
      'sertanejo': '<i class="fas fa-hat-cowboy"></i>',
      'country': '<i class="fas fa-hat-cowboy"></i>',
      'mpb': '<i class="fas fa-saxophone"></i>',
      'jazz': '<i class="fas fa-saxophone"></i>',
      'blues': '<i class="fas fa-saxophone"></i>',
      'classical': '<i class="fas fa-violin"></i>',
      'classica': '<i class="fas fa-violin"></i>',
      'reggae': '<i class="fas fa-leaf"></i>',
      'funk': '<i class="fas fa-fire"></i>',
      'samba': '<i class="fas fa-drum"></i>',
      'gospel': '<i class="fas fa-cross"></i>',
      'r&b': '<i class="fas fa-heart"></i>',
      'soul': '<i class="fas fa-heart"></i>',
      'indie': '<i class="fas fa-seedling"></i>',
      'metal': '<i class="fas fa-hand-rock"></i>',
      'punk': '<i class="fas fa-hand-rock"></i>',
      'latina': '<i class="fas fa-dancing"></i>',
      'latin': '<i class="fas fa-dancing"></i>',
      'k-pop': '<i class="fas fa-star"></i>',
      'anime': '<i class="fas fa-torii-gate"></i>',
      'folk': '<i class="fas fa-guitar"></i>',
      'disco': '<i class="fas fa-person-dancing"></i>'
    }
    return map[(name || '').toLowerCase()] || '<i class="fas fa-music"></i>'
  },

  getGenreColor(name) {
    const map = {
      'pop': '#ec4899', 'rock': '#ef4444', 'hip hop': '#8b5cf6',
      'rap': '#a855f7', 'eletrônica': '#06b6d4', 'electronic': '#06b6d4',
      'edm': '#06b6d4', 'sertanejo': '#f59e0b', 'country': '#f59e0b',
      'mpb': '#10b981', 'jazz': '#f59e0b', 'blues': '#3b82f6',
      'classical': '#fbbf24', 'classica': '#fbbf24', 'reggae': '#22c55e',
      'funk': '#f97316', 'samba': '#eab308', 'gospel': '#6366f1',
      'r&b': '#d946ef', 'soul': '#d946ef', 'indie': '#84cc16',
      'metal': '#78716c', 'punk': '#dc2626', 'latina': '#ec4899',
      'latin': '#ec4899', 'k-pop': '#f472b6', 'anime': '#fb923c',
      'folk': '#a3e635', 'disco': '#e879f9'
    }
    return map[(name || '').toLowerCase()] || '#8b5cf6'
  },

        nextStep() {
          if (this.onboardingStep < 4) this.onboardingStep++
        },

        prevStep() {
          if (this.onboardingStep > 1) this.onboardingStep--
        },

        triggerOnboardingFileInput() {
          this.$refs.onboardingFileInput?.click()
        },

        handleOnboardingFileChange(e) {
          const file = e.target.files?.[0]
          if (!file) return

          const reader = new FileReader()
          reader.onload = event => {
            this.onboardingData.avatar = event.target.result
          }
          reader.readAsDataURL(file)
        },

        removePhoto() {
          this.onboardingData.avatar = ''
        },

  toggleGenre(genre) {
    const id = String(genre._id)

    const index = this.onboardingData.favoriteGenres.indexOf(id)

    if (index > -1) {
      this.onboardingData.favoriteGenres.splice(index, 1)
    } else if (this.onboardingData.favoriteGenres.length < 3) {
      this.onboardingData.favoriteGenres.push(id)
    }
  },

    isGenreSelected(id) {
    return this.onboardingData.favoriteGenres.includes(String(id))
  },

  async finishOnboarding() {
    try {
      this.creatingProfile = true

      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado. Faça login novamente.')

      let userId
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        userId = payload.id || payload._id || payload.userId || payload.sub
      } catch (e) {
        throw new Error('Token inválido. Faça login novamente.')
      }

      if (!userId) throw new Error('ID do usuário não encontrado no token.')

      // ✅ CORREÇÃO: Enviar generos como ARRAY SIMPLES de objetos
      // O backend (normalizarGeneros) espera um array, não um objeto {locais, externos}
      const generosSelecionados = this.availableGenres.filter(g =>
        this.onboardingData.favoriteGenres.includes(String(g._id))
      )

      // Converter para o formato que o backend espera (array de objetos)
      const generosArray = generosSelecionados.map(g => ({
        _id: String(g._id),
        nome: g.nome,
        icon: g.icon || '<i class="fas fa-music"></i>',
        color: g.color || '#1DB954',
        source: g.source || 'local'
      }))

      const payload = {
        nome: this.onboardingData.name.trim(),
        idade: Number(this.onboardingData.age),
        avatar: this.onboardingData.avatar,
        bio: this.onboardingData.bio.trim(),
        localizacao: this.onboardingData.location.trim(),
        generos: generosArray,  // ← Array simples, não objeto!
        onboardingCompleto: true
      }

      console.log('📤 Payload do onboarding:', JSON.stringify(payload, null, 2))

      const response = await api.put(`/usuarios/${userId}`, payload)

      const updatedUser = response.data.user || response.data

      this.currentUser = this.mapApiUserToCurrentUser(updatedUser)
      this.hasProfile = true

      localStorage.setItem('musicalMatchProfile', JSON.stringify(this.currentUser))
      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('usuario', JSON.stringify(updatedUser))
      localStorage.setItem('musicalMatchLoggedIn', 'true')

// Remove flag de conta excluída se existir
localStorage.removeItem('musicalMatchAccountDeleted')

      await Promise.all([
        this.buscarCurtidas(),
        this.buscarFavoritos(),
        this.buscarMatches()
      ])

      await this.buscarSugestoes()
      this.loading = false

    } catch (error) {
      console.error('❌ Erro no finishOnboarding:', error)
     
      const apiError = error?.response?.data?.error ||
                      error?.response?.data?.message ||
                      error?.response?.data?.details ||
                      error.message
     
     this.showToast({
  type: 'error',
  title: 'Erro ao criar perfil',
  message: apiError || 'Erro ao criar perfil. Tente novamente.'
})
     
      if (apiError?.includes('expirada') ||
          apiError?.includes('Token') ||
          apiError?.includes('login') ||
          apiError?.includes('não autorizado')) {
        this.$router.push('/login')
      }
    } finally {
      this.creatingProfile = false
    }
  },

        confirmLogout() {
          this.showLogoutConfirm = true
        },

        cancelLogout() {
          this.showLogoutConfirm = false
        },

logout() {
  // ✅ CORRETO: NÃO remove token do app principal!
  // Apenas marca que saiu do Musical Match
  
  const keysToRemove = [
    'musicalMatchProfile',
    'musicalMatchOnboarding',
    'matchLikedSongs',
    'matchFavorites'
  ]
  keysToRemove.forEach(key => localStorage.removeItem(key))

  // Reseta estado completo do Match
  this.hasProfile = false
  this.onboardingStep = 1
  this.onboardingData = {
    name: '',
    age: null,
    location: '',
    avatar: '',
    bio: '',
    favoriteGenres: []
  }
  this.currentUser = {
    name: '',
    age: null,
    avatar: '',
    bio: '',
    location: '',
    favoriteGenres: []
  }
  this.likedSongs = []
  this.favorites = []
  this.matches = []
  this.unreadMatches = 0
  this.currentIndex = 0
  this.songs = []
  this.showProfile = false
  this.showLogoutConfirm = false
  this.showChatList = false
  this.showChat = false
  this.activeChat = null
  this.chatMessages = []

  this.stopAudio()
  this.stopChatPolling()
  
  // ✅ MARCA que saiu (impede auto-login no próximo acesso)
  localStorage.setItem('musicalMatchLoggedIn', 'false')

  // Toast de confirmação
  this.showToast({
    type: 'success',
    title: 'Até logo!',
    message: 'Você saiu da sua conta do Musical Match.'
  })
},

        confirmDeleteAccount() {
  this.showDeleteAccountConfirm = true
  this.showProfile = false  // fecha o modal de perfil
},

cancelDeleteAccount() {
  this.showDeleteAccountConfirm = false
},

async deleteAccount() {
  try {
    this.deletingAccount = true

    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    // Chama API para excluir dados do Musical Match
    await api.delete('/matches/conta', {
      headers: { Authorization: `Bearer ${token}` }
    })

    // Limpa dados locais
 localStorage.setItem('musicalMatchAccountDeleted', 'true')
  
  // Limpa dados locais
  const keysToRemove = [
    'musicalMatchProfile',
    'musicalMatchOnboarding',
    'matchLikedSongs',
    'matchFavorites',
    'musicalMatchLoggedIn'
  ]
  keysToRemove.forEach(key => localStorage.removeItem(key))

  this.showDeleteAccountConfirm = false
  this.deletingAccount = false

    // Reseta estado completo
    this.hasProfile = false
    this.onboardingStep = 1
    this.onboardingData = {
      name: '',
      age: null,
      location: '',
      avatar: '',
      bio: '',
      favoriteGenres: []
    }
    this.currentUser = {
      name: '',
      age: null,
      avatar: '',
      bio: '',
      location: '',
      favoriteGenres: []
    }
    this.likedSongs = []
    this.favorites = []
    this.matches = []
    this.unreadMatches = 0
    this.currentIndex = 0
    this.songs = []
    this.showProfile = false

    this.stopAudio()
    this.stopChatPolling()

    this.showToast({
      type: 'success',
      title: 'Conta excluída',
      message: 'Seus dados do Musical Match foram removidos permanentemente.'
    })

  } catch (error) {
    console.error('Erro ao excluir conta:', error)
    this.deletingAccount = false
    
    this.showToast({
      type: 'error',
      title: 'Erro ao excluir',
      message: error.response?.data?.error || error.message || 'Tente novamente mais tarde.'
    })
  }
},

// Após criar um match bem-sucedido
async notificarMatch(matchData) {
  try {
    const token = localStorage.getItem('token')
    await axios.post('http://localhost:3002/notificacoes', {
      tipo: 'matchmusical',
      destinatarioId: matchData.user.id, // ID do outro usuário
      referenciaId: matchData.id, // ID do match
      mensagem: `Você deu match musical com ${this.currentUser.name}!`
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {
    console.error('Erro ao notificar match:', err)
  }
},

async notificarMensagemMatch(chatId, remetenteId, destinatarioId) {
  try {
    const token = localStorage.getItem('token')
    await axios.post('http://localhost:3002/notificacoes', {
      tipo: 'matchmusical_mensagem',
      destinatarioId: destinatarioId,
      referenciaId: chatId,
      mensagem: `Nova mensagem no Match Musical`
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {
    console.error('Erro ao notificar mensagem:', err)
  }
},

     async loadMoreSongs() {
          try {
            this.loading = true

            const userId = this.getLoggedUserId()
            if (!userId) {
              this.loading = false
              return
            }

            // Coletar IDs de músicas já vistas (curtidas, favoritas, e as que já passaram)
            const seenIds = new Set([
              ...this.likedSongs.map(s => String(s.id || s.trackId)),
              ...this.favorites.map(s => String(s.id || s.trackId)),
              ...this.songs.map(s => String(s.id || s.trackId))
            ])

            console.log('[loadMoreSongs] Buscando novas sugestões, excluindo', seenIds.size, 'músicas já vistas')

            let tracks = []

            try {
              const { data } = await api.get('/matches/sugestoes', {
                params: {
                  excludeIds: Array.from(seenIds).join(','),
                  limit: 20
                }
              })

              tracks = Array.isArray(data?.cards) ? data.cards : []
              console.log('[loadMoreSongs] Novas tracks recebidas:', tracks.length)

            } catch (apiError) {
              console.error('[loadMoreSongs] Erro na API:', apiError?.response?.status, apiError?.message)
              tracks = []
            }

            if (!tracks.length) {
              console.warn('[loadMoreSongs] Nenhuma track nova recebida do servidor')
              // Tentar sem filtros como fallback
              try {
                const { data } = await api.get('/matches/sugestoes', {
                  params: { limit: 20 }
                })
                tracks = Array.isArray(data?.cards) ? data.cards : []
              } catch (e) {
                tracks = []
              }
            }

            if (tracks.length) {
              const likedIds = new Set(this.likedSongs.map(s => String(s.id || s.trackId)))
              const favoriteIds = new Set(this.favorites.map(s => String(s.id || s.trackId)))

              const newSongs = tracks
                .map(track => this.normalizeSong(track))
                .filter(song => {
                  const songId = String(song.id || song.trackId)
                  return !likedIds.has(songId) && !favoriteIds.has(songId)
                })

              if (newSongs.length > 0) {
                this.songs = [...this.songs, ...newSongs]
                console.log('[loadMoreSongs]', newSongs.length, 'novas músicas adicionadas. Total:', this.songs.length)
              } else {
                console.warn('[loadMoreSongs] Todas as músicas recebidas já estavam na lista')
              }
            }

          } catch (error) {
            console.error('[loadMoreSongs] Erro geral:', error)
          } finally {
            this.loading = false
          }
        },

     getCardStyle(index) {
          const isTop = index === this.visibleSongs.length - 1
          const offset = this.visibleSongs.length - 1 - index

          if (isTop && this.isDragging) {
            const rotate = this.dragOffset * 0.08
            const opacity = 1 - Math.abs(this.dragOffset) / 500
            return {
              transform: `translateX(${this.dragOffset}px) rotate(${rotate}deg)`,
              opacity: Math.max(opacity, 0.5),
              zIndex: 10
            }
          }

          // Cards de fundo: leve deslocamento Y, sem scale (não encolhe)
          return {
            transform: `translateY(${offset * 8}px) rotate(${offset * 1.5}deg)`,
            zIndex: index,
            opacity: Math.max(1 - offset * 0.12, 0.4)
          }
        },

startDrag(e) {
  // Só permite drag no card do topo
  const card = e.currentTarget
  if (!card.classList.contains('top-card')) return
  
  if (this.currentPlaying) this.stopAudio()
  
  this.isDragging = true
  this.dragStartX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
  
  // Previne scroll do body durante o drag
  document.body.style.overflow = 'hidden'
  document.body.style.touchAction = 'none'
},

onDrag(e) {
  if (!this.isDragging) return
  
  // Usa passive: false no listener, mas aqui precisamos do preventDefault
  if (e.cancelable) e.preventDefault()

  const x = e.type.includes('touch') 
    ? (e.touches[0] ? e.touches[0].clientX : this.dragStartX + this.dragOffset)
    : e.clientX
    
  this.dragOffset = x - this.dragStartX
  this.swipingRight = this.dragOffset > 50
  this.swipingLeft = this.dragOffset < -50
},

       endDrag() {
  if (!this.isDragging) return

  // Threshold menor para mobile
  const threshold = window.innerWidth < 480 ? 80 : 120

  if (this.dragOffset > threshold) {
    this.swipeRight()
  } else if (this.dragOffset < -threshold) {
    this.swipeLeft()
  }

  this.isDragging = false
  this.dragOffset = 0
  this.swipingLeft = false
  this.swipingRight = false
  
  // Libera scroll do body
  document.body.style.overflow = ''
  document.body.style.touchAction = ''
},

        swipeLeft() {
          this.currentIndex++
          this.animateCard('left')
        },

      async swipeRight() {
    try {

      const currentSong = this.currentSong

      if (!currentSong) return

      const alreadyLiked = this.likedSongs.some(
        s => String(s.trackId) === String(currentSong.trackId)
      )

      if (!alreadyLiked) {

        await api.post('/matches/curtidas', {
          track: currentSong,
          tipo: 'like'
        })

        this.likedSongs.push(currentSong)
      }

      this.currentIndex++

      this.animateCard('right')

      const oldIds = this.matches.map(m => m.id)

      await this.buscarMatches()

      const newMatch = this.matches.find(
        m => !oldIds.includes(m.id)
      )

      if (newMatch) {

        this.lastMatch = newMatch
        this.showMatchNotification = true

        setTimeout(() => {
          this.showMatchNotification = false
        }, 5000)
      }

    } catch (error) {
     this.showToast({
  type: 'error',
  title: 'Erro',
  message: 'Erro ao curtir música. Tente novamente.'
})
console.error('Erro ao curtir:', error)
    }
  },

      async toggleFavorite() {
    try {
      const currentSong = this.currentSong

      if (!currentSong) return

      const exists = this.favorites.find(
        f => String(f.trackId) === String(currentSong.trackId)
      )

      if (exists) {

        await api.delete(
          `/matches/curtidas/${currentSong.trackId}`,
          {
            params: { tipo: 'favorite' }
          }
        )

        this.favorites = this.favorites.filter(
          f => String(f.trackId) !== String(currentSong.trackId)
        )

      } else {

        await api.post('/matches/curtidas', {
          track: currentSong,
          tipo: 'favorite'
        })

        this.favorites.push(currentSong)

        this.lastFavorited = currentSong
        this.showFavoriteToast = true

        setTimeout(() => {
          this.showFavoriteToast = false
        }, 3000)
      }

    } catch (error) {
     this.showToast({
  type: 'error',
  title: 'Erro',
  message: 'Erro ao favoritar música. Tente novamente.'
})
console.error('Erro ao favoritar:', error)
    }
  },

  isFavorite(song) {
    if (!song) return false

    return this.favorites.some(
      f => String(f.trackId) === String(song.trackId)
    )
  },

        async removeFavorite(song) {
          try {
            await api.delete(`/matches/curtidas/${song.id}`, {
              params: { tipo: 'favorite' }
            })
            this.favorites = this.favorites.filter(f => String(f.id) !== String(song.id))
          } catch (error) {
           this.showToast({
  type: 'error',
  title: 'Erro',
  message: 'Erro ao remover favorito. Tente novamente.'
})
console.error('Erro ao remover favorito:', error)
          }
        },

        superLike() {
          this.toggleFavorite()
        },

        async unlikeSong(song) {
          try {
            await api.delete(`/matches/curtidas/${song.id}`, {
              params: { tipo: 'like' }
            })
            this.likedSongs = this.likedSongs.filter(s => String(s.id) !== String(song.id))
            await this.buscarMatches()
          } catch (error) {
         this.showToast({
  type: 'error',
  title: 'Erro',
  message: 'Erro ao remover curtida. Tente novamente.'
})
console.error('Erro ao remover curtida:', error)
          }
        },

        togglePlay(song) {
          if (this.currentPlaying === song.id) {
            this.stopAudio()
          } else {
            this.playAudio(song)
          }
        },

        playAudio(song) {
          this.stopAudio()

          if (song.preview) {
            this.audio = new Audio(song.preview)
            this.audio.play()
            this.currentPlaying = song.id

            this.audio.addEventListener('ended', () => {
              this.stopAudio()
            })

            this.progressInterval = setInterval(() => {
              this.progress += 2
              this.currentTime += 0.6

              if (this.progress >= 100) {
                this.stopAudio()
              }
            }, 100)
          } else {
            this.currentPlaying = song.id
            this.progress = 0
            this.currentTime = 0

            this.progressInterval = setInterval(() => {
              this.progress += 0.5
              this.currentTime += 0.5

              if (this.progress >= 100) {
                this.stopAudio()
              }
            }, 100)
          }
        },

        stopAudio() {
          if (this.audio) {
            this.audio.pause()
            this.audio = null
          }

          if (this.progressInterval) {
            clearInterval(this.progressInterval)
            this.progressInterval = null
          }

          this.currentPlaying = null
          this.progress = 0
          this.currentTime = 0
        },

        formatDuration(seconds) {
          if (!seconds) return '0:00'
          const mins = Math.floor(seconds / 60)
          const secs = Math.floor(seconds % 60)
          return `${mins}:${secs.toString().padStart(2, '0')}`
        },

        formatTime(seconds) {
          const mins = Math.floor(seconds / 60)
          const secs = Math.floor(seconds % 60)
          return `${mins}:${secs.toString().padStart(2, '0')}`
        },

        openProfile() {
          this.showProfile = true
          this.isEditing = false
        },

        closeProfile() {
          if (this.isEditing) this.cancelEdit()
          this.showProfile = false
        },

        startEdit() {
          this.editForm = {
            name: this.currentUser.name,
            age: this.currentUser.age,
            bio: this.currentUser.bio,
            location: this.currentUser.location,
            avatar: this.currentUser.avatar
          }
          this.isEditing = true
        },

        cancelEdit() {
          this.isEditing = false
          this.editForm = {
            name: '',
            age: null,
            bio: '',
            location: '',
            avatar: ''
          }
        },

        async saveProfile() {
          try {
  const user = this.getLoggedUser()
  const userId = this.getLoggedUserId()

            if (!userId) {
              throw new Error('Usuário não encontrado no localStorage')
            }

            const { data } = await api.put(`/usuarios/${userId}`, {
              nome: this.editForm.name,
              idade: this.editForm.age,
              bio: this.editForm.bio,
              localizacao: this.editForm.location,
              avatar: this.editForm.avatar
            })

            const updatedUser = data.user

            this.currentUser = {
              ...this.currentUser,
              ...this.mapApiUserToCurrentUser(updatedUser),
              favoriteGenres: this.currentUser.favoriteGenres
            }

            localStorage.setItem('musicalMatchProfile', JSON.stringify(this.currentUser))
            this.isEditing = false
          } catch (error) {
         this.showToast({
  type: 'error',
  title: 'Erro',
  message: 'Erro ao salvar perfil. Tente novamente.'
})
console.error('Erro ao salvar perfil:', error)
          }
        },

        triggerFileInput() {
          this.$refs.fileInput?.click()
        },

        handleFileChange(e) {
          const file = e.target.files?.[0]
          if (!file) return

          const reader = new FileReader()
          reader.onload = event => {
            this.editForm.avatar = event.target.result
          }
          reader.readAsDataURL(file)
        },

        async closeMatches() {
          try {
            const unread = this.matches.filter(m => m.unread)

            await Promise.all(
              unread.map(match => api.put(`/matches/${match.id}/visto`))
            )

            this.matches = this.matches.map(m => ({ ...m, unread: false }))
            this.unreadMatches = 0
            this.showMatches = false
          } catch (error) {
            console.error('Erro ao marcar matches como vistos:', error)
            this.showMatches = false
          }
        },

        openMatchDetail(match) {
          console.log('Ver detalhe do match:', match)
        },

        async removeMatch(match) {
          try {
            await api.delete(`/matches/${match.id}`)
            this.matches = this.matches.filter(m => m.id !== match.id)
            this.unreadMatches = this.matches.filter(m => m.unread).length
          } catch (error) {
           this.showToast({
  type: 'error',
  title: 'Erro',
  message: 'Erro ao remover match. Tente novamente.'
})
console.error('Erro ao remover match:', error)
          }
        },

        viewMatch() {
          this.showMatchNotification = false
          this.showMatches = true
        },

        resetSongs() {
          this.currentIndex = 0
          this.likedSongs = []
          this.matches = []
          this.unreadMatches = 0
          this.buscarSugestoes()
        },

        animateCard() {
          // animação via CSS
        }
      },

      beforeUnmount() {
        this.stopAudio()
        this.stopChatPolling()
         window.removeEventListener('avatar-gold-changed', this.handleAvatarGoldChanged);
      }
    }
    </script>

  <style scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

.musical-match {
    min-height: 100vh;
    background: #0a0a0a;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
    padding-top: 70px;  /* ← ADICIONAR - altura do navbar */
}

  /* ONBOARDING STYLES */
  .onboarding-flow {
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  }

  .onboarding-step {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.5s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .onboarding-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    position: sticky;
    top: 0;
    background: rgba(10, 10, 10, 0.8);
    backdrop-filter: blur(10px);
    z-index: 10;
  }

  .back-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-3px);
  }

  .step-indicator {
    display: flex;
    gap: 0.5rem;
  }

  .step-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transition: all 0.3s;
  }

  .step-dot.active {
    background: #1db954;
    width: 24px;
    border-radius: 4px;
  }

  .placeholder {
    width: 44px;
  }

  .onboarding-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
  }

  .onboarding-content.compact {
    justify-content: flex-start;
    padding-top: 2rem;
  }

  /* Welcome Step */
  .welcome-step {
    background: linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #1a1a1a 100%);
  }

  .logo-large {
    margin-bottom: 2rem;
    animation: pulse-logo 2s infinite;
  }

  @keyframes pulse-logo {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .logo-icon-large {
    width: 120px;
    height: 120px;
    color: #1db954;
    filter: drop-shadow(0 0 30px rgba(29, 185, 84, 0.5));
  }

  .welcome-title {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .welcome-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 3rem;
    text-align: center;
  }

  .features-preview {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }

  .feature-icon {
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s;
  }

  .feature-item:hover .feature-icon {
    transform: translateY(-5px);
    background: rgba(29, 185, 84, 0.1);
    border-color: rgba(29, 185, 84, 0.3);
  }

  .feature-item span {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }

  /* Step Titles */
  .step-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-align: center;
    width: 100%;
  }

  .step-subtitle {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
    text-align: center;
    width: 100%;
  }

  /* Form Styles */
  .form-group {
    width: 100%;
    margin-bottom: 1.5rem;
    position: relative;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 100%;
  }

  .form-group.half {
    margin-bottom: 0;
  }
.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1.5px solid;
  margin-bottom: 0.75rem;
}
.login-info-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(29, 185, 84, 0.1);
  border: 1px solid rgba(29, 185, 84, 0.3);
  border-radius: 12px;
  margin-bottom: 1rem;
  color: #1db954;
  font-size: 0.875rem;
}

.login-info-alert svg {
  flex-shrink: 0;
}
.source-badge span {
  font-size: 0.85rem;
}
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  .onboarding-input, .onboarding-textarea {
    width: 100%;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s;
    font-family: inherit;
  }

  .onboarding-input:focus, .onboarding-textarea:focus {
    outline: none;
    border-color: #1db954;
    background: rgba(255, 255, 255, 0.08);
  }

  .onboarding-input::placeholder, .onboarding-textarea::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .onboarding-textarea {
    resize: none;
    min-height: 100px;
  }

  .input-hint {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
  }

  .form-group:has(textarea) .input-hint {
    top: auto;
    bottom: 1rem;
    transform: none;
  }

  .input-hint.limit-reached {
    color: #1db954;
    font-weight: 600;
  }

  /* Photo Upload */
  .photo-upload-area {
    width: 100%;
    margin-bottom: 1.5rem;
  }

  .upload-placeholder {
    width: 100%;
    aspect-ratio: 1;
    max-height: 300px;
    background: rgba(255, 255, 255, 0.03);
    border: 3px dashed rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    color: rgba(255, 255, 255, 0.5);
  }

  .upload-placeholder:hover {
    border-color: #1db954;
    background: rgba(29, 185, 84, 0.05);
    color: #1db954;
  }

  .upload-placeholder svg {
    opacity: 0.5;
  }

  .upload-placeholder:hover svg {
    opacity: 1;
  }

  .upload-placeholder span {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .upload-placeholder small {
    font-size: 0.875rem;
    opacity: 0.7;
  }

  .photo-preview-container {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    max-height: 300px;
  }

  .photo-preview-large {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 24px;
    border: 3px solid #1db954;
  }

  .remove-photo-btn {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ff4757;
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
    transition: all 0.3s;
  }

  .remove-photo-btn:hover {
    transform: scale(1.1);
    background: #ff3344;
  }

  .avatar-presets {
    width: 100%;
    margin-bottom: 2rem;
  }

  .avatar-presets p {
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .preset-avatars {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .preset-avatar-btn {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 3px solid transparent;
    background: transparent;
    cursor: pointer;
    padding: 0;
    transition: all 0.3s;
    overflow: hidden;
  }

  .preset-avatar-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preset-avatar-btn:hover {
    transform: scale(1.1);
  }

  .preset-avatar-btn.active {
    border-color: #1db954;
    box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.2);
  }

  /* Genre Selector */
  .genre-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .genre-select-btn {
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  .genre-select-btn:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  .genre-select-btn.active {
    background: rgba(29, 185, 84, 0.2);
    border-color: #1db954;
    color: #1db954;
  }

  .genre-select-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Button Styles */
  .btn-large {
    width: 100%;
    max-width: 300px;
    padding: 1.25rem 2rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .btn-finish {
    margin-top: 2rem;
  }

  .btn-finish:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-finish span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
.profile-btn {
    padding: 0;
    overflow: hidden;
    border: 2px solid rgba(29, 185, 84, 0.4);
    transition: all 0.3s ease;
    margin-top: 0;      /* ← REMOVER margin-top ou deixar 0 */
    margin-left: auto;  /* ← EMPURRA para a direita */
}

  .profile-btn:hover {
    border-color: #1db954;
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(29, 185, 84, 0.3);
  }
  /* Header */
.match-header {
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 0.75rem 0;
    height: 64px;
    display: flex;
    align-items: center;
  }

.header-content {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;  /* ← ADICIONAR gap entre logo e actions */
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-right: auto;  /* ← EMPURRA o logo para esquerda, criando espaço */
}

  .logo-icon {
    width: 32px;
    height: 32px;
    color: #1db954;
  }

  .logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

.header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-left: auto;  /* ← EMPURRA TUDO para a direita */
}

  .icon-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;
  }

  .icon-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

.icon-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-btn svg {
    width: 22px;
    height: 22px;
  }
.avatar-small {
    width: 48px;        /* ← AUMENTAR de 100% para tamanho fixo maior */
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
}
  .badge {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 20px;
    height: 20px;
    background: #ff4757;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #0a0a0a;
    animation: pulse 2s infinite;
  }

  .lock-icon {
    position: absolute;
    bottom: -5px;
    right: -5px;
    font-size: 12px;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* Main Content - Fixed Layout */
.match-main {
    min-height: 100vh;
    padding-top: 134px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;
  }

  /* Cards Wrapper - Contains everything */
.cards-wrapper {
    width: 100%;
    max-width: 450px;
padding: 8px 20px 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
  }

  /* Cards Container - Only for the cards */
.cards-container {
    position: relative;
    width: 100%;
    height: 480px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    margin-top: 0;
  }

 .song-card {
    position: absolute;
    width: 100%;
    max-width: 380px;
    background: #1e1e1e;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
    cursor: grab;
    user-select: none;
    will-change: transform;
    top: 0;
    left: 50%;
    margin-left: -190px;
    transform-origin: center top;
  }

  .song-card:active {
    cursor: grabbing;
  }

  .card-media {
    height: 260px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  }

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Visualizer */
  .visualizer {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;
    align-items: flex-end;
    height: 60px;
    padding: 0 20px;
  }

  .visualizer .bar {
    width: 6px;
    background: #1db954;
    border-radius: 3px;
    animation: dance 0.5s ease-in-out infinite alternate;
  }

  @keyframes dance {
    from { height: 10px; opacity: 0.5; }
    to { height: 50px; opacity: 1; }
  }

  /* Play Button */
  .play-overlay-btn {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(10px);
    border: 3px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 10;
  }

  .play-overlay-btn:hover {
    background: rgba(29, 185, 84, 0.9);
    border-color: #1db954;
    transform: scale(1.1);
  }

  .play-overlay-btn.playing {
    background: #1db954;
    border-color: #1db954;
    color: #000;
    animation: pulse-play 2s infinite;
  }

  @keyframes pulse-play {
    0%, 100% { box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.7); }
    50% { box-shadow: 0 0 0 20px rgba(29, 185, 84, 0); }
  }

  .play-overlay-btn svg {
    width: 36px;
    height: 36px;
    margin-left: 4px;
  }

  /* Swipe Indicators */
  .swipe-indicator {
    position: absolute;
    top: 40px;
    padding: 0.75rem 1.5rem;
    border-radius: 16px;
    font-weight: 900;
    font-size: 1.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0;
    transition: all 0.3s;
    border: 4px solid;
    text-transform: uppercase;
    letter-spacing: 2px;
    transform: rotate(-15deg) scale(0.8);
  }

  .swipe-indicator.like {
    right: 20px;
    color: #1db954;
    border-color: #1db954;
    background: rgba(29, 185, 84, 0.15);
  }

  .swipe-indicator.skip {
    left: 20px;
    color: #ff4757;
    border-color: #ff4757;
    background: rgba(255, 71, 87, 0.15);
    transform: rotate(15deg) scale(0.8);
  }

  .swipe-indicator.active {
    opacity: 1;
    transform: rotate(-15deg) scale(1);
  }

  .swipe-indicator.skip.active {
    transform: rotate(15deg) scale(1);
  }

  .swipe-indicator svg {
    width: 32px;
    height: 32px;
  }

  /* Favorite Badge on Card */
  .favorite-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
    animation: bounce 0.5s ease;
    z-index: 20;
  }

  .favorite-badge svg {
    width: 24px;
    height: 24px;
    color: #000;
  }

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  /* Card Info */
  .card-info {
    padding: 1.5rem;
    background: #1e1e1e;
  }

  .song-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  /* Login Line */
  .login-line {
    width: 100%;
    text-align: center;
    margin: 1rem 0 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .login-line span {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
  }

  .btn-login-link {
    background: transparent;
    border: none;
    color: #1db954;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    transition: all 0.3s;
  }

  .btn-login-link:hover {
    background: rgba(29, 185, 84, 0.1);
    text-decoration: underline;
  }

  /* Login Modal */
  .login-confirm-overlay {
    align-items: center;
    padding: 1.5rem;
  }

  .login-confirm-modal {
    max-height: none;
    border-radius: 24px;
    padding: 2rem;
    text-align: center;
    max-width: 360px;
  }

  .login-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: rgba(29, 185, 84, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1db954;
  }

  .login-confirm-modal h3 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    color: #fff;
  }

  .login-confirm-modal p {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .login-form-group {
    margin-bottom: 1rem;
  }

  .login-input {
    width: 100%;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s;
    font-family: inherit;
    text-align: center;
  }

  .login-input:focus {
    outline: none;
    border-color: #1db954;
    background: rgba(255, 255, 255, 0.08);
  }

  .login-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .login-error {
    color: #ff4757;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: rgba(255, 71, 87, 0.1);
    border-radius: 8px;
  }

  .login-success {
    color: #1db954;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: rgba(29, 185, 84, 0.1);
    border-radius: 8px;
  }

  .login-actions {
    display: flex;
    gap: 1rem;
  }

  .login-actions .btn-secondary,
  .login-actions .btn-login-confirm {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    font-size: 1rem;
  }

  .login-actions .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .login-actions .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .btn-login-confirm {
    background: #1db954;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-login-confirm:hover:not(:disabled) {
    background: #1ed760;
    transform: translateY(-2px);
  }

  .btn-login-confirm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .song-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    flex: 1;
  }

  .now-playing-badge {
    padding: 0.25rem 0.75rem;
    background: #1db954;
    color: #000;
    border-radius: 9999px;
    font-size: 0.625rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    animation: pulse-badge 2s infinite;
  }

  @keyframes pulse-badge {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .song-artist {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1rem;
    font-weight: 500;
  }

  .song-details {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .genre-tag {
    padding: 0.375rem 1rem;
    background: rgba(29, 185, 84, 0.15);
    color: #1db954;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
     pointer-events: none;   /* ← ADICIONAR */
  user-select: none;      /* ← ADICIONAR */
  cursor: default;    
  }

  .duration {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  /* Progress Bar */
  .progress-container {
    margin-top: 0.5rem;
  }

  .progress-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-fill {
    height: 100%;
    background: #1db954;
    border-radius: 2px;
    transition: width 0.1s linear;
  }

  .time-display {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    font-variant-numeric: tabular-nums;
  }

  /* Action Buttons Container - Fixed at bottom */
.action-buttons-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 60px;      /* ← AUMENTAR para 60px ou mais */
    padding-bottom: 40px;
  }

  .action-buttons {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    justify-content: center;
  }

  .action-btn {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }

  .action-btn svg {
    width: 32px;
    height: 32px;
  }

  .action-btn.skip {
    background: rgba(255, 71, 87, 0.1);
    color: #ff4757;
    border: 3px solid #ff4757;
  }

  .action-btn.skip:hover {
    background: #ff4757;
    color: #fff;
    transform: scale(1.15) rotate(-10deg);
  }

  .action-btn.super-like {
    width: 56px;
    height: 56px;
    background: rgba(255, 215, 0, 0.1);
    color: #ffd700;
    border: 3px solid #ffd700;
  }

  .action-btn.super-like:hover,
  .action-btn.super-like.active {
    background: #ffd700;
    color: #000;
    transform: scale(1.2);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  }

  .action-btn.like {
    background: rgba(29, 185, 84, 0.1);
    color: #1db954;
    border: 3px solid #1db954;
  }

  .action-btn.like:hover {
    background: #1db954;
    color: #000;
    transform: scale(1.15) rotate(10deg);
  }

  .instructions {
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.875rem;
    margin: 0;
  }

  .unlock-hint {
    color: #1db954;
    display: block;
    margin-top: 0.5rem;
    font-weight: 600;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 2rem;
    max-width: 400px;
    margin: auto;
  }

  .vinyl-animation {
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
    position: relative;
  }

  .vinyl {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1a1a1a 100%);
    position: relative;
    animation: spin 3s linear infinite;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  }

  .vinyl::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50px;
    height: 50px;
    background: #1db954;
    border-radius: 50%;
    border: 8px solid #0a0a0a;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .empty-state h2 {
    font-size: 1.75rem;
    margin-bottom: 1rem;
    color: #fff;
  }

  .empty-state p {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .empty-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* Buttons */
  .btn-primary, .btn-secondary {
    padding: 1rem 2rem;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
    color: #000;
    box-shadow: 0 4px 15px rgba(29, 185, 84, 0.4);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(29, 185, 84, 0.6);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: transparent;
    color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .btn-secondary:hover {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.05);
  }

  .btn-text {
    background: transparent;
    border: none;
    color: #1db954;
    font-weight: 600;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s;
  }

  .btn-text:hover {
    background: rgba(29, 185, 84, 0.1);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
  }

  .modal-content {
    background: #1a1a1a;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    border-radius: 24px 24px 0 0;
    overflow: hidden;
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .header-title {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .modal-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }

  .match-count {
    font-size: 0.875rem;
    color: #1db954;
    font-weight: 600;
  }

  .header-actions-modal {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }

  .modal-body {
    overflow-y: auto;
    flex: 1;
    padding: 1rem;
  }

  /* Matches Modal */
  .empty-matches {
    text-align: center;
    padding: 3rem 1.5rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .lock-animation {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: shake 1s ease-in-out infinite;
  }

  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }

  .empty-matches h4 {
    color: #fff;
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .progress-lock {
    margin-top: 1.5rem;
  }

  .progress-bar-lock {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-bar-lock .fill {
    height: 100%;
    background: linear-gradient(90deg, #1db954, #1ed760);
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .matches-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .match-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 1.25rem;
    transition: all 0.3s;
    cursor: pointer;
  }

  .match-card:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }

  .match-header-card {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .match-avatars {
    position: relative;
    display: flex;
    align-items: center;
  }

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #1a1a1a;
  }

  .avatar.you {
    position: relative;
    z-index: 1;
    width: 50px;
    height: 50px;
    margin-right: -15px;
  }

  .avatar.them {
    position: relative;
    z-index: 2;
  }

  .compatibility-badge {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
    color: #000;
    font-size: 11px;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 9999px;
    border: 2px solid #1a1a1a;
    white-space: nowrap;
  }

  .icon-btn-small {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 71, 87, 0.1);
    border: none;
    color: #ff4757;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .icon-btn-small:hover {
    background: #ff4757;
    color: #fff;
  }

  .icon-btn-small svg {
    width: 18px;
    height: 18px;
  }

  .match-info h4 {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .match-location {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }

  .common-songs {
    margin-bottom: 0.75rem;
  }

  .common-songs h5 {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.5rem;
    letter-spacing: 0.5px;
  }

  .songs-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .song-tag {
    padding: 0.375rem 0.75rem;
    background: rgba(29, 185, 84, 0.15);
    color: #1db954;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .more-tag {
    padding: 0.375rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    border-radius: 9999px;
    font-size: 0.75rem;
  }

  .match-genres {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .genre-pill {
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border-radius: 9999px;
    font-size: 0.75rem;
  }

  .chat-btn-main {
    width: 100%;
    padding: 0.875rem;
    background: #1db954;
    color: #000;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s;
  }

  .chat-btn-main:hover {
    background: #1ed760;
    transform: translateY(-2px);
  }

  .chat-btn-main svg {
    width: 20px;
    height: 20px;
  }

  /* Profile Modal */
  .profile-modal-full {
    max-height: 95vh;
  }

  .profile-body {
    padding: 0;
  }

  /* Profile View */
  .profile-hero {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(180deg, rgba(29, 185, 84, 0.1) 0%, transparent 100%);
  }
.chat-name-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.chat-muted-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  opacity: 0.95;
  flex-shrink: 0;
}

.chat-delete-inline-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 71, 87, 0.12);
  border: none;
  color: #ff4757;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.chat-delete-inline-btn:hover {
  background: #ff4757;
  color: #fff;
  transform: scale(1.08);
}

.chat-blocked-state {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1.5rem;
  color: rgba(255, 255, 255, 0.75);
}

.chat-blocked-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.chat-blocked-state h4 {
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.chat-blocked-state p {
  max-width: 300px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
}

.chat-input-blocked {
  padding: 1rem;
  text-align: center;
  background: #1a1a1a;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #ff6b6b;
  font-weight: 600;
}

  .avatar-container {
    position: relative;
    display: inline-block;
    margin-bottom: 1rem;
  }

  .profile-avatar-large {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #1db954;
    box-shadow: 0 10px 40px rgba(29, 185, 84, 0.3);
  }

  .online-status {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: #1db954;
    border-radius: 50%;
    border: 3px solid #1a1a1a;
  }

  .profile-hero h2 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  .profile-bio {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
    max-width: 300px;
    margin: 0 auto 0.5rem;
  }

  .profile-location {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .stat-card {
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .stat-number {
    display: block;
    font-size: 1.75rem;
    font-weight: 800;
    color: #1db954;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .music-preferences {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .music-preferences h4 {
    margin-bottom: 1rem;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .genres-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .genre-cloud-tag {
    padding: 0.5rem 1rem;
    background: rgba(29, 185, 84, 0.15);
    color: #1db954;
    border-radius: 9999px;
    font-weight: 600;
    transition: all 0.3s;
  }

  .genre-cloud-tag:hover {
    background: rgba(29, 185, 84, 0.25);
    transform: scale(1.05);
  }

  /* Recent Likes with Unlike */
  .recent-likes {
    padding: 1.5rem;
  }

  .recent-likes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .recent-likes-header h4 {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .likes-count {
    font-size: 0.875rem;
    color: #1db954;
    font-weight: 600;
  }

  .mini-song-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .mini-song {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    transition: all 0.3s;
  }

  .mini-song:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .mini-cover {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
  }

  .mini-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .mini-title {
    font-weight: 600;
    font-size: 0.9375rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fff;
  }

  .mini-artist {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .unlike-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 71, 87, 0.1);
    border: none;
    color: #ff4757;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    flex-shrink: 0;
  }
.btn-delete-account {
    width: 100%;
    padding: 1rem;
    background: rgba(220, 38, 38, 0.1);
    border: 2px solid rgba(220, 38, 38, 0.3);
    color: #dc2626;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s;
    margin-top: 0.75rem;  /* ← espaço entre sair e excluir */
}

.btn-delete-account:hover {
    background: #dc2626;
    color: #fff;
    transform: translateY(-2px);
}

.btn-delete-account svg {
    width: 20px;
    height: 20px;
}

.btn-delete-account:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
  .unlike-btn:hover {
    background: #ff4757;
    color: #fff;
    transform: scale(1.1);
  }

  .unlike-btn.favorite-active {
    background: rgba(255, 215, 0, 0.2);
    color: #ffd700;
  }

  .unlike-btn.favorite-active:hover {
    background: #ffd700;
    color: #000;
  }

  .unlike-btn svg {
    width: 20px;
    height: 20px;
  }

  /* Logout Section */
  .logout-section {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 1rem;
  }

  .btn-logout {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 71, 87, 0.1);
    border: 2px solid rgba(255, 71, 87, 0.3);
    color: #ff4757;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s;
  }

  .btn-logout:hover {
    background: #ff4757;
    color: #fff;
    transform: translateY(-2px);
  }

  .btn-logout svg {
    width: 20px;
    height: 20px;
  }

  /* Logout Confirmation Modal */
  .logout-confirm-overlay {
    align-items: center;
    padding: 1.5rem;
  }

  .logout-confirm-modal {
    max-height: none;
    border-radius: 24px;
    padding: 2rem;
    text-align: center;
    max-width: 360px;
  }

  .logout-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: rgba(255, 71, 87, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ff4757;
  }

  .logout-confirm-modal h3 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    color: #fff;
  }

  .logout-confirm-modal p {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .logout-actions {
    display: flex;
    gap: 1rem;
  }

  .logout-actions .btn-secondary,
  .logout-actions .btn-logout-confirm {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
    font-size: 1rem;
  }

  .logout-actions .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .logout-actions .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .btn-logout-confirm {
    background: #ff4757;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-logout-confirm:hover {
    background: #ff3344;
    transform: translateY(-2px);
  }

  .btn-logout-confirm svg {
    width: 20px;
    height: 20px;
  }

  /* Profile Edit */
  .profile-edit {
    padding: 1.5rem;
  }

  .edit-section {
    margin-bottom: 1.5rem;
  }

  .edit-section label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }

  .edit-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
.media-preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #2a2a2a;
  border-top: 1px solid rgba(255,255,255,0.1);
  gap: 1rem;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.preview-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.preview-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon-preview {
  font-size: 2rem;
}

.preview-file-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.preview-file-name {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-file-size {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.preview-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.preview-btn.cancel {
  background: rgba(255,71,87,0.2);
  color: #ff4757;
}

.preview-btn.send {
  background: #1db954;
  color: #000;
}

.preview-btn:hover {
  transform: scale(1.1);
}
  .edit-section.half {
    margin-bottom: 0;
  }

  .avatar-edit {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.2);
  }

  .change-photo-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    border-radius: 9999px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.3s;
  }

  .change-photo-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .hidden-input {
    display: none;
  }

  .edit-input, .edit-textarea {
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #fff;
    font-size: 1rem;
    transition: all 0.3s;
    font-family: inherit;
  }

  .edit-input:focus, .edit-textarea:focus {
    outline: none;
    border-color: #1db954;
    background: rgba(255, 255, 255, 0.08);
  }

  .edit-textarea {
    resize: none;
    min-height: 80px;
  }

  .char-count {
    display: block;
    text-align: right;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    margin-top: 0.25rem;
  }

  .edit-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .edit-actions .btn-secondary,
  .edit-actions .btn-primary {
    flex: 1;
  }

  /* Match Toast */
  .match-toast {
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2000;
    animation: toastSlide 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
/* ========== EMOJI PICKER ========== */
.chat-emoji-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.chat-emoji-btn:hover,
.chat-emoji-btn.active {
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}

.emoji-picker {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  background: #2a2a2a;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
}

.emoji-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.emoji-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.2);
}

/* ========== ÁUDIO ========== */
.audio-recording {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  padding: 0.25rem 0.5rem;
}

.recording-dot {
  width: 12px;
  height: 12px;
  background: #ff4757;
  border-radius: 50%;
  animation: pulse-record 1s infinite;
}

@keyframes pulse-record {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.recording-time {
  font-weight: 600;
  color: #ff4757;
  font-variant-numeric: tabular-nums;
}

.recording-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.chat-cancel-audio {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 71, 87, 0.2);
  border: none;
  color: #ff4757;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
}

.audio-play-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audio-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  height: 30px;
}

.wave-bar {
  width: 3px;
  background: currentColor;
  border-radius: 2px;
  opacity: 0.6;
}

.audio-duration {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* ========== IMAGEM ========== */
.image-message {
  max-width: 250px;
}

.chat-image {
  width: 100%;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.chat-image:hover {
  transform: scale(1.02);
}

/* ========== ARQUIVO ========== */
.file-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.file-icon {
  font-size: 2rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.75rem;
  opacity: 0.6;
}

.file-download {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

/* ========== MENU 3 PONTOS ========== */
.chat-menu-container {
  position: relative;
}

.chat-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: #2a2a2a;
  border-radius: 16px;
  padding: 0.5rem;
  min-width: 200px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: dropdownSlide 0.2s ease;
}

@keyframes dropdownSlide {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item.danger {
  color: #ff4757;
}

.dropdown-item.danger:hover {
  background: rgba(255, 71, 87, 0.1);
}

.dropdown-item svg {
  flex-shrink: 0;
}
  @keyframes toastSlide {
    from {
      transform: translateX(-50%) translateY(-100px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  .match-toast-content {
    background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
    color: #000;
    padding: 1.25rem 1.5rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 20px 60px rgba(29, 185, 84, 0.4);
    min-width: 320px;
  }

  .match-toast.favorite-toast .match-toast-content {
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  }

  .match-avatars-toast {
    display: flex;
    align-items: center;
  }
/* ========== EMOJI PICKER PREMIUM (copiado do Vibe) ========== */
.emoji-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 20px;
}

.emoji-picker-premium {
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  background: linear-gradient(145deg, #1e1e2e 0%, #252535 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.picker-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.picker-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
}

.picker-text h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}

.picker-text p {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #888;
}

.btn-close-picker {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close-picker:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  transform: rotate(90deg);
}

.picker-search {
  position: relative;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-icon {
  position: absolute;
  left: 36px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border-radius: 14px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #1db954;
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.1);
}

.picker-categories {
  display: flex;
  gap: 6px;
  padding: 12px 24px;
  overflow-x: auto;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  scrollbar-width: none;
}

.picker-categories::-webkit-scrollbar {
  display: none;
}

.category-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 60px;
}

.category-tab.active {
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: #fff;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
}

.emoji-grid-premium {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 16px 24px;
}

.emoji-btn-premium {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 1.6rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Toast Notification System */
.toast-notification {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-radius: 16px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: toastSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
}

.toast-success {
  background: linear-gradient(135deg, rgba(29, 185, 84, 0.95) 0%, rgba(30, 215, 96, 0.95) 100%);
  color: #000;
  border: 1px solid rgba(29, 185, 84, 0.3);
}

.toast-error {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.95) 0%, rgba(239, 68, 68, 0.95) 100%);
  color: #fff;
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.toast-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(251, 191, 36, 0.95) 100%);
  color: #000;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.toast-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(96, 165, 250, 0.95) 100%);
  color: #fff;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.toast-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-icon svg {
  width: 24px;
  height: 24px;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  line-height: 1.2;
}

.toast-message {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
}

.toast-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

@keyframes toastSlide {
  from {
    transform: translateX(-50%) translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
.emoji-btn-premium:hover {
  background: rgba(29, 185, 84, 0.15);
  border-color: rgba(29, 185, 84, 0.5);
  transform: scale(1.25);
  z-index: 10;
}

.picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-done {
  padding: 10px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #1db954 0%, #1ed760 100%);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-done:hover {
  transform: translateY(-2px);
}

/* Responsivo emoji picker */
@media (max-width: 640px) {
  .emoji-picker-premium {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 20px 20px 0 0;
  }
  .emoji-grid-premium {
    grid-template-columns: repeat(6, 1fr);
  }
}
  .match-avatars-toast img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 3px solid #fff;
    object-fit: cover;
  }

  .match-avatars-toast img:first-child {
    margin-right: -12px;
    z-index: 1;
  }

  .match-toast-text {
    flex: 1;
  }

  .match-toast-text h4 {
    font-size: 1rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
  }

  .match-toast-text p {
    font-size: 0.875rem;
    opacity: 0.9;
    margin: 0;
  }

  .btn-primary-small {
    padding: 0.5rem 1rem;
    background: #000;
    color: #1db954;
    border: none;
    border-radius: 9999px;
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s;
  }

  .favorite-toast .btn-primary-small {
    color: #b8860b;
  }

  .btn-primary-small:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
/* ============================================ */
/* CHAT STYLES - Instagram/Whatsapp inspired   */
/* ============================================ */

/* Chat Button */
.chat-btn {
  position: relative;
}

.chat-badge {
  background: #ff4757 !important;
}

/* Chat List Modal */
.chat-list-overlay {
  align-items: flex-end;
}

.chat-list-modal {
  max-height: 85vh;
  border-radius: 24px 24px 0 0;
}

.chat-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-list-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.chat-list-title h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}
.delete-msg-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 2px;
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0;
}

.message:hover .delete-msg-btn {
  opacity: 1;
}

.delete-msg-btn:hover {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.message-sent .delete-msg-btn {
  color: rgba(0, 0, 0, 0.5);
}

.message-sent .delete-msg-btn:hover {
  color: #000;
  background: rgba(0, 0, 0, 0.15);
}
.unread-badge {
  background: #ff4757;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  min-width: 20px;
  text-align: center;
}

.chat-list-body {
  overflow-y: auto;
  max-height: calc(85vh - 70px);
}

.empty-chats {
  text-align: center;
  padding: 3rem 1.5rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-chat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-chats h4 {
  color: #fff;
  margin-bottom: 0.5rem;
}

/* Chat Items */
.chat-items {
  display: flex;
  flex-direction: column;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.chat-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.chat-item.unread {
  background: rgba(29, 185, 84, 0.05);
}

.chat-avatar {
  position: relative;
  flex-shrink: 0;
}

.chat-avatar img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #1db954;
  border-radius: 50%;
  border: 2px solid #1a1a1a;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.chat-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.chat-preview {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0.25rem 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-item.unread .chat-preview {
  color: #fff;
  font-weight: 500;
}

.unread-count {
  background: #1db954;
  color: #000;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
}

/* ============================================ */
/* CHAT CONVERSATION - Whatsapp Style          */
/* ============================================ */

.chat-overlay {
  position: fixed;
  inset: 0;
  background: #0a0a0a;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  animation: chatSlideIn 0.3s ease;
}

@keyframes chatSlideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0a0a0a;
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.chat-back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.chat-back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.chat-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-user-details h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.chat-status {
  font-size: 0.75rem;
  color: #1db954;
}

.chat-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat Messages Area */
.chat-messages {
  flex: 1;
  overflow-y: auto;
   overflow-x: hidden;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: linear-gradient(180deg, #0a0a0a 0%, #111 100%);
}

.chat-welcome {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.welcome-bubble {
  background: rgba(29, 185, 84, 0.1);
  border: 1px solid rgba(29, 185, 84, 0.2);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  text-align: center;
  max-width: 280px;
}

.welcome-bubble p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.welcome-bubble p:first-child {
  color: #1db954;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

/* Message Bubbles */
.message {
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
}

.message-sent {
  align-self: flex-end;
  background: #1db954;
  color: #000;
  border-bottom-right-radius: 4px;
}

.message-received {
  align-self: flex-start;
  background: #2a2a2a;
  color: #fff;
  border-bottom-left-radius: 4px;
}

.message-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.4;
}

.message-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.message-time {
  font-size: 0.6875rem;
  opacity: 0.7;
}

.message-status svg {
  opacity: 0.7;
}

.message-status svg.read {
  color: #0066cc;
  opacity: 1;
}

/* Music Card in Chat */
.message-musica {
  padding: 0.5rem;
  max-width: 85%;
}

.musica-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 0.5rem;
}

.musica-cover {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.musica-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.musica-title {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.musica-artist {
  font-size: 0.75rem;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.musica-play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.musica-play:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Chat Input Area */
.chat-input-area {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #1a1a1a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.chat-attach-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.chat-attach-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.chat-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #2a2a2a;
  border-radius: 24px;
  padding: 0.5rem 0.75rem;
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.9375rem;
  outline: none;
  padding: 0.25rem 0.5rem;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.chat-send-btn,
.chat-mic-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.chat-send-btn {
  background: #1db954;
  color: #000;
}

.chat-send-btn:hover {
  background: #1ed760;
  transform: scale(1.1);
}

.chat-mic-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
}

.chat-mic-btn:hover {
  color: #fff;
}

/* Attach Menu */
.attach-menu {
  position: absolute;
  bottom: 70px;
  left: 1rem;
  background: #2a2a2a;
  border-radius: 16px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  animation: attachSlideUp 0.2s ease;
}

@keyframes attachSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.attach-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.attach-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.attach-icon {
  font-size: 1.5rem;
}

/* Chat Slide Transition */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  transform: translateX(100%);
}
/* ===== AVATAR DOURADO NO MUSICAL MATCH ===== */

/* Avatar pequeno no header */
.avatar-small-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-small-wrapper.avatar-gold {
  padding: 2px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
  box-shadow:
    0 0 0 1px #B8860B,
    0 0 8px rgba(255, 215, 0, 0.4);
}

.avatar-small-wrapper.avatar-gold .avatar-small {
  border-radius: 50%;
  border: 2px solid #1a1a2e;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  object-fit: cover;
}

/* Avatar grande no modal de perfil */
.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
}

.avatar-container.avatar-gold {
  padding: 4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
  box-shadow:
    0 0 0 2px #B8860B,
    0 0 20px rgba(255, 215, 0, 0.5),
    0 4px 16px rgba(0, 0, 0, 0.3);
}

.avatar-container.avatar-gold .profile-avatar-large {
  border-radius: 50%;
  border: 3px solid #1a1a2e;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  object-fit: cover;
}

/* Avatar no modal de matches */
.avatar-wrapper-match {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-wrapper-match.avatar-gold {
  padding: 2px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
  box-shadow: 0 0 0 1px #B8860B;
}

.avatar-wrapper-match.avatar-gold .avatar.you {
  border-radius: 50%;
  border: 2px solid #1a1a2e;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  object-fit: cover;
}
/* Responsive */
@media (max-width: 480px) {
  .chat-list-modal {
    max-height: 90vh;
  }

  .message {
    max-width: 85%;
  }

  .chat-input-area {
    padding: 0.5rem 0.75rem;
  }
}
  /* Transitions */
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
    transform: translateY(100%);
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.5s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-100px);
  }
/* Adicione no <style scoped> */
.song-card {
  touch-action: pan-y; /* Permite scroll vertical, captura horizontal */
  -webkit-user-select: none;
  user-select: none;
}

.song-card.top-card {
  touch-action: none; /* Bloqueia tudo no card ativo */
}
  /* Responsive */
  @media (max-width: 480px) {
    .onboarding-content {
      padding: 1.5rem;
    }
   
    .welcome-title {
      font-size: 2rem;
    }
   
    .features-preview {
      gap: 1rem;
    }
   
    .feature-icon {
      width: 56px;
      height: 56px;
      font-size: 1.75rem;
    }
   
    .form-row {
      grid-template-columns: 1fr;
    }
   
    .cards-wrapper {
      padding: 15px;
    }
   
    .cards-container {
      height: 480px;
    }
   
    .song-card {
      max-width: 100%;
      margin-left: 0;
      left: 0;
      right: 0;
    }
   
    .card-media {
      height: 280px;
    }
   
    .song-title {
      font-size: 1.25rem;
    }
   
    .action-buttons {
      gap: 1rem;
    }
   
    .action-btn {
      width: 64px;
      height: 64px;
    }
   
    .action-btn svg {
      width: 28px;
      height: 28px;
    }
   
    .instructions {
      font-size: 0.8125rem;
    }
   
    .match-toast {
      left: 15px;
      right: 15px;
      transform: none;
    }
   
    .match-toast-content {
      min-width: auto;
    }
   
    .genre-selector {
      gap: 0.5rem;
    }
   
    .genre-select-btn {
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
    }

    .logout-actions {
      flex-direction: column;
    }

    .logout-confirm-modal {
      padding: 1.5rem;
    }
  }
  </style>