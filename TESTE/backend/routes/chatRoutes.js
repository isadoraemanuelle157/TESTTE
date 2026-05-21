const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')  // ← FALTAVA ISSO!

const { requireAuth } = require('../middleware/auth')
const chatController = require('../controllers/chatController')

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'chat')

if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  } catch (err) {
    console.error('❌ Erro ao criar pasta uploads:', err)
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname) || '.bin'
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

const fileFilter = (req, file, cb) => {
const allowedMimes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
  'audio/mpeg', 'audio/webm', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/x-m4a',
  'application/pdf', 'text/plain', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de arquivo não suportado'), false)
  }
}

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
})

// ============================================
// 📦 ROTAS
// ============================================

router.get('/', requireAuth, chatController.listarChats)
router.post('/iniciar', requireAuth, chatController.iniciarChat)
router.post('/:chatId/mensagens', requireAuth, chatController.enviarMensagem)
router.put('/:chatId/lida', requireAuth, chatController.marcarLida)
router.post('/:chatId/midia', requireAuth, upload.single('midia'), chatController.enviarMidia)
router.get('/:chatId/mensagens', requireAuth, chatController.getMensagens)
router.delete('/:chatId/mensagens/:msgId', requireAuth, chatController.deletarMensagem)
router.delete('/:chatId/limpar', requireAuth, chatController.limparChat)
router.delete('/:chatId', requireAuth, chatController.excluirChat)
router.put('/:chatId/silenciar', requireAuth, chatController.silenciarChat)
router.post('/:chatId/bloquear', requireAuth, chatController.bloquearUsuario)
router.post('/:chatId/denunciar', requireAuth, chatController.denunciarChat)

module.exports = router