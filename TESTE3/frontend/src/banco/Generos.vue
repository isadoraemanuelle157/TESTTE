<template>
  <div class="container">
    <div class="main-card">
      <div class="header-section">
        <h1>🎵 Gerenciador de Gêneros Musicais</h1>
        <p class="subtitle">Cadastre, edite e organize seus gêneros favoritos</p>
      </div>

      <!-- Formulário -->
      <div class="form-section">
        <h2>{{ modoEdicao ? "✏️ Editar Gênero" : "➕ Novo Gênero" }}</h2>
        
        <form @submit.prevent="salvarGenero">
          <div class="input-group">
            <label>Nome do Gênero</label>
            <input 
              v-model="form.nome" 
              placeholder="Ex: Rock, Jazz, MPB..." 
              required 
            />
          </div>

          <div class="input-group">
            <label>Descrição</label>
            <textarea 
              v-model="form.descricao" 
              placeholder="Descreva as características deste gênero..."
              required
            ></textarea>
          </div>

          <div class="button-group">
            <button 
              type="submit" 
              :class="['btn-primary', { 'loading': loading }]"
              :disabled="loading"
            >
              <span v-if="!loading">{{ modoEdicao ? "Atualizar" : "Cadastrar" }}</span>
              <span v-else class="spinner"></span>
            </button>
            
            <button 
              v-if="modoEdicao" 
              type="button" 
              class="btn-secondary"
              @click="cancelarEdicao"
            >
              Cancelar
            </button>
          </div>
        </form>

        <transition name="fade">
          <div v-if="mensagem" :class="['alert', mensagem.tipo]">
            {{ mensagem.texto }}
          </div>
        </transition>
      </div>

      <!-- Lista de Gêneros -->
      <div class="list-section">
        <div class="list-header">
          <h2>📋 Gêneros Cadastrados</h2>
          <span class="badge">{{ generos.length }} itens</span>
        </div>

        <div v-if="loadingList" class="loading-state">
          <div class="spinner-large"></div>
          <p>Carregando gêneros...</p>
        </div>

        <div v-else-if="generos.length === 0" class="empty-state">
          <div class="empty-icon">🎼</div>
          <p>Nenhum gênero cadastrado ainda</p>
          <span>Adicione seu primeiro gênero acima!</span>
        </div>

        <transition-group name="list" tag="ul" class="generos-list" v-else>
          <li 
            v-for="genero in generos" 
            :key="genero._id" 
            class="genero-item"
          >
            <div class="genero-info">
              <h3>{{ genero.nome }}</h3>
              <p>{{ genero.descricao }}</p>
            </div>
            
            <div class="genero-actions">
              <button 
                class="btn-icon edit"
                @click="iniciarEdicao(genero)"
                title="Editar"
              >
                ✏️
              </button>
              <button 
                class="btn-icon delete"
                @click="confirmarExclusao(genero)"
                title="Excluir"
              >
                🗑️
              </button>
            </div>
          </li>
        </transition-group>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <transition name="modal">
      <div v-if="modalExcluir" class="modal-overlay" @click.self="modalExcluir = false">
        <div class="modal-content">
          <div class="modal-icon">⚠️</div>
          <h3>Confirmar Exclusão</h3>
          <p>
            Tem certeza que deseja excluir o gênero 
            <strong>"{{ generoParaExcluir?.nome }}"</strong>?
          </p>
          <p class="modal-warning">Esta ação não pode ser desfeita.</p>
          
          <div class="modal-actions">
            <button class="btn-secondary" @click="modalExcluir = false">
              Cancelar
            </button>
            <button 
              class="btn-danger" 
              @click="excluirGenero"
              :disabled="loadingDelete"
            >
              {{ loadingDelete ? "Excluindo..." : "Sim, Excluir" }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios"

const API_URL = "http://localhost:3002/generos"

export default {
  name: "Generos",

  data() {
    return {
      form: {
        id: null,
        nome: "",
        descricao: ""
      },
      generos: [],
      loading: false,
      loadingList: false,
      loadingDelete: false,
      mensagem: null,
      modoEdicao: false,
      modalExcluir: false,
      generoParaExcluir: null
    }
  },

  mounted() {
    this.carregarGeneros()
  },

  methods: {
    // Carregar lista de gêneros
    async carregarGeneros() {
      this.loadingList = true
      try {
        const res = await axios.get(API_URL)
        this.generos = res.data
      } catch (err) {
        this.mostrarMensagem("Erro ao carregar gêneros", "error")
      } finally {
        this.loadingList = false
      }
    },

    // Criar ou atualizar gênero
    async salvarGenero() {
      this.loading = true
      this.limparMensagem()

      try {
        if (this.modoEdicao) {
          // Atualizar
         await axios.put(`${API_URL}/${this.form.id}`, {
  nome: this.form.nome,
  descricao: this.form.descricao
})
          this.mostrarMensagem("Gênero atualizado com sucesso!", "success")
        } else {
          // Criar
          await axios.post(API_URL, this.form)
          this.mostrarMensagem("Gênero cadastrado com sucesso!", "success")
        }

        this.resetarFormulario()
        await this.carregarGeneros()

      } catch (err) {
        const msg = err.response?.data?.error || "Erro ao salvar gênero"
        this.mostrarMensagem(msg, "error")
      } finally {
        this.loading = false
      }
    },

    // Iniciar modo de edição
    iniciarEdicao(genero) {
  this.form = {
    id: genero._id,  // 👈 AQUI
    nome: genero.nome,
    descricao: genero.descricao
  }

  this.modoEdicao = true
  this.limparMensagem()
},

    // Cancelar edição
    cancelarEdicao() {
      this.resetarFormulario()
    },

    // Confirmar exclusão
    confirmarExclusao(genero) {
  this.generoParaExcluir = genero
  this.modalExcluir = true
},

    // Excluir gênero
    async excluirGenero() {
      if (!this.generoParaExcluir) return
      
      this.loadingDelete = true
      try {
        await axios.delete(`${API_URL}/${this.generoParaExcluir._id}`)
        this.mostrarMensagem("Gênero excluído com sucesso!", "success")
        await this.carregarGeneros()
        this.modalExcluir = false
        this.generoParaExcluir = null
      } catch (err) {
        this.mostrarMensagem("Erro ao excluir gênero", "error")
      } finally {
        this.loadingDelete = false
      }
    },

    // Utilitários
    resetarFormulario() {
      this.form = { id: null, nome: "", descricao: "" }
      this.modoEdicao = false
    },

    mostrarMensagem(texto, tipo) {
      this.mensagem = { texto, tipo }
      setTimeout(() => this.limparMensagem(), 5000)
    },

    limparMensagem() {
      this.mensagem = null
    }
  }
}
</script>

<style scoped>
/* Reset e Base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* Card Principal */
.main-card {
  width: 100%;
  max-width: 800px;
  background: rgba(17, 24, 39, 0.95);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

/* Header */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  text-align: center;
  color: white;
}

.header-section h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.subtitle {
  opacity: 0.9;
  font-size: 1rem;
}

/* Seções */
.form-section, .list-section {
  padding: 30px 40px;
}

.form-section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.form-section h2, .list-header h2 {
  color: #e2e8f0;
  margin-bottom: 20px;
  font-size: 1.25rem;
  font-weight: 600;
}

/* Inputs */
.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: #f1f5f9;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(15, 23, 42, 1);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-group input::placeholder,
.input-group textarea::placeholder {
  color: #64748b;
}

.input-group textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

/* Botões */
.button-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  flex: 1;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.4);
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Botões de Ícone */
.genero-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  background: transparent;
}

.btn-icon.edit {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.btn-icon.edit:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.1);
}

.btn-icon.delete {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Alertas */
.alert {
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 20px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.alert.success {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.alert.error {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Lista Header */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.badge {
  background: rgba(102, 126, 234, 0.2);
  color: #a5b4fc;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Lista de Gêneros */
.generos-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.genero-item {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.genero-item:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateX(4px);
}

.genero-info h3 {
  color: #f8fafc;
  font-size: 1.125rem;
  margin-bottom: 4px;
  font-weight: 600;
}

.genero-info p {
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Estados Vazios e Loading */
.empty-state, .loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  color: #94a3b8;
  font-size: 1.125rem;
  margin-bottom: 8px;
}

.empty-state span {
  font-size: 0.9rem;
}

.loading-state p {
  margin-top: 16px;
  color: #94a3b8;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #1e293b;
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: modalIn 0.3s ease;
}

.modal-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.modal-content h3 {
  color: #f8fafc;
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.modal-content p {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 8px;
}

.modal-warning {
  color: #f87171 !important;
  font-size: 0.875rem;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  flex: 1;
}

/* Animações */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.list-enter-active, .list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-move {
  transition: transform 0.4s ease;
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsividade */
@media (max-width: 640px) {
  .form-section, .list-section {
    padding: 24px;
  }
  
  .header-section {
    padding: 30px 24px;
  }
  
  .header-section h1 {
    font-size: 1.5rem;
  }
  
  .genero-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .genero-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>