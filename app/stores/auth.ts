import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'

interface UserData {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MODERATOR' | 'STUDENT'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserData | null,
    isAuthenticated: false
  }),
  
  actions: {
    setUser(authUser: User, userData?: Partial<UserData>) {
      this.user = {
        id: authUser.id,
        name: userData?.name || '',
        email: authUser.email || '',
        role: (userData?.role?.toUpperCase() as UserData['role']) || 'STUDENT'
      }
      this.isAuthenticated = true
    },

    async logout() {
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      this.user = null
      this.isAuthenticated = false
      navigateTo('/auth/sign-in')
    },

    getCurrentUserRole(): 'ADMIN' | 'MODERATOR' | 'STUDENT' | null {
      return this.user?.role || null
    }
  },

  persist: true,
})