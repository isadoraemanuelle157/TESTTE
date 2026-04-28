<template>
  <div class="musical-match">
    <!-- ONBOARDING / PROFILE CREATION FLOW -->
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
              <div class="feature-icon">🎵</div>
              <span>Descubra músicas</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">❤️</div>
              <span>Curta suas favoritas</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">👥</div>
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
                placeholder="São Paulo, SP"
              >
            </div>
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
                :class="{ active: onboardingData.avatar === `https://i.pravatar.cc/300?img=${n + 10}` }"
              >
                <img :src="`https://i.pravatar.cc/300?img=${n + 10}`" alt="Avatar option">
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
    <span>{{ genre.icon }}</span>
    {{ genre.nome }}
  </button>
</div>
            <span class="input-hint" :class="{ 'limit-reached': onboardingData.favoriteGenres.length >= 3 }">
              {{ onboardingData.favoriteGenres.length }}/3 selecionados
            </span>
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

    <!-- MAIN APP (Only shown after profile creation) -->
    <template v-else>
      <!-- Header -->
      <header class="match-header">
        <div class="header-content">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="currentColor" class="logo-icon">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span class="logo-text">Musical Match</span>
          </div>
          
          <div class="header-actions">
            <button class="icon-btn" @click="showMatches = true" :disabled="matches.length === 0">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <span v-if="unreadMatches > 0" class="badge">{{ unreadMatches }}</span>
              <span v-if="matches.length === 0" class="lock-icon">🔒</span>
            </button>
            
            <button class="icon-btn profile-btn" @click="openProfile">
              <img :src="currentUser.avatar" alt="Profile" class="avatar-small">
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="match-main">
        <!-- Loading State -->
        <div v-if="loading" class="empty-state">
          <div class="vinyl-animation">
            <div class="vinyl"></div>
          </div>
          <h2>Carregando músicas...</h2>
          <p>Buscando as melhores tracks do Deezer</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="currentIndex >= songs.length" class="empty-state">
          <div class="empty-illustration">
            <div class="vinyl-animation">
              <div class="vinyl"></div>
            </div>
          </div>
          <h2>Você explorou todas as músicas!</h2>
          <p>Descubra seus matches musicais ou volte mais tarde para novas recomendações</p>
          <div class="empty-actions">
            <button v-if="matches.length > 0" @click="showMatches = true" class="btn-primary">
              Ver Meus Matches ({{ matches.length }})
            </button>
            <button @click="loadMoreSongs" class="btn-secondary">
              Carregar Mais
            </button>
          </div>
        </div>

        <!-- Song Cards Stack -->
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
              <!-- Card Image / Player -->
              <div class="card-media">
                <img :src="song.cover || song.album?.cover_medium || 'https://e-cdns-images.dzcdn.net/images/cover/default/500x500.jpg'" :alt="song.title" class="cover-image">
                
                <!-- Audio Visualizer -->
                <div v-if="currentPlaying === song.id" class="visualizer">
                  <div v-for="n in 5" :key="n" class="bar" :style="{ 
                    animationDelay: n * 0.1 + 's',
                    height: Math.random() * 40 + 20 + 'px'
                  }"></div>
                </div>

                <!-- Play Button Overlay -->
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

                <!-- Swipe Indicators -->
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

                <!-- Favorite Badge -->
                <div v-if="isFavorite(song)" class="favorite-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>

              <!-- Card Info -->
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

                <!-- Progress Bar -->
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

          <!-- Action Buttons - Fixed Position -->
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
              <span v-if="matches.length === 0" class="unlock-hint">• Desbloqueie matches curtindo músicas</span>
            </p>
          </div>
        </div>
      </main>
    </template>

    <!-- Matches Modal -->
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
              <div class="lock-animation">🔒</div>
              <h4>Matches bloqueados</h4>
              <p>Curta pelo menos 3 músicas para desbloquear seus matches musicais!</p>
              <div class="progress-lock">
                <div class="progress-bar-lock">
                  <div class="fill" :style="{ width: (likedSongs.length / 3) * 100 + '%' }"></div>
                </div>
                <span>{{ likedSongs.length }}/3 músicas</span>
              </div>
            </div>
            
            <div v-else class="matches-list">
              <div v-for="match in matches" :key="match.id" class="match-card" @click="openMatchDetail(match)">
                <div class="match-header-card">
                  <div class="match-avatars">
                    <img :src="currentUser.avatar" alt="You" class="avatar you">
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

    <!-- Profile Modal with Edit -->
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
            <!-- View Mode -->
            <div v-if="!isEditing" class="profile-view">
              <div class="profile-hero">
                <div class="avatar-container">
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
    {{ genre.icon }} {{ genre.nome }}
  </span>
</div>
              </div>

              <!-- Favorites Section -->
              <div class="recent-likes" v-if="favorites.length > 0">
                <div class="recent-likes-header">
                  <h4>⭐ Favoritos</h4>
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

              <!-- Recent Likes with Unlike Button -->
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

              <!-- Logout Button -->
              <div class="logout-section">
                <button @click="confirmLogout" class="btn-logout">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Sair da conta
                </button>
              </div>
            </div>

            <!-- Edit Mode -->
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

    <!-- Logout Confirmation Modal -->
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

    <!-- Match Notification -->
    <Transition name="toast">
      <div v-if="showMatchNotification" class="match-toast">
        <div class="match-toast-content">
          <div class="match-avatars-toast">
            <img :src="currentUser.avatar" alt="You">
            <img :src="lastMatch?.user.avatar" alt="Match">
          </div>
          <div class="match-toast-text">
            <h4>It's a Musical Match! 🎵</h4>
            <p>Você e {{ lastMatch?.user.name }} curtiram as mesmas músicas</p>
          </div>
          <button @click="viewMatch" class="btn-primary-small">Ver</button>
        </div>
      </div>
    </Transition>

    <!-- Favorite Toast -->
    <Transition name="toast">
      <div v-if="showFavoriteToast" class="match-toast favorite-toast">
        <div class="match-toast-content">
          <div class="match-toast-text">
            <h4>⭐ Adicionado aos Favoritos!</h4>
            <p>{{ lastFavorited?.title }} foi salva nos seus favoritos</p>
          </div>
          <button @click="showFavoriteToast = false" class="btn-primary-small">OK</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'MusicalMatch',
  
  data() {
    return {
      // Onboarding flow
      hasProfile: false,
      onboardingStep: 1,
      creatingProfile: false,
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
      // App state
      currentIndex: 0,
      dragOffset: 0,
      dragStartX: 0,
      isDragging: false,
      swipingLeft: false,
      swipingRight: false,
      showMatches: false,
      showProfile: false,
      isEditing: false,
      showMatchNotification: false,
      showFavoriteToast: false,
      showLogoutConfirm: false,
      unreadMatches: 0,
      currentPlaying: null,
      progress: 0,
      currentTime: 0,
      progressInterval: null,
      lastMatch: null,
      lastFavorited: null,
      loading: true,
      audio: null,
      
      currentUser: {
        name: '',
        age: null,
        avatar: '',
        bio: '',
        location: ''
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
      matches: [],
      
      // Deezer API endpoints (CORS proxy needed for production)
      deezerEndpoints: [
        'https://api.deezer.com/chart/0/tracks?limit=20',
        'https://api.deezer.com/search?q=pop&limit=20',
        'https://api.deezer.com/search?q=rock&limit=20',
        'https://api.deezer.com/search?q=hip-hop&limit=20',
        'https://api.deezer.com/search?q=electronic&limit=20'
      ]
    }
  },

  computed: {
    favoriteGenreObjects(){
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
        const genre = song.album?.title || 'Pop'
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
             this.onboardingData.age <= 100
    },
    
    canFinish() {
      return this.onboardingData.bio.trim().length >= 10 && 
             this.onboardingData.favoriteGenres.length > 0
    }
  },

 async mounted() {
  await this.fetchGenres()

  const savedProfile = localStorage.getItem('musicalMatchProfile')
  if (savedProfile) {
    this.currentUser = JSON.parse(savedProfile)
    this.hasProfile = true

    await Promise.all([
      this.buscarSugestoes(),
      this.buscarCurtidas(),
      this.buscarFavoritos(),
      this.buscarMatches()
    ])
  } else {
    this.loading = false
  }
},

  methods: {
    async buscarSugestoes() {
  try {
    this.loading = true
    const { data } = await api.get('/matches/sugestoes')

    this.songs = (data.cards || []).map(track => ({
      id: track.id || track.deezerId,
      deezerId: track.deezerId || track.id,
      title: track.title || track.titulo,
      artist: track.artist || { name: track.artista },
      album: track.album || {
        title: '',
        cover_medium: track.cover || track.capa,
        cover_small: track.cover || track.capa
      },
      cover: track.cover || track.capa,
      duration: track.duration || track.duracao,
      preview: track.preview,
      genre: track.genre || ''
    }))

    this.currentIndex = 0
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error)
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

    this.likedSongs = (data.curtidas || []).map(item => item.musica)
  } catch (error) {
    console.error('Erro ao buscar curtidas:', error)
  }
},

async buscarFavoritos() {
  try {
    const { data } = await api.get('/matches/curtidas', {
      params: { tipo: 'favorite' }
    })

    this.favorites = (data.curtidas || []).map(item => item.musica)
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error)
  }
},

async buscarMatches() {
  try {
    const { data } = await api.get('/matches/matches')
    this.matches = data.matches || []
    this.unreadMatches = data.naoVistos || 0
  } catch (error) {
    console.error('Erro ao buscar matches:', error)
  }
},

async fetchGenres() {
  try {
    this.loadingGenres = true

    const response = await fetch('http://localhost:3002/generos')

    if (!response.ok) {
      throw new Error('Erro ao buscar gêneros')
    }

    const data = await response.json()

    let generos = []

    // se backend retornar array normal
    if (Array.isArray(data)) {
      generos = data
    }

    // se retornar objeto agrupado, pega TODAS categorias do objeto
    else if (data && typeof data === 'object') {
      generos = Object.values(data).flat()
    }

    // remover duplicados
    const ids = new Set()

    this.availableGenres = generos
      .filter(g => {
        if (!g?._id || ids.has(g._id)) return false
        ids.add(g._id)
        return true
      })
      .sort((a,b)=>
        (b.popularidade || 0) - (a.popularidade || 0)
      )
      .map(g => ({
        _id: g._id,
        nome: g.nome,
        icon: g.icon || '🎵',
        color: g.color || '#8b5cf6'
      }))

    console.log(
      'Total gêneros:',
      this.availableGenres.length,
      this.availableGenres
    )

  } catch (error) {
    console.error('Erro ao carregar gêneros:', error)
  } finally {
    this.loadingGenres = false
  }
},
    // Onboarding methods
    nextStep() {
      if (this.onboardingStep < 4) {
        this.onboardingStep++
      }
    },
    
    prevStep() {
      if (this.onboardingStep > 1) {
        this.onboardingStep--
      }
    },
    
    triggerOnboardingFileInput() {
      this.$refs.onboardingFileInput.click()
    },
    
    handleOnboardingFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          this.onboardingData.avatar = event.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    
    removePhoto() {
      this.onboardingData.avatar = ''
    },
    
    selectPresetAvatar(n) {
      this.onboardingData.avatar = `https://i.pravatar.cc/300?img=${n + 10}`
    },
    
  toggleGenre(genre){
 const id = genre._id

 const index =
   this.onboardingData.favoriteGenres.indexOf(id)

 if(index > -1){
   this.onboardingData.favoriteGenres.splice(index,1)
 }
 else if(this.onboardingData.favoriteGenres.length < 3){
   this.onboardingData.favoriteGenres.push(id)
 }
},

isGenreSelected(id){
 return this.onboardingData.favoriteGenres.includes(id)
},
    
   async finishOnboarding() {
  try {
    this.creatingProfile = true

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || user._id

    if (!userId) {
      throw new Error('Usuário logado não encontrado')
    }

    const { data } = await api.put(`/usuarios/${userId}`, {
      nome: this.onboardingData.name,
      idade: this.onboardingData.age,
      avatar: this.onboardingData.avatar,
      bio: this.onboardingData.bio,
      localizacao: this.onboardingData.location,
      generos: this.onboardingData.favoriteGenres,
      onboardingCompleto: true
    })

    const updatedUser = data.user

    this.currentUser = {
      id: updatedUser.id,
      name: updatedUser.nome,
      age: updatedUser.idade,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      location: updatedUser.localizacao,
      favoriteGenres: updatedUser.generos || []
    }

    localStorage.setItem('musicalMatchProfile', JSON.stringify(this.currentUser))

    this.hasProfile = true

    await Promise.all([
      this.buscarSugestoes(),
      this.buscarCurtidas(),
      this.buscarFavoritos(),
      this.buscarMatches()
    ])
  } catch (error) {
    console.error('Erro ao finalizar onboarding:', error)
  } finally {
    this.creatingProfile = false
  }
},

    // Logout methods
    confirmLogout() {
      this.showLogoutConfirm = true
    },
    
    cancelLogout() {
      this.showLogoutConfirm = false
    },
    
    logout() {
      // Clear all data
      localStorage.removeItem('musicalMatchProfile')
      
      // Reset all state
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
  name:'',
  age:null,
  avatar:'',
  bio:'',
  location:'',
  favoriteGenres:[]
}
      this.likedSongs = []
      this.favorites = []
      this.matches = []
      this.unreadMatches = 0
      this.currentIndex = 0
      this.showProfile = false
      this.showLogoutConfirm = false
      
      // Stop any playing audio
      this.stopAudio()
    },

    // Fetch songs from Deezer API
    async fetchSongsFromDeezer() {
      this.loading = true
      try {
        // Try multiple endpoints to get variety
        const randomEndpoint = this.deezerEndpoints[Math.floor(Math.random() * this.deezerEndpoints.length)]
        
        // Using corsfix proxy to handle CORS
        const proxyUrl = 'https://proxy.corsfix.com/?'
        const response = await fetch(proxyUrl + randomEndpoint)
        
        if (!response.ok) throw new Error('Failed to fetch')
        
        const data = await response.json()
        
        // Format Deezer tracks to match our app structure
        const tracks = (data.data || []).map(track => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album,
          cover: track.album?.cover_medium,
          duration: track.duration,
          preview: track.preview, // 30s preview URL
          genre: track.album?.title || 'Music',
          rank: track.rank
        }))
        
        // Shuffle and set
        this.songs = this.shuffleArray(tracks)
        this.loading = false
      } catch (error) {
        console.error('Error fetching from Deezer:', error)
        // Fallback to mock data if API fails
        this.loadFallbackData()
      }
    },

async loadMoreSongs() {
  await this.buscarSugestoes()
},

    loadFallbackData() {
      // Keep some fallback data in case API fails
      this.songs = [
        {
          id: 1,
          title: 'Die With A Smile',
          artist: { name: 'Lady Gaga & Bruno Mars' },
          album: { title: 'Hit Pop', cover_medium: null },
          cover: null,
          duration: 195,
          preview: null,
          genre: 'Pop'
        }
      ]
      this.loading = false
    },

    shuffleArray(array) {
      const newArray = [...array]
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
      }
      return newArray
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
      
      return {
        transform: `translateY(${offset * 12}px) scale(${1 - offset * 0.04}) rotate(${offset * 2}deg)`,
        zIndex: index,
        opacity: 1 - offset * 0.15
      }
    },

    startDrag(e) {
      if (this.currentPlaying) {
        this.stopAudio()
      }
      this.isDragging = true
      this.dragStartX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
    },

    onDrag(e) {
      if (!this.isDragging) return
      e.preventDefault()
      const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
      this.dragOffset = x - this.dragStartX
      
      this.swipingRight = this.dragOffset > 50
      this.swipingLeft = this.dragOffset < -50
    },

    endDrag() {
      if (!this.isDragging) return
      
      if (this.dragOffset > 120) {
        this.swipeRight()
      } else if (this.dragOffset < -120) {
        this.swipeLeft()
      }
      
      this.isDragging = false
      this.dragOffset = 0
      this.swipingLeft = false
      this.swipingRight = false
    },

swipeLeft() {
  this.currentIndex++
  this.animateCard('left')
},

   async swipeRight() {
  try {
    const currentSong = this.songs[this.currentIndex]
    if (!currentSong) return

    await api.post('/matches/curtidas', {
      track: currentSong,
      tipo: 'like'
    })

    this.likedSongs.push(currentSong)
    this.currentIndex++
    this.animateCard('right')

    await this.buscarMatches()

    if (this.matches.length > 0) {
      this.lastMatch = this.matches[0]
      this.showMatchNotification = true

      setTimeout(() => {
        this.showMatchNotification = false
      }, 5000)
    }
  } catch (error) {
    console.error('Erro ao curtir música:', error)
  }
},

    // Toggle favorite (star button)
  async toggleFavorite() {
  try {
    const currentSong = this.songs[this.currentIndex]
    if (!currentSong) return

    const index = this.favorites.findIndex(f => f.id === currentSong.id)

    if (index > -1) {
      await api.delete(`/matches/curtidas/${currentSong.id}`)
      this.favorites.splice(index, 1)
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
    console.error('Erro ao favoritar música:', error)
  }
},

    isFavorite(song) {
      if (!song) return false
      return this.favorites.some(f => f.id === song.id)
    },

    removeFavorite(song) {
      const index = this.favorites.findIndex(f => f.id === song.id)
      if (index > -1) {
        this.favorites.splice(index, 1)
      }
    },

    superLike() {
      // Now same as favorite
      this.toggleFavorite()
    },

   async unlikeSong(song) {
  try {
    await api.delete(`/matches/curtidas/${song.id}`)
    this.likedSongs = this.likedSongs.filter(s => s.id !== song.id)
    await this.buscarMatches()
  } catch (error) {
    console.error('Erro ao remover curtida:', error)
  }
},

    generateMatches() {
      const mockUsers = [
        { name: 'Ana', age: 22, avatar: 'https://i.pravatar.cc/300?img=5', location: 'Rio de Janeiro, RJ' },
        { name: 'Pedro', age: 25, avatar: 'https://i.pravatar.cc/300?img=3', location: 'São Paulo, SP' },
        { name: 'Julia', age: 23, avatar: 'https://i.pravatar.cc/300?img=9', location: 'Belo Horizonte, MG' }
      ]
      
      const commonSongs = this.likedSongs.slice(0, 3).map(s => s.title)
      
      this.matches = mockUsers.map((user, index) => ({
        id: Date.now() + index,
        user,
        compatibility: 85 + Math.floor(Math.random() * 14),
        commonSongs: commonSongs.slice(0, 2 + Math.floor(Math.random() * 2)),
        commonGenres: [...new Set(this.likedSongs.map(s => s.album?.title || 'Pop'))].slice(0, 2),
        unread: true
      }))
      
      this.unreadMatches = this.matches.length
      this.showMatchNotification = true
      this.lastMatch = this.matches[0]
      
      setTimeout(() => {
        this.showMatchNotification = false
      }, 5000)
    },

    addNewMatch() {
      const names = ['Maria', 'Lucas', 'Beatriz', 'Gabriel', 'Sofia']
      const randomName = names[Math.floor(Math.random() * names.length)]
      const newMatch = {
        id: Date.now(),
        user: {
          name: randomName,
          age: 20 + Math.floor(Math.random() * 10),
          avatar: `https://i.pravatar.cc/300?img=${Math.floor(Math.random() * 70)}`,
          location: 'Brasil'
        },
        compatibility: 75 + Math.floor(Math.random() * 20),
        commonSongs: this.likedSongs.slice(-2).map(s => s.title),
        commonGenres: [this.likedSongs[this.likedSongs.length - 1]?.album?.title || 'Pop'],
        unread: true
      }
      
      this.matches.unshift(newMatch)
      this.unreadMatches++
      this.lastMatch = newMatch
      this.showMatchNotification = true
      
      setTimeout(() => {
        this.showMatchNotification = false
      }, 5000)
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
        // Play Deezer preview
        this.audio = new Audio(song.preview)
        this.audio.play()
        this.currentPlaying = song.id
        
        this.audio.addEventListener('ended', () => {
          this.stopAudio()
        })
        
        // Simulate progress
        this.progressInterval = setInterval(() => {
          this.progress += 2
          this.currentTime += 0.6
          
          if (this.progress >= 100) {
            this.stopAudio()
          }
        }, 100)
      } else {
        // Fallback simulation
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
      if (this.isEditing) {
        this.cancelEdit()
      }
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
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id || user._id

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
      name: updatedUser.nome,
      age: updatedUser.idade,
      bio: updatedUser.bio,
      location: updatedUser.localizacao,
      avatar: updatedUser.avatar
    }

    localStorage.setItem('musicalMatchProfile', JSON.stringify(this.currentUser))
    this.isEditing = false
  } catch (error) {
    console.error('Erro ao salvar perfil:', error)
  }
},

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    handleFileChange(e) {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          this.editForm.avatar = event.target.result
        }
        reader.readAsDataURL(file)
      }
    },

async closeMatches() {
  try {
    const unread = this.matches.filter(m => m.unread)

    await Promise.all(
      unread.map(match => api.put(`/matches/matches/${match.id}/visto`))
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
      console.log('View profile:', match.user.name)
    },

    removeMatch(match) {
      this.matches = this.matches.filter(m => m.id !== match.id)
    },

async startChat(match) {
  try {
    if (match.status === 'pendente') {
      await api.put(`/matches/matches/${match.id}/responder`, {
        resposta: 'aceito'
      })
    }

    this.showMatches = false
    console.log('Abrir chat do match:', match.id)
  } catch (error) {
    console.error('Erro ao iniciar conversa:', error)
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
      this.fetchSongsFromDeezer()
    },

    animateCard(direction) {
      // CSS handles the animation
    }
  },

  beforeUnmount() {
    this.stopAudio()
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

/* Header */
.match-header {
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 1rem 0;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
}

.icon-btn {
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
  width: 100%;
  height: 100%;
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
  padding-top: 80px;
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
  padding: 20px;
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
  height: 520px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
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
}

.song-card:active {
  cursor: grabbing;
}

.card-media {
  height: 320px;
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
  gap: 1rem;
  margin-top: 20px;
  padding-bottom: 20px;
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