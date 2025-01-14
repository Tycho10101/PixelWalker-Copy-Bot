<script lang="ts">
import { defineComponent } from 'vue'
import BotInfo from './BotInfo.ts'
import PiCardContainer from '@/components/PiCardContainer.vue'
import PiTextField from '@/components/PiTextField.vue'
import PiButton from '@/components/PiButton.vue'
import { withLoading } from '@/services/LoaderProxy.ts'

export default defineComponent({
  methods: { withLoading },
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
        <PiButton
          :loading="loading.loading.value"
          color="red"
          @click="withLoading(loading.loading, onDisconnectButtonClick)"
          >Disconnect</PiButton
        >
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
