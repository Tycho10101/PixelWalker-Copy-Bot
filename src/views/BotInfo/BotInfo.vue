<script lang="ts">
import { defineComponent } from 'vue'
import BotInfo from './BotInfo.ts'
import PiCardContainer from '@/components/PiCardContainer.vue'
import PiTextField from '@/components/PiTextField.vue'
import PiButton from '@/components/PiButton.vue'

export default defineComponent({
  components: { PiCardContainer, PiTextField, PiButton },
  extends: BotInfo,
  setup(props, ctx) {
    return {
      ...BotInfo.setup!(props, ctx),
    }
  },
})
</script>

<template>
  <PiCardContainer>
    <v-col>
      <v-row><h3>Connected!</h3></v-row>
      <v-row>
        <!--        TODO fix loading-->
        <PiButton :loading="loading" color="red" @click="onDisconnectButtonClick">Disconnect</PiButton>
      </v-row>
    </v-col>
  </PiCardContainer>
  <PiCardContainer>
    <v-col>
      <v-row><h3>Usage info</h3></v-row>
      <v-row> Select area to copy - gold coin</v-row>
      <v-row> Paste selected area - blue coin</v-row>
    </v-col>
  </PiCardContainer>
</template>

<style scoped src="./BotInfo.css" />
