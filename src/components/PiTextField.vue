<template>
  <v-text-field
    :rules="[(v) => !!v || !props.required || 'Field mandatory.', ...(props.rules ? props.rules : [])]"
    :required="props.required"
  />
</template>

<script setup lang="ts">
interface Props {
  required?: boolean
  rules?: any[]
}

const props = withDefaults(defineProps<Props>(), {})
</script>
