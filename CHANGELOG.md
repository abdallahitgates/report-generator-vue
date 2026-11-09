# Changelog

## 0.10.0 — Flexible and friendlier
Needs laravel-report-generator 0.10.
- **Export** button (Excel or CSV) in the builder, combined builder and viewer top bars.
- **Column menus**: sort A→Z / Z→A, "then by" (several levels), filter the column (rows or totals), hide it. Shift+click a header adds a sort level; a Sort panel orders the levels.
- **Viewer filters**: people opening a report filter its columns themselves (shown as chips); the saved filters still apply.
- **Formulas**: write with column names in `[brackets]`, start from a quick formula (A per B, % of, difference, change %, days between dates, High/Low), choose how the result shows, checked while typing. New PERCENT and DAYS_BETWEEN.
- **Dashboards**: "Add widget" works for every report: numbers always include "Number of rows" and numeric columns of list reports, the first column and number are picked for you, and the dialog says what is missing.
- New look: accent colour for actions, depth, smoother motion (entrances, hover, dialogs, toasts, a progress bar while a report runs); all motion stops with reduced-motion. Grand totals stay pinned to the bottom again.

## 0.9.0
- Topics page: through relations read "via <link table>"; link tables carry a "Link table" badge (needs laravel-report-generator 0.9).

## 0.8.1
- `dist/` is committed and nothing is built on install: `npm i` from Git is faster and no longer needs Node 18+ or the dev dependencies.

## 0.8.0
- Dashboards load their widgets three at a time.
- Primary buttons show their text again (a reset outranked them since 0.1).

## 0.7.0 — Dashboards
- `DashboardView`, `DashboardEditor`, `PinToDashboard`; KPI, bar, column,
  line, area, pie, donut, share bar and table widgets; locked widgets for
  reports the viewer cannot open; library Dashboards tab.

## 0.6.0 — Combined reports
- `CombinedBuilder`, opened from the builder's first screen.

## 0.5.0 — Spreadsheet grid
- Cell selection with totals, copy to Excel, column chooser, frozen column,
  grand totals, pages, CSV / Excel export; viewer structure pickers.

## 0.4.0 — Publishing
- `PublishDialog`, `ReportViewer`, `api.menu()`.

## 0.3.0 / 0.2.0
- `TopicsBrowser` replaces Model Studio; topics grouped in tabs.

## 0.1.0
- Report builder, library, Model Studio.
