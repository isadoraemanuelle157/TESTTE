const express = require('express')


export function safeRequire(path: string) {
  try {
    return require(path)
  } catch (err) {
    console.warn(`⚠️ Rota não encontrada: ${path}`)
    return express.Router()
  }
}
