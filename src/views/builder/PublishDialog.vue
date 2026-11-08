<script setup>
import { computed, inject, onMounted, reactive, ref } from 'vue';
import { useReportGenerator } from '../../context.js';
import RgDialog from '../../components/ui/RgDialog.vue';
import RgIcon from '../../components/ui/RgIcon.vue';

/**
 * Publish a saved report: a permission named after it, the roles that get
 * it, and an optional menu entry. Everyone holding the permission can open
 * and run the report, each with their own data.
 */
const props = defineProps({
  uuid: { type: String, required: true },
  name: { type: String, default: '' },
});
const emit = defineEmits(['close', 'published', 'unpublished']);
const { api } = useReportGenerator();
const theme = inject('rg-theme', 'light');

const state = reactive({ loading: true, saving: false, error: null, errors: {}, published: false });
const form = reactive({ permission: '', roles: [], inMenu: true, menuGroup: '' });
const roles = ref([]);
const search = ref('');

const shownRoles = computed(() => {
  const term = search.value.trim().toLowerCase();
  return roles.value.filter((r) => !term || r.name.toLowerCase().includes(term));
});

onMounted(async () => {
  try {
    const [settings, list] = await Promise.all([api.reports.publishing(props.uuid), api.roles()]);
    roles.value = list;
    state.published = settings.published;
    Object.assign(form, {
      permission: settings.permission ?? settings.suggested_permission,
      roles: settings.roles ?? [],
      inMenu: settings.published ? settings.in_menu : true,
      menuGroup: settings.menu_group ?? '',
    });
  } catch (error) {
    state.error = error.message;
  } finally {
    state.loading = false;
  }
});

function toggleRole(name) {
  form.roles = form.roles.includes(name) ? form.roles.filter((r) => r !== name) : [...form.roles, name];
}

async function submit() {
  state.saving = true;
  state.errors = {};
  state.error = null;
  try {
    const settings = await api.reports.publish(props.uuid, {
      permission: form.permission.trim(), roles: form.roles, inMenu: form.inMenu, menuGroup: form.menuGroup.trim() || null,
    });
    emit('published', settings);
    emit('close');
  } catch (error) {
    state.errors = error.errors ?? {};
    state.error = Object.keys(state.errors).length ? null : error.message;
  } finally {
    state.saving = false;
  }
}

async function unpublish() {
  state.saving = true;
  try {
    const settings = await api.reports.unpublish(props.uuid);
    emit('unpublished', settings);
    emit('close');
  } catch (error) {
    state.error = error.message;
  } finally {
    state.saving = false;
  }
}

const firstError = (key) => state.errors[key]?.[0] ?? null;
const roleError = computed(() => Object.entries(state.errors).find(([k]) => k.startsWith('roles'))?.[1]?.[0] ?? null);
</script>

<template>
  <RgDialog :title="state.published ? `Publishing: ${name}` : `Publish “${name}”`" :data-rg-theme="theme" @close="emit('close')">
    <div v-if="state.loading" class="rg-skeleton-list"><div v-for="n in 4" :key="n" class="rg-skeleton" /></div>
    <form v-else id="rg-publish-form" class="rg-publish" @submit.prevent="submit">
      <p class="rg-muted rg-publish__intro">
        Everyone with the permission below can open and run this report, each seeing only their own data.
        Building reports is not needed.
      </p>

      <label class="rg-publish__field" for="rg-publish-permission">
        <span>Permission</span>
        <input id="rg-publish-permission" v-model="form.permission" class="rg-input rg-mono" maxlength="191" required pattern="[a-z0-9][a-z0-9_.\-]*" />
        <small v-if="firstError('permission')" class="rg-publish__error">{{ firstError('permission') }}</small>
        <small v-else class="rg-faint">Created if it does not exist. Lowercase letters, digits, dots, dashes and underscores.</small>
      </label>

      <fieldset class="rg-publish__field">
        <legend>Roles that get it <span class="rg-num rg-faint">{{ form.roles.length }} selected</span></legend>
        <label class="rg-search">
          <span class="rg-sr-only">Search roles</span>
          <RgIcon name="search" />
          <input v-model="search" class="rg-input" type="search" placeholder="Search roles" autocomplete="off" />
        </label>
        <div class="rg-publish__roles" role="group" aria-label="Roles">
          <button
            v-for="role in shownRoles"
            :key="role.id"
            type="button"
            class="rg-publish__role"
            :aria-pressed="form.roles.includes(role.name)"
            @click="toggleRole(role.name)"
          >
            <RgIcon :name="form.roles.includes(role.name) ? 'check' : 'plus'" small />{{ role.name }}
          </button>
          <span v-if="!shownRoles.length" class="rg-faint">No role matches.</span>
        </div>
        <small v-if="roleError" class="rg-publish__error">{{ roleError }}</small>
      </fieldset>

      <div class="rg-publish__menu">
        <label class="rg-field-inline" for="rg-publish-menu">
          <input id="rg-publish-menu" v-model="form.inMenu" type="checkbox" class="rg-check" /> Show in the sidebar
        </label>
        <label v-if="form.inMenu" class="rg-publish__field" for="rg-publish-group">
          <span>Sidebar group (optional)</span>
          <input id="rg-publish-group" v-model="form.menuGroup" class="rg-input" maxlength="120" placeholder="Sales" />
        </label>
      </div>

      <p v-if="state.error" class="rg-publish__error" role="alert">{{ state.error }}</p>
    </form>

    <template #footer>
      <button v-if="state.published" type="button" class="rg-btn rg-btn--danger" :disabled="state.saving" @click="unpublish">Unpublish</button>
      <span style="flex: 1" />
      <button type="button" class="rg-btn" @click="emit('close')">Cancel</button>
      <button type="submit" form="rg-publish-form" class="rg-btn rg-btn--primary" :disabled="state.loading || state.saving || !form.permission.trim()">
        {{ state.saving ? 'Saving…' : state.published ? 'Update' : 'Publish' }}
      </button>
    </template>
  </RgDialog>
</template>
