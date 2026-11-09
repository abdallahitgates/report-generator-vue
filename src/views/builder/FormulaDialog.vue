<script setup>
import { computed, inject, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import { useReportGenerator } from '../../context.js';
import { toDefinition } from '../../utils/definition.js';
import { toAliases, toLabels } from '../../utils/formulaText.js';
import RgDialog from '../../components/ui/RgDialog.vue';
import RgIcon from '../../components/ui/RgIcon.vue';

/**
 * Formula editor. People write with column names in brackets
 * ("[Amount] / [Number of visits]"), start from a quick formula, pick how the
 * result shows, and see whether it works while they type.
 */
const props = defineProps({ item: { type: Object, default: null } });
const emit = defineEmits(['close']);
const builder = inject(REPORT_BUILDER_KEY);
const theme = inject('rg-theme', 'light');
const { api } = useReportGenerator();

const fields = computed(() => [...builder.state.draft.rows, ...builder.state.draft.values].filter((f) => f.uid !== props.item?.uid));
const numbers = computed(() => fields.value.filter((f) => (f.kind !== 'dimension' && !['date', 'datetime'].includes(f.type) || f.kind === 'formula') || (f.kind === 'dimension' && ['integer', 'decimal'].includes(f.type))));
const dates = computed(() => fields.value.filter((f) => ['date', 'datetime'].includes(f.type) || f.grain));

const label = ref(props.item?.label ?? '');
const formula = ref(props.item ? toLabels(props.item.formula, fields.value) : '');
const format = ref(props.item?.format ?? '');
const textarea = ref(null);
const check = ref(null); // { ok, message }
const checking = ref(false);
const quick = reactive({ kind: '', a: '', b: '' });

const FORMATS = [
  ['', 'Automatic'],
  ['#,##0', 'Whole number'],
  ['#,##0.00', '2 decimals'],
  ['0.0%', 'Percent (0.25 → 25.0%)'],
];

const QUICK = [
  { kind: 'ratio', label: 'A per B', hint: 'Amount per visit', needs: 'numbers', make: (a, b) => [`SAFE_DIVIDE([${a}], [${b}])`, `${a} per ${b}`, '#,##0.00'] },
  { kind: 'share', label: 'A as % of B', hint: 'Coverage, achievement', needs: 'numbers', make: (a, b) => [`SAFE_DIVIDE([${a}], [${b}])`, `${a} % of ${b}`, '0.0%'] },
  { kind: 'diff', label: 'A − B', hint: 'Target minus actual', needs: 'numbers', make: (a, b) => [`[${a}] - [${b}]`, `${a} − ${b}`, ''] },
  { kind: 'sum', label: 'A + B', hint: 'Add two numbers', needs: 'numbers', make: (a, b) => [`[${a}] + [${b}]`, `${a} + ${b}`, ''] },
  { kind: 'growth', label: 'Change % from B to A', hint: 'This month vs last', needs: 'numbers', make: (a, b) => [`SAFE_DIVIDE([${a}] - [${b}], [${b}])`, `Change in ${a}`, '0.0%'] },
  { kind: 'days', label: 'Days from A to B', hint: 'Plan to visit, order to delivery', needs: 'dates', make: (a, b) => [`DAYS_BETWEEN([${a}], [${b}])`, `Days from ${a} to ${b}`, '#,##0'] },
  { kind: 'band', label: 'Label A as High / Low', hint: 'Above or below a threshold', needs: 'numbers', one: true, make: (a) => [`IF([${a}] >= 100, 'High', 'Low')`, `${a} level`, ''] },
];
const quickDef = computed(() => QUICK.find((q) => q.kind === quick.kind) ?? null);
const quickChoices = computed(() => (quickDef.value?.needs === 'dates' ? dates.value : numbers.value));
const quickReady = computed(() => !!quickDef.value && !!quick.a && (quickDef.value.one || !!quick.b));

function pickQuick(kind) {
  Object.assign(quick, { kind: quick.kind === kind ? '' : kind, a: '', b: '' });
}

function useQuick() {
  if (!quickReady.value) return;
  const [text, name, fmt] = quickDef.value.make(quick.a, quick.b);
  formula.value = text;
  label.value = name;
  format.value = fmt;
  quick.kind = '';
}

const FUNCTIONS = [
  ['Numbers', [
    ['SAFE_DIVIDE(a, b)', 'SAFE_DIVIDE(, )', 'a ÷ b, empty when b is 0'],
    ['PERCENT(a, b)', 'PERCENT(, )', 'a as a percentage of b (0–100)'],
    ['ROUND(x, 2)', 'ROUND(, 2)', 'Round to decimals'],
    ['ABS(x)', 'ABS()', 'Without the sign'],
    ['GREATEST(a, b)', 'GREATEST(, )', 'The larger'],
    ['LEAST(a, b)', 'LEAST(, )', 'The smaller'],
  ]],
  ['Logic', [
    ['IF(test, then, else)', 'IF(, , )', 'Choose by a condition'],
    ['COALESCE(a, 0)', 'COALESCE(, 0)', 'First value that is not empty'],
    ['NULLIF(a, b)', 'NULLIF(, )', 'Empty when a equals b'],
  ]],
  ['Dates & text', [
    ['DAYS_BETWEEN(a, b)', 'DAYS_BETWEEN(, )', 'Days from date a to date b'],
    ['CONCAT(a, b)', 'CONCAT(, )', 'Join text'],
    ['UPPER(x)', 'UPPER()', 'Capital letters'],
    ['LOWER(x)', 'LOWER()', 'Small letters'],
  ]],
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
}

const translated = computed(() => toAliases(formula.value, fields.value));

/** Validates the formula by compiling the report with it, without running it. */
async function validate() {
  if (!formula.value.trim()) {
    check.value = null;
    return false;
  }
  if (translated.value.unknown.length) {
    check.value = { ok: false, message: `There is no column named "${translated.value.unknown[0]}" in this report.` };
    return false;
  }
  checking.value = true;
  try {
    const draft = JSON.parse(JSON.stringify(builder.state.draft));
    const probe = { uid: '__probe', kind: 'formula', label: label.value || 'Formula', formula: translated.value.formula, as: '__formula_check', format: null };
    if (props.item) draft.values = draft.values.map((v) => (v.uid === props.item.uid ? { ...probe, as: v.as } : v));
    else draft.values.push(probe);
    await api.query.validate(toDefinition(draft).definition);
    check.value = { ok: true, message: 'Looks good.' };
    return true;
  } catch (error) {
    check.value = { ok: false, message: error.message };
    return false;
  } finally {
    checking.value = false;
  }
}

// Check while typing, after a short pause.
let timer = null;
watch(formula, () => {
  check.value = null;
  clearTimeout(timer);
  timer = setTimeout(validate, 650);
});
onBeforeUnmount(() => clearTimeout(timer));

async function save() {
  if (!label.value.trim() || !formula.value.trim()) return;
  if (!(await validate())) return;
  const text = translated.value.formula.trim();
  if (props.item) builder.updateFormula(props.item.uid, label.value.trim(), text, format.value || null);
  else {
    const item = builder.addFormula(label.value.trim(), text);
    if (format.value) builder.updateItem(item.uid, { format: format.value });
  }
  emit('close');
}
</script>

<template>
  <RgDialog :title="item ? 'Edit formula' : 'New formula'" :data-rg-theme="theme" class="rg-dialog--wide rg-formula-dialog" @close="emit('close')">
    <section v-if="!item" class="rg-quick" aria-label="Quick formulas">
      <div class="rg-quick__head"><RgIcon name="sparkle" small /> <b>Quick formula</b> <span class="rg-faint">pick one, then the columns</span></div>
      <div class="rg-quick__kinds">
        <button v-for="q in QUICK" :key="q.kind" type="button" class="rg-quick__kind" :aria-pressed="quick.kind === q.kind" @click="pickQuick(q.kind)">
          <b>{{ q.label }}</b><small>{{ q.hint }}</small>
        </button>
      </div>
      <Transition name="rg-swap">
        <div v-if="quickDef" class="rg-quick__pick">
          <label>A
            <select v-model="quick.a" class="rg-input"><option value="" disabled>Column…</option><option v-for="f in quickChoices" :key="f.uid" :value="f.label">{{ f.label }}</option></select>
          </label>
          <label v-if="!quickDef.one">B
            <select v-model="quick.b" class="rg-input"><option value="" disabled>Column…</option><option v-for="f in quickChoices" :key="f.uid" :value="f.label">{{ f.label }}</option></select>
          </label>
          <button type="button" class="rg-btn rg-btn--primary" :disabled="!quickReady" @click="useQuick">Use</button>
          <span v-if="!quickChoices.length" class="rg-faint">Add {{ quickDef.needs === 'dates' ? 'date columns' : 'numbers' }} to the report first.</span>
        </div>
      </Transition>
    </section>

    <div class="rg-formula-row">
      <label class="rg-formula-field" for="rg-formula-label">
        <span>Column name</span>
        <input id="rg-formula-label" v-model="label" class="rg-input" maxlength="120" placeholder="Visits per doctor" />
      </label>
      <label class="rg-formula-field rg-formula-field--format" for="rg-formula-format">
        <span>Show as</span>
        <select id="rg-formula-format" v-model="format" class="rg-input">
          <option v-for="[value, text] in FORMATS" :key="value" :value="value">{{ text }}</option>
        </select>
      </label>
    </div>

    <label class="rg-formula-field" for="rg-formula-text">
      <span>Formula <small class="rg-faint">· columns in [brackets], + − * /, comparisons, AND / OR, text in 'quotes'</small></span>
      <div class="rg-formula-box" :data-state="checking ? 'checking' : check ? (check.ok ? 'ok' : 'error') : 'idle'">
        <textarea
          id="rg-formula-text"
          ref="textarea"
          v-model="formula"
          class="rg-textarea rg-formula"
          spellcheck="false"
          placeholder="[Amount] / [Number of visits]"
          @keydown.ctrl.enter.prevent="save"
          @keydown.meta.enter.prevent="save"
        />
        <Transition name="rg-swap" mode="out-in">
          <p v-if="checking" key="c" class="rg-check-result"><RgIcon name="loader" spin small /> Checking…</p>
          <p v-else-if="check" :key="check.message" class="rg-check-result" :class="check.ok ? 'rg-check-result--ok' : 'rg-check-result--error'" role="status">
            <RgIcon :name="check.ok ? 'check' : 'alert'" small /> {{ check.message }}
          </p>
        </Transition>
      </div>
    </label>

    <div class="rg-formula-help">
      <div>
        <div class="rg-formula-help__title">Columns <small class="rg-faint">click to insert</small></div>
        <div class="rg-token-list">
          <button v-for="f in fields" :key="f.uid" type="button" class="rg-token rg-token--col" :data-kind="f.kind" :title="f.as" @click="insert(`[${f.label}]`)">{{ f.label }}</button>
          <span v-if="!fields.length" class="rg-faint" style="font-size: 12px">Add fields first; formulas calculate with them.</span>
        </div>
      </div>
      <div v-for="[group, list] in FUNCTIONS" :key="group">
        <div class="rg-formula-help__title">{{ group }}</div>
        <div class="rg-token-list">
          <button v-for="[shown, text, hint] in list" :key="shown" type="button" class="rg-token" :title="hint" @click="insert(text)">{{ shown }}</button>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="rg-faint rg-dialog__why">Ctrl+Enter to save</span>
      <button type="button" class="rg-btn" @click="emit('close')">Cancel</button>
      <button type="button" class="rg-btn rg-btn--primary" :disabled="checking || !label.trim() || !formula.trim()" @click="save">
        {{ item ? 'Save formula' : 'Add formula' }}
      </button>
    </template>
  </RgDialog>
</template>
