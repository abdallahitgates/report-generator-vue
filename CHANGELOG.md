# Changelog

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
