import { ref } from "vue"

export const notifications = ref([])

export function notify(message) {
  notifications.value.push({
    id: Date.now(),
    message
  })
}