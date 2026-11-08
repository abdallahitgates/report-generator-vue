<script setup>
import { computed, inject, ref } from 'vue';
import { REPORT_BUILDER_KEY } from '../../composables/useReportBuilder.js';
import RgIcon from '../../components/ui/RgIcon.vue';

const builder = inject(REPORT_BUILDER_KEY);
const search = ref('');
const tab = ref(null);

const FILTER_LABELS = { period: 'Period', line: 'Line', division: 'Division', employee: 'Employee' };

const groups = computed(() => {
  const out = new Map();
  for (const topic of builder.state.roots ?? []) {
    const name = topic.group ?? topic.label;
    if (!out.has(name)) out.set(name, []);
    out.get(name).push(topic);
  }
  return [...out].map(([name, topics]) => ({ name, topics }));
});

const activeTab = computed(() => tab.value ?? groups.value[0]?.name ?? null);

const topics = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (term || groups.value.length < 2) {
    return (builder.state.roots ?? []).filter((t) => !term || t.label.toLowerCase().includes(term) || t.key.includes(term));
  }
  return groups.value.find((g) => g.name === activeTab.value)?.topics ?? [];
});

function filtersOf(topic) {
  return Object.entries(topic.filters ?? {}).filter(([, on]) => on).map(([key]) => FILTER_LABELS[key] ?? key);
}
</script>

<template>
  <div class="rg-roots">
    <div>
      <h2>What is this report about?</h2>
      <p class="rg-muted" style="margin: 4px 0 0">
        Pick the main topic: each row of a detailed report is one of these. Fields from related topics can be added next.
      </p>
    </div>
    <div class="rg-roots__bar">
      <nav v-if="groups.length > 1 && !search" class="rg-topics__tabs rg-roots__tabs" role="tablist" aria-label="Topic groups">
        <button
          v-for="group in groups"
          :key="group.name"
          type="button"
          role="tab"
          class="rg-topics__tab"
          :aria-selected="activeTab === group.name"
          @click="tab = group.name"
        >
          {{ group.name }}<span class="rg-num">{{ group.topics.length }}</span>
        </button>
      </nav>
      <label class="rg-search rg-roots__search">
        <span class="rg-sr-only">Search topics</span>
        <RgIcon name="search" />
        <input id="rg-root-search" v-model="search" class="rg-input" type="search" placeholder="Search topics" autocomplete="off" />
      </label>
    </div>
    <TransitionGroup tag="div" name="rg-list-fade" class="rg-roots__grid">
      <button v-for="topic in topics" :key="topic.key" type="button" class="rg-root-card" @click="builder.chooseRoot(topic.key)">
        <b>{{ topic.label }}</b>
        <span v-if="topic.description">{{ topic.description }}</span>
        <span class="rg-num rg-faint">{{ topic.fields_count }} fields<template v-if="filtersOf(topic).length"> · by {{ filtersOf(topic).join(', ') }}</template></span>
      </button>
    </TransitionGroup>
    <p v-if="builder.state.roots && !topics.length" class="rg-muted">
      {{ search ? 'No topic matches your search.' : 'There are no topics you can report on yet. Ask an admin for access.' }}
    </p>
  </div>
</template>
