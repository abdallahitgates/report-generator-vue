import { inject as _e, openBlock as s, createElementBlock as n, normalizeClass as oe, createElementVNode as e, provide as Oe, reactive as $e, ref as B, computed as j, watch as ye, onMounted as Se, createVNode as O, createTextVNode as F, toDisplayString as _, withDirectives as le, vModelText as ce, Fragment as q, renderList as K, createCommentVNode as M, normalizeStyle as Te, TransitionGroup as qe, withCtx as ie, createBlock as ne, Transition as tt, vModelCheckbox as ct, unref as N, Teleport as ul, mergeProps as dl, onBeforeUnmount as Ve, withModifiers as ge, renderSlot as gt, withKeys as Ke, resolveComponent as Ol, vModelSelect as Ee, vModelDynamic as _t, nextTick as Qt, vModelRadio as Zt, vShow as Xt } from "vue";
class el extends Error {
  constructor(u, { status: l = null, errors: i = {}, code: d = null, path: m = null, details: h = null, cause: a = null } = {}) {
    super(u), this.name = "ReportGeneratorApiError", this.status = l, this.errors = i, this.code = d, this.path = m, this.details = h, this.cause = a;
  }
}
function Rl(t) {
  var i;
  const u = (i = t == null ? void 0 : t.response) == null ? void 0 : i.data;
  return (u == null ? void 0 : u.errors) && Object.values(u.errors).flat()[0] || (u == null ? void 0 : u.message) || (t == null ? void 0 : t.message) || "Request failed";
}
function Dl({ http: t, basePath: u = "/api/report-generator" } = {}) {
  if (!t || typeof t.get != "function" || typeof t.post != "function")
    throw new TypeError("report-generator: pass an axios-compatible `http` instance (get/post/patch/delete).");
  const l = u.replace(/\/+$/, ""), i = (c) => `${l}/${c.replace(/^\/+/, "")}`;
  async function d(c, r, o, v) {
    var T, E, y, b, p, $, L, C, x;
    try {
      return (c === "get" || c === "delete" ? await t[c](i(r), v) : await t[c](i(r), o, v)).data;
    } catch (w) {
      throw new el(Rl(w), {
        status: ((T = w == null ? void 0 : w.response) == null ? void 0 : T.status) ?? null,
        errors: ((y = (E = w == null ? void 0 : w.response) == null ? void 0 : E.data) == null ? void 0 : y.errors) ?? {},
        code: ((p = (b = w == null ? void 0 : w.response) == null ? void 0 : b.data) == null ? void 0 : p.code) ?? null,
        path: ((L = ($ = w == null ? void 0 : w.response) == null ? void 0 : $.data) == null ? void 0 : L.path) ?? null,
        details: ((x = (C = w == null ? void 0 : w.response) == null ? void 0 : C.data) == null ? void 0 : x.details) ?? null,
        cause: w
      });
    }
  }
  async function m(c, r, o = "report") {
    var b, p, $, L;
    let v;
    try {
      v = await t.post(i(c), r, { responseType: "blob" });
    } catch (C) {
      let x = (b = C == null ? void 0 : C.response) == null ? void 0 : b.data;
      if (x && typeof x.text == "function")
        try {
          x = JSON.parse(await x.text());
        } catch {
          x = null;
        }
      throw new el((x == null ? void 0 : x.message) || (C == null ? void 0 : C.message) || "Export failed", {
        status: ((p = C == null ? void 0 : C.response) == null ? void 0 : p.status) ?? null,
        code: (x == null ? void 0 : x.code) ?? null,
        errors: (x == null ? void 0 : x.errors) ?? {},
        cause: C
      });
    }
    const T = (($ = v.headers) == null ? void 0 : $["content-disposition"]) ?? "", E = /filename\*=UTF-8''([^;]+)/i.exec(T) ?? /filename="?([^";]+)"?/i.exec(T), y = E ? decodeURIComponent(E[1]) : o;
    if (typeof window < "u" && ((L = window.URL) != null && L.createObjectURL)) {
      const C = window.URL.createObjectURL(v.data), x = document.createElement("a");
      x.href = C, x.download = y, document.body.appendChild(x), x.click(), x.remove(), setTimeout(() => window.URL.revokeObjectURL(C), 1e3);
    }
    return y;
  }
  return {
    basePath: l,
    combine: {
      reports: () => d("get", "combine/reports").then((c) => c.data),
      fields: (c, { level: r, period: o, lines: v = [] } = {}) => d("get", `combine/reports/${encodeURIComponent(c)}/fields`, void 0, {
        params: { level: r, ...o ? { period: o } : {}, ...v.length ? { lines: v } : {} }
      }).then((T) => T.data)
    },
    dashboards: {
      list: () => d("get", "dashboards").then((c) => c.data),
      get: (c) => d("get", `dashboards/${c}`).then((r) => r.data),
      create: (c) => d("post", "dashboards", c).then((r) => r.data),
      update: (c, r) => d("patch", `dashboards/${c}`, r).then((o) => o.data),
      remove: (c) => d("delete", `dashboards/${c}`),
      /** A first layout for a report: { name, context, widgets }. */
      generate: (c) => d("post", "dashboards-generate", { report: c }).then((r) => r.data),
      /** One saved widget's data with the viewer's report filters. */
      widget: (c, r, { context: o } = {}) => d("post", `dashboards/${c}/widgets/${encodeURIComponent(r)}`, o ? { context: o } : {}),
      /** A widget being edited. */
      preview: (c, { context: r } = {}) => d("post", "dashboards-preview", { widget: c, ...r ? { context: r } : {} }),
      publishing: (c) => d("get", `dashboards/${c}/publish`).then((r) => r.data),
      publish: (c, { permission: r, roles: o = [], inMenu: v = !1, menuGroup: T = null }) => d("put", `dashboards/${c}/publish`, {
        permission: r,
        roles: o,
        in_menu: v,
        menu_group: T
      }).then((E) => E.data),
      unpublish: (c) => d("delete", `dashboards/${c}/publish`).then((r) => r.data),
      /** Adds a widget to a dashboard you own; returns the dashboard. */
      pin: (c, r) => d("post", `dashboards/${c}/pin`, { widget: r }).then((o) => o.data)
    },
    query: {
      /** Without a root: topics to start from, by tab. With a root: its relation tree and a flat list for the builder. */
      catalog: (c) => d("get", "catalog", void 0, c ? { params: { root: c } } : void 0),
      validate: (c, r = {}) => d("post", "query/validate", { definition: c, parameters: r }),
      /**
       * One page of results. groups = { columns: [aliases], keys: [opened group values] }
       * for AG Grid's server-side row model; queryId lets cancel() stop it.
       */
      rows: (c, { parameters: r = {}, offset: o = 0, size: v, groups: T, queryId: E, signal: y } = {}) => d(
        "post",
        "query/rows",
        { definition: c, parameters: r, page: { offset: o, ...v ? { size: v } : {} }, ...T ? { groups: T } : {}, ...E ? { query_id: E } : {} },
        y ? { signal: y } : void 0
      ),
      values: (c, r = "", o = 50) => d("post", "query/values", { field: c, search: r, limit: o }).then((v) => v.data),
      /** Row count and grand totals of the whole report: { rows, totals, duration_ms, cached }. */
      summary: (c, r = {}) => d("post", "query/summary", { definition: c, parameters: r }),
      /** Streams the whole report as a file (format: csv | xlsx) and saves it. */
      export: (c, r, { parameters: o = {}, name: v } = {}) => m("query/export", { definition: c, parameters: o, format: r, name: v }, v),
      cancel: (c) => d("post", `query/${encodeURIComponent(c)}/cancel`)
    },
    reports: {
      list: (c = {}) => d("get", "reports", void 0, { params: c }),
      get: (c) => d("get", `reports/${c}`).then((r) => r.data),
      create: (c) => d("post", "reports", c).then((r) => r.data),
      update: (c, r) => d("patch", `reports/${c}`, r).then((o) => o.data),
      duplicate: (c) => d("post", `reports/${c}/duplicate`).then((r) => r.data),
      remove: (c) => d("delete", `reports/${c}`),
      share: (c, r, o) => d("put", `reports/${c}/shares`, { shares: r, ...o ? { visibility: o } : {} }).then((v) => v.data),
      /** Publishing: settings (with a suggested permission), publish, unpublish. Needs the publish ability. */
      publishing: (c) => d("get", `reports/${c}/publish`).then((r) => r.data),
      publish: (c, { permission: r, roles: o = [], inMenu: v = !1, menuGroup: T = null }) => d("put", `reports/${c}/publish`, {
        permission: r,
        roles: o,
        in_menu: v,
        menu_group: T
      }).then((E) => E.data),
      unpublish: (c) => d("delete", `reports/${c}/publish`).then((r) => r.data),
      /** Opening a saved report as it was saved (anyone who may open it). */
      view: (c) => d("get", `reports/${c}/view`).then((r) => r.data),
      run: (c, { parameters: r = {}, context: o, sort: v, offset: T = 0, size: E, groups: y, queryId: b, signal: p } = {}) => d(
        "post",
        `reports/${c}/rows`,
        {
          parameters: r,
          ...o ? { context: o } : {},
          ...v ? { sort: v } : {},
          page: { offset: T, ...E ? { size: E } : {} },
          ...y ? { groups: y } : {},
          ...b ? { query_id: b } : {}
        },
        p ? { signal: p } : void 0
      ),
      values: (c, r, o = "", v = 50) => d("post", `reports/${c}/values`, { field: r, search: o, limit: v }).then((T) => T.data),
      summary: (c, { parameters: r = {}, context: o, sort: v } = {}) => d("post", `reports/${c}/summary`, {
        parameters: r,
        ...o ? { context: o } : {},
        ...v ? { sort: v } : {}
      }),
      export: (c, r, { parameters: o = {}, context: v, sort: T } = {}) => m(`reports/${c}/export`, {
        format: r,
        parameters: o,
        ...v ? { context: v } : {},
        ...T ? { sort: T } : {}
      })
    },
    /** Version, the current user's abilities, registered sources and limits. */
    meta: () => d("get", "meta"),
    /** Published reports in the menu the current user may open: [{ uuid, name, description, group }]. */
    menu: () => d("get", "menu").then((c) => c.data),
    /** Choices for a report filter (kind: lines | divisions | employees): [{ id, label }]. */
    contextOptions: (c, { search: r = "", lines: o = [], period: v } = {}) => d("get", `context/${c}`, void 0, {
      params: { ...r ? { search: r } : {}, ...o.length ? { lines: o } : {}, ...v ? { period: v } : {} }
    }).then((T) => T.data),
    /** Roles a report can be published to: [{ id, name }]. */
    roles: () => d("get", "permissions/roles").then((c) => c.data),
    /** Every topic by tab, with filter columns, fields and relations (admins). */
    topics: () => d("get", "topics"),
    request: d
  };
}
const cl = Symbol("report-generator");
function Rv(t = {}) {
  const u = Dl(t);
  return {
    api: u,
    install(l) {
      l.provide(cl, { api: u });
    }
  };
}
function Fe() {
  const t = _e(cl, null);
  if (!t)
    throw new Error("report-generator: call app.use(createReportGenerator({ http })) before using its components.");
  return t;
}
const Ll = [
  { value: "dimension", label: "Dimension", short: "Dim", hint: "Group and filter by it" },
  { value: "measure", label: "Measure", short: "Msr", hint: "Add it up, average it, count it" },
  { value: "time", label: "Date", short: "Date", hint: "Group by day, month, quarter, year" },
  { value: "key", label: "Key", short: "Key", hint: "Used for joins and counting" }
], Nt = {
  string: "text",
  text: "paragraph",
  integer: "hash",
  decimal: "hash",
  boolean: "toggle",
  date: "calendar",
  datetime: "calendar",
  time: "clock",
  json: "braces"
}, kt = {
  sum: "Sum",
  avg: "Average",
  min: "Min",
  max: "Max",
  count: "Count",
  count_distinct: "Distinct"
}, Nl = ["d"], P = {
  __name: "RgIcon",
  props: {
    name: { type: String, required: !0 },
    small: { type: Boolean, default: !1 },
    spin: { type: Boolean, default: !1 }
  },
  setup(t) {
    const u = {
      search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.35-4.35",
      scan: "M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M7 12h10",
      database: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
      upload: "M12 16V4m0 0L7 9m5-5 5 5M5 20h14",
      eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
      eyeOff: "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2",
      lock: "M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3",
      bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
      arrow: "M5 12h14m-5-5 5 5-5 5",
      link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
      alert: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
      check: "M5 12.5l4.5 4.5L19 7.5",
      x: "M6 6l12 12M18 6 6 18",
      plus: "M12 5v14M5 12h14",
      table: "M4 5h16v14H4zM4 10h16M10 10v9",
      view: "M12 3 3 8l9 5 9-5zM3 13l9 5 9-5",
      key: "M14 10a4 4 0 1 0-3.9 4.9L8 17v3h3v-2h2l1.5-1.5A4 4 0 0 0 14 10zm1-1h.01",
      hash: "M5 9h14M5 15h14M10 4 8 20M16 4l-2 16",
      text: "M5 6h14M12 6v13",
      paragraph: "M4 6h16M4 10h16M4 14h10M4 18h12",
      calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
      clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
      toggle: "M8 7h8a5 5 0 0 1 0 10H8A5 5 0 0 1 8 7zm8 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
      braces: "M8 4H7a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h1M16 4h1a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-1",
      loader: "M12 3a9 9 0 1 0 9 9",
      history: "M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-1v5l3 2",
      inbox: "M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z",
      trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
      chevron: "M9 6l6 6-6 6",
      play: "M7 5v14l11-7z",
      stop: "M6 6h12v12H6z",
      undo: "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
      redo: "M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3",
      filter: "M4 5h16l-6 8v5l-4 2v-7z",
      save: "M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6",
      copy: "M9 9h11v11H9zM5 15H4V4h11v1",
      fx: "M14 4h-2a3 3 0 0 0-3 3v13M6 10h7M15 12l5 6M20 12l-5 6",
      folder: "M3 6h6l2 2h10v11H3z",
      users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a6 6 0 0 0-4-5.6",
      download: "M12 4v12m0 0-5-5m5 5 5-5M5 20h14",
      sort: "M7 4v16m0 0-3-3m3 3 3-3M13 6h8M13 11h6M13 16h4",
      more: "M5 12h.01M12 12h.01M19 12h.01",
      sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z",
      sheet: "M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M8.5 12l4 5m0-5-4 5",
      globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"
    };
    return (l, i) => (s(), n("svg", {
      class: oe(["rg-icon", { "rg-icon--sm": t.small, "rg-spin": t.spin }]),
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      focusable: "false"
    }, [
      e("path", {
        d: u[t.name] || u.alert
      }, null, 8, Nl)
    ], 2));
  }
}, Vl = ["data-rg-theme"], Fl = { class: "rg-topbar" }, Pl = { class: "rg-topbar__title" }, Ul = { class: "rg-topbar__meta" }, Il = { class: "rg-search rg-topics__search" }, ql = {
  key: 0,
  class: "rg-topics__tabs",
  role: "tablist",
  "aria-label": "Topic groups"
}, jl = ["aria-selected", "onClick"], zl = { class: "rg-num" }, Bl = {
  key: 1,
  class: "rg-body"
}, Kl = { class: "rg-sidebar" }, Gl = { class: "rg-skeleton-list" }, Hl = {
  key: 2,
  class: "rg-main"
}, Wl = { class: "rg-empty" }, Yl = { class: "rg-empty__icon" }, Jl = {
  key: 3,
  class: "rg-main"
}, Ql = { class: "rg-empty" }, Zl = { class: "rg-empty__icon" }, Xl = {
  key: 4,
  class: "rg-body"
}, es = { class: "rg-sidebar" }, ts = ["aria-current", "onClick"], ls = { class: "rg-list__label" }, ss = { class: "rg-list__flags" }, ns = { class: "rg-list__sub" }, as = { class: "rg-mono" }, os = { key: 0 }, rs = {
  key: 0,
  class: "rg-list__empty"
}, is = { class: "rg-main" }, us = { class: "rg-panel__head" }, ds = { class: "rg-panel__title" }, cs = { class: "rg-topic__title" }, gs = { class: "rg-facts" }, ms = { class: "rg-mono" }, ps = { class: "rg-mono" }, vs = { class: "rg-faint rg-mono" }, fs = {
  key: 0,
  class: "rg-muted rg-topic__desc"
}, bs = {
  key: 1,
  class: "rg-topic__conditions"
}, hs = {
  key: 0,
  class: "rg-faint"
}, ys = { class: "rg-mono" }, $s = { class: "rg-topic__badges" }, _s = {
  key: 0,
  class: "rg-badge rg-badge--warning"
}, ks = {
  key: 1,
  class: "rg-badge rg-badge--info"
}, ws = {
  key: 2,
  class: "rg-badge",
  title: "Not offered as a report's main topic; reached through relations"
}, xs = {
  key: 3,
  class: "rg-badge",
  title: "Readable through relations from topics a user may read; never a report's main topic"
}, Cs = { class: "rg-card" }, Ss = { class: "rg-topic__filters" }, Ms = {
  key: 0,
  class: "rg-mono rg-faint"
}, Ts = { class: "rg-card" }, Es = { class: "rg-card__head" }, As = { class: "rg-num rg-faint" }, Os = {
  key: 0,
  class: "rg-field-inline"
}, Rs = { class: "rg-table-wrap" }, Ds = { class: "rg-table rg-topic__fields" }, Ls = { class: "rg-cell-field" }, Ns = { class: "rg-cell-field__sub" }, Vs = { class: "rg-mono" }, Fs = { key: 0 }, Ps = { class: "rg-type" }, Us = ["title"], Is = { class: "rg-muted" }, qs = { class: "rg-card" }, js = { class: "rg-card__head" }, zs = { class: "rg-num rg-faint" }, Bs = {
  key: 0,
  class: "rg-muted rg-topic__none"
}, Ks = {
  key: 1,
  class: "rg-topic__relations"
}, Gs = ["onClick"], Hs = ["data-kind"], Ws = { class: "rg-topic__relation-text" }, Ys = {
  key: 0,
  class: "rg-faint"
}, Js = {
  key: 1,
  class: "rg-faint"
}, Qs = { class: "rg-mono" }, Dv = {
  __name: "TopicsBrowser",
  props: {
    theme: { type: String, default: "light" },
    /** Topic key to open first. */
    initialTopic: { type: String, default: null }
  },
  emits: ["select"],
  setup(t, { emit: u }) {
    const l = t, i = u, { api: d } = Fe();
    Oe("rg-theme", l.theme);
    const m = $e({ loading: !0, error: null, groups: [], group: null, topic: null }), h = B(""), a = B(!1), f = [
      { key: "period", label: "Period", icon: "calendar" },
      { key: "line", label: "Line", icon: "folder" },
      { key: "division", label: "Division", icon: "users" },
      { key: "employee", label: "Employee", icon: "users" }
    ], A = Object.fromEntries(Ll.map((C) => [C.value, C.label])), c = j(() => m.groups.flatMap((C) => C.topics)), r = j(() => Object.fromEntries(c.value.map((C) => [C.key, C]))), o = j(() => r.value[m.topic] ?? null), v = j(() => {
      var x;
      const C = h.value.trim().toLowerCase();
      return C ? c.value.filter((w) => w.label.toLowerCase().includes(C) || w.key.includes(C) || w.fields.some((ae) => ae.label.toLowerCase().includes(C))) : ((x = m.groups.find((w) => w.name === m.group)) == null ? void 0 : x.topics) ?? [];
    }), T = j(() => {
      var C;
      return (((C = o.value) == null ? void 0 : C.fields) ?? []).filter((x) => a.value || !x.hidden);
    }), E = j(() => {
      var C;
      return (((C = o.value) == null ? void 0 : C.fields) ?? []).filter((x) => x.hidden).length;
    });
    async function y() {
      var C, x;
      m.loading = !0, m.error = null;
      try {
        const w = await d.topics();
        m.groups = w.groups ?? [], b(l.initialTopic && r.value[l.initialTopic] ? l.initialTopic : (x = (C = m.groups[0]) == null ? void 0 : C.topics[0]) == null ? void 0 : x.key);
      } catch (w) {
        m.error = w.message;
      } finally {
        m.loading = !1;
      }
    }
    function b(C) {
      const x = r.value[C];
      x && (m.topic = C, m.group = x.group ?? m.group);
    }
    function p(C) {
      var w, ae;
      m.group = C, h.value = "";
      const x = (w = m.groups.find((ue) => ue.name === C)) == null ? void 0 : w.topics[0];
      x && ((ae = o.value) == null ? void 0 : ae.group) !== C && (m.topic = x.key);
    }
    ye(() => m.topic, (C) => C && i("select", C));
    function $(C) {
      return Object.entries(C.conditions ?? {}).map(([x, w]) => ({
        column: x,
        text: w === null ? "is empty" : Array.isArray(w) ? `in ${w.join(", ")}` : `= ${w}`
      }));
    }
    function L(C, x) {
      var w;
      return ((w = C.columns) == null ? void 0 : w[x]) ?? null;
    }
    return Se(y), (C, x) => (s(), n("div", {
      class: "rg-root rg-topics",
      "data-rg-theme": t.theme
    }, [
      e("header", Fl, [
        e("div", Pl, [
          x[3] || (x[3] = e("h1", null, "Topics", -1)),
          e("div", Ul, [
            e("span", null, [
              O(P, {
                name: "folder",
                small: ""
              }),
              F(_(m.groups.length) + " tabs", 1)
            ]),
            e("span", null, [
              O(P, {
                name: "table",
                small: ""
              }),
              F(_(c.value.length) + " topics", 1)
            ]),
            x[2] || (x[2] = e("span", null, [
              F("Defined in code: "),
              e("span", { class: "rg-mono" }, "app/Reporting/Topics")
            ], -1))
          ])
        ]),
        e("label", Il, [
          x[4] || (x[4] = e("span", { class: "rg-sr-only" }, "Search topics and fields", -1)),
          O(P, { name: "search" }),
          le(e("input", {
            "onUpdate:modelValue": x[0] || (x[0] = (w) => h.value = w),
            class: "rg-input",
            type: "search",
            placeholder: "Search topics and fields",
            autocomplete: "off"
          }, null, 512), [
            [ce, h.value]
          ])
        ])
      ]),
      m.groups.length ? (s(), n("nav", ql, [
        (s(!0), n(q, null, K(m.groups, (w) => (s(), n("button", {
          key: w.name,
          type: "button",
          role: "tab",
          class: "rg-topics__tab",
          "aria-selected": !h.value && m.group === w.name,
          onClick: (ae) => p(w.name)
        }, [
          F(_(w.name), 1),
          e("span", zl, _(w.topics.length), 1)
        ], 8, jl))), 128))
      ])) : M("", !0),
      m.loading ? (s(), n("div", Bl, [
        e("aside", Kl, [
          e("div", Gl, [
            (s(), n(q, null, K(6, (w) => e("div", {
              key: w,
              class: "rg-skeleton",
              style: Te({ width: `${50 + w * 37 % 45}%` })
            }, null, 4)), 64))
          ])
        ]),
        x[5] || (x[5] = e("main", { class: "rg-main" }, null, -1))
      ])) : m.error ? (s(), n("div", Hl, [
        e("div", Wl, [
          e("div", Yl, [
            O(P, { name: "alert" })
          ]),
          x[6] || (x[6] = e("h2", null, "Topics could not be loaded", -1)),
          e("p", null, _(m.error), 1),
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: y
          }, "Try again")
        ])
      ])) : c.value.length ? (s(), n("div", Xl, [
        e("aside", es, [
          O(qe, {
            tag: "ul",
            name: "rg-list-fade",
            class: "rg-list",
            "aria-label": h.value ? "Matching topics" : m.group
          }, {
            default: ie(() => [
              (s(!0), n(q, null, K(v.value, (w) => (s(), n("li", {
                key: w.key
              }, [
                e("button", {
                  type: "button",
                  class: "rg-list__item",
                  "aria-current": w.key === m.topic,
                  onClick: (ae) => b(w.key)
                }, [
                  e("span", ls, _(w.label), 1),
                  e("span", ss, [
                    w.permission ? (s(), ne(P, {
                      key: 0,
                      name: "lock",
                      small: "",
                      title: `Needs ${w.permission}`
                    }, null, 8, ["title"])) : M("", !0),
                    w.public ? (s(), ne(P, {
                      key: 1,
                      name: "globe",
                      small: "",
                      title: "Anyone may read it in full"
                    })) : M("", !0)
                  ]),
                  e("span", ns, [
                    e("span", as, _(w.table), 1),
                    e("span", null, "· " + _(w.fields_count) + " fields", 1),
                    h.value ? (s(), n("span", os, "· " + _(w.group), 1)) : M("", !0)
                  ])
                ], 8, ts)
              ]))), 128))
            ]),
            _: 1
          }, 8, ["aria-label"]),
          v.value.length ? M("", !0) : (s(), n("p", rs, "Nothing matches “" + _(h.value) + "”.", 1))
        ]),
        e("main", is, [
          O(tt, {
            name: "rg-swap",
            mode: "out-in"
          }, {
            default: ie(() => [
              o.value ? (s(), n("section", {
                key: o.value.key,
                class: "rg-panel rg-topic"
              }, [
                e("div", us, [
                  e("div", ds, [
                    e("h2", cs, _(o.value.label), 1),
                    e("div", gs, [
                      e("span", null, [
                        O(P, {
                          name: "key",
                          small: ""
                        }),
                        e("span", ms, _(o.value.key), 1)
                      ]),
                      e("span", null, [
                        O(P, {
                          name: "table",
                          small: ""
                        }),
                        e("span", ps, _(o.value.table), 1)
                      ]),
                      e("span", vs, _(o.value.class), 1)
                    ]),
                    o.value.description ? (s(), n("p", fs, _(o.value.description), 1)) : M("", !0),
                    $(o.value).length ? (s(), n("p", bs, [
                      O(P, {
                        name: "filter",
                        small: ""
                      }),
                      x[10] || (x[10] = F(" Only rows where ", -1)),
                      (s(!0), n(q, null, K($(o.value), (w, ae) => (s(), n(q, {
                        key: w.column
                      }, [
                        ae ? (s(), n("span", hs, "and")) : M("", !0),
                        e("code", ys, _(w.column) + " " + _(w.text), 1)
                      ], 64))), 128))
                    ])) : M("", !0)
                  ]),
                  e("div", $s, [
                    o.value.permission ? (s(), n("span", _s, [
                      O(P, {
                        name: "lock",
                        small: ""
                      }),
                      F(_(o.value.permission), 1)
                    ])) : M("", !0),
                    o.value.public ? (s(), n("span", ks, [
                      O(P, {
                        name: "globe",
                        small: ""
                      }),
                      x[11] || (x[11] = F("Public lookup", -1))
                    ])) : M("", !0),
                    o.value.startable === !1 ? (s(), n("span", ws, [
                      O(P, {
                        name: "link",
                        small: ""
                      }),
                      x[12] || (x[12] = F("Link table", -1))
                    ])) : M("", !0),
                    o.value.lookup ? (s(), n("span", xs, [
                      O(P, {
                        name: "link",
                        small: ""
                      }),
                      x[13] || (x[13] = F("Joined only", -1))
                    ])) : M("", !0)
                  ])
                ]),
                e("div", Cs, [
                  x[14] || (x[14] = e("div", { class: "rg-card__head" }, [
                    e("h2", null, "Report filters"),
                    e("span", { class: "rg-muted" }, "Every report on this topic can be limited by these")
                  ], -1)),
                  e("ul", Ss, [
                    (s(), n(q, null, K(f, (w) => e("li", {
                      key: w.key,
                      class: oe({ "is-off": !o.value.filters[w.key] })
                    }, [
                      O(P, {
                        name: o.value.filters[w.key] ? "check" : "x",
                        small: ""
                      }, null, 8, ["name"]),
                      e("b", null, _(w.label), 1),
                      L(o.value, w.key) ? (s(), n("span", Ms, _(L(o.value, w.key)), 1)) : M("", !0)
                    ], 2)), 64))
                  ])
                ]),
                e("div", Ts, [
                  e("div", Es, [
                    e("h2", null, [
                      x[15] || (x[15] = F("Fields ", -1)),
                      e("span", As, _(T.value.length), 1)
                    ]),
                    E.value ? (s(), n("label", Os, [
                      le(e("input", {
                        "onUpdate:modelValue": x[1] || (x[1] = (w) => a.value = w),
                        type: "checkbox",
                        class: "rg-check"
                      }, null, 512), [
                        [ct, a.value]
                      ]),
                      F(" Show " + _(E.value) + " id " + _(E.value === 1 ? "column" : "columns"), 1)
                    ])) : M("", !0)
                  ]),
                  e("div", Rs, [
                    e("table", Ds, [
                      x[16] || (x[16] = e("thead", null, [
                        e("tr", null, [
                          e("th", null, "Field"),
                          e("th", null, "Type"),
                          e("th", null, "Use"),
                          e("th", null, "Totals")
                        ])
                      ], -1)),
                      O(qe, {
                        tag: "tbody",
                        name: "rg-list-fade"
                      }, {
                        default: ie(() => [
                          (s(!0), n(q, null, K(T.value, (w) => (s(), n("tr", {
                            key: w.key,
                            class: oe(["rg-topic__field", { "rg-row--hidden": w.hidden }])
                          }, [
                            e("td", null, [
                              e("div", Ls, [
                                e("b", null, _(w.label), 1),
                                e("span", Ns, [
                                  e("span", Vs, _(w.key), 1),
                                  w.description ? (s(), n("span", Fs, "· " + _(w.description), 1)) : M("", !0)
                                ])
                              ])
                            ]),
                            e("td", null, [
                              e("span", Ps, [
                                O(P, {
                                  name: N(Nt)[w.type] ?? "text",
                                  small: ""
                                }, null, 8, ["name"]),
                                F(_(w.type), 1)
                              ])
                            ]),
                            e("td", null, [
                              e("span", {
                                class: oe(["rg-badge rg-role", `rg-role--${w.role}`])
                              }, _(w.key === "__rows" ? "Count" : N(A)[w.role] ?? w.role), 3),
                              w.options ? (s(), n("span", {
                                key: 0,
                                class: "rg-faint rg-topic__options",
                                title: Object.values(w.options).join(", ")
                              }, _(Object.keys(w.options).length) + " values ", 9, Us)) : M("", !0)
                            ]),
                            e("td", Is, _((w.aggregations ?? []).map((ae) => N(kt)[ae] ?? ae).join(", ") || "—"), 1)
                          ], 2))), 128))
                        ]),
                        _: 1
                      })
                    ])
                  ])
                ]),
                e("div", qs, [
                  e("div", js, [
                    e("h2", null, [
                      x[17] || (x[17] = F("Relations ", -1)),
                      e("span", zs, _(o.value.relations.length), 1)
                    ]),
                    x[18] || (x[18] = e("span", { class: "rg-muted" }, "Fields of these topics can be added to its reports", -1))
                  ]),
                  o.value.relations.length ? (s(), n("ul", Ks, [
                    (s(!0), n(q, null, K(o.value.relations, (w) => (s(), n("li", {
                      key: w.name
                    }, [
                      e("button", {
                        type: "button",
                        class: "rg-topic__relation",
                        onClick: (ae) => b(w.topic)
                      }, [
                        e("span", {
                          class: "rg-topic__relation-kind",
                          "data-kind": w.type
                        }, _(w.type === "hasMany" ? "many" : "one"), 9, Hs),
                        e("span", Ws, [
                          e("b", null, _(w.label), 1),
                          w.through ? (s(), n("span", Ys, _(w.topic_label) + " · via " + _(w.through), 1)) : (s(), n("span", Js, [
                            F(_(w.topic_label) + " · ", 1),
                            e("span", Qs, _(w.foreign_key), 1)
                          ]))
                        ]),
                        O(P, {
                          name: "arrow",
                          small: ""
                        })
                      ], 8, Gs)
                    ]))), 128))
                  ])) : (s(), n("p", Bs, "This topic does not link to other topics."))
                ])
              ])) : M("", !0)
            ]),
            _: 1
          })
        ])
      ])) : (s(), n("div", Jl, [
        e("div", Ql, [
          e("div", Zl, [
            O(P, { name: "database" })
          ]),
          x[7] || (x[7] = e("h2", null, "No topics yet", -1)),
          x[8] || (x[8] = e("p", null, "Topics are PHP classes in your app. Draft one from a model, then edit its labels:", -1)),
          x[9] || (x[9] = e("code", { class: "rg-mono" }, 'php artisan report-generator:make-topic ActualVisits --model="App\\ActualVisit"', -1))
        ])
      ]))
    ], 8, Vl));
  }
};
let Zs = 1;
const Ge = () => `f${Zs++}`, Vt = "__rows", Ft = {
  "=": "is",
  "!=": "is not",
  ">": "greater than",
  ">=": "at least",
  "<": "less than",
  "<=": "at most",
  in: "is any of",
  not_in: "is none of",
  between: "between",
  contains: "contains",
  not_contains: "does not contain",
  starts_with: "starts with",
  ends_with: "ends with",
  is_null: "is empty",
  not_null: "is not empty"
}, Xs = ["=", "!=", "in", "not_in", "contains", "not_contains", "starts_with", "ends_with", "is_null", "not_null"], en = ["=", "!=", ">", ">=", "<", "<=", "between", "in", "is_null", "not_null"], tn = ["between", "=", ">", ">=", "<", "<=", "is_null", "not_null"], ln = ["=", "is_null", "not_null"], sn = [">", ">=", "<", "<=", "=", "!=", "between"];
function Pt(t, u = !1) {
  return u ? sn : t === "integer" || t === "decimal" ? en : t === "date" || t === "datetime" ? tn : t === "boolean" ? ln : Xs;
}
const tl = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["last_7_days", "Last 7 days"],
  ["last_30_days", "Last 30 days"],
  ["this_week", "This week"],
  ["last_week", "Last week"],
  ["this_month", "This month"],
  ["last_month", "Last month"],
  ["this_quarter", "This quarter"],
  ["last_quarter", "Last quarter"],
  ["this_year", "This year"],
  ["last_year", "Last year"]
];
function Dt() {
  return {
    uuid: null,
    name: "Untitled report",
    description: "",
    folder: "",
    visibility: "private",
    canEdit: !0,
    root: null,
    rows: [],
    values: [],
    filters: { boolean: "and", items: [] },
    sort: [],
    subtotals: !1,
    grouped: !0,
    parameters: []
  };
}
function ll(t) {
  const u = String(t).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
  return /^[a-z_]/.test(u) ? u || "field" : `f_${u}`;
}
function Ut(t, u, l = null) {
  const i = new Set([...t.rows, ...t.values].filter((m) => m !== l).map((m) => m.as));
  let d = ll(u);
  for (let m = 2; i.has(d); m++) d = `${ll(u)}_${m}`;
  return d;
}
function gl(t, u, l) {
  return u.key === Vt || t.key === l || u.label.toLowerCase().includes(t.label.toLowerCase()) ? u.label : `${t.label} ${u.label}`;
}
function dt(t) {
  return t.field === Vt ? t.baseLabel : `${kt[t.agg] ?? t.agg} of ${t.baseLabel}`;
}
function Et(t, u, l, { path: i = null, asValue: d = null } = {}) {
  var f;
  const m = gl(u, l, t.root), h = d ?? l.role === "measure", a = {
    uid: Ge(),
    kind: h ? "measure" : "dimension",
    dataset: u.key,
    datasetLabel: u.label,
    field: l.key,
    type: l.type,
    role: l.role,
    aggregations: (f = l.aggregations) != null && f.length ? l.aggregations : ["count", "count_distinct"],
    baseLabel: m,
    grain: null,
    agg: null,
    path: i,
    format: null
  };
  return h ? (a.agg = a.aggregations.includes("sum") ? "sum" : a.aggregations[0], a.label = dt(a)) : (l.role === "time" && (a.grain = "month"), a.label = m), a.as = Ut(t, a.label), a;
}
function nn(t, u, l) {
  return { uid: Ge(), kind: "formula", label: u, formula: l, as: Ut(t, u), format: null };
}
function an(t) {
  if (t.kind === "formula")
    return { formula: t.formula, as: t.as, label: t.label, ...t.format ? { format: t.format } : {} };
  const u = { ref: `${t.dataset}.${t.field}`, as: t.as, label: t.label };
  return t.kind === "measure" && (u.agg = t.agg), t.kind === "dimension" && t.grain && (u.grain = t.grain), t.path && (u.path = t.path), t.format && (u.format = t.format), u;
}
function ml(t) {
  if (t.items)
    return { [t.boolean]: t.items.map(ml).filter(Boolean) };
  const u = { field: t.target, op: t.op };
  return ["is_null", "not_null"].includes(t.op) || (u.value = t.value), t.path && (u.path = t.path), u;
}
function on(t) {
  if (t.items || ["is_null", "not_null"].includes(t.op)) return !0;
  const u = t.value;
  return u == null || u === "" ? !1 : Array.isArray(u) ? t.op === "between" ? u.length === 2 && u.every((l) => l !== "" && l !== null) : u.length > 0 : !0;
}
function pl(t) {
  return { boolean: t.boolean, items: t.items.filter(on).map((u) => u.items ? pl(u) : u) };
}
function vl(t) {
  const u = [...t.rows, ...t.values], l = {};
  u.forEach((m, h) => l[`fields.${h}`] = m.uid);
  const i = {
    version: 1,
    root: t.root,
    fields: u.map(an),
    sort: t.sort.filter((m) => u.some((h) => h.as === m.field)),
    subtotals: t.subtotals,
    ui: { grouped: t.grouped, rows: t.rows.map((m) => m.as) }
  };
  t.parameters.length && (i.parameters = t.parameters);
  const d = pl(t.filters);
  if (d.items.length) {
    i.filters = ml(d);
    const m = (h, a) => h.items.forEach((f, A) => {
      const c = `${a}.${h.boolean}.${A}`;
      f.items ? m(f, c) : l[c] = f.uid;
    });
    m(d, "filters");
  }
  return { definition: i, locations: l };
}
function rn(t, u, l = {}) {
  var a, f, A;
  const i = Dt();
  i.root = t.root, i.subtotals = !!t.subtotals, i.grouped = ((a = t.ui) == null ? void 0 : a.grouped) ?? !0, i.parameters = t.parameters ?? [], i.sort = t.sort ?? [], Object.assign(i, {
    uuid: l.uuid ?? null,
    name: l.name ?? i.name,
    description: l.description ?? "",
    folder: l.folder ?? "",
    visibility: l.visibility ?? "private",
    canEdit: l.can_edit ?? !0,
    canPublish: l.can_publish ?? !1,
    published: l.published ?? !1
  });
  const d = Object.fromEntries(u.map((c) => [c.key, c])), m = new Set(((f = t.ui) == null ? void 0 : f.rows) ?? []);
  for (const c of t.fields ?? []) {
    if (c.formula) {
      i.values.push({ uid: Ge(), kind: "formula", label: c.label ?? c.as, formula: c.formula, as: c.as, format: c.format ?? null });
      continue;
    }
    const [r, o] = c.ref.split("."), v = d[r] ?? { key: r, label: r, fields: [] }, T = v.fields.find((b) => b.key === o) ?? { key: o, label: o, type: "string", role: "dimension", aggregations: [] }, E = !!c.agg && !m.has(c.as), y = {
      uid: Ge(),
      kind: E ? "measure" : "dimension",
      dataset: r,
      datasetLabel: v.label,
      field: o,
      type: T.type,
      role: T.role,
      aggregations: (A = T.aggregations) != null && A.length ? T.aggregations : ["count", "count_distinct"],
      baseLabel: gl(v, T, t.root),
      grain: c.grain ?? null,
      agg: c.agg ?? null,
      path: c.path ?? null,
      format: c.format ?? null,
      as: c.as,
      label: c.label ?? c.as,
      missing: !d[r] || !v.fields.some((b) => b.key === o)
    };
    (E ? i.values : i.rows).push(y);
  }
  const h = (c) => {
    const r = c.and ? "and" : c.or ? "or" : null;
    return r ? { uid: Ge(), boolean: r, items: c[r].map(h) } : { uid: Ge(), target: c.field, op: c.op, value: c.value ?? null, path: c.path ?? null };
  };
  if (t.filters) {
    const c = h(t.filters);
    i.filters = c.items ? { boolean: c.boolean, items: c.items } : { boolean: "and", items: [c] };
  }
  return i;
}
function un(t) {
  return !!t.root && t.rows.length + t.values.length > 0;
}
const dn = 60, sl = 200;
function cn() {
  var t, u;
  return ((u = (t = globalThis.crypto) == null ? void 0 : t.randomUUID) == null ? void 0 : u.call(t)) ?? `q-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function gn(t, u) {
  const l = $e({
    draft: Dt(),
    roots: null,
    catalog: null,
    loading: !0,
    loadingCatalog: !1,
    autoRun: !0,
    running: !1,
    error: null,
    errorUid: null,
    meta: null,
    runSeq: 0,
    saving: !1,
    savedSnapshot: null,
    pathChoice: null,
    // { dataset, field, target, options } while the user picks a join path
    undoDepth: 0,
    redoDepth: 0
  }), i = { past: [], future: [], applying: !1 }, d = j(() => vl(l.draft)), m = j(() => d.value.definition), h = j(() => un(l.draft)), a = j(() => {
    var G;
    return Object.fromEntries((((G = l.catalog) == null ? void 0 : G.datasets) ?? []).map((z) => [z.key, z]));
  }), f = j(() => l.draft.grouped && l.draft.rows.length >= 2), A = () => JSON.stringify(l.draft), c = j(() => l.savedSnapshot !== null && A() !== l.savedSnapshot);
  let r = null, o = null;
  ye(() => A(), (G) => {
    if (i.applying) {
      o = G;
      return;
    }
    clearTimeout(r), r = setTimeout(() => {
      o !== null && o !== G && (i.past.push(o), i.past.length > dn && i.past.shift(), i.future = [], T()), o = G;
    }, 250);
  });
  function v(G) {
    i.applying = !0, Object.assign(l.draft, JSON.parse(G)), queueMicrotask(() => i.applying = !1);
  }
  function T() {
    l.undoDepth = i.past.length, l.redoDepth = i.future.length;
  }
  function E() {
    i.past.length && (clearTimeout(r), i.future.push(A()), v(i.past.pop()), T());
  }
  function y() {
    i.future.length && (clearTimeout(r), i.past.push(A()), v(i.future.pop()), T());
  }
  const b = () => l.undoDepth > 0, p = () => l.redoDepth > 0;
  async function $(G = null) {
    var z;
    l.loading = !0;
    try {
      if (G) {
        const H = await t.reports.get(G);
        await L(H.definition.root), l.draft = rn(H.definition, ((z = l.catalog) == null ? void 0 : z.datasets) ?? [], H), pe();
      } else
        l.draft = Dt(), l.roots = (await t.query.catalog()).datasets;
      l.savedSnapshot = A(), o = l.savedSnapshot, i.past = [], i.future = [], T(), h.value && st();
    } catch (H) {
      u.error(H);
    } finally {
      l.loading = !1;
    }
  }
  async function L(G) {
    l.loadingCatalog = !0;
    try {
      l.catalog = await t.query.catalog(G);
    } finally {
      l.loadingCatalog = !1;
    }
  }
  async function C(G) {
    try {
      await L(G), Object.assign(l.draft, { root: G, rows: [], values: [], filters: { boolean: "and", items: [] }, sort: [] }), l.error = null, l.meta = null;
    } catch (z) {
      u.error(z);
    }
  }
  async function x() {
    if (!l.roots)
      try {
        l.roots = (await t.query.catalog()).datasets;
      } catch (G) {
        u.error(G);
        return;
      }
    l.draft.root = null, l.catalog = null;
  }
  function w(G) {
    for (const z of ["rows", "values"]) {
      const H = l.draft[z].findIndex((Q) => Q.uid === G);
      if (H !== -1) return { shelf: z, index: H, item: l.draft[z][H] };
    }
    return null;
  }
  function ae(G, z, H = null, Q = null, Z = void 0, de = null) {
    var it;
    const fe = a.value[G], me = fe == null ? void 0 : fe.fields.find((ht) => ht.key === z);
    if (!fe || !me) return;
    if (Z === void 0 && ((it = fe.paths) == null ? void 0 : it.length) > 1) {
      l.pathChoice = { dataset: fe, field: me, target: H, index: Q, parentUid: de, options: fe.paths };
      return;
    }
    const Je = Z ?? null, be = H ?? (me.role === "measure" ? "values" : "rows");
    if (be === "filters") {
      k({ target: `${G}.${z}`, type: me.type, label: Et(l.draft, fe, me).baseLabel, path: Je }, de);
      return;
    }
    const St = Et(l.draft, fe, me, { path: Je, asValue: be === "values" }), bt = l.draft[be];
    bt.splice(Q ?? bt.length, 0, St);
  }
  function ue(G) {
    const z = l.pathChoice;
    l.pathChoice = null, z && ae(z.dataset.key, z.field.key, z.target, z.index, G, z.parentUid);
  }
  function xe(G) {
    const z = w(G);
    if (!z) return;
    const H = z.item.as;
    l.draft[z.shelf].splice(z.index, 1), l.draft.sort = l.draft.sort.filter((Q) => Q.field !== H), l.draft.filters.items = l.draft.filters.items.filter((Q) => Q.target !== H);
  }
  function te(G, z, H) {
    const Q = w(G);
    if (!Q) return;
    const { item: Z } = Q;
    if (z === "rows" && Z.kind === "formula") return;
    l.draft[Q.shelf].splice(Q.index, 1), z !== Q.shelf && (z === "values" ? (Z.kind = "measure", Z.grain = null, Z.agg = Z.aggregations.includes("sum") ? "sum" : Z.aggregations.includes("count_distinct") ? "count_distinct" : Z.aggregations[0], Z.label = dt(Z)) : (Z.kind = "dimension", Z.agg = null, Z.role === "time" && (Z.grain = "month"), Z.label = Z.baseLabel), Z.as = Ut(l.draft, Z.label, Z));
    const de = l.draft[z];
    de.splice(Math.min(H ?? de.length, de.length), 0, Z);
  }
  function D(G, z) {
    var de;
    const H = w(G);
    if (!H) return;
    const { item: Q } = H, Z = Q.kind === "measure" ? Q.label === dt(Q) : Q.label === Q.baseLabel;
    Object.assign(Q, z), "agg" in z && Z && (Q.label = dt(Q)), "label" in z && !((de = z.label) != null && de.trim()) && (Q.label = Q.kind === "measure" ? dt(Q) : Q.baseLabel);
  }
  function J(G, z) {
    const H = nn(l.draft, G, z);
    return l.draft.values.push(H), H;
  }
  function I(G, z, H, Q) {
    const Z = w(G);
    Z && Object.assign(Z.item, { label: z, formula: H }, Q !== void 0 ? { format: Q } : {});
  }
  function R(G) {
    if (!G) return l.draft.filters;
    const z = (H) => {
      for (const Q of H.items) {
        if (Q.uid === G) return Q;
        if (Q.items) {
          const Z = z(Q);
          if (Z) return Z;
        }
      }
      return null;
    };
    return z(l.draft.filters) ?? l.draft.filters;
  }
  function k(G, z = null) {
    const H = G.op ?? Pt(G.type, G.isTotal)[0], Q = {
      uid: Ge(),
      target: G.target,
      type: G.type,
      label: G.label,
      isTotal: !!G.isTotal,
      path: G.path ?? null,
      op: H,
      value: G.value !== void 0 ? G.value : H === "between" && (G.type === "date" || G.type === "datetime") ? "this_month" : null
    };
    return R(z).items.push(Q), Q;
  }
  function g(G) {
    const z = w(G);
    if (!z) return;
    const H = z.item.kind === "measure" && ["count", "count_distinct"].includes(z.item.agg) ? "integer" : "decimal";
    k({ target: z.item.as, type: H, label: z.item.label, isTotal: !0 });
  }
  function S() {
    l.draft.filters.items.push({ uid: Ge(), boolean: l.draft.filters.boolean === "and" ? "or" : "and", items: [] });
  }
  function X(G, z) {
    if ("op" in z && z.op !== G.op) {
      const H = ["in", "not_in", "between"].includes(G.op), Q = ["in", "not_in", "between"].includes(z.op);
      (H !== Q || z.op === "between" || G.op === "between") && (z.value = z.op === "between" && (G.type === "date" || G.type === "datetime") ? "this_month" : Q ? [] : null);
    }
    Object.assign(G, z);
  }
  function se(G) {
    const z = (H) => {
      H.items = H.items.filter((Q) => Q.uid !== G), H.items.forEach((Q) => Q.items && z(Q));
    };
    z(l.draft.filters);
  }
  function pe() {
    const G = (z) => z.items.forEach((H) => {
      if (H.items) return G(H);
      if (H.target.includes(".")) {
        const [Q, Z] = H.target.split("."), de = a.value[Q], fe = de == null ? void 0 : de.fields.find((me) => me.key === Z);
        H.type = (fe == null ? void 0 : fe.type) ?? "string", H.label = fe ? Et(l.draft, de, fe).baseLabel : H.target, H.isTotal = !1;
      } else {
        const Q = [...l.draft.rows, ...l.draft.values].find((Z) => Z.as === H.target);
        H.label = (Q == null ? void 0 : Q.label) ?? H.target, H.isTotal = (Q == null ? void 0 : Q.kind) !== "dimension", H.type = (Q == null ? void 0 : Q.kind) === "dimension" ? Q.type : "decimal";
      }
    });
    G(l.draft.filters);
  }
  function Ce(G) {
    l.draft.sort = G;
  }
  function Ue(G) {
    const z = [...l.draft.rows, ...l.draft.values].find((Q) => Q.as === G);
    if (!z) return null;
    const H = z.kind !== "dimension";
    return {
      item: z,
      isTotal: H,
      target: H ? z.as : `${z.dataset}.${z.field}`,
      path: H ? null : z.path ?? null
    };
  }
  function Re(G, z) {
    return !G.items && G.target === z.target && JSON.stringify(G.path ?? null) === JSON.stringify(z.path);
  }
  function rt(G, z) {
    const H = Ue(G.alias);
    H && (l.draft.filters.items = l.draft.filters.items.filter((Q) => !Re(Q, H)), z && k({
      target: H.target,
      type: H.isTotal ? ["date", "datetime"].includes(G.type) ? G.type : "decimal" : H.item.type,
      label: H.isTotal ? H.item.label : H.item.baseLabel,
      path: H.path,
      isTotal: H.isTotal,
      op: z.op,
      value: z.value
    }));
  }
  function mt(G) {
    const z = Ue(G), H = z && l.draft.filters.items.find((Q) => Re(Q, z));
    return H ? { op: H.op, value: H.value } : null;
  }
  function lt(G) {
    const z = l.draft.sort.find((H) => H.field === G);
    z ? z.dir === "asc" ? l.draft.sort = [{ field: G, dir: "desc" }] : l.draft.sort = [] : l.draft.sort = [{ field: G, dir: "asc" }];
  }
  let De = null, je = null;
  function Pe() {
    De == null || De.abort(), je && t.query.cancel(je).catch(() => {
    }), De = null, je = null;
  }
  function st() {
    if (!h.value) {
      l.meta = null, l.error = null;
      return;
    }
    l.runSeq++;
  }
  async function nt({ keys: G = [], offset: z = 0, top: H = !1, size: Q = sl, fresh: Z = !1 } = {}) {
    var me, Je;
    const de = f.value ? { columns: l.draft.rows.map((be) => be.as), keys: G } : void 0, fe = H && (z === 0 || Z);
    fe && (Pe(), De = typeof AbortController < "u" ? new AbortController() : null, je = cn(), l.running = !0, l.error = null, l.errorUid = null);
    try {
      const be = await t.query.rows(m.value, {
        offset: z,
        size: Q ?? sl,
        groups: de,
        queryId: fe ? je : void 0,
        signal: De == null ? void 0 : De.signal
      });
      return H && (l.meta = { ...be.meta, columns: be.columns }), be;
    } catch (be) {
      throw ((me = be == null ? void 0 : be.cause) == null ? void 0 : me.name) === "CanceledError" || ((Je = be == null ? void 0 : be.cause) == null ? void 0 : Je.name) === "AbortError" || (H ? (l.error = be, l.errorUid = be.path ? pt(be.path) : null) : u.error(be)), be;
    } finally {
      fe && (l.running = !1, je = null);
    }
  }
  function pt(G) {
    const { locations: z } = d.value, H = G.split(".");
    for (let Q = H.length; Q > 0; Q--) {
      const Z = z[H.slice(0, Q).join(".")];
      if (Z) return Z;
    }
    return null;
  }
  function vt(G, z) {
    const H = w(G);
    if (H) {
      H.item.path = z;
      return;
    }
    const Q = (Z) => Z.items.forEach((de) => de.items ? Q(de) : de.uid === G && (de.path = z));
    Q(l.draft.filters);
  }
  let ft = null;
  ye(() => JSON.stringify(m.value), () => {
    !l.autoRun || l.loading || (clearTimeout(ft), ft = setTimeout(st, 450));
  });
  async function Ye({ name: G, description: z, folder: H, visibility: Q, copy: Z = !1 } = {}) {
    const de = l.draft, fe = {
      name: (G ?? de.name).trim() || "Untitled report",
      description: z ?? de.description,
      folder: (H ?? de.folder) || null,
      visibility: Q ?? de.visibility,
      definition: m.value
    };
    l.saving = !0;
    try {
      const me = de.uuid && !Z && de.canEdit ? await t.reports.update(de.uuid, fe) : await t.reports.create(fe);
      return Object.assign(de, {
        uuid: me.uuid,
        name: me.name,
        description: me.description ?? "",
        folder: me.folder ?? "",
        visibility: me.visibility,
        canEdit: me.can_edit,
        canPublish: me.can_publish ?? !1,
        published: me.published ?? !1
      }), l.savedSnapshot = A(), u.success(`Saved "${me.name}".`), me;
    } catch (me) {
      throw u.error(me), me;
    } finally {
      l.saving = !1;
    }
  }
  return {
    state: l,
    definition: m,
    runnable: h,
    grouped: f,
    dirty: c,
    datasetsByKey: a,
    init: $,
    chooseRoot: C,
    changeRoot: x,
    addField: ae,
    choosePath: ue,
    removeItem: xe,
    moveItem: te,
    updateItem: D,
    addFormula: J,
    updateFormula: I,
    addFilter: k,
    addFilterGroup: S,
    filterOnTotal: g,
    updateFilter: X,
    removeFilter: se,
    toggleSort: lt,
    setSort: Ce,
    filterColumn: rt,
    columnFilter: mt,
    run: st,
    fetchRows: nt,
    fetchSummary: () => t.query.summary(m.value),
    exportReport: async (G) => {
      try {
        const z = await t.query.export(m.value, G, { name: l.draft.name || "report" });
        u.success(`Exported "${z}".`);
      } catch (z) {
        throw u.error(z), z;
      }
    },
    gridKey: j(() => l.draft.uuid ? `report:${l.draft.uuid}` : null),
    cancelRunning: Pe,
    applyPath: vt,
    save: Ye,
    undo: E,
    redo: y,
    canUndo: b,
    canRedo: p,
    ROW_COUNT: Vt
  };
}
const Ae = Symbol("rg-report-builder");
let mn = 1;
function xt() {
  const t = $e([]);
  function u(i, d, m = i === "error" ? 7e3 : 3500) {
    const h = mn++;
    t.push({ id: h, kind: i, message: d }), setTimeout(() => l(h), m);
  }
  function l(i) {
    const d = t.findIndex((m) => m.id === i);
    d !== -1 && t.splice(d, 1);
  }
  return {
    items: t,
    dismiss: l,
    success: (i) => u("success", i),
    error: (i) => u("error", typeof i == "string" ? i : (i == null ? void 0 : i.message) || "Something went wrong.")
  };
}
const pn = ["onClick"], Ct = {
  __name: "RgToaster",
  props: { toasts: { type: Object, required: !0 } },
  setup(t) {
    return (u, l) => (s(), ne(ul, { to: "body" }, [
      e("div", dl({ class: "rg-root rg-toaster" }, u.$attrs, {
        role: "status",
        "aria-live": "polite"
      }), [
        O(qe, { name: "rg-toast" }, {
          default: ie(() => [
            (s(!0), n(q, null, K(t.toasts.items, (i) => (s(), n("div", {
              key: i.id,
              class: oe(["rg-toast", `rg-toast--${i.kind}`])
            }, [
              O(P, {
                name: i.kind === "error" ? "alert" : "check"
              }, null, 8, ["name"]),
              e("p", null, _(i.message), 1),
              e("button", {
                type: "button",
                class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
                "aria-label": "Dismiss",
                onClick: (d) => t.toasts.dismiss(i.id)
              }, [
                O(P, {
                  name: "x",
                  small: ""
                })
              ], 8, pn)
            ], 2))), 128))
          ]),
          _: 1
        })
      ], 16)
    ]));
  }
}, ot = {
  __name: "RgPopover",
  emits: ["close"],
  setup(t, { emit: u }) {
    const l = u, i = B(null);
    function d(h) {
      var a;
      i.value && !((a = i.value.parentElement) != null && a.contains(h.target)) && l("close");
    }
    function m(h) {
      h.key === "Escape" && l("close");
    }
    return Se(() => {
      var h, a;
      setTimeout(() => document.addEventListener("mousedown", d), 0), document.addEventListener("keydown", m), (a = (h = i.value) == null ? void 0 : h.querySelector("input, select, textarea, button")) == null || a.focus();
    }), Ve(() => {
      document.removeEventListener("mousedown", d), document.removeEventListener("keydown", m);
    }), (h, a) => (s(), n("div", {
      ref_key: "panel",
      ref: i,
      class: "rg-pop",
      role: "dialog",
      onClick: a[0] || (a[0] = ge(() => {
      }, ["stop"]))
    }, [
      gt(h.$slots, "default")
    ], 512));
  }
}, vn = { class: "rg-export" }, fn = ["disabled", "aria-expanded"], bn = { class: "rg-export__icon rg-export__icon--xlsx" }, hn = { class: "rg-export__icon" }, yn = {
  key: 1,
  class: "rg-export__error",
  role: "alert"
}, It = {
  __name: "ExportMenu",
  props: {
    run: { type: Function, required: !0 },
    disabled: { type: Boolean, default: !1 },
    small: { type: Boolean, default: !1 }
  },
  setup(t) {
    const u = t, l = B(!1), i = B(null), d = B(null);
    async function m(h) {
      l.value = !1, i.value = h, d.value = null;
      try {
        await u.run(h);
      } catch (a) {
        d.value = (a == null ? void 0 : a.message) ?? "Export failed.";
      } finally {
        i.value = null;
      }
    }
    return (h, a) => (s(), n("div", vn, [
      e("button", {
        type: "button",
        class: oe(["rg-btn rg-btn--export", { "rg-btn--sm": t.small }]),
        disabled: t.disabled || !!i.value,
        "aria-expanded": l.value,
        "aria-haspopup": "menu",
        onClick: a[0] || (a[0] = (f) => l.value = !l.value)
      }, [
        O(P, {
          name: i.value ? "loader" : "download",
          spin: !!i.value,
          small: ""
        }, null, 8, ["name", "spin"]),
        F(" " + _(i.value ? `Exporting ${i.value === "xlsx" ? "Excel" : "CSV"}…` : "Export") + " ", 1),
        i.value ? M("", !0) : (s(), ne(P, {
          key: 0,
          name: "chevron",
          small: "",
          class: "rg-export__chev"
        }))
      ], 10, fn),
      l.value ? (s(), ne(ot, {
        key: 0,
        class: "rg-export__menu",
        onClose: a[3] || (a[3] = (f) => l.value = !1)
      }, {
        default: ie(() => [
          e("button", {
            type: "button",
            role: "menuitem",
            class: "rg-export__item",
            onClick: a[1] || (a[1] = (f) => m("xlsx"))
          }, [
            e("span", bn, [
              O(P, { name: "sheet" })
            ]),
            a[4] || (a[4] = e("span", null, [
              e("b", null, "Excel"),
              e("small", null, "Every row, formatted, opens in Excel")
            ], -1))
          ]),
          e("button", {
            type: "button",
            role: "menuitem",
            class: "rg-export__item",
            onClick: a[2] || (a[2] = (f) => m("csv"))
          }, [
            e("span", hn, [
              O(P, { name: "paragraph" })
            ]),
            a[5] || (a[5] = e("span", null, [
              e("b", null, "CSV"),
              e("small", null, "Plain text, for other systems")
            ], -1))
          ])
        ]),
        _: 1
      })) : M("", !0),
      d.value ? (s(), n("p", yn, _(d.value), 1)) : M("", !0)
    ]));
  }
}, $n = { class: "rg-topbar" }, _n = { class: "rg-topbar__title" }, kn = { class: "rg-topbar__meta" }, wn = {
  key: 0,
  class: "rg-root-chip"
}, xn = { key: 1 }, Cn = {
  key: 2,
  class: "rg-badge"
}, Sn = {
  key: 3,
  class: "rg-badge rg-badge--success"
}, Mn = { class: "rg-topbar__actions" }, Tn = ["disabled"], En = ["disabled"], An = {
  class: "rg-field-inline",
  for: "rg-autorun",
  title: "Run the report as you change it"
}, On = ["disabled"], Rn = ["disabled"], Dn = ["disabled"], Ln = {
  __name: "BuilderTopbar",
  emits: ["save", "save-copy", "close", "publish", "pin"],
  setup(t, { emit: u }) {
    const l = u, i = _e(Ae), d = j(() => i.state.draft), m = j(() => {
      var h;
      return ((h = i.datasetsByKey.value[d.value.root]) == null ? void 0 : h.label) ?? d.value.root;
    });
    return (h, a) => (s(), n("header", $n, [
      e("div", _n, [
        a[13] || (a[13] = e("label", {
          class: "rg-sr-only",
          for: "rg-report-name"
        }, "Report name", -1)),
        le(e("input", {
          id: "rg-report-name",
          "onUpdate:modelValue": a[0] || (a[0] = (f) => d.value.name = f),
          class: "rg-input rg-input--bare rg-name-input",
          maxlength: "255"
        }, null, 512), [
          [ce, d.value.name]
        ]),
        e("div", kn, [
          d.value.root ? (s(), n("span", wn, [
            a[10] || (a[10] = F(" Report on ", -1)),
            e("b", null, _(m.value), 1),
            e("button", {
              type: "button",
              onClick: a[1] || (a[1] = (f) => N(i).changeRoot())
            }, "change")
          ])) : M("", !0),
          N(i).dirty.value ? (s(), n("span", xn, [...a[11] || (a[11] = [
            e("i", {
              class: "rg-dot",
              "aria-hidden": "true"
            }, null, -1),
            F(" Unsaved changes", -1)
          ])])) : M("", !0),
          d.value.uuid && !d.value.canEdit ? (s(), n("span", Cn, "View only: save a copy to keep changes")) : M("", !0),
          d.value.published ? (s(), n("span", Sn, [
            O(P, {
              name: "globe",
              small: ""
            }),
            a[12] || (a[12] = F(" Published", -1))
          ])) : M("", !0)
        ])
      ]),
      e("div", Mn, [
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--ghost rg-btn--icon",
          disabled: !N(i).canUndo(),
          "aria-label": "Undo",
          title: "Undo (Ctrl+Z)",
          onClick: a[2] || (a[2] = (f) => N(i).undo())
        }, [
          O(P, { name: "undo" })
        ], 8, Tn),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--ghost rg-btn--icon",
          disabled: !N(i).canRedo(),
          "aria-label": "Redo",
          title: "Redo (Ctrl+Shift+Z)",
          onClick: a[3] || (a[3] = (f) => N(i).redo())
        }, [
          O(P, { name: "redo" })
        ], 8, En),
        a[19] || (a[19] = e("span", { class: "rg-toolbar-sep" }, null, -1)),
        e("label", An, [
          le(e("input", {
            id: "rg-autorun",
            "onUpdate:modelValue": a[4] || (a[4] = (f) => N(i).state.autoRun = f),
            class: "rg-check",
            type: "checkbox"
          }, null, 512), [
            [ct, N(i).state.autoRun]
          ]),
          a[14] || (a[14] = F(" Auto-run ", -1))
        ]),
        e("button", {
          type: "button",
          class: "rg-btn",
          disabled: !N(i).runnable.value || N(i).state.running,
          title: "Run (Ctrl+Enter)",
          onClick: a[5] || (a[5] = (f) => N(i).run())
        }, [
          O(P, {
            name: "play",
            small: ""
          }),
          a[15] || (a[15] = F(" Run ", -1))
        ], 8, On),
        O(It, {
          run: N(i).exportReport,
          disabled: !N(i).runnable.value
        }, null, 8, ["run", "disabled"]),
        a[20] || (a[20] = e("span", { class: "rg-toolbar-sep" }, null, -1)),
        d.value.uuid ? (s(), n("button", {
          key: 0,
          type: "button",
          class: "rg-btn",
          title: "Add a chart or number from this report to a dashboard",
          onClick: a[6] || (a[6] = (f) => l("pin"))
        }, [
          O(P, {
            name: "plus",
            small: ""
          }),
          a[16] || (a[16] = F(" Pin ", -1))
        ])) : M("", !0),
        d.value.uuid && d.value.canPublish ? (s(), n("button", {
          key: 1,
          type: "button",
          class: "rg-btn",
          title: "Give roles a permission to open this report",
          onClick: a[7] || (a[7] = (f) => l("publish"))
        }, [
          O(P, {
            name: "globe",
            small: ""
          }),
          F(" " + _(d.value.published ? "Publishing" : "Publish"), 1)
        ])) : M("", !0),
        d.value.uuid ? (s(), n("button", {
          key: 2,
          type: "button",
          class: "rg-btn",
          disabled: !d.value.root,
          onClick: a[8] || (a[8] = (f) => l("save-copy"))
        }, [
          O(P, {
            name: "copy",
            small: ""
          }),
          a[17] || (a[17] = F(" Save a copy ", -1))
        ], 8, Rn)) : M("", !0),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--primary",
          disabled: !N(i).runnable.value || N(i).state.saving || d.value.uuid && !d.value.canEdit,
          title: "Save (Ctrl+S)",
          onClick: a[9] || (a[9] = (f) => l("save"))
        }, [
          O(P, {
            name: "save",
            small: ""
          }),
          a[18] || (a[18] = F(" Save ", -1))
        ], 8, Dn)
      ])
    ]));
  }
}, Nn = { class: "rg-roots" }, Vn = { class: "rg-roots__bar" }, Fn = {
  key: 0,
  class: "rg-topics__tabs rg-roots__tabs",
  role: "tablist",
  "aria-label": "Topic groups"
}, Pn = ["aria-selected", "onClick"], Un = { class: "rg-num" }, In = { class: "rg-search rg-roots__search" }, qn = ["onClick"], jn = { key: 0 }, zn = { class: "rg-num rg-faint" }, Bn = {
  key: 1,
  class: "rg-muted"
}, Kn = {
  __name: "RootPicker",
  setup(t) {
    const u = _e(Ae), l = _e("rg-start-combined", null), i = _e("rg-choose-combined", null), d = B(""), m = B(null), h = { period: "Period", line: "Line", division: "Division", employee: "Employee" }, a = j(() => {
      const r = /* @__PURE__ */ new Map();
      for (const o of u.state.roots ?? []) {
        const v = o.group ?? o.label;
        r.has(v) || r.set(v, []), r.get(v).push(o);
      }
      return [...r].map(([o, v]) => ({ name: o, topics: v }));
    }), f = j(() => {
      var r;
      return m.value ?? ((r = a.value[0]) == null ? void 0 : r.name) ?? null;
    }), A = j(() => {
      var o;
      const r = d.value.trim().toLowerCase();
      return r || a.value.length < 2 ? (u.state.roots ?? []).filter((v) => !r || v.label.toLowerCase().includes(r) || v.key.includes(r)) : ((o = a.value.find((v) => v.name === f.value)) == null ? void 0 : o.topics) ?? [];
    });
    function c(r) {
      return Object.entries(r.filters ?? {}).filter(([, o]) => o).map(([o]) => h[o] ?? o);
    }
    return (r, o) => (s(), n("div", Nn, [
      o[5] || (o[5] = e("div", null, [
        e("h2", null, "What is this report about?"),
        e("p", {
          class: "rg-muted",
          style: { margin: "4px 0 0" }
        }, " Pick the main topic: each row of a detailed report is one of these. Fields from related topics can be added next. ")
      ], -1)),
      e("div", Vn, [
        a.value.length > 1 && !d.value ? (s(), n("nav", Fn, [
          (s(!0), n(q, null, K(a.value, (v) => (s(), n("button", {
            key: v.name,
            type: "button",
            role: "tab",
            class: "rg-topics__tab",
            "aria-selected": f.value === v.name,
            onClick: (T) => m.value = v.name
          }, [
            F(_(v.name), 1),
            e("span", Un, _(v.topics.length), 1)
          ], 8, Pn))), 128))
        ])) : M("", !0),
        e("label", In, [
          o[2] || (o[2] = e("span", { class: "rg-sr-only" }, "Search topics", -1)),
          O(P, { name: "search" }),
          le(e("input", {
            id: "rg-root-search",
            "onUpdate:modelValue": o[0] || (o[0] = (v) => d.value = v),
            class: "rg-input",
            type: "search",
            placeholder: "Search topics",
            autocomplete: "off"
          }, null, 512), [
            [ce, d.value]
          ])
        ])
      ]),
      N(l) && N(i) && !d.value ? (s(), n("button", {
        key: 0,
        type: "button",
        class: "rg-root-card rg-root-card--combine",
        onClick: o[1] || (o[1] = (v) => N(i)())
      }, [
        e("b", null, [
          O(P, {
            name: "table",
            small: ""
          }),
          o[3] || (o[3] = F(" Combine existing reports", -1))
        ]),
        o[4] || (o[4] = e("span", null, "Put columns of reports you already use side by side, one row per employee or per division, and add formulas across them.", -1))
      ])) : M("", !0),
      O(qe, {
        tag: "div",
        name: "rg-list-fade",
        class: "rg-roots__grid"
      }, {
        default: ie(() => [
          (s(!0), n(q, null, K(A.value, (v) => (s(), n("button", {
            key: v.key,
            type: "button",
            class: "rg-root-card",
            onClick: (T) => N(u).chooseRoot(v.key)
          }, [
            e("b", null, _(v.label), 1),
            v.description ? (s(), n("span", jn, _(v.description), 1)) : M("", !0),
            e("span", zn, [
              F(_(v.fields_count) + " fields", 1),
              c(v).length ? (s(), n(q, { key: 0 }, [
                F(" · by " + _(c(v).join(", ")), 1)
              ], 64)) : M("", !0)
            ])
          ], 8, qn))), 128))
        ]),
        _: 1
      }),
      N(u).state.roots && !A.value.length ? (s(), n("p", Bn, _(d.value ? "No topic matches your search." : "There are no topics you can report on yet. Ask an admin for access."), 1)) : M("", !0)
    ]));
  }
}, Gn = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }), Hn = new Intl.NumberFormat("en"), Wn = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function He(t) {
  return t == null ? "—" : t < 1e4 ? Hn.format(t) : Gn.format(t);
}
const Yn = [
  ["year", 31536e3],
  ["month", 2592e3],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60]
];
function nl(t, u = Date.now()) {
  if (!t) return "";
  const l = Math.round((new Date(t).getTime() - u) / 1e3);
  for (const [i, d] of Yn)
    if (Math.abs(l) >= d) return Wn.format(Math.round(l / d), i);
  return "just now";
}
const Jn = {
  class: "rg-explorer",
  "aria-label": "Fields"
}, Qn = { class: "rg-explorer__head" }, Zn = { class: "rg-search" }, Xn = { class: "rg-explorer__list" }, ea = ["aria-expanded", "onClick"], ta = { class: "rg-ds__meta" }, la = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, sa = ["title"], na = {
  key: 2,
  class: "rg-badge rg-badge--warning",
  title: "Reachable in more than one way: you will be asked which"
}, aa = {
  class: "rg-faint rg-num",
  style: { "font-size": "11px" }
}, oa = {
  key: 0,
  class: "rg-ds__fields"
}, ra = ["title", "onDragstart", "onDblclick"], ia = { class: "rg-fld__label" }, ua = { class: "rg-fld__actions" }, da = ["aria-label", "onClick"], ca = ["aria-label", "onClick"], ga = {
  key: 0,
  class: "rg-list__empty"
}, ma = {
  __name: "FieldExplorer",
  setup(t) {
    const u = _e(Ae), l = B(""), i = B({}), d = j(() => {
      var r;
      const c = l.value.trim().toLowerCase();
      return (((r = u.state.catalog) == null ? void 0 : r.datasets) ?? []).map((o) => {
        const v = c ? o.fields.filter((T) => T.label.toLowerCase().includes(c) || o.label.toLowerCase().includes(c)) : o.fields;
        return { dataset: o, fields: v, isRoot: o.key === u.state.draft.root };
      }).filter((o) => o.fields.length);
    });
    function m(c) {
      return l.value.trim() !== "" || (i.value[c.dataset.key] ?? c.isRoot);
    }
    function h(c, r) {
      i.value = { ...i.value, [c]: !m(r) };
    }
    function a(c, r, o) {
      c.dataTransfer.effectAllowed = "copy", c.dataTransfer.setData("application/x-rg", JSON.stringify({ kind: "field", dataset: r.key, field: o.key })), c.dataTransfer.setData("text/plain", o.label);
    }
    function f(c) {
      return `rg-role rg-role--${c.role}`;
    }
    function A(c) {
      var r;
      return (r = c.paths) == null ? void 0 : r.some((o) => o.multiplies_rows);
    }
    return (c, r) => (s(), n("aside", Jn, [
      e("div", Qn, [
        e("label", Zn, [
          r[1] || (r[1] = e("span", { class: "rg-sr-only" }, "Search fields", -1)),
          O(P, { name: "search" }),
          le(e("input", {
            id: "rg-field-search",
            "onUpdate:modelValue": r[0] || (r[0] = (o) => l.value = o),
            class: "rg-input",
            type: "search",
            placeholder: "Search fields",
            autocomplete: "off"
          }, null, 512), [
            [ce, l.value]
          ])
        ]),
        r[2] || (r[2] = e("span", { class: "rg-explorer__hint" }, "Drag fields onto Rows, Values or Filters, or use the buttons.", -1))
      ]),
      e("div", Xn, [
        (s(!0), n(q, null, K(d.value, (o) => {
          var v, T;
          return s(), n("section", {
            key: o.dataset.key,
            class: "rg-ds"
          }, [
            e("button", {
              type: "button",
              class: "rg-ds__head",
              "aria-expanded": m(o) ? "true" : "false",
              onClick: (E) => h(o.dataset.key, o)
            }, [
              O(P, {
                name: "chevron",
                small: "",
                class: "rg-chev"
              }),
              e("span", null, _(o.dataset.label), 1),
              e("span", ta, [
                o.isRoot ? (s(), n("span", la, "report")) : A(o.dataset) ? (s(), n("span", {
                  key: 1,
                  class: "rg-badge",
                  title: `Several ${o.dataset.label} per ${(v = N(u).datasetsByKey.value[N(u).state.draft.root]) == null ? void 0 : v.label}`
                }, "many", 8, sa)) : M("", !0),
                ((T = o.dataset.paths) == null ? void 0 : T.length) > 1 ? (s(), n("span", na, _(o.dataset.paths.length) + " ways", 1)) : M("", !0),
                e("span", aa, _(N(He)(o.dataset.row_estimate)), 1)
              ])
            ], 8, ea),
            m(o) ? (s(), n("ul", oa, [
              (s(!0), n(q, null, K(o.fields, (E) => (s(), n("li", {
                key: E.key,
                class: "rg-fld",
                draggable: "true",
                title: `${E.label} (${E.type})`,
                onDragstart: (y) => a(y, o.dataset, E),
                onDblclick: (y) => N(u).addField(o.dataset.key, E.key)
              }, [
                e("span", {
                  class: oe(f(E))
                }, [
                  O(P, {
                    name: E.key === "__rows" ? "hash" : N(Nt)[E.type] || "text",
                    small: "",
                    class: "rg-fld__icon"
                  }, null, 8, ["name"])
                ], 2),
                e("span", ia, _(E.label), 1),
                e("span", ua, [
                  e("button", {
                    type: "button",
                    class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
                    "aria-label": `Add ${E.label}`,
                    title: "Add",
                    onClick: (y) => N(u).addField(o.dataset.key, E.key)
                  }, [
                    O(P, {
                      name: "plus",
                      small: ""
                    })
                  ], 8, da),
                  E.key !== "__rows" ? (s(), n("button", {
                    key: 0,
                    type: "button",
                    class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
                    "aria-label": `Filter by ${E.label}`,
                    title: "Filter by this",
                    onClick: (y) => N(u).addField(o.dataset.key, E.key, "filters")
                  }, [
                    O(P, {
                      name: "filter",
                      small: ""
                    })
                  ], 8, ca)) : M("", !0)
                ])
              ], 40, ra))), 128))
            ])) : M("", !0)
          ]);
        }), 128)),
        d.value.length ? M("", !0) : (s(), n("p", ga, "No field matches “" + _(l.value) + "”.", 1))
      ])
    ]));
  }
}, pa = { class: "rg-chip-wrap" }, va = ["aria-label", "title"], fa = { class: "rg-chip__label" }, ba = {
  key: 1,
  class: "rg-chip__tag"
}, ha = ["aria-label"], ya = ["for"], $a = ["id", "value"], _a = ["for"], ka = ["id", "value"], wa = ["value"], xa = ["for"], Ca = ["id", "value"], Sa = ["value"], Ma = ["for"], Ta = ["id", "value"], Ea = {
  key: 3,
  class: "rg-faint",
  style: { margin: "0", "font-size": "11.5px" }
}, Aa = { class: "rg-pop__foot" }, Oa = { class: "rg-pop__row" }, Ra = {
  __name: "FieldChip",
  props: {
    item: { type: Object, required: !0 },
    shelf: { type: String, required: !0 }
  },
  emits: ["edit-formula"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = _e(Ae), m = B(!1), h = B(!1), a = [
      [null, "Exact value"],
      ["day", "Day"],
      ["week", "Week"],
      ["month", "Month"],
      ["quarter", "Quarter"],
      ["year", "Year"],
      ["month_of_year", "Month of year"],
      ["day_of_week", "Day of week"]
    ], f = j(() => ["date", "datetime"].includes(l.item.type)), A = j(() => l.item.kind === "formula" ? "rg-chip--formula" : `rg-role rg-role--${l.item.kind === "measure" ? "measure" : l.item.role === "time" ? "time" : "dimension"}`), c = j(() => {
      var y;
      return l.item.kind === "formula" ? "fx" : l.item.kind === "measure" ? l.item.field === "__rows" ? "#" : kt[l.item.agg] : l.item.grain ? (y = a.find(([b]) => b === l.item.grain)) == null ? void 0 : y[1] : "";
    }), r = j(() => d.state.errorUid === l.item.uid);
    function o(y) {
      h.value = !0, y.dataTransfer.effectAllowed = "move", y.dataTransfer.setData("application/x-rg", JSON.stringify({ kind: "item", uid: l.item.uid })), y.dataTransfer.setData("text/plain", l.item.label);
    }
    function v(y) {
      d.updateItem(l.item.uid, y);
    }
    function T(y) {
      d.moveItem(l.item.uid, y), m.value = !1;
    }
    function E(y) {
      const p = d.state.draft[l.shelf].findIndex(($) => $.uid === l.item.uid);
      d.moveItem(l.item.uid, l.shelf, Math.max(0, p + y));
    }
    return (y, b) => (s(), n("div", pa, [
      e("span", {
        class: oe(["rg-chip", [A.value, { "rg-chip--error": r.value, "rg-chip--dragging": h.value }]]),
        draggable: "true",
        role: "button",
        tabindex: "0",
        "aria-label": `${t.item.label}: open options`,
        title: t.item.missing ? "This field is no longer in the data model" : t.item.label,
        onDragstart: o,
        onDragend: b[1] || (b[1] = (p) => h.value = !1),
        onClick: b[2] || (b[2] = (p) => m.value = !m.value),
        onKeydown: [
          b[3] || (b[3] = Ke(ge((p) => m.value = !m.value, ["prevent"]), ["enter"])),
          b[4] || (b[4] = Ke((p) => N(d).removeItem(t.item.uid), ["delete"])),
          b[5] || (b[5] = Ke(ge((p) => E(-1), ["alt", "prevent"]), ["left"])),
          b[6] || (b[6] = Ke(ge((p) => E(1), ["alt", "prevent"]), ["right"]))
        ]
      }, [
        t.item.missing ? (s(), ne(P, {
          key: 0,
          name: "alert",
          small: ""
        })) : M("", !0),
        e("span", fa, _(t.item.label), 1),
        c.value ? (s(), n("span", ba, _(c.value), 1)) : M("", !0),
        e("button", {
          type: "button",
          class: "rg-chip__x",
          "aria-label": `Remove ${t.item.label}`,
          onClick: b[0] || (b[0] = ge((p) => N(d).removeItem(t.item.uid), ["stop"]))
        }, [
          O(P, {
            name: "x",
            small: ""
          })
        ], 8, ha)
      ], 42, va),
      m.value ? (s(), ne(ot, {
        key: 0,
        onClose: b[16] || (b[16] = (p) => m.value = !1)
      }, {
        default: ie(() => [
          e("label", {
            for: `rg-chip-label-${t.item.uid}`
          }, [
            b[17] || (b[17] = F(" Column name ", -1)),
            e("input", {
              id: `rg-chip-label-${t.item.uid}`,
              class: "rg-input",
              value: t.item.label,
              maxlength: "120",
              onChange: b[7] || (b[7] = (p) => v({ label: p.target.value }))
            }, null, 40, $a)
          ], 8, ya),
          t.item.kind === "measure" && t.item.field !== "__rows" ? (s(), n("label", {
            key: 0,
            for: `rg-chip-agg-${t.item.uid}`
          }, [
            b[18] || (b[18] = F(" Calculate ", -1)),
            e("select", {
              id: `rg-chip-agg-${t.item.uid}`,
              class: "rg-select",
              value: t.item.agg,
              onChange: b[8] || (b[8] = (p) => v({ agg: p.target.value }))
            }, [
              (s(!0), n(q, null, K(t.item.aggregations, (p) => (s(), n("option", {
                key: p,
                value: p
              }, _(N(kt)[p]), 9, wa))), 128))
            ], 40, ka)
          ], 8, _a)) : M("", !0),
          t.item.kind === "dimension" && f.value ? (s(), n("label", {
            key: 1,
            for: `rg-chip-grain-${t.item.uid}`
          }, [
            b[19] || (b[19] = F(" Group dates by ", -1)),
            e("select", {
              id: `rg-chip-grain-${t.item.uid}`,
              class: "rg-select",
              value: t.item.grain ?? "",
              onChange: b[9] || (b[9] = (p) => v({ grain: p.target.value || null }))
            }, [
              (s(), n(q, null, K(a, ([p, $]) => e("option", {
                key: $,
                value: p ?? ""
              }, _($), 9, Sa)), 64))
            ], 40, Ca)
          ], 8, xa)) : M("", !0),
          t.item.kind !== "dimension" ? (s(), n("label", {
            key: 2,
            for: `rg-chip-format-${t.item.uid}`
          }, [
            b[20] || (b[20] = F(" Number format ", -1)),
            e("input", {
              id: `rg-chip-format-${t.item.uid}`,
              class: "rg-input rg-mono",
              value: t.item.format ?? "",
              placeholder: "#,##0.00 or 0.0%",
              maxlength: "64",
              onChange: b[10] || (b[10] = (p) => v({ format: p.target.value || null }))
            }, null, 40, Ta)
          ], 8, Ma)) : M("", !0),
          t.item.path ? (s(), n("p", Ea, "Uses a chosen join path.")) : M("", !0),
          e("div", Aa, [
            e("div", Oa, [
              t.item.kind === "formula" ? (s(), n("button", {
                key: 0,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: b[11] || (b[11] = (p) => {
                  i("edit-formula", t.item), m.value = !1;
                })
              }, [
                O(P, {
                  name: "fx",
                  small: ""
                }),
                b[21] || (b[21] = F(" Edit formula ", -1))
              ])) : M("", !0),
              t.item.kind !== "dimension" ? (s(), n("button", {
                key: 1,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: b[12] || (b[12] = (p) => {
                  N(d).filterOnTotal(t.item.uid), m.value = !1;
                })
              }, [
                O(P, {
                  name: "filter",
                  small: ""
                }),
                b[22] || (b[22] = F(" Filter on this ", -1))
              ])) : M("", !0),
              t.shelf === "values" && t.item.kind === "measure" && t.item.field !== "__rows" ? (s(), n("button", {
                key: 2,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: b[13] || (b[13] = (p) => T("rows"))
              }, "Move to Rows")) : M("", !0),
              t.shelf === "rows" ? (s(), n("button", {
                key: 3,
                type: "button",
                class: "rg-btn rg-btn--sm",
                onClick: b[14] || (b[14] = (p) => T("values"))
              }, "Move to Values")) : M("", !0)
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--danger rg-btn--ghost",
              onClick: b[15] || (b[15] = (p) => N(d).removeItem(t.item.uid))
            }, "Remove")
          ])
        ]),
        _: 1
      })) : M("", !0)
    ]));
  }
}, Da = { class: "rg-shelf" }, La = { class: "rg-shelf__title" }, Na = ["aria-label"], Va = {
  key: 0,
  class: "rg-drop-marker"
}, Fa = {
  key: 0,
  class: "rg-drop-marker"
}, Pa = {
  key: 1,
  class: "rg-shelf__empty"
}, al = {
  __name: "ShelfDrop",
  props: {
    shelf: { type: String, required: !0 },
    title: { type: String, required: !0 },
    empty: { type: String, required: !0 }
  },
  emits: ["edit-formula"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = _e(Ae), m = B(!1), h = B(null), a = B(null);
    function f(o) {
      try {
        return JSON.parse(o.dataTransfer.getData("application/x-rg"));
      } catch {
        return null;
      }
    }
    function A(o) {
      var E;
      const v = [...((E = a.value) == null ? void 0 : E.querySelectorAll(".rg-chip-wrap")) ?? []], T = getComputedStyle(a.value).direction === "rtl";
      for (let y = 0; y < v.length; y++) {
        const b = v[y].getBoundingClientRect(), p = b.left + b.width / 2, $ = T ? o.clientX > p : o.clientX < p;
        if (o.clientY < b.bottom && $) return y;
      }
      return v.length;
    }
    function c(o) {
      [...o.dataTransfer.types].includes("application/x-rg") && (o.preventDefault(), m.value = !0, h.value = A(o));
    }
    function r(o) {
      const v = f(o), T = h.value;
      m.value = !1, h.value = null, v && (v.kind === "field" && d.addField(v.dataset, v.field, l.shelf, T), v.kind === "item" && d.moveItem(v.uid, l.shelf, T));
    }
    return (o, v) => (s(), n("div", Da, [
      e("span", La, _(t.title), 1),
      e("div", {
        ref_key: "zone",
        ref: a,
        class: oe(["rg-shelf__drop", { "rg-shelf__drop--over": m.value }]),
        "aria-label": `${t.title} shelf`,
        onDragover: c,
        onDragleave: v[1] || (v[1] = ge((T) => {
          m.value = !1, h.value = null;
        }, ["self"])),
        onDrop: ge(r, ["prevent"])
      }, [
        (s(!0), n(q, null, K(N(d).state.draft[t.shelf], (T, E) => (s(), n(q, {
          key: T.uid
        }, [
          m.value && h.value === E ? (s(), n("span", Va)) : M("", !0),
          O(Ra, {
            item: T,
            shelf: t.shelf,
            onEditFormula: v[0] || (v[0] = (y) => i("edit-formula", y))
          }, null, 8, ["item", "shelf"])
        ], 64))), 128)),
        m.value && h.value === N(d).state.draft[t.shelf].length ? (s(), n("span", Fa)) : M("", !0),
        !N(d).state.draft[t.shelf].length && !m.value ? (s(), n("span", Pa, _(t.empty), 1)) : M("", !0),
        gt(o.$slots, "default")
      ], 42, Na)
    ]));
  }
}, Ua = ["aria-label", "onClick"], Ia = ["id", "inputmode", "placeholder"], qa = {
  key: 0,
  class: "rg-suggest",
  role: "listbox"
}, ja = ["onMousedown"], za = {
  __name: "ValueListInput",
  props: {
    modelValue: { type: Array, default: () => [] },
    field: { type: String, default: null },
    // dataset.field, null for free text
    numeric: { type: Boolean, default: !1 },
    inputId: { type: String, required: !0 }
  },
  emits: ["update:modelValue"],
  setup(t, { emit: u }) {
    const l = t, i = u, { api: d } = Fe(), m = B(""), h = B([]), a = B(!1);
    let f = null, A = 0;
    function c(T) {
      const E = l.numeric ? Number(T) : String(T).trim();
      E === "" || l.numeric && Number.isNaN(E) || (l.modelValue.includes(E) || i("update:modelValue", [...l.modelValue, E]), m.value = "", a.value = !1);
    }
    function r(T) {
      i("update:modelValue", l.modelValue.filter((E) => E !== T));
    }
    ye(m, (T) => {
      clearTimeout(f), l.field && (f = setTimeout(async () => {
        const E = ++A;
        try {
          const y = await d.query.values(l.field, T, 30);
          E === A && (h.value = y.filter((b) => !l.modelValue.includes(b)), a.value = !0);
        } catch {
          h.value = [];
        }
      }, 250));
    }), Ve(() => clearTimeout(f));
    function o() {
      setTimeout(() => a.value = !1, 150);
    }
    function v(T) {
      T.key === "Enter" || T.key === "," ? (T.preventDefault(), c(m.value)) : T.key === "Backspace" && !m.value && l.modelValue.length ? r(l.modelValue[l.modelValue.length - 1]) : T.key === "Escape" && (a.value = !1);
    }
    return (T, E) => (s(), n("span", {
      class: "rg-tags",
      onClick: E[2] || (E[2] = (y) => {
        var b;
        return (b = y.currentTarget.querySelector("input")) == null ? void 0 : b.focus();
      })
    }, [
      (s(!0), n(q, null, K(t.modelValue, (y) => (s(), n("span", {
        key: String(y),
        class: "rg-tag"
      }, [
        F(_(y) + " ", 1),
        e("button", {
          type: "button",
          "aria-label": `Remove ${y}`,
          onClick: ge((b) => r(y), ["stop"])
        }, "×", 8, Ua)
      ]))), 128)),
      le(e("input", {
        id: t.inputId,
        "onUpdate:modelValue": E[0] || (E[0] = (y) => m.value = y),
        inputmode: t.numeric ? "decimal" : "text",
        placeholder: t.modelValue.length ? "" : t.field ? "Type to search" : "Type and press Enter",
        autocomplete: "off",
        onKeydown: v,
        onFocus: E[1] || (E[1] = (y) => t.field && (m.value = m.value)),
        onBlur: o
      }, null, 40, Ia), [
        [ce, m.value]
      ]),
      a.value && h.value.length ? (s(), n("ul", qa, [
        (s(!0), n(q, null, K(h.value, (y) => (s(), n("li", {
          key: String(y)
        }, [
          e("button", {
            type: "button",
            role: "option",
            onMousedown: ge((b) => c(y), ["prevent"])
          }, _(y), 41, ja)
        ]))), 128))
      ])) : M("", !0)
    ]));
  }
}, Ba = ["id", "value"], Ka = ["id", "value"], Ga = ["value"], Ha = ["id", "value"], Wa = ["id", "value"], Ya = ["id", "type", "value"], Ja = ["id", "type", "value"], Qa = ["id", "type", "value"], Za = {
  __name: "FilterValue",
  props: { node: { type: Object, required: !0 } },
  emits: ["update"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = j(() => ["date", "datetime"].includes(l.node.type)), m = j(() => ["integer", "decimal"].includes(l.node.type) || l.node.isTotal), h = j(() => d.value ? "date" : m.value ? "number" : "text"), a = j(() => typeof l.node.value == "string" && tl.some(([o]) => o === l.node.value)), f = (o) => `rg-filter-${l.node.uid}-${o}`;
    function A(o) {
      i("update", { value: o });
    }
    function c(o, v) {
      const T = Array.isArray(l.node.value) ? [...l.node.value] : ["", ""];
      T[o] = m.value && v !== "" ? Number(v) : v, A(T);
    }
    function r(o) {
      A(m.value && o !== "" ? Number(o) : o);
    }
    return (o, v) => {
      var T, E, y, b;
      return ["is_null", "not_null"].includes(t.node.op) ? (s(), n(q, { key: 0 }, [], 64)) : t.node.type === "boolean" ? (s(), n("select", {
        key: 1,
        id: f("bool"),
        class: "rg-select",
        value: t.node.value === null ? "" : String(t.node.value),
        "aria-label": "Value",
        onChange: v[0] || (v[0] = (p) => A(p.target.value === "true"))
      }, [...v[7] || (v[7] = [
        e("option", {
          value: "",
          disabled: ""
        }, "Choose", -1),
        e("option", { value: "true" }, "Yes", -1),
        e("option", { value: "false" }, "No", -1)
      ])], 40, Ba)) : t.node.op === "between" && d.value ? (s(), n(q, { key: 2 }, [
        e("select", {
          id: f("preset"),
          class: "rg-select",
          value: a.value ? t.node.value : "custom",
          "aria-label": "Date range",
          onChange: v[1] || (v[1] = (p) => A(p.target.value === "custom" ? ["", ""] : p.target.value))
        }, [
          (s(!0), n(q, null, K(N(tl), ([p, $]) => (s(), n("option", {
            key: p,
            value: p
          }, _($), 9, Ga))), 128)),
          v[8] || (v[8] = e("option", { value: "custom" }, "Custom range…", -1))
        ], 40, Ka),
        a.value ? M("", !0) : (s(), n(q, { key: 0 }, [
          e("input", {
            id: f("from"),
            class: "rg-input",
            type: "date",
            "aria-label": "From",
            value: ((T = t.node.value) == null ? void 0 : T[0]) ?? "",
            onChange: v[2] || (v[2] = (p) => c(0, p.target.value))
          }, null, 40, Ha),
          v[9] || (v[9] = e("span", { class: "rg-faint" }, "to", -1)),
          e("input", {
            id: f("to"),
            class: "rg-input",
            type: "date",
            "aria-label": "To",
            value: ((E = t.node.value) == null ? void 0 : E[1]) ?? "",
            onChange: v[3] || (v[3] = (p) => c(1, p.target.value))
          }, null, 40, Wa)
        ], 64))
      ], 64)) : t.node.op === "between" ? (s(), n(q, { key: 3 }, [
        e("input", {
          id: f("from"),
          class: "rg-input",
          type: h.value,
          "aria-label": "From",
          style: { width: "110px" },
          value: ((y = t.node.value) == null ? void 0 : y[0]) ?? "",
          onChange: v[4] || (v[4] = (p) => c(0, p.target.value))
        }, null, 40, Ya),
        v[10] || (v[10] = e("span", { class: "rg-faint" }, "and", -1)),
        e("input", {
          id: f("to"),
          class: "rg-input",
          type: h.value,
          "aria-label": "To",
          style: { width: "110px" },
          value: ((b = t.node.value) == null ? void 0 : b[1]) ?? "",
          onChange: v[5] || (v[5] = (p) => c(1, p.target.value))
        }, null, 40, Ja)
      ], 64)) : ["in", "not_in"].includes(t.node.op) ? (s(), ne(za, {
        key: 4,
        "input-id": f("list"),
        "model-value": Array.isArray(t.node.value) ? t.node.value : [],
        field: t.node.target.includes(".") ? t.node.target : null,
        numeric: m.value,
        "onUpdate:modelValue": A
      }, null, 8, ["input-id", "model-value", "field", "numeric"])) : (s(), n("input", {
        key: 5,
        id: f("value"),
        class: "rg-input",
        type: h.value,
        "aria-label": "Value",
        style: Te({ width: d.value ? "auto" : "160px" }),
        value: t.node.value ?? "",
        onChange: v[6] || (v[6] = (p) => r(p.target.value))
      }, null, 44, Qa));
    };
  }
}, Xa = {
  key: 0,
  class: "rg-filter-row"
}, eo = {
  class: "rg-bool-toggle",
  role: "group",
  "aria-label": "How filters combine"
}, to = ["aria-pressed"], lo = ["aria-pressed"], so = ["title"], no = ["id", "value", "onChange"], ao = ["value"], oo = ["aria-label", "onClick"], ro = {
  key: 1,
  class: "rg-faint",
  style: { margin: "0", "font-size": "12px" }
}, io = /* @__PURE__ */ Object.assign({ name: "FilterGroupView" }, {
  __name: "FilterGroupView",
  props: {
    group: { type: Object, required: !0 },
    nested: { type: Boolean, default: !1 }
  },
  setup(t) {
    const u = t, l = _e(Ae);
    function i(m) {
      u.group.boolean = m;
    }
    function d(m) {
      let h = null;
      try {
        h = JSON.parse(m.dataTransfer.getData("application/x-rg"));
      } catch {
        return;
      }
      (h == null ? void 0 : h.kind) === "field" && l.addField(h.dataset, h.field, "filters", null, void 0, u.group.uid);
    }
    return (m, h) => {
      const a = Ol("FilterGroupView", !0);
      return s(), n("div", {
        class: oe(t.nested ? "rg-filter-group" : "rg-filters"),
        onDragover: h[3] || (h[3] = (f) => t.nested && [...f.dataTransfer.types].includes("application/x-rg") && f.preventDefault()),
        onDrop: h[4] || (h[4] = ge((f) => t.nested && (f.preventDefault(), d(f)), ["stop"]))
      }, [
        t.group.items.length > 1 || t.nested ? (s(), n("div", Xa, [
          h[5] || (h[5] = e("span", {
            class: "rg-faint",
            style: { "font-size": "12px" }
          }, "Match", -1)),
          e("span", eo, [
            e("button", {
              type: "button",
              "aria-pressed": t.group.boolean === "and" ? "true" : "false",
              onClick: h[0] || (h[0] = (f) => i("and"))
            }, "ALL", 8, to),
            e("button", {
              type: "button",
              "aria-pressed": t.group.boolean === "or" ? "true" : "false",
              onClick: h[1] || (h[1] = (f) => i("or"))
            }, "ANY", 8, lo)
          ]),
          h[6] || (h[6] = e("span", {
            class: "rg-faint",
            style: { "font-size": "12px" }
          }, "of these", -1)),
          t.nested ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn rg-btn--ghost rg-btn--sm",
            style: { "margin-inline-start": "auto" },
            onClick: h[2] || (h[2] = (f) => N(l).removeFilter(t.group.uid))
          }, "Remove group")) : M("", !0)
        ])) : M("", !0),
        (s(!0), n(q, null, K(t.group.items, (f) => (s(), n(q, {
          key: f.uid
        }, [
          f.items ? (s(), ne(a, {
            key: 0,
            group: f,
            nested: ""
          }, null, 8, ["group"])) : (s(), n("div", {
            key: 1,
            class: oe(["rg-filter-row", { "rg-filter-row--error": N(l).state.errorUid === f.uid }])
          }, [
            e("span", {
              class: "rg-filter-field",
              title: f.target
            }, [
              f.isTotal ? (s(), ne(P, {
                key: 0,
                name: "hash",
                small: ""
              })) : M("", !0),
              F(" " + _(f.label), 1)
            ], 8, so),
            e("select", {
              id: `rg-filter-${f.uid}-op`,
              class: "rg-select",
              "aria-label": "Condition",
              value: f.op,
              onChange: (A) => N(l).updateFilter(f, { op: A.target.value })
            }, [
              (s(!0), n(q, null, K(N(Pt)(f.type, f.isTotal), (A) => (s(), n("option", {
                key: A,
                value: A
              }, _(N(Ft)[A]), 9, ao))), 128))
            ], 40, no),
            O(Za, {
              node: f,
              onUpdate: (A) => N(l).updateFilter(f, A)
            }, null, 8, ["node", "onUpdate"]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--ghost rg-btn--sm rg-btn--icon",
              "aria-label": `Remove filter on ${f.label}`,
              onClick: (A) => N(l).removeFilter(f.uid)
            }, [
              O(P, {
                name: "x",
                small: ""
              })
            ], 8, oo)
          ], 2))
        ], 64))), 128)),
        t.nested && !t.group.items.length ? (s(), n("p", ro, " Drop fields here to add conditions to this group. ")) : M("", !0)
      ], 34);
    };
  }
}), At = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], uo = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], Ot = /* @__PURE__ */ new Map();
function ol(t, u, l) {
  const i = `${t}|${u}|${l}`;
  return Ot.has(i) || Ot.set(i, new Intl.NumberFormat("en", {
    minimumFractionDigits: t,
    maximumFractionDigits: t,
    useGrouping: u,
    style: l ? "percent" : "decimal"
  })), Ot.get(i);
}
function co(t) {
  if (!t) return null;
  const u = t.includes("%"), l = t.includes(",");
  return { decimals: (t.split(".")[1] ?? "").replace(/[^0#]/g, "").length, grouping: l, percent: u };
}
function fl(t, u, l = "decimal") {
  const i = typeof t == "number" ? t : Number(t);
  if (!Number.isFinite(i)) return String(t);
  const d = co(u);
  if (d) return ol(d.decimals, d.grouping, d.percent).format(i);
  const m = l === "integer" || Number.isInteger(i) ? 0 : 2;
  return ol(m, !0, !1).format(i);
}
function go(t) {
  const u = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(String(t));
  return u ? { year: +u[1], month: +u[2], day: +u[3], hour: u[4] !== void 0 ? +u[4] : null, minute: u[5] !== void 0 ? +u[5] : null } : null;
}
function mo(t, u = null, l = "date") {
  if (u === "month_of_year") return At[(+t - 1) % 12] ?? String(t);
  if (u === "day_of_week") return uo[(+t - 1) % 7] ?? String(t);
  if (u === "hour_of_day") return `${String(t).padStart(2, "0")}:00`;
  const i = go(t);
  if (!i) return String(t);
  const d = `${i.day} ${At[i.month - 1]} ${i.year}`;
  switch (u) {
    case "year":
      return String(i.year);
    case "quarter":
      return `Q${Math.floor((i.month - 1) / 3) + 1} ${i.year}`;
    case "month":
      return `${At[i.month - 1]} ${i.year}`;
    case "week":
      return `Week of ${d}`;
    case "hour":
      return `${d}, ${String(i.hour ?? 0).padStart(2, "0")}:00`;
    case "day":
      return d;
    default:
      return l === "datetime" && i.hour !== null ? `${d}, ${String(i.hour).padStart(2, "0")}:${String(i.minute).padStart(2, "0")}` : d;
  }
}
function we(t, u) {
  return t == null || t === "" ? u.kind === "measure" ? "–" : "(empty)" : u.grain || u.type === "date" || u.type === "datetime" ? mo(t, u.grain, u.type) : u.type === "boolean" ? t === !0 || t === 1 || t === "1" || t === "t" ? "Yes" : "No" : u.type === "integer" || u.type === "decimal" || u.kind === "measure" ? fl(t, u.format, u.type) : String(t);
}
function Xe(t) {
  return !t.grain && (t.kind === "measure" || t.type === "integer" || t.type === "decimal");
}
const po = {
  class: "rg-gridbar",
  role: "toolbar",
  "aria-label": "Grid"
}, vo = {
  class: "rg-gridbar__group",
  style: { position: "relative" }
}, fo = ["aria-expanded"], bo = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, ho = ["onDragstart", "onDrop"], yo = ["checked", "onChange"], $o = { class: "rg-colchooser__moves" }, _o = ["aria-label", "disabled", "onClick"], ko = ["aria-label", "disabled", "onClick"], wo = {
  key: 1,
  style: { position: "relative" }
}, xo = ["aria-expanded"], Co = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, So = { class: "rg-colchooser__head" }, Mo = { class: "rg-sorter__n" }, To = { class: "rg-sorter__col" }, Eo = ["aria-label"], Ao = ["aria-pressed", "onClick"], Oo = ["aria-pressed", "onClick"], Ro = ["aria-label", "disabled", "onClick"], Do = ["aria-label", "onClick"], Lo = {
  key: 0,
  class: "rg-faint rg-colchooser__hint"
}, No = ["value"], Vo = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "Row height"
}, Fo = ["aria-pressed"], Po = ["aria-pressed"], Uo = ["aria-pressed"], Io = ["aria-pressed"], qo = { class: "rg-gridbar__group rg-gridbar__end" }, jo = ["title"], zo = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "Browse"
}, Bo = ["aria-pressed"], Ko = ["aria-pressed", "disabled", "title"], Go = {
  __name: "GridToolbar",
  props: {
    columns: { type: Array, required: !0 },
    prefs: { type: Object, required: !0 },
    grouped: { type: Boolean, default: !1 },
    canTotal: { type: Boolean, default: !1 },
    summary: { type: Object, default: null },
    summaryLoading: { type: Boolean, default: !1 },
    /** Sort levels [{ field, dir }] and whether more than one can be set. */
    sort: { type: Array, default: () => [] },
    canSort: { type: Boolean, default: !1 }
  },
  emits: ["autosize", "sort"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = B(!1), m = (p) => {
      var $;
      return (($ = l.columns.find((L) => L.alias === p)) == null ? void 0 : $.label) ?? p;
    }, h = j(() => l.columns.filter((p) => !l.sort.some(($) => $.field === p.alias)));
    function a(p, $) {
      i("sort", l.sort.map((L, C) => C === p ? { ...L, ...$ } : L));
    }
    function f(p) {
      i("sort", l.sort.filter(($, L) => L !== p));
    }
    function A(p, $) {
      const L = [...l.sort], C = p + $;
      C < 0 || C >= L.length || (L.splice(C, 0, L.splice(p, 1)[0]), i("sort", L));
    }
    function c(p) {
      p && i("sort", [...l.sort, { field: p, dir: "asc" }]);
    }
    const r = B(!1), o = B(null), v = j(() => l.columns.filter((p) => l.prefs.hidden.includes(p.alias)).length);
    function T(p) {
      const $ = l.prefs.hidden;
      l.prefs.hidden = $.includes(p) ? $.filter((L) => L !== p) : [...$, p];
    }
    function E(p, $) {
      const L = l.columns.map((x) => x.alias), C = L.indexOf(p);
      C === -1 || $ < 0 || $ >= L.length || C === $ || (L.splice($, 0, L.splice(C, 1)[0]), l.prefs.order = L);
    }
    function y(p) {
      o.value !== null && (E(o.value, l.columns.findIndex(($) => $.alias === p)), o.value = null);
    }
    function b() {
      Object.assign(l.prefs, { hidden: [], order: [], widths: {} });
    }
    return (p, $) => (s(), n("div", po, [
      e("div", vo, [
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--sm",
          "aria-expanded": r.value,
          onClick: $[0] || ($[0] = (L) => r.value = !r.value)
        }, [
          O(P, {
            name: "table",
            small: ""
          }),
          $[14] || ($[14] = F(" Columns ", -1)),
          v.value ? (s(), n("span", bo, _(v.value) + " hidden", 1)) : M("", !0)
        ], 8, fo),
        r.value ? (s(), ne(ot, {
          key: 0,
          class: "rg-colchooser",
          onClose: $[3] || ($[3] = (L) => r.value = !1)
        }, {
          default: ie(() => [
            e("div", { class: "rg-colchooser__head" }, [
              $[15] || ($[15] = e("b", null, "Columns", -1)),
              e("button", {
                type: "button",
                class: "rg-linkish",
                onClick: b
              }, "Reset")
            ]),
            O(qe, {
              tag: "ul",
              name: "rg-list-move",
              class: "rg-colchooser__list"
            }, {
              default: ie(() => [
                (s(!0), n(q, null, K(t.columns, (L, C) => (s(), n("li", {
                  key: L.alias,
                  draggable: "true",
                  class: oe({ "is-dragging": o.value === L.alias }),
                  onDragstart: (x) => o.value = L.alias,
                  onDragend: $[1] || ($[1] = (x) => o.value = null),
                  onDragover: $[2] || ($[2] = ge(() => {
                  }, ["prevent"])),
                  onDrop: ge((x) => y(L.alias), ["prevent"])
                }, [
                  $[16] || ($[16] = e("span", {
                    class: "rg-colchooser__grip",
                    "aria-hidden": "true"
                  }, "⋮⋮", -1)),
                  e("label", null, [
                    e("input", {
                      type: "checkbox",
                      class: "rg-check",
                      checked: !t.prefs.hidden.includes(L.alias),
                      onChange: (x) => T(L.alias)
                    }, null, 40, yo),
                    F(" " + _(L.label), 1)
                  ]),
                  e("span", $o, [
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${L.label} up`,
                      disabled: C === 0,
                      onClick: (x) => E(L.alias, C - 1)
                    }, "↑", 8, _o),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${L.label} down`,
                      disabled: C === t.columns.length - 1,
                      onClick: (x) => E(L.alias, C + 1)
                    }, "↓", 8, ko)
                  ])
                ], 42, ho))), 128))
              ]),
              _: 1
            }),
            $[17] || ($[17] = e("p", { class: "rg-faint rg-colchooser__hint" }, "Drag to reorder. Drag a header's edge to resize it.", -1))
          ]),
          _: 1
        })) : M("", !0),
        t.canSort ? (s(), n("div", wo, [
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--sm",
            "aria-expanded": d.value,
            onClick: $[4] || ($[4] = (L) => d.value = !d.value)
          }, [
            O(P, {
              name: "sort",
              small: ""
            }),
            $[18] || ($[18] = F(" Sort ", -1)),
            t.sort.length ? (s(), n("span", Co, _(t.sort.length), 1)) : M("", !0)
          ], 8, xo),
          d.value ? (s(), ne(ot, {
            key: 0,
            class: "rg-sorter",
            onClose: $[7] || ($[7] = (L) => d.value = !1)
          }, {
            default: ie(() => [
              e("div", So, [
                $[19] || ($[19] = e("b", null, "Sort by", -1)),
                t.sort.length ? (s(), n("button", {
                  key: 0,
                  type: "button",
                  class: "rg-linkish",
                  onClick: $[5] || ($[5] = (L) => i("sort", []))
                }, "Clear")) : M("", !0)
              ]),
              O(qe, {
                tag: "ol",
                name: "rg-list-move",
                class: "rg-sorter__list"
              }, {
                default: ie(() => [
                  (s(!0), n(q, null, K(t.sort, (L, C) => (s(), n("li", {
                    key: L.field
                  }, [
                    e("span", Mo, _(C === 0 ? "Sort by" : "then"), 1),
                    e("b", To, _(m(L.field)), 1),
                    e("div", {
                      class: "rg-segmented",
                      role: "group",
                      "aria-label": `Direction for ${m(L.field)}`
                    }, [
                      e("button", {
                        type: "button",
                        "aria-pressed": L.dir === "asc",
                        onClick: (x) => a(C, { dir: "asc" })
                      }, "↑ Asc", 8, Ao),
                      e("button", {
                        type: "button",
                        "aria-pressed": L.dir === "desc",
                        onClick: (x) => a(C, { dir: "desc" })
                      }, "↓ Desc", 8, Oo)
                    ], 8, Eo),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${m(L.field)} up`,
                      disabled: C === 0,
                      onClick: (x) => A(C, -1)
                    }, "↑", 8, Ro),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Remove ${m(L.field)}`,
                      onClick: (x) => f(C)
                    }, [
                      O(P, {
                        name: "x",
                        small: ""
                      })
                    ], 8, Do)
                  ]))), 128))
                ]),
                _: 1
              }),
              t.sort.length ? M("", !0) : (s(), n("p", Lo, "Rows come in the database's order. Add a level, or Shift+click headers.")),
              t.sort.length < 5 && h.value.length ? (s(), n("select", {
                key: 1,
                class: "rg-input",
                "aria-label": "Add a sort level",
                onChange: $[6] || ($[6] = (L) => {
                  c(L.target.value), L.target.value = "";
                })
              }, [
                $[20] || ($[20] = e("option", { value: "" }, "+ Add a sort level…", -1)),
                (s(!0), n(q, null, K(h.value, (L) => (s(), n("option", {
                  key: L.alias,
                  value: L.alias
                }, _(L.label), 9, No))), 128))
              ], 32)) : M("", !0)
            ]),
            _: 1
          })) : M("", !0)
        ])) : M("", !0),
        e("div", Vo, [
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.density === "comfortable",
            title: "Comfortable rows",
            onClick: $[8] || ($[8] = (L) => t.prefs.density = "comfortable")
          }, "Comfortable", 8, Fo),
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.density === "compact",
            title: "Compact rows",
            onClick: $[9] || ($[9] = (L) => t.prefs.density = "compact")
          }, "Compact", 8, Po)
        ]),
        e("button", {
          type: "button",
          class: "rg-chip-toggle",
          "aria-pressed": t.prefs.freeze,
          title: "Keep the first column visible while scrolling sideways",
          onClick: $[10] || ($[10] = (L) => t.prefs.freeze = !t.prefs.freeze)
        }, " Freeze first column ", 8, Uo),
        t.canTotal ? (s(), n("button", {
          key: 2,
          type: "button",
          class: "rg-chip-toggle",
          "aria-pressed": t.prefs.totals,
          title: "Grand totals of the whole report, not just the loaded rows",
          onClick: $[11] || ($[11] = (L) => t.prefs.totals = !t.prefs.totals)
        }, " Σ Totals ", 8, Io)) : M("", !0)
      ]),
      e("div", qo, [
        t.summary ? (s(), n("span", {
          key: 0,
          class: "rg-faint rg-num",
          title: `${t.summary.duration_ms} ms`
        }, _(N(He)(t.summary.rows)) + " rows", 9, jo)) : M("", !0),
        e("div", zo, [
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.paging === "scroll",
            onClick: $[12] || ($[12] = (L) => t.prefs.paging = "scroll")
          }, "Scroll", 8, Bo),
          e("button", {
            type: "button",
            "aria-pressed": t.prefs.paging === "pages",
            disabled: t.grouped,
            title: t.grouped ? "Groups load as you open them; pages are for flat reports" : "Numbered pages",
            onClick: $[13] || ($[13] = (L) => t.prefs.paging = "pages")
          }, "Pages", 8, Ko)
        ])
      ])
    ]));
  }
}, Ho = { class: "rg-colmenu__title" }, Wo = {
  class: "rg-colmenu__group",
  role: "group",
  "aria-label": "Sort"
}, Yo = ["aria-pressed"], Jo = ["aria-pressed"], Qo = ["disabled"], Zo = { class: "rg-colmenu__label" }, Xo = ["value"], er = {
  key: 0,
  class: "rg-colmenu__range"
}, tr = ["type"], lr = ["type"], sr = ["type", "step"], nr = { class: "rg-colmenu__actions" }, ar = ["disabled"], or = {
  __name: "ColumnMenu",
  props: {
    column: { type: Object, required: !0 },
    /** 'asc' | 'desc' | null */
    sorted: { type: String, default: null },
    /** Position of this column among sort levels (1-based), 0 if unsorted. */
    level: { type: Number, default: 0 },
    canFilter: { type: Boolean, default: !1 },
    /** The column's current filter, if any: { op, value }. */
    filter: { type: Object, default: null }
  },
  emits: ["sort", "unsort", "filter", "unfilter", "hide", "close"],
  setup(t, { emit: u }) {
    var b, p, $, L;
    const l = t, i = u, d = j(() => l.column.kind !== "dimension"), m = j(() => {
      const C = l.column.type;
      return l.column.grain ? "date" : d.value ? ["date", "datetime"].includes(C) ? C : "decimal" : C ?? "string";
    }), h = j(() => Pt(m.value, d.value && !["date", "datetime"].includes(m.value)).filter((C) => C !== "in" || m.value !== "boolean")), a = j(() => ["integer", "decimal"].includes(m.value) ? "number" : ["date", "datetime"].includes(m.value) ? "date" : "text"), f = $e({
      op: ((b = l.filter) == null ? void 0 : b.op) ?? h.value[0],
      value: l.filter && !Array.isArray(l.filter.value) ? l.filter.value ?? "" : "",
      from: Array.isArray((p = l.filter) == null ? void 0 : p.value) ? l.filter.value[0] ?? "" : "",
      to: Array.isArray(($ = l.filter) == null ? void 0 : $.value) ? l.filter.value[1] ?? "" : "",
      list: ["in", "not_in"].includes((L = l.filter) == null ? void 0 : L.op) ? (l.filter.value ?? []).join(", ") : ""
    }), A = j(() => ["is_null", "not_null"].includes(f.op)), c = j(() => ["in", "not_in"].includes(f.op)), r = j(() => f.op === "between");
    function o(C) {
      return a.value === "number" ? C === "" || C === null ? null : Number(C) : m.value === "boolean" ? C === "true" || C === !0 : C;
    }
    const v = j(() => A.value ? null : r.value ? [o(f.from), o(f.to)] : c.value ? f.list.split(",").map((C) => C.trim()).filter(Boolean).map(o) : o(f.value)), T = j(() => {
      const C = v.value;
      return A.value ? !0 : Array.isArray(C) ? C.length > 0 && C.every((x) => x !== "" && x !== null && !Number.isNaN(x)) : C !== "" && C !== null && C !== void 0 && !Number.isNaN(C);
    });
    function E() {
      T.value && (i("filter", { op: f.op, value: v.value }), i("close"));
    }
    const y = j(() => ["integer", "decimal"].includes(m.value) ? ["1 → 9", "9 → 1"] : ["date", "datetime"].includes(m.value) ? ["Oldest first", "Newest first"] : ["A → Z", "Z → A"]);
    return (C, x) => (s(), ne(ot, {
      class: "rg-colmenu",
      onClose: x[12] || (x[12] = (w) => i("close"))
    }, {
      default: ie(() => [
        e("div", Ho, [
          e("b", null, _(t.column.label), 1)
        ]),
        e("div", Wo, [
          e("button", {
            type: "button",
            class: "rg-colmenu__item",
            "aria-pressed": t.sorted === "asc" && t.level <= 1,
            onClick: x[0] || (x[0] = (w) => {
              i("sort", "asc", !1), i("close");
            })
          }, [
            O(P, {
              name: "sort",
              small: ""
            }),
            F(" Sort " + _(y.value[0]), 1)
          ], 8, Yo),
          e("button", {
            type: "button",
            class: "rg-colmenu__item",
            "aria-pressed": t.sorted === "desc" && t.level <= 1,
            onClick: x[1] || (x[1] = (w) => {
              i("sort", "desc", !1), i("close");
            })
          }, [
            O(P, {
              name: "sort",
              small: "",
              class: "rg-flip"
            }),
            F(" Sort " + _(y.value[1]), 1)
          ], 8, Jo),
          e("button", {
            type: "button",
            class: "rg-colmenu__item",
            disabled: t.level === 1,
            onClick: x[2] || (x[2] = (w) => {
              i("sort", t.sorted === "asc" ? "desc" : "asc", !0), i("close");
            })
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            F(" " + _(t.level ? "Flip in the sort order" : "Then by this column"), 1)
          ], 8, Qo),
          t.sorted ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-colmenu__item",
            onClick: x[3] || (x[3] = (w) => {
              i("unsort"), i("close");
            })
          }, [
            O(P, {
              name: "x",
              small: ""
            }),
            x[13] || (x[13] = F(" Remove sort ", -1))
          ])) : M("", !0)
        ]),
        t.canFilter ? (s(), n("form", {
          key: 0,
          class: "rg-colmenu__filter",
          onSubmit: ge(E, ["prevent"])
        }, [
          e("span", Zo, [
            O(P, {
              name: "filter",
              small: ""
            }),
            F(" Filter " + _(d.value ? "totals" : "rows"), 1)
          ]),
          le(e("select", {
            "onUpdate:modelValue": x[4] || (x[4] = (w) => f.op = w),
            class: "rg-input",
            "aria-label": "Condition"
          }, [
            (s(!0), n(q, null, K(h.value, (w) => (s(), n("option", {
              key: w,
              value: w
            }, _(N(Ft)[w]), 9, Xo))), 128))
          ], 512), [
            [Ee, f.op]
          ]),
          A.value ? M("", !0) : (s(), n(q, { key: 0 }, [
            r.value ? (s(), n("div", er, [
              le(e("input", {
                "onUpdate:modelValue": x[5] || (x[5] = (w) => f.from = w),
                class: "rg-input",
                type: a.value,
                "aria-label": "From"
              }, null, 8, tr), [
                [_t, f.from]
              ]),
              x[14] || (x[14] = e("span", { class: "rg-faint" }, "and", -1)),
              le(e("input", {
                "onUpdate:modelValue": x[6] || (x[6] = (w) => f.to = w),
                class: "rg-input",
                type: a.value,
                "aria-label": "To"
              }, null, 8, lr), [
                [_t, f.to]
              ])
            ])) : c.value ? le((s(), n("input", {
              key: 1,
              "onUpdate:modelValue": x[7] || (x[7] = (w) => f.list = w),
              class: "rg-input",
              placeholder: "Values, separated by commas",
              "aria-label": "Values"
            }, null, 512)), [
              [ce, f.list]
            ]) : m.value === "boolean" ? le((s(), n("select", {
              key: 2,
              "onUpdate:modelValue": x[8] || (x[8] = (w) => f.value = w),
              class: "rg-input",
              "aria-label": "Value"
            }, [...x[15] || (x[15] = [
              e("option", { value: "true" }, "Yes", -1),
              e("option", { value: "false" }, "No", -1)
            ])], 512)), [
              [Ee, f.value]
            ]) : le((s(), n("input", {
              key: 3,
              "onUpdate:modelValue": x[9] || (x[9] = (w) => f.value = w),
              class: "rg-input",
              type: a.value,
              step: a.value === "number" ? "any" : void 0,
              "aria-label": "Value",
              placeholder: "Value"
            }, null, 8, sr)), [
              [_t, f.value]
            ])
          ], 64)),
          e("div", nr, [
            t.filter ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              onClick: x[10] || (x[10] = (w) => {
                i("unfilter"), i("close");
              })
            }, "Clear")) : M("", !0),
            e("button", {
              type: "submit",
              class: "rg-btn rg-btn--sm rg-btn--primary",
              disabled: !T.value
            }, "Apply filter", 8, ar)
          ])
        ], 32)) : M("", !0),
        t.column.alias !== "__tree" ? (s(), n("button", {
          key: 1,
          type: "button",
          class: "rg-colmenu__item rg-colmenu__hide",
          onClick: x[11] || (x[11] = (w) => {
            i("hide"), i("close");
          })
        }, [
          O(P, {
            name: "eyeOff",
            small: ""
          }),
          x[16] || (x[16] = F(" Hide column ", -1))
        ])) : M("", !0)
      ]),
      _: 1
    }));
  }
}, rr = ["aria-rowcount", "aria-busy"], ir = ["aria-sort", "data-sorted", "data-filtered"], ur = { class: "rg-th" }, dr = ["title", "onClick"], cr = { class: "rg-th__label" }, gr = {
  key: 0,
  class: "rg-sort",
  "aria-hidden": "true"
}, mr = { key: 0 }, pr = ["aria-label", "aria-expanded", "onClick"], vr = ["aria-label", "onMousedown", "onDblclick"], fr = {
  key: 0,
  class: "rg-grid__more"
}, br = ["colspan"], hr = ["onClick"], yr = ["onMousedown", "onMouseenter"], $r = {
  key: 0,
  class: "rg-tree"
}, _r = ["aria-expanded", "aria-label", "onClick"], kr = {
  key: 1,
  style: { width: "20px", display: "inline-block" }
}, wr = { key: 1 }, xr = ["colspan"], Cr = { key: 0 }, Sr = { class: "rg-grid__totals" }, Mr = { key: 0 }, Tr = {
  key: 1,
  class: "rg-muted",
  style: { padding: "10px 16px" }
}, Er = { class: "rg-gridfoot" }, Ar = {
  key: "stats",
  class: "rg-gridfoot__stats",
  "aria-live": "polite"
}, Or = { key: 0 }, Rr = { class: "rg-num" }, Dr = { key: 1 }, Lr = { class: "rg-num" }, Nr = { key: 2 }, Vr = { class: "rg-num" }, Fr = { key: 3 }, Pr = { class: "rg-num" }, Ur = { class: "rg-num" }, Ir = {
  key: "rows",
  class: "rg-gridfoot__stats rg-faint"
}, qr = { key: 0 }, jr = { key: 1 }, zr = ["title"], Br = {
  key: 3,
  class: "rg-gridfoot__hint"
}, Kr = {
  key: 0,
  class: "rg-pager",
  "aria-label": "Pages"
}, Gr = { class: "rg-pager__size" }, Hr = ["value"], Wr = ["disabled"], Yr = ["disabled"], Jr = { class: "rg-num" }, Qr = ["max", "value"], Zr = ["disabled"], Xr = ["disabled"], qt = {
  __name: "ResultGrid",
  setup(t, { expose: u }) {
    const l = _e(Ae), i = $e(/* @__PURE__ */ new Map()), d = $e(/* @__PURE__ */ new Set()), m = B([]), h = B(null), a = B(null);
    let f = 0, A = null;
    const c = { hidden: [], order: [], widths: {}, density: "comfortable", freeze: !0, totals: !0, paging: "scroll", pageSize: 100 }, r = $e({ ...c }), o = j(() => {
      var U;
      const V = typeof l.gridKey == "object" ? (U = l.gridKey) == null ? void 0 : U.value : l.gridKey;
      return V ? `rg-grid:${V}` : null;
    });
    function v() {
      if (Object.assign(r, { ...c, hidden: [], order: [], widths: {} }), !!o.value)
        try {
          const V = JSON.parse(window.localStorage.getItem(o.value) ?? "null");
          V && typeof V == "object" && Object.assign(r, V);
        } catch {
        }
    }
    function T() {
      if (o.value)
        try {
          window.localStorage.setItem(o.value, JSON.stringify(r));
        } catch {
        }
    }
    ye(r, T, { deep: !0 }), ye(o, v, { immediate: !0 });
    const E = j(() => l.state.draft), y = j(() => l.grouped.value), b = j(() => E.value.rows.map((V) => V.as)), p = j(() => Object.fromEntries([...E.value.rows, ...E.value.values].map((V) => [V.as, V]))), $ = (V) => JSON.stringify(V);
    function L(V) {
      const U = p.value[V.alias];
      return { ...V, grain: (U == null ? void 0 : U.kind) === "dimension" ? U.grain : null };
    }
    const C = j(() => {
      let V = m.value.filter((Y) => Y.alias !== "__subtotal").map(L);
      if (y.value) {
        const Y = new Set(b.value);
        V = V.filter((ee) => !Y.has(ee.alias));
      }
      const U = r.order;
      return [...V].sort((Y, ee) => {
        const re = U.indexOf(Y.alias), he = U.indexOf(ee.alias);
        return (re === -1 ? 1e6 : re) - (he === -1 ? 1e6 : he);
      });
    }), x = j(() => {
      const V = C.value.filter((Y) => !r.hidden.includes(Y.alias));
      return y.value ? [{
        alias: "__tree",
        label: E.value.rows.map((Y) => Y.label).join(" › "),
        kind: "dimension",
        type: "string",
        sortAlias: b.value[0]
      }, ...V] : V;
    });
    function w(V) {
      const U = r.widths[V.alias];
      return U ? { width: `${U}px`, minWidth: `${U}px`, maxWidth: `${U}px` } : null;
    }
    const ae = j(() => r.paging === "pages" && !y.value), ue = B(1), xe = j(() => {
      const V = [], U = (Y, ee) => {
        const re = i.get($(Y));
        re && (re.rows.forEach((he, Me) => {
          const ke = y.value ? [...Y, he[b.value[ee]]] : null, W = y.value ? $(ke) : `${$(Y)}#${Me}`;
          V.push({ row: he, level: ee, keys: ke, key: W }), y.value && d.has(W) && U(ke, ee + 1);
        }), re.hasMore && Y.length > 0 && V.push({ more: !0, keys: Y, level: ee, key: `${$(Y)}#more` }));
      };
      return U([], 0), V;
    }), te = j(() => xe.value.filter((V) => !V.more)), D = j(() => i.get($([])));
    async function J(V, U = !1) {
      const Y = $(V);
      i.has(Y) || i.set(Y, { rows: [], hasMore: !1, loading: !1 });
      const ee = i.get(Y);
      if (ee.loading) return;
      ee.loading = !0;
      const re = f;
      try {
        const he = ae.value && V.length === 0 ? r.pageSize : void 0, Me = ae.value && V.length === 0 ? (ue.value - 1) * r.pageSize : U ? ee.rows.length : 0, ke = await l.fetchRows({ keys: V, offset: Me, top: V.length === 0, size: he, fresh: ae.value && V.length === 0 && !U });
        if (re !== f) return;
        V.length === 0 && !U && (m.value = ke.columns), ee.rows = U ? [...ee.rows, ...ke.rows] : ke.rows, ee.hasMore = ke.page.has_more;
      } catch {
        re === f && !U && V.length === 0 && (ee.rows = []);
      } finally {
        ee.loading = !1;
      }
    }
    const I = B(null), R = B(!1), k = B(null);
    async function g() {
      if (I.value = null, k.value = null, !l.fetchSummary || !(r.totals || ae.value)) return;
      const V = f;
      R.value = !0;
      try {
        const U = await l.fetchSummary();
        V === f && (I.value = U);
      } catch (U) {
        V === f && (k.value = (U == null ? void 0 : U.message) ?? "Totals are not available.");
      } finally {
        V === f && (R.value = !1);
      }
    }
    const S = j(() => I.value ? Math.max(1, Math.ceil(I.value.rows / r.pageSize)) : null), X = j(() => r.totals && I.value && Object.keys(I.value.totals ?? {}).length ? I.value.totals : null);
    function se({ keepPage: V = !1 } = {}) {
      f++, i.clear(), d.clear(), de(), V || (ue.value = 1), l.runnable.value ? (J([]), V || g()) : (m.value = [], I.value = null), Qt(() => {
        var U, Y;
        return (Y = (U = h.value) == null ? void 0 : U.scrollTo) == null ? void 0 : Y.call(U, { top: 0 });
      });
    }
    ye(() => l.state.runSeq, () => se()), ye(() => [r.paging, r.pageSize], () => se()), ye(() => r.totals, (V) => V && !I.value && g());
    function pe(V) {
      var ee;
      const U = S.value ?? ((ee = D.value) != null && ee.hasMore ? ue.value + 1 : ue.value), Y = Math.min(Math.max(1, V), U);
      Y !== ue.value && (ue.value = Y, se({ keepPage: !0 }));
    }
    function Ce(V) {
      if (d.has(V.key)) {
        d.delete(V.key);
        return;
      }
      d.add(V.key), i.has(V.key) || J(V.keys);
    }
    function Ue(V) {
      return y.value && V.level < b.value.length - 1;
    }
    function Re(V, U) {
      const Y = Number(V.__subtotal ?? 0);
      if (!Y) return null;
      const ee = m.value.filter((he) => he.kind === "dimension").map((he) => he.alias), re = ee.indexOf(U);
      return re === -1 || re < ee.length - Y ? null : re === ee.length - Y ? Y === ee.length ? "Grand total" : "Total" : "";
    }
    function rt(V, U) {
      return U.alias === "__tree" ? b.value[V.level] : U.alias;
    }
    function mt(V, U) {
      return V.row[rt(V, U)];
    }
    function lt(V, U) {
      if (U.alias === "__tree") {
        const ee = b.value[V.level];
        return we(V.row[ee], L({ ...m.value.find((re) => re.alias === ee) ?? { type: "string", kind: "dimension" }, alias: ee }));
      }
      const Y = Re(V.row, U.alias);
      return Y !== null ? Y : we(V.row[U.alias], U);
    }
    function De(V, U) {
      const Y = rt(V, U), ee = V.row[Y];
      return ee == null && Re(V.row, Y) === null;
    }
    function je(V, U) {
      const Y = mt(V, U);
      return Xe(U) && typeof Y == "number" && Y < 0;
    }
    function Pe(V) {
      var Y;
      const U = V.sortAlias ?? V.alias;
      return ((Y = E.value.sort.find((ee) => ee.field === U)) == null ? void 0 : Y.dir) ?? null;
    }
    function st(V) {
      const U = V.sortAlias ?? V.alias;
      return E.value.sort.findIndex((Y) => Y.field === U) + 1;
    }
    function nt(V) {
      l.setSort ? l.setSort(V.slice(0, 5)) : V[0] && l.toggleSort(V[0].field);
    }
    function pt(V, U, Y = !1) {
      const ee = V.sortAlias ?? V.alias, re = E.value.sort.filter((ke) => ke.field !== ee);
      if (!Y) return nt([{ field: ee, dir: U }]);
      const he = E.value.sort.findIndex((ke) => ke.field === ee), Me = [...re];
      Me.splice(he === -1 ? Me.length : he, 0, { field: ee, dir: U }), nt(Me);
    }
    function vt(V) {
      const U = V.sortAlias ?? V.alias;
      nt(E.value.sort.filter((Y) => Y.field !== U));
    }
    function ft(V, U) {
      if (!V.shiftKey || !l.setSort) return l.toggleSort(U.sortAlias ?? U.alias);
      const Y = Pe(U);
      Y === "desc" ? vt(U) : pt(U, Y === "asc" ? "desc" : "asc", !0);
    }
    const Ye = B(null), G = (V) => {
      var U;
      return !!l.filterColumn && ((U = l.filterable) == null ? void 0 : U.value) !== !1 && V.alias !== "__tree";
    }, z = (V) => {
      var U;
      return ((U = l.columnFilter) == null ? void 0 : U.call(l, V.alias)) ?? null;
    };
    function H(V) {
      V.alias !== "__tree" && (r.hidden = [...r.hidden, V.alias]);
    }
    function Q(V) {
      if (V.alias === "__tree" || !X.value) return "";
      const U = X.value[V.alias];
      return U == null ? "" : we(U, V);
    }
    const Z = $e({ anchor: null, focus: null, dragging: !1 });
    function de() {
      Z.anchor = Z.focus = null, Z.dragging = !1;
    }
    const fe = j(() => !Z.anchor || !Z.focus ? null : {
      r1: Math.min(Z.anchor.r, Z.focus.r),
      r2: Math.max(Z.anchor.r, Z.focus.r),
      c1: Math.min(Z.anchor.c, Z.focus.c),
      c2: Math.max(Z.anchor.c, Z.focus.c)
    }), me = j(() => new Map(te.value.map((V, U) => [V.key, U])));
    function Je(V, U) {
      const Y = me.value.get(V.key), ee = fe.value;
      return !!ee && Y >= ee.r1 && Y <= ee.r2 && U >= ee.c1 && U <= ee.c2;
    }
    function be(V, U) {
      return Z.focus && me.value.get(V.key) === Z.focus.r && Z.focus.c === U;
    }
    function St(V, U, Y) {
      var re;
      if (V.button !== 0 || V.target.closest("button")) return;
      const ee = { r: me.value.get(U.key), c: Y };
      V.shiftKey && Z.anchor || (Z.anchor = ee), Z.focus = ee, Z.dragging = !0, (re = h.value) == null || re.focus({ preventScroll: !0 });
    }
    function bt(V, U) {
      Z.dragging && (Z.focus = { r: me.value.get(V.key), c: U });
    }
    function it() {
      Z.dragging = !1;
    }
    function ht() {
      const V = fe.value;
      if (!V) return [];
      const U = x.value.slice(V.c1, V.c2 + 1);
      return te.value.slice(V.r1, V.r2 + 1).map((Y) => U.map((ee) => ({
        column: ee,
        value: mt(Y, ee),
        text: De(Y, ee) ? "" : lt(Y, ee)
      })));
    }
    const Le = j(() => {
      const V = ht().flat();
      if (V.length < 2) return null;
      const U = V.filter((re) => re.value !== null && re.value !== void 0 && re.value !== ""), Y = V.filter((re) => Xe(re.column) && typeof re.value == "number").map((re) => re.value), ee = { cells: V.length, count: U.length, numbers: Y.length };
      if (Y.length) {
        const re = Y.reduce((he, Me) => he + Me, 0);
        Object.assign(ee, { sum: re, avg: re / Y.length, min: Math.min(...Y), max: Math.max(...Y) });
      }
      return ee;
    });
    async function Mt() {
      var Y;
      const V = ht();
      if (!V.length) return;
      const U = V.map((ee) => ee.map((re) => typeof re.value == "number" ? String(re.value) : re.text.replace(/[\t\n]/g, " ")).join("	")).join(`
`);
      try {
        await ((Y = navigator.clipboard) == null ? void 0 : Y.writeText(U)), yt.value = !0, setTimeout(() => yt.value = !1, 1200);
      } catch {
      }
    }
    const yt = B(!1);
    function El(V) {
      const U = V.ctrlKey || V.metaKey;
      if (U && V.key.toLowerCase() === "c" && fe.value) {
        V.preventDefault(), Mt();
        return;
      }
      if (U && V.key.toLowerCase() === "a" && te.value.length) {
        V.preventDefault(), Z.anchor = { r: 0, c: 0 }, Z.focus = { r: te.value.length - 1, c: x.value.length - 1 };
        return;
      }
      if (V.key === "Escape") {
        de();
        return;
      }
      const ee = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[V.key];
      if (!ee || !Z.focus) return;
      V.preventDefault();
      const re = getComputedStyle(h.value).direction === "rtl" && ee[1] !== 0, he = {
        r: Math.min(Math.max(0, Z.focus.r + ee[0]), te.value.length - 1),
        c: Math.min(Math.max(0, Z.focus.c + (re ? -ee[1] : ee[1])), x.value.length - 1)
      };
      Z.focus = he, V.shiftKey || (Z.anchor = he), Qt(() => {
        var Me, ke, W;
        return (W = (ke = (Me = h.value) == null ? void 0 : Me.querySelector(".rg-cell--focus")) == null ? void 0 : ke.scrollIntoView) == null ? void 0 : W.call(ke, { block: "nearest", inline: "nearest" });
      });
    }
    let Qe = null;
    function Al(V, U) {
      const Y = V.target.closest("th");
      Qe = { alias: U.alias, x: V.clientX, width: Y.getBoundingClientRect().width, rtl: getComputedStyle(Y).direction === "rtl" }, document.addEventListener("mousemove", Gt), document.addEventListener("mouseup", Ht, { once: !0 }), V.preventDefault();
    }
    function Gt(V) {
      if (!Qe) return;
      const U = (V.clientX - Qe.x) * (Qe.rtl ? -1 : 1);
      r.widths = { ...r.widths, [Qe.alias]: Math.round(Math.max(60, Math.min(800, Qe.width + U))) };
    }
    function Ht() {
      Qe = null, document.removeEventListener("mousemove", Gt);
    }
    function Wt(V) {
      const { [V.alias]: U, ...Y } = r.widths;
      r.widths = Y;
    }
    Se(() => {
      typeof IntersectionObserver < "u" && (A = new IntersectionObserver((V) => {
        var U;
        ae.value || V.some((Y) => Y.isIntersecting) && ((U = D.value) != null && U.hasMore) && !D.value.loading && J([], !0);
      }, { root: h.value, rootMargin: "200px" }), a.value && A.observe(a.value)), document.addEventListener("mouseup", it), l.runnable.value && l.state.runSeq > 0 && se();
    }), Ve(() => {
      A == null || A.disconnect(), document.removeEventListener("mouseup", it), Ht();
    }), u({ loadMore: () => J([], !0), summary: I, prefs: r, stats: Le, copySelection: Mt, goTo: pe, page: ue });
    const $t = (V) => fl(V, null);
    return (V, U) => {
      var Y, ee, re, he, Me, ke;
      return s(), n("div", {
        class: oe(["rg-gridbox", [`rg-gridbox--${r.density}`, { "rg-gridbox--frozen": r.freeze, "is-running": N(l).state.running }]])
      }, [
        U[16] || (U[16] = e("div", {
          class: "rg-progress",
          "aria-hidden": "true"
        }, null, -1)),
        O(Go, {
          columns: C.value,
          prefs: r,
          grouped: y.value,
          "can-total": !!N(l).fetchSummary,
          summary: I.value,
          "summary-loading": R.value,
          sort: E.value.sort,
          "can-sort": !!N(l).setSort,
          onSort: nt,
          onAutosize: U[0] || (U[0] = (W) => Wt(W))
        }, null, 8, ["columns", "prefs", "grouped", "can-total", "summary", "summary-loading", "sort", "can-sort"]),
        e("div", {
          ref_key: "wrap",
          ref: h,
          class: "rg-grid-wrap",
          tabindex: "0",
          role: "grid",
          "aria-rowcount": ((Y = I.value) == null ? void 0 : Y.rows) ?? void 0,
          "aria-busy": N(l).state.running ? "true" : "false",
          onKeydown: El
        }, [
          x.value.length ? (s(), n("table", {
            key: 0,
            class: oe(["rg-grid", { "rg-grid--selecting": Z.dragging }])
          }, [
            e("thead", null, [
              e("tr", null, [
                (s(!0), n(q, null, K(x.value, (W) => (s(), n("th", {
                  key: W.alias,
                  scope: "col",
                  class: oe({ "rg-num": N(Xe)(W) }),
                  style: Te(w(W)),
                  "aria-sort": Pe(W) === "asc" ? "ascending" : Pe(W) === "desc" ? "descending" : "none",
                  "data-sorted": Pe(W) || void 0,
                  "data-filtered": z(W) ? "true" : void 0
                }, [
                  e("div", ur, [
                    e("button", {
                      type: "button",
                      class: "rg-th__sort",
                      title: `Sort by ${W.label} (Shift+click to add a level)`,
                      onClick: (ve) => ft(ve, W)
                    }, [
                      e("span", cr, _(W.label), 1),
                      Pe(W) ? (s(), n("span", gr, [
                        F(_(Pe(W) === "asc" ? "↑" : "↓"), 1),
                        E.value.sort.length > 1 ? (s(), n("sup", mr, _(st(W)), 1)) : M("", !0)
                      ])) : M("", !0)
                    ], 8, dr),
                    e("button", {
                      type: "button",
                      class: oe(["rg-th__menu", { "is-active": !!z(W) }]),
                      "aria-label": `${W.label}: sort and filter`,
                      "aria-expanded": Ye.value === W.alias,
                      onClick: ge((ve) => Ye.value = Ye.value === W.alias ? null : W.alias, ["stop"])
                    }, [
                      O(P, {
                        name: z(W) ? "filter" : "more",
                        small: ""
                      }, null, 8, ["name"])
                    ], 10, pr),
                    Ye.value === W.alias ? (s(), ne(or, {
                      key: 0,
                      column: W,
                      sorted: Pe(W),
                      level: st(W),
                      "can-filter": G(W),
                      filter: z(W),
                      onSort: (ve, ze) => pt(W, ve, ze),
                      onUnsort: (ve) => vt(W),
                      onFilter: (ve) => N(l).filterColumn(W, ve),
                      onUnfilter: (ve) => N(l).filterColumn(W, null),
                      onHide: (ve) => H(W),
                      onClose: U[1] || (U[1] = (ve) => Ye.value = null)
                    }, null, 8, ["column", "sorted", "level", "can-filter", "filter", "onSort", "onUnsort", "onFilter", "onUnfilter", "onHide"])) : M("", !0)
                  ]),
                  e("span", {
                    class: "rg-resize",
                    role: "separator",
                    "aria-orientation": "vertical",
                    "aria-label": `Resize ${W.label}`,
                    title: "Drag to resize, double-click to fit",
                    onMousedown: (ve) => Al(ve, W),
                    onDblclick: (ve) => Wt(W)
                  }, null, 40, vr)
                ], 14, ir))), 128))
              ])
            ]),
            e("tbody", null, [
              (ee = D.value) != null && ee.loading && !D.value.rows.length ? (s(), n(q, { key: 0 }, K(8, (W) => e("tr", {
                key: `sk${W}`,
                class: "rg-row--skeleton"
              }, [
                (s(!0), n(q, null, K(x.value, (ve) => (s(), n("td", {
                  key: ve.alias
                }, [
                  e("span", {
                    class: "rg-skeleton",
                    style: Te({ width: `${40 + (W * 23 + ve.alias.length * 7) % 50}%` })
                  }, null, 4)
                ]))), 128))
              ])), 64)) : M("", !0),
              (s(!0), n(q, null, K(xe.value, (W) => (s(), n(q, {
                key: W.key
              }, [
                W.more ? (s(), n("tr", fr, [
                  e("td", {
                    colspan: x.value.length
                  }, [
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--sm rg-btn--ghost",
                      onClick: (ve) => J(W.keys, !0)
                    }, "Show more", 8, hr)
                  ], 8, br)
                ])) : (s(), n("tr", {
                  key: 1,
                  class: oe(["rg-row", { "rg-row--group": Ue(W), "rg-row--subtotal": Number(W.row.__subtotal) > 0 }])
                }, [
                  (s(!0), n(q, null, K(x.value, (ve, ze) => {
                    var Yt, Jt;
                    return s(), n("td", {
                      key: ve.alias,
                      class: oe({
                        "rg-num": N(Xe)(ve),
                        "rg-cell--empty": De(W, ve),
                        "rg-cell--negative": je(W, ve),
                        "rg-cell--selected": Je(W, ze),
                        "rg-cell--focus": be(W, ze)
                      }),
                      style: Te([w(ve), ze === 0 && y.value ? { paddingInlineStart: `${12 + W.level * 20}px` } : null]),
                      onMousedown: (Tt) => St(Tt, W, ze),
                      onMouseenter: (Tt) => bt(W, ze)
                    }, [
                      ze === 0 && y.value ? (s(), n("span", $r, [
                        Ue(W) ? (s(), n("button", {
                          key: 0,
                          type: "button",
                          class: "rg-tree__toggle",
                          "aria-expanded": d.has(W.key) ? "true" : "false",
                          "aria-label": `${d.has(W.key) ? "Collapse" : "Expand"} ${lt(W, ve)}`,
                          onClick: (Tt) => Ce(W)
                        }, [
                          O(P, {
                            name: (Yt = i.get(W.key)) != null && Yt.loading ? "loader" : "chevron",
                            small: "",
                            spin: !!((Jt = i.get(W.key)) != null && Jt.loading)
                          }, null, 8, ["name", "spin"])
                        ], 8, _r)) : (s(), n("span", kr)),
                        F(" " + _(lt(W, ve)), 1)
                      ])) : (s(), n(q, { key: 1 }, [
                        F(_(lt(W, ve)), 1)
                      ], 64))
                    ], 46, yr);
                  }), 128))
                ], 2))
              ], 64))), 128)),
              D.value && !D.value.rows.length && !D.value.loading && !N(l).state.error ? (s(), n("tr", wr, [
                e("td", {
                  colspan: x.value.length,
                  class: "rg-muted",
                  style: { "text-align": "center", height: "80px" }
                }, "No rows match these filters.", 8, xr)
              ])) : M("", !0)
            ]),
            X.value && ((re = D.value) != null && re.rows.length) ? (s(), n("tfoot", Cr, [
              e("tr", Sr, [
                (s(!0), n(q, null, K(x.value, (W, ve) => (s(), n("td", {
                  key: W.alias,
                  class: oe({ "rg-num": N(Xe)(W) }),
                  style: Te(w(W))
                }, [
                  ve === 0 && !Q(W) ? (s(), n("b", Mr, "Grand total")) : (s(), n(q, { key: 1 }, [
                    F(_(Q(W)), 1)
                  ], 64))
                ], 6))), 128))
              ])
            ])) : M("", !0)
          ], 2)) : M("", !0),
          e("div", {
            ref_key: "sentinel",
            ref: a,
            class: "rg-sentinel"
          }, null, 512),
          !ae.value && ((he = D.value) != null && he.hasMore) && ((Me = D.value) != null && Me.loading) && D.value.rows.length ? (s(), n("div", Tr, "Loading more…")) : M("", !0)
        ], 40, rr),
        e("footer", Er, [
          O(tt, {
            name: "rg-swap",
            mode: "out-in"
          }, {
            default: ie(() => [
              Le.value ? (s(), n("div", Ar, [
                Le.value.numbers ? (s(), n("span", Or, [
                  U[8] || (U[8] = F("Sum ", -1)),
                  e("b", Rr, _($t(Le.value.sum)), 1)
                ])) : M("", !0),
                Le.value.numbers ? (s(), n("span", Dr, [
                  U[9] || (U[9] = F("Average ", -1)),
                  e("b", Lr, _($t(Le.value.avg)), 1)
                ])) : M("", !0),
                Le.value.numbers ? (s(), n("span", Nr, [
                  U[10] || (U[10] = F("Min ", -1)),
                  e("b", Vr, _($t(Le.value.min)), 1)
                ])) : M("", !0),
                Le.value.numbers ? (s(), n("span", Fr, [
                  U[11] || (U[11] = F("Max ", -1)),
                  e("b", Pr, _($t(Le.value.max)), 1)
                ])) : M("", !0),
                e("span", null, [
                  U[12] || (U[12] = F("Count ", -1)),
                  e("b", Ur, _(N(He)(Le.value.count)), 1)
                ]),
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--sm rg-btn--ghost",
                  title: "Copy (Ctrl+C)",
                  onClick: Mt
                }, [
                  O(P, {
                    name: yt.value ? "check" : "copy",
                    small: ""
                  }, null, 8, ["name"]),
                  F(" " + _(yt.value ? "Copied" : "Copy"), 1)
                ])
              ])) : (s(), n("div", Ir, [
                I.value ? (s(), n("span", qr, _(N(He)(I.value.rows)) + " " + _(I.value.rows === 1 ? "row" : "rows"), 1)) : R.value ? (s(), n("span", jr, [
                  O(P, {
                    name: "loader",
                    spin: "",
                    small: ""
                  }),
                  U[13] || (U[13] = F(" Counting…", -1))
                ])) : k.value ? (s(), n("span", {
                  key: 2,
                  title: k.value
                }, "Total rows unavailable", 8, zr)) : M("", !0),
                te.value.length ? (s(), n("span", Br, "Click and drag to select cells")) : M("", !0)
              ]))
            ]),
            _: 1
          }),
          ae.value ? (s(), n("nav", Kr, [
            e("label", Gr, [
              U[14] || (U[14] = F(" Rows per page ", -1)),
              le(e("select", {
                "onUpdate:modelValue": U[2] || (U[2] = (W) => r.pageSize = W),
                class: "rg-input"
              }, [
                (s(), n(q, null, K([50, 100, 200, 500, 1e3], (W) => e("option", {
                  key: W,
                  value: W
                }, _(W), 9, Hr)), 64))
              ], 512), [
                [
                  Ee,
                  r.pageSize,
                  void 0,
                  { number: !0 }
                ]
              ])
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "First page",
              disabled: ue.value === 1,
              onClick: U[3] || (U[3] = (W) => pe(1))
            }, "«", 8, Wr),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "Previous page",
              disabled: ue.value === 1,
              onClick: U[4] || (U[4] = (W) => pe(ue.value - 1))
            }, "‹", 8, Yr),
            e("span", Jr, [
              U[15] || (U[15] = F("Page ", -1)),
              e("input", {
                class: "rg-input rg-pager__input",
                type: "number",
                min: "1",
                max: S.value ?? void 0,
                value: ue.value,
                "aria-label": "Page",
                onChange: U[5] || (U[5] = (W) => pe(Number(W.target.value)))
              }, null, 40, Qr),
              S.value ? (s(), n(q, { key: 0 }, [
                F(" of " + _(N(He)(S.value)), 1)
              ], 64)) : M("", !0)
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "Next page",
              disabled: S.value ? ue.value >= S.value : !((ke = D.value) != null && ke.hasMore),
              onClick: U[6] || (U[6] = (W) => pe(ue.value + 1))
            }, "›", 8, Zr),
            S.value ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--icon rg-btn--ghost",
              "aria-label": "Last page",
              disabled: ue.value >= S.value,
              onClick: U[7] || (U[7] = (W) => pe(S.value))
            }, "»", 8, Xr)) : M("", !0)
          ])) : M("", !0)
        ])
      ], 2);
    };
  }
}, ei = {
  class: "rg-results",
  "aria-label": "Results"
}, ti = {
  class: "rg-statusbar",
  role: "status",
  "aria-live": "polite"
}, li = { class: "rg-num" }, si = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, ni = {
  key: 1,
  class: "rg-num",
  title: "How many rows the database expects to read"
}, ai = {
  key: 2,
  class: "rg-badge rg-badge--warning",
  title: "Large enough that exporting it will run in the background"
}, oi = {
  key: 2,
  class: "rg-faint"
}, ri = ["aria-expanded"], ii = {
  key: 0,
  class: "rg-mono",
  style: { margin: "0", padding: "10px 16px", "max-height": "160px", overflow: "auto", background: "var(--rg-sunken)", "white-space": "pre-wrap", "font-size": "11.5px" }
}, ui = {
  key: 1,
  class: "rg-errorbox",
  role: "alert"
}, di = { class: "rg-errorbox__title" }, ci = {
  key: 0,
  class: "rg-errorbox__options"
}, gi = ["onClick"], mi = {
  key: 0,
  class: "rg-badge rg-badge--warning"
}, pi = {
  __name: "ResultsPanel",
  setup(t) {
    const u = _e(Ae), l = B(!1), i = j(() => u.state.meta), d = j(() => u.state.error), m = {
      detail: "Rows",
      aggregate: "Totals",
      multi_fact: "Totals per branch, combined (no double counting)"
    }, h = {
      AMBIGUOUS_PATH: "Choose how to connect the tables",
      FAN_TRAP: "These fields cannot be totalled together",
      TIMEOUT: "The report took too long",
      TOO_HEAVY: "The report would read too much data",
      DATASET_FORBIDDEN: "No access",
      NO_TOPICS: "No topics yet",
      TOO_MANY_QUERIES: "Too many reports running",
      SERVER_BUSY: "The report server is busy"
    };
    return (a, f) => {
      var A, c, r;
      return s(), n("section", ei, [
        e("div", ti, [
          N(u).state.running ? (s(), n(q, { key: 0 }, [
            e("span", null, [
              O(P, {
                name: "loader",
                spin: "",
                small: ""
              }),
              f[2] || (f[2] = F(" Running…", -1))
            ]),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              onClick: f[0] || (f[0] = (o) => {
                N(u).cancelRunning(), N(u).state.running = !1;
              })
            }, [
              O(P, {
                name: "stop",
                small: ""
              }),
              f[3] || (f[3] = F(" Stop ", -1))
            ])
          ], 64)) : i.value && !d.value ? (s(), n(q, { key: 1 }, [
            e("span", null, _(m[i.value.mode] ?? i.value.mode), 1),
            e("span", li, _(i.value.duration_ms) + " ms", 1),
            i.value.cached ? (s(), n("span", si, "from cache")) : M("", !0),
            i.value.estimated_rows !== void 0 ? (s(), n("span", ni, " reads ~" + _(N(He)(i.value.estimated_rows)) + " rows ", 1)) : M("", !0),
            i.value.heavy ? (s(), n("span", ai, "heavy")) : M("", !0)
          ], 64)) : N(u).runnable.value ? M("", !0) : (s(), n("span", oi, "Add fields to see results.")),
          f[4] || (f[4] = e("span", { class: "rg-spacer" }, null, -1)),
          (A = i.value) != null && A.sql ? (s(), n("button", {
            key: 3,
            type: "button",
            class: "rg-btn rg-btn--sm rg-btn--ghost",
            "aria-expanded": l.value,
            onClick: f[1] || (f[1] = (o) => l.value = !l.value)
          }, _(l.value ? "Hide SQL" : "SQL"), 9, ri)) : M("", !0)
        ]),
        e("div", null, [
          l.value && ((c = i.value) != null && c.sql) ? (s(), n("pre", ii, _(i.value.sql), 1)) : M("", !0),
          d.value ? (s(), n("div", ui, [
            e("span", di, [
              O(P, {
                name: "alert",
                small: ""
              }),
              F(_(h[d.value.code] ?? "This report cannot run yet"), 1)
            ]),
            e("span", null, _(d.value.message), 1),
            d.value.code === "AMBIGUOUS_PATH" && N(u).state.errorUid ? (s(), n("div", ci, [
              (s(!0), n(q, null, K(((r = d.value.details) == null ? void 0 : r.options) ?? [], (o) => (s(), n("button", {
                key: o.path.join("."),
                type: "button",
                class: "rg-btn",
                onClick: (v) => N(u).applyPath(N(u).state.errorUid, o.path)
              }, [
                F(_(o.description) + " ", 1),
                o.multiplies_rows ? (s(), n("span", mi, "several per row")) : M("", !0)
              ], 8, gi))), 128))
            ])) : M("", !0)
          ])) : M("", !0)
        ]),
        O(qt)
      ]);
    };
  }
}, vi = /* @__PURE__ */ new Set(["AND", "OR", "NOT", "TRUE", "FALSE", "NULL"]);
function bl(t) {
  const u = [];
  let l = 0, i = 0;
  for (; l < t.length; ) {
    const d = t[l];
    if (d === "'" || d === '"') {
      l > i && u.push({ code: !0, text: t.slice(i, l) });
      let m = l + 1;
      for (; m < t.length && t[m] !== d; ) m++;
      u.push({ code: !1, text: t.slice(l, m + 1) }), l = m + 1, i = l;
    } else l++;
  }
  return i < t.length && u.push({ code: !0, text: t.slice(i) }), u;
}
function fi(t, u) {
  const l = /* @__PURE__ */ new Map();
  for (const m of u)
    l.set(String(m.label ?? "").trim().toLowerCase(), m.as), l.set(String(m.as).toLowerCase(), m.as);
  const i = [];
  return { formula: bl(t).map((m) => m.code ? m.text.replace(/\[([^\]]+)\]/g, (h, a) => {
    const f = l.get(a.trim().toLowerCase());
    return f || i.push(a.trim()), f ?? `[${a}]`;
  }) : m.text).join(""), unknown: i };
}
function bi(t, u) {
  const l = new Map(u.map((i) => [i.as, i.label ?? i.as]));
  return bl(t ?? "").map((i) => i.code ? i.text.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b(\s*\()?/g, (d, m, h) => h || vi.has(m.toUpperCase()) || !l.has(m) ? d : `[${l.get(m)}]`) : i.text).join("");
}
const hi = ["aria-label"], yi = { class: "rg-dialog__head" }, $i = { class: "rg-dialog__body" }, _i = { class: "rg-dialog__foot" }, We = {
  __name: "RgDialog",
  props: { title: { type: String, required: !0 } },
  emits: ["close"],
  setup(t, { emit: u }) {
    const l = u, i = B(null);
    function d(m) {
      m.key === "Escape" && l("close");
    }
    return Se(() => {
      var m, h, a;
      document.addEventListener("keydown", d), (a = ((m = i.value) == null ? void 0 : m.querySelector(".rg-dialog__body textarea, .rg-dialog__body input, .rg-dialog__body button")) ?? ((h = i.value) == null ? void 0 : h.querySelector(".rg-dialog__foot button"))) == null || a.focus();
    }), Ve(() => document.removeEventListener("keydown", d)), (m, h) => (s(), ne(ul, { to: "body" }, [
      e("div", dl({ class: "rg-root rg-overlay" }, m.$attrs, {
        onMousedown: h[1] || (h[1] = ge((a) => l("close"), ["self"]))
      }), [
        e("div", {
          ref_key: "dialog",
          ref: i,
          class: "rg-dialog",
          role: "dialog",
          "aria-modal": "true",
          "aria-label": t.title
        }, [
          e("div", yi, [
            e("h2", null, _(t.title), 1),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--ghost rg-btn--icon rg-btn--sm rg-dialog__close",
              "aria-label": "Close",
              onClick: h[0] || (h[0] = (a) => l("close"))
            }, [
              O(P, {
                name: "x",
                small: ""
              })
            ])
          ]),
          e("div", $i, [
            gt(m.$slots, "default")
          ]),
          e("div", _i, [
            gt(m.$slots, "footer")
          ])
        ], 8, hi)
      ], 16)
    ]));
  }
}, ki = {
  key: 0,
  class: "rg-quick",
  "aria-label": "Quick formulas"
}, wi = { class: "rg-quick__head" }, xi = { class: "rg-quick__kinds" }, Ci = ["aria-pressed", "onClick"], Si = {
  key: 0,
  class: "rg-quick__pick"
}, Mi = ["value"], Ti = { key: 0 }, Ei = ["value"], Ai = ["disabled"], Oi = {
  key: 1,
  class: "rg-faint"
}, Ri = { class: "rg-formula-row" }, Di = {
  class: "rg-formula-field",
  for: "rg-formula-label"
}, Li = {
  class: "rg-formula-field rg-formula-field--format",
  for: "rg-formula-format"
}, Ni = ["value"], Vi = {
  class: "rg-formula-field",
  for: "rg-formula-text"
}, Fi = ["data-state"], Pi = ["onKeydown"], Ui = {
  key: "c",
  class: "rg-check-result"
}, Ii = { class: "rg-formula-help" }, qi = { class: "rg-token-list" }, ji = ["data-kind", "title", "onClick"], zi = {
  key: 0,
  class: "rg-faint",
  style: { "font-size": "12px" }
}, Bi = { class: "rg-formula-help__title" }, Ki = { class: "rg-token-list" }, Gi = ["title", "onClick"], Hi = ["disabled"], Wi = {
  __name: "FormulaDialog",
  props: { item: { type: Object, default: null } },
  emits: ["close"],
  setup(t, { emit: u }) {
    var I, R;
    const l = t, i = u, d = _e(Ae), m = _e("rg-theme", "light"), { api: h } = Fe(), a = j(() => [...d.state.draft.rows, ...d.state.draft.values].filter((k) => {
      var g;
      return k.uid !== ((g = l.item) == null ? void 0 : g.uid);
    })), f = j(() => a.value.filter((k) => k.kind !== "dimension" && !["date", "datetime"].includes(k.type) || k.kind === "formula" || k.kind === "dimension" && ["integer", "decimal"].includes(k.type))), A = j(() => a.value.filter((k) => ["date", "datetime"].includes(k.type) || k.grain)), c = B(((I = l.item) == null ? void 0 : I.label) ?? ""), r = B(l.item ? bi(l.item.formula, a.value) : ""), o = B(((R = l.item) == null ? void 0 : R.format) ?? ""), v = B(null), T = B(null), E = B(!1), y = $e({ kind: "", a: "", b: "" }), b = [
      ["", "Automatic"],
      ["#,##0", "Whole number"],
      ["#,##0.00", "2 decimals"],
      ["0.0%", "Percent (0.25 → 25.0%)"]
    ], p = [
      { kind: "ratio", label: "A per B", hint: "Amount per visit", needs: "numbers", make: (k, g) => [`SAFE_DIVIDE([${k}], [${g}])`, `${k} per ${g}`, "#,##0.00"] },
      { kind: "share", label: "A as % of B", hint: "Coverage, achievement", needs: "numbers", make: (k, g) => [`SAFE_DIVIDE([${k}], [${g}])`, `${k} % of ${g}`, "0.0%"] },
      { kind: "diff", label: "A − B", hint: "Target minus actual", needs: "numbers", make: (k, g) => [`[${k}] - [${g}]`, `${k} − ${g}`, ""] },
      { kind: "sum", label: "A + B", hint: "Add two numbers", needs: "numbers", make: (k, g) => [`[${k}] + [${g}]`, `${k} + ${g}`, ""] },
      { kind: "growth", label: "Change % from B to A", hint: "This month vs last", needs: "numbers", make: (k, g) => [`SAFE_DIVIDE([${k}] - [${g}], [${g}])`, `Change in ${k}`, "0.0%"] },
      { kind: "days", label: "Days from A to B", hint: "Plan to visit, order to delivery", needs: "dates", make: (k, g) => [`DAYS_BETWEEN([${k}], [${g}])`, `Days from ${k} to ${g}`, "#,##0"] },
      { kind: "band", label: "Label A as High / Low", hint: "Above or below a threshold", needs: "numbers", one: !0, make: (k) => [`IF([${k}] >= 100, 'High', 'Low')`, `${k} level`, ""] }
    ], $ = j(() => p.find((k) => k.kind === y.kind) ?? null), L = j(() => {
      var k;
      return ((k = $.value) == null ? void 0 : k.needs) === "dates" ? A.value : f.value;
    }), C = j(() => !!$.value && !!y.a && ($.value.one || !!y.b));
    function x(k) {
      Object.assign(y, { kind: y.kind === k ? "" : k, a: "", b: "" });
    }
    function w() {
      if (!C.value) return;
      const [k, g, S] = $.value.make(y.a, y.b);
      r.value = k, c.value = g, o.value = S, y.kind = "";
    }
    const ae = [
      ["Numbers", [
        ["SAFE_DIVIDE(a, b)", "SAFE_DIVIDE(, )", "a ÷ b, empty when b is 0"],
        ["PERCENT(a, b)", "PERCENT(, )", "a as a percentage of b (0–100)"],
        ["ROUND(x, 2)", "ROUND(, 2)", "Round to decimals"],
        ["ABS(x)", "ABS()", "Without the sign"],
        ["GREATEST(a, b)", "GREATEST(, )", "The larger"],
        ["LEAST(a, b)", "LEAST(, )", "The smaller"]
      ]],
      ["Logic", [
        ["IF(test, then, else)", "IF(, , )", "Choose by a condition"],
        ["COALESCE(a, 0)", "COALESCE(, 0)", "First value that is not empty"],
        ["NULLIF(a, b)", "NULLIF(, )", "Empty when a equals b"]
      ]],
      ["Dates & text", [
        ["DAYS_BETWEEN(a, b)", "DAYS_BETWEEN(, )", "Days from date a to date b"],
        ["CONCAT(a, b)", "CONCAT(, )", "Join text"],
        ["UPPER(x)", "UPPER()", "Capital letters"],
        ["LOWER(x)", "LOWER()", "Small letters"]
      ]]
    ];
    function ue(k) {
      const g = v.value, S = (g == null ? void 0 : g.selectionStart) ?? r.value.length, X = (g == null ? void 0 : g.selectionEnd) ?? r.value.length;
      r.value = r.value.slice(0, S) + k + r.value.slice(X), requestAnimationFrame(() => {
        g == null || g.focus();
        const se = S + (k.includes("(") ? k.indexOf("(") + 1 : k.length);
        g == null || g.setSelectionRange(se, se);
      });
    }
    const xe = j(() => fi(r.value, a.value));
    async function te() {
      if (!r.value.trim())
        return T.value = null, !1;
      if (xe.value.unknown.length)
        return T.value = { ok: !1, message: `There is no column named "${xe.value.unknown[0]}" in this report.` }, !1;
      E.value = !0;
      try {
        const k = JSON.parse(JSON.stringify(d.state.draft)), g = { uid: "__probe", kind: "formula", label: c.value || "Formula", formula: xe.value.formula, as: "__formula_check", format: null };
        return l.item ? k.values = k.values.map((S) => S.uid === l.item.uid ? { ...g, as: S.as } : S) : k.values.push(g), await h.query.validate(vl(k).definition), T.value = { ok: !0, message: "Looks good." }, !0;
      } catch (k) {
        return T.value = { ok: !1, message: k.message }, !1;
      } finally {
        E.value = !1;
      }
    }
    let D = null;
    ye(r, () => {
      T.value = null, clearTimeout(D), D = setTimeout(te, 650);
    }), Ve(() => clearTimeout(D));
    async function J() {
      if (!c.value.trim() || !r.value.trim() || !await te()) return;
      const k = xe.value.formula.trim();
      if (l.item) d.updateFormula(l.item.uid, c.value.trim(), k, o.value || null);
      else {
        const g = d.addFormula(c.value.trim(), k);
        o.value && d.updateItem(g.uid, { format: o.value });
      }
      i("close");
    }
    return (k, g) => (s(), ne(We, {
      title: t.item ? "Edit formula" : "New formula",
      "data-rg-theme": N(m),
      class: "rg-dialog--wide rg-formula-dialog",
      onClose: g[6] || (g[6] = (S) => i("close"))
    }, {
      footer: ie(() => [
        g[20] || (g[20] = e("span", { class: "rg-faint rg-dialog__why" }, "Ctrl+Enter to save", -1)),
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: g[5] || (g[5] = (S) => i("close"))
        }, "Cancel"),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--primary",
          disabled: E.value || !c.value.trim() || !r.value.trim(),
          onClick: J
        }, _(t.item ? "Save formula" : "Add formula"), 9, Hi)
      ]),
      default: ie(() => [
        t.item ? M("", !0) : (s(), n("section", ki, [
          e("div", wi, [
            O(P, {
              name: "sparkle",
              small: ""
            }),
            g[7] || (g[7] = F()),
            g[8] || (g[8] = e("b", null, "Quick formula", -1)),
            g[9] || (g[9] = F()),
            g[10] || (g[10] = e("span", { class: "rg-faint" }, "pick one, then the columns", -1))
          ]),
          e("div", xi, [
            (s(), n(q, null, K(p, (S) => e("button", {
              key: S.kind,
              type: "button",
              class: "rg-quick__kind",
              "aria-pressed": y.kind === S.kind,
              onClick: (X) => x(S.kind)
            }, [
              e("b", null, _(S.label), 1),
              e("small", null, _(S.hint), 1)
            ], 8, Ci)), 64))
          ]),
          O(tt, { name: "rg-swap" }, {
            default: ie(() => [
              $.value ? (s(), n("div", Si, [
                e("label", null, [
                  g[12] || (g[12] = F("A ", -1)),
                  le(e("select", {
                    "onUpdate:modelValue": g[0] || (g[0] = (S) => y.a = S),
                    class: "rg-input"
                  }, [
                    g[11] || (g[11] = e("option", {
                      value: "",
                      disabled: ""
                    }, "Column…", -1)),
                    (s(!0), n(q, null, K(L.value, (S) => (s(), n("option", {
                      key: S.uid,
                      value: S.label
                    }, _(S.label), 9, Mi))), 128))
                  ], 512), [
                    [Ee, y.a]
                  ])
                ]),
                $.value.one ? M("", !0) : (s(), n("label", Ti, [
                  g[14] || (g[14] = F("B ", -1)),
                  le(e("select", {
                    "onUpdate:modelValue": g[1] || (g[1] = (S) => y.b = S),
                    class: "rg-input"
                  }, [
                    g[13] || (g[13] = e("option", {
                      value: "",
                      disabled: ""
                    }, "Column…", -1)),
                    (s(!0), n(q, null, K(L.value, (S) => (s(), n("option", {
                      key: S.uid,
                      value: S.label
                    }, _(S.label), 9, Ei))), 128))
                  ], 512), [
                    [Ee, y.b]
                  ])
                ])),
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--primary",
                  disabled: !C.value,
                  onClick: w
                }, "Use", 8, Ai),
                L.value.length ? M("", !0) : (s(), n("span", Oi, "Add " + _($.value.needs === "dates" ? "date columns" : "numbers") + " to the report first.", 1))
              ])) : M("", !0)
            ]),
            _: 1
          })
        ])),
        e("div", Ri, [
          e("label", Di, [
            g[15] || (g[15] = e("span", null, "Column name", -1)),
            le(e("input", {
              id: "rg-formula-label",
              "onUpdate:modelValue": g[2] || (g[2] = (S) => c.value = S),
              class: "rg-input",
              maxlength: "120",
              placeholder: "Visits per doctor"
            }, null, 512), [
              [ce, c.value]
            ])
          ]),
          e("label", Li, [
            g[16] || (g[16] = e("span", null, "Show as", -1)),
            le(e("select", {
              id: "rg-formula-format",
              "onUpdate:modelValue": g[3] || (g[3] = (S) => o.value = S),
              class: "rg-input"
            }, [
              (s(), n(q, null, K(b, ([S, X]) => e("option", {
                key: S,
                value: S
              }, _(X), 9, Ni)), 64))
            ], 512), [
              [Ee, o.value]
            ])
          ])
        ]),
        e("label", Vi, [
          g[18] || (g[18] = e("span", null, [
            F("Formula "),
            e("small", { class: "rg-faint" }, "· columns in [brackets], + − * /, comparisons, AND / OR, text in 'quotes'")
          ], -1)),
          e("div", {
            class: "rg-formula-box",
            "data-state": E.value ? "checking" : T.value ? T.value.ok ? "ok" : "error" : "idle"
          }, [
            le(e("textarea", {
              id: "rg-formula-text",
              ref_key: "textarea",
              ref: v,
              "onUpdate:modelValue": g[4] || (g[4] = (S) => r.value = S),
              class: "rg-textarea rg-formula",
              spellcheck: "false",
              placeholder: "[Amount] / [Number of visits]",
              onKeydown: [
                Ke(ge(J, ["ctrl", "prevent"]), ["enter"]),
                Ke(ge(J, ["meta", "prevent"]), ["enter"])
              ]
            }, null, 40, Pi), [
              [ce, r.value]
            ]),
            O(tt, {
              name: "rg-swap",
              mode: "out-in"
            }, {
              default: ie(() => [
                E.value ? (s(), n("p", Ui, [
                  O(P, {
                    name: "loader",
                    spin: "",
                    small: ""
                  }),
                  g[17] || (g[17] = F(" Checking…", -1))
                ])) : T.value ? (s(), n("p", {
                  key: T.value.message,
                  class: oe(["rg-check-result", T.value.ok ? "rg-check-result--ok" : "rg-check-result--error"]),
                  role: "status"
                }, [
                  O(P, {
                    name: T.value.ok ? "check" : "alert",
                    small: ""
                  }, null, 8, ["name"]),
                  F(" " + _(T.value.message), 1)
                ], 2)) : M("", !0)
              ]),
              _: 1
            })
          ], 8, Fi)
        ]),
        e("div", Ii, [
          e("div", null, [
            g[19] || (g[19] = e("div", { class: "rg-formula-help__title" }, [
              F("Columns "),
              e("small", { class: "rg-faint" }, "click to insert")
            ], -1)),
            e("div", qi, [
              (s(!0), n(q, null, K(a.value, (S) => (s(), n("button", {
                key: S.uid,
                type: "button",
                class: "rg-token rg-token--col",
                "data-kind": S.kind,
                title: S.as,
                onClick: (X) => ue(`[${S.label}]`)
              }, _(S.label), 9, ji))), 128)),
              a.value.length ? M("", !0) : (s(), n("span", zi, "Add fields first; formulas calculate with them."))
            ])
          ]),
          (s(), n(q, null, K(ae, ([S, X]) => e("div", { key: S }, [
            e("div", Bi, _(S), 1),
            e("div", Ki, [
              (s(!0), n(q, null, K(X, ([se, pe, Ce]) => (s(), n("button", {
                key: se,
                type: "button",
                class: "rg-token",
                title: Ce,
                onClick: (Ue) => ue(pe)
              }, _(se), 9, Gi))), 128))
            ])
          ])), 64))
        ])
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, Yi = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-save-name"
}, Ji = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-save-description"
}, Qi = {
  class: "rg-field-inline",
  style: { "flex-direction": "column", "align-items": "stretch" },
  for: "rg-save-folder"
}, Zi = { id: "rg-save-folders" }, Xi = ["value"], eu = { style: { border: "0", padding: "0", margin: "0", display: "flex", "flex-direction": "column", gap: "6px" } }, tu = {
  class: "rg-field-inline",
  for: "rg-vis-private"
}, lu = {
  class: "rg-field-inline",
  for: "rg-vis-public"
}, su = ["disabled"], hl = {
  __name: "SaveDialog",
  props: {
    copy: { type: Boolean, default: !1 },
    folders: { type: Array, default: () => [] }
  },
  emits: ["close", "saved"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = _e(Ae), m = _e("rg-theme", "light"), h = d.state.draft, a = B(l.copy ? `Copy of ${h.name}` : h.name), f = B(h.description), A = B(h.folder), c = B(l.copy ? "private" : h.visibility);
    async function r() {
      try {
        const o = await d.save({ name: a.value, description: f.value, folder: A.value, visibility: c.value, copy: l.copy });
        i("saved", o), i("close");
      } catch {
      }
    }
    return (o, v) => (s(), ne(We, {
      title: t.copy ? "Save a copy" : N(h).uuid ? "Save report" : "Save new report",
      "data-rg-theme": N(m),
      onClose: v[6] || (v[6] = (T) => i("close"))
    }, {
      footer: ie(() => [
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: v[5] || (v[5] = (T) => i("close"))
        }, "Cancel"),
        e("button", {
          type: "submit",
          form: "rg-save-form",
          class: "rg-btn rg-btn--primary",
          disabled: N(d).state.saving || !a.value.trim()
        }, _(N(d).state.saving ? "Saving…" : "Save"), 9, su)
      ]),
      default: ie(() => [
        e("form", {
          id: "rg-save-form",
          style: { display: "contents" },
          onSubmit: ge(r, ["prevent"])
        }, [
          e("label", Yi, [
            v[7] || (v[7] = F(" Name ", -1)),
            le(e("input", {
              id: "rg-save-name",
              "onUpdate:modelValue": v[0] || (v[0] = (T) => a.value = T),
              class: "rg-input",
              maxlength: "255",
              required: ""
            }, null, 512), [
              [ce, a.value]
            ])
          ]),
          e("label", Ji, [
            v[8] || (v[8] = F(" Description (optional) ", -1)),
            le(e("textarea", {
              id: "rg-save-description",
              "onUpdate:modelValue": v[1] || (v[1] = (T) => f.value = T),
              class: "rg-textarea",
              maxlength: "2000"
            }, null, 512), [
              [ce, f.value]
            ])
          ]),
          e("label", Qi, [
            v[9] || (v[9] = F(" Folder (optional) ", -1)),
            le(e("input", {
              id: "rg-save-folder",
              "onUpdate:modelValue": v[2] || (v[2] = (T) => A.value = T),
              class: "rg-input",
              list: "rg-save-folders",
              maxlength: "255",
              placeholder: "Sales"
            }, null, 512), [
              [ce, A.value]
            ]),
            e("datalist", Zi, [
              (s(!0), n(q, null, K(t.folders, (T) => (s(), n("option", {
                key: T,
                value: T
              }, null, 8, Xi))), 128))
            ])
          ]),
          e("fieldset", eu, [
            v[12] || (v[12] = e("legend", {
              class: "rg-muted",
              style: { "font-size": "12px", "margin-bottom": "4px" }
            }, "Who can open it", -1)),
            e("label", tu, [
              le(e("input", {
                id: "rg-vis-private",
                "onUpdate:modelValue": v[3] || (v[3] = (T) => c.value = T),
                type: "radio",
                value: "private"
              }, null, 512), [
                [Zt, c.value]
              ]),
              v[10] || (v[10] = F(" Only me (and people I share it with) ", -1))
            ]),
            e("label", lu, [
              le(e("input", {
                id: "rg-vis-public",
                "onUpdate:modelValue": v[4] || (v[4] = (T) => c.value = T),
                type: "radio",
                value: "public"
              }, null, 512), [
                [Zt, c.value]
              ]),
              v[11] || (v[11] = F(" Everyone who builds reports ", -1))
            ]),
            v[13] || (v[13] = e("span", {
              class: "rg-faint",
              style: { "font-size": "11.5px" }
            }, "People who open it only see the rows they are allowed to see.", -1))
          ])
        ], 32)
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, nu = {
  key: 0,
  class: "rg-skeleton-list"
}, au = { class: "rg-muted rg-publish__intro" }, ou = {
  class: "rg-publish__field",
  for: "rg-publish-permission"
}, ru = {
  key: 0,
  class: "rg-publish__error"
}, iu = {
  key: 1,
  class: "rg-faint"
}, uu = { class: "rg-publish__field" }, du = { class: "rg-num rg-faint" }, cu = { class: "rg-search" }, gu = {
  class: "rg-publish__roles",
  role: "group",
  "aria-label": "Roles"
}, mu = ["aria-pressed", "onClick"], pu = {
  key: 0,
  class: "rg-faint"
}, vu = {
  key: 0,
  class: "rg-publish__error"
}, fu = { class: "rg-publish__menu" }, bu = {
  class: "rg-field-inline",
  for: "rg-publish-menu"
}, hu = {
  key: 0,
  class: "rg-publish__field",
  for: "rg-publish-group"
}, yu = {
  key: 0,
  class: "rg-publish__error",
  role: "alert"
}, $u = ["disabled"], _u = ["disabled"], jt = {
  __name: "PublishDialog",
  props: {
    uuid: { type: String, required: !0 },
    name: { type: String, default: "" },
    /** report | dashboard */
    kind: { type: String, default: "report" }
  },
  emits: ["close", "published", "unpublished"],
  setup(t, { emit: u }) {
    const l = t, i = u, { api: d } = Fe(), m = j(() => l.kind === "dashboard" ? d.dashboards : d.reports), h = _e("rg-theme", "light"), a = $e({ loading: !0, saving: !1, error: null, errors: {}, published: !1 }), f = $e({ permission: "", roles: [], inMenu: !0, menuGroup: "" }), A = B([]), c = B(""), r = j(() => {
      const b = c.value.trim().toLowerCase();
      return A.value.filter((p) => !b || p.name.toLowerCase().includes(b));
    });
    Se(async () => {
      try {
        const [b, p] = await Promise.all([m.value.publishing(l.uuid), d.roles()]);
        A.value = p, a.published = b.published, Object.assign(f, {
          permission: b.permission ?? b.suggested_permission,
          roles: b.roles ?? [],
          inMenu: b.published ? b.in_menu : !0,
          menuGroup: b.menu_group ?? ""
        });
      } catch (b) {
        a.error = b.message;
      } finally {
        a.loading = !1;
      }
    });
    function o(b) {
      f.roles = f.roles.includes(b) ? f.roles.filter((p) => p !== b) : [...f.roles, b];
    }
    async function v() {
      a.saving = !0, a.errors = {}, a.error = null;
      try {
        const b = await m.value.publish(l.uuid, {
          permission: f.permission.trim(),
          roles: f.roles,
          inMenu: f.inMenu,
          menuGroup: f.menuGroup.trim() || null
        });
        i("published", b), i("close");
      } catch (b) {
        a.errors = b.errors ?? {}, a.error = Object.keys(a.errors).length ? null : b.message;
      } finally {
        a.saving = !1;
      }
    }
    async function T() {
      a.saving = !0;
      try {
        const b = await m.value.unpublish(l.uuid);
        i("unpublished", b), i("close");
      } catch (b) {
        a.error = b.message;
      } finally {
        a.saving = !1;
      }
    }
    const E = (b) => {
      var p;
      return ((p = a.errors[b]) == null ? void 0 : p[0]) ?? null;
    }, y = j(() => {
      var b, p;
      return ((p = (b = Object.entries(a.errors).find(([$]) => $.startsWith("roles"))) == null ? void 0 : b[1]) == null ? void 0 : p[0]) ?? null;
    });
    return (b, p) => (s(), ne(We, {
      title: a.published ? `Publishing: ${t.name}` : `Publish “${t.name}”`,
      "data-rg-theme": N(h),
      onClose: p[5] || (p[5] = ($) => i("close"))
    }, {
      footer: ie(() => [
        a.published ? (s(), n("button", {
          key: 0,
          type: "button",
          class: "rg-btn rg-btn--danger",
          disabled: a.saving,
          onClick: T
        }, "Unpublish", 8, $u)) : M("", !0),
        p[11] || (p[11] = e("span", { style: { flex: "1" } }, null, -1)),
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: p[4] || (p[4] = ($) => i("close"))
        }, "Cancel"),
        e("button", {
          type: "submit",
          form: "rg-publish-form",
          class: "rg-btn rg-btn--primary",
          disabled: a.loading || a.saving || !f.permission.trim()
        }, _(a.saving ? "Saving…" : a.published ? "Update" : "Publish"), 9, _u)
      ]),
      default: ie(() => [
        a.loading ? (s(), n("div", nu, [
          (s(), n(q, null, K(4, ($) => e("div", {
            key: $,
            class: "rg-skeleton"
          })), 64))
        ])) : (s(), n("form", {
          key: 1,
          id: "rg-publish-form",
          class: "rg-publish",
          onSubmit: ge(v, ["prevent"])
        }, [
          e("p", au, " Everyone with the permission below can open " + _(t.kind === "dashboard" ? "this dashboard" : "and run this report") + ", each seeing only their own data. Building reports is not needed. ", 1),
          e("label", ou, [
            p[6] || (p[6] = e("span", null, "Permission", -1)),
            le(e("input", {
              id: "rg-publish-permission",
              "onUpdate:modelValue": p[0] || (p[0] = ($) => f.permission = $),
              class: "rg-input rg-mono",
              maxlength: "191",
              required: "",
              pattern: "[a-z0-9][a-z0-9_.\\-]*"
            }, null, 512), [
              [ce, f.permission]
            ]),
            E("permission") ? (s(), n("small", ru, _(E("permission")), 1)) : (s(), n("small", iu, "Created if it does not exist. Lowercase letters, digits, dots, dashes and underscores."))
          ]),
          e("fieldset", uu, [
            e("legend", null, [
              p[7] || (p[7] = F("Roles that get it ", -1)),
              e("span", du, _(f.roles.length) + " selected", 1)
            ]),
            e("label", cu, [
              p[8] || (p[8] = e("span", { class: "rg-sr-only" }, "Search roles", -1)),
              O(P, { name: "search" }),
              le(e("input", {
                "onUpdate:modelValue": p[1] || (p[1] = ($) => c.value = $),
                class: "rg-input",
                type: "search",
                placeholder: "Search roles",
                autocomplete: "off"
              }, null, 512), [
                [ce, c.value]
              ])
            ]),
            e("div", gu, [
              (s(!0), n(q, null, K(r.value, ($) => (s(), n("button", {
                key: $.id,
                type: "button",
                class: "rg-publish__role",
                "aria-pressed": f.roles.includes($.name),
                onClick: (L) => o($.name)
              }, [
                O(P, {
                  name: f.roles.includes($.name) ? "check" : "plus",
                  small: ""
                }, null, 8, ["name"]),
                F(_($.name), 1)
              ], 8, mu))), 128)),
              r.value.length ? M("", !0) : (s(), n("span", pu, "No role matches."))
            ]),
            y.value ? (s(), n("small", vu, _(y.value), 1)) : M("", !0)
          ]),
          e("div", fu, [
            e("label", bu, [
              le(e("input", {
                id: "rg-publish-menu",
                "onUpdate:modelValue": p[2] || (p[2] = ($) => f.inMenu = $),
                type: "checkbox",
                class: "rg-check"
              }, null, 512), [
                [ct, f.inMenu]
              ]),
              p[9] || (p[9] = F(" Show in the sidebar ", -1))
            ]),
            f.inMenu ? (s(), n("label", hu, [
              p[10] || (p[10] = e("span", null, "Sidebar group (optional)", -1)),
              le(e("input", {
                id: "rg-publish-group",
                "onUpdate:modelValue": p[3] || (p[3] = ($) => f.menuGroup = $),
                class: "rg-input",
                maxlength: "120",
                placeholder: "Sales"
              }, null, 512), [
                [ce, f.menuGroup]
              ])
            ])) : M("", !0)
          ]),
          a.error ? (s(), n("p", yu, _(a.error), 1)) : M("", !0)
        ], 32))
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, ku = 200;
let wu = 0;
const at = () => `c${++wu}`, yl = [
  { key: "line", label: "Line" },
  { key: "division", label: "Division" },
  { key: "employee", label: "Employee" }
];
function rl(t) {
  const u = String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return /^[a-z]/.test(u) ? u.slice(0, 50) : `c_${u}`.slice(0, 50);
}
function Lt() {
  return {
    uuid: null,
    name: "Untitled combined report",
    description: "",
    folder: "",
    visibility: "private",
    canEdit: !0,
    canPublish: !1,
    published: !1,
    level: "employee",
    period: "this_month",
    from: "",
    to: "",
    lines: [],
    fields: [
      { uid: at(), base: "line", as: "line", label: "Line" },
      { uid: at(), base: "employee", as: "employee", label: "Employee" }
    ],
    // For the results grid: combined reports have no row groups.
    rows: [],
    values: [],
    sort: []
  };
}
function xu(t) {
  var i, d;
  const u = t.definition ?? {}, l = ((i = u.context) == null ? void 0 : i.period) ?? "this_month";
  return {
    ...Lt(),
    uuid: t.uuid ?? null,
    name: t.name ?? "Untitled combined report",
    description: t.description ?? "",
    folder: t.folder ?? "",
    visibility: t.visibility ?? "private",
    canEdit: t.can_edit ?? !0,
    canPublish: t.can_publish ?? !1,
    published: t.published ?? !1,
    level: u.level ?? "employee",
    period: Array.isArray(l) ? "custom" : l,
    from: Array.isArray(l) ? String(l[0]).slice(0, 10) : "",
    to: Array.isArray(l) ? String(l[1]).slice(0, 10) : "",
    lines: Array.isArray((d = u.context) == null ? void 0 : d.lines) ? [...u.context.lines] : [],
    fields: (u.fields ?? []).map((m) => ({ uid: at(), ...m, label: m.label ?? null })),
    sort: u.sort ?? []
  };
}
function Cu(t, u) {
  const l = $e({
    loading: !1,
    draft: Lt(),
    reports: [],
    // [{ key, label, description, group, levels }]
    fieldsByReport: {},
    // `${key}|${level}|${period}` -> { loading, fields, error }
    runSeq: 0,
    running: !1,
    error: null,
    meta: null,
    saving: !1,
    savedSnapshot: null
  }), i = j(() => {
    const D = l.draft, J = D.period === "custom" ? D.from && D.to ? [D.from, D.to] : "this_month" : D.period;
    return {
      type: "combined",
      level: D.level,
      context: { period: J, ...D.lines.length ? { lines: D.lines } : {} },
      fields: D.fields.map(({ uid: I, ...R }) => Object.fromEntries(Object.entries(R).filter(([, k]) => k != null && k !== ""))),
      sort: D.sort.filter((I) => D.fields.some((R) => R.as === I.field))
    };
  }), d = () => JSON.stringify([i.value, l.draft.name]), m = j(() => l.savedSnapshot !== null && d() !== l.savedSnapshot), h = j(() => l.draft.fields.some((D) => !D.base)), a = j(() => !1), f = j(() => Object.fromEntries(l.reports.map((D) => [D.key, D])));
  async function A(D = null) {
    l.loading = !0;
    try {
      l.draft = D ? xu(D) : Lt(), l.reports = await t.combine.reports(), l.savedSnapshot = d(), h.value && w();
    } catch (J) {
      u.error(J);
    } finally {
      l.loading = !1;
    }
  }
  function c() {
    const D = l.draft;
    return D.period === "custom" ? `${D.from}~${D.to}` : D.period;
  }
  function r(D) {
    return `${D}|${l.draft.level}|${c()}`;
  }
  async function o(D) {
    var I, R;
    const J = r(D);
    if (!((I = l.fieldsByReport[J]) != null && I.fields || (R = l.fieldsByReport[J]) != null && R.loading)) {
      l.fieldsByReport[J] = { loading: !0, fields: null, error: null };
      try {
        const k = l.draft, g = k.period === "custom" ? k.from && k.to ? [k.from, k.to] : void 0 : k.period, S = await t.combine.fields(D, { level: k.level, period: g, lines: k.lines });
        l.fieldsByReport[J] = { loading: !1, fields: S, error: null };
      } catch (k) {
        l.fieldsByReport[J] = { loading: !1, fields: null, error: k.message };
      }
    }
  }
  function v(D) {
    return l.fieldsByReport[r(D)] ?? null;
  }
  function T(D) {
    const J = new Set(l.draft.fields.map((R) => R.as));
    let I = rl(D) || "column";
    for (let R = 2; J.has(I); R++) I = `${rl(D)}_${R}`;
    return I;
  }
  function E(D, J) {
    return l.draft.fields.some((I) => I.report === D && I.field === J);
  }
  function y(D, J) {
    var k;
    const I = l.draft.fields.find((g) => g.report === D && g.field === J.key);
    if (I) {
      L(I.uid);
      return;
    }
    const R = ((k = f.value[D]) == null ? void 0 : k.label) ?? D;
    l.draft.fields.push({ uid: at(), report: D, field: J.key, as: T(J.key), label: `${J.label} (${R})` });
  }
  function b(D) {
    var k;
    const J = l.draft.fields.find((g) => g.base === D);
    if (J) {
      L(J.uid);
      return;
    }
    const I = l.draft.fields.findIndex((g) => !g.base), R = { uid: at(), base: D, as: T(D), label: ((k = yl.find((g) => g.key === D)) == null ? void 0 : k.label) ?? D };
    l.draft.fields.splice(I === -1 ? l.draft.fields.length : I, 0, R);
  }
  function p({ label: D, formula: J }) {
    const I = { uid: at(), formula: J, as: T(D || "formula"), label: D || "Formula" };
    return l.draft.fields.push(I), I;
  }
  function $(D, J) {
    const I = l.draft.fields.find((R) => R.uid === D);
    I && Object.assign(I, J);
  }
  function L(D) {
    const J = l.draft.fields.find((I) => I.uid === D);
    l.draft.fields = l.draft.fields.filter((I) => I.uid !== D), J && (l.draft.sort = l.draft.sort.filter((I) => I.field !== J.as));
  }
  function C(D, J) {
    const I = [...l.draft.fields], R = I.findIndex((k) => k.uid === D);
    R === -1 || J < 0 || J >= I.length || (I.splice(J, 0, I.splice(R, 1)[0]), l.draft.fields = I);
  }
  let x = null;
  function w() {
    if (!h.value) {
      l.error = null, l.meta = null;
      return;
    }
    l.runSeq++;
  }
  ye(() => JSON.stringify(i.value), () => {
    clearTimeout(x), x = setTimeout(w, 450);
  }), ye(() => [l.draft.level, c()], () => {
    for (const D of Object.keys(l.fieldsByReport))
      l.fieldsByReport[D].fields === null && !l.fieldsByReport[D].loading && delete l.fieldsByReport[D];
  });
  async function ae({ offset: D = 0, top: J = !1, size: I = ku, fresh: R = !1 } = {}) {
    const k = J && (D === 0 || R);
    k && (l.running = !0, l.error = null);
    try {
      const g = await t.query.rows(i.value, { offset: D, size: I });
      return k && (l.meta = { ...g.meta, columns: g.columns }), g;
    } catch (g) {
      throw k && (l.error = g), g;
    } finally {
      k && (l.running = !1);
    }
  }
  function ue(D) {
    const J = l.draft.sort.find((I) => I.field === D);
    l.draft.sort = J ? J.dir === "asc" ? [{ field: D, dir: "desc" }] : [] : [{ field: D, dir: "asc" }];
  }
  function xe(D) {
    l.draft.sort = D;
  }
  async function te({ name: D, description: J, folder: I, visibility: R, copy: k = !1 } = {}) {
    const g = l.draft, S = {
      name: (D ?? g.name).trim() || "Untitled combined report",
      description: J ?? g.description,
      folder: (I ?? g.folder) || null,
      visibility: R ?? g.visibility,
      definition: i.value
    };
    l.saving = !0;
    try {
      const X = g.uuid && !k && g.canEdit ? await t.reports.update(g.uuid, S) : await t.reports.create(S);
      return Object.assign(g, {
        uuid: X.uuid,
        name: X.name,
        description: X.description ?? "",
        folder: X.folder ?? "",
        visibility: X.visibility,
        canEdit: X.can_edit,
        canPublish: X.can_publish ?? !1,
        published: X.published ?? !1
      }), l.savedSnapshot = d(), u.success(`Saved "${X.name}".`), X;
    } catch (X) {
      throw u.error(X), X;
    } finally {
      l.saving = !1;
    }
  }
  return {
    state: l,
    definition: i,
    dirty: m,
    runnable: h,
    grouped: a,
    reportsByKey: f,
    init: A,
    loadFields: o,
    fieldsOf: v,
    hasField: E,
    toggleField: y,
    toggleBase: b,
    addFormula: p,
    updateColumn: $,
    removeColumn: L,
    moveColumn: C,
    run: w,
    fetchRows: ae,
    toggleSort: ue,
    setSort: xe,
    fetchSummary: () => t.query.summary(i.value),
    exportReport: async (D) => {
      try {
        const J = await t.query.export(i.value, D, { name: l.draft.name || "report" });
        u.success(`Exported "${J}".`);
      } catch (J) {
        throw u.error(J), J;
      }
    },
    gridKey: j(() => l.draft.uuid ? `report:${l.draft.uuid}` : null),
    save: te
  };
}
const Su = {
  class: "rg-multi",
  style: { position: "relative" }
}, Mu = ["aria-expanded", "aria-label"], Tu = { class: "rg-search" }, Eu = { class: "rg-sr-only" }, Au = ["placeholder"], Ou = ["aria-label"], Ru = {
  key: 0,
  class: "rg-faint"
}, Du = {
  key: 1,
  class: "rg-faint"
}, Lu = ["aria-selected"], Nu = ["checked", "onChange"], Vu = { class: "rg-pop__foot" }, Fu = ["disabled"], et = {
  __name: "RgMultiSelect",
  props: {
    modelValue: { type: Array, default: () => [] },
    label: { type: String, required: !0 },
    allLabel: { type: String, default: "All" },
    load: { type: Function, required: !0 },
    /** Changes when the list depends on something else (the chosen lines). */
    dependsOn: { type: [String, Number, Array], default: null }
  },
  emits: ["update:modelValue", "change"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = B(!1), m = B(""), h = B([]), a = B(/* @__PURE__ */ new Map()), f = B(!1);
    let A = 0, c = null;
    async function r() {
      const b = ++A;
      f.value = !0;
      try {
        const p = await l.load(m.value.trim());
        if (b !== A) return;
        h.value = p, p.forEach(($) => a.value.set($.id, $.label));
      } catch {
        b === A && (h.value = []);
      } finally {
        b === A && (f.value = !1);
      }
    }
    ye(m, () => {
      clearTimeout(c), c = setTimeout(r, 250);
    }), ye(d, (b) => b && r()), ye(() => l.dependsOn, () => {
      h.value = [], d.value && r();
    }, { deep: !0 });
    const o = j(() => new Set(l.modelValue)), v = j(() => l.modelValue.length ? l.modelValue.length === 1 ? a.value.get(l.modelValue[0]) ?? "1 selected" : `${l.modelValue.length} selected` : l.allLabel);
    function T(b) {
      const p = o.value.has(b) ? l.modelValue.filter(($) => $ !== b) : [...l.modelValue, b];
      i("update:modelValue", p);
    }
    function E() {
      i("update:modelValue", []);
    }
    function y() {
      d.value = !1, i("change");
    }
    return (b, p) => (s(), n("div", Su, [
      e("button", {
        type: "button",
        class: "rg-input rg-multi__button",
        "aria-expanded": d.value,
        "aria-label": `${t.label}: ${v.value}`,
        onClick: p[0] || (p[0] = ($) => d.value ? y() : d.value = !0)
      }, [
        e("span", {
          class: oe({ "rg-faint": !t.modelValue.length })
        }, _(v.value), 3),
        O(P, {
          name: "chevron",
          small: "",
          class: "rg-multi__chev"
        })
      ], 8, Mu),
      O(tt, { name: "rg-swap" }, {
        default: ie(() => [
          d.value ? (s(), ne(ot, {
            key: 0,
            class: "rg-multi__pop",
            onClose: y
          }, {
            default: ie(() => [
              e("label", Tu, [
                e("span", Eu, "Search " + _(t.label), 1),
                O(P, { name: "search" }),
                le(e("input", {
                  "onUpdate:modelValue": p[1] || (p[1] = ($) => m.value = $),
                  class: "rg-input",
                  type: "search",
                  placeholder: `Search ${t.label.toLowerCase()}`,
                  autocomplete: "off"
                }, null, 8, Au), [
                  [ce, m.value]
                ])
              ]),
              e("ul", {
                class: "rg-multi__list",
                role: "listbox",
                "aria-label": t.label,
                "aria-multiselectable": "true"
              }, [
                f.value && !h.value.length ? (s(), n("li", Ru, [
                  O(P, {
                    name: "loader",
                    spin: "",
                    small: ""
                  }),
                  p[2] || (p[2] = F(" Loading…", -1))
                ])) : h.value.length ? M("", !0) : (s(), n("li", Du, "Nothing to pick.")),
                (s(!0), n(q, null, K(h.value, ($) => (s(), n("li", {
                  key: $.id,
                  role: "option",
                  "aria-selected": o.value.has($.id)
                }, [
                  e("label", null, [
                    e("input", {
                      type: "checkbox",
                      class: "rg-check",
                      checked: o.value.has($.id),
                      onChange: (L) => T($.id)
                    }, null, 40, Nu),
                    F(" " + _($.label), 1)
                  ])
                ], 8, Lu))), 128))
              ], 8, Ou),
              e("div", Vu, [
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--sm rg-btn--ghost",
                  disabled: !t.modelValue.length,
                  onClick: E
                }, "Clear", 8, Fu),
                e("button", {
                  type: "button",
                  class: "rg-btn rg-btn--sm rg-btn--primary",
                  onClick: y
                }, "Done")
              ])
            ]),
            _: 1
          })) : M("", !0)
        ]),
        _: 1
      })
    ]));
  }
}, Ze = (t) => !!t.category, Be = (t) => (t.values ?? []).length > 0, $l = [
  { value: "kpi", label: "KPI", icon: "hash", hint: "Headline numbers", fits: Be },
  { value: "bar", label: "Bar", icon: "view", hint: "Top items, across", fits: (t) => Ze(t) && Be(t) },
  { value: "column", label: "Column", icon: "view", hint: "Top items, upright", fits: (t) => Ze(t) && Be(t) },
  { value: "line", label: "Line", icon: "clock", hint: "Over time", fits: (t) => Ze(t) && Be(t) },
  { value: "area", label: "Area", icon: "clock", hint: "Over time, filled", fits: (t) => Ze(t) && Be(t) },
  { value: "pie", label: "Pie", icon: "globe", hint: "Parts of a whole", fits: (t) => Ze(t) && Be(t) },
  { value: "donut", label: "Donut", icon: "globe", hint: "Parts, with the total", fits: (t) => Ze(t) && Be(t) },
  { value: "share", label: "Share bar", icon: "table", hint: "Parts in one bar", fits: (t) => Ze(t) && Be(t) },
  { value: "table", label: "Table", icon: "table", hint: "First rows", fits: () => !0 }
], _l = ["bar", "column", "pie", "donut", "share"], Pu = { line: 120, area: 120, pie: 6, donut: 6, share: 6 }, Uu = { kpi: "sm", table: "full", line: "full", area: "full" };
function kl(t, u, { resize: l = !1 } = {}) {
  const i = { ...t, type: u };
  _l.includes(u) && (i.values = (t.values ?? []).slice(0, 1)), u === "kpi" && (i.category = null);
  const d = ["pie", "donut", "share"].includes(t.type), m = ["pie", "donut", "share"].includes(u), h = ["line", "area"].includes(t.type), a = ["line", "area"].includes(u);
  return (l || d !== m || h !== a) && (i.top = Pu[u] ?? 10), l && (i.size = Uu[u] ?? "md"), i;
}
const Iu = { as: "__count", label: "Number of rows" }, Rt = ["integer", "decimal"];
function wl(t = []) {
  const u = (m) => m.label ?? m.as, l = t.filter((m) => m.kind === "dimension").map((m) => ({ as: m.as, label: u(m), type: m.type ?? null })), i = t.filter((m) => m.kind !== "dimension" && !["date", "datetime", "string", "text", "boolean"].includes(m.type)).map((m) => ({ as: m.as, label: u(m) })), d = t.filter((m) => m.kind === "dimension" && Rt.includes(m.type)).map((m) => ({ as: m.as, label: `${u(m)} (total)` }));
  return { dims: l.filter((m) => !Rt.includes(m.type)).concat(l.filter((m) => Rt.includes(m.type))), nums: [...i, ...d, Iu] };
}
function zt(t, u) {
  var l, i;
  if (!((l = t.values) != null && l.length) && t.type !== "table" && (t.values = u.nums[0] ? [u.nums[0].as] : []), !t.category && !["kpi", "table"].includes(t.type)) {
    const d = u.dims.find((m) => ["date", "datetime"].includes(m.type));
    t.category = (["line", "area"].includes(t.type) && d ? d.as : (i = u.dims[0]) == null ? void 0 : i.as) ?? null;
  }
  return t;
}
function qu(t) {
  var u;
  return t != null && t.report ? t.type === "table" ? null : (u = t.values) != null && u.length ? t.type !== "kpi" && !t.category ? "Pick the column to chart by." : null : "Pick a number to show." : "Pick a report.";
}
const ju = { class: "rg-kpi" }, zu = { class: "rg-kpi__label" }, Bu = ["aria-label"], Ku = {
  __name: "KpiTile",
  props: {
    label: { type: String, required: !0 },
    value: { type: [Number, null], default: null },
    column: { type: Object, required: !0 }
  },
  setup(t) {
    const u = t, l = B(u.value);
    let i = null;
    function d(h, a) {
      var r;
      cancelAnimationFrame(i);
      const f = typeof window < "u" && ((r = window.matchMedia) == null ? void 0 : r.call(window, "(prefers-reduced-motion: reduce)").matches);
      if (a === null || h === null || f || typeof requestAnimationFrame > "u") {
        l.value = a;
        return;
      }
      const A = performance.now(), c = (o) => {
        const v = Math.min(1, (o - A) / 650), T = 1 - (1 - v) ** 3;
        l.value = h + (a - h) * T, v < 1 ? i = requestAnimationFrame(c) : l.value = a;
      };
      i = requestAnimationFrame(c);
    }
    ye(() => u.value, (h, a) => d(a ?? 0, h)), Se(() => d(0, u.value)), Ve(() => cancelAnimationFrame(i));
    const m = (h) => h == null ? "—" : we(u.column.type === "integer" ? Math.round(h) : h, u.column);
    return (h, a) => (s(), n("div", ju, [
      e("span", zu, _(t.label), 1),
      e("span", {
        class: "rg-kpi__value rg-num",
        "aria-label": m(t.value)
      }, _(m(l.value)), 9, Bu)
    ]));
  }
};
function xl(t, u = 4) {
  if (!Number.isFinite(t) || t <= 0) return { max: 1, ticks: [0, 1] };
  const l = t / u, i = 10 ** Math.floor(Math.log10(l)), d = [1, 2, 2.5, 5, 10].map((a) => a * i).find((a) => a >= l) ?? 10 * i, m = Math.ceil(t / d) * d, h = [];
  for (let a = 0; a <= m + d / 2; a += d) h.push(Math.round(a * 1e6) / 1e6);
  return { max: m, ticks: h };
}
function Cl(t, u) {
  return u < 1e4 ? new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(t) : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(t);
}
function Bt(t, u) {
  if (!t) return () => {
  };
  if (u(t.clientWidth || 600), typeof ResizeObserver > "u") return () => {
  };
  const l = new ResizeObserver((i) => u(Math.max(120, Math.round(i[0].contentRect.width))));
  return l.observe(t), () => l.disconnect();
}
const Gu = ["width", "height", "aria-label"], Hu = ["transform", "onMouseenter"], Wu = ["y", "width", "height"], Yu = ["x", "y"], Ju = ["transform"], Qu = ["width"], Zu = ["d"], Xu = ["x", "y"], ed = { class: "rg-num" }, Ne = 22, ut = 10, td = 72, ld = {
  __name: "BarChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 }
  },
  setup(t) {
    const u = t, l = B(null), i = B(600), d = B(null);
    let m = () => {
    };
    Se(() => m = Bt(l.value, (o) => i.value = o)), Ve(() => m());
    const h = j(() => Math.min(180, Math.max(80, i.value * 0.32))), a = j(() => Math.max(40, i.value - h.value - td - 12)), f = j(() => Math.max(0, ...u.rows.map((o) => Number(o[u.value.alias]) || 0))), A = j(() => u.rows.map((o, v) => {
      const T = Number(o[u.value.alias]) || 0, E = f.value > 0 ? Math.max(T > 0 ? 3 : 0, T / f.value * a.value) : 0;
      return { i: v, row: o, v: T, w: E, y: v * (Ne + ut), name: we(o[u.category.alias], u.category) || "(empty)", text: we(o[u.value.alias], u.value) };
    })), c = j(() => Math.max(Ne, u.rows.length * (Ne + ut) - ut));
    function r(o) {
      if (o <= 0) return "";
      const v = Math.min(4, o / 2, Ne / 2);
      return `M0,0 H${o - v} Q${o},0 ${o},${v} V${Ne - v} Q${o},${Ne} ${o - v},${Ne} H0 Z`;
    }
    return (o, v) => (s(), n("div", {
      ref_key: "el",
      ref: l,
      class: "rg-chart rg-bar",
      onMouseleave: v[0] || (v[0] = (T) => d.value = null)
    }, [
      (s(), n("svg", {
        width: i.value,
        height: c.value,
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`
      }, [
        (s(!0), n(q, null, K(A.value, (T) => (s(), n("g", {
          key: T.i,
          transform: `translate(0, ${T.y})`,
          class: "rg-bar__row",
          onMouseenter: (E) => d.value = T
        }, [
          e("rect", {
            x: 0,
            y: -ut / 2,
            width: i.value,
            height: Ne + ut,
            fill: "transparent"
          }, null, 8, Wu),
          e("text", {
            x: h.value - 8,
            y: Ne / 2,
            class: "rg-chart__label",
            "text-anchor": "end",
            "dominant-baseline": "central"
          }, _(T.name.length > 24 ? `${T.name.slice(0, 23)}…` : T.name), 9, Yu),
          e("g", {
            transform: `translate(${h.value}, 0)`
          }, [
            e("rect", {
              width: a.value,
              height: Ne,
              class: "rg-bar__track",
              rx: "4"
            }, null, 8, Qu),
            e("path", {
              d: r(T.w),
              class: oe(["rg-bar__fill rg-series-1", { "is-dim": d.value && d.value.i !== T.i }]),
              style: Te({ "--rg-delay": `${T.i * 40}ms` })
            }, null, 14, Zu),
            e("text", {
              x: T.w + 6,
              y: Ne / 2,
              class: "rg-chart__value",
              "dominant-baseline": "central"
            }, _(T.text), 9, Xu)
          ], 8, Ju)
        ], 40, Hu))), 128))
      ], 8, Gu)),
      d.value ? (s(), n("div", {
        key: 0,
        class: "rg-chart__tip",
        style: Te({ top: `${d.value.y - 6}px`, insetInlineStart: `${h.value + Math.min(d.value.w, a.value - 120)}px` }),
        role: "status"
      }, [
        e("b", null, _(d.value.name), 1),
        e("span", null, [
          F(_(t.value.label) + ": ", 1),
          e("b", ed, _(d.value.text), 1)
        ])
      ], 4)) : M("", !0)
    ], 544));
  }
}, sd = {
  key: 0,
  class: "rg-legend"
}, nd = ["width", "height", "aria-label"], ad = ["transform"], od = { class: "rg-chart__grid" }, rd = ["transform"], id = ["x2"], ud = {
  x: "-8",
  "dominant-baseline": "central",
  "text-anchor": "end",
  class: "rg-chart__axis"
}, dd = ["x", "y"], cd = ["d"], gd = ["d"], md = ["cx", "cy"], pd = ["x", "y"], vd = { key: 0 }, fd = ["x1", "x2", "y2"], bd = ["cx", "cy"], hd = { class: "rg-num" }, yd = {
  __name: "LineChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    values: { type: Array, required: !0 },
    height: { type: Number, default: 220 },
    /** Fill under the lines (area chart). */
    area: { type: Boolean, default: !1 }
  },
  setup(t) {
    const u = t, l = B(null), i = B(600), d = B(null);
    let m = () => {
    };
    Se(() => m = Bt(l.value, (y) => i.value = y)), Ve(() => m());
    const h = { top: 12, right: 64, bottom: 28, left: 52 }, a = j(() => Math.max(40, i.value - h.left - h.right)), f = j(() => u.height - h.top - h.bottom), A = j(() => xl(Math.max(0, ...u.rows.flatMap((y) => u.values.map((b) => Number(y[b.alias]) || 0))))), c = (y) => u.rows.length < 2 ? a.value / 2 : y / (u.rows.length - 1) * a.value, r = (y) => f.value - (Number(y) || 0) / A.value.max * f.value, o = j(() => u.values.map((y, b) => {
      const p = u.rows.map((C, x) => [c(x), C[y.alias] === null || C[y.alias] === void 0 ? null : r(C[y.alias])]);
      let $ = "";
      p.forEach(([C, x], w) => {
        var ae;
        x !== null && ($ += `${$ === "" || ((ae = p[w - 1]) == null ? void 0 : ae[1]) === null ? "M" : "L"}${C.toFixed(1)},${x.toFixed(1)}`);
      });
      const L = [...p].reverse().find((C) => C[1] !== null);
      return { column: y, slot: b + 1, d: $, area: u.area && $ ? `${$}L${c(u.rows.length - 1)},${f.value}L${c(0)},${f.value}Z` : null, last: L };
    })), v = j(() => {
      const y = u.rows.length, b = Math.max(1, Math.ceil(y / Math.max(2, Math.floor(a.value / 70)))), p = u.rows.map((L, C) => ({ i: C, text: we(L[u.category.alias], u.category) })).filter((L) => L.i % b === 0 || L.i === y - 1), $ = p[p.length - 1];
      return p.filter((L) => L === $ || c($.i) - c(L.i) >= 64);
    });
    function T(y) {
      const b = y.currentTarget.getBoundingClientRect(), p = y.clientX - b.left - h.left;
      if (u.rows.length === 0) return;
      const $ = u.rows.length < 2 ? 0 : Math.round(p / a.value * (u.rows.length - 1));
      d.value = Math.min(u.rows.length - 1, Math.max(0, $));
    }
    const E = (y) => {
      var b;
      return we((b = u.rows[u.rows.length - 1]) == null ? void 0 : b[y.column.alias], y.column);
    };
    return (y, b) => (s(), n("div", {
      ref_key: "el",
      ref: l,
      class: "rg-chart rg-line"
    }, [
      t.values.length > 1 ? (s(), n("ul", sd, [
        (s(!0), n(q, null, K(o.value, (p) => (s(), n("li", {
          key: p.column.alias
        }, [
          e("i", {
            class: oe(`rg-swatch rg-series-${p.slot}`)
          }, null, 2),
          F(_(p.column.label), 1)
        ]))), 128))
      ])) : M("", !0),
      (s(), n("svg", {
        width: i.value,
        height: t.height,
        role: "img",
        "aria-label": `${t.values.map((p) => p.label).join(", ")} by ${t.category.label}`,
        onMousemove: T,
        onMouseleave: b[0] || (b[0] = (p) => d.value = null)
      }, [
        e("g", {
          transform: `translate(${h.left}, ${h.top})`
        }, [
          e("g", od, [
            (s(!0), n(q, null, K(A.value.ticks, (p) => (s(), n("g", {
              key: p,
              transform: `translate(0, ${r(p)})`
            }, [
              e("line", { x2: a.value }, null, 8, id),
              e("text", ud, _(N(Cl)(p, A.value.max)), 1)
            ], 8, rd))), 128))
          ]),
          (s(!0), n(q, null, K(v.value, (p) => (s(), n("text", {
            key: p.i,
            x: c(p.i),
            y: f.value + 18,
            "text-anchor": "middle",
            class: "rg-chart__axis"
          }, _(p.text), 9, dd))), 128)),
          (s(!0), n(q, null, K(o.value, (p) => le((s(), n("path", {
            key: `a${p.slot}`,
            d: p.area ?? "",
            class: oe(`rg-line__area rg-series-${p.slot}`)
          }, null, 10, cd)), [
            [Xt, p.area]
          ])), 128)),
          (s(!0), n(q, null, K(o.value, (p) => (s(), n("path", {
            key: `l${p.slot}`,
            d: p.d,
            class: oe(`rg-line__path rg-series-${p.slot}`),
            pathLength: "1"
          }, null, 10, gd))), 128)),
          (s(!0), n(q, null, K(o.value, (p) => le((s(), n("g", {
            key: `e${p.slot}`
          }, [
            p.last ? (s(), n("circle", {
              key: 0,
              cx: p.last[0],
              cy: p.last[1],
              r: "4",
              class: oe(`rg-line__dot rg-series-${p.slot}`)
            }, null, 10, md)) : M("", !0),
            p.last && t.values.length <= 4 ? (s(), n("text", {
              key: 1,
              x: p.last[0] + 8,
              y: p.last[1],
              "dominant-baseline": "central",
              class: "rg-chart__value"
            }, _(E(p)), 9, pd)) : M("", !0)
          ])), [
            [Xt, p.last]
          ])), 128)),
          d.value !== null ? (s(), n("g", vd, [
            e("line", {
              x1: c(d.value),
              x2: c(d.value),
              y2: f.value,
              class: "rg-line__cross"
            }, null, 8, fd),
            (s(!0), n(q, null, K(o.value, (p) => {
              var $, L;
              return s(), n(q, {
                key: `h${p.slot}`
              }, [
                (($ = t.rows[d.value]) == null ? void 0 : $[p.column.alias]) !== null && ((L = t.rows[d.value]) == null ? void 0 : L[p.column.alias]) !== void 0 ? (s(), n("circle", {
                  key: 0,
                  cx: c(d.value),
                  cy: r(t.rows[d.value][p.column.alias]),
                  r: "4",
                  class: oe(`rg-line__dot rg-series-${p.slot}`)
                }, null, 10, bd)) : M("", !0)
              ], 64);
            }), 128))
          ])) : M("", !0)
        ], 8, ad)
      ], 40, nd)),
      d.value !== null ? (s(), n("div", {
        key: 1,
        class: "rg-chart__tip",
        style: Te({ top: "8px", insetInlineStart: `${Math.min(h.left + c(d.value) + 12, i.value - 180)}px` }),
        role: "status"
      }, [
        e("b", null, _(N(we)(t.rows[d.value][t.category.alias], t.category)), 1),
        (s(!0), n(q, null, K(o.value, (p) => (s(), n("span", {
          key: p.column.alias
        }, [
          t.values.length > 1 ? (s(), n("i", {
            key: 0,
            class: oe(`rg-swatch rg-series-${p.slot}`)
          }, null, 2)) : M("", !0),
          F(_(p.column.label) + ": ", 1),
          e("b", hd, _(N(we)(t.rows[d.value][p.column.alias], p.column)), 1)
        ]))), 128))
      ], 4)) : M("", !0)
    ], 512));
  }
}, $d = { class: "rg-chart rg-share" }, _d = ["aria-label"], kd = ["onMouseenter"], wd = { class: "rg-share__legend" }, xd = ["onMouseenter"], Cd = { class: "rg-share__name" }, Sd = { class: "rg-num" }, Md = { class: "rg-num rg-faint" }, Td = {
  __name: "ShareBar",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 },
    /** Every part when the widget asked for more; only `parts` get their own color. */
    parts: { type: Number, default: 6 }
  },
  setup(t) {
    const u = t, l = B(null), i = j(() => u.rows.reduce((h, a) => h + Math.max(0, Number(a[u.value.alias]) || 0), 0)), d = j(() => {
      const h = [...u.rows].sort((r, o) => (Number(o[u.value.alias]) || 0) - (Number(r[u.value.alias]) || 0)), a = h.slice(0, Math.min(6, u.parts)), f = h.slice(a.length), A = a.map((r, o) => ({ key: o, slot: o + 1, name: we(r[u.category.alias], u.category) || "(empty)", v: Math.max(0, Number(r[u.value.alias]) || 0) })), c = f.reduce((r, o) => r + Math.max(0, Number(o[u.value.alias]) || 0), 0);
      return c > 0 && A.push({ key: "other", slot: "other", name: `Other (${f.length})`, v: c }), A.map((r) => ({ ...r, share: i.value > 0 ? r.v / i.value : 0, text: we(r.v, u.value) }));
    }), m = (h) => new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(h);
    return (h, a) => (s(), n("div", $d, [
      e("div", {
        class: "rg-share__bar",
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`,
        onMouseleave: a[0] || (a[0] = (f) => l.value = null)
      }, [
        (s(!0), n(q, null, K(d.value, (f, A) => (s(), n("span", {
          key: f.key,
          class: oe(["rg-share__seg", `rg-series-${f.slot}`, { "is-dim": l.value !== null && l.value !== f.key }]),
          style: Te({ flexGrow: f.share, "--rg-delay": `${A * 60}ms` }),
          onMouseenter: (c) => l.value = f.key
        }, null, 46, kd))), 128))
      ], 40, _d),
      e("ul", wd, [
        (s(!0), n(q, null, K(d.value, (f) => (s(), n("li", {
          key: f.key,
          class: oe({ "is-hover": l.value === f.key }),
          onMouseenter: (A) => l.value = f.key,
          onMouseleave: a[1] || (a[1] = (A) => l.value = null)
        }, [
          e("i", {
            class: oe(`rg-swatch rg-series-${f.slot}`)
          }, null, 2),
          e("span", Cd, _(f.name), 1),
          e("b", Sd, _(f.text), 1),
          e("span", Md, _(m(f.share)), 1)
        ], 42, xd))), 128))
      ])
    ]));
  }
}, Ed = ["width", "height", "aria-label"], Ad = ["transform"], Od = { class: "rg-chart__grid" }, Rd = ["transform"], Dd = ["x2"], Ld = {
  x: "-8",
  "dominant-baseline": "central",
  "text-anchor": "end",
  class: "rg-chart__axis"
}, Nd = ["onMouseenter"], Vd = ["x", "width", "height"], Fd = ["d", "transform"], Pd = ["x", "y"], Ud = ["x", "y"], Id = { class: "rg-num" }, qd = {
  __name: "ColumnChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 },
    height: { type: Number, default: 240 }
  },
  setup(t) {
    const u = t, l = B(null), i = B(600), d = B(null);
    let m = () => {
    };
    Se(() => m = Bt(l.value, (b) => i.value = b)), Ve(() => m());
    const h = { top: 18, right: 8, bottom: 36, left: 48 }, a = j(() => Math.max(40, i.value - h.left - h.right)), f = j(() => u.height - h.top - h.bottom), A = j(() => xl(Math.max(0, ...u.rows.map((b) => Number(b[u.value.alias]) || 0)))), c = j(() => a.value / Math.max(1, u.rows.length)), r = j(() => Math.min(24, Math.max(4, c.value - 6))), o = j(() => u.rows.map((b, p) => {
      const L = Math.max(0, Number(b[u.value.alias]) || 0) / A.value.max * f.value;
      return {
        i: p,
        h: L,
        x: p * c.value + (c.value - r.value) / 2,
        name: we(b[u.category.alias], u.category) || "(empty)",
        text: we(b[u.value.alias], u.value)
      };
    })), v = j(() => Math.max(3, Math.floor(c.value / 6.5))), T = (b) => b.length > v.value ? `${b.slice(0, v.value - 1)}…` : b, E = j(() => c.value >= 34);
    function y(b) {
      if (b <= 0) return "";
      const p = r.value, $ = Math.min(4, p / 2, b);
      return `M0,${b} V${$} Q0,0 ${$},0 H${p - $} Q${p},0 ${p},${$} V${b} Z`;
    }
    return (b, p) => (s(), n("div", {
      ref_key: "el",
      ref: l,
      class: "rg-chart rg-column",
      onMouseleave: p[0] || (p[0] = ($) => d.value = null)
    }, [
      (s(), n("svg", {
        width: i.value,
        height: t.height,
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`
      }, [
        e("g", {
          transform: `translate(${h.left}, ${h.top})`
        }, [
          e("g", Od, [
            (s(!0), n(q, null, K(A.value.ticks, ($) => (s(), n("g", {
              key: $,
              transform: `translate(0, ${f.value - $ / A.value.max * f.value})`
            }, [
              e("line", { x2: a.value }, null, 8, Dd),
              e("text", Ld, _(N(Cl)($, A.value.max)), 1)
            ], 8, Rd))), 128))
          ]),
          (s(!0), n(q, null, K(o.value, ($) => (s(), n("g", {
            key: $.i,
            onMouseenter: (L) => d.value = $
          }, [
            e("rect", {
              x: $.i * c.value,
              y: "0",
              width: c.value,
              height: f.value,
              fill: "transparent"
            }, null, 8, Vd),
            e("path", {
              d: y($.h),
              transform: `translate(${$.x}, ${f.value - $.h})`,
              class: oe(["rg-column__fill rg-series-1", { "is-dim": d.value && d.value.i !== $.i }]),
              style: Te({ "--rg-delay": `${$.i * 40}ms` })
            }, null, 14, Fd),
            E.value ? (s(), n("text", {
              key: 0,
              x: $.x + r.value / 2,
              y: f.value - $.h - 6,
              "text-anchor": "middle",
              class: "rg-chart__value"
            }, _($.text), 9, Pd)) : M("", !0),
            e("text", {
              x: $.x + r.value / 2,
              y: f.value + 16,
              "text-anchor": "middle",
              class: "rg-chart__axis"
            }, _(T($.name)), 9, Ud)
          ], 40, Nd))), 128))
        ], 8, Ad)
      ], 8, Ed)),
      d.value ? (s(), n("div", {
        key: 0,
        class: "rg-chart__tip",
        style: Te({ top: `${Math.max(0, h.top + f.value - d.value.h - 56)}px`, insetInlineStart: `${Math.min(h.left + d.value.x + r.value + 6, i.value - 170)}px` }),
        role: "status"
      }, [
        e("b", null, _(d.value.name), 1),
        e("span", null, [
          F(_(t.value.label) + ": ", 1),
          e("b", Id, _(d.value.text), 1)
        ])
      ], 4)) : M("", !0)
    ], 544));
  }
}, jd = { class: "rg-chart rg-pie" }, zd = ["viewBox", "aria-label"], Bd = ["d", "onMouseenter"], Kd = {
  key: 0,
  class: "rg-pie__centre"
}, Gd = ["x", "y"], Hd = ["x", "y"], Wd = { class: "rg-share__legend rg-pie__legend" }, Yd = ["onMouseenter"], Jd = { class: "rg-share__name" }, Qd = { class: "rg-num" }, Zd = { class: "rg-num rg-faint" }, Ie = 168, Xd = {
  __name: "PieChart",
  props: {
    rows: { type: Array, required: !0 },
    category: { type: Object, required: !0 },
    value: { type: Object, required: !0 },
    donut: { type: Boolean, default: !1 },
    parts: { type: Number, default: 6 }
  },
  setup(t) {
    const u = t, l = B(null), i = Ie / 2 - 2, d = j(() => u.donut ? i * 0.6 : 0), m = j(() => u.rows.reduce((c, r) => c + Math.max(0, Number(r[u.value.alias]) || 0), 0)), h = j(() => {
      const c = [...u.rows].sort((y, b) => (Number(b[u.value.alias]) || 0) - (Number(y[u.value.alias]) || 0)), r = c.slice(0, Math.min(6, u.parts)), o = c.slice(r.length), v = r.map((y, b) => ({ key: b, slot: b + 1, name: we(y[u.category.alias], u.category) || "(empty)", v: Math.max(0, Number(y[u.value.alias]) || 0) })), T = o.reduce((y, b) => y + Math.max(0, Number(b[u.value.alias]) || 0), 0);
      T > 0 && v.push({ key: "other", slot: "other", name: `Other (${o.length})`, v: T });
      let E = -Math.PI / 2;
      return v.filter((y) => y.v > 0).map((y) => {
        const b = m.value > 0 ? y.v / m.value : 0, p = E;
        return E += b * Math.PI * 2, { ...y, share: b, start: p, end: E, text: we(y.v, u.value) };
      });
    });
    function a(c, r, o, v) {
      r - c >= Math.PI * 2 - 1e-6 && (r = c + Math.PI * 2 - 1e-4);
      const T = r - c > Math.PI ? 1 : 0, E = (y, b) => `${(i + 2 + y * Math.cos(b)).toFixed(2)},${(i + 2 + y * Math.sin(b)).toFixed(2)}`;
      return v <= 0 ? `M${i + 2},${i + 2} L${E(o, c)} A${o},${o} 0 ${T} 1 ${E(o, r)} Z` : `M${E(o, c)} A${o},${o} 0 ${T} 1 ${E(o, r)} L${E(v, r)} A${v},${v} 0 ${T} 0 ${E(v, c)} Z`;
    }
    const f = (c) => new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 }).format(c), A = j(() => l.value !== null ? h.value.find((c) => c.key === l.value) : null);
    return (c, r) => (s(), n("div", jd, [
      (s(), n("svg", {
        width: Ie,
        height: Ie,
        viewBox: `0 0 ${Ie} ${Ie}`,
        role: "img",
        "aria-label": `${t.value.label} by ${t.category.label}`,
        class: "rg-pie__svg",
        onMouseleave: r[0] || (r[0] = (o) => l.value = null)
      }, [
        (s(!0), n(q, null, K(h.value, (o, v) => (s(), n("path", {
          key: o.key,
          d: a(o.start, o.end, l.value === o.key ? i : i - 3, d.value),
          class: oe(["rg-pie__slice", `rg-series-${o.slot}`, { "is-dim": l.value !== null && l.value !== o.key }]),
          style: Te({ "--rg-delay": `${v * 70}ms` }),
          onMouseenter: (T) => l.value = o.key
        }, null, 46, Bd))), 128)),
        t.donut ? (s(), n("g", Kd, [
          e("text", {
            x: Ie / 2,
            y: Ie / 2 - 6,
            "text-anchor": "middle",
            class: "rg-pie__total rg-num"
          }, _(A.value ? f(A.value.share) : N(we)(m.value, t.value)), 9, Gd),
          e("text", {
            x: Ie / 2,
            y: Ie / 2 + 13,
            "text-anchor": "middle",
            class: "rg-chart__axis"
          }, _(A.value ? A.value.name.slice(0, 18) : "Total"), 9, Hd)
        ])) : M("", !0)
      ], 40, zd)),
      e("ul", Wd, [
        (s(!0), n(q, null, K(h.value, (o) => (s(), n("li", {
          key: o.key,
          class: oe({ "is-hover": l.value === o.key }),
          onMouseenter: (v) => l.value = o.key,
          onMouseleave: r[1] || (r[1] = (v) => l.value = null)
        }, [
          e("i", {
            class: oe(`rg-swatch rg-series-${o.slot}`)
          }, null, 2),
          e("span", Jd, _(o.name), 1),
          e("b", Qd, _(o.text), 1),
          e("span", Zd, _(f(o.share)), 1)
        ], 42, Yd))), 128))
      ])
    ]));
  }
}, ec = { class: "rg-widget__head" }, tc = { class: "rg-widget__titles" }, lc = {
  key: 0,
  class: "rg-faint"
}, sc = ["aria-busy"], nc = {
  key: 0,
  class: "rg-widget__locked"
}, ac = { class: "rg-empty__icon" }, oc = {
  key: 1,
  class: "rg-widget__skeleton"
}, rc = {
  key: 2,
  class: "rg-widget__error"
}, ic = {
  key: 3,
  class: "rg-widget__empty rg-faint"
}, uc = {
  key: 0,
  class: "rg-kpis"
}, dc = {
  key: 6,
  class: "rg-widget__table"
}, cc = { class: "rg-grid" }, gc = {
  key: 0,
  class: "rg-sr-only"
}, wt = {
  __name: "DashboardWidget",
  props: {
    widget: { type: Object, required: !0 },
    /** () => Promise<{ type, columns, rows }> */
    load: { type: Function, required: !0 },
    /** Bump to reload (filters changed). */
    version: { type: [Number, String], default: 0 }
  },
  setup(t, { expose: u }) {
    const l = t, i = _e("rg-widget-queue", null), d = B(null), m = B(null), h = B(l.widget.can_view === !1), a = B(!1);
    let f = 0;
    async function A() {
      if (l.widget.can_view === !1) {
        h.value = !0;
        return;
      }
      const E = ++f;
      a.value = !0, m.value = null;
      try {
        const y = await (i ? i(() => l.load()) : l.load());
        E === f && (d.value = y);
      } catch (y) {
        E === f && ((y == null ? void 0 : y.code) === "REPORT_FORBIDDEN" || (y == null ? void 0 : y.status) === 403) ? h.value = !0 : E === f && (m.value = (y == null ? void 0 : y.message) ?? "This widget could not load.");
      } finally {
        E === f && (a.value = !1);
      }
    }
    ye(() => [l.version, JSON.stringify(l.widget)], A, { immediate: !0 });
    const c = j(() => {
      var E;
      return Object.fromEntries((((E = d.value) == null ? void 0 : E.columns) ?? []).map((y) => [y.alias, y]));
    }), r = j(() => {
      var p;
      const E = c.value[l.widget.category];
      if (!E || E.grain || !["date", "datetime"].includes(E.type)) return E ?? null;
      const y = (((p = d.value) == null ? void 0 : p.rows) ?? []).map(($) => $[E.alias]).filter(($) => $ != null);
      return y.length > 1 && y.every(($) => /^\d{4}-\d{2}-01/.test(String($))) ? { ...E, grain: "month" } : E;
    }), o = j(() => (l.widget.values ?? []).map((E) => c.value[E]).filter(Boolean)), v = j(() => d.value && d.value.rows.length === 0), T = j(() => {
      var E;
      return ((E = d.value) == null ? void 0 : E.columns) ?? [];
    });
    return u({ reload: A }), (E, y) => {
      var b;
      return s(), n("article", {
        class: oe(["rg-widget", [`rg-widget--${t.widget.type}`, `rg-widget--${t.widget.size ?? "md"}`]])
      }, [
        e("header", ec, [
          e("div", tc, [
            e("h3", null, _(t.widget.title || (((b = o.value[0]) == null ? void 0 : b.label) ?? "Widget")), 1),
            t.widget.report_name ? (s(), n("small", lc, _(t.widget.report_name), 1)) : M("", !0)
          ]),
          gt(E.$slots, "actions")
        ]),
        e("div", {
          class: "rg-widget__body",
          "aria-busy": a.value ? "true" : "false"
        }, [
          h.value ? (s(), n("div", nc, [
            e("span", ac, [
              O(P, { name: "lock" })
            ]),
            e("span", null, [
              y[0] || (y[0] = F("You need access to ", -1)),
              e("b", null, _(t.widget.report_name ?? "its report"), 1),
              y[1] || (y[1] = F(" to see this.", -1))
            ])
          ])) : a.value && !d.value ? (s(), n("div", oc, [
            (s(!0), n(q, null, K(t.widget.type === "kpi" ? 2 : 5, (p) => (s(), n("span", {
              key: p,
              class: "rg-skeleton",
              style: Te({ width: `${40 + p * 29 % 55}%` })
            }, null, 4))), 128))
          ])) : m.value ? (s(), n("p", rc, [
            O(P, {
              name: "alert",
              small: ""
            }),
            F(" " + _(m.value), 1)
          ])) : v.value ? (s(), n("p", ic, "No data for these filters.")) : d.value ? (s(), n(q, { key: 4 }, [
            e("div", {
              class: oe({ "rg-widget__stale": a.value })
            }, [
              t.widget.type === "kpi" ? (s(), n("div", uc, [
                (s(!0), n(q, null, K(o.value, (p) => {
                  var $;
                  return s(), ne(Ku, {
                    key: p.alias,
                    label: o.value.length > 1 || !t.widget.title ? p.label : "",
                    value: (($ = d.value.rows[0]) == null ? void 0 : $[p.alias]) ?? null,
                    column: p
                  }, null, 8, ["label", "value", "column"]);
                }), 128))
              ])) : t.widget.type === "bar" && r.value && o.value[0] ? (s(), ne(ld, {
                key: 1,
                rows: d.value.rows,
                category: r.value,
                value: o.value[0]
              }, null, 8, ["rows", "category", "value"])) : t.widget.type === "column" && r.value && o.value[0] ? (s(), ne(qd, {
                key: 2,
                rows: d.value.rows,
                category: r.value,
                value: o.value[0]
              }, null, 8, ["rows", "category", "value"])) : ["line", "area"].includes(t.widget.type) && r.value && o.value.length ? (s(), ne(yd, {
                key: 3,
                rows: d.value.rows,
                category: r.value,
                values: o.value,
                area: t.widget.type === "area"
              }, null, 8, ["rows", "category", "values", "area"])) : ["pie", "donut"].includes(t.widget.type) && r.value && o.value[0] ? (s(), ne(Xd, {
                key: 4,
                rows: d.value.rows,
                category: r.value,
                value: o.value[0],
                donut: t.widget.type === "donut",
                parts: t.widget.top ?? 6
              }, null, 8, ["rows", "category", "value", "donut", "parts"])) : t.widget.type === "share" && r.value && o.value[0] ? (s(), ne(Td, {
                key: 5,
                rows: d.value.rows,
                category: r.value,
                value: o.value[0],
                parts: t.widget.top ?? 6
              }, null, 8, ["rows", "category", "value", "parts"])) : t.widget.type === "table" ? (s(), n("div", dc, [
                e("table", cc, [
                  e("thead", null, [
                    e("tr", null, [
                      (s(!0), n(q, null, K(T.value, (p) => (s(), n("th", {
                        key: p.alias,
                        class: oe({ "rg-num": N(Xe)(p) })
                      }, _(p.label), 3))), 128))
                    ])
                  ]),
                  e("tbody", null, [
                    (s(!0), n(q, null, K(d.value.rows, (p, $) => (s(), n("tr", {
                      key: $,
                      class: "rg-row"
                    }, [
                      (s(!0), n(q, null, K(T.value, (L) => (s(), n("td", {
                        key: L.alias,
                        class: oe({ "rg-num": N(Xe)(L) })
                      }, _(N(we)(p[L.alias], L)), 3))), 128))
                    ]))), 128))
                  ])
                ])
              ])) : M("", !0)
            ], 2),
            t.widget.type !== "table" && !h.value ? (s(), n("table", gc, [
              e("caption", null, _(t.widget.title), 1),
              e("thead", null, [
                e("tr", null, [
                  (s(!0), n(q, null, K(T.value, (p) => (s(), n("th", {
                    key: p.alias
                  }, _(p.label), 1))), 128))
                ])
              ]),
              e("tbody", null, [
                (s(!0), n(q, null, K(d.value.rows, (p, $) => (s(), n("tr", { key: $ }, [
                  (s(!0), n(q, null, K(T.value, (L) => (s(), n("td", {
                    key: L.alias
                  }, _(N(we)(p[L.alias], L)), 1))), 128))
                ]))), 128))
              ])
            ])) : M("", !0)
          ], 64)) : M("", !0)
        ], 8, sc)
      ], 2);
    };
  }
}, mc = { class: "rg-publish" }, pc = ["for"], vc = ["id", "value"], fc = ["value"], bc = { class: "rg-publish__field" }, hc = {
  class: "rg-widget-types",
  role: "group",
  "aria-label": "Widget type"
}, yc = ["aria-pressed", "onClick"], $c = ["for"], _c = ["id"], kc = ["value"], wc = {
  key: 2,
  class: "rg-publish__field"
}, xc = {
  key: 0,
  class: "rg-faint"
}, Cc = { class: "rg-publish__roles" }, Sc = ["aria-pressed", "onClick"], Mc = {
  key: 0,
  class: "rg-faint"
}, Tc = { class: "rg-widget-dialog__row" }, Ec = ["for"], Ac = ["id"], Oc = ["for"], Rc = ["id", "max"], Dc = ["for"], Lc = ["id"], Nc = ["value"], Sl = {
  __name: "WidgetForm",
  props: {
    widget: { type: Object, required: !0 },
    /** Reports to choose from; null hides the report picker (pinning from a report). */
    reports: { type: Array, default: null },
    /** { dims: [{as,label}], nums: [{as,label}], loading } of the widget's report. */
    columns: { type: Object, required: !0 },
    idPrefix: { type: String, default: "rg-widget" }
  },
  emits: ["report"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = [["sm", "Small"], ["md", "Half"], ["lg", "Two thirds"], ["full", "Full width"]], m = j(() => _l.includes(l.widget.type)), h = j(() => ["line", "area"].includes(l.widget.type)), a = j(() => ["pie", "donut", "share"].includes(l.widget.type));
    function f(r) {
      Object.assign(l.widget, kl(l.widget, r, { resize: !0 })), zt(l.widget, l.columns);
    }
    function A(r) {
      const o = l.widget;
      m.value ? o.values = [r] : o.values = o.values.includes(r) ? o.values.filter((v) => v !== r) : [...o.values, r];
    }
    function c(r) {
      Object.assign(l.widget, { report: r, category: null, values: [] }), i("report", r);
    }
    return (r, o) => (s(), n("div", mc, [
      t.reports ? (s(), n("label", {
        key: 0,
        class: "rg-publish__field",
        for: `${t.idPrefix}-report`
      }, [
        o[6] || (o[6] = e("span", null, "Report", -1)),
        e("select", {
          id: `${t.idPrefix}-report`,
          class: "rg-input",
          value: t.widget.report,
          onChange: o[0] || (o[0] = (v) => c(v.target.value))
        }, [
          o[5] || (o[5] = e("option", {
            value: "",
            disabled: ""
          }, "Pick a report", -1)),
          (s(!0), n(q, null, K(t.reports, (v) => (s(), n("option", {
            key: v.uuid,
            value: v.uuid
          }, _(v.name), 9, fc))), 128))
        ], 40, vc)
      ], 8, pc)) : M("", !0),
      e("div", bc, [
        o[7] || (o[7] = e("span", null, "Show as", -1)),
        e("div", hc, [
          (s(!0), n(q, null, K(N($l), (v) => (s(), n("button", {
            key: v.value,
            type: "button",
            class: "rg-widget-type",
            "aria-pressed": t.widget.type === v.value,
            onClick: (T) => f(v.value)
          }, [
            O(P, {
              name: v.icon,
              small: ""
            }, null, 8, ["name"]),
            e("b", null, _(v.label), 1),
            e("small", null, _(v.hint), 1)
          ], 8, yc))), 128))
        ])
      ]),
      ["kpi", "table"].includes(t.widget.type) ? M("", !0) : (s(), n("label", {
        key: 1,
        class: "rg-publish__field",
        for: `${t.idPrefix}-category`
      }, [
        e("span", null, _(h.value ? "Over" : "By"), 1),
        le(e("select", {
          id: `${t.idPrefix}-category`,
          "onUpdate:modelValue": o[1] || (o[1] = (v) => t.widget.category = v),
          class: "rg-input"
        }, [
          o[8] || (o[8] = e("option", {
            value: null,
            disabled: ""
          }, "Pick a column", -1)),
          (s(!0), n(q, null, K(t.columns.dims, (v) => (s(), n("option", {
            key: v.as,
            value: v.as
          }, _(v.label), 9, kc))), 128))
        ], 8, _c), [
          [Ee, t.widget.category]
        ])
      ], 8, $c)),
      t.widget.type !== "table" ? (s(), n("fieldset", wc, [
        e("legend", null, [
          F(_(m.value ? "Number" : "Numbers"), 1),
          h.value ? (s(), n("small", xc, " · pick numbers of the same scale: they share one axis")) : M("", !0)
        ]),
        e("div", Cc, [
          (s(!0), n(q, null, K(t.columns.nums, (v) => (s(), n("button", {
            key: v.as,
            type: "button",
            class: "rg-publish__role",
            "aria-pressed": t.widget.values.includes(v.as),
            onClick: (T) => A(v.as)
          }, [
            O(P, {
              name: t.widget.values.includes(v.as) ? "check" : "plus",
              small: ""
            }, null, 8, ["name"]),
            F(_(v.label), 1)
          ], 8, Sc))), 128)),
          t.columns.loading ? (s(), n("span", Mc, [
            O(P, {
              name: "loader",
              spin: "",
              small: ""
            }),
            o[9] || (o[9] = F(" Loading columns…", -1))
          ])) : M("", !0)
        ])
      ])) : M("", !0),
      e("div", Tc, [
        e("label", {
          class: "rg-publish__field",
          for: `${t.idPrefix}-title`
        }, [
          o[10] || (o[10] = e("span", null, "Title", -1)),
          le(e("input", {
            id: `${t.idPrefix}-title`,
            "onUpdate:modelValue": o[2] || (o[2] = (v) => t.widget.title = v),
            class: "rg-input",
            maxlength: "160",
            placeholder: "From the numbers"
          }, null, 8, Ac), [
            [ce, t.widget.title]
          ])
        ], 8, Ec),
        t.widget.type !== "kpi" ? (s(), n("label", {
          key: 0,
          class: "rg-publish__field",
          for: `${t.idPrefix}-top`
        }, [
          e("span", null, _(h.value ? "Points" : a.value ? "Parts" : "Rows"), 1),
          le(e("input", {
            id: `${t.idPrefix}-top`,
            "onUpdate:modelValue": o[3] || (o[3] = (v) => t.widget.top = v),
            class: "rg-input",
            type: "number",
            min: "1",
            max: a.value ? 12 : h.value ? 400 : 50
          }, null, 8, Rc), [
            [
              ce,
              t.widget.top,
              void 0,
              { number: !0 }
            ]
          ])
        ], 8, Oc)) : M("", !0),
        e("label", {
          class: "rg-publish__field",
          for: `${t.idPrefix}-size`
        }, [
          o[11] || (o[11] = e("span", null, "Size", -1)),
          le(e("select", {
            id: `${t.idPrefix}-size`,
            "onUpdate:modelValue": o[4] || (o[4] = (v) => t.widget.size = v),
            class: "rg-input"
          }, [
            (s(), n(q, null, K(d, ([v, T]) => e("option", {
              key: v,
              value: v
            }, _(T), 9, Nc)), 64))
          ], 8, Lc), [
            [Ee, t.widget.size]
          ])
        ], 8, Dc)
      ])
    ]));
  }
}, Vc = {
  key: 0,
  class: "rg-pin__done"
}, Fc = { class: "rg-empty__icon" }, Pc = {
  key: 0,
  class: "rg-widget-dialog__preview"
}, Uc = { class: "rg-publish__field rg-pin__target" }, Ic = ["value"], qc = {
  key: 1,
  class: "rg-publish__error",
  role: "alert"
}, jc = ["disabled"], Kt = {
  __name: "PinToDashboard",
  props: {
    report: { type: String, required: !0 },
    reportName: { type: String, default: "" }
  },
  emits: ["close", "pinned", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = t, i = u, { api: d } = Fe(), m = _e("rg-theme", "light"), h = $e({ id: "preview", type: "bar", title: "", report: l.report, category: null, values: [], top: 10, size: "md" }), a = $e({ dims: [], nums: [], loading: !0 }), f = B([]), A = B("new"), c = B(l.reportName ? `${l.reportName} dashboard` : "New dashboard"), r = $e({ saving: !1, error: null, done: null });
    Se(async () => {
      try {
        const [y, b] = await Promise.all([d.reports.view(l.report), d.dashboards.list().catch(() => [])]), p = y.fields ?? [];
        Object.assign(a, wl(p)), a.dims.length || Object.assign(h, { type: "kpi", size: "sm" }), zt(h, a), f.value = b.filter(($) => $.is_owner), f.value.length && (A.value = f.value[0].uuid);
      } catch (y) {
        r.error = y.message;
      } finally {
        a.loading = !1;
      }
    });
    const o = j(() => h.type === "table" || h.values.length > 0 && (h.type === "kpi" || !!h.category)), v = j(() => JSON.stringify(h));
    function T() {
      var p;
      const { id: y, ...b } = h;
      return (p = b.title) != null && p.trim() || (b.title = b.values.map(($) => {
        var L;
        return ((L = a.nums.find((C) => C.as === $)) == null ? void 0 : L.label) ?? $;
      }).join(", ") || l.reportName || "Widget"), b;
    }
    async function E() {
      r.saving = !0, r.error = null;
      try {
        const y = A.value === "new" ? await d.dashboards.create({ name: c.value.trim() || "New dashboard", layout: { widgets: [{ id: "w1", ...T() }] } }) : await d.dashboards.pin(A.value, T());
        r.done = y, i("pinned", y);
      } catch (y) {
        r.error = y.message;
      } finally {
        r.saving = !1;
      }
    }
    return (y, b) => (s(), ne(We, {
      title: r.done ? "Pinned" : `Pin “${t.reportName}” to a dashboard`,
      class: "rg-widget-dialog",
      "data-rg-theme": N(m),
      onClose: b[6] || (b[6] = (p) => i("close"))
    }, {
      footer: ie(() => [
        r.done ? (s(), n(q, { key: 0 }, [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: b[3] || (b[3] = (p) => i("close"))
          }, "Close"),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: b[4] || (b[4] = (p) => i("open-dashboard", r.done.uuid))
          }, [
            O(P, {
              name: "view",
              small: ""
            }),
            b[12] || (b[12] = F(" Open dashboard", -1))
          ])
        ], 64)) : (s(), n(q, { key: 1 }, [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: b[5] || (b[5] = (p) => i("close"))
          }, "Cancel"),
          e("button", {
            type: "submit",
            form: "rg-pin-form",
            class: "rg-btn rg-btn--primary",
            disabled: !o.value || r.saving
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            F(" " + _(r.saving ? "Pinning…" : "Pin"), 1)
          ], 8, jc)
        ], 64))
      ]),
      default: ie(() => [
        r.done ? (s(), n("div", Vc, [
          e("span", Fc, [
            O(P, { name: "check" })
          ]),
          e("p", null, [
            b[7] || (b[7] = F("Added to ", -1)),
            e("b", null, _(r.done.name), 1),
            b[8] || (b[8] = F(".", -1))
          ])
        ])) : (s(), n("form", {
          key: 1,
          id: "rg-pin-form",
          class: "rg-publish",
          onSubmit: b[2] || (b[2] = ge((p) => o.value && E(), ["prevent"]))
        }, [
          O(Sl, {
            widget: h,
            columns: a,
            "id-prefix": "rg-pin"
          }, null, 8, ["widget", "columns"]),
          o.value ? (s(), n("div", Pc, [
            b[9] || (b[9] = e("span", { class: "rg-faint" }, "Preview", -1)),
            O(wt, {
              widget: { ...h, size: "full" },
              load: () => N(d).dashboards.preview(h),
              version: v.value
            }, null, 8, ["widget", "load", "version"])
          ])) : M("", !0),
          e("div", Uc, [
            b[11] || (b[11] = e("span", null, "Add to", -1)),
            le(e("select", {
              id: "rg-pin-target",
              "onUpdate:modelValue": b[0] || (b[0] = (p) => A.value = p),
              class: "rg-input"
            }, [
              (s(!0), n(q, null, K(f.value, (p) => (s(), n("option", {
                key: p.uuid,
                value: p.uuid
              }, _(p.name) + " (" + _(p.widgets_count) + " widgets)", 9, Ic))), 128)),
              b[10] || (b[10] = e("option", { value: "new" }, "A new dashboard…", -1))
            ], 512), [
              [Ee, A.value]
            ]),
            A.value === "new" ? le((s(), n("input", {
              key: 0,
              id: "rg-pin-name",
              "onUpdate:modelValue": b[1] || (b[1] = (p) => c.value = p),
              class: "rg-input",
              maxlength: "255",
              "aria-label": "New dashboard name"
            }, null, 512)), [
              [ce, c.value]
            ]) : M("", !0)
          ]),
          r.error ? (s(), n("p", qc, _(r.error), 1)) : M("", !0)
        ], 32))
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"]));
  }
}, zc = ["data-rg-theme"], Bc = { class: "rg-topbar" }, Kc = { class: "rg-topbar__title" }, Gc = { class: "rg-topbar__meta" }, Hc = { class: "rg-root-chip" }, Wc = { key: 0 }, Yc = {
  key: 1,
  class: "rg-badge rg-badge--success"
}, Jc = { class: "rg-topbar__actions" }, Qc = ["disabled"], Zc = ["disabled"], Xc = {
  key: 0,
  class: "rg-builder__body"
}, eg = { class: "rg-explorer" }, tg = { class: "rg-skeleton-list" }, lg = {
  key: 1,
  class: "rg-builder__body"
}, sg = {
  class: "rg-explorer rg-catalog",
  "aria-label": "Reports"
}, ng = { class: "rg-explorer__head" }, ag = { class: "rg-search" }, og = { class: "rg-catalog__list" }, rg = {
  key: 0,
  class: "rg-list__empty"
}, ig = ["aria-expanded", "disabled", "onClick"], ug = {
  key: 0,
  class: "rg-faint"
}, dg = {
  key: 1,
  class: "rg-faint"
}, cg = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, gg = {
  key: 0,
  class: "rg-catalog__fields"
}, mg = {
  key: 0,
  class: "rg-faint"
}, pg = {
  key: 1,
  class: "rg-catalog__error"
}, vg = ["checked", "onChange"], fg = {
  key: 0,
  class: "rg-faint"
}, bg = { class: "rg-builder__main" }, hg = { class: "rg-combined__settings" }, yg = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "One row per"
}, $g = ["aria-pressed"], _g = ["aria-pressed"], kg = {
  class: "rg-field-inline",
  for: "rg-combined-period"
}, wg = ["value"], xg = { class: "rg-field-inline" }, Cg = { class: "rg-combined__columns" }, Sg = {
  class: "rg-combined__base",
  role: "group",
  "aria-label": "Structure columns"
}, Mg = ["aria-pressed", "onClick"], Tg = ["onDragstart", "onDrop"], Eg = { class: "rg-combined__text" }, Ag = ["aria-label", "onKeydown"], Og = ["onClick"], Rg = { class: "rg-faint" }, Dg = ["aria-label", "onClick"], Lg = ["aria-label", "disabled", "onClick"], Ng = ["aria-label", "onClick"], Vg = ["disabled"], Fg = {
  class: "rg-results",
  "aria-label": "Results"
}, Pg = {
  class: "rg-statusbar",
  role: "status",
  "aria-live": "polite"
}, Ug = { key: 0 }, Ig = { class: "rg-num" }, qg = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, jg = {
  key: 2,
  class: "rg-faint"
}, zg = {
  key: 0,
  class: "rg-errorbox",
  role: "alert"
}, Bg = { class: "rg-errorbox__title" }, Kg = {
  class: "rg-publish__field",
  for: "rg-combined-formula-label"
}, Gg = {
  class: "rg-publish__field",
  for: "rg-combined-formula-text"
}, Hg = { class: "rg-publish__field" }, Wg = { class: "rg-token-list" }, Yg = ["title", "onClick"], Jg = ["disabled"], Qg = {
  __name: "CombinedBuilder",
  props: {
    /** Saved combined report to open (from api.reports.get), or null for a new one. */
    report: { type: Object, default: null },
    theme: { type: String, default: "light" }
  },
  emits: ["saved", "published", "back", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = B(!1), { api: m } = Fe(), h = xt(), a = Cu(m, h);
    Oe(Ae, a), _e("rg-theme", null) || Oe("rg-theme", l.theme);
    const f = [
      ["this_month", "This month"],
      ["last_month", "Last month"],
      ["this_quarter", "This quarter"],
      ["last_quarter", "Last quarter"],
      ["this_year", "This year"],
      ["last_year", "Last year"],
      ["last_30_days", "Last 30 days"]
    ], A = { ...Nt, percent: "hash" }, c = j(() => a.state.draft), r = B(""), o = B(/* @__PURE__ */ new Set()), v = B(null), T = B(!1), E = B(null), y = B(null), b = B(null), p = j(() => {
      const k = r.value.trim().toLowerCase(), g = /* @__PURE__ */ new Map();
      for (const S of a.state.reports) {
        if (k && !S.label.toLowerCase().includes(k) && !(S.description ?? "").toLowerCase().includes(k)) continue;
        const X = S.group ?? "Reports";
        g.has(X) || g.set(X, []), g.get(X).push(S);
      }
      return [...g];
    }), $ = j(() => new Set(c.value.fields.filter((k) => k.report).map((k) => k.report))), L = j(() => c.value.fields.map((k) => ({ uid: k.uid, as: k.as, label: k.label ?? k.as })));
    function C(k) {
      return k.levels.includes(c.value.level);
    }
    function x(k) {
      const g = new Set(o.value);
      g.has(k.key) ? g.delete(k.key) : (g.add(k.key), a.loadFields(k.key)), o.value = g;
    }
    function w(k) {
      var g;
      return k.base ? "Structure" : k.formula ? "Formula" : ((g = a.reportsByKey.value[k.report]) == null ? void 0 : g.label) ?? k.report;
    }
    function ae(k) {
      y.value = { uid: k.uid, label: k.label ?? k.as };
    }
    function ue() {
      var k, g;
      (g = (k = y.value) == null ? void 0 : k.label) != null && g.trim() && a.updateColumn(y.value.uid, { label: y.value.label.trim() }), y.value = null;
    }
    function xe(k) {
      b.value && (a.moveColumn(b.value, c.value.fields.findIndex((g) => g.uid === k)), b.value = null);
    }
    function te() {
      var g;
      const k = E.value;
      (g = k == null ? void 0 : k.formula) != null && g.trim() && (k.uid ? a.updateColumn(k.uid, { label: k.label || "Formula", formula: k.formula.trim() }) : a.addFormula({ label: k.label, formula: k.formula.trim() }), E.value = null);
    }
    function D(k) {
      E.value.formula = `${E.value.formula ?? ""}${E.value.formula && !/\s$/.test(E.value.formula) ? " " : ""}${k}`;
    }
    function J(k) {
      return m.contextOptions("lines", { search: k });
    }
    function I(k) {
      i("saved", k);
    }
    Se(() => a.init(l.report));
    const R = {
      REPORT_FAILED: "One of the reports could not run",
      DATASET_FORBIDDEN: "No access",
      LEVEL_UNSUPPORTED: "Not available at this level",
      UNKNOWN_FIELD: "Check the formula",
      INVALID_FORMULA: "Check the formula"
    };
    return (k, g) => (s(), n("div", {
      class: "rg-root rg-combined",
      "data-rg-theme": t.theme
    }, [
      e("header", Bc, [
        e("div", Kc, [
          g[32] || (g[32] = e("label", {
            class: "rg-sr-only",
            for: "rg-combined-name"
          }, "Report name", -1)),
          le(e("input", {
            id: "rg-combined-name",
            "onUpdate:modelValue": g[0] || (g[0] = (S) => c.value.name = S),
            class: "rg-input rg-input--bare rg-name-input",
            maxlength: "255"
          }, null, 512), [
            [ce, c.value.name]
          ]),
          e("div", Gc, [
            e("span", Hc, [
              O(P, {
                name: "table",
                small: ""
              }),
              g[29] || (g[29] = F(" Combined report, one row per ", -1)),
              e("b", null, _(c.value.level), 1),
              c.value.uuid ? M("", !0) : (s(), n("button", {
                key: 0,
                type: "button",
                onClick: g[1] || (g[1] = (S) => i("back"))
              }, "change type"))
            ]),
            N(a).dirty.value ? (s(), n("span", Wc, [...g[30] || (g[30] = [
              e("i", {
                class: "rg-dot",
                "aria-hidden": "true"
              }, null, -1),
              F(" Unsaved changes", -1)
            ])])) : M("", !0),
            c.value.published ? (s(), n("span", Yc, [
              O(P, {
                name: "globe",
                small: ""
              }),
              g[31] || (g[31] = F(" Published", -1))
            ])) : M("", !0)
          ])
        ]),
        e("div", Jc, [
          e("button", {
            type: "button",
            class: "rg-btn",
            disabled: !N(a).runnable.value || N(a).state.running,
            onClick: g[2] || (g[2] = (S) => N(a).run())
          }, [
            O(P, {
              name: "play",
              small: ""
            }),
            g[33] || (g[33] = F(" Run", -1))
          ], 8, Qc),
          O(It, {
            run: N(a).exportReport,
            disabled: !N(a).runnable.value
          }, null, 8, ["run", "disabled"]),
          g[37] || (g[37] = e("span", { class: "rg-toolbar-sep" }, null, -1)),
          c.value.uuid ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn",
            title: "Add a chart or number from this report to a dashboard",
            onClick: g[3] || (g[3] = (S) => d.value = !0)
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            g[34] || (g[34] = F(" Pin", -1))
          ])) : M("", !0),
          c.value.uuid && c.value.canPublish ? (s(), n("button", {
            key: 1,
            type: "button",
            class: "rg-btn",
            onClick: g[4] || (g[4] = (S) => T.value = !0)
          }, [
            O(P, {
              name: "globe",
              small: ""
            }),
            F(" " + _(c.value.published ? "Publishing" : "Publish"), 1)
          ])) : M("", !0),
          c.value.uuid ? (s(), n("button", {
            key: 2,
            type: "button",
            class: "rg-btn",
            onClick: g[5] || (g[5] = (S) => v.value = { copy: !0 })
          }, [
            O(P, {
              name: "copy",
              small: ""
            }),
            g[35] || (g[35] = F(" Save a copy", -1))
          ])) : M("", !0),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            disabled: !N(a).runnable.value || N(a).state.saving || c.value.uuid && !c.value.canEdit,
            onClick: g[6] || (g[6] = (S) => v.value = { copy: !1 })
          }, [
            O(P, {
              name: "save",
              small: ""
            }),
            g[36] || (g[36] = F(" Save ", -1))
          ], 8, Zc)
        ])
      ]),
      N(a).state.loading ? (s(), n("div", Xc, [
        e("aside", eg, [
          e("div", tg, [
            (s(), n(q, null, K(8, (S) => e("div", {
              key: S,
              class: "rg-skeleton"
            })), 64))
          ])
        ]),
        g[38] || (g[38] = e("main", { class: "rg-builder__main" }, null, -1))
      ])) : (s(), n("div", lg, [
        e("aside", sg, [
          e("div", ng, [
            e("label", ag, [
              g[39] || (g[39] = e("span", { class: "rg-sr-only" }, "Search reports", -1)),
              O(P, { name: "search" }),
              le(e("input", {
                "onUpdate:modelValue": g[7] || (g[7] = (S) => r.value = S),
                class: "rg-input",
                type: "search",
                placeholder: "Search reports",
                autocomplete: "off"
              }, null, 512), [
                [ce, r.value]
              ])
            ])
          ]),
          e("div", og, [
            N(a).state.reports.length ? M("", !0) : (s(), n("p", rg, "No existing reports can be combined yet.")),
            (s(!0), n(q, null, K(p.value, ([S, X]) => (s(), n("section", {
              key: S,
              class: "rg-catalog__group"
            }, [
              e("h3", null, _(S), 1),
              (s(!0), n(q, null, K(X, (se) => (s(), n("article", {
                key: se.key,
                class: oe(["rg-catalog__report", { "is-open": o.value.has(se.key), "is-used": $.value.has(se.key), "is-off": !C(se) }])
              }, [
                e("button", {
                  type: "button",
                  class: "rg-catalog__head",
                  "aria-expanded": o.value.has(se.key),
                  disabled: !C(se),
                  onClick: (pe) => x(se)
                }, [
                  O(P, {
                    name: "chevron",
                    small: "",
                    class: "rg-catalog__chev"
                  }),
                  e("span", null, [
                    e("b", null, _(se.label), 1),
                    C(se) ? se.description ? (s(), n("small", dg, _(se.description), 1)) : M("", !0) : (s(), n("small", ug, "Per " + _(se.levels.join(" / ")) + " only", 1))
                  ]),
                  $.value.has(se.key) ? (s(), n("span", cg, "in use")) : M("", !0)
                ], 8, ig),
                O(tt, { name: "rg-swap" }, {
                  default: ie(() => {
                    var pe, Ce, Ue;
                    return [
                      o.value.has(se.key) ? (s(), n("ul", gg, [
                        (pe = N(a).fieldsOf(se.key)) != null && pe.loading ? (s(), n("li", mg, [
                          O(P, {
                            name: "loader",
                            spin: "",
                            small: ""
                          }),
                          g[40] || (g[40] = F(" Reading its columns…", -1))
                        ])) : (Ce = N(a).fieldsOf(se.key)) != null && Ce.error ? (s(), n("li", pg, _(N(a).fieldsOf(se.key).error), 1)) : M("", !0),
                        (s(!0), n(q, null, K(((Ue = N(a).fieldsOf(se.key)) == null ? void 0 : Ue.fields) ?? [], (Re) => (s(), n("li", {
                          key: Re.key
                        }, [
                          e("label", null, [
                            e("input", {
                              type: "checkbox",
                              class: "rg-check",
                              checked: N(a).hasField(se.key, Re.key),
                              onChange: (rt) => N(a).toggleField(se.key, Re)
                            }, null, 40, vg),
                            O(P, {
                              name: A[Re.type] ?? "text",
                              small: ""
                            }, null, 8, ["name"]),
                            e("span", null, _(Re.label), 1),
                            Re.type === "percent" ? (s(), n("small", fg, "%")) : M("", !0)
                          ])
                        ]))), 128))
                      ])) : M("", !0)
                    ];
                  }),
                  _: 2
                }, 1024)
              ], 2))), 128))
            ]))), 128))
          ])
        ]),
        e("main", bg, [
          e("div", hg, [
            e("div", yg, [
              e("button", {
                type: "button",
                "aria-pressed": c.value.level === "employee",
                onClick: g[8] || (g[8] = (S) => c.value.level = "employee")
              }, "Per employee", 8, $g),
              e("button", {
                type: "button",
                "aria-pressed": c.value.level === "division",
                onClick: g[9] || (g[9] = (S) => c.value.level = "division")
              }, "Per division", 8, _g)
            ]),
            e("label", kg, [
              O(P, {
                name: "calendar",
                small: ""
              }),
              g[42] || (g[42] = F(" Period ", -1)),
              le(e("select", {
                id: "rg-combined-period",
                "onUpdate:modelValue": g[10] || (g[10] = (S) => c.value.period = S),
                class: "rg-input",
                style: { width: "auto" }
              }, [
                (s(), n(q, null, K(f, ([S, X]) => e("option", {
                  key: S,
                  value: S
                }, _(X), 9, wg)), 64)),
                g[41] || (g[41] = e("option", { value: "custom" }, "Custom range…", -1))
              ], 512), [
                [Ee, c.value.period]
              ])
            ]),
            c.value.period === "custom" ? (s(), n(q, { key: 0 }, [
              le(e("input", {
                "onUpdate:modelValue": g[11] || (g[11] = (S) => c.value.from = S),
                class: "rg-input",
                type: "date",
                "aria-label": "From",
                style: { width: "auto" }
              }, null, 512), [
                [ce, c.value.from]
              ]),
              g[43] || (g[43] = e("span", { class: "rg-faint" }, "to", -1)),
              le(e("input", {
                "onUpdate:modelValue": g[12] || (g[12] = (S) => c.value.to = S),
                class: "rg-input",
                type: "date",
                "aria-label": "To",
                style: { width: "auto" }
              }, null, 512), [
                [ce, c.value.to]
              ])
            ], 64)) : M("", !0),
            e("div", xg, [
              O(P, {
                name: "folder",
                small: ""
              }),
              g[44] || (g[44] = F(" Lines ", -1)),
              O(et, {
                modelValue: c.value.lines,
                "onUpdate:modelValue": g[13] || (g[13] = (S) => c.value.lines = S),
                label: "Lines",
                "all-label": "All my lines",
                load: J
              }, null, 8, ["modelValue"])
            ])
          ]),
          e("div", Cg, [
            e("div", Sg, [
              (s(!0), n(q, null, K(N(yl), (S) => (s(), n("button", {
                key: S.key,
                type: "button",
                class: "rg-chip-toggle",
                "aria-pressed": c.value.fields.some((X) => X.base === S.key),
                onClick: (X) => N(a).toggleBase(S.key)
              }, _(S.label), 9, Mg))), 128))
            ]),
            O(qe, {
              tag: "ol",
              name: "rg-list-move",
              class: "rg-combined__chips",
              "aria-label": "Columns"
            }, {
              default: ie(() => [
                (s(!0), n(q, null, K(c.value.fields, (S, X) => {
                  var se;
                  return s(), n("li", {
                    key: S.uid,
                    class: oe(["rg-combined__chip", { "is-formula": S.formula, "is-base": S.base, "is-dragging": b.value === S.uid }]),
                    draggable: "true",
                    onDragstart: (pe) => b.value = S.uid,
                    onDragend: g[16] || (g[16] = (pe) => b.value = null),
                    onDragover: g[17] || (g[17] = ge(() => {
                    }, ["prevent"])),
                    onDrop: ge((pe) => xe(S.uid), ["prevent"])
                  }, [
                    g[45] || (g[45] = e("span", {
                      class: "rg-combined__grip",
                      "aria-hidden": "true"
                    }, "⋮⋮", -1)),
                    e("span", Eg, [
                      ((se = y.value) == null ? void 0 : se.uid) === S.uid ? le((s(), n("input", {
                        key: 0,
                        "onUpdate:modelValue": g[14] || (g[14] = (pe) => y.value.label = pe),
                        class: "rg-input rg-combined__rename",
                        "aria-label": `Rename ${S.label ?? S.as}`,
                        onKeydown: [
                          Ke(ge(ue, ["prevent"]), ["enter"]),
                          g[15] || (g[15] = Ke((pe) => y.value = null, ["escape"]))
                        ],
                        onBlur: ue
                      }, null, 40, Ag)), [
                        [ce, y.value.label]
                      ]) : (s(), n("button", {
                        key: 1,
                        type: "button",
                        class: "rg-linkish",
                        title: "Rename",
                        onClick: (pe) => ae(S)
                      }, _(S.label ?? S.as), 9, Og)),
                      e("small", Rg, [
                        S.formula ? (s(), n(q, { key: 0 }, [
                          O(P, {
                            name: "fx",
                            small: ""
                          }),
                          F(" " + _(S.formula), 1)
                        ], 64)) : (s(), n(q, { key: 1 }, [
                          F(_(w(S)), 1)
                        ], 64))
                      ])
                    ]),
                    S.formula ? (s(), n("button", {
                      key: 0,
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Edit ${S.label}`,
                      onClick: (pe) => E.value = { uid: S.uid, label: S.label, formula: S.formula }
                    }, [
                      O(P, {
                        name: "fx",
                        small: ""
                      })
                    ], 8, Dg)) : M("", !0),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${S.label ?? S.as} left`,
                      disabled: X === 0,
                      onClick: (pe) => N(a).moveColumn(S.uid, X - 1)
                    }, "‹", 8, Lg),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Remove ${S.label ?? S.as}`,
                      onClick: (pe) => N(a).removeColumn(S.uid)
                    }, [
                      O(P, {
                        name: "x",
                        small: ""
                      })
                    ], 8, Ng)
                  ], 42, Tg);
                }), 128))
              ]),
              _: 1
            }),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm",
              disabled: c.value.fields.length < 2,
              onClick: g[18] || (g[18] = (S) => E.value = { label: "", formula: "" })
            }, [
              O(P, {
                name: "fx",
                small: ""
              }),
              g[46] || (g[46] = F(" Formula ", -1))
            ], 8, Vg)
          ]),
          e("section", Fg, [
            e("div", Pg, [
              N(a).state.running ? (s(), n("span", Ug, [
                O(P, {
                  name: "loader",
                  spin: "",
                  small: ""
                }),
                g[47] || (g[47] = F(" Running the reports…", -1))
              ])) : N(a).state.meta && !N(a).state.error ? (s(), n(q, { key: 1 }, [
                e("span", null, _($.value.size) + " " + _($.value.size === 1 ? "report" : "reports") + " combined", 1),
                e("span", Ig, _(N(a).state.meta.duration_ms) + " ms", 1),
                N(a).state.meta.cached ? (s(), n("span", qg, "from cache")) : M("", !0)
              ], 64)) : N(a).runnable.value ? M("", !0) : (s(), n("span", jg, "Open a report on the left and tick the columns you want."))
            ]),
            e("div", null, [
              N(a).state.error ? (s(), n("div", zg, [
                e("span", Bg, [
                  O(P, {
                    name: "alert",
                    small: ""
                  }),
                  F(_(R[N(a).state.error.code] ?? "This report cannot run yet"), 1)
                ]),
                e("span", null, _(N(a).state.error.message), 1)
              ])) : M("", !0)
            ]),
            O(qt)
          ])
        ])
      ])),
      E.value ? (s(), ne(We, {
        key: 2,
        title: E.value.uid ? "Edit formula" : "New formula",
        "data-rg-theme": t.theme,
        onClose: g[22] || (g[22] = (S) => E.value = null)
      }, {
        footer: ie(() => {
          var S;
          return [
            e("button", {
              type: "button",
              class: "rg-btn",
              onClick: g[21] || (g[21] = (X) => E.value = null)
            }, "Cancel"),
            e("button", {
              type: "submit",
              form: "rg-combined-formula",
              class: "rg-btn rg-btn--primary",
              disabled: !((S = E.value.formula) != null && S.trim())
            }, _(E.value.uid ? "Update" : "Add"), 9, Jg)
          ];
        }),
        default: ie(() => [
          e("form", {
            id: "rg-combined-formula",
            class: "rg-publish",
            onSubmit: ge(te, ["prevent"])
          }, [
            e("label", Kg, [
              g[48] || (g[48] = e("span", null, "Column name", -1)),
              le(e("input", {
                id: "rg-combined-formula-label",
                "onUpdate:modelValue": g[19] || (g[19] = (S) => E.value.label = S),
                class: "rg-input",
                maxlength: "120",
                placeholder: "Sales per visit"
              }, null, 512), [
                [ce, E.value.label]
              ])
            ]),
            e("label", Gg, [
              g[49] || (g[49] = e("span", null, "Formula", -1)),
              le(e("textarea", {
                id: "rg-combined-formula-text",
                "onUpdate:modelValue": g[20] || (g[20] = (S) => E.value.formula = S),
                class: "rg-textarea rg-formula",
                placeholder: "ROUND(sales / visits, 2)",
                required: ""
              }, null, 512), [
                [ce, E.value.formula]
              ])
            ]),
            e("div", Hg, [
              g[50] || (g[50] = e("span", null, "Columns you can use", -1)),
              e("div", Wg, [
                (s(!0), n(q, null, K(L.value.filter((S) => S.uid !== E.value.uid), (S) => (s(), n("button", {
                  key: S.as,
                  type: "button",
                  class: "rg-chip-toggle",
                  title: S.label,
                  onClick: (X) => D(S.as)
                }, _(S.as), 9, Yg))), 128))
              ]),
              g[51] || (g[51] = e("small", { class: "rg-faint" }, "+ − * / %, comparisons, IF, ROUND, ABS, COALESCE, NULLIF, GREATEST, LEAST, SAFE_DIVIDE. Dividing by zero gives an empty cell.", -1))
            ])
          ], 32)
        ]),
        _: 1
      }, 8, ["title", "data-rg-theme"])) : M("", !0),
      d.value && c.value.uuid ? (s(), ne(Kt, {
        key: 3,
        report: c.value.uuid,
        "report-name": c.value.name,
        onClose: g[23] || (g[23] = (S) => d.value = !1),
        onOpenDashboard: g[24] || (g[24] = (S) => {
          d.value = !1, i("open-dashboard", S);
        })
      }, null, 8, ["report", "report-name"])) : M("", !0),
      v.value ? (s(), ne(hl, {
        key: 4,
        copy: v.value.copy,
        onClose: g[25] || (g[25] = (S) => v.value = null),
        onSaved: I
      }, null, 8, ["copy"])) : M("", !0),
      T.value ? (s(), ne(jt, {
        key: 5,
        uuid: c.value.uuid,
        name: c.value.name,
        onClose: g[26] || (g[26] = (S) => T.value = !1),
        onPublished: g[27] || (g[27] = (S) => {
          c.value.published = !0, i("published", S);
        }),
        onUnpublished: g[28] || (g[28] = (S) => {
          c.value.published = !1, i("published", S);
        })
      }, null, 8, ["uuid", "name"])) : M("", !0),
      O(Ct, {
        toasts: N(h),
        "data-rg-theme": t.theme
      }, null, 8, ["toasts", "data-rg-theme"])
    ], 8, zc));
  }
}, Zg = {
  class: "rg-muted",
  style: { margin: "0" }
}, Xg = ["onClick"], em = {
  key: 0,
  class: "rg-badge rg-badge--warning"
}, tm = {
  __name: "PathDialog",
  setup(t) {
    const u = _e(Ae), l = _e("rg-theme", "light");
    return (i, d) => N(u).state.pathChoice ? (s(), ne(We, {
      key: 0,
      title: `How should ${N(u).state.pathChoice.dataset.label} connect to this report?`,
      "data-rg-theme": N(l),
      onClose: d[1] || (d[1] = (m) => N(u).state.pathChoice = null)
    }, {
      footer: ie(() => [
        e("button", {
          type: "button",
          class: "rg-btn",
          onClick: d[0] || (d[0] = (m) => N(u).state.pathChoice = null)
        }, "Cancel")
      ]),
      default: ie(() => [
        e("p", Zg, _(N(u).state.pathChoice.dataset.label) + " can be reached in more than one way, and each gives different numbers. ", 1),
        (s(!0), n(q, null, K(N(u).state.pathChoice.options, (m) => (s(), n("button", {
          key: m.path.join("."),
          type: "button",
          class: "rg-path-option",
          onClick: (h) => N(u).choosePath(m.path)
        }, [
          e("b", null, _(m.description), 1),
          m.multiplies_rows ? (s(), n("span", em, "several per report row")) : M("", !0)
        ], 8, Xg))), 128))
      ]),
      _: 1
    }, 8, ["title", "data-rg-theme"])) : M("", !0);
  }
}, lm = ["data-rg-theme"], sm = {
  key: 0,
  class: "rg-builder__body"
}, nm = { class: "rg-explorer" }, am = { class: "rg-skeleton-list" }, om = {
  key: 1,
  class: "rg-main"
}, rm = {
  key: 2,
  class: "rg-builder__body"
}, im = { class: "rg-builder__main" }, um = { class: "rg-shelves" }, dm = { class: "rg-shelf" }, cm = {
  key: 1,
  class: "rg-shelf__empty"
}, gm = {
  key: 2,
  style: { "margin-top": "6px" }
}, mm = { class: "rg-shelf" }, pm = {
  class: "rg-panel__controls",
  style: { gap: "16px", "padding-top": "4px" }
}, vm = {
  class: "rg-field-inline",
  for: "rg-opt-grouped",
  title: "Show rows as groups you open one level at a time"
}, fm = ["disabled"], bm = {
  class: "rg-field-inline",
  for: "rg-opt-subtotals"
}, hm = ["disabled"], Lv = {
  __name: "ReportBuilder",
  props: {
    /** uuid of a saved report to open; null starts a new one */
    reportId: { type: String, default: null },
    theme: { type: String, default: "light" }
  },
  emits: ["saved", "published", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = B(!1), { api: m } = Fe(), h = xt(), a = gn(m, h);
    Oe(Ae, a), Oe("rg-theme", l.theme);
    const f = B(null), A = B(null), c = B(!1), r = B(null), o = B(null), v = B(!1);
    Oe("rg-start-combined", v), Oe("rg-choose-combined", () => {
      o.value = null, r.value = "combined";
    });
    const T = B([]), E = B(!1);
    async function y(L) {
      var C;
      if (r.value = null, o.value = null, L)
        try {
          const x = await m.reports.get(L);
          if (((C = x.definition) == null ? void 0 : C.type) === "combined") {
            o.value = x, r.value = "combined";
            return;
          }
        } catch {
        }
      r.value = "topic", await a.init(L);
    }
    ye(() => l.reportId, (L) => y(L), { immediate: !1 }), Se(async () => {
      m.combine.reports().then((L) => v.value = L.length > 0).catch(() => {
      }), await y(l.reportId), document.addEventListener("keydown", b), m.reports.list({ scope: "mine" }).then((L) => T.value = L.folders ?? []).catch(() => {
      });
    }), Ve(() => {
      document.removeEventListener("keydown", b), a.cancelRunning();
    });
    function b(L) {
      var w;
      if (!(L.ctrlKey || L.metaKey)) return;
      const x = ["INPUT", "TEXTAREA", "SELECT"].includes((w = document.activeElement) == null ? void 0 : w.tagName);
      L.key === "s" ? (L.preventDefault(), a.runnable.value && (A.value = { copy: !1 })) : L.key === "Enter" ? (L.preventDefault(), a.run()) : L.key.toLowerCase() === "z" && !x && (L.preventDefault(), L.shiftKey ? a.redo() : a.undo());
    }
    function p(L) {
      E.value = !1;
      try {
        const C = JSON.parse(L.dataTransfer.getData("application/x-rg"));
        C.kind === "field" && a.addField(C.dataset, C.field, "filters"), C.kind === "item" && a.filterOnTotal(C.uid);
      } catch {
      }
    }
    function $(L) {
      i("saved", L);
    }
    return (L, C) => {
      var x;
      return r.value === "combined" ? (s(), ne(Qg, {
        key: ((x = o.value) == null ? void 0 : x.uuid) ?? "new",
        report: o.value,
        theme: t.theme,
        onSaved: $,
        onPublished: C[0] || (C[0] = (w) => i("published", w)),
        onOpenDashboard: C[1] || (C[1] = (w) => i("open-dashboard", w)),
        onBack: C[2] || (C[2] = (w) => {
          r.value = "topic", N(a).init(null);
        })
      }, null, 8, ["report", "theme"])) : (s(), n("div", {
        key: 1,
        class: "rg-root rg-builder",
        "data-rg-theme": t.theme
      }, [
        O(Ln, {
          onSave: C[3] || (C[3] = (w) => A.value = { copy: !1 }),
          onSaveCopy: C[4] || (C[4] = (w) => A.value = { copy: !0 }),
          onPublish: C[5] || (C[5] = (w) => c.value = !0),
          onPin: C[6] || (C[6] = (w) => d.value = !0)
        }),
        N(a).state.loading ? (s(), n("div", sm, [
          e("aside", nm, [
            e("div", am, [
              (s(), n(q, null, K(10, (w) => e("div", {
                key: w,
                class: "rg-skeleton"
              })), 64))
            ])
          ]),
          C[21] || (C[21] = e("main", { class: "rg-builder__main" }, null, -1))
        ])) : N(a).state.draft.root ? (s(), n("div", rm, [
          O(ma),
          e("main", im, [
            e("div", um, [
              O(al, {
                shelf: "rows",
                title: "Rows",
                empty: "Drop fields to group by (lines, reps, months…)"
              }),
              O(al, {
                shelf: "values",
                title: "Values",
                empty: "Drop numbers to total (amounts, number of visits…)",
                onEditFormula: C[8] || (C[8] = (w) => f.value = { item: w })
              }, {
                default: ie(() => [
                  e("button", {
                    type: "button",
                    class: "rg-btn rg-btn--sm rg-btn--ghost",
                    onClick: C[7] || (C[7] = (w) => f.value = { item: null })
                  }, [
                    O(P, {
                      name: "fx",
                      small: ""
                    }),
                    C[22] || (C[22] = F(" Formula ", -1))
                  ])
                ]),
                _: 1
              }),
              e("div", dm, [
                C[23] || (C[23] = e("span", { class: "rg-shelf__title" }, "Filters", -1)),
                e("div", {
                  class: oe(["rg-shelf__drop", { "rg-shelf__drop--over": E.value }]),
                  style: { display: "block" },
                  "aria-label": "Filters shelf",
                  onDragover: C[10] || (C[10] = (w) => [...w.dataTransfer.types].includes("application/x-rg") && (w.preventDefault(), E.value = !0)),
                  onDragleave: C[11] || (C[11] = ge((w) => E.value = !1, ["self"])),
                  onDrop: ge(p, ["prevent"])
                }, [
                  N(a).state.draft.filters.items.length ? (s(), ne(io, {
                    key: 0,
                    group: N(a).state.draft.filters
                  }, null, 8, ["group"])) : (s(), n("span", cm, "Drop a field to filter the rows, or a value to filter totals")),
                  N(a).state.draft.filters.items.length ? (s(), n("div", gm, [
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--sm rg-btn--ghost",
                      onClick: C[9] || (C[9] = (w) => N(a).addFilterGroup())
                    }, [
                      O(P, {
                        name: "plus",
                        small: ""
                      }),
                      F(" Add a group (" + _(N(a).state.draft.filters.boolean === "and" ? "any of" : "all of") + ") ", 1)
                    ])
                  ])) : M("", !0)
                ], 34)
              ]),
              e("div", mm, [
                C[26] || (C[26] = e("span", { class: "rg-shelf__title" }, "Options", -1)),
                e("div", pm, [
                  e("label", vm, [
                    le(e("input", {
                      id: "rg-opt-grouped",
                      "onUpdate:modelValue": C[12] || (C[12] = (w) => N(a).state.draft.grouped = w),
                      class: "rg-check",
                      type: "checkbox",
                      disabled: N(a).state.draft.rows.length < 2
                    }, null, 8, fm), [
                      [ct, N(a).state.draft.grouped]
                    ]),
                    C[24] || (C[24] = F(" Group rows (open level by level) ", -1))
                  ]),
                  e("label", bm, [
                    le(e("input", {
                      id: "rg-opt-subtotals",
                      "onUpdate:modelValue": C[13] || (C[13] = (w) => N(a).state.draft.subtotals = w),
                      class: "rg-check",
                      type: "checkbox",
                      disabled: !N(a).state.draft.values.length || N(a).grouped.value
                    }, null, 8, hm), [
                      [ct, N(a).state.draft.subtotals]
                    ]),
                    C[25] || (C[25] = F(" Subtotals ", -1))
                  ])
                ])
              ])
            ]),
            O(pi)
          ])
        ])) : (s(), n("main", om, [
          O(Kn)
        ])),
        f.value ? (s(), ne(Wi, {
          key: 3,
          item: f.value.item,
          onClose: C[14] || (C[14] = (w) => f.value = null)
        }, null, 8, ["item"])) : M("", !0),
        d.value && N(a).state.draft.uuid ? (s(), ne(Kt, {
          key: 4,
          report: N(a).state.draft.uuid,
          "report-name": N(a).state.draft.name,
          onClose: C[15] || (C[15] = (w) => d.value = !1),
          onOpenDashboard: C[16] || (C[16] = (w) => {
            d.value = !1, i("open-dashboard", w);
          })
        }, null, 8, ["report", "report-name"])) : M("", !0),
        c.value ? (s(), ne(jt, {
          key: 5,
          uuid: N(a).state.draft.uuid,
          name: N(a).state.draft.name,
          onClose: C[17] || (C[17] = (w) => c.value = !1),
          onPublished: C[18] || (C[18] = (w) => {
            N(a).state.draft.published = !0, i("published", w);
          }),
          onUnpublished: C[19] || (C[19] = (w) => {
            N(a).state.draft.published = !1, i("published", w);
          })
        }, null, 8, ["uuid", "name"])) : M("", !0),
        A.value ? (s(), ne(hl, {
          key: 6,
          copy: A.value.copy,
          folders: T.value,
          onClose: C[20] || (C[20] = (w) => A.value = null),
          onSaved: $
        }, null, 8, ["copy", "folders"])) : M("", !0),
        O(tm),
        O(Ct, {
          toasts: N(h),
          "data-rg-theme": t.theme
        }, null, 8, ["toasts", "data-rg-theme"])
      ], 8, lm));
    };
  }
}, ym = ["data-rg-theme"], $m = { class: "rg-topbar" }, _m = { class: "rg-topbar__actions" }, km = { class: "rg-library__filters" }, wm = {
  class: "rg-tabs",
  role: "tablist"
}, xm = ["aria-selected", "onClick"], Cm = {
  class: "rg-search",
  style: { width: "260px" }
}, Sm = {
  key: 0,
  class: "rg-tabs",
  "aria-label": "Folders"
}, Mm = ["aria-selected"], Tm = ["aria-selected", "onClick"], Em = { class: "rg-library__list" }, Am = {
  key: 0,
  class: "rg-skeleton-list"
}, Om = {
  key: 1,
  class: "rg-empty"
}, Rm = { class: "rg-empty__icon" }, Dm = { class: "rg-report-row__title" }, Lm = ["onClick"], Nm = { class: "rg-report-row__meta" }, Vm = { style: { display: "flex", gap: "6px", "align-items": "center" } }, Fm = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, Pm = {
  key: 1,
  class: "rg-badge rg-badge--info"
}, Um = { class: "rg-report-row__actions" }, Im = ["aria-label", "onClick"], qm = {
  key: 3,
  class: "rg-empty"
}, jm = { class: "rg-empty__icon" }, zm = { class: "rg-report-row__title" }, Bm = ["onClick"], Km = { class: "rg-report-row__meta" }, Gm = { key: 0 }, Hm = {
  key: 1,
  class: "rg-faint",
  style: { overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap", "max-width": "420px" }
}, Wm = { style: { display: "flex", gap: "6px", "align-items": "center" } }, Ym = {
  key: 0,
  class: "rg-badge rg-badge--info"
}, Jm = {
  key: 1,
  class: "rg-badge rg-badge--info"
}, Qm = {
  key: 2,
  class: "rg-badge"
}, Zm = { class: "rg-report-row__actions" }, Xm = ["onClick"], ep = ["onClick"], tp = ["aria-label", "onClick"], Nv = {
  __name: "ReportLibrary",
  props: { theme: { type: String, default: "light" } },
  emits: ["open", "create", "dashboard", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = u, { api: i } = Fe(), d = xt(), m = B("all"), h = B(""), a = B(null), f = B([]), A = B([]), c = B(!0), r = B(null), o = [["all", "All"], ["mine", "Mine"], ["shared", "Shared with me"], ["dashboards", "Dashboards"]], v = B([]), T = j(() => m.value === "dashboards"), E = j(() => {
      const C = h.value.trim().toLowerCase();
      return v.value.filter((x) => !C || x.name.toLowerCase().includes(C));
    });
    let y = null;
    async function b() {
      if (c.value = !0, m.value === "dashboards") {
        try {
          v.value = await i.dashboards.list();
        } catch (C) {
          d.error(C);
        } finally {
          c.value = !1;
        }
        return;
      }
      try {
        const C = await i.reports.list({ scope: m.value, search: h.value || void 0, folder: a.value || void 0 });
        f.value = C.data, a.value || (A.value = C.folders);
      } catch (C) {
        d.error(C);
      } finally {
        c.value = !1;
      }
    }
    ye([m, a], b), ye(h, () => {
      clearTimeout(y), y = setTimeout(b, 250);
    }), Se(b);
    async function p(C) {
      try {
        const x = await i.reports.duplicate(C.uuid);
        d.success(`Created "${x.name}".`), l("open", x.uuid);
      } catch (x) {
        d.error(x);
      }
    }
    async function $(C) {
      if (r.value = null, C.widgets_count !== void 0) {
        try {
          await i.dashboards.remove(C.uuid), v.value = v.value.filter((x) => x.uuid !== C.uuid), d.success(`Deleted "${C.name}".`);
        } catch (x) {
          d.error(x);
        }
        return;
      }
      try {
        await i.reports.remove(C.uuid), f.value = f.value.filter((x) => x.uuid !== C.uuid), d.success(`Deleted "${C.name}".`);
      } catch (x) {
        d.error(x);
      }
    }
    const L = j(() => !c.value && (T.value ? !E.value.length : !f.value.length));
    return (C, x) => (s(), n("div", {
      class: "rg-root rg-library",
      "data-rg-theme": t.theme
    }, [
      e("header", $m, [
        x[8] || (x[8] = e("div", { class: "rg-topbar__title" }, [
          e("h1", null, "Reports"),
          e("div", { class: "rg-topbar__meta" }, [
            e("span", null, "Build a report from any connected data, save it, and share it.")
          ])
        ], -1)),
        e("div", _m, [
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: x[0] || (x[0] = (w) => l("create"))
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            x[7] || (x[7] = F(" New report", -1))
          ])
        ])
      ]),
      e("div", km, [
        e("div", wm, [
          (s(), n(q, null, K(o, ([w, ae]) => e("button", {
            key: w,
            type: "button",
            role: "tab",
            class: "rg-tab",
            "aria-selected": m.value === w ? "true" : "false",
            onClick: (ue) => m.value = w
          }, _(ae), 9, xm)), 64))
        ]),
        e("label", Cm, [
          x[9] || (x[9] = e("span", { class: "rg-sr-only" }, "Search reports", -1)),
          O(P, { name: "search" }),
          le(e("input", {
            id: "rg-library-search",
            "onUpdate:modelValue": x[1] || (x[1] = (w) => h.value = w),
            class: "rg-input",
            type: "search",
            placeholder: "Search reports",
            autocomplete: "off"
          }, null, 512), [
            [ce, h.value]
          ])
        ]),
        A.value.length && !T.value ? (s(), n("div", Sm, [
          e("button", {
            type: "button",
            class: "rg-tab",
            "aria-selected": a.value ? "false" : "true",
            onClick: x[2] || (x[2] = (w) => a.value = null)
          }, "All folders", 8, Mm),
          (s(!0), n(q, null, K(A.value, (w) => (s(), n("button", {
            key: w,
            type: "button",
            class: "rg-tab",
            "aria-selected": a.value === w ? "true" : "false",
            onClick: (ae) => a.value = w
          }, [
            O(P, {
              name: "folder",
              small: ""
            }),
            F(" " + _(w), 1)
          ], 8, Tm))), 128))
        ])) : M("", !0)
      ]),
      e("div", Em, [
        c.value ? (s(), n("div", Am, [
          (s(), n(q, null, K(5, (w) => e("div", {
            key: w,
            class: "rg-skeleton",
            style: { height: "44px" }
          })), 64))
        ])) : L.value && T.value ? (s(), n("div", Om, [
          e("div", Rm, [
            O(P, { name: "view" })
          ]),
          e("h2", null, _(h.value ? "No dashboard matches" : "No dashboards yet"), 1),
          x[10] || (x[10] = e("p", null, [
            F("Open the Reports tab and press "),
            e("b", null, "Dashboard"),
            F(" on a report: its numbers become headline tiles and charts you can arrange.")
          ], -1))
        ])) : T.value ? (s(!0), n(q, { key: 2 }, K(E.value, (w) => (s(), n("article", {
          key: w.uuid,
          class: "rg-report-row"
        }, [
          e("div", Dm, [
            e("button", {
              type: "button",
              onClick: (ae) => l("open-dashboard", w.uuid)
            }, [
              O(P, {
                name: "view",
                small: ""
              }),
              F(" " + _(w.name), 1)
            ], 8, Lm),
            e("div", Nm, [
              e("span", null, _(w.widgets_count) + " widgets", 1),
              e("span", null, "Updated " + _(N(nl)(w.updated_at)), 1)
            ])
          ]),
          e("div", Vm, [
            w.published ? (s(), n("span", Fm, [
              O(P, {
                name: "globe",
                small: ""
              }),
              x[11] || (x[11] = F(" Published", -1))
            ])) : w.visibility === "public" ? (s(), n("span", Pm, [
              O(P, {
                name: "globe",
                small: ""
              }),
              x[12] || (x[12] = F(" Everyone", -1))
            ])) : M("", !0)
          ]),
          e("div", Um, [
            w.is_owner ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost rg-btn--danger",
              "aria-label": `Delete ${w.name}`,
              onClick: (ae) => r.value = w
            }, [
              O(P, {
                name: "trash",
                small: ""
              })
            ], 8, Im)) : M("", !0)
          ])
        ]))), 128)) : L.value ? (s(), n("div", qm, [
          e("div", jm, [
            O(P, { name: "table" })
          ]),
          e("h2", null, _(h.value || a.value ? "No report matches" : m.value === "shared" ? "Nothing shared with you yet" : "No reports yet"), 1),
          e("p", null, _(h.value || a.value ? "Try another search or folder." : "Start one: pick what it is about, then drag in the fields you need."), 1),
          !h.value && !a.value ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: x[3] || (x[3] = (w) => l("create"))
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            x[13] || (x[13] = F(" New report", -1))
          ])) : M("", !0)
        ])) : (s(!0), n(q, { key: 4 }, K(f.value, (w) => (s(), n("article", {
          key: w.uuid,
          class: "rg-report-row"
        }, [
          e("div", zm, [
            e("button", {
              type: "button",
              onClick: (ae) => l("open", w.uuid)
            }, _(w.name), 9, Bm),
            e("div", Km, [
              w.folder ? (s(), n("span", Gm, [
                O(P, {
                  name: "folder",
                  small: ""
                }),
                F(" " + _(w.folder), 1)
              ])) : M("", !0),
              e("span", null, _(w.fields_count) + " fields", 1),
              e("span", null, "Updated " + _(N(nl)(w.updated_at)), 1),
              w.description ? (s(), n("span", Hm, _(w.description), 1)) : M("", !0)
            ])
          ]),
          e("div", Wm, [
            w.visibility === "public" ? (s(), n("span", Ym, [
              O(P, {
                name: "globe",
                small: ""
              }),
              x[14] || (x[14] = F(" Everyone", -1))
            ])) : w.shared ? (s(), n("span", Jm, [
              O(P, {
                name: "users",
                small: ""
              }),
              x[15] || (x[15] = F(" Shared", -1))
            ])) : M("", !0),
            w.is_owner ? M("", !0) : (s(), n("span", Qm, _(w.can_edit ? "Can edit" : "View only"), 1))
          ]),
          e("div", Zm, [
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              title: "Make a dashboard from this report",
              onClick: (ae) => l("dashboard", w.uuid)
            }, [
              O(P, {
                name: "view",
                small: ""
              }),
              x[16] || (x[16] = F(" Dashboard", -1))
            ], 8, Xm),
            e("button", {
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost",
              onClick: (ae) => p(w)
            }, [
              O(P, {
                name: "copy",
                small: ""
              }),
              x[17] || (x[17] = F(" Duplicate", -1))
            ], 8, ep),
            w.is_owner ? (s(), n("button", {
              key: 0,
              type: "button",
              class: "rg-btn rg-btn--sm rg-btn--ghost rg-btn--danger",
              "aria-label": `Delete ${w.name}`,
              onClick: (ae) => r.value = w
            }, [
              O(P, {
                name: "trash",
                small: ""
              })
            ], 8, tp)) : M("", !0)
          ])
        ]))), 128))
      ]),
      r.value ? (s(), ne(We, {
        key: 0,
        title: `Delete “${r.value.name}”?`,
        "data-rg-theme": t.theme,
        onClose: x[6] || (x[6] = (w) => r.value = null)
      }, {
        footer: ie(() => [
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: x[4] || (x[4] = (w) => r.value = null)
          }, "Keep it"),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--danger",
            onClick: x[5] || (x[5] = (w) => $(r.value))
          }, "Delete")
        ]),
        default: ie(() => [
          x[18] || (x[18] = e("p", { style: { margin: "0" } }, "People it is shared with will lose it too. This cannot be undone from here.", -1))
        ]),
        _: 1
      }, 8, ["title", "data-rg-theme"])) : M("", !0),
      O(Ct, {
        toasts: N(d),
        "data-rg-theme": t.theme
      }, null, 8, ["toasts", "data-rg-theme"])
    ], 8, ym));
  }
}, lp = ["data-rg-theme"], sp = {
  key: 0,
  class: "rg-main"
}, np = { class: "rg-empty" }, ap = { class: "rg-empty__icon" }, op = { class: "rg-topbar" }, rp = { class: "rg-topbar__title" }, ip = { key: 0 }, up = {
  key: 1,
  class: "rg-skeleton",
  style: { width: "220px", height: "18px" }
}, dp = {
  key: 2,
  class: "rg-topbar__meta"
}, cp = { class: "rg-topbar__actions" }, gp = ["disabled"], mp = {
  class: "rg-viewer__filter",
  for: "rg-viewer-period"
}, pp = ["value"], vp = {
  key: 0,
  class: "rg-viewer__range"
}, fp = {
  key: 0,
  class: "rg-viewer__filter"
}, bp = {
  key: 1,
  class: "rg-viewer__filter"
}, hp = {
  key: 2,
  class: "rg-viewer__filter"
}, yp = ["for"], $p = {
  key: 0,
  class: "rg-viewer__required"
}, _p = ["id", "onUpdate:modelValue"], kp = ["value"], wp = ["id", "onUpdate:modelValue", "type"], xp = ["disabled"], Cp = {
  class: "rg-results",
  "aria-label": "Results"
}, Sp = {
  class: "rg-statusbar",
  role: "status",
  "aria-live": "polite"
}, Mp = { key: 0 }, Tp = {
  key: 1,
  class: "rg-num"
}, Ep = {
  key: 0,
  class: "rg-errorbox",
  role: "alert"
}, Ap = { class: "rg-errorbox__title" }, Op = {
  key: "label",
  class: "rg-filterchips__label"
}, Rp = ["aria-label", "onClick"], il = 200, Vv = {
  __name: "ReportViewer",
  props: {
    reportId: { type: String, required: !0 },
    theme: { type: String, default: "light" },
    /** Offer "Dashboard" (for people who can build dashboards). */
    dashboards: { type: Boolean, default: !1 }
  },
  emits: ["edit", "loaded", "dashboard", "open-dashboard"],
  setup(t, { emit: u }) {
    const l = t, i = u, d = B(!1), m = [
      ["this_month", "This month"],
      ["last_month", "Last month"],
      ["this_quarter", "This quarter"],
      ["last_quarter", "Last quarter"],
      ["this_year", "This year"],
      ["last_year", "Last year"],
      ["last_7_days", "Last 7 days"],
      ["last_30_days", "Last 30 days"],
      ["today", "Today"],
      ["yesterday", "Yesterday"]
    ], { api: h } = Fe();
    Oe("rg-theme", l.theme);
    const a = B(null), f = B(null), A = $e({ period: "", from: "", to: "", lines: [], divisions: [], employees: [], parameters: {} }), c = $e({ lines: !1, divisions: !1, employees: !1 }), r = $e({
      draft: { rows: [], values: [], sort: [] },
      /** The viewer's own filters on report columns: [{ field, op, value, label, type }]. */
      filters: [],
      runSeq: 0,
      running: !1,
      error: null,
      meta: null
    }), o = j(() => {
      var te;
      return !!((te = a.value) != null && te.grouped) && r.draft.rows.length >= 2;
    }), v = j(() => !!a.value);
    let T = null;
    function E() {
      return A.period === "custom" ? A.from && A.to ? [A.from, A.to] : null : A.period || null;
    }
    function y() {
      const te = {}, D = E();
      D && (te.period = D);
      for (const J of ["lines", "divisions", "employees"])
        A[J].length && (te[J] = A[J]);
      return Object.keys(te).length ? te : void 0;
    }
    const b = () => ({
      parameters: A.parameters,
      context: y(),
      sort: r.draft.sort,
      ...r.filters.length ? { filters: r.filters.map(({ field: te, op: D, value: J }) => ({ field: te, op: D, value: J })) } : {}
    });
    function p(te) {
      return (D) => h.contextOptions(te, { search: D, lines: te === "lines" ? [] : A.lines, period: E() ?? void 0 });
    }
    async function $({ keys: te = [], offset: D = 0, top: J = !1, size: I = il, fresh: R = !1 } = {}) {
      var S, X;
      const k = o.value ? { columns: r.draft.rows.map((se) => se.as), keys: te } : void 0, g = J && (D === 0 || R);
      g && ((S = T == null ? void 0 : T.abort) == null || S.call(T), T = typeof AbortController < "u" ? new AbortController() : null, r.running = !0, r.error = null);
      try {
        const se = await h.reports.run(l.reportId, {
          ...b(),
          offset: D,
          size: I ?? il,
          groups: k,
          signal: T == null ? void 0 : T.signal
        });
        if (J) {
          g && (r.meta = { ...se.meta, rows: se.rows.length, has_more: !!((X = se.page) != null && X.has_more) });
          const pe = Object.fromEntries((se.columns ?? []).map((Ce) => [Ce.alias, Ce.label]));
          r.draft.rows.forEach((Ce) => {
            Ce.label = pe[Ce.as] ?? Ce.label;
          });
        }
        return se;
      } catch (se) {
        throw J && (r.error = se), se;
      } finally {
        g && (r.running = !1);
      }
    }
    function L() {
      r.runSeq++;
    }
    function C(te) {
      const D = r.draft.sort.find((J) => J.field === te);
      r.draft.sort = D ? D.dir === "asc" ? [{ field: te, dir: "desc" }] : [] : [{ field: te, dir: "asc" }], L();
    }
    function x(te) {
      r.draft.sort = te, L();
    }
    function w(te, D) {
      r.filters = r.filters.filter((J) => J.field !== te.alias), D && r.filters.push({ field: te.alias, label: te.label, type: te.type, kind: te.kind, ...D }), L();
    }
    function ae(te) {
      const D = Array.isArray(te.value) ? te.op === "between" ? te.value.join(" – ") : te.value.join(", ") : te.value;
      return `${Ft[te.op] ?? te.op}${D == null ? "" : ` ${D}`}`;
    }
    Oe(Ae, {
      state: r,
      grouped: o,
      runnable: v,
      fetchRows: $,
      toggleSort: C,
      setSort: x,
      filterColumn: w,
      columnFilter: (te) => r.filters.find((D) => D.field === te) ?? null,
      // Combined reports are filtered by their own reports' filters.
      filterable: j(() => {
        var te;
        return ((te = a.value) == null ? void 0 : te.type) !== "combined";
      }),
      fetchSummary: () => h.reports.summary(l.reportId, b()),
      exportReport: (te) => h.reports.export(l.reportId, te, b()),
      gridKey: j(() => `view:${l.reportId}`)
    });
    async function ue() {
      var te, D, J;
      f.value = null, a.value = null;
      try {
        const I = await h.reports.view(l.reportId), R = Object.fromEntries((I.fields ?? []).map((S) => [S.as, S])), k = I.grouped && ((te = I.rows) != null && te.length) ? I.rows : (I.fields ?? []).filter((S) => S.kind === "dimension").map((S) => S.as);
        r.draft.rows = k.map((S) => {
          var X, se;
          return { as: S, label: ((X = R[S]) == null ? void 0 : X.label) ?? S, kind: "dimension", grain: ((se = R[S]) == null ? void 0 : se.grain) ?? null };
        }), r.draft.values = (I.fields ?? []).filter((S) => !k.includes(S.as)).map((S) => ({ as: S.as, label: S.label ?? S.as, kind: S.kind, grain: S.grain ?? null })), r.draft.sort = I.sort ?? [];
        const g = ((D = I.context) == null ? void 0 : D.period) ?? null;
        Array.isArray(g) ? Object.assign(A, { period: "custom", from: String(g[0]).slice(0, 10), to: String(g[1]).slice(0, 10) }) : A.period = typeof g == "string" && !g.startsWith("{{") ? g : "", A.parameters = Object.fromEntries((I.parameters ?? []).map((S) => [S.key, S.default ?? ""]));
        for (const S of ["lines", "divisions", "employees"])
          A[S] = Array.isArray((J = I.context) == null ? void 0 : J[S]) ? [...I.context[S]] : [];
        a.value = I, i("loaded", I), L();
        for (const S of ["lines", "divisions", "employees"])
          h.contextOptions(S, { lines: [] }).then((X) => c[S] = X.length > 0).catch(() => c[S] = !1);
      } catch (I) {
        f.value = I;
      }
    }
    ye(() => l.reportId, ue), Se(ue), Ve(() => {
      var te;
      return (te = T == null ? void 0 : T.abort) == null ? void 0 : te.call(T);
    });
    const xe = {
      MISSING_PARAMETER: "Choose a value to run this report",
      DATASET_FORBIDDEN: "No access",
      TIMEOUT: "The report took too long",
      TOO_HEAVY: "The report would read too much data",
      TOO_MANY_QUERIES: "Too many reports running",
      SERVER_BUSY: "The report server is busy"
    };
    return (te, D) => {
      var J, I;
      return s(), n("div", {
        class: "rg-root rg-viewer",
        "data-rg-theme": t.theme
      }, [
        f.value ? (s(), n("div", sp, [
          e("div", np, [
            e("div", ap, [
              O(P, {
                name: f.value.status === 403 ? "lock" : "alert"
              }, null, 8, ["name"])
            ]),
            e("h2", null, _(f.value.status === 403 ? "You cannot open this report" : f.value.status === 404 ? "This report no longer exists" : "The report could not be opened"), 1),
            e("p", null, _(f.value.message), 1),
            e("button", {
              type: "button",
              class: "rg-btn",
              onClick: ue
            }, "Try again")
          ])
        ])) : (s(), n(q, { key: 1 }, [
          e("header", op, [
            e("div", rp, [
              a.value ? (s(), n("h1", ip, _(a.value.name), 1)) : (s(), n("div", up)),
              (J = a.value) != null && J.description ? (s(), n("div", dp, [
                e("span", null, _(a.value.description), 1)
              ])) : M("", !0)
            ]),
            e("div", cp, [
              (I = a.value) != null && I.can_edit ? (s(), n("button", {
                key: 0,
                type: "button",
                class: "rg-btn",
                onClick: D[0] || (D[0] = (R) => i("edit", a.value.uuid))
              }, [
                O(P, {
                  name: "fx",
                  small: ""
                }),
                D[13] || (D[13] = F(" Edit", -1))
              ])) : M("", !0),
              a.value && t.dashboards ? (s(), n("button", {
                key: 1,
                type: "button",
                class: "rg-btn",
                title: "Add a chart or number from this report to a dashboard",
                onClick: D[1] || (D[1] = (R) => d.value = !0)
              }, [
                O(P, {
                  name: "plus",
                  small: ""
                }),
                D[14] || (D[14] = F(" Pin to dashboard", -1))
              ])) : M("", !0),
              a.value && t.dashboards ? (s(), n("button", {
                key: 2,
                type: "button",
                class: "rg-btn",
                title: "Make a dashboard from this report",
                onClick: D[2] || (D[2] = (R) => i("dashboard", a.value.uuid))
              }, [
                O(P, {
                  name: "view",
                  small: ""
                }),
                D[15] || (D[15] = F(" Dashboard", -1))
              ])) : M("", !0),
              O(It, {
                run: (R) => N(h).reports.export(l.reportId, R, b()),
                disabled: !a.value
              }, null, 8, ["run", "disabled"]),
              e("button", {
                type: "button",
                class: "rg-btn rg-btn--primary",
                disabled: !a.value || r.running,
                onClick: L
              }, [
                O(P, {
                  name: "play",
                  small: ""
                }),
                D[16] || (D[16] = F(" Refresh", -1))
              ], 8, gp)
            ])
          ]),
          a.value ? (s(), n("form", {
            key: 0,
            class: "rg-viewer__filters",
            onSubmit: ge(L, ["prevent"])
          }, [
            e("label", mp, [
              e("span", null, [
                O(P, {
                  name: "calendar",
                  small: ""
                }),
                D[17] || (D[17] = F(" Period", -1))
              ]),
              le(e("select", {
                id: "rg-viewer-period",
                "onUpdate:modelValue": D[3] || (D[3] = (R) => A.period = R),
                class: "rg-input",
                onChange: D[4] || (D[4] = (R) => A.period !== "custom" && L())
              }, [
                D[18] || (D[18] = e("option", { value: "" }, "All dates", -1)),
                (s(), n(q, null, K(m, ([R, k]) => e("option", {
                  key: R,
                  value: R
                }, _(k), 9, pp)), 64)),
                D[19] || (D[19] = e("option", { value: "custom" }, "Custom range…", -1))
              ], 544), [
                [Ee, A.period]
              ])
            ]),
            O(tt, { name: "rg-swap" }, {
              default: ie(() => [
                A.period === "custom" ? (s(), n("div", vp, [
                  le(e("input", {
                    "onUpdate:modelValue": D[5] || (D[5] = (R) => A.from = R),
                    class: "rg-input",
                    type: "date",
                    "aria-label": "From",
                    required: ""
                  }, null, 512), [
                    [ce, A.from]
                  ]),
                  D[20] || (D[20] = e("span", { class: "rg-faint" }, "to", -1)),
                  le(e("input", {
                    "onUpdate:modelValue": D[6] || (D[6] = (R) => A.to = R),
                    class: "rg-input",
                    type: "date",
                    "aria-label": "To",
                    required: ""
                  }, null, 512), [
                    [ce, A.to]
                  ])
                ])) : M("", !0)
              ]),
              _: 1
            }),
            c.lines ? (s(), n("div", fp, [
              e("span", null, [
                O(P, {
                  name: "folder",
                  small: ""
                }),
                D[21] || (D[21] = F(" Lines", -1))
              ]),
              O(et, {
                modelValue: A.lines,
                "onUpdate:modelValue": D[7] || (D[7] = (R) => A.lines = R),
                label: "Lines",
                "all-label": "All my lines",
                load: p("lines"),
                onChange: L
              }, null, 8, ["modelValue", "load"])
            ])) : M("", !0),
            c.divisions ? (s(), n("div", bp, [
              e("span", null, [
                O(P, {
                  name: "users",
                  small: ""
                }),
                D[22] || (D[22] = F(" Divisions", -1))
              ]),
              O(et, {
                modelValue: A.divisions,
                "onUpdate:modelValue": D[8] || (D[8] = (R) => A.divisions = R),
                label: "Divisions",
                "all-label": "All my divisions",
                load: p("divisions"),
                "depends-on": A.lines,
                onChange: L
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : M("", !0),
            c.employees ? (s(), n("div", hp, [
              e("span", null, [
                O(P, {
                  name: "users",
                  small: ""
                }),
                D[23] || (D[23] = F(" Employees", -1))
              ]),
              O(et, {
                modelValue: A.employees,
                "onUpdate:modelValue": D[9] || (D[9] = (R) => A.employees = R),
                label: "Employees",
                "all-label": "All my employees",
                load: p("employees"),
                "depends-on": A.lines,
                onChange: L
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : M("", !0),
            (s(!0), n(q, null, K(a.value.parameters, (R) => (s(), n("label", {
              key: R.key,
              class: "rg-viewer__filter",
              for: `rg-viewer-p-${R.key}`
            }, [
              e("span", null, [
                F(_(R.label ?? R.key), 1),
                R.required ? (s(), n("b", $p, "*")) : M("", !0)
              ]),
              R.type === "date_range" ? le((s(), n("select", {
                key: 0,
                id: `rg-viewer-p-${R.key}`,
                "onUpdate:modelValue": (k) => A.parameters[R.key] = k,
                class: "rg-input"
              }, [
                (s(), n(q, null, K(m, ([k, g]) => e("option", {
                  key: k,
                  value: k
                }, _(g), 9, kp)), 64))
              ], 8, _p)), [
                [Ee, A.parameters[R.key]]
              ]) : le((s(), n("input", {
                key: 1,
                id: `rg-viewer-p-${R.key}`,
                "onUpdate:modelValue": (k) => A.parameters[R.key] = k,
                class: "rg-input",
                type: R.type === "number" ? "number" : "text"
              }, null, 8, wp)), [
                [_t, A.parameters[R.key]]
              ])
            ], 8, yp))), 128)),
            e("button", {
              type: "submit",
              class: "rg-btn",
              disabled: r.running
            }, "Apply", 8, xp)
          ], 32)) : M("", !0),
          e("section", Cp, [
            e("div", Sp, [
              r.running ? (s(), n("span", Mp, [
                O(P, {
                  name: "loader",
                  spin: "",
                  small: ""
                }),
                D[24] || (D[24] = F(" Running…", -1))
              ])) : r.meta ? (s(), n("span", Tp, [
                F(_(r.meta.has_more ? `${N(He)(r.meta.rows ?? 0)}+ rows` : `${N(He)(r.meta.rows ?? 0)} rows`) + " ", 1),
                r.meta.duration_ms != null ? (s(), n(q, { key: 0 }, [
                  F(" · " + _(r.meta.duration_ms) + " ms", 1)
                ], 64)) : M("", !0)
              ])) : M("", !0)
            ]),
            r.error ? (s(), n("div", Ep, [
              e("span", Ap, [
                O(P, {
                  name: "alert",
                  small: ""
                }),
                F(_(xe[r.error.code] ?? "The report could not run"), 1)
              ]),
              e("span", null, _(r.error.message), 1)
            ])) : M("", !0),
            r.filters.length ? (s(), ne(qe, {
              key: 1,
              tag: "div",
              name: "rg-list-fade",
              class: "rg-filterchips",
              "aria-label": "Column filters"
            }, {
              default: ie(() => [
                e("span", Op, [
                  O(P, {
                    name: "filter",
                    small: ""
                  }),
                  D[25] || (D[25] = F(" Filtered", -1))
                ]),
                (s(!0), n(q, null, K(r.filters, (R) => (s(), n("span", {
                  key: R.field,
                  class: "rg-filterchip"
                }, [
                  e("b", null, _(R.label), 1),
                  F(" " + _(ae(R)) + " ", 1),
                  e("button", {
                    type: "button",
                    "aria-label": `Remove the filter on ${R.label}`,
                    onClick: (k) => w({ alias: R.field }, null)
                  }, [
                    O(P, {
                      name: "x",
                      small: ""
                    })
                  ], 8, Rp)
                ]))), 128)),
                e("button", {
                  key: "clear",
                  type: "button",
                  class: "rg-linkish",
                  onClick: D[10] || (D[10] = (R) => {
                    r.filters = [], L();
                  })
                }, "Clear all")
              ]),
              _: 1
            })) : M("", !0),
            a.value ? (s(), ne(qt, { key: 2 })) : M("", !0)
          ])
        ], 64)),
        d.value && a.value ? (s(), ne(Kt, {
          key: 2,
          report: a.value.uuid,
          "report-name": a.value.name,
          onClose: D[11] || (D[11] = (R) => d.value = !1),
          onOpenDashboard: D[12] || (D[12] = (R) => {
            d.value = !1, i("open-dashboard", R);
          })
        }, null, 8, ["report", "report-name"])) : M("", !0)
      ], 8, lp);
    };
  }
}, Ml = [
  ["this_month", "This month"],
  ["last_month", "Last month"],
  ["this_quarter", "This quarter"],
  ["last_quarter", "Last quarter"],
  ["this_year", "This year"],
  ["last_year", "Last year"],
  ["last_30_days", "Last 30 days"]
];
function Tl(t = 3) {
  let u = 0;
  const l = [];
  function i() {
    if (u >= t || l.length === 0) return;
    const { task: d, resolve: m, reject: h } = l.shift();
    u++, Promise.resolve().then(d).then(m, h).finally(() => {
      u--, i();
    });
  }
  return function(m) {
    return new Promise((h, a) => {
      l.push({ task: m, resolve: h, reject: a }), i();
    });
  };
}
const Dp = ["data-rg-theme"], Lp = {
  key: 0,
  class: "rg-main"
}, Np = { class: "rg-empty" }, Vp = { class: "rg-empty__icon" }, Fp = { class: "rg-topbar" }, Pp = { class: "rg-topbar__title" }, Up = { key: 0 }, Ip = {
  key: 1,
  class: "rg-skeleton",
  style: { width: "220px", height: "18px" }
}, qp = {
  key: 2,
  class: "rg-topbar__meta"
}, jp = { class: "rg-topbar__actions" }, zp = ["disabled"], Bp = {
  class: "rg-viewer__filter",
  for: "rg-dash-period"
}, Kp = ["value"], Gp = {
  key: 0,
  class: "rg-viewer__range"
}, Hp = {
  key: 1,
  class: "rg-viewer__filter"
}, Wp = {
  key: 2,
  class: "rg-viewer__filter"
}, Yp = {
  key: 3,
  class: "rg-viewer__filter"
}, Jp = { class: "rg-dashboard__body" }, Qp = {
  key: 0,
  class: "rg-dashboard__grid"
}, Zp = { class: "rg-widget__skeleton" }, Xp = {
  key: 1,
  class: "rg-dashboard__grid"
}, ev = {
  key: 0,
  class: "rg-faint"
}, Fv = {
  __name: "DashboardView",
  props: {
    dashboardId: { type: String, required: !0 },
    theme: { type: String, default: "light" }
  },
  emits: ["edit", "loaded"],
  setup(t, { emit: u }) {
    const l = t, i = u, { api: d } = Fe();
    Oe("rg-theme", l.theme), Oe("rg-widget-queue", Tl(3));
    const m = B(null), h = B(null), a = B(0), f = $e({ period: "", from: "", to: "", lines: [], divisions: [], employees: [] }), A = $e({ lines: !1, divisions: !1, employees: !1 });
    function c() {
      const E = {}, y = f.period === "custom" ? f.from && f.to ? [f.from, f.to] : null : f.period || null;
      y && (E.period = y);
      for (const b of ["lines", "divisions", "employees"]) f[b].length && (E[b] = f[b]);
      return E;
    }
    function r(E) {
      return () => d.dashboards.widget(l.dashboardId, E.id, { context: c() });
    }
    function o() {
      a.value++;
    }
    function v(E) {
      return (y) => d.contextOptions(E, { search: y, lines: E === "lines" ? [] : f.lines });
    }
    async function T() {
      var E;
      h.value = null;
      try {
        const y = await d.dashboards.get(l.dashboardId), b = ((E = y.layout) == null ? void 0 : E.context) ?? {}, p = b.period ?? "";
        Object.assign(f, Array.isArray(p) ? { period: "custom", from: String(p[0]).slice(0, 10), to: String(p[1]).slice(0, 10) } : { period: typeof p == "string" ? p : "", from: "", to: "" });
        for (const $ of ["lines", "divisions", "employees"]) f[$] = Array.isArray(b[$]) ? [...b[$]] : [];
        m.value = y, i("loaded", y);
        for (const $ of ["lines", "divisions", "employees"])
          d.contextOptions($, { lines: [] }).then((L) => A[$] = L.length > 0).catch(() => A[$] = !1);
      } catch (y) {
        h.value = y;
      }
    }
    return ye(() => l.dashboardId, T), Se(T), (E, y) => {
      var b, p;
      return s(), n("div", {
        class: "rg-root rg-dashboard",
        "data-rg-theme": t.theme
      }, [
        h.value ? (s(), n("div", Lp, [
          e("div", Np, [
            e("div", Vp, [
              O(P, {
                name: h.value.status === 403 ? "lock" : "alert"
              }, null, 8, ["name"])
            ]),
            e("h2", null, _(h.value.status === 403 ? "You cannot open this dashboard" : "The dashboard could not be opened"), 1),
            e("p", null, _(h.value.message), 1),
            e("button", {
              type: "button",
              class: "rg-btn",
              onClick: T
            }, "Try again")
          ])
        ])) : (s(), n(q, { key: 1 }, [
          e("header", Fp, [
            e("div", Pp, [
              m.value ? (s(), n("h1", Up, _(m.value.name), 1)) : (s(), n("div", Ip)),
              (b = m.value) != null && b.description ? (s(), n("div", qp, [
                e("span", null, _(m.value.description), 1)
              ])) : M("", !0)
            ]),
            e("div", jp, [
              (p = m.value) != null && p.can_edit ? (s(), n("button", {
                key: 0,
                type: "button",
                class: "rg-btn",
                onClick: y[0] || (y[0] = ($) => i("edit", m.value.uuid))
              }, [
                O(P, {
                  name: "fx",
                  small: ""
                }),
                y[8] || (y[8] = F(" Edit", -1))
              ])) : M("", !0),
              e("button", {
                type: "button",
                class: "rg-btn rg-btn--primary",
                disabled: !m.value,
                onClick: o
              }, [
                O(P, {
                  name: "play",
                  small: ""
                }),
                y[9] || (y[9] = F(" Refresh", -1))
              ], 8, zp)
            ])
          ]),
          m.value ? (s(), n("form", {
            key: 0,
            class: "rg-viewer__filters",
            onSubmit: ge(o, ["prevent"])
          }, [
            e("label", Bp, [
              e("span", null, [
                O(P, {
                  name: "calendar",
                  small: ""
                }),
                y[10] || (y[10] = F(" Period", -1))
              ]),
              le(e("select", {
                id: "rg-dash-period",
                "onUpdate:modelValue": y[1] || (y[1] = ($) => f.period = $),
                class: "rg-input",
                onChange: y[2] || (y[2] = ($) => f.period !== "custom" && o())
              }, [
                y[11] || (y[11] = e("option", { value: "" }, "As saved in each report", -1)),
                (s(!0), n(q, null, K(N(Ml), ([$, L]) => (s(), n("option", {
                  key: $,
                  value: $
                }, _(L), 9, Kp))), 128)),
                y[12] || (y[12] = e("option", { value: "custom" }, "Custom range…", -1))
              ], 544), [
                [Ee, f.period]
              ])
            ]),
            f.period === "custom" ? (s(), n("div", Gp, [
              le(e("input", {
                "onUpdate:modelValue": y[3] || (y[3] = ($) => f.from = $),
                class: "rg-input",
                type: "date",
                "aria-label": "From",
                required: ""
              }, null, 512), [
                [ce, f.from]
              ]),
              y[13] || (y[13] = e("span", { class: "rg-faint" }, "to", -1)),
              le(e("input", {
                "onUpdate:modelValue": y[4] || (y[4] = ($) => f.to = $),
                class: "rg-input",
                type: "date",
                "aria-label": "To",
                required: ""
              }, null, 512), [
                [ce, f.to]
              ])
            ])) : M("", !0),
            A.lines ? (s(), n("div", Hp, [
              e("span", null, [
                O(P, {
                  name: "folder",
                  small: ""
                }),
                y[14] || (y[14] = F(" Lines", -1))
              ]),
              O(et, {
                modelValue: f.lines,
                "onUpdate:modelValue": y[5] || (y[5] = ($) => f.lines = $),
                label: "Lines",
                "all-label": "All my lines",
                load: v("lines"),
                onChange: o
              }, null, 8, ["modelValue", "load"])
            ])) : M("", !0),
            A.divisions ? (s(), n("div", Wp, [
              e("span", null, [
                O(P, {
                  name: "users",
                  small: ""
                }),
                y[15] || (y[15] = F(" Divisions", -1))
              ]),
              O(et, {
                modelValue: f.divisions,
                "onUpdate:modelValue": y[6] || (y[6] = ($) => f.divisions = $),
                label: "Divisions",
                "all-label": "All my divisions",
                load: v("divisions"),
                "depends-on": f.lines,
                onChange: o
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : M("", !0),
            A.employees ? (s(), n("div", Yp, [
              e("span", null, [
                O(P, {
                  name: "users",
                  small: ""
                }),
                y[16] || (y[16] = F(" Employees", -1))
              ]),
              O(et, {
                modelValue: f.employees,
                "onUpdate:modelValue": y[7] || (y[7] = ($) => f.employees = $),
                label: "Employees",
                "all-label": "All my employees",
                load: v("employees"),
                "depends-on": f.lines,
                onChange: o
              }, null, 8, ["modelValue", "load", "depends-on"])
            ])) : M("", !0),
            y[17] || (y[17] = e("button", {
              type: "submit",
              class: "rg-btn"
            }, "Apply", -1))
          ], 32)) : M("", !0),
          e("main", Jp, [
            m.value ? (s(), n("div", Xp, [
              (s(!0), n(q, null, K(m.value.layout.widgets, ($, L) => (s(), ne(wt, {
                key: $.id,
                widget: $,
                load: r($),
                version: a.value,
                style: Te({ "--rg-delay": `${L * 50}ms` })
              }, null, 8, ["widget", "load", "version", "style"]))), 128)),
              m.value.layout.widgets.length ? M("", !0) : (s(), n("p", ev, "This dashboard has no widgets yet."))
            ])) : (s(), n("div", Qp, [
              (s(), n(q, null, K(4, ($) => e("div", {
                key: $,
                class: "rg-widget rg-widget--md"
              }, [
                e("div", Zp, [
                  (s(), n(q, null, K(4, (L) => e("span", {
                    key: L,
                    class: "rg-skeleton"
                  })), 64))
                ])
              ])), 64))
            ]))
          ])
        ], 64))
      ], 8, Dp);
    };
  }
}, tv = ["data-rg-theme"], lv = { class: "rg-topbar" }, sv = { class: "rg-topbar__title" }, nv = { class: "rg-topbar__meta" }, av = {
  key: 0,
  class: "rg-badge rg-badge--success"
}, ov = { class: "rg-topbar__actions" }, rv = {
  class: "rg-segmented",
  role: "group",
  "aria-label": "Who can open it"
}, iv = ["aria-pressed"], uv = ["aria-pressed"], dv = ["disabled"], cv = { class: "rg-viewer__filters" }, gv = {
  class: "rg-viewer__filter",
  for: "rg-dash-edit-period"
}, mv = ["value"], pv = { class: "rg-dashboard__body" }, vv = {
  key: 0,
  class: "rg-dashboard__grid"
}, fv = { class: "rg-widget__skeleton" }, bv = {
  key: 1,
  class: "rg-empty"
}, hv = { class: "rg-empty__icon" }, yv = { class: "rg-widget__tools" }, $v = ["for"], _v = ["id", "value", "onChange"], kv = ["value", "disabled"], wv = ["aria-label", "onClick"], xv = ["aria-label", "title", "onClick"], Cv = ["aria-label", "disabled", "onClick"], Sv = ["aria-label", "disabled", "onClick"], Mv = ["aria-label", "onClick"], Tv = {
  key: 0,
  class: "rg-widget-dialog__preview"
}, Ev = {
  key: 0,
  class: "rg-faint rg-dialog__why"
}, Av = ["disabled"], Pv = {
  __name: "DashboardEditor",
  props: {
    /** Saved dashboard to edit, or null for a new one. */
    dashboardId: { type: String, default: null },
    /** Report uuid to start a new dashboard from. */
    fromReport: { type: String, default: null },
    theme: { type: String, default: "light" }
  },
  emits: ["saved", "published", "view"],
  setup(t, { emit: u }) {
    const l = t, i = u, { api: d } = Fe(), m = xt();
    Oe("rg-theme", l.theme), Oe("rg-widget-queue", Tl(3));
    const h = [["sm", "Small"], ["md", "Half"], ["lg", "Two thirds"], ["full", "Full width"]], a = $e({ loading: !0, saving: !1, uuid: null, name: "Untitled dashboard", visibility: "private", canPublish: !1, published: !1, period: "", widgets: [] }), f = B(0), A = B(null), c = B([]), r = $e({}), o = B(null), v = B(!1);
    let T = 0;
    const E = () => `w${Date.now().toString(36)}${(++T).toString(36)}`, y = () => a.period ? { period: a.period } : {}, b = (I) => () => d.dashboards.preview(I, { context: y() });
    async function p(I) {
      var R;
      if (!I) return { dims: [], nums: [] };
      if (!r[I]) {
        r[I] = { dims: [], nums: [], loading: !0 };
        try {
          const k = await d.reports.view(I);
          r[I] = wl(k.fields ?? []);
        } catch {
          r[I] = { dims: [], nums: [], failed: !0 };
        }
      }
      return ((R = A.value) == null ? void 0 : R.report) === I && zt(A.value, r[I]), r[I];
    }
    Se(async () => {
      var I, R, k;
      try {
        if (d.reports.list().then((g) => {
          c.value = g.data ?? [], A.value && !A.value.report && c.value[0] && (A.value.report = c.value[0].uuid, p(c.value[0].uuid));
        }).catch(() => {
        }), l.dashboardId) {
          const g = await d.dashboards.get(l.dashboardId);
          Object.assign(a, {
            uuid: g.uuid,
            name: g.name,
            visibility: g.visibility,
            canPublish: g.can_publish,
            published: g.published,
            period: typeof ((R = (I = g.layout) == null ? void 0 : I.context) == null ? void 0 : R.period) == "string" ? g.layout.context.period : "",
            widgets: g.layout.widgets ?? []
          });
        } else if (l.fromReport) {
          const g = await d.dashboards.generate(l.fromReport);
          Object.assign(a, { name: g.name, period: typeof ((k = g.context) == null ? void 0 : k.period) == "string" ? g.context.period : "", widgets: g.widgets });
        }
      } catch (g) {
        m.error(g);
      } finally {
        a.loading = !1;
      }
    });
    function $(I = null) {
      var k, g;
      const R = (I == null ? void 0 : I.report) ?? ((k = a.widgets[0]) == null ? void 0 : k.report) ?? l.fromReport ?? ((g = c.value[0]) == null ? void 0 : g.uuid) ?? "";
      A.value = I ? { ...I, values: [...I.values ?? []] } : { id: null, type: "kpi", title: "", report: R, category: null, values: [], top: 10, size: "sm" }, p(A.value.report);
    }
    const L = j(() => {
      var I, R;
      return r[(I = A.value) == null ? void 0 : I.report] ?? { dims: [], nums: [], loading: !!((R = A.value) != null && R.report) };
    }), C = j(() => qu(A.value)), x = j(() => !C.value);
    function w(I, R) {
      a.widgets = a.widgets.map((k) => k.id === I.id ? kl(k, R) : k);
    }
    function ae() {
      var k, g, S;
      const I = { ...A.value };
      if (!((k = I.title) == null ? void 0 : k.trim())) {
        const X = L.value.nums;
        I.title = I.values.map((se) => {
          var pe;
          return ((pe = X.find((Ce) => Ce.as === se)) == null ? void 0 : pe.label) ?? se;
        }).join(", ") || ((g = c.value.find((se) => se.uuid === I.report)) == null ? void 0 : g.name) || "Widget";
      }
      I.report_name = ((S = c.value.find((X) => X.uuid === I.report)) == null ? void 0 : S.name) ?? I.report_name, I.id ? a.widgets = a.widgets.map((X) => X.id === I.id ? I : X) : a.widgets = [...a.widgets, { ...I, id: E() }], A.value = null;
    }
    function ue(I) {
      a.widgets = a.widgets.filter((R) => R.id !== I);
    }
    function xe(I, R) {
      const k = [...a.widgets], g = k.findIndex((X) => X.id === I), S = g + R;
      g === -1 || S < 0 || S >= k.length || (k.splice(S, 0, k.splice(g, 1)[0]), a.widgets = k);
    }
    function te(I) {
      const R = h.map(([g]) => g), k = R[(R.indexOf(I.size ?? "md") + 1) % R.length];
      a.widgets = a.widgets.map((g) => g.id === I.id ? { ...g, size: k } : g);
    }
    function D(I) {
      if (!o.value || o.value === I) return;
      const R = [...a.widgets], k = R.findIndex((S) => S.id === o.value), g = R.findIndex((S) => S.id === I);
      R.splice(g, 0, R.splice(k, 1)[0]), a.widgets = R, o.value = null;
    }
    async function J() {
      a.saving = !0;
      const I = {
        name: a.name.trim() || "Untitled dashboard",
        visibility: a.visibility,
        layout: { context: y(), widgets: a.widgets.map(({ report_name: R, ...k }) => k) }
      };
      try {
        const R = a.uuid ? await d.dashboards.update(a.uuid, I) : await d.dashboards.create(I);
        Object.assign(a, { uuid: R.uuid, canPublish: R.can_publish, published: R.published }), m.success(`Saved "${R.name}".`), i("saved", R);
      } catch (R) {
        m.error(R);
      } finally {
        a.saving = !1;
      }
    }
    return (I, R) => (s(), n("div", {
      class: "rg-root rg-dashboard rg-dashboard--editing",
      "data-rg-theme": t.theme
    }, [
      e("header", lv, [
        e("div", sv, [
          R[18] || (R[18] = e("label", {
            class: "rg-sr-only",
            for: "rg-dash-name"
          }, "Dashboard name", -1)),
          le(e("input", {
            id: "rg-dash-name",
            "onUpdate:modelValue": R[0] || (R[0] = (k) => a.name = k),
            class: "rg-input rg-input--bare rg-name-input",
            maxlength: "255"
          }, null, 512), [
            [ce, a.name]
          ]),
          e("div", nv, [
            e("span", null, _(a.widgets.length) + " " + _(a.widgets.length === 1 ? "widget" : "widgets"), 1),
            a.published ? (s(), n("span", av, [
              O(P, {
                name: "globe",
                small: ""
              }),
              R[17] || (R[17] = F(" Published", -1))
            ])) : M("", !0)
          ])
        ]),
        e("div", ov, [
          e("div", rv, [
            e("button", {
              type: "button",
              "aria-pressed": a.visibility === "private",
              onClick: R[1] || (R[1] = (k) => a.visibility = "private")
            }, "Only me", 8, iv),
            e("button", {
              type: "button",
              "aria-pressed": a.visibility === "public",
              onClick: R[2] || (R[2] = (k) => a.visibility = "public")
            }, "Everyone", 8, uv)
          ]),
          a.uuid && a.canPublish ? (s(), n("button", {
            key: 0,
            type: "button",
            class: "rg-btn",
            onClick: R[3] || (R[3] = (k) => v.value = !0)
          }, [
            O(P, {
              name: "globe",
              small: ""
            }),
            F(" " + _(a.published ? "Publishing" : "Publish"), 1)
          ])) : M("", !0),
          a.uuid ? (s(), n("button", {
            key: 1,
            type: "button",
            class: "rg-btn",
            onClick: R[4] || (R[4] = (k) => i("view", a.uuid))
          }, [
            O(P, {
              name: "eye",
              small: ""
            }),
            R[19] || (R[19] = F(" View", -1))
          ])) : M("", !0),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            disabled: a.saving || !a.widgets.length,
            onClick: J
          }, [
            O(P, {
              name: "save",
              small: ""
            }),
            F(" " + _(a.saving ? "Saving…" : "Save"), 1)
          ], 8, dv)
        ])
      ]),
      e("div", cv, [
        e("label", gv, [
          e("span", null, [
            O(P, {
              name: "calendar",
              small: ""
            }),
            R[20] || (R[20] = F(" Default period", -1))
          ]),
          le(e("select", {
            id: "rg-dash-edit-period",
            "onUpdate:modelValue": R[5] || (R[5] = (k) => a.period = k),
            class: "rg-input",
            onChange: R[6] || (R[6] = (k) => f.value++)
          }, [
            R[21] || (R[21] = e("option", { value: "" }, "As saved in each report", -1)),
            (s(!0), n(q, null, K(N(Ml), ([k, g]) => (s(), n("option", {
              key: k,
              value: k
            }, _(g), 9, mv))), 128))
          ], 544), [
            [Ee, a.period]
          ])
        ]),
        e("button", {
          type: "button",
          class: "rg-btn rg-btn--primary",
          onClick: R[7] || (R[7] = (k) => $())
        }, [
          O(P, {
            name: "plus",
            small: ""
          }),
          R[22] || (R[22] = F(" Add widget", -1))
        ])
      ]),
      e("main", pv, [
        a.loading ? (s(), n("div", vv, [
          (s(), n(q, null, K(4, (k) => e("div", {
            key: k,
            class: "rg-widget rg-widget--md"
          }, [
            e("div", fv, [
              (s(), n(q, null, K(4, (g) => e("span", {
                key: g,
                class: "rg-skeleton"
              })), 64))
            ])
          ])), 64))
        ])) : a.widgets.length ? (s(), ne(qe, {
          key: 2,
          tag: "div",
          name: "rg-list-move",
          class: "rg-dashboard__grid"
        }, {
          default: ie(() => [
            (s(!0), n(q, null, K(a.widgets, (k, g) => (s(), ne(wt, {
              key: k.id,
              widget: k,
              load: b(k),
              version: f.value,
              class: oe({ "is-dragging": o.value === k.id }),
              draggable: "true",
              onDragstart: (S) => o.value = k.id,
              onDragend: R[9] || (R[9] = (S) => o.value = null),
              onDragover: R[10] || (R[10] = ge(() => {
              }, ["prevent"])),
              onDrop: ge((S) => D(k.id), ["prevent"])
            }, {
              actions: ie(() => {
                var S;
                return [
                  e("div", yv, [
                    e("label", {
                      class: "rg-sr-only",
                      for: `rg-type-${k.id}`
                    }, "Show " + _(k.title) + " as", 9, $v),
                    e("select", {
                      id: `rg-type-${k.id}`,
                      class: "rg-input rg-widget__type",
                      value: k.type,
                      title: "Show as",
                      onChange: (X) => w(k, X.target.value)
                    }, [
                      (s(!0), n(q, null, K(N($l), (X) => (s(), n("option", {
                        key: X.value,
                        value: X.value,
                        disabled: !X.fits(k)
                      }, _(X.label), 9, kv))), 128))
                    ], 40, _v),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Edit ${k.title}`,
                      onClick: (X) => $(k)
                    }, [
                      O(P, {
                        name: "fx",
                        small: ""
                      })
                    ], 8, wv),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Resize ${k.title}`,
                      title: `Size: ${(S = h.find(([X]) => X === (k.size ?? "md"))) == null ? void 0 : S[1]}`,
                      onClick: (X) => te(k)
                    }, _({ sm: "S", md: "M", lg: "L", full: "Full" }[k.size ?? "md"]), 9, xv),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${k.title} earlier`,
                      disabled: g === 0,
                      onClick: (X) => xe(k.id, -1)
                    }, "‹", 8, Cv),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Move ${k.title} later`,
                      disabled: g === a.widgets.length - 1,
                      onClick: (X) => xe(k.id, 1)
                    }, "›", 8, Sv),
                    e("button", {
                      type: "button",
                      class: "rg-btn rg-btn--icon rg-btn--ghost rg-btn--sm",
                      "aria-label": `Remove ${k.title}`,
                      onClick: (X) => ue(k.id)
                    }, [
                      O(P, {
                        name: "trash",
                        small: ""
                      })
                    ], 8, Mv)
                  ])
                ];
              }),
              _: 2
            }, 1032, ["widget", "load", "version", "class", "onDragstart", "onDrop"]))), 128))
          ]),
          _: 1
        })) : (s(), n("div", bv, [
          e("div", hv, [
            O(P, { name: "view" })
          ]),
          R[24] || (R[24] = e("h2", null, "Add your first widget", -1)),
          R[25] || (R[25] = e("p", null, "Show a report's totals as headline numbers, its top items as bars, how it changes over time, or its first rows.", -1)),
          e("button", {
            type: "button",
            class: "rg-btn rg-btn--primary",
            onClick: R[8] || (R[8] = (k) => $())
          }, [
            O(P, {
              name: "plus",
              small: ""
            }),
            R[23] || (R[23] = F(" Add widget", -1))
          ])
        ]))
      ]),
      A.value ? (s(), ne(We, {
        key: 0,
        title: A.value.id ? "Edit widget" : "Add widget",
        class: "rg-widget-dialog",
        "data-rg-theme": t.theme,
        onClose: R[13] || (R[13] = (k) => A.value = null)
      }, {
        footer: ie(() => [
          C.value ? (s(), n("span", Ev, _(C.value), 1)) : M("", !0),
          e("button", {
            type: "button",
            class: "rg-btn",
            onClick: R[12] || (R[12] = (k) => A.value = null)
          }, "Cancel"),
          e("button", {
            type: "submit",
            form: "rg-widget-form",
            class: "rg-btn rg-btn--primary",
            disabled: !x.value
          }, _(A.value.id ? "Update" : "Add"), 9, Av)
        ]),
        default: ie(() => [
          e("form", {
            id: "rg-widget-form",
            class: "rg-publish",
            onSubmit: R[11] || (R[11] = ge((k) => x.value && ae(), ["prevent"]))
          }, [
            O(Sl, {
              widget: A.value,
              reports: c.value,
              columns: L.value,
              onReport: p
            }, null, 8, ["widget", "reports", "columns"]),
            x.value ? (s(), n("div", Tv, [
              R[26] || (R[26] = e("span", { class: "rg-faint" }, "Preview", -1)),
              O(wt, {
                widget: { ...A.value, size: "full" },
                load: b(A.value),
                version: f.value
              }, null, 8, ["widget", "load", "version"])
            ])) : M("", !0)
          ], 32)
        ]),
        _: 1
      }, 8, ["title", "data-rg-theme"])) : M("", !0),
      v.value ? (s(), ne(jt, {
        key: 1,
        kind: "dashboard",
        uuid: a.uuid,
        name: a.name,
        onClose: R[14] || (R[14] = (k) => v.value = !1),
        onPublished: R[15] || (R[15] = (k) => {
          a.published = !0, i("published", k);
        }),
        onUnpublished: R[16] || (R[16] = (k) => {
          a.published = !1, i("published", k);
        })
      }, null, 8, ["uuid", "name"])) : M("", !0),
      O(Ct, {
        toasts: N(m),
        "data-rg-theme": t.theme
      }, null, 8, ["toasts", "data-rg-theme"])
    ], 8, tv));
  }
};
export {
  Qg as CombinedBuilder,
  Pv as DashboardEditor,
  Fv as DashboardView,
  Kt as PinToDashboard,
  jt as PublishDialog,
  cl as REPORT_GENERATOR_KEY,
  Lv as ReportBuilder,
  el as ReportGeneratorApiError,
  Nv as ReportLibrary,
  Vv as ReportViewer,
  Dv as TopicsBrowser,
  Dl as createApiClient,
  Rv as createReportGenerator,
  Fe as useReportGenerator
};
//# sourceMappingURL=report-generator.js.map
