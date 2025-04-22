<script lang="ts" setup>
import PiChangelogButton from '@/component/PiChangelogButton.vue'
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
