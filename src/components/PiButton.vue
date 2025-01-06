<template>
  <v-btn :loading="loading" :disabled="loading" class="mt-2" block c>
    <slot></slot>
  </v-btn>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PiButton',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
})
</script>
