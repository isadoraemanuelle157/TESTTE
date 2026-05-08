require('dotenv').config()

module.exports = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,

  SPOTIFY_AUTH_URL: 'https://accounts.spotify.com/api/token',
  SPOTIFY_API_URL: 'https://api.spotify.com/v1',
  DEEZER_API_URL: 'https://api.deezer.com'
}