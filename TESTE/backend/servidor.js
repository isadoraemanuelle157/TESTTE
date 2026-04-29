const express = require('express')
const cors = require('cors')

const app = express()

require('./config/bancoDados')

// IMPORTA ROTAS
const usuarioRoutes = require('./routes/usuarioRoutes')
const generoRoutes = require('./routes/generosMusicaisRoutes')
const musicaRoutes = require('./routes/musicaRoutes')
const albumRoutes = require('./routes/albumRoutes')
const cantorRoutes = require('./routes/cantorRoutes')
const playlistRoutes = require('./routes/playlistRoutes')
const curtidaRoutes = require('./routes/curtidaRoutes')
const favoritaRoutes = require('./routes/favoritaRoutes')
const vibeRoutes = require('./routes/vibeRoutes')
const followRoutes = require('./routes/followRoutes')
const historicoRoutes = require('./routes/historicoRoutes')
const notificacaoRoutes = require('./routes/notificacaoRoutes')
const privacidadeAtividadeRoutes = require('./routes/privacidadeAtividadeRoutes')
const matchMusicalRoutes = require('./routes/matchMusicalRoutes')

// MIDDLEWARES
app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// USA ROTAS
app.use('/usuarios', usuarioRoutes)
app.use('/generos', generoRoutes)
app.use('/musicas', musicaRoutes)
app.use('/albuns', albumRoutes)
app.use('/cantores', cantorRoutes)
app.use('/playlists', playlistRoutes)
app.use('/curtidas', curtidaRoutes)
app.use('/favoritas', favoritaRoutes)
app.use('/vibes', vibeRoutes)
app.use('/follows', followRoutes)
app.use('/historico', historicoRoutes)
app.use('/notificacoes', notificacaoRoutes)
app.use('/privacidade', privacidadeAtividadeRoutes)
app.use('/matches', matchMusicalRoutes)

// SERVIDOR
app.listen(3002, () => {
  console.log('Servidor rodando na porta 3002')
})