// src/utils/spotifyPlayer.js

let playerInstance = null
let deviceId = null
let isReady = false

export async function initSpotifyPlayer(getTokenFn) {
  // ✅ CORREÇÃO: Aguarda o SDK estar disponível (já carregado no index.html)
  if (!window.Spotify) {
    await new Promise((resolve) => {
      // Se o SDK já disparou o evento, resolve imediatamente
      if (window.SpotifySDKReady && window.Spotify) {
        resolve()
        return
      }
      
      // Senão, espera o evento customizado
      const handler = () => {
        window.removeEventListener('spotify-sdk-ready', handler)
        resolve()
      }
      window.addEventListener('spotify-sdk-ready', handler)
      
      // Timeout de segurança (10 segundos)
      setTimeout(() => {
        window.removeEventListener('spotify-sdk-ready', handler)
        if (window.Spotify) resolve()
        else reject(new Error('Spotify SDK timeout'))
      }, 10000)
    })
  }

  // Reutiliza player existente
  if (playerInstance) {
    return { player: playerInstance, deviceId }
  }

 const player = new window.Spotify.Player({
  name: 'SoundUp Music',
  getOAuthToken: async (cb) => {
    try {
      const token = await getTokenFn()
      
      // 🔥 VALIDA antes de devolver
      if (!token || typeof token !== 'string' || token.length < 20) {
        console.error('[SPOTIFY] Token inválido recebido, abortando')
        cb('')  // devolve vazio para o SDK parar de tentar
        return
      }
      
      cb(token)
    } catch (e) {
      console.error('[SPOTIFY] Token error:', e)
      cb('')
    }
  },
  volume: 0.5
})


  // Event listeners...
  player.addListener('ready', ({ device_id }) => {
    console.log('[SPOTIFY] Ready:', device_id)
    deviceId = device_id
    isReady = true
  })

  player.addListener('not_ready', ({ device_id }) => {
    console.log('[SPOTIFY] Offline:', device_id)
    deviceId = null
    isReady = false
  })

  player.addListener('initialization_error', ({ message }) => {
    console.error('[SPOTIFY] Init error:', message)
  })

  player.addListener('authentication_error', ({ message }) => {
    console.error('[SPOTIFY] Auth error:', message)
  })

  player.addListener('account_error', ({ message }) => {
    console.error('[SPOTIFY] Premium required:', message)
  })

  player.addListener('playback_error', ({ message }) => {
    console.error('[SPOTIFY] Playback error:', message)
  })

  const connected = await player.connect()

  if (!connected) {
    throw new Error('Spotify connect failed')
  }

  // Aguarda device_id
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Spotify device timeout'))
    }, 10000)

    const interval = setInterval(() => {
      if (deviceId) {
        clearInterval(interval)
        clearTimeout(timeout)
        resolve()
      }
    }, 100)
  })

  playerInstance = player

  return { player, deviceId }
}

export function getSpotifyPlayer() {
  return playerInstance
}

export function getDeviceId() {
  return deviceId
}

export function isPlayerReady() {
  return isReady
}

export async function playOnDevice(trackUri, positionMs = 0) {
  const token = await fetchUserSpotifyToken()
  const device_id = deviceId

  if (!device_id) throw new Error('Device ID não disponível')

  await fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: [trackUri],
        position_ms: positionMs
      })
    }
  )
}

async function fetchUserSpotifyToken() {
  try {
    const res = await fetch('http://localhost:3002/spotify/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!res.ok) {
      throw new Error(`Refresh falhou: ${res.status}`)
    }
    const data = await res.json()
    if (!data.success || !data.access_token) {
      throw new Error('Token inválido retornado')
    }
    return data.access_token
  } catch (err) {
    console.error('[SPOTIFY] fetchUserSpotifyToken falhou:', err.message)
    throw err
  }
}

