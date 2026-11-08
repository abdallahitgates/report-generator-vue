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

  /**
   * POSTs and saves the streamed file the server sends back (exports).
   * Returns the file name. Errors arrive as a Blob and are read as JSON.
   */
  async function download(path, payload, fallbackName = 'report') {
    let response;
    try {
      response = await http.post(url(path), payload, { responseType: 'blob' });
    } catch (error) {
      let data = error?.response?.data;
      if (data && typeof data.text === 'function') {
        try { data = JSON.parse(await data.text()); } catch { data = null; }
      }
      throw new ReportGeneratorApiError(data?.message || error?.message || 'Export failed', {
        status: error?.response?.status ?? null, code: data?.code ?? null, errors: data?.errors ?? {}, cause: error,
      });
    }
    const disposition = response.headers?.['content-disposition'] ?? '';
    const match = /filename\*=UTF-8''([^;]+)/i.exec(disposition) ?? /filename="?([^";]+)"?/i.exec(disposition);
    const name = match ? decodeURIComponent(match[1]) : fallbackName;
    if (typeof window !== 'undefined' && window.URL?.createObjectURL) {
      const href = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(href), 1000);
    }
    return name;
  }

  const query = {
    /** Without a root: topics to start from, by tab. With a root: its relation tree and a flat list for the builder. */
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
    /** Row count and grand totals of the whole report: { rows, totals, duration_ms, cached }. */
    summary: (definition, parameters = {}) => request('post', 'query/summary', { definition, parameters }),
    /** Streams the whole report as a file (format: csv | xlsx) and saves it. */
    export: (definition, format, { parameters = {}, name } = {}) => download('query/export', { definition, parameters, format, name }, name),
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

    /** Publishing: settings (with a suggested permission), publish, unpublish. Needs the publish ability. */
    publishing: (uuid) => request('get', `reports/${uuid}/publish`).then((r) => r.data),
    publish: (uuid, { permission, roles = [], inMenu = false, menuGroup = null }) => request('put', `reports/${uuid}/publish`, {
      permission, roles, in_menu: inMenu, menu_group: menuGroup,
    }).then((r) => r.data),
    unpublish: (uuid) => request('delete', `reports/${uuid}/publish`).then((r) => r.data),

    /** Opening a saved report as it was saved (anyone who may open it). */
    view: (uuid) => request('get', `reports/${uuid}/view`).then((r) => r.data),
    run: (uuid, { parameters = {}, context, sort, offset = 0, size, groups, queryId, signal } = {}) => request(
      'post',
      `reports/${uuid}/rows`,
      {
        parameters,
        ...(context ? { context } : {}),
        ...(sort ? { sort } : {}),
        page: { offset, ...(size ? { size } : {}) },
        ...(groups ? { groups } : {}),
        ...(queryId ? { query_id: queryId } : {}),
      },
      signal ? { signal } : undefined,
    ),
    values: (uuid, field, search = '', limit = 50) => request('post', `reports/${uuid}/values`, { field, search, limit }).then((r) => r.data),
    summary: (uuid, { parameters = {}, context, sort } = {}) => request('post', `reports/${uuid}/summary`, {
      parameters, ...(context ? { context } : {}), ...(sort ? { sort } : {}),
    }),
    export: (uuid, format, { parameters = {}, context, sort } = {}) => download(`reports/${uuid}/export`, {
      format, parameters, ...(context ? { context } : {}), ...(sort ? { sort } : {}),
    }),
  };

  return {
    basePath: base,
    query,
    reports,
    /** Version, the current user's abilities, registered sources and limits. */
    meta: () => request('get', 'meta'),
    /** Published reports in the menu the current user may open: [{ uuid, name, description, group }]. */
    menu: () => request('get', 'menu').then((r) => r.data),
    /** Choices for a report filter (kind: lines | divisions | employees): [{ id, label }]. */
    contextOptions: (kind, { search = '', lines = [], period } = {}) => request('get', `context/${kind}`, undefined, {
      params: { ...(search ? { search } : {}), ...(lines.length ? { lines } : {}), ...(period ? { period } : {}) },
    }).then((r) => r.data),
    /** Roles a report can be published to: [{ id, name }]. */
    roles: () => request('get', 'permissions/roles').then((r) => r.data),
    /** Every topic by tab, with filter columns, fields and relations (admins). */
    topics: () => request('get', 'topics'),
    request,
  };
}
