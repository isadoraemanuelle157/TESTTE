import { ref } from "vue"

export const currentMusic = ref(null)
export const isPlaying = ref(false)

export function playMusic(music) {
  currentMusic.value = music
  isPlaying.value = true
}

export function togglePlay() {
  isPlaying.value = !isPlaying.value
}