<script setup lang="ts">
const { currentSeason } = useSeason()

const navigation = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: 'Live', icon: 'i-lucide-radio', to: '/live' },
  { label: 'Calendar', icon: 'i-lucide-calendar', to: '/calendar' },
  { label: 'Standings', icon: 'i-lucide-trophy', to: '/standings/drivers' },
  { label: 'Penalties', icon: 'i-lucide-shield-alert', to: '/penalties' },
  { label: 'Compare', icon: 'i-lucide-git-compare-arrows', to: '/compare' }
]
</script>

<template>
  <div class="min-h-screen page-bg-gradient text-[#f0f0f0]">
    <!-- Skip link -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-[#e10600] focus:text-white focus:rounded-lg focus:text-sm focus:font-bold">
      Skip to content
    </a>

    <!-- Top navbar — broadcast grade -->
    <header class="header-broadcast border-b border-[#1a1a1a] bg-[#080808]/96 backdrop-blur-xl sticky top-0 z-50"
            style="box-shadow: 0 1px 0 rgba(225,6,0,0.08), 0 4px 24px rgba(0,0,0,0.5);">
      <!-- Línea roja superior con glow -->
      <div class="accent-line-red absolute top-0 left-0 right-0" style="height:1.5px;" />

      <div class="max-w-screen-2xl mx-auto px-4 h-13 flex items-center gap-6" style="height:52px;">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 flex-shrink-0 group">
          <!-- F1 logo block con corner cut -->
          <div class="corner-cut-sm bg-[#e10600] px-2.5 py-1 group-hover:brightness-110 transition-all"
               style="box-shadow: 0 0 16px rgba(225,6,0,0.35), 0 0 40px rgba(225,6,0,0.12);">
            <span class="font-timing text-sm font-black text-white tracking-tighter">F1</span>
          </div>
          <div class="flex flex-col leading-none">
            <span class="text-[11px] font-bold text-[#f0f0f0] uppercase tracking-widest">Dashboard</span>
            <span class="font-timing text-[9px] text-[#444]">{{ currentSeason }}</span>
          </div>
        </NuxtLink>

        <div class="w-px h-5 bg-[#1f1f1f] hidden md:block" aria-hidden="true" />

        <!-- Desktop nav -->
        <nav aria-label="Main navigation" class="hidden md:flex items-center gap-0.5">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="nav-link-hover flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#555]
                   hover:text-[#f0f0f0] focus-visible:ring-2 focus-visible:ring-[#e10600] focus-visible:outline-none transition-all duration-200"
            active-class="nav-active-glow !text-[#f0f0f0]"
          >
            <UIcon :name="item.icon" class="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-3">
          <DataStatus />
          <SyncButton />
        </div>
      </div>
    </header>

    <!-- Main -->
    <main id="main-content" class="max-w-screen-2xl mx-auto px-4 py-6">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-[#111] mt-16 py-5"
            style="background: linear-gradient(to top, rgba(225,6,0,0.02), transparent);">
      <div class="max-w-screen-2xl mx-auto px-4 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <div class="corner-cut-sm bg-[#e10600]/80 px-1.5 py-0.5">
            <span class="font-timing text-[9px] font-black text-white">F1</span>
          </div>
          <span class="text-[10px] text-[#333] font-medium uppercase tracking-widest">Dashboard</span>
        </div>
        <div class="text-[10px] text-[#2a2a2a]">
          <a href="https://api.jolpi.ca" target="_blank" class="hover:text-[#555] transition-colors">Jolpica</a>
          <span class="mx-1.5 text-[#1f1f1f]">·</span>
          <a href="https://openf1.org" target="_blank" class="hover:text-[#555] transition-colors">OpenF1</a>
          <span class="mx-1.5 text-[#1f1f1f]">·</span>
          <a href="https://www.formula1.com" target="_blank" class="hover:text-[#555] transition-colors">F1 Live Timing</a>
        </div>
      </div>
    </footer>

    <!-- Mobile bottom nav -->
    <nav aria-label="Mobile navigation" class="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl
                flex items-center justify-around h-14 md:hidden touch-manipulation"
         style="background: rgba(8,8,8,0.97); border-top: 1px solid #181818; box-shadow: 0 -4px 24px rgba(0,0,0,0.6);">
      <NuxtLink
        v-for="item in navigation"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 px-2 py-2 text-[#3a3a3a] hover:text-[#f0f0f0] focus-visible:ring-2 focus-visible:ring-[#e10600] focus-visible:outline-none rounded-lg transition-colors"
        active-class="!text-[#e10600]"
      >
        <UIcon :name="item.icon" class="w-5 h-5" aria-hidden="true" />
        <span class="text-[9px] font-medium">{{ item.label }}</span>
      </NuxtLink>
    </nav>
    <div class="h-14 md:hidden" />
  </div>
</template>
