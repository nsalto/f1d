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
  <div class="min-h-screen bg-[#080808] text-[#f0f0f0]">
    <!-- Skip link -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-[#e10600] focus:text-white focus:rounded-lg focus:text-sm focus:font-bold">
      Skip to content
    </a>

    <!-- Top navbar -->
    <header class="border-b border-[#141414] bg-[#080808]/95 backdrop-blur-xl sticky top-0 z-50">
      <div class="max-w-screen-2xl mx-auto px-4 h-12 flex items-center gap-6">
        <NuxtLink to="/" class="flex items-center gap-1.5 flex-shrink-0">
          <span class="font-timing text-base font-bold text-[#e10600] tracking-tight">F1</span>
          <span class="text-[10px] font-medium text-[#444] uppercase tracking-widest mt-px">DASHBOARD</span>
          <span class="font-timing text-[10px] text-[#2a2a2a] ml-1">{{ currentSeason }}</span>
        </NuxtLink>

        <div class="w-px h-4 bg-[#1f1f1f] hidden md:block" aria-hidden="true" />

        <!-- Desktop nav -->
        <nav aria-label="Main navigation" class="hidden md:flex items-center gap-0.5">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#444]
                   hover:text-[#f0f0f0] hover:bg-[#141414] focus-visible:ring-2 focus-visible:ring-[#e10600] focus-visible:outline-none transition-colors"
            active-class="!text-[#f0f0f0] !bg-[#141414]"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="ml-auto flex items-center gap-2">
          <DataStatus />
          <SyncButton />
        </div>
      </div>
    </header>

    <!-- Main -->
    <main id="main-content" class="max-w-screen-2xl mx-auto px-4 py-5">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-[#141414] mt-12 py-4">
      <div class="max-w-screen-2xl mx-auto px-4 text-center text-[10px] text-[#2a2a2a]">
        Data: <a href="https://api.jolpi.ca" target="_blank" class="text-[#444] hover:text-[#8a8a8a]">Jolpica</a>
        + <a href="https://openf1.org" target="_blank" class="text-[#444] hover:text-[#8a8a8a]">OpenF1</a>
        + <a href="https://www.formula1.com" target="_blank" class="text-[#444] hover:text-[#8a8a8a]">F1 Live Timing</a>
      </div>
    </footer>

    <!-- Mobile bottom nav -->
    <nav aria-label="Mobile navigation" class="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-xl
                border-t border-[#141414] flex items-center justify-around h-14 md:hidden touch-manipulation">
      <NuxtLink
        v-for="item in navigation"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 px-2 py-2 text-[#444] hover:text-[#f0f0f0] focus-visible:ring-2 focus-visible:ring-[#e10600] focus-visible:outline-none rounded-lg transition-colors"
        active-class="!text-[#e10600]"
      >
        <UIcon :name="item.icon" class="w-5 h-5" aria-hidden="true" />
        <span class="text-[9px] font-medium">{{ item.label }}</span>
      </NuxtLink>
    </nav>
    <div class="h-14 md:hidden" />
  </div>
</template>
