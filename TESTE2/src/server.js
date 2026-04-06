// server.js - backend simples
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

app.use('/api/deezer', createProxyMiddleware({
  target: 'https://api.deezer.com',
  changeOrigin: true,
  pathRewrite: { '^/api/deezer': '' }
}));

app.listen(3000);