<template>
  <div class="mensagens-view">
    <!-- Sidebar com lista de conversas -->
    <aside class="conversas-sidebar" :class="{ 'mobile-hidden': conversaAtiva }">
   <div class="conversas-header">
  <h2>{{ usuarioLogado?.username || 'Mensagens' }}</h2>
  <div class="header-actions">
    <button class="btn-lixeira" @click="ativarModoExcluir" :class="{ 'ativo': modoExcluir }">
      <i :class="modoExcluir ? 'fa fa-times' : 'fa fa-trash'"></i>
    </button>
    <button class="btn-nova-conversa" @click="abrirNovaConversa">
      <i class="fa fa-edit"></i>
    </button>
  </div>
</div>
      
      <div class="conversas-lista">
        <div 
          v-for="conversa in conversas" 
          :key="conversa.id"
          class="conversa-item"
          :class="{ 'nao-lida': conversa.naoLidas > 0, 'ativa': conversaAtiva?.id === conversa.id }"
          @click="abrirConversa(conversa)"
        >
          <div class="conversa-avatar-wrapper">
            <img 
              :src="conversa.participante?.avatar || defaultAvatar" 
              class="conversa-avatar"
              @error="$event.target.src = defaultAvatar"
            />
            <div v-if="isOnline(conversa.participante)" class="online-status"></div>
          </div>
          
          <div class="conversa-info">
            <div class="conversa-nome-row">
              <span class="conversa-nome">{{ conversa.participante?.nome || 'Usuário' }}</span>
              <span v-if="conversa.participante?.verificado" class="verified-badge">
                <i class="fa fa-check-circle"></i>
              </span>
            </div>
            
            <div class="conversa-preview">
              <span v-if="conversa.ultimaMensagem" class="ultima-msg">
                <strong v-if="isMinhaMensagem(conversa.ultimaMensagem)">Você: </strong>
                {{ formatPreview(conversa.ultimaMensagem) }}
              </span>
              <span class="conversa-tempo">{{ timeAgo(conversa.ultimaAtividade) }}</span>
            </div>
          </div>
          
          <div v-if="conversa.naoLidas > 0" class="badge-nao-lida">
            {{ conversa.naoLidas }}
          </div>
          <button v-if="modoExcluir" class="btn-excluir-conversa" @click.stop="confirmarExcluirConversa(conversa)">
    <i class="fa fa-trash"></i>
  </button>
        </div>
        
        <div v-if="conversas.length === 0 && !loading" class="empty-conversas">
          <i class="fa fa-comment-o"></i>
          <p>Nenhuma conversa ainda</p>
          <span>Envie uma mensagem para alguém!</span>
        </div>
      </div>
    </aside>
    
    <!-- Área de chat -->
    <main class="chat-area" :class="{ 'mobile-hidden': !conversaAtiva }">
 <!-- Header do chat -->
<div v-if="conversaAtiva" class="chat-header">
  <button class="btn-voltar-mobile" @click="fecharConversa">
    <i class="fa fa-arrow-left"></i>
  </button>
  
<div class="chat-header-user" @click="irParaPerfil">
  <img :src="conversaAtiva.participante?.avatar || defaultAvatar" class="chat-header-avatar" />
  <div class="chat-header-info">
    <span class="chat-header-nome">{{ conversaAtiva.participante?.nome || conversaAtiva.participante?.username }}</span>
    <span class="chat-header-status">{{ statusTexto }}</span>
  </div>
</div>
  
  <!-- BOTÃO DE INFO COM MENU DROPDOWN -->
<div class="info-menu-wrapper">
  <button class="btn-info" @click.stop="toggleInfoMenu">
    <i class="fa fa-info-circle"></i>
  </button>
    
<div v-if="showInfoMenu" class="info-dropdown" v-click-outside="fecharInfoMenu" @click.stop>
  <button class="info-item" @click="denunciarUsuario">
    <i class="fa fa-flag"></i>
    <span>Denunciar usuário</span>
  </button>
  <button class="info-item" @click="silenciarChat">
    <i :class="chatSilenciado ? 'fa fa-bell-slash' : 'fa fa-bell'"></i>
    <span>{{ chatSilenciado ? 'Ativar notificações' : 'Silenciar chat' }}</span>
  </button>
  <button class="info-item" :class="{ danger: !chatBloqueado }" @click="toggleBloquear">
    <i :class="chatBloqueado ? 'fa fa-unlock' : 'fa fa-ban'"></i>
    <span>{{ chatBloqueado ? 'Desbloquear usuário' : 'Bloquear usuário' }}</span>
  </button>
  <button class="info-item" @click="limparConversa">
  <i class="fa fa-eraser"></i>
  <span>Limpar conversa</span>
</button>
  <button class="info-item danger" @click="confirmarApagarConversa">
    <i class="fa fa-trash"></i>
    <span>Apagar conversa</span>
  </button>
</div>
  </div>
</div>
      
      <!-- Mensagens -->
      <div v-if="conversaAtiva" class="mensagens-container" ref="mensagensContainer">
    <div 
  v-for="msg in mensagens" 
  :key="msg._id"
  class="mensagem"
  :class="{ 
    'enviada': isMinhaMensagem(msg), 
    'recebida': !isMinhaMensagem(msg),
    'respondendo': msg.respostaA  /* ← NOVO */
  }"
  @click="responderMsg = responderMsg?._id === msg._id ? null : msg" 
  @dblclick="responderMsg = msg" 
>
  <!-- REFERÊNCIA DA MENSAGEM RESPONDIDA -->
 <div v-if="msg.respostaA" class="msg-referencia">
  <div class="referencia-linha"></div>
  <div class="referencia-conteudo">
    <span class="referencia-nome">{{ msg.respostaA.remetente?.nome || msg.respostaA.remetente?.username || 'Usuário' }}</span>
    <span class="referencia-texto">{{ formatPreview(msg.respostaA) }}</span>
  </div>
</div>

  <!-- BOTÃO DE REPLY (aparece no hover) -->
  <button class="btn-reply" @click.stop="responderMsg = msg">
    <i class="fa fa-reply"></i>
  </button>

  <!-- Conteúdo existente... -->
 <div class="msg-conteudo">
  <!-- Texto -->
  <template v-if="msg.tipo === 'texto'">
    <div class="msg-texto">{{ msg.conteudo }}</div>
  </template>
  
  <!-- Imagem -->
  <template v-else-if="msg.tipo === 'imagem'">
    <div class="msg-imagem">
      <img :src="msg.conteudo" @click="abrirImagem(msg.conteudo)" />
    </div>
  </template>
  
  <!-- Áudio -->
  <template v-else-if="msg.tipo === 'audio'">
    <div class="msg-audio">
      <audio :src="msg.conteudo" controls></audio>
      <span v-if="msg.metadata?.duracaoAudio" class="audio-duracao">
        {{ formatDuracao(msg.metadata.duracaoAudio) }}
      </span>
    </div>
  </template>
  
  <!-- Arquivo -->
  <template v-else-if="msg.tipo === 'arquivo'">
    <div class="msg-arquivo">
      <a :href="msg.conteudo" target="_blank" download>
        <i class="fa fa-file"></i>
        <span>{{ msg.metadata?.nomeArquivo || 'Arquivo' }}</span>
      </a>
    </div>
  </template>
  
  <!-- Emoji -->
  <template v-else-if="msg.tipo === 'emoji'">
    <div class="msg-emoji">{{ msg.conteudo }}</div>
  </template>
  
  <!-- Fallback para tipo desconhecido -->
  <template v-else>
    <div class="msg-texto">{{ msg.conteudo }}</div>
  </template>
</div>
          
          <div class="msg-meta">
            <span class="msg-hora">{{ formatHora(msg.createdAt) }}</span>
            <i v-if="isMinhaMensagem(msg)" 
               :class="msg.lida ? 'fa fa-check-double lida' : 'fa fa-check'">
            </i>
          </div>
        </div>
      </div>
      
      <!-- Input area -->
    <div v-if="conversaAtiva" class="chat-input-area">
        <!-- ✅ BLOQUEADO: mostra aviso -->
    <div v-if="chatBloqueado" class="input-bloqueado">
  <i class="fa fa-ban"></i>
  <span v-if="bloqueadoPor === 'eu'">Você bloqueou este usuário. Desbloqueie para enviar mensagens.</span>
  <span v-else-if="bloqueadoPor === 'ele'">Você foi bloqueado por este usuário.</span>
  <span v-else>Conversa bloqueada.</span>
</div>
        
        <!-- ✅ NORMAL: input padrão -->
        <template v-else>
        <!-- Preview de mídia -->
        <div v-if="previewMidia" class="preview-midia">
          <img v-if="previewMidia.tipo === 'imagem'" :src="previewMidia.url" />
          <audio v-else-if="previewMidia.tipo === 'audio'" :src="previewMidia.url" controls></audio>
          <button class="btn-remover-preview" @click="removerPreview">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <!-- Preview de resposta -->
<div v-if="responderMsg" class="reply-preview">
  <div class="reply-preview-content">
    <span class="reply-label">Respondendo {{ responderMsg.remetente?.nome }}</span>
    <span class="reply-text">{{ formatPreview(responderMsg) }}</span>
  </div>
  <button class="btn-cancelar-reply" @click="responderMsg = null">
    <i class="fa fa-times"></i>
  </button>
</div>
        
        <div class="input-row">
          <button class="btn-emoji" @click="toggleEmojiPicker">
            <i class="fa fa-smile-o"></i>
          </button>
          
          <button class="btn-anexo" @click="$refs.fileInput.click()">
            <i class="fa fa-paperclip"></i>
          </button>
            <button 
    class="btn-audio" 
    @click="toggleGravacao"
    :class="{ 'gravando': gravandoAudio }"
  >
    <i :class="gravandoAudio ? 'fa fa-stop' : 'fa fa-microphone'"></i>
  </button>
          <input 
            ref="fileInput" 
            type="file" 
            hidden 
            @change="handleFileSelect"
            accept="image/*,audio/*,.pdf,.doc,.docx"
          />
          
          <div class="input-wrapper">
            <input 
              v-model="novaMensagem" 
              type="text" 
              placeholder="Mensagem..."
              @keyup.enter="enviarMensagem"
              @focus="scrollToBottom"
            />
          </div>
          
          <button 
            v-if="novaMensagem.trim() || previewMidia" 
            class="btn-enviar"
            @click="enviarMensagem"
            :disabled="enviando"
          >
            <i :class="enviando ? 'fa fa-spinner fa-spin' : 'fa fa-paper-plane'"></i>
          </button>
          
          <button v-else class="btn-like" @click="enviarLike">
            <i class="fa fa-heart"></i>
          </button>
        </div>

        <div v-if="audioBlob" class="preview-audio-gravado">
  <audio :src="audioPreviewUrl" controls></audio>
  <button class="btn-remover-preview" @click="removerAudioGravado">
    <i class="fa fa-times"></i>
  </button>
</div>
        
        <!-- Emoji Picker -->
        <div v-if="showEmojiPicker" class="emoji-picker">
          <span 
            v-for="emoji in emojisPopulares" 
            :key="emoji"
            @click="inserirEmoji(emoji)"
          >
            {{ emoji }}
          </span>
        </div>
       </template>
    </div>
      
      <!-- Estado vazio -->
      <div v-if="!conversaAtiva" class="chat-empty">
        <div class="chat-empty-icon">
          <i class="fa fa-paper-plane-o"></i>
        </div>
        <h3>Suas mensagens</h3>
        <p>Envie uma mensagem para começar uma conversa</p>
      </div>
    </main>
    
    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <i :class="toast.icon"></i>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- Modal de Confirmação -->
<transition name="modal">
  <div v-if="modalApagar.show" class="modal-overlay" @click.self="fecharModalApagar">
    <div class="modal-content">
      <div class="modal-icon">
        <i class="fa fa-trash"></i>
      </div>
      <h3>{{ modalApagar.titulo }}</h3>
      <p>{{ modalApagar.mensagem }}</p>
      <div class="modal-actions">
        <button class="btn-cancelar" @click="fecharModalApagar">Cancelar</button>
        <button class="btn-confirmar" @click="executarApagarConversa">Apagar</button>
      </div>
    </div>
  </div>
</transition>
    <!-- ✅ Modal de Denúncia -->
    <transition name="modal">
      <div v-if="modalDenuncia.show" class="modal-overlay" @click.self="fecharModalDenuncia">
        <div class="modal-content denuncia-modal">
          <div class="modal-icon denuncia-icon">
            <i class="fa fa-flag"></i>
          </div>
          <h3>Denunciar usuário</h3>
          <p>Selecione o motivo da denúncia:</p>
          
          <div class="denuncia-opcoes">
            <button 
              v-for="opcao in opcoesDenuncia" 
              :key="opcao.valor"
              class="denuncia-opcao"
              :class="{ 'selecionada': modalDenuncia.motivo === opcao.valor }"
              @click="modalDenuncia.motivo = opcao.valor"
            >
              <i :class="opcao.icone"></i>
              <span>{{ opcao.label }}</span>
            </button>
          </div>
          
          <div v-if="modalDenuncia.motivo === 'outro'" class="denuncia-outro">
            <textarea 
              v-model="modalDenuncia.outroTexto"
              placeholder="Descreva o motivo..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="modal-actions">
            <button class="btn-cancelar" @click="fecharModalDenuncia">Cancelar</button>
            <button 
              class="btn-confirmar denuncia-btn" 
              @click="executarDenuncia"
              :disabled="!modalDenuncia.motivo || (modalDenuncia.motivo === 'outro' && !modalDenuncia.outroTexto.trim())"
            >
              Enviar denúncia
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';

const clickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!(el === e.target || el.contains(e.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
  }
};

export default {
  name: 'MensagensView',
   directives: { 'click-outside': clickOutside },
  
  data() {
    return {
      conversas: [],
      mensagens: [],
      conversaAtiva: null,
      novaMensagem: '',
      enviando: false,
            modalDenuncia: {
        show: false,
        motivo: '',
        outroTexto: '',
        usuarioId: null
      },
      opcoesDenuncia: [
        { valor: 'spam', label: 'Spam ou propaganda', icone: 'fa fa-bullhorn' },
        { valor: 'assedio', label: 'Assédio ou bullying', icone: 'fa fa-hand-stop-o' },
        { valor: 'conteudo_inapropriado', label: 'Conteúdo inapropriado', icone: 'fa fa-exclamation-triangle' },
        { valor: 'fake', label: 'Perfil falso ou impersonação', icone: 'fa fa-user-secret' },
        { valor: 'golpe', label: 'Golpe ou fraude', icone: 'fa fa-money' },
        { valor: 'odio', label: 'Discurso de ódio', icone: 'fa fa-fire' },
        { valor: 'menor', label: 'Menor de idade em risco', icone: 'fa fa-child' },
        { valor: 'outro', label: 'Outro motivo', icone: 'fa fa-ellipsis-h' }
      ],
      modoExcluir: false,
      responderMsg: null,
      modalApagar: {
  show: false,
  conversa: null,
  titulo: '',
  mensagem: ''
},
      statusUsuarios: {},  // ← ADICIONAR: cache de status { userId: { online, ultimaAtividade } }
statusPolling: null,  // ← ADICIONAR
      gravandoAudio: false,      // ← ADICIONAR
mediaRecorder: null,         // ← ADICIONAR
audioChunks: [],             // ← ADICIONAR
audioBlob: null,             // ← ADICIONAR
audioPreviewUrl: null,       // ← ADICIONAR
      loading: false,
      defaultAvatar: '/default-avatar.png',
      usuarioLogado: null,
      previewMidia: null,
        showInfoMenu: false,        // ← ADICIONAR
    showReportModal: false,     // ← ADICIONAR
    showDeleteConfirm: false,   // ← ADICIONAR
    chatSilenciado: false, 
    chatBloqueado: false,
    bloqueadoPor: null,
      showEmojiPicker: false,
      emojisPopulares: [
  // Corações
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
  // Rostos
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
  // Gestos
  '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍🏻', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸',
  // Festa
  '🎉', '🎊', '🎈', '🎂', '🎁', '🎄', '🎃', '🎅', '🤶', '🎆', '🎇', '✨', '🎵', '🎶', '🔥', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤',
  // Música
  '🎵', '🎶', '🎼', '🎸', '🎹', '🎺', '🎻', '🥁', '🎤', '🎧', '📻', '📱', '🔊', '🔉', '🔈', '🔇', '📢', '📣', '🔔', '🔕'
],
      pollingInterval: null,
      toast: { show: false, message: '', type: 'success', icon: 'fa fa-check' }
    };
  },
  
computed: {
  statusTexto() {
    if (!this.conversaAtiva) return '';
    const userId = String(this.conversaAtiva.participante?._id || this.conversaAtiva.participante?.id);
    const status = this.statusUsuarios[userId];
    
    if (status?.online) return 'Online';
    if (status?.ultimaVez) return `Visto há ${status.ultimaVez}`;
    return 'Offline';
  }
},
  
 async mounted() {
    this.usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
    await this.carregarConversas();
    
    // Se veio do perfil com ?novo=userid, abrir conversa com esse usuário
    const novoDestinatario = this.$route.query.novo;
    if (novoDestinatario) {
      await this.iniciarConversaCom(novoDestinatario);
      // Limpar query da URL
      this.$router.replace({ path: '/mensagens' });
    }

     const conversaId = this.$route.query.conversa;
  if (conversaId) {
    const conversa = this.conversas.find(c => String(c.id) === String(conversaId));
    if (conversa) {
      this.abrirConversa(conversa);
    }
    this.$router.replace({ path: '/mensagens' });
  }
    
    this.iniciarPolling();
     this.iniciarStatusPolling();
  },
  
 beforeUnmount() {
  if (this.pollingInterval) clearInterval(this.pollingInterval);
  if (this.statusPolling) clearInterval(this.statusPolling);  // ← ADICIONAR
},

  methods: {
    getAuthConfig() {
      const token = localStorage.getItem('token');
      return { headers: { Authorization: `Bearer ${token}` } };
    },
    
    async carregarConversas() {
      try {
        const res = await axios.get('http://localhost:3002/mensagens/conversas', this.getAuthConfig());
        this.conversas = res.data;
      } catch (err) {
        this.showToast('Erro ao carregar conversas', 'error');
      }
    },

iniciarStatusPolling() {
  // Verificar status a cada 30 segundos
  this.statusPolling = setInterval(() => {
    this.verificarStatusUsuarios();
  }, 30000);
  // Verificar imediatamente
  this.verificarStatusUsuarios();
},

async verificarStatusUsuarios() {
  // Verificar status dos participantes das conversas
  const userIds = [...new Set(
    this.conversas.map(c => c.participante?._id || c.participante?.id).filter(Boolean)
  )];
  
  for (const userId of userIds) {
    try {
      const res = await axios.get(
        `http://localhost:3002/mensagens/usuario/${userId}/status`,
        this.getAuthConfig()
      );
      this.statusUsuarios[userId] = res.data;
    } catch (err) {
      // Silenciar erro
    }
  }
},

isOnline(user) {
  if (!user) return false;
  const userId = String(user._id || user.id);
  const status = this.statusUsuarios[userId];
  return status?.online || false;
},

    async toggleGravacao() {
  if (this.gravandoAudio) {
    this.pararGravacao();
  } else {
    await this.iniciarGravacao();
  }
},

async iniciarGravacao() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];
    
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };
    
    this.mediaRecorder.onstop = () => {
      this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioPreviewUrl = URL.createObjectURL(this.audioBlob);
      
      // Criar previewMidia para envio
      const file = new File([this.audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
      this.uploadAudioGravado(file);
      
      // Parar todas as tracks
      stream.getTracks().forEach(track => track.stop());
    };
    
    this.mediaRecorder.start();
    this.gravandoAudio = true;
    
    // Timer visual (opcional - máximo 2 minutos)
    this.audioTimer = setTimeout(() => {
      if (this.gravandoAudio) this.pararGravacao();
    }, 120000);
    
  } catch (err) {
    this.showToast('Permissão de microfone negada', 'error');
  }
},

pararGravacao() {
  if (this.mediaRecorder && this.gravandoAudio) {
    this.mediaRecorder.stop();
    this.gravandoAudio = false;
    if (this.audioTimer) clearTimeout(this.audioTimer);
  }
},

async uploadAudioGravado(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await axios.post(
      'http://localhost:3002/upload',
      formData,
      {
        ...this.getAuthConfig(),
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    
    this.previewMidia = {
      tipo: 'audio',
      url: res.data.url,
      metadata: {
        nomeArquivo: file.name,
        tamanho: file.size,
        mimeType: file.type,
        duracaoAudio: await this.getAudioDuration(file)
      }
    };
  } catch (err) {
    this.showToast('Erro ao processar áudio', 'error');
    this.removerAudioGravado();
  }
},

removerAudioGravado() {
  this.audioBlob = null;
  this.audioPreviewUrl = null;
  this.audioChunks = [];
  this.previewMidia = null;
},

    ativarModoExcluir() {
  this.modoExcluir = !this.modoExcluir;
},

confirmarExcluirConversa(conversa) {
  this.modalApagar = {
    show: true,
    conversa: conversa,
    titulo: 'Apagar conversa?',
    mensagem: `As mensagens com ${conversa.participante?.nome || 'este usuário'} serão removidas apenas para você.`
  };
  this.modoExcluir = false;
},

fecharModalApagar() {
  this.modalApagar.show = false;
  this.modalApagar.conversa = null;
},

async executarApagarConversa() {
  if (!this.modalApagar.conversa) return;
  
  try {
    const isLimpar = this.modalApagar.titulo?.includes('Limpar');
    
    if (isLimpar) {
      await axios.delete(
        `http://localhost:3002/mensagens/conversa/${this.modalApagar.conversa.id}/limpar`,
        this.getAuthConfig()
      );
      this.mensagens = [];
      // Atualiza preview na sidebar
      await this.carregarConversas();
      this.showToast('Conversa limpa', 'success');
    } else {
      await axios.delete(
        `http://localhost:3002/mensagens/conversa/${this.modalApagar.conversa.id}`,
        this.getAuthConfig()
      );
      if (this.conversaAtiva?.id === this.modalApagar.conversa.id) {
        this.conversaAtiva = null;
      }
      await this.carregarConversas();
      this.showToast('Conversa apagada', 'success');
    }
  } catch (err) {
    console.error('Erro:', err.response?.data || err.message);
    this.showToast(err.response?.data?.error || 'Erro ao processar', 'error');
  } finally {
    this.fecharModalApagar();
  }
},

async apagarConversaEspecifica(conversaId) {
  try {
    await axios.delete(
      `http://localhost:3002/mensagens/conversa/${conversaId}`,
      this.getAuthConfig()
    );
    if (this.conversaAtiva?.id === conversaId) {
      this.conversaAtiva = null;
    }
    await this.carregarConversas();
    this.showToast('Conversa apagada', 'success');
  } catch (err) {
    this.showToast('Erro ao apagar conversa', 'error');
  }
},

    toggleInfoMenu() {
    this.showInfoMenu = !this.showInfoMenu;
  },
  
  fecharInfoMenu() {
    this.showInfoMenu = false;
  },
  
   denunciarUsuario() {
    this.showInfoMenu = false;
    this.modalDenuncia = {
      show: true,
      motivo: '',
      outroTexto: '',
      usuarioId: this.conversaAtiva.participante._id || this.conversaAtiva.participante.id
    };
  },
  
  fecharModalDenuncia() {
    this.modalDenuncia.show = false;
    this.modalDenuncia.motivo = '';
    this.modalDenuncia.outroTexto = '';
  },
  
  async executarDenuncia() {
    const motivoFinal = this.modalDenuncia.motivo === 'outro' 
      ? this.modalDenuncia.outroTexto 
      : this.opcoesDenuncia.find(o => o.valor === this.modalDenuncia.motivo)?.label;
    
    try {
      await axios.post(
        'http://localhost:3002/mensagens/denunciar',
        {
          usuarioId: this.modalDenuncia.usuarioId,
          motivo: motivoFinal,
          categoria: this.modalDenuncia.motivo,
          conversaId: this.conversaAtiva.id
        },
        this.getAuthConfig()
      );
      this.showToast('Denúncia enviada com sucesso', 'success');
      this.fecharModalDenuncia();
    } catch (err) {
      this.showToast('Erro ao enviar denúncia', 'error');
    }
  },
  
  async silenciarChat() {
    this.showInfoMenu = false;
    try {
      if (this.chatSilenciado) {
        await axios.delete(
          `http://localhost:3002/mensagens/silenciar/${this.conversaAtiva.id}`,
          this.getAuthConfig()
        );
        this.chatSilenciado = false;
        this.showToast('Notificações ativadas', 'success');
      } else {
        await axios.post(
          'http://localhost:3002/mensagens/silenciar',
          { conversaId: this.conversaAtiva.id },
          this.getAuthConfig()
        );
        this.chatSilenciado = true;
        this.showToast('Chat silenciado', 'success');
      }
    } catch (err) {
      this.showToast('Erro ao silenciar chat', 'error');
    }
  },

  async toggleBloquear() {
  this.showInfoMenu = false;
  try {
    if (this.chatBloqueado) {
      await axios.delete(
        `http://localhost:3002/mensagens/bloquear/${this.conversaAtiva.participante._id || this.conversaAtiva.participante.id}`,
        this.getAuthConfig()
      );
      this.chatBloqueado = false;
      this.showToast('Usuário desbloqueado', 'success');
    } else {
      await axios.post(
        'http://localhost:3002/mensagens/bloquear',
        { 
          usuarioId: this.conversaAtiva.participante._id || this.conversaAtiva.participante.id 
        },
        this.getAuthConfig()
      );
      this.chatBloqueado = true;
      this.showToast('Usuário bloqueado', 'success');
    }
  } catch (err) {
    this.showToast('Erro ao processar bloqueio', 'error');
  }
},
  
 confirmarApagarConversa() {
  this.showInfoMenu = false;
  this.modalApagar = {
    show: true,
    conversa: this.conversaAtiva,
    titulo: 'Apagar conversa?',
    mensagem: `As mensagens com ${this.conversaAtiva.participante?.nome || 'este usuário'} serão removidas apenas para você.`
  };
},

// ✅ ADICIONAR ESTE MÉTODO
async limparConversa() {
  this.showInfoMenu = false;
  this.modalApagar = {
    show: true,
    conversa: this.conversaAtiva,
    titulo: 'Limpar conversa?',
    mensagem: `Todas as mensagens com ${this.conversaAtiva.participante?.nome || 'este usuário'} serão apagadas apenas para você. A conversa continuará na lista.`
  };
},
  

    // ===== ADICIONAR NOS METHODS =====
async iniciarConversaCom(destinatarioId) {
  // Verificar se já existe conversa
  const existente = this.conversas.find(c => 
    String(c.participante?._id || c.participante?.id) === String(destinatarioId)
  );
  
  if (existente) {
    this.abrirConversa(existente);
    return;
  }
  
  // Se não existe, criar enviando uma mensagem inicial
  try {
    this.enviando = true;
    const res = await axios.post(
      'http://localhost:3002/mensagens/enviar',
      {
        destinatarioId: destinatarioId,
        tipo: 'texto',
        conteudo: 'Olá! 👋',
        texto: 'Olá! 👋'
      },
      this.getAuthConfig()
    );
    
    // Recarregar conversas e abrir a nova
    await this.carregarConversas();
    const novaConversa = this.conversas.find(c => 
      String(c.participante?._id || c.participante?.id) === String(destinatarioId)
    );
    if (novaConversa) {
      this.abrirConversa(novaConversa);
    }
  } catch (err) {
    console.error('Erro ao criar conversa:', err);
    this.showToast('Erro ao iniciar conversa', 'error');
  } finally {
    this.enviando = false;
  }
},
    
        async abrirConversa(conversa) {
      this.conversaAtiva = conversa;
      this.mensagens = [];
      this.chatBloqueado = false;
      this.bloqueadoPor = null;
      this.chatSilenciado = false;
      
      // ✅ Verificar status de bloqueio e silêncio ao abrir
      await this.verificarEstadoConversa(conversa.id, conversa.participante);
      
      await this.carregarMensagens(conversa.id);
      this.scrollToBottom();
    },
    
    // ✅ NOVO MÉTODO
async verificarEstadoConversa(conversaId, participante) {
  try {
    const participanteId = participante?._id || participante?.id;
    if (!participanteId) return;
    
    // Verificar bloqueio
    const bloqueioRes = await axios.get(
      `http://localhost:3002/mensagens/bloqueio/${participanteId}`,
      this.getAuthConfig()
    ).catch(() => ({ data: { bloqueado: false, bloqueadoPor: null } }));
    
    this.chatBloqueado = bloqueioRes.data.bloqueado;
    this.bloqueadoPor = bloqueioRes.data.bloqueadoPor || null;
        
        // Verificar silêncio
        const silencioRes = await axios.get(
          `http://localhost:3002/mensagens/silenciar/${conversaId}`,
          this.getAuthConfig()
        ).catch(() => ({ data: { silenciado: false } }));
        
        this.chatSilenciado = silencioRes.data.silenciado;
      } catch (err) {
        // Silenciar erro
      }
    },
    
async carregarMensagens(conversaId) {
  try {
    const res = await axios.get(
      `http://localhost:3002/mensagens/${conversaId}`,
      this.getAuthConfig()
    );
    this.mensagens = res.data;
    
    // 🔍 DEBUG: Verifique o que está vindo do backend
    console.log('Mensagens carregadas:', this.mensagens.map(m => ({
      tipo: m.tipo,
      conteudo: m.conteudo,
      remetente: m.remetente?.nome
    })));
    
  } catch (err) {
    this.showToast('Erro ao carregar mensagens', 'error');
  }
},
    
 async enviarMensagem() {
  // ✅ BLOQUEADO: impede envio
  if (this.chatBloqueado) {
    this.showToast('Não é possível enviar mensagem para este usuário', 'error');
    return;
  }
  if (!this.novaMensagem.trim() && !this.previewMidia && !this.audioBlob) return;
  
  this.enviando = true;
  
  try {
    let conteudo = this.novaMensagem.trim();
    let tipo = 'texto';
    let metadata = {};
    let respostaA = null;  // ← ADICIONAR
    
    // Se tem preview de mídia, usar
    if (this.previewMidia) {
      conteudo = this.previewMidia.url;
      tipo = this.previewMidia.tipo;
      metadata = this.previewMidia.metadata || {};
    }
    else if (this.audioBlob) {
      conteudo = this.previewMidia?.url || '';
      tipo = 'audio';
      metadata = this.previewMidia?.metadata || {};
    }
    
    // ← ADICIONAR: Se está respondendo uma mensagem
    if (this.responderMsg) {
      respostaA = this.responderMsg._id;
    }
    
    const res = await axios.post(
      'http://localhost:3002/mensagens/enviar',
      {
        destinatarioId: this.conversaAtiva.participante._id || this.conversaAtiva.participante.id,
        tipo,
        conteudo,
        texto: this.novaMensagem,
        metadata,
        respostaA  // ← ADICIONAR
      },
      this.getAuthConfig()
    );
    
    this.mensagens.push(res.data);
    this.novaMensagem = '';
    this.previewMidia = null;
    this.audioBlob = null;
    this.audioPreviewUrl = null;
    this.responderMsg = null;  // ← ADICIONAR: limpar resposta
    this.scrollToBottom();
    this.carregarConversas();
  } catch (err) {
    this.showToast('Erro ao enviar mensagem', 'error');
  } finally {
    this.enviando = false;
  }
},
    
    enviarLike() {
      this.novaMensagem = '❤️';
      this.enviarMensagem();
    },
    
    // Upload de arquivo/imagem/áudio
    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        // Upload para seu servidor de arquivos (você precisa ter essa rota)
        const res = await axios.post(
          'http://localhost:3002/upload',
          formData,
          {
            ...this.getAuthConfig(),
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
        
        const tipo = file.type.startsWith('image/') ? 'imagem' 
          : file.type.startsWith('audio/') ? 'audio' 
          : 'arquivo';
        
        this.previewMidia = {
          tipo,
          url: res.data.url,
          metadata: {
            nomeArquivo: file.name,
            tamanho: file.size,
            mimeType: file.type,
            duracaoAudio: tipo === 'audio' ? await this.getAudioDuration(file) : null
          }
        };
      } catch (err) {
        this.showToast('Erro ao fazer upload', 'error');
      }
    },
    
    async getAudioDuration(file) {
      return new Promise((resolve) => {
        const audio = new Audio(URL.createObjectURL(file));
        audio.onloadedmetadata = () => resolve(Math.round(audio.duration));
        audio.onerror = () => resolve(0);
      });
    },
    
    removerPreview() {
      this.previewMidia = null;
    },
    
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    
    inserirEmoji(emoji) {
      this.novaMensagem += emoji;
      this.showEmojiPicker = false;
    },
    
    // Polling para novas mensagens
    iniciarPolling() {
      this.pollingInterval = setInterval(() => {
        if (this.conversaAtiva) {
          this.carregarMensagens(this.conversaAtiva.id);
        }
        this.carregarConversas();
      }, 3000);
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.mensagensContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },
    
    isMinhaMensagem(msg) {
      return String(msg.remetente?._id || msg.remetente) === String(this.usuarioLogado?.id);
    },
    
    isOnline(user) {
      // Implementar com WebSocket ou última atividade
      return false;
    },
    
    formatPreview(msg) {
      if (!msg) return '';
      switch(msg.tipo) {
        case 'imagem': return '📷 Foto';
        case 'audio': return '🎵 Áudio';
        case 'arquivo': return '📎 Arquivo';
        case 'emoji': return msg.conteudo;
        default: return msg.texto || msg.conteudo;
      }
    },
    
    formatHora(date) {
      return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },
    
    formatDuracao(segundos) {
      const m = Math.floor(segundos / 60);
      const s = segundos % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    },
    
    timeAgo(date) {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      if (seconds < 60) return 'Agora';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}min`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      return `${days}d`;
    },
    
    fecharConversa() {
      this.conversaAtiva = null;
    },
    
  irParaPerfil() {
  const userId = this.conversaAtiva.participante?._id || this.conversaAtiva.participante?.id;
  if (userId) {
    this.$router.push(`/usuario/${userId}`);
  }
},
    
    mostrarInfo() {
      // Implementar modal de info
    },
    
    abrirNovaConversa() {
      // Implementar modal de busca de usuários
      this.$router.push('/search');
    },
    
    abrirImagem(url) {
      window.open(url, '_blank');
    },
    
    showToast(message, type = 'success') {
      const icons = { success: 'fa-check', error: 'fa-exclamation', info: 'fa-info' };
      this.toast = { show: true, message, type, icon: `fa ${icons[type]}` };
      setTimeout(() => this.toast.show = false, 3000);
    }
  }
};
</script>

<style scoped>
.mensagens-view {
  display: flex;
  height: 100vh;
  background: #0f172a;
  color: #f8fafc;
}

/* Sidebar */
.conversas-sidebar {
  width: 350px;
  border-right: 1px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  background: #0f172a;
}

.conversas-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversas-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.btn-nova-conversa {
  background: none;
  border: none;
  color: #f8fafc;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.btn-nova-conversa:hover {
  background: rgba(255,255,255,0.1);
}

.conversas-lista {
  flex: 1;
  overflow-y: auto;
}

.conversa-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.conversa-item:hover {
  background: rgba(255,255,255,0.05);
}

.conversa-item.nao-lida {
  background: rgba(236, 72, 153, 0.05);
}

.conversa-item.ativa {
  background: rgba(255,255,255,0.1);
}

.conversa-avatar-wrapper {
  position: relative;
}

.conversa-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.online-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border: 2px solid #0f172a;
  border-radius: 50%;
}

.conversa-info {
  flex: 1;
  min-width: 0;
}

.conversa-nome-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.conversa-nome {
  font-weight: 600;
  font-size: 14px;
}

.verified-badge {
  color: #3b82f6;
  font-size: 12px;
}

.conversa-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #94a3b8;
}

.conversa-preview .ultima-msg {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.conversa-item.nao-lida .ultima-msg {
  color: #f8fafc;
  font-weight: 500;
}

.badge-nao-lida {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  color: white;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  padding: 0 6px;
}

/* Chat Area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0f172a;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-voltar-mobile {
  display: none;
  background: none;
  border: none;
  color: #f8fafc;
  font-size: 18px;
  cursor: pointer;
}

.chat-header-user {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  cursor: pointer;
}

.chat-header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-header-info {
  display: flex;
  flex-direction: column;
}

.chat-header-nome {
  font-weight: 600;
  font-size: 15px;
}

.chat-header-status {
  font-size: 12px;
  color: #94a3b8;
}

.btn-info {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  position: relative;
  z-index: 101;  /* ← ADICIONAR */
}
/* Mensagens */
.mensagens-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mensagem {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 32px;
  max-width: 360px;
  width: 90%;
  text-align: center;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.modal-icon {
  width: 64px;
  height: 64px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.modal-icon i {
  font-size: 28px;
  color: #ef4444;
}

.modal-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
}

.modal-content p {
  margin: 0 0 24px 0;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions button {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancelar {
  background: rgba(255,255,255,0.1);
  color: #f8fafc;
}

.btn-cancelar:hover {
  background: rgba(255,255,255,0.15);
}

.btn-confirmar {
  background: #ef4444;
  color: white;
}

.btn-confirmar:hover {
  background: #dc2626;
}

/* Transições */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.mensagem.enviada {
  align-self: flex-end;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border-bottom-right-radius: 4px;
}

.mensagem.recebida {
  align-self: flex-start;
  background: rgba(255,255,255,0.1);
  border-bottom-left-radius: 4px;
}
.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Modal de Denúncia */
.denuncia-modal {
  max-width: 400px;
}

.denuncia-icon {
  background: rgba(239, 68, 68, 0.1) !important;
}

.denuncia-icon i {
  color: #ef4444 !important;
}

.denuncia-opcoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
  max-height: 280px;
  overflow-y: auto;
}

.denuncia-opcao {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid transparent;
  border-radius: 10px;
  color: #f8fafc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.denuncia-opcao:hover {
  background: rgba(255,255,255,0.1);
}

.denuncia-opcao.selecionada {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.denuncia-opcao i {
  width: 20px;
  text-align: center;
  color: #94a3b8;
}

.denuncia-opcao.selecionada i {
  color: #ef4444;
}

.denuncia-outro {
  margin-bottom: 16px;
}

.denuncia-outro textarea {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px;
  color: #f8fafc;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
}

.denuncia-outro textarea:focus {
  border-color: #ef4444;
}

.denuncia-btn {
  background: #ef4444 !important;
}

.denuncia-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-lixeira {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-lixeira:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-lixeira.ativo {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.conversa-item.modo-excluir {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-excluir-conversa {
  background: #ef4444;
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-delete 1.5s infinite;
}

@keyframes pulse-delete {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
.msg-texto {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.msg-imagem img {
  max-width: 250px;
  border-radius: 12px;
  cursor: pointer;
}

.msg-audio audio {
  max-width: 250px;
}

.msg-emoji {
  font-size: 48px;
}

.msg-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
  font-size: 11px;
  color: rgba(255,255,255,0.6);
}

.msg-meta .lida {
  color: #3b82f6;
}

/* Input Area */
.chat-input-area {
  padding: 12px 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.preview-midia {
  position: relative;
  margin-bottom: 8px;
}

.preview-midia img,
.preview-midia audio {
  max-height: 100px;
  border-radius: 8px;
}

.btn-remover-preview {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-emoji, .btn-anexo, .btn-like, .btn-enviar {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 22px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-emoji:hover, .btn-anexo:hover {
  color: #fbbf24;
}

.btn-enviar {
  color: #ec4899;
}

.btn-enviar:hover {
  transform: scale(1.1);
}

.btn-like {
  color: #ec4899;
}

.btn-like:hover {
  transform: scale(1.2);
}

.input-wrapper {
  flex: 1;
}
/* Input bloqueado */
.input-bloqueado {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #ef4444;
  font-size: 14px;
}

.input-bloqueado i {
  font-size: 16px;
}
.input-wrapper input {
  width: 100%;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 20px;
  padding: 12px 16px;
  color: #f8fafc;
  font-size: 14px;
  outline: none;
}
.btn-audio {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 22px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
}

.btn-audio:hover {
  color: #ec4899;
}

.btn-audio.gravando {
  color: #ef4444;
  animation: pulse-record 1s infinite;
}

@keyframes pulse-record {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.preview-audio-gravado {
  position: relative;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.05);
  padding: 8px 12px;
  border-radius: 12px;
}

.preview-audio-gravado audio {
  flex: 1;
  height: 36px;
}
/* Info Menu Dropdown */
.info-menu-wrapper {
  position: relative;
  z-index: 100;  /* ← ADICIONAR */
}

.info-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 8px;
  min-width: 200px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  z-index: 1000;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #f8fafc;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.info-item:hover {
  background: rgba(255,255,255,0.1);
}

.info-item.danger {
  color: #ef4444;
}

.info-item.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.info-item i {
  width: 20px;
  text-align: center;
}
.input-wrapper input::placeholder {
  color: #64748b;
}

/* Emoji Picker */
.emoji-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.emoji-picker span {
  font-size: 22px;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: transform 0.2s;
  line-height: 1;
}

.emoji-picker span:hover {
  transform: scale(1.3);
  background: rgba(255,255,255,0.1);
}

/* Empty States */
.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.chat-empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-conversas {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.empty-conversas i {
  font-size: 48px;
  margin-bottom: 12px;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10000;
}

.toast-notification.error {
  background: #ef4444;
  color: white;
}
/* Botão de reply (aparece no hover) */
.mensagem {
  position: relative;
}

.btn-reply {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.mensagem:hover .btn-reply {
  opacity: 1;
}

/* Preview de resposta no input */
.reply-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.05);
  border-left: 3px solid #ec4899;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 0 8px 8px 0;
}

.reply-preview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reply-label {
  font-size: 12px;
  color: #ec4899;
  font-weight: 600;
}

.reply-text {
  font-size: 13px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-cancelar-reply {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

/* Mensagem com referência */
.msg-referencia {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  opacity: 0.8;
}

.referencia-linha {
  width: 2px;
  background: #ec4899;
  border-radius: 1px;
}

.referencia-conteudo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.referencia-nome {
  font-size: 12px;
  color: #ec4899;
  font-weight: 600;
}

.referencia-texto {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
/* Mobile */
@media (max-width: 768px) {
  .conversas-sidebar {
    width: 100%;
  }
  
  .conversas-sidebar.mobile-hidden {
    display: none;
  }
  
  .chat-area.mobile-hidden {
    display: none;
  }
  
  .btn-voltar-mobile {
    display: block;
  }
}
</style>