// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/supabase',
    'pinia-plugin-persistedstate'
  ],

  // Nuxt 4.0
  future: {
    compatibilityVersion: 4
  },

  colorMode: {
    preference: 'light'
  },

  tailwindcss: {
    cssPath: '~/assets/css/app.css',
    configPath: '~/tailwind.config.js',
  },

  supabase: {
    redirectOptions: {
      login: '/auth/sign-in',
      callback: '/auth/callback',
      exclude: ['/']
    }
  }
})