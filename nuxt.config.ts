// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@nuxtjs/supabase",
    "pinia-plugin-persistedstate",
    "@nuxt/image",
    "@nuxtjs/seo",
  ],

  site: {
    url: "https://sciencehub.lk",
    name: "ScienceHub",
    description:
      "Your gateway to advanced science education and resources. Learn from experienced educators including our lead tutor, Chathura Nellampitiya, who specializes in delivering comprehensive science education.",
    defaultLocale: "en",
    identity: {
      type: "Organization",
    },
    twitter: "@sciencehub",
    author: {
      name: "Chathura Nellampitiya",
      role: "Lead Science Tutor",
    },
  },

  sitemap: {
    enabled: true,
  },

  robots: {
    enabled: true,
  },

  future: {
    compatibilityVersion: 4,
  },

  colorMode: {
    preference: "light",
  },

  tailwindcss: {
    cssPath: "~/assets/css/app.css",
    configPath: "~/tailwind.config.js",
  },

  supabase: {
    redirectOptions: {
      login: "/auth/sign-in",
      callback: "/auth/callback",
      exclude: [
        "/",
        "/auth/sign-in",
        "/auth/sign-up",
        "/auth/forgot-password",
        "/auth/invitation",
      ],
    },
  },

  runtimeConfig: {
    public: {
      isInMaintenanceMode: process.env.MAINTENANCE_MODE === "true",
    },
    supabase: {
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    smtp: {
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      fromName: process.env.SMTP_FROM_NAME,
      fromEmail: process.env.SMTP_FROM_EMAIL,
    },
  },

  routeRules: {
    "/console": {
      ssr: false,
      appMiddleware: ["auth"],
    },
    "/console/*/**": {
      ssr: false,
      appMiddleware: ["auth"],
    },
  },
});
