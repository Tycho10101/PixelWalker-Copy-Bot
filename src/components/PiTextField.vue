<template>
  <v-text-field
    :rules="[(v) => !!v || !required || 'Field mandatory.', ...(rules ? rules : [])]"
    :required="required"
    :label="label"
    :clearable="clearable"
    :maxlength="maxlength"
    v-model="internalModel"
    :counter="counter"
    v-bind="$attrs"
    @click:clear="internalModel = null"
    autocomplete="on"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

interface Props {
  value?: string | number
  label?: string
  required?: boolean
  maxlength?: number
  rules?: any[]
  clearable?: boolean
  counter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxlength: 100,
  clearable: true,
  counter: true,
})

const emit = defineEmits(['update:value'])

const internalModel = computed({
  get: () => props.value,
  set: (value) => emit('update:value', value),
})
const attrs = useAttrs()
</script>
