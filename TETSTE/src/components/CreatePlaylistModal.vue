<template>
  <div v-if="modelValue" class="modal-overlay">
    <div class="modal">
      <h2>Criar nova playlist</h2>

      <input
        v-model="playlistName"
        type="text"
        placeholder="Nome da playlist"
        class="input"
      />

      <div class="actions">
        <button @click="close">Cancelar</button>
        <button @click="createPlaylist" :disabled="!playlistName">
          Criar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(["update:modelValue", "create"])

const playlistName = ref("")

function close() {
  emit("update:modelValue", false)
  playlistName.value = ""
}

function createPlaylist() {
  emit("create", playlistName.value)
  close()
}

watch(
  () => props.modelValue,
  (val) => {
    if (!val) playlistName.value = ""
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #121212;
  padding: 24px;
  border-radius: 10px;
  width: 320px;
}

.input {
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  background: #1e1e1e;
  border: none;
  color: white;
  border-radius: 6px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>