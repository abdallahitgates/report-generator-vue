/**
 * Thin client for the Laravel package's HTTP API.
 *
 * The host passes its own axios instance, so auth headers, interceptors and
 * error handling stay exactly as the host already configures them.
 */
export class ReportGeneratorApiError extends Error {
  constructor(message, { status = null, errors = {}, cause = null } = {}) {
    super(message);
    this.name = 'ReportGeneratorApiError';
    this.status = status;
    /** Laravel validation errors: { field: [messages] } */
    this.errors = errors;
    this.cause = cause;
  }
}

function errorMessage(error) {
  const data = error?.response?.data;
  const firstValidation = data?.errors && Object.values(data.errors).flat()[0];
  return firstValidation || data?.message || error?.message || 'Request failed';
}

export function createApiClient({ http, basePath = '/api/report-generator' } = {}) {
  if (!http || typeof http.get !== 'function' || typeof http.post !== 'function') {
    throw new TypeError('report-generator: pass an axios-compatible `http` instance (get/post/patch/delete).');
  }

  const base = basePath.replace(/\/+$/, '');
  const url = (path) => `${base}/${path.replace(/^\/+/, '')}`;

  async function request(method, path, payload, config) {
    try {
      const response = method === 'get' || method === 'delete'
        ? await http[method](url(path), config)
        : await http[method](url(path), payload, config);
      return response.data;
    } catch (error) {
      throw new ReportGeneratorApiError(errorMessage(error), {
        status: error?.response?.status ?? null,
        errors: error?.response?.data?.errors ?? {},
        cause: error,
      });
    }
  }

  const model = {
    status: () => request('get', 'model/status'),
    scan: () => request('post', 'model/scan'),
    datasets: () => request('get', 'model/datasets').then((r) => r.data),
    dataset: (id) => request('get', `model/datasets/${id}`).then((r) => r.data),
    updateDataset: (id, patch) => request('patch', `model/datasets/${id}`, patch).then((r) => r.data),
    updateField: (id, patch) => request('patch', `model/fields/${id}`, patch).then((r) => r.data),
    relationships: (status) => request('get', 'model/relationships', undefined, status ? { params: { status } } : undefined).then((r) => r.data),
    createRelationship: (data) => request('post', 'model/relationships', data).then((r) => r.data),
    updateRelationship: (id, patch) => request('patch', `model/relationships/${id}`, patch).then((r) => r.data),
    bulkRelationships: (ids, status) => request('post', 'model/relationships/bulk', { ids, status }),
    deleteRelationship: (id) => request('delete', `model/relationships/${id}`),
    versions: () => request('get', 'model/versions').then((r) => r.data),
    publish: (notes) => request('post', 'model/publish', { notes }),
  };

  return {
    basePath: base,
    /** Version, the current user's abilities, registered sources and limits. */
    meta: () => request('get', 'meta'),
    model,
    request,
  };
}
