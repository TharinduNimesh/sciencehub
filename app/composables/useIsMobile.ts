import { ref, onMounted, onUnmounted } from 'vue'

export function useIsMobile() {
  const isMobile = ref(false)

    if (import.meta.server) return isMobile;

  const checkIsMobile = () => {
    isMobile.value = window.innerWidth < 640 // sm breakpoint in Tailwind
  }

  onMounted(() => {
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkIsMobile)
  })

  return {
    isMobile
  }
}