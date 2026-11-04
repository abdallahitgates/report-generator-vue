/**
 * Thin client for the Laravel package's HTTP API.
 *
 * The host passes its own axios instance, so auth headers, interceptors and
 * error handling stay exactly as the host already configures them.
 */
export class ReportGeneratorApiError extends Error {
  constructor(message, { status = null, cause = null } = {}) {
    super(message);
    this.name = 'ReportGeneratorApiError';
    this.status = status;
    this.cause = cause;
  }
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
      const status = error?.response?.status ?? null;
      const message = error?.response?.data?.message || error?.message || 'Request failed';
      throw new ReportGeneratorApiError(message, { status, cause: error });
    }
  }

  return {
    basePath: base,
    /** Version, the current user's abilities, registered sources and limits. */
    meta: () => request('get', 'meta'),
    request,
  };
}
