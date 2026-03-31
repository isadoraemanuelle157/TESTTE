<!-- App.vue -->
<template>
  <div class="app">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-icon">🎵</div>
        <span>MusicDash</span>
      </div>
      
      <nav>
        <div class="nav-section">
          <div class="nav-title">Menu</div>
          <a href="#" class="nav-item active">
            <span>🏠</span> Dashboard
          </a>
          <a href="#" class="nav-item">
            <span>🔍</span> Explorar
          </a>
          <a href="#" class="nav-item">
            <span>📈</span> Tendências
          </a>
          <a href="#" class="nav-item">
            <span>❤️</span> Favoritos
          </a>
        </div>
        
        <div class="nav-section">
          <div class="nav-title">Biblioteca</div>
          <a href="#" class="nav-item">
            <span>🎧</span> Playlists
          </a>
          <a href="#" class="nav-item">
            <span>🎤</span> Artistas
          </a>
          <a href="#" class="nav-item">
            <span>⏰</span> Histórico
          </a>
        </div>
      </nav>
      
      <div class="user-card">
        <div class="avatar">JS</div>
        <div class="user-info">
          <div class="name">João Silva</div>
          <div class="plan">Premium</div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main">
      <!-- Header -->
      <header class="header">
        <div>
          <h1>Bem-vindo de volta! 👋</h1>
          <p>Ouça suas músicas favoritas</p>
        </div>
        <div class="search">
          <input type="text" placeholder="Buscar músicas..." />
        </div>
      </header>

      <!-- Stats -->
      <div class="stats">
        <div class="stat-card">
          <div class="stat-icon purple">🎵</div>
          <div class="stat-value">1,247</div>
          <div class="stat-label">Músicas</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pink">⏱️</div>
          <div class="stat-value">86h</div>
          <div class="stat-label">Horas</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">❤️</div>
          <div class="stat-value">342</div>
          <div class="stat-label">Favoritos</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">📁</div>
          <div class="stat-value">28</div>
          <div class="stat-label">Playlists</div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content">
        <!-- Now Playing -->
        <div class="now-playing">
          <div class="album-art">🌙</div>
          <div class="track-info">
            <h3>Midnight City</h3>
            <p>M83 • Hurry Up, We're Dreaming</p>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <div class="controls">
              <button>⏮</button>
              <button class="play">▶</button>
              <button>⏭</button>
            </div>
          </div>
        </div>

        <!-- Recent Songs -->
        <div class="section">
          <h2>Tocadas Recentemente</h2>
          <div class="song-list">
            <div class="song-item" v-for="(song, index) in songs" :key="song.id">
              <span class="number">{{ index + 1 }}</span>
              <span class="icon">{{ song.icon }}</span>
              <div class="info">
                <div class="title">{{ song.title }}</div>
                <div class="artist">{{ song.artist }}</div>
              </div>
              <span class="duration">{{ song.duration }}</span>
            </div>
          </div>
        </div>

        <!-- Playlists -->
        <div class="section">
          <h2>Suas Playlists</h2>
          <div class="playlist-grid">
            <div class="playlist-card" v-for="playlist in playlists" :key="playlist.id">
              <div class="playlist-icon" :style="{ background: playlist.color }">
                {{ playlist.icon }}
              </div>
              <h4>{{ playlist.name }}</h4>
              <p>{{ playlist.songs }} músicas</p>
            </div>
          </div>
        </div>

        <!-- Artists -->
        <div class="section">
          <h2>Artistas Favoritos</h2>
          <div class="artist-list">
            <div class="artist-item" v-for="artist in artists" :key="artist.id">
              <div class="artist-avatar" :style="{ background: artist.color }">🎤</div>
              <div class="info">
                <div class="name">{{ artist.name }}</div>
                <div class="listeners">{{ artist.listeners }}</div>
              </div>
              <button class="follow">Seguir</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Dados locais - não puxa nada de lugar nenhum
const songs = ref([
  { id: 1, title: 'Midnight City', artist: 'M83', duration: '3:56', icon: '🌙' },
  { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', icon: '⚡' },
  { id: 3, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', icon: '⭐' },
  { id: 4, title: 'Heat Waves', artist: 'Glass Animals', duration: '3:58', icon: '🔥' },
  { id: 5, title: 'Stay', artist: 'The Kid LAROI', duration: '2:21', icon: '⚓' }
])

const playlists = ref([
  { id: 1, name: 'Vibes', songs: 45, icon: '🎧', color: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { id: 2, name: 'Workout', songs: 32, icon: '💪', color: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { id: 3, name: 'Relax', songs: 28, icon: '🌿', color: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 4, name: 'Foco', songs: 56, icon: '🎯', color: 'linear-gradient(135deg, #f59e0b, #d97706)' }
])

const artists = ref([
  { id: 1, name: 'The Weeknd', listeners: '85.2M ouvintes', color: '#6366f1' },
  { id: 2, name: 'Dua Lipa', listeners: '62.1M ouvintes', color: '#ec4899' },
  { id: 3, name: 'Coldplay', listeners: '58.9M ouvintes', color: '#10b981' }
])
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.app {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: #1e293b;
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  font-size: 24px;
  font-weight: bold;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-section {
  margin-bottom: 32px;
}

.nav-title {
  font-size: 11px;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: #94a3b8;
  text-decoration: none;
  margin-bottom: 4px;
  transition: all 0.3s;
}

.nav-item:hover, .nav-item.active {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  color: white;
}

.user-card {
  margin-top: auto;
  padding: 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-info .name {
  font-weight: 600;
  font-size: 14px;
}

.user-info .plan {
  font-size: 12px;
  color: #64748b;
}

/* Main */
.main {
  flex: 1;
  margin-left: 260px;
  padding: 32px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.header p {
  color: #94a3b8;
}

.search input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 12px 20px;
  border-radius: 12px;
  color: white;
  width: 280px;
  outline: none;
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: #1e293b;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 16px;
}

.stat-icon.purple { background: rgba(99,102,241,0.2); }
.stat-icon.pink { background: rgba(236,72,153,0.2); }
.stat-icon.green { background: rgba(16,185,129,0.2); }
.stat-icon.orange { background: rgba(245,158,11,0.2); }

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-label {
  color: #64748b;
  font-size: 13px;
}

/* Content Grid */
.content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* Now Playing */
.now-playing {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  gap: 24px;
  align-items: center;
}

.album-art {
  width: 140px;
  height: 140px;
  background: rgba(255,255,255,0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60px;
}

.track-info h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.track-info p {
  opacity: 0.8;
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  margin-bottom: 20px;
}

.progress-fill {
  width: 65%;
  height: 100%;
  background: white;
  border-radius: 2px;
}

.controls {
  display: flex;
  gap: 16px;
}

.controls button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.controls button.play {
  width: 56px;
  height: 56px;
  background: white;
  color: #6366f1;
  font-size: 20px;
}

/* Sections */
.section {
  background: #1e293b;
  border-radius: 24px;
  padding: 24px;
}

.section h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

/* Song List */
.song-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.song-item:hover {
  background: rgba(255,255,255,0.05);
}

.song-item .number {
  width: 32px;
  text-align: center;
  color: #64748b;
}

.song-item .icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.song-item .info {
  flex: 1;
}

.song-item .title {
  font-weight: 600;
  margin-bottom: 4px;
}

.song-item .artist {
  font-size: 13px;
  color: #64748b;
}

.song-item .duration {
  color: #64748b;
  font-size: 13px;
}

/* Playlist Grid */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.playlist-card {
  background: rgba(255,255,255,0.05);
  padding: 16px;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-icon {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 12px;
}

.playlist-card h4 {
  margin-bottom: 4px;
}

.playlist-card p {
  font-size: 12px;
  color: #64748b;
}

/* Artist List */
.artist-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.artist-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 12px;
}

.artist-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.artist-item .info {
  flex: 1;
}

.artist-item .name {
  font-weight: 600;
  margin-bottom: 4px;
}

.artist-item .listeners {
  font-size: 13px;
  color: #64748b;
}

.follow {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
  background: transparent;
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.follow:hover {
  background: #6366f1;
  border-color: #6366f1;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .main {
    margin-left: 0;
  }
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>