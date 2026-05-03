export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/fonts'
  ],

  devtools: { enabled: true },

  app: {
    head: {
      title: 'F1 Dashboard',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Real-time F1 data dashboard with live timing, standings, and race analytics' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark'
  },

  runtimeConfig: {
    syncSecret: process.env.SYNC_SECRET || '',
    public: {
      jolpicaBaseUrl: 'https://api.jolpi.ca/ergast/f1',
      openf1BaseUrl: 'https://api.openf1.org/v1'
    }
  },

  routeRules: {
    // SWR caching — TTLs según volatilidad del dato y rate limits de Jolpica (4 req/s, 500 req/h)
    // y OpenF1 (30 req/10s). SWR sirve respuesta vieja inmediata + revalida en background.
    //
    // Datos casi inmutables — cache largo
    '/api/calendar/**': { swr: 86400 }, // 24h — el calendario apenas cambia
    '/api/openf1/**': { swr: 3600 }, // 1h — laps/pits/stints históricos no cambian
    '/api/races/**/qualifying': { swr: 3600 }, // 1h — quali cerrada, no cambia
    //
    // Datos semi-estáticos — cambian post-carrera o entre sesiones
    '/api/standings/**': { swr: 1800 }, // 30 min
    '/api/races/**/results': { swr: 600 }, // 10 min — penalizaciones post-carrera pueden mover el orden
    '/api/races/next': { swr: 600 }, // 10 min — countdown contra el reloj
    //
    // Externos
    '/api/weather/**': { swr: 600 } // 10 min — Open-Meteo, sin key, suficiente fuera de sesión
    //
    // SIN CACHE (no listados acá):
    // /api/live/stream  → SSE
    // /api/live/timing  → snapshot del estado en memoria
    // /api/live/history → fallback de última carrera, querés freshness
    // /api/penalties    → race control en vivo
    // /api/sync/**      → mutaciones POST
    // /api/admin/**     → debug
    // /api/status       → monitoreo de freshness
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    // @microsoft/signalr uses dynamic require() for tough-cookie, fetch-cookie, ws, etc.
    // Must be externalized so Nitro doesn't try to bundle them.
    // 'ws' es la librería de WebSocket que SignalR necesita en runtime de Node — sin ella
    // connection.start() falla con "Cannot find module 'ws'" en prod (en dev funciona porque
    // Vite resuelve todo dinámicamente).
    externals: {
      inline: [],
      external: [
        '@microsoft/signalr',
        'tough-cookie',
        'fetch-cookie',
        'node-fetch',
        'ws'
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

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 500, 700] }
    ]
  }
})
