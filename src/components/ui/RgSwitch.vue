<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <button
    type="button"
    class="rg-switch"
    role="switch"
    :aria-checked="modelValue ? 'true' : 'false'"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    @click="emit('update:modelValue', !modelValue)"
  />
</template>
