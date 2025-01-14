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
      <v-row>
        <v-banner-text> Connected!</v-banner-text>
      </v-row>
      <v-row>
        <!--        TODO fix loading-->
        <PiButton :loading="loading" @click="onDisconnectButtonClick" color="red">Disconnect</PiButton>
      </v-row>
    </v-col>
  </PiCardContainer>
</template>

<style scoped src="./BotInfo.css" />
