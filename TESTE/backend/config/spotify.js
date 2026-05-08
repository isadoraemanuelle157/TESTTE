require('dotenv').config()

module.exports = {
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,

  SPOTIFY_API_URL: 'https://api.spotify.com/v1',
  SPOTIFY_AUTH_URL: 'https://accounts.spotify.com/api/token',
  DEEZER_API_URL: 'https://api.deezer.com'
}