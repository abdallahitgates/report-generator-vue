<script setup>
import { ref } from 'vue';
import RgIcon from './RgIcon.vue';
import RgPopover from './RgPopover.vue';

/**
 * "Export" button with Excel and CSV. `run(format)` returns a promise; the
 * button shows progress while the file streams.
 */
const props = defineProps({
  run: { type: Function, required: true },
  disabled: { type: Boolean, default: false },
  small: { type: Boolean, default: false },
});
const open = ref(false);
const busy = ref(null);
const error = ref(null);

async function go(format) {
  open.value = false;
  busy.value = format;
  error.value = null;
  try {
    await props.run(format);
  } catch (e) {
    error.value = e?.message ?? 'Export failed.';
  } finally {
    busy.value = null;
  }
}
</script>

<template>
  <div class="rg-export">
    <button
      type="button"
      class="rg-btn rg-btn--export"
      :class="{ 'rg-btn--sm': small }"
      :disabled="disabled || !!busy"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <RgIcon :name="busy ? 'loader' : 'download'" :spin="!!busy" small />
      {{ busy ? `Exporting ${busy === 'xlsx' ? 'Excel' : 'CSV'}…` : 'Export' }}
      <RgIcon v-if="!busy" name="chevron" small class="rg-export__chev" />
    </button>
    <RgPopover v-if="open" class="rg-export__menu" @close="open = false">
      <button type="button" role="menuitem" class="rg-export__item" @click="go('xlsx')">
        <span class="rg-export__icon rg-export__icon--xlsx"><RgIcon name="sheet" /></span>
        <span><b>Excel</b><small>Every row, formatted, opens in Excel</small></span>
      </button>
      <button type="button" role="menuitem" class="rg-export__item" @click="go('csv')">
        <span class="rg-export__icon"><RgIcon name="paragraph" /></span>
        <span><b>CSV</b><small>Plain text, for other systems</small></span>
      </button>
    </RgPopover>
    <p v-if="error" class="rg-export__error" role="alert">{{ error }}</p>
  </div>
</template>
