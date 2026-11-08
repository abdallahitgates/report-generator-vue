<script setup>
import { computed, onMounted, provide, reactive, ref, watch } from 'vue';
import { useReportGenerator } from '../../context.js';
import { AGGREGATION_LABELS, ROLES, TYPE_ICONS } from '../../utils/semantic.js';
import RgIcon from '../../components/ui/RgIcon.vue';

/**
 * Read-only view of the topics the host app declares in code: one tab per
 * group, the topics in it, and for each topic its report filters, fields
 * and relations. Relations link to the topic they lead to.
 */
const props = defineProps({
  theme: { type: String, default: 'light' },
  /** Topic key to open first. */
  initialTopic: { type: String, default: null },
});
const emit = defineEmits(['select']);

const { api } = useReportGenerator();
provide('rg-theme', props.theme);

const state = reactive({ loading: true, error: null, groups: [], group: null, topic: null });
const search = ref('');
const showKeys = ref(false);

const FILTERS = [
  { key: 'period', label: 'Period', icon: 'calendar' },
  { key: 'line', label: 'Line', icon: 'folder' },
  { key: 'division', label: 'Division', icon: 'users' },
  { key: 'employee', label: 'Employee', icon: 'users' },
];
const ROLE_LABELS = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));

const allTopics = computed(() => state.groups.flatMap((g) => g.topics));
const byKey = computed(() => Object.fromEntries(allTopics.value.map((t) => [t.key, t])));
const current = computed(() => byKey.value[state.topic] ?? null);

const visibleTopics = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (term) {
    return allTopics.value.filter((t) => t.label.toLowerCase().includes(term) || t.key.includes(term)
      || t.fields.some((f) => f.label.toLowerCase().includes(term)));
  }
  return state.groups.find((g) => g.name === state.group)?.topics ?? [];
});

const fields = computed(() => (current.value?.fields ?? []).filter((f) => showKeys.value || !f.hidden));
const hiddenCount = computed(() => (current.value?.fields ?? []).filter((f) => f.hidden).length);

async function load() {
  state.loading = true;
  state.error = null;
  try {
    const data = await api.topics();
    state.groups = data.groups ?? [];
    open(props.initialTopic && byKey.value[props.initialTopic] ? props.initialTopic : state.groups[0]?.topics[0]?.key);
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
  }
}

function open(key) {
  const topic = byKey.value[key];
  if (!topic) return;
  state.topic = key;
  state.group = topic.group ?? state.group;
}

function chooseGroup(name) {
  state.group = name;
  search.value = '';
  const first = state.groups.find((g) => g.name === name)?.topics[0];
  if (first && current.value?.group !== name) state.topic = first.key;
}

watch(() => state.topic, (key) => key && emit('select', key));

function conditionsOf(topic) {
  return Object.entries(topic.conditions ?? {}).map(([column, value]) => ({
    column,
    text: value === null ? 'is empty' : Array.isArray(value) ? `in ${value.join(', ')}` : `= ${value}`,
  }));
}

function filterColumn(topic, key) {
  return topic.columns?.[key] ?? null;
}

onMounted(load);
</script>

<template>
  <div class="rg-root rg-topics" :data-rg-theme="theme">
    <header class="rg-topbar">
      <div class="rg-topbar__title">
        <h1>Topics</h1>
        <div class="rg-topbar__meta">
          <span><RgIcon name="folder" small />{{ state.groups.length }} tabs</span>
          <span><RgIcon name="table" small />{{ allTopics.length }} topics</span>
          <span>Defined in code: <span class="rg-mono">app/Reporting/Topics</span></span>
        </div>
      </div>
      <label class="rg-search rg-topics__search">
        <span class="rg-sr-only">Search topics and fields</span>
        <RgIcon name="search" />
        <input v-model="search" class="rg-input" type="search" placeholder="Search topics and fields" autocomplete="off" />
      </label>
    </header>

    <nav v-if="state.groups.length" class="rg-topics__tabs" role="tablist" aria-label="Topic groups">
      <button
        v-for="group in state.groups"
        :key="group.name"
        type="button"
        role="tab"
        class="rg-topics__tab"
        :aria-selected="!search && state.group === group.name"
        @click="chooseGroup(group.name)"
      >
        {{ group.name }}<span class="rg-num">{{ group.topics.length }}</span>
      </button>
    </nav>

    <div v-if="state.loading" class="rg-body">
      <aside class="rg-sidebar"><div class="rg-skeleton-list"><div v-for="n in 6" :key="n" class="rg-skeleton" :style="{ width: `${50 + ((n * 37) % 45)}%` }" /></div></aside>
      <main class="rg-main" />
    </div>

    <div v-else-if="state.error" class="rg-main">
      <div class="rg-empty">
        <div class="rg-empty__icon"><RgIcon name="alert" /></div>
        <h2>Topics could not be loaded</h2>
        <p>{{ state.error }}</p>
        <button type="button" class="rg-btn" @click="load">Try again</button>
      </div>
    </div>

    <div v-else-if="!allTopics.length" class="rg-main">
      <div class="rg-empty">
        <div class="rg-empty__icon"><RgIcon name="database" /></div>
        <h2>No topics yet</h2>
        <p>Topics are PHP classes in your app. Draft one from a model, then edit its labels:</p>
        <code class="rg-mono">php artisan report-generator:make-topic ActualVisits --model="App\ActualVisit"</code>
      </div>
    </div>

    <div v-else class="rg-body">
      <aside class="rg-sidebar">
        <TransitionGroup tag="ul" name="rg-list-fade" class="rg-list" :aria-label="search ? 'Matching topics' : state.group">
          <li v-for="topic in visibleTopics" :key="topic.key">
            <button type="button" class="rg-list__item" :aria-current="topic.key === state.topic" @click="open(topic.key)">
              <span class="rg-list__label">{{ topic.label }}</span>
              <span class="rg-list__flags">
                <RgIcon v-if="topic.permission" name="lock" small :title="`Needs ${topic.permission}`" />
                <RgIcon v-if="topic.public" name="globe" small title="Anyone may read it in full" />
              </span>
              <span class="rg-list__sub">
                <span class="rg-mono">{{ topic.table }}</span>
                <span>· {{ topic.fields_count }} fields</span>
                <span v-if="search">· {{ topic.group }}</span>
              </span>
            </button>
          </li>
        </TransitionGroup>
        <p v-if="!visibleTopics.length" class="rg-list__empty">Nothing matches “{{ search }}”.</p>
      </aside>

      <main class="rg-main">
        <Transition name="rg-swap" mode="out-in">
          <section v-if="current" :key="current.key" class="rg-panel rg-topic">
            <div class="rg-panel__head">
              <div class="rg-panel__title">
                <h2 class="rg-topic__title">{{ current.label }}</h2>
                <div class="rg-facts">
                  <span><RgIcon name="key" small /><span class="rg-mono">{{ current.key }}</span></span>
                  <span><RgIcon name="table" small /><span class="rg-mono">{{ current.table }}</span></span>
                  <span class="rg-faint rg-mono">{{ current.class }}</span>
                </div>
                <p v-if="current.description" class="rg-muted rg-topic__desc">{{ current.description }}</p>
                <p v-if="conditionsOf(current).length" class="rg-topic__conditions">
                  <RgIcon name="filter" small />
                  Only rows where
                  <template v-for="(c, i) in conditionsOf(current)" :key="c.column">
                    <span v-if="i" class="rg-faint">and</span>
                    <code class="rg-mono">{{ c.column }} {{ c.text }}</code>
                  </template>
                </p>
              </div>
              <div class="rg-topic__badges">
                <span v-if="current.permission" class="rg-badge rg-badge--warning"><RgIcon name="lock" small />{{ current.permission }}</span>
                <span v-if="current.public" class="rg-badge rg-badge--info"><RgIcon name="globe" small />Public lookup</span>
                <span v-if="current.lookup" class="rg-badge" title="Readable through relations from topics a user may read; never a report's main topic"><RgIcon name="link" small />Joined only</span>
              </div>
            </div>

            <div class="rg-card">
              <div class="rg-card__head"><h2>Report filters</h2><span class="rg-muted">Every report on this topic can be limited by these</span></div>
              <ul class="rg-topic__filters">
                <li v-for="filter in FILTERS" :key="filter.key" :class="{ 'is-off': !current.filters[filter.key] }">
                  <RgIcon :name="current.filters[filter.key] ? 'check' : 'x'" small />
                  <b>{{ filter.label }}</b>
                  <span v-if="filterColumn(current, filter.key)" class="rg-mono rg-faint">{{ filterColumn(current, filter.key) }}</span>
                </li>
              </ul>
            </div>

            <div class="rg-card">
              <div class="rg-card__head">
                <h2>Fields <span class="rg-num rg-faint">{{ fields.length }}</span></h2>
                <label v-if="hiddenCount" class="rg-field-inline">
                  <input v-model="showKeys" type="checkbox" class="rg-check" />
                  Show {{ hiddenCount }} id {{ hiddenCount === 1 ? 'column' : 'columns' }}
                </label>
              </div>
              <div class="rg-table-wrap">
                <table class="rg-table rg-topic__fields">
                  <thead><tr><th>Field</th><th>Type</th><th>Use</th><th>Totals</th></tr></thead>
                  <TransitionGroup tag="tbody" name="rg-list-fade">
                    <tr v-for="field in fields" :key="field.key" class="rg-topic__field" :class="{ 'rg-row--hidden': field.hidden }">
                      <td>
                        <div class="rg-cell-field">
                          <b>{{ field.label }}</b>
                          <span class="rg-cell-field__sub"><span class="rg-mono">{{ field.key }}</span><span v-if="field.description">· {{ field.description }}</span></span>
                        </div>
                      </td>
                      <td><span class="rg-type"><RgIcon :name="TYPE_ICONS[field.type] ?? 'text'" small />{{ field.type }}</span></td>
                      <td>
                        <span class="rg-badge rg-role" :class="`rg-role--${field.role}`">{{ field.key === '__rows' ? 'Count' : ROLE_LABELS[field.role] ?? field.role }}</span>
                        <span v-if="field.options" class="rg-faint rg-topic__options" :title="Object.values(field.options).join(', ')">
                          {{ Object.keys(field.options).length }} values
                        </span>
                      </td>
                      <td class="rg-muted">{{ (field.aggregations ?? []).map((a) => AGGREGATION_LABELS[a] ?? a).join(', ') || '—' }}</td>
                    </tr>
                  </TransitionGroup>
                </table>
              </div>
            </div>

            <div class="rg-card">
              <div class="rg-card__head"><h2>Relations <span class="rg-num rg-faint">{{ current.relations.length }}</span></h2><span class="rg-muted">Fields of these topics can be added to its reports</span></div>
              <p v-if="!current.relations.length" class="rg-muted rg-topic__none">This topic does not link to other topics.</p>
              <ul v-else class="rg-topic__relations">
                <li v-for="relation in current.relations" :key="relation.name">
                  <button type="button" class="rg-topic__relation" @click="open(relation.topic)">
                    <span class="rg-topic__relation-kind" :data-kind="relation.type">{{ relation.type === 'hasMany' ? 'many' : 'one' }}</span>
                    <span class="rg-topic__relation-text">
                      <b>{{ relation.label }}</b>
                      <span class="rg-faint">{{ relation.topic_label }} · <span class="rg-mono">{{ relation.foreign_key }}</span></span>
                    </span>
                    <RgIcon name="arrow" small />
                  </button>
                </li>
              </ul>
            </div>
          </section>
        </Transition>
      </main>
    </div>
  </div>
</template>
