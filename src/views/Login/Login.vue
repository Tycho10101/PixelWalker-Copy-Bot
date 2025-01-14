<script lang="ts">
import { defineComponent } from 'vue'
import Login from './Login.ts'
import PiCardContainer from '@/components/PiCardContainer.vue'
import PiTextField from '@/components/PiTextField.vue'
import PiButton from '@/components/PiButton.vue'
import { withLoading } from '@/services/LoaderProxy.ts'

export default defineComponent({
  methods: { withLoading },
  components: { PiCardContainer, PiTextField, PiButton },
  extends: Login,
  setup(props, ctx) {
    return {
      ...Login.setup!(props, ctx),
    }
  },
})
</script>

<template>
  <PiCardContainer>
    <v-form
      ref="form"
      validate-on="submit lazy"
      @submit.prevent="withLoading(loading.loading, onConnectButtonClick)"
      autocomplete="on"
    >
      <v-col>
        <v-row>
          <PiTextField v-model="email" :required="true" label="Email"></PiTextField>
        </v-row>
        <v-row>
          <PiTextField v-model="password" :required="true" label="Password" type="password"></PiTextField>
        </v-row>
        <v-row>
          <PiTextField v-model="worldId" :required="true" label="World ID"></PiTextField>
        </v-row>
        <v-row>
          <PiButton :loading="loading.loading.value" color="green" type="submit">Connect</PiButton>
        </v-row>
        <v-row>
          <PiButton v-if="showSetDefaultWorldIdButton" @click="setDefaultWorldIdButtonClicked" color="blue"
            >Set default world id</PiButton
          >
        </v-row>
      </v-col>
    </v-form>
  </PiCardContainer>
</template>

<style scoped src="./Login.css" />
