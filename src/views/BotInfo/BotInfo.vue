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
          :loading="loading.loadingDisconnect.value"
          color="red"
          @click="withLoading(loading.loadingDisconnect, onDisconnectButtonClick)"
          >Disconnect
        </PiButton>
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
  <PiCardContainer>
    <v-col>
      <v-row>
        <PiButton
          :loading="loading.loadingExport.value"
          color="blue"
          @click="withLoading(loading.loadingExport, onExportButtonClick)"
          >Export to EELVL
        </PiButton>
      </v-row>
    </v-col>
  </PiCardContainer>
  <PiCardContainer>
    <v-col>
      <v-row><h3>Export info</h3></v-row>
      <v-row>
        EELVL doesn't have:
        <ul>
          <li>Climbable horizontal chain and rope [20, 22, 26]. Replaced with vertical variants.</li>
          <li>
            Local/global switch activator block [102, 107]. EELVL has limited version of this, that is equivalent to
            switch activator, that always sets switch state to off. If switch activator is set to off, it'll be replaced
            with EELVL equivalent. If switch activator is set to on, it'll be replaced with normal sign that contains
            switch id and on/off value.
          </li>
          <li>Local/global switch resetter block [103, 108]. Replaced with normal sign that contains on/off value.</li>
          <li>Multiple notes per music block - in EELVL it's limited to 1. Replaced with first note in the list.</li>
          <li>Cyan and magenta spike [146 - 155]. Replaced with brown spikes.</li>
          <li>Generic yellow face smile/frown block [300, 301]. Replaced with generic yellow face block.</li>
          <li>
            All 4 rotation variants of decorations. Usually it has just 2 rotation variants (like snow, web, beach sand,
            etc.). Replaced with closest decoration variant (for ex.: top left snow variant replaced with bottom left
            variant).
          </li>
          <li>Green sign [69] (nice). Replaced with normal signs.</li>
          <li>Purple mineral block [322]. Replaced with magenta mineral block.</li>
          <li>Plate with cake chocolate and pie cherry [1292, 1293]. Replaced with empty plate.</li>
          <li>A use for world portal [74]. There is no way to enter PW world id and then open browser to join it. So it's always replaced
            with world id pointing to "Current" with id 1.</li>
          <li>A use for world portal spawn [65]. Same as world portal, so id always replaced with 1.</li>
        </ul>
      </v-row>
      <v-row>Note: Numbers in [] brackets represent PixelWalker block ids.</v-row>
      <v-row>
        <br />
        Fun fact: Signs only let you enter 140 characters in EE: Offline. But it will happily accept EELVL file which has sign
        with more than 140 characters and will correctly show in game.
      </v-row>
    </v-col>
  </PiCardContainer>
</template>

<style scoped src="./BotInfo.css" />
