require('dotenv').config()

module.exports = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,

  SPOTIFY_API_URL: 'https://api.spotify.com/v1',
  SPOTIFY_AUTH_URL: 'https://accounts.spotify.com/api/token',
  SPOTIFY_ACCOUNTS_URL: 'https://accounts.spotify.com/authorize',
  DEEZER_API_URL: 'https://api.deezer.com',
  
  // ✅ NOVO: Redirect URI para OAuth
 SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3002/spotify/callback',
  // ✅ NOVO: Scopes necessários para streaming completo
SPOTIFY_SCOPES: [
  'streaming',                    // ← OBRIGATÓRIO para Web Playback SDK
  'user-read-private',
  'user-read-email',
  'user-read-playback-state',     // ← Ler estado do player
  'user-modify-playback-state',   // ← Controlar playback (play/pause/seek)
  'user-read-currently-playing',  // ← Saber o que está tocando
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',            // ← Para curtidas/favoritos do Spotify
  'user-library-modify'             // ← Para adicionar/remover curtidas
].join(' '),

 FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
}