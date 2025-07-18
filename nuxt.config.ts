export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxtjs/color-mode',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@nuxtjs/supabase'
  ],

  supabase: {
    redirect: false,
    types: '~/types/supabase.ts',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY,
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }
  },

  colorMode: {
    classSuffix: ''
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  imports: {
    autoImport: true
  },

  css: ['~/assets/css/main.css']
})