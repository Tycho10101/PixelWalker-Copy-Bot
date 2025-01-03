<template>
  <v-btn :loading="loading" :disabled="loading" class="mt-2" type="submit" block>
    {{ text }}
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
    text: {
      type: String,
      default: 'Connect',
    },
  },
})
</script>
