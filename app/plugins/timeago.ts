export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      timeAgo: (value: string) => {
        if (!value) return ''
        
        const date = new Date(value)
        const now = new Date()
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (seconds < 60) {
          return 'just now'
        } else if (minutes < 60) {
          return `${minutes}m ago`
        } else if (hours < 24) {
          return `${hours}h ago`
        } else if (days < 7) {
          return `${days}d ago`
        } else {
          return date.toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
          })
        }
      }
    }
  }
})