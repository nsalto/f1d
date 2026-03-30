<script setup lang="ts">
import { getTeamColor } from '~/utils/team-colors'

const { currentSeason } = useSeason()
const { data: drivers } = await useFetch(`/api/standings/drivers/${currentSeason}`)
const { data: constructors } = await useFetch(`/api/standings/constructors/${currentSeason}`)

const topDrivers = computed(() => (drivers.value || []).slice(0, 5))
const topConstructors = computed(() => (constructors.value || []).slice(0, 5))
</script>

<template>
  <div class="space-y-4">
    <!-- Drivers -->
    <div class="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-zinc-300">Pilotos</h3>
        <NuxtLink to="/standings/drivers" class="text-xs text-red-400 hover:text-red-300">
          Ver todos
        </NuxtLink>
      </div>

      <div v-if="topDrivers.length" class="space-y-2">
        <div
          v-for="d in topDrivers"
          :key="d.driverId"
          class="flex items-center gap-3 text-sm"
        >
          <span class="w-5 font-mono-timing text-zinc-500 text-right">{{ d.position }}</span>
          <span
            class="w-1 h-5 rounded-full"
            :style="{ backgroundColor: getTeamColor(d.constructorName || '') }"
          />
          <span class="flex-1 text-zinc-200">{{ d.givenName }} {{ d.familyName }}</span>
          <span class="font-mono-timing text-zinc-400">{{ d.points }}</span>
        </div>
      </div>
      <p v-else class="text-zinc-600 text-sm">Sin datos. Sincroniza primero.</p>
    </div>

    <!-- Constructors -->
    <div class="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-zinc-300">Constructores</h3>
        <NuxtLink to="/standings/constructors" class="text-xs text-red-400 hover:text-red-300">
          Ver todos
        </NuxtLink>
      </div>

      <div v-if="topConstructors.length" class="space-y-2">
        <div
          v-for="c in topConstructors"
          :key="c.constructorId"
          class="flex items-center gap-3 text-sm"
        >
          <span class="w-5 font-mono-timing text-zinc-500 text-right">{{ c.position }}</span>
          <span
            class="w-1 h-5 rounded-full"
            :style="{ backgroundColor: getTeamColor(c.constructorName || '') }"
          />
          <span class="flex-1 text-zinc-200">{{ c.constructorName }}</span>
          <span class="font-mono-timing text-zinc-400">{{ c.points }}</span>
        </div>
      </div>
      <p v-else class="text-zinc-600 text-sm">Sin datos. Sincroniza primero.</p>
    </div>
  </div>
</template>
