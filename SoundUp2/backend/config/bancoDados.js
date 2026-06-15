  
  require('dotenv').config()
  const mongoose = require('mongoose');
  
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Conectado ao MongoDB Atlas!"))
    .catch(err => console.error("Erro ao conectar:", err));

  mongoose.connection.on('error', err => {
    console.error('Erro na conexão:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB desconectado');
  });

  module.exports = mongoose;