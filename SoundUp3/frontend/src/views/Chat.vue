<template>
  <div class="chat-page">
    <!-- Header -->
    <div class="chat-header">
      <button class="btn-back" @click="$router.back()">
        <i class="fa fa-arrow-left"></i>
      </button>
      
      <div class="chat-user-info" @click="goToProfile">
        <img :src="otherUser?.avatar || defaultAvatar" class="chat-header-avatar" />
        <div>
          <h3>{{ otherUser?.nome || 'Usuário' }}</h3>
          <span v-if="isOnline" class="online-status">● online</span>
        </div>
      </div>
      
      <button class="btn-more" @click="showOptions = !showOptions">
        <i class="fa fa-ellipsis-v"></i>
      </button>
      
      <!-- Menu de opções -->
      <div v-if="showOptions" class="chat-options-menu">
        <div class="option-item" @click="silenciarChat">
          <i :class="chatSilenciado ? 'fa fa-bell' : 'fa fa-bell-slash'"></i>
          {{ chatSilenciado ? 'Dessilenciar' : 'Silenciar' }}
        </div>
        <div class="option-item danger" @click="confirmarLimpar">
          <i class="fa fa-trash"></i> Limpar conversa
        </div>
        <div class="option-item danger" @click="confirmarExcluir">
          <i class="fa fa-times-circle"></i> Excluir chat
        </div>
        <div class="option-item danger" @click="confirmarBloquear">
          <i class="fa fa-ban"></i> Bloquear usuário
        </div>
      </div>
    </div>

    <!-- Área de mensagens -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-if="loading" class="chat-loading">
        <div class="spinner-small"></div>
      </div>
      
      <div v-else-if="mensagens.length === 0" class="chat-empty">
        <i class="fa fa-comment-o"></i>
        <p>Nenhuma mensagem ainda</p>
        <span>Envie uma mensagem para iniciar a conversa</span>
      </div>
      
      <template v-else>
        <div 
          v-for="msg in mensagens" 
          :key="msg.id"
          :class="['message-bubble', { 'mine': isMyMessage(msg) }]"
        >
          <!-- Mensagem de música -->
          <div v-if="msg.tipo === 'musica'" class="msg-musica" @click="playMusica(msg.musica)">
            <img :src="msg.musica?.cover" />
            <div class="msg-musica-info">
              <h4>{{ msg.musica?.title }}</h4>
              <p>{{ msg.musica?.artist }}</p>
            </div>
            <i class="fa fa-play-circle"></i>
          </div>
          
          <!-- Mensagem de imagem -->
          <div v-else-if="msg.tipo === 'imagem'" class="msg-imagem">
            <img :src="msg.arquivo?.url" @click="abrirImagem(msg.arquivo.url)" />
          </div>
          
          <!-- Mensagem de áudio -->
          <div v-else-if="msg.tipo === 'audio'" class="msg-audio">
            <audio controls :src="msg.arquivo?.url"></audio>
          </div>
          
          <!-- Mensagem de texto normal -->
          <p v-else class="msg-texto">{{ msg.conteudo }}</p>
          
          <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
        </div>
      </template>
    </div>

    <!-- Input de mensagem -->
  <!-- ===== SUBSTITUIR a seção "Input de mensagem" do Chat.vue ===== -->

<div class="chat-input-area">
  <!-- Emoji Button -->
  <button class="btn-emoji" @click="toggleEmojiPicker" :class="{ active: showEmojiPicker }">
    <i class="fa fa-smile-o"></i>
  </button>
  
  <!-- Attach Button -->
  <button class="btn-attach" @click="showAttachMenu = !showAttachMenu">
    <i class="fa fa-plus"></i>
  </button>
  
  <!-- Menu de anexos (inspirado no Match) -->
  <div v-if="showAttachMenu" class="attach-menu">
    <div class="attach-item" @click="triggerFileInput('image')">
      <i class="fa fa-image"></i> Foto
    </div>
    <div class="attach-item" @click="triggerFileInput('file')">
      <i class="fa fa-file"></i> Arquivo
    </div>
    <div class="attach-item" @click="compartilharMusica">
      <i class="fa fa-music"></i> Música
    </div>
  </div>
  
  <!-- Emoji Picker Overlay -->
  <div v-if="showEmojiPicker" class="emoji-picker-overlay" @click.self="closeEmojiPicker">
    <div class="emoji-picker">
      <div class="picker-header">
        <span>Emojis</span>
        <button @click="closeEmojiPicker"><i class="fa fa-times"></i></button>
      </div>
      <div class="emoji-categories">
        <button 
          v-for="cat in emojiCategories" 
          :key="cat.name"
          :class="{ active: activeEmojiCategory === cat.name }"
          @click="activeEmojiCategory = cat.name"
        >
          {{ cat.icon }}
        </button>
      </div>
      <div class="emoji-grid">
        <button 
          v-for="emoji in filteredEmojis" 
          :key="emoji"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
  
  <!-- Input Wrapper -->
  <div class="input-wrapper">
    <template v-if="!gravandoAudio">
      <input 
        type="text" 
        v-model="novaMensagem" 
        @keyup.enter="enviarMensagem"
        placeholder="Digite uma mensagem..."
        :disabled="enviando"
        ref="textInput"
      />
    </template>
    
    <!-- Recording State (inspirado no Match) -->
    <template v-else>
      <div class="audio-recording">
        <div class="recording-dot"></div>
        <span class="recording-time">{{ formatarTempoAudio(tempoGravacao) }}</span>
        <span class="recording-label">Gravando...</span>
      </div>
    </template>
  </div>
  
  <!-- Send Button (text) -->
  <button 
    v-if="novaMensagem.trim() && !gravandoAudio"
    class="btn-send" 
    @click="enviarMensagem"
    :disabled="enviando"
  >
    <i class="fa fa-paper-plane"></i>
  </button>
  
  <!-- Mic Button (hold to record) - inspirado no Match -->
  <button
    v-else-if="!gravandoAudio"
    class="btn-mic"
    @mousedown="iniciarGravacao"
    @touchstart.prevent="iniciarGravacao"
    @mouseup="pararGravacao"
    @touchend.prevent="pararGravacao"
    @mouseleave="cancelarGravacao"
  >
    <i class="fa fa-microphone"></i>
  </button>
  
  <!-- Cancel Recording -->
  <button
    v-if="gravandoAudio"
    @click="cancelarGravacao"
    class="btn-cancel-audio"
  >
    <i class="fa fa-times"></i>
  </button>
  
  <!-- Confirm Recording -->
  <button
    v-if="gravandoAudio"
    @click="pararGravacao"
    class="btn-send"
  >
    <i class="fa fa-check"></i>
  </button>
</div>

<!-- Media Preview Bar (inspirado no Match) -->
<div v-if="showPreviewMidia" class="media-preview-bar">
  <div class="preview-content">
    <img v-if="previewMidia.tipo === 'imagem'" :src="previewMidia.url" class="preview-image">
    <div v-else class="preview-file">
      <i class="fa fa-file"></i>
      <div>
        <span>{{ previewMidia.nome }}</span>
        <small>{{ formatarTamanhoArquivo(previewMidia.tamanho) }}</small>
      </div>
    </div>
  </div>
  <div class="preview-actions">
    <button @click="cancelarPreview" class="btn-cancel"><i class="fa fa-times"></i></button>
    <button @click="confirmarEnvioMidia" class="btn-confirm"><i class="fa fa-check"></i></button>
  </div>
</div>

<!-- Hidden File Inputs -->
<input 
  type="file" 
  ref="fileInputImage" 
  @change="(e) => onFileSelected(e, 'imagem')"
  accept="image/*"
  style="display: none"
/>
<input 
  type="file" 
  ref="fileInputFile" 
  @change="(e) => onFileSelected(e, 'arquivo')"
  accept=".pdf,.txt,.doc,.docx"
  style="display: none"
/>
    
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Chat',
  
data() {
  return {
    chatId: null,
    mensagens: [],
    otherUser: null,
    novaMensagem: '',
    loading: true,
    enviando: false,
    showOptions: false,
    showAttachMenu: false,
    chatSilenciado: false,
    defaultAvatar: '/default-avatar.png',
    pollingInterval: null,
    
    // ===== NOVOS: Inspirados no chat do Match =====
    showEmojiPicker: false,
    activeEmojiCategory: 'Recentes',
    emojiCategories: [
      { name: 'Recentes', icon: '🕐' },
      { name: 'Smileys', icon: '😀' },
      { name: 'Música', icon: '🎵' },
      { name: 'Natureza', icon: '🌸' },
      { name: 'Comida', icon: '🍎' },
      { name: 'Símbolos', icon: '❤️' }
    ],
    emojis: {
      'Recentes': ['🎵', '🎧', '🎸', '🎹', '🥁', '🎺', '🎻', '🎬', '🎮', '🎲'],
      'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘'],
      'Música': ['🎵', '🎶', '🎼', '🎹', '🥁', '🎸', '🎻', '🎺', '🎷', '🎤', '🎧', '📻'],
      'Natureza': ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌵', '🌲', '🌳', '🌴', '🌱', '🌿'],
      'Comida': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑'],
      'Símbolos': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕']
    },
    
    // Áudio
    gravandoAudio: false,
    audioRecorder: null,
    audioChunks: [],
    tempoGravacao: 0,
    intervaloGravacao: null,
    
    // Preview de mídia
    showPreviewMidia: false,
    previewMidia: null, // { tipo, file, url, nome, tamanho }
  }
},

  computed: {
    isOnline() {
      // Simulação - pode ser substituída por WebSocket
      return Math.random() > 0.5
    },
     filteredEmojis() {
    return this.emojis[this.activeEmojiCategory] || []
  }
  },
  
  mounted() {
    this.chatId = this.$route.params.id
    this.carregarChat()
    this.iniciarPolling()
  },
  
  beforeUnmount() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }
  },
  
  methods: {
    toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker
    if (this.showEmojiPicker) {
      this.activeEmojiCategory = 'Recentes'
    }
  },
  
  closeEmojiPicker() {
    this.showEmojiPicker = false
  },
  
  insertEmoji(emoji) {
    this.novaMensagem += emoji
    this.$refs.textInput?.focus()
  },

  // ===== NOVOS: Áudio (inspirado no Match) =====
  async iniciarGravacao() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.audioRecorder = new MediaRecorder(stream)
      this.audioChunks = []

      this.audioRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data)
      }

      this.audioRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
        await this.enviarAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      this.audioRecorder.start()
      this.gravandoAudio = true
      this.tempoGravacao = 0
      
      this.intervaloGravacao = setInterval(() => {
        this.tempoGravacao++
        if (this.tempoGravacao >= 120) this.pararGravacao() // limite 2min
      }, 1000)

    } catch (err) {
      console.error('Erro ao acessar microfone:', err)
      alert('Não foi possível acessar o microfone. Verifique as permissões.')
    }
  },

  pararGravacao() {
    if (this.audioRecorder && this.audioRecorder.state !== 'inactive') {
      this.audioRecorder.stop()
    }
    this.gravandoAudio = false
    clearInterval(this.intervaloGravacao)
    this.intervaloGravacao = null
  },

  cancelarGravacao() {
    if (this.audioRecorder && this.audioRecorder.state !== 'inactive') {
      this.audioRecorder.stop()
      this.audioChunks = [] // descarta
    }
    this.gravandoAudio = false
    clearInterval(this.intervaloGravacao)
    this.intervaloGravacao = null
  },

  async enviarAudio(audioBlob) {
    if (!this.chatId || audioBlob.size === 0) return

    const formData = new FormData()
    formData.append('midia', audioBlob, 'audio.webm')

    try {
      this.enviando = true
      const res = await axios.post(
        `http://localhost:3002/chats/${this.chatId}/midia`,
        formData,
        {
          headers: {
            ...this.getAuthConfig().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      this.mensagens.push(res.data)
      this.scrollToBottom()
    } catch (error) {
      console.error('Erro ao enviar áudio:', error)
    } finally {
      this.enviando = false
    }
  },

  formatarTempoAudio(segundos) {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  },

  // ===== NOVOS: Preview de Mídia (inspirado no Match) =====
triggerFileInput(tipo) {
  this.showAttachMenu = false
  if (tipo === 'image') {
    this.$refs.fileInputImage.click()
  } else {
    this.$refs.fileInputFile.click()
  }
},

  onFileSelected(event, tipo) {
    const file = event.target.files?.[0]
    if (!file) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. Máximo 10MB.')
      event.target.value = ''
      return
    }

    const url = tipo === 'imagem' ? URL.createObjectURL(file) : null
    
    this.previewMidia = {
      tipo,
      file,
      url,
      nome: file.name,
      tamanho: file.size
    }
    this.showPreviewMidia = true
    event.target.value = ''
  },

  cancelarPreview() {
    if (this.previewMidia?.url) URL.revokeObjectURL(this.previewMidia.url)
    this.previewMidia = null
    this.showPreviewMidia = false
  },

  async confirmarEnvioMidia() {
    if (!this.previewMidia || !this.chatId) return

    const { tipo, file } = this.previewMidia
    const formData = new FormData()
    formData.append('midia', file, file.name)

    try {
      this.enviando = true
      const res = await axios.post(
        `http://localhost:3002/chats/${this.chatId}/midia`,
        formData,
        {
          headers: {
            ...this.getAuthConfig().headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      this.mensagens.push(res.data)
      this.scrollToBottom()
      this.cancelarPreview()
    } catch (error) {
      console.error('Erro ao enviar mídia:', error)
    } finally {
      this.enviando = false
    }
  },

  formatarTamanhoArquivo(bytes) {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  },

    getAuthConfig() {
      const token = localStorage.getItem('token')
      return { headers: { Authorization: `Bearer ${token}` } }
    },
    
    async carregarChat() {
      try {
        this.loading = true
        const res = await axios.get(
          `http://localhost:3002/chats/${this.chatId}/mensagens`,
          this.getAuthConfig()
        )
        
        this.mensagens = res.data?.mensagens || []
        this.otherUser = res.data?.user
        this.chatSilenciado = res.data?.silenciado || false
        
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        console.error('Erro ao carregar chat:', error)
      } finally {
        this.loading = false
      }
    },
    
    async enviarMensagem() {
      if (!this.novaMensagem.trim() || this.enviando) return
      
      try {
        this.enviando = true
        const res = await axios.post(
          `http://localhost:3002/chats/${this.chatId}/mensagens`,
          { conteudo: this.novaMensagem.trim(), tipo: 'texto' },
          this.getAuthConfig()
        )
        
        this.mensagens.push(res.data)
        this.novaMensagem = ''
        this.scrollToBottom()
      } catch (error) {
        console.error('Erro ao enviar:', error)
      } finally {
        this.enviando = false
      }
    },
    
    isMyMessage(msg) {
      const userId = this.getLoggedUserId()
      return String(msg.remetente) === String(userId)
    },
    
    getLoggedUserId() {
      const user = localStorage.getItem('usuario')
      return user ? JSON.parse(user).id : null
    },
    
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    iniciarPolling() {
      // Polling a cada 3 segundos para novas mensagens
      this.pollingInterval = setInterval(() => {
        this.carregarNovasMensagens()
      }, 3000)
    },
    
async carregarNovasMensagens() {
  try {
    const ultimaMsg = this.mensagens[this.mensagens.length - 1]
    const ultimaId = ultimaMsg ? ultimaMsg.id : null
    
    const res = await axios.get(
      `http://localhost:3002/chats/${this.chatId}/mensagens?page=1&limit=50`,
      this.getAuthConfig()
    )
    
    const novas = (res.data?.mensagens || []).filter(m => 
      !this.mensagens.some(existing => existing.id === m.id)
    )
    
    if (novas.length > 0) {
      this.mensagens.push(...novas)
      this.scrollToBottom()
    }
  } catch (error) {
    // Silencioso em polling
  }
},
    
    formatTime(date) {
      if (!date) return ''
      return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    goToProfile() {
      if (this.otherUser?.id) {
        this.$router.push(`/usuario/${this.otherUser.id}`)
      }
    },
    
  playMusica(musica) {
  if (!musica) return
  window.dispatchEvent(new CustomEvent('play-song', {
    detail: { song: musica, context: 'chat' }
  }))
},
    
    triggerFileInput(type) {
      this.showAttachMenu = false
      this.$refs.fileInput.click()
    },
    
compartilharMusica() {
  this.showAttachMenu = false
  // TODO: Implementar modal de seleção de música
  alert('Compartilhamento de música em desenvolvimento')
},
    
    abrirImagem(url) {
      window.open(url, '_blank')
    },
    
    async silenciarChat() {
      try {
        const res = await axios.put(
          `http://localhost:3002/chats/${this.chatId}/silenciar`,
          {},
          this.getAuthConfig()
        )
        this.chatSilenciado = res.data?.silenciado || false
        this.showOptions = false
      } catch (error) {
        console.error('Erro:', error)
      }
    },
    
    confirmarLimpar() {
      if (confirm('Limpar todas as mensagens?')) {
        axios.delete(`http://localhost:3002/chats/${this.chatId}/limpar`, this.getAuthConfig())
          .then(() => {
            this.mensagens = []
            this.showOptions = false
          })
      }
    },
    
    confirmarExcluir() {
      if (confirm('Excluir esta conversa?')) {
        axios.delete(`http://localhost:3002/chats/${this.chatId}`, this.getAuthConfig())
          .then(() => {
            this.$router.push('/mensagens')
          })
      }
    },
    
    confirmarBloquear() {
      if (confirm('Bloquear este usuário?')) {
        axios.post(`http://localhost:3002/chats/${this.chatId}/bloquear`, {}, this.getAuthConfig())
          .then(() => {
            this.showOptions = false
            this.$router.push('/mensagens')
          })
      }
    }
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
  color: #f8fafc;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  position: relative;
}

.btn-back, .btn-more {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.05);
  color: #94a3b8;
  cursor: pointer;
}

.chat-user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.chat-header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-user-info h3 {
  margin: 0;
  font-size: 16px;
}

.online-status {
  color: #22c55e;
  font-size: 12px;
}

.chat-options-menu {
  position: absolute;
  top: 60px;
  right: 20px;
  background: #1e293b;
  border-radius: 12px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  z-index: 100;
}

.option-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #cbd5e1;
}

.option-item:hover {
  background: rgba(255,255,255,0.05);
}

.option-item.danger {
  color: #ef4444;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  background: rgba(255,255,255,0.08);
  align-self: flex-start;
  position: relative;
}

.message-bubble.mine {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  align-self: flex-end;
}

.msg-texto {
  margin: 0;
  line-height: 1.4;
}

.msg-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  display: block;
}

.msg-musica {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
}

.msg-musica img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.msg-musica-info h4 {
  margin: 0;
  font-size: 14px;
}

.msg-musica-info p {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
}

.msg-imagem img {
  max-width: 250px;
  border-radius: 12px;
  cursor: pointer;
}

.msg-audio audio {
  width: 250px;
}

.chat-input-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(255,255,255,0.03);
  border-top: 1px solid rgba(255,255,255,0.08);
  position: relative;
}

.btn-attach {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.05);
  color: #94a3b8;
  cursor: pointer;
}

.chat-input-area input {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 12px 20px;
  color: #f8fafc;
  outline: none;
}

.chat-input-area input::placeholder {
  color: #64748b;
}

.btn-send {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  cursor: pointer;
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.attach-menu {
  position: absolute;
  bottom: 70px;
  left: 20px;
  background: #1e293b;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
}

.attach-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #cbd5e1;
}

.attach-item:hover {
  background: rgba(255,255,255,0.05);
}

.chat-empty {
  text-align: center;
  color: #64748b;
  margin: auto;
}

.chat-empty i {
  font-size: 48px;
  margin-bottom: 16px;
}

.chat-loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}
/* ===== ADICIONAR ao style do Chat.vue ===== */

/* Emoji Picker */
.btn-emoji {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.05);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-emoji.active {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
}

.emoji-picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.emoji-picker {
  background: #1e293b;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 50vh;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.emoji-categories {
  display: flex;
  gap: 8px;
  padding: 12px 20px;
  overflow-x: auto;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.emoji-categories button {
  background: transparent;
  border: none;
  font-size: 20px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  opacity: 0.6;
  transition: all 0.2s;
}

.emoji-categories button.active {
  opacity: 1;
  background: rgba(255,255,255,0.1);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 16px 20px;
  overflow-y: auto;
}

.emoji-grid button {
  background: transparent;
  border: none;
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.emoji-grid button:hover {
  background: rgba(255,255,255,0.1);
  transform: scale(1.2);
}

/* Áudio Recording */
.audio-recording {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  padding: 0 16px;
}

.recording-dot {
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-recording 1s infinite;
}

@keyframes pulse-recording {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.recording-time {
  font-family: monospace;
  color: #ef4444;
  font-weight: 600;
}

.recording-label {
  color: #94a3b8;
  font-size: 14px;
}

.btn-mic {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.05);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-mic:active {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  transform: scale(0.95);
}

.btn-cancel-audio {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  cursor: pointer;
}

/* Media Preview Bar */
.media-preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #1e293b;
  border-top: 1px solid rgba(255,255,255,0.08);
  gap: 16px;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.preview-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.preview-file {
  display: flex;
  align-items: center;
  gap: 12px;
}

.preview-file i {
  font-size: 32px;
  color: #60a5fa;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-actions button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.btn-confirm {
  background: #10b981;
  color: white;
}

/* Input wrapper */
.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 12px 20px;
  color: #f8fafc;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #64748b;
}

/* Mensagem de áudio */
.msg-audio {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
}

.msg-audio audio {
  width: 200px;
  height: 36px;
}

/* Mensagem de arquivo */
.msg-arquivo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
  cursor: pointer;
}

.msg-arquivo i {
  font-size: 32px;
  color: #60a5fa;
}

.msg-arquivo-info {
  flex: 1;
  min-width: 0;
}

.msg-arquivo-info h4 {
  margin: 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-arquivo-info p {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}
</style>