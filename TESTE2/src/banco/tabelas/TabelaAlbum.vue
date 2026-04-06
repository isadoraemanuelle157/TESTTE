<template>
  <div class="container">
    <h1>💿 Álbuns Cadastrados</h1>

    <!-- BUSCA -->
    <input
      v-model="filtro"
      placeholder="Buscar álbum..."
      class="filtro"
    />

    <!-- TABELA -->
    <table>
      <thead>
        <tr>
          <th>Foto</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Cantores</th>
          <th>Data</th>
          <th>Ações</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="album in albunsFiltrados" :key="album._id">
          
          <!-- FOTO -->
          <td>
            <img :src="album.foto" class="foto" />
          </td>

          <!-- NOME -->
          <td>{{ album.nome }}</td>

          <!-- DESCRIÇÃO -->
          <td>{{ album.descricao }}</td>

          <!-- CANTORES -->
          <td>
            <div v-if="album.cantores && album.cantores.length">
              <div
                v-for="cantor in album.cantores"
                :key="cantor._id"
                class="cantor"
              >
                <img
                  :src="cantor.foto || defaultImg"
                  class="foto-cantor"
                />
                <span>{{ cantor.nome }}</span>
              </div>
            </div>
            <span v-else>Sem cantor</span>
          </td>

          <!-- DATA -->
          <td>
            {{ formatarData(album.createdAt) }}
          </td>

          <!-- AÇÕES -->
          <td>
            <button @click="editar(album)">✏️</button>
            <button @click="excluir(album._id)">🗑️</button>
          </td>

        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TabelaAlbuns",

  data() {
    return {
      albuns: [],
      filtro: "",
      defaultImg: "https://via.placeholder.com/40"
    };
  },

  computed: {
    albunsFiltrados() {
      return this.albuns.filter(album =>
        album.nome.toLowerCase().includes(this.filtro.toLowerCase())
      );
    }
  },

  methods: {
    async carregarAlbuns() {
      try {
        const response = await axios.get("http://localhost:3002/albuns");
        this.albuns = response.data;
      } catch (error) {
        console.error("Erro ao buscar álbuns:", error);
      }
    },

    formatarData(data) {
      if (!data) return "";
      return new Date(data).toLocaleDateString("pt-BR");
    },

    editar(album) {
      alert("Editar álbum: " + album.nome);
      // depois posso te ajudar com modal real
    },

    async excluir(id) {
      const confirmar = confirm("Deseja excluir este álbum?");
      if (!confirmar) return;

      try {
        await axios.delete(`http://localhost:3000/albuns/${id}`);
        this.carregarAlbuns();
      } catch (error) {
        console.error("Erro ao excluir:", error);
      }
    }
  },

  mounted() {
    this.carregarAlbuns();
  }
};
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: auto;
  padding: 20px;
  color: #fff;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

/* BUSCA */
.filtro {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: none;
  outline: none;
}

/* TABELA */
table {
  width: 100%;
  border-collapse: collapse;
  background: #1e1e1e;
  border-radius: 10px;
  overflow: hidden;
}

th, td {
  padding: 12px;
  text-align: center;
}

th {
  background: #333;
}

tr:nth-child(even) {
  background: #2a2a2a;
}

/* IMAGENS */
.foto {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
}

.foto-cantor {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

/* CANTOR */
.cantor {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 4px;
}

/* BOTÕES */
button {
  margin: 2px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #444;
  color: white;
}

button:hover {
  opacity: 0.8;
}
</style>