import { useToast } from '#imports'

export const useNotification = () => {
  const toast = useToast()

  const showSuccess = (message: string) => {
    toast.add({
      title: 'Success',
      description: message,
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })
  }

  const showError = (message: string) => {
    toast.add({
      title: 'Error',
      description: message,
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  }

  const showWarning = (message: string) => {
    toast.add({
      title: 'Warning',
      description: message,
      icon: 'i-heroicons-exclamation-triangle',
      color: 'yellow'
    })
  }

  const showInfo = (message: string) => {
    toast.add({
      title: 'Info',
      description: message,
      icon: 'i-heroicons-information-circle',
      color: 'blue'
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}