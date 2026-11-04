# @abdalla/report-generator-vue

Vue 3 UI for [`abdalla/laravel-report-generator`](https://github.com/abdallahitgates/laravel-report-generator):
model studio, report builder, viewer and runs. The host app supplies Vue and
its own axios instance, so authentication and interceptors work as they
already do.

> Version **0.1.0** (milestone M3). Model Studio (review the scanned schema and publish the
> semantic model), the report library and the report builder.

## Install

From a Git tag (npm builds the package while installing it):

```bash
npm install "git+ssh://git@github.com/abdallahitgates/report-generator-vue.git#v0.1.0"
```

Use the SSH form while the repository is private: it uses your SSH key.

## Use

```js
import axios from 'axios';
import { createReportGenerator } from '@abdalla/report-generator-vue';
import '@abdalla/report-generator-vue/style.css';

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

The report screens are router-agnostic: they emit events and the host
decides the URLs.

```vue
<!-- /reports -->
<ReportLibrary @open="uuid => router.push(`/reports/${uuid}`)" @create="router.push('/reports/new')" />

<!-- /reports/new and /reports/:uuid -->
<ReportBuilder :report-id="route.params.uuid ?? null" @saved="report => router.replace(`/reports/${report.uuid}`)" />
```

The builder: pick the dataset a report is about, then drag fields onto Rows
(group by), Values (totals, formulas) and Filters, or use the buttons next
to each field. It asks which join path to use when a dataset is reachable
in more than one way, runs as you edit (cancelling the previous query),
loads 200 rows at a time as you scroll, opens groups one level at a time,
and saves to the library. Shortcuts: Ctrl+Enter run, Ctrl+S save, Ctrl+Z /
Ctrl+Shift+Z undo / redo.

The results grid is built in, with no AG Grid licence needed; the API uses
the same request shape as AG Grid's server-side row model, so a host can
plug AG Grid in instead.

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

## Releasing

Bump `version` in `package.json`, commit, then:

```bash
git tag v0.2.0
git push origin main --tags
```

Projects move to it by changing `#v0.1.0` to `#v0.2.0` in their `package.json` and running `npm install`.
