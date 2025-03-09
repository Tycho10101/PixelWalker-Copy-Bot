<script setup lang="ts">
import PiChangelogButton from '@/components/PiChangelogButton.vue'
</script>

<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <PiChangelogButton />
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
