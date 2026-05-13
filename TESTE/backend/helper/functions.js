const express = require('express')

function safeRequire(path) {
  try {
    return require(path)
  } catch (err) {
    console.warn(`⚠️ Rota não encontrada: ${path}`)
    return express.Router()
  }
}

module.exports = { safeRequire }