import { reactive } from 'vue';

let nextId = 1;

/** A small toast queue scoped to one studio instance. */
export function createToasts() {
  const items = reactive([]);

  function push(kind, message, timeout = kind === 'error' ? 7000 : 3500) {
    const id = nextId++;
    items.push({ id, kind, message });
    setTimeout(() => dismiss(id), timeout);
  }

  function dismiss(id) {
    const index = items.findIndex((t) => t.id === id);
    if (index !== -1) items.splice(index, 1);
  }

  return {
    items,
    dismiss,
    success: (message) => push('success', message),
    error: (error) => push('error', typeof error === 'string' ? error : error?.message || 'Something went wrong.'),
  };
}
