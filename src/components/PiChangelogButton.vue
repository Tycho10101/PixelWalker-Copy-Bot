<template>
  <PiCardContainer>
    <v-col>
      <v-row>
        {{ 'Last updated ' + changelogLatestVersionLine }}
        <PiButton @click="openChangelog" color="yellow">Changelog</PiButton>
      </v-row>
    </v-col>
  </PiCardContainer>
</template>

<script setup lang="ts">
import PiCardContainer from '@/components/PiCardContainer.vue'
import PiButton from '@/components/PiButton.vue'
import { onMounted, ref } from 'vue'

const changelogLocation = '/Pixel-Walker-Copy-Bot/changelog.txt'
const changelogLatestVersionLine = ref('')

onMounted(async () => {
  const response = await fetch(changelogLocation)
  const text = await response.text()
  changelogLatestVersionLine.value = text.split('\n')[2]
})

const openChangelog = () => {
  window.open(changelogLocation)
}
</script>
