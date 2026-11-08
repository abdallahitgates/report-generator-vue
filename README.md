# @abdalla/report-generator-vue

Vue 3 UI for [`abdalla/laravel-report-generator`](https://github.com/abdallahitgates/laravel-report-generator):
topics browser, report builder, viewer and runs. The host app supplies Vue and
its own axios instance, so authentication and interceptors work as they
already do.

> Version **0.5.0** (v2 phase P3). The topics browser (the topics your app
> declares in code, by tab), the report library and the report builder. Model
> Studio is gone with the database scan.

## Install

From a Git tag (npm builds the package while installing it):

```bash
npm install "git+https://github.com/abdallahitgates/report-generator-vue.git#v0.5.0"
```


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
    <TopicsBrowser theme="light" @select="key => router.replace({ query: { topic: key } })" />
  </div>
</template>

<script setup>
import { TopicsBrowser } from '@abdalla/report-generator-vue';
</script>
```

`TopicsBrowser` shows one tab per topic group; for each topic, the report
filters it supports (Period, Line, Division, Employee and their columns), its
fields and its relations (click one to open that topic). `initial-topic`
opens a topic first. It needs the `report-generator.model.manage` ability.

The report screens are router-agnostic: they emit events and the host
decides the URLs.

```vue
<!-- /reports -->
<ReportLibrary @open="uuid => router.push(`/reports/${uuid}`)" @create="router.push('/reports/new')" />

<!-- /reports/new and /reports/:uuid -->
<ReportBuilder :report-id="route.params.uuid ?? null" @saved="report => router.replace(`/reports/${report.uuid}`)" />
```

Published reports open in `ReportViewer` for the people they are published
to: the report's name, a period picker and its parameters, and the same
results grid (sorting, groups, paging), without the builder. In the builder,
users with the publish ability get a **Publish** button: a permission named
after the report, the roles that get it, and a sidebar entry.

```vue
<!-- /reports/view/:uuid -->
<ReportViewer :report-id="route.params.uuid" @edit="uuid => router.push(`/reports/${uuid}`)" />
```

`api.menu()` returns the published reports the current user may open
(`[{ uuid, name, description, group }]`) for the host's sidebar.

The builder: pick the topic a report is about (topics are grouped in tabs), then drag fields onto Rows
(group by), Values (totals, formulas) and Filters, or use the buttons next
to each field. It asks which join path to use when a topic is reachable
in more than one way, runs as you edit (cancelling the previous query),
loads 200 rows at a time as you scroll, opens groups one level at a time,
and saves to the library. Shortcuts: Ctrl+Enter run, Ctrl+S save, Ctrl+Z /
Ctrl+Shift+Z undo / redo.

The results grid works like a spreadsheet, on the server, so it stays fast
on millions of rows: select cells (click and drag, Shift+click,
Shift+arrows) to see Sum, Average, Min, Max and Count, copy them with
Ctrl+C straight into Excel; hide, drag to reorder and resize columns,
freeze the first column, compact or comfortable rows; grand totals and the
row count of the whole report; infinite scroll or numbered pages (50 to
1,000 rows); export every row as CSV or Excel (streamed by the server).
Layout choices are remembered per report in the browser. The viewer adds
line, division and employee pickers when the server is configured for them.

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
git tag v0.3.0
git push origin main --tags
```

Projects move to it by changing `#v0.2.0` to `#v0.3.0` in their `package.json` and running `npm install`.
