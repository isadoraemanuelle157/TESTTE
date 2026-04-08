<template>
  <div class="container">
    <div class="header">
      <h2>🎤 Cantores</h2>
      <p class="subtitle">Gerencie seus artistas e álbuns favoritos</p>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="col-arrow"></th>
            <th class="col-foto">Foto</th>
            <th class="col-nome">Nome</th>
            <th class="col-albuns">Álbuns</th>
            <th class="col-data">Criado em</th>
            <th class="col-acoes">Ações</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="cantor in cantores" :key="cantor._id">
            
            <!-- LINHA DO CANTOR -->
            <tr class="cantor-row" :class="{ 'active': aberto === cantor._id }">
              <!-- SETA -->
              <td class="cell-arrow">
                <button 
                  @click="toggleAlbuns(cantor._id)" 
                  class="btn-toggle"
                  :class="{ 'rotated': aberto === cantor._id }"
                >
                  <span class="arrow">▶</span>
                </button>
              </td>

              <!-- FOTO -->
              <td class="cell-foto">
                <div class="avatar-wrapper">
                  <img
                    :src="cantor.foto || defaultImg"
                    class="foto"
                    @error="$event.target.src = defaultImg"
                  />
                </div>
              </td>

              <!-- NOME -->
              <td class="cell-nome">
                <span class="nome-texto">{{ cantor.nome }}</span>
              </td>

              <!-- TOTAL ÁLBUNS -->
              <td class="cell-albuns">
                <span class="badge-albuns">
                  {{ cantor.totalAlbuns || cantor.albuns?.length || 0 }}
                </span>
              </td>

              <!-- DATA -->
              <td class="cell-data">
                <span class="data-texto">{{ formatarData(cantor.createdAt) }}</span>
              </td>

              <!-- AÇÕES -->
              <td class="cell-acoes">
                <div class="acoes-wrapper">
                  <button @click="abrirModalCantor(cantor)" class="btn-acao btn-editar" title="Editar">
                    ✏️
                  </button>
                  <button @click="excluirCantor(cantor._id)" class="btn-acao btn-excluir" title="Excluir">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>

            <!-- LINHA EXPANDIDA (ÁLBUNS) -->
            <tr v-if="aberto === cantor._id" class="album-row">
              <td colspan="6">
                <div class="albuns-container">
                  <div class="albuns-header">
                    <h4>💿 Álbuns de {{ cantor.nome }}</h4>
                    <button class="btn-add" @click="abrirModalAlbum(cantor)">
                      <span class="icon">➕</span>
                      <span>Adicionar Álbum</span>
                    </button>
                  </div>

                  <!-- LISTA DE ÁLBUNS -->
                  <div v-if="cantor.albuns && cantor.albuns.length" class="albuns-lista">
                    <div
                      v-for="album in cantor.albuns"
                      :key="album._id"
                      class="album-card"
                    >
                      <div class="album-info">
                        <div class="album-foto-wrapper">
                          <img :src="album.foto || defaultImg" class="foto-album" @error="$event.target.src = defaultImg" />
                        </div>
                        
                        <div class="album-detalhes">
                          <strong class="album-nome">{{ album.nome }}</strong>
                          <p class="album-descricao">{{ album.descricao || 'Sem descrição' }}</p>
                        </div>
                      </div>

                      <div class="album-acoes">
                        <button @click="editarAlbum(album)" class="btn-album-acao btn-editar-album" title="Editar">
                          ✏️
                        </button>
                        <button @click="excluirAlbum(album._id)" class="btn-album-acao btn-excluir-album" title="Excluir">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-else class="sem-albuns">
                    <div class="sem-albuns-icon">🎵</div>
                    <p>Sem álbuns cadastrados</p>
                    <span class="sem-albuns-hint">Clique em "Adicionar Álbum" para começar</span>
                  </div>
                </div>
              </td>
            </tr>

          </template>
        </tbody>
      </table>
    </div>

    <!-- ==================== MODAL CANTOR ==================== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalCantorAberto" class="modal-overlay" @click="fecharModalCantor">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>✏️ Editar Cantor</h3>
              <button class="btn-fechar" @click="fecharModalCantor">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label for="cantor-nome">Nome do Cantor *</label>
                <input 
                  id="cantor-nome"
                  v-model="cantorForm.nome" 
                  type="text" 
                  placeholder="Ex: Michael Jackson"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="cantor-foto">URL da Foto</label>
                <input 
                  id="cantor-foto"
                  v-model="cantorForm.foto" 
                  type="text" 
                  placeholder="https://exemplo.com/foto.jpg"
                  class="form-input"
                />
                
                <div v-if="cantorForm.foto" class="preview-container preview-cantor">
                  <img :src="cantorForm.foto" class="preview-img" @error="cantorForm.foto = ''" />
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancelar" @click="fecharModalCantor">Cancelar</button>
              <button 
                class="btn-salvar" 
                @click="salvarCantor"
                :disabled="!cantorForm.nome.trim()"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ==================== MODAL ÁLBUM ==================== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modalAlbumAberto" class="modal-overlay" @click="fecharModalAlbum">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>{{ modoEdicaoAlbum ? '✏️ Editar Álbum' : '➕ Novo Álbum' }}</h3>
              <button class="btn-fechar" @click="fecharModalAlbum">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label for="album-nome">Nome do Álbum *</label>
                <input 
                  id="album-nome"
                  v-model="albumForm.nome" 
                  type="text" 
                  placeholder="Ex: Thriller"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="album-descricao">Descrição</label>
                <textarea 
                  id="album-descricao"
                  v-model="albumForm.descricao" 
                  placeholder="Descrição do álbum..."
                  class="form-textarea"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="album-foto">URL da Foto</label>
                <input 
                  id="album-foto"
                  v-model="albumForm.foto" 
                  type="text" 
                  placeholder="https://exemplo.com/foto.jpg"
                  class="form-input"
                />
                
                <div v-if="albumForm.foto" class="preview-container">
                  <img :src="albumForm.foto" class="preview-img" @error="albumForm.foto = ''" />
                </div>
              </div>

              <div class="form-group">
                <label>Cantor Vinculado</label>
                <div class="cantor-vinculado">
                  <div class="mini-avatar">
                    <img :src="cantorAtual?.foto || defaultImg" />
                  </div>
                  <span>{{ cantorAtual?.nome }}</span>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-cancelar" @click="fecharModalAlbum">Cancelar</button>
              <button 
                class="btn-salvar" 
                @click="salvarAlbum"
                :disabled="!albumForm.nome.trim()"
              >
                {{ modoEdicaoAlbum ? 'Salvar Alterações' : 'Criar Álbum' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      cantores: [],
      aberto: null,
      defaultImg: "https://via.placeholder.com/100/6366f1/ffffff?text=🎤",
      
      // Modal Cantor
      modalCantorAberto: false,
      cantorEditando: null,
      cantorForm: {
        nome: '',
        foto: ''
      },
      
      // Modal Álbum
      modalAlbumAberto: false,
      modoEdicaoAlbum: false,
      cantorAtual: null,
      albumEditando: null,
      albumForm: {
        nome: '',
        descricao: '',
        foto: ''
      }
    };
  },

  methods: {
    async carregarCantores() {
      try {
        const res = await axios.get("http://localhost:3002/cantores");
        this.cantores = res.data;
      } catch (error) {
        console.error("Erro ao carregar cantores:", error);
      }
    },

    toggleAlbuns(id) {
      this.aberto = this.aberto === id ? null : id;
    },

    formatarData(data) {
      if (!data) return "-";
      return new Date(data).toLocaleDateString("pt-BR");
    },

    // =========================
    // 🎤 MODAL CANTOR
    // =========================
    abrirModalCantor(cantor) {
      this.cantorEditando = cantor;
      this.cantorForm = {
        nome: cantor.nome || '',
        foto: cantor.foto || ''
      };
      this.modalCantorAberto = true;
      document.body.style.overflow = 'hidden';
    },

    fecharModalCantor() {
      this.modalCantorAberto = false;
      this.cantorEditando = null;
      document.body.style.overflow = '';
    },

    async salvarCantor() {
      if (!this.cantorForm.nome.trim()) return;

      try {
        await axios.put(`http://localhost:3002/cantores/${this.cantorEditando._id}`, {
          nome: this.cantorForm.nome,
          foto: this.cantorForm.foto
        });

        await this.carregarCantores();
        this.fecharModalCantor();
      } catch (error) {
        console.error("Erro ao salvar cantor:", error);
        alert("Erro ao salvar cantor. Tente novamente.");
      }
    },

    async excluirCantor(id) {
      if (!confirm("Tem certeza que deseja excluir este cantor?")) return;

      try {
        await axios.delete(`http://localhost:3002/cantores/${id}`);
        this.carregarCantores();
      } catch (error) {
        console.error("Erro ao excluir cantor:", error);
      }
    },

    // =========================
    // 💿 MODAL ÁLBUM
    // =========================
    abrirModalAlbum(cantor, album = null) {
      this.cantorAtual = cantor;
      this.modoEdicaoAlbum = !!album;
      this.albumEditando = album;
      
      if (album) {
        this.albumForm = {
          nome: album.nome || '',
          descricao: album.descricao || '',
          foto: album.foto || ''
        };
      } else {
        this.albumForm = {
          nome: '',
          descricao: '',
          foto: ''
        };
      }
      
      this.modalAlbumAberto = true;
      document.body.style.overflow = 'hidden';
    },

    fecharModalAlbum() {
      this.modalAlbumAberto = false;
      this.cantorAtual = null;
      this.albumEditando = null;
      document.body.style.overflow = '';
    },

    async salvarAlbum() {
      if (!this.albumForm.nome.trim()) return;

      try {
        if (this.modoEdicaoAlbum) {
          await axios.put(`http://localhost:3002/albuns/${this.albumEditando._id}`, {
            nome: this.albumForm.nome,
            descricao: this.albumForm.descricao,
            foto: this.albumForm.foto
          });
        } else {
          await axios.post("http://localhost:3002/albuns", {
            nome: this.albumForm.nome,
            descricao: this.albumForm.descricao,
            foto: this.albumForm.foto,
            cantores: [this.cantorAtual._id]
          });
        }

        await this.carregarCantores();
        this.aberto = this.cantorAtual._id;
        this.fecharModalAlbum();
      } catch (error) {
        console.error("Erro ao salvar álbum:", error);
        alert("Erro ao salvar álbum. Tente novamente.");
      }
    },

    editarAlbum(album) {
      const cantor = this.cantores.find(c => 
        c.albuns?.some(a => a._id === album._id)
      );
      if (cantor) {
        this.abrirModalAlbum(cantor, album);
      }
    },

    async excluirAlbum(id) {
      if (!confirm("Tem certeza que deseja excluir este álbum?")) return;

      try {
        await axios.delete(`http://localhost:3002/albuns/${id}`);
        this.carregarCantores();
      } catch (error) {
        console.error("Erro ao excluir álbum:", error);
      }
    }
  },

  mounted() {
    this.carregarCantores();
  },

  beforeUnmount() {
    document.body.style.overflow = '';
  }
};
</script>

<style scoped>
/* ===== VARIÁVEIS E RESET ===== */
* {
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

/* ===== HEADER ===== */
.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 10px 0;
  letter-spacing: -1px;
}

.subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

/* ===== TABELA ===== */
.table-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

/* ===== HEADER DA TABELA ===== */
thead {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
}

th {
  padding: 20px 15px;
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  border: none;
}

.col-arrow { width: 60px; }
.col-foto { width: 80px; }
.col-nome { text-align: left; }
.col-albuns { width: 100px; }
.col-data { width: 150px; }
.col-acoes { width: 120px; }

/* ===== LINHAS DO CANTOR ===== */
.cantor-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid #e5e7eb;
}

.cantor-row:hover {
  background: #f9fafb;
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.cantor-row.active {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
}

.cantor-row td {
  padding: 20px 15px;
  border: none;
}

/* ===== BOTÃO TOGGLE ===== */
.btn-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-toggle:hover {
  background: #e5e7eb;
}

.arrow {
  display: inline-block;
  transition: transform 0.3s ease;
  font-size: 0.8rem;
  color: #6b7280;
}

.btn-toggle.rotated .arrow {
  transform: rotate(90deg);
  color: #6366f1;
}

/* ===== AVATAR ===== */
.avatar-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 3px solid white;
  transition: transform 0.3s ease;
}

.cantor-row:hover .avatar-wrapper {
  transform: scale(1.1);
}

.foto {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== NOME ===== */
.nome-texto {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

/* ===== BADGE ÁLBUNS ===== */
.badge-albuns {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

/* ===== DATA ===== */
.data-texto {
  color: #6b7280;
  font-size: 0.875rem;
}

/* ===== AÇÕES ===== */
.acoes-wrapper {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-acao {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-editar {
  background: #dbeafe;
}

.btn-editar:hover {
  background: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-excluir {
  background: #fee2e2;
}

.btn-excluir:hover {
  background: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* ===== SEÇÃO DE ÁLBUNS ===== */
.album-row td {
  padding: 0;
  background: #f8fafc;
}

.albuns-container {
  padding: 30px;
  animation: slideDown 0.4s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.albuns-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.albuns-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-add {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.icon {
  font-size: 1.1rem;
}

/* ===== LISTA DE ÁLBUNS ===== */
.albuns-lista {
  display: grid;
  gap: 15px;
}

.album-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.album-card:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #6366f1;
}

.album-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.album-foto-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.foto-album {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-detalhes {
  flex: 1;
}

.album-nome {
  display: block;
  color: #1f2937;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.album-descricao {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.album-acoes {
  display: flex;
  gap: 8px;
}

.btn-album-acao {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-editar-album {
  background: #eff6ff;
  color: #3b82f6;
}

.btn-editar-album:hover {
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.btn-excluir-album {
  background: #fef2f2;
  color: #ef4444;
}

.btn-excluir-album:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

/* ===== SEM ÁLBUNS ===== */
.sem-albuns {
  text-align: center;
  padding: 50px 20px;
  color: #9ca3af;
}

.sem-albuns-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.sem-albuns p {
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  color: #6b7280;
}

.sem-albuns-hint {
  font-size: 0.9rem;
}

/* ==================== MODAL ==================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* ===== MODAL HEADER ===== */
.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  color: white;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-fechar {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-fechar:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* ===== MODAL BODY ===== */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* ===== PREVIEW ===== */
.preview-container {
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 12px;
  text-align: center;
}

.preview-cantor .preview-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.preview-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ===== CANTOR VINCULADO ===== */
.cantor-vinculado {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f3f4f6;
  border-radius: 12px;
  color: #374151;
  font-weight: 500;
}

.mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mini-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===== MODAL FOOTER ===== */
.modal-footer {
  padding: 20px 24px;
  background: #f9fafb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #e5e7eb;
}

.btn-cancelar {
  padding: 12px 24px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancelar:hover {
  border-color: #d1d5db;
  background: #f3f4f6;
}

.btn-salvar {
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-salvar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.btn-salvar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== TRANSITIONS DO MODAL ===== */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}

.modal-enter-to .modal-content,
.modal-leave-from .modal-content {
  transform: scale(1) translateY(0);
}

.modal-content {
  transition: transform 0.3s ease;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .container {
    padding: 20px 10px;
  }
  
  .header h2 {
    font-size: 1.8rem;
  }
  
  .col-data, .col-albuns {
    display: none;
  }
  
  .album-card {
    flex-direction: column;
    text-align: center;
  }
  
  .album-info {
    flex-direction: column;
  }
  
  .albuns-header {
    flex-direction: column;
    text-align: center;
  }

  .modal-content {
    max-width: 100%;
    border-radius: 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-cancelar,
  .btn-salvar {
    width: 100%;
  }
}

/* ===== ANIMAÇÃO DE ENTRADA ===== */
.cantor-row {
  animation: fadeInRow 0.5s ease forwards;
  opacity: 0;
}

.cantor-row:nth-child(1) { animation-delay: 0.05s; }
.cantor-row:nth-child(2) { animation-delay: 0.1s; }
.cantor-row:nth-child(3) { animation-delay: 0.15s; }
.cantor-row:nth-child(4) { animation-delay: 0.2s; }
.cantor-row:nth-child(5) { animation-delay: 0.25s; }

@keyframes fadeInRow {
  to {
    opacity: 1;
  }
}
</style>