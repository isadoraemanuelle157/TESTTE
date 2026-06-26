require('dotenv').config()

module.exports = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,

  SPOTIFY_API_URL: 'https://api.spotify.com/v1',
  SPOTIFY_AUTH_URL: 'https://accounts.spotify.com/api/token',
  SPOTIFY_ACCOUNTS_URL: 'https://accounts.spotify.com/authorize',
  DEEZER_API_URL: 'https://api.deezer.com',

  // Redirect URI para OAuth
  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3002/spotify/callback',

  // Scopes necessários para streaming completo
  SPOTIFY_SCOPES: [
    'streaming',
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
    'user-library-modify'
  ].join(' '),

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
}