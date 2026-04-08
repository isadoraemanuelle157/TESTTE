<template>
  <div class="create-vibe-container">
    <h1>Criar Nova Vibe ✨</h1>

    <form @submit.prevent="createVibe" class="form">

      <!-- Nome -->
      <div class="form-group">
        <label>Nome da vibe</label>
        <input v-model="form.nome" type="text" required />
      </div>

      <!-- Emoji -->
      <div class="form-group">
        <label>Emoji</label>
        <input v-model="form.emoji" type="text" placeholder="Ex: 🎧" />
      </div>

      <!-- Descrição -->
      <div class="form-group">
        <label>Descrição</label>
        <textarea v-model="form.descricao"></textarea>
      </div>

      <!-- Gradiente -->
      <div class="form-group">
        <label>Gradiente (CSS)</label>
        <input
          v-model="form.gradient"
          placeholder="linear-gradient(135deg, #000, #fff)"
        />
      </div>

      <!-- Tags -->
      <div class="form-group">
        <label>Tags</label>

        <div class="tag-input">
          <input
            v-model="newTag"
            @keyup.enter.prevent="addTag"
            placeholder="Digite uma tag e pressione Enter"
          />
          <button type="button" @click="addTag">Adicionar</button>
        </div>

        <div class="tags">
          <span v-for="(tag, index) in form.tags" :key="index" class="tag">
            {{ tag }}
            <button @click="removeTag(index)">x</button>
          </span>
        </div>
      </div>

      <!-- Preview -->
      <div class="preview">
        <h3>Preview</h3>
        <div
          class="vibe-card"
          :style="{ background: form.gradient || '#333' }"
        >
          <span class="emoji">{{ form.emoji }}</span>
          <h2>{{ form.nome || 'Nome da vibe' }}</h2>
          <p>{{ form.descricao || 'Descrição da vibe...' }}</p>

          <div class="tags-preview">
            <span v-for="tag in form.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- Botão -->
      <button type="submit" class="btn-submit">
        Salvar Vibe
      </button>

    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        nome: '',
        emoji: '',
        descricao: '',
        gradient: '',
        tags: []
      },
      newTag: ''
    }
  },

  methods: {
    addTag() {
      if (!this.newTag.trim()) return
      this.form.tags.push(this.newTag.trim())
      this.newTag = ''
    },

    removeTag(index) {
      this.form.tags.splice(index, 1)
    },

    async createVibe() {
      try {
        const res = await fetch("http://localhost:3002/vibes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.form)
        })

        const data = await res.json()

        if (!res.ok) throw new Error(data.error)

        alert("Vibe criada com sucesso! 🎉")

        // reset
        this.form = {
          nome: '',
          emoji: '',
          descricao: '',
          gradient: '',
          tags: []
        }

      } catch (err) {
        alert("Erro: " + err.message)
      }
    }
  }
}
</script>

<style scoped>
.create-vibe-container {
  max-width: 700px;
  margin: auto;
  padding: 30px;
  color: white;
}

.form-group {
  margin-bottom: 20px;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: none;
}

.tag-input {
  display: flex;
  gap: 10px;
}

.tags {
  margin-top: 10px;
}

.tag {
  background: #1db954;
  padding: 5px 10px;
  border-radius: 20px;
  margin-right: 5px;
}

.preview {
  margin: 30px 0;
}

.vibe-card {
  padding: 20px;
  border-radius: 16px;
  color: white;
}

.emoji {
  font-size: 40px;
}

.tags-preview span {
  margin-right: 8px;
  background: rgba(255,255,255,0.2);
  padding: 4px 8px;
  border-radius: 10px;
}

.btn-submit {
  background: #1db954;
  padding: 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
</style>