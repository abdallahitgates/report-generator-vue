/**
 * Thin client for the Laravel package's HTTP API.
 *
 * The host passes its own axios instance, so auth headers, interceptors and
 * error handling stay exactly as the host already configures them.
 */
export class ReportGeneratorApiError extends Error {
  constructor(message, { status = null, errors = {}, code = null, path = null, details = null, cause = null } = {}) {
    super(message);
    this.name = 'ReportGeneratorApiError';
    this.status = status;
    /** Laravel validation errors: { field: [messages] } */
    this.errors = errors;
    /** Report engine errors: stable code (AMBIGUOUS_PATH, FAN_TRAP, ...), where in the definition, and extra data. */
    this.code = code;
    this.path = path;
    this.details = details;
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
        code: error?.response?.data?.code ?? null,
        path: error?.response?.data?.path ?? null,
        details: error?.response?.data?.details ?? null,
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

  const query = {
    /** Without a root: datasets to start from. With a root: everything reachable from it. */
    catalog: (root) => request('get', 'catalog', undefined, root ? { params: { root } } : undefined),
    validate: (definition, parameters = {}) => request('post', 'query/validate', { definition, parameters }),
    /**
     * One page of results. groups = { columns: [aliases], keys: [opened group values] }
     * for AG Grid's server-side row model; queryId lets cancel() stop it.
     */
    rows: (definition, { parameters = {}, offset = 0, size, groups, queryId, signal } = {}) => request(
      'post',
      'query/rows',
      { definition, parameters, page: { offset, ...(size ? { size } : {}) }, ...(groups ? { groups } : {}), ...(queryId ? { query_id: queryId } : {}) },
      signal ? { signal } : undefined,
    ),
    values: (field, search = '', limit = 50) => request('post', 'query/values', { field, search, limit }).then((r) => r.data),
    cancel: (queryId) => request('post', `query/${encodeURIComponent(queryId)}/cancel`),
  };

  const reports = {
    list: (params = {}) => request('get', 'reports', undefined, { params }),
    get: (uuid) => request('get', `reports/${uuid}`).then((r) => r.data),
    create: (report) => request('post', 'reports', report).then((r) => r.data),
    update: (uuid, patch) => request('patch', `reports/${uuid}`, patch).then((r) => r.data),
    duplicate: (uuid) => request('post', `reports/${uuid}/duplicate`).then((r) => r.data),
    remove: (uuid) => request('delete', `reports/${uuid}`),
    share: (uuid, shares, visibility) => request('put', `reports/${uuid}/shares`, { shares, ...(visibility ? { visibility } : {}) }).then((r) => r.data),
  };

  return {
    basePath: base,
    query,
    reports,
    /** Version, the current user's abilities, registered sources and limits. */
    meta: () => request('get', 'meta'),
    model,
    request,
  };
}
