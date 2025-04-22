<template>
  <PiCardContainer>
    <v-col>
      <v-row>
        {{ 'Last updated ' + changelogLatestVersionLine }}
        <PiButton color="yellow" @click="openChangelog">Changelog</PiButton>
      </v-row>
    </v-col>
  </PiCardContainer>
</template>

<script lang="ts" setup>
import PiCardContainer from '@/component/PiCardContainer.vue'
import PiButton from '@/component/PiButton.vue'
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
