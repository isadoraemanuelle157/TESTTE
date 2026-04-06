  const mongoose = require('mongoose');

  const url = "mongodb+srv://isadoraemanuelle176:isamanu7@trabalhofinal.dj6x0yt.mongodb.net/soundUp?retryWrites=true&w=majority";

  mongoose.connect(url)
    .then(() => console.log("Conectado ao MongoDB Atlas!"))
    .catch(err => console.error("Erro ao conectar:", err));

  mongoose.connection.on('error', err => {
    console.error('Erro na conexão:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB desconectado');
  });

  module.exports = mongoose;