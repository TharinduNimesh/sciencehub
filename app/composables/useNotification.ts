import { useToast } from '#imports'

export const useNotification = () => {
  const toast = useToast()

  const showSuccess = (message: string) => {
    toast.add({
      title: 'Success',
      description: message,
      color: 'green'
    })
  }

  const showError = (message: string) => {
    toast.add({
      title: 'Error',
      description: message,
      color: 'red'
    })
  }

  return {
    showSuccess,
    showError
  }
}