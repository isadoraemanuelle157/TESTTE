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

// MIDDLEWARES
app.use(cors())
app.use(express.json())

// USA ROTAS
app.use('/usuarios', usuarioRoutes)
app.use('/generos', generoRoutes)
app.use('/musicas', musicaRoutes)
app.use('/albuns', albumRoutes)
app.use('/cantores', cantorRoutes)

// SERVIDOR
app.listen(3002, () => {
  console.log('Servidor rodando na porta 3002')
})