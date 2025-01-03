<template>
    <v-text-field
        :rules="[
            v => !!v || !this.required || `Laukas privalomas.`,
            ...(this.rules ? this.rules : [])
        ]"
        :required="required"
        :label="label"
        :clearable="clearable"
        :maxlength="maxlength"
        v-model="model"
        :counter="counter"
        v-bind="$attrs"
        @click:clear="model = null"
        autocomplete="on"
    />
</template>

<script>
export default {
    name: 'TextField',
    props: {
        value: [String, Number],
        label: String,
        required: Boolean,
        maxlength: {
            type: Number,
            default: 100
        },
        rules: Array,
        clearable: {
            type: Boolean,
            default: true
        },
        counter: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        model: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit('input', value);
            }
        },
    }
};
</script>