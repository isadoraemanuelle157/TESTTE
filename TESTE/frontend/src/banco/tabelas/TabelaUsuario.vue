<template>
  <div class="dashboard-container">
    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Header Section -->
      <header class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="title-text">
              <h1>Gerenciamento de Usuários</h1>
              <p class="subtitle">Visualize e gerencie todos os usuários cadastrados</p>
            </div>
          </div>
          
          <div class="header-actions">
            <div class="search-box">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Buscar usuários..."
              />
            </div>
            <button class="btn-primary" @click="abrirModalRegistro">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>Novo Usuário</span>
            </button>
          </div>
        </div>
        
        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-value">{{ usuarios.length }}</span>
            <span class="stat-label">Total de Usuários</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ usuariosPublicos }}</span>
            <span class="stat-label">Contas Públicas</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ usuariosPrivados }}</span>
            <span class="stat-label">Contas Privadas</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ novosEstaSemana }}</span>
            <span class="stat-label">Novos (7 dias)</span>
          </div>
        </div>
      </header>

      <!-- Main Card -->
      <main class="main-card">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Carregando usuários...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="usuariosFiltrados.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
              <line x1="4" y1="4" x2="20" y2="20"/>
            </svg>
          </div>
          <h3>Nenhum usuário encontrado</h3>
          <p>{{ searchQuery ? 'Tente ajustar sua busca' : 'Comece adicionando um novo usuário' }}</p>
          <button v-if="searchQuery" class="btn-secondary" @click="searchQuery = ''">
            Limpar busca
          </button>
        </div>

        <!-- Data Table -->
        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="th-user">Usuário</th>
                <th class="th-email">Email</th>
                <th class="th-status">Status</th>
                <th class="th-date">Cadastro</th>
                <th class="th-actions">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="user in usuariosPaginados"
                :key="user.id"
                class="table-row"
              >
                <td class="td-user">
                  <div class="user-info">
                    <div class="avatar">
                      <img v-if="user.avatar" :src="user.avatar" />
                      <span v-else>{{ getInitials(user.nome) }}</span>
                    </div>
                    <div class="user-details">
                      <span class="user-name">{{ user.nome }}</span>
                      <span class="user-id">ID: {{ user.id.slice(-6) }}</span>
                    </div>
                  </div>
                </td>
                <td class="td-email">
                  <div class="email-cell">
                    <svg class="email-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span>{{ user.email }}</span>
                  </div>
                </td>
                <td class="td-status">
                  <span class="status-badge" :class="user.perfilPrivado ? 'inactive' : 'active'">
                    <span class="status-dot"></span>
                    {{ user.perfilPrivado ? 'Privado' : 'Público' }}
                  </span>
                </td>
                <td class="td-date">
                  {{ formatDate(user.createdAt || user.membroDesde) }}
                </td>
                <td class="td-actions">
                  <div class="action-buttons">
                    <button 
                      class="btn-icon edit" 
                      @click="editarUsuario(user.id)"
                      title="Editar usuário"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button 
                      class="btn-icon delete" 
                      @click="confirmarExclusao(user)"
                      title="Excluir usuário"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="usuariosFiltrados.length > 0" class="pagination">
          <span class="pagination-info">
            Mostrando 
            {{ (currentPage - 1) * itemsPerPage + 1 }} –
            {{ Math.min(currentPage * itemsPerPage, usuariosFiltrados.length) }}
            de {{ usuariosFiltrados.length }} usuários
          </span>

          <div class="pagination-controls">
            <button 
              class="btn-page btn-nav"
              :disabled="currentPage === 1"
              @click="currentPage--"
              aria-label="Página anterior"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            <template v-if="totalPages > 7 && currentPage > 4">
              <button class="btn-page" @click="currentPage = 1">1</button>
              <span class="pagination-ellipsis">···</span>
            </template>

            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['btn-page', { active: currentPage === page }]"
              @click="currentPage = page"
            >
              {{ page }}
            </button>

            <template v-if="totalPages > 7 && currentPage < totalPages - 3">
              <span class="pagination-ellipsis">···</span>
              <button class="btn-page" @click="currentPage = totalPages">{{ totalPages }}</button>
            </template>

            <button 
              class="btn-page btn-nav"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              aria-label="Próxima página"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- ==================== MODAL DE REGISTRO (1 ETAPA APENAS) ==================== -->
    <transition name="modal">
      <div v-if="showRegisterModal" class="modal-overlay register-modal-overlay" @click.self="fecharModalRegistro">
        <div class="register-modal-content">
          <!-- Header -->
          <div class="register-header">
            <div class="register-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h2>Criar Novo Usuário</h2>
            <p>Preencha os dados para cadastrar um novo usuário no sistema</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="criarUsuario" class="register-form">
            <!-- Nome -->
            <div class="form-group" :class="{ focused: focused === 'nome', filled: registerForm.nome }">
              <div class="input-wrap">
                <span class="input-emoji">👤</span>
                <input 
                  v-model="registerForm.nome" 
                  type="text" 
                  required
                  @focus="focused = 'nome'"
                  @blur="focused = null"
                  @input="atualizarUsername"
                  placeholder=" "
                />
                <label>Nome completo</label>
              </div>
            </div>

            <!-- Username (auto preenchido) -->
            

            <!-- Email -->
            <div class="form-group" :class="{ focused: focused === 'email', filled: registerForm.email }">
              <div class="input-wrap">
                <span class="input-emoji">✉️</span>
                <input 
                  v-model="registerForm.email" 
                  type="email" 
                  required
                  @focus="focused = 'email'"
                  @blur="focused = null"
                  placeholder=" "
                />
                <label>Email</label>
              </div>
            </div>

            <!-- Senha -->
            <div class="form-group" :class="{ focused: focused === 'senha', filled: registerForm.senha }">
              <div class="input-wrap">
                <span class="input-emoji">🔒</span>
                <input 
                  v-model="registerForm.senha" 
                  :type="showPassword ? 'text' : 'password'" 
                  required
                  @focus="focused = 'senha'"
                  @blur="focused = null"
                  placeholder=" "
                />
                <label>Senha</label>
                <button type="button" class="toggle-pass" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <div class="password-strength" v-if="registerForm.senha">
                <div class="strength-track">
                  <div class="strength-bar" :style="{ width: passwordStrength + '%', background: strengthColor }"></div>
                </div>
                <span class="strength-label" :style="{ color: strengthColor }">{{ strengthText }}</span>
              </div>
            </div>

            <!-- Confirmar Senha -->
            <div class="form-group" :class="{ focused: focused === 'confirmarSenha', filled: registerForm.confirmarSenha }">
              <div class="input-wrap">
                <span class="input-emoji">🔐</span>
                <input 
                  v-model="registerForm.confirmarSenha" 
                  :type="showConfirmPassword ? 'text' : 'password'" 
                  required
                  @focus="focused = 'confirmarSenha'"
                  @blur="focused = null"
                  placeholder=" "
                />
                <label>Confirmar senha</label>
                <button type="button" class="toggle-pass" @click="showConfirmPassword = !showConfirmPassword">
                  {{ showConfirmPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <span class="error-hint" v-if="senhasNaoCoincidem">As senhas não coincidem</span>
            </div>

            <!-- Actions -->
            <div class="form-actions compact">
              <button type="button" class="btn-register-back compact" @click="fecharModalRegistro">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span>Cancelar</span>
              </button>
              <button 
                type="submit" 
                class="btn-register-next compact"
                :disabled="!formValido || registerLoading"
              >
                <span v-if="!registerLoading">Criar Usuário</span>
                <span v-else class="btn-spinner-inline"></span>
                <svg v-if="!registerLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-content">
          <div class="modal-icon warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3>Confirmar Exclusão</h3>
          <p>
            Você está prestes a excluir o usuário 
            <strong>{{ usuarioParaExcluir?.nome }}</strong>.
          </p>
          <p class="modal-warning">Esta ação não pode ser desfeita.</p>
          
          <div class="modal-actions">
            <button class="btn-secondary" @click="showDeleteModal = false">
              Cancelar
            </button>
            <button 
              class="btn-danger" 
              @click="excluirUsuarioConfirmado"
              :disabled="deleting"
            >
              <span v-if="!deleting">Sim, Excluir</span>
              <span v-else class="btn-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- Success Alert Overlay -->
    <transition name="success-alert">
      <div v-if="showSuccessAlert" class="success-alert-overlay">
        <div class="success-alert-box">
          <div class="success-alert-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="success-alert-content">
            <h3>Usuário Criado!</h3>
            <p>O usuário <strong>{{ usuarioCriadoNome }}</strong> foi adicionado com sucesso à tabela.</p>
          </div>
          <button class="success-alert-close" @click="showSuccessAlert = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "UsuariosView",

  data() {
    return {
      usuarios: [],
      loading: true,
      searchQuery: "",
      showDeleteModal: false,
      usuarioParaExcluir: null,
      deleting: false,
      currentPage: 1,
      itemsPerPage: 10,
      toast: {
        show: false,
        message: "",
        type: "success"
      },

      // Modal de Registro (1 etapa apenas)
      showRegisterModal: false,
      registerLoading: false,
      focused: null,
      showPassword: false,
      showConfirmPassword: false,
     registerForm: {
  nome: "",
  username: "",
  email: "",
  senha: "",
  confirmarSenha: ""
},

      // Success Alert
      showSuccessAlert: false,
      usuarioCriadoNome: ""
    }
  },

  computed: {
    usuariosFiltrados() {
      if (!this.searchQuery) return this.usuarios
      const query = this.searchQuery.toLowerCase()
      return this.usuarios.filter(user =>
        (user.nome || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query)
      )
    },

    usuariosPaginados() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.usuariosFiltrados.slice(start, end)
    },

    totalPages() {
      return Math.ceil(this.usuariosFiltrados.length / this.itemsPerPage)
    },

    usuariosPublicos() {
      return this.usuarios.filter(u => !u.perfilPrivado).length
    },

    usuariosPrivados() {
      return this.usuarios.filter(u => u.perfilPrivado).length
    },

    visiblePages() {
      const total = this.totalPages
      const current = this.currentPage
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
      if (current <= 4) return [1, 2, 3, 4, 5, 6, 7]
      if (current >= total - 3) return Array.from({ length: 7 }, (_, i) => total - 6 + i)
      return [current - 3, current - 2, current - 1, current, current + 1, current + 2, current + 3]
    },

    novosEstaSemana() {
      const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return this.usuarios.filter(u => {
        const dataCadastro = u.createdAt || u.membroDesde
        return dataCadastro && new Date(dataCadastro) > umaSemanaAtras
      }).length
    },

    passwordStrength() {
      const senha = this.registerForm.senha
      let strength = 0
      if (senha.length >= 6) strength += 25
      if (senha.length >= 8) strength += 25
      if (/[A-Z]/.test(senha)) strength += 25
      if (/[0-9!@#$%^&*]/.test(senha)) strength += 25
      return strength
    },

    strengthColor() {
      if (this.passwordStrength <= 25) return '#ef4444'
      if (this.passwordStrength <= 50) return '#f59e0b'
      if (this.passwordStrength <= 75) return '#3b82f6'
      return '#22c55e'
    },

    strengthText() {
      if (this.passwordStrength <= 25) return 'Fraca'
      if (this.passwordStrength <= 50) return 'Média'
      if (this.passwordStrength <= 75) return 'Boa'
      return 'Forte'
    },

    senhasNaoCoincidem() {
      return this.registerForm.confirmarSenha && this.registerForm.senha !== this.registerForm.confirmarSenha
    },

    formValido() {
      return this.registerForm.nome &&
             this.registerForm.username.length >= 3 &&
             this.registerForm.email &&
             this.registerForm.senha.length >= 6 &&
             this.registerForm.confirmarSenha &&
             !this.senhasNaoCoincidem
    },

    bannerPreviewStyle() {
      if (this.registerForm.cover) {
        return { backgroundImage: `url(${this.registerForm.cover})` }
      }
      return {}
    }
  },

  async mounted() {
    await this.carregarUsuarios()
  },

  methods: {
    async carregarUsuarios() {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:3002/usuarios", {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.usuarios = (res.data || []).map(user => ({
          ...user,
          createdAt: user.createdAt || user.membroDesde || null
        }))
      } catch (err) {
        console.error("Erro ao buscar usuários:", err)
        this.showToast("Erro ao carregar usuários", "error")
      } finally {
        this.loading = false
      }
    },

    getInitials(nome) {
      if (!nome) return 'U'
      return nome
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    },

    // ========== MODAL DE REGISTRO ==========
    abrirModalRegistro() {
      this.showRegisterModal = true
      this.resetarFormulario()
    },

    fecharModalRegistro() {
      this.showRegisterModal = false
      this.resetarFormulario()
    },

    resetarFormulario() {
    this.registerForm = {
  nome: "",
  username: "",
  email: "",
  senha: "",
  confirmarSenha: ""
}
      this.focused = null
      this.showPassword = false
      this.showConfirmPassword = false
    },

    atualizarUsername() {
      // Gera username automático baseado no nome
      if (this.registerForm.nome) {
        const sugerido = this.registerForm.nome
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 30)
        this.registerForm.username = sugerido
      }
    },

    async criarUsuario() {
      if (!this.formValido) return
      
      this.registerLoading = true
      
      try {
        const token = localStorage.getItem("token")
        
        // Criar conta
        const res = await axios.post(
          "http://localhost:3002/usuarios/registrar",
          {
            nome: this.registerForm.nome,
            email: this.registerForm.email,
            senha: this.registerForm.senha
          }
        )

        const userId = res.data.user?._id || res.data.user?.id
        const userToken = res.data.token

        if (!userId) {
          throw new Error("ID do usuário não retornado")
        }

        // Completar perfil com dados extras
     await axios.put(
  `http://localhost:3002/usuarios/${userId}`,
  {
    username: this.registerForm.username
  },
  {
    headers: {
      Authorization: `Bearer ${userToken || token}`
    }
  }
)
        // Recarregar lista
        await this.carregarUsuarios()

        // Mostrar alert
        this.usuarioCriadoNome = this.registerForm.nome
        this.showSuccessAlert = true
        this.showRegisterModal = false
        
        setTimeout(() => {
          this.showSuccessAlert = false
        }, 4000)

      } catch (err) {
        console.error("Erro ao criar usuário:", err)
        this.showToast(err.response?.data?.error || "Erro ao criar usuário", "error")
      } finally {
        this.registerLoading = false
      }
    },

    // ========== AÇÕES EXISTENTES ==========
    editarUsuario(id) {
      this.$router.push(`/editarusuario/${id}`)
    },

    confirmarExclusao(user) {
      this.usuarioParaExcluir = user
      this.showDeleteModal = true
    },

    async excluirUsuarioConfirmado() {
      if (!this.usuarioParaExcluir) return
      this.deleting = true
      try {
        const token = localStorage.getItem("token")
        await axios.delete(
          `http://localhost:3002/usuarios/${this.usuarioParaExcluir.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.usuarios = this.usuarios.filter(user => user.id !== this.usuarioParaExcluir.id)
        this.showToast("Usuário excluído com sucesso!", "success")
        this.showDeleteModal = false
      } catch (err) {
        console.error("Erro ao excluir:", err)
        this.showToast("Erro ao excluir usuário", "error")
      } finally {
        this.deleting = false
        this.usuarioParaExcluir = null
      }
    },

    showToast(message, type = "success") {
      this.toast = { show: true, message, type }
      setTimeout(() => this.toast.show = false, 3000)
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard-container {
  min-height: 100vh;
  background: #020617;
  color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow-x: hidden;
}

/* Background Effects */
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: #6366f1;
  top: -300px;
  right: -200px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: #ec4899;
  bottom: -200px;
  left: -100px;
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Content Wrapper */
.content-wrapper {
  position: relative;
  z-index: 10;
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 24px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
}

.icon-wrapper svg {
  width: 32px;
  height: 32px;
  color: white;
}

.title-text h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #94a3b8;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  color: #64748b;
  pointer-events: none;
}

.search-box input {
  padding: 12px 16px 12px 48px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  width: 280px;
  transition: all 0.3s ease;
  outline: none;
}

.search-box input:focus {
  border-color: #6366f1;
  background: rgba(30, 41, 59, 1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-box input::placeholder {
  color: #64748b;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(34, 197, 94, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.3);
}

.btn-primary svg {
  width: 20px;
  height: 20px;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 48px;
  padding: 20px 24px;
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 140px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

/* Main Card */
.main-card {
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  gap: 16px;
  color: #64748b;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  text-align: center;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-illustration svg {
  width: 60px;
  height: 60px;
  color: #6366f1;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #f1f5f9;
  margin-bottom: 8px;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 24px;
}

.btn-secondary {
  padding: 10px 20px;
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.data-table th {
  padding: 16px 24px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  background: rgba(30, 41, 59, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.data-table th:first-child {
  border-top-left-radius: 12px;
}

.data-table th:last-child {
  border-top-right-radius: 12px;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: rgba(30, 41, 59, 0.4);
}

.table-row td {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* User Cell */
.td-user {
  width: 35%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #334155;
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: #f1f5f9;
  font-size: 0.95rem;
}

.user-id {
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
}

/* Email Cell */
.td-email {
  width: 30%;
}

.email-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
}

.email-icon {
  width: 16px;
  height: 16px;
  color: #64748b;
}

/* Status Cell */
.td-status {
  width: 15%;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Date Cell */
.td-date {
  width: 15%;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Actions Cell */
.td-actions {
  width: 15%;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
}

.btn-icon svg {
  width: 18px;
  height: 18px;
}

.btn-icon.edit {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.1);
}

.btn-icon.edit:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.btn-icon.delete {
  color: #f87171;
  background: rgba(239, 68, 68, 0.1);
}

.btn-icon.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

/* Pagination */
.pagination {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(15, 23, 42, 0.3);
}

.pagination-info {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-page {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: rgba(148, 163, 184, 0.06);
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.btn-page:hover:not(:disabled):not(.active) {
  background: rgba(99, 102, 241, 0.12);
  color: #c7d2fe;
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.btn-page.active {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  font-weight: 700;
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 
    0 4px 14px rgba(99, 102, 241, 0.4),
    0 0 0 1px rgba(99, 102, 241, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.btn-nav {
  min-width: 40px;
  padding: 0;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.btn-nav svg {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
}

.btn-nav:hover:not(:disabled) svg {
  transform: translateX(2px);
}

.btn-nav:first-child:hover:not(:disabled) svg {
  transform: translateX(-2px);
}

.btn-nav:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
  color: #818cf8;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(148, 163, 184, 0.03);
  border-color: transparent;
  transform: none;
  box-shadow: none;
}

.btn-page:disabled svg {
  opacity: 0.4;
}

.pagination-ellipsis {
  color: #475569;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0 4px;
  user-select: none;
  letter-spacing: 2px;
}

/* ==================== MODAL DE REGISTRO (1 ETAPA) ==================== */
.register-modal-overlay {
  z-index: 2000;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
}

.register-modal-content {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.8),
    0 0 0 1px rgba(99, 102, 241, 0.1);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 28px;
  animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.register-modal-content::-webkit-scrollbar {
  width: 6px;
}

.register-modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.register-modal-content::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Register Header */
.register-header {
  text-align: center;
  margin-bottom: 20px;
}

.register-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 8px 20px -4px rgba(99, 102, 241, 0.4);
}

.register-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.register-header h2 {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.register-header p {
  color: #94a3b8;
  font-size: 0.85rem;
}

/* Register Form */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 32px;
}

.form-group {
  position: relative;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-emoji {
  position: absolute;
  left: 14px;
  font-size: 1rem;
  z-index: 2;
  opacity: 0.6;
  transition: all 0.3s;
}

.form-group.focused .input-emoji {
  opacity: 1;
  transform: scale(1.1);
}

.input-wrap input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  background: rgba(30, 41, 59, 0.6);
  border: 2px solid rgba(148, 163, 184, 0.15);
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
}

.input-wrap input:focus {
  border-color: #6366f1;
  background: rgba(30, 41, 59, 0.8);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-wrap label {
  position: absolute;
  left: 42px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
  pointer-events: none;
  transition: all 0.3s ease;
  background: transparent;
  padding: 0 4px;
}

.input-wrap input:focus + label,
.input-wrap input:not(:placeholder-shown) + label,
.form-group.filled label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #818cf8;
  background: #0f172a;
  font-weight: 600;
}

.toggle-pass {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
  transition: opacity 0.3s;
  padding: 0;
}

.toggle-pass:hover {
  opacity: 1;
}

/* Password Strength */
.password-strength {
  margin-top: 6px;
  padding: 0 4px;
}

.strength-track {
  height: 3px;
  background: rgba(148, 163, 184, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  border-radius: 2px;
  transition: all 0.4s ease;
}

.strength-label {
  font-size: 0.7rem;
  margin-top: 3px;
  display: block;
  text-align: right;
  font-weight: 600;
}

.error-hint {
  font-size: 0.75rem;
  color: #f87171;
  margin-top: 4px;
  display: block;
  padding: 0 4px;
}

/* Form Actions Compact */
.form-actions.compact {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.btn-register-back.compact,
.btn-register-next.compact {
  flex: 1;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  height: 40px;
}

.btn-register-back.compact {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.btn-register-back.compact:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.btn-register-next.compact {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 3px 10px rgba(34, 197, 94, 0.25);
}

.btn-register-next.compact:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(34, 197, 94, 0.35);
}

.btn-register-next.compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-register-back.compact svg,
.btn-register-next.compact svg {
  width: 16px;
  height: 16px;
}

.btn-spinner-inline {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ==================== SUCCESS ALERT ==================== */
.success-alert-overlay {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 3000;
  animation: alertSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes alertSlideIn {
  from {
    opacity: 0;
    transform: translateX(100px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.success-alert-box {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(34, 197, 94, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  max-width: 380px;
}

.success-alert-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.3);
}

.success-alert-icon svg {
  width: 22px;
  height: 22px;
  color: white;
}

.success-alert-content h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 2px;
}

.success-alert-content p {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
}

.success-alert-content strong {
  color: #4ade80;
}

.success-alert-close {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  flex-shrink: 0;
  margin-left: 6px;
}

.success-alert-close:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.success-alert-close svg {
  width: 14px;
  height: 14px;
}

.success-alert-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.success-alert-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

/* Modal Base */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.modal-icon.warning {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.modal-icon svg {
  width: 32px;
  height: 32px;
}

.modal-content h3 {
  font-size: 1.5rem;
  margin-bottom: 12px;
  color: #f1f5f9;
}

.modal-content p {
  color: #94a3b8;
  margin-bottom: 8px;
  line-height: 1.5;
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

.btn-danger {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

.modal-enter-from .register-modal-content,
.modal-leave-to .register-modal-content {
  transform: scale(0.95) translateY(30px);
  opacity: 0;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  animation: toastIn 0.3s ease;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.toast.success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.toast.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.toast-icon {
  width: 24px;
  height: 24px;
}

.toast-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 16px;
  }
  
  .data-table th,
  .data-table td {
    padding: 12px 16px;
  }
  
  .td-user {
    width: auto;
  }
  
  .email-cell span {
    display: none;
  }
  
  .td-status,
  .td-date {
    display: none;
  }

  .register-modal-content {
    padding: 20px 16px;
    max-height: 95vh;
    max-width: 100%;
  }

  .success-alert-overlay {
    left: 16px;
    right: 16px;
    top: 16px;
  }

  .success-alert-box {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .pagination {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
  
  .pagination-info {
    font-size: 0.8rem;
  }
  
  .btn-page {
    min-width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }
}
</style>