<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#080808' }
  ],
  htmlAttrs: {
    lang: 'es',
    style: 'color-scheme: dark'
  }
})

useSeoMeta({
  title: 'F1 Dashboard',
  description: 'Dashboard de datos de Formula 1 - Calendario, standings, resultados y analisis'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    </NuxtLayout>
  </UApp>
</template>
