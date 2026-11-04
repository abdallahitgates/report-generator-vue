# @abdalla/report-generator-vue

Vue 3 UI for [`abdalla/laravel-report-generator`](../report-generator):
model studio, report builder, viewer and runs. The host app supplies Vue and
its own axios instance, so authentication and interceptors work as they
already do.

> Status: **M1**. Model Studio (review the scanned schema and publish the
> semantic model). The report builder and viewer follow.

```js
import axios from 'axios';
import { createReportGenerator } from '@abdalla/report-generator-vue';
import '@abdalla/report-generator-vue/style.css'; // not needed when compiling from source

app.use(createReportGenerator({ http: axios, basePath: '/api/report-generator' }));
```

Mount a screen on any route (give it a height; it scrolls inside itself):

```vue
<template>
  <div style="height: calc(100vh - 150px)">
    <ModelStudio theme="light" />
  </div>
</template>

<script setup>
import { ModelStudio } from '@abdalla/report-generator-vue';
</script>
```

Every class is prefixed `rg-` and every colour is a CSS variable on
`.rg-root`, so the UI does not leak styles into the host and can be re-themed
by overriding `--rg-*` variables. Layout uses logical properties, so it works
in RTL pages. `theme="dark"` switches to the dark palette.

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
