# @abdalla/report-generator-vue

Vue 3 UI for [`abdalla/laravel-report-generator`](../report-generator):
model studio, report builder, viewer and runs. The host app supplies Vue and
its own axios instance, so authentication and interceptors work as they
already do.

> Status: **M0**. Plugin and API client only; screens arrive from M1.

```js
import axios from 'axios';
import { createReportGenerator } from '@abdalla/report-generator-vue';

app.use(createReportGenerator({ http: axios, basePath: '/api/report-generator' }));
```

Inside components:

```js
import { useReportGenerator } from '@abdalla/report-generator-vue';

const { api } = useReportGenerator();
const meta = await api.meta();
```

## Development (Node 18+)

```bash
npm install
npm test
npm run build
```
