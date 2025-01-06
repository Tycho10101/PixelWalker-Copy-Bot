<script lang="ts">
import { defineComponent } from 'vue'
import Home from './Login.ts'
import PiCardContainer from '@/components/PiCardContainer.vue'
import PiTextField from '@/components/PiTextField.vue'
import PiButton from '@/components/PiButton.vue'

export default defineComponent({
  components: { PiCardContainer, PiTextField, PiButton },
  extends: Home,
  setup(props, ctx) {
    return {
      ...Home.setup(props, ctx),
    }
  },
})
</script>

<template>
  <PiCardContainer>
    <v-form ref="form" validate-on="submit lazy" @submit.prevent="onConnectButtonClick">
      <v-col>
        <v-row>
          <PiTextField v-model="email" :required="true" label="Email"></PiTextField>
        </v-row>
        <v-row>
          <PiTextField v-model="password" :required="true" label="Password"></PiTextField>
        </v-row>
        <v-row>
          <PiTextField v-model="worldId" :required="true" label="World ID"></PiTextField>
        </v-row>
        <v-row>
          <PiButton :loading="loading" type="submit" color="green">Connect</PiButton>
        </v-row>
      </v-col>
    </v-form>
  </PiCardContainer>
</template>

<style scoped src="./Login.css" />
