import { inject } from 'vue';
import { createApiClient } from './api/client.js';

export { createApiClient, ReportGeneratorApiError } from './api/client.js';

export const REPORT_GENERATOR_KEY = Symbol('report-generator');

/**
 * Vue plugin. Usage in the host app:
 *
 *   import { createReportGenerator } from '@abdalla/report-generator-vue';
 *   app.use(createReportGenerator({ http: axios }));
 */
export function createReportGenerator(options = {}) {
  const api = createApiClient(options);

  return {
    api,
    install(app) {
      app.provide(REPORT_GENERATOR_KEY, { api });
    },
  };
}

export function useReportGenerator() {
  const context = inject(REPORT_GENERATOR_KEY, null);
  if (!context) {
    throw new Error('report-generator: call app.use(createReportGenerator({ http })) before using its components.');
  }
  return context;
}
