<script setup>
import { computed, inject, ref } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { useReportGenerator } from '../../context.js';
import { toDefinition } from '../../utils/definition.js';
import RgDialog from '../../components/ui/RgDialog.vue';

const props = defineProps({ item: { type: Object, default: null } });
const emit = defineEmits(['close']);
const builder = inject(REPORT_BUILDER_KEY);
const theme = inject('rg-theme', 'light');
const { api } = useReportGenerator();

const label = ref(props.item?.label ?? '');
const formula = ref(props.item?.formula ?? '');
const textarea = ref(null);
const check = ref(null); // { ok, message }
const checking = ref(false);

const fields = computed(() => [...builder.state.draft.rows, ...builder.state.draft.values].filter((f) => f.uid !== props.item?.uid));

const FUNCTIONS = [
  ['IF(condition, then, else)', 'IF(, , )'],
  ['SAFE_DIVIDE(a, b)', 'SAFE_DIVIDE(, )'],
  ['ROUND(x, 2)', 'ROUND(, 2)'],
  ['COALESCE(a, 0)', 'COALESCE(, 0)'],
  ['ABS(x)', 'ABS()'],
  ['GREATEST(a, b)', 'GREATEST(, )'],
  ['LEAST(a, b)', 'LEAST(, )'],
  ['CONCAT(a, b)', 'CONCAT(, )'],
];

function insert(text) {
  const el = textarea.value;
  const start = el?.selectionStart ?? formula.value.length;
  const end = el?.selectionEnd ?? formula.value.length;
  formula.value = formula.value.slice(0, start) + text + formula.value.slice(end);
  requestAnimationFrame(() => {
    el?.focus();
    const caret = start + (text.includes('(') ? text.indexOf('(') + 1 : text.length);
    el?.setSelectionRange(caret, caret);
  });
  check.value = null;
}

/** Validates the formula by compiling the report with it, without running it. */
async function validate() {
  checking.value = true;
  try {
    const draft = JSON.parse(JSON.stringify(builder.state.draft));
    const probe = { uid: '__probe', kind: 'formula', label: label.value || 'Formula', formula: formula.value, as: '__formula_check', format: null };
    if (props.item) draft.values = draft.values.map((v) => (v.uid === props.item.uid ? { ...probe, as: v.as } : v));
    else draft.values.push(probe);
    await api.query.validate(toDefinition(draft).definition);
    check.value = { ok: true, message: 'The formula is valid.' };
    return true;
  } catch (error) {
    check.value = { ok: false, message: error.message };
    return false;
  } finally {
    checking.value = false;
  }
}

async function save() {
  if (!label.value.trim() || !formula.value.trim()) return;
  if (!(await validate())) return;
  if (props.item) builder.updateFormula(props.item.uid, label.value.trim(), formula.value.trim());
  else builder.addFormula(label.value.trim(), formula.value.trim());
  emit('close');
}
</script>

<template>
  <RgDialog :title="item ? 'Edit formula' : 'New formula'" :data-rg-theme="theme" class="rg-dialog--wide" @close="emit('close')">
    <label class="rg-field-inline" style="flex-direction: column; align-items: stretch" for="rg-formula-label">
      Column name
      <input id="rg-formula-label" v-model="label" class="rg-input" maxlength="120" placeholder="Visits per doctor" />
    </label>
    <label class="rg-field-inline" style="flex-direction: column; align-items: stretch" for="rg-formula-text">
      Formula
      <textarea
        id="rg-formula-text"
        ref="textarea"
        v-model="formula"
        class="rg-textarea rg-formula"
        spellcheck="false"
        placeholder="visits / doctors"
        @input="check = null"
        @keydown.ctrl.enter.prevent="save"
        @keydown.meta.enter.prevent="save"
      />
    </label>
    <div>
      <div class="rg-faint" style="font-size: 11.5px; margin-bottom: 4px">Fields in this report (click to insert)</div>
      <div class="rg-token-list">
        <button v-for="f in fields" :key="f.uid" type="button" class="rg-token" :title="f.label" @click="insert(f.as)">{{ f.as }}</button>
        <span v-if="!fields.length" class="rg-faint" style="font-size: 12px">Add fields first; formulas calculate with them.</span>
      </div>
    </div>
    <div>
      <div class="rg-faint" style="font-size: 11.5px; margin-bottom: 4px">Functions</div>
      <div class="rg-token-list">
        <button v-for="[shown, text] in FUNCTIONS" :key="shown" type="button" class="rg-token" @click="insert(text)">{{ shown }}</button>
      </div>
    </div>
    <p class="rg-faint" style="margin: 0; font-size: 12px">
      Use + − × ÷ (+ - * /), comparisons (&gt; = &lt;), AND, OR, NOT, and text in quotes ('High').
      Dividing by zero gives an empty value instead of an error.
    </p>
    <p v-if="check" class="rg-check-result" :class="check.ok ? 'rg-check-result--ok' : 'rg-check-result--error'" role="status">{{ check.message }}</p>
    <template #footer>
      <button type="button" class="rg-btn" :disabled="checking || !formula.trim()" @click="validate">Check</button>
      <button type="button" class="rg-btn" @click="emit('close')">Cancel</button>
      <button type="button" class="rg-btn rg-btn--primary" :disabled="checking || !label.trim() || !formula.trim()" @click="save">
        {{ item ? 'Save formula' : 'Add formula' }}
      </button>
    </template>
  </RgDialog>
</template>
