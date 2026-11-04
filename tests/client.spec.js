import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import {
  createApiClient,
  createReportGenerator,
  ReportGeneratorApiError,
  useReportGenerator,
} from '../src/index.js';

const fakeHttp = (impl = {}) => ({
  get: vi.fn(async () => ({ data: { version: '0.1.0-dev' } })),
  post: vi.fn(async () => ({ data: {} })),
  patch: vi.fn(),
  delete: vi.fn(),
  ...impl,
});

describe('createApiClient', () => {
  it('calls the meta endpoint under the base path and unwraps data', async () => {
    const http = fakeHttp();
    const api = createApiClient({ http, basePath: '/api/report-generator/' });

    await expect(api.meta()).resolves.toEqual({ version: '0.1.0-dev' });
    expect(http.get).toHaveBeenCalledWith('/api/report-generator/meta', undefined);
  });

  it('turns axios errors into ReportGeneratorApiError with the status', async () => {
    const http = fakeHttp({
      get: vi.fn(async () => {
        throw { response: { status: 403, data: { message: 'Forbidden' } } };
      }),
    });

    const error = await createApiClient({ http }).meta().catch((e) => e);
    expect(error).toBeInstanceOf(ReportGeneratorApiError);
    expect(error.status).toBe(403);
    expect(error.message).toBe('Forbidden');
  });

  it('requires an http instance', () => {
    expect(() => createApiClient({})).toThrow(TypeError);
  });
});

describe('plugin', () => {
  it('provides the api to components', () => {
    const plugin = createReportGenerator({ http: fakeHttp() });
    let injected;
    const Probe = defineComponent({
      setup() {
        injected = useReportGenerator();
        return () => h('div');
      },
    });

    mount(Probe, { global: { plugins: [plugin] } });
    expect(injected.api).toBe(plugin.api);
  });

  it('explains how to fix a missing plugin', () => {
    const Probe = defineComponent({
      setup() {
        useReportGenerator();
        return () => h('div');
      },
    });

    expect(() => mount(Probe)).toThrow(/app.use\(createReportGenerator/);
  });
});

describe('query API', () => {
  it('posts a page request with drill-down state and a query id', async () => {
    const http = fakeHttp({ post: vi.fn(async () => ({ data: { rows: [] } })) });
    const api = createApiClient({ http });
    const definition = { root: 'visits', fields: [] };

    await api.query.rows(definition, { offset: 200, size: 100, groups: { columns: ['line'], keys: [] }, queryId: 'q1' });

    expect(http.post).toHaveBeenCalledWith('/api/report-generator/query/rows', {
      definition,
      parameters: {},
      page: { offset: 200, size: 100 },
      groups: { columns: ['line'], keys: [] },
      query_id: 'q1',
    }, undefined);
  });

  it('exposes engine error codes, paths and details', async () => {
    const http = fakeHttp({
      post: vi.fn(async () => {
        throw { response: { status: 422, data: { message: 'Lines can be reached in more than one way.', code: 'AMBIGUOUS_PATH', path: 'fields.0.ref', details: { options: [1, 2] } } } };
      }),
    });

    const error = await createApiClient({ http }).query.validate({}).catch((e) => e);
    expect(error).toMatchObject({ status: 422, code: 'AMBIGUOUS_PATH', path: 'fields.0.ref', details: { options: [1, 2] } });
  });
});
