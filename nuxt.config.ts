export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/fonts'
  ],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500, 700] }
    ]
  },

  colorMode: {
    preference: 'dark'
  },

  routeRules: {
    // SWR caching disabled in dev - enable for production
    // '/api/calendar/**': { swr: 86400 },
    // '/api/standings/**': { swr: 3600 },
    // '/api/races/**/results': { swr: 3600 },
    // '/api/races/**/qualifying': { swr: 3600 },
    // '/api/races/next': { swr: 300 },
    // '/api/openf1/**': { swr: 1800 },
    // '/api/compare/**': { swr: 1800 }
  },

  runtimeConfig: {
    syncSecret: process.env.SYNC_SECRET || '',
    public: {
      jolpicaBaseUrl: 'https://api.jolpi.ca/ergast/f1',
      openf1BaseUrl: 'https://api.openf1.org/v1'
    }
  },

  nitro: {
    // @microsoft/signalr uses dynamic require() for tough-cookie, fetch-cookie, etc.
    // Must be externalized so Nitro doesn't try to bundle them
    externals: {
      inline: [],
      external: [
        '@microsoft/signalr',
        'tough-cookie',
        'fetch-cookie',
        'node-fetch'
      ]
    },
    // Ship SQL migrations next to the server entry (Railway cwd may omit repo-root drizzle/)
    hooks: {
      compiled: async (nitro) => {
        const { cpSync, existsSync } = await import('node:fs')
        const { join, resolve } = await import('node:path')
        const src = resolve(nitro.options.rootDir, 'drizzle')
        const dest = join(nitro.options.output.serverDir, 'drizzle')
        if (existsSync(src)) {
          cpSync(src, dest, { recursive: true })
        } else {
          console.warn('[f1-dashboard] drizzle/ not found at build time; commit migrations or tables will be missing in prod')
        }
      }
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
